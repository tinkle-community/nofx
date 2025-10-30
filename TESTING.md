# Testing Guide

This document describes the comprehensive test suite for PostgreSQL persistence, mutex protection, risk enforcement, and guarded stop-loss interactions.

## Test Suite Overview

The expanded test suite provides:

- **PostgreSQL Persistence Tests**: Validate RiskStorePG with testcontainers (ephemeral Postgres)
- **Mutex/Race Tests**: Concurrent stress tests with `-race` flag for UpdateDailyPnL and SetStopUntil
- **Risk Enforcement Tests**: Breach scenarios, CanTrade() gating, and "RISK LIMIT BREACHED" log verification
- **Guarded Stop-Loss Tests**: Verify stop-loss protection during risk pause and placement failures
- **CI Integration**: GitHub Actions workflow with Docker/no-Docker matrix

## Running Tests Locally

### Prerequisites

- Go 1.25+
- Docker (optional, for PostgreSQL tests)

### Basic Test Run

```bash
# Run all tests
go test ./...

# Run with race detector
go test -race ./...

# Run specific package tests
go test ./risk/...
go test ./db/...
go test ./trader/...
```

### PostgreSQL Persistence Tests

PostgreSQL tests use testcontainers to spin up ephemeral Postgres instances. They automatically skip if Docker is unavailable.

```bash
# Run with Docker available (uses testcontainers)
go test ./db/...

# Skip Docker-based tests
SKIP_DOCKER_TESTS=1 go test ./db/...

# Use external Postgres
TEST_DB_URL="postgres://user:pass@localhost/testdb?sslmode=disable" go test ./db/...
```

### Mutex/Race Tests

```bash
# Run mutex protection tests with race detector
go test -race -v -run 'TestStore_.*Concurrent|TestStore_.*Mutex' ./risk/...

# Run concurrent update tests
go test -race -v -run 'TestUpdateDailyPnLConcurrent|TestSetStopUntilConcurrent' ./trader/...
```

### Risk Enforcement Tests

```bash
# Run all risk enforcement tests
go test -v -run 'TestEngine_.*Enforce.*|TestEngine_.*Breach.*' ./risk/...

# Run with CanTrade verification
go test -v -run 'TestAutoTrader_CanTrade.*' ./trader/...
```

### Guarded Stop-Loss Tests

```bash
# Run guarded stop-loss tests
go test -v -run 'TestAutoTrader_GuardedStopLoss.*' ./trader/...
```

### Coverage

Use the provided `scripts/ci_test.sh` script for comprehensive coverage reporting:

```bash
# Run with coverage (targets ≥90%)
./scripts/ci_test.sh

# Run with custom coverage target
COVERAGE_TARGET=85 ./scripts/ci_test.sh

# Skip race detector (faster, not recommended)
SKIP_RACE=true ./scripts/ci_test.sh

# Reproduce the CI "without Docker" coverage job
SKIP_DOCKER_TESTS=1 DISABLE_DB_TESTS=1 GOFLAGS='-tags=nodocker' COVERAGE_TARGET=90 ./scripts/ci_test.sh
```

When database tests are disabled you can narrow coverage instrumentation with:

```bash
COVERAGE_FOCUS_PACKAGES="nofx/risk nofx/featureflag" ./scripts/ci_test.sh
```

The script generates:
- `coverage.out`: Coverage profile
- `coverage.html`: HTML coverage report

## Test Structure

### PostgreSQL Persistence Tests

**Location**: `db/pg_persistence_integration_test.go`

Tests:
- `TestRiskStorePG_NewAndMigrations`: Database initialization and migrations
- `TestRiskStorePG_SaveAndLoad`: Save/load risk state
- `TestRiskStorePG_AsyncQueueBehavior`: Async queue buffering
- `TestRiskStorePG_RestartRecovery`: Persistence across restarts
- `TestRiskStorePG_ConcurrentWrites`: Concurrent write stress
- `TestRiskStorePG_FailureNonFatal`: Failure handling (non-fatal)
- `TestRiskStorePG_LoadWhenNoState`: Zero-state initialization

### Mutex/Race Tests

**Location**: `risk/store_mutex_race_test.go`

Tests:
- `TestStore_UpdateDailyPnL_ConcurrentWithMutex`: Concurrent updates with mutex protection
- `TestStore_UpdateDailyPnL_ConcurrentWithoutMutex`: Concurrent updates without mutex (data race expected)
- `TestStore_SetTradingPaused_ConcurrentToggle`: Concurrent pause/resume
- `TestStore_RecordEquity_ConcurrentStress`: Concurrent equity updates
- `TestEngine_UpdateDailyPnL_ConcurrentStressWithMutex`: Engine-level concurrent updates
- `TestStore_ResetDailyPnL_RaceFree`: Race-free reset operations
- `TestStore_MutexToggle_RuntimeSwitch`: Runtime mutex toggle
- `TestStore_ConcurrentSnapshot_NoDeadlock`: Deadlock prevention
- `TestStore_Atomicity_MutexProtected`: Atomic operations verification

### Risk Enforcement Tests

**Location**: `risk/engine_enforcement_test.go`

Tests:
- `TestEngine_Assess_BreachPausesTradingWithEnforcement`: Breach pauses trading when enforcement enabled
- `TestEngine_Assess_NoBreachWhenWithinLimits`: No pause when within limits
- `TestEngine_Assess_EnforcementDisabled_NoPause`: No pause when enforcement disabled
- `TestEngine_CheckLimits_DailyLossBreach`: Daily loss breach detection
- `TestEngine_CheckLimits_DrawdownBreach`: Drawdown breach detection
- `TestEngine_CheckLimits_RuntimeToggle`: Runtime enforcement toggle
- `TestEngine_PauseTrading_ResetsAfterDuration`: Auto-resume after pause duration
- `TestEngine_ResumeTrading_ClearsPause`: Manual resume
- `TestEngine_DrawdownCalculation_PeakTracking`: Peak equity tracking
- `TestEngine_CombinedBreachReasons`: Combined breach scenarios
- `TestEngine_CalculateStopDuration`: Stop duration calculation
- `TestEngine_ResetDailyPnL_Timing`: Daily PnL reset timing

### Guarded Stop-Loss Tests

**Location**: `trader/auto_trader_guarded_stoploss_test.go`

Tests:
- `TestAutoTrader_GuardedStopLoss_PreventOpenOnMissingStopLoss`: Block open without stop-loss
- `TestAutoTrader_GuardedStopLoss_BlockOnStopLossPlacementFailure`: Block on stop-loss placement failure
- `TestAutoTrader_GuardedStopLoss_SuccessWhenStopLossSet`: Allow open with valid stop-loss
- `TestAutoTrader_GuardedStopLoss_DisabledBypass`: Bypass when guarded stop-loss disabled
- `TestAutoTrader_GuardedStopLoss_PausedByRiskEngine_NoOpen`: No open when paused by risk engine

## CI/CD Integration

### GitHub Actions Workflow

**Location**: `.github/workflows/test.yml`

The CI pipeline runs three jobs:

1. **test-with-docker**: Tests with PostgreSQL (testcontainers)
   - Spins up ephemeral Postgres containers
   - Runs all tests including DB integration
   - Uploads coverage to Codecov

2. **test-without-docker**: Tests without Docker
   - Simulates environments without Docker
   - DB tests auto-skip
   - Ensures test suite remains green

3. **race-detector**: Race detector stress tests
   - Runs mutex/race tests with `-race`
   - Runs risk enforcement tests
   - Runs guarded stop-loss tests

### Environment Variables

- `TEST_DB_URL`: PostgreSQL connection string (optional, testcontainers used if not set)
- `SKIP_DOCKER_TESTS`: Set to `1` to skip Docker-dependent tests
- `COVERAGE_TARGET`: Coverage threshold percentage (default: 90)
- `SKIP_RACE`: Set to `true` to skip race detector (not recommended)
- `DISABLE_DB_TESTS`: Set to `1` to exclude database-bound packages from coverage (automatically enabled in the no-Docker CI job)
- `GOFLAGS`: Use build tags to mirror CI (e.g. `GOFLAGS=-tags=nodocker` when Docker is unavailable)
- `COVERAGE_FOCUS_PACKAGES`: Optional space-separated list of packages to measure coverage against when DB tests are disabled (defaults to `nofx/risk nofx/featureflag`)

## Acceptance Criteria

- ✅ Tests pass locally and in CI
- ✅ Coverage ≥90% on risk-related code
- ✅ Tests are deterministic
- ✅ DB-dependent tests auto-skip when Docker unavailable
- ✅ Race detector finds no data races
- ✅ Risk breach scenarios drive CanTrade() to false
- ✅ "RISK LIMIT BREACHED" log appears on breach
- ✅ Toggling `enable_risk_enforcement` restores flow
- ✅ Guarded stop-loss blocks when paused by risk engine
- ✅ Guarded stop-loss blocks on placement failure

## Test Support Infrastructure

### PostgreSQL Test Container

**Location**: `testsupport/postgres/container.go`

Provides `Start()` helper to launch ephemeral Postgres (TimescaleDB) containers:

```go
instance, err := testpg.Start(ctx)
if err != nil {
    if errors.Is(err, testpg.ErrDockerDisabled) {
        t.Skip("Docker tests disabled")
    }
    t.Fatalf("start postgres: %v", err)
}
defer instance.Terminate(ctx)

connStr := instance.ConnectionString()
```

Features:
- Automatic TimescaleDB image selection
- Graceful skip if Docker unavailable
- Connection string generation
- Cleanup on termination

## Troubleshooting

### Docker Not Available

If Docker is not available, tests will automatically skip:

```
=== SKIP: TestRiskStorePG_NewAndMigrations
    Skipping PostgreSQL tests: Docker not available
```

### Coverage Below Target

If coverage falls below target:

```bash
# Generate detailed coverage report
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# View uncovered lines
go tool cover -func=coverage.out | grep -v 100.0%
```

### Race Detector Issues

If race detector finds issues:

```bash
# Run specific test with verbose output
go test -race -v -run TestProblem ./package/...

# Enable detailed race logs
GORACE="log_path=race" go test -race ./...
```

## Development Guidelines

When adding new risk-related features:

1. Add comprehensive unit tests
2. Add integration tests if database interactions involved
3. Add concurrency tests if state mutations involved
4. Ensure tests run with `-race` flag
5. Update this document

## References

- [Go Testing](https://pkg.go.dev/testing)
- [Go Race Detector](https://go.dev/doc/articles/race_detector)
- [Testcontainers Go](https://golang.testcontainers.org/)
- [GitHub Actions](https://docs.github.com/en/actions)
