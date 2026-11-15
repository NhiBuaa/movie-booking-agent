# Business Domain Context & Transaction Rules

Tài liệu này xác định các quy tắc nghiệp vụ cốt lõi, vòng đời giao dịch và trạng thái dữ liệu chuẩn của nền tảng **Movie Booking Platform**.

---

## 1. Ranh giới thẩm quyền (Authoritative Boundaries)

- **Cinema Core API (`services/cinema-core`)**: Là **Nguồn chân lý duy nhất (Single Source of Truth)** về tồn kho suất chiếu, trạng thái ghế, giữ chỗ (hold), giá vé, giao dịch thanh toán và vé điện tử hợp lệ.
- **AI Agent (`services/agent-service`)**: Đóng vai trò trợ lý thông minh diễn giải ngôn ngữ tự nhiên, gợi ý và điều phối tác vụ. AI Agent **không bao giờ tự xác nhận** giao dịch thành công nếu không có phản hồi và chữ ký số từ Cinema Core.
- **Frontend / Client (`apps/web`, `apps/mobile`)**: Chỉ hiển thị trạng thái giao dịch được Cinema Core xác thực. Tuyệt đối không tự suy diễn trạng thái thành công hoặc thất bại từ các phản hồi chưa rõ ràng (`UNKNOWN`).

---

## 2. Quy tắc phòng chiếu & Ma trận ghế (Seat Matrix)

- **Quy mô phòng chiếu chuẩn**: Ma trận 64 ghế (8 hàng A–H × 8 cột 1–8).
  - **Hàng A – D**: Ghế Tiêu chuẩn (Standard).
  - **Hàng E – G**: Ghế VIP (Vị trí trung tâm góc nhìn tối ưu).
  - **Hàng H (hoặc J)**: Ghế Sweetbox (Ghế đôi Couple, ghép cặp cố định 2 ghế liền kề).
- **Ràng buộc đặt ghế**:
  - Tối đa **6 ghế** cho một lần đặt chỗ của khách hàng cá nhân.
  - Ghế Sweetbox bắt buộc chọn theo cặp số chẵn (ví dụ: H1-H2, H3-H4).
  - Không được chọn ghế đã có trạng thái `RESERVED` hoặc `HELD` bởi phiên khác.

---

## 3. Động cơ giữ chỗ (Seat Hold Engine & TTL)

- **Bảo vệ All-or-Nothing**: Khi khách hàng xác nhận danh sách ghế đã chọn, hệ thống tạo một lệnh Hold nguyên tử (Atomic Hold) cho toàn bộ ghế. Nếu có bất kỳ 1 ghế bị tranh chấp, toàn bộ lệnh Hold bị từ chối.
- **Thời hạn giữ ghế (Hold TTL)**:
  - Thời gian giữ chỗ hiệu lực: **5 phút (300 giây)** (tối đa cấu hình 10 phút).
  - Trạng thái Hold: `ACTIVE`, `EXPIRED`, `CONSUMED` (đã chuyển thành vé mua thành công), `CANCELLED`.
  - Cảnh báo thời gian: Khi bộ đếm thời gian còn dưới 2 phút (120 giây), giao diện hiển thị cảnh báo sắp hết hạn giữ vé.
- **Ràng buộc người dùng**: Một tài khoản người dùng chỉ được có duy nhất **1 lệnh Hold có hiệu lực** tại một thời điểm trên toàn hệ thống.

---

## 4. Vòng đời giao dịch (Transaction Lifecycle)

### 4.1. Trạng thái Đặt vé (Booking)
- `PENDING_PAYMENT`: Đã tạo đơn hàng gắn với Hold ghế hợp lệ, đang chờ khách hàng thanh toán.
- `CONFIRMED`: Thanh toán thành công, ghế chính thức được ghi nhận mua.
- `CANCELLED`: Đơn đặt chỗ bị hủy do quá hạn hold hoặc khách hàng chủ động hủy.

### 4.2. Trạng thái Thanh toán (Payment)
- `PENDING`: Đang chờ cổng thanh toán (MoMo, VNPAY, Thẻ) phản hồi.
- `SUCCEEDED`: Giao dịch thanh toán được cổng xác nhận thành công.
- `FAILED`: Giao dịch thanh toán thất bại (tài khoản không đủ tiền, lỗi giao dịch...).
- `UNKNOWN`: Trạng thái chưa rõ ràng do mất kết nối hoặc timeout cổng thanh toán. Cần đưa vào luồng đối soát tự động, không được tự động hủy ngay lập tức.

### 4.3. Vé điện tử (E-Ticket)
- `ISSUED`: Vé đã phát hành kèm mã QR có chữ ký số xác thực.
- `CHECKED_IN`: Vé đã được quét mã QR tại cửa phòng chiếu bởi nhân viên rạp.
- `VOID`: Vé bị vô hiệu hóa do hoàn tiền hoặc hủy suất chiếu.
