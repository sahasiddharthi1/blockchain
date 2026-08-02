// user_store.go defines the storage contract for user accounts and an
// in-memory implementation.
//
// Why in-memory rather than Mongo, when internal/repository/mongo already
// exists for blocks: the blockchain itself must survive a restart (it's
// the whole product); a demo/dev user store restarting empty is an
// acceptable, clearly-labeled simplification that keeps this runnable
// with zero external services. The UserRepository interface below is
// exactly the seam a Mongo-backed implementation would slot into later —
// same Repository Pattern as internal/repository/mongo — without
// touching AuthService or any handler.
package auth

import (
	"fmt"
	"sync"
)

// User is a stored account. PasswordHash is the Argon2id-encoded string
// from HashPassword — never a plaintext password, never logged.
type User struct {
	ID           string
	Email        string
	PasswordHash string
	Role         string
}

// UserRepository is the storage-agnostic contract AuthService depends on.
type UserRepository interface {
	Create(u *User) error
	FindByEmail(email string) (*User, error)
	FindByID(id string) (*User, error)
	UpdatePassword(id, passwordHash string) error
}

// InMemoryUserStore is a mutex-guarded map-backed UserRepository.
// Swap for a Mongo-backed implementation (mirroring
// internal/repository/mongo/block_repository.go) when persistence across
// restarts matters — AuthService's constructor takes the interface, so
// that's a one-line change at the composition root (cmd/api/main.go).
type InMemoryUserStore struct {
	mu    sync.RWMutex
	byID  map[string]*User
	email map[string]string // email -> id, for the uniqueness check + lookup
}

func NewInMemoryUserStore() *InMemoryUserStore {
	return &InMemoryUserStore{
		byID:  make(map[string]*User),
		email: make(map[string]string),
	}
}

func (s *InMemoryUserStore) Create(u *User) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.email[u.Email]; exists {
		return fmt.Errorf("auth: email %s already registered", u.Email)
	}
	s.byID[u.ID] = u
	s.email[u.Email] = u.ID
	return nil
}

func (s *InMemoryUserStore) FindByEmail(email string) (*User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	id, ok := s.email[email]
	if !ok {
		return nil, fmt.Errorf("auth: no user with email %s", email)
	}
	return s.byID[id], nil
}

// FindByID returns a user by canonical ID, or an error if absent.
func (s *InMemoryUserStore) FindByID(id string) (*User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	user, ok := s.byID[id]
	if !ok {
		return nil, fmt.Errorf("auth: no user with id %s", id)
	}
	return user, nil
}

// UpdatePassword replaces the stored password hash for an existing user.
// It returns an error if the id is unknown.
func (s *InMemoryUserStore) UpdatePassword(id, passwordHash string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	user, ok := s.byID[id]
	if !ok {
		return fmt.Errorf("auth: no user with id %s", id)
	}
	user.PasswordHash = passwordHash
	return nil
}
