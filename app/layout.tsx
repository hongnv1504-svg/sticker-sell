import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@/lib/analytics";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "StickerMe - Biến Bạn Thành Sticker. AI Lo Phần Kỳ Diệu.",
  description: "Tải ảnh selfie, chọn phong cách, nhận 6 sticker AI độc đáo cho Telegram & WhatsApp.",
  keywords: ["stickers", "AI", "Pixar", "3D", "Telegram", "WhatsApp", "photo", "avatar"],
  openGraph: {
    title: "StickerMe - Biến Bạn Thành Sticker. AI Lo Phần Kỳ Diệu.",
    description: "Tải ảnh selfie, chọn phong cách, nhận 6 sticker AI độc đáo cho Telegram & WhatsApp.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased bg-mesh min-h-screen">
        {children}
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
        <Analytics />
      </body>
    </html>
  );
}
