/**
 * Movie Media Fixtures (S22A Trailers & S22B Photo Gallery)
 * Aligned with Figma Frame 576:824 (S22A) & Frame 580:884 (S22B)
 */

export interface MovieVideoItem {
  id: string;
  title: string;
  category: 'trailer' | 'teaser' | 'bts' | 'interview';
  duration: string;
  durationSeconds: number;
  thumbnailUrl: string;
  videoUrl: string;
  officialTitle: string;
  credits: string;
  synopsis: string;
  resolutions: string[];
  hasCaptions: boolean;
}

export interface MoviePhotoItem {
  id: string;
  title: string;
  category: 'stills' | 'bts' | 'posters';
  categoryLabel: string;
  imageUrl: string;
  width: number;
  height: number;
  column: number; // 1 to 5 (corresponds to Figma mosaic columns)
  dimensionsText: string;
  caption: string;
  isHero?: boolean;
}

export const S22A_VIDEO_PLAYLIST: MovieVideoItem[] = [
  {
    id: 'video-1',
    title: 'Trailer chính thức',
    category: 'trailer',
    duration: '02:18',
    durationSeconds: 138,
    thumbnailUrl: '/images/artworks/backdrop_chuyen_tau_cuoi_he.png',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    officialTitle: 'CHUYẾN TÀU CUỐI HÈ — OFFICIAL TRAILER (IMAX 2D)',
    credits: 'Đạo diễn: Trần Hữu Tấn · Diễn viên: Hoàng Hà, Quốc Anh, NSƯT Hữu Châu · Âm nhạc: Đức Trí',
    synopsis:
      'Một chuyến tàu định mệnh xuyên qua màn đêm mùa hạ, nơi những bí mật và ký ức ngủ vùi dần được đánh thức qua từng trạm dừng chân đầy xúc cảm.',
    resolutions: ['4K Ultra HD', '1080p Full HD', '720p HD', 'Tự động'],
    hasCaptions: true,
  },
  {
    id: 'video-2',
    title: 'Teaser Trailer',
    category: 'teaser',
    duration: '01:05',
    durationSeconds: 65,
    thumbnailUrl: '/images/artworks/city-thanh-pho-khong-ngu.png',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    officialTitle: 'CHUYẾN TÀU CUỐI HÈ — FIRST LOOK TEASER',
    credits: 'Đạo diễn: Trần Hữu Tấn · Giám đốc hình ảnh (DOP): Dominic Pereira',
    synopsis:
      'Những thước phim teaser đầu tiên hé lộ không gian hoài niệm của sân ga thập niên 90 và cuộc hội ngộ bất ngờ sau 5 năm cách biệt giữa hai nhân vật chính.',
    resolutions: ['1080p Full HD', '720p HD', 'Tự động'],
    hasCaptions: true,
  },
  {
    id: 'video-3',
    title: 'Hậu trường sản xuất (BTS)',
    category: 'bts',
    duration: '04:42',
    durationSeconds: 282,
    thumbnailUrl: '/images/artworks/dalat-mot-ngay-o-da-lat.png',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    officialTitle: 'HẬU TRƯỜNG KỸ XẢO: QUÁ TRÌNH DỰNG TOA TÀU ĐỘC BẢN',
    credits: 'Chủ nhiệm bối cảnh: Minh Quân · Kỹ xảo hình ảnh: CineVFX Studios',
    synopsis:
      'Khám phá hậu trường kỳ công phục dựng bối cảnh toa tàu hơi nước chuyển động thực với hệ thống thủy lực 6 trục và màn chiếu LED tương tác 360 độ.',
    resolutions: ['4K Ultra HD', '1080p Full HD', '720p HD', 'Tự động'],
    hasCaptions: false,
  },
  {
    id: 'video-4',
    title: 'Phỏng vấn dàn diễn viên',
    category: 'interview',
    duration: '03:15',
    durationSeconds: 195,
    thumbnailUrl: '/images/artworks/sky-ben-kia-bau-troi.png',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    officialTitle: 'GIAO LƯU DÀN DIỄN VIÊN CHÍNH: CẢM XÚC CHẠM TỚI TRÁI TIM',
    credits: 'Khách mời: Hoàng Hà (vai Linh), Quốc Anh (vai An) & NSƯT Hữu Châu',
    synopsis:
      'Lắng nghe những chia sẻ chân thành về thử thách diễn xuất trong không gian buồng tàu chật hẹp và kỷ niệm những phân cảnh cao trào xúc động dưới mưa đêm.',
    resolutions: ['1080p Full HD', '720p HD', 'Tự động'],
    hasCaptions: true,
  },
];

export const S22B_PHOTO_GALLERY: MoviePhotoItem[] = [
  // Column 1 (Figma Tile 177, 178, 179)
  {
    id: 'tile-177',
    title: 'Ga tàu hoàng hôn',
    category: 'stills',
    categoryLabel: 'Ảnh phân cảnh',
    imageUrl: '/images/artworks/backdrop_chuyen_tau_cuoi_he.png',
    width: 254,
    height: 180,
    column: 1,
    dimensionsText: '4096 x 2304 · IMAX 70mm Still',
    caption: 'Góc máy toàn cảnh sân ga hoang vắng trong ánh tà dương mùa hạ.',
  },
  {
    id: 'tile-178',
    title: 'Chân dung nhân vật chính',
    category: 'stills',
    categoryLabel: 'Ảnh phân cảnh',
    imageUrl: '/images/artworks/train-chuyen-tau-cuoi-he.png',
    width: 254,
    height: 236,
    column: 1,
    dimensionsText: '3840 x 2160 · Master Capture',
    caption: 'Ánh mắt đầy suy tư của Linh khi nhìn qua khung cửa kính mờ sương.',
  },
  {
    id: 'tile-179',
    title: 'Cận cảnh toa tàu',
    category: 'stills',
    categoryLabel: 'Ảnh phân cảnh',
    imageUrl: '/images/artworks/poster_chuyen_tau_cuoi_he.png',
    width: 254,
    height: 166,
    column: 1,
    dimensionsText: '3840 x 2160 · Master Capture',
    caption: 'Chi tiết kim loại hoen gỉ và biển số hiệu toa tàu định mệnh số 07.',
  },

  // Column 2 (Figma Tile 180, 181, 182)
  {
    id: 'tile-180',
    title: 'Thành phố lên đèn',
    category: 'stills',
    categoryLabel: 'Ảnh phân cảnh',
    imageUrl: '/images/artworks/city-thanh-pho-khong-ngu.png',
    width: 255,
    height: 135,
    column: 2,
    dimensionsText: '4096 x 1716 · Anamorphic 2.39:1',
    caption: 'Vệt sáng đô thị xa xăm lùi lại phía sau khi đoàn tàu tăng tốc.',
  },
  {
    id: 'tile-181',
    title: 'Cuộc gặp gỡ tình cờ',
    category: 'stills',
    categoryLabel: 'Ảnh phân cảnh',
    imageUrl: '/images/artworks/poster_chuyen_hen_mua_thu.png',
    width: 255,
    height: 210,
    column: 2,
    dimensionsText: '3840 x 2160 · Master Capture',
    caption: 'Khoảnh khắc ngập ngừng giữa hai người bạn cũ sau 5 năm bặt vô âm tín.',
  },
  {
    id: 'tile-182',
    title: 'Hậu trường chỉ đạo diễn xuất',
    category: 'bts',
    categoryLabel: 'Hậu trường (BTS)',
    imageUrl: '/images/cinemas/grand-auditorium-hero.png',
    width: 255,
    height: 237,
    column: 2,
    dimensionsText: '3000 x 2000 · Production Still',
    caption: 'Đạo diễn Trần Hữu Tấn trao đổi kịch bản chi tiết cùng diễn viên chính.',
  },

  // Column 3 (Figma Tile 183 - Hero Key Still, 184, 185)
  {
    id: 'tile-183',
    title: 'HERO KEY STILL — Chuyến tàu cuối hè',
    category: 'stills',
    categoryLabel: 'Ảnh phân cảnh chính',
    imageUrl: '/images/artworks/backdrop_chuyen_tau_cuoi_he.png',
    width: 254,
    height: 270,
    column: 3,
    isHero: true,
    dimensionsText: '5120 x 2880 · 5K Film Scan',
    caption: 'Khung hình biểu tượng của tác phẩm: Đoàn tàu xé toang màn sương sớm.',
  },
  {
    id: 'tile-184',
    title: 'Poster nghệ thuật — Giới hạn',
    category: 'posters',
    categoryLabel: 'Poster & Thiết kế gốc',
    imageUrl: '/images/artworks/poster_nhung_ngay_xanh.png',
    width: 254,
    height: 180,
    column: 3,
    dimensionsText: '2400 x 3600 · Vector Print Ready',
    caption: 'Ấn bản poster mỹ thuật vẽ tay dành riêng cho hệ thống phòng chiếu IMAX.',
  },
  {
    id: 'tile-185',
    title: 'Hoàng hôn ga cuối',
    category: 'stills',
    categoryLabel: 'Ảnh phân cảnh',
    imageUrl: '/images/artworks/sky-ben-kia-bau-troi.png',
    width: 254,
    height: 132,
    column: 3,
    dimensionsText: '4096 x 2160 · DCI 4K',
    caption: 'Ánh chiều tà buông xuống trạm dừng cuối cùng giữa thung lũng thông reo.',
  },

  // Column 4 (Figma Tile 186, 187, 188)
  {
    id: 'tile-186',
    title: 'Đường ray xuyên màn đêm',
    category: 'stills',
    categoryLabel: 'Ảnh phân cảnh',
    imageUrl: '/images/artworks/poster_soi_nang_cuoi_ngay.png',
    width: 255,
    height: 160,
    column: 4,
    dimensionsText: '3840 x 2160 · Master Capture',
    caption: 'Ánh đèn pha đoàn tàu rọi sáng thanh ray uốn lượn ven triền đồi.',
  },
  {
    id: 'tile-187',
    title: 'Cận cảnh cảm xúc nhân vật',
    category: 'stills',
    categoryLabel: 'Ảnh phân cảnh',
    imageUrl: '/images/artworks/dalat-mot-ngay-o-da-lat.png',
    width: 255,
    height: 250,
    column: 4,
    dimensionsText: '4096 x 2304 · IMAX 70mm Still',
    caption: 'Giọt nước mắt nghẹn ngào khi lá thư tình năm xưa được mở ra.',
  },
  {
    id: 'tile-188',
    title: 'Ê-kíp vận hành máy quay ARRI',
    category: 'bts',
    categoryLabel: 'Hậu trường (BTS)',
    imageUrl: '/images/cinemas/cgv-dong-khoi-billboard.png',
    width: 255,
    height: 172,
    column: 4,
    dimensionsText: '3000 x 2000 · Behind The Scenes',
    caption: 'Đội ngũ camera rig thiết lập góc máy ray trượt cơ động bên hông toa tàu.',
  },

  // Column 5 (Figma Tile 189, 190, 191)
  {
    id: 'tile-189',
    title: 'Storyboard phác thảo cảnh kết',
    category: 'bts',
    categoryLabel: 'Hậu trường (BTS)',
    imageUrl: '/images/cinemas/cgv-dong-khoi-lounge.png',
    width: 254,
    height: 220,
    column: 5,
    dimensionsText: '3500 x 2400 · Original Concept Art',
    caption: 'Bản vẽ phác thảo phân cảnh đoạn kết tại sân ga ngập tràn sắc hoa phong lữ.',
  },
  {
    id: 'tile-190',
    title: 'Sân ga vắng lặng lúc nửa đêm',
    category: 'stills',
    categoryLabel: 'Ảnh phân cảnh',
    imageUrl: '/images/cinemas/galaxy-nguyen-du-hall.png',
    width: 254,
    height: 160,
    column: 5,
    dimensionsText: '3840 x 2160 · Master Capture',
    caption: 'Không gian tĩnh lặng của trạm gác đèn khi tiếng còi tàu xa dần.',
  },
  {
    id: 'tile-191',
    title: 'Poster nhân vật — Bản phát hành rạp',
    category: 'posters',
    categoryLabel: 'Poster & Thiết kế gốc',
    imageUrl: '/images/artworks/poster_mot_ngay_o_da_lat.png',
    width: 254,
    height: 202,
    column: 5,
    dimensionsText: '2400 x 3600 · Theatrical 1-Sheet',
    caption: 'Poster nhân vật chính thức được trưng bày tại các rạp chiếu phim toàn quốc.',
  },
];
