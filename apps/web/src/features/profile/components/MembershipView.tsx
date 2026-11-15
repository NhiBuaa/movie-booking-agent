'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Crown,
  Copy,
  Check,
  ArrowLeft,
  Gift,
  Award,
  Sparkles,
  Ticket,
  ChevronRight,
} from 'lucide-react';
import styles from '../styles/membership.module.css';

interface RewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  available: boolean;
}

const REWARDS: RewardItem[] = [
  {
    id: 'rew-1',
    title: '01 Vé 2D Standard Miễn Phí',
    description: 'Áp dụng cho mọi suất chiếu thứ Hai đến thứ Năm tại tất cả cụm rạp đối tác.',
    pointsCost: 500,
    available: true,
  },
  {
    id: 'rew-2',
    title: 'Combo Bắp Rang Phô Mai & Nước',
    description: 'Bắp rang phô mai khổng lồ + 01 ly nước ngọt lớn tại quầy Concessions.',
    pointsCost: 350,
    available: true,
  },
  {
    id: 'rew-3',
    title: 'Voucher Giảm 50.000đ Vé IMAX',
    description: 'Giảm trực tiếp vào vé IMAX Laser hoặc ScreenX cuối tuần.',
    pointsCost: 400,
    available: true,
  },
  {
    id: 'rew-4',
    title: 'Nâng Hạng CINE-PLATINUM',
    description: 'Miễn phí nâng hạng VIP Platinum với 15% tích lũy điểm thưởng và quà sinh nhật.',
    pointsCost: 2000,
    available: false,
  },
];

export const MembershipView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [points, setPoints] = useState(1250);
  const [redeemedIds, setRedeemedIds] = useState<Record<string, boolean>>({});

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('CN88929904');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleRedeem = (item: RewardItem) => {
    if (points >= item.pointsCost && !redeemedIds[item.id]) {
      setPoints((prev) => prev - item.pointsCost);
      setRedeemedIds((prev) => ({ ...prev, [item.id]: true }));
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.navRow}>
          <Link href="/profile" className={styles.backBtn} title="Quay lại Hồ sơ cá nhân">
            <ArrowLeft size={14} aria-hidden="true" />
            <span>HỒ SƠ CÁ NHÂN</span>
          </Link>
          <span className={styles.breadcrumbText}>HỘI VIÊN & ĐỔI QUÀ</span>
        </div>

        <section className={styles.headerSection}>
          <div>
            <h1 className={styles.pageTitle}>CINEMEMBER & TÍCH ĐIỂM ĐỔI QUÀ</h1>
            <p className={styles.pageSubtitle}>
              Tích lũy 10% giá trị mỗi vé xem phim và đổi lấy các phần quà, vé miễn phí, combo bắp nước cao cấp.
            </p>
          </div>
          <div className={styles.tierBadge}>
            <Crown size={16} aria-hidden="true" />
            <span>HẠNG CINE-GOLD</span>
          </div>
        </section>

        <div className={styles.gridTwoCol}>
          {/* Left Column: Digital VIP Card */}
          <div className={styles.membershipCard} aria-label="Thẻ hội viên số CineMember">
            <div className={styles.cardHeader}>
              <div className={styles.cardTitleGroup}>
                <Crown size={20} className={styles.vipCrown} aria-hidden="true" />
                <span className={styles.cardVipText}>CINEMEMBER VIP CARD</span>
              </div>
              <span style={{ fontSize: '11px', color: '#d4af37', fontWeight: 600 }}>CINE-GOLD</span>
            </div>

            <div className={styles.cardHolderName}>MINH AN (NHI BUAA)</div>
            <div className={styles.cardIdRow}>
              <span>Mã hội viên: CN88929904</span>
              <button type="button" className={styles.copyBtn} onClick={handleCopy} aria-label="Sao chép mã thẻ">
                {copied ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
                <span>{copied ? 'ĐÃ SAO CHÉP' : 'SAO CHÉP'}</span>
              </button>
            </div>

            <div className={styles.spendingInfo}>
              Chi tiêu tích lũy năm 2026: <strong>3.450.000đ</strong> · Hạn duy trì hạng: <strong>31/12/2026</strong>
            </div>

            <div className={styles.barcodeBox}>
              <div className={styles.barcodeLines}>||||||||||||||||||||||||||||||||</div>
              <div className={styles.barcodeNumber}>CN-8892-9904-2026</div>
              <div className={styles.barcodeHint}>Đưa mã này cho nhân viên quét tích điểm tại quầy rạp</div>
            </div>
          </div>

          {/* Right Column: Points Balance & Rewards */}
          <div className={styles.rightCol}>
            <div className={styles.pointsSummaryCard}>
              <div className={styles.pointsBalanceRow}>
                <div>
                  <div className={styles.pointsTitle}>ĐIỂM THƯỞNG KHẢ DỤNG</div>
                  <div className={styles.pointsValue}>{points.toLocaleString('vi-VN')} ĐIỂM</div>
                </div>
                <Award size={40} color="#d4af37" aria-hidden="true" />
              </div>

              <div className={styles.progressBarContainer}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${Math.min(100, (points / 2000) * 100)}%` }}
                />
              </div>
              <div className={styles.progressLabel}>
                <span>Hiện tại: {points} điểm</span>
                <span>Mục tiêu Platinum: 2.000 điểm (Còn {Math.max(0, 2000 - points)} điểm)</span>
              </div>
            </div>

            <section aria-label="Kho quà đổi điểm">
              <h2 className={styles.rewardsSectionTitle}>QUÀ TẶNG & VOUCHER ĐỔI ĐIỂM</h2>
              <div className={styles.rewardsGrid}>
                {REWARDS.map((item) => {
                  const isRedeemed = !!redeemedIds[item.id];
                  const canRedeem = points >= item.pointsCost && !isRedeemed;

                  return (
                    <div key={item.id} className={styles.rewardCard}>
                      <div>
                        <h3 className={styles.rewardTitle}>{item.title}</h3>
                        <p className={styles.rewardDesc}>{item.description}</p>
                      </div>

                      <div className={styles.rewardCostRow}>
                        <span className={styles.pointsCost}>{item.pointsCost} ĐIỂM</span>
                        <button
                          type="button"
                          className={styles.redeemBtn}
                          disabled={!canRedeem}
                          onClick={() => handleRedeem(item)}
                          style={{
                            opacity: canRedeem ? 1 : 0.4,
                            cursor: canRedeem ? 'pointer' : 'not-allowed',
                            backgroundColor: isRedeemed ? '#4ade80' : '#d4af37',
                          }}
                        >
                          {isRedeemed ? 'ĐÃ ĐỔI THÀNH CÔNG' : canRedeem ? 'ĐỔI NGAY' : 'CHƯA ĐỦ ĐIỂM'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
