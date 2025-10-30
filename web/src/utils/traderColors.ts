// Trader颜色配置 - 统一的颜色分配逻辑
// 用于 ComparisonChart 和 Leaderboard，确保颜色一致性

export const TRADER_COLORS = [
  '#60a5fa', // blue-400
  '#c084fc', // purple-400
  '#34d399', // emerald-400
  '#fb923c', // orange-400
  '#f472b6', // pink-400
  '#fbbf24', // amber-400
  '#38bdf8', // sky-400
  '#a78bfa', // violet-400
  '#4ade80', // green-400
  '#fb7185', // rose-400
];

/**
 * 根据trader的索引位置获取颜色
 * @param traders - trader列表
 * @param traderId - 当前trader的ID
 * @returns 对应的颜色值
 */
export function getTraderColor(
  traders: Array<{ trader_id: string }>,
  traderId: string
): string {
  const traderIndex = traders.findIndex((t) => t.trader_id === traderId);
  if (traderIndex === -1) return TRADER_COLORS[0]; // 默认返回第一个颜色
  // 如果超出颜色池大小，循环使用
  return TRADER_COLORS[traderIndex % TRADER_COLORS.length];
}
