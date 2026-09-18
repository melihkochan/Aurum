import React from 'react';
import { Eye, EyeOff, Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import type { AssetKey } from '../../services/market/types';
import type { PerformancePeriod } from '../../services/portfolio/types';
import { ASSET_IMAGES } from '../ui/AssetIcon';

interface TotalNetWorthProps {
  onOpenAddModal: (assetKey?: AssetKey) => void;
}

export const TotalNetWorth: React.FC<TotalNetWorthProps> = ({ onOpenAddModal }) => {
  const {
    displayNetWorth,
    currencySymbol,
    currencyCode,
    selectedPeriod,
    setSelectedPeriod,
    currentPeriodPerformance,
    isBalanceHidden,
    togglePrivacy,
  } = usePortfolio();


  const isPositive = currentPeriodPerformance.isPositive;
  const locale = currencyCode === 'USD' ? 'en-US' : currencyCode === 'EUR' ? 'de-DE' : 'tr-TR';

  const quickActions: { label: string; shortLabel: string; assetKey: AssetKey; image: string }[] = [
    { label: 'Gram Altın', shortLabel: 'Gram', assetKey: 'gramGold', image: ASSET_IMAGES.gramGold },
    { label: 'Çeyrek Altın', shortLabel: 'Çeyrek', assetKey: 'quarterGold', image: ASSET_IMAGES.quarterGold },
    { label: 'Amerikan Doları', shortLabel: 'Dolar', assetKey: 'usd', image: ASSET_IMAGES.usd },
    { label: 'Euro', shortLabel: 'Euro', assetKey: 'eur', image: ASSET_IMAGES.eur },
    { label: 'Türk Lirası Nakit', shortLabel: 'Nakit TL', assetKey: 'try', image: ASSET_IMAGES.try },
  ];

  const periods: { key: PerformancePeriod; label: string }[] = [
    { key: 'daily', label: 'Günlük' },
    { key: 'weekly', label: 'Haftalık' },
    { key: 'monthly', label: 'Aylık' },
    { key: 'yearly', label: 'Yıllık' },
  ];

  return (
    <div className="relative overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-[#161620]/95 via-[#0F0F14]/98 to-[#09090C] border border-white/[0.08] p-7 sm:p-10 lg:p-12 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(243,180,50,0.12)]">
      {/* Reference 1: Warm Golden Ambient Atmosphere at Top */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-br from-[#F5D07A]/20 via-[#E5B85C]/8 to-transparent rounded-full blur-[130px] pointer-events-none -mr-28 -mt-28 animate-gold-pulse" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-[#9B4F06]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        {/* Left: Net Worth Balance Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#F5C042]">
              TOPLAM NET VARLIK
            </span>
            <button
              onClick={togglePrivacy}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
              title={isBalanceHidden ? 'Bakiyeyi Göster' : 'Bakiyeyi Gizle'}
              aria-label={isBalanceHidden ? 'Bakiyeyi Göster' : 'Bakiyeyi Gizle'}
            >
              {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Huge clean typography with rolling counter animation */}
          <div className="flex items-baseline pt-0.5">
            {isBalanceHidden ? (
              <span className="font-display text-4xl sm:text-6xl text-zinc-500 font-extrabold tracking-wider">{currencySymbol}••••••••</span>
            ) : (
              <AnimatedNumber
                value={displayNetWorth}
                cacheKey="dashboard_total_net_worth"
                duration={750}
                highlightOnChange
                render={({ integerPart, decimalPart, direction }) => (
                  <div className={`flex items-baseline flex-wrap transition-all duration-300 ${
                    direction === 'down' 
                      ? 'text-rose-200 drop-shadow-[0_0_12px_rgba(244,63,94,0.35)]' 
                      : direction === 'up' 
                      ? 'text-emerald-200 drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]' 
                      : 'text-white'
                  }`}>
                    <span className="font-display text-3xl sm:text-5xl font-semibold text-[#F5C042] mr-2">
                      {currencySymbol}
                    </span>
                    <span className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight tabular-nums">
                      {integerPart}
                    </span>
                    <span className="font-display text-2xl sm:text-4xl font-semibold text-zinc-400 ml-1 tabular-nums">
                      {currencyCode === 'USD' ? `.${decimalPart}` : `,${decimalPart}`} <span className="text-xs sm:text-sm text-zinc-500 uppercase tracking-widest font-mono ml-1.5">{currencyCode}</span>
                    </span>
                  </div>
                )}
              />
            )}
          </div>


          {/* Period selector tabs + floating status pill */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Period Selector Tabs */}
            <div className="inline-flex p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              {periods.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setSelectedPeriod(p.key)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    selectedPeriod === p.key
                      ? 'bg-[#E5B85C]/20 text-[#F3C969] shadow-sm font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Performance status badge */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md tabular-nums ${
                isPositive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/25 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>
                {isBalanceHidden
                  ? `${currencySymbol}•••• (${isPositive ? '+' : ''}${currentPeriodPerformance.percent.toFixed(2)}%)`
                  : `${isPositive ? '+' : '-'}${currencySymbol}${Math.abs(currentPeriodPerformance.amount).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${isPositive ? '+' : ''}{currentPeriodPerformance.percent.toFixed(2)}%)`
                }
              </span>
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              {currentPeriodPerformance.periodLabel} portföy getirisi
            </span>
          </div>
        </div>


        {/* Right: Quick Rapid Add Actions using REAL PNG IMAGES + Main CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 shrink-0 pt-2 xl:pt-0">
          {/* Quick Action Circular Buttons with PNG Coin/Bill Icons */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              HIZLI BİRİKİM EKLE
            </span>
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {quickActions.map((qa) => {
                return (
                  <button
                    key={qa.assetKey}
                    onClick={() => onOpenAddModal(qa.assetKey)}
                    className="group flex flex-col items-center gap-1.5 cursor-pointer"
                    title={`${qa.label} Ekle`}
                  >
                    <div className="w-12 h-12 rounded-full p-1 bg-gradient-to-br from-white/15 to-white/5 border border-white/15 hover:border-[#F5C042]/60 shadow-[0_8px_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_20px_rgba(229,184,92,0.35)] group-hover:scale-110 group-active:scale-95 transition-all overflow-hidden flex items-center justify-center">
                      <img
                        src={qa.image}
                        alt={qa.label}
                        className="w-full h-full object-contain rounded-full select-none pointer-events-none drop-shadow-md"
                      />
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold group-hover:text-zinc-100 transition-colors whitespace-nowrap">
                      {qa.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Primary Button */}
          <div className="sm:border-l sm:border-white/[0.08] sm:pl-6 pt-2 sm:pt-0 w-full sm:w-auto">
            <button
              onClick={() => onOpenAddModal()}
              className="w-full sm:w-auto heroui-gold-btn flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span className="font-display font-extrabold text-xs tracking-wider">BİRİKİM EKLE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

