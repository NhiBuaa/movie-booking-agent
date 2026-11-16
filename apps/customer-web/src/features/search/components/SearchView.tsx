'use client';

import React, { useState, useMemo, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { FilterCategory, SearchFilterState } from '../model/types.ts';
import { SEARCH_MOVIES_FIXTURE } from '../model/search-fixtures.ts';
import {
  filterMovies,
  getFilterSummaryText,
  isFilterActive,
  getDefaultFilterState,
} from '../model/search-logic.ts';
import { SearchHeroNav } from './SearchHeroNav.tsx';
import { SearchSummary } from './SearchSummary.tsx';
import { FilterBar } from './FilterBar.tsx';
import { MovieResultGrid } from './MovieResultGrid.tsx';
import { SearchEmptyState } from './SearchEmptyState.tsx';
import styles from '../styles/search-view.module.css';

export function SearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Read initial values from URL query parameters
  const initialQuery = searchParams.get('q') || '';
  const initialGenre = searchParams.get('genre') || 'Tất cả';
  const initialCinema = searchParams.get('cinema') || 'Tất cả các rạp';
  const initialFormat = searchParams.get('format') || 'Tất cả';
  const initialDate = searchParams.get('date') || 'Tất cả';

  const [filterState, setFilterState] = useState<SearchFilterState>({
    query: initialQuery,
    genre: initialGenre,
    cinema: initialCinema,
    format: initialFormat,
    date: initialDate,
  });

  // Sync state to URL params cleanly
  const syncToUrl = (newState: SearchFilterState) => {
    const params = new URLSearchParams();
    if (newState.query.trim()) params.set('q', newState.query.trim());
    if (newState.genre !== 'Tất cả') params.set('genre', newState.genre);
    if (newState.cinema !== 'Tất cả các rạp') params.set('cinema', newState.cinema);
    if (newState.format !== 'Tất cả') params.set('format', newState.format);
    if (newState.date !== 'Tất cả') params.set('date', newState.date);

    const newQueryString = params.toString();
    const newUrl = newQueryString ? `/search?${newQueryString}` : '/search';
    startTransition(() => {
      router.replace(newUrl, { scroll: false });
    });
  };

  // Filtered movies calculation
  const filteredMovies = useMemo(() => {
    return filterMovies(SEARCH_MOVIES_FIXTURE, filterState);
  }, [filterState]);

  const summaryText = useMemo(() => {
    return getFilterSummaryText(filteredMovies.length, filterState);
  }, [filteredMovies.length, filterState]);

  const filterIsActive = useMemo(() => {
    return isFilterActive(filterState);
  }, [filterState]);

  // Handlers
  const handleQueryChange = (val: string) => {
    setFilterState((prev) => {
      const updated = { ...prev, query: val };
      return updated;
    });
  };

  const handleSearchSubmit = () => {
    syncToUrl(filterState);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setFilterState((prev) => {
      const updated = { ...prev, query: suggestion };
      syncToUrl(updated);
      return updated;
    });
  };

  const handleSelectFilter = (category: FilterCategory, value: string) => {
    setFilterState((prev) => {
      const updated = { ...prev, [category]: value };
      syncToUrl(updated);
      return updated;
    });
  };

  const handleResetFilters = () => {
    const defaultState = getDefaultFilterState('');
    setFilterState(defaultState);
    syncToUrl(defaultState);
  };

  const handleClearQuery = () => {
    setFilterState((prev) => {
      const updated = { ...prev, query: '' };
      syncToUrl(updated);
      return updated;
    });
  };

  return (
    <div className={styles.searchPageRoot} data-node-id="456:8" data-name="S02 — Kết Quả Tìm Kiếm & Bộ Lọc">
      <main className={styles.mainContent}>
        {/* 1. Search Bar & Back to Home */}
        <SearchHeroNav
          query={filterState.query}
          onQueryChange={handleQueryChange}
          onSubmit={handleSearchSubmit}
          onSelectSuggestion={handleSelectSuggestion}
        />

        {/* 2. Results Summary Header */}
        <SearchSummary summaryText={summaryText} />

        {/* 3. Filter Bar (4 Facets + Reset) */}
        <FilterBar
          genre={filterState.genre}
          cinema={filterState.cinema}
          format={filterState.format}
          date={filterState.date}
          isFilterActive={filterIsActive}
          onSelectFilter={handleSelectFilter}
          onResetFilters={handleResetFilters}
        />

        {/* 4. Results Grid or Empty State */}
        {filteredMovies.length > 0 ? (
          <MovieResultGrid movies={filteredMovies} />
        ) : (
          <SearchEmptyState
            onResetFilters={handleResetFilters}
            onClearQuery={handleClearQuery}
          />
        )}
      </main>
    </div>
  );
}
