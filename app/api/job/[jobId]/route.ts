import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId } = await params;
        const supabase = getSupabaseAdmin();

        // Query job status
        const { data: job, error: jobError } = await supabase
            .from('sticker_jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (jobError || !job) {
            console.error('Job not found or error:', jobError);
            return NextResponse.json(
                { success: false, error: 'Job not found' },
                { status: 404 }
            );
        }

        // Query stickers
        const { data: jobStickers, error: stickersError } = await supabase
            .from('generated_stickers')
            .select('*')
            .eq('job_id', jobId);

        if (stickersError) {
            console.error('Error fetching stickers:', stickersError);
        }

        // Query order status
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('status')
            .eq('job_id', jobId)
            .single();

        const isPaid = order?.status === 'paid';

        return NextResponse.json({
            success: true,
            job: {
                id: job.id,
                status: job.status,
                progress: job.progress,
                createdAt: job.created_at
            },
            stickers: (jobStickers || []).map(s => ({
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
