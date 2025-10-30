package trader

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "strings"
    "sync"
    "sync/atomic"
    "time"

    "nofx/db"
    "nofx/decision"
    "nofx/featureflag"
    "nofx/logger"
    "nofx/market"
    "nofx/mcp"
    "nofx/metrics"
    "nofx/pool"
    "nofx/risk"
)

// TraderFactory allows tests to inject a deterministic trader implementation.
type TraderFactory func(config AutoTraderConfig) (Trader, error)

// AutoTraderConfig 自动交易配置（简化版 - AI全权决策）
type AutoTraderConfig struct {
    // Trader标识
    ID      string // Trader唯一标识（用于日志目录等）
    Name    string // Trader显示名称
    AIModel string // AI模型: "qwen" 或 "deepseek"

    // 交易平台选择
    Exchange string // "binance", "hyperliquid" 或 "aster"

    // 币安API配置
    BinanceAPIKey    string
    BinanceSecretKey string

    // Hyperliquid配置
    HyperliquidPrivateKey string
    HyperliquidTestnet    bool

    // Aster配置
    AsterUser       string // Aster主钱包地址
    AsterSigner     string // Aster API钱包地址
    AsterPrivateKey string // Aster API钱包私钥

    CoinPoolAPIURL string

    // AI配置
    UseQwen     bool
    DeepSeekKey string
    QwenKey     string

    // 自定义AI API配置
    CustomAPIURL    string
    CustomAPIKey    string
    CustomModelName string

    // 扫描配置
    ScanInterval time.Duration // 扫描间隔（建议3分钟）

    // 账户配置
    InitialBalance float64 // 初始金额（用于计算盈亏，需手动设置）

    // 杠杆配置
    BTCETHLeverage  int // BTC和ETH的杠杆倍数
    AltcoinLeverage int // 山寨币的杠杆倍数

    // 风险控制（仅作为提示，AI可自主决定）
    MaxDailyLoss    float64       // 最大日亏损百分比（提示）
    MaxDrawdown     float64       // 最大回撤百分比（提示）
    StopTradingTime time.Duration // 触发风控后暂停时长

    FeatureFlags  *featureflag.RuntimeFlags `json:"-"`
    TraderFactory TraderFactory             `json:"-"`
}

// AutoTrader 自动交易器
type AutoTrader struct {
    id                    string // Trader唯一标识
    name                  string // Trader显示名称
    aiModel               string // AI模型名称
    exchange              string // 交易平台名称
    config                AutoTraderConfig
    trader                Trader                 // 使用Trader接口（支持多平台）
    decisionLogger        *logger.DecisionLogger // 决策日志记录器
    riskEngine            *risk.Engine
    riskStore             *risk.Store
    featureFlags          *featureflag.RuntimeFlags
    persistStore          *db.RiskStore
    stateMu               sync.RWMutex
    mutexEnabledCache     atomic.Bool
    mutexDisabledCache    atomic.Bool
    initialBalance        float64
    dailyPnL              float64
    currentBalance        float64
    peakBalance           float64
    lastResetTime         time.Time
    stopUntil             time.Time
    isRunning             bool
    startTime             time.Time        // 系统启动时间
    callCount             int              // AI调用次数
    positionFirstSeenTime map[string]int64 // 持仓首次出现时间 (symbol_side -> timestamp毫秒)
    persistenceCloseOnce  sync.Once
}

// NewAutoTrader 创建自动交易器
func NewAutoTrader(config AutoTraderConfig, store *risk.Store, flags *featureflag.RuntimeFlags) (*AutoTrader, error) {
    // 设置默认值
    if config.ID == "" {
        config.ID = "default_trader"
    }
    if config.Name == "" {
        config.Name = "Default Trader"
    }
    if config.AIModel == "" {
        if config.UseQwen {
            config.AIModel = "qwen"
        } else {
            config.AIModel = "deepseek"
        }
    }

    // 初始化AI
    if config.AIModel == "custom" {
        // 使用自定义API
        mcp.SetCustomAPI(config.CustomAPIURL, config.CustomAPIKey, config.CustomModelName)
        log.Printf("🤖 [%s] 使用自定义AI API: %s (模型: %s)", config.Name, config.CustomAPIURL, config.CustomModelName)
    } else if config.UseQwen || config.AIModel == "qwen" {
        // 使用Qwen
        mcp.SetQwenAPIKey(config.QwenKey, "")
        log.Printf("🤖 [%s] 使用阿里云Qwen AI", config.Name)
    } else {
        // 默认使用DeepSeek
        mcp.SetDeepSeekAPIKey(config.DeepSeekKey)
        log.Printf("🤖 [%s] 使用DeepSeek AI", config.Name)
    }

    // 初始化币种池API
    if config.CoinPoolAPIURL != "" {
        pool.SetCoinPoolAPI(config.CoinPoolAPIURL)
    }

    // 设置默认交易平台
    if config.Exchange == "" {
        config.Exchange = "binance"
    }

    // 根据配置创建对应的交易器
    var (
        traderInstance Trader
        err            error
    )

    if config.TraderFactory != nil {
        traderInstance, err = config.TraderFactory(config)
        if err != nil {
            return nil, fmt.Errorf("初始化自定义交易器失败: %w", err)
        }
        log.Printf("🏦 [%s] 使用自定义Trader工厂", config.Name)
    } else {
        switch config.Exchange {
        case "binance":
            log.Printf("🏦 [%s] 使用币安合约交易", config.Name)
            traderInstance = NewFuturesTrader(config.BinanceAPIKey, config.BinanceSecretKey)
        case "hyperliquid":
            log.Printf("🏦 [%s] 使用Hyperliquid交易", config.Name)
            traderInstance, err = NewHyperliquidTrader(config.HyperliquidPrivateKey, config.HyperliquidTestnet)
            if err != nil {
                return nil, fmt.Errorf("初始化Hyperliquid交易器失败: %w", err)
            }
        case "aster":
            log.Printf("🏦 [%s] 使用Aster交易", config.Name)
            traderInstance, err = NewAsterTrader(config.AsterUser, config.AsterSigner, config.AsterPrivateKey)
            if err != nil {
                return nil, fmt.Errorf("初始化Aster交易器失败: %w", err)
            }
        default:
            return nil, fmt.Errorf("不支持的交易平台: %s", config.Exchange)
        }
    }

    // 验证初始金额配置
    if config.InitialBalance <= 0 {
        return nil, fmt.Errorf("初始金额必须大于0，请在配置中设置InitialBalance")
    }

    // 初始化决策日志记录器（使用trader ID创建独立目录）
    logDir := fmt.Sprintf("decision_logs/%s", config.ID)
    decisionLogger := logger.NewDecisionLogger(logDir)

    if config.FeatureFlags != nil {
        flags = config.FeatureFlags
    }
    if store == nil {
        store = risk.NewStore()
    }
    if flags == nil {
        flags = featureflag.NewRuntimeFlags(featureflag.DefaultState())
    }
    config.FeatureFlags = flags

    maxDailyLossAbs := 0.0
    if config.InitialBalance > 0 && config.MaxDailyLoss > 0 {
        maxDailyLossAbs = config.InitialBalance * config.MaxDailyLoss / 100
    }

    stopMinutes := int(config.StopTradingTime / time.Minute)
    if stopMinutes <= 0 && config.StopTradingTime > 0 {
        stopMinutes = 1
    }

    riskLimits := risk.Limits{
        MaxDailyLoss:       maxDailyLossAbs,
        MaxDrawdown:        config.MaxDrawdown,
        StopTradingMinutes: stopMinutes,
    }
    riskEngine := risk.NewEngineWithContext(config.ID, config.InitialBalance, riskLimits, store, flags)
    riskEngine.RecordEquity(config.InitialBalance)
    snapshot := riskEngine.Snapshot()
    lastReset := snapshot.LastReset
    if lastReset.IsZero() {
        lastReset = time.Now()
    }

    at := &AutoTrader{
        id:                    config.ID,
        name:                  config.Name,
        aiModel:               config.AIModel,
        exchange:              config.Exchange,
        config:                config,
        trader:                traderInstance,
        decisionLogger:        decisionLogger,
        riskEngine:            riskEngine,
        riskStore:             store,
        featureFlags:          flags,
        initialBalance:        config.InitialBalance,
        startTime:             time.Now(),
        positionFirstSeenTime: make(map[string]int64),
    }

    at.refreshMutexProtectionCache()
    at.setDailyPnL(snapshot.DailyPnL)
    at.SetLastResetTime(lastReset)
    at.SetStopUntil(snapshot.PausedUntil)
    at.SetTrading(false)

    return at, nil
}

// NewAutoTraderWithPersistence creates an AutoTrader with database persistence
// enabled. When enable_persistence is true, the trader restores risk state from
// the database and hooks persistence callbacks. Database failures are logged but
// never fatal, preserving the trading loop's reliability.
func NewAutoTraderWithPersistence(cfg AutoTraderConfig, dbPath string, flags *featureflag.RuntimeFlags) (*AutoTrader, error) {
    runtimeFlags := flags
    if cfg.FeatureFlags != nil {
        runtimeFlags = cfg.FeatureFlags
    }
    if runtimeFlags == nil {
        runtimeFlags = featureflag.NewRuntimeFlags(featureflag.DefaultState())
    }

    usePersistence := runtimeFlags.PersistenceEnabled() && strings.TrimSpace(dbPath) != ""

    var store *risk.Store
    if usePersistence {
        store = risk.NewStore()
    }

    at, err := NewAutoTrader(cfg, store, runtimeFlags)
    if err != nil {
        return nil, err
    }

    if !usePersistence {
        log.Printf("🔧 [%s] Persistence disabled; running in-memory only", cfg.Name)
        return at, nil
    }

    persistStore, err := db.NewRiskStore(dbPath)
    if err != nil {
        log.Printf("⚠️  [%s] Failed to initialize persistence: %v; proceeding without it", cfg.Name, err)
        return at, nil
    }

    persistStore.BindTrader(cfg.ID)
    at.persistStore = persistStore

    persistFunc := func(traderID string, snapshot risk.Snapshot) error {
        if at.persistStore == nil {
            return nil
        }
        state := &db.RiskState{
            TraderID:      traderID,
            DailyPnL:      snapshot.DailyPnL,
            DrawdownPct:   snapshot.DrawdownPct,
            CurrentEquity: snapshot.CurrentEquity,
            PeakEquity:    snapshot.PeakEquity,
            TradingPaused: snapshot.TradingPaused,
            PausedUntil:   snapshot.PausedUntil,
            LastResetTime: snapshot.LastReset,
            UpdatedAt:     time.Now(),
        }
        return at.persistStore.Save(state, "", "risk_snapshot")
    }

    if at.riskStore != nil {
        at.riskStore.SetPersistFunc(persistFunc)
    }

    if state, err := persistStore.Load(); err != nil {
        log.Printf("⚠️  [%s] Failed to load persisted risk state: %v", cfg.Name, err)
    } else if state != nil {
        at.restorePersistedState(state)
        persistFunc(at.id, at.riskEngine.Snapshot())
    }

    return at, nil
}

func (at *AutoTrader) restorePersistedState(state *db.RiskState) {
    if state == nil || at.riskEngine == nil {
        return
    }

    snapshot := at.riskEngine.Snapshot()
    delta := state.DailyPnL - snapshot.DailyPnL
    if delta != 0 {
        at.riskEngine.UpdateDailyPnL(delta)
    }

    if state.PeakEquity > 0 {
        at.riskEngine.RecordEquity(state.PeakEquity)
    }
    if state.CurrentEquity > 0 {
        at.riskEngine.RecordEquity(state.CurrentEquity)
    }

    at.setDailyPnL(state.DailyPnL)
    if !state.LastResetTime.IsZero() {
        at.SetLastResetTime(state.LastResetTime)
    }
    at.SetStopUntil(state.PausedUntil)
    at.setPeakBalance(state.PeakEquity)
    at.setCurrentBalance(state.CurrentEquity)

    if state.TradingPaused {
        at.riskStore.SetTradingPaused(at.id, true, state.PausedUntil, at.featureFlags)
    }

    if state.TradingPaused && !state.PausedUntil.IsZero() && time.Now().Before(state.PausedUntil) {
        log.Printf("⏸  [%s] Trading paused until %s due to restored risk state", at.name, state.PausedUntil.Format(time.RFC3339))
    }
}

// ClosePersistence gracefully shuts down the persistence worker. Must be called
// during graceful shutdown to drain pending writes.
func (at *AutoTrader) ClosePersistence() {
    at.persistenceCloseOnce.Do(func() {
        if at.persistStore == nil {
            return
        }

        closeCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
        defer cancel()

        if err := at.persistStore.Close(closeCtx); err != nil {
            log.Printf("⚠️  [%s] risk persistence close error: %v", at.name, err)
        }
    })
}

// Run 运行自动交易主循环
func (at *AutoTrader) Run() error {
    defer at.ClosePersistence()
    at.SetTrading(true)
    log.Println("🚀 AI驱动自动交易系统启动")
    log.Printf("💰 初始余额: %.2f USDT", at.initialBalance)
    log.Printf("⚙️  扫描间隔: %v", at.config.ScanInterval)
    log.Println("🤖 AI将全权决定杠杆、仓位大小、止损止盈等参数")

    ticker := time.NewTicker(at.config.ScanInterval)
    defer ticker.Stop()

    // 首次立即执行
    if err := at.runCycle(); err != nil {
        log.Printf("❌ 执行失败: %v", err)
    }

    for at.IsTrading() {
        select {
        case <-ticker.C:
            if err := at.runCycle(); err != nil {
                log.Printf("❌ 执行失败: %v", err)
            }
        }
    }

    return nil
}

// Stop 停止自动交易
func (at *AutoTrader) Stop() {
    at.SetTrading(false)
    log.Println("⏹ 自动交易系统停止")
}

// runCycle 运行一个交易周期（使用AI全权决策）
func (at *AutoTrader) runCycle() error {
    at.callCount++

    log.Print("\n" + strings.Repeat("=", 70))
    log.Printf("⏰ %s - AI决策周期 #%d", time.Now().Format("2006-01-02 15:04:05"), at.callCount)
    log.Print(strings.Repeat("=", 70))

    // 创建决策记录
    record := &logger.DecisionRecord{
        ExecutionLog: []string{},
        Success:      true,
    }

    now := time.Now()
    if at.riskEngine != nil {
        paused, until := at.riskEngine.TradingStatus()
        at.SetStopUntil(until)
        if paused {
            remaining := time.Duration(0)
            if !until.IsZero() {
                remaining = until.Sub(now)
                if remaining < 0 {
                    remaining = 0
                }
            }
            log.Printf("⏸ 风险控制：暂停交易中，剩余 %.0f 分钟", remaining.Minutes())
            record.Success = false
            if !until.IsZero() {
                record.ErrorMessage = fmt.Sprintf("风险控制暂停中，剩余 %.0f 分钟", remaining.Minutes())
            } else {
                record.ErrorMessage = "风险控制暂停中"
            }
            at.decisionLogger.LogDecision(record)
            return nil
        }

        if at.riskEngine.ResetDailyPnLIfNeeded() {
            at.ResetDailyPnL(now)
            log.Println("📅 日盈亏已重置")
        }
    }

    // 3. 收集交易上下文
    ctx, err := at.buildTradingContext()
    if err != nil {
        record.Success = false
        record.ErrorMessage = fmt.Sprintf("构建交易上下文失败: %v", err)
        at.decisionLogger.LogDecision(record)
        return fmt.Errorf("构建交易上下文失败: %w", err)
    }

    // 保存账户状态快照
    record.AccountState = logger.AccountSnapshot{
        TotalBalance:          ctx.Account.TotalEquity,
        AvailableBalance:      ctx.Account.AvailableBalance,
        TotalUnrealizedProfit: ctx.Account.TotalPnL,
        PositionCount:         ctx.Account.PositionCount,
        MarginUsedPct:         ctx.Account.MarginUsedPct,
    }

    // 保存持仓快照
    for _, pos := range ctx.Positions {
        record.Positions = append(record.Positions, logger.PositionSnapshot{
            Symbol:           pos.Symbol,
            Side:             pos.Side,
            PositionAmt:      pos.Quantity,
            EntryPrice:       pos.EntryPrice,
            MarkPrice:        pos.MarkPrice,
            UnrealizedProfit: pos.UnrealizedPnL,
            Leverage:         float64(pos.Leverage),
            LiquidationPrice: pos.LiquidationPrice,
        })
    }

    // 保存候选币种列表
    for _, coin := range ctx.CandidateCoins {
        record.CandidateCoins = append(record.CandidateCoins, coin.Symbol)
    }

    log.Printf("📊 账户净值: %.2f USDT | 可用: %.2f USDT | 持仓: %d",
        ctx.Account.TotalEquity, ctx.Account.AvailableBalance, ctx.Account.PositionCount)

    at.setCurrentBalance(ctx.Account.TotalEquity)
    if ctx.Account.TotalEquity > at.peakBalanceSnapshot() {
        at.setPeakBalance(ctx.Account.TotalEquity)
    }

    canTrade, reason := at.CanTrade()
    if !canTrade {
        if reason == "" {
            reason = "风险控制暂停中"
        }
        log.Printf("⏸ 风险控制触发：%s", reason)
        record.Success = false
        record.ErrorMessage = reason
        at.decisionLogger.LogDecision(record)
        return nil
    }

    // 4. 调用AI获取完整决策
    log.Println("🤖 正在请求AI分析并决策...")
    decision, err := decision.GetFullDecision(ctx)

    // 即使有错误，也保存思维链、决策和输入prompt（用于debug）
    if decision != nil {
        record.InputPrompt = decision.UserPrompt
        record.CoTTrace = decision.CoTTrace
        if len(decision.Decisions) > 0 {
            decisionJSON, _ := json.MarshalIndent(decision.Decisions, "", "  ")
            record.DecisionJSON = string(decisionJSON)
        }
    }

    if err != nil {
        record.Success = false
        record.ErrorMessage = fmt.Sprintf("获取AI决策失败: %v", err)

        // 打印AI思维链（即使有错误）
        if decision != nil && decision.CoTTrace != "" {
            log.Print("\n" + strings.Repeat("-", 70))
            log.Println("💭 AI思维链分析（错误情况）:")
            log.Println(strings.Repeat("-", 70))
            log.Println(decision.CoTTrace)
            log.Print(strings.Repeat("-", 70) + "\n")
        }

        at.decisionLogger.LogDecision(record)
        return fmt.Errorf("获取AI决策失败: %w", err)
    }

    // 5. 打印AI思维链
    log.Print("\n" + strings.Repeat("-", 70))
    log.Println("💭 AI思维链分析:")
    log.Println(strings.Repeat("-", 70))
    log.Println(decision.CoTTrace)
    log.Print(strings.Repeat("-", 70) + "\n")

    // 6. 打印AI决策
    log.Printf("📋 AI决策列表 (%d 个):\n", len(decision.Decisions))
    for i, d := range decision.Decisions {
        log.Printf("  [%d] %s: %s - %s", i+1, d.Symbol, d.Action, d.Reasoning)
        if d.Action == "open_long" || d.Action == "open_short" {
            log.Printf("      杠杆: %dx | 仓位: %.2f USDT | 止损: %.4f | 止盈: %.4f",
                d.Leverage, d.PositionSizeUSD, d.StopLoss, d.TakeProfit)
        }
    }
    log.Println()

    // 7. 对决策排序：确保先平仓后开仓（防止仓位叠加超限）
    sortedDecisions := sortDecisionsByPriority(decision.Decisions)

    log.Println("🔄 执行顺序（已优化）: 先平仓→后开仓")
    for i, d := range sortedDecisions {
        log.Printf("  [%d] %s %s", i+1, d.Symbol, d.Action)
    }
    log.Println()

    // 执行决策并记录结果
    for _, d := range sortedDecisions {
        actionRecord := logger.DecisionAction{
            Action:    d.Action,
            Symbol:    d.Symbol,
            Quantity:  0,
            Leverage:  d.Leverage,
            Price:     0,
            Timestamp: time.Now(),
            Success:   false,
        }

        if err := at.executeDecisionWithRecord(&d, &actionRecord); err != nil {
            log.Printf("❌ 执行决策失败 (%s %s): %v", d.Symbol, d.Action, err)
            actionRecord.Error = err.Error()
            record.ExecutionLog = append(record.ExecutionLog, fmt.Sprintf("❌ %s %s 失败: %v", d.Symbol, d.Action, err))
        } else {
            actionRecord.Success = true
            record.ExecutionLog = append(record.ExecutionLog, fmt.Sprintf("✓ %s %s 成功", d.Symbol, d.Action))
            // 成功执行后短暂延迟
            time.Sleep(1 * time.Second)
        }

        record.Decisions = append(record.Decisions, actionRecord)
    }

    // 8. 保存决策记录
    if err := at.decisionLogger.LogDecision(record); err != nil {
        log.Printf("⚠ 保存决策记录失败: %v", err)
    }

    return nil
}

// buildTradingContext 构建交易上下文
func (at *AutoTrader) buildTradingContext() (*decision.Context, error) {
    // 1. 获取账户信息
    balance, err := at.trader.GetBalance()
    if err != nil {
        return nil, fmt.Errorf("获取账户余额失败: %w", err)
    }

    // 获取账户字段
    totalWalletBalance := 0.0
    totalUnrealizedProfit := 0.0
    availableBalance := 0.0

    if wallet, ok := balance["totalWalletBalance"].(float64); ok {
        totalWalletBalance = wallet
    }
    if unrealized, ok := balance["totalUnrealizedProfit"].(float64); ok {
        totalUnrealizedProfit = unrealized
    }
    if avail, ok := balance["availableBalance"].(float64); ok {
        availableBalance = avail
    }

    // Total Equity = 钱包余额 + 未实现盈亏
    totalEquity := totalWalletBalance + totalUnrealizedProfit

    // 2. 获取持仓信息
    positions, err := at.trader.GetPositions()
    if err != nil {
        return nil, fmt.Errorf("获取持仓失败: %w", err)
    }

    var positionInfos []decision.PositionInfo
    totalMarginUsed := 0.0

    // 当前持仓的key集合（用于清理已平仓的记录）
    currentPositionKeys := make(map[string]bool)

    for _, pos := range positions {
        symbol := pos["symbol"].(string)
        side := pos["side"].(string)
        entryPrice := pos["entryPrice"].(float64)
        markPrice := pos["markPrice"].(float64)
        quantity := pos["positionAmt"].(float64)
        if quantity < 0 {
            quantity = -quantity // 空仓数量为负，转为正数
        }
        unrealizedPnl := pos["unRealizedProfit"].(float64)
        liquidationPrice := pos["liquidationPrice"].(float64)

        // 计算盈亏百分比
        pnlPct := 0.0
        if side == "long" {
            pnlPct = ((markPrice - entryPrice) / entryPrice) * 100
        } else {
            pnlPct = ((entryPrice - markPrice) / entryPrice) * 100
        }

        // 计算占用保证金（估算）
        leverage := 10 // 默认值，实际应该从持仓信息获取
        if lev, ok := pos["leverage"].(float64); ok {
            leverage = int(lev)
        }
        marginUsed := (quantity * markPrice) / float64(leverage)
        totalMarginUsed += marginUsed

        // 跟踪持仓首次出现时间
        posKey := symbol + "_" + side
        currentPositionKeys[posKey] = true
        if _, exists := at.positionFirstSeenTime[posKey]; !exists {
            // 新持仓，记录当前时间
            at.positionFirstSeenTime[posKey] = time.Now().UnixMilli()
        }
        updateTime := at.positionFirstSeenTime[posKey]

        positionInfos = append(positionInfos, decision.PositionInfo{
            Symbol:           symbol,
            Side:             side,
            EntryPrice:       entryPrice,
            MarkPrice:        markPrice,
            Quantity:         quantity,
            Leverage:         leverage,
            UnrealizedPnL:    unrealizedPnl,
            UnrealizedPnLPct: pnlPct,
            LiquidationPrice: liquidationPrice,
            MarginUsed:       marginUsed,
            UpdateTime:       updateTime,
        })
    }

    // 清理已平仓的持仓记录
    for key := range at.positionFirstSeenTime {
        if !currentPositionKeys[key] {
            delete(at.positionFirstSeenTime, key)
        }
    }

    // 3. 获取合并的候选币种池（AI500 + OI Top，去重）
    // 无论有没有持仓，都分析相同数量的币种（让AI看到所有好机会）
    // AI会根据保证金使用率和现有持仓情况，自己决定是否要换仓
    const ai500Limit = 20 // AI500取前20个评分最高的币种

    // 获取合并后的币种池（AI500 + OI Top）
    mergedPool, err := pool.GetMergedCoinPool(ai500Limit)
    if err != nil {
        return nil, fmt.Errorf("获取合并币种池失败: %w", err)
    }

    // 构建候选币种列表（包含来源信息）
    var candidateCoins []decision.CandidateCoin
    for _, symbol := range mergedPool.AllSymbols {
        sources := mergedPool.SymbolSources[symbol]
        candidateCoins = append(candidateCoins, decision.CandidateCoin{
            Symbol:  symbol,
            Sources: sources, // "ai500" 和/或 "oi_top"
        })
    }

    log.Printf("📋 合并币种池: AI500前%d + OI_Top20 = 总计%d个候选币种",
        ai500Limit, len(candidateCoins))

    // 4. 计算总盈亏
    totalPnL := totalEquity - at.initialBalance
    totalPnLPct := 0.0
    if at.initialBalance > 0 {
        totalPnLPct = (totalPnL / at.initialBalance) * 100
    }

    marginUsedPct := 0.0
    if totalEquity > 0 {
        marginUsedPct = (totalMarginUsed / totalEquity) * 100
    }

    // 5. 分析历史表现（最近20个周期）
    performance, err := at.decisionLogger.AnalyzePerformance(20)
    if err != nil {
        log.Printf("⚠️  分析历史表现失败: %v", err)
        // 不影响主流程，继续执行（但设置performance为nil以避免传递错误数据）
        performance = nil
    }

    // 6. 构建上下文
    ctx := &decision.Context{
        CurrentTime:     time.Now().Format("2006-01-02 15:04:05"),
        RuntimeMinutes:  int(time.Since(at.startTime).Minutes()),
        CallCount:       at.callCount,
        BTCETHLeverage:  at.config.BTCETHLeverage,  // 使用配置的杠杆倍数
        AltcoinLeverage: at.config.AltcoinLeverage, // 使用配置的杠杆倍数
        Account: decision.AccountInfo{
            TotalEquity:      totalEquity,
            AvailableBalance: availableBalance,
            TotalPnL:         totalPnL,
            TotalPnLPct:      totalPnLPct,
            MarginUsed:       totalMarginUsed,
            MarginUsedPct:    marginUsedPct,
            PositionCount:    len(positionInfos),
        },
        Positions:      positionInfos,
        CandidateCoins: candidateCoins,
        Performance:    performance, // 添加历史表现分析
    }

    return ctx, nil
}

// executeDecisionWithRecord 执行AI决策并记录详细信息
func (at *AutoTrader) executeDecisionWithRecord(decision *decision.Decision, actionRecord *logger.DecisionAction) error {
    switch decision.Action {
    case "open_long":
        return at.executeOpenLongWithRecord(decision, actionRecord)
    case "open_short":
        return at.executeOpenShortWithRecord(decision, actionRecord)
    case "close_long":
        return at.executeCloseLongWithRecord(decision, actionRecord)
    case "close_short":
        return at.executeCloseShortWithRecord(decision, actionRecord)
    case "hold", "wait":
        // 无需执行，仅记录
        return nil
    default:
        return fmt.Errorf("未知的action: %s", decision.Action)
    }
}

func (at *AutoTrader) openPositionWithProtection(decision *decision.Decision, quantity float64) (map[string]interface{}, error) {
    if decision == nil {
        return nil, fmt.Errorf("decision cannot be nil")
    }

    var (
        openFn func(string, float64, int) (map[string]interface{}, error)
        side   string
    )

    switch decision.Action {
    case "open_long":
        openFn = at.trader.OpenLong
        side = "LONG"
    case "open_short":
        openFn = at.trader.OpenShort
        side = "SHORT"
    default:
        return nil, fmt.Errorf("unsupported action %s for openPositionWithProtection", decision.Action)
    }

    guardEnabled := at.featureFlags != nil && at.featureFlags.GuardedStopLossEnabled()

    if !guardEnabled {
        order, err := openFn(decision.Symbol, quantity, decision.Leverage)
        if err != nil {
            return nil, err
        }
        if err := at.trader.SetStopLoss(decision.Symbol, side, quantity, decision.StopLoss); err != nil {
            log.Printf("  ⚠ 设置止损失败: %v", err)
            metrics.IncRiskStopLossFailures(at.id)
        }
        if decision.TakeProfit > 0 {
            if err := at.trader.SetTakeProfit(decision.Symbol, side, quantity, decision.TakeProfit); err != nil {
                log.Printf("  ⚠ 设置止盈失败: %v", err)
            }
        }
        return order, nil
    }

    if decision.StopLoss <= 0 {
        metrics.IncRiskStopLossFailures(at.id)
        log.Printf("CRITICAL: Position opening blocked - missing stop-loss for %s", decision.Symbol)
        return nil, fmt.Errorf("guarded stop-loss enforcement requires stop-loss for %s", decision.Symbol)
    }

    if err := at.trader.SetStopLoss(decision.Symbol, side, quantity, decision.StopLoss); err != nil {
        log.Printf("  ⚠ 设置止损失败: %v", err)
        metrics.IncRiskStopLossFailures(at.id)
        log.Printf("CRITICAL: Position opening blocked - stop-loss placement failed for %s: %v", decision.Symbol, err)
        return nil, fmt.Errorf("stop-loss placement failed: %w", err)
    }

    if decision.TakeProfit > 0 {
        if err := at.trader.SetTakeProfit(decision.Symbol, side, quantity, decision.TakeProfit); err != nil {
            log.Printf("  ⚠ 设置止盈失败: %v", err)
        }
    }

    order, err := openFn(decision.Symbol, quantity, decision.Leverage)
    if err != nil {
        log.Printf("  ⚠ 开仓失败，撤销预设保护: %v", err)
        // Roll back the pre-set protective orders so we do not leave orphan stops on the exchange.
        if cancelErr := at.trader.CancelAllOrders(decision.Symbol); cancelErr != nil {
            log.Printf("  ⚠ 撤销预设订单失败: %v", cancelErr)
        }
        return nil, err
    }

    return order, nil
}

// executeOpenLongWithRecord 执行开多仓并记录详细信息
func (at *AutoTrader) executeOpenLongWithRecord(decision *decision.Decision, actionRecord *logger.DecisionAction) error {
    log.Printf("  📈 开多仓: %s", decision.Symbol)

    // ⚠️ 关键：检查是否已有同币种同方向持仓，如果有则拒绝开仓（防止仓位叠加超限）
    positions, err := at.trader.GetPositions()
    if err == nil {
        for _, pos := range positions {
            if pos["symbol"] == decision.Symbol && pos["side"] == "long" {
                return fmt.Errorf("❌ %s 已有多仓，拒绝开仓以防止仓位叠加超限。如需换仓，请先给出 close_long 决策", decision.Symbol)
            }
        }
    }

    // 获取当前价格
    marketData, err := market.Get(decision.Symbol)
    if err != nil {
        return err
    }

    // 计算数量
    quantity := decision.PositionSizeUSD / marketData.CurrentPrice
    actionRecord.Quantity = quantity
    actionRecord.Price = marketData.CurrentPrice

    // 开仓并根据特性开关预设保护单
    order, err := at.openPositionWithProtection(decision, quantity)
    if err != nil {
        return err
    }

    // 记录订单ID
    if orderID, ok := order["orderId"].(int64); ok {
        actionRecord.OrderID = orderID
    }

    log.Printf("  ✓ 开仓成功，订单ID: %v, 数量: %.4f", order["orderId"], quantity)

    // 记录开仓时间
    posKey := decision.Symbol + "_long"
    at.positionFirstSeenTime[posKey] = time.Now().UnixMilli()

    return nil
}

// executeOpenShortWithRecord 执行开空仓并记录详细信息
func (at *AutoTrader) executeOpenShortWithRecord(decision *decision.Decision, actionRecord *logger.DecisionAction) error {
    log.Printf("  📉 开空仓: %s", decision.Symbol)

    // ⚠️ 关键：检查是否已有同币种同方向持仓，如果有则拒绝开仓（防止仓位叠加超限）
    positions, err := at.trader.GetPositions()
    if err == nil {
        for _, pos := range positions {
            if pos["symbol"] == decision.Symbol && pos["side"] == "short" {
                return fmt.Errorf("❌ %s 已有空仓，拒绝开仓以防止仓位叠加超限。如需换仓，请先给出 close_short 决策", decision.Symbol)
            }
        }
    }

    // 获取当前价格
    marketData, err := market.Get(decision.Symbol)
    if err != nil {
        return err
    }

    // 计算数量
    quantity := decision.PositionSizeUSD / marketData.CurrentPrice
    actionRecord.Quantity = quantity
    actionRecord.Price = marketData.CurrentPrice

    // 开仓并根据特性开关预设保护单
    order, err := at.openPositionWithProtection(decision, quantity)
    if err != nil {
        return err
    }

    // 记录订单ID
    if orderID, ok := order["orderId"].(int64); ok {
        actionRecord.OrderID = orderID
    }

    log.Printf("  ✓ 开仓成功，订单ID: %v, 数量: %.4f", order["orderId"], quantity)

    // 记录开仓时间
    posKey := decision.Symbol + "_short"
    at.positionFirstSeenTime[posKey] = time.Now().UnixMilli()

    return nil
}

// executeCloseLongWithRecord 执行平多仓并记录详细信息
func (at *AutoTrader) executeCloseLongWithRecord(decision *decision.Decision, actionRecord *logger.DecisionAction) error {
    log.Printf("  🔄 平多仓: %s", decision.Symbol)

    // 获取当前价格
    marketData, err := market.Get(decision.Symbol)
    if err != nil {
        return err
    }
    actionRecord.Price = marketData.CurrentPrice

    // 平仓
    order, err := at.trader.CloseLong(decision.Symbol, 0) // 0 = 全部平仓
    if err != nil {
        return err
    }

    // 记录订单ID
    if orderID, ok := order["orderId"].(int64); ok {
        actionRecord.OrderID = orderID
    }

    log.Printf("  ✓ 平仓成功")
    return nil
}

// executeCloseShortWithRecord 执行平空仓并记录详细信息
func (at *AutoTrader) executeCloseShortWithRecord(decision *decision.Decision, actionRecord *logger.DecisionAction) error {
    log.Printf("  🔄 平空仓: %s", decision.Symbol)

    // 获取当前价格
    marketData, err := market.Get(decision.Symbol)
    if err != nil {
        return err
    }
    actionRecord.Price = marketData.CurrentPrice

    // 平仓
    order, err := at.trader.CloseShort(decision.Symbol, 0) // 0 = 全部平仓
    if err != nil {
        return err
    }

    // 记录订单ID
    if orderID, ok := order["orderId"].(int64); ok {
        actionRecord.OrderID = orderID
    }

    log.Printf("  ✓ 平仓成功")
    return nil
}

// GetID 获取trader ID
func (at *AutoTrader) GetID() string {
    return at.id
}

// GetName 获取trader名称
func (at *AutoTrader) GetName() string {
    return at.name
}

// GetAIModel 获取AI模型
func (at *AutoTrader) GetAIModel() string {
    return at.aiModel
}

// GetDecisionLogger 获取决策日志记录器
func (at *AutoTrader) GetDecisionLogger() *logger.DecisionLogger {
    return at.decisionLogger
}

// GetStatus 获取系统状态（用于API）
func (at *AutoTrader) GetStatus() map[string]interface{} {
    aiProvider := "DeepSeek"
    if at.config.UseQwen {
        aiProvider = "Qwen"
    }

    stopUntil := at.GetStopUntil()
    lastReset := at.GetLastResetTime()

    return map[string]interface{}{
        "trader_id":       at.id,
        "trader_name":     at.name,
        "ai_model":        at.aiModel,
        "exchange":        at.exchange,
        "is_running":      at.IsTrading(),
        "start_time":      at.startTime.Format(time.RFC3339),
        "runtime_minutes": int(time.Since(at.startTime).Minutes()),
        "call_count":      at.callCount,
        "initial_balance": at.initialBalance,
        "scan_interval":   at.config.ScanInterval.String(),
        "stop_until":      stopUntil.Format(time.RFC3339),
        "last_reset_time": lastReset.Format(time.RFC3339),
        "ai_provider":     aiProvider,
    }
}

// GetAccountInfo 获取账户信息（用于API）
func (at *AutoTrader) GetAccountInfo() (map[string]interface{}, error) {
    balance, err := at.trader.GetBalance()
    if err != nil {
        return nil, fmt.Errorf("获取余额失败: %w", err)
    }

    // 获取账户字段
    totalWalletBalance := 0.0
    totalUnrealizedProfit := 0.0
    availableBalance := 0.0

    if wallet, ok := balance["totalWalletBalance"].(float64); ok {
        totalWalletBalance = wallet
    }
    if unrealized, ok := balance["totalUnrealizedProfit"].(float64); ok {
        totalUnrealizedProfit = unrealized
    }
    if avail, ok := balance["availableBalance"].(float64); ok {
        availableBalance = avail
    }

    // Total Equity = 钱包余额 + 未实现盈亏
    totalEquity := totalWalletBalance + totalUnrealizedProfit

    // 获取持仓计算总保证金
    positions, err := at.trader.GetPositions()
    if err != nil {
        return nil, fmt.Errorf("获取持仓失败: %w", err)
    }

    totalMarginUsed := 0.0
    totalUnrealizedPnL := 0.0
    for _, pos := range positions {
        markPrice := pos["markPrice"].(float64)
        quantity := pos["positionAmt"].(float64)
        if quantity < 0 {
            quantity = -quantity
        }
        unrealizedPnl := pos["unRealizedProfit"].(float64)
        totalUnrealizedPnL += unrealizedPnl

        leverage := 10
        if lev, ok := pos["leverage"].(float64); ok {
            leverage = int(lev)
        }
        marginUsed := (quantity * markPrice) / float64(leverage)
        totalMarginUsed += marginUsed
    }

    totalPnL := totalEquity - at.initialBalance
    totalPnLPct := 0.0
    if at.initialBalance > 0 {
        totalPnLPct = (totalPnL / at.initialBalance) * 100
    }

    marginUsedPct := 0.0
    if totalEquity > 0 {
        marginUsedPct = (totalMarginUsed / totalEquity) * 100
    }

    dailyPnL := at.GetDailyPnL()

    return map[string]interface{}{
        // 核心字段
        "total_equity":      totalEquity,           // 账户净值 = wallet + unrealized
        "wallet_balance":    totalWalletBalance,    // 钱包余额（不含未实现盈亏）
        "unrealized_profit": totalUnrealizedProfit, // 未实现盈亏（从API）
        "available_balance": availableBalance,      // 可用余额

        // 盈亏统计
        "total_pnl":            totalPnL,           // 总盈亏 = equity - initial
        "total_pnl_pct":        totalPnLPct,        // 总盈亏百分比
        "total_unrealized_pnl": totalUnrealizedPnL, // 未实现盈亏（从持仓计算）
        "initial_balance":      at.initialBalance,  // 初始余额
        "daily_pnl":            dailyPnL,           // 日盈亏

        // 持仓信息
        "position_count":  len(positions),  // 持仓数量
        "margin_used":     totalMarginUsed, // 保证金占用
        "margin_used_pct": marginUsedPct,   // 保证金使用率
    }, nil
}

func (at *AutoTrader) refreshMutexProtectionCache() bool {
    if at == nil {
        return false
    }

    enabled := false
    if at.featureFlags != nil {
        enabled = at.featureFlags.MutexProtectionEnabled()
    }

    at.mutexEnabledCache.Store(enabled)
    at.mutexDisabledCache.Store(!enabled)
    return enabled
}

func (at *AutoTrader) mutexProtectionEnabled() bool {
    if at == nil {
        return false
    }

    enabled := false
    if at.featureFlags != nil {
        enabled = at.featureFlags.MutexProtectionEnabled()
    }

    if at.mutexEnabledCache.Load() == enabled {
        return enabled
    }

    at.mutexEnabledCache.Store(enabled)
    at.mutexDisabledCache.Store(!enabled)
    return enabled
}

func (at *AutoTrader) mutexProtectionDisabled() bool {
    if at == nil {
        return true
    }

    at.mutexProtectionEnabled()
    return at.mutexDisabledCache.Load()
}

// GetDailyPnL returns the current daily PnL snapshot. The helper is safe to
// call regardless of enable_mutex_protection; it only grabs the mutex when the
// flag is enabled so disabling the flag remains a back-out path.
func (at *AutoTrader) GetDailyPnL() float64 {
    if at == nil {
        return 0
    }

    if at.mutexProtectionDisabled() {
        return at.dailyPnL
    }

    at.stateMu.RLock()
    defer at.stateMu.RUnlock()
    return at.dailyPnL
}

func (at *AutoTrader) setDailyPnL(value float64) {
    if at == nil {
        return
    }

    if at.mutexProtectionDisabled() {
        at.dailyPnL = value
        return
    }

    at.stateMu.Lock()
    at.dailyPnL = value
    at.stateMu.Unlock()
}

func (at *AutoTrader) setCurrentBalance(value float64) {
    if at == nil {
        return
    }

    if at.mutexProtectionDisabled() {
        at.currentBalance = value
        return
    }

    at.stateMu.Lock()
    at.currentBalance = value
    at.stateMu.Unlock()
}

func (at *AutoTrader) currentBalanceSnapshot() float64 {
    if at == nil {
        return 0
    }

    if at.mutexProtectionDisabled() {
        return at.currentBalance
    }

    at.stateMu.RLock()
    defer at.stateMu.RUnlock()
    return at.currentBalance
}

func (at *AutoTrader) setPeakBalance(value float64) {
    if at == nil {
        return
    }

    if at.mutexProtectionDisabled() {
        at.peakBalance = value
        return
    }

    at.stateMu.Lock()
    at.peakBalance = value
    at.stateMu.Unlock()
}

func (at *AutoTrader) peakBalanceSnapshot() float64 {
    if at == nil {
        return 0
    }

    if at.mutexProtectionDisabled() {
        return at.peakBalance
    }

    at.stateMu.RLock()
    defer at.stateMu.RUnlock()
    return at.peakBalance
}

// CanTrade evaluates whether the trader is allowed to execute trades at the
// present moment. It enforces stop-until windows and consults the risk engine
// when risk enforcement is enabled. On breach it logs an explicit warning.
//
// The method integrates with the risk engine's CheckLimits and CalculateStopDuration
// API for gating trading decisions. When enable_risk_enforcement is disabled, all
// checks are bypassed and trading proceeds normally.
func (at *AutoTrader) CanTrade() (bool, string) {
    if at == nil {
        return false, "auto trader not initialized"
    }

    now := time.Now()
    stopUntil := at.GetStopUntil()
    if !stopUntil.IsZero() && now.Before(stopUntil) {
        remaining := stopUntil.Sub(now)
        if remaining < 0 {
            remaining = 0
        }
        return false, fmt.Sprintf("风险控制暂停中，剩余 %.0f 分钟", remaining.Minutes())
    }

    if at.riskEngine == nil {
        return true, ""
    }

    if at.featureFlags != nil && !at.featureFlags.RiskEnforcementEnabled() {
        return true, ""
    }

    equity := at.currentBalanceSnapshot()
    if equity <= 0 {
        return true, ""
    }

    at.riskEngine.RecordEquity(equity)
    snapshot := at.riskEngine.Snapshot()
    at.setDailyPnL(snapshot.DailyPnL)
    at.setCurrentBalance(snapshot.CurrentEquity)
    at.setPeakBalance(snapshot.PeakEquity)

    state := risk.State{
        DailyPnL:       snapshot.DailyPnL,
        PeakBalance:    snapshot.PeakEquity,
        CurrentBalance: snapshot.CurrentEquity,
        LastResetTime:  snapshot.LastReset,
    }

    breached, reason := at.riskEngine.CheckLimits(state)
    if breached {
        if reason == "" {
            reason = "risk limit breached"
        }
        log.Printf("RISK LIMIT BREACHED [%s]: %s", at.name, reason)

        stopDuration := at.riskEngine.CalculateStopDuration()
        pausedUntil := now.Add(stopDuration)
        at.SetStopUntil(pausedUntil)
        at.riskEngine.PauseTrading(pausedUntil)
        metrics.IncRiskLimitBreaches(at.id)

        return false, reason
    }

    return true, ""
}

// UpdateDailyPnL applies a delta to the tracked daily PnL. The helper is safe
// to call regardless of enable_mutex_protection and falls back to the legacy
// lock-free path when the flag is disabled so operators retain a back-out path.
func (at *AutoTrader) UpdateDailyPnL(delta float64) float64 {
    if at == nil {
        return 0
    }

    if at.riskEngine == nil {
        if at.mutexProtectionDisabled() {
            at.dailyPnL += delta
            return at.dailyPnL
        }

        at.stateMu.Lock()
        at.dailyPnL += delta
        value := at.dailyPnL
        at.stateMu.Unlock()
        return value
    }

    updated := at.riskEngine.UpdateDailyPnL(delta)
    at.setDailyPnL(updated)
    return updated
}

// ResetDailyPnL zeroes the accumulated daily PnL and records the reset time.
// The helper honors enable_mutex_protection, locking only when the flag is on
// so disabling the flag still provides a safe back-out path.
func (at *AutoTrader) ResetDailyPnL(atTime time.Time) {
    if at == nil {
        return
    }

    if at.mutexProtectionDisabled() {
        at.dailyPnL = 0
        at.lastResetTime = atTime
        return
    }

    at.stateMu.Lock()
    at.dailyPnL = 0
    at.lastResetTime = atTime
    at.stateMu.Unlock()
}

// SetStopUntil updates the trading pause deadline. The helper is safe to call
// with enable_mutex_protection either on or off, acquiring the mutex only when
// the flag is active so the rollout retains a back-out path.
func (at *AutoTrader) SetStopUntil(until time.Time) {
    if at == nil {
        return
    }

    if at.mutexProtectionDisabled() {
        at.stopUntil = until
        return
    }

    at.stateMu.Lock()
    at.stopUntil = until
    at.stateMu.Unlock()
}

// GetStopUntil exposes the current trading pause deadline. The helper remains
// safe regardless of enable_mutex_protection and avoids locking when the flag
// is disabled so operators can revert via the flag if required.
func (at *AutoTrader) GetStopUntil() time.Time {
    if at == nil {
        return time.Time{}
    }

    if at.mutexProtectionDisabled() {
        return at.stopUntil
    }

    at.stateMu.RLock()
    defer at.stateMu.RUnlock()
    return at.stopUntil
}

// SetLastResetTime updates the timestamp of the last daily PnL reset. The
// helper is safe to call regardless of enable_mutex_protection, falling back to
// the legacy path when the flag is disabled to keep a back-out option.
func (at *AutoTrader) SetLastResetTime(ts time.Time) {
    if at == nil {
        return
    }

    if at.mutexProtectionDisabled() {
        at.lastResetTime = ts
        return
    }

    at.stateMu.Lock()
    at.lastResetTime = ts
    at.stateMu.Unlock()
}

// GetLastResetTime returns the timestamp of the last daily PnL reset. The
// helper respects enable_mutex_protection, only locking when the flag is true
// so disabling the flag continues to provide the back-out path.
func (at *AutoTrader) GetLastResetTime() time.Time {
    if at == nil {
        return time.Time{}
    }

    if at.mutexProtectionDisabled() {
        return at.lastResetTime
    }

    at.stateMu.RLock()
    defer at.stateMu.RUnlock()
    return at.lastResetTime
}

// SetTrading flips the trading loop state. The helper is safe independent of
// enable_mutex_protection and skips locking when the feature flag is turned off
// so we can revert to the legacy behavior instantly.
func (at *AutoTrader) SetTrading(running bool) {
    if at == nil {
        return
    }

    if at.mutexProtectionDisabled() {
        at.isRunning = running
        return
    }

    at.stateMu.Lock()
    at.isRunning = running
    at.stateMu.Unlock()
}

// IsTrading reports whether the AutoTrader loop is currently running. The
// helper automatically honors enable_mutex_protection and bypasses the mutex
// when the feature flag is disabled, preserving the back-out path.
func (at *AutoTrader) IsTrading() bool {
    if at == nil {
        return false
    }

    if at.mutexProtectionDisabled() {
        return at.isRunning
    }

    at.stateMu.RLock()
    defer at.stateMu.RUnlock()
    return at.isRunning
}

// GetPositions 获取持仓列表（用于API）
func (at *AutoTrader) GetPositions() ([]map[string]interface{}, error) {
    positions, err := at.trader.GetPositions()
    if err != nil {
        return nil, fmt.Errorf("获取持仓失败: %w", err)
    }

    var result []map[string]interface{}
    for _, pos := range positions {
        symbol := pos["symbol"].(string)
        side := pos["side"].(string)
        entryPrice := pos["entryPrice"].(float64)
        markPrice := pos["markPrice"].(float64)
        quantity := pos["positionAmt"].(float64)
        if quantity < 0 {
            quantity = -quantity
        }
        unrealizedPnl := pos["unRealizedProfit"].(float64)
        liquidationPrice := pos["liquidationPrice"].(float64)

        leverage := 10
        if lev, ok := pos["leverage"].(float64); ok {
            leverage = int(lev)
        }

        pnlPct := 0.0
        if side == "long" {
            pnlPct = ((markPrice - entryPrice) / entryPrice) * 100
        } else {
            pnlPct = ((entryPrice - markPrice) / entryPrice) * 100
        }

        marginUsed := (quantity * markPrice) / float64(leverage)

        result = append(result, map[string]interface{}{
            "symbol":             symbol,
            "side":               side,
            "entry_price":        entryPrice,
            "mark_price":         markPrice,
            "quantity":           quantity,
            "leverage":           leverage,
            "unrealized_pnl":     unrealizedPnl,
            "unrealized_pnl_pct": pnlPct,
            "liquidation_price":  liquidationPrice,
            "margin_used":        marginUsed,
        })
    }

    return result, nil
}

// sortDecisionsByPriority 对决策排序：先平仓，再开仓，最后hold/wait
// 这样可以避免换仓时仓位叠加超限
func sortDecisionsByPriority(decisions []decision.Decision) []decision.Decision {
    if len(decisions) <= 1 {
        return decisions
    }

    // 定义优先级
    getActionPriority := func(action string) int {
        switch action {
        case "close_long", "close_short":
            return 1 // 最高优先级：先平仓
        case "open_long", "open_short":
            return 2 // 次优先级：后开仓
        case "hold", "wait":
            return 3 // 最低优先级：观望
        default:
            return 999 // 未知动作放最后
        }
    }

    // 复制决策列表
    sorted := make([]decision.Decision, len(decisions))
    copy(sorted, decisions)

    // 按优先级排序
    for i := 0; i < len(sorted)-1; i++ {
        for j := i + 1; j < len(sorted); j++ {
            if getActionPriority(sorted[i].Action) > getActionPriority(sorted[j].Action) {
                sorted[i], sorted[j] = sorted[j], sorted[i]
            }
        }
    }

    return sorted
}
