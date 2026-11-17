# ADR-0023 — MMKV mã hóa và SecureStore cho vé offline trên Mobile

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý với đề xuất của bạn” sau đề xuất
MMKV bật mã hóa và SecureStore giữ khóa trong hội thoại Tech Stack
(`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`). Chỉ chọn công nghệ; chưa cài package,
prebuild/build, tạo/đọc khóa thiết bị hoặc xác nhận native runtime.

## Context

[B-07 trong mô tả use case](../03-product/use-case-descriptions.md) cho khách lưu QR để xuất trình
khi điện thoại không có mạng. QR chung có thể chia sẻ cho nhóm và dùng để xuất trình quyền còn lại;
không cấp quyền xem tài khoản. Nhân viên phải online để Core kiểm tra và ghi nhận theo O-01/O-05.
Nhu cầu hiện tại là bản vé chỉ đọc offline, chưa có yêu cầu truy vấn quan hệ hay ghi giao dịch offline.
[ADR-0016](0016-expo-router-and-mobile-native-foundation.md) chọn Expo development builds và
SecureStore cho phiên, nhưng chưa chọn kho vé. Cần bảo vệ QR khi lưu và cách ly dữ liệu tài khoản.

## Decision

- Chọn **`react-native-mmkv` với mã hóa được bật rõ ràng** để lưu snapshot vé/QR trên Mobile.
  Đây là dữ liệu dẫn xuất trên thiết bị, không thay PostgreSQL hoặc thẩm quyền giao dịch của Core.
- Mở rộng vai trò **`expo-secure-store` để giữ khóa mã hóa kho vé**, bên cạnh dữ liệu phiên đã chọn.
  Không dùng SecureStore làm DB/cache vé; không hardcode khóa trong source/client bundle hoặc
  ghi khóa/QR/credential vào log/trace. Phải thiết kế tạo, lấy và quản lý khóa theo nền tảng.
- Tách instance/kho theo tài khoản và chỉ lưu dữ liệu tối thiểu cần xuất trình. Kiểm schema,
  owner và bằng chứng xác nhận từ Core trước ghi; không tạo QR/vé từ trạng thái thanh toán suy đoán.
- Khi offline chỉ trình bày bản đã lưu; trạng thái cũ không là xác nhận quyền vẫn còn hiệu lực,
  đã thanh toán mới hoặc đã soát thành công. Khi có mạng phải lấy trạng thái có thẩm quyền từ Core.
- Giữ thiết bị nhân viên online khi soát; kho này không là offline checkout, hàng đợi thao tác
  giữ ghế/thanh toán/soát vé hoặc cơ chế kéo dài TTL. QR cũ không khôi phục ghế đã hủy/đã dùng.
- Chưa chọn version Expo/RN/MMKV/Nitro Modules, thuật toán/key format cụ thể, retention,
  lưu tự động/theo yêu cầu, logout/reinstall/backup policy hoặc biometric gate.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| **MMKV bật mã hóa + SecureStore giữ khóa** | Được chọn: phù hợp snapshot vé tự chứa, không cần SQL; có mã hóa và instance riêng. Vẫn phải kiểm native compatibility và key lifecycle; mặc định MMKV không mã hóa. Không chọn dựa vào tuyên bố benchmark của README. |
| Expo SQLite + SQLCipher + SecureStore giữ khóa | Hợp lệ khi cần SQL/schema hoặc transaction nhiều bản ghi. Phạm vi hiện tại chưa có nhu cầu đó để ưu tiên; vẫn cần native build/migration/key lifecycle. Bật `PRAGMA key` không tự chứng minh binary có SQLCipher. |
| AsyncStorage nguyên bản | Phù hợp key-value không nhạy cảm nhưng không mã hóa. QR cần lớp bảo vệ bổ sung được đánh giá và quản lý khóa tương đương; bản nguyên trạng chưa đáp ứng mục tiêu bảo vệ khi lưu. |

## Consequences

- MMKV V4 dùng Nitro Modules và yêu cầu native build tương thích; phiên bản tài liệu không phải
  version dự án đã pin. Phải kiểm Expo/RN/native modules và chế độ mã hóa trong binary Android/iOS thật.
- Không suy `createMMKV()` mặc định đã mã hóa. Chọn và kiểm cấu hình encryption/key retrieval
  trước lưu dữ liệu nhạy cảm; kiểm hành vi khi sai/mất khóa, ghi gián đoạn và parse dữ liệu hỏng.
  MMKV không mặc định có transaction nhiều key tương đương SQL; cần snapshot nhất quán theo hợp đồng.
- Logout/đổi tài khoản phải tránh hiện QR tài khoản trước, kể cả request/đọc đang chạy. Cách xóa hay
  khóa cache/key cần đặc tả; không tự chọn ngày hết hạn hoặc thay chính sách quyền vé server.
- Android uninstall mất dữ liệu SecureStore; iOS có thể giữ qua reinstall cùng bundle ID nhưng
  không nên dựa vào đó. Backup file và khóa có lifecycle khác nhau; thiết kế phải xử lý cache không đọc được,
  reset và tải lại sau xác thực khi online. Không hứa khôi phục khi đang mất mạng.
- Chưa bật `requireAuthentication`; sinh trắc học/accessibility có thể ảnh hưởng khả năng lấy khóa.
  Mã hóa khi lưu không ngăn ảnh QR đã chia sẻ, ảnh chụp màn hình hoặc dữ liệu runtime đã giải mã;
  không thay Core kiểm chữ ký, quyền từng ghế và chống dùng trùng.
- Chưa đưa toàn bộ TanStack Query/Zustand state vào persistent store, chưa thêm SQLite/SQLCipher
  hoặc Drizzle vào Mobile. Kiểm trên thiết bị thật về offline reopen, account switch, reinstall/restore,
  refresh vé đã hủy/đã dùng và lỗi khóa trước tuyên bố đã đáp ứng.

### Chi phí

`react-native-mmkv` dùng MIT; bundle cục bộ không bắt mua cloud database hoặc dịch vụ lưu vé.
Không phát sinh phí SaaS bắt buộc chỉ vì lựa chọn này. Native build/toolchain, CI, thiết bị và
EAS usage nếu dùng vẫn có chi phí/quota riêng; chưa chọn gói cloud build hoặc mua hỗ trợ thương mại.
Chưa đo hiệu năng hoặc xác nhận native encryption; thư viện có khả năng không đồng nghĩa dự án đã tích hợp.

## References

- [Nghiên cứu các kho vé offline](../99-notes/mobile-ticket-storage-research.md).
- [MMKV, Expo integration, encryption và license](https://github.com/margelo/react-native-mmkv).
- [SecureStore, persistence và backup](https://docs.expo.dev/versions/latest/sdk/securestore/).
- [Expo SQLite/SQLCipher](https://docs.expo.dev/versions/latest/sdk/sqlite/).
- [AsyncStorage](https://react-native-async-storage.github.io/latest/).

Nguồn/Context7 đối chiếu ngày 2026-11-17; chưa cài/build, đọc dữ liệu thiết bị hoặc chạy thử native.
