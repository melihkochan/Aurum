import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import type { Goal } from '../../services/portfolio/types';
import { formatCurrencyInput, parseCurrencyInput, getCurrencyLocale } from '../../utils/formatters';

interface AllocateGoalModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AllocateGoalModal: React.FC<AllocateGoalModalProps> = ({ goal, isOpen, onClose }) => {
  const { allocateToGoal, currencySymbol, currencyCode } = usePortfolio();
  const [amount, setAmount] = useState('');

  if (!isOpen || !goal) return null;

  const locale = getCurrencyLocale(currencyCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseCurrencyInput(amount, currencyCode);
    if (isNaN(num) || num <= 0) return;

    allocateToGoal(goal.id, num);
    setAmount('');
    onClose();
  };

  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-[2.25rem] bg-[#121218] border border-white/10 p-7 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(229,184,92,0.15)] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E5B85C]/10 border border-[#E5B85C]/20 flex items-center justify-center text-xl">
              {goal.icon || '🎯'}
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-white tracking-tight">
                Hedefe Birikim Ekle
              </h2>
              <p className="text-xs text-zinc-400">
                {goal.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Info */}
        <div className="my-5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.05] space-y-2">
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Mevcut Biriken:</span>
            <span className="font-bold text-white tabular-nums">{currencySymbol}{goal.currentAmount.toLocaleString(locale)}</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-400">
            <span>Hedef Tutar:</span>
            <span className="font-bold text-zinc-300 tabular-nums">{currencySymbol}{goal.targetAmount.toLocaleString(locale)}</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-400 pt-1 border-t border-white/[0.05]">
            <span>Kalan Tutar:</span>
            <span className="font-bold text-[#F3C969] tabular-nums">{currencySymbol}{remaining.toLocaleString(locale)}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">
              Aktarılacak / Eklenecek Tutar ({currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">{currencySymbol}</span>
              <input
                type="text"
                inputMode="decimal"
                required
                autoFocus
                placeholder={currencyCode === 'USD' ? 'Örn: 5,000' : 'Örn: 5.000'}
                value={amount}
                onChange={(e) => setAmount(formatCurrencyInput(e.target.value, currencyCode))}
                className="w-full pl-9 pr-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-all tabular-nums"
              />
            </div>
          </div>

          {/* Quick chip buttons */}
          <div className="flex items-center gap-2 pt-1">
            {[1000, 2500, 5000, 10000].map((quickVal) => (
              <button
                key={quickVal}
                type="button"
                onClick={() => setAmount(formatCurrencyInput(quickVal.toString(), currencyCode))}
                className="flex-1 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-semibold text-zinc-300 transition-colors"
              >
                +{currencySymbol}{quickVal.toLocaleString(locale)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="w-1/2 py-3.5 rounded-xl heroui-gold-btn text-xs font-black tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>BİRİKİMİ EKLE</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
