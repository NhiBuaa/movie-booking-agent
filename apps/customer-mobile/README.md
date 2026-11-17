# Movie Booking Mobile App (`apps/customer-mobile`)

Ứng dụng di động mục tiêu cho khách hàng trên iOS và Android. README mô tả trách nhiệm dự kiến,
không xác nhận triển khai runtime; xem [CONTEXT](../../CONTEXT.md).

**Stack đã chọn:** React Native + Expo + TypeScript, Expo Router, development builds,
`expo-secure-store` lưu dữ liệu phiên theo
[ADR-0016](../../docs/06-decisions/0016-expo-router-and-mobile-native-foundation.md).
Giữ Ferrari Dark Cinema và quyền Core; bản preview/release dùng demo là build riêng.
Camera soát vé thuộc Organizer Mobile; app khách hàng chỉ xuất trình QR đã được cấp.
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
Chưa cấu hình/chạy; xuất trình QR và hành vi native trên thiết bị thật vẫn cần bằng chứng riêng.

**Form đã chọn:** React Hook Form + resolvers + Zod 4 theo
[ADR-0025](../../docs/06-decisions/0025-react-hook-form-and-zod-for-frontend-forms.md).
Input native dùng adapter controlled phù hợp; giữ theme native, không suy component DOM chạy trên Expo.
Form nhỏ có thể dùng React state; chưa cài hoặc kiểm form/native runtime.

**Trạng thái đã chọn:** TanStack Query cho snapshot API và Zustand có phạm vi cho UI draft theo
[ADR-0017](../../docs/06-decisions/0017-tanstack-query-and-zustand-for-frontend-state.md).
React local state vẫn là mặc định; không lưu credential hoặc tự phát lại lệnh giao dịch từ cache.

## Responsibilities & User Roles

1. **Khách hàng**: Khám phá phim/rạp/suất, đặt ghế theo sơ đồ từng phòng, dùng combo/voucher,
   thanh toán MoMo/VNPAY, xem đơn/vé và dùng trợ lý chat trong phạm vi đã chốt.
   Có thể lưu QR chung để xuất trình khi điện thoại không có mạng.

Trải nghiệm nhân viên soát vé thuộc [Organizer Mobile](../organizer-mobile/PRODUCT.md);
việc chuyển kênh không thay quyền actor hoặc yêu cầu thiết bị nhân viên online.

App khách hàng không chứa chế độ nhân viên/vận hành. Xem [PRODUCT](PRODUCT.md) cho bối cảnh riêng;
stack đã chọn ở trên, thư mục hiện chưa có code hoặc build Mobile.

Actor, mục tiêu và giới hạn theo [mô hình use case](../../docs/03-product/use-cases.md) và
[mô tả use case](../../docs/03-product/use-case-descriptions.md). Tài liệu này không mở rộng sang
Apple Pay/Google Pay hoặc soát ngoại tuyến. Xác minh khi thiếu QR đã chốt ở O-02/BR-09 và Q133/Q163;
OPEN-06 giữ các phụ thuộc đặc tả/kiểm chứng, không mở đường bỏ xác minh.
