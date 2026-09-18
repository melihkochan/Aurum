import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Sayfa Başına Çık"
      title="Yukarı Çık"
      className="fixed right-5 sm:right-8 bottom-24 lg:bottom-8 z-40 w-11 h-11 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.15] hover:border-[#E5B85C]/60 text-zinc-300 hover:text-[#F5C042] backdrop-blur-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:shadow-[0_0_20px_rgba(229,184,92,0.3)] group"
    >
      <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
    </button>
  );
};
