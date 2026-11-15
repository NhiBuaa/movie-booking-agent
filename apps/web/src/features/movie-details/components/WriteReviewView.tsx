'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  ArrowLeft,
  Send,
  CheckCircle2,
  Film,
} from 'lucide-react';
import type { MovieDetailData } from '../model/types.ts';
import styles from '../styles/write-review.module.css';

interface WriteReviewViewProps {
  movie: MovieDetailData;
}

export const WriteReviewView: React.FC<WriteReviewViewProps> = ({ movie }) => {
  const router = useRouter();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [cinemaWatched, setCinemaWatched] = useState('IMAX Landmark 81');
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitted(true);
    setTimeout(() => {
      router.push(`/movies/${movie.slug}`);
    }, 1500);
  };

  const activeRating = hoverRating ?? rating;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div className={styles.navRow}>
          <Link href={`/movies/${movie.slug}`} className={styles.backBtn} title="Quay lại chi tiết phim">
            <ArrowLeft size={14} aria-hidden="true" />
            <span>QUAY LẠI PHIM</span>
          </Link>
          <span style={{ fontSize: 12, color: '#8f8f8f' }}>VIẾT ĐÁNH GIÁ</span>
        </div>

        <section className={styles.headingSection}>
          <h1 className={styles.pageTitle}>ĐÁNH GIÁ & CẢM NHẬN PHIM</h1>
          <p className={styles.pageSubtitle}>
            Chia sẻ đánh giá của bạn về <strong>{movie.title}</strong> để cộng đồng CineMember cùng tham khảo.
          </p>
        </section>

        {isSubmitted ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <CheckCircle2 size={48} color="#4ade80" style={{ margin: '0 auto 16px', display: 'block' }} />
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>CẢM ƠN BẠN ĐÃ ĐÁNH GIÁ!</h2>
            <p style={{ color: '#8f8f8f', fontSize: 14 }}>
              Nhận xét của bạn đã được ghi nhận và cộng <strong>+50 điểm thưởng CineMember</strong>. Đang quay lại trang phim...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.formBox}>
            <div className={styles.inputGroup}>
              <span className={styles.inputLabel}>MỨC ĐỘ HÀI LÒNG CỦA BẠN</span>
              <div className={styles.starRatingRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={styles.starBtn}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    aria-label={`Đánh giá ${star} sao`}
                  >
                    <Star
                      size={28}
                      color={star <= activeRating ? '#d4af37' : '#444444'}
                      fill={star <= activeRating ? '#d4af37' : 'none'}
                      aria-hidden="true"
                    />
                  </button>
                ))}
                <span className={styles.ratingScoreText}>{activeRating}.0 / 5.0 ĐIỂM</span>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="cinema-select" className={styles.inputLabel}>RẠP BẠN ĐÃ TRẢI NGHIỆM</label>
              <select
                id="cinema-select"
                value={cinemaWatched}
                onChange={(e) => setCinemaWatched(e.target.value)}
                className={styles.textInput}
              >
                <option value="IMAX Landmark 81">Cinora Landmark 81 — Phòng IMAX Laser</option>
                <option value="CGV Vincom Đồng Khởi">CGV Vincom Đồng Khởi — Phòng ScreenX</option>
                <option value="BHD Star Bitexco">BHD Star Bitexco — Phòng Deluxe 2D</option>
                <option value="Galaxy Cinema Nguyễn Du">Galaxy Cinema Nguyễn Du</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="review-comment" className={styles.inputLabel}>NHẬN XÉT CỦA BẠN</label>
              <textarea
                id="review-comment"
                className={styles.textArea}
                placeholder="Diễn xuất, hình ảnh, âm thanh, cảm xúc của bạn sau khi xem bộ phim này thế nào? (Tối thiểu 10 ký tự)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                minLength={10}
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              <Send size={16} aria-hidden="true" />
              <span>GỬI ĐÁNH GIÁ NGAY</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
