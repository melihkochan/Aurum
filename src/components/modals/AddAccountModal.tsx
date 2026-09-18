import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Landmark, Banknote, Building, CreditCard, ShieldCheck } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import type { AccountType } from '../../services/portfolio/types';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/formatters';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_BANKS = [
  'Ziraat Bankası',
  'Garanti BBVA',
  'İş Bankası',
  'Yapı Kredi',
  'Akbank',
  'QNB Finansbank',
  'Enpara.com',
  'VakıfBank',
  'Halkbank',
  'TEB',
  'DenizBank',
  'Papara',
];

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose }) => {
  const { addAccount, currencyCode, currencySymbol } = usePortfolio();

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [balance, setBalance] = useState('');
  const [bankName, setBankName] = useState('Ziraat Bankası');

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
      setName('');
      setType('bank');
      setBalance('');
      setBankName('Ziraat Bankası');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const initialBalance = balance ? parseCurrencyInput(balance, currencyCode) : 0;
    const finalName = name.trim() || (type === 'bank' ? bankName : 'Nakit Hesabım');

    addAccount({
      name: finalName,
      type,
      bankName: type === 'bank' ? bankName : undefined,
      initialBalance: isNaN(initialBalance) ? 0 : initialBalance,
      currency: 'TRY',
      icon: type === 'cash' ? 'Banknote' : 'Building2',
      color: type === 'cash' ? '#10B981' : '#E5B85C',
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
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 bg-[#E5B85C]/10" />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E5B85C]/10 border border-[#E5B85C]/20 flex items-center justify-center text-[#F5C042] shadow-inner">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white tracking-tight">
                Yeni Finansal Hesap Ekle
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Banka, nakit cüzdan veya diğer likit varlık kaynaklarınızı tanımlayın
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
          {/* Hesap Türü Seçimi */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Hesap Türü
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('bank')}
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  type === 'bank'
                    ? 'bg-[#E5B85C]/15 border-[#E5B85C]/40 text-[#F5C042] shadow-[0_0_15px_rgba(229,184,92,0.2)]'
                    : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white'
                }`}
              >
                <Building className="w-4 h-4" />
                <span>Banka</span>
              </button>

              <button
                type="button"
                onClick={() => setType('cash')}
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  type === 'cash'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Nakit</span>
              </button>

              <button
                type="button"
                onClick={() => setType('other')}
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  type === 'other'
                    ? 'bg-purple-500/15 border-purple-500/40 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Diğer</span>
              </button>
            </div>
          </div>

          {/* Banka Seçimi (Eğer banka ise) */}
          {type === 'bank' && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Banka Adı
              </label>
              <select
                value={bankName}
                onChange={(e) => {
                  setBankName(e.target.value);
                  if (!name) setName(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl bg-[#181822] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-all cursor-pointer"
              >
                {COMMON_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Hesap Görünen Adı */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Hesap Başlığı / Etiket
            </label>
            <input
              type="text"
              required
              placeholder={type === 'bank' ? 'Örn: Ziraat Maaş Hesabı' : 'Örn: Evdeki Nakit Zarfı'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-600"
            />
          </div>

          {/* Başlangıç Bakiyesi */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
              Başlangıç Bakiyesi ({currencySymbol})
            </label>
            <input
              type="text"
              placeholder="0,00"
              value={balance}
              onChange={(e) => setBalance(formatCurrencyInput(e.target.value, currencyCode))}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm font-semibold text-white focus:outline-none transition-all placeholder:text-zinc-600 tabular-nums"
            />
            <p className="text-[11px] text-zinc-500 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#E5B85C]" />
              Bu bakiye AURUM toplam net varlık hesabınıza otomatik eklenecektir.
            </p>
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
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#F5D07A] via-[#E5B85C] to-[#C2933C] text-[#0A0A0C] text-xs font-extrabold shadow-[0_10px_25px_rgba(229,184,92,0.3)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
            >
              Hesabı Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
