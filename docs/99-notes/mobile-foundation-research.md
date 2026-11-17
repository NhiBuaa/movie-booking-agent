# Mobile foundation: Expo Router hay React Navigation cấu hình bằng code?

Tra cứu 2026-11-17. **Ghi chú nghiên cứu, không phải nguồn quyết định.**
Chủ sản phẩm đã chọn Expo Router, development builds, camera và SecureStore tại
[ADR-0016](../06-decisions/0016-expo-router-and-mobile-native-foundation.md). Các đề xuất bên dưới
giữ bối cảnh lúc nghiên cứu; ADR sở hữu lựa chọn hiện hành. Build service/SDK chưa chọn, chưa triển khai.
Kho vé được chọn tiếp là MMKV mã hóa + SecureStore tại
[ADR-0023](../06-decisions/0023-encrypted-mmkv-for-offline-mobile-tickets.md); client SSE là
expo/fetch + eventsource-parser tại [ADR-0024](../06-decisions/0024-fetch-and-eventsource-parser-for-sse-clients.md).
Đích nghiên cứu: worktree `docs-tech-stack-decisions`, detached HEAD `8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.
Chỉ đọc tài liệu/code; không scaffold, cài dependency, chạy build, gọi tài khoản hoặc thay source/ADR.

## Bối cảnh và hai hướng cùng nền tảng

[Constitution](../../.specify/memory/constitution.md) đã định hướng React Native/Expo; không mở lại chọn framework native.
`apps/mobile` hiện chỉ có [README](../../apps/mobile/README.md), chưa có runtime hoặc package cấu hình để kế thừa.
Mobile phục vụ **khách hàng** và **nhân viên soát vé** theo [product model](../03-product/use-cases.md).
Nhân viên quầy bắp nước là quyền riêng, kênh chưa chốt; nghiên cứu này không mở Mobile cho actor đó.

| Điểm chọn | A. Expo + Expo Router + development builds/CNG | B. Expo + React Navigation bằng code + development builds/CNG |
|---|---|---|
| Tổ chức màn hình | File-based routes, layouts/groups, URL/deep links gắn cấu trúc route; thuận tiện cho app mới. | Khai báo navigator/screens trong code; chủ động cấu trúc điều hướng không phụ thuộc cây thư mục. |
| Type/linking | Router cung cấp typed routes và deep-link mapping; vẫn phải validate params và quyền. | Static API có type inference và automatic linking; không coi B thiếu type safety hoặc deep links. |
| Đánh đổi | Theo convention của Expo Router, phải chọn layout/params/import paths đúng SDK. | Tự sở hữu navigator configuration và chính sách URL/route mapping; có thể cấu hình static hoặc dynamic. |
| Build/native | Dùng native development build và config plugins/CNG, build release riêng. | Cùng nền tảng RN/Expo và quy trình native build; khác cách khai báo điều hướng. |

Nguồn: [Expo Router](https://docs.expo.dev/router/introduction/), [React Navigation](https://reactnavigation.org/docs/getting-started/),
[static API](https://reactnavigation.org/docs/static-configuration/), [CNG](https://docs.expo.dev/workflow/continuous-native-generation/).
Không suy A/B nhanh hơn từ lựa chọn router. Tài liệu Expo hiện mô tả native navigation dựa trên React Native Screens;
không dùng khẳng định cũ “Router chỉ bọc React Navigation” để suy tương thích mọi API.
SDK 56+ đổi application imports từ `@react-navigation/*` sang entry points `expo-router/*` khi dùng Router;
đây là lưu ý pin SDK/adapter, chưa chọn SDK cụ thể. [Migration](https://docs.expo.dev/router/migrate/from-react-navigation/).

## Các thành phần nền tảng có thể đề xuất cùng hướng A/B

- **`expo-camera`**: CameraView/permission và barcode scan callback cho QR. Quét chỉ đọc payload;
  thiết bị nhân viên **phải online**, Core kiểm quyền/rạp, trạng thái và ghi nhận riêng các ghế được chọn.
  Cần xử lý camera bị từ chối, QR sai, callback lặp, request đang chạy và kết quả chưa rõ; không quét là dùng hết đơn.
  [Camera API](https://docs.expo.dev/versions/latest/sdk/camera/).
- **`expo-secure-store`**: ứng viên lưu session credential theo tích hợp Better Auth, **không lưu mật khẩu**.
  Đây là encrypted key-value store, không phải kho vé/offline DB; payload lớn có thể bị nền tảng từ chối.
  Không áp trần 2 KB như giới hạn Expo tuyệt đối: docs chỉ nói một số iOS cũ từng từ chối cỡ đó; phải xử lý lỗi native.
  Biometric option có hạn chế trong Expo Go, không tự bật hoặc thêm yêu cầu sinh trắc học. [SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/).
- Giữ [Better Auth direct forms](../06-decisions/0008-better-auth-with-direct-login.md); native storage không thay server revocation/quyền.
  Khách lưu snapshot vé/QR offline theo ADR-0023; key lifecycle/retention chưa được đặc tả.
  Đây không phải soát vé offline.
- MoMo/VNPAY cần xử lý liên kết mở cổng thanh toán/quay về app, gồm cold start và app resume.
  Return/deep link không chứng minh đã trả tiền; hỏi Core lấy trạng thái đã xác minh trước khi báo thành công/phát vé.
  Không đưa token/secrets vào URL và validate params. [Expo linking](https://docs.expo.dev/linking/into-your-app/).
- Streaming chat native chọn `expo/fetch` + eventsource-parser theo ADR-0024, nhưng không tự chứng minh browser `EventSource`
  hoặc cùng code Web sẽ chạy đúng. Auth, POST/SSE contract, reconnect/cancel và Android/iOS/background cần kiểm.
  [Expo Fetch/Streams](https://docs.expo.dev/versions/latest/sdk/expo/#expofetch-api).

## Build thật, vận hành và tiền

Expo Go là playground có tập native libraries cố định; không thay development build cho custom native config hoặc kiểm release.
Development build có dev tooling; bản preview/release để demo/phân phối là cấu hình build riêng. CNG sinh native projects từ app config/plugins;
sửa tay file sinh có thể mất khi regenerate, nên phải có chủ sở hữu phần tùy biến. [Dev builds](https://docs.expo.dev/develop/development-builds/introduction/),
[Expo Go FAQ](https://docs.expo.dev/develop/development-builds/faq/), [CNG](https://docs.expo.dev/workflow/continuous-native-generation/).

Expo CLI build local với Android Studio/Xcode không bắt mua dịch vụ cloud hoặc có Expo account.
Windows có thể phát triển/build Android; **iOS local cần macOS/Xcode**, hoặc dùng cloud build phù hợp.
Không đồng nhất Expo CLI local với `eas build --local`: EAS local hiện không chính thức hỗ trợ Windows.
[Local build requirements](https://docs.expo.dev/build-reference/local-builds/).
[Expo OSS](https://github.com/expo/expo/blob/main/LICENSE) là MIT; dịch vụ EAS/Expo Build tùy chọn có tier riêng:
[pricing hiện hành](https://expo.dev/pricing) Free gồm 15 Android + 15 iOS builds, Starter 19 USD/tháng + usage; quota/giá có thể đổi.
Nếu phát hành: [Apple Developer Program](https://developer.apple.com/programs/enroll/) 99 USD/năm, giá theo vùng/ngoại lệ;
[Google Play Console](https://support.google.com/googleplay/android-developer/answer/6112435) 25 USD một lần. Signing/distribution và review vẫn cần thiết kế/thực hiện riêng.

**Nghiêng A** vì app mới có booking/ticket/chat links và hai chế độ khách/soát vé; convention routes giảm việc tự giữ mapping.
B hợp lý nếu có yêu cầu navigator đặc thù cần code configuration. Đây là đề xuất phù hợp, không phải bằng chứng hiệu năng.
Cả hai phải bám [Ferrari Dark Cinema](../../DESIGN.md) và ánh xạ design tokens sang native theme;
kho vé offline đã chọn tại ADR-0023, không tự chọn thư viện UI DOM của Web cho Mobile.
