# Hướng dẫn kiểm chứng — A-03 (đề xuất, chưa chạy)

Áp dụng theo [plan v0.3.0](plan.md) và [tasks v0.2.0](tasks.md) sau khi có quyền triển khai riêng. Chủ sản phẩm đã yêu cầu chuyển sang chia tasks và hoàn tất review tài liệu; hiện chỉ có tài liệu;
Identity/native runtime, scripts mới, DB fixture và cấu hình dưới đây chưa được tạo hoặc thực thi.

## 1. Điều kiện và ranh giới môi trường

- Xác nhận đúng worktree/nhánh/SHA triển khai, bản policy/spec/plan và quyền cài/chạy trước thao tác. Không dùng tài nguyên daily, `.env` hoặc DB/volume của phiên khác.
- Chuẩn bị PostgreSQL/Redis test cô lập theo run, port/secret riêng; testcontainers hoặc hai nguồn Compose vận hành tối đa của repo, không tạo Compose thứ ba kể cả fixture. Không reset/delete volume không thuộc run.
- Không bật email/LLM/payment thật, đăng ký công khai, OAuth/MFA/admin API hoặc billing. Chỉ tạo tài khoản thử trong DB test; seed phải từ chối URL DB không được định danh test.
- Node 24 theo manifest, npm workspace/lock hiện có; chỉ cài dependencies liệt kê sau authority được cấp. Qualification Better Auth/schema native modules trên Windows/Linux trước code nghiệp vụ; thông số Argon2 trong plan cần đo.
- Candidate Expo SDK/Router/SecureStore theo plan; `expo install --check`, doctor và build từ tooling đã được cài có quyền. Không dùng `npx` để tự tải gói còn thiếu, không coi Expo Go là release/native compatibility.
- Biến cấu hình cần có sau triển khai: Identity base/public URL và DB URL, Better Auth secret, Redis URL, secret HMAC counter, Web origin, native scheme/API URL và test mode. Tên cuối do config thuộc service sở hữu; không tạo client public env chứa secret.

## 2. Qualification thư viện và dữ liệu

1. Đối chiếu version/peer/lock trong từng workspace; native React và Web React không bị một override chung làm lệch SDK. Lưu package tree theo SHA.
2. Kiểm generated schema từ cấu hình pin: credential accountId, field input:false, session deadlines atomic, unique/FK/index; không chạy migration DB thật từ DDL draft.
3. Kiểm native storage cho STANDARD/REMEMBERED: SDK không tự persist session thường, lỗi SecureStore không fallback; dữ liệu UI cache không xác thực thay server.
4. Gây lỗi DB ở session read/revoke/postcondition; kiểm lỗi khác null/ENDED. Đây là bài bắt buộc để không dùng `/sign-out` response như bằng chứng thu hồi.
5. Kiểm bộ vectors NFC/code point/legacy/hash mới, account compromised, danh sách mật khẩu pin/version/license. Dataset lỗi không được tạo fixture “đạt” giả; chưa có data adoption thật.
6. Đo Argon2 m/t/p, RAM/CPU/thời gian ở mức concurrency đề xuất; không tự hạ cost để pass. Native binary hoặc schema không tương thích thì ghi lỗi và chốt delta trước tiếp tục.
7. Kiểm migration thất bại trên DB test theo data model: transaction rollback hoặc dừng/khôi phục fixture sở hữu; không phục hồi production bằng seed. Legacy profile thiếu manifest/giới hạn phải dừng adoption, không đoán định dạng.

## 3. Commands kiểm kỹ thuật

Các lệnh đã có ở root, chỉ chạy sau implementation/authority phù hợp:

```powershell
npm test
npm run test:all
npm run typecheck
npm run build
```

Scripts dự kiến thuộc workspaces mới, **chưa tồn tại hiện tại**, phải được tasks tạo trước khi dùng:

```powershell
npm test --workspace=@platform/identity-service
npm test --workspace=@platform/customer-mobile
```

Suite mới Web theo ADR-0021 có config riêng, giữ discovery/coverage node:test cũ. Không nhận test pass khi runner
không discover test mới. Build/typecheck không thay runtime. Các thao tác build native/Figma/thiết bị chỉ thực hiện
khi được cấp quyền và có prerequisite; không mời hệ thống trả phí hoặc cloud account từ plan này.

## 4. Ma trận nghiệm thu hành trình

| Nhóm / reference | Ca và kết quả mong đợi |
|---|---|
| US1 / SC-001,007 | Verified/unverified đúng email/password login được, cùng subject các kênh; sai/trống/phone không tạo phiên. Legacy đúng nhưng yếu theo policy mới vẫn xác minh theo version cũ; known-compromised không có phiên mới. |
| US1 / SC-006 | Unverified không hold/mua, không side effect. PENDING_CLOSURE login/đọc đơn cũ nhưng không mua mới. LOCKED/DELETED không login; không lộ trạng thái qua lỗi public. |
| US2 / SC-003 | Mỗi mode tại trước/đúng/sau idle và absolute; activity có điều kiện, polling/background không kéo hạn; expired không được touch làm sống lại. Phiên độc lập còn đúng quyền sau logout nơi khác. |
| US2 / SC-002,008 | Hai tab chung phiên, Web và Mobile riêng, logout/retry/đổi A→B; Back/refresh/reopen/deep link và response muộn không hiện người cũ. Gây race login/logout/touch, cả Set-Cookie cũ, không chỉ React state. |
| US2 / SC-003,005 | DB outage lúc read/delete/postcondition: 503 LOGOUT_UNCONFIRMED, UI khóa và credential retry an toàn; ENDED chỉ khi nguồn xác nhận. Không log cookie/password. |
| US3 / SC-002,006 | Gọi thẳng hold/release/orders/payment intent/tickets, thay body/header email/userId và ID tài nguyên khác; 0 dữ liệu/side effect trái quyền. Missing owner không bypass. |
| US3 / SC-005 | Brute-force nhiều replica theo email/IP, Redis down, hash busy, body quá lớn; codes/Retry-After đúng, không làm lỗi tài khoản tồn tại khác tài khoản không tồn tại. |
| US3 / FR-013 | Cách tính đã duyệt: trước/đúng/sau biên 15 phút, lần sai thứ 5, success trước ngưỡng, request trong lúc chờ và hết chờ; reset email không reset trần IP. Đối chiếu clock/counter, không giả lỗi nguồn thành sai mật khẩu. |
| US3 / SC-006 | Public catalog và webhook có HMAC đúng vẫn hoạt động khi Identity lỗi/không cookie; HMAC sai vẫn bị từ chối, login không thay xác minh tiền/vé. Không gộp hành vi khách vào account. |
| US4 / SC-004,008 | iOS/Android cold open/resume/OS kill, remembered/standard, storage mất/hỏng, offline login, unsafe link, account switch; không fake success, không dùng QR/cache làm credential. |
| UI / SC-004 | Web keyboard/focus/errors/reflow; native VoiceOver/TalkBack, chữ hệ thống, keyboard/Back/vùng chạm; cả chờ/lỗi/hết phiên, không chỉ màn hình mặc định. |
| Chẩn đoán / SC-005 | Đối chiếu allowlist dữ liệu tại nơi tạo/gửi/nhận. Nếu bật lưu chi tiết: có cấu hình tự xóa theo NFR-PRIV-01, mẫu qua hạn và quyền đọc/xuất chỉ chủ dự án; chưa đủ thì không bật thu thập. |

Đối chiếu HTTP, dữ liệu Identity/adapter trước-sau và side effects. Không lấy URL/profile fixture, lời chat hoặc
HTTP 200 làm căn cứ thành công; ghi mechanism thật/mock theo từng thành phần.

## 5. Thiết bị và bằng chứng

Web dùng ma trận trình duyệt trong NFR nguồn, ghi browser/version/viewport/mạng và SHA. Native ghi build/OS/device,
phân biệt simulator/emulator với máy thật. Giữ ngoại lệ hiệu năng Android thật chưa kiểm chứng đã được duyệt;
không mở rộng ngoại lệ thành miễn test chức năng hoặc bỏ iOS. Thiếu nền tảng thì ghi chưa kiểm, không pass cả A-03.

UI native mới cần Figma được duyệt trước code UI theo repo; lưu node/version đã duyệt và đối chiếu render khi có app.
Không có thiết kế/render ở đợt tài liệu này. Nếu môi trường không hỗ trợ build iOS tại máy Windows, ghi cần môi trường
được chủ sản phẩm cho phép; không tự mua EAS/Apple account hoặc giả simulator trên Web là iOS.

### 5.1. Ma trận áp dụng cho A-03

Ma trận Web kế thừa phạm vi đã duyệt tại NFR §9.9.2, được pin ở [sources](sources.md); không tạo cam kết
hỗ trợ mọi browser/OS. Trước chạy, agent ghi chính xác version browser/OS, viewport/zoom, công nghệ trợ năng,
thiết bị, kiểu build, nguồn thật/mô phỏng và SHA; reviewer xác nhận inventory. Thiếu môi trường thì giữ phần
đó chưa kiểm, không tự loại khỏi ma trận hoặc đổi tiêu chí. T001/T045 sở hữu việc chốt inventory.

| Nhóm bắt buộc theo phạm vi được giao | Nội dung A-03 cần evidence | Nguồn/giới hạn |
|---|---|---|
| Chrome trên Windows, desktop | US1–US3, cả mode, tab/restore/race; bàn phím và trình đọc màn hình được cấp trong inventory | NFR §9.9.2; cấu hình thực được ghi trước chạy, không là bằng chứng browser khác |
| Chrome trên Windows, mô phỏng điện thoại | US1–US3 và form/reflow/touch ở cấu hình mô phỏng được công bố | NFR §9.9.2; không đại diện Safari, Android hoặc app native thật |
| Edge trên Windows | Tác vụ chính US1–US3, lỗi/khôi phục và tương thích session/cookie | NFR §9.9.2; riêng phiên bản và evidence, không gộp Chrome |
| Safari trên iPhone 11 Pro Max thật sẵn có | US1–US3, form/bàn phím/restore và tương tác thực; VoiceOver theo tiêu chí áp dụng | NFR §9.9.2; thiếu chỉ số hiệu năng được báo theo ngoại lệ nguồn, không miễn chức năng |
| Customer Mobile iOS | US1–US4; VoiceOver, cỡ chữ hệ thống, lifecycle/storage/link; private boundary dùng API test client, không thêm UI booking | Build/môi trường iOS được cấp; dùng máy sẵn có khi được phép, simulator báo riêng; không lấy Web thay native |
| Customer Mobile Android | US1–US4; TalkBack, cỡ chữ, Back/lifecycle/storage/link; private boundary tương tự iOS | Tiếp tục kiểm emulator được phép; giữ ngoại lệ hiệu năng máy thật NFR-PERF-02, không đổi thành bằng chứng thiết bị thật |

### 5.2. Nhóm tiêu chí trợ năng và kết quả cần ghi

Áp dụng WCAG 2.2 A/AA cho phần Web trong hành trình A-03 và tiêu chí phù hợp nền tảng/WCAG2ICT cho
native theo NFR-ACC-01. Các nhóm dưới giúp lập bảng kết quả, không thay toàn bộ tập tiêu chí áp dụng.
Reviewer chỉ chấp nhận không áp dụng khi có lý do theo nội dung/hành trình, không vì công cụ chưa đo được.
Giá trị tương phản/vùng chạm lấy từ [chuẩn UI](../../04-standards/ui-quality.md), không hạ theo chuẩn khác.

| Nhóm | Phạm vi yêu cầu đã có | Kết quả phải phân biệt khi kiểm |
|---|---|---|
| Nhãn và ngữ nghĩa | Email/password, ẩn/hiện, ghi nhớ, submit/logout/retry, đường về công khai | Tên/vai trò/trạng thái truy cập được; autofill/paste không bị vô hiệu trái FR-002 |
| Bàn phím và focus | Web theo chuẩn UI; native theo tương tác hệ và công nghệ trợ năng | Thứ tự hợp lý, focus thấy được/không bị che hoặc kẹt; vị trí sau lỗi/đổi màn hình rõ |
| Lỗi và chờ | Đúng/sai đầu vào, dịch vụ lỗi, giới hạn thử sai, hết phiên và logout chưa xác nhận | Lỗi gắn trường, thông báo trạng thái nhận biết được; không chỉ đổi màu hoặc chỉ có biểu tượng |
| Cỡ chữ và bố cục | Web zoom/reflow; native chữ theo hệ, safe area và bàn phím mở | Nội dung/hành động chính không mất; control đạt vùng chạm và tương phản theo chuẩn UI |
| Tương tác nền tảng | iOS VoiceOver, Android TalkBack/Back; trạng thái chạm và giảm chuyển động khi có | Hoàn tất tác vụ đúng quyền qua phương thức áp dụng, không bắt native sao chép Web |

Mỗi nhóm phải có cả trạng thái ban đầu/chờ/lỗi/khôi phục liên quan; ghi tự động hay thủ công và tiêu chí
cụ thể của tập chuẩn được áp dụng. SC-004 yêu cầu không còn vi phạm áp dụng/tác vụ bị chặn trong phạm vi
được đánh giá; thiếu công cụ/phiên bản/evidence giữ chưa kiểm. Đây là thiết kế phép kiểm, chưa là kết quả.

### 5.3. Phạm vi hiệu năng kế thừa

Không đặt SLA mới cho request đăng nhập. Chi phí hash và độ trễ login được báo riêng, không dùng kết quả
mock hoặc một request để đóng NFR toàn app. Các hành trình Web bắt buộc/ngưỡng/hồ sơ đã duyệt vẫn thuộc
NFR-PERF-01 ở nguồn pin; A-03 không tự mở toàn bộ bài catalog/chat/booking vào task login.

Native mở app thuộc NFR-PERF-02: nếu shell A-03 là điểm mở app của đợt native, T045 áp tiêu chí mở
Customer Mobile và mẫu/mạng ở NFR §9.10/§9.10.2/§9.10.3, không miễn vì chưa có booking/catalog.
Agent ghi điểm bắt đầu/kết thúc, build, iOS/thiết bị và hồ sơ mạng trước đo; cấu hình chưa chốt hoặc
không có môi trường hợp lệ thì giữ chưa kiểm/chặn kết luận hiệu năng. Giữ ngoại lệ Android thật và
phân biệt release/native với dev/simulator/emulator theo nguồn. Không áp ngưỡng soát vé Organizer vào A-03.

## 6. Kết luận và ranh giới phát hành

Review độc lập tại đúng SHA, toàn bộ tests hiện hành Web đạt; kèm bản policy/plan, tool versions, run IDs,
nguồn dữ liệu và ca chưa kiểm. Evidence/log sanitized, không commit credential. Chỉ kết luận phạm vi có chứng cứ,
phân biệt implemented/tested/runtime/accepted/merged/deployed. Duyệt plan không tự cấp quyền cài, commit/push,
merge hoặc deploy. Tasks/analyze được mở theo yêu cầu “phân thành task đi” sau khi trình plan; implement/converge chưa được chạy.

## 7. Phạm vi bàn giao cho agent triển khai

Đọc [spec](spec.md) → [plan](plan.md) và thiết kế liên quan → [tasks](tasks.md), cùng kết quả
[review toàn diện](checklists/feature-quality.md) và [review mật khẩu](checklists/password-policy.md).
Phiên bản bàn giao: spec v0.3.2, plan v0.3.0, tasks v0.2.0; chuẩn mật khẩu chung giữ v0.2.0.
Phê duyệt gắn hội thoại/hash bản gốc tại plan, không có commit/URL phê duyệt mới được bịa ra.

- Đợt Web: nền Identity/contracts và US1–US3, T044/T045 phần Web; US1 riêng chỉ là mốc thử cô lập.
- Đợt Mobile: nền native theo quyền được giao, T003 duyệt Figma trước T039, rồi US4/kiểm iOS và Android riêng.
- Mỗi task chỉ được đánh dấu hoàn thành ở bước triển khai sau evidence đúng SHA; checklist đánh giá yêu cầu có vòng đời khác.
- T001 là điểm nhận quyền code/cài/chạy và chốt worktree/tài nguyên; review tài liệu không tự mở quyền đó.
- Kiểm tương thích/race, dữ liệu cũ, thu thập chẩn đoán và thiếu môi trường tuân bảng điều kiện plan §8; không hạ FR/SC để vượt lỗi.
- Các task không cấp quyền dùng provider trả phí, mở demo công khai, commit/push/merge/deploy. Chưa chạy implement/converge ở bước chuẩn bị này.

Bằng chứng triển khai/review và tiến độ thuộc Issue/PR được giao; không sao chép log hoặc tạo một tracker
trong bộ tài liệu. Phần chưa kiểm/ngoài đợt giữ rõ trong báo cáo, không nhận cả A-03 hoàn tất từ kết quả một kênh.
