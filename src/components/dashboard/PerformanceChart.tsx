import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Sparkles, TrendingUp } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import type { ChartTimeframe } from '../../services/market/types';
import { marketService } from '../../services/market/marketService';

const TIMEFRAMES: { id: ChartTimeframe; label: string }[] = [
  { id: '1G', label: '1G' },
  { id: '1H', label: '1H' },
  { id: '1A', label: '1A' },
  { id: '3A', label: '3A' },
  { id: '1Y', label: '1Y' },
];

export const PerformanceChart: React.FC = () => {
  const { totalNetWorth, isBalanceHidden, formatMoney, currencySymbol } = usePortfolio();
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('1A');

  // Generate historical data points matching selected timeframe
  const data = useMemo(() => {
    return marketService.getPortfolioHistory(totalNetWorth, timeframe);
  }, [totalNetWorth, timeframe]);

  // Calculate change for the period
  const periodStats = useMemo(() => {
    if (!data.length || totalNetWorth === 0) {
      return { diff: 0, percent: 0 };
    }
    const first = data[0].value;
    const last = data[data.length - 1].value;
    const diff = last - first;
    const percent = first > 0 ? (diff / first) * 100 : 0;
    return { diff, percent };
  }, [data, totalNetWorth]);

  // Custom luxury tooltip matching Reference 1 peak bubble
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-[#121218]/95 border border-[#E5B85C]/30 rounded-2xl p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(229,184,92,0.2)] backdrop-blur-2xl pointer-events-none">
          <p className="text-[11px] text-zinc-400 font-medium mb-1">{point.dateStr}</p>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5C042] shadow-[0_0_10px_#F5C042]" />
            <span className="font-display text-base font-extrabold text-white tabular-nums">
              {isBalanceHidden ? `${currencySymbol}••••••••` : formatMoney(point.value)}
            </span>
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Portföy Değeri</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-[2rem] bg-white/[0.025] border border-white/[0.06] p-7 sm:p-9 shadow-[0_15px_45px_-15px_rgba(0,0,0,0.7)] backdrop-blur-2xl flex flex-col justify-between h-full">
      {/* Top Header: Title, Value & Timeframe Pills */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E5B85C] block mb-1.5">
            PORTFÖY PERFORMANSI
          </span>
          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums">
              {formatMoney(totalNetWorth)}
            </span>
            {totalNetWorth > 0 && (
              <span className={`text-xs font-bold px-3 py-1 rounded-xl ${periodStats.percent >= 0 ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'}`}>
                {periodStats.percent >= 0 ? '+' : ''}
                {periodStats.percent.toFixed(2)}% ({timeframe})
              </span>
            )}
          </div>
        </div>

        {/* Timeframe Selector Pills (Reference 2 style W/M/Y buttons) */}
        <div className="flex items-center gap-1.5 p-1.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl self-start sm:self-auto">
          {TIMEFRAMES.map((item) => {
            const isSelected = timeframe === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTimeframe(item.id)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#F5D07A] to-[#E5B85C] text-[#0A0A0C] shadow-[0_2px_12px_rgba(229,184,92,0.35)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacious Chart Canvas with Reference 1 Luminous Golden Curve */}
      <div className="w-full h-72 sm:h-84 relative pt-2">
        {totalNetWorth === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center rounded-2xl p-6 text-center">
            <Sparkles className="w-9 h-9 text-[#E5B85C]/60 mb-2 animate-pulse" />
            <p className="text-sm text-white font-bold">Grafik verisi henüz oluşmadı</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs">
              İlk altın veya döviz birikiminizi eklediğinizde anlık getiri grafiğiniz burada canlanacak.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="goldGradientArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5C042" stopOpacity={0.30} />
                  <stop offset="60%" stopColor="#E5B85C" stopOpacity={0.06} />
                  <stop offset="100%" stopColor="#E5B85C" stopOpacity={0} />
                </linearGradient>
                <filter id="goldGlowLine" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#F5D07A" floodOpacity="0.45" />
                </filter>
              </defs>

              <XAxis
                dataKey="dateStr"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717A', fontSize: 11, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                domain={['auto', 'auto']}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717A', fontSize: 11, fontWeight: 500 }}
                tickFormatter={(val) => `${currencySymbol}${(val / 1000).toFixed(0)}k`}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#F5C042"
                strokeWidth={2.5}
                fill="url(#goldGradientArea)"
                filter="url(#goldGlowLine)"
                isAnimationActive={true}
                animationDuration={600}
                dot={false}
                activeDot={{ r: 6, fill: '#FFFFFF', stroke: '#F5C042', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
