//go:build race
// +build race

package risk

import (
	"sync/atomic"
	"testing"
	"time"

	"nofx/risk/testsupport"
)

func TestStore_ConcurrentMutations_RaceFree(t *testing.T) {
	flags := testsupport.RuntimeFlags(t, nil)
	store := NewStore()
	traderID := "race-store-mut"
	base := time.Now()

	testsupport.RunConcurrentTasks(t,
		func() {
			for i := 0; i < 300; i++ {
				store.UpdateDailyPnL(traderID, 1.5, flags, base.Add(time.Duration(i)*time.Millisecond))
			}
		},
		func() {
			future := base.Add(26 * time.Hour)
			for i := 0; i < 150; i++ {
				store.ResetDailyPnLIfNeeded(traderID, future, flags)
			}
		},
		func() {
			for i := 0; i < 200; i++ {
				equity := 1000.0 + float64(i)
				store.RecordEquity(traderID, equity, flags, base)
			}
		},
		func() {
			deadline := base.Add(2 * time.Minute)
			for i := 0; i < 250; i++ {
				if i%2 == 0 {
					store.SetTradingPaused(traderID, true, deadline, flags)
				} else {
					store.SetTradingPaused(traderID, false, time.Time{}, flags)
				}
			}
		},
		func() {
			future := base.Add(10 * time.Minute)
			for i := 0; i < 250; i++ {
				store.TradingStatus(traderID, future, flags)
			}
		},
		func() {
			for i := 0; i < 250; i++ {
				store.Snapshot(traderID, flags)
			}
		},
	)

	snapshot := store.Snapshot(traderID, flags)
	if snapshot.DailyPnL < 0 {
		t.Fatalf("expected non-negative DailyPnL, got %.2f", snapshot.DailyPnL)
	}
	if snapshot.PeakEquity < snapshot.CurrentEquity {
		t.Fatalf("expected peak equity %.2f to be >= current equity %.2f", snapshot.PeakEquity, snapshot.CurrentEquity)
	}
}

func TestEngine_ConcurrentOperations_RaceFree(t *testing.T) {
	flags := testsupport.RuntimeFlags(t, nil)
	store := NewStore()
	limits := Limits{
		MaxDailyLoss:       5_000,
		MaxDrawdown:        75,
		StopTradingMinutes: 15,
	}
	engine := NewEngineWithContext("race-engine", 10000, limits, store, flags)

	var oddPnL atomic.Int64

	testsupport.RunConcurrentTasks(t,
		func() {
			for i := 0; i < 300; i++ {
				engine.UpdateDailyPnL(10.0)
			}
		},
		func() {
			for i := 0; i < 300; i++ {
				engine.RecordEquity(10000 + float64(i))
			}
		},
		func() {
			for i := 0; i < 300; i++ {
				engine.ResetDailyPnLIfNeeded()
			}
		},
		func() {
			future := time.Now().Add(2 * time.Minute)
			for i := 0; i < 200; i++ {
				engine.PauseTrading(future)
				engine.ResumeTrading()
			}
		},
		func() {
			for i := 0; i < 200; i++ {
				snapshot := engine.Snapshot()
				if int(snapshot.DailyPnL)%2 != 0 {
					oddPnL.Add(1)
				}
				engine.TradingStatus()
			}
		},
	)

	if oddPnL.Load() != 0 {
		t.Fatalf("expected even DailyPnL values, found %d odd snapshots", oddPnL.Load())
	}
}
