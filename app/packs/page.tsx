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
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#222222]">
                            Chọn Phong Cách <span className="gradient-text">Sticker</span>
                        </h1>
                        <p className="text-[#a7a7a7] text-lg max-w-2xl mx-auto">
                            Mỗi bộ biến ảnh của bạn thành 6 sticker với các biểu cảm khác nhau.
                            Chọn phong cách phù hợp với bạn!
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
                                    className="glass-card p-6 h-full flex flex-col relative overflow-hidden transition-shadow duration-300 group-hover:shadow-lg"
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
                                            Phổ Biến Nhất
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
                                            <h3 className="text-xl font-bold text-[#222222]">{pack.name}</h3>
                                            <p className="text-sm text-[#a7a7a7]">39,000đ</p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-[#a7a7a7] text-sm mb-4 flex-grow">
                                        {pack.description}
                                    </p>

                                    {/* Sample sticker or emoji preview */}
                                    {pack.sampleImage ? (
                                        <div className="flex items-center gap-3 mb-4">
                                            <div
                                                className="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0"
                                                style={{ background: `linear-gradient(135deg, ${pack.colors.primary}15, ${pack.colors.secondary}15)` }}
                                            >
                                                <img
                                                    src={pack.sampleImage}
                                                    alt={`${pack.name} sample`}
                                                    className="w-full h-full object-contain p-1"
                                                />
                                            </div>
                                            <div className="grid grid-cols-4 gap-1 flex-1">
                                                {pack.previewEmojis.slice(0, 8).map((emoji, i) => (
                                                    <div
                                                        key={i}
                                                        className="aspect-square rounded-lg flex items-center justify-center text-base"
                                                        style={{ background: `linear-gradient(135deg, ${pack.colors.primary}20, ${pack.colors.secondary}20)` }}
                                                    >
                                                        {emoji}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-6 gap-1 mb-4">
                                            {pack.previewEmojis.map((emoji, i) => (
                                                <div
                                                    key={i}
                                                    className="aspect-square rounded-lg flex items-center justify-center text-lg"
                                                    style={{ background: `linear-gradient(135deg, ${pack.colors.primary}20, ${pack.colors.secondary}20)` }}
                                                >
                                                    {emoji}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* CTA */}
                                    <div
                                        className="w-full py-3 rounded-full text-center font-medium text-white"
                                        style={{ background: `linear-gradient(135deg, ${pack.colors.primary}, ${pack.colors.secondary})` }}
                                    >
                                        Chọn Phong Cách Này →
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Info */}
                    <div className="mt-12 text-center text-[#a7a7a7]">
                        <p>Tất cả đều có 6 biểu cảm • PNG trong suốt • Tải ngay</p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
