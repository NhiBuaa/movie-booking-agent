'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { VoucherItem } from '../model/types.ts';
import styles from '../styles/vouchers.module.css';

interface ExclusiveVouchersProps {
  vouchers: VoucherItem[];
}

export const ExclusiveVouchers: React.FC<ExclusiveVouchersProps> = ({ vouchers }) => {
  const [savedVouchers, setSavedVouchers] = useState<Record<string, 'default' | 'saving' | 'saved'>>({});

  const handleSave = (id: string) => {
    if (savedVouchers[id] === 'saved' || savedVouchers[id] === 'saving') return;

    setSavedVouchers((prev) => ({ ...prev, [id]: 'saving' }));
    setTimeout(() => {
      setSavedVouchers((prev) => ({ ...prev, [id]: 'saved' }));
    }, 400);
  };

  return (
    <section className={styles.vouchersSection} aria-label="Exclusive Vouchers">
      <div className={styles.sectionHeader}>
        <h2 className={styles.heading}>ƯU ĐÃI ĐỘC QUYỀN & VÍ VOUCHER</h2>
        <Link href="/vouchers" className={styles.allLink}>
          <span>XEM TẤT CẢ VOUCHER</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className={styles.vouchersGrid}>
        {vouchers.map((voucher) => {
          const state = savedVouchers[voucher.id] || 'default';
          return (
            <div key={voucher.id} className={styles.voucherCard}>
              <h3 className={styles.cardTitle}>
                {voucher.title} · [ {voucher.badge} ]
              </h3>
              <div className={styles.desc}>
                <p>{voucher.line1}</p>
                <p>{voucher.line2}</p>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.voucherCode}>MÃ: {voucher.code}</span>
                <button
                  type="button"
                  className={`${styles.saveBtn} ${
                    state === 'saved'
                      ? styles.saveBtnSaved
                      : state === 'saving'
                      ? styles.saveBtnSaving
                      : styles.saveBtnDefault
                  }`}
                  onClick={() => handleSave(voucher.id)}
                  disabled={state === 'saved' || state === 'saving'}
                >
                  {state === 'saved' ? 'ĐÃ LƯU' : state === 'saving' ? 'ĐANG LƯU...' : 'LƯU VOUCHER'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cinora Club Strip */}
      <div className={styles.clubStrip}>
        <div className={styles.clubMessage}>
          [ CINORA CLUB ] GIA NHẬP HỘI VIÊN — TÍCH ĐIỂM 10% CHO MỌI GIAO DỊCH, ĐỔI VÉ VÀ BẮP NƯỚC MIỄN PHÍ
        </div>
        <Link href="/membership" className={styles.clubBtn}>
          <span>TÌM HIỂU THÊM</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
};
