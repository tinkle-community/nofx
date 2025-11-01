package market

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"sort"
	"strings"
	"sync"
	"time"
)

type WSMonitor struct {
	wsClient       *WSClient
	combinedClient *CombinedStreamsClient
	featureEngine  *FeatureEngine
	symbols        []string
	featuresMap    sync.Map
	alertsChan     chan Alert
	klineDataMap3m sync.Map // 存储每个交易对的K线历史数据
	klineDataMap4h sync.Map // 存储每个交易对的K线历史数据
	tickerDataMap  sync.Map // 存储每个交易对的ticker数据
	batchSize      int
	filterSymbols  sync.Map // 使用sync.Map来存储需要监控的币种和其状态
	symbolStats    sync.Map // 存储币种统计信息
	FilterSymbol   []string //经过筛选的币种
}
type SymbolStats struct {
	LastActiveTime   time.Time
	AlertCount       int
	VolumeSpikeCount int
	LastAlertTime    time.Time
	Score            float64 // 综合评分
}

var WSMonitorCli *WSMonitor

func NewWSMonitor(batchSize int) *WSMonitor {
	WSMonitorCli = &WSMonitor{
		wsClient:       NewWSClient(),
		combinedClient: NewCombinedStreamsClient(batchSize),
		featureEngine:  NewFeatureEngine(config.AlertThresholds),
		alertsChan:     make(chan Alert, 1000),
		batchSize:      batchSize,
	}
	return WSMonitorCli
}

func (m *WSMonitor) Initialize() error {
	log.Println("初始化WebSocket监控器...")

	// 获取交易对信息
	apiClient := NewAPIClient()
	exchangeInfo, err := apiClient.GetExchangeInfo()
	if err != nil {
		return err
	}

	// 筛选永续合约交易对 --仅测试时使用
	//exchangeInfo.Symbols = exchangeInfo.Symbols[0:2]
	for _, symbol := range exchangeInfo.Symbols {
		if symbol.Status == "TRADING" && symbol.ContractType == "PERPETUAL" {
			m.symbols = append(m.symbols, Normalize(symbol.Symbol))
		}
	}
	log.Printf("找到 %d 个交易对", len(m.symbols))
	// 初始化历史数据
	if err := m.initializeHistoricalData(); err != nil {
		log.Printf("初始化历史数据失败: %v", err)
	}

	return nil
}

func (m *WSMonitor) initializeHistoricalData() error {
	apiClient := NewAPIClient()

	var wg sync.WaitGroup
	semaphore := make(chan struct{}, 5) // 限制并发数

	for _, symbol := range m.symbols {
		wg.Add(1)
		semaphore <- struct{}{}

		go func(s string) {
			defer wg.Done()
			defer func() { <-semaphore }()

			// 获取历史K线数据
			klines, err := apiClient.GetKlines(s, "3m", 100)
			if err != nil {
				log.Printf("获取 %s 历史数据失败: %v", s, err)
				return
			}
			if len(klines) > 0 {
				m.klineDataMap3m.Store(s, klines)
				log.Printf("已加载 %s 的历史K线数据-3m: %d 条", s, len(klines))
			}
			// 获取历史K线数据
			klines4h, err := apiClient.GetKlines(s, "4h", 100)
			if err != nil {
				log.Printf("获取 %s 历史数据失败: %v", s, err)
				return
			}
			if len(klines4h) > 0 {
				m.klineDataMap4h.Store(s, klines)
				log.Printf("已加载 %s 的历史K线数据-4h: %d 条", s, len(klines))
			}
		}(symbol)
	}

	wg.Wait()
	return nil
}

func (m *WSMonitor) Start() {
	log.Printf("启动WebSocket实时监控...")
	// 初始化交易对
	err := m.Initialize()
	if err != nil {
		log.Fatalf("❌ 初始化币种: %v", err)
		return
	}

	err = m.combinedClient.Connect()
	if err != nil {
		log.Fatalf("❌ 批量订阅流: %v", err)
		return
	}
	// 启动警报处理器
	go m.handleAlerts()
	// 启动定期清理任务
	go m.cleanupInactiveSymbols()
	// 输出监控统计 - 评分前十名
	go m.printFilterStats(50)
	// 订阅所有交易对
	err = m.subscribeAll()

	if err != nil {
		log.Fatalf("❌ 订阅币种交易对: %v", err)
		return
	}
}

func (m *WSMonitor) subscribeAll() error {
	// 执行批量订阅
	log.Println("开始订阅所有交易对...")
	for _, symbol := range m.symbols {
		stream3m := fmt.Sprintf("%s@kline_3m", strings.ToLower(symbol))
		ch3m := m.combinedClient.AddSubscriber(stream3m, 100)
		go m.handleKlineData(symbol, ch3m, "3m")

		stream4h := fmt.Sprintf("%s@kline_4h", strings.ToLower(symbol))
		ch4h := m.combinedClient.AddSubscriber(stream4h, 100)
		go m.handleKlineData(symbol, ch4h, "4h")
	}

	err := m.combinedClient.BatchSubscribeKlines(m.symbols, "3m")
	if err != nil {
		log.Fatalf("❌ 订阅3m K线: %v", err)
		return err
	}
	err = m.combinedClient.BatchSubscribeKlines(m.symbols, "4h")
	if err != nil {
		log.Fatalf("❌ 订阅4h K线: %v", err)
		return err
	}
	log.Println("所有交易对订阅完成")
	return nil
}

func (m *WSMonitor) handleKlineData(symbol string, ch <-chan []byte, _time string) {
	for data := range ch {
		var klineData KlineWSData
		if err := json.Unmarshal(data, &klineData); err != nil {
			log.Printf("解析Kline数据失败: %v", err)
			continue
		}
		m.processKlineUpdate(symbol, klineData, _time)
	}
}

func (m *WSMonitor) handleTickerData(symbol string, ch <-chan []byte) {
	for data := range ch {
		var tickerData TickerWSData
		if err := json.Unmarshal(data, &tickerData); err != nil {
			log.Printf("解析Ticker数据失败: %v", err)
			continue
		}

		m.processTickerUpdate(symbol, tickerData)
	}
}
func (m *WSMonitor) handleTickerDatas(ch <-chan []byte) {
	for data := range ch {
		var tickerData []TickerWSData
		if err := json.Unmarshal(data, &tickerData); err != nil {
			log.Printf("解析Ticker数据失败: %v", err)
			continue
		}
		log.Fatalln(tickerData)
		//m.processTickerUpdate(symbol, tickerData)
	}
}
func (m *WSMonitor) getKlineDataMap(_time string) *sync.Map {
	var klineDataMap *sync.Map
	if _time == "3m" {
		klineDataMap = &m.klineDataMap3m
	} else {
		klineDataMap = &m.klineDataMap4h
	}
	return klineDataMap
}
func (m *WSMonitor) processKlineUpdate(symbol string, wsData KlineWSData, _time string) {
	// 转换WebSocket数据为Kline结构
	kline := Kline{
		OpenTime:  wsData.Kline.StartTime,
		CloseTime: wsData.Kline.CloseTime,
		Trades:    wsData.Kline.NumberOfTrades,
	}
	kline.Open, _ = parseFloat(wsData.Kline.OpenPrice)
	kline.High, _ = parseFloat(wsData.Kline.HighPrice)
	kline.Low, _ = parseFloat(wsData.Kline.LowPrice)
	kline.Close, _ = parseFloat(wsData.Kline.ClosePrice)
	kline.Volume, _ = parseFloat(wsData.Kline.Volume)
	kline.High, _ = parseFloat(wsData.Kline.HighPrice)
	kline.QuoteVolume, _ = parseFloat(wsData.Kline.QuoteVolume)
	kline.TakerBuyBaseVolume, _ = parseFloat(wsData.Kline.TakerBuyBaseVolume)
	kline.TakerBuyQuoteVolume, _ = parseFloat(wsData.Kline.TakerBuyQuoteVolume)
	// 更新K线数据
	var klineDataMap = m.getKlineDataMap(_time)
	value, exists := klineDataMap.Load(symbol)
	var klines []Kline
	if exists {
		klines = value.([]Kline)

		// 检查是否是新的K线
		if len(klines) > 0 && klines[len(klines)-1].OpenTime == kline.OpenTime {
			// 更新当前K线
			klines[len(klines)-1] = kline
		} else {
			// 添加新K线
			klines = append(klines, kline)

			// 保持数据长度
			if len(klines) > 100 {
				klines = klines[1:]
			}
		}
	} else {
		klines = []Kline{kline}
	}

	klineDataMap.Store(symbol, klines)
	// 计算特征并检测警报
	if len(klines) >= 20 {
		features := m.featureEngine.CalculateFeatures(symbol, klines)
		if features != nil {
			m.featuresMap.Store(symbol, features)

			alerts := m.featureEngine.DetectAlerts(features)
			hasAlert := len(alerts) > 0

			// 更新统计信息
			m.updateSymbolStats(symbol, features, hasAlert)

			for _, alert := range alerts {
				m.alertsChan <- alert
			}

			// 实时日志输出重要特征
			if len(alerts) > 0 || features.VolumeRatio5 > 2.0 || math.Abs(features.PriceChange15Min) > 0.02 {
				//log.Printf("📊 %s - 价格: %.4f, 15分钟变动: %.2f%%, 交易量倍数: %.2f, RSI: %.1f",
				//	symbol, features.Price, features.PriceChange15Min*100,
				//	features.VolumeRatio5, features.RSI14)
			}
		}
	}
}

func (m *WSMonitor) processTickerUpdate(symbol string, tickerData TickerWSData) {
	// 存储ticker数据
	m.tickerDataMap.Store(symbol, tickerData)
}

func (m *WSMonitor) handleAlerts() {
	alertCounts := make(map[string]int)
	lastReset := time.Now()

	for alert := range m.alertsChan {
		// 重置计数器（每小时）
		if time.Since(lastReset) > time.Hour {
			alertCounts = make(map[string]int)
			lastReset = time.Now()
		}

		// 警报去重和频率控制
		alertKey := fmt.Sprintf("%s_%s", alert.Symbol, alert.Type)
		alertCounts[alertKey]++
		m.filterSymbols.Store(alert.Symbol, true)

		//log.Printf("✅ 自动添加监控: %s (因警报: %s)", alert.Symbol, alert.Message)
		if alertCounts[alertKey] <= 3 { // 每小时最多3次相同警报
			//log.Printf("🚨 实时警报: %s", alert.Message)

			// 这里可以添加其他警报处理逻辑
		}
	}
}

func (m *WSMonitor) GetCurrentKlines(symbol string, _time string) ([]Kline, error) {
	value, exists := m.getKlineDataMap(_time).Load(symbol)
	if !exists {
		// 如果Ws数据未初始化完成时,单独使用api获取 - 兼容性代码 (防止在未初始化完成是,已经有交易员运行)
		apiClient := NewAPIClient()
		klines, err := apiClient.GetKlines(symbol, _time, 40)
		if err != nil {
			return nil, fmt.Errorf("获取%v分钟K线失败: %v", _time, err)
		}
		return klines, fmt.Errorf("symbol不存在")
	}
	return value.([]Kline), nil
}

func (m *WSMonitor) GetCurrentFeatures(symbol string) (*SymbolFeatures, bool) {
	value, exists := m.featuresMap.Load(symbol)
	if !exists {
		return nil, false
	}
	return value.(*SymbolFeatures), true
}

func (m *WSMonitor) GetAllFeatures() map[string]*SymbolFeatures {
	features := make(map[string]*SymbolFeatures)
	m.featuresMap.Range(func(key, value interface{}) bool {
		features[key.(string)] = value.(*SymbolFeatures)
		return true
	})
	return features
}

func (m *WSMonitor) Close() {
	m.wsClient.Close()
	close(m.alertsChan)
}
func (m *WSMonitor) printFilterStats(nember int) {
	ticker := time.NewTicker(2 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		var monitoredSymbols []string
		m.filterSymbols.Range(func(key, value interface{}) bool {
			monitoredSymbols = append(monitoredSymbols, key.(string))
			return true
		})

		log.Printf("🎯 监控统计 - 总数: %d, 币种: %v",
			len(monitoredSymbols), monitoredSymbols)

		// 打印前5个评分最高的币种
		type symbolScore struct {
			symbol string
			score  float64
		}
		var topScores []symbolScore

		m.symbolStats.Range(func(key, value interface{}) bool {
			symbol := key.(string)
			stats := value.(*SymbolStats)
			topScores = append(topScores, symbolScore{symbol, stats.Score})
			return true
		})

		// 按评分排序
		sort.Slice(topScores, func(i, j int) bool {
			return topScores[i].score > topScores[j].score
		})
		m.FilterSymbol = nil
		if len(topScores) > 0 {
			log.Printf("🏆 评分TOP%v:", nember)
			for i := 0; i < len(topScores) && i < nember; i++ {
				m.FilterSymbol = append(m.FilterSymbol, topScores[i].symbol)
				log.Printf("   %d. %s: %.1f分", i+1, topScores[i].symbol, topScores[i].score)
			}
		}
	}
}

// evaluateSymbolScore 评估币种得分，决定是否保留
func (m *WSMonitor) evaluateSymbolScore(symbol string, features *SymbolFeatures) float64 {
	score := 0.0

	// 交易量活跃度评分 (权重: 40%)
	if features.VolumeRatio5 > 1.5 {
		score += 40 * math.Min(features.VolumeRatio5/5.0, 1.0)
	}

	// 价格波动评分 (权重: 30%)
	volatilityScore := math.Abs(features.PriceChange15Min) * 1000 // 放大系数
	score += 30 * math.Min(volatilityScore/10.0, 1.0)             // 最大10%波动得满分

	// RSI活跃度评分 (权重: 20%)
	if features.RSI14 < 30 || features.RSI14 > 70 {
		score += 20 // RSI在极端区域
	} else if features.RSI14 < 40 || features.RSI14 > 60 {
		score += 10 // RSI在活跃区域
	}

	// 交易量趋势评分 (权重: 10%)
	if features.VolumeTrend > 1.2 {
		score += 10 * math.Min(features.VolumeTrend/3.0, 1.0)
	}

	return score
}

// shouldRemoveFromFilter 判断是否应该从FilterSymbols中移除
func (m *WSMonitor) shouldRemoveFromFilter(symbol string) bool {
	value, exists := m.symbolStats.Load(symbol)
	if !exists {
		return true // 没有统计信息，移除
	}

	stats := value.(*SymbolStats)

	// 规则1: 超过30分钟没有活跃迹象
	if time.Since(stats.LastActiveTime) > 30*time.Minute {
		log.Printf("🔻 %s 因长时间不活跃被移除", symbol)
		return true
	}

	// 规则2: 评分持续低于阈值 (最近5次评分平均)
	if stats.Score < 15 { // 调整这个阈值
		log.Printf("🔻 %s 因评分过低(%.1f)被移除", symbol, stats.Score)
		return true
	}

	// 规则3: 超过2小时没有产生警报
	if time.Since(stats.LastAlertTime) > 2*time.Hour && stats.AlertCount > 0 {
		log.Printf("🔻 %s 因长时间无新警报被移除", symbol)
		return true
	}

	return false
}

// updateSymbolStats 更新币种统计信息
func (m *WSMonitor) updateSymbolStats(symbol string, features *SymbolFeatures, hasAlert bool) {
	now := time.Now()

	value, exists := m.symbolStats.Load(symbol)
	var stats *SymbolStats

	if !exists {
		stats = &SymbolStats{
			LastActiveTime: now,
			Score:          m.evaluateSymbolScore(symbol, features),
		}
	} else {
		stats = value.(*SymbolStats)
		stats.LastActiveTime = now

		// 平滑更新评分 (指数移动平均)
		newScore := m.evaluateSymbolScore(symbol, features)
		stats.Score = 0.7*stats.Score + 0.3*newScore
	}

	if hasAlert {
		stats.AlertCount++
		stats.LastAlertTime = now
	}

	if features.VolumeRatio5 > 2.0 {
		stats.VolumeSpikeCount++
	}

	m.symbolStats.Store(symbol, stats)
}

// removeFromFilter 从FilterSymbols中移除币种
func (m *WSMonitor) removeFromFilter(symbol string) {

	// 从filterSymbols中移除
	m.filterSymbols.Delete(symbol)
	m.symbolStats.Delete(symbol)

	log.Printf("🗑️ 已移除币种监控: %s", symbol)
}

// cleanupInactiveSymbols 定期清理不活跃的币种
func (m *WSMonitor) cleanupInactiveSymbols() {
	ticker := time.NewTicker(5 * time.Minute) // 每5分钟检查一次
	defer ticker.Stop()

	for range ticker.C {
		var symbolsToRemove []string

		// 收集需要移除的币种
		m.filterSymbols.Range(func(key, value interface{}) bool {
			symbol := key.(string)
			if m.shouldRemoveFromFilter(symbol) {
				symbolsToRemove = append(symbolsToRemove, symbol)
			}
			return true
		})

		// 执行移除操作
		for _, symbol := range symbolsToRemove {
			m.removeFromFilter(symbol)
		}

		if len(symbolsToRemove) > 0 {
			log.Printf("🧹 清理完成，移除了 %d 个不活跃币种", len(symbolsToRemove))
		}
	}
}

// getSymbolScore 获取币种当前评分
func (m *WSMonitor) getSymbolScore(symbol string) float64 {
	value, exists := m.symbolStats.Load(symbol)
	if !exists {
		return 0
	}
	return value.(*SymbolStats).Score
}
