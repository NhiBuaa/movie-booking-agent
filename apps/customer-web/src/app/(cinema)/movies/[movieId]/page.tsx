import type { Metadata } from 'next';
import { getMovieByIdOrSlug } from '@/features/movie-details/model/movie-fixtures.ts';
import { MovieDetailsView } from '@/features/movie-details/components/MovieDetailsView.tsx';

interface MovieDetailsPageProps {
  params: Promise<{
    movieId: string;
  }>;
}

export async function generateMetadata({
  params,
}: MovieDetailsPageProps): Promise<Metadata> {
  const { movieId } = await params;
  const movie = getMovieByIdOrSlug(movieId);

  return {
    title: `${movie.title} — Chi tiết phim & Lịch chiếu | CinoraAgent`,
    description: movie.synopsis,
    openGraph: {
      title: `${movie.title} — CinoraAgent`,
      description: movie.synopsis,
      images: [movie.posterUrl],
    },
  };
}

export default async function MovieDetailsPage({
  params,
}: MovieDetailsPageProps) {
  const { movieId } = await params;
  const movie = getMovieByIdOrSlug(movieId);

  return <MovieDetailsView movie={movie} />;
}
