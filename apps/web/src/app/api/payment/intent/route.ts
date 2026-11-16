import type { CreatePaymentIntentRequest } from '@platform/contracts';
import { createPaymentIntent } from '../../../../server/order-adapter.ts';
import { jsonError, jsonSuccess } from '../../../../server/response.ts';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePaymentIntentRequest;
    if (!body || typeof body !== 'object') {
      return jsonError('BAD_REQUEST', 'Dữ liệu yêu cầu thanh toán không hợp lệ.', 400);
    }

    const callerEmail = request.headers.get('x-user-email') || undefined;
    const result = createPaymentIntent(body, callerEmail);

    if (!result.success) {
      return jsonError(result.code, result.error, result.status);
    }

    return jsonSuccess(result.paymentIntent, 201, 'Khởi tạo thanh toán thành công.');
  } catch (_err) {
    return jsonError('BAD_REQUEST', 'Dữ liệu JSON yêu cầu thanh toán không hợp lệ.', 400);
  }
}
