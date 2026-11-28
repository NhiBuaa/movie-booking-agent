# Community Service (`services/community-service`)

Thư mục định vị service theo thiết kế đã chốt; hiện chỉ có tài liệu, chưa có code hoặc runtime.
[Thiết kế microservices](../../docs/05-specs/004-service-decomposition/spec.md) sở hữu ranh giới;
[quyết định](../../docs/05-specs/004-service-decomposition/decisions.md) giữ lý do và nguồn duyệt.

## Trách nhiệm và dữ liệu

- Sở hữu đánh giá, trạng thái hiển thị/lịch sử kiểm duyệt và phim yêu thích.
- Giữ bản sao có phiên bản của căn cứ đủ điều kiện đánh giá do Core kết luận theo tài khoản đặt–phim.
- Sở hữu database PostgreSQL logic riêng theo thiết kế; không chia sẻ ORM hoặc đọc SQL của service khác.

## Ranh giới tích hợp

Nhận căn cứ qua Outbox/Kafka; khi thiếu/chưa rõ/quá cũ thì truy vấn HTTP tới Core. Căn cứ dương tính
cục bộ còn hợp lệ theo chính sách độ mới có thể dùng khi Core gián đoạn; thu hồi đã biết phải từ chối.
Chưa rõ và Core không đáp ứng thì tạm chưa cho đăng, không kết luận khách chưa xem hoặc bỏ kiểm tra.
Cửa sổ trễ đính chính chưa chọn giá trị. Không tự suy quyền từ mọi lần quét/hoàn tiền hoặc tự xóa
đánh giá đã đăng; lỗi Community không chặn đặt/soát vé.
