import { NextRequest, NextResponse, after } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getPackById } from '@/lib/packs';
import { StickerStyleKey } from '@/lib/ai/sticker-styles';

import { getSupabaseAdmin } from '@/lib/supabase/server';

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
        const buffer = Buffer.from(bytes);
        // Create job
        const jobId = uuidv4();
        const supabase = getSupabaseAdmin();

        // 1. Upload to Supabase Storage for stability (Replicate prefers URLs)
        const fileName = `${jobId}/source.${file.type.split('/')[1] || 'png'}`;

        console.log(`[DEBUG] Uploading source image to storage: ${fileName}`);
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('stickers') // Make sure this bucket exists and is public
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (uploadError) {
            console.error('Failed to upload to Supabase Storage:', uploadError);
            // Fallback to base64 if storage fails, but warn
        }

        const { data: { publicUrl } } = supabase.storage
            .from('stickers')
            .getPublicUrl(fileName);

        const sourceImageUrl = publicUrl || `data:${file.type};base64,${buffer.toString('base64')}`;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'unknown';
        console.log(`[DEBUG] Job Source URL: ${sourceImageUrl.substring(0, 50)}...`);

        const { error: jobError } = await supabase
            .from('sticker_jobs')
            .insert({
                id: jobId,
                status: 'pending',
                progress: 0,
                source_image_url: sourceImageUrl,
                style_key: pack.styleKey
            });

        if (jobError) {
            console.error('Failed to create job in Supabase:', jobError);
            throw new Error('Failed to create job');
        }

        // Use after() to trigger generation AFTER the response is sent.
        // This keeps the Vercel function alive until the fetch is dispatched,
        // preventing the race condition where the function terminates before
        // the background fetch can initiate.
        const baseUrl = request.nextUrl.origin;
        const generateUrl = `${baseUrl}/api/generate/${jobId}`;
        console.log(`[UPLOAD] Triggering generation at: ${generateUrl}`);
        after(async () => {
            try {
                await fetch(generateUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });
            } catch (err) {
                console.error('[UPLOAD] Failed to trigger generation:', err);
            }
        });

        return NextResponse.json({
            success: true,
            jobId,
            sourceImageUrl: '[stored]',
            debug: {
                targetUrl: supabaseUrl
            }
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
    const supabase = getSupabaseAdmin();

    // Update status to processing
    await supabase
        .from('sticker_jobs')
        .update({ status: 'processing' })
        .eq('id', jobId);

    try {
        // Import the generateStickers function
        const { generateStickers } = await import('@/lib/ai/generate-stickers');

        // Generate all stickers using the AI service with the selected style
        const generatedStickers = await generateStickers(
            sourceImageUrl,
            styleKey,
            async (completed, total) => {
                // Update progress
                await supabase
                    .from('sticker_jobs')
                    .update({ progress: completed })
                    .eq('id', jobId);
            }
        );

        // Store the generated stickers
        const stickerInserts = generatedStickers.map(sticker => ({
            job_id: jobId,
            emotion: sticker.emotion,
            image_url: sticker.imageUrl,
            thumbnail_url: sticker.thumbnailUrl
        }));

        const { error: stickerError } = await supabase
            .from('generated_stickers')
            .insert(stickerInserts);

        if (stickerError) {
            console.error('Failed to store stickers in Supabase:', stickerError);
            throw stickerError;
        }

        // Mark as completed
        await supabase
            .from('sticker_jobs')
            .update({ status: 'completed' })
            .eq('id', jobId);

    } catch (error) {
        console.error('Generation error:', error);
        await supabase
            .from('sticker_jobs')
            .update({ status: 'failed' })
            .eq('id', jobId);
    }
}

// Generate a placeholder SVG sticker
function generatePlaceholderSticker(emotion: string): string {
    const emojis: Record<string, string> = {
        laughing: '😂',
        rolling_laugh: '🤣',
        affectionate: '🥰',
        love_struck: '😍',
        thinking: '🤔',
        winking: '😉',
        pleading: '🥺',
        blowing_kiss: '😘',
        crying: '😢',
    };

    const colors: Record<string, string> = {
        laughing: '#FFD93D',
        rolling_laugh: '#FF8C42',
        affectionate: '#FF9ECD',
        love_struck: '#FF6B6B',
        thinking: '#4ECDC4',
        winking: '#9B59B6',
        pleading: '#3498DB',
        blowing_kiss: '#E91E63',
        crying: '#95A5A6',
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
