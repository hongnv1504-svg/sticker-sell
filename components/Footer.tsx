import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-[#ededed] mt-20 bg-[#f8f8f8]">
            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[#FA5D29] flex items-center justify-center text-2xl">
                                🎨
                            </div>
                            <span className="text-xl font-bold text-[#222222]">StickerMe</span>
                        </Link>
                        <p className="text-[#a7a7a7] max-w-sm text-sm leading-relaxed">
                            Biến ảnh của bạn thành sticker dễ thương. Hoàn hảo cho Telegram & WhatsApp.
                        </p>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-[#222222] mb-4 text-sm">Sản Phẩm</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/#how-it-works" className="text-[#a7a7a7] hover:text-[#FA5D29] transition-colors text-sm">
                                    Cách Hoạt Động
                                </Link>
                            </li>
                            <li>
                                <Link href="/#pricing" className="text-[#a7a7a7] hover:text-[#FA5D29] transition-colors text-sm">
                                    Bảng Giá
                                </Link>
                            </li>
                            <li>
                                <Link href="/#examples" className="text-[#a7a7a7] hover:text-[#FA5D29] transition-colors text-sm">
                                    Mẫu
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-[#222222] mb-4 text-sm">Pháp Lý</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/privacy" className="text-[#a7a7a7] hover:text-[#FA5D29] transition-colors text-sm">
                                    Chính Sách Bảo Mật
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-[#a7a7a7] hover:text-[#FA5D29] transition-colors text-sm">
                                    Điều Khoản Sử Dụng
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-[#222222] mb-4 text-sm">Liên Hệ</h4>
                        <ul className="space-y-2">
                            <li>
                                <span className="text-[#a7a7a7] text-sm flex items-center gap-2">
                                    <span>👤</span> NGO VAN HONG
                                </span>
                            </li>
                            <li>
                                <a href="mailto:hong.nv1504@gmail.com" className="text-[#a7a7a7] hover:text-[#FA5D29] transition-colors text-sm flex items-center gap-2">
                                    <span>✉️</span> hong.nv1504@gmail.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[#ededed] mt-8 pt-8 text-center text-[#a7a7a7] text-sm">
                    © {new Date().getFullYear()} StickerMe. Bảo lưu mọi quyền.
                </div>
            </div>
        </footer>
    );
}
