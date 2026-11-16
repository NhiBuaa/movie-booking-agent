import type {
  CreateHoldRequest,
  CreateHoldResponse,
  HeldSeatItemDto,
  SeatMapDto,
  SeatStateDto,
} from '../../../../packages/contracts/src/index.ts';
import {
  HoldStatus,
  MovieFormat,
  SeatStatus,
  SeatType,
} from '../../../../packages/contracts/src/index.ts';

interface StoredHold {
  holdId: string;
  showtimeId: string;
  seatIds: string[];
  expiresAt: number;
  totalPrice: number;
  seats: HeldSeatItemDto[];
}

const activeHolds = new Map<string, StoredHold>();

const DEFAULT_RESERVED_SEATS = new Set<string>(['B3', 'B4', 'C6', 'F4', 'G5']);

export function generateStandardSeatMap(showtimeId: string): SeatMapDto {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seats: SeatStateDto[] = [];
  let availableCount = 0;

  const currentlyHeld = new Set<string>();
  const now = Date.now();
  for (const [holdId, hold] of activeHolds.entries()) {
    if (hold.expiresAt <= now) {
      activeHolds.delete(holdId);
    } else if (hold.showtimeId === showtimeId) {
      for (const s of hold.seatIds) {
        currentlyHeld.add(s);
      }
    }
  }

  for (const row of rows) {
    for (let col = 1; col <= 8; col++) {
      const id = `${row}${col}`;
      let type: (typeof SeatType)[keyof typeof SeatType] = SeatType.STANDARD;
      let price = 100000;
      let pairId: string | undefined = undefined;

      if (['E', 'F', 'G'].includes(row)) {
        type = SeatType.VIP;
        price = 130000;
      } else if (row === 'H') {
        type = SeatType.SWEETBOX;
        price = 130000;
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
    auditoriumName: 'Phòng chiếu 01 (IMAX)',
    movieId: 'chuyen-tau-cuoi-he',
    movieTitle: 'Chuyến tàu cuối hè',
    cinemaName: 'CGV Vincom Đồng Khởi',
    format: MovieFormat.IMAX_LASER,
    totalSeats: 64,
    availableCount,
    seats,
  };
}

export type CreateHoldResult =
  | { success: true; hold: CreateHoldResponse }
  | { success: false; error: string; code: string; status: number };

export function createSeatHold(req: CreateHoldRequest): CreateHoldResult {
  if (!req.seatIds || req.seatIds.length === 0) {
    return {
      success: false,
      code: 'EMPTY_SEATS',
      error: 'Vui lòng chọn ít nhất 1 ghế.',
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

  const holdId = `HOLD-${Date.now().toString(36).toUpperCase()}-${Math.floor(
    Math.random() * 1000
  )}`;
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

  activeHolds.set(holdId, {
    holdId,
    showtimeId: req.showtimeId,
    seatIds: req.seatIds,
    expiresAt: holdExpiresAt,
    totalPrice,
    seats: heldSeats,
  });

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

export function releaseSeatHold(holdId: string): boolean {
  return activeHolds.delete(holdId);
}

export function getActiveHold(holdId: string): StoredHold | null {
  const hold = activeHolds.get(holdId);
  if (!hold) return null;
  if (hold.expiresAt <= Date.now()) {
    activeHolds.delete(holdId);
    return null;
  }
  return hold;
}
