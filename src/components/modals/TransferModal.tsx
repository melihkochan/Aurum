import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRightLeft, Calendar, Clock, Landmark } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/formatters';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose }) => {
  const { transferFunds, accounts, currencyCode, currencySymbol } = usePortfolio();

  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || 'acc-ziraat');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || 'acc-cash');
  const [amount, setAmount] = useState('');

  const now = new Date();
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState(defaultTime);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

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
      if (accounts.length > 0) {
        setFromAccountId(accounts[0].id);
        const second = accounts.find((a) => a.id !== accounts[0].id);
        setToAccountId(second ? second.id : accounts[0].id);
      }
      setAmount('');
      const cur = new Date();
      setDate(cur.toISOString().split('T')[0]);
      setTime(`${String(cur.getHours()).padStart(2, '0')}:${String(cur.getMinutes()).padStart(2, '0')}`);
      setNote('');
      setError(null);
    }
  }, [isOpen, accounts]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fromAccountId === toAccountId) {
      setError('Kaynak hesap ile hedef hesap aynı olamaz.');
      return;
    }

    const num = parseCurrencyInput(amount, currencyCode);
    if (isNaN(num) || num <= 0) {
      setError('Lütfen geçerli bir transfer tutarı girin.');
      return;
    }

    const sourceAccount = accounts.find((a) => a.id === fromAccountId);
    if (sourceAccount && sourceAccount.currentBalance < num) {
      // Bilgilendirme amaçlı izin verilebilir veya uyarı verilebilir, biz uyarı ile devam ettirelim
    }

    const d = new Date(date);
    const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
    const formattedDate = `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;

    transferFunds(fromAccountId, toAccountId, num, formattedDate, time, note.trim() || undefined);
    onClose();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg rounded-[2.25rem] bg-[#121218] border border-white/10 p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(56,189,248,0.12)] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 bg-sky-500/10" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-inner">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white tracking-tight">
                Para Transferi
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Hesaplarınız arasında bakiye aktarın (Toplam servetiniz değişmez)
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

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4.5 mt-6">
          {/* Kaynak & Hedef Hesap Seçimi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-zinc-400" />
                Nereden (Kaynak Hesap)
              </label>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#181822] border border-white/[0.08] focus:border-sky-500/60 text-sm text-white focus:outline-none transition-all cursor-pointer"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (₺{acc.currentBalance.toLocaleString('tr-TR')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-zinc-400" />
                Nereye (Hedef Hesap)
              </label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#181822] border border-white/[0.08] focus:border-sky-500/60 text-sm text-white focus:outline-none transition-all cursor-pointer"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (₺{acc.currentBalance.toLocaleString('tr-TR')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tutar */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Transfer Tutarı ({currencySymbol})
            </label>
            <input
              type="text"
              required
              placeholder="Örn: 5.000"
              value={amount}
              onChange={(e) => setAmount(formatCurrencyInput(e.target.value, currencyCode))}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-sky-500/60 text-sm font-semibold text-white focus:outline-none transition-all placeholder:text-zinc-600 tabular-nums"
            />
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
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-sky-500/60 text-sm text-white focus:outline-none transition-all [color-scheme:dark]"
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
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-sky-500/60 text-sm text-white focus:outline-none transition-all [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Not */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Açıklama (Opsiyonel)
            </label>
            <input
              type="text"
              placeholder="Örn: ATM'den nakit çekim, hesaplar arası virman..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-sky-500/60 text-xs text-white focus:outline-none transition-all placeholder:text-zinc-600"
            />
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
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white text-xs font-extrabold shadow-[0_10px_25px_rgba(56,189,248,0.3)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
            >
              Transferi Gerçekleştir
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
