import { NextRequest, NextResponse } from 'next/server';
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { v4 as uuidv4 } from 'uuid';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { setupLemonSqueezy, LEMONSQUEEZY_CONFIG } from '@/lib/lemonsqueezy';

const PRICE_AMOUNT = 499; // $4.99 in cents
const PRICE_CURRENCY = 'usd';

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

        // Check if job exists in Supabase
        const { data: job, error: jobError } = await supabase
            .from('sticker_jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (jobError || !job) {
            console.error('Job not found in Supabase:', jobError);
            return NextResponse.json(
                { success: false, error: 'Job not found' },
                { status: 404 }
            );
        }

        // Check if already paid in Supabase
        const { data: existingOrder, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('job_id', jobId)
            .single();

        if (existingOrder?.status === 'paid') {
            return NextResponse.json({
                success: true,
                url: `/generate/${jobId}` // Already paid, redirect to generation
            });
        }

        // Get host from request
        const host = request.headers.get('host') || 'localhost:3000';
        const protocol = host.includes('localhost') ? 'http' : 'https';
        const baseUrl = `${protocol}://${host}`;

        // Initialize Lemon Squeezy
        setupLemonSqueezy();

        // Create Lemon Squeezy checkout
        // We pass jobId in multiple places to ensure it's captured by the webhook
        const checkout = await createCheckout(
            LEMONSQUEEZY_CONFIG.storeId,
            LEMONSQUEEZY_CONFIG.variantId,
            {
                checkoutData: {
                    custom: {
                        jobId,
                        job_id: jobId
                    },
                },
                productOptions: {
                    redirectUrl: `${baseUrl}/generate/${jobId}`,
                },
                // Some versions/configurations might expect it here
                // @ts-ignore
                custom_data: {
                    jobId,
                    job_id: jobId
                }
            }
        );

        if (checkout.error) {
            console.error('Lemon Squeezy API error:', checkout.error);
            throw new Error(`Lemon Squeezy error: ${checkout.error.message || 'Unknown error'}`);
        }

        if (!checkout.data) {
            throw new Error('Failed to create checkout session - no data returned');
        }

        // Create or update order record in Supabase
        const orderId = uuidv4();
        const { error: upsertError } = await supabase
            .from('orders')
            .upsert({
                id: existingOrder?.id || orderId,
                job_id: jobId,
                status: 'pending',
                amount_cents: PRICE_AMOUNT,
                currency: PRICE_CURRENCY
            });

        if (upsertError) {
            console.error('Failed to upsert order in Supabase:', upsertError);
            throw new Error('Failed to record order');
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'unknown';
        return NextResponse.json({
            success: true,
            checkoutUrl: checkout.data.data.attributes.url,
            debug: {
                targetUrl: supabaseUrl
            }
        });

    } catch (error) {
        console.error('Checkout error details:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create checkout session'
            },
            { status: 500 }
        );
    }
}
