# Movie Booking AI Agent Service (`services/agent-service`)

**Phạm vi tài liệu:** trách nhiệm dịch vụ mục tiêu. Logic chat client/fixture hiện có không xác nhận
LLM/tool calling runtime đã tích hợp; xem [CONTEXT](../../CONTEXT.md).

## Core Responsibilities

- Diễn giải nhu cầu phim/rạp/suất và điều phối công cụ Cinema Core; không tự giữ ghế, định giá hay phát vé.
- Giữ ngữ cảnh hành trình CB-01–CB-06 và cùng đơn/hold khi đổi kênh; không tự khởi động lại TTL.
- Hỗ trợ tra cứu đơn/vé (B-07), bỏ hold (B-08), gửi yêu cầu hủy đã mua (R-01) và theo dõi hủy/hoàn (R-04).
- Gửi lệnh sau xác nhận cần thiết của khách; chỉ trình bày vé hợp lệ sau xác minh phản hồi/chữ ký Core.
  Không xét duyệt hủy, hoàn tiền thay người có thẩm quyền, soát vé, giao combo hoặc quản trị vận hành.

[Mô hình và bảng phạm vi kênh AI](../../docs/03-product/use-cases.md#phạm-vi-kênh-ai) sở hữu mục tiêu/quyền;
[đặc tả chat](../../docs/05-specs/conversational-booking.md) ánh xạ CB sang use case.
Hội viên/đổi điểm, đánh giá và tài khoản dùng màn hình chuyên biệt. Nhà cung cấp LLM/email và
kênh thông báo ngoài email giữ ở OPEN-09; không suy danh sách tool hiện có thành phạm vi đã triển khai đầy đủ.
