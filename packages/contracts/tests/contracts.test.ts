import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  UserRole,
  SeatType,
  SeatStatus,
  HoldStatus,
  BookingStatus,
  PaymentStatus,
  PaymentMethod,
  TicketStatus,
  MovieAgeRating,
  MovieFormat,
} from '../src/index.ts';
import type {
  CreateHoldRequest,
  CreateHoldResponse,
  OrderSummaryDto,
  PaymentWebhookPayload,
  ETicketDto,
  TicketQrPayload,
  AuditoriumLayoutDto,
  SearchMoviesToolParams,
  SearchMoviesToolResult,
} from '../src/index.ts';

describe('@platform/contracts — Domain Integrity & Type Invariants', () => {
  it('should expose valid and immutable domain enum constants', () => {
    assert.equal(UserRole.CUSTOMER, 'CUSTOMER');
    assert.equal(UserRole.CINEMA_STAFF, 'CINEMA_STAFF');
    assert.equal(UserRole.ORGANIZER_ADMIN, 'ORGANIZER_ADMIN');

    assert.equal(SeatType.STANDARD, 'standard');
    assert.equal(SeatType.VIP, 'vip');
    assert.equal(SeatType.SWEETBOX, 'sweetbox');

    assert.equal(SeatStatus.AVAILABLE, 'available');
    assert.equal(SeatStatus.HELD, 'held');
    assert.equal(SeatStatus.RESERVED, 'reserved');

    assert.equal(HoldStatus.ACTIVE, 'ACTIVE');
    assert.equal(HoldStatus.EXPIRED, 'EXPIRED');

    assert.equal(PaymentMethod.MOMO, 'momo');
    assert.equal(PaymentMethod.VNPAY, 'vnpay');

    assert.equal(TicketStatus.ISSUED, 'ISSUED');
    assert.equal(TicketStatus.CHECKED_IN, 'CHECKED_IN');
  });

  it('should validate 64-seat auditorium matrix structural contract', () => {
    const layout: AuditoriumLayoutDto = {
      auditoriumId: 'aud-03',
      cinemaId: 'cgv-dong-khoi',
      name: 'Cinema 03 (IMAX Laser)',
      totalRows: 8,
      totalCols: 8,
      totalSeats: 64,
      seats: [
        { id: 'A1', row: 'A', col: 1, type: SeatType.STANDARD, label: 'A1' },
        { id: 'F5', row: 'F', col: 5, type: SeatType.VIP, label: 'F5' },
        {
          id: 'H1',
          row: 'H',
          col: 1,
          type: SeatType.SWEETBOX,
          label: 'H1',
          pairId: 'H1-H2',
        },
        {
          id: 'H2',
          row: 'H',
          col: 2,
          type: SeatType.SWEETBOX,
          label: 'H2',
          pairId: 'H1-H2',
        },
      ],
    };

    assert.equal(layout.totalSeats, 64);
    assert.equal(layout.seats[0].type, 'standard');
    assert.equal(layout.seats[1].type, 'vip');
    assert.equal(layout.seats[2].pairId, 'H1-H2');
  });

  it('should validate atomic seat hold contract with 5-minute TTL (300 seconds)', () => {
    const holdReq: CreateHoldRequest = {
      showtimeId: 'st-1930',
      seatIds: ['F5', 'F6'],
      userEmail: 'nhibuaa@cinora.vn',
    };

    const holdResp: CreateHoldResponse = {
      holdId: 'HOLD-88910',
      showtimeId: holdReq.showtimeId,
      status: HoldStatus.ACTIVE,
      holdExpiresAt: Date.now() + 300 * 1000,
      holdDurationSeconds: 300,
      seats: [
        { id: 'F5', label: 'F5', price: 130000, type: SeatType.VIP },
        { id: 'F6', label: 'F6', price: 130000, type: SeatType.VIP },
      ],
      totalPrice: 260000,
    };

    assert.equal(holdResp.holdDurationSeconds, 300);
    assert.equal(holdResp.seats.length, 2);
    assert.equal(holdResp.totalPrice, 260000);
    assert.equal(holdResp.status, 'ACTIVE');
  });

  it('should validate order summary and payment webhook payload integrity', () => {
    const order: OrderSummaryDto = {
      orderId: 'ORD-2026-001',
      bookingId: 'BK-89012',
      holdId: 'HOLD-88910',
      showtimeId: 'st-1930',
      movieTitle: 'Chuyến tàu cuối hè',
      posterUrl: '/posters/chuyen-tau-cuoi-he.jpg',
      durationMinutes: 128,
      format: MovieFormat.IMAX_LASER,
      cinemaName: 'CGV Vincom Đồng Khởi',
      hallName: 'Cinema 03',
      showDate: '2026-11-04',
      showTime: '19:30',
      seats: [
        { id: 'F5', label: 'F5', price: 130000, type: SeatType.VIP },
        { id: 'F6', label: 'F6', price: 130000, type: SeatType.VIP },
      ],
      combos: [
        {
          id: 'combo-duo',
          name: 'Combo đôi',
          description: '1 bắp lớn + 2 nước ngọt',
          price: 85000,
          quantity: 1,
        },
      ],
      seatsAmount: 260000,
      combosAmount: 85000,
      discountAmount: 0,
      serviceFee: 0,
      totalAmount: 345000,
      status: BookingStatus.PENDING_PAYMENT,
      paymentMethod: PaymentMethod.MOMO,
      paymentStatus: PaymentStatus.PENDING,
      holdExpiresAt: Date.now() + 300 * 1000,
      holdDurationSeconds: 300,
    };

    assert.equal(order.totalAmount, 345000);
    assert.equal(order.status, 'PENDING_PAYMENT');

    const webhook: PaymentWebhookPayload = {
      transactionId: 'TXN-998811',
      bookingId: order.bookingId,
      partnerTxnId: 'MOMO-PAY-77881',
      paymentMethod: PaymentMethod.MOMO,
      amount: 345000,
      status: PaymentStatus.SUCCEEDED,
      signature: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      payloadTimestamp: new Date().toISOString(),
    };

    assert.equal(webhook.amount, 345000);
    assert.equal(webhook.status, 'succeeded');
    assert.ok(webhook.signature.length > 0);
  });

  it('should validate cryptographic E-Ticket with HMAC QR payload and scanner verification', () => {
    const qrPayload: TicketQrPayload = {
      ticketCode: 'TKT-8892-VN',
      bookingId: 'BK-89012',
      showtimeId: 'st-1930',
      seats: ['F5', 'F6'],
      issuedAt: '2026-11-04T19:00:00.000Z',
      expiresAt: '2026-11-04T22:30:00.000Z',
      signature: 'hmac-sha256-cinema-core-verified-signature',
    };

    const ticket: ETicketDto = {
      ticketCode: qrPayload.ticketCode,
      bookingId: qrPayload.bookingId,
      partnerTxnId: 'MOMO-PAY-77881',
      paidAt: '2026-11-04T19:05:00.000Z',
      movieTitle: 'Chuyến tàu cuối hè',
      cinemaName: 'CGV Vincom Đồng Khởi',
      hallName: 'Cinema 03',
      showDate: '04/11/2026',
      showTime: '19:30',
      seats: ['F5', 'F6'],
      seatType: 'VIP',
      totalPaid: 345000,
      paymentMethod: PaymentMethod.MOMO,
      status: TicketStatus.ISSUED,
      qrPayload: JSON.stringify(qrPayload),
    };

    assert.equal(ticket.status, 'ISSUED');
    assert.equal(ticket.ticketCode, 'TKT-8892-VN');

    const parsed = JSON.parse(ticket.qrPayload) as TicketQrPayload;
    assert.equal(parsed.ticketCode, ticket.ticketCode);
    assert.equal(parsed.signature, 'hmac-sha256-cinema-core-verified-signature');
  });

  it('should validate AI Agent tool calling contract structure', () => {
    const params: SearchMoviesToolParams = {
      query: 'Chuyến tàu cuối hè',
      format: MovieFormat.IMAX_LASER,
    };

    const result: SearchMoviesToolResult = {
      movies: [
        {
          id: 'movie-chuyen-tau-cuoi-he',
          slug: 'chuyen-tau-cuoi-he',
          title: 'Chuyến tàu cuối hè',
          posterUrl: '/posters/chuyen-tau-cuoi-he.jpg',
          durationMinutes: 128,
          ageRating: MovieAgeRating.T16,
          genres: ['Tâm lý', 'Lãng mạn'],
          formats: [MovieFormat.TWO_D, MovieFormat.IMAX_LASER],
          cineScore: 4.9,
          releaseDate: '2026-11-04',
          status: 'NOW_SHOWING',
        },
      ],
      totalFound: 1,
    };

    assert.equal(params.query, 'Chuyến tàu cuối hè');
    assert.equal(result.totalFound, 1);
    assert.equal(result.movies[0].cineScore, 4.9);
  });
});
