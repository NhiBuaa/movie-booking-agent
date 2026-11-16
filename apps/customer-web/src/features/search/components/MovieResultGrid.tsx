import React from 'react';
import type { MovieSearchResult } from '../model/types.ts';
import { MovieResultCard } from './MovieResultCard.tsx';
import styles from '../styles/movie-result.module.css';

interface MovieResultGridProps {
  movies: MovieSearchResult[];
}

export function MovieResultGrid({ movies }: MovieResultGridProps) {
  return (
    <section className={styles.resultsGrid} data-name="Movie results / 2 columns">
      {movies.map((movie) => (
        <MovieResultCard key={movie.id} movie={movie} />
      ))}
    </section>
  );
}
