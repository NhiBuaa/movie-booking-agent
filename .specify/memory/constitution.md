# Movie Booking Platform Constitution

## Core Principles

### I. Cinema Core as Single Source of Truth
Cinema Core (`services/cinema-core`) is the authoritative backend for all availability, pricing, seat reservations, hold locks, payment confirmations, and ticket issuance. All four Customer/Organizer apps and the AI Agent (`services/agent-service`) never make independent authoritative transaction assumptions.

### II. Conversational Booking Safety Boundary
The Conversational AI Agent MUST interpret intent, perform authorized queries and produce structured
proposals. After the customer confirms the exact Core-checked content/version, the app/BFF MUST execute
transaction commands under the customer's identity with stable operation IDs. Broad customer transaction
credentials MUST stay outside the model and Agent checkpoints. The agent MUST never claim or display
an order as confirmed or ticket as issued without cryptographic or explicit signature verification from Core.

### III. Monorepo Type Safety & Shared Contracts
Shared public API/event contracts, DTOs and boundary-validation schemas MUST be declared in
`packages/contracts`, with an owning service. Internal domain models, ORM/storage schemas and
migrations MUST remain with their service. Services MUST use contracts rather than cross-service
SQL/JOIN/FK or imports of internal persistence models. Shared TypeScript types do not by themselves
prove runtime compatibility between independently deployed versions.

The target contract source is Zod 4 schemas in `packages/contracts`, with inferred TypeScript
types and JSON Schema export used to generate Pydantic v2 models for the Python Agent via
`datamodel-code-generator`, as accepted in [ADR-0014](../../docs/06-decisions/0014-zod-json-schema-and-pydantic-contracts.md).
Schema/code generation and boundary validation must be checked across languages; shared declarations
alone do not establish runtime compatibility. Existing interfaces/types have not yet been migrated
by this documentation amendment.

### IV. Design System Consistency (Ferrari Dark Cinema)
All visual presentation across Web, Mobile, and Organizer adheres strictly to the tokens and guidelines defined in `DESIGN.md` and `@platform/design-tokens` (Carbone Nero `#000000`, Notte Profonda `#181818`, Rosso Corsa `#DA291C`, hairline borders, uppercase tracked typography).
Native navigation and interaction MUST fit the target operating system while preserving the shared identity.

### V. Verification Before Completion
Code changes require concrete automated test execution before claiming completion. In `apps/customer-web`,
all current test suites MUST pass with reproducible command output before committing or claiming
completion. Document-only work MUST validate affected links, consistency and diagram rendering
when relevant; document checks do not establish runtime behavior.

## Governance & Architecture Boundaries
- Target backend ownership, integration and failure boundaries MUST follow the approved decisions in
  the [seven-service design](../../docs/05-specs/004-service-decomposition/spec.md) and its
  [decision record](../../docs/05-specs/004-service-decomposition/decisions.md). The consolidated spec
  remains draft for owner review; this amendment records existing approvals, not new implementation authority.
- Each service MUST own a separate logical PostgreSQL database and access/migration credentials.
  Core modules may share Core transactions through their interfaces. Shared infrastructure MUST NOT
  be treated as shared business-data ownership.
- Web client is built on Next.js 16 App Router + React 19 + TypeScript.
- Apps MUST use four peer directories: `apps/customer-web`, `apps/customer-mobile`,
  `apps/organizer-web`, `apps/organizer-mobile`, per
  [ADR-0002](../../docs/06-decisions/0002-customer-organizer-app-boundaries.md).
- Both Mobile apps MUST target iOS and Android with platform-appropriate interfaces.
  React Native / Expo Router is the Mobile foundation per ADR-0016; the apps remain separate.
- Customer Mobile serves customers; staff scanning belongs to Organizer Mobile.
  Organizer Web/Mobile provide cinema management and operations by assigned role/cinema;
  co-location MUST NOT imply shared permissions. Mobile management-screen coverage needs feature specification.
- Organizer Web targets React/Vite/TanStack Router per ADR-0015.
- Accepted technology choices and rationale are owned by the [ADR index](../../docs/06-decisions/README.md),
  projected in [PROJECT-OVERVIEW](../../PROJECT-OVERVIEW.md#architecture-direction).
  [CONTEXT](../../CONTEXT.md) distinguishes current implementation; hosting/topology/CD remain deferred.
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

Amendments require explicit owner approval, a stated impact and an updated version/date. Version 1.1.0
recorded the 2026-11-16 product/four-app reconciliation and iOS/Android scope. Version 2.0.0 records
the microservices decisions approved in the 2026-11-17 design conversation and the owner's request
to align project documentation. It replaces shared internal models with service-owned models and
separates Agent proposals from app/BFF transaction execution. Existing feature evidence remains
historical; future implementation MUST reconcile affected contracts and checks before claiming compliance.
Version 2.0.1 clarifies the already accepted technology choices, including the Zod 4 / JSON Schema / Pydantic boundary-contract pipeline, under the owner's synchronization request in Tech Stack conversation `01a1e2f4-4de8-75d2-a43e-efd7365dbd58`. It preserves the four-app/seven-service principles and does not approve application implementation, merge or deployment. Future version
increments use major for incompatible principle changes, minor for added obligations and patch
for non-semantic clarification. Compliance review MUST distinguish accepted requirements from
implemented and verified behavior, preserving unresolved product policies at their canonical owner.

**Version**: 2.0.1 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date not recorded | **Last Amended**: 2026-11-17
