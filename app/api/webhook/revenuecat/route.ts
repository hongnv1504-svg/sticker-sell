import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export const maxDuration = 30;

const PRODUCT_CREDITS: Record<string, number> = {
    'com.stickerme.credits_1': 1,
    'com.stickerme.credits_3': 3,
    'com.stickerme.credits_6': 6,
};

export async function POST(request: NextRequest) {
    try {
        // Verify Authorization header
        const authHeader = request.headers.get('authorization');
        const secret = process.env.REVENUECAT_WEBHOOK_SECRET;

        if (!secret || authHeader !== secret) {
            console.error('[RevenueCat] Unauthorized webhook request');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await request.json();
        const event = payload.event;

        if (!event) {
            return NextResponse.json({ error: 'Missing event' }, { status: 400 });
        }

        const eventType: string = event.type;
        console.log(`[RevenueCat] Event received: ${eventType}`);

        // Handle purchase events
        if (eventType === 'INITIAL_PURCHASE' || eventType === 'NON_SUBSCRIPTION_PURCHASE' || eventType === 'NON_RENEWING_PURCHASE') {
            const userId: string = event.app_user_id;
            const productId: string = event.product_id;
            const transactionId: string = event.transaction_id;

            if (!userId || !productId) {
                console.error('[RevenueCat] Missing userId or productId', { userId, productId });
                return NextResponse.json({ error: 'Missing userId or productId' }, { status: 400 });
            }

            const creditsToAdd = PRODUCT_CREDITS[productId];
            if (!creditsToAdd) {
                console.error(`[RevenueCat] Unknown product ID: ${productId}`);
                return NextResponse.json({ error: 'Unknown product' }, { status: 400 });
            }

            const supabase = getSupabaseAdmin();

            // Idempotency: check if transaction already processed
            const { data: existing } = await supabase
                .from('credit_transactions')
                .select('id')
                .eq('transaction_id', transactionId)
                .single();

            if (existing) {
                console.log(`[RevenueCat] Transaction ${transactionId} already processed, skipping`);
                return NextResponse.json({ success: true, message: 'Already processed' });
            }

            // Add credits to user account (upsert)
            const { error: upsertError } = await supabase.rpc('add_user_credits', {
                p_user_id: userId,
                p_credits: creditsToAdd,
            });

            if (upsertError) {
                console.error('[RevenueCat] Failed to add credits:', upsertError);
                return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 });
            }

            // Record transaction for idempotency
            await supabase.from('credit_transactions').insert({
                user_id: userId,
                product_id: productId,
                transaction_id: transactionId,
                credits_added: creditsToAdd,
                event_type: eventType,
            });

            console.log(`[RevenueCat] Added ${creditsToAdd} credits to user ${userId} for product ${productId}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[RevenueCat] Webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
