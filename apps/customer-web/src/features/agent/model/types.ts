/**
 * Domain Types for S03 Movie Booking Agent Workspace
 * Features-based architecture & Ferrari Dark Theme specifications
 */

export type MessageSender = 'user' | 'agent';

export type EmbeddedCardType =
  | 'none'
  | 'showtimes'
  | 'seatmap'
  | 'summary'
  | 'payment'
  | 'ticket';

export type BookingStep =
  | 'greeting'
  | 'showtimes'
  | 'seatmap'
  | 'summary'
  | 'payment'
  | 'ticket';

export interface ShowtimeOption {
  id: string;
  time: string;
  room: string;
  format: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
}

export type SeatType = 'standard' | 'vip' | 'couple';
export type SeatStatus = 'available' | 'selected' | 'occupied';

export interface Seat {
  id: string; // e.g. "F5"
  row: string; // e.g. "F"
  col: number; // e.g. 5
  type: SeatType;
  price: number;
  status: SeatStatus;
}

export type PaymentMethod = 'momo' | 'vnpay' | 'card';

export interface TicketInfo {
  bookingCode: string; // e.g. 'CNRA-892401'
  movieTitle: string;
  format: string;
  cinemaName: string;
  hallName: string;
  showtime: string;
  date: string;
  seats: string[];
  totalPrice: number;
  qrDataUrl?: string;
  issuedAt: string;
  status: 'ISSUED';
}

export interface CardDataPayload {
  showtimes?: ShowtimeOption[];
  selectedShowtimeId?: string;
  movieTitle?: string;
  cinemaName?: string;
  hallName?: string;
  roomName?: string;
  showtimeTime?: string;
  seatMatrix?: Seat[][];
  selectedSeats?: string[];
  holdCountdownSeconds?: number;
  totalPrice?: number;
  paymentMethod?: PaymentMethod;
  isProcessingPayment?: boolean;
  ticket?: TicketInfo;
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
  embeddedCardType: EmbeddedCardType;
  cardData?: CardDataPayload;
}

export interface ChatBookingState {
  step: BookingStep;
  movie: string | null;
  cinema: string | null;
  date: string | null;
  selectedShowtime: ShowtimeOption | null;
  selectedSeats: string[];
  holdSecondsLeft: number;
  isHoldActive: boolean;
  totalAmount: number;
  paymentMethod: PaymentMethod | null;
  isPaid: boolean;
  ticket: TicketInfo | null;
  sessionTitle: string;
}

export interface HistorySession {
  id: string;
  title: string;
  date: string;
  preview: string;
  active?: boolean;
}

export interface PromptStarter {
  id: string;
  title: string;
  description: string;
  prompt: string;
}

export interface TrendingMovie {
  id: string;
  title: string;
  format: string;
  rating: string;
  views: string;
  showtime: string;
  price?: string;
  cinema: string;
  remainingTickets: number;
  posterUrl: string;
}
