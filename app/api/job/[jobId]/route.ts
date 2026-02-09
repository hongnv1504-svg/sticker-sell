import { NextRequest, NextResponse } from 'next/server';
import { jobs, stickers, orders } from '../../upload/route';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId } = await params;

        const job = jobs.get(jobId);

        if (!job) {
            return NextResponse.json(
                { success: false, error: 'Job not found' },
                { status: 404 }
            );
        }

        const jobStickers = stickers.get(jobId) || [];
        const order = orders.get(jobId);
        const isPaid = order?.status === 'paid';

        return NextResponse.json({
            success: true,
            job: {
                id: job.id,
                status: job.status,
                progress: job.progress,
                createdAt: job.createdAt
            },
            stickers: jobStickers.map(s => ({
                id: s.id,
                emotion: s.emotion,
                imageUrl: s.imageUrl,
                thumbnailUrl: s.thumbnailUrl
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
