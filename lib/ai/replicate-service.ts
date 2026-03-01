import Replicate from 'replicate';
import { StickerStyleConfig } from './sticker-styles';
import { StickerEmotion } from '../types';

/**
 * Service for generating stickers using FLUX model on Replicate
 */
export class ReplicateStickerService {
    private replicate: Replicate;

    constructor() {
        const token = process.env.REPLICATE_API_TOKEN;
        if (!token) {
            console.warn('[REPLICATE] REPLICATE_API_TOKEN is missing from environment variables!');
        }
        this.replicate = new Replicate({
            auth: token,
        });
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

            // --- Step 2: Automatic Background Removal ---
            console.log(`[DEBUG] Starting background removal for ${emotion}`);
            try {
                const bgRemovedOutput = await this.replicate.run(
                    "cjwbw/rembg:fb8a57bb21701c770572d89d42f354d7ade6819746616cd5ef9a41768ee579bc",
                    {
                        input: {
                            image: resultUrl
                        }
                    }
                );

                if (typeof bgRemovedOutput === 'string') {
                    console.log(`[DEBUG] Background removed successfully for ${emotion}`);
                    return bgRemovedOutput;
                } else if (Array.isArray(bgRemovedOutput) && bgRemovedOutput.length > 0) {
                    return bgRemovedOutput[0] as string;
                } else {
                    console.warn(`[WARN] Unexpected rembg output format, falling back to original:`, bgRemovedOutput);
                    return resultUrl;
                }
            } catch (bgError) {
                console.error(`[ERROR] Background removal failed for ${emotion}, falling back to original:`, bgError);
                return resultUrl; // Fallback to original if removal fails
            }

        } catch (error) {
            console.error('Replicate generation error:', error);
            throw error;
        }
    }

    /**
     * Start generating a sticker (Step 1 or Step 2)
     */
    async createPrediction(
        input: any,
        model: string = "fofr/face-to-sticker:764d4b1a9985834924c585040e3f019623832c3bb1278142838722c140411e74"
    ): Promise<string> {
        const prediction = await this.replicate.predictions.create({
            version: model.split(':')[1],
            input
        });
        return prediction.id;
    }

    /**
     * Get prediction status and result
     */
    async getPrediction(predictionId: string): Promise<{
        status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
        output: any;
        error: any;
    }> {
        const prediction = await this.replicate.predictions.get(predictionId);
        return {
            status: prediction.status as any,
            output: prediction.output,
            error: prediction.error
        };
    }

    /**
     * Build a comprehensive prompt for FLUX or DALL-E 3
     */
    public buildPrompt(style: StickerStyleConfig, emotion: StickerEmotion, isDalle: boolean = false): string {
        // Emotion-specific descriptions
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
