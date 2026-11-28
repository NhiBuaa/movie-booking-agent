# Phase 0 Research: A-01 — Đăng ký tài khoản khách hàng (Customer Registration)

**Feature**: `007-customer-registration`  
**Date**: 2026-11-21 (cập nhật hoàn thiện toàn diện theo review vòng 5 ngày 2026-11-22)  
**Status**: Completed  
**Authority**: Kế thừa [spec.md](spec.md) v0.3.2 (bảo toàn), [sources.md](sources.md) v0.3.2, [Constitution v2.0.1](../../../.specify/memory/constitution.md), [Chính sách mật khẩu v0.2.0](../../04-standards/password-policy.md), [ADR-0007](../../06-decisions/0007-transactional-outbox-debezium-kafka.md), [ADR-0008](../../06-decisions/0008-better-auth-with-direct-login.md), [ADR-0014](../../06-decisions/0014-zod-json-schema-and-pydantic-contracts.md), [ADR-0021](../../06-decisions/0021-layered-testing-stack-for-platform.md), và hai quyết định đã duyệt của Chủ sản phẩm (FR-007 Phương án B, FR-012 Phương án A).

---

## 1. Nghiên cứu Tích hợp Better Auth, Argon2id và ACID Transaction (PL1, PL4)

### Bối cảnh & Yêu cầu
ADR-0008 phê duyệt Better Auth cho xác thực email/mật khẩu với form trực tiếp trên Web và Mobile. Để bảo đảm an toàn dữ liệu, chống rò rỉ phiên và tuân thủ các quyết định đã duyệt:
1. **FR-012 Phương án A**: Không tự động cấp phiên đăng nhập (unauthenticated sau khi đăng ký, không cấp session cookie).
2. **Vô hiệu hóa Route mặc định**: Phải ngăn chặn hoàn toàn việc gọi vào route đăng ký mặc định của Better Auth để tránh tình trạng bỏ qua Application Validation, bỏ qua gán vai trò `CUSTOMER`, hoặc bỏ qua ghi nhận Transactional Outbox.
3. **Nguyên tử 4 bảng**: `users`, `accounts`, `user_role_assignments` (`role_code = 'CUSTOMER'`), và `outbox_events` phải được tạo nguyên tử trong **cùng một transaction PostgreSQL**. Tuyệt đối không dùng after-hook chạy sau commit để ghi outbox, vì nếu after-hook lỗi sẽ làm mất sự kiện đồng bộ hội viên.
4. **Tương thích xác thực A-03**: Định dạng lưu trữ và cơ chế băm mật khẩu phải bảo đảm tương thích 100% với hàm xác thực của luồng đăng nhập A-03.
5. **Thống nhất URL Endpoint**: Thống nhất duy nhất endpoint công khai của Identity Service là **`POST /api/v1/identity/register`**.

### Quyết định kỹ thuật
- **Phiên bản & Adapter Better Auth**:
  + Thư viện: `better-auth` phiên bản `^1.1.0` (tương thích Node.js 24 và Drizzle ORM).
  + Adapter: `drizzleAdapter(db, { provider: "pg", schema: { user: users, account: accounts } })`.
- **Mapping thực thể Better Auth với PostgreSQL Schema**:
  + Model `user` $\leftrightarrow$ Bảng `users`:
    * `id` $\rightarrow$ `users.id` (UUIDv7 canonical 36 ký tự).
    * `name` $\rightarrow$ `users.name` (VARCHAR(255)).
    * `email` $\rightarrow$ `users.email` (VARCHAR(255), lowercase/trimmed).
    * `emailVerified` $\rightarrow$ `users.email_verified` (BOOLEAN, mặc định `false`).
    * `phoneNumber` $\rightarrow$ `users.phone_number` (VARCHAR(32), NULL nếu không nhập theo BR-02).
    * `createdAt` $\rightarrow$ `users.created_at` (TIMESTAMPTZ).
    * `updatedAt` $\rightarrow$ `users.updated_at` (TIMESTAMPTZ).
  + Model `account` $\leftrightarrow$ Bảng `accounts`:
    * `id` $\rightarrow$ `accounts.id` (UUIDv7).
    * `userId` $\rightarrow$ `accounts.user_id` (UUIDv7, khóa ngoại trỏ về `users.id`).
    * `accountId` $\rightarrow$ `accounts.account_id` (VARCHAR(255)): Đối với credential provider, **bắt buộc lưu `user.id`** (stable user ID), không dùng email.
    * `providerId` $\rightarrow$ `accounts.provider_id` (VARCHAR(32), cố định `'credential'`).
    * `password` $\rightarrow$ `accounts.password_hash` (TEXT): Better Auth đọc/ghi chuỗi mật khẩu đã băm qua cột `password_hash` nhờ cấu hình ánh xạ trường `{ account: { fields: { password: "password_hash" } } }`.
    * `createdAt` $\rightarrow$ `accounts.created_at` (TIMESTAMPTZ).
    * `updatedAt` $\rightarrow$ `accounts.updated_at` (TIMESTAMPTZ).
- **Vô hiệu hóa Route mặc định & Cấu hình tùy biến Better Auth**:
  + Trong cấu hình `betterAuth`, đặt `emailAndPassword.disableSignUp: true` để vô hiệu hóa hoàn toàn route mặc định `POST /api/auth/sign-up/email`.
  + Tùy biến hàm băm và hàm xác thực mật khẩu thông qua tùy chọn `password`:
    ```ts
    // services/identity-service/src/infrastructure/auth/better-auth.ts
    import { betterAuth } from "better-auth";
    import { drizzleAdapter } from "better-auth/adapters/drizzle";
    import argon2 from "@node-rs/argon2";
    import { db, users, accounts } from "../db";

    export const auth = betterAuth({
      database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
          user: users,
          account: accounts,
        },
      }),
      account: {
        fields: {
          password: "password_hash", // Mapping model password sang cột password_hash
        },
      },
      emailAndPassword: {
        enabled: true,
        disableSignUp: true, // VÔ HIỆU HÓA route mặc định POST /api/auth/sign-up/email
        autoSignIn: false,   // FR-012 Phương án A: Không tự động tạo session
        password: {
          hash: async (password: string) => {
            // Chuẩn hóa Unicode NFC trước khi băm
            const normalized = password.normalize('NFC');
            return await argon2.hash(normalized, {
              memoryCost: 65536, // 64 MiB
              timeCost: 3,       // 3 iterations
              parallelism: 1,    // 1 lane
            });
          },
          verify: async ({ password, hash }: { password: string; hash: string }) => {
            // Chuẩn hóa Unicode NFC trước khi xác minh
            const normalized = password.normalize('NFC');
            return await argon2.verify(hash, normalized);
          },
        },
      },
    });
    ```
- **Ranh giới Endpoint Đăng ký Tùy biến (`POST /api/v1/identity/register`)**:
  + Mọi yêu cầu đăng ký khách hàng đều phải đi qua custom endpoint `POST /api/v1/identity/register` do Identity Service quản lý:
    1. *Wire Validation*: Kiểm tra tính toàn vẹn và giới hạn kích thước an toàn truyền tải mạng (fullName 1–100 ký tự, email thô 1–254 ký tự, password thô 1–1024 ký tự).
    2. *Application Normalization & Validation*: Chuẩn hóa email (trim, lowercase), kiểm tra định dạng email canonical (RFC 5322); trim họ tên (bắt lỗi nếu rỗng); chuẩn hóa NFC mật khẩu, kiểm tra độ dài 15–128 Unicode code points và kiểm tra blocklist PWD-004 bắt buộc (fail-secure).
    3. *Băm mật khẩu*: Gọi hàm băm Argon2id PWD-007 đã cấu hình ở trên.
    4. *Giao dịch nguyên tử 4 bảng (Atomic Transaction)*: Mở khối `db.transaction(async (tx) => { ... })` của Drizzle ORM:
       - Insert `users` với `id = genUUIDv7()`, `email_verified = false`.
       - Insert `accounts` với `user_id = user.id`, `provider_id = 'credential'`, `account_id = user.id`, `password_hash = hash`.
       - Insert `user_role_assignments` với `user_id = user.id`, `role_code = 'CUSTOMER'`, `cinema_id = NULL`.
       - Insert `outbox_events` với `aggregate_type = 'USER'`, `aggregate_id = user.id`, `event_type = 'CUSTOMER_REGISTERED'`, `status = 'PENDING'`, `payload` chứa event `CUSTOMER_REGISTERED` version `v1`.
    5. *Commit*: Commit transaction và trả về HTTP 200 `RegisterResponse` tiếp nhận trung tính, **hoàn toàn vắng mặt header `Set-Cookie`**.
- **Tương thích ngược 100% với luồng đăng nhập A-03**:
  + Chuỗi băm lưu trữ tuân thủ chuẩn Modular Crypt Format (MCF):  
    `$argon2id$v=19$m=65536,t=3,p=1$<salt-base64>$<hash-base64>`
  + Khi A-03 triển khai, hàm đăng nhập của Better Auth (`auth.api.signInEmail`) truy vấn bảng `accounts` theo `account_id = user.id` và `provider_id = 'credential'`, lấy `password_hash` và gọi hàm `password.verify({ hash, password })`. Dù người dùng gõ chuỗi dạng NFC hay NFD tương đương, cả hai đều được chuẩn hóa về cùng một chuỗi NFC trước khi verify, bảo đảm kết quả xác thực luôn chính xác.
  + Không so sánh hai chuỗi salted hash để kiểm tra tương thích, vì mỗi lần băm đều sinh ra một salt ngẫu nhiên 16 bytes mới.

---

## 2. Nghiên cứu Pipeline Outbox, DLQ, Reconciliation và Ranh giới B-02 (PL2)

### Bối cảnh & Yêu cầu
ADR-0007 phê duyệt kiến trúc luồng sự kiện phân tán: **Transactional Outbox → Debezium / Kafka Connect → Apache Kafka KRaft → Cinema Core Consumer**. Cần phân định rõ các mốc xử lý sự kiện, mô hình trạng thái xử lý lỗi, điều kiện commit source offset, cơ chế Dead Letter Queue (DLQ), hợp đồng Reconciliation Audit Job, đồng thời làm rõ ranh giới thẩm quyền dữ liệu với use case B-02 (Đặt vé).

### Quyết định kỹ thuật
- **Bỏ lập luận coi xác minh email là bảo đảm hội viên đã sẵn sàng**:
  + *Phân tích rủi ro thực tế*: Khách hàng có thể bấm liên kết xác minh email trong A-02 rất nhanh (trong vài giây), trong khi Kafka consumer ở Cinema Core có thể gặp sự cố tạm thời, restart, hoặc hàng đợi bị nghẽn (consumer lag) kéo dài hàng chục phút. Reconciliation Audit Job chỉ quét các tài khoản thiếu sau 1 giờ. Do đó, việc hoàn tất xác minh email A-02 **không phải là bằng chứng hay bảo đảm kỹ thuật rằng bản ghi hội viên đã được đồng bộ vào Cinema Core**.
- **Phân định 3 trạng thái của tài khoản và thẩm quyền**:
  1. *`Identity-created`*: Tài khoản đã được tạo và lưu trữ thành công trong Identity Service, outbox event đã được ghi nhận trong `outbox_events`. Thẩm quyền duy nhất: **Identity Service**.
  2. *`membership-pending`*: Sự kiện `CUSTOMER_REGISTERED` version `v1` đã được phát hành lên Kafka topic `identity.customer-registered`, nhưng Consumer của Cinema Core chưa kịp tiêu thụ hoặc đang trong quá trình xử lý/retry. Bản ghi hội viên chưa có trong cơ sở dữ liệu của Core. Thẩm quyền: **Cinema Core**.
  3. *`membership-ready`*: Consumer của Cinema Core đã tiêu thụ thành công sự kiện và ghi nhận bản ghi hội viên vào bảng `loyalty_members` (`points_balance = 0.00`, `status = 'ACTIVE'`). Thẩm quyền duy nhất: **Cinema Core**.
  + **Nguyên tắc thẩm quyền cốt lõi**: Theo Constitution Nguyên tắc I và `AGENTS.md`, **Cinema Core là Single Source of Truth duy nhất** đối với hồ sơ hội viên (`loyalty_members`), điểm thưởng tích lũy và trạng thái hội viên. Identity Service không có thẩm quyền hay trách nhiệm quản lý dữ liệu hội viên.
- **Ranh giới đề xuất phụ thuộc với Use Case B-02 (Đặt vé - Booking)**:
  + Khi khách hàng tiến hành giữ ghế hoặc đặt vé tại use case B-02, Cinema Core truy vấn bảng `loyalty_members WHERE user_id = :userId`:
    - *Trường hợp 1 (Đã `membership-ready`)*: Cinema Core áp dụng chính sách tích lũy điểm và quyền lợi hội viên CineMember bình thường.
    - *Trường hợp 2 (Đang `membership-pending` — chưa có bản ghi trong Core DB)*:
      * Ranh giới bất biến: **TUYỆT ĐỐI KHÔNG gọi SQL chéo** hoặc sử dụng 2PC distributed transaction giữa Core và Identity.
      * *Lựa chọn 1 (Đề xuất kiến trúc phụ thuộc chờ phê duyệt tại B-02)* — **On-demand Core Provisioning qua Internal API**: Cinema Core gọi REST API nội bộ do Identity Service cung cấp: `GET /api/v1/internal/users/:id` (xác thực qua VPC mTLS hoặc internal service token) để xác nhận tài khoản tồn tại và đã xác minh email. Nếu hợp lệ, Cinema Core tự động khởi tạo bản ghi `loyalty_members (user_id, member_code, current_tier='BASIC', points_balance=0.00, status='ACTIVE')` ngay trong transaction đặt vé của Core. Sau này, khi Kafka consumer xử lý sự kiện, câu lệnh `ON CONFLICT (user_id) DO NOTHING` sẽ an toàn bỏ qua mà không làm trùng lặp dữ liệu hay sinh lỗi.
      * *Lựa chọn 2* — **Non-blocking Deferred Loyalty Accrual**: Cinema Core cho phép giao dịch đặt vé tiếp tục thành công mà không trừ/tích điểm tức thì, gắn cờ `pending_loyalty_accrual` trên vé và tự động tính bù điểm sau khi Kafka consumer xử lý xong sự kiện.
      * *Lựa chọn 3* — **Graceful Degraded Error**: Cinema Core từ chối áp dụng quyền lợi hội viên và trả về mã lỗi tạm thời `LOYALTY_MEMBER_NOT_READY` kèm header `Retry-After: 5`.
      * **Trạng thái phê duyệt**: Đây là **đề xuất phụ thuộc kiến trúc đang chờ Chủ sản phẩm phê duyệt trong tài liệu thiết kế use case B-02**, **KHÔNG PHẢI quyết định hay năng lực mặc nhiên đã duyệt của A-01**.
      * *Phần A-01 cung cấp sẵn sàng*: (a) Internal API `GET /api/v1/internal/users/:id`, (b) Payload sự kiện đầy đủ, và (c) Consumer Core xử lý idempotent với `ON CONFLICT (user_id) DO NOTHING`.
- **Kịch bản A-02 hoàn tất nhưng Consumer Core bị trễ, sau đó Core phục hồi**:
  + Khi Cinema Core phục hồi kết nối hoặc consumer bắt kịp offset trên Kafka:
    ```sql
    INSERT INTO loyalty_members (id, user_id, member_code, current_tier, points_balance, status, created_at, updated_at)
    VALUES (gen_random_uuid(), $1, $2, 'BASIC', 0.00, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id) DO NOTHING;
    ```
  + Nếu bản ghi đã được tạo trước đó qua On-demand Core Provisioning hoặc do Kafka replay, câu lệnh SQL trên tự động bỏ qua an toàn, bảo đảm **100% không tạo trùng lặp bản ghi hội viên**.
- **Mô hình 5 Trạng thái Vòng đời Tin nhắn và Xử lý Lỗi Outbox**:
  1. *State 1: Core Commit Success (Xử lý thành công)*:
     - Consumer của Cinema Core fetch tin nhắn từ topic `identity.customer-registered`.
     - Thực thi insert vào `loyalty_members` với `ON CONFLICT (user_id) DO NOTHING`.
     - Sau khi database của Cinema Core commit thành công $\rightarrow$ Consumer thực thi **commit source offset đồng bộ lên Kafka (`commitSync`)**.
  2. *State 2: Transient Processing Error (Lỗi tạm thời)*:
     - Sự cố mạng hoặc database Cinema Core bị khóa/timeout tạm thời.
     - Consumer **KHÔNG commit source offset**.
     - Thực hiện retry cục bộ với exponential backoff (tối đa 5 lần thử lại). Tin nhắn vẫn giữ nguyên trạng thái uncommitted trên partition của Kafka topic gốc.
  3. *State 3: Retry Exhausted -> Publish DLQ (Hết số lần retry)*:
     - Sau 5 lần retry thất bại liên tiếp: Consumer đóng gói tin nhắn lỗi kèm metadata (topic gốc, partition, offset, mã lỗi, stack trace, thời điểm lỗi) và xuất bản vào topic Dead Letter Queue: `identity.customer-registered.dlq` với cấu hình ghi bền vững **`acks=all`**.
     - **ĐIỀU KIỆN TIÊN QUYẾT XÁC NHẬN OFFSET (Source Offset Commit Condition)**: Consumer **CHỈ ĐƯỢC PHÉP commit source offset** trên topic gốc sau khi broker của DLQ topic phản hồi xác nhận ghi tin nhắn DLQ thành công (`acks=all` đạt).
     - *Xử lý khi ghi DLQ thất bại*: Nếu việc gửi tin nhắn vào DLQ topic bị lỗi, consumer **TUYỆT ĐỐI KHÔNG commit source offset**, ngay lập tức dừng xử lý partition tương ứng (halt partition) để bảo đảm zero data loss, đồng thời kích hoạt cảnh báo khẩn cấp (Alert P1) tới đội ngũ vận hành.
     - *Xử lý sự cố Crash sau DLQ Ack trước Source Offset Commit*: Nếu consumer bị sập nguồn/crash ngay sau khi DLQ broker đã xác nhận nhưng trước khi kịp commit source offset: Khi khởi động lại, consumer đọc lại tin nhắn đó từ Kafka topic gốc. Consumer gửi lại vào DLQ; nhờ DLQ topic sử dụng message key là `eventId` (UUID canonical), consumer đầu cuối của DLQ xử lý deduplication an toàn, sau đó consumer commit source offset bình thường.
  4. *State 4: Replay (Phát lại tin nhắn an toàn)*:
     - Vận hành có thể replay lại tin nhắn từ DLQ hoặc tua lại offset của topic gốc.
     - Nhờ câu lệnh `ON CONFLICT (user_id) DO NOTHING`, mọi tin nhắn được xử lý lại đều bảo đảm tính idempotent, không làm trùng lặp bản ghi hội viên.
  5. *State 5: Reconciliation Audit Job (Cơ chế đối soát và bù đắp định kỳ)*:
     - *Chủ sở hữu*: Cinema Core Background Service.
     - *Hợp đồng giao diện do Identity Service cung cấp*: `GET /api/v1/internal/users/reconciliation` (chỉ truy cập trong mạng nội bộ VPC, yêu cầu mTLS hoặc internal service token).
     - *Giao thức phân trang cursor*: `?limit=100&cursor=<last_user_id>&created_before=<timestamp_1_hour_ago>`.
     - *Xử lý bù đắp*: Cinema Core Background Service định kỳ (ví dụ mỗi giờ một lần) gọi API này, đối soát danh sách `users` từ Identity với bảng `loyalty_members` cục bộ của Core. Đối với bất kỳ tài khoản `CUSTOMER` nào đã tạo quá 1 giờ mà chưa có bản ghi hội viên trong Core, Core tự động chèn bản ghi hội viên với `points_balance = 0.00` và `current_tier = 'BASIC'`.
     - *Ranh giới bất biến*: **TUYỆT ĐỐI KHÔNG gọi SQL chéo** hoặc liên kết cơ sở dữ liệu phân tán giữa Core và Identity!

---

## 3. Nghiên cứu Xử lý Cạnh tranh, Anti-enumeration và Đơn giản hóa Retry (PL3)

### Bối cảnh & Yêu cầu
Bảo đảm tính toàn vẹn khi có 2 yêu cầu đăng ký cùng email gửi đồng thời, chống rò rỉ tài khoản qua phân tích thời gian (Timing Attack), và đơn giản hóa cơ chế retry mà không làm phức tạp hóa hệ thống.

### Quyết định kỹ thuật
- **Thứ tự thực thi luồng đăng ký (Execution Sequence)**:
  1. *Wire Schema Validation*: Kiểm tra tính hợp lệ cấu trúc thô (fullName 1–100 ký tự, email thô 1–254 ký tự, password thô max 1024 ký tự chống DoS).
  2. *Email Normalization*: Chuẩn hóa email bằng `email.trim().toLowerCase()` và kiểm tra định dạng email canonical (RFC 5322). Cho phép email thô có khoảng trắng ngoài rìa được chuẩn hóa hợp lệ theo spec US2 Scenario 2.
  3. *PWD-004 Blocklist Check*: Chuẩn hóa NFC mật khẩu và đối khớp với bộ dữ liệu blocklist trong RAM. Nếu vi phạm $\rightarrow$ trả về HTTP 400 `PASSWORD_IN_BLOCKLIST`.
  4. *Query DB*: Tìm kiếm người dùng theo email đã chuẩn hóa trong `users`.
  5. *Nhánh Email Đã Tồn Tại (Phương án B)*:
     - Thực thi một hàm băm giả định (Dummy Argon2id hash) với chuỗi cố định để tiêu hao chu kỳ CPU tương đương nhánh mới.
     - Trả về HTTP 200 `RegisterResponse` với thông điệp tiếp nhận trung tính.
  6. *Nhánh Email Chưa Tồn Tại*:
     - Thực thi hàm băm Argon2id thật trên mật khẩu của người dùng.
     - Mở transaction PostgreSQL: Insert `users`, `accounts`, `user_role_assignments`, `outbox_events`.
     - Commit transaction $\rightarrow$ Trả về HTTP 200 `RegisterResponse`.
- **Xử lý Cạnh tranh Hai Yêu Cầu Đồng Thời Cùng Email (Race Condition)**:
  + Trường hợp 2 request cùng gửi một địa chỉ email (dù khác chữ hoa/thường hay có khoảng trắng thừa, đều được chuẩn hóa giống hệt nhau ở bước 2).
  + Nếu cả 2 request cùng vượt qua bước 4 (thấy email chưa tồn tại) và cùng mở transaction insert vào `users`:
    - Request thứ nhất commit thành công.
    - Request thứ hai kích hoạt lỗi vi phạm ràng buộc duy nhất của PostgreSQL: **Unique Constraint Violation trên chỉ mục `users_email_unique` (Mã lỗi PostgreSQL `23505`)**.
    - *Giải pháp an toàn*: Identity Service bắt mã lỗi `23505`, tự động rollback transaction của request thứ hai, và **trả về HTTP 200 `RegisterResponse` tiếp nhận trung tính**, tuyệt đối KHÔNG trả về HTTP 500 hay để lộ lỗi phân biệt!
- **Tiêu chí và Phương pháp Đo lường Cân bằng Thời gian (Timing Equalization)**:
  + Dummy hash là giải pháp giảm chênh lệch CPU giữa 2 nhánh. Không tự suy diễn thời gian cố định 200–400ms khi chưa đo thực tế.
  + *Kế hoạch đo lường trên Staging*: Sử dụng k6 gửi $N=1000$ requests cho mỗi nhánh (nhánh email mới vs nhánh email trùng). Sử dụng kiểm định thống kê (Welch's t-test hoặc Kolmogorov-Smirnov test) để xác nhận phân bố thời gian phản hồi giữa 2 nhánh không có sự khác biệt có ý nghĩa thống kê vượt quá $15\%$ ở phân vị p50 và p95.
- **Đơn giản hóa Cơ chế Retry (Loại bỏ Idempotency-Key phức tạp)**:
  + Nhánh xử lý email trùng lặp tự nhiên theo Phương án B (Anti-enumeration) đã xử lý an toàn 100% tình huống retry.
  + Nếu client bị mất phản hồi mạng ở bước post-commit và gửi lại form với cùng email: Máy chủ nhận email, kiểm tra thấy đã có trong `users`, chạy dummy hash và trả về HTTP 200 tiếp nhận trung tính; dữ liệu cũ được bảo toàn, không tạo tài khoản lặp, không tạo outbox event lặp.
  + *Quyết định*: **Bỏ cơ chế Idempotency-Key và cache Redis phức tạp** trong luồng đăng ký A-01.

---

## 4. Nghiên cứu Mô hình Dữ liệu và Điểm tích lũy (PL4)

### Bối cảnh & Yêu cầu
Khắc phục các điểm sai lệch so với nguồn nghiệp vụ: số lẻ của điểm tích lũy theo BR-28/Q100, hòa giải vai trò vận hành, và chuẩn hóa định dạng ID.

### Quyết định kỹ thuật
- **Sửa kiểu dữ liệu `points_balance`**:
  + Theo quy định tại BR-28 và quyết định Q100, điểm tích lũy có thể chứa phần thập phân (ví dụ: $9.50$ điểm khi giao dịch lẻ).
  + Sửa kiểu cột từ `INTEGER` sang **`DECIMAL(10,2)`** (hoặc `NUMERIC(10,2)`) trong bảng `loyalty_members` của Cinema Core, khởi tạo giá trị mặc định là `0.00`.
- **Hòa giải Enum Vai trò người dùng**:
  + Tuân thủ nguyên tắc ranh giới của Constitution và `AGENTS.md`: Luồng đăng ký công khai A-01 **CHỈ CẤP DUY NHẤT** vai trò `CUSTOMER` (BR-01).
  + Không tự ý đưa các vai trò vận hành (`STAFF`, `CINEMA_MANAGER`, `CHAIN_ADMIN`) thành ánh xạ đã duyệt trong schema DB của A-01 khi dự án chưa có quyết định phân rã vai trò vận hành chính thức.
  + Bảng `user_role_assignments`: Cột `role_code VARCHAR(32) NOT NULL`. Trong phạm vi A-01, mã nguồn backend áp dụng kiểm tra nghiêm ngặt `assert(roleCode === 'CUSTOMER')`.
- **Thống nhất Định dạng ID**:
  + Toàn bộ các bảng sử dụng kiểu dữ liệu **`UUID`** chuẩn trong PostgreSQL (hoặc chuỗi canonical 36 ký tự `8-4-4-4-12` tuân theo chuẩn UUIDv7 để tối ưu chỉ mục B-tree theo thời gian).
  + Loại bỏ tiền tố (`usr_`, `ura_`, `evt_`) trong tầng persistence cơ sở dữ liệu để đồng nhất 100% giữa schema và contracts.
- **Ranh giới DB Draft**:
  + Tài liệu DB draft tại `docs/05-specs/005-data-design/` được coi là tài liệu tham chiếu cấu trúc logic, không phải quyết định schema triển khai vật lý đã được phê duyệt toàn bộ.

---

## 5. Ranh giới Wire Schema, Chuẩn hóa NFC và Native Zod 4 JSON Schema (PL5 & ADR-0014)

### Bối cảnh & Yêu cầu
Khắc phục lỗi lệch ngữ nghĩa giữa TypeScript (Zod) và Python (Pydantic v2) khi xuất JSON Schema theo ADR-0014:
1. Loại bỏ hoàn toàn thư viện bên ngoài `zod-to-json-schema`, thay thế bằng **native `z.toJSONSchema()` của Zod 4**.
2. Phân định ranh giới tuyệt đối giữa Wire Validation thuần túy cấu trúc với Application Normalization & Canonical Domain Validation.
3. Khắc phục lỗi hồi quy email có khoảng trắng thô (US2 Scenario 2) không bị chặn ở Wire Schema.

### Quyết định kỹ thuật
- **Phân định rõ 2 tầng Validation & Normalization**:
  1. *Tầng Wire Validation (Transport / Wire Schema)*:
     - Thể hiện qua `CustomerRegisterRequestSchema` (Zod trong TypeScript, tương ứng model Pydantic v2 trong Python).
     - **Tuyệt đối không chứa transformations (`.trim()`, `.toLowerCase()`) và không gọi `.email()` tại Wire Schema**:
       * `fullName`: `string`, độ dài ký tự thô `min: 1`, `max: 100`. (Nếu gửi `"   "`, wire schema chấp nhận vì độ dài là 3; việc kiểm tra rỗng sau trim thuộc về tầng Application).
       * `email`: `string`, độ dài ký tự thô `min: 1`, `max: 254`. (Chấp nhận chuỗi thô có khoảng trắng ngoài rìa như `"  Test.User@Example.COM  "` theo spec US2 Scenario 2).
       * `password`: `string`, độ dài ký tự thô `min: 1`, `max: 1024` (giới hạn an toàn chống DoS/memory flood). Không ép min 15 hay max 128 ở tầng wire để tránh loại bỏ chuỗi NFD hợp lệ sau NFC.
       * `phone`: `string`, regex `VIETNAMESE_PHONE_REGEX` (`^(0|\+84)[35789][0-9]{8}$`), `optional` hoặc rỗng `""`.
     - Cú pháp error message tuân thủ Zod 4: Sử dụng tham số `{ error: '...' }` (bỏ hoàn toàn `required_error` của Zod 3).
  2. *Tầng Application Normalization & Canonical Validation (Application Layer)*:
     - Thực thi độc lập và nhất quán tại Controller/Service Layer của Identity Service (và tương tự tại Python Agent service khi nhận request):
       * `fullName`: Thực thi `const trimmedName = raw.fullName.trim();`. Sau khi trim, kiểm tra `trimmedName.length >= 1`. Nếu bằng 0 $\rightarrow$ Trả về lỗi `FULL_NAME_REQUIRED`.
       * `email`: Thực thi `const normalizedEmail = raw.email.trim().toLowerCase();`. Kiểm tra `CANONICAL_EMAIL_REGEX.test(normalizedEmail)` và độ dài $\le 254$. Regex được hòa giải chuẩn xác với Validator email mặc định của Better Auth (v1.1.x+) và Zod standard email validator (`/^(?!\.)(?!.*\.\.)([A-Za-z0-9_\'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/i`). Profile này loại bỏ triệt để các địa chỉ có dấu chấm ở đầu/cuối/liên tiếp (`.alice@`, `alice..bob@`, `alice.@`), đồng thời từ chối các ký tự đặc biệt RFC 5322 hiếm dùng bị Better Auth từ chối như `!` (`a!b@example.com`) và tên miền có TLD 1 ký tự (`a@example.c`). Nhờ đó, bảo đảm 100% email được A-01 tiếp nhận đều hợp lệ và đi qua an toàn luồng đăng nhập dự kiến của A-03 qua Better Auth. Nếu sai định dạng $\rightarrow$ Trả về lỗi `INVALID_EMAIL_FORMAT`. Nhánh đăng ký mới và nhánh xử lý email trùng lặp đều dùng chung quy tắc chuẩn hóa và kiểm tra này.
       * `phone`: Nếu `raw.phone` vắng mặt hoặc sau trim là chuỗi rỗng `""` $\rightarrow$ gán `undefined`. Nếu có giá trị $\rightarrow$ kiểm tra regex chuẩn.
       * `password`:
         - Thực thi `const normalizedPassword = raw.password.normalize('NFC');` (giữ nguyên khoảng trắng theo PWD-002).
         - Đếm số lượng Unicode code points sau NFC bằng `const len = Array.from(normalizedPassword).length;`.
         - Kiểm tra ràng buộc chính sách PWD-001: $15 \le \text{len} \le 128$. Nếu vi phạm $\rightarrow$ Trả về lỗi `PWD_LENGTH_INVALID`.
         - Kiểm tra danh sách mật khẩu phổ biến PWD-004 (fail-secure): Gọi `isBlocked(normalizedPassword.toLowerCase())`. Nếu vi phạm $\rightarrow$ Trả về lỗi `PASSWORD_IN_BLOCKLIST`.
- **Profile Xuất JSON Schema & Code Generation (ADR-0014)**:
  + Phương thức: Native **`z.toJSONSchema()` của Zod 4**.
  + Dialect mục tiêu duy nhất: **JSON Schema Draft-07** (`target: 'draft-07'`).
  + Hướng schema: **Input Schema** (`io: 'input'`).
  + Mã xuất mẫu:
    ```ts
    import { z } from 'zod';
    import { CustomerRegisterRequestSchema } from './auth-registration.contract';

    export const customerRegisterJsonSchema = z.toJSONSchema(CustomerRegisterRequestSchema, {
      target: 'draft-07',
      io: 'input',
    });
    ```
  + Sinh mã Pydantic v2: Chạy công cụ `datamodel-code-generator --input-file-type jsonschema --output-model-type pydantic_v2.BaseModel`.
  + Ghi chú minh bạch: Dependencies Zod 4 và datamodel-codegen chưa được cài đặt trong worktree tài liệu, các thiết kế trên là hợp đồng kỹ thuật cho giai đoạn implementation.
- **Bộ Ma trận Fixture Kiểm thử Đối chiếu Chung giữa TypeScript và Python**:
  | Ca kiểm thử | Dữ liệu đầu vào thô | Kết quả Wire Schema (TS Zod & Python Pydantic) | Kết quả Application Layer |
  |---|---|---|---|
  | **Tên chỉ có khoảng trắng** | `fullName: "   "` | **PASS** (chuỗi 3 ký tự $\ge 1$) | **FAIL** `FULL_NAME_REQUIRED` (sau trim độ dài 0) |
  | **Email có khoảng trắng & chữ hoa** | `email: "  Test.User@Example.COM  "` | **PASS** (chuỗi 25 ký tự $\le 254$) | **PASS** chuẩn hóa về `"test.user@example.com"` |
  | **Số điện thoại rỗng** | `phone: ""` | **PASS** (literal `""`) | Chuyển thành `undefined` / `None` (hợp lệ) |
  | **Unicode NFD dài 256 code units** | `password: ("e\u0301").repeat(128)` | **PASS** (256 code units $\le 1024$) | **PASS** (sau NFC là 128 code points `é` hợp lệ) |
  | **Mật khẩu 14 ký tự** | `password: "Pass#Word12345"` | **PASS** (14 code units $\le 1024$) | **FAIL** `PWD_LENGTH_INVALID` (14 < 15) |
  | **Mật khẩu thuộc blocklist** | `password: "123456789123456789"` | **PASS** (18 code units $\le 1024$) | **FAIL** `PASSWORD_IN_BLOCKLIST` |
- **Loại bỏ Alias Xung đột DTO (Hòa giải với `packages/contracts`)**:
  + Trong `contracts/auth-registration.contract.ts`, loại bỏ hoàn toàn alias `RegisterRequest`.
  + DTO và schema mới được đặt tên chuẩn hóa là **`CustomerRegisterRequest`** và **`CustomerRegisterRequestSchema`**.

---

## 6. Nghiên cứu Chi tiết Dataset PWD-004 và Cấu hình PWD-007 (PL6)

### Bối cảnh & Yêu cầu
Chốt thư viện, tham số Argon2id, ghim chính xác nguồn dataset blocklist có thật trên GitHub kèm giấy phép tại đúng snapshot, tính toán SHA-256 trực tiếp từ bytes thực tế, nguyên tắc fail-secure và kế hoạch đo lường tài nguyên.

### Quyết định kỹ thuật
- **Chốt Cấu hình Argon2id (PWD-007)**:
  + **Thư viện**: `@node-rs/argon2` (Rust-based native binding cho Node.js, hiệu năng cao, hỗ trợ đa nền tảng).
  + **Cấu hình duy nhất**:
    * Thuật toán: Argon2id (variant `id`, version `0x13` / `19`).
    * `memoryCost`: $65536\text{ KiB}$ ($64\text{ MiB}$).
    * `timeCost`: $3$ iterations.
    * `parallelism`: $1$ thread/lane.
    * `saltLength`: $16\text{ bytes}$ ngẫu nhiên từ `crypto.randomBytes(16)`.
    * `outputLength`: $32\text{ bytes}$.
  + Ghi chú rõ ràng: Mức $64\text{ MiB}$ là cấu hình tiêu chuẩn theo khuyến nghị OWASP. Mức $19\text{ MiB}$ chỉ là giới hạn lý thuyết tối thiểu trong tài liệu nghiên cứu, **không áp dụng cho môi trường chạy của hệ thống**.
- **Dataset Blocklist PWD-004 (Đã kiểm chứng và ghim chính xác)**:
  + **Tên tệp chính thức trong repository SecLists**: `10-million-password-list-top-100000.txt`  
    (Đường dẫn trong repo: `Passwords/Common-Credentials/10-million-password-list-top-100000.txt`).
  + **Repository**: [danielmiessler/SecLists](https://github.com/danielmiessler/SecLists).
  + **Git Commit Snapshot bất biến**: `45499242ec0164c7f91cbcf8bd509404fc0b99f3` (tương ứng release tag `2024.4` chính thức ngày 2024-11-20).
  + **URL tải trực tiếp bất biến**:  
    `https://raw.githubusercontent.com/danielmiessler/SecLists/45499242ec0164c7f91cbcf8bd509404fc0b99f3/Passwords/Common-Credentials/10-million-password-list-top-100000.txt`
  + **Giấy phép tại snapshot**: MIT License (Copyright (c) 2018 Daniel Miessler, xác thực tại tệp `LICENSE` commit `45499242ec0164c7f91cbcf8bd509404fc0b99f3/LICENSE`).
  + **Mã băm SHA-256 tính trực tiếp từ bytes của snapshot**:  
    `E30E15FAECC8DB2D3181C3126E3B2C0CD5C187AF10A5E4E83BABFA157EDAB188`
  + **Tổng số dòng thực tế**: `100007` dòng.
  + **Fixture kiểm thử xác thực có thật trong dataset**:
    * Mật khẩu có độ dài $\ge 15$ ký tự thuộc dataset: `123456789123456789` (nằm tại dòng `12960`, độ dài 18 ký tự) hoặc `qwerty123456789` (nằm tại dòng `31833`, độ dài 15 ký tự).
    * Loại bỏ hoàn toàn khẳng định sai về `password123456789 tại dòng 42` (chuỗi này không có trong tệp).
- **Tệp Bổ sung Nội bộ (Internal Supplementary Dataset) & Manifest Tái tạo**:
  + **Đường dẫn**: `services/identity-service/data/vietnamese-common-passwords.txt`.
  + **Quy chuẩn Manifest & Cách tái tạo**:
    * Định dạng tệp: UTF-8 plain text, không BOM, phân tách dòng bằng ký tự xuống dòng tiêu chuẩn LF (`\n`).
    * Mỗi dòng chứa duy nhất một mật khẩu phổ biến tiếng Việt đã được chuẩn hóa Unicode NFC, chuyển toàn bộ về chữ thường (lowercase) và loại bỏ khoảng trắng thừa đầu/cuối.
    * Không chứa dòng trống hoặc dòng chú thích.
    * Danh sách fixture mẫu trong manifest nội bộ gồm:
      - `matkhau123456789` (16 ký tự code points: "matkhau" 7 + "123456789" 9 = 16)
      - `khongbiet123456` (15 ký tự)
      - `anhyeuem12345678` (16 ký tự)
      - `ngaythangnamsinh` (16 ký tự)
      - `cinemavietnam2026` (17 ký tự)
  + **Quy trình nạp dataset và phép đối sánh nhất quán**:
    * Khi khởi động, module `blocklist-loader.ts` nạp tuần tự cả hai tệp:
      1. Đọc nội dung tệp bằng UTF-8.
      2. Tách từng dòng theo `\r?\n`.
      3. Chuẩn hóa: `const normalized = line.trim().normalize('NFC').toLowerCase()`.
      4. Đưa vào cấu trúc dữ liệu `Set<string>` trong bộ nhớ RAM (`O(1)` tra cứu).
    * Phép đối sánh trong `validateCustomerPasswordServer`: Mật khẩu người dùng nhập vào được chuẩn hóa `password.normalize('NFC').toLowerCase()`, sau đó kiểm tra `blocklistSet.has(normalizedLower)`.
- **Nguyên tắc Bất biến Fail-Secure**:
  + Module `blocklist-loader.ts` tính toán mã băm SHA-256 của tệp SecLists khi khởi động và so khớp với giá trị ghim sẵn `E30E15FAECC8DB2D3181C3126E3B2C0CD5C187AF10A5E4E83BABFA157EDAB188`.
  + Nếu tệp bị thiếu, không đọc được hoặc mã băm không khớp: Tiến trình Identity Service **ghi log mức FATAL và dừng tiến trình ngay lập tức (`process.exit(1)`)**.
  + Nếu xảy ra lỗi đọc trong runtime, endpoint đăng ký lập tức trả về HTTP 503 `SERVICE_UNAVAILABLE`. Tuyệt đối không cho phép tiếp nhận đăng ký khi thiếu hoặc sai lệch dữ liệu blocklist.
- **Kế hoạch Đo lường RAM và p95**:
  + Thiết kế phép đo benchmark tải trong giai đoạn staging bằng k6 OSS: Đo mức tiêu thụ RAM trên tiến trình Identity khi xử lý đồng thời $10, 20, 50$ yêu cầu đăng ký (mỗi thread băm tốn 64 MiB trong ~250ms).
  + Ghi rõ: **Chưa chạy benchmark trong đợt tài liệu này**.

---

## 7. Ranh giới Rate Limiting, Atomic Redis và Xác thực IP Chuyển tiếp (PL7)

### Bối cảnh & Yêu cầu
Loại bỏ hoàn toàn các lỗi lặp lại và hồi quy:
1. Đóng khoảng lỗi giữa `INCR` và `EXPIRE` bằng Redis Lua script nguyên tử, xóa bỏ nguy cơ tạo key vĩnh viễn gây rò rỉ bộ nhớ.
2. Thiết kế mô hình xác thực IP chuyển tiếp chặt chẽ: Phân biệt rõ TCP peer socket trực tiếp (`request.raw.socket.remoteAddress`) với `request.ip` của Fastify và `X-Original-Client-IP` của BFF; kiểm tra CIDR toán học chuẩn (loại bỏ `startsWith`), bảo mật timing-safe secret (ngăn `undefined === undefined`), kiểm tra tính đơn trị và định dạng IP hợp lệ.
3. Làm rõ hai luồng Web/BFF và Mobile/Edge, ma trận xử lý các trường hợp và cơ chế degraded local fallback.

### Quyết định kỹ thuật
- **Thuật toán Quota Duy nhất & Thao tác Redis Nguyên tử (Atomic Fixed Window Counter with Lua Script)**:
  + Cửa sổ quota cố định: 15 phút (900 giây).
  + Tính toán window timestamp: `window_timestamp = Math.floor(Date.now() / 900000)`.
  + Khóa Redis:
    * Theo IP: `ratelimit:register:ip:<client_ip>:<window_timestamp>`
    * Theo Email: `ratelimit:register:email:<normalized_email>:<window_timestamp>`
  + **Thao tác Redis Nguyên tử bằng Lua Script**:
    * Trong mô hình cũ, việc gọi riêng rẽ `INCR <key>` rồi mới gọi `EXPIRE <key> 900` tạo ra khoảng lỗi nguy hiểm (failure window): Nếu tiến trình crash, gặp lỗi OOM hoặc đứt mạng giữa 2 lệnh, key sẽ không có TTL (`TTL = -1`) và tồn tại vĩnh viễn trong Redis, gây rò rỉ bộ nhớ và làm sai lệch quota.
    * Giải pháp: Sử dụng Lua script thực thi nguyên tử qua lệnh `EVAL` (hoặc `EVALSHA` sau khi load script):
      ```lua
      -- atomic_fixed_window.lua
      -- KEYS[1]: Khóa quota theo cửa sổ
      -- ARGV[1]: TTL cửa sổ (giây, ví dụ: 900)
      local current = redis.call('INCR', KEYS[1])
      if current == 1 or redis.call('TTL', KEYS[1]) == -1 then
        redis.call('EXPIRE', KEYS[1], ARGV[1])
      end
      return current
      ```
    * **Căn cứ tài liệu chính thức Redis**: Engine Redis thực thi Lua script hoàn toàn đơn luồng và nguyên tử (ACID isolation). Không có lệnh nào khác có thể xen ngang giữa `INCR` và `EXPIRE`.
    * **Hành vi với key mới (`current == 1`)**: TTL 900 giây được thiết lập ngay lập tức tại thời điểm tạo key.
    * **Hành vi với key đã có (`current > 1`)**: Biến đếm tăng lên tuần tự, TTL hiện tại đang đếm ngược được giữ nguyên (không bị reset lại về 900 giây). Nếu key đã tồn tại nhưng thiếu TTL (`TTL == -1` do sự cố trước đó), script tự động bù đắp TTL để không bao giờ để lại key vĩnh viễn.
    * **Xử lý cạnh tranh nhiều request đồng thời**: Redis tuần tự hóa mọi lệnh `EVALSHA`. Request đầu tiên nhận `current = 1` và kích hoạt `EXPIRE 900`. Các request tiếp theo nhận `current = 2, 3, 4, 5...`. Khi `count > 5`, request bị từ chối với HTTP 429 `RATE_LIMIT_EXCEEDED`.
    * **Xử lý Timeout và Retry**:
      - Nếu client gặp timeout mạng trước khi nhận kết quả từ Redis: Key trên Redis đã có TTL an toàn 900 giây, không bao giờ rò rỉ bộ nhớ. Khi client retry, quota được tiêu thụ theo đúng request gửi đến.
      - Nếu Redis ngắt kết nối hoàn toàn: Kích hoạt cơ chế Degraded Local In-Memory Fallback.
    * **Chuyển cửa sổ (Window Rollover) & Header `Retry-After`**:
      - Khi bước sang cửa sổ 15 phút tiếp theo, `window_timestamp` thay đổi $\rightarrow$ Key mới được truy cập độc lập. Key của cửa sổ cũ tự động hết hạn và được Redis giải phóng sau 900 giây.
      - Header `Retry-After` phản ánh chính xác số giây còn lại cho đến khi kết thúc cửa sổ hiện tại:
        `const currentWindowEnd = (window_timestamp + 1) * 900000;`
        `const retryAfterSeconds = Math.max(1, Math.ceil((currentWindowEnd - Date.now()) / 1000));`
  + **Ngưỡng**: Nếu `count > 5` $\rightarrow$ Trả về HTTP 429 `RATE_LIMIT_EXCEEDED` kèm header `Retry-After: <retryAfterSeconds>`.
- **Bản chất của Cơ chế Suy thoái Cục bộ (Best-effort Degraded Local Rate Limiting under Monitoring Alert)**:
  + Khi Redis ngắt kết nối hoặc gặp sự cố:
    - Để bảo đảm tính sẵn sàng của dịch vụ công cộng, hệ thống **không áp dụng Fail-Closed** (không từ chối 100% người dùng thật bằng mã lỗi 503).
    - Thay vào đó, mỗi tiến trình Identity Service tự động kích hoạt bộ đếm Fixed Window cục bộ trong bộ nhớ RAM qua thư viện `lru-cache`.
    - **Tham số bộ nhớ cục bộ**:
      * Cửa sổ quota: 15 phút cố định.
      * Dung lượng (Capacity): 5 requests cho mỗi IP/email.
      * Giới hạn kích thước cache: Tối đa 50,000 mục IP (LRU eviction khi bộ nhớ đầy).
    - **Làm rõ ranh giới và Đánh đổi kiến trúc**:
      * Mức giới hạn $N \times 5$ requests / 15 phút trên $N$ replica chỉ là **ước lượng lý thuyết trong điều kiện lý tưởng** (container không bị restart, không bị eviction sớm).
      * Trong thực tế, nếu một container bị restart (OOM, crash, auto-scaling) hoặc key IP bị evict sớm do tràn cache, bộ đếm cục bộ cho IP đó có thể được cấp lại, khiến số lượng request thực tế có thể vượt quá $N \times 5$.
      * **Khẳng định rõ**: Đây là sự đánh đổi có chủ đích giữa Availability và Strict Quota Enforcement (theo định lý CAP: ưu tiên AP khi Redis phân vùng), nhằm tránh việc từ chối nhầm toàn bộ khách hàng khi Redis tạm thời mất kết nối.
    - **Cảnh báo vận hành (Operational Alerting)**:
      * Khi chuyển sang chế độ Degraded Fallback, hệ thống ngay lập tức:
        1. Ghi log mức `ERROR` có cấu trúc: `{ event: 'RATE_LIMIT_DEGRADED_MODE_ACTIVE', reason: redisError.message }`.
        2. Kích hoạt metric Prometheus: `rate_limit_degraded_mode_active{service="identity"} = 1`.
        3. Phát cảnh báo Alert P2 tới đội ngũ On-call / SRE để khôi phục Redis.
    - **Tự động phục hồi (Auto-recovery)**:
      * Tiến trình chạy background health-check định kỳ mỗi 5 giây (`PING` Redis).
      * Khi Redis phục hồi kết nối, hệ thống tự động chuyển lại bộ đếm tập trung trên Redis mà không cần khởi động lại dịch vụ.
- **Mô hình Xác thực IP Chuyển tiếp & Cấu hình Fastify Chuẩn xác**:
  + **Phân biệt ba khái niệm địa chỉ IP trong hệ thống**:
    1. *Direct TCP Peer Socket (`request.raw.socket.remoteAddress`)*: Địa chỉ IP thực tế của node mạng kết nối trực tiếp vào socket TCP của Identity Service (Edge Proxy hoặc container Next.js BFF).
    2. *Fastify Extracted Client IP (`request.ip`)*: Địa chỉ IP do Fastify tự động giải mã dựa trên chuỗi proxy tin cậy đã khai báo trong `trustProxy`.
    3. *Forwarded End-User IP (`X-Original-Client-IP`)*: Header do Next.js Web BFF đính kèm khi chuyển tiếp yêu cầu từ trình duyệt của khách hàng.
  + **Cấu hình Fastify Server**:
    ```ts
    // services/identity-service/src/infrastructure/http/server.ts
    import fastify from 'fastify';

    export const TRUSTED_PROXIES = [
      '127.0.0.1',
      '::1',
      '10.0.0.0/8',
      '172.16.0.0/12',
      '192.168.0.0/16',
    ];

    export const app = fastify({
      trustProxy: TRUSTED_PROXIES,
    });
    ```
  + **Kiểm tra Peer IP bằng CIDR Toán học Chuẩn xác (Xử lý Độc lập Họ Địa chỉ IPv4/IPv6)**:
    * Các dải CIDR nội bộ được chấp nhận cho BFF Peer: `['127.0.0.1/32', '::1/128', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16']`.
    * Phép kiểm tra sử dụng hàm phân tích CIDR chuẩn, xử lý an toàn khi mảng cấu hình chứa cả IPv4 và IPv6:
      ```ts
      import net from 'node:net';
      import ipaddr from 'ipaddr.js';

      export function isPeerInTrustedCidr(peerIpStr: string, allowedCidrs: string[]): boolean {
        if (!peerIpStr || typeof peerIpStr !== 'string') return false;

        let clientAddr: ipaddr.IPv4 | ipaddr.IPv6;
        try {
          // Chuẩn hóa địa chỉ IP: tự động unmap IPv4-mapped IPv6 (::ffff:192.168.1.20 -> 192.168.1.20)
          clientAddr = ipaddr.process(peerIpStr.trim());
        } catch {
          // Chuỗi IP peer sai cú pháp -> không hợp lệ
          return false;
        }

        // Duyệt tuần tự qua danh sách CIDR cho phép
        for (const cidrStr of allowedCidrs) {
          try {
            const cidr = ipaddr.parseCIDR(cidrStr);
            const [rangeAddr, prefixLen] = cidr;

            // CHỈ gọi match khi clientAddr và CIDR cùng họ (IPv4 vs IPv4, IPv6 vs IPv6)
            // Bỏ qua CIDR khác họ mà không dừng toàn bộ phép tìm kiếm
            if (clientAddr.kind() !== rangeAddr.kind()) {
              continue;
            }

            if (clientAddr.match(cidr)) {
              return true;
            }
          } catch {
            // Bỏ qua cấu hình CIDR lỗi trong mảng cấu hình (nếu có), tiếp tục kiểm tra các CIDR khác
            continue;
          }
        }

        return false;
      }
      ```
    * **Bảng kết quả kiểm chứng thuật toán CIDR (Expected vs Actual)**:

| Địa chỉ IP Đầu vào | Họ địa chỉ (Kind) | Dải CIDR Khớp mong đợi | Kết quả `isPeerInTrustedCidr` | Ghi chú kỹ thuật |
|---|---|---|---|---|
| `127.0.0.1` | IPv4 | `127.0.0.1/32` | **`true`** | Loopback IPv4 hợp lệ |
| `::1` | IPv6 | `::1/128` | **`true`** | Loopback IPv6 hợp lệ (bỏ qua CIDR IPv4 an toàn) |
| `10.1.2.3` | IPv4 | `10.0.0.0/8` | **`true`** | Mạng riêng VPC Class A |
| `172.16.1.20` | IPv4 | `172.16.0.0/12` | **`true`** | Mạng riêng VPC Class B |
| `192.168.1.20` | IPv4 | `192.168.0.0/16` | **`true`** | Mạng riêng VPC Class C (container BFF) |
| `::ffff:192.168.1.20` | IPv4 (sau unmap) | `192.168.0.0/16` | **`true`** | IPv4-mapped IPv6 được unmap chính xác |
| `172.0.0.1` | IPv4 | Không thuộc dải nào | **`false`** | IP công cộng ngoài `172.16.0.0/12` |
| `172.32.0.1` | IPv4 | Không thuộc dải nào | **`false`** | IP công cộng ngoài `172.16.0.0/12` |
| `8.8.8.8` | IPv4 | Không thuộc dải nào | **`false`** | IP công cộng Internet |
| `2001:db8::1` | IPv6 | Không thuộc dải nào | **`false`** | IP công cộng IPv6 ngoài `::1/128` |
| `invalid-ip` | Lỗi cú pháp | N/A | **`false`** | Cú pháp IP không hợp lệ |
| `""` (chuỗi rỗng) | Lỗi cú pháp | N/A | **`false`** | Đầu vào rỗng |

    * **Tính độc lập thứ tự CIDR**: Dù CIDR IPv6 đứng trước hay đứng sau các CIDR IPv4 trong mảng cấu hình, hàm luôn duyệt an toàn qua toàn bộ danh sách mà không bao giờ bị dừng đột ngột bởi lỗi khác họ.
    * **Lý do loại bỏ `startsWith`**: Phép kiểm tra `startsWith('172.')` chấp nhận sai các IP công cộng nằm ngoài dải `172.16.0.0/12` (ví dụ: `172.0.0.1`, `172.32.0.1`), đồng thời bỏ sót hoàn toàn dải `192.168.0.0/16` khiến các container BFF trên dải này bị từ chối.
  + **Xác thực Bí mật Dịch vụ Nội bộ (`X-Internal-Service-Key`) An toàn**:
    * Shared secret được cấu hình qua biến môi trường `INTERNAL_SERVICE_KEY`.
    * **Điều kiện tiên quyết bắt buộc (Fail-Secure)**: Biến môi trường `INTERNAL_SERVICE_KEY` phải được thiết lập là chuỗi bí mật mạnh, tối thiểu 32 ký tự (`typeof process.env.INTERNAL_SERVICE_KEY === 'string' && process.env.INTERNAL_SERVICE_KEY.length >= 32`). Nếu thiếu hoặc rỗng, hệ thống **từ chối 100% quyền ủy thác IP từ BFF** và ghi log mức `FATAL`.
    * **So sánh Timing-Safe, Tuyệt đối cấm so sánh `undefined === undefined`**:
      ```ts
      import crypto from 'node:crypto';

      export function verifyInternalSecret(headerValue: string | string[] | undefined, expectedSecret: string | undefined): boolean {
        // Cả 2 phía bắt buộc phải là chuỗi hợp lệ, không bao giờ cho phép so sánh khi thiếu
        if (typeof headerValue !== 'string' || !headerValue) return false;
        if (typeof expectedSecret !== 'string' || expectedSecret.length < 32) return false;

        const headerBuf = Buffer.from(headerValue);
        const expectedBuf = Buffer.from(expectedSecret);
        if (headerBuf.length !== expectedBuf.length) return false;

        return crypto.timingSafeEqual(headerBuf, expectedBuf);
      }
      ```
  + **Kiểm tra Tính Đơn trị và Định dạng của `X-Original-Client-IP`**:
    * Giá trị header phải là chuỗi đơn trị (string), không phải mảng (array).
    * Chuỗi được trim khoảng trắng, không chứa dấu phẩy `,` (ngăn chặn inject danh sách IP giả).
    * Phải là địa chỉ IPv4 hoặc IPv6 hợp lệ được kiểm tra qua `net.isIP(ip) !== 0`.
    * Nếu header có mặt nhưng sai định dạng $\rightarrow$ Trả về HTTP 400 `MALFORMED_FORWARDED_IP` để BFF sửa lỗi, không chấp nhận địa chỉ rác làm khóa quota.
  + **Hai Luồng Kết nối Chi tiết**:
    1. *Luồng Mobile App*:
       - Mobile Device $\rightarrow$ Edge API Gateway / Reverse Proxy (Cloudflare / ALB) $\rightarrow$ Identity Service.
       - Socket TCP peer trực tiếp kết nối vào Identity Service là Edge Proxy. Fastify `trustProxy` tự động trích xuất IP công khai thực của thiết bị vào `request.ip`.
       - Mobile client không gửi `X-Internal-Service-Key`. Bất kỳ header `X-Original-Client-IP` nào do client gửi lên đều bị Identity Service bỏ qua hoàn toàn vì peer không thuộc danh sách BFF nội bộ được xác thực.
    2. *Luồng Web App (qua Next.js BFF)*:
       - Trình duyệt Web $\rightarrow$ Edge Reverse Proxy $\rightarrow$ Next.js Web BFF $\rightarrow$ Identity Service.
       - Next.js BFF trích xuất IP client từ `cf-connecting-ip` hoặc `x-forwarded-for` do Edge Proxy gửi tới.
       - Next.js BFF thực hiện cuộc gọi HTTP nội bộ server-to-server tới Identity Service (`POST /api/v1/identity/register`), gửi kèm:
         * `X-Original-Client-IP: <client_ip>`
         * `X-Internal-Service-Key: <INTERNAL_SERVICE_KEY>`
       - Fastify Hook `onRequest` xác minh TCP peer nằm trong CIDR BFF nội bộ VÀ secret hợp lệ qua `verifyInternalSecret`. Khi thỏa mãn, `request.clientIp` được gán bằng `X-Original-Client-IP` đã kiểm tra định dạng.
       - **Tránh gom chung IP BFF**: Nhờ cơ chế này, từng người dùng Web có khóa quota IP độc lập, không bị gom chung thành IP của container BFF.
  + **Ma trận Xử lý IP & Ủy quyền Toàn diện**:

| Trường hợp | Direct TCP Peer (`request.raw.socket.remoteAddress`) | `X-Internal-Service-Key` | `X-Original-Client-IP` | Quyết định xử lý (`request.clientIp`) | Giải thích kỹ thuật |
|---|---|---|---|---|---|
| **1. Web BFF Hợp lệ** | Thuộc CIDR nội bộ (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.1/32`) | Đúng secret (`timingSafeEqual`) | Chuỗi đơn trị, định dạng IPv4/IPv6 hợp lệ | `X-Original-Client-IP` | Xác thực thành công; tách biệt quota từng khách hàng Web; không gom vào IP BFF. |
| **2. BFF Thiếu / Sai Secret** | Thuộc CIDR nội bộ | Thiếu hoặc sai secret | Có giá trị | **Từ chối (HTTP 401 `UNAUTHORIZED_INTERNAL_CALL`)** | Peer nội bộ nhưng không chứng minh được danh tính; từ chối ngay để tránh gom IP hoặc bypass quota. Log cảnh báo bảo mật mức `WARN`. |
| **3. BFF Gửi IP Sai Định dạng** | Thuộc CIDR nội bộ | Đúng secret | Chứa dấu phẩy, mảng, hoặc sai cú pháp IP | **Từ chối (HTTP 400 `MALFORMED_FORWARDED_IP`)** | BFF forward dữ liệu lỗi; từ chối để phát hiện lỗi tích hợp, không chấp nhận IP rác làm khóa cache. |
| **4. Client Giả mạo Header từ Ngoài** | Ngoài CIDR nội bộ (Edge Proxy / Mobile / Internet) | Bất kỳ (hoặc thiếu) | Gửi kèm header `X-Original-Client-IP` | `request.ip` (từ Fastify `trustProxy`) | **Bỏ qua hoàn toàn** `X-Original-Client-IP` vì peer không phải BFF nội bộ; dùng IP công khai do Edge Proxy cung cấp. |
| **5. Client Giả mạo Secret từ Ngoài** | Ngoài CIDR nội bộ | Gửi kèm `X-Internal-Service-Key` | Bất kỳ | `request.ip` | **Bỏ qua hoàn toàn** vì Peer không nằm trong mạng riêng nội bộ; ghi log cảnh báo tấn công giả mạo. |
| **6. Test Override (Chỉ trong Test)** | Bất kỳ | Không bắt buộc | `X-Test-Client-IP` có giá trị | `X-Test-Client-IP` | **CHỈ hoạt động khi**: `NODE_ENV === 'test'` VÀ `ENABLE_TEST_IP_OVERRIDE === 'true'`. Trong Staging / Production luôn trả về `false`, header bị bỏ qua 100%. |

  + **Hợp đồng Lỗi Chuyển tiếp Nội bộ (Internal Forwarding Error Responses) & Xử lý tại Web BFF**:
    * Khi Identity Service phát hiện lỗi ở ranh giới chuyển tiếp từ Web BFF, dịch vụ trả về mã lỗi giao tiếp nội bộ chuyên biệt:
      - **HTTP 401 `UNAUTHORIZED_INTERNAL_CALL`**: Xảy ra khi socket peer thuộc dải CIDR nội bộ nhưng header `X-Internal-Service-Key` bị thiếu hoặc không khớp secret.
      - **HTTP 400 `MALFORMED_FORWARDED_IP`**: Xảy ra khi `X-Original-Client-IP` bị gửi dưới dạng mảng, chứa dấu phẩy (nhiều IP), hoặc sai định dạng IPv4/IPv6 (`net.isIP(ip) === 0`).
    * **Ranh giới Phân định Phản hồi Identity $\rightarrow$ BFF vs BFF $\rightarrow$ Khách hàng (FR-021)**:
      - Next.js Web BFF phân định phản hồi từ Identity dựa trên **CẢ HTTP Status VÀ Payload/Schema/Code** (tuyệt đối không chỉ lọc theo status code đơn thuần để tránh gom nhầm lỗi nhập liệu người dùng thành lỗi máy chủ):
        1. *Lỗi giao tiếp nội bộ (Internal Forwarding Errors)*:
           - Nhận HTTP 401 (`UNAUTHORIZED_INTERNAL_CALL`) hoặc HTTP 400 (`MALFORMED_FORWARDED_IP`): BFF ghi log nội bộ mức `ERROR` có cấu trúc kèm thông tin sự cố hạ tầng/secret.
           - **BFF TUYỆT ĐỐI KHÔNG chuyển tiếp HTTP 401 ra trình duyệt**: Tránh gây hiểu nhầm cho khách hàng là phiên làm việc hết hạn hoặc yêu cầu đăng nhập.
           - BFF chuyển đổi thành **`HTTP 500 Internal Server Error`** với `code: "INTERNAL_ERROR"` ("Hệ thống đang bận hoặc gặp sự cố xử lý, vui lòng thử lại sau ít phút") trả về cho client. Che giấu hoàn toàn secret và chi tiết mạng nội bộ.
        2. *Lỗi nhập liệu người dùng (Client Validation Errors)*:
           - Nhận HTTP 400 với payload khớp `RegisterClientErrorResponseSchema` (các mã: `INVALID_EMAIL_FORMAT`, `PWD_LENGTH_INVALID`, `PASSWORD_IN_BLOCKLIST`, `PASSWORD_CONFIRM_MISMATCH`, `FULL_NAME_REQUIRED`, v.v.).
           - BFF **giữ nguyên HTTP 400 Bad Request** và chuyển tiếp payload nguyên vẹn để client hiển thị hướng dẫn nhập liệu cho người dùng.
        3. *Giới hạn tần suất (Rate Limiting)*:
           - Nhận HTTP 429 (`RATE_LIMIT_EXCEEDED`): BFF **giữ nguyên HTTP 429** và bảo toàn header `Retry-After: <giây>`.
        4. *Phản hồi dị thường / Không đúng Schema / Mâu thuẫn Status-Code*:
           - Response từ Identity không parse được theo bất kỳ schema hợp lệ nào (thân rỗng, HTML lỗi từ gateway, mã lỗi lạ, hoặc status mâu thuẫn): BFF ghi log `ERROR` nội bộ có cấu trúc **chỉ bao gồm metadata an toàn theo allowlist** (upstream HTTP status, correlation ID / request ID đã kiểm tra, loại lỗi xác thực schema; **tuyệt đối KHÔNG log raw body/headers, mật khẩu, token, cookie hoặc internal service key; không đưa chúng vào telemetry** theo FR-013, SC-005, PWD-006), chuyển đổi an toàn thành **`HTTP 500 Internal Server Error`** (`INTERNAL_ERROR`). Tuyệt đối KHÔNG trả HTTP 200 tiếp nhận giả và KHÔNG chuyển tiếp HTTP 401 ra ngoài.
    * **Bảng Đối chứng Phân nhánh Phản hồi qua Next.js Web BFF**:

| Trạng thái Identity | Mã lỗi Payload Identity | Schema xác thực tại BFF | HTTP Status trả về Client | Mã lỗi trả về Client | Hành vi BFF & Ghi chú |
|---|---|---|---|---|---|
| `400 Bad Request` | `PWD_LENGTH_INVALID` | `RegisterClientErrorResponseSchema` | **400** | `PWD_LENGTH_INVALID` | Giữ nguyên 400; hiển thị lỗi độ dài mật khẩu cho người dùng. |
| `400 Bad Request` | `PASSWORD_IN_BLOCKLIST` | `RegisterClientErrorResponseSchema` | **400** | `PASSWORD_IN_BLOCKLIST` | Giữ nguyên 400; hiển thị cảnh báo mật khẩu phổ biến/dễ đoán. |
| `400 Bad Request` | `INVALID_EMAIL_FORMAT` | `RegisterClientErrorResponseSchema` | **400** | `INVALID_EMAIL_FORMAT` | Giữ nguyên 400; hiển thị lỗi định dạng email chuẩn. |
| `400 Bad Request` | `MALFORMED_FORWARDED_IP` | `InternalForwardingErrorResponseSchema` | **500** | `INTERNAL_ERROR` | Lỗi cấu hình IP chuyển tiếp giữa BFF và Identity; che giấu lỗi hạ tầng, log `ERROR`. |
| `401 Unauthorized` | `UNAUTHORIZED_INTERNAL_CALL` | `InternalForwardingErrorResponseSchema` | **500** | `INTERNAL_ERROR` | Lỗi bí mật nội bộ; cấm gửi 401 ra ngoài (tránh nhầm cần đăng nhập), log `ERROR`. |
| `429 Too Many Requests` | `RATE_LIMIT_EXCEEDED` | `RegisterClientErrorResponseSchema` | **429** | `RATE_LIMIT_EXCEEDED` | Giữ nguyên 429; chuyển tiếp nguyên vẹn header `Retry-After`. |
| `400 Bad Request` (hoặc khác) | Không có payload / payload dị thường | Không khớp bất kỳ schema nào | **500** | `INTERNAL_ERROR` | Phản hồi dị thường; fail-safe về HTTP 500 an toàn, log `ERROR` theo metadata allowlist (không log raw body/secrets), không trả 200 giả. |

- **Hòa giải Chính xác với Codebase Repo Thực tế**:
  + Node.js: Tuân thủ `package.json` thực tế: **`node >=24.19.0 <25`**.
  + Backend Identity Service: **Fastify** + **Drizzle ORM** (driver `postgres.js`) + **`@node-rs/argon2`**.
  + Backend Cinema Core: Giữ nguyên **NestJS + Fastify + Drizzle ORM** (ADR-0005, ADR-0036).
  + Frontend Customer Web: Next.js `16.4.5` (App Router) + React `19.3.1` + **CSS Modules** (`*.module.css`) + tokens vanilla CSS (`src/styles/tokens.css`, `src/styles/globals.css`). **Gạch bỏ hoàn toàn Tailwind CSS**.
  + Routes thực tế: `/auth/login`, `/auth/forgot-password`, `/auth/register` (tương ứng `src/app/(cinema)/auth/...`).
  + Chiến lược Kiểm thử (ADR-0021): Giữ nguyên regression test suite hiện có của repo chạy bằng **`node:test`** (`node --test "tests/*.test.ts"`). Thiết kế test mới với **Vitest** (cho pure TS logic), **React Testing Library** (cho client components) và **Playwright** (cho E2E Web); không ép Vitest vào runner native của Expo.
