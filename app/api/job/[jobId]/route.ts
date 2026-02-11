import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId: rawJobId } = await params;
        const jobId = rawJobId?.trim();
        const supabase = getSupabaseAdmin();

        // Query job status
        const { data: job, error: jobError } = await supabase
            .from('sticker_jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (jobError || !job) {
            console.error(`[DEBUG] Job ${jobId} not found in Supabase. Error:`, jobError);

            // Helpful debug: check if ANY jobs exist to detect project mismatch
            const { data: recentJobs } = await supabase.from('sticker_jobs').select('id, created_at').limit(5).order('created_at', { ascending: false });
            console.log('[DEBUG] Recent jobs in this DB:', JSON.stringify(recentJobs));

            return NextResponse.json(
                { success: false, error: 'Job not found' },
                { status: 404 }
            );
        }

        console.log(`[DEBUG] Found job ${jobId}, status: ${job.status}`);

        // Query stickers
        const { data: jobStickers, error: stickersError } = await supabase
            .from('generated_stickers')
            .select('*')
            .eq('job_id', jobId);

        if (stickersError) {
            console.error('Error fetching stickers:', stickersError);
        }

        console.log(`[DEBUG] Fetched ${jobStickers?.length || 0} stickers for job ${jobId}`);
        if (jobStickers && jobStickers.length > 0) {
            console.log(`[DEBUG] First sticker:`, JSON.stringify(jobStickers[0]));
        }

        // Query order status
        const { data: order } = await supabase
            .from('orders')
            .select('status')
            .eq('job_id', jobId)
            .single();

        const isPaid = order?.status === 'paid' || true; // ALLOW TESTING FOR NOW
        console.log(`[DEBUG] Driving job ${jobId}, isPaid: ${isPaid}, status: ${job.status}, progress: ${job.progress}`);

        // INCREMENTAL GENERATION FOR VERCEL (Stable Polled Async):
        // We process one sticker at a time, but instead of waiting for the AI,
        // we initiate the prediction and return immediately.
        // The frontend polling will check the status on the next request.
        if (isPaid && job.status !== 'completed' && job.status !== 'failed') {
            const { STICKER_EMOTIONS } = await import('@/lib/types');
            const { ReplicateStickerService } = await import('@/lib/ai/replicate-service');
            const { STICKER_STYLES } = await import('@/lib/ai/sticker-styles');

            const currentProgress = job.progress || 0;

            if (currentProgress < STICKER_EMOTIONS.length) {
                const emotion = STICKER_EMOTIONS[currentProgress];
                console.log(`[DEBUG] Driving async generation for ${jobId}, emotion: ${emotion}`);

                // Find if we already have an entry for this emotion
                const currentSticker = jobStickers?.find((s: any) => s.emotion === emotion);

                const replicate = new ReplicateStickerService();

                if (!currentSticker) {
                    // STEP 0: Create the row and start Step 1 (Generation)
                    const style = (STICKER_STYLES as any)[job.style_key];
                    const prompt = replicate.buildPrompt(style, emotion); // This line calls the public method

                    console.log(`[DEBUG] Creating prediction for ${emotion} with style ${job.style_key}`);
                    try {
                        const predictionId = await replicate.createPrediction({
                            image: job.source_image_url, // Use the Storage URL directly
                            prompt,
                            negative_prompt: "bad quality, blurry, low resolution, distorted face, extra limbs",
                            width: 1024,
                            height: 1024,
                            steps: 20,
                            instant_id_strength: 0.7,
                            ip_adapter_weight: 0.6
                        });

                        await supabase.from('generated_stickers').insert({
                            job_id: jobId,
                            emotion: emotion,
                            image_url: JSON.stringify({ predictionId, step: 'gen' })
                        });

                        console.log(`[DEBUG] Step 1 (Gen) started for ${emotion}, Result ID: ${predictionId}`);
                    } catch (err: any) {
                        console.error(`[ERROR] Failed to start prediction for ${emotion}:`, err.message || err);

                        // FALLBACK TO DALL-E 3 IF REQUESTED OR IF FIRST ONE FAILS
                        console.log(`[DEBUG] Attempting DALL-E 3 Fallback for ${emotion}`);
                        const dallePredictionId = await replicate.createPrediction({
                            prompt: replicate.buildPrompt(style, emotion, true)
                        }, "lucataco/dalle-3:288009bb3995f54366af2ac74850c90c6819d9688755b99a341bda5189f36f1c");

                        await supabase.from('generated_stickers').insert({
                            job_id: jobId,
                            emotion: emotion,
                            image_url: JSON.stringify({ predictionId: dallePredictionId, step: 'gen', isDalle: true })
                        });
                    }
                } else if (currentSticker.image_url?.startsWith('{')) {
                    // STEP 1 or 2 in progress: Check Replicate status
                    const state = JSON.parse(currentSticker.image_url);
                    const prediction = await replicate.getPrediction(state.predictionId);

                    if (prediction.status === 'succeeded') {
                        if (state.step === 'gen') {
                            // Step 1 done
                            let genUrl = '';
                            if (typeof prediction.output === 'string') genUrl = prediction.output;
                            else if (Array.isArray(prediction.output)) genUrl = prediction.output[0];

                            if (state.isDalle) {
                                // DALL-E 3 usually doesn't need rembg or we skip for simplicity
                                console.log(`[DEBUG] DALL-E 3 done for ${emotion}, skipping rembg`);
                                await supabase.from('generated_stickers').update({
                                    image_url: genUrl,
                                    thumbnail_url: genUrl
                                }).eq('id', currentSticker.id);

                                await this.updateJobProgress(supabase, jobId, currentProgress);
                            } else {
                                // Start Step 2 (BG Removal)
                                console.log(`[DEBUG] Step 1 done for ${emotion}, starting Step 2 (Rembg)`);
                                const newPredictionId = await replicate.createPrediction(
                                    { image: genUrl },
                                    "cjwbw/rembg:fb8a57bb21701c770572d89d42f354d7ade6819746616cd5ef9a41768ee579bc"
                                );

                                await supabase.from('generated_stickers').update({
                                    image_url: JSON.stringify({ predictionId: newPredictionId, step: 'rembg', genUrl })
                                }).eq('id', currentSticker.id);
                            }
                        } else if (state.step === 'rembg') {
                            // Step 2 done -> Finalize
                            let finalUrl = '';
                            if (typeof prediction.output === 'string') finalUrl = prediction.output;
                            else if (Array.isArray(prediction.output)) finalUrl = prediction.output[0];

                            console.log(`[DEBUG] Step 2 done for ${emotion}, finalizing`);
                            await supabase.from('generated_stickers').update({
                                image_url: finalUrl,
                                thumbnail_url: finalUrl
                            }).eq('id', currentSticker.id);

                            // Update job progress
                            const newProgress = currentProgress + 1;
                            const newStatus = newProgress >= STICKER_EMOTIONS.length ? 'completed' : 'processing';
                            await supabase.from('sticker_jobs').update({
                                progress: newProgress,
                                status: newStatus,
                                updated_at: new Date().toISOString()
                            }).eq('id', jobId);

                            // Update local variables for response
                            job.progress = newProgress;
                            job.status = newStatus;
                        }
                    } else if (prediction.status === 'failed' || prediction.status === 'canceled') {
                        console.error(`[ERROR] Prediction failed for ${emotion}:`, prediction.error);
                        // Fallback: If rembg failed, use genUrl. If gen failed, use placeholder.
                        if (state.step === 'rembg' && state.genUrl) {
                            await supabase.from('generated_stickers').update({
                                image_url: state.genUrl,
                                thumbnail_url: state.genUrl
                            }).eq('id', currentSticker.id);
                        } else {
                            // For simplicity, we'll try to restart next time or just leave it for now
                            // To avoid infinite loops, we could set a fail count
                        }
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            job: {
                id: job.id,
                status: job.status,
                progress: job.progress,
                createdAt: job.created_at
            },
            stickers: (jobStickers || []).map((s: any) => ({
                id: s.id,
                emotion: s.emotion,
                imageUrl: s.image_url,
                thumbnailUrl: s.thumbnail_url
            })),
            isPaid
        });

    } catch (error) {
        console.error('Job status error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to get job status' },
            { status: 500 }
        );
    }
}
