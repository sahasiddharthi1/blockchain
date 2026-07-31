package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/sid/ledgerforge/internal/mining"
)

type MiningHandler struct {
	svc *mining.Service
}

func NewMiningHandler(svc *mining.Service) *MiningHandler {
	return &MiningHandler{svc: svc}
}

// mineTimeout bounds how long a single "mine now" HTTP request will wait.
// At low difficulty (dev default is 4) this comfortably finishes in
// milliseconds to low seconds; a higher production difficulty should
// pair with the auto-mining background loop instead of a synchronous
// request, since the client shouldn't hold a connection open for minutes.
const mineTimeout = 30 * time.Second

// MineNow handles POST /api/v1/mining/mine — mines a single block
// immediately from whatever's currently in the mempool (including an
// empty block if the mempool is empty; an empty block is still valid,
// same as a real chain producing empty blocks when no one's transacting).
func (h *MiningHandler) MineNow(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), mineTimeout)
	defer cancel()

	block, err := h.svc.MineNext(ctx)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, block)
}
