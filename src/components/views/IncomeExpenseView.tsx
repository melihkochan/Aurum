import React, { useState } from 'react';
import { 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowRightLeft, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight,
  Landmark
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { CashflowSummaryCards } from '../incomeExpense/CashflowSummaryCards';
import { CategoryBreakdownCard } from '../incomeExpense/CategoryBreakdownCard';
import { MonthlyFlowChart } from '../incomeExpense/MonthlyFlowChart';
import { RecurringSection } from '../incomeExpense/RecurringSection';
import { AccountsList } from '../incomeExpense/AccountsList';
import { AddIncomeModal } from '../modals/AddIncomeModal';
import { AddExpenseModal } from '../modals/AddExpenseModal';
import { TransferModal } from '../modals/TransferModal';
import { AddAccountModal } from '../modals/AddAccountModal';
import { AddRecurringModal } from '../modals/AddRecurringModal';
import { TransactionDetailModal } from '../modals/TransactionDetailModal';
import type { Transaction } from '../../services/portfolio/types';

interface IncomeExpenseViewProps {
  onNavigateToTransactions?: () => void;
}

export const IncomeExpenseView: React.FC<IncomeExpenseViewProps> = ({ onNavigateToTransactions }) => {
  const { transactions, accounts, formatMoney } = usePortfolio();

  // Modal states
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [recurringType, setRecurringType] = useState<'income' | 'expense'>('expense');
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<Transaction | null>(null);

  // Transactions list filter & pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // Gelir, Gider ve Transfer işlemleri
  const cashflowTransactions = transactions.filter((tx) => {
    if (tx.type !== 'income' && tx.type !== 'expense' && tx.type !== 'transfer') {
      return false;
    }

    if (filterType !== 'all' && tx.type !== filterType) {
      return false;
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const titleMatch = (tx.title || tx.name || '').toLowerCase().includes(q);
      const catMatch = (tx.category || '').toLowerCase().includes(q);
      const noteMatch = (tx.note || '').toLowerCase().includes(q);
      const dateMatch = (tx.transactionDate || tx.date || '').toLowerCase().includes(q);
      const account = accounts.find((a) => a.id === tx.accountId || a.id === tx.targetAccountId);
      const accountMatch = account ? account.name.toLowerCase().includes(q) : false;

      return titleMatch || catMatch || noteMatch || dateMatch || accountMatch;
    }

    return true;
  });

  // Reset page when filter or search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const totalPages = Math.max(1, Math.ceil(cashflowTransactions.length / ITEMS_PER_PAGE));
  const displayedTransactions = cashflowTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleOpenAddRecurring = (type: 'income' | 'expense') => {
    setRecurringType(type);
    setIsRecurringModalOpen(true);
  };

  return (
    <div className="space-y-10 lg:space-y-12 pb-24 md:pb-16 animate-fade-in">
      {/* 1. PAGE HEADER */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
            Gelir & Gider
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Para girişlerini, harcamalarını ve düzenli ödemelerini tek yerden takip et.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsIncomeModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Gelir Ekle</span>
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Gider Ekle</span>
          </button>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4 text-sky-400" />
            <span>Transfer</span>
          </button>
        </div>
      </section>

      {/* 2. CASHFLOW SUMMARY CARDS */}
      <section>
        <CashflowSummaryCards />
      </section>

      {/* 3. CATEGORY BREAKDOWN & MONTHLY TREND (2-COLUMN BALANCED) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
        <div className="lg:col-span-6 flex flex-col">
          <CategoryBreakdownCard onSelectTransaction={(tx) => setSelectedTxForDetail(tx)} />
        </div>
        <div className="lg:col-span-6 flex flex-col">
          <MonthlyFlowChart />
        </div>
      </section>

      {/* 4. RECURRING SECTION */}
      <section>
        <RecurringSection onOpenAddRecurring={handleOpenAddRecurring} />
      </section>

      {/* 5. ACCOUNTS LIST */}
      <section>
        <AccountsList 
          onOpenAddAccount={() => setIsAccountModalOpen(true)} 
          onSelectTransaction={(tx) => setSelectedTxForDetail(tx)}
        />
      </section>

      {/* 6. RECENT FINANCIAL ACTIVITY (FIRST 10 + EXPANDABLE) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E5B85C]">
              SON NAKİT AKIŞI İŞLEMLERİ
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Tüm gelir, harcama ve hesap transferleriniz
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="İşlem veya hesap ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white placeholder:text-zinc-500 focus:outline-none"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              {(
                [
                  { key: 'all', label: 'Tümü' },
                  { key: 'income', label: 'Gelir' },
                  { key: 'expense', label: 'Gider' },
                  { key: 'transfer', label: 'Transfer' },
                ] as const
              ).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterType(f.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterType === f.key
                      ? 'bg-[#E5B85C]/20 text-[#F5C042] border border-[#E5B85C]/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Card List */}
        <div className="rounded-[2rem] bg-white/[0.025] border border-white/[0.06] p-4 sm:p-6 backdrop-blur-2xl shadow-xl">
          {displayedTransactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              Kriterlere uygun işlem bulunamadı.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {displayedTransactions.map((tx) => {
                const isInc = tx.type === 'income';
                const isExp = tx.type === 'expense';
                const isTrans = tx.type === 'transfer';
                const account = accounts.find((a) => a.id === tx.accountId);
                const targetAcc = accounts.find((a) => a.id === tx.targetAccountId);

                const title = tx.title || tx.name || (isTrans ? 'Para Transferi' : isInc ? 'Gelir' : 'Gider');
                const badgeLabel = isInc ? 'GELİR' : isExp ? 'GİDER' : 'TRANSFER';
                const badgeColor = isInc 
                  ? 'bg-emerald-500/15 text-emerald-400' 
                  : isExp 
                  ? 'bg-rose-500/15 text-rose-400' 
                  : 'bg-sky-500/15 text-sky-400';

                return (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTxForDetail(tx)}
                    className="py-3.5 first:pt-0 last:pb-0 px-3 -mx-3 rounded-2xl hover:bg-white/[0.025] transition-all flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                        isInc 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : isExp 
                          ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' 
                          : 'bg-sky-500/10 border border-sky-500/20 text-sky-400'
                      }`}>
                        {isTrans ? (
                          <ArrowRightLeft className="w-5 h-5" />
                        ) : isInc ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm sm:text-base font-bold text-white group-hover:text-[#F5C042] transition-colors flex items-center gap-2 truncate">
                          <span className="truncate">{title}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${badgeColor}`}>
                            {badgeLabel}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <span>{tx.transactionDate || tx.date}</span>
                          {tx.transactionTime && (
                            <span className="text-zinc-500">{tx.transactionTime}</span>
                          )}

                          {/* Ödeme / Hesap Bilgisi */}
                          {isExp && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-zinc-300 font-medium">
                              <Landmark className="w-3 h-3 text-[#E5B85C]" />
                              <span>Ödeme: <strong className="text-white font-semibold">{account ? account.name : 'Nakit / Banka'}</strong></span>
                            </span>
                          )}

                          {isInc && account && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-zinc-300 font-medium">
                              <Landmark className="w-3 h-3 text-emerald-400" />
                              <span>Hesap: <strong className="text-white font-semibold">{account.name}</strong></span>
                            </span>
                          )}

                          {isTrans && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-zinc-300 font-medium">
                              <ArrowRightLeft className="w-3 h-3 text-sky-400" />
                              <span>{account?.name || 'Kaynak'} → {targetAcc?.name || 'Hedef'}</span>
                            </span>
                          )}

                          {tx.category && (
                            <span className="text-zinc-400">• {tx.category}</span>
                          )}
                          {tx.note && (
                            <span className="text-zinc-500 italic max-w-[200px] truncate">• "{tx.note}"</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className={`text-base sm:text-lg font-black tabular-nums font-display ${
                        isInc ? 'text-emerald-400' : isExp ? 'text-rose-400' : 'text-sky-400'
                      }`}>
                        {isInc ? '+' : isExp ? '-' : ''}{formatMoney(tx.totalValue)}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5 tabular-nums">
                        {isExp && account ? `${tx.category || 'Gider'} • ${account.name}` : tx.category || (isTrans ? 'Hesap Transferi' : 'Nakit İşlem')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination & Navigation Footer */}
          <div className="pt-4 mt-3 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span>Toplam <strong>{cashflowTransactions.length}</strong> nakit işlemi</span>
              {totalPages > 1 && (
                <>
                  <span>•</span>
                  <span>Sayfa <strong>{currentPage}</strong> / {totalPages}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onNavigateToTransactions && (
                <button
                  onClick={onNavigateToTransactions}
                  className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] text-[#F3C969] border border-[#E5B85C]/20 hover:border-[#E5B85C]/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 mr-1"
                >
                  <span>Tüm İşlem Geçmişi</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer"
                    title="Önceki Sayfa"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] text-xs font-mono font-bold text-white">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer"
                    title="Sonraki Sayfa"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MODALS */}
      <AddIncomeModal 
        isOpen={isIncomeModalOpen} 
        onClose={() => setIsIncomeModalOpen(false)} 
      />
      <AddExpenseModal 
        isOpen={isExpenseModalOpen} 
        onClose={() => setIsExpenseModalOpen(false)} 
      />
      <TransferModal 
        isOpen={isTransferModalOpen} 
        onClose={() => setIsTransferModalOpen(false)} 
      />
      <AddAccountModal 
        isOpen={isAccountModalOpen} 
        onClose={() => setIsAccountModalOpen(false)} 
      />
      <AddRecurringModal 
        isOpen={isRecurringModalOpen} 
        onClose={() => setIsRecurringModalOpen(false)} 
        defaultType={recurringType}
      />
      <TransactionDetailModal 
        isOpen={!!selectedTxForDetail} 
        onClose={() => setSelectedTxForDetail(null)} 
        transaction={selectedTxForDetail}
      />
    </div>
  );
};
