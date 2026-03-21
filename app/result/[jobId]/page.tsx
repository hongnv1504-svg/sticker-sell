'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StickerGrid from '@/components/StickerGrid';
import { PartyPopper, Loader2, Sparkles, Download, Send, CheckCircle2, Package, Lock, BookOpen } from 'lucide-react';
import { Sticker } from '@/lib/types';
import { analytics } from '@/lib/analytics';

interface Props {
    params: Promise<{ jobId: string }>;
}

export default function ResultPage({ params }: Props) {
    const { jobId } = use(params);
    const [stickers, setStickers] = useState<Sticker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPaid, setIsPaid] = useState(false);
    const [email, setEmail] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);
    const [telegramPackUrl, setTelegramPackUrl] = useState<string | null>(null);

    const [status, setStatus] = useState<string>('pending');
    const [progress, setProgress] = useState(0);

    // Fetch stickers
    useEffect(() => {
        let pollInterval: NodeJS.Timeout;

        const fetchStickers = async () => {
            try {
                const response = await fetch(`/api/job/${jobId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load stickers');
                }

                setStickers(data.stickers || []);
                setIsPaid(data.isPaid);
                setStatus(data.job?.status || 'pending');
                setProgress(data.job?.progress || 0);
                if (data.job?.telegramPackUrl) {
                    setTelegramPackUrl(data.job.telegramPackUrl);
                }

                // If not paid, redirect to paywall
                if (!data.isPaid) {
                    window.location.href = `/pay/${jobId}`;
                    return;
                }

                // If job is completed or failed, stop polling
                if (data.job?.status === 'completed' || data.job?.status === 'failed') {
                    if (pollInterval) clearInterval(pollInterval);
                }
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err instanceof Error ? err.message : 'Something went wrong');
            } finally {
                setIsLoading(false);
            }
        };

        // Initial fetch
        fetchStickers();

        // Start polling every 3 seconds
        pollInterval = setInterval(fetchStickers, 3000);

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [jobId]);

    const handleDownloadFlow = async () => {
        setIsDownloading(true);
        setError(null);

        try {
            const response = await fetch('/api/bundle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId, email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to prepare download');
            }

            setIsEmailSent(true);

            // Track download completion
            analytics.trackDownloadCompleted(jobId);

            // Proactively open the download link in a new tab
            if (data.downloadUrl) {
                window.open(data.downloadUrl, '_blank');
            }
        } catch (err) {
            console.error('Download flow error:', err);
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Đang tải sticker của bạn...</p>
                </div>
            </div>
        );
    }

    if (!isPaid) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Success Banner */}
                    <div className="glass-card p-6 mb-8 text-center bg-gradient-to-r from-purple-900/30 to-pink-900/30">
                        {status === 'completed' ? (
                            <>
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4 text-green-600">
                                    <PartyPopper size={32} />
                                </div>
                                <h1 className="text-3xl font-bold mb-2 text-[#222222]">Sticker Của Bạn Đã Sẵn Sàng!</h1>
                                <p className="text-[#a7a7a7]">Cảm ơn bạn! Hãy tận hưởng bộ sticker của riêng mình!</p>
                            </>
                        ) : (
                            <>
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 mb-4">
                                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                                <h1 className="text-3xl font-bold mb-2 text-[#222222]">Đang Tạo Sticker...</h1>
                                <p className="text-[#a7a7a7]">Vui lòng chờ trong khi chúng tôi tạo bộ sticker cho bạn. {progress}/6 sticker xong.</p>
                            </>
                        )}
                    </div>

                    {/* Stickers Grid */}
                    <div className="glass-card p-6 mb-8">
                        <h3 className="font-semibold text-[#222222] mb-4 flex items-center gap-2">
                            <Sparkles className="text-yellow-500" size={20} /> Bộ Sticker Của Bạn
                        </h3>
                        <StickerGrid
                            stickers={stickers}
                            locked={false}
                            loading={status === 'processing'}
                            progress={progress}
                        />
                    </div>

                    {/* Download Section */}
                    <div className="glass-card p-6 mb-8">
                        <h3 className="font-semibold text-[#222222] mb-2 flex items-center gap-2">
                            <Download className="text-blue-500" size={20} /> Tải Bộ Sticker
                        </h3>
                        <p className="text-[#a7a7a7] text-sm mb-6">
                            Chúng tôi sẽ đóng gói sticker thành file ZIP để bạn tải về.
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {telegramPackUrl && (
                            <div className="mb-6">
                                <a
                                    href={telegramPackUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn w-full flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0077b3] text-white border-transparent"
                                >
                                    <Send size={20} />
                                    Thêm Vào Telegram
                                </a>
                            </div>
                        )}

                        {isEmailSent ? (
                            /* ── Post-download state: clean success UI ── */
                            <div className="space-y-4">
                                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
                                    <CheckCircle2 className="text-green-500" size={24} />
                                    <div>
                                        <p className="text-green-600 font-semibold">Đã bắt đầu tải!</p>
                                        <p className="text-green-700/60 text-sm">
                                            {email
                                                ? `Link dự phòng đã gửi tới ${email}.`
                                                : "Nếu chưa tải tự động, nhấn nút bên dưới."}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleDownloadFlow}
                                    disabled={isDownloading}
                                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    {isDownloading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Đang đóng gói...
                                        </>
                                    ) : (
                                        <>
                                            <Package size={20} />
                                            Tải Lại
                                        </>
                                    )}
                                </button>

                                <div className="text-center">
                                    <p className="text-xs text-[#a7a7a7] bg-[#f0f0f0] flex items-center justify-center gap-2 py-2 px-4 rounded-lg inline-flex">
                                        <Lock size={14} /> Ảnh của bạn sẽ được lưu trữ trong 48 giờ, sau đó sẽ tự động xóa để bảo mật.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* ── Pre-download state: email input + download button ── */
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-[#a7a7a7] mb-2">
                                        Email (không bắt buộc, để nhận link dự phòng)
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder="your@email.com"
                                        className="w-full bg-[#f5f5f5] border border-[#dedede] rounded-xl px-4 py-3 text-[#222222] placeholder-[#a7a7a7] focus:outline-none focus:ring-2 focus:ring-[#FA5D29]/30 focus:border-[#FA5D29] transition-all"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <button
                                    onClick={handleDownloadFlow}
                                    disabled={isDownloading}
                                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    {isDownloading ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Đang đóng gói...
                                        </>
                                    ) : (
                                        <>
                                            <span>📦</span>
                                            Đóng Gói & Tải Về
                                        </>
                                    )}
                                </button>

                                <div className="text-center">
                                    <p className="text-xs text-[#a7a7a7] bg-[#f0f0f0] py-2 px-4 rounded-lg inline-block">
                                        🔒 Ảnh của bạn sẽ được lưu trữ trong 48 giờ, sau đó sẽ tự động xóa để bảo mật.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tutorial Section */}
                    <div className="glass-card p-6">
                        <h3 className="font-semibold text-[#222222] mb-6 flex items-center gap-2">
                            <span>📚</span> Cách Sử Dụng Sticker
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Telegram */}
                            <div className="bg-[#f5f5f5] rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-xl">
                                        📱
                                    </div>
                                    <h4 className="font-medium">Telegram</h4>
                                </div>
                                <ol className="space-y-2 text-sm text-[#a7a7a7]">
                                    <li className="flex gap-2">
                                        <span className="text-purple-400">1.</span>
                                        Mở Telegram và tìm bot @Stickers
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-purple-400">2.</span>
                                        Gửi /newpack để tạo bộ sticker mới
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-purple-400">3.</span>
                                        Tải lên từng ảnh sticker khi được yêu cầu
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-purple-400">4.</span>
                                        Chọn emoji cho mỗi sticker
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-purple-400">5.</span>
                                        Dùng /publish để hoàn tất
                                    </li>
                                </ol>
                            </div>

                            {/* WhatsApp */}
                            <div className="bg-[#f5f5f5] rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-xl">
                                        💬
                                    </div>
                                    <h4 className="font-medium">WhatsApp</h4>
                                </div>
                                <ol className="space-y-2 text-sm text-[#a7a7a7]">
                                    <li className="flex gap-2">
                                        <span className="text-green-400">1.</span>
                                        Cài app tạo sticker (ví dụ: Sticker Maker Studio)
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-green-400">2.</span>
                                        Tạo bộ sticker mới trong app
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-green-400">3.</span>
                                        Nhập các ảnh sticker đã tải về
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-green-400">4.</span>
                                        Nhấn &quot;Add to WhatsApp&quot;
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="text-green-400">5.</span>
                                        Tìm sticker trong WhatsApp của bạn
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    {/* Create More */}
                    <div className="mt-8 text-center">
                        <p className="text-[#a7a7a7] mb-4">Muốn tạo thêm sticker?</p>
                        <Link href="/upload" className="btn btn-secondary">
                            Tạo Bộ Mới
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
