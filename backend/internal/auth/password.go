// password.go hashes and verifies passwords with Argon2id.
//
// Why Argon2id over bcrypt: bcrypt's cost factor only tunes CPU time,
// which makes it comparatively cheap to crack on GPUs/ASICs that have
// abundant parallel compute but limited memory bandwidth. Argon2id adds a
// tunable memory cost, which closes that gap — a project that already
// touches SHA-256/PoW/ECDSA elsewhere is a natural place to use the
// stronger primitive rather than defaulting to the most common one.
package auth

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"fmt"
	"strings"

	"golang.org/x/crypto/argon2"
)

// Tuned for an interactive login path (should complete in well under
// 500ms on typical hardware) while still being meaningfully expensive to
// brute-force at scale. These are exported as consts (not hidden magic
// numbers) so they're visible and adjustable in one place, per the
// project's "no hardcoded configuration buried in logic" standard.
const (
	argonTime    = 1
	argonMemory  = 64 * 1024 // 64 MB
	argonThreads = 4
	argonKeyLen  = 32
	saltLen      = 16
)

// HashPassword returns a self-describing encoded hash: algorithm,
// version, and parameters travel with the hash itself, so VerifyPassword
// never needs a side-channel config lookup and existing hashes keep
// working even if argonTime/argonMemory change for new hashes later.
func HashPassword(plain string) (string, error) {
	salt := make([]byte, saltLen)
	if _, err := rand.Read(salt); err != nil {
		return "", fmt.Errorf("auth: generate salt: %w", err)
	}

	hash := argon2.IDKey([]byte(plain), salt, argonTime, argonMemory, argonThreads, argonKeyLen)

	encoded := fmt.Sprintf(
		"$argon2id$v=%d$m=%d,t=%d,p=%d$%s$%s",
		argon2.Version, argonMemory, argonTime, argonThreads,
		base64.RawStdEncoding.EncodeToString(salt),
		base64.RawStdEncoding.EncodeToString(hash),
	)
	return encoded, nil
}

// VerifyPassword recomputes the hash with the parameters embedded in the
// stored value and compares in constant time — a variable-time comparison
// (e.g. bytes.Equal short-circuiting on first mismatch) would leak timing
// information an attacker could use to guess the hash byte by byte.
func VerifyPassword(plain, encoded string) bool {
	parts := strings.Split(encoded, "$")
	if len(parts) != 6 {
		return false
	}

	var version int
	if _, err := fmt.Sscanf(parts[2], "v=%d", &version); err != nil || version != argon2.Version {
		return false
	}

	var mem uint32
	var t uint32
	var p uint8
	if _, err := fmt.Sscanf(parts[3], "m=%d,t=%d,p=%d", &mem, &t, &p); err != nil {
		return false
	}

	salt, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil {
		return false
	}
	storedHash, err := base64.RawStdEncoding.DecodeString(parts[5])
	if err != nil {
		return false
	}

	computed := argon2.IDKey([]byte(plain), salt, t, mem, p, uint32(len(storedHash)))
	return subtle.ConstantTimeCompare(computed, storedHash) == 1
}
