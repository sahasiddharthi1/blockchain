package handlers

import (
	"net/http"

	"github.com/sid/ledgerforge/internal/blockchain"
	"github.com/sid/ledgerforge/internal/mempool"
)

type AnalyticsHandler struct {
	chain   *blockchain.Blockchain
	pending *mempool.Mempool
}

func NewAnalyticsHandler(chain *blockchain.Blockchain, pending *mempool.Mempool) *AnalyticsHandler {
	return &AnalyticsHandler{chain: chain, pending: pending}
}

// Summary handles GET /api/v1/analytics/summary — the single call the
// dashboard's overview page needs for its top-line numbers, rather than
// making it stitch together three separate requests.
func (h *AnalyticsHandler) Summary(w http.ResponseWriter, r *http.Request) {
	validErr := h.chain.IsValid()

	writeJSON(w, http.StatusOK, map[string]any{
		"chain_height":     h.chain.Height(),
		"difficulty":       h.chain.Difficulty(),
		"mempool_size":     h.pending.Size(),
		"chain_valid":      validErr == nil,
	})
}
