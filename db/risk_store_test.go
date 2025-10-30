package db

import (
    "context"
    "fmt"
    "os"
    "strings"
    "sync"
    "testing"
    "time"

    "github.com/jackc/pgx/v5/pgxpool"
)


func skipIfNoPostgres(t *testing.T) string {
    t.Helper()
    connStr := os.Getenv("TEST_DB_URL")
    if connStr == "" {
        t.Skip("Skipping test: TEST_DB_URL not provided")
    }

    ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
    defer cancel()
    pool, err := pgxpool.New(ctx, connStr)
    if err != nil {
        t.Skipf("Skipping test: PostgreSQL not available (%v)", err)
    }
    pool.Close()
    return connStr
}

func cleanupTestDB(t *testing.T, store *RiskStore) {
    t.Helper()
    if store == nil || store.pool == nil {
        return
    }
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()
    store.pool.Exec(ctx, "TRUNCATE risk_state, risk_state_history")
}

func TestNewRiskStore(t *testing.T) {
    connStr := skipIfNoPostgres(t)

    store, err := NewRiskStore(connStr)
    if err != nil {
        t.Fatalf("NewRiskStore failed: %v", err)
    }
    defer func() {
        _ = store.Close(context.Background())
    }()

    if store.pool == nil {
        t.Fatal("expected non-nil connection pool")
    }
}

func TestRiskStore_SaveAndLoad(t *testing.T) {
    connStr := skipIfNoPostgres(t)
    store, err := NewRiskStore(connStr)
    if err != nil {
        t.Fatalf("NewRiskStore failed: %v", err)
    }
    defer func() {
        cleanupTestDB(t, store)
        _ = store.Close(context.Background())
    }()

    traderID := "test-trader-save-load"
    store.BindTrader(traderID)

    state := &RiskState{
        TraderID:      traderID,
        DailyPnL:      -123.45,
        DrawdownPct:   15.5,
        CurrentEquity: 980.0,
        PeakEquity:    1200.0,
        TradingPaused: true,
        PausedUntil:   time.Now().Add(30 * time.Minute),
        LastResetTime: time.Now().Add(-6 * time.Hour),
        UpdatedAt:     time.Now(),
    }

    if err := store.Save(state, "trace-001", "test_save"); err != nil {
        t.Fatalf("Save failed: %v", err)
    }

    time.Sleep(500 * time.Millisecond)

    loaded, err := store.Load()
    if err != nil {
        t.Fatalf("Load failed: %v", err)
    }
    if loaded == nil {
        t.Fatal("expected non-nil loaded state")
    }

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
}

func TestRiskStore_LoadWhenNoState(t *testing.T) {
    connStr := skipIfNoPostgres(t)
    store, err := NewRiskStore(connStr)
    if err != nil {
        t.Fatalf("NewRiskStore failed: %v", err)
    }
    defer func() {
        cleanupTestDB(t, store)
        _ = store.Close(context.Background())
    }()

    traderID := "test-trader-no-state"
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
    if loaded.LastResetTime.IsZero() {
        t.Error("LastResetTime should not be zero on new state")
    }
}

func TestRiskStore_PersistenceFailuresAreNonFatal(t *testing.T) {
    store, err := NewRiskStore("postgres://invalid:5432/nonexistent?connect_timeout=1")
    if err == nil {
        t.Fatal("expected error when connecting to invalid db")
    }

    if store != nil {
        _ = store.Close(context.Background())
    }
}

func TestRiskStore_ConcurrentSaves(t *testing.T) {
    connStr := skipIfNoPostgres(t)
    store, err := NewRiskStore(connStr)
    if err != nil {
        t.Fatalf("NewRiskStore failed: %v", err)
    }
    defer func() {
        cleanupTestDB(t, store)
        _ = store.Close(context.Background())
    }()

    traderID := "test-trader-concurrent"
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

    loaded, err := store.Load()
    if err != nil {
        t.Fatalf("Load failed: %v", err)
    }
    if loaded == nil {
        t.Fatal("expected loaded state after concurrent writes")
    }

    expected := float64(workers * iterations)
    if loaded.DailyPnL != expected {
        t.Errorf("DailyPnL mismatch: got %.2f, want %.2f", loaded.DailyPnL, expected)
    }
    if loaded.CurrentEquity != expected {
        t.Errorf("CurrentEquity mismatch: got %.2f, want %.2f", loaded.CurrentEquity, expected)
    }
    if loaded.PeakEquity != expected {
        t.Errorf("PeakEquity mismatch: got %.2f, want %.2f", loaded.PeakEquity, expected)
    }
}

func TestRiskStore_RestartRecovery(t *testing.T) {
    connStr := skipIfNoPostgres(t)

    firstStore, err := NewRiskStore(connStr)
    if err != nil {
        t.Fatalf("NewRiskStore failed: %v", err)
    }
    defer cleanupTestDB(t, firstStore)

    traderID := "test-trader-restart"
    firstStore.BindTrader(traderID)

    originalState := &RiskState{
        TraderID:      traderID,
        DailyPnL:      -56.78,
        DrawdownPct:   12.3,
        CurrentEquity: 950.0,
        PeakEquity:    1100.0,
        TradingPaused: true,
        PausedUntil:   time.Now().Add(20 * time.Minute),
        LastResetTime: time.Now().Add(-4 * time.Hour),
        UpdatedAt:     time.Now(),
    }

    if err := firstStore.Save(originalState, "trace-restart", "before_restart"); err != nil {
        t.Fatalf("Save failed: %v", err)
    }
    time.Sleep(100 * time.Millisecond)
    if err := firstStore.Close(context.Background()); err != nil {
        t.Fatalf("first store close failed: %v", err)
    }

    secondStore, err := NewRiskStore(connStr)
    if err != nil {
        t.Fatalf("NewRiskStore after restart failed: %v", err)
    }
    defer func() {
        _ = secondStore.Close(context.Background())
    }()

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

func TestRiskStore_EmptyConnectionString(t *testing.T) {
    store, err := NewRiskStore("")
    if err == nil {
        t.Fatal("expected error with empty connection string")
    }
    if store != nil {
        t.Fatal("expected nil store with empty connection string")
    }
    if !strings.Contains(err.Error(), "empty") {
        t.Errorf("expected 'empty' error message, got: %v", err)
    }
}

func TestRiskStore_QueueFull(t *testing.T) {
    connStr := skipIfNoPostgres(t)
    store, err := NewRiskStore(connStr)
    if err != nil {
        t.Fatalf("NewRiskStore failed: %v", err)
    }
    defer func() {
        cleanupTestDB(t, store)
        _ = store.Close(context.Background())
    }()

    store.queueSize = 2
    store.BindTrader("test-queue-full")

    state := &RiskState{
        TraderID:      "test-queue-full",
        DailyPnL:      10.0,
        CurrentEquity: 1000.0,
        PeakEquity:    1000.0,
    }

    for i := 0; i < 10; i++ {
        _ = store.Save(state, fmt.Sprintf("trace-%d", i), "flood_test")
    }

    time.Sleep(100 * time.Millisecond)
}
