# Tasks: A-03 — Đăng nhập khách hàng Web và Mobile

**Version**: v0.2.0 — 2026-11-20, 48 task chưa thực thi; bổ sung quyết định thử sai và hòa giải tài liệu sau review checklist.
**Input**: [spec v0.3.2](spec.md), [plan v0.3.0](plan.md), [research](research.md), [data model](data-model.md), [HTTP contract](contracts/auth-http.md), [quickstart](quickstart.md), [password policy v0.2.0](../../04-standards/password-policy.md).
**Authority**: Chủ sản phẩm yêu cầu “phân thành task đi” sau khi được trình plan, sau đó yêu cầu hoàn tất review và đồng ý cách tính thử sai ghi tại plan §4. Bản plan gốc dùng chia việc có SHA256 `CDDDE41F7C675F0E4919FAA3BBB1B9E436AB1133DAB9950E37D6C4ABCC9FDC21` trước bổ sung ghi nhận chuyển bước. Nền code `2a007797ac9ce542d9747aad0f44f3e430eec581`; tham chiếu phê duyệt là hội thoại hiện tại, chưa có commit/URL riêng. Các task vẫn chưa được cấp quyền thực thi.

## Giới hạn quyền và cách đọc

Chỉ việc soạn tasks/phân tích tài liệu được thực hiện ở đợt này. Mọi checkbox dưới đây là công việc tương lai,
không cấp quyền implement, migration, cài package, dựng runtime, sử dụng tài nguyên hoặc commit/push/merge/deploy.
T001 là điều kiện trước bất kỳ thao tác triển khai nào; không đánh dấu nó đạt từ yêu cầu chia tasks.

- Đường dẫn code tương đối với root repository; file chưa có là đích dự kiến, không phải bằng chứng đã tồn tại.
- `[P]` chỉ cơ hội làm song song **sau các phụ thuộc đã nêu**, ở file/tài nguyên tách biệt; không tự dispatch agent.
- Tests được yêu cầu bởi spec/constitution; viết ca chứng minh thiếu hành vi trước implementation, sau đó đọc kết quả/trạng thái/tác dụng phụ. Giữ suite cũ; chưa chạy tests ở bước tài liệu này.
- Owner thực thi theo vùng: Identity, contracts, Web/BFF, native. Một owner điều phối file chung và lockfile; reviewer độc lập kiểm đúng SHA.
- Không đổi scope, tiêu chí nghiệm thu, policy, provider hoặc ranh giới dữ liệu để vượt blocker; dừng nhánh phụ thuộc và hỏi. Routine implementation trong bản thiết kế được giao mới được tự xử lý.

## Phase 1 — Setup và điều kiện triển khai

**Mục tiêu**: Chỉ mở các việc code sau bundle quyền cụ thể, qualification và thiết kế native đúng gate.

- [ ] T001 Đọc kết quả checklist và xác nhận quyền code/cài/chạy, worktree/nhánh triển khai, phiên bản tài liệu, DB/Redis/thiết bị thử và người review tại phạm vi bàn giao của Issue hoặc hội thoại; đối chiếu `docs/05-specs/006-customer-login/quickstart.md` §5/§7 và plan §8. Kiểm: có bundle quyền và tài nguyên sở hữu rõ, chưa đủ thì chỉ đọc; checklist đã được rà không tự mở quyền code/cài/chạy. [FR-001, SC-008]
- [ ] T002 Qualification và khai báo workspace Identity tối thiểu tại `services/identity-service/package.json`, `services/identity-service/tsconfig.json`, root `package.json`/`package-lock.json`: version theo plan, Node 24, không thêm framework. Sau T001; kiểm package metadata/peer và module Argon2 Windows/Linux theo quyền đã cấp, không âm thầm đổi version/cost khi lỗi. [FR-003, FR-014, SC-001, SC-005]
- [ ] T003 [P] Chuẩn bị thiết kế Figma native A-03 và ghi link node/version được chủ sản phẩm duyệt ở `docs/05-specs/006-customer-login/quickstart.md` mục thiết kế native; đọc `apps/customer-mobile/PRODUCT.md`/`DESIGN.md`. Sau T001, độc lập T002; kiểm có login/account/error/loading và hai mode trên iOS/Android, chưa duyệt thì chặn T039, không tự viết UI native. [FR-024, SC-004, SC-008]
- [ ] T004 Thiết lập harness test mới tại `services/identity-service/vitest.config.ts`, `packages/contracts/vitest.config.ts`, `apps/customer-web/vitest.config.ts`, `apps/customer-web/playwright.config.ts` và scripts workspace liên quan; sau T002. Kiểm discovery bằng ca thất bại có chủ đích trong harness rồi sửa fixture, giữ `node:test` cũ và không nhận runner 0 test là đạt. [SC-001, SC-002, SC-008]

## Phase 2 — Nền dùng chung (chặn các user story)

**Mục tiêu**: Schema/contract/bảo vệ biên và môi trường kiểm có owner rõ; chưa cung cấp flow login chỉ bằng mock.

- [ ] T005 Lập user/account schema và migration service-owned tại `services/identity-service/src/db/schema.ts`, `services/identity-service/drizzle/`; sau T004. Giữ nguyên ràng buộc data model: User.id “PK, immutable”; email “Unique”, “chỉ trim ngoài/lowercase email, không áp cho mật khẩu”; emailVerified “Boolean, false không cấm login”; name “không là bằng chứng owner”; status `ACTIVE`, `PENDING_CLOSURE`, `LOCKED`, `DELETED`, “server-owned”; credential account `providerId=credential`, `accountId=user.id`, “FK nội bộ tới User”; password “Text có version-tag và hash; không plaintext”, `pwd2-nfc:` + PHC Argon2id; passwordCompromisedAt “Nullable timestamp/evidence flag server-owned”. ID UUID v4 không tiền tố dài 36. Kiểm generated-schema/unique/FK/mapping và migration trên DB test sở hữu, không copy DB draft vào Core. [FR-003, FR-006, FR-008, FR-020, SC-001, SC-007]
- [ ] T006 Bổ sung Session schema trong `services/identity-service/src/db/schema.ts` và migration kế tiếp; sau T005, cùng owner file. Ràng buộc: userId “FK nội bộ”, token “unique”, timestamps “Thời gian UTC”, `expiresAt = min(idleDeadline, absoluteDeadline)`; mode “server-only `STANDARD` hoặc `REMEMBERED`, immutable trong phiên”; absoluteExpiresAt “cố định từ lúc tạo phiên”; lastActivityAt “không từ client timestamp”; idleExpiresAt “không vượt absolute deadline”. Kiểm insert có đủ metadata cùng row, cache/secondary store tắt; không thêm revoked_at rồi giả định thư viện tự kiểm. [FR-004, FR-009, FR-010, SC-003]
- [ ] T007 [P] Khai báo boundary schemas Zod 4/types suy ra và public snapshot tại `packages/contracts/src/auth/schemas.ts`, `packages/contracts/src/auth/index.ts`, `packages/contracts/tests/auth-contracts.test.ts`; sau T004, có thể song song T005/T006. Theo contract: email/password/rememberMe bắt buộc, không nhận userId/role/deadline; snapshot chỉ chính chủ, không password/hash/token Web; mode enum và timestamp ISO UTC. Kiểm payload sai/unknown field, JSON Schema export theo ADR-0014, raw SDK khác BFF envelope; không tự xóa AuthSessionDto cũ khi còn caller hoặc mở Auth credential cho Python Agent. [FR-001, FR-003, FR-005, FR-014, FR-020, SC-001, SC-005]
- [ ] T008 Tạo runtime/config và bảo vệ transport tối thiểu tại `services/identity-service/src/server.ts`, `src/config.ts`, `src/http-boundary.ts`; sau T006/T007. Kiểm URL/secret thiếu fail closed, JSON/body cap 16 KiB, exact origins/native scheme, CSRF kể cả custom routes, fixed route allowlist, TLS/local mode và logger allowlist theo plan §5.1; chẩn đoán lưu/xuất phải có cấu hình tự xóa/quyền theo NFR-PRIV-01, chưa đủ thì không bật thu thập chi tiết. Không public signup/reset/admin/revoke-all hoặc dựng provider quan sát mới. [FR-001, FR-008, FR-012, FR-014, SC-002, SC-005]
- [ ] T009 Chuẩn bị fixture definitions/clock và manifest profile legacy tại `services/identity-service/tests/fixtures/accounts.ts`, `tests/fixtures/legacy-profiles.json`, `tests/helpers/clock.ts`; sau T005/T007. Bao phủ hai ACTIVE verified/unverified, PENDING_CLOSURE, LOCKED/DELETED, compromised; mỗi legacy profile ghi format/version/normalization/input cap/nguồn vectors theo data model. Kiểm không có secret thật/unknown-format adoption; chưa nhận diện được thì dừng profile đó. Seed chỉ được dùng sau hash T013, không bypass policy bằng fixture. [FR-003, FR-006, FR-020, SC-001, SC-007]
- [ ] T010 Tạo integration environment/schema checks tại `services/identity-service/tests/helpers/environment.ts`, `tests/schema.integration.test.ts`; sau T006/T008/T009. Kiểm PostgreSQL/Redis run-owned, seeds từ chối DB không định danh test, cô lập reset/cleanup, không dùng volume daily hoặc Compose thứ ba; gây lỗi migration để kiểm rollback/dừng/khôi phục fixture theo data model và không cấp phiên khi schema thiếu. Ghi qualification theo `quickstart.md`; chưa đủ môi trường thì không nhận integration đã đạt. [SC-001, SC-002, SC-008]

**Checkpoint**: T002/T004…T010 đạt theo kết quả thực trước các story; T003 có gate riêng trước native UI.

## Phase 3 — US1: Đăng nhập đúng tài khoản (P1)

**Mục tiêu**: Identity thật và Web login đúng/sai, chưa xác minh email vẫn login, không trình dữ liệu mẫu như thật.
**Kiểm độc lập**: Identity+Web với hai tài khoản thử; native dùng lại cùng contract tại US4. Đây chưa là nghiệm thu cả A-03.

- [ ] T011 [P] [US1] Viết vectors/ca hash và legacy tại `services/identity-service/tests/password-policy.test.ts`; sau T010. Kiểm policy v0.2.0: code point/NFC, whitespace/case, biên 14/15/128/129 cho mật khẩu mới, đúng verifier legacy và compromised; chứng minh ca thiếu implementation trước T013. [FR-002, FR-020, SC-007]
- [ ] T012 [P] [US1] Viết login/session/projection integration tests tại `services/identity-service/tests/login.integration.test.ts`; sau T010, song song T011. Kiểm account states, đúng/sai/rỗng/phone, không nâng emailVerified/quyền, session metadata/mode, error không phân biệt tồn tại; kiểm trạng thái DB chứ không chỉ 200. [FR-001, FR-003, FR-005, FR-006, FR-008, SC-001, SC-007]
- [ ] T013 [US1] Hiện thực policy dispatcher/hash/fixture seeding tại `services/identity-service/src/password-policy.ts`, `src/password-hash.ts`, `tests/helpers/seed.ts`; sau T011. Argon2id m=65536 KiB/t=3/p=1, salt 16 byte/output 32, prefix đã thiết kế; pin dataset/giấy phép/checksum ở `services/identity-service/test-data/passwords/README.md` và dữ liệu được cấp quyền lấy. Dataset lỗi abort tạo mới, không gửi mật khẩu ngoài; legacy dùng format đã kiểm, không tự rehash. Chạy T011 và benchmark cost, không âm thầm giảm. [FR-003, FR-014, FR-020, SC-005, SC-007]
- [ ] T014 [US1] Mount Better Auth sign-in/get-session với public/native adapters tại `services/identity-service/src/auth.ts`, `src/session-policy.ts`; sau T012/T013. Tạo mode/deadlines atomic, tắt auto refresh/cache, reject LOCKED/DELETED và credential compromised khi cấp mới; get-session đọc trạng thái tài khoản hiện hành, không cấp quyền vận hành. Authoritative read lỗi không thành null. Kiểm T012 với DB thật, snapshot đúng contract và cookie theo mode. [FR-003–006, FR-008–009, FR-022, SC-001, SC-003]
- [ ] T015 [US1] Nối Auth facade Web tại `apps/customer-web/src/app/api/auth/[...path]/route.ts`, `src/server/identity-client.ts`, `src/lib/auth-client.ts`; sau T014/T007. Kiểm fixed URL/method allowlist, raw SDK↔envelope, từng Set-Cookie, không token Web trong body; lỗi 503 không fake login. Viết/đạt ca tại `apps/customer-web/tests/auth-facade.test.ts`. [FR-003, FR-005, FR-012, FR-014, SC-001, SC-005]
- [ ] T016 [US1] Đổi form mô phỏng tại `apps/customer-web/src/features/auth/components/LoginView.tsx`, model/helpers liên quan trong `src/features/auth/model/`; sau T015. Form rỗng email/password, remember mặc định tắt, bỏ social/phone/guest booking giả; hỗ trợ autofill/paste/show-password và loading/error, đích an toàn/default Khám phá. Kiểm tests form tại `apps/customer-web/tests/login-view.test.tsx`, không chuyển trang vì timeout. [FR-001–003, FR-012, FR-015–017, SC-001, SC-004]
- [ ] T017 [US1] Nối danh tính tối thiểu tại `apps/customer-web/src/features/profile/components/ProfileView.tsx`, `src/components/layout/Header.tsx` và caller route bảo vệ hiện có; sau T016. Chặn dữ liệu riêng khi chưa có phiên, không gán fixture điểm/hạng/đơn/vé thành dữ liệu tài khoản vừa login; các link register/reset/verify phản ánh khả năng thực. Kiểm A/B và profile chưa có dữ liệu qua `apps/customer-web/tests/auth-profile.test.tsx`. [FR-005, FR-009, FR-016, SC-001, SC-002]
- [ ] T018 [US1] Kiểm login Web E2E tại `apps/customer-web/e2e/customer-login.spec.ts`; sau T017. Đúng/sai, email chưa xác minh, legacy, compromised, đích sai và bàn phím/trình đọc màn hình; so snapshot Identity, ảnh render desktop/trình duyệt điện thoại và không log mật khẩu. Ghi evidence đúng SHA ở PR, chưa kết luận checkout an toàn khi US3 chưa xong. [SC-001, SC-004, SC-005, SC-007]

## Phase 4 — US2: Duy trì và kết thúc phiên (P1)

**Mục tiêu**: Hạn phiên server quyết định, logout có hậu điều kiện và ngăn dữ liệu người trước.
**Kiểm độc lập**: Hai tab chung phiên, một Web độc lập, hai tài khoản; native/cross-app kiểm bổ sung T041/T043.

- [ ] T019 [US2] Viết biên clock/race/touch/logout tại `services/identity-service/tests/session.integration.test.ts`; sau T014. Trước T020/T021 kiểm idle/max cả mode, ACTIVE/PENDING_CLOSURE duy trì phiên nhưng khác quyền mua; đổi account sang LOCKED/DELETED phải bị từ chối ở read/touch/private boundary dù cookie chưa hết hạn. Kiểm logout/touch đồng thời, expired không sống lại, DB read/delete/postcondition lỗi không thành ENDED, retry không hủy phiên khác. [FR-004, FR-006, FR-009–011, FR-022, SC-003]
- [ ] T020 [US2] Hiện thực lifetime/touch tại `services/identity-service/src/session-policy.ts`, `src/routes/session-touch.ts`; sau T019. Theo plan: STANDARD idle30m/max12h, REMEMBERED idle7d/max30d; mode/absolute immutable, UPDATE có điều kiện không upsert, read/background không gia hạn. Kiểm activity foreground tối đa1/5 phút, dữ liệu clock server và T019. [FR-004, FR-009, SC-003]
- [ ] T021 [US2] Hiện thực logout-current tại `services/identity-service/src/routes/logout-current.ts`; sau T020. Target chỉ từ context/cookie gốc, revoke một phiên và kiểm hậu điều kiện, phân ENDED/NO_VALID_LOCAL_CREDENTIAL/503 LOGOUT_UNCONFIRMED; không nhận client target, không dựa sign-out 200 hoặc helper nuốt lỗi. Đạt T019 với lỗi từng chặng và retry. [FR-010–012, SC-002, SC-003]
- [ ] T022 [P] [US2] Viết session state tests Web tại `apps/customer-web/tests/auth-session-state.test.ts`; sau T019 và T015, có thể song song T020/T021. Kiểm pending logout, delayed A response, reload, tab signal không token và false-outage; cần fail khi chỉ đổi React state mà chưa xử lý cookie race. [FR-005, FR-009–011, SC-002, SC-003]
- [ ] T023 [US2] Hiện thực Web session store/provider tại `apps/customer-web/src/features/auth/model/session-state.ts`, `src/features/auth/components/AuthSessionProvider.tsx`; sau T021/T022. Serialize Auth mutation liên tab, generation/discard response, activity touch foreground, pending flag an toàn và no restore private UI; xác minh lại authoritative khi mismatch. Kiểm late Set-Cookie qua browser matrix, không coi Web Locks thiếu là pass. [FR-004–005, FR-009–011, SC-002, SC-003, SC-008]
- [ ] T024 [US2] Nối logout/touch façade và nút profile/header tại `apps/customer-web/src/app/api/auth/[...path]/route.ts`, `src/lib/auth-client.ts`, `src/features/profile/components/ProfileView.tsx`; sau T023. Không xóa HttpOnly cookie trước xác nhận, retry chỉ logout; profile private bị khóa ngay, phiên độc lập giữ, không replay giao dịch. Kiểm tests T022 và façade. [FR-010–012, FR-022, SC-002, SC-003]
- [ ] T025 [US2] Cách ly/clear private cache ở caller bị ảnh hưởng tại `apps/customer-web/src/features/auth/model/session-state.ts`, `src/features/profile/`, `src/features/tickets/`, `src/features/agent/`; sau T024. Chỉ chỉnh cache riêng tư có thật, không dựng persistent layer mới; Back/refresh/A→B và in-flight response không lộ tài khoản cũ, không hủy hold/đơn vì logout. Kiểm regression ranh giới. [FR-011, FR-019, SC-002, SC-006]
- [ ] T026 [US2] Kiểm multi-tab/session failure E2E tại `apps/customer-web/e2e/customer-session.spec.ts`; sau T025. Gây lỗi DB/network có kiểm soát, biên deadline và race login B/logout A/touch, native session test client độc lập vẫn đúng quyền; báo browser/credential còn hiệu lực và side effects, không chỉ màn hình đã logout. [SC-002, SC-003, SC-005, SC-008]

## Phase 5 — US3: Từ chối sai quyền và xử lý lỗi (P1)

**Mục tiêu**: Login thật phải bảo vệ cả API hiện có; giữ public/webhook độc lập.
**Kiểm độc lập**: Gọi thẳng private endpoints và đối chiếu owner/data/side effects, có ca dương tính đúng quyền.

- [ ] T027 [P] [US3] Viết limiter/throttle tests tại `services/identity-service/tests/login-rate-limit.integration.test.ts`; sau T014, chạy song song các việc Web US2 vì không chung file. Kiểm 5 sai trong cửa sổ trượt15m→chờ15m từ lần5, đúng mật khẩu trước ngưỡng xóa counter email, request đang chờ không kéo dài hạn; biên window/cooldown và cạnh tranh theo plan §4. IP30/phút độc lập, HMAC key không PII, Redis outage503, cap2 hash/replica và body16KiB; lỗi đầu vào/dịch vụ/công suất không giả thành sai mật khẩu, không đổi bucket theo client spoof. [FR-012–014, SC-002, SC-005]
- [ ] T028 [US3] Hiện thực counters/cap tại `services/identity-service/src/login-limiter.ts` và hook trong `src/auth.ts`/boundary; sau T027, không sửa `src/auth.ts` đồng thời T014. Window/cooldown/reset theo plan §4 và contract, atomic Redis TTL≤1h/secret chung replica, IP từ proxy trust đã cấu hình, không tin X-Forwarded tùy ý; lỗi limiter không bypass login. Chạy T027 gồm sát biên, cooldown không gia hạn và reset email không reset IP; không khóa vĩnh viễn. [FR-012–014, SC-005]
- [ ] T029 [US3] Viết ca thiếu/sai phiên, giả chủ/email, unverified/pending closure, missing owner tại `apps/customer-web/tests/bff-route-handlers.test.ts`, `tests/auth-context.test.ts`; sau T014/T015. Giữ các ca nghiệp vụ cũ và kiểm public/webhook khi Identity lỗi. Tests mới phải chỉ ra hành vi tự khai hiện tại trước T030/T031. [FR-006–009, FR-018, SC-002, SC-006]
- [ ] T030 [US3] Tạo authoritative AuthContext và route guards tại `apps/customer-web/src/server/auth-context.ts`, routes hold/orders/payment-intent/tickets hiện có; sau T029. Không cache user/quyền, thiếu/sai401 khác outage503, reject native/web origin sai, enforce ACTIVE/emailVerified cho giữ/mua mới; đọc cũ/hủy hold chính chủ theo plan §1, không đánh đồng với mua mới. Không x-user-email/body owner fallback. Kiểm T029, không áp guard khách vào webhook/public. [FR-006–009, FR-014, FR-018, SC-002, SC-006]
- [ ] T031 [US3] Đổi owner ổn định tại `apps/customer-web/src/server/hold-adapter.ts`, `src/server/order-adapter.ts`, DTO boundary liên quan trong `packages/contracts/src/`; sau T030. Hold “ownerUserId bắt buộc”, một hold/tài khoản theo owner; order owner từ hold/context, ticket/payment/release phải so subject, thiếu order/owner fail closed. Snapshot email không là khóa quyền; không tự adopt legacy chỉ có email. Đạt ca đúng/sai/data side effects T029. [FR-006–009, SC-002, SC-006]
- [ ] T032 [US3] Cập nhật mọi caller/fixture của API đổi hợp đồng tại `apps/customer-web/src/lib/api-client.ts`, `apps/customer-web/tests/`, component caller được rg/CodeGraph xác định; sau T031. Bỏ tham số email/header làm identity, fixture AuthContext không tắt guard cho test; giữ HMAC/signature, max-seat/Sweetbox/hold/đơn logic hiện hành. Kiểm toàn bộ tests hiện có. [FR-007, FR-014, FR-018, SC-002, SC-006]
- [ ] T033 [US3] Kiểm chống enumeration, secret leakage, cache/origin tại `services/identity-service/tests/security.integration.test.ts`, `apps/customer-web/tests/auth-security.test.ts`; sau T028/T032. Bao phủ header/query override, cùng lỗi công khai cho invalid/locked/compromised, logger allowlist/redaction cả exception, no-store và không gộp guest profile; nếu bật lưu chẩn đoán, kiểm từng nơi nhận/cấu hình tự xóa/mẫu hết hạn/quyền đọc-xuất theo plan §5.1. Chưa đủ thì không bật thu thập chi tiết; các hành động bị từ chối không có tác dụng phụ. [FR-008, FR-012–014, FR-018–019, SC-002, SC-005, SC-006]
- [ ] T034 [US3] Kiểm private boundary từ hai kênh test clients tại `apps/customer-web/e2e/customer-auth-boundary.spec.ts`; sau T033/T026. Kiểm IDOR đúng/sai/missing owner, active/pending/unverified và webhook HMAC đúng/sai khi Identity down; lưu trạng thái adapter/Identity. Web chỉ đủ release candidate khi US1–US3 và T044/T045 phần Web đạt, không kết luận Mobile. [SC-001, SC-002, SC-005, SC-006]

## Phase 6 — US4: Vòng đời Customer Mobile (P1)

**Mục tiêu**: Cùng danh tính/hợp đồng, tương tác native và lưu phiên đúng mode trên iOS/Android.
**Kiểm độc lập**: Build app thật theo nguồn chứng cứ công bố, hai tài khoản và Identity runtime đã kiểm; không lấy browser emulation thay native.

- [ ] T035 [US4] Qualification nền native tại `apps/customer-mobile/package.json`, `app.config.ts`, `jest.config.js`, `tests/setup.ts` và config Expo/TS; sau T010/T007. Khai báo scripts test/type/build và harness Jest/jest-expo/RNTL theo ADR-0021, kiểm discovery trước T036. Cập nhật root lockfile tuần tự với T002/T004 bởi cùng owner; phần file riêng có thể chuẩn bị song song Web story. Pin candidate SDK58/RN/React/router/storage theo plan, không global override React Web. Kiểm install-check/doctor và native toolchain theo quyền; route/layout/screen và kiểm build shell thuộc T039 sau duyệt Figma, mismatch chặn UI, không tự đổi SDK. [FR-021–024, SC-008]
- [ ] T036 [US4] Viết storage/lifecycle tests tại `apps/customer-mobile/tests/auth-storage.test.ts`, `tests/auth-state.test.ts`; sau T035. Kiểm STANDARD memory-only qua OS kill, REMEMBERED SecureStore, lỗi read/write, pending logout, A response muộn và offline login không fake success; không xóa vé chỉ vì mất mạng. [FR-004, FR-009–011, FR-021–023, SC-003, SC-005, SC-008]
- [ ] T037 [US4] Hiện thực Auth storage adapter tại `apps/customer-mobile/src/features/auth/storage.ts`, `state.ts`; sau T036/T021. Tách mode/kho và privacy pending marker, không tự dùng SDK cookie persistence cho STANDARD; nhớ lỗi không fallback kho thường, không lưu mật khẩu. Kiểm T036, cached user không là bằng chứng session, private data khóa khi đổi người. [FR-004–005, FR-011, FR-021–023, SC-003, SC-005, SC-008]
- [ ] T038 [US4] Nối SDK và custom API client tại `apps/customer-mobile/src/features/auth/client.ts`, `src/lib/api-client.ts`; sau T037/T030. Raw SDK→snapshot, Cookie getCookie/credentials omit cho BFF, origin không là identity, logout-current có xác nhận, foreground touch theo policy và server error khác unauthenticated. Kiểm contract fixtures/Identity thật, không token qua deep link. [FR-003, FR-007, FR-012, FR-014, FR-021–023, SC-001, SC-002, SC-005]
- [ ] T039 [US4] Dựng login/account/shell Khám phá tối thiểu tại `apps/customer-mobile/app/_layout.tsx`, `app/auth/login.tsx`, `app/account.tsx`, `app/index.tsx`, `src/features/auth/components/`; chỉ sau T003 được người dùng duyệt Figma và T038. Native theme giữ token, keyboard/Back/loading/error/autofill/remember default off, không bịa dữ liệu danh mục hoặc dựng toàn booking. Kiểm component tests tại `apps/customer-mobile/tests/login-view.test.tsx` và build shell iOS/Android. [FR-001–002, FR-005, FR-016, FR-024, SC-001, SC-004, SC-008]
- [ ] T040 [US4] Hiện thực safe destination/route lifecycle tại `apps/customer-mobile/src/features/auth/navigation.ts`, `app/_layout.tsx`; sau T039. Cold link/resume/Back/unauthorized/external link dùng đúng tài khoản và Khám phá fallback, không replay giao dịch/TTL. Kiểm mất/malformed credential và late response sau switch bằng `apps/customer-mobile/tests/auth-navigation.test.tsx`. [FR-009, FR-011, FR-015, FR-023, SC-002, SC-008]
- [ ] T041 [US4] Kiểm cross-app logout/cache tại `apps/customer-mobile/tests/session.integration.test.ts` và fixtures riêng; sau T040/T034. Hai tài khoản, Web và native cùng user nhưng phiên độc lập; pending retry, app restart, delayed storage/response/cache QR thử không lộ A ở B. Không dựng kho B-07 hoặc quyết định offline-expiry/retention; test data không thay trạng thái Core. [FR-010–011, FR-021–023, SC-002, SC-003, SC-008]
- [ ] T042 [US4] Kiểm trợ năng native tại `apps/customer-mobile/tests/accessibility.test.tsx`, flow `apps/customer-mobile/.maestro/customer-login.yaml`; sau T039/T040. Kèm kiểm thủ công VoiceOver/TalkBack/cỡ chữ/focus/keyboard/Back/target sizes theo PRODUCT/chuẩn UI, ghi iOS/Android/version/device; không suy test component đủ chứng nhận native. [FR-024, SC-004, SC-008]
- [ ] T043 [US4] Chạy hành trình native tại `apps/customer-mobile/.maestro/customer-session.yaml` và `apps/customer-mobile/.maestro/customer-login.yaml`; sau T041/T042. Kiểm phần login/session/lỗi US1–US3 trên từng hệ cùng US4, cold/resume/kill/mất mạng/lỗi SecureStore/unsafe link; quyền booking kiểm bằng API test client cùng credential, không dựng thêm UI booking. Đối chiếu backend snapshot/side effects; chỉ công bố nền tảng có evidence, giữ ngoại lệ hiệu năng Android thật, không đổi emulator thành máy thật. [SC-001, SC-002, SC-003, SC-004, SC-005, SC-006, SC-007, SC-008]

## Phase 7 — Kiểm chung và bàn giao

**Mục tiêu**: Đủ bằng chứng đúng SHA cho phần được giao; tasks hoàn thành không là quyền merge/deploy.

- [ ] T044 Chạy regression/tests/type/build theo `docs/05-specs/006-customer-login/quickstart.md`, scripts root `package.json` và từng workspace; sau T034/T043, có thể chạy phần Web sớm sau T034 để nghiệm thu từng đợt. Kiểm mọi suite cũ/mới discover, cookie/security contract thật, không nhận pass Web thay native. [SC-001–008]
- [ ] T045 Đo/evaluate dữ liệu và UI theo `docs/05-specs/006-customer-login/quickstart.md` §5.1–§5.3, `apps/customer-web/e2e/`, `apps/customer-mobile/.maestro/`; sau các story liên quan. Reviewer xác nhận inventory browser/OS/viewport/công nghệ trợ năng trước chạy; ghi Argon2 RAM/CPU/latency/concurrency, ảnh render, kết quả từng nhóm tiêu chí và phạm vi mở app native theo NFR nguồn. Không tự đặt SLA mới hoặc giảm cost/policy để pass; tách mock/emulator/máy thật và ghi nơi nhận/quyền/xóa nếu lưu chẩn đoán. [FR-017, FR-024, SC-004, SC-005, SC-008]
- [ ] T046 Review độc lập tại đúng SHA đối với `services/identity-service/`, `packages/contracts/src/auth/`, `apps/customer-web/`, `apps/customer-mobile/` và evidence PR; sau T044/T045. Rà auth boundaries/session/CSRF/legacy/logout/race/owner, đóng finding chỉ bằng evidence; blocker chưa xử lý thì chưa bàn giao implementation hoàn tất. [SC-001–008]
- [ ] T047 Cập nhật sự thật triển khai và hướng dẫn tại `docs/05-specs/006-customer-login/sources.md`, `quickstart.md`, `services/identity-service/README.md`, `apps/customer-mobile/README.md`; sau T046. Trạng thái transient/test evidence ở Issue/PR; durable findings về policy/owner chỉ sửa đúng phạm vi, không copy log hoặc nhận merged/deployed từ test đạt. [SC-008]
- [ ] T048 Đối chiếu handoff với `docs/05-specs/006-customer-login/spec.md`, `plan.md`, `tasks.md` và kiểm `check-kit.ps1`; sau T047. Báo phiên bản/SHA từng artifact, kết quả từng nền tảng, phần chưa kiểm/giới hạn quyền, liên kết PR nếu được cho phép tạo. Không tự commit/push/merge/deploy hoặc chạy converge trước bước hậu triển khai được giao. [SC-001–008]

## Dependencies & Execution Order

T001 → T002 → T004; T003 là nhánh thiết kế độc lập sau T001.
T004 → {T005 → T006, T007}; {T006,T007} → T008; {T005,T007} → T009;
{T006,T008,T009} → T010. US1 → US2 → phần tích hợp cuối US3 → native nghiệm thu → closeout.

Trong US1: {T011,T012} → T013/T014 theo dependencies ghi trong từng task → T015 → T016 → T017 → T018.
Trong US2: T019 → T020 → T021; T022 song song backend sau T019/T015; {T021,T022} → T023 → T024 → T025 → T026.
Trong US3: T027 → T028 độc lập Web US2; T029 → T030 → T031 → T032;
{T028,T032} → T033; {T026,T033} → T034.
Trong US4: T035 → T036 → T037 → T038; {T003 được duyệt,T038} → T039 → T040;
{T034,T040} → T041, {T039,T040} → T042; {T041,T042} → T043.
Closeout: {T034,T043} → T044; T045 sau story cần kiểm → {T044,T045} → T046 → T047 → T048.

Thứ tự số là thứ tự đọc, không thay dependency DAG. Story tests độc lập về kết quả mong đợi,
nhưng dùng chung nền Identity/contract nên không tuyên bố mọi story có thể code song song từ đầu.
Tasks sửa cùng file không chạy đồng thời, kể cả thuộc story khác. Lockfile/environment cùng owner quản lý.

### Ví dụ song song sau gate

| Nhánh | Cặp việc độc lập | Điều kiện / giới hạn |
|---|---|---|
| Setup | T002 qualification backend và T003 thiết kế native | Sau T001; không dùng chung file/root lock |
| Foundation | T005/T006 schema và T007 contracts | Sau T004; schema service khác public schema, kết nối ở T008 |
| US1 | T011 vectors và T012 integration cases | Sau T010, hai test files riêng |
| US2/US3 | T020/T021 server session, T022 Web tests, T027 limiter tests | Sau các prereq tương ứng; không sửa auth config/lock cùng lúc |
| Web/native | T023…T026 Web state và T035…T037 native foundation | Contract/Identity baseline đã có; integration T038/T041 đợi backend cần thiết |
| US4 | T041 cross-app integration và T042 a11y | Khi T039/T040 đã ổn; chạy môi trường/thiết bị tách, không dùng chung DB reset |

## Implementation Strategy

Mốc kiểm nhỏ đầu là US1 Identity + Web (T001/T002/T004…T018), chỉ dùng môi trường thử riêng.
Mốc Web reviewable gồm US1–US3 và T044/T045 phần Web; chưa đủ Mobile hoặc quyền public demo.
Native có thể được chuẩn bị song song theo gate, sau đó US4/T043 nghiệm thu riêng iOS/Android.
US1 riêng chưa là phiên an toàn hoàn chỉnh để công khai khi logout/owner/rate chưa xong.

Handoff cho agent code chỉ khi findings chặn của analyze đã được giải quyết hoặc có quyết định rõ
phần bị chặn, bundle T001 được cấp và Figma gate áp dụng ở nhánh native. Mọi routine task trong scope
phải giữ tiêu chí trên; đổi kiến trúc/policy/acceptance/provider/authority cần trình người dùng.

## Ánh xạ yêu cầu – thiết kế – task – hiện trạng

Hiện trạng đối chiếu ở code nền nêu đầu file, đọc ngày 2026-11-20; chỉ đọc nguồn, chưa chạy runtime.
Không có CodeGraph index ở worktree tài liệu này; đối chiếu bằng đọc/rg có chọn lọc, không coi graph thiếu là thiếu caller.

| FR | Thiết kế | Tasks | Hiện trạng / sai lệch cần xử lý |
|---|---|---|---|
| FR-001, FR-002, FR-003 | Policy/contract sign-in, public projection | T007–008, T011–016, T018, T038–039 | `LoginView.tsx:22` timeout rồi profile; form mẫu/phone/social, chưa có Identity runtime |
| FR-004, FR-005 | Data Session/mode/deadline, snapshot | T006, T012, T014, T017, T019–026, T036–039 | remember=true mặc định; chưa có persistence/session server; profile còn fixture |
| FR-006, FR-007, FR-008, FR-009 | AuthContext, account policy, stable owner | T005, T008, T012, T014, T029–034, T038–041 | hold owner lấy userEmail/userId request; payment/tickets nhận caller email; chưa có guard phiên thật |
| FR-010, FR-011 | Logout hậu điều kiện, isolation/generation | T006, T019–026, T036–037, T041, T043 | Chưa có endpoint/logout state thật; profile nút logout không chứng minh thu hồi |
| FR-012, FR-013, FR-014 | Error/limiter/secret boundary | T007–008, T012–016, T021, T027–028, T033, T036–038 | Chưa có auth error/rate/logging path; headers tự khai chưa là credential |
| FR-015, FR-016, FR-017 | Safe destination, honest availability, Web a11y | T016–018, T023, T039–040, T044–045 | Login chuyển cố định `/profile`, guest link chọn suất mẫu; chưa có kết quả UI/a11y thật |
| FR-018, FR-019 | Public/webhook riêng, no profile merge | T025, T029–034, T043–044 | Webhook đã có chứng cứ HMAC theo nguồn; phải bảo toàn, không suy Auth đã tích hợp; guest personalization chưa triển khai |
| FR-020, FR-021 | Policy version/hash, native secret storage | T005, T011–014, T035–038, T041–043 | Helpers/test độ mạnh chỉ mẫu; native hiện chỉ README/PRODUCT |
| FR-022, FR-023, FR-024 | Phiên độc lập, native lifecycle/interaction | T003, T014, T019–026, T035–043, T045 | Chưa có native app/test/build; cần Figma và evidence hai hệ, không suy từ Web |

| SC | Task kiểm bằng chứng (không chỉ task implementation) |
|---|---|
| SC-001 | T012, T018, T034, T043, T044 |
| SC-002 | T019, T022, T026, T029, T033–034, T041, T043–044 |
| SC-003 | T019, T026, T036, T041, T043–044 |
| SC-004 | T018, T042–045 |
| SC-005 | T027, T033, T036, T043–046 |
| SC-006 | T029, T032–034, T043–044 |
| SC-007 | T011–012, T018, T043–044 |
| SC-008 | T010, T018, T026, T035, T041–048 |

Coverage ở đây là liên kết nhiệm vụ, không là test đạt. Analysis sau sinh tasks đọc đủ ba artifact
và đối chiếu phạm vi này; không đóng chênh lệch triển khai bằng việc đã có một task.
