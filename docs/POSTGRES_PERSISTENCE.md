# PostgreSQL/TimescaleDB Persistence Implementation

## Overview

The NOFX AI Trading System now includes PostgreSQL/TimescaleDB-based persistence for risk state management. This feature allows risk state to survive system restarts and provides append-only audit history for all risk state transitions.

## Features

- **PostgreSQL Driver**: Uses `pgx/v5` for efficient PostgreSQL connectivity
- **TimescaleDB Support**: Hypertable-backed history for efficient time-series operations
- **Auto-Migrations**: Uses `golang-migrate/migrate v4` for automatic schema migrations on startup
- **Async Queue**: Buffered, batched async saves with configurable backpressure
- **Retry Logic**: Exponential backoff for transient failures
- **Graceful Shutdown**: Context-based cancellation drains queue on shutdown
- **Non-Fatal Failures**: Database failures are logged but never crash the trading loop
- **Metrics**: Prometheus metrics for persistence attempts, failures, and latency with backend labels

## Configuration

### Environment Variables

```bash
# PostgreSQL connection URL (takes precedence)
POSTGRES_URL=postgres://user:pass@host:port/dbname?sslmode=disable

# Or use individual components
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=nofx_risk
POSTGRES_SSLMODE=disable  # Options: disable, require, verify-full

# Backend selection
PERSISTENCE_BACKEND=postgres  # Options: postgres, memory
ENABLE_PERSISTENCE=true
```

### JSON Configuration

```json
{
  "postgres_url": "postgres://user:pass@host:port/dbname",
  "postgres_sslmode": "disable",
  "persistence_backend": "postgres",
  "feature_flags": {
    "enable_persistence": true
  }
}
```

## Docker Compose

The provided `docker-compose.yml` includes:

- **TimescaleDB Service**: PostgreSQL 16 + TimescaleDB extension
- **Healthchecks**: Ensures database is ready before starting the app
- **Volume Mounts**: Data persists across container restarts
- **Environment Wiring**: Automatic connection string injection

Start the stack:

```bash
docker-compose up -d
```

## Architecture

### Schema

Two tables are created:

1. **`risk_state`**: Single-row snapshot per trader
   - `trader_id` (PRIMARY KEY)
   - `daily_pnl`, `drawdown_pct`, `current_equity`, `peak_equity`
   - `trading_paused`, `paused_until`, `last_reset_time`, `updated_at`

2. **`risk_state_history`**: Append-only audit log (TimescaleDB hypertable)
   - `id`, `trader_id`, `trace_id`, `reason`
   - All risk state fields
   - `recorded_at` (partition key for hypertable)

### Async Persistence

- **Buffering**: Requests are queued in a bounded channel (default 512 entries)
- **Batching**: Worker flushes batches of 32 requests every 200ms
- **Retry**: Up to 5 retries with exponential backoff (150ms to 3s)
- **Backpressure**: Save calls timeout after 5s if queue is full
- **Graceful Shutdown**: Queue drains with 10s timeout

### Metrics

Prometheus metrics with `backend=postgres` label:

- `risk_persistence_attempts_total{trader_id, backend}`
- `risk_persistence_failures_total{trader_id, backend}`
- `risk_persist_latency_ms{trader_id, backend}`

## Migrations

Migrations are embedded in the Go binary and run automatically on startup:

- `000001_create_risk_tables.up.sql`: Creates `risk_state` and `risk_state_history` tables
- `000002_create_hypertable.up.sql`: Converts history table to TimescaleDB hypertable

Manual migration management (using included `migrate` binary in Docker):

```bash
# Apply migrations
migrate -path db/migrations -database "postgres://..." up

# Rollback one migration
migrate -path db/migrations -database "postgres://..." down 1

# Check version
migrate -path db/migrations -database "postgres://..." version
```

## Fallback Behavior

If database initialization fails:

1. Error is logged with critical severity
2. System falls back to in-memory risk store
3. Trading continues without interruption
4. Metrics record the backend as `memory`

## Security

- **Credentials**: Never baked into images; always injected via environment
- **SSL Support**: Configurable SSL mode (disable, require, verify-full)
- **Connection Pooling**: pgx connection pool with health checks

## Testing

Run tests with a PostgreSQL instance:

```bash
# Set test database URL
export TEST_DB_URL="postgres://postgres:postgres@localhost:5432/nofx_test?sslmode=disable"

# Run persistence tests
go test ./db/... -v

# Run integration tests
go test ./trader/... -run Persistence -v
```

## Performance

- **Latency**: Async saves do not block trading loop
- **Throughput**: Batching achieves ~100-500 writes/sec
- **Storage**: TimescaleDB hypertable enables efficient querying of historical data

## Troubleshooting

### Migration Failures

If migrations fail on startup, check:

1. Database connectivity: `psql -U postgres -h localhost -d nofx_risk`
2. TimescaleDB extension: `SELECT * FROM pg_extension WHERE extname='timescaledb';`
3. Migration version: Check logs for specific SQL error

### Connection Issues

- Verify `POSTGRES_URL` or `DB_*` env variables
- Check network connectivity from app container to Postgres
- Ensure healthcheck passes: `docker-compose ps`

### Data Recovery

Restore from `risk_state` table on restart:

```sql
SELECT * FROM risk_state WHERE trader_id = 'your-trader-id';
```

Review audit history:

```sql
SELECT * FROM risk_state_history 
WHERE trader_id = 'your-trader-id' 
ORDER BY recorded_at DESC 
LIMIT 100;
```

## References

- [pgx Documentation](https://pkg.go.dev/github.com/jackc/pgx/v5)
- [golang-migrate](https://github.com/golang-migrate/migrate)
- [TimescaleDB](https://docs.timescale.com/)
