//go:build !race
// +build !race

package risk

import (
    "sync"
    "testing"
    "time"

    "nofx/featureflag"
)

// TestStore_UpdateDailyPnL_ConcurrentWithoutMutex intentionally creates
// data races to demonstrate behavior without mutex protection.
// This test is excluded from race detector builds to avoid false positives.
func TestStore_UpdateDailyPnL_ConcurrentWithoutMutex(t *testing.T) {
    state := featureflag.DefaultState()
    state.EnableMutexProtection = false
    flags := featureflag.NewRuntimeFlags(state)
    store := NewStore()

    traderID := "nomutex-concurrent-trader"
    var wg sync.WaitGroup
    workers := 50
    incrementsPerWorker := 1000

    wg.Add(workers)
    for i := 0; i < workers; i++ {
        go func() {
            defer wg.Done()
            for j := 0; j < incrementsPerWorker; j++ {
                store.UpdateDailyPnL(traderID, 1.0, flags, time.Now())
            }
        }()
    }
    wg.Wait()

    snapshot := store.Snapshot(traderID, flags)
    expected := float64(workers * incrementsPerWorker)

    if snapshot.DailyPnL == expected {
        t.Logf("DailyPnL=%.0f matches expected (rare without mutex, but possible)", snapshot.DailyPnL)
    } else {
        t.Logf("DailyPnL=%.0f differs from expected %.0f (data race expected without mutex)", snapshot.DailyPnL, expected)
    }
}
