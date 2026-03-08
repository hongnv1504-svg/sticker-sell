/**
 * Telegram Bot API helper
 * Docs: https://core.telegram.org/bots/api
 */

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'StickerMeAppBot';
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function callTelegram(method: string, body: Record<string, unknown>): Promise<unknown> {
    const res = await fetch(`${BASE_URL}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const json = await res.json() as { ok: boolean; result: unknown; description?: string };
    if (!json.ok) {
        throw new Error(`Telegram API error [${method}]: ${json.description}`);
    }
    return json.result;
}

// ─── Messaging ────────────────────────────────────────────────────────────────

export async function sendMessage(chatId: number, text: string, parseMode: 'HTML' | 'Markdown' = 'HTML') {
    return callTelegram('sendMessage', { chat_id: chatId, text, parse_mode: parseMode });
}

// ─── Sticker Pack ─────────────────────────────────────────────────────────────

/**
 * Upload a webp sticker file to Telegram CDN.
 * Returns the file_id to use in createNewStickerSet / addStickerToSet.
 */
export async function uploadStickerFile(telegramUserId: number, webpBuffer: Buffer): Promise<string> {
    const formData = new FormData();
    formData.append('user_id', String(telegramUserId));
    formData.append('sticker_format', 'static');
    formData.append(
        'sticker',
        new Blob([new Uint8Array(webpBuffer)], { type: 'image/webp' }),
        'sticker.webp'
    );

    const res = await fetch(`${BASE_URL}/uploadStickerFile`, {
        method: 'POST',
        body: formData,
    });
    const json = await res.json() as { ok: boolean; result: { file_id: string }; description?: string };
    if (!json.ok) throw new Error(`uploadStickerFile failed: ${json.description}`);
    return json.result.file_id;
}

/**
 * Create a new sticker pack owned by the user.
 * Pack name will be: <shortName>_by_StickerMeAppBot
 */
export async function createNewStickerSet(params: {
    telegramUserId: number;
    shortName: string; // e.g. "user123_abc"
    title: string;     // e.g. "My AI Stickers"
    stickerFileId: string;
    emoji: string;
}): Promise<string> {
    const name = `${params.shortName}_by_${BOT_USERNAME}`;
    await callTelegram('createNewStickerSet', {
        user_id: params.telegramUserId,
        name,
        title: params.title,
        stickers: [
            {
                sticker: params.stickerFileId,
                emoji_list: [params.emoji],
                format: 'static',
            },
        ],
    });
    return name; // returns the full pack name
}

/**
 * Add a sticker to an existing sticker set.
 */
export async function addStickerToSet(params: {
    telegramUserId: number;
    packName: string;
    stickerFileId: string;
    emoji: string;
}): Promise<void> {
    await callTelegram('addStickerToSet', {
        user_id: params.telegramUserId,
        name: params.packName,
        sticker: {
            sticker: params.stickerFileId,
            emoji_list: [params.emoji],
            format: 'static',
        },
    });
}

/**
 * Build the pack name for a given jobId (must be deterministic).
 * Format: sm<first8ofJobId>_by_<BotUsername>   (all lowercase, alphanumeric + underscore)
 */
export function buildPackName(jobId: string): string {
    const short = jobId.replace(/-/g, '').substring(0, 12).toLowerCase();
    return `sm${short}_by_${BOT_USERNAME}`;
}
