CREATE TABLE IF NOT EXISTS risk_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    daily_pnl REAL NOT NULL DEFAULT 0,
    peak_balance REAL NOT NULL DEFAULT 0,
    current_balance REAL NOT NULL DEFAULT 0,
    last_reset_time TEXT,
    stop_until TEXT,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS risk_state_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trace_id TEXT,
    reason TEXT,
    daily_pnl REAL,
    peak_balance REAL,
    current_balance REAL,
    last_reset_time TEXT,
    stop_until TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_risk_history_created_at ON risk_state_history (created_at DESC);
