# @platform/ui

Thư viện component dùng chung mục tiêu cho **Web và Organizer**, theo
[Ferrari Dark Cinema](../../DESIGN.md). Hiện trạng package chưa chứng minh component đã triển khai;
xem [CONTEXT](../../CONTEXT.md).

**Nền tương tác đã chọn:** React Aria Components theo
[ADR-0026](../../docs/06-decisions/0026-react-aria-components-for-web-ui-primitives.md), cho component
phức tạp mới/đang sửa trong phạm vi; giữ CSS modules/tokens, tái dùng component đơn giản hiện có.
Form engine theo [ADR-0025](../../docs/06-decisions/0025-react-hook-form-and-zod-for-frontend-forms.md).
Chưa cài dependency, viết wrappers, migrate UI hoặc kiểm accessibility/SSR/runtime.

Component chia sẻ theo nhu cầu thực tế của `apps/web`/`apps/organizer`: buttons/inputs, dialog/menu,
thẻ phim, trailer, thông báo và hiển thị QR. Widget chuyên biệt cần đặc tả riêng; không suy React Aria
là engine sơ đồ ghế hay timeline xếp lịch. Sơ đồ ghế theo phòng, không cố định ma trận 64 ghế.

Mobile giữ component React Native riêng, chia sẻ tokens/logic phù hợp; không import primitive DOM
như component native. Core vẫn sở hữu xác nhận giao dịch, vé và soát vé.
