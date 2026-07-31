# Ledgerforge — Blockchain SaaS Platform

A production-oriented blockchain platform: Go backend (blockchain engine,
wallets, mining, REST/WebSocket API), MongoDB persistence for the
explorer, a React/TypeScript operator dashboard, and a Next.js marketing
site optimized for SEO.

## Repo layout

```
.
├── backend/            Go services — blockchain core, wallet, mining, API
├── frontend/dashboard/ React/TS operator dashboard (explorer, mining, wallet, analytics)
├── marketing/          Next.js public marketing/landing site (SSR, SEO)
└── docker-compose.yml  Local dev stack (api + mongo + dashboard + marketing)
```

## Status

| Module | State |
|---|---|
| `backend/internal/blockchain` | Fully implemented — block, SHA-256 hashing, PoW, chain validation, atomic persistence, tests |
| `backend/internal/wallet` | Fully implemented — ECDSA (P-256) key generation, address derivation, sign/verify |
| `backend/internal/transaction` | Fully implemented — build, sign, verify, serialize/deserialize |
| `backend/internal/mempool` | Fully implemented — fee-priority queue with TTL pruning |
| `backend/internal/auth` | Fully implemented — Argon2id passwords, JWT access/refresh, middleware, in-memory user store |
| `backend/internal/websocket` | Fully implemented — hub, per-client read/write pumps, ping/pong, buffered broadcast |
| `backend/internal/mining` | Fully implemented — mine-on-demand + auto-mining loop, persists + broadcasts |
| `backend/internal/repository/mongo` | Fully implemented — Block repository, indexes (Mongo is optional at runtime; falls back to file persistence if unreachable) |
| `backend/internal/api` | Fully implemented — full route table, CORS, auth-gated mining, real `http.ListenAndServe` with graceful shutdown |
| `frontend/dashboard` | Explorer, Mining, Wallet, Analytics, and Settings (login) are wired to the real API + WebSocket feed. Notifications and profile management are still placeholders. |
| `marketing/` | Fully implemented — SEO-optimized Next.js landing page (SSR, metadata, sitemap, robots, JSON-LD) |

**Known simplifications, called out rather than hidden:**
- User accounts are in-memory (`auth.InMemoryUserStore`) — accounts don't survive a server restart. The `UserRepository` interface is the exact seam a Mongo-backed store would slot into, mirroring `internal/repository/mongo`.
- `ProofOfWork.Run` has no cancellation hook, so a mining request that hits its context timeout stops *waiting* but the goroutine keeps mining in the background with no listener. Fine at dev difficulty (fast); worth fixing before raising difficulty meaningfully.
- Wallet balance is computed by walking the whole chain on every request — correct, but not the fastest approach once the chain is long. `internal/repository/mongo` is the natural place to add an aggregation-based balance query.

## Local dev

### 1. Backend

```bash
cd backend
go mod tidy      # generates go.sum — required before go run/go test/docker build
go test ./internal/blockchain/... -v
go run ./cmd/api
```

Runs on `http://localhost:8080`. Mongo is optional — without it running, the API logs a warning and falls back to file-based chain persistence at `backend/data/chain.json`.

Environment variables (see `internal/config/config.go` for defaults):
`LF_ENV`, `LF_HTTP_PORT`, `LF_MONGO_URI`, `LF_MONGO_DB`, `LF_JWT_SECRET`, `LF_MINING_DIFFICULTY`, `LF_DASHBOARD_ORIGIN`.

### 2. Dashboard

```bash
cd frontend/dashboard
npm install
npm run dev
```

Open `http://localhost:5173`. To mine a block from the Mining Dashboard, first register/log in from Settings — mining is an auth-gated route.

### 3. Marketing site

```bash
cd marketing
npm install
npm run dev
```

Open `http://localhost:3000`.

### 4. Everything via Docker

```bash
go mod tidy   # inside backend/, once — Docker build needs go.sum present
docker compose up --build
```

- API: http://localhost:8080
- Dashboard: http://localhost:5173
- Marketing site: http://localhost:3000
- MongoDB: localhost:27017

## Quick end-to-end check

```bash
curl http://localhost:8080/healthz
curl -X POST http://localhost:8080/api/v1/wallets        # generate a wallet
curl -X POST http://localhost:8080/api/v1/auth/register \
  -d '{"email":"you@example.com","password":"password123"}'
curl -X POST http://localhost:8080/api/v1/mining/mine \
  -H "Authorization: Bearer <access_token from register>"
curl http://localhost:8080/api/v1/blocks
```
