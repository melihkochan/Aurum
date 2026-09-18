import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  confirmVariant?: 'danger' | 'gold' | 'default';
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'Vazgeç',
  isDestructive = false,
  confirmVariant,
  onConfirm,
  onCancel,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (onClose) onClose();
        else if (onCancel) onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, onCancel]);

  if (!isOpen) return null;

  const handleCancel = () => {
    if (onClose) onClose();
    else if (onCancel) onCancel();
  };

  const isDanger = isDestructive || confirmVariant === 'danger';

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleCancel}
    >
      <div 
        className="w-full max-w-sm rounded-[1.75rem] bg-[#0E0E12] border border-white/[0.1] shadow-2xl p-6 space-y-5 text-center relative overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle background glow */}
        <div className={`absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl pointer-events-none ${
          isDanger ? 'bg-rose-500/20' : 'bg-[#E5B85C]/15'
        }`} />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleCancel}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          title="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="flex justify-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
            isDanger 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
              : 'bg-[#E5B85C]/10 border-[#E5B85C]/30 text-[#F5C042]'
          }`}>
            <AlertTriangle className="w-7 h-7" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <h3 className="text-base font-extrabold text-white tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 font-bold text-xs border border-white/[0.08] transition-all cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-lg cursor-pointer ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25'
                : 'bg-gradient-to-r from-[#F3C969] via-[#E5B85C] to-[#D6A84F] text-[#0A0A0C] hover:brightness-110 shadow-[0_4px_16px_rgba(229,184,92,0.3)]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

