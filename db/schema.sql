-- TimescaleDB (PostgreSQL extension) schema for risk state persistence
-- This schema ensures risk state survives restarts and provides audit history.

CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Single-row snapshot table: current risk state per trader
CREATE TABLE IF NOT EXISTS risk_state (
    trader_id VARCHAR(255) PRIMARY KEY,
    daily_pnl DOUBLE PRECISION NOT NULL DEFAULT 0,
    drawdown_pct DOUBLE PRECISION NOT NULL DEFAULT 0,
    current_equity DOUBLE PRECISION NOT NULL DEFAULT 0,
    peak_equity DOUBLE PRECISION NOT NULL DEFAULT 0,
    trading_paused BOOLEAN NOT NULL DEFAULT FALSE,
    paused_until TIMESTAMPTZ,
    last_reset_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Append-only history table: trace all risk state transitions
CREATE TABLE IF NOT EXISTS risk_state_history (
    id BIGSERIAL,
    trader_id VARCHAR(255) NOT NULL,
    trace_id VARCHAR(255),
    reason VARCHAR(1024),
    daily_pnl DOUBLE PRECISION NOT NULL,
    drawdown_pct DOUBLE PRECISION NOT NULL,
    current_equity DOUBLE PRECISION NOT NULL,
    peak_equity DOUBLE PRECISION NOT NULL,
    trading_paused BOOLEAN NOT NULL,
    paused_until TIMESTAMPTZ,
    last_reset_time TIMESTAMPTZ NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (recorded_at, id)
);

-- Convert history table to hypertable for efficient time-series operations
SELECT create_hypertable('risk_state_history', 'recorded_at', if_not_exists => TRUE);

-- Index for fast trader lookups
CREATE INDEX IF NOT EXISTS idx_risk_state_history_trader ON risk_state_history (trader_id, recorded_at DESC);
