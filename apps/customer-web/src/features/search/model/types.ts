/**
 * Types & Domain Model for S02 Search & Filters
 * Adheres to frontend-architecture.md & DESIGN.md
 */

export interface MovieSearchResult {
  id: string;
  title: string;
  genre: string;
  genres: string[];
  durationMinutes: number;
  durationLabel: string;
  posterUrl: string;
  formats: ('2D Standard' | 'IMAX')[];
  cinemas: ('CINORA Đồng Khởi' | 'CINORA Landmark')[];
  dates: string[]; // e.g. ['04/11', '05/11']
  rating?: string;
  cineScore?: string;
}

export interface SearchFilterState {
  query: string;
  genre: string; // 'Tất cả' or specific genre
  cinema: string; // 'Tất cả các rạp' or specific cinema
  format: string; // 'Tất cả' or '2D Standard' | 'IMAX'
  date: string; // 'Tất cả' or '04/11' | '05/11'
}

export type FilterCategory = 'genre' | 'cinema' | 'format' | 'date';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export type SearchResultState = 'idle' | 'loading' | 'success' | 'empty' | 'error';
