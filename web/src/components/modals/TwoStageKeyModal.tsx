import { useEffect, useMemo, useRef, useState } from 'react'
import { t, type Language } from '../../i18n/translations'
import { toast } from 'sonner'
import { WebCryptoEnvironmentCheck } from '../common/WebCryptoEnvironmentCheck'
import { MODAL_LAYERS, ModalPortal } from '../ui/modal-portal'

const DEFAULT_LENGTH = 64

function generateObfuscation(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  )
}

function validatePrivateKeyFormat(
  value: string,
  expectedLength: number
): boolean {
  const normalized = value.startsWith('0x') ? value.slice(2) : value
  if (normalized.length !== expectedLength) {
    return false
  }
  return /^[0-9a-fA-F]+$/.test(normalized)
}

export interface TwoStageKeyModalResult {
  value: string
  obfuscationLog: string[]
}

interface TwoStageKeyModalProps {
  isOpen: boolean
  language: Language
  onCancel: () => void
  onComplete: (result: TwoStageKeyModalResult) => void
  expectedLength?: number
  contextLabel?: string
}

export function TwoStageKeyModal({
  isOpen,
  language,
  onCancel,
  onComplete,
  expectedLength = DEFAULT_LENGTH,
  contextLabel,
}: TwoStageKeyModalProps) {
  const [stage, setStage] = useState<1 | 2>(1)
  const [part1, setPart1] = useState('')
  const [part2, setPart2] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [clipboardStatus, setClipboardStatus] = useState<
    'idle' | 'copied' | 'failed'
  >('idle')
  const [obfuscationLog, setObfuscationLog] = useState<string[]>([])
  const [processing, setProcessing] = useState(false)
  const [manualObfuscationValue, setManualObfuscationValue] = useState<
    string | null
  >(null)

  const stage1Ref = useRef<HTMLInputElement>(null)
  const stage2Ref = useRef<HTMLInputElement>(null)

  // UX improvement: Use 58 + 6 split (most of the key + last 6 chars)
  // Advantage: Second stage only requires entering 6 characters, much easier to count
  const expectedPart1Length = expectedLength - 6  // 64 - 6 = 58
  const expectedPart2Length = 6  // Last 6 characters

  useEffect(() => {
    if (isOpen && stage === 1 && stage1Ref.current) {
      stage1Ref.current.focus()
    } else if (isOpen && stage === 2 && stage2Ref.current) {
      stage2Ref.current.focus()
    }
  }, [isOpen, stage])

  const handleStage1Next = async () => {
    // ✅ Normalize input (remove possible 0x prefix) before validating length
    const normalized1 = part1.startsWith('0x') ? part1.slice(2) : part1
    if (normalized1.length < expectedPart1Length) {
      setError(
        t('errors.privatekeyIncomplete', language, {
          expected: expectedPart1Length,
        })
      )
      return
    }

    setError(null)
    setProcessing(true)

    try {
      // Generate obfuscation string
      const obfuscation = generateObfuscation()
      setManualObfuscationValue(obfuscation)

      // Try to copy to clipboard
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(obfuscation)
          setClipboardStatus('copied')
          setObfuscationLog([
            ...obfuscationLog,
            `Stage 1: ${new Date().toISOString()} - Auto copied obfuscation`,
          ])
          toast.success('Obfuscation string copied to clipboard')
        } catch {
          setClipboardStatus('failed')
          setObfuscationLog([
            ...obfuscationLog,
            `Stage 1: ${new Date().toISOString()} - Auto copy failed, manual required`,
          ])
          toast.error('Copy failed, please copy the obfuscation string manually')
        }
      } else {
        setClipboardStatus('failed')
        setObfuscationLog([
          ...obfuscationLog,
          `Stage 1: ${new Date().toISOString()} - Clipboard API not available`,
        ])
        toast('This browser does not support automatic copy, please copy manually')
      }

      setTimeout(() => {
        setStage(2)
        setProcessing(false)
      }, 2000)
    } catch (err) {
      setError(t('errors.privatekeyObfuscationFailed', language))
      setProcessing(false)
    }
  }

  const handleStage2Complete = () => {
    // ✅ Normalize input (remove possible 0x prefix) before validating length
    const normalized2 = part2.startsWith('0x') ? part2.slice(2) : part2
    if (normalized2.length < expectedPart2Length) {
      setError(
        t('errors.privatekeyIncomplete', language, {
          expected: expectedPart2Length,
        })
      )
      return
    }

    // ✅ Concatenate after removing 0x prefix from both parts
    const normalized1 = part1.startsWith('0x') ? part1.slice(2) : part1
    const fullKey = normalized1 + normalized2
    if (!validatePrivateKeyFormat(fullKey, expectedLength)) {
      setError(t('errors.privatekeyInvalidFormat', language))
      return
    }

    const finalLog = [
      ...obfuscationLog,
      `Stage 2: ${new Date().toISOString()} - Completed`,
    ]
    onComplete({
      value: fullKey,
      obfuscationLog: finalLog,
    })
  }

  const handleReset = () => {
    setStage(1)
    setPart1('')
    setPart2('')
    setError(null)
    setClipboardStatus('idle')
    setObfuscationLog([])
    setProcessing(false)
    setManualObfuscationValue(null)
  }

  const modalContent = useMemo(() => {
    if (!isOpen) return null

    return (
      <div
        className={`fixed inset-0 ${MODAL_LAYERS.critical} flex items-center justify-center bg-black/80`}
      >
        <div className="bg-nofx-bg-lighter p-8 rounded-xl max-w-lg w-full mx-4 border border-[rgba(26,24,19,0.14)]">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-nofx-text mb-2">
              🔐 {t('twoStageKey.title', language)}
              {contextLabel && (
                <span className="text-nofx-text-muted text-base font-normal ml-2">
                  ({contextLabel})
                </span>
              )}
            </h2>
            <p className="text-nofx-text-muted text-sm">
              {stage === 1
                ? t('twoStageKey.stage1Description', language, {
                    length: expectedPart1Length,
                  })
                : t('twoStageKey.stage2Description', language, {
                    length: expectedPart2Length,
                  })}
            </p>
          </div>

          <div className="mb-6">
            <WebCryptoEnvironmentCheck language={language} variant="compact" />
          </div>

          {/* Stage 1 */}
          {stage === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-nofx-text-muted text-sm mb-2">
                  {t('twoStageKey.stage1InputLabel', language)} (
                  {expectedPart1Length} {t('twoStageKey.characters', language)})
                </label>
                <input
                  ref={stage1Ref}
                  type="password"
                  value={part1}
                  onChange={(e) => setPart1(e.target.value)}
                  placeholder="0x1234..."
                  className="w-full bg-nofx-bg-deeper border border-[rgba(26,24,19,0.14)] rounded-lg px-4 py-3 text-nofx-text font-mono text-sm focus:border-nofx-gold focus:outline-none"
                  maxLength={expectedPart1Length + 2} // +2 for optional 0x prefix
                  disabled={processing}
                />
              </div>

              {error && <div className="text-nofx-danger text-sm">{error}</div>}

              <div className="flex gap-3">
                <button
                  onClick={handleStage1Next}
                  disabled={
                    (part1.startsWith('0x') ? part1.slice(2) : part1).length <
                      expectedPart1Length || processing
                  }
                  className="flex-1 bg-nofx-gold hover:bg-nofx-gold-highlight disabled:bg-nofx-bg-deeper disabled:text-nofx-text-muted text-nofx-bg font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  {processing
                    ? t('twoStageKey.processing', language)
                    : t('twoStageKey.nextButton', language)}
                </button>
                <button
                  onClick={onCancel}
                  disabled={processing}
                  className="px-6 py-3 text-nofx-text-muted hover:text-nofx-text border border-[rgba(26,24,19,0.14)] rounded-lg transition-colors"
                >
                  {t('twoStageKey.cancelButton', language)}
                </button>
              </div>
            </div>
          )}

          {/* Transition Message */}
          {stage === 2 && clipboardStatus !== 'idle' && (
            <div className="mb-4 p-4 rounded-lg bg-nofx-gold/10 border border-nofx-gold/40">
              {clipboardStatus === 'copied' && (
                <div className="text-nofx-text">
                  <div className="font-medium">
                    {t('twoStageKey.obfuscationCopied', language)}
                  </div>
                  <div className="text-sm mt-1">
                    {t('twoStageKey.obfuscationInstruction', language)}
                  </div>
                </div>
              )}
              {clipboardStatus === 'failed' && manualObfuscationValue && (
                <div className="text-nofx-gold">
                  <div className="font-medium">
                    {t('twoStageKey.obfuscationManual', language)}
                  </div>
                  <div className="text-xs mt-2 p-2 bg-nofx-bg-deeper rounded font-mono break-all border border-[rgba(26,24,19,0.14)]">
                    {manualObfuscationValue}
                  </div>
                  <div className="text-sm mt-1">
                    {t('twoStageKey.obfuscationInstruction', language)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stage 2 */}
          {stage === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-nofx-text-muted text-sm mb-2">
                  {t('twoStageKey.stage2InputLabel', language)} (
                  {expectedPart2Length} {t('twoStageKey.characters', language)})
                </label>
                <input
                  ref={stage2Ref}
                  type="password"
                  value={part2}
                  onChange={(e) => setPart2(e.target.value)}
                  placeholder="...5678"
                  className="w-full bg-nofx-bg-deeper border border-[rgba(26,24,19,0.14)] rounded-lg px-4 py-3 text-nofx-text font-mono text-sm focus:border-nofx-gold focus:outline-none"
                  maxLength={expectedPart2Length + 2}
                />
              </div>

              {error && <div className="text-nofx-danger text-sm">{error}</div>}

              <div className="flex gap-3">
                <button
                  onClick={handleStage2Complete}
                  disabled={
                    (part2.startsWith('0x') ? part2.slice(2) : part2).length <
                    expectedPart2Length
                  }
                  className="flex-1 bg-nofx-success hover:bg-nofx-success/90 disabled:bg-nofx-bg-deeper disabled:text-nofx-text-muted text-nofx-bg font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  🔒 {t('twoStageKey.encryptButton', language)}
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 text-nofx-text-muted hover:text-nofx-text border border-[rgba(26,24,19,0.14)] rounded-lg transition-colors"
                >
                  {t('twoStageKey.backButton', language)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }, [
    isOpen,
    stage,
    part1,
    part2,
    error,
    processing,
    clipboardStatus,
    manualObfuscationValue,
    language,
    expectedPart1Length,
    expectedPart2Length,
    contextLabel,
    obfuscationLog,
    onCancel,
    onComplete,
  ])

  if (!isOpen) return null

  return <ModalPortal>{modalContent}</ModalPortal>
}
