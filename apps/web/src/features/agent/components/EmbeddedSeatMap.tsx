'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Maximize2, ArrowRight } from 'lucide-react';
import type { Seat } from '../model/types.ts';
import {
  toggleSeatSelection,
  calculateSeatsTotal,
  formatCurrency,
} from '../model/agent-logic.ts';
import styles from '../styles/embedded-cards.module.css';

interface EmbeddedSeatMapProps {
  movieTitle?: string;
  cinemaName?: string;
  roomName?: string;
  showtimeTime?: string;
  initialSelectedSeats?: string[];
  onConfirmSeats?: (seats: string[]) => void;
  disabled?: boolean;
}

// Occupied seats matching Figma Node 760:2300 IMAX Laser layout
const DEFAULT_OCCUPIED_SEATS = new Set([
  'B4', 'B5', 'C7', 'C8', 'F8', 'F9', 'G5', 'K10', 'K11', 'E4', 'E5', 'G4',
]);

export const EmbeddedSeatMap: React.FC<EmbeddedSeatMapProps> = ({
  movieTitle = 'Chuyến Tàu Cuối Hè',
  cinemaName = 'Cinora Đồng Khởi',
  roomName = 'Phòng IMAX Laser',
  showtimeTime = '18:30',
  initialSelectedSeats = ['H7', 'H8'],
  onConfirmSeats,
  disabled = false,
}) => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>(initialSelectedSeats);

  // Generate 12-column IMAX layout (Rows A-K) matching Figma Node 760:2300
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

  const seatMatrix: Seat[][] = useMemo(() => {
    const selectedSet = new Set(selectedSeats);

    return rows.map((row) => {
      let type: Seat['type'] = 'standard';
      let price = 140000;

      if (['E', 'F', 'G', 'H', 'I'].includes(row)) {
        type = 'vip';
        price = 160000;
      } else if (row === 'J') {
        type = 'couple';
        price = 260000;
      }

      return Array.from({ length: 12 }, (_, idx) => {
        const col = idx + 1;
        const id = `${row}${col}`;
        let status: Seat['status'] = 'available';

        if (DEFAULT_OCCUPIED_SEATS.has(id)) {
          status = 'occupied';
        } else if (selectedSet.has(id)) {
          status = 'selected';
        }

        return {
          id,
          row,
          col,
          type,
          price,
          status,
        };
      });
    });
  }, [selectedSeats]);

  const totalPrice = useMemo(() => {
    return calculateSeatsTotal(selectedSeats, seatMatrix);
  }, [selectedSeats, seatMatrix]);

  const handleSeatClick = (seat: Seat) => {
    if (disabled || seat.status === 'occupied') return;
    const next = toggleSeatSelection(selectedSeats, seat.id, 6);
    setSelectedSeats(next);
  };

  const handleConfirm = () => {
    if (selectedSeats.length > 0 && !disabled) {
      onConfirmSeats?.(selectedSeats);
    }
  };

  return (
    <div className={`${styles.cardBase} ${styles.seatmapCard}`} data-testid="embedded-seatmap-card">
      {/* Header - Figma Node 760:2301 & 760:2302 */}
      <div className={styles.cardHeader}>
        <div>
          <h4 className={styles.cardTitle}>
            Sơ đồ ghế: {movieTitle} · {showtimeTime} (IMAX Laser)
          </h4>
          <span className={styles.cardSubtitle}>
            {cinemaName} · {roomName} · Suất {showtimeTime} (07/11/2026)
          </span>
        </div>

        {/* Fullscreen Link - Figma Node 760:2303 */}
        <Link
          href="/booking/chuyen-tau-cuoi-he/seats"
          className={styles.cardHeaderBtn}
          title="Xem sơ đồ ghế toàn màn hình"
        >
          <Maximize2 size={13} aria-hidden="true" />
          <span>Xem toàn màn hình</span>
        </Link>
      </div>

      {/* Screen Arc Indicator - Figma Node 760:2300 */}
      <div className={styles.screenArcWrapper}>
        <div className={styles.screenArc} />
        <span className={styles.screenLabel}>SCREEN</span>
      </div>

      {/* 12-Column Seat Matrix with 3 Blocks (2 - 8 - 2) */}
      <div className={styles.seatGridContainer}>
        {seatMatrix.map((rowSeats) => {
          const rowLetter = rowSeats[0]?.row || '';
          const leftBlock = rowSeats.slice(0, 2);
          const centerBlock = rowSeats.slice(2, 10);
          const rightBlock = rowSeats.slice(10, 12);

          const renderSeat = (seat: Seat) => {
            const isSelected = selectedSeats.includes(seat.id);
            const isOccupied = seat.status === 'occupied';
            const isVip = seat.type === 'vip';
            const isCouple = seat.type === 'couple';

            let seatClass = styles.seatItem;
            if (isOccupied) seatClass += ` ${styles.seatOccupied}`;
            else if (isSelected) seatClass += ` ${styles.seatSelected}`;
            else if (isCouple) seatClass += ` ${styles.seatCouple}`;
            else if (isVip) seatClass += ` ${styles.seatVip}`;

            return (
              <button
                key={seat.id}
                type="button"
                className={seatClass}
                onClick={() => handleSeatClick(seat)}
                disabled={disabled || isOccupied}
                title={`${seat.id} (${seat.type.toUpperCase()}) - ${formatCurrency(seat.price)}`}
                aria-label={`Ghế ${seat.id}, ${seat.type}, ${formatCurrency(seat.price)}`}
              >
                {isOccupied ? '×' : seat.col}
              </button>
            );
          };

          return (
            <div key={rowLetter} className={styles.seatRow}>
              <span className={styles.rowLabel}>{rowLetter}</span>

              {/* Left Wing (2 seats) */}
              {leftBlock.map(renderSeat)}

              {/* Aisle Left Gap */}
              <div className={styles.seatAisleGap} />

              {/* Center Main Block (8 seats) */}
              {centerBlock.map(renderSeat)}

              {/* Aisle Right Gap */}
              <div className={styles.seatAisleGap} />

              {/* Right Wing (2 seats) */}
              {rightBlock.map(renderSeat)}

              <span className={styles.rowLabel}>{rowLetter}</span>
            </div>
          );
        })}
      </div>

      {/* Legend States - Thường, VIP, Sweetbox, Đang chọn, Đã bán */}
      <div className={styles.seatLegend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.legendBoxStandard}`} />
          <span>Thường (140k)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.legendBoxVip}`} />
          <span>VIP (160k)</span>
        </div>
        <div className={styles.legendItem} title="Ghế đôi Sweetbox (260.000 đ/cặp)">
          <div className={`${styles.legendBox} ${styles.legendBoxCouple}`}>
            <span className={styles.coupleDivider} />
          </div>
          <span>Ghế đôi Sweetbox (260k/cặp)</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.legendBoxSelected}`} />
          <span>Đang chọn</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.legendBoxOccupied}`}>×</div>
          <span>Đã bán</span>
        </div>
      </div>

      {/* Seat Selection Summary & Centered Action CTA - Figma Node 760:2865 */}
      <div className={styles.seatSummarySection}>
        <div className={styles.seatSummaryHeadline}>
          {selectedSeats.length > 0 ? (
            <>
              Đã chọn: {selectedSeats.length} ghế ({selectedSeats.join(', ')} - VIP) · Tạm tính: {formatCurrency(totalPrice)}
            </>
          ) : (
            'Vui lòng chọn ghế trên sơ đồ'
          )}
        </div>
        <div className={styles.seatSummarySubtext}>
          * Chọn ghế trên sơ đồ chưa tạo lệnh giữ chỗ. Tối đa 6 ghế/lần đặt.
        </div>

        <button
          type="button"
          className={styles.confirmSeatsBtn}
          onClick={handleConfirm}
          disabled={disabled || selectedSeats.length === 0}
        >
          <span>Xác nhận chọn {selectedSeats.length} ghế ({selectedSeats.join(', ')})</span>
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
