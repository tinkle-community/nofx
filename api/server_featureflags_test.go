package api

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"nofx/featureflag"
	"nofx/manager"
)

type featureFlagResponse struct {
	Flags featureflag.State `json:"flags"`
}

func newTestServer(t *testing.T, flags *featureflag.RuntimeFlags) *Server {
	t.Helper()

	tm := manager.NewTraderManager(flags)
	return NewServer(tm, 0)
}

func TestHandleFeatureFlagsUpdateReturnsSnapshotOnEmptyBody(t *testing.T) {
	flags := featureflag.NewRuntimeFlags(featureflag.DefaultState())
	srv := newTestServer(t, flags)

	req := httptest.NewRequest(http.MethodPost, "/admin/feature-flags", nil)
	rec := httptest.NewRecorder()

	srv.router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var resp featureFlagResponse
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	snapshot := flags.Snapshot()
	if resp.Flags != snapshot {
		t.Fatalf("expected snapshot %+v, got %+v", snapshot, resp.Flags)
	}
}

func TestHandleFeatureFlagsUpdateAppliesPatch(t *testing.T) {
	initial := featureflag.State{
		EnableGuardedStopLoss: true,
		EnableMutexProtection: true,
		EnablePersistence:     true,
		EnableRiskEnforcement: true,
	}
	flags := featureflag.NewRuntimeFlags(initial)
	srv := newTestServer(t, flags)

	body := `{"enable_mutex_protection":false,"enable_persistence":false}`
	req := httptest.NewRequest(http.MethodPost, "/admin/feature-flags", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	srv.router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var resp featureFlagResponse
	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Flags.EnableMutexProtection {
		t.Fatalf("expected mutex protection to be disabled in response, got %+v", resp.Flags)
	}
	if resp.Flags.EnablePersistence {
		t.Fatalf("expected persistence to be disabled in response, got %+v", resp.Flags)
	}
	if !resp.Flags.EnableGuardedStopLoss || !resp.Flags.EnableRiskEnforcement {
		t.Fatalf("unexpected toggled flags in response: %+v", resp.Flags)
	}

	if flags.MutexProtectionEnabled() {
		t.Fatalf("expected runtime mutex protection flag to be disabled")
	}
	if flags.PersistenceEnabled() {
		t.Fatalf("expected runtime persistence flag to be disabled")
	}
	if !flags.GuardedStopLossEnabled() {
		t.Fatalf("guarded stop-loss flag should remain enabled")
	}
	if !flags.RiskEnforcementEnabled() {
		t.Fatalf("risk enforcement flag should remain enabled")
	}

	req2 := httptest.NewRequest(http.MethodPost, "/admin/feature-flags", nil)
	rec2 := httptest.NewRecorder()
	srv.router.ServeHTTP(rec2, req2)
	if rec2.Code != http.StatusOK {
		t.Fatalf("expected status 200 when fetching updated snapshot, got %d", rec2.Code)
	}

	var resp2 featureFlagResponse
	if err := json.NewDecoder(rec2.Body).Decode(&resp2); err != nil {
		t.Fatalf("failed to decode snapshot response: %v", err)
	}

	if resp2.Flags != resp.Flags {
		t.Fatalf("expected persisted flags %+v, got %+v", resp.Flags, resp2.Flags)
	}
}
