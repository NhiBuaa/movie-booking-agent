# Reporting Service (`services/reporting-service`)

Thư mục định vị service theo thiết kế đã chốt; hiện chỉ có tài liệu, chưa có code hoặc runtime.
[Thiết kế microservices](../../docs/05-specs/004-service-decomposition/spec.md) sở hữu ranh giới;
[quyết định](../../docs/05-specs/004-service-decomposition/decisions.md) giữ lý do và nguồn duyệt.

## Trách nhiệm và dữ liệu

- Sở hữu bản sao/mô hình đọc và dữ liệu tổng hợp phục vụ báo cáo vận hành/doanh thu, kèm mốc cập nhật.
- Cung cấp báo cáo theo quyền/phạm vi rạp; định nghĩa chỉ số còn theo mô hình sản phẩm.
- Sở hữu database PostgreSQL logic riêng theo thiết kế; không chia sẻ ORM hoặc đọc SQL của service khác.

## Ranh giới tích hợp

Nhận dữ liệu qua hợp đồng/sự kiện đã commit, xử lý lặp và phục hồi có kiểm soát. Không dùng JOIN
xuyên database service hoặc lấy báo cáo làm căn cứ xác nhận thu/hoàn tiền. Lỗi/trễ Reporting không
chặn đặt/soát vé; phải thể hiện mốc cập nhật. Rebuild dữ liệu báo cáo không phát sinh gửi lại email,
thu hoặc hoàn tiền; retention và quy trình rebuild cụ thể cần đặc tả trước triển khai.
