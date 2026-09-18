import React, { useRef } from 'react';
import { Camera, Check, Trash2 } from 'lucide-react';
import type { AvatarColor, AvatarType } from '../../services/auth/types';
import { UserAvatar } from '../ui/UserAvatar';
import { BEAM_AVATARS } from '../ui/beamAvatars';

interface AvatarPickerProps {
  selectedAvatar: string;
  avatarType: AvatarType;
  selectedColor?: AvatarColor;
  onSelectAvatar: (avatar: string, type: AvatarType) => void;
  onSelectColor?: (color: AvatarColor) => void;
  name?: string;
  compact?: boolean;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  selectedAvatar,
  avatarType,
  selectedColor = 'orange',
  onSelectAvatar,
  name = 'Melih',
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Fotoğraf boyutu en fazla 10 MB olmalıdır.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSelectAvatar(reader.result, 'custom');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    onSelectAvatar('beam-2', 'beam');
  };

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* 1. Large Circular Live Preview with Subtle Glow */}
      <div className="flex flex-col items-center pt-1">
        <div className="relative p-1 rounded-full bg-gradient-to-tr from-[#E5B85C]/30 via-transparent to-[#F5D07A]/30 shadow-[0_0_24px_rgba(229,184,92,0.18)]">
          <UserAvatar
            avatar={selectedAvatar}
            avatarType={avatarType}
            avatarColor={selectedColor}
            name={name}
            size="2xl"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full"
            isCircle={true}
          />
        </div>

        {/* Action Buttons: [ Fotoğraf Seç ] [ Fotoğrafı Kaldır ] */}
        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] hover:border-[#E5B85C]/40 text-xs font-semibold text-zinc-200 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <Camera className="w-3.5 h-3.5 text-[#E5B85C]" />
            <span>Fotoğraf Yükle</span>
          </button>

          {avatarType === 'custom' && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="px-3 py-1.5 rounded-xl bg-white/[0.02] hover:bg-rose-500/10 border border-white/[0.06] hover:border-rose-500/25 text-xs font-semibold text-zinc-400 hover:text-rose-400 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Kaldır</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* 2. HAZIR AVATARLAR - ALL VISIBLE, NO SCROLLBAR */}
      <div className="w-full space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
            HAZIR AVATARLAR
          </span>
          <span className="text-[10px] text-zinc-500">
            {BEAM_AVATARS.length} avatar
          </span>
        </div>

        {/* Full Grid of Avatars - All visible without scrollbars */}
        <div className="grid grid-cols-6 gap-2 sm:gap-2.5 justify-items-center p-1 w-full">
          {BEAM_AVATARS.map((b, idx) => {
            const isSelected =
              avatarType !== 'custom' &&
              (selectedAvatar === b.id || (!selectedAvatar && b.id === 'beam-2'));

            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectAvatar(b.id, 'beam')}
                title={b.name}
                className={`h-11 w-11 rounded-xl relative flex items-center justify-center cursor-pointer transition-all border shadow-sm overflow-hidden ${
                  isSelected
                    ? 'border-[#E5B85C] ring-2 ring-[#E5B85C]/80 ring-offset-2 ring-offset-[#0A0A0C] opacity-100 scale-105 shadow-[0_0_12px_rgba(229,184,92,0.3)]'
                    : 'border-white/[0.08] bg-white/[0.02] opacity-65 hover:opacity-100 hover:scale-105'
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="scale-[1.2] transform flex items-center justify-center w-full h-full">
                    {b.render(`picker-mask-${idx}-${b.id}`)}
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute -right-0.5 -bottom-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#E5B85C] text-[#0A0A0C] shadow-sm">
                    <Check className="h-2 w-2 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
