// VietQR - Chuẩn QR Napas, hỗ trợ tất cả ngân hàng VN + MoMo + ZaloPay
// Không cần đăng ký API, sinh URL QR động hoàn toàn miễn phí

export const VIETQR_CONFIG = {
    bankCode: 'TCB',               // Techcombank
    accountNumber: '19033210412014',
    accountName: 'NGUYEN VAN A',  // Tên chủ tài khoản (hiển thị trên QR)
    amountVND: 49000,             // 49.000 VNĐ
    template: 'qr_only',          // Chỉ hiện QR, không có logo bank
};

/**
 * Sinh URL ảnh QR VietQR động
 * User quét bằng app ngân hàng / MoMo / ZaloPay đều được
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
