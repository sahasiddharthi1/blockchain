// response.go centralizes how handlers write JSON responses and map
// errors to status codes, so every handler in this package produces a
// consistent response shape instead of each one hand-rolling
// w.WriteHeader/json.NewEncoder calls slightly differently.
package handlers

import (
	"encoding/json"
	"errors"
	"net/http"

	apperrors "github.com/sid/ledgerforge/pkg/errors"
)

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(body)
}

// writeError maps a *pkg/errors.AppError's Kind to an HTTP status; a
// plain (non-typed) error falls back to 500 rather than leaking internal
// error text, since an un-typed error usually means a bug, not something
// safe to describe to a client.
func writeError(w http.ResponseWriter, err error) {
	var appErr *apperrors.AppError
	if errors.As(err, &appErr) {
		status := http.StatusInternalServerError
		switch appErr.Kind {
		case apperrors.KindNotFound:
			status = http.StatusNotFound
		case apperrors.KindInvalidInput:
			status = http.StatusBadRequest
		case apperrors.KindUnauthorized:
			status = http.StatusUnauthorized
		case apperrors.KindConflict:
			status = http.StatusConflict
		}
		writeJSON(w, status, map[string]string{"error": appErr.Message})
		return
	}

	writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal server error"})
}
