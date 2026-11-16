import type { SeatItem, ComboItem, VoucherInfo, ETicketData } from './types.ts';
import { AVAILABLE_VOUCHERS } from './payment-fixtures.ts';

/**
 * Format a numeric amount to Vietnamese Dong currency string (e.g. 295000 -> "295.000 đ")
 */
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('vi-VN').format(Math.max(0, amount));
  return `${formatted} đ`;
}

/**
 * Format seconds into MM:SS format (e.g. 585 -> "09:45")
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const paddedMins = mins.toString().padStart(2, '0');
  const paddedSecs = secs.toString().padStart(2, '0');
  return `${paddedMins}:${paddedSecs}`;
}

/**
 * Calculate the total cost of selected seats
 */
export function calculateSeatTotal(seats: SeatItem[]): number {
  return seats.reduce((sum, seat) => sum + seat.price, 0);
}

/**
 * Calculate the total cost of selected combo items
 */
export function calculateComboTotal(combos: ComboItem[]): number {
  return combos.reduce((sum, combo) => sum + combo.price * combo.quantity, 0);
}

/**
 * Calculate the grand total of the order after voucher discount and service fees
 */
export function calculatePaymentTotal(
  seats: SeatItem[],
  combos: ComboItem[],
  voucherDiscount = 0,
  serviceFee = 0
): number {
  const seatsTotal = calculateSeatTotal(seats);
  const comboTotal = calculateComboTotal(combos);
  const subtotal = seatsTotal + comboTotal;
  const total = subtotal - voucherDiscount + serviceFee;
  return Math.max(0, total);
}

/**
 * Update combo quantity with clamp (minimum 0, maximum 10)
 */
export function updateComboQuantity(
  combos: ComboItem[],
  comboId: string,
  delta: number
): ComboItem[] {
  return combos.map((item) => {
    if (item.id === comboId) {
      const nextQuantity = Math.max(0, Math.min(10, item.quantity + delta));
      return { ...item, quantity: nextQuantity };
    }
    return item;
  });
}

/**
 * Validate and apply a promotional voucher code
 */
export function applyVoucher(
  code: string,
  currentSubtotal: number
): { success: boolean; voucher?: VoucherInfo; message: string } {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { success: false, message: 'Vui lòng nhập mã giảm giá' };
  }

  const match = AVAILABLE_VOUCHERS.find((v) => v.code === normalized);
  if (!match) {
    return { success: false, message: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' };
  }

  if (currentSubtotal < match.minOrder) {
    return {
      success: false,
      message: `Đơn hàng tối thiểu ${formatCurrency(match.minOrder)} để áp dụng mã này`,
    };
  }

  return {
    success: true,
    voucher: {
      code: match.code,
      discountAmount: match.discountAmount,
      description: match.description,
      isApplied: true,
    },
    message: `Đã áp dụng mã thành công! Giảm ${formatCurrency(match.discountAmount)}`,
  };
}

/**
 * Check the ticket hold timer
 * - Warning threshold: under 120 seconds (2 minutes)
 */
export function validateHoldTime(expiresAt: number): {
  remainingSeconds: number;
  isExpired: boolean;
  isWarning: boolean;
} {
  const now = Date.now();
  const diffMs = expiresAt - now;
  const remainingSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const isExpired = remainingSeconds <= 0;
  const isWarning = remainingSeconds > 0 && remainingSeconds <= 120;

  return {
    remainingSeconds,
    isExpired,
    isWarning,
  };
}

/**
 * Generate standard QR payload for verification by Cinema Core gate scanners
 */
export function generateTicketQRPayload(ticket: ETicketData): string {
  return JSON.stringify({
    t: ticket.ticketCode,
    b: ticket.bookingId,
    p: ticket.partnerTxnId,
    m: ticket.movieTitle,
    c: ticket.cinemaName,
    s: ticket.seats,
    d: ticket.showDate,
    h: ticket.showTime,
    sig: 'VERIFIED_CINEMA_CORE_2026',
  });
}
