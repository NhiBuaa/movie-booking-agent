# @platform/shared-logic

Core pure business functions decoupled from UI:
- Seat matrix calculation, max 6 seats constraint, Sweetbox row J pair coupling
- Financial formulas: seat price, combo price, voucher discounts, order subtotal
- Hold countdown TTL formatting and expiration alerts
- QR payload generation and signature hashing

This is a reuse surface, not a transaction authority. Client price/countdown previews do not replace
Core validation. Under the [service design](../../docs/05-specs/004-service-decomposition/spec.md),
each service owns its internal model and persistence; sharing a package grants no cross-service data access.
Ticket signing and signing keys MUST stay on the trusted server side, outside client bundles and Agent checkpoints.
