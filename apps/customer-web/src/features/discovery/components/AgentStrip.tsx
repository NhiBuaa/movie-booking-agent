'use client';

import React from 'react';
import Link from 'next/link';
import { Bot } from 'lucide-react';
import styles from '../styles/agent-strip.module.css';

export const AgentStrip: React.FC = () => {
  return (
    <section className={styles.agentStripSection} aria-label="AI Assistant Quick Access">
      <div className={styles.stripContainer}>
        <div className={styles.contentGroup}>
          <Bot size={18} color="#ffffff" className={styles.commentsIcon} aria-hidden="true" />
          <span className={styles.message}>Chưa biết xem gì? Để Buaa giúp bạn chọn.</span>
        </div>
        <Link href="/chat" className={styles.openBtn}>
          Mở Buaa
        </Link>
      </div>
    </section>
  );
};
