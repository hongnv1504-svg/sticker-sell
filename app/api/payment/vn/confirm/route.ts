import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { after } from 'next/server';
import { startGeneration } from '@/app/api/upload/route';

export async function POST(request: NextRequest) {
    try {
        const { jobId, transactionNote } = await request.json();

        if (!jobId) {
            return NextResponse.json(
                { success: false, error: 'Job ID is required' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdmin();

        // Kiểm tra order tồn tại
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('job_id', jobId)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { success: false, error: 'Order not found. Please restart payment.' },
                { status: 404 }
            );
        }

        // Nếu đã paid rồi thì không cần làm gì
        if (order.status === 'paid') {
            return NextResponse.json({
                success: true,
                alreadyPaid: true,
                message: 'Đơn hàng đã được thanh toán',
            });
        }

        // For MVP, manual confirm assumes payment is successful and triggers generation
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'paid', // Mark as paid directly for MVP
                ...(transactionNote ? { transaction_note: transactionNote } : {}),
            })
            .eq('job_id', jobId);

        if (updateError) {
            const { error: retryError } = await supabase
                .from('orders')
                .update({ status: 'paid' })
                .eq('job_id', jobId);

            if (retryError) {
                console.error('Failed to update order status:', retryError);
                throw new Error('Failed to update order');
            }
        }

        console.log(`[VN Payment] Job ${jobId} manually confirmed. Note: ${transactionNote || 'N/A'}`);

        // Trigger AI generation immediately in background
        console.log(`[VN Payment] Triggering background generation for job: ${jobId}`);
        const { data: job } = await supabase
            .from('sticker_jobs')
            .select('source_image_url, style_key')
            .eq('id', jobId)
            .single();

        if (job) {
            after(async () => {
                try {
                    await startGeneration(jobId, job.source_image_url, job.style_key as any);
                } catch (err) {
                    console.error('[VN Payment] Generation failed:', err);
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Payment confirmed. Generating stickers...',
            status: 'paid',
        });

    } catch (error) {
        console.error('VN Payment confirm error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Confirmation failed',
            },
            { status: 500 }
        );
    }
}
