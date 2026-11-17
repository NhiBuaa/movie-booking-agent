import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Clock, RotateCcw, Check, Lock, Phone } from 'lucide-react';
import styles from './footer.module.css';

export interface FooterProps {
  variant?: 'full' | 'minimal';
}

export const Footer: React.FC<FooterProps> = ({ variant = 'full' }) => {
  if (variant === 'minimal') {
    return (
      <footer className={styles.footer}>
        <div className={styles.bottomBar}>
          <div className={styles.bottomContainer}>
            <div>© 2026 CINORAAGENT INC. ALL RIGHTS RESERVED. · ĐIỀU KHOẢN · BẢO MẬT</div>
            <div className={styles.partnerStrip}>ĐỐI TÁC THANH TOÁN: VNPAY · MOMO · VISA · ZALOPAY</div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={styles.footer}>
      {/* Trust Strip */}
      <div className={styles.trustStrip}>
        <div className={styles.trustContainer}>
          <div className={styles.trustItem}>
            <ShieldCheck size={16} color="#ffffff" className={styles.trustIcon} aria-hidden="true" />
            <span>VÉ CHÍNH HÃNG TỪ CINEMA CORE API</span>
          </div>
          <div className={styles.trustItem}>
            <Clock size={16} color="#ffffff" className={styles.trustIcon} aria-hidden="true" />
            <span>GIỮ VÉ 10 PHÚT KHÔNG TRANH CHẤP</span>
          </div>
          <div className={styles.trustItem}>
            <RotateCcw size={16} color="#ffffff" className={styles.trustIcon} aria-hidden="true" />
            <span>HOÀN HỦY VÉ MINH BẠCH</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className={styles.mainFooter}>
        {/* Col 1 */}
        <div className={styles.col}>
          <div className={styles.brandWordmark}>CINORAGENT</div>
          <p className={styles.brandDesc}>
            Hệ thống đặt vé xem phim thông minh tích hợp Trợ lý Trí tuệ Nhân tạo Buaa.
          </p>
          <div className={styles.badges}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Check size={12} strokeWidth={2.5} color="#107c41" aria-hidden="true" />
              <span>ĐÃ THÔNG BÁO BỘ CÔNG THƯƠNG</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Lock size={12} color="#ffffff" aria-hidden="true" />
              <span>SSL SECURE</span>
            </div>
          </div>
        </div>

        {/* Col 2 */}
        <div className={styles.col}>
          <h4 className={styles.colHeading}>KHÁM PHÁ & ĐẶT VÉ</h4>
          <ul className={styles.linkList}>
            <li className={styles.linkItem}><Link href="/#movies">Phim đang chiếu</Link></li>
            <li className={styles.linkItem}><Link href="/cinemas">Danh bạ cụm rạp</Link></li>
            <li className={styles.linkItem}><Link href="/showtimes">Lịch chiếu theo rạp</Link></li>
            <li className={styles.linkItem}><Link href="/vouchers">Khuyến mãi & Voucher</Link></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div className={styles.col}>
          <h4 className={styles.colHeading}>CHĂM SÓC KHÁCH HÀNG</h4>
          <ul className={styles.linkList}>
            <li className={styles.linkItem}><Link href="/help">Trung tâm trợ giúp</Link></li>
            <li className={styles.linkItem}><Link href="/refund-policy">Chính sách hoàn vé</Link></li>
            <li className={styles.linkItem}><Link href="/reviews">Đánh giá cộng đồng</Link></li>
            <li className={styles.linkItem}><Link href="/membership">Quy chế thành viên</Link></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div className={styles.col}>
          <h4 className={styles.colHeading}>TỔNG ĐÀI HỖ TRỢ (8:00–24:00)</h4>
          <div className={styles.contactHotline}>
            <Phone size={14} color="#ffffff" className={styles.appIcon} aria-hidden="true" />
            <span>1900 - Cinora · hotro@cinora.vn</span>
          </div>
          <div className={styles.appButtons}>
            <button className={styles.appBtn} type="button">
              <img src="/icons/apple.svg" alt="" className={styles.appIcon} />
              <span>APP STORE</span>
            </button>
            <button className={styles.appBtn} type="button">
              <img src="/icons/google.svg" alt="" className={styles.appIcon} />
              <span>GOOGLE PLAY</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomContainer}>
          <div>© 2026 CINORAAGENT INC. ALL RIGHTS RESERVED. · ĐIỀU KHOẢN · BẢO MẬT</div>
          <div className={styles.partnerStrip}>ĐỐI TÁC THANH TOÁN: VNPAY · MOMO · VISA · ZALOPAY</div>
        </div>
      </div>
    </footer>
  );
};
