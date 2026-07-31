// blockchain_handler.go exposes read access to the chain — the Blockchain
// Explorer's entire backend surface.
package handlers

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"github.com/sid/ledgerforge/internal/blockchain"
)

type BlockchainHandler struct {
	chain *blockchain.Blockchain
}

func NewBlockchainHandler(chain *blockchain.Blockchain) *BlockchainHandler {
	return &BlockchainHandler{chain: chain}
}

// ListBlocks handles GET /api/v1/blocks?offset=0&limit=50
func (h *BlockchainHandler) ListBlocks(w http.ResponseWriter, r *http.Request) {
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit <= 0 || limit > 200 {
		limit = 50
	}

	all := h.chain.Blocks()

	// In-memory pagination: fine at this scale (the chain lives fully in
	// memory anyway per blockchain.Blockchain's design). Once
	// internal/repository/mongo is wired as the primary read path for
	// the explorer, this becomes a direct ListBlocks(ctx, offset, limit)
	// call instead of a slice operation.
	start := offset
	if start > len(all) {
		start = len(all)
	}
	end := start + limit
	if end > len(all) {
		end = len(all)
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"height": h.chain.Height(),
		"total":  len(all),
		"blocks": all[start:end],
	})
}

// GetBlock handles GET /api/v1/blocks/{index}
func (h *BlockchainHandler) GetBlock(w http.ResponseWriter, r *http.Request) {
	index, err := strconv.ParseUint(chi.URLParam(r, "index"), 10, 64)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "index must be a non-negative integer"})
		return
	}

	block, err := h.chain.BlockByIndex(index)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "block not found"})
		return
	}

	writeJSON(w, http.StatusOK, block)
}

// ValidateChain handles GET /api/v1/chain/validate — powers the "network
// health" indicator on the dashboard.
func (h *BlockchainHandler) ValidateChain(w http.ResponseWriter, r *http.Request) {
	if err := h.chain.IsValid(); err != nil {
		writeJSON(w, http.StatusConflict, map[string]any{"valid": false, "error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"valid": true})
}
