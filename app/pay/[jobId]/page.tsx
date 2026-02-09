'use client';

import { useEffect, useState, use } from 'react';
import Header from '@/components/Header';
import { Sticker } from '@/lib/types';

interface Props {
    params: Promise<{ jobId: string }>;
}

export default function PaywallPage({ params }: Props) {
    const { jobId } = use(params);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        setError(null);

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            // Redirect to Lemon Squeezy Checkout
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error('Checkout error:', err);
            setError(err instanceof Error ? err.message : 'Checkout failed');
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-32 pb-20 px-6">
                <div className="max-w-2xl mx-auto">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-4">
                            Create Your AI Stickers 🎨
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Pay now to generate your personalized sticker pack
                        </p>
                    </div>

                    {/* Payment Card */}
                    <div className="glass-card p-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
                                <span className="text-5xl">✨</span>
                            </div>

                            <h2 className="text-2xl font-bold mb-2">AI Sticker Pack</h2>
                            <p className="text-gray-400">9 personalized AI-generated stickers</p>
                        </div>

                        {/* Price */}
                        <div className="text-center mb-8">
                            <div className="text-5xl font-bold gradient-text mb-1">$4.99</div>
                            <p className="text-gray-400 text-sm">~125,000 VND • One-time payment</p>
                        </div>

                        {/* Features */}
                        <ul className="space-y-3 mb-8">
                            {[
                                'High-resolution PNG files',
                                'Transparent backgrounds',
                                'Ready for Telegram & WhatsApp',
                                'Download as ZIP file',
                                'Instant generation after payment'
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-300">
                                    <span className="text-green-400">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* Checkout Button */}
                        <button
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                            className="btn btn-primary w-full text-lg py-4"
                        >
                            {isCheckingOut ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Pay & Generate Stickers
                                    <span>🚀</span>
                                </>
                            )}
                        </button>

                        {/* Trust badges */}
                        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <span>🔒</span> Secure
                            </span>
                            <span className="flex items-center gap-1">
                                <span>⚡</span> Instant
                            </span>
                            <span className="flex items-center gap-1">
                                <span>🍋</span> Lemon Squeezy
                            </span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
