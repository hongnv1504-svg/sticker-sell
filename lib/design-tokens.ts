/**
 * ============================================================
 *  DESIGN TOKENS — Single source of truth for all colors
 *  Style reference: awwwards.com
 *
 *  Awwwards aesthetic:
 *  – Mostly dark (#222) with white (#fff) contrast
 *  – Signature orange accent (#FA5D29)
 *  – Neutral grays dominate; color used sparingly
 *  – Category-coded accent colors (blue, mint, purple, yellow)
 *  – Clean editorial typography, high contrast
 *
 *  HOW TO USE:
 *    import { colors, gradients } from '@/lib/design-tokens'
 *  or use the CSS variables (var(--primary), etc.) in JSX/CSS
 *
 *  RULE: Never hardcode a color hex in a component.
 *        Always reference a token from this file or its
 *        corresponding CSS variable.
 * ============================================================
 */

// ─── RAW PALETTE (source of truth) ───────────────────────────
export const palette = {
    // --- Blacks & Darks (Awwwards neutrals) ---
    black:       '#000000',
    dark900:     '#111111',   // deepest surface
    dark800:     '#1a1a1a',   // page body background
    dark700:     '#222222',   // Awwwards primary dark text/bg
    dark600:     '#2a2a2a',   // card surface
    dark500:     '#333333',   // subtle dividers
    dark400:     '#3d3d3d',   // inactive borders

    // --- Whites & Lights ---
    white:       '#ffffff',
    light100:    '#f8f8f8',   // Awwwards secondary bg
    light200:    '#ededed',   // Awwwards border color
    light300:    '#dedede',   // Awwwards divider
    light400:    '#a7a7a7',   // Awwwards muted text

    // --- Awwwards Orange (primary accent) ---
    orange500:   '#FA5D29',   // Awwwards signature orange — main CTA
    orange400:   '#FF7A4D',   // hover / lighter
    orange300:   '#FF9667',   // Awwwards secondary orange
    orange100:   '#FFE4D9',   // tint on light bg

    // --- Category accent colors (Awwwards section themes) ---
    blue400:     '#49B3FC',   // Connect / Jobs
    blue300:     '#74bcff',
    mint400:     '#AAEEC4',   // Inspire
    mint300:     '#C8E4D3',
    purple500:   '#502bd8',   // Awards
    purple400:   '#6749d1',
    purple300:   '#917eda',
    yellow400:   '#FFF083',   // Learn
    yellow300:   '#CDC38B',

    // --- Status ---
    green:       '#10b981',
    amber:       '#f59e0b',
    red:         '#ef4444',
} as const;

// ─── SEMANTIC TOKENS ─────────────────────────────────────────
export const colors = {
    // Backgrounds — Awwwards light
    bg: {
        page:       palette.light100,         // #f8f8f8 body
        secondary:  '#f0f0f0',                // sections
        card:       palette.white,            // #ffffff cards
        elevated:   palette.white,            // modals, dropdowns
        glass:      'rgba(255,255,255,0.92)', // white glass
    },

    // Borders — Awwwards light gray
    border: {
        subtle:  palette.light200,         // #ededed
        default: palette.light300,         // #dedede
        muted:   '#cccccc',
        focus:   palette.orange500,        // orange focus ring
    },

    // Text — Awwwards dark editorial
    text: {
        primary:   palette.dark700,        // #222 headings/body
        secondary: palette.light400,       // #a7a7a7 subtext
        muted:     '#bbbbbb',              // placeholders/disabled
        inverted:  palette.white,          // text on dark surfaces
        accent:    palette.orange500,      // #FA5D29 links/highlights
    },

    // Brand / Interactive (Awwwards orange replaces purple)
    brand: {
        primary:      palette.orange500,   // main CTA
        primaryHover: palette.orange400,   // hover state
        primaryLight: palette.orange300,   // light variant
        primaryTint:  palette.orange100,   // very light tint
    },

    // Category accent palette (mirrors Awwwards sections)
    category: {
        connect: palette.blue400,
        inspire: palette.mint400,
        awards:  palette.purple500,
        learn:   palette.yellow400,
        jobs:    palette.blue300,
    },

    // Status
    status: {
        success: palette.green,
        warning: palette.amber,
        error:   palette.red,
    },
} as const;

// ─── GRADIENTS ───────────────────────────────────────────────
export const gradients = {
    // Awwwards orange CTA gradient
    primary: 'linear-gradient(135deg, #FA5D29 0%, #FF9667 100%)',

    // Subtle orange tint for cards
    card:    'linear-gradient(135deg, rgba(250,93,41,0.08) 0%, rgba(255,150,103,0.05) 100%)',

    // Ambient glow
    glow:    'radial-gradient(circle at 50% 50%, rgba(250,93,41,0.20) 0%, transparent 60%)',

    // Shimmer loading
    shimmer: 'linear-gradient(90deg, #222222 25%, #2a2a2a 50%, #222222 75%)',

    // Text gradient (orange)
    text:    'linear-gradient(135deg, #FA5D29 0%, #FF9667 100%)',

    // Dark hero bg
    hero:    'radial-gradient(ellipse at 60% 0%, rgba(250,93,41,0.15) 0%, transparent 50%), radial-gradient(ellipse at 10% 90%, rgba(73,179,252,0.10) 0%, transparent 50%)',
} as const;

// ─── SHADOWS ─────────────────────────────────────────────────
export const shadows = {
    sm:         '0 2px 8px rgba(0,0,0,0.40)',
    md:         '0 4px 20px rgba(0,0,0,0.50)',
    lg:         '0 8px 40px rgba(0,0,0,0.60)',
    glow:       '0 0 40px rgba(250,93,41,0.25)',   // orange glow
    glowStrong: '0 0 60px rgba(250,93,41,0.40)',
} as const;

// ─── BORDER RADIUS ───────────────────────────────────────────
export const radius = {
    none: '0px',
    sm:   '4px',    // Awwwards uses sharper corners
    md:   '8px',
    lg:   '12px',
    xl:   '20px',
    full: '9999px',
} as const;

// ─── TYPOGRAPHY ──────────────────────────────────────────────
export const typography = {
    fontFamily: "'Inter', system-ui, sans-serif",
    weights: {
        regular:   400,
        medium:    500,
        semibold:  600,
        bold:      700,
        extrabold: 800,
        black:     900,
    },
} as const;

// ─── EMOTION COLORS (sticker grid placeholders) ───────────────
export const emotionColors = {
    laughing:     '#FFD93D',
    rolling_laugh:'#FF8C42',
    affectionate: '#FF9ECD',
    love_struck:  '#FF6B6B',
    thinking:     '#49B3FC',  // Awwwards blue
    winking:      '#502bd8',  // Awwwards purple
    pleading:     '#74bcff',
    blowing_kiss: '#FA5D29',  // Awwwards orange
    crying:       '#a7a7a7',  // Awwwards gray
} as const;

// ─── TYPE EXPORTS ─────────────────────────────────────────────
export type PaletteKey    = keyof typeof palette;
export type ColorToken    = typeof colors;
export type GradientToken = keyof typeof gradients;
export type ShadowToken   = keyof typeof shadows;
export type RadiusToken   = keyof typeof radius;
