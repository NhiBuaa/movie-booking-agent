import React from 'react';
import Image from 'next/image';
import styles from '../styles/search-states.module.css';

export function SearchLoadingState() {
  return (
    <div className={styles.stateContainer} data-name="S02 / Result State / Loading">
      <div className={`${styles.iconWrapper} ${styles.spinner}`}>
        <Image
          src="/icons/rotate.svg"
          alt=""
          width={32}
          height={32}
          aria-hidden="true"
        />
      </div>

      <div className={styles.messageBlock}>
        <h3 className={styles.stateTitle}>Đang tải kết quả tìm kiếm...</h3>
        <p className={styles.stateDescription}>
          Hệ thống đang truy xuất lịch chiếu và phim theo yêu cầu của bạn.
        </p>
      </div>
    </div>
  );
}
