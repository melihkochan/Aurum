import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface RegisterViewProps {
  onNavigateToLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onNavigateToLogin }) => {
  const { register, loginWithGoogle, loginWithApple } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);

  // Password criteria checks
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const isFormValid =
    fullName.trim().length > 0 &&
    email.trim().includes('@') &&
    hasMinLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setOauthNotice(null);

    if (!isFormValid) {
      if (!passwordsMatch) {
        setErrorMsg('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      } else {
        setErrorMsg('Lütfen tüm şifre kurallarını ve alanları eksiksiz doldurun.');
      }
      return;
    }

    try {
      setIsLoading(true);
      await register({ fullName, username: email.split('@')[0] || 'user', email, password });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Kayıt olunurken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthClick = async (provider: 'google' | 'apple') => {
    setErrorMsg(null);
    try {
      if (provider === 'google') await loginWithGoogle();
      else await loginWithApple();
    } catch (err: any) {
      setOauthNotice(err?.message || 'Kayıt servisi hazırlanıyor.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070709] text-white flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden selection:bg-[#E5B85C]/30 selection:text-[#F3C969]">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-[700px] h-[400px] bg-radial from-[#F5D07A]/10 via-[#E5B85C]/05 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-radial from-[#10B981]/05 to-transparent blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl rounded-[2.5rem] bg-[#0E0E14]/70 border border-white/[0.08] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9),0_0_50px_rgba(229,184,92,0.06)] backdrop-blur-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">

        {/* LEFT COLUMN: BRAND & PROMISE (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-5 p-10 xl:p-12 flex-col justify-between border-r border-white/[0.06] bg-gradient-to-br from-[#12121A]/80 to-[#0A0A0E]/80 relative">
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#F5D07A] via-[#E5B85C] to-[#B88532] flex items-center justify-center text-sm font-black text-[#0A0A0C] shadow-[0_0_20px_rgba(229,184,92,0.35)]">
                A
              </div>
              <div>
                <span className="font-display font-black text-xl tracking-tight text-white block leading-none">
                  AURUM
                </span>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#E5B85C]">
                  WEALTH & ASSET MANAGEMENT
                </span>
              </div>
            </div>

            {/* Tagline */}
            <div className="space-y-3 pt-4">
              <h2 className="font-display text-2xl xl:text-3xl font-black text-white tracking-tight leading-tight">
                AURUM'a katılın. <br />
                <span className="bg-gradient-to-r from-[#F5D07A] via-[#E5B85C] to-[#D6A84F] bg-clip-text text-transparent">
                  Finansal gücünüzü keşfedin.
                </span>
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Kişisel servetinizin, altın portföyünüzün ve aylık nakit akışınızın kontrolünü dakikalar içinde elinize alın.
              </p>
            </div>

            {/* Feature Badges */}
            <div className="space-y-3 pt-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <h4 className="text-xs font-bold text-white mb-1">0% Komisyon & Reklamsız</h4>
                <p className="text-[11px] text-zinc-400">Verileriniz yalnızca size aittir, şifrelenmiş olarak saklanır.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <h4 className="text-xs font-bold text-white mb-1">Canlı Kapalıçarşı & Serbest Piyasa</h4>
                <p className="text-[11px] text-zinc-400">Gerçek zamanlı altın ve döviz kurlarıyla anlık kâr/zarar hesabı.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/[0.05] text-[11px] text-zinc-500">
            Kişisel Verilerin Korunması ve KVKK Güvencesi
          </div>
        </div>

        {/* RIGHT COLUMN: REGISTER FORM CARD */}
        <div className="lg:col-span-7 p-7 sm:p-10 xl:p-12 flex flex-col justify-center">
          <div className="space-y-2 mb-6">
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
              Hesap Oluşturun
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400">
              Finansal hayatınızı tek merkezden yönetmeye başlayın.
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* OAuth Notice */}
          {oauthNotice && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-[#F5C042] animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-[#F5C042] shrink-0 mt-0.5" />
              <span>{oauthNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300 block">
                Ad Soyad
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Melih KOÇHAN"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300 block">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@aurum.app"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Passwords Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 block">
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Confirm */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 block">
                  Şifre Tekrar
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Password Strength Criteria List */}
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.04] grid grid-cols-2 gap-2 text-[11px]">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-zinc-500'}`}>
                <Check className={`w-3.5 h-3.5 ${hasMinLength ? 'stroke-[3]' : 'opacity-40'}`} />
                <span>En az 8 karakter</span>
              </div>

              <div className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-emerald-400' : 'text-zinc-500'}`}>
                <Check className={`w-3.5 h-3.5 ${hasUpperCase ? 'stroke-[3]' : 'opacity-40'}`} />
                <span>Büyük harf (A-Z)</span>
              </div>

              <div className={`flex items-center gap-1.5 ${hasLowerCase ? 'text-emerald-400' : 'text-zinc-500'}`}>
                <Check className={`w-3.5 h-3.5 ${hasLowerCase ? 'stroke-[3]' : 'opacity-40'}`} />
                <span>Küçük harf (a-z)</span>
              </div>

              <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-zinc-500'}`}>
                <Check className={`w-3.5 h-3.5 ${hasNumber ? 'stroke-[3]' : 'opacity-40'}`} />
                <span>Rakam (0-9)</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#F3C969] via-[#E5B85C] to-[#D6A84F] text-[#0A0A0C] font-black text-sm tracking-wide shadow-lg hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Kayıt Oluşturuluyor...</span>
                </>
              ) : (
                <>
                  <span>Hesap Oluştur</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Social Sign-In Divider */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <span className="relative px-4 text-[11px] font-bold uppercase tracking-wider text-zinc-500 bg-[#0E0E14]">
              veya
            </span>
          </div>

          {/* Apple & Google Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleOAuthClick('google')}
              className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] text-xs font-bold text-white transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthClick('apple')}
              className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/[0.15] text-xs font-bold text-white transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.3-9.58-11.36-20.73-15.19-33.45-3.83-12.73-5.74-24.36-5.74-34.9 0-14.15 3.72-26.06 11.16-35.73 7.44-9.67 16.73-14.59 27.87-14.75 4.36 0 9.27 1.13 14.75 3.39 5.48 2.26 9.49 3.39 12.02 3.39 2.09 0 6.07-1.17 11.96-3.52 5.89-2.35 10.6-3.41 14.13-3.18 13.06.77 23.36 5.8 30.9 15.1-11.45 6.94-17.06 16.53-16.84 28.76.22 9.58 3.91 17.65 11.08 24.2 7.17 6.54 15.7 10.15 25.59 10.83-2.18 6.54-4.8 13.06-7.85 19.56zm-38.31-105.7c0-6.19 2.29-12.18 6.87-17.98 4.58-5.8 10.4-9.98 17.46-12.56.55 1.54.83 3.09.83 4.65 0 6.19-2.35 12.28-7.05 18.27-4.7 5.99-10.49 9.94-17.37 11.85-.43-1.46-.74-2.87-.74-4.23z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>

          <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
            <span className="text-xs text-zinc-400">
              Zaten hesabın var mı?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="text-[#F3C969] hover:text-[#E5B85C] font-bold cursor-pointer transition-colors"
              >
                Giriş Yap
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
