'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, RotateCcw } from 'lucide-react';
import type { FilterCategory, FilterOption } from '../model/types.ts';
import {
  GENRE_OPTIONS,
  CINEMA_OPTIONS,
  FORMAT_OPTIONS,
  DATE_OPTIONS,
} from '../model/search-fixtures.ts';
import styles from '../styles/filter-bar.module.css';

interface FilterBarProps {
  genre: string;
  cinema: string;
  format: string;
  date: string;
  isFilterActive: boolean;
  onSelectFilter: (category: FilterCategory, value: string) => void;
  onResetFilters: () => void;
}

export function FilterBar({
  genre,
  cinema,
  format,
  date,
  isFilterActive,
  onSelectFilter,
  onResetFilters,
}: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<FilterCategory | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleDropdown = (category: FilterCategory) => {
    setOpenDropdown((prev) => (prev === category ? null : category));
  };

  const handleSelect = (category: FilterCategory, val: string) => {
    onSelectFilter(category, val);
    setOpenDropdown(null);
  };

  // Helper config for categories
  const filterConfigs: {
    category: FilterCategory;
    labelPrefix: string;
    currentValue: string;
    options: FilterOption[];
  }[] = [
    {
      category: 'genre',
      labelPrefix: 'Thể loại: ',
      currentValue: genre,
      options: GENRE_OPTIONS,
    },
    {
      category: 'cinema',
      labelPrefix: 'Rạp: ',
      currentValue: cinema,
      options: CINEMA_OPTIONS,
    },
    {
      category: 'format',
      labelPrefix: 'Định dạng: ',
      currentValue: format,
      options: FORMAT_OPTIONS,
    },
    {
      category: 'date',
      labelPrefix: 'Ngày chiếu: ',
      currentValue: date,
      options: DATE_OPTIONS,
    },
  ];

  return (
    <div
      className={styles.filterBarContainer}
      ref={containerRef}
      data-name="S02 / Active Filter State"
    >
      <div className={styles.dropdownsGroup}>
        {filterConfigs.map(({ category, labelPrefix, currentValue, options }) => {
          const selectedOption = options.find((o) => o.value === currentValue);
          const displayLabel = selectedOption
            ? `${labelPrefix}${selectedOption.label}`
            : `${labelPrefix}Tất cả`;
          const isOpen = openDropdown === category;
          const isCategoryActive = currentValue !== '';

          return (
            <div key={category} className={styles.dropdownWrapper}>
              <button
                type="button"
                className={`${styles.filterTrigger} ${
                  isOpen ? styles.filterTriggerOpen : ''
                } ${isCategoryActive ? styles.filterTriggerActive : ''}`}
                onClick={() => toggleDropdown(category)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                aria-label={displayLabel}
              >
                <span className={styles.triggerLabel}>{displayLabel}</span>
                <span className={`${styles.chevronIcon} ${isOpen ? styles.chevronIconRotated : ''}`}>
                  <ChevronDown size={14} aria-hidden="true" />
                </span>
              </button>

              {isOpen && (
                <div
                  className={styles.dropdownPopover}
                  role="listbox"
                  aria-label={`Danh sách tùy chọn ${labelPrefix}`}
                >
                  {options.map((opt) => {
                    const isSelected = opt.value === currentValue;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`${styles.optionItem} ${
                          isSelected ? styles.optionItemSelected : ''
                        }`}
                        onClick={() => handleSelect(category, opt.value)}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <span>{opt.label}</span>
                        {isSelected && (
                          <span className={styles.checkIcon}>
                            <Check size={14} color="#da291c" strokeWidth={2.5} aria-hidden="true" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reset Filter Button */}
      <button
        type="button"
        className={`${styles.resetButton} ${
          isFilterActive ? styles.resetButtonActive : styles.resetButtonDisabled
        }`}
        disabled={!isFilterActive}
        onClick={onResetFilters}
        aria-label="Xóa bộ lọc tìm kiếm"
        data-name="S02 / Reset Disabled State"
      >
        <RotateCcw size={14} aria-hidden="true" />
        <span>Xóa bộ lọc</span>
      </button>
    </div>
  );
}
