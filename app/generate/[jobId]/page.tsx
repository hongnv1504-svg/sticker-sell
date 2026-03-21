'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import StickerGrid from '@/components/StickerGrid';
import ProgressBar from '@/components/ProgressBar';
import { Sticker, STICKER_EMOTIONS } from '@/lib/types';

interface Props {
    params: Promise<{ jobId: string }>;
}

export default function GeneratePage({ params }: Props) {
    const { jobId } = use(params);
    const router = useRouter();
    const [progress, setProgress] = useState(0);
    const [stickers, setStickers] = useState<Sticker[]>([]);
    const [status, setStatus] = useState<'loading' | 'processing' | 'completed' | 'failed'>('loading');
    const [error, setError] = useState<string | null>(null);

    const triggeredRef = useState(false);

    useEffect(() => {
        let isMounted = true;

        const triggerGeneration = async () => {
            try {
                console.log('[Generate] Triggering background generation...');
                const res = await fetch('/api/generate/background', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jobId }),
                });
                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    console.error('[Generate] Background trigger failed:', res.status, errData);
                } else {
                    console.log('[Generate] Background generation triggered successfully');
                }
            } catch (err) {
                console.error('[Generate] Failed to trigger background:', err);
            }
        };

        const pollStatus = async () => {
            try {
                const response = await fetch(`/api/job/${jobId}`);
                const data = await response.json();

                if (!isMounted) return;

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to get job status');
                }

                // Check if payment is required
                if (!data.isPaid) {
                    // Redirect to payment page if not paid
                    router.push(`/pay/${jobId}`);
                    return;
                }

                setProgress(data.job?.progress || 0);
                setStickers(data.stickers || []);

                // If paid but job is still 'pending' (no AI triggered yet), kick off generation
                if (data.job?.status === 'pending' && !triggeredRef[0]) {
                    triggeredRef[1](true);
                    triggerGeneration();
                }

                if (data.job?.status === 'completed') {
                    setStatus('completed');
                    // Redirect to result page after completion
                    setTimeout(() => {
                        router.push(`/result/${jobId}`);
                    }, 1500);
                } else if (data.job?.status === 'failed') {
                    setStatus('failed');
                    setError('Generation failed. Please try again.');
                } else {
                    // Update to processing after first successful fetch
                    setStatus('processing');
                    // Continue polling
                    setTimeout(pollStatus, 1000);
                }
            } catch (err) {
                if (!isMounted) return;
                console.error('Polling error:', err);
                setError(err instanceof Error ? err.message : 'Something went wrong');
                setStatus('failed');
            }
        };

        // Start polling
        pollStatus();

        return () => {
            isMounted = false;
        };
    }, [jobId, router]);


    const handleRetry = () => {
        router.push('/upload');
    };

    // Estimated time: stickers generate in parallel batches of 3 (~30s total).
    // Show a countdown based on how many are done vs total.
    const remainingStickers = STICKER_EMOTIONS.length - progress;
    const estimatedSeconds = progress === 0
        ? 60                                   // cold start — no info yet
        : Math.max(5, remainingStickers * 8);  // ~8s per remaining (parallel)

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-32 pb-20 px-6">
                <div className="max-w-3xl mx-auto">
                    {/* Title */}
                    <div className="text-center mb-12">
                        {status === 'completed' ? (
                            <>
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                                    <span className="text-4xl">✨</span>
                                </div>
                                <h1 className="text-4xl font-bold mb-4">Sticker Đã Sẵn Sàng!</h1>
                                <p className="text-gray-400 text-lg">
                                    Đang chuyển hướng...
                                </p>
                            </>
                        ) : status === 'failed' ? (
                            <>
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                                    <span className="text-4xl">😕</span>
                                </div>
                                <h1 className="text-4xl font-bold mb-4">Tạo Sticker Thất Bại</h1>
                                <p className="text-gray-400 text-lg">
                                    {error || 'Something went wrong'}
                                </p>
                            </>
                        ) : status === 'loading' ? (
                            <>
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                                    <span className="text-4xl animate-spin">⏳</span>
                                </div>
                                <h1 className="text-4xl font-bold mb-4">Đang Kiểm Tra...</h1>
                                <p className="text-gray-400 text-lg">
                                    Đang xác nhận thanh toán...
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4 animate-pulse-glow">
                                    <span className="text-4xl animate-spin">✨</span>
                                </div>
                                <h1 className="text-4xl font-bold mb-4">Đang Tạo Sticker Cho Bạn</h1>
                                <p className="text-gray-400 text-lg">
                                    AI đang biến bạn thành nhân vật dễ thương...
                                </p>
                            </>
                        )}
                    </div>

                    {/* Progress */}
                    {status === 'processing' && (
                        <div className="mb-8">
                            <ProgressBar
                                current={progress}
                                total={STICKER_EMOTIONS.length}
                                label={
                                    progress === 0
                                        ? `Bắt đầu tạo sticker...`
                                        : `${progress}/${STICKER_EMOTIONS.length} sticker hoàn thành ✨`
                                }
                            />

                            <p className="text-center text-sm text-gray-400 mt-4">
                                ⏱️ ~{estimatedSeconds}s còn lại
                            </p>
                        </div>
                    )}

                    {/* Sticker Grid */}
                    <div className="glass-card p-6">
                        <StickerGrid
                            stickers={stickers}
                            loading={status === 'processing'}
                            progress={progress}
                            locked={false}
                        />
                    </div>

                    {/* Retry Button */}
                    {status === 'failed' && (
                        <div className="mt-8 text-center">
                            <button
                                onClick={handleRetry}
                                className="btn btn-primary"
                            >
                                Thử Lại Với Ảnh Mới
                            </button>
                        </div>
                    )}

                    {/* Processing info */}
                    {status === 'processing' && (
                        <div className="mt-8 text-center text-gray-400 text-sm">
                            <p>Vui lòng không đóng trang này khi đang tạo sticker.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
