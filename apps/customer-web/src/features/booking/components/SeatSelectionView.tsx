'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Check, Ticket, X } from 'lucide-react';
import type { Seat } from '../model/types.ts';
import {
  IMAX_SEATS_FIXTURE,
  IMAX_SEATS_MAP,
  DEFAULT_SHOWTIME_FIXTURE,
} from '../model/booking-fixtures.ts';
import { toggleSeat, MAX_SEATS_PER_BOOKING } from '../model/booking-logic.ts';
import { SeatGrid } from './SeatGrid.tsx';
import { SeatLegend } from './SeatLegend.tsx';
import { BookingOrderBar } from './BookingOrderBar.tsx';
import styles from '../styles/seat-selection-view.module.css';

interface SeatSelectionViewProps {
  initialMovieId?: string;
  initialShowtimeId?: string;
  initialSelectedSeatIds?: string[];
}

export const SeatSelectionView: React.FC<SeatSelectionViewProps> = ({
  initialMovieId,
  initialShowtimeId,
  initialSelectedSeatIds = ['H7', 'H8'], // Default matches Figma Node 513:340
}) => {
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>(
    initialSelectedSeatIds
  );
  const [alertError, setAlertError] = useState<string | null>(null);

  const dockRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const [isDocked, setIsDocked] = useState<boolean>(false);
  const [barHeight, setBarHeight] = useState<number>(104);

  useEffect(() => {
    if (barRef.current) {
      setBarHeight(barRef.current.offsetHeight);
    }
  }, [selectedSeatIds]);

  useEffect(() => {
    const handleCheckDock = () => {
      if (!dockRef.current) return;
      const rect = dockRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Khi đáy của container dockRef nằm trong hoặc cao hơn đáy màn hình:
      // tức là người dùng đã cuộn trang xuống tới vị trí tự nhiên của thanh trên Footer.
      const shouldDock = rect.bottom <= viewportHeight + 2;
      setIsDocked(shouldDock);
    };

    window.addEventListener('scroll', handleCheckDock, { passive: true });
    window.addEventListener('resize', handleCheckDock, { passive: true });
    handleCheckDock();

    return () => {
      window.removeEventListener('scroll', handleCheckDock);
      window.removeEventListener('resize', handleCheckDock);
    };
  }, []);

  const showtime = {
    ...DEFAULT_SHOWTIME_FIXTURE,
    movieId: initialMovieId || DEFAULT_SHOWTIME_FIXTURE.movieId,
    showtimeId: initialShowtimeId || DEFAULT_SHOWTIME_FIXTURE.showtimeId,
  };

  const handleToggleSeat = (seatId: string) => {
    const result = toggleSeat(
      seatId,
      selectedSeatIds,
      IMAX_SEATS_MAP,
      MAX_SEATS_PER_BOOKING
    );

    if (result.error) {
      setAlertError(result.error);
    } else {
      setAlertError(null);
      setSelectedSeatIds(result.selectedIds);
    }
  };

  const handleRemoveSeat = (seatId: string) => {
    handleToggleSeat(seatId);
  };

  const comboUrl = `/booking/${encodeURIComponent(showtime.movieId || 'chuyen-tau-cuoi-he')}/combo`;

  return (
    <div
      className={styles.viewRoot}
      data-node-id="513:340"
      data-name="S08 — Chọn ghế / Chuyến tàu cuối hè"
    >
      {/* 1. Booking Stepper Bar */}
      <section className={styles.stepperSection} aria-label="Tiến trình đặt vé">
        <div className={styles.stepperContainer}>
          {/* Step 1: Done */}
          <div className={styles.stepItem}>
            <div className={`${styles.stepCircle} ${styles.stepCircleDone}`}>
              <Check size={14} strokeWidth={2.5} aria-hidden="true" />
            </div>
            <div className={`${styles.stepLabel} ${styles.stepLabelDone}`}>
              CHỌN SUẤT CHIẾU
            </div>
          </div>

          <div className={`${styles.stepperConnector} ${styles.stepperConnectorDone}`} />

          {/* Step 2: Active */}
          <div className={styles.stepItem}>
            <div className={`${styles.stepCircle} ${styles.stepCircleActive}`}>2</div>
            <div className={`${styles.stepLabel} ${styles.stepLabelActive}`}>
              CHỌN GHẾ
            </div>
          </div>

          <div className={styles.stepperConnector} />

          {/* Step 3: Upcoming */}
          <div className={styles.stepItem}>
            <div className={`${styles.stepCircle} ${styles.stepCircleUpcoming}`}>3</div>
            <div className={`${styles.stepLabel} ${styles.stepLabelUpcoming}`}>
              CHỌN BẮP NƯỚC
            </div>
          </div>

          <div className={styles.stepperConnector} />

          {/* Step 4: Upcoming */}
          <div className={styles.stepItem}>
            <div className={`${styles.stepCircle} ${styles.stepCircleUpcoming}`}>4</div>
            <div className={`${styles.stepLabel} ${styles.stepLabelUpcoming}`}>
              THANH TOÁN & NHẬN VÉ
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className={styles.mainContainer}>
        {/* 2. Movie & Showtime Context Card */}
        <section className={styles.movieCard} aria-label="Thông tin phim và suất chiếu">
          <div className={styles.movieCardLeft}>
            <img
              src={showtime.posterUrl}
              alt={showtime.movieTitle}
              className={styles.moviePoster}
            />
            <div className={styles.movieDetails}>
              <h1 className={styles.movieTitle}>{showtime.movieTitle}</h1>
              <p className={styles.movieShowtimeInfo}>
                {showtime.format} · {showtime.cinemaName} · {showtime.showtimeText}
              </p>
              <p className={styles.movieMeta}>
                {showtime.durationMinutes} phút · {showtime.ageRating}
              </p>
            </div>
          </div>

          <Link href={`/search?format=IMAX`} className={styles.changeShowtimeBtn}>
            <Ticket size={16} className={styles.btnTicketIcon} aria-hidden="true" />
            <span>ĐỔI SUẤT CHIẾU</span>
          </Link>
        </section>

        {/* Validation Warning Alert Toast */}
        {alertError && (
          <div className={styles.alertToast} role="alert">
            <span>{alertError}</span>
            <button
              type="button"
              className={styles.alertCloseBtn}
              onClick={() => setAlertError(null)}
              aria-label="Đóng thông báo"
            >
              <X size={14} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* 3. Seat Map & Legend Section */}
        <section className={styles.seatMapSection} aria-label="Sơ đồ ghế rạp chiếu phim">
          <SeatGrid
            seats={IMAX_SEATS_FIXTURE}
            selectedSeatIds={selectedSeatIds}
            onToggleSeat={handleToggleSeat}
          />
          <SeatLegend />
        </section>
      </main>

      {/* 4. Booking Summary Sticky / Docked Bar (Figma Node 516:508) */}
      <div
        ref={dockRef}
        className={styles.orderBarDock}
        style={{ minHeight: `${barHeight}px` }}
      >
        <BookingOrderBar
          ref={barRef}
          selectedSeatIds={selectedSeatIds}
          seatsMap={IMAX_SEATS_MAP}
          maxSeats={MAX_SEATS_PER_BOOKING}
          onRemoveSeat={handleRemoveSeat}
          checkoutUrl={comboUrl}
          isDocked={isDocked}
        />
      </div>
    </div>
  );
};
