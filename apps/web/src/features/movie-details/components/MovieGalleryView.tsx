'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  ImageIcon,
  Play,
  LayoutGrid,
  Grid,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { MovieDetailData } from '../model/types.ts';
import { S22B_PHOTO_GALLERY, type MoviePhotoItem } from '../model/media-fixtures.ts';
import styles from '../styles/movie-gallery.module.css';

interface MovieGalleryViewProps {
  movie: MovieDetailData;
}

type CategoryFilter = 'all' | 'stills' | 'bts' | 'posters';
type ViewMode = 'mosaic' | 'grid';

export const MovieGalleryView: React.FC<MovieGalleryViewProps> = ({ movie }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('mosaic');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  // Filter items
  const filteredPhotos = S22B_PHOTO_GALLERY.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  // 5 column groupings for mosaic
  const columns: MoviePhotoItem[][] = [[], [], [], [], []];
  filteredPhotos.forEach((photo, idx) => {
    const colIdx = (photo.column ? photo.column - 1 : idx % 5);
    columns[colIdx].push(photo);
  });

  const handleOpenLightbox = (photo: MoviePhotoItem) => {
    const idx = filteredPhotos.findIndex((p) => p.id === photo.id);
    if (idx !== -1) {
      setActiveLightboxIndex(idx);
    }
  };

  const handleCloseLightbox = useCallback(() => {
    setActiveLightboxIndex(null);
  }, []);

  const handleNextPhoto = useCallback(() => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((prev) => (prev! + 1) % filteredPhotos.length);
  }, [activeLightboxIndex, filteredPhotos.length]);

  const handlePrevPhoto = useCallback(() => {
    if (activeLightboxIndex === null) return;
    setActiveLightboxIndex((prev) => (prev! - 1 + filteredPhotos.length) % filteredPhotos.length);
  }, [activeLightboxIndex, filteredPhotos.length]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (activeLightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseLightbox();
      } else if (e.key === 'ArrowRight') {
        handleNextPhoto();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxIndex, handleCloseLightbox, handleNextPhoto, handlePrevPhoto]);

  const currentLightboxPhoto = activeLightboxIndex !== null ? filteredPhotos[activeLightboxIndex] : null;

  return (
    <div className={styles.galleryPage} data-testid="s22b-gallery-view">
      {/* 02 / Movie context subnav (Figma Node 580:924) */}
      <header className={styles.subHeader} aria-label="Movie context subnav">
        <div className={styles.subHeaderInner}>
          {/* Left: Back button + Divider + Movie metadata */}
          <div className={styles.subHeaderLeft}>
            <Link
              href={`/movies/${movie.slug}`}
              className={styles.backBtn}
              title="Quay lại trang chi tiết phim S06"
              data-testid="back-to-s06-btn"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              <span>QUAY LẠI TRANG PHIM</span>
            </Link>

            <div className={styles.subHeaderDivider} aria-hidden="true" />

            <div className={styles.movieMetaGroup}>
              <h1 className={styles.movieTitle}>{movie.title}</h1>
              <p className={styles.movieMetadata}>
                {movie.durationMinutes} phút · {movie.ageRating} · Đạo diễn: {movie.director} · 24 Tư liệu ảnh
              </p>
            </div>
          </div>

          {/* Center: Tabs Switcher (Video & Trailer inactive / Photo gallery active) */}
          <nav className={styles.subHeaderCenter} aria-label="Media category tabs">
            <Link
              href={`/movies/${movie.slug}/trailers`}
              className={styles.tabLinkInactive}
              title="Xem Video & Trailer"
              data-testid="switch-to-trailers-tab"
            >
              <Play size={13} color="#8F8F8F" aria-hidden="true" />
              <span>Video &amp; Trailer</span>
            </Link>

            <span className={styles.tabLinkActive} aria-current="page">
              <ImageIcon size={14} color="#da291c" aria-hidden="true" />
              <span>Thư viện ảnh</span>
            </span>
          </nav>

          {/* Right: Book Tickets CTA with Rosso border */}
          <Link
            href={`/booking/${movie.slug}/seats`}
            className={styles.bookCtaBtn}
            data-testid="subheader-book-cta"
          >
            <span>ĐẶT VÉ NGAY</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={styles.mainContainer}>
        {/* 03 / Gallery toolbar (Figma Node 580:938) */}
        <section className={styles.galleryToolbar} aria-label="Gallery Toolbar">
          <h2 className={styles.galleryHeading}>
            BỘ SƯU TẬP HÌNH ẢNH &amp; HẬU TRƯỜNG ({filteredPhotos.length} TƯ LIỆU)
          </h2>

          <div className={styles.viewModeControls} role="radiogroup" aria-label="Kiểu hiển thị">
            <button
              type="button"
              className={viewMode === 'mosaic' ? styles.viewModeBtnActive : styles.viewModeBtnInactive}
              onClick={() => setViewMode('mosaic')}
              role="radio"
              aria-checked={viewMode === 'mosaic'}
            >
              <LayoutGrid size={14} aria-hidden="true" />
              <span>Tường ảnh nghệ thuật</span>
            </button>

            <button
              type="button"
              className={viewMode === 'grid' ? styles.viewModeBtnActive : styles.viewModeBtnInactive}
              onClick={() => setViewMode('grid')}
              role="radio"
              aria-checked={viewMode === 'grid'}
            >
              <Grid size={14} aria-hidden="true" />
              <span>Lưới đồng nhất</span>
            </button>
          </div>
        </section>

        {/* 04 / Gallery categories (Figma Node 580:944) */}
        <nav className={styles.categoriesBar} aria-label="Bộ lọc danh mục hình ảnh">
          <button
            type="button"
            className={`${styles.categoryBtn} ${selectedCategory === 'all' ? styles.categoryBtnActive : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            Tất cả ảnh (24)
          </button>
          <button
            type="button"
            className={`${styles.categoryBtn} ${selectedCategory === 'stills' ? styles.categoryBtnActive : ''}`}
            onClick={() => setSelectedCategory('stills')}
          >
            Ảnh phân cảnh (Stills) (12)
          </button>
          <button
            type="button"
            className={`${styles.categoryBtn} ${selectedCategory === 'bts' ? styles.categoryBtnActive : ''}`}
            onClick={() => setSelectedCategory('bts')}
          >
            Hậu trường sản xuất (BTS) (8)
          </button>
          <button
            type="button"
            className={`${styles.categoryBtn} ${selectedCategory === 'posters' ? styles.categoryBtnActive : ''}`}
            onClick={() => setSelectedCategory('posters')}
          >
            Poster &amp; Thiết kế gốc (4)
          </button>
        </nav>

        {/* 05 / Photo mosaic — 5 columns 15 tiles (Figma Node 580:954) */}
        {viewMode === 'mosaic' ? (
          <div className={styles.mosaicGrid} role="region" aria-label="Tường ảnh mosaic 5 cột">
            {columns.map((colPhotos, colIdx) => (
              <div key={`col-${colIdx}`} className={styles.mosaicColumn}>
                {colPhotos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    className={`${styles.mosaicTile} ${photo.isHero ? styles.heroTile : ''}`}
                    style={{ height: photo.height }}
                    onClick={() => handleOpenLightbox(photo)}
                    aria-label={`Xem ảnh: ${photo.title}`}
                  >
                    <Image
                      src={photo.imageUrl}
                      alt={photo.title}
                      fill
                      sizes="254px"
                      className={styles.tileImage}
                    />

                    <span className={styles.tileBadge}>{photo.categoryLabel}</span>
                    <span className={styles.tileZoomIcon}>
                      <Maximize2 size={12} aria-hidden="true" />
                    </span>

                    <div className={styles.tileOverlay}>
                      <p className={styles.tileTitle}>{photo.title}</p>
                      <p className={styles.tileResolution}>{photo.dimensionsText}</p>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        ) : (
          /* Uniform Grid Mode */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
              width: '100%',
            }}
            role="region"
            aria-label="Lưới ảnh đồng nhất"
          >
            {filteredPhotos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                className={styles.mosaicTile}
                style={{ height: 200 }}
                onClick={() => handleOpenLightbox(photo)}
                aria-label={`Xem ảnh: ${photo.title}`}
              >
                <Image
                  src={photo.imageUrl}
                  alt={photo.title}
                  fill
                  sizes="320px"
                  className={styles.tileImage}
                />
                <span className={styles.tileBadge}>{photo.categoryLabel}</span>
                <span className={styles.tileZoomIcon}>
                  <Maximize2 size={12} aria-hidden="true" />
                </span>
                <div className={styles.tileOverlay}>
                  <p className={styles.tileTitle}>{photo.title}</p>
                  <p className={styles.tileResolution}>{photo.dimensionsText}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox Modal (Emil Kowalski tactile modal & fluid keyboard navigation) */}
      {currentLightboxPhoto && (
        <div
          className={styles.lightboxBackdrop}
          onClick={handleCloseLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`Phóng to ảnh: ${currentLightboxPhoto.title}`}
          data-testid="gallery-lightbox-modal"
        >
          {/* Lightbox Header */}
          <div className={styles.lightboxHeader} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxMetaLeft}>
              <span className={styles.lightboxCounter}>
                {String(activeLightboxIndex! + 1).padStart(2, '0')} / {String(filteredPhotos.length).padStart(2, '0')}
              </span>
              <span className={styles.lightboxCategoryTag}>
                {currentLightboxPhoto.categoryLabel}
              </span>
              <h3 className={styles.lightboxTitle}>{currentLightboxPhoto.title}</h3>
            </div>

            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={handleCloseLightbox}
              aria-label="Đóng cửa sổ phóng to (Esc)"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          {/* Lightbox Body with Prev/Next and Large Image */}
          <div className={styles.lightboxBody} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxNavBtnPrev}
              onClick={handlePrevPhoto}
              aria-label="Ảnh trước đó (Mũi tên trái)"
            >
              <ChevronLeft size={24} aria-hidden="true" />
            </button>

            <div className={styles.lightboxImageContainer}>
              <Image
                src={currentLightboxPhoto.imageUrl}
                alt={currentLightboxPhoto.title}
                width={currentLightboxPhoto.width * 3.5}
                height={currentLightboxPhoto.height * 3.5}
                style={{
                  maxWidth: '85vw',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  border: '1px solid #333333',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
                }}
                priority
              />
            </div>

            <button
              type="button"
              className={styles.lightboxNavBtnNext}
              onClick={handleNextPhoto}
              aria-label="Ảnh kế tiếp (Mũi tên phải)"
            >
              <ChevronRight size={24} aria-hidden="true" />
            </button>
          </div>

          {/* Lightbox Footer with Caption & Resolution */}
          <div className={styles.lightboxFooter} onClick={(e) => e.stopPropagation()}>
            <p className={styles.lightboxCaptionText}>{currentLightboxPhoto.caption}</p>
            <span className={styles.lightboxResolutionText}>{currentLightboxPhoto.dimensionsText}</span>
          </div>
        </div>
      )}
    </div>
  );
};
