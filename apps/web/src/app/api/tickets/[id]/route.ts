import { getTicketResult } from '../../../../server/order-adapter.ts';
import { jsonError, jsonSuccess } from '../../../../server/response.ts';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const callerEmail = request.headers.get('x-user-email') || undefined;
  const result = getTicketResult(id, callerEmail);

  if (!result.success) {
    return jsonError(result.code, result.error, result.status);
  }

  return jsonSuccess(result.ticket);
}
