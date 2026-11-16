import type { MovieFormat, MovieStatus } from '@platform/contracts';
import { listMovies } from '../../../server/catalog-adapter.ts';
import { jsonSuccess } from '../../../server/response.ts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || undefined;
  const genre = searchParams.get('genre') || undefined;
  const cinemaId = searchParams.get('cinemaId') || undefined;
  const format = (searchParams.get('format') as MovieFormat) || undefined;
  const date = searchParams.get('date') || undefined;
  const status = (searchParams.get('status') as MovieStatus) || undefined;
  const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined;
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;

  const movies = listMovies({ q, genre, cinemaId, format, date, status, page, limit });
  return jsonSuccess(movies);
}
