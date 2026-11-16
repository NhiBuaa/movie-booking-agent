import { getTicketById } from '../../../../server/order-adapter.ts';
import { jsonError, jsonSuccess } from '../../../../server/response.ts';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const callerEmail = request.headers.get('x-user-email') || undefined;
  const ticket = getTicketById(id, callerEmail);

  if (!ticket) {
    return jsonError('TICKET_NOT_FOUND', `Không tìm thấy vé xem phim với mã '${id}' hoặc chưa phát hành.`, 404);
  }

  return jsonSuccess(ticket);
}
