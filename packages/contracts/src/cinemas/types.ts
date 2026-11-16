import type { MovieFormat, SeatType } from '../common/enums.ts';

export interface AmenityDto {
  id: string;
  iconName: 'car' | 'food' | 'wheelchair' | 'film';
  label: string;
}

export interface CinemaDto {
  id: string;
  name: string;
  slug: string;
  address: string;
  district: string;
  city: string;
  hotline: string;
  distanceKm?: number;
  isOpen: boolean;
  statusText: string;
  formats: MovieFormat[];
  imageUrl: string;
  billboardImageUrl?: string;
  amenities: AmenityDto[];
}

export interface CinemaDetailDto extends CinemaDto {
  auditoriumsCount: number;
  mapQuery?: string;
}

export type AuditoriumType = 'STANDARD' | 'IMAX_LASER' | 'GOLD_CLASS' | 'DOLBY_CINEMA';

/**
 * Single seat structural layout within an auditorium matrix.
 * Standard matrix enforces 64 seats (8 rows A-H x 8 columns 1-8).
 */
export interface AuditoriumSeatConfigDto {
  id: string; // e.g. "A1", "F5", "H1"
  row: string; // "A" - "H"
  col: number; // 1 - 8
  type: SeatType;
  label: string; // e.g. "F5"
  pairId?: string; // For Sweetbox couple seats (e.g. "H1-H2")
  isAccessible?: boolean;
  isMaintenance?: boolean;
}

export interface AuditoriumLayoutDto {
  auditoriumId: string;
  cinemaId: string;
  name: string; // e.g. "Cinema 03 (IMAX Hall)"
  totalRows: number; // default 8
  totalCols: number; // default 8
  totalSeats: number; // default 64
  seats: AuditoriumSeatConfigDto[];
}

export interface AuditoriumDto {
  id: string;
  cinemaId: string;
  name: string;
  type: AuditoriumType;
  totalSeats: number;
  isActive: boolean;
  createdAt: string;
}

/**
 * Organizer Portal DTOs for theater and hall operations.
 */
export interface CreateCinemaRequest {
  name: string;
  slug?: string;
  address: string;
  district: string;
  city: string;
  hotline: string;
  formats: MovieFormat[];
  imageUrl: string;
  billboardImageUrl?: string;
  amenities?: AmenityDto[];
}

export interface CreateAuditoriumRequest {
  cinemaId: string;
  name: string;
  type: AuditoriumType;
  customSeats?: AuditoriumSeatConfigDto[];
}

export interface UpdateSeatMaintenanceRequest {
  auditoriumId: string;
  seatIds: string[];
  isMaintenance: boolean;
  reason?: string;
}
