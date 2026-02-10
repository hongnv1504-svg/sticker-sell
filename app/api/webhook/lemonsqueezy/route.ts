import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { startGeneration } from '../../upload/route';
import { analytics } from '@/lib/analytics';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        // Get the raw body for signature verification
        const rawBody = await request.text();
        const signature = request.headers.get('x-signature');

        if (!signature) {
            return NextResponse.json(
                { error: 'Missing signature' },
                { status: 401 }
            );
        }

        // Verify webhook signature
        const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
        if (secret) {
            const hmac = crypto.createHmac('sha256', secret);
            const digest = hmac.update(rawBody).digest('hex');

            if (digest !== signature) {
                console.error('Invalid webhook signature');
                return NextResponse.json(
                    { error: 'Invalid signature' },
                    { status: 401 }
                );
            }
        }

        // Parse the webhook payload
        const payload = JSON.parse(rawBody);
        const eventName = payload.meta?.event_name;

        console.log(`[DEBUG] Lemon Squeezy webhook received: ${eventName}`);
        console.log('[DEBUG] Full Webhook Payload:', JSON.stringify(payload));
        console.log(`[DEBUG] Webhook Target Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 15)}...`);

        const supabase = getSupabaseAdmin();

        // Handle order_created event
        if (eventName === 'order_created') {
            const orderId = payload.data?.id;
            const customData = payload.meta?.custom_data;
            console.log('[DEBUG] Webhook Meta Object:', JSON.stringify(payload.meta));

            // Check for jobId in different possible locations for robustness
            const jobId = customData?.jobId || customData?.job_id || payload.meta?.custom?.jobId;

            if (!jobId) {
                console.error('[DEBUG] No jobId in webhook payload. Raw Meta:', JSON.stringify(payload.meta));
                return NextResponse.json(
                    { error: 'Missing jobId' },
                    { status: 400 }
                );
            }

            console.log(`[DEBUG] Payment confirmed for job ${jobId}`);

            // Update order status to paid in Supabase
            const { error: orderUpdateError } = await supabase
                .from('orders')
                .update({ status: 'paid' })
                .eq('job_id', jobId);

            if (orderUpdateError) {
                console.error('Failed to update order in Supabase:', orderUpdateError);
                // Even if order update fails, we might want to check if it exists and proceed
            }

            // Track payment completion
            analytics.trackPaymentCompleted(jobId, 499, 'USD');

            // Get job details from Supabase
            const { data: job, error: jobError } = await supabase
                .from('sticker_jobs')
                .select('*')
                .eq('id', jobId)
                .single();

            if (jobError || !job) {
                console.error(`Job ${jobId} not found in Supabase:`, jobError);
                return NextResponse.json(
                    { error: 'Job not found' },
                    { status: 404 }
                );
            }

            // Start AI generation is now handled incrementally by the Status API
            // so we don't need to trigger a background loop here that Vercel might kill.
            console.log(`Payment confirmed for job ${jobId}. Polling will handle generation.`);

            return NextResponse.json({ success: true });
        }

        // Handle other events if needed
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
