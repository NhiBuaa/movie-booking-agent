import React from 'react';
import { X } from 'lucide-react';
import styles from '../styles/seat-legend.module.css';

export const SeatLegend: React.FC = () => {
  return (
    <div className={styles.legendRoot} role="region" aria-label="Chú thích sơ đồ ghế">
      <div className={styles.legendTitle}>GHẾ VÀ CHÚ THÍCH</div>

      <div className={styles.legendItems}>
        {/* 1. Ghế thường */}
        <div className={styles.legendItem}>
          <div className={`${styles.swatch} ${styles.swatchStandard}`} aria-hidden="true" />
          <span className={styles.legendLabel}>Ghế thường</span>
        </div>

        {/* 2. Ghế VIP */}
        <div className={styles.legendItem}>
          <div className={`${styles.swatch} ${styles.swatchVip}`} aria-hidden="true" />
          <span className={styles.legendLabel}>Ghế VIP</span>
        </div>

        {/* 3. Ghế đôi Sweetbox (Hàng J màu đỏ) */}
        <div className={styles.legendItem} title="Ghế đôi Sweetbox (bán theo cặp 2 ghế)">
          <div className={`${styles.swatch} ${styles.swatchSweetbox}`} aria-hidden="true">
            <span className={styles.sweetboxDivider} />
          </div>
          <span className={styles.legendLabel}>Ghế đôi Sweetbox</span>
        </div>

        {/* 4. Ghế đang chọn */}
        <div className={styles.legendItem}>
          <div className={`${styles.swatch} ${styles.swatchSelected}`} aria-hidden="true" />
          <span className={styles.legendLabel}>Ghế đang chọn</span>
        </div>

        {/* 5. Đã bán */}
        <div className={styles.legendItem}>
          <div className={`${styles.swatch} ${styles.swatchSold}`} aria-hidden="true">
            <X size={10} strokeWidth={2} aria-hidden="true" />
          </div>
          <span className={styles.legendLabel}>Đã bán</span>
        </div>
      </div>
    </div>
  );
};
