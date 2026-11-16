'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, XCircle, ArrowRight, Settings } from 'lucide-react';
import checkoutStyles from '../styles/checkout.module.css';
import procStyles from '../styles/processing.module.css';
import type { OrderSummary, PaymentMethod } from '../model/types.ts';
import { FIGMA_ORDER_FIXTURE } from '../model/payment-fixtures.ts';
import {
  formatCurrency,
  calculateSeatTotal,
  calculateComboTotal,
  calculatePaymentTotal,
} from '../model/payment-logic.ts';
import { HoldCountdownTimer } from './HoldCountdownTimer.tsx';
import { PaymentMethodSelector } from './PaymentMethodSelector.tsx';
import { CheckoutStepper } from './CheckoutStepper.tsx';

interface PaymentProcessingViewProps {
  order?: OrderSummary;
  methodParam?: PaymentMethod;
  totalParam?: number;
}

export const PaymentProcessingView: React.FC<PaymentProcessingViewProps> = ({
  order = FIGMA_ORDER_FIXTURE,
  methodParam,
  totalParam,
}) => {
  const router = useRouter();
  const paymentMethod = methodParam || order.paymentMethod;
  const [autoRedirect, setAutoRedirect] = useState<boolean>(true);

  // Calculations
  const seatTotal = calculateSeatTotal(order.seats);
  const comboTotal = calculateComboTotal(order.combos);
  const voucherDiscount = order.voucher?.isApplied ? order.voucher.discountAmount : 0;
  const grandTotal =
    totalParam ||
    calculatePaymentTotal(order.seats, order.combos, voucherDiscount, order.serviceFee);

  // Auto redirect after 2.5 seconds to success state, unless user stops or clicks simulate failed
  useEffect(() => {
    if (!autoRedirect) return;

    const timer = setTimeout(() => {
      router.push(`/checkout/${order.bookingId}/success`);
    }, 2500);

    return () => clearTimeout(timer);
  }, [autoRedirect, router, order.bookingId]);

  const handleSimulateSuccess = () => {
    setAutoRedirect(false);
    router.push(`/checkout/${order.bookingId}/success`);
  };

  const handleSimulateFailed = () => {
    setAutoRedirect(false);
    router.push(`/checkout/${order.bookingId}/failed`);
  };

  return (
    <div className={checkoutStyles.pageWrapper}>
      {/* 02 / Four-Step Stepper in processing mode */}
      <CheckoutStepper state="processing" />

      <main className={checkoutStyles.container}>
        {/* 03 / Locked Hold Countdown Banner */}
        <HoldCountdownTimer
          expiresAt={order.holdExpiresAt}
          label="THỜI GIAN GIỮ GHẾ CÒN LẠI:"
          reminder={`Tự động bảo lưu ghế ${order.seats
            .map((s) => s.label)
            .join(', ')} trong lúc xử lý giao dịch`}
        />

        {/* 04 / Locked Transaction Three-Column Layout */}
        <div className={checkoutStyles.mainLayout}>
          {/* Col 04A: Charges & combo (locked / read-only) */}
          <section className={checkoutStyles.card} aria-labelledby="locked-cost-heading">
            <h2 id="locked-cost-heading" className={checkoutStyles.cardHeading}>
              CHI PHÍ &amp; BẮP NƯỚC
            </h2>

            <div className={checkoutStyles.voucherSection}>
              <div className={checkoutStyles.fieldLabel}>MÃ GIẢM GIÁ (VOUCHER) · ĐÃ KHÓA</div>
              <div className={checkoutStyles.voucherInputGroup}>
                <input
                  type="text"
                  readOnly
                  value={order.voucher?.code || 'CINORA30'}
                  className={checkoutStyles.voucherInput}
                />
                <button type="button" disabled className={`${checkoutStyles.voucherBtn} ${checkoutStyles.voucherBtnApplied}`}>
                  ĐÃ ÁP DỤNG
                </button>
              </div>

              {voucherDiscount > 0 && (
                <div className={checkoutStyles.voucherSuccessFeedback}>
                  <span>Đã giảm {formatCurrency(voucherDiscount)}</span>
                </div>
              )}
            </div>

            {/* Combo read-only */}
            <div className={checkoutStyles.comboSection}>
              <div className={checkoutStyles.fieldLabel}>COMBO BẮP NƯỚC (ĐANG KHÓA)</div>
              {order.combos.map((combo) => (
                <div key={combo.id} className={checkoutStyles.comboItemRow}>
                  <div className={checkoutStyles.comboInfo}>
                    <span className={checkoutStyles.comboTitle}>{combo.name}</span>
                    <span className={checkoutStyles.comboDesc}>{combo.description}</span>
                    <span className={checkoutStyles.comboPrice}>
                      {formatCurrency(combo.price)} / combo
                    </span>
                  </div>
                  <div className={checkoutStyles.quantityControl}>
                    <button type="button" disabled className={checkoutStyles.qtyBtn}>
                      −
                    </button>
                    <span className={checkoutStyles.qtyValue}>{combo.quantity}</span>
                    <button type="button" disabled className={checkoutStyles.qtyBtn}>
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Breakdown List */}
            <div className={checkoutStyles.breakdownList}>
              {order.seats.map((seat) => (
                <div key={seat.id} className={checkoutStyles.breakdownItem}>
                  <span className={checkoutStyles.breakdownLabel}>GHẾ {seat.label}</span>
                  <span className={checkoutStyles.breakdownValue}>{formatCurrency(seat.price)}</span>
                </div>
              ))}

              {comboTotal > 0 && (
                <div className={checkoutStyles.breakdownItem}>
                  <span className={checkoutStyles.breakdownLabel}>COMBO BẮP NƯỚC</span>
                  <span className={checkoutStyles.breakdownValue}>{formatCurrency(comboTotal)}</span>
                </div>
              )}

              {voucherDiscount > 0 && (
                <div className={checkoutStyles.breakdownItem}>
                  <span className={checkoutStyles.breakdownLabel}>GIẢM GIÁ</span>
                  <span className={`${checkoutStyles.breakdownValue} ${checkoutStyles.discountValue}`}>
                    −{formatCurrency(voucherDiscount)}
                  </span>
                </div>
              )}

              <div className={checkoutStyles.breakdownItem}>
                <span className={checkoutStyles.breakdownLabel}>PHÍ DỊCH VỤ</span>
                <span className={checkoutStyles.breakdownValue}>Miễn phí</span>
              </div>
            </div>

            <div className={checkoutStyles.totalRow}>
              <span className={checkoutStyles.totalLabel}>TỔNG TIỀN THANH TOÁN</span>
              <span className={checkoutStyles.totalAmount}>{formatCurrency(grandTotal)}</span>
            </div>
          </section>

          {/* Col 04B: Payment Processing status card */}
          <section className={checkoutStyles.card} aria-labelledby="proc-heading">
            <h2 id="proc-heading" className={checkoutStyles.cardHeading}>
              ĐANG XỬ LÝ THANH TOÁN
            </h2>

            {/* Methods disabled */}
            <PaymentMethodSelector
              selectedMethod={paymentMethod}
              onSelectMethod={() => {}}
              disabled
            />

            <p className={checkoutStyles.paymentNotice}>
              Hệ thống đang kết nối an toàn với {paymentMethod.toUpperCase()} để tiến hành trừ tiền đơn vé.
            </p>

            {/* Processing card with smooth spinner */}
            <div className={procStyles.processingCard}>
              <div className={procStyles.spinnerWrapper}>
                <div className={procStyles.spinner} />
              </div>

              <h3 className={procStyles.processingHeading}>
                Đang xác thực giao dịch với Cổng {paymentMethod.toUpperCase()}...
              </h3>

              <div className={procStyles.metaRow}>
                Mã đặt vé: {order.bookingId} &nbsp;·&nbsp; Mã giao dịch: {order.transactionId}
              </div>

              <div className={procStyles.metaRow}>
                Phương thức: {paymentMethod.toUpperCase()} &nbsp;·&nbsp; Số tiền: {formatCurrency(grandTotal)}
              </div>

              <div className={procStyles.metaRow} style={{ color: 'var(--color-bianco-ferrari)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span>Đang kết nối ngân hàng</span>
                <ArrowRight size={14} aria-hidden="true" />
                <span>Chờ xác nhận thành công...</span>
              </div>

              <div className={procStyles.statusBadge}>
                TRẠNG THÁI: ĐANG CHỜ XÁC NHẬN GIAO DỊCH
              </div>
            </div>

            {/* Safety Warning */}
            <aside className={procStyles.securityAlertBanner} aria-label="Cảnh báo an toàn">
              <svg
                className={procStyles.alertIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <div className={procStyles.alertText}>
                <strong>CẢNH BÁO AN TOÀN:</strong> KHÔNG tắt trình duyệt, KHÔNG nhấn Back hoặc F5
                trong lúc hệ thống đối soát, tránh bị trừ tiền trùng lặp.
              </div>
            </aside>

            {/* Support Buttons */}
            <div className={procStyles.supportRow}>
              <button
                type="button"
                className={procStyles.supportBtn}
                onClick={() => alert('Hotline hỗ trợ: 1900-CINORA')}
              >
                HOTLINE CSKH: 1900-CINORA
              </button>
              <button
                type="button"
                className={procStyles.supportBtn}
                onClick={() => alert('Cinora cam kết hoàn tiền 100% nếu giao dịch bị lỗi hệ thống.')}
              >
                CAM KẾT HOÀN TIỀN 100%
              </button>
            </div>

            {/* Disabled CTA */}
            <div className={procStyles.disabledCta}>
              ĐANG XỬ LÝ THANH TOÁN, VUI LÒNG ĐỢI...
            </div>

            <p className={procStyles.subNotice}>
              Hệ thống sẽ chuyển sang vé điện tử và mã QR khi giao dịch được xác nhận thanh toán thành công.
            </p>

            {/* Testing & Simulation Bar */}
            <div className={procStyles.simulationBox}>
              <div className={procStyles.simulationLabel}>
                <Settings size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} aria-hidden="true" />
                <span>Công cụ thử nghiệm phân hệ (Tự điều hướng sau 2.5s)</span>
              </div>
              <div className={procStyles.simulationActions}>
                <button
                  type="button"
                  className={procStyles.simBtnSuccess}
                  onClick={handleSimulateSuccess}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Check size={14} aria-hidden="true" />
                    Chuyển ngay sang Thành công
                  </span>
                </button>
                <button
                  type="button"
                  className={procStyles.simBtnFailed}
                  onClick={handleSimulateFailed}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <XCircle size={14} aria-hidden="true" />
                    Thử nghiệm Thất bại &amp; Thử lại
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* Col 04C: Ticket & verification spinner */}
          <aside className={checkoutStyles.ticketCard} aria-labelledby="locked-ticket-heading">
            <div className={checkoutStyles.ticketTopBar}>
              <span id="locked-ticket-heading">{order.seats.length} VÉ XEM PHIM</span>
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

            <div className={checkoutStyles.ticketHoldStatus}>
              <div className={procStyles.spinner} style={{ width: 14, height: 14, borderWidth: 2 }} />
              <span>ĐANG XÁC THỰC GIỮ CHỖ...</span>
            </div>
          </aside>
        </div>

        {/* Bottom Nav Row (Disabled Back Button) */}
        <div className={checkoutStyles.bottomNavRow}>
          <button
            type="button"
            disabled
            className={checkoutStyles.backBtn}
            style={{ opacity: 0.5, cursor: 'not-allowed' }}
          >
            QUAY LẠI CHỌN GHẾ
          </button>
          <div className={checkoutStyles.disclaimerText}>
            Giao dịch đang được xử lý. Nút quay lại tạm thời bị khóa để bảo vệ tài khoản của bạn.
          </div>
        </div>
      </main>
    </div>
  );
};
