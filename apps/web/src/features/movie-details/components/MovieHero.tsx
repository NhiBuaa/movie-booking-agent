'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  Ticket,
  Play,
  Heart,
  Share2,
  Clock,
  User,
  MessageSquare,
  ImageIcon,
} from 'lucide-react';
import type { MovieDetailData } from '../model/types.ts';
import styles from '../styles/movie-hero.module.css';

interface MovieHeroProps {
  movie: MovieDetailData;
  onOpenTrailer: () => void;
}

export const MovieHero: React.FC<MovieHeroProps> = ({ movie, onOpenTrailer }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <section className={styles.heroSection} aria-label={`Chi tiết phim ${movie.title}`}>
      {/* Full-bleed cinematic backdrop - Sharp with 0.59 Scrim (Figma Node 488:324, 488:325) */}
      <div className={styles.backdropContainer} aria-hidden="true">
        <Image
          src={movie.backdropUrl}
          alt=""
          fill
          priority
          className={styles.backdropImage}
          sizes="100vw"
        />
        <div className={styles.backdropScrim} />
      </div>

      <div className={styles.heroInner}>
        {/* Back navigation button (Figma Node 471:249) */}
        <Link href="/" className={styles.backNav} title="Quay lại trang Khám phá">
          <ArrowLeft size={14} aria-hidden="true" />
          <span>KHÁM PHÁ</span>
        </Link>

        {/* Hero Main Flex Layout: Left Content & Right Media Panel */}
        <div className={styles.heroFlex}>
          {/* Left Content Column */}
          <div className={styles.leftContent}>
            {/* Movie Title (Figma Node 471:252) */}
            <h1 className={styles.movieTitle}>{movie.title}</h1>

            {/* Technical Format & Age Tags (Figma Node 481:312) */}
            <div className={styles.tagsRow}>
              <span className={styles.tagT18}>{movie.ageRating}</span>
              <span className={styles.tagFormat}>IMAX</span>
              <span className={styles.tagFormat}>2D DIGITAL</span>
              <span className={styles.tagFormat}>DOLBY ATMOS</span>
            </div>

            {/* Metadata Rows (Figma Node 471:261, 471:262, 471:263) */}
            <div className={styles.metaContainer}>
              <div className={styles.metaRow}>
                <span className={styles.genreText}>{movie.genres.join('  ·  ')}</span>
                <span className={styles.metaItem}>
                  <Clock size={13} color="#8F8F8F" aria-hidden="true" />
                  <span>{movie.durationFormatted}</span>
                </span>
              </div>
              <div className={styles.metaRowSecond}>
                <Clock size={13} color="#8F8F8F" aria-hidden="true" />
                <span>KHỞI CHIẾU: {movie.releaseDate}</span>
              </div>
            </div>

            {/* CTAs Action Row (Figma Node 471:264, 471:266, 471:268, 471:270) */}
            <div className={styles.actionsRow}>
              <Link
                href={`/booking/${movie.slug}/seats`}
                className={styles.primaryCta}
                data-testid="hero-book-cta"
              >
                <Ticket size={16} color="#000000" fill="#000000" aria-hidden="true" />
                <span>ĐẶT VÉ NGAY</span>
                <ArrowRight size={14} color="#000000" aria-hidden="true" />
              </Link>

              <Link
                href={`/movies/${movie.slug}/trailers`}
                className={styles.trailerCta}
                data-testid="hero-trailer-cta"
                title="Xem Video & Trailer"
              >
                <Play size={14} color="#ffffff" fill="#ffffff" aria-hidden="true" />
                <span>XEM TRAILER</span>
              </Link>

              <button
                type="button"
                className={`${styles.iconBtn} ${isFavorited ? styles.iconBtnActive : ''}`}
                onClick={() => setIsFavorited(!isFavorited)}
                title={isFavorited ? 'Đã yêu thích' : 'Lưu phim yêu thích'}
                aria-label="Yêu thích"
              >
                <Heart
                  size={18}
                  color={isFavorited ? '#da291c' : '#ffffff'}
                  fill={isFavorited ? '#da291c' : 'none'}
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                className={styles.iconBtn}
                onClick={handleShare}
                title={copiedLink ? 'Đã sao chép liên kết!' : 'Chia sẻ phim'}
                aria-label="Chia sẻ"
              >
                <Share2 size={18} color="#ffffff" aria-hidden="true" />
              </button>
            </div>

            {/* Two Information Blocks: Synopsis & Cast (Figma Node 471:272 - 471:293) */}
            <div className={styles.infoBlocksRow}>
              {/* Block 1: Nội dung phim */}
              <div className={styles.synopsisBlock}>
                <div className={styles.blockHeader}>
                  <h2 className={styles.blockTitle}>NỘI DUNG PHIM</h2>
                  <div className={styles.blockUnderline} />
                </div>
                <p className={styles.synopsisText}>{movie.synopsis}</p>

                {/* Director & Community Rating */}
                <div className={styles.directorAndRatingRow}>
                  <div className={styles.directorInfo}>
                    <div className={styles.directorAvatar}>
                      <User size={20} color="#ffffff" aria-hidden="true" />
                    </div>
                    <div className={styles.directorTextGroup}>
                      <span className={styles.directorLabel}>ĐẠO DIỄN</span>
                      <span className={styles.directorName}>{movie.director}</span>
                    </div>
                  </div>

                  <Link
                    href={`/movies/${movie.slug}/review`}
                    className={styles.ratingBox}
                    title="Xem & Viết đánh giá phim"
                    style={{ textDecoration: 'none' }}
                  >
                    <MessageSquare size={14} color="#ffffff" aria-hidden="true" />
                    <span>4.8 / 5  ·  1.250 ĐÁNH GIÁ</span>
                  </Link>
                </div>
              </div>

              {/* Block 2: Diễn viên */}
              <div className={styles.castBlock}>
                <div className={styles.blockHeader}>
                  <h2 className={styles.blockTitle}>DIỄN VIÊN</h2>
                  <div className={styles.blockUnderline} />
                </div>

                <div className={styles.castList}>
                  {movie.cast.map((c) => (
                    <div key={c.name} className={styles.castItem}>
                      <div className={styles.castAvatar}>
                        <User size={16} color="#ffffff" aria-hidden="true" />
                      </div>
                      <div className={styles.castText}>
                        <span className={styles.castName}>{c.name}</span>
                        <span className={styles.castRole}>{c.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Media Preview Panel (Figma Node 471:300 - 471:309) */}
          <div className={styles.mediaPanel}>
            {/* Trailer Media Card -> S22A */}
            <Link
              href={`/movies/${movie.slug}/trailers`}
              className={styles.mediaCard}
              aria-label="Xem trailer và video"
              title="Xem Official Movie Trailers & Video Teasers"
              data-testid="hero-media-trailer-card"
            >
              <Image
                src={movie.backdropUrl}
                alt="Trailer preview"
                fill
                className={styles.mediaCardThumb}
                sizes="332px"
              />
              <div className={styles.mediaOverlayDark1} />
              <div className={styles.mediaCenterPlay}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '1.5px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Play size={16} color="#ffffff" fill="#ffffff" style={{ marginLeft: 2 }} aria-hidden="true" />
                </div>
              </div>
              <div className={styles.mediaBottomBadge}>
                <Play size={12} color="#ffffff" fill="#ffffff" aria-hidden="true" />
                <span>TRAILER CHÍNH · {movie.trailerDuration}</span>
              </div>
            </Link>

            {/* Gallery Media Card -> S22B */}
            <Link
              href={`/movies/${movie.slug}/gallery`}
              className={styles.mediaCard}
              aria-label="Xem thư viện ảnh và hậu trường"
              title="Xem Thư viện ảnh & Hậu trường"
              data-testid="hero-media-gallery-card"
            >
              <Image
                src={movie.backdropUrl}
                alt="Gallery preview"
                fill
                className={styles.mediaCardThumb}
                sizes="332px"
              />
              <div className={styles.mediaOverlayDark2} />
              <div className={styles.mediaCenterPlay}>
                <ImageIcon size={30} color="#ffffff" aria-hidden="true" />
              </div>
              <div className={styles.mediaBottomBadge}>
                <ImageIcon size={14} color="#ffffff" aria-hidden="true" />
                <span>{movie.galleryCount} ẢNH</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
