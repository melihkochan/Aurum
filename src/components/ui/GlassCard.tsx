import React from 'react';
import { Card as HeroUICard } from '@heroui/react';

export interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  isGoldAccented?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  isGoldAccented = false,
  interactive = false,
  onClick,
}) => {
  const baseStyles = isGoldAccented
    ? 'bg-gradient-to-br from-[rgba(229,184,92,0.1)] via-[rgba(18,18,22,0.85)] to-[rgba(10,10,12,0.95)] border border-[#D6A84F]/30 shadow-[0_12px_40px_-10px_rgba(214,168,79,0.2)]'
    : 'bg-[rgba(16,16,20,0.72)] border border-[rgba(255,255,255,0.07)] shadow-[0_10px_35px_-5px_rgba(0,0,0,0.65)]';

  const interactiveStyles = interactive
    ? 'cursor-pointer hover:border-[rgba(229,184,92,0.4)] hover:bg-[rgba(24,24,30,0.85)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200'
    : '';

  return (
    <HeroUICard
      onClick={onClick}
      className={`rounded-2xl backdrop-blur-xl p-5 md:p-6 text-[#F8FAFC] relative overflow-hidden transition-all duration-300 ${baseStyles} ${interactiveStyles} ${className}`}
    >
      {isGoldAccented && (
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#E5B85C]/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
      )}
      {children}
    </HeroUICard>
  );
};
