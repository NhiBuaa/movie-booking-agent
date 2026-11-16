import crypto from 'node:crypto';
import type {
  ComboItemDto,
  CreateOrderRequest,
  CreatePaymentIntentRequest,
  ETicketDto,
  OrderSummaryDto,
  PaymentIntentResponse,
  PaymentWebhookPayload,
  PaymentWebhookResponse,
  TicketQrPayload,
} from '@platform/contracts';
import {
  BookingStatus,
  HoldStatus,
  PaymentMethod,
  PaymentStatus,
  TicketStatus,
} from '@platform/contracts';
import { getHoldById, consumeSeatHold } from './hold-adapter.ts';
import { resolveCanonicalShowtime } from './catalog-adapter.ts';
import {
  verifyWebhookSignature,
  signTicketQrPayload,
} from './crypto-utils.ts';

// Internal extended Order type with transactionId link
export interface PaymentAttempt {
  transactionId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  createdAt: number;
}

export interface InternalOrderSummaryDto extends OrderSummaryDto {
  transactionId?: string;
  userEmail: string;
  paymentAttempts?: Map<string, PaymentAttempt>;
}

const ordersStore = new Map<string, InternalOrderSummaryDto>();
const ordersByHoldId = new Map<string, InternalOrderSummaryDto>();
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

export function getOrderByHoldId(holdId: string): InternalOrderSummaryDto | null {
  return ordersByHoldId.get(holdId) || null;
}

export type CreateOrderResult =
  | { success: true; order: OrderSummaryDto }
  | { success: false; error: string; code: string; status: number };

export function createOrder(req: CreateOrderRequest): CreateOrderResult {
  // 1. Runtime validation for required fields
  if (!req || !req.holdId || !req.showtimeId) {
    return {
      success: false,
      code: 'MISSING_FIELD',
      error: 'Vui lòng cung cấp mã giữ chỗ (holdId) và mã suất chiếu (showtimeId).',
      status: 400,
    };
  }

  if (!req.userEmail || !req.userEmail.trim()) {
    return {
      success: false,
      code: 'MISSING_FIELD',
      error: 'Vui lòng cung cấp email khách hàng (userEmail).',
      status: 400,
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.userEmail.trim())) {
    return {
      success: false,
      code: 'INVALID_EMAIL',
      error: 'Địa chỉ email đặt đơn không đúng định dạng.',
      status: 400,
    };
  }

  const validPaymentMethods = Object.values(PaymentMethod);
  if (!req.paymentMethod || !validPaymentMethods.includes(req.paymentMethod)) {
    return {
      success: false,
      code: 'INVALID_PAYMENT_METHOD',
      error: `Phương thức thanh toán '${req.paymentMethod}' không hợp lệ.`,
      status: 400,
    };
  }

  // Resolve canonical showtime
  const slotDetails = resolveCanonicalShowtime(req.showtimeId);
  if (!slotDetails) {
    return {
      success: false,
      code: 'SHOWTIME_NOT_FOUND',
      error: `Không tìm thấy suất chiếu '${req.showtimeId}'.`,
      status: 404,
    };
  }

  // 2. Validate combos quantity and existence
  let combosAmount = 0;
  const combos: ComboItemDto[] = [];
  if (req.combos && req.combos.length > 0) {
    for (const c of req.combos) {
      if (!c.id || typeof c.quantity !== 'number' || !Number.isInteger(c.quantity) || c.quantity < 0) {
        return {
          success: false,
          code: 'INVALID_COMBO_QUANTITY',
          error: `Số lượng bắp nước của '${c.id}' không hợp lệ (phải là số nguyên không âm).`,
          status: 400,
        };
      }

      const found = AVAILABLE_COMBOS.find((item) => item.id === c.id);
      if (!found) {
        return {
          success: false,
          code: 'COMBO_NOT_FOUND',
          error: `Gói combo '${c.id}' không tồn tại.`,
          status: 400,
        };
      }

      if (c.quantity > 0) {
        combos.push({
          ...found,
          quantity: c.quantity,
        });
        combosAmount += found.price * c.quantity;
      }
    }
  }

  // 3. Inspect hold lifecycle state
  const hold = getHoldById(req.holdId);
  if (!hold) {
    return {
      success: false,
      code: 'HOLD_EXPIRED_OR_NOT_FOUND',
      error: 'Thời gian giữ ghế đã hết hạn hoặc không tìm thấy thông tin giữ chỗ.',
      status: 404,
    };
  }

  if (hold.status === HoldStatus.CONSUMED) {
    return {
      success: false,
      code: 'HOLD_ALREADY_CONSUMED',
      error: 'Mã giữ chỗ này đã được sử dụng cho một đơn hàng khác.',
      status: 409,
    };
  }

  if (hold.status === HoldStatus.CANCELLED) {
    return {
      success: false,
      code: 'HOLD_CANCELLED',
      error: 'Mã giữ chỗ này đã bị hủy bỏ trước đó.',
      status: 409,
    };
  }

  if (hold.expiresAt <= Date.now() || hold.status === HoldStatus.EXPIRED) {
    return {
      success: false,
      code: 'HOLD_EXPIRED_OR_NOT_FOUND',
      error: 'Thời gian giữ ghế đã hết hạn.',
      status: 404,
    };
  }

  // Ensure showtime matches
  if (hold.showtimeId !== slotDetails.canonicalShowtimeId) {
    return {
      success: false,
      code: 'SHOWTIME_MISMATCH',
      error: 'Mã suất chiếu của đơn hàng không khớp với thông tin giữ chỗ.',
      status: 400,
    };
  }

  // 4. Ownership verification: Verify hold userEmail matches order userEmail
  if (hold.userEmail && hold.userEmail.toLowerCase() !== req.userEmail.trim().toLowerCase()) {
    return {
      success: false,
      code: 'HOLD_OWNER_MISMATCH',
      error: 'Email đặt đơn không khớp với người giữ chỗ.',
      status: 403,
    };
  }

  // 5. Secure unique identifiers (crypto UUID)
  const orderId = `ORD-${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
  const bookingId = `BK-${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;

  // 6. Voucher calculation
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

  // 7. Consume hold to prevent double-booking
  consumeSeatHold(hold.holdId);

  const order: InternalOrderSummaryDto = {
    orderId,
    bookingId,
    holdId: hold.holdId,
    showtimeId: slotDetails.canonicalShowtimeId,
    movieTitle: slotDetails.movieTitle,
    posterUrl: slotDetails.posterUrl,
    durationMinutes: slotDetails.durationMinutes,
    format: slotDetails.format,
    cinemaName: slotDetails.cinemaName,
    hallName: slotDetails.auditoriumName,
    showDate: slotDetails.showDate,
    showTime: slotDetails.showTime,
    seats: hold.seats,
    combos,
    voucher: voucherInfo,
    seatsAmount,
    combosAmount,
    discountAmount,
    serviceFee: 0,
    totalAmount,
    status: BookingStatus.PENDING_PAYMENT,
    paymentMethod: req.paymentMethod,
    paymentStatus: PaymentStatus.PENDING,
    holdExpiresAt: hold.expiresAt,
    holdDurationSeconds: Math.max(0, Math.floor((hold.expiresAt - Date.now()) / 1000)),
    userEmail: req.userEmail.trim(),
    paymentAttempts: new Map<string, PaymentAttempt>(),
  };

  ordersStore.set(bookingId, order);
  ordersStore.set(orderId, order);
  ordersByHoldId.set(hold.holdId, order);

  return { success: true, order };
}

export type CreatePaymentIntentResult =
  | { success: true; paymentIntent: PaymentIntentResponse }
  | { success: false; error: string; code: string; status: number };

export function createPaymentIntent(
  req: CreatePaymentIntentRequest,
  callerEmail?: string
): CreatePaymentIntentResult {
  if (!req || !req.bookingId) {
    return {
      success: false,
      code: 'MISSING_FIELD',
      error: 'Vui lòng cung cấp mã đơn hàng (bookingId).',
      status: 400,
    };
  }

  const validPaymentMethods = Object.values(PaymentMethod);
  if (!req.paymentMethod || !validPaymentMethods.includes(req.paymentMethod)) {
    return {
      success: false,
      code: 'INVALID_PAYMENT_METHOD',
      error: `Phương thức thanh toán '${req.paymentMethod}' không hợp lệ.`,
      status: 400,
    };
  }

  const order = ordersStore.get(req.bookingId);
  if (!order) {
    return {
      success: false,
      code: 'BOOKING_NOT_FOUND',
      error: `Không tìm thấy đơn hàng mã ${req.bookingId}.`,
      status: 404,
    };
  }

  // Strictly enforce ownership from trusted caller context
  if (order.userEmail) {
    if (!callerEmail || callerEmail.trim().toLowerCase() !== order.userEmail.toLowerCase()) {
      return {
        success: false,
        code: 'FORBIDDEN',
        error: 'Yêu cầu cung cấp email chủ sở hữu hợp lệ (x-user-email) để thanh toán đơn hàng.',
        status: 403,
      };
    }
  }

  if (order.status === BookingStatus.CONFIRMED) {
    return {
      success: false,
      code: 'ORDER_ALREADY_PAID',
      error: 'Đơn hàng này đã được thanh toán thành công.',
      status: 409,
    };
  }

  if (order.status === BookingStatus.CANCELLED) {
    return {
      success: false,
      code: 'ORDER_CANCELLED',
      error: 'Đơn hàng này đã bị hủy bỏ.',
      status: 409,
    };
  }

  if (order.holdExpiresAt <= Date.now() || order.status === BookingStatus.EXPIRED) {
    order.status = BookingStatus.EXPIRED;
    return {
      success: false,
      code: 'HOLD_EXPIRED',
      error: 'Thời gian giữ chỗ của đơn hàng đã hết hạn. Vui lòng đặt lại vé.',
      status: 400,
    };
  }

  if (!order.paymentAttempts) {
    order.paymentAttempts = new Map<string, PaymentAttempt>();
  }

  // Idempotent retry: Reuse active transactionId if method is identical and within TTL
  let transactionId = order.transactionId;
  if (!transactionId || order.paymentMethod !== req.paymentMethod || !order.paymentAttempts.has(transactionId)) {
    // Cryptographically secure transaction ID
    transactionId = `TXN-${crypto.randomUUID().replace(/-/g, '').slice(0, 16).toUpperCase()}`;
    order.transactionId = transactionId;
    order.paymentMethod = req.paymentMethod;
    order.paymentAttempts.set(transactionId, {
      transactionId,
      paymentMethod: req.paymentMethod,
      amount: order.totalAmount,
      createdAt: Date.now(),
    });
  }

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

export type ProcessPaymentWebhookResult =
  | { success: true; response: PaymentWebhookResponse; ticket?: ETicketDto }
  | { success: false; error: string; code: string; status: number };

/**
 * Authoritative Webhook from Cinema Core / Payment Gateway.
 * Strictly verifies digital signature before issuing authentic E-Tickets.
 */
export function processPaymentWebhook(
  payload: PaymentWebhookPayload
): ProcessPaymentWebhookResult {
  if (!payload || typeof payload !== 'object') {
    return {
      success: false,
      code: 'MISSING_FIELD',
      error: 'Payload webhook không hợp lệ.',
      status: 400,
    };
  }

  if (!payload.bookingId || !payload.transactionId || !payload.partnerTxnId) {
    return {
      success: false,
      code: 'MISSING_FIELD',
      error: 'Thiếu thông tin bắt buộc trong webhook (bookingId, transactionId, partnerTxnId).',
      status: 400,
    };
  }

  // Check valid payment method enum
  const validMethods = Object.values(PaymentMethod);
  if (!payload.paymentMethod || !validMethods.includes(payload.paymentMethod)) {
    return {
      success: false,
      code: 'INVALID_PAYMENT_METHOD',
      error: `Phương thức thanh toán '${payload.paymentMethod}' không hợp lệ.`,
      status: 400,
    };
  }

  if (typeof payload.amount !== 'number' || payload.amount <= 0) {
    return {
      success: false,
      code: 'INVALID_AMOUNT',
      error: 'Số tiền thanh toán webhook không hợp lệ.',
      status: 400,
    };
  }

  // 1. Strict Cryptographic HMAC-SHA256 Verification
  try {
    if (!verifyWebhookSignature(payload)) {
      return {
        success: false,
        code: 'INVALID_SIGNATURE',
        error: 'Chữ ký số xác thực từ Cinema Core không hợp lệ hoặc bị thiếu.',
        status: 400,
      };
    }
  } catch (_err) {
    return {
      success: false,
      code: 'SERVER_CONFIGURATION_ERROR',
      error: 'Hệ thống chưa được cấu hình khóa bảo mật Cinema Core cho môi trường hiện tại.',
      status: 500,
    };
  }

  // 2. Order Lookup
  const order = ordersStore.get(payload.bookingId);
  if (!order) {
    return {
      success: false,
      code: 'ORDER_NOT_FOUND',
      error: `Không tìm thấy đơn hàng mã '${payload.bookingId}'.`,
      status: 404,
    };
  }

  // 3. Idempotency Check: Already confirmed order returns existing ticket without duplicating
  if (order.status === BookingStatus.CONFIRMED) {
    const existingTicket = ticketsStore.get(order.bookingId);
    return {
      success: true,
      response: {
        received: true,
        bookingStatus: BookingStatus.CONFIRMED,
        message: 'Đơn hàng đã được xác nhận trước đó.',
      },
      ticket: existingTicket,
    };
  }

  // 4. Cross-Reconciliation Checks (Đối soát giao dịch)
  // Ensure order has initialized at least one payment transaction attempt (Finding 3)
  if (!order.paymentAttempts || order.paymentAttempts.size === 0) {
    return {
      success: false,
      code: 'TRANSACTION_NOT_INITIALIZED',
      error: 'Đơn hàng chưa từng khởi tạo giao dịch thanh toán (thiếu payment intent).',
      status: 400,
    };
  }

  // Reconcile transactionId against registered payment attempts (Finding 3 & 4)
  const attempt = order.paymentAttempts.get(payload.transactionId);
  if (!attempt) {
    return {
      success: false,
      code: 'TRANSACTION_ID_MISMATCH',
      error: `Mã giao dịch webhook '${payload.transactionId}' không tồn tại hoặc không khớp với các giao dịch đã khởi tạo của đơn hàng.`,
      status: 400,
    };
  }

  // Reconcile exact amount
  if (payload.amount !== order.totalAmount) {
    return {
      success: false,
      code: 'AMOUNT_MISMATCH',
      error: `Số tiền thanh toán ${payload.amount} đ không khớp với đơn hàng ${order.totalAmount} đ.`,
      status: 400,
    };
  }

  // Reconcile payment method with the specific payment attempt
  if (payload.paymentMethod !== attempt.paymentMethod) {
    return {
      success: false,
      code: 'PAYMENT_METHOD_MISMATCH',
      error: `Phương thức thanh toán '${payload.paymentMethod}' không khớp với phương thức đã đăng ký '${attempt.paymentMethod}'.`,
      status: 400,
    };
  }

  // 5. Check order lifecycle & late-arriving webhook
  if (order.status === BookingStatus.CANCELLED) {
    return {
      success: false,
      code: 'ORDER_CANCELLED',
      error: 'Đơn hàng đã bị hủy trước khi nhận thanh toán.',
      status: 409,
    };
  }

  if (order.holdExpiresAt <= Date.now() || order.status === BookingStatus.EXPIRED) {
    order.status = BookingStatus.EXPIRED;
    return {
      success: false,
      code: 'PAYMENT_EXPIRED_RECONCILIATION_REQUIRED',
      error: 'Thanh toán thành công nhưng thời gian giữ chỗ của đơn hàng đã hết hạn. Đơn hàng chuyển sang trạng thái chờ đối soát.',
      status: 409,
    };
  }

  // 6. Payment Success Processing
  if (payload.status === PaymentStatus.SUCCEEDED) {
    order.status = BookingStatus.CONFIRMED;
    order.paymentStatus = PaymentStatus.SUCCEEDED;
    order.transactionId = attempt.transactionId;
    order.paymentMethod = attempt.paymentMethod;

    // Issue authoritative ticket with collision-proof ticketCode
    let ticketCode: string;
    do {
      const hex = crypto.randomBytes(4).toString('hex').toUpperCase();
      const num = crypto.randomInt(10000, 99999);
      ticketCode = `TKT-${hex}-${num}-VN`;
    } while (ticketsStore.has(ticketCode));

    const issuedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

    // Authentically sign Ticket QR payload using Cinema Core ticket secret
    let qrSignature: string;
    try {
      qrSignature = signTicketQrPayload({
        ticketCode,
        bookingId: order.bookingId,
        showtimeId: order.showtimeId,
        seats: order.seats.map((s) => s.id),
        issuedAt,
        expiresAt,
      });
    } catch (_err) {
      return {
        success: false,
        code: 'SERVER_CONFIGURATION_ERROR',
        error: 'Hệ thống chưa được cấu hình khóa ký vé Cinema Core.',
        status: 500,
      };
    }

    const qrData: TicketQrPayload = {
      ticketCode,
      bookingId: order.bookingId,
      showtimeId: order.showtimeId,
      seats: order.seats.map((s) => s.id),
      issuedAt,
      expiresAt,
      signature: qrSignature,
    };

    const ticket: ETicketDto = {
      ticketCode,
      bookingId: order.bookingId,
      partnerTxnId: payload.partnerTxnId,
      paidAt: issuedAt,
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
      paymentMethod: payload.paymentMethod,
      status: TicketStatus.ISSUED,
      qrPayload: JSON.stringify(qrData),
    };

    ticketsStore.set(ticketCode, ticket);
    ticketsStore.set(order.bookingId, ticket);

    return {
      success: true,
      response: {
        received: true,
        bookingStatus: BookingStatus.CONFIRMED,
        message: 'Xác nhận thanh toán và phát hành vé thành công.',
      },
      ticket,
    };
  }

  if (payload.status === PaymentStatus.FAILED) {
    order.paymentStatus = PaymentStatus.FAILED;
    return {
      success: true,
      response: {
        received: true,
        bookingStatus: BookingStatus.PENDING_PAYMENT,
        message: 'Thanh toán không thành công.',
      },
    };
  }

  return {
    success: true,
    response: {
      received: true,
      bookingStatus: order.status,
      message: 'Ghi nhận trạng thái thanh toán.',
    },
  };
}

export type GetTicketResult =
  | { success: true; ticket: ETicketDto }
  | { success: false; error: string; code: string; status: number };

export function getTicketResult(
  ticketCodeOrBookingId: string,
  callerEmail?: string
): GetTicketResult {
  const ticket = ticketsStore.get(ticketCodeOrBookingId);
  if (!ticket) {
    return {
      success: false,
      code: 'TICKET_NOT_FOUND',
      error: `Không tìm thấy vé xem phim '${ticketCodeOrBookingId}' hoặc vé chưa được phát hành.`,
      status: 404,
    };
  }

  // Strictly enforce ticket ownership
  const order = ordersStore.get(ticket.bookingId);
  if (order?.userEmail) {
    if (!callerEmail || callerEmail.trim().toLowerCase() !== order.userEmail.toLowerCase()) {
      return {
        success: false,
        code: 'FORBIDDEN',
        error: 'Bạn không có quyền truy cập vé của người dùng khác.',
        status: 403,
      };
    }
  }

  return { success: true, ticket };
}

export function expireOrderForTesting(bookingId: string): void {
  const order = ordersStore.get(bookingId);
  if (order) {
    order.holdExpiresAt = Date.now() - 1000;
    order.status = BookingStatus.EXPIRED;
  }
}

export function getTicketById(
  ticketCodeOrBookingId: string,
  callerEmail?: string
): ETicketDto | null {
  const result = getTicketResult(ticketCodeOrBookingId, callerEmail);
  return result.success ? result.ticket : null;
}
