package api

import "net/http"

// corsMiddleware allows the dashboard (a different origin in dev —
// localhost:5173 vs the API's localhost:8080) to call this API from the
// browser. A hand-rolled middleware rather than pulling in go-chi/cors:
// the policy here is deliberately simple (allow the configured origin,
// allow the methods/headers this API actually uses) and a few explicit
// lines are easier to audit than a general-purpose CORS library's full
// configuration surface for a project this size.
func corsMiddleware(allowedOrigin string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
