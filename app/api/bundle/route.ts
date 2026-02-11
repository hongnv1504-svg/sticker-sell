import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getStorageProvider } from '@/lib/storage';
import { sendDownloadEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const { jobId: rawJobId, email } = await request.json();
        const jobId = rawJobId?.trim();

        if (!jobId) {
            return NextResponse.json(
                { success: false, error: 'Job ID is required' },
                { status: 400 }
            );
        }

        console.log(`[Bundle] Starting bundle for Job ID: ${jobId}, email: ${email}`);

        const supabase = getSupabaseAdmin();

        // Check if paid in Supabase
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('status')
            .eq('job_id', jobId)
            .single();

        if (orderError || !order || order.status !== 'paid') {
            console.error(`[Bundle] Payment check failed for ${jobId}:`, orderError || 'Not paid');
            return NextResponse.json(
                { success: false, error: 'Payment required' },
                { status: 403 }
            );
        }

        // Get stickers from Supabase
        const { data: jobStickers, error: stickersError } = await supabase
            .from('generated_stickers')
            .select('*')
            .eq('job_id', jobId);

        if (stickersError || !jobStickers || jobStickers.length === 0) {
            console.error(`[Bundle] No stickers found in DB for job ${jobId}. Error:`, stickersError);
            return NextResponse.json(
                { success: false, error: 'No stickers found in database' },
                { status: 404 }
            );
        }

        console.log(`[Bundle] Found ${jobStickers.length} sticker records for job ${jobId}.`);

        console.log(`[Bundle] Creating ZIP for job ${jobId}...`);

        // Create ZIP file
        const zip = new JSZip();
        let addedCount = 0;

        for (const sticker of jobStickers) {
            const url = sticker.image_url;
            if (url) {
                // Handle data URL (used in demo mode)
                if (url.startsWith('data:')) {
                    if (url.includes('base64,')) {
                        const matches = url.match(/^data:([^;]+);base64,(.+)$/);
                        if (matches) {
                            const base64Data = matches[2];
                            const extension = matches[1].includes('svg') ? 'svg' : 'png';
                            zip.file(`sticker-${sticker.emotion}.${extension}`, base64Data, { base64: true });
                            addedCount++;
                        }
                    } else {
                        // Support non-base64 (like encoded SVG)
                        const parts = url.split(',');
                        if (parts.length > 1) {
                            const content = decodeURIComponent(parts[1]);
                            const extension = url.includes('svg') ? 'svg' : 'png';
                            zip.file(`sticker-${sticker.emotion}.${extension}`, content);
                            addedCount++;
                        }
                    }
                } else {
                    // Handle external URL
                    try {
                        console.log(`[Bundle] Fetching sticker for ${sticker.emotion}: ${url}`);
                        const response = await fetch(url);
                        if (!response.ok) throw new Error(`Fetch status: ${response.status}`);

                        const buffer = await response.arrayBuffer();
                        if (buffer.byteLength < 100) {
                            console.warn(`[Bundle] Warning: Sticker ${sticker.emotion} buffer is suspiciously small: ${buffer.byteLength} bytes`);
                        }

                        zip.file(`sticker-${sticker.emotion}.png`, buffer);
                        addedCount++;
                    } catch (err) {
                        console.error(`[Bundle] Failed to fetch sticker ${sticker.emotion}:`, err);
                    }
                }
            } else {
                console.warn(`[Bundle] Sticker record ${sticker.id} for ${sticker.emotion} has no image_url`);
            }
        }

        if (addedCount === 0) {
            console.error(`[Bundle] Failed to add ANY stickers to the ZIP for job ${jobId}`);
            return NextResponse.json(
                { success: false, error: 'Failed to bundle stickers (images could not be retrieved)' },
                { status: 500 }
            );
        }

        console.log(`[Bundle] successfully added ${addedCount} stickers to ZIP for job ${jobId}.`);

        // Generate ZIP as buffer
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

        // Upload to storage
        const storage = getStorageProvider();
        const storagePath = `sticker-packs/${jobId}.zip`;

        console.log(`[Bundle] Uploading ZIP to storage at ${storagePath}...`);
        await storage.upload(storagePath, zipBuffer, 'application/zip');

        // Generate signed URL (48 hours)
        console.log(`[Bundle] Generating signed URL...`);
        const signedUrl = await storage.getSignedUrl(storagePath, 172800);

        // Send email if provided
        if (email) {
            console.log(`[Bundle] Triggering email to ${email}...`);
            await sendDownloadEmail(email, signedUrl, jobId);
        }

        return NextResponse.json({
            success: true,
            downloadUrl: signedUrl,
            emailSent: !!email
        });

    } catch (error) {
        console.error('Bundle error:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to create bundle' },
            { status: 500 }
        );
    }
}
