import crypto from 'node:crypto';
import type { PaymentWebhookPayload, TicketQrPayload } from '@platform/contracts';

/**
 * Server-only cryptographic utilities for Cinema Core communication.
 * Secrets are securely loaded from server environment or fallback dev keys.
 * Never exposed to client bundles or logged.
 */

export function getCinemaCoreWebhookSecret(): string {
  return process.env.CINEMA_CORE_WEBHOOK_SECRET || 'dev-cinema-core-webhook-secret-do-not-use-in-production';
}

export function getCinemaCoreTicketSecret(): string {
  return process.env.CINEMA_CORE_TICKET_SECRET || 'dev-cinema-core-ticket-signing-secret-do-not-use-in-production';
}

/**
 * Canonical data representation for HMAC-SHA256 webhook signature.
 */
export function buildWebhookCanonicalData(
  payload: Omit<PaymentWebhookPayload, 'signature'>
): string {
  return [
    payload.transactionId,
    payload.bookingId,
    payload.partnerTxnId,
    payload.paymentMethod,
    payload.amount,
    payload.status,
    payload.payloadTimestamp,
  ].join(':');
}

/**
 * Computes authoritative HMAC-SHA256 signature for payment webhook.
 */
export function signWebhookPayload(
  payload: Omit<PaymentWebhookPayload, 'signature'>,
  secret: string = getCinemaCoreWebhookSecret()
): string {
  const data = buildWebhookCanonicalData(payload);
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verifies that the payment webhook was genuinely issued by Cinema Core
 * using timing-safe cryptographic comparison.
 */
export function verifyWebhookSignature(
  payload: PaymentWebhookPayload,
  secret: string = getCinemaCoreWebhookSecret()
): boolean {
  if (!payload || typeof payload !== 'object' || !payload.signature || typeof payload.signature !== 'string') {
    return false;
  }

  const expected = signWebhookPayload(payload, secret);
  try {
    const sigA = Buffer.from(payload.signature.toLowerCase().trim(), 'hex');
    const sigB = Buffer.from(expected.toLowerCase().trim(), 'hex');
    if (sigA.length !== sigB.length || sigA.length === 0) {
      return false;
    }
    return crypto.timingSafeEqual(sigA, sigB);
  } catch {
    return false;
  }
}

/**
 * Canonical data representation for Ticket QR digital signature.
 */
export function buildTicketQrCanonicalData(ticket: {
  ticketCode: string;
  bookingId: string;
  showtimeId: string;
  seats: string[];
  issuedAt: string;
  expiresAt: string;
}): string {
  return [
    ticket.ticketCode,
    ticket.bookingId,
    ticket.showtimeId,
    ticket.seats.slice().sort().join(','),
    ticket.issuedAt,
    ticket.expiresAt,
  ].join(':');
}

/**
 * Computes Cinema Core cryptographic digital signature for Ticket QR payload.
 */
export function signTicketQrPayload(
  ticket: {
    ticketCode: string;
    bookingId: string;
    showtimeId: string;
    seats: string[];
    issuedAt: string;
    expiresAt: string;
  },
  secret: string = getCinemaCoreTicketSecret()
): string {
  const data = buildTicketQrCanonicalData(ticket);
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * Verifies Ticket QR digital signature against Cinema Core key.
 */
export function verifyTicketQrSignature(
  qr: TicketQrPayload,
  secret: string = getCinemaCoreTicketSecret()
): boolean {
  if (!qr || !qr.signature || typeof qr.signature !== 'string') {
    return false;
  }

  const expected = signTicketQrPayload(qr, secret);
  try {
    const sigA = Buffer.from(qr.signature.toLowerCase().trim(), 'hex');
    const sigB = Buffer.from(expected.toLowerCase().trim(), 'hex');
    if (sigA.length !== sigB.length || sigA.length === 0) {
      return false;
    }
    return crypto.timingSafeEqual(sigA, sigB);
  } catch {
    return false;
  }
}
