import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId } = await params;
        const supabase = getSupabaseAdmin();

        // Check if paid in Supabase
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('job_id', jobId)
            .single();

        if (orderError || !order || order.status !== 'paid') {
            return NextResponse.json(
                { success: false, error: 'Payment required' },
                { status: 403 }
            );
        }

        // Get stickers from Supabase
        const { data: jobStickers, error: stickerError } = await supabase
            .from('generated_stickers')
            .select('*')
            .eq('job_id', jobId);

        if (stickerError || !jobStickers || jobStickers.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No stickers found' },
                { status: 404 }
            );
        }

        // Create ZIP file
        const zip = new JSZip();

        for (const sticker of jobStickers) {
            if (sticker.image_url) {
                // Handle data URL
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
                    // Handle URL - fetch and add
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

        // Generate ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' });

        // Return ZIP file
        return new Response(zipBlob, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="stickers-${jobId.slice(0, 8)}.zip"`,
            }
        });

    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create download' },
            { status: 500 }
        );
    }
}
