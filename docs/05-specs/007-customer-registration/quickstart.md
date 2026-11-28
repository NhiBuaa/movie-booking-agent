# Quickstart & Validation Guide: A-01 — Đăng ký tài khoản khách hàng

**Feature**: `007-customer-registration`  
**Date**: 2026-11-21 (cập nhật hoàn thiện toàn diện theo review vòng 5 ngày 2026-11-22)  
**Status**: Completed  
**Authority**: Kế thừa [spec.md](spec.md) v0.3.2 (bảo toàn), [data-model.md](data-model.md), [contracts/](contracts/endpoints.md), và [research.md](research.md).

Tài liệu này cung cấp các kịch bản kiểm chứng độc lập có thể tái hiện (runnable validation scenarios) từ đầu đến cuối nhằm xác thực toàn diện tính đúng đắn, an toàn dữ liệu, khả năng chịu lỗi mạng và trợ năng của tính năng A-01 trước khi bàn giao.

---

## 1. Chuẩn bị môi trường kiểm thử cô lập (Test Environment Setup)

### 1.1. Phân định lệnh kiểm thử hiện hữu và lệnh runtime sau triển khai

- **Lệnh hiện hữu chạy được ngay trong repo** (Kiểm tra hợp đồng và tính toàn vẹn tài liệu):
  ```bash
  # 1. Chạy bộ kiểm toàn vẹn liên kết và quy ước repo kit
  powershell -ExecutionPolicy Bypass -File "C:\Developer\Projects\agentic-repo-kit-reference\scripts\check-kit.ps1" -TargetPath .

  # 2. Chạy regression suite kiểm tra hợp đồng TypeScript và logic Web hiện có
  npm test
  ```
- **Hướng dẫn Bootstrap Môi trường Test Cô lập (Dự kiến thực hiện trong giai đoạn Triển khai mã nguồn)**:
  *Lưu ý minh bạch*: Các hướng dẫn dưới đây là đặc tả kỹ thuật chuẩn bị cho giai đoạn implementation, **chưa được thực thi trong runtime ở đợt cập nhật tài liệu này** (tuân thủ nghiêm ngặt quy tắc không viết mã ứng dụng, không tạo file cấu hình vận hành trước khi Plan được phê duyệt).
  
  Khi triển khai mã nguồn, bộ kiểm thử tích hợp sẽ sử dụng một stack dịch vụ cô lập để không ảnh hưởng đến cơ sở dữ liệu hay container của các phiên làm việc khác:
  1. *Khởi tạo cơ sở dữ liệu*:
     - PostgreSQL Identity Test (cổng `5433`, DB: `movie_booking_identity_test`, `wal_level=logical` phục vụ Debezium CDC).
     - PostgreSQL Cinema Core Test (cổng `5434`, DB: `movie_booking_core_test`).
  2. *Chạy Database Migrations*:
     - Identity: Chạy migration Drizzle tạo các bảng `users`, `accounts`, `user_role_assignments`, `outbox_events`.
     - Core: Chạy migration Drizzle tạo bảng `loyalty_members` (`points_balance DECIMAL(10,2)`).
  3. *Hạ tầng hàng đợi & bộ nhớ đệm*:
     - Redis Test (cổng `6380`): Phục vụ Fixed Window Rate Limiting.
     - Kafka KRaft Test (cổng `9093`): Topic `identity.customer-registered` và `identity.customer-registered.dlq`.
     - Debezium Kafka Connect (cổng `8084`): Cấu hình connector `identity-outbox-connector` ánh xạ bảng `outbox_events` sang Kafka topic.
  4. *Khởi động dịch vụ và kiểm tra Readiness*:
     - Khởi động Identity Service trên cổng `3001`: Kiểm tra readiness qua `GET http://localhost:3001/health` (xác thực DB, Redis và nạp blocklist thành công).
     - Khởi động Cinema Core Consumer: Kiểm tra kết nối Kafka KRaft và Core DB.
     - Khởi động Next.js Web BFF trên cổng `3000`: Kiểm tra kết nối proxy tới Identity Service.
  5. *Lệnh Cleanup Sau Kiểm Thử*:
     - Dọn dẹp sạch toàn bộ container, volume và dữ liệu test cô lập thuộc đúng phiên làm việc, không ảnh hưởng container phiên khác.

### 1.2. Quy ước giả lập IP và Xác thực Chuyển tiếp trong môi trường kiểm thử
Để tránh các ca kiểm thử mật khẩu bị chặn ngoài ý muốn do giới hạn tần suất (Rate Limiting: 5 requests / 15 phút / IP theo Fixed Window Counter với Redis Lua script nguyên tử), bộ kiểm thử gửi header `X-Test-Client-IP: 192.168.100.X` (với $X$ tăng dần cho từng ca).
Cờ `ENABLE_TEST_IP_OVERRIDE=true` **CHỈ ĐƯỢC BẬT KHI VÀ CHỈ KHI** `NODE_ENV === 'test'`. Trên Production và Staging, header này bị loại bỏ hoàn toàn.
Đối với luồng Web qua BFF, Next.js BFF chuyển tiếp IP khách qua header `X-Original-Client-IP` kèm khóa bí mật nội bộ `X-Internal-Service-Key` (xác thực timingSafeEqual với biến môi trường `INTERNAL_SERVICE_KEY`, peer thuộc dải CIDR nội bộ `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.1/32`, kiểm tra IP đơn trị hợp lệ `net.isIP`).

---

## 2. Kịch bản kiểm chứng 1: Đăng ký Email mới thành công (Happy Path)

### Mục tiêu
Kiểm chứng luồng đăng ký tài khoản hợp lệ: tạo nguyên tử 4 bảng trong Identity Service, gán duy nhất vai trò `CUSTOMER`, không cấp session token, sinh sự kiện outbox `CUSTOMER_REGISTERED` version `v1` và hiển thị giao diện tiếp nhận trung tính (SC-001, SC-002, PL1).

### Các bước thực hiện
1. Gửi yêu cầu HTTP POST tới BFF:
   ```bash
   curl -i -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -H "X-Test-Client-IP: 192.168.100.1" \
     -d '{
       "fullName": "Nguyễn Văn Test",
       "email": "test.user.new@example.com",
       "password": "mat khau rat an toan 2026",
       "phone": "0987654321"
     }'
   ```
2. **Kiểm chứng phản hồi HTTP & Headers**:
   - Mã trạng thái: `HTTP/1.1 200 OK`.
   - Header `Set-Cookie`: **Hoàn toàn vắng mặt** (xác nhận không cấp session tự động theo FR-012 Phương án A).
   - Payload JSON:
     ```json
     {
       "success": true,
       "message": "Yêu cầu đăng ký đã được tiếp nhận. Nếu địa chỉ email hợp lệ và chưa có tài khoản, hướng dẫn xác minh tài khoản sẽ được gửi đến hộp thư của bạn. Nếu bạn đã có tài khoản từ trước, vui lòng đăng nhập hoặc sử dụng chức năng khôi phục mật khẩu."
     }
     ```
3. **Kiểm chứng Database Identity Service**:
   - Bảng `users`:
     ```sql
     SELECT id, name, email, email_verified, phone_number FROM users WHERE email = 'test.user.new@example.com';
     ```
     $\rightarrow$ Trả về 1 bản ghi: `email_verified = false`, `phone_number = '0987654321'`.
   - Bảng `accounts` (Kiểm tra Better Auth mapping PL1):
     ```sql
     SELECT user_id, account_id, provider_id, password_hash FROM accounts WHERE user_id = :userId;
     ```
     $\rightarrow$ `account_id` khớp chính xác với `user.id` (không phải email); `provider_id = 'credential'`; `password_hash` bắt đầu bằng `$argon2id$v=19$m=65536,t=3,p=1$`.
   - Bảng `user_role_assignments` (Kiểm tra phân quyền PL4):
     ```sql
     SELECT role_code, cinema_id FROM user_role_assignments WHERE user_id = :userId;
     ```
     $\rightarrow$ Trả về 1 bản ghi duy nhất: `role_code = 'CUSTOMER'`, `cinema_id IS NULL`.
   - Bảng `outbox_events` (Kiểm tra Outbox PL2, PL5):
     ```sql
     SELECT event_type, status, payload FROM outbox_events WHERE aggregate_id = :userId;
     ```
     $\rightarrow$ `event_type = 'CUSTOMER_REGISTERED'`, `status = 'PENDING'`, `payload->>'eventVersion' = 'v1'`, `payload->>'eventId'` là chuỗi UUID canonical 36 ký tự.
4. **Kiểm chứng Giao diện (Customer Web & Mobile)**:
   - Form chuyển sang Màn hình tiếp nhận trung tính duy nhất với thông điệp chuẩn hóa.
   - Hiển thị đầy đủ bộ 3 nút điều hướng:
     + *"Đăng nhập ngay"* $\rightarrow$ chuyển hướng tới `/auth/login` (A-03).
     + *"Khôi phục mật khẩu"* $\rightarrow$ chuyển hướng tới `/auth/forgot-password` (A-05).
     + *"Gửi lại email xác minh"* $\rightarrow$ hiển thị trạng thái sẵn sàng kèm đếm ngược cooldown 60 giây.

---

## 3. Kịch bản kiểm chứng 2: Đăng ký bằng Email đã tồn tại & Cạnh tranh đồng thời

### Mục tiêu
Kiểm chứng cơ chế phản hồi trung tính an toàn (FR-007 Phương án B), xử lý email thô có khoảng trắng ngoài rìa được chuẩn hóa hợp lệ theo spec US2 Scenario 2 (PL5), xử lý an toàn khi 2 request gửi đồng thời (PL3), không làm rò rỉ sự tồn tại của email qua API, UI hay độ trễ (SC-004).

### Ca 2.1: Gửi tuần tự với email đã tồn tại (Có khoảng trắng ngoài rìa — US2 Scenario 2)
1. Gửi lại yêu cầu đăng ký với cùng email nhưng có khoảng trắng đầu/cuối và viết hoa:
   ```bash
   curl -i -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -H "X-Test-Client-IP: 192.168.100.2" \
     -d '{
       "fullName": "Kẻ Quét Dữ Liệu",
       "email": "  TEST.USER.NEW@EXAMPLE.COM  ",
       "password": "mat khau bat ky tren 15 ky tu",
       "phone": "0911223344"
     }'
   ```
2. **Kiểm chứng quá trình xử lý**:
   - *Tầng Wire Schema*: Nhận chuỗi email thô độ dài 25 ký tự $\le 254 \rightarrow$ **HỢP LỆ (PASS)**.
   - *Tầng Application Normalization*: Thực thi `email.trim().toLowerCase()` chuyển thành `test.user.new@example.com` và kiểm tra định dạng email canonical $\rightarrow$ **HỢP LỆ (PASS)**.
   - *Truy vấn Database*: Phát hiện email đã tồn tại trong `users`.
   - *Thực thi Dummy Hash*: Tiêu hao CPU tương đương nhánh mới để chống Timing Attack.
3. **Kết quả mong đợi**:
   - HTTP: `200 OK`, JSON payload giống hệt 100% Kịch bản 1, không có `Set-Cookie`.
   - Database: Bản ghi `users` và `accounts` cũ giữ nguyên vẹn, không sinh thêm `outbox_events` mới.
   - Giao diện: Hiển thị đúng màn hình tiếp nhận trung tính với cùng thông điệp và cùng bộ 3 nút ("Đăng nhập ngay", "Khôi phục mật khẩu", "Gửi lại email xác minh") có trạng thái hoàn toàn giống Kịch bản 1.

### Ca 2.2: Gửi đồng thời hai yêu cầu cùng email (Race Condition)
1. Sử dụng script gửi đồng thời 2 HTTP POST request với cùng email `concurrent.user@example.com` từ 2 tiến trình độc lập.
2. **Kết quả mong đợi**:
   - 1 request commit thành công vào DB.
   - 1 request gặp lỗi vi phạm Unique Constraint `users_email_unique` (`23505`) được server bắt và rollback an toàn.
   - **Cả 2 request đều nhận được HTTP 200 OK** với JSON tiếp nhận trung tính. 0 request bị lỗi HTTP 500. Dữ liệu trong database hoàn toàn nhất quán (1 user duy nhất).

### Ca 2.3: Kiểm tra Định dạng Email Canonical (Loại bỏ các email vi phạm chuẩn Better Auth / Zod)
1. Gửi các request với email vi phạm Validator mặc định của Better Auth (v1.1.x+) và Zod standard email validator (`CANONICAL_EMAIL_REGEX`):
   - `.alice@example.com` (dấu chấm ở đầu local-part)
   - `alice..bob@example.com` (hai dấu chấm liên tiếp trong local-part)
   - `alice.@example.com` (dấu chấm ở cuối local-part trước `@`)
   - `a!b@example.com` (chứa ký tự `!` bị Better Auth/Zod từ chối)
   - `a@example.c` (TLD 1 ký tự bị Better Auth/Zod từ chối)
   - `@example.com` (thiếu local-part)
   - `alice@` (thiếu domain part)
2. **Kiểm chứng quá trình xử lý**:
   - Tầng Wire Schema: Nhận chuỗi thô $\le 254$ ký tự $\rightarrow$ HỢP LỆ (PASS).
   - Tầng Application: Thực thi `email.trim().toLowerCase()` và kiểm tra `CANONICAL_EMAIL_REGEX` $\rightarrow$ Thất bại.
3. **Kết quả mong đợi**:
   - Cả 7 trường hợp đều bị từ chối với `HTTP/1.1 400 Bad Request`.
   - Payload JSON trả về mã lỗi chuẩn:
     ```json
     {
       "success": false,
       "code": "INVALID_EMAIL_FORMAT",
       "message": "Địa chỉ email không đúng định dạng chuẩn sau khi chuẩn hóa."
     }
     ```
4. **Đối chứng hợp lệ**: Email `alice.bob+tag@sub.example.com`, `user_name@domain.vn` và `  Test.User@Example.COM  ` (sau khi chuẩn hóa thành `test.user@example.com`) đều vượt qua kiểm tra và được tiếp nhận thành công (`HTTP 200 OK`).

### Ca 2.4: Kiểm chứng Giới hạn Tần suất Rate Limiting, Atomic Redis, CIDR Đa Họ và Lỗi Chuyển tiếp BFF
1. **Kiểm chứng bộ đếm nguyên tử và TTL trên Redis**:
   - Gửi liên tiếp 5 HTTP POST request đăng ký từ cùng một IP (`X-Test-Client-IP: 192.168.100.99`).
   - Cả 5 request đều nhận được `HTTP/1.1 200 OK`.
   - Kiểm tra Redis key qua lệnh CLI: `redis-cli -p 6380 GET ratelimit:register:ip:192.168.100.99:<window_timestamp>` $\rightarrow$ Giá trị trả về là `5`.
   - Kiểm tra TTL qua lệnh: `redis-cli -p 6380 TTL ratelimit:register:ip:192.168.100.99:<window_timestamp>` $\rightarrow$ Trả về số nguyên dương $0 < \text{TTL} \le 900$.
   - **Xác nhận**: Nhờ Lua script nguyên tử trên Redis, TTL luôn được thiết lập ngay tại request đầu tiên (`INCR` và `EXPIRE` cùng một giao dịch nguyên tử). Tuyệt đối không xảy ra tình trạng key vĩnh viễn không có TTL (`TTL = -1`).
2. **Kiểm chứng chặn request thứ 6 (HTTP 429)**:
   - Gửi request thứ 6 từ cùng IP `192.168.100.99`.
   - **Kết quả mong đợi**:
     * HTTP Status: `HTTP/1.1 429 Too Many Requests`.
     * Headers: `Retry-After: <số_giây_còn_lại_của_cửa_sổ_15_phút>`, `X-RateLimit-Limit: 5`, `X-RateLimit-Remaining: 0`.
     * Payload JSON:
       ```json
       {
         "success": false,
         "code": "RATE_LIMIT_EXCEEDED",
         "message": "Bạn đã gửi quá nhiều yêu cầu đăng ký từ địa chỉ này. Vui lòng thử lại sau 15 phút."
       }
       ```
     * Kiểm tra Database: Không có bất kỳ bản ghi nào được ghi vào `users` hay `accounts`.
3. **Kiểm chứng Thuật toán CIDR Đa Họ (IPv4 và IPv6) Không bị dừng đột ngột**:
   - Kiểm thử hàm `isPeerInTrustedCidr` với cấu hình danh sách hỗn hợp `['127.0.0.1/32', '::1/128', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16']`:
     * Peer `127.0.0.1` $\rightarrow$ `true`.
     * Peer `::1` $\rightarrow$ `true` (không bị ném lỗi bởi CIDR IPv4 phía trước).
     * Peer `10.1.2.3`, `172.16.1.20`, `192.168.1.20` $\rightarrow$ `true` (không bị dừng bởi CIDR IPv6 `::1/128` nằm giữa).
     * Peer `::ffff:192.168.1.20` $\rightarrow$ `true` (unmap IPv4-mapped IPv6 thành công).
     * Peer `172.0.0.1`, `172.32.0.1`, `8.8.8.8` $\rightarrow$ `false` (loại trừ chính xác các IP công cộng ngoài dải).
4. **Kiểm chứng Chuyển tiếp IP từ Web BFF, Phân định Lỗi Nhập liệu vs Lỗi Nội bộ (FR-021)**:
   - *Lưu ý về môi trường thực thi*: Đây là đặc tả thiết kế kịch bản kiểm chứng và fixtures logic; các bước kiểm chứng này được thiết kế để kiểm thử tĩnh và kiểm thử tích hợp tự động sau này khi stack runtime được dựng lên, chưa tuyên bố đã thực thi trên cụm dịch vụ đang chạy.
   - *Luồng Hợp lệ*: Next.js BFF (peer IP `192.168.1.20`) gửi request chuyển tiếp với:
     * `X-Original-Client-IP: 203.0.113.50`
     * `X-Internal-Service-Key: <INTERNAL_SERVICE_KEY>`
     $\rightarrow$ Fastify xác thực peer CIDR và secret đúng (`timingSafeEqual`) $\rightarrow$ Khóa quota được tạo theo IP client `203.0.113.50`. Mỗi khách Web có quota độc lập, **không bị gom chung vào IP của BFF container**.
   - *Lỗi Nhập liệu Người dùng qua Web BFF (Giữ nguyên HTTP 400)*:
     * Client gửi form với mật khẩu 14 ký tự hoặc email sai định dạng qua BFF.
     * Identity Service trả về: `HTTP/1.1 400 Bad Request` với payload khớp `RegisterClientErrorResponseSchema` (ví dụ `code: "PWD_LENGTH_INVALID"` hoặc `code: "INVALID_EMAIL_FORMAT"`).
     * Next.js BFF xác thực payload là lỗi nhập liệu hợp lệ của người dùng: **Giữ nguyên `HTTP/1.1 400 Bad Request`** và chuyển tiếp nguyên vẹn payload về trình duyệt để hiển thị hướng dẫn nhập liệu cho người dùng. **TUYỆT ĐỐI KHÔNG đổi thành HTTP 500**.
   - *Lỗi Khóa Bí mật Nội bộ (BFF Chuyển đổi thành HTTP 500)*: Gửi request từ BFF với secret sai hoặc thiếu:
     * Identity Service trả về: `HTTP/1.1 401 Unauthorized`, payload `{ "success": false, "code": "UNAUTHORIZED_INTERNAL_CALL", "message": "Khóa dịch vụ nội bộ không hợp lệ hoặc bị thiếu." }`.
     * Next.js BFF ghi log mức `ERROR`, **TUYỆT ĐỐI KHÔNG chuyển tiếp 401 ra trình duyệt** (tránh gây hiểu nhầm cho khách là cần đăng nhập). BFF trả về cho trình duyệt `HTTP/1.1 500 Internal Server Error` (code: `INTERNAL_ERROR`), không để lộ thông tin hạ tầng/secret.
   - *Lỗi IP Chuyển tiếp Sai Định dạng (BFF Chuyển đổi thành HTTP 500)*: Gửi request từ BFF với `X-Original-Client-IP` dạng mảng hoặc chứa dấu phẩy:
     * Identity Service trả về: `HTTP/1.1 400 Bad Request`, payload `{ "success": false, "code": "MALFORMED_FORWARDED_IP", "message": "Địa chỉ IP chuyển tiếp không đúng định dạng đơn trị IPv4 hoặc IPv6." }`.
     * Next.js BFF ghi log mức `ERROR` và trả về `HTTP/1.1 500 Internal Server Error` (code: `INTERNAL_ERROR`) cho trình duyệt.
   - *Giới hạn Tần suất (Giữ nguyên HTTP 429)*:
     * Identity Service trả về `HTTP/1.1 429 Too Many Requests` với `code: "RATE_LIMIT_EXCEEDED"`.
     * Next.js BFF **giữ nguyên `HTTP/1.1 429 Too Many Requests`**, bảo toàn header `Retry-After: <giây>` và chuyển tiếp về trình duyệt.
   - *Phản hồi Dị thường / Sai Schema / Bảo vệ Chống Rò rỉ Bí mật Sentinel (FR-013, SC-005, PWD-006)*:
     * *Tình huống kiểm thử thiết kế*: Upstream Identity Service hoặc gateway nội bộ trả về phản hồi bất thường (ví dụ `HTTP/1.1 502 Bad Gateway` hoặc payload dị thường ngoài hợp đồng Zod) có chứa dữ liệu nhạy cảm:
       ```json
       {
         "code": "UNKNOWN",
         "debug": {
           "password": "SENTINEL_PASSWORD",
           "X-Internal-Service-Key": "SENTINEL_SECRET"
         }
       }
       ```
     * *Kết quả mong đợi tại Next.js Web BFF*:
       - Client nhận: `HTTP/1.1 500 Internal Server Error` với JSON an toàn `{ "success": false, "code": "INTERNAL_ERROR", "message": "Hệ thống đang bận hoặc gặp sự cố xử lý, vui lòng thử lại sau ít phút." }`.
       - Ghi log hệ thống mức `ERROR`: **Chỉ ghi nhận metadata cần thiết theo allowlist** (`upstreamStatus: 502`, `correlationId`, `errorType: "schema_validation_failed"`). Tuyệt đối không log raw body/headers.
       - **Kiểm chứng Không rò rỉ Bí mật (Zero-Leakage Sentinel Verification)**: Quét kiểm tra toàn bộ response trả về client, tệp log hệ thống và traces telemetry: **TUYỆT ĐỐI KHÔNG xuất hiện chuỗi `SENTINEL_PASSWORD` hoặc `SENTINEL_SECRET`**.
       - Tuyệt đối không trả HTTP 200 tiếp nhận giả và không để lọt HTTP 401 ra trình duyệt.
     * *Lưu ý*: Đây là đặc tả thiết kế ca kiểm thử cho bước triển khai (test design), không viết hoặc chạy mã implementation trong đợt sửa tài liệu này.
   - *Tấn công Giả mạo từ Internet*: Client Internet gửi trực tiếp header `X-Original-Client-IP` $\rightarrow$ Identity Service phát hiện peer không thuộc CIDR nội bộ, bỏ qua hoàn toàn header và rate-limit theo IP công khai `request.ip`.

#### Bảng Đối chứng Phân nhánh Phản hồi qua Next.js Web BFF

| Trạng thái Identity | Mã lỗi Payload Identity | Schema xác thực tại BFF | HTTP Status trả về Client | Mã lỗi trả về Client | Hành vi BFF & Ghi chú |
|---|---|---|---|---|---|
| `400 Bad Request` | `PWD_LENGTH_INVALID` | `RegisterClientErrorResponseSchema` | **400** | `PWD_LENGTH_INVALID` | Giữ nguyên 400; hiển thị lỗi độ dài mật khẩu cho người dùng. |
| `400 Bad Request` | `PASSWORD_IN_BLOCKLIST` | `RegisterClientErrorResponseSchema` | **400** | `PASSWORD_IN_BLOCKLIST` | Giữ nguyên 400; hiển thị cảnh báo mật khẩu phổ biến/dễ đoán. |
| `400 Bad Request` | `INVALID_EMAIL_FORMAT` | `RegisterClientErrorResponseSchema` | **400** | `INVALID_EMAIL_FORMAT` | Giữ nguyên 400; hiển thị lỗi định dạng email chuẩn. |
| `400 Bad Request` | `MALFORMED_FORWARDED_IP` | `InternalForwardingErrorResponseSchema` | **500** | `INTERNAL_ERROR` | Lỗi cấu hình IP chuyển tiếp giữa BFF và Identity; che giấu lỗi hạ tầng, log `ERROR`. |
| `401 Unauthorized` | `UNAUTHORIZED_INTERNAL_CALL` | `InternalForwardingErrorResponseSchema` | **500** | `INTERNAL_ERROR` | Lỗi bí mật nội bộ; cấm gửi 401 ra ngoài (tránh nhầm cần đăng nhập), log `ERROR`. |
| `429 Too Many Requests` | `RATE_LIMIT_EXCEEDED` | `RegisterClientErrorResponseSchema` | **429** | `RATE_LIMIT_EXCEEDED` | Giữ nguyên 429; chuyển tiếp nguyên vẹn header `Retry-After`. |
| `400 Bad Request` (hoặc khác) | Không có payload / payload dị thường | Không khớp bất kỳ schema nào | **500** | `INTERNAL_ERROR` | Phản hồi dị thường; fail-safe về HTTP 500 an toàn, log `ERROR` theo metadata allowlist (không log raw body/secrets), không trả 200 giả. |

---

## 4. Kịch bản kiểm chứng 3: Bộ Ca kiểm thử Mật khẩu PWD-001…PWD-004 & Fail-Secure Blocklist

### Mục tiêu
Kiểm chứng phân định ranh giới giữa Wire Schema (giới hạn DoS) và Application Validation (NFC Unicode code points), các trường hợp biên độ dài 14, đúng 15, 128, 129, emoji ngoài BMP, chuỗi NFD dài, và đối khớp blocklist chính xác theo dataset SecLists đã ghim (SC-003, SC-005, PL6).

### Ca 3.1: Ma trận Fixture Mật khẩu Kiểm tra Thực tế

*Ghi chú*: Toàn bộ fixture đã được kiểm chứng đối khớp thực tế bằng script trên snapshot SecLists `10-million-password-list-top-100000.txt` (commit `45499242ec0164c7f91cbcf8bd509404fc0b99f3`, SHA-256 `E30E15FAECC8DB2D3181C3126E3B2C0CD5C187AF10A5E4E83BABFA157EDAB188`).

| Mã ca | Tiêu chí kiểm thử | Giá trị mật khẩu đầu vào | Số code points NFC | Kết quả API mong đợi | Trạng thái Log server |
|---|---|---|---|---|---|
| **PWD-TC-01** | Biên dưới: 14 ký tự code points | `Pass#Word12345` (P-a-s-s-#-W-o-r-d-1-2-3-4-5) | 14 | HTTP 400 Bad Request, mã `PWD_LENGTH_INVALID` | Tuyệt đối không log plaintext |
| **PWD-TC-02** | Biên chuẩn: Đúng 15 code points hợp lệ | `ChuyenTau#2026V` (không nằm trong blocklist) | **15** | HTTP 200 OK (Tiếp nhận thành công) | Tuyệt đối không log plaintext |
| **PWD-TC-03** | Passphrase có khoảng trắng | `chuyen tau cuoi he ve que` | 25 | HTTP 200 OK (Không ép ký tự hoa/ký hiệu) | Tuyệt đối không log plaintext |
| **PWD-TC-04** | Biên trên: Đúng 128 ký tự code points | `A` lặp lại 128 lần | 128 | HTTP 200 OK (Tiếp nhận thành công) | Tuyệt đối không log plaintext |
| **PWD-TC-05** | Vượt biên trên: 129 ký tự code points | `A` lặp lại 129 lần | 129 | HTTP 400 Bad Request, mã `PWD_LENGTH_INVALID` | Tuyệt đối không log plaintext |
| **PWD-TC-06** | Khoảng trắng đầu và cuối (PWD-002) | `   mat khau giu nguyen khoang trang   ` | 38 | HTTP 200 OK (Giữ nguyên khoảng trắng đầu/cuối) | Tuyệt đối không log plaintext |
| **PWD-TC-07** | Ký tự ngoài BMP (Emoji 4-byte) | `Xem phim cuoi tuan 🎬🍿 2026` | **26** | HTTP 200 OK (Đếm đúng 26 code points, 28 UTF-16 units) | Tuyệt đối không log plaintext |
| **PWD-TC-08** | Chuỗi NFD thô 256 ký tự (PL5) | `("e\u0301").repeat(128)` (256 code units NFD thô) | 128 (sau NFC: `é` x 128) | HTTP 200 OK (Lọt wire schema max 1024, hợp lệ sau NFC) | Tuyệt đối không log plaintext |
| **PWD-TC-09** | Thuộc SecLists Blocklist (PWD-004) | `123456789123456789` (có thật trong tệp tại dòng 12960) | 18 | HTTP 400 Bad Request, mã `PASSWORD_IN_BLOCKLIST` | Tuyệt đối không log plaintext |
| **PWD-TC-10** | Thuộc Dataset Nội bộ Tiếng Việt | `matkhau123456789` (m-a-t-k-h-a-u: 7 + 1-9: 9 = 16 code points) | **16** | HTTP 400 Bad Request, mã `PASSWORD_IN_BLOCKLIST` | Tuyệt đối không log plaintext |

### Ca 3.2: Kiểm chứng tính Fail-Secure khi thiếu Dataset Blocklist (PL6)
1. Giả lập cấu hình sai đường dẫn hoặc xóa tệp dataset `10-million-password-list-top-100000.txt`.
2. Khởi động tiến trình Identity Service.
3. **Kết quả mong đợi**: Tiến trình ghi log mức `FATAL: Blocklist dataset file not found or checksum mismatch` và dừng tiến trình (exit code 1). Nếu chạy ở chế độ runtime handler, endpoint trả về HTTP 503 `SERVICE_UNAVAILABLE`. Tuyệt đối không tiếp nhận mật khẩu khi thiếu blocklist.

---

## 5. Kịch bản kiểm chứng 4: Tương thích Dữ liệu qua Better Auth Adapter & Luồng Đăng nhập A-03

### Mục tiêu
Kiểm chứng tính tương thích giữa A-01 và cấu hình Better Auth của A-03 thực sự đi qua Better Auth Adapter:
1. Adapter Drizzle (`drizzleAdapter`) truy vấn bản ghi `user` và `account` từ cơ sở dữ liệu do A-01 tạo ra.
2. Ánh xạ trường `account: { fields: { password: "password_hash" } }` đọc đúng chuỗi băm từ cột DB `password_hash` thành thuộc tính `password` của model Account.
3. Hàm verifier `@node-rs/argon2` của Better Auth xác minh thành công mật khẩu NFC chuẩn, mật khẩu NFD tương đương, và từ chối mật khẩu sai dựa trên chuỗi băm do adapter trích xuất.
4. Ca kiểm chứng đối chứng (Negative Mapping Test): Chứng minh rằng nếu cấu hình mapping sai hoặc thiếu mapping, adapter sẽ không lấy được mật khẩu và phép kiểm tra sẽ phát hiện lỗi (chứng minh harness thực sự phụ thuộc vào adapter mapping chứ không phải do truyền chuỗi băm thủ công).
5. Phân định ranh giới rõ ràng: Kiểm tra thuật toán băm vs Kiểm tra ánh xạ adapter vs Kiểm tra luồng đăng nhập toàn diện A-03 (A-01 không cấp session token, không tạo cookie session).

### Các bước thực hiện
1. Đăng ký tài khoản mới qua API A-01 với email `test.vietnamese@example.com` và mật khẩu tiếng Việt nhập dạng NFD (phân rã): `"Đoàn tàu Cát Linh Hà Đông 2026"` (dạng NFD).
2. Database Identity lưu trữ tài khoản nguyên tử vào `users` và `accounts` (cột `password_hash` lưu chuỗi Argon2id băm từ chuỗi đã chuẩn hóa NFC).
3. Khởi tạo instance Better Auth mô phỏng đúng cấu hình adapter và verifier dự kiến của A-03:
   ```ts
   import { betterAuth } from "better-auth";
   import { drizzleAdapter } from "better-auth/adapters/drizzle";
   import argon2 from "@node-rs/argon2";
   import assert from "node:assert";

   // 1. Cấu hình instance Better Auth với Drizzle adapter và mapping cột password_hash
   const authA03 = betterAuth({
     database: drizzleAdapter(testDb, {
       provider: "pg",
       schema: { user: usersTable, account: accountsTable },
     }),
     account: {
       fields: { password: "password_hash" }, // Ánh xạ thuộc tính model 'password' sang cột DB 'password_hash' của A-01
     },
     emailAndPassword: {
       enabled: true,
       password: {
         verify: async ({ password, hash }) => {
           // Verifier của Better Auth chuẩn hóa Unicode NFC trước khi verify Argon2id
           return await argon2.verify(hash, password.normalize('NFC'));
         },
       },
     },
   });

   // Trích xuất context runtime chứa adapter chính thức của Better Auth
   const ctxA03 = await authA03.$context;

   // =========================================================================
   // CẤP ĐỘ 2: KIỂM THỬ ÁNH XẠ ADAPTER (Adapter Mapping Test)
   // =========================================================================
   
   // Bước A: Tìm user qua adapter của Better Auth từ email đã đăng ký
   const registeredEmail = "test.vietnamese@example.com";
   const userRecord = await ctxA03.adapter.findOne<{ id: string; email: string }>({
     model: "user",
     where: [{ field: "email", value: registeredEmail }],
   });
   assert.ok(userRecord, "Better Auth adapter phải tìm thấy bản ghi user do A-01 tạo");

   // Bước B: Tìm credential account qua adapter của Better Auth dựa trên user.id và providerId
   const accountRecord = await ctxA03.adapter.findOne<{
     id: string;
     userId: string;
     providerId: string;
     password?: string;
   }>({
     model: "account",
     where: [
       { field: "userId", value: userRecord.id },
       { field: "providerId", value: "credential" },
     ],
   });
   assert.ok(accountRecord, "Better Auth adapter phải tìm thấy bản ghi credential account");

   // Bước C: Chứng minh adapter đã ánh xạ thành công cột DB 'password_hash' thành thuộc tính 'accountRecord.password'
   assert.ok(
     accountRecord.password,
     "Thuộc tính accountRecord.password bắt buộc phải tồn tại thông qua cấu hình mapping 'password_hash'"
   );
   assert.match(
     accountRecord.password,
     /^\$argon2id\$v=19\$m=65536,t=3,p=1\$/,
     "Chuỗi băm lấy qua adapter mapping phải đúng chuẩn MCF của Argon2id (m=64MB, t=3, p=1)"
   );

   // =========================================================================
   // CẤP ĐỘ 1: KIỂM THỬ THUẬT TOÁN VÀ ĐỒNG NHẤT UNICODE (Verifier Algorithm & NFC/NFD Test)
   // Chuỗi băm được trích xuất TỰ ĐỘNG qua adapter (TUYỆT ĐỐI KHÔNG truyền thủ công)
   // =========================================================================
   const hashFromAdapter = accountRecord.password;

   // Ca 4.1: Nhập đúng mật khẩu ở dạng NFC chuẩn
   const isNfcValid = await authA03.options.emailAndPassword.password.verify({
     password: "Đoàn tàu Cát Linh Hà Đông 2026".normalize('NFC'),
     hash: hashFromAdapter,
   });
   assert.strictEqual(isNfcValid, true, "Xác minh thành công với mật khẩu NFC chuẩn");

   // Ca 4.2: Nhập mật khẩu ở dạng NFD tương đương (spec PWD-002 / US1 Scenario 1)
   const isNfdValid = await authA03.options.emailAndPassword.password.verify({
     password: "Đoàn tàu Cát Linh Hà Đông 2026".normalize('NFD'),
     hash: hashFromAdapter,
   });
   assert.strictEqual(isNfdValid, true, "Xác minh thành công với mật khẩu NFD tương đương sau khi verifier chuẩn hóa NFC");

   // Ca 4.3: Nhập sai mật khẩu
   const isWrongValid = await authA03.options.emailAndPassword.password.verify({
     password: "Sai mat khau hoan toan 2026",
     hash: hashFromAdapter,
   });
   assert.strictEqual(isWrongValid, false, "Từ chối xác thực khi nhập sai mật khẩu");

   // =========================================================================
   // CẤP ĐỘ 2 (MỞ RỘNG): CA ĐỐI CHỨNG PHÁT HIỆN LỖI KHI CẤU HÌNH MAPPING SAI (Negative Mapping Test)
   // Chứng minh kịch bản kiểm thử bắt buộc phải phát hiện lỗi nếu mapping sai, không thể pass giả tạo
   // =========================================================================
   const brokenAuth = betterAuth({
     database: drizzleAdapter(testDb, {
       provider: "pg",
       schema: { user: usersTable, account: accountsTable },
     }),
     // Cố tình cấu hình sai tên cột: tìm 'invalid_column' thay vì 'password_hash'
     account: {
       fields: { password: "invalid_column" },
     },
     emailAndPassword: { enabled: true },
   });
   const brokenCtx = await brokenAuth.$context;

   let detectedMappingError = false;
   try {
     const brokenAccount = await brokenCtx.adapter.findOne<{ password?: string }>({
       model: "account",
       where: [{ field: "userId", value: userRecord.id }],
     });
     // Nếu câu lệnh SQL không ném lỗi thì thuộc tính password bắt buộc phải là undefined
     if (!brokenAccount || brokenAccount.password === undefined) {
       detectedMappingError = true;
     }
   } catch {
     // Database ném lỗi do không tồn tại cột 'invalid_column' -> Bắt lỗi mapping thành công
     detectedMappingError = true;
   }
   assert.strictEqual(
     detectedMappingError,
     true,
     "Harness phải bắt được lỗi khi cấu hình mapping adapter sai, chứng minh phép kiểm không chạy mù quáng"
   );
   ```

4. **Kết quả mong đợi & Phân định Ranh giới**:
   - Toàn bộ các assertion đều đạt: Adapter tìm thấy user, tìm thấy account, ánh xạ đúng `password_hash`, verifier xác minh đúng NFC/NFD/wrong password, và ca mapping sai phát hiện lỗi chính xác.
   - **Phân định ranh giới (Level 3 - Scope Boundary)**: Phép kiểm tra này xác nhận tính tương thích tầng dữ liệu và adapter của A-01 với cấu hình dự kiến của A-03; **KHÔNG thực hiện gọi luồng đăng nhập toàn diện A-03 (`signIn.email`)**, không cấp session token, không tạo cookie session.

---

## 6. Kịch bản kiểm chứng 5: Pipeline Outbox CDC, Kafka KRaft, DLQ và Reconciliation Audit

### Mục tiêu
Kiểm chứng sự kiện outbox `CUSTOMER_REGISTERED` version `v1` được Debezium CDC chuyển vào Kafka topic `identity.customer-registered`, Cinema Core tiêu thụ idempotent ghi nhận `points_balance = 0.00` kiểu `DECIMAL(10,2)`, xử lý lỗi đẩy DLQ khi hết retry, và đối soát bù đắp qua Reconciliation Audit Job.

### Ca 5.1: Tiêu thụ bình thường và Idempotent Replay
1. Sau khi Kịch bản 1 hoàn tất, kiểm tra Kafka topic `identity.customer-registered`:
   - Xác nhận có tin nhắn chứa payload `CustomerRegisteredEvent` với `userId` và `eventId` UUID canonical.
2. Consumer của Cinema Core fetch tin nhắn và thực thi insert vào `loyalty_members`:
   ```sql
   SELECT user_id, member_code, current_tier, points_balance, status FROM loyalty_members WHERE user_id = :userId;
   ```
   $\rightarrow$ Trả về 1 bản ghi: `current_tier = 'BASIC'`, `points_balance = 0.00` (kiểu `DECIMAL(10,2)` có 2 số lẻ), `status = 'ACTIVE'`.
3. Giả lập Kafka phát lại cùng tin nhắn trên (replay event):
   - Câu lệnh `ON CONFLICT (user_id) DO NOTHING` được kích hoạt.
   - Bảng `loyalty_members` vẫn giữ nguyên 1 bản ghi duy nhất, không lỗi.

### Ca 5.2: Xử lý lỗi kéo dài, chuyển vào DLQ và Điều kiện Commit Offset
1. Giả lập database Cinema Core gặp sự cố kéo dài (khóa bảng).
2. Consumer của Core retry 5 lần thất bại liên tiếp với exponential backoff.
3. Consumer xuất bản tin nhắn lỗi sang topic DLQ `identity.customer-registered.dlq` với `acks=all`.
4. **Kiểm chứng xác nhận offset**: Chỉ sau khi broker DLQ phản hồi xác nhận tin nhắn DLQ đã được lưu bền vững, consumer mới commit source offset trên topic gốc.
5. **Kiểm chứng khi DLQ publish thất bại**: Nếu broker DLQ lỗi, consumer **không commit source offset**, dừng xử lý partition (halt) và kích hoạt cảnh báo Alert P1.
6. **Kiểm chứng Crash sau DLQ Ack trước Source Offset Commit**: Khi consumer khởi động lại, fetch lại tin nhắn từ offset chưa commit, gửi lại vào DLQ (deduplicate an toàn qua message key `eventId`), sau đó commit source offset.

### Ca 5.3: Kịch bản A-02 Hoàn tất nhưng Consumer Bị trễ, Core Phục hồi (Kiểm tra Idempotency)
1. Khách hàng đăng ký tài khoản (A-01) và hoàn tất xác minh email (A-02) trong 10 giây.
2. Consumer của Cinema Core bị ngắt kết nối trong 15 phút.
3. Giả lập một bản ghi hội viên đã tồn tại trước (dùng làm fixture kiểm chứng cạnh tranh / idempotency).
4. Khi Consumer Core phục hồi và xử lý backlog tin nhắn trên Kafka:
   - Thực thi `INSERT INTO loyalty_members ... ON CONFLICT (user_id) DO NOTHING`.
   - Câu lệnh an toàn bỏ qua, không gây lỗi, bảo đảm **100% không tạo trùng lặp bản ghi hội viên**.

### Ca 5.4: Đối soát bù đắp qua Reconciliation Audit Job
1. Giả lập một tài khoản `users` được tạo trong Identity Service cách đây 2 giờ nhưng outbox event bị mất do sự cố mạng.
2. Khởi chạy Reconciliation Audit Job của Cinema Core:
   - Core gọi internal API `GET /api/v1/internal/users/reconciliation?created_before=...` do Identity cung cấp qua VPC.
   - Core phát hiện tài khoản chưa có bản ghi trong bảng `loyalty_members`.
   - Core tự động chèn bản ghi hội viên bổ sung với `points_balance = 0.00`.
3. Kiểm tra database Cinema Core: Tài khoản đã được bù đắp hồ sơ hội viên thành công mà không cần gọi SQL chéo service.

---

## 7. Kịch bản kiểm chứng 6: Ma trận A-02 Ba Trạng thái (Anti-enumeration)

### Mục tiêu
Xác thực giao diện, HTTP status code (200 OK), payload JSON và trạng thái bộ 3 nút điều hướng không để lộ sự tồn tại của email trong cả 3 tình huống của A-02 (PL8).

| Tình huống A-02 nội bộ | Nhánh Email Mới | Nhánh Email Đã Tồn Tại | Đánh giá Đồng nhất Anti-enumeration |
|---|---|---|---|
| **Tình huống 1**: A-02 hoạt động bình thường, email gửi thành công | HTTP 200, thông điệp trung tính chuẩn hóa. Bộ 3 nút hiển thị; nút "Gửi lại" kích hoạt có cooldown 60s. | HTTP 200, thông điệp trung tính giống hệt. Bộ 3 nút hiển thị; nút "Gửi lại" kích hoạt có cùng cooldown 60s. | **Đồng nhất 100%**: Không để lộ email tồn tại qua phản hồi API hay UI controls. |
| **Tình huống 2**: A-02 chưa triển khai (stub / mock) | HTTP 200, thông điệp trung tính chuẩn hóa. Nút "Gửi lại" tạm khóa kèm nhãn "Tính năng gửi lại đang chuẩn bị". | HTTP 200, thông điệp trung tính giống hệt. Nút "Gửi lại" cũng tạm khóa kèm cùng nhãn "Tính năng gửi lại đang chuẩn bị". | **Đồng nhất 100%**: Tuyệt đối không bên nào khẳng định email đã gửi vào hộp thư. |
| **Tình huống 3**: A-02 lỗi chuyển phát (mail server down) | HTTP 200, thông điệp trung tính chuẩn hóa. Nút "Gửi lại" hiển thị bình thường có cooldown (outbox retry nền). | HTTP 200, thông điệp trung tính giống hệt. Nút "Gửi lại" hiển thị bình thường có cooldown giống hệt nhánh mới. | **Đồng nhất 100%**: Sự cố gửi mail nền không làm thay đổi phản hồi đăng ký công khai. |

---

## 8. Kịch bản kiểm chứng 7: Xử lý Lỗi Hệ thống và Mất kết nối Trung thực (F4)

### Mục tiêu
Kiểm chứng 3 trạng thái lỗi máy chủ và mất kết nối mạng theo đúng yêu cầu F4, bảo đảm an toàn dữ liệu và trải nghiệm người dùng trung thực.

### Ca 7.1: Lỗi xác định trước Commit (Server còn phản hồi)
1. Giả lập cơ sở dữ liệu Identity Service bị khóa hoặc timeout trước khi câu lệnh `COMMIT` được thực thi.
2. Gửi yêu cầu đăng ký từ client.
3. **Kết quả mong đợi**:
   - HTTP Status: `HTTP/1.1 500 Internal Server Error` (hoặc `503 Service Unavailable`).
   - JSON Payload:
     ```json
     {
       "success": false,
       "code": "INTERNAL_ERROR",
       "message": "Hệ thống đang bận hoặc gặp sự cố xử lý, vui lòng thử lại sau ít phút."
     }
     ```
   - Kiểm tra Database: Không có bất kỳ bản ghi nào được ghi vào `users`, `accounts`, `user_role_assignments`, `outbox_events` (toàn bộ rollback sạch sẽ).

### Ca 7.2: Commit thành công nhưng Mất phản hồi mạng (Network drop after commit)
1. Giả lập sự cố mạng: Database Identity đã commit thành công cả 4 bảng, nhưng kết nối mạng giữa server và client bị đứt đột ngột khi server đang gửi phản hồi HTTP 200.
2. Client không nhận được phản hồi và tự động hoặc do người dùng bấm gửi lại (retry) với cùng email.
3. **Kết quả mong đợi**:
   - Nhờ cơ chế Anti-enumeration (Phương án B), yêu cầu retry rơi vào nhánh email đã tồn tại.
   - Máy chủ rollback an toàn nhánh email trùng và trả về `HTTP 200 OK` với thông điệp tiếp nhận trung tính.
   - **Kiểm tra Database**: Không tạo tài khoản trùng, không cấp vai trò trùng, không sinh thêm `outbox_events` lặp. Toàn bộ dữ liệu nhất quán 100%.

### Ca 7.3: Mất kết nối ngay tại thời điểm Commit, Kết quả không rõ (Network drop during commit)
1. Giả lập client bị rớt mạng hoàn toàn (Network timeout / TCP reset / Connection refused).
2. **Hành vi phía Client**: Giao diện hiển thị thông báo lỗi mạng trung thực ("Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền và thử lại"), không hiển thị lỗi 5xx giả mạo.
3. Người dùng bấm thử lại khi mạng phục hồi:
   - Nếu commit trước đó đã hoàn tất: Request đi vào Ca 7.2 (trả về HTTP 200 tiếp nhận trung tính, dữ liệu an toàn).
   - Nếu commit trước đó đã bị rollback: Request đi vào Happy Path đăng ký mới bình thường (tạo tài khoản thành công).
   - Cả hai trường hợp đều bảo đảm an toàn và không gây mâu thuẫn trạng thái.

---

## 9. Kịch bản kiểm chứng 8: Khả năng tiếp cận & Trợ năng (NFR-ACC-01 §9.13.2 Bộ tham chiếu A)

### Mục tiêu
Kiểm chứng khả năng tiếp cận toàn diện trên cấu hình chuẩn đã duyệt (SC-006).

1. **Customer Web trên Windows**:
   - Sử dụng bàn phím tuần tự (Tab, Shift+Tab, Enter, Space): Di chuyển mượt mà qua các trường Họ tên, Email, Mật khẩu, Nút chuyển đổi ẩn/hiện mật khẩu, Checkbox điều khoản và Nút submit.
   - Mở Microsoft Edge + Windows Narrator: Đọc to nhãn từng trường, thông báo lỗi inline (aria-live polite) khi nhập sai, và thông báo trạng thái của nút ẩn/hiện mật khẩu ("Ẩn mật khẩu" / "Hiển thị mật khẩu").
   - Kiểm tra tương phản màu sắc đạt $\ge 4.5:1$ theo Ferrari Dark Cinema (`#FFFFFF` trên `#181818`, `#DA291C` nổi bật).
2. **Customer Web trên iPhone 11 Pro Max thật**:
   - Mở Safari, bật VoiceOver: Thao tác vuốt chuyển focus tuần tự, không bị focus trap; nhãn nút và thông báo tiếp nhận trung tính được đọc rõ ràng.
3. **Customer Mobile (iOS trên iPhone 11 Pro Max thật & Android trên Emulator)**:
   - iOS: Kiểm tra bàn phím ảo hiển thị gợi ý mật khẩu mạnh từ iCloud Keychain (`textContentType="newPassword"`).
   - Android: Kiểm tra Google Password Manager tự động điền gợi ý mật khẩu; kiểm tra TalkBack đọc đúng vai trò `button` và nhãn trợ năng.
   - *Công bố khoảng trống thiết bị*: Giữ nguyên công bố khoảng trống "hiệu năng Android trên máy thật chưa kiểm chứng" theo NFR-PERF-02.
