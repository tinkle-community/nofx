package api

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"nofx/logger"
	"nofx/store"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const (
	maxManualBTCETHLeverage = 20
	maxManualAltLeverage    = 20
)

// AI trader management related structures
type CreateTraderRequest struct {
	Name                string  `json:"name" binding:"required"`
	AIModelID           string  `json:"ai_model_id" binding:"required"`
	ExchangeID          string  `json:"exchange_id" binding:"required"`
	StrategyID          string  `json:"strategy_id"` // Strategy ID (new version)
	InitialBalance      float64 `json:"initial_balance"`
	ScanIntervalMinutes int     `json:"scan_interval_minutes"`
	IsCrossMargin       *bool   `json:"is_cross_margin"`     // Pointer type, nil means use default value true
	ShowInCompetition   *bool   `json:"show_in_competition"` // Pointer type, nil means use default value true
	// The following fields are kept for backward compatibility, new version uses strategy config
	BTCETHLeverage       int    `json:"btc_eth_leverage"`
	AltcoinLeverage      int    `json:"altcoin_leverage"`
	TradingSymbols       string `json:"trading_symbols"`
	CustomPrompt         string `json:"custom_prompt"`
	OverrideBasePrompt   bool   `json:"override_base_prompt"`
	SystemPromptTemplate string `json:"system_prompt_template"` // System prompt template name
	UseAI500             bool   `json:"use_ai500"`
	UseOITop             bool   `json:"use_oi_top"`
}

// UpdateTraderRequest Update trader request
type UpdateTraderRequest struct {
	Name                string  `json:"name" binding:"required"`
	AIModelID           string  `json:"ai_model_id" binding:"required"`
	ExchangeID          string  `json:"exchange_id" binding:"required"`
	StrategyID          string  `json:"strategy_id"` // Strategy ID (new version)
	InitialBalance      float64 `json:"initial_balance"`
	ScanIntervalMinutes int     `json:"scan_interval_minutes"`
	IsCrossMargin       *bool   `json:"is_cross_margin"`
	ShowInCompetition   *bool   `json:"show_in_competition"`
	// The following fields are kept for backward compatibility, new version uses strategy config
	BTCETHLeverage       int    `json:"btc_eth_leverage"`
	AltcoinLeverage      int    `json:"altcoin_leverage"`
	TradingSymbols       string `json:"trading_symbols"`
	CustomPrompt         string `json:"custom_prompt"`
	OverrideBasePrompt   bool   `json:"override_base_prompt"`
	SystemPromptTemplate string `json:"system_prompt_template"`
}

func formatTraderCreationError(reason, nextStep string) string {
	if nextStep == "" {
		return fmt.Sprintf("Failed to create the bot this time: %s.", reason)
	}
	return fmt.Sprintf("Failed to create the bot this time: %s. %s.", reason, nextStep)
}

func traderCreationRequestError(reason string) string {
	return formatTraderCreationError(reason, "Please check the information you just entered and submit again")
}

func validateTraderLeverageRange(btcEthLeverage, altcoinLeverage int) (string, string) {
	if btcEthLeverage < 0 || btcEthLeverage > maxManualBTCETHLeverage {
		return traderCreationRequestError("BTC/ETH leverage must be between 1x and 20x"), "trader.create.invalid_btc_eth_leverage"
	}
	if altcoinLeverage < 0 || altcoinLeverage > maxManualAltLeverage {
		return traderCreationRequestError("Altcoin leverage must be between 1x and 20x"), "trader.create.invalid_altcoin_leverage"
	}
	return "", ""
}

func isSupportedTraderSymbol(symbol string) bool {
	normalized := strings.ToUpper(strings.TrimSpace(symbol))
	if normalized == "" {
		return true
	}
	return strings.HasSuffix(normalized, "USDT") || strings.HasSuffix(normalized, "-USDC") || strings.HasPrefix(normalized, "XYZ:")
}

func exchangeDisplayName(exchange *store.Exchange) string {
	if exchange == nil {
		return "the selected exchange account"
	}
	if exchange.AccountName != "" {
		return fmt.Sprintf("%s (%s)", exchange.Name, exchange.AccountName)
	}
	if exchange.Name != "" {
		return exchange.Name
	}
	return "the selected exchange account"
}

func missingExchangeFields(exchange *store.Exchange) []string {
	if exchange == nil {
		return nil
	}

	var missing []string
	switch exchange.ExchangeType {
	case "mexc_paper":
		return nil
	case "binance", "bybit", "gate", "indodax":
		if exchange.APIKey == "" {
			missing = append(missing, "API Key")
		}
		if exchange.SecretKey == "" {
			missing = append(missing, "Secret Key")
		}
	case "okx", "bitget", "kucoin":
		if exchange.APIKey == "" {
			missing = append(missing, "API Key")
		}
		if exchange.SecretKey == "" {
			missing = append(missing, "Secret Key")
		}
		if exchange.Passphrase == "" {
			missing = append(missing, "Passphrase")
		}
	case "hyperliquid":
		if exchange.APIKey == "" {
			missing = append(missing, "Private Key")
		}
		if strings.TrimSpace(exchange.HyperliquidWalletAddr) == "" {
			missing = append(missing, "Wallet Address")
		}
	case "aster":
		if strings.TrimSpace(exchange.AsterUser) == "" {
			missing = append(missing, "Aster User")
		}
		if strings.TrimSpace(exchange.AsterSigner) == "" {
			missing = append(missing, "Aster Signer")
		}
		if exchange.AsterPrivateKey == "" {
			missing = append(missing, "Aster Private Key")
		}
	case "lighter":
		if strings.TrimSpace(exchange.LighterWalletAddr) == "" {
			missing = append(missing, "Wallet Address")
		}
		if exchange.LighterAPIKeyPrivateKey == "" {
			missing = append(missing, "API Key Private Key")
		}
	}

	return missing
}

func mapStringPairs(kv ...string) map[string]string {
	if len(kv) == 0 {
		return nil
	}

	params := make(map[string]string, len(kv)/2)
	for i := 0; i+1 < len(kv); i += 2 {
		params[kv[i]] = kv[i+1]
	}
	return params
}

func validateExchangeForTraderCreation(exchange *store.Exchange) (string, string, map[string]string) {
	if exchange == nil {
		return formatTraderCreationError("The exchange account you selected was not found", "Please go to \"Settings > Exchange Config\" and add an available account first, then come back to create the bot"),
			"trader.create.exchange_not_found", nil
	}
	if !exchange.Enabled {
		return formatTraderCreationError(
			fmt.Sprintf("Exchange account \"%s\" is currently disabled", exchangeDisplayName(exchange)),
			"Please go to \"Settings > Exchange Config\" to enable this account, then create the bot again",
		), "trader.create.exchange_disabled", mapStringPairs("exchange_name", exchangeDisplayName(exchange))
	}

	missing := missingExchangeFields(exchange)
	if len(missing) > 0 {
		return formatTraderCreationError(
				fmt.Sprintf("The configuration for exchange account \"%s\" is incomplete, missing %s", exchangeDisplayName(exchange), strings.Join(missing, ", ")),
				"Please go to \"Settings > Exchange Config\" to complete the required information for this account, then create the bot again",
			), "trader.create.exchange_missing_fields", mapStringPairs(
				"exchange_name", exchangeDisplayName(exchange),
				"missing_fields", strings.Join(missing, ", "),
			)
	}

	switch exchange.ExchangeType {
	case "binance", "bybit", "okx", "bitget", "gate", "kucoin", "hyperliquid", "aster", "lighter", "indodax", "mexc_paper":
		return "", "", nil
	default:
		return formatTraderCreationError(
				fmt.Sprintf("Exchange account \"%s\" uses type %s, which is not supported in the current version", exchangeDisplayName(exchange), exchange.ExchangeType),
				"Please switch to an exchange account supported by the current version, then create the bot again",
			), "trader.create.exchange_unsupported", mapStringPairs(
				"exchange_name", exchangeDisplayName(exchange),
				"exchange_type", exchange.ExchangeType,
			)
	}
}

func classifyTraderSetupReason(reason string) (string, string) {
	trimmed := strings.TrimSpace(reason)
	if trimmed == "" {
		return "", ""
	}

	lower := strings.ToLower(trimmed)

	switch {
	case strings.Contains(lower, "failed to parse strategy config"),
		strings.Contains(lower, "failed to parse strategy configuration"):
		return "trader.reason.strategy_config_invalid", "The current strategy configuration is corrupted and the system cannot parse it for now"
	case strings.Contains(lower, "has no strategy configured"):
		return "trader.reason.strategy_missing", "The current bot is missing a valid trading strategy configuration"
	case strings.Contains(lower, "failed to parse private key"),
		(strings.Contains(lower, "invalid hex character") && strings.Contains(lower, "private key")):
		return "trader.reason.private_key_invalid", "The private key format is incorrect and the system cannot recognize it"
	case strings.Contains(lower, "failed to initialize hyperliquid trader"):
		return "trader.reason.hyperliquid_init_failed", "Hyperliquid account initialization failed; please confirm the private key, main wallet address, and Agent Wallet configuration are correct"
	case strings.Contains(lower, "failed to initialize aster trader"):
		return "trader.reason.aster_init_failed", "Aster account initialization failed; please confirm the Aster User, Signer, and private key are correct"
	case strings.Contains(lower, "failed to get meta information"):
		return "trader.reason.exchange_meta_unavailable", "The system cannot read account meta information from the exchange for now"
	case strings.Contains(lower, "security check failed") && strings.Contains(lower, "agent wallet balance too high"):
		return "trader.reason.hyperliquid_agent_balance_too_high", "The Hyperliquid Agent Wallet balance is too high and does not meet the current security requirements"
	case strings.Contains(lower, "failed to initialize account"):
		return "trader.reason.exchange_account_init_failed", "Exchange account initialization failed; please confirm the wallet address and API Key match"
	case strings.Contains(lower, "unsupported trading platform"):
		return "trader.reason.exchange_unsupported", "The current exchange type does not support bot initialization"
	case strings.Contains(lower, "initial balance not set and unable to fetch balance from exchange"):
		return "trader.reason.exchange_balance_unavailable", "The system cannot read the account balance from the exchange for now"
	case strings.Contains(lower, "timeout"), strings.Contains(lower, "no such host"), strings.Contains(lower, "connection refused"):
		return "trader.reason.exchange_service_unreachable", "The system cannot connect to the exchange service for now"
	default:
		return "trader.reason.unknown", trimmed
	}
}

func humanizeTraderSetupReason(reason string) string {
	_, message := classifyTraderSetupReason(reason)
	return message
}

func traderSetupReasonParams(err error, fallback string, kv ...string) map[string]string {
	params := mapStringPairs(kv...)
	rawReason := SanitizeError(err, fallback)
	reasonKey, reasonMessage := classifyTraderSetupReason(rawReason)
	if reasonMessage == "" && fallback != "" {
		reasonMessage = fallback
	}
	if reasonMessage != "" {
		if params == nil {
			params = map[string]string{}
		}
		params["reason"] = reasonMessage
	}
	if reasonKey != "" {
		if params == nil {
			params = map[string]string{}
		}
		params["reason_key"] = reasonKey
	}
	return params
}

func describeTraderLoadError(traderName string, err error) string {
	if err == nil {
		return formatTraderCreationError("The bot configuration was saved, but the runtime instance failed to initialize", "Please check that the model, strategy, and exchange configuration are complete, then try again")
	}

	reason := humanizeTraderSetupReason(SanitizeError(err, ""))
	if reason == "" {
		return formatTraderCreationError(
			fmt.Sprintf("Bot \"%s\" failed to start when initializing its runtime instance", traderName),
			"Please check that the model, strategy, and exchange configuration are complete, then try again",
		)
	}

	return formatTraderCreationError(
		fmt.Sprintf("Bot \"%s\" failed to start when initializing its runtime instance, because: %s", traderName, reason),
		"Please check that the model, strategy, and exchange configuration are complete, then try again",
	)
}

func describeTraderCreationWarning(traderName string, err error) string {
	if err == nil {
		return fmt.Sprintf("Bot \"%s\" has been saved, but it has not yet passed the pre-start validation. Please check the model, strategy, and exchange configuration first, then click start after fixing them.", traderName)
	}

	reason := humanizeTraderSetupReason(SanitizeError(err, ""))
	if reason == "" {
		return fmt.Sprintf("Bot \"%s\" has been saved, but it cannot start for now. Please check the model, strategy, and exchange configuration first, then click start after fixing them.", traderName)
	}

	return fmt.Sprintf("Bot \"%s\" has been saved, but it cannot start for now, because: %s. Please check the model, strategy, and exchange configuration first, then click start after fixing them.", traderName, reason)
}

func describeTraderStartError(traderName string, err error) string {
	if err == nil {
		return fmt.Sprintf("Failed to start the bot this time: bot \"%s\" cannot start for now. Please check the model, strategy, and exchange configuration, then click start again.", traderName)
	}

	reason := humanizeTraderSetupReason(SanitizeError(err, ""))
	if reason == "" {
		return fmt.Sprintf("Failed to start the bot this time: bot \"%s\" cannot start for now. Please check the model, strategy, and exchange configuration, then click start again.", traderName)
	}

	return fmt.Sprintf("Failed to start the bot this time: bot \"%s\" cannot start for now, because: %s. Please check the model, strategy, and exchange configuration, then click start again.", traderName, reason)
}

func formatTraderStartError(reason, nextStep string) string {
	if nextStep == "" {
		return fmt.Sprintf("Failed to start the bot this time: %s.", reason)
	}
	return fmt.Sprintf("Failed to start the bot this time: %s. %s.", reason, nextStep)
}

// handleCreateTrader Create new AI trader
func (s *Server) handleCreateTrader(c *gin.Context) {
	userID := c.GetString("user_id")
	var req CreateTraderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		SafeBadRequestWithDetails(c, traderCreationRequestError("The submitted information is incomplete or has an invalid format"), "trader.create.invalid_request", nil)
		return
	}

	// Validate leverage values against the same limits exposed by manual user config.
	if errMsg, errCode := validateTraderLeverageRange(req.BTCETHLeverage, req.AltcoinLeverage); errMsg != "" {
		SafeBadRequestWithDetails(c, errMsg, errCode, nil)
		return
	}

	// Validate trading symbol format. Hyperliquid xyz dex markets (stocks,
	// commodities, indices, FX, Pre-IPO) are user-facing SYMBOL-USDC pairs,
	// while standard crypto/perp markets keep the legacy USDT suffix format.
	if req.TradingSymbols != "" {
		symbols := strings.Split(req.TradingSymbols, ",")
		for _, symbol := range symbols {
			symbol = strings.TrimSpace(symbol)
			if !isSupportedTraderSymbol(symbol) {
				SafeBadRequestWithDetails(c, traderCreationRequestError(
					fmt.Sprintf("The trading pair %s has an invalid format; only USDT perpetuals or Hyperliquid XYZ USDC instruments (SYMBOL-USDC) are currently supported", symbol),
				), "trader.create.invalid_symbol", mapStringPairs("symbol", symbol))
				return
			}
		}
	}

	model, err := s.store.AIModel().Get(userID, req.AIModelID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			SafeBadRequestWithDetails(c, formatTraderCreationError("The AI model you selected was not found", "Please go to \"Settings > Model Config\" to add and enable an available model first, then come back to create the bot"), "trader.create.model_not_found", nil)
			return
		}
		SafeError(c, http.StatusInternalServerError,
			formatTraderCreationError("Unable to read your AI model configuration for now", "Please retry later; if the problem persists, check whether the local service is running normally"),
			err,
		)
		return
	}
	if !model.Enabled {
		SafeBadRequestWithDetails(c, formatTraderCreationError(
			fmt.Sprintf("AI model \"%s\" is not enabled yet", model.Name),
			"Please go to \"Settings > Model Config\" to enable it, then create the bot again",
		), "trader.create.model_disabled", mapStringPairs("model_name", model.Name))
		return
	}
	if model.APIKey == "" {
		SafeBadRequestWithDetails(c, formatTraderCreationError(
			fmt.Sprintf("AI model \"%s\" is missing an API Key or payment credentials", model.Name),
			"Please go to \"Settings > Model Config\" to complete the model credentials, then create the bot again",
		), "trader.create.model_missing_credentials", mapStringPairs("model_name", model.Name))
		return
	}

	if req.StrategyID == "" {
		SafeBadRequestWithDetails(c, formatTraderCreationError("You have not selected a trading strategy yet", "Please select a strategy first, then continue creating the bot"), "trader.create.strategy_required", nil)
		return
	}

	if req.StrategyID != "" {
		_, err = s.store.Strategy().Get(userID, req.StrategyID)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				SafeBadRequestWithDetails(c, formatTraderCreationError("The strategy you selected does not exist or has been deleted", "Please select another available strategy, then continue creating the bot"), "trader.create.strategy_not_found", nil)
				return
			}
			SafeError(c, http.StatusInternalServerError,
				formatTraderCreationError("Unable to read the strategy configuration you selected for now", "Please retry later; if the problem persists, check whether the local service is running normally"),
				err,
			)
			return
		}
	}

	// Generate trader ID (use short UUID prefix for readability)
	exchangeIDShort := req.ExchangeID
	if len(exchangeIDShort) > 8 {
		exchangeIDShort = exchangeIDShort[:8]
	}
	traderID := fmt.Sprintf("%s_%s_%d", exchangeIDShort, req.AIModelID, time.Now().Unix())

	// Set default values
	isCrossMargin := true // Default to cross margin mode
	if req.IsCrossMargin != nil {
		isCrossMargin = *req.IsCrossMargin
	}

	showInCompetition := true // Default to show in competition
	if req.ShowInCompetition != nil {
		showInCompetition = *req.ShowInCompetition
	}

	// Set leverage default values
	btcEthLeverage := 10 // Default value
	altcoinLeverage := 5 // Default value
	if req.BTCETHLeverage > 0 {
		btcEthLeverage = req.BTCETHLeverage
	}
	if req.AltcoinLeverage > 0 {
		altcoinLeverage = req.AltcoinLeverage
	}

	// Set system prompt template default value
	systemPromptTemplate := "default"
	if req.SystemPromptTemplate != "" {
		systemPromptTemplate = req.SystemPromptTemplate
	}

	// Set scan interval default value
	scanIntervalMinutes := req.ScanIntervalMinutes
	if scanIntervalMinutes <= 0 {
		scanIntervalMinutes = 15
	} else if scanIntervalMinutes < 3 {
		scanIntervalMinutes = 3 // Explicit values below 3 minutes are clamped to the minimum.
	}

	// Query exchange actual balance, override user input
	actualBalance := req.InitialBalance // Default to use user input
	exchanges, err := s.store.Exchange().List(userID)
	if err != nil {
		SafeError(c, http.StatusInternalServerError,
			formatTraderCreationError("Unable to read your exchange configuration for now", "Please retry later; if the problem persists, check whether the local service is running normally"),
			err,
		)
		return
	}

	// Find matching exchange configuration
	var exchangeCfg *store.Exchange
	for _, ex := range exchanges {
		if ex.ID == req.ExchangeID {
			exchangeCfg = ex
			break
		}
	}

	if exchangeMsg, exchangeErrorKey, exchangeErrorParams := validateExchangeForTraderCreation(exchangeCfg); exchangeMsg != "" {
		SafeBadRequestWithDetails(c, exchangeMsg, exchangeErrorKey, exchangeErrorParams)
		return
	}

	{
		tempTrader, createErr := buildExchangeProbeTrader(exchangeCfg, userID)
		if createErr != nil {
			SafeBadRequestWithDetails(c, formatTraderCreationError(
				fmt.Sprintf("Exchange account \"%s\" did not pass initialization validation, because: %s", exchangeDisplayName(exchangeCfg), humanizeTraderSetupReason(SanitizeError(createErr, "Configuration validation failed"))),
				"Please go to \"Settings > Exchange Config\" to check whether this account's keys, address, and account information are entered correctly",
			), "trader.create.exchange_probe_failed", traderSetupReasonParams(createErr, "Configuration validation failed",
				"exchange_name", exchangeDisplayName(exchangeCfg),
			))
			return
		} else if tempTrader != nil {
			// Query actual balance
			balanceInfo, balanceErr := tempTrader.GetBalance()
			if balanceErr != nil {
				logger.Infof("⚠️ Failed to query exchange balance, using user input for initial balance: %v", balanceErr)
			} else {
				if extractedBalance, found := extractExchangeTotalEquity(balanceInfo); found {
					actualBalance = extractedBalance
					logger.Infof("✓ Queried exchange total equity: %.2f %s (user input: %.2f)",
						actualBalance, accountAssetForExchange(exchangeCfg.ExchangeType), req.InitialBalance)
				} else {
					logger.Infof("⚠️ Unable to extract total equity from balance info, balanceInfo=%v, using user input for initial balance", balanceInfo)
				}
			}
		}
	}

	// Create trader configuration (database entity)
	logger.Infof("🔧 DEBUG: Starting to create trader config, ID=%s, Name=%s, AIModel=%s, Exchange=%s, StrategyID=%s", traderID, req.Name, req.AIModelID, req.ExchangeID, req.StrategyID)
	traderRecord := &store.Trader{
		ID:                   traderID,
		UserID:               userID,
		Name:                 req.Name,
		AIModelID:            req.AIModelID,
		ExchangeID:           req.ExchangeID,
		StrategyID:           req.StrategyID, // Associated strategy ID (new version)
		InitialBalance:       actualBalance,  // Use actual queried balance
		BTCETHLeverage:       btcEthLeverage,
		AltcoinLeverage:      altcoinLeverage,
		TradingSymbols:       req.TradingSymbols,
		UseAI500:             req.UseAI500,
		UseOITop:             req.UseOITop,
		CustomPrompt:         req.CustomPrompt,
		OverrideBasePrompt:   req.OverrideBasePrompt,
		SystemPromptTemplate: systemPromptTemplate,
		IsCrossMargin:        isCrossMargin,
		ShowInCompetition:    showInCompetition,
		ScanIntervalMinutes:  scanIntervalMinutes,
		IsRunning:            false,
	}

	// Save to database
	logger.Infof("🔧 DEBUG: Preparing to call CreateTrader")
	err = s.store.Trader().Create(traderRecord)
	if err != nil {
		logger.Infof("❌ Failed to create trader: %v", err)
		publicMsg := SanitizeError(err, formatTraderCreationError("The bot configuration was not saved successfully", "Please check the name, model, strategy, and exchange configuration, then try again"))
		statusCode := http.StatusBadRequest
		if publicMsg == formatTraderCreationError("The bot configuration was not saved successfully", "Please check the name, model, strategy, and exchange configuration, then try again") {
			statusCode = http.StatusInternalServerError
		}
		SafeError(c, statusCode, publicMsg, err)
		return
	}
	logger.Infof("🔧 DEBUG: CreateTrader succeeded")

	// Immediately load new trader into TraderManager
	logger.Infof("🔧 DEBUG: Preparing to call LoadUserTraders")
	startupWarning := ""
	err = s.traderManager.LoadUserTradersFromStore(s.store, userID)
	if err != nil {
		logger.Infof("⚠️ Failed to load user traders into memory: %v", err)
		startupWarning = describeTraderCreationWarning(req.Name, err)
	}
	logger.Infof("🔧 DEBUG: LoadUserTraders completed")

	if startupWarning == "" {
		if loadErr := s.traderManager.GetLoadError(traderID); loadErr != nil {
			logger.Infof("⚠️ Trader %s failed to load after creation: %v", traderID, loadErr)
			startupWarning = describeTraderCreationWarning(req.Name, loadErr)
		}
	}

	if startupWarning == "" {
		if _, getErr := s.traderManager.GetTrader(traderID); getErr != nil {
			logger.Infof("⚠️ Trader %s not found in memory after creation: %v", traderID, getErr)
			startupWarning = describeTraderCreationWarning(req.Name, getErr)
		}
	}

	logger.Infof("✓ Trader created successfully: %s (model: %s, exchange: %s)", req.Name, req.AIModelID, req.ExchangeID)

	c.JSON(http.StatusCreated, gin.H{
		"trader_id":       traderID,
		"trader_name":     req.Name,
		"ai_model":        req.AIModelID,
		"is_running":      false,
		"startup_warning": startupWarning,
	})
}

// handleUpdateTrader Update trader configuration
func (s *Server) handleUpdateTrader(c *gin.Context) {
	userID := c.GetString("user_id")
	traderID := c.Param("id")

	var req UpdateTraderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		SafeBadRequest(c, "Invalid request parameters")
		return
	}

	// Check if trader exists and belongs to current user
	traders, err := s.store.Trader().List(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get trader list"})
		return
	}

	var existingTrader *store.Trader
	for _, t := range traders {
		if t.ID == traderID {
			existingTrader = t
			break
		}
	}

	if existingTrader == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trader does not exist"})
		return
	}

	if errMsg, errCode := validateTraderLeverageRange(req.BTCETHLeverage, req.AltcoinLeverage); errMsg != "" {
		SafeBadRequestWithDetails(c, errMsg, errCode, nil)
		return
	}

	// Set default values
	isCrossMargin := existingTrader.IsCrossMargin // Keep original value
	if req.IsCrossMargin != nil {
		isCrossMargin = *req.IsCrossMargin
	}

	showInCompetition := existingTrader.ShowInCompetition // Keep original value
	if req.ShowInCompetition != nil {
		showInCompetition = *req.ShowInCompetition
	}

	// Set leverage default values
	btcEthLeverage := req.BTCETHLeverage
	altcoinLeverage := req.AltcoinLeverage
	if btcEthLeverage <= 0 {
		btcEthLeverage = existingTrader.BTCETHLeverage // Keep original value
	}
	if altcoinLeverage <= 0 {
		altcoinLeverage = existingTrader.AltcoinLeverage // Keep original value
	}

	// Set scan interval, allow updates
	scanIntervalMinutes := req.ScanIntervalMinutes
	logger.Infof("📊 Update trader scan_interval: req=%d, existing=%d", req.ScanIntervalMinutes, existingTrader.ScanIntervalMinutes)
	if scanIntervalMinutes <= 0 {
		scanIntervalMinutes = existingTrader.ScanIntervalMinutes // Keep original value
	} else if scanIntervalMinutes < 3 {
		scanIntervalMinutes = 3
	}
	logger.Infof("📊 Final scan_interval_minutes: %d", scanIntervalMinutes)

	// Set system prompt template
	systemPromptTemplate := req.SystemPromptTemplate
	if systemPromptTemplate == "" {
		systemPromptTemplate = existingTrader.SystemPromptTemplate // Keep original value
	}

	// Handle strategy ID (if not provided, keep original value)
	strategyID := req.StrategyID
	if strategyID == "" {
		strategyID = existingTrader.StrategyID
	}

	exchangeChanged := req.ExchangeID != "" && req.ExchangeID != existingTrader.ExchangeID
	resetInitialBalance := exchangeChanged && req.InitialBalance <= 0

	initialBalance := existingTrader.InitialBalance
	if req.InitialBalance > 0 {
		initialBalance = req.InitialBalance
	}
	if resetInitialBalance {
		initialBalance = 0
	}

	// Update trader configuration
	traderRecord := &store.Trader{
		ID:                   traderID,
		UserID:               userID,
		Name:                 req.Name,
		AIModelID:            req.AIModelID,
		ExchangeID:           req.ExchangeID,
		StrategyID:           strategyID, // Associated strategy ID
		InitialBalance:       initialBalance,
		BTCETHLeverage:       btcEthLeverage,
		AltcoinLeverage:      altcoinLeverage,
		TradingSymbols:       req.TradingSymbols,
		CustomPrompt:         req.CustomPrompt,
		OverrideBasePrompt:   req.OverrideBasePrompt,
		SystemPromptTemplate: systemPromptTemplate,
		IsCrossMargin:        isCrossMargin,
		ShowInCompetition:    showInCompetition,
		ScanIntervalMinutes:  scanIntervalMinutes,
		IsRunning:            existingTrader.IsRunning, // Keep original value
	}

	// Check if trader was running before update (we'll restart it after)
	wasRunning := false
	if existingMemTrader, memErr := s.traderManager.GetTrader(traderID); memErr == nil {
		status := existingMemTrader.GetStatus()
		if running, ok := status["is_running"].(bool); ok && running {
			wasRunning = true
			logger.Infof("🔄 Trader %s was running, will restart with new config after update", traderID)
		}
	}

	// Update database
	logger.Infof("🔄 Updating trader: ID=%s, Name=%s, AIModelID=%s, StrategyID=%s, ScanInterval=%d min",
		traderRecord.ID, traderRecord.Name, traderRecord.AIModelID, traderRecord.StrategyID, scanIntervalMinutes)
	err = s.store.Trader().Update(traderRecord)
	if err != nil {
		SafeInternalError(c, "Failed to update trader", err)
		return
	}

	if resetInitialBalance {
		logger.Infof("🔄 Exchange changed for trader %s, resetting stale initial_balance to 0", traderID)
		if err := s.store.Trader().UpdateInitialBalance(userID, traderID, 0); err != nil {
			SafeInternalError(c, "Failed to reset trader initial balance", err)
			return
		}
	}

	// Remove old trader from memory first (this also stops if running)
	s.traderManager.RemoveTrader(traderID)

	// Reload traders into memory with fresh config
	err = s.traderManager.LoadUserTradersFromStore(s.store, userID)
	if err != nil {
		logger.Infof("⚠️ Failed to reload user traders into memory: %v", err)
	}

	// If trader was running before, restart it with new config
	if wasRunning {
		if reloadedTrader, getErr := s.traderManager.GetTrader(traderID); getErr == nil {
			go func() {
				logger.Infof("▶️ Restarting trader %s with new config...", traderID)
				if runErr := reloadedTrader.Run(); runErr != nil {
					logger.Infof("❌ Trader %s runtime error: %v", traderID, runErr)
				}
			}()
		}
	}

	logger.Infof("✓ Trader updated successfully: %s (model: %s, exchange: %s, strategy: %s)", req.Name, req.AIModelID, req.ExchangeID, strategyID)

	c.JSON(http.StatusOK, gin.H{
		"trader_id":   traderID,
		"trader_name": req.Name,
		"ai_model":    req.AIModelID,
		// A running trader is restarted with the new config (async above), so
		// report it as running — callers must not fire a redundant start.
		"is_running": wasRunning,
		"message":    "Trader updated successfully",
	})
}

// handleDeleteTrader Delete trader
func (s *Server) handleDeleteTrader(c *gin.Context) {
	userID := c.GetString("user_id")
	traderID := c.Param("id")

	// Delete from database
	err := s.store.Trader().Delete(userID, traderID)
	if err != nil {
		SafeInternalError(c, "Failed to delete trader", err)
		return
	}

	// If trader is running, stop it first
	if trader, err := s.traderManager.GetTrader(traderID); err == nil {
		status := trader.GetStatus()
		if isRunning, ok := status["is_running"].(bool); ok && isRunning {
			trader.Stop()
			logger.Infof("⏹  Stopped running trader: %s", traderID)
		}
	}

	// Remove trader from memory
	s.traderManager.RemoveTrader(traderID)

	logger.Infof("✓ Trader deleted: %s", traderID)
	c.JSON(http.StatusOK, gin.H{"message": "Trader deleted"})
}

// handleStartTrader Start trader
func (s *Server) handleStartTrader(c *gin.Context) {
	userID := c.GetString("user_id")
	traderID := c.Param("id")

	// Verify trader belongs to current user
	fullCfg, err := s.store.Trader().GetFullConfig(userID, traderID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trader does not exist or no access permission"})
		return
	}
	traderName := traderID
	if fullCfg != nil && fullCfg.Trader != nil && fullCfg.Trader.Name != "" {
		traderName = fullCfg.Trader.Name
	}

	if fullCfg != nil && fullCfg.Exchange != nil && fullCfg.Exchange.ExchangeType == "hyperliquid" && !fullCfg.Exchange.HyperliquidBuilderApproved {
		SafeBadRequestWithDetails(c, formatTraderStartError(
			fmt.Sprintf("The Hyperliquid trading authorization for bot \"%s\" is not yet complete", traderName),
			"Please reconnect the Hyperliquid wallet and complete the trading authorization, then start the bot",
		), "trader.start.hyperliquid_builder_not_approved", mapStringPairs("trader_name", traderName, "exchange_name", exchangeDisplayName(fullCfg.Exchange)))
		return
	}

	// Check if trader exists in memory and if it's running
	existingTrader, _ := s.traderManager.GetTrader(traderID)
	if existingTrader != nil {
		status := existingTrader.GetStatus()
		if isRunning, ok := status["is_running"].(bool); ok && isRunning {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":     "Trader is already running",
				"error_key": "trader.start.already_running",
			})
			return
		}
		// Trader exists but is stopped - remove from memory to reload fresh config
		logger.Infof("🔄 Removing stopped trader %s from memory to reload config...", traderID)
		s.traderManager.RemoveTrader(traderID)
	}

	// Load trader from database (always reload to get latest config)
	logger.Infof("🔄 Loading trader %s from database...", traderID)
	if loadErr := s.traderManager.LoadUserTradersFromStore(s.store, userID); loadErr != nil {
		logger.Infof("❌ Failed to load user traders: %v", loadErr)
		SafeErrorWithDetails(c, http.StatusInternalServerError, describeTraderStartError(traderName, loadErr), "trader.start.load_failed", traderSetupReasonParams(loadErr, "", "trader_name", traderName), loadErr)
		return
	}

	trader, err := s.traderManager.GetTrader(traderID)
	if err != nil {
		if fullCfg != nil && fullCfg.Trader != nil {
			// Check strategy
			if fullCfg.Strategy == nil {
				SafeBadRequestWithDetails(c, describeTraderStartError(traderName, fmt.Errorf("trader has no strategy configured")), "trader.start.strategy_missing", mapStringPairs("trader_name", traderName))
				return
			}
			// Check AI model
			if fullCfg.AIModel == nil {
				SafeBadRequestWithDetails(c, formatTraderStartError("The AI model associated with this bot does not exist", "Please go to \"Settings > Model Config\" to check, then click start again"), "trader.start.model_not_found", mapStringPairs("trader_name", traderName))
				return
			}
			if !fullCfg.AIModel.Enabled {
				SafeBadRequestWithDetails(c, formatTraderStartError(
					fmt.Sprintf("The AI model \"%s\" associated with bot \"%s\" is not enabled yet", fullCfg.AIModel.Name, traderName),
					"Please go to \"Settings > Model Config\" to enable it, then click start again",
				), "trader.start.model_disabled", mapStringPairs("trader_name", traderName, "model_name", fullCfg.AIModel.Name))
				return
			}
			// Check exchange
			if fullCfg.Exchange == nil {
				SafeBadRequestWithDetails(c, formatTraderStartError("The exchange account associated with this bot does not exist", "Please go to \"Settings > Exchange Config\" to check, then click start again"), "trader.start.exchange_not_found", mapStringPairs("trader_name", traderName))
				return
			}
			if !fullCfg.Exchange.Enabled {
				SafeBadRequestWithDetails(c, formatTraderStartError(
					fmt.Sprintf("The exchange account \"%s\" associated with bot \"%s\" is not enabled yet", exchangeDisplayName(fullCfg.Exchange), traderName),
					"Please go to \"Settings > Exchange Config\" to enable it, then click start again",
				), "trader.start.exchange_disabled", mapStringPairs("trader_name", traderName, "exchange_name", exchangeDisplayName(fullCfg.Exchange)))
				return
			}
		}
		// Check if there's a specific load error
		if loadErr := s.traderManager.GetLoadError(traderID); loadErr != nil {
			SafeBadRequestWithDetails(c, describeTraderStartError(traderName, loadErr), "trader.start.load_failed", traderSetupReasonParams(loadErr, "", "trader_name", traderName))
			return
		}
		SafeBadRequestWithDetails(c, describeTraderStartError(traderName, err), "trader.start.setup_invalid", traderSetupReasonParams(err, "", "trader_name", traderName))
		return
	}

	// Server-side launch gate: the trader cannot function without a funded AI
	// wallet and a ready exchange account, so verify both before the run loop
	// starts. `?force=true` skips the gate for deliberate manual overrides.
	if c.Query("force") != "true" {
		// strategyRequired=false: a trader that loaded into memory necessarily
		// has a valid strategy (the manager refuses to load without one), so the
		// preflight strategy check would be redundant here.
		preflight := s.runLaunchPreflight(userID, fullCfg.AIModel, fullCfg.Exchange, fullCfg.Strategy, false)
		if !preflight.Ready {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":     formatTraderStartError(preflight.Summary(), "Complete the failing checks, then start the bot again"),
				"error_key": "trader.start.preflight_failed",
				"preflight": preflight,
			})
			return
		}
	}

	// Start trader
	go func() {
		logger.Infof("▶️  Starting trader %s (%s)", traderID, trader.GetName())
		if err := trader.Run(); err != nil {
			logger.Infof("❌ Trader %s runtime error: %v", trader.GetName(), err)
		}
	}()

	// Update running status in database
	err = s.store.Trader().UpdateStatus(userID, traderID, true)
	if err != nil {
		logger.Infof("⚠️  Failed to update trader status: %v", err)
	}

	logger.Infof("✓ Trader %s started", trader.GetName())
	c.JSON(http.StatusOK, gin.H{"message": "Trader started"})
}

// handleStopTrader Stop trader
func (s *Server) handleStopTrader(c *gin.Context) {
	userID := c.GetString("user_id")
	traderID := c.Param("id")

	// Verify trader belongs to current user
	_, err := s.store.Trader().GetFullConfig(userID, traderID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trader does not exist or no access permission"})
		return
	}

	trader, err := s.traderManager.GetTrader(traderID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Trader does not exist"})
		return
	}

	// Check if trader is running
	status := trader.GetStatus()
	if isRunning, ok := status["is_running"].(bool); ok && !isRunning {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Trader is already stopped"})
		return
	}

	// Stop trader
	trader.Stop()

	// Update running status in database
	err = s.store.Trader().UpdateStatus(userID, traderID, false)
	if err != nil {
		logger.Infof("⚠️  Failed to update trader status: %v", err)
	}

	logger.Infof("⏹  Trader %s stopped", trader.GetName())
	c.JSON(http.StatusOK, gin.H{"message": "Trader stopped"})
}
