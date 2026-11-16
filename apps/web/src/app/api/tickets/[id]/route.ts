import { getTicketById } from '../../../../server/order-adapter.ts';
import { jsonError, jsonSuccess } from '../../../../server/response.ts';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const ticket = getTicketById(id);

  if (!ticket) {
    return jsonError('TICKET_NOT_FOUND', `Không tìm thấy vé xem phim với mã '${id}'.`, 404);
  }

  return jsonSuccess(ticket);
}
