'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  Check,
  Clock,
  Utensils,
  Download,
  Smartphone,
  Share2,
  Maximize2,
  X,
  RotateCcw,
} from 'lucide-react';
import type { TicketData } from '../model/types.ts';
import styles from '../styles/e-ticket-detail.module.css';

interface ETicketDetailViewProps {
  ticket: TicketData;
}

export const ETicketDetailView: React.FC<ETicketDetailViewProps> = ({ ticket }) => {
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const zoomCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const qrData = `CINORA:TICKET:${ticket.id}:${ticket.movieTitle}:${ticket.seats.join(',')}`;
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrData, {
        width: 232,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    }
  }, [ticket]);

  useEffect(() => {
    if (isZoomOpen && zoomCanvasRef.current) {
      const qrData = `CINORA:TICKET:${ticket.id}:${ticket.movieTitle}:${ticket.seats.join(',')}`;
      QRCode.toCanvas(zoomCanvasRef.current, qrData, {
        width: 320,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    }
  }, [isZoomOpen, ticket]);

  const triggerToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Navigation & Breadcrumb */}
        <div className={styles.navRow}>
          <Link href="/my-tickets" className={styles.backBtn} title="Quay lại danh sách vé">
            <ArrowLeft size={14} aria-hidden="true" />
            <span>QUAY LẠI VÉ CỦA TÔI</span>
          </Link>
          <span className={styles.breadcrumbText}>MÃ VÉ: {ticket.id}</span>
        </div>

        {notificationMsg && (
          <div
            style={{
              marginTop: 16,
              padding: '12px 20px',
              backgroundColor: '#0d281e',
              border: '1px solid #2e7d5b',
              color: '#ffffff',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{notificationMsg}</span>
            <X size={14} style={{ cursor: 'pointer' }} onClick={() => setNotificationMsg(null)} />
          </div>
        )}

        {/* Two-Column Ticket Layout Grid */}
        <div className={styles.ticketLayoutGrid}>
          {/* Left Admission Card */}
          <article className={styles.admissionCard} aria-label="Thông tin vé vào rạp">
            <div className={styles.cardHeaderRow}>
              <span className={styles.ticketCountLabel}>
                VÉ XEM PHIM · {ticket.seats.length.toString().padStart(2, '0')} VÉ
              </span>
              <span className={styles.confirmedBadge}>
                <Check size={12} aria-hidden="true" />
                <span>ĐÃ XÁC NHẬN</span>
              </span>
            </div>

            <div>
              <h1 className={styles.movieTitle}>{ticket.movieTitle}</h1>
              <p className={styles.movieSubtitle}>
                {ticket.format} · Thời lượng {ticket.durationFormatted} · {ticket.ageRating}
              </p>
            </div>

            {/* 4-Field Showtime Grid */}
            <div className={styles.fourFieldGrid}>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>RẠP CHIẾU</span>
                <span className={styles.fieldValue}>{ticket.cinemaName}</span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>NGÀY CHIẾU</span>
                <span className={styles.fieldValue}>{ticket.showDate}</span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>SUẤT CHIẾU</span>
                <span className={styles.fieldValueHighlight}>{ticket.showtime}</span>
              </div>
              <div className={styles.fieldItem}>
                <span className={styles.fieldLabel}>GHẾ NGỒI</span>
                <span className={styles.fieldValueHighlight}>{ticket.seats.join(', ')}</span>
              </div>
            </div>

            <div>
              <div className={styles.fieldLabel} style={{ marginBottom: 4 }}>
                ĐỊNH DẠNG / PHÒNG
              </div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>
                {ticket.format} — {ticket.hallName}
              </div>
            </div>

            {/* Concessions Box */}
            {ticket.comboDescription && (
              <div className={styles.concessionsCard}>
                <Utensils size={22} color="#ffffff" aria-hidden="true" />
                <div className={styles.comboTextGroup}>
                  <span className={styles.comboName}>{ticket.comboDescription}</span>
                  <span className={styles.comboCode}>Mã nhận bắp nước: {ticket.comboCode}</span>
                </div>
              </div>
            )}

            <div className={styles.reminderRow}>
              <Clock size={16} color="#8f8f8f" style={{ marginTop: 2 }} aria-hidden="true" />
              <span>
                Có mặt trước giờ chiếu 15 phút để nhận bắp nước và ổn định chỗ ngồi.
              </span>
            </div>
          </article>

          {/* Right QR Check-in Card */}
          <article className={styles.qrCard} aria-label="Mã check-in soát vé">
            <h2 className={styles.qrHeaderTitle}>MÃ CHECK-IN TẠI RẠP</h2>

            <div className={styles.qrWell}>
              <canvas ref={canvasRef} className={styles.qrCanvas} />
            </div>

            <span className={styles.qrDisclaimer}>MÃ CHÍNH HÃNG · BẢO MẬT SSL</span>
            <span className={styles.qrCodeNumber}>{ticket.id}</span>
            <p className={styles.qrInstruction}>
              Trình mã vé tại quầy soát vé hoặc quét tại Kiosk tự động
            </p>

            <div className={styles.actionsStack}>
              <button
                type="button"
                className={styles.primaryActionBtn}
                onClick={() => setIsZoomOpen(true)}
              >
                <Maximize2 size={14} style={{ marginRight: 6 }} aria-hidden="true" />
                <span>Phóng to mã QR</span>
              </button>

              <button
                type="button"
                className={styles.secondaryActionBtn}
                onClick={() => triggerToast('Đã bắt đầu tải tệp PDF vé điện tử về thiết bị!')}
              >
                <Download size={14} aria-hidden="true" />
                <span>Tải vé (PDF / Ảnh)</span>
              </button>

              <button
                type="button"
                className={styles.secondaryActionBtn}
                onClick={() => triggerToast('Đã thêm vé vào Ví Apple/Google Wallet thành công!')}
              >
                <Smartphone size={14} aria-hidden="true" />
                <span>Apple / Google Wallet</span>
              </button>

              <button
                type="button"
                className={styles.secondaryActionBtn}
                onClick={() => triggerToast(`Đã gửi vé điện tử đến email đăng ký của bạn!`)}
              >
                <Share2 size={14} aria-hidden="true" />
                <span>Gửi lại qua Email / Zalo</span>
              </button>

              <Link
                href={`/tickets/${ticket.id}/cancel`}
                className={styles.secondaryActionBtn}
                style={{ textDecoration: 'none' }}
              >
                <RotateCcw size={14} color="#da291c" aria-hidden="true" />
                <span style={{ color: '#da291c' }}>Yêu cầu hủy vé & Hoàn tiền</span>
              </Link>
            </div>
          </article>
        </div>
      </div>

      {/* QR Zoom Modal */}
      {isZoomOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsZoomOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{ticket.movieTitle}</span>
              <X size={18} style={{ cursor: 'pointer' }} onClick={() => setIsZoomOpen(false)} />
            </div>
            <div style={{ background: '#ffffff', padding: 12 }}>
              <canvas ref={zoomCanvasRef} />
            </div>
            <p style={{ marginTop: 12, fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>{ticket.id}</p>
            <p style={{ fontSize: 12, color: '#8f8f8f' }}>Ghế: {ticket.seats.join(', ')} · Suất: {ticket.showtime}</p>
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={() => setIsZoomOpen(false)}
            >
              ĐÓNG CỬA SỔ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
