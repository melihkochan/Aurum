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
      });

      updatePreferences({
        currency,
        name: fullName.trim().split(' ')[0],
      });

      onComplete();
    } catch (err: any) {
      setErrorMsg(err.message || 'Profil kaydedilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto aurum-scrollbar rounded-[2.25rem] bg-[#0E0F14] border border-white/10 p-6 sm:p-9 space-y-6 shadow-[0_25px_80px_rgba(0,0,0,0.9)] relative">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#F5D07A]/10 via-[#E5B85C]/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5B85C]/15 border border-[#E5B85C]/30 text-[#F5C042] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AURUM VAULT'A HOŞ GELDİNİZ</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Profilinizi Tamamlayın
          </h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Finansal kasanızı başlatmadan önce adınızı, avatarınızı ve ana para biriminizi seçin.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Picker */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block text-center mb-3">
              Profil Simgesi & Fotoğrafı
            </span>
            <AvatarPicker
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">
                Ad Soyad <span className="text-[#E5B85C]">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Örn: Melih Koçhan"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                placeholder="Örn: melih"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Preferred Base Currency */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 block">
              Varsayılan Para Birimi
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(
                [
                  { code: 'TRY' as const, label: '₺ Türk Lirası', desc: 'TRY' },
                  { code: 'USD' as const, label: '$ Dolar', desc: 'USD' },
                  { code: 'EUR' as const, label: '€ Euro', desc: 'EUR' },
                ]
              ).map((curr) => {
                const isSelected = currency === curr.code;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setCurrency(curr.code)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-[#E5B85C]/15 border-[#E5B85C]/50 text-[#F5C042] shadow-sm font-bold'
                        : 'bg-white/[0.02] border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="text-xs font-bold">{curr.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#E5B85C]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#F5D07A] via-[#E5B85C] to-[#C99539] text-[#0A0A0C] font-extrabold text-sm tracking-wide shadow-[0_6px_25px_rgba(229,184,92,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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
