# 🤖 NOFX - AI驱动的币安合约自动交易竞赛系统

[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?style=flat&logo=go)](https://golang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**语言 / Languages:** [English](README.md) | [中文](README.zh-CN.md) | [Українська](README.uk.md) | [Русский](README.ru.md)

---

一个基于 **DeepSeek/Qwen AI** 的加密货币期货自动交易系统，支持 **Binance、Hyperliquid和Aster DEX交易所**，**多AI模型实盘竞赛**，具备完整的市场分析、AI决策、**自我学习机制**和专业的Web监控界面。

> ⚠️ **风险提示**：本系统为实验性项目，AI自动交易存在重大风险，强烈建议仅用于学习研究或小额资金测试！

## 👥 开发者社区

加入我们的Telegram开发者社区，讨论、分享想法并获得支持：

**💬 [NOFX开发者社区](https://t.me/nofx_dev_community)**

---

## 🆕 最新更新

### 🚀 多交易所支持！

NOFX现已支持**三大交易所**：Binance、Hyperliquid和Aster DEX！

#### **Hyperliquid交易所**

高性能的去中心化永续期货交易所！

**核心特性：**
- ✅ 完整交易支持（做多/做空、杠杆、止损/止盈）
- ✅ 自动精度处理（订单数量和价格）
- ✅ 统一trader接口（无缝切换交易所）
- ✅ 支持主网和测试网
- ✅ 无需API密钥 - 只需以太坊私钥

**为什么选择Hyperliquid？**
- 🔥 比中心化交易所手续费更低
- 🔒 非托管 - 你掌控自己的资金
- ⚡ 快速执行与链上结算
- 🌍 无需KYC

**快速开始：**
1. 获取你的MetaMask私钥（去掉`0x`前缀）
2. 在config.json中设置`"exchange": "hyperliquid"`
3. 添加`"hyperliquid_private_key": "your_key"`
4. 开始交易！

详见[配置指南](#-备选使用hyperliquid交易所)。

#### **Aster DEX交易所**（新！v2.0.2）

兼容Binance的去中心化永续期货交易所！

**核心特性：**
- ✅ Binance风格API（从Binance轻松迁移）
- ✅ Web3钱包认证（安全且去中心化）
- ✅ 完整交易支持，自动精度处理
- ✅ 比中心化交易所手续费更低
- ✅ 兼容EVM（以太坊、BSC、Polygon等）

**为什么选择Aster？**
- 🎯 **兼容Binance API** - 需要最少的代码修改
- 🔐 **API钱包系统** - 独立交易钱包提升安全性
- 💰 **有竞争力的手续费** - 比大多数中心化交易所更低
- 🌐 **多链支持** - 在你喜欢的EVM链上交易

**快速开始：**
1. 访问[Aster API钱包](https://www.asterdex.com/en/api-wallet)
2. 连接你的主钱包并创建API钱包
3. 复制API Signer地址和私钥
4. 在config.json中设置`"exchange": "aster"`
5. 添加`"aster_user"`、`"aster_signer"`和`"aster_private_key"`

---

## 📸 系统截图

### 🏆 竞赛模式 - AI实时对战
![竞赛页面](screenshots/competition-page.png)
*多AI排行榜和实时性能对比图表，展示Qwen vs DeepSeek实时交易对战*

### 📊 交易详情 - 完整交易仪表盘
![详情页面](screenshots/details-page.png)
*专业交易界面，包含权益曲线、实时持仓、AI决策日志，支持展开查看输入提示词和AI思维链推理过程*

---

## ✨ 核心特性

### 🏆 多AI竞赛模式
- **Qwen vs DeepSeek** 实盘对抗
- 独立账户管理，独立决策日志
- 实时性能对比图表
- 收益率PK，胜率统计

### 🧠 AI自我学习机制（NEW！）
- **历史反馈**: 每次决策前分析最近20个周期的交易表现
- **智能优化**:
  - 识别表现最佳/最差币种
  - 计算胜率、盈亏比、平均盈利
  - 避免重复错误（连续亏损的币种）
  - 强化成功策略（高胜率的交易模式）
- **动态调整**: AI根据历史表现自主调整交易风格

### 📊 智能市场分析
- **3分钟K线**: 实时价格、EMA20、MACD、RSI(7)
- **4小时K线**: 长期趋势、EMA20/50、ATR、RSI(14)
- **持仓量分析**: 市场情绪、资金流向判断
- **OI Top追踪**: 持仓量增长最快的20个币种
- **AI500币种池**: 高评分币种自动筛选
- **流动性过滤**: 自动过滤持仓价值<15M USD的低流动性币种

### 🎯 专业风险控制
- **单币种仓位上限**:
  - 山寨币 ≤ 1.5倍账户净值
  - BTC/ETH ≤ 10倍账户净值
- **可配置杠杆** (v2.0.3+):
  - 在config.json中设置最大杠杆
  - 默认：所有币种5倍（子账户安全）
  - 主账户可增加：山寨币最高20倍，BTC/ETH最高50倍
  - ⚠️ 币安子账户限制≤5倍杠杆
- **保证金管理**: 总使用率≤90%，AI自主决策使用率
- **风险回报比**: 强制≥1:2（止损:止盈）
- **防止仓位叠加**: 同币种同方向不允许重复开仓

### 🎨 风格UI
- **专业交易界面**: 视觉设计
- **暗色主题**: 经典配色（金色#F0B90B + 深色背景）
- **实时数据**: 5秒刷新账户、持仓、图表
- **收益率曲线**: 账户净值历史走势（美元/百分比切换）
- **性能对比图**: 多AI收益率实时对比
- **动画效果**: 流畅的hover、过渡、加载动画

### 📝 完整决策记录
- **思维链记录**: AI的完整推理过程（CoT）
- **历史表现**: 整体胜率、平均盈利、盈亏比
- **最近交易**: 最近5笔交易详情（开仓价→平仓价→盈亏%）
- **币种统计**: 各币种表现（胜率、平均盈亏）
- **JSON日志**: 每次决策完整记录，便于复盘分析

---

## 🏗️ 技术架构

```
nofx/
├── main.go                          # 程序入口（多trader管理器）
├── config.json                      # 配置文件（API密钥、多trader配置）
│
├── api/                            # HTTP API服务
│   └── server.go                   # Gin框架，RESTful API
│
├── trader/                         # 交易核心
│   ├── auto_trader.go              # 自动交易主控（单trader）
│   └── binance_futures.go          # 币安合约API封装
│
├── manager/                        # 多trader管理
│   └── trader_manager.go           # 管理多个trader实例
│
├── mcp/                            # Model Context Protocol - AI通信
│   └── client.go                   # AI API客户端（DeepSeek/Qwen集成）
│
├── decision/                       # AI决策引擎
│   └── engine.go                   # 决策逻辑（含历史反馈）
│
├── market/                         # 市场数据获取
│   └── data.go                     # 市场数据与技术指标（K线、RSI、MACD）
│
├── pool/                           # 币种池管理
│   └── coin_pool.go                # AI500 + OI Top合并池
│
├── logger/                         # 日志系统
│   └── decision_logger.go          # 决策记录 + 表现分析
│
├── decision_logs/                  # 决策日志存储
│   ├── qwen_trader/                # Qwen trader日志
│   └── deepseek_trader/            # DeepSeek trader日志
│
└── web/                            # React前端
    ├── src/
    │   ├── components/             # React组件
    │   │   ├── EquityChart.tsx     # 收益率曲线图
    │   │   ├── ComparisonChart.tsx # 多AI对比图
    │   │   └── CompetitionPage.tsx # 竞赛排行榜
    │   ├── lib/api.ts              # API调用封装
    │   ├── types/index.ts          # TypeScript类型
    │   ├── index.css               # Binance风格样式
    │   └── App.tsx                 # 主应用
    └── package.json
```

### 核心依赖

**后端 (Go)**
- `github.com/adshao/go-binance/v2` - 币安API客户端
- `github.com/markcheno/go-talib` - 技术指标计算（TA-Lib）
- `github.com/gin-gonic/gin` - HTTP API框架

**前端 (React + TypeScript)**
- `react` + `react-dom` - UI框架
- `recharts` - 图表库（收益率曲线、对比图）
- `swr` - 数据获取和缓存
- `tailwindcss` - CSS框架

---

## 💰 注册币安账户（省手续费！）

使用本系统前，您需要一个币安合约账户。**使用我们的推荐链接注册可享受手续费优惠：**

**🎁 [注册币安 - 享手续费折扣](https://www.binance.com/join?ref=TINKLEVIP)**

### 注册步骤：

1. **点击上方链接** 访问币安注册页面
2. **完成注册** 使用邮箱/手机号注册
3. **完成KYC身份认证**（合约交易必须）
4. **开通合约账户**：
   - 进入币安首页 → 衍生品 → U本位合约
   - 点击"立即开通"激活合约交易
5. **创建API密钥**：
   - 进入账户 → API管理
   - 创建新的API密钥，**务必勾选"合约"权限**
   - 保存API Key和Secret Key（config.json中需要）
   - **重要**：添加IP白名单以确保安全

### 手续费优惠说明：

- ✅ **现货交易**：最高享30%手续费返佣
- ✅ **合约交易**：最高享30%手续费返佣
- ✅ **终身有效**：永久享受交易手续费折扣

---

## 🚀 快速开始

### 🐳 方式A：Docker 一键部署（最简单 - 新手推荐！）

**⚡ 使用Docker只需3步即可开始交易 - 无需安装任何环境！**

Docker会自动处理所有依赖（Go、Node.js、TA-Lib）和环境配置，完美适合新手！

#### 步骤1：准备配置文件
```bash
# 复制配置文件模板
cp config.json.example config.json

# 编辑并填入你的API密钥
nano config.json  # 或使用其他编辑器
```

#### 步骤2：一键启动
```bash
# 方式1：使用便捷脚本（推荐）
chmod +x start.sh
./start.sh start --build


# 方式2：直接使用docker compose
# 如果您还在使用旧的独立 `docker-compose`，请升级到 Docker Desktop 或 Docker 20.10+
docker compose up -d --build
```

#### 步骤3：访问控制台
在浏览器中打开：**http://localhost:3000**

**就是这么简单！🎉** 你的AI交易系统已经运行起来了！

#### 管理你的系统
```bash
./start.sh logs      # 查看日志
./start.sh status    # 检查状态
./start.sh stop      # 停止服务
./start.sh restart   # 重启服务
```

**📖 详细的Docker部署教程、故障排查和高级配置：**
- **中文**: 查看 [DOCKER_DEPLOY.md](DOCKER_DEPLOY.md)
- **English**: See [DOCKER_DEPLOY.en.md](DOCKER_DEPLOY.en.md)

---

### 📦 方式B：手动安装（开发者）

**注意**：如果你使用了上面的Docker部署，请跳过本节。手动安装仅在你需要修改代码或不想使用Docker时需要。

### 1. 环境要求

- **Go 1.21+**
- **Node.js 18+**
- **TA-Lib** 库（技术指标计算）

#### 安装 TA-Lib

**macOS:**
```bash
brew install ta-lib
```

**Ubuntu/Debian:**
```bash
sudo apt-get install libta-lib0-dev
```

**其他系统**: 参考 [TA-Lib官方文档](https://github.com/markcheno/go-talib)

### 2. 克隆项目

```bash
git clone <repository-url>
cd nofx
```

### 3. 安装依赖

**后端:**
```bash
go mod download
```

**前端:**
```bash
cd web
npm install
cd ..
```

### 4. 获取AI API密钥

在配置系统之前，您需要获取AI API密钥。请选择以下AI提供商之一：

#### 选项1：DeepSeek（推荐新手）

**为什么选择DeepSeek？**
- 💰 比GPT-4便宜（约1/10成本）
- 🚀 响应速度快
- 🎯 交易决策质量优秀
- 🌍 全球可用无需VPN

**如何获取DeepSeek API密钥：**

1. **访问**：[https://platform.deepseek.com](https://platform.deepseek.com)
2. **注册**：使用邮箱/手机号注册
3. **验证**：完成邮箱/手机验证
4. **充值**：向账户添加余额
   - 最低：约$5美元
   - 推荐：$20-50美元用于测试
5. **创建API密钥**：
   - 进入API Keys部分
   - 点击"创建新密钥"
   - 复制并保存密钥（以`sk-`开头）
   - ⚠️ **重要**：立即保存 - 之后无法再查看！

**价格**：每百万tokens约$0.14（非常便宜！）

#### 选项2：Qwen（阿里云通义千问）

**如何获取Qwen API密钥：**

1. **访问**：[https://dashscope.aliyuncs.com](https://dashscope.aliyuncs.com)
2. **注册**：使用阿里云账户注册
3. **开通服务**：激活DashScope服务
4. **创建API密钥**：
   - 进入API密钥管理
   - 创建新密钥
   - 复制并保存（以`sk-`开头）

**注意**：可能需要中国手机号注册

---

### 5. 系统配置

**两种配置模式可选：**
- **🌟 新手模式**：单trader + 默认币种（推荐！）
- **⚔️ 专家模式**：多trader竞赛

#### 🌟 新手模式配置（推荐）

**步骤1**：复制并重命名示例配置文件

```bash
cp config.json.example config.json
```

**步骤2**：编辑`config.json`填入您的API密钥

```json
{
  "traders": [
    {
      "id": "my_trader",
      "name": "我的AI交易员",
      "ai_model": "deepseek",
      "binance_api_key": "YOUR_BINANCE_API_KEY",
      "binance_secret_key": "YOUR_BINANCE_SECRET_KEY",
      "use_qwen": false,
      "deepseek_key": "sk-xxxxxxxxxxxxx",
      "qwen_key": "",
      "initial_balance": 1000.0,
      "scan_interval_minutes": 3
    }
  ],
  "leverage": {
    "btc_eth_leverage": 5,
    "altcoin_leverage": 5
  },
  "use_default_coins": true,
  "coin_pool_api_url": "",
  "oi_top_api_url": "",
  "api_server_port": 8080
}
```

**步骤3**：用您的实际密钥替换占位符

| 占位符 | 替换为 | 哪里获取 |
|-------|--------|---------|
| `YOUR_BINANCE_API_KEY` | 您的币安API密钥 | 币安 → 账户 → API管理 |
| `YOUR_BINANCE_SECRET_KEY` | 您的币安Secret密钥 | 同上 |
| `sk-xxxxxxxxxxxxx` | 您的DeepSeek API密钥 | [platform.deepseek.com](https://platform.deepseek.com) |

**步骤4**：调整初始余额（可选）

- `initial_balance`：设置为您实际的币安合约账户余额
- 用于计算盈亏百分比
- 例如：如果您有500 USDT，设置`"initial_balance": 500.0`

**✅ 配置检查清单：**

- [ ] 币安API密钥已填写（无引号问题）
- [ ] 币安Secret密钥已填写（无引号问题）
- [ ] DeepSeek API密钥已填写（以`sk-`开头）
- [ ] `use_default_coins`设为`true`（新手）
- [ ] `initial_balance`与您的账户余额匹配
- [ ] 文件保存为`config.json`（不是`.example`）

---

#### 🔷 备选：使用Hyperliquid交易所

**NOFX也支持Hyperliquid** - 去中心化永续期货交易所。使用Hyperliquid而非Binance：

**步骤1**：获取以太坊私钥（用于Hyperliquid身份验证）

1. 打开**MetaMask**（或任何以太坊钱包）
2. 导出你的私钥
3. **去掉`0x`前缀**
4. 在[Hyperliquid](https://hyperliquid.xyz)上为钱包充值

**步骤2**：为Hyperliquid配置`config.json`

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

**与Binance配置的关键区别：**
- 用`hyperliquid_private_key`替换`binance_api_key` + `binance_secret_key`
- 添加`"exchange": "hyperliquid"`字段
- 设置`hyperliquid_testnet: false`用于主网（或`true`用于测试网）

**⚠️ 安全警告**：切勿分享你的私钥！使用专门的钱包进行交易，而非主钱包。

---

#### 🔶 备选：使用Aster DEX交易所

**NOFX也支持Aster DEX** - 兼容Binance的去中心化永续期货交易所！

**为什么选择Aster？**
- 🎯 兼容Binance API（轻松迁移）
- 🔐 API钱包安全系统
- 💰 更低的交易手续费
- 🌐 多链支持（ETH、BSC、Polygon）
- 🌍 无需KYC

**步骤1**：创建Aster API钱包

1. 访问[Aster API钱包](https://www.asterdex.com/en/api-wallet)
2. 连接你的主钱包（MetaMask、WalletConnect等）
3. 点击"创建API钱包"
4. **立即保存这3项：**
   - 主钱包地址（User）
   - API钱包地址（Signer）
   - API钱包私钥（⚠️ 仅显示一次！）

**步骤2**：为Aster配置`config.json`

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

**关键配置字段：**
- `"exchange": "aster"` - 设置交易所为Aster
- `aster_user` - 你的主钱包地址
- `aster_signer` - API钱包地址（来自步骤1）
- `aster_private_key` - API钱包私钥（去掉`0x`前缀）

**⚠️ 安全提示**：
- API钱包与主钱包分离（额外的安全层）
- 切勿分享API私钥
- 你可以随时在[asterdex.com](https://www.asterdex.com/en/api-wallet)撤销API钱包访问

---

#### ⚔️ 专家模式：多Trader竞赛

用于运行多个AI trader相互竞争：

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

**竞赛模式要求：**
- 2个独立的币安合约账户（不同的API密钥）
- 两种AI API密钥（Qwen + DeepSeek）
- 更多测试资金（推荐：每个账户500+ USDT）

---

#### 📚 配置字段详解

| 字段 | 说明 | 示例值 | 是否必填？ |
|-----|------|--------|-----------|
| `id` | 此trader的唯一标识符 | `"my_trader"` | ✅ 是 |
| `name` | 显示名称 | `"我的AI交易员"` | ✅ 是 |
| `enabled` | 是否启用此trader<br>设为`false`可跳过启动 | `true` 或 `false` | ✅ 是 |
| `ai_model` | 使用的AI提供商 | `"deepseek"` 或 `"qwen"` 或 `"custom"` | ✅ 是 |
| `exchange` | 使用的交易所 | `"binance"` 或 `"hyperliquid"` 或 `"aster"` | ✅ 是 |
| `binance_api_key` | 币安API密钥 | `"abc123..."` | 使用Binance时必填 |
| `binance_secret_key` | 币安Secret密钥 | `"xyz789..."` | 使用Binance时必填 |
| `hyperliquid_private_key` | Hyperliquid私钥<br>⚠️ 去掉`0x`前缀 | `"your_key..."` | 使用Hyperliquid时必填 |
| `hyperliquid_wallet_addr` | Hyperliquid钱包地址 | `"0xabc..."` | 使用Hyperliquid时必填 |
| `hyperliquid_testnet` | 是否使用测试网 | `true` 或 `false` | ❌ 否（默认false） |
| `use_qwen` | 是否使用Qwen | `true` 或 `false` | ✅ 是 |
| `deepseek_key` | DeepSeek API密钥 | `"sk-xxx"` | 使用DeepSeek时必填 |
| `qwen_key` | Qwen API密钥 | `"sk-xxx"` | 使用Qwen时必填 |
| `initial_balance` | 用于P/L计算的起始余额 | `1000.0` | ✅ 是 |
| `scan_interval_minutes` | 决策频率（分钟） | `3`（建议3-5） | ✅ 是 |
| **`leverage`** | **杠杆配置 (v2.0.3+)** | 见下文 | ✅ 是 |
| `btc_eth_leverage` | BTC/ETH最大杠杆<br>⚠️ 子账户：≤5倍 | `5`（默认，安全）<br>`50`（主账户最大） | ✅ 是 |
| `altcoin_leverage` | 山寨币最大杠杆<br>⚠️ 子账户：≤5倍 | `5`（默认，安全）<br>`20`（主账户最大） | ✅ 是 |
| `use_default_coins` | 使用内置币种列表<br>**✨ 智能默认：`true`** (v2.0.2+)<br>未提供API时自动启用 | `true` 或省略 | ❌ 否<br>(可选，自动默认) |
| `coin_pool_api_url` | 自定义币种池API<br>*仅当`use_default_coins: false`时需要* | `""`（空） | ❌ 否 |
| `oi_top_api_url` | 持仓量API<br>*可选补充数据* | `""`（空） | ❌ 否 |
| `api_server_port` | Web仪表板端口 | `8080` | ✅ 是 |

**默认交易币种**（当 `use_default_coins: true` 时）：
- BTC、ETH、SOL、BNB、XRP、DOGE、ADA、HYPE

---

#### ⚙️ 杠杆配置 (v2.0.3+)

**什么是杠杆配置？**

杠杆设置控制AI每次交易可以使用的最大杠杆。这对于风险管理至关重要，特别是对于有杠杆限制的币安子账户。

**配置格式：**

```json
"leverage": {
  "btc_eth_leverage": 5,    // BTC和ETH的最大杠杆
  "altcoin_leverage": 5      // 所有其他币种的最大杠杆
}
```

**⚠️ 重要：币安子账户限制**

- **子账户**：币安限制为**≤5倍杠杆**
- **主账户**：可使用最高20倍（山寨币）或50倍（BTC/ETH）
- 如果您使用子账户并设置杠杆>5倍，交易将**失败**，错误信息：`Subaccounts are restricted from using leverage greater than 5x`

**推荐设置：**

| 账户类型 | BTC/ETH杠杆 | 山寨币杠杆 | 风险级别 |
|---------|------------|-----------|---------|
| **子账户** | `5` | `5` | ✅ 安全（默认） |
| **主账户（保守）** | `10` | `10` | 🟡 中等 |
| **主账户（激进）** | `20` | `15` | 🔴 高 |
| **主账户（最大）** | `50` | `20` | 🔴🔴 非常高 |

**示例：**

**安全配置（子账户或保守）：**
```json
"leverage": {
  "btc_eth_leverage": 5,
  "altcoin_leverage": 5
}
```

**激进配置（仅主账户）：**
```json
"leverage": {
  "btc_eth_leverage": 20,
  "altcoin_leverage": 15
}
```

**AI如何使用杠杆：**

- AI可以选择**从1倍到您配置的最大值之间的任何杠杆**
- 例如，当`altcoin_leverage: 20`时，AI可能根据市场情况决定使用5倍、10倍或20倍
- 配置设置的是**上限**，而不是固定值
- AI在选择杠杆时会考虑波动性、风险回报比和账户余额

---

#### ⚠️ 重要：`use_default_coins` 字段

**智能默认行为（v2.0.2+）：**

系统现在会自动默认为`use_default_coins: true`，如果：
- 您在config.json中未包含此字段，或
- 您将其设为`false`但未提供`coin_pool_api_url`

这让新手更友好！您甚至可以完全省略此字段。

**配置示例：**

✅ **选项1：显式设置（推荐以保持清晰）**
```json
"use_default_coins": true,
"coin_pool_api_url": "",
"oi_top_api_url": ""
```

✅ **选项2：省略字段（自动使用默认币种）**
```json
// 完全不包含"use_default_coins"
"coin_pool_api_url": "",
"oi_top_api_url": ""
```

⚙️ **高级：使用外部API**
```json
"use_default_coins": false,
"coin_pool_api_url": "http://your-api.com/coins",
"oi_top_api_url": "http://your-api.com/oi"
```

---

### 6. 运行系统

#### 🚀 启动系统（2个步骤）

系统有**2个部分**需要分别运行：
1. **后端**（AI交易大脑 + API）
2. **前端**（Web监控仪表板）

---

#### **步骤1：启动后端**

打开终端并运行：

```bash
# 构建程序（首次运行或代码更改后）
go build -o nofx

# 启动后端
./nofx
```

**您应该看到：**

```
🚀 启动自动交易系统...
✓ Trader [my_trader] 已初始化
✓ API服务器启动在端口 8080
📊 开始交易监控...
```

**⚠️ 如果看到错误：**

| 错误信息 | 解决方案 |
|---------|---------|
| `invalid API key` | 检查config.json中的币安API密钥 |
| `TA-Lib not found` | 运行`brew install ta-lib`（macOS） |
| `port 8080 already in use` | 修改config.json中的`api_server_port` |
| `DeepSeek API error` | 验证DeepSeek API密钥和余额 |

**✅ 后端运行正常的标志：**
- 无错误信息
- 出现"开始交易监控..."
- 系统显示账户余额
- 保持此终端窗口打开！

---

#### **步骤2：启动前端**

打开**新的终端窗口**（保持第一个运行！），然后：

```bash
cd web
npm run dev
```

**您应该看到：**

```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**✅ 前端运行正常的标志：**
- "Local: http://localhost:3000/"消息
- 无错误信息
- 也保持此终端窗口打开！

---

#### **步骤3：访问仪表板**

在Web浏览器中访问：

**🌐 http://localhost:3000**

**您将看到：**
- 📊 实时账户余额
- 📈 持仓（如果有）
- 🤖 AI决策日志
- 📉 净值曲线图

**首次使用提示：**
- 首次AI决策可能需要3-5分钟
- 初始决策可能显示"观望"- 这是正常的
- AI需要先分析市场状况

---

### 7. 监控系统

**需要关注的内容：**

✅ **健康系统标志：**
- 后端终端每3-5分钟显示决策周期
- 无持续错误信息
- 账户余额更新
- Web仪表板自动刷新

⚠️ **警告标志：**
- 重复的API错误
- 10分钟以上无决策
- 余额快速下降

**检查系统状态：**

```bash
# 在新终端窗口中
curl http://localhost:8080/health
```

应返回：`{"status":"ok"}`

---

### 8. 停止系统

**优雅关闭（推荐）：**

1. 转到**后端终端**（第一个）
2. 按`Ctrl+C`
3. 等待"系统已停止"消息
4. 转到**前端终端**（第二个）
5. 按`Ctrl+C`

**⚠️ 重要：**
- 始终先停止后端
- 关闭终端前等待确认
- 不要强制退出（不要直接关闭终端）

---

## 📖 AI决策流程

每个决策周期（默认3分钟），系统按以下流程运行：

```
┌──────────────────────────────────────────────────────────┐
│ 1. 📊 分析历史表现（最近20个周期）                        │
├──────────────────────────────────────────────────────────┤
│  ✓ 计算整体胜率、平均盈利、盈亏比                         │
│  ✓ 统计各币种表现（胜率、平均USDT盈亏）                  │
│  ✓ 识别最佳/最差币种                                     │
│  ✓ 列出最近5笔交易详情（含准确盈亏金额）                  │
│  ✓ 计算夏普比率衡量风险调整后收益                         │
│  📌 新增 (v2.0.2): 考虑杠杆的准确USDT盈亏计算            │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│ 2. 💰 获取账户状态                                       │
├──────────────────────────────────────────────────────────┤
│  • 账户净值、可用余额、未实现盈亏                         │
│  • 持仓数量、总盈亏（已实现+未实现）                      │
│  • 保证金使用率（current/maximum）                       │
│  • 风险评估指标                                          │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│ 3. 🔍 分析现有持仓（如果有）                              │
├──────────────────────────────────────────────────────────┤
│  • 获取每个持仓的市场数据（3分钟+4小时K线）               │
│  • 计算技术指标（RSI、MACD、EMA）                        │
│  • 显示持仓时长（例如"持仓时长2小时15分钟"）               │
│  • AI判断是否需要平仓（止盈、止损或调整）                 │
│  📌 新增 (v2.0.2): 追踪持仓时长帮助AI决策                │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│ 4. 🎯 评估新机会（候选币种池）                            │
├──────────────────────────────────────────────────────────┤
│  • 获取AI500高评分币种（前20个）                          │
│  • 获取OI Top持仓增长币种（前20个）                       │
│  • 合并去重，过滤低流动性币种（持仓量<15M USD）           │
│  • 批量获取市场数据和技术指标                             │
│  • 为每个候选币种准备完整的原始数据序列                    │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│ 5. 🧠 AI综合决策                                         │
├──────────────────────────────────────────────────────────┤
│  • 查看历史反馈（胜率、盈亏比、最佳/最差币种）            │
│  • 接收所有原始序列数据（K线、指标、持仓量）              │
│  • Chain of Thought 思维链分析                           │
│  • 输出决策：平仓/开仓/持有/观望                          │
│  • 包含杠杆、仓位、止损、止盈参数                         │
│  📌 新增 (v2.0.2): AI可自由分析原始序列，不受预定义指标限制 │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│ 6. ⚡ 执行交易                                           │
├──────────────────────────────────────────────────────────┤
│  • 优先级排序：先平仓，再开仓                             │
│  • 精度自动适配（LOT_SIZE规则）                          │
│  • 防止仓位叠加（同币种同方向拒绝开仓）                   │
│  • 平仓后自动取消所有挂单                                │
│  • 记录开仓时间用于持仓时长追踪                           │
│  📌 新增 (v2.0.2): 追踪持仓开仓时间                      │
└──────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────┐
│ 7. 📝 记录日志                                           │
├──────────────────────────────────────────────────────────┤
│  • 保存完整决策记录到 decision_logs/                     │
│  • 包含思维链、决策JSON、账户快照、执行结果               │
│  • 存储完整持仓数据（数量、杠杆、开/平仓时间）            │
│  • 使用symbol_side键值防止多空冲突                       │
│  📌 新增 (v2.0.2): 防止多空持仓冲突，考虑数量+杠杆       │
└──────────────────────────────────────────────────────────┘
```

### v2.0.2的核心改进

**📌 持仓时长追踪：**
- 系统现在追踪每个持仓已持有多长时间
- 在用户提示中显示："持仓时长2小时15分钟"
- 帮助AI更好地判断何时退出仓位

**📌 准确的盈亏计算：**
- 之前：只显示百分比（100U@5% = 1000U@5% = 都显示"5.0"）
- 现在：真实USDT盈亏 = 仓位价值 × 价格变化% × 杠杆倍数
- 示例：1000 USDT × 5% × 20倍 = 1000 USDT实际盈利

**📌 增强的AI自由度：**
- AI可以自由分析所有原始序列数据
- 不再局限于预定义的指标组合
- 可以执行自己的趋势分析、支撑位/阻力位计算

**📌 改进的持仓追踪：**
- 使用`symbol_side`键值（例如"BTCUSDT_long"）
- 防止同时持有多空仓时的冲突
- 存储完整数据：数量、杠杆、开/平仓时间

---

## 🧠 AI自我学习示例

### 历史反馈（Prompt中自动添加）

```markdown
## 📊 历史表现反馈

### 整体表现
- **总交易数**: 15 笔 (盈利: 8 | 亏损: 7)
- **胜率**: 53.3%
- **平均盈利**: +3.2% | 平均亏损: -2.1%
- **盈亏比**: 1.52:1

### 最近交易
1. BTCUSDT LONG: 95000.0000 → 97500.0000 = +2.63% ✓
2. ETHUSDT SHORT: 3500.0000 → 3450.0000 = +1.43% ✓
3. SOLUSDT LONG: 185.0000 → 180.0000 = -2.70% ✗
4. BNBUSDT LONG: 610.0000 → 625.0000 = +2.46% ✓
5. ADAUSDT LONG: 0.8500 → 0.8300 = -2.35% ✗

### 币种表现
- **最佳**: BTCUSDT (胜率75%, 平均+2.5%)
- **最差**: SOLUSDT (胜率25%, 平均-1.8%)
```

### AI如何使用反馈

1. **避免连续亏损币种**: 看到SOLUSDT连续3次止损，AI会避开或更谨慎
2. **强化成功策略**: BTC突破做多胜率75%，AI会继续这个模式
3. **动态调整风格**: 胜率<40%时变保守，盈亏比>2时保持激进
4. **识别市场环境**: 连续亏损可能说明市场震荡，减少交易频率

---

## 📊 Web界面功能

### 1. 竞赛页面（Competition）

- **🏆 排行榜**: 实时收益率排名，金色边框突出显示领先者
- **📈 性能对比图**: 双AI收益率曲线对比（紫色vs蓝色）
- **⚔️ Head-to-Head**: 直接对比，显示领先差距
- **实时数据**: 总净值、盈亏%、持仓数、保证金使用率

### 2. 详情页面（Details）

- **账户净值曲线**: 历史走势图（美元/百分比切换）
- **统计信息**: 总周期、成功/失败、开仓/平仓统计
- **持仓表格**: 所有持仓详情（入场价、当前价、盈亏%、强平价）
- **AI决策日志**: 最近决策记录（可展开思维链）

### 3. 实时更新

- 系统状态、账户信息、持仓列表：**每5秒刷新**
- 决策日志、统计信息：**每10秒刷新**
- 收益率图表：**每10秒刷新**

---

## 🎛️ API接口

### 竞赛相关

```bash
GET /api/competition          # 竞赛排行榜（所有trader）
GET /api/traders              # Trader列表
```

### 单Trader相关

```bash
GET /api/status?trader_id=xxx            # 系统状态
GET /api/account?trader_id=xxx           # 账户信息
GET /api/positions?trader_id=xxx         # 持仓列表
GET /api/equity-history?trader_id=xxx    # 净值历史（图表数据）
GET /api/decisions/latest?trader_id=xxx  # 最新5条决策
GET /api/statistics?trader_id=xxx        # 统计信息
```

### 系统接口

```bash
GET /health                   # 健康检查
GET /api/config               # 系统配置
```

---

## 📝 决策日志格式

每次AI决策都会生成详细的JSON日志：

### 日志文件路径
```
decision_logs/
├── qwen_trader/
│   └── decision_20251028_153042_cycle15.json
└── deepseek_trader/
    └── decision_20251028_153045_cycle15.json
```

### 日志内容示例

```json
{
  "timestamp": "2025-10-28T15:30:42+08:00",
  "cycle_number": 15,
  "cot_trace": "当前持仓：ETHUSDT多头盈利+2.3%，趋势良好继续持有...",
  "decision_json": "[{\"symbol\":\"BTCUSDT\",\"action\":\"open_long\"...}]",
  "account_state": {
    "total_balance": 1045.80,
    "available_balance": 823.40,
    "position_count": 3,
    "margin_used_pct": 21.3
  },
  "positions": [...],
  "candidate_coins": ["BTCUSDT", "ETHUSDT", ...],
  "decisions": [
    {
      "action": "open_long",
      "symbol": "BTCUSDT",
      "quantity": 0.015,
      "leverage": 50,
      "price": 95800.0,
      "order_id": 123456789,
      "success": true
    }
  ],
  "execution_log": ["✓ BTCUSDT open_long 成功"],
  "success": true
}
```

---

## 🔧 风险控制详解

### 单币种仓位限制

| 币种类型 | 仓位价值上限 | 杠杆 | 保证金占用 | 示例（1000U账户） |
|---------|-------------|------|-----------|------------------|
| 山寨币  | 1.5倍净值    | 20x  | 7.5%      | 最多开1500U仓位 = 75U保证金 |
| BTC/ETH | 10倍净值     | 50x  | 20%       | 最多开10000U仓位 = 200U保证金 |

### 为什么这样设计？

1. **高杠杆 + 小仓位 = 分散风险**
   - 20倍杠杆，1500U仓位，只需75U保证金
   - 可以同时开10+个小仓位，分散单币种风险

2. **单币种风险可控**
   - 山寨币仓位≤1.5倍净值，5%反向波动 = 7.5%损失
   - BTC仓位≤10倍净值，2%反向波动 = 20%损失

3. **不限制总保证金使用率**
   - AI根据市场机会自主决策保证金使用率
   - 上限90%，但不强制满仓
   - 有好机会就开仓，没机会就观望

### 防止过度交易

- **同币种同方向不允许重复开仓**: 防止AI连续开同一个仓位导致超限
- **先平仓后开仓**: 换仓时确保先释放保证金
- **止损止盈强制检查**: 风险回报比≥1:2

---

## ⚠️ 重要风险提示

### 交易风险

1. **加密货币市场波动极大**，AI决策不保证盈利
2. **合约交易使用杠杆**，亏损可能超过本金
3. **市场极端行情**下可能出现爆仓风险
4. **资金费率**可能影响持仓成本
5. **流动性风险**：某些币种可能出现滑点

### 技术风险

1. **网络延迟**可能导致价格滑点
2. **API限流**可能影响交易执行
3. **AI API超时**可能导致决策失败
4. **系统Bug**可能引发意外行为

### 使用建议

✅ **建议做法**
- 仅使用可承受损失的资金测试
- 从小额资金开始（建议100-500 USDT）
- 定期检查系统运行状态
- 监控账户余额变化
- 分析AI决策日志，理解策略

❌ **不建议做法**
- 投入全部资金或借贷资金
- 长时间无人监控运行
- 盲目信任AI决策
- 在不理解系统的情况下使用
- 在市场极端波动时运行

---

## 🛠️ 常见问题

### 1. 编译错误：TA-Lib not found

**解决**: 安装TA-Lib库
```bash
# macOS
brew install ta-lib

# Ubuntu
sudo apt-get install libta-lib0-dev
```

### 2. 精度错误：Precision is over the maximum

**解决**: 系统已自动处理精度，从Binance获取LOT_SIZE。如仍报错，检查网络连接。

### 3. AI API超时

**解决**:
- 检查API密钥是否正确
- 检查网络连接（可能需要代理）
- 系统超时时间已设置为120秒

### 4. 前端无法连接后端

**解决**:
- 确保后端正在运行（http://localhost:8080）
- 检查端口8080是否被占用
- 查看浏览器控制台错误信息

### 5. 币种池API失败

**解决**:
- 币种池API是可选的
- 如果API失败，系统会使用默认主流币种（BTC、ETH等）
- 检查config.json中的API URL和auth参数

---

## 📈 性能优化建议

1. **合理设置决策周期**: 建议3-5分钟，避免过度交易
2. **控制候选币种数量**: 系统默认分析AI500前20 + OI Top前20
3. **定期清理日志**: 避免占用过多磁盘空间
4. **监控API调用次数**: 避免触发Binance限流（权重限制）
5. **小额资金测试**: 先用100-500 USDT测试策略有效性

---

## 🔄 更新日志

### v2.0.2 (2025-10-29)

**关键Bug修复 - 交易历史记录与性能分析：**

本版本修复了历史交易记录和性能分析系统中的**严重计算错误**，这些错误严重影响了盈利统计的准确性。

**1. 盈亏计算 - 重大错误修复** (logger/decision_logger.go)
- **问题**：之前只用百分比计算盈亏，完全忽略了仓位大小和杠杆倍数
  - 示例：100 USDT仓位赚5%和1000 USDT仓位赚5%都显示`5.0`作为盈利
  - 这导致性能分析完全不准确
- **解决方案**：现在计算实际USDT盈亏金额
  ```
  盈亏(USDT) = 仓位价值 × 价格变化% × 杠杆倍数
  示例: 1000 USDT × 5% × 20倍 = 1000 USDT实际盈利
  ```
- **影响**：胜率、盈亏比和夏普比率现在基于准确的USDT金额计算

**2. 持仓追踪 - 缺失关键数据**
- **问题**：开仓记录只存储了价格和时间，缺少数量和杠杆
- **解决方案**：现在存储完整交易数据：
  - `quantity`: 持仓数量（币数）
  - `leverage`: 杠杆倍数（如20倍）
  - 这些是准确计算盈亏的必要数据

**3. 持仓键值逻辑 - 多空冲突**
- **问题**：使用`symbol`作为持仓键值，导致同时持有多空仓时数据冲突
  - 示例：BTCUSDT多头和BTCUSDT空头会互相覆盖
- **解决方案**：改为`symbol_side`格式（如`BTCUSDT_long`、`BTCUSDT_short`）
  - 现在可以正确区分多空持仓

**4. 夏普比率计算 - 代码优化**
- **问题**：使用自定义的牛顿迭代法计算平方根
- **解决方案**：替换为标准库`math.Sqrt`
  - 更可靠、易维护且高效

**为什么这次更新很重要：**
- ✅ 历史交易统计现在显示**真实的USDT盈亏**而不是无意义的百分比
- ✅ 不同杠杆倍数的交易对比现在准确了
- ✅ AI自我学习机制接收到正确的历史反馈
- ✅ 盈亏比和夏普比率计算现在有意义了
- ✅ 多持仓追踪（同时持有多空）现在正常工作

**建议**：如果您在此更新前运行过系统，您的历史统计数据是不准确的。更新到v2.0.2后，新的交易将被正确计算。

### v2.0.1 (2025-10-29)

**Bug修复:**
- ✅ 修复ComparisonChart数据处理逻辑 - 从cycle_number分组改为timestamp分组
- ✅ 解决后端重启导致cycle_number重置时图表冻结的问题
- ✅ 改进图表数据显示 - 现在按时间顺序显示所有历史数据点
- ✅ 增强调试日志，便于问题排查

### v2.0.0 (2025-10-28)

**重大更新:**
- ✅ AI自我学习机制（历史反馈、表现分析）
- ✅ 多Trader竞赛模式（Qwen vs DeepSeek）
- ✅ Binance风格UI（完整模仿币安界面）
- ✅ 性能对比图表（收益率实时对比）
- ✅ 风险控制优化（单币种仓位上限调整）

**Bug修复:**
- 修复初始余额硬编码问题
- 修复多trader数据同步问题
- 优化图表数据对齐（使用cycle_number）

### v1.0.0 (2025-10-27)
- 初始版本发布
- 基础AI交易功能
- 决策日志系统
- 简单Web界面

---

## 📄 开源协议

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🤝 贡献

欢迎提交Issue和Pull Request！

### 开发指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

---

## 📬 联系方式

- **Twitter/X**: [@Web3Tinkle](https://x.com/Web3Tinkle)
- **GitHub Issues**: [提交Issue](https://github.com/tinkle-community/nofx/issues)

---

## 🙏 致谢

- [Binance API](https://binance-docs.github.io/apidocs/futures/cn/) - 币安合约API
- [DeepSeek](https://platform.deepseek.com/) - DeepSeek AI API
- [Qwen](https://dashscope.aliyuncs.com/) - 阿里云通义千问
- [TA-Lib](https://ta-lib.org/) - 技术指标库
- [Recharts](https://recharts.org/) - React图表库

---

**最后更新**: 2025-10-29 (v2.0.2)

**⚡ 用AI的力量，探索量化交易的可能性！**

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=tinkle-community/nofx&type=Date)](https://star-history.com/#tinkle-community/nofx&Date)
