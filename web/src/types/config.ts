export interface AIModel {
  id: string
  name: string
  provider: string
  enabled: boolean
  has_api_key?: boolean
  apiKey?: string
  customApiUrl?: string
  customModelName?: string
  walletAddress?: string
  balanceUsdc?: string
}

export interface TelegramConfig {
  token_masked: string // Masked token like "123456:ABC***XYZ"
  is_bound: boolean // Whether a user has sent /start
  bound_chat_id?: number // The bound chat ID (if any)
  model_id?: string // AI model selected for Telegram replies
}

export interface Exchange {
  id: string // UUID (empty for supported exchange templates)
  exchange_type: string // "mexc_paper", "binance", "bybit", "okx", "hyperliquid", "aster", "lighter"
  account_name: string // User-defined account name
  name: string // Display name
  type: 'cex' | 'dex'
  enabled: boolean
  has_api_key?: boolean
  has_secret_key?: boolean
  has_passphrase?: boolean
  apiKey?: string
  secretKey?: string
  passphrase?: string // OKX specific
  testnet?: boolean
  // Hyperliquid specific
  hyperliquidWalletAddr?: string
  hyperliquidUnifiedAccount?: boolean
  hyperliquidBuilderApproved?: boolean
  hyperliquidAgentAddress?: string
  has_hyperliquid_secret?: boolean
  // Aster specific
  asterUser?: string
  asterSigner?: string
  has_aster_private_key?: boolean
  asterPrivateKey?: string
  // LIGHTER specific
  lighterWalletAddr?: string
  has_lighter_private_key?: boolean
  has_lighter_api_key_private_key?: boolean
  lighterPrivateKey?: string
  lighterApiKeyPrivateKey?: string
  lighterApiKeyIndex?: number
}

export type ExchangeAccountStatus =
  | 'ok'
  | 'disabled'
  | 'missing_credentials'
  | 'invalid_credentials'
  | 'permission_denied'
  | 'unavailable'

export interface ExchangeAccountState {
  exchange_id: string
  status: ExchangeAccountStatus
  display_balance?: string
  asset?: string
  total_equity?: number
  available_balance?: number
  checked_at: string
  error_code?: string
  error_message?: string
}

export interface ExchangeAccountStateResponse {
  states: Record<string, ExchangeAccountState>
}

export interface CreateExchangeRequest {
  exchange_type: string // "mexc_paper", "binance", "bybit", "okx", "hyperliquid", "aster", "lighter"
  account_name: string // User-defined account name
  enabled: boolean
  api_key?: string
  secret_key?: string
  passphrase?: string
  testnet?: boolean
  hyperliquid_wallet_addr?: string
  hyperliquid_unified_account?: boolean
  hyperliquid_builder_approved?: boolean
  aster_user?: string
  aster_signer?: string
  aster_private_key?: string
  lighter_wallet_addr?: string
  lighter_private_key?: string
  lighter_api_key_private_key?: string
  lighter_api_key_index?: number
}

export interface CreateTraderRequest {
  name: string
  ai_model_id: string
  exchange_id: string
  strategy_id?: string // Strategy ID (new version, uses saved strategy config)
  scan_interval_minutes?: number
  is_cross_margin?: boolean
  show_in_competition?: boolean // Whether to show in the competition arena
  // Fields below are kept for backward compatibility; new version uses strategy config
  btc_eth_leverage?: number
  altcoin_leverage?: number
  trading_symbols?: string
  custom_prompt?: string
  override_base_prompt?: boolean
  system_prompt_template?: string
  use_ai500?: boolean
  use_oi_top?: boolean
}

export interface UpdateModelConfigRequest {
  models: {
    [key: string]: {
      enabled: boolean
      api_key: string
      custom_api_url?: string
      custom_model_name?: string
    }
  }
}

export interface UpdateExchangeConfigRequest {
  exchanges: {
    [key: string]: {
      enabled: boolean
      api_key: string
      secret_key: string
      passphrase?: string
      testnet?: boolean
      // Hyperliquid specific fields
      hyperliquid_wallet_addr?: string
      hyperliquid_unified_account?: boolean
      hyperliquid_builder_approved?: boolean
      // Aster specific fields
      aster_user?: string
      aster_signer?: string
      aster_private_key?: string
      // LIGHTER specific fields
      lighter_wallet_addr?: string
      lighter_private_key?: string
      lighter_api_key_private_key?: string
      lighter_api_key_index?: number
    }
  }
}

export interface BeginnerOnboardingResponse {
  address: string
  private_key: string
  chain: string
  asset: string
  provider: string
  default_model: string
  configured_model_id: string
  balance_usdc: string
  env_saved: boolean
  env_path?: string
  reused_existing: boolean
  env_warning?: string
}

export interface CurrentBeginnerWalletResponse {
  found: boolean
  address?: string
  balance_usdc?: string
  source?: string
  claw402_status?: string
}
