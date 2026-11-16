# Feature Specification: Web BFF Route Handlers

**Feature Branch**: `feat/web-bff-routes`

**Created**: 2026-11-15 | **Last Updated**: 2026-11-16

**Status**: Ready for Review

**Input**: Thiết lập tầng Backend for Frontend (BFF Route Handlers) trong `apps/web` (Next.js 16 App Router) sử dụng hợp đồng dữ liệu chuẩn `@platform/contracts`.

---

## 1. Bối cảnh & Mục tiêu (Context & Objective)

Ứng dụng Web (`apps/web`) cần một tầng **Backend for Frontend (BFF)** mỏng bằng Next.js App Router Route Handlers (`src/app/api/...`) để:
1. Chuẩn hóa toàn bộ dữ liệu vào/ra theo hợp đồng dữ liệu `@platform/contracts` (`ApiResponse<T>`, `ApiErrorResponse`).
2. Tách biệt hoàn toàn giao diện người dùng (React Server & Client Components, Chat AI Agent) khỏi chi tiết lưu trữ cục bộ.
3. Cung cấp API nội bộ mô phỏng đầy đủ vòng đời giao dịch đặt vé (catalog, seat hold, order, payment intent, webhook đối soát, E-Ticket QR HMAC) với độ trung thực cao, làm bước đệm trước khi kết nối trực tiếp vào dịch vụ backend giao dịch có thẩm quyền `services/cinema-core`.
4. Cung cấp bộ SDK gọi API có định kiểu (`src/lib/api-client.ts`) để các màn hình giao diện và AI Agent tương tác qua mạng chuẩn REST.

> [!IMPORTANT]
> **Ranh giới thẩm quyền & Trạng thái triển khai hiện tại:**
> - Hệ thống backend `services/cinema-core` là **Nguồn chân lý duy nhất (Single Source of Truth)** theo [ADR-0001](../../06-decisions/0001-monorepo-platform-and-microservices-boundaries.md), nhưng hiện tại **chưa được triển khai runtime thực tế**.
> - Tầng BFF Route Handlers hiện đang vận hành dựa trên các adapter mô phỏng in-memory (`catalog-adapter.ts`, `hold-adapter.ts`, `order-adapter.ts`, `crypto-utils.ts`) nằm trong `apps/web/src/server/`.
> - Biến môi trường `CINEMA_CORE_URL` là định hướng kiến trúc tương lai, **chưa được kích hoạt hay đấu nối trong mã nguồn hiện tại**. Không mô tả `CINEMA_CORE_URL` như một tính năng đã hoạt động.

---

## 2. Kịch bản người dùng & Tiêu chí chấp thuận (User Stories & Acceptance Criteria)

### User Story 1 - Khám phá và lọc phim, rạp chiếu (Priority: P1)
- **Mục tiêu**: Người dùng hoặc trợ lý AI tìm kiếm danh sách phim, thông tin rạp hoặc xem chi tiết qua API nội bộ `/api/movies` và `/api/cinemas`.
- **Kịch bản chấp thuận**:
  1. **Given** yêu cầu `GET /api/movies?q=chuyen-tau&genre=T%C3%A2m%20l%C3%BD` (thể loại `Tâm lý`).
  2. **When** Route Handler xử lý.
  3. **Then** trả về HTTP 200 kèm `ApiResponse<MovieSummaryDto[]>` chứa danh sách phim thỏa mãn.
  4. **When** gọi `GET /api/movies/non-existent-id`.
  5. **Then** trả về HTTP 404 kèm `ApiErrorResponse` với mã lỗi `MOVIE_NOT_FOUND`.
  6. **When** gọi `GET /api/cinemas/cgv-dong-khoi` (hoặc alias hợp lệ như `cgv-vincom-dong-khoi`, `dong-khoi`).
  7. **Then** trả về HTTP 200 kèm `ApiResponse<CinemaDetailDto>` chuẩn.
  8. **When** gọi với ID giả hoặc thuộc tính prototype kế thừa (`/api/cinemas/not-a-real-cgv-dong-khoi`, `/api/cinemas/constructor`, `/api/cinemas/__proto__`, `/api/cinemas/toString`).
  9. **Then** hệ thống kiểm tra thuộc tính sở hữu qua `Object.hasOwn` và trả về HTTP 404 `CINEMA_NOT_FOUND`, tuyệt đối không ném ngoại lệ `TypeError`.
  10. **When** lọc định dạng hoặc ngày không tồn tại (ví dụ `format=NOT-2D`, `date=2099-04/11`).
  11. **Then** chuẩn hóa qua `normalizeFormatFilter` và so sánh ngày chính xác, trả về mảng rỗng `[]` thay vì nhận nhầm bằng chuỗi con (substring).

### User Story 2 - Tra cứu lịch chiếu và sơ đồ ma trận 64 ghế (Priority: P1)
- **Mục tiêu**: Tra cứu lịch chiếu theo ngày/rạp và tải sơ đồ ghế thời gian thực qua `/api/showtimes` và `/api/seats`.
- **Kịch bản chấp thuận**:
  1. **Given** yêu cầu `GET /api/seats?showtimeId=cgv-dong-khoi-slot-dk-04-1` (hoặc alias `slot-dk-04-1`, hoặc alias tổng hợp `BK-2026-CHUYENTAU`).
  2. **When** Route Handler xử lý.
  3. **Then** trả về HTTP 200 kèm `ApiResponse<SeatMapDto>` có đúng 64 ghế (8 hàng A–H × 8 cột 1–8), phân loại Standard (A–D), VIP (E–G), Sweetbox cặp đôi (H1-H2, H3-H4,...) và phản ánh trung thực trạng thái ghế `available`, `held`, hoặc `reserved` (đã bán).
  4. **When** yêu cầu showtime ID ghép sai rạp và suất chiếu (ví dụ lấy alias rạp Đồng Khởi ghép với slot Landmark: `cgv-dong-khoi-slot-lm-04-1`, `cgv-vincom-dong-khoi-slot-lm-04-1`, hoặc `dong-khoi-slot-lm-04-1`).
  5. **Then** hệ thống đối chiếu thẩm quyền rạp sở hữu slot và trả về HTTP 404 `SHOWTIME_NOT_FOUND`.
  6. **Alias quy ước**: Alias `BK-2026-CHUYENTAU` trỏ chính xác về suất chiếu canonical `cgv-dong-khoi-slot-dk-04-1` (định dạng 2D, Rạp 2 · Dolby Atmos, ngày 04/11 lúc 18:15).

### User Story 3 - Giữ ghế nguyên tử (Atomic Seat Hold) với TTL 300 giây (Priority: P1)
- **Mục tiêu**: Người dùng giữ tạm thời danh sách ghế được chọn để tiến hành thanh toán.
- **Kịch bản chấp thuận**:
  1. **Given** payload `CreateHoldRequest` chứa `showtimeId: "slot-dk-04-1"`, `seatIds: ["F5", "F6"]`, và bắt buộc có `userEmail` hợp lệ (ví dụ `"customer@cinora.vn"`).
  2. **When** gửi yêu cầu `POST /api/hold`.
  3. **Then** hệ thống thực hiện kiểm tra:
     - Tối đa 6 ghế/lần đặt (`MAX_SEATS_EXCEEDED` 400).
     - Ghế đôi Sweetbox bắt buộc chọn đủ cặp (`SWEETBOX_PAIR_REQUIRED` 400).
     - Không chứa ghế trùng lặp (`DUPLICATE_SEATS` 400).
     - Định danh email hợp lệ (`INVALID_EMAIL` 400 hoặc `MISSING_USER_EMAIL` 400).
     - **Ràng buộc một người một hold hiệu lực**: Nếu tài khoản (`userEmail`) đã có một hold ở trạng thái `ACTIVE` và chưa hết TTL, yêu cầu mới bị từ chối với HTTP 409 `USER_ALREADY_HAS_ACTIVE_HOLD`.
     - **Nguyên tắc All-or-Nothing**: Nếu bất kỳ ghế nào đã bị giữ hoặc đã bán, toàn bộ yêu cầu bị từ chối với HTTP 409 `SEATS_UNAVAILABLE`.
  4. **When** thỏa mãn toàn bộ điều kiện.
  5. **Then** trả về HTTP 201 kèm `ApiResponse<CreateHoldResponse>` có mã `holdId` động (`HOLD-XXXX`), `holdDurationSeconds: 300` (TTL 5 phút), và trạng thái `ACTIVE`.
  6. **When** người dùng chủ động hủy giữ chỗ qua `DELETE /api/hold` (yêu cầu gửi kèm email khớp người giữ).
  7. **Then** hold chuyển trạng thái `CANCELLED`, ghế được giải phóng ngay lập tức về trạng thái `available`, và người dùng có thể tạo hold mới.

### User Story 4 - Tạo đơn hàng & Kiểm tra an toàn đầu vào (Priority: P1)
- **Mục tiêu**: Chuyển đổi hold ghế hợp lệ thành đơn hàng đặt vé qua `POST /api/orders`.
- **Kịch bản chấp thuận**:
  1. **Given** yêu cầu tạo đơn hàng chứa `holdId`, `showtimeId`, `userEmail`, `paymentMethod`, và danh sách `combos` tùy chọn.
  2. **When** Route Handler kiểm tra:
     - **Xác minh quyền sở hữu (Ownership)**: `userEmail` trong đơn hàng bắt buộc phải khớp với `userEmail` của lệnh giữ chỗ (`HOLD_OWNER_MISMATCH` 403).
     - **Trạng thái hold**: Hold phải tồn tại và còn hạn TTL (`HOLD_EXPIRED_OR_NOT_FOUND` 404). Hold đã chuyển `CONSUMED` không được phép dùng lại (`HOLD_ALREADY_CONSUMED` 409). Hold đã bị hủy trước đó không được dùng (`HOLD_CANCELLED` 409).
     - **Kiểm tra an toàn số lượng Combo**: Mỗi combo phải tồn tại trong danh mục; số lượng `c.quantity` bắt buộc là số nguyên an toàn (`Number.isSafeInteger`), không âm và tối đa 10 phần (`0 <= quantity <= 10`). Vi phạm trả về HTTP 400 `INVALID_COMBO_QUANTITY`.
     - **Kiểm tra an toàn tổng tiền đơn hàng**: `totalAmount` bắt buộc là số nguyên an toàn (`Number.isSafeInteger`), hữu hạn, không âm và không vượt hạn mức thanh toán tối đa (100.000.000 đ). Vi phạm trả về HTTP 400 `INVALID_ORDER_AMOUNT`.
  3. **When** bất kỳ bước xác thực nào thất bại.
  4. **Then** hệ thống trả về lỗi ngay lập tức, **không chuyển hold sang `CONSUMED`**. Nếu hold đang `ACTIVE` và còn hạn, khách hàng có thể sửa dữ liệu rồi gửi lại; hold đã hết hạn, bị hủy hoặc đã tiêu thụ không trở lại `ACTIVE`.
  5. **When** toàn bộ dữ liệu hợp lệ.
  6. **Then** hệ thống mới thực hiện chuyển trạng thái hold thành `CONSUMED` (`consumeSeatHold`), tạo đơn hàng với mã `bookingId` động (`BK-XXXX`), trạng thái `PENDING_PAYMENT`, ghi nhận `holdExpiresAt` và trả về HTTP 201 kèm `ApiResponse<OrderSummaryDto>`.
  7. **Ràng buộc hold CONSUMED**: Hold đã tiêu thụ không thể bị hủy tùy tiện qua `DELETE /api/hold` (trả về 409 `HOLD_ALREADY_CONSUMED`). Ghế gắn với đơn hàng tiếp tục được giữ tạm thời cho đến khi thanh toán thành công hoặc đơn hết hạn TTL.

### User Story 5 - Khởi tạo cổng thanh toán & Đối soát Webhook (Priority: P1)
- **Mục tiêu**: Khởi tạo phiên thanh toán (`POST /api/payment/intent`), xử lý webhook bất đồng bộ từ cổng thanh toán/Cinema Core (`POST /api/payment/webhook`), phát hành vé điện tử E-Ticket có chữ ký số HMAC và bảo toàn đơn hàng.
- **Kịch bản chấp thuận**:
  1. **Khởi tạo Intent (`POST /api/payment/intent`)**:
     - Yêu cầu header `x-user-email` khớp email chủ sở hữu đơn hàng; thiếu hoặc sai email trả về HTTP 403 `FORBIDDEN`.
     - Quản lý phiên thanh toán theo `paymentAttempts`: Mỗi lần tạo intent với phương thức thanh toán mới hoặc retry sau thất bại sẽ sinh một `transactionId` duy nhất. Nếu cùng phương thức đang chờ xử lý (`PENDING`), hệ thống tái sử dụng `transactionId` hiện có.
     - Trả về HTTP 201 kèm `ApiResponse<PaymentIntentResponse>`; `data` gồm `transactionId`, `bookingId`, `paymentMethod`, `amount`, `qrCodeUrl`, `deepLinkUrl` và `expiresAt`.
  2. **Xác thực chữ ký số Webhook (`POST /api/payment/webhook`)**:
     - Webhook gửi chữ ký số HMAC-SHA256 trong trường `signature` của JSON body (`PaymentWebhookPayload`).
     - Chữ ký được đối soát bằng khóa bí mật `CINEMA_CORE_WEBHOOK_SECRET`. Nếu chữ ký thiếu hoặc không hợp lệ, trả về HTTP 400 `INVALID_SIGNATURE`.
  3. **Đối soát giao dịch Webhook**:
     - Đơn hàng chưa từng tạo payment intent bị từ chối với HTTP 400 `TRANSACTION_NOT_INITIALIZED`.
     - `transactionId` phải thuộc một payment attempt đã đăng ký của đơn hàng (`TRANSACTION_ID_MISMATCH` 400).
     - Số tiền thanh toán trong webhook phải khớp chính xác với `order.totalAmount` (`AMOUNT_MISMATCH` 400).
     - Phương thức thanh toán phải khớp với phương thức đã đăng ký trong `paymentAttempt` tương ứng (`PAYMENT_METHOD_MISMATCH` 400).
  4. **Thanh toán thành công (`PaymentStatus.SUCCEEDED`)**:
     - **Lần đầu**: Sau khi ký QR thành công, adapter tạo và lưu vé, chuyển đơn hàng sang `CONFIRMED`; ghế trong sơ đồ được đánh dấu `reserved`. Vé `ETicketDto` có `ticketCode` động dạng `TKT-<8 ký tự hex>-<5 chữ số>-VN` và chữ ký HMAC-SHA256 trong `qrPayload` dựa trên `CINEMA_CORE_TICKET_SECRET`. Nếu ký thất bại, trả HTTP 500 `SERVER_CONFIGURATION_ERROR`, giữ nguyên đơn `PENDING_PAYMENT` để retry.
     - **Phản hồi HTTP**: Route trả `ApiResponse<PaymentWebhookResponse>` với `data.received`, `data.bookingStatus` và `data.message`. Vé được tra cứu riêng qua `GET /api/tickets/:id` với header chủ sở hữu.
     - **Idempotent Retry**: Nhận lại webhook thành công của cùng `transactionId` đã xác nhận đơn trước đó, hệ thống giữ nguyên vé đã phát hành và trả HTTP 200 với phản hồi webhook trên, không tạo vé trùng.
     - **Duplicate Payment (Khoản thu trùng từ attempt khác)**: Nếu nhận webhook thành công từ một `transactionId` khác khi đơn hàng đã `CONFIRMED` trước đó, attempt đó được đánh dấu `reconciliationRequired = true`, lý do `DUPLICATE_PAYMENT_ON_CONFIRMED_ORDER`, và trả về HTTP 409 `DUPLICATE_PAYMENT_RECONCILIATION_REQUIRED` để đưa vào luồng đối soát hoàn tiền bổ sung.
  5. **Bảo toàn đơn hàng CONFIRMED trước webhook đến muộn (Late-arriving Webhook)**:
     - Khi đơn hàng đã `CONFIRMED`, webhook có trạng thái `PROCESSING`, `UNKNOWN` hoặc `FAILED` đến sau TTL vẫn nhận HTTP 200; đơn giữ `CONFIRMED`, vé và ghế `reserved` được bảo toàn. Với giao dịch đã xác nhận đơn, adapter trả kết quả hiện có; với attempt khác, adapter cập nhật trạng thái attempt đó. Nhánh này không chuyển đơn thành `EXPIRED` hoặc giải phóng ghế đã bán.
  6. **Đơn hàng chưa thanh toán quá hạn (Expired Unpaid Order)**:
     - Nếu đơn hàng đang ở `PENDING_PAYMENT` và thời gian giữ chỗ `order.holdExpiresAt` đã trôi qua, ghế được tự động giải phóng lại kho tồn kho (`available`). Webhook thành công đến sau khi đơn đã `EXPIRED` sẽ được chuyển vào luồng đối soát hoàn tiền (HTTP 409 `PAYMENT_EXPIRED_RECONCILIATION_REQUIRED`).
  7. **Tra cứu vé điện tử (`GET /api/tickets/:id`)**:
     - Tra cứu vé bằng `bookingId` hoặc `ticketCode`.
     - Với vé đã tồn tại, yêu cầu header `x-user-email` khớp email chủ sở hữu; thiếu hoặc sai email trả HTTP 403 `FORBIDDEN`. Vé chưa phát hành hoặc ID vé không tồn tại trả HTTP 404 `TICKET_NOT_FOUND`.

---

## 3. Ràng buộc bất biến, Bảo mật & Giới hạn kỹ thuật

1. **Bảo tồn kiểm thử hồi quy**: Mọi thay đổi trong `apps/web` phải bảo đảm 100% các bộ kiểm thử tự động của monorepo đều PASS trước khi bàn giao.
2. **Khung dữ liệu chuẩn**: 100% route handlers trả về kiểu `ApiResponse<T>` khi thành công và `ApiErrorResponse` khi thất bại, kèm header `Content-Type: application/json`.
3. **Cấu hình Secret & Xử lý môi trường Production**:
   - `CINEMA_CORE_WEBHOOK_SECRET`: Khóa bí mật dùng để tạo và xác thực chữ ký HMAC-SHA256 trên webhook payload.
   - `CINEMA_CORE_TICKET_SECRET`: Khóa bí mật dùng để ký và xác thực chữ ký số HMAC-SHA256 trên E-Ticket QR payload.
   - Trong môi trường `NODE_ENV === 'production'`, hàm đọc secret ném lỗi `SECURITY_ERROR` khi khóa tương ứng bị thiếu. Khi xác thực webhook hoặc ký vé, adapter chuyển lỗi này thành HTTP 500 `SERVER_CONFIGURATION_ERROR`, không fallback sang khóa phát triển công khai.
   - Trong môi trường phát triển cục bộ và kiểm thử giả lập (`NODE_ENV !== 'production'`), hệ thống cho phép fallback sang secret giả lập để phục vụ kiểm thử tích hợp tự động.
   - Tuyệt đối không lưu trữ hoặc công bố giá trị secret thật trong tài liệu, mã nguồn commit hoặc client bundles.
4. **Giới hạn lưu trữ bộ nhớ (In-Memory Limitations)**:
   - Toàn bộ dữ liệu ghế giữ (`holdsStore`), đơn hàng (`ordersStore`, `ordersByHoldId`), và vé (`ticketsStore`) hiện tại được duy trì trong bộ nhớ tiến trình (Process Memory Maps) của ứng dụng Web. Dữ liệu sẽ được tái thiết lập khi server khởi động lại.
   - Khi dịch vụ backend `services/cinema-core` được xây dựng, tầng lưu trữ này sẽ được chuyển giao sang cơ sở dữ liệu phân tán có cơ chế khóa đồng thời (Distributed Concurrency Lock & ACID Transactions).
5. **Giới hạn định danh khách hàng (`x-user-email`)**:
   - Header `x-user-email` trong BFF hiện tại đóng vai trò định danh ngữ cảnh mô phỏng giữa client và route handler. Đây chưa phải là cơ chế xác thực phiên bảo mật hoàn chỉnh (như JSON Web Token có chữ ký số, Session Cookie mã hóa, hoặc OAuth2/OIDC).
