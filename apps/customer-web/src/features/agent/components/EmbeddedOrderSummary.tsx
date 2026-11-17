'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Maximize2, ArrowRight, Utensils, Ticket, Edit3, ShieldAlert, Clock } from 'lucide-react';
import { formatCurrency, formatTimer } from '../model/agent-logic.ts';
import styles from '../styles/embedded-cards.module.css';

interface EmbeddedOrderSummaryProps {
  movieTitle?: string;
  cinemaName?: string;
  roomName?: string;
  showtimeTime?: string;
  selectedSeats?: string[];
  totalPrice?: number;
  initialCountdownSeconds?: number;
  onProceedToPayment?: () => void;
  disabled?: boolean;
}

export const EmbeddedOrderSummary: React.FC<EmbeddedOrderSummaryProps> = ({
  movieTitle = 'Chuyến Tàu Cuối Hè',
  cinemaName = 'Cinora Đồng Khởi',
  roomName = 'Phòng IMAX Laser',
  showtimeTime = '18:30',
  selectedSeats = ['H7', 'H8'],
  totalPrice = 320000,
  initialCountdownSeconds = 522, // 08:42 matching Figma Node 769:2202
  onProceedToPayment,
  disabled = false,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialCountdownSeconds);

  useEffect(() => {
    if (disabled || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [disabled, secondsLeft]);

  return (
    <div className={`${styles.cardBase} ${styles.summaryCard}`} data-testid="embedded-order-summary-card">
      {/* Header - Figma Node 779:2199 */}
      <div className={styles.cardHeader}>
        <div>
          <h4 className={styles.cardTitle}>Tóm tắt đơn hàng &amp; Giữ chỗ (Atomic Hold)</h4>
          <span className={styles.cardSubtitle}>
            {cinemaName} · {roomName} · Suất {showtimeTime} (07/11/2026)
          </span>
        </div>

        <Link
          href="/checkout/MB-2026-000128"
          className={styles.cardHeaderSquareBtn}
          title="Mở thanh toán toàn màn hình"
          aria-label="Toàn màn hình"
        >
          <Maximize2 size={15} aria-hidden="true" />
        </Link>
      </div>

      {/* Countdown Timer Banner */}
      <div className={styles.holdTimerBanner}>
        <span className={styles.holdTimerLabel}>
          <Clock size={13} aria-hidden="true" />
          <span>THỜI GIAN GIỮ CHỖ CÒN LẠI:</span>
        </span>
        <span className={styles.holdTimerDigits}>{formatTimer(secondsLeft)}</span>
      </div>

      {/* Two-Column Grid - Figma Node 779:2202 & 779:2203 */}
      <div className={styles.summaryTwoColGrid}>
        {/* Left Column: Cost Breakdown (460px) */}
        <div className={styles.summaryColLeft}>
          <div>
            <h5 className={styles.summaryColHeaderTitle}>{movieTitle} · IMAX Laser 2D</h5>
            <span className={styles.summaryColHeaderMeta}>
              {cinemaName} · {showtimeTime}, Thứ Bảy 07/11/2026
            </span>
          </div>

          <div className={styles.summaryHairline} />

          <div className={styles.summaryItemRow}>
            <span className={styles.summaryItemLabel}>
              {selectedSeats.length} × Ghế VIP ({selectedSeats.join(', ')})
            </span>
            <span className={styles.summaryItemValue}>{formatCurrency(totalPrice)}</span>
          </div>

          <div className={styles.summaryItemRow}>
            <span className={styles.summaryItemLabel}>Combo bắp nước</span>
            <span className={styles.summaryItemValue}>Chưa chọn (0 đ)</span>
          </div>

          <div className={styles.summaryItemRow}>
            <span className={styles.summaryItemLabel}>Mã giảm giá voucher</span>
            <span className={styles.summaryItemValue}>0 đ</span>
          </div>

          <div className={styles.summaryItemRow}>
            <span className={styles.summaryItemLabel}>Phí tiện ích &amp; dịch vụ</span>
            <span className={styles.summaryItemValue} style={{ color: '#22c55e' }}>Miễn phí</span>
          </div>

          <div className={styles.summaryItemRow}>
            <span className={styles.summaryItemLabel}>Thuế VAT</span>
            <span className={styles.summaryItemValue}>Đã bao gồm</span>
          </div>

          <div className={styles.summaryTotalHeadline}>
            <span className={styles.summaryTotalLabel}>TỔNG CỘNG TẠM TÍNH:</span>
            <span className={styles.summaryTotalAmount}>{formatCurrency(totalPrice)}</span>
          </div>
        </div>

        {/* Right Column: Service Options (308px) */}
        <div className={styles.summaryColRight}>
          <div>
            <h5 className={styles.summaryColHeaderTitle}>TÙY CHỌN DỊCH VỤ</h5>
            <span className={styles.summaryColHeaderMeta}>Thêm tiện ích trước khi thanh toán</span>
          </div>

          <Link href="/booking/chuyen-tau-cuoi-he/combos" className={styles.serviceOptionBtn}>
            <Utensils size={14} aria-hidden="true" />
            <span>Thêm bắp nước</span>
          </Link>

          <Link href="/promotions" className={styles.serviceOptionBtn}>
            <Ticket size={14} aria-hidden="true" />
            <span>Ví voucher</span>
          </Link>

          <Link href="/booking/chuyen-tau-cuoi-he/seats" className={styles.serviceOptionBtn}>
            <Edit3 size={14} aria-hidden="true" />
            <span>Sửa ghế</span>
          </Link>
        </div>
      </div>

      {/* Atomic Hold Policy Box - Figma Node 779:2204 */}
      <div className={styles.safeguardNoticeBox}>
        <div className={styles.safeguardNoticeTitle}>
          <ShieldAlert size={14} color="var(--color-rosso-corsa, #da291c)" aria-hidden="true" />
          <span>Atomic Hold (Cinema Core API) · Thời hạn giữ chỗ: 10 phút</span>
        </div>
        <div className={styles.safeguardNoticeDesc}>
          Ghế {selectedSeats.join(', ')} được khóa độc quyền trên toàn hệ thống phòng vé. Quá hạn chưa thanh toán, hệ thống sẽ tự động giải phóng ghế cho khán giả khác.
        </div>
      </div>

      {/* Footer Actions - Figma Node 779:2205 (500px + 268px) */}
      <div className={styles.summaryFooterActions}>
        <button
          type="button"
          className={styles.summaryPrimaryBtn}
          onClick={onProceedToPayment}
          disabled={disabled || secondsLeft <= 0}
        >
          <span>TIẾN HÀNH THANH TOÁN ({formatCurrency(totalPrice)})</span>
        </button>

        <Link href="/checkout/MB-2026-000128" className={styles.summarySecondaryBtn}>
          <Maximize2 size={14} aria-hidden="true" />
          <span>Toàn màn hình</span>
        </Link>
      </div>

      <div className={styles.cardFootnote}>
        * Nhấn để giữ chỗ và tạo đơn hàng PENDING_PAYMENT trên hệ thống Cinema Core API.
      </div>
    </div>
  );
};
