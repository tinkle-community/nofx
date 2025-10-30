import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import useSWR from 'swr';
import { api } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n/translations';

interface EquityPoint {
  timestamp: string;
  total_equity: number;
  pnl: number;
  pnl_pct: number;
  cycle_number: number;
}

interface EquityChartProps {
  traderId?: string;
}

export function EquityChart({ traderId }: EquityChartProps) {
  const { language } = useLanguage();
  const [displayMode, setDisplayMode] = useState<'dollar' | 'percent'>('dollar');

  const { data: history, error } = useSWR<EquityPoint[]>(
    traderId ? `equity-history-${traderId}` : 'equity-history',
    () => api.getEquityHistory(traderId),
    {
<<<<<<< HEAD
      refreshInterval: 10000, // 每10秒刷新
=======
      refreshInterval: 30000, // 30秒刷新（历史数据更新频率较低）
      revalidateOnFocus: false,
      dedupingInterval: 20000,
>>>>>>> upstream/main
    }
  );

  const { data: account } = useSWR(
    traderId ? `account-${traderId}` : 'account',
    () => api.getAccount(traderId),
    {
<<<<<<< HEAD
      refreshInterval: 5000,
=======
      refreshInterval: 15000, // 15秒刷新（配合后端缓存）
      revalidateOnFocus: false,
      dedupingInterval: 10000,
>>>>>>> upstream/main
    }
  );

  if (error) {
    return (
      <div className="binance-card p-6">
        <div className="flex items-center gap-3 p-4 rounded" style={{ background: 'rgba(246, 70, 93, 0.1)', border: '1px solid rgba(246, 70, 93, 0.2)' }}>
          <div className="text-2xl">⚠️</div>
          <div>
            <div className="font-semibold" style={{ color: '#F6465D' }}>{t('loadingError', language)}</div>
            <div className="text-sm" style={{ color: '#848E9C' }}>{error.message}</div>
          </div>
        </div>
      </div>
    );
  }

<<<<<<< HEAD
  if (!history || history.length === 0) {
=======
  // 过滤掉无效数据：total_equity为0或小于1的数据点（API失败导致）
  const validHistory = history?.filter(point => point.total_equity > 1) || [];

  if (!validHistory || validHistory.length === 0) {
>>>>>>> upstream/main
    return (
      <div className="binance-card p-6">
        <h3 className="text-lg font-semibold mb-6" style={{ color: '#EAECEF' }}>{t('accountEquityCurve', language)}</h3>
        <div className="text-center py-16" style={{ color: '#848E9C' }}>
          <div className="text-6xl mb-4 opacity-50">📊</div>
          <div className="text-lg font-semibold mb-2">{t('noHistoricalData', language)}</div>
          <div className="text-sm">{t('dataWillAppear', language)}</div>
        </div>
      </div>
    );
  }

  // 限制显示最近的数据点（性能优化）
  // 如果数据超过2000个点，只显示最近2000个
  const MAX_DISPLAY_POINTS = 2000;
<<<<<<< HEAD
  const displayHistory = history.length > MAX_DISPLAY_POINTS
    ? history.slice(-MAX_DISPLAY_POINTS)
    : history;

  // 计算初始余额（使用第一个数据点，如果无数据则从account获取，最后才用默认值）
  const initialBalance = history[0]?.total_equity
=======
  const displayHistory = validHistory.length > MAX_DISPLAY_POINTS
    ? validHistory.slice(-MAX_DISPLAY_POINTS)
    : validHistory;

  // 计算初始余额（使用第一个有效数据点，如果无数据则从account获取，最后才用默认值）
  const initialBalance = validHistory[0]?.total_equity
>>>>>>> upstream/main
    || account?.total_equity
    || 100;  // 默认值改为100，与常见配置一致

  // 转换数据格式
  const chartData = displayHistory.map((point) => {
    const pnl = point.total_equity - initialBalance;
    const pnlPct = ((pnl / initialBalance) * 100).toFixed(2);
    return {
      time: new Date(point.timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      value: displayMode === 'dollar' ? point.total_equity : parseFloat(pnlPct),
      cycle: point.cycle_number,
      raw_equity: point.total_equity,
      raw_pnl: pnl,
      raw_pnl_pct: parseFloat(pnlPct),
    };
  });

  const currentValue = chartData[chartData.length - 1];
  const isProfit = currentValue.raw_pnl >= 0;

  // 计算Y轴范围
  const calculateYDomain = () => {
    if (displayMode === 'percent') {
      // 百分比模式：找到最大最小值，留20%余量
      const values = chartData.map(d => d.value);
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const range = Math.max(Math.abs(maxVal), Math.abs(minVal));
      const padding = Math.max(range * 0.2, 1); // 至少留1%余量
      return [Math.floor(minVal - padding), Math.ceil(maxVal + padding)];
    } else {
      // 美元模式：以初始余额为基准，上下留10%余量
      const values = chartData.map(d => d.value);
      const minVal = Math.min(...values, initialBalance);
      const maxVal = Math.max(...values, initialBalance);
      const range = maxVal - minVal;
      const padding = Math.max(range * 0.15, initialBalance * 0.01); // 至少留1%余量
      return [
        Math.floor(minVal - padding),
        Math.ceil(maxVal + padding)
      ];
    }
  };

  // 自定义Tooltip - Binance Style
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded p-3 shadow-xl" style={{ background: '#1E2329', border: '1px solid #2B3139' }}>
          <div className="text-xs mb-1" style={{ color: '#848E9C' }}>Cycle #{data.cycle}</div>
          <div className="font-bold mono" style={{ color: '#EAECEF' }}>
            {data.raw_equity.toFixed(2)} USDT
          </div>
          <div
            className="text-sm mono font-bold"
            style={{ color: data.raw_pnl >= 0 ? '#0ECB81' : '#F6465D' }}
          >
            {data.raw_pnl >= 0 ? '+' : ''}
            {data.raw_pnl.toFixed(2)} USDT ({data.raw_pnl_pct >= 0 ? '+' : ''}
            {data.raw_pnl_pct}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
<<<<<<< HEAD
    <div className="binance-card p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold mb-2" style={{ color: '#EAECEF' }}>{t('accountEquityCurve', language)}</h3>
          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-bold mono" style={{ color: '#EAECEF' }}>
              {account?.total_equity.toFixed(2) || '0.00'}
              <span className="text-lg ml-1" style={{ color: '#848E9C' }}>USDT</span>
            </span>
            <div className="flex items-center gap-2">
              <span
                className="text-lg font-bold mono px-3 py-1 rounded"
=======
    <div className="binance-card p-3 sm:p-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: '#EAECEF' }}>{t('accountEquityCurve', language)}</h3>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
            <span className="text-2xl sm:text-3xl font-bold mono" style={{ color: '#EAECEF' }}>
              {account?.total_equity.toFixed(2) || '0.00'}
              <span className="text-base sm:text-lg ml-1" style={{ color: '#848E9C' }}>USDT</span>
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-sm sm:text-lg font-bold mono px-2 sm:px-3 py-1 rounded"
>>>>>>> upstream/main
                style={{
                  color: isProfit ? '#0ECB81' : '#F6465D',
                  background: isProfit ? 'rgba(14, 203, 129, 0.1)' : 'rgba(246, 70, 93, 0.1)',
                  border: `1px solid ${isProfit ? 'rgba(14, 203, 129, 0.2)' : 'rgba(246, 70, 93, 0.2)'}`
                }}
              >
                {isProfit ? '▲' : '▼'} {isProfit ? '+' : ''}
                {currentValue.raw_pnl_pct}%
              </span>
<<<<<<< HEAD
              <span className="text-sm mono" style={{ color: '#848E9C' }}>
=======
              <span className="text-xs sm:text-sm mono" style={{ color: '#848E9C' }}>
>>>>>>> upstream/main
                ({isProfit ? '+' : ''}{currentValue.raw_pnl.toFixed(2)} USDT)
              </span>
            </div>
          </div>
        </div>

        {/* Display Mode Toggle */}
<<<<<<< HEAD
        <div className="flex gap-1 rounded p-1" style={{ background: '#0B0E11', border: '1px solid #2B3139' }}>
          <button
            onClick={() => setDisplayMode('dollar')}
            className="px-4 py-2 rounded text-sm font-bold transition-all"
=======
        <div className="flex gap-0.5 sm:gap-1 rounded p-0.5 sm:p-1 self-start sm:self-auto" style={{ background: '#0B0E11', border: '1px solid #2B3139' }}>
          <button
            onClick={() => setDisplayMode('dollar')}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-bold transition-all"
>>>>>>> upstream/main
            style={displayMode === 'dollar'
              ? { background: '#F0B90B', color: '#000', boxShadow: '0 2px 8px rgba(240, 185, 11, 0.4)' }
              : { background: 'transparent', color: '#848E9C' }
            }
          >
            💵 USDT
          </button>
          <button
            onClick={() => setDisplayMode('percent')}
<<<<<<< HEAD
            className="px-4 py-2 rounded text-sm font-bold transition-all"
=======
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-bold transition-all"
>>>>>>> upstream/main
            style={displayMode === 'percent'
              ? { background: '#F0B90B', color: '#000', boxShadow: '0 2px 8px rgba(240, 185, 11, 0.4)' }
              : { background: 'transparent', color: '#848E9C' }
            }
          >
            📊 %
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="my-2" style={{ borderRadius: '8px', overflow: 'hidden' }}>
        <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: 5, bottom: 30 }}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F0B90B" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#FCD535" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2B3139" />
          <XAxis
            dataKey="time"
            stroke="#5E6673"
            tick={{ fill: '#848E9C', fontSize: 11 }}
            tickLine={{ stroke: '#2B3139' }}
            interval={Math.floor(chartData.length / 10)}
            angle={-15}
            textAnchor="end"
            height={60}
          />
          <YAxis
            stroke="#5E6673"
            tick={{ fill: '#848E9C', fontSize: 12 }}
            tickLine={{ stroke: '#2B3139' }}
            domain={calculateYDomain()}
            tickFormatter={(value) =>
              displayMode === 'dollar' ? `$${value.toFixed(0)}` : `${value}%`
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={displayMode === 'dollar' ? initialBalance : 0}
            stroke="#474D57"
            strokeDasharray="3 3"
            label={{
              value: displayMode === 'dollar' ? t('initialBalance', language).split(' ')[0] : '0%',
              fill: '#848E9C',
              fontSize: 12,
            }}
          />
          <Line
<<<<<<< HEAD
            type="monotone"
            dataKey="value"
            stroke="url(#colorGradient)"
            strokeWidth={2.5}
            dot={chartData.length > 50 ? false : { fill: '#F0B90B', r: 3 }}
            activeDot={{ r: 6, fill: '#FCD535', stroke: '#F0B90B', strokeWidth: 2 }}
=======
            type="natural"
            dataKey="value"
            stroke="url(#colorGradient)"
            strokeWidth={3}
            dot={chartData.length > 50 ? false : { fill: '#F0B90B', r: 3 }}
            activeDot={{ r: 6, fill: '#FCD535', stroke: '#F0B90B', strokeWidth: 2 }}
            connectNulls={true}
>>>>>>> upstream/main
          />
        </LineChart>
      </ResponsiveContainer>
      </div>

      {/* Footer Stats */}
<<<<<<< HEAD
      <div className="mt-3 grid grid-cols-4 gap-3 pt-3" style={{ borderTop: '1px solid #2B3139' }}>
        <div className="p-2 rounded transition-all hover:bg-opacity-50" style={{ background: 'rgba(240, 185, 11, 0.05)' }}>
          <div className="text-xs mb-1 uppercase tracking-wider" style={{ color: '#848E9C' }}>{t('initialBalance', language)}</div>
          <div className="text-sm font-bold mono" style={{ color: '#EAECEF' }}>
=======
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-3" style={{ borderTop: '1px solid #2B3139' }}>
        <div className="p-2 rounded transition-all hover:bg-opacity-50" style={{ background: 'rgba(240, 185, 11, 0.05)' }}>
          <div className="text-xs mb-1 uppercase tracking-wider" style={{ color: '#848E9C' }}>{t('initialBalance', language)}</div>
          <div className="text-xs sm:text-sm font-bold mono" style={{ color: '#EAECEF' }}>
>>>>>>> upstream/main
            {initialBalance.toFixed(2)} USDT
          </div>
        </div>
        <div className="p-2 rounded transition-all hover:bg-opacity-50" style={{ background: 'rgba(240, 185, 11, 0.05)' }}>
          <div className="text-xs mb-1 uppercase tracking-wider" style={{ color: '#848E9C' }}>{t('currentEquity', language)}</div>
<<<<<<< HEAD
          <div className="text-sm font-bold mono" style={{ color: '#EAECEF' }}>
=======
          <div className="text-xs sm:text-sm font-bold mono" style={{ color: '#EAECEF' }}>
>>>>>>> upstream/main
            {currentValue.raw_equity.toFixed(2)} USDT
          </div>
        </div>
        <div className="p-2 rounded transition-all hover:bg-opacity-50" style={{ background: 'rgba(240, 185, 11, 0.05)' }}>
          <div className="text-xs mb-1 uppercase tracking-wider" style={{ color: '#848E9C' }}>{t('historicalCycles', language)}</div>
<<<<<<< HEAD
          <div className="text-sm font-bold mono" style={{ color: '#EAECEF' }}>{history.length} {t('cycles', language)}</div>
        </div>
        <div className="p-2 rounded transition-all hover:bg-opacity-50" style={{ background: 'rgba(240, 185, 11, 0.05)' }}>
          <div className="text-xs mb-1 uppercase tracking-wider" style={{ color: '#848E9C' }}>{t('displayRange', language)}</div>
          <div className="text-sm font-bold mono" style={{ color: '#EAECEF' }}>
            {history.length > MAX_DISPLAY_POINTS
=======
          <div className="text-xs sm:text-sm font-bold mono" style={{ color: '#EAECEF' }}>{validHistory.length} {t('cycles', language)}</div>
        </div>
        <div className="p-2 rounded transition-all hover:bg-opacity-50" style={{ background: 'rgba(240, 185, 11, 0.05)' }}>
          <div className="text-xs mb-1 uppercase tracking-wider" style={{ color: '#848E9C' }}>{t('displayRange', language)}</div>
          <div className="text-xs sm:text-sm font-bold mono" style={{ color: '#EAECEF' }}>
            {validHistory.length > MAX_DISPLAY_POINTS
>>>>>>> upstream/main
              ? `${t('recent', language)} ${MAX_DISPLAY_POINTS}`
              : t('allData', language)
            }
          </div>
        </div>
      </div>
    </div>
  );
}
