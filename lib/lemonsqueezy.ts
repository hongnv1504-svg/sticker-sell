import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

// Initialize Lemon Squeezy with API key
export function setupLemonSqueezy() {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;

    if (!apiKey) {
        throw new Error('LEMONSQUEEZY_API_KEY is required');
    }

    lemonSqueezySetup({
        apiKey,
        onError: (error) => {
            console.error('Lemon Squeezy Error:', error);
            throw error;
        },
    });
}

// Lemon Squeezy configuration
export const LEMONSQUEEZY_CONFIG = {
    storeId: process.env.LEMONSQUEEZY_STORE_ID || '',
    variantId: process.env.LEMONSQUEEZY_VARIANT_ID || '',
    price: 499, // $4.99 in cents
    currency: 'USD',
};

// Validate configuration
export function validateLemonSqueezyConfig() {
    const { storeId, variantId } = LEMONSQUEEZY_CONFIG;

    if (!storeId || !variantId) {
        throw new Error('Lemon Squeezy configuration is incomplete. Check environment variables (STORE_ID and VARIANT_ID).');
    }

    return true;
}
