# 99 — Notes

This directory is the canonical location for useful **non-authoritative retained notes** that do not belong to a stronger documentation category.

The directory and this `README.md` are part of the canonical skeleton. Project-specific notes inside it are optional.

Use it sparingly. Keep only material that is worth retaining but is not yet authoritative project truth.

Do not store:

- scratch work or temporary dumps;
- task plans;
- progress updates;
- handoffs;
- review logs;
- CI/test evidence that already belongs to a Pull Request.

Do not create notes merely to populate the directory.

If a note becomes durable project truth, promote it into the appropriate numbered documentation category and remove or reduce the competing note.

## Retained Research

Các ghi chú giữ nguồn và so sánh tại thời điểm nghiên cứu. Lựa chọn hiện hành thuộc
[danh mục ADR](../06-decisions/README.md), chính sách sản phẩm thuộc
[mô hình use case](../03-product/use-cases.md); ghi chú phải đọc cùng các quyết định tiếp nối.
Giá/quota hoặc quan sát runtime ghi trong nghiên cứu là bằng chứng có thời điểm, không phải xác nhận lại tài khoản/code hiện tại.

Khi đọc nghiên cứu trước đợt hòa giải PR #5, áp dụng [bốn app tại ADR-0002](../06-decisions/0002-customer-organizer-app-boundaries.md)
và [ranh giới bảy service](../05-specs/004-service-decomposition/spec.md): đường dẫn cũ
`apps/web`/`apps/mobile`/`apps/organizer` lần lượt chuyển thành Customer Web/Customer Mobile/Organizer Web,
nhân viên soát vé ở Organizer Mobile. Catalog sở hữu nội dung/media, Identity sở hữu Auth,
Notification gửi email; Agent chỉ truy vấn/đề xuất, app/BFF thực thi lệnh đã xác nhận.
Các ví dụ thực thi tool trực tiếp hoặc Core sở hữu mọi dữ liệu bên dưới là ngữ cảnh trước phân rã,
không thay các ranh giới đã duyệt; link tới source hiện hành dùng đường dẫn mới.

- [Benchmark ORM TypeScript — nguồn và giới hạn](typescript-orm-benchmarks.md).
- [Phát outbox: polling và CDC qua Debezium](outbox-delivery-research.md).
- [Xác thực tài khoản: Keycloak, Better Auth và Auth0](authentication-stack-research.md).
- [Framework cho Agent: LangGraph TypeScript/Python và AI SDK + Workflow](agent-framework-research.md).
- [Mảnh ghép Agent: checkpoint, HTTP/SSE, tracing và codegen](agent-production-components-research.md).
- [Nhà cung cấp LLM: OpenAI, Gemini và Anthropic](llm-provider-research.md).
- [Hợp đồng TypeScript–Python: nguồn schema và sinh Pydantic](contracts-codegen-research.md).
- [Framework Organizer: Next.js và React/Vite/TanStack Router](organizer-framework-research.md).
- [Nền tảng Mobile: điều hướng, native builds, camera và lưu phiên](mobile-foundation-research.md).
- [Dữ liệu và trạng thái giao diện: TanStack Query/Zustand và Redux Toolkit/RTK Query](frontend-state-research.md).
- [Email giao dịch: Resend và Amazon SES](transactional-email-research.md).
- [Lưu và phân phối ảnh: R2/Images, S3/CloudFront và Cloudinary](media-storage-research.md).
- [Quan sát nền tảng: OpenTelemetry, Grafana Cloud, bộ Grafana tự host và SigNoz](platform-observability-research.md).
- [Bộ kiểm thử: runner TypeScript, native, tích hợp, E2E và tải](testing-stack-research.md).
- [Triển khai luôn chạy: VPS/Compose, Render trả phí và k3s](deployment-approach-research.md).
- [CI và artifact container: GitHub-hosted, self-hosted, GHCR và Buildx](ci-and-container-artifacts-research.md).
- [Kho vé offline Mobile: SQLite/SQLCipher, AsyncStorage và MMKV mã hóa](mobile-ticket-storage-research.md).
- [Client SSE Web/Expo: fetch/parser, EventSource và eventsource-client](sse-client-research.md).
- [Quản lý form: React Hook Form, TanStack Form và React local](frontend-forms-research.md).
- [Nền tương tác Web/Organizer: React Aria Components, Radix và Base UI](web-ui-primitives-research.md).
- [Tích hợp MoMo/VNPAY: HTTP, chữ ký IPN và query/refund](payment-gateway-integration-research.md).
- [Dự phòng provider AI: quota, streaming, ngân sách và phục hồi](agent-provider-resilience-research.md).
- [Đồng bộ sơ đồ ghế: polling, Core SSE và WebSocket](seat-map-synchronization-research.md).
- [Nâng cấp tìm kiếm phim: PostgreSQL hybrid, Typesense và OpenSearch](movie-search-architecture-research.md).
- [Cá nhân hóa khám phá phim và lựa chọn embedding](movie-personalization-and-embedding-research.md).
- [Model embedding Cloudflare: Qwen3 Embedding 0.6B và BGE-M3](cloudflare-multilingual-embedding-models-research.md).
- [Tích hợp embedding: backend tạo vector hay Typesense auto-embedding](movie-embedding-integration-research.md).

## Nghiên cứu kiến trúc

- [Ranh giới dịch vụ](service-boundary-research.md) — nguồn sơ cấp, ba phương án và đánh đổi;
  các quyết định dự án do đặc tả/ADR sở hữu.
- [Ba ranh giới tích hợp service](service-integration-gaps-research.md) — so sánh Catalog–Core,
  căn cứ đánh giá Core–Community và bàn giao email bảo mật; lựa chọn đã được ghi nhận trong bản quyết định.
