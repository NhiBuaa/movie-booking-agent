import React from 'react';
import { AlertTriangle } from 'lucide-react';
import styles from '../styles/search-states.module.css';

interface SearchErrorStateProps {
  onRetry: () => void;
}

export function SearchErrorState({ onRetry }: SearchErrorStateProps) {
  return (
    <div className={styles.stateContainer} data-name="S02 / Result State / Error">
      <div className={styles.iconWrapper}>
        <AlertTriangle size={32} color="var(--color-rosso-corsa, #da291c)" aria-hidden="true" />
      </div>

      <div className={styles.messageBlock}>
        <h3 className={styles.stateTitle}>Không thể kết nối đến hệ thống</h3>
        <p className={styles.stateDescription}>
          Đã xảy ra lỗi khi tìm nạp dữ liệu. Vui lòng thử lại sau.
        </p>
      </div>

      <div className={styles.actionGroup}>
        <button
          type="button"
          className={styles.actionBtnPrimary}
          onClick={onRetry}
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
