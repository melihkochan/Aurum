import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { ASSET_DEFINITIONS } from '../../services/market/types';
import type { Transaction } from '../../services/portfolio/types';
import { Card as HeroUICard } from '@heroui/react';
import { ASSET_IMAGES } from '../ui/AssetIcon';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft, TrendingUp, Landmark, ArrowRight } from 'lucide-react';
import { TransactionDetailModal } from '../modals/TransactionDetailModal';

interface RecentActivityProps {
  onNavigateToTransactions?: () => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ onNavigateToTransactions }) => {
  const { transactions, accounts, formatMoney } = usePortfolio();
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<Transaction | null>(null);

  const renderIcon = (tx: Transaction) => {
    if (tx.assetKey && ASSET_IMAGES[tx.assetKey]) {
      return (
        <div className="w-11 h-11 rounded-2xl p-0.5 bg-white/10 border border-white/15 flex items-center justify-center shadow-md shrink-0">
          <img
            src={ASSET_IMAGES[tx.assetKey]}
            alt={tx.assetKey}
            className="w-full h-full object-contain rounded-xl drop-shadow-md"
          />
        </div>
      );
    }

    if (tx.type === 'transfer') {
      return (
        <div className="w-11 h-11 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-md shrink-0">
          <ArrowRightLeft className="w-5 h-5" />
        </div>
      );
    }

    if (tx.type === 'income') {
      return (
        <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md shrink-0">
          <ArrowDownLeft className="w-5 h-5" />
        </div>
      );
    }

    if (tx.type === 'expense') {
      return (
        <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-md shrink-0">
          <ArrowUpRight className="w-5 h-5" />
        </div>
      );
    }

    return (
      <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-md shrink-0">
        <TrendingUp className="w-5 h-5" />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E5B85C]">
          SON İŞLEM HAREKETLERİ
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 font-medium">{transactions.length} kayıtlı işlem</span>
          {onNavigateToTransactions && (
            <button
              onClick={onNavigateToTransactions}
              className="text-xs font-bold text-[#F3C969] hover:text-[#E5B85C] flex items-center gap-1.5 transition-colors cursor-pointer group"
            >
              <span>Tümünü Göster</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>

      <HeroUICard className="rounded-[2rem] bg-[#101016]/80 border border-white/[0.06] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_15px_45px_-15px_rgba(0,0,0,0.7)]">
        {transactions.length === 0 ? (
          <div className="py-14 text-center text-xs text-zinc-500">
            Henüz kayıtlı bir birikim hareketi bulunmuyor.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {transactions.slice(0, 5).map((tx: Transaction) => {
              const def = tx.assetKey ? ASSET_DEFINITIONS[tx.assetKey] : null;
              const isIncome = tx.type === 'income';
              const isExpense = tx.type === 'expense';
              const isBuy = tx.type === 'buy';
              const isTransfer = tx.type === 'transfer';

              const account = accounts.find((a) => a.id === tx.accountId);
              const targetAccount = accounts.find((a) => a.id === tx.targetAccountId);

              const title = tx.title || (def ? `${isBuy ? '+' : '-'}${tx.quantity} ${def.nameTr}` : isTransfer ? 'Para Transferi' : isIncome ? 'Gelir Girişi' : 'Gider');
              const badgeLabel = isIncome ? 'GELİR' : isExpense ? 'GİDER' : isTransfer ? 'TRANSFER' : isBuy ? 'ALIŞ' : 'SATIŞ';
              const badgeColor = isIncome || isBuy 
                ? 'bg-emerald-500/15 text-emerald-400' 
                : isExpense 
                ? 'bg-rose-500/15 text-rose-400' 
                : isTransfer 
                ? 'bg-sky-500/15 text-sky-400' 
                : 'bg-amber-500/15 text-[#F5C042]';

              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTxForDetail(tx)}
                  className="py-4 first:pt-1 last:pb-1 flex items-center justify-between gap-4 group hover:bg-white/[0.03] px-3 -mx-3 rounded-2xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {renderIcon(tx)}
                    <div className="min-w-0">
                      <div className="text-sm sm:text-base font-bold text-white group-hover:text-[#F5C042] transition-colors flex items-center gap-2 truncate">
                        <span className="truncate">{title}</span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 ${badgeColor}`}>
                          {badgeLabel}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span>{tx.transactionDate || tx.date}</span>
                        {isTransfer && (
                          <span className="text-sky-400 font-medium flex items-center gap-1">
                            • {account?.name || 'Hesap'} → {targetAccount?.name || 'Hedef'}
                          </span>
                        )}
                        {isExpense && account && (
                          <span className="text-zinc-300 flex items-center gap-1">
                            • <Landmark className="w-3 h-3 text-[#E5B85C]" /> Ödeme: {account.name}
                          </span>
                        )}
                        {isIncome && account && (
                          <span className="text-zinc-300 flex items-center gap-1">
                            • <Landmark className="w-3 h-3 text-emerald-400" /> {account.name}
                          </span>
                        )}
                        {tx.category && !isTransfer && (
                          <span className="text-zinc-500">• {tx.category}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className={`font-display text-base sm:text-lg font-black tabular-nums ${
                      isIncome ? 'text-emerald-400' : isExpense ? 'text-rose-400' : isTransfer ? 'text-sky-400' : 'text-white'
                    }`}>
                      {isIncome ? '+' : isExpense ? '-' : ''}{formatMoney(tx.totalValue)}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5 tabular-nums font-mono">
                      {tx.unitPrice != null ? (
                        `Birim: ${formatMoney(tx.unitPrice, true)}`
                      ) : isTransfer ? (
                        'Hesap Transferi'
                      ) : (
                        tx.category || 'Nakit İşlem'
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </HeroUICard>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={!!selectedTxForDetail}
        onClose={() => setSelectedTxForDetail(null)}
        transaction={selectedTxForDetail}
      />
    </div>
  );
};
