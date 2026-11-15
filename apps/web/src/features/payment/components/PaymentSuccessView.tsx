'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, ShieldCheck } from 'lucide-react';
import checkoutStyles from '../styles/checkout.module.css';
import styles from '../styles/success.module.css';
import type { ETicketData } from '../model/types.ts';
import { FIGMA_ETICKET_FIXTURE } from '../model/payment-fixtures.ts';
import { formatCurrency } from '../model/payment-logic.ts';
import { CheckoutStepper } from './CheckoutStepper.tsx';
import { QRCodeDisplay } from './QRCodeDisplay.tsx';

interface PaymentSuccessViewProps {
  ticket?: ETicketData;
}

export const PaymentSuccessView: React.FC<PaymentSuccessViewProps> = ({
  ticket = FIGMA_ETICKET_FIXTURE,
}) => {
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const handleDownloadPDF = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className={checkoutStyles.pageWrapper}>
      {/* 02 / Stepper Bar in all-done state */}
      <CheckoutStepper state="success" />

      <main className={checkoutStyles.container}>
        <article className={styles.successContainer} aria-labelledby="success-heading">
          {/* Header Icon + Title */}
          <header className={styles.successHeader}>
            <div className={styles.successIconWrapper}>
              <Check size={36} color="#107c41" strokeWidth={3} aria-hidden="true" />
            </div>
            <h1 id="success-heading" className={styles.successTitle}>
              THANH TOÁN THÀNH CÔNG
            </h1>
            <p className={styles.successSubtitle}>
              Cinema Core đã xác thực giao dịch an toàn và ghi nhận đặt vé thành công.
            </p>
          </header>

          {/* Official Booking Confirmation Banner */}
          <div className={styles.confirmationStrip}>
            <div className={styles.bookingIdGroup}>
              <span className={styles.bookingIdLabel}>MÃ ĐẶT VÉ CHÍNH THỨC:</span>
              <span className={styles.bookingIdCode}>{ticket.ticketCode}</span>
            </div>
            <div className={styles.confirmedBadge}>
              <ShieldCheck size={16} aria-hidden="true" />
              <span>TRẠNG THÁI: CONFIRMED (Cinema Core Verified)</span>
            </div>
          </div>

          {/* Two Panels Grid */}
          <div className={styles.panelsGrid}>
            {/* Panel 1: Chi tiết thanh toán */}
            <section className={styles.panel} aria-labelledby="receipt-details-heading">
              <h2 id="receipt-details-heading" className={styles.panelHeading}>
                <svg
                  className={styles.panelHeadingIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                <span>CHI TIẾT THANH TOÁN</span>
              </h2>

              <div className={styles.metaList}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Mã giao dịch đối tác:</span>
                  <span className={styles.metaValue}>{ticket.partnerTxnId}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Thời gian thanh toán:</span>
                  <span className={styles.metaValue}>{ticket.paidAt}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Phương thức:</span>
                  <span className={styles.metaValue}>
                    {ticket.paymentMethod.toUpperCase()} (Đã khớp lệnh)
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>
                    2 Vé xem phim VIP ({ticket.seats.join(', ')}):
                  </span>
                  <span className={styles.metaValue}>320.000 đ</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Combo đôi (1 bắp + 2 nước):</span>
                  <span className={styles.metaValue}>105.000 đ</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Giảm giá voucher (CINORA40):</span>
                  <span className={`${styles.metaValue} ${styles.metaValueHighlight}`}>
                    −40.000 đ
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Phí dịch vụ &amp; Tiện ích:</span>
                  <span className={styles.metaValue}>Miễn phí</span>
                </div>
              </div>

              <div className={styles.totalRowSuccess}>
                <span className={styles.totalPaidLabel}>TỔNG TIỀN ĐÃ TRẢ:</span>
                <span className={styles.totalPaidAmount}>{formatCurrency(ticket.totalPaid)}</span>
              </div>

              <div className={styles.emailReceiptNotice}>
                Hóa đơn điện tử đã gửi về email: {ticket.userEmail}
              </div>
            </section>

            {/* Panel 2: Thông tin suất chiếu & Vé điện tử QR */}
            <section className={styles.panel} aria-labelledby="showtime-info-heading">
              <h2 id="showtime-info-heading" className={styles.panelHeading}>
                <svg
                  className={styles.panelHeadingIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <rect x="3" y="4" width="18" height="18" rx="0" ry="0" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>THÔNG TIN SUẤT CHIẾU</span>
              </h2>

              <h3 className={styles.movieNameSuccess}>{ticket.movieTitle}</h3>
              <div className={styles.movieSpecSuccess}>
                115 phút · Định dạng IMAX Laser · Phụ đề tiếng Việt
              </div>

              <div className={styles.metaList}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Rạp chiếu:</span>
                  <span className={styles.metaValue}>{ticket.cinemaName}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Phòng chiếu:</span>
                  <span className={styles.metaValue}>{ticket.hallName}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Ngày &amp; Giờ chiếu:</span>
                  <span className={styles.metaValue} style={{ fontWeight: 700 }}>
                    {ticket.showTime} · {ticket.showDate}
                  </span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Ghế đã xác nhận:</span>
                  <span className={styles.metaValue} style={{ fontWeight: 700 }}>
                    {ticket.seats.join(', ')} (VIP Trung tâm)
                  </span>
                </div>
                {ticket.comboCode && (
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Mã nhận bắp nước:</span>
                    <span className={styles.metaValue} style={{ fontWeight: 700 }}>
                      {ticket.comboCode} (Tại quầy)
                    </span>
                  </div>
                )}
              </div>

              {/* Check-in Notice (Figma Node 536:556) */}
              <div className={styles.noticeInfo}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="#8F8F8F" strokeWidth="1.2" />
                  <path d="M8 5V8.5M8 11H8.01" stroke="#8F8F8F" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>Vui lòng có mặt trước giờ chiếu 15 phút để nhận bắp nước.</span>
              </div>
            </section>
          </div>

          {/* Issued Banner */}
          <div className={styles.issuedBanner}>
            <svg
              className={styles.issuedIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <div>
              <div className={styles.issuedTextTitle}>
                VÉ ĐIỆN TỬ VÀ MÃ QR ĐÃ ĐƯỢC PHÁT HÀNH THÀNH CÔNG (ISSUED)
              </div>
              <div className={styles.issuedTextDesc}>
                Quý khách có thể mở xem vé điện tử ngay bây giờ để lấy mã QR check-in vào phòng
                chiếu hoặc xem lại trong mục &apos;Vé của tôi&apos;.
              </div>
            </div>
          </div>

          {/* Primary Action Row */}
          <div className={styles.primaryActionsRow}>
            <Link
              href={`/tickets/${ticket.ticketCode}`}
              className={styles.actionBtnPrimary}
            >
              Xem vé điện tử &amp; Mã QR ngay
            </Link>
            <Link href="/my-tickets" className={styles.actionBtnSecondary}>
              Quản lý vé của tôi
            </Link>
          </div>

          {/* Secondary Action Row */}
          <div className={styles.secondaryActionsRow}>
            <Link href="/" className={styles.actionBtnTertiary}>
              Về Trang chủ
            </Link>
            <button
              type="button"
              className={styles.actionBtnTertiary}
              onClick={handleDownloadPDF}
            >
              {downloadSuccess ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Check size={14} aria-hidden="true" />
                  Đã tải biên lai PDF
                </span>
              ) : (
                'Tải biên lai giao dịch (PDF)'
              )}
            </button>
            <button
              type="button"
              className={styles.actionBtnTertiary}
              onClick={() => alert('Trung tâm Chăm sóc Khách hàng: 1900-CINORA')}
            >
              Trợ giúp / CSKH
            </button>
          </div>
        </article>

        {/* Modal for viewing large QR & Ticket Pass */}
        {showQrModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowQrModal(false)}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 8,
                  color: 'var(--color-bianco-ferrari)',
                }}
              >
                VÉ ĐIỆN TỬ CHECK-IN
              </h2>
              <p style={{ fontSize: 12, color: 'var(--color-fumo)', marginBottom: 20 }}>
                {ticket.movieTitle} &nbsp;·&nbsp; Ghế {ticket.seats.join(', ')} &nbsp;·&nbsp; {ticket.showTime}
              </p>

              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: 16,
                  marginBottom: 16,
                  display: 'inline-block',
                }}
              >
                <QRCodeDisplay
                  value={ticket.qrPayload}
                  size={220}
                  altText={`Mã QR lớn cho vé ${ticket.ticketCode}`}
                />
              </div>

              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--color-bianco-ferrari)',
                  marginBottom: 16,
                  letterSpacing: '0.08em',
                }}
              >
                {ticket.ticketCode}
              </div>

              <button
                type="button"
                className={styles.actionBtnPrimary}
                style={{ width: '100%', height: 42 }}
                onClick={() => setShowQrModal(false)}
              >
                Đóng vé
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
