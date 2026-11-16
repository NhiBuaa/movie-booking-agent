'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { XCircle, Lock, ArrowLeft } from 'lucide-react';
import checkoutStyles from '../styles/checkout.module.css';
import failStyles from '../styles/failed.module.css';
import type { OrderSummary, PaymentMethod, PaymentFailureReason } from '../model/types.ts';
import { FIGMA_ORDER_FIXTURE, SAMPLE_PAYMENT_FAILURE } from '../model/payment-fixtures.ts';
import {
  formatCurrency,
  calculateSeatTotal,
  calculateComboTotal,
  calculatePaymentTotal,
} from '../model/payment-logic.ts';
import { HoldCountdownTimer } from './HoldCountdownTimer.tsx';
import { PaymentMethodSelector } from './PaymentMethodSelector.tsx';
import { CheckoutStepper } from './CheckoutStepper.tsx';

interface PaymentFailedViewProps {
  order?: OrderSummary;
  failureReason?: PaymentFailureReason;
}

export const PaymentFailedView: React.FC<PaymentFailedViewProps> = ({
  order = FIGMA_ORDER_FIXTURE,
  failureReason = SAMPLE_PAYMENT_FAILURE,
}) => {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(order.paymentMethod);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  // Calculations
  const seatTotal = calculateSeatTotal(order.seats);
  const comboTotal = calculateComboTotal(order.combos);
  const voucherDiscount = order.voucher?.isApplied ? order.voucher.discountAmount : 0;
  const grandTotal = calculatePaymentTotal(
    order.seats,
    order.combos,
    voucherDiscount,
    order.serviceFee
  );

  const handleRetryPayment = () => {
    if (!agreedToTerms) return;
    setIsRetrying(true);
    router.push(
      `/checkout/${order.bookingId}/processing?method=${selectedMethod}&total=${grandTotal}&retry=true`
    );
  };

  return (
    <div className={checkoutStyles.pageWrapper}>
      {/* 02 / Stepper Bar in failed state */}
      <CheckoutStepper state="failed" />

      <main className={checkoutStyles.container}>
        {/* 03 / Hold Timer Banner */}
        <HoldCountdownTimer
          expiresAt={order.holdExpiresAt}
          label="Thời gian giữ ghế còn lại:"
          reminder="Thanh toán chưa thành công. Hãy thử lại trước khi hết giờ giữ ghế."
        />

        {/* 04 / Three-Column Failed Workspace */}
        <div className={checkoutStyles.mainLayout}>
          {/* Col 04A: Chi phí & combo — đã bảo lưu */}
          <section className={checkoutStyles.card} aria-labelledby="failed-charges-heading">
            <h2 id="failed-charges-heading" className={checkoutStyles.cardHeading}>
              CHI PHÍ &amp; BẮP NƯỚC
            </h2>

            <div className={checkoutStyles.voucherSection}>
              <div className={checkoutStyles.fieldLabel}>Mã giảm giá · Đã bảo lưu</div>
              <div className={checkoutStyles.voucherInputGroup}>
                <input
                  type="text"
                  readOnly
                  value={order.voucher?.code || 'CINORA30'}
                  className={checkoutStyles.voucherInput}
                />
                <button
                  type="button"
                  disabled
                  className={`${checkoutStyles.voucherBtn} ${checkoutStyles.voucherBtnApplied}`}
                >
                  ĐÃ ÁP DỤNG
                </button>
              </div>

              {voucherDiscount > 0 && (
                <div className={checkoutStyles.voucherSuccessFeedback}>
                  <span>Đã giảm {formatCurrency(voucherDiscount)} · Được bảo lưu</span>
                </div>
              )}
            </div>

            {/* Preserved Combo */}
            <div className={checkoutStyles.comboSection}>
              <div className={checkoutStyles.fieldLabel}>COMBO BẮP NƯỚC ĐÃ CHỌN</div>
              {order.combos.map((combo) => (
                <div key={combo.id} className={checkoutStyles.comboItemRow}>
                  <div className={checkoutStyles.comboInfo}>
                    <span className={checkoutStyles.comboTitle}>{combo.name}</span>
                    <span className={combo.description}>{combo.description}</span>
                    <span className={checkoutStyles.comboPrice}>
                      {formatCurrency(combo.price)} / combo
                    </span>
                  </div>
                  <div className={checkoutStyles.quantityControl}>
                    <span className={checkoutStyles.qtyValue}>{combo.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Breakdown List */}
            <div className={checkoutStyles.breakdownList}>
              {order.seats.map((seat) => (
                <div key={seat.id} className={checkoutStyles.breakdownItem}>
                  <span className={checkoutStyles.breakdownLabel}>Ghế {seat.label}</span>
                  <span className={checkoutStyles.breakdownValue}>{formatCurrency(seat.price)}</span>
                </div>
              ))}

              {comboTotal > 0 && (
                <div className={checkoutStyles.breakdownItem}>
                  <span className={checkoutStyles.breakdownLabel}>Combo bắp nước</span>
                  <span className={checkoutStyles.breakdownValue}>{formatCurrency(comboTotal)}</span>
                </div>
              )}

              {voucherDiscount > 0 && (
                <div className={checkoutStyles.breakdownItem}>
                  <span className={checkoutStyles.breakdownLabel}>Giảm giá</span>
                  <span className={`${checkoutStyles.breakdownValue} ${checkoutStyles.discountValue}`}>
                    −{formatCurrency(voucherDiscount)}
                  </span>
                </div>
              )}

              <div className={checkoutStyles.breakdownItem}>
                <span className={checkoutStyles.breakdownLabel}>Phí dịch vụ</span>
                <span className={checkoutStyles.breakdownValue}>Miễn phí</span>
              </div>
            </div>

            <div className={checkoutStyles.totalRow}>
              <span className={checkoutStyles.totalLabel}>TỔNG TIỀN THANH TOÁN</span>
              <span className={checkoutStyles.totalAmount}>{formatCurrency(grandTotal)}</span>
            </div>
          </section>

          {/* Col 04B: Failure Notice & Method Selector */}
          <section className={checkoutStyles.card} aria-labelledby="failed-method-heading">
            <h2 id="failed-method-heading" className={checkoutStyles.cardHeading}>
              PHƯƠNG THỨC THANH TOÁN
            </h2>

            {/* Allow user to switch or retry */}
            <PaymentMethodSelector
              selectedMethod={selectedMethod}
              onSelectMethod={setSelectedMethod}
            />

            <p className={checkoutStyles.paymentNotice}>
              Giao dịch {selectedMethod.toUpperCase()} chưa hoàn tất xác thực OTP. Bạn có thể thử lại an toàn
              hoặc chuyển sang phương thức thanh toán khác.
            </p>

            {/* Failure Card */}
            <div className={failStyles.failureCard}>
              <div className={failStyles.failureIconWrapper}>
                <XCircle size={32} color="var(--color-rosso-corsa)" strokeWidth={2.5} aria-hidden="true" />
              </div>

              <h3 className={failStyles.failureTitle}>
                Thanh toán chưa thành công ({selectedMethod.toUpperCase()})
              </h3>

              <p className={failStyles.failureReason}>
                Cổng thanh toán trả về: {failureReason.message}
              </p>

              <div className={failStyles.notDebitedNotice}>
                Tài khoản CHƯA bị trừ tiền (theo kết quả cổng {selectedMethod.toUpperCase()}).
              </div>

              <div className={failStyles.errorCodesRow}>
                Mã đơn: #{order.bookingId} &nbsp;·&nbsp; Mã lỗi: #{failureReason.errorCode}
              </div>

              <div className={failStyles.heldAmountBadge}>
                SỐ TIỀN GIỮ ĐƠN: {formatCurrency(grandTotal)}
              </div>
            </div>

            {/* Terms Agreement */}
            <label className={checkoutStyles.termsRow}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className={checkoutStyles.checkboxInput}
              />
              <span>Tôi đồng ý với Điều khoản sử dụng và Quy chế hoàn/hủy vé của rạp.</span>
            </label>

            <div className={checkoutStyles.termsButtons}>
              <button
                type="button"
                className={checkoutStyles.termsAuxBtn}
                onClick={() => alert('Xem điều khoản Cinora.')}
              >
                Xem điều khoản
              </button>
              <button
                type="button"
                className={checkoutStyles.termsAuxBtn}
                onClick={() => alert('Chính sách hoàn hủy vé.')}
              >
                Chính sách hoàn/hủy
              </button>
            </div>

            {/* Retry Button */}
            <button
              type="button"
              className={failStyles.retryPrimaryBtn}
              onClick={handleRetryPayment}
              disabled={!agreedToTerms || isRetrying}
            >
              THỬ LẠI THANH TOÁN ({formatCurrency(grandTotal)})
            </button>

            {/* Safety advisory note */}
            <aside className={failStyles.safetyAdvisoryBox} aria-label="Khuyến cáo an toàn thanh toán">
              <div className={failStyles.safetyAdvisoryTitle}>THỬ LẠI AN TOÀN:</div>
              Kiểm tra trạng thái tài khoản trước khi tạo yêu cầu mới. Nếu ngân hàng đã trừ tiền:
              KHÔNG thử lại; chụp thông báo giao dịch và sử dụng tính năng tra soát tự động.
              <div style={{ marginTop: '10px' }}>
                <Link
                  href={`/checkout/${order.bookingId}/reconciliation`}
                  style={{ color: '#d4af37', textDecoration: 'underline', fontSize: '12px', fontWeight: 600 }}
                >
                  Mở trang Tra soát đối soát giao dịch Cinema Core
                </Link>
              </div>
            </aside>
          </section>

          {/* Col 04C: Held Ticket Preview */}
          <aside className={checkoutStyles.ticketCard} aria-labelledby="failed-ticket-heading">
            <div className={checkoutStyles.ticketTopBar}>
              <span id="failed-ticket-heading">{order.seats.length} VÉ XEM PHIM</span>
            </div>

            <img
              src={order.posterUrl}
              alt={order.movieTitle}
              className={checkoutStyles.ticketPoster}
            />

            <h3 className={checkoutStyles.ticketMovieTitle}>{order.movieTitle}</h3>

            <div className={checkoutStyles.perforationContainer} aria-hidden="true">
              <div className={checkoutStyles.cutoutLeft} />
              <div className={checkoutStyles.perforationDashes} />
              <div className={checkoutStyles.cutoutRight} />
            </div>

            <div className={checkoutStyles.ticketDetailGrid}>
              <div>
                <div className={checkoutStyles.ticketDetailLabel}>NGÀY CHIẾU</div>
                <div className={checkoutStyles.ticketDetailValue}>{order.showDate}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className={checkoutStyles.ticketDetailLabel}>GIỜ CHIẾU</div>
                <div className={checkoutStyles.ticketDetailValue}>{order.showTime}</div>
              </div>
            </div>

            <div className={checkoutStyles.ticketCinemaName}>{order.cinemaName}</div>
            <div className={checkoutStyles.ticketFormat}>{order.format}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-fumo)' }}>{order.hallName}</div>

            <div className={checkoutStyles.ticketSeats}>
              GHẾ {order.seats.map((s) => s.label).join(', ')}
            </div>

            <div
              className={checkoutStyles.ticketHoldStatus}
              style={{ borderLeft: '3px solid var(--color-rosso-corsa)' }}
            >
              <Lock size={14} color="var(--color-rosso-corsa)" aria-hidden="true" />
              <div>
                <div>Đang giữ chỗ · Chờ thanh toán lại</div>
                <div style={{ fontSize: '10px', color: 'var(--color-fumo)' }}>
                  Vé QR chưa được phát hành
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom Bar */}
        <div className={checkoutStyles.bottomNavRow}>
          <Link href="/booking/chuyen-tau-cuoi-he/seats" className={checkoutStyles.backBtn}>
            <ArrowLeft size={14} aria-hidden="true" />
            <span>QUAY LẠI CHỌN GHẾ</span>
          </Link>
          <div className={checkoutStyles.disclaimerText}>
            Nếu đã bị trừ tiền, không thử thanh toán lại; hãy liên hệ hỗ trợ để đối soát giao dịch.
          </div>
        </div>
      </main>
    </div>
  );
};
