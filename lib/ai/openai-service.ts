import OpenAI from 'openai';
import sharp from 'sharp';
import { StickerStyleConfig } from './sticker-styles';
import { StickerEmotion } from '../types';

/**
 * Service for generating stickers using OpenAI gpt-image-1.5
 *
 * gpt-image-1.5 supports:
 *  - background: 'transparent'  → native transparent PNG, no flood-fill needed
 *  - input_fidelity: 'high'     → preserves facial features from the source photo
 */
export class OpenAIStickerService {
    private openai: OpenAI;

    constructor() {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.warn('[OPENAI] OPENAI_API_KEY is missing from environment variables!');
        }
        this.openai = new OpenAI({ apiKey });
    }

    async generateSticker(
        sourceImageUrl: string,
        style: StickerStyleConfig,
        emotion: StickerEmotion
    ): Promise<Buffer> {
        const prompt = this.buildPrompt(style, emotion);

        // Fetch source image from Supabase Storage
        console.log(`[OPENAI] Fetching source image for ${emotion}...`);
        const imgResponse = await fetch(sourceImageUrl);
        if (!imgResponse.ok) {
            throw new Error(`Failed to fetch source image: ${imgResponse.status}`);
        }
        const arrayBuffer = await imgResponse.arrayBuffer();
        const imageFile = new File([arrayBuffer], 'source.png', { type: 'image/png' });

        console.log(`[OPENAI] Calling gpt-image-1.5 for emotion: ${emotion}`);
        const result = await this.openai.images.edit({
            model: 'gpt-image-1.5',
            image: imageFile,
            prompt,
            size: '1024x1024',
            background: 'transparent', // native transparency — no flood-fill needed
            output_format: 'png',      // required when background is transparent
            input_fidelity: 'high',    // preserve facial features from source photo
            quality: 'high',
        });

        const b64 = result.data?.[0]?.b64_json;
        if (!b64) {
            throw new Error('[OPENAI] No image data returned from API');
        }

        const pngBuffer = Buffer.from(b64, 'base64');

        // Resize + compress to Telegram sticker spec: 512×512, < 512KB
        return optimizeForTelegram(pngBuffer);
    }

    buildPrompt(style: StickerStyleConfig, emotion: StickerEmotion): string {
        const emotionDescriptions: Record<StickerEmotion, string> = {
            laughing:     'head slightly tilted back, tightly closed smiling eyes, wide open laughing mouth, energetic comic body movement',
            rolling_laugh:'leaning back dramatically, eyes squeezed shut, very wide open mouth, exaggerated laughing pose',
            affectionate: 'soft smile, glowing eyes, slight head tilt, hands gently close to chest',
            love_struck:  'big sparkling eyes, wide dreamy smile, forward-leaning excited posture',
            thinking:     'slight frown, eyes looking up or sideways, hand under chin, thoughtful head tilt',
            winking:      'one eye closed, playful smirk, confident relaxed posture',
            pleading:     'large glossy eyes, slightly raised inner eyebrows, small pout, hands close together near chest',
            blowing_kiss: 'puckered lips, soft closed eyes or gentle wink, hand near mouth in kiss gesture',
            crying:       'teary eyes, slightly downturned mouth, subtle slouched posture, emotional expression',
        };

        return `${style.basePrompt}
The character has ${emotionDescriptions[emotion]}.
${style.emotionPromptTemplate}

OUTPUT REQUIREMENTS (CRITICAL):
- The CHARACTER must be FULLY OPAQUE and FULLY COLORED — skin tones, hair, clothing, eyes, all body parts must have solid, vibrant colors. Do NOT make any part of the character transparent.
- ONLY the EXTERNAL BACKGROUND (the empty space around the character) should be transparent (alpha = 0).
- The character's skin, face, hands, and all body details must be clearly visible with proper colors.
- Clean cutout: the boundary between the character and the transparent background should be sharp and precise.
- No background scene, no floor, no shadows — only the character on a transparent background.
- Suitable for Telegram / WhatsApp sticker packs.`;
    }

    static isConfigured(): boolean {
        return !!process.env.OPENAI_API_KEY;
    }
}

/**
 * Resize to 512×512 and compress to < 512KB for Telegram stickers.
 */
async function optimizeForTelegram(buffer: Buffer): Promise<Buffer> {
    const resized = sharp(buffer).resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
    });

    // Pass 1: full-color PNG, max compression
    const fullColor = await resized.clone().png({ compressionLevel: 9 }).toBuffer();

    if (fullColor.byteLength <= 512 * 1024) {
        console.log(`[SHARP] ${Math.round(fullColor.byteLength / 1024)}KB ✓`);
        return fullColor;
    }

    // Pass 2: palette PNG-8 (256 colors) — much smaller, works well for cartoons
    console.warn(`[SHARP] Full-color too large (${Math.round(fullColor.byteLength / 1024)}KB), using palette mode`);
    const palette = await resized.clone().png({
        palette: true,
        colours: 256,
        compressionLevel: 9,
        dither: 0.5,
    }).toBuffer();

    console.log(`[SHARP] Palette mode: ${Math.round(palette.byteLength / 1024)}KB`);
    return palette;
}
