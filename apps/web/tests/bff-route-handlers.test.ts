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
import { POST as postPaymentWebhook } from '../src/app/api/payment/webhook/route.ts';
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

    // 3. Filter by format
    const reqFormat = new Request('http://localhost:3000/api/movies?format=IMAX');
    const resFormat = await getMovies(reqFormat);
    assert.equal(resFormat.status, 200);
    const bodyFormat = (await resFormat.json()) as any;
    assert.ok(bodyFormat.data.length >= 1);
    assert.ok(bodyFormat.data.every((m: any) => m.formats.some((f: string) => f.includes('IMAX'))));

    // 4. Filter by status
    const reqStatus = new Request('http://localhost:3000/api/movies?status=NOW_SHOWING');
    const resStatus = await getMovies(reqStatus);
    assert.equal(resStatus.status, 200);
    const bodyStatus = (await resStatus.json()) as any;
    assert.ok(bodyStatus.data.length >= 1);
    assert.ok(bodyStatus.data.every((m: any) => m.status === 'NOW_SHOWING'));
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
  });

  it('GET /api/cinemas and /api/cinemas/:id should return theater directory', async () => {
    // 1. List cinemas
    const reqList = new Request('http://localhost:3000/api/cinemas');
    const resList = await getCinemas(reqList);
    assert.equal(resList.status, 200);

    const bodyList = (await resList.json()) as any;
    assert.ok(Array.isArray(bodyList.data));
    assert.ok(bodyList.data.length >= 3);

    // 2. Cinema detail
    const reqDetail = new Request('http://localhost:3000/api/cinemas/cgv-dong-khoi');
    const resDetail = await getCinemaById(reqDetail, {
      params: Promise.resolve({ id: 'cgv-dong-khoi' }),
    });
    assert.equal(resDetail.status, 200);

    const bodyDetail = (await resDetail.json()) as any;
    assert.ok(bodyDetail.data.name.includes('Đồng Khởi'));
    assert.equal(bodyDetail.data.auditoriumsCount, 8);
  });

  it('GET /api/showtimes should return schedule slots grouped by day and cinema with date filter', async () => {
    // 1. All showtimes
    const req = new Request('http://localhost:3000/api/showtimes?movieId=chuyen-tau-cuoi-he');
    const res = await getShowtimes(req);
    assert.equal(res.status, 200);

    const body = (await res.json()) as any;
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 1);
    assert.ok(body.data[0].cinemas.length >= 1);
    assert.ok(body.data[0].cinemas[0].slots.length >= 1);

    // 2. Filter by date
    const reqDate = new Request('http://localhost:3000/api/showtimes?date=04/11');
    const resDate = await getShowtimes(reqDate);
    assert.equal(resDate.status, 200);
    const bodyDate = (await resDate.json()) as any;
    assert.ok(bodyDate.data.every((d: any) => d.date.includes('04/11') || d.label.includes('04/11')));

    // 3. Filter by cinemaId
    const reqCinema = new Request('http://localhost:3000/api/showtimes?cinemaId=cgv-vincom-dong-khoi');
    const resCinema = await getShowtimes(reqCinema);
    assert.equal(resCinema.status, 200);
    const bodyCinema = (await resCinema.json()) as any;
    assert.ok(bodyCinema.data.every((d: any) => d.cinemas.every((c: any) => c.cinemaId === 'cgv-vincom-dong-khoi')));
  });

  it('GET /api/seats should return standard 64-seat matrix', async () => {
    const req = new Request('http://localhost:3000/api/seats?showtimeId=slot-dk-04-1');
    const res = await getSeats(req);
    assert.equal(res.status, 200);

    const body = (await res.json()) as any;
    assert.equal(body.data.totalSeats, 64);
    assert.equal(body.data.seats.length, 64);

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

  it('POST /api/hold should reject duplicate seat IDs, empty seats, and invalid email', async () => {
    // 1. Duplicate seats
    const reqDup = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'BK-2026-CHUYENTAU',
        seatIds: ['F5', 'F5'],
      }),
    });
    const resDup = await postHold(reqDup);
    assert.equal(resDup.status, 400);
    const bodyDup = (await resDup.json()) as any;
    assert.equal(bodyDup.error.code, 'DUPLICATE_SEATS');

    // 2. Empty seats
    const reqEmpty = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'BK-2026-CHUYENTAU',
        seatIds: [],
      }),
    });
    const resEmpty = await postHold(reqEmpty);
    assert.equal(resEmpty.status, 400);
    const bodyEmpty = (await resEmpty.json()) as any;
    assert.equal(bodyEmpty.error.code, 'EMPTY_SEATS');

    // 3. Invalid email format
    const reqBadEmail = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'BK-2026-CHUYENTAU',
        seatIds: ['A1'],
        userEmail: 'not-an-email',
      }),
    });
    const resBadEmail = await postHold(reqBadEmail);
    assert.equal(resBadEmail.status, 400);
    const bodyBadEmail = (await resBadEmail.json()) as any;
    assert.equal(bodyBadEmail.error.code, 'INVALID_EMAIL');
  });

  it('POST /api/orders should enforce ownership and reject reused consumed holds', async () => {
    // 1. Create a hold with userEmail
    const reqHold = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['C1', 'C2'],
        userEmail: 'alice@example.com',
      }),
    });
    const resHold = await postHold(reqHold);
    assert.equal(resHold.status, 201);
    const { data: hold } = (await resHold.json()) as any;

    // 2. Try release with different caller email -> 403 Forbidden
    const reqBadRelease = new Request('http://localhost:3000/api/hold', {
      method: 'DELETE',
      body: JSON.stringify({
        holdId: hold.holdId,
        userEmail: 'eve@attacker.com',
      }),
    });
    const resBadRelease = await deleteHold(reqBadRelease);
    assert.equal(resBadRelease.status, 403);

    // 3. Try create order with mismatched email -> 403
    const reqMismatchedOrder = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        holdId: hold.holdId,
        showtimeId: hold.showtimeId,
        userEmail: 'bob@example.com',
        paymentMethod: 'momo',
      }),
    });
    const resMismatchedOrder = await postOrder(reqMismatchedOrder);
    assert.equal(resMismatchedOrder.status, 403);
    const bodyMismatched = (await resMismatchedOrder.json()) as any;
    assert.equal(bodyMismatched.error.code, 'HOLD_OWNER_MISMATCH');

    // 4. Create order with correct email -> 201 Success
    const reqValidOrder = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        holdId: hold.holdId,
        showtimeId: hold.showtimeId,
        userEmail: 'alice@example.com',
        paymentMethod: 'momo',
      }),
    });
    const resValidOrder = await postOrder(reqValidOrder);
    assert.equal(resValidOrder.status, 201);

    // 5. Try reusing the same consumed hold -> 409 Conflict
    const reqReusedOrder = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        holdId: hold.holdId,
        showtimeId: hold.showtimeId,
        userEmail: 'alice@example.com',
        paymentMethod: 'momo',
      }),
    });
    const resReusedOrder = await postOrder(reqReusedOrder);
    assert.equal(resReusedOrder.status, 409);
    const bodyReused = (await resReusedOrder.json()) as any;
    assert.equal(bodyReused.error.code, 'HOLD_ALREADY_CONSUMED');
  });

  it('POST /api/orders should validate combo quantities and payment methods', async () => {
    // Create fresh hold
    const reqHold = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'BK-2026-CHUYENTAU',
        seatIds: ['D1'],
      }),
    });
    const resHold = await postHold(reqHold);
    const { data: hold } = (await resHold.json()) as any;

    // 1. Negative combo quantity -> 400
    const reqNegativeCombo = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        holdId: hold.holdId,
        showtimeId: hold.showtimeId,
        userEmail: 'customer@cinora.vn',
        paymentMethod: 'momo',
        combos: [{ id: 'combo-single', quantity: -2 }],
      }),
    });
    const resNegative = await postOrder(reqNegativeCombo);
    assert.equal(resNegative.status, 400);
    const bodyNegative = (await resNegative.json()) as any;
    assert.equal(bodyNegative.error.code, 'INVALID_COMBO_QUANTITY');

    // 2. Invalid payment method -> 400
    const reqBadMethod = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        holdId: hold.holdId,
        showtimeId: hold.showtimeId,
        userEmail: 'customer@cinora.vn',
        paymentMethod: 'unsupported_method',
      }),
    });
    const resBadMethod = await postOrder(reqBadMethod);
    assert.equal(resBadMethod.status, 400);
    const bodyBadMethod = (await resBadMethod.json()) as any;
    assert.equal(bodyBadMethod.error.code, 'INVALID_PAYMENT_METHOD');
  });

  it('Checkout flow: Payment intent does NOT issue ticket; ticket is issued only upon verified Cinema Core webhook', async () => {
    // 1. Create a hold
    const reqHold = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'BK-2026-CHUYENTAU',
        seatIds: ['F5', 'F6'],
        userEmail: 'nhibuaa@cinora.vn',
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

    // 4. IMPORTANT: Ticket must NOT be issued upon payment intent creation!
    const reqTicketBeforePay = new Request(`http://localhost:3000/api/tickets/${bookingId}`);
    const resTicketBeforePay = await getTicketById(reqTicketBeforePay, {
      params: Promise.resolve({ id: bookingId }),
    });
    assert.equal(resTicketBeforePay.status, 404);

    // 5. Webhook without digital signature from Cinema Core must be rejected
    const reqBadWebhook = new Request('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify({
        transactionId: bodyIntent.data.transactionId,
        bookingId,
        partnerTxnId: 'MOMO-999888',
        paymentMethod: 'momo',
        amount: 315000,
        status: 'succeeded',
        signature: '', // Missing signature
        payloadTimestamp: new Date().toISOString(),
      }),
    });
    const resBadWebhook = await postPaymentWebhook(reqBadWebhook);
    assert.equal(resBadWebhook.status, 400);
    const bodyBadWebhook = (await resBadWebhook.json()) as any;
    assert.equal(bodyBadWebhook.error.code, 'INVALID_SIGNATURE');

    // 6. Cinema Core confirms payment via authoritative webhook with cryptographic signature
    const coreHmacSignature = 'hmac-sha256-verified-cinema-core-seal-992102';
    const reqValidWebhook = new Request('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify({
        transactionId: bodyIntent.data.transactionId,
        bookingId,
        partnerTxnId: 'MOMO-999888',
        paymentMethod: 'momo',
        amount: 315000,
        status: 'succeeded',
        signature: coreHmacSignature,
        payloadTimestamp: new Date().toISOString(),
      }),
    });
    const resValidWebhook = await postPaymentWebhook(reqValidWebhook);
    assert.equal(resValidWebhook.status, 200);
    const bodyValidWebhook = (await resValidWebhook.json()) as any;
    assert.equal(bodyValidWebhook.data.bookingStatus, 'CONFIRMED');

    // 7. NOW the authoritative E-Ticket is available
    const reqTicketAfterPay = new Request(`http://localhost:3000/api/tickets/${bookingId}`);
    const resTicketAfterPay = await getTicketById(reqTicketAfterPay, {
      params: Promise.resolve({ id: bookingId }),
    });
    assert.equal(resTicketAfterPay.status, 200);

    const bodyTicket = (await resTicketAfterPay.json()) as any;
    assert.equal(bodyTicket.data.status, 'ISSUED');
    assert.equal(bodyTicket.data.totalPaid, 315000);

    const qrPayload = JSON.parse(bodyTicket.data.qrPayload);
    assert.equal(qrPayload.signature, coreHmacSignature);
    assert.deepEqual(qrPayload.seats, ['F5', 'F6']);

    // 8. Idempotent webhook delivery test: Duplicate webhook doesn't create duplicate tickets
    const reqDupWebhook = new Request('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify({
        transactionId: bodyIntent.data.transactionId,
        bookingId,
        partnerTxnId: 'MOMO-999888',
        paymentMethod: 'momo',
        amount: 315000,
        status: 'succeeded',
        signature: coreHmacSignature,
        payloadTimestamp: new Date().toISOString(),
      }),
    });
    const resDupWebhook = await postPaymentWebhook(reqDupWebhook);
    assert.equal(resDupWebhook.status, 200);
  });
});
