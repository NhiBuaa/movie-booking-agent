'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { QUICK_BOOKING_OPTIONS } from '../model/discovery-fixtures';
import styles from '../styles/quick-booking.module.css';

export const QuickBookingBar: React.FC = () => {
  const router = useRouter();

  const [selectedCinema, setSelectedCinema] = useState<string>('');
  const [selectedMovie, setSelectedMovie] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedShowtime, setSelectedShowtime] = useState<string>('');

  const [openDropdown, setOpenDropdown] = useState<'cinema' | 'movie' | 'date' | 'showtime' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isMovieEnabled = Boolean(selectedCinema);
  const isDateEnabled = Boolean(selectedCinema && selectedMovie);
  const isShowtimeEnabled = Boolean(selectedCinema && selectedMovie && selectedDate);
  const isReadyToBook = Boolean(selectedCinema && selectedMovie && selectedDate && selectedShowtime);

  const handleBookNow = () => {
    if (isReadyToBook) {
      router.push(`/showtimes/st-3/seats?cinema=${encodeURIComponent(selectedCinema)}&movie=${encodeURIComponent(selectedMovie)}`);
    }
  };

  return (
    <section className={styles.quickBookingSection} aria-label="Quick Booking" ref={containerRef}>
      <div className={styles.band}>
        <div className={styles.labelGroup}>
          <Zap size={14} color="#da291c" fill="#da291c" className={styles.boltIcon} aria-hidden="true" />
          <span className={styles.bandLabel}>ĐẶT VÉ NHANH</span>
        </div>

        <div className={styles.controls}>
          {/* 1. Chọn Rạp */}
          <div className={styles.selectWrapper}>
            <button
              type="button"
              className={`${styles.selectTrigger} ${openDropdown === 'cinema' ? styles.selectTriggerOpen : ''}`}
              onClick={() => setOpenDropdown(openDropdown === 'cinema' ? null : 'cinema')}
              aria-expanded={openDropdown === 'cinema'}
            >
              <span className={`${styles.triggerText} ${!selectedCinema ? styles.triggerPlaceholder : ''}`}>
                {selectedCinema || 'Chọn Rạp'}
              </span>
              <ChevronDown
                size={14}
                className={`${styles.chevronIcon} ${openDropdown === 'cinema' ? styles.chevronOpen : ''}`}
                aria-hidden="true"
              />
            </button>

            {openDropdown === 'cinema' && (
              <div className={styles.popover} role="listbox">
                <div className={styles.popoverHeading}>CHỌN RẠP CHIẾU</div>
                <div className={styles.popoverDivider} />
                {QUICK_BOOKING_OPTIONS.cinemas.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`${styles.optionItem} ${selectedCinema === c.name ? styles.optionSelected : ''}`}
                    onClick={() => {
                      setSelectedCinema(c.name);
                      setOpenDropdown('movie'); // auto open next
                    }}
                  >
                    <span>{c.name}</span>
                    {selectedCinema === c.name && (
                      <Check size={14} color="#da291c" strokeWidth={2.5} className={styles.checkIcon} aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Chọn Phim */}
          <div className={styles.selectWrapper}>
            <button
              type="button"
              disabled={!isMovieEnabled}
              className={`${styles.selectTrigger} ${!isMovieEnabled ? styles.disabled : ''} ${openDropdown === 'movie' ? styles.selectTriggerOpen : ''}`}
              onClick={() => isMovieEnabled && setOpenDropdown(openDropdown === 'movie' ? null : 'movie')}
              aria-expanded={openDropdown === 'movie'}
            >
              <span className={`${styles.triggerText} ${!selectedMovie ? styles.triggerPlaceholder : ''}`}>
                {selectedMovie || 'Chọn Phim'}
              </span>
              <ChevronDown
                size={14}
                color={isMovieEnabled ? '#ffffff' : '#555555'}
                className={`${styles.chevronIcon} ${openDropdown === 'movie' ? styles.chevronOpen : ''}`}
                aria-hidden="true"
              />
            </button>

            {openDropdown === 'movie' && isMovieEnabled && (
              <div className={styles.popover} role="listbox">
                <div className={styles.popoverHeading}>PHIM ĐANG CHIẾU</div>
                <div className={styles.popoverDivider} />
                {QUICK_BOOKING_OPTIONS.movies.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`${styles.optionItem} ${selectedMovie === m.name ? styles.optionSelected : ''}`}
                    onClick={() => {
                      setSelectedMovie(m.name);
                      setOpenDropdown('date'); // auto open next
                    }}
                  >
                    <span>{m.name}</span>
                    {selectedMovie === m.name && (
                      <Check size={14} color="#da291c" strokeWidth={2.5} className={styles.checkIcon} aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Chọn Ngày */}
          <div className={styles.selectWrapper}>
            <button
              type="button"
              disabled={!isDateEnabled}
              className={`${styles.selectTrigger} ${!isDateEnabled ? styles.disabled : ''} ${openDropdown === 'date' ? styles.selectTriggerOpen : ''}`}
              onClick={() => isDateEnabled && setOpenDropdown(openDropdown === 'date' ? null : 'date')}
              aria-expanded={openDropdown === 'date'}
            >
              <span className={`${styles.triggerText} ${!selectedDate ? styles.triggerPlaceholder : ''}`}>
                {selectedDate || 'Chọn Ngày'}
              </span>
              <ChevronDown
                size={14}
                color={isDateEnabled ? '#ffffff' : '#555555'}
                className={`${styles.chevronIcon} ${openDropdown === 'date' ? styles.chevronOpen : ''}`}
                aria-hidden="true"
              />
            </button>

            {openDropdown === 'date' && isDateEnabled && (
              <div className={styles.popover} role="listbox">
                <div className={styles.popoverHeading}>NGÀY CHIẾU</div>
                <div className={styles.popoverDivider} />
                {QUICK_BOOKING_OPTIONS.dates.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    className={`${styles.optionItem} ${selectedDate === d.label ? styles.optionSelected : ''}`}
                    onClick={() => {
                      setSelectedDate(d.label);
                      setOpenDropdown('showtime'); // auto open next
                    }}
                  >
                    <span>{d.label}</span>
                    {selectedDate === d.label && (
                      <Check size={14} color="#da291c" strokeWidth={2.5} className={styles.checkIcon} aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Chọn Suất */}
          <div className={styles.selectWrapper}>
            <button
              type="button"
              disabled={!isShowtimeEnabled}
              className={`${styles.selectTrigger} ${!isShowtimeEnabled ? styles.disabled : ''} ${openDropdown === 'showtime' ? styles.selectTriggerOpen : ''}`}
              onClick={() => isShowtimeEnabled && setOpenDropdown(openDropdown === 'showtime' ? null : 'showtime')}
              aria-expanded={openDropdown === 'showtime'}
            >
              <span className={`${styles.triggerText} ${!selectedShowtime ? styles.triggerPlaceholder : ''}`}>
                {selectedShowtime || 'Chọn Suất'}
              </span>
              <ChevronDown
                size={14}
                color={isShowtimeEnabled ? '#ffffff' : '#555555'}
                className={`${styles.chevronIcon} ${openDropdown === 'showtime' ? styles.chevronOpen : ''}`}
                aria-hidden="true"
              />
            </button>

            {openDropdown === 'showtime' && isShowtimeEnabled && (
              <div className={styles.popover} role="listbox">
                <div className={styles.popoverHeading}>SUẤT CHIẾU</div>
                <div className={styles.popoverDivider} />
                {QUICK_BOOKING_OPTIONS.showtimes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`${styles.optionItem} ${selectedShowtime === s.label ? styles.optionSelected : ''}`}
                    onClick={() => {
                      setSelectedShowtime(s.label);
                      setOpenDropdown(null);
                    }}
                  >
                    <span>{s.label}</span>
                    {selectedShowtime === s.label && (
                      <Check size={14} color="#da291c" strokeWidth={2.5} className={styles.checkIcon} aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Button Đặt ngay */}
          <button
            type="button"
            disabled={!isReadyToBook}
            className={`${styles.bookNowBtn} ${isReadyToBook ? styles.bookNowReady : styles.bookNowDisabled}`}
            onClick={handleBookNow}
          >
            <span>Đặt ngay</span>
            {isReadyToBook && <ArrowRight size={16} className={styles.btnArrow} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </section>
  );
};
