package blockchain

import (
	"errors"
	"os"
	"path/filepath"
	"testing"
)

func txs(payloads ...string) [][]byte {
	out := make([][]byte, len(payloads))
	for i, p := range payloads {
		out[i] = []byte(p)
	}
	return out
}

func TestNewBlock_HashIsDeterministic(t *testing.T) {
	b1 := NewBlock(1, "abc", txs(`{"a":1}`), 2)
	b1.Timestamp = 1000 // pin for determinism
	b1.Nonce = 42

	b2 := NewBlock(1, "abc", txs(`{"a":1}`), 2)
	b2.Timestamp = 1000
	b2.Nonce = 42

	if b1.CalculateHash() != b2.CalculateHash() {
		t.Fatalf("identical header fields must produce identical hashes")
	}
}

func TestMerkleRoot_DifferentTxSets_DifferentRoot(t *testing.T) {
	a := NewBlock(1, "x", txs("tx-a", "tx-b"), 1)
	b := NewBlock(1, "x", txs("tx-a", "tx-c"), 1)

	if a.MerkleRoot == b.MerkleRoot {
		t.Fatalf("different transaction sets must produce different Merkle roots")
	}
}

func TestProofOfWork_RunSatisfiesDifficulty(t *testing.T) {
	b := NewBlock(1, "genesis-hash", txs("payload"), 3)
	pow := NewProofOfWork(b)

	if _, hash, err := pow.Run(); err != nil {
		t.Fatalf("mining failed: %v", err)
	} else if len(hash) < 3 || hash[:3] != "000" {
		t.Fatalf("mined hash %q does not satisfy difficulty 3", hash)
	}

	if !pow.Validate() {
		t.Fatalf("freshly mined block should validate")
	}
}

func TestProofOfWork_TamperedTransactionsInvalidatesHash(t *testing.T) {
	b := NewBlock(1, "genesis-hash", txs("payload"), 2)
	NewProofOfWork(b).Run()

	// Simulate an attacker rewriting a transaction after mining.
	b.Transactions[0] = []byte("tampered-payload")
	// NOTE: MerkleRoot is NOT recalculated — this models an attacker who
	// only swaps the tx body but can't forge a matching Merkle root+hash.
	if NewProofOfWork(b).Validate() {
		t.Fatalf("tampering with transaction data without recalculating the hash must fail validation")
	}
}

func TestBlockchain_AddBlockAndValidate(t *testing.T) {
	bc, err := New(2)
	if err != nil {
		t.Fatalf("New: %v", err)
	}

	for i := 0; i < 3; i++ {
		if _, err := bc.AddBlock(txs("payload")); err != nil {
			t.Fatalf("AddBlock #%d: %v", i, err)
		}
	}

	if bc.Height() != 3 {
		t.Fatalf("expected height 3, got %d", bc.Height())
	}

	if err := bc.IsValid(); err != nil {
		t.Fatalf("expected valid chain, got: %v", err)
	}
}

func TestBlockchain_DetectsBrokenPrevHashLink(t *testing.T) {
	bc, _ := New(1)
	bc.AddBlock(txs("payload"))

	// Splice in a block that is internally self-consistent (its own Hash
	// legitimately matches its own header and satisfies the difficulty
	// target — ProofOfWork.Validate alone would pass it) but was mined
	// against a prev_hash that doesn't match block 0's real Hash. This is
	// the scenario ErrPrevHashMismatch exists to catch: a block that's
	// individually "valid" but doesn't actually chain to its predecessor.
	forged := NewBlock(1, "not-the-real-prev-hash", txs("payload"), 1)
	if _, _, err := NewProofOfWork(forged).Run(); err != nil {
		t.Fatalf("mining forged block: %v", err)
	}
	bc.blocks[1] = forged

	err := bc.IsValid()
	if !errors.Is(err, ErrPrevHashMismatch) {
		t.Fatalf("expected ErrPrevHashMismatch, got %v", err)
	}
}

func TestBlockchain_BlockByIndex_NotFound(t *testing.T) {
	bc, _ := New(1)
	if _, err := bc.BlockByIndex(99); !errors.Is(err, ErrBlockNotFound) {
		t.Fatalf("expected ErrBlockNotFound, got %v", err)
	}
}

func TestPersistence_SaveLoadRoundTrip(t *testing.T) {
	bc, _ := New(2)
	bc.AddBlock(txs("payload-1"))
	bc.AddBlock(txs("payload-2"))

	path := filepath.Join(t.TempDir(), "chain.json")
	if err := bc.SaveToFile(path); err != nil {
		t.Fatalf("SaveToFile: %v", err)
	}

	loaded, err := LoadFromFile(path)
	if err != nil {
		t.Fatalf("LoadFromFile: %v", err)
	}

	if loaded.Height() != bc.Height() {
		t.Fatalf("height mismatch after reload: got %d want %d", loaded.Height(), bc.Height())
	}
	if err := loaded.IsValid(); err != nil {
		t.Fatalf("reloaded chain should be valid: %v", err)
	}
}

func TestPersistence_LoadRejectsCorruptedFile(t *testing.T) {
	path := filepath.Join(t.TempDir(), "corrupt.json")
	os.WriteFile(path, []byte(`{"difficulty":1,"blocks":[{"index":0,"hash":"not-a-real-hash"}]}`), 0o600)

	if _, err := LoadFromFile(path); err == nil {
		t.Fatalf("expected LoadFromFile to reject a chain that fails validation, got nil error")
	}
}
