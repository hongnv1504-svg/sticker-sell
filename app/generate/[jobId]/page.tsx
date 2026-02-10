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

    useEffect(() => {
        let isMounted = true;

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

    // Calculate estimated time remaining
    const remainingStickers = STICKER_EMOTIONS.length - progress;
    const estimatedSeconds = remainingStickers * 2;

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
                                <h1 className="text-4xl font-bold mb-4">Stickers Ready!</h1>
                                <p className="text-gray-400 text-lg">
                                    Redirecting to preview...
                                </p>
                            </>
                        ) : status === 'failed' ? (
                            <>
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
                                    <span className="text-4xl">😕</span>
                                </div>
                                <h1 className="text-4xl font-bold mb-4">Generation Failed</h1>
                                <p className="text-gray-400 text-lg">
                                    {error || 'Something went wrong'}
                                </p>
                            </>
                        ) : status === 'loading' ? (
                            <>
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                                    <span className="text-4xl animate-spin">⏳</span>
                                </div>
                                <h1 className="text-4xl font-bold mb-4">Checking Status...</h1>
                                <p className="text-gray-400 text-lg">
                                    Verifying payment and job status...
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4 animate-pulse-glow">
                                    <span className="text-4xl animate-spin">✨</span>
                                </div>
                                <h1 className="text-4xl font-bold mb-4">Creating Your Stickers</h1>
                                <p className="text-gray-400 text-lg">
                                    AI is transforming you into a cute 3D character...
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
                                label={`Rendering sticker ${progress + 1} of ${STICKER_EMOTIONS.length}`}
                            />

                            <p className="text-center text-sm text-gray-400 mt-4">
                                ⏱️ Estimated time: ~{estimatedSeconds} seconds remaining
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
                                Try Again with New Photo
                            </button>
                        </div>
                    )}

                    {/* Processing info */}
                    {status === 'processing' && (
                        <div className="mt-8 text-center text-gray-400 text-sm">
                            <p>Please don&apos;t close this page while generating.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
