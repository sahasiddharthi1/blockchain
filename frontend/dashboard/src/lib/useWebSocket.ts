import { useEffect, useRef, useState, useCallback } from "react";

export interface WsEvent<T = unknown> {
  topic: string;
  payload: T;
}

const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:8080/api/v1/ws";

export function useWebSocket() {
  const [lastEvent, setLastEvent] = useState<WsEvent | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<string, Set<(data: unknown) => void>>>(new Map());

  const subscribe = useCallback((topic: string, handler: (data: unknown) => void) => {
    if (!listenersRef.current.has(topic)) {
      listenersRef.current.set(topic, new Set());
    }
    listenersRef.current.get(topic)!.add(handler);
    return () => { listenersRef.current.get(topic)?.delete(handler); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let retryDelay = 1000;

    function connect() {
      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        if (cancelled) return;
        setConnected(true);
        retryDelay = 1000;
      };

      socket.onmessage = (msg) => {
        if (cancelled) return;
        try {
          const event: WsEvent = JSON.parse(msg.data);
          setLastEvent(event);
          const handlers = listenersRef.current.get(event.topic);
          if (handlers) {
            handlers.forEach((h) => h(event.payload));
          }
        } catch {
          // ignore malformed frames
        }
      };

      socket.onclose = () => {
        if (cancelled) return;
        setConnected(false);
        setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 15000);
      };

      socket.onerror = () => socket.close();
    }

    connect();
    return () => {
      cancelled = true;
      socketRef.current?.close();
    };
  }, []);

  return { lastEvent, connected, subscribe };
}
