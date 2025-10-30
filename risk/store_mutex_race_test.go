package risk

import (
    "math"
    "sync"
    "sync/atomic"
    "testing"
    "time"

    "nofx/featureflag"
)

func TestStore_UpdateDailyPnL_ConcurrentWithMutex(t *testing.T) {
    flags := newRuntimeFlagsForTest(func(state *featureflag.State) {
        state.EnableMutexProtection = true
    })
    store := NewStore()

    traderID := "mutex-concurrent-trader"
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
    if math.Abs(snapshot.DailyPnL-expected) > 1e-6 {
        t.Errorf("expected DailyPnL %.0f with mutex protection, got %.6f", expected, snapshot.DailyPnL)
    }
}

func TestStore_SetTradingPaused_ConcurrentToggle(t *testing.T) {
    flags := newRuntimeFlagsForTest(func(state *featureflag.State) {
        state.EnableMutexProtection = true
    })
    store := NewStore()

    traderID := "pause-toggle-trader"
    var wg sync.WaitGroup
    iterations := 500

    wg.Add(2)
    go func() {
        defer wg.Done()
        for i := 0; i < iterations; i++ {
            until := time.Now().Add(10 * time.Minute)
            store.SetTradingPaused(traderID, true, until, flags)
        }
    }()

    go func() {
        defer wg.Done()
        for i := 0; i < iterations; i++ {
            store.SetTradingPaused(traderID, false, time.Time{}, flags)
        }
    }()

    wg.Wait()

    snapshot := store.Snapshot(traderID, flags)
    t.Logf("Final TradingPaused=%t after concurrent toggles", snapshot.TradingPaused)
}

func TestStore_RecordEquity_ConcurrentStress(t *testing.T) {
    flags := newRuntimeFlagsForTest(func(state *featureflag.State) {
        state.EnableMutexProtection = true
    })
    store := NewStore()

    traderID := "equity-stress-trader"
    var wg sync.WaitGroup
    workers := 30
    iterations := 300

    wg.Add(workers)
    for i := 0; i < workers; i++ {
        go func(workerID int) {
            defer wg.Done()
            for j := 0; j < iterations; j++ {
                equity := 1000.0 + float64(workerID*iterations+j)
                store.RecordEquity(traderID, equity, flags, time.Now())
            }
        }(i)
    }
    wg.Wait()

    snapshot := store.Snapshot(traderID, flags)
    maxEquity := 1000.0 + float64(workers*iterations)
    if snapshot.PeakEquity < 1000.0 || snapshot.PeakEquity > maxEquity {
        t.Errorf("Expected PeakEquity in [1000, %.0f], got %.2f", maxEquity, snapshot.PeakEquity)
    }
}

func TestEngine_UpdateDailyPnL_ConcurrentStressWithMutex(t *testing.T) {
    flags := newRuntimeFlagsForTest(func(state *featureflag.State) {
        state.EnableRiskEnforcement = false
    })
    store := NewStore()
    limits := Limits{
        MaxDailyLoss:       1000.0,
        MaxDrawdown:        50.0,
        StopTradingMinutes: 30,
    }
    engine := NewEngineWithContext("concurrent-engine-trader", 10000.0, limits, store, flags)

    var wg sync.WaitGroup
    workers := 40
    incrementsPerWorker := 500
    wg.Add(workers)

    for i := 0; i < workers; i++ {
        go func() {
            defer wg.Done()
            for j := 0; j < incrementsPerWorker; j++ {
                engine.UpdateDailyPnL(0.1)
            }
        }()
    }
    wg.Wait()

    snapshot := engine.Snapshot()
    expected := float64(workers*incrementsPerWorker) * 0.1
    if math.Abs(snapshot.DailyPnL-expected) > 1e-6 {
        t.Errorf("expected DailyPnL %.2f with mutex, got %.6f", expected, snapshot.DailyPnL)
    }
}

func TestStore_ResetDailyPnL_RaceFree(t *testing.T) {
    flags := newRuntimeFlagsForTest(nil)
    store := NewStore()

    traderID := "reset-race-trader"
    now := time.Now()
    store.UpdateDailyPnL(traderID, 100.0, flags, now)

    var wg sync.WaitGroup
    wg.Add(2)

    go func() {
        defer wg.Done()
        for i := 0; i < 500; i++ {
            futureTime := now.Add(25 * time.Hour)
            store.ResetDailyPnLIfNeeded(traderID, futureTime, flags)
        }
    }()

    go func() {
        defer wg.Done()
        for i := 0; i < 500; i++ {
            store.UpdateDailyPnL(traderID, 1.0, flags, now)
        }
    }()

    wg.Wait()

    snapshot := store.Snapshot(traderID, flags)
    t.Logf("Final DailyPnL after concurrent reset+update: %.2f", snapshot.DailyPnL)
}

func BenchmarkStore_UpdateDailyPnL_WithMutex(b *testing.B) {
    flags := newRuntimeFlagsForTest(nil)
    store := NewStore()
    traderID := "bench-with-mutex"
    now := time.Now()

    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        store.UpdateDailyPnL(traderID, 1.0, flags, now)
    }
}

func BenchmarkStore_UpdateDailyPnL_WithoutMutex(b *testing.B) {
    flags := newRuntimeFlagsForTest(func(state *featureflag.State) {
        state.EnableMutexProtection = false
    })
    store := NewStore()
    traderID := "bench-without-mutex"
    now := time.Now()

    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        store.UpdateDailyPnL(traderID, 1.0, flags, now)
    }
}

func TestStore_MutexToggle_RuntimeSwitch(t *testing.T) {
    flags := newRuntimeFlagsForTest(func(state *featureflag.State) {
        state.EnableMutexProtection = false
    })
    store := NewStore()
    traderID := "mutex-toggle-trader"

    store.UpdateDailyPnL(traderID, 10.0, flags, time.Now())
    snapshot1 := store.Snapshot(traderID, flags)
    if snapshot1.DailyPnL != 10.0 {
        t.Errorf("Expected DailyPnL 10.0, got %.2f", snapshot1.DailyPnL)
    }

    flags.SetMutexProtection(true)
    store.UpdateDailyPnL(traderID, 5.0, flags, time.Now())
    snapshot2 := store.Snapshot(traderID, flags)
    if snapshot2.DailyPnL != 15.0 {
        t.Errorf("Expected DailyPnL 15.0 after enabling mutex, got %.2f", snapshot2.DailyPnL)
    }
}

func TestStore_ConcurrentSnapshot_NoDeadlock(t *testing.T) {
    flags := newRuntimeFlagsForTest(nil)
    store := NewStore()
    traderID := "snapshot-deadlock-trader"

    var wg sync.WaitGroup
    workers := 20
    wg.Add(workers * 2)

    for i := 0; i < workers; i++ {
        go func() {
            defer wg.Done()
            for j := 0; j < 100; j++ {
                store.UpdateDailyPnL(traderID, 1.0, flags, time.Now())
            }
        }()

        go func() {
            defer wg.Done()
            for j := 0; j < 100; j++ {
                _ = store.Snapshot(traderID, flags)
            }
        }()
    }

    done := make(chan struct{})
    go func() {
        wg.Wait()
        close(done)
    }()

    select {
    case <-done:
    case <-time.After(10 * time.Second):
        t.Fatal("Deadlock detected: test did not complete within 10 seconds")
    }
}

func TestStore_Atomicity_MutexProtected(t *testing.T) {
    flags := newRuntimeFlagsForTest(nil)
    store := NewStore()
    traderID := "atomicity-trader"

    var wg sync.WaitGroup
    var inconsistencies atomic.Int64

    wg.Add(100)
    for i := 0; i < 100; i++ {
        go func() {
            defer wg.Done()
            for j := 0; j < 100; j++ {
                store.UpdateDailyPnL(traderID, 2.0, flags, time.Now())
                snap := store.Snapshot(traderID, flags)
                if int(snap.DailyPnL)%2 != 0 {
                    inconsistencies.Add(1)
                }
            }
        }()
    }
    wg.Wait()

    if inconsistencies.Load() > 0 {
        t.Errorf("Detected %d inconsistencies despite mutex protection", inconsistencies.Load())
    }
}
