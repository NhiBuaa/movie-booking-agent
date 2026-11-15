import type { CinemaDetail, CinemaSummary } from './types.ts';

export const CINEMA_DIRECTORY_FIXTURES: CinemaSummary[] = [
  {
    id: 'cgv-vincom-dong-khoi',
    name: 'CGV Vincom Đồng Khởi',
    slug: 'cgv-vincom-dong-khoi',
    statusText: 'Đang mở cửa',
    isOpen: true,
    address: 'Tầng 3, Vincom Center, 72 Lê Thánh Tôn, Quận 1',
    distanceKm: 1.2,
    formats: ['IMAX Laser', 'Gold Class', 'Dolby 7.1'],
    imageUrl: '/images/cinemas/cgv-dong-khoi-lounge.png',
  },
  {
    id: 'bhd-star-bitexco',
    name: 'BHD Star Cineplex Bitexco',
    slug: 'bhd-star-bitexco',
    statusText: 'Đang mở cửa',
    isOpen: true,
    address: 'Tầng 3 & 4, Bitexco Financial Tower, Quận 1',
    distanceKm: 2.0,
    formats: ['2D / 3D', 'First Class'],
    imageUrl: '/images/cinemas/bhd-bitexco-lobby.png',
  },
  {
    id: 'galaxy-nguyen-du',
    name: 'Galaxy Cinema Nguyễn Du',
    slug: 'galaxy-nguyen-du',
    statusText: 'Đang mở cửa',
    isOpen: true,
    address: '116 Nguyễn Du, Quận 1',
    distanceKm: 2.5,
    formats: ['Dolby Atmos', 'Premium Seat'],
    imageUrl: '/images/cinemas/galaxy-nguyen-du-hall.png',
  },
];

export const CINEMA_DETAIL_FIXTURES: Record<string, CinemaDetail> = {
  'cgv-vincom-dong-khoi': {
    id: 'cgv-vincom-dong-khoi',
    name: 'CGV Vincom Đồng Khởi',
    slug: 'cgv-vincom-dong-khoi',
    statusText: 'Đang mở cửa · Đón khách',
    isOpen: true,
    address: 'Tầng 3, Vincom Center, 72 Lê Thánh Tôn, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    distanceKm: 1.2,
    hotline: '1900 6017',
    mapQuery: 'https://maps.google.com/?q=CGV+Vincom+Dong+Khoi',
    billboardTag: 'CINEMA LOUNGE · VINCOM ĐỒNG KHỞI',
    billboardImageUrl: '/images/cinemas/cgv-dong-khoi-billboard.png',
    amenities: [
      { id: 'amen-1', iconName: 'car', label: 'Bãi giữ xe ô tô & xe máy' },
      { id: 'amen-2', iconName: 'food', label: 'Quầy bắp nước Concessions' },
      { id: 'amen-3', iconName: 'wheelchair', label: 'Lối đi cho người khuyết tật' },
      { id: 'amen-4', iconName: 'film', label: 'Phòng chiếu IMAX Laser & Gold Class' },
    ],
    availableDates: [
      { id: 'd1', label: 'Hôm nay (07/11)', dateStr: '07/11/2026', isActive: true },
      { id: 'd2', label: 'Ngày mai (08/11)', dateStr: '08/11/2026' },
      { id: 'd3', label: 'Thứ Bảy (09/11)', dateStr: '09/11/2026' },
      { id: 'd4', label: 'Chủ Nhật (10/11)', dateStr: '10/11/2026' },
    ],
    movies: [
      {
        id: 'dune-part-two',
        title: 'Dune: Part Two',
        slug: 'dune-part-two',
        posterUrl: '/images/artworks/poster_thanh_pho_khong_ngu.png',
        ageRating: 'T16',
        durationMinutes: 166,
        genres: ['Hành động', 'Viễn tưởng'],
        director: 'Denis Villeneuve',
        language: 'Phụ đề tiếng Việt',
        formats: [
          {
            id: 'fmt-1',
            formatTitle: 'IMAX 2D · Phụ đề tiếng Việt',
            hallName: 'Phòng chiếu IMAX Laser',
            priceFromFormatted: 'Giá từ 160.000 đ',
            slots: [
              { id: 'slot-1', time: '13:30', price: 160000, priceFormatted: '160.000 đ', availableSeats: 48 },
              { id: 'slot-2', time: '16:45', price: 160000, priceFormatted: '160.000 đ', availableSeats: 26 },
              { id: 'slot-3', time: '20:00', price: 160000, priceFormatted: '160.000 đ', availableSeats: 12, isHot: true },
            ],
          },
          {
            id: 'fmt-2',
            formatTitle: 'Standard 2D · Phụ đề tiếng Việt',
            hallName: 'Phòng Cinema 03',
            priceFromFormatted: 'Giá từ 95.000 đ',
            slots: [
              { id: 'slot-4', time: '14:15', price: 95000, priceFormatted: '95.000 đ', availableSeats: 64 },
              { id: 'slot-5', time: '18:00', price: 95000, priceFormatted: '95.000 đ', availableSeats: 30 },
              { id: 'slot-6', time: '21:15', price: 95000, priceFormatted: '95.000 đ', availableSeats: 18, isHot: true },
            ],
          },
        ],
      },
      {
        id: 'chuyen-tau-cuoi-he',
        title: 'Chuyến Tàu Cuối Hè',
        slug: 'chuyen-tau-cuoi-he',
        posterUrl: '/images/artworks/poster_chuyen_tau_cuoi_he.png',
        ageRating: 'P',
        durationMinutes: 110,
        genres: ['Hoạt hình', 'Gia đình'],
        director: 'Minh An',
        language: 'Lồng tiếng & Phụ đề',
        formats: [
          {
            id: 'fmt-3',
            formatTitle: 'Standard 2D · Lồng tiếng tiếng Việt',
            hallName: 'Phòng Cinema 02 (Tầng 3)',
            priceFromFormatted: 'Giá từ 90.000 đ',
            slots: [
              { id: 'slot-7', time: '10:00', price: 90000, priceFormatted: '90.000 đ', availableSeats: 52 },
              { id: 'slot-8', time: '15:20', price: 90000, priceFormatted: '90.000 đ', availableSeats: 38 },
              { id: 'slot-9', time: '19:30', price: 90000, priceFormatted: '90.000 đ', availableSeats: 8, isHot: true },
            ],
          },
        ],
      },
    ],
  },
};

export const getCinemaById = (id: string): CinemaDetail | undefined => {
  return CINEMA_DETAIL_FIXTURES[id];
};
