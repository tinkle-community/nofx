package db

import (
	"context"
	_ "embed"
	"errors"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"nofx/metrics"
)

//go:embed schema.sql
var schemaSQL string

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

// request encapsulates a persistence operation queued for asynchronous handling.
type request struct {
	state   *RiskState
	traceID string
	reason  string
}

// RiskStore persists risk state snapshots into TimescaleDB while providing an
// append-only history log for auditability. Persistence is best-effort: errors
// are logged but never propagated to callers so the trading loop continues even
// if the database is temporarily unavailable.
type RiskStore struct {
	pool       *pgxpool.Pool
	traderID   string
	queue      chan request
	wg         sync.WaitGroup
	cancel     context.CancelFunc
	once       sync.Once
	queueSize  int
	maxWorkers int
}

// NewRiskStore establishes the database connection, applies schema migrations
// and starts asynchronous workers that handle persistence. The dbPath parameter
// expects a PostgreSQL/TimescaleDB connection string. The store remains inert
// until a trader ID is bound via BindTrader.
func NewRiskStore(dbPath string) (*RiskStore, error) {
	if strings.TrimSpace(dbPath) == "" {
		return nil, errors.New("empty db connection string")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	pool, err := pgxpool.New(ctx, dbPath)
	cancel()
	if err != nil {
		return nil, fmt.Errorf("failed to connect to db: %w", err)
	}

	store := &RiskStore{
		pool:       pool,
		queueSize:  64,
		maxWorkers: 1,
	}

	if err := store.applySchema(); err != nil {
		pool.Close()
		return nil, fmt.Errorf("failed to apply schema: %w", err)
	}

	store.startWorkers()
	return store, nil
}

// BindTrader scopes the store to a trader identifier. BindTrader must be called
// before invoking Load or Save.
func (s *RiskStore) BindTrader(traderID string) {
	s.once.Do(func() {})
	s.traderID = traderID
}

func (s *RiskStore) startWorkers() {
	if s.queueSize <= 0 {
		s.queueSize = 64
	}

	s.queue = make(chan request, s.queueSize)
	ctx, cancel := context.WithCancel(context.Background())
	s.cancel = cancel

	workers := s.maxWorkers
	if workers <= 0 {
		workers = 1
	}

	s.wg.Add(workers)
	for i := 0; i < workers; i++ {
		go func() {
			defer s.wg.Done()
			s.worker(ctx)
		}()
	}
}

func (s *RiskStore) worker(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case req, ok := <-s.queue:
			if !ok {
				return
			}
			if req.state == nil {
				continue
			}
			start := time.Now()
			if err := s.persist(ctx, req); err != nil {
				log.Printf("⚠️  risk persistence failed for trader %s: %v", req.state.TraderID, err)
			}
			duration := time.Since(start)
			metricsObservePersist(req.state.TraderID, duration)
		}
	}
}

func (s *RiskStore) persist(ctx context.Context, req request) error {
	traderID := req.state.TraderID
	if traderID == "" {
		traderID = s.traderID
	}
	if strings.TrimSpace(traderID) == "" {
		return errors.New("missing trader id for persistence")
	}

	ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	attemptPersist(traderID)

	now := time.Now()
	state := req.state
	if state.UpdatedAt.IsZero() {
		state.UpdatedAt = now
	}

	upsertSQL := `
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

	_, err := s.pool.Exec(ctx, upsertSQL,
		traderID,
		state.DailyPnL,
		state.DrawdownPct,
		state.CurrentEquity,
		state.PeakEquity,
		state.TradingPaused,
		nullableTime(state.PausedUntil),
		nullableTime(state.LastResetTime),
		state.UpdatedAt,
	)
	if err != nil {
		recordPersistFailure(traderID)
		return err
	}

	historySQL := `
        INSERT INTO risk_state_history (trader_id, trace_id, reason, daily_pnl, drawdown_pct, current_equity, peak_equity, trading_paused, paused_until, last_reset_time, recorded_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    `

	_, err = s.pool.Exec(ctx, historySQL,
		traderID,
		req.traceID,
		req.reason,
		state.DailyPnL,
		state.DrawdownPct,
		state.CurrentEquity,
		state.PeakEquity,
		state.TradingPaused,
		nullableTime(state.PausedUntil),
		nullableTime(state.LastResetTime),
		time.Now(),
	)
	if err != nil {
		recordPersistFailure(traderID)
		return err
	}

	return nil
}

// Load fetches the stored risk state for the bound trader. When no state exists,
// a zero-valued struct is returned with LastResetTime set to the current time.
func (s *RiskStore) Load() (*RiskState, error) {
	if strings.TrimSpace(s.traderID) == "" {
		return nil, errors.New("risk store trader id not bound")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	query := `
        SELECT daily_pnl, drawdown_pct, current_equity, peak_equity, trading_paused, paused_until, last_reset_time, updated_at
        FROM risk_state WHERE trader_id = $1
    `

	row := s.pool.QueryRow(ctx, query, s.traderID)
	state := &RiskState{TraderID: s.traderID}
	var pausedUntil *time.Time
	var lastReset *time.Time
	var updatedAt *time.Time
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
			now := time.Now()
			state.LastResetTime = now
			state.UpdatedAt = now
			return state, nil
		}
		if errors.Is(err, context.DeadlineExceeded) {
			return nil, err
		}
		return nil, err
	}

	if pausedUntil != nil {
		state.PausedUntil = *pausedUntil
	}
	if lastReset != nil {
		state.LastResetTime = *lastReset
	}
	if updatedAt != nil {
		state.UpdatedAt = *updatedAt
	}
	return state, nil
}

// Save enqueues the provided risk state for asynchronous persistence. The
// operation never blocks the caller; if the queue is full, the request is
// dropped and logged, preserving the trading loop's latency budget.
func (s *RiskStore) Save(state *RiskState, traceID, reason string) error {
	if state == nil {
		return errors.New("nil risk state")
	}
	if state.TraderID == "" {
		state.TraderID = s.traderID
	}
	if strings.TrimSpace(state.TraderID) == "" {
		return errors.New("missing trader id")
	}

	if traceID == "" {
		traceID = uuid.NewString()
	}

	req := request{state: state, traceID: traceID, reason: reason}

	select {
	case s.queue <- req:
		return nil
	default:
		log.Printf("⚠️  dropping risk persistence request for trader %s: queue full", state.TraderID)
		return errors.New("risk persistence queue full")
	}
}

// Close drains the pending queue and shuts down workers. Callers should invoke
// Close during graceful shutdown.
func (s *RiskStore) Close() {
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

func (s *RiskStore) applySchema() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	statements := strings.Split(schemaSQL, ";")
	for _, stmt := range statements {
		sql := strings.TrimSpace(stmt)
		if sql == "" {
			continue
		}
		if _, err := s.pool.Exec(ctx, sql); err != nil {
			return fmt.Errorf("schema statement failed: %w", err)
		}
	}
	return nil
}

func nullableTime(ts time.Time) *time.Time {
	if ts.IsZero() {
		return nil
	}
	return &ts
}

func attemptPersist(traderID string) {
	metrics.IncRiskPersistenceAttempts(traderID)
}

func recordPersistFailure(traderID string) {
	metrics.IncRiskPersistenceFailures(traderID)
}

func metricsObservePersist(traderID string, duration time.Duration) {
	metrics.ObserveRiskPersistLatency(traderID, duration)
}
