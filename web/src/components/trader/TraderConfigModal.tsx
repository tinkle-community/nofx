import { useState, useEffect } from 'react'
import type {
  AIModel,
  Exchange,
  CreateTraderRequest,
  Strategy,
  TraderConfigData,
} from '../../types'
import { useLanguage } from '../../contexts/LanguageContext'
import { t } from '../../i18n/translations'
import {
  Pencil,
  Plus,
  X as IconX,
  Sparkles,
  ExternalLink,
  UserPlus,
} from 'lucide-react'
import { httpClient } from '../../lib/httpClient'
import { MODAL_LAYERS, ModalPortal } from '../ui/modal-portal'
import { NofxSelect } from '../ui/select'

// Extract the name part after the underscore
function getShortName(fullName: string): string {
  const parts = fullName.split('_')
  return parts.length > 1 ? parts[parts.length - 1] : fullName
}

function getStrategyAIConfig(strategy: Strategy) {
  return (
    strategy.config.ai_config ||
    (strategy.config.coin_source && strategy.config.risk_control
      ? {
          coin_source: strategy.config.coin_source,
          risk_control: strategy.config.risk_control,
        }
      : null)
  )
}

// Exchange registration link configuration
const EXCHANGE_REGISTRATION_LINKS: Record<
  string,
  { url: string; hasReferral?: boolean }
> = {
  binance: {
    url: 'https://www.binance.com/join?ref=NOFXENG',
    hasReferral: true,
  },
  okx: { url: 'https://www.okx.com/join/1865360', hasReferral: true },
  bybit: { url: 'https://partner.bybit.com/b/83856', hasReferral: true },
  hyperliquid: {
    url: 'https://app.hyperliquid.xyz/join/AITRADING',
    hasReferral: true,
  },
  aster: {
    url: 'https://www.asterdex.com/en/referral/fdfc0e',
    hasReferral: true,
  },
  lighter: {
    url: 'https://app.lighter.xyz/?referral=68151432',
    hasReferral: true,
  },
}
// Internal form state type
interface FormState {
  trader_id?: string
  trader_name: string
  ai_model: string
  exchange_id: string
  strategy_id: string
  is_cross_margin: boolean
  show_in_competition: boolean
  scan_interval_minutes: number
}

interface TraderConfigModalProps {
  isOpen: boolean
  onClose: () => void
  traderData?: TraderConfigData | null
  isEditMode?: boolean
  availableModels?: AIModel[]
  availableExchanges?: Exchange[]
  onSave?: (data: CreateTraderRequest) => Promise<void>
}

export function TraderConfigModal({
  isOpen,
  onClose,
  traderData,
  isEditMode = false,
  availableModels = [],
  availableExchanges = [],
  onSave,
}: TraderConfigModalProps) {
  const { language } = useLanguage()
  const [formData, setFormData] = useState<FormState>({
    trader_name: '',
    ai_model: '',
    exchange_id: '',
    strategy_id: '',
    is_cross_margin: true,
    show_in_competition: true,
    scan_interval_minutes: 15,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [strategies, setStrategies] = useState<Strategy[]>([])

  // Fetch the user's strategy list
  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const result = await httpClient.get<{ strategies: Strategy[] }>(
          '/api/strategies'
        )
        if (result.success && result.data?.strategies) {
          const strategyList = result.data.strategies
          setStrategies(strategyList)
          // If no strategy is selected, default to the active strategy
          if (!formData.strategy_id && !isEditMode) {
            const activeStrategy = strategyList.find((s) => s.is_active)
            if (activeStrategy) {
              setFormData((prev) => ({
                ...prev,
                strategy_id: activeStrategy.id,
              }))
            } else if (strategyList.length > 0) {
              setFormData((prev) => ({
                ...prev,
                strategy_id: strategyList[0].id,
              }))
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch strategies:', error)
      }
    }
    if (isOpen) {
      fetchStrategies()
    }
  }, [isOpen])

  useEffect(() => {
    if (traderData) {
      setFormData({
        ...traderData,
        strategy_id: traderData.strategy_id || '',
      })
    } else if (!isEditMode) {
      setFormData({
        trader_name: '',
        ai_model: availableModels[0]?.id || '',
        exchange_id: availableExchanges[0]?.id || '',
        strategy_id: '',
        is_cross_margin: true,
        show_in_competition: true,
        scan_interval_minutes: 15,
      })
    }
  }, [traderData, isEditMode, availableModels, availableExchanges])

  if (!isOpen) return null

  const handleInputChange = (field: keyof FormState, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleExchangeChange = (exchangeId: string) => {
    setFormData((prev) => ({ ...prev, exchange_id: exchangeId }))
  }

  const handleSave = async () => {
    if (!onSave) return

    setIsSaving(true)
    try {
      const saveData: CreateTraderRequest = {
        name: formData.trader_name,
        ai_model_id: formData.ai_model,
        exchange_id: formData.exchange_id,
        strategy_id: formData.strategy_id,
        is_cross_margin: formData.is_cross_margin,
        show_in_competition: formData.show_in_competition,
        scan_interval_minutes: formData.scan_interval_minutes,
      }

      await onSave(saveData)
    } catch (error) {
      console.error(t('saveFailed', language) + ':', error)
    } finally {
      setIsSaving(false)
    }
  }

  const selectedStrategy = strategies.find((s) => s.id === formData.strategy_id)

  return (
    <ModalPortal>
      <div
        className={`fixed inset-0 ${MODAL_LAYERS.primary} flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 overflow-y-auto`}
      >
      <div
        className="bg-nofx-bg-lighter border border-nofx-gold/20 rounded-xl shadow-2xl max-w-2xl w-full my-8"
        style={{ maxHeight: 'calc(100vh - 4rem)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-nofx-gold/20 bg-nofx-bg-lighter sticky top-0 z-10 rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-nofx-gold flex items-center justify-center text-white">
              {isEditMode ? (
                <Pencil className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-nofx-text">
                {isEditMode
                  ? t('editTrader', language)
                  : t('createTrader', language)}
              </h2>
              <p className="text-sm text-nofx-text-muted mt-1">
                {isEditMode
                  ? t('editTraderConfig', language)
                  : t('selectStrategyAndConfigParams', language)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-nofx-text-muted hover:text-nofx-text hover:bg-nofx-bg-deeper transition-colors flex items-center justify-center"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div
          className="p-6 space-y-6 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 16rem)' }}
        >
          {/* Basic Info */}
          <div className="bg-nofx-bg border border-nofx-gold/20 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-nofx-text mb-5 flex items-center gap-2">
              <span className="text-nofx-gold">1</span>{' '}
              {t('basicConfig', language)}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-nofx-text block mb-2">
                  {t('traderNameRequired', language)}
                </label>
                <input
                  type="text"
                  value={formData.trader_name}
                  onChange={(e) =>
                    handleInputChange('trader_name', e.target.value)
                  }
                  className="w-full px-3 py-2 bg-nofx-bg-lighter border border-nofx-gold/20 rounded text-nofx-text focus:border-nofx-gold focus:outline-none"
                  placeholder={t('enterTraderNamePlaceholder', language)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-nofx-text block mb-2">
                    {t('aiModelRequired', language)}
                  </label>
                  <NofxSelect
                    value={formData.ai_model}
                    onChange={(val) => handleInputChange('ai_model', val)}
                    className="w-full px-3 py-2 bg-nofx-bg-lighter border border-nofx-gold/20 rounded text-nofx-text"
                    options={availableModels.map((model) => ({
                      value: model.id,
                      label: getShortName(model.name || model.id).toUpperCase(),
                    }))}
                  />
                </div>
                <div>
                  <label className="text-sm text-nofx-text block mb-2">
                    {t('exchangeRequired', language)}
                  </label>
                  <NofxSelect
                    value={formData.exchange_id}
                    onChange={handleExchangeChange}
                    className="w-full px-3 py-2 bg-nofx-bg-lighter border border-nofx-gold/20 rounded text-nofx-text"
                    options={availableExchanges.map((exchange) => ({
                      value: exchange.id,
                      label:
                        getShortName(
                          exchange.name || exchange.exchange_type || exchange.id
                        ).toUpperCase() +
                        (exchange.account_name
                          ? ` - ${exchange.account_name}`
                          : ''),
                    }))}
                  />
                  {/* Exchange Registration Link */}
                  {formData.exchange_id &&
                    (() => {
                      // Find the selected exchange to get its type
                      const selectedExchange = availableExchanges.find(
                        (e) => e.id === formData.exchange_id
                      )
                      const exchangeType =
                        selectedExchange?.exchange_type?.toLowerCase() || ''
                      const regLink = EXCHANGE_REGISTRATION_LINKS[exchangeType]
                      if (!regLink) return null
                      return (
                        <a
                          href={regLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs text-nofx-text-muted hover:text-nofx-gold transition-colors"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{t('noExchangeAccount', language)}</span>
                          {regLink.hasReferral && (
                            <span className="px-1.5 py-0.5 bg-nofx-gold/10 text-nofx-gold rounded text-[10px]">
                              {t('discount', language)}
                            </span>
                          )}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )
                    })()}
                </div>
              </div>
            </div>
          </div>

          {/* Strategy Selection */}
          <div className="bg-nofx-bg border border-nofx-gold/20 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-nofx-text mb-5 flex items-center gap-2">
              <span className="text-nofx-gold">2</span>{' '}
              {t('selectTradingStrategy', language)}
              <Sparkles className="w-4 h-4 text-nofx-gold" />
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-nofx-text block mb-2">
                  {t('useStrategy', language)}
                </label>
                <NofxSelect
                  value={formData.strategy_id}
                  onChange={(val) => handleInputChange('strategy_id', val)}
                  className="w-full px-3 py-2 bg-nofx-bg-lighter border border-nofx-gold/20 rounded text-nofx-text"
                  options={[
                    { value: '', label: t('noStrategyManual', language) },
                    ...strategies.map((strategy) => ({
                      value: strategy.id,
                      label:
                        strategy.name +
                        (strategy.is_active
                          ? t('strategyActive', language)
                          : '') +
                        (strategy.is_default
                          ? t('strategyDefault', language)
                          : ''),
                    })),
                  ]}
                />
                {strategies.length === 0 && (
                  <p className="text-xs text-nofx-text-muted mt-2">
                    {t('noStrategyHint', language)}
                  </p>
                )}
              </div>

              {/* Strategy Preview */}
              {selectedStrategy && (
                <div className="mt-3 p-4 bg-nofx-bg-lighter border border-nofx-gold/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-nofx-gold text-sm font-medium">
                      {t('strategyDetails', language)}
                    </span>
                    {selectedStrategy.is_active && (
                      <span className="px-2 py-0.5 bg-nofx-success/20 text-nofx-success text-xs rounded">
                        {t('activating', language)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-nofx-text-muted mb-2">
                    {selectedStrategy.description ||
                      (language === 'zh' ? 'No description' : 'No description')}
                  </p>
                  {selectedStrategy.config.strategy_type === 'grid_trading' &&
                  selectedStrategy.config.grid_config ? (
                    <div className="grid grid-cols-2 gap-2 text-xs text-nofx-text-muted">
                      <div>
                        {language === 'zh' ? 'Symbol' : 'Symbol'}:{' '}
                        {selectedStrategy.config.grid_config.symbol || '-'}
                      </div>
                      <div>
                        {language === 'zh' ? 'Grids' : 'Grids'}:{' '}
                        {selectedStrategy.config.grid_config.grid_count}
                      </div>
                    </div>
                  ) : (
                    (() => {
                      const aiConfig = getStrategyAIConfig(selectedStrategy)
                      if (!aiConfig) return null
                      return (
                        <div className="grid grid-cols-2 gap-2 text-xs text-nofx-text-muted">
                          <div>
                            {t('coinSource', language)}:{' '}
                            {aiConfig.coin_source.source_type === 'static'
                              ? language === 'zh'
                                ? 'Fixed US stocks'
                                : 'Fixed US stocks'
                              : aiConfig.coin_source.source_type ===
                                  'vergex_signal'
                                ? language === 'zh'
                                  ? 'Vergex signal board'
                                  : 'Vergex signal board'
                                : aiConfig.coin_source.source_type ===
                                    'hyper_rank'
                                  ? language === 'zh'
                                    ? 'Claw402 board'
                                    : 'Claw402 board'
                                  : aiConfig.coin_source.source_type ===
                                      'hyper_all'
                                    ? language === 'zh'
                                      ? 'Hyperliquid all markets'
                                      : 'Hyperliquid all markets'
                                    : aiConfig.coin_source.source_type ===
                                        'hyper_main'
                                      ? language === 'zh'
                                        ? 'Hyperliquid main markets'
                                        : 'Hyperliquid main markets'
                                      : aiConfig.coin_source.source_type ===
                                          'ai500'
                                        ? 'AI500'
                                        : aiConfig.coin_source.source_type ===
                                            'oi_top'
                                          ? 'OI Top'
                                          : aiConfig.coin_source.source_type ===
                                              'oi_low'
                                            ? 'OI Low'
                                            : '-'}
                          </div>
                          <div>
                            {t('marginLimit', language)}:{' '}
                            {(
                              (aiConfig.risk_control?.max_margin_usage || 0.9) *
                              100
                            ).toFixed(0)}
                            %
                          </div>
                        </div>
                      )
                    })()
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Trading Parameters */}
          <div className="bg-nofx-bg border border-nofx-gold/20 rounded-lg p-5">
            <h3 className="text-lg font-semibold text-nofx-text mb-5 flex items-center gap-2">
              <span className="text-nofx-gold">3</span>{' '}
              {t('tradingParams', language)}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-nofx-text block mb-2">
                    {t('marginMode', language)}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleInputChange('is_cross_margin', true)}
                      className={`flex-1 px-3 py-2 rounded text-sm ${
                        formData.is_cross_margin
                          ? 'bg-nofx-gold text-white'
                          : 'bg-nofx-bg-lighter text-nofx-text-muted border border-nofx-gold/20'
                      }`}
                    >
                      {t('crossMargin', language)}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleInputChange('is_cross_margin', false)
                      }
                      className={`flex-1 px-3 py-2 rounded text-sm ${
                        !formData.is_cross_margin
                          ? 'bg-nofx-gold text-white'
                          : 'bg-nofx-bg-lighter text-nofx-text-muted border border-nofx-gold/20'
                      }`}
                    >
                      {t('isolatedMargin', language)}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-nofx-text block mb-2">
                    {t('aiScanInterval', language)}
                  </label>
                  <input
                    type="number"
                    value={formData.scan_interval_minutes}
                    onChange={(e) => {
                      const parsedValue = Number(e.target.value)
                      const safeValue = Number.isFinite(parsedValue)
                        ? Math.max(3, parsedValue)
                        : 3
                      handleInputChange('scan_interval_minutes', safeValue)
                    }}
                    className="w-full px-3 py-2 bg-nofx-bg-lighter border border-nofx-gold/20 rounded text-nofx-text focus:border-nofx-gold focus:outline-none"
                    min="3"
                    max="60"
                    step="1"
                  />
                  <p className="text-xs text-nofx-text-muted mt-1">
                    {t('scanIntervalRecommend', language)}
                  </p>
                </div>
              </div>

              {/* Competition visibility */}
              <div>
                <label className="text-sm text-nofx-text block mb-2">
                  {t('competitionDisplay', language)}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange('show_in_competition', true)
                    }
                    className={`flex-1 px-3 py-2 rounded text-sm ${
                      formData.show_in_competition
                        ? 'bg-nofx-gold text-white'
                        : 'bg-nofx-bg-lighter text-nofx-text-muted border border-nofx-gold/20'
                    }`}
                  >
                    {t('show', language)}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleInputChange('show_in_competition', false)
                    }
                    className={`flex-1 px-3 py-2 rounded text-sm ${
                      !formData.show_in_competition
                        ? 'bg-nofx-gold text-white'
                        : 'bg-nofx-bg-lighter text-nofx-text-muted border border-nofx-gold/20'
                    }`}
                  >
                    {t('hide', language)}
                  </button>
                </div>
                <p className="text-xs text-nofx-text-muted mt-1">
                  {t('hiddenInCompetition', language)}
                </p>
              </div>

              <div className="p-3 bg-nofx-bg-lighter border border-nofx-gold/20 rounded flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-nofx-gold"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" x2="12" y1="8" y2="12" />
                  <line x1="12" x2="12.01" y1="16" y2="16" />
                </svg>
                <span className="text-sm text-nofx-text-muted">
                  {t('autoFetchBalanceInfo', language)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-nofx-gold/20 bg-nofx-bg-lighter sticky bottom-0 z-10 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-nofx-bg-deeper text-nofx-text rounded-lg hover:bg-nofx-bg transition-all duration-200 border border-nofx-gold/20"
          >
            {t('cancel', language)}
          </button>
          {onSave && (
            <button
              onClick={handleSave}
              disabled={
                isSaving ||
                !formData.trader_name ||
                !formData.ai_model ||
                !formData.exchange_id
              }
              className="px-8 py-3 bg-nofx-gold text-white rounded-lg hover:bg-nofx-gold/90 transition-all duration-200 disabled:bg-nofx-bg-deeper disabled:text-nofx-text-muted disabled:cursor-not-allowed font-medium shadow-lg"
            >
              {isSaving
                ? t('saving', language)
                : isEditMode
                  ? t('editTrader', language)
                  : t('createTraderButton', language)}
            </button>
          )}
        </div>
      </div>
      </div>
    </ModalPortal>
  )
}
