# Cinema Core Service (`services/cinema-core`)

**Phạm vi tài liệu:** trách nhiệm backend mục tiêu; README/scaffold không chứng minh runtime đã hoạt động.
[Mô hình sản phẩm](../../docs/03-product/use-cases.md) sở hữu actor/BR/OPEN;
[đặc tả giao dịch](../../docs/05-specs/domain-context.md) diễn giải ràng buộc cần triển khai.

## Core Responsibilities

- **Authoritative Core**: Tồn kho theo suất và sơ đồ riêng của từng phòng, giá, hold nguyên tử 300 giây,
  xác nhận thanh toán, phát hành và sử dụng vé; không lấy fixture 64 ghế làm giới hạn sản phẩm.
- **Thanh toán và hoàn tiền**: MoMo/VNPAY; xác thực nguồn/chữ ký, số tiền và liên kết đơn, xử lý lặp
  và đối soát. Theo dõi hoàn tiền riêng với quyết định hủy. Provider lưu trữ/khóa chưa được quyết định ở đây.
- **Vé và soát vé**: Một QR chung cho lượt đặt, quyền/trạng thái theo ghế; kiểm tra và ghi nhận sử dụng
  qua Core để chống dùng lặp, kể cả đồng thời nhiều cửa. Thiết bị nhân viên phải online.
- **Hủy theo quyền**: Thực thi quyết định hủy đã được người có quyền duyệt, giữ phần quyền còn lại;
  phối hợp thông báo email. Không tự cấp quyền hoàn thủ công hoặc chốt cách xử lý sự cố còn mở.

## Implementation Boundary

[CONTEXT](../../CONTEXT.md) và [đối chiếu hiện trạng](../../docs/03-product/use-cases.md#7-hiện-trạng-và-chênh-lệch-so-với-mục-tiêu)
phân biệt scaffold/BFF mô phỏng với yêu cầu mục tiêu. Hợp đồng hiện tại chưa đủ cho toàn bộ
quyền theo ghế và vai trò vận hành; cần đặc tả/kiểm thử tiếp, giữ nguyên OPEN liên quan.
