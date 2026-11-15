import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrency,
  formatTimeRemaining,
  calculateSeatTotal,
  calculateComboTotal,
  calculatePaymentTotal,
  updateComboQuantity,
  applyVoucher,
  validateHoldTime,
  generateTicketQRPayload,
} from '../src/features/payment/model/payment-logic.ts';
import {
  SAMPLE_ORDER_FIXTURE,
  SAMPLE_ETICKET_FIXTURE,
  SAMPLE_PAYMENT_FAILURE,
} from '../src/features/payment/model/payment-fixtures.ts';
import type { SeatItem, ComboItem, ETicketData } from '../src/features/payment/model/types.ts';

describe('Payment & Checkout Subsystem Logic (S11 - S14)', () => {
  describe('Financial Calculations', () => {
    test('calculateSeatTotal calculates total price for seats correctly', () => {
      const seats: SeatItem[] = [
        { id: '1', label: 'F5', type: 'vip', price: 120000 },
        { id: '2', label: 'F6', type: 'vip', price: 120000 },
      ];
      const total = calculateSeatTotal(seats);
      assert.equal(total, 240000);
    });

    test('calculateComboTotal calculates total price for combos with quantity', () => {
      const combos: ComboItem[] = [
        { id: 'c1', name: 'Combo đôi', description: '1 bắp + 2 nước', price: 85000, quantity: 2 },
        { id: 'c2', name: 'Bắp phô mai', description: 'Bắp lớn', price: 45000, quantity: 1 },
      ];
      const total = calculateComboTotal(combos);
      assert.equal(total, 85000 * 2 + 45000);
    });

    test('calculatePaymentTotal applies voucher discount and clamps to non-negative', () => {
      const seats: SeatItem[] = [
        { id: '1', label: 'F5', type: 'vip', price: 120000 },
        { id: '2', label: 'F6', type: 'vip', price: 120000 },
      ];
      const combos: ComboItem[] = [
        { id: 'c1', name: 'Combo đôi', description: '1 bắp + 2 nước', price: 85000, quantity: 1 },
      ];

      // 240.000 + 85.000 - 30.000 = 295.000
      const total = calculatePaymentTotal(seats, combos, 30000, 0);
      assert.equal(total, 295000);

      // Oversized discount clamps to 0
      const totalZero = calculatePaymentTotal(seats, combos, 500000, 0);
      assert.equal(totalZero, 0);
    });

    test('updateComboQuantity increments and decrements with min 0 and max 10 boundary', () => {
      const combos: ComboItem[] = [
        { id: 'c1', name: 'Combo đôi', description: '', price: 85000, quantity: 1 },
      ];

      const incremented = updateComboQuantity(combos, 'c1', 1);
      assert.equal(incremented[0].quantity, 2);

      const decremented = updateComboQuantity(combos, 'c1', -1);
      assert.equal(decremented[0].quantity, 0);

      // Cannot go below 0
      const clampedBelowZero = updateComboQuantity(decremented, 'c1', -1);
      assert.equal(clampedBelowZero[0].quantity, 0);

      // Cannot exceed 10
      let maxed = combos;
      for (let i = 0; i < 15; i++) {
        maxed = updateComboQuantity(maxed, 'c1', 1);
      }
      assert.equal(maxed[0].quantity, 10);
    });
  });

  describe('Voucher Management', () => {
    test('applyVoucher applies valid voucher code when order subtotal meets requirement', () => {
      const subtotal = 325000;
      const res = applyVoucher('CINORA30', subtotal);
      assert.equal(res.success, true);
      assert.ok(res.voucher);
      assert.equal(res.voucher.code, 'CINORA30');
      assert.equal(res.voucher.discountAmount, 30000);
      assert.equal(res.voucher.isApplied, true);
    });

    test('applyVoucher is case-insensitive and trims whitespace', () => {
      const res = applyVoucher('  cinora30  ', 250000);
      assert.equal(res.success, true);
      assert.equal(res.voucher?.code, 'CINORA30');
    });

    test('applyVoucher rejects when subtotal is below minimum order requirement', () => {
      const lowSubtotal = 100000;
      const res = applyVoucher('CINORA30', lowSubtotal);
      assert.equal(res.success, false);
      assert.match(res.message, /tối thiểu/i);
    });

    test('applyVoucher rejects unknown voucher code', () => {
      const res = applyVoucher('INVALID_CODE', 500000);
      assert.equal(res.success, false);
      assert.match(res.message, /không hợp lệ/i);
    });
  });

  describe('Hold Timer TTL & Formatting', () => {
    test('formatCurrency formats VND numbers properly', () => {
      const formatted = formatCurrency(295000);
      assert.ok(formatted.includes('295') && formatted.includes('đ'));
      assert.equal(formatCurrency(0), '0 đ');
      assert.equal(formatCurrency(-50000), '0 đ');
    });

    test('formatTimeRemaining converts seconds into MM:SS correctly', () => {
      assert.equal(formatTimeRemaining(600), '10:00');
      assert.equal(formatTimeRemaining(585), '09:45');
      assert.equal(formatTimeRemaining(120), '02:00');
      assert.equal(formatTimeRemaining(5), '00:05');
      assert.equal(formatTimeRemaining(0), '00:00');
      assert.equal(formatTimeRemaining(-10), '00:00');
    });

    test('validateHoldTime flags warning when under 2 minutes (120 seconds)', () => {
      const now = Date.now();
      // 90 seconds in the future
      const warnTime = now + 90 * 1000;
      const warnRes = validateHoldTime(warnTime);
      assert.equal(warnRes.isExpired, false);
      assert.equal(warnRes.isWarning, true);
      assert.ok(warnRes.remainingSeconds <= 90 && warnRes.remainingSeconds >= 89);

      // 5 minutes in the future (no warning)
      const normalTime = now + 300 * 1000;
      const normalRes = validateHoldTime(normalTime);
      assert.equal(normalRes.isExpired, false);
      assert.equal(normalRes.isWarning, false);

      // Expired in the past
      const expiredTime = now - 1000;
      const expRes = validateHoldTime(expiredTime);
      assert.equal(expRes.isExpired, true);
      assert.equal(expRes.isWarning, false);
      assert.equal(expRes.remainingSeconds, 0);
    });
  });

  describe('ETicket QR Payload & Fixture Integrity', () => {
    test('generateTicketQRPayload produces parseable JSON with required verification signature', () => {
      const payloadStr = generateTicketQRPayload(SAMPLE_ETICKET_FIXTURE);
      const parsed = JSON.parse(payloadStr);
      assert.equal(parsed.t, SAMPLE_ETICKET_FIXTURE.ticketCode);
      assert.equal(parsed.b, SAMPLE_ETICKET_FIXTURE.bookingId);
      assert.equal(parsed.sig, 'VERIFIED_CINEMA_CORE_2026');
      assert.deepEqual(parsed.s, ['F5', 'F6']);
    });

    test('SAMPLE_ORDER_FIXTURE conforms to spec numbers', () => {
      assert.equal(SAMPLE_ORDER_FIXTURE.movieTitle, 'Chuyến tàu cuối hè');
      assert.equal(SAMPLE_ORDER_FIXTURE.cinemaName, 'CGV Đồng Khởi');
      assert.equal(SAMPLE_ORDER_FIXTURE.showTime, '19:30');
      assert.equal(SAMPLE_ORDER_FIXTURE.seats.length, 2);
      assert.equal(SAMPLE_ORDER_FIXTURE.seats[0].label, 'F5');
      assert.equal(SAMPLE_ORDER_FIXTURE.seats[1].label, 'F6');

      const seatTotal = calculateSeatTotal(SAMPLE_ORDER_FIXTURE.seats);
      assert.equal(seatTotal, 240000);

      const comboTotal = calculateComboTotal(SAMPLE_ORDER_FIXTURE.combos);
      assert.equal(comboTotal, 85000);

      const discount = SAMPLE_ORDER_FIXTURE.voucher?.discountAmount || 0;
      assert.equal(discount, 30000);

      const total = calculatePaymentTotal(
        SAMPLE_ORDER_FIXTURE.seats,
        SAMPLE_ORDER_FIXTURE.combos,
        discount
      );
      assert.equal(total, 295000);
      assert.equal(SAMPLE_ORDER_FIXTURE.totalAmount, 295000);
    });

    test('SAMPLE_ETICKET_FIXTURE has ticketCode TKT-8892-VN and confirmed payment', () => {
      assert.equal(SAMPLE_ETICKET_FIXTURE.ticketCode, 'TKT-8892-VN');
      assert.equal(SAMPLE_ETICKET_FIXTURE.totalPaid, 295000);
      assert.equal(SAMPLE_ETICKET_FIXTURE.movieTitle, 'Chuyến tàu cuối hè');
      assert.deepEqual(SAMPLE_ETICKET_FIXTURE.seats, ['F5', 'F6']);
    });

    test('SAMPLE_PAYMENT_FAILURE provides failure reason and error code', () => {
      assert.equal(SAMPLE_PAYMENT_FAILURE.errorCode, 'VNPAY-ERR-68');
      assert.ok(SAMPLE_PAYMENT_FAILURE.canRetry);
      assert.match(SAMPLE_PAYMENT_FAILURE.detail, /Tài khoản CHƯA bị trừ tiền/);
    });
  });
});
