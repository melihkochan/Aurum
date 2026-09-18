import React, { useEffect, useState, useRef } from 'react';

// Global memory cache to retain last known values across component unmounts,
// tab switches, and modal closes!
const globalValueCache = new Map<string, number>();

export interface RenderInfo {
  value: number;
  formatted: string;
  integerPart: string;
  decimalPart: string;
  direction: 'up' | 'down' | 'none';
}

export interface AnimatedNumberProps {
  value: number;
  cacheKey?: string;
  formatFn?: (val: number) => string;
  render?: (info: RenderInfo) => React.ReactNode;
  duration?: number; // ms
  className?: string;
  isMasked?: boolean;
  currencySymbol?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  highlightOnChange?: boolean;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  cacheKey,
  formatFn,
  render,
  duration = 750,
  className = '',
  isMasked = false,
  currencySymbol = '₺',
  prefix = '',
  suffix = '',
  decimals = 2,
  highlightOnChange = false,
}) => {
  // Initialize start value from cache if available so it animates from previous state!
  const cachedInitial = cacheKey !== undefined ? globalValueCache.get(cacheKey) : undefined;
  const initialVal = cachedInitial !== undefined ? cachedInitial : value;

  const [displayValue, setDisplayValue] = useState(initialVal);
  const [direction, setDirection] = useState<'up' | 'down' | 'none'>('none');
  const prevValueRef = useRef(initialVal);

  useEffect(() => {
    if (isMasked) return;

    const startVal = prevValueRef.current;
    const endVal = value;

    if (Math.abs(startVal - endVal) < 0.001) {
      if (cacheKey) globalValueCache.set(cacheKey, endVal);
      return;
    }

    const currentDirection: 'up' | 'down' = endVal > startVal ? 'up' : 'down';
    setDirection(currentDirection);

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Luxurious ease-out quart for natural banking deceleration
      const ease = 1 - Math.pow(1 - progress, 4);
      const current = startVal + (endVal - startVal) * ease;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endVal);
        prevValueRef.current = endVal;
        if (cacheKey) globalValueCache.set(cacheKey, endVal);

        // Reset direction after animation finishes
        setTimeout(() => setDirection('none'), 400);
      }
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [value, duration, isMasked, cacheKey]);

  if (isMasked) {
    return <span className={`finance-num ${className}`}>{currencySymbol}••••••••</span>;
  }

  const locale = 'tr-TR';
  const absVal = Math.abs(displayValue);
  const intVal = Math.floor(absVal);
  const formattedInt = (displayValue < 0 ? '-' : '') + intVal.toLocaleString(locale);
  const fracDigits = Math.round((absVal % 1) * Math.pow(10, decimals)).toString().padStart(decimals, '0');
  const formattedDec = fracDigits;

  const defaultFormatted = `${prefix}${new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(displayValue)}${suffix}`;

  const formatted = formatFn ? formatFn(displayValue) : defaultFormatted;

  if (render) {
    return <>{render({ value: displayValue, formatted, integerPart: formattedInt, decimalPart: formattedDec, direction })}</>;
  }

  const highlightClass = highlightOnChange && direction !== 'none'
    ? direction === 'down'
      ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)] transition-colors duration-300'
      : 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-colors duration-300'
    : 'transition-colors duration-500';

  return (
    <span className={`finance-num ${highlightClass} ${className}`}>
      {formatted}
    </span>
  );
};
