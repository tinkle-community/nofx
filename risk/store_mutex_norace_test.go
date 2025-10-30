//go:build !race
// +build !race

package risk

import (
	"testing"
	"time"

	"nofx/risk/testsupport"
)

func TestStore_UpdateDailyPnL_WithMutexConcurrency(t *testing.T) {
	flags := testsupport.RuntimeFlags(t, nil)
	store := NewStore()
	traderID := "mutex-concurrent-trader"

	const (
		workers    = 12
		iterations = 200
		delta      = 2.5
	)

	testsupport.RunConcurrently(t, workers, func(_ int) {
		now := time.Now()
		for i := 0; i < iterations; i++ {
			store.UpdateDailyPnL(traderID, delta, flags, now)
		}
	})

	snapshot := store.Snapshot(traderID, flags)
	expected := float64(workers*iterations) * delta
	if snapshot.DailyPnL != expected {
		t.Fatalf("expected DailyPnL %.2f, got %.2f", expected, snapshot.DailyPnL)
	}
}

func TestStore_ResetDailyPnLIfNeeded_WithConcurrentUpdates(t *testing.T) {
	flags := testsupport.RuntimeFlags(t, nil)
	store := NewStore()
	traderID := "reset-concurrent-trader"
	base := time.Now()

	store.UpdateDailyPnL(traderID, 250, flags, base)

	const iterations = 150

	testsupport.RunConcurrentTasks(t,
		func() {
			target := base.Add(26 * time.Hour)
			for i := 0; i < iterations; i++ {
				store.ResetDailyPnLIfNeeded(traderID, target, flags)
			}
		},
		func() {
			target := base.Add(26 * time.Hour)
			for i := 0; i < iterations; i++ {
				store.UpdateDailyPnL(traderID, 1.0, flags, target.Add(time.Duration(i)*time.Millisecond))
			}
		},
	)

	snapshot := store.Snapshot(traderID, flags)
	if snapshot.DailyPnL < 0 {
		t.Fatalf("expected non-negative DailyPnL, got %.2f", snapshot.DailyPnL)
	}

	maxExpected := float64(iterations)
	if snapshot.DailyPnL > maxExpected {
		t.Fatalf("expected DailyPnL <= %.2f, got %.2f", maxExpected, snapshot.DailyPnL)
	}

	if snapshot.LastReset.Before(base.Add(24 * time.Hour)) {
		t.Fatalf("expected LastReset to advance after reset, got %s", snapshot.LastReset)
	}
}

func TestStore_SetTradingPaused_ConcurrentToggle(t *testing.T) {
	flags := testsupport.RuntimeFlags(t, nil)
	store := NewStore()
	traderID := "pause-toggle-trader"
	pauseUntil := time.Now().Add(2 * time.Minute)

	testsupport.RunConcurrentTasks(t,
		func() {
			for i := 0; i < 200; i++ {
				store.SetTradingPaused(traderID, true, pauseUntil, flags)
			}
		},
		func() {
			for i := 0; i < 200; i++ {
				store.SetTradingPaused(traderID, false, time.Time{}, flags)
			}
		},
		func() {
			future := pauseUntil.Add(3 * time.Minute)
			for i := 0; i < 200; i++ {
				store.TradingStatus(traderID, future, flags)
			}
		},
	)

	paused, until := store.TradingStatus(traderID, pauseUntil.Add(3*time.Minute), flags)
	if paused {
		t.Fatalf("expected trading to auto-resume after pause interval")
	}
	if !until.IsZero() {
		t.Fatalf("expected paused-until timestamp to reset, got %s", until)
	}
}
