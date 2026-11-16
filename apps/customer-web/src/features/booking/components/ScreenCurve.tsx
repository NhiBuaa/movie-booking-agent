import React from 'react';
import styles from '../styles/screen-curve.module.css';

export const ScreenCurve: React.FC = () => {
  return (
    <div className={styles.screenContainer} aria-hidden="true">
      {/* Light Projection Wash */}
      <div className={styles.lightWash} />
      <div className={styles.lightBeamSpread} />

      {/* Screen Bowed Arc SVG */}
      <div className={styles.screenArcWrapper}>
        <svg
          className={styles.screenSvg}
          viewBox="0 0 696 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 34C150 10 546 10 694 34"
            stroke="url(#screenGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M2 34C150 10 546 10 694 34"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="8"
            strokeLinecap="round"
            filter="blur(4px)"
          />
          <defs>
            <linearGradient id="screenGrad" x1="2" y1="22" x2="694" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#303030" />
              <stop offset="0.25" stopColor="#8f8f8f" />
              <stop offset="0.5" stopColor="#ffffff" />
              <stop offset="0.75" stopColor="#8f8f8f" />
              <stop offset="1" stopColor="#303030" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Screen Text Label */}
      <div className={styles.screenLabel}>
        MÀN HÌNH CHIẾU / SCREEN
      </div>
    </div>
  );
};
