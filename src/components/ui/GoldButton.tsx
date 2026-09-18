import { Button as HeroUIButton } from '@heroui/react';
import type { ButtonProps as HeroUIButtonProps } from '@heroui/react';

export interface GoldButtonProps extends Omit<HeroUIButtonProps, 'variant'> {
  variant?: 'gold' | 'glass' | 'ghost' | 'danger' | 'outline-gold';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const GoldButton: React.FC<GoldButtonProps> = ({
  variant = 'gold',
  size = 'md',
  children,
  className = '',
  icon,
  ...props
}) => {
  let variantStyles = '';
  switch (variant) {
    case 'gold':
      variantStyles =
        'bg-gradient-to-r from-[#F3C969] via-[#E5B85C] to-[#D6A84F] text-[#0A0A0C] font-semibold hover:brightness-110 active:scale-[0.98] shadow-[0_4px_20px_-2px_rgba(229,184,92,0.35)] border border-[#F3C969]/50';
      break;
    case 'glass':
      variantStyles =
        'bg-[rgba(24,24,28,0.7)] hover:bg-[rgba(32,32,38,0.9)] text-[#F8FAFC] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(229,184,92,0.3)] shadow-[0_4px_16px_rgba(0,0,0,0.3)] active:scale-[0.98]';
      break;
    case 'outline-gold':
      variantStyles =
        'bg-transparent hover:bg-[rgba(214,168,79,0.1)] text-[#F3C969] border border-[#D6A84F]/40 hover:border-[#F3C969] shadow-[0_2px_12px_rgba(214,168,79,0.15)] active:scale-[0.98]';
      break;
    case 'danger':
      variantStyles =
        'bg-[rgba(239,68,68,0.12)] hover:bg-[rgba(239,68,68,0.2)] text-[#F87171] border border-[rgba(239,68,68,0.25)] active:scale-[0.98]';
      break;
    case 'ghost':
      variantStyles =
        'bg-transparent hover:bg-[rgba(255,255,255,0.05)] text-[#94A3B8] hover:text-[#F8FAFC] active:scale-[0.98]';
      break;
  }

  let sizeStyles = 'px-4 py-2 text-sm rounded-xl';
  if (size === 'sm') sizeStyles = 'px-3 py-1.5 text-xs rounded-lg gap-1.5';
  if (size === 'lg') sizeStyles = 'px-6 py-3.5 text-base rounded-2xl gap-2.5 font-bold';

  return (
    <HeroUIButton
      className={`inline-flex items-center justify-center transition-all duration-200 cursor-pointer select-none ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </HeroUIButton>
  );
};
