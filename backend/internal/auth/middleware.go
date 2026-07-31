// middleware.go extracts and validates a bearer JWT from the
// Authorization header, then injects the decoded Claims into the request
// context so downstream handlers can read the caller's identity without
// re-parsing the token.
package auth

import (
	"context"
	"net/http"
	"strings"
)

type contextKey string

const claimsContextKey contextKey = "auth_claims"

// Middleware returns a chi-compatible middleware bound to the given
// secret. Returning a closure (rather than a package-level function
// reading a global secret) keeps the secret explicit and testable —
// exactly the "no global mutable state" standard from the project brief.
func Middleware(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")
			if !strings.HasPrefix(header, "Bearer ") {
				http.Error(w, `{"error":"missing or malformed Authorization header"}`, http.StatusUnauthorized)
				return
			}

			tokenStr := strings.TrimPrefix(header, "Bearer ")
			claims, err := ParseAndValidate(secret, tokenStr)
			if err != nil {
				http.Error(w, `{"error":"invalid or expired token"}`, http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), claimsContextKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// ClaimsFromContext retrieves the authenticated caller's claims. Handlers
// behind Middleware can rely on this always returning ok=true — it's only
// false if a handler is mistakenly registered outside the auth-protected
// route group.
func ClaimsFromContext(ctx context.Context) (*Claims, bool) {
	claims, ok := ctx.Value(claimsContextKey).(*Claims)
	return claims, ok
}
