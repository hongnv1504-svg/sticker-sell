import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@/lib/analytics";

export const metadata: Metadata = {
  title: "StickerMe - Turn Your Photo into Cute 3D Stickers",
  description: "Upload one photo. Get a 9-pack of chat stickers in Pixar-style. Perfect for Telegram & WhatsApp.",
  keywords: ["stickers", "AI", "Pixar", "3D", "Telegram", "WhatsApp", "photo", "avatar"],
  openGraph: {
    title: "StickerMe - Turn Your Photo into Cute 3D Stickers",
    description: "Upload one photo. Get a 9-pack of chat stickers in Pixar-style.",
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
      </body>
    </html>
  );
}
