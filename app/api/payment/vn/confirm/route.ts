import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const { jobId } = await request.json();

        if (!jobId) {
            return NextResponse.json(
                { success: false, error: 'Job ID is required' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdmin();

        // Kiểm tra order tồn tại và đã được thanh toán chưa
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

        // Nếu đã paid → trigger generation nếu chưa chạy
        if (order.status === 'paid') {
            const { data: job } = await supabase
                .from('sticker_jobs')
                .select('source_image_url, style_key, status')
                .eq('id', jobId)
                .single();

            if (job && job.status === 'pending') {
                console.log(`[VN Confirm] Job ${jobId} is paid but pending, triggering generation`);
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stickermeapp.ink';
                fetch(`${appUrl}/api/generate/background`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jobId }),
                }).catch(err => console.error('[VN Confirm] Background gen error:', err));
            }

            return NextResponse.json({
                success: true,
                message: 'Đơn hàng đã được thanh toán',
                status: 'paid',
            });
        }

        // Chưa có xác nhận thanh toán từ Sepay
        return NextResponse.json(
            { success: false, error: 'Hệ thống chưa nhận được thông báo thanh toán. Vui lòng đợi thêm hoặc liên hệ hỗ trợ.' },
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
