# Catalog Service (`services/catalog-service`)

Thư mục định vị service theo thiết kế đã chốt; hiện chỉ có tài liệu, chưa có code hoặc runtime.
[Thiết kế microservices](../../docs/05-specs/004-service-decomposition/spec.md) sở hữu ranh giới;
[quyết định](../../docs/05-specs/004-service-decomposition/decisions.md) giữ lý do và nguồn duyệt.

## Trách nhiệm và dữ liệu

- Sở hữu nội dung phim: tên, mô tả, thể loại, trailer, thời lượng và phân loại độ tuổi.
- Cung cấp nội dung công khai/biên tập theo quyền và snapshot phiên bản phim đã công bố cho Core.
- Sở hữu database PostgreSQL logic riêng theo thiết kế; không chia sẻ ORM hoặc đọc SQL của service khác.

## Công nghệ đã chọn

Ảnh poster/banner dùng R2 Standard giữ ảnh gốc và Cloudflare Images remote transformations theo
[ADR-0019](../../docs/06-decisions/0019-r2-and-cloudflare-images-for-catalog-media.md).
Catalog giữ object key/version, metadata, quyền upload và xuất bản trong database riêng; upload xong
chưa tự công bố ảnh. Trailer dùng URL/video nhúng từ ngoài, không tự lưu/phục vụ video.
Chưa chọn framework, ORM, SDK hoặc cấu hình bucket/domain; chưa upload hay kiểm chứng runtime.

## Ranh giới tích hợp

Core lấy snapshot qua HTTP khi lập/công bố suất, trước transaction Core, rồi lưu snapshot/version
cùng suất. Đặt/soát vé dùng dữ liệu Core, không gọi Catalog mỗi lượt. Catalog không quyết định lịch,
giá giao dịch, ghế, hold hoặc quyền vé. Ngừng phiên bản/đính chính suất cần hợp đồng riêng theo thiết kế;
không tự ghi đè snapshot đã công bố.
