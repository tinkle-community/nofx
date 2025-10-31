import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { api } from '../lib/api';
import type { TraderInfo, CreateTraderRequest, AIModel, Exchange } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n/translations';
import { getExchangeIcon } from './ExchangeIcons';
import { getModelIcon } from './ModelIcons';
import { TraderConfigModal } from './TraderConfigModal';
import { Bot, Brain, Landmark, BarChart3, Trash2, Plus, Users } from 'lucide-react';

// 获取友好的AI模型名称
function getModelDisplayName(modelId: string): string {
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

// 提取下划线后面的名称部分
function getShortName(fullName: string): string {
  const parts = fullName.split('_');
  return parts.length > 1 ? parts[parts.length - 1] : fullName;
}

interface AITradersPageProps {
  onTraderSelect?: (traderId: string) => void;
}

export function AITradersPage({ onTraderSelect }: AITradersPageProps) {
  const { language } = useLanguage();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [showSignalSourceModal, setShowSignalSourceModal] = useState(false);
  const [editingModel, setEditingModel] = useState<string | null>(null);
  const [editingExchange, setEditingExchange] = useState<string | null>(null);
  const [editingTrader, setEditingTrader] = useState<any>(null);
  const [allModels, setAllModels] = useState<AIModel[]>([]);
  const [allExchanges, setAllExchanges] = useState<Exchange[]>([]);
  const [supportedModels, setSupportedModels] = useState<AIModel[]>([]);
  const [supportedExchanges, setSupportedExchanges] = useState<Exchange[]>([]);
  const [userSignalSource, setUserSignalSource] = useState<{coinPoolUrl: string, oiTopUrl: string}>({
    coinPoolUrl: '',
    oiTopUrl: ''
  });

  const { data: traders, mutate: mutateTraders } = useSWR<TraderInfo[]>(
    'traders',
    api.getTraders,
    { refreshInterval: 5000 }
  );

  // 加载AI模型和交易所配置
  useEffect(() => {
    const loadConfigs = async () => {
      try {
        const [modelConfigs, exchangeConfigs, supportedModels, supportedExchanges] = await Promise.all([
          api.getModelConfigs(),
          api.getExchangeConfigs(),
          api.getSupportedModels(),
          api.getSupportedExchanges()
        ]);
        setAllModels(modelConfigs);
        setAllExchanges(exchangeConfigs);
        setSupportedModels(supportedModels);
        setSupportedExchanges(supportedExchanges);

        // 加载用户信号源配置
        try {
          const signalSource = await api.getUserSignalSource();
          setUserSignalSource({
            coinPoolUrl: signalSource.coin_pool_url || '',
            oiTopUrl: signalSource.oi_top_url || ''
          });
        } catch (error) {
          console.log('📡 用户信号源配置暂未设置');
        }
      } catch (error) {
        console.error('Failed to load configs:', error);
      }
    };
    loadConfigs();
  }, []);

  // 显示所有用户的模型和交易所配置（用于调试）
  const configuredModels = allModels || [];
  const configuredExchanges = allExchanges || [];
  
  // 只在创建交易员时使用已启用且配置完整的
  const enabledModels = allModels?.filter(m => m.enabled && m.apiKey) || [];
  const enabledExchanges = allExchanges?.filter(e => {
    if (!e.enabled) return false;

    // Aster 交易所需要特殊字段
    if (e.id === 'aster') {
      return e.asterUser && e.asterSigner && e.asterPrivateKey;
    }

    // Hyperliquid 只需要私钥（作为apiKey），不需要secretKey
    if (e.id === 'hyperliquid') {
      return e.apiKey && e.hyperliquidWalletAddr;
    }

    // Binance 等其他交易所需要 apiKey 和 secretKey
    return e.apiKey && e.apiKey.trim() !== '' && e.secretKey && e.secretKey.trim() !== '';
  }) || [];

  // 检查模型是否正在被运行中的交易员使用
  const isModelInUse = (modelId: string) => {
    return traders?.some(t => t.ai_model === modelId && t.is_running) || false;
  };

  // 检查交易所是否正在被运行中的交易员使用
  const isExchangeInUse = (exchangeId: string) => {
    return traders?.some(t => t.exchange_id === exchangeId && t.is_running) || false;
  };

  const handleCreateTrader = async (data: CreateTraderRequest) => {
    try {
      const model = allModels?.find(m => m.id === data.ai_model_id);
      const exchange = allExchanges?.find(e => e.id === data.exchange_id);
      
      if (!model?.enabled) {
        alert(t('modelNotConfigured', language));
        return;
      }
      
      if (!exchange?.enabled) {
        alert(t('exchangeNotConfigured', language));
        return;
      }
      
      await api.createTrader(data);
      setShowCreateModal(false);
      mutateTraders();
    } catch (error) {
      console.error('Failed to create trader:', error);
      alert('创建交易员失败');
    }
  };

  const handleEditTrader = async (traderId: string) => {
    try {
      const traderConfig = await api.getTraderConfig(traderId);
      setEditingTrader(traderConfig);
      setShowEditModal(true);
    } catch (error) {
      console.error('Failed to fetch trader config:', error);
      alert('获取交易员配置失败');
    }
  };

  const handleSaveEditTrader = async (data: CreateTraderRequest) => {
    if (!editingTrader) return;
    
    try {
      const model = enabledModels?.find(m => m.id === data.ai_model_id);
      const exchange = enabledExchanges?.find(e => e.id === data.exchange_id);
      
      if (!model) {
        alert('AI模型配置不存在或未启用');
        return;
      }
      
      if (!exchange) {
        alert('交易所配置不存在或未启用');
        return;
      }
      
      const request = {
        name: data.name,
        ai_model_id: data.ai_model_id,
        exchange_id: data.exchange_id,
        initial_balance: data.initial_balance,
        btc_eth_leverage: data.btc_eth_leverage,
        altcoin_leverage: data.altcoin_leverage,
        trading_symbols: data.trading_symbols,
        custom_prompt: data.custom_prompt,
        override_base_prompt: data.override_base_prompt,
        is_cross_margin: data.is_cross_margin,
        use_coin_pool: data.use_coin_pool,
        use_oi_top: data.use_oi_top
      };
      
      await api.updateTrader(editingTrader.trader_id, request);
      setShowEditModal(false);
      setEditingTrader(null);
      mutateTraders();
    } catch (error) {
      console.error('Failed to update trader:', error);
      alert('更新交易员失败');
    }
  };

  const handleDeleteTrader = async (traderId: string) => {
    if (!confirm(t('confirmDeleteTrader', language))) return;
    
    try {
      await api.deleteTrader(traderId);
      mutateTraders();
    } catch (error) {
      console.error('Failed to delete trader:', error);
      alert('删除交易员失败');
    }
  };

  const handleToggleTrader = async (traderId: string, running: boolean) => {
    try {
      if (running) {
        await api.stopTrader(traderId);
      } else {
        await api.startTrader(traderId);
      }
      mutateTraders();
    } catch (error) {
      console.error('Failed to toggle trader:', error);
      alert('操作失败');
    }
  };

  const handleModelClick = (modelId: string) => {
    if (!isModelInUse(modelId)) {
      setEditingModel(modelId);
      setShowModelModal(true);
    }
  };

  const handleExchangeClick = (exchangeId: string) => {
    if (!isExchangeInUse(exchangeId)) {
      setEditingExchange(exchangeId);
      setShowExchangeModal(true);
    }
  };

  const handleDeleteModelConfig = async (modelId: string) => {
    if (!confirm('确定要删除此AI模型配置吗？')) return;
    
    try {
      const updatedModels = allModels?.map(m => 
        m.id === modelId ? { ...m, apiKey: '', enabled: false } : m
      ) || [];
      
      const request = {
        models: Object.fromEntries(
          updatedModels.map(model => [
            model.id,
            {
              enabled: model.enabled,
              api_key: model.apiKey || ''
            }
          ])
        )
      };
      
      await api.updateModelConfigs(request);
      setAllModels(updatedModels);
      setShowModelModal(false);
      setEditingModel(null);
    } catch (error) {
      console.error('Failed to delete model config:', error);
      alert('删除配置失败');
    }
  };

  const handleSaveModelConfig = async (modelId: string, apiKey: string, customApiUrl?: string) => {
    try {
      // 找到要配置的模型（从supportedModels中）
      const modelToUpdate = supportedModels?.find(m => m.id === modelId);
      if (!modelToUpdate) {
        alert('模型不存在');
        return;
      }

      // 创建或更新用户的模型配置
      const existingModel = allModels?.find(m => m.id === modelId);
      let updatedModels;
      
      if (existingModel) {
        // 更新现有配置
        updatedModels = allModels?.map(m => 
          m.id === modelId ? { ...m, apiKey, customApiUrl: customApiUrl || '', enabled: true } : m
        ) || [];
      } else {
        // 添加新配置
        const newModel = { ...modelToUpdate, apiKey, customApiUrl: customApiUrl || '', enabled: true };
        updatedModels = [...(allModels || []), newModel];
      }
      
      const request = {
        models: Object.fromEntries(
          updatedModels.map(model => [
            model.id,
            {
              enabled: model.enabled,
              api_key: model.apiKey || '',
              custom_api_url: model.customApiUrl || ''
            }
          ])
        )
      };
      
      await api.updateModelConfigs(request);
      
      // 重新获取用户配置以确保数据同步
      const refreshedModels = await api.getModelConfigs();
      setAllModels(refreshedModels);
      
      setShowModelModal(false);
      setEditingModel(null);
    } catch (error) {
      console.error('Failed to save model config:', error);
      alert('保存配置失败');
    }
  };

  const handleDeleteExchangeConfig = async (exchangeId: string) => {
    if (!confirm('确定要删除此交易所配置吗？')) return;
    
    try {
      const updatedExchanges = allExchanges?.map(e => 
        e.id === exchangeId ? { ...e, apiKey: '', secretKey: '', enabled: false } : e
      ) || [];
      
      const request = {
        exchanges: Object.fromEntries(
          updatedExchanges.map(exchange => [
            exchange.id,
            {
              enabled: exchange.enabled,
              api_key: exchange.apiKey || '',
              secret_key: exchange.secretKey || '',
              testnet: exchange.testnet || false
            }
          ])
        )
      };
      
      await api.updateExchangeConfigs(request);
      setAllExchanges(updatedExchanges);
      setShowExchangeModal(false);
      setEditingExchange(null);
    } catch (error) {
      console.error('Failed to delete exchange config:', error);
      alert('删除交易所配置失败');
    }
  };

  const handleSaveExchangeConfig = async (exchangeId: string, apiKey: string, secretKey?: string, testnet?: boolean, hyperliquidWalletAddr?: string, asterUser?: string, asterSigner?: string, asterPrivateKey?: string) => {
    try {
      // 找到要配置的交易所（从supportedExchanges中）
      const exchangeToUpdate = supportedExchanges?.find(e => e.id === exchangeId);
      if (!exchangeToUpdate) {
        alert('交易所不存在');
        return;
      }

      // 创建或更新用户的交易所配置
      const existingExchange = allExchanges?.find(e => e.id === exchangeId);
      let updatedExchanges;
      
      if (existingExchange) {
        // 更新现有配置
        updatedExchanges = allExchanges?.map(e => 
          e.id === exchangeId ? { ...e, apiKey, secretKey, testnet, hyperliquidWalletAddr, asterUser, asterSigner, asterPrivateKey, enabled: true } : e
        ) || [];
      } else {
        // 添加新配置
        const newExchange = { ...exchangeToUpdate, apiKey, secretKey, testnet, hyperliquidWalletAddr, asterUser, asterSigner, asterPrivateKey, enabled: true };
        updatedExchanges = [...(allExchanges || []), newExchange];
      }
      
      const request = {
        exchanges: Object.fromEntries(
          updatedExchanges.map(exchange => [
            exchange.id,
            {
              enabled: exchange.enabled,
              api_key: exchange.apiKey || '',
              secret_key: exchange.secretKey || '',
              testnet: exchange.testnet || false,
              hyperliquid_wallet_addr: exchange.hyperliquidWalletAddr || '',
              aster_user: exchange.asterUser || '',
              aster_signer: exchange.asterSigner || '',
              aster_private_key: exchange.asterPrivateKey || ''
            }
          ])
        )
      };
      
      await api.updateExchangeConfigs(request);
      
      // 重新获取用户配置以确保数据同步
      const refreshedExchanges = await api.getExchangeConfigs();
      setAllExchanges(refreshedExchanges);
      
      setShowExchangeModal(false);
      setEditingExchange(null);
    } catch (error) {
      console.error('Failed to save exchange config:', error);
      alert('保存交易所配置失败');
    }
  };

  const handleAddModel = () => {
    setEditingModel(null);
    setShowModelModal(true);
  };

  const handleAddExchange = () => {
    setEditingExchange(null);
    setShowExchangeModal(true);
  };

  const handleSaveSignalSource = async (coinPoolUrl: string, oiTopUrl: string) => {
    try {
      await api.saveUserSignalSource(coinPoolUrl, oiTopUrl);
      setUserSignalSource({ coinPoolUrl, oiTopUrl });
      setShowSignalSourceModal(false);
    } catch (error) {
      console.error('Failed to save signal source:', error);
      alert('保存信号源配置失败');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, #F0B90B 0%, #FCD535 100%)',
            boxShadow: '0 4px 14px rgba(240, 185, 11, 0.4)'
          }}>
            <Bot className="w-6 h-6" style={{ color: '#000' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#EAECEF' }}>
              {t('aiTraders', language)}
              <span className="text-xs font-normal px-2 py-1 rounded" style={{ 
                background: 'rgba(240, 185, 11, 0.15)', 
                color: '#F0B90B' 
              }}>
                {traders?.length || 0} {t('active', language)}
              </span>
            </h1>
            <p className="text-xs" style={{ color: '#848E9C' }}>
              {t('manageAITraders', language)}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleAddModel}
            className="px-4 py-2 rounded text-sm font-semibold transition-all hover:scale-105 flex items-center gap-2"
            style={{
              background: '#2B3139',
              color: '#EAECEF',
              border: '1px solid #474D57'
            }}
          >
            <Plus className="w-4 h-4" />
            {t('aiModels', language)}
          </button>

          <button
            onClick={handleAddExchange}
            className="px-4 py-2 rounded text-sm font-semibold transition-all hover:scale-105 flex items-center gap-2"
            style={{
              background: '#2B3139',
              color: '#EAECEF',
              border: '1px solid #474D57'
            }}
          >
            <Plus className="w-4 h-4" />
            {t('exchanges', language)}
          </button>

          <button
            onClick={() => setShowSignalSourceModal(true)}
            className="px-4 py-2 rounded text-sm font-semibold transition-all hover:scale-105"
            style={{ 
              background: '#2B3139', 
              color: '#EAECEF', 
              border: '1px solid #474D57' 
            }}
          >
            📡 信号源
          </button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={configuredModels.length === 0 || configuredExchanges.length === 0}
            className="px-4 py-2 rounded text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{
              background: (configuredModels.length > 0 && configuredExchanges.length > 0) ? '#F0B90B' : '#2B3139',
              color: (configuredModels.length > 0 && configuredExchanges.length > 0) ? '#000' : '#848E9C'
            }}
          >
            <Plus className="w-4 h-4" />
            {t('createTrader', language)}
          </button>
        </div>
      </div>

      {/* Configuration Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Models */}
        <div className="binance-card p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: '#EAECEF' }}>
            <Brain className="w-5 h-5" style={{ color: '#60a5fa' }} />
            {t('aiModels', language)}
          </h3>
          <div className="space-y-3">
            {configuredModels.map(model => {
              const inUse = isModelInUse(model.id);
              return (
                <div 
                  key={model.id} 
                  className={`flex items-center justify-between p-3 rounded transition-all ${
                    inUse ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-700'
                  }`}
                  style={{ background: '#0B0E11', border: '1px solid #2B3139' }}
                  onClick={() => handleModelClick(model.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      {getModelIcon(model.provider || model.id, { width: 32, height: 32 }) || (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                             style={{ 
                               background: model.id === 'deepseek' ? '#60a5fa' : '#c084fc',
                               color: '#fff'
                             }}>
                          {getShortName(model.name)[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: '#EAECEF' }}>{getShortName(model.name)}</div>
                      <div className="text-xs" style={{ color: '#848E9C' }}>
                        {inUse ? '正在使用' : model.enabled ? '已启用' : '已配置'}
                      </div>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${model.enabled && model.apiKey ? 'bg-green-400' : 'bg-gray-500'}`} />
                </div>
              );
            })}
            {configuredModels.length === 0 && (
              <div className="text-center py-8" style={{ color: '#848E9C' }}>
                <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <div className="text-sm">暂无已配置的AI模型</div>
              </div>
            )}
          </div>
        </div>

        {/* Exchanges */}
        <div className="binance-card p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2" style={{ color: '#EAECEF' }}>
            <Landmark className="w-5 h-5" style={{ color: '#F0B90B' }} />
            {t('exchanges', language)}
          </h3>
          <div className="space-y-3">
            {configuredExchanges.map(exchange => {
              const inUse = isExchangeInUse(exchange.id);
              return (
                <div 
                  key={exchange.id} 
                  className={`flex items-center justify-between p-3 rounded transition-all ${
                    inUse ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-700'
                  }`}
                  style={{ background: '#0B0E11', border: '1px solid #2B3139' }}
                  onClick={() => handleExchangeClick(exchange.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      {getExchangeIcon(exchange.id, { width: 32, height: 32 })}
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: '#EAECEF' }}>{getShortName(exchange.name)}</div>
                      <div className="text-xs" style={{ color: '#848E9C' }}>
                        {exchange.type.toUpperCase()} • {inUse ? '正在使用' : exchange.enabled ? '已启用' : '已配置'}
                      </div>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${exchange.enabled && exchange.apiKey ? 'bg-green-400' : 'bg-gray-500'}`} />
                </div>
              );
            })}
            {configuredExchanges.length === 0 && (
              <div className="text-center py-8" style={{ color: '#848E9C' }}>
                <Landmark className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <div className="text-sm">暂无已配置的交易所</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Traders List */}
      <div className="binance-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#EAECEF' }}>
            <Users className="w-6 h-6" style={{ color: '#F0B90B' }} />
            {t('currentTraders', language)}
          </h2>
        </div>

        {traders && traders.length > 0 ? (
          <div className="space-y-4">
            {traders.map(trader => (
              <div key={trader.trader_id}
                   className="flex items-center justify-between p-4 rounded transition-all hover:translate-y-[-1px]"
                   style={{ background: '#0B0E11', border: '1px solid #2B3139' }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                       style={{
                         background: trader.ai_model.includes('deepseek') ? '#60a5fa' : '#c084fc',
                         color: '#fff'
                       }}>
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-lg" style={{ color: '#EAECEF' }}>
                      {trader.trader_name}
                    </div>
                    <div className="text-sm" style={{ 
                      color: trader.ai_model.includes('deepseek') ? '#60a5fa' : '#c084fc' 
                    }}>
                      {getModelDisplayName(trader.ai_model.split('_').pop() || trader.ai_model)} Model • {trader.exchange_id?.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Status */}
                  <div className="text-center">
                    <div className="text-xs mb-1" style={{ color: '#848E9C' }}>{t('status', language)}</div>
                    <div className={`px-3 py-1 rounded text-xs font-bold ${
                      trader.is_running ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`} style={trader.is_running 
                      ? { background: 'rgba(14, 203, 129, 0.1)', color: '#0ECB81' }
                      : { background: 'rgba(246, 70, 93, 0.1)', color: '#F6465D' }
                    }>
                      {trader.is_running ? t('running', language) : t('stopped', language)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onTraderSelect?.(trader.trader_id)}
                      className="px-3 py-2 rounded text-sm font-semibold transition-all hover:scale-105 flex items-center gap-1"
                      style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}
                    >
                      <BarChart3 className="w-4 h-4" />
                      查看
                    </button>

                    <button
                      onClick={() => handleEditTrader(trader.trader_id)}
                      disabled={trader.is_running}
                      className="px-3 py-2 rounded text-sm font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        background: trader.is_running ? 'rgba(132, 142, 156, 0.1)' : 'rgba(255, 193, 7, 0.1)', 
                        color: trader.is_running ? '#848E9C' : '#FFC107' 
                      }}
                    >
                      ✏️ 编辑
                    </button>
                    
                    <button
                      onClick={() => handleToggleTrader(trader.trader_id, trader.is_running || false)}
                      className="px-3 py-2 rounded text-sm font-semibold transition-all hover:scale-105"
                      style={trader.is_running
                        ? { background: 'rgba(246, 70, 93, 0.1)', color: '#F6465D' }
                        : { background: 'rgba(14, 203, 129, 0.1)', color: '#0ECB81' }
                      }
                    >
                      {trader.is_running ? t('stop', language) : t('start', language)}
                    </button>

                    <button
                      onClick={() => handleDeleteTrader(trader.trader_id)}
                      className="px-3 py-2 rounded text-sm font-semibold transition-all hover:scale-105"
                      style={{ background: 'rgba(246, 70, 93, 0.1)', color: '#F6465D' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16" style={{ color: '#848E9C' }}>
            <Bot className="w-24 h-24 mx-auto mb-4 opacity-50" />
            <div className="text-lg font-semibold mb-2">{t('noTraders', language)}</div>
            <div className="text-sm mb-4">{t('createFirstTrader', language)}</div>
            {(configuredModels.length === 0 || configuredExchanges.length === 0) && (
              <div className="text-sm text-yellow-500">
                {configuredModels.length === 0 && configuredExchanges.length === 0 
                  ? t('configureModelsAndExchangesFirst', language)
                  : configuredModels.length === 0 
                    ? t('configureModelsFirst', language)
                    : t('configureExchangesFirst', language)
                }
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Trader Modal */}
      {showCreateModal && (
        <TraderConfigModal
          isOpen={showCreateModal}
          isEditMode={false}
          availableModels={enabledModels}
          availableExchanges={enabledExchanges}
          onSave={handleCreateTrader}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Trader Modal */}
      {showEditModal && editingTrader && (
        <TraderConfigModal
          isOpen={showEditModal}
          isEditMode={true}
          traderData={editingTrader}
          availableModels={enabledModels}
          availableExchanges={enabledExchanges}
          onSave={handleSaveEditTrader}
          onClose={() => {
            setShowEditModal(false);
            setEditingTrader(null);
          }}
        />
      )}

      {/* Model Configuration Modal */}
      {showModelModal && (
        <ModelConfigModal
          allModels={supportedModels}
          configuredModels={allModels}
          editingModelId={editingModel}
          onSave={handleSaveModelConfig}
          onDelete={handleDeleteModelConfig}
          onClose={() => {
            setShowModelModal(false);
            setEditingModel(null);
          }}
        />
      )}

      {/* Exchange Configuration Modal */}
      {showExchangeModal && (
        <ExchangeConfigModal
          allExchanges={supportedExchanges}
          editingExchangeId={editingExchange}
          onSave={handleSaveExchangeConfig}
          onDelete={handleDeleteExchangeConfig}
          onClose={() => {
            setShowExchangeModal(false);
            setEditingExchange(null);
          }}
        />
      )}

      {/* Signal Source Configuration Modal */}
      {showSignalSourceModal && (
        <SignalSourceModal
          coinPoolUrl={userSignalSource.coinPoolUrl}
          oiTopUrl={userSignalSource.oiTopUrl}
          onSave={handleSaveSignalSource}
          onClose={() => setShowSignalSourceModal(false)}
        />
      )}
    </div>
  );
}

// Signal Source Configuration Modal Component
function SignalSourceModal({
  coinPoolUrl,
  oiTopUrl,
  onSave,
  onClose
}: {
  coinPoolUrl: string;
  oiTopUrl: string;
  onSave: (coinPoolUrl: string, oiTopUrl: string) => void;
  onClose: () => void;
}) {
  const [coinPool, setCoinPool] = useState(coinPoolUrl || '');
  const [oiTop, setOiTop] = useState(oiTopUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(coinPool.trim(), oiTop.trim());
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg relative" style={{ background: '#1E2329' }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: '#EAECEF' }}>
          📡 信号源配置
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#EAECEF' }}>
              COIN POOL URL
            </label>
            <input
              type="url"
              value={coinPool}
              onChange={(e) => setCoinPool(e.target.value)}
              placeholder="https://api.example.com/coinpool"
              className="w-full px-3 py-2 rounded"
              style={{ background: '#0B0E11', border: '1px solid #2B3139', color: '#EAECEF' }}
            />
            <div className="text-xs mt-1" style={{ color: '#848E9C' }}>
              用于获取币种池数据的API地址，留空则不使用此信号源
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#EAECEF' }}>
              OI TOP URL
            </label>
            <input
              type="url"
              value={oiTop}
              onChange={(e) => setOiTop(e.target.value)}
              placeholder="https://api.example.com/oitop"
              className="w-full px-3 py-2 rounded"
              style={{ background: '#0B0E11', border: '1px solid #2B3139', color: '#EAECEF' }}
            />
            <div className="text-xs mt-1" style={{ color: '#848E9C' }}>
              用于获取持仓量排行数据的API地址，留空则不使用此信号源
            </div>
          </div>

          <div className="p-4 rounded" style={{ background: 'rgba(240, 185, 11, 0.1)', border: '1px solid rgba(240, 185, 11, 0.2)' }}>
            <div className="text-sm font-semibold mb-2" style={{ color: '#F0B90B' }}>
              ℹ️ 说明
            </div>
            <div className="text-xs space-y-1" style={{ color: '#848E9C' }}>
              <div>• 信号源配置为用户级别，每个用户可以设置自己的信号源URL</div>
              <div>• 在创建交易员时可以选择是否使用这些信号源</div>
              <div>• 配置的URL将用于获取市场数据和交易信号</div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded text-sm font-semibold"
              style={{ background: '#2B3139', color: '#848E9C' }}
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded text-sm font-semibold"
              style={{ background: '#F0B90B', color: '#000' }}
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Model Configuration Modal Component
function ModelConfigModal({
  allModels,
  configuredModels,
  editingModelId,
  onSave,
  onDelete,
  onClose
}: {
  allModels: AIModel[];
  configuredModels: AIModel[];
  editingModelId: string | null;
  onSave: (modelId: string, apiKey: string, baseUrl?: string) => void;
  onDelete: (modelId: string) => void;
  onClose: () => void;
}) {
  const [selectedModelId, setSelectedModelId] = useState(editingModelId || '');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  // 获取当前编辑的模型信息 - 编辑时从已配置的模型中查找，新建时从所有支持的模型中查找
  const selectedModel = editingModelId 
    ? configuredModels?.find(m => m.id === selectedModelId) 
    : allModels?.find(m => m.id === selectedModelId);

  // 如果是编辑现有模型，初始化API Key和Base URL
  useEffect(() => {
    if (editingModelId && selectedModel) {
      setApiKey(selectedModel.apiKey || '');
      setBaseUrl(selectedModel.customApiUrl || '');
    }
  }, [editingModelId, selectedModel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModelId || !apiKey.trim()) return;
    
    onSave(selectedModelId, apiKey.trim(), baseUrl.trim() || undefined);
  };

  // 可选择的模型列表（所有支持的模型）
  const availableModels = allModels || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg relative" style={{ background: '#1E2329' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" style={{ color: '#EAECEF' }}>
            {editingModelId ? '编辑AI模型' : '添加AI模型'}
          </h3>
          {editingModelId && (
            <button
              type="button"
              onClick={() => {
                if (confirm('确定要删除此AI模型配置吗？')) {
                  onDelete(editingModelId);
                }
              }}
              className="p-2 rounded hover:bg-red-100 transition-colors"
              style={{ background: 'rgba(246, 70, 93, 0.1)', color: '#F6465D' }}
              title="删除配置"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingModelId && (
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#EAECEF' }}>
                选择AI模型
              </label>
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="w-full px-3 py-2 rounded"
                style={{ background: '#0B0E11', border: '1px solid #2B3139', color: '#EAECEF' }}
                required
              >
                <option value="">请选择模型</option>
                {availableModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {getShortName(model.name)} ({model.provider})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedModel && (
            <div className="p-4 rounded" style={{ background: '#0B0E11', border: '1px solid #2B3139' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  {getModelIcon(selectedModel.provider || selectedModel.id, { width: 32, height: 32 }) || (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                         style={{ 
                           background: selectedModel.id === 'deepseek' ? '#60a5fa' : '#c084fc',
                           color: '#fff'
                         }}>
                      {selectedModel.name[0]}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-semibold" style={{ color: '#EAECEF' }}>{getShortName(selectedModel.name)}</div>
                  <div className="text-xs" style={{ color: '#848E9C' }}>
                    {selectedModel.provider} • {selectedModel.id}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedModel && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#EAECEF' }}>
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="输入API密钥"
                  className="w-full px-3 py-2 rounded"
                  style={{ background: '#0B0E11', border: '1px solid #2B3139', color: '#EAECEF' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#EAECEF' }}>
                  Base URL (可选)
                </label>
                <input
                  type="url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="自定义API基础URL，如: https://api.openai.com/v1"
                  className="w-full px-3 py-2 rounded"
                  style={{ background: '#0B0E11', border: '1px solid #2B3139', color: '#EAECEF' }}
                />
                <div className="text-xs mt-1" style={{ color: '#848E9C' }}>
                  留空则使用默认API地址
                </div>
              </div>

              <div className="p-4 rounded" style={{ background: 'rgba(240, 185, 11, 0.1)', border: '1px solid rgba(240, 185, 11, 0.2)' }}>
                <div className="text-sm font-semibold mb-2" style={{ color: '#F0B90B' }}>
                  ℹ️ 说明
                </div>
                <div className="text-xs space-y-1" style={{ color: '#848E9C' }}>
                  <div>• API Key将被加密存储，请确保密钥有效</div>
                  <div>• Base URL用于自定义API服务器地址</div>
                  <div>• 删除配置后，使用此模型的交易员将无法正常工作</div>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded text-sm font-semibold"
              style={{ background: '#2B3139', color: '#848E9C' }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!selectedModel || !apiKey.trim()}
              className="flex-1 px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
              style={{ background: '#F0B90B', color: '#000' }}
            >
              保存配置
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Exchange Configuration Modal Component
function ExchangeConfigModal({
  allExchanges,
  editingExchangeId,
  onSave,
  onDelete,
  onClose
}: {
  allExchanges: Exchange[];
  editingExchangeId: string | null;
  onSave: (exchangeId: string, apiKey: string, secretKey?: string, testnet?: boolean, hyperliquidWalletAddr?: string, asterUser?: string, asterSigner?: string, asterPrivateKey?: string) => Promise<void>;
  onDelete: (exchangeId: string) => void;
  onClose: () => void;
}) {
  const [selectedExchangeId, setSelectedExchangeId] = useState(editingExchangeId || '');
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [testnet, setTestnet] = useState(false);

  // 获取当前编辑的交易所信息
  const selectedExchange = allExchanges?.find(e => e.id === selectedExchangeId);

  // 如果是编辑现有交易所，初始化表单数据
  useEffect(() => {
    if (editingExchangeId && selectedExchange) {
      setApiKey(selectedExchange.apiKey || '');
      setSecretKey(selectedExchange.secretKey || '');
      setPassphrase(''); // Don't load existing passphrase for security
      setTestnet(selectedExchange.testnet || false);
    }
  }, [editingExchangeId, selectedExchange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExchangeId) return;
    
    // 根据交易所类型验证不同字段
    if (selectedExchange?.id === 'binance') {
      if (!apiKey.trim() || !secretKey.trim()) return;
    } else if (selectedExchange?.id === 'okx') {
      if (!apiKey.trim() || !secretKey.trim() || !passphrase.trim()) return;
    }
    
    await onSave(selectedExchangeId, apiKey.trim(), secretKey.trim(), testnet, undefined, undefined, undefined, undefined);
  };

  // 可选择的交易所列表（所有支持的交易所）
  const availableExchanges = allExchanges || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg relative" style={{ background: '#1E2329' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" style={{ color: '#EAECEF' }}>
            {editingExchangeId ? '编辑交易所' : '添加交易所'}
          </h3>
          {editingExchangeId && (
            <button
              type="button"
              onClick={() => {
                if (confirm('确定要删除此交易所配置吗？')) {
                  onDelete(editingExchangeId);
                }
              }}
              className="p-2 rounded hover:bg-red-100 transition-colors"
              style={{ background: 'rgba(246, 70, 93, 0.1)', color: '#F6465D' }}
              title="删除配置"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editingExchangeId && (
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#EAECEF' }}>
                选择交易所
              </label>
              <select
                value={selectedExchangeId}
                onChange={(e) => setSelectedExchangeId(e.target.value)}
                className="w-full px-3 py-2 rounded"
                style={{ background: '#0B0E11', border: '1px solid #2B3139', color: '#EAECEF' }}
                required
              >
                <option value="">请选择交易所</option>
                {availableExchanges.map(exchange => (
                  <option key={exchange.id} value={exchange.id}>
                    {getShortName(exchange.name)} ({exchange.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedExchange && (
            <div className="p-4 rounded" style={{ background: '#0B0E11', border: '1px solid #2B3139' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  {getExchangeIcon(selectedExchange.id, { width: 32, height: 32 })}
                </div>
                <div>
                  <div className="font-semibold" style={{ color: '#EAECEF' }}>{getShortName(selectedExchange.name)}</div>
                  <div className="text-xs" style={{ color: '#848E9C' }}>
                    {selectedExchange.type.toUpperCase()} • {selectedExchange.id}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedExchange && (
            <>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#EAECEF' }}>
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="输入API密钥"
                  className="w-full px-3 py-2 rounded"
                  style={{ background: '#0B0E11', border: '1px solid #2B3139', color: '#EAECEF' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#EAECEF' }}>
                  Secret Key
                </label>
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="输入密钥"
                  className="w-full px-3 py-2 rounded"
                  style={{ background: '#0B0E11', border: '1px solid #2B3139', color: '#EAECEF' }}
                  required
                />
              </div>

              {selectedExchange.id === 'okx' && (
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#EAECEF' }}>
                    Passphrase
                  </label>
                  <input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="输入Passphrase (OKX必填)"
                    className="w-full px-3 py-2 rounded"
                    style={{ background: '#0B0E11', border: '1px solid #2B3139', color: '#EAECEF' }}
                    required
                  />
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={testnet}
                    onChange={(e) => setTestnet(e.target.checked)}
                    className="form-checkbox rounded"
                    style={{ accentColor: '#F0B90B' }}
                  />
                  <span style={{ color: '#EAECEF' }}>使用测试网</span>
                </label>
                <div className="text-xs mt-1" style={{ color: '#848E9C' }}>
                  启用后将连接到交易所测试环境，用于模拟交易
                </div>
              </div>

              <div className="p-4 rounded" style={{ background: 'rgba(240, 185, 11, 0.1)', border: '1px solid rgba(240, 185, 11, 0.2)' }}>
                <div className="text-sm font-semibold mb-2" style={{ color: '#F0B90B' }}>
                  ⚠️ 安全提示
                </div>
                <div className="text-xs space-y-1" style={{ color: '#848E9C' }}>
                  <div>• API密钥将被加密存储，建议使用只读或期货交易权限</div>
                  <div>• 不要授予提现权限，确保资金安全</div>
                  <div>• 删除配置后，相关交易员将无法正常交易</div>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded text-sm font-semibold"
              style={{ background: '#2B3139', color: '#848E9C' }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!selectedExchange || !apiKey.trim() || !secretKey.trim() || (selectedExchange?.id === 'okx' && !passphrase.trim())}
              className="flex-1 px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
              style={{ background: '#F0B90B', color: '#000' }}
            >
              保存配置
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}