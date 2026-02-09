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

            // Use FLUX 1.1 Pro for high-quality sticker generation
            const output = await this.replicate.run(
                "black-forest-labs/flux-1.1-pro",
                {
                    input: {
                        prompt: prompt,
                        aspect_ratio: "1:1",
                        output_format: "png",
                        output_quality: 100,
                        safety_tolerance: 2,
                        prompt_upsampling: true
                    }
                }
            );

            // FLUX returns a URL string
            if (typeof output === 'string') {
                return output;
            } else if (Array.isArray(output) && output.length > 0) {
                return output[0] as string;
            } else {
                throw new Error('Unexpected output format from FLUX');
            }

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

        // Combine style base prompt with emotion
        const fullPrompt = `${style.basePrompt}

Expression: ${emotionDesc}

${style.emotionPromptTemplate}

Additional requirements:
- High quality sticker design
- Clean transparent background (PNG)
- Professional character illustration
- Vibrant colors and sharp details
- Centered composition
- Sticker-ready format
- No text, no watermarks, no logos
- Single character only`;

        return fullPrompt;
    }

    /**
     * Check if Replicate API is configured
     */
    static isConfigured(): boolean {
        return !!process.env.REPLICATE_API_TOKEN;
    }
}
