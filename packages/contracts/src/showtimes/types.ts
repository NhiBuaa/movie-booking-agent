import type { MovieFormat } from '../common/enums.ts';

export interface ShowtimePricingDto {
  standardPrice: number; // e.g. 100000 VND
  vipPrice: number; // e.g. 130000 VND
  sweetboxPrice: number; // e.g. 250000 VND (pair)
}

export type ShowtimeSlotStatus = 'available' | 'almost_full' | 'sold_out';

export interface ShowtimeSlotDto {
  id: string; // e.g. "slot-1930"
  showtimeId: string;
  time: string; // "19:30"
  format: MovieFormat;
  auditoriumName: string;
  pricing: ShowtimePricingDto;
  availableSeats: number;
  totalSeats: number;
  status: ShowtimeSlotStatus;
  isHot?: boolean;
}

export interface ShowtimeDto {
  id: string;
  movieId: string;
  cinemaId: string;
  auditoriumId: string;
  showDate: string; // "2026-11-04"
  startTime: string; // "19:30"
  endTime: string; // "21:45"
  format: MovieFormat;
  pricing: ShowtimePricingDto;
  isActive: boolean;
  createdAt: string;
}

export interface CinemaShowtimeGroupDto {
  cinemaId: string;
  cinemaName: string;
  cinemaSlug: string;
  address: string;
  badge?: string;
  slots: ShowtimeSlotDto[];
}

export interface DayScheduleDto {
  date: string; // e.g. "04/11"
  dayOfWeek: string; // e.g. "Thứ Tư"
  label: string; // e.g. "HÔM NAY · 04/11"
  cinemas: CinemaShowtimeGroupDto[];
}

/**
 * Organizer Portal DTOs for multi-hall timeline scheduling and conflict checks.
 */
export interface CreateShowtimeRequest {
  movieId: string;
  cinemaId: string;
  auditoriumId: string;
  showDate: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  format: MovieFormat;
  pricing: ShowtimePricingDto;
}

export interface UpdateShowtimeRequest extends Partial<CreateShowtimeRequest> {
  id: string;
}

export interface ScheduleConflictCheckRequest {
  cinemaId: string;
  auditoriumId: string;
  showDate: string;
  startTime: string;
  durationMinutes: number;
  cleaningBufferMinutes?: number; // default 15 minutes
}

export interface ScheduleConflictCheckResult {
  hasConflict: boolean;
  conflictingShowtime?: ShowtimeDto;
  message?: string;
}
