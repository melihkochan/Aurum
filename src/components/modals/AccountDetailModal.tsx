import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Building2, 
  Banknote, 
  CreditCard, 
  ArrowDownLeft, 
  ArrowUpRight, 
  TrendingUp,
  ArrowRightLeft
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import type { Account, Transaction } from '../../services/portfolio/types';

interface AccountDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: (Account & { currentBalance: number; monthlyIn: number; monthlyOut: number }) | null;
  onSelectTransaction?: (tx: Transaction) => void;
}

export const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  isOpen,
  onClose,
  account,
  onSelectTransaction,
}) => {
  const { transactions, formatMoney } = usePortfolio();

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

  if (!isOpen || !account) return null;

  // Hesaba ait işlemler (completed olanlar veya ilgili işlemler)
  const accountTransactions = transactions.filter(
    (tx) => tx.accountId === account.id || tx.targetAccountId === account.id
  );

  const netMonthly = account.monthlyIn - account.monthlyOut;

  const IconComponent = account.type === 'cash' ? Banknote : account.type === 'bank' ? Building2 : CreditCard;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl rounded-[2.25rem] bg-[#121218] border border-white/10 p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(229,184,92,0.12)] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div 
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 opacity-20"
          style={{ backgroundColor: account.color || '#E5B85C' }}
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner"
              style={{ backgroundColor: `${account.color || '#E5B85C'}20`, color: account.color || '#E5B85C' }}
            >
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-black text-white tracking-tight">
                {account.name}
              </h2>
              <span className="text-xs text-zinc-400 capitalize">
                {account.type === 'bank' ? (account.bankName || 'Banka Hesabı') : account.type === 'cash' ? 'Fiziksel Nakit' : 'Finansal Hesap'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Hero Card */}
        <div className="my-6 p-6 rounded-2xl bg-white/[0.025] border border-white/[0.06] space-y-2 text-center">
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
            Mevcut Hesap Bakiyesi
          </span>
          <div className="font-display text-3xl sm:text-4xl font-black text-white tabular-nums">
            {formatMoney(account.currentBalance, true)}
          </div>
          <div className="text-[11px] text-zinc-500">
            Başlangıç Bakiyesi: ₺{account.initialBalance.toLocaleString('tr-TR')}
          </div>
        </div>

        {/* This Month's Flow in this Account */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/15">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 mb-1">
              <ArrowDownLeft className="w-3 h-3" />
              <span>GELEN</span>
            </div>
            <div className="font-display text-sm sm:text-base font-black text-white tabular-nums">
              +{formatMoney(account.monthlyIn)}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-500/[0.04] border border-rose-500/15">
            <div className="flex items-center gap-1 text-[11px] font-bold text-rose-400 mb-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>GİDEN</span>
            </div>
            <div className="font-display text-sm sm:text-base font-black text-white tabular-nums">
              -{formatMoney(account.monthlyOut)}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#E5B85C]/[0.04] border border-[#E5B85C]/15">
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#F3C969] mb-1">
              <TrendingUp className="w-3 h-3" />
              <span>NET FARK</span>
            </div>
            <div className={`font-display text-sm sm:text-base font-black tabular-nums ${
              netMonthly >= 0 ? 'text-[#F5C042]' : 'text-rose-400'
            }`}>
              {netMonthly >= 0 ? '+' : ''}{formatMoney(netMonthly)}
            </div>
          </div>
        </div>

        {/* Transactions in this Account */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Bu Hesaba Ait Son İşlemler ({accountTransactions.length})
            </h4>
          </div>

          {accountTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 bg-white/[0.01] rounded-2xl border border-dashed border-white/[0.06]">
              Bu hesaba ait henüz işlem kaydı bulunmuyor.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto aurum-scrollbar space-y-2 pr-1">
              {accountTransactions.map((tx) => {
                const isIncoming = tx.type === 'income' || (tx.type === 'transfer' && tx.targetAccountId === account.id) || (tx.type === 'sell' && tx.targetAccountId === account.id);
                const isOut = tx.type === 'expense' || (tx.type === 'transfer' && tx.accountId === account.id) || (tx.type === 'buy' && tx.accountId === account.id);

                return (
                  <div
                    key={tx.id}
                    onClick={() => onSelectTransaction?.(tx)}
                    className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                        isIncoming ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {tx.type === 'transfer' ? (
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                        ) : isIncoming ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">
                          {tx.title || tx.name || (tx.type === 'transfer' ? 'Para Transferi' : 'İşlem')}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {tx.transactionDate || tx.date}
                        </div>
                      </div>
                    </div>

                    <div className={`font-display text-xs font-bold tabular-nums ${
                      isIncoming ? 'text-emerald-400' : isOut ? 'text-rose-400' : 'text-zinc-200'
                    }`}>
                      {isIncoming ? '+' : isOut ? '-' : ''}{formatMoney(tx.totalValue)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
