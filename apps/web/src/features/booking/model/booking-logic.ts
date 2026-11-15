import type { Seat, SeatToggleResult } from './types.ts';

export const MAX_SEATS_PER_BOOKING = 6;

/**
 * Toggles a seat selection adhering to the 1-6 seats constraint (F12)
 * and Sweetbox pair coupling rules.
 */
export function toggleSeat(
  seatId: string,
  currentSelectedIds: string[],
  seatsMap: Record<string, Seat>,
  maxSeats: number = MAX_SEATS_PER_BOOKING
): SeatToggleResult {
  const targetSeat = seatsMap[seatId];

  if (!targetSeat) {
    return {
      selectedIds: currentSelectedIds,
      error: 'Ghế không tồn tại trong sơ đồ.',
    };
  }

  // Check if seat is reserved / already sold
  if (targetSeat.status === 'reserved' || targetSeat.status === 'held') {
    return {
      selectedIds: currentSelectedIds,
      error: 'Ghế này đã có người đặt trước.',
    };
  }

  // Handle Sweetbox coupled pairs
  if (targetSeat.type === 'sweetbox' && targetSeat.pairId) {
    const pairSeats = Object.values(seatsMap).filter(
      (s) => s.pairId === targetSeat.pairId
    );

    const hasReservedInPair = pairSeats.some(
      (s) => s.status === 'reserved' || s.status === 'held'
    );
    if (hasReservedInPair) {
      return {
        selectedIds: currentSelectedIds,
        error: 'Ghế đôi Sweetbox này đã có người đặt trước.',
      };
    }

    const pairIds = pairSeats.map((s) => s.id);
    const isPairSelected = pairIds.some((id) => currentSelectedIds.includes(id));

    if (isPairSelected) {
      // Unselect both seats in the pair
      const newSelected = currentSelectedIds.filter((id) => !pairIds.includes(id));
      return { selectedIds: newSelected };
    } else {
      // Selecting both seats in the pair
      if (currentSelectedIds.length + pairIds.length > maxSeats) {
        return {
          selectedIds: currentSelectedIds,
          error: `Bạn chỉ có thể chọn tối đa ${maxSeats} ghế trong một lượt đặt vé.`,
        };
      }
      return {
        selectedIds: [...currentSelectedIds, ...pairIds],
      };
    }
  }

  // Standard or VIP single seat
  const isSelected = currentSelectedIds.includes(seatId);

  if (isSelected) {
    const newSelected = currentSelectedIds.filter((id) => id !== seatId);
    return { selectedIds: newSelected };
  } else {
    if (currentSelectedIds.length >= maxSeats) {
      return {
        selectedIds: currentSelectedIds,
        error: `Bạn chỉ có thể chọn tối đa ${maxSeats} ghế trong một lượt đặt vé.`,
      };
    }
    return {
      selectedIds: [...currentSelectedIds, seatId],
    };
  }
}

/**
 * Calculates total ticket price in VNĐ based on currently selected seats.
 */
export function calculateTotalPrice(
  selectedSeatIds: string[],
  seatsMap: Record<string, Seat>
): number {
  return selectedSeatIds.reduce((total, id) => {
    const seat = seatsMap[id];
    return total + (seat ? seat.price : 0);
  }, 0);
}

/**
 * Formats numeric currency to standard Vietnamese display: e.g. 130.000 đ
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount).replace(/,/g, '.') + ' đ';
}

/**
 * Generates user-friendly summary text (e.g. "2 GHẾ LIỀN NHAU · HÀNG H · TỐI ĐA 6 GHẾ")
 */
export function getSelectedSeatsSummary(
  selectedSeatIds: string[],
  seatsMap: Record<string, Seat>,
  maxSeats: number = MAX_SEATS_PER_BOOKING
): string {
  if (selectedSeatIds.length === 0) {
    return `CHƯA CHỌN GHẾ · TỐI ĐA ${maxSeats} GHẾ`;
  }

  const selectedSeats = selectedSeatIds
    .map((id) => seatsMap[id])
    .filter(Boolean) as Seat[];

  // Sort seats by row and number
  selectedSeats.sort((a, b) => {
    if (a.row !== b.row) return a.row.localeCompare(b.row);
    return a.number - b.number;
  });

  const distinctRows = Array.from(new Set(selectedSeats.map((s) => s.row)));

  // Check if seats are adjacent in the same row
  const isSameRow = distinctRows.length === 1;
  let isConsecutive = false;

  if (isSameRow && selectedSeats.length > 1) {
    isConsecutive = true;
    for (let i = 1; i < selectedSeats.length; i++) {
      if (selectedSeats[i].number !== selectedSeats[i - 1].number + 1) {
        isConsecutive = false;
        break;
      }
    }
  }

  if (isSameRow && isConsecutive) {
    return `${selectedSeats.length} GHẾ LIỀN NHAU · HÀNG ${distinctRows[0]} · TỐI ĐA ${maxSeats} GHẾ`;
  }

  return `${selectedSeats.length} GHẾ ĐÃ CHỌN · HÀNG ${distinctRows.join(', ')} · TỐI ĐA ${maxSeats} GHẾ`;
}

/**
 * Groups seat list by row label ("A", "B", ...)
 */
export function groupSeatsByRow(seats: Seat[]): Record<string, Seat[]> {
  return seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);
}
