import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePortfolio } from '../../context/PortfolioContext';
import type { AssetAllocationItem } from '../../context/PortfolioContext';
import { Coins, DollarSign, Banknote } from 'lucide-react';

export const AssetAllocation: React.FC = () => {
  const { allocations, totalNetWorth, formatMoney } = usePortfolio();

  // Aggregate category percentages (Altın, Döviz, Nakit TL)
  const aggregatedByCategory = React.useMemo(() => {
    let goldTotal = 0;
    let currencyTotal = 0;
    let cashTotal = 0;

    allocations.forEach((item: AssetAllocationItem) => {
      if (item.category === 'gold') goldTotal += item.currentValue;
      else if (item.category === 'currency') currencyTotal += item.currentValue;
      else if (item.category === 'cash') cashTotal += item.currentValue;
    });

    const goldPct = totalNetWorth > 0 ? (goldTotal / totalNetWorth) * 100 : 0;
    const currPct = totalNetWorth > 0 ? (currencyTotal / totalNetWorth) * 100 : 0;
    const cashPct = totalNetWorth > 0 ? (cashTotal / totalNetWorth) * 100 : 0;

    return [
      { name: 'Altın Varlıkları', value: goldTotal, percentage: goldPct, color: '#F5C042', icon: Coins },
      { name: 'Döviz Portföyü', value: currencyTotal, percentage: currPct, color: '#38BDF8', icon: DollarSign },
      { name: 'Nakit Türk Lirası', value: cashTotal, percentage: cashPct, color: '#10B981', icon: Banknote },
    ].filter((item) => item.value > 0);
  }, [allocations, totalNetWorth]);


  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isBigSlice = (data.percentage || 0) > 40;
      return (
        <div
          className="bg-[#121218] border border-white/15 rounded-2xl p-3 shadow-[0_15px_35px_rgba(0,0,0,0.85)] pointer-events-none transition-transform duration-150 z-50 min-w-[150px]"
          style={{
            transform: isBigSlice ? 'translateX(90px)' : 'none',
          }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: data.color, boxShadow: `0 0 8px ${data.color}80` }}
            />
            <p className="text-xs text-zinc-300 font-bold leading-tight">{data.name}</p>
          </div>
          <p className="font-display text-sm font-black text-white tabular-nums">
            {formatMoney(data.value)}
            <span className="text-[#F5C042] font-semibold text-xs ml-1.5">
              (%{data.percentage.toFixed(1)})
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-[2rem] bg-white/[0.025] border border-white/[0.06] p-7 sm:p-9 shadow-[0_15px_45px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E5B85C]">
            VARLIK DAĞILIMI
          </span>
          <span className="text-xs text-zinc-400 font-medium">
            {allocations.length} aktif kategori
          </span>
        </div>

        {allocations.length === 0 ? (
          <div className="py-20 text-center text-xs text-zinc-500">
            Henüz aktif varlık bulunmuyor
          </div>
        ) : (
          <div className="space-y-6">
            {/* Donut Chart with centered glowing badge */}
            <div className="h-48 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} wrapperStyle={{ zIndex: 50, outline: 'none' }} />
                  <Pie
                    data={aggregatedByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={80}
                    paddingAngle={6}
                    stroke="none"
                  >
                    {aggregatedByCategory.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Centered Donut Stat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">Portföy</span>
                <span className="font-display text-base font-extrabold text-white">Dağılımı</span>
              </div>
            </div>

            {/* Rich progress bar list inspired by Reference 2 */}
            <div className="space-y-4 pt-2 border-t border-white/[0.05]">
              {aggregatedByCategory.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-zinc-200">{cat.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-display text-sm font-black text-white tabular-nums">
                          %{cat.percentage.toFixed(1)}
                        </span>
                        <span className="text-[11px] text-zinc-500 ml-2 tabular-nums">
                          ({formatMoney(cat.value)})
                        </span>
                      </div>
                    </div>

                    {/* Glowing progress track */}
                    <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.color,
                          boxShadow: `0 0 10px ${cat.color}80`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
