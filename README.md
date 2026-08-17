<p align="center"><strong>Backed by <a href="https://vergex.trade">vergex.trade</a></strong></p>

<p align="center">
  <img src="docs/assets/nofx-banner.svg" alt="NOFX — AI trading terminal" width="100%"/>
</p>

<p align="center">
  <a href="https://github.com/NoFxAiOS/nofx/stargazers"><img src="https://img.shields.io/github/stars/NoFxAiOS/nofx?style=flat-square&labelColor=1A1813&color=E0483B" alt="Stars"></a>
  <a href="https://github.com/NoFxAiOS/nofx/releases"><img src="https://img.shields.io/github/v/release/NoFxAiOS/nofx?style=flat-square&labelColor=1A1813&color=E0483B" alt="Release"></a>
  <a href="https://github.com/NoFxAiOS/nofx/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-E0483B?style=flat-square&labelColor=1A1813" alt="License"></a>
  <a href="https://t.me/nofx_dev_community"><img src="https://img.shields.io/badge/telegram-community-E0483B?style=flat-square&labelColor=1A1813&logo=telegram&logoColor=white" alt="Telegram"></a>
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="docs/i18n/zh-CN/README.md">中文</a> ·
  <a href="docs/i18n/ja/README.md">日本語</a> ·
  <a href="docs/i18n/ko/README.md">한국어</a> ·
  <a href="docs/i18n/ru/README.md">Русский</a> ·
  <a href="docs/i18n/uk/README.md">Українська</a> ·
  <a href="docs/i18n/vi/README.md">Tiếng Việt</a>
</p>

<br/>

NOFX is an open-source trading terminal where the strategy is a language model. Each trader runs a continuous loop — read market structure, decide, execute, record the reasoning — while a Go runtime clamps every order to hard risk limits the model cannot override.

Traders compose freely: any model, any of nine exchanges, any strategy. Run several side by side and compare them on a public leaderboard by realized return. Everything runs on your own machine; exchange credentials are encrypted at rest and never leave it.

```bash
curl -fsSL https://raw.githubusercontent.com/NoFxAiOS/nofx/main/install.sh | bash
```

The terminal opens at `http://127.0.0.1:3000`.

**First run**

1. Register — the first account becomes the owner of the instance.
2. Follow the guided launch: put **$1+ USDC** (Base network) in the AI fee wallet it creates for you, then connect Hyperliquid and deposit **$12+ USDC** to trade with.
3. Start **Autopilot**. The AI scans the market every few minutes and trades on its own; every decision appears on the dashboard as it happens. Stop it anytime with one click.

<br/>

## Register exchanges

NOFX is free and open source. Opening an account through the partner links below carries reduced trading fees and funds continued development.

| Exchange                                                                                                                      | Status | Register with fee discount                                                          |
| :---------------------------------------------------------------------------------------------------------------------------- | :----: | :---------------------------------------------------------------------------------- |
| <img src="web/public/exchange-icons/binance.jpg" width="20" height="20" style="vertical-align: middle;"/> **Binance**       |   ✅   | [Register](https://www.binance.com/join?ref=NOFXENG)                                |
| <img src="web/public/exchange-icons/bybit.png" width="20" height="20" style="vertical-align: middle;"/> **Bybit**           |   ✅   | [Register](https://partner.bybit.com/b/83856)                                       |
| <img src="web/public/exchange-icons/okx.svg" width="20" height="20" style="vertical-align: middle;"/> **OKX**               |   ✅   | [Register](https://www.okx.com/join/1865360)                                        |
| <img src="web/public/exchange-icons/hyperliquid.png" width="20" height="20" style="vertical-align: middle;"/> **Hyperliquid** |   ✅   | [Register](https://app.hyperliquid.xyz/join/AITRADING)                              |
| <img src="web/public/exchange-icons/bitget.svg" width="20" height="20" style="vertical-align: middle;"/> **Bitget**         |   ✅   | [Register](https://www.bitget.com/referral/register?from=referral&clacCode=c8a43172) |
| <img src="web/public/exchange-icons/kucoin.svg" width="20" height="20" style="vertical-align: middle;"/> **KuCoin**         |   ✅   | [Register](https://www.kucoin.com/r/broker/CXEV7XKK)                                |
| <img src="web/public/exchange-icons/gate.svg" width="20" height="20" style="vertical-align: middle;"/> **Gate**             |   ✅   | [Register](https://www.gatenode.xyz/share/VQBGUAxY)                                 |
| <img src="web/public/exchange-icons/aster.svg" width="20" height="20" style="vertical-align: middle;"/> **Aster**           |   ✅   | [Register](https://www.asterdex.com/en/referral/fdfc0e)                             |
| <img src="web/public/exchange-icons/lighter.png" width="20" height="20" style="vertical-align: middle;"/> **Lighter**       |   ✅   | [Register](https://app.lighter.xyz/?referral=68151432)                              |

<br/>

## Demo

https://github.com/user-attachments/assets/3310f495-14c5-4586-a1cc-3d32e44aa505

<br/>

## The model proposes. The runtime disposes.

Decisions come from the [Claw402.ai](https://claw402.ai) · Vergex data stack: a live direction board for the market universe, per-symbol current direction and direction history, cost-basis and liquidation heatmaps, and real-time market net flow. NOFX follows the board direction and uses the remaining data as execution context.

Every order passes through limits enforced in code, outside the model's reach:

|                          |                                                                                    |
| :----------------------- | :--------------------------------------------------------------------------------- |
| Position limits          | Max concurrent positions, notional capped as a ratio of equity, one position per symbol |
| Leverage clamps          | Hard caps applied at order-sizing time, independent of what the model requests     |
| Exchange-side protection | Stop-loss and take-profit placed on the exchange immediately after every entry     |
| Drawdown auto-close      | Profitable positions that give back too much from their peak are closed            |
| Trade throttling         | Minimum hold times, per-symbol re-entry cooldowns, per-cycle and per-hour entry limits |
| Safe mode                | Repeated model failures block new entries until the model recovers                 |
| Launch preflight         | Model access, wallet funds, strategy, and exchange balances verified before a trader may start |

Each decision is stored with the model's full reasoning. There is no position without a paper trail.

<br/>

## Terminal

| | |
| :--- | :--- |
| **Autopilot** | Guided launch: fund, connect, deposit, start — with server-side preflight throughout |
| **Strategy Studio** | Style presets, coin universes, indicators, leverage, entry confidence, custom prompts |
| **Competition** | Public leaderboard ranked by realized return, each entry attributed to its model |
| **Dashboard** | Live positions, orders, statistics, and the reasoning behind every decision |

<details>
<summary>Screenshots</summary>

<br/>

|                        Overview                         |                          Market Chart                           |
| :-----------------------------------------------------: | :-------------------------------------------------------------: |
| <img src="screenshots/dashboard-page.png" width="400"/> | <img src="screenshots/dashboard-market-chart.png" width="400"/> |

|                          Trading Stats                           |                          Position History                           |
| :--------------------------------------------------------------: | :-----------------------------------------------------------------: |
| <img src="screenshots/dashboard-trading-stats.png" width="400"/> | <img src="screenshots/dashboard-position-history.png" width="400"/> |

|                     Strategy Editor                      |                      Indicators Config                       |
| :------------------------------------------------------: | :----------------------------------------------------------: |
| <img src="screenshots/strategy-studio.png" width="400"/> | <img src="screenshots/strategy-indicators.png" width="400"/> |

|                     Competition                           |                    Configuration                              |
| :-------------------------------------------------------: | :-----------------------------------------------------------: |
| <img src="screenshots/competition-page.png" width="400"/> | <img src="screenshots/config-ai-exchanges.png" width="400"/>  |

</details>

<br/>

## Models

Eight providers with your own keys — DeepSeek, OpenAI, Claude, Qwen, Gemini, Grok, Kimi, MiniMax — including custom endpoints and model names.

Or no keys at all: [Claw402](https://claw402.ai) meters model usage per call in USDC over the x402 protocol. A wallet on Base replaces every API key.

| Provider | Access |
| :------- | :----- |
| **Claw402** | [Pay-as-you-go AI models with official discount](https://claw402.ai) |

## Markets

Crypto perpetuals on all nine exchanges. On Hyperliquid, the same runtime also trades tokenized US equities, commodities, indices, FX, and pre-IPO perps — TSLA, NVDA, GOLD, SPX, EUR, OPENAI — alongside crypto.

<br/>

## Architecture

```
    ┌─────────────────────────────────────────────────┐
    │                 Trading Terminal                 │
    │        React · TypeScript · TradingView          │
    │   Dashboard · Strategy Studio · Competition      │
    ├─────────────────────────────────────────────────┤
    │                  API Server (Go)                  │
    │      JWT auth · encrypted credential store        │
    ├──────────────┬──────────────┬───────────────────┤
    │   Strategy    │  Autopilot   │   Trader Runtime  │
    │    Engine     │  Preflight   │    Risk Engine    │
    ├──────────────┴──────────────┴───────────────────┤
    │                 AI Model Layer                    │
    │  DeepSeek · OpenAI · Claude · Qwen · Gemini      │
    │  Grok · Kimi · MiniMax · Claw402 (x402 USDC)     │
    ├─────────────────────────────────────────────────┤
    │              Exchange Connectivity                │
    │ Binance · Bybit · OKX · Hyperliquid · Bitget     │
    │ KuCoin · Gate · Aster · Lighter                  │
    └─────────────────────────────────────────────────┘
```

<br/>

## Install

**Linux / macOS**

```bash
curl -fsSL https://raw.githubusercontent.com/NoFxAiOS/nofx/main/install.sh | bash
```

**Railway**

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/nofx?referralCode=nofx)

**Docker**

```bash
curl -O https://raw.githubusercontent.com/NoFxAiOS/nofx/main/docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d
```

**Windows** — install [Docker Desktop](https://www.docker.com/products/docker-desktop/), then:

```powershell
curl -o docker-compose.prod.yml https://raw.githubusercontent.com/NoFxAiOS/nofx/main/docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d
```

**From source** — Go 1.21+, Node.js 18+:

```bash
git clone https://github.com/NoFxAiOS/nofx.git && cd nofx
go build -o nofx && ./nofx            # backend
cd web && npm install && npm run dev  # frontend, in a second terminal
```

**Update** — re-run the install script; it upgrades in place.

<details>
<summary>Server deployment</summary>

<br/>

**HTTP**

```bash
curl -fsSL https://raw.githubusercontent.com/NoFxAiOS/nofx/main/install.sh | bash
# http://YOUR_IP:3000
```

**HTTPS via Cloudflare**

1. Add the domain to [Cloudflare](https://dash.cloudflare.com) (free plan)
2. A record → server IP, proxied
3. SSL/TLS → Flexible
4. `TRANSPORT_ENCRYPTION=true` in `.env`

</details>

<br/>

## Documentation

|                                                         |                                       |
| :------------------------------------------------------ | :------------------------------------ |
| [Getting Started](docs/getting-started/README.md)       | Deployment and exchange API guides    |
| [Architecture](docs/architecture/README.md)             | System design and module index        |
| [Strategy Module](docs/architecture/STRATEGY_MODULE.md) | Coin selection, AI prompts, execution |
| [FAQ](docs/guides/faq.en.md)                            | Common questions                      |
| [Troubleshooting](docs/guides/TROUBLESHOOTING.md)       | Diagnosing common issues              |

## Community

[Telegram](https://t.me/nofx_dev_community) · [Twitter/X](https://x.com/vergex_ai) · [Issues](https://github.com/NoFxAiOS/nofx/issues) · [vergex.trade](https://vergex.trade) · [Live dashboard](https://vergex.trade/explore)

## Contributing

Code, documentation, translations, and bug reports are all welcome — see the [Contributing Guide](CONTRIBUTING.md), [Code of Conduct](CODE_OF_CONDUCT.md), and [Security Policy](SECURITY.md).

NOFX tracks meaningful contributions and intends to reward contributors as the ecosystem grows. Priority issues carry higher weight.

| Contribution      | Weight |
| :---------------- | :----: |
| Pinned Issue PRs  | ★★★★★★ |
| Code (Merged PRs) | ★★★★★  |
| Bug Fixes         |  ★★★★  |
| Feature Ideas     |  ★★★   |
| Bug Reports       |   ★★   |
| Documentation     |   ★★   |

<a href="https://github.com/NoFxAiOS/nofx/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=NoFxAiOS/nofx" alt="Contributors"/>
</a>

## Sponsors

<a href="https://github.com/pjl914335852-ux"><img src="https://github.com/pjl914335852-ux.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/cat9999aaa"><img src="https://github.com/cat9999aaa.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/1733055465"><img src="https://github.com/1733055465.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/kolal2020"><img src="https://github.com/kolal2020.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/CyberFFarm"><img src="https://github.com/CyberFFarm.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/vip3001003"><img src="https://github.com/vip3001003.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/mrtluh"><img src="https://github.com/mrtluh.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/cpcp1117-source"><img src="https://github.com/cpcp1117-source.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/match-007"><img src="https://github.com/match-007.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/leiwuhen1715"><img src="https://github.com/leiwuhen1715.png" width="50" height="50" style="border-radius:50%"/></a>
<a href="https://github.com/SHAOXIA1991"><img src="https://github.com/SHAOXIA1991.png" width="50" height="50" style="border-radius:50%"/></a>

[Become a sponsor](https://github.com/sponsors/NoFxAiOS)

<br/>

If NOFX is useful to you, a star helps other traders find it.

[![Star History Chart](https://star-history.dera.page/svg?repos=NoFxAiOS/nofx&type=Date)](https://star-history.dera.page/#NoFxAiOS/nofx&Date)

## License

[AGPL-3.0](LICENSE)

<sub>Automated trading involves substantial risk. AI-driven strategies are experimental and can lose money. Size positions appropriately, understand each venue, and never trade funds you cannot afford to lose. Full [disclaimer](DISCLAIMER.md).</sub>
