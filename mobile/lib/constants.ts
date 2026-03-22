export const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://www.stickermeapp.ink';

export const COLORS = {
  // Backgrounds — deep dark purple-black
  bg: '#16131E',       // near-black, purple undertone
  surface: '#1F1C2B',  // section backgrounds
  card: '#2B2739',     // cards, list items
  elevated: '#363348', // modals, bottom sheets

  // Borders
  border: '#3E3A52',   // subtle dividers

  // Text
  text: '#F2F8EF',          // Moon Mint — warm near-white
  textSecondary: '#B8BBD5', // Soft Lavender — labels, hints
  textMuted: '#9E9BB0',     // placeholders, disabled — 4.5:1 on bg

  // Accent / CTA — Warm Peach (pastel, not neon)
  primary: '#F9C5B1',  // Warm Peach — CTA buttons
  pink: '#E8B4C8',     // Soft Pink — tags, gradients

  // System
  success: '#30D158',
  error: '#FF453A',
  warning: '#FFB430',
  info: '#0A84FF',

  // Overlays (for image backgrounds)
  overlay: 'rgba(0,0,0,0.55)',
  overlayDark: 'rgba(0,0,0,0.72)',
};

export const FONTS = {
  regular: 'PlusJakartaSans_400Regular',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
  mono: 'SpaceMono_700Bold',
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screen: 16,
};

const CDN = 'https://www.stickermeapp.ink/stickers';

export interface StickerStyle {
  id: string;           // backend packId
  name: string;
  emoji: string;
  accent: string;       // per-style pastel accent color
  gradient: [string, string];
  desc: string;
  tag?: string;
  referenceImage: string; // real human photo — shown as hero on preview screen
  sampleImage: string;    // cartoon sticker preview (used in onboarding/home grid)
  expressions: Array<{ name: string; emoji: string; imageUrl: string }>;
}

export const STYLES: StickerStyle[] = [
  {
    id: '3d-cartoon',
    name: '3D Cartoon',
    emoji: '🎬',
    accent: '#F9C5B1',                        // Warm Peach — ấm, cute, friendly
    gradient: ['#F9C5B1', '#F0A898'],
    desc: 'Adorable 3D characters with big expressive eyes',
    tag: 'Most Popular',
    referenceImage: `${CDN}/3d-cartoon/reference.jpg`,
    sampleImage: `${CDN}/3d-cartoon/laughing.png`,
    expressions: [
      { name: 'Happy',   emoji: '😆', imageUrl: `${CDN}/3d-cartoon/laughing.png` },
      { name: 'Love',    emoji: '🥰', imageUrl: `${CDN}/3d-cartoon/affectionate.png` },
      { name: 'Thinking',emoji: '🤔', imageUrl: `${CDN}/3d-cartoon/thinking.png` },
      { name: 'Winking', emoji: '😉', imageUrl: `${CDN}/3d-cartoon/winking.png` },
      { name: 'Kiss',    emoji: '😘', imageUrl: `${CDN}/3d-cartoon/blowing_kiss.png` },
      { name: 'Sad',     emoji: '🥺', imageUrl: `${CDN}/3d-cartoon/crying.png` },
    ],
  },
  {
    id: 'anime-kawaii',
    name: 'Anime Kawaii',
    emoji: '🌸',
    accent: '#B8BBD5',                        // Soft Lavender — dreamy, Japanese vibes
    gradient: ['#B8BBD5', '#9B9DBF'],
    desc: 'Japanese anime style with sparkly eyes',
    referenceImage: `${CDN}/anime-kawaii/reference.jpg`,
    sampleImage: `${CDN}/anime-kawaii/laughing.png`,
    expressions: [
      { name: 'Happy',   emoji: '✨', imageUrl: `${CDN}/anime-kawaii/laughing.png` },
      { name: 'Love',    emoji: '💖', imageUrl: `${CDN}/anime-kawaii/affectionate.png` },
      { name: 'Thinking',emoji: '🎀', imageUrl: `${CDN}/anime-kawaii/thinking.png` },
      { name: 'Winking', emoji: '😊', imageUrl: `${CDN}/anime-kawaii/winking.png` },
      { name: 'Kiss',    emoji: '😘', imageUrl: `${CDN}/anime-kawaii/blowing_kiss.png` },
      { name: 'Sad',     emoji: '😢', imageUrl: `${CDN}/anime-kawaii/crying.png` },
    ],
  },
  {
    id: 'chibi-game',
    name: 'Chibi Gamer',
    emoji: '🎮',
    accent: '#C8E6C0',                        // Mint Green — gaming nhưng pastel
    gradient: ['#C8E6C0', '#A8CFA0'],
    desc: 'Gaming-inspired chibi with RPG vibes',
    referenceImage: `${CDN}/chibi-game/reference.jpg`,
    sampleImage: `${CDN}/chibi-game/laughing.png`,
    expressions: [
      { name: 'Happy',   emoji: '🏆', imageUrl: `${CDN}/chibi-game/laughing.png` },
      { name: 'Love',    emoji: '💎', imageUrl: `${CDN}/chibi-game/affectionate.png` },
      { name: 'Thinking',emoji: '🤔', imageUrl: `${CDN}/chibi-game/thinking.png` },
      { name: 'Winking', emoji: '😉', imageUrl: `${CDN}/chibi-game/winking.png` },
      { name: 'Kiss',    emoji: '😘', imageUrl: `${CDN}/chibi-game/blowing_kiss.png` },
      { name: 'Sad',     emoji: '🥺', imageUrl: `${CDN}/chibi-game/crying.png` },
    ],
  },
  {
    id: 'watercolor-soft',
    name: 'Watercolor',
    emoji: '🎨',
    accent: '#E8B4C8',                        // Soft Pink — romantic, dreamy
    gradient: ['#E8B4C8', '#D09AB0'],
    desc: 'Gentle watercolor with dreamy pastel vibes',
    referenceImage: `${CDN}/watercolor-soft/reference.jpg`,
    sampleImage: `${CDN}/watercolor-soft/laughing.png`,
    expressions: [
      { name: 'Happy',   emoji: '🌸', imageUrl: `${CDN}/watercolor-soft/laughing.png` },
      { name: 'Love',    emoji: '💐', imageUrl: `${CDN}/watercolor-soft/affectionate.png` },
      { name: 'Thinking',emoji: '🌿', imageUrl: `${CDN}/watercolor-soft/thinking.png` },
      { name: 'Winking', emoji: '🦋', imageUrl: `${CDN}/watercolor-soft/winking.png` },
      { name: 'Kiss',    emoji: '😘', imageUrl: `${CDN}/watercolor-soft/blowing_kiss.png` },
      { name: 'Sad',     emoji: '🌧️', imageUrl: `${CDN}/watercolor-soft/crying.png` },
    ],
  },
  {
    id: 'pop-art',
    name: 'Pop Art',
    emoji: '💥',
    accent: '#F5D5A0',                        // Soft Yellow — energetic nhưng mềm
    gradient: ['#F5D5A0', '#E0BE80'],
    desc: 'Bold comic book style with halftone dots',
    referenceImage: `${CDN}/pop-art/reference.jpg`,
    sampleImage: `${CDN}/pop-art/laughing.png`,
    expressions: [
      { name: 'Happy',   emoji: '😄', imageUrl: `${CDN}/pop-art/laughing.png` },
      { name: 'Love',    emoji: '💕', imageUrl: `${CDN}/pop-art/affectionate.png` },
      { name: 'Thinking',emoji: '💭', imageUrl: `${CDN}/pop-art/thinking.png` },
      { name: 'Winking', emoji: '😜', imageUrl: `${CDN}/pop-art/winking.png` },
      { name: 'Kiss',    emoji: '💋', imageUrl: `${CDN}/pop-art/blowing_kiss.png` },
      { name: 'Sad',     emoji: '😭', imageUrl: `${CDN}/pop-art/crying.png` },
    ],
  },
  {
    id: 'minimalist-line',
    name: 'Minimal Line',
    emoji: '✏️',
    accent: '#D0CDD4',                        // Cool Gray — neutral, elegant
    gradient: ['#D0CDD4', '#B0ADB4'],
    desc: 'Clean single-line art with elegant simplicity',
    tag: 'New',
    referenceImage: `${CDN}/minimalist-line/reference.jpg`,
    sampleImage: `${CDN}/minimalist-line/laughing.png`,
    expressions: [
      { name: 'Happy',   emoji: '😊', imageUrl: `${CDN}/minimalist-line/laughing.png` },
      { name: 'Love',    emoji: '🤍', imageUrl: `${CDN}/minimalist-line/affectionate.png` },
      { name: 'Thinking',emoji: '💭', imageUrl: `${CDN}/minimalist-line/thinking.png` },
      { name: 'Winking', emoji: '😉', imageUrl: `${CDN}/minimalist-line/winking.png` },
      { name: 'Kiss',    emoji: '🫦', imageUrl: `${CDN}/minimalist-line/blowing_kiss.png` },
      { name: 'Sad',     emoji: '😔', imageUrl: `${CDN}/minimalist-line/crying.png` },
    ],
  },
];

// One laughing image per style — used in onboarding burst & chat preview
export const SAMPLE_EXPRESSIONS = STYLES.map(s => ({
  name: s.name,
  imageUrl: s.sampleImage,
}));

export const RC_PACKAGES = [
  {
    productId: 'com.stickerme.credits_6',
    title: 'All 6 Styles',
    desc: '36 stickers • Every style',
    price: '$14.99',
    credits: 6,
    isAnchor: true,
  },
  {
    productId: 'com.stickerme.credits_3',
    title: '3 Style Packs',
    desc: '18 stickers • Pick any 3',
    price: '$6.99',
    credits: 3,
    isPopular: true,
    save: 'SAVE 22%',
  },
  {
    productId: 'com.stickerme.credits_1',
    title: '1 Style Pack',
    desc: '6 stickers • This style',
    price: '$2.99',
    credits: 1,
  },
];
