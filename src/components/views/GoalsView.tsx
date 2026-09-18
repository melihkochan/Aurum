import React, { useState } from 'react';
import { Target, Plus, Award, CheckCircle2, TrendingUp } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';

import { GoalCard } from '../goals/GoalCard';
import { AddGoalModal } from '../goals/AddGoalModal';
import { EditGoalModal } from '../goals/EditGoalModal';
import { AllocateGoalModal } from '../goals/AllocateGoalModal';
import type { Goal } from '../../services/portfolio/types';

export const GoalsView: React.FC = () => {
  const { goals, deleteGoal, formatMoney } = usePortfolio();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoalForAllocate, setSelectedGoalForAllocate] = useState<Goal | null>(null);

  // Summary Metrics
  const totalTargetAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallPercentage = totalTargetAmount > 0
    ? Math.min(100, Math.round((totalCurrentAmount / totalTargetAmount) * 100))
    : 0;
  const completedGoalsCount = goals.filter((g) => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="space-y-10 pb-20 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Finansal Hedeflerim
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Gelecekteki hayalleriniz ve yatırımlarınız için birikim hedefleri belirleyin ve takip edin
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="heroui-gold-btn flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="font-display font-extrabold text-xs tracking-wider">YENİ HEDEF OLUŞTUR</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-[1.75rem] bg-[#121218]/80 border border-white/[0.06] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Toplam Hedef Tutarı
            </span>
            <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center text-[#E5B85C]">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-extrabold text-white tabular-nums">
            {formatMoney(totalTargetAmount)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Tüm hedeflerin toplamı</span>
        </div>

        <div className="rounded-[1.75rem] bg-[#121218]/80 border border-white/[0.06] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Biriken Tutar
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-extrabold text-emerald-400 tabular-nums">
            {formatMoney(totalCurrentAmount)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Hedeflere ayrılan toplam fon</span>
        </div>

        <div className="rounded-[1.75rem] bg-[#121218]/80 border border-white/[0.06] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Genel Başarı Oranı
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#E5B85C]/15 flex items-center justify-center text-[#F3C969]">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-extrabold text-[#F3C969] tabular-nums">
            %{overallPercentage}
          </div>
          <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-gradient-to-r from-[#F5D07A] to-[#E5B85C]"
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
        </div>

        <div className="rounded-[1.75rem] bg-[#121218]/80 border border-white/[0.06] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Tamamlanan Hedef
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display text-2xl font-extrabold text-white tabular-nums">
            {completedGoalsCount} <span className="text-sm font-semibold text-zinc-500">/ {goals.length}</span>
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Ulaşılan hedef sayısı</span>
        </div>
      </div>

      {/* Goals Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E5B85C]">
            AKTİF BİRİKİM HEDEFLERİ
          </span>
          <span className="text-xs text-zinc-400 font-medium">{goals.length} hedef listeleniyor</span>
        </div>

        {goals.length === 0 ? (
          <div className="rounded-[2rem] bg-[#121218]/60 border border-white/[0.06] p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#E5B85C]/10 border border-[#E5B85C]/20 flex items-center justify-center text-3xl mx-auto mb-4">
              🎯
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Henüz bir hedef eklemediniz</h3>
            <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
              Araba, ev peşinatı, seyahat veya altın birikimi gibi hayallerinizi hedeflere dönüştürerek motivasyonunuzu artırın.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="heroui-gold-btn inline-flex items-center gap-2 px-6 py-3 rounded-xl cursor-pointer text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>İlk Hedefinizi Oluşturun</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onAllocate={(g) => setSelectedGoalForAllocate(g)}
                onDelete={(id) => deleteGoal(id)}
                onEdit={(g) => setEditingGoal(g)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <EditGoalModal
        goal={editingGoal}
        isOpen={Boolean(editingGoal)}
        onClose={() => setEditingGoal(null)}
      />

      <AllocateGoalModal
        goal={selectedGoalForAllocate}
        isOpen={Boolean(selectedGoalForAllocate)}
        onClose={() => setSelectedGoalForAllocate(null)}
      />
    </div>
  );
};
