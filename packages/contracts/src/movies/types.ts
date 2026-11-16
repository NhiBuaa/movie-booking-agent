import type { MovieAgeRating, MovieFormat } from '../common/enums.ts';

export type MovieStatus = 'NOW_SHOWING' | 'COMING_SOON' | 'SPECIAL_SCREENING' | 'ARCHIVED';

export interface MovieCastMemberDto {
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface MovieDto {
  id: string;
  slug: string;
  title: string;
  englishTitle?: string;
  director: string;
  cast: MovieCastMemberDto[];
  synopsis: string;
  durationMinutes: number;
  ageRating: MovieAgeRating;
  releaseDate: string; // ISO date string: "2026-11-04"
  genres: string[];
  formats: MovieFormat[];
  cineScore: number; // e.g. 4.9
  posterUrl: string;
  bannerUrl?: string;
  trailerUrl?: string;
  galleryUrls?: string[];
  status: MovieStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MovieSummaryDto {
  id: string;
  slug: string;
  title: string;
  posterUrl: string;
  durationMinutes: number;
  ageRating: MovieAgeRating;
  genres: string[];
  formats: MovieFormat[];
  cineScore: number;
  releaseDate: string;
  status: MovieStatus;
}

export interface MovieDetailDto extends MovieDto {
  relatedMovieIds?: string[];
  totalShowtimesCount?: number;
}

/**
 * Organizer DTO for creating a new movie in the cinema catalog.
 */
export interface CreateMovieRequest {
  title: string;
  englishTitle?: string;
  slug?: string;
  director: string;
  cast: MovieCastMemberDto[];
  synopsis: string;
  durationMinutes: number;
  ageRating: MovieAgeRating;
  releaseDate: string;
  genres: string[];
  formats: MovieFormat[];
  posterUrl: string;
  bannerUrl?: string;
  trailerUrl?: string;
  galleryUrls?: string[];
  status?: MovieStatus;
}

/**
 * Organizer DTO for updating an existing movie.
 */
export interface UpdateMovieRequest extends Partial<CreateMovieRequest> {
  id: string;
}

/**
 * Client query filters for movie discovery and search.
 */
export interface MovieFilterQuery {
  q?: string;
  genre?: string;
  cinemaId?: string;
  format?: MovieFormat;
  date?: string;
  status?: MovieStatus;
  page?: number;
  limit?: number;
}
