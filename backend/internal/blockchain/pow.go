// pow.go implements Proof of Work: the mechanism that makes adding a block
// computationally expensive (and therefore costly to rewrite chain history).
package blockchain

import (
	"math"
	"strings"
)

// ProofOfWork wraps a block with the mining logic needed to find a Hash
// that satisfies the block's Difficulty. Kept as its own type (rather than
// methods directly on Block) so mining concerns — nonce search, target
// comparison — are testable independently of block construction, and so a
// future alternate consensus (e.g. Proof of Stake) can be swapped in
// without touching the Block type at all.
type ProofOfWork struct {
	block *Block
}

// NewProofOfWork wraps the given block for mining.
func NewProofOfWork(b *Block) *ProofOfWork {
	return &ProofOfWork{block: b}
}

// Run searches for a Nonce such that CalculateHash() produces a hash with
// at least `Difficulty` leading hex zero characters, then sets the block's
// Nonce and Hash fields in place.
//
// Why leading-hex-zeros rather than a numeric target comparison:
//   Both are mathematically equivalent (N leading hex zeros ≈ hash <
//   2^(256-4N)), but the string-prefix form is simpler to explain and to
//   verify — Validate() just re-derives the hash and checks the prefix,
//   with no big.Int arithmetic required. For a teaching-oriented / portfolio
//   project this readability is worth more than the (negligible at this
//   scale) performance difference.
//
// maxNonce guards against an infinite loop: at difficulty levels a laptop
// can't feasibly satisfy, Run returns an error instead of spinning forever
// and hanging the mining goroutine — a real failure mode you'd hit if
// difficulty auto-adjustment (see AdjustDifficulty in blockchain.go) ever
// overshoots.
const maxNonce = math.MaxUint32

func (pow *ProofOfWork) Run() (nonce uint64, hash string, err error) {
	target := strings.Repeat("0", pow.block.Difficulty)

	for n := uint64(0); n < maxNonce; n++ {
		pow.block.Nonce = n
		candidate := pow.block.CalculateHash()
		if strings.HasPrefix(candidate, target) {
			pow.block.Hash = candidate
			return n, candidate, nil
		}
	}

	return 0, "", ErrProofOfWorkExhausted
}

// Validate re-derives the hash from the block's current fields (including
// its stored Nonce) and confirms it both matches the stored Hash AND meets
// the difficulty target. It also independently re-derives the Merkle root
// from the block's current Transactions and compares it against the
// stored MerkleRoot.
//
// That second check matters on its own: CalculateHash() only hashes the
// stored MerkleRoot string, not the transaction bytes themselves — so an
// attacker who swaps a transaction's body without touching MerkleRoot (or
// Hash) would pass the header-hash check even though the block no longer
// reflects its claimed transactions. Re-deriving the Merkle root here is
// what actually catches that: it's the step that ties the header's
// commitment back to the real transaction contents, not just to itself.
func (pow *ProofOfWork) Validate() bool {
	target := strings.Repeat("0", pow.block.Difficulty)
	recalculated := pow.block.CalculateHash()
	if recalculated != pow.block.Hash || !strings.HasPrefix(recalculated, target) {
		return false
	}

	return merkleRoot(pow.block.Transactions) == pow.block.MerkleRoot
}
