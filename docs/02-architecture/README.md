# 02 — Architecture

This directory owns the architectural model, distinguishing accepted target direction from
observed implementation. [CONTEXT](../../CONTEXT.md) records implementation limits;
the [ADR index](../06-decisions/README.md) owns technology choices and their rationale.

Architecture documents answer:

> How are responsibilities and interactions designed, and what is actually implemented?

Store component boundaries, data/control flow, ownership, integrations, and important failure behavior here.

Do not use this directory for task plans, chronological history, or decision diaries.

Starter: `templates/architecture.md`

## Thiết kế đích

- [Kiến trúc microservices](../05-specs/004-service-decomposition/spec.md) — bản tổng hợp 7 service,
  sở hữu dữ liệu, giao tiếp và ranh giới lỗi; chưa mô tả runtime đã triển khai.
- [Thiết kế dữ liệu microservices](../05-specs/005-data-design/spec.md) — ERD và từ điển cho 7 database PostgreSQL logic,
  luồng giao dịch, phục hồi và kho hỗ trợ. Xem Mục 1 và 7 để đối chiếu trạng thái review, nghiệm thu và quyết định kỹ thuật.
