import React, { useEffect, useState, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  formatFn?: (val: number) => string;
  duration?: number; // ms
  className?: string;
  isMasked?: boolean;
  currencySymbol?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  formatFn,
  duration = 600,
  className = '',
  isMasked = false,
  currencySymbol = '₺',
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (isMasked) return;

    const startVal = prevValueRef.current;
    const endVal = value;
    if (startVal === endVal) return;

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * ease;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(endVal);
        prevValueRef.current = endVal;
      }
    };

    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [value, duration, isMasked]);

  if (isMasked) {
    return <span className={`finance-num ${className}`}>{currencySymbol}••••••••</span>;
  }

  const formatted = formatFn 
    ? formatFn(displayValue) 
    : new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(displayValue);

  return <span className={`finance-num ${className}`}>{formatted}</span>;
};
