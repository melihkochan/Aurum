import React, { useState } from 'react';
import { 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowRightLeft, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  Landmark,
  Calendar,
  PieChart,
  Wallet
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { ASSET_DEFINITIONS } from '../../services/market/types';
import type { Transaction } from '../../services/portfolio/types';
import { ASSET_IMAGES } from '../ui/AssetIcon';
import { TransactionDetailModal } from '../modals/TransactionDetailModal';

export const TransactionsView: React.FC = () => {
  const { transactions, accounts, formatMoney, todaySummary, expenseDistribution } = usePortfolio();
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell' | 'income' | 'expense' | 'transfer' | 'withdraw'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [selectedTxForDetail, setSelectedTxForDetail] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter((tx: Transaction) => {
    const def = tx.assetKey ? ASSET_DEFINITIONS[tx.assetKey] : null;
    const account = accounts.find((a) => a.id === tx.accountId || a.id === tx.targetAccountId);

    if (filterType === 'buy') {
      if (tx.type !== 'buy') return false;
    } else if (filterType === 'sell') {
      if (tx.type !== 'sell') return false;
    } else if (filterType === 'income') {
      if (tx.type !== 'income') return false;
    } else if (filterType === 'expense') {
      if (tx.type !== 'expense') return false;
    } else if (filterType === 'transfer') {
      if (tx.type !== 'transfer') return false;
    } else if (filterType === 'withdraw') {
      const isWithdraw = tx.type === 'expense' && (
        tx.category?.toLowerCase().includes('çek') ||
        tx.title?.toLowerCase().includes('çek') ||
        tx.category?.toLowerCase().includes('nakit')
      );
      if (!isWithdraw) return false;
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        (def?.nameTr && def.nameTr.toLowerCase().includes(q)) ||
        (tx.title && tx.title.toLowerCase().includes(q)) ||
        (tx.category && tx.category.toLowerCase().includes(q)) ||
        (tx.note && tx.note.toLowerCase().includes(q)) ||
        (account && account.name.toLowerCase().includes(q)) ||
        (tx.transactionDate && tx.transactionDate.toLowerCase().includes(q)) ||
        tx.date.toLowerCase().includes(q) ||
        tx.totalValue.toString().includes(q)
      );
    }
    return true;
  });

  const displayedTransactions = showAll ? filteredTransactions : filteredTransactions.slice(0, 10);

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
    <div className="space-y-8 pb-20 md:pb-12 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          İşlem Geçmişi
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Geçmiş alım-satım, nakit akışı ve birikim hareketlerinizin ayrıntılı dökümü
        </p>
      </div>

      {/* 1. DAILY SUMMARY & EXPENSE DISTRIBUTION (2-COLUMN CARDS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* BUGÜNKÜ ÖZET */}
        <div className="lg:col-span-5 rounded-[2rem] bg-white/[0.025] border border-white/[0.06] p-6 backdrop-blur-xl shadow-lg flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E5B85C]/10 border border-[#E5B85C]/20 flex items-center justify-center text-[#F5C042]">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Bugünkü Özet
              </span>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-zinc-400">
              {todaySummary.count} işlem
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 py-1">
            <div className="p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20">
              <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1 mb-1">
                <ArrowDownLeft className="w-3 h-3" /> Gelir
              </div>
              <div className="font-display text-xs sm:text-sm font-black text-emerald-400 tabular-nums truncate">
                +{formatMoney(todaySummary.income)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-500/[0.06] border border-rose-500/20">
              <div className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1 mb-1">
                <ArrowUpRight className="w-3 h-3" /> Gider
              </div>
              <div className="font-display text-xs sm:text-sm font-black text-rose-400 tabular-nums truncate">
                -{formatMoney(todaySummary.expense)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
              <div className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1 mb-1">
                <Wallet className="w-3 h-3 text-[#E5B85C]" /> Net
              </div>
              <div className={`font-display text-xs sm:text-sm font-black tabular-nums truncate ${
                todaySummary.net >= 0 ? 'text-[#F5C042]' : 'text-rose-400'
              }`}>
                {todaySummary.net >= 0 ? '+' : ''}{formatMoney(todaySummary.net)}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500">
            Bugün kaydedilen tüm nakit hareketleri anlık olarak özetlenir.
          </p>
        </div>

        {/* HARCAMA DAĞILIMI */}
        <div className="lg:col-span-7 rounded-[2rem] bg-white/[0.025] border border-white/[0.06] p-6 backdrop-blur-xl shadow-lg flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <PieChart className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Harcama Dağılımı
              </span>
            </div>
            <span className="text-[11px] text-zinc-400">Kategori Bazlı Gider Dağılımı</span>
          </div>

          {expenseDistribution.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-500">
              Bu ay için henüz gider kaydı bulunmuyor.
            </div>
          ) : (
            <div className="space-y-2.5">
              {expenseDistribution.slice(0, 3).map((cat) => (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-medium truncate max-w-[140px] sm:max-w-[200px]">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-400 font-mono text-[11px]">{formatMoney(cat.amount)}</span>
                      <span className="font-bold text-white tabular-nums">%{cat.percentage}</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(cat.percentage, 100)}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 text-[11px] text-zinc-500 border-t border-white/[0.04]">
            <span>En yüksek harcama: <strong className="text-zinc-300 font-medium">{expenseDistribution[0]?.category || 'Yok'}</strong></span>
            <span>%{expenseDistribution[0]?.percentage || 0} pay</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-80 shrink-0">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="İşlem, varlık veya kategori ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] focus:border-[#E5B85C]/50 text-sm text-white focus:outline-none transition-colors placeholder:text-zinc-500"
          />
        </div>

        {/* Filter Pills Container - Spaciously & Symmetrically Padded */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto aurum-scrollbar bg-white/[0.03] border border-white/[0.06] p-2 rounded-2xl">
          {(
            [
              { key: 'all', label: 'Tümü' },
              { key: 'buy', label: 'Alış' },
              { key: 'sell', label: 'Satış' },
              { key: 'income', label: 'Gelir' },
              { key: 'expense', label: 'Gider' },
              { key: 'transfer', label: 'Transfer' },
              { key: 'withdraw', label: 'Para Çekme' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setFilterType(item.key);
                setShowAll(false);
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                filterType === item.key
                  ? 'bg-[#E5B85C]/20 text-[#F5C042] border border-[#E5B85C]/35 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions List Card */}
      <div className="rounded-[1.75rem] bg-white/[0.025] border border-white/[0.05] p-6 sm:p-8 shadow-xl backdrop-blur-xl">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-xs text-zinc-400">
            Kriterlere uygun işlem bulunamadı.
          </div>
        ) : (
          <div>
            <div className={showAll ? "divide-y divide-white/[0.04] max-h-[580px] aurum-modern-scrollbar pr-3 overflow-x-hidden" : "divide-y divide-white/[0.04]"}>
              {displayedTransactions.map((tx: Transaction) => {
                const def = tx.assetKey ? ASSET_DEFINITIONS[tx.assetKey] : null;
                const isIncome = tx.type === 'income';
                const isExpense = tx.type === 'expense';
                const isBuy = tx.type === 'buy';
                const isTransfer = tx.type === 'transfer';

                const account = accounts.find((a) => a.id === tx.accountId);
                const targetAccount = accounts.find((a) => a.id === tx.targetAccountId);

                const title = tx.title || (def ? def.nameTr : isTransfer ? 'Para Transferi' : isIncome ? 'Gelir' : 'Gider');
                const badgeLabel = isIncome ? 'GELİR' : isExpense ? 'GİDER' : isTransfer ? 'TRANSFER' : isBuy ? 'ALIŞ' : 'SATIŞ';
                const badgeColor = isIncome || isBuy 
                  ? 'bg-emerald-500/15 text-emerald-400' 
                  : isExpense 
                  ? 'bg-rose-500/15 text-rose-400' 
                  : isTransfer 
                  ? 'bg-sky-500/15 text-sky-400' 
                  : 'bg-amber-500/15 text-[#F5C042]';

                const displayDate = tx.transactionDate || tx.date;

                return (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTxForDetail(tx)}
                    className="py-4 first:pt-0 last:pb-0 px-3 rounded-2xl hover:bg-white/[0.025] transition-all flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {renderIcon(tx)}
                      <div className="min-w-0">
                        <div className="text-sm sm:text-base font-bold text-white group-hover:text-[#F5C042] transition-colors flex items-center gap-2 truncate">
                          <span className="truncate">{title}</span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${badgeColor}`}
                          >
                            {badgeLabel}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          <span>{displayDate}</span>
                          {tx.transactionTime && (
                            <span className="text-zinc-500">{tx.transactionTime}</span>
                          )}

                          {/* ÖDEME / HESAP BİLGİSİ - GİDER İÇİN BELİRGİN ROZET */}
                          {isExpense && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-zinc-300 font-medium">
                              <Landmark className="w-3 h-3 text-[#E5B85C]" />
                              <span>Ödeme: <strong className="text-white font-semibold">{account ? account.name : 'Nakit / Banka'}</strong></span>
                            </span>
                          )}

                          {/* GELİR İÇİN HESAP ROZETİ */}
                          {isIncome && account && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-zinc-300 font-medium">
                              <Landmark className="w-3 h-3 text-emerald-400" />
                              <span>Hesap: <strong className="text-white font-semibold">{account.name}</strong></span>
                            </span>
                          )}

                          {/* TRANSFER İÇİN HESAPLAR */}
                          {isTransfer && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-zinc-300 font-medium">
                              <ArrowRightLeft className="w-3 h-3 text-sky-400" />
                              <span>{account?.name || 'Kaynak'} → {targetAccount?.name || 'Hedef'}</span>
                            </span>
                          )}

                          {/* ALIŞ İÇİN ÖDEME HESABI */}
                          {isBuy && account && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-zinc-300 font-medium">
                              <Landmark className="w-3 h-3 text-[#E5B85C]" />
                              <span>Ödeme: <strong className="text-white font-semibold">{account.name}</strong></span>
                            </span>
                          )}

                          {tx.quantity && def && (
                            <span className="text-zinc-300 font-medium">• {tx.quantity} {def.unitNameTr}</span>
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
                      <div className={`text-base sm:text-lg font-black tabular-nums ${
                        isIncome ? 'text-emerald-400' : isExpense ? 'text-rose-400' : isTransfer ? 'text-sky-400' : 'text-white'
                      }`}>
                        {isIncome ? '+' : isExpense ? '-' : ''}{formatMoney(tx.totalValue)}
                      </div>
                      <div className="text-xs text-zinc-400 mt-0.5 tabular-nums font-mono">
                        {tx.unitPrice != null ? (
                          `İşlem kuru: ${formatMoney(tx.unitPrice, true)}`
                        ) : isExpense && account ? (
                          `${tx.category || 'Gider'} • ${account.name}`
                        ) : (
                          tx.category || (isTransfer ? 'Hesap Transferi' : 'Nakit Hareket')
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination / Show All Toggle */}
            {filteredTransactions.length > 10 && (
              <div className="pt-6 mt-4 border-t border-white/[0.05] flex items-center justify-between text-xs text-zinc-400">
                <span>
                  {showAll 
                    ? `Toplam ${filteredTransactions.length} işlemin tümü listeleniyor` 
                    : `Toplam ${filteredTransactions.length} işlemden ilk 10 tanesi gösteriliyor`}
                </span>
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#F3C969] hover:text-white border border-[#E5B85C]/20 hover:border-[#E5B85C]/50 font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  {showAll ? (
                    <>
                      <span>İlk 10'a Daralt</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Tümünü Göster ({filteredTransactions.length})</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={!!selectedTxForDetail}
        onClose={() => setSelectedTxForDetail(null)}
        transaction={selectedTxForDetail}
      />
    </div>
  );
};
