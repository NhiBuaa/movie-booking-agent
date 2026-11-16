'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Check, Lock } from 'lucide-react';
import styles from '../styles/checkout.module.css';
import type { OrderSummary, PaymentMethod } from '../model/types.ts';
import { FIGMA_ORDER_FIXTURE } from '../model/payment-fixtures.ts';
import {
  formatCurrency,
  calculateSeatTotal,
  calculateComboTotal,
  calculatePaymentTotal,
  applyVoucher,
  updateComboQuantity,
} from '../model/payment-logic.ts';
import { HoldCountdownTimer } from './HoldCountdownTimer.tsx';
import { PaymentMethodSelector } from './PaymentMethodSelector.tsx';
import { CheckoutStepper } from './CheckoutStepper.tsx';

interface CheckoutViewProps {
  initialOrder?: OrderSummary;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  initialOrder = FIGMA_ORDER_FIXTURE,
}) => {
  const router = useRouter();
  const [order, setOrder] = useState<OrderSummary>(initialOrder);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(order.paymentMethod);
  const [voucherCodeInput, setVoucherCodeInput] = useState<string>(order.voucher?.code || '');
  const [voucherFeedback, setVoucherFeedback] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Dynamic calculations
  const seatTotal = calculateSeatTotal(order.seats);
  const comboTotal = calculateComboTotal(order.combos);
  const subtotal = seatTotal + comboTotal;
  const voucherDiscount = order.voucher?.isApplied ? order.voucher.discountAmount : 0;
  const totalAmount = calculatePaymentTotal(
    order.seats,
    order.combos,
    voucherDiscount,
    order.serviceFee
  );

  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const result = applyVoucher(voucherCodeInput, subtotal);
    if (result.success && result.voucher) {
      setOrder((prev) => ({
        ...prev,
        voucher: result.voucher,
      }));
      setVoucherFeedback(result.message);
    } else {
      setVoucherFeedback(result.message);
    }
  };

  const handleComboChange = (comboId: string, delta: number) => {
    setOrder((prev) => {
      const updatedCombos = updateComboQuantity(prev.combos, comboId, delta);
      return {
        ...prev,
        combos: updatedCombos,
      };
    });
  };

  const handleProceedToPayment = () => {
    if (!agreedToTerms) return;
    setIsSubmitting(true);
    router.push(`/checkout/${order.bookingId}/processing?method=${selectedMethod}&total=${totalAmount}`);
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 02 / Stepper Bar */}
      <CheckoutStepper state="checkout" />

      <main className={styles.container}>
        {/* 03 / Hold Timer Banner */}
        <HoldCountdownTimer
          expiresAt={order.holdExpiresAt}
          label="Thời gian giữ ghế còn lại:"
          reminder="Giữ thời hạn hiện tại khi quay lại hoặc đổi phương thức"
        />

        {/* 04 / Three-Column Workspace */}
        <div className={styles.mainLayout}>
          {/* Column 04A: Chi phí & bắp nước */}
          <section className={styles.card} aria-labelledby="cost-heading">
            <h2 id="cost-heading" className={styles.cardHeading}>
              Chi phí &amp; bắp nước
            </h2>

            {/* Voucher apply box */}
            <div className={styles.voucherSection}>
              <label htmlFor="voucher-input" className={styles.fieldLabel}>
                Mã giảm giá
              </label>
              <form onSubmit={handleApplyVoucher} className={styles.voucherInputGroup}>
                <input
                  id="voucher-input"
                  type="text"
                  value={voucherCodeInput}
                  onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                  placeholder="Nhập mã voucher"
                  className={styles.voucherInput}
                />
                <button
                  type="submit"
                  className={`${styles.voucherBtn} ${
                    order.voucher?.isApplied && order.voucher.code === voucherCodeInput
                      ? styles.voucherBtnApplied
                      : ''
                  }`}
                  disabled={order.voucher?.isApplied && order.voucher.code === voucherCodeInput}
                >
                  {order.voucher?.isApplied && order.voucher.code === voucherCodeInput
                    ? 'ĐÃ ÁP DỤNG'
                    : 'ÁP DỤNG'}
                </button>
              </form>

              {order.voucher?.isApplied && (
                <div className={styles.voucherSuccessFeedback}>
                  <Check size={14} className={styles.voucherIcon} strokeWidth={2.5} aria-hidden="true" />
                  <span>Đã giảm {formatCurrency(order.voucher.discountAmount)}</span>
                </div>
              )}
              {voucherFeedback && !order.voucher?.isApplied && (
                <div style={{ color: '#da291c', fontSize: '11px', marginTop: '6px' }}>
                  {voucherFeedback}
                </div>
              )}
            </div>

            {/* Combo Section */}
            <div className={styles.comboSection}>
              <div className={styles.fieldLabel}>Thêm combo bắp nước</div>
              {order.combos.map((combo) => (
                <div key={combo.id} className={styles.comboItemRow}>
                  <div className={styles.comboInfo}>
                    <span className={styles.comboTitle}>{combo.name}</span>
                    <span className={styles.comboDesc}>{combo.description}</span>
                    <span className={styles.comboPrice}>{formatCurrency(combo.price)} / combo</span>
                  </div>
                  <div className={styles.quantityControl}>
                    <button
                      type="button"
                      aria-label="Giảm bắp nước"
                      className={styles.qtyBtn}
                      onClick={() => handleComboChange(combo.id, -1)}
                      disabled={combo.quantity <= 0}
                    >
                      <Minus size={14} aria-hidden="true" />
                    </button>
                    <span className={styles.qtyValue}>{combo.quantity}</span>
                    <button
                      type="button"
                      aria-label="Tăng bắp nước"
                      className={styles.qtyBtn}
                      onClick={() => handleComboChange(combo.id, 1)}
                      disabled={combo.quantity >= 10}
                    >
                      <Plus size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Breakdown List */}
            <div className={styles.breakdownList}>
              {order.seats.map((seat) => (
                <div key={seat.id} className={styles.breakdownItem}>
                  <span className={styles.breakdownLabel}>Ghế {seat.label}</span>
                  <span className={styles.breakdownValue}>{formatCurrency(seat.price)}</span>
                </div>
              ))}

              {comboTotal > 0 && (
                <div className={styles.breakdownItem}>
                  <span className={styles.breakdownLabel}>Combo bắp nước</span>
                  <span className={styles.breakdownValue}>{formatCurrency(comboTotal)}</span>
                </div>
              )}

              {voucherDiscount > 0 && (
                <div className={styles.breakdownItem}>
                  <span className={styles.breakdownLabel}>Giảm giá</span>
                  <span className={`${styles.breakdownValue} ${styles.discountValue}`}>
                    −{formatCurrency(voucherDiscount)}
                  </span>
                </div>
              )}

              <div className={styles.breakdownItem}>
                <span className={styles.breakdownLabel}>Phí dịch vụ</span>
                <span className={styles.breakdownValue}>
                  {order.serviceFee > 0 ? formatCurrency(order.serviceFee) : 'Miễn phí'}
                </span>
              </div>
            </div>

            {/* Grand Total */}
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>TỔNG TIỀN THANH TOÁN</span>
              <span className={styles.totalAmount}>{formatCurrency(totalAmount)}</span>
            </div>
          </section>

          {/* Column 04B: Phương thức thanh toán */}
          <section className={styles.card} aria-labelledby="payment-heading">
            <h2 id="payment-heading" className={styles.cardHeading}>
              Phương thức thanh toán
            </h2>

            <PaymentMethodSelector
              selectedMethod={selectedMethod}
              onSelectMethod={setSelectedMethod}
            />

            <p className={styles.paymentNotice}>
              Các phương thức dưới đây là mẫu giao diện, chưa xác lập tích hợp với nhà cung cấp.
            </p>

            {/* Instructions box */}
            <div className={styles.instructionCard}>
              <svg
                className={styles.qrVectorPlaceholder}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="7" y="7" width="1" height="1" />
                <rect x="18" y="7" width="1" height="1" />
                <rect x="7" y="18" width="1" height="1" />
              </svg>

              <div className={styles.instructionTitle}>
                {selectedMethod === 'vnpay' && 'Thanh toán bằng VNPay-QR'}
                {selectedMethod === 'momo' && 'Thanh toán qua Ví MoMo'}
                {selectedMethod === 'zalopay' && 'Thanh toán qua Ví ZaloPay'}
                {selectedMethod === 'atm' && 'Thanh toán qua Thẻ ATM nội địa'}
                {selectedMethod === 'card' && 'Thanh toán qua Thẻ quốc tế Visa / MasterCard'}
              </div>

              <p className={styles.instructionDesc}>
                Mã thanh toán được tạo sau khi bạn xác nhận. Mở ứng dụng tương ứng để quét khi mã
                xuất hiện. Hiện chưa có yêu cầu thanh toán.
              </p>

              <div className={styles.instructionAmount}>
                Số tiền: {formatCurrency(totalAmount)}
              </div>
            </div>

            {/* Terms Checkbox */}
            <label className={styles.termsRow}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className={styles.checkboxInput}
              />
              <span>Tôi đồng ý với Điều khoản sử dụng và Quy chế hoàn/hủy vé của rạp.</span>
            </label>

            {/* Aux Buttons */}
            <div className={styles.termsButtons}>
              <button
                type="button"
                className={styles.termsAuxBtn}
                onClick={() => alert('Quy chế sử dụng dịch vụ Cinora Agent 2026.')}
              >
                Xem điều khoản
              </button>
              <button
                type="button"
                className={styles.termsAuxBtn}
                onClick={() => alert('Chính sách hoàn hủy vé: Hoàn 100% trước giờ chiếu 60 phút.')}
              >
                Chính sách hoàn/hủy
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              className={styles.primaryPayBtn}
              onClick={handleProceedToPayment}
              disabled={!agreedToTerms || isSubmitting}
            >
              THANH TOÁN NGAY ({formatCurrency(totalAmount)})
            </button>

            <p className={styles.securityNote}>
              Chỉ xác nhận thanh toán một lần. Kết quả sẽ được kiểm tra với hệ thống rạp.
            </p>
          </section>

          {/* Column 04C: Hai vé / Suất chiếu Preview */}
          <aside className={styles.ticketCard} aria-labelledby="ticket-preview-heading">
            <div className={styles.ticketTopBar}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
              </svg>
              <span id="ticket-preview-heading">
                {order.seats.length} vé xem phim
              </span>
            </div>

            <img
              src={order.posterUrl}
              alt={`Poster phim ${order.movieTitle}`}
              className={styles.ticketPoster}
            />

            <h3 className={styles.ticketMovieTitle}>{order.movieTitle}</h3>

            {/* Perforation line */}
            <div className={styles.perforationContainer} aria-hidden="true">
              <div className={styles.cutoutLeft} />
              <div className={styles.perforationDashes} />
              <div className={styles.cutoutRight} />
            </div>

            <div className={styles.ticketDetailGrid}>
              <div>
                <div className={styles.ticketDetailLabel}>Ngày chiếu</div>
                <div className={styles.ticketDetailValue}>{order.showDate}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className={styles.ticketDetailLabel}>Giờ chiếu</div>
                <div className={styles.ticketDetailValue}>{order.showTime}</div>
              </div>
            </div>

            <div className={styles.ticketCinemaName}>{order.cinemaName}</div>
            <div className={styles.ticketFormat}>{order.format}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-fumo)' }}>{order.hallName}</div>

            <div className={styles.ticketSeats}>
              Ghế {order.seats.map((s) => s.label).join(', ')}
            </div>

            <div className={styles.ticketHoldStatus}>
              <Lock size={14} aria-hidden="true" />
              <span>Đang giữ chỗ · Chờ thanh toán</span>
            </div>
          </aside>
        </div>

        {/* Bottom Nav Row */}
        <div className={styles.bottomNavRow}>
          <Link
            href={`/booking/${order.movieId || 'chuyen-tau-cuoi-he'}/seats`}
            className={styles.backBtn}
          >
            Quay lại chọn ghế
          </Link>
          <div className={styles.disclaimerText}>
            Thông tin, giá, voucher, combo và thời gian là dữ liệu minh họa; chưa có giao dịch thật.
          </div>
        </div>
      </main>
    </div>
  );
};
