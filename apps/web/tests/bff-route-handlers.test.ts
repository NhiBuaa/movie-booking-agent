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
});
