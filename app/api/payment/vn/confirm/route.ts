import { NextRequest, NextResponse, after } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { startGeneration } from '@/app/api/upload/route';

export const maxDuration = 300;

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

        // Nếu đã paid rồi → trigger generation nếu chưa chạy
        if (order.status === 'paid') {
            const { data: job } = await supabase
                .from('sticker_jobs')
                .select('source_image_url, style_key, status')
                .eq('id', jobId)
                .single();

            if (job && job.status === 'pending') {
                console.log(`[VN Confirm] Job ${jobId} is paid but pending, triggering generation via after()`);
                after(async () => {
                    try {
                        await startGeneration(jobId, job.source_image_url, job.style_key as any);
                        console.log(`[VN Confirm/after] ✅ Generation completed for ${jobId}`);
                    } catch (err) {
                        console.error(`[VN Confirm/after] ❌ Generation failed for ${jobId}:`, err);
                    }
                });
            }

            return NextResponse.json({
                success: true,
                message: 'Đơn hàng đã được thanh toán',
                status: 'paid',
            });
        }

        // Cho phép bypass để test ở môi trường localhost
        if (process.env.NODE_ENV === 'development' && transactionNote === 'TESTPAID') {
            const { error: updateError } = await supabase
                .from('orders')
                .update({ status: 'paid', transaction_note: 'TEST_BYPASS' })
                .eq('job_id', jobId);

            if (!updateError) {
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
                            console.error(`[VN Confirm/after] Generation failed:`, err);
                        }
                    });
                }
                return NextResponse.json({ success: true, message: 'Test payment confirmed.', status: 'paid' });
            }
        }

        return NextResponse.json(
            { success: false, error: 'Hệ thống chưa nhận được thông báo thanh toán (Webhook). Vui lòng đợi thêm hoặc liên hệ hỗ trợ.' },
            { status: 400 }
        );

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
