package config

import (
	"encoding/json"
	"fmt"
	"os"
	"time"
)

// TraderConfig 单个trader的配置
type TraderConfig struct {
	ID                  string  `json:"id"`
	Name                string  `json:"name"`
	AIModel             string  `json:"ai_model"` // "qwen" or "deepseek"
	BinanceAPIKey       string  `json:"binance_api_key"`
	BinanceSecretKey    string  `json:"binance_secret_key"`
	QwenKey             string  `json:"qwen_key,omitempty"`
	DeepSeekKey         string  `json:"deepseek_key,omitempty"`
	InitialBalance      float64 `json:"initial_balance"`
	ScanIntervalMinutes int     `json:"scan_interval_minutes"`
}

// Config 总配置
type Config struct {
	Traders            []TraderConfig `json:"traders"`
	CoinPoolAPIURL     string         `json:"coin_pool_api_url"`
	OITopAPIURL        string         `json:"oi_top_api_url"`
	APIServerPort      int            `json:"api_server_port"`
	MaxDailyLoss       float64        `json:"max_daily_loss"`
	MaxDrawdown        float64        `json:"max_drawdown"`
	StopTradingMinutes int            `json:"stop_trading_minutes"`
}

// LoadConfig 从文件加载配置
func LoadConfig(filename string) (*Config, error) {
	data, err := os.ReadFile(filename)
	if err != nil {
		return nil, fmt.Errorf("读取配置文件失败: %w", err)
	}

	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("解析配置文件失败: %w", err)
	}

	// 验证配置
	if err := config.Validate(); err != nil {
		return nil, fmt.Errorf("配置验证失败: %w", err)
	}

	return &config, nil
}

// Validate 验证配置有效性
func (c *Config) Validate() error {
	if len(c.Traders) == 0 {
		return fmt.Errorf("至少需要配置一个trader")
	}

	traderIDs := make(map[string]bool)
	for i, trader := range c.Traders {
		if trader.ID == "" {
			return fmt.Errorf("trader[%d]: ID不能为空", i)
		}
		if traderIDs[trader.ID] {
			return fmt.Errorf("trader[%d]: ID '%s' 重复", i, trader.ID)
		}
		traderIDs[trader.ID] = true

		if trader.Name == "" {
			return fmt.Errorf("trader[%d]: Name不能为空", i)
		}
		if trader.AIModel != "qwen" && trader.AIModel != "deepseek" {
			return fmt.Errorf("trader[%d]: ai_model必须是 'qwen' 或 'deepseek'", i)
		}
		if trader.BinanceAPIKey == "" || trader.BinanceSecretKey == "" {
			return fmt.Errorf("trader[%d]: 币安API密钥不能为空", i)
		}
		if trader.AIModel == "qwen" && trader.QwenKey == "" {
			return fmt.Errorf("trader[%d]: 使用Qwen时必须配置qwen_key", i)
		}
		if trader.AIModel == "deepseek" && trader.DeepSeekKey == "" {
			return fmt.Errorf("trader[%d]: 使用DeepSeek时必须配置deepseek_key", i)
		}
		if trader.InitialBalance <= 0 {
			return fmt.Errorf("trader[%d]: initial_balance必须大于0", i)
		}
		if trader.ScanIntervalMinutes <= 0 {
			trader.ScanIntervalMinutes = 3 // 默认3分钟
		}
	}

	if c.APIServerPort <= 0 {
		c.APIServerPort = 8080 // 默认8080端口
	}

	return nil
}

// GetScanInterval 获取扫描间隔
func (tc *TraderConfig) GetScanInterval() time.Duration {
	return time.Duration(tc.ScanIntervalMinutes) * time.Minute
}
