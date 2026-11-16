import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMovieByIdOrSlug } from '@/features/movie-details/model/movie-fixtures';
import { WriteReviewView } from '@/features/movie-details/components/WriteReviewView';

export const metadata: Metadata = {
  title: 'Viết đánh giá & Cảm nhận phim | CinoraAgent',
  description: 'Đánh giá số sao và chia sẻ cảm nhận về bộ phim với cộng đồng điện ảnh CineMember.',
};

interface MovieReviewPageProps {
  params: Promise<{
    movieId: string;
  }>;
}

export default async function MovieReviewPage({ params }: MovieReviewPageProps) {
  const { movieId } = await params;
  const movie = getMovieByIdOrSlug(movieId);

  if (!movie) {
    notFound();
  }

  return <WriteReviewView movie={movie} />;
}
