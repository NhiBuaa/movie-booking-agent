export interface TicketData {
  id: string; // e.g. 'MB-2026-000128'
  movieTitle: string;
  movieSlug: string;
  posterUrl: string;
  ageRating: string;
  durationMinutes: number;
  durationFormatted: string;
  format: string; // e.g. 'IMAX 2D'
  hallName: string; // e.g. 'Cinema 03 (IMAX Hall)'
  cinemaName: string; // e.g. 'CGV Vincom Đồng Khởi'
  showDate: string; // e.g. 'Hôm nay, Thứ Sáu 07/11/2026'
  showtime: string; // e.g. '20:00 - 22:46'
  seats: string[]; // e.g. ['G7', 'G8']
  seatType: string; // e.g. 'VIP'
  comboDescription?: string;
  comboCode?: string;
  totalPaid: number;
  totalPaidFormatted: string;
  status: 'upcoming' | 'past' | 'cancelled';
  statusBadge: string;
  isReadyForCheckin?: boolean;
}
