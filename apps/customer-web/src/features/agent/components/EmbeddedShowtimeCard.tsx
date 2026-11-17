'use client';

import React from 'react';
import Link from 'next/link';
import type { ShowtimeOption } from '../model/types.ts';
import { formatCurrency } from '../model/agent-logic.ts';
import { AGENT_SHOWTIME_FIXTURES } from '../model/agent-fixtures.ts';
import styles from '../styles/embedded-cards.module.css';

interface EmbeddedShowtimeCardProps {
  movieTitle?: string;
  cinemaName?: string;
  showtimes?: ShowtimeOption[];
  selectedId?: string;
  onSelectShowtime?: (showtime: ShowtimeOption) => void;
  disabled?: boolean;
}

export const EmbeddedShowtimeCard: React.FC<EmbeddedShowtimeCardProps> = ({
  movieTitle = 'Chuyến Tàu Cuối Hè',
  cinemaName = 'Cinora Đồng Khởi',
  showtimes = AGENT_SHOWTIME_FIXTURES,
  selectedId,
  onSelectShowtime,
  disabled = false,
}) => {
  const displayShowtimes = showtimes && showtimes.length > 0 ? showtimes : AGENT_SHOWTIME_FIXTURES;

  return (
    <div className={styles.cardBase} data-testid="embedded-showtime-card">
      {/* Figma Node 759:1958 Header */}
      <div className={styles.cardHeader}>
        <div>
          <h4 className={styles.cardTitle}>
            Suất chiếu: {movieTitle} · {cinemaName}
          </h4>
          <span className={styles.cardSubtitle}>
            Ngày chiếu: Thứ Bảy, 07/11/2026 · IMAX Laser (115 phút)
          </span>
        </div>
        <Link href="/movies/chuyen-tau-cuoi-he" className={styles.cardDetailLink}>
          Chi tiết phim
        </Link>
      </div>

      {/* 3 Showtime Buttons Grid - Figma Node 759:1962-1970 */}
      <div className={styles.showtimeGrid}>
        {displayShowtimes.map((st) => {
          const isSelected = selectedId === st.id;
          return (
            <button
              key={st.id}
              type="button"
              className={`${styles.showtimeBtn} ${isSelected ? styles.showtimeBtnActive : ''}`}
              onClick={() => !disabled && onSelectShowtime?.(st)}
              disabled={disabled}
              title={`Chọn suất ${st.time} - ${st.room}`}
            >
              <div className={styles.showtimePrimaryRow}>
                <span className={styles.showtimeTime}>{st.time}</span>
                <span className={styles.showtimeDot}>·</span>
                <span className={styles.showtimePrice}>{formatCurrency(st.price)}</span>
              </div>
              <div className={styles.showtimeSecondaryRow}>
                <span className={styles.showtimeFormat}>{st.format || 'IMAX Laser'}</span>
                <span className={styles.showtimeDot}>·</span>
                <span className={styles.showtimeSeatsLeft}>Còn {st.availableSeats} ghế</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Pricing Footnote - Figma Node 759:1971 */}
      <div className={styles.cardFootnote}>
        * Giá vé: Thường 140.000 đ · IMAX/VIP 160.000 đ (Chưa bao gồm combo bắp nước)
      </div>
    </div>
  );
};
