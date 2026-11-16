'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ImageIcon,
  Radio,
  ChevronDown,
} from 'lucide-react';
import type { MovieDetailData } from '../model/types.ts';
import { S22A_VIDEO_PLAYLIST, type MovieVideoItem } from '../model/media-fixtures.ts';
import styles from '../styles/movie-trailers.module.css';

interface MovieTrailersViewProps {
  movie: MovieDetailData;
}

export const MovieTrailersView: React.FC<MovieTrailersViewProps> = ({ movie }) => {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTimeSec, setCurrentTimeSec] = useState(74); // 01:14 per Figma specs
  const [captionsActive, setCaptionsActive] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState('1080p Full HD');
  const [autoplay, setAutoplay] = useState(true);

  const activeVideo: MovieVideoItem = S22A_VIDEO_PLAYLIST[selectedVideoIndex];
  const scrubberRef = useRef<HTMLDivElement>(null);

  // Auto increment simulated playback if playing
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec((prev) => {
          if (prev >= activeVideo.durationSeconds) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, activeVideo.durationSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const playedPercent = Math.min(100, Math.max(0, (currentTimeSec / activeVideo.durationSeconds) * 100));

  const handleSelectVideo = (index: number) => {
    setSelectedVideoIndex(index);
    setCurrentTimeSec(0);
    setIsPlaying(true);
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.min(1, Math.max(0, clickX / rect.width));
    setCurrentTimeSec(Math.round(pct * activeVideo.durationSeconds));
  };

  return (
    <div className={styles.trailersPage} data-testid="s22a-trailers-view">
      {/* 02 / Movie media sub-header (Figma Node 577:848) */}
      <header className={styles.subHeader} aria-label="Movie media sub-header">
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
              <p className={styles.movieMetaRow1}>
                {movie.durationMinutes} phút · {movie.ageRating} · IMAX Laser 2D · Phụ đề tiếng Việt
              </p>
              <p className={styles.movieMetaRow2}>
                Đạo diễn: {movie.director} · Khởi chiếu: {movie.releaseDate}
              </p>
            </div>
          </div>

          {/* Center: Tabs Switcher (Video & Trailer active / Photo gallery inactive) */}
          <nav className={styles.subHeaderCenter} aria-label="Media category tabs">
            <span className={styles.tabBtnActive} aria-current="page">
              <Play size={12} fill="#ffffff" color="#ffffff" aria-hidden="true" />
              <span>Video &amp; Trailer</span>
            </span>

            <Link
              href={`/movies/${movie.slug}/gallery`}
              className={styles.tabBtnInactive}
              title="Xem Thư viện ảnh & Hậu trường"
              data-testid="switch-to-gallery-tab"
            >
              <ImageIcon size={13} color="#8F8F8F" aria-hidden="true" />
              <span>Thư viện ảnh</span>
            </Link>
          </nav>

          {/* Right: Book Tickets CTA */}
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
      <main className={styles.mainLayout}>
        {/* 03 / Video playlist sidebar (Figma Node 577:870) */}
        <aside className={styles.sidebarPlaylist} aria-label="Danh sách video phim">
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarHeading}>DANH SÁCH VIDEO (04)</h2>
            <button
              type="button"
              className={styles.autoplayToggle}
              onClick={() => setAutoplay(!autoplay)}
              title="Bật/Tắt tự động phát video kế tiếp"
            >
              <Radio size={12} color={autoplay ? '#da291c' : '#8F8F8F'} aria-hidden="true" />
              <span>Tự phát: <strong className={autoplay ? styles.autoplayBadgeOn : ''}>{autoplay ? 'BẬT' : 'TẮT'}</strong></span>
            </button>
          </div>

          <div className={styles.playlistItemsList} role="list">
            {S22A_VIDEO_PLAYLIST.map((video, idx) => {
              const isActive = idx === selectedVideoIndex;
              return (
                <button
                  key={video.id}
                  type="button"
                  className={`${styles.playlistItem} ${isActive ? styles.playlistItemActive : ''}`}
                  onClick={() => handleSelectVideo(idx)}
                  role="listitem"
                  aria-current={isActive ? 'true' : undefined}
                >
                  <div className={styles.thumbnailContainer}>
                    <Image
                      src={video.thumbnailUrl}
                      alt=""
                      fill
                      sizes="80px"
                      className={styles.thumbnailImg}
                    />
                    <div className={styles.thumbnailPlayOverlay}>
                      <Play
                        size={14}
                        fill={isActive ? '#da291c' : '#ffffff'}
                        color={isActive ? '#da291c' : '#ffffff'}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div className={styles.itemMeta}>
                    <p className={styles.itemTitle}>{video.title}</p>
                    <div className={styles.itemStatusRow}>
                      <span>{video.duration}</span>
                      {isActive && (
                        <span className={styles.playingBadge}>
                          ● ĐANG PHÁT
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <Link
            href={`/movies/${movie.slug}/gallery`}
            className={styles.sidebarFooterLink}
            data-testid="sidebar-to-gallery-link"
          >
            <ImageIcon size={14} aria-hidden="true" />
            <span>XEM TOÀN BỘ 24 ẢNH HẬU TRƯỜNG →</span>
          </Link>
        </aside>

        {/* Right Section: 04. Player + 05. Controls + 06. Synopsis */}
        <div className={styles.playerColumn}>
          {/* 04 / Cinematic video player (Figma Node 577:908) */}
          <div className={styles.videoPlayerViewport}>
            <Image
              src={activeVideo.thumbnailUrl}
              alt={activeVideo.title}
              fill
              priority
              className={styles.videoBackdrop}
              sizes="980px"
            />
            <div className={styles.videoVignette} />

            <div className={styles.formatBadgeTopRight}>
              IMAX LASER 2D
            </div>

            {/* Center Big Play Button */}
            {!isPlaying ? (
              <button
                type="button"
                className={styles.bigPlayBtn}
                onClick={() => setIsPlaying(true)}
                aria-label="Bắt đầu phát video"
              >
                <Play size={28} fill="#ffffff" color="#ffffff" style={{ marginLeft: 4 }} aria-hidden="true" />
              </button>
            ) : (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                onClick={() => setIsPlaying(false)}
                title="Nhấn để tạm dừng"
              >
                {/* Playing overlay indicator */}
              </div>
            )}
          </div>

          {/* 05 / Video controls & scrubber (Figma Node 577:923) */}
          <div className={styles.controlsBar} aria-label="Điều khiển video">
            {/* Scrubber progress bar */}
            <div
              className={styles.scrubberTrackContainer}
              ref={scrubberRef}
              onClick={handleScrubberClick}
              role="slider"
              aria-label="Thanh tiến trình video"
              aria-valuenow={currentTimeSec}
              aria-valuemin={0}
              aria-valuemax={activeVideo.durationSeconds}
              tabIndex={0}
            >
              <div className={styles.scrubberTrackBg}>
                <div
                  className={styles.scrubberTrackPlayed}
                  style={{ width: `${playedPercent}%` }}
                />
              </div>
              <div
                className={styles.scrubberKnob}
                style={{ left: `${playedPercent}%` }}
              />
            </div>

            {/* Controls bottom row */}
            <div className={styles.controlsRow}>
              <div className={styles.controlsGroupLeft}>
                <button
                  type="button"
                  className={styles.controlIconBtn}
                  onClick={() => setIsPlaying(!isPlaying)}
                  aria-label={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
                >
                  {isPlaying ? (
                    <Pause size={18} fill="#ffffff" color="#ffffff" aria-hidden="true" />
                  ) : (
                    <Play size={18} fill="#ffffff" color="#ffffff" aria-hidden="true" />
                  )}
                </button>

                <div className={styles.volumeControl}>
                  <button
                    type="button"
                    className={styles.controlIconBtn}
                    onClick={() => setIsMuted(!isMuted)}
                    aria-label={isMuted ? 'Bật âm lượng' : 'Tắt âm'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX size={18} aria-hidden="true" />
                    ) : (
                      <Volume2 size={18} aria-hidden="true" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      if (isMuted) setIsMuted(false);
                    }}
                    className={styles.volumeSlider}
                    aria-label="Điều chỉnh âm lượng"
                  />
                </div>

                <div className={styles.videoTimeReadout}>
                  <span>{formatTime(currentTimeSec)}</span> / <span>{activeVideo.duration}</span>
                </div>
              </div>

              <div className={styles.controlsGroupRight}>
                {/* Closed Captions toggle */}
                <button
                  type="button"
                  className={`${styles.captionsBtn} ${captionsActive ? styles.captionsBtnActive : ''}`}
                  onClick={() => setCaptionsActive(!captionsActive)}
                  aria-label="Phụ đề tiếng Việt"
                >
                  CC
                </button>

                {/* Video resolution selector */}
                <select
                  value={selectedResolution}
                  onChange={(e) => setSelectedResolution(e.target.value)}
                  className={styles.resolutionSelector}
                  aria-label="Độ phân giải video"
                >
                  {activeVideo.resolutions.map((res) => (
                    <option key={res} value={res}>
                      {res}
                    </option>
                  ))}
                </select>

                {/* Fullscreen icon */}
                <button
                  type="button"
                  className={styles.controlIconBtn}
                  aria-label="Toàn màn hình"
                >
                  <Maximize size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* 06 / Film synopsis & booking CTA (Figma Node 577:943) */}
          <div className={styles.synopsisCtaBar}>
            <div className={styles.synopsisInfo}>
              <h3 className={styles.synopsisTitle}>{activeVideo.officialTitle}</h3>
              <p className={styles.synopsisCredits}>{activeVideo.credits}</p>
              <p className={styles.synopsisText}>{activeVideo.synopsis}</p>
            </div>

            <Link
              href={`/movies/${movie.slug}#showtimes`}
              className={styles.actionBookBtn}
              data-testid="synopsis-book-cta"
            >
              <span>XEM LỊCH CHIẾU &amp; ĐẶT VÉ</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
