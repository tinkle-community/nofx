# 🤖 NOFX - AI驱动的币安合约自动交易竞赛系统

[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?style=flat&logo=go)](https://golang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**语言 / Languages:** [English](README.md) | [中文](README.zh-CN.md) | [Українська](README.uk.md) | [Русский](README.ru.md)

---

一个基于 **DeepSeek/Qwen AI** 的币安合约自动交易系统，支持**多AI模型实盘竞赛**，具备完整的市场分析、AI决策、**自我学习机制**和专业的Web监控界面。

> ⚠️ **风险提示**：本系统为实验性项目，AI自动交易存在重大风险，强烈建议仅用于学习研究或小额资金测试！

## 👥 开发者社区

加入我们的Telegram开发者社区，讨论、分享想法并获得支持：

**💬 [NOFX开发者社区](https://t.me/nofx_dev_community)**

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
- **固定杠杆**: 山寨币20倍 | BTC/ETH 50倍
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
├── market/                         # 市场数据与AI决策
│   ├── market_data.go              # 市场数据获取（K线、指标）
│   ├── ai_decision_engine.go       # AI决策引擎（含历史反馈）
│   └── ai_signal.go                # AI API调用（DeepSeek/Qwen）
│
├── pool/                           # 币种池管理
│   └── coin_pool.go                # AI500 + OI Top合并池
│
├── logger/                         # 日志系统
│   └── decision_logger.go          # 决策记录 + 表现分析
│
├── decision_logs/                  # 决策日志存储
│   ├── trader1/                    # Trader 1的日志
│   └── trader2/                    # Trader 2的日志
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

## 🚀 快速开始

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

### 4. 配置系统

创建 `config.json` 文件：

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

**配置说明：**
- `traders`: 可配置1-N个trader（单AI或多AI竞赛）
- `id`: Trader唯一标识（用于日志目录）
- `ai_model`: "qwen" 或 "deepseek"
- `binance_api_key/secret_key`: 每个trader使用独立的币安账户
- `initial_balance`: 初始余额（用于计算盈亏%）
- `scan_interval_minutes`: 决策周期（建议3-5分钟）
- `coin_pool_api_url`: AI500币种池API（可选）
- `oi_top_api_url`: OI Top持仓量API（可选）

### 5. 运行系统

**启动后端（AI交易系统 + API服务器）:**

```bash
go build -o nofx
./nofx
```

**启动前端（Web Dashboard）:**

新开终端窗口：

```bash
cd web
npm run dev
```

**访问界面:**
```
Web Dashboard: http://localhost:3000
API Server: http://localhost:8080
```

### 6. 停止系统

在两个终端中分别按 `Ctrl+C`

---

## 📖 AI决策流程

每个决策周期（默认3分钟），系统按以下流程运行：

```
┌─────────────────────────────────────────────────────┐
│ 1. 分析历史表现（最近20个周期）                        │
├─────────────────────────────────────────────────────┤
│  ✓ 计算整体胜率、平均盈利、盈亏比                      │
│  ✓ 统计各币种表现（胜率、平均盈亏）                    │
│  ✓ 识别最佳/最差币种                                  │
│  ✓ 列出最近5笔交易详情                                │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 2. 获取账户状态                                       │
├─────────────────────────────────────────────────────┤
│  • 账户净值、可用余额                                 │
│  • 持仓数量、总盈亏                                   │
│  • 保证金使用率                                       │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 3. 分析现有持仓（如果有）                             │
├─────────────────────────────────────────────────────┤
│  • 获取每个持仓的市场数据                             │
│  • 计算技术指标（RSI、MACD、EMA）                    │
│  • AI判断是否需要平仓                                 │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 4. 评估新机会（候选币种池）                           │
├─────────────────────────────────────────────────────┤
│  • 获取AI500高评分币种（前20个）                      │
│  • 获取OI Top持仓增长币种（前20个）                    │
│  • 合并去重，过滤低流动性币种（<15M）                 │
│  • 批量获取市场数据和技术指标                          │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 5. AI综合决策                                        │
├─────────────────────────────────────────────────────┤
│  • 查看历史反馈（胜率、最佳/最差币种）                 │
│  • Chain of Thought 思维链分析                       │
│  • 输出决策：平仓/开仓/持有/观望                      │
│  • 包含杠杆、仓位、止损、止盈                          │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 6. 执行交易                                          │
├─────────────────────────────────────────────────────┤
│  • 优先级排序：先平仓，再开仓                          │
│  • 精度自动适配（LOT_SIZE）                           │
│  • 防止仓位叠加（同币种同方向拒绝开仓）                │
│  • 平仓后自动取消所有挂单                             │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│ 7. 记录日志                                          │
├─────────────────────────────────────────────────────┤
│  • 保存完整决策记录到 decision_logs/                 │
│  • 包含思维链、决策JSON、账户快照、执行结果            │
└─────────────────────────────────────────────────────┘
```

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

**最后更新**: 2025-10-29

**⚡ 用AI的力量，探索量化交易的可能性！**
