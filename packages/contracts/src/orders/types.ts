import type { BookingStatus, MovieFormat, PaymentMethod, PaymentStatus } from '../common/enums.ts';
import type { HeldSeatItemDto } from '../inventory/types.ts';

export interface ComboItemDto {
  id: string; // e.g. "combo-duo", "combo-single"
  name: string; // e.g. "Combo đôi"
  description: string; // "1 bắp lớn + 2 nước ngọt"
  price: number; // e.g. 85000
  quantity: number;
}

export interface VoucherInfoDto {
  code: string;
  discountAmount: number;
  description: string;
  isApplied: boolean;
  minOrderValue?: number;
}

export interface CreateOrderRequest {
  holdId: string;
  showtimeId: string;
  userEmail: string;
  userPhone?: string;
  combos?: { id: string; quantity: number }[];
  voucherCode?: string;
  paymentMethod: PaymentMethod;
}

export interface OrderSummaryDto {
  orderId: string;
  bookingId: string;
  holdId: string;
  showtimeId: string;
  movieTitle: string;
  posterUrl: string;
  durationMinutes: number;
  format: MovieFormat;
  cinemaName: string;
  hallName: string;
  showDate: string; // "2026-11-04"
  showTime: string; // "19:30"
  seats: HeldSeatItemDto[];
  combos: ComboItemDto[];
  voucher?: VoucherInfoDto;
  seatsAmount: number;
  combosAmount: number;
  discountAmount: number;
  serviceFee: number; // 0
  totalAmount: number;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  holdExpiresAt: number;
  holdDurationSeconds: number;
}

/**
 * Payment Gateway Integration & Webhook DTOs.
 */
export interface CreatePaymentIntentRequest {
  bookingId: string;
  paymentMethod: PaymentMethod;
  returnUrl?: string;
}

export interface PaymentIntentResponse {
  transactionId: string;
  bookingId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  qrCodeUrl?: string;
  deepLinkUrl?: string;
  expiresAt: number; // Unix timestamp
}

export interface PaymentWebhookPayload {
  transactionId: string;
  bookingId: string;
  partnerTxnId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  signature: string; // HMAC SHA-256 webhook signature
  payloadTimestamp: string;
}

export interface PaymentWebhookResponse {
  received: boolean;
  bookingStatus: BookingStatus;
  message?: string;
}
