import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { sendMessage } from '@/lib/telegram';
import { v4 as uuidv4 } from 'uuid';

// Telegram sends updates to this endpoint
export async function POST(request: NextRequest) {
    try {
        // Verify webhook secret if set
        const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
        if (webhookSecret) {
            const secretHeader = request.headers.get('x-telegram-bot-api-secret-token');
            if (secretHeader !== webhookSecret) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        const update = await request.json() as TelegramUpdate;
        const message = update.message;

        // Only handle text messages
        if (!message?.text) {
            return NextResponse.json({ ok: true });
        }

        const chatId = message.chat.id;
        const telegramUserId = message.from.id;
        const text = message.text.trim();

        // Handle /start command
        if (text === '/start' || text.startsWith('/start ')) {
            await handleStart(chatId, telegramUserId);
        } else {
            // Any other message → guide them
            await sendMessage(
                chatId,
                '👋 Gửi <b>/start</b> để bắt đầu tạo sticker AI từ ảnh của bạn!'
            );
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('[TG Webhook] Error:', error);
        // Always return 200 so Telegram doesn't retry
        return NextResponse.json({ ok: true });
    }
}

// ─── /start handler ───────────────────────────────────────────────────────────

async function handleStart(chatId: number, telegramUserId: number) {
    const supabase = getSupabaseAdmin();

    // Create a short-lived session token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

    // Upsert: if same user starts again, refresh token
    await supabase
        .from('telegram_sessions')
        .upsert(
            {
                token,
                telegram_user_id: telegramUserId,
                chat_id: chatId,
                expires_at: expiresAt,
            },
            { onConflict: 'telegram_user_id' }
        );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.stickermeapp.ink';
    const link = `${appUrl}?tg=${token}`;

    await sendMessage(
        chatId,
        `🎨 <b>Chào mừng đến với StickerMe AI!</b>\n\n` +
        `Tạo sticker độc đáo từ ảnh của bạn — chỉ trong 30 giây.\n\n` +
        `👇 Click vào link bên dưới để bắt đầu:\n` +
        `<a href="${link}">${link}</a>\n\n` +
        `<i>Link có hiệu lực trong 24 giờ.</i>`
    );
}

// ─── Telegram types ───────────────────────────────────────────────────────────

interface TelegramUpdate {
    update_id: number;
    message?: TelegramMessage;
}

interface TelegramMessage {
    message_id: number;
    from: TelegramUser;
    chat: TelegramChat;
    text?: string;
}

interface TelegramUser {
    id: number;
    first_name: string;
    username?: string;
}

interface TelegramChat {
    id: number;
    type: string;
}
