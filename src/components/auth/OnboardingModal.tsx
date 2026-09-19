import React, { useState } from 'react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortfolio } from '../../context/PortfolioContext';
import { AvatarPicker } from './AvatarPicker';
import type { AvatarColor, AvatarType } from '../../services/auth/types';
import type { CurrencyCode } from '../../services/portfolio/types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { user, updateProfile } = useAuth();
  const { updatePreferences } = usePortfolio();

  const [fullName, setFullName] = useState(user?.fullName || user?.name || '');
  const [username, setUsername] = useState(user?.username || (user?.email ? user.email.split('@')[0] : ''));
  const [avatar, setAvatar] = useState(user?.avatar || 'beam-2');
  const [avatarType, setAvatarType] = useState<AvatarType>(user?.avatarType || 'beam');
  const [avatarColor, setAvatarColor] = useState<AvatarColor>(user?.avatarColor || 'orange');
  const [currency, setCurrency] = useState<CurrencyCode>((user?.currencyPreference as CurrencyCode) || 'TRY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Lütfen adınızı ve soyadınızı giriniz.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const cleanUsername = (username || fullName.toLowerCase().replace(/\s+/g, '_')).trim().replace(/^@/, '');

      await updateProfile({
        fullName: fullName.trim(),
        name: fullName.trim().split(' ')[0],
        username: cleanUsername,
        avatar,
        avatarType,
        avatarColor,
        currencyPreference: currency,
        onboardingCompleted: true,
      });

      updatePreferences({
        currency,
        name: fullName.trim().split(' ')[0],
      });

      try {
        localStorage.setItem('aurum_last_user_name', fullName.trim().split(' ')[0]);
      } catch {}

      onComplete();
    } catch (err: any) {
      setErrorMsg(err.message || 'Profil kaydedilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300 overflow-y-auto overflow-x-hidden">
      <div className="w-full max-w-lg rounded-3xl bg-[#0E0F14] border border-white/10 p-5 sm:p-7 space-y-4 shadow-[0_25px_80px_rgba(0,0,0,0.95)] relative overflow-hidden my-auto box-border">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#F5D07A]/10 via-[#E5B85C]/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E5B85C]/15 border border-[#E5B85C]/30 text-[#F5C042] text-[10px] font-bold">
            <Sparkles className="w-3 h-3" />
            <span>AURUM VAULT</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-black text-white tracking-tight">
            Profilinizi Tamamlayın
          </h2>
          <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
            Finansal kasanızı başlatmadan önce bilgilerinizi belirleyin.
          </p>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Compact Avatar Picker */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
            <AvatarPicker
              compact={true}
              selectedAvatar={avatar}
              avatarType={avatarType}
              selectedColor={avatarColor}
              name={fullName || 'Melih'}
              onSelectAvatar={(av, type) => {
                setAvatar(av);
                setAvatarType(type);
              }}
              onSelectColor={(col) => setAvatarColor(col)}
            />
          </div>

          {/* Name & Username Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                <span>Ad Soyad</span>
                <span className="text-[#E5B85C]">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Örn: Melih Koçhan"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-[#E5B85C]/60 text-xs sm:text-sm text-white focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                placeholder="Örn: melih"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-[#E5B85C]/60 text-xs sm:text-sm text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Preferred Base Currency */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 block">
              Varsayılan Para Birimi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'TRY' as const, label: '₺ Türk Lirası' },
                { code: 'USD' as const, label: '$ Dolar' },
                { code: 'EUR' as const, label: '€ Euro' },
              ].map((curr) => {
                const isSelected = currency === curr.code;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setCurrency(curr.code)}
                    className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#E5B85C]/15 border-[#E5B85C]/50 text-[#F5C042] font-bold shadow-sm'
                        : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="text-xs">{curr.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#E5B85C] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#F5D07A] via-[#E5B85C] to-[#C99539] text-[#0A0A0C] font-black text-xs sm:text-sm tracking-wide shadow-[0_4px_20px_rgba(229,184,92,0.35)] hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
          >
            {isSubmitting ? (
              <span>Kaydediliyor...</span>
            ) : (
              <>
                <span>PORTFÖYÜMÜ BAŞLAT</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
