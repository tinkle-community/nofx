package db

import (
    "context"
    "errors"
    "fmt"
    "net/url"
    "os"
    "strings"
    "sync"
    "testing"
    "time"

    testpg "nofx/testsupport/postgres"
)

func withPostgres(t *testing.T, fn func(connStr string)) {
    t.Helper()

    if external := strings.TrimSpace(os.Getenv("TEST_DB_URL")); external != "" {
        readyCtx, readyCancel := context.WithTimeout(context.Background(), 2*time.Minute)
        defer readyCancel()

        if err := testpg.WaitForReady(readyCtx, external); err != nil {
            t.Fatalf("wait for external postgres: %v", err)
        }

        t.Logf("Using external PostgreSQL at %s", maskDSN(external))
        fn(external)
        return
    }

    ctx, cancel := context.WithTimeout(context.Background(), 3*time.Minute)
    defer cancel()

    instance, err := testpg.Start(ctx)
    if err != nil {
        if errors.Is(err, testpg.ErrDockerDisabled) {
            t.Skip("Skipping PostgreSQL tests: SKIP_DOCKER_TESTS=1")
        }
        if errors.Is(err, testpg.ErrDockerUnavailable) {
            t.Skipf("Skipping PostgreSQL tests: %v", err)
        }
        if strings.Contains(err.Error(), "Cannot connect to the Docker daemon") || strings.Contains(err.Error(), "is the docker daemon running") {
            t.Skipf("Skipping PostgreSQL tests: %v", err)
        }
        if errors.Is(err, context.DeadlineExceeded) {
            t.Skipf("Skipping PostgreSQL tests: Docker startup timed out (%v)", err)
        }
        t.Fatalf("start postgres container: %v", err)
    }

    t.Cleanup(func() {
        terminateCtx, terminateCancel := context.WithTimeout(context.Background(), 10*time.Second)
        defer terminateCancel()
        if err := instance.Terminate(terminateCtx); err != nil {
            t.Logf("Warning: failed to terminate container: %v", err)
        }
    })

    connStr := instance.ConnectionString()
    t.Logf("Using testcontainers PostgreSQL at %s", maskDSN(connStr))
    fn(connStr)
}

func maskDSN(dsn string) string {
    u, err := url.Parse(dsn)
    if err != nil {
        return "[invalid-dsn]"
    }
    if u.User != nil {
        username := u.User.Username()
        if _, hasPassword := u.User.Password(); hasPassword {
            u.User = url.UserPassword(username, "***")
        } else {
            u.User = url.User(username)
        }
    }
    return u.String()
}

const (
    persistWaitTimeout  = 20 * time.Second
    persistPollInterval = 50 * time.Millisecond
)

func waitForPersistedState(t *testing.T, store *RiskStorePG, predicate func(*RiskState) bool) *RiskState {
    t.Helper()

    ctx, cancel := context.WithTimeout(context.Background(), persistWaitTimeout)
    defer cancel()

    ticker := time.NewTicker(persistPollInterval)
    defer ticker.Stop()

    var last *RiskState

    count := 0
    for {
        select {
        case <-ctx.Done():
            state, err := store.Load()
            if err != nil {
                t.Fatalf("Load failed after timeout: %v", err)
            }
            t.Fatalf("timed out waiting for persisted state after %v, last state: %+v (ctx error: %v)",
                persistWaitTimeout, state, ctx.Err())
            return last
        case <-ticker.C:
            state, err := store.Load()
            if err != nil {
                t.Fatalf("Load failed: %v", err)
            }
            last = state
            count++
            if count%10 == 0 {
                t.Logf("waitForPersistedState poll #%d -> DailyPnL=%.2f", count, state.DailyPnL)
            }
            if predicate == nil || predicate(state) {
                return state
            }
        }
    }
}

func TestRiskStorePG_NewAndMigrations(t *testing.T) {
    withPostgres(t, func(connStr string) {
        store, err := NewRiskStorePG(connStr)
        if err != nil {
            t.Fatalf("NewRiskStorePG failed: %v", err)
        }
        t.Cleanup(func() {
            _ = store.Close(context.Background())
        })

        if store.pool == nil {
            t.Fatal("expected non-nil connection pool after successful initialization")
        }
    })
}

func TestRiskStorePG_SaveAndLoad(t *testing.T) {
    withPostgres(t, func(connStr string) {
        store, err := NewRiskStorePG(connStr)
        if err != nil {
            t.Fatalf("NewRiskStorePG failed: %v", err)
        }
        t.Cleanup(func() {
            _ = store.Close(context.Background())
        })

        traderID := "testcontainer-trader-1"
        store.BindTrader(traderID)

        state := &RiskState{
            TraderID:      traderID,
            DailyPnL:      -234.56,
            DrawdownPct:   18.7,
            CurrentEquity: 850.0,
            PeakEquity:    1150.0,
            TradingPaused: true,
            PausedUntil:   time.Now().Add(45 * time.Minute),
            LastResetTime: time.Now().Add(-5 * time.Hour),
            UpdatedAt:     time.Now(),
        }

        if err := store.Save(state, "trace-tc-001", "testcontainer_save"); err != nil {
            t.Fatalf("Save failed: %v", err)
        }

        // Wait for async persistence with polling
        loaded := waitForPersistedState(t, store, func(s *RiskState) bool {
            return s.DailyPnL == state.DailyPnL && s.TradingPaused == state.TradingPaused
        })

        if loaded.TraderID != traderID {
            t.Errorf("TraderID: got %s, want %s", loaded.TraderID, traderID)
        }
        if loaded.DailyPnL != state.DailyPnL {
            t.Errorf("DailyPnL: got %.2f, want %.2f", loaded.DailyPnL, state.DailyPnL)
        }
        if loaded.DrawdownPct != state.DrawdownPct {
            t.Errorf("DrawdownPct: got %.2f, want %.2f", loaded.DrawdownPct, state.DrawdownPct)
        }
        if loaded.TradingPaused != state.TradingPaused {
            t.Errorf("TradingPaused: got %t, want %t", loaded.TradingPaused, state.TradingPaused)
        }
    })
}

func TestRiskStorePG_AsyncQueueBehavior(t *testing.T) {
    withPostgres(t, func(connStr string) {
        store, err := NewRiskStorePG(connStr)
        if err != nil {
            t.Fatalf("NewRiskStorePG failed: %v", err)
        }
        t.Cleanup(func() {
            _ = store.Close(context.Background())
        })

        traderID := "testcontainer-async-trader"
        store.BindTrader(traderID)

        const numWrites = 50
        for i := 0; i < numWrites; i++ {
            state := &RiskState{
                TraderID:      traderID,
                DailyPnL:      float64(i),
                CurrentEquity: 1000.0 + float64(i),
                PeakEquity:    1000.0 + float64(i),
                UpdatedAt:     time.Now(),
            }
            if err := store.Save(state, fmt.Sprintf("trace-%d", i), "async_test"); err != nil {
                t.Fatalf("Save failed on iteration %d: %v", i, err)
            }
        }

        loaded := waitForPersistedState(t, store, func(s *RiskState) bool {
            return s.DailyPnL >= float64(numWrites-1)
        })

        if loaded.DailyPnL < 0 || loaded.DailyPnL >= float64(numWrites) {
            t.Errorf("Expected DailyPnL in range [0, %d), got %.2f", numWrites, loaded.DailyPnL)
        }
    })
}

func TestRiskStorePG_RestartRecovery(t *testing.T) {
    withPostgres(t, func(connStr string) {
        traderID := "testcontainer-restart-trader"
        originalState := &RiskState{
            TraderID:      traderID,
            DailyPnL:      -78.90,
            DrawdownPct:   14.2,
            CurrentEquity: 920.0,
            PeakEquity:    1080.0,
            TradingPaused: true,
            PausedUntil:   time.Now().Add(25 * time.Minute),
            LastResetTime: time.Now().Add(-3 * time.Hour),
            UpdatedAt:     time.Now(),
        }

        {
            firstStore, err := NewRiskStorePG(connStr)
            if err != nil {
                t.Fatalf("NewRiskStorePG (first) failed: %v", err)
            }
            firstStore.BindTrader(traderID)

            if err := firstStore.Save(originalState, "trace-restart-tc", "before_restart"); err != nil {
                t.Fatalf("Save failed: %v", err)
            }
            // Wait for persistence before closing
            _ = waitForPersistedState(t, firstStore, func(s *RiskState) bool {
                return s.DailyPnL == originalState.DailyPnL
            })
            if err := firstStore.Close(context.Background()); err != nil {
                t.Fatalf("first store close failed: %v", err)
            }
        }

        {
            secondStore, err := NewRiskStorePG(connStr)
            if err != nil {
                t.Fatalf("NewRiskStorePG (second) failed: %v", err)
            }
            t.Cleanup(func() {
                _ = secondStore.Close(context.Background())
            })
            secondStore.BindTrader(traderID)

            loaded, err := secondStore.Load()
            if err != nil {
                t.Fatalf("Load after restart failed: %v", err)
            }
            if loaded == nil {
                t.Fatal("expected loaded state after restart")
            }

            if loaded.TraderID != traderID {
                t.Errorf("TraderID: got %s, want %s", loaded.TraderID, traderID)
            }
            if loaded.DailyPnL != originalState.DailyPnL {
                t.Errorf("DailyPnL: got %.2f, want %.2f", loaded.DailyPnL, originalState.DailyPnL)
            }
            if loaded.TradingPaused != originalState.TradingPaused {
                t.Errorf("TradingPaused: got %t, want %t", loaded.TradingPaused, originalState.TradingPaused)
            }
        }
    })
}

func TestRiskStorePG_ConcurrentWrites(t *testing.T) {
    withPostgres(t, func(connStr string) {
        store, err := NewRiskStorePG(connStr)
        if err != nil {
            t.Fatalf("NewRiskStorePG failed: %v", err)
        }
        t.Cleanup(func() {
            _ = store.Close(context.Background())
        })

        traderID := "testcontainer-concurrent-trader"
        store.BindTrader(traderID)

        var wg sync.WaitGroup
        workers := 10
        iterations := 50
        wg.Add(workers)

        ctx := context.Background()
        for i := 0; i < workers; i++ {
            go func(workerID int) {
                defer wg.Done()
                for j := 0; j < iterations; j++ {
                    delta := DailyDelta{
                        DailyPnL: 1,
                        Equity:   1,
                        Reason:   "concurrent_delta",
                    }
                    if err := store.SaveDelta(ctx, traderID, delta); err != nil {
                        t.Errorf("SaveDelta failed (worker=%d, iter=%d): %v", workerID, j, err)
                    }
                }
            }(i)
        }

        wg.Wait()

        expectedFinal := float64(workers * iterations)
        loaded := waitForPersistedState(t, store, func(s *RiskState) bool {
            return s.DailyPnL >= expectedFinal
        })
        if loaded == nil {
            t.Fatal("expected loaded state after concurrent writes")
        }

        if loaded.DailyPnL != expectedFinal {
            t.Errorf("DailyPnL mismatch: got %.2f, want %.2f", loaded.DailyPnL, expectedFinal)
        }
        if loaded.CurrentEquity != expectedFinal {
            t.Errorf("CurrentEquity mismatch: got %.2f, want %.2f", loaded.CurrentEquity, expectedFinal)
        }
        if loaded.PeakEquity != expectedFinal {
            t.Errorf("PeakEquity mismatch: got %.2f, want %.2f", loaded.PeakEquity, expectedFinal)
        }
    })
}

func TestRiskStorePG_FailureNonFatal(t *testing.T) {
    withPostgres(t, func(connStr string) {
        store, err := NewRiskStorePG(connStr)
        if err != nil {
            t.Fatalf("NewRiskStorePG failed: %v", err)
        }

        traderID := "testcontainer-failure-trader"
        store.BindTrader(traderID)

        state := &RiskState{
            TraderID:      traderID,
            DailyPnL:      -50.0,
            CurrentEquity: 950.0,
            PeakEquity:    1000.0,
        }

        if err := store.Save(state, "trace-before-close", "pre_close"); err != nil {
            t.Fatalf("Save failed: %v", err)
        }
        _ = waitForPersistedState(t, store, func(s *RiskState) bool {
            return s.DailyPnL == state.DailyPnL
        })

        if closeErr := store.Close(context.Background()); closeErr != nil {
            t.Fatalf("Close failed: %v", closeErr)
        }

        err = store.Save(state, "trace-after-close", "post_close")
        if err == nil {
            t.Error("expected error when saving after store is closed")
        }
        if err != nil && !strings.Contains(err.Error(), "shutting down") {
            t.Errorf("expected shutdown error, got: %v", err)
        }
    })
}

func TestRiskStorePG_LoadWhenNoState(t *testing.T) {
    withPostgres(t, func(connStr string) {
        store, err := NewRiskStorePG(connStr)
        if err != nil {
            t.Fatalf("NewRiskStorePG failed: %v", err)
        }
        t.Cleanup(func() {
            _ = store.Close(context.Background())
        })

        traderID := "testcontainer-no-state-trader"
        store.BindTrader(traderID)

        loaded, err := store.Load()
        if err != nil {
            t.Fatalf("Load failed: %v", err)
        }
        if loaded == nil {
            t.Fatal("expected zero-valued state when no db row exists")
        }
        if loaded.TraderID != traderID {
            t.Errorf("TraderID: got %s, want %s", loaded.TraderID, traderID)
        }
        if loaded.DailyPnL != 0 {
            t.Errorf("DailyPnL should be 0 on new state, got %.2f", loaded.DailyPnL)
        }
    })
}
