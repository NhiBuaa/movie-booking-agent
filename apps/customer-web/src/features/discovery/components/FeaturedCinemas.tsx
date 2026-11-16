import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { CinemaItem } from '../model/types.ts';
import styles from '../styles/featured-cinemas.module.css';

interface FeaturedCinemasProps {
  cinemas: CinemaItem[];
}

export const FeaturedCinemas: React.FC<FeaturedCinemasProps> = ({ cinemas }) => {
  return (
    <section className={styles.cinemasSection} aria-label="Featured Cinemas">
      <div className={styles.sectionHeader}>
        <h2 className={styles.heading}>CỤM RẠP NỔI BẬT & CÔNG NGHỆ PHÒNG CHIẾU</h2>
        <Link href="/cinemas" className={styles.allLink}>
          <span>TẤT CẢ 18 CỤM RẠP</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className={styles.cinemasGrid}>
        {cinemas.map((cinema) => (
          <div key={cinema.id} className={styles.cinemaCard}>
            <h3 className={styles.cardTitle}>
              {cinema.name} · [ {cinema.badge} ]
            </h3>
            <p className={styles.address}>Địa chỉ: {cinema.address}</p>
            <p className={styles.features}>{cinema.features}</p>
            <p className={styles.showtimes}>
              {cinema.todayShowtimesCount} suất hôm nay · Suất gần: {cinema.nextShowtime}
            </p>
            <Link href={`/cinemas/${cinema.id}`} className={styles.scheduleBtn}>
              <span>XEM LỊCH RẠP</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};
