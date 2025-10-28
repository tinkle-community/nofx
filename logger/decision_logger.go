package logger

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"time"
)

// DecisionRecord 决策记录
type DecisionRecord struct {
	Timestamp      time.Time          `json:"timestamp"`       // 决策时间
	CycleNumber    int                `json:"cycle_number"`    // 周期编号
	CoTTrace       string             `json:"cot_trace"`       // AI思维链
	DecisionJSON   string             `json:"decision_json"`   // 决策JSON
	AccountState   AccountSnapshot    `json:"account_state"`   // 账户状态快照
	Positions      []PositionSnapshot `json:"positions"`       // 持仓快照
	CandidateCoins []string           `json:"candidate_coins"` // 候选币种列表
	Decisions      []DecisionAction   `json:"decisions"`       // 执行的决策
	ExecutionLog   []string           `json:"execution_log"`   // 执行日志
	Success        bool               `json:"success"`         // 是否成功
	ErrorMessage   string             `json:"error_message"`   // 错误信息（如果有）
}

// AccountSnapshot 账户状态快照
type AccountSnapshot struct {
	TotalBalance          float64 `json:"total_balance"`
	AvailableBalance      float64 `json:"available_balance"`
	TotalUnrealizedProfit float64 `json:"total_unrealized_profit"`
	PositionCount         int     `json:"position_count"`
	MarginUsedPct         float64 `json:"margin_used_pct"`
}

// PositionSnapshot 持仓快照
type PositionSnapshot struct {
	Symbol           string  `json:"symbol"`
	Side             string  `json:"side"`
	PositionAmt      float64 `json:"position_amt"`
	EntryPrice       float64 `json:"entry_price"`
	MarkPrice        float64 `json:"mark_price"`
	UnrealizedProfit float64 `json:"unrealized_profit"`
	Leverage         float64 `json:"leverage"`
	LiquidationPrice float64 `json:"liquidation_price"`
}

// DecisionAction 决策动作
type DecisionAction struct {
	Action    string    `json:"action"`    // open_long, open_short, close_long, close_short
	Symbol    string    `json:"symbol"`    // 币种
	Quantity  float64   `json:"quantity"`  // 数量
	Leverage  int       `json:"leverage"`  // 杠杆（开仓时）
	Price     float64   `json:"price"`     // 执行价格
	OrderID   int64     `json:"order_id"`  // 订单ID
	Timestamp time.Time `json:"timestamp"` // 执行时间
	Success   bool      `json:"success"`   // 是否成功
	Error     string    `json:"error"`     // 错误信息
}

// DecisionLogger 决策日志记录器
type DecisionLogger struct {
	logDir      string
	cycleNumber int
}

// NewDecisionLogger 创建决策日志记录器
func NewDecisionLogger(logDir string) *DecisionLogger {
	if logDir == "" {
		logDir = "decision_logs"
	}

	// 确保日志目录存在
	if err := os.MkdirAll(logDir, 0755); err != nil {
		fmt.Printf("⚠ 创建日志目录失败: %v\n", err)
	}

	return &DecisionLogger{
		logDir:      logDir,
		cycleNumber: 0,
	}
}

// LogDecision 记录决策
func (l *DecisionLogger) LogDecision(record *DecisionRecord) error {
	l.cycleNumber++
	record.CycleNumber = l.cycleNumber
	record.Timestamp = time.Now()

	// 生成文件名：decision_YYYYMMDD_HHMMSS_cycleN.json
	filename := fmt.Sprintf("decision_%s_cycle%d.json",
		record.Timestamp.Format("20060102_150405"),
		record.CycleNumber)

	filepath := filepath.Join(l.logDir, filename)

	// 序列化为JSON（带缩进，方便阅读）
	data, err := json.MarshalIndent(record, "", "  ")
	if err != nil {
		return fmt.Errorf("序列化决策记录失败: %w", err)
	}

	// 写入文件
	if err := ioutil.WriteFile(filepath, data, 0644); err != nil {
		return fmt.Errorf("写入决策记录失败: %w", err)
	}

	fmt.Printf("📝 决策记录已保存: %s\n", filename)
	return nil
}

// GetLatestRecords 获取最近N条记录（按时间正序：从旧到新）
func (l *DecisionLogger) GetLatestRecords(n int) ([]*DecisionRecord, error) {
	files, err := ioutil.ReadDir(l.logDir)
	if err != nil {
		return nil, fmt.Errorf("读取日志目录失败: %w", err)
	}

	// 先按修改时间倒序收集（最新的在前）
	var records []*DecisionRecord
	count := 0
	for i := len(files) - 1; i >= 0 && count < n; i-- {
		file := files[i]
		if file.IsDir() {
			continue
		}

		filepath := filepath.Join(l.logDir, file.Name())
		data, err := ioutil.ReadFile(filepath)
		if err != nil {
			continue
		}

		var record DecisionRecord
		if err := json.Unmarshal(data, &record); err != nil {
			continue
		}

		records = append(records, &record)
		count++
	}

	// 反转数组，让时间从旧到新排列（用于图表显示）
	for i, j := 0, len(records)-1; i < j; i, j = i+1, j-1 {
		records[i], records[j] = records[j], records[i]
	}

	return records, nil
}

// GetRecordByDate 获取指定日期的所有记录
func (l *DecisionLogger) GetRecordByDate(date time.Time) ([]*DecisionRecord, error) {
	dateStr := date.Format("20060102")
	pattern := filepath.Join(l.logDir, fmt.Sprintf("decision_%s_*.json", dateStr))

	files, err := filepath.Glob(pattern)
	if err != nil {
		return nil, fmt.Errorf("查找日志文件失败: %w", err)
	}

	var records []*DecisionRecord
	for _, filepath := range files {
		data, err := ioutil.ReadFile(filepath)
		if err != nil {
			continue
		}

		var record DecisionRecord
		if err := json.Unmarshal(data, &record); err != nil {
			continue
		}

		records = append(records, &record)
	}

	return records, nil
}

// CleanOldRecords 清理N天前的旧记录
func (l *DecisionLogger) CleanOldRecords(days int) error {
	cutoffTime := time.Now().AddDate(0, 0, -days)

	files, err := ioutil.ReadDir(l.logDir)
	if err != nil {
		return fmt.Errorf("读取日志目录失败: %w", err)
	}

	removedCount := 0
	for _, file := range files {
		if file.IsDir() {
			continue
		}

		if file.ModTime().Before(cutoffTime) {
			filepath := filepath.Join(l.logDir, file.Name())
			if err := os.Remove(filepath); err != nil {
				fmt.Printf("⚠ 删除旧记录失败 %s: %v\n", file.Name(), err)
				continue
			}
			removedCount++
		}
	}

	if removedCount > 0 {
		fmt.Printf("🗑️ 已清理 %d 条旧记录（%d天前）\n", removedCount, days)
	}

	return nil
}

// GetStatistics 获取统计信息
func (l *DecisionLogger) GetStatistics() (*Statistics, error) {
	files, err := ioutil.ReadDir(l.logDir)
	if err != nil {
		return nil, fmt.Errorf("读取日志目录失败: %w", err)
	}

	stats := &Statistics{}

	for _, file := range files {
		if file.IsDir() {
			continue
		}

		filepath := filepath.Join(l.logDir, file.Name())
		data, err := ioutil.ReadFile(filepath)
		if err != nil {
			continue
		}

		var record DecisionRecord
		if err := json.Unmarshal(data, &record); err != nil {
			continue
		}

		stats.TotalCycles++

		for _, action := range record.Decisions {
			if action.Success {
				switch action.Action {
				case "open_long", "open_short":
					stats.TotalOpenPositions++
				case "close_long", "close_short":
					stats.TotalClosePositions++
				}
			}
		}

		if record.Success {
			stats.SuccessfulCycles++
		} else {
			stats.FailedCycles++
		}
	}

	return stats, nil
}

// Statistics 统计信息
type Statistics struct {
	TotalCycles         int `json:"total_cycles"`
	SuccessfulCycles    int `json:"successful_cycles"`
	FailedCycles        int `json:"failed_cycles"`
	TotalOpenPositions  int `json:"total_open_positions"`
	TotalClosePositions int `json:"total_close_positions"`
}

// TradeOutcome 单笔交易结果
type TradeOutcome struct {
	Symbol      string    // 币种
	Side        string    // long/short
	OpenPrice   float64   // 开仓价
	ClosePrice  float64   // 平仓价
	PnL         float64   // 盈亏（USDT）
	PnLPct      float64   // 盈亏百分比
	Duration    string    // 持仓时长
	OpenTime    time.Time // 开仓时间
	CloseTime   time.Time // 平仓时间
	WasStopLoss bool      // 是否止损
}

// PerformanceAnalysis 交易表现分析
type PerformanceAnalysis struct {
	TotalTrades   int                           // 总交易数
	WinningTrades int                           // 盈利交易数
	LosingTrades  int                           // 亏损交易数
	WinRate       float64                       // 胜率
	AvgWin        float64                       // 平均盈利
	AvgLoss       float64                       // 平均亏损
	ProfitFactor  float64                       // 盈亏比
	RecentTrades  []TradeOutcome                // 最近N笔交易
	SymbolStats   map[string]*SymbolPerformance // 各币种表现
	BestSymbol    string                        // 表现最好的币种
	WorstSymbol   string                        // 表现最差的币种
}

// SymbolPerformance 币种表现统计
type SymbolPerformance struct {
	Symbol        string  // 币种
	TotalTrades   int     // 交易次数
	WinningTrades int     // 盈利次数
	LosingTrades  int     // 亏损次数
	WinRate       float64 // 胜率
	TotalPnL      float64 // 总盈亏
	AvgPnL        float64 // 平均盈亏
}

// AnalyzePerformance 分析最近N个周期的交易表现
func (l *DecisionLogger) AnalyzePerformance(lookbackCycles int) (*PerformanceAnalysis, error) {
	records, err := l.GetLatestRecords(lookbackCycles)
	if err != nil {
		return nil, fmt.Errorf("读取历史记录失败: %w", err)
	}

	if len(records) == 0 {
		return &PerformanceAnalysis{
			SymbolStats: make(map[string]*SymbolPerformance),
		}, nil
	}

	analysis := &PerformanceAnalysis{
		SymbolStats: make(map[string]*SymbolPerformance),
	}

	// 追踪持仓状态：symbol -> {side, openPrice, openTime}
	openPositions := make(map[string]map[string]interface{})

	// 遍历所有记录
	for _, record := range records {
		for _, action := range record.Decisions {
			if !action.Success {
				continue
			}

			symbol := action.Symbol
			posKey := symbol // 使用symbol作为key（假设同一时间一个币种只有一个方向的仓位）

			switch action.Action {
			case "open_long", "open_short":
				// 记录开仓
				openPositions[posKey] = map[string]interface{}{
					"side":      action.Action[5:], // "long" or "short"
					"openPrice": action.Price,
					"openTime":  action.Timestamp,
				}

			case "close_long", "close_short":
				// 查找对应的开仓记录
				if openPos, exists := openPositions[posKey]; exists {
					openPrice := openPos["openPrice"].(float64)
					openTime := openPos["openTime"].(time.Time)
					side := openPos["side"].(string)

					// 计算盈亏
					pnl := 0.0
					pnlPct := 0.0
					if side == "long" {
						pnlPct = ((action.Price - openPrice) / openPrice) * 100
					} else {
						pnlPct = ((openPrice - action.Price) / openPrice) * 100
					}
					pnl = pnlPct // 简化：用百分比代表盈亏

					// 记录交易结果
					outcome := TradeOutcome{
						Symbol:     symbol,
						Side:       side,
						OpenPrice:  openPrice,
						ClosePrice: action.Price,
						PnL:        pnl,
						PnLPct:     pnlPct,
						Duration:   action.Timestamp.Sub(openTime).String(),
						OpenTime:   openTime,
						CloseTime:  action.Timestamp,
					}

					analysis.RecentTrades = append(analysis.RecentTrades, outcome)
					analysis.TotalTrades++

					if pnl > 0 {
						analysis.WinningTrades++
						analysis.AvgWin += pnl
					} else {
						analysis.LosingTrades++
						analysis.AvgLoss += pnl
					}

					// 更新币种统计
					if _, exists := analysis.SymbolStats[symbol]; !exists {
						analysis.SymbolStats[symbol] = &SymbolPerformance{
							Symbol: symbol,
						}
					}
					stats := analysis.SymbolStats[symbol]
					stats.TotalTrades++
					stats.TotalPnL += pnl
					if pnl > 0 {
						stats.WinningTrades++
					} else {
						stats.LosingTrades++
					}

					// 移除已平仓记录
					delete(openPositions, posKey)
				}
			}
		}
	}

	// 计算统计指标
	if analysis.TotalTrades > 0 {
		analysis.WinRate = (float64(analysis.WinningTrades) / float64(analysis.TotalTrades)) * 100

		if analysis.WinningTrades > 0 {
			analysis.AvgWin /= float64(analysis.WinningTrades)
		}
		if analysis.LosingTrades > 0 {
			analysis.AvgLoss /= float64(analysis.LosingTrades)
		}

		if analysis.AvgLoss != 0 {
			analysis.ProfitFactor = analysis.AvgWin / (-analysis.AvgLoss)
		}
	}

	// 计算各币种胜率和平均盈亏
	bestPnL := -999999.0
	worstPnL := 999999.0
	for symbol, stats := range analysis.SymbolStats {
		if stats.TotalTrades > 0 {
			stats.WinRate = (float64(stats.WinningTrades) / float64(stats.TotalTrades)) * 100
			stats.AvgPnL = stats.TotalPnL / float64(stats.TotalTrades)

			if stats.TotalPnL > bestPnL {
				bestPnL = stats.TotalPnL
				analysis.BestSymbol = symbol
			}
			if stats.TotalPnL < worstPnL {
				worstPnL = stats.TotalPnL
				analysis.WorstSymbol = symbol
			}
		}
	}

	// 只保留最近的交易（倒序：最新的在前）
	if len(analysis.RecentTrades) > 10 {
		// 反转数组，让最新的在前
		for i, j := 0, len(analysis.RecentTrades)-1; i < j; i, j = i+1, j-1 {
			analysis.RecentTrades[i], analysis.RecentTrades[j] = analysis.RecentTrades[j], analysis.RecentTrades[i]
		}
		analysis.RecentTrades = analysis.RecentTrades[:10]
	} else if len(analysis.RecentTrades) > 0 {
		// 反转数组
		for i, j := 0, len(analysis.RecentTrades)-1; i < j; i, j = i+1, j-1 {
			analysis.RecentTrades[i], analysis.RecentTrades[j] = analysis.RecentTrades[j], analysis.RecentTrades[i]
		}
	}

	return analysis, nil
}
