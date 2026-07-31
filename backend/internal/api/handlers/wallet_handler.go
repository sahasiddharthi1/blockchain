// wallet_handler.go exposes wallet creation and balance lookup.
//
// Non-custodial design: CreateWallet generates a key pair and returns the
// private key in the response body exactly once. The server keeps no
// copy — there is no wallet table, no private-key storage anywhere in
// this codebase. If the client loses it, the funds are unrecoverable,
// same as any real wallet. This is a deliberate product decision, not an
// oversight: storing user private keys server-side would turn this into
// a custodial service with an entirely different (much larger) security
// obligation.
package handlers

import (
	"encoding/hex"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/sid/ledgerforge/internal/blockchain"
	"github.com/sid/ledgerforge/internal/transaction"
	"github.com/sid/ledgerforge/internal/wallet"
)

type WalletHandler struct {
	chain *blockchain.Blockchain
}

func NewWalletHandler(chain *blockchain.Blockchain) *WalletHandler {
	return &WalletHandler{chain: chain}
}

type createWalletResponse struct {
	Address    string `json:"address"`
	PublicKey  string `json:"public_key"`  // hex
	PrivateKey string `json:"private_key"` // hex — shown ONCE, save it now
	Warning    string `json:"warning"`
}

// CreateWallet handles POST /api/v1/wallets
func (h *WalletHandler) CreateWallet(w http.ResponseWriter, r *http.Request) {
	wlt, err := wallet.New()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to generate wallet"})
		return
	}

	writeJSON(w, http.StatusCreated, createWalletResponse{
		Address:    wlt.Address,
		PublicKey:  hex.EncodeToString(wlt.PublicKeyBytes()),
		PrivateKey: wlt.PrivateKeyHex(),
		Warning:    "This private key is shown once and is not stored server-side. Save it now — it cannot be recovered.",
	})
}

// GetBalance handles GET /api/v1/wallets/{address}/balance
//
// Balance is derived, never stored: it's the sum of every mined
// transaction crediting or debiting this address, recomputed by walking
// the chain on every request. That's the correct model for a ledger (a
// cached/stored balance could drift from the chain and would need its
// own invalidation logic) — the cost is an O(blocks × tx) scan per
// request, which is the natural next thing to optimize (e.g. with a
// Mongo aggregation over internal/repository/mongo, or a maintained
// running balance index) once chain length makes it matter.
func (h *WalletHandler) GetBalance(w http.ResponseWriter, r *http.Request) {
	address := chi.URLParam(r, "address")

	var balance float64
	for _, block := range h.chain.Blocks() {
		for _, raw := range block.Transactions {
			tx, err := transaction.Deserialize(raw)
			if err != nil {
				continue // genesis payload isn't a real transaction; skip non-tx entries
			}
			if tx.To == address {
				balance += tx.Amount
			}
			if tx.From == address {
				balance -= tx.Amount + tx.Fee
			}
		}
	}

	writeJSON(w, http.StatusOK, map[string]any{"address": address, "balance": balance})
}
