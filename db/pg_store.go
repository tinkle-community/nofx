package db

import (
    "context"
    "embed"
    "errors"
    "fmt"
    "log"
    "math"
    "strings"
    "sync"
    "time"

    "github.com/golang-migrate/migrate/v4"
    _ "github.com/golang-migrate/migrate/v4/database/postgres"
    "github.com/golang-migrate/migrate/v4/source/iofs"
    "github.com/google/uuid"
    "github.com/jackc/pgx/v5"
    "github.com/jackc/pgx/v5/pgxpool"

    "nofx/metrics"
)

//go:embed migrations/*.sql
var migrationFiles embed.FS

const (
    backendPostgres          = metrics.BackendPostgres
    defaultQueueSize         = 512
    defaultBatchSize         = 32
    defaultFlushInterval     = 200 * time.Millisecond
    defaultMaxRetries        = 5
    defaultBackoffBase       = 150 * time.Millisecond
    defaultBackoffCap        = 3 * time.Second
    defaultEnqueueTimeout    = 10 * time.Second
    defaultDrainTimeout      = 30 * time.Second
    defaultOperationDeadline = 10 * time.Second
)

// RiskState represents the persisted risk state for a trader.
type RiskState struct {
    TraderID      string
    DailyPnL      float64
    DrawdownPct   float64
    CurrentEquity float64
    PeakEquity    float64
    TradingPaused bool
    PausedUntil   time.Time
    LastResetTime time.Time
    UpdatedAt     time.Time
}

type request struct {
    state   RiskState
    traceID string
    reason  string
}

// RiskStorePG persists risk state snapshots into PostgreSQL/TimescaleDB with
// buffered asynchronous writes and automatic migrations.
type RiskStorePG struct {
    pool   *pgxpool.Pool
    once   sync.Once
    trader string

    queue  chan request
    ctx    context.Context
    cancel context.CancelFunc
    wg     sync.WaitGroup

    queueSize      int
    batchSize      int
    flushInterval  time.Duration
    maxRetries     int
    backoffBase    time.Duration
    backoffCap     time.Duration
    enqueueTimeout time.Duration
    drainTimeout   time.Duration
}

// NewRiskStorePG wires a PostgreSQL-backed persistence layer. On failure the
// caller can fall back to in-memory storage.
func NewRiskStorePG(connURL string) (*RiskStorePG, error) {
    if strings.TrimSpace(connURL) == "" {
        return nil, errors.New("empty db connection string")
    }

    if err := runMigrations(connURL); err != nil {
        return nil, fmt.Errorf("apply migrations: %w", err)
    }

    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    pool, err := pgxpool.New(ctx, connURL)
    cancel()
    if err != nil {
        return nil, fmt.Errorf("connect postgres: %w", err)
    }

    store := &RiskStorePG{
        pool:           pool,
        queueSize:      defaultQueueSize,
        batchSize:      defaultBatchSize,
        flushInterval:  defaultFlushInterval,
        maxRetries:     defaultMaxRetries,
        backoffBase:    defaultBackoffBase,
        backoffCap:     defaultBackoffCap,
        enqueueTimeout: defaultEnqueueTimeout,
        drainTimeout:   defaultDrainTimeout,
    }

    store.startWorkers()
    return store, nil
}

// BindTrader pins the persistence scope to a trader identifier.
func (s *RiskStorePG) BindTrader(traderID string) {
    s.once.Do(func() {})
    s.trader = traderID
}

func (s *RiskStorePG) startWorkers() {
    if s.queueSize <= 0 {
        s.queueSize = defaultQueueSize
    }
    if s.batchSize <= 0 {
        s.batchSize = defaultBatchSize
    }
    if s.flushInterval <= 0 {
        s.flushInterval = defaultFlushInterval
    }
    if s.maxRetries < 0 {
        s.maxRetries = defaultMaxRetries
    }
    if s.backoffBase <= 0 {
        s.backoffBase = defaultBackoffBase
    }
    if s.backoffCap <= 0 {
        s.backoffCap = defaultBackoffCap
    }
    if s.enqueueTimeout < 0 {
        s.enqueueTimeout = defaultEnqueueTimeout
    }
    if s.drainTimeout <= 0 {
        s.drainTimeout = defaultDrainTimeout
    }

    s.queue = make(chan request, s.queueSize)
    ctx, cancel := context.WithCancel(context.Background())
    s.ctx = ctx
    s.cancel = cancel

    s.wg.Add(1)
    go s.worker()
}

func (s *RiskStorePG) worker() {
    defer s.wg.Done()

    ticker := time.NewTicker(s.flushInterval)
    defer ticker.Stop()

    buffer := make([]request, 0, s.batchSize)

    flush := func(flushCtx context.Context) {
        if len(buffer) == 0 {
            return
        }

        batch := append([]request(nil), buffer...)
        buffer = buffer[:0]

        start := time.Now()
        if err := s.persistBatchWithRetry(flushCtx, batch); err != nil {
            log.Printf("⚠️  risk persistence batch failed (trader=%s, size=%d): %v", s.trader, len(batch), err)
        }
        duration := time.Since(start)
        for _, req := range batch {
            metrics.ObserveRiskPersistLatencyWithBackend(req.state.TraderID, duration, backendPostgres)
        }
    }

    for {
        select {
        case <-s.ctx.Done():
            drainCtx, cancel := context.WithTimeout(context.Background(), s.drainTimeout)
            flush(drainCtx)
            cancel()
            return
        case req, ok := <-s.queue:
            if !ok {
                drainCtx, cancel := context.WithTimeout(context.Background(), s.drainTimeout)
                flush(drainCtx)
                cancel()
                return
            }
            buffer = append(buffer, req)
            if len(buffer) >= s.batchSize {
                flush(s.ctx)
            }
        case <-ticker.C:
            flush(s.ctx)
        }
    }
}

func (s *RiskStorePG) persistBatchWithRetry(ctx context.Context, batch []request) error {
    if len(batch) == 0 {
        return nil
    }

    retries := s.maxRetries
    if retries < 0 {
        retries = 0
    }

    var lastErr error
    for attempt := 0; attempt <= retries; attempt++ {
        if attempt > 0 {
            backoff := time.Duration(float64(s.backoffBase) * math.Pow(2, float64(attempt-1)))
            if backoff > s.backoffCap {
                backoff = s.backoffCap
            }
            select {
            case <-ctx.Done():
                return ctx.Err()
            case <-time.After(backoff):
            }
        }

        if err := s.persistBatchOnce(ctx, batch); err != nil {
            lastErr = err
            continue
        }
        return nil
    }
    return lastErr
}

func (s *RiskStorePG) persistBatchOnce(ctx context.Context, batch []request) error {
    execCtx, cancel := context.WithTimeout(ctx, defaultOperationDeadline)
    defer cancel()

    tx, err := s.pool.BeginTx(execCtx, pgx.TxOptions{})
    if err != nil {
        return fmt.Errorf("begin tx: %w", err)
    }

    defer func() {
        if err != nil {
            _ = tx.Rollback(context.Background())
        }
    }()

    const upsertSQL = `
        INSERT INTO risk_state (trader_id, daily_pnl, drawdown_pct, current_equity, peak_equity, trading_paused, paused_until, last_reset_time, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (trader_id)
        DO UPDATE SET
            daily_pnl = EXCLUDED.daily_pnl,
            drawdown_pct = EXCLUDED.drawdown_pct,
            current_equity = EXCLUDED.current_equity,
            peak_equity = EXCLUDED.peak_equity,
            trading_paused = EXCLUDED.trading_paused,
            paused_until = EXCLUDED.paused_until,
            last_reset_time = EXCLUDED.last_reset_time,
            updated_at = EXCLUDED.updated_at
    `

    const historySQL = `
        INSERT INTO risk_state_history (trader_id, trace_id, reason, daily_pnl, drawdown_pct, current_equity, peak_equity, trading_paused, paused_until, last_reset_time, recorded_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `

    now := time.Now().UTC()

    for _, req := range batch {
        state := req.state
        traderID := state.TraderID
        if traderID == "" {
            traderID = s.trader
        }
        traderID = strings.TrimSpace(traderID)
        if traderID == "" {
            return errors.New("missing trader id")
        }

        metrics.IncRiskPersistenceAttemptsWithBackend(traderID, backendPostgres)

        sanitizeRiskStateTimes(&state, now)
        if req.traceID == "" {
            req.traceID = uuid.NewString()
        }

        if _, err := tx.Exec(execCtx, upsertSQL,
            traderID,
            state.DailyPnL,
            state.DrawdownPct,
            state.CurrentEquity,
            state.PeakEquity,
            state.TradingPaused,
            nullableTime(state.PausedUntil),
            state.LastResetTime,
            state.UpdatedAt,
        ); err != nil {
            metrics.IncRiskPersistenceFailuresWithBackend(traderID, backendPostgres)
            return fmt.Errorf("upsert risk_state: %w", err)
        }

        if _, err := tx.Exec(execCtx, historySQL,
            traderID,
            req.traceID,
            req.reason,
            state.DailyPnL,
            state.DrawdownPct,
            state.CurrentEquity,
            state.PeakEquity,
            state.TradingPaused,
            nullableTime(state.PausedUntil),
            state.LastResetTime,
            now,
        ); err != nil {
            metrics.IncRiskPersistenceFailuresWithBackend(traderID, backendPostgres)
            return fmt.Errorf("insert risk_state_history: %w", err)
        }
    }

    if err := tx.Commit(execCtx); err != nil {
        for _, req := range batch {
            traderID := req.state.TraderID
            if traderID == "" {
                traderID = s.trader
            }
            metrics.IncRiskPersistenceFailuresWithBackend(strings.TrimSpace(traderID), backendPostgres)
        }
        return fmt.Errorf("commit risk_state batch: %w", err)
    }

    return nil
}

// Load retrieves the latest persisted snapshot for the bound trader.
func (s *RiskStorePG) Load() (*RiskState, error) {
    traderID := strings.TrimSpace(s.trader)
    if traderID == "" {
        return nil, errors.New("risk store trader id not bound")
    }

    ctx, cancel := context.WithTimeout(context.Background(), defaultOperationDeadline)
    defer cancel()

    const query = `
        SELECT daily_pnl, drawdown_pct, current_equity, peak_equity, trading_paused, paused_until, last_reset_time, updated_at
        FROM risk_state WHERE trader_id = $1
    `

    row := s.pool.QueryRow(ctx, query, traderID)
    state := &RiskState{TraderID: traderID}
    var pausedUntil, lastReset, updatedAt *time.Time

    if err := row.Scan(
        &state.DailyPnL,
        &state.DrawdownPct,
        &state.CurrentEquity,
        &state.PeakEquity,
        &state.TradingPaused,
        &pausedUntil,
        &lastReset,
        &updatedAt,
    ); err != nil {
        if errors.Is(err, pgx.ErrNoRows) {
            now := time.Now().UTC()
            state.LastResetTime = now
            state.UpdatedAt = now
            return state, nil
        }
        return nil, err
    }

    now := time.Now().UTC()

    if pausedUntil != nil {
        state.PausedUntil = *pausedUntil
    }

    needsBackfill := lastReset == nil
    if lastReset != nil && !lastReset.IsZero() {
        state.LastResetTime = *lastReset
    } else {
        // Backfill: last_reset_time should never be NULL post-migration
        // but if it is, set to now and persist
        state.LastResetTime = now
        needsBackfill = true
        log.Printf("⚠️  risk persistence: backfilling NULL last_reset_time for trader %s", traderID)
    }
    if updatedAt != nil {
        state.UpdatedAt = *updatedAt
    } else {
        state.UpdatedAt = now
    }

    sanitizeRiskStateTimes(state, now)

    if needsBackfill {
        updateCtx, updateCancel := context.WithTimeout(context.Background(), defaultOperationDeadline)
        defer updateCancel()
        if _, err := s.pool.Exec(updateCtx, `UPDATE risk_state SET last_reset_time = $1 WHERE trader_id = $2`, state.LastResetTime, traderID); err != nil {
            log.Printf("⚠️  risk persistence: failed to backfill last_reset_time for trader %s: %v", traderID, err)
        }
    }

    return state, nil
}

// Save buffers a snapshot for persistence, applying backpressure when the
// backlog grows.
func (s *RiskStorePG) Save(state *RiskState, traceID, reason string) (err error) {
    defer func() {
        if r := recover(); r != nil {
            err = errors.New("risk persistence shutting down")
        }
    }()

    if state == nil {
        return errors.New("nil risk state")
    }

    traderID := strings.TrimSpace(state.TraderID)
    if traderID == "" {
        traderID = s.trader
    }
    if traderID == "" {
        return errors.New("missing trader id")
    }

    snapshot := *state
    snapshot.TraderID = traderID

    sanitizeRiskStateTimes(&snapshot, time.Now().UTC())

    if traceID == "" {
        traceID = uuid.NewString()
    }

    req := request{state: snapshot, traceID: traceID, reason: reason}

    select {
    case <-s.ctx.Done():
        return errors.New("risk persistence shutting down")
    default:
    }

    if s.enqueueTimeout <= 0 {
        select {
        case s.queue <- req:
            return nil
        case <-s.ctx.Done():
            return errors.New("risk persistence shutting down")
        }
    }

    timer := time.NewTimer(s.enqueueTimeout)
    defer timer.Stop()

    select {
    case s.queue <- req:
        return nil
    case <-timer.C:
        metrics.IncRiskPersistenceFailuresWithBackend(traderID, backendPostgres)
        log.Printf("⚠️  risk persistence enqueue timeout (trader=%s)", traderID)
        return fmt.Errorf("risk persistence enqueue timeout for trader %s", traderID)
    case <-s.ctx.Done():
        return errors.New("risk persistence shutting down")
    }
}

// Close drains pending requests and releases resources.
func (s *RiskStorePG) Close() {
    if s.cancel != nil {
        s.cancel()
    }
    if s.queue != nil {
        close(s.queue)
    }
    s.wg.Wait()
    if s.pool != nil {
        s.pool.Close()
    }
}

func runMigrations(connURL string) error {
    sourceDriver, err := iofs.New(migrationFiles, "migrations")
    if err != nil {
        return fmt.Errorf("load migrations: %w", err)
    }

    migrator, err := migrate.NewWithSourceInstance("iofs", sourceDriver, connURL)
    if err != nil {
        return fmt.Errorf("init migrate: %w", err)
    }
    defer func() {
        srcErr, dbErr := migrator.Close()
        if srcErr != nil {
            log.Printf("⚠️  migrate source close: %v", srcErr)
        }
        if dbErr != nil {
            log.Printf("⚠️  migrate db close: %v", dbErr)
        }
    }()

    if err := migrator.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
        return err
    }

    log.Printf("✓ Database migrations applied successfully")
    return nil
}

func nullableTime(ts time.Time) *time.Time {
    if ts.IsZero() {
        return nil
    }
    utc := ts.UTC()
    return &utc
}

// sanitizeRiskStateTimes normalizes timestamps to satisfy database constraints.
// - last_reset_time must never be zero (NOT NULL in DB)
// - updated_at should always be populated (NOT NULL in DB)
// - paused_until remains optional (NULL when zero)
func sanitizeRiskStateTimes(state *RiskState, now time.Time) {
    if state == nil {
        return
    }

    if state.LastResetTime.IsZero() {
        state.LastResetTime = now
    } else {
        state.LastResetTime = state.LastResetTime.UTC()
    }

    if state.PausedUntil.IsZero() {
        state.PausedUntil = time.Time{}
    } else {
        state.PausedUntil = state.PausedUntil.UTC()
    }

    if state.UpdatedAt.IsZero() {
        state.UpdatedAt = now
    } else {
        state.UpdatedAt = state.UpdatedAt.UTC()
    }
}

// Backwards compatibility exports for legacy callers.
type RiskStore = RiskStorePG

var NewRiskStore = NewRiskStorePG
