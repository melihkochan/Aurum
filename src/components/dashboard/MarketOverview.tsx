import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { ASSET_DEFINITIONS } from '../../services/market/types';
import type { AssetKey } from '../../services/market/types';
import { Card as HeroUICard } from '@heroui/react';
import { LiveIndicator } from '../ui/LiveIndicator';
import { ASSET_IMAGES } from '../ui/AssetIcon';

export const MarketOverview: React.FC = () => {
  const { marketPrices, marketStatus, marketError, refreshMarket } = usePortfolio();

  const primaryKeys: AssetKey[] = ['gramGold', 'quarterGold', 'usd', 'eur'];
  const lastUpdated = marketPrices ? marketPrices.gramGold.lastUpdated : '--:--';

  const renderIcon = (key: AssetKey) => {
    return (
      <div className="w-11 h-11 rounded-2xl p-0.5 bg-white/10 border border-white/15 flex items-center justify-center shadow-md shrink-0">
        <img
          src={ASSET_IMAGES[key] || '/gramaltin.png'}
          alt={key}
          className="w-full h-full object-contain rounded-xl drop-shadow-md"
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E5B85C] block">
              CANLI PİYASA KURLARI
            </span>
            <LiveIndicator status={marketStatus} />
          </div>
          <span className="text-xs text-zinc-400 mt-0.5 block">
            Son güncelleme: {lastUpdated} (TCMB & Kapalıçarşı Serbest Piyasa)
          </span>
        </div>
      </div>

      {/* Error Fallback Banner */}
      {marketError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between text-xs text-rose-400">
          <span>{marketError}</span>
          <button onClick={refreshMarket} className="underline font-bold cursor-pointer">
            Tekrar Dene
          </button>
        </div>
      )}


      {/* 4 Clean Spacious Cards in a Row using HeroUICard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {primaryKeys.map((key) => {
          const def = ASSET_DEFINITIONS[key];
          const quote = marketPrices ? marketPrices[key] : null;
          const isUp = quote ? quote.change24hPercent >= 0 : true;

          return (
            <HeroUICard
              key={key}
              className="rounded-[1.75rem] bg-[#121218]/80 hover:bg-[#161622] border border-white/[0.06] hover:border-[#E5B85C]/30 p-6 transition-all duration-300 flex flex-col justify-between shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center justify-between mb-4">
                {renderIcon(key)}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-bold text-emerald-400 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  <span>CANLI</span>
                </div>
              </div>



              <div className="space-y-1 mb-4">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  {def.nameTr}
                </span>
                <span className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums block">
                  ₺{quote ? quote.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/[0.05] text-xs font-bold tabular-nums">
                <span
                  className={`flex items-center gap-0.5 px-2 py-0.5 rounded-md ${isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                    }`}
                >
                  {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>{isUp ? '+' : ''}{quote ? quote.change24hPercent.toFixed(2) : '0.00'}%</span>
                </span>
                <span className="text-zinc-500 text-[11px] font-normal">24s Değişim</span>
              </div>
            </HeroUICard>
          );
        })}
      </div>
    </div>
  );
};
