'use client';

import React, { useEffect, useRef } from 'react';
import { Play, X } from 'lucide-react';
import styles from '../styles/trailer-modal.module.css';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  trailerUrl: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  title,
  trailerUrl,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Prevent background scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Handle Escape key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Focus modal container
    modalRef.current?.focus();

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="trailer-modal-title"
    >
      <div className={styles.modalContainer} ref={modalRef} tabIndex={-1}>
        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle} id="trailer-modal-title">
            <Play size={14} color="#ffffff" fill="#ffffff" aria-hidden="true" />
            <span>TRAILER — {title}</span>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng cửa sổ trailer (ESC)"
            title="Đóng (ESC)"
          >
            <X size={16} color="#ffffff" aria-hidden="true" />
          </button>
        </div>

        {/* Video Player 16:9 */}
        <div className={styles.videoWrapper}>
          <iframe
            className={styles.videoIframe}
            src={`${trailerUrl}?autoplay=1`}
            title={`Trailer chính thức phim ${title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Modal Footer */}
        <div className={styles.modalFooter}>
          <span>Hệ thống Cinora Cinema Video Engine</span>
          <div className={styles.escNotice}>
            <span>Nhấn</span>
            <kbd className={styles.escKbd}>ESC</kbd>
            <span>để đóng</span>
          </div>
        </div>
      </div>
    </div>
  );
};
