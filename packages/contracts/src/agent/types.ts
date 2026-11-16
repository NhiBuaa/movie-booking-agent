import type { MovieFormat, PaymentMethod } from '../common/enums.ts';
import type { SeatMapDto, CreateHoldResponse } from '../inventory/types.ts';
import type { MovieSummaryDto } from '../movies/types.ts';
import type { PaymentIntentResponse } from '../orders/types.ts';
import type { DayScheduleDto } from '../showtimes/types.ts';
import type { ETicketDto } from '../tickets/types.ts';

export type AgentStep =
  | 'greeting'
  | 'showtimes'
  | 'seatmap'
  | 'summary'
  | 'payment'
  | 'ticket';

/**
 * Tool 1: Search and discover movies based on natural language constraints.
 */
export interface SearchMoviesToolParams {
  query?: string;
  genre?: string;
  date?: string;
  cinemaId?: string;
  format?: MovieFormat;
}

export interface SearchMoviesToolResult {
  movies: MovieSummaryDto[];
  totalFound: number;
}

/**
 * Tool 2: Get available showtime schedules for a selected movie.
 */
export interface GetShowtimesToolParams {
  movieId: string;
  date?: string;
  cinemaId?: string;
}

export interface GetShowtimesToolResult {
  movieId: string;
  movieTitle: string;
  schedules: DayScheduleDto[];
}

/**
 * Tool 3: Get live seat map matrix for a specific showtime.
 */
export interface GetSeatMapToolParams {
  showtimeId: string;
}

export interface GetSeatMapToolResult {
  seatMap: SeatMapDto;
}

/**
 * Tool 4: Request atomic hold on selected seats with 5-minute TTL.
 */
export interface HoldSeatsToolParams {
  showtimeId: string;
  seatIds: string[];
  userEmail?: string;
}

export interface HoldSeatsToolResult {
  success: boolean;
  hold?: CreateHoldResponse;
  error?: string;
}

/**
 * Tool 5: Initialize payment intent with selected payment provider.
 */
export interface CreatePaymentIntentToolParams {
  bookingId: string;
  paymentMethod: PaymentMethod;
}

export interface CreatePaymentIntentToolResult {
  paymentIntent: PaymentIntentResponse;
}

/**
 * Tool 6: Check verified ticket issuance status from Cinema Core.
 */
export interface GetTicketStatusToolParams {
  bookingId: string;
}

export interface GetTicketStatusToolResult {
  isConfirmed: boolean;
  ticket?: ETicketDto;
  statusText: string;
}
