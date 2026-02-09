import { NextRequest, NextResponse } from 'next/server';
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js';
import { v4 as uuidv4 } from 'uuid';
import { jobs, orders } from '../upload/route';
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

        const job = jobs.get(jobId);

        if (!job) {
            return NextResponse.json(
                { success: false, error: 'Job not found' },
                { status: 404 }
            );
        }

        // Check if already paid
        const existingOrder = orders.get(jobId);
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
        const checkout = await createCheckout(
            LEMONSQUEEZY_CONFIG.storeId,
            LEMONSQUEEZY_CONFIG.variantId,
            {
                checkoutData: {
                    custom: {
                        jobId, // Pass jobId to identify the order
                    },
                },
                productOptions: {
                    redirectUrl: `${baseUrl}/generate/${jobId}`,
                },
            }
        );

        if (checkout.error) {
            console.error('Lemon Squeezy API error:', checkout.error);
            throw new Error(`Lemon Squeezy error: ${checkout.error.message || 'Unknown error'}`);
        }

        if (!checkout.data) {
            throw new Error('Failed to create checkout session - no data returned');
        }

        // Create order record
        orders.set(jobId, {
            id: uuidv4(),
            jobId,
            status: 'pending',
            amountCents: PRICE_AMOUNT,
            currency: PRICE_CURRENCY
        });

        return NextResponse.json({
            success: true,
            url: checkout.data.data.attributes.url
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
