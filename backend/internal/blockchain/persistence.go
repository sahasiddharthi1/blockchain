// persistence.go handles serializing the chain to durable storage and
// recovering it on startup.
//
// This file uses the filesystem (JSON) as the reference implementation of
// persistence for the blockchain package itself, so the package stays
// dependency-free and its round-trip logic is unit-testable with no
// external services running. internal/repository/mongo builds the
// production-grade, queryable storage layer on top of the same Block/
// Blockchain types — that repository's Save/Load should produce byte-for-
// byte equivalent results to this one for the same chain, which is exactly
// what a shared "does Save→Load reproduce an IsValid chain" test asserts.
package blockchain

import (
	"encoding/json"
	"fmt"
	"os"
)

// chainSnapshot is the on-disk shape. Wrapping the block slice (rather
// than serializing []*Block directly) leaves room to add versioning
// metadata later (e.g. a schema Version field) without an incompatible
// format change — you'd add a field with a JSON default, not restructure
// the whole file.
type chainSnapshot struct {
	Difficulty int      `json:"difficulty"`
	Blocks     []*Block `json:"blocks"`
}

// SaveToFile writes the current chain to disk as indented JSON.
//
// Why write-to-temp-then-rename instead of writing the target file
// directly: if the process is killed mid-write (OOM, container restart)
// a direct write can leave a truncated, unparseable file — corrupting the
// only copy of chain history. Writing to a temp file and renaming is
// atomic on POSIX filesystems: readers either see the old complete file or
// the new complete file, never a partial one.
func (bc *Blockchain) SaveToFile(path string) error {
	bc.mu.RLock()
	snap := chainSnapshot{Difficulty: bc.difficulty, Blocks: bc.blocks}
	bc.mu.RUnlock()

	data, err := json.MarshalIndent(snap, "", "  ")
	if err != nil {
		return fmt.Errorf("blockchain: marshal snapshot: %w", err)
	}

	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, data, 0o600); err != nil {
		return fmt.Errorf("blockchain: write temp file: %w", err)
	}
	if err := os.Rename(tmp, path); err != nil {
		return fmt.Errorf("blockchain: rename temp file into place: %w", err)
	}
	return nil
}

// LoadFromFile reads a chain snapshot from disk and validates it before
// returning. Recovery must never hand back a chain it hasn't verified —
// otherwise a corrupted or tampered file would silently become "the
// truth" for every reader downstream (API responses, mining's view of the
// latest block, wallet balance calculations that walk the chain).
func LoadFromFile(path string) (*Blockchain, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("blockchain: read file: %w", err)
	}

	var snap chainSnapshot
	if err := json.Unmarshal(data, &snap); err != nil {
		return nil, fmt.Errorf("blockchain: unmarshal snapshot: %w", err)
	}

	if len(snap.Blocks) == 0 {
		return nil, ErrEmptyChain
	}

	bc := &Blockchain{blocks: snap.Blocks, difficulty: snap.Difficulty}
	if err := bc.IsValid(); err != nil {
		return nil, fmt.Errorf("blockchain: loaded chain failed validation, refusing to use it: %w", err)
	}

	return bc, nil
}
