/**
 * Domain types for S08 — Seat Selection & Hold Activation
 * Complies with Ferrari Dark Design Tokens, F12 constraint (1-6 seats),
 * and features-based frontend architecture.
 */

export type SeatType = 'standard' | 'vip' | 'sweetbox';

export type SeatStatus = 'available' | 'selected' | 'reserved' | 'held';

export interface Seat {
  id: string; // e.g. "A1", "H7", "J1"
  row: string; // "A", "B", ... "K"
  number: number; // 1 .. 12
  type: SeatType;
  status: SeatStatus;
  price: number;
  label: string;
  pairId?: string; // For Sweetbox double-seat couples (e.g. "J1-J2")
}

export interface BookingSessionState {
  movieId: string;
  showtimeId: string;
  selectedSeatIds: string[];
  maxSeats: number;
  holdExpiresAt?: number;
  totalPrice: number;
  movieTitle?: string;
  cinemaName?: string;
  roomName?: string;
  showtimeText?: string;
  format?: string;
  durationMinutes?: number;
  ageRating?: string;
  posterUrl?: string;
}

export interface SeatToggleResult {
  selectedIds: string[];
  error?: string;
}

export interface ShowtimeDetails {
  movieId: string;
  showtimeId: string;
  movieTitle: string;
  format: string;
  cinemaName: string;
  roomName: string;
  showtimeText: string;
  durationMinutes: number;
  ageRating: string;
  posterUrl: string;
}
