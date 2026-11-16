'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, X, Search } from 'lucide-react';
import { SEARCH_SUGGESTIONS } from '../model/search-fixtures.ts';
import styles from '../styles/search-hero-nav.module.css';

interface SearchHeroNavProps {
  query: string;
  onQueryChange: (val: string) => void;
  onSubmit: () => void;
  onSelectSuggestion: (val: string) => void;
}

export function SearchHeroNav({
  query,
  onQueryChange,
  onSubmit,
  onSelectSuggestion,
}: SearchHeroNavProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      onSubmit();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={styles.searchNavRow} data-name="Search and back navigation">
      {/* 1. Home / Back Button */}
      <Link href="/" className={styles.homeButton} aria-label="Về trang chủ">
        <ArrowLeft size={16} aria-hidden="true" />
        <span>Trang chủ</span>
      </Link>

      {/* 2. Search Input with Suggestions */}
      <div className={styles.inputWrapper} ref={wrapperRef}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Nhập tên phim, thể loại hoặc rạp chiếu..."
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          aria-label="Tìm kiếm phim, thể loại hoặc rạp"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-autocomplete="list"
        />

        {query.length > 0 && (
          <button
            type="button"
            className={styles.clearInputButton}
            onClick={() => {
              onQueryChange('');
              setShowSuggestions(false);
            }}
            aria-label="Xóa từ khóa tìm kiếm"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}

        {/* Suggestion Popover */}
        {showSuggestions && (
          <div className={styles.suggestionsPopover} role="listbox">
            {SEARCH_SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                className={styles.suggestionItem}
                onClick={() => {
                  onSelectSuggestion(item);
                  setShowSuggestions(false);
                }}
                role="option"
                aria-selected={query.toLowerCase() === item.toLowerCase()}
              >
                <span>Tìm phim: <strong>{item}</strong></span>
                <span style={{ fontSize: '12px', color: '#8f8f8f' }}>Gợi ý</span>
              </button>
            ))}
            <button
              type="button"
              className={`${styles.suggestionItem} ${styles.suggestionCloseItem}`}
              onClick={() => setShowSuggestions(false)}
            >
              Đóng gợi ý (ESC)
            </button>
          </div>
        )}
      </div>

      {/* 3. Search Submit Button */}
      <button
        type="button"
        className={styles.searchSubmitButton}
        onClick={() => {
          setShowSuggestions(false);
          onSubmit();
        }}
        aria-label="Thực hiện tìm kiếm"
      >
        <Search size={16} color="#000000" aria-hidden="true" />
        <span>Tìm phim</span>
      </button>
    </div>
  );
}
