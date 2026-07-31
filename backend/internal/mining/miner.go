// Package mining orchestrates block production: pulling pending
// transactions from the mempool, calling blockchain.Blockchain.AddBlock,
// persisting the updated chain, and broadcasting the result over
// WebSocket. This is the service-layer glue between blockchain (pure
// ledger logic), mempool (pending work), and websocket (real-time
// fan-out) — none of which know about each other.
package mining

import (
	"context"
	"fmt"
	"time"

	"go.uber.org/zap"

	"github.com/sid/ledgerforge/internal/blockchain"
	"github.com/sid/ledgerforge/internal/mempool"
)

const maxTxPerBlock = 100

// Broadcaster is the subset of *websocket.Hub the mining service needs —
// depending on this narrow interface rather than *websocket.Hub directly
// means a unit test can pass a fake broadcaster with zero WebSocket setup.
type Broadcaster interface {
	Publish(topic string, payload any)
}

// Persister is the subset of persistence the service needs — matches
// blockchain.Blockchain.SaveToFile's signature so the concrete chain type
// satisfies it with no adapter code.
type Persister interface {
	SaveToFile(path string) error
}

type Chain interface {
	AddBlock(transactions [][]byte) (*blockchain.Block, error)
	Height() uint64
	Persister
}

type Service struct {
	log        *zap.SugaredLogger
	chain      Chain
	pending    *mempool.Mempool
	broadcast  Broadcaster
	chainPath  string
}

func NewService(log *zap.SugaredLogger, chain Chain, pending *mempool.Mempool, broadcast Broadcaster, chainPath string) *Service {
	return &Service{log: log, chain: chain, pending: pending, broadcast: broadcast, chainPath: chainPath}
}

// MineNext takes the highest-fee pending transactions, mines them into a
// new block, persists the updated chain, and broadcasts the result. This
// is intentionally synchronous — the caller (an HTTP handler for
// "mine now", or the auto-mining ticker below) blocks until the block is
// found. For high difficulty this could take a while; the HTTP handler
// wraps it with a request-scoped timeout via context (see mining_handler.go)
// so a slow mine doesn't hang a client request forever.
func (s *Service) MineNext(ctx context.Context) (*blockchain.Block, error) {
	txs := s.pending.Take(maxTxPerBlock)

	type result struct {
		block *blockchain.Block
		err   error
	}
	done := make(chan result, 1)

	go func() {
		block, err := s.chain.AddBlock(txs)
		done <- result{block, err}
	}()

	select {
	case <-ctx.Done():
		// NOTE: the mining goroutine above is NOT cancelled here — PoW's
		// Run loop has no cancellation hook (see pow.go). This is a known
		// scaffold gap: a production version would thread a context (or
		// atomic "stop" flag) into ProofOfWork.Run so a timed-out mine
		// actually stops burning CPU instead of finishing in the
		// background with no one listening for the result.
		return nil, fmt.Errorf("mining: %w", ctx.Err())

	case r := <-done:
		if r.err != nil {
			return nil, fmt.Errorf("mining: %w", r.err)
		}

		if err := s.chain.SaveToFile(s.chainPath); err != nil {
			// The block IS valid and in memory; a save failure shouldn't
			// discard it, just get logged loudly so an operator notices
			// disk state has drifted from memory state.
			s.log.Errorw("failed to persist chain after mining block", "block_index", r.block.Index, "error", err)
		}

		s.broadcast.Publish("block:new", r.block)
		s.broadcast.Publish("blockchain:height", s.chain.Height())

		return r.block, nil
	}
}

// StartAutoMining mines a new block every `interval` until stop is
// closed. Used for a "continuous mining" demo mode; the alternative
// (mine-on-demand via MineNext called from an HTTP handler) is better
// suited to an interactive dashboard where a user clicks "Mine Block".
// Both are exposed — the API layer decides which UX it wants.
func (s *Service) StartAutoMining(interval time.Duration, stop <-chan struct{}) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		select {
		case <-stop:
			s.log.Info("auto-mining stopped")
			return

		case <-ticker.C:
			ctx, cancel := context.WithTimeout(context.Background(), interval)
			block, err := s.MineNext(ctx)
			cancel()

			if err != nil {
				s.log.Warnw("auto-mining round failed", "error", err)
				continue
			}
			s.log.Infow("auto-mined block", "index", block.Index, "hash", block.Hash, "tx_count", len(block.Transactions))
		}
	}
}
