import { listCinemas } from '../../../server/catalog-adapter.ts';
import { jsonSuccess } from '../../../server/response.ts';

export async function GET(_request: Request) {
  const cinemas = listCinemas();
  return jsonSuccess(cinemas);
}
