import type { CreateOrderRequest } from '../../../../../packages/contracts/src/index.ts';
import { createOrder } from '../../../server/order-adapter.ts';
import { jsonError, jsonSuccess } from '../../../server/response.ts';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderRequest;
    const result = createOrder(body);

    if (!result.success) {
      return jsonError(result.code, result.error, result.status);
    }

    return jsonSuccess(result.order, 201, 'Khởi tạo đơn hàng thành công.');
  } catch (_err) {
    return jsonError('BAD_REQUEST', 'Dữ liệu đơn hàng không hợp lệ.', 400);
  }
}
