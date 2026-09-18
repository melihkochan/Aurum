import React from 'react';

export type AvatarCategory =
  | 'all'
  | 'characters'
  | 'minimal'
  | 'gold'
  | 'geometric'
  | 'dark'
  | 'expressive';

export interface BeamAvatarDef {
  id: string;
  name: string;
  category: 'characters' | 'minimal' | 'gold' | 'geometric' | 'dark' | 'expressive';
  render: (maskId: string) => React.ReactNode;
}

export const AVATAR_CATEGORIES: { id: AvatarCategory; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'characters', label: 'Renkli Karakterler' },
  { id: 'minimal', label: 'Minimal Yüzler' },
  { id: 'gold', label: 'Gold & Siyah' },
  { id: 'geometric', label: 'Geometrik' },
  { id: 'dark', label: 'Koyu Tema' },
  { id: 'expressive', label: 'İfadeler' },
];

export const BEAM_AVATARS: BeamAvatarDef[] = [
  // ==========================================
  // 1. RENKLİ KARAKTERLER
  // ==========================================
  {
    id: 'beam-2',
    name: 'Obsidyen Turuncu',
    category: 'characters',
    render: (maskId: string) => (
      <svg fill="none" viewBox="0 0 36 36" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#FFFFFF" width="36" height="36" rx="72" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect fill="#ff7d10" width="36" height="36" />
          <rect fill="#0a0310" width="36" height="36" rx="6" transform="translate(5 -1) rotate(55 18 18) scale(1.1)" />
          <g transform="translate(7 -6) rotate(-5 18 18)">
            <path d="M15 20c2 1 4 1 6 0" fill="none" stroke="#FFFFFF" strokeLinecap="round" />
            <rect fill="#FFFFFF" width="1.5" height="2" rx="1" x="14" y="14" />
            <rect fill="#FFFFFF" width="1.5" height="2" rx="1" x="20" y="14" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 'beam-1',
    name: 'Sıcak Amber',
    category: 'characters',
    render: (maskId: string) => (
      <svg fill="none" viewBox="0 0 36 36" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#FFFFFF" width="36" height="36" rx="72" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect fill="#ff005b" width="36" height="36" />
          <rect fill="#ffb238" width="36" height="36" rx="6" transform="translate(9 -5) rotate(219 18 18) scale(1)" />
          <g transform="translate(4.5 -4) rotate(9 18 18)">
            <path d="M15 19c2 1 4 1 6 0" fill="none" stroke="#000000" strokeLinecap="round" />
            <rect fill="#000000" width="1.5" height="2" rx="1" x="10" y="14" />
            <rect fill="#000000" width="1.5" height="2" rx="1" x="24" y="14" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 'beam-3',
    name: 'Koyu Magenta',
    category: 'characters',
    render: (maskId: string) => (
      <svg fill="none" viewBox="0 0 36 36" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#FFFFFF" width="36" height="36" rx="72" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect fill="#0a0310" width="36" height="36" />
          <rect fill="#ff005b" width="36" height="36" rx="36" transform="translate(-3 7) rotate(227 18 18) scale(1.2)" />
          <g transform="translate(-3 3.5) rotate(7 18 18)">
            <path d="M13,21 a1,0.75 0 0,0 10,0" fill="#FFFFFF" />
            <rect fill="#FFFFFF" width="1.5" height="2" rx="1" x="12" y="14" />
            <rect fill="#FFFFFF" width="1.5" height="2" rx="1" x="22" y="14" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 'beam-4',
    name: 'Adaçayı Yeşili',
    category: 'characters',
    render: (maskId: string) => (
      <svg fill="none" viewBox="0 0 36 36" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#FFFFFF" width="36" height="36" rx="72" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect fill="#d8fcb3" width="36" height="36" />
          <rect fill="#89fcb3" width="36" height="36" rx="6" transform="translate(9 -5) rotate(219 18 18) scale(1)" />
          <g transform="translate(4.5 -4) rotate(9 18 18)">
            <path d="M15 19c2 1 4 1 6 0" fill="none" stroke="#000000" strokeLinecap="round" />
            <rect fill="#000000" width="1.5" height="2" rx="1" x="10" y="14" />
            <rect fill="#000000" width="1.5" height="2" rx="1" x="24" y="14" />
          </g>
        </g>
      </svg>
    ),
  },

  // ==========================================
  // 2. MİNİMAL YÜZLER
  // ==========================================
  {
    id: 'min-1',
    name: 'Zen Minimalist',
    category: 'minimal',
    render: (maskId: string) => (
      <svg fill="none" viewBox="0 0 36 36" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#FFFFFF" width="36" height="36" rx="72" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect fill="#1E1E24" width="36" height="36" />
          <circle cx="18" cy="18" r="13" fill="#2B2B36" />
          <g transform="translate(0 0)">
            <line x1="12" y1="16" x2="15" y2="16" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="21" y1="16" x2="24" y2="16" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 21c1 0.8 3 0.8 4 0" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 'min-2',
    name: 'Sakin Vizyon',
    category: 'minimal',
    render: (maskId: string) => (
      <svg fill="none" viewBox="0 0 36 36" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#FFFFFF" width="36" height="36" rx="72" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect fill="#12131C" width="36" height="36" />
          <rect fill="#1F2438" width="28" height="28" rx="10" transform="translate(4 4)" />
          <circle cx="13.5" cy="16" r="1.5" fill="#93C5FD" />
          <circle cx="22.5" cy="16" r="1.5" fill="#93C5FD" />
          <line x1="16" y1="21" x2="20" y2="21" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
    ),
  },

  // ==========================================
  // 3. GOLD & SİYAH AVATARLAR
  // ==========================================
  {
    id: 'gold-1',
    name: 'Aurum Gold & Noir',
    category: 'gold',
    render: (maskId: string) => (
      <svg fill="none" viewBox="0 0 36 36" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#FFFFFF" width="36" height="36" rx="72" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect fill="#0B0C10" width="36" height="36" />
          <rect fill="#E5B85C" width="36" height="36" rx="10" transform="translate(7 -2) rotate(42 18 18) scale(1.15)" />
          <rect fill="#1A1822" width="26" height="26" rx="8" transform="translate(5 5)" />
          <g transform="translate(5 -4) rotate(0 18 18)">
            <path d="M15 21c2 1 4 1 6 0" fill="none" stroke="#F5D07A" strokeWidth="1.5" strokeLinecap="round" />
            <rect fill="#F5D07A" width="2" height="2.5" rx="1" x="12" y="14" />
            <rect fill="#F5D07A" width="2" height="2.5" rx="1" x="22" y="14" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 'gold-2',
    name: 'Kraliyet Altını',
    category: 'gold',
    render: (maskId: string) => (
      <svg fill="none" viewBox="0 0 36 36" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#FFFFFF" width="36" height="36" rx="72" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect fill="#D4A340" width="36" height="36" />
          <rect fill="#120E08" width="36" height="36" rx="6" transform="translate(6 -3) rotate(200 18 18) scale(1.08)" />
          <g transform="translate(5 -4) rotate(5 18 18)">
            <path d="M15 20c2 1 4 1 6 0" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
            <rect fill="#FFFFFF" width="1.5" height="2" rx="1" x="12" y="14" />
            <rect fill="#FFFFFF" width="1.5" height="2" rx="1" x="22" y="14" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 'gold-3',
    name: 'Şampanya Noir',
    category: 'gold',
    render: (maskId: string) => (
      <svg fill="none" viewBox="0 0 36 36" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#FFFFFF" width="36" height="36" rx="72" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect fill="#18151D" width="36" height="36" />
          <circle cx="18" cy="18" r="14" fill="#241E12" stroke="#E5B85C" strokeWidth="2" />
          <g transform="translate(5 -4) rotate(0 18 18)">
            <path d="M15 21c2 0.8 4 0.8 6 0" fill="none" stroke="#F5D07A" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="13" cy="15" r="1.25" fill="#F5D07A" />
            <circle cx="23" cy="15" r="1.25" fill="#F5D07A" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 'gold-4',
    name: 'Titanyum Kasa',
    category: 'gold',
    render: (maskId: string) => (
      <svg fill="none" viewBox="0 0 36 36" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#FFFFFF" width="36" height="36" rx="72" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect fill="#181820" width="36" height="36" />
          <rect fill="#2D283E" width="36" height="36" rx="8" transform="translate(-4 6) rotate(135 18 18) scale(1.1)" />
          <g transform="translate(5 -4) rotate(0 18 18)">
            <path d="M14 20c2.5 1 5 1 7.5 0" fill="none" stroke="#E5B85C" strokeWidth="1.5" strokeLinecap="round" />
            <rect fill="#E5B85C" width="1.8" height="2.2" rx="1" x="12" y="14" />
            <rect fill="#E5B85C" width="1.8" height="2.2" rx="1" x="22" y="14" />
          </g>
        </g>
      </svg>
    ),
  },

  // ==========================================
  // 4. GEOMETRİK AVATARLAR
  // ==========================================
  {
    id: 'geo-1',
    name: 'Kobalt Finans',
    category: 'geometric',
    render: (maskId: string) => (
      <svg fill="none" viewBox="0 0 36 36" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#FFFFFF" width="36" height="36" rx="72" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect fill="#0284C7" width="36" height="36" />
          <rect fill="#0F172A" width="36" height="36" rx="8" transform="translate(7 -3) rotate(190 18 18) scale(1.05)" />
          <g transform="translate(4 -3) rotate(5 18 18)">
            <path d="M15 19c2 1.2 4 1.2 6 0" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
            <rect fill="#38BDF8" width="1.5" height="2" rx="1" x="11" y="14" />
            <rect fill="#38BDF8" width="1.5" height="2" rx="1" x="23" y="14" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 'geo-2',
    name: 'Zümrüt Rezerv',
    category: 'geometric',
    render: (maskId: string) => (
      <svg fill="none" viewBox="0 0 36 36" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#FFFFFF" width="36" height="36" rx="72" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect fill="#064E3B" width="36" height="36" />
          <rect fill="#022C22" width="36" height="36" rx="10" transform="translate(5 -1) rotate(60 18 18) scale(1.1)" />
          <g transform="translate(6 -5) rotate(2 18 18)">
            <path d="M15 19c2 1 4 1 6 0" fill="none" stroke="#34D399" strokeWidth="1.5" strokeLinecap="round" />
            <rect fill="#34D399" width="1.5" height="2" rx="1" x="12" y="14" />
            <rect fill="#34D399" width="1.5" height="2" rx="1" x="22" y="14" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 'geo-3',
    name: 'Kozmik Menekşe',
    category: 'geometric',
    render: (maskId: string) => (
      <svg fill="none" viewBox="0 0 36 36" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#FFFFFF" width="36" height="36" rx="72" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect fill="#581C87" width="36" height="36" />
          <rect fill="#1E0E33" width="36" height="36" rx="12" transform="translate(8 -4) rotate(120 18 18) scale(1.1)" />
          <g transform="translate(5 -4) rotate(-4 18 18)">
            <path d="M14 20c2.5 1 5 1 7.5 0" fill="none" stroke="#C084FC" strokeWidth="1.5" strokeLinecap="round" />
            <rect fill="#C084FC" width="1.5" height="2" rx="1" x="12" y="14" />
            <rect fill="#C084FC" width="1.5" height="2" rx="1" x="22" y="14" />
          </g>
        </g>
      </svg>
    ),
  },

  // ==========================================
  // 5. KOYU TEMA AVATARLARI
  // ==========================================
  {
    id: 'dark-1',
    name: 'Monokrom Minimal',
    category: 'dark',
    render: (maskId: string) => (
      <svg fill="none" viewBox="0 0 36 36" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#FFFFFF" width="36" height="36" rx="72" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect fill="#27272A" width="36" height="36" />
          <rect fill="#09090B" width="36" height="36" rx="6" transform="translate(8 -3) rotate(35 18 18) scale(1.1)" />
          <g transform="translate(5 -4) rotate(0 18 18)">
            <path d="M15 20c2 0.8 4 0.8 6 0" fill="none" stroke="#F4F4F5" strokeWidth="1.5" strokeLinecap="round" />
            <rect fill="#F4F4F5" width="1.5" height="2" rx="1" x="13" y="14" />
            <rect fill="#F4F4F5" width="1.5" height="2" rx="1" x="21" y="14" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 'dark-2',
    name: 'Karbon Çelik',
    category: 'dark',
    render: (maskId: string) => (
      <svg fill="none" viewBox="0 0 36 36" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#FFFFFF" width="36" height="36" rx="72" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect fill="#111217" width="36" height="36" />
          <circle cx="18" cy="18" r="14" fill="#1C1E26" stroke="#3F3F46" strokeWidth="1.5" />
          <g transform="translate(5 -4) rotate(0 18 18)">
            <path d="M14 21c2 1 6 1 8 0" fill="none" stroke="#A1A1AA" strokeWidth="1.5" strokeLinecap="round" />
            <rect fill="#A1A1AA" width="1.5" height="2" rx="1" x="12" y="14" />
            <rect fill="#A1A1AA" width="1.5" height="2" rx="1" x="22" y="14" />
          </g>
        </g>
      </svg>
    ),
  },

  // ==========================================
  // 6. EĞLENCELİ YÜZ İFADELERİ
  // ==========================================
  {
    id: 'exp-1',
    name: 'Göz Kırpan Yıldız',
    category: 'expressive',
    render: (maskId: string) => (
      <svg fill="none" viewBox="0 0 36 36" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#FFFFFF" width="36" height="36" rx="72" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect fill="#1E1328" width="36" height="36" />
          <rect fill="#A855F7" width="36" height="36" rx="12" transform="translate(7 -2) rotate(40 18 18) scale(1.1)" />
          <rect fill="#180B26" width="26" height="26" rx="8" transform="translate(5 5)" />
          <g transform="translate(5 -4)">
            {/* Winking eye */}
            <path d="M11 15c1-1 3-1 4 0" stroke="#F5D07A" strokeWidth="1.5" strokeLinecap="round" />
            {/* Open eye */}
            <circle cx="21" cy="15" r="1.5" fill="#F5D07A" />
            {/* Confident smile */}
            <path d="M13 19.5c2 2 6 2 8 0" stroke="#F5D07A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 'exp-2',
    name: 'Neşeli Rezerv',
    category: 'expressive',
    render: (maskId: string) => (
      <svg fill="none" viewBox="0 0 36 36" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
          <rect fill="#FFFFFF" width="36" height="36" rx="72" />
        </mask>
        <g mask={`url(#${maskId})`}>
          <rect fill="#161A22" width="36" height="36" />
          <rect fill="#0D9488" width="36" height="36" rx="8" transform="translate(-4 5) rotate(120 18 18) scale(1.1)" />
          <g transform="translate(5 -4)">
            <circle cx="12" cy="14.5" r="1.5" fill="#FFFFFF" />
            <circle cx="22" cy="14.5" r="1.5" fill="#FFFFFF" />
            <path d="M14 18.5c2 2.5 4 2.5 6 0" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </g>
        </g>
      </svg>
    ),
  },
];

export const getBeamAvatar = (id?: string): BeamAvatarDef => {
  const found = BEAM_AVATARS.find((a) => a.id === id);
  return found || BEAM_AVATARS[0]; // default beam-2 (obsidyen turuncu)
};
