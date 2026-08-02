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
	"time"
)

// resetMailer is the minimal mail capability AuthService needs. It's an
// interface (rather than a concrete *Mailer) so tests can inject a fake
// and record what link would have been emailed.
type resetMailer interface {
	SendPasswordResetLink(to, link string) error
}

// Service is the service-layer entry point handlers call into:
// Register, Login, and the password-reset flow. Keeping this logic out of
// the HTTP handler (see handlers/auth_handler.go) means it's testable
// without spinning up an HTTP server, and reusable if a second transport
// (e.g. a CLI admin tool) ever needs to create users.
type Service struct {
	users        UserRepository
	secret       string
	resetStore   *resetTokenStore
	mailer       resetMailer
	resetBaseURL string
}

// resetLinkTTL bounds how long a password-reset link stays valid. Short
// enough to limit the blast radius of a leaked link, long enough for a
// user to actually notice the email and click through.
const resetLinkTTL = 30 * time.Minute

func NewService(users UserRepository, jwtSecret string, mailer resetMailer, resetBaseURL string) *Service {
	return &Service{
		users:        users,
		secret:       jwtSecret,
		resetStore:   newResetTokenStore(resetLinkTTL),
		mailer:       mailer,
		resetBaseURL: resetBaseURL,
	}
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

// RequestPasswordReset looks up the account, issues a single-use reset
// token, and dispatches a reset link to the account's email. The returned
// error is deliberately nil whether or not the email exists: all callers
// (and the HTTP handler) must return the same success response to avoid
// enabling email enumeration.
func (s *Service) RequestPasswordReset(email string) error {
	user, err := s.users.FindByEmail(email)
	if err != nil {
		// Unknown address: no email sent, but report success so we don't
		// leak which addresses are registered.
		return nil
	}

	token, err := s.resetStore.issue(user.ID)
	if err != nil {
		return err
	}

	link := fmt.Sprintf("%s/reset-password?token=%s", s.resetBaseURL, token)
	return s.mailer.SendPasswordResetLink(user.Email, link)
}

// ResetPassword applies a new password guarded by a reset token. The token
// is consumed (invalidated) on first use, success or failure, so a
// resurfaced link can't be replayed. Returns an error for an unknown or
// expired token, or a weak new password.
func (s *Service) ResetPassword(token, newPassword string) error {
	if len(newPassword) < 8 {
		return fmt.Errorf("auth: password must be at least 8 characters")
	}

	userID, ok := s.resetStore.consume(token)
	if !ok {
		return fmt.Errorf("auth: invalid or expired reset link")
	}
	if _, err := s.users.FindByID(userID); err != nil {
		return fmt.Errorf("auth: invalid or expired reset link")
	}

	hash, err := HashPassword(newPassword)
	if err != nil {
		return err
	}
	return s.users.UpdatePassword(userID, hash)
}

func randomID() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("auth: generate user id: %w", err)
	}
	return hex.EncodeToString(b), nil
}
