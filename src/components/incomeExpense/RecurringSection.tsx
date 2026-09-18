import React, { useState } from 'react';
import { 
  Plus, 
  Repeat, 
  Calendar, 
  Landmark, 
  Layers, 
  Power, 
  Trash2, 
  ArrowDownLeft, 
  ArrowUpRight 
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import type { RecurringTransaction } from '../../services/portfolio/types';

interface RecurringSectionProps {
  onOpenAddRecurring: (type: 'income' | 'expense') => void;
}

export const RecurringSection: React.FC<RecurringSectionProps> = ({ onOpenAddRecurring }) => {
  const { recurringTransactions, toggleRecurring, deleteRecurring, accounts, formatMoney } = usePortfolio();
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');

  const filtered = recurringTransactions.filter((r) => r.type === activeTab);

  return (
    <div className="rounded-[2rem] bg-white/[0.025] border border-white/[0.06] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_15px_45px_-15px_rgba(0,0,0,0.7)] space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-[#E5B85C]/10 border border-[#E5B85C]/20 flex items-center justify-center text-[#F5C042]">
              <Repeat className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E5B85C]">
              DÜZENLİ GELİR & GİDERLER
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Aylık tekrar eden maaş, kira, fatura ve taksit ödemeleriniz
          </p>
        </div>

        {/* Tab Selector & Add Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <button
              onClick={() => setActiveTab('expense')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'expense'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sabit Giderler
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sabit Gelirler
            </button>
          </div>

          <button
            onClick={() => onOpenAddRecurring(activeTab)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#E5B85C] hover:bg-[#F5C042] text-[#0A0A0C] text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Ekle</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-xs text-zinc-500 rounded-2xl border border-dashed border-white/[0.06]">
          Henüz kayıtlı sabit {activeTab === 'income' ? 'gelir' : 'gider'} bulunmuyor.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item: RecurringTransaction) => {
            const account = accounts.find((a) => a.id === item.accountId);
            const isIncome = item.type === 'income';

            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  item.active
                    ? 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                    : 'bg-white/[0.01] border-white/[0.03] opacity-60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white leading-tight">
                          {item.name}
                        </h4>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-[#E5B85C]" />
                          <span>Her ayın {item.dayOfMonth}'i</span>
                          {item.nextOccurrence && (
                            <span className="text-zinc-500">• Sonraki: <strong className="text-zinc-300 font-medium">{item.nextOccurrence}</strong></span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={`font-display text-base font-black tabular-nums ${
                      isIncome ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {isIncome ? '+' : '-'}{formatMoney(item.amount)}
                    </div>
                  </div>

                  {/* Badges: Account & Installments */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    {account && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-zinc-200 font-medium">
                        <Landmark className="w-3 h-3 text-[#E5B85C]" />
                        {account.name}
                      </span>
                    )}

                    {item.installmentTotal ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[#F5C042] font-semibold">
                        <Layers className="w-3 h-3" />
                        {item.installmentCurrent ? `${item.installmentCurrent} / ${item.installmentTotal} Taksit` : `${item.installmentRemaining} / ${item.installmentTotal} Taksit Kaldı`}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/[0.05]">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    item.active ? 'text-emerald-400' : 'text-zinc-500'
                  }`}>
                    {item.active ? 'Aktif' : 'Devre Dışı'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleRecurring(item.id)}
                      className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                        item.active 
                          ? 'border-white/10 text-zinc-400 hover:text-white hover:bg-white/[0.05]' 
                          : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                      title={item.active ? 'Devre Dışı Bırak' : 'Aktifleştir'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => deleteRecurring(item.id)}
                      className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Sabit İşlemi Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
