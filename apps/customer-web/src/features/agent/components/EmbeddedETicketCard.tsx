'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { Film, Utensils, ZoomIn, Download, CreditCard, Send, Maximize2, Ticket } from 'lucide-react';
import type { TicketInfo } from '../model/types.ts';
import styles from '../styles/embedded-cards.module.css';

interface EmbeddedETicketCardProps {
  ticket?: TicketInfo;
}

export const EmbeddedETicketCard: React.FC<EmbeddedETicketCardProps> = ({ ticket }) => {
  const [qrUrl, setQrUrl] = useState<string>(ticket?.qrDataUrl || '');
  const [isQrZoomed, setIsQrZoomed] = useState<boolean>(false);

  const bookingCode = ticket?.bookingCode || 'MB-2026-000128';
  const movieTitle = ticket?.movieTitle || 'Chuyến Tàu Cuối Hè';
  const cinemaName = ticket?.cinemaName || 'Cinora Đồng Khởi';
  const hallName = ticket?.hallName || 'Phòng 02 (IMAX Laser)';
  const showtime = ticket?.showtime || '18:30';
  const date = ticket?.date || 'Thứ Bảy, 07/11/2026';
  const seats = ticket?.seats || ['H7', 'H8'];

  useEffect(() => {
    if (!qrUrl) {
      QRCode.toDataURL(`CINORA-CORE:${bookingCode}`, {
        margin: 1,
        width: 140,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => setQrUrl(url))
        .catch(() => {
          // Fallback handled
        });
    }
  }, [bookingCode, qrUrl]);

  return (
    <div className={`${styles.cardBase} ${styles.ticketCard}`} data-testid="embedded-eticket-card">
      {/* Header - Figma Node 791:4459 */}
      <div className={styles.cardHeader}>
        <div>
          <h4 className={styles.cardTitle}>Vé Điện Tử &amp; Check-in QR</h4>
          <span className={styles.cardSubtitle}>
            Mã giao dịch Cinema Core: TXN-892401 · CONFIRMED
          </span>
        </div>

        <div className={styles.ticketStatusBadge}>
          <span className={styles.statusDot} aria-hidden="true" />
          <span>ĐÃ PHÁT HÀNH VÉ (ISSUED)</span>
        </div>
      </div>

      {/* Boarding Pass - Figma Node 791:4464 (784x326px) */}
      <div className={styles.boardingPass}>
        {/* Left Half: Ticket Details (464x326px) */}
        <div className={styles.ticketDetailsLeft}>
          <div className={styles.ticketLeftHeader}>
            <div className={styles.ticketLeftHeaderTitle}>
              <Film size={16} color="var(--color-bianco-ferrari, #ffffff)" aria-hidden="true" />
              <span>Vé xem phim: {seats.length} Vé VIP</span>
            </div>
            <div className={styles.ticketConfirmedPill}>
              ĐÃ XÁC NHẬN
            </div>
          </div>

          <h4 className={styles.ticketMovieTitle}>{movieTitle}</h4>
          <p className={styles.ticketMovieMeta}>IMAX Laser 2D · Phụ đề tiếng Việt · 115 phút</p>

          <div className={styles.ticketInfo2x2}>
            <div className={styles.ticketInfoBlock}>
              <span className={styles.ticketInfoBlockLabel}>RẠP CHIẾU</span>
              <span className={styles.ticketInfoBlockValue}>{cinemaName}</span>
            </div>
            <div className={styles.ticketInfoBlock}>
              <span className={styles.ticketInfoBlockLabel}>NGÀY &amp; SUẤT CHIẾU</span>
              <span className={styles.ticketInfoBlockValue}>{date} · {showtime}</span>
            </div>
            <div className={styles.ticketInfoBlock}>
              <span className={styles.ticketInfoBlockLabel}>ĐỊNH DẠNG / PHÒNG</span>
              <span className={styles.ticketInfoBlockValue}>{hallName}</span>
            </div>
            <div className={styles.ticketInfoBlock}>
              <span className={styles.ticketInfoBlockLabel}>GHẾ NGỒI</span>
              <span className={`${styles.ticketInfoBlockValue} ${styles.ticketSeatsHighlight}`}>
                {seats.join(', ')} (VIP Trung tâm)
              </span>
            </div>
          </div>

          <div className={styles.ticketFnBBox}>
            <Utensils size={16} color="var(--color-bianco-ferrari, #ffffff)" aria-hidden="true" />
            <div>
              <div className={styles.ticketFnBTitle}>Combo đôi FB-000128</div>
              <div className={styles.ticketFnBRef}>01 Bắp lớn + 02 Nước ngọt có ga · Quầy Concessions</div>
            </div>
          </div>

          <div className={styles.ticketEntryReminder}>
            * Vui lòng có mặt tại sảnh rạp trước giờ chiếu 15 phút để làm thủ tục check-in hoặc đổi bắp nước.
          </div>
        </div>

        {/* Perforated Tear Line (10x326px) */}
        <div className={styles.perforatedLine}>
          {Array.from({ length: 18 }, (_, i) => (
            <div key={i} className={styles.perforationDot} />
          ))}
        </div>

        {/* Right Half: Live QR Scan Card (292x302px) */}
        <div className={styles.ticketQrRight}>
          <div className={styles.ticketQrCodeBox}>
            {qrUrl ? (
              <img
                src={qrUrl}
                alt={`QR code for ${bookingCode}`}
                className={styles.ticketQrImg}
                style={{ transform: isQrZoomed ? 'scale(1.25)' : 'none', transition: 'transform 200ms ease' }}
              />
            ) : (
              <div style={{ width: 110, height: 110, backgroundColor: '#eee' }} />
            )}
          </div>

          <div className={styles.ticketBookingCode}>{bookingCode}</div>

          <div className={styles.ticketQrInstruction}>
            Quét mã QR tại cổng kiểm soát vé tự động hoặc quầy vé rạp.
          </div>

          <button
            type="button"
            className={styles.ticketExpandQrBtn}
            onClick={() => setIsQrZoomed((prev) => !prev)}
            title="Phóng to mã QR để quét dễ dàng hơn"
          >
            <ZoomIn size={13} aria-hidden="true" />
            <span>{isQrZoomed ? 'Thu nhỏ QR' : 'Phóng to mã QR'}</span>
          </button>
        </div>
      </div>

      {/* 3 Export Buttons - Figma Node 791:4750 */}
      <div className={styles.ticketExportRow}>
        <button
          type="button"
          className={styles.ticketExportBtn}
          onClick={() => alert(`Đã tải vé điện tử ${bookingCode} (PDF & Ảnh) về máy!`)}
        >
          <Download size={14} aria-hidden="true" />
          <span>Tải vé (PDF / Ảnh)</span>
        </button>

        <button
          type="button"
          className={styles.ticketExportBtn}
          onClick={() => alert(`Đã lưu vé ${bookingCode} vào Apple / Google Wallet!`)}
        >
          <CreditCard size={14} aria-hidden="true" />
          <span>Lưu vào Ví điện tử</span>
        </button>

        <button
          type="button"
          className={styles.ticketExportBtn}
          onClick={() => alert(`Đã gửi vé điện tử ${bookingCode} qua Email & Zalo!`)}
        >
          <Send size={14} aria-hidden="true" />
          <span>Gửi qua Email / Zalo</span>
        </button>
      </div>

      {/* 2 Navigation Actions - Figma Node 791:4757 (384px + 384px) */}
      <div className={styles.ticketNavRow}>
        <Link href="/my-tickets" className={styles.ticketNavPrimaryBtn}>
          <Maximize2 size={14} aria-hidden="true" />
          <span>Mở vé toàn màn hình</span>
        </Link>

        <Link href="/my-tickets" className={styles.ticketNavSecondaryBtn}>
          <Ticket size={14} aria-hidden="true" />
          <span>Quản lý vé của tôi</span>
        </Link>
      </div>
    </div>
  );
};
