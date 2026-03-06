import { NextRequest, NextResponse } from 'next/server';
import { startGeneration } from '@/app/api/upload/route';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const maxDuration = 300;

export async function POST(request: NextRequest) {
    try {
        const { jobId } = await request.json();

        if (!jobId) {
            return NextResponse.json({ error: 'Job ID missing' }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();
        const { data: job } = await supabase
            .from('sticker_jobs')
            .select('source_image_url, style_key')
            .eq('id', jobId)
            .single();

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        console.log(`[Background Worker] Starting generation for job: ${jobId}`);
        await startGeneration(jobId, job.source_image_url, job.style_key as any);
        console.log(`[Background Worker] Completed generation for job: ${jobId}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Background Worker] Error:', error);
        return NextResponse.json({ error: 'Background generation failed' }, { status: 500 });
    }
}
