import React from 'react';
import type { Metadata } from 'next';
import { CinemaDirectoryView } from '@/features/cinemas/components/CinemaDirectoryView.tsx';
import { CINEMA_DIRECTORY_FIXTURES } from '@/features/cinemas/model/cinema-fixtures.ts';

export const metadata: Metadata = {
  title: 'Danh bạ cụm rạp | CinoraAgent',
  description: 'Khám phá không gian rạp chiếu phim đỉnh cao tại Hà Nội, TP. Hồ Chí Minh và toàn quốc với công nghệ IMAX, Dolby Atmos.',
};

export default function CinemasPage() {
  return <CinemaDirectoryView initialCinemas={CINEMA_DIRECTORY_FIXTURES} />;
}
