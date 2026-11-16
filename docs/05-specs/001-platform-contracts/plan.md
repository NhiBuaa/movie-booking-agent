# Implementation Plan: Standard Platform Data Contracts (@platform/contracts)

> **Phạm vi đối chiếu:** nội dung bên dưới giữ phạm vi kỹ thuật của feature trên nhánh chính,
> không xác nhận đã đáp ứng toàn bộ [mô hình UML mục tiêu](../../03-product/use-cases.md).
> [Hiến pháp](../../../.specify/memory/constitution.md) và [đặc tả nghiệp vụ](../domain-context.md)
> phân biệt yêu cầu mới với code/fixture hiện có. Khi mở rộng sơ đồ ghế, role hoặc trạng thái vé,
> cần đặc tả thay đổi và kiểm chứng riêng; ghi chú này không sửa tiêu chí hay bằng chứng của feature.

**Branch**: `feat/platform-contracts` | **Date**: 2026-11-15 | **Spec**: [docs/05-specs/001-platform-contracts/spec.md](spec.md)

**Input**: Feature specification from `docs/05-specs/001-platform-contracts/spec.md`

## Summary

Thiết lập thư viện hợp đồng dữ liệu chuẩn `@platform/contracts` kết nối toàn diện giữa Web Client, Organizer Portal, Mobile App, Cinema Core Backend và Conversational AI Agent Service theo đúng định hướng Monorepo Platform và các ranh giới dịch vụ độc lập tại ADR-0001.

## Technical Context

- **Language/Version**: TypeScript 6.0+ (ES2022 / ESNext target).
- **Module Format**: Pure ES Modules (`type: module`), hỗ trợ cờ `erasableSyntaxOnly: true` (không dùng TypeScript `enum`, dùng `as const` object constants + type union).
- **Dependencies**: Zero runtime dependencies (không kéo nặng bundler hay xung đột phiên bản runtime giữa React Native, Next.js và Node.js backend).
- **Target Workspaces**:
  - `apps/web` (Next.js 16 App Router)
  - `apps/organizer` (Web Portal)
  - `apps/mobile` (React Native / Expo)
  - `services/cinema-core` (Transactional Backend)
  - `services/agent-service` (AI Agent Orchestrator)
- **Testing**: Node.js native test runner (`node --test`) kiểm tra tính toàn vẹn và type safety của toàn bộ contracts.

## Constitution Check

- [x] **I. Cinema Core as Single Source of Truth**: Các DTOs thể hiện rõ Cinema Core là thẩm quyền duy nhất về Hold, Pricing, Payment và E-Ticket issuance.
- [x] **II. Conversational Booking Safety Boundary**: Agent tool calling contracts phân định rạch ròi giữa NLU intents và kết quả giao dịch chính thức có chữ ký số.
- [x] **III. Monorepo Type Safety & Shared Contracts**: Toàn bộ DTOs, Enums, Interfaces được đặt tập trung tại `packages/contracts/src`.
- [x] **IV. Design System Consistency**: Các format, nhãn, mã màu giữ nhất quán với Ferrari Dark Cinema.
- [x] **V. Verification Before Completion**: Chạy test kiểm chứng contracts và đảm bảo 83/83 tests của `apps/web` không bị ảnh hưởng.

## Project Structure & Architecture

```text
packages/contracts/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts                      # Central barrel export
    ├── common/                       # Base types, roles, formats, enums as const
    │   ├── enums.ts
    │   ├── base.ts
    │   └── index.ts
    ├── auth/                         # User identity & roles (Customer, Staff, Admin)
    │   ├── types.ts
    │   └── index.ts
    ├── movies/                       # Movie metadata, genres, media assets, CRUD DTOs
    │   ├── types.ts
    │   └── index.ts
    ├── cinemas/                      # Cinemas, Auditoriums, 64-seat matrix layout
    │   ├── types.ts
    │   └── index.ts
    ├── showtimes/                    # Showtime slots, schedules, collision checks
    │   ├── types.ts
    │   └── index.ts
    ├── inventory/                    # Real-time SeatMap, Atomic Hold TTL (5 mins)
    │   ├── types.ts
    │   └── index.ts
    ├── orders/                       # Bookings, Combos, Vouchers, Payment intents & Webhooks
    │   ├── types.ts
    │   └── index.ts
    ├── tickets/                      # E-Tickets, QR payload, Cryptographic HMAC signature, Scanner
    │   ├── types.ts
    │   └── index.ts
    └── agent/                        # AI Agent tool calling interfaces with Cinema Core
        ├── types.ts
        └── index.ts
```

## Implementation Phases

1. **Phase 1: Common & Auth Foundation**: Enums chuẩn (`as const`), Roles, Base API Response DTOs.
2. **Phase 2: Catalog Domain (Movies, Cinemas, Showtimes)**: Cấu hình phim, rạp, phòng chiếu 64 ghế, và lịch chiếu đa phòng.
3. **Phase 3: Transactional Domain (Inventory, Hold Engine, Orders, Payment)**: Atomic Hold All-or-Nothing, TTL 300s, Checkout, Webhooks.
4. **Phase 4: Verification & Operations Domain (E-Tickets, Scanner, Agent Tools)**: QR Payload có chữ ký số, soát vé cửa phòng chiếu, AI Agent tool calling.
5. **Phase 5: Verification & Monorepo Integration**: Viết bộ test `tests/contracts.test.ts`, kiểm tra typecheck và chạy `npm test`.
