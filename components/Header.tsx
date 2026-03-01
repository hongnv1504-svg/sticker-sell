'use client';

import Link from 'next/link';

export default function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <div className="glass-card mx-4 mt-4 px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-[#FA5D29] flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                        🎨
                    </div>
                    <span className="text-xl font-bold text-[#222222]">StickerMe</span>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/packs" className="text-[#a7a7a7] hover:text-[#222222] transition-colors text-sm font-medium">
                        Styles
                    </Link>
                    <Link href="/#how-it-works" className="text-[#a7a7a7] hover:text-[#222222] transition-colors text-sm font-medium">
                        How It Works
                    </Link>
                    <Link href="/#pricing" className="text-[#a7a7a7] hover:text-[#222222] transition-colors text-sm font-medium">
                        Pricing
                    </Link>
                </nav>

                <Link href="/packs" className="btn btn-primary text-sm py-2 px-5">
                    Get Started
                </Link>
            </div>
        </header>
    );
}
