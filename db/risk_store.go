package db

import (
	"database/sql"
	_ "embed"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	_ "github.com/mattn/go-sqlite3"

	"nofx/metrics"
)

//go:embed schema.sql
var schemaSQL string

// RiskState captures the persisted risk state for a trader.
type RiskState struct {
	TraderID       string
	DailyPnL       float64
	PeakBalance    float64
	CurrentBalance float64
	LastResetTime  time.Time
	StopUntil      time.Time
	UpdatedAt      time.Time
}

type persistTask struct {
	state   RiskState
	traceID string
	reason  string
}

// RiskStore provides asynchronous persistence for risk state snapshots.
type RiskStore struct {
	db     *sql.DB
	queue  chan persistTask
	wg     sync.WaitGroup
	closed atomic.Bool
}

// NewRiskStore initializes a SQLite-backed risk state store using the provided
// database file path. The schema is applied automatically when the store is
// created.
func NewRiskStore(dbPath string) (*RiskStore, error) {
	if strings.TrimSpace(dbPath) == "" {
		return nil, fmt.Errorf("db path cannot be empty")
	}

	dir := filepath.Dir(dbPath)
	if dir != "." && dir != "" {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return nil, fmt.Errorf("create data dir: %w", err)
		}
	}

	dsn := fmt.Sprintf("file:%s?_foreign_keys=1&_busy_timeout=5000", dbPath)
	db, err := sql.Open("sqlite3", dsn)
	if err != nil {
		return nil, fmt.Errorf("open sqlite store: %w", err)
	}
	db.SetMaxOpenConns(1)
	db.SetMaxIdleConns(1)
	db.SetConnMaxLifetime(0)

	if err := applySchema(db); err != nil {
		_ = db.Close()
		return nil, err
	}

	store := &RiskStore{
		db:    db,
		queue: make(chan persistTask, 64),
	}

	store.wg.Add(1)
	go store.worker()

	return store, nil
}

func applySchema(db *sql.DB) error {
	if _, err := db.Exec(schemaSQL); err != nil {
		return fmt.Errorf("apply schema: %w", err)
	}
	return nil
}

// Load retrieves the latest persisted risk state snapshot. When the database is
// empty, the method returns (nil, nil).
func (s *RiskStore) Load() (*RiskState, error) {
	if s == nil || s.db == nil {
		return nil, errors.New("risk store not initialized")
	}

	row := s.db.QueryRow(`SELECT daily_pnl, peak_balance, current_balance, last_reset_time, stop_until, updated_at FROM risk_state WHERE id = 1`)

	var (
		dailyPnL       float64
		peakBalance    float64
		currentBalance float64
		lastResetRaw   sql.NullString
		stopUntilRaw   sql.NullString
		updatedRaw     sql.NullString
	)

	if err := row.Scan(&dailyPnL, &peakBalance, &currentBalance, &lastResetRaw, &stopUntilRaw, &updatedRaw); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, fmt.Errorf("load risk state: %w", err)
	}

	state := &RiskState{
		DailyPnL:       dailyPnL,
		PeakBalance:    peakBalance,
		CurrentBalance: currentBalance,
	}

	if lastResetRaw.Valid && lastResetRaw.String != "" {
		if ts, err := time.Parse(time.RFC3339Nano, lastResetRaw.String); err == nil {
			state.LastResetTime = ts
		}
	}
	if stopUntilRaw.Valid && stopUntilRaw.String != "" {
		if ts, err := time.Parse(time.RFC3339Nano, stopUntilRaw.String); err == nil {
			state.StopUntil = ts
		}
	}
	if updatedRaw.Valid && updatedRaw.String != "" {
		if ts, err := time.Parse(time.RFC3339Nano, updatedRaw.String); err == nil {
			state.UpdatedAt = ts
		}
	}

	return state, nil
}

// Save schedules the provided risk state snapshot for persistence. The
// operation is asynchronous; callers should rely on Close() to flush outstanding
// work before shutdown.
func (s *RiskStore) Save(state *RiskState, traceID, reason string) error {
	if s == nil {
		return errors.New("risk store is nil")
	}
	if state == nil {
		return errors.New("risk state is required")
	}
	if s.closed.Load() {
		return errors.New("risk store closed")
	}

	snapshot := *state
	if snapshot.UpdatedAt.IsZero() {
		snapshot.UpdatedAt = time.Now().UTC()
	}

	metrics.IncRiskPersistenceAttempts(snapshot.TraderID)

	task := persistTask{state: snapshot, traceID: traceID, reason: reason}

	select {
	case s.queue <- task:
		return nil
	default:
		metrics.IncRiskPersistenceFailures(snapshot.TraderID)
		log.Printf("WARN: risk persistence queue full for trader %s", snapshot.TraderID)
		return errors.New("persistence queue full")
	}
}

func (s *RiskStore) worker() {
	defer s.wg.Done()

	for task := range s.queue {
		if err := s.persist(task); err != nil {
			if task.state.TraderID != "" {
				metrics.IncRiskPersistenceFailures(task.state.TraderID)
			}
			log.Printf("WARN: risk persistence failed for trader %s: %v", task.state.TraderID, err)
		}
	}
}

func (s *RiskStore) persist(task persistTask) error {
	if s == nil || s.db == nil {
		return errors.New("risk store not initialized")
	}

	state := task.state
	started := time.Now()

	tx, err := s.db.Begin()
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}

	_, err = tx.Exec(`INSERT INTO risk_state (id, daily_pnl, peak_balance, current_balance, last_reset_time, stop_until, updated_at)
        VALUES (1, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            daily_pnl = excluded.daily_pnl,
            peak_balance = excluded.peak_balance,
            current_balance = excluded.current_balance,
            last_reset_time = excluded.last_reset_time,
            stop_until = excluded.stop_until,
            updated_at = excluded.updated_at`,
		state.DailyPnL,
		state.PeakBalance,
		state.CurrentBalance,
		formatTime(state.LastResetTime),
		formatTime(state.StopUntil),
		formatTime(state.UpdatedAt),
	)
	if err != nil {
		_ = tx.Rollback()
		return fmt.Errorf("upsert risk_state: %w", err)
	}

	_, err = tx.Exec(`INSERT INTO risk_state_history (trace_id, reason, daily_pnl, peak_balance, current_balance, last_reset_time, stop_until, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		task.traceID,
		task.reason,
		state.DailyPnL,
		state.PeakBalance,
		state.CurrentBalance,
		formatTime(state.LastResetTime),
		formatTime(state.StopUntil),
		formatTime(state.UpdatedAt),
	)
	if err != nil {
		_ = tx.Rollback()
		return fmt.Errorf("insert risk_state_history: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit risk state: %w", err)
	}

	if state.TraderID != "" {
		metrics.ObserveRiskPersistLatency(state.TraderID, time.Since(started))
	}

	return nil
}

// Close flushes pending persistence tasks and closes the underlying database.
func (s *RiskStore) Close() error {
	if s == nil {
		return nil
	}

	if !s.closed.CompareAndSwap(false, true) {
		return nil
	}

	close(s.queue)
	s.wg.Wait()

	if s.db != nil {
		return s.db.Close()
	}

	return nil
}

func formatTime(ts time.Time) interface{} {
	if ts.IsZero() {
		return nil
	}
	return ts.UTC().Format(time.RFC3339Nano)
}
