import type {
  CinemaDetailDto,
  CinemaDto,
  DayScheduleDto,
  MovieDetailDto,
  MovieFilterQuery,
  MovieStatus,
  MovieSummaryDto,
} from '@platform/contracts';
import { MovieAgeRating, MovieFormat } from '@platform/contracts';
import { MOVIES_FIXTURE } from '../features/discovery/model/discovery-fixtures.ts';
import { CHUYEN_TAU_CUOI_HE_FIXTURE } from '../features/movie-details/model/movie-fixtures.ts';
import {
  CINEMA_DIRECTORY_FIXTURES,
  CINEMA_DETAIL_FIXTURES,
} from '../features/cinemas/model/cinema-fixtures.ts';

export interface ShowtimeSlotDetails {
  showtimeId: string; // Canonical unique inventory ID
  canonicalShowtimeId: string;
  movieId: string;
  movieTitle: string;
  movieSlug: string;
  posterUrl: string;
  durationMinutes: number;
  format: MovieFormat;
  cinemaId: string;
  cinemaName: string;
  auditoriumName: string;
  showDate: string;
  showTime: string;
  pricing: {
    standardPrice: number;
    vipPrice: number;
    sweetboxPrice: number;
  };
}

/**
 * Resolves any showtimeId or alias into the single canonical inventory record.
 * Returns null if the showtimeId does not exist in the catalog (no fake fallback).
 */
export function resolveCanonicalShowtime(showtimeId: string): ShowtimeSlotDetails | null {
  if (!showtimeId || typeof showtimeId !== 'string') {
    return null;
  }

  const normId = showtimeId.trim().toLowerCase();

  // Handle synthetic test alias BK-2026-CHUYENTAU -> maps to cgv-dong-khoi-slot-dk-04-2 (19:30)
  const targetLookup = normId === 'bk-2026-chuyentau' ? 'slot-dk-04-2' : normId;

  for (const day of CHUYEN_TAU_CUOI_HE_FIXTURE.schedule) {
    for (const cinema of day.cinemas) {
      for (const slot of cinema.slots) {
        const canonicalId = `${cinema.cinemaId}-${slot.id}`.toLowerCase();
        const slotId = slot.id.toLowerCase();
        // Known aliases for cinema Dong Khoi
        const dongKhoiFullId = `cgv-vincom-dong-khoi-${slot.id}`.toLowerCase();

        if (
          targetLookup === canonicalId ||
          targetLookup === slotId ||
          targetLookup === dongKhoiFullId ||
          (cinema.cinemaSlug && targetLookup === `${cinema.cinemaSlug}-${slot.id}`.toLowerCase())
        ) {
          const format = slot.format === 'IMAX' ? MovieFormat.IMAX_LASER : MovieFormat.TWO_D;
          return {
            showtimeId: `${cinema.cinemaId}-${slot.id}`,
            canonicalShowtimeId: `${cinema.cinemaId}-${slot.id}`,
            movieId: 'chuyen-tau-cuoi-he',
            movieTitle: CHUYEN_TAU_CUOI_HE_FIXTURE.title,
            movieSlug: CHUYEN_TAU_CUOI_HE_FIXTURE.slug,
            posterUrl: CHUYEN_TAU_CUOI_HE_FIXTURE.posterUrl,
            durationMinutes: CHUYEN_TAU_CUOI_HE_FIXTURE.durationMinutes,
            format,
            cinemaId: cinema.cinemaId,
            cinemaName: cinema.cinemaName,
            auditoriumName: slot.screen,
            showDate: day.date,
            showTime: slot.time,
            pricing: {
              standardPrice: slot.price,
              vipPrice: slot.price + 30000,
              sweetboxPrice: (slot.price + 30000) * 2,
            },
          };
        }
      }
    }
  }

  return null;
}

/**
 * Returns showtime slot details or null if nonexistent.
 */
export function getShowtimeSlotDetails(showtimeId: string): ShowtimeSlotDetails | null {
  return resolveCanonicalShowtime(showtimeId);
}

export function listMovies(query?: MovieFilterQuery): MovieSummaryDto[] {
  let items = MOVIES_FIXTURE.map((m) => {
    const ageRating = (
      ['P', 'K', 'T13', 'T16', 'T18', 'C'].includes(m.ageRating)
        ? m.ageRating
        : MovieAgeRating.T16
    ) as MovieAgeRating;

    let formats: MovieFormat[];
    if (m.format.includes('IMAX')) {
      formats = [MovieFormat.IMAX_LASER, MovieFormat.IMAX, MovieFormat.TWO_D];
    } else if (m.format.includes('3D')) {
      formats = [MovieFormat.THREE_D, MovieFormat.TWO_D];
    } else {
      formats = [MovieFormat.TWO_D];
    }

    const status: MovieStatus = m.status === 'upcoming' ? 'COMING_SOON' : 'NOW_SHOWING';

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
      status,
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
    const gLower = query.genre.toLowerCase().trim();
    items = items.filter((m) =>
      m.genres.some((g) => g.toLowerCase().includes(gLower))
    );
  }

  if (query?.format) {
    const targetFormat = query.format.toLowerCase().trim();
    items = items.filter((m) =>
      m.formats.some((f) => f.toLowerCase().includes(targetFormat) || targetFormat.includes(f.toLowerCase()))
    );
  }

  if (query?.status) {
    items = items.filter((m) => m.status === query.status);
  }

  // Relational filter: Cinema showtime availability
  if (query?.cinemaId) {
    const cId = query.cinemaId.toLowerCase().trim();
    items = items.filter((m) => {
      // In current fixtures, only chuyen-tau-cuoi-he has scheduled showtimes at known cinemas
      if (m.slug === 'chuyen-tau-cuoi-he') {
        return CHUYEN_TAU_CUOI_HE_FIXTURE.schedule.some((day) =>
          day.cinemas.some(
            (c) =>
              c.cinemaId.toLowerCase() === cId ||
              c.cinemaId.toLowerCase().includes(cId) ||
              cId.includes(c.cinemaId.toLowerCase()) ||
              (c.cinemaSlug && (c.cinemaSlug.toLowerCase() === cId || cId.includes(c.cinemaSlug.toLowerCase())))
          )
        );
      }
      return false;
    });
  }

  // Relational filter: Date showtime availability
  if (query?.date) {
    const targetDate = query.date.trim();
    items = items.filter((m) => {
      if (m.slug === 'chuyen-tau-cuoi-he') {
        return CHUYEN_TAU_CUOI_HE_FIXTURE.schedule.some(
          (day) => day.date === targetDate || day.label.includes(targetDate)
        );
      }
      return false;
    });
  }

  if (query?.page && query?.limit) {
    const start = (query.page - 1) * query.limit;
    items = items.slice(start, start + query.limit);
  } else if (query?.limit) {
    items = items.slice(0, query.limit);
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
  format?: MovieFormat;
  status?: string;
}): DayScheduleDto[] {
  // If movieId specified and doesn't match chuyen-tau-cuoi-he, return empty array
  if (query?.movieId) {
    const mId = query.movieId.trim().toLowerCase();
    if (mId !== 'chuyen-tau-cuoi-he' && mId !== 'movie-1') {
      return [];
    }
  }

  let rawSchedule = CHUYEN_TAU_CUOI_HE_FIXTURE.schedule;

  if (query?.date) {
    const qDate = query.date.trim();
    rawSchedule = rawSchedule.filter(
      (d) => d.date === qDate || d.label.includes(qDate) || qDate.includes(d.date)
    );
  }

  return rawSchedule
    .map((day) => {
      let cinemas = day.cinemas;
      if (query?.cinemaId) {
        const cId = query.cinemaId.toLowerCase().trim();
        cinemas = cinemas.filter(
          (c) =>
            c.cinemaId.toLowerCase() === cId ||
            c.cinemaId.toLowerCase().includes(cId) ||
            cId.includes(c.cinemaId.toLowerCase()) ||
            (c.cinemaSlug && (c.cinemaSlug.toLowerCase() === cId || cId.includes(c.cinemaSlug.toLowerCase())))
        );
      }

      const formattedCinemas = cinemas
        .map((c) => {
          let slots = c.slots;
          if (query?.format) {
            const fTarget = query.format.toLowerCase().trim();
            slots = slots.filter((s) => s.format.toLowerCase().includes(fTarget) || fTarget.includes(s.format.toLowerCase()));
          }

          if (query?.status) {
            const sTarget = query.status.toLowerCase().trim();
            slots = slots.filter((s) => s.status.toLowerCase() === sTarget);
          }

          return {
            cinemaId: c.cinemaId,
            cinemaName: c.cinemaName,
            cinemaSlug: c.cinemaSlug,
            address: c.address,
            badge: c.badge,
            slots: slots.map((s) => ({
              id: s.id,
              showtimeId: `${c.cinemaId}-${s.id}`,
              time: s.time,
              format: s.format === 'IMAX' ? MovieFormat.IMAX_LASER : MovieFormat.TWO_D,
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
          };
        })
        .filter((c) => c.slots.length > 0);

      return {
        date: day.date,
        dayOfWeek: day.dayOfWeek,
        label: day.label,
        cinemas: formattedCinemas,
      };
    })
    .filter((day) => day.cinemas.length > 0);
}
