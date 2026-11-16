import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GET as getMovies } from '../src/app/api/movies/route.ts';
import { GET as getMovieById } from '../src/app/api/movies/[id]/route.ts';
import { GET as getCinemas } from '../src/app/api/cinemas/route.ts';
import { GET as getCinemaById } from '../src/app/api/cinemas/[id]/route.ts';
import { GET as getShowtimes } from '../src/app/api/showtimes/route.ts';
import { GET as getSeats } from '../src/app/api/seats/route.ts';
import { POST as postHold, DELETE as deleteHold } from '../src/app/api/hold/route.ts';
import { POST as postOrder } from '../src/app/api/orders/route.ts';
import { POST as postPaymentIntent } from '../src/app/api/payment/intent/route.ts';
import { GET as getTicketById } from '../src/app/api/tickets/[id]/route.ts';

describe('BFF Route Handlers — Integration & Contract Validation', () => {
  it('GET /api/movies should return movie catalog with search filter support', async () => {
    // 1. Get all movies
    const reqAll = new Request('http://localhost:3000/api/movies');
    const resAll = await getMovies(reqAll);
    assert.equal(resAll.status, 200);

    const bodyAll = (await resAll.json()) as any;
    assert.equal(bodyAll.success, true);
    assert.ok(Array.isArray(bodyAll.data));
    assert.ok(bodyAll.data.length >= 4);

    // 2. Filter by search query
    const reqFiltered = new Request('http://localhost:3000/api/movies?q=chuyen-tau');
    const resFiltered = await getMovies(reqFiltered);
    assert.equal(resFiltered.status, 200);

    const bodyFiltered = (await resFiltered.json()) as any;
    assert.equal(bodyFiltered.data.length, 1);
    assert.equal(bodyFiltered.data[0].slug, 'chuyen-tau-cuoi-he');
  });

  it('GET /api/movies/:id should return movie details or 404', async () => {
    // Success case
    const reqSuccess = new Request('http://localhost:3000/api/movies/chuyen-tau-cuoi-he');
    const resSuccess = await getMovieById(reqSuccess, {
      params: Promise.resolve({ id: 'chuyen-tau-cuoi-he' }),
    });
    assert.equal(resSuccess.status, 200);

    const bodySuccess = (await resSuccess.json()) as any;
    assert.equal(bodySuccess.success, true);
    assert.equal(bodySuccess.data.slug, 'chuyen-tau-cuoi-he');
    assert.equal(bodySuccess.data.director, 'MINH AN');

    // 404 case
    const reqNotFound = new Request('http://localhost:3000/api/movies/phim-khong-ton-tai');
    const resNotFound = await getMovieById(reqNotFound, {
      params: Promise.resolve({ id: 'phim-khong-ton-tai' }),
    });
    assert.equal(resNotFound.status, 404);

    const bodyNotFound = (await resNotFound.json()) as any;
    assert.equal(bodyNotFound.success, false);
    assert.equal(bodyNotFound.error.code, 'MOVIE_NOT_FOUND');
  });

  it('GET /api/cinemas and /api/cinemas/:id should return theater directory', async () => {
    const reqAll = new Request('http://localhost:3000/api/cinemas');
    const resAll = await getCinemas(reqAll);
    assert.equal(resAll.status, 200);

    const bodyAll = (await resAll.json()) as any;
    assert.ok(bodyAll.data.length >= 2);

    const reqDetail = new Request('http://localhost:3000/api/cinemas/cgv-vincom-dong-khoi');
    const resDetail = await getCinemaById(reqDetail, {
      params: Promise.resolve({ id: 'cgv-vincom-dong-khoi' }),
    });
    assert.equal(resDetail.status, 200);

    const bodyDetail = (await resDetail.json()) as any;
    assert.equal(bodyDetail.data.id, 'cgv-vincom-dong-khoi');
    assert.equal(bodyDetail.data.auditoriumsCount, 8);
  });

  it('GET /api/showtimes should return schedule slots grouped by day and cinema', async () => {
    const req = new Request('http://localhost:3000/api/showtimes?movieId=chuyen-tau-cuoi-he');
    const res = await getShowtimes(req);
    assert.equal(res.status, 200);

    const body = (await res.json()) as any;
    assert.ok(body.data.length >= 1);
    assert.ok(body.data[0].cinemas.length >= 1);
  });

  it('GET /api/seats should return standard 64-seat matrix', async () => {
    const req = new Request('http://localhost:3000/api/seats?showtimeId=BK-2026-CHUYENTAU');
    const res = await getSeats(req);
    assert.equal(res.status, 200);

    const body = (await res.json()) as any;
    assert.equal(body.data.totalSeats, 64);
    assert.equal(body.data.seats.length, 64);

    // Standard A1, VIP F5, Sweetbox H1-H2
    const a1 = body.data.seats.find((s: any) => s.id === 'A1');
    const f5 = body.data.seats.find((s: any) => s.id === 'F5');
    const h1 = body.data.seats.find((s: any) => s.id === 'H1');

    assert.equal(a1.type, 'standard');
    assert.equal(f5.type, 'vip');
    assert.equal(h1.type, 'sweetbox');
    assert.equal(h1.pairId, 'H1-H2');
  });

  it('POST /api/hold should enforce constraints: F12 max 6 seats, Sweetbox pairs, and 5-min TTL', async () => {
    // 1. Rejects > 6 seats
    const reqOverLimit = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'BK-2026-CHUYENTAU',
        seatIds: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'],
      }),
    });
    const resOverLimit = await postHold(reqOverLimit);
    assert.equal(resOverLimit.status, 400);
    const bodyOverLimit = (await resOverLimit.json()) as any;
    assert.equal(bodyOverLimit.error.code, 'MAX_SEATS_EXCEEDED');

    // 2. Rejects unpaired Sweetbox
    const reqUnpairedSweetbox = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'BK-2026-CHUYENTAU',
        seatIds: ['H1'], // Missing H2
      }),
    });
    const resUnpaired = await postHold(reqUnpairedSweetbox);
    assert.equal(resUnpaired.status, 400);
    const bodyUnpaired = (await resUnpaired.json()) as any;
    assert.equal(bodyUnpaired.error.code, 'SWEETBOX_PAIR_REQUIRED');

    // 3. Rejects reserved seat (All-or-Nothing)
    const reqReserved = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'BK-2026-CHUYENTAU',
        seatIds: ['B3', 'F5'], // B3 is reserved
      }),
    });
    const resReserved = await postHold(reqReserved);
    assert.equal(resReserved.status, 409);
    const bodyReserved = (await resReserved.json()) as any;
    assert.equal(bodyReserved.error.code, 'SEATS_UNAVAILABLE');

    // 4. Successful hold with 300s TTL
    const reqValid = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'BK-2026-CHUYENTAU',
        seatIds: ['E1', 'E2'],
      }),
    });
    const resValid = await postHold(reqValid);
    assert.equal(resValid.status, 201);
    const bodyValid = (await resValid.json()) as any;
    assert.equal(bodyValid.success, true);
    assert.equal(bodyValid.data.holdDurationSeconds, 300);
    assert.equal(bodyValid.data.seats.length, 2);

    const holdId = bodyValid.data.holdId;

    // 5. Release hold
    const reqRelease = new Request('http://localhost:3000/api/hold', {
      method: 'DELETE',
      body: JSON.stringify({ holdId }),
    });
    const resRelease = await deleteHold(reqRelease);
    assert.equal(resRelease.status, 200);
    const bodyRelease = (await resRelease.json()) as any;
    assert.equal(bodyRelease.data.released, true);
  });

  it('POST /api/orders and /api/payment/intent should execute checkout and issue cryptographic ticket', async () => {
    // 1. Create a hold first
    const reqHold = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'BK-2026-CHUYENTAU',
        seatIds: ['F5', 'F6'],
      }),
    });
    const resHold = await postHold(reqHold);
    const { data: hold } = (await resHold.json()) as any;

    // 2. Create Order
    const reqOrder = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        holdId: hold.holdId,
        showtimeId: hold.showtimeId,
        userEmail: 'nhibuaa@cinora.vn',
        paymentMethod: 'momo',
        combos: [{ id: 'combo-duo', quantity: 1 }],
        voucherCode: 'CHAOBANMOI',
      }),
    });
    const resOrder = await postOrder(reqOrder);
    assert.equal(resOrder.status, 201);
    const bodyOrder = (await resOrder.json()) as any;

    assert.equal(bodyOrder.data.seatsAmount, 260000);
    assert.equal(bodyOrder.data.combosAmount, 85000);
    assert.equal(bodyOrder.data.discountAmount, 30000);
    assert.equal(bodyOrder.data.totalAmount, 315000);

    const bookingId = bodyOrder.data.bookingId;

    // 3. Create Payment Intent
    const reqIntent = new Request('http://localhost:3000/api/payment/intent', {
      method: 'POST',
      body: JSON.stringify({
        bookingId,
        paymentMethod: 'momo',
      }),
    });
    const resIntent = await postPaymentIntent(reqIntent);
    assert.equal(resIntent.status, 201);
    const bodyIntent = (await resIntent.json()) as any;
    assert.ok(bodyIntent.data.transactionId.startsWith('TXN-'));

    // 4. Query Issued E-Ticket
    const reqTicket = new Request(`http://localhost:3000/api/tickets/${bookingId}`);
    const resTicket = await getTicketById(reqTicket, {
      params: Promise.resolve({ id: bookingId }),
    });
    assert.equal(resTicket.status, 200);

    const bodyTicket = (await resTicket.json()) as any;
    assert.equal(bodyTicket.data.status, 'ISSUED');
    assert.equal(bodyTicket.data.totalPaid, 315000);

    const qrPayload = JSON.parse(bodyTicket.data.qrPayload);
    assert.equal(qrPayload.signature, 'hmac-sha256-cinema-core-verified-signature');
    assert.deepEqual(qrPayload.seats, ['F5', 'F6']);
  });
});
