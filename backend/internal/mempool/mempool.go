// Package mempool holds pending, not-yet-mined transactions.
//
// Why a separate package instead of a field on blockchain.Blockchain: the
// mempool has entirely different lifecycle rules than the chain — entries
// get evicted the moment they're mined (or expire, or get outbid), none of
// which belongs in an append-only ledger's mental model. Keeping it
// separate also enforces a permission boundary at the type level: the API
// layer can only Add to it, the mining service is the only thing that can
// Take from it.
package mempool

import (
	"fmt"
	"sort"
	"sync"
	"time"
)

// entry pairs a transaction's serialized bytes with metadata needed for
// eviction and fee ordering, without the mempool needing to know anything
// about the transaction package's internal structure — it only needs the
// fee (passed explicitly by the caller) and an arrival time.
type entry struct {
	id        string
	payload   []byte
	fee       float64
	arrivedAt time.Time
}

// Mempool is a mutex-guarded, fee-prioritized queue of pending
// transactions.
type Mempool struct {
	mu      sync.Mutex
	entries map[string]*entry
	order   []string // insertion order; source of truth for FIFO fallback
	ttl     time.Duration
}

// New returns an empty mempool. ttl bounds how long an unmined
// transaction is allowed to sit before Prune considers it stale — without
// this, a transaction with too low a fee to ever get picked up would sit
// forever, silently growing memory use.
func New(ttl time.Duration) *Mempool {
	if ttl <= 0 {
		ttl = 30 * time.Minute
	}
	return &Mempool{entries: make(map[string]*entry), ttl: ttl}
}

// Add inserts a transaction. Returns an error on a duplicate ID (a
// transaction being resubmitted) rather than silently overwriting, since a
// silent overwrite could let a resubmission swap out a transaction's fee
// after the sender saw the original accepted.
func (m *Mempool) Add(id string, payload []byte, fee float64) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, exists := m.entries[id]; exists {
		return fmt.Errorf("mempool: transaction %s already pending", id)
	}

	m.entries[id] = &entry{id: id, payload: payload, fee: fee, arrivedAt: time.Now()}
	m.order = append(m.order, id)
	return nil
}

// Remove drops a transaction (e.g. it was included in a block, or the
// sender cancelled it — cancellation isn't implemented yet but Remove is
// the primitive it would use).
func (m *Mempool) Remove(id string) {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.entries, id)
	// order is left with a stale id; Take/compact filters against
	// m.entries so this is O(1) here and cleaned up lazily instead of
	// doing an O(n) slice removal on every Remove call.
}

// Take returns up to `max` pending transactions ordered by fee
// (descending, miners prioritize higher-paying transactions first) and
// removes them from the pool. Ties fall back to arrival order (FIFO)
// so two equal-fee transactions are settled fairly rather than
// nondeterministically by map iteration order.
func (m *Mempool) Take(max int) [][]byte {
	m.mu.Lock()
	defer m.mu.Unlock()

	live := make([]*entry, 0, len(m.order))
	for _, id := range m.order {
		if e, ok := m.entries[id]; ok {
			live = append(live, e)
		}
	}

	sort.SliceStable(live, func(i, j int) bool {
		if live[i].fee != live[j].fee {
			return live[i].fee > live[j].fee
		}
		return live[i].arrivedAt.Before(live[j].arrivedAt)
	})

	if max > len(live) {
		max = len(live)
	}

	taken := make([][]byte, max)
	newOrder := make([]string, 0, len(m.order)-max)
	takenIDs := make(map[string]bool, max)

	for i := 0; i < max; i++ {
		taken[i] = live[i].payload
		takenIDs[live[i].id] = true
		delete(m.entries, live[i].id)
	}
	for _, id := range m.order {
		if !takenIDs[id] {
			newOrder = append(newOrder, id)
		}
	}
	m.order = newOrder

	return taken
}

// Prune removes entries older than the configured TTL. Intended to be
// called periodically (e.g. alongside the mining loop's ticker) rather
// than on every operation, since it's an O(n) scan.
func (m *Mempool) Prune() int {
	m.mu.Lock()
	defer m.mu.Unlock()

	cutoff := time.Now().Add(-m.ttl)
	removed := 0
	newOrder := make([]string, 0, len(m.order))

	for _, id := range m.order {
		e, ok := m.entries[id]
		if !ok {
			continue
		}
		if e.arrivedAt.Before(cutoff) {
			delete(m.entries, id)
			removed++
			continue
		}
		newOrder = append(newOrder, id)
	}
	m.order = newOrder
	return removed
}

// Size returns the current number of pending transactions.
func (m *Mempool) Size() int {
	m.mu.Lock()
	defer m.mu.Unlock()
	return len(m.entries)
}
