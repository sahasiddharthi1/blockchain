// cmd/api is the composition root: the one place allowed to know about
// every concrete package and wire them together. Nothing under internal/
// imports cmd/api — dependencies only ever point inward, which is what
// makes each internal package testable and replaceable on its own.
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"github.com/sid/ledgerforge/internal/api"
	"github.com/sid/ledgerforge/internal/api/handlers"
	"github.com/sid/ledgerforge/internal/auth"
	"github.com/sid/ledgerforge/internal/blockchain"
	"github.com/sid/ledgerforge/internal/config"
	"github.com/sid/ledgerforge/internal/logger"
	"github.com/sid/ledgerforge/internal/mempool"
	"github.com/sid/ledgerforge/internal/mining"
	mongorepo "github.com/sid/ledgerforge/internal/repository/mongo"
	"github.com/sid/ledgerforge/internal/websocket"
)

const chainPath = "data/chain.json"

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	baseLogger, err := logger.New(cfg.Env)
	if err != nil {
		log.Fatalf("logger: %v", err)
	}
	defer baseLogger.Sync()
	// Sugar() trades a small amount of performance for the ergonomic
	// key-value logging call sites below. Hot paths (per-tx validation,
	// the PoW loop) should use baseLogger directly with zap.Field values
	// instead, once those exist.
	zlog := baseLogger.Sugar()

	// --- Chain bootstrap -----------------------------------------------
	// File-based persistence is the source of truth for this pass (see
	// internal/blockchain/persistence.go); Mongo below is wired for the
	// explorer's future read path and to demonstrate the Repository
	// Pattern, but a Mongo outage must not prevent the core mine/verify
	// loop from working locally.
	if err := os.MkdirAll(filepath.Dir(chainPath), 0o755); err != nil {
		zlog.Fatalw("failed to create data directory", "error", err)
	}

	chain, err := blockchain.LoadFromFile(chainPath)
	if err != nil {
		zlog.Infow("no existing chain found, bootstrapping genesis", "reason", err.Error())
		chain, err = blockchain.New(cfg.MiningDifficulty)
		if err != nil {
			zlog.Fatalw("failed to bootstrap genesis block", "error", err)
		}
		if err := chain.SaveToFile(chainPath); err != nil {
			zlog.Errorw("failed to persist freshly-bootstrapped chain", "error", err)
		}
	}

	// --- Optional Mongo connection --------------------------------------
	mongoCtx, mongoCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer mongoCancel()

	mongoClient, err := mongo.Connect(mongoCtx, options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		zlog.Warnw("mongo connection failed — explorer will run on in-memory chain only", "error", err)
	} else if err := mongoClient.Ping(mongoCtx, nil); err != nil {
		zlog.Warnw("mongo ping failed — explorer will run on in-memory chain only", "error", err)
	} else {
		db := mongoClient.Database(cfg.MongoDB)
		if err := mongorepo.EnsureIndexes(mongoCtx, db); err != nil {
			zlog.Warnw("failed to ensure mongo indexes", "error", err)
		} else {
			zlog.Info("connected to mongo and ensured indexes")
		}
		defer mongoClient.Disconnect(context.Background())
	}

	// --- Core services ---------------------------------------------------
	pending := mempool.New(30 * time.Minute)

	hub := websocket.NewHub(zlog)
	go hub.Run()

	miningSvc := mining.NewService(zlog, chain, pending, hub, chainPath)

	userStore := auth.NewInMemoryUserStore() // see auth/user_store.go for the Mongo-swap seam
	authSvc := auth.NewService(userStore, cfg.JWTSecret)

	// --- Handlers + router -----------------------------------------------
	h := api.Handlers{
		Auth:        handlers.NewAuthHandler(authSvc),
		Blockchain:  handlers.NewBlockchainHandler(chain),
		Wallet:      handlers.NewWalletHandler(chain),
		Transaction: handlers.NewTransactionHandler(pending),
		Mining:      handlers.NewMiningHandler(miningSvc),
		Analytics:   handlers.NewAnalyticsHandler(chain, pending),
		Hub:         hub,
	}

	dashboardOrigin := os.Getenv("LF_DASHBOARD_ORIGIN")
	if dashboardOrigin == "" {
		dashboardOrigin = "http://localhost:5173"
	}
	router := api.NewRouter(h, cfg.JWTSecret, dashboardOrigin)

	srv := &http.Server{
		Addr:              ":" + cfg.HTTPPort,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
	}

	// --- Background mempool pruning ---------------------------------------
	pruneStop := make(chan struct{})
	go func() {
		ticker := time.NewTicker(5 * time.Minute)
		defer ticker.Stop()
		for {
			select {
			case <-pruneStop:
				return
			case <-ticker.C:
				if n := pending.Prune(); n > 0 {
					zlog.Infow("pruned stale mempool entries", "count", n)
				}
			}
		}
	}()

	// --- Serve with graceful shutdown --------------------------------------
	go func() {
		zlog.Infow("ledgerforge api listening",
			"port", cfg.HTTPPort,
			"env", cfg.Env,
			"chain_height", chain.Height(),
			"difficulty", cfg.MiningDifficulty,
		)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			zlog.Fatalw("server failed", "error", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	zlog.Info("shutdown signal received, draining connections")
	close(pruneStop)

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		zlog.Errorw("graceful shutdown failed", "error", err)
	}

	if err := chain.SaveToFile(chainPath); err != nil {
		zlog.Errorw("failed to persist chain on shutdown", "error", err)
	}

	zlog.Info("shutdown complete")
}
