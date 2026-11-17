import type { MovieSearchResult, SearchFilterState } from './types.ts';

export function getDefaultFilterState(initialQuery = ''): SearchFilterState {
  return {
    query: initialQuery,
    genre: 'Tất cả',
    cinema: 'Tất cả các rạp',
    format: 'Tất cả',
    date: 'Tất cả',
  };
}

export function isFilterActive(state: SearchFilterState): boolean {
  return (
    state.genre !== 'Tất cả' ||
    state.cinema !== 'Tất cả các rạp' ||
    state.format !== 'Tất cả' ||
    state.date !== 'Tất cả' ||
    state.query.trim().length > 0
  );
}

export function isOnlyFacetFilterActive(state: SearchFilterState): boolean {
  return (
    state.genre !== 'Tất cả' ||
    state.cinema !== 'Tất cả các rạp' ||
    state.format !== 'Tất cả' ||
    state.date !== 'Tất cả'
  );
}

export function filterMovies(
  movies: MovieSearchResult[],
  state: SearchFilterState
): MovieSearchResult[] {
  return movies.filter((movie) => {
    // 1. Text Query
    if (state.query.trim().length > 0) {
      const q = state.query.trim().toLowerCase();
      const matchTitle = movie.title.toLowerCase().includes(q);
      const matchGenre = movie.genre.toLowerCase().includes(q);
      const matchCinema = movie.cinemas.some((c) => c.toLowerCase().includes(q));
      if (!matchTitle && !matchGenre && !matchCinema) {
        return false;
      }
    }

    // 2. Genre
    if (state.genre !== 'Tất cả') {
      const match = movie.genres.some((g) => g.toLowerCase() === state.genre.toLowerCase());
      if (!match) return false;
    }

    // 3. Cinema
    if (state.cinema !== 'Tất cả các rạp') {
      const match = movie.cinemas.some((c) => c.toLowerCase() === state.cinema.toLowerCase());
      if (!match) return false;
    }

    // 4. Format
    if (state.format !== 'Tất cả') {
      const match = movie.formats.some((f) => f.toLowerCase() === state.format.toLowerCase());
      if (!match) return false;
    }

    // 5. Date
    if (state.date !== 'Tất cả') {
      const match = movie.dates.includes(state.date);
      if (!match) return false;
    }

    return true;
  });
}

export function getFilterSummaryText(
  resultCount: number,
  state: SearchFilterState
): string {
  if (!isFilterActive(state)) {
    return `${resultCount} phim · Chưa áp dụng bộ lọc`;
  }

  const activeFacets: string[] = [];
  if (state.genre !== 'Tất cả') activeFacets.push(state.genre);
  if (state.cinema !== 'Tất cả các rạp') activeFacets.push(state.cinema);
  if (state.format !== 'Tất cả') activeFacets.push(state.format);
  if (state.date !== 'Tất cả') activeFacets.push(state.date);

  if (activeFacets.length === 0 && state.query.trim().length > 0) {
    return `${resultCount} phim · Từ khóa "${state.query.trim()}"`;
  }

  if (activeFacets.length > 0) {
    return `${resultCount} phim · ${activeFacets.join(' · ')}`;
  }

  return `${resultCount} phim`;
}
