import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CinemaDetailView } from '@/features/cinemas/components/CinemaDetailView.tsx';
import { CINEMA_DETAIL_FIXTURES, CINEMA_DIRECTORY_FIXTURES } from '@/features/cinemas/model/cinema-fixtures.ts';

interface CinemaDetailPageProps {
  params: Promise<{
    cinemaId: string;
  }>;
}

export async function generateMetadata({ params }: CinemaDetailPageProps): Promise<Metadata> {
  const { cinemaId } = await params;
  const cinema = CINEMA_DETAIL_FIXTURES[cinemaId] || CINEMA_DETAIL_FIXTURES['cgv-vincom-dong-khoi'];

  if (!cinema) {
    return {
      title: 'Không tìm thấy rạp chiếu | CinoraAgent',
    };
  }

  return {
    title: `${cinema.name} — Chi tiết rạp & Lịch chiếu | CinoraAgent`,
    description: `Lịch chiếu phim hôm nay và tuần này tại ${cinema.name}. Trải nghiệm phòng chiếu IMAX, Dolby Atmos đỉnh cao.`,
  };
}

export default async function CinemaDetailPage({ params }: CinemaDetailPageProps) {
  const { cinemaId } = await params;
  const cinema = CINEMA_DETAIL_FIXTURES[cinemaId] || CINEMA_DETAIL_FIXTURES['cgv-vincom-dong-khoi'];

  if (!cinema) {
    notFound();
  }

  return <CinemaDetailView cinema={cinema} />;
}
