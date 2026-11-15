'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ChevronDown, ChevronRight, MapPin } from 'lucide-react';
import type { CinemaSummary } from '../model/types.ts';
import styles from '../styles/cinema-directory.module.css';

interface CinemaDirectoryViewProps {
  initialCinemas: CinemaSummary[];
}

export const CinemaDirectoryView: React.FC<CinemaDirectoryViewProps> = ({ initialCinemas }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTech, setSelectedTech] = useState('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const filteredCinemas = initialCinemas.filter((cinema) => {
    const matchesSearch =
      cinema.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cinema.address.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedTech === 'IMAX') {
      return cinema.formats.some((f) => f.includes('IMAX'));
    }
    if (selectedTech === 'ATMOS') {
      return cinema.formats.some((f) => f.includes('Atmos') || f.includes('7.1'));
    }
    if (selectedTech === 'VIP') {
      return cinema.formats.some((f) => f.includes('Gold Class') || f.includes('First Class') || f.includes('Premium'));
    }

    return true;
  });

  return (
    <div className={styles.directoryPage}>
      <div className={styles.container}>
        {/* 02. Featured Cinema Billboard */}
        <section className={styles.featuredHero} aria-label="Không gian rạp chiếu nổi bật">
          <Image
            src="/images/cinemas/grand-auditorium-hero.png"
            alt="Cinematic Grand Auditorium"
            fill
            priority
            className={styles.heroImage}
            sizes="(max-width: 1440px) 100vw, 1440px"
          />
          <div className={styles.heroScrim} />
          <div className={styles.heroTag}>CINEMATIC GRAND AUDITORIUM</div>
        </section>

        {/* 03. Intro and search */}
        <section className={styles.introSection} aria-label="Tìm kiếm rạp chiếu">
          <p className={styles.kicker}>DISCOVER THE CINEMA</p>
          <h1 className={styles.headline}>Khám phá không gian rạp chiếu</h1>
          <p className={styles.subtitle}>
            Tìm kiếm rạp chiếu phim gần bạn với trải nghiệm âm thanh và hình ảnh đỉnh cao.
          </p>

          <div className={styles.searchBarWrapper}>
            <Search size={18} className={styles.searchIcon} aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên rạp, khu vực, quận huyện..."
              className={styles.searchInput}
              aria-label="Tìm tên rạp"
            />
          </div>
        </section>

        {/* 04. Filters & View toggles */}
        <div className={styles.filterRow}>
          <div className={styles.filterPillsGroup}>
            <button type="button" className={styles.regionSelectBtn} aria-label="Chọn khu vực">
              <MapPin size={14} color="#da291c" aria-hidden="true" />
              <span>Khu vực: TP. Hồ Chí Minh</span>
              <ChevronDown size={14} aria-hidden="true" />
            </button>

            <button
              type="button"
              className={`${styles.filterPill} ${selectedTech === 'ALL' ? styles.filterPillActive : ''}`}
              onClick={() => setSelectedTech('ALL')}
            >
              Tất cả
            </button>
            <button
              type="button"
              className={`${styles.filterPill} ${selectedTech === 'IMAX' ? styles.filterPillActive : ''}`}
              onClick={() => setSelectedTech('IMAX')}
            >
              IMAX Laser
            </button>
            <button
              type="button"
              className={`${styles.filterPill} ${selectedTech === 'ATMOS' ? styles.filterPillActive : ''}`}
              onClick={() => setSelectedTech('ATMOS')}
            >
              Dolby Atmos
            </button>
            <button
              type="button"
              className={`${styles.filterPill} ${selectedTech === 'VIP' ? styles.filterPillActive : ''}`}
              onClick={() => setSelectedTech('VIP')}
            >
              Ghế VIP / L&apos;amour
            </button>
          </div>

          <div className={styles.viewToggleGroup}>
            <button
              type="button"
              className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="Chế độ xem danh sách"
            >
              <span>Danh sách</span>
            </button>
            <button
              type="button"
              className={`${styles.viewBtn} ${viewMode === 'map' ? styles.viewBtnActive : ''}`}
              onClick={() => setViewMode('map')}
              aria-label="Chế độ xem bản đồ"
            >
              <span>Bản đồ</span>
            </button>
          </div>
        </div>

        {/* 05. Cinema List Cards */}
        <section className={styles.cinemaList} aria-label="Danh sách rạp chiếu">
          {filteredCinemas.length === 0 ? (
            <p style={{ color: '#8f8f8f', padding: '40px 0', textAlign: 'center' }}>
              Không tìm thấy cụm rạp phù hợp với từ khóa &ldquo;{searchQuery}&rdquo;.
            </p>
          ) : (
            filteredCinemas.map((cinema, idx) => (
              <React.Fragment key={cinema.id}>
                {idx > 0 && <div className={styles.cardDivider} aria-hidden="true" />}
                <Link
                  href={`/cinemas/${cinema.slug}`}
                  className={styles.cinemaCard}
                  title={`Xem lịch chiếu tại ${cinema.name}`}
                >
                  <div className={styles.cinemaThumbWrapper}>
                    <Image
                      src={cinema.imageUrl}
                      alt={cinema.name}
                      fill
                      className={styles.cinemaThumb}
                      sizes="180px"
                    />
                  </div>

                  <div className={styles.cinemaInfo}>
                    <div className={styles.cinemaTitleRow}>
                      <h2 className={styles.cinemaName}>{cinema.name}</h2>
                      <span className={styles.cinemaStatus}>[ {cinema.statusText} ]</span>
                    </div>

                    <p className={styles.cinemaAddress}>
                      {cinema.address} · Cách bạn {cinema.distanceKm} km
                    </p>

                    <div className={styles.cinemaTagsRow}>
                      {cinema.formats.map((tag) => (
                        <span key={tag} className={styles.tagPill}>
                          [ {tag} ]
                        </span>
                      ))}
                    </div>

                    <span className={styles.detailLinkPrompt}>Xem chi tiết rạp và lịch chiếu</span>
                  </div>

                  <ChevronRight size={22} className={styles.cinemaChevron} aria-hidden="true" />
                </Link>
              </React.Fragment>
            ))
          )}
        </section>

        {/* 06. Location and transition notes */}
        <div className={styles.locationNotes}>
          <p className={styles.locationDisclosure}>
            Dữ liệu vị trí và khoảng cách được tính toán dựa trên định vị trình duyệt của bạn.
          </p>
          <p className={styles.transitionNote}>
            Minh họa định hướng thị giác · Chuẩn Wireframe Monochrome Light Mode · Chuyển tiếp tương tác sang S18
          </p>
        </div>
      </div>
    </div>
  );
};
