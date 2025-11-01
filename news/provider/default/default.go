package news

import (
	"fmt"
	"nofx/news"
	"time"
)

// DefaultNewsProvider 默认新闻提供者实现（参考示例）
// 展示如何实现 NewsProvider 接口
type DefaultNewsProvider struct {
	// API配置（根据实际数据源调整）
	APIKey    string
	BaseURL   string
	Timeout   time.Duration
	CacheTime time.Duration

	// 可选：缓存机制
	cache map[string]cacheEntry
}

type cacheEntry struct {
	news      []news.NewsItem
	timestamp time.Time
}

// NewDefaultNewsProvider 创建默认新闻提供者
func NewDefaultNewsProvider(apiKey, baseURL string) *DefaultNewsProvider {
	return &DefaultNewsProvider{
		APIKey:    apiKey,
		BaseURL:   baseURL,
		Timeout:   30 * time.Second,
		CacheTime: 5 * time.Minute, // 5分钟缓存
		cache:     make(map[string]cacheEntry),
	}
}

// FetchNews 实现 NewsProvider 接口
// 按币种批量获取最新新闻，返回值按symbol分组
func (p *DefaultNewsProvider) FetchNews(symbols []string, limit int) (map[string][]news.NewsItem, error) {
	if len(symbols) == 0 {
		return make(map[string][]news.NewsItem), nil
	}

	result := make(map[string][]news.NewsItem)

	for _, symbol := range symbols {
		// 1. 检查缓存
		if cached, ok := p.getFromCache(symbol); ok {
			result[symbol] = cached
			continue
		}

		// 2. 从数据源获取（具体实现留空，由你后续补充）
		news, err := p.fetchFromSource(symbol, limit)
		if err != nil {
			// 单个币种失败不影响其他币种
			continue
		}

		// 3. 更新缓存
		p.updateCache(symbol, news)
		result[symbol] = news
	}

	return result, nil
}

// getFromCache 从缓存获取新闻
func (p *DefaultNewsProvider) getFromCache(symbol string) ([]news.NewsItem, bool) {
	entry, exists := p.cache[symbol]
	if !exists {
		return nil, false
	}

	// 检查缓存是否过期
	if time.Since(entry.timestamp) > p.CacheTime {
		delete(p.cache, symbol)
		return nil, false
	}

	return entry.news, true
}

// updateCache 更新缓存
func (p *DefaultNewsProvider) updateCache(symbol string, news []news.NewsItem) {
	p.cache[symbol] = cacheEntry{
		news:      news,
		timestamp: time.Now(),
	}
}

// fetchFromSource 从数据源获取新闻（具体实现由你补充）
func (p *DefaultNewsProvider) fetchFromSource(symbol string, limit int) ([]news.NewsItem, error) {
	// TODO: 实现具体的新闻获取逻辑
	// 可选的数据源：
	// 1. CryptoPanic API: https://cryptopanic.com/developers/api/
	// 2. CoinGecko Events API
	// 3. 交易所公告（币安、OKX等）
	// 4. Twitter/X API
	// 5. Reddit API
	// 6. 自定义爬虫

	// 示例返回结构（实际需要调用API）
	news := []news.NewsItem{
		{
			Symbol:      symbol,
			Headline:    fmt.Sprintf("%s 相关新闻标题", symbol),
			Source:      "CryptoPanic", // 或其他来源
			URL:         "https://example.com/news/123",
			PublishedAt: time.Now().Add(-1 * time.Hour),
			Sentiment:   0,  // -100 到 100
			Impact:      50, // 0 到 100
			Summary:     "新闻摘要内容...",
			Tags:        []string{"breaking", "market"},
		},
	}

	return news, nil
}

// 可选：实现其他辅助方法

// FilterByImpact 按影响力过滤新闻
func (p *DefaultNewsProvider) FilterByImpact(items []news.NewsItem, minImpact int) []news.NewsItem {
	filtered := make([]news.NewsItem, 0)
	for _, item := range items {
		if item.Impact >= minImpact {
			filtered = append(filtered, item)
		}
	}
	return filtered
}

// FilterByTime 按时间过滤新闻（只保留最近N小时的）
func (p *DefaultNewsProvider) FilterByTime(items []news.NewsItem, hours int) []news.NewsItem {
	cutoff := time.Now().Add(-time.Duration(hours) * time.Hour)
	filtered := make([]news.NewsItem, 0)
	for _, item := range items {
		if item.PublishedAt.After(cutoff) {
			filtered = append(filtered, item)
		}
	}
	return filtered
}
