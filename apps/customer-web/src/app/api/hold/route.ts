import type {
  CreateHoldRequest,
  ReleaseHoldRequest,
} from '@platform/contracts';
import { createSeatHold, releaseSeatHold } from '../../../server/hold-adapter.ts';
import { jsonError, jsonSuccess } from '../../../server/response.ts';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateHoldRequest;
    if (!body || typeof body !== 'object') {
      return jsonError('BAD_REQUEST', 'Dữ liệu yêu cầu không hợp lệ.', 400);
    }

    const result = createSeatHold(body);
    if (!result.success) {
      return jsonError(result.code, result.error, result.status);
    }

    return jsonSuccess(result.hold, 201, 'Giữ ghế thành công (TTL 5 phút).');
  } catch (_err) {
    return jsonError('BAD_REQUEST', 'Dữ liệu JSON yêu cầu không hợp lệ.', 400);
  }
}

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as ReleaseHoldRequest;
    if (!body || !body.holdId) {
      return jsonError('MISSING_HOLD_ID', 'Vui lòng cung cấp mã giữ chỗ (holdId).', 400);
    }

    const callerEmail = body.userEmail || request.headers.get('x-user-email') || undefined;
    const result = releaseSeatHold(body.holdId, callerEmail);
    if (!result.success) {
      return jsonError(result.code, result.error, result.status);
    }

    return jsonSuccess({ released: true }, 200, 'Hủy giữ chỗ thành công.');
  } catch (_err) {
    return jsonError('BAD_REQUEST', 'Dữ liệu JSON yêu cầu không hợp lệ.', 400);
  }
}
