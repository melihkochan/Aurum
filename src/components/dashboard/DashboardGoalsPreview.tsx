import React from 'react';
import { Target, ChevronRight, Plus } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Card as HeroUICard } from '@heroui/react';

interface DashboardGoalsPreviewProps {
  onNavigateToGoals: () => void;
  onOpenAddGoal: () => void;
}

export const DashboardGoalsPreview: React.FC<DashboardGoalsPreviewProps> = ({
  onNavigateToGoals,
  onOpenAddGoal,
}) => {
  const { goals, formatMoney } = usePortfolio();

  return (
    <HeroUICard className="h-full rounded-[2rem] bg-[#101016]/80 border border-white/[0.06] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_15px_45px_-15px_rgba(0,0,0,0.7)] flex flex-col justify-between">
      <div>

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#E5B85C]">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E5B85C] block">
                BİRİKİM HEDEFLERİ
              </span>
              <span className="text-[11px] text-zinc-400">Aktif hayal ve birikim ilerlemesi</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddGoal}
              className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-[#E5B85C]/20 border border-white/[0.06] text-xs font-semibold text-zinc-300 hover:text-[#F5D07A] transition-all cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Hedef</span>
            </button>
            <button
              onClick={onNavigateToGoals}
              className="text-xs text-[#E5B85C] hover:text-[#F5D07A] font-bold flex items-center gap-0.5 cursor-pointer ml-1"
            >
              <span>Tümü</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {goals.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            Kayıtlı birikim hedefiniz bulunmuyor.
          </div>
        ) : (
          <div className="space-y-4">
            {goals.slice(0, 3).map((goal) => {
              const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) || 0;
              return (
                <div
                  key={goal.id}
                  onClick={onNavigateToGoals}
                  className="p-3.5 rounded-2xl bg-white/[0.025] hover:bg-white/[0.04] border border-white/[0.04] transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden shadow-inner">
                        {goal.imageUrl ? (
                          <img src={goal.imageUrl} alt={goal.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-base">
                            {goal.icon === 'Car' ? '🚗' : goal.icon === 'Home' ? '🏠' : (goal.icon || '🎯')}
                          </span>
                        )}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-white truncate">
                        {goal.title}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-display text-xs sm:text-sm font-bold text-[#F3C969] tabular-nums">
                        %{pct}
                      </span>
                    </div>
                  </div>

                  <div className="h-2 w-full bg-white/[0.06] rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#F5D07A] to-[#E5B85C] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1.5 tabular-nums">
                    <span>{formatMoney(goal.currentAmount)} birikti</span>
                    <span>Hedef: {formatMoney(goal.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </HeroUICard>
  );
};
