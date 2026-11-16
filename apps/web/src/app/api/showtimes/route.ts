import type { MovieFormat } from '@platform/contracts';
import { getShowtimes } from '../../../server/catalog-adapter.ts';
import { jsonSuccess } from '../../../server/response.ts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const movieId = searchParams.get('movieId') || undefined;
  const cinemaId = searchParams.get('cinemaId') || undefined;
  const date = searchParams.get('date') || undefined;
  const format = (searchParams.get('format') as MovieFormat) || undefined;
  const status = searchParams.get('status') || undefined;

  const schedules = getShowtimes({ movieId, cinemaId, date, format, status });
  return jsonSuccess(schedules);
}
