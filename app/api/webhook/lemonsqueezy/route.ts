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

        console.log('Lemon Squeezy webhook received:', eventName);

        const supabase = getSupabaseAdmin();

        // Handle order_created event
        if (eventName === 'order_created') {
            const orderId = payload.data?.id;
            const customData = payload.meta?.custom_data;
            const jobId = customData?.jobId;

            if (!jobId) {
                console.error('No jobId in webhook payload');
                return NextResponse.json(
                    { error: 'Missing jobId' },
                    { status: 400 }
                );
            }

            console.log(`Payment confirmed for job ${jobId}`);

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

            // Start AI generation now that payment is confirmed
            console.log(`Starting generation for job ${jobId}`);
            analytics.trackGenerationStarted(jobId, job.style_key);

            // Start generation in background
            startGeneration(jobId, job.source_image_url, job.style_key);

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
