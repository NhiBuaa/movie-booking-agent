import { listMovies } from '../../../server/catalog-adapter.ts';
import { jsonSuccess } from '../../../server/response.ts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || undefined;
  const genre = searchParams.get('genre') || undefined;
  const cinemaId = searchParams.get('cinemaId') || undefined;

  const movies = listMovies({ q, genre, cinemaId });
  return jsonSuccess(movies);
}
