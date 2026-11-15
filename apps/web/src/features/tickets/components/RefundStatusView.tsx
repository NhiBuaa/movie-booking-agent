'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Clock,
  RefreshCw,
  ShieldCheck,
  Home,
  Ticket,
} from 'lucide-react';
import type { TicketData } from '../model/types.ts';
import styles from '../styles/refund-status.module.css';

interface RefundStatusViewProps {
  ticket: TicketData;
}

export const RefundStatusView: React.FC<RefundStatusViewProps> = ({ ticket }) => {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.navRow}>
          <Link href="/my-tickets" className={styles.backBtn} title="Quay lại Vé của tôi">
            <ArrowLeft size={14} aria-hidden="true" />
            <span>VÉ CỦA TÔI</span>
          </Link>
          <span style={{ fontSize: 12, color: '#8f8f8f' }}>TIẾN ĐỘ HOÀN TIỀN</span>
        </div>

        <section className={styles.headerSection}>
          <div className={styles.statusIconBox}>
            <Check size={32} aria-hidden="true" />
          </div>
          <h1 className={styles.title}>YÊU CẦU HOÀN TIỀN ĐÃ ĐƯỢC TIẾP NHẬN</h1>
          <p className={styles.subtitle}>
            Mã yêu cầu hoàn: <strong>RF-{ticket.id}</strong> · Tổng tiền hoàn: <strong>{ticket.totalPaidFormatted}</strong>
          </p>
        </section>

        <div className={styles.timelineCard} aria-label="Tiến trình đối soát hoàn tiền">
          {/* Step 1 */}
          <div className={styles.timelineStep}>
            <div className={styles.stepLine} />
            <div className={styles.stepIconDone}>
              <Check size={16} aria-hidden="true" />
            </div>
            <div className={styles.stepContent}>
              <div className={styles.stepTitle}>1. Tiếp nhận yêu cầu hủy vé</div>
              <div className={styles.stepDesc}>
                Yêu cầu hủy vé xem phim <strong>{ticket.movieTitle}</strong> đã được ghi nhận trên hệ thống lúc 10:45:12.
              </div>
              <div className={styles.stepTime}>Vừa xong · Tự động</div>
            </div>
          </div>

          {/* Step 2 */}
          <div className={styles.timelineStep}>
            <div className={styles.stepLine} />
            <div className={styles.stepIconDone}>
              <Check size={16} aria-hidden="true" />
            </div>
            <div className={styles.stepContent}>
              <div className={styles.stepTitle}>2. Giải phóng ghế trên Cinema Core</div>
              <div className={styles.stepDesc}>
                Ghế {ticket.seats.join(', ')} tại {ticket.cinemaName} đã được giải phóng thành công về kho vé rạp.
              </div>
              <div className={styles.stepTime}>Vừa xong · Cinema Core Sync</div>
            </div>
          </div>

          {/* Step 3 */}
          <div className={styles.timelineStep}>
            <div className={styles.stepLine} />
            <div className={styles.stepIconActive}>
              <RefreshCw size={14} className="animate-spin" aria-hidden="true" />
            </div>
            <div className={styles.stepContent}>
              <div className={styles.stepTitle}>3. Lệnh hoàn tiền gửi tới cổng thanh toán</div>
              <div className={styles.stepDesc}>
                Yêu cầu hoàn trả {ticket.totalPaidFormatted} đang được xử lý qua Cổng thanh toán liên ngân hàng. Thời gian nhận tiền dự kiến từ 5–15 phút (Ví điện tử) hoặc 1–2 ngày làm việc (Thẻ tín dụng).
              </div>
              <div className={styles.stepTime}>Đang xử lý...</div>
            </div>
          </div>

          {/* Step 4 */}
          <div className={styles.timelineStep}>
            <div className={styles.stepIconPending}>
              <Clock size={14} aria-hidden="true" />
            </div>
            <div className={styles.stepContent}>
              <div className={styles.stepTitle}>4. Tiền hoàn về tài khoản nguồn</div>
              <div className={styles.stepDesc}>
                Biên lai đối soát hoàn tiền sẽ được tự động gửi về email của bạn ngay khi giao dịch hoàn tất.
              </div>
              <div className={styles.stepTime}>Chờ cổng thanh toán xác nhận</div>
            </div>
          </div>
        </div>

        <div className={styles.ctaRow}>
          <Link href="/my-tickets" className={styles.primaryHomeBtn}>
            <Ticket size={16} style={{ marginRight: 8 }} aria-hidden="true" />
            <span>QUẢN LÝ VÉ CỦA TÔI</span>
          </Link>
          <Link href="/" className={styles.primaryHomeBtn} style={{ backgroundColor: '#181818', color: '#ffffff', border: '1px solid #303030' }}>
            <Home size={16} style={{ marginRight: 8 }} aria-hidden="true" />
            <span>VỀ TRANG CHỦ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
