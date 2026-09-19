import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  AtSign,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { AvatarPicker } from './AvatarPicker';
import type { AvatarColor, AvatarType } from '../../services/auth/types';
import { useTypewriter } from '../../hooks/useTypewriter';

const LOGIN_IDENTIFIER_PLACEHOLDERS = [
  'melih',
  'melih@aurum.app',
  'yatirimci',
  'kullanici@aurum.app',
  'finans',
  'servet@aurum.app',
];

interface AuthViewProps {
  initialTab?: 'login' | 'register';
  onForgotPassword?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  initialTab = 'login',
  onForgotPassword,
}) => {
  const { login, register, loginWithGoogle, loginWithApple } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register form states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Avatar states for register
  const [avatar, setAvatar] = useState('beam-2');
  const [avatarType, setAvatarType] = useState<AvatarType>('beam');
  const avatarColor: AvatarColor = 'orange';

  // Animated typewriter placeholder for email / username input
  const animatedPlaceholder = useTypewriter(LOGIN_IDENTIFIER_PLACEHOLDERS, 85, 45, 2200);

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [oauthNotice, setOauthNotice] = useState<string | null>(null);
  const [lastUserName] = useState<string>(() => {
    try {
      return localStorage.getItem('aurum_last_user_name') || '';
    } catch {
      return '';
    }
  });
  const [lastUsername] = useState<string>(() => {
    try {
      return localStorage.getItem('aurum_last_username') || '';
    } catch {
      return '';
    }
  });

  // Password criteria for register
  const hasMinLength = registerPassword.length >= 8;
  const hasUpperCase = /[A-Z]/.test(registerPassword);
  const hasLowerCase = /[a-z]/.test(registerPassword);
  const hasNumber = /[0-9]/.test(registerPassword);
  const passwordsMatch = registerPassword.length > 0 && registerPassword === confirmPassword;

  const isRegisterValid =
    fullName.trim().length > 0 &&
    username.trim().length >= 3 &&
    registerEmail.trim().includes('@') &&
    hasMinLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    passwordsMatch;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      await login({ identifier, password });
    } catch (err: any) {
      setErrorMsg(err.message || 'Giriş yapılamadı. Lütfen tekrar deneyiniz.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isRegisterValid) {
      setErrorMsg('Lütfen tüm şifre kriterlerini karşılayınız ve alanları doldurunuz.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        fullName,
        username,
        email: registerEmail,
        password: registerPassword,
        avatar,
        avatarType,
        avatarColor,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Kayıt işlemi başarısız oldu.');
    } finally {
      setIsLoading(false);
    }
  };


  const handleOAuthClick = async (provider: 'Google' | 'Apple') => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      setOauthNotice(`${provider} ile güvenli oturum yönlendiriliyor...`);
      if (provider === 'Google') {
        await loginWithGoogle();
      } else {
        await loginWithApple();
      }
    } catch (err: any) {
      setOauthNotice(null);
      setErrorMsg(err.message || `${provider} ile giriş başlatılamadı.`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden flex flex-col lg:flex-row text-white selection:bg-[#E5B85C]/30 selection:text-[#F3C969] bg-[#050507]">
      
      {/* ==================================================== */}
      {/* FULL-BLEED SEAMLESS AMBIENT GRADIENT ATMOSPHERE */}
      {/* (Left-to-right flowing aura: Dark Navy/Purple -> Burgundy -> Soft Amber -> Deep Charcoal Black) */}
      {/* ==================================================== */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background:
            'linear-gradient(108deg, #040407 0%, #0d0816 14%, #140d22 26%, #1f1224 40%, #231520 48%, #1d161d 58%, #121017 70%, #09090d 84%, #060608 100%)',
        }}
      />

      {/* Broad, soft ambient glow washes (Wide aura across left & center, zero harsh spotlights) */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: [
            /* Left-to-center subtle warm amber/gold aura wash */
            'radial-gradient(ellipse 75% 65% at 32% 48%, rgba(229,184,92,0.055) 0%, rgba(229,184,92,0.015) 50%, transparent 80%)',
            /* Left panel deep purple / wine atmosphere */
            'radial-gradient(ellipse 85% 75% at 18% 42%, rgba(120,40,180,0.07) 0%, rgba(70,20,100,0.02) 55%, transparent 85%)',
            /* Far-left top mist */
            'radial-gradient(ellipse 55% 45% at 8% 12%, rgba(140,70,220,0.035) 0%, transparent 70%)',
          ].join(', '),
        }}
      />

      {/* Subtle star dust field across the background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none havn-stars opacity-35 z-0" />

      {/* ==================================================== */}
      {/* LEFT PANEL: LUXURY AURUM BRANDING & REFINED RINGS */}
      {/* ==================================================== */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative z-10 p-12 select-none border-r border-white/[0.02]">
        
        {/* Center Content: Concentric Pulsing Rings + Emblem + Wordmark */}
        <div className="relative flex flex-col items-center">
          
          {/* Refined Concentric Decorative Rings around Logo */}
          <div className="relative flex items-center justify-center mb-10">
            {/* Ring 5 — Outermost, large 560px with delicate hairline */}
            <div
              className="absolute rounded-full border havn-ring pointer-events-none"
              style={{
                width: '560px',
                height: '560px',
                borderWidth: '0.75px',
                borderColor: 'rgba(229,184,92,0.05)',
                animationDelay: '1.6s',
              }}
            />
            {/* Ring 4 — 450px */}
            <div
              className="absolute rounded-full border havn-ring pointer-events-none"
              style={{
                width: '450px',
                height: '450px',
                borderWidth: '0.75px',
                borderColor: 'rgba(229,184,92,0.08)',
                animationDelay: '1.2s',
              }}
            />
            {/* Ring 3 — 350px */}
            <div
              className="absolute rounded-full border havn-ring pointer-events-none"
              style={{
                width: '350px',
                height: '350px',
                borderWidth: '0.75px',
                borderColor: 'rgba(229,184,92,0.12)',
                animationDelay: '0.8s',
              }}
            />
            {/* Ring 2 — 260px */}
            <div
              className="absolute rounded-full border havn-ring pointer-events-none"
              style={{
                width: '260px',
                height: '260px',
                borderWidth: '0.75px',
                borderColor: 'rgba(229,184,92,0.18)',
                animationDelay: '0.4s',
              }}
            />
            {/* Ring 1 — 175px */}
            <div
              className="absolute rounded-full border havn-ring pointer-events-none"
              style={{
                width: '175px',
                height: '175px',
                borderWidth: '1px',
                borderColor: 'rgba(245,208,122,0.28)',
                animationDelay: '0s',
              }}
            />

            {/* Small, controlled, soft glow strictly behind the central emblem */}
            <div
              className="absolute w-28 h-28 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(229,184,92,0.18) 0%, transparent 70%)',
                filter: 'blur(16px)',
              }}
            />

            {/* The Central AURUM Icon */}
            <div className="relative w-24 h-24 rounded-3xl overflow-hidden havn-icon-glow cursor-pointer transition-transform hover:scale-105 z-10 border border-[#E5B85C]/40 shadow-[0_0_35px_rgba(229,184,92,0.35)] p-0.5 bg-[#0A0A0C]">
              <img
                src="/gorseller/logo.png"
                alt="AURUM Logo"
                className="w-full h-full object-cover rounded-[22px]"
              />
            </div>
          </div>

          {/* AURUM wordmark */}
          <div className="text-center space-y-2.5">
            <h1
              className="font-display font-black tracking-[0.3em] leading-none"
              style={{
                fontSize: '3.2rem',
                color: 'white',
                textShadow:
                  '0 0 25px rgba(229,184,92,0.45), 0 0 50px rgba(184,133,50,0.2)',
              }}
            >
              AURUM
            </h1>
            <p
              className="text-[12px] font-bold uppercase tracking-[0.24em]"
              style={{ color: 'rgba(245,208,122,0.85)' }}
            >
              wealth & asset management
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div
          className="absolute bottom-8 left-0 right-0 text-center"
          style={{
            color: 'rgba(255,255,255,0.22)',
            fontSize: '11px',
            letterSpacing: '0.12em',
          }}
        >
          © 2026 AURUM · Kişisel Servet ve Varlık Kasası
        </div>
      </div>

      {/* ==================================================== */}
      {/* RIGHT PANEL: AUTHENTICATION FORM */}
      {/* ==================================================== */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 xl:p-16 relative z-10 overflow-y-auto aurum-scrollbar">
        <div className="w-full max-w-[420px] space-y-6">
          
          {/* Mobile Header (Shown on small screens) */}
          <div className="lg:hidden text-center space-y-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5D07A] via-[#E5B85C] to-[#A06C18] flex items-center justify-center text-[#0A0A0C] font-display font-black text-2xl shadow-lg mx-auto">
              A
            </div>
            <h2 className="font-display font-black text-xl text-white">AURUM</h2>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#E5B85C]">
              WEALTH & ASSET MANAGEMENT
            </span>
          </div>

          {/* TAB SELECTOR: [ Giriş Yap ] [ Kayıt Ol ] */}
          <div className="flex items-center p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-[#F5D07A] to-[#E5B85C] text-[#0A0A0C] shadow-[0_4px_16px_rgba(229,184,92,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg(null);
              }}
              className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-gradient-to-r from-[#F5D07A] to-[#E5B85C] text-[#0A0A0C] shadow-[0_4px_16px_rgba(229,184,92,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          {/* Error and Info Alerts */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-400 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {oauthNotice && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-[#F5C042] animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-[#F5C042] shrink-0 mt-0.5" />
              <span>{oauthNotice}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {lastUserName ? 'Tekrar Hoş Geldiniz' : 'Hoş Geldiniz'}
                  </h2>
                  {lastUserName && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E5B85C]/10 border border-[#E5B85C]/20 text-[11px] shrink-0 shadow-sm">
                      <span className="text-zinc-400 font-medium">Son oturum:</span>
                      <span className="text-[#F5C042] font-mono font-bold">
                        {lastUsername ? `@${lastUsername.replace(/^@/, '')}` : `@${lastUserName.toLowerCase().replace(/\s+/g, '_')}`}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-zinc-400">
                  {lastUserName ? (
                    <>
                      Seni tekrar görmek harika,{' '}
                      <span className="text-[#F5D07A] font-semibold">{lastUserName}</span>! Kişisel
                      kasanıza ve portföyünüze erişmek için giriş yapın.
                    </>
                  ) : (
                    'Kişisel kasanıza ve portföyünüze erişmek için giriş yapın.'
                  )}
                </p>
              </div>


              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email or Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300 block">
                    E-posta veya Kullanıcı Adı
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={animatedPlaceholder || 'melih veya melih@aurum.app'}
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white placeholder:text-zinc-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300 block">
                      Şifre
                    </label>
                    {onForgotPassword && (
                      <button
                        type="button"
                        onClick={onForgotPassword}
                        className="text-xs text-[#E5B85C] hover:underline font-semibold cursor-pointer"
                      >
                        Şifremi unuttum
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-11 pr-11 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#F5D07A] via-[#E5B85C] to-[#D6A84F] hover:brightness-110 active:scale-[0.98] text-[#0A0A0C] font-black text-sm transition-all shadow-[0_4px_20px_rgba(229,184,92,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0A0A0C]" />
                  ) : (
                    <>
                      <span>Giriş Yap</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </>
                  )}
                </button>
              </form>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1.5">
                  <div className="flex-1 border-t border-white/[0.08]" />
                  <span className="text-[11px] font-medium text-zinc-500 tracking-wider">
                    veya
                  </span>
                  <div className="flex-1 border-t border-white/[0.08]" />
                </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthClick('Google')}
                  className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google ile</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuthClick('Apple')}
                  className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.71-.93 2.73 1 .08 2.02-.48 2.64-1.23z" />
                  </svg>
                  <span>Apple ile</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: REGISTER FORM */}
          {activeTab === 'register' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Hesap Oluştur
                </h2>
                <p className="text-xs text-zinc-400">
                  Finansal hayatını ve servetini tek merkezden yönet.
                </p>
              </div>

              {/* Avatar Selection Card */}
              <AvatarPicker
                selectedAvatar={avatar}
                avatarType={avatarType}
                selectedColor={avatarColor}
                onSelectAvatar={(av, type) => {
                  setAvatar(av);
                  setAvatarType(type);
                }}
                name={fullName || 'Melih'}
              />

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
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

                {/* Username */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 block">
                    Kullanıcı Adı
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="melih"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 block">
                    E-posta Adresi
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder={animatedPlaceholder || 'ornek@aurum.app'}
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white placeholder:text-zinc-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 block">
                    Şifre
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="En az 8 karakter"
                      required
                      className="w-full pl-11 pr-11 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300 block">
                    Şifre Tekrar
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Şifrenizi tekrar giriniz"
                      required
                      className="w-full pl-11 pr-11 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Validation Checklist (4 Criteria) */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                  <span className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wider">
                    GÜVENLİ ŞİFRE KRİTERLERİ:
                  </span>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs">
                    <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${hasMinLength ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-zinc-600'}`}>
                        ✓
                      </div>
                      <span>En az 8 karakter</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${hasUpperCase ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-zinc-600'}`}>
                        ✓
                      </div>
                      <span>Büyük harf</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasLowerCase ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${hasLowerCase ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-zinc-600'}`}>
                        ✓
                      </div>
                      <span>Küçük harf</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400 font-semibold' : 'text-zinc-500'}`}>
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${hasNumber ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-zinc-600'}`}>
                        ✓
                      </div>
                      <span>Rakam</span>
                    </div>
                  </div>
                </div>

                {/* Register Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !isRegisterValid}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#F5D07A] via-[#E5B85C] to-[#D6A84F] hover:brightness-110 active:scale-[0.98] text-[#0A0A0C] font-black text-sm transition-all shadow-[0_4px_20px_rgba(229,184,92,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0A0A0C]" />
                  ) : (
                    <>
                      <span>Hesap Oluştur</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1.5">
                <div className="flex-1 border-t border-white/[0.08]" />
                <span className="text-[11px] font-medium text-zinc-500 tracking-wider">
                  veya
                </span>
                <div className="flex-1 border-t border-white/[0.08]" />
              </div>

              {/* Social Login Buttons in Register */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleOAuthClick('Google')}
                    className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google ile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuthClick('Apple')}
                    className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer active:scale-95"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.06 1.71-.93 2.73 1 .08 2.02-.48 2.64-1.23z" />
                    </svg>
                    <span>Apple ile</span>
                  </button>
                </div>
                <p className="text-[11px] text-center text-zinc-500">
                  Google veya Apple ile hesabınızı tek tıkla oluşturup profilinizi hemen özelleştirebilirsiniz.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
