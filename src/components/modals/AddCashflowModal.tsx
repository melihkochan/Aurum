import React, { useState } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, Check, Calendar } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import type { CashflowCategory } from '../../services/portfolio/types';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/formatters';

interface AddCashflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'income' | 'expense';
}

const INCOME_CATEGORIES = ['Maaş', 'Ek Gelir', 'Yatırım Getirisi', 'Prim & İkramiye', 'Diğer Gelir'];
const EXPENSE_CATEGORIES = ['Kira & Konut', 'Faturalar', 'Market & Gıda', 'Ulaşım & Akaryakıt', 'Yeme & İçme', 'Sağlık', 'Eğlence', 'Diğer Gider'];

export const AddCashflowModal: React.FC<AddCashflowModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'income',
}) => {
  const { addIncome, addExpense, currencySymbol, currencyCode } = usePortfolio();

  const [type, setType] = useState<'income' | 'expense'>(defaultType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(type === 'income' ? 'Maaş' : 'Kira & Konut');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Sync category and type when defaultType or isOpen changes
  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  React.useEffect(() => {
    if (isOpen) {
      handleTypeChange(defaultType);
    }
  }, [isOpen, defaultType]);


  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseCurrencyInput(amount, currencyCode);
    if (!title.trim() || isNaN(num) || num <= 0) return;

    if (type === 'income') {
      addIncome(num, category as CashflowCategory, title.trim(), date);
    } else {
      addExpense(num, category as CashflowCategory, title.trim(), date);
    }

    // Reset
    setTitle('');
    setAmount('');
    onClose();
  };


  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-[2.25rem] bg-[#121218] border border-white/10 p-7 sm:p-9 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(229,184,92,0.12)] overflow-hidden">
        {/* Glow */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 ${
          type === 'income' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
        }`} />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
          <div>
            <h2 className="font-display text-lg font-bold text-white tracking-tight">
              {type === 'income' ? 'Gelir Ekle' : 'Gider Ekle'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Aylık nakit akışınızı ve tasarruf dengenizi güncelleyin
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Toggle Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] my-6">
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>GELİR (+ {currencySymbol})</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>GİDER (- {currencySymbol})</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">
              Tutar ({currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">{currencySymbol}</span>
              <input
                type="text"
                inputMode="decimal"
                required
                autoFocus
                placeholder={currencyCode === 'USD' ? 'Örn: 15,000' : 'Örn: 15.000'}
                value={amount}
                onChange={(e) => setAmount(formatCurrencyInput(e.target.value, currencyCode))}
                className="w-full pl-9 pr-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-600 font-mono tabular-nums"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">
              İşlem Başlığı / Açıklaması
            </label>
            <input
              type="text"
              required
              placeholder={type === 'income' ? 'Örn: Eylül Ayı Maaşı, Freelance Tasarım...' : 'Örn: Daire Kirası, Market Fişi...'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          {/* Category Chips */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">
              Kategori Seçin
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    category === cat
                      ? type === 'income'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                      : 'bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#E5B85C]" />
                Tarih
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDate(new Date().toISOString().split('T')[0])}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-[#E5B85C]/20 text-zinc-400 hover:text-[#F3C969] transition-colors cursor-pointer"
                >
                  Bugün
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 1);
                    setDate(d.toISOString().split('T')[0]);
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-[#E5B85C]/20 text-zinc-400 hover:text-[#F3C969] transition-colors cursor-pointer"
                >
                  Dün
                </button>
              </div>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              onClick={(e) => e.currentTarget.showPicker?.()}
              className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-all [color-scheme:dark] cursor-pointer"
            />
          </div>

          {/* Actions */}
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
              className={`w-1/2 py-3.5 rounded-xl text-xs font-black tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                type === 'income'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:brightness-110'
                  : 'bg-gradient-to-r from-rose-600 to-pink-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:brightness-110'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{type === 'income' ? 'GELİRİ KAYDET' : 'GİDERİ KAYDET'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
