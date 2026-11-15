'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Check, Minus, Plus, ArrowRight, Utensils } from 'lucide-react';
import styles from '../styles/concessions.module.css';

interface ComboItem {
  id: string;
  name: string;
  category: 'combo' | 'popcorn' | 'drink' | 'snack';
  descBullets: string[];
  price: number;
  originalPrice: number;
  discountPercent: number;
  isBestSeller?: boolean;
}

const CONCESSIONS_DATA: ComboItem[] = [
  {
    id: 'classic-combo',
    name: 'Combo Bắp Nước Tiêu Chuẩn (Classic Combo)',
    category: 'combo',
    descBullets: [
      'Gồm: 01 bắp rang bơ lớn (chọn vị: Ngọt / Mặn) + 02 ly nước ngọt có ga lớn 22oz',
      'Tiện ích: Đóng hộp giữ nhiệt · Nhận tại quầy Fast Concessions',
    ],
    price: 99000,
    originalPrice: 125000,
    discountPercent: 21,
    isBestSeller: true,
  },
  {
    id: 'cheese-popcorn',
    name: 'Bắp Rang Bơ Vị Phô Mai (Caramel/Cheese Popcorn)',
    category: 'popcorn',
    descBullets: [
      'Gồm: Bắp rang bơ nóng hổi phủ bột phô mai béo ngậy, cỡ lớn (Size L)',
      'Chế biến: Rang tươi tại quầy · Hương vị đậm đà chuẩn rạp chiếu',
    ],
    price: 59000,
    originalPrice: 75000,
    discountPercent: 21,
  },
  {
    id: 'couple-combo',
    name: 'Combo Cặp Đôi (Couple Sweet Combo)',
    category: 'combo',
    descBullets: [
      'Gồm: 01 bắp lớn + 02 nước ngọt lớn kèm snack kẹo dẻo',
      'Nhận tại quầy bắp nước trước giờ chiếu',
    ],
    price: 105000,
    originalPrice: 160000,
    discountPercent: 34,
  },
];

interface ConcessionsViewProps {
  movieId: string;
  movieTitle?: string;
}

export const ConcessionsView: React.FC<ConcessionsViewProps> = ({
  movieId,
  movieTitle = 'Chuyến tàu cuối hè',
}) => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'popcorn' | 'drink' | 'snack'>('ALL');
  const [quantities, setQuantities] = useState<Record<string, number>>({
    'classic-combo': 0,
    'cheese-popcorn': 0,
    'couple-combo': 0,
  });

  // Hold timer countdown 10 minutes (matching S19 hold timer)
  const [timeLeft, setTimeLeft] = useState(525); // 08:45

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleUpdateQty = (id: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, Math.min(10, current + delta));
      return { ...prev, [id]: next };
    });
  };

  const baseTicketPrice = 320000; // 2 VIP seats from S08
  const fnbTotal = Object.entries(quantities).reduce((acc, [id, qty]) => {
    const item = CONCESSIONS_DATA.find((c) => c.id === id);
    return acc + (item ? item.price * qty : 0);
  }, 0);
  const totalAmount = baseTicketPrice + fnbTotal;

  const totalComboCount = Object.values(quantities).reduce((a, b) => a + b, 0);

  return (
    <div className={styles.pageWrapper}>
      {/* 01. Stepper: 4 steps */}
      <div className={styles.container}>
        <div className={styles.stepperRow} aria-label="Các bước đặt vé">
          <div className={styles.stepItem}>
            <div className={`${styles.stepCircle} ${styles.stepCircleDone}`}>
              <Check size={14} color="#ffffff" aria-hidden="true" />
            </div>
            <span className={styles.stepLabel}>CHỌN SUẤT CHIẾU</span>
          </div>

          <div className={styles.stepItem}>
            <div className={`${styles.stepCircle} ${styles.stepCircleDone}`}>
              <Check size={14} color="#ffffff" aria-hidden="true" />
            </div>
            <span className={styles.stepLabel}>CHỌN GHẾ</span>
          </div>

          <div className={styles.stepItem}>
            <div className={`${styles.stepCircle} ${styles.stepCircleActive}`}>3</div>
            <span className={`${styles.stepLabel} ${styles.stepLabelActive}`}>CHỌN BẮP NƯỚC</span>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepCircle}>4</div>
            <span className={styles.stepLabel}>THANH TOÁN & NHẬN VÉ</span>
          </div>
        </div>

        {/* 02. Context & Hold Timer */}
        <div className={styles.contextBar}>
          <Link href={`/booking/${movieId}/seats`} className={styles.backBtn} title="Quay lại sơ đồ ghế">
            <ArrowLeft size={14} aria-hidden="true" />
            <span>QUAY LẠI SƠ ĐỒ GHẾ</span>
          </Link>

          <div className={styles.bookingMetaText}>
            {movieTitle} · Cinora Đồng Khởi · IMAX 18:30 · Ghế H7, H8
          </div>

          <div className={styles.timerBox} aria-label="Thời gian giữ ghế">
            <Clock size={14} color="#da291c" aria-hidden="true" />
            <span className={styles.timerLabel}>GIỮ GHẾ:</span>
            <span className={styles.timerValue}>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* 03. Concessions Headline */}
        <section className={styles.concessionsHeading}>
          <h1 className={styles.headlineTitle}>Thêm bắp nước cho buổi xem phim trọn vẹn</h1>
          <p className={styles.headlineDesc}>
            Thưởng thức bắp rang giòn rụm và nước uống mát lạnh tại rạp.
          </p>
        </section>

        {/* 04. Hero Banner */}
        <section className={styles.fnbHeroBanner} aria-label="Khuyến mãi bắp nước">
          <p className={styles.heroCategoryTag}>COMBO ĐIỆN ẢNH · CINORA CONCESSIONS</p>
          <h2 className={styles.heroBannerTitle}>
            BẮP RANG BƠ &<br />
            NƯỚC NGỌT ĐIỆN ẢNH
          </h2>
          <p className={styles.heroBannerDesc}>Trọn vị điện ảnh · Đặt trước, nhận tại quầy</p>
        </section>

        {/* 05. Categories filter */}
        <div className={styles.categoryPills}>
          <button
            type="button"
            className={`${styles.catPill} ${activeCategory === 'ALL' ? styles.catPillActive : ''}`}
            onClick={() => setActiveCategory('ALL')}
          >
            COMBO ƯU ĐÃI
          </button>
          <button
            type="button"
            className={`${styles.catPill} ${activeCategory === 'popcorn' ? styles.catPillActive : ''}`}
            onClick={() => setActiveCategory('popcorn')}
          >
            BẮP RANG
          </button>
          <button
            type="button"
            className={`${styles.catPill} ${activeCategory === 'drink' ? styles.catPillActive : ''}`}
            onClick={() => setActiveCategory('drink')}
          >
            NƯỚC NGỌT & TRÀ
          </button>
          <button
            type="button"
            className={`${styles.catPill} ${activeCategory === 'snack' ? styles.catPillActive : ''}`}
            onClick={() => setActiveCategory('snack')}
          >
            SNACK & KHÁC
          </button>
        </div>

        {/* 06. Product Cards */}
        <section className={styles.productsList} aria-label="Menu bắp nước">
          {CONCESSIONS_DATA.map((item) => {
            const count = quantities[item.id] || 0;
            return (
              <article key={item.id} className={styles.productCard}>
                <div className={styles.productThumbBox}>
                  <Utensils size={32} color="#8f8f8f" aria-hidden="true" />
                </div>

                <div className={styles.productMainInfo}>
                  <div className={styles.productTitleRow}>
                    <h3 className={styles.productName}>{item.name}</h3>
                    {item.isBestSeller && <span className={styles.bestSellerBadge}>BÁN CHẠY NHẤT</span>}
                  </div>

                  <ul className={styles.productBulletList} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {item.descBullets.map((bullet, i) => (
                      <li key={i}>• {bullet}</li>
                    ))}
                  </ul>
                </div>

                <div className={styles.dividerCol} />

                <div className={styles.productPriceCol}>
                  <div className={styles.currentPrice}>{item.price.toLocaleString('vi-VN')} đ</div>
                  <div className={styles.priceDiscountRow}>
                    <span className={styles.originalPrice}>
                      {item.originalPrice.toLocaleString('vi-VN')} đ
                    </span>
                    <span className={styles.discountBadge}>GIẢM {item.discountPercent}%</span>
                  </div>
                  <span className={styles.pickupVenueNotice}>Nhận tại Cinora Đồng Khởi</span>
                </div>

                <div className={styles.dividerCol} />

                <div className={styles.quantitySelector}>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() => handleUpdateQty(item.id, -1)}
                    disabled={count === 0}
                    aria-label={`Giảm số lượng ${item.name}`}
                  >
                    <Minus size={14} aria-hidden="true" />
                  </button>
                  <span className={styles.qtyCount}>{count}</span>
                  <button
                    type="button"
                    className={`${styles.qtyBtn} ${count > 0 ? styles.qtyBtnActive : ''}`}
                    onClick={() => handleUpdateQty(item.id, 1)}
                    aria-label={`Tăng số lượng ${item.name}`}
                  >
                    <Plus size={14} aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      </div>

      {/* 07. Sticky Booking Summary Bar */}
      <div className={styles.stickyBookingBar} aria-label="Thanh xác nhận thanh toán">
        <div className={styles.stickyInner}>
          <div className={styles.summaryTextCol}>
            <span className={styles.summaryLabel}>
              TẠM TÍNH (02 VÉ XEM PHIM · {totalComboCount > 0 ? `ĐÃ CHỌN ${totalComboCount} COMBO` : 'CHƯA CHỌN COMBO'})
            </span>
            <span className={styles.summaryTotal}>{totalAmount.toLocaleString('vi-VN')} đ</span>
            <span className={styles.summaryBreakdown}>
              Vé H7, H8: 320.000 đ · Bắp nước: {fnbTotal.toLocaleString('vi-VN')} đ
            </span>
          </div>

          <Link
            href={`/checkout/MB-2026-000128?combo=${totalComboCount}&fnb=${fnbTotal}`}
            className={styles.continueCta}
            data-testid="combo-checkout-cta"
          >
            <span>TIẾP TỤC THANH TOÁN</span>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
};
