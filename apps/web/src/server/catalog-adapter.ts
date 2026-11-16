import type {
  CinemaDetailDto,
  CinemaDto,
  DayScheduleDto,
  MovieDetailDto,
  MovieFilterQuery,
  MovieSummaryDto,
} from '../../../../packages/contracts/src/index.ts';
import { MovieAgeRating, MovieFormat } from '../../../../packages/contracts/src/index.ts';
import { MOVIES_FIXTURE } from '../features/discovery/model/discovery-fixtures.ts';
import { CHUYEN_TAU_CUOI_HE_FIXTURE } from '../features/movie-details/model/movie-fixtures.ts';
import {
  CINEMA_DIRECTORY_FIXTURES,
  CINEMA_DETAIL_FIXTURES,
} from '../features/cinemas/model/cinema-fixtures.ts';

export function listMovies(query?: MovieFilterQuery): MovieSummaryDto[] {
  let items = MOVIES_FIXTURE.map((m) => {
    const ageRating = (
      ['P', 'K', 'T13', 'T16', 'T18', 'C'].includes(m.ageRating)
        ? m.ageRating
        : MovieAgeRating.T16
    ) as MovieAgeRating;

    const formats = m.format.includes('IMAX')
      ? [MovieFormat.IMAX, MovieFormat.TWO_D]
      : [MovieFormat.TWO_D];

    const dto: MovieSummaryDto = {
      id: m.id,
      slug: m.slug,
      title: m.title,
      posterUrl: m.posterUrl,
      durationMinutes: m.durationMinutes,
      ageRating,
      genres: m.genres,
      formats,
      cineScore: 4.8,
      releaseDate: '2026-11-04',
      status: 'NOW_SHOWING',
    };
    return dto;
  });

  if (query?.q) {
    const qLower = query.q.toLowerCase().trim();
    items = items.filter(
      (m) =>
        m.title.toLowerCase().includes(qLower) ||
        m.slug.toLowerCase().includes(qLower)
    );
  }

  if (query?.genre) {
    const gLower = query.genre.toLowerCase();
    items = items.filter((m) =>
      m.genres.some((g) => g.toLowerCase().includes(gLower))
    );
  }

  return items;
}

export function getMovieByIdOrSlug(idOrSlug: string): MovieDetailDto | null {
  const norm = idOrSlug.toLowerCase().trim();
  if (norm === 'chuyen-tau-cuoi-he' || norm === 'movie-1') {
    const raw = CHUYEN_TAU_CUOI_HE_FIXTURE;
    return {
      id: raw.id,
      slug: raw.slug,
      title: raw.title,
      englishTitle: raw.englishTitle,
      director: raw.director,
      cast: raw.cast.map((c) => ({ name: c.name, role: c.role })),
      synopsis: raw.synopsis,
      durationMinutes: raw.durationMinutes,
      ageRating: MovieAgeRating.T18,
      releaseDate: '2026-11-04',
      genres: raw.genres,
      formats: [MovieFormat.TWO_D, MovieFormat.IMAX_LASER, MovieFormat.DOLBY_ATMOS],
      cineScore: raw.cineScore,
      posterUrl: raw.posterUrl,
      bannerUrl: raw.backdropUrl,
      trailerUrl: raw.trailerUrl,
      status: 'NOW_SHOWING',
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-04T00:00:00.000Z',
      totalShowtimesCount: 18,
    };
  }

  const summary = listMovies().find(
    (m) => m.id.toLowerCase() === norm || m.slug.toLowerCase() === norm
  );

  if (!summary) return null;

  return {
    ...summary,
    director: 'Đạo diễn Minh An',
    cast: [{ name: 'Diễn viên chính', role: 'Nhân vật' }],
    synopsis: `Mô tả tóm tắt cho bộ phim ${summary.title}.`,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-04T00:00:00.000Z',
    totalShowtimesCount: 6,
  };
}

export function listCinemas(): CinemaDto[] {
  return CINEMA_DIRECTORY_FIXTURES.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    address: c.address,
    district: 'Quận 1',
    city: 'Hồ Chí Minh',
    hotline: '1900 6017',
    distanceKm: c.distanceKm,
    isOpen: c.isOpen,
    statusText: c.statusText,
    formats: [MovieFormat.TWO_D, MovieFormat.IMAX],
    imageUrl: c.imageUrl,
    amenities: [
      { id: 'am-1', iconName: 'car', label: 'Bãi đỗ xe' },
      { id: 'am-2', iconName: 'food', label: 'Bắp nước' },
    ],
  }));
}

export function getCinemaByIdOrSlug(idOrSlug: string): CinemaDetailDto | null {
  const norm = idOrSlug.toLowerCase().trim();
  const detail =
    CINEMA_DETAIL_FIXTURES[norm] ||
    Object.values(CINEMA_DETAIL_FIXTURES).find(
      (c) =>
        c.slug.toLowerCase() === norm ||
        c.id.toLowerCase() === norm ||
        norm.includes(c.id.toLowerCase()) ||
        c.id.toLowerCase().includes(norm) ||
        (norm.includes('dong-khoi') && c.id.includes('dong-khoi'))
    );

  if (detail) {
    return {
      id: detail.id,
      name: detail.name,
      slug: detail.slug,
      address: detail.address,
      district: detail.district,
      city: detail.city,
      hotline: detail.hotline,
      distanceKm: detail.distanceKm,
      isOpen: detail.isOpen,
      statusText: detail.statusText,
      formats: [MovieFormat.TWO_D, MovieFormat.IMAX],
      imageUrl: detail.billboardImageUrl,
      billboardImageUrl: detail.billboardImageUrl,
      amenities: detail.amenities.map((a) => ({
        id: a.id,
        iconName: a.iconName,
        label: a.label,
      })),
      auditoriumsCount: 8,
      mapQuery: detail.mapQuery,
    };
  }

  const summary = listCinemas().find(
    (c) =>
      c.id.toLowerCase() === norm ||
      c.slug.toLowerCase() === norm ||
      norm.includes(c.id.toLowerCase()) ||
      c.id.toLowerCase().includes(norm)
  );

  if (!summary) return null;

  return {
    ...summary,
    auditoriumsCount: 8,
    mapQuery: `https://maps.google.com/?q=${encodeURIComponent(summary.address)}`,
  };
}

export function getShowtimes(query?: {
  movieId?: string;
  cinemaId?: string;
  date?: string;
}): DayScheduleDto[] {
  const rawSchedule = CHUYEN_TAU_CUOI_HE_FIXTURE.schedule;

  return rawSchedule.map((day) => ({
    date: day.date,
    dayOfWeek: day.dayOfWeek,
    label: day.label,
    cinemas: day.cinemas
      .filter((c) => !query?.cinemaId || c.cinemaId === query.cinemaId)
      .map((c) => ({
        cinemaId: c.cinemaId,
        cinemaName: c.cinemaName,
        cinemaSlug: c.cinemaSlug,
        address: c.address,
        badge: c.badge,
        slots: c.slots.map((s) => ({
          id: s.id,
          showtimeId: `${c.cinemaId}-${s.id}`,
          time: s.time,
          format: s.format === 'IMAX' ? MovieFormat.IMAX : MovieFormat.TWO_D,
          auditoriumName: s.screen,
          pricing: {
            standardPrice: s.price,
            vipPrice: s.price + 30000,
            sweetboxPrice: (s.price + 30000) * 2,
          },
          availableSeats: s.status === 'almost_full' ? 8 : 42,
          totalSeats: 64,
          status: s.status,
        })),
      })),
  }));
}
