/**
 * S27 - User Profile & CinePreferences Types & Default State
 * Aligned with Figma Node 593:1014 (W: 1440, H: 1444)
 */

export interface PersonalInfoState {
  fullName: string;
  phone: string;
  isPhoneVerified: boolean;
  email: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  twoFactorAuth: boolean;
  passwordLastChangedDays: number;
}

export interface CinePreferencesState {
  defaultCinemaId: string;
  autoPreferredCinema: boolean;
  preferredGenres: string[];
  preferredShowtimeSlots: string[];
  preferredFormats: string[];
  preferredSeatPosition: 'front' | 'center_vip' | 'rear';
  learnFromTicketHistory: boolean;
  showtimeReminders: boolean;
  lastSyncedTimestamp: string;
}

export const DEFAULT_PERSONAL_INFO: PersonalInfoState = {
  fullName: 'Nguyễn Minh An',
  phone: '0908 123 890',
  isPhoneVerified: true,
  email: 'nhibuaa@cinora.vn',
  dateOfBirth: '18/09/1998',
  gender: 'male',
  twoFactorAuth: true,
  passwordLastChangedDays: 45,
};

export const DEFAULT_CINE_PREFERENCES: CinePreferencesState = {
  defaultCinemaId: 'cgv-dong-khoi',
  autoPreferredCinema: true,
  preferredGenres: ['tam-ly', 'sci-fi', 'hanh-dong'],
  preferredShowtimeSlots: ['slot-evening'],
  preferredFormats: ['imax-laser', 'standard-2d'],
  preferredSeatPosition: 'center_vip',
  learnFromTicketHistory: true,
  showtimeReminders: true,
  lastSyncedTimestamp: '5 phút trước (V2.4)',
};

export const CINEMA_OPTIONS = [
  { id: 'cgv-dong-khoi', name: 'CGV Vincom Đồng Khởi — Tầng 3, 72 Lê Thánh Tôn, Quận 1 (Gần bạn nhất)' },
  { id: 'cgv-landmark', name: 'CGV Landmark 81 — Tầng B1, Vincom Landmark 81, Bình Thạnh' },
  { id: 'bhd-bitexco', name: 'BHD Star Bitexco — Tầng 3 & 4, Bitexco Financial Tower, Quận 1' },
  { id: 'galaxy-nguyen-du', name: 'Galaxy Nguyễn Du — 116 Nguyễn Du, Bến Thành, Quận 1' },
  { id: 'lotte-nam-sai-gon', name: 'Lotte Cinema Nam Sài Gòn — Tầng 3, Lotte Mart, Quận 7' },
];

export const GENRE_OPTIONS = [
  { id: 'tam-ly', label: 'Tâm lý, Tình cảm' },
  { id: 'sci-fi', label: 'Khoa học viễn tưởng' },
  { id: 'hanh-dong', label: 'Hành động' },
  { id: 'hoat-hinh', label: 'Hoạt hình' },
  { id: 'kinh-di', label: 'Kinh dị, Giật gân' },
  { id: 'hai-huoc', label: 'Hài hước' },
  { id: 'tai-lieu', label: 'Tài liệu' },
  { id: 'am-nhac', label: 'Âm nhạc / Nhạc kịch' },
];

export const SHOWTIME_SLOT_OPTIONS = [
  { id: 'slot-morning', label: 'Suất sáng (09:00 - 12:00)' },
  { id: 'slot-afternoon', label: 'Suất chiều (13:00 - 17:00)' },
  { id: 'slot-evening', label: 'Suất tối (18:00 - 21:00) (Ưu tiên)' },
  { id: 'slot-night', label: 'Suất đêm (Sau 21:30)' },
];

export const FORMAT_OPTIONS = [
  { id: 'imax-laser', label: 'IMAX Laser' },
  { id: 'standard-2d', label: 'Standard 2D Phụ đề' },
  { id: '3d-digital', label: '3D Digital' },
  { id: '4dx', label: '4DX' },
];

export const SEAT_POSITION_OPTIONS = [
  { id: 'front', label: 'Hàng đầu (Gần màn hình)' },
  { id: 'center_vip', label: 'Trung tâm VIP (Hàng F, G, H) (Ưu tiên)' },
  { id: 'rear', label: 'Hàng cuối (Ghế đôi Sweetbox)' },
];
