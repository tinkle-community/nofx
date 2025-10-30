# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NOFX is an AI-driven cryptocurrency futures auto-trading competition system that enables multiple AI models (DeepSeek, Qwen, or custom OpenAI-compatible APIs) to trade against each other on Binance, Hyperliquid, and Aster DEX exchanges. The system features:

- Multi-trader competition mode with real-time performance comparison
- AI self-learning mechanism using historical trading feedback
- Professional Web monitoring dashboard (React + TypeScript)
- Unified exchange abstraction layer supporting multiple platforms
- Comprehensive decision logging and performance analysis

## Development Commands

### Backend (Go)

```bash
# Build the backend
go build -o nofx

# Run the backend (requires config.json)
./nofx

# Run with custom config file
./nofx path/to/config.json

# Download dependencies
go mod download
```

### Frontend (React + TypeScript)

```bash
cd web

# Install dependencies
npm install

# Run development server (default: http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm preview
```

### Docker Deployment

```bash
# One-click start (builds and runs both backend and frontend)
./start.sh start --build

# View logs
./start.sh logs

# Check status
./start.sh status

# Stop services
./start.sh stop

# Restart services
./start.sh restart

# Alternative: Direct docker compose commands
docker compose up -d --build
docker compose logs -f
docker compose down
```

**Note**: This project uses Docker Compose V2 syntax (with spaces, not hyphen).

## Architecture Overview

### High-Level Structure

The system follows a multi-layer architecture:

```
main.go (entry point)
    ↓
TraderManager (manager/trader_manager.go)
    ↓
AutoTrader instances (trader/auto_trader.go) - one per AI competitor
    ↓
├── Exchange Layer (Trader interface)
│   ├── BinanceFutures (trader/binance_futures.go)
│   ├── HyperliquidTrader (trader/hyperliquid_trader.go)
│   └── AsterTrader (trader/aster_trader.go)
├── AI Layer (mcp/client.go)
│   ├── DeepSeek
│   ├── Qwen
│   └── Custom OpenAI-compatible APIs
├── Decision Engine (decision/engine.go)
├── Market Data (market/data.go)
├── Coin Pool (pool/coin_pool.go)
└── Decision Logger (logger/decision_logger.go)
    ↓
API Server (api/server.go) - Gin REST API
    ↓
React Frontend (web/) - SWR for data fetching
```

### Key Architectural Patterns

**1. Unified Exchange Abstraction**

The `Trader` interface ([trader/interface.go](trader/interface.go)) provides a common API for all exchanges:

```go
type Trader interface {
    GetBalance() (map[string]interface{}, error)
    GetPositions() ([]map[string]interface{}, error)
    OpenLong(symbol string, quantity float64, leverage int) (map[string]interface{}, error)
    OpenShort(symbol string, quantity float64, leverage int) (map[string]interface{}, error)
    CloseLong(symbol string, quantity float64) (map[string]interface{}, error)
    CloseShort(symbol string, quantity float64) (map[string]interface{}, error)
    SetLeverage(symbol string, leverage int) error
    GetMarketPrice(symbol string) (float64, error)
    SetStopLoss(symbol string, positionSide string, quantity, stopPrice float64) error
    SetTakeProfit(symbol string, positionSide string, quantity, takeProfitPrice float64) error
    CancelAllOrders(symbol string) error
    FormatQuantity(symbol string, quantity float64) (string, error)
}
```

Each exchange implementation (Binance, Hyperliquid, Aster) must implement this interface. **Critical**: Different exchanges have different precision requirements - always use the exchange's `FormatQuantity()` method to format prices and quantities.

**2. Multi-Trader Manager Pattern**

[manager/trader_manager.go](manager/trader_manager.go) orchestrates multiple independent `AutoTrader` instances, each with:
- Its own exchange account (via exchange-specific credentials)
- Its own AI model configuration (DeepSeek, Qwen, or custom)
- Independent decision-making cycles
- Separate decision log storage (under `decision_logs/{trader_id}/`)

Traders run concurrently in separate goroutines, enabling true AI-vs-AI competition.

**3. AI Self-Learning Mechanism**

Before each decision, the system analyzes the last 20 trading cycles and provides feedback to the AI:
- Overall win rate, average profit, profit/loss ratio
- Per-coin performance statistics (win rate, avg P/L in USDT)
- Recent trade details with entry/exit prices and actual P&L
- Best/worst performing coins

This feedback is injected into the AI's prompt in [decision/engine.go](decision/engine.go), allowing the AI to learn from mistakes and reinforce successful strategies.

**4. Position Tracking with symbol_side Keys**

Position records use a `symbol_side` key format (e.g., `BTCUSDT_long`, `BTCUSDT_short`) to prevent conflicts when holding both long and short positions simultaneously. This is critical in [logger/decision_logger.go](logger/decision_logger.go) for accurate P&L calculation.

**5. Precision Handling Across Exchanges**

Each exchange has different precision requirements for price and quantity:
- Binance: Uses LOT_SIZE filter from exchange info API
- Hyperliquid: Auto-determined based on asset type
- Aster: Binance-compatible precision format

Always retrieve and use the exchange's precision rules via `FormatQuantity()` to avoid `Precision is over the maximum` errors.

## Configuration System

The system is driven by `config.json` (see [config.json.example](config.json.example)). Key configuration concepts:

### Multiple Trader Support

Each trader in the `traders` array represents an independent AI competitor with:
- `id`: Unique identifier (used for logs and API endpoints)
- `name`: Display name
- `ai_model`: One of `"deepseek"`, `"qwen"`, or `"custom"`
- `exchange`: One of `"binance"`, `"hyperliquid"`, or `"aster"`
- Exchange-specific credentials
- AI model credentials
- `initial_balance`: For ROI calculation (not actual trading balance)
- `scan_interval_minutes`: Decision cycle interval (typically 3-5 minutes)

### AI Model Configuration

**DeepSeek**:
```json
"ai_model": "deepseek",
"deepseek_key": "sk-..."
```

**Qwen**:
```json
"ai_model": "qwen",
"qwen_key": "sk-..."
```

**Custom (OpenAI-compatible)**:
```json
"ai_model": "custom",
"custom_api_url": "https://api.openai.com/v1",
"custom_api_key": "sk-...",
"custom_model_name": "gpt-4o"
```

See [CUSTOM_API.md](CUSTOM_API.md) for detailed custom API usage.

### Exchange Configuration

**Binance**:
```json
"exchange": "binance",
"binance_api_key": "...",
"binance_secret_key": "..."
```

**Hyperliquid**:
```json
"exchange": "hyperliquid",
"hyperliquid_private_key": "...",  // without 0x prefix
"hyperliquid_wallet_addr": "0x...",
"hyperliquid_testnet": false
```

**Aster DEX**:
```json
"exchange": "aster",
"aster_user": "0x...",        // main wallet address
"aster_signer": "0x...",      // API wallet address
"aster_private_key": "..."    // API wallet private key, without 0x
```

### Leverage Configuration

```json
"leverage": {
  "btc_eth_leverage": 5,    // Max leverage for BTC and ETH
  "altcoin_leverage": 5     // Max leverage for all other coins
}
```

**Important**: Binance subaccounts are restricted to ≤5x leverage. Using higher values will cause trade failures.

## Decision Flow

Each trader's decision cycle (default 3 minutes) follows this sequence:

1. **Analyze Historical Performance**: Load last 20 cycles from decision logs, calculate statistics
2. **Get Account Status**: Query exchange for balance, positions, margin usage
3. **Analyze Existing Positions**: Fetch latest market data + technical indicators for open positions
4. **Evaluate New Opportunities**: Get candidate coins (default list or API), fetch market data
5. **AI Decision**: Send comprehensive prompt to AI with all data + historical feedback
6. **Execute Trades**: Priority order: close positions first, then open new ones
7. **Record Logs**: Save complete decision log with CoT, update performance database

See the detailed flow diagram in [README.md](README.md) under "AI Decision Flow".

## Frontend Architecture

The React frontend ([web/](web/)) uses:

- **SWR** for data fetching with automatic polling (5-10 second intervals)
- **Zustand** for state management
- **Recharts** for equity curves and comparison charts
- **Tailwind CSS** for styling (Binance-inspired dark theme)

Key pages:
- **Competition Page**: Multi-trader leaderboard with ROI comparison charts
- **Details Page**: Individual trader dashboard with equity curve, positions, decision logs

API endpoints are defined in [web/src/lib/api.ts](web/src/lib/api.ts) and communicate with the Go backend at `http://localhost:8080`.

## Critical Development Notes

### When Adding New Exchange Support

1. Create new file `trader/{exchange}_trader.go`
2. Implement the `Trader` interface
3. Handle precision formatting specific to that exchange
4. Add exchange detection in `manager/trader_manager.go`
5. Update `config.json.example` with new exchange fields

### When Modifying AI Decision Logic

- AI prompts are constructed in [decision/engine.go](decision/engine.go)
- Historical feedback is prepared by [logger/decision_logger.go](logger/decision_logger.go)
- Changes to prompt structure may require updating AI response parsing
- Test with both DeepSeek and Qwen to ensure compatibility

### Position Tracking and P&L Calculation

- Always use `symbol_side` format (`BTCUSDT_long`, not just `BTCUSDT`)
- P&L is calculated as: `Position Value × Price Change % × Leverage`
- Store `quantity` and `leverage` when opening positions
- Match open/close pairs by `symbol_side` key

### Exchange Precision Errors

If you encounter `Precision is over the maximum` errors:
1. Check that `FormatQuantity()` is being used for all price/quantity parameters
2. Verify the exchange info is being fetched correctly
3. Ensure trailing zeros are removed from formatted strings (for Aster)
4. Add precision debugging logs to identify the exact parameter causing issues

## Docker Deployment Notes

The Docker setup includes:
- Multi-stage Go build (statically linked binary)
- TA-Lib library installation (required for technical indicators)
- Node.js build for frontend (served by Nginx)
- Nginx reverse proxy (frontend :80 → backend :8080)

See [DOCKER_DEPLOY.en.md](DOCKER_DEPLOY.en.md) for detailed deployment guide.

## Dependencies

**Backend**:
- `github.com/adshao/go-binance/v2` - Binance API client
- `github.com/gin-gonic/gin` - HTTP framework
- `github.com/ethereum/go-ethereum` - Ethereum crypto utilities (for Hyperliquid)
- `github.com/sonirico/go-hyperliquid` - Hyperliquid SDK
- TA-Lib must be installed on the system (via `brew install ta-lib` on macOS)

**Frontend**:
- React 18+ with TypeScript
- SWR for data fetching
- Recharts for charts
- Tailwind CSS for styling

## Known Issues and Solutions

### TA-Lib Not Found

**Error**: `compilation error: "TA-Lib not found"`

**Solution**: Install TA-Lib:
```bash
# macOS
brew install ta-lib

# Ubuntu/Debian
sudo apt-get install libta-lib0-dev
```

### Precision Errors on Aster Exchange

Fixed in v2.0.2 by implementing proper `formatFloatWithPrecision` function that:
- Formats float64 to correct decimal places
- Removes trailing zeros
- Handles both price and quantity precision

### Chart Data Not Syncing After Backend Restart

Fixed in v2.0.1 by switching from `cycle_number` to timestamp-based grouping in [web/src/components/ComparisonChart.tsx](web/src/components/ComparisonChart.tsx).

### Inaccurate Historical P&L Statistics

Fixed in v2.0.2 by:
- Storing `quantity` and `leverage` in open position records
- Calculating actual USDT profit instead of just percentages
- Using `symbol_side` keys to prevent long/short conflicts
