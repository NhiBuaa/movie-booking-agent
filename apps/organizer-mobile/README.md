# Organizer Mobile (`apps/organizer-mobile`)

App vận hành mục tiêu cho iOS và Android, giao diện phù hợp từng hệ; framework chưa chốt.
Hiện chỉ có tài liệu, chưa có scaffold/build/runtime ứng dụng.

[PRODUCT](PRODUCT.md) ghi bối cảnh quản trị viên, quản lý rạp và nhân viên soát vé;
[ADR-0002](../../docs/06-decisions/0002-customer-organizer-app-boundaries.md) ghi quyết định tách ứng dụng.

- Quản lý/quản trị thực hiện tác vụ theo quyền/rạp được cấp; phạm vi màn hình Mobile cần đặc tả theo tính năng.
- Nhân viên soát vé tra cứu hỗ trợ, quét QR hoặc xác minh theo O-02, kiểm tra quyền từng ghế qua Core
  và chỉ ghi nhận ghế được phép. Thiết bị nhân viên phải online.
- Quyền soát vé, giao combo, xét hủy/hoàn và quản trị vẫn tách biệt. Kênh giao combo cần đặc tả riêng;
  cùng ứng dụng không có nghĩa cùng quyền.

[Mô hình use case](../../docs/03-product/use-cases.md) sở hữu actor/BR/OPEN;
[mô tả](../../docs/03-product/use-case-descriptions.md) sở hữu luồng/ngoại lệ.
Không bổ sung soát ngoại tuyến hoặc quyền vận hành mới từ việc chuyển thư mục.
