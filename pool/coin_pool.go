package pool

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

// CoinPoolConfig 币种池配置
type CoinPoolConfig struct {
	APIURL   string
	Timeout  time.Duration
	CacheDir string
}

var coinPoolConfig = CoinPoolConfig{
	APIURL:   "",
	Timeout:  30 * time.Second, // 增加到30秒
	CacheDir: "coin_pool_cache",
}

// defaultMainstreamCoins 默认主流币种池（当AI500和OI Top都失败时使用）
var defaultMainstreamCoins = []string{
	"BTCUSDT",
	"ETHUSDT",
	"SOLUSDT",
	"BNBUSDT",
	"XRPUSDT",
	"DOGEUSDT",
	"ADAUSDT",
	"HYPEUSDT",
}

// CoinPoolCache 币种池缓存
type CoinPoolCache struct {
	Coins      []CoinInfo `json:"coins"`
	FetchedAt  time.Time  `json:"fetched_at"`
	SourceType string     `json:"source_type"` // "api" or "cache"
}

// CoinInfo 币种信息
type CoinInfo struct {
	Pair            string  `json:"pair"`             // 交易对符号（例如：BTCUSDT）
	Score           float64 `json:"score"`            // 当前评分
	StartTime       int64   `json:"start_time"`       // 开始时间（Unix时间戳）
	StartPrice      float64 `json:"start_price"`      // 开始价格
	LastScore       float64 `json:"last_score"`       // 最新评分
	MaxScore        float64 `json:"max_score"`        // 最高评分
	MaxPrice        float64 `json:"max_price"`        // 最高价格
	IncreasePercent float64 `json:"increase_percent"` // 涨幅百分比
	IsAvailable     bool    `json:"-"`                // 是否可交易（内部使用）
}

// CoinPoolAPIResponse API返回的原始数据结构
type CoinPoolAPIResponse struct {
	Success bool `json:"success"`
	Data    struct {
		Coins []CoinInfo `json:"coins"`
		Count int        `json:"count"`
	} `json:"data"`
}

// SetCoinPoolAPI 设置币种池API
func SetCoinPoolAPI(apiURL string) {
	coinPoolConfig.APIURL = apiURL
}

// SetOITopAPI 设置OI Top API
func SetOITopAPI(apiURL string) {
	oiTopConfig.APIURL = apiURL
}

// SetEnableAI500 设置是否启用AI500
func SetEnableAI500(enable bool) {
	enableAI500Switch = enable
	if enable {
		log.Printf("✓ AI500币种池已启用")
	} else {
		log.Printf("⚠️  AI500币种池已禁用")
	}
}

// SetEnableOITop 设置是否启用OI Top
func SetEnableOITop(enable bool) {
	enableOITopSwitch = enable
	if enable {
		log.Printf("✓ OI Top已启用")
	} else {
		log.Printf("⚠️  OI Top已禁用")
	}
}

// IsAI500Enabled 检查AI500是否启用
func IsAI500Enabled() bool {
	return enableAI500Switch && coinPoolConfig.APIURL != ""
}

// IsOITopEnabled 检查OI Top是否启用
func IsOITopEnabled() bool {
	return enableOITopSwitch && oiTopConfig.APIURL != ""
}

// GetCoinPool 获取币种池列表（带重试和缓存机制）
func GetCoinPool() ([]CoinInfo, error) {
	maxRetries := 3
	var lastErr error

	// 尝试从API获取
	for attempt := 1; attempt <= maxRetries; attempt++ {
		if attempt > 1 {
			log.Printf("⚠️  第%d次重试获取币种池（共%d次）...", attempt, maxRetries)
			time.Sleep(2 * time.Second) // 重试前等待2秒
		}

		coins, err := fetchCoinPool()
		if err == nil {
			if attempt > 1 {
				log.Printf("✓ 第%d次重试成功", attempt)
			}
			// 成功获取后保存到缓存
			if err := saveCoinPoolCache(coins); err != nil {
				log.Printf("⚠️  保存币种池缓存失败: %v", err)
			}
			return coins, nil
		}

		lastErr = err
		log.Printf("❌ 第%d次请求失败: %v", attempt, err)
	}

	// API获取失败，尝试使用缓存
	log.Printf("⚠️  API请求全部失败，尝试使用历史缓存数据...")
	cachedCoins, err := loadCoinPoolCache()
	if err == nil {
		log.Printf("✓ 使用历史缓存数据（共%d个币种）", len(cachedCoins))
		return cachedCoins, nil
	}

	log.Printf("❌ 无法加载缓存数据: %v", err)
	return nil, fmt.Errorf("获取币种池失败（API重试%d次后，缓存也不可用）: %w", maxRetries, lastErr)
}

// fetchCoinPool 实际执行币种池请求
func fetchCoinPool() ([]CoinInfo, error) {
	log.Printf("🔄 正在请求AI500币种池...")

	client := &http.Client{
		Timeout: coinPoolConfig.Timeout,
	}

	resp, err := client.Get(coinPoolConfig.APIURL)
	if err != nil {
		return nil, fmt.Errorf("请求币种池API失败: %w", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("读取响应失败: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API返回错误 (status %d): %s", resp.StatusCode, string(body))
	}

	// 解析API响应
	var response CoinPoolAPIResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, fmt.Errorf("JSON解析失败: %w", err)
	}

	if !response.Success {
		return nil, fmt.Errorf("API返回失败状态")
	}

	if len(response.Data.Coins) == 0 {
		return nil, fmt.Errorf("币种列表为空")
	}

	// 设置IsAvailable标志
	coins := response.Data.Coins
	for i := range coins {
		coins[i].IsAvailable = true
	}

	log.Printf("✓ 成功获取%d个币种", len(coins))
	return coins, nil
}

// saveCoinPoolCache 保存币种池到缓存文件
func saveCoinPoolCache(coins []CoinInfo) error {
	// 确保缓存目录存在
	if err := os.MkdirAll(coinPoolConfig.CacheDir, 0755); err != nil {
		return fmt.Errorf("创建缓存目录失败: %w", err)
	}

	cache := CoinPoolCache{
		Coins:      coins,
		FetchedAt:  time.Now(),
		SourceType: "api",
	}

	data, err := json.MarshalIndent(cache, "", "  ")
	if err != nil {
		return fmt.Errorf("序列化缓存数据失败: %w", err)
	}

	cachePath := filepath.Join(coinPoolConfig.CacheDir, "latest.json")
	if err := ioutil.WriteFile(cachePath, data, 0644); err != nil {
		return fmt.Errorf("写入缓存文件失败: %w", err)
	}

	log.Printf("💾 已保存币种池缓存（%d个币种）", len(coins))
	return nil
}

// loadCoinPoolCache 从缓存文件加载币种池
func loadCoinPoolCache() ([]CoinInfo, error) {
	cachePath := filepath.Join(coinPoolConfig.CacheDir, "latest.json")

	// 检查文件是否存在
	if _, err := os.Stat(cachePath); os.IsNotExist(err) {
		return nil, fmt.Errorf("缓存文件不存在")
	}

	data, err := ioutil.ReadFile(cachePath)
	if err != nil {
		return nil, fmt.Errorf("读取缓存文件失败: %w", err)
	}

	var cache CoinPoolCache
	if err := json.Unmarshal(data, &cache); err != nil {
		return nil, fmt.Errorf("解析缓存数据失败: %w", err)
	}

	// 检查缓存年龄
	cacheAge := time.Since(cache.FetchedAt)
	if cacheAge > 24*time.Hour {
		log.Printf("⚠️  缓存数据较旧（%.1f小时前），但仍可使用", cacheAge.Hours())
	} else {
		log.Printf("📂 缓存数据时间: %s（%.1f分钟前）",
			cache.FetchedAt.Format("2006-01-02 15:04:05"),
			cacheAge.Minutes())
	}

	return cache.Coins, nil
}

// GetAvailableCoins 获取可用的币种列表（过滤不可用的）
func GetAvailableCoins() ([]string, error) {
	coins, err := GetCoinPool()
	if err != nil {
		return nil, err
	}

	var symbols []string
	for _, coin := range coins {
		if coin.IsAvailable {
			// 确保symbol格式正确（转为大写USDT交易对）
			symbol := normalizeSymbol(coin.Pair)
			symbols = append(symbols, symbol)
		}
	}

	if len(symbols) == 0 {
		return nil, fmt.Errorf("没有可用的币种")
	}

	return symbols, nil
}

// GetTopRatedCoins 获取评分最高的N个币种（按评分从大到小排序）
func GetTopRatedCoins(limit int) ([]string, error) {
	coins, err := GetCoinPool()
	if err != nil {
		return nil, err
	}

	// 过滤可用的币种
	var availableCoins []CoinInfo
	for _, coin := range coins {
		if coin.IsAvailable {
			availableCoins = append(availableCoins, coin)
		}
	}

	if len(availableCoins) == 0 {
		return nil, fmt.Errorf("没有可用的币种")
	}

	// 按Score降序排序（冒泡排序）
	for i := 0; i < len(availableCoins); i++ {
		for j := i + 1; j < len(availableCoins); j++ {
			if availableCoins[i].Score < availableCoins[j].Score {
				availableCoins[i], availableCoins[j] = availableCoins[j], availableCoins[i]
			}
		}
	}

	// 取前N个
	maxCount := limit
	if len(availableCoins) < maxCount {
		maxCount = len(availableCoins)
	}

	var symbols []string
	for i := 0; i < maxCount; i++ {
		symbol := normalizeSymbol(availableCoins[i].Pair)
		symbols = append(symbols, symbol)
	}

	return symbols, nil
}

// normalizeSymbol 标准化币种符号
func normalizeSymbol(symbol string) string {
	// 移除空格
	symbol = trimSpaces(symbol)

	// 转为大写
	symbol = toUpper(symbol)

	// 确保以USDT结尾
	if !endsWith(symbol, "USDT") {
		symbol = symbol + "USDT"
	}

	return symbol
}

// 辅助函数
func trimSpaces(s string) string {
	result := ""
	for i := 0; i < len(s); i++ {
		if s[i] != ' ' {
			result += string(s[i])
		}
	}
	return result
}

func toUpper(s string) string {
	result := ""
	for i := 0; i < len(s); i++ {
		c := s[i]
		if c >= 'a' && c <= 'z' {
			c = c - 'a' + 'A'
		}
		result += string(c)
	}
	return result
}

func endsWith(s, suffix string) bool {
	if len(s) < len(suffix) {
		return false
	}
	return s[len(s)-len(suffix):] == suffix
}

// ========== OI Top（持仓量增长Top20）数据 ==========

// OIPosition 持仓量数据
type OIPosition struct {
	Symbol            string  `json:"symbol"`
	Rank              int     `json:"rank"`
	CurrentOI         float64 `json:"current_oi"`          // 当前持仓量
	OIDelta           float64 `json:"oi_delta"`            // 持仓量变化
	OIDeltaPercent    float64 `json:"oi_delta_percent"`    // 持仓量变化百分比
	OIDeltaValue      float64 `json:"oi_delta_value"`      // 持仓量变化价值
	PriceDeltaPercent float64 `json:"price_delta_percent"` // 价格变化百分比
	NetLong           float64 `json:"net_long"`            // 净多仓
	NetShort          float64 `json:"net_short"`           // 净空仓
}

// OITopAPIResponse OI Top API返回的数据结构
type OITopAPIResponse struct {
	Success bool `json:"success"`
	Data    struct {
		Positions []OIPosition `json:"positions"`
		Count     int          `json:"count"`
		Exchange  string       `json:"exchange"`
		TimeRange string       `json:"time_range"`
	} `json:"data"`
}

// OITopCache OI Top 缓存
type OITopCache struct {
	Positions  []OIPosition `json:"positions"`
	FetchedAt  time.Time    `json:"fetched_at"`
	SourceType string       `json:"source_type"`
}

var oiTopConfig = struct {
	APIURL   string
	Timeout  time.Duration
	CacheDir string
}{
	APIURL:   "",
	Timeout:  30 * time.Second,
	CacheDir: "coin_pool_cache",
}

// 全局开关：控制是否启用AI500和OI Top
var (
	enableAI500Switch bool = true  // 默认启用
	enableOITopSwitch bool = true  // 默认启用
)

// GetOITopPositions 获取持仓量增长Top20数据（带重试和缓存）
func GetOITopPositions() ([]OIPosition, error) {
	maxRetries := 3
	var lastErr error

	// 尝试从API获取
	for attempt := 1; attempt <= maxRetries; attempt++ {
		if attempt > 1 {
			log.Printf("⚠️  第%d次重试获取OI Top数据（共%d次）...", attempt, maxRetries)
			time.Sleep(2 * time.Second)
		}

		positions, err := fetchOITop()
		if err == nil {
			if attempt > 1 {
				log.Printf("✓ 第%d次重试成功", attempt)
			}
			// 成功获取后保存到缓存
			if err := saveOITopCache(positions); err != nil {
				log.Printf("⚠️  保存OI Top缓存失败: %v", err)
			}
			return positions, nil
		}

		lastErr = err
		log.Printf("❌ 第%d次请求OI Top失败: %v", attempt, err)
	}

	// API获取失败，尝试使用缓存
	log.Printf("⚠️  OI Top API请求全部失败，尝试使用历史缓存数据...")
	cachedPositions, err := loadOITopCache()
	if err == nil {
		log.Printf("✓ 使用历史OI Top缓存数据（共%d个币种）", len(cachedPositions))
		return cachedPositions, nil
	}

	log.Printf("❌ 无法加载OI Top缓存数据: %v", err)
	return nil, fmt.Errorf("获取OI Top数据失败（API重试%d次后，缓存也不可用）: %w", maxRetries, lastErr)
}

// fetchOITop 实际执行OI Top请求
func fetchOITop() ([]OIPosition, error) {
	log.Printf("🔄 正在请求OI Top数据...")

	client := &http.Client{
		Timeout: oiTopConfig.Timeout,
	}

	resp, err := client.Get(oiTopConfig.APIURL)
	if err != nil {
		return nil, fmt.Errorf("请求OI Top API失败: %w", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("读取OI Top响应失败: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("OI Top API返回错误 (status %d): %s", resp.StatusCode, string(body))
	}

	// 解析API响应
	var response OITopAPIResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, fmt.Errorf("OI Top JSON解析失败: %w", err)
	}

	if !response.Success {
		return nil, fmt.Errorf("OI Top API返回失败状态")
	}

	if len(response.Data.Positions) == 0 {
		return nil, fmt.Errorf("OI Top持仓列表为空")
	}

	log.Printf("✓ 成功获取%d个OI Top币种（时间范围: %s）",
		len(response.Data.Positions), response.Data.TimeRange)
	return response.Data.Positions, nil
}

// saveOITopCache 保存OI Top数据到缓存
func saveOITopCache(positions []OIPosition) error {
	if err := os.MkdirAll(oiTopConfig.CacheDir, 0755); err != nil {
		return fmt.Errorf("创建缓存目录失败: %w", err)
	}

	cache := OITopCache{
		Positions:  positions,
		FetchedAt:  time.Now(),
		SourceType: "api",
	}

	data, err := json.MarshalIndent(cache, "", "  ")
	if err != nil {
		return fmt.Errorf("序列化OI Top缓存数据失败: %w", err)
	}

	cachePath := filepath.Join(oiTopConfig.CacheDir, "oi_top_latest.json")
	if err := ioutil.WriteFile(cachePath, data, 0644); err != nil {
		return fmt.Errorf("写入OI Top缓存文件失败: %w", err)
	}

	log.Printf("💾 已保存OI Top缓存（%d个币种）", len(positions))
	return nil
}

// loadOITopCache 从缓存加载OI Top数据
func loadOITopCache() ([]OIPosition, error) {
	cachePath := filepath.Join(oiTopConfig.CacheDir, "oi_top_latest.json")

	if _, err := os.Stat(cachePath); os.IsNotExist(err) {
		return nil, fmt.Errorf("OI Top缓存文件不存在")
	}

	data, err := ioutil.ReadFile(cachePath)
	if err != nil {
		return nil, fmt.Errorf("读取OI Top缓存文件失败: %w", err)
	}

	var cache OITopCache
	if err := json.Unmarshal(data, &cache); err != nil {
		return nil, fmt.Errorf("解析OI Top缓存数据失败: %w", err)
	}

	cacheAge := time.Since(cache.FetchedAt)
	if cacheAge > 24*time.Hour {
		log.Printf("⚠️  OI Top缓存数据较旧（%.1f小时前），但仍可使用", cacheAge.Hours())
	} else {
		log.Printf("📂 OI Top缓存数据时间: %s（%.1f分钟前）",
			cache.FetchedAt.Format("2006-01-02 15:04:05"),
			cacheAge.Minutes())
	}

	return cache.Positions, nil
}

// GetOITopSymbols 获取OI Top的币种符号列表
func GetOITopSymbols() ([]string, error) {
	positions, err := GetOITopPositions()
	if err != nil {
		return nil, err
	}

	var symbols []string
	for _, pos := range positions {
		symbol := normalizeSymbol(pos.Symbol)
		symbols = append(symbols, symbol)
	}

	return symbols, nil
}

// MergedCoinPool 合并的币种池（AI500 + OI Top）
type MergedCoinPool struct {
	AI500Coins    []CoinInfo          // AI500评分币种
	OITopCoins    []OIPosition        // 持仓量增长Top20
	AllSymbols    []string            // 所有不重复的币种符号
	SymbolSources map[string][]string // 每个币种的来源（"ai500"/"oi_top"）
}

// GetMergedCoinPool 获取合并后的币种池（AI500 + OI Top，去重）
func GetMergedCoinPool(ai500Limit int) (*MergedCoinPool, error) {
	// 0. 先检查是否启用并配置了API URL，如果都没有，直接使用默认币种
	ai500Enabled := enableAI500Switch && coinPoolConfig.APIURL != ""
	oiTopEnabled := enableOITopSwitch && oiTopConfig.APIURL != ""

	if !ai500Enabled && !oiTopEnabled {
		log.Printf("💡 AI500和OI Top都未启用或未配置，使用默认主流币种池（共%d个）", len(defaultMainstreamCoins))
		
		// 构建symbolSources
		symbolSources := make(map[string][]string)
		for _, symbol := range defaultMainstreamCoins {
			symbolSources[symbol] = []string{"default"}
		}
		
		merged := &MergedCoinPool{
			AI500Coins:    []CoinInfo{},
			OITopCoins:    []OIPosition{},
			AllSymbols:    defaultMainstreamCoins,
			SymbolSources: symbolSources,
		}
		
		return merged, nil
	}

	// 1. 获取AI500数据（仅在启用且配置了API时）
	var ai500TopSymbols []string
	if ai500Enabled {
		symbols, err := GetTopRatedCoins(ai500Limit)
		if err != nil {
			log.Printf("⚠️  获取AI500数据失败: %v", err)
			ai500TopSymbols = []string{} // 失败时用空列表
		} else {
			ai500TopSymbols = symbols
		}
	} else {
		if !enableAI500Switch {
			log.Printf("💡 AI500已禁用，跳过获取")
		} else {
			log.Printf("💡 未配置AI500 API，跳过获取")
		}
		ai500TopSymbols = []string{}
	}

	// 2. 获取OI Top数据（仅在启用且配置了API时）
	var oiTopSymbols []string
	if oiTopEnabled {
		symbols, err := GetOITopSymbols()
		if err != nil {
			log.Printf("⚠️  获取OI Top数据失败: %v", err)
			oiTopSymbols = []string{} // 失败时用空列表
		} else {
			oiTopSymbols = symbols
		}
	} else {
		if !enableOITopSwitch {
			log.Printf("💡 OI Top已禁用，跳过获取")
		} else {
			log.Printf("💡 未配置OI Top API，跳过获取")
		}
		oiTopSymbols = []string{}
	}

	// 3. 如果两个数据源都失败（配置了但获取失败），使用默认主流币种
	if len(ai500TopSymbols) == 0 && len(oiTopSymbols) == 0 {
		log.Printf("⚠️  AI500和OI Top都获取失败，使用默认主流币种池（共%d个）", len(defaultMainstreamCoins))
		ai500TopSymbols = defaultMainstreamCoins
	}

	// 4. 合并并去重
	symbolSet := make(map[string]bool)
	symbolSources := make(map[string][]string)

	// 添加AI500币种
	for _, symbol := range ai500TopSymbols {
		symbolSet[symbol] = true
		symbolSources[symbol] = append(symbolSources[symbol], "ai500")
	}

	// 添加OI Top币种
	for _, symbol := range oiTopSymbols {
		if !symbolSet[symbol] {
			symbolSet[symbol] = true
		}
		symbolSources[symbol] = append(symbolSources[symbol], "oi_top")
	}

	// 转换为数组
	var allSymbols []string
	for symbol := range symbolSet {
		allSymbols = append(allSymbols, symbol)
	}

	// 获取完整数据（仅在启用时获取）
	var ai500Coins []CoinInfo
	var oiTopPositions []OIPosition
	
	if ai500Enabled {
		ai500Coins, _ = GetCoinPool()
	}
	
	if oiTopEnabled {
		oiTopPositions, _ = GetOITopPositions()
	}

	merged := &MergedCoinPool{
		AI500Coins:    ai500Coins,
		OITopCoins:    oiTopPositions,
		AllSymbols:    allSymbols,
		SymbolSources: symbolSources,
	}

	log.Printf("📊 币种池合并完成: AI500=%d, OI_Top=%d, 总计(去重)=%d",
		len(ai500TopSymbols), len(oiTopSymbols), len(allSymbols))

	return merged, nil
}
