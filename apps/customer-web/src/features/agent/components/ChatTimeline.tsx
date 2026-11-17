'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Bot,
  Clock,
  QrCode,
  ShieldCheck,
  Clapperboard,
  MapPin,
  Ticket,
  Building2,
  Utensils,
  Star,
  ArrowRight,
} from 'lucide-react';
import type {
  ChatMessage,
  ShowtimeOption,
  PaymentMethod,
} from '../model/types.ts';
import {
  AGENT_PROMPT_STARTERS,
  AGENT_TRENDING_MOVIES,
  AGENT_TOPIC_PILLS,
} from '../model/agent-fixtures.ts';
import { EmbeddedShowtimeCard } from './EmbeddedShowtimeCard.tsx';
import { EmbeddedSeatMap } from './EmbeddedSeatMap.tsx';
import { EmbeddedOrderSummary } from './EmbeddedOrderSummary.tsx';
import { EmbeddedPaymentCard } from './EmbeddedPaymentCard.tsx';
import { EmbeddedETicketCard } from './EmbeddedETicketCard.tsx';
import styles from '../styles/chat-timeline.module.css';

interface ChatTimelineProps {
  messages: ChatMessage[];
  onSelectShowtime: (showtime: ShowtimeOption) => void;
  onConfirmSeats: (seats: string[]) => void;
  onProceedToPayment: () => void;
  onExecutePayment: (method: PaymentMethod) => void;
  onSelectPromptStarter: (promptText: string) => void;
  onSelectMovie: (movieTitle: string) => void;
  isInitialView?: boolean;
}

export const ChatTimeline: React.FC<ChatTimelineProps> = ({
  messages,
  onSelectShowtime,
  onConfirmSeats,
  onProceedToPayment,
  onExecutePayment,
  onSelectPromptStarter,
  onSelectMovie,
  isInitialView = true,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isInitialView && messages.length > 1 && timelineRef.current && timelineRef.current.parentElement) {
      const scrollParent = timelineRef.current.parentElement;
      scrollParent.scrollTo({
        top: scrollParent.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages.length, isInitialView]);

  return (
    <div className={styles.timelineContainer} ref={timelineRef} data-testid="chat-timeline">
      {/* 03B / Buaa welcome & trust badges (Figma Node 760:2703) */}
      <div className={styles.welcomeCard}>
        <div className={styles.welcomeHeader}>
          <div className={styles.robotAvatar}>
            <Bot size={28} color="#ffffff" aria-hidden="true" />
          </div>
          <div className={styles.welcomeTextGroup}>
            <h3 className={styles.welcomeTitle}>
              Cinora Buaa AI · Trợ Lý Điện Ảnh Thông Minh
            </h3>
            <p className={styles.welcomeDesc}>
              Tối nay bạn muốn thưởng thức tác phẩm điện ảnh nào? Nhắn tin tự nhiên để tìm phim,
              giữ chỗ tức thì trong 10 phút và nhận vé QR trọn gói ngay trong hội thoại.
            </p>
          </div>
        </div>

        <div className={styles.trustBadgesRow}>
          <div className={styles.trustBadgeItem}>
            <Clock size={15} color="#8f8f8f" aria-hidden="true" />
            <span>Giữ chỗ 10p (Atomic Hold)</span>
          </div>
          <div className={styles.trustBadgeItem}>
            <QrCode size={15} color="#8f8f8f" aria-hidden="true" />
            <span>Xuất vé điện tử QR rạp</span>
          </div>
          <div className={styles.trustBadgeItem}>
            <ShieldCheck size={15} color="#8f8f8f" aria-hidden="true" />
            <span>Bảo mật Cinema Core API</span>
          </div>
        </div>
      </div>

      {/* Initial Discovery Artifacts: Trending Movies & Prompt Starters */}
      {isInitialView ? (
        <>
          {/* Trending Movies (Figma Node 760:2722 - 760:2768) */}
          <div className={styles.trendingSection}>
            <div className={styles.sectionHeaderRow}>
              <span className={styles.sectionHeading}>PHIM ĐANG TẠO SỐT VÉ HÔM NAY</span>
              <Link href="/search" className={styles.sectionLink}>
                <span>XEM TOÀN BỘ LỊCH CHIẾU RẠP</span>
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>

            <div className={styles.movieGrid}>
              {AGENT_TRENDING_MOVIES.map((movie, index) => {
                const isPrimary = index === 0; // Card 1 CTA is white with black text in Figma
                return (
                  <div key={movie.id} className={styles.movieCard}>
                    <div className={styles.movieCardTop}>
                      {/* Movie Poster */}
                      <div className={styles.posterWrapper}>
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className={styles.moviePoster}
                        />
                      </div>

                      {/* Info & Showtimes */}
                      <div className={styles.movieInfo}>
                        <span className={styles.movieFormat}>{movie.format}</span>
                        <h4 className={styles.movieTitle}>{movie.title}</h4>
                        <div className={styles.movieMeta}>
                          <span className={styles.movieRatingStar}>
                            <Star size={12} fill="#d4af37" color="#d4af37" aria-hidden="true" />
                          </span>
                          <span>{movie.rating} ({movie.views})</span>
                        </div>
                        <div className={styles.movieShowtimePill}>
                          <span className={styles.movieShowtimeTime}>{movie.showtime}</span>
                          <span className={styles.movieShowtimeCinema}>{movie.cinema}</span>
                        </div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      type="button"
                      className={isPrimary ? styles.bookMovieBtnPrimary : styles.bookMovieBtnSecondary}
                      onClick={() => onSelectMovie(movie.title)}
                    >
                      <span>ĐẶT VÉ PHIM NÀY</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prompt Starters (Figma Node 760:2769 - 760:2798: Grid 2x2) */}
          <div className={styles.promptStartersSection}>
            <div className={styles.sectionHeaderRow}>
              <span className={styles.sectionHeading}>GỢI Ý CÂU LỆNH ĐẶT VÉ HỘI THOẠI NHANH</span>
              <span className={styles.sectionHint}>NHẤN ĐỂ GỬI TRỰC TIẾP YÊU CẦU</span>
            </div>

            <div className={styles.promptGrid}>
              {AGENT_PROMPT_STARTERS.map((starter, i) => {
                const renderIcon = () => {
                  switch (i) {
                    case 0:
                      return <Clapperboard size={20} color="#ffffff" aria-hidden="true" />;
                    case 1:
                      return <MapPin size={20} color="#ffffff" aria-hidden="true" />;
                    case 2:
                      return <Bot size={20} color="#ffffff" aria-hidden="true" />;
                    default:
                      return <Ticket size={20} color="#ffffff" aria-hidden="true" />;
                  }
                };

                return (
                  <div
                    key={starter.id}
                    className={styles.promptCard}
                    onClick={() => onSelectPromptStarter(starter.prompt)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && onSelectPromptStarter(starter.prompt)}
                  >
                    <div className={styles.promptIconBox}>
                      {renderIcon()}
                    </div>
                    <div className={styles.promptTextGroup}>
                      <span className={styles.promptTitle}>{starter.title}</span>
                      <span className={styles.promptDesc}>{starter.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Discovery Topics (Figma Node 760:2799: h=64px) */}
          <div className={styles.topicsBar}>
            <div className={styles.topicsLeft}>
              <span className={styles.topicsTitle}>Khám phá nhanh theo chủ đề:</span>
              <span className={styles.topicsSubtitle}>Chọn lối tắt dịch vụ hoặc nhắn tin trực tiếp</span>
            </div>

            <div className={styles.topicsButtons}>
              <button
                type="button"
                className={styles.topicBtn}
                onClick={() => onSelectPromptStarter('Gợi ý bắp nước và combo ưu đãi hôm nay')}
              >
                <Utensils size={15} color="#ffffff" aria-hidden="true" />
                <span>BẮP & NƯỚC</span>
              </button>

              <button
                type="button"
                className={styles.topicBtn}
                onClick={() => onSelectPromptStarter('Kiểm tra ví voucher và khuyến mãi')}
              >
                <Ticket size={15} color="#ffffff" aria-hidden="true" />
                <span>VÍ VOUCHER</span>
              </button>

              <button
                type="button"
                className={styles.topicBtn}
                onClick={() => onSelectPromptStarter('Danh sách rạp chiếu gần tôi')}
              >
                <Building2 size={15} color="#ffffff" aria-hidden="true" />
                <span>HỆ THỐNG RẠP</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Dialogue stream when user has ongoing interaction */
        <div className={styles.messagesList}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`${styles.messageWrapper} ${isUser ? styles.userWrapper : styles.agentWrapper}`}
              >
                {!isUser && (
                  <div className={styles.agentMsgAvatar}>
                    <Bot size={18} color="#ffffff" aria-hidden="true" />
                  </div>
                )}

                <div className={styles.messageContentCol}>
                  <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.agentBubble}`}>
                    <p className={styles.bubbleText}>{msg.text}</p>
                    <span className={styles.timestamp}>{msg.timestamp}</span>
                  </div>

                  {/* Embedded Interactive Components */}
                  {msg.embeddedCardType === 'showtimes' && (
                    <div className={styles.embeddedCardContainer}>
                      <EmbeddedShowtimeCard
                        movieTitle={msg.cardData?.movieTitle}
                        cinemaName={msg.cardData?.cinemaName}
                        showtimes={msg.cardData?.showtimes}
                        selectedId={msg.cardData?.selectedShowtimeId}
                        onSelectShowtime={onSelectShowtime}
                      />
                    </div>
                  )}

                  {msg.embeddedCardType === 'seatmap' && (
                    <div className={styles.embeddedCardContainer}>
                      <EmbeddedSeatMap
                        movieTitle={msg.cardData?.movieTitle}
                        cinemaName={msg.cardData?.cinemaName}
                        roomName={msg.cardData?.roomName}
                        showtimeTime={msg.cardData?.showtimeTime}
                        initialSelectedSeats={msg.cardData?.selectedSeats}
                        onConfirmSeats={onConfirmSeats}
                      />
                    </div>
                  )}

                  {msg.embeddedCardType === 'summary' && (
                    <div className={styles.embeddedCardContainer}>
                      <EmbeddedOrderSummary
                        movieTitle={msg.cardData?.movieTitle}
                        cinemaName={msg.cardData?.cinemaName}
                        roomName={msg.cardData?.roomName}
                        showtimeTime={msg.cardData?.showtimeTime}
                        selectedSeats={msg.cardData?.selectedSeats}
                        totalPrice={msg.cardData?.totalPrice}
                        onProceedToPayment={onProceedToPayment}
                      />
                    </div>
                  )}

                  {msg.embeddedCardType === 'payment' && (
                    <div className={styles.embeddedCardContainer}>
                      <EmbeddedPaymentCard
                        totalPrice={msg.cardData?.totalPrice}
                        onExecutePayment={onExecutePayment}
                      />
                    </div>
                  )}

                  {msg.embeddedCardType === 'ticket' && msg.cardData?.ticket && (
                    <div className={styles.embeddedCardContainer}>
                      <EmbeddedETicketCard ticket={msg.cardData.ticket} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
