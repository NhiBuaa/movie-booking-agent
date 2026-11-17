# Catalog Service (`services/catalog-service`)

Thư mục định vị service theo thiết kế đã chốt; hiện chỉ có tài liệu, chưa có code hoặc runtime.
[Thiết kế microservices](../../docs/05-specs/004-service-decomposition/spec.md) sở hữu ranh giới;
[quyết định](../../docs/05-specs/004-service-decomposition/decisions.md) giữ lý do và nguồn duyệt.

## Trách nhiệm và dữ liệu

- Sở hữu nội dung phim: tên, mô tả, thể loại, trailer, thời lượng và phân loại độ tuổi.
- Cung cấp nội dung công khai/biên tập theo quyền và snapshot phiên bản phim đã công bố cho Core.
- Sở hữu database PostgreSQL logic riêng theo thiết kế; không chia sẻ ORM hoặc đọc SQL của service khác.

## Ranh giới tích hợp

Core lấy snapshot qua HTTP khi lập/công bố suất, trước transaction Core, rồi lưu snapshot/version
cùng suất. Đặt/soát vé dùng dữ liệu Core, không gọi Catalog mỗi lượt. Catalog không quyết định lịch,
giá giao dịch, ghế, hold hoặc quyền vé. Ngừng phiên bản/đính chính suất cần hợp đồng riêng theo thiết kế;
không tự ghi đè snapshot đã công bố.
