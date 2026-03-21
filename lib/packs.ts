// Sticker Pack definitions
export interface StickerPack {
    id: string;
    name: string;
    description: string;
    style: string;
    styleKey: 'pixar3d' | 'anime_kawaii' | 'chibi_gamer' | 'watercolor_soft' | 'pop_art' | 'minimalist_line'; // Maps to AI style
    icon: string;
    previewEmojis: string[];
    sampleImage?: string; // path to a real sticker sample image
    price: number; // in cents
    popular?: boolean;
    colors: {
        primary: string;
        secondary: string;
    };
}

export const STICKER_PACKS: StickerPack[] = [
    {
        id: '3d-cartoon',
        name: '3D Cartoon',
        description: 'Biến ảnh selfie thành nhân vật 3D sống động. Bộ sticker biểu cảm siêu thực cho mọi cuộc trò chuyện.',
        style: '3D cartoon character, big eyes, chibi proportions, cute friendly',
        styleKey: 'pixar3d',
        icon: '🎬',
        previewEmojis: ['😂', '🥰', '🤔', '😉', '😘', '😢'],
        sampleImage: '/stickers/3d-cartoon/laughing.png',
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
        description: 'Hóa thân thành nhân vật Anime ngọt ngào, lung linh. Lựa chọn hoàn hảo cho các "fan cứng" Manga.',
        style: 'Anime kawaii style, sparkling eyes, japanese manga, cute blush cheeks',
        styleKey: 'anime_kawaii',
        icon: '🌸',
        previewEmojis: ['✨', '💖', '🎀', '💕', '🌟', '😊'],
        sampleImage: '/stickers/anime-kawaii/laughing.png',
        price: 499,
        colors: {
            primary: '#f472b6',
            secondary: '#fb7185'
        }
    },
    {
        id: 'chibi-game',
        name: 'Chibi Gamer',
        description: 'Tạo sticker Chibi phong cách Game RPG cực ngầu. Khẳng định cá tính riêng trong mọi group chat.',
        style: 'Chibi game character style, RPG hero, pixel-inspired, colorful gaming aesthetic',
        styleKey: 'chibi_gamer',
        icon: '🎮',
        previewEmojis: ['⚔️', '🛡️', '💎', '🔥', '⭐', '🎯'],
        sampleImage: '/stickers/chibi-game/laughing.png',
        price: 599,
        colors: {
            primary: '#22d3ee',
            secondary: '#a78bfa'
        }
    },
    {
        id: 'watercolor-soft',
        name: 'Watercolor Soft',
        description: 'Sticker màu nước nghệ thuật, mộng mơ. Tạo điểm nhấn tinh tế cho avatar và tin nhắn của bạn.',
        style: 'Soft watercolor painting style, pastel colors, dreamy aesthetic, artistic brush strokes',
        styleKey: 'watercolor_soft',
        icon: '🎨',
        previewEmojis: ['🌈', '☁️', '🦋', '🌷', '💫', '🍃'],
        sampleImage: '/stickers/watercolor-soft/laughing.png',
        price: 499,
        colors: {
            primary: '#86efac',
            secondary: '#67e8f9'
        }
    },
    {
        id: 'pop-art',
        name: 'Pop Art',
        description: 'Phong cách truyện tranh Mỹ rực rỡ, đầy năng lượng. Nổi bật và khác biệt trên mọi nền tảng.',
        style: 'Pop art comic book style, bold colors, halftone dots, retro 60s aesthetic',
        styleKey: 'pop_art',
        icon: '💥',
        previewEmojis: ['💢', '💬', '⚡', '💣', '🔊', '👊'],
        sampleImage: '/stickers/pop-art/laughing.png',
        price: 499,
        colors: {
            primary: '#f97316',
            secondary: '#eab308'
        }
    },
    {
        id: 'minimalist-line',
        name: 'Minimalist Line',
        description: 'Nghệ thuật đường nét tối giản, hiện đại. Vẻ đẹp thanh lịch, thời thượng cho bộ sticker của bạn.',
        style: 'Minimalist line art style, single continuous line, simple elegant, modern aesthetic',
        styleKey: 'minimalist_line',
        icon: '✏️',
        previewEmojis: ['〰️', '◯', '△', '□', '✦', '⬡'],
        sampleImage: '/stickers/minimalist-line/laughing.png',
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
