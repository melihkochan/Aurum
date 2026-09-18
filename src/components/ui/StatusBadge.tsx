import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface StatusBadgeProps {
  type: 'positive' | 'negative' | 'neutral' | 'gold';
  value?: string | number;
  percent?: number;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  value,
  percent,
  label,
  size = 'md',
  className = '',
}) => {
  let colorStyles = '';
  let IconComponent = Minus;

  if (type === 'positive') {
    colorStyles = 'bg-[rgba(16,185,129,0.12)] text-[#10B981] border border-[rgba(16,185,129,0.25)]';
    IconComponent = ArrowUpRight;
  } else if (type === 'negative') {
    colorStyles = 'bg-[rgba(239,68,68,0.12)] text-[#F87171] border border-[rgba(239,68,68,0.25)]';
    IconComponent = ArrowDownRight;
  } else if (type === 'gold') {
    colorStyles = 'bg-[rgba(229,184,92,0.12)] text-[#F3C969] border border-[rgba(229,184,92,0.28)]';
    IconComponent = ArrowUpRight;
  } else {
    colorStyles = 'bg-[rgba(255,255,255,0.06)] text-[#94A3B8] border border-[rgba(255,255,255,0.1)]';
  }

  const paddingStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs md:text-sm';

  return (
    <div className={`inline-flex items-center gap-1 font-medium rounded-full select-none tabular-nums ${paddingStyles} ${colorStyles} ${className}`}>
      {type !== 'neutral' && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
      {label && <span>{label}</span>}
      {value !== undefined && <span>{value}</span>}
      {percent !== undefined && (
        <span>
          {percent >= 0 ? '+' : ''}
          {percent.toFixed(2)}%
        </span>
      )}
    </div>
  );
};
