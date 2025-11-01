# 🚀 [BOUNTY] Integrate Aster Exchange Support

## 💰 Bounty Reward
**To be discussed** - Open to proposals from contributors

## 📋 Overview
We're looking for contributors to add Aster exchange support to NOFX AI Trading System. Currently supports Binance Futures, seeking to expand to Aster perpetual contracts.

## 🎯 Task Requirements

### Core Features to Implement

#### 1. **Aster API Integration**
- [ ] Account management (balance, positions, margin)
- [ ] Market data fetching (K-lines, order book, trades)
- [ ] Order execution (market/limit orders)
- [ ] Position management (open, close, modify)
- [ ] Websocket real-time data stream (if available)

#### 2. **Adapter Layer**
- [ ] Create `trader/aster_perpetual.go` adapter
- [ ] Implement unified interface compatible with existing `BinanceFuturesClient`
- [ ] Handle Aster-specific features (if any)

#### 3. **Configuration Support**
```json
{
  "traders": [
    {
      "id": "aster_trader",
      "name": "Aster AI Trader",
      "exchange": "aster",  // NEW
      "aster_api_key": "xxx",
      "aster_secret_key": "xxx",
      "ai_model": "deepseek",
      "initial_balance": 1000.0
    }
  ]
}
```

#### 4. **Risk Control Adaptation**
- [ ] Adapt position limits for Aster specs
- [ ] Handle leverage rules (may differ from Binance)
- [ ] Implement liquidation price calculation
- [ ] Funding rate integration (if applicable)

#### 5. **Testing & Documentation**
- [ ] Unit tests for API wrapper
- [ ] Integration tests with testnet (if available)
- [ ] Update README with Aster setup guide
- [ ] Add Aster-specific troubleshooting docs

## 📚 Technical References

**Aster Resources:**
- Official Website: [Add Aster exchange URL]
- API Documentation: [Add Aster API docs URL]
- SDK/Libraries: [Add if available]

**NOFX Architecture:**
- See `trader/binance_futures.go` as reference implementation
- Main trading logic: `trader/auto_trader.go`
- Configuration: `config.json` structure

## 🔧 Implementation Guidelines

### File Structure
```
trader/
├── binance_futures.go     (existing reference)
├── aster_perpetual.go     (NEW - to implement)
└── exchange_interface.go  (NEW - unified interface)

config/
└── config.go              (UPDATE - add Aster config)
```

### Interface to Implement
```go
type ExchangeClient interface {
    // Account
    GetAccount() (*AccountInfo, error)
    GetPositions() ([]*Position, error)

    // Market Data
    GetKlines(symbol, interval string, limit int) ([]*Kline, error)
    GetTicker(symbol string) (*Ticker, error)

    // Trading
    CreateOrder(params *OrderParams) (*Order, error)
    ClosePosition(symbol, side string) error

    // Risk Management
    SetLeverage(symbol string, leverage int) error
    GetLiquidationPrice(position *Position) (float64, error)
}
```

## ✅ Acceptance Criteria

**Minimum Requirements:**
- [ ] Can connect to Aster testnet/mainnet
- [ ] Fetch real-time account balance and positions
- [ ] Execute market orders successfully
- [ ] Close positions correctly
- [ ] Calculate accurate P/L
- [ ] No breaking changes to existing Binance integration

**Bonus Points:**
- [ ] Websocket streaming for real-time data
- [ ] Support for limit orders and stop-loss/take-profit
- [ ] Multi-exchange competition mode (Binance vs Aster)
- [ ] Performance comparison dashboard

## 📝 How to Contribute

1. **Comment on this issue** to express interest
2. **Fork the repository** and create a feature branch
3. **Implement the integration** following guidelines above
4. **Test thoroughly** on testnet before mainnet
5. **Submit a Pull Request** with:
   - Code changes
   - Tests
   - Documentation updates
   - Demo video/screenshots

## 🤝 Support & Questions

- Ask questions in this issue's comments
- Join our Telegram: [NOFX Developer Community](https://t.me/nofx_dev_community)
- Reference existing code: `trader/binance_futures.go`

## ⚠️ Important Notes

- **Test on testnet first** - Do NOT test with real funds initially
- **Maintain backward compatibility** - Existing Binance users should not be affected
- **Code quality** - Follow existing code style and patterns
- **Security** - Handle API keys securely, no hardcoded credentials

## 🔍 Research Needed

**Before starting, please investigate:**
- [ ] Does Aster provide a public API? (REST/Websocket)
- [ ] Is there an official SDK or code examples?
- [ ] Does Aster support testnet for development?
- [ ] What are the API rate limits?
- [ ] What symbols/markets are available?
- [ ] Are there any unique features or limitations?

**Share your findings in the comments!**

---

**Ready to contribute?** Comment below or start working and submit a PR!

**Questions?** Feel free to ask in the comments or on Telegram.
