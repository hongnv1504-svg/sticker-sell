// Sticker Pack definitions
export interface StickerPack {
    id: string;
    name: string;
    description: string;
    style: string;
    styleKey: 'pixar3d' | 'anime_kawaii' | 'chibi_gamer' | 'watercolor_soft' | 'pop_art' | 'minimalist_line'; // Maps to AI style
    icon: string;
    previewEmojis: string[];
    price: number; // in cents
    popular?: boolean;
    colors: {
        primary: string;
        secondary: string;
    };
}

export const STICKER_PACKS: StickerPack[] = [
    {
        id: 'pixar-3d',
        name: 'Pixar 3D',
        description: 'Adorable Pixar-style 3D characters with big expressive eyes',
        style: 'Pixar-style 3D cartoon character, big eyes, chibi proportions, cute friendly',
        styleKey: 'pixar3d',
        icon: '🎬',
        previewEmojis: ['😊', '😲', '🤔', '😏', '😤', '😟', '😒', '😑', '🧐'],
        price: 499,
        popular: true,
        colors: {
            primary: '#8b5cf6',
            secondary: '#ec4899'
        }
    },
    {
        id: 'anime-kawaii',
        name: 'Anime Kawaii',
        description: 'Japanese anime style with sparkly eyes and kawaii expressions',
        style: 'Anime kawaii style, sparkling eyes, japanese manga, cute blush cheeks',
        styleKey: 'anime_kawaii',
        icon: '🌸',
        previewEmojis: ['✨', '💖', '🥺', '😍', '🎀', '💕', '🌟', '😊', '🍡'],
        price: 499,
        colors: {
            primary: '#f472b6',
            secondary: '#fb7185'
        }
    },
    {
        id: 'chibi-game',
        name: 'Chibi Gamer',
        description: 'Gaming-inspired chibi characters with RPG vibes',
        style: 'Chibi game character style, RPG hero, pixel-inspired, colorful gaming aesthetic',
        styleKey: 'chibi_gamer',
        icon: '🎮',
        previewEmojis: ['⚔️', '🛡️', '💎', '🔥', '⭐', '🎯', '🏆', '💪', '🎲'],
        price: 599,
        colors: {
            primary: '#22d3ee',
            secondary: '#a78bfa'
        }
    },
    {
        id: 'watercolor-soft',
        name: 'Watercolor Soft',
        description: 'Gentle watercolor art style with dreamy pastel vibes',
        style: 'Soft watercolor painting style, pastel colors, dreamy aesthetic, artistic brush strokes',
        styleKey: 'watercolor_soft',
        icon: '🎨',
        previewEmojis: ['🌈', '☁️', '🦋', '🌷', '💫', '🍃', '🌙', '💐', '🕊️'],
        price: 499,
        colors: {
            primary: '#86efac',
            secondary: '#67e8f9'
        }
    },
    {
        id: 'pop-art',
        name: 'Pop Art',
        description: 'Bold comic book style with vibrant colors and halftone dots',
        style: 'Pop art comic book style, bold colors, halftone dots, retro 60s aesthetic',
        styleKey: 'pop_art',
        icon: '💥',
        previewEmojis: ['💢', '💬', '⚡', '💣', '🔊', '👊', '💯', '🎉', '🌟'],
        price: 499,
        colors: {
            primary: '#f97316',
            secondary: '#eab308'
        }
    },
    {
        id: 'minimalist-line',
        name: 'Minimalist Line',
        description: 'Clean single-line art with elegant simplicity',
        style: 'Minimalist line art style, single continuous line, simple elegant, modern aesthetic',
        styleKey: 'minimalist_line',
        icon: '✏️',
        previewEmojis: ['〰️', '◯', '△', '□', '✦', '⬡', '◇', '○', '◎'],
        price: 399,
        colors: {
            primary: '#64748b',
            secondary: '#94a3b8'
        }
    }
];

// Get pack by ID
export function getPackById(id: string): StickerPack | undefined {
    return STICKER_PACKS.find(pack => pack.id === id);
}

// Get default pack
export function getDefaultPack(): StickerPack {
    return STICKER_PACKS.find(pack => pack.popular) || STICKER_PACKS[0];
}
