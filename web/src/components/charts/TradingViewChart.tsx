import { useEffect, useRef, useState, memo } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { t } from '../../i18n/translations'
import { ChevronDown, TrendingUp, X } from 'lucide-react'
import { MODAL_LAYERS, ModalPortal } from '../ui/modal-portal'

// Supported exchanges list (futures format)
const EXCHANGES = [
  { id: 'BINANCE', name: 'Binance', prefix: 'BINANCE:', suffix: '.P' },
  { id: 'BYBIT', name: 'Bybit', prefix: 'BYBIT:', suffix: '.P' },
  { id: 'OKX', name: 'OKX', prefix: 'OKX:', suffix: '.P' },
  { id: 'BITGET', name: 'Bitget', prefix: 'BITGET:', suffix: '.P' },
  { id: 'MEXC', name: 'MEXC', prefix: 'MEXC:', suffix: '.P' },
  { id: 'GATEIO', name: 'Gate.io', prefix: 'GATEIO:', suffix: '.P' },
] as const

// Popular trading pairs
const POPULAR_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'SOLUSDT',
  'BNBUSDT',
  'XRPUSDT',
  'DOGEUSDT',
  'ADAUSDT',
  'AVAXUSDT',
  'DOTUSDT',
  'LINKUSDT',
  'MATICUSDT',
  'LTCUSDT',
]

// Time interval options
const INTERVALS = [
  { id: '1', label: '1m' },
  { id: '5', label: '5m' },
  { id: '15', label: '15m' },
  { id: '30', label: '30m' },
  { id: '60', label: '1H' },
  { id: '240', label: '4H' },
  { id: 'D', label: '1D' },
  { id: 'W', label: '1W' },
]

interface TradingViewChartProps {
  defaultSymbol?: string
  defaultExchange?: string
  height?: number
  showToolbar?: boolean
  embedded?: boolean // Embedded mode (does not show the outer card)
}

function TradingViewChartComponent({
  defaultSymbol = 'BTCUSDT',
  defaultExchange = 'BINANCE',
  height = 400,
  showToolbar = true,
  embedded = false,
}: TradingViewChartProps) {
  const { language } = useLanguage()
  const containerRef = useRef<HTMLDivElement>(null)
  const [exchange, setExchange] = useState(defaultExchange)
  const [symbol, setSymbol] = useState(defaultSymbol)
  const [timeInterval, setTimeInterval] = useState('60')
  const [customSymbol, setCustomSymbol] = useState('')
  const [showExchangeDropdown, setShowExchangeDropdown] = useState(false)
  const [showSymbolDropdown, setShowSymbolDropdown] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Update the internal symbol when the external defaultSymbol changes
  useEffect(() => {
    if (defaultSymbol && defaultSymbol !== symbol) {
      // console.log('[TradingViewChart] Updating symbol:', defaultSymbol)
      setSymbol(defaultSymbol)
    }
  }, [defaultSymbol])

  // Update the internal exchange when the external defaultExchange changes
  useEffect(() => {
    if (defaultExchange && defaultExchange !== exchange) {
      const normalizedExchange = defaultExchange.toUpperCase()
      // console.log('[TradingViewChart] Updating exchange:', normalizedExchange)
      if (EXCHANGES.some(e => e.id === normalizedExchange)) {
        setExchange(normalizedExchange)
      }
    }
  }, [defaultExchange])

  // Get the full trading pair symbol (futures format: BINANCE:BTCUSDT.P)
  const getFullSymbol = () => {
    const exchangeInfo = EXCHANGES.find((e) => e.id === exchange)
    const prefix = exchangeInfo?.prefix || 'BINANCE:'
    const suffix = exchangeInfo?.suffix || '.P'
    return `${prefix}${symbol}${suffix}`
  }

  // Load the TradingView Widget
  useEffect(() => {
    if (!containerRef.current) return

    // Clear the container
    containerRef.current.innerHTML = ''

    // Create the widget container
    const widgetContainer = document.createElement('div')
    widgetContainer.className = 'tradingview-widget-container'
    widgetContainer.style.height = '100%'
    widgetContainer.style.width = '100%'

    const widgetDiv = document.createElement('div')
    widgetDiv.className = 'tradingview-widget-container__widget'
    widgetDiv.style.height = '100%'
    widgetDiv.style.width = '100%'

    widgetContainer.appendChild(widgetDiv)
    containerRef.current.appendChild(widgetContainer)

    // Load the TradingView script
    const script = document.createElement('script')
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.type = 'text/javascript'
    script.async = true
    script.innerHTML = JSON.stringify({
      width: '100%',
      height: '100%',
      symbol: getFullSymbol(),
      interval: timeInterval,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai',
      theme: 'light',
      style: '1',
      locale: language === 'zh' ? 'zh_CN' : 'en',
      enable_publishing: false,
      backgroundColor: 'rgba(241, 236, 226, 1)',
      gridColor: 'rgba(26, 24, 19, 0.08)',
      hide_top_toolbar: !showToolbar,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
    })

    widgetContainer.appendChild(script)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [exchange, symbol, timeInterval, language, showToolbar])

  // Handle custom trading pair input
  const handleCustomSymbolSubmit = () => {
    if (customSymbol.trim()) {
      let sym = customSymbol.trim().toUpperCase()
      // If there is no USDT suffix, add it automatically
      if (!sym.endsWith('USDT')) {
        sym = sym + 'USDT'
      }
      setSymbol(sym)
      setCustomSymbol('')
      setShowSymbolDropdown(false)
    }
  }

  const chartContent = (
    <div
      className={`${embedded ? '' : 'binance-card'} overflow-hidden ${embedded ? '' : 'animate-fade-in'} ${isFullscreen
          ? `fixed inset-0 ${MODAL_LAYERS.primary} rounded-none flex flex-col`
          : ''
        }`}
      style={isFullscreen ? { background: '#F1ECE2' } : undefined}
    >
      {/* Header */}
      <div
        className="flex flex-wrap items-center gap-2 p-3 sm:p-4"
        style={{ borderBottom: embedded ? 'none' : '1px solid rgba(26, 24, 19, 0.14)' }}
      >
        {!embedded && (
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: '#E0483B' }} />
            <h3
              className="text-base sm:text-lg font-bold"
              style={{ color: '#1A1813' }}
            >
              {t('marketChart', language)}
            </h3>
          </div>
        )}

        {/* Controls */}
        <div className={`flex flex-wrap items-center gap-2 ${embedded ? '' : 'ml-auto'}`}>
          {/* Exchange Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowExchangeDropdown(!showExchangeDropdown)
                setShowSymbolDropdown(false)
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-all"
              style={{
                background: '#F7F4EC',
                border: '1px solid rgba(26, 24, 19, 0.14)',
                color: '#1A1813',
              }}
            >
              {EXCHANGES.find((e) => e.id === exchange)?.name || exchange}
              <ChevronDown className="w-4 h-4" style={{ color: '#8A8478' }} />
            </button>

            {showExchangeDropdown && (
              <div
                className="absolute top-full left-0 mt-1 py-1 rounded-lg shadow-xl z-20 min-w-[120px]"
                style={{
                  background: '#F7F4EC',
                  border: '1px solid rgba(26, 24, 19, 0.14)',
                }}
              >
                {EXCHANGES.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      setExchange(ex.id)
                      setShowExchangeDropdown(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm transition-all hover:bg-opacity-50"
                    style={{
                      color: exchange === ex.id ? '#E0483B' : '#1A1813',
                      background:
                        exchange === ex.id
                          ? 'rgba(224, 72, 59, 0.1)'
                          : 'transparent',
                    }}
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Symbol Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSymbolDropdown(!showSymbolDropdown)
                setShowExchangeDropdown(false)
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-bold transition-all"
              style={{
                background: 'rgba(224, 72, 59, 0.1)',
                border: '1px solid rgba(224, 72, 59, 0.3)',
                color: '#E0483B',
              }}
            >
              {symbol}
              <ChevronDown className="w-4 h-4" />
            </button>

            {showSymbolDropdown && (
              <div
                className="absolute top-full left-0 mt-1 py-2 rounded-lg shadow-xl z-20 w-[280px]"
                style={{
                  background: '#F7F4EC',
                  border: '1px solid rgba(26, 24, 19, 0.14)',
                }}
              >
                {/* Custom Input */}
                <div className="px-3 pb-2" style={{ borderBottom: '1px solid rgba(26, 24, 19, 0.14)' }}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSymbol}
                      onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleCustomSymbolSubmit()}
                      placeholder={t('enterSymbol', language)}
                      className="flex-1 px-3 py-1.5 rounded text-sm"
                      style={{
                        background: '#F1ECE2',
                        border: '1px solid rgba(26, 24, 19, 0.14)',
                        color: '#1A1813',
                      }}
                    />
                    <button
                      onClick={handleCustomSymbolSubmit}
                      className="px-3 py-1.5 rounded text-sm font-medium"
                      style={{
                        background: '#E0483B',
                        color: '#F1ECE2',
                      }}
                    >
                      OK
                    </button>
                  </div>
                </div>

                {/* Popular Symbols */}
                <div className="px-2 pt-2">
                  <div
                    className="text-xs px-2 py-1 mb-1"
                    style={{ color: '#8A8478' }}
                  >
                    {t('popularSymbols', language)}
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {POPULAR_SYMBOLS.map((sym) => (
                      <button
                        key={sym}
                        onClick={() => {
                          setSymbol(sym)
                          setShowSymbolDropdown(false)
                        }}
                        className="px-2 py-1.5 rounded text-xs font-medium transition-all"
                        style={{
                          color: symbol === sym ? '#E0483B' : '#1A1813',
                          background:
                            symbol === sym
                              ? 'rgba(224, 72, 59, 0.1)'
                              : 'rgba(26, 24, 19, 0.04)',
                        }}
                      >
                        {sym.replace('USDT', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interval Selector */}
          <div
            className="flex gap-0.5 p-0.5 rounded"
            style={{ background: '#E8E2D5', border: '1px solid rgba(26, 24, 19, 0.14)' }}
          >
            {INTERVALS.map((int) => (
              <button
                key={int.id}
                onClick={() => setTimeInterval(int.id)}
                className="px-2 py-1 rounded text-xs font-medium transition-all"
                style={{
                  background: timeInterval === int.id ? '#E0483B' : 'transparent',
                  color: timeInterval === int.id ? '#F1ECE2' : '#8A8478',
                }}
              >
                {int.label}
              </button>
            ))}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded transition-all"
            style={{
              background: isFullscreen ? '#E0483B' : 'transparent',
              color: isFullscreen ? '#F1ECE2' : '#8A8478',
              border: '1px solid rgba(26, 24, 19, 0.14)',
            }}
            title={isFullscreen ? t('exitFullscreen', language) : t('fullscreen', language)}
          >
            {isFullscreen ? (
              <X className="w-4 h-4" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div
        ref={containerRef}
        style={{
          height: isFullscreen ? 'calc(100vh - 65px)' : height,
          background: '#F1ECE2',
          overflow: 'hidden',
        }}
      />

      {/* Click outside to close dropdowns */}
      {(showExchangeDropdown || showSymbolDropdown) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowExchangeDropdown(false)
            setShowSymbolDropdown(false)
          }}
        />
      )}
    </div>
  )

  return isFullscreen ? <ModalPortal>{chartContent}</ModalPortal> : chartContent
}

// Use memo to avoid unnecessary re-renders
export const TradingViewChart = memo(TradingViewChartComponent)
