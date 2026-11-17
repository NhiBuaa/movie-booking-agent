# Movie Booking Mobile App (`apps/mobile`)

Ứng dụng di động mục tiêu cho khách hàng và nhân viên soát vé. README mô tả trách nhiệm dự kiến,
không xác nhận triển khai runtime; xem [CONTEXT](../../CONTEXT.md).

**Stack đã chọn:** React Native + Expo + TypeScript, Expo Router, development builds,
`expo-camera` đọc QR và `expo-secure-store` lưu dữ liệu phiên theo
[ADR-0016](../../docs/06-decisions/0016-expo-router-and-mobile-native-foundation.md).
Giữ Ferrari Dark Cinema và quyền Core; bản preview/release dùng demo là build riêng.
Chưa scaffold/cài package/build; SDK, gói cloud build và phát hành store còn cần thiết kế/lựa chọn.

**Client SSE đã chọn:** `expo/fetch` và `eventsource-parser`, chung parser/hợp đồng với Web theo
[ADR-0024](../../docs/06-decisions/0024-fetch-and-eventsource-parser-for-sse-clients.md).
Ứng dụng quản lý auth/error/reconnect/abort và AppState; chưa viết adapter hoặc kiểm native streaming.

**Kho vé offline đã chọn:** MMKV bật mã hóa lưu snapshot vé/QR, SecureStore giữ khóa theo
[ADR-0023](../../docs/06-decisions/0023-encrypted-mmkv-for-offline-mobile-tickets.md).
Chỉ xuất trình bản đã lưu; Core vẫn kiểm quyền hiện hành và soát online. Retention, logout/đổi tài khoản,
backup/mất khóa và native compatibility cần đặc tả; chưa cài/build hoặc xác nhận mã hóa trên thiết bị.

**Kiểm thử mục tiêu:** Jest/jest-expo + React Native Testing Library, Maestro cho app đã build theo
[ADR-0021](../../docs/06-decisions/0021-layered-testing-stack-for-platform.md).
Chưa cấu hình/chạy; camera/QR và hành vi native trên thiết bị thật vẫn cần bằng chứng riêng.

**Form đã chọn:** React Hook Form + resolvers + Zod 4 theo
[ADR-0025](../../docs/06-decisions/0025-react-hook-form-and-zod-for-frontend-forms.md).
Input native dùng adapter controlled phù hợp; giữ theme native, không suy component DOM chạy trên Expo.
Form nhỏ có thể dùng React state; chưa cài hoặc kiểm form/native runtime.

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
