import React from 'react';
import { ArrowDownLeft, ArrowUpRight, TrendingUp, Clock3 } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

export const CashflowSummaryCards: React.FC = () => {
  const { monthlyCashflow, formatMoney } = usePortfolio();

  const isNetPositive = monthlyCashflow.realizedNet >= 0;
  const isExpectedPositive = monthlyCashflow.expectedNet >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch">
      {/* 1. TOPLAM GELİR */}
      <div className="min-h-[168px] rounded-[2rem] bg-white/[0.025] border border-white/[0.06] p-6 sm:p-7 flex flex-col justify-between backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-all hover:border-emerald-500/30">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
              TOPLAM GELİR
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums">
            +{formatMoney(monthlyCashflow.realizedIncome)}
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.05] flex items-center justify-between text-xs text-zinc-400">
          <span>Bu ay gerçekleşen</span>
          <span className="text-emerald-400 font-semibold">
            {monthlyCashflow.expectedIncome > 0 ? `+${formatMoney(monthlyCashflow.expectedIncome)} beklenen` : 'Tamamı tahsil edildi'}
          </span>
        </div>
      </div>

      {/* 2. TOPLAM GİDER */}
      <div className="min-h-[168px] rounded-[2rem] bg-white/[0.025] border border-white/[0.06] p-6 sm:p-7 flex flex-col justify-between backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-all hover:border-rose-500/30">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
              TOPLAM GİDER
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl sm:text-3xl font-black text-rose-400 tabular-nums">
            -{formatMoney(monthlyCashflow.realizedExpense)}
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.05] flex items-center justify-between text-xs text-zinc-400">
          <span>Bu ay harcanan</span>
          <span className="text-rose-400/90 font-semibold">
            {monthlyCashflow.expectedExpense > 0 ? `-${formatMoney(monthlyCashflow.expectedExpense)} beklenen` : 'Ödemeler tamam'}
          </span>
        </div>
      </div>

      {/* 3. NET TASARRUF */}
      <div className="min-h-[168px] rounded-[2rem] bg-[#E5B85C]/[0.03] border border-[#E5B85C]/20 p-6 sm:p-7 flex flex-col justify-between backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-all hover:border-[#E5B85C]/40">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E5B85C]">
              NET TASARRUF
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#E5B85C]/15 border border-[#E5B85C]/30 flex items-center justify-center text-[#F5C042] shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className={`font-display text-2xl sm:text-3xl font-black tabular-nums ${
            isNetPositive ? 'text-[#F5C042]' : 'text-rose-400'
          }`}>
            {isNetPositive ? '+' : ''}{formatMoney(monthlyCashflow.realizedNet)}
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.05] flex items-center justify-between text-xs text-zinc-400">
          <span>Tasarruf Oranı</span>
          <span className="text-[#F3C969] font-bold tabular-nums">
            %{monthlyCashflow.savingsRate}
          </span>
        </div>
      </div>

      {/* 4. BEKLENEN / PLANLANAN */}
      <div className="min-h-[168px] rounded-[2rem] bg-white/[0.02] border border-white/[0.06] p-6 sm:p-7 flex flex-col justify-between backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-all hover:border-amber-500/30">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
              BEKLENEN AY SONU NETİ
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Clock3 className="w-4 h-4" />
            </div>
          </div>
          <div className={`font-display text-2xl sm:text-3xl font-black tabular-nums ${
            isExpectedPositive ? 'text-amber-400' : 'text-rose-400/90'
          }`}>
            {isExpectedPositive ? '+' : ''}{formatMoney(monthlyCashflow.expectedNet)}
          </div>
        </div>

        <div className="pt-4 border-t border-white/[0.05] flex items-center justify-between text-xs text-zinc-400">
          <span>Ay sonu tahmini</span>
          <span className="text-zinc-300 font-medium">
            Tüm planlananlar dahil
          </span>
        </div>
      </div>
    </div>
  );
};
