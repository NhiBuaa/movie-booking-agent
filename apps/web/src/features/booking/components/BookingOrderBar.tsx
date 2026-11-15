'use client';

import React from 'react';
import Link from 'next/link';
import { X, Clock, ArrowRight } from 'lucide-react';
import type { Seat } from '../model/types.ts';
import {
  calculateTotalPrice,
  formatCurrency,
  getSelectedSeatsSummary,
} from '../model/booking-logic.ts';
import styles from '../styles/booking-order-bar.module.css';

interface BookingOrderBarProps {
  selectedSeatIds: string[];
  seatsMap: Record<string, Seat>;
  maxSeats?: number;
  onRemoveSeat: (seatId: string) => void;
  checkoutUrl?: string;
  onConfirm?: () => void;
  isDocked?: boolean;
}

export const BookingOrderBar = React.forwardRef<HTMLElement, BookingOrderBarProps>(
  (
    {
      selectedSeatIds,
      seatsMap,
      maxSeats = 6,
      onRemoveSeat,
      checkoutUrl = '/checkout/BK-2026-CHUYENTAU',
      onConfirm,
      isDocked = false,
    },
    ref
  ) => {
    const totalPrice = calculateTotalPrice(selectedSeatIds, seatsMap);
    const summaryText = getSelectedSeatsSummary(selectedSeatIds, seatsMap, maxSeats);
    const hasSeatsSelected = selectedSeatIds.length > 0;

    // Sort selected seats by row then number for consistent badge order
    const sortedSelectedSeats = selectedSeatIds
      .map((id) => seatsMap[id])
      .filter(Boolean)
      .sort((a, b) => {
        if (a.row !== b.row) return a.row.localeCompare(b.row);
        return a.number - b.number;
      });

    return (
      <aside
        ref={ref}
        className={`${styles.stickyBar} ${isDocked ? styles.dockedBar : styles.floatingBar}`}
        aria-label="Thanh tóm tắt đơn vé và đặt chỗ"
        data-docked={isDocked}
      >
      <div className={styles.container}>
        {/* Left Section: Selected Seats & Badges */}
        <div className={styles.leftSection}>
          <div className={styles.summaryText}>{summaryText}</div>

          <div className={styles.badgesWrapper}>
            {!hasSeatsSelected ? (
              <span className={styles.noSeatNotice}>
                Chưa có ghế nào được chọn. Chọn tối đa {maxSeats} ghế.
              </span>
            ) : (
              sortedSelectedSeats.map((seat) => {
                const isSweetbox = seat.type === 'sweetbox';
                return (
                  <div
                    key={seat.id}
                    className={`${styles.seatBadge} ${isSweetbox ? styles.seatBadgeSweetbox : ''}`}
                    title={isSweetbox ? `Ghế đôi Sweetbox ${seat.label}` : `Ghế ${seat.label}`}
                  >
                    <span>
                      {seat.label} · {formatCurrency(seat.price)}
                    </span>
                    {isSweetbox && (
                      <span className={styles.sweetboxTag}>Sweetbox</span>
                    )}
                    <button
                      type="button"
                      className={styles.removeSeatBtn}
                      onClick={() => onRemoveSeat(seat.id)}
                      aria-label={`Bỏ chọn ghế ${seat.label}`}
                      title={`Bỏ chọn ${seat.label}`}
                    >
                      <X size={12} strokeWidth={2} aria-hidden="true" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Middle Section: Total Price & Hold Countdown Note */}
        <div className={styles.middleSection}>
          <div className={styles.totalPrice}>
            TỔNG CỘNG:{' '}
            <span className={styles.totalAmountHighlight}>
              {formatCurrency(totalPrice)}
            </span>
          </div>
          <div className={styles.holdNotice}>
            <Clock size={14} color="#da291c" className={styles.clockIcon} aria-hidden="true" />
            <span>Ghế sẽ được giữ trong 10 phút sau khi xác nhận</span>
          </div>
        </div>

        {/* Right Section: Confirmation CTA Button */}
        <div className={styles.rightSection}>
          {hasSeatsSelected ? (
            <Link
              href={checkoutUrl}
              className={styles.confirmBtn}
              onClick={onConfirm}
            >
              <span>XÁC NHẬN</span>
              <ArrowRight size={16} color="#000000" className={styles.btnArrow} aria-hidden="true" />
            </Link>
          ) : (
            <button
              type="button"
              className={styles.confirmBtn}
              disabled
              title="Vui lòng chọn ít nhất 1 ghế để tiếp tục"
            >
              <span>XÁC NHẬN</span>
              <ArrowRight size={16} color="#8f8f8f" className={styles.btnArrow} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
});

BookingOrderBar.displayName = 'BookingOrderBar';
