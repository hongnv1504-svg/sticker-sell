import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { generateVietQRUrl, getTransferContent, VIETQR_CONFIG, formatVND } from '@/lib/vietqr';

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

        // Kiểm tra job tồn tại
        const { data: job, error: jobError } = await supabase
            .from('sticker_jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (jobError || !job) {
            return NextResponse.json(
                { success: false, error: 'Job not found' },
                { status: 404 }
            );
        }

        // Kiểm tra đã thanh toán chưa
        const { data: existingOrder } = await supabase
            .from('orders')
            .select('*')
            .eq('job_id', jobId)
            .single();

        if (existingOrder?.status === 'paid') {
            return NextResponse.json({
                success: true,
                alreadyPaid: true,
                redirectUrl: `/generate/${jobId}`,
            });
        }

        // Tạo hoặc cập nhật order với trạng thái pending_vn
        const orderId = uuidv4();
        const { error: upsertError } = await supabase
            .from('orders')
            .upsert({
                id: existingOrder?.id || orderId,
                job_id: jobId,
                status: 'pending_vn',
                amount_cents: VIETQR_CONFIG.amountVND,
                currency: 'VND',
            });

        if (upsertError) {
            console.error('Failed to upsert VN order:', upsertError);
            throw new Error('Failed to record order');
        }

        const transferContent = getTransferContent(jobId);
        const qrUrl = generateVietQRUrl(jobId);

        return NextResponse.json({
            success: true,
            qrUrl,
            amount: VIETQR_CONFIG.amountVND,
            amountFormatted: formatVND(VIETQR_CONFIG.amountVND),
            bankCode: VIETQR_CONFIG.bankCode,
            accountNumber: VIETQR_CONFIG.accountNumber,
            accountName: VIETQR_CONFIG.accountName,
            transferContent,
        });

    } catch (error) {
        console.error('VN Checkout error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Checkout failed',
            },
            { status: 500 }
        );
    }
}
