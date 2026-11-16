'use client';

import React from 'react';
import { Bot, Star, Ticket } from 'lucide-react';
import styles from '../styles/auth.module.css';

interface AuthStageLeftProps {
  customSubtitle?: string;
}

export const AuthStageLeft: React.FC<AuthStageLeftProps> = ({ customSubtitle }) => {
  return (
    <div className={styles.stageLeft}>
      {/* 01 / Landscape Backdrop Banner (Giống Figma S31) */}
      <div className={styles.landscapeBanner}>
        <img
          src="/images/artworks/backdrop_chuyen_tau_cuoi_he.png"
          alt="Chuyến Tàu Cuối Hè"
          className={styles.bannerImg}
        />
        <div className={styles.bannerOverlay}>
          <h4 className={styles.bannerTitle}>
            Chuyến Tàu Cuối Hè — Định dạng IMAX Laser tại CGV Vincom Đồng Khởi
          </h4>
          <p className={styles.bannerMeta}>
            Tác phẩm điện ảnh được yêu thích nhất tuần · Đã xác thực 12.450 lượt vé
          </p>
        </div>
      </div>

      {/* 02 / Hero Pitch */}
      <div className={styles.heroPitchCol}>
        <h2 className={styles.leftHeroTitle}>Một Tài Khoản. Vô Vàn Trải Nghiệm Điện Ảnh.</h2>
        <p className={styles.leftHeroSubtitle}>
          {customSubtitle ||
            'Đăng nhập để đồng bộ lịch sử vé, cá nhân hóa gợi ý cùng trợ lý Buaa AI và tận hưởng những đặc quyền thành viên độc quyền trên toàn hệ thống rạp.'}
        </p>
      </div>

      {/* 03 / 3 CineMember Perks (Icon + Text màu trắng, không border vuông bọc icon) */}
      <div className={styles.perksList}>
        <div className={styles.perkItem}>
          <span className={styles.perkIconRaw} aria-hidden="true">
            <Bot size={20} color="#ffffff" strokeWidth={2} />
          </span>
          <div className={styles.perkTextCol}>
            <h5 className={styles.perkTitle}>Trợ Lý Buaa AI Cá Nhân Hóa</h5>
            <p className={styles.perkDesc}>
              Ghi nhớ rạp gần nhà, thể loại phim ưa thích và tự động gợi ý vị trí ghế tối ưu.
            </p>
          </div>
        </div>

        <div className={styles.perkItem}>
          <span className={styles.perkIconRaw} aria-hidden="true">
            <Star size={20} color="#ffffff" fill="#ffffff" strokeWidth={1.5} />
          </span>
          <div className={styles.perkTextCol}>
            <h5 className={styles.perkTitle}>Tích Điểm Thưởng C-Points</h5>
            <p className={styles.perkDesc}>
              Tích lũy 5% - 10% giá trị mỗi đơn vé và bắp nước để đổi vé xem phim miễn phí.
            </p>
          </div>
        </div>

        <div className={styles.perkItem}>
          <span className={styles.perkIconRaw} aria-hidden="true">
            <Ticket size={20} color="#ffffff" strokeWidth={2} />
          </span>
          <div className={styles.perkTextCol}>
            <h5 className={styles.perkTitle}>Ví Voucher & Giữ Chỗ Linh Hoạt</h5>
            <p className={styles.perkDesc}>
              Tự động áp dụng mã giảm giá tốt nhất và quản lý vé điện tử QR không cần in ấn.
            </p>
          </div>
        </div>
      </div>

      {/* 04 / Quote triết lý điện ảnh ở đáy (Loại bỏ khung viền đỏ & border vuông) */}
      <p className={styles.bottomQuote}>
        “Điện ảnh không chỉ là giải trí, đó là những khoảnh khắc cảm xúc kết nối tâm hồn.”
      </p>
    </div>
  );
};
