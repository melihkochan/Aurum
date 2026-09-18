import React, { useState } from 'react';
import type { AssetKey } from '../../services/market/types';

interface AssetIconProps {
  assetKey: AssetKey | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const ASSET_IMAGES: Record<string, string> = {
  gramGold: '/gorseller/gramaltin.png',
  quarterGold: '/gorseller/ceyrekaltin.png',
  halfGold: '/gorseller/ceyrekaltin.png',
  fullGold: '/gorseller/ceyrekaltin.png',
  usd: '/gorseller/dolar.png',
  eur: '/gorseller/euro.png',
  try: '/gorseller/try.png',
};


const SIZE_CLASSES = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-14 h-14',
};

export const AssetIcon: React.FC<AssetIconProps> = ({
  assetKey,
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);
  const imageSrc = ASSET_IMAGES[assetKey] || (assetKey === 'try' ? '/try.png' : '/gramaltin.png');

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 flex items-center justify-center p-0.5 bg-gradient-to-br from-white/12 to-white/4 border border-white/10 shadow-md ${SIZE_CLASSES[size]} ${className}`}
    >
      {!hasError ? (
        <img
          src={imageSrc}
          alt={assetKey}
          onError={() => setHasError(true)}
          className="w-full h-full object-contain rounded-full select-none pointer-events-none drop-shadow-sm"
          loading="eager"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs">
          {assetKey === 'try' ? '₺' : assetKey === 'usd' ? '$' : assetKey === 'eur' ? '€' : '🪙'}
        </div>
      )}
    </div>
  );
};
