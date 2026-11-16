import type { UserRole } from '../common/enums.ts';

export interface UserProfileDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  avatarUrl?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  twoFactorAuthEnabled?: boolean;
  createdAt: string;
}

export type CineMemberTier = 'STANDARD' | 'VIP' | 'CINEGOLD_VIP';

export interface CineMemberProfileDto {
  memberCode: string; // e.g. "CINE-88910-VN"
  tier: CineMemberTier;
  currentPoints: number;
  totalSpent: number;
  expiresDate?: string;
}

export interface CinePreferencesDto {
  defaultCinemaId?: string;
  autoPreferredCinema: boolean;
  preferredGenres: string[];
  preferredShowtimeSlots: string[];
  preferredFormats: string[];
  preferredSeatPosition: 'front' | 'center_vip' | 'rear';
  learnFromTicketHistory: boolean;
  showtimeReminders: boolean;
}

export interface AuthSessionDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
  user: UserProfileDto;
}

export interface LoginRequest {
  identifier: string; // email or phone number
  password?: string;
  otp?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
