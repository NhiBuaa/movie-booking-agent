# Cinema Core Service (`services/cinema-core`)

**Phạm vi tài liệu:** trách nhiệm backend mục tiêu; README/scaffold không chứng minh runtime đã hoạt động.
[Mô hình sản phẩm](../../docs/03-product/use-cases.md) sở hữu actor/BR/OPEN;
[đặc tả giao dịch](../../docs/05-specs/domain-context.md) diễn giải ràng buộc cần triển khai.

## Core Responsibilities

- **Authoritative Core**: Tồn kho theo suất và sơ đồ riêng của từng phòng, giá, hold nguyên tử 300 giây,
  xác nhận thanh toán, phát hành và sử dụng vé; không lấy fixture 64 ghế làm giới hạn sản phẩm.
- **Thanh toán và hoàn tiền**: MoMo/VNPAY; xác thực nguồn/chữ ký, số tiền và liên kết đơn, xử lý lặp
  và đối soát. Theo dõi hoàn tiền riêng với quyết định hủy. Đơn 0đ hợp lệ xác nhận/phát hành theo BR-21,
  không gọi cổng thu 0đ; khoản có tiền và nghĩa vụ hoàn nhỏ theo BR-27, khả năng merchant còn cần kiểm chứng.
- **Đổi ghế sau mua**: B-09/BR-19 chuyển quyền cùng suất nguyên tử, giữ quyền cũ khi lỗi, chống đổi lặp;
  hợp đồng giữ ghế đích/QR/API còn cần đặc tả, không tự thêm TTL mới.
- **Vé và soát vé**: Một QR chung cho lượt đặt, quyền/trạng thái theo ghế; kiểm tra và ghi nhận sử dụng
  qua Core để chống dùng lặp, kể cả đồng thời nhiều cửa. Thiết bị nhân viên phải online.
- **Hủy theo quyền**: Thực thi quyết định hủy đã được người có quyền duyệt, giữ phần quyền còn lại;
  tiền thực trả/phân bổ ưu đãi, combo, khôi phục quyền lợi và lỗi dịch vụ theo BR-20…BR-29.
  Chính sách/thẩm quyền đã chốt trong Q32–Q172, xác nhận tổng hợp Q173; không tự cấp quyền hoàn tay.
- **Quyền lợi và dữ liệu**: Hội viên/điểm/voucher và sửa sai theo BR-28…BR-29; báo cáo theo BR-35.
  Xóa chat/tài khoản không làm mất quyền với đơn đã mua hoặc nghĩa vụ hoàn; phạm vi giữ/xóa và
  ngoại lệ theo A-06…A-08/BR-37…BR-39. Thông báo dịch vụ theo N-01/BR-33.

## Implementation Boundary

[CONTEXT](../../CONTEXT.md) và [đối chiếu hiện trạng](../../docs/03-product/use-cases.md#7-hiện-trạng-và-chênh-lệch-so-với-mục-tiêu)
phân biệt scaffold/BFF mô phỏng với yêu cầu mục tiêu. Hợp đồng hiện tại chưa đủ cho toàn bộ
quyền theo ghế và vai trò vận hành; cần đặc tả/kiểm thử tiếp, giữ nguyên OPEN liên quan.
