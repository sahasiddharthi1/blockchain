// transaction_handler.go accepts client-signed transactions into the
// mempool. The handler never signs anything — signing happens client-side
// (see internal/wallet.Sign) using a private key the server has never
// seen. This handler's only job is verification and admission.
package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/sid/ledgerforge/internal/mempool"
	"github.com/sid/ledgerforge/internal/transaction"
)

type TransactionHandler struct {
	pending *mempool.Mempool
}

func NewTransactionHandler(pending *mempool.Mempool) *TransactionHandler {
	return &TransactionHandler{pending: pending}
}

// SubmitTransaction handles POST /api/v1/transactions. The request body
// is a fully-formed, already-signed transaction.Transaction (the client
// built it with transaction.New + Sign locally). This handler's contract
// is: verify the signature, verify the public key actually derives to the
// claimed sender, then admit to the mempool — reject everything else with
// no partial acceptance.
func (h *TransactionHandler) SubmitTransaction(w http.ResponseWriter, r *http.Request) {
	var tx transaction.Transaction
	if err := json.NewDecoder(r.Body).Decode(&tx); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid transaction body"})
		return
	}

	if err := tx.Verify(); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	serialized, err := tx.Serialize()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to serialize transaction"})
		return
	}

	if err := h.pending.Add(tx.ID, serialized, tx.Fee); err != nil {
		writeJSON(w, http.StatusConflict, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusAccepted, map[string]string{"id": tx.ID, "status": "pending"})
}
