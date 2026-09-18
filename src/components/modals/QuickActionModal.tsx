import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Coins, ArrowDownLeft, ArrowUpRight, ArrowRightLeft, Target, ChevronRight } from 'lucide-react';

export type QuickActionType = 'asset' | 'income' | 'expense' | 'transfer' | 'goal';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (action: QuickActionType) => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions: {
    id: QuickActionType;
    title: string;
    description: string;
    icon: React.FC<{ className?: string }>;
    iconBg: string;
    badge: string;
  }[] = [
    {
      id: 'asset',
      title: 'Varlık / Birikim Ekle',
      description: 'Gram altın, çeyrek altın, döviz veya nakit TL ekleyin',
      icon: Coins,
      iconBg: 'bg-[#E5B85C]/15 text-[#F3C969] border-[#E5B85C]/30',
      badge: 'VARLIK',
    },
    {
      id: 'income',
      title: 'Gelir Girişi Yap',
      description: 'Maaş, prim, kira geliri veya ek kazançlarınızı kaydedin',
      icon: ArrowDownLeft,
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      badge: 'GELİR',
    },
    {
      id: 'expense',
      title: 'Gider Kaydet',
      description: 'Kira, faturalar, market ve diğer harcamalarınızı girin',
      icon: ArrowUpRight,
      iconBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      badge: 'GİDER',
    },
    {
      id: 'transfer',
      title: 'Para Transferi Yap',
      description: 'Banka ve nakit hesaplarınız arasında bakiye aktarın',
      icon: ArrowRightLeft,
      iconBg: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
      badge: 'TRANSFER',
    },
    {
      id: 'goal',
      title: 'Yeni Hedef Oluştur',
      description: 'Araba, konut peşinatı veya birikim hedefi planlayın',
      icon: Target,
      iconBg: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
      badge: 'HEDEF',
    },
  ];

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md rounded-[2.25rem] bg-[#121218] border border-white/10 p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(229,184,92,0.15)] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-[#E5B85C]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] relative z-10">
          <div>
            <h2 className="font-display text-lg font-bold text-white tracking-tight">
              Hızlı Finansal İşlem
            </h2>
            <p className="text-xs text-zinc-400">
              Gerçekleştirmek istediğiniz işlemi seçin
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action List */}
        <div className="space-y-2.5 pt-5 relative z-10">
          {actions.map((act) => {
            const IconComponent = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => onSelectAction(act.id)}
                className="w-full p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-[#E5B85C]/40 flex items-center justify-between gap-4 transition-all duration-200 group text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center border ${act.iconBg} shrink-0 group-hover:scale-105 transition-transform`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-[#F5D07A] transition-colors">
                        {act.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                      {act.description}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
};
