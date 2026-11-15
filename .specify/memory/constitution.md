# Movie Booking Platform Constitution

## Core Principles

### I. Cinema Core as Single Source of Truth
Cinema Core (`services/cinema-core`) is the authoritative backend for all availability, pricing, seat reservations, hold locks, payment confirmations, and ticket issuance. Client apps (`apps/web`, `apps/mobile`) and the AI Agent (`services/agent-service`) never make independent authoritative transaction assumptions.

### II. Conversational Booking Safety Boundary
The Conversational AI Agent interprets natural language and coordinates booking actions via Cinema Core tools. The agent must never claim or display an order as confirmed or ticket as issued without cryptographic or explicit signature verification from Cinema Core.

### III. Monorepo Type Safety & Shared Contracts
All domain models, Zod validation schemas, and DTOs are declared in `packages/contracts` to ensure complete end-to-end type safety across Web, Mobile, Organizer Portal, Cinema Core, and Agent Service.

### IV. Design System Consistency (Ferrari Dark Cinema)
All visual presentation across Web, Mobile, and Organizer adheres strictly to the tokens and guidelines defined in `DESIGN.md` and `@platform/design-tokens` (Carbone Nero `#000000`, Notte Profonda `#181818`, Rosso Corsa `#DA291C`, hairline borders, uppercase tracked typography).

### V. Verification Before Completion
No task, feature, or bugfix is marked complete without concrete automated test execution. In `apps/web`, all test suites must pass 100% with reproducible command output before committing or claiming completion.

## Governance & Architecture Boundaries
- Web client is built on Next.js 16 App Router + React 19 + TypeScript.
- Mobile client targets React Native / Expo with dual customer/staff modes.
- Organizer portal provides cinema management, scheduling, and live analytics.
- Seat Matrix enforces 64 seats per auditorium with explicit coupling for Sweetbox pairs and max 6 seats per booking.
- Seat Hold Engine enforces atomic all-or-nothing holds with a 5-minute countdown TTL.
