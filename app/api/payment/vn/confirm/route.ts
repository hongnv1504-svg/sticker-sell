import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

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

        // Cập nhật status sang pending_review và lưu note của user
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'pending_review',
                // Lưu note vào metadata nếu có cột này, hoặc dùng upsert với field mới
                // Nếu không có cột transaction_note, bỏ dòng này đi
                ...(transactionNote ? { transaction_note: transactionNote } : {}),
            })
            .eq('job_id', jobId);

        if (updateError) {
            // Nếu lỗi do cột transaction_note không tồn tại, thử update chỉ status
            const { error: retryError } = await supabase
                .from('orders')
                .update({ status: 'pending_review' })
                .eq('job_id', jobId);

            if (retryError) {
                console.error('Failed to update order status:', retryError);
                throw new Error('Failed to update order');
            }
        }

        console.log(`[VN Payment] Job ${jobId} marked as pending_review. Note: ${transactionNote || 'N/A'}`);

        return NextResponse.json({
            success: true,
            message: 'Đã nhận thông tin. Đang xác minh thanh toán...',
            status: 'pending_review',
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
