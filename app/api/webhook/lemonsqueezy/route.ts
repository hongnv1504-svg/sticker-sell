import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { orders, jobs, startGeneration } from '../../upload/route';
import { analytics } from '@/lib/analytics';

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

            // Update order status to paid
            const order = orders.get(jobId);
            if (order) {
                order.status = 'paid';
                orders.set(jobId, order);
            } else {
                // Create new order record if it doesn't exist
                orders.set(jobId, {
                    id: orderId,
                    jobId,
                    status: 'paid',
                    amountCents: 499,
                    currency: 'usd'
                });
            }

            // Track payment completion
            analytics.trackPaymentCompleted(jobId, 499, 'USD');

            // Get job details
            const job = jobs.get(jobId);
            if (!job) {
                console.error(`Job ${jobId} not found`);
                return NextResponse.json(
                    { error: 'Job not found' },
                    { status: 404 }
                );
            }

            // Start AI generation now that payment is confirmed
            console.log(`Starting generation for job ${jobId}`);
            analytics.trackGenerationStarted(jobId, job.styleKey);

            // Start generation in background
            startGeneration(jobId, job.sourceImageUrl, job.styleKey);

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
