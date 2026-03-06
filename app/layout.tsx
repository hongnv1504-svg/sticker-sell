import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@/lib/analytics";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "StickerMe - Sticker Yourself. AI Does the Magic.",
  description: "Upload a selfie, pick a style, get 6 custom AI stickers for Telegram & WhatsApp in 30 seconds.",
  keywords: ["stickers", "AI", "Pixar", "3D", "Telegram", "WhatsApp", "photo", "avatar"],
  openGraph: {
    title: "StickerMe - Sticker Yourself. AI Does the Magic.",
    description: "Upload a selfie, pick a style, get 6 custom AI stickers for Telegram & WhatsApp in 30 seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-mesh min-h-screen">
        {children}
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''} />
        <Analytics />
      </body>
    </html>
  );
}
