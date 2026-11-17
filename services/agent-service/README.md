# Movie Booking AI Agent Service (`services/agent-service`)

**Phạm vi tài liệu:** trách nhiệm dịch vụ mục tiêu. Logic chat client/fixture hiện có không xác nhận
LLM/tool calling runtime đã tích hợp; xem [CONTEXT](../../CONTEXT.md).

## Core Responsibilities

- Diễn giải nhu cầu phim/rạp/suất, truy vấn Catalog/Core theo quyền và lập đề xuất có cấu trúc.
- Sở hữu hội thoại/checkpoint trong database riêng; không sở hữu ghế, giá, đơn, tiền hoặc vé.
- Giữ ngữ cảnh hành trình CB-01–CB-06 và cùng đơn/hold khi đổi kênh; không tự khởi động lại TTL.
- Hỗ trợ tra cứu đơn/vé (B-07), bỏ hold (B-08), gửi yêu cầu hủy đã mua (R-01) và theo dõi hủy/hoàn (R-04).
- App/BFF thực thi lệnh đã được khách xác nhận dưới danh tính khách; Agent nhận kết quả đã xác minh
  để tiếp tục chat, không giữ credential giao dịch rộng trong mô hình/checkpoint.
  Chỉ trình bày vé hợp lệ sau xác minh phản hồi/chữ ký Core.
  Không xét duyệt hủy, hoàn tiền thay người có thẩm quyền, soát vé, giao combo hoặc quản trị vận hành.

[Mô hình và bảng phạm vi kênh AI](../../docs/03-product/use-cases.md#phạm-vi-kênh-ai) sở hữu mục tiêu/quyền;
[đặc tả chat](../../docs/05-specs/conversational-booking.md) ánh xạ CB sang use case.
[Thiết kế microservices](../../docs/05-specs/004-service-decomposition/spec.md) sở hữu ranh giới dữ liệu,
thực thi lệnh và lỗi; [quyết định](../../docs/05-specs/004-service-decomposition/decisions.md) giữ lý do đã duyệt.
Hội viên/đổi điểm, đánh giá và tài khoản dùng màn hình chuyên biệt. Nhà cung cấp LLM/email và
ngoại lệ chuyển phát theo OPEN-09; Notification đã được chọn sở hữu hộp thông báo/chuyển phát.
Không suy danh sách tool hiện có thành quyền thực thi trực tiếp hoặc phạm vi đã triển khai đầy đủ.
