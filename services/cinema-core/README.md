# Cinema Core Service (`services/cinema-core`)

Authoritative transactional backend system for the Movie Booking Platform.

## Core Responsibilities
- **Single Source of Truth**: Availability, pricing, seat reservation, hold countdown timer (TTL), payment verification, and ticket issuance.
- **Seat Lock / Hold Engine**: High-concurrency seat locking mechanism (e.g. Redis-backed atomic TTL hold) preventing double-booking during checkout.
- **Payment Verification**: Idempotent payment webhooks (MoMo, VNPAY, Stripe), signature validation, and refund processing.
- **Cryptographic E-Ticket Issuance**: Generates signed QR payloads for verified transactions; rejects unconfirmed or expired tickets.
