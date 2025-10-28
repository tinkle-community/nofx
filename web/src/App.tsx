import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { api } from './lib/api';
import { EquityChart } from './components/EquityChart';
import { CompetitionPage } from './components/CompetitionPage';
import type {
  SystemStatus,
  AccountInfo,
  Position,
  DecisionRecord,
  Statistics,
  TraderInfo,
} from './types';

type Page = 'competition' | 'trader';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('competition');
  const [selectedTraderId, setSelectedTraderId] = useState<string | undefined>();
  const [lastUpdate, setLastUpdate] = useState<string>('--:--:--');

  // 获取trader列表
  const { data: traders } = useSWR<TraderInfo[]>('traders', api.getTraders, {
    refreshInterval: 10000,
  });

  // 当获取到traders后，设置默认选中第一个
  useEffect(() => {
    if (traders && traders.length > 0 && !selectedTraderId) {
      setSelectedTraderId(traders[0].trader_id);
    }
  }, [traders, selectedTraderId]);

  // 如果在trader页面，获取该trader的数据
  const { data: status } = useSWR<SystemStatus>(
    currentPage === 'trader' && selectedTraderId
      ? `status-${selectedTraderId}`
      : null,
    () => api.getStatus(selectedTraderId),
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      dedupingInterval: 0,
    }
  );

  const { data: account } = useSWR<AccountInfo>(
    currentPage === 'trader' && selectedTraderId
      ? `account-${selectedTraderId}`
      : null,
    () => api.getAccount(selectedTraderId),
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      dedupingInterval: 0,
    }
  );

  const { data: positions } = useSWR<Position[]>(
    currentPage === 'trader' && selectedTraderId
      ? `positions-${selectedTraderId}`
      : null,
    () => api.getPositions(selectedTraderId),
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      dedupingInterval: 0,
    }
  );

  const { data: decisions } = useSWR<DecisionRecord[]>(
    currentPage === 'trader' && selectedTraderId
      ? `decisions/latest-${selectedTraderId}`
      : null,
    () => api.getLatestDecisions(selectedTraderId),
    { refreshInterval: 10000 }
  );

  const { data: stats } = useSWR<Statistics>(
    currentPage === 'trader' && selectedTraderId
      ? `statistics-${selectedTraderId}`
      : null,
    () => api.getStatistics(selectedTraderId),
    { refreshInterval: 10000 }
  );

  useEffect(() => {
    if (account) {
      const now = new Date().toLocaleTimeString();
      setLastUpdate(now);
    }
  }, [account]);

  const selectedTrader = traders?.find((t) => t.trader_id === selectedTraderId);

  return (
    <div className="min-h-screen" style={{ background: '#0B0E11', color: '#EAECEF' }}>
      {/* Header - Binance Style */}
      <header className="glass sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg, #F0B90B 0%, #FCD535 100%)' }}>
                ⚡
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#EAECEF' }}>
                  AI Trading Competition
                </h1>
                <p className="text-xs mono" style={{ color: '#848E9C' }}>
                  Qwen vs DeepSeek · Real-time
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Page Toggle */}
              <div className="flex gap-1 rounded p-1" style={{ background: '#1E2329' }}>
                <button
                  onClick={() => setCurrentPage('competition')}
                  className={`px-4 py-2 rounded text-sm font-semibold transition-all ${
                    currentPage === 'competition' ? '' : ''
                  }`}
                  style={currentPage === 'competition'
                    ? { background: '#F0B90B', color: '#000' }
                    : { background: 'transparent', color: '#848E9C' }
                  }
                >
                  Competition
                </button>
                <button
                  onClick={() => setCurrentPage('trader')}
                  className={`px-4 py-2 rounded text-sm font-semibold transition-all`}
                  style={currentPage === 'trader'
                    ? { background: '#F0B90B', color: '#000' }
                    : { background: 'transparent', color: '#848E9C' }
                  }
                >
                  Details
                </button>
              </div>

              {/* Trader Selector (only show on trader page) */}
              {currentPage === 'trader' && traders && traders.length > 0 && (
                <select
                  value={selectedTraderId}
                  onChange={(e) => setSelectedTraderId(e.target.value)}
                  className="rounded px-3 py-2 text-sm font-medium cursor-pointer transition-colors"
                  style={{ background: '#1E2329', border: '1px solid #2B3139', color: '#EAECEF' }}
                >
                  {traders.map((trader) => (
                    <option key={trader.trader_id} value={trader.trader_id}>
                      {trader.trader_name} ({trader.ai_model.toUpperCase()})
                    </option>
                  ))}
                </select>
              )}

              {/* Status Indicator (only show on trader page) */}
              {currentPage === 'trader' && status && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded"
                  style={status.is_running
                    ? { background: 'rgba(14, 203, 129, 0.1)', color: '#0ECB81', border: '1px solid rgba(14, 203, 129, 0.2)' }
                    : { background: 'rgba(246, 70, 93, 0.1)', color: '#F6465D', border: '1px solid rgba(246, 70, 93, 0.2)' }
                  }
                >
                  <div
                    className={`w-2 h-2 rounded-full ${status.is_running ? 'pulse-glow' : ''}`}
                    style={{ background: status.is_running ? '#0ECB81' : '#F6465D' }}
                  />
                  <span className="font-semibold mono text-xs">
                    {status.is_running ? 'RUNNING' : 'STOPPED'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentPage === 'competition' ? (
          <CompetitionPage />
        ) : (
          <TraderDetailsPage
            selectedTrader={selectedTrader}
            status={status}
            account={account}
            positions={positions}
            decisions={decisions}
            stats={stats}
            lastUpdate={lastUpdate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16" style={{ borderTop: '1px solid #2B3139', background: '#181A20' }}>
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm" style={{ color: '#5E6673' }}>
          <p>NOFX - AI Trading Competition System</p>
          <p className="mt-1">⚠️ Trading involves risk. Use at your own discretion.</p>
        </div>
      </footer>
    </div>
  );
}

// Trader Details Page Component
function TraderDetailsPage({
  selectedTrader,
  status,
  account,
  positions,
  decisions,
  stats,
  lastUpdate,
}: {
  selectedTrader?: TraderInfo;
  status?: SystemStatus;
  account?: AccountInfo;
  positions?: Position[];
  decisions?: DecisionRecord[];
  stats?: Statistics;
  lastUpdate: string;
}) {
  if (!selectedTrader) {
    return (
      <div className="space-y-6">
        {/* Loading Skeleton - Binance Style */}
        <div className="binance-card p-6 animate-pulse">
          <div className="skeleton h-8 w-48 mb-3"></div>
          <div className="flex gap-4">
            <div className="skeleton h-4 w-32"></div>
            <div className="skeleton h-4 w-24"></div>
            <div className="skeleton h-4 w-28"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="binance-card p-5 animate-pulse">
              <div className="skeleton h-4 w-24 mb-3"></div>
              <div className="skeleton h-8 w-32"></div>
            </div>
          ))}
        </div>
        <div className="binance-card p-6 animate-pulse">
          <div className="skeleton h-6 w-40 mb-4"></div>
          <div className="skeleton h-64 w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Trader Header */}
      <div className="mb-6 rounded p-6 animate-scale-in" style={{ background: 'linear-gradient(135deg, rgba(240, 185, 11, 0.15) 0%, rgba(252, 213, 53, 0.05) 100%)', border: '1px solid rgba(240, 185, 11, 0.2)', boxShadow: '0 0 30px rgba(240, 185, 11, 0.15)' }}>
        <h2 className="text-2xl font-bold mb-3 flex items-center gap-2" style={{ color: '#EAECEF' }}>
          <span className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg, #F0B90B 0%, #FCD535 100%)' }}>
            🤖
          </span>
          {selectedTrader.trader_name}
        </h2>
        <div className="flex items-center gap-4 text-sm" style={{ color: '#848E9C' }}>
          <span>AI Model: <span className="font-semibold" style={{ color: selectedTrader.ai_model === 'qwen' ? '#c084fc' : '#60a5fa' }}>{selectedTrader.ai_model.toUpperCase()}</span></span>
          {status && (
            <>
              <span>•</span>
              <span>Cycles: {status.call_count}</span>
              <span>•</span>
              <span>Runtime: {status.runtime_minutes} min</span>
            </>
          )}
        </div>
      </div>

      {/* Debug Info */}
      {account && (
        <div className="mb-4 p-3 rounded text-xs font-mono" style={{ background: '#1E2329', border: '1px solid #2B3139' }}>
          <div style={{ color: '#848E9C' }}>
            🔄 Last Update: {lastUpdate} | Total Equity: {account.total_equity.toFixed(2)} |
            Available: {account.available_balance.toFixed(2)} | P&L: {account.total_pnl.toFixed(2)}{' '}
            ({account.total_pnl_pct.toFixed(2)}%)
          </div>
        </div>
      )}

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Equity"
          value={`${account?.total_equity.toFixed(2) || '0.00'} USDT`}
          change={account?.total_pnl_pct || 0}
          positive={account ? account.total_pnl > 0 : false}
        />
        <StatCard
          title="Available Balance"
          value={`${account?.available_balance.toFixed(2) || '0.00'} USDT`}
          subtitle={`${((account?.available_balance / account?.total_equity) * 100 || 0).toFixed(1)}% Free`}
        />
        <StatCard
          title="Total P&L"
          value={`${account?.total_pnl >= 0 ? '+' : ''}${account?.total_pnl.toFixed(2) || '0.00'} USDT`}
          change={account?.total_pnl_pct || 0}
          positive={account ? account.total_pnl >= 0 : false}
        />
        <StatCard
          title="Positions"
          value={`${account?.position_count || 0}`}
          subtitle={`Margin: ${account?.margin_used_pct.toFixed(1) || '0.0'}%`}
        />
      </div>

      {/* Equity Chart */}
      <div className="mb-8 animate-slide-in" style={{ animationDelay: '0.1s' }}>
        <EquityChart traderId={selectedTrader.trader_id} />
      </div>

      {/* Statistics */}
      {stats && (
        <div className="binance-card p-6 mb-6 animate-slide-in" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: '#EAECEF' }}>
            📊 Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-xs" style={{ color: '#848E9C' }}>Total Cycles</div>
              <div className="text-2xl font-bold" style={{ color: '#EAECEF' }}>{stats.total_cycles}</div>
            </div>
            <div>
              <div className="text-xs" style={{ color: '#848E9C' }}>Successful</div>
              <div className="text-2xl font-bold" style={{ color: '#0ECB81' }}>
                {stats.successful_cycles}
              </div>
            </div>
            <div>
              <div className="text-xs" style={{ color: '#848E9C' }}>Failed</div>
              <div className="text-2xl font-bold" style={{ color: '#F6465D' }}>{stats.failed_cycles}</div>
            </div>
            <div>
              <div className="text-xs" style={{ color: '#848E9C' }}>Open Positions</div>
              <div className="text-2xl font-bold" style={{ color: '#EAECEF' }}>{stats.total_open_positions}</div>
            </div>
            <div>
              <div className="text-xs" style={{ color: '#848E9C' }}>Close Positions</div>
              <div className="text-2xl font-bold" style={{ color: '#EAECEF' }}>{stats.total_close_positions}</div>
            </div>
          </div>
        </div>
      )}

      {/* Positions */}
      <div className="binance-card p-6 mb-6 animate-slide-in" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#EAECEF' }}>
            📈 Current Positions
          </h2>
          {positions && positions.length > 0 && (
            <div className="text-xs px-3 py-1 rounded" style={{ background: 'rgba(240, 185, 11, 0.1)', color: '#F0B90B', border: '1px solid rgba(240, 185, 11, 0.2)' }}>
              {positions.length} Active
            </div>
          )}
        </div>
        {positions && positions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left border-b border-gray-800">
                <tr>
                  <th className="pb-3 font-semibold text-gray-400">Symbol</th>
                  <th className="pb-3 font-semibold text-gray-400">Side</th>
                  <th className="pb-3 font-semibold text-gray-400">Entry Price</th>
                  <th className="pb-3 font-semibold text-gray-400">Mark Price</th>
                  <th className="pb-3 font-semibold text-gray-400">Quantity</th>
                  <th className="pb-3 font-semibold text-gray-400">Position Value</th>
                  <th className="pb-3 font-semibold text-gray-400">Leverage</th>
                  <th className="pb-3 font-semibold text-gray-400">Unrealized P&L</th>
                  <th className="pb-3 font-semibold text-gray-400">Liq. Price</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((pos, i) => (
                  <tr key={i} className="border-b border-gray-800 last:border-0">
                    <td className="py-3 font-mono font-semibold">{pos.symbol}</td>
                    <td className="py-3">
                      <span
                        className="px-2 py-1 rounded text-xs font-bold"
                        style={pos.side === 'long'
                          ? { background: 'rgba(14, 203, 129, 0.1)', color: '#0ECB81' }
                          : { background: 'rgba(246, 70, 93, 0.1)', color: '#F6465D' }
                        }
                      >
                        {pos.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 font-mono" style={{ color: '#EAECEF' }}>{pos.entry_price.toFixed(4)}</td>
                    <td className="py-3 font-mono" style={{ color: '#EAECEF' }}>{pos.mark_price.toFixed(4)}</td>
                    <td className="py-3 font-mono" style={{ color: '#EAECEF' }}>{pos.quantity.toFixed(4)}</td>
                    <td className="py-3 font-mono font-bold" style={{ color: '#EAECEF' }}>
                      {(pos.quantity * pos.mark_price).toFixed(2)} USDT
                    </td>
                    <td className="py-3 font-mono" style={{ color: '#F0B90B' }}>{pos.leverage}x</td>
                    <td className="py-3 font-mono">
                      <span
                        style={{ color: pos.unrealized_pnl >= 0 ? '#0ECB81' : '#F6465D', fontWeight: 'bold' }}
                      >
                        {pos.unrealized_pnl >= 0 ? '+' : ''}
                        {pos.unrealized_pnl.toFixed(2)} ({pos.unrealized_pnl_pct.toFixed(2)}%)
                      </span>
                    </td>
                    <td className="py-3 font-mono" style={{ color: '#848E9C' }}>
                      {pos.liquidation_price.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16" style={{ color: '#848E9C' }}>
            <div className="text-6xl mb-4 opacity-50">📊</div>
            <div className="text-lg font-semibold mb-2">无持仓</div>
            <div className="text-sm">当前没有活跃的交易持仓</div>
          </div>
        )}
      </div>

      {/* Recent Decisions */}
      <div className="binance-card p-6 animate-slide-in" style={{ animationDelay: '0.4s' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#EAECEF' }}>
            🧠 Recent Decisions
          </h2>
          {decisions && decisions.length > 0 && (
            <div className="text-xs px-3 py-1 rounded" style={{ background: 'rgba(240, 185, 11, 0.1)', color: '#F0B90B', border: '1px solid rgba(240, 185, 11, 0.2)' }}>
              Last {decisions.length} Cycles
            </div>
          )}
        </div>
        {decisions && decisions.length > 0 ? (
          <div className="space-y-4">
            {decisions.map((decision, i) => (
              <DecisionCard key={i} decision={decision} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16" style={{ color: '#848E9C' }}>
            <div className="text-6xl mb-4 opacity-50">🧠</div>
            <div className="text-lg font-semibold mb-2">暂无决策记录</div>
            <div className="text-sm">AI交易决策将在这里显示</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component - Binance Style Enhanced
function StatCard({
  title,
  value,
  change,
  positive,
  subtitle,
}: {
  title: string;
  value: string;
  change?: number;
  positive?: boolean;
  subtitle?: string;
}) {
  return (
    <div className="stat-card animate-fade-in">
      <div className="text-xs mb-2 mono uppercase tracking-wider" style={{ color: '#848E9C' }}>{title}</div>
      <div className="text-2xl font-bold mb-1 mono" style={{ color: '#EAECEF' }}>{value}</div>
      {change !== undefined && (
        <div className="flex items-center gap-1">
          <div
            className="text-sm mono font-bold"
            style={{ color: positive ? '#0ECB81' : '#F6465D' }}
          >
            {positive ? '▲' : '▼'} {positive ? '+' : ''}
            {change.toFixed(2)}%
          </div>
        </div>
      )}
      {subtitle && <div className="text-xs mt-2 mono" style={{ color: '#848E9C' }}>{subtitle}</div>}
    </div>
  );
}

// Decision Card Component with CoT Trace - Binance Style
function DecisionCard({ decision }: { decision: DecisionRecord }) {
  const [showCoT, setShowCoT] = useState(false);

  return (
    <div className="rounded p-5 transition-all duration-300 hover:translate-y-[-2px]" style={{ border: '1px solid #2B3139', background: '#1E2329', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-semibold" style={{ color: '#EAECEF' }}>Cycle #{decision.cycle_number}</div>
          <div className="text-xs" style={{ color: '#848E9C' }}>
            {new Date(decision.timestamp).toLocaleString()}
          </div>
        </div>
        <div
          className="px-3 py-1 rounded text-xs font-bold"
          style={decision.success
            ? { background: 'rgba(14, 203, 129, 0.1)', color: '#0ECB81' }
            : { background: 'rgba(246, 70, 93, 0.1)', color: '#F6465D' }
          }
        >
          {decision.success ? 'Success' : 'Failed'}
        </div>
      </div>

      {/* AI Chain of Thought - Collapsible */}
      {decision.cot_trace && (
        <div className="mb-3">
          <button
            onClick={() => setShowCoT(!showCoT)}
            className="flex items-center gap-2 text-sm transition-colors"
            style={{ color: '#F0B90B' }}
          >
            <span className="font-semibold">💭 AI思维链分析</span>
            <span className="text-xs">{showCoT ? '▼ 收起' : '▶ 展开'}</span>
          </button>
          {showCoT && (
            <div className="mt-2 rounded p-4 text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto" style={{ background: '#0B0E11', border: '1px solid #2B3139', color: '#EAECEF' }}>
              {decision.cot_trace}
            </div>
          )}
        </div>
      )}

      {/* Decisions Actions */}
      {decision.decisions && decision.decisions.length > 0 && (
        <div className="space-y-2 mb-3">
          {decision.decisions.map((action, j) => (
            <div key={j} className="flex items-center gap-2 text-sm rounded px-3 py-2" style={{ background: '#0B0E11' }}>
              <span className="font-mono font-bold" style={{ color: '#EAECEF' }}>{action.symbol}</span>
              <span
                className="px-2 py-0.5 rounded text-xs font-bold"
                style={action.action.includes('open')
                  ? { background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa' }
                  : { background: 'rgba(240, 185, 11, 0.1)', color: '#F0B90B' }
                }
              >
                {action.action}
              </span>
              {action.leverage > 0 && <span style={{ color: '#F0B90B' }}>{action.leverage}x</span>}
              {action.price > 0 && (
                <span className="font-mono text-xs" style={{ color: '#848E9C' }}>@{action.price.toFixed(4)}</span>
              )}
              <span style={{ color: action.success ? '#0ECB81' : '#F6465D' }}>
                {action.success ? '✓' : '✗'}
              </span>
              {action.error && <span className="text-xs ml-2" style={{ color: '#F6465D' }}>{action.error}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Account State Summary */}
      {decision.account_state && (
        <div className="flex gap-4 text-xs mb-3 rounded px-3 py-2" style={{ background: '#0B0E11', color: '#848E9C' }}>
          <span>净值: {decision.account_state.total_balance.toFixed(2)} USDT</span>
          <span>可用: {decision.account_state.available_balance.toFixed(2)} USDT</span>
          <span>保证金率: {decision.account_state.margin_used_pct.toFixed(1)}%</span>
          <span>持仓: {decision.account_state.position_count}</span>
        </div>
      )}

      {/* Execution Logs */}
      {decision.execution_log && decision.execution_log.length > 0 && (
        <div className="space-y-1">
          {decision.execution_log.map((log, k) => (
            <div
              key={k}
              className="text-xs font-mono"
              style={{ color: log.includes('✓') || log.includes('成功') ? '#0ECB81' : '#F6465D' }}
            >
              {log}
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {decision.error_message && (
        <div className="text-sm rounded px-3 py-2 mt-3" style={{ color: '#F6465D', background: 'rgba(246, 70, 93, 0.1)' }}>
          ❌ {decision.error_message}
        </div>
      )}
    </div>
  );
}

export default App;
