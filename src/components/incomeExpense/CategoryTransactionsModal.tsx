import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Tags, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import type { CategoryBreakdownItem } from '../../services/portfolio/financeEngine';
import type { Transaction } from '../../services/portfolio/types';

interface CategoryTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryBreakdownItem | null;
  onSelectTransaction: (tx: Transaction) => void;
}

export const CategoryTransactionsModal: React.FC<CategoryTransactionsModalProps> = ({
  isOpen,
  onClose,
  category,
  onSelectTransaction,
}) => {
  const { transactions, formatMoney, accounts } = usePortfolio();

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

  if (!isOpen || !category) return null;

  // Bu kategoriye ait işlemler
  const filtered = transactions.filter((tx) => {
    if (tx.type !== category.type) return false;
    const catName = category.name.toLowerCase();
    const txCat = (tx.category || '').toLowerCase();
    const txCatId = tx.categoryId || '';
    return txCat === catName || txCatId === category.id || txCatId === category.name;
  });

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
        <div 
          className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20 opacity-20"
          style={{ backgroundColor: category.color }}
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              <Tags className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white tracking-tight">
                {category.name} Detayları
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {category.type === 'expense' ? 'Gider' : 'Gelir'} kategorisine ait işlemler ({filtered.length} işlem)
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

        {/* Summary Card */}
        <div className="my-5 p-5 rounded-2xl bg-white/[0.025] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block">
              TOPLAM TUTAR
            </span>
            <span className="font-display text-2xl font-black text-white tabular-nums">
              {formatMoney(category.amount)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block">
              PAYI
            </span>
            <span 
              className="font-display text-lg font-bold tabular-nums"
              style={{ color: category.color }}
            >
              %{category.percentage.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-2 max-h-72 overflow-y-auto aurum-scrollbar pr-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              Bu kategoriye ait işlem bulunamadı.
            </div>
          ) : (
            filtered.map((tx) => {
              const account = accounts.find((a) => a.id === tx.accountId);
              return (
                <div
                  key={tx.id}
                  onClick={() => {
                    onClose();
                    onSelectTransaction(tx);
                  }}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      category.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {category.type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {tx.title || tx.name || category.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <span>{tx.transactionDate || tx.date}</span>
                        {account && <span>• {account.name}</span>}
                      </div>
                    </div>
                  </div>

                  <div className={`font-display text-xs font-bold tabular-nums ${
                    category.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {category.type === 'income' ? '+' : '-'}{formatMoney(tx.totalValue)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
