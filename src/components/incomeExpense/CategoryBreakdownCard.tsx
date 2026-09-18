import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePortfolio } from '../../context/PortfolioContext';
import { calculateCategoryDistribution } from '../../services/portfolio/financeEngine';
import type { CategoryBreakdownItem } from '../../services/portfolio/financeEngine';
import { CategoryTransactionsModal } from './CategoryTransactionsModal';
import type { Transaction } from '../../services/portfolio/types';

interface CategoryBreakdownCardProps {
  onSelectTransaction?: (tx: Transaction) => void;
}

export const CategoryBreakdownCard: React.FC<CategoryBreakdownCardProps> = ({
  onSelectTransaction = () => {},
}) => {
  const { transactions, categories, formatMoney } = usePortfolio();
  const [activeType, setActiveType] = useState<'expense' | 'income'>('expense');
  const [selectedCategory, setSelectedCategory] = useState<CategoryBreakdownItem | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const breakdown = React.useMemo(() => {
    return calculateCategoryDistribution(transactions, activeType, categories);
  }, [transactions, activeType, categories]);

  const totalAmount = React.useMemo(() => {
    return breakdown.reduce((sum, item) => sum + item.amount, 0);
  }, [breakdown]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CategoryBreakdownItem;
      const isBigSlice = (data.percentage || 0) > 40;
      return (
        <div
          className="bg-[#121218] border border-white/15 rounded-2xl p-3 shadow-[0_15px_35px_rgba(0,0,0,0.85)] pointer-events-none transition-transform duration-150 z-50 min-w-[150px]"
          style={{
            transform: isBigSlice ? 'translateX(85px)' : 'none',
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: data.color, boxShadow: `0 0 8px ${data.color}80` }}
            />
            <span className="text-xs text-zinc-300 font-bold leading-tight">{data.name}</span>
          </div>
          <div className="font-display text-sm font-black text-white tabular-nums">
            {formatMoney(data.amount)}
            <span className="text-xs text-[#F5C042] font-semibold ml-1.5">(%{data.percentage})</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-[2rem] bg-white/[0.025] border border-white/[0.06] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_15px_45px_-15px_rgba(0,0,0,0.7)] flex flex-col justify-between h-full">
      <div>
        {/* Header with Type Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E5B85C] block">
              {activeType === 'expense' ? 'HARCAMA DAĞILIMI' : 'GELİR KAYNAKLARI'}
            </span>
            <span className="text-[11px] text-zinc-400">
              Kategorilerin toplam içindeki payı (Tıklayarak inceleyin)
            </span>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] self-start sm:self-auto">
            <button
              onClick={() => setActiveType('expense')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeType === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Giderler
            </button>
            <button
              onClick={() => setActiveType('income')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeType === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Gelirler
            </button>
          </div>
        </div>

        {breakdown.length === 0 ? (
          <div className="py-16 text-center text-xs text-zinc-500 border border-dashed border-white/[0.06] rounded-2xl">
            Bu ay için henüz {activeType === 'expense' ? 'gider' : 'gelir'} kaydı bulunmuyor.
          </div>
        ) : (
          <div className="space-y-6">
            {/* Donut Chart */}
            <div className="h-48 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                  <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 50, outline: 'none' }} />
                  <Pie
                    data={breakdown}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={78}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {breakdown.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label (fades smoothly when hovering a slice so it never overlaps) */}
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 transition-opacity duration-150 ${
                  isHovered ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  TOPLAM
                </span>
                <span className="font-display text-sm font-black text-white tabular-nums">
                  {formatMoney(totalAmount)}
                </span>
              </div>
            </div>

            {/* Category List with Progress Bars (Clickable) */}
            <div className="space-y-3.5 pt-2 border-t border-white/[0.05]">
              {breakdown.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedCategory(item)}
                  className="space-y-1.5 p-2 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 group-hover:scale-125 transition-transform"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-bold text-zinc-200 group-hover:text-white transition-colors">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        ({item.transactionCount} işlem)
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-display text-xs font-bold text-white tabular-nums">
                        {formatMoney(item.amount)}
                      </span>
                      <span className="text-[11px] font-semibold text-[#F5C042] ml-2 tabular-nums">
                        %{item.percentage}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Modal */}
      <CategoryTransactionsModal
        isOpen={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory}
        onSelectTransaction={onSelectTransaction}
      />
    </div>
  );
};
