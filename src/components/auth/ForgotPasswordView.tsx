import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ForgotPasswordViewProps {
  onNavigateToLogin: () => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onNavigateToLogin }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    try {
      setIsLoading(true);
      await resetPassword(email);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Sıfırlama bağlantısı gönderilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070709] text-white flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden selection:bg-[#E5B85C]/30 selection:text-[#F3C969]">
      {/* Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-radial from-[#F5D07A]/12 to-transparent blur-3xl pointer-events-none" />

      <div className="w-full max-w-md rounded-[2.5rem] bg-[#0E0E14]/80 border border-white/[0.08] shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl p-7 sm:p-9 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F5D07A] via-[#E5B85C] to-[#B88532] flex items-center justify-center text-xs font-black text-[#0A0A0C]">
            A
          </div>
          <div>
            <span className="font-display font-black text-lg tracking-tight text-white block leading-none">
              AURUM
            </span>
            <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#E5B85C]">
              HESAP GÜVENLİĞİ
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <h3 className="text-2xl font-black text-white tracking-tight font-display">
            Şifreni sıfırla
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            E-posta adresini gir, sana güvenli bir sıfırlama bağlantısı gönderelim.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isSuccess ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-white">Bağlantı Gönderildi</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                <strong>{email}</strong> adresine şifre sıfırlama talimatları iletildi. Lütfen gelen kutunuzu ve spam klasörünü kontrol edin.
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="w-full py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] text-white font-bold text-xs border border-white/[0.1] transition-all cursor-pointer"
            >
              Giriş Ekranına Dön
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
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
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#F3C969] via-[#E5B85C] to-[#D6A84F] text-[#0A0A0C] font-black text-sm tracking-wide shadow-lg hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gönderiliyor...</span>
                </>
              ) : (
                <span>Sıfırlama Bağlantısı Gönder</span>
              )}
            </button>

            <button
              type="button"
              onClick={onNavigateToLogin}
              className="w-full pt-3 flex items-center justify-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Giriş Ekranına Geri Dön</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
