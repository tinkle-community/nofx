# Repository Guidelines

## Project Structure & Module Organization
`main.go` boots the trading manager and loads runtime configuration from `config/`. Core services live under `api/` (HTTP layer), `manager/` (multi-trader orchestration), `trader/` (exchange integrations), and `decision/`, `market/`, `pool/`, `logger/` for AI logic, data, asset selection, and logging. Frontend code sits in `web/` with Vite + React; install dependencies before running UI commands. Deployment helpers and presets are in `docker/`, `nginx/`, and `start.sh`; screenshots and marketing assets stay in `screenshots/`.

## Build, Test, and Development Commands
Run backend locally with `go run ./...` and produce binaries via `go build ./...`. Execute `go test ./...` to verify Go packages; add `-run` filters for targeted checks. Frontend workflows use `npm install --prefix web`, `npm run dev --prefix web`, and `npm run build --prefix web` for type-safe production bundles. For containerized runs, prefer `./start.sh start --build` or `docker compose up -d --build`.

## Coding Style & Naming Conventions
All Go files must stay `gofmt`-clean (tabs for indentation, camelCase identifiers). Keep package-level errors wrapped with context and favor explicit struct types over `map[string]any`. TypeScript inside `web/` follows 2-space indentation, PascalCase for components (`CompetitionPage.tsx`), and camelCase for hooks and utilities. Run `go fmt ./...` and `npm run build --prefix web` before raising a PR to surface format or type issues.

## Testing Guidelines
Backend tests belong alongside source files as `*_test.go` using the standard `testing` package; seed stubs via `testdata/` within the relevant package when fixtures are needed. Aim for meaningful coverage of strategy decisions, exchange adapters, and risk controls—critical paths include `trader/`, `decision/`, and `manager/`. Frontend lacks a test rig today; if you introduce UI logic, add Vite-compatible tests (e.g., Vitest + Testing Library) and document new commands.

## Commit & Pull Request Guidelines
Follow the existing history: concise, descriptive subject lines with optional type prefixes (`UI:`, `Docs:`, `Feat:`) or multilingual summaries when helpful. Reference related issues or bounty IDs in the body, and note config or schema impacts explicitly. PRs should link to testing evidence (`go test`, `npm run build`, Docker smoke run), highlight UI changes with screenshots, and flag any new environment variables.

## Security & Configuration Tips
Never commit populated secrets—copy `config.json.example` or `.env.example` when sharing settings. Strip API keys and private keys from logs before attachment; the system expects exchange keys, AI tokens, and private keys to stay local. After major prompt or strategy updates (e.g., editing `decision/engine.go`), bump the `strategy_version` in `config.json` so new performance metrics start fresh. When working on deployment templates (`docker-compose.yml`, `pm2.config.js`), preserve existing port mappings and TLS directives, and call out breaking changes in release notes. 会话规范：所有代理和贡献者之间的协作交流需全程使用中文，以保持沟通一致性。
