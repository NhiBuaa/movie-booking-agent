# Nghiên cứu Phase 0 — A-03 đăng nhập khách hàng

**Ngày đối chiếu:** 2026-11-20. **Trạng thái:** Phase 0 là căn cứ cho plan v0.2.0 đã được trình và dùng chia tasks; bản hiện hành v0.3.0 ghi cách tính thử sai được đồng ý bổ sung và hòa giải tài liệu sau review. Các mục nghiên cứu cũ bên dưới giữ bối cảnh lúc lập phương án, không thay trạng thái hiện hành ở plan hoặc là kết quả qualification/runtime.
Đọc cùng [plan](plan.md), [spec đã được duyệt](spec.md), [nguồn hiện trạng](sources.md) và
[chính sách mật khẩu](../../04-standards/password-policy.md). Tài liệu này giữ căn cứ/phương án,
không trở thành nguồn chính sách thứ hai và không là kết quả runtime.

## R-01 — Ranh giới đã được duyệt

- **Decision:** Kế thừa Better Auth thuộc Identity, database PostgreSQL logic riêng; cùng tài khoản Customer trên Web/iOS/Android, phiên độc lập và logout phiên hiện tại. Giữ form trực tiếp, không chuyển sang OAuth Provider/SSO hoặc dịch vụ Auth khác.
- **Rationale:** ADR-0008/0016, constitution và spec v0.3.0 đã duyệt. Core giữ quyền nghiệp vụ, Agent không nhận credential rộng; nguồn danh tính không là email do client tự khai.
- **Alternatives considered:** Nhúng Auth vào Core/Web hoặc chọn lại Keycloak/OAuth không nằm trong phạm vi. Chọn framework Identity, driver/schema và topology cụ thể vẫn phải được thiết kế, không suy từ framework Core.

## R-02 — Mật khẩu mới: căn cứ và phương án đang trình

- **Decision:** Chủ sản phẩm đã chọn A cho ba nhóm mật khẩu mới, Unicode và legacy trong hội thoại ngày 2026-11-20. PWD-001…PWD-005 của khách hàng được sở hữu tại chuẩn mật khẩu v0.2.0; không chép lại bộ giá trị tại nghiên cứu. PWD-007 là đề xuất kỹ thuật trong plan.
- **Rationale:** [NIST SP 800-63B-4, Password Verifiers](https://pages.nist.gov/800-63-4/sp800-63b.html#passwordver) yêu cầu tối thiểu 15 cho mật khẩu dùng như yếu tố duy nhất, khuyến nghị hỗ trợ tối đa ít nhất 64 và tránh quy tắc phối hợp loại ký tự. NIST yêu cầu kiểm danh sách mật khẩu phổ biến/đã lộ khi thiết lập/đổi. Giá trị trần cụ thể của dự án do chủ sản phẩm chọn tại nguồn policy, không phải con số NIST bắt buộc.
- **Alternatives considered:** Ngưỡng/luật UI mẫu và mặc định thư viện không là quyết định sản phẩm. Dịch vụ kiểm mật khẩu ngoài chưa được chọn; danh sách cục bộ có thể không bao phủ mọi mật khẩu từng bị lộ, cần công bố phạm vi/phiên bản và hành vi lỗi. Không thể tuyên bố đã biết toàn bộ dữ liệu rò rỉ.
- **Nguồn bổ sung:** [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#implement-proper-password-strength-controls) khuyến nghị hỗ trợ passphrase, Unicode/khoảng trắng và tránh cắt mật khẩu âm thầm. Chưa có quyết định cuối của dự án từ việc tham khảo nguồn.

## R-03 — Cấu hình/hashing không tự quyết định chính sách mật khẩu

- **Decision:** Better Auth được chọn nhưng chưa pin version hoặc thuật toán/tham số PWD-007. Cần thiết kế kiểm độ dài/ký tự và tương thích hash theo PWD được duyệt; không áp mặc định vào policy.
- **Rationale:** Tra Context7 từ tài liệu/source chính thức: cấu hình `minPasswordLength`/`maxPasswordLength`, hàm `hash`/`verify` tùy chỉnh và mặc định scrypt có sẵn. `requireEmailVerification` điều khiển có cho login email chưa xác minh; A-03 cho login, còn giữ ghế/mua vé kiểm xác minh ở biên nghiệp vụ. Không bật cờ thư viện làm thay BR-02.
- **Điểm cần hòa giải:** Test nguồn Better Auth có xử lý NFKC của hash scrypt cũ; NIST khuyến nghị NFC. Đây là khác biệt về hai chuỗi mật khẩu được coi tương đương. Chủ sản phẩm đã chọn NFC cho policy mới, giữ verifier theo cơ chế đã lưu cho legacy; không thể chỉ thay cờ độ dài rồi coi đã đáp ứng. Đếm Unicode code point cũng khác độ dài chuỗi UTF-16; phải kiểm đường validation/thư viện phiên bản pin.
- **Alternatives considered:** Dùng đường scrypt đã có của thư viện giảm phần tự viết nhưng phải phù hợp policy; custom hash/verify có thể cần khi chốt chuẩn hóa/thuật toán khác và phải có vectors/đo chi phí. Ví dụ Argon2id trong DB draft hoặc tài liệu không là quyết định đã duyệt.
- **Nguồn:** [Better Auth email/password](https://www.better-auth.com/docs/authentication/email-password), [options](https://www.better-auth.com/docs/reference/options), [source tests password](https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/crypto/password.test.ts). Tài liệu/main đối chiếu hiện hành chỉ là căn cứ nghiên cứu, chưa xác nhận compatibility của release sẽ pin.

## R-04 — Phiên thường/ghi nhớ và vòng đời native

- **Decision:** Chưa chốt idle/max, thời điểm persistence của phiên thường/ghi nhớ hoặc giới hạn cấp lại. Không dùng một cờ `rememberMe` làm bằng chứng toàn bộ FR-004/US4 đã đáp ứng.
- **Rationale:** Nghiên cứu upstream cho thấy `rememberMe` có mặc định cần cấu hình rõ; `expiresIn`/`updateAge` tạo hết hạn/gia hạn trượt, chưa tự biểu diễn đầy đủ idle và absolute max. Cookie không bền của Web không tự có cùng hành vi trên native.
- **Quan sát source:** Expo client giữ cookie không có Expires/Max-Age với `expires: null` trong kho được cấu hình; bộ đọc không hết hạn một cookie chỉ vì trường này null. Vì thế `rememberMe: false` chưa chứng minh app đóng/mở sẽ mất phiên. Cần đặc tả và kiểm lifecycle/mất dữ liệu của iOS/Android, không suy từ browser.
- **Alternatives considered:** Giữ một loại phiên sẽ trái lựa chọn hai loại của spec. Dùng default thư viện cho cả hai không đủ căn cứ. Lớp quản lý lifetime/persistence phải tối thiểu, có trạng thái rõ và được kiểm trên phiên bản pin; không thêm trusted-device hoặc sinh trắc học.
- **Nguồn:** [Session management](https://www.better-auth.com/docs/concepts/session-management), [Expo integration](https://www.better-auth.com/docs/integrations/expo), [Expo client source v1.7.26](https://github.com/better-auth/better-auth/blob/v1.7.26/packages/expo/src/client.ts). Tag này được dùng kiểm nghiên cứu, chưa được chọn pin dự án hoặc chạy thử.

## R-05 — Logout cần bằng chứng vô hiệu máy chủ

- **Decision:** Giữ FR-010 và US2.6: chỉ báo đã vô hiệu từ xa sau khi có căn cứ máy chủ. Cơ chế thực hiện/endpoint sẽ được thiết kế sau; chưa chấp nhận chỉ HTTP 200 của thư viện làm điều kiện nghiệm thu.
- **Rationale:** Source `sign-out` được đọc ở main và đối chiếu tag v1.7.26: lỗi đọc/xóa session có thể được bắt và ghi log, sau đó xóa cookie và trả `success: true`. Vì vậy kết quả transport/UI chưa bảo đảm session đã biến mất ở nơi lưu. Chưa kết luận mọi phiên bản/release đều có hành vi này.
- **Alternatives considered:** Chỉ xóa cookie không đủ theo NFR-SEC-01. Cần so sánh cơ chế thu hồi authoritative có kết quả rõ, hoặc adapter/đường kiểm hậu điều kiện đáp ứng hậu điều kiện đã duyệt; không tự sửa thư viện hoặc kế thừa cột `revoked_at` rồi giả định thư viện sẽ đọc cột đó. Mất mạng/logout lỗi vẫn khóa dữ liệu cục bộ nhưng phải báo trạng thái chưa xác nhận từ xa.
- **Nguồn:** [Source sign-out v1.7.26](https://github.com/better-auth/better-auth/blob/v1.7.26/packages/better-auth/src/api/routes/sign-out.ts). Source đã đọc chỉ chứng minh đường mã của tag, chưa là test hệ thống dự án hoặc quyết định pin phiên bản.

## R-06 — Hòa giải dữ liệu và hợp đồng ở Phase 1

- **Decision:** Giữ Identity là chủ user/account/session. Cần đối chiếu schema thư viện trên version pin với DB draft trước khi lập model cuối; chưa tạo migration hoặc sửa tài liệu DB của phiên khác.
- **Rationale:** DB draft ghi `accounts.account_id`, password hash Argon2id và `sessions.revoked_at`. Cần kiểm ý nghĩa từng trường: credential account của Better Auth dùng định danh user trong model thư viện, không mặc định email; thuật toán hash và cột thu hồi là thiết kế phải được nối thật vào đường xác minh. Khai báo cột không tự làm adapter thực thi logic.
- **Alternatives considered:** Copy DDL từ draft hoặc để Auto Schema quyết định chính sách đều chưa đủ. Chỉ hòa giải phần tối thiểu A-03; không thiết kế lại toàn bộ Identity, MFA, reset hoặc vai trò vận hành trong feature này.
- **Nguồn:** [Better Auth database concepts](https://www.better-auth.com/docs/concepts/database), [nguồn DB draft và dấu kiểm](sources.md). Model chính thức, mapping cột và schema-generated output phải kiểm ở tổ hợp pin trước triển khai.

## R-07 — Hướng tích hợp theo app, chưa là hợp đồng cuối

- **Decision:** Đề xuất Web dùng cùng origin `/api/auth/*` qua BFF mỏng tới Identity độc lập; Mobile dùng tích hợp Expo tới Identity, rồi hợp đồng API riêng theo ADR-0008. Chưa chọn hostname/port/hosting, issuer/audience/TTL, framework HTTP hoặc cấu hình proxy cuối.
- **Rationale:** Tài liệu có hướng reverse proxy cùng origin giúp tránh phụ thuộc cookie bên thứ ba. BFF phải chuyển tiếp credential phù hợp và từng `Set-Cookie`, kiểm origin/đích/thuộc tính cookie. Không suy ví dụ tạo `auth` trong Next là cho phép chuyển chủ Auth/DB sang Web. `trustedOrigins` và cấu hình CORS phục vụ việc khác nhau, không thay thế nhau.
- **Native:** Tích hợp Expo giữ cookie/phiên Auth trong SecureStore theo ADR-0016; cách gọi API nghiệp vụ dùng bằng chứng JWT/JWKS và phạm vi riêng còn cần hợp đồng. Chưa chọn bật cookie cache; ưu tiên nghiên cứu kiểm phiên authoritative và tách cache UI khỏi bằng chứng quyền để giữ logout/switch-account.
- **Alternatives considered:** Web gọi khác origin có thể làm được với CORS/credentials/origin/cookie được thiết kế, nhưng thêm điều kiện trình duyệt cần kiểm. Đặt tất cả Auth trong Web hoặc dùng cookie Auth làm hợp đồng quyền chung cho mọi service không được suy từ integration example.
- **Nguồn:** [Reverse proxy/cookies](https://better-auth.com/docs/concepts/cookies#using-a-reverse-proxy), [Expo integration](https://better-auth.com/docs/integrations/expo), [session caching](https://better-auth.com/docs/concepts/session-management#session-caching), [CORS integration example](https://better-auth.com/docs/integrations/hono#cors). Link Hono chỉ là căn cứ phân biệt CORS, không chọn Hono cho Identity.

Đối chiếu DB bổ sung: format `usr_` cộng UUID chuẩn dài hơn `VARCHAR(36)` trong draft; mapping
ID và tên cột phải kiểm lại cùng schema version pin. Đây là vấn đề thiết kế dữ liệu, chưa sửa DB draft
hoặc thay ID của tài khoản đang tồn tại.

## Các điều kiện còn mở

| Nhóm | Người chốt | Bước phụ thuộc |
|---|---|---|
| PWD-001…PWD-005 của khách hàng | Đã được chủ sản phẩm chọn A; xem chuẩn mật khẩu v0.2.0 | Đủ đầu vào hành vi để lập model/contracts |
| Hai loại phiên, idle/max/persistence, giới hạn thử sai | Phương án tại plan/contract được dùng chia tasks theo yêu cầu chuyển bước của chủ sản phẩm | Chưa có quyền triển khai hoặc kết quả qualification/runtime |
| Topology Auth, thu hồi, framework/driver/version và PWD-007 | Đã có đề xuất kỹ thuật tại các artifact Phase 1 | Phải vượt kiểm tổ hợp phiên bản và được cấp quyền triển khai riêng |

## R-08 — Phương án kỹ thuật được cụ thể hóa để duyệt plan

- **Decision (đề xuất):** Identity Node HTTP + Better Auth 1.7.26, Drizzle ORM 0.45.4/pg 8.23.1; custom hash/verify dùng Argon2id qua `@node-rs/argon2` 2.2.2 với NFC và tag format mới. Chọn Argon2id để dùng verifier thư viện hỗ trợ đúng policy mới; không tự viết thuật toán hoặc kéo một framework Identity chỉ để mount Auth.
- **Rationale:** Registry metadata xác nhận các version trên tồn tại và peer ranges Better Auth chấp nhận Drizzle/pg này; chưa cài/build. Cấu hình hash và lựa chọn phiên/rate ở plan là đề xuất, không suy từ DB draft. [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) ưu tiên Argon2id; [Better Auth](https://better-auth.com/docs/authentication/email-password#configuration) hỗ trợ custom hash/verify.
- **Mobile candidate:** Expo 58.0.26, React 19.3.0, RN 0.88.1, Router 58.0.32/SecureStore 58.0.3 theo [bundle SDK 58](https://github.com/expo/expo/blob/sdk-58/packages/expo/bundledNativeModules.json). Bản bundle trên nhánh có thể thay đổi; kiểm tổ hợp install/doctor/build theo version đã pin là điều kiện triển khai, không nhận peer ranges hoặc tài liệu main làm bằng chứng đã tương thích. Giữ React 19.3.1 của Web, không đổi toàn monorepo sang React native version hoặc đổi npm thành pnpm.
- **Alternatives considered:** Default scrypt/NFKC không khớp policy NFC mới. Native scrypt với verifier tùy chỉnh là phương án khả thi nhưng không chọn cho đề xuất này; nguồn [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#scrypt) cho thấy đánh đổi RAM/CPU khác. Chưa đo nên không kết luận Argon2 nhanh hơn trên máy dự án.
- **Dataset candidate:** `danielmiessler/SecLists`, file `Passwords/Common-Credentials/100k-most-used-passwords-NCSC.txt`, commit `1a7bb9127eca9e6ff2fc0301c597fe6e16a0cb56`. Registry GitHub metadata đọc ngày trên, repository công bố [MIT](https://github.com/danielmiessler/SecLists/blob/master/LICENSE); khi được phép lấy artifact phải kiểm license/attribution của dữ liệu, fingerprint và phạm vi. Chưa tải danh sách hoặc coi nó bao phủ mọi vụ lộ mật khẩu.

Tại mốc lập Phase 1, plan/data model/contracts/quickstart được trình để review. Sau đó chủ sản phẩm yêu cầu chia tasks và hoàn tất review tài liệu; trạng thái hiện hành thuộc plan/sources, chưa cấp quyền code. Kiểm runtime/phiên bản, nguồn dữ liệu cũ thực tế và quyền sử dụng tài nguyên là các điều kiện triển khai, không được tự đánh dấu đạt.
