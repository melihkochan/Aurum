import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { AssetAllocationItem } from '../../context/PortfolioContext';
import { usePortfolio } from '../../context/PortfolioContext';
import { ASSET_DEFINITIONS } from '../../services/market/types';
import { Card as HeroUICard } from '@heroui/react';
import { ASSET_IMAGES } from '../ui/AssetIcon';

interface AssetCardProps {
  asset: AssetAllocationItem;
  onClick: () => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick }) => {
  const { marketPrices, formatMoney } = usePortfolio();
  const def = ASSET_DEFINITIONS[asset.key];
  const quote = marketPrices ? marketPrices[asset.key] : null;

  const isPositive = quote ? quote.change24hPercent >= 0 : true;
  const changePercent = quote ? quote.change24hPercent : 0;

  const displayImage = asset.customImageUrl || ASSET_IMAGES[asset.key] || '/gramaltin.png';

  return (
    <HeroUICard
      onClick={onClick}
      className="group relative p-5 sm:p-6 rounded-[2rem] bg-[#111117]/90 hover:bg-[#14141E] border border-white/[0.08] hover:border-[#E5B85C]/45 transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between select-none shadow-[0_15px_40px_-15px_rgba(0,0,0,0.8)] hover:shadow-[0_20px_50px_-10px_rgba(229,184,92,0.16)]"
    >
      {/* Top Header: Image + Name (Left) & Quantity (Right) */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 flex items-center justify-center shrink-0">
            <img
              src={displayImage}
              alt={def?.nameTr || asset.name}
              className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] select-none"
            />
          </div>

          <div className="min-w-0">
            <h4 className="font-extrabold text-base sm:text-lg text-white group-hover:text-[#F5C042] transition-colors truncate leading-snug">
              {def?.nameTr || asset.name}
            </h4>
            <span className="text-[11px] text-zinc-400 font-mono block truncate">
              {quote ? `Birim: ${formatMoney(quote.price, true)}` : (def?.category === 'gold' ? 'Altın & Ziynet' : 'Döviz & Nakit')}
            </span>
          </div>
        </div>

        {/* Quantity (Adet / Miktar) on the Far Right */}
        <div className="text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
            MİKTAR
          </span>
          <div className="font-display text-lg sm:text-xl font-black text-white tabular-nums tracking-tight">
            {asset.quantity.toLocaleString('tr-TR')}{' '}
            <span className="text-xs font-bold text-[#E5B85C] font-sans">
              {def?.unitNameTr || 'Adet'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row: Total Value & Daily Trend */}
      <div className="pt-4 border-t border-white/[0.06] flex items-end justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-0.5">
            Toplam Değer
          </span>
          <div className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-[#F5C042]">
            {formatMoney(asset.currentValue)}
          </div>
        </div>

        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black tabular-nums border ${
          isPositive
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
            : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
        }`}>
          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          <span>{isPositive ? '+' : ''}{changePercent.toFixed(2)}%</span>
        </div>
      </div>
    </HeroUICard>
  );
};
