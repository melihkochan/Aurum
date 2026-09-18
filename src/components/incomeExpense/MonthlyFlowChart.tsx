import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { usePortfolio } from '../../context/PortfolioContext';
import { calculateCashflowHistory } from '../../services/portfolio/financeEngine';

export const MonthlyFlowChart: React.FC = () => {
  const { transactions, formatMoney, isBalanceHidden, currencySymbol } = usePortfolio();
  const [period, setPeriod] = useState<6 | 12>(6);

  const historyData = React.useMemo(() => {
    return calculateCashflowHistory(transactions, period);
  }, [transactions, period]);

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#121218] border border-white/15 rounded-2xl p-3.5 shadow-2xl z-50 space-y-2 min-w-[150px]">
          <p className="text-xs font-bold text-zinc-300 pb-1 border-b border-white/[0.08]">
            {label}
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between gap-3 text-emerald-400 font-bold">
              <span>Gelir:</span>
              <span className="tabular-nums">+{formatMoney(payload[0]?.value || 0)}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-rose-400 font-bold">
              <span>Gider:</span>
              <span className="tabular-nums">-{formatMoney(payload[1]?.value || 0)}</span>
            </div>
            {payload[0] && payload[1] && (
              <div className="flex items-center justify-between gap-3 text-[#F5C042] font-extrabold pt-1 border-t border-white/[0.05]">
                <span>Net:</span>
                <span className="tabular-nums">
                  {formatMoney((payload[0].value || 0) - (payload[1].value || 0))}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-[2rem] bg-white/[0.025] border border-white/[0.06] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_15px_45px_-15px_rgba(0,0,0,0.7)] flex flex-col justify-between h-full">
      <div>
        {/* Header with 6/12 Month Selector */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E5B85C] block">
              GELİR & GİDER TRENDİ
            </span>
            <span className="text-[11px] text-zinc-400">
              Aylık nakit akışı ve tasarruf geçmişiniz
            </span>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <button
              onClick={() => setPeriod(6)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === 6
                  ? 'bg-[#E5B85C]/20 text-[#F5C042] border border-[#E5B85C]/30 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              6 Ay
            </button>
            <button
              onClick={() => setPeriod(12)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === 12
                  ? 'bg-[#E5B85C]/20 text-[#F5C042] border border-[#E5B85C]/30 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              12 Ay
            </button>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={historyData} barGap={4} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="monthLabel" 
                stroke="#71717A" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke={isBalanceHidden ? '#52525B' : '#71717A'} 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => isBalanceHidden ? '••••' : `${currencySymbol}${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend 
                verticalAlign="top" 
                align="right" 
                wrapperStyle={{ paddingBottom: '16px', fontSize: '11px' }}
                iconType="circle"
              />
              <Bar 
                name="Gelir" 
                dataKey="income" 
                fill="#10B981" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={28} 
              />
              <Bar 
                name="Gider" 
                dataKey="expense" 
                fill="#EF4444" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={28} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
