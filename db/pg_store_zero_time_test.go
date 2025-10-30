package db

import (
	"context"
	"strings"
	"testing"
	"time"
)

func TestRiskStorePG_SaveWithZeroLastResetTime(t *testing.T) {
	withPostgres(t, func(connStr string) {
		store, err := NewRiskStorePG(connStr)
		if err != nil {
			t.Fatalf("NewRiskStorePG failed: %v", err)
		}
		t.Cleanup(store.Close)

		traderID := "testcontainer-zero-last-reset"
		store.BindTrader(traderID)

		// Save with zero LastResetTime
		state := &RiskState{
			TraderID:      traderID,
			DailyPnL:      -100.0,
			CurrentEquity: 900.0,
			PeakEquity:    1000.0,
			LastResetTime: time.Time{}, // Zero time
			UpdatedAt:     time.Now(),
		}

		if err := store.Save(state, "trace-zero-reset", "test_zero_reset"); err != nil {
			t.Fatalf("Save with zero LastResetTime failed: %v", err)
		}

		// Wait for persistence
		loaded := waitForPersistedState(t, store, func(s *RiskState) bool {
			return s.DailyPnL == state.DailyPnL
		})

		if loaded.LastResetTime.IsZero() {
			t.Error("LastResetTime should not be zero after persistence (sanitized)")
		}

		if loaded.TraderID != traderID {
			t.Errorf("TraderID: got %s, want %s", loaded.TraderID, traderID)
		}
		if loaded.DailyPnL != state.DailyPnL {
			t.Errorf("DailyPnL: got %.2f, want %.2f", loaded.DailyPnL, state.DailyPnL)
		}
	})
}

func TestRiskStorePG_SaveWithZeroPausedUntil(t *testing.T) {
	withPostgres(t, func(connStr string) {
		store, err := NewRiskStorePG(connStr)
		if err != nil {
			t.Fatalf("NewRiskStorePG failed: %v", err)
		}
		t.Cleanup(store.Close)

		traderID := "testcontainer-zero-paused"
		store.BindTrader(traderID)

		state := &RiskState{
			TraderID:      traderID,
			DailyPnL:      -50.0,
			CurrentEquity: 950.0,
			PeakEquity:    1000.0,
			TradingPaused: false,
			PausedUntil:   time.Time{}, // Zero time (should map to NULL)
			LastResetTime: time.Now().Add(-2 * time.Hour),
			UpdatedAt:     time.Now(),
		}

		if err := store.Save(state, "trace-zero-paused", "test_zero_paused"); err != nil {
			t.Fatalf("Save with zero PausedUntil failed: %v", err)
		}

		// Wait for persistence
		loaded := waitForPersistedState(t, store, func(s *RiskState) bool {
			return s.DailyPnL == state.DailyPnL
		})

		if !loaded.PausedUntil.IsZero() {
			t.Errorf("PausedUntil should be zero when saved as zero, got %v", loaded.PausedUntil)
		}
	})
}

func TestRiskStorePG_SaveAndLoadNullableTimestamps(t *testing.T) {
	withPostgres(t, func(connStr string) {
		store, err := NewRiskStorePG(connStr)
		if err != nil {
			t.Fatalf("NewRiskStorePG failed: %v", err)
		}
		t.Cleanup(store.Close)

		traderID := "testcontainer-nullable-times"
		store.BindTrader(traderID)

		now := time.Now()
		pausedUntil := now.Add(30 * time.Minute)
		lastReset := now.Add(-5 * time.Hour)

		// First save with valid timestamps
		state1 := &RiskState{
			TraderID:      traderID,
			DailyPnL:      -75.0,
			CurrentEquity: 925.0,
			PeakEquity:    1000.0,
			TradingPaused: true,
			PausedUntil:   pausedUntil,
			LastResetTime: lastReset,
			UpdatedAt:     now,
		}

		if err := store.Save(state1, "trace-nullable-1", "save_with_times"); err != nil {
			t.Fatalf("Save with timestamps failed: %v", err)
		}

		loaded1 := waitForPersistedState(t, store, func(s *RiskState) bool {
			return s.DailyPnL == state1.DailyPnL && s.TradingPaused
		})

		if loaded1.LastResetTime.IsZero() {
			t.Error("LastResetTime should not be zero")
		}
		if loaded1.PausedUntil.IsZero() {
			t.Error("PausedUntil should not be zero after saving non-zero value")
		}

		// Now save with zero paused_until (should clear it)
		state2 := &RiskState{
			TraderID:      traderID,
			DailyPnL:      -50.0,
			CurrentEquity: 950.0,
			PeakEquity:    1000.0,
			TradingPaused: false,
			PausedUntil:   time.Time{}, // Clear paused_until
			LastResetTime: lastReset,
			UpdatedAt:     time.Now(),
		}

		if err := store.Save(state2, "trace-nullable-2", "clear_paused"); err != nil {
			t.Fatalf("Save to clear PausedUntil failed: %v", err)
		}

		loaded2 := waitForPersistedState(t, store, func(s *RiskState) bool {
			return s.DailyPnL == state2.DailyPnL && !s.TradingPaused
		})

		if !loaded2.PausedUntil.IsZero() {
			t.Errorf("PausedUntil should be zero after clearing, got %v", loaded2.PausedUntil)
		}
		if loaded2.LastResetTime.IsZero() {
			t.Error("LastResetTime should never be zero")
		}
	})
}

func TestRiskStorePG_LoadWithMissingLastResetTime(t *testing.T) {
	withPostgres(t, func(connStr string) {
		store, err := NewRiskStorePG(connStr)
		if err != nil {
			t.Fatalf("NewRiskStorePG failed: %v", err)
		}
		t.Cleanup(store.Close)

		traderID := "testcontainer-missing-reset"
		store.BindTrader(traderID)

		// Insert a row with NULL last_reset_time directly (simulate pre-migration state)
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		// First, insert with valid last_reset_time
		validState := &RiskState{
			TraderID:      traderID,
			DailyPnL:      -25.0,
			CurrentEquity: 975.0,
			PeakEquity:    1000.0,
			LastResetTime: time.Now().Add(-1 * time.Hour),
			UpdatedAt:     time.Now(),
		}
		if err := store.Save(validState, "trace-valid", "valid_state"); err != nil {
			t.Fatalf("Save valid state failed: %v", err)
		}

		// Wait for persistence
		_ = waitForPersistedState(t, store, func(s *RiskState) bool {
			return s.DailyPnL == validState.DailyPnL
		})

		// Manually set last_reset_time to NULL to simulate pre-migration data
		// Note: This will fail if the migration 000003 is correctly applied
		// because the column has a NOT NULL constraint with DEFAULT NOW()
		// So we skip this part if it fails
		_, updateErr := store.pool.Exec(ctx,
			`UPDATE risk_state SET last_reset_time = NULL WHERE trader_id = $1`,
			traderID)
		if updateErr != nil {
			if strings.Contains(updateErr.Error(), "null value") || strings.Contains(updateErr.Error(), "violates not-null") {
				t.Skip("Cannot test NULL last_reset_time: migration correctly enforces NOT NULL constraint")
			}
			t.Logf("Warning: could not set last_reset_time to NULL: %v (this is expected post-migration)", updateErr)
		}

		// Load and verify backfill happens
		loaded, loadErr := store.Load()
		if loadErr != nil {
			t.Fatalf("Load after NULL last_reset_time failed: %v", loadErr)
		}

		if loaded.LastResetTime.IsZero() {
			t.Error("LastResetTime should be backfilled when NULL")
		}

		if loaded.TraderID != traderID {
			t.Errorf("TraderID: got %s, want %s", loaded.TraderID, traderID)
		}
	})
}

func TestRiskStorePG_FlushOnClose(t *testing.T) {
	withPostgres(t, func(connStr string) {
		store, err := NewRiskStorePG(connStr)
		if err != nil {
			t.Fatalf("NewRiskStorePG failed: %v", err)
		}

		traderID := "testcontainer-flush-close"
		store.BindTrader(traderID)

		state := &RiskState{
			TraderID:      traderID,
			DailyPnL:      -150.0,
			CurrentEquity: 850.0,
			PeakEquity:    1000.0,
			LastResetTime: time.Now().Add(-3 * time.Hour),
			UpdatedAt:     time.Now(),
		}

		if err := store.Save(state, "trace-flush", "test_flush_close"); err != nil {
			t.Fatalf("Save before close failed: %v", err)
		}

		// Close immediately to trigger flush
		store.Close()

		// Create new store to verify persistence
		store2, err := NewRiskStorePG(connStr)
		if err != nil {
			t.Fatalf("NewRiskStorePG (second) failed: %v", err)
		}
		t.Cleanup(store2.Close)
		store2.BindTrader(traderID)

		loaded, err := store2.Load()
		if err != nil {
			t.Fatalf("Load after close failed: %v", err)
		}

		if loaded.DailyPnL != state.DailyPnL {
			t.Errorf("DailyPnL after flush: got %.2f, want %.2f", loaded.DailyPnL, state.DailyPnL)
		}

		if loaded.LastResetTime.IsZero() {
			t.Error("LastResetTime should not be zero after flush")
		}
	})
}
