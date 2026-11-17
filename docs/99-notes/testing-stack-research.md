# Testing stack: runner TypeScript và bộ kiểm chứng xuyên nền tảng

Tra cứu 2026-11-17 bằng tài liệu chính thức và Context7. **Bundle A đã được chấp thuận tại
[ADR-0021](../06-decisions/0021-layered-testing-stack-for-platform.md).**
Các phần so sánh/đề xuất dưới đây giữ bối cảnh trước khi chốt; chưa cài đặt, migrate hoặc triển khai.
CI được chọn tiếp tại [ADR-0022](../06-decisions/0022-github-actions-buildx-and-ghcr-for-ci.md):
GitHub-hosted Linux VM runners, Buildx/BuildKit và GHCR; chưa tạo workflow/chạy CI/publish.
Đích: worktree `docs-tech-stack-decisions`, detached HEAD `8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.
Chỉ đọc docs/package scripts; không cài package, sửa code/config, chạy test/build/container, gọi LLM/provider/cloud hoặc tạo account.

## Hiện trạng và nguyên tắc chọn

[Web package](../../apps/web/package.json) dùng Node `>=24.19.0 <25`, `node --test "tests/*.test.ts"`;
[contracts](../../packages/contracts/package.json) dùng `node --test "tests/**/*.test.ts"`. Chưa chạy lại hoặc kết luận suites đang pass.
Giữ các suite/scripts hiện có; chọn runner mục tiêu không tự chuyển test, thay CI hoặc bỏ regression coverage.
Migration cần phạm vi/đối chiếu riêng, kể cả khi API Jest/Vitest tương tự. Type-check/build vẫn là kiểm tra khác với test execution.

## Ba hướng runner cho các suite TypeScript mới

| Hướng | Web/Organizer/Core/contracts | Mobile và Python chung | Điểm phù hợp / đánh đổi |
|---|---|---|---|
| **A. Vitest** | Vitest; React Testing Library cho DOM/client components; môi trường Node cho logic/Core/contracts. | `jest-expo` + React Native Testing Library; Python `pytest`. | Hợp Vite/ESM, Next có guide, Nest hiện có recipe chính thức. Cần config theo workspace; không giả định cùng transform cho Next và Nest. |
| **B. Jest** | Jest; React Testing Library cho DOM, `next/jest` khi phù hợp; transform/ESM/Nest theo package. | Cùng Mobile/Python như A. | Hệ sinh thái mock/preset đáng cân nhắc, dùng cùng họ runner với Mobile; vẫn có khác biệt config giữa React DOM, Expo và Core. Không gọi Jest lỗi thời/chậm hơn khi chưa đo. |
| **C. Giữ node:test + DOM/browser harness** | Giữ Node runner cho logic/API/contracts; thêm transform/DOM harness hoặc dùng browser tests cho UI. | Cùng Mobile/Python như A. | Tận dụng nền hiện có và Node built-ins; JSX/DOM/Nest metadata không tự có, phải sở hữu harness/integration tương ứng. Không mặc định loại pure logic tests. |

[Next Vitest guide](https://nextjs.org/docs/app/guides/testing/vitest), [Next Jest guide](https://nextjs.org/docs/app/guides/testing/jest),
[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/), [Node 24 TypeScript](https://nodejs.org/docs/latest-v24.x/api/typescript.html), [pytest](https://docs.pytest.org/en/stable/).
Node 24 type stripping không type-check, bỏ qua tsconfig-dependent behavior và không hỗ trợ `.tsx` trực tiếp; không suy từ test TS hiện có sang UI harness đầy đủ.
Vitest cũng transform TS để chạy chứ không tự thay `tsc`; Jest/runner nào được chọn cũng cần kiểm type-check riêng.
[Vitest testing types](https://vitest.dev/guide/testing-types).

## Giới hạn framework phải giữ đúng

- **Next.js 16 App Router:** guide hiện nói cả Vitest và Jest chưa hỗ trợ `async` Server Components;
  unit/component tests dành phần sync/client phù hợp, dùng E2E cho async RSC và luồng production build.
  Không render một client fixture rồi nhận là đã kiểm RSC, cookies/BFF, routing hoặc runtime Next.
- **NestJS/Fastify:** tài liệu hiện hành ghi **new projects dùng ESM được cấu hình Vitest**, ESM là default trong recipe SWC;
  không giữ giả định cũ “Nest luôn mặc định Jest”. Nest testing APIs vẫn runner-agnostic.
  Vitest cần kiểm SWC/decorator metadata, DI, aliases/ESM, setup/teardown và đúng version; recipe có `unplugin-swc`.
  Khởi tạo đúng **FastifyAdapter**, `app.init()` và adapter ready khi integration testing; có thể dùng `app.inject()`.
  Test trên adapter mặc định khác không chứng minh Fastify hoạt động; test HTTP/inject khác kiểm TLS/proxy/network thật.
  [Nest testing](https://docs.nestjs.com/fundamentals/testing), [Nest SWC/Vitest](https://docs.nestjs.com/recipes/swc#vitest).
- **Expo/React Native:** dùng `jest-expo` và `@testing-library/react-native` theo tài liệu Expo; không áp Vitest/jsdom vào native một cách mặc định.
  Kiểm Expo SDK/React/RNTL/preset compatibility, native mocks và Expo Router test setup trước pin phiên bản.
  Component/native module mocks không chứng minh camera, SecureStore, deep links hoặc permissions chạy trên thiết bị.
  [Expo unit testing](https://docs.expo.dev/develop/unit-testing/), [Expo Router testing](https://docs.expo.dev/router/reference/testing/).
- **Python:** pytest cho unit/contracts/integration; async fixtures, event loop/plugin và HTTPX/FastAPI test lifecycle cần cấu hình tương thích.
  Checkpoint persistence, cancellation/SSE và Core-tool effects cần integration tests, không chỉ coroutine mocks.

## Bộ công cụ chung theo lớp — đề xuất dùng với cả A/B/C

| Lớp | Công cụ và mục đích | Giới hạn cần kiểm |
|---|---|---|
| Browser E2E | **Playwright** cho Web/Organizer, trình duyệt thật, auth/routing/forms/SSE và luồng qua API. | Chạy đúng built app/backends/fixtures; browser emulation không thay native Mobile hoặc mọi kiểm accessibility/thẩm mỹ. |
| Native E2E | **Maestro** cho flow app Expo đã build, accessibility/device-level actions và deep-link/permission journeys. | Cần artifact `.apk`/`.app`, môi trường emulator/simulator phù hợp và test IDs/semantics ổn định; vẫn cần thiết bị thật. |
| Real-service integration | **Testcontainers Node/Python** cấp PostgreSQL, Redis, Kafka và GenericContainer cho các thành phần cần thiết. | Cần container runtime, network/readiness/teardown và pin compatible images; không tự có pipeline Debezium/CDC đúng cấu hình. |
| Load/concurrency | **k6 OSS** cho HTTP throughput/latency/errors và tình huống cạnh tranh có kiểm soát. | Load generator cũng cần sizing; kết quả phải đối chiếu invariants trong Core/DB, không chỉ HTTP 200 hoặc p95. |
| Fault/recovery | Điều khiển **owned isolated containers**/stub responses để mô phỏng restart, mất kết nối, delay và retry. | Chưa chọn thêm chaos tool; phải xác định fault point, dữ liệu và tiêu chí khôi phục trước chạy. |

[Playwright](https://playwright.dev/docs/intro), [Maestro mechanics](https://docs.maestro.dev/get-started/how-maestro-works.md),
[Expo Maestro E2E](https://docs.expo.dev/eas/workflows/examples/e2e-tests/), [Testcontainers Node](https://node.testcontainers.org/),
[Testcontainers Python](https://testcontainers-python.readthedocs.io/en/latest/), [k6 API load tests](https://grafana.com/docs/k6/latest/testing-guides/api-load-testing/).
Nghiêng Maestro thay **Detox** vì black-box qua accessibility/device interfaces phù hợp flow Expo built app và giữ domain assertions ở Core tests;
Detox vẫn là đối chiếu hợp lệ khi cần RN gray-box/in-app synchronization, với native build/integration riêng cần xác minh đúng SDK.
[Detox getting started](https://wix.github.io/Detox/docs/introduction/getting-started/). Không kết luận Maestro ổn định/nhanh hơn khi chưa thử.

Development build hữu ích khi phát triển; nghiệm thu cần cấu hình preview/release gần bản demo, không chỉ Expo Go/Metro.
Maestro/simulator không chứng minh QR camera quét trong ánh sáng thật, tốc độ thiết bị, biometric/SecureStore hoặc return từ MoMo/VNPAY thực.
Kiểm camera permission, QR hợp lệ/sai/lặp, accessibility, app background/resume và deep links trên thiết bị thật là bằng chứng riêng.
Không coi thao tác đọc QR là đã soát vé: thiết bị nhân viên online, Core xác nhận đúng rạp/từng ghế mới được hiển thị thành công.

## Các ca chứng minh tính đúng của hệ phân tán

Fixture/stub để phản hồi có thể lặp lại và kiểm lỗi; integration thật để kiểm transaction, locks, persistence và propagation.
Provider sandbox/real acceptance là lớp khác, cần quyền và môi trường riêng; mock payment/LLM/email không chứng minh provider thật đạt.
Không bỏ signature verification/Core authority trong test path; UI thành công từ stub không trở thành bằng chứng vé/thanh toán hợp lệ.

- **Atomic hold:** cùng tranh một ghế, yêu cầu nhiều ghế all-or-nothing, TTL/expiry và Redis lỗi→PostgreSQL fallback; kiểm DB state và effects.
- **Payment/idempotency:** callback trùng, sai chữ ký/đơn/tiền, timeout sau commit, callback muộn sau giải phóng; không thu/phát vé hoặc đổi ghế trùng.
- **Outbox/Kafka/CDC:** transaction rollback không phát event; restart/replay/duplicate và crash giữa xử lý với commit offset; không mất business effect hoặc làm lặp.
- **BullMQ:** enqueue/retry/worker restart/delayed jobs có dedupe nghiệp vụ; không dựa duy nhất vào job ID hay library retries.
- **Agent/contracts:** fixtures JSON dùng chung TS/Python cho missing/null/default/extra fields; tool sai quyền/args, Core timeout và resume không replay giao dịch mù.
- **Auth/UI/stream:** user/rạp isolation, session hết hạn, payment return chưa xác nhận, SSE reconnect/cancel/order và ghế hết hạn sau background; kiểm trạng thái cuối.

PostgreSQL integration cần logical replication/connector cho CDC; Kafka cần đúng KRaft/image/network và Kafka Connect/Debezium readiness.
Không coi module Kafka Testcontainers bất kỳ là tự tương thích mọi Apache/Confluent tag hoặc tự dựng outbox end-to-end.
Tên network/topic/group/slot/database/volume phải cách ly theo run; cleanup chỉ tài nguyên test có ownership, không dùng daily DB hoặc volume đang phục vụ việc khác.
Không thêm Compose entry point thứ ba để thuận tiện test. Testcontainers APIs không tự quyết định quyền stop/reset tài nguyên khác.

## License, chi phí và đề xuất gói tối thiểu

[Vitest](https://github.com/vitest-dev/vitest/blob/main/LICENSE), [Jest](https://github.com/jestjs/jest/blob/main/LICENSE),
[pytest](https://github.com/pytest-dev/pytest/blob/main/LICENSE), [Testcontainers Node](https://github.com/testcontainers/testcontainers-node/blob/main/LICENSE) và [Detox](https://github.com/wix/Detox/blob/master/LICENSE) là MIT;
[Playwright](https://github.com/microsoft/playwright/blob/main/LICENSE), [Maestro](https://github.com/mobile-dev-inc/Maestro/blob/main/LICENSE), [Testcontainers Python](https://github.com/testcontainers/testcontainers-python/blob/main/LICENSE.txt) Apache-2.0;
[k6 OSS](https://github.com/grafana/k6/blob/master/LICENSE.md) AGPLv3. Đối chiếu dependency/plugin/container image licenses khi pin versions, không gọi toàn bộ runtime là một license.
OSS tools không bắt mua managed testing service; CI minutes/runners, macOS/Xcode, emulators/devices, RAM/CPU/disk và container images vẫn có chi phí/giới hạn.
[Docker Desktop](https://docs.docker.com/subscription-billing/desktop-license/) có điều kiện miễn phí/trả phí riêng; không suy Testcontainers miễn phí thành mọi Docker runtime miễn phí.
Maestro Cloud, EAS Workflows/Build, Testcontainers Cloud và Grafana Cloud k6 là dịch vụ tùy chọn, **chưa chọn** hoặc tạo account.
CI host đã chọn tiếp tại ADR-0022; tải chạy, thiết bị và quota tài khoản chưa kiểm nên chưa dự toán
tổng tiền hoặc benchmark tốc độ A/B/C.

**Đề xuất A** cho suite TS mới: **Vitest + React Testing Library**, Mobile **jest-expo + RNTL**, Python **pytest**;
chung **Playwright + Maestro + Testcontainers TS/Python + k6**, fault tests dùng tài nguyên cách ly có ownership, chưa thêm chaos framework.
Lý do là khớp môi trường ESM/Vite/Next/Nest hiện hành, giữ native test path phù hợp Expo và đủ lớp để chứng minh transaction/recovery.
Không ép một runner cho mọi platform hoặc coi nhiều tool là tự có coverage; chỉ thêm test ở lớp sở hữu hành vi/rủi ro cần chứng minh.
Chưa migrate suite hiện có, pin phiên bản, thay test scripts hoặc đặt coverage/SLO thresholds. Kiểm thử tự động không thay [UI quality evidence](../04-standards/ui-quality.md).
Context7 đã đối chiếu `/vitest-dev/vitest`, `/testcontainers/testcontainers-node` (2 query calls); chưa thực thi bất kỳ phép kiểm thử/runtime nào.
