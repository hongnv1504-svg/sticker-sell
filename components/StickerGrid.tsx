'use client';

import { Sticker, EMOTION_EMOJIS, StickerEmotion } from '@/lib/types';

interface StickerGridProps {
    stickers: Sticker[];
    locked?: boolean;
    loading?: boolean;
    progress?: number;
}

export default function StickerGrid({
    stickers,
    locked = false,
    loading = false,
    progress = 0
}: StickerGridProps) {
    console.log(`[DEBUG] StickerGrid received ${stickers.length} stickers, progress: ${progress}`);
    if (stickers.length > 0) {
        console.log(`[DEBUG] Sticker 0 emotion: ${stickers[0].emotion}, hasUrl: ${!!stickers[0].imageUrl}`);
    }
    const emotions: StickerEmotion[] = [
        'surprised', 'annoyed', 'confused',
        'frustrated', 'happy', 'sarcastic',
        'worried', 'bored', 'curious'
    ];

    return (
        <div className="sticker-grid">
            {emotions.map((emotion, index) => {
                const sticker = stickers.find(s => s.emotion === emotion);
                const isGenerated = !!sticker?.imageUrl;
                const isGenerating = loading && progress === index;
                const isPending = loading && progress < index;

                return (
                    <div
                        key={emotion}
                        className={`sticker-item group ${locked ? 'locked' : ''} ${isGenerating ? 'animate-pulse-glow' : ''}`}
                    >
                        {/* Background gradient */}
                        <div className="absolute inset-0 opacity-50"
                            style={{
                                background: `linear-gradient(135deg, 
                     ${getEmotionColor(emotion)}20 0%, 
                     ${getEmotionColor(emotion)}40 100%)`
                            }}
                        />

                        {/* Content */}
                        <div className="relative w-full h-full flex flex-col items-center justify-center p-2">
                            {isGenerating ? (
                                // Generating state
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs text-gray-400">Generating...</span>
                                </div>
                            ) : isPending ? (
                                // Pending state
                                <div className="flex flex-col items-center gap-2 opacity-30">
                                    <span className="text-4xl">{EMOTION_EMOJIS[emotion]}</span>
                                    <span className="text-xs text-gray-500 capitalize">{emotion}</span>
                                </div>
                            ) : isGenerated ? (
                                // Generated sticker
                                <>
                                    <img
                                        src={sticker?.imageUrl || ''}
                                        alt={emotion}
                                        className={`w-full h-full object-contain ${locked ? 'blur-md' : ''}`}
                                    />

                                    {/* Download Button */}
                                    {!locked && sticker?.imageUrl && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const link = document.createElement('a');
                                                link.href = sticker.imageUrl!;
                                                link.download = `sticker-${emotion}.png`;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                            className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-xl text-white transition-all border border-white/20 shadow-lg group-hover:scale-110"
                                            title="Download Sticker"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
                                                <polyline points="7 10 12 15 17 10"></polyline>
                                                <line x1="12" y1="15" x2="12" y2="3"></line>
                                            </svg>
                                        </button>
                                    )}

                                    <span className="absolute bottom-2 text-xs text-gray-400 capitalize bg-black/50 px-2 py-0.5 rounded-full">
                                        {emotion}
                                    </span>
                                </>
                            ) : (
                                // Empty state with emoji placeholder
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-4xl opacity-50">{EMOTION_EMOJIS[emotion]}</span>
                                    <span className="text-xs text-gray-500 capitalize">{emotion}</span>
                                </div>
                            )}
                        </div>

                        {/* Lock overlay */}
                        {locked && isGenerated && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
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
        surprised: '#FFD93D',
        annoyed: '#FF6B6B',
        confused: '#4ECDC4',
        frustrated: '#FF8C42',
        happy: '#6BCB77',
        sarcastic: '#9B59B6',
        worried: '#3498DB',
        bored: '#95A5A6',
        curious: '#E91E63'
    };
    return colors[emotion];
}
