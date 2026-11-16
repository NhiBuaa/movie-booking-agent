# @platform/contracts

Nguồn thẩm quyền duy nhất (Single Source of Truth) cho các kiểu dữ liệu, DTOs, Enums và Hợp đồng giao tiếp API dùng chung trong Monorepo Movie Booking Platform:
- `apps/web` (Web Client Next.js 16)
- `apps/mobile` (Mobile Client & On-ground Scanner)
- `apps/organizer` (Cinema Organizer Web Portal)
- `services/cinema-core` (Transactional Backend)
- `services/agent-service` (Conversational AI Agent)

---

## 1. Cấu trúc Module

```text
packages/contracts/src/
├── index.ts                      # Central barrel export
├── common/                       # Enums (as const), Generic API Response, Pagination
├── auth/                         # User Profiles, Roles (Customer, Staff, Admin), CineMember
├── movies/                       # Movie metadata, Cast, Formats, Organizer CRUD DTOs
├── cinemas/                      # Cinemas, Auditoriums, Matrix 64-seat layout (8x8)
├── showtimes/                    # Showtime slots, Schedules, Collision check DTOs
├── inventory/                    # Live SeatMap, Atomic Hold All-or-Nothing (TTL 5 mins)
├── orders/                       # Orders, Combos, Vouchers, Payment intents, Webhook verification
├── tickets/                      # E-Tickets, Cryptographic QR Payload (HMAC-SHA256), Door Scanner
└── agent/                        # AI Agent tool calling interface with Cinema Core
```

---

## 2. Tiêu chuẩn Kỹ thuật

- **Node.js ESM & Type Stripping**: Tương thích hoàn toàn với cờ `erasableSyntaxOnly: true` (TypeScript 5.8+). Không sử dụng `enum` cũ, sử dụng `as const` object constants kết hợp type union.
- **Zero Runtime Overhead**: Không phụ thuộc vào thư viện bên ngoài; nạp siêu tốc trên cả Web, Mobile, và Backend containers.
- **End-to-End Type Safety**: Đảm bảo mọi thay đổi về cấu trúc ghế, thời gian giữ chỗ TTL, hoặc chữ ký số vé đều được TypeScript cảnh báo tự động ở toàn bộ các ứng dụng.

---

## 3. Chạy kiểm thử

```bash
# Kiểm tra riêng thư viện contracts
npm run test:contracts

# Kiểm tra toàn bộ monorepo (contracts + apps/web)
npm run test:all
```
