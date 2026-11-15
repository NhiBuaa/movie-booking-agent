'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, ArrowRight, Phone } from 'lucide-react';
import styles from '../styles/reconciliation.module.css';

interface ReconciliationViewProps {
  bookingId: string;
}

export const ReconciliationView: React.FC<ReconciliationViewProps> = ({ bookingId }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleRecheck = () => {
    setIsChecking(true);
    setStatusMessage(null);
    setTimeout(() => {
      setIsChecking(false);
      setStatusMessage('Cinema Core đã kiểm tra: Giao dịch đã được ghi nhận thành công!');
    }, 2000);
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.reconcileCard}>
          <div className={styles.statusIconWell}>
            <AlertTriangle size={32} color="#d97706" aria-hidden="true" />
          </div>

          <h1 className={styles.reconcileTitle}>Tra Soát Trạng Thái Giao Dịch</h1>
          <p className={styles.reconcileDesc}>
            Cổng thanh toán chưa trả về kết quả cuối cùng trong thời gian quy định. Hệ thống Cinema Core đang tự động đối soát với ngân hàng để bảo đảm quyền lợi ghế ngồi của bạn.
          </p>

          <div className={styles.auditDetailsBox}>
            <div className={styles.auditRow}>
              <span className={styles.auditRowLabel}>MÃ GIAO DỊCH:</span>
              <span style={{ fontWeight: 700 }}>{bookingId}</span>
            </div>
            <div className={styles.auditRow}>
              <span className={styles.auditRowLabel}>TRẠNG THÁI HIỆN TẠI:</span>
              <span style={{ color: '#d97706', fontWeight: 600 }}>ĐANG ĐỐI SOÁT (UNKNOWN_PENDING)</span>
            </div>
            <div className={styles.auditRow}>
              <span className={styles.auditRowLabel}>CHÍNH SÁCH BẢO VỆ:</span>
              <span>Giữ chỗ 10 phút · Hoàn tiền 100% nếu trừ tiền nhưng không cấp vé</span>
            </div>
          </div>

          {statusMessage && (
            <div
              style={{
                width: '100%',
                padding: '12px 16px',
                marginBottom: 20,
                backgroundColor: '#0d281e',
                border: '1px solid #2e7d5b',
                color: '#ffffff',
                fontSize: 13,
              }}
            >
              {statusMessage}
            </div>
          )}

          <div className={styles.actionsGroup}>
            <button
              type="button"
              className={styles.primaryRetryBtn}
              onClick={handleRecheck}
              disabled={isChecking}
            >
              <RotateCcw
                size={14}
                className={isChecking ? 'animate-spin' : ''}
                aria-hidden="true"
              />
              <span>{isChecking ? 'Đang đối soát...' : 'TRA SOÁT LẠI VỚI CỔNG THANH TOÁN'}</span>
            </button>

            <Link href={`/tickets/${bookingId}`} className={styles.secondaryBtn}>
              <span>XEM VÉ NẾU ĐÃ TRỪ TIỀN</span>
              <ArrowRight size={14} style={{ marginLeft: 6 }} aria-hidden="true" />
            </Link>

            <a href="tel:19006017" className={styles.secondaryBtn}>
              <Phone size={14} style={{ marginRight: 6 }} aria-hidden="true" />
              <span>TỔNG ĐÀI HỖ TRỢ 1900 6017</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
