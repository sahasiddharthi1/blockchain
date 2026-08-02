// reset_token.go is a single-use, expiring store for password-reset
// tokens. Tokens are randomly generated, so possession of a token is all
// that's needed to prove the reset request (the link is delivered to the
// account's verified email). A store entry is consumed atomically on the
// first successful use — this prevents replay of a stolen/resurfaced link.
package auth

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"sync"
	"time"
)

// resetToken carries which user a token belongs to and when it expires.
type resetToken struct {
	userID    string
	expiresAt time.Time
}

// resetTokenStore is a mutex-guarded, in-memory map of reset token -> entry.
// Like InMemoryUserStore, it's the dev/demo stand-in for a real
// (e.g. Redis-backed) store and is deliberately behind a zero-surface API
// so a persistent implementation can replace it later.
type resetTokenStore struct {
	mu     sync.RWMutex
	tokens map[string]resetToken
	ttl    time.Duration
}

func newResetTokenStore(ttl time.Duration) *resetTokenStore {
	return &resetTokenStore{
		tokens: make(map[string]resetToken),
		ttl:    ttl,
	}
}

// issue creates a fresh random token for the given user. The caller is
// responsible for delivering it via the mailer.
func (s *resetTokenStore) issue(userID string) (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("auth: generate reset token: %w", err)
	}
	token := hex.EncodeToString(b)

	s.mu.Lock()
	defer s.mu.Unlock()
	s.tokens[token] = resetToken{
		userID:    userID,
		expiresAt: time.Now().Add(s.ttl),
	}
	return token, nil
}

// consume atomically validates and removes a token. It returns the owning
// user id only when the token is present and unexpired; the token is
// deleted in both cases so it can never be replayed.
func (s *resetTokenStore) consume(token string) (string, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	entry, ok := s.tokens[token]
	if !ok {
		return "", false
	}
	delete(s.tokens, token)

	if time.Now().After(entry.expiresAt) {
		return "", false
	}
	return entry.userID, true
}