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

        // Query order status
        const { data: order } = await supabase
            .from('orders')
            .select('status')
            .eq('job_id', jobId)
            .single();

        const isPaid = order?.status === 'paid';

        // INCREMENTAL GENERATION FOR VERCEL:
        // Instead of a background loop, we process one sticker at a time
        // if the job is paid and not yet completed.
        if (isPaid && job.status !== 'completed' && job.status !== 'failed') {
            const { STICKER_EMOTIONS } = await import('@/lib/types');
            const { generateSingleSticker } = await import('@/lib/ai/generate-stickers');

            const currentProgress = job.progress || 0;

            if (currentProgress < STICKER_EMOTIONS.length) {
                // LOCK MECHANISM:
                // Only start generation if not already processing OR if processing has stalled (> 60s)
                // Fallback to created_at if updated_at is missing
                const lastUpdatedStr = job.updated_at || job.created_at;
                const lastUpdated = new Date(lastUpdatedStr).getTime();
                const now = new Date().getTime();
                const isStalled = now - lastUpdated > 60000;

                if (job.status !== 'processing' || isStalled) {
                    const emotion = STICKER_EMOTIONS[currentProgress];
                    console.log(`[DEBUG] Driving incremental generation for ${jobId}, emotion: ${emotion}`);

                    // Update heartbeat/status to lock
                    // We attempt to update updated_at but wrap in try-catch in case column is missing
                    try {
                        await supabase.from('sticker_jobs').update({
                            status: 'processing',
                            updated_at: new Date().toISOString()
                        }).eq('id', jobId);
                    } catch (e) {
                        // Fallback: just update status if updated_at fails
                        await supabase.from('sticker_jobs').update({
                            status: 'processing'
                        }).eq('id', jobId);
                    }

                    try {
                        // Generate JUST ONE sticker
                        const sticker = await generateSingleSticker(job.source_image_url, job.style_key, emotion);

                        // Save the sticker
                        await supabase.from('generated_stickers').insert({
                            job_id: jobId,
                            emotion: sticker.emotion,
                            image_url: sticker.imageUrl,
                            thumbnail_url: sticker.thumbnailUrl
                        });

                        // Update progress
                        const newProgress = currentProgress + 1;
                        const newStatus = newProgress >= STICKER_EMOTIONS.length ? 'completed' : 'processing';

                        try {
                            await supabase.from('sticker_jobs').update({
                                progress: newProgress,
                                status: newStatus,
                                updated_at: new Date().toISOString()
                            }).eq('id', jobId);
                        } catch (e) {
                            await supabase.from('sticker_jobs').update({
                                progress: newProgress,
                                status: newStatus
                            }).eq('id', jobId);
                        }

                        // Refresh job data for the response
                        job.progress = newProgress;
                        job.status = newStatus;
                    } catch (genError) {
                        console.error(`Error generating sticker for ${emotion}:`, genError);
                        // Reset status to processing but let updated_at cool down so others don't touch it immediately
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
