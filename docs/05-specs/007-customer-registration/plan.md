# Implementation Plan: A-01 — Đăng ký tài khoản khách hàng (Customer Registration)

**Branch**: `docs/customer-registration` | **Date**: 2026-11-21 (cập nhật hoàn thiện toàn diện theo review vòng 5 ngày 2026-11-22) | **Spec**: [spec.md](spec.md) (v0.3.2 Draft đã pass review, SHA-256: `162F68FB4017802FFF9B77042AE70F67D2696609D1D69A6C0CBB8F9C47829642`)

**Input**: Feature specification from `docs/05-specs/007-customer-registration/spec.md`, [sources.md](sources.md) v0.3.2, và hai quyết định đã được Chủ sản phẩm phê duyệt ngày 2026-11-21:
- **Quyết định 1 (FR-007)**: Phương án B — Phản hồi trung tính chống Account Enumeration theo khuyến nghị OWASP.
- **Quyết định 2 (FR-012)**: Phương án A — Không cấp phiên đăng nhập tự động, hiển thị màn hình tiếp nhận hướng dẫn A-02 và bộ nút điều hướng đồng nhất.

---

## Summary

Triển khai tính năng Đăng ký tài khoản khách hàng bằng Email và Mật khẩu dùng chung cho **Customer Web** (Next.js 16) và **Customer Mobile** (Expo / React Native) với các giải pháp kỹ thuật đã được hòa giải chính xác và chặt chẽ:
- **Identity Service & ACID Transaction (PL1, PL4)**: Identity Service sở hữu duy nhất tài khoản người dùng (`users`), thông tin xác thực (`accounts`), và gán duy nhất vai trò `CUSTOMER` (`user_role_assignments`). Toàn bộ 4 bảng (`users`, `accounts`, `user_role_assignments`, `outbox_events`) được ghi nguyên tử trong **cùng 1 transaction PostgreSQL**. Thống nhất kiểu dữ liệu ID là **`UUID`** canonical 36 ký tự (UUIDv7). Thống nhất duy nhất endpoint backend Identity Service là **`POST /api/v1/identity/register`**.
- **Tích hợp Better Auth & Tương thích A-03 (PL1)**: Thư viện `better-auth ^1.1.0` với Drizzle adapter (`drizzleAdapter`). Trường `accounts.account_id` lưu đúng `user.id` (stable user ID) theo chuẩn Better Auth cho credential provider. Cột mật khẩu trong DB là `password_hash` được ánh xạ qua field mapping `{ account: { fields: { password: "password_hash" } } }`. Cấu hình `emailAndPassword.disableSignUp: true` để **vô hiệu hóa hoàn toàn route mặc định `POST /api/auth/sign-up/email`**, ngăn chặn việc gọi tắt bỏ qua Application Validation, bỏ qua cấp vai trò `CUSTOMER` hoặc bỏ qua Transactional Outbox. Cấu hình `autoSignIn: false` (không tạo session token tự động theo FR-012 Phương án A). Cấu hình tùy biến `password.hash` và `password.verify` sử dụng `@node-rs/argon2` kèm chuẩn hóa Unicode NFC tại cả 2 đầu, lưu chuỗi băm chuẩn MCF (`$argon2id$v=19$m=65536,t=3,p=1$...`), bảo đảm tương thích 100% với hàm xác thực của luồng đăng nhập A-03 sau này thông qua adapter chính thức của Better Auth (truy vấn user và credential account qua `adapter.findOne`, trích xuất chuỗi băm tự động qua model mapping, xác minh NFC/NFD/wrong password, và có ca đối chứng phát hiện lỗi khi cấu hình mapping sai). Custom endpoint `POST /api/v1/identity/register` quản lý toàn bộ luồng đăng ký.
- **Pipeline Outbox CDC, DLQ, Reconciliation và Ranh giới B-02 (PL2)**: Hòa giải chuẩn theo ADR-0007: Transactional Outbox $\rightarrow$ Debezium PostgreSQL Connector (WAL) $\rightarrow$ Apache Kafka KRaft topic `identity.customer-registered` $\rightarrow$ Cinema Core Consumer. Thống nhất định danh sự kiện: `eventType: 'CUSTOMER_REGISTERED'`, `eventVersion: 'v1'`, topic `identity.customer-registered` (và `identity.customer-registered.dlq`), aggregate type `'USER'`. Core ghi nhận hội viên với `points_balance = 0.00` kiểu `DECIMAL(10,2)` (PL4) và xử lý idempotent bằng `ON CONFLICT (user_id) DO NOTHING`. Bỏ hoàn toàn lập luận coi xác minh email là bảo đảm hội viên đã sẵn sàng ở Core. Phân định rõ 3 trạng thái: `Identity-created` (thẩm quyền Identity Service), `membership-pending` (thẩm quyền Cinema Core), `membership-ready` (thẩm quyền Cinema Core). Thẩm quyền duy nhất về `loyalty_members` thuộc Cinema Core. Làm rõ: Đề xuất On-demand Core Provisioning khi B-02 giữ ghế (qua internal API `GET /api/v1/internal/users/:id` do Identity cung cấp) là đề xuất kiến trúc phụ thuộc đang chờ Chủ sản phẩm phê duyệt tại tài liệu use case B-02, không phải quyết định mặc nhiên của A-01. Phân định rõ 5 trạng thái vòng đời tin nhắn: Consumer chỉ commit source offset khi Core DB commit thành công hoặc sau khi tin nhắn lỗi được ghi nhận bền vững vào DLQ topic (`identity.customer-registered.dlq`, `acks=all`). Cinema Core Background Service định kỳ chạy Reconciliation Audit Job gọi internal API `GET /api/v1/internal/users/reconciliation` để bù đắp hội viên thiếu > 1 giờ.
- **Xử lý Cạnh tranh và Anti-enumeration (PL3)**: Áp dụng thứ tự: Wire validation $\rightarrow$ Email normalization & canonical check $\rightarrow$ PWD-004 blocklist check $\rightarrow$ Query DB $\rightarrow$ Dummy hash (nhánh trùng) hoặc Argon2id hash + DB transaction (nhánh mới). Khi có 2 request gửi đồng thời cùng email, request thứ hai gặp lỗi Unique Constraint `users_email_unique` (`23505`) được server bắt và rollback an toàn, trả về HTTP 200 `RegisterResponse` tiếp nhận trung tính, 0% bị lỗi HTTP 500 hay ghi đè dữ liệu.
- **Đơn giản hóa Retry (PL3)**: Bỏ cơ chế Idempotency-Key và cache Redis phức tạp; tận dụng cơ chế xử lý email trùng lặp tự nhiên theo Phương án B để bảo đảm an toàn idempotent khi client retry sau timeout. Kế hoạch đo lường cân bằng thời gian (Timing Equalization) được thiết kế bằng kiểm định thống kê k6 trên môi trường Staging.
- **Ranh giới Wire Schema vs Application Normalization (PL5 & ADR-0014)**:
  + Wire schema là pure structural schema xuất sạch sang JSON Schema Draft-07 (`target: 'draft-07'`, `io: 'input'`) qua native **`z.toJSONSchema()` của Zod 4** cho Python Pydantic v2 (ADR-0014). Loại bỏ hoàn toàn thư viện ngoài `zod-to-json-schema`. Áp dụng cú pháp thông báo lỗi chuẩn Zod 4 `{ error: '...' }` (loại bỏ `required_error` của Zod 3).
  + Khắc phục triệt để lỗi hồi quy email có khoảng trắng (US2 Scenario 2): Wire schema chỉ kiểm tra chuỗi thô có độ dài 1–254 ký tự (không gọi `.email()` hay `.trim()` ở Wire). Tầng Application thực thi chuẩn hóa tường minh: trim họ tên (bắt lỗi `FULL_NAME_REQUIRED` nếu rỗng), trim và lowercase email rồi kiểm tra định dạng email canonical hòa giải chuẩn xác với Validator mặc định của Better Auth (v1.1.x+) và Zod standard email validator (`CANONICAL_EMAIL_REGEX`: loại bỏ hoàn toàn địa chỉ có dấu chấm ở đầu, cuối, hoặc hai dấu chấm liên tiếp trong local-part như `.alice@example.com`, `alice..bob@example.com`, `alice.@example.com`, đồng thời từ chối ký tự `!` như `a!b@example.com` và TLD 1 ký tự như `a@example.c`; nếu sai báo lỗi `INVALID_EMAIL_FORMAT`), chuẩn hóa Unicode NFC mật khẩu, đếm 15–128 Unicode code points và đối khớp blocklist. Bảo đảm 100% email được A-01 tiếp nhận đều hợp lệ trong luồng đăng nhập A-03. Wire schema giới hạn mật khẩu thô max 1024 ký tự chống DoS. Sửa regex số điện thoại `^(0|\+84)[35789][0-9]{8}$`. Đặt tên DTO mới là `CustomerRegisterRequest`, loại bỏ hoàn toàn alias `RegisterRequest`. Thiết kế bộ test fixture đối chiếu chung giữa TS và Python.
- **Chính sách Mật khẩu PWD-004 / PWD-007 (PL6)**: Chốt thư viện `@node-rs/argon2` với cấu hình chuẩn duy nhất $m=64\text{ MiB} (65536\text{ KiB}), t=3, p=1$, salt 16 bytes. Dataset blocklist PWD-004 được kiểm chứng và ghim chính xác: SecLists `10-million-password-list-top-100000.txt` (commit snapshot bất biến `45499242ec0164c7f91cbcf8bd509404fc0b99f3`, tag `2024.4` chính thức ngày 2024-11-20, MIT License, SHA-256 tính trực tiếp từ bytes thực tế: `E30E15FAECC8DB2D3181C3126E3B2C0CD5C187AF10A5E4E83BABFA157EDAB188`, tổng cộng 100007 dòng). Fixture xác thực thuộc dataset: `123456789123456789` (dòng 12960, 18 ký tự). Tệp nội bộ `vietnamese-common-passwords.txt` có manifest UTF-8 không BOM. Áp dụng nguyên tắc Fail-Secure: server dừng khởi động (exit 1) hoặc trả về HTTP 503 nếu thiếu hoặc sai lệch tệp blocklist; validator phía server bắt buộc có hàm kiểm tra blocklist.
- **Ranh giới Rate Limiting, Atomic Redis và Xác thực IP Chuyển tiếp (PL7)**: Chốt duy nhất thuật toán **Atomic Fixed Window Counter** với cửa sổ 15 phút cố định trên Redis qua **Lua script nguyên tử** (thực thi `INCR` và `EXPIRE 900` trong cùng một giao dịch, loại bỏ triệt để khoảng lỗi tạo key vĩnh viễn không có TTL). Khi Redis gặp sự cố, áp dụng cơ chế **Best-effort Degraded Local Rate Limiting under Monitoring Alert** (kích hoạt LRU cache trong RAM; mức $N \times 5$ requests là ước lượng trong điều kiện lý tưởng, đánh đổi có chủ đích giữa Availability và Strict Quota khi phân vùng Redis; phát cảnh báo Alert P2 và log mức ERROR). Cấu hình Fastify `trustProxy` chuẩn CIDR: `trustProxy: ['127.0.0.1/32', '::1/128', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16']`. Xác thực IP chuyển tiếp từ Web BFF chặt chẽ: Kiểm tra direct TCP peer `request.raw.socket.remoteAddress` bằng CIDR toán học đa họ (chỉ gọi match khi cùng họ IPv4/IPv6, không bị dừng đột ngột), xác thực `X-Internal-Service-Key` bằng `crypto.timingSafeEqual` (ngăn lỗi `undefined === undefined`), kiểm tra tính đơn trị và định dạng IP hợp lệ (`net.isIP`) của `X-Original-Client-IP`. Bổ sung hợp đồng lỗi chuyển tiếp nội bộ `InternalForwardingErrorResponseSchema` (`UNAUTHORIZED_INTERNAL_CALL`, `MALFORMED_FORWARDED_IP`); Web BFF phân định lỗi dựa trên **CẢ HTTP status VÀ payload schema/code** (giữ nguyên HTTP 400 cho lỗi nhập liệu của người dùng như `PWD_LENGTH_INVALID`, `PASSWORD_IN_BLOCKLIST`, `INVALID_EMAIL_FORMAT`; chuyển đổi 401/400 nội bộ và phản hồi dị thường thành HTTP 500 `INTERNAL_ERROR` cho browser client với log metadata an toàn theo allowlist, tuyệt đối không log raw body/secrets theo FR-013, SC-005, PWD-006, tuyệt đối không gửi 401 ra ngoài; giữ nguyên 429 và `Retry-After`). Mobile lấy IP client trực tiếp qua Edge Proxy (`request.ip`). Test override chỉ kích hoạt khi `NODE_ENV === 'test' && ENABLE_TEST_IP_OVERRIDE === 'true'`. Codebase tuân thủ Node `>=24.19.0 <25`. Customer Web sử dụng CSS Modules và tokens vanilla CSS (**loại bỏ hoàn toàn Tailwind CSS**). Dùng đúng routes hiện hữu `/auth/login`, `/auth/forgot-password`, `/auth/register`. Giữ regression suite `node:test` của repo; thiết kế suite mới theo ADR-0021.
- **Kịch bản Kiểm chứng Tái hiện được (PL8)**: Tài liệu `quickstart.md` bao phủ đầy đủ **8 kịch bản kiểm chứng** với hướng dẫn bootstrap stack cô lập dự kiến (cổng 5433 cho Identity DB, cổng 5434 cho Core DB, 6380 cho Redis, 9093 cho Kafka KRaft, 8084 cho Debezium), dải IP test giả lập (`X-Test-Client-IP`), kiểm chứng định dạng email canonical tương thích Better Auth / Zod (loại bỏ `.alice@`, `alice..bob@`, `alice.@`, `a!b@`, `a@example.c`), kiểm chứng bộ đếm nguyên tử và TTL trên Redis qua Lua script, kiểm chứng CIDR đa họ và phân định lỗi nhập liệu vs lỗi chuyển tiếp BFF qua bảng đối chứng 7 ca (kèm ca kiểm chứng an toàn sentinel secrets chống rò rỉ log/telemetry), kiểm chứng tương thích A-03 qua Better Auth adapter chính thức (tìm user và account qua `adapter.findOne`, trích xuất tự động `password_hash` được ánh xạ thành `account.password`, kiểm tra Argon2id NFC/NFD/wrong password, kèm ca đối chứng mapping sai để chứng minh harness phát hiện lỗi mapping thay vì truyền hash thủ công), khôi phục ca PWD-TC-02 đúng 15 code points `ChuyenTau#2026V`, sửa đúng độ dài `matkhau123456789` (16 code points), fixture emoji 26 code points `Xem phim cuoi tuan 🎬🍿 2026`, ma trận A-02 ba trạng thái, kịch bản lỗi hệ thống F4 ba ca, kịch bản DLQ/reconciliation, tác dụng phụ DB và header `Set-Cookie` vắng mặt.

---

## Technical Context

**Language/Version**: TypeScript 5+, Node.js `>=24.19.0 <25` (theo `package.json` thực tế của repo), React `19.3.1` (Web), React Native 0.76+ / Expo SDK 52+ (Mobile).

**Primary Dependencies & Frameworks**:
- Identity Service Backend: Fastify (Node.js microservice), Better Auth `^1.1.0` (ADR-0008, cấu hình core engine `disableSignUp: true`, `autoSignIn: false`, custom Argon2id hasher/verifier, adapter field mapping), `@node-rs/argon2` (PWD-007), Drizzle ORM + driver `postgres` (`postgres.js`).
- Cinema Core Backend: NestJS + Fastify + Drizzle ORM (ADR-0005, ADR-0036).
- Event Pipeline: Debezium PostgreSQL Connector (Kafka Connect) + Apache Kafka KRaft (ADR-0007).
- Shared Contracts: Zod 4 (`packages/contracts`, ADR-0014, native `z.toJSONSchema()`, wire schemas không chứa transform, application validation riêng biệt).
- Customer Web Frontend: Next.js `16.4.5` (App Router), Lucide React, CSS Modules (`*.module.css`) + Design tokens CSS (`src/styles/tokens.css`, `src/styles/globals.css`). **Gạch bỏ hoàn toàn Tailwind CSS**.
- Customer Mobile Frontend: React Native / Expo Router (ADR-0016), React Native Reanimated.
- Rate Limiting: Fixed Window Counter qua Redis; Best-effort Degraded Local Rate Limiting under Monitoring Alert khi Redis gián đoạn.

**Storage**:
- Identity Service DB (PostgreSQL): Bảng `users`, `accounts`, `user_role_assignments`, `outbox_events`.
- Cinema Core DB (PostgreSQL): Bảng `loyalty_members`.
- Cụm Kafka KRaft: Topic `identity.customer-registered` và DLQ `identity.customer-registered.dlq`.

**Testing Strategy (Hòa giải theo ADR-0021 và hiện trạng repo)**:
- Regression Suite hiện có: Tiếp tục duy trì chạy bằng `node:test` (`node --test "tests/*.test.ts"`).
- Suite mới (theo lộ trình ADR-0021):
  + Logic & Unit tests mới: **Vitest** (cho pure TS logic, password validator, contracts, cross-language fixtures).
  + Web Client Components: **React Testing Library** (cho form và màn hình kết quả).
  + Mobile Native: **Jest + jest-expo + React Native Testing Library**.
  + E2E & Trợ năng: **Playwright** kết hợp `@axe-core/playwright`.
  + Tải & Đo cân bằng thời gian (Timing equalization): **k6 OSS**.
  + Trợ năng thủ công: Bộ tham chiếu A (Windows Narrator + Edge, Safari/VoiceOver trên iPhone 11 Pro Max thật, TalkBack trên Android emulator).

**Target Platform & Routes**:
- Web Desktop & Mobile: Edge / Chrome trên Windows, Safari trên iPhone 11 Pro Max thật.
  + Routes hiện có: `/auth/login`, `/auth/forgot-password`, `/auth/register` (tương ứng `src/app/(cinema)/auth/...`).
- Mobile Native: iOS (iPhone 11 Pro Max thật), Android (Android Emulator có Accessibility Suite).

**Performance Goals & Constraints**:
- Thời gian phản hồi API p95 $< 1.5\text{ s}$ trong điều kiện mạng tiêu chuẩn (SC-001, NFR-PERF-01).
- Chênh lệch phân bố thời gian phản hồi giữa 2 nhánh (mới vs trùng) $< 15\%$ ở phân vị p50 và p95 (chống side-channel timing attack).
- Tuân thủ PWD-001..004, PWD-006 (0 trường hợp log plaintext).
- Ranh giới kiến trúc: Không gọi SQL chéo, không distributed transaction; đồng bộ qua Outbox CDC.

---

## Constitution Check

*GATE: Đánh giá tuân thủ 5 nguyên tắc cốt lõi của Constitution v2.0.1 trước và sau thiết kế.*

| Nguyên tắc / Ranh giới | Tình trạng | Đánh giá tuân thủ chi tiết |
|---|---|---|
| **I. Cinema Core as Single Source of Truth** | **PASS** | Identity Service sở hữu tài khoản; Cinema Core sở hữu module Hội viên (`loyalty_members`). Thẩm quyền trạng thái hội viên thuộc duy nhất Cinema Core. Không gọi SQL chéo, không transaction phân tán; đồng bộ bất đồng bộ qua Transactional Outbox + Debezium CDC + Kafka KRaft (ADR-0007) với xử lý idempotent `ON CONFLICT (user_id) DO NOTHING`, DLQ và Reconciliation Audit Job (PL2). Đề xuất On-demand Core Provisioning khi B-02 giữ ghế được ghi nhận đúng là đề xuất kiến trúc phụ thuộc chờ duyệt tại B-02, không phải quyết định mặc nhiên của A-01. |
| **II. Conversational Booking Safety Boundary** | **PASS** | Tính năng đăng ký nằm hoàn toàn ngoài Agent service; tài khoản mới có `emailVerified = false` bị chặn giao dịch giữ ghế B-02 và mua vé B-05 (BR-02). |
| **III. Monorepo Type Safety & Shared Contracts** | **PASS** | Hợp đồng DTO `CustomerRegisterRequest`, `RegisterResponse`, `RegisterClientErrorResponse`, `RegisterSystemErrorResponse`, và event `CustomerRegisteredEvent` được định nghĩa bằng Zod 4 wire schema sạch tại `contracts/auth-registration.contract.ts` (không chứa `.trim()`, `.toLowerCase()` hay `.email()` ở wire schema; cú pháp error Zod 4), sẵn sàng xuất JSON Schema Draft-07 sang Pydantic v2 theo ADR-0014 qua native `z.toJSONSchema()`; chuẩn hóa và canonical validation được tách bạch rõ ràng ở tầng Application (PL5). |
| **IV. Design System Consistency (Ferrari Dark Cinema)** | **PASS** | Giao diện form và màn hình tiếp nhận trung tính tuân thủ bảng màu `#000000`, `#181818`, `#DA291C`, typography uppercase tracked, và hairline borders qua CSS Modules và tokens vanilla CSS của repo (PL7). |
| **V. Verification Before Completion** | **PASS** | Xây dựng tài liệu kiểm chứng runnable chi tiết tại `quickstart.md` bao phủ 8 kịch bản (happy path, anti-enumeration cạnh tranh có email khoảng trắng thô, ma trận mật khẩu PWD-001..004 & fail-secure, tương thích Better Auth/A-03 verifier, pipeline Outbox CDC/DLQ/reconciliation, ma trận A-02 ba trạng thái, xử lý lỗi hệ thống F4 ba ca, trợ năng Bộ tham chiếu A). Phân định rõ lệnh hiện hữu và lệnh dự kiến bootstrap; có cấu hình môi trường test cô lập (PL8). |

---

## Project Structure

### Documentation (Feature Artifacts)

```text
docs/05-specs/007-customer-registration/
├── spec.md                  # Feature Specification v0.3.2 (Draft đã pass review - BẢO TOÀN)
├── sources.md               # Nguồn thẩm quyền, dấu kiểm SHA-256 và delta đối chiếu
├── plan.md                  # This file (Implementation Plan - Đã cập nhật hoàn thiện theo review vòng 5)
├── research.md              # Phase 0 output: Nghiên cứu Better Auth, Outbox CDC, PWD-007, timing attack, DLQ, SecLists
├── data-model.md            # Phase 1 output: Thực thể Identity, Outbox, Cinema Core loyalty_members, vòng đời hội viên
├── quickstart.md            # Phase 1 output: 8 kịch bản kiểm chứng runnable validation độc lập và Docker test stack
├── contracts/               # Phase 1 output: Đặc tả hợp đồng API và schemas
│   ├── auth-registration.contract.ts  # Zod wire schemas, DTOs & application validation functions, cross-lang fixtures
│   └── endpoints.md                   # HTTP REST endpoints, headers, internal APIs & response codes
└── checklists/              # Checklists rà soát chất lượng
    ├── requirements.md      # Checklist chất lượng yêu cầu v0.3.2
    └── password-policy.md   # Checklist chính sách mật khẩu v0.3.2
```

### Source Code Layout (Real paths trong Monorepo)

```text
packages/contracts/
└── src/
    └── auth/
        ├── registration.ts        # Ánh xạ từ contracts/auth-registration.contract.ts (CustomerRegisterRequest)
        ├── types.ts               # Codebase DTOs hiện hữu (RegisterRequest cũ được đánh dấu @deprecated)
        └── index.ts

services/identity-service/
├── src/
│   ├── domain/
│   │   ├── user.entity.ts         # Logic thực thể users, accounts, user_role_assignments
│   │   └── password-hasher.ts     # Triển khai Argon2id theo chuẩn PWD-007 (@node-rs/argon2, m=64MB, t=3, p=1)
│   ├── application/
│   │   ├── register-customer.usecase.ts # Xử lý transaction 4 bảng nguyên tử, timing equalization, dummy hash
│   │   ├── normalize-register-input.ts  # Chuẩn hóa họ tên, email, phone theo ranh giới PL5
│   │   └── password-validator.ts  # validateCustomerPasswordServer (NFC 15-128 và blocklist SecLists 100k)
│   ├── infrastructure/
│   │   ├── auth/
│   │   │   └── better-auth.ts     # Cấu hình Better Auth (disableSignUp: true, autoSignIn: false, custom hash/verify)
│   │   ├── db/
│   │   │   ├── schema.ts          # Schema PostgreSQL Drizzle (UUIDv7 canonical, role_code = 'CUSTOMER')
│   │   │   └── migrations/        # Migration tạo users, accounts, roles, outbox_events
│   │   ├── rate-limiter.ts        # Fixed Window Counter qua Redis; Best-effort Degraded Local Rate Limiting
│   │   └── blocklist-loader.ts    # Nạp SecLists 100k vào Set<string> (fail-secure dừng khởi động nếu thiếu)
│   └── presentation/
│       └── http/
│           ├── register.controller.ts     # Custom Endpoint POST /api/v1/identity/register (Fastify)
│           ├── user-internal.controller.ts # Internal API GET /api/v1/internal/users/:id
│           └── reconciliation.controller.ts # Internal API GET /api/v1/internal/users/reconciliation
├── data/
│   ├── 10-million-password-list-top-100000.txt # Dataset SecLists ghim commit 45499242... (SHA-256: E30E15FA...)
│   └── vietnamese-common-passwords.txt         # Dataset bổ sung nội bộ tiếng Việt (UTF-8 no BOM)
└── tests/
    ├── unit/
    │   ├── password-hasher.test.ts
    │   └── password-validator.test.ts
    └── integration/
        └── register-flow.test.ts

services/cinema-core/
├── src/
│   └── loyalty/
│       ├── handlers/
│       │   └── customer-registered.consumer.ts # Kafka consumer nhận sự kiện CUSTOMER_REGISTERED v1, insert loyalty_members, DLQ
│       ├── jobs/
│       │   └── reconciliation-audit.job.ts     # Cron job gọi API Identity bù đắp hội viên thiếu > 1h
│       └── infrastructure/
│           └── loyalty.schema.ts               # Bảng loyalty_members (points_balance DECIMAL(10,2))
└── tests/
    └── loyalty/
        └── customer-registered.consumer.test.ts

apps/customer-web/
├── src/
│   ├── app/
│   │   ├── (cinema)/
│   │   │   └── auth/
│   │   │       ├── register/
│   │   │       │   └── page.tsx       # Route đăng ký hiện hữu (/auth/register)
│   │   │       ├── login/
│   │   │       │   └── page.tsx       # Route đăng nhập hiện hữu (/auth/login)
│   │   │       └── forgot-password/
│   │   │           └── page.tsx       # Route khôi phục mật khẩu (/auth/forgot-password)
│   │   └── api/
│   │       └── auth/
│   │           └── register/
│   │               └── route.ts       # Next.js BFF Route proxy tới POST /api/v1/identity/register (forward X-Original-Client-IP)
│   ├── features/
│   │   └── auth/
│   │       ├── components/
│   │       │   ├── RegisterView.tsx             # Form đăng ký thật (thay thế mock cũ)
│   │       │   ├── RegisterView.module.css      # CSS Modules (bản sắc Ferrari Dark Cinema)
│   │       │   ├── UnifiedRegistrationSuccess.tsx # Màn hình tiếp nhận trung tính duy nhất (3 nút)
│   │       │   └── PasswordGuideIndicator.tsx    # Chỉ báo hướng dẫn mật khẩu chuẩn PWD
│   │       └── model/
│   │           └── register-form.schema.ts      # Client validation bằng Zod (CustomerRegisterRequestSchema)
│   └── styles/
│       ├── tokens.css                 # Ferrari Dark Cinema tokens (#000000, #181818, #DA291C)
│       └── globals.css
└── tests/
    └── auth-flow.test.ts              # Suite test hồi quy node:test hiện hữu của repo

apps/customer-mobile/
└── src/
    └── features/
        └── auth/
            ├── screens/
            │   └── RegisterScreen.tsx         # Màn hình đăng ký React Native / Expo
            ├── components/
            │   ├── MobilePasswordInput.tsx     # Hỗ trợ iOS/Android Autofill & ẩn/hiện mật khẩu
            │   └── MobileRegistrationSuccess.tsx # Màn hình tiếp nhận trung tính mobile
            └── hooks/
                └── useRegisterMutation.ts
```

**Structure Decision**:
Kiến trúc Monorepo phân tách rạch ròi: Shared Contracts tại `packages/contracts`, Backend Identity logic tại `services/identity-service`, Cinema Core consumer tại `services/cinema-core`, Web client tại `apps/customer-web`, và Mobile client tại `apps/customer-mobile`. Phân kỳ triển khai: Hoàn thành và nghiệm thu backend Identity, event pipeline Core và `apps/customer-web` trước, sau đó phát triển `apps/customer-mobile`.

---

## Complexity Tracking

> **Đánh giá vi phạm Constitution Check (No violations detected)**

*Không có vi phạm nguyên tắc Constitution nào cần biện minh*:
- Không dùng giao dịch phân tán xuyên database; sử dụng Transactional Outbox + Debezium CDC + Kafka KRaft theo ADR-0007.
- Không gọi SQL chéo giữa Identity và Cinema Core; đối soát và On-demand Provisioning qua internal API phân trang.
- Không cấp quyền tự động cho Agent hoặc cấp session token unauthenticated sai ranh giới (tuân thủ FR-012 Phương án A).
- Không tự ý thiết kế vai trò vận hành ngoài phạm vi (chỉ cấp duy nhất `CUSTOMER`).

---

## Post-Design Constitution Re-Check

*GATE: Đánh giá lại toàn bộ thiết kế sau khi xử lý 6 findings của review vòng 5.*

1. **Ranh giới chủ dữ liệu**: Bảo đảm 100% theo [data-model.md](data-model.md). Identity Service quản lý `users`, `accounts` (với `account_id = user.id`, mapping `password: password_hash`), `user_role_assignments` (`role_code = 'CUSTOMER'`), và `outbox_events`. Cinema Core quản lý `loyalty_members` (`points_balance DECIMAL(10,2)`). Thẩm quyền trạng thái hội viên thuộc duy nhất Cinema Core. Đề xuất On-demand Core Provisioning khi B-02 giữ ghế được ghi nhận đúng là đề xuất phụ thuộc chờ duyệt tại B-02.
2. **Hợp đồng công khai & ADR-0014**: Bảo đảm 100% theo [contracts/auth-registration.contract.ts](contracts/auth-registration.contract.ts). Wire schema cấu trúc thuần túy (không chứa `.trim()`, `.toLowerCase()`, không gọi `.email()` tại wire schema; cú pháp error Zod 4), giới hạn thô email max 254 ký tự (tiếp nhận chuỗi có khoảng trắng theo US2 Scenario 2), giới hạn thô mật khẩu max 1024 ký tự chống DoS, sẵn sàng xuất sạch sang JSON Schema Draft-07 cho Python Pydantic v2 qua native `z.toJSONSchema()`. Chuẩn hóa chuỗi và kiểm tra domain canonical tách biệt ở Application Layer. Thống nhất endpoint duy nhất `POST /api/v1/identity/register` và event `CUSTOMER_REGISTERED` version `v1`.
3. **Dataset PWD-004 & Fail-Secure**: Ghim chính xác SecLists `10-million-password-list-top-100000.txt` (commit `45499242...`, SHA-256 `E30E15FA...`, MIT License, 100007 dòng). Fixture xác thực `123456789123456789` (18 ký tự). Tệp nội bộ có manifest tái tạo. Fail-secure dừng khởi động (exit 1) hoặc trả về HTTP 503.
4. **Kịch bản kiểm chứng**: Bảo đảm 100% theo [quickstart.md](quickstart.md). Đầy đủ **8 kịch bản kiểm chứng độc lập**, hướng dẫn bootstrap môi trường test cô lập, khôi phục ca PWD-TC-02 đúng 15 code points `ChuyenTau#2026V`, sửa đúng độ dài `matkhau123456789` (16 code points), fixture emoji 26 code points `Xem phim cuoi tuan 🎬🍿 2026`, ma trận A-02 ba trạng thái, kịch bản lỗi hệ thống F4 ba ca (lỗi trước commit, mất mạng sau commit, mất kết nối tại commit), kịch bản DLQ/reconciliation, kiểm tra verifier Better Auth trong A-03, tác dụng phụ DB và header `Set-Cookie` vắng mặt.
5. **Quyết định sản phẩm**: Bảo toàn 100% hai quyết định đã được Chủ sản phẩm duyệt (FR-007 Phương án B và FR-012 Phương án A).

Tài liệu `plan.md` đã được hoàn thiện đầy đủ và sẵn sàng bàn giao để Reviewer độc lập thẩm định lại trước khi Chủ sản phẩm ký duyệt Plan và cho phép chuyển sang bước phân rã công việc (`$speckit-tasks`).
