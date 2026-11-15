'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import styles from '../styles/chat-composer.module.css';

interface ChatComposerProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendMessage,
  disabled = false,
}) => {
  const [inputText, setInputText] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || disabled) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className={styles.composerContainer} data-testid="chat-composer">
      {/* Input Form (Figma Node 760:2817: h=72px, pinned bottom) */}
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            className={styles.textInput}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhắn tin cho Buaa..."
            disabled={disabled}
            aria-label="Nhập tin nhắn cho trợ lý Buaa"
          />
        </div>
        <button
          type="submit"
          className={styles.sendButton}
          disabled={disabled || !inputText.trim()}
          title="Gửi tin nhắn"
        >
          <Send size={15} className={styles.sendIcon} aria-hidden="true" />
          <span>GỬI</span>
        </button>
      </form>
    </div>
  );
};
