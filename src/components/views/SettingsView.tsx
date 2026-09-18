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
  KeyRound
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
  | 'security';

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

  const { user, updateProfile, logout } = useAuth();

  const [activeSection, setActiveSection] = useState<SettingsSectionId>('account');

  // Account editing states
  const [nameInput, setNameInput] = useState(user?.fullName || preferences.name || 'Melih KOÇHAN');
  const [usernameInput, setUsernameInput] = useState(user?.username || 'melih');
  const [emailInput, setEmailInput] = useState(user?.email || 'melih@aurum.app');
  const [avatar, setAvatar] = useState(user?.avatar || 'beam-2');
  const [avatarType, setAvatarType] = useState<AvatarType>(user?.avatarType || 'beam');
  const [avatarColor, setAvatarColor] = useState<AvatarColor>(user?.avatarColor || 'orange');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modals
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [loggedOutOtherDevices, setLoggedOutOtherDevices] = useState(false);

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

                {/* Theme Selector */}
                <div className="pt-6 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white block">Tema Modu</span>
                    <span className="text-xs text-zinc-400 mt-0.5 block">
                      AURUM koyu lüks tasarım standartlarına göre optimize edilmiştir
                    </span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[#E5B85C]">
                    Dark (Aktif)
                  </span>
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

      {/* Password Change Mock Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[#0E0F14] border border-white/[0.08] p-6 sm:p-8 space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#E5B85C]" />
              <span>Şifre Değiştir</span>
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 block">Mevcut Şifre</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 block">Yeni Şifre</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 8 karakter"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none"
                />
              </div>
            </div>

            {passwordSuccess && (
              <span className="text-xs text-emerald-400 font-bold block">
                ✓ Şifreniz başarıyla güncellendi!
              </span>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordSuccess(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Kapat
              </button>
              <button
                type="button"
                onClick={() => {
                  setPasswordSuccess(true);
                  setTimeout(() => {
                    setIsPasswordModalOpen(false);
                    setPasswordSuccess(false);
                  }, 1500);
                }}
                className="px-5 py-2 rounded-xl bg-[#E5B85C] hover:bg-[#F5C042] text-[#0A0A0C] text-xs font-bold transition-all cursor-pointer"
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
