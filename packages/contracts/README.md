# @platform/contracts

Shared TypeScript interfaces, Zod validation schemas, and API contracts across:
- `apps/web`
- `apps/mobile`
- `apps/organizer`
- `services/cinema-core`
- `services/agent-service`

## Planned Domains
- **Auth & Identity**: User roles (`CUSTOMER`, `CINEMA_STAFF`, `ORGANIZER_ADMIN`), CineMember profile.
- **Movies & Schedules**: Movie metadata, trailers, genres, ratings, auditoriums, showtime slots.
- **Booking & Seating**: Matrix 64 seats (Standard, VIP, Sweetbox), hold state, hold countdown TTL (5 mins).
- **Payment & Checkout**: MoMo / VNPAY / Credit Card DTOs, voucher validation, order transactions.
- **E-Tickets**: QR payload, verification signature, e-ticket status (`CONFIRMED`, `USED`, `CANCELLED`).
- **Conversational Booking**: Agent cards, intents, tool calling requests/responses.
