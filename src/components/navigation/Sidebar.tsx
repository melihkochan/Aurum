import {
  LayoutDashboard,
  Wallet,
  Target,
  ArrowDownUp,
  ArrowLeftRight,
  PieChart,
  Settings,
  StickyNote,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../ui/UserAvatar';

export type NavTab = 
  | 'dashboard' 
  | 'portfolio' 
  | 'goals' 
  | 'income-expense'
  | 'transactions' 
  | 'analytics' 
  | 'notes' 
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user } = useAuth();
  const mainNavItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Finansal Panel', icon: LayoutDashboard },
    { id: 'portfolio', label: 'Varlıklar & Portföy', icon: Wallet },
    { id: 'goals', label: 'Birikim Hedefleri', icon: Target },
    { id: 'income-expense', label: 'Gelir & Gider', icon: ArrowDownUp },
    { id: 'transactions', label: 'İşlem Geçmişi', icon: ArrowLeftRight },
    { id: 'analytics', label: 'Detaylı Analiz', icon: PieChart },
    { id: 'notes', label: 'Notlar & Yapılacaklar', icon: StickyNote },
  ];

  return (
    <aside className="hidden lg:flex flex-col justify-between items-center fixed left-0 top-0 bottom-0 w-20 h-screen py-6 px-3 bg-[#09090D]/95 border-r border-white/[0.06] backdrop-blur-2xl z-40 select-none">
      {/* Top Section: Brand Emblem & Main Navigation */}
      <div className="flex flex-col items-center gap-7 w-full">
        {/* Brand Icon */}
        <div
          onClick={() => onSelectTab('dashboard')}
          className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#F5D07A] via-[#E5B85C] to-[#A06C18] p-0.5 shadow-[0_6px_22px_rgba(229,184,92,0.4)] cursor-pointer hover:scale-105 active:scale-95 transition-all overflow-hidden"
          title="Aurum Vault"
        >
          <img src="/gorseller/logo.png" alt="Aurum Vault" className="w-full h-full object-cover rounded-[14px]" />
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-2.5 w-full">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <div key={item.id} className="relative group flex items-center justify-center">
                <button
                  onClick={() => onSelectTab(item.id)}
                  aria-label={item.label}
                  className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-br from-[#E5B85C]/25 to-[#E5B85C]/5 text-[#F5C042] border border-[#E5B85C]/40 shadow-[0_0_24px_rgba(229,184,92,0.25)] scale-105'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-[#F5C042] stroke-[2.5]' : 'text-zinc-400 stroke-[1.75]'
                    }`}
                  />
                  {/* Active indicator pill */}
                  {isActive && (
                    <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-4 rounded-r-full bg-[#F5C042] shadow-[0_0_8px_#F5C042]" />
                  )}
                </button>

                {/* Hover Tooltip Pill */}
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#14141C] text-white text-xs font-semibold rounded-xl border border-white/[0.08] shadow-2xl opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Settings right above Profile */}
      <div className="flex flex-col items-center gap-3 w-full pt-4 border-t border-white/[0.06]">
        {/* Settings Icon Button */}
        <div className="relative group flex items-center justify-center">
          <button
            onClick={() => onSelectTab('settings')}
            aria-label="Ayarlar"
            className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-gradient-to-br from-[#E5B85C]/25 to-[#E5B85C]/5 text-[#F5C042] border border-[#E5B85C]/40 shadow-[0_0_24px_rgba(229,184,92,0.25)] scale-105'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
            }`}
          >
            <Settings
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                currentTab === 'settings' ? 'text-[#F5C042] stroke-[2.5]' : 'text-zinc-400 stroke-[1.75]'
              }`}
            />
            {currentTab === 'settings' && (
              <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-4 rounded-r-full bg-[#F5C042] shadow-[0_0_8px_#F5C042]" />
            )}
          </button>
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#14141C] text-white text-xs font-semibold rounded-xl border border-white/[0.08] shadow-2xl opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-50">
            Ayarlar
          </div>
        </div>

        {/* Profile Avatar at the very bottom */}
        <div className="relative group flex items-center justify-center">
          <button
            onClick={() => onSelectTab('settings')}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] hover:border-[#E5B85C]/40 flex items-center justify-center transition-all cursor-pointer overflow-hidden p-0.5"
            aria-label="Profil ve Ayarlar"
          >
            <UserAvatar
              avatar={user?.avatar}
              avatarType={user?.avatarType}
              avatarColor={user?.avatarColor}
              name={user?.name || 'M'}
              size="sm"
            />
          </button>
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#14141C] text-white text-xs font-semibold rounded-xl border border-white/[0.08] shadow-2xl opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap z-50">
            {user?.name || 'Melih'} • Profil & Ayarlar
          </div>
        </div>
      </div>
    </aside>
  );
};
