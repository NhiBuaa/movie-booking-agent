# ADR-0016 — Expo Router và nền tảng native cho Mobile

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý với đề xuất của bạn” sau đề xuất A:
Expo Router, development builds, expo-camera và expo-secure-store trong hội thoại Tech Stack
(`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`). Chỉ chọn công nghệ; chưa scaffold, cài package,
build ứng dụng, tạo tài khoản, phát hành hoặc mua dịch vụ.

## Context

[Constitution](../../.specify/memory/constitution.md) đã định hướng React Native/Expo.
Mobile phục vụ khách hàng và nhân viên soát vé theo [mô hình sản phẩm](../03-product/use-cases.md);
khách có thể lưu QR để xuất trình offline, thiết bị nhân viên phải online khi soát qua Core.
`apps/mobile` hiện chỉ có README, chưa có native runtime được kiểm chứng.

## Decision

- Chọn **Expo Router** trên nền **React Native + Expo + TypeScript**: routes/layouts theo file,
  hỗ trợ liên kết mở màn hình đơn/vé/chat. Kiểm params và owner/quyền vẫn bắt buộc;
  route guard hoặc link hợp lệ không thay Core kiểm quyền.
- Dùng **development builds** khi phát triển để có app với cấu hình native riêng. Bản preview/release
  để demo/phân phối là cấu hình build riêng, không coi development build là bản phát hành cuối.
  Expo Go có thể phục vụ thử nghiệm trong giới hạn của nó; không dùng làm bằng chứng tích hợp release.
- Chọn **`expo-camera`** để đọc QR bằng camera. Callback chỉ cung cấp payload; Core kiểm quyền/rạp,
  trạng thái và ghi nhận riêng các ghế được chọn. Không xem quét một lần là dùng hết đơn.
- Chọn **`expo-secure-store`** cho dữ liệu phiên nhạy cảm theo tích hợp Better Auth đã chọn tại
  [ADR-0008](0008-better-auth-with-direct-login.md). Không lưu mật khẩu hoặc dùng SecureStore
  làm DB/cache vé. Phải xử lý lỗi lưu/đọc và giới hạn payload của nền tảng.
- Kho vé offline được chọn tiếp tại [ADR-0023](0023-encrypted-mmkv-for-offline-mobile-tickets.md):
  MMKV bật mã hóa, mở rộng SecureStore để giữ khóa, không lưu nội dung vé trong SecureStore.
- Client SSE được chọn tiếp tại [ADR-0024](0024-fetch-and-eventsource-parser-for-sse-clients.md):
  `expo/fetch` và `eventsource-parser`, ứng dụng quản lý lifecycle/error/reconnect.
- Chưa chọn Expo SDK/React Native version, gói cloud build hoặc kênh phát hành.
  UI giữ Ferrari Dark Cinema; ánh xạ tokens sang native theme thay vì giả định
  CSS web tự chạy trên native. Không mở rộng Mobile sang quyền giao combo/quản trị.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| **Expo Router + development builds** | Được chọn: phù hợp app mới và đường link booking/ticket/chat; convention file routes giảm việc tự quản lý mapping. Cần tuân theo layout/config đúng SDK và kiểm deep link trên thiết bị thật. |
| Expo + React Navigation cấu hình bằng code + development builds | Hợp lệ, có static/dynamic configuration, type inference và automatic linking; không chọn. Tự quản lý navigator và URL mapping linh hoạt hơn, nhưng chưa có yêu cầu đặc thù cần cách này. |

## Consequences

- Pin tổ hợp Expo SDK/Router/RN và native modules tương thích khi triển khai. Không suy các API/import
  React Navigation cũ tự tương thích Expo Router hiện hành; chưa có benchmark để kết luận router nào nhanh hơn.
- Cần quản lý camera permission, payload sai, callback quét lặp, request đang chạy và kết quả chưa rõ.
  Kiểm chứng chống ghi nhận lặp trên Core; không suy khả năng đọc QR offline thành soát vé offline.
- Deep link quay về từ MoMo/VNPAY chỉ điều hướng. Kiểm lại trạng thái đã xác minh ở Core trước báo
  thanh toán thành công/phát vé; validate params, không đưa token/secrets vào URL.
- SecureStore không thay thu hồi phiên ở server hoặc kiểm quyền Core. Dữ liệu có thể mất/không truy cập
  được theo lifecycle thiết bị; xử lý đăng nhập lại, logout và không đưa credential vào log/trace.
- Chọn lifecycle/config plugins, signing và cách build trước implementation; nếu sinh native projects
  bằng CNG thì tùy biến phải tồn tại ở nguồn bền, tránh mất khi regenerate. Chưa chạy prebuild/build.
- SSE server theo [ADR-0011](0011-sse-starlette-for-agent-streaming.md); client native theo ADR-0024
  còn cần kiểm auth, parsing, reconnect/cancel/background trên Android/iOS. Không mặc định EventSource Web chạy nguyên trạng.
- Cần kiểm trên thiết bị thật: camera, phiên, deep link cold start/resume, thanh toán quay về và gián đoạn mạng.

### Chi phí

Expo SDK/CLI nguồn mở không bắt mua cloud build. Android local cần toolchain tương ứng; iOS local
cần macOS/Xcode hoặc đường cloud build phù hợp. Windows không đồng nghĩa hỗ trợ mọi lệnh EAS local.
Theo giá tra cứu ngày 2026-11-17, dịch vụ build Expo có Free quota 15 Android + 15 iOS builds;
Starter **19 USD/tháng + usage**. Chưa chọn gói hoặc cấp quyền tạo account/build trên cloud.
Nếu phát hành lên cửa hàng: Apple Developer Program **99 USD/năm** (theo vùng/ngoại lệ),
Google Play Console **25 USD một lần**. Hosting backend, CI, thiết bị và vận hành vẫn có phí riêng;
không suy việc chọn Expo thành đã trả phí hoặc cam kết phát hành store.

## References

- [Nghiên cứu nền tảng Mobile](../99-notes/mobile-foundation-research.md).
- [Expo Router](https://docs.expo.dev/router/introduction/).
- [Development builds](https://docs.expo.dev/develop/development-builds/introduction/).
- [Camera](https://docs.expo.dev/versions/latest/sdk/camera/).
- [SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/).
- [React Navigation](https://reactnavigation.org/docs/static-configuration/).
- [CNG](https://docs.expo.dev/workflow/continuous-native-generation/).
- [Expo pricing](https://expo.dev/pricing).
- [Apple Developer membership](https://developer.apple.com/programs/enroll/).
- [Google Play registration](https://support.google.com/googleplay/android-developer/answer/6112435).

Nguồn/Context7 đối chiếu ngày 2026-11-17; chưa cài đặt, build hoặc kiểm chứng native runtime/hiệu năng.
