# @platform/contracts

Nguồn thẩm quyền duy nhất (Single Source of Truth) cho các kiểu dữ liệu, DTOs, Enums và Hợp đồng giao tiếp API dùng chung trong Monorepo Movie Booking Platform:
- `apps/customer-web` (Web Client Next.js 16)
- `apps/customer-mobile` (Customer Mobile, iOS/Android)
- `apps/organizer-web` (Cinema Organizer Web Portal)
- `apps/organizer-mobile` (Organizer Mobile và soát vé theo vai trò, iOS/Android)
- `services/cinema-core` (Transactional Backend)
- `services/agent-service` (Conversational AI Agent)
- `services/catalog-service` (Movie Catalog)
- `services/identity-service` (Identity & Access)
- `services/notification-service` (Notifications & Delivery)
- `services/community-service` (Reviews & Favorites)
- `services/reporting-service` (Reporting Read Models)

Danh sách trên ánh xạ các bên dùng hợp đồng theo [thiết kế bảy service](../../docs/05-specs/004-service-decomposition/spec.md).
Thư mục service hiện chỉ có README, chưa phải package chạy được; việc có thư mục không chứng minh
DTO/event schema hoặc tích hợp cho mọi service đã tồn tại.

Chỉ hợp đồng giao tiếp công khai dùng chung: DTO, schema xác thực biên, định danh và sự kiện theo chủ sở hữu.
Mô hình nghiệp vụ nội bộ, ORM/schema lưu trữ và migration thuộc từng service; package này không cấp
quyền SQL chéo hoặc buộc các service dùng cùng mô hình dữ liệu. Hợp đồng Agent hiện có cần được hòa giải
với ranh giới Agent đề xuất → app/BFF thực thi, không tự trao quyền giao dịch trực tiếp.

**Ranh giới hiện trạng/mục tiêu:** thư viện này sở hữu hợp đồng code hiện có, không sở hữu chính sách
sản phẩm. [Mô hình use case](../../docs/03-product/use-cases.md) và
[đặc tả nghiệp vụ](../../docs/05-specs/domain-context.md) định nghĩa yêu cầu mục tiêu.
Ba role hiện có chưa ánh xạ đủ vai trò nghiệp vụ; `ETicketDto` còn trạng thái chung và yêu cầu soát
chưa chọn tập ghế. Các phương thức thanh toán khác trong enum không mở rộng phạm vi MoMo/VNPAY đã chốt.
Lần đồng bộ tài liệu này không sửa DTO/API; cần đặc tả/kiểm thử tương thích trước khi thay hợp đồng.

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
- **Zero Runtime Overhead**: Không phụ thuộc vào thư viện bên ngoài; nạp siêu tốc trên cả Web, Mobile, và Backend containers.
- **End-to-End Type Safety**: TypeScript kiểm tra các bên dùng hợp đồng trong phạm vi build tương ứng;
  không tự bảo đảm tương thích giữa các phiên bản service đang triển khai độc lập. Cần kiểm chứng hợp đồng
  và quy trình thay đổi phiên bản theo thiết kế trước khi tuyên bố tích hợp đạt.

---

## 3. Chạy kiểm thử

```bash
# Kiểm tra riêng thư viện contracts
npm run test:contracts

# Kiểm tra toàn bộ monorepo (contracts + apps/customer-web)
npm run test:all
```
