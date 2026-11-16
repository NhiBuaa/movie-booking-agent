'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import styles from '../styles/search-bar.module.css';

export const SearchBar: React.FC = () => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/search');
    }
  };

  return (
    <section className={styles.searchSection} aria-label="Quick Search">
      <h2 className={styles.searchLabel}>Tìm kiếm phim</h2>
      <form className={styles.searchBarForm} onSubmit={handleSubmit}>
        <div className={`${styles.inputWrapper} ${isFocused ? styles.inputWrapperFocus : ''}`}>
          <Search size={16} color="#8F8F8F" className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            className={styles.inputField}
            placeholder="Nhập tên phim, thể loại hoặc rạp chiếu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {query && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setQuery('')}
              aria-label="Xóa tìm kiếm"
            >
              <X size={14} color="#8F8F8F" aria-hidden="true" />
            </button>
          )}
        </div>

        <button type="submit" className={styles.submitBtn}>
          <Search size={16} color="#000000" aria-hidden="true" />
          <span>Tìm phim</span>
        </button>
      </form>
    </section>
  );
};
