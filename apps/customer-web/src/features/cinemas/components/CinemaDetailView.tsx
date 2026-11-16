'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, MapPin, Phone, Car, Utensils, Accessibility, Film } from 'lucide-react';
import type { CinemaDetail } from '../model/types.ts';
import styles from '../styles/cinema-detail.module.css';

interface CinemaDetailViewProps {
  cinema: CinemaDetail;
}

export const CinemaDetailView: React.FC<CinemaDetailViewProps> = ({ cinema }) => {
  const [activeDateId, setActiveDateId] = useState(cinema.availableDates[0]?.id || 'd1');

  const renderAmenityIcon = (iconName: string) => {
    switch (iconName) {
      case 'car':
        return <Car size={16} color="#ffffff" aria-hidden="true" />;
      case 'food':
        return <Utensils size={16} color="#ffffff" aria-hidden="true" />;
      case 'wheelchair':
        return <Accessibility size={16} color="#ffffff" aria-hidden="true" />;
      case 'film':
      default:
        return <Film size={16} color="#ffffff" aria-hidden="true" />;
    }
  };

  return (
    <div className={styles.detailPage}>
      <div className={styles.container}>
        {/* 02. Breadcrumb & Back */}
        <div className={styles.navRow}>
          <Link href="/cinemas" className={styles.backBtn} title="Quay lại danh sách rạp">
            <ArrowLeft size={14} aria-hidden="true" />
            <span>Quay lại danh sách rạp</span>
          </Link>

          <div className={styles.breadcrumbText}>
            Trang chủ › Rạp chiếu › <span className={styles.breadcrumbActive}>{cinema.name}</span>
          </div>
        </div>

        {/* 03. Editorial Billboard */}
        <section className={styles.editorialBillboard} aria-label="Hình ảnh cụm rạp">
          <Image
            src={cinema.billboardImageUrl}
            alt={cinema.name}
            fill
            priority
            className={styles.billboardImage}
            sizes="(max-width: 1440px) 100vw, 1440px"
          />
          <div className={styles.billboardScrim} />
          <div className={styles.billboardTag}>{cinema.billboardTag}</div>
        </section>

        {/* 04. Venue Info & Amenities */}
        <section className={styles.venueInfoCard} aria-label="Thông tin và tiện ích rạp">
          <div className={styles.venueTopRow}>
            <h1 className={styles.venueName}>{cinema.name}</h1>
            <span className={styles.statusBadge}>{cinema.statusText}</span>
          </div>

          <div className={styles.addressRow}>
            <MapPin size={16} color="#da291c" aria-hidden="true" />
            <span>{cinema.address}</span>
          </div>

          <div className={styles.actionsSubRow}>
            <a
              href={cinema.mapQuery}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapLink}
            >
              Xem bản đồ & Chỉ đường
            </a>
            <span style={{ color: '#8f8f8f' }}>·</span>
            <span className={styles.hotlineText}>
              <Phone size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} aria-hidden="true" />
              Hotline: {cinema.hotline}
            </span>
          </div>

          <div className={styles.amenitiesDivider} />

          <div className={styles.amenitiesGrid}>
            {cinema.amenities.map((item) => (
              <div key={item.id} className={styles.amenityItem}>
                {renderAmenityIcon(item.iconName)}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 05. Showtimes calendar */}
        <section className={styles.calendarSection} aria-label="Lịch chiếu theo ngày">
          <h2 className={styles.calendarTitle}>Lịch chiếu phim</h2>

          <div className={styles.datePillsRow}>
            {cinema.availableDates.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`${styles.datePill} ${activeDateId === d.id ? styles.datePillActive : ''}`}
                onClick={() => setActiveDateId(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </section>

        {/* 06. Movies and Showtimes list */}
        <section className={styles.movieCardsList} aria-label="Danh sách phim và suất chiếu">
          {cinema.movies.map((movie) => (
            <article key={movie.id} className={styles.movieShowtimeCard}>
              <div className={styles.moviePosterCol}>
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  fill
                  className={styles.moviePosterImg}
                  sizes="120px"
                />
              </div>

              <div className={styles.movieMetaCol}>
                <h3 className={styles.movieTitle}>{movie.title}</h3>
                <p className={styles.movieInfoText}>
                  {movie.ageRating} · {movie.durationMinutes} phút
                </p>
                <p className={styles.movieInfoText}>{movie.genres.join(', ')}</p>
                <p className={styles.movieInfoText}>Đạo diễn: {movie.director}</p>
                <p className={styles.movieInfoText}>{movie.language}</p>
                <Link href={`/movies/${movie.slug}`} className={styles.detailLink}>
                  <span>Xem chi tiết phim</span>
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>

              <div className={styles.verticalDivider} />

              <div className={styles.showtimesCol}>
                {movie.formats.map((group) => (
                  <div key={group.id} className={styles.formatGroup}>
                    <div className={styles.formatHeader}>
                      {group.formatTitle} · {group.hallName} · {group.priceFromFormatted}
                    </div>

                    <div className={styles.slotsRow}>
                      {group.slots.map((slot) => (
                        <Link
                          key={slot.id}
                          href={`/booking/${movie.slug}/seats?showtimeId=${slot.id}&cinemaId=${cinema.id}&time=${slot.time}`}
                          className={`${styles.slotCard} ${slot.isHot ? styles.slotCardHot : ''}`}
                          title={`Đặt vé suất ${slot.time}`}
                        >
                          <div className={styles.slotTimePrice}>
                            {slot.time} · {slot.priceFormatted}
                          </div>
                          <div className={`${styles.slotSeats} ${slot.isHot ? styles.slotSeatsHot : ''}`}>
                            Còn {slot.availableSeats} ghế trống
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
};
