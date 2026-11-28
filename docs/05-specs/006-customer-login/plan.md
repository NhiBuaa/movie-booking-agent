# Implementation Plan: A-03 — Đăng nhập khách hàng Web và Mobile

**Branch**: Worktree Codex quản lý tại `C:/Users/NhiBuaa/.codex/worktrees/docs-customer-login/movie-booking-agent`, detached HEAD; tên feature script trả về không là nhánh Git.
**Date**: 2026-11-20
**Status**: v0.3.0 — kế thừa v0.2.0 đã được chủ sản phẩm cho dùng chia tasks; bổ sung cách tính thử sai được trực tiếp đồng ý trong vòng review ngày 2026-11-20. Các sửa khác làm rõ nguồn, điều kiện kiểm và bàn giao theo yêu cầu “thực hiện nốt các phần còn lại”. Chưa cấp quyền code/cài đặt/runtime.
**Approval reference**: Nội dung plan được trình có SHA256 `CDDDE41F7C675F0E4919FAA3BBB1B9E436AB1133DAB9950E37D6C4ABCC9FDC21` trước bổ sung ghi nhận này; code nền `2a007797ac9ce542d9747aad0f44f3e430eec581`. Nguồn là hội thoại hiện tại, chưa có commit/URL phê duyệt riêng. Yêu cầu chuyển bước không là nghiệm thu khả năng tương thích/runtime hoặc quyền triển khai.
**Input**: [Spec hiện hành v0.3.2](spec.md), nền v0.3.0 được chủ sản phẩm duyệt bằng “tôi duyệt bản spec này”, hội thoại A-03 ngày 2026-11-20. SHA256 bản nền đã trình `FE88A03201D8510F98242CBF174D39927BE5ED72AD069F923FB0026415475D87`; ba câu trả lời A sau đó chốt PWD-001…005 tại [chuẩn v0.2.0](../../04-standards/password-policy.md). v0.3.1 ghi các câu trả lời; v0.3.2 hòa giải diễn đạt sau review, giữ FR/SC. Code nền `2a007797ac9ce542d9747aad0f44f3e430eec581`; chưa có commit/URL phê duyệt riêng.

## Summary

Identity độc lập sở hữu Better Auth/PostgreSQL. Web gọi BFF cùng origin, Mobile dùng SDK Expo và Cookie vào API BFF hiện có; BFF kiểm phiên tại Identity rồi tạo AuthContext từ subject ổn định. Các adapter giao dịch BFF vẫn là mô phỏng, không trở thành Core độc lập đã triển khai. Giữ hướng JWT/JWKS cho API service độc lập của ADR-0008, chưa bật endpoint cấp token hoặc nhận đã hoàn tất tích hợp Core/Agent trong A-03.

Một bộ tài liệu chuẩn: [research](research.md), [data model](data-model.md), [HTTP contract](contracts/auth-http.md), [hướng dẫn kiểm chứng](quickstart.md). Các giá trị phiên/rate/hash là thiết kế của đúng bản plan được dùng để chia [tasks](tasks.md), khác với quyết định PWD thuộc nguồn chung. Chỉ phân tasks/rà tài liệu trong đợt này; chưa viết code, migration, cài dependency, gọi provider hoặc commit/push/merge/deploy.

## Technical Context

| Mục | Hiện trạng / đề xuất |
|---|---|
| Language/Version | Web hiện có Node `>=24.19.0 <25`, TS 6.0.3, Next 16.4.5, React 19.3.1; giữ nguyên. Identity đề xuất Node 24/TS theo toolchain hiện có, `node:http` + handler Better Auth, không thêm framework. |
| Primary Dependencies | Đề xuất Better Auth 1.7.26, Drizzle ORM 0.45.4, pg 8.23.1, `@node-rs/argon2` 2.2.2. Chưa cài/kiểm runtime. Shared boundary schema theo ADR-0014, không migrate mọi contracts ngoài A-03. |
| Native baseline | Candidate Expo 58.0.26, React 19.3.0, RN 0.88.1, Router 58.0.32, SecureStore 58.0.3, `@better-auth/expo` 1.7.26; peer modules theo bundle SDK. Phải kiểm versions/build trước code UI, giữ React Web riêng; source/main không chứng minh binary tương thích. |
| Storage | Identity PostgreSQL logic riêng và credential/migration riêng; không SQL chéo. Redis đã thuộc kiến trúc dùng counter thử sai có TTL, không là nguồn phiên. Session server chỉ PostgreSQL; cookie cache/secondary session storage tắt. Native chỉ ghi bí mật phiên khi chọn ghi nhớ, khác cache vé. |
| Testing | Giữ `node:test` hiện có; suite mới theo ADR-0021: Vitest/RTL, Playwright; native Jest/jest-expo/RNTL, Maestro; tích hợp PostgreSQL/Redis cô lập qua Testcontainers. Chưa cài hoặc chạy công cụ mới. |
| Target Platform | Web desktop/trình duyệt điện thoại, native iOS/Android; ma trận và giới hạn máy thật ở quickstart. |
| Project Type | Monorepo, hai app Customer + nền Identity tối thiểu, BFF mỏng; Organizer/toàn bộ Core ngoài phạm vi. |
| Performance Goals | Không đặt SLA login mới. Đo chi phí Argon2, độ trễ Identity và UI trong điều kiện công bố; mục tiêu/ngoại lệ NFR giữ ở nguồn. Không lấy benchmark mock hoặc emulator làm kết quả production/máy thật. |
| Constraints | Dữ liệu thử, không dùng DB/volume daily; tối đa hai nguồn Compose theo quy tắc tài khoản. Giữ bất biến Core/Agent, bí mật ngoài log/model/URL và quyền theo chủ dữ liệu. |
| Scale/Scope | 4 stories, 24 FR, 8 SC. Nền native chỉ màn hình login, trạng thái danh tính và shell Khám phá tối thiểu, không làm toàn bộ booking/catalog. |

Version trên vẫn là candidate cần qualification, không phải runtime đã kiểm. Bước qualification sau khi có quyền triển khai phải xác nhận registry/lock, Expo install-check/doctor và build; mismatch không được âm thầm sửa lên bản khác hoặc nhận kế hoạch đã chứng minh tương thích.

## Constitution Check

| Điều kiện | Trước nghiên cứu | Sau thiết kế Phase 1 |
|---|---|---|
| Core quyết định ghế/tiền/vé | Giữ | Giữ; AuthContext chỉ bảo vệ adapter mô phỏng, webhook/HMAC và chữ ký vé giữ riêng |
| Agent không giữ credential rộng | Giữ | Không có credential/flow Agent mới |
| Public contracts chung, persistence service-owned | Giữ | DTO A-03 thuộc contracts; ORM/hash/session thuộc Identity, không SQL chéo |
| Bốn app/bảy service và hai hệ Mobile | Giữ | Hai app Customer trong scope; evidence tách Web/iOS/Android, không thêm service |
| DESIGN và tương tác nền tảng | Giữ | Web chỉnh trong thiết kế hiện có; UI native mới phải có Figma được duyệt trước code UI |
| Bằng chứng trước kết luận | Giữ | Có ma trận kiểm, chưa chạy runtime hoặc kết luận phần mềm đạt |
| Quyết định mật khẩu còn thiếu | Mở ở đầu Phase 0 | Chủ sản phẩm đã chọn ba nhóm A; cơ chế còn lại được cụ thể hóa trong plan để duyệt |

Không có đề xuất ngoại lệ constitution. Đánh giá này là review thiết kế, không phải kiểm triển khai. Chủ sản phẩm đã yêu cầu chuyển sang chia tasks theo đúng bản plan được trình; quyền triển khai/cài đặt/runtime vẫn là bước cấp quyền riêng theo yêu cầu ban đầu.

## Project Structure

### Documentation (this feature)

`spec.md`, `sources.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/auth-http.md`, `quickstart.md`, `checklists/`, `tasks.md`. Tasks được sinh theo yêu cầu chuyển bước của chủ sản phẩm; chưa thực thi. Không tạo một spec Mobile riêng hoặc di chuyển folder `006-customer-login`.

### Source Code (repository root, dự kiến sau duyệt)

| Vùng | Thay đổi cần tới / giới hạn |
|---|---|
| `services/identity-service/` | Manifest/runtime tối thiểu, auth config/custom endpoints, server-only session policy/hash/limiter, schema/migration riêng, fixtures và tests. Không mở đăng ký/reset/MFA/admin API. |
| `packages/contracts/src/auth/` | Schema login/session/logout và public snapshot, lỗi; bỏ phone/otp/refresh-token assumptions cho A-03. Giữ type khác chưa được feature dùng. |
| `apps/customer-web/src/app/api/auth/`, `src/server/` | Auth facade/proxy có allowlist, guard tạo context đã xác minh; cập nhật owner các adapter bị ảnh hưởng. Không chọn client email làm fallback. |
| `apps/customer-web/src/features/auth/`, `src/lib/`, profile/header | Form thật, session state, pending logout, danh tính tối thiểu; không trình fixture điểm/đơn/vé như dữ liệu thật của người vừa login. Giữ style/tokens. |
| `apps/customer-web/tests/`, contracts tests | Cập nhật caller/fixture auth, giữ toàn bộ kiểm nghiệp vụ; thêm ca đúng/sai/switch/race/API trực tiếp. |
| `apps/customer-mobile/` | Workspace `@platform/customer-mobile` tối thiểu: Expo Router shell/login/account, auth storage adapter và API client; component native riêng, không import UI DOM/CSS. |

## 1. Luồng và ranh giới tin cậy

1. Web gửi email/password/rememberMe tới Auth facade cùng origin. BFF chỉ forward tới Identity URL cố định, không theo URL client; Identity xác thực rồi ký cookie. BFF chuyển từng Set-Cookie đúng thuộc tính, trả public snapshot đã lọc, không trả session token cho JavaScript Web.
2. Mobile login trực tiếp Identity qua tích hợp Expo. SDK giữ cookie theo mode đã chọn; custom API request dùng `getCookie()` theo upstream và `credentials: omit`, không lấy email/token từ input người dùng làm danh tính.
3. API private BFF bỏ header `x-user-email` và owner trong body khỏi căn cứ quyền. BFF forward chỉ credential Auth cần thiết tới endpoint session authoritative tại Identity, không cache user/quyền; nguồn lỗi trả 503, phiên thiếu/sai trả 401. Tạo AuthContext `{userId, sessionId, email, emailVerified, accountStatus}` tại máy chủ.
4. Adapter giữ/hủy hold, tạo đơn, payment intent, lấy vé so owner bằng `userId` bắt buộc; snapshot email chỉ là liên hệ. Một hold/tài khoản cũng nhóm theo userId. Dữ liệu legacy in-memory chỉ có email không được tự nhận chủ từ email client; fixture được tạo lại với subject đã xác thực. Không adopt dữ liệu thật cũ.
5. Account ACTIVE + emailVerified mới được giữ/mua; PENDING_CLOSURE vẫn login/đọc đơn cũ nhưng không mua mới; LOCKED/DELETED không có phiên mới. Core thật tương lai vẫn tự kiểm các điều kiện, không tin BFF như quyền cấp giao dịch.
6. API public và webhook không gọi Identity vì Auth được bổ sung; webhook giữ chứng cứ riêng. Không bắt login để khám phá.

Bridge Cookie chỉ phục vụ bề mặt hiện có; không đưa session cookie của Identity vào Agent/model hoặc tự thay hướng token cho service độc lập. Tách Core/Agent sau này phải đặc tả issuer/audience/JWKS/TTL/thu hồi theo ADR-0008; A-03 không tuyên bố đã thực hiện phần đó.

Đọc phiên và touch đều kiểm lại trạng thái tài khoản ở Identity: ACTIVE/PENDING_CLOSURE được nhận diện,
LOCKED/DELETED không được dùng phiên ở private boundary. Giữ/mua mới đòi ACTIVE + emailVerified;
đọc dữ liệu cũ và hủy hold chính chủ không được đánh đồng với mua mới. Owner luôn bắt buộc.
Quy trình đổi trạng thái tài khoản và đổi/reset mật khẩu không được triển khai thêm ở A-03.

## 2. Đề xuất vòng đời hai loại phiên

| Thuộc tính | Phiên thường | Phiên ghi nhớ |
|---|---|---|
| Idle | 30 phút không hoạt động hợp lệ | 7 ngày không hoạt động hợp lệ |
| Absolute max từ lúc login | 12 giờ | 30 ngày |
| Web persistence | Cookie session, không đặt Max-Age; browser có thể khôi phục session cookie nên server vẫn giữ trần thời gian | Cookie persistent không vượt hạn hiệu lực/absolute còn lại |
| Native persistence | Cookie chỉ ở bộ nhớ tiến trình; vẫn giữ khi app ra nền mà tiến trình còn sống, không khôi phục sau restart/OS kill | Cookie trong SecureStore, kiểm hiệu lực khi mở lại; lỗi storage không fallback kho thường |

Ghi nhớ mặc định tắt theo spec đã duyệt; thời hạn/persistence của bảng thuộc đúng bản v0.2.0 được dùng chia tasks, không lấy từ DB draft. Đánh đổi: phiên ghi nhớ tiện hơn nhưng credential bị lấy có thể tồn tại lâu hơn; người không chọn ghi nhớ có thể phải login lại khi OS đóng tiến trình app.

Identity lưu mode và absolute deadline cùng row session (additional fields server-only); `expiresAt` là min(idle deadline, absolute deadline). Tắt refresh tự động thư viện; endpoint touch có kiểm session, cập nhật có điều kiện tại DB, không upsert row đã mất/hết hạn. Không thay mode hoặc absolute deadline trong phiên. Không phát sinh chuỗi refresh-token tùy biến hoặc gọi cookie refresh là token độc lập.

App chỉ touch từ hoạt động người dùng khi foreground, tối đa một lần/5 phút; polling, get-session kiểm thuần túy và background không gia hạn. Không dùng timer client quyết định hiệu lực server. Điểm biên expire/touch/logout được kiểm bằng đồng hồ kiểm soát và cạnh tranh DB. Lỗi/mất mạng không tự là logout, không xóa snapshot vé chỉ vì connectivity.

Hoạt động ở đây là nhập liệu, thao tác điều hướng/control hoặc lệnh chính chủ do người dùng khởi phát
trong app đang foreground; login khởi tạo mốc đầu. Timer, animation, kiểm trạng thái, retry nền và lỗi nguồn
không tự thành hoạt động. App gửi touch theo giới hạn trên; máy chủ tự kiểm phiên/trạng thái/thời gian,
không tin thời điểm hoặc deadline client. Điều này cụ thể hóa “hoạt động người dùng” đã có, không kéo trần phiên.

## 3. Logout có xác nhận và cách ly dữ liệu

Endpoint logout dự án không chuyển thẳng kết quả `/sign-out` của upstream thành kết luận server đã thu hồi: tag nghiên cứu có đường nuốt lỗi xóa DB. Dùng đọc phiên authoritative trực tiếp (không helper catch lỗi thành null), lấy token hiện tại từ context server, gọi cơ chế revoke đúng phiên và kiểm lại bằng cookie gốc. Không nhận token/sessionId muốn xóa từ client và không mở revoke-all.

Chỉ trả ENDED khi không còn phiên hiệu lực theo nguồn máy chủ; trường hợp credential thiếu/sai chỉ trả NO_VALID_LOCAL_CREDENTIAL, không tuyên bố đã xóa một phiên từ xa. Lỗi đọc/xóa/kiểm hậu điều kiện trả 503 và LOGOUT_UNCONFIRMED. Không tắt freshAge toàn cục; revoke-session và fresh-session là cơ chế khác trên tag đã đọc.

Khi logout bắt đầu, app khóa UI/caches riêng tư và tăng generation để bỏ phản hồi cũ. Khi chưa xác nhận từ xa, giữ credential cho đường retry được bảo vệ, nhưng chặn phục hồi UI private; Web không xóa HttpOnly cookie trước khi server xác nhận, native giữ pending credential an toàn theo mode. Khi ENDED, xóa credential/dữ liệu phiên; tab cùng phiên cập nhật qua tín hiệu không chứa token, phiên độc lập vẫn hoạt động. Nút retry chỉ replay logout, không replay giao dịch. In-flight command đã được chấp nhận không bị hủy chỉ vì UI logout; kết quả Core vẫn tra cứu riêng.

Native logout/switch-account khóa hoặc xóa dữ liệu QR/chat/account cũ nếu có; chỉ dùng fixture cache để kiểm A-03, không dựng toàn B-07 hoặc chọn retention/reinstall/offline-expiry chưa được giao.

## 4. Đề xuất bảo vệ mật khẩu và thử sai

- PWD-001…005 đã chốt tại nguồn chung, không chép bộ độ dài/Unicode vào plan. New hash đề xuất Argon2id `m=65536 KiB, t=3, p=1`, output 32 byte, salt ngẫu nhiên 16 byte. Tag prefix `pwd2-nfc:` trước PHC string để verifier chọn đúng quy tắc; thư viện Argon2 thực hiện thuật toán, không tự viết crypto. Benchmark chi phí/Windows/Linux native module phải có trước nghiệm thu.
- Legacy verifier chỉ nhận format/cơ chế đã được nhận diện và kiểm vectors, giữ chuẩn hóa cũ. Không tự đổi hash khi login, không nâng policy âm thầm. Preflight inventory trên dữ liệu thử và trước mọi cutover thật: unknown format chặn adoption, không tự đoán/normalize để cho login. Phát hiện credential bị lộ theo evidence flag được owner Identity kiểm soát hoặc danh sách breach có nguồn rõ; danh sách “phổ biến” không tự chứng minh từng mật khẩu cũ đã bị lộ.
- Đề xuất dataset mới theo research R-08, pin commit và fingerprint khi được phép lấy artifact; kiểm giấy phép/attribution. Tập lỗi/thiếu không được cho tạo mật khẩu mới qua kiểm giả; bootstrap fixture abort. Login legacy còn dựa cơ chế/evidence theo PWD-005, không hạ thành chặn mọi mật khẩu yếu hoặc tự gọi dịch vụ ngoài. Chưa xây quy trình thu thập bằng chứng leak từ người dùng thật.
- Limiter Identity dùng Redis atomic counters theo quyết định bổ sung: đếm 5 lần sai/định danh trong 15 phút gần nhất, lần sai thứ 5 bắt đầu chờ 15 phút. Yêu cầu khi đang chờ không kéo dài hạn và không được dùng mật khẩu đúng để vượt chờ; đăng nhập đúng trước ngưỡng xóa bộ đếm sai email đó. Giới hạn 30 yêu cầu login/phút/IP độc lập, không bị xóa theo email. Cùng hành vi với email tồn tại/không tồn tại, lỗi public không phân biệt. Không khóa vĩnh viễn, CAPTCHA hoặc MFA khách.
- Key counter dùng HMAC định danh/IP với secret service, không log PII; TTL counter tối đa 1 giờ, không là log/trace. Trình duyệt/SDK không được tự thay bucket. Redis lỗi thì login mới trả 503, không bỏ limiter; phiên đang hợp lệ vẫn được kiểm qua PostgreSQL.
- Đề xuất giới hạn 2 password hash/verify đang chạy mỗi replica, không queue không giới hạn; quá tải trả 429 ngắn. Body Auth tối đa 16 KiB; mật khẩu mới theo policy, legacy theo giới hạn của format đã được inventory chấp nhận, không truncate. Đây là giới hạn tài nguyên Auth, không thay NFR giới hạn AI.

Cửa sổ sai dùng thời gian máy chủ, tại t chỉ giữ các lần sai trong `(t - 15 phút, t]`; khi
`t >= blockedUntil` thì hết chờ. Counter IP dùng cửa sổ 60 giây gần nhất để giữ trần 30 yêu cầu/phút,
không phải bucket theo email. Phép cập nhật/prune/đặt hạn phải atomic giữa replica. 400/413 và sự cố
503/giới hạn công suất không giả thành sai mật khẩu; yêu cầu login vẫn chịu trần IP ở boundary khi nguồn
counter hoạt động. T027 kiểm sát biên, reset bởi success, request đang chờ và cạnh tranh; không chỉ một đường 429.

Phạm vi PWD-005 của A-03 là ngăn cấp phiên mới khi có bằng chứng bị lộ. Không bổ sung chức năng đổi hash,
đổi/reset mật khẩu hoặc thu hồi mọi phiên vì sự kiện đổi mật khẩu; các luồng đó phải đặc tả riêng ở A-04/A-05.
Phiên hiện có vẫn chịu kiểm thời hạn/trạng thái và logout theo FR-009/010, không được coi là vô hạn hoặc bypass quyền.

## 5. Origin, CSRF và endpoint surface

Identity/Web BFF chỉ mở method/path của contract. Web unsafe methods yêu cầu Origin đúng allowlist, JSON và cookie được bảo vệ; không tắt CSRF chỉ vì có proxy. Custom native fetch gửi scheme/origin header theo cấu hình app; request có Origin Web sai vẫn bị từ chối, header native không là bằng chứng danh tính và browser preflight không được cho origin lạ. Identity/BFF kiểm credential độc lập header khai loại client. Scheme/hostname/port chỉ là cấu hình môi trường cụ thể trước chạy, không wildcard domain hoặc tin tùy ý X-Forwarded headers.

Log chỉ code/bước/thời gian, không body/password/cookie/QR; callback lỗi thư viện phải được lọc trước ghi. Không public signup/reset/change-password/revoke-all/list-sessions/admin endpoints trong A-03, dù upstream có endpoint. Các hàm nội bộ dùng tạo fixture chỉ chạy DB test được chỉ định, không tạo API tạo tài khoản công khai.

### 5.1. Chẩn đoán trong phạm vi A-03

Áp dụng NFR-PRIV-01 ở [nguồn đã đối chiếu](sources.md): danh sách trường cho phép chỉ gồm bước xử lý,
tên thành phần/công cụ, thời điểm, thời lượng và mã kết quả/lỗi đã lọc. Không ghi email, user/session ID,
địa chỉ IP thô, payload/header, mật khẩu, token, nội dung chat hoặc QR; không đẩy exception gốc chưa lọc
sang bộ ghi log. Dữ liệu benchmark tổng hợp không chứa định danh khách.

Mọi nơi lưu/xuất/bản sao chẩn đoán thuộc run phải tuân thời hạn tự xóa và quyền đọc/xuất của
NFR-PRIV-01; không tạo một chuẩn retention khác ở feature. Người triển khai liệt kê nơi nhận,
cấu hình rotation/expiry và quyền của chủ dự án, reviewer kiểm từng nơi trước bật thu thập.
Nếu chưa chứng minh cơ chế xóa/quyền thì không bật lưu/thu thập chẩn đoán chi tiết hoặc provider ngoài.
T008 đặt ranh giới cấu hình, T033/T045 đối chiếu allowlist, lỗi thư viện, mẫu hết hạn và quyền;
không coi che dashboard là dữ liệu đã xóa. Chưa dựng hệ quan sát mới chỉ để hoàn thành A-03.

## 6. Trình tự thực hiện sau khi plan được duyệt và có quyền code

1. Qualification dependencies/schema, môi trường DB/Redis thử cô lập và kiểm bộ giả định thư viện; không chạm daily resources. Nếu version/source khác kế hoạch, ghi delta và xin quyết định khi thay cơ chế/thuộc tính an toàn.
2. Chốt schema/contract fixtures, xây Identity và kiểm auth/session/logout/rate trước app. Có thể chuẩn bị test vectors và thiết kế native song song với phần này, không sửa file chung cùng lúc.
3. Nối BFF/AuthContext và stable owner; cập nhật caller/fixtures/tests giao dịch. Web UI nối sau khi contract/runtime Identity đạt kiểm tích hợp.
4. Native UI mới dựng Figma theo quy tắc repo và chủ sản phẩm duyệt trước code UI; nền API/storage và tests có thể chuẩn bị theo contract sau quyền triển khai. Web giữ thiết kế hiện có, không mở redesign.
5. Nối iOS/Android, kiểm vòng đời và tài khoản; nghiệm thu từng đợt/nền tảng. Có thể Web trước/Mobile sau; không dùng pass Web đóng phần Mobile.
6. Review độc lập, docs closeout và PR theo authority được cấp ở đợt triển khai. Không tự commit/push/merge/deploy từ việc duyệt plan.

## 7. Coverage thiết kế và cách kiểm (chưa là tasks)

| FR | Thiết kế sở hữu | SC / kiểm dự kiến |
|---|---|---|
| 001–003 | Contract sign-in, surface allowlist, form/projection | SC-001; đúng/sai/trống/không fake success |
| 004–005 | Data session, bảng lifetime/persistence, snapshot | SC-001/003; clocks, browser restore/native restart, đúng danh tính |
| 006–009 | AuthContext, account state, stable owner | SC-001/002/006; chưa verify email, pending closure, locked/deleted, thiếu/sai phiên, API trực tiếp |
| 010–011 | Authoritative logout, generation/cache isolation | SC-002/003/008; DB outage, retry, multi-tab/cross-app, A→B/race |
| 012–014 | Error contract, limiter và credential protection | SC-002/005; enumeration, Redis lỗi/quá tải, no secrets |
| 015–016 | Destination validation và availability UI | SC-001/006/008; external/unauthorized links, chức năng chưa có không fake |
| 017 | Web a11y matrix | SC-004; keyboard/focus/errors/reflow |
| 018–019 | Public/webhook bypass phiên, no profile merge | SC-006; HMAC giữ riêng, không nhập tín hiệu khách |
| 020–021 | Password policy mapping, native storage | SC-005/007/008; Unicode/legacy/known-compromised, storage failures |
| 022–024 | Session independent, native lifecycle/a11y | SC-003/004/008; hai hệ, background/kill/deep link/VoiceOver/TalkBack |

Cả 24 FR/8 SC có vùng thiết kế/cách kiểm; mapping tác vụ và hiện trạng ở tasks. speckit-analyze rà sau khi tasks hoàn chỉnh; báo cáo phân tích thuộc kết quả hội thoại, không suy có tasks là đã đủ bằng chứng triển khai. Test command/prerequisites/kết quả mong đợi ở quickstart. Chưa chạy unit/integration/browser/native hoặc đo hiệu năng.

## Complexity Tracking

Không đề xuất vi phạm constitution. Custom session lifetime, logout xác nhận và hash-policy dispatcher là phần tối thiểu cần để đáp ứng spec mà upstream defaults chưa đủ; dùng API/thư viện hiện có trước, không tạo Auth framework riêng. Nếu qualification chứng minh một lớp không cần thiết thì bỏ trong phạm vi giữ nguyên hợp đồng/tiêu chí; thay hành vi hoặc ranh giới phải trình lại.

## 8. Điều kiện bàn giao và quyền triển khai

Nguồn yêu cầu/thiết kế chuẩn là bộ cùng thư mục; [quickstart §7](quickstart.md#7-phạm-vi-bàn-giao-cho-agent-triển-khai)
chỉ thứ tự đọc, phạm vi từng đợt và cách chốt evidence. Đánh giá checklist được chủ sản phẩm giao bằng
“thực hiện nốt các phần còn lại”, khác với phê duyệt sản phẩm mới. Các kết luận trong checklist chỉ về tài liệu.

| Điều kiện còn phải thực hiện khi giao code | Người thực hiện / xác nhận | Phần phụ thuộc và tiêu chí mở |
|---|---|---|
| Quyền code/cài/chạy, worktree và tài nguyên cụ thể | Chủ sản phẩm giao; agent xác minh T001 | Trước T002 trở đi; yêu cầu review tài liệu không tự cấp quyền này |
| Tổ hợp candidate, schema/hash/storage và logout/race thực tế | Agent T002/T010/T013/T023/T035; reviewer đọc evidence | Không đạt thì dừng phần phụ thuộc, không tự đổi version/policy hoặc hạ SC |
| Browser/OS/thiết bị/công nghệ trợ năng cụ thể | Agent lập inventory theo quickstart §5; reviewer xác nhận trước chạy | T018/T026/T042/T043/T045; thiếu nền tảng thì không kết luận phần đó đạt |
| Figma native A-03 | Agent chuẩn bị T003; chủ sản phẩm duyệt node/version | Chặn T039/code UI native; không chặn đợt Web hoặc nền Identity được giao riêng |
| Dữ liệu cũ không nhận diện được hoặc migration không đủ an toàn | Agent T005/T006/T010/T013; chủ sở hữu dữ liệu quyết định cutover nếu phát sinh | Chỉ DB test được sở hữu; dừng adoption, không đoán verifier/chủ hoặc đổi dữ liệu thật |
| Log/trace lưu có thể thu thập dữ liệu | Agent T008/T033; chủ dự án kiểm quyền và reviewer kiểm cấu hình | Chưa đủ xóa/quyền/redaction thì không bật thu thập; không là quyền gọi provider |

Thứ tự thực thi là nền Identity/contracts → Web US1–US3 và kiểm chung phần Web → native US4 và kiểm riêng
iOS/Android → review cuối. US1 là mốc thử riêng, chưa công khai khi chưa có giới hạn/logout/owner.
Không có quyền commit/push/merge/deploy hoặc chạy converge tự động từ việc hoàn tất chuẩn bị.
