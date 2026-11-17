# @platform/contracts

Nguồn thẩm quyền duy nhất (Single Source of Truth) cho các kiểu dữ liệu, DTOs, Enums và Hợp đồng giao tiếp API dùng chung trong Monorepo Movie Booking Platform:
- `apps/web` (Web Client Next.js 16)
- `apps/mobile` (Mobile Client & On-ground Scanner)
- `apps/organizer` (Cinema Organizer Web Portal)
- `services/cinema-core` (Transactional Backend)
- `services/agent-service` (Conversational AI Agent)

**Ranh giới hiện trạng/mục tiêu:** thư viện này sở hữu hợp đồng code hiện có, không sở hữu chính sách
sản phẩm. [Mô hình use case](../../docs/03-product/use-cases.md) và
[đặc tả nghiệp vụ](../../docs/05-specs/domain-context.md) định nghĩa yêu cầu mục tiêu.
Ba role hiện có chưa ánh xạ đủ vai trò nghiệp vụ; `ETicketDto` còn trạng thái chung và yêu cầu soát
chưa chọn tập ghế. Các phương thức thanh toán khác trong enum không mở rộng phạm vi MoMo/VNPAY đã chốt.
Lần đồng bộ tài liệu này không sửa DTO/API; cần đặc tả/kiểm thử tương thích trước khi thay hợp đồng.

**Agent Python:** [ADR-0009](../../docs/06-decisions/0009-python-fastapi-langgraph-and-uv-for-agent-service.md)
chọn Python/FastAPI/LangGraph; package này vẫn giữ nguồn hợp đồng. Hiện có TypeScript interfaces/types,
chưa có pipeline xuất JSON Schema/sinh Pydantic hoặc validation runtime tương ứng được kiểm chứng.
Kiểu TypeScript không tự bảo đảm tương thích lúc chạy hoặc ràng buộc nghiệp vụ xuyên ngôn ngữ.

**Pipeline đã chọn:** theo [ADR-0014](../../docs/06-decisions/0014-zod-json-schema-and-pydantic-contracts.md),
Zod 4 schemas trong package là nguồn hợp đồng được sửa tay; suy kiểu TypeScript, xuất JSON Schema
bằng `z.toJSONSchema()` và dùng `datamodel-code-generator` sinh Pydantic v2. JSON Schema/model Python
là đầu ra dẫn xuất. Chưa chuyển DTO, cài Zod hoặc chạy codegen; profile/dialect và compatibility cần kiểm chứng.

---

## 1. Cấu trúc Module

```text
packages/contracts/src/
├── index.ts                      # Central barrel export
├── common/                       # Enums (as const), Generic API Response, Pagination
├── auth/                         # User Profiles, Roles (Customer, Staff, Admin), CineMember
├── movies/                       # Movie metadata, Cast, Formats, Organizer CRUD DTOs
├── cinemas/                      # Cinemas, Auditoriums, Seat layouts (64-seat sample in existing BFF)
├── showtimes/                    # Showtime slots, Schedules, Collision check DTOs
├── inventory/                    # Live SeatMap, Atomic Hold All-or-Nothing (TTL 5 mins)
├── orders/                       # Orders, Combos, Vouchers, Payment intents, Webhook verification
├── tickets/                      # E-Tickets, Cryptographic QR Payload (HMAC-SHA256), Door Scanner
└── agent/                        # AI Agent tool calling interface with Cinema Core
```

---

## 2. Tiêu chuẩn Kỹ thuật

- **Node.js ESM & Type Stripping**: Tương thích hoàn toàn với cờ `erasableSyntaxOnly: true` (TypeScript 5.8+). Không sử dụng `enum` cũ, sử dụng `as const` object constants kết hợp type union.
- **Dependency và validation**: Package hiện chưa khai báo dependency ngoài. Hướng đã chọn bổ sung Zod 4 để kiểm dữ liệu lúc chạy; codegen Python nằm ở build/CI. Không tuyên bố zero runtime overhead; cần đo và chỉ import phần schema cần dùng khi triển khai.
- **Type Safety**: TypeScript hỗ trợ phát hiện lệch kiểu ở các consumer TypeScript đã tích hợp. Agent Python cần model sinh từ schema và kiểm tra tương thích riêng; thay đổi TTL, chữ ký hoặc bất biến nghiệp vụ vẫn cần kiểm thử runtime.

---

## 3. Chạy kiểm thử

Scripts dưới đây là hiện trạng `node:test` cho contracts/Web, chưa bao phủ toàn bộ nền tảng mục tiêu.
[ADR-0021](../../docs/06-decisions/0021-layered-testing-stack-for-platform.md) chọn Vitest cho suite TS mới
và pytest cho phía Python; chưa migrate scripts hoặc cấu hình kiểm tương thích schema xuyên ngôn ngữ.

```bash
# Kiểm tra riêng thư viện contracts
npm run test:contracts

# Kiểm tra hai workspace hiện có (contracts + apps/web)
npm run test:all
```
