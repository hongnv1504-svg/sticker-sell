import { NextRequest, NextResponse, after } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { VIETQR_CONFIG } from '@/lib/vietqr';
import { startGeneration } from '@/app/api/upload/route';

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
 *   "gateway": "ACB",
 *   "transactionDate": "2024-01-01 12:00:00",
 *   "accountNumber": "241150249",
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
 * Bảo mật: Sepay gửi kèm header "Authorization" hoặc "apikey"
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Xác minh secret từ Sepay
        // Sepay gửi: Authorization: Apikey <secret> HOẶC apikey: <secret>
        const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
        const apiKeyHeader = request.headers.get('apikey');
        const webhookSecret = process.env.SEPAY_WEBHOOK_SECRET;
        const merchantId = process.env.SEPAY_MERCHANT_ID;

        // Parse Authorization header: "Apikey spsk_live_xxx" → "spsk_live_xxx"
        let apiKey = apiKeyHeader;
        if (!apiKey && authHeader) {
            const match = authHeader.match(/^Apikey\s+(.+)$/i);
            if (match) apiKey = match[1];
        }

        console.log(`[SEPAY] Auth check — header apikey: ${apiKeyHeader?.substring(0, 10)}... | Authorization: ${authHeader?.substring(0, 20)}...`);

        if (webhookSecret && apiKey !== webhookSecret) {
            console.error('[SEPAY] Invalid API key received:', apiKey?.substring(0, 10) + '...');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse payload
        const payload = await request.json();
        console.log('[SEPAY] ====== WEBHOOK RECEIVED ======');
        console.log('[SEPAY] Full payload:', JSON.stringify(payload, null, 2));

        const {
            transferType,
            transferAmount,
            content,
            description,
            accountNumber,
            transactionID,
            code,
            referenceCode,
        } = payload;

        // 3. Chỉ xử lý giao dịch tiền VÀO
        if (transferType !== 'in') {
            console.log('[SEPAY] Skipped: transferType =', transferType);
            return NextResponse.json({ success: true, message: 'Ignored: not incoming transfer' });
        }

        // 4. Kiểm tra account number (linh hoạt hơn - so sánh phần cuối)
        const configAccount = VIETQR_CONFIG.accountNumber;
        if (accountNumber && !accountMatches(accountNumber, configAccount)) {
            console.warn(`[SEPAY] ⚠️ Account mismatch: received "${accountNumber}", expected "${configAccount}"`);
            return NextResponse.json({ success: true, message: 'Ignored: wrong account' });
        }

        // 5. Kiểm tra số tiền (±1000đ cho phí bank)
        const expectedAmount = VIETQR_CONFIG.amountVND;
        if (transferAmount < expectedAmount - 1000) {
            console.warn(`[SEPAY] ⚠️ Amount too low: ${transferAmount}, expected ≥ ${expectedAmount - 1000}`);
            return NextResponse.json({ success: true, message: 'Ignored: wrong amount' });
        }

        // 6. Tìm STICKER code trong nội dung - kiểm tra nhiều field
        const allText = [content, description, code, referenceCode]
            .filter(Boolean)
            .join(' ');

        console.log('[SEPAY] Searching for STICKER code in:', JSON.stringify({ content, description, code, referenceCode }));

        const shortId = extractShortId(allText);

        if (!shortId) {
            console.warn(`[SEPAY] ⚠️ No STICKER code found in any field`);
            console.warn(`[SEPAY] Attempting fallback: match by recent pending orders...`);

            // Fallback: nếu chỉ có 1 order pending gần đây (trong 30 phút), tự match
            const fallbackOrder = await findRecentPendingOrder();
            if (fallbackOrder) {
                console.log(`[SEPAY] ✅ Fallback matched to order: ${fallbackOrder.job_id}`);
                return await confirmAndTrigger(fallbackOrder.job_id, transactionID);
            }

            return NextResponse.json({ success: true, message: 'No STICKER code found and no unique pending order' });
        }

        console.log(`[SEPAY] Extracted shortId: "${shortId}"`);

        const supabase = getSupabaseAdmin();

        // 7. Tìm order bằng shortId
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('id, job_id, status')
            .in('status', ['pending', 'pending_vn', 'pending_review'])
            .order('created_at', { ascending: false })
            .limit(50);

        if (ordersError) {
            console.error('[SEPAY] ❌ Error fetching orders:', ordersError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        console.log(`[SEPAY] Found ${orders?.length || 0} pending orders`);

        // So khớp shortId với job_id (linh hoạt hơn)
        const matchedOrder = orders?.find(order => {
            const jobShortId = order.job_id.replace(/-/g, '').substring(0, 8).toUpperCase();
            const matched = jobShortId === shortId || jobShortId.startsWith(shortId) || shortId.startsWith(jobShortId);
            if (matched) {
                console.log(`[SEPAY] ✅ Matched: order job_id="${order.job_id}" (short="${jobShortId}") ↔ shortId="${shortId}"`);
            }
            return matched;
        });

        if (!matchedOrder) {
            console.warn(`[SEPAY] ❌ No matching order for shortId: ${shortId}`);
            if (orders?.length) {
                console.warn('[SEPAY] Available pending orders:', orders.map(o => ({
                    job_id: o.job_id,
                    short: o.job_id.replace(/-/g, '').substring(0, 8).toUpperCase(),
                    status: o.status,
                })));
            }
            return NextResponse.json({ success: true, message: `No pending order for STICKER ${shortId}` });
        }

        return await confirmAndTrigger(matchedOrder.job_id, transactionID);

    } catch (error) {
        console.error('[SEPAY] ❌ Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}

/**
 * So sánh account number linh hoạt (handle leading zeros, format khác nhau)
 */
function accountMatches(received: string, expected: string): boolean {
    const clean = (s: string) => s.replace(/[^0-9]/g, '');
    const r = clean(received);
    const e = clean(expected);
    return r === e || r.endsWith(e) || e.endsWith(r);
}

/**
 * Trích xuất STICKER shortId từ text - hỗ trợ nhiều format ngân hàng
 */
function extractShortId(text: string): string | null {
    const upper = (text || '').toUpperCase().trim();

    // Format chuẩn: "STICKER ABC12345"
    const match1 = upper.match(/STICKER\s*([A-Z0-9]{6,10})/);
    if (match1) return match1[1].substring(0, 8);

    // Format không space: "STICKERABC12345"
    const match2 = upper.match(/STICKER([A-Z0-9]{6,10})/);
    if (match2) return match2[1].substring(0, 8);

    // Format có dấu gạch: "STICKER-ABC12345" hoặc "STICKER_ABC12345"
    const match3 = upper.match(/STICKER[-_]([A-Z0-9]{6,10})/);
    if (match3) return match3[1].substring(0, 8);

    // Tìm bất kỳ từ "STICKER" nào trong text rồi lấy chuỗi alpha-num tiếp theo
    const match4 = upper.match(/STICKER[^A-Z0-9]*([A-Z0-9]{6,10})/);
    if (match4) return match4[1].substring(0, 8);

    return null;
}

/**
 * Tìm order pending gần nhất (trong 30 phút) - fallback khi không parse được content
 */
async function findRecentPendingOrder() {
    const supabase = getSupabaseAdmin();
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: orders } = await supabase
        .from('orders')
        .select('id, job_id, status, created_at')
        .in('status', ['pending', 'pending_vn', 'pending_review'])
        .gte('created_at', thirtyMinAgo)
        .order('created_at', { ascending: false })
        .limit(5);

    // Chỉ auto-match nếu chỉ có đúng 1 order pending gần đây
    if (orders?.length === 1) {
        return orders[0];
    }

    if (orders && orders.length > 1) {
        console.warn(`[SEPAY] Multiple pending orders found (${orders.length}), cannot auto-match`);
    }

    return null;
}

/**
 * Xác nhận payment và trigger AI generation
 */
async function confirmAndTrigger(jobId: string, transactionID?: string) {
    const supabase = getSupabaseAdmin();

    console.log(`[SEPAY] Confirming payment for job: ${jobId}, transaction: ${transactionID}`);

    // Update order → paid
    const { error: updateError } = await supabase
        .from('orders')
        .update({
            status: 'paid',
            ...(transactionID ? { transaction_note: String(transactionID) } : {}),
        })
        .eq('job_id', jobId);

    if (updateError) {
        // Thử update không có transaction_note nếu cột không tồn tại
        console.warn('[SEPAY] Update with transaction_note failed, retrying without:', updateError);
        const { error: retryError } = await supabase
            .from('orders')
            .update({ status: 'paid' })
            .eq('job_id', jobId);

        if (retryError) {
            console.error('[SEPAY] ❌ Failed to update order:', retryError);
            return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
        }
    }

    console.log(`[SEPAY] ✅ Order ${jobId} marked as PAID`);

    // Trigger AI generation using after() - chạy sau khi response đã gửi
    const { data: job } = await supabase
        .from('sticker_jobs')
        .select('source_image_url, style_key, status')
        .eq('id', jobId)
        .single();

    if (job && job.status === 'pending') {
        console.log(`[SEPAY] 🚀 Triggering AI generation for job: ${jobId} via after()`);
        after(async () => {
            try {
                console.log(`[SEPAY/after] Starting generation for ${jobId}...`);
                await startGeneration(jobId, job.source_image_url, job.style_key as any);
                console.log(`[SEPAY/after] ✅ Generation completed for ${jobId}`);
            } catch (err) {
                console.error(`[SEPAY/after] ❌ Generation failed for ${jobId}:`, err);
            }
        });
    } else if (job) {
        console.log(`[SEPAY] Job ${jobId} already in status: ${job.status}, skipping generation trigger`);
    } else {
        console.warn(`[SEPAY] ⚠️ Job ${jobId} not found in sticker_jobs`);
    }

    return NextResponse.json({ success: true, message: `Payment confirmed for job ${jobId}` });
}
