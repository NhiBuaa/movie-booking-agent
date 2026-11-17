'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import type { TicketData } from '../model/types.ts';
import styles from '../styles/ticket-cancel.module.css';

interface TicketCancelViewProps {
  ticket: TicketData;
}

const CANCEL_REASONS = [
  'Thay đổi lịch trình bận đột xuất',
  'Đặt nhầm rạp hoặc khung giờ chiếu',
  'Bạn bè/Người thân không thể tham gia',
  'Muốn đổi sang định dạng khác (IMAX / ScreenX)',
  'Lý do cá nhân khác',
];

export const TicketCancelView: React.FC<TicketCancelViewProps> = ({ ticket }) => {
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState<string>(CANCEL_REASONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call to Cinema Core Refund Gateway
    setTimeout(() => {
      router.push(`/tickets/${ticket.id}/refund-status`);
    }, 800);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.navRow}>
          <Link href={`/tickets/${ticket.id}`} className={styles.backBtn} title="Quay lại vé">
            <ArrowLeft size={14} aria-hidden="true" />
            <span>QUAY LẠI VÉ</span>
          </Link>
          <span className={styles.breadcrumbText}>HỦY VÉ & HOÀN TIỀN</span>
        </div>

        <section className={styles.headingSection}>
          <h1 className={styles.pageTitle}>YÊU CẦU HỦY VÉ & HOÀN TIỀN</h1>
          <p className={styles.pageSubtitle}>
            Hệ thống hỗ trợ hoàn 100% giá trị vé khi yêu cầu trước giờ chiếu tối thiểu 60 phút.
          </p>
        </section>

        {/* Ticket Info Card */}
        <div className={styles.ticketSummaryCard}>
          <div>
            <h2 className={styles.ticketMovieTitle}>{ticket.movieTitle}</h2>
            <p className={styles.ticketDetails}>
              {ticket.cinemaName} — {ticket.hallName} | Suất {ticket.showtime} · {ticket.showDate} | Ghế: {ticket.seats.join(', ')}
            </p>
          </div>
          <div className={styles.refundAmountBox}>
            <div className={styles.refundAmountLabel}>SỐ TIỀN HOÀN TRẢ (100%)</div>
            <div className={styles.refundAmountValue}>{ticket.totalPaidFormatted}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.formSection}>
          <div>
            <div className={styles.sectionLabel}>CHỌN LÝ DO HỦY VÉ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CANCEL_REASONS.map((reason) => {
                const isActive = selectedReason === reason;
                return (
                  <div
                    key={reason}
                    className={`${styles.reasonOption} ${isActive ? styles.reasonOptionActive : ''}`}
                    onClick={() => setSelectedReason(reason)}
                    role="radio"
                    aria-checked={isActive}
                    tabIndex={0}
                  >
                    <div className={`${styles.radioCircle} ${isActive ? styles.radioCircleActive : ''}`}>
                      {isActive && <div className={styles.radioDot} />}
                    </div>
                    <span style={{ fontSize: 14 }}>{reason}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.policyNoticeBox}>
            <AlertTriangle size={20} color="#da291c" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
            <div className={styles.policyNoticeText}>
              <strong>Xác nhận điều khoản hủy vé:</strong> Sau khi xác nhận hủy, ghế ngồi sẽ được giải phóng ngay lập tức trên hệ thống Cinema Core để phục vụ khách hàng khác. Tiền hoàn sẽ được chuyển về tài khoản thanh toán ban đầu (MoMo / Thẻ ngân hàng). Hành động này không thể hoàn tác.
            </div>
          </div>

          <div className={styles.actionRow}>
            <button
              type="submit"
              className={styles.submitCancelBtn}
              disabled={isSubmitting}
            >
              <RotateCcw size={16} aria-hidden="true" />
              <span>{isSubmitting ? 'ĐANG XỬ LÝ HỦY...' : 'XÁC NHẬN HỦY VÉ & HOÀN TIỀN'}</span>
            </button>

            <Link href={`/tickets/${ticket.id}`} className={styles.keepTicketBtn}>
              GIỮ LẠI VÉ NÀY
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
