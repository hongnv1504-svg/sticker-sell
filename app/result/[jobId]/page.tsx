'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StickerGrid from '@/components/StickerGrid';
import { Sticker } from '@/lib/types';
import { analytics } from '@/lib/analytics';

interface Props {
    params: Promise<{ jobId: string }>;
}

export default function ResultPage({ params }: Props) {
    const { jobId } = use(params);
    const [stickers, setStickers] = useState<Sticker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPaid, setIsPaid] = useState(false);
    const [email, setEmail] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);

    // Fetch stickers
    useEffect(() => {
        const fetchStickers = async () => {
            try {
                const response = await fetch(`/api/job/${jobId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load stickers');
                }

                setStickers(data.stickers || []);
                setIsPaid(data.isPaid);

                // If not paid, redirect to paywall
                if (!data.isPaid) {
                    window.location.href = `/pay/${jobId}`;
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err instanceof Error ? err.message : 'Something went wrong');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStickers();
    }, [jobId]);

    const handleDownloadFlow = async () => {
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setIsDownloading(true);
        setError(null);

        try {
            const response = await fetch('/api/bundle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId, email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to prepare download');
            }

            setIsEmailSent(true);

            // Track download completion
            analytics.trackDownloadCompleted(jobId);

            // Proactively open the download link in a new tab
            if (data.downloadUrl) {
                window.open(data.downloadUrl, '_blank');
            }
        } catch (err) {
            console.error('Download flow error:', err);
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading your stickers...</p>
                </div>
            </div>
        );
    }

    if (!isPaid) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Success Banner */}
                    <div className="glass-card p-6 mb-8 text-center bg-gradient-to-r from-purple-900/30 to-pink-900/30">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                            <span className="text-4xl">🎉</span>
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Your Stickers Are Ready!</h1>
                        <p className="text-gray-400">Thank you for your purchase. Enjoy your personalized stickers!</p>
                    </div>

                    {/* Stickers Grid */}
                    <div className="glass-card p-6 mb-8">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <span>✨</span> Your Sticker Pack
                        </h3>
                        <StickerGrid
                            stickers={stickers}
                            locked={false}
                        />
                    </div>

                    {/* Download Section */}
                    <div className="glass-card p-6 mb-8">
                        <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                            <span>📥</span> Download Sticker Pack
                        </h3>
                        <p className="text-gray-400 text-sm mb-6">
                            We'll bundle your stickers into a ZIP file and send a secure download link to your email.
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                                    Email Address (for download link)
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="your@email.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleDownloadFlow}
                                disabled={isDownloading || !email}
                                className="btn btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {isDownloading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Processing Pack...
                                    </>
                                ) : (
                                    <>
                                        <span>📦</span>
                                        {isEmailSent ? 'Send Link Again' : 'Bundle & Send Download Link'}
                                    </>
                                )}
                            </button>

                            {isEmailSent && (
                                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start gap-3">
                                    <span className="text-xl">📧</span>
                                    <div>
                                        <p className="text-green-400 font-medium">Link sent to your email!</p>
                                        <p className="text-green-500/70 text-sm">You can re-download your pack using the link in your email for the next 48 hours.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tutorial Section */}
                    <div className="glass-card p-6">
                        <h3 className="font-semibold text-white mb-6 flex items-center gap-2">
                            <span>📚</span> How to Use Your Stickers
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Telegram */}
                            <div className="bg-white/5 rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">
                                        📱
                                    </div>
                                    <h4 className="font-medium">Telegram</h4>
                                </div>
                                <ol className="space-y-2 text-sm text-gray-400">
                                    <li className="flex gap-2">
                                        <span className="text-purple-400">1.</span>
                                        Open Telegram and search for @Stickers bot
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-purple-400">2.</span>
                                        Send /newpack to create a new sticker pack
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-purple-400">3.</span>
                                        Upload each sticker image when prompted
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-purple-400">4.</span>
                                        Choose an emoji for each sticker
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-purple-400">5.</span>
                                        Use /publish to finish
                                    </li>
                                </ol>
                            </div>

                            {/* WhatsApp */}
                            <div className="bg-white/5 rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-xl">
                                        💬
                                    </div>
                                    <h4 className="font-medium">WhatsApp</h4>
                                </div>
                                <ol className="space-y-2 text-sm text-gray-400">
                                    <li className="flex gap-2">
                                        <span className="text-green-400">1.</span>
                                        Install a sticker maker app (e.g., Sticker Maker Studio)
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-green-400">2.</span>
                                        Create a new sticker pack in the app
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-green-400">3.</span>
                                        Import your downloaded sticker images
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-green-400">4.</span>
                                        Tap &quot;Add to WhatsApp&quot;
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-green-400">5.</span>
                                        Find them in your WhatsApp stickers
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Create More */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-400 mb-4">Want to create more stickers?</p>
                        <Link href="/upload" className="btn btn-secondary">
                            Create Another Pack
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
