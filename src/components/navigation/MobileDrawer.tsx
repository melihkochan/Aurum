import {
  LayoutDashboard,
  Wallet,
  Target,
  ArrowDownUp,
  ArrowLeftRight,
  PieChart,
  Settings,
  StickyNote,
  ShieldCheck,
  RotateCcw,
  Trash2,
  LogOut,
} from 'lucide-react';
import { GoldDrawer } from '../ui/GoldDrawer';
import type { NavTab } from './Sidebar';
import { usePortfolio } from '../../context/PortfolioContext';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../ui/UserAvatar';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
}) => {
  const { resetToDemo, clearPortfolio } = usePortfolio();
  const { user, logout } = useAuth();

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onClose();
  };

  const navLinks: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Finansal Panel', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Varlıklar & Portföy', icon: Wallet },
    { id: 'goals', label: 'Birikim Hedefleri', icon: Target },
    { id: 'income-expense', label: 'Gelir & Gider', icon: ArrowDownUp },
    { id: 'transactions', label: 'İşlem Geçmişi', icon: ArrowLeftRight },
    { id: 'analytics', label: 'Detaylı Analiz', icon: PieChart },
    { id: 'notes', label: 'Notlar & Yapılacaklar', icon: StickyNote },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
  ];


  return (
    <GoldDrawer isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        {/* User Profile Card */}
        <div 
          onClick={() => handleNavClick('settings')}
          className="p-4 rounded-2xl bg-gradient-to-br from-[rgba(229,184,92,0.12)] to-[rgba(255,255,255,0.02)] border border-[rgba(214,168,79,0.25)] flex items-center gap-3 cursor-pointer hover:border-[#E5B85C]/50 transition-colors"
        >
          <UserAvatar
            avatar={user?.avatar}
            avatarType={user?.avatarType}
            avatarColor={user?.avatarColor}
            name={user?.name || 'M'}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold text-[#F8FAFC] truncate">{user?.name || 'Melih'}</div>
            <div className="text-xs text-[#E5B85C] flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Kişisel Altın & Varlık Portföyü</span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] px-3">
            MENÜ
          </span>
          <div className="space-y-1 mt-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[rgba(229,184,92,0.15)] text-[#F3C969] border border-[rgba(229,184,92,0.3)]'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[rgba(255,255,255,0.04)] border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F3C969]' : 'text-[#64748B]'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Testing & Data Actions */}
        <div className="space-y-1 pt-2 border-t border-[rgba(255,255,255,0.06)]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] px-3">
            VERİ YÖNETİMİ
          </span>
          <div className="space-y-1 mt-1">
            <button
              onClick={() => {
                resetToDemo();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[rgba(255,255,255,0.04)] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#38BDF8]" />
              <span>Demo Verilerini Yükle</span>
            </button>
            <button
              onClick={() => {
                clearPortfolio();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-[#F87171] hover:bg-[rgba(239,68,68,0.08)] cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Portföyü Temizle (Boş Durum Testi)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="pt-6 border-t border-[rgba(255,255,255,0.06)]">
        <button
          onClick={() => {
            onClose();
            logout();
          }}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-[#94A3B8] hover:text-[#EF4444] hover:bg-[rgba(239,68,68,0.1)] transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Güvenli Çıkış</span>
        </button>
      </div>
    </GoldDrawer>
  );
};
