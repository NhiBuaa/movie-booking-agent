'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Film, Compass, Bot, Building2, Ticket, Bell, User } from 'lucide-react';
import styles from './header.module.css';
import { resolveHeaderActiveTab, type HeaderTab } from './layout-utils';

export interface HeaderProps {
  activeTab?: HeaderTab;
}

export { resolveHeaderActiveTab };

export const Header: React.FC<HeaderProps> = ({ activeTab = 'discovery' }) => {
  const pathname = usePathname();
  const currentTab = resolveHeaderActiveTab(pathname, activeTab);

  const isNotificationsActive = Boolean(pathname?.startsWith('/notifications'));
  const isProfileActive = Boolean(pathname?.startsWith('/profile'));

  return (
    <header className={styles.header} role="banner">
      <div className={styles.container}>
        {/* Brand */}
        <Link href="/" className={styles.brand} aria-label="CinoraAgent — Về trang chủ">
          <Film size={18} color="#ffffff" className={styles.brandIcon} aria-hidden="true" />
          <span className={styles.brandName}>CINORAGENT</span>
        </Link>

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Main Navigation">
          <Link
            href="/"
            className={`${styles.navItem} ${currentTab === 'discovery' ? styles.navItemActive : ''}`}
            aria-current={currentTab === 'discovery' ? 'page' : undefined}
          >
            <Compass size={16} color="#ffffff" className={styles.navIcon} aria-hidden="true" />
            <span>KHÁM PHÁ</span>
          </Link>
          <Link
            href="/chat"
            className={`${styles.navItem} ${currentTab === 'agent' ? styles.navItemActive : ''}`}
            aria-current={currentTab === 'agent' ? 'page' : undefined}
          >
            <Bot size={16} color="#ffffff" className={styles.navIcon} aria-hidden="true" />
            <span>BUAA AI</span>
          </Link>
          <Link
            href="/cinemas"
            className={`${styles.navItem} ${currentTab === 'cinemas' ? styles.navItemActive : ''}`}
            aria-current={currentTab === 'cinemas' ? 'page' : undefined}
          >
            <Building2 size={16} color="#ffffff" className={styles.navIcon} aria-hidden="true" />
            <span>RẠP CHIẾU</span>
          </Link>
          <Link
            href="/my-tickets"
            className={`${styles.navItem} ${currentTab === 'tickets' ? styles.navItemActive : ''}`}
            aria-current={currentTab === 'tickets' ? 'page' : undefined}
          >
            <Ticket size={16} color="#ffffff" className={styles.navIcon} aria-hidden="true" />
            <span>VÉ CỦA TÔI</span>
          </Link>
        </nav>

        {/* Utilities */}
        <div className={styles.utilities}>
          <Link
            href="/notifications"
            className={`${styles.notificationBadge} ${isNotificationsActive ? styles.notificationBadgeActive : ''}`}
            title="Thông báo mới"
            aria-label="Thông báo mới (3 mới)"
            aria-current={isNotificationsActive ? 'page' : undefined}
          >
            <Bell size={16} color="#ffffff" className={styles.navIcon} aria-hidden="true" />
            <span>3 mới</span>
          </Link>
          <Link
            href="/profile"
            className={`${styles.accountBtn} ${isProfileActive ? styles.accountBtnActive : ''}`}
            title="Tài khoản cá nhân"
            aria-label="Tài khoản cá nhân"
            aria-current={isProfileActive ? 'page' : undefined}
          >
            <User size={16} color="#ffffff" className={styles.navIcon} aria-hidden="true" />
            <span>TÀI KHOẢN</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
