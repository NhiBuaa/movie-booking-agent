import type { PaymentWebhookPayload } from '@platform/contracts';
import { processPaymentWebhook } from '../../../../server/order-adapter.ts';
import { jsonError, jsonSuccess } from '../../../../server/response.ts';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PaymentWebhookPayload;
    if (!body || typeof body !== 'object') {
      return jsonError('BAD_REQUEST', 'Dữ liệu webhook không hợp lệ.', 400);
    }

    const result = processPaymentWebhook(body);
    if (!result.success) {
      return jsonError(result.code, result.error, result.status);
    }

    return jsonSuccess(result.response, 200, result.response.message);
  } catch (_err) {
    return jsonError('BAD_REQUEST', 'Dữ liệu JSON webhook không hợp lệ.', 400);
  }
}
