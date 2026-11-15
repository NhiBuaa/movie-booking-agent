/**
 * Movie Details (S06) - Domain Types
 * Adheres to frontend-architecture.md & DESIGN.md
 */

export interface MovieCastMember {
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface ShowtimeSlot {
  id: string;
  time: string; // e.g. "18:15", "19:30", "20:45", "21:30"
  format: '2D' | 'IMAX';
  screen: string;
  price: number;
  priceFormatted: string;
  status: 'available' | 'almost_full' | 'sold_out';
}

export interface CinemaShowtimeGroup {
  cinemaId: string;
  cinemaName: string; // e.g. "CGV Đồng Khởi", "CGV Landmark"
  cinemaSlug: string; // e.g. "dong-khoi", "landmark"
  address: string;
  badge?: string;
  slots: ShowtimeSlot[];
}

export interface DaySchedule {
  date: string; // e.g. "04/11", "05/11"
  dayOfWeek: string; // e.g. "Thứ Tư", "Thứ Năm"
  label: string; // e.g. "HÔM NAY · 04/11"
  cinemas: CinemaShowtimeGroup[];
}

export interface MovieReviewItem {
  id: string;
  author: string;
  badge: string;
  rating: number; // e.g. 5.0
  date: string;
  comment: string;
  likes: number;
}

export interface RelatedMovieCard {
  id: string;
  title: string;
  slug: string;
  genre: string;
  posterUrl: string;
}

export interface MovieDetailData {
  id: string;
  slug: string;
  title: string;
  englishTitle?: string;
  director: string;
  cast: MovieCastMember[];
  synopsis: string;
  durationMinutes: number;
  durationFormatted: string;
  ageRating: string; // 'T16', 'T18'
  releaseDate: string;
  genres: string[];
  formats: string[]; // e.g. ['T16', 'IMAX', '2D DIGITAL', 'DOLBY ATMOS']
  cineScore: number; // 4.9
  reviewsCount: number; // 1250
  posterUrl: string;
  backdropUrl: string;
  trailerUrl: string;
  trailerDuration: string;
  galleryCount: number;
  schedule: DaySchedule[];
  reviews: MovieReviewItem[];
  relatedMovies: RelatedMovieCard[];
}

export type MovieTabId = 'showtimes' | 'info' | 'reviews';

export interface ShowtimeFilterState {
  selectedDate: string; // "04/11" | "05/11"
  selectedFormat: 'ALL' | '2D' | 'IMAX';
}
