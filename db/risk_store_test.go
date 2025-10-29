package db

import (
	"path/filepath"
	"testing"
	"time"
)

func TestRiskStoreSaveAndLoad(t *testing.T) {
	t.Parallel()

	dir := t.TempDir()
	store, err := NewRiskStore(filepath.Join(dir, "risk.db"))
	if err != nil {
		t.Fatalf("failed to create risk store: %v", err)
	}

	original := &RiskState{
		TraderID:       "trader-1",
		DailyPnL:       123.45,
		PeakBalance:    2048.0,
		CurrentBalance: 1900.0,
		LastResetTime:  time.Now().Add(-12 * time.Hour).UTC().Round(time.Second),
		StopUntil:      time.Now().Add(30 * time.Minute).UTC().Round(time.Second),
		UpdatedAt:      time.Now().UTC(),
	}

	if err := store.Save(original, "trace-1", "unit-test"); err != nil {
		t.Fatalf("failed to save risk state: %v", err)
	}

	if err := store.Close(); err != nil {
		t.Fatalf("failed to close risk store: %v", err)
	}

	reopened, err := NewRiskStore(filepath.Join(dir, "risk.db"))
	if err != nil {
		t.Fatalf("failed to reopen risk store: %v", err)
	}
	defer reopened.Close()

	loaded, err := reopened.Load()
	if err != nil {
		t.Fatalf("failed to load risk state: %v", err)
	}
	if loaded == nil {
		t.Fatal("expected persisted risk state, got nil")
	}

	if loaded.DailyPnL != original.DailyPnL {
		t.Fatalf("expected daily pnl %.2f, got %.2f", original.DailyPnL, loaded.DailyPnL)
	}
	if loaded.PeakBalance != original.PeakBalance {
		t.Fatalf("expected peak balance %.2f, got %.2f", original.PeakBalance, loaded.PeakBalance)
	}
	if loaded.CurrentBalance != original.CurrentBalance {
		t.Fatalf("expected current balance %.2f, got %.2f", original.CurrentBalance, loaded.CurrentBalance)
	}
	if !loaded.LastResetTime.Equal(original.LastResetTime) {
		t.Fatalf("expected last reset %s, got %s", original.LastResetTime, loaded.LastResetTime)
	}
	if !loaded.StopUntil.Equal(original.StopUntil) {
		t.Fatalf("expected stop until %s, got %s", original.StopUntil, loaded.StopUntil)
	}
}

func TestRiskStoreSaveAfterCloseNonFatal(t *testing.T) {
	store, err := NewRiskStore(filepath.Join(t.TempDir(), "risk.db"))
	if err != nil {
		t.Fatalf("failed to create risk store: %v", err)
	}

	if err := store.Close(); err != nil {
		t.Fatalf("failed to close risk store: %v", err)
	}

	err = store.Save(&RiskState{TraderID: "trader"}, "trace", "after-close")
	if err == nil {
		t.Fatal("expected error when saving after store is closed")
	}
}
