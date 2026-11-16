/**
 * Common domain enumeration constants and union types.
 * Designed with `as const` objects to comply with `erasableSyntaxOnly` (Node.js native type stripping).
 */

export const UserRole = {
  CUSTOMER: 'CUSTOMER',
  CINEMA_STAFF: 'CINEMA_STAFF',
  ORGANIZER_ADMIN: 'ORGANIZER_ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const SeatType = {
  STANDARD: 'standard',
  VIP: 'vip',
  SWEETBOX: 'sweetbox',
} as const;
export type SeatType = (typeof SeatType)[keyof typeof SeatType];

export const SeatStatus = {
  AVAILABLE: 'available',
  SELECTED: 'selected',
  HELD: 'held',
  RESERVED: 'reserved',
  MAINTENANCE: 'maintenance',
} as const;
export type SeatStatus = (typeof SeatStatus)[keyof typeof SeatStatus];

export const HoldStatus = {
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CONSUMED: 'CONSUMED',
  CANCELLED: 'CANCELLED',
} as const;
export type HoldStatus = (typeof HoldStatus)[keyof typeof HoldStatus];

export const BookingStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

export const PaymentStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  UNKNOWN: 'unknown',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  MOMO: 'momo',
  VNPAY: 'vnpay',
  ZALOPAY: 'zalopay',
  CARD: 'card',
  ATM: 'atm',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const TicketStatus = {
  ISSUED: 'ISSUED',
  CHECKED_IN: 'CHECKED_IN',
  VOID: 'VOID',
} as const;
export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

export const MovieAgeRating = {
  P: 'P',
  K: 'K',
  T13: 'T13',
  T16: 'T16',
  T18: 'T18',
  C: 'C',
} as const;
export type MovieAgeRating = (typeof MovieAgeRating)[keyof typeof MovieAgeRating];

export const MovieFormat = {
  TWO_D: '2D',
  THREE_D: '3D',
  IMAX: 'IMAX',
  IMAX_LASER: 'IMAX Laser',
  DOLBY_ATMOS: 'Dolby Atmos',
} as const;
export type MovieFormat = (typeof MovieFormat)[keyof typeof MovieFormat];
