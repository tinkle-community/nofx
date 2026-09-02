import React, { useState, useEffect } from 'react'
import type { Exchange } from '../../types'
import { t, type Language } from '../../i18n/translations'
import { api } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { HyperliquidWalletConnect } from '../common/HyperliquidWalletConnect'
import { HyperliquidFundsPanel } from '../common/HyperliquidFundsPanel'
import { getExchangeIcon } from '../common/ExchangeIcons'
import {
  TwoStageKeyModal,
  type TwoStageKeyModalResult,
} from '../modals/TwoStageKeyModal'
import {
  WebCryptoEnvironmentCheck,
  type WebCryptoCheckStatus,
} from '../common/WebCryptoEnvironmentCheck'
import {
  BookOpen, Trash2, HelpCircle, ExternalLink, UserPlus,
  Key, Shield, ChevronLeft, Check, Copy, ArrowRight
} from 'lucide-react'
import { toast } from 'sonner'
import { Tooltip } from './Tooltip'
import { getShortName } from './utils'

// Supported exchange templates
const SUPPORTED_EXCHANGE_TEMPLATES = [
  {
    exchange_type: 'mexc_paper',
    name: 'MEXC Paper Trading',
    type: 'cex' as const,
  },
  { exchange_type: 'binance', name: 'Binance Futures', type: 'cex' as const },
  { exchange_type: 'bybit', name: 'Bybit Futures', type: 'cex' as const },
  { exchange_type: 'okx', name: 'OKX Futures', type: 'cex' as const },
  { exchange_type: 'bitget', name: 'Bitget Futures', type: 'cex' as const },
  { exchange_type: 'gate', name: 'Gate.io Futures', type: 'cex' as const },
  { exchange_type: 'kucoin', name: 'KuCoin Futures', type: 'cex' as const },
  { exchange_type: 'hyperliquid', name: 'Hyperliquid', type: 'dex' as const },
  { exchange_type: 'aster', name: 'Aster DEX', type: 'dex' as const },
  { exchange_type: 'lighter', name: 'Lighter', type: 'dex' as const },
  { exchange_type: 'indodax', name: 'Indodax', type: 'cex' as const },
]

interface ExchangeConfigModalProps {
  allExchanges: Exchange[]
  editingExchangeId: string | null
  initialExchangeType?: string | null
  onSave: (
    exchangeId: string | null,
    exchangeType: string,
    accountName: string,
    apiKey: string,
    secretKey?: string,
    passphrase?: string,
    testnet?: boolean,
    hyperliquidWalletAddr?: string,
    asterUser?: string,
    asterSigner?: string,
    asterPrivateKey?: string,
    lighterWalletAddr?: string,
    lighterPrivateKey?: string,
    lighterApiKeyPrivateKey?: string,
    lighterApiKeyIndex?: number
  ) => Promise<void>
  onDelete: (exchangeId: string) => void
  onClose: () => void
  language: Language
}

// Step indicator component
function StepIndicator({ currentStep, labels }: { currentStep: number; labels: string[] }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {labels.map((label, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
              style={{
                background: index < currentStep ? '#2E8B57' : index === currentStep ? '#E0483B' : '#E8E2D5',
                color: index <= currentStep ? '#fff' : '#8A8478',
              }}
            >
              {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            <span
              className="text-xs font-medium hidden sm:block"
              style={{ color: index === currentStep ? '#1A1813' : '#8A8478' }}
            >
              {label}
            </span>
          </div>
          {index < labels.length - 1 && (
            <div
              className="w-8 h-0.5 mx-1"
              style={{ background: index < currentStep ? '#2E8B57' : '#E8E2D5' }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// Exchange card component
function ExchangeCard({
  template,
  selected,
  onClick,
  disabled,
}: {
  template: typeof SUPPORTED_EXCHANGE_TEMPLATES[0]
  selected: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      style={{
        background: selected ? 'rgba(224, 72, 59, 0.15)' : '#F7F4EC',
        border: selected ? '2px solid #E0483B' : '2px solid rgba(26,24,19,0.14)',
      }}
    >
      <div className="relative">
        {getExchangeIcon(template.exchange_type, { width: 48, height: 48 })}
        {selected && (
          <div
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: '#2E8B57' }}
          >
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <span className="text-sm font-semibold" style={{ color: '#1A1813' }}>
        {getShortName(template.name)}
      </span>
      <span
        className="text-xs px-2 py-0.5 rounded-full"
        style={{
          background: template.type === 'cex' ? 'rgba(224, 72, 59, 0.2)' : 'rgba(224, 72, 59, 0.2)',
          color: template.type === 'cex' ? '#E0483B' : '#E0483B',
        }}
      >
        {template.type.toUpperCase()}
      </span>
    </button>
  )
}

export function ExchangeConfigModal({
  allExchanges,
  editingExchangeId,
  initialExchangeType,
  onSave,
  onDelete,
  onClose,
  language,
}: ExchangeConfigModalProps) {
  const { user } = useAuth()
  // Step: 0 = select exchange, 1 = configure
  const [currentStep, setCurrentStep] = useState(
    editingExchangeId || initialExchangeType ? 1 : 0
  )
  const [selectedExchangeType, setSelectedExchangeType] = useState(
    initialExchangeType || ''
  )
  const [apiKey, setApiKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [testnet, setTestnet] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [serverIP, setServerIP] = useState<{ public_ip: string; message: string } | null>(null)
  const [loadingIP, setLoadingIP] = useState(false)
  const [copiedIP, setCopiedIP] = useState(false)
  const [webCryptoStatus, setWebCryptoStatus] = useState<WebCryptoCheckStatus>('idle')
  const [showBinanceGuide, setShowBinanceGuide] = useState(false)

  // Aster fields
  const [asterUser, setAsterUser] = useState('')
  const [asterSigner, setAsterSigner] = useState('')
  const [asterPrivateKey, setAsterPrivateKey] = useState('')

  // Lighter fields
  const [lighterWalletAddr, setLighterWalletAddr] = useState('')
  const [lighterApiKeyPrivateKey, setLighterApiKeyPrivateKey] = useState('')
  const [lighterApiKeyIndex, setLighterApiKeyIndex] = useState(0)

  // Other state
  const [secureInputTarget, setSecureInputTarget] = useState<null | 'hyperliquid' | 'aster' | 'lighter'>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [accountName, setAccountName] = useState('')

  const selectedExchange = editingExchangeId
    ? allExchanges?.find((e) => e.id === editingExchangeId)
    : null

  const selectedTemplate = editingExchangeId
    ? SUPPORTED_EXCHANGE_TEMPLATES.find((t) => t.exchange_type === selectedExchange?.exchange_type)
    : SUPPORTED_EXCHANGE_TEMPLATES.find((t) => t.exchange_type === selectedExchangeType)

  const currentExchangeType = editingExchangeId
    ? selectedExchange?.exchange_type
    : selectedExchangeType

  const exchangeRegistrationLinks: Record<string, { url: string; hasReferral?: boolean }> = {
    binance: { url: 'https://www.binance.com/join?ref=NOFXENG', hasReferral: true },
    okx: { url: 'https://www.okx.com/join/1865360', hasReferral: true },
    bybit: { url: 'https://partner.bybit.com/b/83856', hasReferral: true },
    bitget: { url: 'https://www.bitget.com/referral/register?from=referral&clacCode=c8a43172', hasReferral: true },
    gate: { url: 'https://www.gatenode.xyz/share/VQBGUAxY', hasReferral: true },
    kucoin: { url: 'https://www.kucoin.com/r/broker/CXEV7XKK', hasReferral: true },
    hyperliquid: { url: 'https://app.hyperliquid.xyz/join/AITRADING', hasReferral: true },
    aster: { url: 'https://www.asterdex.com/en/referral/fdfc0e', hasReferral: true },
    lighter: { url: 'https://app.lighter.xyz/?referral=68151432', hasReferral: true },
    indodax: { url: 'https://indodax.com/ref/Saep23/1', hasReferral: true },
  }

  // Initialize form when editing
  useEffect(() => {
    if (editingExchangeId && selectedExchange) {
      setAccountName(selectedExchange.account_name || '')
      setApiKey(selectedExchange.apiKey || '')
      setSecretKey(selectedExchange.secretKey || '')
      setPassphrase('')
      setTestnet(selectedExchange.testnet || false)
      setAsterUser(selectedExchange.asterUser || '')
      setAsterSigner(selectedExchange.asterSigner || '')
      setAsterPrivateKey('')
      setLighterWalletAddr(selectedExchange.lighterWalletAddr || '')
      setLighterApiKeyPrivateKey('')
      setLighterApiKeyIndex(selectedExchange.lighterApiKeyIndex || 0)
    }
  }, [editingExchangeId, selectedExchange])

  // Load server IP for Binance
  useEffect(() => {
    if (currentExchangeType === 'binance' && !serverIP) {
      setLoadingIP(true)
      api.getServerIP()
        .then((data) => setServerIP(data))
        .catch((err) => console.error('Failed to load server IP:', err))
        .finally(() => setLoadingIP(false))
    }
  }, [currentExchangeType, serverIP])

  const handleCopyIP = async (ip: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(ip)
        setCopiedIP(true)
        setTimeout(() => setCopiedIP(false), 2000)
        toast.success(t('ipCopied', language))
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = ip
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopiedIP(true)
        setTimeout(() => setCopiedIP(false), 2000)
        toast.success(t('ipCopied', language))
      }
    } catch {
      toast.error(t('copyIPFailed', language))
    }
  }

  const secureInputContextLabel =
    secureInputTarget === 'aster' ? t('asterExchangeName', language)
      : secureInputTarget === 'hyperliquid' ? t('hyperliquidExchangeName', language)
        : undefined

  const handleSecureInputComplete = ({ value }: TwoStageKeyModalResult) => {
    const trimmed = value.trim()
    if (secureInputTarget === 'hyperliquid') setApiKey(trimmed)
    if (secureInputTarget === 'aster') setAsterPrivateKey(trimmed)
    if (secureInputTarget === 'lighter') {
      setLighterApiKeyPrivateKey(trimmed)
      toast.success(t('lighterApiKeyImported', language))
    }
    setSecureInputTarget(null)
  }

  const handleSelectExchange = (exchangeType: string) => {
    setSelectedExchangeType(exchangeType)
    setCurrentStep(1)
  }

  const handleBack = () => {
    if (editingExchangeId) {
      onClose()
    } else {
      setCurrentStep(0)
      setSelectedExchangeType('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSaving) return
    if (!editingExchangeId && !selectedExchangeType) return

    const trimmedAccountName = accountName.trim()
    if (!trimmedAccountName) {
      toast.error(t('exchangeConfig.pleaseEnterAccountName', language))
      return
    }

    const exchangeId = editingExchangeId || null
    const exchangeType = currentExchangeType || ''

    setIsSaving(true)
    try {
      if (currentExchangeType === 'mexc_paper') {
        await onSave(
          exchangeId,
          exchangeType,
          trimmedAccountName,
          '',
          '',
          '',
          false
        )
      } else if (currentExchangeType === 'binance' || currentExchangeType === 'bybit' || currentExchangeType === 'indodax') {
        if (!apiKey.trim() || !secretKey.trim()) return
        await onSave(exchangeId, exchangeType, trimmedAccountName, apiKey.trim(), secretKey.trim(), '', testnet)
      } else if (currentExchangeType === 'okx' || currentExchangeType === 'bitget' || currentExchangeType === 'kucoin') {
        if (!apiKey.trim() || !secretKey.trim() || !passphrase.trim()) return
        await onSave(exchangeId, exchangeType, trimmedAccountName, apiKey.trim(), secretKey.trim(), passphrase.trim(), testnet)
      } else if (currentExchangeType === 'hyperliquid') {
        toast.error(language === 'zh' ? 'Use the wallet authorization flow to connect Hyperliquid.' : 'Use the wallet authorization flow to connect Hyperliquid.')
        return
      } else if (currentExchangeType === 'aster') {
        if (!asterUser.trim() || !asterSigner.trim() || !asterPrivateKey.trim()) return
        await onSave(exchangeId, exchangeType, trimmedAccountName, '', '', '', testnet, undefined, asterUser.trim(), asterSigner.trim(), asterPrivateKey.trim())
      } else if (currentExchangeType === 'lighter') {
        if (!lighterWalletAddr.trim() || !lighterApiKeyPrivateKey.trim()) return
        await onSave(exchangeId, exchangeType, trimmedAccountName, '', '', '', testnet, undefined, undefined, undefined, undefined, lighterWalletAddr.trim(), '', lighterApiKeyPrivateKey.trim(), lighterApiKeyIndex)
      } else {
        if (!apiKey.trim() || !secretKey.trim()) return
        await onSave(exchangeId, exchangeType, trimmedAccountName, apiKey.trim(), secretKey.trim(), '', testnet)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const stepLabels = [t('exchangeConfig.selectExchange', language), t('exchangeConfig.configure', language)]
  const cexExchanges = SUPPORTED_EXCHANGE_TEMPLATES.filter(t => t.type === 'cex')
  const dexExchanges = SUPPORTED_EXCHANGE_TEMPLATES.filter(t => t.type === 'dex')

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto backdrop-blur-sm">
      <div
        className="rounded-2xl w-full max-w-2xl relative my-8 shadow-2xl"
        style={{ background: '#F7F4EC', maxHeight: 'calc(100vh - 4rem)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <div className="flex items-center gap-3">
            {currentStep > 0 && !editingExchangeId && (
              <button type="button" onClick={handleBack} className="p-2 rounded-lg hover:bg-black/5 transition-colors">
                <ChevronLeft className="w-5 h-5" style={{ color: '#8A8478' }} />
              </button>
            )}
            <h3 className="text-xl font-bold" style={{ color: '#1A1813' }}>
              {editingExchangeId ? t('editExchange', language) : t('addExchange', language)}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {currentExchangeType === 'binance' && currentStep === 1 && (
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105 flex items-center gap-2"
                style={{ background: 'rgba(224, 72, 59, 0.1)', color: '#E0483B' }}
              >
                <BookOpen className="w-4 h-4" />
                {t('viewGuide', language)}
              </button>
            )}
            {editingExchangeId && (
              <button
                type="button"
                onClick={() => onDelete(editingExchangeId)}
                className="p-2 rounded-lg hover:bg-nofx-danger/20 transition-colors"
                style={{ color: '#D6433A' }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-black/5 transition-colors" style={{ color: '#8A8478' }}>
              ✕
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        {!editingExchangeId && (
          <div className="px-6">
            <StepIndicator currentStep={currentStep} labels={stepLabels} />
          </div>
        )}

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 16rem)' }}>
          {/* Step 0: Select Exchange */}
          {currentStep === 0 && !editingExchangeId && (
            <div className="space-y-6">
              {/* WebCrypto Check */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color: '#8A8478' }}>
                  <Shield className="w-4 h-4" />
                  {t('environmentSteps.checkTitle', language)}
                </div>
                <WebCryptoEnvironmentCheck language={language} variant="card" onStatusChange={setWebCryptoStatus} />
              </div>

              {/* Exchange Grid */}
              <div className="space-y-4">
                <div className="text-sm font-semibold" style={{ color: '#1A1813' }}>
                  {t('exchangeConfig.chooseExchange', language)}
                </div>

                {/* CEX */}
                <div className="space-y-3">
                  <div className="text-xs font-medium uppercase tracking-wide" style={{ color: '#E0483B' }}>
                    {t('exchangeConfig.centralizedExchanges', language)}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {cexExchanges.map((template) => (
                      <ExchangeCard
                        key={template.exchange_type}
                        template={template}
                        selected={selectedExchangeType === template.exchange_type}
                        onClick={() => handleSelectExchange(template.exchange_type)}
                        disabled={
                          template.exchange_type !== 'mexc_paper' &&
                          webCryptoStatus !== 'secure' &&
                          webCryptoStatus !== 'disabled'
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* DEX */}
                <div className="space-y-3">
                  <div className="text-xs font-medium uppercase tracking-wide" style={{ color: '#E0483B' }}>
                    {t('exchangeConfig.decentralizedExchanges', language)}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {dexExchanges.map((template) => (
                      <ExchangeCard
                        key={template.exchange_type}
                        template={template}
                        selected={selectedExchangeType === template.exchange_type}
                        onClick={() => handleSelectExchange(template.exchange_type)}
                        disabled={webCryptoStatus !== 'secure' && webCryptoStatus !== 'disabled'}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Configure */}
          {(currentStep === 1 || editingExchangeId) && selectedTemplate && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Selected Exchange Header */}
              <div className="p-4 rounded-xl flex items-center gap-4" style={{ background: '#F1ECE2', border: '1px solid rgba(26,24,19,0.14)' }}>
                {getExchangeIcon(selectedTemplate.exchange_type, { width: 48, height: 48 })}
                <div className="flex-1">
                  <div className="font-semibold text-lg" style={{ color: '#1A1813' }}>
                    {getShortName(selectedTemplate.name)}
                  </div>
                  <div className="text-xs" style={{ color: '#8A8478' }}>
                    {selectedTemplate.type.toUpperCase()} • {selectedTemplate.exchange_type}
                  </div>
                </div>
                {currentExchangeType !== 'mexc_paper' && (
                  <a
                    href={
                      exchangeRegistrationLinks[currentExchangeType || '']
                        ?.url || '#'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105"
                    style={{
                      background: 'rgba(224, 72, 59, 0.1)',
                      border: '1px solid rgba(224, 72, 59, 0.3)',
                    }}
                  >
                    <UserPlus className="w-4 h-4" style={{ color: '#E0483B' }} />
                    <span className="text-sm font-medium" style={{ color: '#E0483B' }}>
                      {t('exchangeConfig.register', language)}
                    </span>
                    {exchangeRegistrationLinks[currentExchangeType || '']?.hasReferral && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          background: 'rgba(46, 139, 87, 0.2)',
                          color: '#2E8B57',
                        }}
                      >
                        {t('exchangeConfig.bonus', language)}
                      </span>
                    )}
                  </a>
                )}
              </div>

              {/* Account Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1A1813' }}>
                  <Key className="w-4 h-4" style={{ color: '#E0483B' }} />
                  {t('exchangeConfig.accountName', language)} *
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder={t('exchangeConfig.accountNamePlaceholder', language)}
                  className="w-full px-4 py-3 rounded-xl text-base"
                  style={{ background: '#F1ECE2', border: '1px solid rgba(26,24,19,0.14)', color: '#1A1813' }}
                  required
                />
              </div>

              {currentExchangeType === 'mexc_paper' && (
                <div
                  className="p-4 rounded-xl"
                  style={{
                    background: 'rgba(46, 139, 87, 0.08)',
                    border: '1px solid rgba(46, 139, 87, 0.25)',
                  }}
                >
                  <div
                    className="text-sm font-semibold mb-1"
                    style={{ color: '#2E8B57' }}
                  >
                    Safe paper trading with MEXC prices
                  </div>
                  <div
                    className="text-xs leading-5"
                    style={{ color: '#5F5A50' }}
                  >
                    NOFX reads public MEXC prices while balances, positions, and
                    orders remain simulated locally. No API key is required and
                    no real order can be sent. Initial balance is 10,000 USDT.
                  </div>
                </div>
              )}

              {/* CEX Fields */}
              {(currentExchangeType === 'binance' || currentExchangeType === 'bybit' || currentExchangeType === 'okx' || currentExchangeType === 'bitget' || currentExchangeType === 'gate' || currentExchangeType === 'kucoin' || currentExchangeType === 'indodax') && (
                <>
                  {currentExchangeType === 'binance' && (
                    <div
                      className="p-4 rounded-xl cursor-pointer transition-colors"
                      style={{ background: 'rgba(224, 72, 59, 0.08)', border: '1px solid rgba(224, 72, 59, 0.2)' }}
                      onClick={() => setShowBinanceGuide(!showBinanceGuide)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span style={{ color: '#E0483B' }}>ℹ️</span>
                          <span className="text-sm font-medium" style={{ color: '#1A1813' }}>
                            {t('exchangeConfig.useBinanceFuturesApi', language)}
                          </span>
                        </div>
                        <span style={{ color: '#8A8478' }}>{showBinanceGuide ? '▲' : '▼'}</span>
                      </div>
                      {showBinanceGuide && (
                        <div className="mt-3 pt-3 text-sm" style={{ borderTop: '1px solid rgba(224, 72, 59, 0.2)', color: '#1A1813' }}>
                          <a
                            href="https://www.binance.com/zh-CN/support/faq/how-to-create-api-keys-on-binance-360002502072"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:underline"
                            style={{ color: '#E0483B' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t('exchangeConfig.viewTutorial', language)} <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {editingExchangeId && selectedExchange && (
                    <div
                      className="p-3 rounded-xl text-xs"
                      style={{ background: 'rgba(46, 139, 87, 0.08)', border: '1px solid rgba(46, 139, 87, 0.2)', color: '#2E8B57' }}
                    >
                      Saved credential status:
                      {' '}
                      API Key {selectedExchange.has_api_key ? 'configured' : 'not configured'}
                      {' · '}
                      Secret {selectedExchange.has_secret_key ? 'configured' : 'not configured'}
                      {(currentExchangeType === 'okx' || currentExchangeType === 'bitget' || currentExchangeType === 'kucoin')
                        ? ` · Passphrase ${selectedExchange.has_passphrase ? 'configured' : 'not configured'}`
                        : ''}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1A1813' }}>
                      <Key className="w-4 h-4" style={{ color: '#E0483B' }} />
                      {t('apiKey', language)}
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={
                        editingExchangeId && selectedExchange?.has_api_key
                          ? 'Saved. Re-enter to replace.'
                          : t('enterAPIKey', language)
                      }
                      className="w-full px-4 py-3 rounded-xl"
                      style={{ background: '#F1ECE2', border: '1px solid rgba(26,24,19,0.14)', color: '#1A1813' }}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1A1813' }}>
                      <Shield className="w-4 h-4" style={{ color: '#E0483B' }} />
                      {t('secretKey', language)}
                    </label>
                    <input
                      type="password"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      placeholder={
                        editingExchangeId && selectedExchange?.has_secret_key
                          ? 'Saved. Re-enter to replace.'
                          : t('enterSecretKey', language)
                      }
                      className="w-full px-4 py-3 rounded-xl"
                      style={{ background: '#F1ECE2', border: '1px solid rgba(26,24,19,0.14)', color: '#1A1813' }}
                      required
                    />
                  </div>

                  {(currentExchangeType === 'okx' || currentExchangeType === 'bitget' || currentExchangeType === 'kucoin') && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1A1813' }}>
                        <Key className="w-4 h-4" style={{ color: '#E0483B' }} />
                        {t('passphrase', language)}
                      </label>
                      <input
                        type="password"
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        placeholder={
                          editingExchangeId && selectedExchange?.has_passphrase
                            ? 'Saved. Re-enter to replace.'
                            : t('enterPassphrase', language)
                        }
                        className="w-full px-4 py-3 rounded-xl"
                        style={{ background: '#F1ECE2', border: '1px solid rgba(26,24,19,0.14)', color: '#1A1813' }}
                        required
                      />
                    </div>
                  )}

                  {currentExchangeType === 'binance' && (
                    <div className="p-4 rounded-xl" style={{ background: 'rgba(224, 72, 59, 0.1)', border: '1px solid rgba(224, 72, 59, 0.2)' }}>
                      <div className="text-sm font-semibold mb-2" style={{ color: '#E0483B' }}>
                        {t('whitelistIP', language)}
                      </div>
                      <div className="text-xs mb-3" style={{ color: '#8A8478' }}>
                        {t('whitelistIPDesc', language)}
                      </div>
                      {loadingIP ? (
                        <div className="text-xs" style={{ color: '#8A8478' }}>{t('loadingServerIP', language)}</div>
                      ) : serverIP?.public_ip ? (
                        <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: '#F1ECE2' }}>
                          <code className="flex-1 text-sm font-mono" style={{ color: '#E0483B' }}>{serverIP.public_ip}</code>
                          <button
                            type="button"
                            onClick={() => handleCopyIP(serverIP.public_ip)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                            style={{ background: 'rgba(224, 72, 59, 0.2)', color: '#E0483B' }}
                          >
                            <Copy className="w-3 h-3" />
                            {copiedIP ? t('ipCopied', language) : t('copyIP', language)}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}
                </>
              )}

              {/* Aster Fields */}
              {currentExchangeType === 'aster' && (
                <>
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(224, 72, 59, 0.1)', border: '1px solid rgba(224, 72, 59, 0.3)' }}>
                    <div className="flex items-start gap-2">
                      <span style={{ fontSize: '16px' }}>🔐</span>
                      <div>
                        <div className="text-sm font-semibold mb-1" style={{ color: '#E0483B' }}>{t('asterApiProTitle', language)}</div>
                        <div className="text-xs" style={{ color: '#8A8478' }}>{t('asterApiProDesc', language)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1A1813' }}>
                      {t('asterUserLabel', language)}
                      <Tooltip content={t('asterUserDesc', language)}>
                        <HelpCircle className="w-4 h-4 cursor-help" style={{ color: '#E0483B' }} />
                      </Tooltip>
                    </label>
                    <input type="text" value={asterUser} onChange={(e) => setAsterUser(e.target.value)} placeholder={t('enterAsterUser', language)} className="w-full px-4 py-3 rounded-xl" style={{ background: '#F1ECE2', border: '1px solid rgba(26,24,19,0.14)', color: '#1A1813' }} required />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1A1813' }}>
                      {t('asterSignerLabel', language)}
                      <Tooltip content={t('asterSignerDesc', language)}>
                        <HelpCircle className="w-4 h-4 cursor-help" style={{ color: '#E0483B' }} />
                      </Tooltip>
                    </label>
                    <input type="text" value={asterSigner} onChange={(e) => setAsterSigner(e.target.value)} placeholder={t('enterAsterSigner', language)} className="w-full px-4 py-3 rounded-xl" style={{ background: '#F1ECE2', border: '1px solid rgba(26,24,19,0.14)', color: '#1A1813' }} required />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1A1813' }}>
                      {t('asterPrivateKeyLabel', language)}
                      <Tooltip content={t('asterPrivateKeyDesc', language)}>
                        <HelpCircle className="w-4 h-4 cursor-help" style={{ color: '#E0483B' }} />
                      </Tooltip>
                    </label>
                    <input type="password" value={asterPrivateKey} onChange={(e) => setAsterPrivateKey(e.target.value)} placeholder={t('enterAsterPrivateKey', language)} className="w-full px-4 py-3 rounded-xl" style={{ background: '#F1ECE2', border: '1px solid rgba(26,24,19,0.14)', color: '#1A1813' }} required />
                  </div>
                </>
              )}

              {/* Hyperliquid Wallet Authorization */}
              {currentExchangeType === 'hyperliquid' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(224, 72, 59, 0.1)', border: '1px solid rgba(224, 72, 59, 0.3)' }}>
                    <div className="flex items-start gap-2">
                      <span style={{ fontSize: '16px' }}>🔐</span>
                      <div>
                        <div className="text-sm font-semibold mb-1" style={{ color: '#E0483B' }}>
                          {language === 'zh' ? 'Hyperliquid requires wallet authorization' : 'Hyperliquid requires wallet authorization'}
                        </div>
                        <div className="text-xs leading-5" style={{ color: '#8A8478' }}>
                          {language === 'zh'
                            ? 'Manual private-key/API-key entry is disabled. Use MetaMask, Rabby, OKX, Coinbase Wallet or another EVM wallet to connect, authorize the agent, and approve the builder fee.'
                            : 'Manual private-key/API-key entry is disabled. Use MetaMask, Rabby, OKX, Coinbase Wallet or another EVM wallet to connect, authorize the agent, and approve the builder fee.'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <HyperliquidWalletConnect language={language} isLoggedIn={Boolean(user)} variant="inline" />
                  </div>
                  {selectedExchange?.hyperliquidWalletAddr && (
                    <HyperliquidFundsPanel
                      language={language}
                      walletAddress={selectedExchange.hyperliquidWalletAddr}
                      unifiedAccount={selectedExchange.hyperliquidUnifiedAccount ?? true}
                    />
                  )}
                </div>
              )}

              {/* Lighter Fields */}
              {currentExchangeType === 'lighter' && (
                <>
                  <div className="p-4 rounded-xl" style={{ background: 'rgba(224, 72, 59, 0.1)', border: '1px solid rgba(224, 72, 59, 0.3)' }}>
                    <div className="flex items-start gap-2">
                      <span style={{ fontSize: '16px' }}>🔐</span>
                      <div>
                        <div className="text-sm font-semibold mb-1" style={{ color: '#E0483B' }}>
                          {t('exchangeConfig.lighterApiKeySetup', language)}
                        </div>
                        <div className="text-xs" style={{ color: '#8A8478' }}>
                          {t('exchangeConfig.lighterApiKeyDesc', language)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold" style={{ color: '#1A1813' }}>{t('lighterWalletAddress', language)} *</label>
                    <input type="text" value={lighterWalletAddr} onChange={(e) => setLighterWalletAddr(e.target.value)} placeholder={t('enterLighterWalletAddress', language)} className="w-full px-4 py-3 rounded-xl" style={{ background: '#F1ECE2', border: '1px solid rgba(26,24,19,0.14)', color: '#1A1813' }} required />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1A1813' }}>
                      {t('lighterApiKeyPrivateKey', language)} *
                      <button type="button" onClick={() => setSecureInputTarget('lighter')} className="text-xs underline" style={{ color: '#E0483B' }}>{t('secureInputButton', language)}</button>
                    </label>
                    <input type="password" value={lighterApiKeyPrivateKey} onChange={(e) => setLighterApiKeyPrivateKey(e.target.value)} placeholder={t('enterLighterApiKeyPrivateKey', language)} className="w-full px-4 py-3 rounded-xl font-mono" style={{ background: '#F1ECE2', border: '1px solid rgba(26,24,19,0.14)', color: '#1A1813' }} required />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#1A1813' }}>
                      {t('exchangeConfig.apiKeyIndex', language)}
                      <Tooltip content={t('exchangeConfig.apiKeyIndexTooltip', language)}>
                        <HelpCircle className="w-4 h-4 cursor-help" style={{ color: '#E0483B' }} />
                      </Tooltip>
                    </label>
                    <input type="number" min={0} max={255} value={lighterApiKeyIndex} onChange={(e) => setLighterApiKeyIndex(parseInt(e.target.value) || 0)} className="w-full px-4 py-3 rounded-xl" style={{ background: '#F1ECE2', border: '1px solid rgba(26,24,19,0.14)', color: '#1A1813' }} />
                  </div>
                </>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleBack} className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-black/5" style={{ background: '#E8E2D5', color: '#8A8478' }}>
                  {currentExchangeType === 'hyperliquid' ? t('closeGuide', language) : editingExchangeId ? t('cancel', language) : t('exchangeConfig.back', language)}
                </button>
                {currentExchangeType !== 'hyperliquid' && (
                  <button
                    type="submit"
                    disabled={isSaving || !accountName.trim()}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: '#E0483B', color: '#fff' }}
                  >
                    {isSaving ? t('saving', language) : (
                      <>{t('saveConfig', language)} <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Binance Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4" onClick={() => setShowGuide(false)}>
          <div className="rounded-2xl p-6 w-full max-w-4xl" style={{ background: '#F7F4EC' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: '#1A1813' }}>
                <BookOpen className="w-6 h-6" style={{ color: '#E0483B' }} />
                {t('binanceSetupGuide', language)}
              </h3>
              <button onClick={() => setShowGuide(false)} className="px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: '#E8E2D5', color: '#8A8478' }}>
                {t('closeGuide', language)}
              </button>
            </div>
            <div className="overflow-y-auto max-h-[80vh]">
              <img src="/images/guide.png" alt={t('binanceSetupGuide', language)} className="w-full h-auto rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Secure Input Modal */}
      <TwoStageKeyModal
        isOpen={secureInputTarget !== null}
        language={language}
        contextLabel={secureInputContextLabel}
        expectedLength={64}
        onCancel={() => setSecureInputTarget(null)}
        onComplete={handleSecureInputComplete}
      />
    </div>
  )
}
