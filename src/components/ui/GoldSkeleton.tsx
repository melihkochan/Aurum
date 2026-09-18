import React from 'react';
import { Skeleton as HeroUISkeleton } from '@heroui/react';

export interface GoldSkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: string;
}

export const GoldSkeleton: React.FC<GoldSkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'rounded-xl',
}) => {
  return (
    <HeroUISkeleton
      style={{ width, height }}
      className={`animate-pulse bg-[rgba(255,255,255,0.06)] relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-[rgba(229,184,92,0.08)] before:to-transparent ${rounded} ${className}`}
    />
  );
};
