'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { Plus, Compass, Ticket, MessageSquare, Search, Check } from 'lucide-react';
import type {
  ChatBookingState,
  ChatMessage,
  ShowtimeOption,
  PaymentMethod,
} from '../model/types.ts';
import {
  createInitialBookingState,
  createInitialMessages,
  handleUserPrompt,
  handleSelectShowtime as logicSelectShowtime,
  handleConfirmSeats as logicConfirmSeats,
  handleProceedToPayment as logicProceedPayment,
  handleExecutePayment as logicExecutePayment,
  formatTimer,
} from '../model/agent-logic.ts';
import { AGENT_HISTORY_SESSIONS } from '../model/agent-fixtures.ts';
import { ChatTimeline } from './ChatTimeline.tsx';
import { ChatComposer } from './ChatComposer.tsx';
import styles from '../styles/agent-workspace.module.css';

export const AgentWorkspaceView: React.FC = () => {
  const [bookingState, setBookingState] = useState<ChatBookingState>(createInitialBookingState);
  const [messages, setMessages] = useState<ChatMessage[]>(createInitialMessages);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [activeSessionId, setActiveSessionId] = useState<string>('session-1');

  // Countdown timer effect for Atomic Hold
  useEffect(() => {
    if (!bookingState.isHoldActive || bookingState.isPaid) return;

    const interval = setInterval(() => {
      setBookingState((prev) => {
        if (prev.holdSecondsLeft <= 1) {
          clearInterval(interval);
          return {
            ...prev,
            holdSecondsLeft: 0,
            isHoldActive: false,
          };
        }
        return {
          ...prev,
          holdSecondsLeft: prev.holdSecondsLeft - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [bookingState.isHoldActive, bookingState.isPaid]);

  // Handler: User sends a message via Composer or Quick Starter
  const handleSendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;

    // 1. Add user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: 'Vừa xong',
      embeddedCardType: 'none',
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // 2. Simulate AI Agent reasoning & response
    setTimeout(() => {
      const { nextState, newMessages } = handleUserPrompt(text, bookingState);
      setBookingState(nextState);
      const agentOnlyMessages = newMessages.filter((m) => m.sender === 'agent');
      setMessages((prev) => [...prev, ...agentOnlyMessages]);
      setIsTyping(false);
    }, 400);
  };

  // Handler: Showtime card selection
  const handleSelectShowtime = (opt: ShowtimeOption) => {
    const { nextState, newMessages } = logicSelectShowtime(opt, bookingState);
    setBookingState(nextState);
    setMessages((prev) => [...prev, ...newMessages]);
  };

  // Handler: Seat selection confirmation
  const handleConfirmSeats = (seats: string[]) => {
    const { nextState, newMessages } = logicConfirmSeats(seats, bookingState);
    setBookingState(nextState);
    setMessages((prev) => [...prev, ...newMessages]);
  };

  // Handler: Proceed to payment card
  const handleProceedPayment = () => {
    const { nextState, newMessages } = logicProceedPayment(bookingState);
    setBookingState(nextState);
    setMessages((prev) => [...prev, ...newMessages]);
  };

  // Handler: Execute payment via gateway
  const handleExecutePayment = async (method: PaymentMethod) => {
    // Generate valid data URL QR payload
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(
        JSON.stringify({
          ticket: 'TKT-8892-VN',
          cinema: 'CGV Đồng Khởi',
          hall: 'Phòng 4',
          movie: 'Chuyen tau cuoi he',
          showtime: '2026-11-07 19:30',
          seats: ['F5', 'F6'],
          status: 'CONFIRMED_CINEMA_CORE',
        }),
        { margin: 1, width: 220, color: { dark: '#000000', light: '#ffffff' } }
      );
    } catch {
      qrDataUrl = '';
    }

    const { nextState, newMessages } = logicExecutePayment(method, bookingState, qrDataUrl);
    setBookingState(nextState);
    setMessages((prev) => [...prev, ...newMessages]);
  };

  // Handler: Reset / New chat
  const handleNewChat = () => {
    setBookingState(createInitialBookingState());
    setMessages(createInitialMessages());
    setActiveSessionId(`session-${Date.now()}`);
  };

  const isInitialView = messages.length <= 1;

  return (
    <div className={styles.workspacePage} data-testid="agent-workspace">
      <div className={styles.workspaceLayout}>
        {/* 02 / Conversation Sidebar (Left Column - Figma Node 760:2665: w=224px) */}
        <aside className={styles.sidebar} aria-label="Lịch sử cuộc trò chuyện">
          <button
            type="button"
            className={styles.newChatBtn}
            onClick={handleNewChat}
            title="Bắt đầu phiên trò chuyện mới"
          >
            <Plus size={16} color="#000000" aria-hidden="true" />
            <span>Trò chuyện mới</span>
          </button>

          <nav className={styles.navShortcuts} aria-label="Shortcuts">
            <Link href="/" className={styles.shortcutBtn}>
              <Compass size={16} color="#8F8F8F" aria-hidden="true" />
              <span>Khám phá</span>
            </Link>
            <Link href="/my-tickets" className={styles.shortcutBtn}>
              <Ticket size={16} color="#8F8F8F" aria-hidden="true" />
              <span>Vé của tôi</span>
            </Link>
          </nav>

          <div className={styles.historySection}>
            <div className={styles.historyTitle}>LỊCH SỬ CUỘC TRÒ CHUYỆN</div>
            <div className={styles.historyList}>
              {AGENT_HISTORY_SESSIONS.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  className={`${styles.historyItem} ${
                    activeSessionId === session.id ? styles.historyItemActive : ''
                  }`}
                  onClick={() => setActiveSessionId(session.id)}
                  title={session.title}
                >
                  <MessageSquare size={14} aria-hidden="true" />
                  <span className={styles.historyItemTitle}>{session.title}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* 03 / Main Workspace Timeline (Center Column - Figma Node 760:2703: flex-1) */}
        <main className={styles.chatArea} aria-label="Khung hội thoại với Trợ lý Buaa">
          {/* Header Bar */}
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderInfo}>
              <h2 className={styles.chatHeaderTitle}>
                {isInitialView ? 'Cuộc trò chuyện mới' : (bookingState.movie || 'Phim tối thứ bảy')}
              </h2>
              <span className={styles.chatHeaderSubtitle}>Buaa · Trợ lý đặt vé</span>
            </div>
          </div>

          {/* Interactive Chat Scroll Timeline */}
          <div className={styles.timelineScrollWrapper}>
            <ChatTimeline
              messages={messages}
              isInitialView={isInitialView}
              onSelectPromptStarter={handleSendMessage}
              onSelectMovie={(movieTitle) => handleSendMessage(`Tôi muốn đặt vé xem phim ${movieTitle}`)}
              onSelectShowtime={handleSelectShowtime}
              onConfirmSeats={handleConfirmSeats}
              onProceedToPayment={handleProceedPayment}
              onExecutePayment={handleExecutePayment}
            />
          </div>

          {/* Composer locked at bottom */}
          <ChatComposer onSendMessage={handleSendMessage} disabled={isTyping} />
        </main>

        {/* 04 / Booking Context Sidebar (Right Column - Figma Node 760:2804: w=256px) */}
        <aside className={styles.contextPanel} aria-label="Tóm tắt bối cảnh đặt vé">
          <div className={styles.contextHeader}>
            <h3 className={styles.contextTitle}>TÓM TẮT NHU CẦU ĐẶT VÉ</h3>
          </div>

          {/* Slots & State List (Figma Node 760:2809 - 760:2836) */}
          <div className={styles.contextCard}>
            <div className={styles.contextField}>
              <span className={styles.fieldLabel}>Số lượng vé:</span>
              <span className={styles.fieldValue}>
                {bookingState.selectedSeats.length > 0 ? `${bookingState.selectedSeats.length} vé` : 'Chưa chọn'}
              </span>
            </div>

            <div className={styles.contextField}>
              <span className={styles.fieldLabel}>Thời gian:</span>
              <span className={styles.fieldValue}>
                {bookingState.selectedShowtime ? bookingState.selectedShowtime.time : 'Chưa chọn'}
              </span>
            </div>

            <div className={styles.contextField}>
              <span className={styles.fieldLabel}>Khu vực:</span>
              <span className={styles.fieldValue}>
                {bookingState.cinema ? 'Quận 1' : 'Chưa chọn'}
              </span>
            </div>

            <div className={styles.contextField}>
              <span className={styles.fieldLabel}>Rạp chiếu:</span>
              <span className={styles.fieldValue}>
                {bookingState.cinema || 'Chưa chọn rạp'}
              </span>
            </div>

            <div className={styles.contextField}>
              <span className={styles.fieldLabel}>Trạng thái giữ chỗ:</span>
              <span className={styles.fieldValue}>
                {bookingState.isPaid ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#107c41' }}>
                    <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                    Đã thanh toán (Vé ISSUED)
                  </span>
                ) : bookingState.isHoldActive ? (
                  `Đang giữ chỗ (${formatTimer(bookingState.holdSecondsLeft)})`
                ) : (
                  'Chưa có ghế được giữ'
                )}
              </span>
            </div>
          </div>

          {/* Atomic Hold explanation card (Figma Node 760:2837: h=110px) */}
          <div className={styles.holdExplanationBox}>
            Ghế được giữ trong 10 phút sau khi bạn xác nhận thành công. Chọn phim chưa giữ chỗ.
          </div>

          {/* CTA / Tìm phim trực tiếp (Figma Node 760:2839: h=44px) */}
          <Link href="/search" className={styles.searchDirectBtn}>
            <Search size={16} aria-hidden="true" />
            <span>TÌM PHIM TRỰC TIẾP</span>
          </Link>
        </aside>
      </div>
    </div>
  );
};
