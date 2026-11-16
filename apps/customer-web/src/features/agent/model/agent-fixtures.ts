/**
 * Fixture Data for S03 Movie Booking Agent Workspace
 * Dialogue steps, mock seat matrices, showtime data, history sessions, and trending movies.
 */

import type {
  HistorySession,
  PromptStarter,
  TrendingMovie,
  ShowtimeOption,
  Seat,
  TicketInfo,
} from './types.ts';

export const AGENT_HISTORY_SESSIONS: HistorySession[] = [
  {
    id: 'session-1',
    title: 'Phim tối thứ bảy',
    date: 'Hôm nay, 18:45',
    preview: 'Đặt 2 vé Chuyến tàu cuối hè tại CGV Đồng Khởi...',
    active: true,
  },
  {
    id: 'session-2',
    title: 'Tìm rạp gần Quận 1',
    date: 'Hôm qua, 20:15',
    preview: 'Các cụm rạp có phòng chiếu IMAX Laser...',
  },
  {
    id: 'session-3',
    title: 'Suất chiếu Chủ Nhật',
    date: '03/11/2026',
    preview: 'Tìm suất chiếu buổi sáng cho gia đình...',
  },
];

export const AGENT_PROMPT_STARTERS: PromptStarter[] = [
  {
    id: 'prompt-1',
    title: '“Tìm 2 vé IMAX tối thứ Bảy cho Chuyến tàu...”',
    description: 'Lọc rạp có màn chiếu IMAX & gợi ý ghế VIP hàng giữa',
    prompt: 'Tìm 2 vé IMAX tối thứ Bảy cho phim Chuyến tàu cuối hè tại CGV Đồng Khởi nhé',
  },
  {
    id: 'prompt-2',
    title: '“Tìm cụm rạp gần Quận 1 còn suất sau 20:00”',
    description: 'Định vị rạp gần nhất, kiểm tra ghế trống thời gian thực',
    prompt: 'Tìm cụm rạp gần Quận 1 còn suất chiếu sau 20:00 tối nay',
  },
  {
    id: 'prompt-3',
    title: '“Gợi ý phim hoạt hình cuối tuần cho gia đình”',
    description: 'Lọc phim nhãn P/K, suất ban ngày kèm combo bắp nước',
    prompt: 'Gợi ý phim hoạt hình cuối tuần phù hợp cho gia đình có trẻ nhỏ',
  },
  {
    id: 'prompt-4',
    title: '“Kiểm tra ví voucher và đặt vé suất khuya giá tốt”',
    description: 'Tự động áp dụng mã giảm 50k & tích lũy điểm CineMember',
    prompt: 'Kiểm tra ví voucher của tôi và tìm vé suất khuya giá tốt nhất',
  },
];

export const AGENT_QUICK_PILLS: string[] = [
  'Suất chiếu hôm nay',
  'Rạp gần tôi',
  'Phim đang hot',
  'Đặt vé Chuyến tàu cuối hè',
];

export const AGENT_TOPIC_PILLS = [
  { id: 'concessions', label: 'BẮP & NƯỚC', icon: '/icons/film.svg' },
  { id: 'vouchers', label: 'VÍ VOUCHER', icon: '/icons/ticket.svg' },
  { id: 'cinemas', label: 'HỆ THỐNG RẠP', icon: '/icons/building.svg' },
];

export const AGENT_TRENDING_MOVIES: TrendingMovie[] = [
  {
    id: 'chuyen-tau-cuoi-he',
    title: 'Chuyến Tàu Cuối Hè',
    format: 'IMAX LASER · T18',
    rating: '4.8',
    views: '1.250 xem',
    showtime: '18:30 · 160.000 đ',
    cinema: 'Đồng Khởi · Còn 42 vé',
    remainingTickets: 42,
    posterUrl: '/images/artworks/poster_chuyen_tau.png',
  },
  {
    id: 'vung-dat-huyen-bi',
    title: 'Vùng Đất Huyền Bí',
    format: '2D PHỤ ĐỀ · P',
    rating: '4.6',
    views: '980 xem',
    showtime: '19:15 · 110.000 đ',
    cinema: 'Landmark · Còn 28 vé',
    remainingTickets: 28,
    posterUrl: '/images/artworks/sky-ben-kia-bau-troi.png',
  },
  {
    id: 'tham-tu-dai-tai',
    title: 'Thám Tử Đại Tài',
    format: 'VIP GOLD · T16',
    rating: '4.7',
    views: '820 xem',
    showtime: '20:00 · 180.000 đ',
    cinema: 'Thảo Điền · Còn 56 vé',
    remainingTickets: 56,
    posterUrl: '/images/artworks/city-thanh-pho-khong-ngu.png',
  },
];

export const AGENT_SHOWTIME_FIXTURES: ShowtimeOption[] = [
  {
    id: 'st-1930',
    time: '19:30',
    room: 'Phòng 01 (Laser)',
    format: 'IMAX Laser',
    price: 120000,
    availableSeats: 42,
    totalSeats: 64,
  },
  {
    id: 'st-2045',
    time: '20:45',
    room: 'Phòng 03 (Laser)',
    format: 'IMAX Laser',
    price: 120000,
    availableSeats: 28,
    totalSeats: 64,
  },
  {
    id: 'st-2215',
    time: '22:15',
    room: 'Phòng 02 (Standard)',
    format: '2D Digital',
    price: 110000,
    availableSeats: 50,
    totalSeats: 64,
  },
];

/**
 * Builds the standard 8x8 matrix (64 seats) matching S08 specs:
 * Rows A-D: Standard (110.000 đ)
 * Rows E-G: VIP (120.000 đ)
 * Row H: Couple / Deluxe (200.000 đ)
 * Occupied seats: E4, E5, F4, G4, G5
 */
export function createDefaultSeatMatrix(selectedSeatIds: string[] = []): Seat[][] {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const occupiedSet = new Set(['E4', 'E5', 'F4', 'G4', 'G5']);
  const selectedSet = new Set(selectedSeatIds);

  return rows.map((row) => {
    let type: Seat['type'] = 'standard';
    let price = 110000;
    if (['E', 'F', 'G'].includes(row)) {
      type = 'vip';
      price = 120000;
    } else if (row === 'H') {
      type = 'couple';
      price = 200000;
    }

    return Array.from({ length: 8 }, (_, idx) => {
      const col = idx + 1;
      const id = `${row}${col}`;
      let status: Seat['status'] = 'available';

      if (occupiedSet.has(id)) {
        status = 'occupied';
      } else if (selectedSet.has(id)) {
        status = 'selected';
      }

      return {
        id,
        row,
        col,
        type,
        price,
        status,
      };
    });
  });
}

export const SAMPLE_ISSUED_TICKET: TicketInfo = {
  bookingCode: 'CNRA-892401',
  movieTitle: 'Chuyến Tàu Cuối Hè',
  format: 'IMAX Laser 2D',
  cinemaName: 'CGV Đồng Khởi',
  hallName: 'Phòng Chiếu 01',
  showtime: '19:30',
  date: 'Hôm nay (Tối thứ Bảy)',
  seats: ['F5', 'F6'],
  totalPrice: 240000,
  issuedAt: '19:35 · 09/11/2026',
  status: 'ISSUED',
};
