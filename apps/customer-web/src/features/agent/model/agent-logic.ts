/**
 * Pure Business Logic and State Machine for S03 Movie Booking Agent
 * Coordinates CB-01 through CB-06 conversational transitions.
 */

import type {
  ChatBookingState,
  ChatMessage,
  ShowtimeOption,
  Seat,
  PaymentMethod,
  TicketInfo,
} from './types.ts';
import {
  AGENT_SHOWTIME_FIXTURES,
  createDefaultSeatMatrix,
  SAMPLE_ISSUED_TICKET,
} from './agent-fixtures.ts';

export function createInitialBookingState(): ChatBookingState {
  return {
    step: 'greeting',
    movie: null,
    cinema: null,
    date: null,
    selectedShowtime: null,
    selectedSeats: [],
    holdSecondsLeft: 600,
    isHoldActive: false,
    totalAmount: 0,
    paymentMethod: null,
    isPaid: false,
    ticket: null,
    sessionTitle: 'Cuộc trò chuyện mới',
  };
}

export function createInitialMessages(): ChatMessage[] {
  return [
    {
      id: 'msg-welcome',
      sender: 'agent',
      text: 'Chào bạn! Tôi là Cinora Buaa AI · Trợ lý Điện ảnh Thông minh. Bạn muốn thưởng thức tác phẩm nào tối nay? Nhắn tin tự nhiên để tìm phim, giữ chỗ tức thì và nhận vé QR ngay trong hội thoại.',
      timestamp: 'Vừa xong',
      embeddedCardType: 'none',
    },
  ];
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} đ`;
}

export function formatTimer(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function toggleSeatSelection(
  currentSeats: string[],
  seatId: string,
  maxSeats: number = 6
): string[] {
  if (currentSeats.includes(seatId)) {
    return currentSeats.filter((s) => s !== seatId);
  }
  if (currentSeats.length >= maxSeats) {
    return currentSeats;
  }
  return [...currentSeats, seatId].sort();
}

export function calculateSeatsTotal(selectedSeatIds: string[], matrix: Seat[][]): number {
  let total = 0;
  const flatSeats = matrix.flat();
  for (const id of selectedSeatIds) {
    const seat = flatSeats.find((s) => s.id === id);
    if (seat) {
      total += seat.price;
    }
  }
  return total;
}

/**
 * Handles incoming user prompt text and determines state transition
 */
export function handleUserPrompt(
  promptText: string,
  currentState: ChatBookingState
): { nextState: ChatBookingState; newMessages: ChatMessage[] } {
  const trimmed = promptText.trim();
  const lower = trimmed.toLowerCase();
  const userMsgId = `user-${Date.now()}`;
  const agentMsgId = `agent-${Date.now() + 1}`;

  const userMessage: ChatMessage = {
    id: userMsgId,
    sender: 'user',
    text: trimmed,
    timestamp: 'Vừa xong',
    embeddedCardType: 'none',
  };

  // If asking for Chuyến tàu / Booking
  if (
    lower.includes('chuyến tàu') ||
    lower.includes('đặt') ||
    lower.includes('vé') ||
    lower.includes('imax') ||
    currentState.step === 'greeting'
  ) {
    const nextState: ChatBookingState = {
      ...currentState,
      step: 'showtimes',
      movie: 'Chuyến Tàu Cuối Hè',
      cinema: 'CGV Đồng Khởi',
      date: 'Tối nay',
      sessionTitle: 'Chuyến Tàu Cuối Hè · CGV Đồng Khởi',
    };

    const agentMessage: ChatMessage = {
      id: agentMsgId,
      sender: 'agent',
      text: 'Chào bạn! Tôi đã tìm thấy các suất chiếu tối nay của phim Chuyến tàu cuối hè tại CGV Đồng Khởi:',
      timestamp: 'Vừa xong',
      embeddedCardType: 'showtimes',
      cardData: {
        movieTitle: 'Chuyến Tàu Cuối Hè',
        cinemaName: 'CGV Đồng Khởi',
        showtimes: AGENT_SHOWTIME_FIXTURES,
      },
    };

    return { nextState, newMessages: [userMessage, agentMessage] };
  }

  // Fallback natural response
  const agentMessage: ChatMessage = {
    id: agentMsgId,
    sender: 'agent',
    text: `Tôi đã ghi nhận yêu cầu: "${trimmed}". Tôi đang đồng bộ với hệ thống rạp Cinema Core để tìm kiếm các lựa chọn tốt nhất cho bạn...`,
    timestamp: 'Vừa xong',
    embeddedCardType: 'none',
  };

  return { nextState: currentState, newMessages: [userMessage, agentMessage] };
}

/**
 * Step 3 -> 4: User selects a showtime option
 */
export function handleSelectShowtime(
  showtime: ShowtimeOption,
  currentState: ChatBookingState
): { nextState: ChatBookingState; newMessages: ChatMessage[] } {
  const userMsgId = `user-${Date.now()}`;
  const agentMsgId = `agent-${Date.now() + 1}`;

  const userMessage: ChatMessage = {
    id: userMsgId,
    sender: 'user',
    text: `Chọn suất ${showtime.time} (${showtime.room})`,
    timestamp: 'Vừa xong',
    embeddedCardType: 'none',
  };

  const initialSeats = ['F5', 'F6'];
  const matrix = createDefaultSeatMatrix(initialSeats);
  const total = calculateSeatsTotal(initialSeats, matrix);

  const nextState: ChatBookingState = {
    ...currentState,
    step: 'seatmap',
    selectedShowtime: showtime,
    selectedSeats: initialSeats,
    totalAmount: total,
  };

  const agentMessage: ChatMessage = {
    id: agentMsgId,
    sender: 'agent',
    text: 'Tuyệt vời, bạn hãy chọn ghế trên sơ đồ bên dưới (tối đa 6 ghế):',
    timestamp: 'Vừa xong',
    embeddedCardType: 'seatmap',
    cardData: {
      movieTitle: currentState.movie || 'Chuyến Tàu Cuối Hè',
      cinemaName: currentState.cinema || 'CGV Đồng Khởi',
      roomName: showtime.room,
      showtimeTime: showtime.time,
      seatMatrix: matrix,
      selectedSeats: initialSeats,
      totalPrice: total,
    },
  };

  return { nextState, newMessages: [userMessage, agentMessage] };
}

/**
 * Step 5 -> 6: User confirms seat selection
 */
export function handleConfirmSeats(
  confirmedSeats: string[],
  currentState: ChatBookingState
): { nextState: ChatBookingState; newMessages: ChatMessage[] } {
  const userMsgId = `user-${Date.now()}`;
  const agentMsgId = `agent-${Date.now() + 1}`;

  const matrix = createDefaultSeatMatrix(confirmedSeats);
  const total = calculateSeatsTotal(confirmedSeats, matrix);

  const userMessage: ChatMessage = {
    id: userMsgId,
    sender: 'user',
    text: `Tôi chọn ghế ${confirmedSeats.join(', ')}`,
    timestamp: 'Vừa xong',
    embeddedCardType: 'none',
  };

  const nextState: ChatBookingState = {
    ...currentState,
    step: 'summary',
    selectedSeats: confirmedSeats,
    totalAmount: total,
    isHoldActive: true,
    holdSecondsLeft: 600,
  };

  const agentMessage: ChatMessage = {
    id: agentMsgId,
    sender: 'agent',
    text: `Đã giữ ${confirmedSeats.length} ghế ${confirmedSeats.join(', ')} trong 10 phút. Tổng tiền là ${formatCurrency(total)}:`,
    timestamp: 'Vừa xong',
    embeddedCardType: 'summary',
    cardData: {
      movieTitle: currentState.movie || 'Chuyến Tàu Cuối Hè',
      cinemaName: currentState.cinema || 'CGV Đồng Khởi',
      roomName: currentState.selectedShowtime?.room || 'Phòng 01 (Laser)',
      showtimeTime: currentState.selectedShowtime?.time || '19:30',
      selectedSeats: confirmedSeats,
      totalPrice: total,
      holdCountdownSeconds: 600,
    },
  };

  return { nextState, newMessages: [userMessage, agentMessage] };
}

/**
 * Step 6 -> 7: User confirms summary & moves to payment choice
 */
export function handleProceedToPayment(
  currentState: ChatBookingState
): { nextState: ChatBookingState; newMessages: ChatMessage[] } {
  const userMsgId = `user-${Date.now()}`;
  const agentMsgId = `agent-${Date.now() + 1}`;

  const userMessage: ChatMessage = {
    id: userMsgId,
    sender: 'user',
    text: 'Xác nhận và tiếp tục thanh toán',
    timestamp: 'Vừa xong',
    embeddedCardType: 'none',
  };

  const nextState: ChatBookingState = {
    ...currentState,
    step: 'payment',
  };

  const agentMessage: ChatMessage = {
    id: agentMsgId,
    sender: 'agent',
    text: 'Vui lòng chọn phương thức thanh toán để xuất vé điện tử:',
    timestamp: 'Vừa xong',
    embeddedCardType: 'payment',
    cardData: {
      totalPrice: currentState.totalAmount,
      holdCountdownSeconds: currentState.holdSecondsLeft,
    },
  };

  return { nextState, newMessages: [userMessage, agentMessage] };
}

/**
 * Step 7 -> 8: User executes payment & receives E-Ticket with QR code
 */
export function handleExecutePayment(
  method: PaymentMethod,
  currentState: ChatBookingState,
  qrDataUrl: string
): { nextState: ChatBookingState; newMessages: ChatMessage[] } {
  const userMsgId = `user-${Date.now()}`;
  const agentMsgId = `agent-${Date.now() + 1}`;

  const methodLabel = method === 'momo' ? 'Ví MoMo' : method === 'vnpay' ? 'VNPAY-QR' : 'Thẻ ngân hàng';

  const userMessage: ChatMessage = {
    id: userMsgId,
    sender: 'user',
    text: `Thanh toán qua ${methodLabel} (${formatCurrency(currentState.totalAmount)})`,
    timestamp: 'Vừa xong',
    embeddedCardType: 'none',
  };

  const ticket: TicketInfo = {
    ...SAMPLE_ISSUED_TICKET,
    bookingCode: `CNRA-${Math.floor(100000 + Math.random() * 900000)}`,
    movieTitle: currentState.movie || 'Chuyến Tàu Cuối Hè',
    cinemaName: currentState.cinema || 'CGV Đồng Khởi',
    hallName: currentState.selectedShowtime?.room || 'Phòng 01 (Laser)',
    showtime: currentState.selectedShowtime?.time || '19:30',
    seats: currentState.selectedSeats.length > 0 ? currentState.selectedSeats : ['F5', 'F6'],
    totalPrice: currentState.totalAmount > 0 ? currentState.totalAmount : 240000,
    qrDataUrl,
    issuedAt: `${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} · Hôm nay`,
    status: 'ISSUED',
  };

  const nextState: ChatBookingState = {
    ...currentState,
    step: 'ticket',
    isPaid: true,
    paymentMethod: method,
    ticket,
  };

  const agentMessage: ChatMessage = {
    id: agentMsgId,
    sender: 'agent',
    text: 'Thanh toán thành công! Vé điện tử của bạn đã được Cinema Core phát hành và sẵn sàng vào rạp:',
    timestamp: 'Vừa xong',
    embeddedCardType: 'ticket',
    cardData: {
      ticket,
    },
  };

  return { nextState, newMessages: [userMessage, agentMessage] };
}
