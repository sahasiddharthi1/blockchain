// jwt.go issues and validates JWT access/refresh token pairs.
//
// Why two tokens instead of one long-lived token: a short-lived access
// token (15 min) limits the damage window if it leaks (e.g. logged
// accidentally, cached by a proxy) — an attacker gets at most 15 minutes
// of access. The longer-lived refresh token (7 days) is only ever sent to
// the token-refresh endpoint, never attached to ordinary API requests,
// which keeps it out of most request logs entirely.
package auth

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const (
	accessTokenTTL  = 15 * time.Minute
	refreshTokenTTL = 7 * 24 * time.Hour
	issuer          = "ledgerforge"
)

// Claims embeds jwt.RegisteredClaims (exp, iat, iss — all validated
// automatically by jwt.ParseWithClaims) alongside the app-specific fields
// a request handler actually needs.
type Claims struct {
	UserID string `json:"user_id"`
	Role   string `json:"role"` // "operator" | "admin"
	jwt.RegisteredClaims
}

var ErrInvalidToken = errors.New("auth: invalid or expired token")

// IssueTokenPair signs a fresh access + refresh token for the given user.
// Both are HS256-signed with the same secret here; a larger deployment
// would sign with RS256 and an asymmetric key so services that only
// verify tokens (and never issue them) don't need the signing secret at
// all — noted as the natural next hardening step, not implemented here to
// keep key management out of scope for this pass.
func IssueTokenPair(secret, userID, role string) (access, refresh string, err error) {
	now := time.Now()

	access, err = signClaims(secret, Claims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    issuer,
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(accessTokenTTL)),
		},
	})
	if err != nil {
		return "", "", err
	}

	refresh, err = signClaims(secret, Claims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    issuer,
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(refreshTokenTTL)),
		},
	})
	return access, refresh, err
}

func signClaims(secret string, claims Claims) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		return "", fmt.Errorf("auth: sign token: %w", err)
	}
	return signed, nil
}

// ParseAndValidate verifies signature, expiry, and issuer, returning the
// decoded claims on success. Any failure collapses to ErrInvalidToken —
// callers (the middleware) shouldn't distinguish "expired" from
// "tampered" from "wrong issuer" in the response they send back; that
// distinction is only useful in a log line, not to the caller of the API.
func ParseAndValidate(secret, tokenStr string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return []byte(secret), nil
	}, jwt.WithIssuer(issuer))

	if err != nil || !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}
