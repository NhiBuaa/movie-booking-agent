# Business Domain Context & Transaction Rules

Tài liệu này xác định các quy tắc nghiệp vụ cốt lõi, vòng đời giao dịch và trạng thái dữ liệu chuẩn của nền tảng **Movie Booking Platform**.

---

## 1. Ranh giới thẩm quyền (Authoritative Boundaries)

- **Cinema Core API (`services/cinema-core`)**: Là **Nguồn chân lý duy nhất (Single Source of Truth)** về tồn kho suất chiếu, trạng thái ghế, giữ chỗ (hold), giá vé, giao dịch thanh toán và vé điện tử hợp lệ (theo [ADR-0001](../06-decisions/0001-monorepo-platform-and-microservices-boundaries.md)).
- **AI Agent (`services/agent-service`)**: Đóng vai trò trợ lý thông minh diễn giải ngôn ngữ tự nhiên, gợi ý và điều phối tác vụ. AI Agent **không bao giờ tự xác nhận** giao dịch thành công nếu không có phản hồi và chữ ký số từ Cinema Core.
- **Frontend / Client (`apps/web`, `apps/mobile`)**: Chỉ hiển thị trạng thái giao dịch được Cinema Core xác thực. Tuyệt đối không tự suy diễn trạng thái thành công hoặc thất bại từ các phản hồi chưa rõ ràng (`UNKNOWN`).

---

## 2. Quy tắc phòng chiếu & Ma trận ghế (Seat Matrix)

- **Quy mô phòng chiếu chuẩn**: Ma trận 64 ghế (8 hàng A–H × 8 cột 1–8).
  - **Hàng A – D**: Ghế Tiêu chuẩn (Standard).
  - **Hàng E – G**: Ghế VIP (Vị trí trung tâm góc nhìn tối ưu).
  - **Hàng H (hoặc J)**: Ghế Sweetbox (Ghế đôi Couple, ghép cặp cố định 2 ghế liền kề: H1-H2, H3-H4, H5-H6, H7-H8).
- **Ràng buộc đặt ghế**:
  - Tối đa **6 ghế** cho một lần đặt chỗ của khách hàng cá nhân.
  - Ghế Sweetbox bắt buộc chọn theo cặp số chẵn đầy đủ.
  - Không được chọn ghế đã có trạng thái `RESERVED` (đã bán) hoặc `HELD` bởi phiên khác.

---

## 3. Động cơ giữ chỗ (Seat Hold Engine & TTL)

- **Bảo vệ All-or-Nothing**: Khi khách hàng xác nhận danh sách ghế đã chọn, hệ thống tạo một lệnh Hold nguyên tử (Atomic Hold) cho toàn bộ ghế. Nếu có bất kỳ 1 ghế bị tranh chấp hoặc đã bán, toàn bộ lệnh Hold bị từ chối.
- **Thời hạn giữ ghế (Hold TTL)**:
  - Thời gian giữ chỗ hiệu lực: **5 phút (300 giây)** (tối đa cấu hình 10 phút).
  - Cảnh báo thời gian: Khi bộ đếm thời gian còn dưới 2 phút (120 giây), giao diện hiển thị cảnh báo sắp hết hạn giữ vé.
- **Trạng thái Hold (Vòng đời giữ chỗ)**:
  - `ACTIVE`: Lệnh giữ chỗ đang có hiệu lực trong thời hạn TTL (mặc định 300 giây).
  - `CONSUMED`: Lệnh giữ chỗ đã được sử dụng hợp lệ để tạo đơn hàng (`POST /api/orders`). Khi đã `CONSUMED`, mã giữ chỗ này không được phép tái sử dụng để tạo đơn khác và không thể hủy chủ động tùy tiện; ghế trong đơn hàng tiếp tục được bảo vệ trong thời hạn `holdExpiresAt`.
  - `EXPIRED`: Lệnh giữ chỗ hết hạn thời gian hiệu lực (quá 300 giây) mà chưa tạo đơn hàng; ghế lập tức được giải phóng lại kho tồn kho.
  - `CANCELLED`: Khách hàng chủ động hủy lệnh giữ chỗ khi còn ở trạng thái `ACTIVE` (`DELETE /api/hold`); ghế được giải phóng ngay lập tức.
- **Ràng buộc người dùng**: Một tài khoản người dùng (`userEmail`) chỉ được có duy nhất **1 lệnh Hold đang có hiệu lực (`ACTIVE` và chưa hết TTL)** tại một thời điểm trên toàn hệ thống.

---

## 4. Vòng đời giao dịch (Transaction Lifecycle)

### 4.1. Trạng thái Đặt vé (Booking)
- `PENDING_PAYMENT`: Đã tạo đơn hàng gắn với Hold ghế hợp lệ (`CONSUMED`), đang chờ khách hàng thanh toán trong thời hạn `holdExpiresAt`.
- `CONFIRMED`: Thanh toán thành công, ghế chính thức được ghi nhận mua (`reserved`/sold vĩnh viễn), vé điện tử E-Ticket có chữ ký số QR được cấp. Đơn hàng đã `CONFIRMED` tuyệt đối không bị chuyển thành `EXPIRED` bởi các sự kiện webhook đến muộn.
- `CANCELLED`: Đơn đặt chỗ bị hủy do khách hàng chủ động hủy trước khi thanh toán.
- `EXPIRED`: Đơn hàng ở trạng thái `PENDING_PAYMENT` nhưng quá thời hạn thanh toán mà chưa nhận được xác nhận thanh toán hợp lệ; ghế được giải phóng lại kho tồn kho (`available`).

### 4.2. Trạng thái Thanh toán (Payment)
- `PENDING`: Đang chờ cổng thanh toán (MoMo, VNPAY, Thẻ) phản hồi.
- `SUCCEEDED`: Giao dịch thanh toán được cổng xác nhận thành công và đối soát hợp lệ.
- `FAILED`: Giao dịch thanh toán thất bại (tài khoản không đủ tiền, khách hàng hủy giao dịch, lỗi kỹ thuật cổng...).
- `UNKNOWN`: Trạng thái chưa rõ ràng do mất kết nối hoặc timeout cổng thanh toán. Cần đưa vào luồng đối soát tự động, không được tự động hủy ngay lập tức.

### 4.3. Vé điện tử (E-Ticket)
- `ISSUED`: Vé đã phát hành kèm mã QR có chữ ký số HMAC-SHA256 xác thực từ Cinema Core secret.
- `CHECKED_IN`: Vé đã được quét mã QR tại cửa phòng chiếu bởi nhân viên rạp qua ứng dụng di động.
- `VOID`: Vé bị vô hiệu hóa do hoàn tiền hoặc hủy suất chiếu có thẩm quyền.

---

## 5. Các câu hỏi nghiệp vụ còn mở (Open Questions)

Các câu hỏi dưới đây được ghi nhận rõ và tiếp tục giữ ở trạng thái mở chờ quyết định chính thức từ phía Sản phẩm, Vận hành và Đối tác thanh toán:

1. **Xử lý trạng thái UNKNOWN và PROCESSING kéo dài:**
   - Khi cổng thanh toán gặp sự cố rớt mạng hoặc timeout khiến trạng thái giao dịch rơi vào `UNKNOWN` hoặc `PROCESSING` quá thời hạn giữ chỗ: Hiện tại hệ thống bảo lưu thông tin attempt và gắn cờ đối soát, không tự ý chuyển đơn thành công hoặc thất bại. Cần chốt quy chuẩn thời gian timeout tối đa (ví dụ sau 15 hay 30 phút) trước khi tự động đóng giao dịch và kích hoạt hoàn tiền cho khách hàng.
2. **Sự kiện Webhook đến sai thứ tự (Out-of-order Events) & Thanh toán trùng (Duplicate Payments):**
   - Trường hợp khách hàng thực hiện nhiều attempt (ví dụ tạo intent MoMo, sau đó đổi sang VNPAY thanh toán thành công và đơn đã `CONFIRMED`), nhưng sau đó webhook thành công từ attempt MoMo cũ lại đến trễ: Hệ thống hiện tại bảo vệ đơn `CONFIRMED`, giữ nguyên vé đã phát hành và đánh dấu attempt thứ hai là `reconciliationRequired = true` (HTTP 409 `DUPLICATE_PAYMENT_RECONCILIATION_REQUIRED`). Quy trình hoàn tiền tự động (Auto-refund API) hay đối soát kế toán thủ công qua dashboard ngân hàng cần được thống nhất cùng Payment Ops.
