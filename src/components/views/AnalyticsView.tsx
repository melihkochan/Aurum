import React, { useState } from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  Coins, 
  Zap, 
  Layers,
  Landmark,
  Wallet,
  CheckCircle2
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { ASSET_DEFINITIONS } from '../../services/market/types';
import { ASSET_IMAGES } from '../ui/AssetIcon';

export const AnalyticsView: React.FC = () => {
  const {
    ownedAssets,
    totalNetWorth,
    accounts,
    monthlyIncome,
    monthlyExpense,
    monthlyNetSavings,
    formatMoney,
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<'overview' | 'pnl' | 'liquidity'>('overview');

  // 1. Kategorik Varlık Dağılımı
  const goldAllocations = ownedAssets.filter((a) => a.category === 'gold');
  const currencyAllocations = ownedAssets.filter((a) => a.category === 'currency');

  const totalGoldVal = goldAllocations.reduce((acc, a) => acc + a.currentValue, 0);
  const totalCurrVal = currencyAllocations.reduce((acc, a) => acc + a.currentValue, 0);

  // Toplam gram altın karşılığı (saf altın eşdeğeri)
  const totalGoldGrams = goldAllocations.reduce((sum, a) => {
    if (a.key === 'gramGold') return sum + a.quantity;
    if (a.key === 'quarterGold') return sum + a.quantity * 1.605;
    if (a.key === 'halfGold') return sum + a.quantity * 3.21;
    if (a.key === 'fullGold') return sum + a.quantity * 6.42;
    return sum + a.quantity;
  }, 0);

  // Banka ve Likit hesaplar
  const bankAccounts = accounts.filter((a) => a.type !== 'cash');
  const totalBankVal = bankAccounts.reduce((acc, a) => acc + (a.currentBalance || 0), 0);
  const cashAccounts = accounts.filter((a) => a.type === 'cash');
  const totalCashVal = cashAccounts.reduce((acc, a) => acc + (a.currentBalance || 0), 0);
  const totalLiquid = totalBankVal + totalCashVal;

  // Yüzdeler (Net Servete Göre)
  const goldPercent = totalNetWorth > 0 ? (totalGoldVal / totalNetWorth) * 100 : 0;
  const currPercent = totalNetWorth > 0 ? (totalCurrVal / totalNetWorth) * 100 : 0;
  const bankPercent = totalNetWorth > 0 ? (totalBankVal / totalNetWorth) * 100 : 0;
  const cashPercent = totalNetWorth > 0 ? (totalCashVal / totalNetWorth) * 100 : 0;
  const liquidPercent = totalNetWorth > 0 ? (totalLiquid / totalNetWorth) * 100 : 0;

  // 2. Kâr / Zarar Metrikleri
  const totalCostBasis = ownedAssets.reduce((sum, a) => sum + (a.totalCost || 0), 0);
  const totalUnrealizedProfit = ownedAssets.reduce((sum, a) => sum + (a.totalProfitLoss || 0), 0);
  const totalProfitPercent = totalCostBasis > 0 ? (totalUnrealizedProfit / totalCostBasis) * 100 : 0;

  const sortedByProfit = [...ownedAssets].sort((a, b) => b.totalProfitLoss - a.totalProfitLoss);
  const topPerformer = sortedByProfit.length > 0 ? sortedByProfit[0] : null;

  // 3. Nakit Akışı ve Acil Durum Pisti
  const savingsRate = monthlyIncome > 0
    ? Math.max(0, Math.round((monthlyNetSavings / monthlyIncome) * 100))
    : 0;

  // Kaç aylık harcamayı nakit karşılar (Financial Runway)
  const runwayMonths = monthlyExpense > 0 
    ? Number((totalLiquid / monthlyExpense).toFixed(1)) 
    : 12;

  // 4. Finansal Sağlık Skoru (100 Üzerinden Dinamik Algoritma)
  const healthScore = React.useMemo(() => {
    let score = 50;
    score += Math.min(20, Math.round(savingsRate * 0.4));
    if (runwayMonths >= 6) score += 15;
    else if (runwayMonths >= 3) score += 10;
    else score += 5;
    if (goldPercent > 30 && totalLiquid > 0) score += 15;
    return Math.min(98, Math.max(40, score));
  }, [savingsRate, runwayMonths, goldPercent, totalLiquid]);

  return (
    <div className="space-y-10 pb-24 md:pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
            Finansal Zeka & Portföy Analitiği
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            {activeTab === 'overview' && 'Portföy sağlık skoru, servet katmanları ve stratejik öngörüler'}
            {activeTab === 'pnl' && 'Varlık bazında kârlılık, alış maliyeti ve getiri performans dökümü'}
            {activeTab === 'liquidity' && 'Acil durum pisti, nakit rezervleri ve likidite güvenlik kalkanı'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] self-start sm:self-auto">
          {(
            [
              { key: 'overview', label: 'Genel Bakış' },
              { key: 'pnl', label: 'Kâr / Zarar Analizi' },
              { key: 'liquidity', label: 'Likidite & Güvenlik' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#E5B85C]/20 text-[#F5C042] border border-[#E5B85C]/35 shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: GENEL BAKIŞ */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-10 animate-fade-in">
          {/* EXECUTIVE SCORECARD HERO */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Main Health Score Card (7 Cols) */}
            <div className="lg:col-span-7 rounded-[2.25rem] bg-gradient-to-br from-[#161622] via-[#101018] to-[#0A0A0E] border border-[#E5B85C]/30 p-7 sm:p-9 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(229,184,92,0.1)] backdrop-blur-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#E5B85C]/10 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24" />

              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E5B85C]">
                      PORTFÖY SAĞLIK & GÜÇ SKORU
                    </span>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-extrabold border border-emerald-500/25">
                    Mükemmel Seviye
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-end gap-6 my-6">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl sm:text-6xl font-black text-white tracking-tight">
                      {healthScore}
                    </span>
                    <span className="text-2xl font-bold text-zinc-500">/100</span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Enflasyon & Kur Dalgalanmalarına Karşı Güçlü Kalkan</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Net servetinizin %{goldPercent.toFixed(0)}'lik kısmı fiziksel altın ve ziynet rezervinde korunmaktadır.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Micro Indicators */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/[0.08]">
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Tasarruf Oranı</span>
                  <span className="text-base sm:text-lg font-black text-emerald-400 tabular-nums font-display">%{savingsRate}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Acil Durum Pisti</span>
                  <span className="text-base sm:text-lg font-black text-sky-400 tabular-nums font-display">{runwayMonths} Ay</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Net Kârlılık</span>
                  <span className={`text-base sm:text-lg font-black tabular-nums font-display ${totalUnrealizedProfit >= 0 ? 'text-[#F5C042]' : 'text-rose-400'}`}>
                    {totalProfitPercent >= 0 ? '+' : ''}%{totalProfitPercent.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Wealth Tier Breakdown Card (5 Cols) */}
            <div className="lg:col-span-5 rounded-[2.25rem] bg-[#121218] border border-white/[0.08] p-7 sm:p-9 shadow-xl backdrop-blur-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#E5B85C] flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    SERVET KATMANLARI
                  </span>
                  <span className="text-xs text-zinc-400 font-mono font-bold">{formatMoney(totalNetWorth)}</span>
                </div>

                <div className="space-y-4">
                  {/* Altın */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-zinc-300 font-semibold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F5C042]" />
                        Altın & Ziynet Rezervi
                      </span>
                      <span className="font-bold text-white tabular-nums">{formatMoney(totalGoldVal)} (%{goldPercent.toFixed(1)})</span>
                    </div>
                    <div className="w-full bg-white/[0.05] h-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#F5D07A] to-[#E5B85C] rounded-full transition-all duration-700" style={{ width: `${goldPercent}%` }} />
                    </div>
                  </div>

                  {/* Banka Hesapları */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-zinc-300 font-semibold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        Banka Mevduatları
                      </span>
                      <span className="font-bold text-white tabular-nums">{formatMoney(totalBankVal)} (%{bankPercent.toFixed(1)})</span>
                    </div>
                    <div className="w-full bg-white/[0.05] h-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${bankPercent}%` }} />
                    </div>
                  </div>

                  {/* Döviz */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-zinc-300 font-semibold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                        Döviz Rezervi (USD & EUR)
                      </span>
                      <span className="font-bold text-white tabular-nums">{formatMoney(totalCurrVal)} (%{currPercent.toFixed(1)})</span>
                    </div>
                    <div className="w-full bg-white/[0.05] h-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400 rounded-full transition-all duration-700" style={{ width: `${currPercent}%` }} />
                    </div>
                  </div>

                  {/* Nakit */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-zinc-300 font-semibold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                        Fiziksel Nakit TL
                      </span>
                      <span className="font-bold text-white tabular-nums">{formatMoney(totalCashVal)} (%{cashPercent.toFixed(1)})</span>
                    </div>
                    <div className="w-full bg-white/[0.05] h-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full transition-all duration-700" style={{ width: `${cashPercent}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
                <span>Dağılım Durumu</span>
                <span className="text-emerald-400 font-semibold">Tüm Varlıklar 100% Güvencede</span>
              </div>
            </div>
          </div>

          {/* STRATEGIC WEALTH INSIGHTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Likidite Güvencesi</h4>
                  <span className="text-[11px] text-emerald-400 font-medium">{runwayMonths} Aylık Tam Koruma</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Bankalarınızda ve cüzdanınızda bulunan <strong>{formatMoney(totalLiquid)}</strong> likit bakiye, acil bir durumda {runwayMonths} ay boyunca harcamalarınızı karşılayabilir.
              </p>
            </div>

            <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E5B85C]/10 border border-[#E5B85C]/20 flex items-center justify-center text-[#F5C042]">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Altın Odaklı Büyüme</h4>
                  <span className="text-[11px] text-[#F3C969] font-medium">Portföyün %{goldPercent.toFixed(0)}'i Altında</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Toplam <strong>{totalGoldGrams.toLocaleString('tr-TR')} Gram</strong> saf altın eşdeğerinizle portföyünüz yerel kur ve enflasyon şoklarına karşı maksimum direnç sağlamaktadır.
              </p>
            </div>

            <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Tasarruf Hızı</h4>
                  <span className="text-[11px] text-sky-400 font-medium">Aylık Net: +{formatMoney(monthlyNetSavings)}</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Aylık gelirinizin %{savingsRate}'i tasarruf ve yatırıma ayrılıyor. Bu hızla yıllık net birikim potansiyeliniz <strong>{formatMoney(monthlyNetSavings * 12)}</strong> seviyesindedir.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: KÂR / ZARAR ANALİZİ */}
      {/* ========================================================================= */}
      {activeTab === 'pnl' && (
        <div className="space-y-8 animate-fade-in">
          {/* P&L 4 KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-white/[0.025] border border-white/[0.06] backdrop-blur-xl">
              <span className="text-xs text-zinc-400 font-medium block">Toplam Yatırım Maliyeti</span>
              <span className="text-xl sm:text-2xl font-black text-white font-display tabular-nums mt-1 block">
                {formatMoney(totalCostBasis)}
              </span>
              <span className="text-[11px] text-zinc-500 mt-1 block">Gerçekleşen alış harcaması</span>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.025] border border-white/[0.06] backdrop-blur-xl">
              <span className="text-xs text-zinc-400 font-medium block">Güncel Piyasa Değeri</span>
              <span className="text-xl sm:text-2xl font-black text-white font-display tabular-nums mt-1 block">
                {formatMoney(ownedAssets.reduce((s, a) => s + a.currentValue, 0))}
              </span>
              <span className="text-[11px] text-[#F3C969] mt-1 block">Canlı piyasa kurları ile</span>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.025] border border-white/[0.06] backdrop-blur-xl">
              <span className="text-xs text-zinc-400 font-medium block">Net Gerçekleşmemiş Kâr</span>
              <span className={`text-xl sm:text-2xl font-black font-display tabular-nums mt-1 block ${
                totalUnrealizedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {totalUnrealizedProfit >= 0 ? '+' : ''}{formatMoney(totalUnrealizedProfit)}
              </span>
              <span className={`text-[11px] font-bold mt-1 block ${
                totalProfitPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {totalProfitPercent >= 0 ? '+' : ''}%{totalProfitPercent.toFixed(1)} Getiri
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.025] border border-white/[0.06] backdrop-blur-xl">
              <span className="text-xs text-zinc-400 font-medium block">En Yüksek Getirili Varlık</span>
              {topPerformer ? (
                <>
                  <span className="text-lg font-black text-[#F5C042] font-display mt-1 block truncate">
                    {topPerformer.name}
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold mt-1 block">
                    +%{topPerformer.profitLossPercent.toFixed(1)} (+{formatMoney(topPerformer.totalProfitLoss)})
                  </span>
                </>
              ) : (
                <span className="text-sm text-zinc-500 mt-2 block">-</span>
              )}
            </div>
          </div>

          {/* FULL P&L PERFORMANCE LEADERBOARD TABLE */}
          <div className="rounded-[2.25rem] bg-white/[0.025] border border-white/[0.06] p-6 sm:p-8 shadow-xl backdrop-blur-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#E5B85C] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  VARLIK BAZINDA KÂR / ZARAR DÖKÜM TABLOSU
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Her bir varlığın alış ortalaması, canlı piyasa fiyatı ve getiri farkı
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-400">Net Sonuç:</span>
                <span className={`text-sm font-black tabular-nums ${totalUnrealizedProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {totalUnrealizedProfit >= 0 ? '+' : ''}{formatMoney(totalUnrealizedProfit)} (%{totalProfitPercent.toFixed(1)})
                </span>
              </div>
            </div>

            {ownedAssets.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                Kayıtlı varlık bulunamadı.
              </div>
            ) : (
              <div className="overflow-x-auto aurum-scrollbar">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.05] text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                      <th className="pb-3.5 pl-3">Varlık</th>
                      <th className="pb-3.5">Miktar</th>
                      <th className="pb-3.5">Ort. Alış Maliyeti</th>
                      <th className="pb-3.5">Güncel Piyasa Değeri</th>
                      <th className="pb-3.5">Net Kâr / Zarar</th>
                      <th className="pb-3.5 pr-3 text-right">Getiri Oranı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {ownedAssets.map((asset) => {
                      const def = ASSET_DEFINITIONS[asset.key];
                      const isProfitable = asset.totalProfitLoss >= 0;
                      const displayImage = asset.customImageUrl || ASSET_IMAGES[asset.key] || '/gramaltin.png';

                      return (
                        <tr key={asset.key} className="hover:bg-white/[0.035] transition-all group">
                          <td className="py-4 pl-3 rounded-l-2xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 flex items-center justify-center shrink-0">
                                <img
                                  src={displayImage}
                                  alt={asset.name}
                                  className="w-full h-full object-contain filter drop-shadow"
                                />
                              </div>
                              <div>
                                <div className="font-bold text-white text-sm group-hover:text-[#F3C969] transition-colors">
                                  {asset.name}
                                </div>
                                <div className="text-[11px] text-zinc-400 capitalize">
                                  {def?.category === 'gold' ? 'Kıymetli Maden' : def?.category === 'currency' ? 'Yabancı Para' : 'Nakit'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 font-semibold text-white tabular-nums">
                            {asset.quantity.toLocaleString('tr-TR')} {def?.unitNameTr || 'Adet'}
                          </td>
                          <td className="py-4 text-zinc-400 tabular-nums">
                            {formatMoney(asset.totalCost)}
                            <span className="block text-[10px] text-zinc-500 font-mono">
                              Birim: {formatMoney(asset.avgPurchasePrice, true)}
                            </span>
                          </td>
                          <td className="py-4 font-black text-white tabular-nums">
                            {formatMoney(asset.currentValue)}
                            <span className="block text-[10px] text-[#E5B85C] font-mono">
                              Birim: {formatMoney(asset.unitPrice, true)}
                            </span>
                          </td>
                          <td className="py-4 font-bold tabular-nums">
                            <span className={isProfitable ? 'text-emerald-400' : 'text-rose-400'}>
                              {isProfitable ? '+' : ''}{formatMoney(asset.totalProfitLoss)}
                            </span>
                          </td>
                          <td className="py-4 pr-3 text-right rounded-r-2xl">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-black tabular-nums border ${
                              isProfitable 
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' 
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}>
                              {isProfitable ? '+' : ''}%{asset.profitLossPercent.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LİKİDİTE & GÜVENLİK */}
      {/* ========================================================================= */}
      {activeTab === 'liquidity' && (
        <div className="space-y-8 animate-fade-in">
          {/* LIQUIDITY 3 KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-white/[0.025] border border-white/[0.06] backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-xs text-zinc-400 font-medium">Acil Durum Pisti (Runway)</span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-white font-display tabular-nums block">
                {runwayMonths} Ay
              </span>
              <span className="text-[11px] text-emerald-400 mt-1 block">
                Aylık {formatMoney(monthlyExpense || 1)} harcamayı nakitle karşılama kapasitesi
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.025] border border-white/[0.06] backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="text-xs text-zinc-400 font-medium">Toplam Likit Rezerv</span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-display tabular-nums block">
                {formatMoney(totalLiquid)}
              </span>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Banka mevduatları + Nakit cüzdan
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.025] border border-white/[0.06] backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#E5B85C]/10 border border-[#E5B85C]/20 flex items-center justify-center text-[#F5C042]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs text-zinc-400 font-medium">Likit / Net Servet Payı</span>
              </div>
              <span className="text-2xl sm:text-3xl font-black text-[#F5C042] font-display tabular-nums block">
                %{liquidPercent.toFixed(1)}
              </span>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Portföyün %{(100 - liquidPercent).toFixed(1)}'i emtia/dövizde bağlı
              </span>
            </div>
          </div>

          {/* BANK ACCOUNTS & LIQUID CASH BREAKDOWN */}
          <div className="rounded-[2.25rem] bg-white/[0.025] border border-white/[0.06] p-6 sm:p-8 shadow-xl backdrop-blur-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#E5B85C] flex items-center gap-2">
                  <Landmark className="w-4 h-4" />
                  BANKA & NAKİT HESAPLARI GÜVENLİK DAĞILIMI
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Likit bakiyelerin hesaplara ve kurumlara göre dağılımı
                </p>
              </div>
              <span className="text-xs text-zinc-400">{accounts.length} Aktif Likit Hesap</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((acc) => {
                const isCash = acc.type === 'cash';
                const shareOfLiquid = totalLiquid > 0 ? ((acc.currentBalance || 0) / totalLiquid) * 100 : 0;

                return (
                  <div 
                    key={acc.id}
                    className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isCash ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'
                        }`}>
                          {isCash ? <Wallet className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{acc.name}</h4>
                          <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                            {isCash ? 'Fiziksel Nakit' : 'Banka Hesabı'}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.05] text-zinc-300 font-mono font-bold">
                        %{shareOfLiquid.toFixed(0)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                      <span className="text-xs text-zinc-400">Mevcut Bakiye:</span>
                      <span className="text-base font-black text-white tabular-nums font-display">
                        {formatMoney(acc.currentBalance || 0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* FINANCIAL DEFENSE ADVICE */}
          <div className="p-7 rounded-[2.25rem] bg-gradient-to-br from-[#121620] to-[#0A0D14] border border-sky-500/25 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-sky-400" />
                <h4 className="text-base font-bold text-white">Acil Durum Fonu Değerlendirmesi</h4>
              </div>
              <p className="text-xs text-zinc-300 max-w-2xl leading-relaxed">
                Finansal standartlara göre ideal acil durum rezervi 3 ila 6 aylık sabit giderdir. 
                Sizin mevcut likidite rezerviniz <strong>{runwayMonths} Aylık</strong> koruma sunmaktadır. 
                {runwayMonths >= 6 
                  ? ' Bu oran mükemmeldir; ek tasarruflarınızı fiziki altın veya döviz yatırımlarına yönlendirebilirsiniz.' 
                  : ' Likit rezervinizi 3-6 aylık seviyeye çıkarmak güvenlik marjınızı artıracaktır.'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] shrink-0 text-center">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Tavsiye Edilen Rezerv</span>
              <span className="text-lg font-black text-sky-400 font-display tabular-nums">
                {formatMoney((monthlyExpense || 10000) * 6)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
