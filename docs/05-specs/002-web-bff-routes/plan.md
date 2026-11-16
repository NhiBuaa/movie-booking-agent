# Implementation Plan: Web BFF Route Handlers

**Branch**: `feat/web-bff-routes` | **Date**: 2026-11-15 | **Last Updated**: 2026-11-16

**Spec Reference**: [docs/05-specs/002-web-bff-routes/spec.md](spec.md)

---

## 1. Tóm tắt kế hoạch (Summary)

Thiết lập tầng **Backend for Frontend (BFF Route Handlers)** trong `apps/web` (Next.js 16 App Router) đóng vai trò làm trạm trung gian chuẩn hóa, điều phối dữ liệu giữa trình duyệt web và hệ thống giao dịch cốt lõi `services/cinema-core`, sử dụng 100% hợp đồng dữ liệu chuẩn từ `@platform/contracts`.

> [!NOTE]
> **Hiện trạng kiến trúc:** Dịch vụ backend `services/cinema-core` chưa được triển khai runtime thực tế; biến môi trường `CINEMA_CORE_URL` chưa được đấu nối. Tầng BFF hiện vận hành bằng các adapter in-memory mô phỏng có độ trung thực cao (`catalog-adapter.ts`, `hold-adapter.ts`, `order-adapter.ts`, `crypto-utils.ts`), tuân thủ chặt chẽ ranh giới thẩm quyền được định nghĩa trong [ADR-0001](../../06-decisions/0001-monorepo-platform-and-microservices-boundaries.md).

---

## 2. Bối cảnh kỹ thuật & Giới hạn (Technical Context & Boundaries)

- **Framework**: Next.js 16.4.5 App Router + React 19.3.1 + TypeScript 6.0+.
- **Giao thức API**: RESTful JSON API qua Next.js Server Route Handlers (`src/app/api/...`).
- **Thư viện hợp đồng**: `@platform/contracts` (liên kết qua npm workspace và tsconfig path mapping).
- **Kiểm thử tự động**: Node.js native test runner (`node --test "tests/*.test.ts"`).
- **Ràng buộc kiểm thử**: Bảo toàn 100% các bài kiểm thử tự động của monorepo (`npm run test:all`).
- **Giới hạn lưu trữ**: Toàn bộ trạng thái ghế giữ (`holdsStore`), đơn hàng (`ordersStore`), và vé (`ticketsStore`) được lưu trữ trong bộ nhớ tiến trình (Process Memory Maps).
- **Giới hạn định danh**: Header `x-user-email` đóng vai trò định danh ngữ cảnh mô phỏng, chưa phải token xác thực phiên hoàn chỉnh.
- **Biến môi trường bảo mật**:
  - `CINEMA_CORE_WEBHOOK_SECRET`: Dùng để ký và xác thực chữ ký HMAC-SHA256 trên webhook payload.
  - `CINEMA_CORE_TICKET_SECRET`: Dùng để ký và xác thực chữ ký HMAC-SHA256 trên E-Ticket QR payload.
  - Khi `NODE_ENV === 'production'`, hàm đọc khóa tương ứng ném `SECURITY_ERROR` nếu thiếu secret. Adapter xác thực webhook/ký vé chuyển lỗi đó thành HTTP 500 `SERVER_CONFIGURATION_ERROR`; không fallback sang khóa phát triển công khai.

---

## 3. Đối chiếu Hiến pháp dự án (Constitution Check)

- [x] **I. Authoritative Cinema Core**: Route Handlers và adapter in-memory mô phỏng các bất biến của Cinema Core; khi backend thật sẵn sàng, BFF đóng vai trò cổng chuyển tiếp (Gateway Proxy).
- [x] **II. Conversational Booking Safety Boundary**: Webhook thanh toán và vé điện tử luôn bắt buộc chữ ký số HMAC-SHA256 xác thực từ Cinema Core secret; không tự xác nhận đơn khi thiếu chữ ký hợp lệ.
- [x] **III. Monorepo Type Safety & Shared Contracts**: Sử dụng trực tiếp các DTOs (`MovieSummaryDto`, `CinemaDetailDto`, `SeatMapDto`, `CreateHoldRequest`, `CreateHoldResponse`, `OrderSummaryDto`, `PaymentWebhookPayload`, `ETicketDto`) từ `@platform/contracts`.
- [x] **IV. Verification Before Completion**: Duy trì bộ test suite tích hợp `tests/bff-route-handlers.test.ts` kiểm chứng toàn bộ API routes, các kịch bản đối soát và kiểm thử hồi quy trước khi công bố hoàn tất.

---

## 4. Cấu trúc tệp hoàn chỉnh (File Structure)

```text
apps/web/
├── package.json                                   # Dependency: "@platform/contracts": "*"
├── tsconfig.json                                  # Path mapping: "@platform/contracts"
├── tests/
│   └── bff-route-handlers.test.ts                 # Test suite kiểm chứng toàn bộ Route Handlers & hồi quy
└── src/
    ├── lib/
    │   └── api-client.ts                          # Client API SDK cho frontend components & chat agent
    ├── server/
    │   ├── response.ts                            # Helper đóng gói jsonSuccess & jsonError
    │   ├── crypto-utils.ts                        # HMAC-SHA256 ký/xác thực Webhook và Ticket QR
    │   ├── catalog-adapter.ts                     # Adapter Phim, Rạp, Suất chiếu & chuẩn hóa Canonical
    │   ├── hold-adapter.ts                        # Adapter giữ ghế (Hold TTL 300s, 1 hold/user, All-or-Nothing)
    │   └── order-adapter.ts                       # Adapter Đơn hàng, Payment attempts, Webhook & Vé QR
    └── app/
        └── api/
            ├── movies/
            │   ├── route.ts                       # GET /api/movies (Tìm kiếm & lọc phim)
            │   └── [id]/route.ts                  # GET /api/movies/:id (Chi tiết phim)
            ├── cinemas/
            │   ├── route.ts                       # GET /api/cinemas (Danh mục cụm rạp)
            │   └── [id]/route.ts                  # GET /api/cinemas/:id (Chi tiết rạp & Object.hasOwn guard)
            ├── showtimes/
            │   └── route.ts                       # GET /api/showtimes (Lịch chiếu theo ngày/rạp)
            ├── seats/
            │   └── route.ts                       # GET /api/seats (Sơ đồ ma trận 64 ghế)
            ├── hold/
            │   └── route.ts                       # POST & DELETE /api/hold (Giữ/hủy ghế 5 phút TTL)
            ├── orders/
            │   └── route.ts                       # POST /api/orders (Tạo đơn hàng, validate combo & tổng tiền)
            ├── payment/
            │   ├── intent/route.ts                # POST /api/payment/intent (Khởi tạo MoMo/VNPAY transaction)
            │   └── webhook/route.ts               # POST /api/payment/webhook (Xác thực HMAC, đối soát & cấp vé)
            └── tickets/
                └── [id]/route.ts                  # GET /api/tickets/:id (Vé điện tử QR kèm chữ ký số)
```

---

## 5. Các module triển khai chi tiết (Implementation Modules)

### Module 1: Server Response Helpers (`src/server/response.ts`)
- **Chức năng:** Chuẩn hóa cấu trúc dữ liệu trả về theo đúng mẫu `@platform/contracts`.
- **Hàm cung cấp:**
  - `jsonSuccess<T>(data: T, status?: number, message?: string): Response`
  - `jsonError(code: string, message: string, status: number, details?: unknown): Response`
- **Tiêu chuẩn:** Đảm bảo header `Content-Type: application/json` và trả về đúng mã trạng thái HTTP.

### Module 2: Tiện ích mật mã học (`src/server/crypto-utils.ts`)
- **Chức năng:** Tạo và kiểm tra chữ ký số HMAC-SHA256 cho giao dịch thanh toán và vé điện tử.
- **Hàm cung cấp:**
  - `buildWebhookCanonicalData(payload: Omit<PaymentWebhookPayload, 'signature'>): string`
  - `signWebhookPayload(payload: Omit<PaymentWebhookPayload, 'signature'>, secret?: string): string`
  - `verifyWebhookSignature(payload: PaymentWebhookPayload, secret?: string): boolean`
  - `buildTicketQrCanonicalData(ticket: Omit<TicketQrPayload, 'signature'>): string`
  - `signTicketQrPayload(ticket: Omit<TicketQrPayload, 'signature'>, secret?: string): string`
  - `verifyTicketQrSignature(qr: TicketQrPayload, secret?: string): boolean`
  - `getCinemaCoreWebhookSecret(): string`
  - `getCinemaCoreTicketSecret(): string`
- **Nguyên tắc bảo mật:** Khi bỏ qua tham số `secret`, hàm dùng khóa môi trường tương ứng. Trong `production`, getter ném `SECURITY_ERROR` nếu thiếu khóa; adapter bắt lỗi và trả HTTP 500 `SERVER_CONFIGURATION_ERROR`.

### Module 3: Catalog & Canonical Showtime Adapter (`src/server/catalog-adapter.ts`)
- **Chức năng:** Cung cấp dữ liệu danh mục phim, cụm rạp, lịch chiếu và ánh xạ suất chiếu chuẩn xác.
- **Hàm cung cấp:**
  - `listMovies(query?: MovieFilterQuery): MovieSummaryDto[]` (lọc theo từ khóa, thể loại, định dạng chuẩn hóa, ngày chiếu chính xác).
  - `getMovieByIdOrSlug(idOrSlug: string): MovieDetailDto | null`
  - `listCinemas(): CinemaDto[]`
  - `getCinemaByIdOrSlug(idOrSlug: string): CinemaDetailDto | null` (bảo vệ chống prototype inheritance bằng `Object.hasOwn`, loại bỏ substring matching).
  - `getShowtimes(query?): DayScheduleDto[]` (so sánh ngày chính xác, chuẩn hóa định dạng).
  - `resolveCanonicalShowtime(showtimeId: string): ShowtimeSlotDetails | null` (chặn alias ghép sai rạp/slot, ánh xạ alias `BK-2026-CHUYENTAU` → `slot-dk-04-1`).
  - `resolveCanonicalCinemaId(rawCinemaId?: string | null): string | null`
  - `normalizeFormatFilter(rawFormat?: string): string | null`

### Module 4: Seat Hold Engine Adapter (`src/server/hold-adapter.ts`)
- **Chức năng:** Quản lý vòng đời giữ ghế tạm thời (Atomic Hold).
- **Hàm cung cấp:**
  - `createSeatHold(req: CreateHoldRequest): CreateHoldResult`:
    - Kiểm tra email bắt buộc (`userEmail`).
    - Thực thi quy tắc **1 người chỉ có 1 hold ACTIVE có hiệu lực** (`USER_ALREADY_HAS_ACTIVE_HOLD` 409).
    - Quy tắc tối đa 6 ghế (`MAX_SEATS_EXCEEDED` 400), Sweetbox cặp đôi (`SWEETBOX_PAIR_REQUIRED` 400), không trùng ghế (`DUPLICATE_SEATS` 400).
    - Nguyên tắc All-or-Nothing (`SEATS_UNAVAILABLE` 409).
    - Thiết lập thời hạn TTL 300 giây (5 phút).
  - `releaseSeatHold(holdId: string, callerEmail?: string): ReleaseHoldResult`:
    - Hủy hold chủ động khi còn `ACTIVE`, giải phóng ghế ngay lập tức.
    - Từ chối hủy khi hold đã chuyển `CONSUMED` (`HOLD_ALREADY_CONSUMED` 409) hoặc sai email sở hữu.
  - `generateStandardSeatMap(showtimeId: string): SeatMapDto | null`:
    - Xuất sơ đồ 64 ghế chuẩn, tính toán ghế `available`, `held`, `reserved` dựa trên thời gian thực.
  - `getHoldById(holdId: string): StoredHold | null`
  - `consumeSeatHold(holdId: string): boolean`: Chuyển trạng thái hold sang `CONSUMED`.

### Module 5: Order, Payment & Webhook Adapter (`src/server/order-adapter.ts`)
- **Chức năng:** Quản lý vòng đời đơn hàng, phiên thanh toán, đối soát webhook và phát hành vé điện tử.
- **Hàm cung cấp:**
  - `createOrder(req: CreateOrderRequest): CreateOrderResult`:
    - Xác minh email người đặt trùng khớp người giữ chỗ (`HOLD_OWNER_MISMATCH` 403).
    - Kiểm tra tính hợp lệ của hold (chưa hết hạn, chưa bị consumed).
    - Kiểm tra an toàn số lượng combo: `0 <= quantity <= 10`, `Number.isSafeInteger` (`INVALID_COMBO_QUANTITY` 400).
    - Kiểm tra an toàn tổng tiền `totalAmount`: `Number.isSafeInteger`, hữu hạn, tối đa 100.000.000 đ (`INVALID_ORDER_AMOUNT` 400).
    - Chỉ gọi `consumeSeatHold` khi toàn bộ dữ liệu hợp lệ.
  - `createPaymentIntent(req: CreatePaymentIntentRequest, callerEmail?: string): CreatePaymentIntentResult`:
    - Route truyền `callerEmail` từ header `x-user-email`; thiếu hoặc sai email chủ sở hữu trả 403 `FORBIDDEN`.
    - Quản lý các lần thử thanh toán (`paymentAttempts`).
    - Tái sử dụng `transactionId` nếu cùng phương thức đang chờ; sinh `transactionId` mới khi đổi phương thức hoặc retry sau thất bại.
    - Route trả HTTP 201 với `ApiResponse<PaymentIntentResponse>`: `transactionId`, `bookingId`, `paymentMethod`, `amount`, `qrCodeUrl`, `deepLinkUrl`, `expiresAt` trong `data`.
  - `processPaymentWebhook(payload: PaymentWebhookPayload): ProcessPaymentWebhookResult`:
    - Nhận chữ ký HMAC-SHA256 từ `payload.signature`; thiếu hoặc sai chữ ký trả 400 `INVALID_SIGNATURE`.
    - Từ chối đơn chưa từng khởi tạo intent (`TRANSACTION_NOT_INITIALIZED` 400).
    - Đối chiếu `transactionId` với payment attempt đã đăng ký (`TRANSACTION_ID_MISMATCH` 400).
    - Đối soát số tiền (`AMOUNT_MISMATCH` 400) và phương thức (`PAYMENT_METHOD_MISMATCH` 400).
    - Xử lý `SUCCEEDED`: Ký QR thành công trước khi xác nhận đơn và lưu vé; ghế được biểu diễn bằng trạng thái `reserved`.
    - Xử lý Idempotent Retry: Cùng `transactionId` tái sử dụng vé đã cấp trong kết quả nội bộ của adapter.
    - Route chỉ trả `result.response` trong `ApiResponse<PaymentWebhookResponse>` (HTTP 200), gồm `received`, `bookingStatus`, `message`. Client lấy vé bằng API tickets với header chủ sở hữu.
    - Xử lý Duplicate Payment: Giao dịch khác thành công trên đơn đã `CONFIRMED` chuyển cờ `reconciliationRequired = true` và trả về 409.
    - **Bảo toàn đơn CONFIRMED**: Webhook đến sau TTL tuyệt đối không đổi đơn thành `EXPIRED` hay giải phóng ghế đã bán.
    - Lỗi cấu hình secret: Trả 500 `SERVER_CONFIGURATION_ERROR` và bảo toàn đơn ở `PENDING_PAYMENT`.
  - `getTicketResult(ticketCodeOrBookingId: string, callerEmail?: string): GetTicketResult`:
    - Vé đã tồn tại nhưng thiếu hoặc sai email người mua: 403 `FORBIDDEN`; vé chưa phát hành hoặc không tìm thấy: 404 `TICKET_NOT_FOUND`.
  - `getTicketById(ticketCodeOrBookingId: string, callerEmail?: string): ETicketDto | null`
  - `getOrderByHoldId(holdId: string): InternalOrderSummaryDto | null`
  - `expireOrderForTesting(bookingId: string): void`: Helper kiểm thử, chỉ chuyển `EXPIRED` đối với đơn `PENDING_PAYMENT`.

### Module 6: API Route Handlers (`src/app/api/...`)
- Triển khai 11 tệp `route.ts`, cung cấp 12 handlers HTTP (route hold có cả `POST` và `DELETE`), kiểm tra query params, validate body và xử lý mã lỗi HTTP.

---

## 6. Chiến lược kiểm chứng tự động (Verification Strategy)

- **Test Suite chính:** `apps/web/tests/bff-route-handlers.test.ts`.
- **Phạm vi kiểm thử:**
  1. Tra cứu danh mục phim, rạp chiếu, lịch chiếu và sơ đồ ma trận 64 ghế.
  2. Xử lý ID rạp prototype (`constructor`, `__proto__`, `toString`) trả về 404 không ném lỗi.
  3. Lọc định dạng (`NOT-2D`) và ngày (`2099-04/11`) trả về rỗng.
  4. Ràng buộc giữ ghế: All-or-Nothing, Sweetbox coupling, max 6 ghế, TTL 300s, quy tắc 1 hold active/user.
  5. Chặn alias ghép sai rạp/slot (Đồng Khởi ghép Landmark).
  6. Tạo đơn hàng: xác minh ownership, combo validation (0–10, safe integer), an toàn tổng tiền, không consume hold khi input sai.
  7. Khởi tạo intent thanh toán, tái sử dụng và sinh mới `transactionId`.
  8. Xác thực chữ ký số webhook HMAC-SHA256, từ chối khi sai chữ ký.
  9. Đối soát số tiền, phương thức thanh toán, idempotent webhook, đối soát thanh toán trùng 409.
  10. Bảo toàn đơn `CONFIRMED` không bị chuyển `EXPIRED` bởi webhook đến sau TTL, chống bán trùng ghế.
  11. Tra cứu vé điện tử E-Ticket QR và kiểm tra chữ ký số mật mã.
- **Lệnh thực thi:**
  ```bash
  npm run test:all
  npm run typecheck --workspace=apps/web
  powershell -ExecutionPolicy Bypass -File "C:\Developer\Projects\agentic-repo-kit-reference\scripts\check-kit.ps1" -TargetPath .
  ```
