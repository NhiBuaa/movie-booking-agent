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
import type { CinemaDetail } from '../features/cinemas/model/types.ts';

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
 * Normalizes known cinema IDs and aliases to canonical cinema ID.
 * Returns null if the cinemaId is not recognized (strictly avoids substring false positives).
 */
export function resolveCanonicalCinemaId(rawCinemaId?: string | null): string | null {
  if (!rawCinemaId || typeof rawCinemaId !== 'string') {
    return null;
  }
  const norm = rawCinemaId.trim().toLowerCase();

  // CGV Vincom Dong Khoi aliases
  if (
    norm === 'cgv-dong-khoi' ||
    norm === 'cgv-vincom-dong-khoi' ||
    norm === 'dong-khoi' ||
    norm === 'vincom-dong-khoi'
  ) {
    return 'cgv-dong-khoi';
  }

  // CGV Landmark 81 aliases
  if (
    norm === 'cgv-landmark' ||
    norm === 'cgv-vincom-landmark-81' ||
    norm === 'landmark' ||
    norm === 'landmark-81'
  ) {
    return 'cgv-landmark';
  }

  // BHD Star Bitexco aliases
  if (norm === 'bhd-star-bitexco' || norm === 'bhd-bitexco') {
    return 'bhd-star-bitexco';
  }

  // Galaxy Cinema Nguyen Du aliases
  if (norm === 'galaxy-nguyen-du') {
    return 'galaxy-nguyen-du';
  }

  return null;
}

/**
 * Normalizes user format string to authoritative MovieFormat string or null if invalid.
 */
export function normalizeFormatFilter(rawFormat?: string): string | null {
  if (!rawFormat || typeof rawFormat !== 'string') return null;
  const f = rawFormat.trim().toLowerCase();
  if (f === '2d' || f === 'two_d') return '2D';
  if (f === '3d' || f === 'three_d') return '3D';
  if (f === '4dx' || f === 'four_dx') return '4DX';
  if (f === 'imax') return 'IMAX';
  if (f === 'imax laser' || f === 'imax_laser') return 'IMAX Laser';
  if (f === 'screenx') return 'ScreenX';
  if (f === 'dolby atmos' || f === 'dolby_atmos') return 'Dolby Atmos';
  return null;
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

  // Handle synthetic test alias BK-2026-CHUYENTAU -> maps to slot-dk-04-1 (review requirement)
  const targetLookup = normId === 'bk-2026-chuyentau' ? 'slot-dk-04-1' : normId;

  for (const day of CHUYEN_TAU_CUOI_HE_FIXTURE.schedule) {
    for (const cinema of day.cinemas) {
      const canonicalCinemaId = resolveCanonicalCinemaId(cinema.cinemaId) || cinema.cinemaId.toLowerCase();

      for (const slot of cinema.slots) {
        const slotId = slot.id.toLowerCase();
        const canonicalShowtimeId = `${cinema.cinemaId}-${slot.id}`.toLowerCase();

        // 1. Direct match on slotId alone (e.g. "slot-dk-04-1")
        let isMatch = targetLookup === slotId;

        // 2. Direct match on canonical showtimeId (e.g. "cgv-dong-khoi-slot-dk-04-1")
        if (!isMatch && targetLookup === canonicalShowtimeId) {
          isMatch = true;
        }

        // 3. Match compound ID "<cinemaPrefix>-<slotId>" ONLY IF cinemaPrefix strictly resolves to this cinema
        if (!isMatch && targetLookup.endsWith(`-${slotId}`)) {
          const prefix = targetLookup.slice(0, -(slotId.length + 1));
          const resolvedCinema = resolveCanonicalCinemaId(prefix);
          if (resolvedCinema && resolvedCinema === canonicalCinemaId) {
            isMatch = true;
          }
        }

        if (isMatch) {
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
    const normalizedFilter = normalizeFormatFilter(query.format);
    if (!normalizedFilter) {
      items = [];
    } else {
      items = items.filter((m) =>
        m.formats.some((f) => {
          if (normalizedFilter === 'IMAX') {
            return f.toUpperCase().includes('IMAX');
          }
          return f.toUpperCase() === normalizedFilter.toUpperCase();
        })
      );
    }
  }

  if (query?.status) {
    items = items.filter((m) => m.status === query.status);
  }

  // Relational filter: Cinema showtime availability
  if (query?.cinemaId) {
    const canonicalFilterCinema = resolveCanonicalCinemaId(query.cinemaId);
    if (!canonicalFilterCinema) {
      items = [];
    } else {
      items = items.filter((m) => {
        // In current fixtures, only chuyen-tau-cuoi-he has scheduled showtimes at known cinemas
        if (m.slug === 'chuyen-tau-cuoi-he') {
          return CHUYEN_TAU_CUOI_HE_FIXTURE.schedule.some((day) =>
            day.cinemas.some((c) => {
              const cCanonical = resolveCanonicalCinemaId(c.cinemaId);
              return cCanonical === canonicalFilterCinema;
            })
          );
        }
        return false;
      });
    }
  }

  // Relational filter: Date showtime availability (strict exact match, no substring matching)
  if (query?.date) {
    const targetDate = query.date.trim();
    items = items.filter((m) => {
      if (m.slug === 'chuyen-tau-cuoi-he') {
        return CHUYEN_TAU_CUOI_HE_FIXTURE.schedule.some(
          (day) => day.date === targetDate
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
  if (!idOrSlug || typeof idOrSlug !== 'string') {
    return null;
  }
  const norm = idOrSlug.toLowerCase().trim();

  // 1. Resolve canonical cinema ID from known IDs and aliases
  const canonicalId = resolveCanonicalCinemaId(norm);

  // 2. Lookup in CINEMA_DETAIL_FIXTURES: exact own key, exact canonical match, or exact id/slug
  let detail: CinemaDetail | null = null;
  if (Object.hasOwn(CINEMA_DETAIL_FIXTURES, norm)) {
    detail = CINEMA_DETAIL_FIXTURES[norm];
  } else if (canonicalId && Object.hasOwn(CINEMA_DETAIL_FIXTURES, canonicalId)) {
    detail = CINEMA_DETAIL_FIXTURES[canonicalId];
  } else if (canonicalId) {
    detail =
      Object.values(CINEMA_DETAIL_FIXTURES).find(
        (c) => resolveCanonicalCinemaId(c.id) === canonicalId || resolveCanonicalCinemaId(c.slug) === canonicalId
      ) || null;
  }
  if (!detail) {
    detail =
      Object.values(CINEMA_DETAIL_FIXTURES).find(
        (c) => c.id.toLowerCase() === norm || c.slug.toLowerCase() === norm
      ) || null;
  }

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

  // 3. Fallback to listCinemas() by exact canonical or exact id/slug match only (strictly no substring matching)
  const summary = listCinemas().find(
    (c) =>
      c.id.toLowerCase() === norm ||
      c.slug.toLowerCase() === norm ||
      (canonicalId !== null && (resolveCanonicalCinemaId(c.id) === canonicalId || resolveCanonicalCinemaId(c.slug) === canonicalId))
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
    // Strict exact date match (e.g. "04/11", no substring matching like "2099-04/11")
    rawSchedule = rawSchedule.filter((d) => d.date === qDate);
  }

  return rawSchedule
    .map((day) => {
      let cinemas = day.cinemas;
      if (query?.cinemaId) {
        const canonicalFilterCinema = resolveCanonicalCinemaId(query.cinemaId);
        if (!canonicalFilterCinema) {
          cinemas = [];
        } else {
          cinemas = cinemas.filter((c) => {
            const cCanonical = resolveCanonicalCinemaId(c.cinemaId);
            return cCanonical === canonicalFilterCinema;
          });
        }
      }

      const formattedCinemas = cinemas
        .map((c) => {
          let slots = c.slots;
          if (query?.format) {
            const normalizedFilter = normalizeFormatFilter(query.format);
            if (!normalizedFilter) {
              slots = [];
            } else {
              slots = slots.filter((s) => {
                if (normalizedFilter === 'IMAX' || normalizedFilter === 'IMAX Laser') {
                  return s.format.toUpperCase().includes('IMAX');
                }
                return s.format.toUpperCase() === normalizedFilter.toUpperCase();
              });
            }
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
