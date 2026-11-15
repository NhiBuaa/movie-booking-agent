import type { Seat, SeatType, ShowtimeDetails } from './types.ts';

export const PRICE_STANDARD = 100000;
export const PRICE_VIP = 160000; // Figma Node 513:340: VIP H7, H8 = 160.000 đ
export const PRICE_SWEETBOX = 260000; // 260.000 đ per pair (130.000 đ each seat)

export const DEFAULT_SHOWTIME_FIXTURE: ShowtimeDetails = {
  movieId: 'chuyen-tau-cuoi-he',
  showtimeId: 'BK-2026-CHUYENTAU',
  movieTitle: 'Chuyến tàu cuối hè',
  format: 'IMAX Laser',
  cinemaName: 'Cinora Đồng Khởi',
  roomName: 'Phòng chiếu 01 (IMAX)',
  showtimeText: '18:30 – Thứ Bảy (07/11)',
  durationMinutes: 115,
  ageRating: 'T18',
  posterUrl: '/images/artworks/train-chuyen-tau-cuoi-he.png',
};

// Reserved / sold seats from Figma node 515:371
const RESERVED_SEAT_IDS = new Set<string>([
  'B4', 'B5',
  'F8', 'F9',
  'K10', 'K11',
  'C7',
  'G5'
]);

/**
 * Builds the IMAX auditorium matrix:
 * Rows A-D: Standard (100.000 đ)
 * Rows E-H: VIP (130.000 đ)
 * Row I: Wings Standard (I1-I3, I12), Center VIP (I4-I11) (130.000 đ)
 * Row J: Sweetbox couples (J1-J2, J3-J4, J5-J6, J7-J8, J9-J10, J11-J12: 260.000 đ/pair)
 * Row K: Standard (100.000 đ)
 */
function generateIMAXSeats(): Seat[] {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  const seats: Seat[] = [];

  for (const row of rows) {
    for (let num = 1; num <= 12; num++) {
      const id = `${row}${num}`;
      let type: SeatType = 'standard';
      let price = PRICE_STANDARD;
      let pairId: string | undefined = undefined;

      if (['A', 'B', 'C', 'D', 'K'].includes(row)) {
        type = 'standard';
        price = PRICE_STANDARD;
      } else if (['E', 'F', 'G', 'H'].includes(row)) {
        type = 'vip';
        price = PRICE_VIP;
      } else if (row === 'I') {
        if (num >= 4 && num <= 11) {
          type = 'vip';
          price = PRICE_VIP;
        } else {
          type = 'standard';
          price = PRICE_STANDARD;
        }
      } else if (row === 'J') {
        type = 'sweetbox';
        // Sweetbox seats are sold in pairs (260.000 đ/pair = 130.000 đ/seat)
        price = PRICE_SWEETBOX / 2;
        const pairNum = Math.ceil(num / 2);
        const firstNum = (pairNum - 1) * 2 + 1;
        const secondNum = firstNum + 1;
        pairId = `J${firstNum}-J${secondNum}`;
      }

      const isReserved = RESERVED_SEAT_IDS.has(id);

      seats.push({
        id,
        row,
        number: num,
        type,
        status: isReserved ? 'reserved' : 'available',
        price,
        label: id,
        pairId,
      });
    }
  }

  return seats;
}

export const IMAX_SEATS_FIXTURE: Seat[] = generateIMAXSeats();

export const IMAX_SEATS_MAP: Record<string, Seat> = IMAX_SEATS_FIXTURE.reduce(
  (acc, seat) => {
    acc[seat.id] = seat;
    return acc;
  },
  {} as Record<string, Seat>
);
