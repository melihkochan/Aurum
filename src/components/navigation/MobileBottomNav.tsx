import React from 'react';
import { LayoutDashboard, Wallet, Plus, Target, Menu } from 'lucide-react';
import type { NavTab } from './Sidebar';

interface MobileBottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenAddModal: () => void;
  onOpenDrawer: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  onOpenDrawer,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0A0A0E]/90 border-t border-white/[0.08] backdrop-blur-3xl px-4 py-2.5 pb-safe">
      <div className="flex items-center justify-around relative max-w-lg mx-auto">
        {/* Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            currentTab === 'dashboard' ? 'text-[#F5C042]' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className={`w-5 h-5 ${currentTab === 'dashboard' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] font-semibold">Panel</span>
        </button>

        {/* Portfolio */}
        <button
          onClick={() => onSelectTab('portfolio')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            currentTab === 'portfolio' ? 'text-[#F5C042]' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Wallet className={`w-5 h-5 ${currentTab === 'portfolio' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] font-semibold">Portföy</span>
        </button>

        {/* Center Floating + Button */}
        <div className="relative -top-5">
          <button
            onClick={onOpenAddModal}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F5D07A] via-[#E5B85C] to-[#B88532] text-[#0A0A0C] flex items-center justify-center shadow-[0_10px_30px_rgba(229,184,92,0.45)] border-4 border-[#070709] active:scale-95 transition-all cursor-pointer"
            aria-label="İşlem Ekle"
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </button>
        </div>

        {/* Goals */}
        <button
          onClick={() => onSelectTab('goals')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all cursor-pointer ${
            currentTab === 'goals' ? 'text-[#F5C042]' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Target className={`w-5 h-5 ${currentTab === 'goals' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] font-semibold">Hedefler</span>
        </button>

        {/* More / Menu */}
        <button
          onClick={onOpenDrawer}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5 stroke-[1.75]" />
          <span className="text-[10px] font-semibold">Menü</span>
        </button>
      </div>
    </div>
  );
};

