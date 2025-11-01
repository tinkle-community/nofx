import React from 'react';

interface IconProps {
  width?: number;
  height?: number;
  className?: string;
}

// Binance SVG 图标组件
const BinanceIcon: React.FC<IconProps> = ({ width = 24, height = 24, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={width} 
    height={height} 
    viewBox="-52.785 -88 457.47 528"
    className={className}
  >
    <path 
      d="M79.5 176l-39.7 39.7L0 176l39.7-39.7zM176 79.5l68.1 68.1 39.7-39.7L176 0 68.1 107.9l39.7 39.7zm136.2 56.8L272.5 176l39.7 39.7 39.7-39.7zM176 272.5l-68.1-68.1-39.7 39.7L176 352l107.8-107.9-39.7-39.7zm0-56.8l39.7-39.7-39.7-39.7-39.8 39.7z" 
      fill="#f0b90b"
    />
  </svg>
);

// Hyperliquid SVG 图标组件
const HyperliquidIcon: React.FC<IconProps> = ({ width = 24, height = 24, className }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 144 144" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path 
      d="M144 71.6991C144 119.306 114.866 134.582 99.5156 120.98C86.8804 109.889 83.1211 86.4521 64.116 84.0456C39.9942 81.0113 37.9057 113.133 22.0334 113.133C3.5504 113.133 0 86.2428 0 72.4315C0 58.3063 3.96809 39.0542 19.736 39.0542C38.1146 39.0542 39.1588 66.5722 62.132 65.1073C85.0007 63.5379 85.4184 34.8689 100.247 22.6271C113.195 12.0593 144 23.4641 144 71.6991Z" 
      fill="#97FCE4"
    />
  </svg>
);

// Aster SVG 图标组件
const AsterIcon: React.FC<IconProps> = ({ width = 24, height = 24, className }) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 32 32" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="paint0_linear_428_3535" x1="18.9416" y1="4.14314e-07" x2="12.6408" y2="32.0507" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F4D5B1"/>
        <stop offset="1" stopColor="#FFD29F"/>
      </linearGradient>
      <linearGradient id="paint1_linear_428_3535" x1="18.9416" y1="4.14314e-07" x2="12.6408" y2="32.0507" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F4D5B1"/>
        <stop offset="1" stopColor="#FFD29F"/>
      </linearGradient>
      <linearGradient id="paint2_linear_428_3535" x1="18.9416" y1="4.14314e-07" x2="12.6408" y2="32.0507" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F4D5B1"/>
        <stop offset="1" stopColor="#FFD29F"/>
      </linearGradient>
      <linearGradient id="paint3_linear_428_3535" x1="18.9416" y1="4.14314e-07" x2="12.6408" y2="32.0507" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F4D5B1"/>
      </linearGradient>
    </defs>
    <path d="M9.13309 30.4398L9.88315 26.9871C10.7197 23.1362 7.77521 19.4988 3.82118 19.4988H0.385363C1.4689 24.3374 4.75127 28.3496 9.13309 30.4398Z" fill="url(#paint0_linear_428_3535)"/>
    <path d="M10.64 31.0663C12.3326 31.6707 14.1567 32 16.0579 32C23.7199 32 30.1285 26.6527 31.7305 19.4988H21.249C16.5244 19.4988 12.4396 22.7824 11.44 27.3838L10.64 31.0663Z" fill="url(#paint1_linear_428_3535)"/>
    <path d="M32.0038 17.8987C32.0778 17.2756 32.1159 16.6415 32.1159 15.9985C32.1159 7.60402 25.629 0.719287 17.3779 0.0503251L15.1273 10.4105C14.2907 14.2614 17.2352 17.8987 21.1892 17.8987H32.0038Z" fill="url(#paint2_linear_428_3535)"/>
    <path d="M15.7459 0C7.02134 0.165717 0 7.26504 0 15.9985C0 16.6415 0.0380539 17.2756 0.112041 17.8987H3.76146C8.48603 17.8987 12.5709 14.6151 13.5705 10.0137L15.7459 0Z" fill="url(#paint3_linear_428_3535)"/>
  </svg>
);

// 获取交易所图标的函数
export const getExchangeIcon = (exchangeType: string, props: IconProps = {}) => {
  // 支持完整ID或类型名
  const type = exchangeType.toLowerCase().includes('binance') ? 'binance' :
               exchangeType.toLowerCase().includes('hyperliquid') ? 'hyperliquid' :
               exchangeType.toLowerCase().includes('aster') ? 'aster' : 
               exchangeType.toLowerCase();
  
  const iconProps = {
    width: props.width || 24,
    height: props.height || 24,
    className: props.className
  };
  
  switch (type) {
    case 'binance':
    case 'cex':
      return <BinanceIcon {...iconProps} />;
    case 'hyperliquid':
    case 'dex':
      return <HyperliquidIcon {...iconProps} />;
    case 'aster':
      return <AsterIcon {...iconProps} />;
    default:
      return (
        <div 
          className={props.className}
          style={{ 
            width: props.width || 24, 
            height: props.height || 24,
            borderRadius: '50%',
            background: '#2B3139',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#EAECEF'
          }}
        >
          {type[0]?.toUpperCase() || '?'}
        </div>
      );
  }
};