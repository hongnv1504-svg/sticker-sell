// VietQR - Chuẩn QR Napas, hỗ trợ tất cả ngân hàng VN
// Không cần đăng ký API, sinh URL QR động hoàn toàn miễn phí

export const VIETQR_CONFIG = {
    bankCode: 'ACB',               // Ngân hàng ACB
    bankBIN: '970416',             // BIN code của ACB
    accountNumber: '241150249',
    accountName: 'NGO VAN HONG',  // Tên chủ tài khoản ACB
    amountVND: 39000,             // 39.000 VNĐ
    template: 'qr_only',          // Chỉ hiện QR, không có logo bank
};

/**
 * Sinh URL ảnh QR VietQR động
 * User quét bằng app ngân hàng hỗ trợ VietQR
 */
export function generateVietQRUrl(jobId: string): string {
    const { bankCode, accountNumber, amountVND, template } = VIETQR_CONFIG;
    const transferContent = getTransferContent(jobId);

    const params = new URLSearchParams({
        amount: String(amountVND),
        addInfo: transferContent,
        accountName: VIETQR_CONFIG.accountName,
    });

    return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-${template}.jpg?${params.toString()}`;
}

/**
 * Sinh VietQR Universal Deep Link — khi bấm trên điện thoại sẽ mở app ngân hàng
 * Hỗ trợ: MB Bank, VCB, Techcombank, BIDV, VPBank, ACB, TPBank, và hầu hết ngân hàng VN
 */
export function generateVietQRDeepLink(jobId: string): string {
    const { bankBIN, accountNumber, accountName, amountVND } = VIETQR_CONFIG;
    const transferContent = getTransferContent(jobId);

    const params = new URLSearchParams({
        accountNo: accountNumber,
        accountName: accountName,
        acqId: bankBIN,
        amount: String(amountVND),
        addInfo: transferContent,
        format: 'text',
        template: 'compact',
    });

    return `https://dl.vietqr.io/pay?${params.toString()}`;
}

/**
 * Sinh nội dung chuyển khoản chuẩn để nhận diện đơn hàng
 */
export function getTransferContent(jobId: string): string {
    // Lấy 8 ký tự đầu của jobId cho gọn
    const shortId = jobId.replace(/-/g, '').substring(0, 8).toUpperCase();
    return `STICKER ${shortId}`;
}

/**
 * Format số tiền VNĐ để hiển thị
 */
export function formatVND(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
}
