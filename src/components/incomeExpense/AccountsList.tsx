import React, { useState } from 'react';
import { 
  Building2, 
  Banknote, 
  Plus, 
  Landmark, 
  ArrowRight 
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { AccountDetailModal } from '../modals/AccountDetailModal';
import type { Account, Transaction } from '../../services/portfolio/types';

interface AccountsListProps {
  onOpenAddAccount: () => void;
  onSelectTransaction?: (tx: Transaction) => void;
}

export const AccountsList: React.FC<AccountsListProps> = ({ 
  onOpenAddAccount,
  onSelectTransaction = () => {},
}) => {
  const { accounts, totalLiquidWealth, formatMoney } = usePortfolio();
  const [selectedAccount, setSelectedAccount] = useState<(Account & { currentBalance: number; monthlyIn: number; monthlyOut: number }) | null>(null);

  return (
    <div className="rounded-[2rem] bg-white/[0.025] border border-white/[0.06] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_15px_45px_-15px_rgba(0,0,0,0.7)] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-[#E5B85C]/10 border border-[#E5B85C]/20 flex items-center justify-center text-[#F5C042]">
              <Landmark className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E5B85C]">
              HESAPLARIM & LİKİT BAKİYELER
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Toplam Likit Varlık: <span className="font-bold text-white tabular-nums">{formatMoney(totalLiquidWealth)}</span>
          </p>
        </div>

        <button
          onClick={onOpenAddAccount}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-white transition-all shadow-sm active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Yeni Hesap Ekle</span>
        </button>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const isCash = acc.type === 'cash';
          const Icon = isCash ? Banknote : Building2;

          return (
            <div
              key={acc.id}
              onClick={() => setSelectedAccount(acc)}
              className="group p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#E5B85C]/40 hover:bg-white/[0.035] transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
                    style={{ backgroundColor: `${acc.color || '#E5B85C'}15`, color: acc.color || '#E5B85C' }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-[#F5C042] transition-colors leading-tight">
                      {acc.name}
                    </h4>
                    <span className="text-[11px] text-zinc-400 capitalize">
                      {isCash ? 'Nakit Para' : acc.bankName || 'Banka'}
                    </span>
                  </div>
                </div>

                <div className="w-6 h-6 rounded-lg bg-white/[0.03] flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:translate-x-0.5 transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider mb-0.5">
                  GÜNCEL BAKİYE
                </div>
                <div className="font-display text-xl sm:text-2xl font-black text-white tabular-nums">
                  {formatMoney(acc.currentBalance)}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-zinc-400">
                <span>Bu Ay Net</span>
                <span className={`font-bold tabular-nums ${
                  acc.monthlyIn - acc.monthlyOut >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {acc.monthlyIn - acc.monthlyOut >= 0 ? '+' : ''}
                  {formatMoney(acc.monthlyIn - acc.monthlyOut)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Account Detail Modal */}
      <AccountDetailModal
        isOpen={!!selectedAccount}
        onClose={() => setSelectedAccount(null)}
        account={selectedAccount}
        onSelectTransaction={onSelectTransaction}
      />
    </div>
  );
};
