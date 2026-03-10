export const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://stickermeapp.ink';

export const COLORS = {
  bg: '#06060A',
  surface: '#111114',
  card: '#1A1A1F',
  elevated: '#222228',
  border: '#2A2A32',
  text: '#FFFFFF',
  textSecondary: '#999999',
  textMuted: '#555555',
  primary: '#845EF7',
  pink: '#FF6B9D',
  success: '#34C759',
  error: '#FF453A',
  warning: '#FFB432',
  info: '#0A84FF',
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
  screen: 18,
};

export interface StickerStyle {
  id: string;           // backend packId
  name: string;
  emoji: string;
  color: string;
  gradient: [string, string];
  desc: string;
  tag?: string;
  expressions: Array<{ name: string; emoji: string }>;
}

export const STYLES: StickerStyle[] = [
  {
    id: 'pixar-3d',
    name: '3D Cartoon',
    emoji: '🎬',
    color: '#FF6B9D',
    gradient: ['#FF6B9D', '#c44569'],
    desc: 'Adorable 3D characters with big expressive eyes',
    tag: 'Most Popular',
    expressions: [
      { name: 'Happy', emoji: '😆' },
      { name: 'Love', emoji: '🥰' },
      { name: 'Angry', emoji: '😤' },
      { name: 'Shocked', emoji: '😲' },
      { name: 'Cool', emoji: '😎' },
      { name: 'Sad', emoji: '🥺' },
    ],
  },
  {
    id: 'anime-kawaii',
    name: 'Anime Kawaii',
    emoji: '🌸',
    color: '#845EF7',
    gradient: ['#845EF7', '#5f3dc4'],
    desc: 'Japanese anime style with sparkly eyes',
    expressions: [
      { name: 'Happy', emoji: '✨' },
      { name: 'Love', emoji: '💖' },
      { name: 'Cute', emoji: '🎀' },
      { name: 'Blush', emoji: '😻' },
      { name: 'Star', emoji: '⭐' },
      { name: 'Smile', emoji: '😊' },
    ],
  },
  {
    id: 'chibi-game',
    name: 'Chibi Gamer',
    emoji: '🎮',
    color: '#20C997',
    gradient: ['#20C997', '#0ca678'],
    desc: 'Gaming-inspired chibi with RPG vibes',
    expressions: [
      { name: 'Attack', emoji: '⚔️' },
      { name: 'Shield', emoji: '🛡️' },
      { name: 'Win', emoji: '🏆' },
      { name: 'Fire', emoji: '🔥' },
      { name: 'Gem', emoji: '💎' },
      { name: 'Target', emoji: '🎯' },
    ],
  },
  {
    id: 'watercolor-soft',
    name: 'Watercolor',
    emoji: '🎨',
    color: '#F06595',
    gradient: ['#F06595', '#d6336c'],
    desc: 'Gentle watercolor with dreamy pastel vibes',
    expressions: [
      { name: 'Rainbow', emoji: '🌈' },
      { name: 'Cloud', emoji: '☁️' },
      { name: 'Leaf', emoji: '🌿' },
      { name: 'Butterfly', emoji: '🦋' },
      { name: 'Flower', emoji: '💐' },
      { name: 'Nature', emoji: '🍃' },
    ],
  },
  {
    id: 'pop-art',
    name: 'Pop Art',
    emoji: '💥',
    color: '#FD7E14',
    gradient: ['#FD7E14', '#e8590c'],
    desc: 'Bold comic book style with halftone dots',
    expressions: [
      { name: 'Pow', emoji: '💢' },
      { name: 'Zap', emoji: '⚡' },
      { name: 'Chat', emoji: '💬' },
      { name: 'Bang', emoji: '🎆' },
      { name: 'Punch', emoji: '👊' },
      { name: 'Star', emoji: '🌟' },
    ],
  },
  {
    id: 'minimalist-line',
    name: 'Minimal Line',
    emoji: '✏️',
    color: '#868E96',
    gradient: ['#868E96', '#495057'],
    desc: 'Clean single-line art with elegant simplicity',
    tag: 'New',
    expressions: [
      { name: 'Wave', emoji: '〰️' },
      { name: 'Circle', emoji: '○' },
      { name: 'Triangle', emoji: '△' },
      { name: 'Square', emoji: '□' },
      { name: 'Star', emoji: '✦' },
      { name: 'Ring', emoji: '◎' },
    ],
  },
];

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
