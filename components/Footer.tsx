import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-white/10 mt-20">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">
                                🎨
                            </div>
                            <span className="text-xl font-bold gradient-text">StickerMe</span>
                        </Link>
                        <p className="text-gray-400 max-w-sm">
                            Transform your photos into adorable Pixar-style 3D stickers. Perfect for Telegram & WhatsApp.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                                    How It Works
                                </Link>
                            </li>
                            <li>
                                <Link href="/#pricing" className="text-gray-400 hover:text-white transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/#examples" className="text-gray-400 hover:text-white transition-colors">
                                    Examples
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-500 text-sm">
                    © {new Date().getFullYear()} StickerMe. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
