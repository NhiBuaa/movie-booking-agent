export interface CinemaSummary {
  id: string;
  name: string;
  slug: string;
  statusText: string;
  isOpen: boolean;
  address: string;
  distanceKm: number;
  formats: string[];
  imageUrl: string;
}

export interface AmenityItem {
  id: string;
  iconName: 'car' | 'food' | 'wheelchair' | 'film';
  label: string;
}

export interface ShowtimeSlot {
  id: string;
  time: string;
  price: number;
  priceFormatted: string;
  availableSeats: number;
  isHot?: boolean;
}

export interface ShowtimeFormatGroup {
  id: string;
  formatTitle: string;
  hallName: string;
  priceFromFormatted: string;
  slots: ShowtimeSlot[];
}

export interface CinemaMovieShowtime {
  id: string;
  title: string;
  slug: string;
  posterUrl: string;
  ageRating: string;
  durationMinutes: number;
  genres: string[];
  director: string;
  language: string;
  formats: ShowtimeFormatGroup[];
}

export interface CinemaDetail {
  id: string;
  name: string;
  slug: string;
  statusText: string;
  isOpen: boolean;
  address: string;
  district: string;
  city: string;
  distanceKm: number;
  hotline: string;
  mapQuery: string;
  billboardTag: string;
  billboardImageUrl: string;
  amenities: AmenityItem[];
  availableDates: { id: string; label: string; dateStr: string; isActive?: boolean }[];
  movies: CinemaMovieShowtime[];
}
