import { STICKER_EMOTIONS, StickerEmotion } from '../types';
import { STICKER_STYLES, StickerStyleKey } from './sticker-styles';
import { ReplicateStickerService } from './replicate-service';

export interface GeneratedSticker {
    emotion: StickerEmotion;
    imageUrl: string;
    thumbnailUrl: string;
}

const PLACEHOLDER_COLORS: Record<StickerEmotion, string> = {
    surprised: '#FFD93D',
    annoyed: '#FF6B6B',
    confused: '#4ECDC4',
    frustrated: '#FF8C42',
    happy: '#6BCB77',
    sarcastic: '#9B59B6',
    worried: '#3498DB',
    bored: '#95A5A6',
    curious: '#E91E63'
};

function generatePlaceholderSVG(emotion: StickerEmotion): string {
    const color = PLACEHOLDER_COLORS[emotion];
    const emoji = {
        surprised: '😲',
        annoyed: '😒',
        confused: '🤔',
        frustrated: '😤',
        happy: '😊',
        sarcastic: '😏',
        worried: '😟',
        bored: '😑',
        curious: '🧐'
    }[emotion];

    const svg = `
  <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="90" fill="${color}" />
    <text x="100" y="115" font-size="80" text-anchor="middle">${emoji}</text>
  </svg>
  `;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate a single sticker for a specific emotion
 */
export async function generateSingleSticker(
    sourceImageUrl: string,
    styleKey: StickerStyleKey,
    emotion: StickerEmotion
): Promise<GeneratedSticker> {
    const style = STICKER_STYLES[styleKey];
    if (!style) throw new Error(`Sticker style not found: ${styleKey}`);

    const useAI = hasRealAIAPI();
    let imageUrl: string;

    if (useAI) {
        try {
            const replicateService = new ReplicateStickerService();
            imageUrl = await replicateService.generateSticker(sourceImageUrl, style, emotion);
            console.log(`Generated AI sticker for emotion: ${emotion}`);
        } catch (error) {
            console.error(`AI generation failed for ${emotion}, using placeholder:`, error);
            imageUrl = generatePlaceholderSVG(emotion);
        }
    } else {
        await delay(500 + Math.random() * 500);
        imageUrl = generatePlaceholderSVG(emotion);
    }

    return {
        emotion,
        imageUrl,
        thumbnailUrl: imageUrl
    };
}

/**
 * Generate stickers using AI (FLUX on Replicate) or fallback to placeholders
 */
export async function generateStickers(
    sourceImageUrl: string,
    styleKey: StickerStyleKey,
    onProgress?: (completed: number, total: number) => void
): Promise<GeneratedSticker[]> {
    const stickers: GeneratedSticker[] = [];

    for (let i = 0; i < STICKER_EMOTIONS.length; i++) {
        const emotion = STICKER_EMOTIONS[i];
        const sticker = await generateSingleSticker(sourceImageUrl, styleKey, emotion);
        stickers.push(sticker);
        onProgress?.(i + 1, STICKER_EMOTIONS.length);
    }

    return stickers;
}

export function hasRealAIAPI(): boolean {
    return !!process.env.REPLICATE_API_TOKEN;
}

