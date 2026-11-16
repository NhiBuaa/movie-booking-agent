import type { CreatePaymentIntentRequest } from '../../../../../../packages/contracts/src/index.ts';
import { createPaymentIntent } from '../../../../server/order-adapter.ts';
import { jsonError, jsonSuccess } from '../../../../server/response.ts';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreatePaymentIntentRequest;
    const result = createPaymentIntent(body);

    if (!result.success) {
      return jsonError(result.code, result.error, result.status);
    }

    return jsonSuccess(result.paymentIntent, 201, 'Khởi tạo thanh toán thành công.');
  } catch (_err) {
    return jsonError('BAD_REQUEST', 'Dữ liệu yêu cầu thanh toán không hợp lệ.', 400);
  }
}
