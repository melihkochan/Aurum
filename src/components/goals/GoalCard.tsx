import React, { useState } from 'react';
import { Calendar, TrendingUp, Plus, Trash2, Pencil } from 'lucide-react';
import type { Goal } from '../../services/portfolio/types';
import { Card as HeroUICard } from '@heroui/react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { usePortfolio } from '../../context/PortfolioContext';

interface GoalCardProps {
  goal: Goal;
  onAllocate: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onEdit?: (goal: Goal) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onAllocate, onDelete, onEdit }) => {
  const { currencySymbol, currencyCode } = usePortfolio();
  const locale = currencyCode === 'USD' ? 'en-US' : currencyCode === 'EUR' ? 'de-DE' : 'tr-TR';
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) || 0;
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  // Calculate monthly required savings if target date exists
  let monthlyRequiredText: string | null = null;
  if (remaining > 0) {
    let diffMonths = 12; // default 12 months fallback
    if (goal.targetDate) {
      // Try to parse year or full date
      const yearMatch = goal.targetDate.match(/20\d\d/);
      if (yearMatch) {
        const targetYear = parseInt(yearMatch[0], 10);
        const now = new Date();
        const yearDiff = targetYear - now.getFullYear();
        diffMonths = Math.max(1, yearDiff * 12 + (11 - now.getMonth()));
      }
    }
    const perMonth = Math.round(remaining / diffMonths);
    monthlyRequiredText = `Tahmini aylık birikim: ${currencySymbol}${perMonth.toLocaleString(locale)}/ay`;
  }

  const getProgressColor = () => {
    if (percentage >= 100) return 'from-emerald-500 to-teal-400';
    if (percentage >= 60) return 'from-[#F5D07A] to-[#E5B85C]';
    return 'from-amber-600 to-amber-400';
  };

  return (
    <>
      <HeroUICard className="rounded-[2rem] bg-[#121218]/90 border border-white/[0.07] hover:border-[#E5B85C]/40 p-6 sm:p-7 backdrop-blur-2xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.7)] transition-all duration-300 flex flex-col justify-between group">
        <div>
          {/* Header with Icon, Title, and Target Date */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-2xl shadow-inner shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                {goal.imageUrl ? (
                  <img src={goal.imageUrl} alt={goal.title} className="w-full h-full object-cover" />
                ) : (
                  goal.icon === 'Car' ? '🚗' : goal.icon === 'Home' ? '🏠' : (goal.icon || '🎯')
                )}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug">
                  {goal.title}
                </h3>
                {goal.targetDate && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#E5B85C]" />
                    <span>Hedef: {goal.targetDate}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(goal);
                  }}
                  className="p-2 rounded-xl text-zinc-400 hover:text-[#F5C042] hover:bg-white/[0.08] transition-colors cursor-pointer"
                  title="Hedefi Düzenle"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsConfirmDeleteOpen(true);
                }}
                className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                title="Hedefi Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Strong Visual Hierarchy: Amounts & Progress */}
          <div className="space-y-2 mb-6">
            <div className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight tabular-nums">
                  %{percentage}
                </span>
                <span className="text-xs text-zinc-400 font-medium">tamamlandı</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-zinc-400 tabular-nums">
                  {currencySymbol}{goal.currentAmount.toLocaleString(locale)} / <span className="text-zinc-200">{currencySymbol}{goal.targetAmount.toLocaleString(locale)}</span>
                </span>
              </div>
            </div>

            <div className="h-3 w-full bg-white/[0.06] rounded-full overflow-hidden p-0.5 border border-white/[0.05]">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-1000 shadow-[0_0_12px_rgba(229,184,92,0.4)]`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Remaining Amount & Monthly Estimation Callout */}
          <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.04] mb-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">Kalan Tutar</span>
              <span className="font-extrabold text-[#F3C969] tabular-nums text-sm">
                {remaining === 0 ? 'Hedefe Ulaşıldı! 🎉' : `${currencySymbol}${remaining.toLocaleString(locale)} kalan`}
              </span>
            </div>

            {monthlyRequiredText && remaining > 0 && (
              <div className="text-xs text-zinc-300 font-medium flex items-center gap-1.5 pt-1.5 border-t border-white/[0.04]">
                <TrendingUp className="w-3.5 h-3.5 text-[#E5B85C] shrink-0" />
                <span className="text-[#F5D07A] font-semibold">{monthlyRequiredText}</span>
              </div>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => onAllocate(goal)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-[#E5B85C]/20 border border-white/[0.08] hover:border-[#E5B85C]/50 text-xs font-bold text-white hover:text-[#F5D07A] transition-all cursor-pointer group-hover:shadow-[0_0_20px_rgba(229,184,92,0.15)]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Birikim Ekle / Ayır</span>
        </button>
      </HeroUICard>

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        title="Hedefi Sil"
        message={`"${goal.title}" hedefini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Hedefi Sil"
        isDestructive={true}
        onConfirm={() => {
          setIsConfirmDeleteOpen(false);
          onDelete(goal.id);
        }}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />
    </>
  );
};
