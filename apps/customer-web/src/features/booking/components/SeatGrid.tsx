'use client';

import React, { useState, useMemo } from 'react';
import { Minus, Plus, X } from 'lucide-react';
import type { Seat } from '../model/types.ts';
import { groupSeatsByRow, formatCurrency } from '../model/booking-logic.ts';
import { ScreenCurve } from './ScreenCurve.tsx';
import styles from '../styles/seat-grid.module.css';

interface SeatGridProps {
  seats: Seat[];
  selectedSeatIds: string[];
  onToggleSeat: (seatId: string) => void;
}

export const SeatGrid: React.FC<SeatGridProps> = ({
  seats,
  selectedSeatIds,
  onToggleSeat,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [hoveredSeatId, setHoveredSeatId] = useState<string | null>(null);

  const rowsMap = useMemo(() => {
    return groupSeatsByRow(seats);
  }, [seats]);

  const rowKeys = useMemo(() => {
    return Object.keys(rowsMap).sort();
  }, [rowsMap]);

  // Find currently hovered seat and its pair (if Sweetbox)
  const hoveredSeat = useMemo(() => {
    if (!hoveredSeatId) return null;
    return seats.find((s) => s.id === hoveredSeatId) || null;
  }, [hoveredSeatId, seats]);

  const hoveredPairId = hoveredSeat?.type === 'sweetbox' ? hoveredSeat.pairId : null;

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(1.2, +(prev + 0.1).toFixed(1)));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(0.8, +(prev - 0.1).toFixed(1)));
  };

  const handleZoomReset = () => {
    setZoomLevel(1.0);
  };

  const getSeatTooltip = (seat: Seat, statusText: string) => {
    if (seat.type === 'sweetbox') {
      const pairText = seat.pairId ? ` · Cặp đôi ${seat.pairId}` : '';
      return `Ghế đôi Sweetbox ${seat.label}${pairText} · ${formatCurrency(seat.price)}/ghế · ${statusText}`;
    }
    if (seat.type === 'vip') {
      return `Ghế VIP ${seat.label} · ${formatCurrency(seat.price)} · ${statusText}`;
    }
    return `Ghế thường ${seat.label} · ${formatCurrency(seat.price)} · ${statusText}`;
  };

  // Helper to split row into 3 standard theater groups
  const renderSeatGroups = (rowSeats: Seat[]) => {
    const group1 = rowSeats.filter((s) => s.number >= 1 && s.number <= 2);
    const group2 = rowSeats.filter((s) => s.number >= 3 && s.number <= 10);
    const group3 = rowSeats.filter((s) => s.number >= 11 && s.number <= 12);

    const renderGroup = (group: Seat[]) => (
      <div className={styles.seatGroup}>
        {group.map((seat) => {
          const isSelected = selectedSeatIds.includes(seat.id);
          const isSold = seat.status === 'reserved' || seat.status === 'held';
          const isSweetbox = seat.type === 'sweetbox';
          const isPairHovered =
            !isSold &&
            !isSelected &&
            isSweetbox &&
            Boolean(hoveredPairId && seat.pairId === hoveredPairId);

          let seatClass = styles.seat;
          if (isSold) {
            seatClass += ` ${styles.seatSold}`;
          } else if (isSelected) {
            seatClass += ` ${styles.seatSelected}`;
          } else if (seat.type === 'vip') {
            seatClass += ` ${styles.seatAvailable} ${styles.seatVip}`;
          } else if (isSweetbox) {
            seatClass += ` ${styles.seatAvailable} ${styles.seatSweetbox}`;
            if (isPairHovered) {
              seatClass += ` ${styles.seatPairHovered}`;
            }
          } else {
            seatClass += ` ${styles.seatAvailable}`;
          }

          const statusText = isSold
            ? 'Đã bán'
            : isSelected
            ? 'Đang chọn'
            : 'Còn trống';

          return (
            <button
              key={seat.id}
              type="button"
              className={seatClass}
              disabled={isSold}
              onClick={() => onToggleSeat(seat.id)}
              onMouseEnter={() => setHoveredSeatId(seat.id)}
              onMouseLeave={() => setHoveredSeatId(null)}
              title={getSeatTooltip(seat, statusText)}
              aria-label={`Ghế ${seat.id}, ${isSweetbox ? 'SWEETBOX (Ghế đôi)' : seat.type.toUpperCase()}, ${formatCurrency(seat.price)}, ${statusText}`}
              aria-pressed={isSelected}
              data-seat-id={seat.id}
              data-seat-type={seat.type}
              data-seat-status={seat.status}
              data-pair-id={seat.pairId}
            >
              <span>{seat.label}</span>
              {isSold && (
                <span className={styles.soldMark}>
                  <X size={10} strokeWidth={2} aria-hidden="true" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    );

    return (
      <>
        {renderGroup(group1)}
        <div className={styles.aisleGap} aria-hidden="true" />
        {renderGroup(group2)}
        <div className={styles.aisleGap} aria-hidden="true" />
        {renderGroup(group3)}
      </>
    );
  };

  return (
    <div className={styles.gridRoot}>
      {/* Main Seat Map with Curve and Matrix */}
      <div className={styles.scrollArea}>
        <div
          className={styles.zoomWrapper}
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* 1. Curved Screen and Ambient Light */}
          <ScreenCurve />

          {/* 2. Column Number Indicator Row */}
          <div className={styles.colNumbersRow} aria-hidden="true">
            <div className={styles.rowLetter} />
            <div className={styles.colNumberGroup}>
              <div className={styles.colNumberItem}>1</div>
              <div className={styles.colNumberItem}>2</div>
            </div>
            <div className={styles.colNumberAisle} />
            <div className={styles.colNumberGroup}>
              <div className={styles.colNumberItem}>3</div>
              <div className={styles.colNumberItem}>4</div>
              <div className={styles.colNumberItem}>5</div>
              <div className={styles.colNumberItem}>6</div>
              <div className={styles.colNumberItem}>7</div>
              <div className={styles.colNumberItem}>8</div>
              <div className={styles.colNumberItem}>9</div>
              <div className={styles.colNumberItem}>10</div>
            </div>
            <div className={styles.colNumberAisle} />
            <div className={styles.colNumberGroup}>
              <div className={styles.colNumberItem}>11</div>
              <div className={styles.colNumberItem}>12</div>
            </div>
            <div className={styles.rowLetter} />
          </div>

          {/* 3. Matrix of Seats */}
          <div className={styles.matrixRows} role="grid" aria-label="Ma trận ghế phòng chiếu">
            {rowKeys.map((rowKey) => {
              const rowSeats = rowsMap[rowKey];
              return (
                <div key={rowKey} className={styles.seatRow} role="row">
                  <div className={styles.rowLetter} aria-hidden="true">{rowKey}</div>
                  {renderSeatGroups(rowSeats)}
                  <div className={styles.rowLetter} aria-hidden="true">{rowKey}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Zoom Controls (Figma Node 513:340: below seatmap, above legend) */}
      <div className={styles.zoomControls} aria-label="Điều khiển phóng to thu nhỏ sơ đồ">
        <button
          type="button"
          className={styles.zoomBtn}
          onClick={handleZoomOut}
          disabled={zoomLevel <= 0.8}
          title="Thu nhỏ"
          aria-label="Thu nhỏ"
        >
          <Minus size={14} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={styles.zoomLabel}
          onClick={handleZoomReset}
          title="Đặt lại mức zoom ban đầu"
        >
          {zoomLevel === 1.0 ? 'Zoom' : `${Math.round(zoomLevel * 100)}%`}
        </button>
        <button
          type="button"
          className={styles.zoomBtn}
          onClick={handleZoomIn}
          disabled={zoomLevel >= 1.2}
          title="Phóng to"
          aria-label="Phóng to"
        >
          <Plus size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
