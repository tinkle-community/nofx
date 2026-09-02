import React from 'react'

interface IconProps {
  width?: number
  height?: number
  className?: string
}

// Local icon path mapping
const ICON_PATHS: Record<string, string> = {
  binance: '/exchange-icons/binance.jpg',
  bybit: '/exchange-icons/bybit.png',
  okx: '/exchange-icons/okx.svg',
  bitget: '/exchange-icons/bitget.svg',
  gate: '/exchange-icons/gate.svg',
  kucoin: '/exchange-icons/kucoin.svg',
  hyperliquid: '/exchange-icons/hyperliquid.png',
  aster: '/exchange-icons/aster.svg',
  lighter: '/exchange-icons/lighter.png',
  indodax: '/exchange-icons/indodax.png',
}

// Generic icon component
const ExchangeImage: React.FC<IconProps & { src: string; alt: string }> = ({
  width = 24,
  height = 24,
  className,
  src,
  alt,
}) => (
  <div
    className={className}
    style={{
      width,
      height,
      borderRadius: 6,
      overflow: 'hidden',
      flexShrink: 0,
      background: '#E8E2D5',
    }}
  >
    <img
      src={src}
      alt={alt}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  </div>
)

// Fallback icon
const FallbackIcon: React.FC<IconProps & { label: string }> = ({
  width = 24,
  height = 24,
  className,
  label,
}) => (
  <div
    className={className}
    style={{
      width,
      height,
      borderRadius: 6,
      background: '#E8E2D5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: Math.max(10, (width || 24) * 0.4),
      fontWeight: 'bold',
      color: '#1A1813',
      flexShrink: 0,
    }}
  >
    {label[0]?.toUpperCase() || '?'}
  </div>
)

// Returns the icon for an exchange
export const getExchangeIcon = (
  exchangeType: string,
  props: IconProps = {}
) => {
  const lowerType = exchangeType.toLowerCase()
  if (lowerType === 'mexc_paper') {
    const size = props.width || 24
    return (
      <div
        className={props.className}
        style={{
          width: size,
          height: props.height || size,
          borderRadius: 6,
          background: '#2E8B57',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.max(7, size * 0.2),
          fontWeight: 800,
          letterSpacing: '-0.02em',
          flexShrink: 0,
        }}
      >
        PAPER
      </div>
    )
  }

  const type = lowerType.includes('binance')
    ? 'binance'
    : lowerType.includes('bybit')
      ? 'bybit'
      : lowerType.includes('okx')
        ? 'okx'
        : lowerType.includes('bitget')
          ? 'bitget'
          : lowerType.includes('gate')
            ? 'gate'
            : lowerType.includes('kucoin')
              ? 'kucoin'
              : lowerType.includes('hyperliquid')
                ? 'hyperliquid'
                : lowerType.includes('aster')
                  ? 'aster'
                  : lowerType.includes('lighter')
                    ? 'lighter'
                    : lowerType.includes('indodax')
                      ? 'indodax'
                      : lowerType

  const iconProps = {
    width: props.width || 24,
    height: props.height || 24,
    className: props.className,
  }

  const path = ICON_PATHS[type]
  if (path) {
    return <ExchangeImage {...iconProps} src={path} alt={type} />
  }

  return <FallbackIcon {...iconProps} label={type} />
}
