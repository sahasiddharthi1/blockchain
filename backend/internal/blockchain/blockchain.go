// blockchain.go implements the chain itself: the ordered, hash-linked list
// of blocks, plus the operations that must stay consistent under
// concurrent access (a mining goroutine appends while an API handler reads
// the explorer view).
package blockchain

import (
	"sync"
)

// Blockchain is an in-memory, mutex-guarded, hash-linked ledger.
//
// Why a mutex and not a channel-based actor model:
//   Reads (GetBlock, Height, the explorer's "list blocks" query) will
//   massively outnumber writes (one new block per mining round). A
//   sync.RWMutex lets many concurrent reads proceed without blocking each
//   other, while writes (AddBlock) still get exclusive access. A
//   channel/actor model would serialize reads behind the same queue as
//   writes for no benefit here — the right tool for read-heavy/write-light
//   shared state is RWMutex, not channels.
//
// Why in-memory at all, given there's a repository package for Mongo:
//   The chain's correctness rules (AddBlock, IsValid) must not require a
//   database round-trip to check "is this hash chain internally
//   consistent" — that's pure computation. The repository layer persists
//   snapshots of this struct (see persistence.go and
//   internal/repository/mongo) and rehydrates it on startup; this type
//   never imports Mongo.
type Blockchain struct {
	mu         sync.RWMutex
	blocks     []*Block
	difficulty int
}

// GenesisData is the payload embedded in block 0. It's a real,
// pre-serialized transaction just like any other — the genesis block has
// no special-cased structure, which keeps validation logic (IsValid)
// uniform across every block including index 0, rather than needing a
// "skip index 0" branch everywhere.
var GenesisData = [][]byte{[]byte(`{"type":"genesis","note":"Ledgerforge genesis block"}`)}

// New creates a fresh chain containing only a mined genesis block.
func New(difficulty int) (*Blockchain, error) {
	genesis := NewBlock(0, "", GenesisData, difficulty)
	if _, _, err := NewProofOfWork(genesis).Run(); err != nil {
		return nil, err
	}

	return &Blockchain{
		blocks:     []*Block{genesis},
		difficulty: difficulty,
	}, nil
}

// AddBlock mines and appends a new block containing the given
// (already-serialized) transactions. Returns the mined block so the mining
// service can broadcast it over WebSocket without a second lookup.
func (bc *Blockchain) AddBlock(transactions [][]byte) (*Block, error) {
	bc.mu.Lock()
	defer bc.mu.Unlock()

	if len(bc.blocks) == 0 {
		return nil, ErrEmptyChain
	}

	prev := bc.blocks[len(bc.blocks)-1]
	next := NewBlock(prev.Index+1, prev.Hash, transactions, bc.difficulty)

	if _, _, err := NewProofOfWork(next).Run(); err != nil {
		return nil, err
	}

	bc.blocks = append(bc.blocks, next)
	return next, nil
}

// IsValid walks the entire chain and checks, for every block:
//  1. its Hash actually matches CalculateHash() of its own fields
//  2. its Hash satisfies the difficulty target it claims (ProofOfWork.Validate)
//  3. its PrevHash matches the previous block's Hash (the "chain" part of blockchain)
//  4. its Index is sequential
//
// This is the function you'd call after loading a chain from disk/Mongo,
// or periodically as a network-health check, or when a peer proposes a
// competing chain (once P2P sync exists) — anywhere you must not trust
// data at rest or in transit without re-deriving it.
func (bc *Blockchain) IsValid() error {
	bc.mu.RLock()
	defer bc.mu.RUnlock()

	if len(bc.blocks) == 0 {
		return ErrEmptyChain
	}

	for i, block := range bc.blocks {
		if !NewProofOfWork(block).Validate() {
			return ErrHashInvalid
		}

		if i == 0 {
			continue // genesis has no predecessor to link against
		}

		prev := bc.blocks[i-1]
		if block.PrevHash != prev.Hash {
			return ErrPrevHashMismatch
		}
		if block.Index != prev.Index+1 {
			return ErrIndexOutOfOrder
		}
	}

	return nil
}

// Height returns the index of the latest block (0 for a chain with only
// genesis).
func (bc *Blockchain) Height() uint64 {
	bc.mu.RLock()
	defer bc.mu.RUnlock()
	return bc.blocks[len(bc.blocks)-1].Index
}

// Difficulty returns the chain's current mining difficulty (required
// leading hex zeros). Exposed for the analytics endpoint; not yet
// dynamic — a natural next extension is auto-adjusting difficulty based
// on recent block times, the way real chains target a stable block
// interval.
func (bc *Blockchain) Difficulty() int {
	bc.mu.RLock()
	defer bc.mu.RUnlock()
	return bc.difficulty
}

// LatestBlock returns the most recently mined block.
func (bc *Blockchain) LatestBlock() *Block {
	bc.mu.RLock()
	defer bc.mu.RUnlock()
	return bc.blocks[len(bc.blocks)-1]
}

// BlockByIndex returns the block at the given height, or ErrBlockNotFound.
// Used by the explorer API (GET /blocks/{index}).
func (bc *Blockchain) BlockByIndex(index uint64) (*Block, error) {
	bc.mu.RLock()
	defer bc.mu.RUnlock()

	if index >= uint64(len(bc.blocks)) {
		return nil, ErrBlockNotFound
	}
	return bc.blocks[index], nil
}

// Blocks returns a defensive copy of the block slice. Copying (rather than
// returning the internal slice directly) prevents a caller from mutating
// chain history through the returned slice while holding no lock — a
// classic shared-mutable-state bug. The cost of copying a slice of
// pointers is trivial compared to the safety gained.
func (bc *Blockchain) Blocks() []*Block {
	bc.mu.RLock()
	defer bc.mu.RUnlock()

	out := make([]*Block, len(bc.blocks))
	copy(out, bc.blocks)
	return out
}
