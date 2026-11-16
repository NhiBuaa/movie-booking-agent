import type {
  ComboItemDto,
  CreateOrderRequest,
  CreatePaymentIntentRequest,
  ETicketDto,
  OrderSummaryDto,
  PaymentIntentResponse,
  TicketQrPayload,
} from '../../../../packages/contracts/src/index.ts';
import {
  BookingStatus,
  MovieFormat,
  PaymentMethod,
  PaymentStatus,
  TicketStatus,
} from '../../../../packages/contracts/src/index.ts';
import { getActiveHold } from './hold-adapter.ts';

const ordersStore = new Map<string, OrderSummaryDto>();
const ticketsStore = new Map<string, ETicketDto>();

export const AVAILABLE_COMBOS: ComboItemDto[] = [
  {
    id: 'combo-single',
    name: 'Combo đơn',
    description: '1 bắp vừa + 1 nước ngọt',
    price: 65000,
    quantity: 0,
  },
  {
    id: 'combo-duo',
    name: 'Combo đôi',
    description: '1 bắp lớn + 2 nước ngọt',
    price: 85000,
    quantity: 0,
  },
  {
    id: 'combo-family',
    name: 'Combo gia đình',
    description: '2 bắp lớn + 4 nước ngọt + 1 snack',
    price: 150000,
    quantity: 0,
  },
];

export type CreateOrderResult =
  | { success: true; order: OrderSummaryDto }
  | { success: false; error: string; code: string; status: number };

export function createOrder(req: CreateOrderRequest): CreateOrderResult {
  const hold = getActiveHold(req.holdId);
  if (!hold) {
    return {
      success: false,
      code: 'HOLD_EXPIRED_OR_NOT_FOUND',
      error: 'Thời gian giữ ghế đã hết hạn hoặc không tìm thấy thông tin giữ chỗ.',
      status: 404,
    };
  }

  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
  const bookingId = `BK-${Date.now().toString(36).toUpperCase()}`;

  let combosAmount = 0;
  const combos: ComboItemDto[] = [];
  if (req.combos && req.combos.length > 0) {
    for (const c of req.combos) {
      const found = AVAILABLE_COMBOS.find((item) => item.id === c.id);
      if (found && c.quantity > 0) {
        combos.push({
          ...found,
          quantity: c.quantity,
        });
        combosAmount += found.price * c.quantity;
      }
    }
  }

  let discountAmount = 0;
  let voucherInfo = undefined;
  if (req.voucherCode?.toUpperCase() === 'CHAOBANMOI') {
    discountAmount = 30000;
    voucherInfo = {
      code: 'CHAOBANMOI',
      discountAmount: 30000,
      description: 'Giảm 30.000 đ cho khách hàng mới',
      isApplied: true,
    };
  }

  const seatsAmount = hold.totalPrice;
  const totalAmount = Math.max(0, seatsAmount + combosAmount - discountAmount);

  const order: OrderSummaryDto = {
    orderId,
    bookingId,
    holdId: hold.holdId,
    showtimeId: hold.showtimeId,
    movieTitle: 'Chuyến tàu cuối hè',
    posterUrl: '/images/artworks/train-chuyen-tau-cuoi-he.png',
    durationMinutes: 115,
    format: MovieFormat.IMAX_LASER,
    cinemaName: 'CGV Vincom Đồng Khởi',
    hallName: 'Phòng chiếu 01 (IMAX)',
    showDate: '07/11/2026',
    showTime: '19:30',
    seats: hold.seats,
    combos,
    voucher: voucherInfo,
    seatsAmount,
    combosAmount,
    discountAmount,
    serviceFee: 0,
    totalAmount,
    status: BookingStatus.PENDING_PAYMENT,
    paymentMethod: req.paymentMethod || PaymentMethod.MOMO,
    paymentStatus: PaymentStatus.PENDING,
    holdExpiresAt: hold.expiresAt,
    holdDurationSeconds: Math.max(0, Math.floor((hold.expiresAt - Date.now()) / 1000)),
  };

  ordersStore.set(bookingId, order);
  return { success: true, order };
}

export type CreatePaymentIntentResult =
  | { success: true; paymentIntent: PaymentIntentResponse }
  | { success: false; error: string; code: string; status: number };

export function createPaymentIntent(
  req: CreatePaymentIntentRequest
): CreatePaymentIntentResult {
  const order = ordersStore.get(req.bookingId);
  if (!order) {
    return {
      success: false,
      code: 'BOOKING_NOT_FOUND',
      error: `Không tìm thấy đơn hàng mã ${req.bookingId}.`,
      status: 404,
    };
  }

  const transactionId = `TXN-${Date.now().toString(36).toUpperCase()}`;

  const ticketCode = `TKT-${Math.floor(1000 + Math.random() * 9000)}-VN`;
  const qrData: TicketQrPayload = {
    ticketCode,
    bookingId: order.bookingId,
    showtimeId: order.showtimeId,
    seats: order.seats.map((s) => s.id),
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    signature: 'hmac-sha256-cinema-core-verified-signature',
  };

  const ticket: ETicketDto = {
    ticketCode,
    bookingId: order.bookingId,
    partnerTxnId: `${req.paymentMethod.toUpperCase()}-${Date.now()}`,
    paidAt: new Date().toISOString(),
    movieTitle: order.movieTitle,
    movieSlug: 'chuyen-tau-cuoi-he',
    cinemaName: order.cinemaName,
    hallName: order.hallName,
    showDate: order.showDate,
    showTime: order.showTime,
    seats: order.seats.map((s) => s.label),
    seatType: order.seats[0]?.type.toUpperCase() || 'VIP',
    comboDescription: order.combos.map((c) => `${c.quantity}x ${c.name}`).join(', '),
    totalPaid: order.totalAmount,
    paymentMethod: req.paymentMethod,
    status: TicketStatus.ISSUED,
    qrPayload: JSON.stringify(qrData),
  };

  ticketsStore.set(ticketCode, ticket);
  ticketsStore.set(order.bookingId, ticket);

  return {
    success: true,
    paymentIntent: {
      transactionId,
      bookingId: order.bookingId,
      paymentMethod: req.paymentMethod,
      amount: order.totalAmount,
      qrCodeUrl: `/images/qr-placeholder.png`,
      deepLinkUrl: `${req.paymentMethod}://pay?txn=${transactionId}`,
      expiresAt: order.holdExpiresAt,
    },
  };
}

export function getTicketById(ticketCodeOrBookingId: string): ETicketDto | null {
  if (ticketCodeOrBookingId === 'TKT-8892-VN') {
    const qr: TicketQrPayload = {
      ticketCode: 'TKT-8892-VN',
      bookingId: 'BK-SAMPLE-8892',
      showtimeId: 'BK-2026-CHUYENTAU',
      seats: ['F5', 'F6'],
      issuedAt: '2026-11-04T19:00:00.000Z',
      expiresAt: '2026-11-04T22:30:00.000Z',
      signature: 'hmac-sha256-cinema-core-verified-signature',
    };

    return {
      ticketCode: 'TKT-8892-VN',
      bookingId: 'BK-SAMPLE-8892',
      partnerTxnId: 'MOMO-PAY-77881',
      paidAt: '2026-11-04T19:05:00.000Z',
      movieTitle: 'Chuyến tàu cuối hè',
      movieSlug: 'chuyen-tau-cuoi-he',
      cinemaName: 'CGV Vincom Đồng Khởi',
      hallName: 'Phòng chiếu 01 (IMAX)',
      showDate: '07/11/2026',
      showTime: '19:30',
      seats: ['F5', 'F6'],
      seatType: 'VIP',
      totalPaid: 260000,
      paymentMethod: PaymentMethod.MOMO,
      status: TicketStatus.ISSUED,
      qrPayload: JSON.stringify(qr),
    };
  }

  return ticketsStore.get(ticketCodeOrBookingId) || null;
}
