import type {
  SystemStatus,
  AccountInfo,
  Position,
  DecisionRecord,
  Statistics,
  TraderInfo,
  AIModel,
  Exchange,
  CreateTraderRequest,
  UpdateModelConfigRequest,
  UpdateExchangeConfigRequest,
  CompetitionData,
} from '../types';

const API_BASE = '/api';

// Helper function to get auth headers
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export const api = {
  // AI交易员管理接口
  async getTraders(): Promise<TraderInfo[]> {
    const res = await fetch(`${API_BASE}/traders`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('获取trader列表失败');
    return res.json();
  },

  async createTrader(request: CreateTraderRequest): Promise<TraderInfo> {
    const res = await fetch(`${API_BASE}/traders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error('创建交易员失败');
    return res.json();
  },

  async deleteTrader(traderId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/traders/${traderId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('删除交易员失败');
  },

  async startTrader(traderId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/traders/${traderId}/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('启动交易员失败');
  },

  async stopTrader(traderId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/traders/${traderId}/stop`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('停止交易员失败');
  },

  async updateTraderPrompt(traderId: string, customPrompt: string): Promise<void> {
    const res = await fetch(`${API_BASE}/traders/${traderId}/prompt`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ custom_prompt: customPrompt }),
    });
    if (!res.ok) throw new Error('更新自定义策略失败');
  },

  async getTraderConfig(traderId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/traders/${traderId}/config`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('获取交易员配置失败');
    return res.json();
  },

  async updateTrader(traderId: string, request: CreateTraderRequest): Promise<TraderInfo> {
    const res = await fetch(`${API_BASE}/traders/${traderId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error('更新交易员失败');
    return res.json();
  },

  // AI模型配置接口
  async getModelConfigs(): Promise<AIModel[]> {
    const res = await fetch(`${API_BASE}/models`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('获取模型配置失败');
    return res.json();
  },

  // 获取系统支持的AI模型列表（无需认证）
  async getSupportedModels(): Promise<AIModel[]> {
    const res = await fetch(`${API_BASE}/supported-models`);
    if (!res.ok) throw new Error('获取支持的模型失败');
    return res.json();
  },

  async updateModelConfigs(request: UpdateModelConfigRequest): Promise<void> {
    const res = await fetch(`${API_BASE}/models`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error('更新模型配置失败');
  },

  // 交易所配置接口
  async getExchangeConfigs(): Promise<Exchange[]> {
    const res = await fetch(`${API_BASE}/exchanges`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('获取交易所配置失败');
    return res.json();
  },

  // 获取系统支持的交易所列表（无需认证）
  async getSupportedExchanges(): Promise<Exchange[]> {
    const res = await fetch(`${API_BASE}/supported-exchanges`);
    if (!res.ok) throw new Error('获取支持的交易所失败');
    return res.json();
  },

  async updateExchangeConfigs(request: UpdateExchangeConfigRequest): Promise<void> {
    const res = await fetch(`${API_BASE}/exchanges`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error('更新交易所配置失败');
  },

  // 获取系统状态（支持trader_id）
  async getStatus(traderId?: string): Promise<SystemStatus> {
    const url = traderId
      ? `${API_BASE}/status?trader_id=${traderId}`
      : `${API_BASE}/status`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('获取系统状态失败');
    return res.json();
  },

  // 获取账户信息（支持trader_id）
  async getAccount(traderId?: string): Promise<AccountInfo> {
    const url = traderId
      ? `${API_BASE}/account?trader_id=${traderId}`
      : `${API_BASE}/account`;
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        ...getAuthHeaders(),
        'Cache-Control': 'no-cache',
      },
    });
    if (!res.ok) throw new Error('获取账户信息失败');
    const data = await res.json();
    console.log('Account data fetched:', data);
    return data;
  },

  // 获取持仓列表（支持trader_id）
  async getPositions(traderId?: string): Promise<Position[]> {
    const url = traderId
      ? `${API_BASE}/positions?trader_id=${traderId}`
      : `${API_BASE}/positions`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('获取持仓列表失败');
    return res.json();
  },

  // 获取决策日志（支持trader_id）
  async getDecisions(traderId?: string): Promise<DecisionRecord[]> {
    const url = traderId
      ? `${API_BASE}/decisions?trader_id=${traderId}`
      : `${API_BASE}/decisions`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('获取决策日志失败');
    return res.json();
  },

  // 获取最新决策（支持trader_id）
  async getLatestDecisions(traderId?: string): Promise<DecisionRecord[]> {
    const url = traderId
      ? `${API_BASE}/decisions/latest?trader_id=${traderId}`
      : `${API_BASE}/decisions/latest`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('获取最新决策失败');
    return res.json();
  },

  // 获取统计信息（支持trader_id）
  async getStatistics(traderId?: string): Promise<Statistics> {
    const url = traderId
      ? `${API_BASE}/statistics?trader_id=${traderId}`
      : `${API_BASE}/statistics`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('获取统计信息失败');
    return res.json();
  },

  // 获取收益率历史数据（支持trader_id）
  async getEquityHistory(traderId?: string): Promise<any[]> {
    const url = traderId
      ? `${API_BASE}/equity-history?trader_id=${traderId}`
      : `${API_BASE}/equity-history`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('获取历史数据失败');
    return res.json();
  },

  // 获取AI学习表现分析（支持trader_id）
  async getPerformance(traderId?: string): Promise<any> {
    const url = traderId
      ? `${API_BASE}/performance?trader_id=${traderId}`
      : `${API_BASE}/performance`;
    const res = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('获取AI学习数据失败');
    return res.json();
  },

  // 获取竞赛数据
  async getCompetition(): Promise<CompetitionData> {
    const res = await fetch(`${API_BASE}/competition`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('获取竞赛数据失败');
    return res.json();
  },

  // 用户信号源配置接口
  async getUserSignalSource(): Promise<{coin_pool_url: string, oi_top_url: string}> {
    const res = await fetch(`${API_BASE}/user/signal-sources`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('获取用户信号源配置失败');
    return res.json();
  },

  async saveUserSignalSource(coinPoolUrl: string, oiTopUrl: string): Promise<void> {
    const res = await fetch(`${API_BASE}/user/signal-sources`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        coin_pool_url: coinPoolUrl,
        oi_top_url: oiTopUrl,
      }),
    });
    if (!res.ok) throw new Error('保存用户信号源配置失败');
  },
};
