package handlers

import "net/http"

// Health handles GET /healthz — used by Docker's healthcheck and any
// uptime monitor. Deliberately dependency-free (doesn't check Mongo/chain
// state) so it answers even during startup; readiness (are dependencies
// actually up) is a separate concern this project doesn't need yet at
// this scale.
func Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
