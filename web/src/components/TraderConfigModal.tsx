import { useState, useEffect } from 'react';
import type { AIModel, Exchange, CreateTraderRequest } from '../types';

// 提取下划线后面的名称部分
function getShortName(fullName: string): string {
  const parts = fullName.split('_');
  return parts.length > 1 ? parts[parts.length - 1] : fullName;
}

interface TraderConfigData {
  trader_id?: string;
  trader_name: string;
  ai_model: string;
  exchange_id: string;
  btc_eth_leverage: number;
  altcoin_leverage: number;
  trading_symbols: string;
  custom_prompt: string;
  override_base_prompt: boolean;
  is_cross_margin: boolean;
  use_coin_pool: boolean;
  use_oi_top: boolean;
  initial_balance: number;
}

interface TraderConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  traderData?: TraderConfigData | null;
  isEditMode?: boolean;
  availableModels?: AIModel[];
  availableExchanges?: Exchange[];
  onSave?: (data: CreateTraderRequest) => Promise<void>;
}

export function TraderConfigModal({ 
  isOpen, 
  onClose, 
  traderData, 
  isEditMode = false,
  availableModels = [],
  availableExchanges = [],
  onSave 
}: TraderConfigModalProps) {
  const [formData, setFormData] = useState<TraderConfigData>({
    trader_name: '',
    ai_model: '',
    exchange_id: '',
    btc_eth_leverage: 5,
    altcoin_leverage: 3,
    trading_symbols: '',
    custom_prompt: '',
    override_base_prompt: false,
    is_cross_margin: true,
    use_coin_pool: false,
    use_oi_top: false,
    initial_balance: 1000,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [availableCoins, setAvailableCoins] = useState<string[]>([]);
  const [selectedCoins, setSelectedCoins] = useState<string[]>([]);
  const [showCoinSelector, setShowCoinSelector] = useState(false);

  useEffect(() => {
    if (traderData) {
      setFormData(traderData);
      // 设置已选择的币种
      if (traderData.trading_symbols) {
        const coins = traderData.trading_symbols.split(',').map(s => s.trim()).filter(s => s);
        setSelectedCoins(coins);
      }
    } else if (!isEditMode) {
      setFormData({
        trader_name: '',
        ai_model: availableModels[0]?.id || '',
        exchange_id: availableExchanges[0]?.id || '',
        btc_eth_leverage: 5,
        altcoin_leverage: 3,
        trading_symbols: '',
        custom_prompt: '',
        override_base_prompt: false,
        is_cross_margin: true,
        use_coin_pool: false,
        use_oi_top: false,
        initial_balance: 1000,
      });
    }
  }, [traderData, isEditMode, availableModels, availableExchanges]);

  // 获取系统配置中的币种列表
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        const config = await response.json();
        if (config.default_coins) {
          setAvailableCoins(config.default_coins);
        }
      } catch (error) {
        console.error('Failed to fetch config:', error);
        // 使用默认币种列表
        setAvailableCoins(['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT', 'ADAUSDT']);
      }
    };
    fetchConfig();
  }, []);

  // 当选择的币种改变时，更新输入框
  useEffect(() => {
    const symbolsString = selectedCoins.join(',');
    setFormData(prev => ({ ...prev, trading_symbols: symbolsString }));
  }, [selectedCoins]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof TraderConfigData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 如果是直接编辑trading_symbols，同步更新selectedCoins
    if (field === 'trading_symbols') {
      const coins = value.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      setSelectedCoins(coins);
    }
  };

  const handleCoinToggle = (coin: string) => {
    setSelectedCoins(prev => {
      if (prev.includes(coin)) {
        return prev.filter(c => c !== coin);
      } else {
        return [...prev, coin];
      }
    });
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      const saveData: CreateTraderRequest = {
        name: formData.trader_name,
        ai_model_id: formData.ai_model,
        exchange_id: formData.exchange_id,
        btc_eth_leverage: formData.btc_eth_leverage,
        altcoin_leverage: formData.altcoin_leverage,
        trading_symbols: formData.trading_symbols,
        custom_prompt: formData.custom_prompt,
        override_base_prompt: formData.override_base_prompt,
        is_cross_margin: formData.is_cross_margin,
        use_coin_pool: formData.use_coin_pool,
        use_oi_top: formData.use_oi_top,
        initial_balance: formData.initial_balance,
      };
      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div 
        className="bg-[#1E2329] border border-[#2B3139] rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2B3139] bg-gradient-to-r from-[#1E2329] to-[#252B35]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F0B90B] to-[#E1A706] flex items-center justify-center">
              <span className="text-lg">{isEditMode ? '✏️' : '➕'}</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#EAECEF]">
                {isEditMode ? '修改交易员' : '创建交易员'}
              </h2>
              <p className="text-sm text-[#848E9C] mt-1">
                {isEditMode ? '修改交易员配置参数' : '配置新的AI交易员'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139] transition-colors flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Basic Info */}
          <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-5">
            <h3 className="text-lg font-semibold text-[#EAECEF] mb-5 flex items-center gap-2">
              🤖 基础配置
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#EAECEF] block mb-2">交易员名称</label>
                <input
                  type="text"
                  value={formData.trader_name}
                  onChange={(e) => handleInputChange('trader_name', e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0E11] border border-[#2B3139] rounded text-[#EAECEF] focus:border-[#F0B90B] focus:outline-none"
                  placeholder="请输入交易员名称"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#EAECEF] block mb-2">AI模型</label>
                  <select
                    value={formData.ai_model}
                    onChange={(e) => handleInputChange('ai_model', e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E11] border border-[#2B3139] rounded text-[#EAECEF] focus:border-[#F0B90B] focus:outline-none"
                  >
                    {availableModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {getShortName(model.name || model.id).toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-[#EAECEF] block mb-2">交易所</label>
                  <select
                    value={formData.exchange_id}
                    onChange={(e) => handleInputChange('exchange_id', e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E11] border border-[#2B3139] rounded text-[#EAECEF] focus:border-[#F0B90B] focus:outline-none"
                  >
                    {availableExchanges.map(exchange => (
                      <option key={exchange.id} value={exchange.id}>
                        {getShortName(exchange.name || exchange.id).toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Configuration */}
          <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-5">
            <h3 className="text-lg font-semibold text-[#EAECEF] mb-5 flex items-center gap-2">
              ⚖️ 交易配置
            </h3>
            <div className="space-y-4">
              {/* 第一行：保证金模式和初始余额 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#EAECEF] block mb-2">保证金模式</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleInputChange('is_cross_margin', true)}
                      className={`flex-1 px-3 py-2 rounded text-sm ${
                        formData.is_cross_margin 
                          ? 'bg-[#F0B90B] text-black' 
                          : 'bg-[#0B0E11] text-[#848E9C] border border-[#2B3139]'
                      }`}
                    >
                      全仓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('is_cross_margin', false)}
                      className={`flex-1 px-3 py-2 rounded text-sm ${
                        !formData.is_cross_margin 
                          ? 'bg-[#F0B90B] text-black' 
                          : 'bg-[#0B0E11] text-[#848E9C] border border-[#2B3139]'
                      }`}
                    >
                      逐仓
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-[#EAECEF] block mb-2">初始余额 ($)</label>
                  <input
                    type="number"
                    value={formData.initial_balance}
                    onChange={(e) => handleInputChange('initial_balance', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0B0E11] border border-[#2B3139] rounded text-[#EAECEF] focus:border-[#F0B90B] focus:outline-none"
                    min="100"
                    step="100"
                  />
                </div>
              </div>

              {/* 第二行：杠杆设置 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#EAECEF] block mb-2">BTC/ETH 杠杆</label>
                  <input
                    type="number"
                    value={formData.btc_eth_leverage}
                    onChange={(e) => handleInputChange('btc_eth_leverage', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0B0E11] border border-[#2B3139] rounded text-[#EAECEF] focus:border-[#F0B90B] focus:outline-none"
                    min="1"
                    max="125"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#EAECEF] block mb-2">山寨币杠杆</label>
                  <input
                    type="number"
                    value={formData.altcoin_leverage}
                    onChange={(e) => handleInputChange('altcoin_leverage', Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0B0E11] border border-[#2B3139] rounded text-[#EAECEF] focus:border-[#F0B90B] focus:outline-none"
                    min="1"
                    max="75"
                  />
                </div>
              </div>

              {/* 第三行：交易币种 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-[#EAECEF]">交易币种 (用逗号分隔，留空使用默认)</label>
                  <button
                    type="button"
                    onClick={() => setShowCoinSelector(!showCoinSelector)}
                    className="px-3 py-1 text-xs bg-[#F0B90B] text-black rounded hover:bg-[#E1A706] transition-colors"
                  >
                    {showCoinSelector ? '收起选择' : '快速选择'}
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.trading_symbols}
                  onChange={(e) => handleInputChange('trading_symbols', e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0E11] border border-[#2B3139] rounded text-[#EAECEF] focus:border-[#F0B90B] focus:outline-none"
                  placeholder="例如: BTCUSDT,ETHUSDT,ADAUSDT"
                />
                
                {/* 币种选择器 */}
                {showCoinSelector && (
                  <div className="mt-3 p-3 bg-[#0B0E11] border border-[#2B3139] rounded">
                    <div className="text-xs text-[#848E9C] mb-2">点击选择币种：</div>
                    <div className="flex flex-wrap gap-2">
                      {availableCoins.map(coin => (
                        <button
                          key={coin}
                          type="button"
                          onClick={() => handleCoinToggle(coin)}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            selectedCoins.includes(coin)
                              ? 'bg-[#F0B90B] text-black'
                              : 'bg-[#1E2329] text-[#848E9C] border border-[#2B3139] hover:border-[#F0B90B]'
                          }`}
                        >
                          {coin.replace('USDT', '')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Signal Sources */}
          <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-5">
            <h3 className="text-lg font-semibold text-[#EAECEF] mb-5 flex items-center gap-2">
              📡 信号源配置
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.use_coin_pool}
                  onChange={(e) => handleInputChange('use_coin_pool', e.target.checked)}
                  className="w-4 h-4"
                />
                <label className="text-sm text-[#EAECEF]">使用 Coin Pool 信号</label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.use_oi_top}
                  onChange={(e) => handleInputChange('use_oi_top', e.target.checked)}
                  className="w-4 h-4"
                />
                <label className="text-sm text-[#EAECEF]">使用 OI Top 信号</label>
              </div>
            </div>
          </div>

          {/* Trading Prompt */}
          <div className="bg-[#0B0E11] border border-[#2B3139] rounded-lg p-5">
            <h3 className="text-lg font-semibold text-[#EAECEF] mb-5 flex items-center gap-2">
              💬 交易策略提示词
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.override_base_prompt}
                  onChange={(e) => handleInputChange('override_base_prompt', e.target.checked)}
                  className="w-4 h-4"
                />
                <label className="text-sm text-[#EAECEF]">覆盖默认提示词</label>
                <span className="text-xs text-[#F0B90B]">⚠️ 启用后将完全替换默认策略</span>
              </div>
              <div>
                <label className="text-sm text-[#EAECEF] block mb-2">
                  {formData.override_base_prompt ? '自定义提示词' : '附加提示词'}
                </label>
                <textarea
                  value={formData.custom_prompt}
                  onChange={(e) => handleInputChange('custom_prompt', e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0E11] border border-[#2B3139] rounded text-[#EAECEF] focus:border-[#F0B90B] focus:outline-none h-24 resize-none"
                  placeholder={formData.override_base_prompt ? "输入完整的交易策略提示词..." : "输入额外的交易策略提示..."}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-[#2B3139] bg-gradient-to-r from-[#1E2329] to-[#252B35]">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#2B3139] text-[#EAECEF] rounded-lg hover:bg-[#404750] transition-all duration-200 border border-[#404750]"
          >
            取消
          </button>
          {onSave && (
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.trader_name || !formData.ai_model || !formData.exchange_id}
              className="px-8 py-3 bg-gradient-to-r from-[#F0B90B] to-[#E1A706] text-black rounded-lg hover:from-[#E1A706] hover:to-[#D4951E] transition-all duration-200 disabled:bg-[#848E9C] disabled:cursor-not-allowed font-medium shadow-lg"
            >
              {isSaving ? '保存中...' : (isEditMode ? '保存修改' : '创建交易员')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}