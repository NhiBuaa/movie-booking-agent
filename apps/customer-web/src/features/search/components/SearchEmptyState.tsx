import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/search-states.module.css';

interface SearchEmptyStateProps {
  onResetFilters: () => void;
  onClearQuery: () => void;
}

export function SearchEmptyState({ onResetFilters, onClearQuery }: SearchEmptyStateProps) {
  return (
    <div className={styles.stateContainer} data-name="S02 / Result State / Empty">
      <div className={styles.iconWrapper}>
        <Image
          src="/icons/search.svg"
          alt=""
          width={32}
          height={32}
          aria-hidden="true"
        />
      </div>

      <div className={styles.messageBlock}>
        <h3 className={styles.stateTitle}>Không tìm thấy phim phù hợp</h3>
        <p className={styles.stateDescription}>
          Vui lòng thử từ khóa khác hoặc điều chỉnh lại các tiêu chí bộ lọc.
        </p>
      </div>

      <div className={styles.actionGroup}>
        <button
          type="button"
          className={styles.actionBtnPrimary}
          onClick={onResetFilters}
        >
          Xóa bộ lọc
        </button>

        <button
          type="button"
          className={styles.actionBtnSecondary}
          onClick={onClearQuery}
        >
          Đổi từ khóa
        </button>

        <Link href="/chat" className={styles.actionBtnAI}>
          <Image
            src="/icons/comments.svg"
            alt=""
            width={16}
            height={16}
            aria-hidden="true"
          />
          <span>Mở Buaa tìm giúp</span>
        </Link>
      </div>
    </div>
  );
}
