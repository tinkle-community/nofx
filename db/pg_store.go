package db

import (
    "context"
    "embed"
    "errors"
    "fmt"
    "log"
    "math"
    "math/rand"
    "strings"
    "sync"
    "sync/atomic"
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

// FloatOption toggles an optional float update when applying deltas.
type FloatOption struct {
    Set   bool
    Value float64
}

// BoolOption toggles an optional boolean update when applying deltas.
type BoolOption struct {
    Set   bool
    Value bool
}

// TimeOption toggles an optional time update when applying deltas.
type TimeOption struct {
    Set   bool
    Value time.Time
}

// DailyDelta captures incremental changes applied atomically inside the database.
type DailyDelta struct {
    DailyPnL      float64
    Equity        float64
    DrawdownPct   FloatOption
    TradingPaused BoolOption
    PausedUntil   TimeOption
    LastResetTime TimeOption
    UpdatedAt     time.Time
    TraceID       string
    Reason        string
}

func (d *DailyDelta) clone() DailyDelta {
    if d == nil {
        return DailyDelta{}
    }
    cloned := *d
    return cloned
}

func (d *DailyDelta) accumulate(other DailyDelta) {
    d.DailyPnL += other.DailyPnL
    d.Equity += other.Equity
    if other.DrawdownPct.Set {
        d.DrawdownPct = other.DrawdownPct
    }
    if other.TradingPaused.Set {
        d.TradingPaused = other.TradingPaused
    }
    if other.PausedUntil.Set {
        d.PausedUntil = other.PausedUntil
    }
    if other.LastResetTime.Set {
        d.LastResetTime = other.LastResetTime
    }
    if other.UpdatedAt.After(d.UpdatedAt) {
        d.UpdatedAt = other.UpdatedAt
    }
    if other.Reason != "" {
        if d.Reason == "" {
            d.Reason = other.Reason
        } else {
            d.Reason = strings.Join([]string{d.Reason, other.Reason}, "; ")
        }
    }
    if other.TraceID != "" {
        d.TraceID = other.TraceID
    }
}

func (d *DailyDelta) normalize(now time.Time) {
    if now.IsZero() {
        now = time.Now().UTC()
    }
    if d.UpdatedAt.IsZero() {
        d.UpdatedAt = now
    } else {
        d.UpdatedAt = d.UpdatedAt.UTC()
    }

    if d.LastResetTime.Set {
        if d.LastResetTime.Value.IsZero() {
            d.LastResetTime.Value = now
        }
        d.LastResetTime.Value = d.LastResetTime.Value.UTC()
    }

    if d.PausedUntil.Set && !d.PausedUntil.Value.IsZero() {
        d.PausedUntil.Value = d.PausedUntil.Value.UTC()
    }
}

type request struct {
    traderID string
    state    *RiskState
    delta    *DailyDelta
    traceID  string
    reason   string
}

type aggregatedOp struct {
    traderID string
    state    *RiskState
    delta    *DailyDelta
    traceIDs []string
    reasons  []string
}

type aggregatedSequence struct {
    ops []aggregatedOp
}

func (seq *aggregatedSequence) append(req request) {
    if req.delta != nil {
        deltaCopy := req.delta.clone()
        if len(seq.ops) > 0 {
            last := &seq.ops[len(seq.ops)-1]
            if last.delta != nil && last.state == nil {
                last.delta.accumulate(deltaCopy)
                if req.traceID != "" {
                    last.traceIDs = append(last.traceIDs, req.traceID)
                }
                if req.reason != "" {
                    last.reasons = append(last.reasons, req.reason)
                }
                return
            }
        }
        seq.ops = append(seq.ops, aggregatedOp{
            traderID: req.traderID,
            delta:    &deltaCopy,
            traceIDs: nonEmptyList(req.traceID),
            reasons:  nonEmptyList(req.reason),
        })
        return
    }

    if req.state == nil {
        return
    }

    stateCopy := *req.state
    seq.ops = append(seq.ops, aggregatedOp{
        traderID: req.traderID,
        state:    &stateCopy,
        traceIDs: nonEmptyList(req.traceID),
        reasons:  nonEmptyList(req.reason),
    })
}

// RiskStorePG persists risk state snapshots into PostgreSQL/TimescaleDB with
// buffered asynchronous writes and automatic migrations.
type RiskStorePG struct {
    pool *pgxpool.Pool
    once sync.Once

    trader string

    queue chan request
    wg    sync.WaitGroup

    queueSize      int
    batchSize      int
    flushInterval  time.Duration
    maxRetries     int
    backoffBase    time.Duration
    backoffCap     time.Duration
    enqueueTimeout time.Duration
    drainTimeout   time.Duration

    closing       atomic.Bool
    closeOnce     sync.Once
    poolCloseOnce sync.Once
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
    defer cancel()

    pool, err := pgxpool.New(ctx, connURL)
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
    s.wg.Add(1)
    go s.worker()
}

func (s *RiskStorePG) worker() {
    defer s.wg.Done()

    ticker := time.NewTicker(s.flushInterval)
    defer ticker.Stop()

    buffer := make([]request, 0, s.batchSize)

    flush := func(ctx context.Context) {
        if len(buffer) == 0 {
            return
        }
        batch := append([]request(nil), buffer...)
        buffer = buffer[:0]

        start := time.Now()
        if err := s.persistBatchWithRetry(ctx, batch); err != nil {
            log.Printf("⚠️  risk persistence batch failed (trader=%s, size=%d): %v", s.trader, len(batch), err)
        }
        duration := time.Since(start)
        for _, req := range batch {
            metrics.ObserveRiskPersistLatencyWithBackend(req.traderID, duration, backendPostgres)
        }
    }

    for {
        select {
        case req, ok := <-s.queue:
            if !ok {
                drainCtx, cancel := context.WithTimeout(context.Background(), s.drainTimeout)
                flush(drainCtx)
                cancel()
                return
            }
            buffer = append(buffer, req)
            if len(buffer) >= s.batchSize {
                flush(context.Background())
            }
        case <-ticker.C:
            flush(context.Background())
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
            if err := s.waitBackoff(ctx, attempt); err != nil {
                return err
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

    committed := false
    defer func() {
        if !committed {
            _ = tx.Rollback(context.Background())
        }
    }()

    ops := coalesceRequests(batch)
    now := time.Now().UTC()

    for _, op := range ops {
        incrementAttempts(op)

        if op.delta != nil {
            if err := s.applyDeltaTx(execCtx, tx, op, now); err != nil {
                recordFailure(op)
                return err
            }
            continue
        }

        if op.state != nil {
            if err := s.persistSnapshotTx(execCtx, tx, op, now); err != nil {
                recordFailure(op)
                return err
            }
        }
    }

    if err := tx.Commit(execCtx); err != nil {
        for _, op := range ops {
            recordFailure(op)
        }
        return fmt.Errorf("commit risk_state batch: %w", err)
    }

    committed = true
    return nil
}

func coalesceRequests(batch []request) []aggregatedOp {
    sequences := make(map[string]*aggregatedSequence)
    order := make([]string, 0, len(batch))

    for _, req := range batch {
        seq, exists := sequences[req.traderID]
        if !exists {
            seq = &aggregatedSequence{}
            sequences[req.traderID] = seq
            order = append(order, req.traderID)
        }
        seq.append(req)
    }

    aggregated := make([]aggregatedOp, 0, len(batch))
    for _, traderID := range order {
        seq := sequences[traderID]
        aggregated = append(aggregated, seq.ops...)
    }

    return aggregated
}

func incrementAttempts(op aggregatedOp) {
    count := len(op.traceIDs)
    if count == 0 {
        count = 1
    }
    for i := 0; i < count; i++ {
        metrics.IncRiskPersistenceAttemptsWithBackend(op.traderID, backendPostgres)
    }
}

func recordFailure(op aggregatedOp) {
    count := len(op.traceIDs)
    if count == 0 {
        count = 1
    }
    for i := 0; i < count; i++ {
        metrics.IncRiskPersistenceFailuresWithBackend(op.traderID, backendPostgres)
    }
}

func (s *RiskStorePG) applyDeltaTx(ctx context.Context, tx pgx.Tx, op aggregatedOp, now time.Time) error {
    if op.delta == nil {
        return nil
    }

    delta := op.delta.clone()
    delta.normalize(now)

    pausedUntilSet := delta.PausedUntil.Set
    var pausedUntil any
    if pausedUntilSet {
        if delta.PausedUntil.Value.IsZero() {
            pausedUntil = nil
        } else {
            pausedUntil = delta.PausedUntil.Value.UTC()
        }
    } else {
        pausedUntil = nil
    }

    lastResetSet := delta.LastResetTime.Set
    lastReset := delta.LastResetTime.Value
    if lastResetSet {
        if lastReset.IsZero() {
            lastReset = now
        }
        lastReset = lastReset.UTC()
    } else {
        lastReset = now
    }

    drawdownSet := delta.DrawdownPct.Set
    drawdown := delta.DrawdownPct.Value

    tradingSet := delta.TradingPaused.Set
    trading := delta.TradingPaused.Value

    updatedAt := delta.UpdatedAt
    if updatedAt.IsZero() {
        updatedAt = now
    }
    updatedAt = updatedAt.UTC()

    peakInitial := math.Max(0, delta.Equity)

    traceID := delta.TraceID
    if traceID == "" {
        traceID = joinStrings(op.traceIDs)
    }
    if traceID == "" {
        traceID = uuid.NewString()
    }

    reason := delta.Reason
    if reason == "" {
        reason = joinStrings(op.reasons)
    }
    if reason == "" {
        reason = "delta_update"
    }

    const deltaSQL = `
        WITH upsert AS (
            INSERT INTO risk_state (
                trader_id,
                daily_pnl,
                drawdown_pct,
                current_equity,
                peak_equity,
                trading_paused,
                paused_until,
                last_reset_time,
                updated_at
            )
            VALUES ($1,$2,$4,$3,$5,$6,$7,$8,$9)
            ON CONFLICT (trader_id) DO UPDATE SET
                daily_pnl = risk_state.daily_pnl + EXCLUDED.daily_pnl,
                drawdown_pct = CASE WHEN $10 THEN EXCLUDED.drawdown_pct ELSE risk_state.drawdown_pct END,
                current_equity = risk_state.current_equity + EXCLUDED.current_equity,
                peak_equity = GREATEST(risk_state.peak_equity, risk_state.current_equity + EXCLUDED.current_equity),
                trading_paused = CASE WHEN $11 THEN EXCLUDED.trading_paused ELSE risk_state.trading_paused END,
                paused_until = CASE WHEN $12 THEN EXCLUDED.paused_until ELSE risk_state.paused_until END,
                last_reset_time = CASE WHEN $13 THEN EXCLUDED.last_reset_time ELSE risk_state.last_reset_time END,
                updated_at = EXCLUDED.updated_at
            RETURNING trader_id, daily_pnl, drawdown_pct, current_equity, peak_equity, trading_paused, paused_until, last_reset_time, updated_at
        ),
        history AS (
            INSERT INTO risk_state_history (
                trader_id,
                trace_id,
                reason,
                daily_pnl,
                drawdown_pct,
                current_equity,
                peak_equity,
                trading_paused,
                paused_until,
                last_reset_time,
                recorded_at
            )
            SELECT trader_id, $14, $15, daily_pnl, drawdown_pct, current_equity, peak_equity, trading_paused, paused_until, last_reset_time, $16
            FROM upsert
        )
        SELECT trader_id FROM upsert
    `

    if _, err := tx.Exec(ctx, deltaSQL,
        op.traderID,
        delta.DailyPnL,
        delta.Equity,
        drawdown,
        peakInitial,
        trading,
        pausedUntil,
        lastReset,
        updatedAt,
        drawdownSet,
        tradingSet,
        pausedUntilSet,
        lastResetSet,
        traceID,
        reason,
        updatedAt,
    ); err != nil {
        return fmt.Errorf("apply delta: %w", err)
    }

    return nil
}

func (s *RiskStorePG) persistSnapshotTx(ctx context.Context, tx pgx.Tx, op aggregatedOp, now time.Time) error {
    if op.state == nil {
        return nil
    }

    state := *op.state
    sanitizeRiskStateTimes(&state, now)
    if state.PeakEquity < state.CurrentEquity {
        state.PeakEquity = state.CurrentEquity
    }

    traceID := joinStrings(op.traceIDs)
    if traceID == "" {
        traceID = uuid.NewString()
    }

    reason := joinStrings(op.reasons)
    if reason == "" {
        reason = "snapshot"
    }

    const upsertSQL = `
        INSERT INTO risk_state (
            trader_id,
            daily_pnl,
            drawdown_pct,
            current_equity,
            peak_equity,
            trading_paused,
            paused_until,
            last_reset_time,
            updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (trader_id)
        DO UPDATE SET
            daily_pnl = EXCLUDED.daily_pnl,
            drawdown_pct = EXCLUDED.drawdown_pct,
            current_equity = EXCLUDED.current_equity,
            peak_equity = GREATEST(risk_state.peak_equity, EXCLUDED.peak_equity),
            trading_paused = EXCLUDED.trading_paused,
            paused_until = EXCLUDED.paused_until,
            last_reset_time = EXCLUDED.last_reset_time,
            updated_at = EXCLUDED.updated_at
    `

    const historySQL = `
        INSERT INTO risk_state_history (
            trader_id,
            trace_id,
            reason,
            daily_pnl,
            drawdown_pct,
            current_equity,
            peak_equity,
            trading_paused,
            paused_until,
            last_reset_time,
            recorded_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `

    if _, err := tx.Exec(ctx, upsertSQL,
        op.traderID,
        state.DailyPnL,
        state.DrawdownPct,
        state.CurrentEquity,
        state.PeakEquity,
        state.TradingPaused,
        nullableTime(state.PausedUntil),
        state.LastResetTime,
        state.UpdatedAt,
    ); err != nil {
        return fmt.Errorf("upsert risk_state: %w", err)
    }

    if _, err := tx.Exec(ctx, historySQL,
        op.traderID,
        traceID,
        reason,
        state.DailyPnL,
        state.DrawdownPct,
        state.CurrentEquity,
        state.PeakEquity,
        state.TradingPaused,
        nullableTime(state.PausedUntil),
        state.LastResetTime,
        now,
    ); err != nil {
        return fmt.Errorf("insert risk_state_history: %w", err)
    }

    return nil
}

func joinStrings(items []string) string {
    filtered := make([]string, 0, len(items))
    for _, item := range items {
        trimmed := strings.TrimSpace(item)
        if trimmed != "" {
            filtered = append(filtered, trimmed)
        }
    }
    return strings.Join(filtered, "; ")
}

func nonEmptyList(value string) []string {
    trimmed := strings.TrimSpace(value)
    if trimmed == "" {
        return nil
    }
    return []string{trimmed}
}

func (s *RiskStorePG) waitBackoff(ctx context.Context, attempt int) error {
    backoff := time.Duration(float64(s.backoffBase) * math.Pow(2, float64(attempt-1)))
    if backoff > s.backoffCap {
        backoff = s.backoffCap
    }
    jitter := time.Duration(rand.Float64() * float64(backoff) * 0.5)
    delay := backoff + jitter

    timer := time.NewTimer(delay)
    defer timer.Stop()

    select {
    case <-ctx.Done():
        return ctx.Err()
    case <-timer.C:
        return nil
    }
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
        traderID = strings.TrimSpace(s.trader)
    }
    if traderID == "" {
        return errors.New("missing trader id")
    }

    if s.closing.Load() {
        return errors.New("risk persistence shutting down")
    }

    snapshot := *state
    snapshot.TraderID = traderID
    sanitizeRiskStateTimes(&snapshot, time.Now().UTC())

    if traceID == "" {
        traceID = uuid.NewString()
    }

    req := request{
        traderID: traderID,
        state:    &snapshot,
        traceID:  traceID,
        reason:   reason,
    }

    if s.enqueueTimeout <= 0 {
        select {
        case s.queue <- req:
            return nil
        default:
            metrics.IncRiskPersistenceFailuresWithBackend(traderID, backendPostgres)
            return fmt.Errorf("risk persistence queue full for trader %s", traderID)
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
    }
}

// SaveDelta applies an incremental update directly against PostgreSQL using an
// atomic read-modify-write statement.
func (s *RiskStorePG) SaveDelta(ctx context.Context, traderID string, delta DailyDelta) error {
    if ctx == nil {
        ctx = context.Background()
    }

    traderID = strings.TrimSpace(traderID)
    if traderID == "" {
        return errors.New("missing trader id")
    }

    if s.pool == nil {
        return errors.New("risk persistence not initialized")
    }

    if s.closing.Load() {
        return errors.New("risk persistence shutting down")
    }

    now := time.Now().UTC()
    delta.normalize(now)

    if delta.TraceID == "" {
        delta.TraceID = uuid.NewString()
    }
    if delta.Reason == "" {
        delta.Reason = "delta_update"
    }

    op := aggregatedOp{
        traderID: traderID,
        delta:    &delta,
        traceIDs: []string{delta.TraceID},
        reasons:  []string{delta.Reason},
    }

    retries := s.maxRetries
    if retries < 0 {
        retries = 0
    }

    var lastErr error
    for attempt := 0; attempt <= retries; attempt++ {
        incrementAttempts(op)
        if attempt > 0 {
            if err := s.waitBackoff(ctx, attempt); err != nil {
                return err
            }
        }

        execCtx, cancel := context.WithTimeout(ctx, defaultOperationDeadline)
        tx, err := s.pool.BeginTx(execCtx, pgx.TxOptions{})
        if err != nil {
            cancel()
            lastErr = fmt.Errorf("begin tx: %w", err)
            continue
        }

        if err := s.applyDeltaTx(execCtx, tx, op, now); err != nil {
            _ = tx.Rollback(context.Background())
            cancel()
            recordFailure(op)
            lastErr = err
            continue
        }

        if err := tx.Commit(execCtx); err != nil {
            _ = tx.Rollback(context.Background())
            cancel()
            recordFailure(op)
            lastErr = fmt.Errorf("commit delta: %w", err)
            continue
        }

        cancel()
        return nil
    }

    return lastErr
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

// Close drains pending requests and releases resources. The provided context
// controls how long the store waits for outstanding writes before aborting.
func (s *RiskStorePG) Close(ctx context.Context) error {
    if ctx == nil {
        ctx = context.Background()
    }

    s.closeOnce.Do(func() {
        s.closing.Store(true)
        if s.queue != nil {
            close(s.queue)
        }
    })

    done := make(chan struct{})
    go func() {
        s.wg.Wait()
        s.poolCloseOnce.Do(func() {
            if s.pool != nil {
                s.pool.Close()
            }
        })
        close(done)
    }()

    select {
    case <-ctx.Done():
        s.poolCloseOnce.Do(func() {
            if s.pool != nil {
                s.pool.Close()
            }
        })
        log.Printf("❌ risk persistence close timed out: %v", ctx.Err())
        return ctx.Err()
    case <-done:
        return nil
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
