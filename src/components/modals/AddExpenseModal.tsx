import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowUpRight, Calendar, Clock, Landmark, Repeat } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/formatters';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose }) => {
  const { addExpense, addRecurring, accounts, categories, currencyCode, currencySymbol } = usePortfolio();

  const expenseCategories = categories.filter((c) => c.type === 'expense');

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id || 'cat-grocery');
  const [accountId, setAccountId] = useState(accounts[0]?.id || 'acc-ziraat');

  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [note, setNote] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

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
      setTitle('');
      setAmount('');
      setCategoryId(expenseCategories[0]?.id || 'cat-grocery');
      setAccountId(accounts[0]?.id || 'acc-ziraat');
      const cur = new Date();
      setDate(cur.toISOString().split('T')[0]);
      setTime(`${String(cur.getHours()).padStart(2, '0')}:${String(cur.getMinutes()).padStart(2, '0')}`);
      setNote('');
      setIsRecurring(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseCurrencyInput(amount, currencyCode);
    if (!title.trim() || isNaN(num) || num <= 0) return;

    const selectedCat = categories.find((c) => c.id === categoryId);
    const catName = selectedCat ? selectedCat.name : 'Diğer Gider';

    const d = new Date(date);
    const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    const formattedDate = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;

    // 1. Gerçekleşmiş gider işlemi ekle (seçilen hesaptan para düşer)
    addExpense(num, catName, title.trim(), formattedDate, note.trim() || undefined, accountId, 'completed');

    // 2. Eğer kullanıcı sabit gider olarak işaretlediyse recurring kaydı da aç
    if (isRecurring) {
      addRecurring({
        type: 'expense',
        name: title.trim(),
        categoryId,
        amount: num,
        frequency: 'monthly',
        dayOfMonth: d.getDate(),
        accountId,
        startDate: date,
        active: true,
      });
    }

    onClose();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg rounded-[2.25rem] bg-[#121218] border border-white/10 p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(239,68,68,0.12)] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 bg-rose-500/10" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-inner">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white tracking-tight">
                Gider Ekle
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Yaptığınız harcamayı kaydedin ve seçilen hesaptan düşün
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4.5 mt-6">
          {/* Gider Adı */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Gider Adı
            </label>
            <input
              type="text"
              required
              placeholder="Örn: Telefon Faturası, Market Alışverişi..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-rose-500/60 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-600"
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
                className="w-full px-4 py-3 rounded-xl bg-[#181822] border border-white/[0.08] focus:border-rose-500/60 text-sm text-white focus:outline-none transition-all cursor-pointer"
              >
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Tutar ({currencySymbol})
              </label>
              <input
                type="text"
                required
                placeholder="Örn: 750"
                value={amount}
                onChange={(e) => setAmount(formatCurrencyInput(e.target.value, currencyCode))}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-rose-500/60 text-sm font-semibold text-white focus:outline-none transition-all placeholder:text-zinc-600 tabular-nums"
              />
            </div>
          </div>

          {/* Tarih & Saat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                Tarih
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-rose-500/60 text-sm text-white focus:outline-none transition-all [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                Saat
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-rose-500/60 text-sm text-white focus:outline-none transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Ödeme Kaynağı / Hesabı */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-zinc-400" />
              Ödeme Kaynağı / Hesabı
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#181822] border border-white/[0.08] focus:border-rose-500/60 text-sm text-white focus:outline-none transition-all cursor-pointer"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type === 'bank' ? 'Banka' : 'Nakit'} — Bakiye: ₺{acc.currentBalance.toLocaleString('tr-TR')})
                </option>
              ))}
            </select>
          </div>

          {/* Açıklama / Not */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Not (Opsiyonel)
            </label>
            <input
              type="text"
              placeholder="Ek açıklama ekleyin..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-rose-500/60 text-xs text-white focus:outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          {/* Tekrarlama Onayı */}
          <div
            className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-3 cursor-pointer select-none"
            onClick={() => setIsRecurring(!isRecurring)}
          >
            <input
              type="checkbox"
              id="rec-expense-checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded text-rose-500 bg-white/10 border-white/20 focus:ring-rose-500 focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="rec-expense-checkbox" className="text-xs text-zinc-300 font-medium cursor-pointer flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-rose-400" />
              Bu gider düzenli olarak her ay tekrar ediyor (Sabit Gider Olarak Kaydet)
            </label>
          </div>

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
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs font-extrabold shadow-[0_10px_25px_rgba(244,63,94,0.3)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
            >
              Gideri Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
