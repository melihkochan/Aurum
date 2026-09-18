import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface GoldDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const GoldDrawer: React.FC<GoldDrawerProps> = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#080808]/75 backdrop-blur-md"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-xs sm:max-w-sm bg-[rgba(13,13,16,0.95)] border-l border-[rgba(255,255,255,0.08)] backdrop-blur-2xl shadow-2xl flex flex-col p-6 text-[#F8FAFC] relative"
            >
              {/* Top ambient gold glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#E5B85C]/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

              <div className="flex items-center justify-end mb-6 relative z-10">
                <button
                  onClick={onClose}
                  className="text-[#94A3B8] hover:text-[#F8FAFC] p-2 rounded-xl hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer"
                  aria-label="Menüyü Kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto relative z-10 flex flex-col justify-between">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
