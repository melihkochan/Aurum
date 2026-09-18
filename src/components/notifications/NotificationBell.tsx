import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Target, 
  ArrowDownLeft, 
  ArrowUpRight, 
  TrendingUp, 
  AlertTriangle, 
  ShieldCheck, 
  Info, 
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import type { AppNotification, NotificationType } from '../../services/notification/types';

interface NotificationBellProps {
  onNavigateToNotifications?: () => void;
}

const TYPE_ICONS: Record<NotificationType, { icon: React.FC<{ className?: string }>; color: string; bg: string }> = {
  GOAL: { icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  INCOME: { icon: ArrowDownLeft, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  EXPENSE: { icon: ArrowUpRight, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
  PORTFOLIO: { icon: TrendingUp, color: 'text-[#F5C042]', bg: 'bg-[#E5B85C]/10 border-[#E5B85C]/20' },
  MARKET: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  SECURITY: { icon: ShieldCheck, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
  SYSTEM: { icon: Info, color: 'text-zinc-400', bg: 'bg-white/5 border-white/10' },
  REMINDER: { icon: Bell, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
};

export const NotificationBell: React.FC<NotificationBellProps> = ({ onNavigateToNotifications }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const renderIcon = (type: NotificationType) => {
    const conf = TYPE_ICONS[type] || TYPE_ICONS.SYSTEM;
    const Icon = conf.icon;
    return (
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${conf.bg} ${conf.color}`}>
        <Icon className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Bildirimler"
        className={`relative p-2.5 rounded-2xl transition-all cursor-pointer ${
          isOpen
            ? 'bg-[#E5B85C]/15 border border-[#E5B85C]/30 text-[#F5C042]'
            : 'bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-zinc-300 hover:text-white'
        }`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-[0_0_10px_rgba(244,63,94,0.6)] animate-in zoom-in-75">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Modern Notification Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-[2rem] bg-[#0E0F14]/95 border border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(229,184,92,0.06)] backdrop-blur-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Popover Header */}
          <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-white">
                BİLDİRİMLER
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E5B85C]/15 text-[#F5C042] border border-[#E5B85C]/30">
                  {unreadCount} yeni
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] text-zinc-400 hover:text-[#F5C042] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tümünü okundu yap</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto aurum-modern-scrollbar divide-y divide-white/[0.04]">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                Henüz kayıtlı bildirim bulunmuyor.
              </div>
            ) : (
              notifications.slice(0, 8).map((n: AppNotification) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-4 flex items-start gap-3 transition-colors cursor-pointer group ${
                    n.read ? 'bg-transparent hover:bg-white/[0.02]' : 'bg-[#E5B85C]/[0.035] hover:bg-[#E5B85C]/[0.06]'
                  }`}
                >
                  {renderIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-xs font-bold truncate ${n.read ? 'text-zinc-200' : 'text-white'}`}>
                        {n.title}
                      </h4>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-[#E5B85C] shadow-[0_0_6px_#E5B85C] shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-zinc-500 mt-1.5 block font-mono">
                      {n.createdAt}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Popover Footer */}
          <div className="p-3 bg-white/[0.015] border-t border-white/[0.06] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={clearAll}
              className="text-zinc-500 hover:text-rose-400 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Temizle</span>
            </button>

            {onNavigateToNotifications ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToNotifications();
                }}
                className="text-[#E5B85C] hover:text-white font-bold flex items-center gap-1 text-xs transition-colors cursor-pointer"
              >
                <span>Tüm bildirimleri gör</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            ) : (
              <span className="text-[11px] text-zinc-500">AURUM Anlık Bildirimler</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
