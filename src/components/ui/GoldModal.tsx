import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface GoldModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}

export const GoldModal: React.FC<GoldModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  headerAction,
  children,
  maxWidth = 'max-w-lg',
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

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#080808]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`w-full ${maxWidth} bg-[rgba(15,15,18,0.92)] border border-[rgba(214,168,79,0.25)] rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(214,168,79,0.15)] relative z-10 overflow-hidden backdrop-blur-2xl`}
          >
            {/* Ambient Gold Glow Corner */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#E5B85C]/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.06)] relative z-10">
              <div className="flex items-center gap-3.5">
                {icon && <div className="shrink-0">{icon}</div>}
                <div>
                  <h3 className="text-xl font-bold text-[#F8FAFC] tracking-tight">{title}</h3>
                  {subtitle && <p className="text-xs sm:text-sm text-[#94A3B8] mt-0.5">{subtitle}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {headerAction}
                <button
                  onClick={onClose}
                  className="text-[#94A3B8] hover:text-[#F8FAFC] p-1.5 rounded-full hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
                  aria-label="Kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="mt-5 relative z-10">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
