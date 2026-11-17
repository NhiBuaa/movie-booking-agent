# Cinema Core Service (`services/cinema-core`)

**Phạm vi tài liệu:** trách nhiệm backend mục tiêu; README/scaffold không chứng minh runtime đã hoạt động.
[Mô hình sản phẩm](../../docs/03-product/use-cases.md) sở hữu actor/BR/OPEN;
[đặc tả giao dịch](../../docs/05-specs/domain-context.md) diễn giải ràng buộc cần triển khai.

## Core Responsibilities

- **Rạp và lịch**: Rạp/phòng/sơ đồ ghế, lịch chiếu, giá/điều kiện bán. Catalog sở hữu nội dung phim;
  Core lấy snapshot có phiên bản qua HTTP khi lập/công bố suất và lưu cùng suất để dùng khi đặt/soát.
- **Authoritative Core**: Tồn kho theo suất và sơ đồ riêng của từng phòng, giá, hold nguyên tử 300 giây,
  xác nhận thanh toán, phát hành và sử dụng vé; không lấy fixture 64 ghế làm giới hạn sản phẩm.
- **Thanh toán và hoàn tiền**: MoMo/VNPAY; xác thực nguồn/chữ ký, số tiền và liên kết đơn, xử lý lặp
  và đối soát. Theo dõi hoàn tiền riêng với quyết định hủy. Provider lưu trữ/khóa chưa được quyết định ở đây.
- **Vé và soát vé**: Một QR chung cho lượt đặt, quyền/trạng thái theo ghế; kiểm tra và ghi nhận sử dụng
  qua Core để chống dùng lặp, kể cả đồng thời nhiều cửa. Thiết bị nhân viên phải online.
- **Hủy theo quyền**: Thực thi quyết định hủy đã được người có quyền duyệt, giữ phần quyền còn lại;
  hủy suất đã duyệt có hiệu lực tại Core trước xử lý nền từng đơn. Không tự cấp quyền hoàn thủ công
  hoặc chốt cách xử lý sự cố còn mở.
- **Module trong Core**: Hội viên, Ưu đãi/Voucher và Combo dùng interface và transaction cục bộ;
  không tách thành service/database riêng trong thiết kế đã chọn.

## Service Boundaries

[Thiết kế microservices](../../docs/05-specs/004-service-decomposition/spec.md) sở hữu hợp đồng kiến trúc;
[quyết định](../../docs/05-specs/004-service-decomposition/decisions.md) giữ lý do và nguồn duyệt.
Core sở hữu database PostgreSQL logic riêng; không đọc SQL của service khác. Sự kiện đã commit qua
outbox/CDC/Kafka phục vụ Reporting, Notification và căn cứ đánh giá của Community.
Lệnh dùng mã thao tác ổn định, ngoại tác thanh toán/hoàn nằm ngoài transaction database.

Identity sở hữu danh tính/quyền; Core kiểm bằng chứng cục bộ khi soát/giao combo thường xuyên và áp dụng
thu hồi đã biết, không gọi Identity ở mỗi lượt. Webhook/đối soát độc lập với phiên khách; tác vụ rủi ro
cao cần quyền hiện hành. Notification chuyển phát nhưng không sở hữu/xác minh mã nghiệp vụ;
email có mã nhạy cảm dùng Claim Check qua luồng riêng theo thiết kế, không plaintext trong broker.

## Implementation Boundary

[CONTEXT](../../CONTEXT.md) và [đối chiếu hiện trạng](../../docs/03-product/use-cases.md#7-hiện-trạng-và-chênh-lệch-so-với-mục-tiêu)
phân biệt scaffold/BFF mô phỏng với yêu cầu mục tiêu. Hợp đồng hiện tại chưa đủ cho toàn bộ
quyền theo ghế và vai trò vận hành; cần đặc tả/kiểm thử tiếp, giữ nguyên OPEN liên quan.
