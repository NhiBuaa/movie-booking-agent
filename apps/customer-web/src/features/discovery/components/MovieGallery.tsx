'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MovieItem } from '../model/types.ts';
import styles from '../styles/movie-gallery.module.css';

interface MovieGalleryProps {
  movies: MovieItem[];
}

export const MovieGallery: React.FC<MovieGalleryProps> = ({ movies }) => {
  const [tab, setTab] = useState<'showing' | 'upcoming'>('showing');
  const [page, setPage] = useState(0);

  const filteredMovies = movies.filter((m) => m.status === tab);
  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);
  const displayedMovies = filteredMovies.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  return (
    <section className={styles.gallerySection} id="movies" aria-label="Movie Gallery">
      {/* Controls Header */}
      <div className={styles.galleryControlsHeader}>
        {/* Tabs: Đang chiếu / Sắp chiếu */}
        <div className={styles.tabsGroup} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'showing'}
            className={`${styles.tabBtn} ${tab === 'showing' ? styles.tabActive : styles.tabInactive}`}
            onClick={() => {
              setTab('showing');
              setPage(0);
            }}
          >
            Đang chiếu
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'upcoming'}
            className={`${styles.tabBtn} ${tab === 'upcoming' ? styles.tabActive : styles.tabInactive}`}
            onClick={() => {
              setTab('upcoming');
              setPage(0);
            }}
          >
            Sắp chiếu
          </button>
        </div>

        {/* Navigation Arrows: Trước / Tiếp */}
        <div className={styles.navArrowsGroup}>
          <button
            type="button"
            disabled={page === 0}
            onClick={handlePrev}
            className={styles.arrowBtn}
            aria-label="Xem trang trước"
          >
            <ChevronLeft size={16} className={styles.chevronIcon} aria-hidden="true" />
            <span>Trước</span>
          </button>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={handleNext}
            className={styles.arrowBtn}
            aria-label="Xem trang tiếp"
          >
            <span>Tiếp</span>
            <ChevronRight size={16} className={styles.chevronIcon} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className={styles.cardsGrid}>
        {displayedMovies.map((movie) => (
          <div key={movie.id} className={styles.movieCard}>
            <div className={styles.posterContainer}>
              <img src={movie.posterUrl} alt={movie.title} className={styles.posterImg} />
              <div className={styles.formatBadge}>[ {movie.format} ]</div>
            </div>

            <h3 className={styles.cardTitle} title={movie.title}>{movie.title}</h3>
            <p className={styles.cardMetadata}>
              {movie.ageRating} · {movie.durationMinutes} phút · {movie.genres.join(', ')}
            </p>

            <Link href={`/movies/${movie.slug}`} className={styles.bookBtn}>
              ĐẶT VÉ NGAY
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};
