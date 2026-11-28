# 06 — Decisions (ADR)

Nơi lưu trữ các văn bản ghi nhận quyết định kiến trúc quan trọng (Architecture Decision Records - ADR) của nền tảng **Movie Booking Platform**.

---

## Danh mục Quyết định Kiến trúc

| Mã ADR | Tiêu đề quyết định | Trạng thái | Ngày ghi nhận |
| :--- | :--- | :--- | :--- |
| [ADR-0001](0001-monorepo-platform-and-microservices-boundaries.md) | Kiến trúc Monorepo Platform và Ranh giới Microservices | `Accepted` | 2026-11-15 |
| [ADR-0002](0002-customer-organizer-app-boundaries.md) | Tách ứng dụng Customer và Organizer theo nền tảng | `Accepted` | 2026-11-16 |
| [ADR-0003](0003-postgresql-and-redis-for-platform-data.md) | PostgreSQL và Redis cho dữ liệu nền tảng | `Accepted` | 2026-11-16 |
| [ADR-0004](0004-redis-roles-and-seat-hold-coordination.md) | Vai trò Redis và điều phối giữ ghế | `Accepted` | 2026-11-16 |
| [ADR-0005](0005-drizzle-orm-and-kit-for-cinema-core.md) | Drizzle ORM và Kit cho Cinema Core | `Accepted` | 2026-11-16 |
| [ADR-0006](0006-bullmq-for-core-background-jobs.md) | BullMQ cho tác vụ nền của Cinema Core | `Accepted` | 2026-11-16 |
| [ADR-0007](0007-transactional-outbox-debezium-kafka.md) | Transactional Outbox, Debezium CDC và Apache Kafka KRaft | `Accepted` | 2026-11-16 |
| [ADR-0008](0008-better-auth-with-direct-login.md) | Better Auth với form đăng nhập trực tiếp | `Accepted` | 2026-11-16 |
| [ADR-0009](0009-python-fastapi-langgraph-and-uv-for-agent-service.md) | Python, FastAPI, LangGraph và uv cho Agent Service | `Accepted` | 2026-11-16 |
| [ADR-0010](0010-langsmith-cloud-for-agent-observability.md) | LangSmith Cloud cho quan sát và đánh giá Agent | `Accepted` | 2026-11-16 |
| [ADR-0011](0011-sse-starlette-for-agent-streaming.md) | SSE và sse-starlette cho streaming Agent | `Accepted` | 2026-11-16 |
| [ADR-0012](0012-cloudflare-workers-ai-and-gpt-oss-120b.md) | Cloudflare Workers AI và GPT-OSS 120B cho Agent | `Accepted` | 2026-11-17 |
| [ADR-0013](0013-modular-agent-postgres-checkpoints-and-httpx.md) | Module Agent, checkpoint PostgreSQL và HTTPX async | `Accepted` | 2026-11-17 |
| [ADR-0014](0014-zod-json-schema-and-pydantic-contracts.md) | Zod 4, JSON Schema và Pydantic v2 cho hợp đồng chung | `Accepted` | 2026-11-17 |
| [ADR-0015](0015-react-vite-and-tanstack-router-for-organizer.md) | React, Vite và TanStack Router cho Organizer Portal | `Accepted` | 2026-11-17 |
| [ADR-0016](0016-expo-router-and-mobile-native-foundation.md) | Expo Router và nền tảng native cho Mobile | `Accepted` | 2026-11-17 |
| [ADR-0017](0017-tanstack-query-and-zustand-for-frontend-state.md) | TanStack Query và Zustand cho trạng thái frontend | `Accepted` | 2026-11-17 |
| [ADR-0018](0018-resend-for-transactional-email.md) | Resend cho email giao dịch | `Accepted` | 2026-11-17 |
| [ADR-0019](0019-r2-and-cloudflare-images-for-catalog-media.md) | R2 Standard và Cloudflare Images cho ảnh danh mục | `Accepted` | 2026-11-17 |
| [ADR-0020](0020-opentelemetry-alloy-and-grafana-cloud.md) | OpenTelemetry, Grafana Alloy và Grafana Cloud cho quan sát nền tảng | `Accepted` | 2026-11-17 |
| [ADR-0021](0021-layered-testing-stack-for-platform.md) | Bộ kiểm thử theo lớp cho nền tảng | `Accepted` | 2026-11-17 |
| [ADR-0022](0022-github-actions-buildx-and-ghcr-for-ci.md) | GitHub Actions, Buildx và GHCR cho CI và bản build container | `Accepted` | 2026-11-17 |
| [ADR-0023](0023-encrypted-mmkv-for-offline-mobile-tickets.md) | MMKV mã hóa và SecureStore cho vé offline trên Mobile | `Accepted` | 2026-11-17 |
| [ADR-0024](0024-fetch-and-eventsource-parser-for-sse-clients.md) | Fetch và eventsource-parser cho SSE trên Web/Mobile | `Accepted` | 2026-11-17 |
| [ADR-0025](0025-react-hook-form-and-zod-for-frontend-forms.md) | React Hook Form và Zod 4 cho form frontend | `Accepted` | 2026-11-17 |
| [ADR-0026](0026-react-aria-components-for-web-ui-primitives.md) | React Aria Components cho nền tương tác Web/Organizer | `Accepted` | 2026-11-17 |
| [ADR-0027](0027-direct-http-and-node-crypto-for-payment-gateways.md) | HTTP trực tiếp và Node fetch/crypto cho MoMo/VNPAY | `Accepted` | 2026-11-17 |
| [ADR-0028](0028-groq-free-for-agent-provider-fallback.md) | Groq Free GPT-OSS 120B dự phòng cho Agent | `Accepted` | 2026-11-17 |
| [ADR-0029](0029-core-sse-and-query-for-seat-map-synchronization.md) | Core SSE, Query snapshot và Redis Pub/Sub cho đồng bộ ghế | `Accepted` | 2026-11-17 |
| [ADR-0030](0030-typesense-for-movie-search-and-discovery.md) | Typesense làm chỉ mục tìm kiếm phim, PostgreSQL giữ thẩm quyền | `Accepted` | 2026-11-17 |
| [ADR-0031](0031-content-based-and-profile-scoring-for-personalization.md) | Cá nhân hóa theo nội dung phim và hồ sơ phiên/tài khoản | `Accepted` | 2026-11-17 |
| [ADR-0032](0032-cloudflare-workers-ai-for-managed-embeddings.md) | Cloudflare Workers AI cho API embedding | `Accepted` | 2026-11-17 |
| [ADR-0033](0033-qwen3-embedding-for-movie-retrieval.md) | Qwen3 Embedding 0.6B trên Cloudflare cho tìm kiếm phim | `Accepted` | 2026-11-17 |
| [ADR-0034](0034-backend-orchestrated-external-embeddings.md) | Backend điều phối embedding, Typesense nhận vector ngoài | `Accepted` | 2026-11-17 |
| [ADR-0035](0035-search-module-in-cinema-core.md) | Module Search trong Cinema Core, BullMQ indexing nền | `Accepted` | 2026-11-17 |
| [ADR-0036](0036-nestjs-fastify-for-cinema-core.md) | NestJS và Fastify cho Cinema Core (mã 0002 ban đầu của PR #5) | `Accepted` | 2026-11-16 |

## Phạm vi của các lựa chọn

ADR-0002 đã hợp nhất sở hữu ranh giới bốn app. Quyết định NestJS/Fastify trước đây dùng mã 0002
ở nhánh tech stack được chuyển thành ADR-0036; các mã 0003–0035 giữ nguyên để tránh đổi toàn bộ
lịch sử tham chiếu. Ngày chấp thuận không phụ thuộc thứ tự số sau khi hòa giải.

[Thiết kế bảy service](../05-specs/004-service-decomposition/spec.md) và
[quyết định đã duyệt](../05-specs/004-service-decomposition/decisions.md) sở hữu phân công dữ liệu,
Agent đề xuất/app-BFF thực thi và các tích hợp. Các ADR công nghệ đọc cùng ranh giới đó:
Identity sở hữu Better Auth; Notification dùng Resend; Catalog sở hữu nội dung/media phim;
Search vẫn là module Core và nhận dữ liệu qua hợp đồng, không SQL chéo dịch vụ.

Các ADR ghi quyết định công nghệ và lý do; `Accepted` không xác nhận đã cài đặt, tích hợp,
kiểm thử, triển khai hoặc đạt hiệu năng mục tiêu. Xem [PROJECT-OVERVIEW](../../PROJECT-OVERVIEW.md)
cho bức tranh công nghệ và [CONTEXT](../../CONTEXT.md) cho giới hạn hiện trạng.

Hosting/provider, topology/cấu hình máy và deployment/CD giữ hoãn đến lúc chuẩn bị deploy theo
quyết định của chủ sản phẩm. Phiên bản/driver/SDK cụ thể, hợp đồng token/event, thuật toán giữ ghế,
replay/retention, SLO và cấu hình phục hồi cần được đặc tả/kiểm chứng theo tính năng hoặc thiết kế vận hành;
không tự coi các chi tiết đó đã được duyệt từ việc chọn thư viện. Chính sách sản phẩm còn mở
tiếp tục do [mô hình use case](../03-product/use-cases.md#6-các-quyết-định-còn-mở) sở hữu.

---

## Hướng dẫn tạo ADR mới
- Sử dụng mẫu quyết định chuẩn tại `agentic-repo-kit/templates/adr.md`.
- Mỗi quyết định cần nêu rõ: Bối cảnh (Context), Quyết định (Decision), Các phương án đã cân nhắc (Alternatives Considered) và Hệ quả/Đánh đổi (Consequences).
