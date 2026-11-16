'use client';

import React from 'react';
import type { MovieTabId } from '../model/types.ts';
import styles from '../styles/movie-tabs.module.css';

interface MovieTabsProps {
  activeTab: MovieTabId;
  onTabChange: (tab: MovieTabId) => void;
  showtimesCount?: number;
  reviewsCount?: number;
}

export const MovieTabs: React.FC<MovieTabsProps> = ({
  activeTab,
  onTabChange,
  showtimesCount,
  reviewsCount,
}) => {
  return (
    <nav className={styles.tabsNavWrapper} aria-label="Movie Details Navigation">
      <div className={styles.tabsContainer} role="tablist">
        {/* Tab 1: Lịch chiếu & Đặt vé */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'showtimes'}
          aria-controls="panel-showtimes"
          id="tab-showtimes"
          className={`${styles.tabBtn} ${activeTab === 'showtimes' ? styles.tabBtnActive : ''}`}
          onClick={() => onTabChange('showtimes')}
        >
          <span>LỊCH CHIẾU & ĐẶT VÉ</span>
          {showtimesCount !== undefined && showtimesCount > 0 && (
            <span className={styles.tabBadge}>{showtimesCount}</span>
          )}
          {activeTab === 'showtimes' && <div className={styles.activeIndicator} />}
        </button>

        {/* Tab 2: Thông tin phim */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'info'}
          aria-controls="panel-info"
          id="tab-info"
          className={`${styles.tabBtn} ${activeTab === 'info' ? styles.tabBtnActive : ''}`}
          onClick={() => onTabChange('info')}
        >
          <span>THÔNG TIN PHIM</span>
          {activeTab === 'info' && <div className={styles.activeIndicator} />}
        </button>

        {/* Tab 3: Đánh giá (CineScore) */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'reviews'}
          aria-controls="panel-reviews"
          id="tab-reviews"
          className={`${styles.tabBtn} ${activeTab === 'reviews' ? styles.tabBtnActive : ''}`}
          onClick={() => onTabChange('reviews')}
        >
          <span>ĐÁNH GIÁ (CINESCORE)</span>
          {reviewsCount !== undefined && (
            <span className={styles.tabBadge}>{reviewsCount}</span>
          )}
          {activeTab === 'reviews' && <div className={styles.activeIndicator} />}
        </button>
      </div>
    </nav>
  );
};
