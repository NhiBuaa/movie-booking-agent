# @platform/shared-logic

Package mục tiêu cho logic thuần có thể chia sẻ giữa các phân hệ; hiện chỉ có scaffold,
không xác nhận các hàm bên dưới đã được triển khai hoặc kiểm thử.

- Tiện ích sơ đồ ghế theo cấu hình phòng, giới hạn 6 ghế và kiểm cặp Sweetbox; hàng J là mẫu,
  không là vị trí Sweetbox bắt buộc ở mọi phòng.
- Tính toán phục vụ hiển thị và định dạng tiền/tổng tạm tính; Core kiểm giá/ưu đãi và tổng chính thức.
- Hiển thị đếm ngược từ thời điểm hết hạn do Core cấp; client không xác nhận hoặc gia hạn hold.

Core giữ việc xác thực thanh toán, ký/phát hành vé và quyết định quyền sử dụng vé theo
[ranh giới hệ thống](../../docs/02-architecture/system-boundaries.md).
Package dùng chung không chứa secret ký vé/cổng thanh toán hoặc cho client tự phát hành vé.
Phạm vi helper, exports và tests cụ thể cần đặc tả trước triển khai. Theo
[thiết kế service](../../docs/05-specs/004-service-decomposition/spec.md), mỗi service sở hữu mô hình
nội bộ và dữ liệu riêng; dùng chung package không cấp quyền truy cập dữ liệu chéo service.
Khóa ký không được vào client bundle hoặc checkpoint Agent.
