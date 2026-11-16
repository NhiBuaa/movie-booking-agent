import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchView } from '@/features/search/components/SearchView';
import { SearchLoadingState } from '@/features/search/components/SearchLoadingState';

export const metadata: Metadata = {
  title: 'Kết quả tìm kiếm & Bộ lọc phim | CINORAGENT',
  description: 'Tìm kiếm phim, rạp chiếu, định dạng 2D/IMAX và lịch chiếu mới nhất trên CINORAGENT.',
};

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingState />}>
      <SearchView />
    </Suspense>
  );
}
