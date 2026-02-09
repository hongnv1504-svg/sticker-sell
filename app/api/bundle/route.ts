import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { getStorageProvider } from '@/lib/storage';
import { sendDownloadEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const { jobId, email } = await request.json();

        if (!jobId) {
            return NextResponse.json(
                { success: false, error: 'Job ID is required' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdmin();

        // Check if paid in Supabase
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('status')
            .eq('job_id', jobId)
            .single();

        if (orderError || !order || order.status !== 'paid') {
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
            return NextResponse.json(
                { success: false, error: 'No stickers found' },
                { status: 404 }
            );
        }

        console.log(`[Bundle] Creating ZIP for job ${jobId}...`);

        // Create ZIP file
        const zip = new JSZip();

        for (const sticker of jobStickers) {
            if (sticker.image_url) {
                // Handle data URL (used in demo mode)
                if (sticker.image_url.startsWith('data:')) {
                    const matches = sticker.image_url.match(/^data:([^;]+);base64,(.+)$/);
                    if (matches) {
                        const base64Data = matches[2];
                        const extension = matches[1].includes('svg') ? 'svg' : 'png';
                        zip.file(
                            `sticker-${sticker.emotion}.${extension}`,
                            base64Data,
                            { base64: true }
                        );
                    }
                } else {
                    // Handle external URL
                    try {
                        const response = await fetch(sticker.image_url);
                        const buffer = await response.arrayBuffer();
                        zip.file(`sticker-${sticker.emotion}.png`, buffer);
                    } catch (err) {
                        console.error(`Failed to fetch sticker ${sticker.emotion}:`, err);
                    }
                }
            }
        }

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
