# Persistence + Risk Engine Gating + Tests & Metrics

## Overview

This document describes the persistence layer, risk engine enforcement with explicit gating, comprehensive tests, and metrics implementation for the NOFX trading system.

## Features

### 1. Persistence (TimescaleDB/PostgreSQL)

#### Database Schema

The system uses PostgreSQL with TimescaleDB extension for efficient time-series data storage:

- **`risk_state`** - Single-row snapshot table storing current risk state per trader
  - `trader_id` (PK) - Unique trader identifier
  - `daily_pnl` - Current daily P&L
  - `drawdown_pct` - Current drawdown percentage
  - `current_equity` - Current account equity
  - `peak_equity` - Peak equity recorded
  - `trading_paused` - Whether trading is currently paused
  - `paused_until` - When trading will resume
  - `last_reset_time` - Last daily P&L reset time
  - `updated_at` - Last update timestamp

- **`risk_state_history`** - Append-only audit log of all risk state transitions
  - TimescaleDB hypertable for efficient time-series queries
  - Includes `trace_id` and `reason` for debugging
  - All state fields from `risk_state`
  - `recorded_at` timestamp

#### Implementation

**`db/RiskStore`** provides async persistence with graceful degradation:

```go
store, err := db.NewRiskStore(dbPath)
if err != nil {
    // Handle error - system continues with in-memory state
}
store.BindTrader(traderID)

// Load persisted state
state, err := store.Load()

// Save state asynchronously (never blocks)
err = store.Save(state, traceID, reason)

// Graceful shutdown
store.Close()
```

**Key Features:**
- Async save queue (default 64 entries) - never blocks trading loop
- Persistence failures are logged but never fatal
- Automatic reconnection on transient failures
- Queue overflow is gracefully handled (requests dropped with warning)

#### Configuration

Set database connection via environment variables:

```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_NAME=nofx_risk
```

Or use connection string:
```
postgres://user:pass@host:port/dbname?sslmode=disable
```

#### Feature Flag

Enable/disable persistence via configuration:

```json
{
  "feature_flags": {
    "enable_persistence": true
  }
}
```

Or environment variable:
```bash
export ENABLE_PERSISTENCE=true
```

### 2. Risk Engine Enforcement

#### Risk Limits

The risk engine enforces configurable limits:

- **Max Daily Loss** - Percentage of initial balance allowed to lose per day
- **Max Drawdown** - Maximum percentage decline from peak equity
- **Stop Trading Duration** - How long to pause after breach

#### Implementation

**`AutoTrader.CanTrade()`** evaluates trading permission:

```go
canTrade, reason := trader.CanTrade()
if !canTrade {
    log.Printf("Trading blocked: %s", reason)
    return
}
```

**Enforcement Flow:**
1. Check if `stopUntil` deadline has passed
2. If `enable_risk_enforcement` is true, consult risk engine
3. Risk engine assesses current equity against limits
4. On breach, logs "RISK LIMIT BREACHED" and sets pause
5. Returns `(false, reason)` if trading should be blocked

#### Feature Flag

Risk enforcement can be toggled without restart:

```json
{
  "feature_flags": {
    "enable_risk_enforcement": true
  }
}
```

When disabled, system reverts to legacy behavior (no enforcement).

#### Persistence Integration

When both `enable_persistence` and `enable_risk_enforcement` are true:

1. Risk state (dailyPnL, pausedUntil, etc.) persists across restarts
2. After restart, trader resumes paused state if deadline hasn't passed
3. Database failures degrade gracefully to in-memory state

### 3. Tests & Metrics

#### Test Coverage

**Unit Tests:**
- `db/risk_store_test.go` - Persistence layer tests
  - Save/Load round-trip
  - Recovery after restart
  - Concurrent saves (race detector passes)
  - Graceful failure handling
  - Queue overflow behavior

- `trader/auto_trader_persistence_test.go` - Integration tests
  - Persistence disabled behavior
  - Invalid database graceful degradation
  - CanTrade() enforcement logic
  - Risk enforcement disabled behavior
  - Risk breach detection

**Running Tests:**

```bash
# All tests (requires PostgreSQL)
export TEST_DB_URL="postgres://postgres:postgres@localhost:5432/nofx_risk_test"
go test ./... -v

# Skip database tests
go test ./... -short

# With race detector
go test ./trader -race

# Coverage
go test ./db -cover
go test ./trader -cover
```

**Coverage Target:** ≥95% for new risk and persistence components

#### Metrics

All metrics are noop by default. Build with `-tags metrics` to enable Prometheus:

```bash
go build -tags metrics
```

**Available Metrics:**

1. **risk_daily_pnl** (gauge) - Current daily P&L per trader
2. **risk_drawdown** (gauge) - Current drawdown percentage
3. **risk_trading_paused** (gauge) - 1 when trading is paused, 0 otherwise
4. **risk_limit_breaches_total** (counter) - Cumulative risk breaches
5. **risk_persistence_attempts_total** (counter) - Persistence attempts
6. **risk_persistence_failures_total** (counter) - Persistence errors
7. **risk_check_latency_ms** (gauge) - Risk check duration
8. **risk_persist_latency_ms** (gauge) - Persistence operation duration

**Accessing Metrics:**

Prometheus metrics available at: `http://localhost:8080/metrics` (when built with metrics tag)

## Docker Deployment

### Docker Compose

The updated `docker-compose.yml` includes:

```yaml
services:
  postgres:
    image: timescale/timescaledb:latest-pg16
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=nofx_risk

  nofx:
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
    volumes:
      - ./data:/app/data
```

### Starting Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f nofx

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up --build
```

### Data Persistence

All persistent data stored in `./data/` directory:
- `./data/postgres/` - PostgreSQL data files
- Excluded from git via `.gitignore`

## Migration from Legacy

### Before (In-Memory Only)

```go
at, err := trader.NewAutoTrader(cfg, store, flags)
```

### After (With Persistence)

```go
dbPath := "postgres://user:pass@host:port/nofx_risk"
at, err := trader.NewAutoTraderWithPersistence(cfg, dbPath, flags)
defer at.ClosePersistence()
```

**Backward Compatibility:**
- Legacy `NewAutoTrader()` still works (no persistence)
- Database connection failure gracefully degrades
- Feature flags allow runtime toggling

## Troubleshooting

### Database Connection Issues

**Symptom:** `failed to connect to db` error on startup

**Solutions:**
1. Check PostgreSQL is running: `docker-compose ps postgres`
2. Verify connection string environment variables
3. Check network connectivity to database host
4. Review PostgreSQL logs: `docker-compose logs postgres`

**Graceful Degradation:** System continues with in-memory state if DB unavailable

### Persistence Not Working

**Check Feature Flag:**
```bash
# View current flags
curl http://localhost:8080/api/feature_flags

# Enable persistence
curl -X POST http://localhost:8080/api/feature_flags \
  -H "Content-Type: application/json" \
  -d '{"enable_persistence": true}'
```

**Check Logs:**
```bash
# Look for persistence warnings
docker-compose logs nofx | grep -i persist
```

### Risk Enforcement Not Triggering

**Verify Configuration:**
```json
{
  "max_daily_loss": 5.0,    // 5% max daily loss
  "max_drawdown": 20.0,     // 20% max drawdown
  "stop_trading_minutes": 30,
  "feature_flags": {
    "enable_risk_enforcement": true
  }
}
```

**Check Logs for Breaches:**
```bash
docker-compose logs nofx | grep "RISK LIMIT BREACHED"
```

### High Memory Usage

**Symptom:** Memory grows over time

**Cause:** Persistence queue overflow

**Solution:** Check database connectivity and worker processing

## Performance Considerations

### Persistence Queue

- Default queue size: 64 entries
- Each save operation completes in <5ms typically
- Worker pool size: 1 (configurable)
- Queue overflow drops oldest requests (logged)

### Risk Engine Overhead

- Risk check latency: ~1-2ms
- Persistence latency: ~5-10ms
- No blocking operations in trading loop
- All operations timeout-protected

## Security

### Database Credentials

**Production:**
- Use strong passwords
- Enable SSL: `?sslmode=require`
- Restrict database access by IP
- Use read-only replicas for analytics

**Example Secure Connection:**
```
postgres://user:pass@host:5432/nofx_risk?sslmode=require&application_name=nofx
```

### Environment Variables

Store sensitive values in `.env` (excluded from git):
```bash
DB_PASSWORD=strong_password_here
```

## Future Enhancements

### Planned Features

1. **Multi-region replication** - Cross-region disaster recovery
2. **Point-in-time recovery** - Restore state to specific timestamp
3. **Analytics dashboard** - Historical risk state visualization
4. **Alert system** - Notifications on risk breaches
5. **Backup automation** - Scheduled database backups

### Configuration Examples

See `config.json.example` for full configuration template.

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f nofx`
2. Review metrics: `curl http://localhost:8080/metrics`
3. Test database: `psql $DB_URL -c "SELECT count(*) FROM risk_state;"`
4. Enable debug logging: Set `LOG_LEVEL=debug`

## References

- [TimescaleDB Documentation](https://docs.timescale.com/)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [Prometheus Metrics](https://prometheus.io/docs/concepts/metric_types/)
