import { STICKER_EMOTIONS, StickerEmotion } from '../types';
import { STICKER_STYLES, StickerStyleKey } from './sticker-styles';
import { OpenAIStickerService } from './openai-service';

export interface GeneratedSticker {
    emotion: StickerEmotion;
    imageUrl: string;
    thumbnailUrl: string;
}

const PLACEHOLDER_COLORS: Record<StickerEmotion, string> = {
    laughing:     '#FFD93D',
    rolling_laugh:'#FF8C42',
    affectionate: '#FF9ECD',
    love_struck:  '#FF6B6B',
    thinking:     '#4ECDC4',
    winking:      '#9B59B6',
    pleading:     '#3498DB',
    blowing_kiss: '#E91E63',
    crying:       '#95A5A6',
};

function generatePlaceholderSVG(emotion: StickerEmotion): string {
    const color = PLACEHOLDER_COLORS[emotion];
    const emoji = {
        laughing:     '😂',
        rolling_laugh:'🤣',
        affectionate: '🥰',
        love_struck:  '😍',
        thinking:     '🤔',
        winking:      '😉',
        pleading:     '🥺',
        blowing_kiss: '😘',
        crying:       '😢',
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
            const openaiService = new OpenAIStickerService();
            const buffer = await openaiService.generateSticker(sourceImageUrl, style, emotion);
            imageUrl = `data:image/png;base64,${buffer.toString('base64')}`;
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
 * Generate stickers using OpenAI or fallback to placeholders
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
    return !!process.env.OPENAI_API_KEY;
}

