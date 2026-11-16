# Documentation Map

`docs/` is the durable knowledge plane for the project.

The numbered categories provide a predictable discovery order for humans and coding agents. The numbers organize navigation; they do not define authority precedence.

## `01-overview/`

Expanded stable orientation that helps contributors navigate the project beyond the root foundation.

Good fits include a glossary, repository map, system landscape, domain map, or high-level conceptual diagram.

`PROJECT-OVERVIEW.md` remains the canonical owner of project intent, scope, major constraints, architecture direction, and explicit open questions. Do not mirror or paraphrase that file into `01-overview/` merely to fill the directory. If no distinct orientation material is needed, the local `README.md` is enough.

## `02-architecture/`

How the current system works: components, boundaries, ownership, runtime structure, data flow, and failure behavior.

## `03-product/`

Durable product and domain knowledge: users, domain concepts, user flows, terminology, and product rules that are broader than one specification. For repositories with a user interface, visual identity and design tokens are owned by root `DESIGN.md`.

[Mô hình use case](03-product/use-cases.md) sở hữu actor, mục tiêu và BR/OPEN;
[mô tả use case](03-product/use-case-descriptions.md) diễn giải tình huống và [GLOSSARY](../GLOSSARY.md)
sở hữu thuật ngữ. Mô hình mục tiêu đã được duyệt không xác nhận code đã đáp ứng.

Bối cảnh theo ứng dụng nằm ở [Customer Web](../apps/customer-web/PRODUCT.md),
[Customer Mobile](../apps/customer-mobile/PRODUCT.md), [Organizer Web](../apps/organizer-web/PRODUCT.md)
và [Organizer Mobile](../apps/organizer-mobile/PRODUCT.md). PRODUCT không sao chép quyền/BR/OPEN
hoặc thiết kế chung; ranh giới bốn app theo [ADR-0002](06-decisions/0002-customer-organizer-app-boundaries.md).

## `04-standards/`

Normative engineering and modeling rules shared by humans and agents, including
[use case modeling](04-standards/use-case-modeling.md) and UI quality (`ui-quality.md`).

Agent-only working rules belong under `.agents/rules/`, not here.

## `05-specs/`

Durable required behavior for capabilities whose contracts should survive individual tasks.

[Domain context](05-specs/domain-context.md) và [đặc tả chat](05-specs/conversational-booking.md)
diễn giải yêu cầu mục tiêu và dẫn tới BR/OPEN. Chúng không tự sửa hợp đồng code hiện có.
Các đặc tả feature tại `docs/05-specs/<feature>/` giữ phạm vi/bằng chứng ban đầu; ghi quan hệ với yêu cầu mới khi đặc tả phần thay thế.

## `06-decisions/`

Rationale and trade-offs for significant decisions. This is the ADR/decision-history area.

## `07-guides/`

Normal development or operational procedures.

[Công cụ phát triển](07-guides/development-tools.md) hướng dẫn chọn bối cảnh Impeccable,
phân biệt cấu hình live với kiểm chứng và dùng CodeGraph theo worktree.

## `08-runbooks/`

Recovery and incident procedures for abnormal operational states.

## `99-notes/`

The canonical location for useful non-authoritative retained notes that do not belong to a stronger documentation category.

The folder and its `README.md` are part of the canonical skeleton; project-specific notes are optional. Do not create notes merely to populate the directory, and do not use it as a dumping ground for scratch work, task progress, or stale temporary material.

If a note becomes durable project truth, promote it into the appropriate authoritative category and remove or reduce the competing note.

## Work State

Task scope, planning, progress, handoffs, review discussion, CI, and verification belong in the repository Issue/PR system rather than `docs/`.

## Authority Rule

Each durable fact should have one canonical owner. Other artifacts may reference or summarize it, but should not maintain competing authoritative copies.
