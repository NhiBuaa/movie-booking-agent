'use client';

import React, { useState, useEffect } from 'react';
import styles from '../styles/checkout.module.css';
import { formatTimeRemaining, validateHoldTime } from '../model/payment-logic.ts';

interface HoldCountdownTimerProps {
  initialSeconds?: number;
  expiresAt?: number;
  label?: string;
  reminder?: string;
  onExpire?: () => void;
}

export const HoldCountdownTimer: React.FC<HoldCountdownTimerProps> = ({
  initialSeconds = 600, // 10 minutes default
  expiresAt,
  label = 'Thời gian giữ ghế còn lại:',
  reminder = 'Giữ thời hạn hiện tại khi quay lại hoặc đổi phương thức',
  onExpire,
}) => {
  // If expiresAt is passed, calculate seconds, else use initialSeconds
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (expiresAt) {
      return validateHoldTime(expiresAt).remainingSeconds;
    }
    return initialSeconds;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (expiresAt) {
          const { remainingSeconds, isExpired } = validateHoldTime(expiresAt);
          if (isExpired && onExpire) {
            onExpire();
          }
          return remainingSeconds;
        }

        if (prev <= 1) {
          clearInterval(timer);
          if (onExpire) onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const isWarning = secondsLeft > 0 && secondsLeft <= 120; // under 2 minutes
  const isExpired = secondsLeft <= 0;

  return (
    <aside
      className={`${styles.timerBanner} ${isWarning ? styles.timerBannerWarning : ''}`}
      aria-label="Đồng hồ giữ vé"
      role="timer"
      aria-live="polite"
    >
      <div className={styles.timerLeft}>
        <svg
          className={styles.timerIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{label}</span>
      </div>

      <div className={styles.timerCenter} aria-atomic="true">
        {isExpired ? '00:00' : formatTimeRemaining(secondsLeft)}
      </div>

      <div className={styles.timerRight}>
        {isExpired
          ? 'Phiên giữ ghế đã hết hạn. Vui lòng chọn lại suất chiếu.'
          : isWarning
          ? 'Sắp hết thời gian giữ ghế! Vui lòng hoàn tất thanh toán.'
          : reminder}
      </div>
    </aside>
  );
};
