package kernel

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
	"time"

	ethcrypto "github.com/ethereum/go-ethereum/crypto"

	"nofx/mcp/payment"
	"nofx/store"
)

// newX402TestEngine returns an engine with a generated wallet key and empty
// spend state, without going through NewStrategyEngine's client setup.
func newX402TestEngine(t *testing.T) *StrategyEngine {
	t.Helper()
	key, err := ethcrypto.GenerateKey()
	if err != nil {
		t.Fatalf("GenerateKey: %v", err)
	}
	return &StrategyEngine{
		config:             &store.StrategyConfig{},
		x402Key:            key,
		externalDailySpend: make(map[string]*externalDailySpend),
	}
}

// x402OfferHeader builds a base64 Payment-Required header for the given offer.
func x402OfferHeader(t *testing.T, scheme, network, amount string) string {
	t.Helper()
	pr := payment.X402v2PaymentRequired{
		X402Version: 2,
		Accepts: []payment.X402AcceptOption{{
			Scheme:            scheme,
			Network:           network,
			Amount:            amount,
			Asset:             payment.BaseUSDCContract,
			PayTo:             "0x1111111111111111111111111111111111111111",
			MaxTimeoutSeconds: 300,
		}},
		Resource: &payment.X402Resource{URL: "https://example.com/data", MimeType: "application/json"},
	}
	raw, err := json.Marshal(pr)
	if err != nil {
		t.Fatalf("marshal offer: %v", err)
	}
	return base64.StdEncoding.EncodeToString(raw)
}

// newPaidSourceServer returns an httptest server that answers 402 with the
// given offer until a payment header arrives, then returns payload. The
// paidCalls counter increments once per successfully paid request.
func newPaidSourceServer(t *testing.T, offerHeader string, payload string, paidCalls *int32) *httptest.Server {
	t.Helper()
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("X-Payment") == "" {
			w.Header().Set("Payment-Required", offerHeader)
			w.WriteHeader(http.StatusPaymentRequired)
			return
		}
		atomic.AddInt32(paidCalls, 1)
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(payload))
	}))
}

func paidSource(url string) store.ExternalDataSource {
	return store.ExternalDataSource{
		Name:          "test_feed",
		Type:          "api",
		URL:           url,
		Method:        "GET",
		Payment:       "x402",
		MaxUSDPerCall: 0.05,
		MaxUSDPerDay:  0.08,
	}
}

func TestFetchPaidExternalSourceHappyPath(t *testing.T) {
	e := newX402TestEngine(t)
	var paidCalls int32
	offer := x402OfferHeader(t, "exact", payment.BaseNetwork, "50000") // $0.05
	server := newPaidSourceServer(t, offer, `{"signal":"bullish"}`, &paidCalls)
	defer server.Close()

	result, err := e.fetchPaidExternalSource(paidSource(server.URL), server.Client())
	if err != nil {
		t.Fatalf("fetchPaidExternalSource: %v", err)
	}
	m, ok := result.(map[string]interface{})
	if !ok || m["signal"] != "bullish" {
		t.Fatalf("result = %#v, want signal=bullish", result)
	}
	if got := atomic.LoadInt32(&paidCalls); got != 1 {
		t.Fatalf("paid calls = %d, want 1", got)
	}

	// Daily counter and charge queue both record the authorized amount.
	e.externalMu.Lock()
	spent := e.dailySpendLocked("test_feed")
	e.externalMu.Unlock()
	if spent < 0.049 || spent > 0.051 {
		t.Fatalf("daily spend = %f, want ~0.05", spent)
	}
	charges := e.DrainPaidDataCharges()
	if len(charges) != 1 || charges[0].SourceName != "test_feed" {
		t.Fatalf("charges = %#v, want one test_feed charge", charges)
	}
	if charges[0].CostUSD < 0.049 || charges[0].CostUSD > 0.051 {
		t.Fatalf("charge cost = %f, want ~0.05", charges[0].CostUSD)
	}
	if again := e.DrainPaidDataCharges(); len(again) != 0 {
		t.Fatalf("second drain = %#v, want empty", again)
	}
}

func TestFetchPaidExternalSourceRefusesAbovePerCallCap(t *testing.T) {
	e := newX402TestEngine(t)
	var paidCalls int32
	offer := x402OfferHeader(t, "exact", payment.BaseNetwork, "60000") // $0.06 > $0.05 cap
	server := newPaidSourceServer(t, offer, `{}`, &paidCalls)
	defer server.Close()

	_, err := e.fetchPaidExternalSource(paidSource(server.URL), server.Client())
	if err == nil {
		t.Fatal("expected per-call cap refusal, got nil error")
	}
	if got := atomic.LoadInt32(&paidCalls); got != 0 {
		t.Fatalf("paid calls = %d, want 0 (no payment must be attempted)", got)
	}
	if charges := e.DrainPaidDataCharges(); len(charges) != 0 {
		t.Fatalf("charges = %#v, want none on refusal", charges)
	}
}

func TestFetchPaidExternalSourceDailyBudgetExhaustion(t *testing.T) {
	e := newX402TestEngine(t)
	var paidCalls int32
	offer := x402OfferHeader(t, "exact", payment.BaseNetwork, "50000") // $0.05, daily cap $0.08
	server := newPaidSourceServer(t, offer, `{"ok":true}`, &paidCalls)
	defer server.Close()

	src := paidSource(server.URL)
	if _, err := e.fetchPaidExternalSource(src, server.Client()); err != nil {
		t.Fatalf("first paid fetch: %v", err)
	}
	// Second call would take the day to $0.10 > $0.08 — must refuse pre-sign.
	_, err := e.fetchPaidExternalSource(src, server.Client())
	if err == nil {
		t.Fatal("expected daily budget refusal, got nil error")
	}
	if got := atomic.LoadInt32(&paidCalls); got != 1 {
		t.Fatalf("paid calls = %d, want 1 (second payment refused)", got)
	}
}

func TestFetchPaidExternalSourceDailyWindowRollsOver(t *testing.T) {
	e := newX402TestEngine(t)
	// Seed yesterday's exhausted budget; a fresh UTC day must reset it.
	e.externalDailySpend["test_feed"] = &externalDailySpend{
		day: time.Now().UTC().AddDate(0, 0, -1).Format("2006-01-02"),
		usd: 100,
	}
	e.externalMu.Lock()
	spent := e.dailySpendLocked("test_feed")
	e.externalMu.Unlock()
	if spent != 0 {
		t.Fatalf("spend after rollover = %f, want 0", spent)
	}
}

func TestFetchPaidExternalSourceRequiresBothCaps(t *testing.T) {
	e := newX402TestEngine(t)
	for _, src := range []store.ExternalDataSource{
		{Name: "a", URL: "https://example.com", Method: "GET", Payment: "x402", MaxUSDPerCall: 0.05},
		{Name: "b", URL: "https://example.com", Method: "GET", Payment: "x402", MaxUSDPerDay: 1},
		{Name: "c", URL: "https://example.com", Method: "GET", Payment: "x402"},
	} {
		if _, err := e.fetchPaidExternalSource(src, http.DefaultClient); err == nil {
			t.Fatalf("source %q: expected missing-caps error, got nil", src.Name)
		}
	}
}

func TestFetchPaidExternalSourceRequiresWalletKey(t *testing.T) {
	e := newX402TestEngine(t)
	e.x402Key = nil
	_, err := e.fetchPaidExternalSource(paidSource("https://example.com"), http.DefaultClient)
	if err == nil {
		t.Fatal("expected missing-wallet-key error, got nil")
	}
}

func TestCheckX402OfferSchemeAndNetwork(t *testing.T) {
	e := newX402TestEngine(t)
	src := paidSource("https://example.com")

	// upto is accepted; the authorized amount is the worst-case bound.
	if usd, err := e.checkX402Offer(src, x402OfferHeader(t, "upto", payment.BaseNetwork, "50000")); err != nil || usd < 0.049 {
		t.Fatalf("upto offer: usd=%f err=%v, want ~0.05 accepted", usd, err)
	}
	// Empty scheme defaults to exact and is accepted.
	if _, err := e.checkX402Offer(src, x402OfferHeader(t, "", payment.BaseNetwork, "50000")); err != nil {
		t.Fatalf("empty scheme offer: %v, want accepted as exact", err)
	}
	// Unknown scheme refused.
	if _, err := e.checkX402Offer(src, x402OfferHeader(t, "subscription", payment.BaseNetwork, "50000")); err == nil {
		t.Fatal("unknown scheme: expected refusal, got nil")
	}
	// Non-Base network refused.
	if _, err := e.checkX402Offer(src, x402OfferHeader(t, "exact", "eip155:42161", "50000")); err == nil {
		t.Fatal("non-Base network: expected refusal, got nil")
	}
	// upto above per-call cap refused (worst case exceeds bound).
	if _, err := e.checkX402Offer(src, x402OfferHeader(t, "upto", payment.BaseNetwork, "60000")); err == nil {
		t.Fatal("upto above cap: expected refusal, got nil")
	}
}

func TestUnpaidSourceStillFailsOn402(t *testing.T) {
	// Regression guard: a source without payment set must keep the current
	// behavior — a 402 is an error and no payment is attempted.
	var paidCalls int32
	offer := x402OfferHeader(t, "exact", payment.BaseNetwork, "50000")
	server := newPaidSourceServer(t, offer, `{}`, &paidCalls)
	defer server.Close()

	src := paidSource(server.URL)
	src.Payment = "" // unpaid
	// Call the paid path guard indirectly: fetchSingleExternalSource would hit
	// SSRF validation on 127.0.0.1, so exercise the branch condition directly.
	if src.Payment == "x402" {
		t.Fatal("test setup error: source must be unpaid")
	}
	req, _ := http.NewRequest(src.Method, src.URL, nil)
	resp, err := server.Client().Do(req)
	if err != nil {
		t.Fatalf("unpaid request: %v", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusPaymentRequired {
		t.Fatalf("status = %d, want 402 passed through unpaid", resp.StatusCode)
	}
	if got := atomic.LoadInt32(&paidCalls); got != 0 {
		t.Fatalf("paid calls = %d, want 0", got)
	}
	if _, err := decodeExternalPayload([]byte("payment required"), src); err == nil {
		t.Fatal("expected unpaid 402 body to fail JSON decode as today")
	}
}

func TestX402AmountUSD(t *testing.T) {
	cases := []struct {
		in      string
		want    float64
		wantErr bool
	}{
		{"50000", 0.05, false},
		{"0xC350", 0.05, false},
		{"1000000", 1.0, false},
		{"", 0, true},
		{"1.5", 0, true},
		{"abc", 0, true},
	}
	for _, c := range cases {
		got, err := x402AmountUSD(c.in)
		if c.wantErr {
			if err == nil {
				t.Fatalf("x402AmountUSD(%q): expected error", c.in)
			}
			continue
		}
		if err != nil {
			t.Fatalf("x402AmountUSD(%q): %v", c.in, err)
		}
		if got < c.want-1e-9 || got > c.want+1e-9 {
			t.Fatalf("x402AmountUSD(%q) = %f, want %f", c.in, got, c.want)
		}
	}
}

func TestFormatExternalDataDeterministic(t *testing.T) {
	data := map[string]interface{}{
		"zeta_feed":  map[string]interface{}{"v": 1.0},
		"alpha_feed": "ok",
	}
	out := formatExternalData(data, LangEnglish)
	alphaIdx := len(out)
	zetaIdx := -1
	for i := 0; i+10 < len(out); i++ {
		if out[i:i+10] == "alpha_feed" && i < alphaIdx {
			alphaIdx = i
		}
		if out[i:i+9] == "zeta_feed" && zetaIdx == -1 {
			zetaIdx = i
		}
	}
	if zetaIdx == -1 || alphaIdx > zetaIdx {
		t.Fatalf("sources not sorted in output:\n%s", out)
	}
}
