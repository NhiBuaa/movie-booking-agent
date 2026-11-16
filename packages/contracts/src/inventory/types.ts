import type { HoldStatus, MovieFormat, SeatStatus, SeatType } from '../common/enums.ts';

/**
 * Real-time dynamic state of an individual seat for a specific showtime.
 */
export interface SeatStateDto {
  id: string; // e.g. "A1", "F5", "H1"
  row: string; // "A" - "H"
  col: number; // 1 - 8
  label: string; // e.g. "F5"
  type: SeatType;
  status: SeatStatus;
  price: number;
  pairId?: string; // For Sweetbox couple pair coupling
}

/**
 * Full auditorium seatmap with live availability for a showtime.
 */
export interface SeatMapDto {
  showtimeId: string;
  auditoriumId: string;
  auditoriumName: string;
  movieId: string;
  movieTitle: string;
  cinemaName: string;
  format: MovieFormat;
  totalSeats: number; // 64
  availableCount: number;
  seats: SeatStateDto[];
}

/**
 * Atomic All-or-Nothing Hold Request.
 * Enforces F12 constraint: 1 to 6 seats max.
 */
export interface CreateHoldRequest {
  showtimeId: string;
  seatIds: string[]; // 1 to 6 seats
  userId?: string;
  userEmail?: string;
}

export interface HeldSeatItemDto {
  id: string;
  label: string;
  price: number;
  type: SeatType;
}

/**
 * Response when Cinema Core atomically secures seats under a 5-minute TTL hold.
 */
export interface CreateHoldResponse {
  holdId: string;
  showtimeId: string;
  status: HoldStatus;
  holdExpiresAt: number; // Unix timestamp in ms
  holdDurationSeconds: number; // 300 (5 minutes)
  seats: HeldSeatItemDto[];
  totalPrice: number;
}

export interface ReleaseHoldRequest {
  holdId: string;
  reason?: 'USER_CANCELLED' | 'SESSION_TIMEOUT' | 'PAYMENT_EXPIRED';
}

export interface HoldDetailsDto {
  holdId: string;
  showtimeId: string;
  status: HoldStatus;
  holdExpiresAt: number;
  remainingSeconds: number;
  seats: HeldSeatItemDto[];
  totalPrice: number;
}
