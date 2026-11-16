import { getCinemaByIdOrSlug } from '../../../../server/catalog-adapter.ts';
import { jsonError, jsonSuccess } from '../../../../server/response.ts';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const cinema = getCinemaByIdOrSlug(id);

  if (!cinema) {
    return jsonError('CINEMA_NOT_FOUND', `Không tìm thấy rạp với mã '${id}'.`, 404);
  }

  return jsonSuccess(cinema);
}
