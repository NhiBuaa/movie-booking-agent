import type { PaymentMethod, TicketStatus } from '../common/enums.ts';

/**
 * Authoritative E-Ticket Issued exclusively by Cinema Core.
 */
export interface ETicketDto {
  ticketCode: string; // e.g. "TKT-8892-VN"
  bookingId: string;
  partnerTxnId: string; // e.g. "MOMO-992102"
  paidAt: string; // ISO 8601
  movieTitle: string;
  movieSlug?: string;
  cinemaName: string;
  hallName: string;
  showDate: string; // e.g. "07/11/2026"
  showTime: string; // e.g. "19:30"
  seats: string[]; // e.g. ["F5", "F6"]
  seatType: string; // e.g. "VIP"
  comboDescription?: string;
  totalPaid: number;
  paymentMethod: PaymentMethod;
  status: TicketStatus;
  qrPayload: string; // Full JSON string with digital signature
  checkedInAt?: string;
}

/**
 * Payload embedded inside the QR Code image.
 * Must be signed with HMAC-SHA256 by Cinema Core.
 */
export interface TicketQrPayload {
  ticketCode: string;
  bookingId: string;
  showtimeId: string;
  seats: string[];
  issuedAt: string;
  expiresAt: string;
  signature: string; // Cryptographic signature verifying authenticity
}

/**
 * Mobile Scanner Request used by on-ground cinema staff (`apps/organizer-mobile`).
 */
export interface VerifyTicketRequest {
  qrPayload: string;
  scannedByStaffId: string;
  auditoriumId?: string;
}

export type TicketCheckinResult =
  | 'SUCCESS_CHECKED_IN'
  | 'ALREADY_CHECKED_IN'
  | 'INVALID_SIGNATURE'
  | 'WRONG_AUDITORIUM'
  | 'TICKET_EXPIRED'
  | 'TICKET_VOID';

export interface VerifyTicketResponse {
  valid: boolean;
  ticket?: ETicketDto;
  result: TicketCheckinResult;
  message: string;
  timestamp: string;
}
