import type { MovieSearchResult, FilterOption } from './types.ts';

export const SEARCH_MOVIES_FIXTURE: MovieSearchResult[] = [
  {
    id: 'chuyen-tau-cuoi-he',
    title: 'Chuyến tàu cuối hè',
    genre: 'Tâm lý, Tình cảm',
    genres: ['Tâm lý', 'Tình cảm'],
    durationMinutes: 115,
    durationLabel: '115 phút',
    posterUrl: '/images/artworks/poster_chuyen_tau.png',
    formats: ['2D Standard', 'IMAX'],
    cinemas: ['CINORA Đồng Khởi', 'CINORA Landmark'],
    dates: ['04/11', '05/11'],
    rating: 'T16',
    cineScore: '4.9/5',
  },
  {
    id: 'thanh-pho-khong-ngu',
    title: 'Thành phố không ngủ\nvà những người trở về',
    genre: 'Tâm lý, Hành động',
    genres: ['Tâm lý', 'Hành động'],
    durationMinutes: 136,
    durationLabel: '136 phút',
    posterUrl: '/images/artworks/poster_thanh_pho.png',
    formats: ['2D Standard', 'IMAX'],
    cinemas: ['CINORA Đồng Khởi'],
    dates: ['04/11'],
    rating: 'T18',
    cineScore: '4.7/5',
  },
  {
    id: 'ben-kia-bau-troi',
    title: 'Bên kia bầu trời',
    genre: 'Khoa học viễn tưởng',
    genres: ['Khoa học viễn tưởng'],
    durationMinutes: 128,
    durationLabel: '128 phút',
    posterUrl: '/images/artworks/poster_ben_kia.png',
    formats: ['IMAX'],
    cinemas: ['CINORA Landmark'],
    dates: ['05/11'],
    rating: 'P',
    cineScore: '4.8/5',
  },
  {
    id: 'mot-ngay-o-da-lat',
    title: 'Một ngày ở Đà Lạt',
    genre: 'Lãng mạn, Đời thường',
    genres: ['Lãng mạn', 'Đời thường'],
    durationMinutes: 102,
    durationLabel: '102 phút',
    posterUrl: '/images/artworks/poster_mot_ngay.png',
    formats: ['2D Standard'],
    cinemas: ['CINORA Đồng Khởi', 'CINORA Landmark'],
    dates: ['04/11', '05/11'],
    rating: 'T13',
    cineScore: '4.6/5',
  },
];

export const GENRE_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'Tất cả', value: 'Tất cả' },
  { id: 'tam-ly', label: 'Tâm lý', value: 'Tâm lý' },
  { id: 'sci-fi', label: 'Khoa học viễn tưởng', value: 'Khoa học viễn tưởng' },
  { id: 'lang-man', label: 'Lãng mạn', value: 'Lãng mạn' },
];

export const CINEMA_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'Tất cả các rạp', value: 'Tất cả các rạp' },
  { id: 'dong-khoi', label: 'CINORA Đồng Khởi', value: 'CINORA Đồng Khởi' },
  { id: 'landmark', label: 'CINORA Landmark', value: 'CINORA Landmark' },
];

export const FORMAT_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'Tất cả', value: 'Tất cả' },
  { id: '2d', label: '2D Standard', value: '2D Standard' },
  { id: 'imax', label: 'IMAX', value: 'IMAX' },
];

export const DATE_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'Tất cả', value: 'Tất cả' },
  { id: '04-11', label: '04/11', value: '04/11' },
  { id: '05-11', label: '05/11', value: '05/11' },
];

export const SEARCH_SUGGESTIONS = [
  'Chuyến tàu',
  'Thành phố không ngủ',
  'Bên kia bầu trời',
  'Một ngày ở Đà Lạt',
];
