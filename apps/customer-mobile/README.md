# Movie Booking Mobile App (`apps/customer-mobile`)

Ứng dụng di động mục tiêu cho khách hàng trên iOS và Android. README mô tả trách nhiệm dự kiến,
không xác nhận triển khai runtime; xem [CONTEXT](../../CONTEXT.md).

## Responsibilities & User Roles

1. **Khách hàng**: Khám phá phim/rạp/suất, đặt ghế theo sơ đồ từng phòng, dùng combo/voucher,
   thanh toán MoMo/VNPAY, xem đơn/vé và dùng trợ lý chat trong phạm vi đã chốt.
   Có thể lưu QR chung để xuất trình khi điện thoại không có mạng.
Trải nghiệm nhân viên soát vé thuộc [Organizer Mobile](../organizer-mobile/PRODUCT.md);
việc chuyển kênh không thay quyền actor hoặc yêu cầu thiết bị nhân viên online.

App khách hàng không chứa chế độ nhân viên/vận hành. Xem [PRODUCT](PRODUCT.md) cho bối cảnh riêng;
framework chưa chốt, thư mục hiện chưa có code hoặc build Mobile.

Actor, mục tiêu và giới hạn theo [mô hình use case](../../docs/03-product/use-cases.md) và
[mô tả use case](../../docs/03-product/use-case-descriptions.md). Tài liệu này không mở rộng sang
Apple Pay/Google Pay hoặc soát ngoại tuyến; chính sách ngoại lệ không có QR vẫn giữ ở OPEN-06.
