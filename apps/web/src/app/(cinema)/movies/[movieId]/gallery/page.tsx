import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMovieByIdOrSlug } from '@/features/movie-details/model/movie-fixtures';
import { MovieGalleryView } from '@/features/movie-details/components/MovieGalleryView';

interface MovieGalleryPageProps {
  params: Promise<{
    movieId: string;
  }>;
}

export async function generateMetadata({ params }: MovieGalleryPageProps): Promise<Metadata> {
  const { movieId } = await params;
  const movie = getMovieByIdOrSlug(movieId);

  if (!movie) {
    return {
      title: 'Thư viện ảnh | CinoraAgent',
    };
  }

  return {
    title: `${movie.title} — Thư viện ảnh & Hậu trường / Movie Photo Gallery | CinoraAgent`,
    description: `Khám phá 24 tư liệu ảnh phân cảnh, hình ảnh hậu trường sản xuất (BTS) và poster nghệ thuật phim ${movie.title}.`,
  };
}

export default async function MovieGalleryPage({ params }: MovieGalleryPageProps) {
  const { movieId } = await params;
  const movie = getMovieByIdOrSlug(movieId);

  if (!movie) {
    notFound();
  }

  return <MovieGalleryView movie={movie} />;
}
