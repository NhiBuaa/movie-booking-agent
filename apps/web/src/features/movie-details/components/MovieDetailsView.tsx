'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Ticket, ArrowRight } from 'lucide-react';
import type { MovieDetailData } from '../model/types.ts';
import { MovieHero } from './MovieHero.tsx';
import { TrailerModal } from './TrailerModal.tsx';
import styles from '../styles/movie-details.module.css';

interface MovieDetailsViewProps {
  movie: MovieDetailData;
}

export const MovieDetailsView: React.FC<MovieDetailsViewProps> = ({ movie }) => {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [carouselOffset, setCarouselOffset] = useState(0);

  // Carousel navigation (5 items total)
  const maxOffset = Math.max(0, movie.relatedMovies.length - 5);

  const handlePrev = () => {
    setCarouselOffset((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCarouselOffset((prev) => Math.min(maxOffset, prev + 1));
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 02. Movie Hero (Full-bleed backdrop + Title + Format tags + Details + Diễn viên + Media panel) */}
      <MovieHero
        movie={movie}
        onOpenTrailer={() => setIsTrailerOpen(true)}
      />

      {/* 03. Same Genre Carousel (Figma Node 471:310: PHIM ĐANG CHIẾU CÙNG THỂ LOẠI) */}
      <section className={styles.carouselSection} aria-label="Phim đang chiếu cùng thể loại">
        <div className={styles.carouselContainer}>
          <div className={styles.carouselHeader}>
            <h2 className={styles.carouselTitle}>PHIM ĐANG CHIẾU CÙNG THỂ LOẠI</h2>
            <div className={styles.carouselNavControls}>
              <button
                type="button"
                className={styles.carouselNavBtn}
                onClick={handlePrev}
                disabled={carouselOffset === 0}
                aria-label="Phim trước"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={styles.carouselNavBtn}
                onClick={handleNext}
                disabled={carouselOffset >= maxOffset}
                aria-label="Phim kế tiếp"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* 5-Card Related Movie Layout with Smooth Sliding (Figma Node 480:238) */}
          <div className={styles.carouselViewport}>
            <div
              className={styles.carouselTrack}
              style={{
                transform: `translateX(calc(-${carouselOffset} * (calc((100% - (4 * 24px)) / 5) + 24px)))`,
              }}
            >
              {movie.relatedMovies.map((item) => (
                <Link
                  key={item.id}
                  href={`/movies/${item.slug}`}
                  className={styles.relatedCard}
                >
                  <div className={styles.posterContainer}>
                    <Image
                      src={item.posterUrl}
                      alt={`Poster ${item.title}`}
                      fill
                      sizes="248px"
                      className={styles.posterImg}
                    />
                  </div>
                  <div className={styles.cardCopy}>
                    <p className={styles.relatedMovieTitle}>{item.title}</p>
                    <p className={styles.relatedMovieGenre}>{item.genre}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 04. Sticky Booking Bar (Figma Node 471:351: 80px bar) */}
      <div className={styles.stickyBookingBar} aria-label="Thanh đặt vé nhanh">
        <div className={styles.stickyBarInner}>
          <div className={styles.stickyMovieTitle}>{movie.title}</div>
          <div className={styles.stickyMovieMeta}>
            {movie.durationMinutes} PHÚT  ·  {movie.ageRating}
          </div>
          <Link
            href={`/booking/${movie.slug}/seats`}
            className={styles.stickyBookingCta}
            data-testid="sticky-book-cta"
          >
            <Ticket size={16} color="#000000" fill="#000000" aria-hidden="true" />
            <span>ĐẶT VÉ NGAY</span>
            <ArrowRight size={14} color="#000000" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* 05. Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        title={movie.title}
        trailerUrl={movie.trailerUrl}
      />
    </div>
  );
};
