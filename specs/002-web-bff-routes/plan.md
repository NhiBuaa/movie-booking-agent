# Implementation Plan: Web BFF Route Handlers

> **Phạm vi phiên bản:** nội dung bên dưới giữ đặc tả/kế hoạch feature ban đầu, không phải toàn bộ
> sản phẩm mục tiêu đã xác nhận ngày 2026-11-16. Xem [mô hình use case](../../docs/03-product/use-cases.md),
> [hiến pháp hiện hành](../../.specify/memory/constitution.md) và
> [đặc tả nghiệp vụ](../../docs/05-specs/domain-context.md). Các chỗ về 64 ghế, role hoặc trạng thái vé
> ở phiên bản này chưa thay hợp đồng code sang yêu cầu mới. Khi mở rộng, lập đặc tả thay đổi và kiểm chứng
> phần chênh lệch; ghi chú này không sửa tiêu chí chấp thuận hay kết quả kiểm chứng cũ.

**Branch**: `feat/web-bff-routes` | **Date**: 2026-11-15 | **Spec**: [specs/002-web-bff-routes/spec.md](spec.md)

**Input**: Feature specification from `specs/002-web-bff-routes/spec.md`

---

## 1. Tóm tắt kế hoạch (Summary)

Thiết lập tầng **Backend for Frontend (BFF Route Handlers)** trong `apps/web` (Next.js 16 App Router) đóng vai trò làm trạm trung gian chuẩn hóa, điều phối dữ liệu giữa trình duyệt web và hệ thống giao dịch cốt lõi `services/cinema-core`, sử dụng 100% hợp đồng dữ liệu chuẩn từ `@platform/contracts`.

---

## 2. Bối cảnh kỹ thuật (Technical Context)

- **Framework**: Next.js 16.4.5 App Router + React 19.3.1 + TypeScript 6.0+.
- **Giao thức API**: RESTful JSON API qua Next.js Server Route Handlers (`src/app/api/...`).
- **Thư viện hợp đồng**: `@platform/contracts` (được liên kết qua npm workspace và tsconfig path mapping).
- **Kiểm thử tự động**: Node.js native test runner (`node --test "tests/*.test.ts"`).
- **Ràng buộc kiểm thử**: Bắt buộc giữ vững 100% (83/83) test suites hiện có của `apps/web`.

---

## 3. Đối chiếu Hiến pháp dự án (Constitution Check)

- [x] **I. Cinema Core as Single Source of Truth**: Route Handlers chỉ đóng vai trò BFF trung gian, không tự sinh thẩm quyền giao dịch trái với quy tắc Cinema Core.
- [x] **II. Conversational Booking Safety Boundary**: Luồng thanh toán và vé điện tử luôn yêu cầu chữ ký số HMAC từ Cinema Core.
- [x] **III. Monorepo Type Safety & Shared Contracts**: Sử dụng trực tiếp các DTOs (`MovieSummaryDto`, `CreateHoldRequest`, `CreateHoldResponse`, `OrderSummaryDto`, `ETicketDto`) từ `@platform/contracts`.
- [x] **IV. Verification Before Completion**: Viết test suite `tests/bff-route-handlers.test.ts` kiểm chứng toàn bộ API routes trước khi công bố hoàn tất.

---

## 4. Cấu trúc tệp dự kiến (File Structure)

```text
apps/web/
├── package.json                                   # Thêm dependency: "@platform/contracts": "*"
├── tsconfig.json                                  # Thêm path: "@platform/contracts": ["../../packages/contracts/src/index.ts"]
├── tests/
│   └── bff-route-handlers.test.ts                 # Test suite kiểm chứng API Route Handlers
└── src/
    ├── lib/
    │   └── api-client.ts                          # Client API SDK cho frontend components & chat agent
    ├── server/
    │   ├── response.ts                            # Helper đóng gói jsonSuccess & jsonError
    │   ├── catalog-adapter.ts                     # Adapter dữ liệu Phim, Rạp, Suất chiếu
    │   ├── hold-adapter.ts                        # Adapter động cơ giữ ghế (Hold TTL 300s, All-or-Nothing)
    │   └── order-adapter.ts                       # Adapter đơn hàng, thanh toán và chữ ký vé QR
    └── app/
        └── api/
            ├── movies/
            │   ├── route.ts                       # GET /api/movies (Tìm kiếm & lọc phim)
            │   └── [id]/route.ts                  # GET /api/movies/:id (Chi tiết phim)
            ├── cinemas/
            │   ├── route.ts                       # GET /api/cinemas (Danh sách cụm rạp)
            │   └── [id]/route.ts                  # GET /api/cinemas/:id (Chi tiết rạp & phòng chiếu)
            ├── showtimes/
            │   └── route.ts                       # GET /api/showtimes (Lịch chiếu theo ngày/rạp)
            ├── seats/
            │   └── route.ts                       # GET /api/seats (Sơ đồ ma trận 64 ghế)
            ├── hold/
            │   └── route.ts                       # POST & DELETE /api/hold (Giữ ghế 5 phút TTL)
            ├── orders/
            │   └── route.ts                       # POST /api/orders (Tạo đơn hàng)
            ├── payment/
            │   └── intent/route.ts                # POST /api/payment/intent (Khởi tạo MoMo/VNPAY)
            └── tickets/
                └── [id]/route.ts                  # GET /api/tickets/:id (Vé điện tử có chữ ký số)
```

---

## 5. Các bước triển khai chi tiết (Implementation Tasks)

### Task 1: Kết nối Workspace & Cấu hình TypeScript Paths
- **Tệp chỉnh sửa:**
  - `apps/web/package.json`
  - `apps/web/tsconfig.json`
- **Giao diện & Chức năng:**
  - Cho phép `apps/web` import trực tiếp từ `@platform/contracts`.
- **Kiểm tra kết quả:** Chạy `npm test` để xác nhận 83 bài kiểm thử cũ không bị ảnh hưởng.

### Task 2: Xây dựng Server Helpers & Response Builders
- **Tệp tạo mới:**
  - `apps/web/src/server/response.ts`
- **Giao diện:**
  - `jsonSuccess<T>(data: T, status?: number, message?: string): Response`
  - `jsonError(code: string, message: string, status: number, details?: unknown): Response`
- **Kiểm tra kết quả:** Trả về cấu trúc đúng chuẩn `ApiResponse<T>` hoặc `ApiErrorResponse` kèm header `Content-Type: application/json`.

### Task 3: Xây dựng các Server Service Adapters
- **Tệp tạo mới:**
  - `apps/web/src/server/catalog-adapter.ts`: Hàm `listMovies(query)`, `getMovieById(id)`, `listCinemas()`, `getShowtimes(query)`.
  - `apps/web/src/server/hold-adapter.ts`: Hàm `createHold(req)` (kiểm tra All-or-Nothing, tối đa 6 ghế, Sweetbox đôi, TTL 300s), `releaseHold(holdId)`.
  - `apps/web/src/server/order-adapter.ts`: Hàm `createOrder(req)`, `createPaymentIntent(req)`, `getTicketById(ticketId)`.
- **Kiểm tra kết quả:** Viết các bài test logic độc lập cho adapter.

### Task 4: Triển khai các API Route Handlers
- **Tệp tạo mới:**
  - `apps/web/src/app/api/movies/route.ts` & `apps/web/src/app/api/movies/[id]/route.ts`
  - `apps/web/src/app/api/cinemas/route.ts` & `apps/web/src/app/api/cinemas/[id]/route.ts`
  - `apps/web/src/app/api/showtimes/route.ts`
  - `apps/web/src/app/api/seats/route.ts`
  - `apps/web/src/app/api/hold/route.ts`
  - `apps/web/src/app/api/orders/route.ts`
  - `apps/web/src/app/api/payment/intent/route.ts`
  - `apps/web/src/app/api/tickets/[id]/route.ts`
- **Kiểm tra kết quả:** Xử lý đầy đủ query params, request body và trả về mã HTTP đúng chuẩn (200, 201, 400, 404, 409).

### Task 5: Xây dựng Client API SDK (`src/lib/api-client.ts`)
- **Tệp tạo mới:**
  - `apps/web/src/lib/api-client.ts`
- **Giao diện:**
  - Cung cấp client gọi API an toàn kiểu:
    - `apiClient.movies.list(query)`
    - `apiClient.movies.get(id)`
    - `apiClient.seats.getMap(showtimeId)`
    - `apiClient.hold.create(req)`
    - `apiClient.orders.create(req)`
    - `apiClient.payment.createIntent(req)`
    - `apiClient.tickets.get(ticketId)`
- **Kiểm tra kết quả:** TypeScript kiểm tra tương thích kiểu dữ liệu đầu cuối không có lỗi.

### Task 6: Kiểm chứng tự động toàn diện
- **Tệp tạo mới:**
  - `apps/web/tests/bff-route-handlers.test.ts`
- **Kịch bản kiểm thử:**
  1. Tra cứu phim, lọc theo thể loại và kiểm tra trường hợp 404 phim không tồn tại.
  2. Lấy sơ đồ 64 ghế phòng chiếu chuẩn.
  3. Giữ ghế thành công với TTL 300 giây.
  4. Giữ ghế thất bại (All-or-Nothing) khi có ghế đã bị giữ.
  5. Tạo đơn hàng và tạo intent thanh toán MoMo.
  6. Tra cứu vé điện tử QR và xác thực tính toàn vẹn của chữ ký số HMAC.
- **Lệnh kiểm tra:**
  ```bash
  npm run test:all
  powershell -ExecutionPolicy Bypass -File "C:\Developer\Projects\agentic-repo-kit-reference\scripts\check-kit.ps1" -TargetPath .
  ```
