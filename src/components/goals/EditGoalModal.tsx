import React, { useState, useEffect } from 'react';
import { X, Target, Upload, Calendar, Trash2 } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { GoalDatePicker } from './GoalDatePicker';
import type { Goal, GoalCategory } from '../../services/portfolio/types';
import { formatCurrencyInput, parseCurrencyInput, getCurrencySymbol } from '../../utils/formatters';

interface EditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
}

const AVAILABLE_ICONS = [
  { emoji: '🚗', label: 'Araba', cat: 'car' as GoalCategory },
  { emoji: '🏠', label: 'Konut', cat: 'house' as GoalCategory },
  { emoji: '✈️', label: 'Seyahat', cat: 'vacation' as GoalCategory },
  { emoji: '💍', label: 'Ziynet', cat: 'wedding' as GoalCategory },
  { emoji: '💻', label: 'Teknoloji', cat: 'tech' as GoalCategory },
  { emoji: '🛡️', label: 'Acil Fon', cat: 'target' as GoalCategory },
  { emoji: '🎓', label: 'Eğitim', cat: 'education' as GoalCategory },
  { emoji: '🎁', label: 'Hediye', cat: 'other' as GoalCategory },
  { emoji: '🏖️', label: 'Tatil', cat: 'vacation' as GoalCategory },
  { emoji: '📱', label: 'Cihaz', cat: 'tech' as GoalCategory },
  { emoji: '⛵', label: 'Deniz', cat: 'other' as GoalCategory },
  { emoji: '🎯', label: 'Genel', cat: 'target' as GoalCategory },
];

export const EditGoalModal: React.FC<EditGoalModalProps> = ({ isOpen, onClose, goal }) => {
  const { updateGoal, preferences } = usePortfolio();
  const currencyCode = preferences?.currency || 'TRY';
  const currencySymbol = getCurrencySymbol(currencyCode);

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [icon, setIcon] = useState('🚗');
  const [category, setCategory] = useState<GoalCategory>('car');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setTargetAmount(formatCurrencyInput(String(goal.targetAmount), currencyCode));
      setCurrentAmount(formatCurrencyInput(String(goal.currentAmount || 0), currencyCode));
      setTargetDate(goal.targetDate || '');
      setIcon(goal.icon || '🎯');
      setCategory(goal.category || 'target');
      setImageUrl(goal.imageUrl || null);
      setNote(goal.note || '');
    }
  }, [goal, isOpen, currencyCode]);

  if (!isOpen || !goal) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectIcon = (selectedEmoji: string, cat: GoalCategory) => {
    setIcon(selectedEmoji);
    setCategory(cat);
    setImageUrl(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseCurrencyInput(targetAmount, currencyCode);
    if (!title.trim() || isNaN(targetNum) || targetNum <= 0) return;

    const currentNum = parseCurrencyInput(currentAmount, currencyCode);

    updateGoal(goal.id, {
      title: title.trim(),
      targetAmount: targetNum,
      currentAmount: currentNum,
      targetDate: targetDate || undefined,
      icon,
      imageUrl: imageUrl || undefined,
      category,
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-[2.25rem] bg-[#121218] border border-white/10 p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(229,184,92,0.15)] overflow-hidden my-6">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E5B85C]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E5B85C]/10 border border-[#E5B85C]/20 flex items-center justify-center text-[#F3C969]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white tracking-tight">
                Hedefi Düzenle
              </h2>
              <p className="text-xs text-zinc-400">
                Hedef tutarını, tarihini, görselini veya detaylarını güncelleyin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-5 relative z-10">
          {/* Goal Title */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Hedef Başlığı
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: 2027 Model Sıfır Araba"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white font-medium text-sm focus:outline-none focus:border-[#E5B85C] transition-all"
            />
          </div>

          {/* Amounts Grid: Target & Current */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Hedef Tutar ({currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">{currencySymbol}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(formatCurrencyInput(e.target.value, currencyCode))}
                  placeholder={currencyCode === 'USD' ? '750,000' : '750.000'}
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-[#E5B85C] transition-all tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Mevcut Birikim ({currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">{currencySymbol}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(formatCurrencyInput(e.target.value, currencyCode))}
                  placeholder="0"
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-[#F5C042] font-bold text-sm focus:outline-none focus:border-[#E5B85C] transition-all tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Target Date with Custom Modern Calendar */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Hedef Bitiş Tarihi
            </label>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 text-left flex items-center justify-between text-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#E5B85C]" />
                <span className={targetDate ? 'text-white font-semibold' : 'text-zinc-500'}>
                  {targetDate || 'Tarih seçin (örn: 18 Eylül 2027)'}
                </span>
              </div>
              <span className="text-[11px] text-[#E5B85C] font-semibold opacity-80 group-hover:opacity-100">
                {targetDate ? 'Değiştir' : 'Takvim Aç'}
              </span>
            </button>
          </div>

          {/* Icon & Custom Image Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Görsel veya Simge
              </label>
              <label className="text-xs text-[#E5B85C] hover:underline flex items-center gap-1 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Fotoğraf Yükle</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Custom Image Preview if uploaded */}
            {imageUrl ? (
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-[#E5B85C]/30 flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20 shrink-0">
                    <img src={imageUrl} alt="Özel Görsel" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Özel Hedef Fotoğrafı</span>
                    <span className="text-[10px] text-emerald-400">Yüklendi</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Fotoğrafı Kaldır"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            {/* Emoji Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-6 gap-2 max-h-32 overflow-y-auto p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] aurum-scrollbar">
              {AVAILABLE_ICONS.map((item) => (
                <button
                  key={item.emoji}
                  type="button"
                  onClick={() => handleSelectIcon(item.emoji, item.cat)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xl transition-all cursor-pointer ${
                    !imageUrl && icon === item.emoji
                      ? 'bg-[#E5B85C]/20 border-[#E5B85C] text-[#F3C969] scale-105 shadow-[0_0_15px_rgba(229,184,92,0.3)]'
                      : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.08]'
                  }`}
                  title={item.label}
                >
                  <span>{item.emoji}</span>
                  <span className="text-[9px] font-medium text-zinc-500 mt-0.5">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F3C969] via-[#E5B85C] to-[#D6A84F] text-[#0A0A0C] text-xs font-bold shadow-[0_4px_16px_rgba(229,184,92,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Değişiklikleri Kaydet
            </button>
          </div>
        </form>

        {/* Custom Modern Date Picker Modal */}
        <GoalDatePicker
          isOpen={isDatePickerOpen}
          onClose={() => setIsDatePickerOpen(false)}
          selectedDate={targetDate}
          onSelectDate={(dateFormatted) => {
            setTargetDate(dateFormatted);
          }}
        />
      </div>
    </div>
  );
};
