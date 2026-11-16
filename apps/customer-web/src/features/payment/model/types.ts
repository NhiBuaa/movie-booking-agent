export type PaymentMethod = 'vnpay' | 'momo' | 'zalopay' | 'atm' | 'card';

export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed';

export interface SeatItem {
  id: string;
  label: string; // e.g. "F5", "F6" or "H7", "H8"
  type: 'standard' | 'vip' | 'couple';
  price: number;
}

export interface ComboItem {
  id: string;
  name: string; // e.g. "Combo đôi"
  description: string; // "1 bắp lớn + 2 nước"
  price: number; // e.g. 85000 or 105000
  quantity: number;
}

export interface VoucherInfo {
  code: string;
  discountAmount: number;
  description: string;
  isApplied: boolean;
}

export interface OrderSummary {
  bookingId: string;
  transactionId?: string;
  movieId?: string;
  showtimeId?: string;
  movieTitle: string;
  posterUrl: string;
  durationMinutes: number;
  format: string; // e.g. "IMAX Laser"
  cinemaName: string; // e.g. "CGV Đồng Khởi" | "Cinora Đồng Khởi"
  hallName: string; // e.g. "Phòng IMAX Laser (Tầng 4)"
  showDate: string; // e.g. "T7, 07/11/2026"
  showTime: string; // e.g. "19:30"
  seats: SeatItem[];
  combos: ComboItem[];
  voucher?: VoucherInfo;
  serviceFee: number; // usually 0 ("Miễn phí")
  totalAmount: number;
  userEmail: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  holdExpiresAt: number; // Unix timestamp in milliseconds
  holdDurationSeconds: number; // default 600 (10 minutes)
}

export interface ETicketData {
  ticketCode: string; // e.g. "TKT-8892-VN" or "MB-2026-000128"
  bookingId: string;
  partnerTxnId: string; // e.g. "VNPAY-889912"
  paidAt: string; // ISO string or formatted date
  movieTitle: string;
  cinemaName: string;
  hallName: string;
  showDate: string;
  showTime: string;
  seats: string[]; // e.g. ["F5", "F6"]
  comboCode?: string; // e.g. "FB-000128"
  totalPaid: number;
  paymentMethod: PaymentMethod;
  userEmail: string;
  qrPayload: string;
}

export interface PaymentFailureReason {
  errorCode: string; // e.g. "VNPAY-ERR-68"
  message: string;
  detail: string;
  canRetry: boolean;
}
