# Feature Specification: A-01 — Đăng ký tài khoản khách hàng (Web và Mobile)

**Feature Branch**: `docs/customer-registration`  
**Created**: 2026-11-20 (cập nhật v0.3.2 ngày 2026-11-21)  
**Status**: Draft — v0.3.2, hoàn thiện sau đợt review độc lập thẩm định lại lần 2 (xử lý dứt điểm các điểm còn sót F1, F4 và ghi nhận delta F3); chuẩn bị trình duyệt spec chuyển bước Plan.  
**Approval**: Chủ sản phẩm đã phê duyệt hai quyết định sản phẩm ngày 2026-11-21: Quyết định 1 (FR-007) chọn Phương án B (phản hồi trung tính chống Account Enumeration theo OWASP); Quyết định 2 (FR-012) chọn Phương án A (không cấp phiên tự động, hiển thị màn hình tiếp nhận hướng dẫn A-02 với bộ nút điều hướng đồng nhất).  
**Input**: Chuẩn bị một spec chung Customer Web và Customer Mobile (iOS/Android) cho tính năng A-01 — Đăng ký tài khoản. Kế thừa các quyết định đã duyệt và chính sách mật khẩu PWD-001…PWD-007 từ A-03; có thể triển khai Web trước, Mobile sau.

## Phạm vi và nguồn thẩm quyền

Mục tiêu: Khách chưa đăng nhập có thể tự tạo tài khoản khách hàng thật bằng Email và Mật khẩu trên Customer Web hoặc Customer Mobile (iOS/Android). Tài khoản được tạo lập duy nhất trong Identity Service với vai trò `CUSTOMER`, tự động gán tư cách hội viên CineMember (BR-14) với trạng thái kích hoạt hội viên khởi tạo và 0 điểm. Email khởi tạo ở trạng thái chưa xác minh (`emailVerified = false`). Hệ thống hướng dẫn khách hàng sang A-02 để xác minh email trước khi thực hiện giữ ghế hoặc mua vé (BR-02).

Kế thừa thẩm quyền từ:
- [Mô hình sản phẩm](../../03-product/use-cases.md) và [mô tả use case A-01](../../03-product/use-case-descriptions.md): A-01, A-02, BR-01, BR-02, BR-14, BR-33, BR-36, BR-38, BR-41; Q19, Q21, Q25.
- [Constitution v2.0.1](../../../.specify/memory/constitution.md): Ranh giới danh tính và chủ dữ liệu.
- [Kiến trúc phân rã dịch vụ](../../05-specs/004-service-decomposition/spec.md) và [quyết định](../../05-specs/004-service-decomposition/decisions.md): Identity Service là chủ dữ liệu duy nhất sở hữu tài khoản/danh tính/thông tin xác thực; Cinema Core sở hữu module Hội viên (`loyalty_members`); không gọi SQL chéo, không giao dịch phân tán xuyên database.
- [ADR-0008](../../06-decisions/0008-better-auth-with-direct-login.md): Lựa chọn Better Auth, form xác thực trực tiếp, email/mật khẩu, ranh giới Identity.
- [Chính sách mật khẩu v0.2.0](../../04-standards/password-policy.md): PWD-001…PWD-004, PWD-006 đã được chủ sản phẩm phê duyệt cho khách hàng; PWD-005 không áp dụng cho đăng ký mới; PWD-007 do Plan thiết kế.
- [ADR-0002](../../06-decisions/0002-customer-organizer-app-boundaries.md), [ADR-0016](../../06-decisions/0016-expo-router-and-mobile-native-foundation.md), [ADR-0023](../../06-decisions/0023-encrypted-mmkv-for-offline-mobile-tickets.md): Ranh giới ứng dụng Web và Mobile; lưu trữ an toàn trên native.
- [DESIGN.md](../../../DESIGN.md), [PRODUCT Customer Web](../../../apps/customer-web/PRODUCT.md), [PRODUCT Customer Mobile](../../../apps/customer-mobile/PRODUCT.md) và [Chuẩn UI](../../04-standards/ui-quality.md): Bản sắc Ferrari Dark Cinema, bố cục Double-Stage, trợ năng WCAG 2.2 AA và native accessibility.
- [sources.md](sources.md): Dấu kiểm đầu vào (NFR snapshot SHA-256: `75FDB7F32BCACF5896D7F99C97EEA8D7D0BDAF5B3BFC5B9C6B1C97B8DB85BB73`, DB Identity snapshot SHA-256: `F5DCE0B6B95DD0A74E671E39DDAB6E636A918459BF87E74B37AC962C2E828C60`), quyết định phê duyệt ngày 2026-11-21 và bảng đối chiếu delta nguồn.

**Trong phạm vi:**
- Đăng ký tài khoản bằng Email và Mật khẩu trên Customer Web và Customer Mobile.
- Thu thập thông tin: Họ tên (bắt buộc), Email (bắt buộc), Mật khẩu (bắt buộc, tuân thủ PWD-001…004), Số điện thoại (tùy chọn theo BR-02).
- Áp dụng đầy đủ chính sách mật khẩu cho tài khoản mới:
  + Độ dài 15–128 Unicode code points sau chuẩn hóa NFC (PWD-001).
  + Chấp nhận mọi ký tự Unicode và khoảng trắng; giữ nguyên khoảng trắng đầu/cuối; phân biệt hoa/thường (PWD-002).
  + Không bắt buộc trộn chữ hoa/thường/số/ký hiệu (PWD-003).
  + Từ chối mật khẩu phổ biến/đã lộ bằng danh sách nội bộ máy chủ (PWD-004).
  + Bảo vệ bí mật khỏi log, telemetry, crash report (PWD-006).
  + PWD-005 không áp dụng cho đăng ký tài khoản mới.
  + PWD-007 (thuật toán băm Argon2id/bcrypt, salt, version) do Plan của Identity Service thiết kế chi tiết.
- Tạo tài khoản khách trong Identity Service với vai trò duy nhất `CUSTOMER` (BR-01). Tuyệt đối không cấp vai trò vận hành từ đăng ký công khai.
- Khởi tạo tư cách hội viên CineMember (BR-14) qua cơ chế bất đồng bộ (eventual consistency qua Outbox Pattern) sang module Hội viên của Cinema Core, bảo đảm tính idempotent khi retry.
- Trạng thái email khởi tạo là chưa xác minh (`emailVerified = false`).
- Bàn giao sang A-02: Tạo yêu cầu xác minh email; giao diện hiển thị thông điệp tiếp nhận trung tính hướng dẫn khách hàng, không khẳng định email đã gửi khi chưa có bằng chứng chuyển phát từ A-02.
- Phản hồi an toàn chống rò rỉ tài khoản (Anti-enumeration) theo Phương án B đã duyệt: Trả về thông điệp tiếp nhận trung tính đồng nhất và **bộ nút điều hướng hoàn toàn giống nhau** trên cả UI và API cho cả trường hợp email mới và email đã tồn tại.
- Trạng thái sau đăng ký theo Phương án A đã duyệt: Không tự động cấp phiên; hiển thị màn hình thông báo tiếp nhận hướng dẫn A-02 kèm bộ nút chuyển hướng chuẩn hóa (Đăng nhập ngay A-03, Khôi phục mật khẩu A-05, Gửi lại email xác minh A-02).
- Xử lý lỗi hệ thống trung thực theo mô hình 3 trạng thái (F4): Báo lỗi HTTP 5xx khi sự cố xảy ra trước commit; xử lý idempotent khi mất phản hồi sau commit; client báo lỗi kết nối trung thực khi không xác định được trạng thái commit in-flight.
- Bảo vệ ranh giới API chống đăng ký tự động/spam bằng giới hạn tần suất (Rate Limiting) theo địa chỉ IP.
- Trợ năng theo NFR-ACC-01 §9.13.2 (Bộ tham chiếu A): Kết hợp kiểm tra tự động và thủ công toàn hành trình trên ma trận thiết bị đã duyệt (Windows Narrator/Edge, iPhone 11 Pro Max thật cho Safari và iOS app, Android emulator cho TalkBack).
- Hỗ trợ triển khai theo đợt: Web trước, Mobile sau.

**Ngoài phạm vi:**
- Triển khai chi tiết use case A-02 (gửi email, xác thực mã OTP/token link), A-03 (đăng nhập), A-04 (quản lý hồ sơ/mật khẩu), A-05 (khôi phục mật khẩu).
- Đăng ký hoặc cấp vai trò vận hành (Staff, Cinema Manager, Chain Admin) — các vai trò này chỉ được cấp nội bộ (BR-01).
- Đăng ký qua mạng xã hội Google / Apple hoặc OTP qua SMS (BR-02: chưa hỗ trợ SMS/mạng xã hội trong đợt này).
- Cho phép giữ ghế (B-02) hoặc mua vé (B-05) khi email chưa được xác minh (BR-02 bắt buộc xác minh email trước lần giữ ghế/mua vé đầu tiên).
- Đăng ký tài khoản cho đối tác / ban tổ chức trên Cinema Organizer Web/Mobile (ADR-0002).

### Phạm vi nền tảng và nghiệm thu (Kế thừa NFR-ACC-01 §9.13.2 Bộ tham chiếu A)

| Nền tảng | Yêu cầu chung | Cấu hình công nghệ trợ năng & thiết bị đã duyệt | Bằng chứng cần có khi nghiệm thu |
|---|---|---|---|
| **Customer Web** (Desktop trên máy tính) | US1–US3, FR-001…016, FR-021 | Bàn phím tuần tự + Narrator + Microsoft Edge trên Windows (kết hợp kiểm tra bàn phím và tiêu chí áp dụng trên Chrome) | Báo cáo kiểm tra tự động (axe-core không có vi phạm nghiêm trọng) kết hợp kiểm tra thủ công toàn hành trình (focus trap, tab index, tương phản >= 4.5:1, zoom 200%) |
| **Customer Web** (Mobile Browser trên điện thoại) | US1–US3, FR-001…016, FR-021 | Safari + VoiceOver trên **iPhone 11 Pro Max thật** | Kiểm tra thao tác cảm ứng, thứ tự đọc/focus, nhãn và thông báo trên Safari của iPhone 11 Pro Max thật |
| **Customer Mobile — iOS** | US1–US3, FR-001…016, US4, FR-017…021 | Giao diện Expo/React Native, AutoFill Credential/iCloud Keychain, VoiceOver trên **iPhone 11 Pro Max thật** | Chạy trên iOS build thực tế, kiểm tra VoiceOver, cỡ chữ hệ thống (Dynamic Type), điều hướng native trên iPhone 11 Pro Max thật |
| **Customer Mobile — Android** | US1–US3, FR-001…016, US4, FR-017…021 | Giao diện Expo/React Native, Google Autofill / Credential Manager, TalkBack trên **Android emulator có Android Accessibility Suite** | Chạy trên Android Emulator có image/cấu hình công bố rõ; giữ nguyên công bố khoảng trống "hiệu năng Android trên máy thật chưa kiểm chứng" theo NFR-PERF-02 |

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Đăng ký tài khoản khách hàng thành công bằng Email và Mật khẩu (Priority: P1)

Khách chưa đăng nhập muốn tạo một tài khoản mới để trở thành hội viên CineMember, lưu trữ lịch sử và nhận ưu đãi, bằng cách cung cấp thông tin hợp lệ trên Web hoặc Mobile.

**Why this priority**: Đây là điểm vào cơ bản nhất để người dùng từ khách vãng lai trở thành người dùng có định danh trong hệ thống, là tiền đề cho A-02 và các dịch vụ cá nhân hóa, tích điểm sau này.  
**Independent Test**: Nhập email mới chưa có trong hệ thống, họ tên đầy đủ, số điện thoại (tùy chọn) và mật khẩu đạt chuẩn PWD-001…004 trên form đăng ký. Kiểm tra tài khoản được tạo trong Identity Service với role `CUSTOMER`, sự kiện tạo hội viên được phát sinh sang Cinema Core, `emailVerified = false`, và người dùng nhận được thông báo tiếp nhận yêu cầu xác minh email A-02.

**Acceptance Scenarios**:
1. **Given** khách chưa có tài khoản tại hệ thống, **When** nhập họ tên hợp lệ, email chưa tồn tại, mật khẩu đạt chuẩn (15–128 Unicode code points sau NFC, không trong blocklist) và gửi yêu cầu, **Then** Identity Service tạo tài khoản mới với vai trò `CUSTOMER`, trạng thái `emailVerified = false`, phát sinh sự kiện outbox tạo hội viên CineMember sang Cinema Core, và hiển thị giao diện thông báo tiếp nhận yêu cầu đăng ký theo thông điệp trung tính chuẩn hóa.
2. **Given** form đăng ký, **When** người dùng bỏ trống trường số điện thoại và điền đủ các trường bắt buộc khác (họ tên, email, mật khẩu), **Then** hệ thống chấp nhận đăng ký thành công (số điện thoại là tùy chọn theo BR-02).
3. **Given** form đăng ký, **When** người dùng điền số điện thoại hợp lệ (định dạng Việt Nam) cùng các trường bắt buộc, **Then** hệ thống lưu số điện thoại kèm hồ sơ tài khoản và tiếp nhận đăng ký thành công.
4. **Given** đăng ký thành công, **When** kiểm tra quyền hạn và khả năng mua vé, **Then** tài khoản KHÔNG có bất kỳ vai trò vận hành nào và KHÔNG được phép thực hiện giữ ghế hoặc thanh toán vé khi chưa hoàn thành xác minh email A-02 (BR-01, BR-02).
5. **Given** tài khoản Identity đã tạo thành công nhưng module Hội viên tại Cinema Core tạm thời chưa sẵn sàng hoặc event broker bị trễ, **When** người dùng hoàn tất đăng ký, **Then** API vẫn trả về kết quả tiếp nhận đăng ký thành công, sự kiện outbox sẽ tự động bù đắp (reconcile) tạo bản ghi hội viên khi Cinema Core phục hồi, không rollback tài khoản của khách và không tạo trùng lặp khi retry.
6. **Given** hoàn tất đăng ký (theo Phương án A và Phương án B đã duyệt), **When** xem kết quả phản hồi trên UI, **Then**:
   - Hệ thống KHÔNG tự động cấp phiên đăng nhập (session token); người dùng duy trì trạng thái unauthenticated.
   - Giao diện chuyển sang **màn hình tiếp nhận trung tính duy nhất**, hiển thị thông điệp chuẩn hóa: *"Yêu cầu đăng ký đã được tiếp nhận. Nếu địa chỉ email hợp lệ và chưa có tài khoản, hướng dẫn xác minh tài khoản sẽ được gửi đến hộp thư của bạn. Nếu bạn đã có tài khoản từ trước, vui lòng đăng nhập hoặc sử dụng chức năng khôi phục mật khẩu."*
   - Tuyệt đối KHÔNG khẳng định email đã gửi thành công khi chưa có bằng chứng chuyển phát từ A-02.
   - Hiển thị **bộ ba nút điều hướng đồng nhất hoàn toàn** (cùng vị trí, cùng nhãn, cùng đích điều hướng) với nhánh email đã tồn tại:
     + Nút *"Đăng nhập ngay"* (chuyển sang use case A-03).
     + Nút *"Khôi phục mật khẩu"* (chuyển sang use case A-05).
     + Nút *"Gửi lại email xác minh"* (gọi luồng gửi lại A-02).
   - Trạng thái hiển thị và kích hoạt của nút *"Gửi lại email xác minh"* tuân theo cơ chế cooldown / tính sẵn sàng chung của dịch vụ A-02, **hoàn toàn độc lập** với việc email là mới hay đã tồn tại.
   - KHÔNG tự động chuyển vào luồng đặt vé.

---

### User Story 2 — Xử lý an toàn khi email đã tồn tại và đầu vào không hợp lệ (Priority: P1)

Hệ thống ngăn chặn việc tạo tài khoản trùng lặp và bảo vệ tính toàn vẹn dữ liệu, đồng thời phản hồi an toàn chống dò quét tài khoản (Anti-enumeration) theo chuẩn OWASP khi email đã tồn tại.

**Why this priority**: Bảo đảm tính duy nhất của định danh tài khoản (Email) trong toàn hệ thống Identity, đồng thời ngăn chặn kẻ xấu lợi dụng tính năng đăng ký để rà quét danh sách email nạn nhân đã có tài khoản hay chưa.  
**Independent Test**: Thử đăng ký với email đã tồn tại trong cơ sở dữ liệu Identity; thử đăng ký với email sai định dạng cú pháp; kiểm tra phản hồi từ máy chủ và hiển thị trên UI để xác nhận tính trung tính tuyệt đối, không để lộ thông tin tồn tại tài khoản.

**Acceptance Scenarios**:
1. **Given** email `user@example.com` đã tồn tại trong hệ thống Identity, **When** người dùng gửi yêu cầu đăng ký với cùng email này, **Then** hệ thống từ chối tạo mới, không ghi đè dữ liệu cũ, và thực thi cơ chế phản hồi trung tính đồng nhất theo Phương án B đã duyệt:
   - Trên API: Trả về cùng mã trạng thái HTTP (200 OK) và cùng cấu trúc payload JSON `{ success: true, message: "..." }` như trường hợp tạo mới thành công, không chứa bất kỳ cờ mã lỗi (như `EMAIL_ALREADY_EXISTS`) hay trường dữ liệu phân biệt nào.
   - Trên UI: Hiển thị đúng **màn hình tiếp nhận trung tính duy nhất** với cùng thông điệp chuẩn hóa giống hệt trường hợp email mới: *"Yêu cầu đăng ký đã được tiếp nhận. Nếu địa chỉ email hợp lệ và chưa có tài khoản, hướng dẫn xác minh tài khoản sẽ được gửi đến hộp thư của bạn. Nếu bạn đã có tài khoản từ trước, vui lòng đăng nhập hoặc sử dụng chức năng khôi phục mật khẩu"*.
   - Hiển thị **cùng bộ ba nút điều hướng** với cùng trạng thái hiển thị và kích hoạt như trường hợp email mới:
     + Nút *"Đăng nhập ngay"* (chuyển sang use case A-03).
     + Nút *"Khôi phục mật khẩu"* (chuyển sang use case A-05).
     + Nút *"Gửi lại email xác minh"* (cùng hiển thị và áp dụng cùng logic cooldown/tính sẵn sàng của dịch vụ A-02, tuyệt đối không bị vô hiệu hóa hay ẩn đi dựa trên email trùng).
   - Nội bộ hệ thống: Không phát sinh sự kiện tạo tài khoản trùng; Identity Service có thể kích hoạt gửi email thông báo bảo mật đến chủ sở hữu email thật theo chính sách A-02/NFR-SEC-01 mà không làm thay đổi phản hồi công khai ra phía client.
2. **Given** email nhập vào chứa ký tự hoa hoặc khoảng trắng ở hai đầu (ví dụ: `  User.Name@Example.COM  `), **When** gửi form, **Then** hệ thống chuẩn hóa cắt khoảng trắng ngoài và chuyển về chữ thường (`user.name@example.com`) trước khi kiểm tra trùng lặp và lưu trữ.
3. **Given** email không đúng định dạng cú pháp chuẩn (thiếu `@`, thiếu tên miền, chứa ký tự không hợp lệ theo RFC/HTML5), **When** người dùng nhập liệu hoặc submit, **Then** hiển thị thông báo lỗi định dạng rõ ràng tại trường email và ngăn chặn gửi yêu cầu lên máy chủ.
4. **Given** trường Họ tên để trống hoặc chỉ chứa khoảng trắng, **When** submit form, **Then** hệ thống chặn lại và yêu cầu nhập họ tên đầy đủ.
5. **Given** người dùng nhập số điện thoại không đúng định dạng chuẩn (chứa chữ cái hoặc sai độ dài số điện thoại VN), **When** submit form, **Then** hệ thống báo lỗi định dạng số điện thoại rõ ràng, không lưu dữ liệu sai.

---

### User Story 3 — Tuân thủ chính sách mật khẩu dùng chung và bảo vệ an toàn thông tin (Priority: P1)

Người dùng thiết lập mật khẩu mới cho tài khoản tuân thủ chính sách mật khẩu dùng chung PWD-001…PWD-004, PWD-006, được hướng dẫn rõ ràng trên giao diện mà không bị ép buộc các tiêu chí phức tạp lỗi thời.

**Why this priority**: Đảm bảo an toàn thông tin theo chuẩn NIST SP 800-63B và chính sách v0.2.0 đã được chủ sản phẩm phê duyệt, ngăn chặn mật khẩu yếu hoặc đã bị rò rỉ.  
**Independent Test**: Thử các trường hợp mật khẩu: dưới 15 code points; đúng 15 code points; trên 128 code points; mật khẩu chứa Unicode có dấu tiếng Việt; mật khẩu passphrase có khoảng trắng; mật khẩu nằm trong danh sách mật khẩu phổ biến/đã lộ. Kiểm tra log hệ thống không ghi nhận mật khẩu thô.

**Acceptance Scenarios**:
1. **Given** mật khẩu nhập vào có độ dài dưới 15 Unicode code points sau chuẩn hóa NFC (ví dụ: 14 ký tự), **When** kiểm tra, **Then** hệ thống từ chối và thông báo mật khẩu phải có độ dài từ 15 đến 128 ký tự (PWD-001).
2. **Given** mật khẩu nhập vào vượt quá 128 Unicode code points sau chuẩn hóa NFC, **When** kiểm tra, **Then** hệ thống từ chối tiếp nhận (PWD-001).
3. **Given** mật khẩu là một cụm từ (passphrase) có độ dài từ 15 đến 128 Unicode code points sau chuẩn hóa NFC, chỉ gồm chữ thường và khoảng trắng (ví dụ: `chuyen tau cuoi he ve que`), **When** kiểm tra danh sách mật khẩu phổ biến/đã lộ:
   - Nếu KHÔNG nằm trong danh sách: Hệ thống chấp nhận mật khẩu hợp lệ mà KHÔNG bắt buộc phải có chữ hoa, số hay ký tự đặc biệt (PWD-003).
   - Nếu NẰM trong danh sách phổ biến/đã lộ: Hệ thống từ chối dù độ dài đã đạt >= 15 ký tự (PWD-004).
4. **Given** mật khẩu chứa các ký tự tiếng Việt có dấu ở các dạng phân rã Unicode khác nhau, **When** tiếp nhận, **Then** hệ thống chuẩn hóa về dạng NFC trước khi đếm độ dài và băm mật khẩu, giữ nguyên tính phân biệt hoa/thường và khoảng trắng (PWD-002).
5. **Given** mật khẩu nhập vào nằm trong danh sách các mật khẩu phổ biến hoặc đã từng bị lộ (blocklist kiểm tại máy chủ), **When** gửi đăng ký, **Then** máy chủ từ chối tiếp nhận và thông báo mật khẩu này quá phổ biến hoặc không an toàn, yêu cầu chọn mật khẩu khác (PWD-004), không gửi mật khẩu ra dịch vụ bên ngoài.
6. **Given** trường Xác nhận mật khẩu, **When** giá trị nhập vào không khớp chính xác từng ký tự với Mật khẩu khởi tạo, **Then** hệ thống cảnh báo không trùng khớp và ngăn chặn tạo tài khoản.
7. **Given** toàn bộ quá trình gửi form, xử lý tại API và lưu trữ, **When** kiểm tra log hệ thống, telemetry và chẩn đoán, **Then** tuyệt đối KHÔNG xuất hiện mật khẩu dạng bản rõ (plaintext) hay thông tin nhạy cảm (PWD-006).

---

### User Story 4 — Trải nghiệm đăng ký trên ứng dụng Mobile native (iOS & Android) an toàn và tối ưu (Priority: P1)

Khách hàng sử dụng ứng dụng Customer Mobile trên iOS hoặc Android có thể hoàn tất đăng ký tài khoản nhanh chóng, hỗ trợ các tiện ích native của hệ điều hành và hoạt động an toàn.

**Why this priority**: Ứng dụng di động là kênh tương tác chính của khách hàng; cần trải nghiệm mượt mà, đúng chuẩn nền tảng và bảo mật cao.  
**Independent Test**: Thực hiện đăng ký trên thiết bị/mô phỏng iOS và Android; kiểm tra tương tác bàn phím, tự động điền gợi ý mật khẩu mạnh của hệ điều hành, tính năng ẩn/hiện mật khẩu, VoiceOver/TalkBack và xử lý mất kết nối mạng.

**Acceptance Scenarios**:
1. **Given** ứng dụng Customer Mobile mở màn hình Đăng ký, **When** người dùng chọn trường Mật khẩu, **Then** hệ thống tích hợp thuộc tính textContentType / autofill hợp lệ để trình quản lý mật khẩu của iOS (iCloud Keychain) hoặc Android (Google Password Manager) có thể đề xuất mật khẩu mạnh và lưu trữ sau khi tạo thành công.
2. **Given** người dùng đang nhập liệu trên Mobile, **When** bật chức năng hiển thị mật khẩu (nút con mắt), **Then** trường mật khẩu hiển thị rõ ký tự kèm nhãn trợ năng (accessibility label) cập nhật trạng thái rõ ràng ("Ẩn mật khẩu" / "Hiển thị mật khẩu").
3. **Given** người dùng nhấn nút Đăng ký khi thiết bị đang mất kết nối mạng, **When** gửi form, **Then** ứng dụng hiển thị thông báo lỗi mất kết nối trung thực, cho phép thử lại khi có mạng, KHÔNG tạo tài khoản offline cục bộ.
4. **Given** người dùng sử dụng VoiceOver trên iPhone 11 Pro Max thật hoặc TalkBack trên Android emulator, **When** điều hướng qua form đăng ký, **Then** toàn bộ các trường nhập liệu, nhãn, lỗi inline và nút bấm đều được đọc chính xác vai trò, trạng thái và nội dung hướng dẫn theo NFR-ACC-01 §9.13.2.

---

### Edge Cases & Xử lý sự cố hệ thống (Kế thừa F4 — Phân định rõ 3 trạng thái lỗi)

- **Mật khẩu chứa khoảng trắng ở đầu hoặc cuối:** Hệ thống giữ nguyên khoảng trắng đầu/cuối theo PWD-002, không tự ý `trim()` mật khẩu (khác với email).
- **Email chứa ký tự đặc biệt hoặc chữ hoa:** Email được chuyển về chữ thường toàn bộ và cắt bỏ khoảng trắng thừa ở hai đầu trước khi kiểm tra trùng lặp và lưu trữ.
- **Nhiều lần nhấn nút submit liên tiếp (Double-click / Rapid clicks):** Phía client vô hiệu hóa nút submit ngay khi bắt đầu gửi yêu cầu; phía máy chủ áp dụng cơ chế idempotent (hoặc idempotency key theo header) để tránh tạo 2 bản ghi cho cùng một yêu cầu gửi đồng thời.
- **Tấn công vét cạn / spam đăng ký tự động (Registration Flood):** Máy chủ áp dụng Rate Limiting theo địa chỉ IP (tham số kỹ thuật do Plan thiết kế); vượt ngưỡng trả về mã lỗi HTTP 429 kèm cấu trúc `RegisterClientErrorResponse` và thông báo yêu cầu thử lại sau.
- **Mô hình 3 trạng thái lỗi hệ thống và mất phản hồi mạng (F4):**
  1. *Lỗi xác định trước commit (DB connection timeout, service lỗi nội bộ, máy chủ/gateway còn sống)*: Máy chủ/gateway trả về mã trạng thái HTTP 500 hoặc 503 với cấu trúc `RegisterSystemErrorResponse` trung thực: *"Hệ thống đang bận hoặc gặp sự cố xử lý, vui lòng thử lại sau"*. Tuyệt đối KHÔNG trả về HTTP 200 hay thông báo tiếp nhận thành công giả khi dữ liệu chưa được lưu bền vững.
  2. *Đã commit bền vững vào DB nhưng mất phản hồi về client (mạng rớt sau commit, crash ngay sau khi commit xong)*: Client không nhận được phản hồi HTTP mà rơi vào trạng thái timeout hoặc lỗi kết nối (Network Error). Khi người dùng nhấn gửi lại (retry), cơ chế idempotent của server (dựa trên email đã tồn tại hoặc idempotency key) sẽ nhận diện dữ liệu đã được lưu bền vững, không tạo tài khoản/hội viên lặp và trả về phản hồi tiếp nhận trung tính thành công.
  3. *Mất kết nối hoặc crash tại thời điểm commit (chưa xác định được commit thành công hay thất bại)*: Client không tự suy đoán thành công hay thất bại vĩnh viễn, mà hiển thị thông báo lỗi kết nối trung thực kèm hướng dẫn kiểm tra hoặc thử lại. Phía máy chủ: nếu giao dịch DB rollback hoàn toàn, lần thử lại tiếp theo sẽ tạo tài khoản bình thường; nếu giao dịch DB đã kịp commit, lần thử lại tiếp theo sẽ kích hoạt cơ chế idempotent trả về phản hồi trung tính an toàn. Không bao giờ để dữ liệu ở trạng thái mâu thuẫn (orphan account không có role hoặc outbox).
- **Cinema Core bị gián đoạn khi nhận sự kiện tạo hội viên:** Hồ sơ tài khoản Identity vẫn hợp lệ; sự kiện outbox được lưu bền vững và gửi lại khi Cinema Core hoạt động trở lại; xử lý idempotent tại Cinema Core tránh tạo nhiều bản ghi hội viên cho cùng một `user_id`.

### Ma trận đối chiếu phản hồi công khai theo trạng thái A-02 (Anti-enumeration Criteria — Kế thừa F1)

Để bảo đảm tuyệt đối không để lộ sự tồn tại của email qua phản hồi công khai (F1), toàn bộ giao diện và phản hồi kỹ thuật phải đồng nhất 100% giữa hai nhánh trong mọi tình huống của dịch vụ A-02:

| Trạng thái A-02 nội bộ | Nhánh Email MỚI (chưa có tài khoản) | Nhánh Email ĐÃ TỒN TẠI | Tiêu chí Anti-enumeration & Trạng thái UI |
|---|---|---|---|
| **Tình huống 1**: A-02 hoạt động bình thường, email gửi thành công | **HTTP 200**; Payload `{ success: true, message: "..." }`<br>**UI Message**: Thông điệp tiếp nhận trung tính chuẩn hóa<br>**Bộ nút**: "Đăng nhập ngay", "Khôi phục mật khẩu", "Gửi lại email xác minh"<br>**Trạng thái nút**: Cả 3 nút đều hiển thị; nút "Gửi lại" kích hoạt bình thường (kèm cooldown đếm ngược) | **HTTP 200**; Payload `{ success: true, message: "..." }`<br>**UI Message**: Cùng thông điệp tiếp nhận trung tính chuẩn hóa<br>**Bộ nút**: Cùng bộ 3 nút ("Đăng nhập ngay", "Khôi phục mật khẩu", "Gửi lại email xác minh")<br>**Trạng thái nút**: Cả 3 nút đều hiển thị; nút "Gửi lại" có cùng trạng thái kích hoạt và cooldown đếm ngược | **Đồng nhất 100%**: Mã HTTP, JSON payload, thông điệp UI, danh sách 3 nút điều hướng và trạng thái controls hoàn toàn giống nhau |
| **Tình huống 2**: A-02 chưa triển khai (stub/mock/chưa cấu hình) | **HTTP 200**; Payload `{ success: true, message: "..." }`<br>**UI Message**: Thông điệp tiếp nhận trung tính chuẩn hóa<br>**Bộ nút**: "Đăng nhập ngay", "Khôi phục mật khẩu", "Gửi lại email xác minh"<br>**Trạng thái nút**: Nút "Gửi lại" hiển thị trạng thái tạm khóa kèm thông báo chung "Tính năng gửi lại đang chuẩn bị" | **HTTP 200**; Payload `{ success: true, message: "..." }`<br>**UI Message**: Cùng thông điệp tiếp nhận trung tính chuẩn hóa<br>**Bộ nút**: Cùng bộ 3 nút ("Đăng nhập ngay", "Khôi phục mật khẩu", "Gửi lại email xác minh")<br>**Trạng thái nút**: Nút "Gửi lại" cũng hiển thị trạng thái tạm khóa kèm thông báo chung giống hệt nhánh email mới | **Đồng nhất 100%**: Tuyệt đối không bên nào khẳng định email đã gửi vào hộp thư; trạng thái nút gửi lại chỉ phụ thuộc tính sẵn sàng của A-02 |
| **Tình huống 3**: A-02 lỗi chuyển phát (mail server down, queue nghẽn) | **HTTP 200**; Payload `{ success: true, message: "..." }`<br>**UI Message**: Thông điệp tiếp nhận trung tính chuẩn hóa<br>**Bộ nút**: "Đăng nhập ngay", "Khôi phục mật khẩu", "Gửi lại email xác minh"<br>**Trạng thái nút**: Nút "Gửi lại" hiển thị bình thường kèm cooldown (nội bộ outbox tự động retry chuyển phát) | **HTTP 200**; Payload `{ success: true, message: "..." }`<br>**UI Message**: Cùng thông điệp tiếp nhận trung tính chuẩn hóa<br>**Bộ nút**: Cùng bộ 3 nút ("Đăng nhập ngay", "Khôi phục mật khẩu", "Gửi lại email xác minh")<br>**Trạng thái nút**: Nút "Gửi lại" hiển thị bình thường kèm cooldown giống hệt nhánh email mới | **Đồng nhất 100%**: Lỗi gửi email nền không làm thay đổi phản hồi đăng ký công khai hay danh sách nút điều hướng |

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống CHỈ hỗ trợ đăng ký tài khoản khách hàng bằng Email và Mật khẩu. Bỏ hoàn toàn các nút đăng ký mạng xã hội giả (Google, Apple) và nút tiếp tục đặt vé khách giả lập khỏi giao diện đăng ký trong phạm vi A-01.
- **FR-002**: Form đăng ký phải khởi tạo ở trạng thái rỗng, không điền sẵn dữ liệu mẫu; bao gồm các trường: Họ tên (bắt buộc), Email (bắt buộc), Mật khẩu (bắt buộc), Xác nhận mật khẩu (bắt buộc), Số điện thoại (tùy chọn theo BR-02), Checkbox chấp thuận Điều khoản dịch vụ và Chính sách bảo mật (bắt buộc).
- **FR-003**: Trường Mật khẩu phải tuân thủ nghiêm ngặt chính sách PWD-001…PWD-004 cho mật khẩu mới:
  - Độ dài hợp lệ: từ 15 đến 128 Unicode code points sau khi chuẩn hóa NFC (PWD-001).
  - Chấp nhận mọi ký tự Unicode và khoảng trắng; giữ nguyên khoảng trắng đầu/cuối; phân biệt hoa/thường (PWD-002).
  - Không bắt buộc phối hợp chữ hoa, chữ thường, số hoặc ký hiệu đặc biệt; chấp nhận passphrase (PWD-003).
  - Từ chối mật khẩu nằm trong danh sách mật khẩu phổ biến hoặc đã bị lộ (PWD-004) bằng cơ chế kiểm tra nội bộ tại máy chủ; cấm gửi mật khẩu ra dịch vụ bên ngoài.
  - PWD-005 không áp dụng cho luồng tạo mật khẩu mới A-01.
- **FR-004**: Giao diện người dùng phải cung cấp chỉ báo hướng dẫn mật khẩu rõ ràng (độ dài 15–128 ký tự sau NFC, không bắt buộc loại ký tự, không thuộc mật khẩu phổ biến); không sử dụng thanh đo độ mạnh cũ (dựa trên tiêu chí phối hợp 4 loại ký tự) trong form đăng ký.
- **FR-005**: Trường Mật khẩu và Xác nhận mật khẩu phải có nút chuyển đổi ẩn/hiện mật khẩu với tên truy cập và nhãn trợ năng phù hợp cho người dùng khiếm thị.
- **FR-006**: Xác nhận mật khẩu phải trùng khớp hoàn toàn từng ký tự với Mật khẩu khởi tạo; hiển thị phản hồi tức thì trên giao diện khi người dùng nhập liệu.
- **FR-007**: Hệ thống áp dụng cơ chế phản hồi tiếp nhận trung tính (Anti-enumeration) theo Phương án B đã được chủ sản phẩm phê duyệt ngày 2026-11-21:
  - Khi người dùng đăng ký bằng email đã tồn tại, máy chủ từ chối tạo mới nhưng trả về cùng mã trạng thái HTTP (200 OK) và cùng cấu trúc payload JSON thành công chung (`RegisterResponse`) như trường hợp tạo mới thành công, không để lộ cờ lỗi hay thông điệp phân biệt.
  - Giao diện chuyển sang **màn hình tiếp nhận trung tính duy nhất** với thông điệp chuẩn hóa: *"Yêu cầu đăng ký đã được tiếp nhận. Nếu địa chỉ email hợp lệ và chưa có tài khoản, hướng dẫn xác minh tài khoản sẽ được gửi đến hộp thư của bạn. Nếu bạn đã có tài khoản từ trước, vui lòng đăng nhập hoặc sử dụng chức năng khôi phục mật khẩu"*.
  - Hiển thị **cùng một bộ ba nút điều hướng** giống hệt trường hợp email mới: *"Đăng nhập ngay"* (A-03), *"Khôi phục mật khẩu"* (A-05), và *"Gửi lại email xác minh"* (A-02).
  - Trạng thái hiển thị và kích hoạt của nút *"Gửi lại email xác minh"* hoàn toàn độc lập với việc email có tồn tại hay không, chỉ phụ thuộc vào trạng thái chung của tính sẵn sàng dịch vụ A-02 và bộ đếm ngược cooldown.
  - Tuyệt đối không khẳng định email đã gửi thành công khi chưa có bằng chứng chuyển phát từ A-02.
- **FR-008**: Tài khoản khách hàng tạo mới qua luồng đăng ký công khai CHỈ ĐƯỢC gán duy nhất vai trò `CUSTOMER` trong Identity Service (BR-01, ánh xạ cột `role_code = 'CUSTOMER'`). Hệ thống cấm tuyệt đối việc gán bất kỳ vai trò vận hành nào (Staff, Manager, Admin) qua luồng này.
- **FR-009**: Khi tài khoản được tạo thành công trong Identity Service, hệ thống phát sinh sự kiện qua Outbox Pattern để kích hoạt tạo hồ sơ hội viên CineMember tại Cinema Core (BR-14) với trạng thái khởi tạo và điểm số ban đầu là 0. Quá trình này diễn ra bất đồng bộ (eventual consistency); lỗi tạo hội viên tại Cinema Core không làm rollback tài khoản Identity và được bù đắp qua cơ chế retry idempotent.
- **FR-010**: Tài khoản mới được khởi tạo với trạng thái email chưa xác minh (`emailVerified = false`). Phân biệt rạch ròi 4 mốc nội bộ: (1) tạo tài khoản thành công ở Identity, (2) phát sinh yêu cầu xác minh email, (3) chuyển phát email qua dịch vụ email A-02, và (4) khách hàng xác minh email thành công (A-02 hoàn tất).
- **FR-011**: Tài khoản mới chưa xác minh email KHÔNG ĐƯỢC PHÉP thực hiện thao tác giữ ghế (B-02) hoặc mua vé (B-05) theo quy định BR-02.
- **FR-012**: Hệ thống áp dụng cơ chế không cấp phiên tự động theo Phương án A đã được chủ sản phẩm phê duyệt ngày 2026-11-21:
  - Sau khi hoàn tất đăng ký, hệ thống không tự động cấp phiên đăng nhập (session token); người dùng duy trì trạng thái unauthenticated.
  - Giao diện chuyển sang **màn hình thông báo tiếp nhận trung tính duy nhất**, hiển thị thông điệp tiếp nhận chuẩn hóa kèm bộ ba nút điều hướng: *"Đăng nhập ngay"* (chuyển sang A-03), *"Khôi phục mật khẩu"* (chuyển sang A-05), và *"Gửi lại email xác minh"* (gọi luồng A-02).
  - Giữ vững ranh giới độc lập giữa use case A-01 và A-03; không tự ý chuyển người dùng vào trang đặt vé hoặc trang thông tin cá nhân.
- **FR-013**: Tuyệt đối bảo vệ thông tin mật khẩu: không ghi mật khẩu thô vào log, chẩn đoán, telemetry hoặc trả ngược lại client trong bất kỳ phản hồi nào (PWD-006).
- **FR-014**: Bằng chứng mật khẩu được lưu trữ an toàn trong Identity Service theo chuẩn PWD-007 (thuật toán băm mạnh như Argon2id / bcrypt, kèm salt ngẫu nhiên duy nhất cho mỗi tài khoản; tham số cụ thể do Plan thiết kế).
- **FR-015**: Áp dụng giới hạn tần suất (Rate Limiting) trên endpoint đăng ký của máy chủ để chống brute-force và spam tài khoản rác (theo địa chỉ IP; tham số cụ thể do Plan thiết kế).
- **FR-016**: Giao diện Web phải đạt chuẩn WCAG 2.2 AA theo NFR-ACC-01 §9.13.2 (Bộ tham chiếu A): kết hợp kiểm tra tự động và kiểm tra thủ công toàn hành trình trên Windows (Edge/Narrator + bàn phím, kiểm bàn phím trên Chrome) và trên iPhone (Safari/VoiceOver trên iPhone 11 Pro Max thật).
- **FR-017**: Ứng dụng Customer Mobile phải hỗ trợ trải nghiệm native trên cả iOS và Android: tự động điền (Autofill/Credential Manager), bàn phím ảo đúng loại (`email-address`, `phone-pad`), và xử lý xoay màn hình.
- **FR-018**: Ứng dụng Mobile phải hỗ trợ khả năng tiếp cận nền tảng theo NFR-ACC-01 §9.13.2 (Bộ tham chiếu A): VoiceOver trên **iPhone 11 Pro Max thật**, TalkBack trên **Android emulator có Android Accessibility Suite**, và tự động co giãn kích thước chữ theo Dynamic Type / Font Scaling của hệ thống.
- **FR-019**: Khi mất kết nối mạng trên Mobile hoặc Web, hệ thống phải hiển thị thông báo lỗi kết nối rõ ràng, không tạo tài khoản giả định hoặc lưu trữ offline.
- **FR-020**: Phân kỳ triển khai: Cho phép hoàn thành và nghiệm thu độc lập trên Customer Web trước, sau đó triển khai và nghiệm thu trên Customer Mobile (iOS/Android), với cùng một backend Identity Service và cùng chính sách mật khẩu.
- **FR-021**: Xử lý lỗi hệ thống trung thực và an toàn theo mô hình 3 trạng thái (F4):
  - *Trạng thái 1 (Lỗi trước commit, máy chủ/gateway còn phản hồi được)*: Khi xảy ra sự cố phía máy chủ trước khi dữ liệu được commit bền vững (DB connection timeout, service lỗi nội bộ), máy chủ/gateway phải trả về mã lỗi HTTP 500 hoặc 503 kèm cấu trúc `RegisterSystemErrorResponse`. Tuyệt đối KHÔNG trả về HTTP 200 hay thông báo tiếp nhận thành công giả.
  - *Trạng thái 2 (Đã commit bền vững nhưng mất phản hồi về client)*: Khi giao dịch DB đã commit thành công nhưng client bị timeout mạng hoặc crash sau commit dẫn đến mất phản hồi HTTP, client xử lý hiển thị lỗi kết nối/timeout. Khi client retry (hoặc người dùng bấm lại), máy chủ áp dụng cơ chế idempotent để nhận diện yêu cầu, trả về kết quả tiếp nhận trung tính mà không tạo bản ghi người dùng, mật khẩu hoặc outbox trùng lặp.
  - *Trạng thái 3 (Mất kết nối tại thời điểm commit / chưa xác định trạng thái commit)*: Client hiển thị thông báo lỗi kết nối trung thực kèm hướng dẫn kiểm tra hoặc thử lại. Máy chủ bảo đảm tính toàn vẹn giao dịch: rollback nếu commit dở dang hoặc bảo toàn dữ liệu nếu commit đã hoàn tất, không bao giờ để lại dữ liệu rác (orphan user) không có role hoặc outbox.
  - Phản hồi lỗi hệ thống tuyệt đối không để lộ thông tin cấu trúc nội bộ, stack trace hay tạo kênh side-channel dò quét tài khoản.

### Key Entities & Ánh xạ kỹ thuật

- **Identity Account (Tài khoản định danh - Logic)**: Thuộc quyền sở hữu duy nhất của Identity Service.
  - Thuộc tính nghiệp vụ: `id` (UUID), `email` (string, unique, lowercase), `fullName` (string), `phone` (string, optional), `role` (`CUSTOMER`), `emailVerified` (boolean, khởi tạo `false`), `createdAt`, `updatedAt`.
  - *Ánh xạ schema DB draft (`databases/identity.md`)*: Bảng `users` (`id`, `name`, `email`, `email_verified`, `phone_number`), bảng `accounts` (`password_hash`), bảng `user_role_assignments` (khóa chính `id` tiền tố `ura_`, `user_id`, cột `role_code = 'CUSTOMER'`, `cinema_id = NULL`).
  - *Lưu ý*: DB draft là tài liệu tham chiếu cấu trúc, không phải quyết định schema triển khai vật lý đã duyệt; chi tiết schema sẽ do bước Plan thiết kế.
- **CineMember Profile (Hồ sơ hội viên - Logic)**: Thuộc quyền sở hữu của Cinema Core (module Hội viên).
  - Thuộc tính nghiệp vụ: `userId`, `memberCode` (mã hội viên), `membershipStatus` (`PENDING` | `ACTIVE`), `currentPoints` (`0`), `tier` (`BASIC` theo BR-28 / `STANDARD` trên UI).
  - *Ánh xạ schema DB draft (`databases/cinema-core.md`)*: Bảng `loyalty_members` (`user_id`, `current_tier = 'BASIC'`, `points_balance = 0`, `total_spending_12m = 0`). Được đồng bộ bất đồng bộ từ Identity Service qua Outbox Pattern.
- **Hợp đồng API Đăng ký (Contracts - Chuẩn hóa theo Anti-enumeration Phương án B và Lỗi hệ thống F4)**:
  - `RegisterRequest`: `{ fullName: string, email: string, password: string, phone?: string }`.
  - `RegisterResponse` (HTTP 200 OK): `{ success: true, message: string }` (Trả về thông điệp tiếp nhận trung tính chung cho cả trường hợp tạo mới và trường hợp email đã tồn tại, không có cờ phân biệt).
  - `RegisterClientErrorResponse` (HTTP 400 Bad Request / HTTP 429 Too Many Requests): `{ success: false, code: string, message: string, fieldErrors?: Record<string, string> }` (Dùng cho lỗi định dạng dữ liệu đầu vào hoặc vượt ngưỡng rate limit).
  - `RegisterSystemErrorResponse` (HTTP 500 Internal Server Error / HTTP 503 Service Unavailable): `{ success: false, code: 'INTERNAL_ERROR' | 'SERVICE_UNAVAILABLE', message: string }` (Dùng khi lỗi hệ thống máy chủ trước commit mà máy chủ/gateway còn phản hồi được).

### Bảng nguồn thẩm quyền và truy vết (Authority Tracing Table)

| Mã yêu cầu | Nguồn thẩm quyền | Chủ đề quy định | Ánh xạ FR / SC | Ghi chú và ranh giới |
|---|---|---|---|---|
| **BR-01** | Mô hình sản phẩm; đã duyệt | Khách tự đăng ký vai trò `CUSTOMER`; vai trò vận hành cấp nội bộ | FR-008, SC-002 | Khớp `role_code = 'CUSTOMER'` trong `user_role_assignments` |
| **BR-02** | Mô hình sản phẩm; đã duyệt | Email + mật khẩu; số điện thoại tùy chọn; xác minh email trước khi giữ ghế/mua vé | FR-001, FR-002, FR-010, FR-011, SC-001, SC-002 | Số điện thoại không bắt buộc; emailVerified khởi tạo là false |
| **BR-14** | Mô hình sản phẩm; đã duyệt | Tự thành hội viên khi đăng ký; điểm khởi tạo 0 | FR-009, SC-001 | Tạo hội viên bất đồng bộ qua outbox sang Cinema Core |
| **PWD-001** | Chuẩn mật khẩu v0.2.0; đã duyệt | Mật khẩu mới dài 15–128 Unicode code points sau NFC | FR-003, SC-003 | Kiểm tra tại cả client và máy chủ; biên 14/15/128/129 |
| **PWD-002** | Chuẩn mật khẩu v0.2.0; đã duyệt | Chấp nhận Unicode, khoảng trắng; chuẩn hóa NFC; giữ khoảng trắng đầu/cuối | FR-003, SC-003 | Không trim mật khẩu; hỗ trợ tiếng Việt có dấu |
| **PWD-003** | Chuẩn mật khẩu v0.2.0; đã duyệt | Không bắt buộc trộn chữ hoa, thường, số, ký hiệu | FR-003, FR-004, SC-003 | UI không dùng thang đo cũ để ép phối hợp ký tự |
| **PWD-004** | Chuẩn mật khẩu v0.2.0; đã duyệt | Từ chối mật khẩu phổ biến/đã lộ bằng danh sách nội bộ server | FR-003, SC-003 | Cấm gửi mật khẩu ra dịch vụ ngoài |
| **PWD-005** | Chuẩn mật khẩu v0.2.0; đã duyệt | Tương thích mật khẩu cũ và xác minh legacy | *Không áp dụng* | PWD-005 dành cho A-03 (login) và khôi phục, không áp dụng cho tạo mới A-01 |
| **PWD-006** | Chuẩn mật khẩu v0.2.0; đã duyệt | Không lộ mật khẩu trong log, telemetry, phản hồi API | FR-013, SC-005 | Kiểm tra log thành công và thất bại |
| **PWD-007** | Chuẩn mật khẩu v0.2.0; cơ chế thuộc Plan | Băm mật khẩu an toàn bằng thuật toán mạnh (Argon2id/bcrypt) kèm salt | FR-014 | Cơ chế kỹ thuật do Plan của Identity Service thiết kế |
| **ADR-0008** | Quyết định kiến trúc đã duyệt | Better Auth, form trực tiếp, ranh giới Identity Service | FR-001, FR-014, SC-001 | Khớp ranh giới dịch vụ và kiến trúc xác thực |
| **NFR-SEC-01** | NFR snapshot đã đối chiếu | Phân quyền vai trò, bảo vệ credential, anti-enumeration | FR-007, FR-008, FR-013, FR-015, FR-021, SC-002, SC-004, SC-005 | Phản hồi trung tính Phương án B đã duyệt; rate limit; xử lý lỗi an toàn |
| **NFR-ACC-01** | NFR §9.13.2 Bộ tham chiếu A đã duyệt | WCAG 2.2 AA trên Web, Accessibility trên iOS/Android | FR-016, FR-018, SC-006 | Narrator/Edge, Safari/VoiceOver iPhone 11 Pro Max, TalkBack emulator |
| **NFR-PERF-01/02** | NFR đã duyệt | Hiệu năng Web và Mobile native | SC-001, Bảng phạm vi nền tảng | Phân định ngưỡng đã duyệt với đề xuất; giữ khoảng trống Android thật |
| **ADR-0016 / 0023** | Quyết định kiến trúc đã duyệt | Nền tảng native Expo/React Native, tương tác chuẩn OS | FR-017, FR-019, SC-004 | Hỗ trợ Autofill native, không lưu trữ offline tài khoản |

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 
  - *Thời gian phản hồi máy chủ xử lý đăng ký*: Đề xuất thời gian phản hồi p95 dưới 1.5 giây trong điều kiện mạng tiêu chuẩn (tham chiếu NFR-PERF-01); điều kiện tải và cấu hình đo cụ thể do Plan xác định.
  - *Thời gian thao tác người dùng*: Mục tiêu UX quan sát dưới 2 phút đối với người dùng nhập liệu thông thường; không coi là cam kết SLA hệ thống ràng buộc.
- **SC-002**: 100% tài khoản tạo mới qua luồng đăng ký công khai đều mang vai trò duy nhất `CUSTOMER` (ánh xạ `role_code = 'CUSTOMER'`) và có trạng thái `emailVerified = false`, không có ngoại lệ nào được cấp vai trò vận hành hoặc được phép bỏ qua xác minh email để đặt vé.
- **SC-003**: 100% các ca thử nghiệm mật khẩu tuân thủ chính xác chính sách PWD-001…PWD-004:
  - 100% mật khẩu dưới 15 ký tự code point hoặc trên 128 code point sau NFC bị từ chối với thông báo chính xác.
  - 100% mật khẩu dạng cụm từ (passphrase) đạt độ dài 15–128 Unicode code points sau chuẩn hóa NFC VÀ không nằm trong danh sách mật khẩu phổ biến/đã lộ (PWD-004) được chấp nhận thành công.
  - 100% mật khẩu thuộc danh sách phổ biến/đã lộ bị máy chủ từ chối tiếp nhận (kể cả khi độ dài đạt >= 15 ký tự).
  - 100% ký tự Unicode tiếng Việt có dấu (NFC/NFD) được xử lý nhất quán và chính xác.
- **SC-004**: Khi nhập email đã tồn tại, 100% trường hợp bị từ chối tạo mới, không xảy ra ghi đè dữ liệu cũ, và hệ thống trả về phản hồi trung tính đồng nhất cả trên UI và API (mã HTTP 200, payload không chứa cờ phân biệt, cùng thông điệp tiếp nhận chuẩn hóa, cùng bộ ba nút điều hướng và cùng trạng thái controls) theo Phương án B đã được chủ sản phẩm phê duyệt, bảo đảm không bị phân biệt trong cả 3 tình huống của A-02 (khỏe mạnh, chưa triển khai, lỗi chuyển phát).
- **SC-005**: 0 trường hợp mật khẩu dạng bản rõ (plaintext) bị ghi lại trong log hệ thống, telemetry, crash report hoặc truyền trả ngược về client trong các phản hồi API (kiểm soát chống rò rỉ theo PWD-006).
- **SC-006**: Đạt chuẩn WCAG 2.2 AA trên Web và tiêu chí phù hợp nền tảng trên Mobile theo NFR-ACC-01 §9.13.2 (Bộ tham chiếu A) thông qua kiểm tra tự động (axe-core) kết hợp kiểm tra thủ công toàn hành trình trên cấu hình chuẩn: Narrator + Edge trên Windows, VoiceOver trên iPhone 11 Pro Max thật (cho Safari và iOS app), và TalkBack trên Android emulator.
- **SC-007**: Tỷ lệ hoàn tất đăng ký thành công lần đầu (First-time registration success rate) đặt mục tiêu trải nghiệm đạt ít nhất 85% đối với người dùng có thông tin hợp lệ (chỉ số chất lượng UX đề xuất cần đo baseline khi thử nghiệm, không phải cam kết SLA cứng).
- **SC-008**: Hoàn thành và nghiệm thu độc lập được phân kỳ: Customer Web có thể nghiệm thu trước mà không bị chặn bởi tiến độ của Customer Mobile.
- **SC-009**: Tiêu chí xử lý lỗi hệ thống và mất phản hồi theo mô hình 3 trạng thái (F4):
  - 100% các trường hợp lỗi hệ thống xác định trước commit mà máy chủ/gateway còn phản hồi được (DB connection timeout, service lỗi nội bộ) phải trả về mã lỗi HTTP 5xx trung thực, không bao giờ trả về HTTP 200 hay thông báo tiếp nhận thành công giả.
  - 0% trường hợp sự cố crash hoặc ngắt kết nối mạng tại thời điểm commit làm phát sinh tài khoản mâu thuẫn (orphan account không có role hoặc outbox).
  - 100% các yêu cầu gửi lại (retry) sau khi mất phản hồi mạng ở bước post-commit được xử lý an toàn idempotent, không tạo bản ghi tài khoản hoặc hội viên trùng lặp.

## Assumptions

- **Ranh giới dịch vụ & Giao dịch phân tán**: Identity Service và Cinema Core là hai dịch vụ độc lập với cơ sở dữ liệu riêng biệt. Hệ thống không sử dụng distributed transaction. Tư cách hội viên CineMember (BR-14) được khởi tạo bất đồng bộ qua Transactional Outbox Pattern từ Identity sang Cinema Core; hồ sơ hội viên sẽ được bảo đảm hoàn tất trước khi khách hàng thực hiện giao dịch đầu tiên (vốn đã bị chặn bởi xác minh email A-02).
- **Bàn giao Dịch vụ Email (A-02)**: Use case A-01 chỉ chịu trách nhiệm tạo tài khoản với `emailVerified = false` và phát sinh yêu cầu xác minh sang hệ thống gửi email (A-02). Thông điệp công khai ra ngoài luôn mang tính tiếp nhận trung tính, không khẳng định email đã gửi thành công khi chưa có bằng chứng chuyển phát.
- **Môi trường Mobile & Ràng buộc thiết bị**: Ứng dụng Customer Mobile được phát triển trên nền tảng Expo / React Native theo ADR-0016. Trợ năng tuân thủ Bộ tham chiếu A của NFR-ACC-01 §9.13.2 (iPhone 11 Pro Max thật cho iOS, Android emulator cho Android). Giữ nguyên quyết định đã duyệt của NFR-PERF-02 về việc công bố khoảng trống hiệu năng Android trên máy thật trong giai đoạn demo.
- **Danh sách mật khẩu phổ biến (PWD-004)**: Danh sách kiểm tra mật khẩu yếu/đã lộ tại máy chủ sẽ được quản lý bằng bộ dữ liệu nội bộ (ví dụ: top 100k passwords phổ biến nhất), không thực hiện cuộc gọi API ra dịch vụ bên ngoài trong thời gian thực để bảo vệ quyền riêng tư người dùng.
- **Quy trình tiếp theo**: Bản spec v0.3.2 đã hoàn tất việc xử lý dứt điểm các điểm còn sót F1, F4 và ghi nhận delta nguồn F3 từ đợt review độc lập lần 2. Sau khi reviewer độc lập xác nhận và chủ sản phẩm chính thức ký duyệt spec, sẽ tiến hành lập kế hoạch chi tiết (`plan.md`). Sau khi `plan.md` được duyệt, mới tiến hành chia nhỏ công việc (`tasks.md`). Tuyệt đối chưa viết code, migration hoặc triển khai khi chưa có phê duyệt.
