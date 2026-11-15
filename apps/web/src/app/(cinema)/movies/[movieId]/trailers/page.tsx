import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMovieByIdOrSlug } from '@/features/movie-details/model/movie-fixtures';
import { MovieTrailersView } from '@/features/movie-details/components/MovieTrailersView';

interface MovieTrailersPageProps {
  params: Promise<{
    movieId: string;
  }>;
}

export async function generateMetadata({ params }: MovieTrailersPageProps): Promise<Metadata> {
  const { movieId } = await params;
  const movie = getMovieByIdOrSlug(movieId);

  if (!movie) {
    return {
      title: 'Trailer & Video | CinoraAgent',
    };
  }

  return {
    title: `${movie.title} — Official Movie Trailers & Video Teasers | CinoraAgent`,
    description: `Xem trailer chính thức, teaser và clip hậu trường độc quyền của phim ${movie.title} định dạng IMAX Laser 2D.`,
  };
}

export default async function MovieTrailersPage({ params }: MovieTrailersPageProps) {
  const { movieId } = await params;
  const movie = getMovieByIdOrSlug(movieId);

  if (!movie) {
    notFound();
  }

  return <MovieTrailersView movie={movie} />;
}
