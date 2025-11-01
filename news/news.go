package news

import (
	"fmt"
	"time"
)

const (
	// ProviderTelegrame 电报
	ProviderTelegram = "telegram"
)

// NewsItem 表示一条新闻条目的核心数据结构。
// 该结构体通常用于金融资讯、舆情分析等场景，存储新闻的元数据、内容及情感分析结果。
type NewsItem struct {
	// Symbol 代表与该新闻相关的金融产品代码（如股票代码 "AAPL"）。
	// 该字段是新闻关联资产的关键标识符。
	Symbol string `json:"symbol"`

	// Headline 是新闻的标题。
	// 此字段为必填项，应简洁概括新闻主要内容。
	Headline string `json:"headline"`

	// Source 指明新闻的发布来源（例如："路透社"、"彭博社"）。
	// 该字段为可选字段，若为空则不会在 JSON 输出中体现。
	Source string `json:"source,omitempty"`

	// URL 是新闻原文的完整链接。
	// 该字段为可选字段，若为空则不会在 JSON 输出中体现。
	URL string `json:"url,omitempty"`

	// PublishedAt 记录新闻准确的发布时间。
	// 使用 time.Time 类型以确保时间数据的一致性和可序列化。
	PublishedAt time.Time `json:"published_at"`

	// Sentiment 表示对新闻内容进行情感分析得出的分值。
	// 取值范围为 -100 到 100，其中 -100 代表极度负面，100 代表极度正面，0 为中性。
	// 该字段为可选字段，若未进行分析则不会在 JSON 输出中体现。
	Sentiment int `json:"sentiment,omitempty"`

	// Impact 评估该新闻可能对市场产生的影响程度。
	// 取值范围为 0 到 100，数值越大表示潜在影响越大。
	// 该字段为可选字段，若未进行评估则不会在 JSON 输出中体现。
	Impact int `json:"impact,omitempty"`

	// Summary 是新闻内容的简要摘要或关键要点。
	// 该字段为可选字段，若为空则不会在 JSON 输出中体现。
	Summary string `json:"summary,omitempty"`

	// Tags 是与新闻内容相关的关键词标签列表（例如：["科技", "财报", "Apple"]）。
	// 该字段为可选字段，若为空切片则不会在 JSON 输出中体现。
	Tags []string `json:"tags,omitempty"`
}

func (ni NewsItem) String() string {
	return fmt.Sprintf("代币符号: %s\n标题: %s\n来源: %s\n发布时间: %s\n情感分数: %d\n影响指数: %d\n摘要: %s\n标签: %v\n%s\n",
		ni.Symbol,
		ni.Headline,
		ni.Source,
		ni.PublishedAt.Format("2006-01-02 15:04:05"),
		ni.Sentiment,
		ni.Impact,
		ni.Summary,
		ni.Tags,
		"-----------",
	)
}

// Provider 新闻提供者接口（由调用方实现）
type Provider interface {
	// FetchNews 按币种批量获取最新新闻；返回值按symbol分组
	FetchNews(symbols []string, limit int) (map[string][]NewsItem, error)
}
