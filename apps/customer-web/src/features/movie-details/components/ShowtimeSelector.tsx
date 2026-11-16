'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { DaySchedule, ShowtimeSlot, CinemaShowtimeGroup } from '../model/types.ts';
import styles from '../styles/showtime-selector.module.css';

interface ShowtimeSelectorProps {
  movieId: string;
  schedule: DaySchedule[];
}

export const ShowtimeSelector: React.FC<ShowtimeSelectorProps> = ({
  movieId,
  schedule,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    schedule[0]?.date || '04/11'
  );
  const [selectedFormat, setSelectedFormat] = useState<'ALL' | '2D' | 'IMAX'>('ALL');

  // Find schedule for selected date
  const currentDaySchedule = useMemo(() => {
    return schedule.find((d) => d.date === selectedDate) || schedule[0];
  }, [schedule, selectedDate]);

  // Filter cinemas and slots by format
  const filteredCinemas = useMemo(() => {
    if (!currentDaySchedule) return [];

    return currentDaySchedule.cinemas
      .map((cinema) => {
        const matchingSlots = cinema.slots.filter((slot) => {
          if (selectedFormat === 'ALL') return true;
          return slot.format === selectedFormat;
        });

        return {
          ...cinema,
          slots: matchingSlots,
        };
      })
      .filter((cinema) => cinema.slots.length > 0);
  }, [currentDaySchedule, selectedFormat]);

  return (
    <section
      className={styles.selectorSection}
      id="panel-showtimes"
      role="tabpanel"
      aria-labelledby="tab-showtimes"
    >
      {/* Filter Bar: Date and Format Filters */}
      <div className={styles.filterBar}>
        {/* Date Selection */}
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>CHỌN NGÀY:</span>
          <div className={styles.chipGroup} role="radiogroup" aria-label="Chọn ngày chiếu">
            {schedule.map((day) => {
              const isActive = day.date === selectedDate;
              return (
                <button
                  key={day.date}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  className={`${styles.chipBtn} ${isActive ? styles.chipBtnActive : ''}`}
                  onClick={() => setSelectedDate(day.date)}
                  data-testid={`date-chip-${day.date}`}
                >
                  <img
                    src="/icons/clock.svg"
                    alt=""
                    style={{
                      width: 13,
                      height: 13,
                      filter: isActive ? 'invert(1)' : 'none',
                    }}
                  />
                  <span>{day.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Format Selection */}
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>ĐỊNH DẠNG:</span>
          <div className={styles.chipGroup} role="radiogroup" aria-label="Chọn định dạng phòng chiếu">
            {(['ALL', '2D', 'IMAX'] as const).map((fmt) => {
              const isActive = selectedFormat === fmt;
              const label =
                fmt === 'ALL'
                  ? 'TẤT CẢ'
                  : fmt === '2D'
                  ? '2D DIGITAL'
                  : 'IMAX LASER';

              return (
                <button
                  key={fmt}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  className={`${styles.chipBtn} ${isActive ? styles.chipBtnActive : ''}`}
                  onClick={() => setSelectedFormat(fmt)}
                  data-testid={`format-chip-${fmt}`}
                >
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cinema List and Showtimes */}
      <div className={styles.cinemaList}>
        {filteredCinemas.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Không có suất chiếu phù hợp với bộ lọc đã chọn trong ngày này.</p>
          </div>
        ) : (
          filteredCinemas.map((cinema) => {
            // Group cinema slots by format
            const slots2D = cinema.slots.filter((s) => s.format === '2D');
            const slotsIMAX = cinema.slots.filter((s) => s.format === 'IMAX');

            return (
              <div
                key={cinema.cinemaId}
                className={styles.cinemaCard}
                data-testid={`cinema-card-${cinema.cinemaSlug}`}
              >
                {/* Cinema Header */}
                <div className={styles.cinemaHeader}>
                  <div className={styles.cinemaIdentity}>
                    <div className={styles.cinemaTitleRow}>
                      <h2 className={styles.cinemaName}>{cinema.cinemaName}</h2>
                      {cinema.badge && (
                        <span className={styles.cinemaBadge}>{cinema.badge}</span>
                      )}
                    </div>
                    <p className={styles.cinemaAddress}>{cinema.address}</p>
                  </div>

                  <span className={styles.showtimesCount}>
                    {cinema.slots.length} suất chiếu
                  </span>
                </div>

                {/* Cinema Body */}
                <div className={styles.cinemaBody}>
                  {/* IMAX Group if present */}
                  {slotsIMAX.length > 0 && (
                    <div className={styles.formatGroup}>
                      <div className={styles.formatLabel}>
                        <img src="/icons/bolt.svg" alt="" style={{ width: 14, height: 14, color: 'var(--color-rosso-corsa)' }} />
                        <span>IMAX LASER 2D · ÂM THANH 12 KÊNH</span>
                      </div>
                      <div className={styles.slotsGrid}>
                        {slotsIMAX.map((slot) => (
                          <ShowtimeSlotCard
                            key={slot.id}
                            slot={slot}
                            cinema={cinema}
                            movieId={movieId}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2D Group if present */}
                  {slots2D.length > 0 && (
                    <div className={styles.formatGroup}>
                      <div className={styles.formatLabel}>
                        <img src="/icons/film.svg" alt="" style={{ width: 14, height: 14 }} />
                        <span>2D DIGITAL TIÊU CHUẨN</span>
                      </div>
                      <div className={styles.slotsGrid}>
                        {slots2D.map((slot) => (
                          <ShowtimeSlotCard
                            key={slot.id}
                            slot={slot}
                            cinema={cinema}
                            movieId={movieId}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

interface ShowtimeSlotCardProps {
  slot: ShowtimeSlot;
  cinema: CinemaShowtimeGroup;
  movieId: string;
}

const ShowtimeSlotCard: React.FC<ShowtimeSlotCardProps> = ({
  slot,
  cinema,
  movieId,
}) => {
  const bookingHref = `/booking/${encodeURIComponent(movieId)}/seats?time=${encodeURIComponent(
    slot.time
  )}&cinema=${encodeURIComponent(cinema.cinemaSlug)}`;

  return (
    <Link
      href={bookingHref}
      className={styles.slotCard}
      title={`Đặt vé suất ${slot.time} tại ${cinema.cinemaName} (${slot.screen})`}
      data-testid={`slot-${slot.time}-${cinema.cinemaSlug}`}
    >
      {slot.status === 'almost_full' && (
        <span className={styles.slotStatus}>Sắp hết</span>
      )}
      <span className={styles.slotTime}>{slot.time}</span>
      <span className={styles.slotScreen}>{slot.screen}</span>
      <span className={styles.slotPrice}>{slot.priceFormatted}</span>
    </Link>
  );
};
