package telegram

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"nofx/news"
	"regexp"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"github.com/samber/lo"
)

// Message 表示 Telegram 消息结构
type Message struct {
	MessageID string   `json:"messageId"`
	Title     string   `json:"title"`
	Content   string   `json:"content"`
	PubDate   string   `json:"pubDate"`
	Image     string   `json:"image"`
	Tags      []string `json:"tags"`
}

// ToNews 转新闻结构
func (m Message) ToNews() news.NewsItem {
	return news.NewsItem{
		Symbol:      "",
		Headline:    m.Title,
		Summary:     m.Content,
		PublishedAt: time.Now(),
	}
}

// Channel 表示频道配置
type Channel struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

// Searcher Telegram 搜索服务
type Searcher struct {
	client   *http.Client
	baseURL  string
	channels []Channel // telegram频道
	keywords []string  // 关键词列表,暂时忽略
}

// NewSearcher 创建搜索服务实例
func NewSearcher(baseURL string, proxyURL string, channels []Channel) (*Searcher, error) {
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// 配置代理(如果提供)
	if proxyURL != "" {
		proxy, err := url.Parse(proxyURL)
		if err != nil {
			return nil, fmt.Errorf("invalid proxy URL: %w", err)
		}
		client.Transport = &http.Transport{
			Proxy: http.ProxyURL(proxy),
		}
	}

	return &Searcher{
		client:   client,
		baseURL:  baseURL,
		channels: channels,
		keywords: []string{""},
	}, nil
}

// FetchNews 按币种批量获取最新新闻；返回值按symbol分组
//
// TODO: 此处未全部实现,当前不分币种,将所有消息返回
func (s *Searcher) FetchNews(symbols []string, limit int) (map[string][]news.NewsItem, error) {
	newsItem := make(map[string][]news.NewsItem)
	for _, keyword := range s.keywords {
		mapMessages := s.SearchAllChannels(s.channels, keyword)
		for symbol, mes := range mapMessages {
			newsItem[symbol] = append(newsItem[symbol], lo.Map(mes, func(item Message, _ int) news.NewsItem { return item.ToNews() })...)
		}
	}
	return newsItem, nil
}

// SearchChannel 搜索单个频道
func (s *Searcher) SearchChannel(channelID string, keyword string) ([]Message, string, error) {
	// 构造搜索 URL
	searchURL := fmt.Sprintf("%s/%s", s.baseURL, channelID)
	if keyword != "" {
		searchURL = fmt.Sprintf("%s?q=%s", searchURL, url.QueryEscape(keyword))
	}

	// 创建 HTTP 请求
	req, err := http.NewRequest("GET", searchURL, nil)
	if err != nil {
		return nil, "", err
	}

	// 设置请求头,模拟浏览器
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9")
	req.Header.Set("Accept-Language", "zh-CN,zh;q=0.9,en;q=0.8")

	// 发送请求
	resp, err := s.client.Do(req)
	if err != nil {
		return nil, "", fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, "", fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	// 解析 HTML
	return s.parseHTML(resp.Body)
}

// parseHTML 解析 HTML 内容
func (s *Searcher) parseHTML(body io.Reader) ([]Message, string, error) {
	doc, err := goquery.NewDocumentFromReader(body)
	if err != nil {
		return nil, "", fmt.Errorf("failed to parse HTML: %w", err)
	}

	var messages []Message
	var channelLogo string

	// 提取频道 logo
	doc.Find(".tgme_header_link img").Each(func(i int, s *goquery.Selection) {
		if src, exists := s.Attr("src"); exists {
			channelLogo = src
		}
	})

	// 遍历消息
	doc.Find(".tgme_widget_message_wrap").Each(func(i int, sel *goquery.Selection) {
		message := s.extractMessage(sel)
		messages = append(messages, message)
	})

	return messages, channelLogo, nil
}

// extractMessage 从 HTML 元素中提取消息信息
func (s *Searcher) extractMessage(sel *goquery.Selection) Message {
	msg := Message{}

	// 提取消息 ID
	if dataPost, exists := sel.Find(".tgme_widget_message").Attr("data-post"); exists {
		// data-post 格式: "channelId/messageId"
		if len(dataPost) > 0 {
			parts := splitLast(dataPost, "/")
			if len(parts) == 2 {
				msg.MessageID = parts[1]
			}
		}
	}

	// 提取消息文本
	messageText := sel.Find(".js-message_text")
	if messageText.Length() > 0 {
		html, _ := messageText.Html()

		// 提取标题(第一行)
		if html != "" {
			lines := splitFirst(html, "<br/>")
			if len(lines) > 0 {
				msg.Title = stripHTML(lines[0])
			}

			// 提取内容(去除标题后的文本)
			if len(lines) > 1 {
				msg.Content = stripHTML(lines[1])
			}
		}
	}

	// 提取发布时间
	if datetime, exists := sel.Find("time").Attr("datetime"); exists {
		msg.PubDate = datetime
	}

	// 提取图片
	if style, exists := sel.Find(".tgme_widget_message_photo_wrap").Attr("style"); exists {
		msg.Image = extractImageURL(style)
	}

	// 提取标签
	sel.Find(".tgme_widget_message_text a").Each(func(i int, s *goquery.Selection) {
		text := s.Text()
		if len(text) > 0 && text[0] == '#' {
			msg.Tags = append(msg.Tags, text)
		}
	})

	return msg
}

// SearchAllChannels 并行搜索多个频道
func (s *Searcher) SearchAllChannels(channels []Channel, keyword string) map[string][]Message {
	type result struct {
		channelID string
		messages  []Message
		logo      string
		err       error
	}

	resultChan := make(chan result, len(channels))

	// 并行搜索
	for _, channel := range channels {
		go func(ch Channel) {
			messages, logo, err := s.SearchChannel(ch.ID, keyword)
			resultChan <- result{
				channelID: ch.ID,
				messages:  messages,
				logo:      logo,
				err:       err,
			}
		}(channel)
	}

	// 收集结果
	results := make(map[string][]Message)
	for i := 0; i < len(channels); i++ {
		res := <-resultChan
		if res.err == nil {
			results[res.channelID] = res.messages
		}
	}

	return results
}

// splitFirst 在第一个分隔符处分割字符串，返回最多两个部分
func splitFirst(s, sep string) []string {
	// 使用 SplitN 限制分割次数为 2
	// 当 n=2 时，返回的切片最多包含两个元素
	result := strings.SplitN(s, sep, 2)

	// 如果字符串中不包含分隔符，SplitN 会返回包含原字符串的切片
	// 这符合预期行为，直接返回即可
	return result
}

// splitLast 在最后一个分隔符处分割字符串，返回最多两个部分
func splitLast(s, sep string) []string {
	// 查找最后一个分隔符的位置
	index := strings.LastIndex(s, sep)

	if index < 0 {
		// 如果没有找到分隔符，返回包含原字符串的切片
		return []string{s}
	}

	// 根据最后一个分隔符的位置分割字符串
	part1 := s[:index]
	part2 := s[index+len(sep):]

	return []string{part1, part2}
}

// stripHTML 移除字符串中的所有 HTML 标签，只保留纯文本
func stripHTML(s string) string {
	// 将HTML标签全转换成小写（确保匹配大小写不敏感的标签）
	re := regexp.MustCompile(`\<[\S\s]+?\>`)
	s = re.ReplaceAllStringFunc(s, strings.ToLower)

	// 去除 <style> 标签及其内容
	re = regexp.MustCompile(`\<style[\S\s]+?\</style\>`)
	s = re.ReplaceAllString(s, "")

	// 去除 <script> 标签及其内容
	re = regexp.MustCompile(`\<script[\S\s]+?\</script\>`)
	s = re.ReplaceAllString(s, "")

	// 去除所有尖括号内的 HTML 代码，并换成换行符
	re = regexp.MustCompile(`\<[\S\s]+?\>`)
	s = re.ReplaceAllString(s, "\n")

	// 去除连续的换行符和空白字符
	re = regexp.MustCompile(`\s{2,}`)
	s = re.ReplaceAllString(s, "\n")

	// 去除首尾的空白字符
	return strings.TrimSpace(s)
}

func extractImageURL(style string) string {
	// 从 style 属性中提取图片 URL
	// 格式: background-image:url('...')
	return ""
}
