import React from 'react';

export type LiveIndicatorStatus = 'live' | 'updating' | 'offline';

interface LiveIndicatorProps {
  status?: LiveIndicatorStatus;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({
  status = 'live',
  label,
  size = 'sm',
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'live':
        return {
          dotBg: 'bg-emerald-400',
          pingBg: 'bg-emerald-400/40',
          textColor: 'text-emerald-400',
          glow: 'shadow-[0_0_10px_rgba(52,211,153,0.8)]',
          defaultLabel: 'CANLI',
        };
      case 'updating':
        return {
          dotBg: 'bg-[#F5C042]',
          pingBg: 'bg-[#F5C042]/40',
          textColor: 'text-[#F5C042]',
          glow: 'shadow-[0_0_10px_rgba(245,192,66,0.8)]',
          defaultLabel: 'GÜNCELLENİYOR',
        };
      case 'offline':
        return {
          dotBg: 'bg-rose-400',
          pingBg: 'bg-rose-400/40',
          textColor: 'text-rose-400',
          glow: 'shadow-[0_0_10px_rgba(248,113,113,0.8)]',
          defaultLabel: 'ÇEVRİMDIŞI',
        };
    }
  };

  const config = getStatusConfig();
  const text = label || config.defaultLabel;
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <span className="relative flex items-center justify-center">
        {status === 'live' && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full ${config.pingBg} animate-ping duration-1000 opacity-75`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full ${dotSize} ${config.dotBg} ${config.glow} transition-colors`}
        />
      </span>
      {text && (
        <span className={`text-[11px] font-bold tracking-wider uppercase ${config.textColor}`}>
          {text}
        </span>
      )}
    </div>
  );
};
