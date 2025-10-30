package risk

import (
	"errors"
	"testing"
	"time"

	"nofx/featureflag"
)

func TestStorePersistFuncErrorsAreNonFatal(t *testing.T) {
	store := NewStore()

	state := featureflag.DefaultState()
	state.EnablePersistence = true
	flags := featureflag.NewRuntimeFlags(state)

	calls := 0
	store.SetPersistFunc(func(traderID string, snapshot Snapshot) error {
		calls++
		if traderID == "" {
			t.Fatalf("expected traderID to be propagated to persist hook")
		}
		if snapshot.DailyPnL == 0 {
			t.Fatalf("expected snapshot daily PnL to reflect update")
		}
		return errors.New("boom")
	})

	value := store.UpdateDailyPnL("trader-nonfatal", 42.5, flags, time.Now())
	if value != 42.5 {
		t.Fatalf("expected UpdateDailyPnL to return 42.5, got %.2f", value)
	}

	if calls != 1 {
		t.Fatalf("expected persistence hook to run once, ran %d times", calls)
	}
}

func TestStorePersistenceDisabledSkipsHook(t *testing.T) {
	store := NewStore()

	state := featureflag.DefaultState()
	state.EnablePersistence = false
	flags := featureflag.NewRuntimeFlags(state)

	calls := 0
	store.SetPersistFunc(func(traderID string, snapshot Snapshot) error {
		calls++
		return nil
	})

	// Record equity and daily pnl to trigger potential persistence.
	store.RecordEquity("trader-disabled", 1000, flags, time.Now())
	store.UpdateDailyPnL("trader-disabled", 10, flags, time.Now())
	store.SetTradingPaused("trader-disabled", true, time.Now().Add(time.Minute), flags)

	if calls != 0 {
		t.Fatalf("expected persistence hook to be skipped, called %d times", calls)
	}
}
