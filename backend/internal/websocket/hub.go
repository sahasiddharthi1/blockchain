// Package websocket implements the real-time fan-out hub that pushes
// server-initiated events (new block, mining progress, wallet balance
// changes, network health) to every connected dashboard client without a
// page refresh.
//
// Design: a single Hub goroutine owns the client registry and the
// broadcast channel. This is the standard gorilla/websocket hub pattern,
// chosen specifically because it avoids sharing a map of connections
// across goroutines without synchronization — a common source of data
// races in naive from-scratch WebSocket servers. All registration,
// unregistration, and broadcast fan-out happens on Hub.Run's single
// goroutine; nothing else ever touches the clients map directly.
package websocket

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"go.uber.org/zap"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	sendBufferSize = 32 // per-client outbound queue depth
)

// Event is the envelope every broadcast message is wrapped in, so a
// client can dispatch on Topic without inspecting Payload's shape first.
type Event struct {
	Topic   string `json:"topic"`
	Payload any    `json:"payload"`
}

// Client wraps a single WebSocket connection. `send` is a buffered
// channel rather than writing to the connection directly from Hub.Run:
// a slow/stalled client (bad network, backgrounded tab) must never be
// allowed to block the broadcast loop for every other connected client.
// If a client's buffer fills up, Hub.broadcast drops that client instead
// of blocking — see the select/default in run().
type Client struct {
	hub  *Hub
	conn *websocket.Conn
	send chan []byte
}

// Hub owns client registration and message fan-out.
type Hub struct {
	log        *zap.SugaredLogger
	clients    map[*Client]bool
	register   chan *Client
	unregister chan *Client
	broadcast  chan Event
}

func NewHub(log *zap.SugaredLogger) *Hub {
	return &Hub{
		log:        log,
		clients:    make(map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan Event, 64),
	}
}

// Run is the hub's single-goroutine event loop. Call it once, in its own
// goroutine, from main.go — e.g. `go hub.Run()`.
func (h *Hub) Run() {
	for {
		select {
		case c := <-h.register:
			h.clients[c] = true
			h.log.Infow("websocket client connected", "total_clients", len(h.clients))

		case c := <-h.unregister:
			if _, ok := h.clients[c]; ok {
				delete(h.clients, c)
				close(c.send)
				h.log.Infow("websocket client disconnected", "total_clients", len(h.clients))
			}

		case event := <-h.broadcast:
			data, err := json.Marshal(event)
			if err != nil {
				h.log.Errorw("failed to marshal websocket event", "topic", event.Topic, "error", err)
				continue
			}
			for c := range h.clients {
				select {
				case c.send <- data:
				default:
					// Client's outbound buffer is full — it's not
					// keeping up. Drop it rather than block every other
					// client on one slow reader.
					close(c.send)
					delete(h.clients, c)
				}
			}
		}
	}
}

// Publish sends an event to every connected client. Safe to call from any
// goroutine (mining, transaction submission, chain-health checks) — it
// just hands the event to the hub's channel.
func (h *Hub) Publish(topic string, payload any) {
	h.broadcast <- Event{Topic: topic, Payload: payload}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// TODO(production hardening): restrict to the dashboard's real
	// origin(s) via config before deploying — CheckOrigin: true accepts
	// connections from any origin, which is fine for local dev but not
	// for a public deployment.
	CheckOrigin: func(r *http.Request) bool { return true },
}

// HandleUpgrade upgrades an HTTP request to a WebSocket connection and
// starts the client's read/write pumps. Wire this at GET /api/v1/ws.
func (h *Hub) HandleUpgrade(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		h.log.Errorw("websocket upgrade failed", "error", err)
		return
	}

	client := &Client{hub: h, conn: conn, send: make(chan []byte, sendBufferSize)}
	h.register <- client

	go client.writePump()
	go client.readPump()
}

// readPump's only real job is detecting disconnects (a client never sends
// anything meaningful to us in this design — it's a push-only feed) and
// keeping the pong deadline alive. Every WebSocket connection needs a
// reader goroutine regardless, or the connection's read buffer never
// drains and control frames (pings/closes) never get processed.
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		if _, _, err := c.conn.ReadMessage(); err != nil {
			break
		}
	}
}

// writePump owns all writes to the connection. gorilla/websocket
// connections are not safe for concurrent writes from multiple
// goroutines, so every write (broadcast messages AND pings) must funnel
// through this single goroutine per client.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case msg, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
