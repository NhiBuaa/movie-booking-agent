# Nguồn và hiện trạng đối chiếu — A-03 khách hàng Web và Mobile

Ngày đọc: 2026-11-20. Code nền: `2a007797ac9ce542d9747aad0f44f3e430eec581`.
Đây là dấu kiểm đầu vào cho [spec](spec.md), không thay trạng thái Issue/PR hoặc kiểm chứng runtime.

## Nguồn trong repository

| Nguồn | Phần dùng cho A-03 |
|---|---|
| [AGENTS](../../../AGENTS.md), `C:/Users/NhiBuaa/.agents/AGENTS.md` | Quyền, worktree riêng, thẩm quyền và kiểm chứng |
| [Constitution v2.0.1](../../../.specify/memory/constitution.md) | Danh tính/quyền, chủ dữ liệu và bằng chứng |
| [PROJECT-OVERVIEW](../../../PROJECT-OVERVIEW.md), [CONTEXT](../../../CONTEXT.md) | Phân biệt bốn app/bảy service mục tiêu với scaffold/mô phỏng |
| [Use cases](../../03-product/use-cases.md), [mô tả use case, mục A-03](../../03-product/use-case-descriptions.md), [GLOSSARY](../../../GLOSSARY.md) | A-03, BR-01/02/36/38/41, không tự xác minh email/cấp quyền |
| [Kiến trúc](../004-service-decomposition/spec.md), [quyết định](../004-service-decomposition/decisions.md), [Identity README](../../../services/identity-service/README.md) | Identity sở hữu danh tính/phiên/database riêng; service giữ quyền tài nguyên; không SQL chéo |
| [ADR-0008](../../06-decisions/0008-better-auth-with-direct-login.md) | Better Auth/form trực tiếp/session; hướng JWT bất đối xứng/JWKS cho API, chưa chốt issuer/audience/TTL/plugin/topology |
| [ADR-0002](../../06-decisions/0002-customer-organizer-app-boundaries.md), [ADR-0016](../../06-decisions/0016-expo-router-and-mobile-native-foundation.md), [ADR-0023](../../06-decisions/0023-encrypted-mmkv-for-offline-mobile-tickets.md) | Hai app Customer riêng; phiên native và dữ liệu riêng tư/QR có vòng đời theo nền tảng, không thay Identity/Core hoặc cấp quyền offline |
| [Chính sách mật khẩu v0.2.0](../../04-standards/password-policy.md) | Sau phê duyệt spec, ba câu trả lời A chốt hành vi PWD-001…PWD-005 của khách hàng; cơ chế PWD-007/phiên theo plan v0.2.0 được dùng chia tasks qua yêu cầu chuyển bước, chưa là quyền triển khai |
| [DESIGN](../../../DESIGN.md), [Customer Web PRODUCT](../../../apps/customer-web/PRODUCT.md), [Customer Mobile PRODUCT](../../../apps/customer-mobile/PRODUCT.md), [UI quality](../../04-standards/ui-quality.md), [UI routing](../../../.agents/rules/ui-skill-routing.md) | Giữ nhận diện, Web desktop/trình duyệt điện thoại, iOS/Android, tương tác/trợ năng và bằng chứng riêng từng nền tảng |
| [Feature directory](../README.md) | Một bộ tài liệu tại `docs/05-specs/006-customer-login/`; mã 005 đang dùng ở worktree DB |

## Nguồn chưa hợp nhất, chỉ đọc

Chủ sản phẩm xác nhận trong hội thoại A-03 ngày 2026-11-20: “Kế thừa các mục đã ghi được tôi duyệt; phần đề xuất/mâu thuẫn thì hỏi lại.” Không có URL hoặc SHA phê duyệt mới được tạo.

### NFR

- Worktree: `C:/Users/NhiBuaa/.codex/worktrees/docs-nfr-requirements/movie-booking-agent`.
- File: `docs/05-specs/domain-context.md`, thay đổi chưa commit trên nền `2cd10657861db1b64e0b9f33e56769d59e9916f0`.
- SHA256 khi đọc cho bản Web v0.1.0/v0.2.0: `4A66F7159061B3AE0BD69478F13DD346724B29EF4E53DF4C315F55C4BC598CA2`.
- Nguồn đã thay đổi ở worktree riêng. Khi mở rộng v0.3.0, đọc lại mục 9.10, 9.13 và 9.14.1 tại SHA256 `43A0695DD6FA1FF1A06F42F168C9EC9C1C7417295E057B963189350E6303061B`. Chỉ tái đối chiếu các phần cần cho phạm vi Mobile, không coi toàn bộ thay đổi NFR mới đã được rà hoặc được duyệt.
- NFR-SEC-01, mục 9.14/9.14.1: quyền theo chủ/rạp/vai trò; logout phiên hiện tại, tab chung phiên cùng hết đăng nhập, phiên độc lập giữ; khóa/xóa dữ liệu riêng tư phía app. Không hứa thu hồi tức thì mọi JWT.
- Mục 9.14.2–4: MFA quyền cao bằng TOTP + mã dự phòng một lần; chưa khôi phục khi mất cả hai; thay yếu tố cần xác minh lại. Kế thừa ràng buộc, chưa triển khai Organizer/MFA trong đợt Customer Web/Mobile.
- NFR-PRIV-01, mục 9.6: chẩn đoán chỉ thông tin kỹ thuật, không bí mật/dữ liệu cá nhân không cần thiết; log/trace chi tiết tối đa 7 ngày, quyền đọc/xuất chỉ chủ dự án ở mốc đầu. Danh sách trường/cấu hình/cơ chế kiểm còn cần thiết kế.
- NFR-ACC-01: WCAG 2.2 AA trên Web, tiêu chí phù hợp nền tảng/WCAG2ICT và VoiceOver/TalkBack/cỡ chữ trên native; kiểm tự động và thủ công. Ma trận áp dụng cho A-03 cần cụ thể hóa trong plan, không nhận bằng chứng Web thay native.
- NFR-PERF-01 có ngưỡng Web đã duyệt, danh sách hành trình đo bắt buộc hiện không nêu riêng login. Không tự tạo SLA độ trễ đăng nhập hoặc mở bộ đo toàn nền tảng; phạm vi áp dụng cần xác định trong plan.
- NFR-PERF-02 giữ phạm vi iOS/Android; mốc demo chấp nhận khoảng trống hiệu năng Android thật đã công bố, dùng emulator cho chức năng/chẩn đoán, bổ sung máy thật khi có. Không biến emulator thành bằng chứng máy thật hoặc tự yêu cầu mua thiết bị. Điều kiện/phạm vi đo A-03 cụ thể hóa trong plan; không chép toàn bộ bộ đo Mobile vào feature login.

### Thiết kế DB

- Worktree: `C:/Users/NhiBuaa/.codex/worktrees/docs-data-design/movie-booking-agent`, nền `2a007797ac9ce542d9747aad0f44f3e430eec581`.
- Bộ nguồn: `docs/05-specs/005-data-design/`, chưa tracked; spec ghi `draft` v1.1.0, chờ thẩm định.
- `spec.md` SHA256: `E6C2E0438C94528ACCAB2E94B4FD7A3C1247C387A36A78883C4BDEE34D80C2AB`.
- `databases/identity.md` SHA256: `DDB29C2E698E13CD2B4FB94B86F04D0A50398D0F8AA7C6BC25C7261A1BFCBC64`.
- Đối chiếu nhóm tài khoản/thông tin xác thực/phiên/role assignment và chủ dữ liệu. Trạng thái draft không chứng minh từng bảng/cột/enum/thuật toán đã được duyệt.
- Chưa kế thừa như quyết định: pin “Better Auth v1.2.9+”, Argon2id và tham số hash, challenge/TOTP/khóa tạm, KMS, schema và protocol logout. ADR-0008 chưa pin các giá trị này; NFR còn để mở nhiều tham số. Hòa giải trong plan và hỏi khi cần đổi chính sách/kiến trúc; không sửa worktree nguồn của phiên khác.
- DB ghi NFR source hash khác hash đọc hiện tại: đối chiếu lại phần liên quan lúc lập plan, không coi hai tài liệu tự động đồng bộ vì có link.

Worktree/hash giúp đọc đúng đầu vào, không là runtime hoặc quyền migration. Khi nguồn hợp nhất, cập nhật link đến chủ tài liệu thay vì sao chép.

## Hiện trạng code đã đọc

CodeGraph tại checkout chính: index complete, không pending changes/worktree mismatch; kết hợp đọc nguồn có chọn lọc. Chưa chạy app/test trong bước tài liệu này.

| Nguồn | Quan sát tại code nền | Hệ quả với plan |
|---|---|---|
| [LoginView](../../../apps/customer-web/src/features/auth/components/LoginView.tsx) | Submit timeout 500 ms rồi `/profile`; điền email/mật khẩu mẫu, remember mặc định true; Google/Apple chỉ alert, nhãn email/điện thoại, khách vào chọn ghế cố định | Chưa xác thực/phiên thật; thay mô phỏng trong phạm vi A-03, giữ nhận diện |
| [auth-state](../../../apps/customer-web/src/features/auth/model/auth-state.ts), [auth-flow test](../../../apps/customer-web/tests/auth-flow.test.ts) | Kiểm helper mật khẩu/email/điện thoại/che định danh và hồ sơ mẫu | Không chứng minh đúng/sai mật khẩu, session, quyền hoặc logout |
| [Auth DTO](../../../packages/contracts/src/auth/types.ts) | `LoginRequest` identifier/password tùy chọn/otp; session có access/refresh token; phone bắt buộc, một role | Chưa là hợp đồng A-03 theo email/mật khẩu/session; cần hòa giải theo owner |
| [apiClient](../../../apps/customer-web/src/lib/api-client.ts) | Chưa có auth client; một số lệnh đặt `x-user-email` | Nối luồng thật, bỏ định danh client tự khai ở ranh giới được bảo vệ |
| [hold](../../../apps/customer-web/src/app/api/hold/route.ts), [orders](../../../apps/customer-web/src/app/api/orders/route.ts) | POST chuyển body vào adapter; DELETE hold dùng body/header email | Kiểm danh tính thật/chủ hold/đơn và xác minh email, bảo toàn giao dịch |
| [payment intent](../../../apps/customer-web/src/app/api/payment/intent/route.ts), [ticket API](../../../apps/customer-web/src/app/api/tickets) (`[id]/route.ts`) | Caller email từ header client | Chống giả chủ tại máy chủ, không chỉ chặn UI |
| [Identity](../../../services/identity-service/README.md) | Chỉ README, chưa runtime | Plan cần phần nền tối thiểu; mock/timeout không đủ nghiệm thu login thật |
| [BFF tests](../../../apps/customer-web/tests/bff-route-handlers.test.ts) | Nhiều fixture truyền `x-user-email` | Cập nhật fixture/harness khi thay ranh giới, giữ kiểm nghiệp vụ |
| [Customer Mobile](../../../apps/customer-mobile/README.md), [PRODUCT](../../../apps/customer-mobile/PRODUCT.md) | Kiểm kê thư mục hiện chỉ có README.md/PRODUCT.md; chưa có mã app hoặc test/build native | Spec v0.3.0 là mục tiêu; plan cần nền tối thiểu và bằng chứng iOS/Android riêng, không suy runtime từ Web |

Tại mốc soạn spec chưa có bảng yêu cầu–thiết kế–task–code. Bảng hiện hành đã có ở [tasks](tasks.md),
chỉ là đối chiếu tài liệu với code nền, không là kết quả kiểm runtime.

## Bổ sung nguồn mật khẩu cho spec v0.2.0

Chủ sản phẩm hỏi về độ mạnh mật khẩu sau bản v0.1.0 và yêu cầu bổ sung cấu trúc nguồn chung.
Tự rà checklist 16/16 ở bản đó đã bỏ sót chính sách này; kết luận được sửa tại [checklist yêu cầu](checklists/requirements.md).
[Checklist mật khẩu](checklists/password-policy.md) do speckit-checklist sinh để reviewer đánh giá,
không coi việc tạo checklist là đã duyệt nội dung hoặc đã kiểm phần mềm.

## Mở rộng phạm vi spec v0.3.0

Ngày 2026-11-20 chủ sản phẩm yêu cầu điều chỉnh spec vừa viết để dùng chung Customer Web và Customer Mobile.
Đây là thay đổi phạm vi tài liệu so với v0.1.0/v0.2.0 chỉ Web; giữ thư mục `006-customer-login` và một bộ chuẩn.
Spec bổ sung phần riêng Web/iOS/Android và nghiệm thu từng kênh. Chưa phê duyệt toàn spec, chưa có plan/tasks
hoặc quyền scaffold/cài đặt/build app. Tính năng có thể triển khai theo đợt; kết quả một kênh không chứng minh kênh còn lại.

## Ghi nhận phê duyệt spec v0.3.0

Sau mốc mở rộng trên, chủ sản phẩm trả lời “tôi duyệt bản spec này” trong hội thoại A-03 ngày 2026-11-20.
Đã đối chiếu file có SHA256 `FE88A03201D8510F98242CBF174D39927BE5ED72AD069F923FB0026415475D87`
trước khi bổ sung metadata phê duyệt; code nền vẫn là `2a007797ac9ce542d9747aad0f44f3e430eec581`.
Phê duyệt cho bản đặc tả đã trình, với các phụ thuộc được ghi rõ; không bịa giá trị cho PWD-001…PWD-005
hoặc coi PWD-007 đã chọn thuật toán/tham số. Bắt đầu nghiên cứu kỹ thuật bằng [plan](plan.md) sau mốc này;
chưa cấp quyền triển khai, cài dependency, commit/push/merge/deploy hoặc tạo tasks trước duyệt plan.

## Làm rõ mật khẩu và thiết kế Phase 1

Sau mốc phê duyệt v0.3.0, chủ sản phẩm chọn A cho cả ba nhóm câu hỏi: mật khẩu mới, Unicode và
tương thích mật khẩu cũ; nội dung đầy đủ thuộc chuẩn mật khẩu v0.2.0. Spec v0.3.1 tích hợp các câu
trả lời đó, giữ hash/phê duyệt bản nền, không coi nội dung mới là đã tồn tại ở bản nền.
Plan v0.2.0 cùng research/data-model/contracts/quickstart đã được lập để duyệt, chưa có tasks hoặc
kết quả runtime. Phiên/rate/hash/version/topology trong plan là đề xuất mới, không bị biến thành
quyết định chỉ vì spec nền đã được duyệt.

## Chuyển sang chia tasks

Sau khi được trình plan v0.2.0, chủ sản phẩm yêu cầu “phân thành task đi”. Bản plan được trình có
SHA256 `CDDDE41F7C675F0E4919FAA3BBB1B9E436AB1133DAB9950E37D6C4ABCC9FDC21` trước bổ sung metadata
chuyển bước. [Tasks v0.1.0](tasks.md) gồm 48 đầu việc tương lai, phụ thuộc/cách kiểm và bảng sai lệch với
code nền; đây là quyền tạo tasks/analyze, không phải quyền code, migration, cài đặt hoặc chạy runtime.
Đã sửa diễn đạt chuyển trạng thái touch ở data model để bao gồm PENDING_CLOSURE đúng spec/plan,
không thay quyền mua. Không sửa các worktree nguồn NFR/DB; phê duyệt tham chiếu hội thoại hiện tại,
chưa có commit/URL riêng. Kết quả analyze được báo trong hội thoại, không là nghiệm thu phần mềm.

## Rà checklist trước bàn giao

Chủ sản phẩm yêu cầu “thực hiện nốt các phần còn lại” sau khi đã được báo còn 40 mục toàn diện và
12 mục mật khẩu chưa đánh giá. Đây là quyền agent hỗ trợ đánh giá/ghi kết quả chất lượng tài liệu,
không phải phê duyệt sản phẩm mới hoặc quyền implement. Kết quả từng mục và nguồn thuộc hai checklist,
không biến checkbox thành nghiệm thu code.

Trong vòng rà này, chủ sản phẩm trực tiếp chọn “Đồng ý cách tính này (khuyến nghị)” cho cửa sổ sai
15 phút gần nhất, lần sai thứ 5 bắt đầu chờ 15 phút, không kéo dài hạn bởi yêu cầu đang chờ và success
trước ngưỡng reset counter email; trần IP độc lập. Plan v0.3.0 §4 là nguồn cơ chế; tasks v0.2.0 cập nhật
T027/T028, không đổi 24 FR/8 SC hoặc thêm use case. Spec v0.3.2 hòa giải trạng thái/ngôn từ, giữ mốc duyệt cũ.

NFR worktree nguồn tiếp tục thay đổi, SHA256 đọc lại `05B9E8E6D73C263FC17CE91C2385D1C8F674749064962D4873C2E6453FFD8E75`.
Chỉ đối chiếu phần cần cho checklist: §9.6 (trường kỹ thuật/retention/quyền), §9.9.2 (ma trận browser
được duyệt), §9.10/§9.10.2/§9.10.3 (Mobile/mở app/ngoại lệ Android/mạng/số mẫu), §9.13 (trợ năng)
và §9.14.1 (logout). Chỉ kế thừa mục có nguồn ghi đã duyệt; phần đề xuất/OS/tooling vẫn là điều kiện
phải chốt trước chạy. Không nhận mọi thay đổi NFR mới là đã được rà, không sửa worktree nguồn NFR/DB.

Các hòa giải trong phạm vi: ma trận và nhóm tiêu chí tại quickstart §5, allowlist/chặn thu thập chẩn đoán
khi chưa đủ điều kiện ở plan §5.1, migration lỗi chỉ trên DB test ở data model và các task tương ứng.
Thứ tự/phạm vi bàn giao cùng quyền ở quickstart §7 và plan §8; bằng chứng runtime/triển khai vẫn chưa có.
