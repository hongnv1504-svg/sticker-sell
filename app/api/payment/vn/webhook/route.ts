import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { VIETQR_CONFIG } from '@/lib/vietqr';

export const maxDuration = 300;

/**
 * Sepay Webhook Handler
 *
 * Sepay gọi endpoint này khi có giao dịch vào tài khoản ngân hàng.
 * Docs: https://sepay.vn/tai-lieu-api.html
 *
 * Payload từ Sepay:
 * {
 *   "id": 123,
 *   "gateway": "Techcombank",
 *   "transactionDate": "2024-01-01 12:00:00",
 *   "accountNumber": "19033210412014",
 *   "code": null,
 *   "content": "STICKER ABC123",       ← nội dung chuyển khoản
 *   "transferType": "in",               ← "in" = tiền vào, "out" = tiền ra
 *   "transferAmount": 49000,            ← số tiền
 *   "accumulated": 49000,
 *   "referenceCode": "FT24001234567",
 *   "description": "...",
 *   "transactionID": "FT24001234567"
 * }
 *
 * Bảo mật: Sepay gửi kèm header "apikey" = SEPAY_WEBHOOK_SECRET
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Xác minh secret từ Sepay (header: apikey)
        const apiKey = request.headers.get('apikey');
        const webhookSecret = process.env.SEPAY_WEBHOOK_SECRET;
        const merchantId = process.env.SEPAY_MERCHANT_ID;

        if (webhookSecret && apiKey !== webhookSecret) {
            console.error('[SEPAY] Invalid API key received:', apiKey?.substring(0, 10) + '...');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log(`[SEPAY] Webhook authenticated for merchant: ${merchantId || 'N/A'}`);

        // 2. Parse payload
        const payload = await request.json();
        console.log('[SEPAY] Webhook received:', JSON.stringify(payload));

        const {
            transferType,
            transferAmount,
            content,
            accountNumber,
            transactionID,
        } = payload;

        // 3. Chỉ xử lý giao dịch tiền VÀO đúng tài khoản
        if (transferType !== 'in') {
            return NextResponse.json({ success: true, message: 'Ignored: not incoming transfer' });
        }

        if (accountNumber && accountNumber !== VIETQR_CONFIG.accountNumber) {
            console.warn(`[SEPAY] Wrong account: ${accountNumber}`);
            return NextResponse.json({ success: true, message: 'Ignored: wrong account' });
        }

        // 4. Kiểm tra số tiền đúng không (±1000đ để tránh phí bank)
        const expectedAmount = VIETQR_CONFIG.amountVND;
        if (transferAmount < expectedAmount - 1000) {
            console.warn(`[SEPAY] Wrong amount: ${transferAmount}, expected: ${expectedAmount}`);
            return NextResponse.json({ success: true, message: 'Ignored: wrong amount' });
        }

        // 5. Tìm jobId trong nội dung chuyển khoản
        // Nội dung CK format: "STICKER ABC123" (8 ký tự đầu của jobId không có dấu gạch)
        const contentUpper = (content || '').toUpperCase().trim();
        const stickerMatch = contentUpper.match(/STICKER\s+([A-Z0-9]{6,8})/);

        if (!stickerMatch) {
            console.warn(`[SEPAY] No STICKER code found in content: "${content}"`);
            return NextResponse.json({ success: true, message: 'Ignored: no STICKER code in content' });
        }

        const shortId = stickerMatch[1]; // ví dụ: "ABC12345"

        const supabase = getSupabaseAdmin();

        // 6. Tìm order bằng shortId (so khớp job_id bắt đầu bằng shortId viết thường)
        // job_id dạng UUID: "abc12345-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
        // shortId = 8 ký tự đầu UUID không có dấu gạch → "abc12345"
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, job_id, status')
            .in('status', ['pending_vn', 'pending_review'])
            .order('created_at', { ascending: false })
            .limit(50);

        if (ordersError) {
            console.error('[SEPAY] Error fetching orders:', ordersError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // So khớp shortId với job_id
        const matchedOrder = orders?.find(order => {
            const jobShortId = order.job_id.replace(/-/g, '').substring(0, 8).toUpperCase();
            return jobShortId === shortId;
        });

        if (!matchedOrder) {
            console.warn(`[SEPAY] No matching order found for shortId: ${shortId}`);
            return NextResponse.json({ success: true, message: `No pending order for STICKER ${shortId}` });
        }

        const { job_id: jobId } = matchedOrder;
        console.log(`[SEPAY] Payment confirmed for job: ${jobId}, transaction: ${transactionID}`);

        // 7. Update order → paid
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'paid',
                ...(transactionID ? { transaction_note: transactionID } : {}),
            })
            .eq('job_id', jobId);

        if (updateError) {
            // Thử update không có transaction_note nếu cột không tồn tại
            const { error: retryError } = await supabase
                .from('orders')
                .update({ status: 'paid' })
                .eq('job_id', jobId);

            if (retryError) {
                console.error('[SEPAY] Failed to update order:', retryError);
                return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
            }
        }

        console.log(`[SEPAY] ✅ Order ${jobId} marked as PAID`);

        // 8. Trigger AI generation immediately in background
        console.log(`[SEPAY] Triggering background generation for job: ${jobId}`);

        const { data: job } = await supabase
            .from('sticker_jobs')
            .select('source_image_url, style_key')
            .eq('id', jobId)
            .single();

        if (job) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stickermeapp.ink';
            fetch(`${appUrl}/api/generate/background`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId }),
            }).catch(err => console.error('[SEPAY] Failed to trigger background generation:', err));
        }

        return NextResponse.json({ success: true, message: `Payment confirmed for job ${jobId}` });

    } catch (error) {
        console.error('[SEPAY] Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
