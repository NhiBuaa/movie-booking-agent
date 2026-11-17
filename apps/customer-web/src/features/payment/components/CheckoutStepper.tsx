'use client';

import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import styles from '../styles/checkout.module.css';

export type CheckoutStepState = 'checkout' | 'processing' | 'success' | 'failed';

interface CheckoutStepperProps {
  state: CheckoutStepState;
}

export const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ state }) => {
  const isSuccess = state === 'success';
  const isFailed = state === 'failed';
  const isProcessing = state === 'processing';

  return (
    <nav className={styles.stepperBar} aria-label="Tiến trình đặt vé">
      <div className={styles.stepperTrack}>
        {/* Continuous connector line through circle centers */}
        <div className={styles.stepperConnector} aria-hidden="true" />

        {/* Step 1: Chọn suất chiếu */}
        <div className={styles.stepperStep}>
          <div className={`${styles.stepCircle} ${styles.stepDone}`} aria-hidden="true">
            <Check size={18} strokeWidth={2.5} />
          </div>
          <span className={styles.stepLabel}>CHỌN SUẤT CHIẾU</span>
        </div>

        {/* Step 2: Chọn ghế */}
        <div className={styles.stepperStep}>
          <div className={`${styles.stepCircle} ${styles.stepDone}`} aria-hidden="true">
            <Check size={18} strokeWidth={2.5} />
          </div>
          <span className={styles.stepLabel}>CHỌN GHẾ</span>
        </div>

        {/* Step 3: Chọn bắp nước */}
        <div className={styles.stepperStep}>
          <div className={`${styles.stepCircle} ${styles.stepDone}`} aria-hidden="true">
            <Check size={18} strokeWidth={2.5} />
          </div>
          <span className={styles.stepLabel}>CHỌN BẮP NƯỚC</span>
        </div>

        {/* Step 4: Thanh toán */}
        <div className={styles.stepperStep}>
          {isSuccess ? (
            <>
              <div className={`${styles.stepCircle} ${styles.stepSuccess}`} aria-hidden="true">
                <Check size={18} strokeWidth={2.5} />
              </div>
              <span className={`${styles.stepLabel} ${styles.stepLabelActive}`}>
                THANH TOÁN THÀNH CÔNG
              </span>
            </>
          ) : isFailed ? (
            <>
              <div className={`${styles.stepCircle} ${styles.stepFailed}`} aria-hidden="true">
                <AlertCircle size={18} strokeWidth={2.5} />
              </div>
              <span className={`${styles.stepLabel} ${styles.stepLabelFailed}`}>
                THANH TOÁN (LỖI · THỬ LẠI)
              </span>
            </>
          ) : isProcessing ? (
            <>
              <div className={`${styles.stepCircle} ${styles.stepActive}`} aria-hidden="true">
                4
              </div>
              <span className={`${styles.stepLabel} ${styles.stepLabelActive}`}>
                ĐANG XỬ LÝ THANH TOÁN...
              </span>
            </>
          ) : (
            <>
              <div className={`${styles.stepCircle} ${styles.stepActive}`} aria-hidden="true">
                4
              </div>
              <span className={`${styles.stepLabel} ${styles.stepLabelActive}`}>
                THANH TOÁN &amp; NHẬN VÉ
              </span>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
