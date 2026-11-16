# Feature Specification: Web BFF Route Handlers

> **Phạm vi phiên bản:** nội dung bên dưới giữ đặc tả/kế hoạch feature ban đầu, không phải toàn bộ
> sản phẩm mục tiêu đã xác nhận ngày 2026-11-16. Xem [mô hình use case](../../docs/03-product/use-cases.md),
> [hiến pháp hiện hành](../../.specify/memory/constitution.md) và
> [đặc tả nghiệp vụ](../../docs/05-specs/domain-context.md). Các chỗ về 64 ghế, role hoặc trạng thái vé
> ở phiên bản này chưa thay hợp đồng code sang yêu cầu mới. Khi mở rộng, lập đặc tả thay đổi và kiểm chứng
> phần chênh lệch; ghi chú này không sửa tiêu chí chấp thuận hay kết quả kiểm chứng cũ.

**Feature Branch**: `feat/web-bff-routes`
**Created**: 2026-11-15
**Status**: Ready for Review
**Input**: Thiết lập tầng Backend for Frontend (BFF Route Handlers) trong `apps/web` (Next.js 16) sử dụng hợp đồng dữ liệu chuẩn `@platform/contracts`.

---

## 1. Bối cảnh & Mục tiêu (Context & Objective)

Hiện tại, ứng dụng Web (`apps/web`) đang hoạt động với các bộ dữ liệu mẫu (mock fixtures) được lưu cứng tại các tệp trong mã nguồn client. Để chuẩn bị kết nối vào hệ thống giao dịch có thẩm quyền `services/cinema-core` mà không làm thay đổi hay phá vỡ giao diện người dùng, chúng ta cần:
1. Thiết lập tầng **Backend for Frontend (BFF)** mỏng bằng Next.js App Router Route Handlers (`src/app/api/...`).
2. Chuẩn hóa toàn bộ dữ liệu vào/ra theo hợp đồng dữ liệu `@platform/contracts` (`ApiResponse<T>`, `ApiErrorResponse`).
3. Cung cấp một bộ công cụ gọi API có định kiểu (`src/lib/api-client.ts`) để các màn hình giao diện và khung chat AI Agent tương tác qua mạng chuẩn REST.

---

## 2. Kịch bản người dùng & Kiểm thử độc lập (User Stories)

### User Story 1 - Khám phá và lọc phim qua Route Handler (Priority: P1)
- **Mục tiêu**: Người dùng hoặc trợ lý AI tìm kiếm danh sách phim hoặc xem chi tiết một bộ phim qua API nội bộ `/api/movies`.
- **Kịch bản chấp thuận**:
  1. **Given** yêu cầu `GET /api/movies?q=chuyen-tau&genre=tam-ly`.
  2. **When** Route Handler xử lý.
  3. **Then** trả về HTTP 200 kèm payload `ApiResponse<MovieSummaryDto[]>` chứa danh sách phim thỏa mãn điều kiện.
  4. **When** gọi `GET /api/movies/non-existent-id`.
  5. **Then** trả về HTTP 404 kèm `ApiErrorResponse` với mã lỗi `MOVIE_NOT_FOUND`.

### User Story 2 - Tra cứu lịch chiếu và sơ đồ ma trận 64 ghế (Priority: P1)
- **Mục tiêu**: Người dùng xem lịch chiếu theo ngày/rạp và tải sơ đồ ghế thời gian thực qua `/api/showtimes` và `/api/seats`.
- **Kịch bản chấp thuận**:
  1. **Given** yêu cầu `GET /api/seats?showtimeId=st-1930`.
  2. **When** Route Handler xử lý.
  3. **Then** trả về HTTP 200 kèm `ApiResponse<SeatMapDto>` có đúng 64 ghế (8 hàng A-H x 8 cột 1-8) và đánh dấu chính xác ghế đã bán hoặc còn trống.

### User Story 3 - Giữ ghế nguyên tử (Atomic Seat Hold) với TTL 5 phút (Priority: P1)
- **Mục tiêu**: Người dùng gửi yêu cầu giữ ghế `POST /api/hold` với tối đa 6 ghế và quy tắc ghế đôi Sweetbox.
- **Kịch bản chấp thuận**:
  1. **Given** payload `CreateHoldRequest` chứa `showtimeId: "st-1930"` và `seatIds: ["F5", "F6"]`.
  2. **When** gửi yêu cầu `POST /api/hold`.
  3. **Then** nhận về HTTP 201 kèm `ApiResponse<CreateHoldResponse>` có `holdDurationSeconds: 300` và trạng thái `ACTIVE`.
  4. **When** gửi danh sách ghế đã có người giữ.
  5. **Then** nhận về HTTP 409 Conflict kèm `ApiErrorResponse` với mã lỗi `SEATS_UNAVAILABLE`.

### User Story 4 - Đơn hàng, Thanh toán và Vé điện tử QR (Priority: P1)
- **Mục tiêu**: Tạo đơn hàng qua `/api/orders`, khởi tạo cổng MoMo/VNPAY qua `/api/payment/intent`, và tra cứu vé điện tử qua `/api/tickets/:id`.
- **Kịch bản chấp thuận**:
  1. **Given** đơn hàng hợp lệ gắn với mã giữ chỗ `holdId`.
  2. **When** gửi `POST /api/orders` và `POST /api/payment/intent`.
  3. **Then** nhận về thông tin thanh toán có mã giao dịch và đường dẫn QR thanh toán.
  4. **When** gọi `GET /api/tickets/TKT-8892-VN`.
  5. **Then** nhận về `ApiResponse<ETicketDto>` chứa chuỗi `qrPayload` có chữ ký bảo mật xác thực của Cinema Core.

---

## 3. Ràng buộc bất biến & Tiêu chuẩn kỹ thuật

1. **Bảo tồn kiểm thử hồi quy**: Tuyệt đối không làm gãy bất kỳ bài kiểm thử nào trong số 83/83 unit/logic tests hiện có của `apps/web`.
2. **Khung dữ liệu chuẩn**: 100% route handlers trả về kiểu `ApiResponse<T>` khi thành công và `ApiErrorResponse` khi thất bại.
3. **Sẵn sàng chuyển đổi môi trường (Environment Swap)**: Lớp adapter có khả năng trỏ sang backend thật bằng biến môi trường `CINEMA_CORE_URL` mà không cần sửa giao diện.
