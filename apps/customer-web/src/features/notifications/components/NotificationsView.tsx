'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bell, Clock, Ticket, CheckCircle2, ArrowRight } from 'lucide-react';
import type { NotificationItem } from '../model/types.ts';
import styles from '../styles/notifications.module.css';

interface NotificationsViewProps {
  initialNotifications: NotificationItem[];
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ initialNotifications }) => {
  const [notifications] = useState<NotificationItem[]>(initialNotifications);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [pushEnabled, setPushEnabled] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const filteredNotifs = notifications.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  const renderIcon = (category: string) => {
    switch (category) {
      case 'showtime':
        return <Clock size={16} color="#da291c" aria-hidden="true" />;
      case 'promotion':
        return <Ticket size={16} color="#ffffff" aria-hidden="true" />;
      case 'transaction':
      default:
        return <CheckCircle2 size={16} color="#2e7d5b" aria-hidden="true" />;
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* 02. Heading & Navigation */}
        <section className={styles.headingSection} aria-label="Trung tâm thông báo">
          <div className={styles.navRow}>
            <Link href="/" className={styles.backBtn} title="Quay lại">
              <ArrowLeft size={14} aria-hidden="true" />
              <span>Quay lại</span>
            </Link>
            <div className={styles.breadcrumbText}>Trang chủ › Tài khoản › Trung tâm Thông báo</div>
          </div>

          <h1 className={styles.pageTitle}>Trung Tâm Thông Báo & Cảnh Báo Vé</h1>
          <p className={styles.pageSubtitle}>
            Cập nhật cảnh báo giờ vào phòng chiếu, biến động hoàn tiền, ưu đãi thành viên và các thông báo quan trọng từ Cinora.
          </p>
        </section>

        {/* 03. Push Permission Banner */}
        {!bannerDismissed && (
          <div className={styles.pushBanner} aria-label="Cài đặt thông báo đẩy">
            <div className={styles.bannerLeft}>
              <Bell size={20} className={styles.bannerIcon} aria-hidden="true" />
              <div className={styles.bannerTextGroup}>
                <span className={styles.bannerTitle}>
                  {pushEnabled
                    ? 'Đã bật thông báo đẩy trình duyệt!'
                    : 'Bật thông báo đẩy trên trình duyệt để không bỏ lỡ suất chiếu'}
                </span>
                <span className={styles.bannerDesc}>
                  Hệ thống sẽ gửi cảnh báo giờ vào phòng chiếu trước 30 phút và cập nhật hoàn tiền tức thì.
                </span>
              </div>
            </div>

            <div className={styles.bannerActions}>
              {!pushEnabled && (
                <button
                  type="button"
                  className={styles.enableBtn}
                  onClick={() => setPushEnabled(true)}
                >
                  Bật thông báo ngay
                </button>
              )}
              <button
                type="button"
                className={styles.snoozeBtn}
                onClick={() => setBannerDismissed(true)}
              >
                Để sau / Bỏ qua
              </button>
            </div>
          </div>
        )}

        {/* 04. Grid Layout: Sidebar & Content */}
        <div className={styles.mainGridLayout}>
          {/* Sidebar */}
          <aside className={styles.sidebarCard} aria-label="Phân loại thông báo">
            <h2 className={styles.sidebarTitle}>PHÂN LOẠI THÔNG BÁO</h2>
            <div className={styles.categoryBtnList}>
              <button
                type="button"
                className={`${styles.categoryBtn} ${selectedCategory === 'ALL' ? styles.categoryBtnActive : ''}`}
                onClick={() => setSelectedCategory('ALL')}
              >
                <span>Tất cả thông báo</span>
                <span>({notifications.length.toString().padStart(2, '0')})</span>
              </button>

              <button
                type="button"
                className={`${styles.categoryBtn} ${selectedCategory === 'showtime' ? styles.categoryBtnActive : ''}`}
                onClick={() => setSelectedCategory('showtime')}
              >
                <span>Cảnh báo suất chiếu</span>
                <span>
                  (
                  {notifications
                    .filter((n) => n.category === 'showtime')
                    .length.toString()
                    .padStart(2, '0')}
                  )
                </span>
              </button>

              <button
                type="button"
                className={`${styles.categoryBtn} ${selectedCategory === 'promotion' ? styles.categoryBtnActive : ''}`}
                onClick={() => setSelectedCategory('promotion')}
              >
                <span>Ưu đãi & Voucher</span>
                <span>
                  (
                  {notifications
                    .filter((n) => n.category === 'promotion')
                    .length.toString()
                    .padStart(2, '0')}
                  )
                </span>
              </button>

              <button
                type="button"
                className={`${styles.categoryBtn} ${selectedCategory === 'transaction' ? styles.categoryBtnActive : ''}`}
                onClick={() => setSelectedCategory('transaction')}
              >
                <span>Giao dịch & Hoàn tiền</span>
                <span>
                  (
                  {notifications
                    .filter((n) => n.category === 'transaction')
                    .length.toString()
                    .padStart(2, '0')}
                  )
                </span>
              </button>
            </div>
          </aside>

          {/* List of Notification cards */}
          <section className={styles.notifCardsList} aria-label="Danh sách thông báo">
            {filteredNotifs.length === 0 ? (
              <p style={{ color: '#8f8f8f', padding: '40px 0', textAlign: 'center' }}>
                Không có thông báo nào trong mục này.
              </p>
            ) : (
              filteredNotifs.map((item) => (
                <article key={item.id} className={styles.notifCard}>
                  <div className={styles.notifLeft}>
                    <div className={styles.notifIconWell}>{renderIcon(item.category)}</div>
                    <div className={styles.notifBody}>
                      <h3 className={styles.notifTitle}>{item.title}</h3>
                      <p className={styles.notifMessage}>{item.message}</p>
                      <span className={styles.notifTime}>{item.timestamp}</span>
                    </div>
                  </div>

                  {item.actionUrl && item.actionLabel && (
                    <Link href={item.actionUrl} className={styles.notifActionBtn}>
                      <span>{item.actionLabel}</span>
                      <ArrowRight size={13} aria-hidden="true" />
                    </Link>
                  )}
                </article>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
