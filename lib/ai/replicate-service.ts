import Replicate from 'replicate';
import { StickerStyleConfig } from './sticker-styles';
import { StickerEmotion } from '../types';

/**
 * Service for generating stickers using FLUX model on Replicate
 */
export class ReplicateStickerService {
    private replicate: Replicate;

    constructor() {
        const apiKey = process.env.REPLICATE_API_TOKEN;
        if (!apiKey) {
            throw new Error('REPLICATE_API_TOKEN not configured');
        }
        this.replicate = new Replicate({ auth: apiKey });
    }

    /**
     * Generate a single sticker using FLUX
     */
    async generateSticker(
        sourceImageUrl: string,
        style: StickerStyleConfig,
        emotion: StickerEmotion
    ): Promise<string> {
        try {
            // Build the prompt combining style and emotion
            const prompt = this.buildPrompt(style, emotion);

            // Use face-to-sticker model for better likeness preservation
            const output = await this.replicate.run(
                "fofr/face-to-sticker:764d4b1a9985834924c585040e3f019623832c3bb1278142838722c140411e74",
                {
                    input: {
                        image: sourceImageUrl,
                        prompt: prompt,
                        negative_prompt: "bad quality, blurry, low resolution, distorted face, extra limbs",
                        width: 1024,
                        height: 1024,
                        steps: 20,
                        instant_id_strength: 0.7,
                        ip_adapter_weight: 0.6,
                        ip_adapter_noise: 0.5,
                        upscale: false,
                        upscale_steps: 10
                    }
                }
            );

            // Handle different output formats from Replicate
            console.log(`[DEBUG] Replicate output for ${emotion}:`, JSON.stringify(output));

            let resultUrl = '';

            if (typeof output === 'string') {
                resultUrl = output;
            } else if (Array.isArray(output) && output.length > 0) {
                const first = output[0];
                if (typeof first === 'string') {
                    resultUrl = first;
                } else if (first && typeof first === 'object') {
                    // Some Replicate models return File-like objects with a url() or toString() method
                    resultUrl = (first as any).url?.() || first.toString?.() || '';
                }
            }

            if (!resultUrl || resultUrl === '[object Object]') {
                console.error(`[ERROR] Failed to extract valid URL from Replicate output:`, output);
                throw new Error('Invalid image URL generated');
            }

            return resultUrl;

        } catch (error) {
            console.error('Replicate generation error:', error);
            throw error;
        }
    }

    /**
     * Build a comprehensive prompt for FLUX
     */
    private buildPrompt(style: StickerStyleConfig, emotion: StickerEmotion): string {
        // Emotion-specific descriptions
        const emotionDescriptions: Record<StickerEmotion, string> = {
            surprised: 'wide-eyed surprised expression, mouth open in shock, eyebrows raised high',
            annoyed: 'annoyed frustrated expression, furrowed brows, slight frown, eye roll',
            confused: 'confused puzzled expression, tilted head, questioning look, one eyebrow raised',
            frustrated: 'frustrated stressed expression, gritted teeth, tense face, exasperated look',
            happy: 'bright happy smile, joyful expression, sparkling eyes, cheerful demeanor',
            sarcastic: 'sarcastic smirk, knowing look, raised eyebrow, playful mocking expression',
            worried: 'worried anxious expression, concerned eyes, slight frown, nervous look',
            bored: 'bored uninterested expression, half-closed eyes, neutral mouth, disengaged look',
            curious: 'curious interested expression, wide attentive eyes, slight smile, engaged look'
        };

        const emotionDesc = emotionDescriptions[emotion];

        // Combine style base prompt with emotion in a more streamlined way for face-to-sticker
        const fullPrompt = `${style.basePrompt}
The character has ${emotionDesc}.
${style.emotionPromptTemplate}

Key Requirements:
- Maintain EXACT facial likeness from original photo
- Sticker cutout with white border
- High resolution, vibrant colors
- No text, no logos`;

        return fullPrompt;
    }

    /**
     * Check if Replicate API is configured
     */
    static isConfigured(): boolean {
        return !!process.env.REPLICATE_API_TOKEN;
    }
}
