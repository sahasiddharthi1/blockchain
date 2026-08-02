// Package api wires HTTP routes to handlers using chi — chosen over the
// stdlib mux for middleware chaining and URL-param parsing with a larger
// middleware ecosystem (request ID, structured logging, panic recovery).
package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/sid/ledgerforge/internal/api/handlers"
	"github.com/sid/ledgerforge/internal/auth"
	"github.com/sid/ledgerforge/internal/websocket"
)

// Handlers bundles every handler the router needs. Passed as a single
// struct (rather than N separate constructor args) so adding a tenth
// handler later doesn't mean touching NewRouter's signature.
type Handlers struct {
	Auth       *handlers.AuthHandler
	Blockchain *handlers.BlockchainHandler
	Wallet     *handlers.WalletHandler
	Transaction *handlers.TransactionHandler
	Mining     *handlers.MiningHandler
	Analytics  *handlers.AnalyticsHandler
	Hub        *websocket.Hub
}

// NewRouter builds the full route table. Route groups mirror the
// project's layered access model: public reads (explorer, health),
// public writes with no auth needed yet (submitting a signed transaction
// is self-authenticating via its signature — no session required), and an
// authenticated group for actions tied to a logged-in operator account
// (starting/stopping mining, in this pass).
func NewRouter(h Handlers, jwtSecret, corsOrigin string) chi.Router {
	r := chi.NewRouter()

	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(corsMiddleware(corsOrigin))

	r.Get("/healthz", handlers.Health)

	r.Route("/api/v1", func(r chi.Router) {
		r.Post("/auth/register", h.Auth.Register)
		r.Post("/auth/login", h.Auth.Login)
		r.Post("/auth/forgot-password", h.Auth.ForgotPassword)
		r.Post("/auth/reset-password", h.Auth.ResetPassword)

		// Explorer: public reads, no auth — a blockchain explorer is
		// meant to be publicly browsable, same as any real chain
		// explorer (Etherscan et al. don't gate reads behind login).
		r.Get("/blocks", h.Blockchain.ListBlocks)
		r.Get("/blocks/{index}", h.Blockchain.GetBlock)
		r.Get("/chain/validate", h.Blockchain.ValidateChain)
		r.Get("/analytics/summary", h.Analytics.Summary)

		// Wallets and transactions: self-authenticating via signatures,
		// not session auth. Creating a wallet needs no identity (it's
		// how you'd get one in the first place); submitting a
		// transaction is only accepted if it's validly signed by the
		// claimed sender, which is a stronger guarantee than a login
		// session for this specific action.
		r.Post("/wallets", h.Wallet.CreateWallet)
		r.Get("/wallets/{address}/balance", h.Wallet.GetBalance)
		r.Post("/transactions", h.Transaction.SubmitTransaction)

		// Mining: gated behind operator auth — triggering mining
		// consumes real CPU, so it shouldn't be anonymous/public.
		r.Group(func(r chi.Router) {
			r.Use(auth.Middleware(jwtSecret))
			r.Post("/mining/mine", h.Mining.MineNow)
		})

		r.Get("/ws", h.Hub.HandleUpgrade)
	})

	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		writeNotFound(w)
	})

	return r
}

func writeNotFound(w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNotFound)
	w.Write([]byte(`{"error":"not found"}`))
}
