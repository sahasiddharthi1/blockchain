// Package blockchain is the core domain layer of Ledgerforge: the append-only,
// hash-linked, tamper-evident ledger itself.
//
// Where this sits in the architecture:
//
//	┌─────────────┐    HTTP/WS    ┌──────────────┐   depends on   ┌───────────────┐
//	│  API layer  │ ────────────► │ Mining/Wallet│ ─────────────► │  blockchain   │
//	│ (handlers)  │                │  (services)  │                 │  (this pkg)   │
//	└─────────────┘                └──────────────┘                 └───────────────┘
//	                                                                        │
//	                                                                 persists via
//	                                                                        ▼
//	                                                                 ┌───────────────┐
//	                                                                 │ repository     │
//	                                                                 │ (Mongo/file)   │
//	                                                                 └───────────────┘
//
// This package has ZERO dependencies on wallet, transaction, mining, API, or
// Mongo. That is a deliberate Clean Architecture boundary: the ledger's
// correctness rules (hashing, linking, proof of work, validation) must not
// know anything about how transactions are constructed, how they're
// authenticated, or how blocks are stored. Higher layers depend on this
// package; this package depends on nothing internal. That's what makes it
// unit-testable in isolation and swappable at the storage layer without
// touching a single hashing rule.
//
// Transactions are intentionally opaque here ([][]byte of already-serialized
// payloads). The blockchain package's only job is to hash and chain them —
// it does not need to know a transaction has a sender, amount, or signature.
// That knowledge belongs to the transaction package, which serializes a
// transaction before handing it to a Block.
package blockchain

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"time"
)

// Block is a single, immutable-once-mined unit of the ledger.
//
// Design note: every field that participates in the hash is included in
// CalculateHash's input in a fixed, explicit order (never by reflecting
// over the struct) so the hash is stable across Go versions and JSON field
// reordering. This is the single most common bug in from-scratch blockchain
// implementations: hashing json.Marshal(block) directly, which is NOT
// guaranteed to produce byte-identical output across encodings/versions,
// silently breaking chain validation.
type Block struct {
	Index        uint64   `json:"index" bson:"index"`
	Timestamp    int64    `json:"timestamp" bson:"timestamp"` // Unix nanoseconds, UTC
	PrevHash     string   `json:"prev_hash" bson:"prev_hash"`
	MerkleRoot   string   `json:"merkle_root" bson:"merkle_root"`
	Transactions [][]byte `json:"transactions" bson:"transactions"` // opaque, pre-serialized
	Nonce        uint64   `json:"nonce" bson:"nonce"`
	Difficulty   int      `json:"difficulty" bson:"difficulty"` // required leading hex zeros
	Hash         string   `json:"hash" bson:"hash"`
}

// NewBlock constructs an *unmined* block: everything is populated except
// Nonce and Hash, which ProofOfWork.Run fills in. Splitting construction
// from mining keeps the "what goes in a block" concern separate from the
// "how do we find a valid nonce" concern (single responsibility).
func NewBlock(index uint64, prevHash string, transactions [][]byte, difficulty int) *Block {
	return &Block{
		Index:        index,
		Timestamp:    time.Now().UTC().UnixNano(),
		PrevHash:     prevHash,
		MerkleRoot:   merkleRoot(transactions),
		Transactions: transactions,
		Difficulty:   difficulty,
	}
}

// CalculateHash returns the SHA-256 hash of the block's header fields,
// hex-encoded. It deliberately hashes the *header* (index, timestamp,
// prevHash, merkleRoot, nonce, difficulty) rather than the full transaction
// bodies — this mirrors real chains (Bitcoin hashes the block header, not
// raw tx bytes, per block) and is why MerkleRoot exists: it commits to the
// full transaction set in a single fixed-size hash, so the header stays
// small and hashing stays fast during mining even as tx count grows.
func (b *Block) CalculateHash() string {
	h := sha256.New()
	// Fixed field order — see struct doc comment for why this matters.
	buf, _ := json.Marshal(struct {
		Index      uint64 `json:"index"`
		Timestamp  int64  `json:"timestamp"`
		PrevHash   string `json:"prev_hash"`
		MerkleRoot string `json:"merkle_root"`
		Nonce      uint64 `json:"nonce"`
		Difficulty int    `json:"difficulty"`
	}{b.Index, b.Timestamp, b.PrevHash, b.MerkleRoot, b.Nonce, b.Difficulty})
	h.Write(buf)
	return hex.EncodeToString(h.Sum(nil))
}

// merkleRoot commits to an ordered list of transactions in a single hash.
//
// Why not just hash the concatenation of all transactions:
//   A flat hash of concatenated bytes would need to be fully rehashed to
//   verify any single transaction's inclusion. A Merkle tree lets a client
//   prove "transaction X is in this block" with O(log n) hashes instead of
//   the whole block (a Merkle proof) — important for light clients that
//   don't store the full chain. We don't expose proof generation yet (that's
//   a natural extension once the transaction package + explorer API land),
//   but building the root correctly now means it's a non-breaking addition
//   later instead of a data-model migration.
func merkleRoot(transactions [][]byte) string {
	if len(transactions) == 0 {
		empty := sha256.Sum256(nil)
		return hex.EncodeToString(empty[:])
	}

	layer := make([][]byte, len(transactions))
	for i, tx := range transactions {
		sum := sha256.Sum256(tx)
		layer[i] = sum[:]
	}

	for len(layer) > 1 {
		if len(layer)%2 == 1 {
			// Odd number of nodes: duplicate the last one so every layer
			// pairs cleanly. This is the standard Bitcoin-style convention.
			layer = append(layer, layer[len(layer)-1])
		}
		next := make([][]byte, 0, len(layer)/2)
		for i := 0; i < len(layer); i += 2 {
			combined := append(append([]byte{}, layer[i]...), layer[i+1]...)
			sum := sha256.Sum256(combined)
			next = append(next, sum[:])
		}
		layer = next
	}

	return hex.EncodeToString(layer[0])
}
