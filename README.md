# 🤖 NOFX - Agentic Trading OS

[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?style=flat&logo=go)](https://golang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Backed by Amber.ac](https://img.shields.io/badge/Backed%20by-Amber.ac-orange.svg)](https://amber.ac)

**Languages:** [English](README.md) | [中文](docs/i18n/zh-CN/README.md) | [Українська](docs/i18n/uk/README.md) | [Русский](docs/i18n/ru/README.md)

**Official Twitter:** [@nofx_ai](https://x.com/nofx_ai)

**📚 Documentation:** [Docs Home](docs/README.md) | [Getting Started](docs/getting-started/README.md) | [Changelog](CHANGELOG.md) | [Contributing](CONTRIBUTING.md) | [Security](SECURITY.md)

---

## 📑 Table of Contents

- [🚀 Universal AI Trading Operating System](#-universal-ai-trading-operating-system)
- [👥 Developer Community](#-developer-community)
- [🆕 What's New](#-whats-new-latest-update)
- [📸 Screenshots](#-screenshots)
- [✨ Current Implementation](#-current-implementation---crypto-markets)
- [🔮 Roadmap](#-roadmap---universal-market-expansion)
- [🏗️ Technical Architecture](#️-technical-architecture)
- [💰 Register Binance Account](#-register-binance-account-save-on-fees)
- [🚀 Quick Start](#-quick-start)
- [📖 AI Decision Flow](#-ai-decision-flow)
- [🧠 AI Self-Learning](#-ai-self-learning-example)
- [📊 Web Interface Features](#-web-interface-features)
- [🎛️ API Endpoints](#️-api-endpoints)
- [⚠️ Important Risk Warnings](#️-important-risk-warnings)
- [🛠️ Common Issues](#️-common-issues)
- [📈 Performance Tips](#-performance-optimization-tips)
- [🔄 Changelog](#-changelog)
- [📄 License](#-license)
- [🤝 Contributing](#-contributing)

---

## 🚀 Universal AI Trading Operating System

**NOFX** is a **universal Agentic Trading OS** built on a unified architecture. We've successfully closed the loop in crypto markets: **"Multi-Agent Decision → Unified Risk Control → Low-Latency Execution → Live/Paper Account Backtesting"**, and are now expanding this same technology stack to **stocks, futures, options, forex, and all financial markets**.

### 🎯 Core Features

- **Universal Data & Backtesting Layer**: Cross-market, cross-timeframe, cross-exchange unified representation and factor library, accumulating transferable "strategy memory"
- **Multi-Agent Self-Play & Self-Evolution**: Strategies automatically compete and select the best, continuously iterating based on account-level PnL and risk constraints
- **Integrated Execution & Risk Control**: Low-latency routing, slippage/risk control sandbox, account-level limits, one-click market switching

### 🏢 Backed by [Amber.ac](https://amber.ac)

### 👥 Core Team

- **Tinkle** - [@Web3Tinkle](https://x.com/Web3Tinkle)
- **Zack** - [@0x_ZackH](https://x.com/0x_ZackH)

### 💼 Seed Funding Round Open

We are currently raising our **seed round**. 

**For investment inquiries**, please DM **Tinkle** or **Zack** via Twitter.

**For partnerships and collaborations**, please DM our official Twitter [@nofx_ai](https://x.com/nofx_ai).

---

> ⚠️ **Risk Warning**: This system is experimental. AI auto-trading carries significant risks. Strongly recommended for learning/research purposes or testing with small amounts only!

## 👥 Developer Community

Join our Telegram developer community to discuss, share ideas, and get support:

**💬 [NOFX Developer Community](https://t.me/nofx_dev_community)**

---

## 🆕 What's New (Latest Update)

### 🚀 Multi-Exchange Support!

NOFX now supports **three major exchanges**: Binance, Hyperliquid, and Aster DEX!

#### **Hyperliquid Exchange**

A high-performance decentralized perpetual futures exchange!

**Key Features:**
- ✅ Full trading support (long/short, leverage, stop-loss/take-profit)
- ✅ Automatic precision handling (order size & price)
- ✅ Unified trader interface (seamless exchange switching)
- ✅ Support for both mainnet and testnet
- ✅ No API keys needed - just your Ethereum private key

**New Workflow:**
1. **Configure AI Models**: Add your DeepSeek/Qwen API keys through the web interface
2. **Configure Exchanges**: Set up Binance/Hyperliquid API credentials
3. **Create Traders**: Combine any AI model with any exchange to create custom traders
4. **Monitor & Control**: Start/stop traders and monitor performance in real-time

**Why This Update?**
- 🎯 **User-Friendly**: No more editing JSON files or server restarts
- 🔧 **Flexible**: Mix and match different AI models with different exchanges
- 📊 **Scalable**: Create unlimited trader combinations
- 🔒 **Secure**: Database storage with proper data management

See [Quick Start](#-quick-start) for the new setup process!

#### **Aster DEX Exchange** (NEW! v2.0.2)

A Binance-compatible decentralized perpetual futures exchange!

**Key Features:**
- ✅ Binance-style API (easy migration from Binance)
- ✅ Web3 wallet authentication (secure and decentralized)
- ✅ Full trading support with automatic precision handling
- ✅ Lower trading fees than CEX
- ✅ EVM-compatible (Ethereum, BSC, Polygon, etc.)

**Why Aster?**
- 🎯 **Binance-compatible API** - minimal code changes required
- 🔐 **API Wallet System** - separate trading wallet for security
- 💰 **Competitive fees** - lower than most centralized exchanges
- 🌐 **Multi-chain support** - trade on your preferred EVM chain

**Quick Start:**
1. Visit [Aster API Wallet](https://www.asterdex.com/en/api-wallet)
2. Connect your main wallet and create an API wallet
3. Copy the API Signer address and Private Key
4. ~~Set `"exchange": "aster"` in config.json~~ *Configure through web interface*
5. Add `"aster_user"`, `"aster_signer"`, and `"aster_private_key"`

---

## 📸 Screenshots

### 🏆 Competition Mode - Real-time AI Battle
![Competition Page](screenshots/competition-page.png)
*Multi-AI leaderboard with real-time performance comparison charts showing Qwen vs DeepSeek live trading battle*

### 📊 Trader Details - Complete Trading Dashboard
![Details Page](screenshots/details-page.png)
*Professional trading interface with equity curves, live positions, and AI decision logs with expandable input prompts & chain-of-thought reasoning*

---

## ✨ Current Implementation - Crypto Markets

NOFX is currently **fully operational in cryptocurrency markets** with the following proven capabilities:

### 🏆 Multi-Agent Competition Framework
- **Live Agent Battle**: Qwen vs DeepSeek models compete in real-time trading
- **Independent Account Management**: Each agent maintains its own decision logs and performance metrics
- **Real-time Performance Comparison**: Live ROI tracking, win rate statistics, and head-to-head analysis
- **Self-Evolution Loop**: Agents learn from their historical performance and continuously improve

### 🧠 AI Self-Learning & Optimization
- **Historical Feedback System**: Analyzes last 20 trading cycles before each decision
- **Smart Performance Analysis**:
  - Identifies best/worst performing assets
  - Calculates win rate, profit/loss ratio, average profit in real USDT terms
  - Avoids repeating mistakes (consecutive losing patterns)
  - Reinforces successful strategies (high win rate patterns)
- **Dynamic Strategy Adjustment**: AI autonomously adapts trading style based on backtest results

### 📊 Universal Market Data Layer (Crypto Implementation)
- **Multi-Timeframe Analysis**: 3-minute real-time + 4-hour trend data
- **Technical Indicators**: EMA20/50, MACD, RSI(7/14), ATR
- **Open Interest Tracking**: Market sentiment, capital flow analysis
- **Liquidity Filtering**: Auto-filters low liquidity assets (<15M USD)
- **Cross-Exchange Support**: Binance, Hyperliquid, Aster DEX with unified data interface

### 🎯 Unified Risk Control System
- **Position Limits**: Per-asset limits (Altcoins ≤1.5x equity, BTC/ETH ≤10x equity)
- **Configurable Leverage**: Dynamic leverage from 1x to 50x based on asset class and account type
- **Margin Management**: Total usage ≤90%, AI-controlled allocation
- **Risk-Reward Enforcement**: Mandatory ≥1:2 stop-loss to take-profit ratio
- **Anti-Stacking Protection**: Prevents duplicate positions in same asset/direction

### ⚡ Low-Latency Execution Engine
- **Multi-Exchange API Integration**: Binance Futures, Hyperliquid DEX, Aster DEX
- **Automatic Precision Handling**: Smart order size & price formatting per exchange
- **Priority Execution**: Close existing positions first, then open new ones
- **Slippage Control**: Pre-execution validation, real-time precision checks

### 🎨 Professional Monitoring Interface
- **Binance-Style Dashboard**: Professional dark theme with real-time updates
- **Equity Curves**: Historical account value tracking (USD/percentage toggle)
- **Performance Charts**: Multi-agent ROI comparison with live updates
- **Complete Decision Logs**: Full Chain of Thought (CoT) reasoning for every trade
- **5-Second Data Refresh**: Real-time account, position, and P/L updates

---

## 🔮 Roadmap - Universal Market Expansion

NOFX is on a mission to become the **Universal AI Trading Operating System** for all financial markets.

**Vision:** Same architecture. Same agent framework. All markets.

**Expansion Markets:**
- 📈 **Stock Markets**: US equities, A-shares, Hong Kong stocks
- 📊 **Futures Markets**: Commodity futures, index futures
- 🎯 **Options Trading**: Equity options, crypto options
- 💱 **Forex Markets**: Major currency pairs, cross rates

**Upcoming Features:**
- Enhanced AI capabilities (GPT-4, Claude 3, Gemini Pro, flexible prompt templates)
- New exchange integrations (OKX, Bybit, Lighter, EdgeX + CEX/Perp-DEX)
- Project structure refactoring (high cohesion, low coupling, SOLID principles)
- Security enhancements (AES-256 encryption for API keys, RBAC, 2FA improvements)
- User experience improvements (mobile-responsive, TradingView charts, alert system)

📖 **For detailed roadmap and timeline, see:**
- **English:** [Roadmap Documentation](docs/roadmap/README.md)
- **中文:** [路线图文档](docs/roadmap/README.zh-CN.md)

---

## 🏗️ Technical Architecture

NOFX is built with a modern, modular architecture:

- **Backend:** Go with Gin framework, SQLite database
- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Multi-Exchange Support:** Binance, Hyperliquid, Aster DEX
- **AI Integration:** DeepSeek, Qwen, and custom OpenAI-compatible APIs
- **State Management:** Zustand for frontend, database-driven for backend
- **Real-time Updates:** SWR with 5-10s polling intervals

**Key Features:**
- 🗄️ Database-driven configuration (no more JSON editing)
- 🔐 JWT authentication with optional 2FA support
- 📊 Real-time performance tracking and analytics
- 🤖 Multi-AI competition mode with live comparison
- 🔌 RESTful API for all configuration and monitoring

📖 **For detailed architecture documentation, see:**
- **English:** [Architecture Documentation](docs/architecture/README.md)
- **中文:** [架构文档](docs/architecture/README.zh-CN.md)

---

## 💰 Register Binance Account (Save on Fees!)

Before using this system, you need a Binance Futures account. **Use our referral link to save on trading fees:**

**🎁 [Register Binance - Get Fee Discount](https://www.binance.com/join?ref=TINKLEVIP)**

### Registration Steps:

1. **Click the link above** to visit Binance registration page
2. **Complete registration** with email/phone number
3. **Complete KYC verification** (required for futures trading)
4. **Enable Futures account**:
   - Go to Binance homepage → Derivatives → USD-M Futures
   - Click "Open Now" to activate futures trading
5. **Create API Key**:
   - Go to Account → API Management
   - Create new API key, **enable "Futures" permission**
   - Save API Key and Secret Key (~~needed for config.json~~) *needed for web interface*
   - **Important**: Whitelist your IP address for security

### Fee Discount Benefits:

- ✅ **Spot trading**: Up to 30% fee discount
- ✅ **Futures trading**: Up to 30% fee discount
- ✅ **Lifetime validity**: Permanent discount on all trades

---

## 🚀 Quick Start

### 🐳 Option A: Docker One-Click Deployment (EASIEST - Recommended!)

**⚡ Start the platform in 2 simple steps with Docker - No installation needed!**

Docker automatically handles all dependencies (Go, Node.js, TA-Lib, SQLite) and environment setup.

#### Step 1: Prepare Configuration
```bash
# Copy configuration template
cp config.example.jsonc config.json

# Edit and fill in your API keys
nano config.json  # or use any editor
```

⚠️ **Note**: Basic config.json is still needed for some settings, but ~~trader configurations~~ are now done through the web interface.

#### Step 2: One-Click Start
```bash
# Option 1: Use convenience script (Recommended)
chmod +x start.sh
./start.sh start --build

> #### Docker Compose Version Notes
>
> **This project uses Docker Compose V2 syntax (with spaces)**
>
> If you have the older standalone `docker-compose` installed, please upgrade to Docker Desktop or Docker 20.10+

# Option 2: Use docker compose directly
docker compose up -d --build
```

#### Step 2: Access Web Interface
Open your browser and visit: **http://localhost:3000**

**That's it! 🎉** Your AI trading platform is now running!

#### Initial Setup (Through Web Interface)
1. **Configure AI Models**: Add your DeepSeek/Qwen API keys
2. **Configure Exchanges**: Set up Binance/Hyperliquid credentials  
3. **Create Traders**: Combine AI models with exchanges
4. **Start Trading**: Launch your configured traders

#### Manage Your System
```bash
./start.sh logs      # View logs
./start.sh status    # Check status
./start.sh stop      # Stop services
./start.sh restart   # Restart services
```

**📖 For detailed Docker deployment guide, troubleshooting, and advanced configuration:**
- **English**: See [docs/getting-started/docker-deploy.en.md](docs/getting-started/docker-deploy.en.md)
- **中文**: 查看 [docs/getting-started/docker-deploy.zh-CN.md](docs/getting-started/docker-deploy.zh-CN.md)

---

### 📦 Option B: Manual Installation (For Developers)

**Note**: If you used Docker deployment above, skip this section. Manual installation is only needed if you want to modify the code or run without Docker.

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

### 4. Get AI API Keys

Before configuring the system, you need to obtain AI API keys. Choose one of the following AI providers:

#### Option 1: DeepSeek (Recommended for Beginners)

**Why DeepSeek?**
- 💰 Cheaper than GPT-4 (about 1/10 the cost)
- 🚀 Fast response time
- 🎯 Excellent trading decision quality
- 🌍 Works globally without VPN

**How to get DeepSeek API Key:**

1. **Visit**: [https://platform.deepseek.com](https://platform.deepseek.com)
2. **Register**: Sign up with email/phone number
3. **Verify**: Complete email/phone verification
4. **Top-up**: Add credits to your account
   - Minimum: ~$5 USD
   - Recommended: $20-50 USD for testing
5. **Create API Key**:
   - Go to API Keys section
   - Click "Create New Key"
   - Copy and save the key (starts with `sk-`)
   - ⚠️ **Important**: Save it immediately - you can't see it again!

**Pricing**: ~$0.14 per 1M tokens (very cheap!)

#### Option 2: Qwen (Alibaba Cloud)

**How to get Qwen API Key:**

1. **Visit**: [https://dashscope.aliyuncs.com](https://dashscope.aliyuncs.com)
2. **Register**: Sign up with Alibaba Cloud account
3. **Enable Service**: Activate DashScope service
4. **Create API Key**:
   - Go to API Key Management
   - Create new key
   - Copy and save (starts with `sk-`)

**Note**: May require Chinese phone number for registration

---

### 5. Start the System

#### **Step 1: Start the Backend**

```bash
# Build the program (first time only, or after code changes)
go build -o nofx

# Start the backend
./nofx
```

**What you should see:**

```
╔════════════════════════════════════════════════════════════╗
║    🤖 AI多模型交易系统 - 支持 DeepSeek & Qwen                  ║
╚════════════════════════════════════════════════════════════╝

🤖 数据库中的AI交易员配置:
  • 暂无配置的交易员，请通过Web界面创建

🌐 API服务器启动在 http://localhost:8081
```

#### **Step 2: Start the Frontend**

Open a **NEW terminal window**, then:

```bash
cd web
npm run dev
```

#### **Step 3: Access the Web Interface**

Open your browser and visit: **🌐 http://localhost:3000**

### 6. Configure Through Web Interface

**Now configure everything through the web interface - no more JSON editing!**

#### **Step 1: Configure AI Models**
1. Click "AI模型配置" button
2. Enable DeepSeek or Qwen (or both)
3. Enter your API keys
4. Save configuration

#### **Step 2: Configure Exchanges**  
1. Click "交易所配置" button
2. Enable Binance or Hyperliquid (or both)
3. Enter your API credentials
4. Save configuration

#### **Step 3: Create Traders**
1. Click "创建交易员" button
2. Select an AI model (must be configured first)
3. Select an exchange (must be configured first)  
4. Set initial balance and trader name
5. Create trader

#### **Step 4: Start Trading**
- Your traders will appear in the main interface
- Use Start/Stop buttons to control them
- Monitor performance in real-time

**✅ No more JSON file editing - everything is done through the web interface!**

---

#### 🔷 Alternative: Using Hyperliquid Exchange

**NOFX also supports Hyperliquid** - a decentralized perpetual futures exchange. To use Hyperliquid instead of Binance:

**Step 1**: Get your Ethereum private key (for Hyperliquid authentication)

1. Open **MetaMask** (or any Ethereum wallet)
2. Export your private key
3. **Remove the `0x` prefix** from the key
4. Fund your wallet on [Hyperliquid](https://hyperliquid.xyz)

**Step 2**: ~~Configure `config.json` for Hyperliquid~~ *Configure through web interface*

```json
{
  "traders": [
    {
      "id": "hyperliquid_trader",
      "name": "My Hyperliquid Trader",
      "enabled": true,
      "ai_model": "deepseek",
      "exchange": "hyperliquid",
      "hyperliquid_private_key": "your_private_key_without_0x",
      "hyperliquid_wallet_addr": "your_ethereum_address",
      "hyperliquid_testnet": false,
      "deepseek_key": "sk-xxxxxxxxxxxxx",
      "initial_balance": 1000.0,
      "scan_interval_minutes": 3
    }
  ],
  "use_default_coins": true,
  "api_server_port": 8080
}
```

**Key Differences from Binance Config:**
- Replace `binance_api_key` + `binance_secret_key` with `hyperliquid_private_key`
- Add `"exchange": "hyperliquid"` field
- Set `hyperliquid_testnet: false` for mainnet (or `true` for testnet)

**⚠️ Security Warning**: Never share your private key! Use a dedicated wallet for trading, not your main wallet.

---

#### 🔶 Alternative: Using Aster DEX Exchange

**NOFX also supports Aster DEX** - a Binance-compatible decentralized perpetual futures exchange!

**Why Choose Aster?**
- 🎯 Binance-compatible API (easy migration)
- 🔐 API Wallet security system
- 💰 Lower trading fees
- 🌐 Multi-chain support (ETH, BSC, Polygon)
- 🌍 No KYC required

**Step 1**: Create Aster API Wallet

1. Visit [Aster API Wallet](https://www.asterdex.com/en/api-wallet)
2. Connect your main wallet (MetaMask, WalletConnect, etc.)
3. Click "Create API Wallet"
4. **Save these 3 items immediately:**
   - Main Wallet address (User)
   - API Wallet address (Signer)
   - API Wallet Private Key (⚠️ shown only once!)

**Step 2**: ~~Configure `config.json` for Aster~~ *Configure through web interface*

```json
{
  "traders": [
    {
      "id": "aster_deepseek",
      "name": "Aster DeepSeek Trader",
      "enabled": true,
      "ai_model": "deepseek",
      "exchange": "aster",

      "aster_user": "0x63DD5aCC6b1aa0f563956C0e534DD30B6dcF7C4e",
      "aster_signer": "0x21cF8Ae13Bb72632562c6Fff438652Ba1a151bb0",
      "aster_private_key": "4fd0a42218f3eae43a6ce26d22544e986139a01e5b34a62db53757ffca81bae1",

      "deepseek_key": "sk-xxxxxxxxxxxxx",
      "initial_balance": 1000.0,
      "scan_interval_minutes": 3
    }
  ],
  "use_default_coins": true,
  "api_server_port": 8080,
  "leverage": {
    "btc_eth_leverage": 5,
    "altcoin_leverage": 5
  }
}
```

**Key Configuration Fields:**
- `"exchange": "aster"` - Set exchange to Aster
- `aster_user` - Your main wallet address
- `aster_signer` - API wallet address (from Step 1)
- `aster_private_key` - API wallet private key (without `0x` prefix)

**📖 For detailed setup instructions, see**: [Aster Integration Guide](ASTER_INTEGRATION.md)

**⚠️ Security Notes**:
- API wallet is separate from your main wallet (extra security layer)
- Never share your API private key
- You can revoke API wallet access anytime at [asterdex.com](https://www.asterdex.com/en/api-wallet)

---

#### ⚔️ Expert Mode: Multi-Trader Competition

For running multiple AI traders competing against each other:

```json
{
  "traders": [
    {
      "id": "qwen_trader",
      "name": "Qwen AI Trader",
      "ai_model": "qwen",
      "binance_api_key": "YOUR_BINANCE_API_KEY_1",
      "binance_secret_key": "YOUR_BINANCE_SECRET_KEY_1",
      "use_qwen": true,
      "qwen_key": "sk-xxxxx",
      "deepseek_key": "",
      "initial_balance": 1000.0,
      "scan_interval_minutes": 3
    },
    {
      "id": "deepseek_trader",
      "name": "DeepSeek AI Trader",
      "ai_model": "deepseek",
      "binance_api_key": "YOUR_BINANCE_API_KEY_2",
      "binance_secret_key": "YOUR_BINANCE_SECRET_KEY_2",
      "use_qwen": false,
      "qwen_key": "",
      "deepseek_key": "sk-xxxxx",
      "initial_balance": 1000.0,
      "scan_interval_minutes": 3
    }
  ],
  "use_default_coins": true,
  "coin_pool_api_url": "",
  "oi_top_api_url": "",
  "api_server_port": 8080
}
```

**Requirements for Competition Mode:**
- 2 separate Binance futures accounts (different API keys)
- Both AI API keys (Qwen + DeepSeek)
- More capital for testing (recommended: 500+ USDT per account)

---

#### 📚 Configuration Field Explanations

| Field | Description | Example Value | Required? |
|-------|-------------|---------------|-----------|
| `id` | Unique identifier for this trader | `"my_trader"` | ✅ Yes |
| `name` | Display name | `"My AI Trader"` | ✅ Yes |
| `enabled` | Whether this trader is enabled<br>Set to `false` to skip startup | `true` or `false` | ✅ Yes |
| `ai_model` | AI provider to use | `"deepseek"` or `"qwen"` or `"custom"` | ✅ Yes |
| `exchange` | Exchange to use | `"binance"` or `"hyperliquid"` or `"aster"` | ✅ Yes |
| `binance_api_key` | Binance API key | `"abc123..."` | Required when using Binance |
| `binance_secret_key` | Binance Secret key | `"xyz789..."` | Required when using Binance |
| `hyperliquid_private_key` | Hyperliquid private key<br>⚠️ Remove `0x` prefix | `"your_key..."` | Required when using Hyperliquid |
| `hyperliquid_wallet_addr` | Hyperliquid wallet address | `"0xabc..."` | Required when using Hyperliquid |
| `hyperliquid_testnet` | Use testnet | `true` or `false` | ❌ No (defaults to false) |
| `use_qwen` | Whether to use Qwen | `true` or `false` | ✅ Yes |
| `deepseek_key` | DeepSeek API key | `"sk-xxx"` | If using DeepSeek |
| `qwen_key` | Qwen API key | `"sk-xxx"` | If using Qwen |
| `initial_balance` | Starting balance for P/L calculation | `1000.0` | ✅ Yes |
| `scan_interval_minutes` | How often to make decisions | `3` (3-5 recommended) | ✅ Yes |
| **`leverage`** | **Leverage configuration (v2.0.3+)** | See below | ✅ Yes |
| `btc_eth_leverage` | Maximum leverage for BTC/ETH<br>⚠️ Subaccounts: ≤5x | `5` (default, safe)<br>`50` (main account max) | ✅ Yes |
| `altcoin_leverage` | Maximum leverage for altcoins<br>⚠️ Subaccounts: ≤5x | `5` (default, safe)<br>`20` (main account max) | ✅ Yes |
| `use_default_coins` | Use built-in coin list<br>**✨ Smart Default: `true`** (v2.0.2+)<br>Auto-enabled if no API URL provided | `true` or omit | ❌ No<br>(Optional, auto-defaults) |
| `coin_pool_api_url` | Custom coin pool API<br>*Only needed when `use_default_coins: false`* | `""` (empty) | ❌ No |
| `oi_top_api_url` | Open interest API<br>*Optional supplement data* | `""` (empty) | ❌ No |
| `api_server_port` | Web dashboard port | `8080` | ✅ Yes |

~~**Default Trading Coins** (when `use_default_coins: true`):
- BTC, ETH, SOL, BNB, XRP, DOGE, ADA, HYPE~~

*Note: Trading coins are now configured through the web interface*

---

#### ⚙️ Leverage Configuration (v2.0.3+)

**What is leverage configuration?**

The leverage settings control the maximum leverage the AI can use for each trade. This is crucial for risk management, especially for Binance subaccounts which have leverage restrictions.

~~**Configuration format:**~~

```json
"leverage": {
  "btc_eth_leverage": 5,    // Maximum leverage for BTC and ETH
  "altcoin_leverage": 5      // Maximum leverage for all other coins
}
```

*Note: Leverage is now configured through the web interface*

**⚠️ Important: Binance Subaccount Restrictions**

- **Subaccounts**: Limited to **≤5x leverage** by Binance
- **Main accounts**: Can use up to 20x (altcoins) or 50x (BTC/ETH)
- If you're using a subaccount and set leverage >5x, trades will **fail** with error: `Subaccounts are restricted from using leverage greater than 5x`

**Recommended settings:**

| Account Type | BTC/ETH Leverage | Altcoin Leverage | Risk Level |
|-------------|------------------|------------------|------------|
| **Subaccount** | `5` | `5` | ✅ Safe (default) |
| **Main (Conservative)** | `10` | `10` | 🟡 Medium |
| **Main (Aggressive)** | `20` | `15` | 🔴 High |
| **Main (Maximum)** | `50` | `20` | 🔴🔴 Very High |

**Examples:**

~~**Safe configuration (subaccount or conservative):**~~
```json
"leverage": {
  "btc_eth_leverage": 5,
  "altcoin_leverage": 5
}
```

~~**Aggressive configuration (main account only):**~~
```json
"leverage": {
  "btc_eth_leverage": 20,
  "altcoin_leverage": 15
}
```

*Note: Leverage configuration is now done through the web interface*

**How AI uses leverage:**

- AI can choose **any leverage from 1x up to your configured maximum**
- For example, with `altcoin_leverage: 20`, AI might decide to use 5x, 10x, or 20x based on market conditions
- The configuration sets the **upper limit**, not a fixed value
- AI considers volatility, risk-reward ratio, and account balance when choosing leverage

---

#### ⚠️ Important: `use_default_coins` Field

**Smart Default Behavior (v2.0.2+):**

The system now automatically defaults to `use_default_coins: true` if:
- You don't include this field in config.json, OR
- You set it to `false` but don't provide `coin_pool_api_url`

This makes it beginner-friendly! You can even omit this field entirely.

**Configuration Examples:**

✅ **Option 1: Explicitly set (Recommended for clarity)**
```json
"use_default_coins": true,
"coin_pool_api_url": "",
"oi_top_api_url": ""
```

✅ **Option 2: Omit the field (uses default coins automatically)**
```json
// Just don't include "use_default_coins" at all
"coin_pool_api_url": "",
"oi_top_api_url": ""
```

⚙️ **Advanced: Use external API**
```json
"use_default_coins": false,
"coin_pool_api_url": "http://your-api.com/coins",
"oi_top_api_url": "http://your-api.com/oi"
```

---

### 6. Run the System

#### 🚀 Starting the System (2 steps)

The system has **2 parts** that run separately:
1. **Backend** (AI trading brain + API)
2. **Frontend** (Web dashboard for monitoring)

---

#### **Step 1: Start the Backend**

Open a terminal and run:

```bash
# Build the program (first time only, or after code changes)
go build -o nofx

# Start the backend
./nofx
```

**What you should see:**

```
🚀 启动自动交易系统...
✓ Trader [my_trader] 已初始化
✓ API服务器启动在端口 8080
📊 开始交易监控...
```

**⚠️ If you see errors:**

| Error Message | Solution |
|--------------|----------|
| `invalid API key` | Check your Binance API key in config.json |
| `TA-Lib not found` | Run `brew install ta-lib` (macOS) |
| `port 8080 already in use` | ~~Change `api_server_port` in config.json~~ *Change `API_PORT` in .env file* |
| `DeepSeek API error` | Verify your DeepSeek API key and balance |

**✅ Backend is running correctly when you see:**
- No error messages
- "开始交易监控..." appears
- System shows account balance
- Keep this terminal window open!

---

#### **Step 2: Start the Frontend**

Open a **NEW terminal window** (keep the first one running!), then:

```bash
cd web
npm run dev
```

**What you should see:**

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**✅ Frontend is running when you see:**
- "Local: http://localhost:3000/" message
- No error messages
- Keep this terminal window open too!

---

#### **Step 3: Access the Dashboard**

Open your web browser and visit:

**🌐 http://localhost:3000**

**What you'll see:**
- 📊 Real-time account balance
- 📈 Open positions (if any)
- 🤖 AI decision logs
- 📉 Equity curve chart

**First-time tips:**
- It may take 3-5 minutes for the first AI decision
- Initial decisions might say "观望" (wait) - this is normal
- AI needs to analyze market conditions first

---

### 7. Monitor the System

**What to watch:**

✅ **Healthy System Signs:**
- Backend terminal shows decision cycles every 3-5 minutes
- No continuous error messages
- Account balance updates
- Web dashboard refreshes automatically

⚠️ **Warning Signs:**
- Repeated API errors
- No decisions for 10+ minutes
- Balance decreasing rapidly

**Checking System Status:**

```bash
# In a new terminal window
curl http://localhost:8080/api/health
```

Should return: `{"status":"ok"}`

---

### 8. Stop the System

**Graceful Shutdown (Recommended):**

1. Go to the **backend terminal** (the first one)
2. Press `Ctrl+C`
3. Wait for "系统已停止" message
4. Go to the **frontend terminal** (the second one)
5. Press `Ctrl+C`

**⚠️ Important:**
- Always stop the backend first
- Wait for confirmation before closing terminals
- Don't force quit (don't close terminal directly)

---

## 📖 AI Decision Flow

Each decision cycle (default 3 minutes), the system executes the following intelligent process:

### Step 1: 📊 Analyze Historical Performance (last 20 cycles)
- ✓ Calculate overall win rate, avg profit, P/L ratio
- ✓ Per-coin statistics (win rate, avg P/L in USDT)
- ✓ Identify best/worst performing coins
- ✓ List last 5 trade details with accurate PnL
- ✓ Calculate Sharpe ratio for risk-adjusted performance
- 📌 **NEW (v2.0.2)**: Accurate USDT PnL with leverage

**↓**

### Step 2: 💰 Get Account Status
- Total equity & available balance
- Number of open positions & unrealized P/L
- Margin usage rate (AI manages up to 90%)
- Daily P/L tracking & drawdown monitoring

**↓**

### Step 3: 🔍 Analyze Existing Positions (if any)
- For each position, fetch latest market data
- Calculate real-time technical indicators:
  - 3min K-line: RSI(7), MACD, EMA20
  - 4hour K-line: RSI(14), EMA20/50, ATR
- Track position holding duration (e.g., "2h 15min")
- 📌 **NEW (v2.0.2)**: Shows how long each position held
- Display: Entry price, current price, P/L%, duration
- AI evaluates: Should hold or close?

**↓**

### Step 4: 🎯 Evaluate New Opportunities (candidate coins)
- Fetch coin pool (2 modes):
  - 🌟 **Default Mode**: BTC, ETH, SOL, BNB, XRP, etc.
  - ⚙️ **Advanced Mode**: AI500 (top 20) + OI Top (top 20)
- Merge & deduplicate candidate coins
- Filter: Remove low liquidity (<15M USD OI value)
- Batch fetch market data + technical indicators
- Calculate volatility, trend strength, volume surge

**↓**

### Step 5: 🧠 AI Comprehensive Decision (DeepSeek/Qwen)
- Review historical feedback:
  - Recent win rate & profit factor
  - Best/worst coins performance
  - Avoid repeating mistakes
- Analyze all raw sequence data:
  - 3min price sequences, 4hour K-line sequences
  - Complete indicator sequences (not just latest)
  - 📌 **NEW (v2.0.2)**: AI has full freedom to analyze
- Chain of Thought (CoT) reasoning process
- Output structured decisions:
  - Action: `close_long` / `close_short` / `open_long` / `open_short`
  - Coin symbol, quantity, leverage
  - Stop-loss & take-profit levels (≥1:2 ratio)
- Decision: Wait / Hold / Close / Open

**↓**

### Step 6: ⚡ Execute Trades
- Priority order: Close existing → Then open new
- Risk checks before execution:
  - Position size limits (1.5x for altcoins, 10x BTC)
  - No duplicate positions (same coin + direction)
  - Margin usage within 90% limit
- Auto-fetch & apply Binance LOT_SIZE precision
- Execute orders via Binance Futures API
- After closing: Auto-cancel all pending orders
- Record actual execution price & order ID
- 📌 Track position open time for duration calculation

**↓**

### Step 7: 📝 Record Complete Logs & Update Performance
- Save decision log to `decision_logs/{trader_id}/`
- Log includes:
  - Complete Chain of Thought (CoT)
  - Input prompt with all market data
  - Structured decision JSON
  - Account snapshot (balance, positions, margin)
  - Execution results (success/failure, prices)
- Update performance database:
  - Match open/close pairs by `symbol_side` key
  - 📌 **NEW**: Prevents long/short conflicts
  - Calculate accurate USDT PnL:
    - `PnL = Position Value × Price Δ% × Leverage`
  - 📌 **NEW**: Considers quantity + leverage
  - Store: quantity, leverage, open time, close time
  - Update win rate, profit factor, Sharpe ratio
- Performance data feeds back into next cycle

**↓**

**🔄 (Repeat every 3-5 min)**

### Key Improvements in v2.0.2

**📌 Position Duration Tracking:**
- System now tracks how long each position has been held
- Displayed in user prompt: "持仓时长2小时15分钟"
- Helps AI make better decisions on when to exit

**📌 Accurate PnL Calculation:**
- Previously: Only percentage (100U@5% = 1000U@5% = both showed "5.0")
- Now: Real USDT profit = Position Value × Price Change × Leverage
- Example: 1000 USDT × 5% × 20x = 1000 USDT actual profit

**📌 Enhanced AI Freedom:**
- AI can freely analyze all raw sequence data
- No longer restricted to predefined indicator combinations
- Can perform own trend analysis, support/resistance calculation

**📌 Improved Position Tracking:**
- Uses `symbol_side` key (e.g., "BTCUSDT_long")
- Prevents conflicts when holding both long & short
- Stores complete data: quantity, leverage, open/close times

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

### Configuration Management

```bash
GET  /api/models              # Get AI model configurations
PUT  /api/models              # Update AI model configurations
GET  /api/exchanges           # Get exchange configurations  
PUT  /api/exchanges           # Update exchange configurations
```

### Trader Management

```bash
GET    /api/traders           # List all traders
POST   /api/traders           # Create new trader
DELETE /api/traders/:id       # Delete trader
POST   /api/traders/:id/start # Start trader
POST   /api/traders/:id/stop  # Stop trader
```

### Trading Data & Monitoring

```bash
GET /api/status?trader_id=xxx            # System status
GET /api/account?trader_id=xxx           # Account info
GET /api/positions?trader_id=xxx         # Position list
GET /api/equity-history?trader_id=xxx    # Equity history (chart data)
GET /api/decisions/latest?trader_id=xxx  # Latest 5 decisions
GET /api/statistics?trader_id=xxx        # Statistics
GET /api/performance?trader_id=xxx       # AI performance analysis
```

### System Endpoints

```bash
GET /api/health                   # Health check
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
- ~~Check API URL and auth parameter in config.json~~ *Check configuration in web interface*

---

## 📈 Performance Optimization Tips

1. **Set reasonable decision cycle**: Recommended 3-5 minutes, avoid over-trading
2. **Control candidate coin count**: System defaults to AI500 top 20 + OI Top top 20
3. **Regularly clean logs**: Avoid excessive disk usage
4. **Monitor API call count**: Avoid triggering Binance rate limits
5. **Test with small capital**: First test with 100-500 USDT for strategy validation

---

## 🔄 Changelog

📖 **For detailed version history and updates, see:**

- **English:** [CHANGELOG.md](CHANGELOG.md)
- **中文:** [CHANGELOG.zh-CN.md](CHANGELOG.zh-CN.md)

**Latest Release:** v3.0.0 (2025-10-30) - Major Architecture Transformation

**Recent Highlights:**
- 🚀 Complete system redesign with web-based configuration
- 🗄️ Database-driven architecture (SQLite)
- 🎨 No more JSON editing - all configuration through web interface
- 🔧 Mix & match AI models with any exchange
- 📊 Enhanced API layer with comprehensive endpoints

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

---

## 🤝 Contributing

We welcome contributions from the community! See our comprehensive guides:

- **📖 [Contributing Guide](CONTRIBUTING.md)** - Complete development workflow, code standards, and PR process
- **🤝 [Code of Conduct](CODE_OF_CONDUCT.md)** - Community guidelines and standards
- **💰 [Bounty Program](docs/community/bounty-guide.md)** - Earn rewards for contributions
- **🔒 [Security Policy](SECURITY.md)** - Report vulnerabilities responsibly

**Quick Start:**
1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📬 Contact


### 🐛 Technical Support
- **GitHub Issues**: [Submit an Issue](https://github.com/tinkle-community/nofx/issues)
- **Developer Community**: [Telegram Group](https://t.me/nofx_dev_community)

---

## 🙏 Acknowledgments

- [Binance API](https://binance-docs.github.io/apidocs/futures/en/) - Binance Futures API
- [DeepSeek](https://platform.deepseek.com/) - DeepSeek AI API
- [Qwen](https://dashscope.aliyuncs.com/) - Alibaba Cloud Qwen
- [TA-Lib](https://ta-lib.org/) - Technical indicator library
- [Recharts](https://recharts.org/) - React chart library

---

**Last Updated**: 2025-10-30 (v3.0.0)

**⚡ Explore the possibilities of quantitative trading with the power of AI!**

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=tinkle-community/nofx&type=Date)](https://star-history.com/#tinkle-community/nofx&Date)
