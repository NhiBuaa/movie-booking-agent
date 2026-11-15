export interface MovieItem {
  id: string;
  title: string;
  slug: string;
  format: string;
  ageRating: string;
  durationMinutes: number;
  genres: string[];
  posterUrl: string;
  backdropUrl?: string;
  isHero?: boolean;
  status: 'showing' | 'upcoming';
}

export interface CinemaItem {
  id: string;
  name: string;
  badge: string;
  address: string;
  features: string;
  todayShowtimesCount: number;
  nextShowtime: string;
}

export interface VoucherItem {
  id: string;
  title: string;
  badge: string;
  line1: string;
  line2: string;
  code: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  badge: string;
  rating: string;
  sentiment: string;
  quote: string;
}

export interface QuickBookingSelection {
  cinema: string;
  movie: string;
  date: string;
  showtime: string;
}
