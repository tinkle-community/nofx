import useSWR from 'swr';
import { api } from '../lib/api';
import type { CompetitionData, AIModel } from '../types';
import { ComparisonChart } from './ComparisonChart';
import { getTraderColor } from '../utils/traderColors';

// 获取友好的AI模型名称
function getModelDisplayName(modelId: string, models?: AIModel[]): string {
  // 如果提供了模型列表，先尝试查找模型信息
  if (models && models.length > 0) {
    // 尝试多种匹配方式：精确ID、provider、或ID后缀
    const model = models.find(m => {
      const normalizedModelId = modelId.toLowerCase();
      const normalizedMId = (m.id || '').toLowerCase();
      const normalizedMProvider = (m.provider || '').toLowerCase();
      
      // 精确匹配
      if (normalizedMId === normalizedModelId || normalizedMProvider === normalizedModelId) {
        return true;
      }
      
      // 匹配ID后缀（例如：user123_custom 匹配 custom）
      if (normalizedMId.includes('_') && normalizedMId.endsWith('_' + normalizedModelId)) {
        return true;
      }
      
      // 匹配provider（例如：custom）
      if (normalizedMProvider === normalizedModelId) {
        return true;
      }
      
      return false;
    });
    
    // 如果找到模型且是CUSTOM类型，返回模型的name字段
    if (model && (model.provider === 'custom' || model.id.toLowerCase() === 'custom' || model.id.toLowerCase().endsWith('_custom'))) {
      return model.name || 'CUSTOM';
    }
  }
  
  // 默认处理逻辑
  switch (modelId.toLowerCase()) {
    case 'deepseek':
      return 'DeepSeek';
    case 'qwen':
      return 'Qwen';
    case 'claude':
      return 'Claude';
    case 'gpt4':
    case 'gpt-4':
      return 'GPT-4';
    case 'gpt3.5':
    case 'gpt-3.5':
      return 'GPT-3.5';
    default:
      return modelId.toUpperCase();
  }
}

export function CompetitionPage() {
  const { data: competition } = useSWR<CompetitionData>(
    'competition',
    api.getCompetition,
    {
      refreshInterval: 15000, // 15秒刷新（竞赛数据不需要太频繁更新）
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  // 获取模型配置列表（用于显示模型名称）
  const { data: models } = useSWR<AIModel[]>('model-configs', api.getModelConfigs, {
    refreshInterval: 30000, // 模型配置更新频率较低
  });

  if (!competition || !competition.traders) {
    return (
      <div className="space-y-6">
        <div className="binance-card p-8 animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-3 flex-1">
              <div className="skeleton h-8 w-64"></div>
              <div className="skeleton h-4 w-48"></div>
            </div>
            <div className="skeleton h-12 w-32"></div>
          </div>
        </div>
        <div className="binance-card p-6">
          <div className="skeleton h-6 w-40 mb-4"></div>
          <div className="space-y-3">
            <div className="skeleton h-20 w-full rounded"></div>
            <div className="skeleton h-20 w-full rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // 按收益率排序
  const sortedTraders = [...competition.traders].sort(
    (a, b) => b.total_pnl_pct - a.total_pnl_pct
  );

  // 找出领先者
  const leader = sortedTraders[0];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Competition Header - 精简版 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{
            background: 'linear-gradient(135deg, #F0B90B 0%, #FCD535 100%)',
            boxShadow: '0 4px 14px rgba(240, 185, 11, 0.4)'
          }}>
            🏆
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#EAECEF' }}>
              AI竞赛
              <span className="text-xs font-normal px-2 py-1 rounded" style={{ background: 'rgba(240, 185, 11, 0.15)', color: '#F0B90B' }}>
                {competition.count} 交易员
              </span>
            </h1>
            <p className="text-xs" style={{ color: '#848E9C' }}>
              实时对战
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs mb-1" style={{ color: '#848E9C' }}>领先者</div>
          <div className="text-lg font-bold" style={{ color: '#F0B90B' }}>{leader?.trader_name}</div>
          <div className="text-sm font-semibold" style={{ color: (leader?.total_pnl ?? 0) >= 0 ? '#0ECB81' : '#F6465D' }}>
            {(leader?.total_pnl ?? 0) >= 0 ? '+' : ''}{leader?.total_pnl_pct?.toFixed(2) || '0.00'}%
          </div>
        </div>
      </div>

      {/* Left/Right Split: Performance Chart + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Performance Comparison Chart */}
        <div className="binance-card p-5 animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#EAECEF' }}>
              表现对比
            </h2>
            <div className="text-xs" style={{ color: '#848E9C' }}>
              实时收益率
            </div>
          </div>
          <ComparisonChart traders={sortedTraders} />
        </div>

        {/* Right: Leaderboard */}
        <div className="binance-card p-5 animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#EAECEF' }}>
              排行榜
            </h2>
            <div className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(240, 185, 11, 0.1)', color: '#F0B90B', border: '1px solid rgba(240, 185, 11, 0.2)' }}>
              实时
            </div>
          </div>
          <div className="space-y-2">
            {sortedTraders.map((trader, index) => {
              const isLeader = index === 0;
              const traderColor = getTraderColor(sortedTraders, trader.trader_id);

              return (
                <div
                  key={trader.trader_id}
                  className="rounded p-3 transition-all duration-300 hover:translate-y-[-1px]"
                  style={{
                    background: isLeader ? 'linear-gradient(135deg, rgba(240, 185, 11, 0.08) 0%, #0B0E11 100%)' : '#0B0E11',
                    border: `1px solid ${isLeader ? 'rgba(240, 185, 11, 0.4)' : '#2B3139'}`,
                    boxShadow: isLeader ? '0 3px 15px rgba(240, 185, 11, 0.12), 0 0 0 1px rgba(240, 185, 11, 0.15)' : '0 1px 4px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    {/* Rank & Name */}
                    <div className="flex items-center gap-3">
                      <div className="text-2xl w-6">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                      <div>
                        <div className="font-bold text-sm" style={{ color: '#EAECEF' }}>{trader.trader_name}</div>
                        <div className="text-xs mono font-semibold" style={{ color: traderColor }}>
                          {getModelDisplayName(trader.ai_model.split('_').pop() || trader.ai_model, models)}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3">
                      {/* Total Equity */}
                      <div className="text-right">
                        <div className="text-xs" style={{ color: '#848E9C' }}>权益</div>
                        <div className="text-sm font-bold mono" style={{ color: '#EAECEF' }}>
                          {trader.total_equity?.toFixed(2) || '0.00'}
                        </div>
                      </div>

                      {/* P&L */}
                      <div className="text-right min-w-[90px]">
                        <div className="text-xs" style={{ color: '#848E9C' }}>收益</div>
                        <div
                          className="text-lg font-bold mono"
                          style={{ color: (trader.total_pnl ?? 0) >= 0 ? '#0ECB81' : '#F6465D' }}
                        >
                          {(trader.total_pnl ?? 0) >= 0 ? '+' : ''}
                          {trader.total_pnl_pct?.toFixed(2) || '0.00'}%
                        </div>
                        <div className="text-xs mono" style={{ color: '#848E9C' }}>
                          {(trader.total_pnl ?? 0) >= 0 ? '+' : ''}{trader.total_pnl?.toFixed(2) || '0.00'}
                        </div>
                      </div>

                      {/* Positions */}
                      <div className="text-right">
                        <div className="text-xs" style={{ color: '#848E9C' }}>持仓</div>
                        <div className="text-sm font-bold mono" style={{ color: '#EAECEF' }}>
                          {trader.position_count}
                        </div>
                        <div className="text-xs" style={{ color: '#848E9C' }}>
                          {trader.margin_used_pct.toFixed(1)}%
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <div
                          className="px-2 py-1 rounded text-xs font-bold"
                          style={trader.is_running
                            ? { background: 'rgba(14, 203, 129, 0.1)', color: '#0ECB81' }
                            : { background: 'rgba(246, 70, 93, 0.1)', color: '#F6465D' }
                          }
                        >
                          {trader.is_running ? '●' : '○'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Head-to-Head Stats */}
      {competition.traders.length === 2 && (
        <div className="binance-card p-5 animate-slide-in" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#EAECEF' }}>
            正面对决
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {sortedTraders.map((trader, index) => {
              const isWinning = index === 0;
              const opponent = sortedTraders[1 - index];
              const gap = trader.total_pnl_pct - opponent.total_pnl_pct;

              return (
                <div
                  key={trader.trader_id}
                  className="p-4 rounded transition-all duration-300 hover:scale-[1.02]"
                  style={isWinning
                    ? {
                        background: 'linear-gradient(135deg, rgba(14, 203, 129, 0.08) 0%, rgba(14, 203, 129, 0.02) 100%)',
                        border: '2px solid rgba(14, 203, 129, 0.3)',
                        boxShadow: '0 3px 15px rgba(14, 203, 129, 0.12)'
                      }
                    : {
                        background: '#0B0E11',
                        border: '1px solid #2B3139',
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)'
                      }
                  }
                >
                  <div className="text-center">
                    <div
                      className="text-base font-bold mb-2"
                      style={{ color: getTraderColor(sortedTraders, trader.trader_id) }}
                    >
                      {trader.trader_name}
                    </div>
                    <div className="text-2xl font-bold mono mb-1" style={{ color: (trader.total_pnl ?? 0) >= 0 ? '#0ECB81' : '#F6465D' }}>
                      {(trader.total_pnl ?? 0) >= 0 ? '+' : ''}{trader.total_pnl_pct?.toFixed(2) || '0.00'}%
                    </div>
                    {isWinning && gap > 0 && (
                      <div className="text-xs font-semibold" style={{ color: '#0ECB81' }}>
                        领先 {gap.toFixed(2)}%
                      </div>
                    )}
                    {!isWinning && gap < 0 && (
                      <div className="text-xs font-semibold" style={{ color: '#F6465D' }}>
                        落后 {Math.abs(gap).toFixed(2)}%
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}