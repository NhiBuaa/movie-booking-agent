import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialBookingState,
  createInitialMessages,
  handleUserPrompt,
  handleSelectShowtime,
  handleConfirmSeats,
  handleProceedToPayment,
  handleExecutePayment,
  toggleSeatSelection,
  calculateSeatsTotal,
  formatCurrency,
  formatTimer,
} from '../src/features/agent/model/agent-logic.ts';
import {
  createDefaultSeatMatrix,
  AGENT_SHOWTIME_FIXTURES,
} from '../src/features/agent/model/agent-fixtures.ts';

describe('S03 Movie Booking Agent Workspace Logic & End-to-End Chat Flow', () => {
  test('Initial state: Starts with greeting and welcome message', () => {
    const initialState = createInitialBookingState();
    const initialMessages = createInitialMessages();

    assert.equal(initialState.step, 'greeting');
    assert.equal(initialState.isHoldActive, false);
    assert.equal(initialState.isPaid, false);
    assert.equal(initialMessages.length, 1);
    assert.equal(initialMessages[0].sender, 'agent');
    assert.equal(initialMessages[0].embeddedCardType, 'none');
  });

  test('Step 1 & 2: User requests booking -> Agent returns showtimes card', () => {
    const state = createInitialBookingState();
    const userPrompt = 'Đặt giúp tôi 2 vé phim Chuyến tàu cuối hè tối nay tại rạp CGV Đồng Khởi nhé';

    const { nextState, newMessages } = handleUserPrompt(userPrompt, state);

    assert.equal(nextState.step, 'showtimes');
    assert.equal(nextState.movie, 'Chuyến Tàu Cuối Hè');
    assert.equal(nextState.cinema, 'CGV Đồng Khởi');
    assert.equal(newMessages.length, 2);

    const [userMsg, agentMsg] = newMessages;
    assert.equal(userMsg.sender, 'user');
    assert.equal(userMsg.text, userPrompt);
    assert.equal(agentMsg.sender, 'agent');
    assert.equal(agentMsg.embeddedCardType, 'showtimes');
    assert.ok(agentMsg.cardData?.showtimes?.length ?? 0 > 0);
  });

  test('Step 3 & 4: User selects showtime 19:30 -> Agent returns seatmap card', () => {
    let state = createInitialBookingState();
    state = handleUserPrompt('Đặt vé Chuyến tàu', state).nextState;

    const showtime1930 = AGENT_SHOWTIME_FIXTURES[0]; // 19:30
    const { nextState, newMessages } = handleSelectShowtime(showtime1930, state);

    assert.equal(nextState.step, 'seatmap');
    assert.equal(nextState.selectedShowtime?.time, '19:30');
    assert.equal(nextState.selectedSeats.length, 2);
    assert.deepEqual(nextState.selectedSeats, ['F5', 'F6']);

    const [userMsg, agentMsg] = newMessages;
    assert.equal(userMsg.sender, 'user');
    assert.ok(userMsg.text.includes('19:30'));
    assert.equal(agentMsg.sender, 'agent');
    assert.equal(agentMsg.embeddedCardType, 'seatmap');
  });

  test('Step 5 & 6: User confirms seats F5, F6 -> Agent activates hold and summary card', () => {
    let state = createInitialBookingState();
    state = handleUserPrompt('Đặt vé', state).nextState;
    state = handleSelectShowtime(AGENT_SHOWTIME_FIXTURES[0], state).nextState;

    const selectedSeats = ['F5', 'F6'];
    const { nextState, newMessages } = handleConfirmSeats(selectedSeats, state);

    assert.equal(nextState.step, 'summary');
    assert.equal(nextState.isHoldActive, true);
    assert.equal(nextState.holdSecondsLeft, 600);
    assert.equal(nextState.totalAmount, 240000); // 2 * 120k VIP

    const [userMsg, agentMsg] = newMessages;
    assert.equal(userMsg.sender, 'user');
    assert.ok(userMsg.text.includes('F5, F6'));
    assert.equal(agentMsg.sender, 'agent');
    assert.equal(agentMsg.embeddedCardType, 'summary');
    assert.equal(agentMsg.cardData?.totalPrice, 240000);
  });

  test('Step 7: Proceed to payment -> Agent displays payment card', () => {
    let state = createInitialBookingState();
    state = handleUserPrompt('Đặt vé', state).nextState;
    state = handleSelectShowtime(AGENT_SHOWTIME_FIXTURES[0], state).nextState;
    state = handleConfirmSeats(['F5', 'F6'], state).nextState;

    const { nextState, newMessages } = handleProceedToPayment(state);

    assert.equal(nextState.step, 'payment');
    const [userMsg, agentMsg] = newMessages;
    assert.equal(userMsg.sender, 'user');
    assert.equal(agentMsg.sender, 'agent');
    assert.equal(agentMsg.embeddedCardType, 'payment');
    assert.equal(agentMsg.cardData?.totalPrice, 240000);
  });

  test('Step 8: Execute MoMo payment -> Agent returns official E-Ticket with QR code', () => {
    let state = createInitialBookingState();
    state = handleUserPrompt('Đặt vé', state).nextState;
    state = handleSelectShowtime(AGENT_SHOWTIME_FIXTURES[0], state).nextState;
    state = handleConfirmSeats(['F5', 'F6'], state).nextState;
    state = handleProceedToPayment(state).nextState;

    const mockQr = 'data:image/png;base64,mockqrdata';
    const { nextState, newMessages } = handleExecutePayment('momo', state, mockQr);

    assert.equal(nextState.step, 'ticket');
    assert.equal(nextState.isPaid, true);
    assert.equal(nextState.paymentMethod, 'momo');
    assert.ok(nextState.ticket);
    assert.equal(nextState.ticket?.status, 'ISSUED');
    assert.equal(nextState.ticket?.totalPrice, 240000);
    assert.ok(nextState.ticket?.bookingCode.startsWith('CNRA-'));
    assert.equal(nextState.ticket?.qrDataUrl, mockQr);

    const [userMsg, agentMsg] = newMessages;
    assert.equal(userMsg.sender, 'user');
    assert.ok(userMsg.text.includes('Ví MoMo'));
    assert.equal(agentMsg.sender, 'agent');
    assert.equal(agentMsg.embeddedCardType, 'ticket');
    assert.equal(agentMsg.cardData?.ticket?.status, 'ISSUED');
  });

  test('Seat Selection & Matrix Logic (AC-03: Max 6 seats, 64 seats matrix)', () => {
    const matrix = createDefaultSeatMatrix(['F5']);
    assert.equal(matrix.length, 8); // 8 rows
    assert.equal(matrix[0].length, 8); // 8 cols -> 64 seats total

    // Check pricing: A-D is standard 110k, E-G is VIP 120k
    assert.equal(matrix[0][0].price, 110000); // A1
    assert.equal(matrix[4][0].price, 120000); // E1 (VIP)
    assert.equal(matrix[7][0].price, 200000); // H1 (Couple)

    // Check toggle behavior
    let seats = ['A1', 'A2'];
    seats = toggleSeatSelection(seats, 'A3', 6);
    assert.deepEqual(seats, ['A1', 'A2', 'A3']);

    // Toggling already selected removes it
    seats = toggleSeatSelection(seats, 'A2', 6);
    assert.deepEqual(seats, ['A1', 'A3']);

    // Max 6 seats limit
    seats = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'];
    seats = toggleSeatSelection(seats, 'A7', 6);
    assert.equal(seats.length, 6); // Does not exceed 6

    // Total price calculation
    const total = calculateSeatsTotal(['E1', 'E2'], matrix);
    assert.equal(total, 240000); // 2 * 120k
  });

  test('Formatters: Currency & Hold countdown timer', () => {
    assert.equal(formatCurrency(240000), '240.000 đ');
    assert.equal(formatCurrency(0), '0 đ');

    assert.equal(formatTimer(600), '10:00');
    assert.equal(formatTimer(599), '09:59');
    assert.equal(formatTimer(65), '01:05');
    assert.equal(formatTimer(0), '00:00');
    assert.equal(formatTimer(-5), '00:00');
  });
});
