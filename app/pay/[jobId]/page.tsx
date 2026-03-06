'use client';

import { useEffect, useState, use, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface Props {
    params: Promise<{ jobId: string }>;
}

type PaymentMethod = 'international' | 'vietnam';
type VNStatus = 'idle' | 'qr_shown' | 'confirmed' | 'paid';

interface VNPaymentInfo {
    qrUrl: string;
    amount: number;
    amountFormatted: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    transferContent: string;
}

export default function PaywallPage({ params }: Props) {
    const { jobId } = use(params);
    const router = useRouter();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('international');

    // International (LemonSqueezy)
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Vietnam (VietQR)
    const [vnPaymentInfo, setVnPaymentInfo] = useState<VNPaymentInfo | null>(null);
    const [isLoadingQR, setIsLoadingQR] = useState(false);
    const [transactionNote, setTransactionNote] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    const [vnStatus, setVnStatus] = useState<VNStatus>('idle');

    // Auto-polling để phát hiện Sepay webhook
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearTimeout(pollingRef.current);
            pollingRef.current = null;
        }
    }, []);

    const pollPaymentStatus = useCallback(async () => {
        try {
            const res = await fetch(`/api/job/${jobId}`);
            const data = await res.json();

            // Sepay đã xác nhận → đơn đã paid → tự redirect!
            if (data.isPaid && data.job?.status !== 'pending') {
                stopPolling();
                setVnStatus('paid');
                setTimeout(() => router.push(`/generate/${jobId}`), 1200);
                return;
            }

            // Tiếp tục poll mỗi 3 giây
            pollingRef.current = setTimeout(pollPaymentStatus, 3000);
        } catch {
            // Lỗi mạng → poll lại sau 5 giây
            pollingRef.current = setTimeout(pollPaymentStatus, 5000);
        }
    }, [jobId, router, stopPolling]);

    // Bắt đầu poll khi QR đã hiện
    useEffect(() => {
        if (vnStatus === 'qr_shown' || vnStatus === 'confirmed') {
            stopPolling();
            pollingRef.current = setTimeout(pollPaymentStatus, 3000);
        }
        return stopPolling;
    }, [vnStatus, pollPaymentStatus, stopPolling]);

    // Cleanup khi unmount
    useEffect(() => () => stopPolling(), [stopPolling]);

    // Load QR khi chọn tab VN
    useEffect(() => {
        if (paymentMethod === 'vietnam' && !vnPaymentInfo && vnStatus === 'idle') {
            loadVNPayment();
        }
    }, [paymentMethod]);

    const loadVNPayment = async () => {
        setIsLoadingQR(true);
        setError(null);
        try {
            const res = await fetch('/api/checkout/vn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Không thể tạo QR');
            if (data.alreadyPaid) { router.push(`/generate/${jobId}`); return; }
            setVnPaymentInfo(data);
            setVnStatus('qr_shown');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        } finally {
            setIsLoadingQR(false);
        }
    };

    // Fallback thủ công nếu Sepay chậm
    const handleVNConfirm = async () => {
        if (!transactionNote.trim()) {
            setError('Vui lòng nhập nội dung chuyển khoản hoặc mã giao dịch');
            return;
        }
        setIsConfirming(true);
        setError(null);
        try {
            const res = await fetch('/api/payment/vn/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId, transactionNote }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Xác nhận thất bại');
            setVnStatus('confirmed');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
            setIsConfirming(false);
        }
    };

    const handleInternationalCheckout = async () => {
        setIsCheckingOut(true);
        setError(null);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to create checkout session');
            if (data.url) window.location.href = data.url;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Checkout failed');
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-32 pb-20 px-6">
                <div className="max-w-2xl mx-auto">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold mb-4 text-[#222222]">
                            Tạo AI Stickers của bạn 🎨
                        </h1>
                        <p className="text-[#a7a7a7] text-lg">
                            Thanh toán để tạo bộ sticker cá nhân hóa
                        </p>
                    </div>

                    {/* Payment Method Tabs */}
                    <div className="flex rounded-2xl overflow-hidden border border-[#e5e5e5] mb-6">
                        <button
                            onClick={() => { setPaymentMethod('international'); setError(null); }}
                            className={`flex-1 py-3 px-4 font-semibold text-sm transition-all ${paymentMethod === 'international'
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                    : 'bg-white text-[#888] hover:bg-gray-50'
                                }`}
                        >
                            🌍 Quốc tế · $4.99
                        </button>
                        <button
                            onClick={() => { setPaymentMethod('vietnam'); setError(null); }}
                            className={`flex-1 py-3 px-4 font-semibold text-sm transition-all ${paymentMethod === 'vietnam'
                                    ? 'bg-gradient-to-r from-red-500 to-yellow-400 text-white'
                                    : 'bg-white text-[#888] hover:bg-gray-50'
                                }`}
                        >
                            🇻🇳 Việt Nam · 49.000đ
                        </button>
                    </div>

                    {/* Payment Card */}
                    <div className="glass-card p-8">
                        {/* Product info */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
                                <span className="text-5xl">✨</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-2 text-[#222222]">AI Sticker Pack</h2>
                            <p className="text-[#a7a7a7]">9 stickers AI cá nhân hóa</p>
                        </div>

                        {/* Price */}
                        <div className="text-center mb-8">
                            {paymentMethod === 'international' ? (
                                <>
                                    <div className="text-5xl font-bold gradient-text mb-1">$4.99</div>
                                    <p className="text-[#a7a7a7] text-sm">~125.000 VND · Một lần duy nhất</p>
                                </>
                            ) : (
                                <>
                                    <div className="text-5xl font-bold mb-1" style={{ background: 'linear-gradient(135deg, #ef4444, #eab308)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                        49.000đ
                                    </div>
                                    <p className="text-[#a7a7a7] text-sm">Chuyển khoản ngân hàng · Một lần duy nhất</p>
                                </>
                            )}
                        </div>

                        {/* Features */}
                        <ul className="space-y-3 mb-8">
                            {[
                                'File PNG độ phân giải cao',
                                'Nền trong suốt',
                                'Dùng được cho Telegram & Zalo',
                                'Tải về dạng ZIP',
                                'Tạo ngay sau khi thanh toán',
                            ].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-[#555555]">
                                    <span className="text-green-400">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {/* Error */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* ===== INTERNATIONAL ===== */}
                        {paymentMethod === 'international' && (
                            <>
                                <button
                                    onClick={handleInternationalCheckout}
                                    disabled={isCheckingOut}
                                    className="btn btn-primary w-full text-lg py-4"
                                >
                                    {isCheckingOut ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        <>Pay &amp; Generate Stickers <span>🚀</span></>
                                    )}
                                </button>
                                <div className="mt-6 flex items-center justify-center gap-4 text-sm text-[#a7a7a7]">
                                    <span>🔒 Bảo mật</span>
                                    <span>⚡ Tức thì</span>
                                    <span>🍋 Lemon Squeezy</span>
                                </div>
                            </>
                        )}

                        {/* ===== VIETNAM ===== */}
                        {paymentMethod === 'vietnam' && (
                            <div className="space-y-6">
                                {/* Loading QR */}
                                {isLoadingQR && (
                                    <div className="flex justify-center py-8">
                                        <span className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}

                                {/* Đã paid - đang redirect */}
                                {vnStatus === 'paid' && (
                                    <div className="flex flex-col items-center gap-4 py-6 text-center">
                                        <span className="text-5xl animate-bounce">✅</span>
                                        <h3 className="text-xl font-bold text-green-600">Thanh toán thành công!</h3>
                                        <p className="text-[#888] text-sm">Đang chuyển sang tạo sticker...</p>
                                        <span className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}

                                {/* QR hiện & chờ */}
                                {vnPaymentInfo && (vnStatus === 'qr_shown' || vnStatus === 'confirmed') && (
                                    <>
                                        {/* QR Code */}
                                        <div className="flex flex-col items-center gap-3">
                                            <p className="text-sm font-medium text-[#555]">Quét QR bằng app ngân hàng, MoMo, ZaloPay</p>
                                            <div className="relative">
                                                <div className="border-4 border-white shadow-xl rounded-2xl overflow-hidden">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={vnPaymentInfo.qrUrl}
                                                        alt="VietQR Code"
                                                        width={220}
                                                        height={220}
                                                        className="block"
                                                    />
                                                </div>
                                                {/* Badge tự động */}
                                                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                                    Tự động
                                                </div>
                                            </div>
                                            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                                Đang chờ thanh toán... (tự động xác nhận)
                                            </p>
                                        </div>

                                        {/* Bank info */}
                                        <div className="rounded-2xl border border-[#e5e5e5] bg-gray-50 p-4 space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-[#888]">Ngân hàng</span>
                                                <span className="font-semibold text-[#222]">Techcombank (TCB)</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#888]">Số tài khoản</span>
                                                <span className="font-mono font-semibold text-[#222]">{vnPaymentInfo.accountNumber}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-[#888]">Số tiền</span>
                                                <span className="font-semibold text-red-500">{vnPaymentInfo.amountFormatted}</span>
                                            </div>
                                            <div className="flex justify-between items-center gap-2">
                                                <span className="text-[#888] shrink-0">Nội dung CK</span>
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(vnPaymentInfo.transferContent)}
                                                    className="font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg hover:bg-purple-100 transition-colors cursor-copy"
                                                    title="Nhấn để copy"
                                                >
                                                    {vnPaymentInfo.transferContent}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Fallback thủ công */}
                                        {vnStatus === 'qr_shown' && (
                                            <details className="text-sm">
                                                <summary className="cursor-pointer text-[#888] hover:text-[#555] text-center">
                                                    Đã chuyển khoản nhưng chưa tự động? Xác nhận thủ công
                                                </summary>
                                                <div className="mt-3 space-y-3">
                                                    <input
                                                        type="text"
                                                        value={transactionNote}
                                                        onChange={e => setTransactionNote(e.target.value)}
                                                        placeholder={`Nhập nội dung: ${vnPaymentInfo.transferContent}`}
                                                        className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] text-sm focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                                                    />
                                                    <button
                                                        onClick={handleVNConfirm}
                                                        disabled={isConfirming}
                                                        className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2"
                                                        style={{ background: 'linear-gradient(135deg, #ef4444, #eab308)' }}
                                                    >
                                                        {isConfirming ? (
                                                            <>
                                                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                Đang xác nhận...
                                                            </>
                                                        ) : 'Xác nhận thủ công ✅'}
                                                    </button>
                                                </div>
                                            </details>
                                        )}

                                        {/* Đã confirm thủ công → đang chờ */}
                                        {vnStatus === 'confirmed' && (
                                            <div className="flex flex-col items-center gap-2 py-2 text-center">
                                                <span className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                                <p className="text-sm text-[#888]">Đang xác minh... sẽ tự động chuyển sang tạo sticker</p>
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="flex items-center justify-center gap-4 text-sm text-[#a7a7a7] pt-2">
                                    <span>🔒 Bảo mật</span>
                                    <span>⚡ Tự động xác nhận</span>
                                    <span>🇻🇳 VietQR Napas</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
