import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet, Plus, TrendingUp } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Card as HeroUICard } from '@heroui/react';

interface MonthlyCashflowCardProps {
  onOpenCashflowModal: (type: 'income' | 'expense') => void;
}

export const MonthlyCashflowCard: React.FC<MonthlyCashflowCardProps> = ({ onOpenCashflowModal }) => {
  const { monthlyIncome, monthlyExpense, monthlyNetSavings, formatMoney } = usePortfolio();

  const savingsRate = monthlyIncome > 0
    ? Math.max(0, Math.round((monthlyNetSavings / monthlyIncome) * 100))
    : 0;

  const isNetPositive = monthlyNetSavings >= 0;

  return (
    <HeroUICard className="h-full rounded-[2rem] bg-[#101016]/80 border border-white/[0.06] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_15px_45px_-15px_rgba(0,0,0,0.7)] flex flex-col justify-between">
      <div>

        {/* Card Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#E5B85C]">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E5B85C] block">
                BU AYKİ NAKİT AKIŞI
              </span>
              <span className="text-[11px] text-zinc-400">Gelir, gider ve tasarruf dengesi</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onOpenCashflowModal('income')}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              title="Gelir Ekle"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Gelir</span>
            </button>
            <button
              onClick={() => onOpenCashflowModal('expense')}
              className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
              title="Gider Ekle"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Gider</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {/* Income */}
          <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.04]">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mb-1">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>TOPLAM GELİR</span>
            </div>
            <div className="font-display text-xl sm:text-2xl font-black text-white tabular-nums">
              +{formatMoney(monthlyIncome)}
            </div>
          </div>

          {/* Expense */}
          <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.04]">
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold mb-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>TOPLAM GİDER</span>
            </div>
            <div className="font-display text-xl sm:text-2xl font-black text-white tabular-nums">
              -{formatMoney(monthlyExpense)}
            </div>
          </div>

          {/* Net Balance */}
          <div className="p-4 rounded-2xl bg-[#E5B85C]/[0.04] border border-[#E5B85C]/15">
            <div className="flex items-center gap-1.5 text-xs text-[#F3C969] font-bold mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>NET TASARRUF</span>
            </div>
            <div className={`font-display text-xl sm:text-2xl font-black tabular-nums ${
              isNetPositive ? 'text-[#F5C042]' : 'text-rose-400'
            }`}>
              {isNetPositive ? '+' : ''}{formatMoney(monthlyNetSavings)}
            </div>
          </div>
        </div>

        {/* Savings Rate Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Bu Ayki Tasarruf Oranı</span>
            <span className="font-bold text-[#F3C969] tabular-nums">%{savingsRate}</span>
          </div>
          <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden p-0.5 border border-white/[0.05]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-[#E5B85C] to-[#F5D07A] transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(0, savingsRate))}%` }}
            />
          </div>
          <div className="text-[11px] text-zinc-500">
            Kazanılan gelirin %{savingsRate}'i birikim veya yatırıma aktarılabilir durumda.
          </div>
        </div>
      </div>
    </HeroUICard>
  );
};
