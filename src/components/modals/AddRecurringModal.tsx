import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Repeat, ArrowDownLeft, ArrowUpRight, Calendar, Landmark, Layers } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/formatters';

interface AddRecurringModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'income' | 'expense';
}

export const AddRecurringModal: React.FC<AddRecurringModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'expense',
}) => {
  const { addRecurring, accounts, categories, currencyCode, currencySymbol } = usePortfolio();

  const [type, setType] = useState<'income' | 'expense'>(defaultType);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'acc-ziraat');

  const availableCategories = categories.filter((c) => c.type === type);
  const [categoryId, setCategoryId] = useState(availableCategories[0]?.id || '');

  // Taksit alanları
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentTotal, setInstallmentTotal] = useState<number>(6);
  const [installmentRemaining, setInstallmentRemaining] = useState<number>(6);

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setType(defaultType);
      setName('');
      setAmount('');
      setDayOfMonth(1);
      setAccountId(accounts[0]?.id || 'acc-ziraat');
      const cats = categories.filter((c) => c.type === defaultType);
      setCategoryId(cats[0]?.id || '');
      setIsInstallment(false);
      setInstallmentTotal(6);
      setInstallmentRemaining(6);
      setStartDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, defaultType, categories, accounts]);

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    const cats = categories.filter((c) => c.type === newType);
    setCategoryId(cats[0]?.id || '');
    if (newType === 'income') setIsInstallment(false);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseCurrencyInput(amount, currencyCode);
    if (!name.trim() || isNaN(num) || num <= 0) return;

    addRecurring({
      type,
      name: name.trim(),
      categoryId: categoryId || (type === 'income' ? 'cat-salary' : 'cat-bills'),
      amount: num,
      frequency: 'monthly',
      dayOfMonth: Math.min(31, Math.max(1, dayOfMonth)),
      accountId,
      startDate,
      installmentTotal: isInstallment ? installmentTotal : undefined,
      installmentRemaining: isInstallment ? installmentRemaining : undefined,
      active: true,
    });

    onClose();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg rounded-[2.25rem] bg-[#121218] border border-white/10 p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(229,184,92,0.12)] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 ${
          type === 'income' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
        }`} />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E5B85C]/10 border border-[#E5B85C]/20 flex items-center justify-center text-[#F5C042] shadow-inner">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white tracking-tight">
                {type === 'income' ? 'Sabit Gelir Ekle' : 'Sabit Gider / Taksit Ekle'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Her ay düzenli gerçekleşmesi beklenen ödemeleri otomatik planlayın
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

        {/* Type Toggle Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] my-5">
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
            <span>Sabit Gelir (Maaş vb.)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Sabit Gider (Kira/Fatura)</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Adı */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              İşlem Başlığı
            </label>
            <input
              type="text"
              required
              placeholder={type === 'income' ? 'Örn: Şirket Maaşı' : 'Örn: Ev Kirası, Telefon Faturası'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          {/* Kategori & Tutar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Kategori
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#181822] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-all cursor-pointer"
              >
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Aylık Tutar ({currencySymbol})
              </label>
              <input
                type="text"
                required
                placeholder="Örn: 35.000"
                value={amount}
                onChange={(e) => setAmount(formatCurrencyInput(e.target.value, currencyCode))}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm font-semibold text-white focus:outline-none transition-all placeholder:text-zinc-600 tabular-nums"
              />
            </div>
          </div>

          {/* Gün & Hesap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                Ödeme Günü (Ayın Kaçı?)
              </label>
              <input
                type="number"
                min={1}
                max={31}
                required
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-zinc-400" />
                İlgili Hesap
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#181822] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-all cursor-pointer"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Taksit Seçeneği (Sadece Giderde) */}
          {type === 'expense' && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div
                className="flex items-center gap-3 cursor-pointer select-none"
                onClick={() => setIsInstallment(!isInstallment)}
              >
                <input
                  type="checkbox"
                  id="installment-checkbox"
                  checked={isInstallment}
                  onChange={(e) => setIsInstallment(e.target.checked)}
                  className="w-4 h-4 rounded text-[#E5B85C] bg-white/10 border-white/20 focus:ring-[#E5B85C] focus:ring-offset-0 cursor-pointer"
                />
                <label htmlFor="installment-checkbox" className="text-xs font-bold text-zinc-300 cursor-pointer flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#E5B85C]" />
                  Bu bir Taksitli Ödeme (Kredi Kartı / Kredi)
                </label>
              </div>

              {isInstallment && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Toplam Taksit Sayısı</label>
                    <input
                      type="number"
                      min={2}
                      max={120}
                      value={installmentTotal}
                      onChange={(e) => setInstallmentTotal(parseInt(e.target.value) || 2)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Kalan Taksit Sayısı</label>
                    <input
                      type="number"
                      min={1}
                      max={installmentTotal}
                      value={installmentRemaining}
                      onChange={(e) => setInstallmentRemaining(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl border border-white/10 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all cursor-pointer"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#F5D07A] via-[#E5B85C] to-[#C2933C] text-[#0A0A0C] text-xs font-extrabold shadow-[0_10px_25px_rgba(229,184,92,0.3)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
            >
              Sabit İşlemi Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
