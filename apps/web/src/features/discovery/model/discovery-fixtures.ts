import type { MovieItem, CinemaItem, VoucherItem, ReviewItem } from './types.ts';

export const MOVIES_FIXTURE: MovieItem[] = [
  {
    id: 'movie-1',
    title: 'Chuyến tàu cuối hè',
    slug: 'chuyen-tau-cuoi-he',
    format: 'IMAX 2D',
    ageRating: 'T18',
    durationMinutes: 115,
    genres: ['Tâm lý', 'Tình cảm'],
    posterUrl: '/images/artworks/train-chuyen-tau-cuoi-he.png',
    backdropUrl: '/images/artworks/train-chuyen-tau-cuoi-he.png',
    isHero: true,
    status: 'showing',
  },
  {
    id: 'movie-2',
    title: 'Thành phố không ngủ',
    slug: 'thanh-pho-khong-ngu',
    format: '2D Digital',
    ageRating: 'T16',
    durationMinutes: 128,
    genres: ['Hành động', 'Bí ẩn'],
    posterUrl: '/images/artworks/city-thanh-pho-khong-ngu.png',
    status: 'showing',
  },
  {
    id: 'movie-3',
    title: 'Bên kia bầu trời',
    slug: 'ben-kia-bau-troi',
    format: '2D Lồng tiếng',
    ageRating: 'P',
    durationMinutes: 104,
    genres: ['Hoạt hình', 'Gia đình'],
    posterUrl: '/images/artworks/sky-ben-kia-bau-troi.png',
    status: 'showing',
  },
  {
    id: 'movie-4',
    title: 'Một ngày ở Đà Lạt',
    slug: 'mot-ngay-o-da-lat',
    format: '2D Phụ đề',
    ageRating: 'T13',
    durationMinutes: 98,
    genres: ['Lãng mạn', 'Hài hước'],
    posterUrl: '/images/artworks/dalat-mot-ngay-o-da-lat.png',
    status: 'showing',
  },
  {
    id: 'movie-5',
    title: 'Vùng đất câm lặng: Ngày một',
    slug: 'vung-dat-cam-lang',
    format: 'IMAX Laser',
    ageRating: 'T16',
    durationMinutes: 100,
    genres: ['Kinh dị', 'Khoa học viễn tưởng'],
    posterUrl: '/images/artworks/city-thanh-pho-khong-ngu.png',
    status: 'upcoming',
  },
  {
    id: 'movie-6',
    title: 'Kẻ trộm mặt trăng 4',
    slug: 'ke-trom-mat-trang-4',
    format: '3D Digital',
    ageRating: 'P',
    durationMinutes: 95,
    genres: ['Hoạt hình', 'Hài hước'],
    posterUrl: '/images/artworks/sky-ben-kia-bau-troi.png',
    status: 'upcoming',
  },
];

export const CINEMAS_FIXTURE: CinemaItem[] = [
  {
    id: 'cinema-landmark-81',
    name: 'CINORA LANDMARK 81',
    badge: 'IMAX',
    address: 'Vincom Landmark 81, Bình Thạnh',
    features: 'Màn chiếu 22m · Âm thanh 12 kênh · Ghế VIP',
    todayShowtimesCount: 32,
    nextShowtime: '18:30',
  },
  {
    id: 'cinema-dong-khoi',
    name: 'CINORA ĐỒNG KHỞI',
    badge: 'LUXURY',
    address: 'Vincom Center Đồng Khởi, Quận 1',
    features: 'Dolby Atmos · Giường đôi Sweetbox · F&B',
    todayShowtimesCount: 28,
    nextShowtime: '19:00',
  },
  {
    id: 'cinema-thao-dien',
    name: 'CINORA THẢO ĐIỀN',
    badge: 'SCREENX',
    address: 'Vincom Mega Mall Thảo Điền, TP. Thủ Đức',
    features: 'Màn chiếu 270° · Hiệu ứng đa giác quan 4D',
    todayShowtimesCount: 24,
    nextShowtime: '18:45',
  },
];

export const VOUCHERS_FIXTURE: VoucherItem[] = [
  {
    id: 'voucher-wednesday',
    title: 'THỨ TƯ VUI VẺ',
    badge: 'ĐỒNG GIÁ 65K',
    line1: 'Áp dụng vé 2D thứ 4 toàn hệ thống · HSD: 31/12/2026',
    line2: 'Đã nhận 84% · Áp dụng mọi suất chiếu tiêu chuẩn',
    code: 'HAPPYWED',
  },
  {
    id: 'voucher-student',
    title: 'HỌC SINH / SINH VIÊN',
    badge: '79K',
    line1: 'Combo 1 Vé + 1 Bắp ngọt khi xuất trình thẻ HSSV',
    line2: 'HSD: 31/12/2026 · Áp dụng tất cả các ngày trong tuần',
    code: 'STUDENT79',
  },
  {
    id: 'voucher-vnpay',
    title: 'VÍ VNPAY',
    badge: 'HOÀN TIỀN 20K',
    line1: 'Hoàn ngay 20.000 đ cho đơn từ 150K qua ví VNPAY',
    line2: 'HSD: 30/11/2026 · Còn 680 lượt ưu đãi hôm nay',
    code: 'VNPAY20',
  },
];

export const REVIEWS_FIXTURE: ReviewItem[] = [
  {
    id: 'review-1',
    author: 'Hoàng Nam',
    badge: 'Đã xem tại IMAX Landmark 81',
    rating: '5.0 / 5.0',
    sentiment: 'Rất hài lòng',
    quote: '"Kịch bản Chuyến tàu cuối hè quá cảm động, hiệu ứng âm thanh 12 kênh làm rung từng nhịp thở!"',
  },
  {
    id: 'review-2',
    author: 'Thanh Vy',
    badge: 'Đã đặt qua Buaa AI',
    rating: '5.0 / 5.0',
    sentiment: 'Rất hài lòng',
    quote: '"Trợ lý Buaa AI tự động gợi ý cặp ghế VIP G7-G8 cực nhanh, giữ chỗ 10 phút rất an tâm!"',
  },
];

export const QUICK_BOOKING_OPTIONS = {
  cinemas: [
    { id: 'cinema-1', name: 'Cinora Landmark 81' },
    { id: 'cinema-2', name: 'Cinora Đồng Khởi' },
    { id: 'cinema-3', name: 'Cinora Thảo Điền' },
  ],
  movies: [
    { id: 'movie-1', name: 'Chuyến Tàu Cuối Hè' },
    { id: 'movie-2', name: 'Một Ngày Ở Đà Lạt' },
    { id: 'movie-3', name: 'Thành Phố Không Ngủ' },
  ],
  dates: [
    { id: 'date-1', label: 'T7 · 07/11/2026' },
    { id: 'date-2', label: 'CN · 08/11/2026' },
    { id: 'date-3', label: 'T2 · 09/11/2026' },
  ],
  showtimes: [
    { id: 'st-1', label: '10:30 · 2D Phụ đề' },
    { id: 'st-2', label: '14:45 · 2D Phụ đề' },
    { id: 'st-3', label: '18:30 · IMAX Laser' },
  ],
};
