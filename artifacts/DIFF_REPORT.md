# Diff Report

## git log --oneline --graph upstream/main..fork-main
*   b6eff8b Merge pull request #16 from rawswar/ci-stabilize-cache-restore-nondocker-coverage
|\  
| * 602fa45 ci: stabilize GitHub Actions by fixing Go module cache and DB-excluded coverage
|/  
*   0499edc Merge pull request #15 from rawswar/fix/store-mutex-race-tests-resolve-conflicts
|\  
| * def23d0 fix(risk/mutex): resolve test conflicts, deflake race jobs, unify test helpers
|/  
*   e347b2e Merge pull request #13 from rawswar/ci/non-db-coverage-90-fix-gating-no-docker
|\  
| * 5e60213 test(ci): raise non-DB test coverage to ≥90% and strengthen CI gating
|/  
*   6ce5957 Merge pull request #12 from rawswar/ci-stabilize-failing-tests-race-detector
|\  
| * 81fed3c fix(ci,test): stabilize CI by making tests deterministic, robust to race detector, and more reliable
|/  
*   4c7dc06 Merge pull request #11 from rawswar/test-expanded-postgres-mutex-risk-ci
|\  
| * 7460423 test(risk,db,trader,ci): expand risk suite with PostgreSQL, mutex, enforcement & CI
|/  
*   4a06ec3 Merge pull request #10 from rawswar/risk-api-align-checklimits-calculatestopduration
|\  
| * 3a3557f feat(risk): align risk engine public API and AutoTrader gating with CheckLimits
|/  
*   3bd2e05 Merge pull request #9 from rawswar/feat/postgres-timescale-persistence-docker-migrations
|\  
| * 43b1958 feat(db/persistence,docker): add PostgreSQL+TimescaleDB async risk persistence with migrations, retry queue, and Docker integration
|/  
* a91a93a Merge pull request #8 from rawswar/rebase-upstream-main-pr-gap-risk-engine-persistence-mutex-stoploss
* 6c64c22 style: fix formatting in config.go
* b3b71cf feat(trader): add Aster DEX and Custom AI API support to AutoTraderConfig
*   b634c64 Merge pull request #7 from rawswar/chore-rebase-resolve-guarded-stoploss-risk-persistence-tests
|\  
| * 055966d Add comprehensive conflict resolution and test report
| * 186ac7d Add comprehensive tests for guarded stop-loss feature
|/  
*   fab2c11 Merge pull request #6 from rawswar/feature/persistence-risk-gating-tests-metrics
|\  
| * b4e431a feat(core,persistence,risk): add PostgreSQL/TimescaleDB persistence, explicit risk enforcement gating, comprehensive tests and metrics
|/  
*   e2631f0 Merge pull request #4 from rawswar/feat/align-feature-flags-default-on
|\  
| * ceddc1d feat(featureflag): align runtime feature flags with rollout requirements, default ON
|/  
*   df35027 Merge pull request #3 from rawswar/feat-autotrader-enable-mutex-protection-helpers
|\  
| * d582b48 feat(trader): add opt-in mutex risk state protection to AutoTrader
|/  
*   37bb2a2 Merge pull request #2 from rawswar/feat-guarded-stop-loss-runtime-flags
|\  
| * e60b2f8 feat(trader,core): add runtime feature flags & guarded stop-loss enforcement
|/  
* 9e0642e Merge pull request #1 from rawswar/feat/risk-tests-metrics-prometheus-admin-flags
* 187ac1d feat(risk): add risk engine, Prometheus metrics, runtime flags, admin API, and >95% test coverage

## git diff --name-status upstream/main...fork-main
A	.github/workflows/test.yml
M	.gitignore
A	CHANGES.md
A	CONFLICT_RESOLUTION_AND_TEST_REPORT.md
M	Dockerfile
A	TESTING.md
M	api/server.go
A	api/server_featureflags_test.go
M	config.json.example
M	config/config.go
A	config/config_test.go
A	db/migrations/000001_create_risk_tables.down.sql
A	db/migrations/000001_create_risk_tables.up.sql
A	db/migrations/000002_create_hypertable.down.sql
A	db/migrations/000002_create_hypertable.up.sql
A	db/pg_persistence_integration_test.go
A	db/pg_store.go
A	db/risk_store_test.go
A	db/schema.sql
M	docker-compose.yml
A	docs/PERSISTENCE_RISK.md
A	docs/POSTGRES_PERSISTENCE.md
A	docs/risk_metrics.md
A	featureflag/runtime_flags.go
A	featureflag/runtime_flags_test.go
M	go.mod
M	go.sum
M	main.go
M	manager/trader_manager.go
A	metrics/noop.go
A	metrics/noop_test.go
A	metrics/prometheus_metrics.go
A	risk/README.md
A	risk/api_test.go
A	risk/engine.go
A	risk/engine_compat_test.go
A	risk/engine_enforcement_test.go
A	risk/store.go
A	risk/store_mutex_norace_test.go
A	risk/store_mutex_race_test.go
A	risk/store_persistence_test.go
A	risk/testsupport/mutex_testutil.go
A	risk/types.go
A	scripts/ci_test.sh
A	scripts/risk_coverage.sh
A	testsupport/postgres/container.go
M	trader/auto_trader.go
A	trader/auto_trader_guarded_stoploss_test.go
A	trader/auto_trader_persistence_test.go
A	trader/auto_trader_risk_test.go
