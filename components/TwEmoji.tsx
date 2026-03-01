// TwEmoji: render emoji dùng Twemoji CDN (Twitter/Google style) thay cho Apple emoji
interface TwEmojiProps {
    emoji: string;
    className?: string;
    size?: number;
}

function toCodePoint(emoji: string): string {
    const codePoints: string[] = [];
    let i = 0;
    while (i < emoji.length) {
        const code = emoji.codePointAt(i)!;
        if (code !== 0xfe0f) {
            codePoints.push(code.toString(16));
        }
        i += code > 0xffff ? 2 : 1;
    }
    return codePoints.join('-');
}

export default function TwEmoji({ emoji, className = '', size = 32 }: TwEmojiProps) {
    const codePoint = toCodePoint(emoji.trim());
    const src = `https://cdn.jsdelivr.net/gh/twitter/twemoji@latest/assets/svg/${codePoint}.svg`;

    return (
        <img
            src={src}
            alt={emoji}
            width={size}
            height={size}
            className={`inline-block select-none ${className}`}
            draggable={false}
        />
    );
}
