import type {
  CreateHoldRequest,
  ReleaseHoldRequest,
} from '../../../../../packages/contracts/src/index.ts';
import { createSeatHold, releaseSeatHold } from '../../../server/hold-adapter.ts';
import { jsonError, jsonSuccess } from '../../../server/response.ts';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateHoldRequest;
    const result = createSeatHold(body);

    if (!result.success) {
      return jsonError(result.code, result.error, result.status);
    }

    return jsonSuccess(result.hold, 201, 'Giữ ghế thành công (TTL 5 phút).');
  } catch (_err) {
    return jsonError('BAD_REQUEST', 'Dữ liệu yêu cầu không hợp lệ.', 400);
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as ReleaseHoldRequest;
    if (!body.holdId) {
      return jsonError('MISSING_HOLD_ID', 'Vui lòng cung cấp mã giữ chỗ (holdId).', 400);
    }

    const released = releaseSeatHold(body.holdId);
    return jsonSuccess({ released });
  } catch (_err) {
    return jsonError('BAD_REQUEST', 'Dữ liệu yêu cầu không hợp lệ.', 400);
  }
}
