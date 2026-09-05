// Strategy Studio Types
export interface Strategy {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
  is_public: boolean;           // Whether published in the strategy marketplace
  config_visible: boolean;      // Whether the config parameters are publicly visible
  config: StrategyConfig;
  created_at: string;
  updated_at: string;
}

// Strategy usage statistics
export interface StrategyStats {
  clone_count: number;          // Number of times cloned
  active_users: number;         // Current number of users
  top_performers?: StrategyPerformer[];  // Performance ranking
}

// Strategy user performance ranking
export interface StrategyPerformer {
  user_id: string;
  user_name: string;            // Masked user name
  total_pnl_pct: number;        // Total return percentage
  total_pnl: number;            // Total PnL amount
  win_rate: number;             // Win rate
  trade_count: number;          // Number of trades
  using_since: string;          // Start time of usage
  rank: number;                 // Rank
}

export interface PromptSectionsConfig {
  role_definition?: string;
  trading_frequency?: string;
  entry_standards?: string;
  decision_process?: string;
}

export interface StrategyConfig {
  // Strategy type: "ai_trading" (default) or "grid_trading"
  strategy_type?: 'ai_trading' | 'grid_trading';
  // Language setting: "zh" for Chinese, "en" for English
  // Determines the language used for data formatting and prompt generation
  language?: 'zh' | 'en';
  // AI trading configuration. Legacy flat fields below are accepted only for
  // old data returned before the schema was split by strategy type.
  ai_config?: AIStrategyConfig;
  coin_source?: CoinSourceConfig;
  indicators?: IndicatorConfig;
  custom_prompt?: string;
  risk_control?: RiskControlConfig;
  prompt_sections?: PromptSectionsConfig;
  // Grid trading configuration (only used when strategy_type is 'grid_trading')
  grid_config?: GridStrategyConfig | null;
  publish_config?: PublishStrategyConfig;
}

export interface AIStrategyConfig {
  coin_source: CoinSourceConfig;
  indicators: IndicatorConfig;
  custom_prompt?: string;
  risk_control: RiskControlConfig;
  prompt_sections?: PromptSectionsConfig;
}

export interface PublishStrategyConfig {
  is_public: boolean;
  config_visible: boolean;
}

// Grid trading specific configuration
export interface GridStrategyConfig {
  // Trading pair (e.g., "BTCUSDT")
  symbol: string;
  // Number of grid levels (5-50)
  grid_count: number;
  // Total investment in USDT
  total_investment: number;
  // Leverage (1-20)
  leverage: number;
  // Upper price boundary (0 = auto-calculate from ATR)
  upper_price: number;
  // Lower price boundary (0 = auto-calculate from ATR)
  lower_price: number;
  // Use ATR to auto-calculate bounds
  use_atr_bounds: boolean;
  // ATR multiplier for bound calculation (default 2.0)
  atr_multiplier: number;
  // Position distribution: "uniform" | "gaussian" | "pyramid"
  distribution: 'uniform' | 'gaussian' | 'pyramid';
  // Maximum drawdown percentage before emergency exit
  max_drawdown_pct: number;
  // Stop loss percentage per position
  stop_loss_pct: number;
  // Daily loss limit percentage
  daily_loss_limit_pct: number;
  // Use maker-only orders for lower fees
  use_maker_only: boolean;
  // Enable automatic grid direction adjustment based on box breakouts
  enable_direction_adjust?: boolean;
  // Direction bias ratio for long_bias/short_bias modes (default 0.7 = 70%/30%)
  direction_bias_ratio?: number;
}

export interface CoinSourceConfig {
  source_type: 'static' | 'ai500' | 'oi_top' | 'oi_low' | 'hyper_all' | 'hyper_main' | 'hyper_rank' | 'vergex_signal';
  static_coins?: string[];
  excluded_coins?: string[];   // List of excluded coins
  use_ai500: boolean;
  ai500_limit?: number;
  use_oi_top: boolean;
  oi_top_limit?: number;
  use_oi_low: boolean;
  oi_low_limit?: number;
  use_hyper_all?: boolean;
  use_hyper_main?: boolean;
  hyper_main_limit?: number;
  hyper_rank_category?: 'stock' | 'commodity' | 'index' | 'forex' | 'pre_ipo' | 'crypto' | 'all';
  hyper_rank_direction?: 'gainers' | 'losers' | 'volume';
  hyper_rank_limit?: number;
  vergex_limit?: number;
  vergex_market_type?: string;
  vergex_chain?: string;
  vergex_liq_band?: string;
  // Note: API URLs are now built automatically using nofxos_api_key from IndicatorConfig
}

export interface IndicatorConfig {
  klines: KlineConfig;
  // Raw OHLCV kline data - required for AI analysis
  enable_raw_klines: boolean;
  // Technical indicators (optional)
  enable_ema: boolean;
  enable_macd: boolean;
  enable_rsi: boolean;
  enable_atr: boolean;
  enable_boll: boolean;
  enable_volume: boolean;
  enable_oi: boolean;
  enable_funding_rate: boolean;
  ema_periods?: number[];
  rsi_periods?: number[];
  atr_periods?: number[];
  boll_periods?: number[];
  external_data_sources?: ExternalDataSource[];

  // ========== Unified NofxOS data source configuration ==========
  // Unified NofxOS API Key - used for all NofxOS data sources
  nofxos_api_key?: string;

  // Quant data sources (fund flow, open interest changes, price changes)
  enable_quant_data?: boolean;
  enable_quant_oi?: boolean;
  enable_quant_netflow?: boolean;

  // OI ranking data (market open interest increase/decrease ranking)
  enable_oi_ranking?: boolean;
  oi_ranking_duration?: string;  // "1h", "4h", "24h"
  oi_ranking_limit?: number;

  // NetFlow ranking data (institutional/retail fund flow ranking)
  enable_netflow_ranking?: boolean;
  netflow_ranking_duration?: string;  // "1h", "4h", "24h"
  netflow_ranking_limit?: number;

  // Price ranking data (gainers/losers ranking)
  enable_price_ranking?: boolean;
  price_ranking_duration?: string;  // "1h", "4h", "24h" or "1h,4h,24h"
  price_ranking_limit?: number;
}

export interface KlineConfig {
  primary_timeframe: string;
  primary_count: number;
  longer_timeframe?: string;
  longer_count?: number;
  enable_multi_timeframe: boolean;
  // Added: support selecting multiple timeframes
  selected_timeframes?: string[];
}

export interface ExternalDataSource {
  name: string;
  type: 'api' | 'webhook';
  url: string;
  method: string;
  headers?: Record<string, string>;
  data_path?: string;
  refresh_secs?: number;
  // x402 payment (opt-in). When payment is "x402", both caps are required:
  // max_usd_per_call bounds one authorization, max_usd_per_day bounds
  // cumulative spend per source per UTC day.
  payment?: 'x402';
  max_usd_per_call?: number;
  max_usd_per_day?: number;
}

export interface RiskControlConfig {
  // Max number of coins held simultaneously (CODE ENFORCED)
  max_positions: number;

  // Trading Leverage - exchange leverage for opening positions (AI guided)
  btc_eth_max_leverage: number;    // BTC/ETH max exchange leverage
  altcoin_max_leverage: number;    // Altcoin max exchange leverage

  // Position Value Ratio - single position notional value / account equity (CODE ENFORCED)
  // Max position value = equity × this ratio
  btc_eth_max_position_value_ratio?: number;     // default: 5 (hard per-position cap)
  altcoin_max_position_value_ratio?: number;     // default: 5 (hard per-position cap)

  // Risk Parameters
  max_margin_usage: number;        // Max margin utilization, e.g. 0.9 = 90% (CODE ENFORCED)
  min_position_size: number;       // Min position size in USDT (CODE ENFORCED)
  min_risk_reward_ratio: number;   // Min take_profit / stop_loss ratio (AI guided)
  min_confidence: number;          // Min AI confidence to open position (AI guided)
}
