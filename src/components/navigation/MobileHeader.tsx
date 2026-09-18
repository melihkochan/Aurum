import React from 'react';
import { LayoutGrid, Plus } from 'lucide-react';

interface MobileHeaderProps {
  onOpenDrawer: () => void;
  onOpenAddModal?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onOpenDrawer, onOpenAddModal }) => {
  return (
    <header className="lg:hidden flex items-center justify-between px-5 py-4 sticky top-0 z-30 bg-[#070709]/80 border-b border-white/[0.06] backdrop-blur-2xl">
      {/* Left circular glass button (Reference 1 style 4-dots grid) */}
      <button
        onClick={onOpenDrawer}
        className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/[0.1] active:scale-95 transition-all cursor-pointer shadow-sm"
        aria-label="Menüyü Aç"
      >
        <LayoutGrid className="w-5 h-5" />
      </button>

      {/* Brand Center */}
      <div className="flex flex-col items-center">
        <span className="font-display font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
          AURUM <span className="text-[#F5C042] text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#E5B85C]/15 border border-[#E5B85C]/30">VAULT</span>
        </span>
        <span className="text-[10px] uppercase tracking-widest text-[#E5B85C] font-semibold">
          Altın & Varlık
        </span>
      </div>

      {/* Right circular glass action button */}
      <button
        onClick={onOpenAddModal}
        className="w-11 h-11 rounded-full bg-gradient-to-br from-[#F5D07A] via-[#E5B85C] to-[#C99539] flex items-center justify-center text-[#0A0A0C] shadow-[0_4px_16px_rgba(229,184,92,0.35)] active:scale-95 transition-all cursor-pointer"
        aria-label="Birikim Ekle"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
      </button>
    </header>
  );
};
