# Feature Specification: A-03 — Đăng nhập khách hàng (Web và Mobile)

**Feature Branch**: Worktree Codex quản lý, detached HEAD; chưa tạo nhánh phát hành.
**Created**: 2026-11-20
**Status**: Accepted — v0.3.2, làm rõ trạng thái/nguồn sau rà checklist; giữ hành vi và SC của v0.3.1. Bản nền v0.3.0 được duyệt trong hội thoại ngày 2026-11-20; ba nhóm quyết định mật khẩu sau đó được chủ sản phẩm chọn A. Chủ sản phẩm đã cho chuyển sang tasks, yêu cầu hoàn tất review tài liệu và đồng ý cách tính giới hạn thử sai ghi tại plan v0.3.0. Chưa cấp quyền code/cài đặt/runtime.
**Approval**: “tôi duyệt bản spec này”, hội thoại A-03 ngày 2026-11-20. SHA256 nội dung được trình duyệt trước khi bổ sung ghi nhận phê duyệt: `FE88A03201D8510F98242CBF174D39927BE5ED72AD069F923FB0026415475D87`; code nền `2a007797ac9ce542d9747aad0f44f3e430eec581`. Chưa có commit hoặc URL phê duyệt riêng; thay đổi trạng thái này không tự chọn giá trị PWD còn mở.
**Input**: Chuẩn bị một spec A-03 cho Customer Web và Customer Mobile iOS/Android; có cả phiên thường và phiên ghi nhớ. Có thể chia triển khai Web trước, Mobile sau trong plan. Chưa viết code/migration, cài dependency, commit/push/merge/deploy.

## Phạm vi và nguồn thẩm quyền

Mục tiêu: khách dùng cùng tài khoản để đăng nhập thật trên Customer Web hoặc Customer Mobile, được nhận diện đúng và chỉ dùng chức năng thuộc quyền; có thể kết thúc phiên an toàn. Đây là yêu cầu mục tiêu, không phải hiện trạng đã vận hành. Mỗi kênh tạo phiên độc lập, không yêu cầu khách tạo tài khoản khác hoặc chép credential giữa Web và Mobile.

Kế thừa [A-03 và BR-01/02/36/38/41](../../03-product/use-cases.md), [mô tả use case, mục A-03](../../03-product/use-case-descriptions.md), [constitution v2.0.1](../../../.specify/memory/constitution.md), [kiến trúc](../004-service-decomposition/spec.md), [quyết định](../004-service-decomposition/decisions.md) và [ADR-0008](../../06-decisions/0008-better-auth-with-direct-login.md). Identity sở hữu danh tính/phiên; service nghiệp vụ tự kiểm quyền tài nguyên. Không chọn lại stack hoặc thay chủ dữ liệu.

UI giữ [DESIGN](../../../DESIGN.md), [PRODUCT Customer Web](../../../apps/customer-web/PRODUCT.md), [PRODUCT Customer Mobile](../../../apps/customer-mobile/PRODUCT.md) và [chuẩn UI](../../04-standards/ui-quality.md). Web và native có tương tác/điều hướng phù hợp nền tảng theo [ADR-0002](../../06-decisions/0002-customer-organizer-app-boundaries.md). [sources.md](sources.md) ghi nguồn NFR/DB chưa hợp nhất, dấu kiểm phiên bản và code đối chiếu; không tạo bộ chuẩn NFR/DB thứ hai.

**Trong phạm vi đã duyệt:** đăng nhập email/mật khẩu, phiên thường/ghi nhớ, khôi phục trạng thái sau tải lại hoặc mở lại app, đăng xuất phiên hiện tại, danh tính thật tại ranh giới app/API của hai kênh, trạng thái lỗi/hết phiên/thiếu quyền, vòng đời native và kiểm chứng ranh giới hai tài khoản. Một bộ spec–plan–tasks tại thư mục này; yêu cầu chung áp dụng cả hai app, phần riêng và bằng chứng nghiệm thu tách theo nền tảng.

**Ngoài phạm vi:** triển khai A-01/A-02/A-04/A-05, xóa tài khoản, Organizer Web/Mobile, đăng nhập/cấp quyền vận hành và quản lý MFA, Google/Apple/điện thoại/OTP/SMS/SSO/sinh trắc học, quản lý hoặc đăng xuất mọi phiên, cá nhân hóa, toàn bộ Core runtime và thanh toán thật. Không triển khai đầy đủ kho vé offline B-07; chỉ kiểm ranh giới phiên/cache riêng tư nếu có dữ liệu thử liên quan. Các luồng tài khoản liên quan chỉ có liên kết khi khả năng thực tế hỗ trợ; không giả thành công hoặc xây thêm chúng để hoàn tất A-03.

### Phạm vi nền tảng và nghiệm thu

| Nền tảng | Yêu cầu chung | Phần riêng | Bằng chứng cần có khi triển khai |
|---|---|---|---|
| Customer Web — desktop và trình duyệt điện thoại | US1–US3, FR-001…020/022 | Tải lại, các tab chung phiên, Back/forward, mở lại trình duyệt, điểm đến nội bộ | Từng cấu hình trình duyệt/viewport đã duyệt; bàn phím, trình đọc màn hình, thao tác đúng/lỗi và ranh giới máy chủ |
| Customer Mobile — iOS | US1–US3, FR-001…016/018…020/022 | US4, FR-021/023/024; đóng/mở app, ra nền/quay lại, liên kết mở app và lưu/đọc phiên | Build native và ma trận iOS/thiết bị/trợ năng đã duyệt; ghi rõ simulator hay máy thật |
| Customer Mobile — Android | US1–US3, FR-001…016/018…020/022 | US4, FR-021/023/024; vòng đời app, Back hệ thống, liên kết và lưu/đọc phiên | Build native và ma trận Android đã duyệt; phân biệt emulator với máy thật, giữ ngoại lệ hiệu năng Android thật của NFR-PERF-02 |

Yêu cầu tab/trình duyệt chỉ áp dụng Web; vòng đời app/lưu phiên native chỉ áp dụng Mobile.
Web trên điện thoại vẫn là Web. Bằng chứng Web không chứng minh iOS/Android và một hệ Mobile
không chứng minh hệ còn lại. Plan có thể chia đợt Web trước, Mobile sau; nghiệm thu từng đợt chỉ
kết luận phần có bằng chứng, không coi cả A-03 đã hoàn tất khi còn nền tảng chưa kiểm.

## Clarifications

### Session 2026-11-20

- Q: Phạm vi app ban đầu của A-03? → A: Bản v0.1.0/v0.2.0 chuẩn bị Customer Web trước; phạm vi spec này được mở rộng bằng yêu cầu mới bên dưới.
- Q: Dùng NFR/DB ở hai worktree riêng ở mức nào? → A: Kế thừa các mục đã ghi được chủ sản phẩm duyệt; phần đề xuất/mâu thuẫn phải hỏi lại.
- Q: Có tùy chọn ghi nhớ đăng nhập không? → A: Có cả phiên thường và phiên ghi nhớ.
- Q: Cách tính giới hạn thử sai ở plan có được chốt để hoàn tất chuẩn bị không? → A: Chủ sản phẩm đồng ý đếm 5 lần sai trong 15 phút gần nhất; lần thứ 5 bắt đầu chờ 15 phút, yêu cầu trong lúc chờ không kéo dài hạn; đăng nhập đúng trước ngưỡng xóa bộ đếm sai email, giới hạn IP độc lập. Cơ chế/biên kiểm thuộc plan v0.3.0, không đổi FR/SC hoặc cấp quyền code.

Chủ sản phẩm yêu cầu bổ sung nguồn mật khẩu dùng chung và cách rà cho các tính năng sau ngày 2026-11-20.
Chấp thuận cấu trúc tài liệu này chưa chọn giá trị bảo mật ở PWD-001…PWD-005 hoặc thuật toán/tham số PWD-007.

Sau phê duyệt v0.3.0, chủ sản phẩm chọn A cho nhóm mật khẩu mới, Unicode và tương thích mật khẩu cũ.
Các quyết định PWD-001…PWD-005 cho khách hàng được ghi tại nguồn chung v0.2.0; thuật toán/tham số PWD-007 vẫn thuộc plan.

Chủ sản phẩm tiếp tục yêu cầu “điều chỉnh lại cho phần spec ta vừa viết là dùng cho cả customer của web và mobile”.
Bản v0.3.0 mở phạm vi đặc tả sang cả hai kênh, giữ một nguồn nghiệp vụ và phần riêng theo nền tảng.
Đây là quyền cập nhật spec, chưa là phê duyệt toàn spec/plan hoặc quyền triển khai Mobile.

## User Scenarios & Testing *(mandatory)*

US1–US3 là hành trình chung, thực hiện trên Web và cả iOS/Android. Các ca có tab, trình duyệt,
Back/refresh dùng trên Web; ca native tương ứng được nêu ở US4. Kết quả danh tính/quyền do cùng
nguồn Identity và service nghiệp vụ quyết định, không tạo chính sách riêng cho từng app.

### User Story 1 — Đăng nhập đúng tài khoản (Priority: P1)

Khách nhập email/mật khẩu, chọn ghi nhớ hoặc không, và nhận kết quả xác thực đúng tài khoản.

**Why this priority**: Danh tính đúng là điều kiện truy cập dữ liệu riêng tư và tiếp tục mua vé.
**Independent Test**: Hai tài khoản thử có sẵn, một đã xác minh email và một chưa, dùng trên Web/iOS/Android; đối chiếu nguồn danh tính và UI từng kênh, không chỉ URL hoặc màn hình chuyển hướng.

**Acceptance Scenarios**:

1. **Given** tài khoản hợp lệ, **When** nhập đúng email/mật khẩu, **Then** có phiên đúng tài khoản và danh tính tối thiểu đúng người; không tự cấp quyền vận hành hoặc xác minh email.
2. **Given** email chưa xác minh, **When** đăng nhập đúng, **Then** vẫn đăng nhập được; yêu cầu giữ ghế/mua vé bị từ chối với hướng dẫn xác minh và không tạo hold/đơn.
3. **Given** email không tồn tại hoặc mật khẩu sai, **When** gửi form, **Then** không tạo phiên; phản hồi không phân biệt hai trường hợp, cho sửa đầu vào hoặc mở đường khôi phục được hỗ trợ.
4. **Given** email/mật khẩu trống, email sai định dạng hoặc số điện thoại, **When** gửi form, **Then** có lỗi đầu vào dễ hiểu và không có phiên thành công.
5. **Given** có điểm đến nội bộ cần đăng nhập, **When** đăng nhập thành công, **Then** quay lại đích hợp lệ sau kiểm quyền/điều kiện; không tự phát lại giữ ghế/đơn/thanh toán. Không có đích phù hợp thì về Khám phá.
6. **Given** tài khoản có mật khẩu cũ chỉ chưa đạt chính sách tạo mới và không có bằng chứng bị lộ, **When** nhập đúng theo cơ chế đã lưu, **Then** được xác minh theo PWD-005, không tự trim/cắt/đổi chuẩn hóa hoặc chặn chỉ vì tiêu chí mới.
7. **Given** có bằng chứng mật khẩu bị lộ, **When** đăng nhập, **Then** không cấp phiên mới; hướng đổi/reset khi luồng đó được hỗ trợ, không quảng cáo luồng chưa triển khai như đã hoạt động.

### User Story 2 — Duy trì và kết thúc phiên (Priority: P1)

Khách giữ phiên theo lựa chọn thường/ghi nhớ và đăng xuất phiên ở app hoặc trình duyệt đang dùng, không ngắt phiên độc lập khác.

**Why this priority**: Thiếu kết thúc phiên hoặc lộ dữ liệu người trước làm sai ranh giới tài khoản.
**Independent Test**: Hai tab Web chung phiên, một phiên Web độc lập và các phiên Mobile; cùng tài khoản ở nhiều kênh, thêm tài khoản B để thử đổi người dùng. Logout từng kênh và kiểm phiên độc lập còn đúng quyền.

**Acceptance Scenarios**:

1. **Given** phiên còn hiệu lực, **When** tải lại hoặc mở tab chung phiên, **Then** vẫn nhận diện đúng người sau kiểm phiên, không lấy hồ sơ mẫu làm căn cứ.
2. **Given** đã chọn ghi nhớ, **When** mở lại trình duyệt hoặc app trong thời hạn được duyệt, **Then** tiếp tục đúng tài khoản sau kiểm hiệu lực, không lưu mật khẩu. Phiên thường và ghi nhớ trên mỗi nền tảng phải phân biệt theo chính sách plan được duyệt; không tự coi hai loại cùng tồn tại qua mọi lần đóng/mở.
3. **Given** phiên hết hạn/bị vô hiệu/bị sửa, **When** đọc nguồn dữ liệu riêng tư online hoặc gửi thao tác được bảo vệ, **Then** từ chối, khóa trạng thái riêng tư của phiên và hướng đăng nhập lại; không suy giao dịch cũ thất bại hoặc đã được xác nhận lại. Quyền xem snapshot vé offline khi phiên hết hạn thuộc chính sách B-07 còn cần đặc tả, không tự chốt ở ca này.
4. **Given** hai tab Web chung phiên và các phiên độc lập ở Web/Mobile, **When** máy chủ xác nhận logout một phiên, **Then** phiên đó không dùng lại được; mọi tab chung phiên Web cùng hết đăng nhập, các phiên Web/Mobile độc lập vẫn hoạt động theo quyền.
5. **Given** A đã logout, **When** Back/refresh/mở lại app/đăng nhập B hoặc phản hồi A đến muộn, **Then** không lộ đơn/vé/QR/chat/quyền của A; dữ liệu nghiệp vụ A và kết quả giao dịch không bị xóa/đảo.
6. **Given** mất mạng khi logout, **When** chưa có xác nhận vô hiệu phía máy chủ, **Then** app khóa dữ liệu cục bộ và báo chưa xác nhận, cho thử lại; không báo thu hồi từ xa thành công.

### User Story 3 — Từ chối sai quyền và xử lý lỗi trung thực (Priority: P1)

Bên gọi không dùng email tự khai để đóng vai người khác; sự cố đăng nhập không tạo thành công giả.

**Why this priority**: Form thật không bảo vệ dữ liệu nếu các điểm truy cập vẫn tin danh tính khách tự gửi.
**Independent Test**: Kiểm trực tiếp các API app gọi với phiên đúng/thiếu/sai và định danh người khác, gồm giữ/hủy hold, tạo đơn, yêu cầu thanh toán, lấy vé khi các điểm đó tồn tại; đối chiếu dữ liệu, trạng thái lưu và tác dụng phụ. Mỗi kênh phải có phép thử ranh giới xác thực thật; không dùng header email hoặc mock làm bằng chứng danh tính đã xác thực.

**Acceptance Scenarios**:

1. **Given** A đăng nhập, **When** gửi email/định danh B trong dữ liệu hoặc header, **Then** không xem/sửa tài nguyên B; danh tính A do nguồn xác thực quyết định.
2. **Given** chưa đăng nhập, **When** đọc phim/rạp/suất công khai hoặc nhận webhook có bằng chứng xác thực riêng hợp lệ, **Then** không bị buộc có phiên khách chỉ vì thêm A-03.
3. **Given** nguồn danh tính lỗi hoặc kết quả chưa rõ, **When** form chờ/nhận lỗi, **Then** không chuyển sang hồ sơ mẫu hoặc báo thành công; có thử lại và đường về công khai.
4. **Given** nhiều lần thử sai, **When** chạm giới hạn đã duyệt, **Then** không tiếp tục thử không giới hạn; có cách chờ/thử lại, không tiết lộ email tồn tại.
5. **Given** form đang gửi, **When** bấm liên tục hoặc phản hồi cũ đến muộn, **Then** không mở thêm lượt từ cùng thao tác UI hoặc ghi đè danh tính mới bằng kết quả cũ.

### User Story 4 — Đăng nhập và quay lại app Mobile an toàn (Priority: P1)

Khách dùng A-03 trên iOS/Android với cùng tài khoản và quyền như Web, có thể quay lại app
hoặc điểm đến hợp lệ mà không lộ dữ liệu người trước hay nhầm trạng thái đăng nhập.

**Why this priority**: Vòng đời app, lưu phiên và liên kết mở màn hình native cần hành vi/nghiệm thu riêng.
**Independent Test**: Hai tài khoản thử trên iOS/Android; kiểm app mở mới, ra nền/quay lại, đóng/mở,
mất mạng, lỗi dữ liệu phiên và đổi tài khoản. Dữ liệu riêng tư/cache thử chỉ phục vụ kiểm ranh giới A-03.

**Acceptance Scenarios**:

1. **Given** chưa có phiên, **When** mở màn hình cần đăng nhập từ điều hướng hoặc liên kết app hợp lệ, **Then** nhập thông tin trực tiếp trên app, trở lại đích thuộc quyền sau xác thực; đích sai/vượt quyền dùng Khám phá, không tự phát lại giao dịch.
2. **Given** có bằng chứng phiên đã lưu, **When** mở mới hoặc quay lại app, **Then** đánh giá hiệu lực theo chính sách phiên; dữ liệu lưu cục bộ không tự chứng minh phiên còn hợp lệ, không tự tạo phiên mới từ mật khẩu đã lưu.
3. **Given** đã chọn ghi nhớ, **When** đọc/lưu dữ liệu phiên bị lỗi hoặc mất, **Then** không báo ghi nhớ thành công hoặc dùng dữ liệu nhạy cảm không được bảo vệ để thay thế; có thông báo và đường thử lại/đăng nhập lại trung thực.
4. **Given** chưa đăng nhập và đang mất mạng, **When** gửi thông tin đăng nhập, **Then** không tạo phiên offline hoặc báo thành công; khi có mạng khách có thể thử lại. Mất mạng trong phiên đã có không tự là logout hoặc lý do xóa vé đã lưu.
5. **Given** A đã logout hoặc chuyển sang B, **When** mở app từ liên kết cũ, Back hệ thống hoặc đọc cache/phản hồi A đến muộn, **Then** không hiện dữ liệu/QR/quyền của A; không thay đổi hiệu lực vé tại Core.
6. **Given** bàn phím mở hoặc cỡ chữ tăng và trình đọc màn hình bật, **When** nhập/sửa lỗi/gửi form trên iOS/Android, **Then** nhãn, lỗi, trạng thái chờ và hành động chính vẫn tiếp cận được, điều hướng theo quy ước hệ điều hành.

### Edge Cases

- Email có khoảng trắng ngoài/chữ hoa: chuẩn hóa định danh nhất quán với Identity. Mật khẩu có khoảng trắng/Unicode xử lý theo PWD-002 đã duyệt cho khách hàng; không tự trim, cắt hoặc biến đổi khác chính sách chung.
- Mật khẩu cũ không đạt tiêu chí mới vẫn xác minh theo cơ chế đã lưu nếu không có bằng chứng bị lộ; không tự áp NFC của policy mới lên hash cũ. Phân biệt ca mật khẩu legacy đúng/sai và ca bị lộ theo PWD-005, không cắt đầu vào để vượt giới hạn.
- Đích ngoài ứng dụng, vòng về trang login hoặc đích vượt quyền: dùng đích an toàn, không vòng chuyển hướng.
- Tài khoản chờ đóng khác tài khoản đã xóa: giữ dùng/theo dõi đơn cũ, dừng mua/đổi điểm mới theo BR-38; không triển khai quy trình xóa trong A-03.
- Tài khoản bị khóa/đã xóa: không tạo phiên được phép dùng; lỗi công khai không tiết lộ hồ sơ.
- Phân công vận hành không được biến thành quyền cao trong luồng khách hàng. Đợt này không triển khai đăng nhập vào vai trò vận hành và không miễn MFA của NFR-SEC-01 hoặc mở đường vòng tới Organizer/API quyền cao.
- Đóng trình duyệt/khôi phục tab không chứng minh máy chủ đã thu hồi phiên; hành vi mở lại hai loại phiên phải thiết kế rõ.
- Đóng tiến trình app, ra nền/quay lại, dữ liệu phiên hỏng/mất và liên kết khi app chưa chạy/đang chạy: kiểm hiệu lực và điểm đến theo cùng chính sách, không dùng kết quả cũ sau đổi tài khoản.
- Vé/QR đã lưu trên Mobile chỉ là snapshot theo B-07/ADR-0023, không là bằng chứng login hoặc phương thức đăng nhập offline. A-03 bảo vệ dữ liệu sau logout/đổi người; retention, cài lại/backup và quyền xem offline khi phiên hết hạn chưa được tự quyết trong đặc tả này.
- Không nhập hành vi phiên khách vào hồ sơ tài khoản; không tự chọn thời hạn lưu/xóa khách (BR-41/OPEN-11).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Chỉ email/mật khẩu cho đăng nhập khách; bỏ hành động/nhãn Google/Apple, điện thoại/OTP và đặt vé khách giả chức năng khỏi luồng này.
- **FR-002**: Form rỗng ban đầu, có nhãn, hỗ trợ trình quản lý mật khẩu, ẩn/hiện mật khẩu có tên truy cập; không điền sẵn dữ liệu cá nhân/mật khẩu mẫu.
- **FR-003**: Chỉ công bố thành công sau xác thực; không tự tạo tài khoản/quyền/xác minh email/số dư hội viên khi login.
- **FR-004**: Cả Web và Mobile có phiên thường và ghi nhớ; mặc định ghi nhớ tắt theo spec nền đã duyệt. Cả hai hữu hạn, có thể vô hiệu; không lưu mật khẩu. Idle/max, hành vi đóng/mở trình duyệt hoặc app, ra nền/quay lại và gia hạn từng nền tảng theo plan đúng phiên bản được dùng chia tasks, không lấy mặc định thư viện làm quyết định.
- **FR-005**: Khôi phục trạng thái từ phiên đã kiểm chứng; hiển thị danh tính tối thiểu đúng chủ, không dùng đơn/vé/điểm/hạng mẫu như dữ liệu thật của người vừa đăng nhập.
- **FR-006**: Chưa xác minh email vẫn login được; giữ ghế/mua vé kiểm xác minh và trạng thái tài khoản theo BR-02/BR-38 tại phía có thẩm quyền.
- **FR-007**: Không tin định danh/quyền client tự khai; bảo vệ ranh giới Customer Web/BFF và Customer Mobile/API theo cùng hợp đồng, kiểm chủ hold/đơn/vé tại máy chủ ngay cả khi bỏ UI. Web/BFF hiện có phải được hòa giải; Mobile chưa có code cần thiết kế đường xác thực thật, không sao chép cơ chế header mô phỏng.
- **FR-008**: Phiên khách không tự cấp quyền vận hành; không coi ba role code hiện có là ma trận quyền mục tiêu đầy đủ.
- **FR-009**: Từ chối phiên thiếu/sai/hết hạn/vô hiệu và tài khoản không còn được phép; không phục hồi từ cache hoặc gia hạn trái phép khi nguồn danh tính không đáp ứng.
- **FR-010**: Logout thông thường vô hiệu phiên hiện tại phía máy chủ, gồm các tab/định danh xoay vòng cùng phiên logic; giữ phiên độc lập khác. Không thêm logout mọi phiên.
- **FR-011**: Logout/đổi tài khoản khóa/xóa dữ liệu riêng tư phía app, kể cả cache vé/QR nếu có, chặn Back/refresh/mở lại app/liên kết/phản hồi muộn làm lộ người trước. Khi hết phiên, khóa dữ liệu online gắn phiên và yêu cầu xác thực lại; quyền xem snapshot vé offline khi hết phiên không được tự quyết ngoài chính sách B-07. Không xóa dữ liệu nghiệp vụ, hủy hold/đơn hay đảo giao dịch. Mất kết nối không tự là hết phiên hoặc lý do xóa vé đã lưu.
- **FR-012**: Sai mật khẩu/email không tồn tại dùng phản hồi không phân biệt; lỗi đầu vào/chờ/dịch vụ/giới hạn thử sai có đường khôi phục trung thực, không lộ hồ sơ/chi tiết nội bộ.
- **FR-013**: Có chống thử mật khẩu tại máy chủ và giới hạn chờ. Ngưỡng, cách tính và phạm vi khóa tạm phải được duyệt trong plan trước code; không tự thêm khóa vĩnh viễn, CAPTCHA hay MFA khách.
- **FR-014**: Không để mật khẩu/bằng chứng phiên/bí mật vào URL, chẩn đoán, AI hoặc phản hồi không cần thiết; kế thừa giới hạn NFR-PRIV-01 cho log/trace được bật trong phạm vi.
- **FR-015**: Điểm đến sau login thuộc app Customer đang dùng, đúng quyền; Web kiểm đích nội bộ, Mobile kiểm liên kết/đích native khi mở mới hoặc quay lại app. Mặc định Khám phá; không tự phát lại giao dịch hoặc đặt lại TTL, không truyền credential trong liên kết.
- **FR-016**: Có đường về khám phá công khai; link đăng ký/khôi phục/xác minh phản ánh đúng khả năng hiện có, không quảng cáo chức năng chưa chạy.
- **FR-017**: Web dùng được bằng bàn phím/trình đọc màn hình trên desktop/trình duyệt điện thoại; focus thấy được, lỗi gắn trường và trạng thái chờ giữ bố cục theo chuẩn UI/NFR-ACC-01. Phần native áp dụng FR-024, không lấy kết quả Web thay bằng chứng native.
- **FR-018**: Đọc công khai và webhook giữ cơ chế độc lập phiên khách; không thay HMAC/chữ ký vé bằng bằng chứng login.
- **FR-019**: Không gộp hành vi khách vào hồ sơ khi login; không xây tracking/ranker hoặc đặt retention ngoài BR-41.
- **FR-020**: A-03 phải tham chiếu đúng phiên bản chính sách mật khẩu chung cho giới hạn đầu vào, cách xác minh và tương thích mật khẩu cũ; không tạo bộ tiêu chí riêng trong form hoặc suy tiêu chí tạo mật khẩu mới là điều kiện login. Quyết định còn thiếu ghi ở Shared Policies & Dependencies, không tự chọn từ code mẫu/thư viện.
- **FR-021**: Mobile bảo vệ dữ liệu phiên nhạy cảm tại nơi lưu dành cho bí mật của nền tảng theo ADR-0016; kiểm lỗi lưu/đọc/mất dữ liệu và phản hồi trung thực về lựa chọn ghi nhớ. Không lưu mật khẩu hoặc đưa credential vào cache thông thường/bản chẩn đoán.
- **FR-022**: Cùng tài khoản ở Web/iOS/Android giữ cùng định danh và quy tắc nghiệp vụ; mỗi phiên độc lập có vòng đời riêng. Login/logout một kênh không tự login/logout kênh khác; không cần chép token/credential giữa các app.
- **FR-023**: Mobile xử lý mở mới, đóng/mở, ra nền/quay lại và liên kết khi app chưa chạy/đang chạy; xác định đúng tài khoản, trạng thái phiên và điểm đến. Kết quả login/đọc dữ liệu cũ không được khôi phục danh tính đã logout hoặc lấn sang tài khoản mới.
- **FR-024**: UI native trên cả iOS/Android giữ bản sắc chung, hỗ trợ VoiceOver/TalkBack, cỡ chữ hệ thống, nhãn/focus/thông báo trạng thái, vùng chạm, bàn phím và Back/điều hướng hệ thống theo chuẩn UI/NFR-ACC-01; không bắt giao diện native sao chép bố cục Web.

### Key Entities *(include if feature involves data)*

- **Tài khoản khách**: định danh ổn định, email, bằng chứng mật khẩu, trạng thái xác minh/khả năng sử dụng; Identity sở hữu. Điện thoại tùy chọn không là định danh login đợt này.
- **Phiên đăng nhập**: một tài khoản, một phiên logic, lựa chọn thường/ghi nhớ, hạn và vô hiệu; tab chung phiên khác phiên độc lập/thiết bị vật lý.
- **Trạng thái phía app**: phản ánh danh tính đã kiểm; cache/draft riêng tư giới hạn theo tài khoản và vòng đời phiên.
- **Bằng chứng quyền API**: khác phiên, không tự cấp mọi quyền; hợp đồng cấp/hạn/thu hồi phải thiết kế. Không áp 90/15 phút của vận hành cho khách.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Mọi ca đúng ở US1/US2 nhận diện đúng tài khoản; 0 lần báo login thành công khi chưa xác thực trong bộ nghiệm thu.
- **SC-002**: 0 dữ liệu/tác dụng phụ ngoài quyền trong ca thiếu/sai phiên, giả chủ và chuyển A→B qua UI/đường gọi trực tiếp; ca đúng quyền vẫn hoạt động.
- **SC-003**: Cả hai loại phiên đạt ca còn hạn/hết hạn/mở lại/gia hạn theo plan được duyệt. Logout chặn dùng lại tại điểm kiểm phiên, giữ phiên độc lập; không suy mọi token mọi service thu hồi tức thì.
- **SC-004**: Web hoàn thành login/logout/khôi phục lỗi bằng bàn phím và không còn vi phạm WCAG 2.2 AA áp dụng trong phạm vi kiểm; native hoàn thành hành trình với VoiceOver/TalkBack và cỡ chữ hệ thống theo ma trận tiêu chí nền tảng đã duyệt. Kết hợp tự động/thủ công, báo riêng từng nền tảng; không tuyên bố toàn nền tảng đạt từ phạm vi này.
- **SC-005**: 0 mật khẩu/token/bí mật hoặc dữ liệu cá nhân không cần thiết trong chẩn đoán/bằng chứng công bố của bộ ca đúng/sai/giới hạn/logout.
- **SC-006**: Hồi quy xác nhận email chưa xác minh không giữ/mua vé, công khai và webhook hợp lệ vẫn dùng được; không đổi trạng thái giao dịch ngoài yêu cầu.
- **SC-007**: Các ca biên độ dài/ký tự và mật khẩu cũ của A-03 có kết quả đúng theo chính sách mật khẩu v0.2.0; 0 khác biệt giữa quy tắc UI và máy chủ, 0 thay đổi mật khẩu/quyền ngoài hành vi đã duyệt. Ca mới và legacy dùng đúng quy tắc/phiên bản, không áp tiêu chí tạo mới để chặn legacy; có bằng chứng bị lộ thì 0 phiên mới được cấp. Cơ chế và vectors kiểm cụ thể thuộc plan, chưa là kết quả chạy.
- **SC-008**: Bộ ca chung và phần riêng được đối chiếu riêng cho Web desktop/trình duyệt điện thoại, iOS và Android; 0 lần mở dữ liệu tài khoản trước sau logout/đổi tài khoản trong các ca vòng đời/liên kết/cache. Mỗi đợt ghi nền tảng, build, môi trường thật/mô phỏng, kết quả và khoảng trống; phần chưa kiểm giữ trạng thái chưa kiểm, kể cả khi Web hoặc một hệ Mobile đã đạt.

## Shared Policies & Dependencies *(mandatory)*

Nguồn chung: [Chính sách mật khẩu v0.2.0](../../04-standards/password-policy.md), PWD-001…PWD-005 cho khách hàng đã được duyệt; cơ chế PWD-007 cho riêng A-03 được thiết kế ở plan, không biến thành thay đổi chính sách mọi use case/vai trò.
Các giá trị chỉ được diễn giải ở nguồn đó; A-03 ghi cách áp dụng và điểm chặn, không chép bộ ngưỡng.

| Policy ID | Nguồn / trạng thái | Áp dụng cho A-03 | FR / SC | Quyết định còn thiếu / người quyết định / bước bị chặn |
|---|---|---|---|---|
| PWD-001, PWD-002 | Chuẩn mật khẩu v0.2.0; đã duyệt cho khách hàng | Giới hạn đầu vào, đếm sau NFC và xác minh khoảng trắng/Unicode theo phiên bản | FR-002, FR-020; SC-001, SC-007 | Không còn thiếu hành vi sản phẩm; cơ chế/vectors và giới hạn legacy được thiết kế ở plan |
| PWD-003, PWD-004 | Chuẩn mật khẩu v0.2.0; đã duyệt nguyên tắc cho khách hàng | Không triển khai tạo/reset trong A-03; dữ liệu thử mới theo policy, legacy theo PWD-005 | FR-020; SC-007 | Dataset/giấy phép và xử lý lỗi cụ thể ở plan; chưa mở A-01/A-04/A-05 vào đợt này |
| PWD-005 | Chuẩn mật khẩu v0.2.0; đã duyệt cho khách hàng | Xác minh mật khẩu cũ theo cơ chế đã lưu, không cấp phiên mới khi có bằng chứng bị lộ | FR-003, FR-009, FR-020; SC-001, SC-007 | Hành vi đã chốt; mapping hash/version và nguồn bằng chứng bị lộ thiết kế ở plan |
| PWD-006 | Chuẩn mật khẩu v0.2.0; kế thừa ADR-0008 đã duyệt | Bảo vệ mật khẩu/credential trong các đường đúng và lỗi | FR-014; SC-005 | Không thiếu quyết định bất biến; phạm vi kiểm thiết kế ở plan |
| PWD-007 | Chuẩn mật khẩu v0.2.0; cơ chế A-03 thuộc plan được dùng chia tasks | Identity lưu/xác minh bằng chứng mật khẩu | FR-003, FR-014, FR-020; SC-001, SC-005, SC-007 | Plan §4 cụ thể hóa, T002/T011/T013 phải kiểm tương thích/chi phí sau quyền triển khai; không tự kế thừa DB draft hoặc nhận đã kiểm runtime |
| BR-01/02/36/38/41 | Mô hình sản phẩm ở nguồn liên kết; đã duyệt | Danh tính, email xác minh, quyền, chờ đóng và chuyển phiên khách | FR-003, FR-006–009, FR-019; SC-001–002, SC-006 | Không mở lại lựa chọn đã duyệt |
| NFR-SEC-01, NFR-PRIV-01, NFR-ACC-01 | Nguồn NFR và dấu kiểm phiên bản ở sources.md; chỉ kế thừa mục đã duyệt | Quyền/logout, bí mật chẩn đoán và khả năng tiếp cận Web/native | FR-007–014, FR-017, FR-021–024; SC-002–005, SC-008 | Plan §2/§4/§5.1 và quickstart §5 cụ thể hóa; T001/T045 chốt cấu hình kiểm, T008/T033 kiểm chẩn đoán; thiếu tài nguyên hoặc bằng chứng thì không nghiệm thu phần đó |
| ADR-0016, ADR-0023 | ADR đã duyệt ở nguồn liên kết; chưa là runtime | Bảo vệ phiên native, cách ly dữ liệu/QR; không mở rộng sang triển khai kho vé | FR-011, FR-021–024; SC-003–005, SC-008 | Plan thiết kế lifecycle/cách khóa hoặc xóa/cache key; các chính sách offline chưa chốt không tự suy từ lựa chọn thư viện |

**Điểm mật khẩu đã làm rõ sau phê duyệt v0.3.0:** ba câu trả lời A đã chốt PWD-001…PWD-005 cho khách hàng tại nguồn v0.2.0. Thiết kế vẫn phải cụ thể hóa PWD-007, dataset, giới hạn legacy và cơ chế xác minh; không nhận các lựa chọn kỹ thuật hoặc mặc định thư viện là đã được duyệt trước plan.

Sau khi được trình plan v0.2.0, chủ sản phẩm yêu cầu “phân thành task đi”; [plan](plan.md) ghi dấu phiên bản
được dùng để chia [tasks](tasks.md). Sau đó chủ sản phẩm yêu cầu hoàn tất review và đồng ý cách tính giới hạn thử sai.
Plan v0.3.0/tasks v0.2.0 ghi delta này; spec v0.3.2 chỉ hòa giải diễn đạt và tham chiếu, giữ FR/SC.
Các mốc trên không cấp quyền triển khai hoặc là bằng chứng runtime.

## Assumptions

- Có tài khoản thử chuẩn bị bằng cơ chế kiểm thử được duyệt; không cần triển khai A-01 để thử A-03, không tạo tài khoản thật hoặc công bố credential ở đây.
- Identity chưa có runtime: plan phải gồm phần nền tối thiểu cho xác thực/phiên thật hoặc phụ thuộc cần xong trước. Chỉ mock không đủ nghiệm thu A-03 hoàn chỉnh.
- Giao dịch hiện còn mô phỏng. Nối danh tính vào ranh giới hiện có không chứng minh Core/email/thanh toán thật đã chạy.
- Chính sách mật khẩu mới/Unicode/tương thích cũ đã được chủ sản phẩm chốt tại nguồn chung. Hai loại phiên, bridge Auth, schema, candidate thư viện và PWD-007 thuộc plan đã dùng chia tasks; cách tính thử sai được đồng ý bổ sung. Khả năng tương thích và hiệu lực thực phải kiểm sau quyền triển khai, không suy từ DB draft hoặc mặc định thư viện.
- Mobile hiện chỉ có README/PRODUCT; plan phải xác định phần nền tối thiểu cho A-03 trên hai hệ, không mở rộng sang toàn bộ app. Có thể chia Web trước/Mobile sau, nhưng giữ một spec và nghiệm thu riêng từng đợt.
- Ma trận và phạm vi tiêu chí ở quickstart §5 cụ thể hóa nguồn NFR đã duyệt; phiên bản OS/browser/thiết bị thực do người thực thi ghi và reviewer xác nhận trước chạy. Giữ ngoại lệ hiệu năng Android trên máy thật chưa kiểm chứng đã duyệt trong NFR-PERF-02; emulator không trở thành bằng chứng máy thật hoặc lý do bỏ iOS/Android.
- MFA quyền cao đã duyệt giữ hiệu lực; nếu cần cấp quyền vận hành phải làm rõ phạm vi và nghiệm thu MFA, không âm thầm thêm vào đợt Customer.
- Logout, bảo vệ điểm truy cập, điều hướng an toàn và ghi nhớ mặc định tắt thuộc spec nền v0.3.0 đã duyệt; không hồi tố chúng thành quyết định tồn tại trước mốc phê duyệt đó.
- Sau duyệt spec mới lập plan; sau duyệt plan mới tạo tasks/analyze. Chỉ sửa tài liệu trong phạm vi đã duyệt; thay sản phẩm/kiến trúc/tiêu chí nghiệm thu phải hỏi. Chưa dùng implement/converge.
