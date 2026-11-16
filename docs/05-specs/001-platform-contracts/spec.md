# Feature Specification: Standard Platform Data Contracts (@platform/contracts)

> **Phạm vi đối chiếu:** nội dung bên dưới giữ phạm vi kỹ thuật của feature trên nhánh chính,
> không xác nhận đã đáp ứng toàn bộ [mô hình UML mục tiêu](../../03-product/use-cases.md).
> [Hiến pháp](../../../.specify/memory/constitution.md) và [đặc tả nghiệp vụ](../domain-context.md)
> phân biệt yêu cầu mới với code/fixture hiện có. Khi mở rộng sơ đồ ghế, role hoặc trạng thái vé,
> cần đặc tả thay đổi và kiểm chứng riêng; ghi chú này không sửa tiêu chí hay bằng chứng của feature.

**Feature Branch**: `feat/platform-contracts`
**Created**: 2026-11-15
**Status**: In Progress
**Input**: Thiết lập hợp đồng dữ liệu chuẩn (`packages/contracts`) kết nối giữa Web Client, Organizer Portal, Mobile App, Cinema Core Backend và Conversational AI Agent Service.

---

## 1. Bối cảnh & Mục tiêu (Context & Objective)

Theo quyết định kiến trúc tại **ADR-0001**, hệ thống Movie Booking Platform hoạt động theo mô hình Monorepo Platform với các ranh giới microservices rõ ràng:
- **Cinema Core (`services/cinema-core`)**: Single Source of Truth về tồn kho ghế, giữ chỗ (Atomic Hold TTL 5 phút), thanh toán và phát hành vé có chữ ký số.
- **Web Client (`apps/web`)**: Ứng dụng đặt vé xem phim trên Web (Next.js 16, React 19).
- **Organizer Portal (`apps/organizer`)**: Cổng thông tin quản trị rạp chiếu, phòng chiếu, lịch chiếu và đối soát doanh thu.
- **Mobile Client & Scanner (`apps/mobile`)**: Ứng dụng di động cho khán giả đặt vé và nhân viên soát vé QR tại cửa rạp.
- **AI Agent Service (`services/agent-service`)**: Điều phối đàm thoại và gọi công cụ (Tool Calling).

Để đảm bảo tính toàn vẹn kiểu dữ liệu đầu cuối (**End-to-End Type Safety**), loại bỏ tình trạng sai lệch schema giữa các phân hệ, gói `@platform/contracts` đóng vai trò là thư viện hợp đồng trung tâm chứa:
1. Các kiểu dữ liệu cơ sở và định danh chuẩn (Common Enums & Base Types).
2. Hợp đồng danh mục phim và tài nguyên truyền thông (Movies & Media Assets).
3. Hợp đồng rạp chiếu, phòng chiếu và ma trận 64 ghế (Cinemas, Auditoriums, Seat Matrix).
4. Hợp đồng lịch chiếu đa phòng và phát hiện xung đột (Showtimes & Schedules).
5. Hợp đồng động cơ giữ ghế nguyên tử và bộ đếm lùi TTL 5 phút (Seat Hold Engine & Countdown TTL).
6. Hợp đồng đơn hàng, combo và thanh toán đa kênh (Orders, Combos, Payment Intents & Webhooks).
7. Hợp đồng vé điện tử bảo mật và chữ ký số quét QR (Cryptographic E-Tickets & Scanner).
8. Hợp đồng công cụ gọi cho AI Agent (Agent Tool Calling Interface).

---

## 2. Kịch bản người dùng & Kiểm thử độc lập (User Stories)

### User Story 1 - Rà soát và kết nối hợp đồng danh mục phim & lịch chiếu giữa Organizer và Web/Mobile (Priority: P1)
- **Mục tiêu**: Người quản lý rạp tại Organizer Portal tạo/sửa lịch chiếu, và Web Client/Mobile Client lập tức đọc được dữ liệu theo cùng một cấu trúc DTO không bị sai lệch kiểu.
- **Kiểm thử độc lập**: Kiểm tra việc khởi tạo `CreateMovieRequest`, `CreateShowtimeRequest` tại Organizer và ánh xạ chính xác sang `MovieDetailDto`, `ShowtimeSlotDto` tại Web/Mobile.
- **Kịch bản chấp thuận**:
  1. **Given** một yêu cầu tạo suất chiếu `CreateShowtimeRequest` với định dạng `IMAX_LASER` và ngày chiếu hợp lệ.
  2. **When** Cinema Core xử lý và trả về `ShowtimeDto`.
  3. **Then** Web Client hiển thị đúng nhãn định dạng, giá vé theo từng loại ghế (Standard, VIP, Sweetbox) mà không cần chuyển đổi kiểu thủ công.

### User Story 2 - Hợp đồng giữ ghế nguyên tử (Atomic Seat Hold) với TTL 5 phút (Priority: P1)
- **Mục tiêu**: Khi khách hàng chọn 1 đến 6 ghế (tuân thủ ràng buộc F12 và ghép cặp Sweetbox), Web hoặc Agent gửi yêu cầu `CreateHoldRequest` tới Cinema Core.
- **Kiểm thử độc lập**: Kiểm chứng payload `CreateHoldRequest` và phản hồi `CreateHoldResponse` chứa đúng trạng thái `ACTIVE`, thời hạn giữ `holdExpiresAt` và số giây đếm lùi `holdDurationSeconds` (300 giây).
- **Kịch bản chấp thuận**:
  1. **Given** danh sách 2 ghế `["F5", "F6"]` tại suất chiếu hợp lệ.
  2. **When** gửi yêu cầu `CreateHoldRequest`.
  3. **Then** nhận được `CreateHoldResponse` với mã giữ chỗ `holdId`, `holdDurationSeconds: 300`, và tổng tiền tính đúng theo đơn giá ghế.
  4. **When** danh sách ghế chứa ghế đã bị giữ (`HELD`), hệ thống từ chối toàn bộ (All-or-Nothing) với mã lỗi `SEATS_UNAVAILABLE`.

### User Story 3 - Hợp đồng thanh toán, đối soát Webhook và Vé điện tử QR có chữ ký số (Priority: P1)
- **Mục tiêu**: Đảm bảo ranh giới an toàn giao dịch: Webhook từ MoMo/VNPAY được chuẩn hóa qua `PaymentWebhookPayload`, và vé điện tử chỉ được phát hành kèm chữ ký số HMAC-SHA256 trong `TicketQrPayload`.
- **Kiểm thử độc lập**: Kiểm thử tạo `CreatePaymentIntentRequest`, mô phỏng webhook thanh toán `PaymentWebhookPayload`, và kiểm tra cấu trúc `ETicketDto` cùng `TicketQrPayload`.
- **Kịch bản chấp thuận**:
  1. **Given** một đơn hàng đang ở trạng thái `PENDING_PAYMENT` có `holdId` hợp lệ.
  2. **When** Cinema Core nhận `PaymentWebhookPayload` thành công từ cổng thanh toán.
  3. **Then** trạng thái chuyển thành `CONFIRMED` và trả về `ETicketDto` chứa chuỗi `qrPayload` có định dạng JSON hợp lệ kèm chữ ký `signature`.
  4. **When** nhân viên rạp quét vé qua `VerifyTicketRequest` tại `apps/mobile`, hệ thống xác thực chữ ký và cập nhật trạng thái `CHECKED_IN`.

### User Story 4 - Hợp đồng điều phối công cụ cho AI Agent Service (Priority: P2)
- **Mục tiêu**: AI Agent Service sử dụng các công cụ chuẩn (`SearchMovies`, `GetShowtimes`, `GetSeatMap`, `HoldSeats`, `CreatePaymentIntent`) với các input/output DTOs định nghĩa sẵn trong `@platform/contracts`.
- **Kiểm thử độc lập**: Gọi các interface công cụ với mock input và kiểm tra tính tương thích cấu trúc với API của Cinema Core.
- **Kịch bản chấp thuận**:
  1. **Given** ý định đặt vé của người dùng bóc tách thành `{ movieTitle: "Chuyến tàu cuối hè", date: "2026-11-04" }`.
  2. **When** AI Agent gọi tool `SearchMoviesToolInput`.
  3. **Then** kết quả trả về `SearchMoviesToolOutput` chứa danh sách phim và suất chiếu khớp với DTO của Web.

---

## 3. Ràng buộc kỹ thuật & Quy chuẩn kiến trúc (Technical Invariants)

1. **Tuân thủ Erasable Syntax**: Không sử dụng TypeScript `enum` truyền thống (vì vi phạm cờ `erasableSyntaxOnly: true` của TypeScript 5.8+). Sử dụng `const` objects với `as const` kết hợp `type Union = typeof Object[keyof typeof Object]`.
2. **Zero Runtime Dependencies**: `@platform/contracts` chỉ chứa TypeScript types, interfaces, constants, và các pure type guards/helpers nhẹ, không kéo theo thư viện nặng, giúp nạp siêu tốc trên cả Web, Mobile, Node.js backend và Agent Service.
3. **Phân tách Role rõ ràng**: Phân định rành mạch giữa `CUSTOMER`, `CINEMA_STAFF`, và `ORGANIZER_ADMIN`.
4. **Giữ nguyên 83/83 tests của `apps/web`**: Mọi thay đổi hoặc import không được làm gãy bất kỳ bài kiểm thử tự động nào đang có.
