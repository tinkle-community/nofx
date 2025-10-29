# 🤖 NOFX - AI-Driven Binance Futures Auto Trading Competition System

[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?style=flat&logo=go)](https://golang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Languages:** [English](README.md) | [中文](README.zh-CN.md) | [Українська](README.uk.md) | [Русский](README.ru.md)

---

An automated Binance futures trading system powered by **DeepSeek/Qwen AI**, supporting **multi-AI model live trading competition**, featuring comprehensive market analysis, AI decision-making, **self-learning mechanism**, and professional Web monitoring interface.

> ⚠️ **Risk Warning**: This system is experimental. AI auto-trading carries significant risks. Strongly recommended for learning/research purposes or testing with small amounts only!

## 👥 Developer Community

Join our Telegram developer community to discuss, share ideas, and get support:

**💬 [NOFX Developer Community](https://t.me/nofx_dev_community)**

---

## ✨ Core Features

### 🏆 Multi-AI Competition Mode
- **Qwen vs DeepSeek** live trading battle
- Independent account management and decision logs
- Real-time performance comparison charts
- ROI PK and win rate statistics

### 🧠 AI Self-Learning Mechanism (NEW!)
- **Historical Feedback**: Analyzes last 20 cycles of trading performance before each decision
- **Smart Optimization**:
  - Identifies best/worst performing coins
  - Calculates win rate, profit/loss ratio, average profit
  - Avoids repeating mistakes (consecutive losing coins)
  - Reinforces successful strategies (high win rate patterns)
- **Dynamic Adjustment**: AI autonomously adjusts trading style based on historical performance

### 📊 Intelligent Market Analysis
- **3-minute K-line**: Real-time price, EMA20, MACD, RSI(7)
- **4-hour K-line**: Long-term trend, EMA20/50, ATR, RSI(14)
- **Open Interest Analysis**: Market sentiment, capital flow judgment
- **OI Top Tracking**: Top 20 coins with fastest growing open interest
- **AI500 Coin Pool**: Automatic high-score coin screening
- **Liquidity Filter**: Auto-filters low liquidity coins (<15M USD position value)

### 🎯 Professional Risk Control
- **Per-Coin Position Limit**:
  - Altcoins ≤ 1.5x account equity
  - BTC/ETH ≤ 10x account equity
- **Fixed Leverage**: Altcoins 20x | BTC/ETH 50x
- **Margin Management**: Total usage ≤90%, AI autonomous decision on usage rate
- **Risk-Reward Ratio**: Mandatory ≥1:2 (stop-loss:take-profit)
- **Prevent Position Stacking**: No duplicate opening of same coin/direction

### 🎨 Professional UI
- **Professional Trading Interface**: Binance-style visual design
- **Dark Theme**: Classic color scheme (Gold #F0B90B + dark background)
- **Real-time Data**: 5-second refresh for accounts, positions, charts
- **Equity Curve**: Historical account value trend (USD/percentage toggle)
- **Performance Comparison Chart**: Real-time multi-AI ROI comparison
- **Smooth Animations**: Fluid hover, transition, and loading effects

### 📝 Complete Decision Recording
- **Chain of Thought**: AI's complete reasoning process (CoT)
- **Historical Performance**: Overall win rate, average profit, profit/loss ratio
- **Recent Trades**: Last 5 trade details (entry price → exit price → P/L%)
- **Coin Statistics**: Per-coin performance (win rate, average P/L)
- **JSON Logs**: Complete decision records for post-trade analysis

---

## 🏗️ Technical Architecture

```
nofx/
├── main.go                          # Program entry (multi-trader manager)
├── config.json                      # Configuration file (API keys, multi-trader config)
│
├── api/                            # HTTP API service
│   └── server.go                   # Gin framework, RESTful API
│
├── trader/                         # Trading core
│   ├── auto_trader.go              # Auto trading main controller (single trader)
│   └── binance_futures.go          # Binance futures API wrapper
│
├── manager/                        # Multi-trader management
│   └── trader_manager.go           # Manages multiple trader instances
│
├── market/                         # Market data & AI decisions
│   ├── market_data.go              # Market data fetching (K-line, indicators)
│   ├── ai_decision_engine.go       # AI decision engine (with historical feedback)
│   └── ai_signal.go                # AI API calls (DeepSeek/Qwen)
│
├── pool/                           # Coin pool management
│   └── coin_pool.go                # AI500 + OI Top merged pool
│
├── logger/                         # Logging system
│   └── decision_logger.go          # Decision recording + performance analysis
│
├── decision_logs/                  # Decision log storage
│   ├── trader1/                    # Trader 1 logs
│   └── trader2/                    # Trader 2 logs
│
└── web/                            # React frontend
    ├── src/
    │   ├── components/             # React components
    │   │   ├── EquityChart.tsx     # Equity curve chart
    │   │   ├── ComparisonChart.tsx # Multi-AI comparison chart
    │   │   └── CompetitionPage.tsx # Competition leaderboard
    │   ├── lib/api.ts              # API call wrapper
    │   ├── types/index.ts          # TypeScript types
    │   ├── index.css               # Binance-style CSS
    │   └── App.tsx                 # Main app
    └── package.json
```

### Core Dependencies

**Backend (Go)**
- `github.com/adshao/go-binance/v2` - Binance API client
- `github.com/markcheno/go-talib` - Technical indicator calculation (TA-Lib)
- `github.com/gin-gonic/gin` - HTTP API framework

**Frontend (React + TypeScript)**
- `react` + `react-dom` - UI framework
- `recharts` - Chart library (equity curve, comparison charts)
- `swr` - Data fetching and caching
- `tailwindcss` - CSS framework

---

## 🚀 Quick Start

### 1. Environment Requirements

- **Go 1.21+**
- **Node.js 18+**
- **TA-Lib** library (technical indicator calculation)

#### Installing TA-Lib

**macOS:**
```bash
brew install ta-lib
```

**Ubuntu/Debian:**
```bash
sudo apt-get install libta-lib0-dev
```

**Other systems**: Refer to [TA-Lib Official Documentation](https://github.com/markcheno/go-talib)

### 2. Clone the Project

```bash
git clone https://github.com/tinkle-community/nofx.git
cd nofx
```

### 3. Install Dependencies

**Backend:**
```bash
go mod download
```

**Frontend:**
```bash
cd web
npm install
cd ..
```

### 4. System Configuration

Create `config.json` file (use `config.json.example` as template):

```json
{
  "traders": [
    {
      "id": "qwen_trader",
      "name": "Qwen AI Trader",
      "ai_model": "qwen",
      "binance_api_key": "YOUR_BINANCE_API_KEY",
      "binance_secret_key": "YOUR_BINANCE_SECRET_KEY",
      "use_qwen": true,
      "qwen_key": "sk-xxxxx",
      "scan_interval_minutes": 3,
      "initial_balance": 1000.0
    },
    {
      "id": "deepseek_trader",
      "name": "DeepSeek AI Trader",
      "ai_model": "deepseek",
      "binance_api_key": "YOUR_BINANCE_API_KEY_2",
      "binance_secret_key": "YOUR_BINANCE_SECRET_KEY_2",
      "use_qwen": false,
      "deepseek_key": "sk-xxxxx",
      "scan_interval_minutes": 3,
      "initial_balance": 1000.0
    }
  ],
  "coin_pool_api_url": "http://x.x.x.x:xxx/api/ai500/list?auth=YOUR_AUTH",
  "oi_top_api_url": "http://x.x.x.x:xxx/api/oi/top?auth=YOUR_AUTH",
  "api_server_port": 8080
}
```

**Configuration Notes:**
- `traders`: Configure 1-N traders (single AI or multi-AI competition)
- `id`: Unique trader identifier (used for log directory)
- `ai_model`: "qwen" or "deepseek"
- `binance_api_key/secret_key`: Each trader uses independent Binance account
- `initial_balance`: Initial balance (for calculating P/L%)
- `scan_interval_minutes`: Decision cycle (recommended 3-5 minutes)
- `coin_pool_api_url`: AI500 coin pool API (optional)
- `oi_top_api_url`: OI Top open interest API (optional)

### 5. Run the System

**Start backend (AI trading system + API server):**

```bash
go build -o nofx
./nofx
```

**Start frontend (Web Dashboard):**

Open a new terminal:

```bash
cd web
npm run dev
```

**Access the interface:**
```
Web Dashboard: http://localhost:3000
API Server: http://localhost:8080
```

### 6. Stop the System

Press `Ctrl+C` in both terminals

---

## 📖 AI Decision Flow

Each decision cycle (default 3 minutes), the system runs the following process:

```
┌─────────────────────────────────────────────────────┐
│ 1. Analyze Historical Performance (last 20 cycles)  │
├─────────────────────────────────────────────────────┤
│  ✓ Calculate overall win rate, avg profit, P/L ratio│
│  ✓ Statistics for each coin (win rate, avg P/L)    │
│  ✓ Identify best/worst coins                        │
│  ✓ List last 5 trade details                        │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 2. Get Account Status                               │
├─────────────────────────────────────────────────────┤
│  • Account equity, available balance                │
│  • Number of positions, total P/L                   │
│  • Margin usage rate                                │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 3. Analyze Existing Positions (if any)              │
├─────────────────────────────────────────────────────┤
│  • Get market data for each position                │
│  • Calculate technical indicators (RSI, MACD, EMA)  │
│  • AI decides whether to close positions            │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 4. Evaluate New Opportunities (candidate coin pool) │
├─────────────────────────────────────────────────────┤
│  • Get AI500 high-score coins (top 20)              │
│  • Get OI Top growing coins (top 20)                │
│  • Merge and deduplicate, filter low liquidity      │
│  • Batch fetch market data and technical indicators │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 5. AI Comprehensive Decision                        │
├─────────────────────────────────────────────────────┤
│  • Review historical feedback (win rate, best/worst)│
│  • Chain of Thought analysis                        │
│  • Output decision: close/open/hold/wait            │
│  • Includes leverage, position size, SL, TP         │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 6. Execute Trades                                   │
├─────────────────────────────────────────────────────┤
│  • Priority: close first, then open                 │
│  • Auto-adapt precision (LOT_SIZE)                  │
│  • Prevent position stacking (reject duplicate)     │
│  • Auto-cancel all orders after closing             │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 7. Record Logs                                      │
├─────────────────────────────────────────────────────┤
│  • Save complete decision to decision_logs/         │
│  • Includes CoT, decision JSON, account snapshot    │
└─────────────────────────────────────────────────────┘
```

---

## 🧠 AI Self-Learning Example

### Historical Feedback (Auto-added to Prompt)

```markdown
## 📊 Historical Performance Feedback

### Overall Performance
- **Total Trades**: 15 (Profit: 8 | Loss: 7)
- **Win Rate**: 53.3%
- **Average Profit**: +3.2% | Average Loss: -2.1%
- **Profit/Loss Ratio**: 1.52:1

### Recent Trades
1. BTCUSDT LONG: 95000.0000 → 97500.0000 = +2.63% ✓
2. ETHUSDT SHORT: 3500.0000 → 3450.0000 = +1.43% ✓
3. SOLUSDT LONG: 185.0000 → 180.0000 = -2.70% ✗
4. BNBUSDT LONG: 610.0000 → 625.0000 = +2.46% ✓
5. ADAUSDT LONG: 0.8500 → 0.8300 = -2.35% ✗

### Coin Performance
- **Best**: BTCUSDT (Win rate 75%, avg +2.5%)
- **Worst**: SOLUSDT (Win rate 25%, avg -1.8%)
```

### How AI Uses Feedback

1. **Avoid consecutive losers**: Seeing SOLUSDT with 3 consecutive stop-losses, AI avoids or is more cautious
2. **Reinforce successful strategies**: BTC breakout long with 75% win rate, AI continues this pattern
3. **Dynamic style adjustment**: Win rate <40% → conservative; P/L ratio >2 → maintain aggressive
4. **Identify market conditions**: Consecutive losses may indicate choppy market, reduce trading frequency

---

## 📊 Web Interface Features

### 1. Competition Page

- **🏆 Leaderboard**: Real-time ROI ranking, golden border highlights leader
- **📈 Performance Comparison**: Dual AI ROI curve comparison (purple vs blue)
- **⚔️ Head-to-Head**: Direct comparison showing lead margin
- **Real-time Data**: Total equity, P/L%, position count, margin usage

### 2. Details Page

- **Equity Curve**: Historical trend chart (USD/percentage toggle)
- **Statistics**: Total cycles, success/fail, open/close stats
- **Position Table**: All position details (entry price, current price, P/L%, liquidation price)
- **AI Decision Logs**: Recent decision records (expandable CoT)

### 3. Real-time Updates

- System status, account info, position list: **5-second refresh**
- Decision logs, statistics: **10-second refresh**
- Equity charts: **10-second refresh**

---

## 🎛️ API Endpoints

### Competition Related

```bash
GET /api/competition          # Competition leaderboard (all traders)
GET /api/traders              # Trader list
```

### Single Trader Related

```bash
GET /api/status?trader_id=xxx            # System status
GET /api/account?trader_id=xxx           # Account info
GET /api/positions?trader_id=xxx         # Position list
GET /api/equity-history?trader_id=xxx    # Equity history (chart data)
GET /api/decisions/latest?trader_id=xxx  # Latest 5 decisions
GET /api/statistics?trader_id=xxx        # Statistics
```

### System Endpoints

```bash
GET /health                   # Health check
GET /api/config               # System configuration
```

---

## ⚠️ Important Risk Warnings

### Trading Risks

1. **Cryptocurrency markets are extremely volatile**, AI decisions don't guarantee profit
2. **Futures trading uses leverage**, losses may exceed principal
3. **Extreme market conditions** may lead to liquidation risk
4. **Funding rates** may affect holding costs
5. **Liquidity risk**: Some coins may experience slippage

### Technical Risks

1. **Network latency** may cause price slippage
2. **API rate limits** may affect trade execution
3. **AI API timeouts** may cause decision failures
4. **System bugs** may trigger unexpected behavior

### Usage Recommendations

✅ **Recommended**
- Use only funds you can afford to lose for testing
- Start with small amounts (recommended 100-500 USDT)
- Regularly check system operation status
- Monitor account balance changes
- Analyze AI decision logs to understand strategy

❌ **Not Recommended**
- Invest all funds or borrowed money
- Run unsupervised for long periods
- Blindly trust AI decisions
- Use without understanding the system
- Run during extreme market volatility

---

## 🛠️ Common Issues

### 1. Compilation error: TA-Lib not found

**Solution**: Install TA-Lib library
```bash
# macOS
brew install ta-lib

# Ubuntu
sudo apt-get install libta-lib0-dev
```

### 2. Precision error: Precision is over the maximum

**Solution**: System auto-handles precision from Binance LOT_SIZE. If error persists, check network connection.

### 3. AI API timeout

**Solution**:
- Check if API key is correct
- Check network connection (may need proxy)
- System timeout is set to 120 seconds

### 4. Frontend can't connect to backend

**Solution**:
- Ensure backend is running (http://localhost:8080)
- Check if port 8080 is occupied
- Check browser console for errors

### 5. Coin pool API failure

**Solution**:
- Coin pool API is optional
- If API fails, system uses default mainstream coins (BTC, ETH, etc.)
- Check API URL and auth parameter in config.json

---

## 📈 Performance Optimization Tips

1. **Set reasonable decision cycle**: Recommended 3-5 minutes, avoid over-trading
2. **Control candidate coin count**: System defaults to AI500 top 20 + OI Top top 20
3. **Regularly clean logs**: Avoid excessive disk usage
4. **Monitor API call count**: Avoid triggering Binance rate limits
5. **Test with small capital**: First test with 100-500 USDT for strategy validation

---

## 🔄 Changelog

### v2.0.1 (2025-10-29)

**Bug Fixes:**
- ✅ Fixed ComparisonChart data processing logic - switched from cycle_number to timestamp grouping
- ✅ Resolved chart freezing issue when backend restarts and cycle_number resets
- ✅ Improved chart data display - now shows all historical data points chronologically
- ✅ Enhanced debugging logs for better troubleshooting

### v2.0.0 (2025-10-28)

**Major Updates:**
- ✅ AI self-learning mechanism (historical feedback, performance analysis)
- ✅ Multi-trader competition mode (Qwen vs DeepSeek)
- ✅ Binance-style UI (complete Binance interface imitation)
- ✅ Performance comparison charts (real-time ROI comparison)
- ✅ Risk control optimization (per-coin position limit adjustment)

**Bug Fixes:**
- Fixed hardcoded initial balance issue
- Fixed multi-trader data sync issue
- Optimized chart data alignment (using cycle_number)

### v1.0.0 (2025-10-27)
- Initial release
- Basic AI trading functionality
- Decision logging system
- Simple Web interface

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🤝 Contributing

Issues and Pull Requests are welcome!

### Development Guide

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📬 Contact

- **Twitter/X**: [@Web3Tinkle](https://x.com/Web3Tinkle)
- **GitHub Issues**: [Submit an Issue](https://github.com/tinkle-community/nofx/issues)

---

## 🙏 Acknowledgments

- [Binance API](https://binance-docs.github.io/apidocs/futures/en/) - Binance Futures API
- [DeepSeek](https://platform.deepseek.com/) - DeepSeek AI API
- [Qwen](https://dashscope.aliyuncs.com/) - Alibaba Cloud Qwen
- [TA-Lib](https://ta-lib.org/) - Technical indicator library
- [Recharts](https://recharts.org/) - React chart library

---

**Last Updated**: 2025-10-29

**⚡ Explore the possibilities of quantitative trading with the power of AI!**
