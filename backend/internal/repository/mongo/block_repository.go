// Package mongo implements the Repository Pattern for durable, queryable
// storage of blockchain state in MongoDB — the production counterpart to
// blockchain.SaveToFile/LoadFromFile (file-based, used for the smallest
// local-dev setup and in the blockchain package's own tests).
//
// Why MongoDB for a hash-chained, append-only structure: blocks and
// transactions are naturally document-shaped (nested transaction arrays
// per block), the explorer needs flexible queries (by index, by hash, by
// address across all transactions) that benefit from secondary indexes
// rather than joins, and write volume is append-mostly — Mongo handles
// that well without transaction-heavy relational overhead.
//
// Why a Repository interface: handlers and services depend on
// BlockRepository, never on *mongo.Client directly. Swapping storage, or
// mocking it in a unit test, touches only this file.
package mongo

import (
	"context"
	"errors"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/sid/ledgerforge/internal/blockchain"
)

// BlockRepository is the storage-agnostic contract the service layer
// depends on.
type BlockRepository interface {
	SaveBlock(ctx context.Context, block *blockchain.Block) error
	GetBlockByIndex(ctx context.Context, index uint64) (*blockchain.Block, error)
	GetLatestBlock(ctx context.Context) (*blockchain.Block, error)
	ListBlocks(ctx context.Context, offset, limit int64) ([]*blockchain.Block, error)
}

type mongoBlockRepository struct {
	coll *mongo.Collection
}

// NewBlockRepository wraps the "blocks" collection on the given database.
// blockchain.Block's bson tags (added alongside its json tags) mean the
// driver can (de)serialize it directly — no shadow/DTO struct needed,
// which keeps this file honest that Mongo stores exactly the domain type,
// not a lossy projection of it.
func NewBlockRepository(db *mongo.Database) BlockRepository {
	return &mongoBlockRepository{coll: db.Collection("blocks")}
}

// EnsureIndexes creates the indexes ListBlocks/GetBlockByIndex/wallet
// balance queries rely on. Call once at startup (see cmd/api/main.go) —
// CreateMany is idempotent, so this is safe to run on every boot rather
// than needing a separate migration step.
func EnsureIndexes(ctx context.Context, db *mongo.Database) error {
	coll := db.Collection("blocks")
	_, err := coll.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			// Unique on index: the chain's core invariant (exactly one
			// block per height) enforced at the storage layer too, not
			// just in blockchain.Blockchain.IsValid() in memory.
			Keys:    bson.D{{Key: "index", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			// Powers "all transactions involving address X" — the query
			// wallet balance calculation and the transaction explorer's
			// address search both need.
			Keys: bson.D{{Key: "transactions", Value: 1}},
		},
	})
	if err != nil {
		return fmt.Errorf("mongo: ensure indexes: %w", err)
	}
	return nil
}

func (r *mongoBlockRepository) SaveBlock(ctx context.Context, block *blockchain.Block) error {
	if _, err := r.coll.InsertOne(ctx, block); err != nil {
		return fmt.Errorf("mongo: save block %d: %w", block.Index, err)
	}
	return nil
}

func (r *mongoBlockRepository) GetBlockByIndex(ctx context.Context, index uint64) (*blockchain.Block, error) {
	var block blockchain.Block
	err := r.coll.FindOne(ctx, bson.M{"index": index}).Decode(&block)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, blockchain.ErrBlockNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("mongo: get block %d: %w", index, err)
	}
	return &block, nil
}

func (r *mongoBlockRepository) GetLatestBlock(ctx context.Context) (*blockchain.Block, error) {
	opts := options.FindOne().SetSort(bson.D{{Key: "index", Value: -1}})

	var block blockchain.Block
	err := r.coll.FindOne(ctx, bson.M{}, opts).Decode(&block)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return nil, blockchain.ErrEmptyChain
	}
	if err != nil {
		return nil, fmt.Errorf("mongo: get latest block: %w", err)
	}
	return &block, nil
}

func (r *mongoBlockRepository) ListBlocks(ctx context.Context, offset, limit int64) ([]*blockchain.Block, error) {
	if limit <= 0 || limit > 200 {
		// A hard ceiling protects against an explorer page accidentally
		// requesting the entire chain in one response as it grows.
		limit = 50
	}

	opts := options.Find().
		SetSort(bson.D{{Key: "index", Value: 1}}).
		SetSkip(offset).
		SetLimit(limit)

	cur, err := r.coll.Find(ctx, bson.M{}, opts)
	if err != nil {
		return nil, fmt.Errorf("mongo: list blocks: %w", err)
	}
	defer cur.Close(ctx)

	blocks := make([]*blockchain.Block, 0, limit)
	for cur.Next(ctx) {
		var b blockchain.Block
		if err := cur.Decode(&b); err != nil {
			return nil, fmt.Errorf("mongo: decode block: %w", err)
		}
		blocks = append(blocks, &b)
	}
	if err := cur.Err(); err != nil {
		return nil, fmt.Errorf("mongo: cursor error: %w", err)
	}

	return blocks, nil
}
