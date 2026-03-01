import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

// Allow up to 5 minutes — needs Vercel Pro (60s) or higher.
// On Hobby (10s), this endpoint will be called but generation continues
// via the background fetch keepalive mechanism.
export const maxDuration = 300;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    const { jobId } = await params;
    const supabase = getSupabaseAdmin();

    // Mark job as processing
    await supabase
        .from('sticker_jobs')
        .update({ status: 'processing' })
        .eq('id', jobId);

    try {
        const { data: job } = await supabase
            .from('sticker_jobs')
            .select('source_image_url, style_key')
            .eq('id', jobId)
            .single();

        if (!job) {
            return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
        }

        const { STICKER_EMOTIONS } = await import('@/lib/types');
        const { STICKER_STYLES } = await import('@/lib/ai/sticker-styles');
        const { OpenAIStickerService } = await import('@/lib/ai/openai-service');

        const style = (STICKER_STYLES as any)[job.style_key];
        const openai = new OpenAIStickerService();

        console.log(`[GENERATE] Starting parallel generation for job ${jobId}, ${STICKER_EMOTIONS.length} stickers`);

        // Helper: detect if an error is a rate-limit (429) from OpenAI
        function isRateLimit(err: any): boolean {
            return err?.status === 429 || err?.message?.includes('429') || err?.message?.toLowerCase().includes('rate limit');
        }

        // Helper: generate + upload one sticker, with smart retry for rate limits
        const MAX_RETRIES = 3;
        async function generateOne(emotion: string): Promise<{ emotion: string; success: boolean; error?: string }> {
            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    if (attempt > 1) {
                        // Rate limit → wait longer; other errors → shorter back-off
                        const wait = isRateLimit(lastErr) ? 15000 * attempt : 3000 * attempt;
                        console.log(`[GENERATE] Retry ${attempt}/${MAX_RETRIES} for ${emotion}, waiting ${wait}ms`);
                        await new Promise(r => setTimeout(r, wait));
                    }

                    const pngBuffer = await openai.generateSticker(job!.source_image_url, style, emotion as any);

                    const fileName = `${jobId}/${emotion}.png`;
                    const { error: uploadError } = await supabase.storage
                        .from('stickers')
                        .upload(fileName, pngBuffer, { contentType: 'image/png', upsert: true });

                    let finalUrl: string;
                    if (!uploadError) {
                        const { data } = supabase.storage.from('stickers').getPublicUrl(fileName);
                        finalUrl = data.publicUrl;
                    } else {
                        console.warn(`[WARN] Storage upload failed for ${emotion}:`, uploadError.message);
                        finalUrl = `data:image/png;base64,${pngBuffer.toString('base64')}`;
                    }

                    await supabase.from('generated_stickers').upsert({
                        job_id: jobId,
                        emotion,
                        image_url: finalUrl,
                        thumbnail_url: finalUrl,
                    }, { onConflict: 'job_id,emotion' });

                    console.log(`[GENERATE] ✓ ${emotion} (attempt ${attempt})`);
                    return { emotion, success: true };
                } catch (err: any) {
                    lastErr = err;
                    console.error(`[GENERATE] ✗ ${emotion} attempt ${attempt} (rate_limit=${isRateLimit(err)}):`, err.message);
                    if (attempt === MAX_RETRIES) {
                        return { emotion, success: false, error: err.message };
                    }
                }
            }
            return { emotion, success: false };
        }

        // Process in batches of CONCURRENCY to respect OpenAI rate limits.
        // Tier-1 accounts: ~5 img/min → CONCURRENCY=3 is safe (each takes ~20s → ~9/min max).
        // Increase to 5 if your account is Tier 2+.
        const CONCURRENCY = 3;
        const allResults: PromiseSettledResult<{ emotion: string; success: boolean; error?: string }>[] = [];
        let lastErr: any = null;

        for (let i = 0; i < STICKER_EMOTIONS.length; i += CONCURRENCY) {
            const batch = STICKER_EMOTIONS.slice(i, i + CONCURRENCY);
            console.log(`[GENERATE] Batch ${Math.floor(i / CONCURRENCY) + 1}: ${batch.join(', ')}`);
            const batchResults = await Promise.allSettled(batch.map(e => generateOne(e)));
            allResults.push(...batchResults);

            // Small gap between batches to reduce burst rate
            if (i + CONCURRENCY < STICKER_EMOTIONS.length) {
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        const results = allResults;

        const succeeded = results.filter(r => r.status === 'fulfilled' && (r.value as any).success).length;
        const failed = results.length - succeeded;

        console.log(`[GENERATE] Job ${jobId} complete: ${succeeded} ok, ${failed} failed`);

        // Update job progress and status
        await supabase.from('sticker_jobs').update({
            progress: succeeded,
            status: failed === results.length ? 'failed' : 'completed',
            updated_at: new Date().toISOString(),
        }).eq('id', jobId);

        return NextResponse.json({ success: true, succeeded, failed });

    } catch (error: any) {
        console.error(`[GENERATE] Fatal error for job ${jobId}:`, error.message);
        await supabase.from('sticker_jobs').update({ status: 'failed' }).eq('id', jobId);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
