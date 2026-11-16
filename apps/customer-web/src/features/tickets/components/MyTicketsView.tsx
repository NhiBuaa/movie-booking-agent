'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Ticket, CheckCircle2 } from 'lucide-react';
import type { TicketData } from '../model/types.ts';
import styles from '../styles/my-tickets.module.css';

interface MyTicketsViewProps {
  tickets: TicketData[];
}

export const MyTicketsView: React.FC<MyTicketsViewProps> = ({ tickets }) => {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'PAST' | 'CANCELLED'>('UPCOMING');

  const upcomingTickets = tickets.filter((t) => t.status === 'upcoming');
  const pastTickets = tickets.filter((t) => t.status === 'past');
  const cancelledTickets = tickets.filter((t) => t.status === 'cancelled');

  const heroTicket = upcomingTickets[0];
  const otherTickets = upcomingTickets.slice(1);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* 02. Page Heading & Breadcrumb */}
        <section className={styles.headingSection} aria-label="Tiêu đề trang">
          <div className={styles.headingMain}>
            <h1 className={styles.pageTitle}>Vé Của Tôi</h1>
            <p className={styles.pageSubtitle}>
              Quản lý vé xem phim sắp chiếu, xuất trình mã QR soát vé và tra cứu lịch sử đặt vé.
            </p>
          </div>
          <div className={styles.breadcrumbText}>TRANG CHỦ / VÉ CỦA TÔI</div>
        </section>

        {/* 03. Status Tabs */}
        <div className={styles.tabsRow} role="tablist" aria-label="Trạng thái vé">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'UPCOMING'}
            className={`${styles.tabBtn} ${activeTab === 'UPCOMING' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('UPCOMING')}
          >
            SẮP CHIẾU ({upcomingTickets.length.toString().padStart(2, '0')})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'PAST'}
            className={`${styles.tabBtn} ${activeTab === 'PAST' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('PAST')}
          >
            ĐÃ XEM (PAST · {pastTickets.length.toString().padStart(2, '0')})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'CANCELLED'}
            className={`${styles.tabBtn} ${activeTab === 'CANCELLED' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('CANCELLED')}
          >
            ĐÃ HỦY / HOÀN TIỀN ({cancelledTickets.length.toString().padStart(2, '0')})
          </button>
        </div>

        {/* 04. Tab Content: Upcoming */}
        {activeTab === 'UPCOMING' && (
          <>
            {heroTicket ? (
              <article className={styles.heroTicketCard} aria-label={`Vé phim ${heroTicket.movieTitle}`}>
                <div className={styles.ticketTopBar}>
                  <div className={styles.statusLeftGroup}>
                    <span className={styles.urgentStatusBadge}>{heroTicket.statusBadge}</span>
                    <span className={styles.readyNotice}>
                      <CheckCircle2
                        size={14}
                        style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }}
                        aria-hidden="true"
                      />
                      Đã giữ chỗ thành công · Sẵn sàng check-in
                    </span>
                  </div>

                  <span className={styles.bookingCode}>MÃ ĐẶT CHỖ: {heroTicket.id}</span>
                </div>

                <div className={styles.ticketMainBody}>
                  <div className={styles.posterCol}>
                    <Image
                      src={heroTicket.posterUrl}
                      alt={heroTicket.movieTitle}
                      fill
                      className={styles.posterImg}
                      sizes="120px"
                    />
                  </div>

                  <div className={styles.ticketContentCol}>
                    <div className={styles.ticketHeaderRow}>
                      <h2 className={styles.movieTitle}>{heroTicket.movieTitle}</h2>
                      <span className={styles.totalPriceText}>
                        TỔNG THANH TOÁN: {heroTicket.totalPaidFormatted}
                      </span>
                    </div>

                    <p className={styles.ticketSubtitle}>
                      {heroTicket.format} · Phụ đề tiếng Việt · Thời lượng {heroTicket.durationFormatted} · {heroTicket.ageRating}
                    </p>

                    <div className={styles.itineraryBox}>
                      <div className={styles.itineraryRow}>
                        <strong>Rạp:</strong> {heroTicket.cinemaName} — {heroTicket.hallName}
                      </div>
                      <div className={styles.itineraryRow}>
                        <strong>Suất chiếu:</strong> {heroTicket.showDate} · {heroTicket.showtime}
                      </div>
                      <div className={styles.itineraryRow}>
                        <strong>Chỗ ngồi:</strong> Ghế {heroTicket.seats.join(', ')} ({heroTicket.seatType}) · Số lượng: {heroTicket.seats.length} Vé
                      </div>
                      {heroTicket.comboDescription && (
                        <div className={styles.itineraryRowMuted}>
                          <strong>Combo F&B:</strong> {heroTicket.comboDescription}
                        </div>
                      )}
                    </div>

                    <div className={styles.ticketActionsRow}>
                      <Link href={`/tickets/${heroTicket.id}`} className={styles.primaryQrBtn}>
                        <span>XEM MÃ QR</span>
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>

                      <Link href={`/tickets/${heroTicket.id}/cancel`} className={styles.secondaryCancelBtn}>
                        YÊU CẦU HỦY / HOÀN VÉ
                      </Link>

                      <a
                        href="https://maps.google.com/?q=CGV+Vincom+Dong+Khoi"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.directionLink}
                      >
                        <span>XEM CHỈ ĐƯỜNG TỚI RẠP</span>
                        <ArrowRight size={13} style={{ display: 'inline', marginLeft: 4 }} aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ) : (
              <p style={{ color: '#8f8f8f', padding: '40px 0', textAlign: 'center' }}>
                Bạn chưa có vé phim sắp chiếu nào.
              </p>
            )}

            {/* 05. Other Upcoming Tickets */}
            {otherTickets.length > 0 && (
              <section className={styles.otherBookingsSection} aria-label="Các suất chiếu khác đã đặt">
                <h3 className={styles.sectionHeading}>CÁC SUẤT CHIẾU KHÁC ĐÃ ĐẶT</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {otherTickets.map((ticket) => (
                    <article key={ticket.id} className={styles.compactTicketCard}>
                      <div className={styles.compactPosterBox}>
                        <Image
                          src={ticket.posterUrl}
                          alt={ticket.movieTitle}
                          fill
                          className={styles.posterImg}
                          sizes="70px"
                        />
                      </div>

                      <div className={styles.compactInfoCol}>
                        <div className={styles.compactTitleRow}>
                          <h4 className={styles.compactTitle}>{ticket.movieTitle}</h4>
                          <span className={styles.issuedBadge}>ĐÃ XÁC NHẬN / ISSUED</span>
                        </div>

                        <p className={styles.compactMetaText}>
                          {ticket.format} · Mã đặt chỗ: {ticket.id}
                        </p>

                        <p className={styles.compactDetailsText}>
                          {ticket.cinemaName} — {ticket.hallName} | Suất {ticket.showtime} {ticket.showDate} | Ghế {ticket.seats.join(', ')} ({ticket.seats.length} Vé)
                        </p>
                      </div>

                      <Link href={`/tickets/${ticket.id}`} className={styles.compactActionBtn}>
                        <span>CHI TIẾT VÉ</span>
                        <ArrowRight size={14} aria-hidden="true" />
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* Past Tickets Tab */}
        {activeTab === 'PAST' && (
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pastTickets.map((ticket) => (
              <article key={ticket.id} className={styles.compactTicketCard}>
                <div className={styles.compactPosterBox}>
                  <Image src={ticket.posterUrl} alt={ticket.movieTitle} fill className={styles.posterImg} sizes="70px" />
                </div>
                <div className={styles.compactInfoCol}>
                  <div className={styles.compactTitleRow}>
                    <h4 className={styles.compactTitle}>{ticket.movieTitle}</h4>
                    <span style={{ fontSize: 11, color: '#8f8f8f', padding: '2px 8px', border: '1px solid #303030' }}>
                      ĐÃ CHIẾU
                    </span>
                  </div>
                  <p className={styles.compactMetaText}>
                    {ticket.cinemaName} | {ticket.showDate} | Ghế {ticket.seats.join(', ')}
                  </p>
                </div>
                <Link href={`/tickets/${ticket.id}`} className={styles.compactActionBtn}>
                  <span>XEM LẠI VÉ</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        )}

        {/* Cancelled Tickets Tab */}
        {activeTab === 'CANCELLED' && (
          <div style={{ padding: '60px 0', textAlign: 'center', color: '#8f8f8f' }}>
            <Ticket size={40} style={{ margin: '0 auto 12px', display: 'block', color: '#666666' }} aria-hidden="true" />
            <p>Không có giao dịch hủy hoặc hoàn tiền nào gần đây.</p>
          </div>
        )}
      </div>
    </div>
  );
};
