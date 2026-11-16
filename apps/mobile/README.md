# Movie Booking Mobile App (`apps/mobile`)

Ứng dụng di động mục tiêu cho khách hàng và nhân viên soát vé. README mô tả trách nhiệm dự kiến,
không xác nhận triển khai runtime; xem [CONTEXT](../../CONTEXT.md).

## Responsibilities & User Roles

1. **Khách hàng**: Khám phá phim/rạp/suất, đặt ghế theo sơ đồ từng phòng, dùng combo/voucher,
   thanh toán MoMo/VNPAY, xem đơn/vé và dùng trợ lý chat trong phạm vi đã chốt.
   Có thể lưu QR chung để xuất trình khi điện thoại không có mạng.
2. **Nhân viên soát vé**: Tra cứu hỗ trợ, quét QR hoặc xác minh theo O-02, chọn quyền ghế cần ghi nhận
   và kiểm tra qua Core. Thiết bị nhân viên phải online; quét QR không tự dùng hết đơn.

Vai trò giao combo, quản lý rạp và quản trị chuỗi có quyền riêng; không tự cấp chúng cho chế độ
nhân viên soát vé hoặc thêm quyền khóa/mở ghế khẩn cấp. Kênh/màn hình cho quyền mới cần đặc tả theo tính năng.

Actor, mục tiêu và giới hạn theo [mô hình use case](../../docs/03-product/use-cases.md) và
[mô tả use case](../../docs/03-product/use-case-descriptions.md). Tài liệu này không mở rộng sang
Apple Pay/Google Pay hoặc soát ngoại tuyến; chính sách ngoại lệ không có QR vẫn giữ ở OPEN-06.
