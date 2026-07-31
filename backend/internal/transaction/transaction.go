// Package transaction models a signed transfer of value between two
// wallets: building the canonical payload that gets signed, verifying
// that signature, and serializing the result into the opaque []byte
// payload blockchain.AddBlock embeds in a block.
//
// Dependency direction: transaction depends on wallet (for signing and
// PublicKeyBytes-shaped verification), but blockchain depends on NEITHER.
// A Transaction is only ever handed to blockchain as pre-serialized bytes
// — see Serialize/Deserialize below — which is what keeps the ledger core
// free of any assumption about what a transaction contains.
package transaction

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"time"

	"github.com/sid/ledgerforge/internal/wallet"
)

// Transaction is a single transfer request, before or after mining.
type Transaction struct {
	ID        string    `json:"id"`               // sha256(payload || signature), hex — set by Sign
	From      string    `json:"from"`             // sender wallet address
	To        string    `json:"to"`               // recipient wallet address
	Amount    float64   `json:"amount"`
	Fee       float64   `json:"fee"`
	Nonce     uint64    `json:"nonce"`             // per-sender sequence number, prevents replay
	Timestamp int64     `json:"timestamp"`         // Unix nanoseconds, UTC
	PublicKey []byte    `json:"public_key"`        // sender's compressed pubkey, for signature verification
	Signature []byte    `json:"signature"`         // set by Sign
}

// New constructs an unsigned transaction. Amount/Fee must be positive —
// validated here rather than left to whoever calls Sign, since an invalid
// transaction should never reach the signing step at all.
func New(from, to string, amount, fee float64, nonce uint64) (*Transaction, error) {
	if from == "" || to == "" {
		return nil, fmt.Errorf("transaction: from and to addresses are required")
	}
	if from == to {
		return nil, fmt.Errorf("transaction: from and to must differ")
	}
	if amount <= 0 {
		return nil, fmt.Errorf("transaction: amount must be positive, got %v", amount)
	}
	if fee < 0 {
		return nil, fmt.Errorf("transaction: fee must be non-negative, got %v", fee)
	}

	return &Transaction{
		From:      from,
		To:        to,
		Amount:    amount,
		Fee:       fee,
		Nonce:     nonce,
		Timestamp: time.Now().UTC().UnixNano(),
	}, nil
}

// signingPayload returns the canonical bytes that get hashed and signed.
// Fixed field order (like blockchain.Block.CalculateHash) — never
// json.Marshal(t) directly, since Signature/ID/PublicKey must be excluded
// (they don't exist yet at signing time, and including PublicKey would
// make the payload depend on data that's about to be attached to the
// struct alongside it, which is circular).
func (t *Transaction) signingPayload() []byte {
	buf, _ := json.Marshal(struct {
		From      string  `json:"from"`
		To        string  `json:"to"`
		Amount    float64 `json:"amount"`
		Fee       float64 `json:"fee"`
		Nonce     uint64  `json:"nonce"`
		Timestamp int64   `json:"timestamp"`
	}{t.From, t.To, t.Amount, t.Fee, t.Nonce, t.Timestamp})
	return buf
}

// Sign signs the transaction with the sender's wallet, then derives the
// transaction ID from the signed payload. The wallet's derived address
// must match t.From — signing a transaction "from" an address you don't
// control should fail loudly here, not silently produce a transaction
// that fails verification later.
func (t *Transaction) Sign(w *wallet.Wallet) error {
	if w.Address != t.From {
		return fmt.Errorf("transaction: signing wallet address %s does not match From %s", w.Address, t.From)
	}

	sig, err := w.Sign(t.signingPayload())
	if err != nil {
		return fmt.Errorf("transaction: sign: %w", err)
	}

	t.PublicKey = w.PublicKeyBytes()
	t.Signature = sig

	idSource := append(append([]byte{}, t.signingPayload()...), sig...)
	idHash := sha256.Sum256(idSource)
	t.ID = hex.EncodeToString(idHash[:])

	return nil
}

// Verify checks that:
//  1. the embedded PublicKey actually derives to the claimed From address
//     (so a caller can't sign as address A using a keypair for address B), and
//  2. the Signature is valid over the canonical signing payload.
//
// Both checks are required — (2) alone would let anyone attach any valid
// keypair's signature and claim any From address, since the signature
// only proves "the holder of this keypair signed this payload," not
// "this keypair belongs to the claimed sender."
func (t *Transaction) Verify() error {
	expectedAddress := addressFromPublicKey(t.PublicKey)
	if expectedAddress != t.From {
		return fmt.Errorf("transaction: public key does not derive to From address")
	}

	if !wallet.Verify(t.PublicKey, t.signingPayload(), t.Signature) {
		return fmt.Errorf("transaction: signature verification failed")
	}

	return nil
}

// addressFromPublicKey duplicates wallet's address derivation without
// requiring a full *wallet.Wallet (which needs a private key) just to
// check a public key. Kept here rather than exported from wallet to avoid
// two public ways of deriving the same thing drifting out of sync — this
// is the only caller, and if a second one appears, promote it to
// wallet.AddressFromPublicKeyBytes at that point.
func addressFromPublicKey(pubKeyBytes []byte) string {
	digest := sha256.Sum256(pubKeyBytes)
	payload := digest[:20]
	checksum := sha256.Sum256(payload)
	full := append(append([]byte{}, payload...), checksum[:4]...)
	return "LF" + hex.EncodeToString(full)
}

// Serialize produces the opaque []byte that blockchain.AddBlock embeds in
// a block's Transactions field.
func (t *Transaction) Serialize() ([]byte, error) {
	data, err := json.Marshal(t)
	if err != nil {
		return nil, fmt.Errorf("transaction: serialize: %w", err)
	}
	return data, nil
}

// Deserialize reverses Serialize — used by the explorer API and by
// balance calculation (wallet.GetBalance walks every block's
// Transactions and deserializes each one to check From/To).
func Deserialize(data []byte) (*Transaction, error) {
	var t Transaction
	if err := json.Unmarshal(data, &t); err != nil {
		return nil, fmt.Errorf("transaction: deserialize: %w", err)
	}
	return &t, nil
}
