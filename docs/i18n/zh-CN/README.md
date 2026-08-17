<p align="center"><strong>由 <a href="https://vergex.trade">vergex.trade</a> 支持</strong></p>

<p align="center">
  <img src="../../assets/nofx-banner.svg" alt="NOFX — AI trading terminal" width="100%"/>
</p>

<p align="center">
  <a href="https://github.com/NoFxAiOS/nofx/stargazers"><img src="https://img.shields.io/github/stars/NoFxAiOS/nofx?style=flat-square&labelColor=1A1813&color=E0483B" alt="Stars"></a>
  <a href="https://github.com/NoFxAiOS/nofx/releases"><img src="https://img.shields.io/github/v/release/NoFxAiOS/nofx?style=flat-square&labelColor=1A1813&color=E0483B" alt="Release"></a>
  <a href="https://github.com/NoFxAiOS/nofx/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPL--3.0-E0483B?style=flat-square&labelColor=1A1813" alt="License"></a>
  <a href="https://t.me/nofx_dev_community"><img src="https://img.shields.io/badge/telegram-community-E0483B?style=flat-square&labelColor=1A1813&logo=telegram&logoColor=white" alt="Telegram"></a>
</p>

<p align="center">
  <a href="../../../README.md">English</a> ·
  <a href="README.md">中文</a> ·
  <a href="../ja/README.md">日本語</a> ·
  <a href="../ko/README.md">한국어</a> ·
  <a href="../ru/README.md">Русский</a> ·
  <a href="../uk/README.md">Українська</a> ·
  <a href="../vi/README.md">Tiếng Việt</a>
</p>

<br/>

NOFX 是一个开源交易终端，策略本身就是一个语言模型。每个交易员运行一个持续循环——读取市场结构、做出决策、执行、记录推理过程——同时由 Go 运行时把每一笔订单钳制在模型无法越过的硬性风控限制之内。

交易员可以自由组合：任意模型、九家交易所任选、任意策略。多个交易员并行运行，在公开排行榜上按已实现收益一较高下。一切都在你自己的机器上运行；交易所凭证加密存储，绝不外传。

```bash
curl -fsSL https://raw.githubusercontent.com/NoFxAiOS/nofx/main/install.sh | bash
```

终端会在 `http://127.0.0.1:3000` 打开。

**首次运行**

1. 注册——第一个账户即成为该实例的所有者。
2. 按引导式启动流程操作：向系统为你创建的 AI 费用钱包存入 **$1+ USDC**（Base 网络），然后连接 Hyperliquid 并存入 **$12+ USDC** 作为交易资金。
3. 启动 **Autopilot**。AI 每隔几分钟扫描一次市场并自主交易；每一个决策都会实时出现在仪表板上。随时可以一键停止。

<br/>

## 注册交易所

NOFX 免费且开源。通过下方合作伙伴链接开户可享受更低的交易手续费，同时也为项目的持续开发提供支持。

| 交易所                                                                                                                      | 状态 | 享手续费折扣注册                                                          |
| :---------------------------------------------------------------------------------------------------------------------------- | :----: | :---------------------------------------------------------------------------------- |
| <img src="../../../web/public/exchange-icons/binance.jpg" width="20" height="20" style="vertical-align: middle;"/> **Binance**       |   ✅   | [注册](https://www.binance.com/join?ref=NOFXENG)                                |
| <img src="../../../web/public/exchange-icons/bybit.png" width="20" height="20" style="vertical-align: middle;"/> **Bybit**           |   ✅   | [注册](https://partner.bybit.com/b/83856)                                       |
| <img src="../../../web/public/exchange-icons/okx.svg" width="20" height="20" style="vertical-align: middle;"/> **OKX**               |   ✅   | [注册](https://www.okx.com/join/1865360)                                        |
| <img src="../../../web/public/exchange-icons/hyperliquid.png" width="20" height="20" style="vertical-align: middle;"/> **Hyperliquid** |   ✅   | [注册](https://app.hyperliquid.xyz/join/AITRADING)                              |
| <img src="../../../web/public/exchange-icons/bitget.svg" width="20" height="20" style="vertical-align: middle;"/> **Bitget**         |   ✅   | [注册](https://www.bitget.com/referral/register?from=referral&clacCode=c8a43172) |
| <img src="../../../web/public/exchange-icons/kucoin.svg" width="20" height="20" style="vertical-align: middle;"/> **KuCoin**         |   ✅   | [注册](https://www.kucoin.com/r/broker/CXEV7XKK)                                |
| <img src="../../../web/public/exchange-icons/gate.svg" width="20" height="20" style="vertical-align: middle;"/> **Gate**             |   ✅   | [注册](https://www.gatenode.xyz/share/VQBGUAxY)                                 |
| <img src="../../../web/public/exchange-icons/aster.svg" width="20" height="20" style="vertical-align: middle;"/> **Aster**           |   ✅   | [注册](https://www.asterdex.com/en/referral/fdfc0e)                             |
| <img src="../../../web/public/exchange-icons/lighter.png" width="20" height="20" style="vertical-align: middle;"/> **Lighter**       |   ✅   | [注册](https://app.lighter.xyz/?referral=68151432)                              |

<br/>

## 演示

https://github.com/user-attachments/assets/3310f495-14c5-4586-a1cc-3d32e44aa505

<br/>

## 模型提议，运行时裁决

决策来自 [Claw402.ai](https://claw402.ai) · Vergex 数据栈：覆盖全市场的实时方向看板、逐标的当前方向与方向历史、成本与清算热力图，以及实时资金净流。NOFX 严格跟随看板方向，其余数据仅作为执行上下文。

每一笔订单都要经过代码层面强制执行的限制，模型无从干预：

|                          |                                                                                    |
| :----------------------- | :--------------------------------------------------------------------------------- |
| 持仓限制          | 最大并发持仓数、名义价值按权益比例封顶、每个币种仅允许一个持仓 |
| 杠杆钳制          | 在订单定量时施加硬上限，与模型请求的杠杆无关     |
| 交易所端保护 | 每次开仓后立即在交易所挂出止损和止盈单     |
| 回撤自动平仓      | 盈利持仓从峰值回吐过多时会被自动平掉            |
| 交易节流         | 最短持仓时间、单币种再入场冷却、单周期与单小时开仓次数限制 |
| 安全模式                | 模型连续失败时阻止新开仓，直至模型恢复正常                 |
| 启动预检         | 交易员启动前须通过模型访问、钱包资金、策略和交易所余额的校验 |

每个决策都连同模型的完整推理一起存档。没有任何持仓是无据可查的。

<br/>

## 终端

| | |
| :--- | :--- |
| **Autopilot** | 引导式启动：注资、连接、入金、启动——全程由服务端预检保驾护航 |
| **Strategy Studio** | 风格预设、币种池、技术指标、杠杆、开仓置信度、自定义提示词 |
| **竞赛** | 按已实现收益排名的公开排行榜，每个条目都标注所用模型 |
| **仪表板** | 实时持仓、订单、统计数据，以及每个决策背后的推理 |

<details>
<summary>截图</summary>

<br/>

|                        概览                         |                          行情图表                           |
| :-----------------------------------------------------: | :-------------------------------------------------------------: |
| <img src="../../../screenshots/dashboard-page.png" width="400"/> | <img src="../../../screenshots/dashboard-market-chart.png" width="400"/> |

|                          交易统计                           |                          持仓历史                           |
| :--------------------------------------------------------------: | :-----------------------------------------------------------------: |
| <img src="../../../screenshots/dashboard-trading-stats.png" width="400"/> | <img src="../../../screenshots/dashboard-position-history.png" width="400"/> |

|                     策略编辑器                      |                      指标配置                       |
| :------------------------------------------------------: | :----------------------------------------------------------: |
| <img src="../../../screenshots/strategy-studio.png" width="400"/> | <img src="../../../screenshots/strategy-indicators.png" width="400"/> |

|                     竞赛                           |                    配置                              |
| :-------------------------------------------------------: | :-----------------------------------------------------------: |
| <img src="../../../screenshots/competition-page.png" width="400"/> | <img src="../../../screenshots/config-ai-exchanges.png" width="400"/>  |

</details>

<br/>

## 模型

八家提供商，使用你自己的密钥——DeepSeek、OpenAI、Claude、Qwen、Gemini、Grok、Kimi、MiniMax——并支持自定义端点和模型名称。

或者完全不需要密钥：[Claw402](https://claw402.ai) 通过 x402 协议以 USDC 按次计量模型用量。一个 Base 链上的钱包即可替代所有 API 密钥。

| 提供商 | 接入方式 |
| :------- | :----- |
| **Claw402** | [按量付费的 AI 模型，享官方折扣](https://claw402.ai) |

## 市场

九家交易所全部支持加密货币永续合约。在 Hyperliquid 上，同一套运行时还可以交易代币化美股、大宗商品、指数、外汇和 pre-IPO 永续合约——TSLA、NVDA、GOLD、SPX、EUR、OPENAI——与加密资产并行。

<br/>

## 架构

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

## 安装

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

**Windows** —— 安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)，然后：

```powershell
curl -o docker-compose.prod.yml https://raw.githubusercontent.com/NoFxAiOS/nofx/main/docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d
```

**从源码构建** —— 需要 Go 1.21+、Node.js 18+：

```bash
git clone https://github.com/NoFxAiOS/nofx.git && cd nofx
go build -o nofx && ./nofx            # backend
cd web && npm install && npm run dev  # frontend, in a second terminal
```

**更新** —— 重新运行安装脚本，即可原地升级。

<details>
<summary>服务器部署</summary>

<br/>

**HTTP**

```bash
curl -fsSL https://raw.githubusercontent.com/NoFxAiOS/nofx/main/install.sh | bash
# http://YOUR_IP:3000
```

**通过 Cloudflare 启用 HTTPS**

1. 将域名添加到 [Cloudflare](https://dash.cloudflare.com)（免费套餐即可）
2. A 记录 → 服务器 IP，开启代理
3. SSL/TLS → Flexible
4. 在 `.env` 中设置 `TRANSPORT_ENCRYPTION=true`

</details>

<br/>

## 文档

|                                                         |                                       |
| :------------------------------------------------------ | :------------------------------------ |
| [快速开始](../../getting-started/README.zh-CN.md)       | 部署与交易所 API 指南    |
| [架构](../../architecture/README.md)             | 系统设计与模块索引        |
| [策略模块](../../architecture/STRATEGY_MODULE.md) | 币种选择、AI 提示词、执行 |
| [常见问题](../../guides/faq.zh-CN.md)                            | 常见疑问解答                      |
| [故障排查](../../guides/TROUBLESHOOTING.zh-CN.md)       | 常见问题诊断              |

## 社区

[Telegram](https://t.me/nofx_dev_community) · [Twitter/X](https://x.com/vergex_ai) · [Issues](https://github.com/NoFxAiOS/nofx/issues) · [vergex.trade](https://vergex.trade) · [实时仪表板](https://vergex.trade/explore)

## 贡献

代码、文档、翻译和 Bug 报告都欢迎——参见[贡献指南](../../../CONTRIBUTING.md)、[行为准则](../../../CODE_OF_CONDUCT.md)和[安全政策](../../../SECURITY.md)。

NOFX 会记录有价值的贡献，并计划随着生态发展回馈贡献者。优先级 Issue 拥有更高权重。

| 贡献类型      | 权重 |
| :---------------- | :----: |
| 置顶 Issue 的 PR  | ★★★★★★ |
| 代码（已合并 PR） | ★★★★★  |
| Bug 修复         |  ★★★★  |
| 功能建议     |  ★★★   |
| Bug 报告       |   ★★   |
| 文档     |   ★★   |

<a href="https://github.com/NoFxAiOS/nofx/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=NoFxAiOS/nofx" alt="Contributors"/>
</a>

## 赞助者

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

[成为赞助者](https://github.com/sponsors/NoFxAiOS)

<br/>

如果 NOFX 对你有帮助，点个 Star 能让更多交易者发现它。

[![Star History Chart](https://star-history.dera.page/svg?repos=NoFxAiOS/nofx&type=Date)](https://star-history.dera.page/#NoFxAiOS/nofx&Date)

## 许可证

[AGPL-3.0](../../../LICENSE)

<sub>自动化交易存在重大风险。AI 驱动的策略尚处实验阶段，可能造成亏损。请合理控制仓位规模，充分了解每个交易场所，切勿投入无法承受损失的资金。完整[免责声明](../../../DISCLAIMER.md)。</sub>
