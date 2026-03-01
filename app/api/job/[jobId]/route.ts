import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

// Pure status read — no generation logic here.
// Generation is handled by /api/generate/[jobId] (triggered from upload).
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId: rawJobId } = await params;
        const jobId = rawJobId?.trim();
        const supabase = getSupabaseAdmin();

        const { data: job, error: jobError } = await supabase
            .from('sticker_jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (jobError || !job) {
            console.error(`[JOB] Not found: ${jobId}`, jobError);
            return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
        }

        const { data: jobStickers } = await supabase
            .from('generated_stickers')
            .select('*')
            .eq('job_id', jobId);

        const { data: order } = await supabase
            .from('orders')
            .select('status')
            .eq('job_id', jobId)
            .single();

        const isPaid = order?.status === 'paid' || true; // ALLOW TESTING FOR NOW

        // Filter out stickers that are still "generating" (JSON marker, not a real URL)
        const readyStickers = (jobStickers || []).filter(
            (s: any) => s.image_url && !s.image_url.startsWith('{')
        );

        console.log(`[JOB] ${jobId} — status: ${job.status}, progress: ${job.progress}, stickers ready: ${readyStickers.length}`);

        // Use readyStickers.length as live progress so the UI updates
        // as each sticker completes, not just at the end of the batch.
        const liveProgress = job.status === 'completed'
            ? job.progress
            : readyStickers.length;

        return NextResponse.json({
            success: true,
            job: {
                id: job.id,
                status: job.status,
                progress: liveProgress,
                createdAt: job.created_at,
            },
            stickers: readyStickers.map((s: any) => ({
                id: s.id,
                emotion: s.emotion,
                imageUrl: s.image_url,
                thumbnailUrl: s.thumbnail_url,
            })),
            isPaid,
        });

    } catch (error) {
        console.error('[JOB] Status error:', error);
        return NextResponse.json({ success: false, error: 'Failed to get job status' }, { status: 500 });
    }
}
