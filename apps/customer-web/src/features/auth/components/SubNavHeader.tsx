'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import styles from '../styles/auth.module.css';

interface SubNavHeaderProps {
  backHref?: string;
  backLabel?: string;
  breadcrumbCurrent: string;
}

export const SubNavHeader: React.FC<SubNavHeaderProps> = ({
  backHref = '/',
  backLabel = 'Quay lại Khám phá',
  breadcrumbCurrent,
}) => {
  return (
    <div className={styles.subnav} role="navigation" aria-label="Auth Sub Navigation">
      <div className={styles.subnavInner}>
        {/* Back CTA Button */}
        <Link href={backHref} className={styles.backBtn}>
          <ArrowLeft size={14} aria-hidden="true" />
          <span>{backLabel}</span>
        </Link>

        {/* Breadcrumb Hierarchy */}
        <div className={styles.breadcrumbSec} aria-label="Breadcrumb">
          <Link href="/" style={{ color: 'inherit' }}>Trang chủ</Link>
          <span>/</span>
          <span className={styles.breadcrumbCurrent}>{breadcrumbCurrent}</span>
        </div>

        {/* Security Trust Indicator */}
        <div className={styles.securityIndicator}>
          <ShieldCheck size={15} color="#22c55e" aria-hidden="true" />
          <span>Bảo mật & an toàn thông tin cá nhân</span>
        </div>
      </div>
    </div>
  );
};
