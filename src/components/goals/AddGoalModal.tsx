import React, { useState } from 'react';
import { X, Target, Sparkles, Upload, Calendar } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { GoalDatePicker } from './GoalDatePicker';
import type { GoalCategory } from '../../services/portfolio/types';
import { formatCurrencyInput, parseCurrencyInput, getCurrencySymbol } from '../../utils/formatters';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
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

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose }) => {
  const { addGoal, preferences } = usePortfolio();
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

  if (!isOpen) return null;

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

    addGoal({
      title: title.trim(),
      targetAmount: targetNum,
      currentAmount: currentNum,
      targetDate: targetDate || undefined,
      icon,
      imageUrl: imageUrl || undefined,
      category,
    });

    // Reset and close
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setIcon('🚗');
    setCategory('car');
    setImageUrl(null);
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
                Yeni Finansal Hedef Ekle
              </h2>
              <p className="text-xs text-zinc-400">
                Ulaşmak istediğiniz birikim hedefini belirleyin
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-5 relative z-10">
          {/* Photo Upload & Icon Selector Section */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-zinc-300 block">
              Hedef Görseli veya Simgesi
            </label>

            {/* Custom Photo Upload Card */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.025] border border-white/[0.07]">
              {imageUrl ? (
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#E5B85C] shadow-lg shrink-0 group">
                  <img src={imageUrl} alt="Önizleme" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-rose-400 font-extrabold cursor-pointer"
                  >
                    Kaldır
                  </button>
                </div>
              ) : (
                <label className="w-16 h-16 rounded-2xl border-2 border-dashed border-white/20 hover:border-[#E5B85C]/80 bg-white/[0.02] hover:bg-[#E5B85C]/5 flex flex-col items-center justify-center text-zinc-400 hover:text-white cursor-pointer transition-all shrink-0">
                  <Upload className="w-5 h-5 mb-0.5 text-[#E5B85C]" />
                  <span className="text-[10px] font-bold">Resim Yükle</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}

              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white block">
                  {imageUrl ? 'Özel Görsel Yüklendi ✓' : 'Kendi Hedef Fotoğrafını Yükle'}
                </span>
                <span className="text-[11px] text-zinc-400 block mt-0.5 leading-snug">
                  {imageUrl ? 'Fotoğraf başarıyla eklendi. Değiştirmek için kaldırıp yeni yükleyebilirsiniz.' : 'Araba, ev ya da seyahat fotoğrafınızı ekleyin veya aşağıdan hazır simge seçin.'}
                </span>
              </div>
            </div>

            {/* Ready Emoji Badges Grid (6 per row, 2 rows, clean and responsive) */}
            <div>
              <span className="text-[11px] font-medium text-zinc-400 block mb-2">
                Veya Hazır Simge Seçin:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {AVAILABLE_ICONS.map((item) => {
                  const isSelected = icon === item.emoji && !imageUrl;
                  return (
                    <button
                      key={item.emoji}
                      type="button"
                      onClick={() => handleSelectIcon(item.emoji, item.cat)}
                      className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E5B85C]/25 border-2 border-[#E5B85C] scale-105 shadow-[0_0_12px_rgba(229,184,92,0.3)] text-[#F5C042]'
                          : 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <span className="text-[10px] font-semibold truncate w-full text-center">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Goal Title */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              Hedef Adı
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Sıfır Araç Peşinatı, Tokyo Seyahati..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          {/* Target and Initial Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Hedef Tutar ({currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">{currencySymbol}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  placeholder={currencyCode === 'USD' ? '250,000' : '250.000'}
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(formatCurrencyInput(e.target.value, currencyCode))}
                  className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-600 tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Şu Anki Biriken ({currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">{currencySymbol}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={currencyCode === 'USD' ? '50,000 (Opsiyonel)' : '50.000 (Opsiyonel)'}
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(formatCurrencyInput(e.target.value, currencyCode))}
                  className="w-full pl-9 pr-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-600 tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Target Date with Modern Custom Calendar */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
              Hedef Tarih (Opsiyonel)
            </label>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
              className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-[#E5B85C]/50 text-sm text-left text-white flex items-center justify-between transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#E5B85C]" />
                <span className={targetDate ? 'text-white font-semibold' : 'text-zinc-500'}>
                  {targetDate || 'Tarih seçin (örn: 18 Eylül 2027)'}
                </span>
              </div>
              <span className="text-xs font-bold text-[#E5B85C] hover:underline">Takvimi Aç</span>
            </button>

            <GoalDatePicker
              isOpen={isDatePickerOpen}
              onClose={() => setIsDatePickerOpen(false)}
              selectedDate={targetDate}
              onSelectDate={(d) => setTargetDate(d)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-bold text-zinc-300 transition-colors cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="w-1/2 py-3 rounded-xl heroui-gold-btn text-xs font-black tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>HEDEFİ KAYDET</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
