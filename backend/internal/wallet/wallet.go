// Package wallet manages ECDSA key pairs and derives a human-facing wallet
// address from a public key. It is intentionally non-custodial: a private
// key is generated, handed to the caller once, and never persisted by the
// server — see handlers.WalletHandler.CreateWallet for where that
// "returned exactly once" contract is enforced at the API boundary.
//
// Curve choice: P-256 (crypto/elliptic), not secp256k1. Bitcoin/Ethereum
// use secp256k1, but it isn't in the Go standard library — using it would
// mean pulling in an external curve implementation (e.g. btcec) for a
// portfolio project where the goal is demonstrating the cryptographic
// concepts (key generation, signing, verification, address derivation)
// correctly, not byte-for-byte Bitcoin compatibility. P-256 is a NIST
// curve with first-class stdlib support, so the whole wallet package has
// zero external dependencies.
package wallet

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"math/big"
)

var curve = elliptic.P256()

// Wallet holds a key pair and its derived address.
type Wallet struct {
	PrivateKey *ecdsa.PrivateKey
	PublicKey  *ecdsa.PublicKey
	Address    string
}

// New generates a fresh key pair and derives its address.
func New() (*Wallet, error) {
	priv, err := ecdsa.GenerateKey(curve, rand.Reader)
	if err != nil {
		return nil, fmt.Errorf("wallet: generate key: %w", err)
	}
	return fromPrivateKey(priv), nil
}

// FromPrivateKeyHex reconstructs a Wallet from a previously-issued private
// key, e.g. when a client reconnects with a saved key rather than
// generating a new one.
func FromPrivateKeyHex(hexKey string) (*Wallet, error) {
	raw, err := hex.DecodeString(hexKey)
	if err != nil {
		return nil, fmt.Errorf("wallet: decode private key hex: %w", err)
	}

	priv := new(ecdsa.PrivateKey)
	priv.PublicKey.Curve = curve
	priv.D = new(big.Int).SetBytes(raw)
	priv.PublicKey.X, priv.PublicKey.Y = curve.ScalarBaseMult(raw)

	return fromPrivateKey(priv), nil
}

func fromPrivateKey(priv *ecdsa.PrivateKey) *Wallet {
	pub := &priv.PublicKey
	return &Wallet{
		PrivateKey: priv,
		PublicKey:  pub,
		Address:    deriveAddress(pub),
	}
}

// PrivateKeyHex returns the private key as hex — this is the value a
// client must store; the server keeps no copy after the response that
// created it.
func (w *Wallet) PrivateKeyHex() string {
	return hex.EncodeToString(w.PrivateKey.D.Bytes())
}

// PublicKeyBytes returns the public key in SEC1 compressed form — compact
// enough to embed in every transaction without bloating block size, and
// standard enough that any ECDSA library can decode it.
func (w *Wallet) PublicKeyBytes() []byte {
	return elliptic.MarshalCompressed(curve, w.PublicKey.X, w.PublicKey.Y)
}

// deriveAddress turns a public key into a short, checksum-protected,
// human-shareable string.
//
// Why hash the public key rather than expose it directly as the address:
//   1. Shorter — a raw compressed P-256 key is 33 bytes; addresses here
//      are 24 (20-byte hash + 4-byte checksum).
//   2. A checksum catches transcription typos before a transaction is
//      even signed — a wrong last character fails the checksum on the
//      sender's own side rather than silently sending funds to a wallet
//      that happens not to exist.
func deriveAddress(pub *ecdsa.PublicKey) string {
	pubBytes := elliptic.MarshalCompressed(curve, pub.X, pub.Y)

	digest := sha256.Sum256(pubBytes)
	payload := digest[:20] // first 20 bytes, Bitcoin-style truncation

	checksum := sha256.Sum256(payload)
	full := append(append([]byte{}, payload...), checksum[:4]...)

	return "LF" + hex.EncodeToString(full)
}

// Sign produces a fixed-length (64-byte: 32-byte r + 32-byte s) signature
// over sha256(payload). Fixed-length, zero-padded r/s (rather than
// variable-length ASN.1 DER encoding) keeps signature parsing on the
// verifying side a simple slice operation instead of an ASN.1 decoder —
// one less thing that can be malformed input.
func (w *Wallet) Sign(payload []byte) ([]byte, error) {
	digest := sha256.Sum256(payload)
	r, s, err := ecdsa.Sign(rand.Reader, w.PrivateKey, digest[:])
	if err != nil {
		return nil, fmt.Errorf("wallet: sign: %w", err)
	}

	sig := make([]byte, 64)
	r.FillBytes(sig[0:32])
	s.FillBytes(sig[32:64])
	return sig, nil
}

// Verify checks a signature produced by Sign against the given compressed
// public key bytes. Returns false (never an error) for any malformed
// input — a caller should treat "false" as "reject this transaction",
// full stop, without needing to distinguish why.
func Verify(pubKeyBytes, payload, signature []byte) bool {
	if len(signature) != 64 {
		return false
	}

	x, y := elliptic.UnmarshalCompressed(curve, pubKeyBytes)
	if x == nil {
		return false // malformed or wrong-curve public key
	}
	pub := &ecdsa.PublicKey{Curve: curve, X: x, Y: y}

	r := new(big.Int).SetBytes(signature[0:32])
	s := new(big.Int).SetBytes(signature[32:64])

	digest := sha256.Sum256(payload)
	return ecdsa.Verify(pub, digest[:], r, s)
}
