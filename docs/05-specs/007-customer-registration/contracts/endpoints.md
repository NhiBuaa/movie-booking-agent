# API Contract Specification: Customer Registration (A-01)

**Feature**: `007-customer-registration`  
**Endpoints**:
- Web BFF Endpoint: `POST /api/auth/register` (tại `apps/customer-web`)
- Cinema Identity Service Backend Endpoint: `POST /api/v1/identity/register` (tại `services/identity-service`)
- Cinema Identity Service Internal Endpoints:
  + `GET /api/v1/internal/users/:id` (dành cho đề xuất On-demand Core Provisioning tại use case B-02)
  + `GET /api/v1/internal/users/reconciliation` (dành cho Cinema Core Reconciliation Audit Job)
**Consumer**: `apps/customer-web` (BFF & client form) và `apps/customer-mobile` (Expo / React Native)  
**Provider**: `services/identity-service` (Fastify + Better Auth core engine & Drizzle ORM)

---

## 1. HTTP Endpoint: Đăng ký tài khoản khách hàng

### URL & Định tuyến
- Client Web gọi vào BFF: `POST /api/auth/register`
- Client Mobile / Web BFF gọi vào Backend Identity: `POST /api/v1/identity/register`

### Headers

| Header Name | Type | Required | Description |
|---|---|---|---|
| `Content-Type` | `string` | **Yes** | Bắt buộc là `application/json` |
| `Accept` | `string` | **Yes** | `application/json` |
| `X-Original-Client-IP` | `string` | Optional | Địa chỉ IP thực của client do Edge Reverse Proxy (Cloudflare/ALB) gán và Next.js BFF chuyển tiếp trong mạng nội bộ VPC (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.1/32`). Bắt buộc là chuỗi đơn trị, định dạng IPv4/IPv6 hợp lệ (`net.isIP`). Phải đi kèm header bí mật `X-Internal-Service-Key`. Nếu kết nối từ peer ngoài CIDR tin cậy, header này bị bỏ qua hoàn toàn (chống giả mạo). Nếu peer thuộc CIDR nhưng secret sai/thiếu, trả về HTTP 401 `UNAUTHORIZED_INTERNAL_CALL`. Nếu IP sai định dạng, trả về HTTP 400 `MALFORMED_FORWARDED_IP`. |
| `X-Internal-Service-Key` | `string` | Optional | Khóa bí mật nội bộ (shared secret) giữa Web BFF và Identity Service để xác thực nguồn chuyển tiếp `X-Original-Client-IP`. Bắt buộc cấu hình chuỗi mạnh tối thiểu 32 ký tự tại `INTERNAL_SERVICE_KEY`; xác thực bằng `crypto.timingSafeEqual`. Tuyệt đối cấm so sánh khi thiếu giá trị (`undefined === undefined`). |
| `X-Test-Client-IP` | `string` | Optional | Giả lập IP phục vụ kiểm thử rate limiting cục bộ. **CHỈ CÓ HIỆU LỰC KHI** `NODE_ENV === 'test'` và `ENABLE_TEST_IP_OVERRIDE === 'true'`. Bị loại bỏ hoàn toàn trong Production và Staging. |

*Ghi chú về Idempotency*: Hệ thống không yêu cầu `Idempotency-Key` bắt buộc. Nhánh xử lý email trùng lặp tự nhiên theo Phương án B (Anti-enumeration) bảo đảm an toàn idempotent 100% khi client retry do mất phản hồi mạng ở bước post-commit mà không cần lưu cache payload nhạy cảm.

### Request Body (`CustomerRegisterRequest`)

```json
{
  "fullName": "Nguyễn Văn A",
  "email": "khachhang@example.com",
  "password": "chuyen tau cuoi he ve que",
  "phone": "0912345678"
}
```

- `fullName`: `string`, bắt buộc, độ dài ký tự thô 1–100 ký tự (Wire validation). Tầng Application thực hiện `trim()` và yêu cầu độ dài sau trim $\ge 1$ (nếu chỉ chứa khoảng trắng $\rightarrow$ lỗi `FULL_NAME_REQUIRED`).
- `email`: `string`, bắt buộc. Ranh giới kiểm tra (PL5): Wire schema chỉ kiểm tra chuỗi thô có độ dài 1–254 ký tự (chấp nhận khoảng trắng ngoài rìa như `"  Test.User@Example.COM  "` theo spec US2 Scenario 2). Tầng Application thực hiện `trim()` và chuyển về chữ thường (`toLowerCase()`), sau đó kiểm tra định dạng email canonical hòa giải chuẩn xác với Validator mặc định của Better Auth (v1.1.x+) và Zod standard email validator (`CANONICAL_EMAIL_REGEX`: loại bỏ hoàn toàn địa chỉ có dấu chấm ở đầu, cuối, hoặc liên tiếp trong local-part như `.alice@example.com`, `alice..bob@example.com`, `alice.@example.com`, đồng thời từ chối ký tự `!` như `a!b@example.com` và TLD 1 ký tự như `a@example.c`; nếu sai $\rightarrow$ lỗi `INVALID_EMAIL_FORMAT`). Nhánh đăng ký mới và nhánh trùng lặp đều dùng chung quy tắc chuẩn hóa này, bảo đảm 100% email tiếp nhận đều đi qua an toàn luồng đăng nhập A-03.
- `password`: `string`, bắt buộc. Ranh giới kiểm tra: Wire schema giới hạn độ dài chuỗi thô tối đa 1024 ký tự (chống DoS/memory flood), sau đó tầng Application chuẩn hóa Unicode NFC và kiểm tra độ dài 15–128 Unicode code points theo PWD-001/PWD-002 (giữ nguyên khoảng trắng đầu/cuối), kiểm tra blocklist PWD-004 bắt buộc (fail-secure).
- `phone`: `string`, tùy chọn theo BR-02; nếu cung cấp phải khớp regex `VIETNAMESE_PHONE_REGEX` (`^(0|\+84)[35789][0-9]{8}$`). Cho phép chuỗi rỗng `""` hoặc `undefined`.

---

## 2. Response Status Codes & Contracts

### 2.1. Phản hồi thành công / Tiếp nhận trung tính (HTTP 200 OK)

Áp dụng đồng nhất 100% cho **cả hai trường hợp**:
1. Đăng ký tài khoản mới thành công (chưa từng có tài khoản).
2. Đăng ký với email đã tồn tại trong hệ thống (Anti-enumeration theo Phương án B đã duyệt).

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
```

```json
{
  "success": true,
  "message": "Yêu cầu đăng ký đã được tiếp nhận. Nếu địa chỉ email hợp lệ và chưa có tài khoản, hướng dẫn xác minh tài khoản sẽ được gửi đến hộp thư của bạn. Nếu bạn đã có tài khoản từ trước, vui lòng đăng nhập hoặc sử dụng chức năng khôi phục mật khẩu."
}
```

*Lưu ý an toàn tuyệt đối*:
- Tuyệt đối không trả về bất kỳ trường nào như `userId`, `emailExists`, `token`, hay cờ nội bộ giúp phân biệt hai nhánh.
- Tuyệt đối **không cấp header `Set-Cookie`** (không cấp session token tự động theo Phương án A đã duyệt - FR-012). Người dùng duy trì trạng thái unauthenticated sau khi đăng ký.
- Cân bằng thời gian phản hồi giữa hai nhánh bằng Dummy Hash để chống side-channel timing attack.

---

### 2.2. Phản hồi lỗi Client (HTTP 400 Bad Request)

Xảy ra khi dữ liệu đầu vào không hợp lệ hoặc mật khẩu nằm trong danh sách mật khẩu phổ biến/đã lộ (PWD-004).

**Trường hợp 1: Dữ liệu không hợp lệ (Lỗi độ dài mật khẩu PWD-001)**:
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
```

```json
{
  "success": false,
  "code": "PWD_LENGTH_INVALID",
  "message": "Mật khẩu phải có độ dài từ 15 đến 128 ký tự (sau khi chuẩn hóa Unicode NFC)."
}
```

**Trường hợp 2: Họ và tên chỉ chứa khoảng trắng**:
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
```

```json
{
  "success": false,
  "code": "FULL_NAME_REQUIRED",
  "message": "Họ và tên không được chỉ chứa khoảng trắng."
}
```

**Trường hợp 3: Định dạng email không hợp lệ sau chuẩn hóa**:
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
```

```json
{
  "success": false,
  "code": "INVALID_EMAIL_FORMAT",
  "message": "Địa chỉ email không đúng định dạng chuẩn sau khi chuẩn hóa."
}
```

**Trường hợp 4: Mật khẩu nằm trong blocklist (PWD-004)**:
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
```

```json
{
  "success": false,
  "code": "PASSWORD_IN_BLOCKLIST",
  "message": "Mật khẩu này quá phổ biến hoặc đã từng bị lộ. Vui lòng chọn mật khẩu khác an toàn hơn."
}
```

---

### 2.3. Phản hồi vượt ngưỡng tần suất (HTTP 429 Too Many Requests)

Xảy ra khi một IP hoặc email gửi vượt quá 5 yêu cầu trong vòng 15 phút (FR-015, Fixed Window Counter).
Thao tác kiểm tra quota trên Redis được thực thi nguyên tử qua Lua script (kết hợp `INCR` và `EXPIRE 900` trong cùng một đơn vị công việc, loại bỏ hoàn toàn khoảng lỗi tạo key vĩnh viễn).
Header `Retry-After` phản ánh chính xác số giây còn lại cho đến khi kết thúc cửa sổ 15 phút hiện tại: `Math.max(1, Math.ceil(((window_timestamp + 1) * 900000 - Date.now()) / 1000))`.

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json; charset=utf-8
Retry-After: 742
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
```

```json
{
  "success": false,
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Bạn đã gửi quá nhiều yêu cầu đăng ký từ địa chỉ này. Vui lòng thử lại sau 15 phút."
}
```

*Lưu ý khi Redis gặp sự cố*: Hệ thống tự động kích hoạt cơ chế Degraded Local In-Memory Fallback qua LRU cache trên từng tiến trình (giới hạn 5 req/15 phút/IP), ghi log mức `ERROR`, kích hoạt metric Prometheus và phát Alert P2 để đội ngũ On-call xử lý khôi phục Redis.

---

### 2.4. Phản hồi lỗi Hệ thống máy chủ (HTTP 500 / 503)

Xảy ra khi database Identity ngắt kết nối hoặc có sự cố máy chủ trước khi transaction commit (FR-021).

**Trường hợp 1: Lỗi nội bộ máy chủ (HTTP 500)**:
```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json; charset=utf-8
```

```json
{
  "success": false,
  "code": "INTERNAL_ERROR",
  "message": "Hệ thống đang bận hoặc gặp sự cố xử lý, vui lòng thử lại sau ít phút."
}
```

**Trường hợp 2: Dịch vụ tạm thời không khả dụng / Thiếu dataset Blocklist Fail-Secure (HTTP 503)**:
```http
HTTP/1.1 503 Service Unavailable
Content-Type: application/json; charset=utf-8
```

```json
{
  "success": false,
  "code": "SERVICE_UNAVAILABLE",
  "message": "Dịch vụ đăng ký tạm thời không khả dụng. Vui lòng thử lại sau."
}
```

*Lưu ý an toàn*:
- Tuyệt đối không trả về stack trace, thông tin chuỗi kết nối DB, hoặc exception class trong payload response.

---

### 2.5. Phản hồi lỗi Giao tiếp Nội bộ BFF – Identity (HTTP 400 / HTTP 401)

Dành riêng cho ranh giới mạng nội bộ VPC giữa Next.js Web BFF và Identity Service backend:

**Trường hợp 1: Lỗi xác thực khóa bí mật nội bộ (HTTP 401 Unauthorized)**:
Phát sinh khi Web BFF gửi request từ CIDR nội bộ nhưng thiếu header `X-Internal-Service-Key` hoặc khóa không khớp với biến môi trường `INTERNAL_SERVICE_KEY`.
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
```

```json
{
  "success": false,
  "code": "UNAUTHORIZED_INTERNAL_CALL",
  "message": "Khóa dịch vụ nội bộ không hợp lệ hoặc bị thiếu."
}
```

**Trường hợp 2: Lỗi định dạng IP chuyển tiếp (HTTP 400 Bad Request)**:
Phát sinh khi header `X-Original-Client-IP` do BFF gửi sang bị lỗi cấu trúc (mảng giá trị, chứa dấu phẩy, hoặc sai cú pháp IPv4/IPv6).
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
```

```json
{
  "success": false,
  "code": "MALFORMED_FORWARDED_IP",
  "message": "Địa chỉ IP chuyển tiếp không đúng định dạng đơn trị IPv4 hoặc IPv6."
}
```

**Quy tắc Phân nhánh và Xử lý Phản hồi tại Next.js Web BFF (FR-021)**:

Next.js Web BFF phân định phản hồi từ Identity Service dựa trên **CẢ HTTP Status VÀ Payload/Schema/Code** (tuyệt đối không chỉ lọc theo status code đơn thuần để tránh gom nhầm lỗi nhập liệu của người dùng thành lỗi máy chủ):

1. **Nhánh Lỗi Giao tiếp Nội bộ BFF – Identity**:
   - `HTTP 401 Unauthorized` kèm payload `code: "UNAUTHORIZED_INTERNAL_CALL"`.
   - `HTTP 400 Bad Request` kèm payload `code: "MALFORMED_FORWARDED_IP"`.
   - *Xử lý tại BFF*:
     * Ghi log nội bộ mức `ERROR` có cấu trúc kèm thông tin sự cố hạ tầng/secret.
     * **BFF TUYỆT ĐỐI KHÔNG chuyển tiếp HTTP 401 ra trình duyệt**: Tránh gây hiểu nhầm cho khách hàng là phiên làm việc hết hạn hoặc yêu cầu đăng nhập.
     * Chuyển đổi thành **`HTTP 500 Internal Server Error`** công khai:
       ```json
       {
         "success": false,
         "code": "INTERNAL_ERROR",
         "message": "Hệ thống đang bận hoặc gặp sự cố xử lý, vui lòng thử lại sau ít phút."
       }
       ```
     * Tuân thủ FR-021: Lỗi trước commit báo lỗi máy chủ trung thực (không trả HTTP 200 tiếp nhận giả), đồng thời che giấu hoàn toàn secret, mã lỗi nội bộ và cấu trúc mạng riêng.

2. **Nhánh Lỗi Nhập liệu Người dùng (Client Validation Errors)**:
   - `HTTP 400 Bad Request` với payload khớp `RegisterClientErrorResponseSchema` (các mã: `INVALID_EMAIL_FORMAT`, `PWD_LENGTH_INVALID`, `PASSWORD_IN_BLOCKLIST`, `PASSWORD_CONFIRM_MISMATCH`, `FULL_NAME_REQUIRED`, v.v.).
   - *Xử lý tại BFF*: **Giữ nguyên HTTP 400 Bad Request** và chuyển tiếp payload nguyên vẹn cùng các trường công khai (`code`, `message`, `fieldErrors` nếu có) về trình duyệt để giao diện hiển thị thông báo hướng dẫn người dùng chỉnh sửa.

3. **Nhánh Giới hạn Tần suất (Rate Limiting)**:
   - `HTTP 429 Too Many Requests` với payload khớp `RegisterClientErrorResponseSchema` (`code: "RATE_LIMIT_EXCEEDED"`).
   - *Xử lý tại BFF*: **Giữ nguyên HTTP 429 Too Many Requests**, chuyển tiếp payload lỗi và bảo toàn header `Retry-After: <giây>` về trình duyệt.

4. **Nhánh Phản hồi Dị thường / Không đúng Schema / Mâu thuẫn Status-Code**:
   - Phát sinh khi Identity Service trả về thân rỗng, HTML lỗi từ reverse proxy/gateway, mã lỗi không nằm trong hợp đồng Zod, hoặc status code mâu thuẫn với payload code.
   - *Xử lý tại BFF*: Báo lỗi hệ thống an toàn **`HTTP 500 Internal Server Error`** với `code: "INTERNAL_ERROR"`. Ghi log nội bộ mức `ERROR` có cấu trúc **chỉ bao gồm metadata cần thiết theo allowlist**: HTTP status của upstream, correlation ID / request ID đã kiểm tra, phân loại lỗi xác thực schema (ví dụ `schema_validation_failed`, `status_code_mismatch`, `upstream_unreachable`). **Tuyệt đối KHÔNG log raw body/headers, mật khẩu, token, cookie hoặc internal service key; không đưa chúng vào telemetry** (tuân thủ nghiêm ngặt FR-013, SC-005, PWD-006). Tuyệt đối KHÔNG trả HTTP 200 tiếp nhận giả và KHÔNG chuyển tiếp HTTP 401 ra ngoài.

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

## 3. Internal Endpoints (Dành riêng cho Cinema Core qua mạng nội bộ VPC)

### 3.1. Truy vấn tài khoản phục vụ On-demand Provisioning tại B-02 (Đề xuất chờ duyệt tại B-02)

`GET /api/v1/internal/users/:id`

- **Xác thực**: Yêu cầu VPC mTLS hoặc Header `X-Internal-Service-Token: <token>`.
- **Phản hồi HTTP 200 OK**:
  ```json
  {
    "id": "01934abc-1234-7000-8000-0123456789ab",
    "email": "khachhang@example.com",
    "fullName": "Nguyễn Văn A",
    "phone": "0912345678",
    "emailVerified": true,
    "role": "CUSTOMER",
    "createdAt": "2026-11-21T15:20:00.000Z"
  }
  ```
- **Phản hồi HTTP 404 Not Found**: Tài khoản không tồn tại.

### 3.2. Đối soát tài khoản phục vụ Reconciliation Audit Job

`GET /api/v1/internal/users/reconciliation`

- **Query Parameters**:
  + `limit`: số lượng bản ghi mỗi trang (mặc định 100, tối đa 500).
  + `cursor`: UUID của bản ghi cuối cùng của trang trước.
  + `created_before`: ISO 8601 timestamp (ví dụ thời điểm 1 giờ trước).
- **Phản hồi HTTP 200 OK**:
  ```json
  {
    "users": [
      {
        "id": "01934abc-1234-7000-8000-0123456789ab",
        "email": "khachhang@example.com",
        "fullName": "Nguyễn Văn A",
        "phone": "0912345678",
        "createdAt": "2026-11-21T15:20:00.000Z"
      }
    ],
    "nextCursor": "01934abc-1234-7000-8000-0123456789cd"
  }
  ```
