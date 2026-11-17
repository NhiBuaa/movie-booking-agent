import type { OrderSummary, ETicketData, PaymentFailureReason } from './types.ts';

/**
 * Fixture order for Checkout S11, S12, S13, S14
 * Spec:
 * - Movie: "Chuyến tàu cuối hè"
 * - Cinema: "CGV Đồng Khởi"
 * - Showtime: "19:30 · Thứ Bảy, 07/11/2026"
 * - Seats: F5, F6 (240.000 đ)
 * - Combo: Combo bắp nước (85.000 đ)
 * - Voucher: Giảm 30.000 đ
 * - Total: 295.000 đ
 */
export const SAMPLE_ORDER_FIXTURE: OrderSummary = {
  bookingId: 'BK-884291',
  transactionId: 'TXN-9988210',
  movieId: 'chuyen-tau-cuoi-he',
  movieTitle: 'Chuyến tàu cuối hè',
  posterUrl: '/images/artworks/poster_chuyen_tau.png',
  durationMinutes: 115,
  format: 'IMAX Laser',
  cinemaName: 'CGV Đồng Khởi',
  hallName: 'Phòng IMAX Laser (Tầng 4)',
  showDate: 'T7, 07/11/2026',
  showTime: '19:30',
  seats: [
    { id: 'seat-f5', label: 'F5', type: 'vip', price: 120000 },
    { id: 'seat-f6', label: 'F6', type: 'vip', price: 120000 },
  ],
  combos: [
    {
      id: 'combo-doi',
      name: 'Combo đôi',
      description: '1 bắp lớn + 2 nước',
      price: 85000,
      quantity: 1,
    },
  ],
  voucher: {
    code: 'CINORA30',
    discountAmount: 30000,
    description: 'Giảm 30.000 đ cho đơn từ 200.000 đ',
    isApplied: true,
  },
  serviceFee: 0,
  totalAmount: 295000,
  userEmail: 'nguyen.van.a@gmail.com',
  paymentMethod: 'vnpay',
  paymentStatus: 'pending',
  holdExpiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes from now
  holdDurationSeconds: 600,
};

/**
 * Alternative fixture matching Figma mockup numbers (Ghế H7, H8: 320.000đ, Combo 105.000đ, Voucher 40.000đ, Tổng 385.000đ)
 */
export const FIGMA_ORDER_FIXTURE: OrderSummary = {
  bookingId: 'BK-884291',
  transactionId: 'TXN-9988210',
  movieId: 'chuyen-tau-cuoi-he',
  movieTitle: 'Chuyến tàu cuối hè',
  posterUrl: '/images/artworks/poster_chuyen_tau.png',
  durationMinutes: 115,
  format: 'IMAX Laser',
  cinemaName: 'Cinora Đồng Khởi',
  hallName: 'Phòng IMAX Laser (Tầng 4)',
  showDate: 'T7, 07/11/2026',
  showTime: '18:30',
  seats: [
    { id: 'seat-h7', label: 'H7', type: 'vip', price: 160000 },
    { id: 'seat-h8', label: 'H8', type: 'vip', price: 160000 },
  ],
  combos: [
    {
      id: 'combo-doi-figma',
      name: 'Combo đôi',
      description: '1 bắp lớn + 2 nước',
      price: 105000,
      quantity: 1,
    },
  ],
  voucher: {
    code: 'CINORA40',
    discountAmount: 40000,
    description: 'Giảm 40.000 đ đặc quyền hội viên Cinora',
    isApplied: true,
  },
  serviceFee: 0,
  totalAmount: 385000,
  userEmail: 'nguyen.van.a@gmail.com',
  paymentMethod: 'vnpay',
  paymentStatus: 'pending',
  holdExpiresAt: Date.now() + 10 * 60 * 1000,
  holdDurationSeconds: 600,
};

/**
 * Fixture ETicket Data for Success S13 (Legacy Sample)
 */
export const SAMPLE_ETICKET_FIXTURE: ETicketData = {
  ticketCode: 'TKT-8892-VN',
  bookingId: 'MB-2026-000128',
  partnerTxnId: 'VNPAY-889912',
  paidAt: '19:32:15 · 07/11/2026',
  movieTitle: 'Chuyến tàu cuối hè',
  cinemaName: 'CGV Đồng Khởi',
  hallName: 'Phòng IMAX Laser (Tầng 4)',
  showDate: 'Thứ Bảy, 07/11/2026',
  showTime: '19:30',
  seats: ['F5', 'F6'],
  comboCode: 'FB-000128',
  totalPaid: 295000,
  paymentMethod: 'vnpay',
  userEmail: 'ng***@gmail.com',
  qrPayload: JSON.stringify({
    ticket: 'TKT-8892-VN',
    bookingId: 'MB-2026-000128',
    cinema: 'CGV Đồng Khởi',
    hall: 'Phòng 4',
    movie: 'Chuyen tau cuoi he',
    showtime: '2026-11-07 19:30',
    seats: ['F5', 'F6'],
    status: 'CONFIRMED_CINEMA_CORE',
  }),
};

/**
 * Figma S13 Canonical ETicket Fixture (Node 536:556: MB-2026-000128, H7, H8, 385.000 đ)
 */
export const FIGMA_ETICKET_FIXTURE: ETicketData = {
  ticketCode: 'MB-2026-000128',
  bookingId: 'MB-2026-000128',
  partnerTxnId: 'VNPAY-889912',
  paidAt: '18:32:15 · 07/11/2026',
  movieTitle: 'Chuyến tàu cuối hè',
  cinemaName: 'Cinora Đồng Khởi',
  hallName: 'Phòng IMAX Laser (Tầng 4)',
  showDate: 'Thứ Bảy, 07/11/2026',
  showTime: '18:30',
  seats: ['H7', 'H8'],
  comboCode: 'FB-000128',
  totalPaid: 385000,
  paymentMethod: 'vnpay',
  userEmail: 'ng***@gmail.com',
  qrPayload: JSON.stringify({
    ticket: 'MB-2026-000128',
    bookingId: 'MB-2026-000128',
    cinema: 'Cinora Đồng Khởi',
    hall: 'Phòng IMAX Laser (Tầng 4)',
    movie: 'Chuyến tàu cuối hè',
    showtime: '2026-11-07 18:30',
    seats: ['H7', 'H8'],
    status: 'CONFIRMED_CINEMA_CORE',
  }),
};

/**
 * Failure reason fixture for S14
 */
export const SAMPLE_PAYMENT_FAILURE: PaymentFailureReason = {
  errorCode: 'VNPAY-ERR-68',
  message: 'Giao dịch chưa hoàn tất xác thực OTP (Timeout)',
  detail: 'Tài khoản không đủ số dư hoặc phiên thanh toán hết hạn. Tài khoản CHƯA bị trừ tiền.',
  canRetry: true,
};

/**
 * Available valid promo vouchers for test/dynamic usage
 */
export const AVAILABLE_VOUCHERS = [
  { code: 'CINORA30', discountAmount: 30000, minOrder: 200000, description: 'Giảm 30.000 đ' },
  { code: 'CINORA40', discountAmount: 40000, minOrder: 300000, description: 'Giảm 40.000 đ' },
  { code: 'HAPPYWED', discountAmount: 20000, minOrder: 150000, description: 'Giảm 20.000 đ ngày thứ 4' },
];
