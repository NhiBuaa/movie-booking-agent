import { getMovieByIdOrSlug } from '../../../../server/catalog-adapter.ts';
import { jsonError, jsonSuccess } from '../../../../server/response.ts';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const movie = getMovieByIdOrSlug(id);

  if (!movie) {
    return jsonError('MOVIE_NOT_FOUND', `Không tìm thấy phim với mã '${id}'.`, 404);
  }

  return jsonSuccess(movie);
}
