import crypto from 'node:crypto';
import type {
  CreateHoldRequest,
  CreateHoldResponse,
  HeldSeatItemDto,
  SeatMapDto,
  SeatStateDto,
} from '../../../../packages/contracts/src/index.ts';
import {
  HoldStatus,
  SeatStatus,
  SeatType,
} from '../../../../packages/contracts/src/index.ts';
import { getShowtimeSlotDetails } from './catalog-adapter.ts';

export interface StoredHold {
  holdId: string;
  showtimeId: string;
  seatIds: string[];
  expiresAt: number;
  totalPrice: number;
  seats: HeldSeatItemDto[];
  status: HoldStatus;
  userEmail?: string;
  userId?: string;
}

const holdsStore = new Map<string, StoredHold>();

const DEFAULT_RESERVED_SEATS = new Set<string>(['B3', 'B4', 'C6', 'F4', 'G5']);

export function generateStandardSeatMap(showtimeId: string): SeatMapDto {
  const slotDetails = getShowtimeSlotDetails(showtimeId);
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seats: SeatStateDto[] = [];
  let availableCount = 0;

  const currentlyHeld = new Set<string>();
  const now = Date.now();
  for (const [holdId, hold] of holdsStore.entries()) {
    if (hold.status === HoldStatus.ACTIVE) {
      if (hold.expiresAt <= now) {
        hold.status = HoldStatus.EXPIRED;
      } else if (hold.showtimeId === showtimeId) {
        for (const s of hold.seatIds) {
          currentlyHeld.add(s);
        }
      }
    } else if (hold.status === HoldStatus.CONSUMED && hold.showtimeId === showtimeId) {
      for (const s of hold.seatIds) {
        currentlyHeld.add(s);
      }
    }
  }

  const standardPrice = slotDetails.pricing.standardPrice;
  const vipPrice = slotDetails.pricing.vipPrice;
  const sweetboxPrice = Math.round(slotDetails.pricing.sweetboxPrice / 2);

  for (const row of rows) {
    for (let col = 1; col <= 8; col++) {
      const id = `${row}${col}`;
      let type: (typeof SeatType)[keyof typeof SeatType] = SeatType.STANDARD;
      let price = standardPrice;
      let pairId: string | undefined = undefined;

      if (['E', 'F', 'G'].includes(row)) {
        type = SeatType.VIP;
        price = vipPrice;
      } else if (row === 'H') {
        type = SeatType.SWEETBOX;
        price = sweetboxPrice;
        const pairNum = col % 2 === 1 ? col + 1 : col - 1;
        pairId = col % 2 === 1 ? `H${col}-H${pairNum}` : `H${pairNum}-H${col}`;
      }

      let status: (typeof SeatStatus)[keyof typeof SeatStatus] = SeatStatus.AVAILABLE;
      if (DEFAULT_RESERVED_SEATS.has(id)) {
        status = SeatStatus.RESERVED;
      } else if (currentlyHeld.has(id)) {
        status = SeatStatus.HELD;
      } else {
        availableCount++;
      }

      seats.push({
        id,
        row,
        col,
        label: id,
        type,
        status,
        price,
        pairId,
      });
    }
  }

  return {
    showtimeId,
    auditoriumId: 'aud-01',
    auditoriumName: slotDetails.auditoriumName,
    movieId: slotDetails.movieId,
    movieTitle: slotDetails.movieTitle,
    cinemaName: slotDetails.cinemaName,
    format: slotDetails.format,
    totalSeats: 64,
    availableCount,
    seats,
  };
}

export type CreateHoldResult =
  | { success: true; hold: CreateHoldResponse }
  | { success: false; error: string; code: string; status: number };

export function createSeatHold(req: CreateHoldRequest): CreateHoldResult {
  if (!req || !req.showtimeId) {
    return {
      success: false,
      code: 'MISSING_FIELD',
      error: 'Vui lòng cung cấp mã suất chiếu (showtimeId).',
      status: 400,
    };
  }

  if (!req.seatIds || !Array.isArray(req.seatIds) || req.seatIds.length === 0) {
    return {
      success: false,
      code: 'EMPTY_SEATS',
      error: 'Vui lòng chọn ít nhất 1 ghế.',
      status: 400,
    };
  }

  // Check duplicate seats in request
  const uniqueSeats = new Set(req.seatIds);
  if (uniqueSeats.size !== req.seatIds.length) {
    return {
      success: false,
      code: 'DUPLICATE_SEATS',
      error: 'Danh sách ghế chứa ghế bị trùng lặp.',
      status: 400,
    };
  }

  if (req.seatIds.length > 6) {
    return {
      success: false,
      code: 'MAX_SEATS_EXCEEDED',
      error: 'Mỗi lần đặt chỉ được chọn tối đa 6 ghế.',
      status: 400,
    };
  }

  // Validate userEmail format if provided
  if (req.userEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(req.userEmail.trim())) {
      return {
        success: false,
        code: 'INVALID_EMAIL',
        error: 'Địa chỉ email người giữ chỗ không hợp lệ.',
        status: 400,
      };
    }
  }

  const seatMap = generateStandardSeatMap(req.showtimeId);
  const seatMapLookup = new Map(seatMap.seats.map((s) => [s.id, s]));

  for (const seatId of req.seatIds) {
    const seat = seatMapLookup.get(seatId);
    if (!seat) {
      return {
        success: false,
        code: 'INVALID_SEAT',
        error: `Ghế ${seatId} không tồn tại trong phòng chiếu.`,
        status: 400,
      };
    }

    if (seat.type === SeatType.SWEETBOX && seat.pairId) {
      const [p1, p2] = seat.pairId.split('-');
      const otherId = seatId === p1 ? p2 : p1;
      if (!req.seatIds.includes(otherId)) {
        return {
          success: false,
          code: 'SWEETBOX_PAIR_REQUIRED',
          error: `Ghế đôi Sweetbox ${seatId} phải được chọn cùng ghế ${otherId}.`,
          status: 400,
        };
      }
    }
  }

  const unavailableSeats: string[] = [];
  for (const seatId of req.seatIds) {
    const seat = seatMapLookup.get(seatId);
    if (seat?.status !== SeatStatus.AVAILABLE) {
      unavailableSeats.push(seatId);
    }
  }

  if (unavailableSeats.length > 0) {
    return {
      success: false,
      code: 'SEATS_UNAVAILABLE',
      error: `Ghế ${unavailableSeats.join(', ')} đã có người giữ hoặc đã bán.`,
      status: 409,
    };
  }

  // Cryptographically secure hold ID
  const holdId = `HOLD-${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
  const holdExpiresAt = Date.now() + 300 * 1000;

  const heldSeats: HeldSeatItemDto[] = req.seatIds.map((id) => {
    const s = seatMapLookup.get(id)!;
    return {
      id: s.id,
      label: s.label,
      price: s.price,
      type: s.type,
    };
  });

  const totalPrice = heldSeats.reduce((sum, s) => sum + s.price, 0);

  const storedHold: StoredHold = {
    holdId,
    showtimeId: req.showtimeId,
    seatIds: req.seatIds,
    expiresAt: holdExpiresAt,
    totalPrice,
    seats: heldSeats,
    status: HoldStatus.ACTIVE,
    userEmail: req.userEmail?.trim(),
    userId: req.userId?.trim(),
  };

  holdsStore.set(holdId, storedHold);

  return {
    success: true,
    hold: {
      holdId,
      showtimeId: req.showtimeId,
      status: HoldStatus.ACTIVE,
      holdExpiresAt,
      holdDurationSeconds: 300,
      seats: heldSeats,
      totalPrice,
    },
  };
}

export type ReleaseHoldResult =
  | { success: true; released: boolean }
  | { success: false; error: string; code: string; status: number };

export function releaseSeatHold(holdId: string, callerEmail?: string): ReleaseHoldResult {
  const hold = holdsStore.get(holdId);
  if (!hold) {
    return {
      success: false,
      code: 'HOLD_NOT_FOUND',
      error: `Không tìm thấy mã giữ chỗ '${holdId}'.`,
      status: 404,
    };
  }

  if (hold.status === HoldStatus.CONSUMED) {
    return {
      success: false,
      code: 'HOLD_ALREADY_CONSUMED',
      error: 'Giữ chỗ này đã được sử dụng tạo đơn hàng thành công, không thể hủy giữ.',
      status: 409,
    };
  }

  if (hold.userEmail && callerEmail) {
    if (hold.userEmail.toLowerCase() !== callerEmail.toLowerCase().trim()) {
      return {
        success: false,
        code: 'FORBIDDEN',
        error: 'Bạn không có quyền hủy giữ chỗ của người dùng khác.',
        status: 403,
      };
    }
  }

  hold.status = HoldStatus.CANCELLED;
  return { success: true, released: true };
}

export function consumeSeatHold(holdId: string): boolean {
  const hold = holdsStore.get(holdId);
  if (!hold || hold.status !== HoldStatus.ACTIVE || hold.expiresAt <= Date.now()) {
    return false;
  }
  hold.status = HoldStatus.CONSUMED;
  return true;
}

export function getHoldById(holdId: string): StoredHold | null {
  return holdsStore.get(holdId) || null;
}

export function getActiveHold(holdId: string): StoredHold | null {
  const hold = holdsStore.get(holdId);
  if (!hold) return null;
  if (hold.status !== HoldStatus.ACTIVE) return null;
  if (hold.expiresAt <= Date.now()) {
    hold.status = HoldStatus.EXPIRED;
    return null;
  }
  return hold;
}
