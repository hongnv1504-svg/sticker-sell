'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { STICKER_PACKS } from '@/lib/packs';

export default function PacksPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-32 pb-20 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Title */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Choose Your <span className="gradient-text">Sticker Style</span>
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Each pack transforms your photo into 9 unique stickers with different emotions.
                            Pick the style that matches your vibe!
                        </p>
                    </div>

                    {/* Pack Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {STICKER_PACKS.map((pack) => (
                            <Link
                                key={pack.id}
                                href={`/upload?pack=${pack.id}`}
                                className="group"
                            >
                                <div
                                    className="glass-card p-6 h-full relative overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-lg"
                                    style={{
                                        borderColor: `${pack.colors.primary}40`,
                                    }}
                                >
                                    {/* Popular badge */}
                                    {pack.popular && (
                                        <div
                                            className="absolute top-0 right-0 text-white text-xs font-medium px-3 py-1 rounded-bl-xl"
                                            style={{ background: `linear-gradient(135deg, ${pack.colors.primary}, ${pack.colors.secondary})` }}
                                        >
                                            Most Popular
                                        </div>
                                    )}

                                    {/* Icon & Name */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                                            style={{ background: `linear-gradient(135deg, ${pack.colors.primary}30, ${pack.colors.secondary}30)` }}
                                        >
                                            {pack.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">{pack.name}</h3>
                                            <p className="text-sm text-gray-400">${(pack.price / 100).toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-400 text-sm mb-4">
                                        {pack.description}
                                    </p>

                                    {/* Preview Emojis */}
                                    <div className="grid grid-cols-9 gap-1 mb-4">
                                        {pack.previewEmojis.map((emoji, i) => (
                                            <div
                                                key={i}
                                                className="aspect-square rounded-lg flex items-center justify-center text-lg transition-transform group-hover:scale-110"
                                                style={{
                                                    background: `linear-gradient(135deg, ${pack.colors.primary}20, ${pack.colors.secondary}20)`,
                                                    transitionDelay: `${i * 30}ms`
                                                }}
                                            >
                                                {emoji}
                                            </div>
                                        ))}
                                    </div>

                                    {/* CTA */}
                                    <div
                                        className="w-full py-3 rounded-full text-center font-medium text-white transition-all group-hover:scale-105"
                                        style={{ background: `linear-gradient(135deg, ${pack.colors.primary}, ${pack.colors.secondary})` }}
                                    >
                                        Select This Style →
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Info */}
                    <div className="mt-12 text-center text-gray-400">
                        <p>All packs include 9 different expressions • Transparent PNG • Instant download</p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
