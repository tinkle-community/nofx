package store

import "strings"

func MissingRequiredExchangeCredentialFields(exchangeType, apiKey, secretKey, passphrase, hyperliquidWalletAddr, asterUser, asterSigner, asterPrivateKey, lighterWalletAddr, lighterAPIKeyPrivateKey string) []string {
	switch strings.ToLower(strings.TrimSpace(exchangeType)) {
	case "mexc_paper":
		return nil
	case "binance", "bybit", "gate", "indodax":
		return missingNamedFields(
			namedField{"api_key", apiKey},
			namedField{"secret_key", secretKey},
		)
	case "okx", "bitget", "kucoin":
		return missingNamedFields(
			namedField{"api_key", apiKey},
			namedField{"secret_key", secretKey},
			namedField{"passphrase", passphrase},
		)
	case "hyperliquid":
		return missingNamedFields(
			namedField{"api_key", apiKey},
			namedField{"hyperliquid_wallet_addr", hyperliquidWalletAddr},
		)
	case "aster":
		return missingNamedFields(
			namedField{"aster_user", asterUser},
			namedField{"aster_signer", asterSigner},
			namedField{"aster_private_key", asterPrivateKey},
		)
	case "lighter":
		return missingNamedFields(
			namedField{"lighter_wallet_addr", lighterWalletAddr},
			namedField{"lighter_api_key_private_key", lighterAPIKeyPrivateKey},
		)
	default:
		return []string{"exchange_type"}
	}
}

type namedField struct {
	name  string
	value string
}

func missingNamedFields(fields ...namedField) []string {
	missing := make([]string, 0, len(fields))
	for _, field := range fields {
		if strings.TrimSpace(field.value) == "" {
			missing = append(missing, field.name)
		}
	}
	return missing
}

func IsVisibleAIModel(model *AIModel) bool {
	if model == nil {
		return false
	}
	return model.Enabled ||
		strings.TrimSpace(string(model.APIKey)) != "" ||
		strings.TrimSpace(model.CustomAPIURL) != "" ||
		strings.TrimSpace(model.CustomModelName) != ""
}

func IsVisibleExchange(exchange *Exchange) bool {
	if exchange == nil {
		return false
	}
	return exchange.Enabled ||
		strings.TrimSpace(string(exchange.APIKey)) != "" ||
		strings.TrimSpace(string(exchange.SecretKey)) != "" ||
		strings.TrimSpace(string(exchange.Passphrase)) != "" ||
		strings.TrimSpace(exchange.HyperliquidWalletAddr) != "" ||
		strings.TrimSpace(exchange.AsterUser) != "" ||
		strings.TrimSpace(exchange.AsterSigner) != "" ||
		strings.TrimSpace(string(exchange.AsterPrivateKey)) != "" ||
		strings.TrimSpace(exchange.LighterWalletAddr) != "" ||
		strings.TrimSpace(string(exchange.LighterPrivateKey)) != "" ||
		strings.TrimSpace(string(exchange.LighterAPIKeyPrivateKey)) != "" ||
		exchange.LighterAPIKeyIndex != 0
}

func IsVisibleTrader(trader *Trader) bool {
	if trader == nil {
		return false
	}
	return strings.TrimSpace(trader.Name) != "" &&
		strings.TrimSpace(trader.AIModelID) != "" &&
		strings.TrimSpace(trader.ExchangeID) != ""
}

func IsVisibleStrategy(strategy *Strategy) bool {
	if strategy == nil {
		return false
	}
	return strings.TrimSpace(strategy.Name) != ""
}
