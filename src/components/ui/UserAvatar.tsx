import React, { useId } from 'react';
import type { AvatarColor, AvatarType } from '../../services/auth/types';
import { getBeamAvatar } from './beamAvatars';

interface UserAvatarProps {
  avatar?: string;
  avatarType?: AvatarType;
  avatarColor?: AvatarColor;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  isCircle?: boolean;
}

const COLOR_MAP: Record<AvatarColor, { bg: string; border: string; glow: string; text: string }> = {
  gold: {
    bg: 'from-[#F5D07A]/20 via-[#E5B85C]/15 to-[#B88532]/25',
    border: 'border-[#E5B85C]/50',
    glow: 'shadow-[0_0_15px_rgba(229,184,92,0.25)]',
    text: 'text-[#F5D07A]',
  },
  red: {
    bg: 'from-rose-500/20 via-rose-600/15 to-rose-700/25',
    border: 'border-rose-500/50',
    glow: 'shadow-[0_0_15px_rgba(244,63,94,0.25)]',
    text: 'text-rose-400',
  },
  purple: {
    bg: 'from-purple-500/20 via-purple-600/15 to-purple-700/25',
    border: 'border-purple-500/50',
    glow: 'shadow-[0_0_15px_rgba(168,85,247,0.25)]',
    text: 'text-purple-400',
  },
  blue: {
    bg: 'from-sky-500/20 via-sky-600/15 to-sky-700/25',
    border: 'border-sky-500/50',
    glow: 'shadow-[0_0_15px_rgba(56,189,248,0.25)]',
    text: 'text-sky-400',
  },
  green: {
    bg: 'from-emerald-500/20 via-emerald-600/15 to-emerald-700/25',
    border: 'border-emerald-500/50',
    glow: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    text: 'text-emerald-400',
  },
  orange: {
    bg: 'from-amber-500/20 via-orange-600/15 to-orange-700/25',
    border: 'border-orange-500/50',
    glow: 'shadow-[0_0_15px_rgba(249,115,22,0.25)]',
    text: 'text-orange-400',
  },
};

const SIZE_MAP = {
  xs: 'w-7 h-7 text-xs rounded-lg',
  sm: 'w-8 h-8 text-sm rounded-xl',
  md: 'w-10 h-10 text-base rounded-2xl',
  lg: 'w-14 h-14 text-2xl rounded-2xl',
  xl: 'w-20 h-20 text-3xl rounded-full',
  '2xl': 'w-28 h-28 text-4xl rounded-full',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar = 'beam-2',
  avatarType = 'beam',
  avatarColor = 'orange',
  name = 'M',
  size = 'md',
  className = '',
  isCircle = false,
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const colorScheme = COLOR_MAP[avatarColor] || COLOR_MAP.orange;
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;
  const shapeClass = isCircle || size === 'xl' || size === '2xl' ? 'rounded-full' : '';

  // 1. Custom photo upload / image URL
  if (
    avatarType === 'custom' &&
    (avatar.startsWith('data:image') || avatar.startsWith('http') || avatar.startsWith('/'))
  ) {
    return (
      <div
        className={`relative overflow-hidden border ${colorScheme.border} ${colorScheme.glow} shrink-0 ${sizeClasses} ${shapeClass} ${className}`}
      >
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  // 2. Letter initial fallback
  if (avatarType === 'letter') {
    const initial = (name || 'M').charAt(0).toUpperCase();
    return (
      <div
        className={`bg-gradient-to-br ${colorScheme.bg} border ${colorScheme.border} ${colorScheme.glow} flex items-center justify-center font-black ${colorScheme.text} shrink-0 select-none ${sizeClasses} ${shapeClass} ${className}`}
      >
        {initial}
      </div>
    );
  }

  // 3. Beam SVG character avatar (Default & primary)
  const beam = getBeamAvatar(avatar);
  const maskId = `mask-${avatar}-${uniqueId}`;

  return (
    <div
      className={`relative overflow-hidden shrink-0 border ${colorScheme.border} ${colorScheme.glow} flex items-center justify-center transition-transform ${sizeClasses} ${shapeClass} ${className}`}
    >
      <div className="w-full h-full scale-[1.08] flex items-center justify-center">
        {beam.render(maskId)}
      </div>
    </div>
  );
};
