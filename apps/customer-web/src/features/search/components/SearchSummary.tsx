import React from 'react';
import styles from '../styles/search-summary.module.css';

interface SearchSummaryProps {
  summaryText: string;
}

export function SearchSummary({ summaryText }: SearchSummaryProps) {
  return (
    <div className={styles.summaryContainer} data-name="Search results summary">
      <h1 className={styles.title}>Kết quả tìm kiếm</h1>
      <p className={styles.subtitle}>{summaryText}</p>
    </div>
  );
}
