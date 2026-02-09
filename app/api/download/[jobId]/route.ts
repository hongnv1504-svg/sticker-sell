import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { stickers, orders } from '../../upload/route';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { jobId } = await params;

        // Check if paid
        const order = orders.get(jobId);
        if (!order || order.status !== 'paid') {
            return NextResponse.json(
                { success: false, error: 'Payment required' },
                { status: 403 }
            );
        }

        // Get stickers
        const jobStickers = stickers.get(jobId);
        if (!jobStickers || jobStickers.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No stickers found' },
                { status: 404 }
            );
        }

        // Create ZIP file
        const zip = new JSZip();

        for (const sticker of jobStickers) {
            if (sticker.imageUrl) {
                // Handle data URL
                if (sticker.imageUrl.startsWith('data:')) {
                    const matches = sticker.imageUrl.match(/^data:([^;]+);base64,(.+)$/);
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
                        const response = await fetch(sticker.imageUrl);
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
