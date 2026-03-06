import { NextRequest, NextResponse } from 'next/server';

/**
 * Detect user country via Vercel's automatic geo headers.
 * Works automatically on Vercel without any extra API or config.
 * Fallback: returns null (client will use timezone detection).
 */
export async function GET(request: NextRequest) {
    // Vercel tự động inject header này dựa trên IP của user
    const country = request.headers.get('x-vercel-ip-country') || null;

    return NextResponse.json({ country });
}
