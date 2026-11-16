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
Code changes require concrete automated test execution before claiming completion. In `apps/web`,
all current test suites MUST pass with reproducible command output before committing or claiming
completion. Document-only work MUST validate affected links, consistency and diagram rendering
when relevant; document checks do not establish runtime behavior.

## Governance & Architecture Boundaries
- Web client is built on Next.js 16 App Router + React 19 + TypeScript.
- Mobile client targets React Native / Expo with dual customer/staff modes.
- Organizer portal provides cinema management, scheduling, and live analytics.
- Auditorium layouts MUST support per-room seat counts/configuration. A 64-seat matrix is an existing
  sample, not a universal product constraint. Sweetbox pairs and max 6 seats per booking remain required.
- Seat Hold Engine enforces atomic all-or-nothing holds with a 5-minute countdown TTL.
- Actor goals, cinema/data scope, business rules and open policies are owned by the accepted
  [product use case model](../../docs/03-product/use-cases.md). The existing three contract role values
  do not establish a full permission mapping for the target operational roles.

## Development Workflow

Follow the repository Spec Kit workflow for major implementation. Before changing contracts or
runtime behavior, specifications MUST reconcile the target product rules with current code and
identify affected transitions, permissions and checks. Preserve earlier feature evidence rather
than rewriting it as proof of the new requirements. Issues/PRs own plans, progress and verification.

## Governance

Amendments require explicit owner approval, a stated impact and an updated version/date. This
amendment records the documentation reconciliation approved in the design conversation on
2026-11-16; it does not approve application implementation, merge or deployment. Future version
increments use major for incompatible principle changes, minor for added obligations and patch
for non-semantic clarification. Compliance review MUST distinguish accepted requirements from
implemented and verified behavior, preserving unresolved product policies at their canonical owner.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date not recorded | **Last Amended**: 2026-11-16
