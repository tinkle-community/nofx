# AGENTS.md

NOFX is a Go (backend) + React/TypeScript (frontend) AI trading platform. This file
is for OpenCode sessions; it complements `README.md`, `CONTRIBUTING.md`, and the
Chinese spec in `agents.md` (which describes the trading-assistant product, not
agent tooling).

## Repo layout (one Go module at root)

- `main.go` — entrypoint; wires `config`, `crypto`, `store`, `manager`, `api`,
  `nofxiagent`, `telegram` (see `main.go:26`).
- `api/` — HTTP handlers (Gin). One handler per resource.
- `agent/` — NOFXi LLM agent core, skill definitions, dispatchers, DAGs.
  `agent/skills/*.json` are **embedded** into the binary via
  `//go:embed skills/*.json` in `agent/skill_registry.go:11` — edit the JSON
  there, not loose files.
- `agent/skills/` is the source of truth for skill metadata (actions, required
  slots, confirmation rules). New skills: add JSON, rebuild.
- `trader/`, `market/`, `mcp/` (AI clients), `provider/` (data providers),
  `kernel/` (strategy engine), `manager/`, `store/` (GORM/DB), `auth/`,
  `crypto/`, `config/`, `wallet/`, `telegram/`, `telemetry/`, `safe/`,
  `security/`, `hook/`, `logger/`, `cmd/`, `mcp/payment`, `mcp/provider`.
- `web/` — Vite + React 18 + TypeScript + Tailwind. Dev server proxies
  `/api` → `http://localhost:8080` (`web/vite.config.ts:9`).
- `docker/` — Dockerfiles. `docker/Dockerfile.backend` still installs TA-Lib,
  but **no Go code depends on TA-Lib** — indicators in `market/data_indicators.go`
  are pure Go math. Don't add new `markcheno/go-talib` imports.
- `scripts/` — repo ops scripts. The `*.go` files have `//go:build ignore`;
  run with `go run scripts/<file>.go` (not `go test`).
- `cmd/lighter_test/main.go` — standalone Lighter API auth tester, run with
  `go run ./cmd/lighter_test -wallet=… -apikey=… [-testnet]`.
- `docs/` — all docs (EN + `i18n/{zh-CN,ja,ko,ru,uk,vi}/`). `docs/getting-started/`
  is the best on-ramp for new contributors.

## Build, test, lint (exact commands)

- All-in-one make targets (see `Makefile`):
  - `make test-backend` → `go test -v ./...`
  - `make test-frontend` → `cd web && npm run test` (Vitest, jsdom env,
    see `web/vitest.config.ts`)
  - `make test` runs both.
  - `make test-coverage` writes `coverage.html`.
  - `make build` → `go build -o nofx`. `make build-frontend` → `cd web && npm run build`.
  - `make run` → `go run main.go`. `make fmt`, `make lint` (`golangci-lint run`).
- Focused single-package test: `go test -v ./agent/...` or
  `go test -v ./store -run TestX`.
- Focused frontend test: `cd web && npx vitest run src/lib/<file>.test.ts`.
- Frontend typecheck is folded into `npm run build` (`tsc && vite build`);
  there is **no separate `npm run type-check`** even though `scripts/pr-check.sh`
  references one.
- Go CI runs `gofmt -s -l .`, `go vet ./...`, `go build -v -o nofx`
  (`.github/workflows/pr-checks.yml`). Backend CI in `pr-checks.yml` is the
  blocking gate; `pr-checks-run.yml` is advisory (`continue-on-error: true`).

## Database & secrets

- DB defaults to SQLite at `data/data.db` (env: `DB_TYPE=sqlite`, `DB_PATH=…`).
  Postgres is selectable via `DB_TYPE=postgres` + `DB_HOST/PORT/USER/PASSWORD/DBNAME/SSLMODE`.
- `.env` is **not** committed; copy from `.env.example`. The first `./start.sh`
  run auto-generates `JWT_SECRET`, `DATA_ENCRYPTION_KEY` (AES-256, base64), and
  `RSA_PRIVATE_KEY` (PEM, single-line) into `.env` (`start.sh:129-170`).
- Encryption service (`crypto/`) **must** initialize before the store
  (`main.go:42-49`) — `EncryptedString` decryption depends on it. Removing
  this ordering will silently break reads of existing rows.
- Backward-compat: a positional CLI arg overrides `DB_PATH` for SQLite only
  (`main.go:53-55`).

## Pre-commit & PR conventions

- Husky pre-commit (`.husky/pre-commit`) only lints staged files in `web/`
  via `lint-staged` (`eslint --fix` + `prettier --write` for `*.{ts,tsx,css,json}`).
  There is **no Go pre-commit hook** — run `go fmt ./...` and `go vet ./...`
  yourself before pushing.
- PR titles must follow Conventional Commits
  (`feat|fix|docs|style|refactor|perf|test|chore|ci|security|build(scope): …`).
  Validation is advisory, not blocking (`.github/workflows/pr-checks.yml`).
- Keep PRs < 300 lines; > 1000 is auto-labeled `size: large`.
- Branch off `dev`, not `main`. PR target: `dev` or `main`.
- Use `./scripts/pr-check.sh` for a local health check before pushing.
- Auto-labeling: `area: frontend` for `web/**`, `area: backend` for `**/*.go`,
  `go.mod`, `go.sum`, plus per-component labels (see `.github/labeler.yml`).
- CODEOWNERS auto-assigns reviewers per path (see `.github/CODEOWNERS`).

## Domain gotchas

- Trading the assistant is **high risk**: docs flag delete/start/stop on
  traders, exchanges, models, and strategies as `needs_confirmation: true`
  in the skill JSON. Match that for any new skill action that mutates or
  controls a live trader.
- `agent/` package comment states "ALL user messages go to the LLM. The LLM
  IS the brain — just like how OpenClaw works" (`agent/agent.go:1-6`).
  Do not add regex/pattern routing in front of the LLM call.
- Skill JSON fields are loaded with strict validation
  (`agent/skill_registry.go:33-67`); an unparsable file panics on startup.
  Required fields: `name`, `kind` (`management` or `diagnosis`), `domain`.
- `mcp/` AI providers are pluggable; new providers go in `mcp/provider/`
  (one file each — see `claude.go`, `deepseek.go`, `qwen.go`, etc.). Payment
  helpers live in `mcp/payment/` (`claw402.go`, `x402.go`).
- Dockerfile.backend still references TA-Lib build stages; this is leftover
  from when `markcheno/go-talib` was used. The Go binary does not need it
  on the build host — `go build` works without `libta-lib0-dev`. Do not add
  new CGO deps that assume TA-Lib is present locally.

## What lives elsewhere (don't duplicate here)

- User-facing product/install help → `README.md` and `docs/getting-started/`.
- Trading-assistant behavior spec (Chinese) → `agents.md` — this is
  **product documentation**, not a coding agent guide.
- Encryption internals → `ENCRYPTION_README.md`.
- Troubleshooting of exchange/AI errors → `docs/guides/TROUBLESHOOTING.md`.
- Maintainer workflows → `docs/maintainers/`.
- Skill design rationale → `docs/agent-skills/diagnostic-skills.zh-CN.md`.
