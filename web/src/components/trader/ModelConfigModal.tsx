import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Trash2, Brain, ExternalLink } from 'lucide-react'
import type { AIModel } from '../../types'
import type { Language } from '../../i18n/translations'
import { t } from '../../i18n/translations'
import { getModelIcon, getModelColor } from '../common/ModelIcons'
import { ModelStepIndicator } from './ModelStepIndicator'
import { ModelCard } from './ModelCard'
import { MODAL_LAYERS, ModalPortal } from '../ui/modal-portal'
import {
  CLAW402_MODELS,
  DEFAULT_CLAW402_MODEL,
  AI_PROVIDER_CONFIG,
  getShortName,
} from './model-constants'

interface ModelConfigModalProps {
  allModels: AIModel[]
  configuredModels: AIModel[]
  editingModelId: string | null
  initialModelId?: string | null
  onSave: (
    modelId: string,
    apiKey: string,
    baseUrl?: string,
    modelName?: string
  ) => void
  onDelete: (modelId: string) => void
  onClose: () => void
  language: Language
}

export function ModelConfigModal({
  allModels,
  configuredModels,
  editingModelId,
  initialModelId,
  onSave,
  onDelete,
  onClose,
  language,
}: ModelConfigModalProps) {
  const [currentStep, setCurrentStep] = useState(
    editingModelId || initialModelId ? 1 : 0
  )
  const [selectedModelId, setSelectedModelId] = useState(
    editingModelId || initialModelId || ''
  )
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [modelName, setModelName] = useState('')

  // The configured entry carries the saved details (wallet address, custom
  // model name, has_api_key); the template from supportedModels only describes
  // the provider. When editing, the configured entry must win — both can share
  // the same id (e.g. "claw402").
  const configuredModel = configuredModels?.find((m) => m.id === selectedModelId)
  const templateModel = allModels?.find((m) => m.id === selectedModelId)
  const selectedModel = editingModelId
    ? configuredModel || templateModel
    : templateModel || configuredModel
  const hasExistingKey = Boolean(
    configuredModel?.has_api_key || configuredModel?.apiKey
  )

  useEffect(() => {
    if (editingModelId && selectedModel) {
      setApiKey(selectedModel.apiKey || '')
      setBaseUrl(selectedModel.customApiUrl || '')
      setModelName(selectedModel.customModelName || '')
    }
  }, [editingModelId, selectedModel])

  const handleSelectModel = (modelId: string) => {
    setSelectedModelId(modelId)
    setCurrentStep(1)
  }

  const handleBack = () => {
    if (editingModelId) {
      onClose()
    } else {
      setCurrentStep(0)
      setSelectedModelId('')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedModelId) return
    // Editing with a stored key: an empty key means "keep the existing one"
    // (the backend preserves the stored key when api_key is empty).
    if (!apiKey.trim() && !(editingModelId && hasExistingKey)) return
    onSave(
      selectedModelId,
      apiKey.trim(),
      baseUrl.trim() || undefined,
      modelName.trim() || undefined
    )
  }

  const availableModels = allModels || []
  const configuredIds = new Set(configuredModels?.map((m) => m.id) || [])
  const stepLabels = [
    t('modelConfig.selectModel', language),
    t('modelConfig.configureApi', language),
  ]

  return (
    <ModalPortal>
      <div
        className={`fixed inset-0 bg-black/60 flex items-center justify-center ${MODAL_LAYERS.primary} p-4 overflow-y-auto backdrop-blur-sm`}
      >
      <div
        className="rounded-2xl w-full max-w-[52rem] relative my-8 shadow-2xl bg-nofx-bg-lighter"
        style={{
          maxHeight: 'calc(100vh - 4rem)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <div className="flex items-center gap-3">
            {currentStep > 0 && !editingModelId && (
              <button
                type="button"
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-nofx-bg-deeper transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  style={{ color: '#8A8478' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            <h3 className="text-xl font-bold" style={{ color: '#1A1813' }}>
              {editingModelId
                ? t('editAIModel', language)
                : t('addAIModel', language)}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {editingModelId && (
              <button
                type="button"
                onClick={() => onDelete(editingModelId)}
                className="p-2 rounded-lg hover:bg-nofx-danger/20 transition-colors"
                style={{ color: '#D6433A' }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-nofx-bg-deeper transition-colors"
              style={{ color: '#8A8478' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        {!editingModelId && (
          <div className="px-6">
            <ModelStepIndicator currentStep={currentStep} labels={stepLabels} />
          </div>
        )}

        {/* Content */}
        <div
          className="px-6 pb-6 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 16rem)' }}
        >
          {/* Step 0: Select Model */}
          {currentStep === 0 && !editingModelId && (
            <ModelSelectionStep
              availableModels={availableModels}
              configuredIds={configuredIds}
              selectedModelId={selectedModelId}
              onSelectModel={handleSelectModel}
              language={language}
            />
          )}

          {/* Step 1: Configure — Claw402 Dedicated UI */}
          {(currentStep === 1 || editingModelId) &&
            selectedModel &&
            (selectedModel.provider === 'claw402' ||
              selectedModel.id === 'claw402') && (
              <Claw402ConfigForm
                apiKey={apiKey}
                modelName={modelName}
                editingModelId={editingModelId}
                hasExistingKey={hasExistingKey}
                initialWalletAddress={selectedModel.walletAddress}
                initialBalanceUsdc={selectedModel.balanceUsdc}
                onApiKeyChange={setApiKey}
                onModelNameChange={setModelName}
                onBack={handleBack}
                onSubmit={handleSubmit}
                language={language}
              />
            )}

          {/* Step 1: Configure — Standard Providers (non-claw402) */}
          {(currentStep === 1 || editingModelId) &&
            selectedModel &&
            selectedModel.provider !== 'claw402' &&
            selectedModel.id !== 'claw402' && (
              <StandardProviderConfigForm
                selectedModel={selectedModel}
                apiKey={apiKey}
                baseUrl={baseUrl}
                modelName={modelName}
                editingModelId={editingModelId}
                onApiKeyChange={setApiKey}
                onBaseUrlChange={setBaseUrl}
                onModelNameChange={setModelName}
                onBack={handleBack}
                onSubmit={handleSubmit}
                language={language}
              />
            )}
        </div>
      </div>
      </div>
    </ModalPortal>
  )
}

// --- Sub-components for ModelConfigModal ---

function ModelSelectionStep({
  availableModels,
  configuredIds,
  selectedModelId,
  onSelectModel,
  language,
}: {
  availableModels: AIModel[]
  configuredIds: Set<string>
  selectedModelId: string
  onSelectModel: (modelId: string) => void
  language: Language
}) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold" style={{ color: '#1A1813' }}>
        {t('modelConfig.chooseProvider', language)}
      </div>

      {/* Claw402 Featured Card */}
      {availableModels.some((m) => m.provider === 'claw402') && (
        <button
          type="button"
          onClick={() => {
            const claw = availableModels.find((m) => m.provider === 'claw402')
            if (claw) onSelectModel(claw.id)
          }}
          className="w-full p-5 rounded-xl text-left transition-all hover:scale-[1.01]"
          style={{
            background: 'rgba(224, 72, 59, 0.10)',
            border: '1.5px solid rgba(224, 72, 59, 0.4)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                <img
                  src="/icons/claw402.png"
                  alt="Claw402"
                  width={40}
                  height={40}
                />
              </div>
              <div>
                <div
                  className="font-bold text-base"
                  style={{ color: '#1A1813' }}
                >
                  Claw402
                  <a
                    href="https://claw402.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="ml-1.5 text-[10px] font-normal px-1.5 py-0.5 rounded"
                    style={{
                      color: '#E0483B',
                      background: 'rgba(224, 72, 59, 0.1)',
                    }}
                  >
                    ↗ claw402.ai
                  </a>
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#8A8478' }}>
                  {t('modelConfig.payPerCall', language)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {configuredIds.has(
                availableModels.find((m) => m.provider === 'claw402')?.id || ''
              ) && (
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#2E8B57' }}
                />
              )}
              <div
                className="px-3 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: '#E0483B',
                  color: '#fff',
                }}
              >
                {'🔥 ' + t('modelConfig.recommended', language)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3 ml-[52px]">
            <span
              className="text-[11px] px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(46, 139, 87, 0.1)',
                color: '#2E8B57',
                border: '1px solid rgba(46, 139, 87, 0.2)',
              }}
            >
              GPT · Claude · DeepSeek · GLM
            </span>
          </div>
        </button>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {availableModels
          .filter(
            (m) =>
              !m.provider?.startsWith('blockrun') && m.provider !== 'claw402'
          )
          .map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              selected={selectedModelId === model.id}
              onClick={() => onSelectModel(model.id)}
              configured={configuredIds.has(model.id)}
            />
          ))}
      </div>
      <div className="text-xs text-center pt-2" style={{ color: '#8A8478' }}>
        {t('modelConfig.modelsConfigured', language)}
      </div>
    </div>
  )
}

function Claw402ConfigForm({
  apiKey,
  modelName,
  editingModelId,
  hasExistingKey,
  initialWalletAddress,
  initialBalanceUsdc,
  onApiKeyChange,
  onModelNameChange,
  onBack,
  onSubmit,
  language,
}: {
  apiKey: string
  modelName: string
  editingModelId: string | null
  hasExistingKey?: boolean
  initialWalletAddress?: string
  initialBalanceUsdc?: string
  onApiKeyChange: (value: string) => void
  onModelNameChange: (value: string) => void
  onBack: () => void
  onSubmit: (e: React.FormEvent) => void
  language: Language
}) {
  const [walletAddress, setWalletAddress] = useState(initialWalletAddress || '')
  const [copiedAddr, setCopiedAddr] = useState(false)
  const [showDeposit, setShowDeposit] = useState(Boolean(initialWalletAddress))
  const [showNewWalletBackup, setShowNewWalletBackup] = useState(false)
  const [newWalletKey, setNewWalletKey] = useState('')
  const [usdcBalance, setUsdcBalance] = useState<string | null>(
    initialBalanceUsdc || null
  )
  const [keyError, setKeyError] = useState('')
  const [validating, setValidating] = useState(false)
  const [claw402Status, setClaw402Status] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<{
    status: string
    message: string
  } | null>(null)
  const [testing, setTesting] = useState(false)

  // Client-side validation helper
  const getClientError = (key: string): string => {
    if (!key) return ''
    if (!key.startsWith('0x'))
      return t('modelConfig.invalidKeyPrefix', language)
    if (key.length !== 66)
      return `${t('modelConfig.invalidKeyLength', language)} ${key.length}`
    if (!/^0x[0-9a-fA-F]{64}$/.test(key))
      return t('modelConfig.invalidKeyChars', language)
    return ''
  }

  const isKeyValid =
    apiKey.length === 66 &&
    apiKey.startsWith('0x') &&
    /^0x[0-9a-fA-F]{64}$/.test(apiKey)

  // Editing with a stored key: allow saving (e.g. switching model) without
  // re-entering the private key, as long as the field is left blank.
  const canSubmit =
    isKeyValid || (Boolean(editingModelId) && Boolean(hasExistingKey) && !apiKey)

  // Truncate address for display

  // Debounced validation when apiKey changes
  useEffect(() => {
    setClaw402Status(null)
    setTestResult(null)

    const clientErr = getClientError(apiKey)
    setKeyError(clientErr)

    if (!apiKey) {
      setWalletAddress(initialWalletAddress || '')
      setUsdcBalance(initialBalanceUsdc || null)
      setShowDeposit(Boolean(initialWalletAddress))
      setValidating(false)
      return
    }

    setWalletAddress('')
    setUsdcBalance(null)

    if (clientErr || !apiKey) {
      setValidating(false)
      return
    }

    setValidating(true)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch('/api/wallet/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ private_key: apiKey }),
        })
        const data = await res.json()
        if (data.valid) {
          setWalletAddress(data.address || '')
          setUsdcBalance(data.balance_usdc || '0.00')
          setClaw402Status(data.claw402_status || 'unknown')
          setKeyError('')
        } else {
          setKeyError(data.error || 'Invalid key')
        }
      } catch {
        setKeyError('Validation request failed')
      } finally {
        setValidating(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [apiKey, initialBalanceUsdc, initialWalletAddress, language])

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/wallet/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ private_key: apiKey }),
      })
      const data = await res.json()
      if (data.valid) {
        setWalletAddress(data.address || '')
        setUsdcBalance(data.balance_usdc || '0.00')
        setClaw402Status(data.claw402_status || 'unknown')
        if (parseFloat(data.balance_usdc || '0') === 0) setShowDeposit(true)
        setTestResult({
          status: data.claw402_status === 'ok' ? 'ok' : 'error',
          message:
            data.claw402_status === 'ok'
              ? t('modelConfig.claw402Connected', language)
              : t('modelConfig.claw402Unreachable', language),
        })
      } else {
        setTestResult({ status: 'error', message: data.error || 'Invalid key' })
      }
    } catch {
      setTestResult({
        status: 'error',
        message: t('modelConfig.claw402Unreachable', language),
      })
    } finally {
      setTesting(false)
    }
  }

  const balanceNum = usdcBalance ? parseFloat(usdcBalance) : 0

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Claw402 Hero Header */}
      <div
        className="p-5 rounded-xl text-center"
        style={{
          background: 'rgba(224, 72, 59, 0.08)',
          border: '1px solid rgba(224, 72, 59, 0.3)',
        }}
      >
        <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 overflow-hidden">
          <img src="/icons/claw402.png" alt="Claw402" width={56} height={56} />
        </div>
        <a
          href="https://claw402.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-bold inline-flex items-center gap-1.5 hover:underline"
          style={{ color: '#1A1813' }}
        >
          Claw402{' '}
          <span className="text-xs font-normal" style={{ color: '#E0483B' }}>
            ↗
          </span>
        </a>
        <div className="text-sm mt-1" style={{ color: '#8A8478' }}>
          {t('modelConfig.allModelsClaw', language)}
        </div>
        <div className="flex items-center justify-center gap-3 mt-3 flex-wrap">
          {['GPT', 'Claude', 'DeepSeek', 'GLM'].map(
            (name) => (
              <span
                key={name}
                className="text-[11px] px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(26,24,19,0.06)',
                  color: '#8A8478',
                }}
              >
                {name}
              </span>
            )
          )}
        </div>
      </div>

      {/* Step 1: Select AI Model */}
      <div className="space-y-3">
        <label
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: '#1A1813' }}
        >
          <Brain className="w-4 h-4" style={{ color: '#E0483B' }} />
          {t('modelConfig.selectAiModel', language)}
        </label>
        <div className="text-xs mb-2" style={{ color: '#8A8478' }}>
          {t('modelConfig.allModelsUnified', language)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CLAW402_MODELS.map((m) => {
            const isSelected = (modelName || DEFAULT_CLAW402_MODEL) === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onModelNameChange(m.id)}
                className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-left transition-all hover:scale-[1.02]"
                style={{
                  background: isSelected
                    ? 'rgba(224, 72, 59, 0.12)'
                    : '#F1ECE2',
                  border: isSelected
                    ? '1.5px solid #E0483B'
                    : '1px solid rgba(26,24,19,0.14)',
                }}
              >
                <div
                  className="w-7 h-7 mt-0.5 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: '#fff',
                    border: '1px solid rgba(26,24,19,0.10)',
                  }}
                >
                  {getModelIcon(m.brand, { width: 18, height: 18 }) || (
                    <span
                      className="text-xs font-bold"
                      style={{ color: getModelColor(m.brand) }}
                    >
                      {m.provider[0]}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className="text-xs font-semibold truncate"
                      style={{ color: isSelected ? '#E0483B' : '#1A1813' }}
                    >
                      {m.name}
                    </div>
                    {m.isNew ? (
                      <span
                        className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em]"
                        style={{
                          color: '#2E8B57',
                          background: 'rgba(46, 139, 87, 0.12)',
                          border: '1px solid rgba(46, 139, 87, 0.22)',
                        }}
                      >
                        NEW
                      </span>
                    ) : null}
                  </div>
                  <div
                    className="text-[10px] truncate"
                    style={{ color: '#8A8478' }}
                  >
                    {m.provider} · {m.desc}
                  </div>
                  <div
                    className="text-[10px] font-medium"
                    style={{ color: '#2E8B57' }}
                  >
                    ${m.priceIn} in · ${m.priceOut} out /1M tok
                  </div>
                </div>
                {isSelected && (
                  <span
                    className="text-[10px] mt-1"
                    style={{ color: '#E0483B' }}
                  >
                    ✓
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Step 2: Wallet Setup */}
      <div className="space-y-3">
        <label
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: '#1A1813' }}
        >
          <svg
            className="w-4 h-4"
            style={{ color: '#E0483B' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          {t('modelConfig.setupWallet', language)}
        </label>

        <div
          className="p-3 rounded-xl"
          style={{
            background: 'rgba(224, 72, 59, 0.06)',
            border: '1px solid rgba(224, 72, 59, 0.15)',
          }}
        >
          <div className="text-xs mb-2" style={{ color: '#8A8478' }}>
            {t('modelConfig.walletInfo', language)}
          </div>
          <div className="text-xs space-y-1" style={{ color: '#8A8478' }}>
            <div className="flex items-center gap-1.5">
              <span style={{ color: '#2E8B57' }}>•</span>
              {t('modelConfig.exportKey', language)}
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ color: '#2E8B57' }}>•</span>
              {t('modelConfig.dedicatedWallet', language)}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-xs font-medium" style={{ color: '#8A8478' }}>
            {t('modelConfig.walletPrivateKey', language)}
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-4 py-3 rounded-xl font-mono text-sm"
              style={{
                background: '#F1ECE2',
                border: keyError
                  ? '1px solid #D6433A'
                  : walletAddress
                    ? '1px solid #2E8B57'
                    : '1px solid rgba(26,24,19,0.14)',
                color: '#1A1813',
              }}
              required={!walletAddress}
            />
            {!apiKey && !walletAddress && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/wallet/generate', {
                      method: 'POST',
                    })
                    const data = await res.json()
                    if (data.private_key) {
                      onApiKeyChange(data.private_key)
                      setShowNewWalletBackup(true)
                      setNewWalletKey(data.private_key)
                    }
                  } catch {
                    /* ignore */
                  }
                }}
                className="shrink-0 px-3 py-3 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02]"
                style={{
                  background: '#E0483B',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {language === 'zh' ? '🔑 Create Wallet' : '🔑 Create Wallet'}
              </button>
            )}
          </div>

          {/* New wallet backup warning */}
          {showNewWalletBackup && newWalletKey && (
            <div
              className="p-3 rounded-xl"
              style={{
                background: 'rgba(214, 67, 58, 0.08)',
                border: '1px solid rgba(214, 67, 58, 0.3)',
              }}
            >
              <div
                className="text-xs font-bold mb-2"
                style={{ color: '#D6433A' }}
              >
                🚨{' '}
                {language === 'zh'
                  ? 'Important: Backup your private key NOW!'
                  : 'Important: Backup your private key NOW!'}
              </div>
              <div className="text-[11px] mb-2" style={{ color: '#D6433A' }}>
                {language === 'zh'
                  ? 'This is your wallet private key. If lost, it cannot be recovered and all assets will be permanently lost. Copy and save it securely.'
                  : 'This is your wallet private key. If lost, it cannot be recovered and all assets will be permanently lost. Copy and save it securely.'}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <code
                  className="text-[10px] font-mono break-all select-all flex-1 p-2 rounded"
                  style={{ background: '#F1ECE2', color: '#D6433A' }}
                >
                  {newWalletKey}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(newWalletKey)
                    setCopiedAddr(true)
                    setTimeout(() => setCopiedAddr(false), 2000)
                  }}
                  className="shrink-0 text-[10px] px-2 py-1 rounded"
                  style={{
                    background: 'rgba(214,67,58,0.15)',
                    color: '#D6433A',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {copiedAddr ? '✅ Copied' : '📋 Copy Key'}
                </button>
              </div>
              <div
                className="text-[10px] space-y-1"
                style={{ color: '#8A8478' }}
              >
                <div>
                  ✅{' '}
                  {language === 'zh'
                    ? 'Save to a password manager (1Password / Bitwarden)'
                    : 'Save to a password manager (1Password / Bitwarden)'}
                </div>
                <div>
                  ✅{' '}
                  {language === 'zh'
                    ? 'Or write it down and store it safely'
                    : 'Or write it down and store it safely'}
                </div>
                <div>
                  ❌{' '}
                  {language === 'zh'
                    ? 'Do NOT screenshot or share with anyone'
                    : 'Do NOT screenshot or share with anyone'}
                </div>
              </div>
            </div>
          )}

          <div
            className="flex items-start gap-1.5 text-[11px]"
            style={{ color: '#8A8478' }}
          >
            <span className="mt-px">🔒</span>
            <span>{t('modelConfig.privateKeyNote', language)}</span>
          </div>
        </div>

        {/* Wallet Validation Results */}
        {(apiKey || walletAddress) && (
          <div className="space-y-2 pl-1">
            {/* Validating spinner */}
            {validating && (
              <div
                className="flex items-center gap-2 text-xs"
                style={{ color: '#E0483B' }}
              >
                <span className="animate-spin">⏳</span>
                {t('modelConfig.validating', language)}
              </div>
            )}

            {/* Error message */}
            {keyError && !validating && (
              <div
                className="flex items-center gap-2 text-xs"
                style={{ color: '#D6433A' }}
              >
                <span>❌</span>
                {keyError}
              </div>
            )}

            {/* Success: address + balance + status */}
            {walletAddress && !validating && !keyError && (
              <>
                <div
                  className="p-2.5 rounded-lg"
                  style={{
                    background: 'rgba(224,72,59,0.06)',
                    border: '1px solid rgba(224,72,59,0.15)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px]" style={{ color: '#8A8478' }}>
                      {t('modelConfig.walletAddress', language)}:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(walletAddress)
                        setCopiedAddr(true)
                        setTimeout(() => setCopiedAddr(false), 2000)
                      }}
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        background: 'rgba(224,72,59,0.1)',
                        color: '#E0483B',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {copiedAddr ? '✅' : '📋'}
                    </button>
                  </div>
                  <code
                    className="text-[11px] font-mono block select-all"
                    style={{ color: '#E0483B' }}
                  >
                    {walletAddress}
                  </code>
                  <div
                    className="text-[10px] mt-1.5"
                    style={{ color: '#E0483B' }}
                  >
                    ⚠️{' '}
                    {language === 'zh'
                      ? 'Please confirm this is your wallet address (verify in MetaMask)'
                      : 'Please confirm this is your wallet address (verify in MetaMask)'}
                  </div>
                </div>
                {usdcBalance !== null && (
                  <div className="flex items-center gap-2 text-xs">
                    <span>💰</span>
                    <span
                      style={{ color: balanceNum > 0 ? '#2E8B57' : '#E0483B' }}
                    >
                      {t('modelConfig.usdcBalance', language)}: ${usdcBalance}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDeposit(!showDeposit)}
                      className="text-[10px] px-2 py-0.5 rounded transition-all"
                      style={{
                        background: 'rgba(46,139,87,0.1)',
                        color: '#2E8B57',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {showDeposit
                        ? language === 'zh'
                          ? 'Hide'
                          : 'Hide'
                        : language === 'zh'
                          ? '💳 Deposit'
                          : '💳 Deposit'}
                    </button>
                  </div>
                )}
                {showDeposit && (
                  <div
                    className="p-3 rounded-xl mt-1"
                    style={{
                      background: 'rgba(46, 139, 87, 0.04)',
                      border: '1px solid rgba(46, 139, 87, 0.15)',
                    }}
                  >
                    <div
                      className="text-xs font-semibold mb-2"
                      style={{ color: '#2E8B57' }}
                    >
                      💳{' '}
                      {language === 'zh'
                        ? 'Deposit USDC (Base Chain)'
                        : 'Deposit USDC (Base Chain)'}
                    </div>
                    <div className="flex gap-3 items-start mb-3">
                      <div
                        className="shrink-0 p-1.5 rounded-lg"
                        style={{ background: '#fff' }}
                      >
                        <QRCodeSVG value={walletAddress} size={80} level="M" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-[11px] mb-1"
                          style={{ color: '#8A8478' }}
                        >
                          {language === 'zh'
                            ? 'Scan QR or copy address to transfer'
                            : 'Scan QR or copy address to transfer'}
                        </div>
                        <code
                          className="text-[10px] font-mono break-all select-all block mb-1.5"
                          style={{ color: '#E0483B' }}
                        >
                          {walletAddress}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(walletAddress)
                            setCopiedAddr(true)
                            setTimeout(() => setCopiedAddr(false), 2000)
                          }}
                          className="text-[10px] px-2 py-0.5 rounded"
                          style={{
                            background: 'rgba(224,72,59,0.1)',
                            color: '#E0483B',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          {copiedAddr ? '✅ Copied' : '📋 Copy Address'}
                        </button>
                      </div>
                    </div>
                    <div
                      className="text-[10px] space-y-1"
                      style={{ color: '#8A8478' }}
                    >
                      <div>
                        📱{' '}
                        {language === 'zh'
                          ? 'Scan QR with exchange app to transfer'
                          : 'Scan QR with exchange app to transfer'}
                      </div>
                      <div>
                        •{' '}
                        {language === 'zh'
                          ? 'Choose Base network when withdrawing'
                          : 'Choose Base network when withdrawing'}
                      </div>
                      <div>
                        • {language === 'zh' ? 'Or bridge: ' : 'Or bridge: '}
                        <a
                          href="https://bridge.base.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                          style={{ color: '#E0483B' }}
                        >
                          bridge.base.org
                        </a>
                      </div>
                      <div>
                        •{' '}
                        {language === 'zh'
                          ? 'Min $1 USDC to start'
                          : 'Min $1 USDC to start'}
                      </div>
                    </div>
                  </div>
                )}
                {claw402Status && (
                  <div
                    className="flex items-center gap-2 text-xs"
                    style={{
                      color: claw402Status === 'ok' ? '#2E8B57' : '#D6433A',
                    }}
                  >
                    <span>{claw402Status === 'ok' ? '🟢' : '🔴'}</span>
                    {claw402Status === 'ok'
                      ? t('modelConfig.claw402Connected', language)
                      : t('modelConfig.claw402Unreachable', language)}
                  </div>
                )}
              </>
            )}

            {/* Test Connection button */}
            {isKeyValid && !validating && (
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{
                  background: 'rgba(224, 72, 59, 0.12)',
                  border: '1px solid rgba(224, 72, 59, 0.3)',
                  color: '#E0483B',
                }}
              >
                <span>🔗</span>
                {testing
                  ? t('modelConfig.testingConnection', language)
                  : t('modelConfig.testConnection', language)}
              </button>
            )}

            {/* Test result */}
            {testResult && !testing && (
              <div
                className="flex items-center gap-2 text-xs"
                style={{
                  color: testResult.status === 'ok' ? '#2E8B57' : '#D6433A',
                }}
              >
                <span>{testResult.status === 'ok' ? '✅' : '❌'}</span>
                {testResult.message}
              </div>
            )}
          </div>
        )}
      </div>

      {/* USDC Recharge Guide */}
      <div
        className="p-4 rounded-xl"
        style={{
          background: 'rgba(46, 139, 87, 0.05)',
          border: '1px solid rgba(46, 139, 87, 0.15)',
        }}
      >
        <div
          className="text-sm font-semibold mb-2 flex items-center gap-2"
          style={{ color: '#2E8B57' }}
        >
          {'💰 ' + t('modelConfig.howToFundUsdc', language)}
        </div>
        <div className="text-xs space-y-1.5" style={{ color: '#8A8478' }}>
          <div className="flex items-start gap-2">
            <span className="font-bold" style={{ color: '#8A8478' }}>
              1.
            </span>
            <span>{t('modelConfig.fundStep1', language)}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold" style={{ color: '#8A8478' }}>
              2.
            </span>
            <span>{t('modelConfig.fundStep2', language)}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold" style={{ color: '#8A8478' }}>
              3.
            </span>
            <span>{t('modelConfig.fundStep3', language)}</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-nofx-bg-deeper"
          style={{ background: '#E8E2D5', color: '#8A8478' }}
        >
          {editingModelId
            ? t('cancel', language)
            : t('modelConfig.back', language)}
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: canSubmit ? '#E0483B' : '#E8E2D5',
            color: canSubmit ? '#fff' : '#8A8478',
          }}
        >
          {'🚀 ' + t('modelConfig.startTrading', language)}
        </button>
      </div>
    </form>
  )
}

function StandardProviderConfigForm({
  selectedModel,
  apiKey,
  baseUrl,
  modelName,
  editingModelId,
  onApiKeyChange,
  onBaseUrlChange,
  onModelNameChange,
  onBack,
  onSubmit,
  language,
}: {
  selectedModel: AIModel
  apiKey: string
  baseUrl: string
  modelName: string
  editingModelId: string | null
  onApiKeyChange: (value: string) => void
  onBaseUrlChange: (value: string) => void
  onModelNameChange: (value: string) => void
  onBack: () => void
  onSubmit: (e: React.FormEvent) => void
  language: Language
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Selected Model Header */}
      <div
        className="p-4 rounded-xl flex items-center gap-4"
        style={{
          background: '#F1ECE2',
          border: '1px solid rgba(26,24,19,0.14)',
        }}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-nofx-bg-deeper border border-nofx-gold/20">
          {getModelIcon(selectedModel.provider || selectedModel.id, {
            width: 32,
            height: 32,
          }) || (
            <span className="text-lg font-bold" style={{ color: '#E0483B' }}>
              {selectedModel.name[0]}
            </span>
          )}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-lg" style={{ color: '#1A1813' }}>
            {getShortName(selectedModel.name)}
          </div>
          <div className="text-xs" style={{ color: '#8A8478' }}>
            {selectedModel.provider} •{' '}
            {AI_PROVIDER_CONFIG[selectedModel.provider]?.defaultModel ||
              selectedModel.id}
          </div>
        </div>
        {AI_PROVIDER_CONFIG[selectedModel.provider] && (
          <a
            href={AI_PROVIDER_CONFIG[selectedModel.provider].apiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all hover:scale-105"
            style={{
              background: 'rgba(224, 72, 59, 0.1)',
              border: '1px solid rgba(224, 72, 59, 0.3)',
            }}
          >
            <ExternalLink className="w-4 h-4" style={{ color: '#E0483B' }} />
            <span className="text-sm font-medium" style={{ color: '#E0483B' }}>
              {t('modelConfig.getApiKey', language)}
            </span>
          </a>
        )}
      </div>

      {/* Kimi Warning */}
      {selectedModel.provider === 'kimi' && (
        <div
          className="p-4 rounded-xl"
          style={{
            background: 'rgba(214, 67, 58, 0.1)',
            border: '1px solid rgba(214, 67, 58, 0.3)',
          }}
        >
          <div className="flex items-start gap-2">
            <span style={{ fontSize: '16px' }}>⚠️</span>
            <div className="text-sm" style={{ color: '#D6433A' }}>
              {t('kimiApiNote', language)}
            </div>
          </div>
        </div>
      )}

      {/* API Key / Wallet Private Key */}
      {editingModelId && selectedModel && 'has_api_key' in selectedModel && (
        <div
          className="p-3 rounded-xl text-xs"
          style={{
            background: 'rgba(46, 139, 87, 0.08)',
            border: '1px solid rgba(46, 139, 87, 0.2)',
            color: '#2E8B57',
          }}
        >
          Current model key status:{' '}
          {selectedModel.has_api_key ? 'API Key configured' : 'API Key not configured'}
        </div>
      )}

      <div className="space-y-2">
        <label
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: '#1A1813' }}
        >
          <svg
            className="w-4 h-4"
            style={{ color: '#E0483B' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
          {'API Key *'}
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder={
            editingModelId && selectedModel.has_api_key
              ? 'Saved. Re-enter to replace.'
              : t('enterAPIKey', language)
          }
          className="w-full px-4 py-3 rounded-xl"
          style={{
            background: '#F1ECE2',
            border: '1px solid rgba(26,24,19,0.14)',
            color: '#1A1813',
          }}
          required={!(editingModelId && selectedModel.has_api_key)}
        />
      </div>

      {/* Custom Base URL */}
      <div className="space-y-2">
          <label
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: '#1A1813' }}
          >
            <svg
              className="w-4 h-4"
              style={{ color: '#E0483B' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            {t('customBaseURL', language)}
          </label>
          <input
            type="url"
            value={baseUrl}
            onChange={(e) => onBaseUrlChange(e.target.value)}
            placeholder={t('customBaseURLPlaceholder', language)}
            className="w-full px-4 py-3 rounded-xl"
            style={{
              background: '#F1ECE2',
              border: '1px solid rgba(26,24,19,0.14)',
              color: '#1A1813',
            }}
          />
        <div className="text-xs" style={{ color: '#8A8478' }}>
          {t('leaveBlankForDefault', language)}
        </div>
      </div>

      {/* Custom Model Name */}
      <div className="space-y-2">
          <label
            className="flex items-center gap-2 text-sm font-semibold"
            style={{ color: '#1A1813' }}
          >
            <svg
              className="w-4 h-4"
              style={{ color: '#E0483B' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            {t('customModelName', language)}
          </label>
          <input
            type="text"
            value={modelName}
            onChange={(e) => onModelNameChange(e.target.value)}
            placeholder={t('customModelNamePlaceholder', language)}
            className="w-full px-4 py-3 rounded-xl"
            style={{
              background: '#F1ECE2',
              border: '1px solid rgba(26,24,19,0.14)',
              color: '#1A1813',
            }}
          />
        <div className="text-xs" style={{ color: '#8A8478' }}>
          {t('leaveBlankForDefaultModel', language)}
        </div>
      </div>

      {/* Info Box */}
      <div
        className="p-4 rounded-xl"
        style={{
          background: 'rgba(224, 72, 59, 0.08)',
          border: '1px solid rgba(224, 72, 59, 0.2)',
        }}
      >
        <div
          className="text-sm font-semibold mb-2 flex items-center gap-2"
          style={{ color: '#E0483B' }}
        >
          <Brain className="w-4 h-4" />
          {t('information', language)}
        </div>
        <div className="text-xs space-y-1" style={{ color: '#8A8478' }}>
          <div>• {t('modelConfigInfo1', language)}</div>
          <div>• {t('modelConfigInfo2', language)}</div>
          <div>• {t('modelConfigInfo3', language)}</div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-nofx-bg-deeper"
          style={{ background: '#E8E2D5', color: '#8A8478' }}
        >
          {editingModelId
            ? t('cancel', language)
            : t('modelConfig.back', language)}
        </button>
        <button
          type="submit"
          disabled={
            !selectedModel ||
            (!apiKey.trim() &&
              !(editingModelId && selectedModel.has_api_key))
          }
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: '#E0483B', color: '#fff' }}
        >
          {t('saveConfig', language)}
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </div>
    </form>
  )
}
