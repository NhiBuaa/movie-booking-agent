import { generateStandardSeatMap } from '../../../server/hold-adapter.ts';
import { jsonSuccess } from '../../../server/response.ts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const showtimeId = searchParams.get('showtimeId') || 'default-showtime';

  const seatMap = generateStandardSeatMap(showtimeId);
  return jsonSuccess(seatMap);
}
