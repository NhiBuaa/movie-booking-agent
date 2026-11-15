import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ReviewItem } from '../model/types.ts';
import styles from '../styles/reviews.module.css';

interface CommunityReviewsProps {
  reviews: ReviewItem[];
}

export const CommunityReviews: React.FC<CommunityReviewsProps> = ({ reviews }) => {
  return (
    <section className={styles.reviewsSection} aria-label="Community Reviews">
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.heading}>ĐÁNH GIÁ TỪ CỘNG ĐỒNG</h2>
          <p className={styles.scoreSubtitle}>
            CINESCORE: 4.8 / 5.0 (DỰA TRÊN 1.250+ KHÁN GIẢ ĐÃ MUA VÉ XÁC THỰC)
          </p>
        </div>
        <Link href="/reviews/new" className={styles.writeReviewLink}>
          <span>VIẾT ĐÁNH GIÁ PHIM</span>
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className={styles.reviewsGrid}>
        {reviews.map((rev) => (
          <div key={rev.id} className={styles.reviewCard}>
            <div className={styles.authorLine}>
              {rev.author} · [{rev.badge}]
            </div>
            <div className={styles.ratingLine}>
              Đánh giá: {rev.rating} · {rev.sentiment}
            </div>
            <blockquote className={styles.quoteText}>{rev.quote}</blockquote>
          </div>
        ))}
      </div>

      <div className={styles.allReviewsCenter}>
        <Link href="/reviews" className={styles.allReviewsBtn}>
          <span>XEM TOÀN BỘ 1.250 ĐÁNH GIÁ</span>
          <ArrowRight size={14} className={styles.arrowIcon} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
};
