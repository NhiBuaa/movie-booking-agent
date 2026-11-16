import React from 'react';
import type { Metadata } from 'next';
import { SeatSelectionView } from '@/features/booking/components/SeatSelectionView';

export const metadata: Metadata = {
  title: 'Chọn ghế theo suất chiếu | CINORAGENT',
  description: 'Chọn ghế xem phim phòng chiếu IMAX Laser, giữ chỗ 10 phút trực tiếp từ Cinema Core API.',
};

interface ShowtimeSeatsPageProps {
  params: Promise<{
    showtimeId: string;
  }>;
}

export default async function ShowtimeSeatsPage({ params }: ShowtimeSeatsPageProps) {
  const { showtimeId } = await params;

  return (
    <SeatSelectionView
      initialMovieId="chuyen-tau-cuoi-he"
      initialShowtimeId={showtimeId}
    />
  );
}
