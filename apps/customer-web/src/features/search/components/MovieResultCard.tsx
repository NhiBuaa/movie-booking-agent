import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { MovieSearchResult } from '../model/types.ts';
import styles from '../styles/movie-result.module.css';

interface MovieResultCardProps {
  movie: MovieSearchResult;
}

export function MovieResultCard({ movie }: MovieResultCardProps) {
  return (
    <article className={styles.movieCard} data-name={`Result / ${movie.title.replace(/\n/g, ' ')}`}>
      {/* Poster Image */}
      <div className={styles.posterWrapper}>
        <Image
          src={movie.posterUrl}
          alt={`Poster phim ${movie.title}`}
          width={144}
          height={216}
          className={styles.posterImg}
          priority
        />
      </div>

      {/* Movie Information & Actions */}
      <div className={styles.contentWrapper}>
        <div className={styles.infoBlock}>
          <h2 className={styles.movieTitle}>
            {movie.title.split('\n').map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                {idx < movie.title.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </h2>

          <div className={styles.metadataGroup}>
            <p className={styles.genreText}>Thể loại: {movie.genre}</p>
            <p className={styles.durationText}>Thời lượng: {movie.durationLabel}</p>
          </div>
        </div>

        {/* CTA: Xem chi tiết -> S06 Movie Details */}
        <Link
          href={`/movies/${movie.id}`}
          className={styles.detailButton}
          aria-label={`Xem chi tiết phim ${movie.title.replace(/\n/g, ' ')}`}
        >
          Xem chi tiết
        </Link>
      </div>
    </article>
  );
}
