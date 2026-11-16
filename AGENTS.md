# Repository Guidance

## Mission

Build and maintain the comprehensive Movie Booking Platform featuring a Next.js 16 user-facing Web app, Mobile app, Cinema Organizer Portal, Cinema Core transactional backend, and Conversational AI Agent service within a unified, high-craft Monorepo.

## Authority Map

- `PROJECT-OVERVIEW.md` — project foundation, scope, architecture direction, and explicit open questions.
- `CONTEXT.md` — current project-state projection and boundary conditions.
- `DESIGN.md` — canonical visual identity and design system (Ferrari Dark Cinema).
- `docs/` — durable project knowledge (architecture, standards, specs, decisions, guides).
- `.agents/rules/` — detailed and scoped agent-only rules (e.g. `ui-skill-routing.md`).
- `.agents/references/` — non-normative supporting material for agents.
- Issues — task scope, planning, progress, and handoff state.
- Pull Requests — implementation discussion, review, CI, and verification.
- source code and tests — implementation reality.

Do not duplicate Issue/PR state in repository markdown files.

## Read Order

For meaningful work:

1. Read this file.
2. Read `PROJECT-OVERVIEW.md` and `CONTEXT.md` when the task requires project-level context.
3. Read root `DESIGN.md` and `.agents/rules/ui-skill-routing.md` when the task touches user interfaces.
4. Read the relevant Issue or task.
5. Read only the relevant numbered `docs/` areas (e.g., `docs/04-standards/ui-quality.md` when working on UI implementation and verification).
6. Read applicable `.agents/rules/` or `.agents/references/` when useful.
7. Inspect implementation and tests.

## Critical Invariants

- **Authoritative Core:** Cinema Core (`services/cinema-core`) is the single source of truth for seat availability, pricing, hold TTL, payment confirmation, and ticket issuance. Client apps and AI Agent never assume authoritative status.
- **Conversational Booking Safety:** The AI Agent interprets intent and coordinates tools. It must NEVER claim or present an order as confirmed or ticket as issued without cryptographic or explicit signature verification from Cinema Core.
- **Visual Identity Discipline:** All user interfaces (`apps/web`, `apps/organizer`, `apps/mobile`) must adhere strictly to the Ferrari Dark Cinema design tokens in root `DESIGN.md` and `packages/design-tokens/tokens.css`.
- **Preserve Security Boundaries:** Role separation between `CUSTOMER`, `CINEMA_STAFF`, and `ORGANIZER_ADMIN` must be strictly enforced. Never expose secrets or credentials in client bundles.
- **Verification Before Completion:** Every code change in `apps/web` must run test suites (`npm test` or `npm run test:all`) and pass 100% before claiming task completion.

## Working Agreements

- Understand existing implementation before editing.
- Prefer the smallest independently verifiable change.
- Avoid unrelated refactors.
- Preserve unresolved questions instead of guessing.
- Promote durable findings into the correct `docs/` category when needed.
- Follow the GitHub Spec Kit workflow (`.specify/`) for major feature development (`constitution -> specify -> plan -> tasks -> implement -> converge`).
- Before creating or moving Spec Kit artifacts, follow the feature-directory guidance in [docs/05-specs/README.md](docs/05-specs/README.md).

## Agent Configuration Rules

- `.agents/rules/` is for agent-only behavior.
- `.agents/references/` is non-normative support material.
- If humans or the software must obey a rule too, prefer `docs/04-standards/`.
- Do not create `.agents/commands/`, `.agents/hooks/`, or `.agents/skills/` unless the project has a concrete need for them.

## Selective Issue/PR Closeout

At normal task closeout, consider only reusable findings; no new lesson is a valid outcome.

- Verify each candidate against code/tests or an accepted decision, and link its Issue/PR evidence or commit. Distinguish proposed, implemented, accepted, merged and deployed; one does not imply the others.
- Update an existing owner, not a second copy: decisions in the relevant architecture record, software invariants in standards, operational pitfalls in the relevant guide/runbook, and agent-only routing in AGENTS or scoped rules. Prefer a regression check for executable behavior; do not create a skill, hook or knowledge store just to record a lesson.
- Make small, safe corrections within the already approved scope without another approval checkpoint. Include them in the normal diff and completion report.
- Propose out-of-scope policy, architecture or knowledge-authority changes for approval before applying them. Do not block unrelated approved completion on such a proposal. Closeout never grants publication, deployment, installation or permission changes.
- Keep transient progress in the Issue/PR. Preserve historical evidence and untracked files; link rather than copy logs or conversations. Memory and old notes are retrieval aids, not overrides of verified implementation or accepted decisions.

Report briefly: no reusable finding, updated owner + evidence, or an out-of-scope proposal awaiting approval.

## Validation

```bash
# Run all unit and logic tests across apps/web
npm test

# Check kit conformance and markdown link integrity
powershell -ExecutionPolicy Bypass -File "C:\Developer\Projects\agentic-repo-kit-reference\scripts\check-kit.ps1" -TargetPath .
```
