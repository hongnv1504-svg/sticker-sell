'use client';

import { useState } from 'react';
import { Sticker, EMOTION_EMOJIS, StickerEmotion } from '@/lib/types';

interface StickerGridProps {
    stickers: Sticker[];
    locked?: boolean;
    loading?: boolean;
    progress?: number;
}

async function downloadSticker(imageUrl: string, emotion: string) {
    try {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sticker-${emotion}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch {
        window.open(imageUrl, '_blank');
    }
}

export default function StickerGrid({
    stickers,
    locked = false,
    loading = false,
    progress = 0
}: StickerGridProps) {
    const [downloading, setDownloading] = useState<string | null>(null);

    const emotions: StickerEmotion[] = [
        'laughing',     'rolling_laugh', 'affectionate',
        'love_struck',  'thinking',      'winking',
        'pleading',     'blowing_kiss',  'crying',
    ];

    return (
        <div className="sticker-grid">
            {emotions.map((emotion) => {
                const sticker = stickers.find(s => s.emotion === emotion);
                const isAsyncGenerating = sticker?.imageUrl?.startsWith('{');
                const isGenerated = !!sticker?.imageUrl && !isAsyncGenerating;
                const isGenerating = !isGenerated && (loading || isAsyncGenerating);

                return (
                    <div
                        key={emotion}
                        className={`sticker-item group ${locked ? 'locked' : ''}`}
                    >
                        {/* Subtle emotion color tint on white card */}
                        <div className="absolute inset-0 opacity-30"
                            style={{
                                background: `linear-gradient(135deg,
                     ${getEmotionColor(emotion)}25 0%,
                     ${getEmotionColor(emotion)}45 100%)`
                            }}
                        />

                        {/* Content */}
                        <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
                            {isGenerating ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 border-2 border-[#FA5D29] border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs text-[#a7a7a7]">Generating...</span>
                                </div>
                            ) : isGenerated ? (
                                <>
                                    <img
                                        src={sticker?.imageUrl || ''}
                                        alt={emotion}
                                        className={`w-full h-full object-contain ${locked ? 'blur-md' : ''}`}
                                        onError={(e) => {
                                            console.error(`[IMG] Failed to load ${emotion}:`, (e.target as HTMLImageElement).src.substring(0, 80));
                                        }}
                                    />

                                    {/* Download button */}
                                    {!locked && sticker?.imageUrl && (
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                setDownloading(emotion);
                                                await downloadSticker(sticker.imageUrl!, emotion);
                                                setDownloading(null);
                                            }}
                                            disabled={downloading === emotion}
                                            className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-lg text-[#222222] transition-all border border-[#ededed] shadow-sm"
                                            title="Download PNG"
                                        >
                                            {downloading === emotion ? (
                                                <div className="w-[18px] h-[18px] border-2 border-[#FA5D29] border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="7 10 12 15 17 10" />
                                                    <line x1="12" y1="15" x2="12" y2="3" />
                                                </svg>
                                            )}
                                        </button>
                                    )}

                                    <span className="absolute bottom-2 text-xs text-[#a7a7a7] bg-white/80 px-2 py-0.5 rounded-full border border-[#ededed]">
                                        {formatEmotion(emotion)}
                                    </span>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-4xl opacity-40">{EMOTION_EMOJIS[emotion]}</span>
                                    <span className="text-xs text-[#a7a7a7]">{formatEmotion(emotion)}</span>
                                </div>
                            )}
                        </div>

                        {/* Lock overlay */}
                        {locked && isGenerated && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                                <div className="text-center">
                                    <span className="text-3xl">🔒</span>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function getEmotionColor(emotion: StickerEmotion): string {
    const colors: Record<StickerEmotion, string> = {
        laughing:     '#FFD93D',
        rolling_laugh:'#FF8C42',
        affectionate: '#FF9ECD',
        love_struck:  '#FF6B6B',
        thinking:     '#4ECDC4',
        winking:      '#9B59B6',
        pleading:     '#3498DB',
        blowing_kiss: '#E91E63',
        crying:       '#95A5A6',
    };
    return colors[emotion];
}

function formatEmotion(emotion: string): string {
    return emotion.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
