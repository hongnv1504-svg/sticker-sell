import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getPackById } from '@/lib/packs';
import { StickerStyleKey } from '@/lib/ai/sticker-styles';

// In-memory store for demo (replace with Supabase in production)
const jobs = new Map<string, {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    sourceImageUrl: string;
    styleKey: StickerStyleKey; // Added to track which style to use
    createdAt: string;
}>();

const stickers = new Map<string, Array<{
    id: string;
    jobId: string;
    emotion: string;
    imageUrl: string | null;
    thumbnailUrl: string | null;
    createdAt: string;
}>>();

const orders = new Map<string, {
    id: string;
    jobId: string;
    status: 'pending' | 'paid' | 'failed';
    amountCents: number;
    currency: string;
}>();

// Export for use in other routes
export { jobs, stickers, orders };

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const packId = formData.get('packId') as string | null;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        // Get the pack to determine the style
        const pack = packId ? getPackById(packId) : null;
        if (!pack) {
            return NextResponse.json(
                { success: false, error: 'Invalid pack selected' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, error: 'File must be an image' },
                { status: 400 }
            );
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'File size must be less than 10MB' },
                { status: 400 }
            );
        }

        // Create a mock URL for the uploaded image
        // In production, upload to Supabase Storage
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        const sourceImageUrl = `data:${file.type};base64,${base64}`;

        // Create job
        const jobId = uuidv4();
        const job = {
            id: jobId,
            status: 'pending' as const, // Will be 'pending' until payment confirmed
            progress: 0,
            sourceImageUrl,
            styleKey: pack.styleKey, // Use the style from the selected pack
            createdAt: new Date().toISOString()
        };

        jobs.set(jobId, job);
        stickers.set(jobId, []);

        // DO NOT start generation yet - user must pay first
        // Generation will be triggered by webhook after payment

        return NextResponse.json({
            success: true,
            jobId,
            sourceImageUrl: '[stored]' // Don't return base64 in response
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to process upload' },
            { status: 500 }
        );
    }
}

// Background generation function (exported for use in webhook)
export async function startGeneration(jobId: string, sourceImageUrl: string, styleKey: StickerStyleKey) {
    const job = jobs.get(jobId);
    if (!job) return;

    // Update status to processing
    job.status = 'processing';
    jobs.set(jobId, job);

    const emotions = [
        'surprised', 'annoyed', 'confused',
        'frustrated', 'happy', 'sarcastic',
        'worried', 'bored', 'curious'
    ];

    const jobStickers = stickers.get(jobId) || [];

    try {
        // Import the generateStickers function
        const { generateStickers } = await import('@/lib/ai/generate-stickers');

        // Generate all stickers using the AI service with the selected style
        const generatedStickers = await generateStickers(
            sourceImageUrl,
            styleKey,
            (completed, total) => {
                // Update progress
                job.progress = completed;
                jobs.set(jobId, job);
            }
        );

        // Store the generated stickers
        for (const sticker of generatedStickers) {
            jobStickers.push({
                id: uuidv4(),
                jobId,
                emotion: sticker.emotion,
                imageUrl: sticker.imageUrl,
                thumbnailUrl: sticker.thumbnailUrl,
                createdAt: new Date().toISOString()
            });
        }

        stickers.set(jobId, jobStickers);

        // Mark as completed
        job.status = 'completed';
        jobs.set(jobId, job);

    } catch (error) {
        console.error('Generation error:', error);
        job.status = 'failed';
        jobs.set(jobId, job);
    }
}

// Generate a placeholder SVG sticker
function generatePlaceholderSticker(emotion: string): string {
    const emojis: Record<string, string> = {
        surprised: '😲',
        annoyed: '😒',
        confused: '🤔',
        frustrated: '😤',
        happy: '😊',
        sarcastic: '😏',
        worried: '😟',
        bored: '😑',
        curious: '🧐'
    };

    const colors: Record<string, string> = {
        surprised: '#FFD93D',
        annoyed: '#FF6B6B',
        confused: '#4ECDC4',
        frustrated: '#FF8C42',
        happy: '#6BCB77',
        sarcastic: '#9B59B6',
        worried: '#3498DB',
        bored: '#95A5A6',
        curious: '#E91E63'
    };

    const emoji = emojis[emotion] || '😊';
    const color = colors[emotion] || '#8b5cf6';

    const svg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.3"/>
        </filter>
      </defs>
      <circle cx="256" cy="256" r="240" fill="url(#grad)" filter="url(#shadow)"/>
      <text x="256" y="290" font-size="180" text-anchor="middle">${emoji}</text>
      <text x="256" y="420" font-size="36" fill="white" text-anchor="middle" font-family="Arial, sans-serif">${emotion.charAt(0).toUpperCase() + emotion.slice(1)}</text>
    </svg>
  `;

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
