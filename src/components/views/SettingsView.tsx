import React, { useState } from 'react';
import {
  User as UserIcon,
  Shield,
  Sliders,
  Lock,
  Database,
  Check,
  RotateCcw,
  Trash2,
  LogOut,
  Download,
  Smartphone,
  Globe,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Server,
  ExternalLink
} from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useAuth } from '../../context/AuthContext';
import { GoldSwitch } from '../ui/GoldSwitch';
import { UserAvatar } from '../ui/UserAvatar';
import { AvatarPicker } from '../auth/AvatarPicker';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import type { AvatarColor, AvatarType } from '../../services/auth/types';

export type SettingsSectionId =
  | 'account'
  | 'privacy'
  | 'market'
  | 'data'
  | 'security'
  | 'about';

interface SectionNavItem {
  id: SettingsSectionId;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: SectionNavItem[] = [
  { id: 'account', label: 'Kullanıcı Profili', icon: UserIcon },
  { id: 'privacy', label: 'Gizlilik ve Görünüm', icon: Shield },
  { id: 'market', label: 'Piyasa & Veri Tercihleri', icon: Sliders },
  { id: 'data', label: 'Hesap ve Veri Yönetimi', icon: Database },
  { id: 'security', label: 'Güvenlik', icon: Lock },
  { id: 'about', label: 'Hakkında & Gizlilik', icon: ShieldCheck, badge: 'Supabase' },
];

export const SettingsView: React.FC = () => {
  const {
    preferences,
    updatePreferences,
    togglePrivacy,
    resetToDemo,
    clearPortfolio,
    currencySymbol,
    marketStatus,
  } = usePortfolio();

  const { user, updateProfile, changePassword, logout } = useAuth();

  const [activeSection, setActiveSection] = useState<SettingsSectionId>('account');

  // Account editing states
  const [nameInput, setNameInput] = useState(user?.fullName || preferences.name || 'Melih KOÇHAN');
  const [usernameInput, setUsernameInput] = useState(user?.username || 'melih');
  const [emailInput, setEmailInput] = useState(user?.email || 'melih@aurum.app');
  const [avatar, setAvatar] = useState(user?.avatar || 'beam-2');
  const [avatarType, setAvatarType] = useState<AvatarType>(user?.avatarType || 'beam');
  const [avatarColor, setAvatarColor] = useState<AvatarColor>(user?.avatarColor || 'orange');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modals & Security
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loggedOutOtherDevices, setLoggedOutOtherDevices] = useState(false);

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', badgeClass: '', barColor: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return {
      score: 1,
      label: 'Zayıf',
      badgeClass: 'px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold',
      barColor: 'bg-rose-500'
    };
    if (score <= 3) return {
      score: 2,
      label: 'Orta',
      badgeClass: 'px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold',
      barColor: 'bg-amber-500'
    };
    return {
      score: 3,
      label: 'Güçlü & Güvenli',
      badgeClass: 'px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold',
      barColor: 'bg-emerald-500'
    };
  };

  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordSuccess(false);
    setPasswordError(null);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!oldPassword) {
      setPasswordError('Lütfen mevcut şifrenizi giriniz.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Yeni şifre en az 8 karakter uzunluğunda olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Yeni şifre ile şifre onayı birbiriyle eşleşmiyor.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword(oldPassword, newPassword);
      setPasswordSuccess(true);
      setTimeout(() => {
        handleClosePasswordModal();
      }, 1600);
    } catch (err: any) {
      setPasswordError(err?.message || 'Şifre güncellenirken bir hata oluştu.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        fullName: nameInput.trim(),
        name: nameInput.trim().split(' ')[0] || nameInput.trim(),
        username: usernameInput.trim().replace(/^@/, ''),
        email: emailInput.trim(),
        avatar,
        avatarType,
        avatarColor,
      });
      updatePreferences({ name: nameInput.trim() });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Profil güncellenemedi.');
    }
  };

  const handleExportData = () => {
    try {
      const exportObject = {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        user: user || {},
        preferences,
        holdings: localStorage.getItem('aurum_holdings_v2'),
        transactions: localStorage.getItem('aurum_transactions_v2'),
        accounts: localStorage.getItem('aurum_accounts_v1'),
        categories: localStorage.getItem('aurum_categories_v1'),
        recurring: localStorage.getItem('aurum_recurring_v1'),
        goals: localStorage.getItem('aurum_goals_v2'),
        notes: localStorage.getItem('aurum_notes_v1'),
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `aurum_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Veri dışa aktarılırken bir hata oluştu.');
    }
  };

  const handleDeleteAccount = () => {
    clearPortfolio();
    logout();
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-24 md:pb-16 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
          Ayarlar
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Kişisel profilinizi, gizlilik ve görünüm tercihlerinizi, piyasa verilerini ve güvenliğinizi yapılandırın.
        </p>
      </div>

      {/* Mobile Horizontal Navigation Tabs */}
      <div className="lg:hidden overflow-x-auto aurum-scrollbar pb-1">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] w-max">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${isActive
                    ? 'bg-[#E5B85C]/20 text-[#F5C042] border border-[#E5B85C]/30 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Desktop Left Sidebar (3 cols) + Right Content Panel (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ==================================================== */}
        {/* DESKTOP LEFT NAVIGATION SIDEBAR */}
        {/* ==================================================== */}
        <div className="hidden lg:flex lg:col-span-4 xl:col-span-3 flex-col gap-1.5 p-2 rounded-3xl bg-[#0C0D12] border border-white/[0.06] sticky top-6">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-4 py-2">
            AYARLAR MENÜSÜ
          </span>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer text-left group ${isActive
                    ? 'bg-gradient-to-r from-[#E5B85C]/15 to-[#E5B85C]/05 text-[#F5C042] border border-[#E5B85C]/30 shadow-[0_2px_12px_rgba(229,184,92,0.1)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-[#F5C042]' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-3.5 rounded-full bg-[#F5C042] shadow-[0_0_8px_#F5C042]" />
                )}
              </button>
            );
          })}
        </div>

        {/* ==================================================== */}
        {/* RIGHT ACTIVE CONTENT PANEL */}
        {/* ==================================================== */}
        <div className="col-span-1 lg:col-span-8 xl:col-span-9 space-y-6">

          {/* 1. HESAP (ACCOUNT) */}
          {activeSection === 'account' && (
            <div className="p-6 sm:p-8 rounded-[2rem] bg-[#0E0F14] border border-white/[0.06] space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-3.5">
                  <UserAvatar
                    avatar={avatar}
                    avatarType={avatarType}
                    avatarColor={avatarColor}
                    name={nameInput}
                    size="md"
                  />
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span>Kullanıcı Profili</span>
                    </h2>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Kişisel kasa kimliğinizi ve avatarınızı yönetin
                    </p>
                  </div>
                </div>

              </div>

              {/* Avatar Selector Section */}
              <AvatarPicker
                selectedAvatar={avatar}
                avatarType={avatarType}
                selectedColor={avatarColor}
                onSelectAvatar={(av, type) => {
                  setAvatar(av);
                  setAvatarType(type);
                }}
                onSelectColor={(col) => setAvatarColor(col)}
                name={nameInput}
              />

              {/* Edit Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t border-white/[0.06]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300 block">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300 block">
                      Kullanıcı Adı
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        required
                        placeholder="melih"
                        className="w-full pl-7 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-all"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-bold">@</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300 block">
                      E-posta Adresi
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {saveSuccess ? (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Değişiklikler başarıyla kaydedildi!</span>
                    </span>
                  ) : <span />}

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#F5D07A] to-[#E5B85C] text-[#0A0A0C] text-xs font-black hover:brightness-110 active:scale-95 transition-all shadow-[0_2px_12px_rgba(229,184,92,0.3)] cursor-pointer"
                  >
                    Değişiklikleri Kaydet
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. GİZLİLİK & GÖRÜNÜM (PRIVACY) */}
          {activeSection === 'privacy' && (
            <div className="p-6 sm:p-8 rounded-[2rem] bg-[#0E0F14] border border-white/[0.06] space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-white/[0.06]">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#E5B85C]" />
                  <span>Gizlilik & Görünüm</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Bakiye gizleme modu, gösterge para birimi ve tema tercihleri
                </p>
              </div>

              <div className="divide-y divide-white/[0.05] space-y-5">
                {/* Privacy Mode */}
                <div className="pt-2">
                  <GoldSwitch
                    isSelected={preferences.isBalanceHidden}
                    onValueChange={togglePrivacy}
                    label="Bakiye Gizleme Modu"
                    description={`Kalabalık ortamlarda veya paylaşım yaparken toplam bakiyeleri maskeler (${currencySymbol}••••••).`}
                  />
                </div>

                {/* Default Currency */}
                <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-sm font-bold text-white block">Varsayılan Para Birimi</span>
                    <span className="text-xs text-zinc-400 mt-0.5 block">
                      Tüm grafik ve göstergelerde kullanılan ana baz döviz kuru
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    {(['TRY', 'USD', 'EUR'] as const).map((curr) => {
                      const isSelected = preferences.currency === curr;
                      return (
                        <button
                          key={curr}
                          onClick={() => updatePreferences({ currency: curr })}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${isSelected
                              ? 'bg-gradient-to-r from-[#F5D07A] to-[#E5B85C] text-[#0A0A0C] shadow-sm'
                              : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                          {curr === 'TRY' ? '₺ TRY' : curr === 'USD' ? '$ USD' : '€ EUR'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Theme & Color Atmosphere Selector */}
                <div className="pt-6 space-y-3">
                  <div>
                    <span className="text-sm font-bold text-white block">Tema & Renk Atmosferi</span>
                    <span className="text-xs text-zinc-400 mt-0.5 block">
                      AURUM koyu lüks standartlarına göre optimize edilmiş ortam aydınlatması ve renk temaları
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {[
                      {
                        id: 'aurum-gold' as const,
                        name: 'Aurum Gold',
                        tag: 'Klasik Lüks',
                        desc: 'Derin obsidiyen ve sıcak altın ışıldaması',
                        orbColor: 'from-[#F3C969] via-[#E5B85C] to-[#B38728]',
                        borderActive: 'border-[#E5B85C] bg-[#E5B85C]/10',
                        accent: 'text-[#E5B85C]',
                      },
                      {
                        id: 'emerald-vault' as const,
                        name: 'Emerald Vault',
                        tag: 'Swiss Banking',
                        desc: 'Zümrüt yeşili servet ve fon atmosferi',
                        orbColor: 'from-emerald-400 via-emerald-500 to-teal-700',
                        borderActive: 'border-emerald-500 bg-emerald-500/10',
                        accent: 'text-emerald-400',
                      },
                      {
                        id: 'sapphire-night' as const,
                        name: 'Sapphire Night',
                        tag: 'Wall Street',
                        desc: 'Gece mavisi ve safir finans ambiyansı',
                        orbColor: 'from-sky-400 via-blue-500 to-indigo-700',
                        borderActive: 'border-sky-500 bg-sky-500/10',
                        accent: 'text-sky-400',
                      },
                      {
                        id: 'obsidian-oled' as const,
                        name: 'Obsidian OLED',
                        tag: 'Saf Karbon',
                        desc: 'Minimalist, pil dostu tam siyah derinlik',
                        orbColor: 'from-zinc-400 via-zinc-600 to-zinc-900',
                        borderActive: 'border-white/40 bg-white/5',
                        accent: 'text-white',
                      },
                    ].map((th) => {
                      const isSelected = (preferences.theme || 'aurum-gold') === th.id;
                      return (
                        <div
                          key={th.id}
                          onClick={() => updatePreferences({ theme: th.id })}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none flex items-center justify-between ${
                            isSelected
                              ? `${th.borderActive} shadow-[0_4px_20px_rgba(0,0,0,0.4)]`
                              : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${th.orbColor} p-0.5 shadow-md flex items-center justify-center shrink-0`}>
                              <div className="w-full h-full rounded-full bg-black/40 flex items-center justify-center">
                                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white">{th.name}</span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-white/[0.06] text-zinc-400 font-mono">
                                  {th.tag}
                                </span>
                              </div>
                              <span className="text-[11px] text-zinc-400 block mt-0.5">
                                {th.desc}
                              </span>
                            </div>
                          </div>

                          <div className={`w-2 h-2 rounded-full ${isSelected ? th.accent.replace('text-', 'bg-') : 'bg-transparent'}`} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* 4. PİYASA & VERİ (MARKET) */}
          {activeSection === 'market' && (
            <div className="p-6 sm:p-8 rounded-[2rem] bg-[#0E0F14] border border-white/[0.06] space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-white/[0.06]">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#E5B85C]" />
                  <span>Piyasa & Veri Ayarları</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Fiyat güncelleme sıklığı, canlı veri kaynakları ve API bağlantısı
                </p>
              </div>

              <div className="divide-y divide-white/[0.05] space-y-5">
                <div className="pt-2">
                  <GoldSwitch
                    isSelected={preferences.autoRefreshEnabled}
                    onValueChange={(val) => updatePreferences({ autoRefreshEnabled: val })}
                    label="Otomatik Fiyat Güncelleme"
                    description="Piyasa kurlarını ve portföy değerini arka planda periyodik olarak canlı yeniler."
                  />
                </div>

                <div className="pt-5 flex items-center justify-between text-xs text-zinc-400">
                  <div>
                    <span className="text-sm font-bold text-white block">API Durum Göstergesi</span>
                    <span className="text-xs text-zinc-400 mt-0.5 block">
                      Canlı piyasa beslemesinin mevcut durumu
                    </span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${marketStatus === 'live'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : marketStatus === 'updating'
                        ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                        : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                    }`}>
                    <span className="w-2 h-2 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                    <span>{marketStatus === 'live' ? 'CANLI' : marketStatus === 'updating' ? 'GÜNCELLENİYOR' : 'ÇEVRİMDIŞI'}</span>
                  </span>
                </div>

                <div className="pt-5 flex items-center justify-between text-xs text-zinc-400">
                  <span>Veri Kaynağı Entegrasyonu</span>
                  <span className="font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>TCMB & Serbest Piyasa (Kapalıçarşı)</span>
                  </span>
                </div>

                <div className="pt-5 flex items-center justify-between text-xs text-zinc-400">
                  <span>Son Başarılı Güncelleme</span>
                  <span className="font-mono text-zinc-300">18 Eylül 2026 • 23:15</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. HESAP VE VERİ YÖNETİMİ (DATA) */}
          {activeSection === 'data' && (
            <div className="p-6 sm:p-8 rounded-[2rem] bg-[#0E0F14] border border-white/[0.06] space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-white/[0.06]">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-[#E5B85C]" />
                  <span>Hesap ve Veri Yönetimi</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Verilerinizi dışa aktarın, sıfırlayın veya oturumunuzu sonlandırın
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Data */}
                <button
                  type="button"
                  onClick={handleExportData}
                  className="p-4 rounded-2xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.06] flex items-center gap-3.5 transition-all text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block group-hover:text-sky-400 transition-colors">
                      Verilerimi Dışa Aktar
                    </span>
                    <span className="text-xs text-zinc-400 mt-0.5 block">
                      Tüm kayıtları JSON olarak yedekleyin
                    </span>
                  </div>
                </button>

                {/* Reset to Demo */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Varsayılan demo portföy verileri yüklensin mi? Mevcut kayıtlar sıfırlanacaktır.')) {
                      resetToDemo();
                    }
                  }}
                  className="p-4 rounded-2xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.06] flex items-center gap-3.5 transition-all text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block group-hover:text-amber-400 transition-colors">
                      Demo Verilerini Yükle
                    </span>
                    <span className="text-xs text-zinc-400 mt-0.5 block">
                      Zengin örnek portföyü yeniden kurun
                    </span>
                  </div>
                </button>

                {/* Clear Portfolio */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Tüm portföy ve işlem kayıtları silinsin mi?')) {
                      clearPortfolio();
                    }
                  }}
                  className="p-4 rounded-2xl bg-rose-500/[0.03] hover:bg-rose-500/[0.08] border border-rose-500/20 flex items-center gap-3.5 transition-all text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-rose-400 block">
                      Portföyü Sıfırla
                    </span>
                    <span className="text-xs text-zinc-400 mt-0.5 block">
                      Boş durum testi için verileri temizler
                    </span>
                  </div>
                </button>

                {/* Logout */}
                <button
                  type="button"
                  onClick={logout}
                  className="p-4 rounded-2xl bg-white/[0.025] hover:bg-rose-500/[0.08] border border-white/[0.06] hover:border-rose-500/20 flex items-center gap-3.5 transition-all text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-rose-500/10 border border-white/10 group-hover:border-rose-500/20 flex items-center justify-center text-zinc-400 group-hover:text-rose-400 shrink-0 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white group-hover:text-rose-400 block transition-colors">
                      Oturumu Kapat
                    </span>
                    <span className="text-xs text-zinc-400 mt-0.5 block">
                      Hesabınızdan güvenli çıkış yapın
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* 5. GÜVENLİK (SECURITY) */}
          {activeSection === 'security' && (
            <div className="p-6 sm:p-8 rounded-[2rem] bg-[#0E0F14] border border-white/[0.06] space-y-6 animate-in fade-in">
              <div className="pb-4 border-b border-white/[0.06]">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#E5B85C]" />
                  <span>Güvenlik & Oturum Yönetimi</span>
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Şifre değiştirme, oturumları yönetme, cihazlardan çıkış ve hesap silme
                </p>
              </div>

              <div className="space-y-4">
                {/* 1. Password Change */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.025] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-sm font-bold text-white block">Hesap Şifresi</span>
                    <span className="text-xs text-zinc-400 mt-0.5 block">
                      Şifreniz en son 18 Eylül 2026 tarihinde güncellendi
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-bold text-zinc-200 hover:text-white transition-all cursor-pointer self-start sm:self-auto"
                  >
                    Şifreyi Değiştir
                  </button>
                </div>

                {/* 2. Oturumları Yönetme (Active Sessions) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.025] border border-white/[0.06] space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 block">
                        Aktif Oturumlar & Cihazlar
                      </span>
                      <span className="text-xs text-zinc-400 mt-0.5 block">
                        Hesabınıza şu anda bağlı olan doğrulanmış oturumlar
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      {loggedOutOtherDevices ? '1 Aktif Cihaz' : '3 Aktif Cihaz'}
                    </span>
                  </div>

                  {/* Device 1: Current Device */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <span>Bu Cihaz (Windows PC)</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                            Şu An Aktif
                          </span>
                        </span>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">
                          Chrome 128 · İstanbul, Türkiye · Son etkinlik: Bugün
                        </span>
                      </div>
                    </div>
                  </div>

                  {!loggedOutOtherDevices && (
                    <>
                      {/* Device 2: Mobile */}
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 shrink-0">
                            <Smartphone className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              Apple iPhone 15 Pro
                            </span>
                            <span className="text-[11px] text-zinc-400 block mt-0.5">
                              Safari Mobile · Son oturum: Bugün 19:42
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-medium">
                          Mobil Uygulama
                        </span>
                      </div>

                      {/* Device 3: Laptop */}
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 shrink-0">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">
                              Apple MacBook Air (M2)
                            </span>
                            <span className="text-[11px] text-zinc-400 block mt-0.5">
                              Chrome macOS · Son oturum: 17 Eylül
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-medium">
                          Tarayıcı
                        </span>
                      </div>
                    </>
                  )}

                  {/* 3. Tüm Cihazlardan Çıkış Butonu */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">
                      {loggedOutOtherDevices
                        ? '✓ Diğer tüm cihazlardaki oturumlar sonlandırıldı.'
                        : 'Bu cihaz dışındaki tüm aktif oturumları kapatın.'}
                    </span>
                    <button
                      type="button"
                      disabled={loggedOutOtherDevices}
                      onClick={() => {
                        setLoggedOutOtherDevices(true);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-400 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loggedOutOtherDevices ? 'Oturumlar Kapatıldı' : 'Tüm Diğer Cihazlardan Çıkış Yap'}
                    </button>
                  </div>
                </div>

                {/* 4. Hesabı Silme (Destructive) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/[0.03] border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-sm font-bold text-rose-400 block">Hesabımı ve Tüm Verilerimi Sil</span>
                    <span className="text-xs text-zinc-400 mt-0.5 block">
                      Bu işlem geri alınamaz. Kayıtlı tüm altın, döviz, hesap bakiyesi ve portföy geçmişiniz silinir.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDeleteAccountOpen(true)}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    Hesabımı Sil
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. HAKKINDA & GİZLİLİK (ABOUT & SECURITY) */}
          {activeSection === 'about' && (
            <div className="p-6 sm:p-8 rounded-[2rem] bg-[#0E0F14] border border-white/[0.06] space-y-6 animate-in fade-in">
              {/* Header Card with glowing gradient */}
              <div className="relative overflow-hidden p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#181824] via-[#0E0F14] to-[#0A0A0C] border border-[#E5B85C]/20 shadow-[0_10px_35px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#E5B85C]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F3C969] via-[#E5B85C] to-[#B38728] p-0.5 shadow-[0_0_25px_rgba(229,184,92,0.3)] shrink-0">
                      <div className="w-full h-full bg-[#0A0A0C] rounded-[14px] flex items-center justify-center">
                        <Sparkles className="w-7 h-7 text-[#E5B85C]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-black tracking-tight text-white font-display">
                          AURUM FINANCE
                        </h2>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#E5B85C]/15 border border-[#E5B85C]/30 text-[#F3C969]">
                          v2.4.0 Titanium
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                        Kişisel varlık, bütçe, altın, döviz ve nakit akışınızı banka standartlarında takip etmeniz için sıfırdan tasarlanmış yüksek güvenlikli yeni nesil finans yönetim platformu.
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Supabase Cloud Aktif
                    </span>
                  </div>
                </div>
              </div>

              {/* Güvenlik & Mimari Kartları */}
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#E5B85C]" />
                    Güvenlik Mimarisi & Veri Koruma
                  </h3>
                  <span className="text-[11px] text-zinc-500">Banka standartlarında şifreleme</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Supabase & RLS */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                        <Server className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Supabase & Row Level Security (RLS)</h4>
                        <span className="text-[10px] text-emerald-400/90 font-mono">İzole Veritabanı Mimarisi</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Verileriniz Supabase PostgreSQL altyapısında barındırılır. Her bir tablo <strong>Row Level Security (RLS)</strong> ilkeleriyle korunur; sistemdeki hiçbir kullanıcı sizin yetkilendirilmiş JWT oturumunuz olmadan portföyünüze, gelir/giderlerinize veya varlıklarınıza asla erişemez.
                    </p>
                  </div>

                  {/* Askeri Sınıf Şifreleme */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-[#E5B85C]/30 transition-all group">
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#E5B85C]/10 border border-[#E5B85C]/20 flex items-center justify-center text-[#E5B85C] group-hover:scale-105 transition-transform">
                        <Lock className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">AES-256 & TLS 1.3 Koruması</h4>
                        <span className="text-[10px] text-[#F3C969]/90 font-mono">Banka Seviyesinde İletim & Depolama</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Cihazınız ile sunucular arasındaki tüm veri akışı <strong>TLS 1.3</strong> protokolü ile şifrelenir. Disk üzerindeki veriler ve veritabanı yedekleri <strong>AES-256</strong> askeri sınıf şifreleme algoritmalarıyla kilit altında tutulur.
                    </p>
                  </div>

                  {/* Sıfır Bilgi Güvenliği */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-sky-500/30 transition-all group">
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                        <KeyRound className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Sıfır Bilgi (Zero-Knowledge) Parola Prensibi</h4>
                        <span className="text-[10px] text-sky-400/90 font-mono">Tek Yönlü Kriptografik Özetleme</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Parolalarınız sunucuda asla düz metin (plain-text) olarak saklanmaz. Güçlü tek yönlü özetleme fonksiyonlarıyla hash'lenir. Aurum geliştiricileri dahil olmak üzere hiç kimse parolanızı veya şifrelenmiş hassas kayıtlarınızı görüntüleyemez.
                    </p>
                  </div>

                  {/* Sıfır İzleyici & Reklamsız İlkeler */}
                  <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-rose-500/30 transition-all group">
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                        <Shield className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Sıfır İzleyici & Gizlilik Politikası</h4>
                        <span className="text-[10px] text-rose-400/90 font-mono">Reklamsız · Takipsiz · Şeffaf</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Aurum uygulamasında Google Analytics, Facebook Pixel veya üçüncü taraf reklam/izleme çerezleri kesinlikle bulunmaz. Finansal verileriniz asla ticari amaçla satılmaz veya üçüncü partilere aktarılmaz.
                    </p>
                  </div>
                </div>
              </div>

              {/* Veri Egemenliği & Haklarınız */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-[#E5B85C]" />
                  Veri Egemenliği ve Kullanıcı Hakları
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-xs font-bold text-white block">Tam Veri Sahipliği</span>
                    <span className="text-[11px] text-zinc-400 mt-1 block">
                      Girdiğiniz tüm nakit akışı, altın ve döviz kayıtları %100 size aittir.
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-xs font-bold text-white block">Anında Dışa Aktarma</span>
                    <span className="text-[11px] text-zinc-400 mt-1 block">
                      Verilerinizi dilediğiniz an JSON veya CSV formatında tek tıkla cihazınıza indirebilirsiniz.
                    </span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-xs font-bold text-white block">Unutulma Hakkı</span>
                    <span className="text-[11px] text-zinc-400 mt-1 block">
                      Hesabınızı sildiğinizde tüm verileriniz sunuculardan kalıcı ve geri dönülemez olarak yok edilir.
                    </span>
                  </div>
                </div>
              </div>

              {/* Proje & Geliştirici Bilgisi */}
              <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-zinc-400">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-zinc-300 font-semibold">Geliştirici & Mimari:</span>
                  <span className="text-white font-medium">Melih KOÇHAN</span>
                  <span className="text-zinc-600">·</span>
                  <a
                    href="https://www.melihkochan.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E5B85C] hover:text-[#F3C969] hover:underline inline-flex items-center gap-1 font-medium transition-colors"
                  >
                    <span>www.melihkochan.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-[11px] text-zinc-500">
                  © 2026 Aurum Finance Inc. Tüm hakları saklıdır.
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Hesabınızı ve Verilerinizi Silmek İstiyor Musunuz?"
        message="Bu işlem geri alınamaz. Kayıtlı tüm altın, döviz, hesap bakiyesi ve işlem geçmişi verileriniz tarayıcınızdan kalıcı olarak temizlenecektir."
        confirmText="Evet, Hesabımı Sil"
        cancelText="Vazgeç"
        isDestructive={true}
      />

      {/* Modern Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0E0F14] border border-white/[0.1] p-6 sm:p-8 space-y-5 shadow-[0_25px_70px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Top gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E5B85C] to-transparent opacity-70" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E5B85C]/10 border border-[#E5B85C]/20 flex items-center justify-center text-[#E5B85C]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Şifreyi Değiştir</h3>
                  <p className="text-[11px] text-zinc-400">Hesabınız için yeni ve güçlü bir parola belirleyin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClosePasswordModal}
                className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Mevcut Şifre */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 block">Mevcut Şifre</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Mevcut parolanızı girin"
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 transition-colors cursor-pointer"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Yeni Şifre */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 block">Yeni Şifre</label>
                  {newPassword && (
                    <span className={`text-[10px] ${getPasswordStrength(newPassword).badgeClass}`}>
                      {getPasswordStrength(newPassword).label}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="En az 8 karakter"
                    className="w-full pl-4 pr-11 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] focus:border-[#E5B85C]/60 text-sm text-white focus:outline-none transition-all placeholder:text-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 transition-colors cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength Meter Bar */}
                {newPassword && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      getPasswordStrength(newPassword).score >= 1
                        ? getPasswordStrength(newPassword).barColor
                        : 'bg-white/10'
                    }`} />
                    <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      getPasswordStrength(newPassword).score >= 2
                        ? getPasswordStrength(newPassword).barColor
                        : 'bg-white/10'
                    }`} />
                    <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      getPasswordStrength(newPassword).score >= 3
                        ? getPasswordStrength(newPassword).barColor
                        : 'bg-white/10'
                    }`} />
                  </div>
                )}
              </div>

              {/* Yeni Şifreyi Onayla */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 block">Yeni Şifreyi Onayla</label>
                  {confirmPassword && (
                    confirmPassword === newPassword ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Eşleşti
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Eşleşmiyor
                      </span>
                    )
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Yeni parolanızı tekrar girin"
                    className={`w-full pl-4 pr-11 py-2.5 rounded-xl bg-white/[0.03] border text-sm text-white focus:outline-none transition-all placeholder:text-zinc-600 ${
                      confirmPassword
                        ? confirmPassword === newPassword
                          ? 'border-emerald-500/50 focus:border-emerald-500'
                          : 'border-rose-500/50 focus:border-rose-500'
                        : 'border-white/[0.08] focus:border-[#E5B85C]/60'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-1 transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {/* Success Message */}
              {passwordSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Şifreniz başarıyla güncellendi!</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword || passwordSuccess || (confirmPassword !== '' && confirmPassword !== newPassword)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F3C969] via-[#E5B85C] to-[#D6A84F] text-[#0A0A0C] text-xs font-extrabold shadow-[0_4px_16px_rgba(229,184,92,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Güncelleniyor...</span>
                    </>
                  ) : (
                    <span>Şifreyi Güncelle</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
