import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Coins, 
  Eye, 
  Landmark, 
  Building2, 
  Layers
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { ASSET_DEFINITIONS } from '../../services/market/types';
import type { AssetKey } from '../../services/market/types';
import type { AssetAllocationItem } from '../../context/PortfolioContext';
import type { Account } from '../../services/portfolio/types';
import { ASSET_IMAGES } from '../ui/AssetIcon';
import { AssetDetailModal } from '../assets/AssetDetailModal';
import { AccountDetailModal } from '../modals/AccountDetailModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { AnimatedNumber } from '../ui/AnimatedNumber';

interface PortfolioViewProps {
  onOpenAddModal: (assetKey?: string) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ onOpenAddModal }) => {
  const { 
    holdings, 
    ownedAssets, 
    totalNetWorth, 
    accounts, 
    formatMoney, 
    removeAsset, 
    customAssets 
  } = usePortfolio();

  const [selectedAssetKey, setSelectedAssetKey] = useState<string | null>(null);
  const [confirmDeleteAsset, setConfirmDeleteAsset] = useState<{ key: AssetKey; name: string } | null>(null);
  const [selectedAccountForDetail, setSelectedAccountForDetail] = useState<(Account & { currentBalance: number; monthlyIn: number; monthlyOut: number }) | null>(null);

  // Derive the active asset from ownedAssets so any edits stay synced
  const activeDetailAsset = selectedAssetKey 
    ? ownedAssets.find((a) => a.key === selectedAssetKey) || null 
    : null;

  // 1. Emtia & Döviz & Nakit Varlıkları Toplam Değeri
  const totalInvestmentsValue = ownedAssets.reduce((sum, a) => sum + a.currentValue, 0);

  // 2. Banka Hesapları (Nakit cüzdan hariç banka mevduatları)
  const bankAccounts = accounts.filter((a) => a.type !== 'cash');
  const totalBankBalances = bankAccounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);

  // Calculate total physical gold grams equivalent
  const totalGoldGrams = React.useMemo(() => {
    let grams = 0;
    (Object.keys(holdings) as AssetKey[]).forEach((key) => {
      const def = ASSET_DEFINITIONS[key];
      if (def?.category === 'gold' && def.weightGrams) {
        grams += (holdings[key] || 0) * def.weightGrams;
      }
    });
    return Number(grams.toFixed(2));
  }, [holdings]);

  return (
    <div className="space-y-10 pb-20 md:pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Portföy Detayları
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Altın, döviz ve banka hesaplarınızın merkezi servet dökümü ve yönetimi
          </p>
        </div>

        <button
          onClick={() => onOpenAddModal()}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F3C969] via-[#E5B85C] to-[#D6A84F] text-[#0A0A0C] text-xs font-bold shadow-[0_4px_16px_rgba(229,184,92,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Yeni Varlık Ekle</span>
        </button>
      </div>

      {/* Summary Highlights (4-Card Symmetrical Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Toplam Portföy / Net Servet */}
        <div className="p-6 rounded-[1.75rem] bg-gradient-to-br from-white/[0.04] to-white/[0.015] border border-[#E5B85C]/30 shadow-[0_10px_30px_-10px_rgba(229,184,92,0.15)] backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#F3C969]">
                TOPLAM PORTFÖY DEĞERİ
              </span>
              <span className="w-2 h-2 rounded-full bg-[#F5C042] shadow-[0_0_8px_#F5C042]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight tabular-nums mt-1.5">
              <AnimatedNumber
                value={totalNetWorth}
                cacheKey="portfolio_total_net_worth"
                duration={750}
                formatFn={(val) => formatMoney(val)}
                highlightOnChange
              />
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Varlık + Bankalar</span>
            <span className="text-[#E5B85C] font-semibold">%100 Net Servet</span>
          </div>
        </div>

        {/* Card 2: Emtia & Döviz Varlıkları */}
        <div className="p-6 rounded-[1.75rem] bg-white/[0.025] border border-white/[0.06] backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-400">
                ALTIN & DÖVİZ VARLIKLARI
              </span>
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight tabular-nums mt-1.5">
              <AnimatedNumber
                value={totalInvestmentsValue}
                cacheKey="portfolio_investments_value"
                duration={750}
                formatFn={(val) => formatMoney(val)}
                highlightOnChange
              />
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">{ownedAssets.length} Kalem Birikim</span>
            <span className="text-emerald-400 font-semibold">
              %{totalNetWorth > 0 ? ((totalInvestmentsValue / totalNetWorth) * 100).toFixed(1) : 0} Pay
            </span>
          </div>
        </div>

        {/* Card 3: Banka Hesap Bakiyeleri */}
        <div className="p-6 rounded-[1.75rem] bg-white/[0.025] border border-white/[0.06] backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-400 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-[#E5B85C]" />
                BANKA HESAPLARI
              </span>
              <Building2 className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight tabular-nums mt-1.5">
              <AnimatedNumber
                value={totalBankBalances}
                cacheKey="portfolio_bank_balances"
                duration={750}
                formatFn={(val) => formatMoney(val)}
                highlightOnChange
              />
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">{bankAccounts.length} Banka Hesabı</span>
            <span className="text-[#F3C969] font-semibold">
              %{totalNetWorth > 0 ? ((totalBankBalances / totalNetWorth) * 100).toFixed(1) : 0} Pay
            </span>
          </div>
        </div>

        {/* Card 4: Toplam Altın Ağırlığı */}
        <div className="p-6 rounded-[1.75rem] bg-white/[0.025] border border-white/[0.06] backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#E5B85C] flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" />
                TOPLAM ALTIN
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#F3C969] tracking-tight tabular-nums mt-1.5">
              <AnimatedNumber
                value={totalGoldGrams}
                cacheKey="portfolio_gold_grams"
                duration={750}
                decimals={2}
                formatFn={(val) => `${val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Gram`}
                highlightOnChange
              />
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Saf Altın Eşdeğeri</span>
            <span className="text-zinc-300 font-medium">Ziynet & Külçe</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: SAHİP OLUNAN VARLIKLAR TABLOSU */}
      <div className="rounded-[1.75rem] bg-white/[0.025] border border-white/[0.05] p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#E5B85C]">
              SAHİP OLUNAN EMTİA, DÖVİZ & NAKİT REZERVİ
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Fiziksel altınlar, serbest piyasa dövizler ve nakit rezerviniz
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">
              Varlık Toplamı: <strong className="text-white tabular-nums font-mono">{formatMoney(totalInvestmentsValue)}</strong>
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
              %{totalNetWorth > 0 ? ((totalInvestmentsValue / totalNetWorth) * 100).toFixed(1) : 0} Portföy Payı
            </span>
          </div>
        </div>

        {ownedAssets.length === 0 ? (
          <div className="py-16 text-center text-xs text-zinc-400">
            Portföyünüzde henüz kayıtlı bir varlık bulunmamaktadır.
          </div>
        ) : (
          <div className="overflow-x-auto aurum-scrollbar">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.05] text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="pb-4">Varlık</th>
                  <th className="pb-4">Miktar</th>
                  <th className="pb-4">Birim Fiyat</th>
                  <th className="pb-4">Toplam Değer</th>
                  <th className="pb-4">Portföy Payı</th>
                  <th className="pb-4 text-center">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {ownedAssets.map((asset: AssetAllocationItem) => {
                  const def = ASSET_DEFINITIONS[asset.key];
                  const customMeta = customAssets?.[asset.key];
                  const displayName = customMeta?.customName || def?.nameTr || asset.key;
                  const displayDesc = customMeta?.customDescription || def?.descriptionTr || '';
                  const displayImage = customMeta?.customImage || ASSET_IMAGES[asset.key] || '/gramaltin.png';

                  return (
                    <tr 
                      key={asset.key} 
                      className="hover:bg-white/[0.035] transition-all group cursor-pointer"
                      onClick={() => setSelectedAssetKey(asset.key)}
                    >
                      <td className="py-4 pl-4 rounded-l-2xl">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <img
                              src={displayImage}
                              alt={displayName}
                              className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm group-hover:text-[#F3C969] transition-colors flex items-center gap-2">
                              <span>{displayName}</span>
                              {customMeta?.customName && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E5B85C]/15 text-[#F3C969] font-normal">Özel</span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-500 mt-0.5">{displayDesc}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-semibold text-white tabular-nums">
                        {asset.quantity.toLocaleString('tr-TR')} {def?.unitNameTr || 'Adet'}
                      </td>
                      <td className="py-4 text-zinc-400 tabular-nums">
                        {formatMoney(asset.unitPrice, true)}
                      </td>
                      <td className="py-4 font-extrabold text-[#F3C969] tabular-nums">
                        {formatMoney(asset.currentValue)}
                      </td>
                      <td className="py-4 font-semibold text-white tabular-nums">
                        %{asset.percentage.toFixed(1)}
                      </td>
                      <td className="py-4 pr-4 rounded-r-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                          {/* Detay */}
                          <button
                            onClick={() => setSelectedAssetKey(asset.key)}
                            className="px-2.5 py-1.5 text-xs rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 hover:text-white border border-white/[0.08] hover:border-[#E5B85C]/40 font-medium transition-all cursor-pointer flex items-center gap-1"
                            title="Detay ve Alış/Satış Geçmişi"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#E5B85C]" />
                            <span className="hidden sm:inline">Detay</span>
                          </button>

                          {/* Ekle */}
                          <button
                            onClick={() => onOpenAddModal(asset.key)}
                            className="px-2.5 py-1.5 text-xs rounded-xl bg-[#E5B85C]/15 hover:bg-[#E5B85C]/25 text-[#F3C969] font-bold transition-colors cursor-pointer flex items-center gap-1"
                            title="Hızlı Ekle"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Ekle</span>
                          </button>

                          {/* Sil */}
                          <button
                            onClick={() => setConfirmDeleteAsset({ key: asset.key, name: displayName })}
                            className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Varlığı Eksilt veya Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: BANKA HESAPLARI & LİKİT MEVDUATLAR (PORTFÖYÜN BANKA AYAĞI) */}
      <div className="rounded-[1.75rem] bg-white/[0.025] border border-white/[0.05] p-6 sm:p-8 shadow-xl backdrop-blur-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#E5B85C]/10 border border-[#E5B85C]/20 flex items-center justify-center text-[#F5C042]">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#E5B85C]">
                BANKA HESAPLARI & LİKİT MEVDUATLAR
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Bankalarda bulunan vadeli/vadesiz nakit bakiyeleriniz
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">
              Banka Toplamı: <strong className="text-white tabular-nums font-mono">{formatMoney(totalBankBalances)}</strong>
            </span>
            <span className="text-xs px-2.5 py-1 rounded-lg bg-[#E5B85C]/15 text-[#F3C969] font-bold border border-[#E5B85C]/25">
              %{totalNetWorth > 0 ? ((totalBankBalances / totalNetWorth) * 100).toFixed(1) : 0} Portföy Payı
            </span>
          </div>
        </div>

        {/* Bank Accounts Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bankAccounts.map((acc) => {
            const share = totalNetWorth > 0 ? ((acc.currentBalance / totalNetWorth) * 100).toFixed(1) : '0';
            const netMonthly = acc.monthlyIn - acc.monthlyOut;

            return (
              <div
                key={acc.id}
                onClick={() => setSelectedAccountForDetail(acc)}
                className="group p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#E5B85C]/40 hover:bg-white/[0.035] transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: `${acc.color || '#E5B85C'}15`, color: acc.color || '#E5B85C' }}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-[#F5C042] transition-colors leading-tight">
                        {acc.name}
                      </h4>
                      <span className="text-[11px] text-zinc-400">
                        {acc.bankName || 'Banka Mevduatı'}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/[0.04] text-[#E5B85C] border border-white/[0.06]">
                    %{share} Pay
                  </span>
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
                  <span>Bu Ayki Hareket</span>
                  <span className={`font-bold tabular-nums ${
                    netMonthly >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {netMonthly >= 0 ? '+' : ''}{formatMoney(netMonthly)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail & Purchase History Modal for Assets */}
      <AssetDetailModal
        isOpen={activeDetailAsset !== null}
        onClose={() => setSelectedAssetKey(null)}
        asset={activeDetailAsset}
        onAddMore={(key) => onOpenAddModal(key)}
      />

      {/* Account Detail Modal for Banks */}
      <AccountDetailModal
        isOpen={selectedAccountForDetail !== null}
        onClose={() => setSelectedAccountForDetail(null)}
        account={selectedAccountForDetail}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmDeleteAsset !== null}
        onClose={() => setConfirmDeleteAsset(null)}
        onConfirm={() => {
          if (confirmDeleteAsset) {
            removeAsset(confirmDeleteAsset.key, 1);
            setConfirmDeleteAsset(null);
          }
        }}
        title="Varlığı Eksilt / Kaldır"
        message={`"${confirmDeleteAsset?.name}" varlığından 1 adet eksiltmek istediğinize emin misiniz? (Adet 0 olursa portföyden kaldırılır)`}
        confirmText="Evet, Eksilt"
        confirmVariant="danger"
      />
    </div>
  );
};
