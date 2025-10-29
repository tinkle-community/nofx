package pool

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// HyperliquidOIData Hyperliquid OI数据结构
type HyperliquidOIData struct {
	Name string  `json:"name"`
	OI   string  `json:"oi"`
}

// HyperliquidOIPosition Hyperliquid OI持仓数据
type HyperliquidOIPosition struct {
	Symbol    string  `json:"symbol"`
	OI        float64 `json:"oi"`
	Timestamp int64   `json:"timestamp"`
}

// HyperliquidOICache Hyperliquid OI缓存
type HyperliquidOICache struct {
	Positions  []HyperliquidOIPosition `json:"positions"`
	FetchedAt  time.Time               `json:"fetched_at"`
	SourceType string                  `json:"source_type"`
}

var hyperliquidOIConfig = struct {
	APIURL   string
	Timeout  time.Duration
	CacheDir string
}{
	APIURL:   "https://api.hyperliquid.xyz/info",
	Timeout:  30 * time.Second,
	CacheDir: "coin_pool_cache",
}

// GetHyperliquidOIData 获取Hyperliquid OI数据
func GetHyperliquidOIData() ([]HyperliquidOIPosition, error) {
	maxRetries := 3
	var lastErr error

	// 尝试从API获取
	for attempt := 1; attempt <= maxRetries; attempt++ {
		if attempt > 1 {
			log.Printf("⚠️  第%d次重试获取Hyperliquid OI数据（共%d次）...", attempt, maxRetries)
			time.Sleep(2 * time.Second)
		}

		positions, err := fetchHyperliquidOI()
		if err == nil {
			if attempt > 1 {
				log.Printf("✓ 第%d次重试成功", attempt)
			}
			// 成功获取后保存到缓存
			if err := saveHyperliquidOICache(positions); err != nil {
				log.Printf("⚠️  保存Hyperliquid OI缓存失败: %v", err)
			}
			return positions, nil
		}

		lastErr = err
		log.Printf("❌ 第%d次请求Hyperliquid OI失败: %v", attempt, err)
	}

	// API获取失败，尝试使用缓存
	log.Printf("⚠️  Hyperliquid OI API请求全部失败，尝试使用历史缓存数据...")
	cachedPositions, err := loadHyperliquidOICache()
	if err == nil {
		log.Printf("✓ 使用历史Hyperliquid OI缓存数据（共%d个币种）", len(cachedPositions))
		return cachedPositions, nil
	}

	// 缓存也失败，返回空列表
	log.Printf("⚠️  无法加载Hyperliquid OI缓存数据（最后错误: %v），跳过Hyperliquid OI数据", lastErr)
	return []HyperliquidOIPosition{}, nil
}

// fetchHyperliquidOI 实际执行Hyperliquid OI请求
func fetchHyperliquidOI() ([]HyperliquidOIPosition, error) {
	log.Printf("🔄 正在请求Hyperliquid OI数据...")

	client := &http.Client{
		Timeout: hyperliquidOIConfig.Timeout,
	}

	// 构建请求体
	requestBody := map[string]string{
		"type": "metaAndAssetCtxs",
	}
	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("构建请求体失败: %w", err)
	}

	resp, err := client.Post(hyperliquidOIConfig.APIURL, "application/json", strings.NewReader(string(jsonData)))
	if err != nil {
		return nil, fmt.Errorf("请求Hyperliquid OI API失败: %w", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("读取Hyperliquid OI响应失败: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Hyperliquid OI API返回错误 (status %d): %s", resp.StatusCode, string(body))
	}

	// 解析API响应
	var response []interface{}
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, fmt.Errorf("Hyperliquid OI JSON解析失败: %w", err)
	}

	if len(response) < 2 {
		return nil, fmt.Errorf("Hyperliquid OI响应格式错误")
	}

	// 解析universe数据
	universeData, ok := response[0].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("Hyperliquid OI universe数据格式错误")
	}

	universe, ok := universeData["universe"].([]interface{})
	if !ok {
		return nil, fmt.Errorf("Hyperliquid OI universe数组格式错误")
	}

	// 解析assetCtxs数据
	assetCtxs, ok := response[1].([]interface{})
	if !ok {
		return nil, fmt.Errorf("Hyperliquid OI assetCtxs数据格式错误")
	}

	if len(universe) != len(assetCtxs) {
		return nil, fmt.Errorf("Hyperliquid OI数据长度不匹配")
	}

	// 构建结果
	var positions []HyperliquidOIPosition
	for i, universeItem := range universe {
		universeMap, ok := universeItem.(map[string]interface{})
		if !ok {
			continue
		}

		assetCtxMap, ok := assetCtxs[i].(map[string]interface{})
		if !ok {
			continue
		}

		name, ok := universeMap["name"].(string)
		if !ok {
			continue
		}

		openInterest, ok := assetCtxMap["openInterest"].(string)
		if !ok {
			continue
		}

		oi, err := strconv.ParseFloat(openInterest, 64)
		if err != nil {
			continue
		}

		// 转换为USDT交易对格式
		symbol := name + "USDT"
		positions = append(positions, HyperliquidOIPosition{
			Symbol:    symbol,
			OI:        oi,
			Timestamp: time.Now().Unix(),
		})
	}

	if len(positions) == 0 {
		return nil, fmt.Errorf("Hyperliquid OI持仓列表为空")
	}

	log.Printf("✓ 成功获取%d个Hyperliquid OI币种", len(positions))
	return positions, nil
}

// saveHyperliquidOICache 保存Hyperliquid OI数据到缓存
func saveHyperliquidOICache(positions []HyperliquidOIPosition) error {
	if err := os.MkdirAll(hyperliquidOIConfig.CacheDir, 0755); err != nil {
		return fmt.Errorf("创建缓存目录失败: %w", err)
	}

	cache := HyperliquidOICache{
		Positions:  positions,
		FetchedAt:  time.Now(),
		SourceType: "api",
	}

	data, err := json.MarshalIndent(cache, "", "  ")
	if err != nil {
		return fmt.Errorf("序列化缓存数据失败: %w", err)
	}

	cachePath := filepath.Join(hyperliquidOIConfig.CacheDir, "hyperliquid_oi_latest.json")
	if err := ioutil.WriteFile(cachePath, data, 0644); err != nil {
		return fmt.Errorf("写入缓存文件失败: %w", err)
	}

	log.Printf("💾 已保存Hyperliquid OI缓存（%d个币种）", len(positions))
	return nil
}

// loadHyperliquidOICache 从缓存文件加载Hyperliquid OI数据
func loadHyperliquidOICache() ([]HyperliquidOIPosition, error) {
	cachePath := filepath.Join(hyperliquidOIConfig.CacheDir, "hyperliquid_oi_latest.json")

	// 检查文件是否存在
	if _, err := os.Stat(cachePath); os.IsNotExist(err) {
		return nil, fmt.Errorf("缓存文件不存在")
	}

	data, err := ioutil.ReadFile(cachePath)
	if err != nil {
		return nil, fmt.Errorf("读取缓存文件失败: %w", err)
	}

	var cache HyperliquidOICache
	if err := json.Unmarshal(data, &cache); err != nil {
		return nil, fmt.Errorf("解析缓存数据失败: %w", err)
	}

	// 检查缓存年龄
	cacheAge := time.Since(cache.FetchedAt)
	if cacheAge > 24*time.Hour {
		log.Printf("⚠️  Hyperliquid OI缓存数据较旧（%.1f小时前），但仍可使用", cacheAge.Hours())
	} else {
		log.Printf("📂 Hyperliquid OI缓存数据时间: %s（%.1f分钟前）",
			cache.FetchedAt.Format("2006-01-02 15:04:05"),
			cacheAge.Minutes())
	}

	return cache.Positions, nil
}
