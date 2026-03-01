// Sticker emotions type
export const STICKER_EMOTIONS = [
    'laughing',
    'rolling_laugh',
    'affectionate',
    'love_struck',
    'thinking',
    'winking',
    'pleading',
    'blowing_kiss',
    'crying'
] as const;

export type StickerEmotion = typeof STICKER_EMOTIONS[number];

// Emoji mappings for each emotion
export const EMOTION_EMOJIS: Record<StickerEmotion, string> = {
    laughing:     '😂',
    rolling_laugh:'🤣',
    affectionate: '🥰',
    love_struck:  '😍',
    thinking:     '🤔',
    winking:      '😉',
    pleading:     '🥺',
    blowing_kiss: '😘',
    crying:       '😢',
};

// Job status type
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Job interface
export interface Job {
    id: string;
    userId?: string;
    status: JobStatus;
    progress: number;
    sourceImageUrl: string;
    createdAt: string;
    updatedAt: string;
}

// Sticker interface
export interface Sticker {
    id: string;
    jobId: string;
    emotion: StickerEmotion;
    imageUrl: string | null;
    thumbnailUrl: string | null;
    createdAt: string;
}

// Order interface
export interface Order {
    id: string;
    jobId: string;
    stripeSessionId: string | null;
    stripePaymentIntent: string | null;
    amountCents: number;
    currency: string;
    status: 'pending' | 'paid' | 'failed';
    createdAt: string;
}

// API response types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Upload response
export interface UploadResponse {
    jobId: string;
    sourceImageUrl: string;
}

// Job status response
export interface JobStatusResponse {
    job: Job;
    stickers: Sticker[];
    isPaid: boolean;
}
