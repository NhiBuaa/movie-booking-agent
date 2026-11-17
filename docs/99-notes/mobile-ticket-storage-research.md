# Kho vé offline trên Mobile: SQLite mã hóa và key-value

Tra cứu ngày 2026-11-17 bằng nguồn chính thức và Context7 (`/websites/expo_dev`).
**MMKV bật mã hóa + SecureStore giữ khóa đã được chấp thuận tại
[ADR-0023](../06-decisions/0023-encrypted-mmkv-for-offline-mobile-tickets.md).**
Các so sánh/đề xuất dưới đây giữ bối cảnh trước khi chốt; chưa cài/build hoặc chạy thử.
Đích: worktree `docs-tech-stack-decisions/movie-booking-agent`, detached HEAD `8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.
Chỉ ghi tài liệu; chưa cài package, prebuild/build, đọc key thiết bị, chạy app hoặc gọi dịch vụ.

## Nhu cầu đã có và điều còn mở

[B-07](../03-product/use-case-descriptions.md) cho khách lưu QR để xuất trình offline;
QR chung có thể chia sẻ cho nhóm, người giữ QR có thể xuất trình quyền còn lại nhưng không có quyền xem tài khoản.
[O-01/O-05](../03-product/use-case-descriptions.md) yêu cầu thiết bị nhân viên online:
Core kiểm nguồn/chữ ký, quyền còn hiệu lực và ghi nhận chống hai cửa dùng cùng ghế. Cache không làm việc này.
Dữ liệu cũ không được trình bày là trạng thái mới đã xác nhận; ảnh QR không khôi phục ghế đã hủy/đã dùng.
[ADR-0016](../06-decisions/0016-expo-router-and-mobile-native-foundation.md) đã chọn development builds,
Camera và SecureStore **cho phiên, không làm DB/cache vé**; cơ chế lưu vé và SDK/RN version vẫn chưa chọn.
Đề xuất dùng SecureStore thêm cho **khóa mã hóa kho vé** cần được chấp thuận rõ; không coi ADR cũ đã bao hàm việc đó.

QR có khả năng mang quyền xuất trình nên cần đánh giá như dữ liệu nhạy cảm, dù không phải session token.
Mục tiêu nghiên cứu: dữ liệu bền qua restart, bảo vệ khi lưu trên đĩa và không lẫn tài khoản;
không tạo checkout offline, hàng đợi soát vé, cơ chế thu hồi mới hoặc bản sao giao dịch có thẩm quyền.

## Ba hướng so sánh

| Hướng | Đủ gì / cần bổ sung | Đánh đổi |
|---|---|---|
| **A. `expo-sqlite` + SQLCipher + key trong SecureStore** | DB mã hóa; quản lý các bản vé và metadata bằng schema/transaction. | Có native config, migration và lifecycle khóa; cùng hệ Expo. Không cần tự thiết kế mã hóa từng JSON. |
| **B. `@react-native-async-storage/async-storage`** | KV bền, bất đồng bộ nhưng **không mã hóa**; QR cần lớp mã hóa đã kiểm riêng và key lifecycle tương đương. | API nhỏ phù hợp dữ liệu không nhạy cảm; raw KV chưa đáp ứng mục tiêu bảo vệ QR. Thêm crypto làm bundle chưa hoàn chỉnh, không mặc nhiên ít công hơn A. |
| **C. `react-native-mmkv` bật mã hóa + key trong SecureStore** | KV mã hóa theo instance, lưu các snapshot vé tự chứa; dùng instance theo user. | Phù hợp bản vé chỉ đọc offline, không cần schema SQL. V4 thêm Nitro Modules/native build; mặc định không mã hóa, phải bật và kiểm thực tế. Không mặc định có transaction nhiều key như SQL. |

[Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/),
[Async Storage hiện hành](https://react-native-async-storage.github.io/latest/).
Không viện dẫn Async Storage cũ trong React Native core hoặc coi sandbox ứng dụng là mã hóa.
MMKV V4 dùng Nitro Modules, yêu cầu RN từ 0.76 và Expo prebuild; `encryptionKey` là opt-in, `id` tách instance.
[Nguồn MMKV](https://github.com/margelo/react-native-mmkv). Chưa pin tương thích Expo/RN/Nitro hoặc chọn thuật toán/key format cụ thể; không dùng con số benchmark của README làm phép đo dự án.

## Điều kiện kỹ thuật của A

SQLCipher cần bật `useSQLCipher`, prebuild và rebuild binary; hỗ trợ Android/iOS/macOS, **không Expo Go/Web**.
Kiểm `PRAGMA cipher_version` trước lưu: `PRAGMA key` có thể im lặng không có tác dụng nếu binary thiếu SQLCipher.
Đặt key ngay khi mở DB, trước truy cập nội dung; không hardcode hoặc ghi key/QR vào log.
Prepared statements tách tham số; transaction dùng đúng object và xử lý lỗi khóa, không giữ transaction qua request mạng.
[Expo SQLCipher, SQL và transaction](https://docs.expo.dev/versions/latest/sdk/sqlite/).

SecureStore có lifecycle khác giữa Android Keystore và iOS Keychain: Android uninstall mất dữ liệu;
iOS có thể giữ sau reinstall cùng bundle ID, không nên dựa vào điều này. Android backup phải loại dữ liệu SecureStore
vì key không phục hồi cùng bản backup. Bật `requireAuthentication` có thể làm key mất truy cập sau đổi sinh trắc học.
Không tự bật biometric hoặc chọn accessibility/backup policy; thiết kế phải kiểm khôi phục file DB khi key không còn.
[SecureStore persistence/backup](https://docs.expo.dev/versions/latest/sdk/securestore/).
Mã hóa file không ngăn ảnh chụp màn hình, bản QR đã chia sẻ, runtime đã giải mã hoặc thiết bị bị kiểm soát;
không dùng nó thay Core kiểm quyền. Chính sách export/ảnh chụp không được tự thêm trong lựa chọn DB này.

## Luồng dự kiến, cần cụ thể hóa trong feature

1. Online: lấy vé đúng quyền từ Core, chỉ cache dữ liệu đã phát hành có bằng chứng xác nhận theo hợp đồng Core;
   kiểm schema/owner/nguồn trước ghi, không dựng vé từ trạng thái thanh toán suy đoán hoặc tool output chưa xác minh.
2. Lưu snapshot nhất quán gồm payload và metadata cần thiết như owner, phiên bản hợp đồng/thời điểm lấy; không copy credential vào kho vé. Chưa mặc định cần transaction nhiều record/key; kiểm hành vi ghi gián đoạn của công cụ được chọn.
3. Offline: đọc đúng kho tài khoản và trình bày bản đã lưu; không tự khẳng định quyền còn hiệu lực hoặc đã soát thành công.
4. Online trở lại: lấy trạng thái mới từ Core để cập nhật; nhân viên vẫn xác nhận và ghi nhận từng ghế qua Core.
5. Logout/đổi tài khoản: đặc tả phải xác định xóa hay khóa cache/key và xử lý đọc đang chạy, bảo đảm không hiện QR của tài khoản trước.
6. Mất key/corrupt DB: xử lý như cache không đọc được, không tái sử dụng key/QR của tài khoản khác;
   có đường reset cache và tải lại từ Core sau xác thực, không hứa tải lại được khi đang offline.

Đây là yêu cầu thiết kế/kiểm chứng đề xuất, **không phải chính sách lưu giữ mới đã được chấp thuận**.
Còn phải chốt dữ liệu tối thiểu, thời hạn lưu, vé nào lưu tự động/theo yêu cầu, logout/reinstall/backup,
quy tắc hiển thị trạng thái cũ và cách lấy lại khi key mất. Không tự chọn số ngày hoặc tự thu hồi vé server.
PostgreSQL của Core vẫn authoritative; kho vé cục bộ chỉ là bản lưu trên thiết bị, không thêm backend giao dịch.
Chưa thêm Drizzle vào Mobile: lựa chọn Drizzle của Core không tự chọn ORM/query layer hoặc migration cho kho này.

## Chi phí và kiểm chứng trước triển khai

SQLCipher Community Edition dùng BSD-style, cho phép phần mềm thương mại với nghĩa vụ license/notices;
private support và các edition thương mại là lựa chọn riêng, chưa mua. [Zetetic Community](https://www.zetetic.net/sqlcipher/community/).
Async Storage có MIT theo [nguồn dự án](https://github.com/react-native-async-storage/async-storage); react-native-mmkv cũng [MIT](https://github.com/margelo/react-native-mmkv).
Bundle local không bắt thêm cloud DB bill; vẫn có native build/toolchain/thiết bị/CI hoặc EAS usage nếu chọn dịch vụ đó.
Đã chọn development builds không đồng nghĩa đã trả EAS hoặc binary SQLCipher đã tồn tại.
Pin tổ hợp Expo/RN/native modules trước implementation; SDK “latest” của nguồn không phải version dự án đã chọn.
Kiểm thiết bị Android/iOS thật: reopen offline, sai/mất key, file không đọc được nếu không key, migration/restart giữa ghi,
logout/account switch, restore/reinstall, refresh vé hủy/đã dùng; ghi rõ tình huống không thể phục hồi khi offline.
Không có phép đo để kết luận SQLite nhanh nhất, đủ dung lượng hoặc mọi lỗi mất điện đều đã được kiểm.

## Đề xuất để chốt

**Ưu tiên C cho phạm vi hiện có: snapshot vé để đọc/xuất trình offline**; có mã hóa sẵn thay vì tự ghép crypto vào B. Điều kiện là pin được Expo/RN/Nitro tương thích và kiểm native encryption/lifecycle. Không chọn C vì tuyên bố nhanh hơn.
**A hợp lệ nhưng có thể thừa ở phạm vi này**: chưa có yêu cầu query quan hệ hoặc cập nhật nhiều bản ghi trong một transaction để biện minh SQL/schema/migration. Chọn A nếu feature xác nhận nhu cầu đó hoặc ưu tiên tích hợp SQLCipher do Expo duy trì, với chi phí native/lifecycle đã nêu.
B dạng plain text chưa tương đương vì QR mang quyền xuất trình; B chỉ trở thành phương án đầy đủ khi có lớp mã hóa được đánh giá.
Chấp thuận A hoặc C chỉ chọn công nghệ, mở rộng SecureStore cho khóa và yêu cầu mã hóa; không chốt retention, biometric,
ORM hoặc nghiệp vụ offline, không chứng minh native runtime đã hoạt động.
