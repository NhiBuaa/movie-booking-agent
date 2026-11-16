import { generateStandardSeatMap } from '../../../server/hold-adapter.ts';
import { jsonError, jsonSuccess } from '../../../server/response.ts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const showtimeId = searchParams.get('showtimeId');

  if (!showtimeId) {
    return jsonError('MISSING_SHOWTIME_ID', 'Vui lòng cung cấp mã suất chiếu (showtimeId).', 400);
  }

  const seatMap = generateStandardSeatMap(showtimeId);
  if (!seatMap) {
    return jsonError('SHOWTIME_NOT_FOUND', `Không tìm thấy suất chiếu '${showtimeId}'.`, 404);
  }

  return jsonSuccess(seatMap);
}
