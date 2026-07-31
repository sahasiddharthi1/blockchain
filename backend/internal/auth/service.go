// service.go is the service-layer entry point handlers call into:
// Register and Login. Keeping this logic out of the HTTP handler (see
// handlers/auth_handler.go) means it's testable without spinning up an
// HTTP server, and reusable if a second transport (e.g. a CLI admin tool)
// ever needs to create users.
package auth

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
)

type Service struct {
	users  UserRepository
	secret string
}

func NewService(users UserRepository, jwtSecret string) *Service {
	return &Service{users: users, secret: jwtSecret}
}

// Register creates a new operator account and immediately issues a token
// pair, so a freshly-registered client doesn't need a second round trip
// to log in.
func (s *Service) Register(email, password string) (access, refresh string, err error) {
	if email == "" || password == "" {
		return "", "", fmt.Errorf("auth: email and password are required")
	}
	if len(password) < 8 {
		return "", "", fmt.Errorf("auth: password must be at least 8 characters")
	}

	hash, err := HashPassword(password)
	if err != nil {
		return "", "", err
	}

	id, err := randomID()
	if err != nil {
		return "", "", err
	}

	user := &User{ID: id, Email: email, PasswordHash: hash, Role: "operator"}
	if err := s.users.Create(user); err != nil {
		return "", "", err
	}

	return IssueTokenPair(s.secret, user.ID, user.Role)
}

// Login verifies credentials and issues a fresh token pair. The error
// message is deliberately identical whether the email doesn't exist or
// the password is wrong — distinguishing the two lets an attacker
// enumerate registered emails.
func (s *Service) Login(email, password string) (access, refresh string, err error) {
	const genericErr = "auth: invalid email or password"

	user, err := s.users.FindByEmail(email)
	if err != nil {
		return "", "", fmt.Errorf(genericErr)
	}
	if !VerifyPassword(password, user.PasswordHash) {
		return "", "", fmt.Errorf(genericErr)
	}

	return IssueTokenPair(s.secret, user.ID, user.Role)
}

func randomID() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("auth: generate user id: %w", err)
	}
	return hex.EncodeToString(b), nil
}
