'use client';

import React from 'react';
import Link from 'next/link';
import type { MovieItem } from '../model/types.ts';
import styles from '../styles/hero-banner.module.css';

interface HeroBannerProps {
  movie: MovieItem;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ movie }) => {
  return (
    <section className={styles.heroSection} aria-label="Hero Spotlight">
      {/* Background imagery */}
      <img
        src={movie.backdropUrl || movie.posterUrl}
        alt=""
        className={styles.backdrop}
      />
      <div className={styles.scrim} />
      <div className={styles.vignetteLeft} />
      <div className={styles.vignetteRight} />
      <div className={styles.bottomFade} />

      {/* Main hero card content */}
      <div className={styles.container}>
        <div className={styles.posterWrapper}>
          <img src={movie.posterUrl} alt={`Poster ${movie.title}`} className={styles.posterImg} />
        </div>

        <div className={styles.content}>
          <h1 className={styles.title}>{movie.title}</h1>
          <p className={styles.metadata}>
            {movie.genres.join(' / ')} • {movie.durationMinutes} phút
          </p>
          <div className={styles.formatTag}>IMAX</div>

          <div className={styles.ctaGroup}>
            <Link href={`/movies/${movie.slug}`} className={styles.btnPrimary}>
              Đặt vé ngay
            </Link>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => {
                alert(`Mở video trailer của phim: ${movie.title}`);
              }}
            >
              Xem trailer
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
