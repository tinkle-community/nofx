package mexcpaper

import (
	"math"
	"path/filepath"
	"testing"
	"time"
)

type fakePrices struct {
	values map[string]float64
}

func (f *fakePrices) GetPrice(symbol string) (float64, error) {
	return f.values[symbol], nil
}

func TestPaperTraderTakeProfitAndPersistence(t *testing.T) {
	dir := t.TempDir()
	prices := &fakePrices{values: map[string]float64{"BTCUSDT": 1000}}
	trader, err := newMEXCPaperTrader("account-1", 1000, dir, prices)
	if err != nil {
		t.Fatal(err)
	}

	open, err := trader.OpenLong("BTC/USDT", 0.1, 10)
	if err != nil {
		t.Fatalf("OpenLong: %v", err)
	}
	if open["paperTrading"] != true || open["status"] != "FILLED" {
		t.Fatalf("unexpected open result: %+v", open)
	}
	if err := trader.SetStopLoss("BTCUSDT", "LONG", 0.1, 900); err != nil {
		t.Fatalf("SetStopLoss: %v", err)
	}
	if err := trader.SetTakeProfit("BTCUSDT", "LONG", 0.1, 1100); err != nil {
		t.Fatalf("SetTakeProfit: %v", err)
	}

	prices.values["BTCUSDT"] = 1100
	positions, err := trader.GetPositions()
	if err != nil {
		t.Fatalf("GetPositions: %v", err)
	}
	if len(positions) != 0 {
		t.Fatalf("take profit did not close position: %+v", positions)
	}

	balance, err := trader.GetBalance()
	if err != nil {
		t.Fatalf("GetBalance: %v", err)
	}
	wantEquity := 1009.895 // +10 PnL - 0.05 open fee - 0.055 close fee.
	if got := balance["totalEquity"].(float64); math.Abs(got-wantEquity) > 1e-9 {
		t.Fatalf("totalEquity = %.8f, want %.8f", got, wantEquity)
	}
	closed, err := trader.GetClosedPnL(time.Time{}, 10)
	if err != nil || len(closed) != 1 || closed[0].CloseType != "take_profit" {
		t.Fatalf("unexpected closed PnL: %+v, %v", closed, err)
	}

	path, _ := filepath.Abs(filepath.Join(dir, "account-1.json"))
	accountRegistry.Lock()
	delete(accountRegistry.stores, path)
	accountRegistry.Unlock()
	reloaded, err := newMEXCPaperTrader("account-1", 500, dir, prices)
	if err != nil {
		t.Fatalf("reload: %v", err)
	}
	reloadedBalance, err := reloaded.GetBalance()
	if err != nil {
		t.Fatalf("reloaded balance: %v", err)
	}
	if got := reloadedBalance["totalEquity"].(float64); math.Abs(got-wantEquity) > 1e-9 {
		t.Fatalf("reloaded equity = %.8f, want %.8f", got, wantEquity)
	}
}

func TestPaperTraderShortStopLossAndInsufficientMargin(t *testing.T) {
	prices := &fakePrices{values: map[string]float64{"BTCUSDT": 100}}
	trader, err := newMEXCPaperTrader("account-2", 100, t.TempDir(), prices)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := trader.OpenLong("BTCUSDT", 100, 1); err == nil {
		t.Fatal("expected insufficient-margin error")
	}
	if _, err := trader.OpenShort("BTCUSDT", 1, 5); err != nil {
		t.Fatalf("OpenShort: %v", err)
	}
	if err := trader.SetStopLoss("BTCUSDT", "SHORT", 1, 110); err != nil {
		t.Fatalf("SetStopLoss: %v", err)
	}
	prices.values["BTCUSDT"] = 110
	positions, err := trader.GetPositions()
	if err != nil {
		t.Fatalf("GetPositions: %v", err)
	}
	if len(positions) != 0 {
		t.Fatalf("stop loss did not close position: %+v", positions)
	}
	closed, err := trader.GetClosedPnL(time.Time{}, 10)
	if err != nil || len(closed) != 1 || closed[0].RealizedPnL != -10 {
		t.Fatalf("unexpected short close: %+v, %v", closed, err)
	}
}
