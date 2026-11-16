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
import { expireOrderForTesting } from '../src/server/order-adapter.ts';
import {
  signWebhookPayload,
  verifyTicketQrSignature,
  getCinemaCoreWebhookSecret,
  getCinemaCoreTicketSecret,
} from '../src/server/crypto-utils.ts';
import type { TicketQrPayload } from '@platform/contracts';

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

    // 4. Filter by status NOW_SHOWING (4 movies)
    const reqStatus = new Request('http://localhost:3000/api/movies?status=NOW_SHOWING');
    const resStatus = await getMovies(reqStatus);
    assert.equal(resStatus.status, 200);
    const bodyStatus = (await resStatus.json()) as any;
    assert.equal(bodyStatus.data.length, 4);
    assert.ok(bodyStatus.data.every((m: any) => m.status === 'NOW_SHOWING'));

    // 5. Filter by status COMING_SOON (2 movies)
    const reqUpcoming = new Request('http://localhost:3000/api/movies?status=COMING_SOON');
    const resUpcoming = await getMovies(reqUpcoming);
    assert.equal(resUpcoming.status, 200);
    const bodyUpcoming = (await resUpcoming.json()) as any;
    assert.equal(bodyUpcoming.data.length, 2);
    assert.ok(bodyUpcoming.data.every((m: any) => m.status === 'COMING_SOON'));

    // 6. Relational filter negative check: nonexistent cinema & date returns empty array
    const reqNonexistent = new Request('http://localhost:3000/api/movies?cinemaId=nonexistent&date=2099-01-01');
    const resNonexistent = await getMovies(reqNonexistent);
    assert.equal(resNonexistent.status, 200);
    const bodyNonexistent = (await resNonexistent.json()) as any;
    assert.equal(bodyNonexistent.data.length, 0);
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
    // 1. All showtimes for valid movie
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
    assert.ok(bodyCinema.data.every((d: any) => d.cinemas.every((c: any) => c.cinemaId.includes('dong-khoi'))));

    // 4. Negative filter check: nonexistent movieId returns empty array
    const reqNonexistentMovie = new Request('http://localhost:3000/api/showtimes?movieId=nonexistent-movie');
    const resNonexistentMovie = await getShowtimes(reqNonexistentMovie);
    assert.equal(resNonexistentMovie.status, 200);
    const bodyNonexistentMovie = (await resNonexistentMovie.json()) as any;
    assert.equal(bodyNonexistentMovie.data.length, 0);

    // 5. Negative filter check: status=sold_out returns empty array
    const reqSoldOut = new Request('http://localhost:3000/api/showtimes?status=sold_out');
    const resSoldOut = await getShowtimes(reqSoldOut);
    assert.equal(resSoldOut.status, 200);
    const bodySoldOut = (await resSoldOut.json()) as any;
    assert.equal(bodySoldOut.data.length, 0);
  });

  it('GET /api/seats should return standard 64-seat matrix and 404 on nonexistent showtime', async () => {
    // Valid showtime
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

    // Nonexistent showtime -> 404
    const reqNonexistent = new Request('http://localhost:3000/api/seats?showtimeId=nonexistent-slot-999');
    const resNonexistent = await getSeats(reqNonexistent);
    assert.equal(resNonexistent.status, 404);
  });

  it('Canonical showtime: Aliases share single inventory and block duplicate holds', async () => {
    // 1. Hold seat A1 using alias 'slot-dk-04-1'
    const reqHold1 = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['A1'],
        userEmail: 'user1@example.com',
      }),
    });
    const resHold1 = await postHold(reqHold1);
    assert.equal(resHold1.status, 201);
    const { data: hold1 } = (await resHold1.json()) as any;

    // 2. Try to hold seat A1 using alias 'cgv-dong-khoi-slot-dk-04-1' -> 409 Conflict
    const reqHold2 = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'cgv-dong-khoi-slot-dk-04-1',
        seatIds: ['A1'],
        userEmail: 'user2@example.com',
      }),
    });
    const resHold2 = await postHold(reqHold2);
    assert.equal(resHold2.status, 409);
    const bodyHold2 = (await resHold2.json()) as any;
    assert.equal(bodyHold2.error.code, 'SEATS_UNAVAILABLE');

    // 3. Clean up by releasing hold1
    const reqRelease = new Request('http://localhost:3000/api/hold', {
      method: 'DELETE',
      headers: { 'x-user-email': 'user1@example.com' },
      body: JSON.stringify({ holdId: hold1.holdId, userEmail: 'user1@example.com' }),
    });
    const resRelease = await deleteHold(reqRelease);
    assert.equal(resRelease.status, 200);
  });

  it('POST /api/hold should enforce constraints: F12 max 6 seats, Sweetbox pairs, duplicate seats, and 5-min TTL', async () => {
    // 1. Rejects > 6 seats
    const reqOverLimit = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
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
        showtimeId: 'slot-dk-04-1',
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
        showtimeId: 'slot-dk-04-1',
        seatIds: ['B3', 'F5'], // B3 is reserved
      }),
    });
    const resReserved = await postHold(reqReserved);
    assert.equal(resReserved.status, 409);
    const bodyReserved = (await resReserved.json()) as any;
    assert.equal(bodyReserved.error.code, 'SEATS_UNAVAILABLE');

    // 4. Duplicate seats rejection
    const reqDup = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['E1', 'E1'],
      }),
    });
    const resDup = await postHold(reqDup);
    assert.equal(resDup.status, 400);
    const bodyDup = (await resDup.json()) as any;
    assert.equal(bodyDup.error.code, 'DUPLICATE_SEATS');

    // 5. Nonexistent showtime -> 404
    const reqNonexistent = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'nonexistent-slot-999',
        seatIds: ['E1'],
      }),
    });
    const resNonexistent = await postHold(reqNonexistent);
    assert.equal(resNonexistent.status, 404);
    const bodyNonexistent = (await resNonexistent.json()) as any;
    assert.equal(bodyNonexistent.error.code, 'SHOWTIME_NOT_FOUND');

    // 6. Successful hold with 300s TTL
    const reqValid = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['E1', 'E2'],
        userEmail: 'alice@example.com',
      }),
    });
    const resValid = await postHold(reqValid);
    assert.equal(resValid.status, 201);
    const bodyValid = (await resValid.json()) as any;
    assert.equal(bodyValid.success, true);
    assert.equal(bodyValid.data.holdDurationSeconds, 300);
    assert.equal(bodyValid.data.seats.length, 2);

    const holdId = bodyValid.data.holdId;

    // 7. Release hold without email -> 403 Forbidden
    const reqReleaseNoEmail = new Request('http://localhost:3000/api/hold', {
      method: 'DELETE',
      body: JSON.stringify({ holdId }),
    });
    const resReleaseNoEmail = await deleteHold(reqReleaseNoEmail);
    assert.equal(resReleaseNoEmail.status, 403);

    // 8. Release hold with correct owner email -> 200 OK
    const reqRelease = new Request('http://localhost:3000/api/hold', {
      method: 'DELETE',
      headers: { 'x-user-email': 'alice@example.com' },
      body: JSON.stringify({ holdId, userEmail: 'alice@example.com' }),
    });
    const resRelease = await deleteHold(reqRelease);
    assert.equal(resRelease.status, 200);
    const bodyRelease = (await resRelease.json()) as any;
    assert.equal(bodyRelease.data.released, true);
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

    // 2. Try release without email -> 403
    const reqNoEmailRelease = new Request('http://localhost:3000/api/hold', {
      method: 'DELETE',
      body: JSON.stringify({ holdId: hold.holdId }),
    });
    const resNoEmailRelease = await deleteHold(reqNoEmailRelease);
    assert.equal(resNoEmailRelease.status, 403);

    // 3. Try release with different caller email -> 403 Forbidden
    const reqBadRelease = new Request('http://localhost:3000/api/hold', {
      method: 'DELETE',
      body: JSON.stringify({
        holdId: hold.holdId,
        userEmail: 'eve@attacker.com',
      }),
    });
    const resBadRelease = await deleteHold(reqBadRelease);
    assert.equal(resBadRelease.status, 403);

    // 4. Try create order with mismatched email -> 403
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

    // 5. Create order with correct email -> 201 Success
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

    // 6. Try reusing the same consumed hold -> 409 Conflict
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
        showtimeId: 'slot-dk-04-1',
        seatIds: ['D1'],
        userEmail: 'customer@cinora.vn',
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

  it('Checkout flow: Payment intent does NOT issue ticket, enforces ownership, and requires verified Cinema Core HMAC webhook', async () => {
    // 1. Create a hold
    const reqHold = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-2',
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

    const bookingId = bodyOrder.data.bookingId;
    const totalAmount = bodyOrder.data.totalAmount;

    // 3. Payment Intent without ownership header -> 403 Forbidden
    const reqIntentNoAuth = new Request('http://localhost:3000/api/payment/intent', {
      method: 'POST',
      body: JSON.stringify({
        bookingId,
        paymentMethod: 'momo',
      }),
    });
    const resIntentNoAuth = await postPaymentIntent(reqIntentNoAuth);
    assert.equal(resIntentNoAuth.status, 403);

    // 3b. Payment Intent with correct owner email -> 201 Created
    const reqIntent = new Request('http://localhost:3000/api/payment/intent', {
      method: 'POST',
      headers: { 'x-user-email': 'nhibuaa@cinora.vn' },
      body: JSON.stringify({
        bookingId,
        paymentMethod: 'momo',
      }),
    });
    const resIntent = await postPaymentIntent(reqIntent);
    assert.equal(resIntent.status, 201);
    const bodyIntent = (await resIntent.json()) as any;
    assert.ok(bodyIntent.data.transactionId.startsWith('TXN-'));
    const transactionId = bodyIntent.data.transactionId;

    // 4. IMPORTANT: Ticket must NOT be issued upon payment intent creation!
    const reqTicketBeforePay = new Request(`http://localhost:3000/api/tickets/${bookingId}`, {
      headers: { 'x-user-email': 'nhibuaa@cinora.vn' },
    });
    const resTicketBeforePay = await getTicketById(reqTicketBeforePay, {
      params: Promise.resolve({ id: bookingId }),
    });
    assert.equal(resTicketBeforePay.status, 404);

    // 5. Webhook with fake signature (e.g. '00000000') must be REJECTED (400)
    const reqFakeSigWebhook = new Request('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify({
        transactionId,
        bookingId,
        partnerTxnId: 'MOMO-999888',
        paymentMethod: 'momo',
        amount: totalAmount,
        status: 'succeeded',
        signature: '00000000', // Fake signature
        payloadTimestamp: new Date().toISOString(),
      }),
    });
    const resFakeSigWebhook = await postPaymentWebhook(reqFakeSigWebhook);
    assert.equal(resFakeSigWebhook.status, 400);
    const bodyFakeSig = (await resFakeSigWebhook.json()) as any;
    assert.equal(bodyFakeSig.error.code, 'INVALID_SIGNATURE');

    // 6. Reconciliation checks:
    // 6a. Mismatched transactionId -> 400
    const badTxnPayload = {
      transactionId: 'TXN-FAKE-ID',
      bookingId,
      partnerTxnId: 'MOMO-999888',
      paymentMethod: 'momo' as const,
      amount: totalAmount,
      status: 'succeeded' as const,
      payloadTimestamp: new Date().toISOString(),
    };
    const reqBadTxn = new Request('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify({
        ...badTxnPayload,
        signature: signWebhookPayload(badTxnPayload),
      }),
    });
    const resBadTxn = await postPaymentWebhook(reqBadTxn);
    assert.equal(resBadTxn.status, 400);
    const bodyBadTxn = (await resBadTxn.json()) as any;
    assert.equal(bodyBadTxn.error.code, 'TRANSACTION_ID_MISMATCH');

    // 6b. Mismatched amount -> 400
    const badAmountPayload = {
      transactionId,
      bookingId,
      partnerTxnId: 'MOMO-999888',
      paymentMethod: 'momo' as const,
      amount: 1, // Tampered amount (1đ instead of totalAmount)
      status: 'succeeded' as const,
      payloadTimestamp: new Date().toISOString(),
    };
    const reqBadAmount = new Request('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify({
        ...badAmountPayload,
        signature: signWebhookPayload(badAmountPayload),
      }),
    });
    const resBadAmount = await postPaymentWebhook(reqBadAmount);
    assert.equal(resBadAmount.status, 400);
    const bodyBadAmount = (await resBadAmount.json()) as any;
    assert.equal(bodyBadAmount.error.code, 'AMOUNT_MISMATCH');

    // 7. Authoritative webhook with genuine HMAC-SHA256 signature from Cinema Core
    const validPayload = {
      transactionId,
      bookingId,
      partnerTxnId: 'MOMO-999888',
      paymentMethod: 'momo' as const,
      amount: totalAmount,
      status: 'succeeded' as const,
      payloadTimestamp: new Date().toISOString(),
    };
    const coreHmacSignature = signWebhookPayload(validPayload);

    const reqValidWebhook = new Request('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify({
        ...validPayload,
        signature: coreHmacSignature,
      }),
    });
    const resValidWebhook = await postPaymentWebhook(reqValidWebhook);
    assert.equal(resValidWebhook.status, 200);
    const bodyValidWebhook = (await resValidWebhook.json()) as any;
    assert.equal(bodyValidWebhook.data.bookingStatus, 'CONFIRMED');

    // 8. Query ticket without email -> 403 Forbidden
    const reqTicketNoAuth = new Request(`http://localhost:3000/api/tickets/${bookingId}`);
    const resTicketNoAuth = await getTicketById(reqTicketNoAuth, {
      params: Promise.resolve({ id: bookingId }),
    });
    assert.equal(resTicketNoAuth.status, 403);

    // 8b. Query ticket with wrong email -> 403 Forbidden
    const reqTicketWrongAuth = new Request(`http://localhost:3000/api/tickets/${bookingId}`, {
      headers: { 'x-user-email': 'eve@attacker.com' },
    });
    const resTicketWrongAuth = await getTicketById(reqTicketWrongAuth, {
      params: Promise.resolve({ id: bookingId }),
    });
    assert.equal(resTicketWrongAuth.status, 403);

    // 8c. Query ticket with correct owner email -> 200 OK
    const reqTicketAfterPay = new Request(`http://localhost:3000/api/tickets/${bookingId}`, {
      headers: { 'x-user-email': 'nhibuaa@cinora.vn' },
    });
    const resTicketAfterPay = await getTicketById(reqTicketAfterPay, {
      params: Promise.resolve({ id: bookingId }),
    });
    assert.equal(resTicketAfterPay.status, 200);

    const bodyTicket = (await resTicketAfterPay.json()) as any;
    assert.equal(bodyTicket.data.status, 'ISSUED');
    assert.equal(bodyTicket.data.totalPaid, totalAmount);
    assert.ok(bodyTicket.data.ticketCode.startsWith('TKT-'));

    // Verify QR digital signature using cryptographic verifier
    const qrPayload = JSON.parse(bodyTicket.data.qrPayload) as TicketQrPayload;
    assert.ok(verifyTicketQrSignature(qrPayload));
    assert.deepEqual(qrPayload.seats, ['F5', 'F6']);

    // 9. Idempotent webhook delivery test: Duplicate webhook doesn't create duplicate tickets
    const reqDupWebhook = new Request('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify({
        ...validPayload,
        signature: coreHmacSignature,
      }),
    });
    const resDupWebhook = await postPaymentWebhook(reqDupWebhook);
    assert.equal(resDupWebhook.status, 200);
  });

  it('TTL after order: Expired unpaid order releases seats back to inventory while blocking hold reuse', async () => {
    // 1. Hold seat D5
    const reqHold = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['D5'],
        userEmail: 'bob@example.com',
      }),
    });
    const resHold = await postHold(reqHold);
    assert.equal(resHold.status, 201);
    const { data: hold } = (await resHold.json()) as any;

    // 2. Create order
    const reqOrder = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        holdId: hold.holdId,
        showtimeId: hold.showtimeId,
        userEmail: 'bob@example.com',
        paymentMethod: 'momo',
      }),
    });
    const resOrder = await postOrder(reqOrder);
    assert.equal(resOrder.status, 201);
    const { data: order } = (await resOrder.json()) as any;

    // 3. Simulate TTL expiration (order is not paid within TTL)
    expireOrderForTesting(order.bookingId);

    // 4. Seat map should show seat D5 is freed back to AVAILABLE
    const reqSeats = new Request(`http://localhost:3000/api/seats?showtimeId=slot-dk-04-1`);
    const resSeats = await getSeats(reqSeats);
    assert.equal(resSeats.status, 200);
    const bodySeats = (await resSeats.json()) as any;
    const seatD5 = bodySeats.data.seats.find((s: any) => s.id === 'D5');
    assert.equal(seatD5.status, 'available');

    // 5. A new customer can now successfully hold seat D5
    const reqNewHold = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['D5'],
        userEmail: 'carol@example.com',
      }),
    });
    const resNewHold = await postHold(reqNewHold);
    assert.equal(resNewHold.status, 201);

    // 6. Old customer trying to reuse the old consumed/expired hold gets 409
    const reqReuse = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        holdId: hold.holdId,
        showtimeId: hold.showtimeId,
        userEmail: 'bob@example.com',
        paymentMethod: 'momo',
      }),
    });
    const resReuse = await postOrder(reqReuse);
    assert.equal(resReuse.status, 409);
  });

  it('Late-arriving webhook on expired order requires reconciliation (409)', async () => {
    // 1. Hold seat G1 and create order
    const reqHold = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['G1'],
        userEmail: 'dave@example.com',
      }),
    });
    const resHold = await postHold(reqHold);
    const { data: hold } = (await resHold.json()) as any;

    const reqOrder = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        holdId: hold.holdId,
        showtimeId: hold.showtimeId,
        userEmail: 'dave@example.com',
        paymentMethod: 'momo',
      }),
    });
    const resOrder = await postOrder(reqOrder);
    const { data: order } = (await resOrder.json()) as any;

    // 2. Create intent
    const reqIntent = new Request('http://localhost:3000/api/payment/intent', {
      method: 'POST',
      headers: { 'x-user-email': 'dave@example.com' },
      body: JSON.stringify({
        bookingId: order.bookingId,
        paymentMethod: 'momo',
      }),
    });
    const resIntent = await postPaymentIntent(reqIntent);
    const { data: intent } = (await resIntent.json()) as any;

    // 3. Order expires before webhook arrives
    expireOrderForTesting(order.bookingId);

    // 4. Webhook arrives late after expiration -> 409 RECONCILIATION_REQUIRED
    const latePayload = {
      transactionId: intent.transactionId,
      bookingId: order.bookingId,
      partnerTxnId: 'MOMO-LATE-123',
      paymentMethod: 'momo' as const,
      amount: order.totalAmount,
      status: 'succeeded' as const,
      payloadTimestamp: new Date().toISOString(),
    };
    const reqLateWebhook = new Request('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify({
        ...latePayload,
        signature: signWebhookPayload(latePayload),
      }),
    });
    const resLateWebhook = await postPaymentWebhook(reqLateWebhook);
    assert.equal(resLateWebhook.status, 409);
    const bodyLate = (await resLateWebhook.json()) as any;
    assert.equal(bodyLate.error.code, 'PAYMENT_EXPIRED_RECONCILIATION_REQUIRED');
  });

  it('P1-1: Hủy hold sau tạo đơn bị từ chối 409 và không gây bán trùng ghế', async () => {
    // 1. User Alice holds seat A2 and creates order
    const reqHoldAlice = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['A2'],
        userEmail: 'alice.double@example.com',
      }),
    });
    const resHoldAlice = await postHold(reqHoldAlice);
    assert.equal(resHoldAlice.status, 201);
    const { data: holdAlice } = (await resHoldAlice.json()) as any;

    const reqOrderAlice = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        holdId: holdAlice.holdId,
        showtimeId: holdAlice.showtimeId,
        userEmail: 'alice.double@example.com',
        paymentMethod: 'momo',
      }),
    });
    const resOrderAlice = await postOrder(reqOrderAlice);
    assert.equal(resOrderAlice.status, 201);

    // 2. Alice attempts to release the consumed hold -> rejected with 409 HOLD_ALREADY_CONSUMED
    const reqReleaseAlice = new Request('http://localhost:3000/api/hold', {
      method: 'DELETE',
      headers: { 'x-user-email': 'alice.double@example.com' },
      body: JSON.stringify({
        holdId: holdAlice.holdId,
        userEmail: 'alice.double@example.com',
      }),
    });
    const resReleaseAlice = await deleteHold(reqReleaseAlice);
    assert.equal(resReleaseAlice.status, 409);
    const bodyRelease = (await resReleaseAlice.json()) as any;
    assert.equal(bodyRelease.error.code, 'HOLD_ALREADY_CONSUMED');

    // 3. User Bob tries to hold seat A2 -> rejected with 409 SEATS_UNAVAILABLE (A2 is still held by Alice's order)
    const reqHoldBob = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['A2'],
        userEmail: 'bob.double@example.com',
      }),
    });
    const resHoldBob = await postHold(reqHoldBob);
    assert.equal(resHoldBob.status, 409);
    const bodyHoldBob = (await resHoldBob.json()) as any;
    assert.equal(bodyHoldBob.error.code, 'SEATS_UNAVAILABLE');
  });

  it('P1-2: Thiếu secret từ chối trong production và chỉ cho phép fallback trong simulation', async () => {
    const origNodeEnv = process.env.NODE_ENV;
    const origSecret = process.env.CINEMA_CORE_WEBHOOK_SECRET;

    try {
      // Simulate production without secret configured
      (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
      delete process.env.CINEMA_CORE_WEBHOOK_SECRET;

      assert.throws(
        () => getCinemaCoreWebhookSecret(),
        /SECURITY_ERROR/
      );

      // Webhook in production with unconfigured secret returns 500 configuration error
      const fakePayload = {
        transactionId: 'TXN-PROD-TEST',
        bookingId: 'BK-PROD-TEST',
        partnerTxnId: 'PTXN-123',
        paymentMethod: 'momo' as const,
        amount: 100000,
        status: 'succeeded' as const,
        payloadTimestamp: new Date().toISOString(),
        signature: 'deadbeef',
      };
      const reqWebhook = new Request('http://localhost:3000/api/payment/webhook', {
        method: 'POST',
        body: JSON.stringify(fakePayload),
      });
      const resWebhook = await postPaymentWebhook(reqWebhook);
      assert.equal(resWebhook.status, 500);
      const bodyWebhook = (await resWebhook.json()) as any;
      assert.equal(bodyWebhook.error.code, 'SERVER_CONFIGURATION_ERROR');
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = origNodeEnv;
      if (origSecret !== undefined) {
        process.env.CINEMA_CORE_WEBHOOK_SECRET = origSecret;
      } else {
        delete process.env.CINEMA_CORE_WEBHOOK_SECRET;
      }
    }
  });

  it('P1-3: Webhook từ chối xác nhận đơn chưa từng tạo intent (400 TRANSACTION_NOT_INITIALIZED)', async () => {
    // 1. Create hold and order
    const reqHold = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['F2'],
        userEmail: 'nointent@example.com',
      }),
    });
    const resHold = await postHold(reqHold);
    const { data: hold } = (await resHold.json()) as any;

    const reqOrder = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        holdId: hold.holdId,
        showtimeId: hold.showtimeId,
        userEmail: 'nointent@example.com',
        paymentMethod: 'momo',
      }),
    });
    const resOrder = await postOrder(reqOrder);
    assert.equal(resOrder.status, 201);
    const { data: order } = (await resOrder.json()) as any;

    // 2. Send webhook directly without creating payment intent first
    const payload = {
      transactionId: 'TXN-NEVER-CREATED-INTENT',
      bookingId: order.bookingId,
      partnerTxnId: 'MOMO-BYPASS-001',
      paymentMethod: 'momo' as const,
      amount: order.totalAmount,
      status: 'succeeded' as const,
      payloadTimestamp: new Date().toISOString(),
    };
    const reqWebhook = new Request('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        signature: signWebhookPayload(payload),
      }),
    });
    const resWebhook = await postPaymentWebhook(reqWebhook);
    assert.equal(resWebhook.status, 400);
    const bodyWebhook = (await resWebhook.json()) as any;
    assert.equal(bodyWebhook.error.code, 'TRANSACTION_NOT_INITIALIZED');
  });

  it('P1-4: Retry payment intent tái sử dụng transactionId active và giữ dấu khi đổi phương thức', async () => {
    // 1. Create hold and order
    const reqHold = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['F3'],
        userEmail: 'retry@example.com',
      }),
    });
    const resHold = await postHold(reqHold);
    const { data: hold } = (await resHold.json()) as any;

    const reqOrder = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        holdId: hold.holdId,
        showtimeId: hold.showtimeId,
        userEmail: 'retry@example.com',
        paymentMethod: 'momo',
      }),
    });
    const resOrder = await postOrder(reqOrder);
    const { data: order } = (await resOrder.json()) as any;

    // 2. First intent creation (MoMo)
    const reqIntent1 = new Request('http://localhost:3000/api/payment/intent', {
      method: 'POST',
      headers: { 'x-user-email': 'retry@example.com' },
      body: JSON.stringify({
        bookingId: order.bookingId,
        paymentMethod: 'momo',
      }),
    });
    const resIntent1 = await postPaymentIntent(reqIntent1);
    assert.equal(resIntent1.status, 201);
    const { data: intent1 } = (await resIntent1.json()) as any;

    // 3. Retry same intent with MoMo -> must return IDENTICAL transactionId
    const reqIntentRetry = new Request('http://localhost:3000/api/payment/intent', {
      method: 'POST',
      headers: { 'x-user-email': 'retry@example.com' },
      body: JSON.stringify({
        bookingId: order.bookingId,
        paymentMethod: 'momo',
      }),
    });
    const resIntentRetry = await postPaymentIntent(reqIntentRetry);
    assert.equal(resIntentRetry.status, 201);
    const { data: intentRetry } = (await resIntentRetry.json()) as any;
    assert.equal(intentRetry.transactionId, intent1.transactionId);

    // 4. Switch payment method to zalopay
    const reqIntentZalo = new Request('http://localhost:3000/api/payment/intent', {
      method: 'POST',
      headers: { 'x-user-email': 'retry@example.com' },
      body: JSON.stringify({
        bookingId: order.bookingId,
        paymentMethod: 'zalopay',
      }),
    });
    const resIntentZalo = await postPaymentIntent(reqIntentZalo);
    assert.equal(resIntentZalo.status, 201);
    const { data: intentZalo } = (await resIntentZalo.json()) as any;
    assert.notEqual(intentZalo.transactionId, intent1.transactionId);

    // 5. If webhook for the FIRST intent (MoMo) arrives, it still reconciles and confirms
    const payloadMoMo = {
      transactionId: intent1.transactionId,
      bookingId: order.bookingId,
      partnerTxnId: 'MOMO-RETRY-001',
      paymentMethod: 'momo' as const,
      amount: order.totalAmount,
      status: 'succeeded' as const,
      payloadTimestamp: new Date().toISOString(),
    };
    const reqWebhookMoMo = new Request('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify({
        ...payloadMoMo,
        signature: signWebhookPayload(payloadMoMo),
      }),
    });
    const resWebhookMoMo = await postPaymentWebhook(reqWebhookMoMo);
    assert.equal(resWebhookMoMo.status, 200);
    const bodyConfirmed = (await resWebhookMoMo.json()) as any;
    assert.equal(bodyConfirmed.success, true);
    assert.equal(bodyConfirmed.data.bookingStatus, 'CONFIRMED');
  });

  it('P2-5: Bắt buộc userEmail khi tạo hold và chặn hoàn toàn việc hủy ẩn danh', async () => {
    // 1. Hold without userEmail -> 400 MISSING_USER_EMAIL
    const reqNoEmail = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['F7'],
      }),
    });
    const resNoEmail = await postHold(reqNoEmail);
    assert.equal(resNoEmail.status, 400);
    const bodyNoEmail = (await resNoEmail.json()) as any;
    assert.equal(bodyNoEmail.error.code, 'MISSING_USER_EMAIL');

    // 2. Hold with invalid format email -> 400 INVALID_EMAIL
    const reqBadEmail = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['F7'],
        userEmail: 'not-an-email',
      }),
    });
    const resBadEmail = await postHold(reqBadEmail);
    assert.equal(resBadEmail.status, 400);
    const bodyBadEmail = (await resBadEmail.json()) as any;
    assert.equal(bodyBadEmail.error.code, 'INVALID_EMAIL');

    // 3. Valid hold creation
    const reqValidHold = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['F7'],
        userEmail: 'owner@example.com',
      }),
    });
    const resValidHold = await postHold(reqValidHold);
    assert.equal(resValidHold.status, 201);
    const { data: validHold } = (await resValidHold.json()) as any;

    // 4. Anonymous release attempt (no caller email) -> 403 FORBIDDEN
    const reqAnonRelease = new Request('http://localhost:3000/api/hold', {
      method: 'DELETE',
      body: JSON.stringify({ holdId: validHold.holdId }),
    });
    const resAnonRelease = await deleteHold(reqAnonRelease);
    assert.equal(resAnonRelease.status, 403);

    // 5. Wrong owner email release attempt -> 403 FORBIDDEN
    const reqWrongRelease = new Request('http://localhost:3000/api/hold', {
      method: 'DELETE',
      headers: { 'x-user-email': 'stranger@example.com' },
      body: JSON.stringify({ holdId: validHold.holdId, userEmail: 'stranger@example.com' }),
    });
    const resWrongRelease = await deleteHold(reqWrongRelease);
    assert.equal(resWrongRelease.status, 403);

    // 6. Legitimate owner release -> 200 OK
    const reqGoodRelease = new Request('http://localhost:3000/api/hold', {
      method: 'DELETE',
      headers: { 'x-user-email': 'owner@example.com' },
      body: JSON.stringify({ holdId: validHold.holdId }),
    });
    const resGoodRelease = await deleteHold(reqGoodRelease);
    assert.equal(resGoodRelease.status, 200);
  });

  it('P2-6: Lọc cinemaId chuẩn hóa alias chính xác, loại trừ substring của ID hợp lệ', async () => {
    // 1. Fake ID containing substring of valid cinema -> 0 movies, 0 showtimes
    const reqFakeCinemaMovies = new Request('http://localhost:3000/api/movies?cinemaId=not-a-real-cgv-dong-khoi');
    const resFakeCinemaMovies = await getMovies(reqFakeCinemaMovies);
    assert.equal(resFakeCinemaMovies.status, 200);
    const bodyFakeMovies = (await resFakeCinemaMovies.json()) as any;
    assert.equal(bodyFakeMovies.data.length, 0);

    const reqPartialMovies = new Request('http://localhost:3000/api/movies?cinemaId=cgv-dong');
    const resPartialMovies = await getMovies(reqPartialMovies);
    assert.equal(resPartialMovies.status, 200);
    const bodyPartialMovies = (await resPartialMovies.json()) as any;
    assert.equal(bodyPartialMovies.data.length, 0);

    const reqFakeShowtimes = new Request('http://localhost:3000/api/showtimes?movieId=chuyen-tau-cuoi-he&cinemaId=not-a-real-cgv-dong-khoi');
    const resFakeShowtimes = await getShowtimes(reqFakeShowtimes);
    assert.equal(resFakeShowtimes.status, 200);
    const bodyFakeShowtimes = (await resFakeShowtimes.json()) as any;
    assert.equal(bodyFakeShowtimes.data.length, 0);

    // 2. Known alias cgv-vincom-dong-khoi resolves to cgv-dong-khoi -> returns movie & showtimes
    const reqValidAliasMovies = new Request('http://localhost:3000/api/movies?cinemaId=cgv-vincom-dong-khoi');
    const resValidAliasMovies = await getMovies(reqValidAliasMovies);
    assert.equal(resValidAliasMovies.status, 200);
    const bodyValidAliasMovies = (await resValidAliasMovies.json()) as any;
    assert.equal(bodyValidAliasMovies.data.length, 1);
    assert.equal(bodyValidAliasMovies.data[0].slug, 'chuyen-tau-cuoi-he');

    const reqValidAliasShowtimes = new Request('http://localhost:3000/api/showtimes?movieId=chuyen-tau-cuoi-he&cinemaId=cgv-vincom-dong-khoi');
    const resValidAliasShowtimes = await getShowtimes(reqValidAliasShowtimes);
    assert.equal(resValidAliasShowtimes.status, 200);
    const bodyValidAliasShowtimes = (await resValidAliasShowtimes.json()) as any;
    assert.ok(bodyValidAliasShowtimes.data.length > 0);
  });

  it('P1-7: Thiếu ticket secret không xác nhận đơn dở dang, retry sau khi cấu hình secret tạo vé thành công', async () => {
    const origNodeEnv = process.env.NODE_ENV;
    const origWebhookSecret = process.env.CINEMA_CORE_WEBHOOK_SECRET;
    const origTicketSecret = process.env.CINEMA_CORE_TICKET_SECRET;

    try {
      // 1. Create hold and order
      const reqHold = new Request('http://localhost:3000/api/hold', {
        method: 'POST',
        body: JSON.stringify({
          showtimeId: 'slot-dk-04-1',
          seatIds: ['F8'],
          userEmail: 'atomic.ticket@example.com',
        }),
      });
      const resHold = await postHold(reqHold);
      assert.equal(resHold.status, 201);
      const { data: hold } = (await resHold.json()) as any;

      const reqOrder = new Request('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          holdId: hold.holdId,
          showtimeId: hold.showtimeId,
          userEmail: 'atomic.ticket@example.com',
          paymentMethod: 'momo',
        }),
      });
      const resOrder = await postOrder(reqOrder);
      assert.equal(resOrder.status, 201);
      const { data: order } = (await resOrder.json()) as any;

      // 2. Create intent
      const reqIntent = new Request('http://localhost:3000/api/payment/intent', {
        method: 'POST',
        headers: { 'x-user-email': 'atomic.ticket@example.com' },
        body: JSON.stringify({
          bookingId: order.bookingId,
          paymentMethod: 'momo',
        }),
      });
      const resIntent = await postPaymentIntent(reqIntent);
      assert.equal(resIntent.status, 201);
      const { data: intent } = (await resIntent.json()) as any;

      // 3. Simulate production with valid webhook secret but MISSING ticket secret
      (process.env as Record<string, string | undefined>).NODE_ENV = 'production';
      process.env.CINEMA_CORE_WEBHOOK_SECRET = 'valid-prod-webhook-secret-for-test';
      delete process.env.CINEMA_CORE_TICKET_SECRET;

      const payload = {
        transactionId: intent.transactionId,
        bookingId: order.bookingId,
        partnerTxnId: 'MOMO-ATOMIC-001',
        paymentMethod: 'momo' as const,
        amount: order.totalAmount,
        status: 'succeeded' as const,
        payloadTimestamp: new Date().toISOString(),
      };
      const reqWebhookFail = new Request('http://localhost:3000/api/payment/webhook', {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          signature: signWebhookPayload(payload, 'valid-prod-webhook-secret-for-test'),
        }),
      });
      const resWebhookFail = await postPaymentWebhook(reqWebhookFail);
      assert.equal(resWebhookFail.status, 500);
      const bodyFail = (await resWebhookFail.json()) as any;
      assert.equal(bodyFail.error.code, 'SERVER_CONFIGURATION_ERROR');

      // 4. Ticket MUST NOT exist prematurely, and order MUST NOT be marked confirmed
      const reqTicketBefore = new Request(`http://localhost:3000/api/tickets/${order.bookingId}`, {
        headers: { 'x-user-email': 'atomic.ticket@example.com' },
      });
      const resTicketBefore = await getTicketById(reqTicketBefore, {
        params: Promise.resolve({ id: order.bookingId }),
      });
      assert.equal(resTicketBefore.status, 404);

      // 5. Admin configures ticket secret and retries webhook
      process.env.CINEMA_CORE_TICKET_SECRET = 'valid-prod-ticket-signing-secret-for-test';

      const reqWebhookRetry = new Request('http://localhost:3000/api/payment/webhook', {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          signature: signWebhookPayload(payload, 'valid-prod-webhook-secret-for-test'),
        }),
      });
      const resWebhookRetry = await postPaymentWebhook(reqWebhookRetry);
      assert.equal(resWebhookRetry.status, 200);
      const bodyRetry = (await resWebhookRetry.json()) as any;
      assert.equal(bodyRetry.data.bookingStatus, 'CONFIRMED');

      // 6. Ticket can now be successfully retrieved
      const reqTicketAfter = new Request(`http://localhost:3000/api/tickets/${order.bookingId}`, {
        headers: { 'x-user-email': 'atomic.ticket@example.com' },
      });
      const resTicketAfter = await getTicketById(reqTicketAfter, {
        params: Promise.resolve({ id: order.bookingId }),
      });
      assert.equal(resTicketAfter.status, 200);
      const bodyTicketAfter = (await resTicketAfter.json()) as any;
      assert.ok(bodyTicketAfter.data.ticketCode.startsWith('TKT-'));
      assert.equal(bodyTicketAfter.data.bookingId, order.bookingId);
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = origNodeEnv;
      if (origWebhookSecret !== undefined) {
        process.env.CINEMA_CORE_WEBHOOK_SECRET = origWebhookSecret;
      } else {
        delete process.env.CINEMA_CORE_WEBHOOK_SECRET;
      }
      if (origTicketSecret !== undefined) {
        process.env.CINEMA_CORE_TICKET_SECRET = origTicketSecret;
      } else {
        delete process.env.CINEMA_CORE_TICKET_SECRET;
      }
    }
  });

  it('P1-8: Phân biệt webhook lặp cùng giao dịch (200) với khoản thanh toán thành công thứ hai (409 đối soát)', async () => {
    // 1. Create hold and order
    const reqHold = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['G2'],
        userEmail: 'duplicate.pay@example.com',
      }),
    });
    const resHold = await postHold(reqHold);
    const { data: hold } = (await resHold.json()) as any;

    const reqOrder = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        holdId: hold.holdId,
        showtimeId: hold.showtimeId,
        userEmail: 'duplicate.pay@example.com',
        paymentMethod: 'momo',
      }),
    });
    const resOrder = await postOrder(reqOrder);
    const { data: order } = (await resOrder.json()) as any;

    // 2. Create first intent (MoMo)
    const reqIntent1 = new Request('http://localhost:3000/api/payment/intent', {
      method: 'POST',
      headers: { 'x-user-email': 'duplicate.pay@example.com' },
      body: JSON.stringify({
        bookingId: order.bookingId,
        paymentMethod: 'momo',
      }),
    });
    const resIntent1 = await postPaymentIntent(reqIntent1);
    const { data: intent1 } = (await resIntent1.json()) as any;

    // 3. Switch method and create second intent (VNPAY)
    const reqIntent2 = new Request('http://localhost:3000/api/payment/intent', {
      method: 'POST',
      headers: { 'x-user-email': 'duplicate.pay@example.com' },
      body: JSON.stringify({
        bookingId: order.bookingId,
        paymentMethod: 'vnpay',
      }),
    });
    const resIntent2 = await postPaymentIntent(reqIntent2);
    const { data: intent2 } = (await resIntent2.json()) as any;

    // 4. Webhook confirms order via first intent (MoMo) -> 200 OK
    const payload1 = {
      transactionId: intent1.transactionId,
      bookingId: order.bookingId,
      partnerTxnId: 'MOMO-DUP-001',
      paymentMethod: 'momo' as const,
      amount: order.totalAmount,
      status: 'succeeded' as const,
      payloadTimestamp: new Date().toISOString(),
    };
    const reqWebhook1 = new Request('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify({
        ...payload1,
        signature: signWebhookPayload(payload1),
      }),
    });
    const resWebhook1 = await postPaymentWebhook(reqWebhook1);
    assert.equal(resWebhook1.status, 200);

    // 5. Idempotent webhook retry for same transaction (MoMo) -> 200 OK
    const reqWebhook1Dup = new Request('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify({
        ...payload1,
        signature: signWebhookPayload(payload1),
      }),
    });
    const resWebhook1Dup = await postPaymentWebhook(reqWebhook1Dup);
    assert.equal(resWebhook1Dup.status, 200);

    // 6. Second payment webhook arrives for VNPAY (customer paid via both channels)
    // Must NOT return 200 silently, must NOT issue second ticket, must flag for reconciliation (409)
    const payload2 = {
      transactionId: intent2.transactionId,
      bookingId: order.bookingId,
      partnerTxnId: 'VNPAY-DUP-002',
      paymentMethod: 'vnpay' as const,
      amount: order.totalAmount,
      status: 'succeeded' as const,
      payloadTimestamp: new Date().toISOString(),
    };
    const reqWebhook2 = new Request('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify({
        ...payload2,
        signature: signWebhookPayload(payload2),
      }),
    });
    const resWebhook2 = await postPaymentWebhook(reqWebhook2);
    assert.equal(resWebhook2.status, 409);
    const bodyWebhook2 = (await resWebhook2.json()) as any;
    assert.equal(bodyWebhook2.error.code, 'DUPLICATE_PAYMENT_RECONCILIATION_REQUIRED');
  });

  it('P2-9: Webhook FAILED cập nhật trạng thái attempt và retry sau đó tạo transactionId mới', async () => {
    // 1. Create hold and order
    const reqHold = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['G3'],
        userEmail: 'fail.retry@example.com',
      }),
    });
    const resHold = await postHold(reqHold);
    const { data: hold } = (await resHold.json()) as any;

    const reqOrder = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        holdId: hold.holdId,
        showtimeId: hold.showtimeId,
        userEmail: 'fail.retry@example.com',
        paymentMethod: 'momo',
      }),
    });
    const resOrder = await postOrder(reqOrder);
    const { data: order } = (await resOrder.json()) as any;

    // 2. Create intent 1
    const reqIntent1 = new Request('http://localhost:3000/api/payment/intent', {
      method: 'POST',
      headers: { 'x-user-email': 'fail.retry@example.com' },
      body: JSON.stringify({
        bookingId: order.bookingId,
        paymentMethod: 'momo',
      }),
    });
    const resIntent1 = await postPaymentIntent(reqIntent1);
    const { data: intent1 } = (await resIntent1.json()) as any;

    // 3. Webhook reports failure for intent 1
    const payloadFail = {
      transactionId: intent1.transactionId,
      bookingId: order.bookingId,
      partnerTxnId: 'MOMO-FAIL-001',
      paymentMethod: 'momo' as const,
      amount: order.totalAmount,
      status: 'failed' as const,
      payloadTimestamp: new Date().toISOString(),
    };
    const reqWebhookFail = new Request('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify({
        ...payloadFail,
        signature: signWebhookPayload(payloadFail),
      }),
    });
    const resWebhookFail = await postPaymentWebhook(reqWebhookFail);
    assert.equal(resWebhookFail.status, 200);

    // 4. Customer retries with MoMo -> MUST generate a FRESH transactionId (not reuse failed one)
    const reqIntentRetry = new Request('http://localhost:3000/api/payment/intent', {
      method: 'POST',
      headers: { 'x-user-email': 'fail.retry@example.com' },
      body: JSON.stringify({
        bookingId: order.bookingId,
        paymentMethod: 'momo',
      }),
    });
    const resIntentRetry = await postPaymentIntent(reqIntentRetry);
    assert.equal(resIntentRetry.status, 201);
    const { data: intentRetry } = (await resIntentRetry.json()) as any;
    assert.notEqual(intentRetry.transactionId, intent1.transactionId);

    // 5. Webhook for fresh transaction succeeds -> 200 CONFIRMED
    const payloadSuccess = {
      transactionId: intentRetry.transactionId,
      bookingId: order.bookingId,
      partnerTxnId: 'MOMO-SUCCESS-002',
      paymentMethod: 'momo' as const,
      amount: order.totalAmount,
      status: 'succeeded' as const,
      payloadTimestamp: new Date().toISOString(),
    };
    const reqWebhookSuccess = new Request('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify({
        ...payloadSuccess,
        signature: signWebhookPayload(payloadSuccess),
      }),
    });
    const resWebhookSuccess = await postPaymentWebhook(reqWebhookSuccess);
    assert.equal(resWebhookSuccess.status, 200);
    const bodySuccess = (await resWebhookSuccess.json()) as any;
    assert.equal(bodySuccess.data.bookingStatus, 'CONFIRMED');
  });

  it('P1: Đơn CONFIRMED không bị chuyển EXPIRED bởi webhook PROCESSING/UNKNOWN sau TTL và không bị bán trùng ghế', async () => {
    // 1. Tạo hold và đơn hàng cho ghế E7
    const reqHold = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['E7'],
        userEmail: 'vip.customer@cinora.vn',
      }),
    });
    const resHold = await postHold(reqHold);
    assert.equal(resHold.status, 201);
    const { data: hold } = (await resHold.json()) as any;

    const reqOrder = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        holdId: hold.holdId,
        showtimeId: hold.showtimeId,
        userEmail: 'vip.customer@cinora.vn',
        paymentMethod: 'momo',
      }),
    });
    const resOrder = await postOrder(reqOrder);
    assert.equal(resOrder.status, 201);
    const { data: order } = (await resOrder.json()) as any;

    // 2. Tạo payment intent 1 (giao dịch đầu)
    const reqIntent1 = new Request('http://localhost:3000/api/payment/intent', {
      method: 'POST',
      headers: { 'x-user-email': 'vip.customer@cinora.vn' },
      body: JSON.stringify({
        bookingId: order.bookingId,
        paymentMethod: 'momo',
      }),
    });
    const resIntent1 = await postPaymentIntent(reqIntent1);
    const { data: intent1 } = (await resIntent1.json()) as any;

    // 3. Khách hàng retry với cổng khác (VNPAY) -> intent 2
    const reqIntent2 = new Request('http://localhost:3000/api/payment/intent', {
      method: 'POST',
      headers: { 'x-user-email': 'vip.customer@cinora.vn' },
      body: JSON.stringify({
        bookingId: order.bookingId,
        paymentMethod: 'vnpay',
      }),
    });
    const resIntent2 = await postPaymentIntent(reqIntent2);
    const { data: intent2 } = (await resIntent2.json()) as any;

    // 4. Webhook VNPAY (intent 2) thành công -> Đơn hàng chuyển sang CONFIRMED và xuất vé
    const payloadVnpay = {
      transactionId: intent2.transactionId,
      bookingId: order.bookingId,
      partnerTxnId: 'VNPAY-SUCCESS-888',
      paymentMethod: 'vnpay' as const,
      amount: order.totalAmount,
      status: 'succeeded' as const,
      payloadTimestamp: new Date().toISOString(),
    };
    const reqWebhookVnpay = new Request('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify({
        ...payloadVnpay,
        signature: signWebhookPayload(payloadVnpay),
      }),
    });
    const resWebhookVnpay = await postPaymentWebhook(reqWebhookVnpay);
    assert.equal(resWebhookVnpay.status, 200);

    // Kiểm tra vé đã được cấp
    const reqTicket = new Request(`http://localhost:3000/api/tickets/${order.bookingId}`, {
      headers: { 'x-user-email': 'vip.customer@cinora.vn' },
    });
    const resTicket = await getTicketById(reqTicket, { params: Promise.resolve({ id: order.bookingId }) });
    assert.equal(resTicket.status, 200);

    // 5. Tua thời gian để TTL của hold / order hết hạn
    expireOrderForTesting(order.bookingId);

    // 6. Webhook MoMo (intent 1) đến sau TTL với trạng thái PROCESSING hoặc UNKNOWN
    const payloadMomoLate = {
      transactionId: intent1.transactionId,
      bookingId: order.bookingId,
      partnerTxnId: 'MOMO-LATE-001',
      paymentMethod: 'momo' as const,
      amount: order.totalAmount,
      status: 'processing' as const,
      payloadTimestamp: new Date().toISOString(),
    };
    const reqWebhookMomoLate = new Request('http://localhost:3000/api/payment/webhook', {
      method: 'POST',
      body: JSON.stringify({
        ...payloadMomoLate,
        signature: signWebhookPayload(payloadMomoLate),
      }),
    });
    const resWebhookMomoLate = await postPaymentWebhook(reqWebhookMomoLate);
    assert.equal(resWebhookMomoLate.status, 200);
    const bodyMomoLate = (await resWebhookMomoLate.json()) as any;
    assert.equal(bodyMomoLate.data.bookingStatus, 'CONFIRMED');

    // 7. Bảo toàn đơn, vé và ghế: Đơn hàng vẫn CONFIRMED, vé vẫn còn hiệu lực
    const resTicketAfterLate = await getTicketById(reqTicket, { params: Promise.resolve({ id: order.bookingId }) });
    assert.equal(resTicketAfterLate.status, 200);

    // Ghế E7 vẫn thuộc trạng thái RESERVED (đã bán), không bị giải phóng
    const reqSeats = new Request('http://localhost:3000/api/seats?showtimeId=slot-dk-04-1');
    const resSeats = await getSeats(reqSeats);
    const bodySeats = (await resSeats.json()) as any;
    const seatE7 = bodySeats.data.seats.find((s: any) => s.id === 'E7');
    assert.equal(seatE7.status, 'reserved');

    // Người dùng khác không thể đặt ghế E7 (tránh hai vé ISSUED cho cùng ghế)
    const reqHoldDuplicate = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['E7'],
        userEmail: 'stranger@cinora.vn',
      }),
    });
    const resHoldDuplicate = await postHold(reqHoldDuplicate);
    assert.equal(resHoldDuplicate.status, 409);
    const bodyHoldDup = (await resHoldDuplicate.json()) as any;
    assert.equal(bodyHoldDup.error.code, 'SEATS_UNAVAILABLE');
  });

  it('P2: Chặn số lượng combo không an toàn và vượt quá giới hạn, không consume hold khi validation thất bại', async () => {
    // 1. Tạo hold hợp lệ cho ghế D3
    const reqHold = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['D3'],
        userEmail: 'combo.tester@cinora.vn',
      }),
    });
    const resHold = await postHold(reqHold);
    assert.equal(resHold.status, 201);
    const { data: hold } = (await resHold.json()) as any;

    // 2. Thử đặt combo với quantity quá lớn (1e20) -> 400 INVALID_COMBO_QUANTITY
    const reqBadCombo1 = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        holdId: hold.holdId,
        showtimeId: hold.showtimeId,
        userEmail: 'combo.tester@cinora.vn',
        paymentMethod: 'momo',
        combos: [{ id: 'combo-single', quantity: 1e20 }],
      }),
    });
    const resBadCombo1 = await postOrder(reqBadCombo1);
    assert.equal(resBadCombo1.status, 400);
    const bodyBad1 = (await resBadCombo1.json()) as any;
    assert.equal(bodyBad1.error.code, 'INVALID_COMBO_QUANTITY');

    // 3. Thử đặt combo với quantity > 10 (ví dụ 15) -> 400 INVALID_COMBO_QUANTITY
    const reqBadCombo2 = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        holdId: hold.holdId,
        showtimeId: hold.showtimeId,
        userEmail: 'combo.tester@cinora.vn',
        paymentMethod: 'momo',
        combos: [{ id: 'combo-single', quantity: 15 }],
      }),
    });
    const resBadCombo2 = await postOrder(reqBadCombo2);
    assert.equal(resBadCombo2.status, 400);

    // 4. Thử đặt combo số lẻ (1.5) -> 400 INVALID_COMBO_QUANTITY
    const reqBadCombo3 = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        holdId: hold.holdId,
        showtimeId: hold.showtimeId,
        userEmail: 'combo.tester@cinora.vn',
        paymentMethod: 'momo',
        combos: [{ id: 'combo-single', quantity: 1.5 }],
      }),
    });
    const resBadCombo3 = await postOrder(reqBadCombo3);
    assert.equal(resBadCombo3.status, 400);

    // 5. Xác nhận holdId KHÔNG bị consume khi validation thất bại: Có thể dùng tiếp để tạo đơn hợp lệ
    const reqGoodOrder = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        holdId: hold.holdId,
        showtimeId: hold.showtimeId,
        userEmail: 'combo.tester@cinora.vn',
        paymentMethod: 'momo',
        combos: [{ id: 'combo-single', quantity: 2 }],
      }),
    });
    const resGoodOrder = await postOrder(reqGoodOrder);
    assert.equal(resGoodOrder.status, 201);
    const bodyGood = (await resGoodOrder.json()) as any;
    assert.ok(Number.isSafeInteger(bodyGood.data.totalAmount));
  });

  it('P2: Thực thi quy tắc 1 tài khoản chỉ có duy nhất 1 hold đang có hiệu lực trên toàn hệ thống', async () => {
    // 1. User tạo hold đầu tiên cho ghế A5 -> 201 Created
    const reqHold1 = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['A5'],
        userEmail: 'one.hold@cinora.vn',
      }),
    });
    const resHold1 = await postHold(reqHold1);
    assert.equal(resHold1.status, 201);
    const { data: hold1 } = (await resHold1.json()) as any;

    // 2. Cùng user cố tình tạo hold thứ hai cho ghế A6 trong khi hold 1 còn hiệu lực -> 409 USER_ALREADY_HAS_ACTIVE_HOLD
    const reqHold2 = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['A6'],
        userEmail: 'one.hold@cinora.vn',
      }),
    });
    const resHold2 = await postHold(reqHold2);
    assert.equal(resHold2.status, 409);
    const bodyHold2 = (await resHold2.json()) as any;
    assert.equal(bodyHold2.error.code, 'USER_ALREADY_HAS_ACTIVE_HOLD');

    // 3. User khác vẫn có thể tạo hold bình thường cho ghế A6
    const reqOtherUser = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['A6'],
        userEmail: 'other.user@cinora.vn',
      }),
    });
    const resOtherUser = await postHold(reqOtherUser);
    assert.equal(resOtherUser.status, 201);

    // 4. Sau khi hủy hold1, user ban đầu có thể tạo hold mới
    const reqRelease = new Request('http://localhost:3000/api/hold', {
      method: 'DELETE',
      headers: { 'x-user-email': 'one.hold@cinora.vn' },
      body: JSON.stringify({ holdId: hold1.holdId, userEmail: 'one.hold@cinora.vn' }),
    });
    const resRelease = await deleteHold(reqRelease);
    assert.equal(resRelease.status, 200);

    const reqHoldNew = new Request('http://localhost:3000/api/hold', {
      method: 'POST',
      body: JSON.stringify({
        showtimeId: 'slot-dk-04-1',
        seatIds: ['A7'],
        userEmail: 'one.hold@cinora.vn',
      }),
    });
    const resHoldNew = await postHold(reqHoldNew);
    assert.equal(resHoldNew.status, 201);
  });

  it('P2: Chặn hoàn toàn alias rạp Đồng Khởi ghép với slot Landmark hoặc ID ghép sai (trả 404)', async () => {
    // 1. Ghép alias Đồng Khởi với slot Landmark -> 404 SHOWTIME_NOT_FOUND
    const reqCross1 = new Request('http://localhost:3000/api/seats?showtimeId=cgv-dong-khoi-slot-lm-04-1');
    const resCross1 = await getSeats(reqCross1);
    assert.equal(resCross1.status, 404);

    const reqCross2 = new Request('http://localhost:3000/api/seats?showtimeId=cgv-vincom-dong-khoi-slot-lm-04-1');
    const resCross2 = await getSeats(reqCross2);
    assert.equal(resCross2.status, 404);

    const reqCross3 = new Request('http://localhost:3000/api/seats?showtimeId=dong-khoi-slot-lm-04-1');
    const resCross3 = await getSeats(reqCross3);
    assert.equal(resCross3.status, 404);

    // 2. Ghép alias Landmark với slot Đồng Khởi -> 404 SHOWTIME_NOT_FOUND
    const reqCross4 = new Request('http://localhost:3000/api/seats?showtimeId=cgv-landmark-slot-dk-04-1');
    const resCross4 = await getSeats(reqCross4);
    assert.equal(resCross4.status, 404);

    const reqCross5 = new Request('http://localhost:3000/api/seats?showtimeId=landmark-slot-dk-04-1');
    const resCross5 = await getSeats(reqCross5);
    assert.equal(resCross5.status, 404);

    // 3. ID ghép tiền tố giả không tồn tại -> 404 SHOWTIME_NOT_FOUND
    const reqFakePrefix = new Request('http://localhost:3000/api/seats?showtimeId=fake-cinema-slot-dk-04-1');
    const resFakePrefix = await getSeats(reqFakePrefix);
    assert.equal(resFakePrefix.status, 404);

    // 4. Đúng rạp và đúng slot -> 200 OK
    const reqValid1 = new Request('http://localhost:3000/api/seats?showtimeId=cgv-dong-khoi-slot-dk-04-1');
    const resValid1 = await getSeats(reqValid1);
    assert.equal(resValid1.status, 200);

    const reqValid2 = new Request('http://localhost:3000/api/seats?showtimeId=cgv-landmark-slot-lm-04-1');
    const resValid2 = await getSeats(reqValid2);
    assert.equal(resValid2.status, 200);
  });

  it('P2: Loại bỏ substring matching trong getCinemaByIdOrSlug, ID giả phải trả 404', async () => {
    // 1. ID giả chứa substring của tên rạp thật -> 404 CINEMA_NOT_FOUND
    const reqFake1 = new Request('http://localhost:3000/api/cinemas/not-a-real-cgv-dong-khoi');
    const resFake1 = await getCinemaById(reqFake1, { params: Promise.resolve({ id: 'not-a-real-cgv-dong-khoi' }) });
    assert.equal(resFake1.status, 404);

    const reqFake2 = new Request('http://localhost:3000/api/cinemas/fake-dong-khoi-cinema');
    const resFake2 = await getCinemaById(reqFake2, { params: Promise.resolve({ id: 'fake-dong-khoi-cinema' }) });
    assert.equal(resFake2.status, 404);

    const reqFake3 = new Request('http://localhost:3000/api/cinemas/cgv-landmark-fake');
    const resFake3 = await getCinemaById(reqFake3, { params: Promise.resolve({ id: 'cgv-landmark-fake' }) });
    assert.equal(resFake3.status, 404);

    // 2. ID và alias hợp lệ -> 200 OK
    const reqValid1 = new Request('http://localhost:3000/api/cinemas/cgv-dong-khoi');
    const resValid1 = await getCinemaById(reqValid1, { params: Promise.resolve({ id: 'cgv-dong-khoi' }) });
    assert.equal(resValid1.status, 200);

    const reqValid2 = new Request('http://localhost:3000/api/cinemas/cgv-vincom-dong-khoi');
    const resValid2 = await getCinemaById(reqValid2, { params: Promise.resolve({ id: 'cgv-vincom-dong-khoi' }) });
    assert.equal(resValid2.status, 200);

    const reqValid3 = new Request('http://localhost:3000/api/cinemas/dong-khoi');
    const resValid3 = await getCinemaById(reqValid3, { params: Promise.resolve({ id: 'dong-khoi' }) });
    assert.equal(resValid3.status, 200);
  });

  it('P2: Chặn prototype inheritance lookup (constructor, __proto__, toString), trả 404 CINEMA_NOT_FOUND thay vì ném TypeError', async () => {
    // 1. "constructor" không được đọc qua prototype inheritance và phải trả 404
    const reqConstructor = new Request('http://localhost:3000/api/cinemas/constructor');
    const resConstructor = await getCinemaById(reqConstructor, { params: Promise.resolve({ id: 'constructor' }) });
    assert.equal(resConstructor.status, 404);
    const bodyConstructor = (await resConstructor.json()) as any;
    assert.equal(bodyConstructor.error.code, 'CINEMA_NOT_FOUND');

    // 2. "__proto__" không được đọc qua prototype inheritance và phải trả 404
    const reqProto = new Request('http://localhost:3000/api/cinemas/__proto__');
    const resProto = await getCinemaById(reqProto, { params: Promise.resolve({ id: '__proto__' }) });
    assert.equal(resProto.status, 404);
    const bodyProto = (await resProto.json()) as any;
    assert.equal(bodyProto.error.code, 'CINEMA_NOT_FOUND');

    // 3. "toString" không được đọc qua prototype inheritance và phải trả 404
    const reqToString = new Request('http://localhost:3000/api/cinemas/toString');
    const resToString = await getCinemaById(reqToString, { params: Promise.resolve({ id: 'toString' }) });
    assert.equal(resToString.status, 404);
    const bodyToString = (await resToString.json()) as any;
    assert.equal(bodyToString.error.code, 'CINEMA_NOT_FOUND');

    // 4. Các rạp hợp lệ vẫn trả 200
    const reqValid = new Request('http://localhost:3000/api/cinemas/cgv-dong-khoi');
    const resValid = await getCinemaById(reqValid, { params: Promise.resolve({ id: 'cgv-dong-khoi' }) });
    assert.equal(resValid.status, 200);
  });

  it('P2: Lọc format và date chính xác sau chuẩn hóa, NOT-2D và 2099-04/11 không trả dữ liệu', async () => {
    // 1. Format không hợp lệ hoặc format giả chứa chuỗi 2D -> mảng rỗng
    const reqBadFormatMovies = new Request('http://localhost:3000/api/movies?format=NOT-2D');
    const resBadFormatMovies = await getMovies(reqBadFormatMovies);
    assert.equal(resBadFormatMovies.status, 200);
    const bodyBadFormatMovies = (await resBadFormatMovies.json()) as any;
    assert.equal(bodyBadFormatMovies.data.length, 0);

    const reqBadFormatShowtimes = new Request('http://localhost:3000/api/showtimes?format=NOT-2D');
    const resBadFormatShowtimes = await getShowtimes(reqBadFormatShowtimes);
    assert.equal(resBadFormatShowtimes.status, 200);
    const bodyBadFormatShowtimes = (await resBadFormatShowtimes.json()) as any;
    assert.equal(bodyBadFormatShowtimes.data.length, 0);

    // 2. Format 2D hợp lệ -> trả về dữ liệu đúng
    const reqGoodFormat = new Request('http://localhost:3000/api/movies?format=2D');
    const resGoodFormat = await getMovies(reqGoodFormat);
    assert.equal(resGoodFormat.status, 200);
    const bodyGoodFormat = (await resGoodFormat.json()) as any;
    assert.ok(bodyGoodFormat.data.length >= 1);

    // 3. Date giả chứa chuỗi 04/11 (2099-04/11) -> mảng rỗng
    const reqBadDateShowtimes = new Request('http://localhost:3000/api/showtimes?date=2099-04/11');
    const resBadDateShowtimes = await getShowtimes(reqBadDateShowtimes);
    assert.equal(resBadDateShowtimes.status, 200);
    const bodyBadDateShowtimes = (await resBadDateShowtimes.json()) as any;
    assert.equal(bodyBadDateShowtimes.data.length, 0);

    const reqBadDateMovies = new Request('http://localhost:3000/api/movies?date=2099-04/11');
    const resBadDateMovies = await getMovies(reqBadDateMovies);
    assert.equal(resBadDateMovies.status, 200);
    const bodyBadDateMovies = (await resBadDateMovies.json()) as any;
    assert.equal(bodyBadDateMovies.data.length, 0);

    // 4. Date 04/11 hợp lệ -> trả về dữ liệu đúng
    const reqGoodDate = new Request('http://localhost:3000/api/showtimes?date=04/11');
    const resGoodDate = await getShowtimes(reqGoodDate);
    assert.equal(resGoodDate.status, 200);
    const bodyGoodDate = (await resGoodDate.json()) as any;
    assert.ok(bodyGoodDate.data.length >= 1);
  });

  it('Đối chiếu alias BK-2026-CHUYENTAU ánh xạ về slot-dk-04-1 theo yêu cầu review', async () => {
    const reqAlias = new Request('http://localhost:3000/api/seats?showtimeId=BK-2026-CHUYENTAU');
    const resAlias = await getSeats(reqAlias);
    assert.equal(resAlias.status, 200);
    const bodyAlias = (await resAlias.json()) as any;
    assert.equal(bodyAlias.data.showtimeId, 'cgv-dong-khoi-slot-dk-04-1');
  });
});
