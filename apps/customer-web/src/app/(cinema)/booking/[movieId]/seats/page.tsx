import React from 'react';
import type { Metadata } from 'next';
import { SeatSelectionView } from '@/features/booking/components/SeatSelectionView';

export const metadata: Metadata = {
  title: 'Chọn ghế xem phim | CINORAGENT',
  description: 'Chọn ghế xem phim phòng chiếu IMAX Laser, giữ chỗ 10 phút trực tiếp từ Cinema Core API.',
};

interface BookingSeatsPageProps {
  params: Promise<{
    movieId: string;
  }>;
}

export default async function BookingSeatsPage({ params }: BookingSeatsPageProps) {
  const { movieId } = await params;

  return (
    <SeatSelectionView
      initialMovieId={movieId}
      initialShowtimeId="BK-2026-CHUYENTAU"
    />
  );
}
