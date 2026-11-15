import test from 'node:test';
import assert from 'node:assert/strict';
import {
  IMAX_SEATS_FIXTURE,
  IMAX_SEATS_MAP,
  PRICE_STANDARD,
  PRICE_VIP,
  PRICE_SWEETBOX,
} from '../src/features/booking/model/booking-fixtures.ts';
import {
  toggleSeat,
  calculateTotalPrice,
  formatCurrency,
  getSelectedSeatsSummary,
  MAX_SEATS_PER_BOOKING,
} from '../src/features/booking/model/booking-logic.ts';

test('S08 Booking Fixtures: IMAX layout integrity', () => {
  assert.equal(IMAX_SEATS_FIXTURE.length, 11 * 12, 'Must have 11 rows × 12 seats = 132 seats');

  // Verify Standard Rows (A-D, K)
  const a1 = IMAX_SEATS_MAP['A1'];
  assert.equal(a1.type, 'standard');
  assert.equal(a1.price, PRICE_STANDARD);

  // Verify VIP Rows (E-H)
  const e5 = IMAX_SEATS_MAP['E5'];
  assert.equal(e5.type, 'vip');
  assert.equal(e5.price, PRICE_VIP);

  const h7 = IMAX_SEATS_MAP['H7'];
  assert.equal(h7.type, 'vip');
  assert.equal(h7.price, PRICE_VIP);

  // Verify Sweetbox Row (J)
  const j1 = IMAX_SEATS_MAP['J1'];
  assert.equal(j1.type, 'sweetbox');
  assert.equal(j1.pairId, 'J1-J2');
  assert.equal(j1.price * 2, PRICE_SWEETBOX, 'Sweetbox couple total price must be 260.000 đ');

  const j2 = IMAX_SEATS_MAP['J2'];
  assert.equal(j2.pairId, 'J1-J2');

  // Verify Sold / Reserved Seats
  assert.equal(IMAX_SEATS_MAP['B4'].status, 'reserved');
  assert.equal(IMAX_SEATS_MAP['B5'].status, 'reserved');
  assert.equal(IMAX_SEATS_MAP['F8'].status, 'reserved');
  assert.equal(IMAX_SEATS_MAP['F9'].status, 'reserved');
  assert.equal(IMAX_SEATS_MAP['K10'].status, 'reserved');
});

test('S08 Booking Logic: Toggle seat selection & unselection', () => {
  let selected: string[] = [];

  // Select A1
  let res = toggleSeat('A1', selected, IMAX_SEATS_MAP);
  assert.deepEqual(res.selectedIds, ['A1']);
  assert.equal(res.error, undefined);
  selected = res.selectedIds;

  // Select A2
  res = toggleSeat('A2', selected, IMAX_SEATS_MAP);
  assert.deepEqual(res.selectedIds, ['A1', 'A2']);
  selected = res.selectedIds;

  // Unselect A1
  res = toggleSeat('A1', selected, IMAX_SEATS_MAP);
  assert.deepEqual(res.selectedIds, ['A2']);
  selected = res.selectedIds;

  // Unselect A2
  res = toggleSeat('A2', selected, IMAX_SEATS_MAP);
  assert.deepEqual(res.selectedIds, []);
});

test('S08 Booking Logic: Reserved seat rejection', () => {
  const initialSelected = ['A1'];
  const res = toggleSeat('B4', initialSelected, IMAX_SEATS_MAP);

  assert.deepEqual(res.selectedIds, ['A1'], 'Selection must not change when clicking reserved seat');
  assert.ok(res.error, 'Must return error message');
  assert.equal(res.error, 'Ghế này đã có người đặt trước.');
});

test('S08 Booking Logic: Maximum 6 seats constraint (F12)', () => {
  let selected = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'];
  assert.equal(selected.length, MAX_SEATS_PER_BOOKING);

  // Attempting to select 7th seat (A7)
  const res = toggleSeat('A7', selected, IMAX_SEATS_MAP, MAX_SEATS_PER_BOOKING);
  assert.deepEqual(res.selectedIds, selected, 'Cannot exceed 6 seats');
  assert.ok(res.error?.includes('tối đa 6 ghế'), 'Must return max 6 seats warning');
});

test('S08 Booking Logic: Sweetbox couple pair coupling', () => {
  let selected: string[] = [];

  // Selecting J1 must select both J1 and J2
  let res = toggleSeat('J1', selected, IMAX_SEATS_MAP);
  assert.deepEqual(res.selectedIds, ['J1', 'J2']);
  selected = res.selectedIds;

  // Unselecting J2 must unselect both J1 and J2
  res = toggleSeat('J2', selected, IMAX_SEATS_MAP);
  assert.deepEqual(res.selectedIds, []);
});

test('S08 Booking Logic: Sweetbox couple respects maximum 6 seats limit', () => {
  // If user already has 5 seats selected, selecting a 2-seat couple would make 7 seats
  const selected = ['A1', 'A2', 'A3', 'A4', 'A5'];
  const res = toggleSeat('J3', selected, IMAX_SEATS_MAP, MAX_SEATS_PER_BOOKING);

  assert.deepEqual(res.selectedIds, selected, 'Cannot add couple if it exceeds max seats');
  assert.ok(res.error?.includes('tối đa 6 ghế'));
});

test('S08 Booking Logic: Price calculation', () => {
  // 0 seats
  assert.equal(calculateTotalPrice([], IMAX_SEATS_MAP), 0);

  // 2 Standard seats (A1, A2) = 200.000 đ
  assert.equal(calculateTotalPrice(['A1', 'A2'], IMAX_SEATS_MAP), 200000);

  // 2 VIP seats (H7, H8) = 320.000 đ (Figma Node 513:340 fixture: 160.000 đ/ghế)
  assert.equal(calculateTotalPrice(['H7', 'H8'], IMAX_SEATS_MAP), 320000);

  // 1 Sweetbox couple (J1, J2) = 260.000 đ
  assert.equal(calculateTotalPrice(['J1', 'J2'], IMAX_SEATS_MAP), 260000);

  // Compound selection: 1 Standard (100k) + 1 VIP (160k) + 1 Sweetbox pair (260k) = 520.000 đ
  assert.equal(
    calculateTotalPrice(['A1', 'H7', 'J1', 'J2'], IMAX_SEATS_MAP),
    520000
  );
});

test('S08 Booking Logic: Vietnamese currency format', () => {
  assert.equal(formatCurrency(100000), '100.000 đ');
  assert.equal(formatCurrency(130000), '130.000 đ');
  assert.equal(formatCurrency(260000), '260.000 đ');
  assert.equal(formatCurrency(320000), '320.000 đ');
  assert.equal(formatCurrency(0), '0 đ');
});

test('S08 Booking Logic: Selected seats summary text generation', () => {
  // 0 seats
  assert.equal(
    getSelectedSeatsSummary([], IMAX_SEATS_MAP),
    'CHƯA CHỌN GHẾ · TỐI ĐA 6 GHẾ'
  );

  // 2 consecutive seats in Row H (Figma exact match)
  assert.equal(
    getSelectedSeatsSummary(['H7', 'H8'], IMAX_SEATS_MAP),
    '2 GHẾ LIỀN NHAU · HÀNG H · TỐI ĐA 6 GHẾ'
  );

  // 2 non-consecutive seats in same row
  assert.equal(
    getSelectedSeatsSummary(['H3', 'H8'], IMAX_SEATS_MAP),
    '2 GHẾ ĐÃ CHỌN · HÀNG H · TỐI ĐA 6 GHẾ'
  );

  // Seats across multiple rows
  assert.equal(
    getSelectedSeatsSummary(['A1', 'H7'], IMAX_SEATS_MAP),
    '2 GHẾ ĐÃ CHỌN · HÀNG A, H · TỐI ĐA 6 GHẾ'
  );
});

test('S08 Booking Logic: Sweetbox row J pairs coverage and coupling', () => {
  const sweetboxSeats = IMAX_SEATS_FIXTURE.filter((s) => s.type === 'sweetbox');
  assert.equal(sweetboxSeats.length, 12, 'Row J must contain exactly 12 sweetbox seats (6 pairs)');

  const pairIds = Array.from(new Set(sweetboxSeats.map((s) => s.pairId)));
  assert.deepEqual(
    pairIds,
    ['J1-J2', 'J3-J4', 'J5-J6', 'J7-J8', 'J9-J10', 'J11-J12'],
    'Must have all 6 distinct Sweetbox pairs'
  );

  // Each pair must have identical prices totaling 260.000 đ
  for (const pid of pairIds) {
    const pair = sweetboxSeats.filter((s) => s.pairId === pid);
    assert.equal(pair.length, 2, `Pair ${pid} must have exactly 2 seats`);
    assert.equal(pair[0].price + pair[1].price, PRICE_SWEETBOX);
  }
});
