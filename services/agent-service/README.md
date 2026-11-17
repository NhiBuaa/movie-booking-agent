# Movie Booking AI Agent Service (`services/agent-service`)

**Phạm vi tài liệu:** trách nhiệm dịch vụ mục tiêu. Logic chat client/fixture hiện có không xác nhận
LLM/tool calling runtime đã tích hợp; xem [CONTEXT](../../CONTEXT.md).

## Core Responsibilities

- Diễn giải nhu cầu phim/rạp/suất và điều phối công cụ Cinema Core; không tự giữ ghế, định giá hay phát vé.
- Giữ ngữ cảnh hành trình CB-01–CB-06 và cùng đơn/hold khi đổi kênh; không tự khởi động lại TTL.
- Hỗ trợ tra cứu đơn/vé (B-07), bỏ hold (B-08), đổi ghế cùng suất (B-09), gửi yêu cầu hủy đã mua (R-01)
  và theo dõi hủy/hoàn (R-04). Đổi ghế cần khách xác nhận rõ ghế cũ → mới và Core kiểm tra/thực hiện.
- C-01 gọi API mô hình AI bên ngoài qua Agent Service theo BR-34: ngữ cảnh tối thiểu đã lọc, đúng quyền;
  không gửi thông tin nhận diện, toàn hồ sơ/đơn, bí mật, QR vé hoặc dữ liệu thẻ cho mô hình.
- Khi mô hình gián đoạn/hết hạn mức, báo rõ và hướng khách sang màn hình trực tiếp khi Core còn hoạt động;
  tra cứu giao dịch đang dở trước thử lại, không gia hạn hold hoặc tự chuyển mô hình/nhà cung cấp.
- Gửi lệnh sau xác nhận cần thiết của khách; chỉ trình bày vé hợp lệ sau xác minh phản hồi/chữ ký Core.
  Không xét duyệt hủy, hoàn tiền thay người có thẩm quyền, soát vé, giao combo hoặc quản trị vận hành.

[Mô hình và bảng phạm vi kênh AI](../../docs/03-product/use-cases.md#phạm-vi-kênh-ai) sở hữu mục tiêu/quyền;
[đặc tả chat](../../docs/05-specs/conversational-booking.md) ánh xạ CB sang use case.
Hội viên/đổi điểm, đánh giá/xét lại, tài khoản/xóa tài khoản, xóa chat và yêu cầu gửi lại email dùng
màn hình chuyên biệt. Chat không tự xóa theo kỳ; khách chủ động xóa qua A-06, độc lập với đơn/vé/hoàn.
Q173-A đã đồng bộ yêu cầu mục tiêu; thông báo qua hộp thông báo và email theo L-06/N-01/BR-33,
chưa SMS/push. Nhà cung cấp/mô hình/ngân sách/cấu hình và điều kiện dữ liệu còn ở OPEN-09/OPEN-10;
không suy danh sách tool hoặc tài liệu thành bằng chứng đã triển khai.
