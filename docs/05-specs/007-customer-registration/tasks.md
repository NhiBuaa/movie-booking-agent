# Kế hoạch Phân rã Công việc (Tasks) — Tính năng A-01: Đăng ký Tài khoản Khách hàng (Customer Registration)

Tài liệu này định nghĩa danh sách các công việc kỹ thuật tuần tự và độc lập để triển khai tính năng **A-01 — Đăng ký tài khoản khách hàng** trên cả hai nền tảng Customer Web và Customer Mobile theo đúng đặc tả [spec.md](./spec.md) v0.3.2, mô hình dữ liệu [data-model.md](./data-model.md), kế hoạch triển khai [plan.md](./plan.md), báo cáo nghiên cứu kỹ thuật [research.md](./research.md), các hợp đồng giao diện tại [contracts/](./contracts/), và các kịch bản kiểm thử trong [quickstart.md](./quickstart.md).

---

## Bảng Truy vết Yêu cầu & Kịch bản Kiểm chứng (Traceability Matrix)

| Mã Yêu cầu / Kịch bản | Nội dung Tóm lược Nghiệp vụ & Kỹ thuật | Task IDs Phụ trách Triển khai & Kiểm chứng |
|---|---|---|
| **FR-001** | Chỉ hỗ trợ đăng ký bằng Email và Mật khẩu; loại bỏ toàn bộ nút MXH giả và đặt vé khách giả lập | `T003`, `T031`, `T051` |
| **FR-002** | Form đăng ký rỗng, không điền sẵn: Họ tên, Email, Mật khẩu, Xác nhận mật khẩu, SĐT (tùy chọn BR-02), Checkbox điều khoản | `T003`, `T031`, `T051` |
| **FR-003** | Mật khẩu mới tuân thủ nghiêm ngặt chính sách PWD-001…PWD-004 (15–128 ký tự NFC, khoảng trắng, blocklist server) | `T003`, `T004`, `T044`, `T045`, `T046` |
| **FR-004** | Chỉ báo hướng dẫn mật khẩu rõ ràng trên UI; loại bỏ hoàn toàn thanh đo độ mạnh 4 loại ký tự cũ | `T047`, `T051` |
| **FR-005** | Nút chuyển đổi ẩn/hiện mật khẩu kèm accessible name và nhãn trợ năng phù hợp cho người khiếm thị | `T048`, `T051`, `T062` |
| **FR-006** | Xác nhận mật khẩu phải trùng khớp từng ký tự với mật khẩu khởi tạo; phản hồi trực quan inline tức thì | `T004`, `T031`, `T048`, `T051` |
| **FR-007** | Phản hồi tiếp nhận trung tính (Anti-enumeration Phương án B): status 200, thông điệp chuẩn hóa, không cấp session/cookie, cùng bộ 3 nút [Đăng nhập ngay], [Khôi phục mật khẩu], [Gửi lại email xác minh] | `T025`, `T032`, `T037`, `T038`, `T042`, `T043`, `T054`, `T057`, `T061` |
| **FR-008** | Tài khoản công khai CHỈ ĐƯỢC gán duy nhất vai trò `CUSTOMER` trong Identity DB (`role_code = 'CUSTOMER'`, `cinema_id = NULL`) | `T011`, `T025`, `T026` |
| **FR-009** | Phát sinh sự kiện Outbox kích hoạt tạo hồ sơ hội viên CineMember tại Cinema Core; xử lý bất đồng bộ, retry idempotent tối đa 5 lần | `T011`, `T014`, `T017`, `T018`, `T025`, `T033`, `T034`, `T059` |
| **FR-010** | Trạng thái email chưa xác minh (`email_verified = false`); phân định rạch ròi 4 mốc nội bộ; kích hoạt gửi email qua A-02 | `T011`, `T025`, `T043`, `T057` |
| **FR-011** | Ranh giới nghiệp vụ BR-02: Tài khoản chưa xác minh email không được giữ ghế (B-02) hoặc mua vé (B-05); không phụ thuộc On-demand Provisioning | `T011`, `T025`, `T033`, `T035`, `T036` |
| **FR-012** | Không cấp phiên tự động (Phương án A): không tự động đăng nhập, không cookie/token; hiển thị màn hình tiếp nhận với bộ 3 nút [Đăng nhập ngay] (A-03), [Khôi phục mật khẩu] (A-05), [Gửi lại email xác minh] (A-02) | `T021`, `T028`, `T032`, `T054`, `T061` |
| **FR-013** | Tuyệt đối bảo vệ mật khẩu (PWD-006): cấm ghi log, telemetry, crash report hay API responses; kiểm soát sentinel secrets | `T029`, `T030`, `T041`, `T049` |
| **FR-014** | Lưu trữ mật khẩu an toàn theo PWD-007: Argon2id ($v=19, m=65536, t=3, p=1$, 16 bytes salt, format MCF) | `T021`, `T025`, `T058` |
| **FR-015** | Giới hạn tần suất (Rate Limiting) trên endpoint đăng ký: Atomic Fixed Window qua Redis Lua script (5 req/15 phút/IP), mã lỗi `RATE_LIMIT_EXCEEDED`, header `Retry-After` | `T019`, `T040`, `T041` |
| **FR-016** | Giao diện Web tuân thủ WCAG 2.2 AA theo NFR-ACC-01 §9.13.2 (Bộ tham chiếu A: Edge + Narrator Windows, Safari + VoiceOver iPhone 11 Pro Max thật) | `T031`, `T047`, `T048`, `T062` |
| **FR-017** | Mobile native UX: Tự động điền (Autofill iOS Keychain & Google Credential Manager), bàn phím ảo thích hợp, xử lý xoay màn hình | `T052`, `T053`, `T056` |
| **FR-018** | Mobile a11y theo Bộ tham chiếu A: Dynamic Type / Font scaling, VoiceOver iPhone 11 Pro Max thật, TalkBack Android emulator | `T053`, `T056`, `T063` |
| **FR-019** | Xử lý lỗi mất kết nối mạng: hiển thị thông báo lỗi rõ ràng, không tạo tài khoản giả định hoặc lưu trữ offline | `T055`, `T056`, `T060` |
| **FR-020** | Phân kỳ triển khai: Cho phép hoàn thành và nghiệm thu độc lập Customer Web trước, sau đó triển khai Customer Mobile | `T065` (Web Gate), `T066` (Mobile Gate) |
| **FR-021** | Xử lý lỗi hệ thống trung thực và an toàn theo mô hình 3 trạng thái F4: trước commit 500/503; mất mạng sau commit; mất kết nối tại commit | `T060` |
| **SC-001** | Chỉ tiêu UX & Hiệu năng: Người dùng hoàn tất < 2 phút; API response time p95 < 1.5s trong điều kiện mạng chuẩn | `T025`, `T031`, `T051`, `T064` (k6 load test) |
| **SC-002** | 100% tài khoản mới có role `CUSTOMER`, `email_verified = false`, không cấp quyền vận hành hay cho phép đặt vé | `T011`, `T025`, `T026` |
| **SC-003** | 100% ca thử nghiệm mật khẩu tuân thủ PWD-001…PWD-004 (độ dài, Unicode NFC, passphrase, blocklist) | `T003`, `T004`, `T044`, `T045`, `T046` |
| **SC-004** | Anti-enumeration: Email đã tồn tại đồng nhất 100% status 200, JSON, thông điệp, bộ 3 nút [Đăng nhập ngay], [Khôi phục mật khẩu], [Gửi lại email xác minh] trong cả 3 tình huống của A-02 | `T037`, `T038`, `T042`, `T043`, `T057`, `T061` |
| **SC-005** | 0 trường hợp mật khẩu plaintext rò rỉ vào log, telemetry, crash report hay API responses (PWD-006) | `T029`, `T030`, `T041`, `T049` |
| **SC-006** | Đạt chuẩn WCAG 2.2 AA (Web) và khả năng tiếp cận nền tảng (Mobile) theo Bộ tham chiếu A | `T062` (Web A11y), `T063` (Mobile A11y) |
| **SC-007** | Chỉ tiêu chất lượng UX đề xuất: Tỷ lệ hoàn tất đăng ký thành công lần đầu đạt >= 85% (đo baseline thử nghiệm) | `T031`, `T051`, `T062`, `T063` |
| **SC-008** | Phân kỳ nghiệm thu độc lập: Customer Web nghiệm thu trước mà không bị chặn bởi tiến độ của Mobile | `T065` (Web Gate), `T066` (Mobile Gate) |
| **SC-009** | Tiêu chuẩn nghiệm thu xử lý lỗi hệ thống F4: phân biệt rõ ràng 3 trạng thái sự cố | `T060` |
| **PWD-001** | Độ dài mật khẩu: 15–128 Unicode code points sau chuẩn hóa NFC | `T003`, `T004`, `T044`, `T045` |
| **PWD-002** | Ký tự Unicode & khoảng trắng: Chấp nhận mọi ký tự, giữ nguyên khoảng trắng đầu/cuối, phân biệt hoa/thường | `T003`, `T004`, `T044`, `T045` |
| **PWD-003** | Không bắt buộc phối hợp ký tự: Không ép buộc phải có đồng thời chữ hoa/thường/số/ký hiệu | `T003`, `T004`, `T044`, `T045`, `T047` |
| **PWD-004** | Danh sách mật khẩu phổ biến/đã lộ: SecLists top 100k; kiểm tra phía máy chủ; cơ chế fail-secure (dừng server `exit(1)` khi startup thiếu file; trả HTTP 503 `SERVICE_UNAVAILABLE` khi runtime lỗi) | `T015`, `T044`, `T046` |
| **PWD-005** | *Không áp dụng cho A-01*: PWD-005 quy định cho đổi mật khẩu không trùng mật khẩu hiện tại (thuộc phạm vi tính năng khác) | N/A (Được ghi nhận phân định rõ ràng trong spec.md) |
| **PWD-006** | Kiểm soát chống rò rỉ: Cấm ghi nhận mật khẩu thô vào bất kỳ hệ thống lưu trữ thứ cấp, log hay telemetry | `T029`, `T030`, `T041`, `T049` |
| **PWD-007** | Băm mật khẩu an toàn phía Identity Service: Thuật toán Argon2id (m=65536, t=3, p=1, salt 16 bytes ngẫu nhiên) | `T021`, `T025`, `T058` |
| **Quickstart Ca 1** | Đăng ký Email mới thành công (Happy Path qua API, Web, outbox event và emailVerified = false) | `T024`, `T025`, `T027`, `T029`, `T030`, `T031`, `T061` |
| **Quickstart Ca 2** | Email đã tồn tại, Cạnh tranh đồng thời, Canonical Email, Rate Limiting (5 req/15p, `RATE_LIMIT_EXCEEDED`, `Retry-After`) & Web BFF 7 ca phản hồi | `T037`, `T038`, `T039`, `T040`, `T041`, `T061` |
| **Quickstart Ca 3** | Ma trận Fixture Mật khẩu PWD-TC-01..10 & Cơ chế Fail-Secure Blocklist khi thiếu/lỗi file dataset (HTTP 503 `SERVICE_UNAVAILABLE`) | `T015`, `T044`, `T045`, `T046` |
| **Quickstart Ca 4** | Tương thích Dữ liệu qua Better Auth Drizzle Adapter & Luồng Đăng nhập A-03 (`adapter.findOne`, hash format MCF) | `T021`, `T028`, `T058` |
| **Quickstart Ca 5** | Pipeline Outbox CDC, Kafka KRaft, DLQ chữ thường `identity.customer-registered.dlq`, acks=all, Halt Partition, và Reconciliation Audit Job | `T016`, `T017`, `T018`, `T033`, `T034`, `T035`, `T036`, `T059` |
| **Quickstart Ca 6** | Ma trận A-02 Ba Trạng thái (Khỏe mạnh, Chưa triển khai stub/mock, Lỗi chuyển phát; đồng nhất 100% UI & API, bộ 3 nút [Đăng nhập ngay], [Khôi phục mật khẩu], [Gửi lại email xác minh]) | `T043` (Web), `T057` (Mobile) |
| **Quickstart Ca 7** | Xử lý Lỗi Hệ thống và Mất kết nối Trung thực F4 (3 trạng thái: trước commit 500/503, sau commit, tại commit) | `T060` |
| **Quickstart Ca 8** | Đánh giá Khả năng tiếp cận & Trợ năng Bộ tham chiếu A (axe-core, Narrator Edge, Safari VoiceOver iPhone 11 Pro Max thật, TalkBack emulator) | `T062` (Web), `T063` (Mobile) |
| **Plan §8 (Perf)** | Kiểm chứng Hiệu năng & Cân bằng Thời gian (k6 staging load test: API p95 < 1.5s, chênh lệch cả p50 & p95 < 15%) | `T064` |

---

## Danh mục Công việc Chi tiết (Task List)

### Phase 1 — Thiết lập & Hợp đồng Dùng chung (Setup & Shared Contracts)

- [ ] T001 Khởi tạo cấu trúc module hợp đồng xác thực khách hàng dùng chung trong `packages/contracts/src/auth/` và cấu hình xuất bản qua `packages/contracts/src/index.ts`
- [ ] T002 [P] Khởi tạo các kiểu dữ liệu TypeScript domain và error enums (`CustomerRegistrationErrorCode`, `RoleCode`, `OutboxStatus`) trong `packages/contracts/src/auth/registration.types.ts`
- [ ] T003 [P] Triển khai Zod 4 pure structural schemas (`customerRegisterRequestSchema`, `customerRegisterResponseSchema`, `registerClientErrorResponseSchema`, `internalForwardingErrorResponseSchema`) trong `packages/contracts/src/auth/registration.schema.ts` (phụ thuộc `T002`)
- [ ] T004 [P] Viết unit tests kiểm chứng wire schema validation Zod 4 và bắt lỗi định dạng cơ bản trong `packages/contracts/tests/registration-schema.test.ts` (phụ thuộc `T003`)
- [ ] T005 [P] Triển khai script xuất native JSON Schema Draft-07 (`target: 'draft-07'`, `io: 'input'`) qua `z.toJSONSchema()` của Zod 4 xuất tệp `packages/contracts/schemas/customer-register.schema.json` (phụ thuộc `T003`)
- [ ] T006 [P] Cấu hình sinh Pydantic v2 schemas qua `datamodel-code-generator` cho Agent Service trong `services/agent-service/src/schemas/customer_register.py` và viết test fixture chéo TS/Python trong `packages/contracts/tests/cross-language-contract.test.ts` (phụ thuộc `T005`)
- [ ] T007 [P] Mở rộng `package.json` root và các workspace: định nghĩa rõ các npm scripts kiểm thử riêng biệt cho từng suite (`test:contracts`, `test:cross-language`, `test:identity`, `test:core`, `test:web`, `test:web:e2e`, `test:mobile`, `test:perf`, `test:suites`), bảo toàn regression suite hiện hữu `node:test` của `customer-web` (112 tests)

---

### Phase 2 — Nền tảng Dữ liệu, Pipeline CDC & Hạ tầng Kiểm thử Cô lập (Foundational)

- [ ] T008 Bootstrap cấu hình dự án Identity Service trong `services/identity-service/package.json` và `services/identity-service/tsconfig.json` với đầy đủ dependencies (`fastify`, `drizzle-orm`, `postgres`, `@node-rs/argon2`, `better-auth`, `ipaddr.js`, `@platform/contracts`) và script kiểm tra khởi động
- [ ] T009 [P] Thiết lập module kết nối cơ sở dữ liệu `postgres.js` và Drizzle client trong `services/identity-service/src/infrastructure/db/index.ts` (phụ thuộc `T008`)
- [ ] T010 Triển khai Fastify application entrypoint và bootstrap server trong `services/identity-service/src/index.ts` đấu nối routes, plugins, error handlers và kiểm tra khởi động dịch vụ (phụ thuộc `T008`, `T009`)
- [ ] T011 [P] Triển khai Drizzle ORM schema cho Identity Service trong `services/identity-service/src/infrastructure/db/schema.ts` với đầy đủ 4 bảng theo mô hình tại `data-model.md §2.1–§2.4`:
    - Bảng `users` (diễn giải từ `data-model.md §2.1`): `id UUID PRIMARY KEY`, `name VARCHAR(255) NOT NULL`, `email VARCHAR(255) NOT NULL UNIQUE`, `email_verified BOOLEAN NOT NULL DEFAULT FALSE`, `phone_number VARCHAR(32) NULL`, `created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`. Tuyệt đối không thêm cột `role` vào bảng `users`. Cơ chế sinh ID: Kiểu cột là `UUID PRIMARY KEY` (không dùng DEFAULT gen_random_uuid() của Postgres v4); ID được sinh bằng hàm `genUUIDv7()` ở tầng application/domain theo `research.md §1.2` (dòng 93).
    - Bảng `accounts` (diễn giải từ `data-model.md §2.2`): `id UUID PRIMARY KEY`, `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`, `account_id VARCHAR(255) NOT NULL` (bắt buộc lưu `user.id`), `provider_id VARCHAR(32) NOT NULL DEFAULT 'credential'`, `password_hash TEXT NOT NULL`, `created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`. Chỉ mục: `UNIQUE (user_id, provider_id)`.
    - Bảng `user_role_assignments` (diễn giải từ `data-model.md §2.3`): `id UUID PRIMARY KEY`, `user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`, `role_code VARCHAR(32) NOT NULL DEFAULT 'CUSTOMER'`, `cinema_id UUID NULL`, `assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`. Chỉ mục: `UNIQUE (user_id, role_code, cinema_id)`.
    - Bảng `outbox_events` (diễn giải từ `data-model.md §2.4`): `id UUID PRIMARY KEY`, `aggregate_type VARCHAR(64) NOT NULL DEFAULT 'USER'`, `aggregate_id UUID NOT NULL`, `event_type VARCHAR(64) NOT NULL DEFAULT 'CUSTOMER_REGISTERED'`, `payload JSONB NOT NULL`, `status VARCHAR(16) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PUBLISHED', 'FAILED'))`, `retry_count INTEGER NOT NULL DEFAULT 0`, `last_error TEXT NULL`, `created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`, `published_at TIMESTAMPTZ NULL` (phụ thuộc `T008`).
- [ ] T012 [P] Triển khai module tiện ích sinh và kiểm chứng UUIDv7 trong `services/identity-service/src/shared/uuidv7.ts` (sinh canonical 36 ký tự `8-4-4-4-12`, trích xuất timestamp miligiây, kiểm tra version bit `7` và variant bit `8/9/a/b` theo RFC 9562) và viết unit test kiểm chứng trong `services/identity-service/tests/unit/uuidv7.test.ts` (phụ thuộc `T008`)
- [ ] T013 [P] Tạo migration SQL và migration runner cho Identity database trong `services/identity-service/src/infrastructure/db/migrations/0001_initial_identity_schema.sql` khởi tạo 4 bảng trên (phụ thuộc `T011`)
- [ ] T014 [P] Triển khai Drizzle schema và migration cho Cinema Core `loyalty_members` trong `services/cinema-core/src/loyalty/infrastructure/loyalty.schema.ts` và `services/cinema-core/src/infrastructure/db/migrations/0001_create_loyalty_members.sql` (diễn giải từ `data-model.md §3.1`): `id UUID PRIMARY KEY`, `user_id UUID NOT NULL UNIQUE`, `member_code VARCHAR(32) NOT NULL UNIQUE`, `current_tier VARCHAR(32) NOT NULL DEFAULT 'BASIC'`, `points_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00`, `total_spending_12m DECIMAL(12,2) NOT NULL DEFAULT 0.00`, `status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED'))`, `created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`, `updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP`
- [ ] T015 [P] Cung cấp dataset SecLists top 100k từ repository `danielmiessler/SecLists` (đường dẫn nguồn `Passwords/Common-Credentials/10-million-password-list-top-100000.txt`, commit bất biến `45499242ec0164c7f91cbcf8bd509404fc0b99f3` release tag 2024.4, license MIT tại snapshot, SHA-256 `E30E15FAECC8DB2D3181C3126E3B2C0CD5C187AF10A5E4E83BABFA157EDAB188`, tổng cộng 100007 dòng) vào đường dẫn đích `services/identity-service/data/blocklist/10-million-password-list-top-100000.txt` và danh sách mật khẩu phổ biến tiếng Việt trong `services/identity-service/data/blocklist/vietnamese-common-passwords.txt` kèm manifest nội bộ xác thực (phụ thuộc `T008`)
- [ ] T016 [P] Xây dựng cấu hình hạ tầng kiểm thử cô lập Docker Compose trong `docker/test-stack/docker-compose.test.yml` tuân thủ quy tắc repository:
    - PostgreSQL Identity DB trên cổng cô lập `5433` kèm cấu hình logical decoding (`wal_level=logical`, `max_replication_slots=4`, `max_wal_senders=4`).
    - PostgreSQL Cinema Core DB trên cổng cô lập `5434`.
    - Redis trên cổng cô lập `6380`.
    - Apache Kafka KRaft broker trên cổng cô lập `9093`.
    - Debezium Connect trên cổng cô lập `8084`.
    - Kèm scripts bootstrap, healthcheck / readiness probes kiểm tra cổng sẵn sàng, và cleanup teardown trong `scripts/test-stack/test-stack-bootstrap.sh` và `scripts/test-stack/test-stack-bootstrap.ps1`.
- [ ] T017 [P] Cấu hình Debezium CDC Connector và Outbox Event Router SMT trong `services/identity-service/config/debezium-outbox-connector.json`:
    - Thiết lập connector class `io.debezium.connector.postgresql.PostgresConnector`, `plugin.name = pgoutput`, `table.includeList = public.outbox_events`.
    - Cấu hình Outbox Event Router SMT `io.debezium.transforms.outbox.EventRouter`: ánh xạ `aggregate_type=USER`, `event_type=CUSTOMER_REGISTERED` sang Kafka topic `identity.customer-registered`.
    - Kèm script đăng ký connector qua REST API của Kafka Connect trong `scripts/test-stack/register-debezium-connector.sh` (phụ thuộc `T016`).
- [ ] T018 [P] Cấu hình Kafka Topics và cluster settings trong `services/cinema-core/config/kafka-topics.json`:
    - Topic chính `identity.customer-registered` (partitions=3, replication-factor=1 trong test stack, min.insync.replicas=1, retention.ms=604800000).
    - Topic lỗi DLQ chữ thường `identity.customer-registered.dlq` (dead letter queue).
    - Cấu hình Producer idempotency (`acks=all`, `enable.idempotence=true`, `retries=5`).
    - Kèm script khởi tạo topics tự động trong `scripts/test-stack/init-kafka-topics.sh` (phụ thuộc `T016`).
- [ ] T019 [P] Triển khai bộ đếm Rate Limiting nguyên tử Atomic Fixed Window qua Redis Lua script (`INCR` và `EXPIRE 900` trong cùng một transaction) kèm fallback RAM LRU cache khi Redis lỗi trong `services/identity-service/src/infrastructure/rate-limiter.ts` (phụ thuộc `T016`)
- [ ] T020 [P] Triển khai middleware xác thực IP chuyển tiếp và mạng nội bộ trong `services/identity-service/src/infrastructure/ip-forwarding.ts`: thuật toán `isPeerInTrustedCidr` xử lý CIDR đa họ IPv4/IPv6 qua `ipaddr.js`, kiểm tra `crypto.timingSafeEqual` cho `X-Internal-Service-Key`, kiểm tra đơn trị `net.isIP` cho `X-Original-Client-IP`, trả về HTTP 401 `UNAUTHORIZED_INTERNAL_CALL` hoặc HTTP 400 `MALFORMED_FORWARDED_IP`
- [ ] T021 [P] Cấu hình Better Auth core và Drizzle Adapter trong `services/identity-service/src/infrastructure/auth/better-auth.ts`: `disableSignUp: true` (chặn đăng ký qua route mặc định của Better Auth để bảo vệ full application validation và outbox), `autoSignIn: false` (không tự cấp session sau khi đăng ký), mapping `{ account: { fields: { password: "password_hash" } } }`, custom Argon2id hasher/verifier dùng `@node-rs/argon2` chuẩn hóa Unicode NFC trước khi xử lý (phụ thuộc `T008`, `T011`)
- [ ] T022 [P] Thiết lập test runner và môi trường kiểm thử cho Identity Service trong `services/identity-service/tests/setup.ts`, tích hợp biến môi trường test stack cô lập và lệnh `npm run test:identity` (phụ thuộc `T007`, `T008`, `T016`)
- [ ] T023 [P] Thiết lập test runner và môi trường kiểm thử cho Cinema Core trong `services/cinema-core/tests/setup.ts`, tích hợp kết nối test Kafka/Postgres và lệnh `npm run test:core` (phụ thuộc `T007`, `T016`)

---

### Phase 3 — User Story 1: Đăng ký Tài khoản Khách hàng Thành công bằng Email và Mật khẩu (Priority: P1)

- [ ] T024 [US1] Viết integration tests cho luồng đăng ký Happy Path (Quickstart Ca 1) trong `services/identity-service/tests/integration/register-success.test.ts`: kiểm chứng tạo tài khoản mới với email chưa tồn tại, mật khẩu hợp lệ PWD-001..004, trả về HTTP 200 tiếp nhận trung tính, hoàn toàn vắng mặt header `Set-Cookie`, kiểm tra database ghi đủ 4 bảng (phụ thuộc `T011`, `T013`, `T022`)
- [ ] T025 [US1] Triển khai UseCase đăng ký tài khoản khách hàng `RegisterCustomerUseCase` và transaction 4 bảng nguyên tử trong `services/identity-service/src/domain/use-cases/register-customer.ts`:
    - Sinh `user.id = genUUIDv7()`.
    - Băm mật khẩu bằng Argon2id PWD-007 (MCF format).
    - Mở khối `db.transaction()` ghi đồng thời: (1) `users` (`email_verified = false`), (2) `accounts` (`account_id = user.id`, `provider_id = 'credential'`, `password_hash`), (3) `user_role_assignments` (`role_code = 'CUSTOMER'`, `cinema_id = NULL`), (4) `outbox_events` (`aggregate_type = 'USER'`, `aggregate_id = user.id`, `event_type = 'CUSTOMER_REGISTERED'`, `status = 'PENDING'`).
    - Commit và trả về `RegisterResponse` chuẩn HTTP 200 với `message = UNIFIED_REGISTRATION_SUCCESS_MESSAGE` (phụ thuộc `T011`, `T012`, `T021`).
- [ ] T026 [US1] Viết integration test kiểm chứng tính nguyên tử của database transaction trong `services/identity-service/tests/integration/atomic-transaction-rollback.test.ts`: giả lập lỗi cố tình tại bước ghi bảng thứ 3 hoặc thứ 4, xác nhận 100% transaction rollback hoàn toàn, không để lại bản ghi rác (orphan records) trong bất kỳ bảng nào (phụ thuộc `T025`)
- [ ] T027 [US1] Triển khai HTTP Controller và route `POST /api/v1/identity/register` trong `services/identity-service/src/presentation/controllers/register.controller.ts`: thực hiện wire validation bằng Zod schema từ `@platform/contracts`, gọi UseCase, trả về phản hồi chuẩn HTTP 200 (phụ thuộc `T003`, `T025`)
- [ ] T028 [US1] Viết integration test kiểm chứng route đăng ký mặc định của Better Auth (`/api/auth/sign-up/email`) bị chặn (404/403) và không cấp session/token/Set-Cookie header trong `services/identity-service/tests/integration/better-auth-disable-signup.test.ts` (phụ thuộc `T021`, `T027`)
- [ ] T029 [US1] Triển khai Web BFF handler helper logic `POST /api/auth/register` trong `apps/customer-web/src/server/auth-bff.ts`: gắn header bảo mật `X-Internal-Service-Key` và `X-Original-Client-IP`, phân định lỗi dựa trên cả HTTP status và payload schema/code (giữ nguyên HTTP 400 lỗi nhập liệu, chuyển đổi 400/401 nội bộ và phản hồi dị thường thành HTTP 500, giữ nguyên 429 và Retry-After), ghi log an toàn chỉ chứa metadata theo allowlist (status, correlation ID, error type), cấm tuyệt đối log raw body/headers hay secrets (phụ thuộc `T003`, `T027`)
- [ ] T030 [US1] Triển khai Next.js App Router Route Handler thực tế `POST` trong `apps/customer-web/src/app/api/auth/register/route.ts` nhận request từ client, gọi helper BFF logic trong `apps/customer-web/src/server/auth-bff.ts`, xử lý 7 ca phản hồi và trả JSON response tương ứng cho trình duyệt (phụ thuộc `T029`)
- [ ] T031 [US1] Cập nhật giao diện Form Đăng ký trên Web trong `apps/customer-web/src/features/auth/components/RegisterView.tsx`: thay thế dữ liệu mock, khởi tạo form ở trạng thái rỗng, hỗ trợ các trường Họ tên, Email, Mật khẩu, Xác nhận mật khẩu, Số điện thoại (tùy chọn theo BR-02), Checkbox chấp thuận điều khoản dịch vụ; bỏ hoàn toàn các nút mạng xã hội giả và đặt vé khách giả lập (phụ thuộc `T030`)
- [ ] T032 [US1] Triển khai Màn hình Tiếp nhận Hướng dẫn A-02 trên Web trong `apps/customer-web/src/features/auth/components/RegistrationSuccessView.tsx`: hiển thị thông điệp trung tính `UNIFIED_REGISTRATION_SUCCESS_MESSAGE` (FR-012 Phương án A) kèm bộ 3 nút điều hướng: [Đăng nhập ngay] (chuyển sang A-03), [Khôi phục mật khẩu] (chuyển sang A-05), và [Gửi lại email xác minh] (chuyển sang A-02 có cooldown 60s) (phụ thuộc `T031`)
- [ ] T033 [US1] Triển khai Kafka Consumer lắng nghe sự kiện `identity.customer-registered` tại Cinema Core trong `services/cinema-core/src/loyalty/consumers/customer-registered.consumer.ts`: tạo bản ghi hội viên trong `loyalty_members` (`points_balance = 0.00`, `current_tier = 'BASIC'`, `status = 'ACTIVE'`), xử lý idempotent bằng câu lệnh `ON CONFLICT (user_id) DO NOTHING` (phụ thuộc `T014`, `T018`, `T023`)
- [ ] T034 [US1] Triển khai cơ chế Retry, DLQ và Partition Halt tại Cinema Core Kafka Consumer trong `services/cinema-core/src/loyalty/consumers/consumer-retry-dlq.ts`: retry tối đa 5 lần với exponential backoff; khi lỗi kéo dài đẩy sự kiện sang topic DLQ chữ thường `identity.customer-registered.dlq` với `acks=all`; commit offset khi DLQ ack thành công; nếu DLQ publish thất bại, KHÔNG commit source offset, dừng partition (halt) và kích hoạt cảnh báo vận hành khẩn cấp (phụ thuộc `T033`)
- [ ] T035 [US1] Triển khai Internal Reconciliation API do Identity Service sở hữu `GET /api/v1/internal/users/reconciliation` trong `services/identity-service/src/presentation/controllers/internal-reconciliation.controller.ts`: xác thực `X-Internal-Service-Key`, hỗ trợ giao thức phân trang cursor `?limit=100&cursor=<last_user_id>&created_before=<timestamp_1_hour_ago>` (phụ thuộc `T020`, `T025`)
- [ ] T036 [US1] Triển khai Reconciliation Audit Job định kỳ tại Cinema Core trong `services/cinema-core/src/loyalty/jobs/reconciliation-audit.job.ts`: gọi Internal Reconciliation API của Identity Service, kiểm tra và tự động bù đắp (self-healing) các hội viên bị thiếu sau hơn 1 giờ mà không vi phạm ranh giới dữ liệu (phụ thuộc `T033`, `T035`)

---

### Phase 4 — User Story 2: Xử lý An toàn khi Email đã Tồn tại và Đầu vào Không Hợp lệ (Priority: P1)

- [ ] T037 [US2] Viết integration tests cho kịch bản email trùng lặp, cạnh tranh race condition và dummy timing trong `services/identity-service/tests/integration/existing-email-anti-enumeration.test.ts` (Quickstart Ca 2.1, Ca 2.2): kiểm chứng phản hồi trung tính đồng nhất và an toàn khi 2 request cùng email gửi đến đồng thời (phụ thuộc `T025`, `T027`)
- [ ] T038 [US2] Triển khai logic chống Account Enumeration (Phương án B) và xử lý cạnh tranh đồng thời trong `services/identity-service/src/domain/use-cases/register-customer.ts`: khi email đã tồn tại, thực thi dummy hash mô phỏng chi phí tính toán Argon2id; khi 2 request cùng email cạnh tranh, bắt mã lỗi PostgreSQL `23505` (`users_email_unique`) tại database transaction, rollback an toàn và trả về phản hồi tiếp nhận trung tính HTTP 200 đồng nhất với `message = UNIFIED_REGISTRATION_SUCCESS_MESSAGE` (phụ thuộc `T025`)
- [ ] T039 [US2] Triển khai kiểm tra định dạng Canonical Email Regex tương thích 100% Better Auth / Zod (`CANONICAL_EMAIL_REGEX`) trong `services/identity-service/src/domain/validators/email-canonical.validator.ts` (Quickstart Ca 2.3): chuẩn hóa lowercase, trim khoảng trắng, loại bỏ các email vi phạm chuẩn RFC 5322 (phụ thuộc `T025`)
- [ ] T040 [US2] Tích hợp Rate Limiting và IP Forwarding vào Controller trong `services/identity-service/src/presentation/controllers/register.controller.ts`: áp dụng quota 5 requests / 15 phút theo IP người dùng (`X-Original-Client-IP`), trả về HTTP 429 `Too Many Requests` với wire code `RATE_LIMIT_EXCEEDED` và header `Retry-After: <giây>` khi vượt ngưỡng (phụ thuộc `T019`, `T020`, `T027`)
- [ ] T041 [US2] Viết integration test cho 7 ca phản hồi của Web BFF trong `apps/customer-web/tests/bff-auth-forwarding.test.ts`: kiểm chứng phân định rạch ròi lỗi nhập liệu 400 (giữ nguyên 400), lỗi chuyển tiếp nội bộ 400/401 (chuyển thành 500 an toàn), lỗi rate limit 429 (`RATE_LIMIT_EXCEEDED`, giữ nguyên 429 và `Retry-After`), phản hồi dị thường upstream (chuyển thành 500), và chỉ ghi log metadata allowlist (phụ thuộc `T029`, `T030`, `T040`)
- [ ] T042 [US2] Cập nhật giao diện Web xử lý phản hồi tiếp nhận trung tính khi email trùng và hiển thị lỗi validation inline trong `apps/customer-web/src/features/auth/components/RegisterView.tsx`: hiển thị lỗi nhập liệu trực quan inline dưới từng trường, bảo đảm không bị phân biệt giao diện giữa email mới và email trùng (phụ thuộc `T031`, `T038`)
- [ ] T043 [US2] Viết test kịch bản kiểm chứng Ma trận A-02 Ba Trạng thái trên Web (Quickstart Ca 6) trong `apps/customer-web/tests/e2e/a02-three-states-matrix.test.ts`: kiểm chứng 3 trạng thái A-02 (khỏe mạnh, chưa triển khai stub/mock, lỗi chuyển phát); xác nhận cả hai nhánh email mới và email trùng đều đồng nhất 100% mã HTTP 200, payload JSON, thông điệp tiếp nhận `UNIFIED_REGISTRATION_SUCCESS_MESSAGE`, bộ 3 nút điều hướng [Đăng nhập ngay], [Khôi phục mật khẩu], [Gửi lại email xác minh] và trạng thái controls (phụ thuộc `T032`, `T042`)

---

### Phase 5 — User Story 3: Tuân thủ Chính sách Mật khẩu Dùng chung và Bảo vệ An toàn Thông tin (Priority: P1)

- [ ] T044 [US3] Viết unit tests kiểm chứng ma trận fixture mật khẩu PWD-TC-01..10 (Quickstart Ca 3.1) và chuẩn hóa Unicode NFC trong `services/identity-service/tests/unit/password-policy.test.ts`: kiểm tra độ dài 15–128 code points, passphrase có khoảng trắng đầu/cuối, ký tự có dấu phân rã NFD tương đương NFC, và từ chối mật khẩu thuộc blocklist (phụ thuộc `T022`)
- [ ] T045 [US3] Triển khai Module Kiểm tra Mật khẩu PWD-001..004 trong `services/identity-service/src/domain/validators/password.validator.ts`: chuẩn hóa Unicode NFC trước khi đếm độ dài (15–128 ký tự), giữ nguyên khoảng trắng đầu/cuối theo PWD-002, không bắt buộc phối hợp ký tự theo PWD-003, tích hợp kiểm tra blocklist; khi phát hiện lỗi blocklist ném domain error `BLOCKLIST_SERVICE_UNAVAILABLE` hoặc `PASSWORD_IN_BLOCKLIST` (phụ thuộc `T025`, `T044`)
- [ ] T046 [US3] Triển khai Blocklist Loader và cơ chế Fail-Secure (PWD-004) trong `services/identity-service/src/domain/validators/blocklist-loader.ts`: nạp dataset SecLists top 100k (`10-million-password-list-top-100000.txt`) và tiếng Việt (`vietnamese-common-passwords.txt`) từ `services/identity-service/data/blocklist/` vào Set bộ nhớ; kiểm tra checksum SHA-256 lúc startup; nếu thiếu/lỗi file lúc startup thì dừng `process.exit(1)`; nếu lỗi runtime, controller ánh xạ domain error thành wire response công khai `HTTP 503 Service Unavailable` với code `SERVICE_UNAVAILABLE` (phụ thuộc `T015`, `T045`)
- [ ] T047 [US3] Triển khai Component Hướng dẫn Mật khẩu rõ ràng (Password Guide Indicator - FR-004) trên Web trong `apps/customer-web/src/features/auth/components/PasswordGuideIndicator.tsx`: hiển thị quy tắc mật khẩu (độ dài 15–128 ký tự sau NFC, không bắt buộc loại ký tự, không dùng mật khẩu phổ biến); loại bỏ hoàn toàn thanh đo độ mạnh 4 loại ký tự cũ (phụ thuộc `T031`)
- [ ] T048 [US3] Triển khai Nút Chuyển đổi Ẩn/Hiện Mật khẩu và Xác nhận Mật khẩu khớp từng ký tự (FR-005, FR-006) trong `apps/customer-web/src/features/auth/components/PasswordInputField.tsx`: hỗ trợ accessible name và nhãn aria-label phù hợp cho người khiếm thị, phản hồi trực quan inline tức thì khi xác nhận mật khẩu chưa khớp (phụ thuộc `T031`)
- [ ] T049 [US3] Viết test kịch bản Sentinel Secrets kiểm tra 0 trường hợp mật khẩu plaintext, token, cookie, internal key xuất hiện trong log, telemetry, crash report hoặc API response (FR-013, SC-005, PWD-006) trong `services/identity-service/tests/integration/sentinel-secrets.test.ts` và `apps/customer-web/tests/bff-sentinel.test.ts` (phụ thuộc `T029`, `T030`, `T041`)

---

### Phase 6 — User Story 4: Trải nghiệm Đăng ký trên Ứng dụng Mobile Native (iOS & Android) (Priority: P1)

- [ ] T050 [US4] Scaffold dự án Customer Mobile trong `apps/customer-mobile/package.json`, cấu hình Expo/React Native (`app.json`, `tsconfig.json`), thiết lập môi trường kiểm thử Jest / React Native Testing Library trong `apps/customer-mobile/jest.config.js` và cấu hình script `npm run test:mobile` (phụ thuộc `T007`)
- [ ] T051 [P] [US4] Triển khai màn hình Đăng ký Mobile trong `apps/customer-mobile/src/features/auth/screens/RegisterScreen.tsx`: khởi tạo form rỗng, các trường Họ tên, Email, Mật khẩu, Xác nhận mật khẩu, SĐT (tùy chọn), Checkbox điều khoản, hiển thị thông báo lỗi inline (phụ thuộc `T050`)
- [ ] T052 [P] [US4] Tích hợp tính năng Native Autofill Credential cho iOS (iCloud Keychain) và Android (Google Autofill / Credential Manager) kèm bàn phím ảo thích hợp (`email-address`, `phone-pad`) trong `apps/customer-mobile/src/features/auth/components/MobileAuthInputs.tsx` theo FR-017 (phụ thuộc `T051`)
- [ ] T053 [P] [US4] Tích hợp hỗ trợ Dynamic Type / System Font Scaling và xử lý xoay màn hình (orientation change) trong `apps/customer-mobile/src/features/auth/styles/responsive.ts` theo FR-018 (phụ thuộc `T051`)
- [ ] T054 [P] [US4] Triển khai màn hình Tiếp nhận Hướng dẫn A-02 trên Mobile trong `apps/customer-mobile/src/features/auth/screens/RegistrationSuccessScreen.tsx`: hiển thị thông điệp trung tính `UNIFIED_REGISTRATION_SUCCESS_MESSAGE` với bộ 3 nút điều hướng: [Đăng nhập ngay] (chuyển sang A-03), [Khôi phục mật khẩu] (chuyển sang A-05), và [Gửi lại email xác minh] (chuyển sang A-02 có cooldown 60s) (phụ thuộc `T051`)
- [ ] T055 [P] [US4] Triển khai xử lý lỗi mất kết nối mạng (FR-019) hiển thị banner rõ ràng, không tạo tài khoản giả định offline trong `apps/customer-mobile/src/features/auth/hooks/useNetworkStatus.ts` (phụ thuộc `T051`)
- [ ] T056 [P] [US4] Viết integration tests cho Mobile Auth Flow trên React Native Testing Library trong `apps/customer-mobile/tests/integration/register-flow.test.ts`: kiểm chứng validation inline, autofill attributes, accessibility labels (phụ thuộc `T050`, `T051`, `T052`, `T053`)
- [ ] T057 [P] [US4] Viết test kiểm chứng Ma trận A-02 Ba Trạng thái trên Mobile trong `apps/customer-mobile/tests/integration/a02-mobile-matrix.test.ts` (Quickstart Ca 6): kiểm chứng phản hồi tiếp nhận trung tính, bộ 3 nút điều hướng [Đăng nhập ngay], [Khôi phục mật khẩu], [Gửi lại email xác minh] và trạng thái controls đồng nhất 100% giữa email mới và email trùng trên Mobile (phụ thuộc `T054`, `T056`)

---

### Phase 7 — Kiểm chứng Toàn diện, Quickstart Cases & Delivery Gates

- [ ] T058 **Quickstart Ca 4**: Viết integration test kiểm chứng tương thích dữ liệu qua Better Auth Drizzle Adapter của A-03 trong `services/identity-service/tests/integration/better-auth-adapter-a03.test.ts`: truy vấn bằng `adapter.findOne`, xác nhận cấu trúc hash MCF Argon2id, kiểm chứng xác thực thành công với mật khẩu NFC, mật khẩu NFD tương đương, và từ chối khi mật khẩu sai (phụ thuộc `T021`, `T025`)
- [ ] T059 **Quickstart Ca 5**: Viết end-to-end integration test kiểm chứng toàn trình Pipeline CDC, Kafka KRaft, DLQ acks=all, và Reconciliation Audit Job trong `tests/e2e/cdc-kafka-reconciliation.test.ts`: kiểm chứng từ lúc insert outbox đến khi tạo hội viên tại Core; giả lập Core crash sau DLQ ack trước khi commit offset; chạy Reconciliation Audit Job bù đắp hội viên thiếu > 1 giờ (phụ thuộc `T016`, `T017`, `T018`, `T033`, `T034`, `T036`)
- [ ] T060 **Quickstart Ca 7**: Viết end-to-end test kiểm chứng Xử lý Sự cố Hệ thống F4 (3 trạng thái) trong `tests/e2e/system-failure-f4.test.ts`: (1) Lỗi trước commit trả HTTP 500/503; (2) Commit thành công nhưng mất phản hồi mạng, client retry tiếp nhận trung tính HTTP 200 an toàn; (3) Mất kết nối tại thời điểm commit, client retry xử lý an toàn theo trạng thái giao dịch (phụ thuộc `T025`, `T030`, `T038`)
- [ ] T061 **Quickstart Ca 1 & Ca 2.1**: Viết E2E test Playwright cho luồng Web Đăng ký Email mới và Email trùng trong `apps/customer-web/tests/e2e/registration-flow.spec.ts`: kiểm chứng điền form, gửi dữ liệu, màn hình tiếp nhận với bộ 3 nút [Đăng nhập ngay], [Khôi phục mật khẩu], [Gửi lại email xác minh], đồng nhất UI controls và bảo vệ chống Account Enumeration (phụ thuộc `T031`, `T032`, `T042`)
- [ ] T062 **Quickstart Ca 8 (Web A11y)**: Thực hiện Đánh giá Khả năng tiếp cận & Trợ năng Web theo NFR-ACC-01 §9.13.2 (Bộ tham chiếu A) qua `apps/customer-web/tests/a11y/axe-registration.spec.ts` và biên bản `docs/05-specs/007-customer-registration/verification/web-a11y-audit-report.md`:
    - Tự động: Chạy `@axe-core/playwright` trên toàn bộ màn hình đăng ký và tiếp nhận Web, xác nhận 0 vi phạm nghiêm trọng (critical/serious) trong `apps/customer-web/tests/a11y/axe-registration.spec.ts`.
    - Thủ công / Thiết bị: Kiểm tra bàn phím tuần tự + Narrator trên Microsoft Edge Windows; Safari + VoiceOver trên **iPhone 11 Pro Max thật**.
    - Xuất biên bản kết quả vào `docs/05-specs/007-customer-registration/verification/web-a11y-audit-report.md` (phụ thuộc `T031`, `T032`, `T047`, `T048`, `T061`).
- [ ] T063 **Quickstart Ca 8 (Mobile A11y)**: Thực hiện Đánh giá Khả năng tiếp cận & Trợ năng Mobile theo NFR-ACC-01 §9.13.2 (Bộ tham chiếu A) qua biên bản `docs/05-specs/007-customer-registration/verification/mobile-a11y-audit-report.md`:
    - Kiểm tra ứng dụng iOS + VoiceOver trên **iPhone 11 Pro Max thật**.
    - Kiểm tra ứng dụng Android + TalkBack trên **Android emulator có Android Accessibility Suite**.
    - Kiểm tra Dynamic Type / Font Scaling trên cả hai nền tảng; ghi nhận minh bạch khoảng trống hiệu năng Android trên máy thật theo NFR-PERF-02.
    - Xuất biên bản kết quả vào `docs/05-specs/007-customer-registration/verification/mobile-a11y-audit-report.md` (phụ thuộc `T051`, `T053`, `T054`, `T056`).
- [ ] T064 **Kiểm chứng Hiệu năng & Cân bằng Thời gian (Plan §8)** trong `scripts/perf/k6-registration-timing.js` và báo cáo `docs/05-specs/007-customer-registration/verification/perf-timing-report.md`:
    - Triển khai k6 load test script trong `scripts/perf/k6-registration-timing.js` (warm-up 30s, concurrency 10 VU, chạy trên Staging).
    - Đo thời gian phản hồi API p95 < 1.5s trong điều kiện mạng tiêu chuẩn (SC-001, NFR-PERF-01).
    - So sánh phân bố thời gian phản hồi giữa 2 nhánh (email mới vs email trùng) ở cả phân vị p50 và p95; kiểm chứng chênh lệch phân vị < 15% (chống timing attack).
    - Lưu kết quả đo lường vào `docs/05-specs/007-customer-registration/verification/perf-timing-report.md` (phụ thuộc `T027`, `T038`, `T040`).
- [ ] T065 **Cổng Nghiệm thu Độc lập cho Web (Customer Web Delivery Gate)** qua test runner `npm run test:web` và biên bản `docs/05-specs/007-customer-registration/verification/web-gate.md`:
    - Chạy toàn bộ các test suites liên quan đến Backend & Web: `npm run test:contracts`, `npm run test:identity`, `npm run test:core`, `npm run test:web`, `npm run test:web:e2e`.
    - Đối chiếu các tiêu chí bắt buộc của Web Gate: Quickstart Ca 1, Ca 2, Ca 3, Ca 4, Ca 5, Ca 6 (A-02 Web matrix), Ca 7 (F4), Ca 8 (A11y Web), k6 timing distribution < 15%, 0 log mật khẩu plaintext.
    - Khi đạt, ký nhận hoàn tất Web Delivery Gate sẵn sàng trình nghiệm thu độc lập theo FR-020 và SC-008 (hoàn toàn không phụ thuộc vào tiến độ của Mobile) (phụ thuộc `T058`, `T059`, `T060`, `T061`, `T062`, `T064`).
- [ ] T066 **Cổng Nghiệm thu Độc lập cho Mobile (Customer Mobile Delivery Gate)** qua test runner `npm run test:mobile` và biên bản `docs/05-specs/007-customer-registration/verification/mobile-gate.md`:
    - Chạy test suite của Mobile: `npm run test:mobile`.
    - Đối chiếu các tiêu chí bắt buộc của Mobile Gate: Autofill native, Dynamic Type, Quickstart Ca 6 (A-02 Mobile matrix), Quickstart Ca 8 (Trợ năng Mobile Bộ tham chiếu A trên iPhone 11 Pro Max thật và Android Emulator).
    - Khi đạt, ký nhận hoàn tất Mobile Delivery Gate sẵn sàng trình nghiệm thu độc lập (phụ thuộc `T056`, `T057`, `T063`, `T065`).
- [ ] T067 **Cổng Tổng kết & Bàn giao Đánh giá Cuối cùng (Final Acceptance Gate)** qua biên bản `docs/05-specs/007-customer-registration/verification/final-acceptance-report.md`:
    - Tổng hợp hồ sơ nghiệm thu kỹ thuật của cả Customer Web và Customer Mobile.
    - Xác nhận phân định rạch ròi các mốc: Đã lập trình $\rightarrow$ Kiểm thử đạt $\rightarrow$ Review độc lập $\rightarrow$ Nghiệm thu kỹ thuật $\rightarrow$ Sẵn sàng xin phê duyệt phát hành từ Chủ sản phẩm (chưa tự ý kích hoạt phát hành production) (phụ thuộc `T065`, `T066`).

---

## Quan hệ Phụ thuộc (Dependencies) & Khả năng Song song hóa

### Trật tự Phụ thuộc Giữa các Giai đoạn (Phases)
1. **Phase 1 (Hợp đồng dùng chung)**: Khởi tạo schema Zod 4, types và xuất JSON Schema. Cung cấp contracts cho Backend, Web, Mobile và Agent Service.
2. **Phase 2 (Nền tảng & Hạ tầng kiểm thử cô lập)**: Phụ thuộc vào Phase 1. Khởi tạo Identity package/entrypoint, DB schemas, migrations, test stack Docker Compose, Debezium connector, Kafka topics, Redis rate limiter, và test runners. **BLOCKS toàn bộ các User Stories phía sau**.
3. **Phase 3 (User Story 1 — Happy Path Backend & Web)**: Phụ thuộc vào Phase 2 hoàn tất. Triển khai cốt lõi đăng ký Identity, transaction 4 bảng nguyên tử, CDC consumer tại Cinema Core, và UI form đăng ký cơ bản trên Web.
4. **Phase 4 (User Story 2 — Email Trùng & Đầu vào Không Hợp lệ)**: Phụ thuộc vào Phase 3 (kế thừa `RegisterCustomerUseCase` và `RegisterView.tsx`). Triển khai anti-enumeration, dummy timing, rate limiting và xử lý lỗi Web BFF.
5. **Phase 5 (User Story 3 — Chính sách Mật khẩu & Bảo vệ Bí mật)**: Phụ thuộc vào Phase 3 và Phase 4. Tích hợp Blocklist fail-secure, Password Guide Indicator, Show/Hide toggle, và Sentinel secrets test.
6. **Phase 6 (User Story 4 — Customer Mobile Native)**: Phụ thuộc vào Phase 1 (contracts) và Phase 2 (test stack/backend API). Có thể triển khai độc lập song song với Phase 4 và Phase 5 sau khi hoàn thành Phase 3.
7. **Phase 7 (Kiểm chứng Toàn diện & Gates)**:
   - Web Delivery Gate (`T065`) chỉ được kích hoạt sau khi hoàn thành Phase 1, Phase 2, Phase 3, Phase 4, Phase 5 và các kịch bản kiểm chứng áp dụng cho Web/Backend. Web Gate **hoàn toàn không phụ thuộc vào bất kỳ task nào của Customer Mobile**.
   - Mobile Delivery Gate (`T066`) được kích hoạt sau khi hoàn thành Phase 6 và các kiểm chứng Mobile tương ứng.

### Cơ hội Triển khai Song song (Parallel Opportunities)
- **Trong Phase 1**: `T002`, `T003`, `T004`, `T005` phân rã tuần tự hợp đồng; `T006` (Python) và `T007` (scripts) chạy song song sau `T005`.
- **Trong Phase 2**:
  - Nhóm khởi tạo sau `T008`: `T009` (DB client), `T011` (Identity schema), `T012` (UUIDv7 utility), `T015` (dataset blocklist) chạy song song; `T014` (Cinema Core schema), `T016` (Docker test stack cô lập) và `T020` (IP forwarding) có thể triển khai song song độc lập.
  - `T010` (Fastify entrypoint) triển khai sau khi `T009` hoàn thành.
  - Nhóm cấu hình sau hạ tầng Docker test stack `T016`: `T017` (Debezium CDC), `T018` (Kafka topics), `T019` (Redis Lua rate limiter), `T022` và `T023` (test runners) có thể triển khai song song.
- **Trong Phase 3 (US1)**:
  - Backend (`T024`–`T028`), Web BFF & UI (`T029`–`T032`), và Cinema Core Consumer (`T033`–`T036`) có thể triển khai song song bởi 3 nhóm độc lập sau khi có contract `T003`.
  - Trong luồng Web: Web BFF Helper (`T029`) được hoàn thành trước khi Route Handler (`T030`) và UI Form (`T031`, `T032`) tích hợp.
- **Trong Phase 6 (US4 - Mobile)**:
  - Nhóm Mobile có thể bắt đầu scaffold (`T050`) và UI components (`T051`–`T055`) ngay khi có Phase 1 và Phase 3 Backend API mà không cần chờ Phase 5 Web UI hoàn tất.
- **Trong Phase 7**:
  - Các ca kiểm chứng Quickstart (`T058`, `T059`, `T060`, `T061`, `T062`, `T064`) có thể chạy song song trên môi trường test stack cô lập.

---

## Chiến lược Nghiệm thu & Phân kỳ Triển khai (Delivery Strategy & Gates)

Tuân thủ nghiêm ngặt **FR-020** và **SC-008**:
1. **Chặng 1 (Backend & Web MVP — US1, US2, US3)**:
   - Hoàn thành đầy đủ Phase 1, Phase 2, Phase 3, Phase 4, Phase 5.
   - Chạy các cổng kiểm thử: Quickstart Ca 1..5, Ca 6 (A-02 Web matrix), Ca 7 (F4), Ca 8 (Trợ năng Web Bộ tham chiếu A), k6 performance test timing < 15%.
   - **Ký nhận Cổng Nghiệm thu Độc lập cho Web (`T065`)**: Web đủ điều kiện nghiệm thu độc lập và demo cho Chủ sản phẩm mà không bị phụ thuộc vào tiến độ của Customer Mobile.
2. **Chặng 2 (Mobile App — US4)**:
   - Hoàn thành Phase 6 (Mobile React Native).
   - Chạy các cổng kiểm thử: Quickstart Ca 6 (A-02 Mobile matrix), Ca 8 (Trợ năng Mobile Bộ tham chiếu A: VoiceOver trên iPhone 11 Pro Max thật, TalkBack trên Android Emulator).
   - **Ký nhận Cổng Nghiệm thu Độc lập cho Mobile (`T066`)**: Mobile đủ điều kiện nghiệm thu độc lập.
3. **Chặng 3 (Cổng Tổng kết & Bàn giao Đánh giá Cuối cùng — Phase 7)**:
   - Đối chiếu toàn bộ 21 Yêu cầu Chức năng (FR-001…FR-021), 9 Tiêu chí Thành công (SC-001…SC-009), 7 Tiêu chí Mật khẩu (PWD-001…PWD-007), và 8 Ca Quickstart.
   - Bàn giao hồ sơ nghiệm thu kỹ thuật hoàn chỉnh cho Chủ sản phẩm để xem xét quyết định phát hành chính thức (`T067`).
