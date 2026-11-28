# Data Model: A-01 — Đăng ký tài khoản khách hàng (Customer Registration)

**Feature**: `007-customer-registration`  
**Date**: 2026-11-21 (cập nhật xử lý toàn diện findings PL1, PL2, PL4, PL5 ngày 2026-11-22)  
**Status**: Completed  
**Authority**: Kế thừa [spec.md](spec.md) v0.3.2, [Constitution v2.0.1](../../../.specify/memory/constitution.md) (Ranh giới chủ dữ liệu danh tính Identity Service vs Cinema Core), [ADR-0007](../../06-decisions/0007-transactional-outbox-debezium-kafka.md), [ADR-0008](../../06-decisions/0008-better-auth-with-direct-login.md), và [research.md](research.md).

> **Lưu ý về nguồn tài liệu**: Các tài liệu thiết kế cơ sở dữ liệu sơ bộ (`docs/05-specs/005-data-design/databases/*.md`) là tài liệu tham chiếu cấu trúc logic, không phải quyết định schema vật lý đã được phê duyệt toàn bộ. Mô hình dữ liệu dưới đây là thiết kế chuẩn hóa phục vụ trực tiếp cho tính năng A-01.

---

## 1. Sơ đồ ranh giới sở hữu dữ liệu và Luồng Outbox CDC

```
+-----------------------------------------------------------------------------------------+
|                                    IDENTITY SERVICE                                     |
|                                                                                         |
|  +--------------------+                    +-----------------------------------------+  |
|  |       users        |<-------------------|                accounts                 |  |
|  |  (id = UUID)       | (user_id = users.id| (account_id = users.id, provider='cre')|  |
|  +--------------------+                    +-----------------------------------------+  |
|            |                                                                            |
|            v                                                                            |
|  +--------------------+                    +-----------------------------------------+  |
|  |user_role_assignment|                    |              outbox_events              |  |
|  |role_code='CUSTOMER'|                    | (status='PENDING', payload=JSONB)       |  |
|  +--------------------+                    +-----------------------------------------+  |
+------------------------------------------------------------------|----------------------+
                                                                   |
                                              [1. PostgreSQL WAL Logical Decoding]
                                                                   |
                                                                   v
                                                     +----------------------------+
                                                     |    Debezium CDC Connector  |
                                                     |    (Kafka Connect KRaft)   |
                                                     +----------------------------+
                                                                   |
                                              [2. Event: identity.customer-registered]
                                                                   |
                                                                   v
                                                     +----------------------------+
                                                     |   Apache Kafka KRaft Topic |
                                                     +----------------------------+
                                                                   |
                                              [3. At-least-once Consumer Poll]
                                                                   |
                                                                   v
+------------------------------------------------------------------|----------------------+
|                                      CINEMA CORE                 |                      |
|                                                                  v                      |
|  +-----------------------------------------------------------------------------------+  |
|  |                                  loyalty_members                                  |  |
|  |  (user_id = UUID UNIQUE, points_balance = 0.00 DECIMAL(10,2), status = 'ACTIVE')  |  |
|  +-----------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
```

- **Identity Service**: Chủ dữ liệu duy nhất sở hữu thông tin tài khoản người dùng (`users`), thông tin xác thực mật khẩu (`accounts`), phân quyền vai trò (`user_role_assignments`) và hàng đợi sự kiện giao dịch (`outbox_events`). Cả 4 bảng này được ghi nguyên tử trong **cùng 1 transaction PostgreSQL**.
- **Cinema Core**: Chủ dữ liệu duy nhất sở hữu hồ sơ hội viên CineMember (`loyalty_members`). Không gọi SQL chéo, đồng bộ bất đồng bộ qua Transactional Outbox + Debezium CDC + Kafka KRaft topic `identity.customer-registered`, xử lý idempotent bằng `ON CONFLICT (user_id) DO NOTHING`.

---

## 2. Thực thể trong Identity Service (PostgreSQL)

Mọi bảng đều thống nhất sử dụng kiểu dữ liệu **`UUID`** chuẩn (UUIDv7 canonical 36 ký tự `8-4-4-4-12`) để bảo đảm tính nhất quán và hiệu năng chỉ mục B-tree.

### 2.1. Bảng `users` (Hồ sơ người dùng định danh)

Lưu trữ thông tin cơ bản của người dùng định danh trong toàn hệ thống.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Khóa chính duy nhất của người dùng (UUIDv7) |
| `name` | `VARCHAR(255)` | `NOT NULL` | Họ và tên đầy đủ của khách hàng |
| `email` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | Địa chỉ email (đã chuẩn hóa lowercase, trim khoảng trắng, kiểm tra định dạng CANONICAL_EMAIL_REGEX tương thích 100% Better Auth v1.1.x+ / Zod) |
| `email_verified` | `BOOLEAN` | `NOT NULL DEFAULT FALSE` | Trạng thái xác minh email; khởi tạo luôn là `false` tại A-01 |
| `phone_number` | `VARCHAR(32)` | `NULL` | Số điện thoại khách hàng (tùy chọn theo BR-02) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Thời điểm tạo tài khoản |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Thời điểm cập nhật hồ sơ gần nhất |

**Chỉ mục (Indexes)**:
- `users_pkey`: `PRIMARY KEY (id)`
- `users_email_unique`: `UNIQUE (email)` (Ràng buộc chống tạo trùng lặp email ở mức DB engine; mã lỗi `23505` khi bị tranh chấp)

---

### 2.2. Bảng `accounts` (Thông tin xác thực & Mật khẩu Better Auth — PL1)

Lưu trữ bằng chứng xác thực bảo mật (credentials) theo đúng quy ước của Better Auth (`better-auth ^1.1.0` với Drizzle adapter).

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Khóa chính của bản ghi xác thực |
| `user_id` | `UUID` | `NOT NULL, REFERENCES users(id) ON DELETE CASCADE` | Khóa ngoại trỏ về `users.id` |
| `account_id` | `VARCHAR(255)` | `NOT NULL` | Định danh tài khoản Better Auth: **Bắt buộc lưu `user.id`** đối với provider `'credential'` (PL1) |
| `provider_id` | `VARCHAR(32)` | `NOT NULL DEFAULT 'credential'` | Nhà cung cấp xác thực; cố định `'credential'` cho luồng email/mật khẩu |
| `password_hash` | `TEXT` | `NOT NULL` | Chuỗi băm Argon2id theo chuẩn PWD-007 định dạng MCF (`$argon2id$v=19$m=65536,t=3,p=1$...`). Better Auth ánh xạ qua trường `{ account: { fields: { password: "password_hash" } } }` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Thời điểm tạo thông tin xác thực |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Thời điểm cập nhật mật khẩu gần nhất |

**Chỉ mục (Indexes)**:
- `accounts_pkey`: `PRIMARY KEY (id)`
- `accounts_user_provider_idx`: `UNIQUE (user_id, provider_id)`

---

### 2.3. Bảng `user_role_assignments` (Phân quyền vai trò người dùng — PL4)

Lưu trữ vai trò được cấp phát. Tuân thủ nghiêm ngặt BR-01: Luồng đăng ký công khai A-01 **CHỈ CẤP DUY NHẤT** `role_code = 'CUSTOMER'`. Không tự ý đưa các vai trò vận hành (`STAFF`, `CINEMA_MANAGER`, `CHAIN_ADMIN`) thành ánh xạ đã duyệt khi chưa có quyết định phân rã vai trò vận hành chính thức.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Khóa chính của bản ghi phân quyền |
| `user_id` | `UUID` | `NOT NULL, REFERENCES users(id) ON DELETE CASCADE` | Khóa ngoại trỏ về `users.id` |
| `role_code` | `VARCHAR(32)` | `NOT NULL` | Mã vai trò; trong luồng đăng ký A-01 bắt buộc phải là `'CUSTOMER'` |
| `cinema_id` | `UUID` | `NULL` | Rạp quản lý; luôn luôn là `NULL` đối với vai trò `'CUSTOMER'` |
| `assigned_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Thời điểm phân quyền vai trò |

**Chỉ mục (Indexes)**:
- `user_role_assignments_pkey`: `PRIMARY KEY (id)`
- `user_role_assignments_user_role_idx`: `UNIQUE (user_id, role_code, cinema_id)`

---

### 2.4. Bảng `outbox_events` (Hàng đợi sự kiện giao dịch Identity — PL2, PL5)

Lưu trữ sự kiện phát sinh từ transaction đăng ký để Debezium CDC thu nhận qua WAL và phát vào Kafka KRaft topic `identity.customer-registered`.

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Khóa chính duy nhất của sự kiện (UUIDv7) |
| `aggregate_type` | `VARCHAR(64)` | `NOT NULL DEFAULT 'USER'` | Loại thực thể phát sinh sự kiện (`'USER'`) |
| `aggregate_id` | `UUID` | `NOT NULL` | Mã ID của thực thể (`users.id`) |
| `event_type` | `VARCHAR(64)` | `NOT NULL DEFAULT 'CUSTOMER_REGISTERED'` | Tên loại sự kiện (`'CUSTOMER_REGISTERED'`) |
| `payload` | `JSONB` | `NOT NULL` | Dữ liệu sự kiện dạng JSON (chuẩn hóa schema, có `eventVersion: 'v1'`) |
| `status` | `VARCHAR(16)` | `NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PUBLISHED', 'FAILED'))` | Trạng thái chuyển giao sự kiện |
| `retry_count` | `INTEGER` | `NOT NULL DEFAULT 0` | Số lần đã retry xử lý |
| `last_error` | `TEXT` | `NULL` | Thông tin lỗi gần nhất nếu có sự cố |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Thời điểm tạo sự kiện (cùng transaction với user) |
| `published_at` | `TIMESTAMPTZ` | `NULL` | Thời điểm sự kiện được ghi nhận chuyển giao |

**Cấu trúc JSON trong `payload` (Chuẩn hóa UUID không tiền tố — PL5)**:
```json
{
  "eventId": "01934abc-1234-7000-8000-0123456789ab",
  "eventType": "CUSTOMER_REGISTERED",
  "eventVersion": "v1",
  "timestamp": "2026-11-21T15:20:00.000Z",
  "data": {
    "userId": "01934abc-1234-7000-8000-0123456789ab",
    "email": "khachhang@example.com",
    "fullName": "Nguyễn Văn A",
    "phone": "0912345678",
    "emailVerified": false,
    "role": "CUSTOMER"
  }
}
```

---

## 3. Thực thể trong Cinema Core (PostgreSQL)

### 3.1. Bảng `loyalty_members` (Hồ sơ hội viên CineMember — PL4)

Sở hữu bởi module Hội viên của Cinema Core, khởi tạo tư cách hội viên tự động (BR-14). Sửa kiểu `points_balance` sang **`DECIMAL(10,2)`** để hỗ trợ số lẻ thập phân theo BR-28 / Q100 (PL4).

| Cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---|---|---|---|
| `id` | `UUID` | `PRIMARY KEY` | Khóa chính của bản ghi hội viên |
| `user_id` | `UUID` | `NOT NULL, UNIQUE` | Mã định danh khách hàng từ Identity Service (Unique Constraint) |
| `member_code` | `VARCHAR(32)` | `NOT NULL, UNIQUE` | Mã số thẻ hội viên CineMember (ví dụ: `CM202611210001`) |
| `current_tier` | `VARCHAR(32)` | `NOT NULL DEFAULT 'BASIC'` | Hạng hội viên khởi tạo (khớp BR-28: `'BASIC'`, hiển thị `'STANDARD'` trên UI) |
| `points_balance` | `DECIMAL(10,2)` | `NOT NULL DEFAULT 0.00` | Số điểm tích lũy khởi tạo (`0.00` điểm, hỗ trợ 2 số lẻ theo BR-28/Q100) |
| `total_spending_12m` | `DECIMAL(12,2)` | `NOT NULL DEFAULT 0.00` | Tổng chi tiêu 12 tháng gần nhất khởi tạo (`0.00` VNĐ) |
| `status` | `VARCHAR(16)` | `NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED'))` | Trạng thái kích hoạt hội viên |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Thời điểm khởi tạo hội viên |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Thời điểm cập nhật trạng thái gần nhất |

**Xử lý Idempotent khi nhận sự kiện từ Kafka topic `identity.customer-registered` (PL2)**:
```sql
INSERT INTO loyalty_members (
    id, user_id, member_code, current_tier, points_balance, total_spending_12m, status, created_at, updated_at
) VALUES (
    gen_random_uuid(), :userId, :generatedMemberCode, 'BASIC', 0.00, 0.00, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
)
ON CONFLICT (user_id) DO NOTHING;
```

---

## 4. Vòng đời trạng thái và Xử lý sự cố (State Lifecycle & Recovery)

### 4.1. Vòng đời Trạng thái Xác minh Email (Tài khoản người dùng)

```
[Khởi tạo đăng ký A-01]
          |
          v
+------------------------+
| email_verified = false | (Unauthenticated, không cấp session cookie, không được giữ ghế B-02 / mua vé B-05)
+------------------------+
          |
          | Bàn giao sang A-02: Nhập OTP hoặc click verification link hợp lệ
          v
+------------------------+
| email_verified = true  | (Đủ điều kiện giữ ghế B-02 và giao dịch thanh toán vé B-05)
+------------------------+
```

### 4.2. Vòng đời Sự kiện Outbox và Pipeline Phục hồi (PL2)

```
+------------------------------------+
| outbox_events.status = 'PENDING'   | (Ghi nguyên tử trong transaction PostgreSQL cùng user)
+------------------------------------+
                  |
                  | [Debezium CDC đọc WAL và xuất bản tin vào Kafka KRaft]
                  v
+------------------------------------+
| Kafka Topic:                       | (Partitioning theo key user_id)
| identity.customer-registered       |
+------------------------------------+
                  |
                  | [Consumer của Cinema Core fetch tin nhắn]
                  v
        +-------------------+--------------------+
        |                                        |
(Core commit DB thành công)               (Core DB lỗi kéo dài > 5 lần retry)
        |                                        |
        v                                        v
+------------------------------------+   +------------------------------------+
| Core commit offset lên Kafka       |   | Gửi tin nhắn vào DLQ Topic:        |
| loyalty_members được lưu bền vững  |   | identity.customer-registered.dlq   |
+------------------------------------+   | (Yêu cầu acks=all thành công)      |
                                         +------------------------------------+
                                                         |
                                         [Chỉ commit source offset sau khi DLQ ghi nhận thành công]
                                                         |
                                                         v
                                         +------------------------------------+
                                         | [Reconciliation Audit Job bù đắp]  |
                                         | Core gọi API internal Identity     |
                                         | bổ sung hội viên thiếu > 1 giờ     |
                                         +------------------------------------+
```

*Nguyên tắc xác nhận offset và phục hồi*:
1. **Commit Offset**: Consumer chỉ commit offset trên topic nguồn khi: (a) Database Cinema Core commit thành công bản ghi hội viên, HOẶC (b) Tin nhắn đã được gửi bền vững vào DLQ topic (`acks=all`).
2. **Nếu gửi DLQ thất bại**: Consumer dừng partition để ngăn chặn mất mát dữ liệu, kích hoạt cảnh báo khẩn cấp (Alert P1).
3. **Reconciliation Audit Job**: Cinema Core Background Service gọi `GET /api/v1/internal/users/reconciliation` do Identity Service cung cấp qua internal VPC, đối soát và tự động bù đắp hội viên thiếu > 1 giờ. Tuyệt đối không gọi SQL chéo.

### 4.3. Vòng đời Trạng thái Hội viên và Ranh giới Phụ thuộc với Use Case B-02 (PL2)

```
[A-01: Identity Service]
Tạo user, commit DB, ghi outbox event CUSTOMER_REGISTERED v1
           |
           v
  [Trạng thái 1: Identity-created] 
  (Thẩm quyền: Identity Service. Hồ sơ user sẵn sàng, chưa xác minh email)
           |
           | [Debezium CDC đẩy event lên topic identity.customer-registered]
           v
  [Trạng thái 2: membership-pending]
  (Thẩm quyền: Cinema Core. Event đang trên Kafka, Core chưa ghi loyalty_members)
           |
           +---------------------------------------------+
           |                                             |
           | (Consumer Core tiêu thụ bình thường)        | (Khách hàng xác minh email nhanh A-02
           v                                             |  và đặt vé B-02 khi Consumer bị trễ)
  [Trạng thái 3: membership-ready]                       v
  (Thẩm quyền: Cinema Core.                     [Use case B-02: Kiểm tra loyalty_members]
   loyalty_members đã ghi vào Core DB:          * Đề xuất phụ thuộc B-02 chờ Chủ sản phẩm duyệt:
   points_balance = 0.00, status = 'ACTIVE')      - Lựa chọn 1: Core gọi internal API GET /api/v1/internal/users/:id,
                                                    tự tạo loyalty_members trong transaction đặt vé.
                                                    Khi Kafka event tới sau -> ON CONFLICT DO NOTHING.
                                                  - Lựa chọn 2: Deferred Loyalty Accrual.
                                                  - Lựa chọn 3: Graceful Degraded Error.
```

- **Ranh giới thẩm quyền duy nhất**: Cinema Core là cơ quan duy nhất có thẩm quyền xác nhận và sở hữu dữ liệu `loyalty_members`. Việc khách hàng hoàn tất xác minh email tại A-02 không thay thế hay đại diện cho trạng thái hội viên tại Cinema Core.
- **Trạng thái Đề xuất B-02**: Cơ chế xử lý khi giữ ghế gặp `membership-pending` là đề xuất kiến trúc phụ thuộc đang chờ Chủ sản phẩm phê duyệt trong tài liệu thiết kế use case B-02, KHÔNG PHẢI quyết định hay năng lực mặc nhiên của A-01.
- **Xử lý An toàn Idempotent**: Trong mọi trường hợp (kể cả khi Core tự khởi tạo theo Lựa chọn 1 của B-02, hoặc khi Kafka consumer phát lại tin nhắn), câu lệnh `INSERT INTO loyalty_members ... ON CONFLICT (user_id) DO NOTHING` bảo đảm **100% không tạo trùng lặp bản ghi hội viên**.
