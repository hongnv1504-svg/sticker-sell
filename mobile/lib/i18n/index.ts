import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import vi from './locales/vi.json';

// Use Intl API — no native module required, works in all Expo environments
const deviceLang = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0] ?? 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
  },
  lng: deviceLang === 'vi' ? 'vi' : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  initImmediate: false, // force synchronous init — resources are in-memory
});

export default i18n;

// Maps STYLES[].id  →  translation key under "styles.*"
const STYLE_KEY_MAP: Record<string, string> = {
  '3d-cartoon':        '3dCartoon',
  'anime-kawaii':      'animeKawaii',
  'chibi-game':        'chibiGamer',
  'watercolor-soft':   'watercolor',
  'pop-art':           'popArt',
  'minimalist-line':   'minimalLine',
};

export const styleKey = (id: string): string => STYLE_KEY_MAP[id] ?? id;
