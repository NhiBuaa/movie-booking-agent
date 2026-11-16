import React from 'react';
import type { Metadata } from 'next';
import { ConcessionsView } from '@/features/booking/components/ConcessionsView.tsx';

interface ConcessionsPageProps {
  params: Promise<{
    movieId: string;
  }>;
}

export const metadata: Metadata = {
  title: 'Chọn bắp nước & Combo | CinoraAgent',
  description: 'Thêm bắp rang bơ và nước ngọt điện ảnh cho buổi xem phim trọn vẹn tại rạp.',
};

export default async function ConcessionsPage({ params }: ConcessionsPageProps) {
  const { movieId } = await params;
  return <ConcessionsView movieId={movieId} />;
}
