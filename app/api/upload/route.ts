import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getPackById } from '@/lib/packs';
import { StickerStyleKey } from '@/lib/ai/sticker-styles';

import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const packId = formData.get('packId') as string | null;
        const telegramToken = formData.get('telegram_token') as string | null;

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

        // 1. Upload to Supabase Storage for stability (OpenAI prefers URLs)
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
                style_key: pack.styleKey,
                ...(telegramToken ? { telegram_token: telegramToken } : {})
            });

        if (jobError) {
            console.error('Failed to create job in Supabase:', jobError);
            throw new Error('Failed to create job');
        }

        // NOTE: Generation is NOT triggered here.
        // It will be triggered by the payment webhook:
        //   - LemonSqueezy: /api/webhook/lemonsqueezy
        //   - Sepay (VN): /api/payment/vn/webhook

        return NextResponse.json({
            success: true,
            jobId,
            sourceImageUrl: '[stored]',
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
        const { generateSingleSticker } = await import('@/lib/ai/generate-stickers');
        const { STICKER_EMOTIONS } = await import('@/lib/types');

        // Generate and save each sticker immediately as it completes
        for (let i = 0; i < STICKER_EMOTIONS.length; i++) {
            const emotion = STICKER_EMOTIONS[i];
            console.log(`[Generation] Generating sticker ${i + 1}/${STICKER_EMOTIONS.length}: ${emotion}`);

            const sticker = await generateSingleSticker(sourceImageUrl, styleKey, emotion);

            // Save immediately so frontend can show it right away
            await supabase
                .from('generated_stickers')
                .insert({
                    job_id: jobId,
                    emotion: sticker.emotion,
                    image_url: sticker.imageUrl,
                    thumbnail_url: sticker.thumbnailUrl,
                });

            // Update progress count
            await supabase
                .from('sticker_jobs')
                .update({ progress: i + 1 })
                .eq('id', jobId);

            console.log(`[Generation] ✅ Saved sticker ${i + 1}/${STICKER_EMOTIONS.length}: ${emotion}`);
        }

        // Mark as completed
        await supabase
            .from('sticker_jobs')
            .update({ status: 'completed' })
            .eq('id', jobId);

        // --- Telegram Integration: Create Sticker Pack ---
        const { data: jobData } = await supabase
            .from('sticker_jobs')
            .select('telegram_token')
            .eq('id', jobId)
            .single();

        if (jobData?.telegram_token) {
            console.log(`[Telegram] Job has token, finding session for token: ${jobData.telegram_token}`);
            const { data: session } = await supabase
                .from('telegram_sessions')
                .select('telegram_user_id, chat_id')
                .eq('token', jobData.telegram_token)
                .single();

            if (session) {
                console.log(`[Telegram] Found session for user ${session.telegram_user_id}, pushing stickers...`);
                try {
                    const { buildPackName, createNewStickerSet, addStickerToSet, uploadStickerFile, sendMessage } = await import('@/lib/telegram');

                    const { data: generatedStickers } = await supabase
                        .from('generated_stickers')
                        .select('emotion, image_url')
                        .eq('job_id', jobId);

                    if (generatedStickers && generatedStickers.length > 0) {
                        const EMOTIONS_TO_EMOJI: Record<string, string> = {
                            laughing: '😂',
                            affectionate: '🥰',
                            thinking: '🤔',
                            winking: '😉',
                            blowing_kiss: '😘',
                            crying: '😢',
                        };

                        const packName = buildPackName(jobId);

                        // Process the first sticker to create the pack
                        console.log(`[Telegram] Creating pack ${packName}`);
                        const firstSticker = generatedStickers[0];

                        // We need to fetch the image buffer from the data URL
                        const fetchBuffer = async (url: string) => {
                            if (url.startsWith('data:')) {
                                return Buffer.from(url.split(',')[1], 'base64');
                            }
                            const res = await fetch(url);
                            return Buffer.from(await res.arrayBuffer());
                        };

                        const firstBuffer = await fetchBuffer(firstSticker.image_url);
                        const firstFileId = await uploadStickerFile(session.telegram_user_id, firstBuffer);

                        await createNewStickerSet({
                            telegramUserId: session.telegram_user_id,
                            shortName: jobId.replace(/-/g, '').substring(0, 12).toLowerCase(),
                            title: 'My AI Stickers',
                            stickerFileId: firstFileId,
                            emoji: EMOTIONS_TO_EMOJI[firstSticker.emotion] || '😊'
                        });

                        // Add the rest
                        for (let i = 1; i < generatedStickers.length; i++) {
                            const sticker = generatedStickers[i];
                            console.log(`[Telegram] Adding sticker ${i + 1}/${generatedStickers.length}`);
                            const buffer = await fetchBuffer(sticker.image_url);
                            const fileId = await uploadStickerFile(session.telegram_user_id, buffer);
                            await addStickerToSet({
                                telegramUserId: session.telegram_user_id,
                                packName,
                                stickerFileId: fileId,
                                emoji: EMOTIONS_TO_EMOJI[sticker.emotion] || '😊'
                            });
                        }

                        // Send success message
                        await sendMessage(
                            session.chat_id,
                            `🎉 <b>Hoàn tất!</b> Sticker của bạn đã sẵn sàng.\n\n` +
                            `👉 Click vào đây để thêm vào Telegram:\n` +
                            `https://t.me/addstickers/${packName}`
                        );
                        console.log(`[Telegram] Successfully sent pack to user.`);

                        // Save the pack URL to the job
                        const packUrl = `https://t.me/addstickers/${packName}`;
                        await supabase
                            .from('sticker_jobs')
                            .update({ telegram_pack_url: packUrl })
                            .eq('id', jobId);
                    }
                } catch (tgError) {
                    console.error('[Telegram] Failed to create sticker pack:', tgError);
                    // We don't fail the whole job if telegram fails
                }
            } else {
                console.log(`[Telegram] No session found for token: ${jobData.telegram_token}`);
            }
        }

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
