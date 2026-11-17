# Organizer Mobile (`apps/organizer-mobile`)

App vận hành mục tiêu cho iOS và Android, giao diện phù hợp từng hệ.
Hiện chỉ có tài liệu, chưa có scaffold/build/runtime ứng dụng.

[PRODUCT](PRODUCT.md) ghi bối cảnh quản trị viên, quản lý rạp và nhân viên soát vé;
[ADR-0002](../../docs/06-decisions/0002-customer-organizer-app-boundaries.md) ghi quyết định tách ứng dụng.

**Stack đã chọn:** React Native + Expo + TypeScript, Expo Router, development builds,
`expo-camera` đọc QR và `expo-secure-store` giữ dữ liệu phiên theo
[ADR-0016](../../docs/06-decisions/0016-expo-router-and-mobile-native-foundation.md).
TanStack Query/Zustand cho snapshot API/UI draft theo
[ADR-0017](../../docs/06-decisions/0017-tanstack-query-and-zustand-for-frontend-state.md);
React Hook Form + resolvers + Zod 4 theo
[ADR-0025](../../docs/06-decisions/0025-react-hook-form-and-zod-for-frontend-forms.md).
Giữ component native và tokens chung, không import primitive DOM của React Aria.
Chưa chọn SDK/version, scaffold/cài package hoặc kiểm camera/phiên trên thiết bị.
MMKV lưu vé offline thuộc Customer Mobile, không tạo hàng đợi soát ngoại tuyến cho nhân viên.

- Quản lý/quản trị thực hiện tác vụ theo quyền/rạp được cấp; phạm vi màn hình Mobile cần đặc tả theo tính năng.
- Nhân viên soát vé tra cứu hỗ trợ, quét QR hoặc xác minh theo O-02, kiểm tra quyền từng ghế qua Core
  và chỉ ghi nhận ghế được phép. Thiết bị nhân viên phải online.
- Quyền soát vé, giao combo, xét hủy/hoàn và quản trị vẫn tách biệt. Kênh giao combo cần đặc tả riêng;
  cùng ứng dụng không có nghĩa cùng quyền.

[Mô hình use case](../../docs/03-product/use-cases.md) sở hữu actor/BR/OPEN;
[mô tả](../../docs/03-product/use-case-descriptions.md) sở hữu luồng/ngoại lệ.
Không bổ sung soát ngoại tuyến hoặc quyền vận hành mới từ việc chuyển thư mục.
