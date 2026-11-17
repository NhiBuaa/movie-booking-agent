# ADR-0021 — Bộ kiểm thử theo lớp cho nền tảng

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý” sau đề xuất bundle A trong
hội thoại Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`). Chọn công cụ mục tiêu cho suite mới;
chưa cài dependency, chuyển test, thay scripts/CI, chạy build/container/tải hoặc dịch vụ Cloud.

## Context

Web và contracts đang dùng `node --test` theo package scripts. Nền tảng mục tiêu bổ sung
Organizer React/Vite, Core NestJS/Fastify, Mobile Expo và Agent Python/FastAPI/LangGraph.
Logic thuần, component UI, tích hợp persistence/hàng đợi, hành trình người dùng và tải đồng thời
cần bằng chứng khác nhau. Chọn nhiều công cụ không tự chứng minh coverage hoặc đúng nghiệp vụ.

## Decision

| Phạm vi | Công cụ đã chọn |
|---|---|
| Suite TypeScript mới cho Web/Organizer/Core/contracts | **Vitest**; **React Testing Library** cho DOM/client components phù hợp, môi trường Node cho logic/Core/contracts. |
| Component Mobile | **Jest + jest-expo + React Native Testing Library** theo môi trường Expo. |
| Agent Python | **pytest** cho unit/contracts/integration; cấu hình async/lifecycle cần đặc tả. |
| Web/Organizer E2E | **Playwright** trên trình duyệt và app/backend phù hợp. |
| Mobile E2E | **Maestro** trên app Expo đã build; không coi browser emulation là native E2E. |
| Tích hợp dịch vụ thật | **Testcontainers Node/Python** cho PostgreSQL, Redis, Kafka và container cần thiết, cách ly theo test run. |
| Tải/cạnh tranh | **k6 OSS** cho HTTP/tình huống cạnh tranh có kiểm soát; kiểm trạng thái nghiệp vụ sau tải. |

- Giữ suite và scripts `node:test` hiện có; không bỏ coverage cũ hoặc tự migrate trong quyết định này.
  Kế hoạch triển khai phải xác định discovery/globs, config theo workspace và kiểm hồi quy trước thay runner.
- Dùng các container test có ownership để kiểm restart/disconnect/delay/retry và phục hồi; chưa thêm chaos framework.
  Không dùng daily DB/volume, dừng tài nguyên phiên khác hoặc tạo Compose entry point thứ ba cho test.
- Chọn runner theo môi trường, không ép Vitest vào React Native. Dùng type-check/build riêng;
  transform TypeScript để chạy test không tự thay kiểm tra kiểu.
- Unit/component tests bao phủ phần sync/client phù hợp; async Server Components của Next dùng E2E
  theo giới hạn hiện hành. Core integration phải khởi tạo đúng FastifyAdapter và lifecycle tương ứng.
- Kiểm hợp đồng TypeScript/Python bằng dữ liệu chung và các trường hợp hợp lệ/không hợp lệ;
  không coi TypeScript type, JSON Schema export hoặc codegen thành bằng chứng tương thích runtime.

## Alternatives Considered

| Hướng | Lý do và đánh đổi |
|---|---|
| **Vitest cho suite TS mới; runner native/Python riêng** | Được chọn: phù hợp ESM/Vite; Next và Nest có hướng dẫn tích hợp. Cần config/transform riêng cho Next/Nest, metadata decorators và dependency compatibility. Không có phép đo chứng minh nhanh hơn Jest trong dự án. |
| Jest cho suite TS mới | Hợp lệ: hệ sinh thái mock/preset và cùng họ runner với Mobile. Web/Core/Expo vẫn có config khác nhau, cần kiểm ESM/transform; không loại vì coi Jest lỗi thời. |
| Giữ node:test và bổ sung DOM/browser harness | Tận dụng nền hiện có, phù hợp logic thuần. TSX/DOM/Nest metadata cần harness/transform bổ sung; không chọn làm nền thống nhất cho suite mới nhưng giữ các test đang tồn tại. |

Maestro được chọn cho hành trình Expo built app qua giao diện thiết bị/accessibility; Detox vẫn là
phương án hợp lệ khi cần gray-box synchronization và tích hợp native tương ứng. Không suy Maestro
nhanh/ổn định hơn khi chưa chạy. Playwright, Testcontainers và k6 giữ vai trò riêng theo lớp.

## Consequences

- Khi triển khai, pin compatibility và kiểm SWC/decorator metadata, DI/ESM/aliases, Fastify readiness,
  Expo preset/RNTL, Python async fixtures và FastAPI/HTTPX lifecycle. Chưa chọn phiên bản hoặc plugin chi tiết.
- Testcontainers không tự dựng pipeline Debezium/CDC: cần PostgreSQL logical replication,
  connector/outbox mapping, Kafka KRaft, networking/readiness và recovery checks đúng cấu hình.
- Các ca trọng tâm: atomic hold nhiều ghế/TTL, Redis lỗi và fallback PostgreSQL; tranh cùng ghế;
  webhook lặp/sai chữ ký/sai tiền/đến muộn; timeout sau commit; consumer replay/crash và worker retry;
  quyền theo user/rạp; Agent resume không phát lại giao dịch mù; SSE reconnect/cancel.
  Khẳng định theo DB state và tác dụng phụ, không chỉ HTTP 200, UI success hoặc p95.
- Fixture/stub phục vụ phản hồi lặp lại và ca lỗi; không thay integration thật hoặc provider acceptance.
  Test không bỏ xác minh chữ ký/Core authority. Chưa cho phép gọi provider thật hoặc chạy tải ở môi trường công khai.
- Test camera/QR, SecureStore, app background/resume và return từ cổng thanh toán trên thiết bị thật
  là bằng chứng riêng. Mocks/simulator không chứng minh phần cứng; nhân viên vẫn cần Core xác nhận online.
- Bộ đánh giá Agent dùng LangSmith đã chọn; dataset/evaluator và tiêu chí chất lượng còn cần đặc tả.
  Tự động hóa không thay kiểm render, accessibility/thao tác và chất lượng UI theo chuẩn dự án.
- CI runners được chọn tiếp tại [ADR-0022](0022-github-actions-buildx-and-ghcr-for-ci.md).
  Chưa chọn số tải, ngưỡng coverage/SLO hoặc test services managed; phải xác định theo rủi ro
  và môi trường thực. Quyết định công cụ không xác nhận suite đã chạy hoặc đạt production readiness.

### Chi phí

Các công cụ OSS đã chọn không bắt mua dịch vụ kiểm thử managed: Vitest/Jest/pytest/Testcontainers Node
dùng MIT; Playwright/Maestro/Testcontainers Python Apache-2.0; k6 OSS AGPLv3. Dependency/plugin/image
có điều khoản riêng cần kiểm khi pin; không coi toàn bộ runtime có cùng giấy phép.

Máy chạy CI, container CPU/RAM/disk/network, build/emulator, macOS/Xcode và thiết bị vẫn có chi phí
hoặc quota. Docker Desktop có điều kiện sử dụng miễn phí/trả phí riêng. Maestro Cloud, EAS Workflows,
Testcontainers Cloud và Grafana Cloud k6 chưa được chọn; chọn Grafana Cloud observability không tự
chọn managed load testing. Chưa có số lần chạy, thời lượng, concurrency, host/device nên chưa có
ước tính tổng đáng tin. Không cấp quyền mua, cài đặt hay chạy dịch vụ tại đây.

## References

- [Nghiên cứu, hiện trạng scripts và giấy phép](../99-notes/testing-stack-research.md).
- [Next Vitest](https://nextjs.org/docs/app/guides/testing/vitest), [Next Jest](https://nextjs.org/docs/app/guides/testing/jest).
- [Nest testing](https://docs.nestjs.com/fundamentals/testing), [Nest SWC/Vitest](https://docs.nestjs.com/recipes/swc#vitest).
- [Expo testing](https://docs.expo.dev/develop/unit-testing/).
- [pytest](https://docs.pytest.org/en/stable/).
- [Playwright](https://playwright.dev/docs/intro), [Maestro](https://docs.maestro.dev/).
- [Testcontainers Node](https://node.testcontainers.org/), [Testcontainers Python](https://testcontainers-python.readthedocs.io/en/latest/).
- [k6](https://grafana.com/docs/k6/latest/), [Docker Desktop license](https://docs.docker.com/subscription-billing/desktop-license/).
- [Chuẩn chất lượng UI](../04-standards/ui-quality.md).

Nguồn/Context7 đối chiếu ngày 2026-11-17; chỉ ghi quyết định, chưa cài đặt hoặc chạy kiểm thử/runtime.
