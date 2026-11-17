# Movie Booking Platform — Project Overview

This root file is the canonical project foundation. Use `docs/01-overview/` only for distinct expanded orientation; do not maintain a paraphrased copy of this file there.

## Problem

Trải nghiệm đặt vé xem phim trực tuyến hiện nay thường bị phân mảnh và rập khuôn: người dùng phải bấm chọn qua hàng loạt bộ lọc phức tạp, không được hỗ trợ giải đáp tự nhiên theo ngữ cảnh (ví dụ: "tìm rạp gần nhất có suất chiếu sau 7h tối ghế đôi"), và nhân viên rạp chiếu thiếu các công cụ hiện trường đồng bộ với hệ thống quản trị trung tâm. Mặt khác, các nhà tổ chức và rạp chiếu vừa và nhỏ gặp khó khăn trong việc quản trị lịch chiếu, ma trận phòng chiếu và đối soát doanh thu thời gian thực.

## Product

**Movie Booking Platform** là hệ sinh thái đặt vé xem phim và quản lý rạp chiếu thế hệ mới, tích hợp **Trợ lý Trí tuệ Nhân tạo (Conversational AI Agent)** kết hợp cùng hệ thống giao dịch điện ảnh cốt lõi (**Cinema Core**).

Sản phẩm mục tiêu phục vụ **một đơn vị/chuỗi rạp**. Phạm vi actor, mục tiêu và quy tắc chi tiết
được sở hữu bởi [mô hình use case](docs/03-product/use-cases.md), diễn giải bằng
[mô tả use case](docs/03-product/use-case-descriptions.md) và [thuật ngữ](GLOSSARY.md).
Các nhóm phục vụ tổng quát:

1. **Khách hàng xem phim (Moviegoers)**: Trải nghiệm đặt vé qua Web và Mobile, hoặc tương tác trò chuyện tự nhiên với Buaa AI Agent để chọn phim, giữ ghế và nhận vé điện tử QR ngay trong khung chat.
2. **Vận hành rạp và quản trị chuỗi**: Quản trị viên toàn chuỗi, quản lý rạp, nhân viên soát vé và nhân viên quầy bắp nước có phạm vi/quyền riêng; không tự kế thừa quyền của nhau.

## Scope

### In Scope

- **User-facing Web Client (`apps/customer-web`)**: Next.js 16 App Router, React 19, TypeScript, khám phá phim, sơ đồ ghế theo phòng, AI Agent chat workspace, thanh toán MoMo/VNPAY và vé điện tử.
- **Cinema Organizer — Web và Mobile**: Khu vực riêng cho quản trị viên toàn chuỗi và quản lý rạp,
  gồm bản Web (`apps/organizer-web`) và app `apps/organizer-mobile`; cả hai đều thuộc phạm vi bắt buộc,
  theo xác nhận của chủ sản phẩm ngày 2026-11-16 trong hội thoại thiết kế bối cảnh sản phẩm.
  Phạm vi nghiệp vụ gồm danh mục phim, trailer, phòng chiếu, lịch chiếu, báo cáo và các quyền theo
  mô hình use case. Trải nghiệm nhân viên soát vé thuộc Organizer Mobile, giữ quyền riêng với quản lý.
  Phạm vi màn hình quản trị trên Mobile chưa chốt; không mặc định mọi màn hình Web có bản tương đương.
- **Customer Mobile (`apps/customer-mobile`)**: App khách hàng đặt vé, lưu QR để xuất trình khi điện thoại
  không có mạng; thiết bị soát vé vẫn phải online. Cả Customer Mobile và Organizer Mobile hỗ trợ iOS/Android,
  giao diện phù hợp từng hệ; nền Mobile React Native/Expo theo ADR-0016; Organizer Web dùng React/Vite/TanStack Router theo ADR-0015. Chưa scaffold hoặc xác nhận runtime các app này.
- **Catalog Media**: Upload/lưu poster, banner và ảnh; trailer dùng URL/video nhúng từ nguồn ngoài theo [M-01 trong mô tả use case](docs/03-product/use-case-descriptions.md). R2 Standard và Cloudflare Images xử lý ảnh theo [ADR-0019](docs/06-decisions/0019-r2-and-cloudflare-images-for-catalog-media.md); bản đầu không tự lưu/phục vụ trailer, nguồn video chưa chọn.
- **Cinema Core Backend (`services/cinema-core`)**: Quản lý tồn kho ghế, cơ chế khóa giữ vé (Atomic Hold TTL 5 phút), thanh toán và phát hành vé có chữ ký số.
- **AI Agent Service (`services/agent-service`)**: Xử lý ngôn ngữ tự nhiên, truy vấn theo quyền và đề xuất hành động; app/BFF thực thi lệnh đã được khách xác nhận dưới danh tính khách.
- **Các service nghiệp vụ bổ trợ**: Catalog sở hữu nội dung phim; Identity & Access sở hữu danh tính/quyền;
  Notification sở hữu thông báo/chuyển phát; Community sở hữu đánh giá/yêu thích; Reporting sở hữu mô hình đọc tổng hợp.
  Bảy service đã có thư mục/README định vị theo thiết kế đích; chưa có code hoặc runtime service.
- **Packages dùng chung (`packages/*`)**: `design-tokens`, `contracts`, `ui`, `shared-logic`.
- **Tài liệu chuẩn hóa**: Kiến trúc và quy chuẩn phát triển tại `docs/` và `.agents/`.
- **Khả năng sản phẩm mục tiêu**: Tài khoản/xác minh email; combo/voucher; yêu cầu hủy và hoàn tiền;
  soát từng ghế và giao combo; đánh giá/yêu thích; hội viên, điểm và đổi voucher; phân quyền vận hành.
  Phạm vi chi tiết và phần được phép thao tác qua chat theo mô hình use case, chưa xác nhận đã triển khai.

### Out of Scope

- Tích hợp thanh toán bằng tiền mặt vật lý tại quầy rạp (Phase 1 tập trung cổng thanh toán số).
- Hệ thống đề xuất phim bằng học từ cộng đồng/collaborative hoặc mô hình huấn luyện phức tạp ở bản đầu;
  phần cá nhân hóa theo nội dung và hồ sơ phiên/tài khoản được chọn riêng tại
  [ADR-0031](docs/06-decisions/0031-content-based-and-profile-scoring-for-personalization.md).
- Quản lý kho hàng bắp nước vật lý ngoài các combo vé tiêu chuẩn.
- Sàn nhiều đơn vị rạp độc lập, soát vé ngoại tuyến và đổi suất/đổi ghế sau mua không thuộc mô hình đã chốt.

## Architecture Direction

- **Service Ownership**: [Thiết kế microservices](docs/05-specs/004-service-decomposition/spec.md)
  chốt 7 service và [bản ghi quyết định](docs/05-specs/004-service-decomposition/decisions.md) giữ lý do/nguồn duyệt.
  Core giữ hạt nhân giao dịch cùng các module Hội viên, Ưu đãi/Voucher và Combo; Agent điều phối hội thoại.
  Mỗi service sở hữu database PostgreSQL logic riêng. HTTP/JSON phục vụ lệnh/truy vấn;
  sự kiện đã commit qua transactional outbox, Debezium/Kafka Connect và Kafka. BFF không sở hữu giao dịch. Agent chỉ đề xuất; sau xác nhận đúng nội dung/phiên bản Core đã kiểm tra, app/BFF gửi lệnh bằng quyền khách và mã thao tác ổn định. Timeout phải tra cứu mã cũ trước khi thử lại; credential giao dịch rộng không vào Agent.
- **Mô hình Monorepo Platform**: npm workspaces quản lý phần JavaScript/TypeScript trong `apps/`, `services/`, `packages/`; uv quản lý môi trường/gói Python của Agent Service theo [ADR-0009](docs/06-decisions/0009-python-fastapi-langgraph-and-uv-for-agent-service.md). Layout Python/lockfile cụ thể chưa triển khai.
- **Frontend Architecture**: Customer Web dùng Next.js App Router với lớp Backend for Frontend (BFF) mỏng; Server Components đọc dữ liệu backend trực tiếp; Client Components xử lý tương tác UI.
- **Organizer Frontend**: React 19 + TypeScript + Vite + TanStack Router theo SPA tại [ADR-0015](docs/06-decisions/0015-react-vite-and-tanstack-router-for-organizer.md); build assets tĩnh, gọi API có xác thực tới service sở hữu, từng service kiểm quyền tài nguyên của mình. Web khách hàng giữ Next.js; chưa scaffold Organizer hoặc chọn hosting/topology Auth.
- **Mobile Foundation**: Hai app riêng Customer Mobile và Organizer Mobile dùng React Native + Expo + TypeScript, Expo Router và development builds; `expo-camera` đọc QR ở Organizer Mobile; `expo-secure-store` lưu dữ liệu phiên ở từng app theo [ADR-0016](docs/06-decisions/0016-expo-router-and-mobile-native-foundation.md). Core xác minh soát vé online; client SSE theo ADR-0024. Chưa chọn SDK/build service, phát hành store hoặc kiểm chứng native runtime.
- **Customer Mobile Offline Tickets**: `react-native-mmkv` bật mã hóa lưu snapshot vé/QR; SecureStore giữ khóa theo [ADR-0023](docs/06-decisions/0023-encrypted-mmkv-for-offline-mobile-tickets.md). Chỉ phục vụ khách xuất trình offline, không xác nhận trạng thái mới hoặc soát vé offline. Retention/key lifecycle và native compatibility cần đặc tả/kiểm chứng; chưa cài/build.
- **Frontend State**: TanStack Query cho snapshot API phía client; Zustand có phạm vi cho UI draft chia sẻ, React local state mặc định và router/URL cho bộ lọc theo [ADR-0017](docs/06-decisions/0017-tanstack-query-and-zustand-for-frontend-state.md). Giữ RSC server fetch, Core là thẩm quyền giao dịch; chưa cài đặt hoặc chọn persistence/refetch/bridge native.
- **Frontend Forms**: React Hook Form + `@hookform/resolvers` + Zod 4 cho form nghiệp vụ trên Web/Organizer/Mobile theo [ADR-0025](docs/06-decisions/0025-react-hook-form-and-zod-for-frontend-forms.md); React state cho form nhỏ. Giữ UI/tokens và pipeline hợp đồng, Core kiểm dữ liệu/quyền; chưa cài, migrate form hoặc xác nhận SSR/native runtime.
- **Web/Organizer UI Primitives**: React Aria Components cho nền hành vi component tương tác phức tạp theo [ADR-0026](docs/06-decisions/0026-react-aria-components-for-web-ui-primitives.md). Giữ CSS modules/Ferrari Dark Cinema; chia sẻ component phù hợp ở `packages/ui`, tái dùng control đơn giản. Mobile giữ UI native riêng; chưa cài, rewrite UI hoặc kiểm accessibility/SSR/bundle/runtime.
- **Backend Architecture**: Cinema Core đóng vai trò Single Source of Truth cho các giao dịch, chọn NestJS + Fastify theo [ADR-0036](docs/06-decisions/0036-nestjs-fastify-for-cinema-core.md); Agent Service điều phối hội thoại và đề xuất, app/BFF thực thi lệnh bằng quyền khách. Lựa chọn này không tự chọn ngôn ngữ/framework cho Catalog, Identity, Notification, Community hoặc Reporting; chưa phải bằng chứng runtime.
- **Data Architecture**: PostgreSQL làm kho nghiệp vụ chính với database logic và credential/migration riêng cho mỗi service, không SQL/JOIN/FK chéo; Redis có mặt từ bản đầu theo [ADR-0003](docs/06-decisions/0003-postgresql-and-redis-for-platform-data.md). Typesense bổ sung làm chỉ mục tìm kiếm dẫn xuất tại ADR-0030, không là kho giao dịch có thẩm quyền. Redis phục vụ các vai trò tại [ADR-0004](docs/06-decisions/0004-redis-roles-and-seat-hold-coordination.md) và Pub/Sub tại ADR-0029; thuật toán và cấu hình triển khai còn mở.
- **Movie Search**: Typesense OSS cho lexical/vector/hybrid retrieval theo [ADR-0030](docs/06-decisions/0030-typesense-for-movie-search-and-discovery.md), PostgreSQL của từng service giữ dữ liệu/thẩm quyền theo ownership. Search thuộc Core nhận dữ liệu qua hợp đồng/sự kiện từ Catalog, Community và các owner liên quan qua outbox/CDC/Kafka, không đọc SQL chéo; lớp ứng dụng giữ cá nhân hóa theo ADR-0031; model embedding theo ADR-0033, chưa chọn công thức rank, viết pipeline hoặc đo chất lượng tiếng Việt/tải. Không chọn Typesense Cloud hoặc thêm OpenSearch/pgvector.
- **Movie Personalization**: Theo nội dung phim + hồ sơ phiên/tài khoản tại [ADR-0031](docs/06-decisions/0031-content-based-and-profile-scoring-for-personalization.md). Người mới khám phá ngay theo danh mục/ngữ cảnh; chưa thêm collaborative ở bản đầu, LLM không bắt buộc mọi lượt. Model embedding theo ADR-0033; chưa chọn công thức weights, hoàn thiện chính sách dữ liệu hoặc triển khai profile/ranker.
- **Movie Embeddings**: Cloudflare Workers AI managed API theo [ADR-0032](docs/06-decisions/0032-cloudflare-workers-ai-for-managed-embeddings.md), model **`@cf/qwen/qwen3-embedding-0.6b`** theo [ADR-0033](docs/06-decisions/0033-qwen3-embedding-for-movie-retrieval.md), dùng allocation miễn phí chung với chat; không tự bật trả phí hoặc chạy encoder local. Dimensions/preprocessing, quota từng tác vụ và adapter còn cần đặc tả/kiểm chứng; chưa gọi API hoặc tạo vector. Giữ lexical/filter/catalogue khi embedding lỗi/quota cạn.
- **Core Data Access**: Drizzle ORM và Drizzle Kit cho truy vấn PostgreSQL và quản lý schema/migration của Cinema Core theo [ADR-0005](docs/06-decisions/0005-drizzle-orm-and-kit-for-cinema-core.md); chưa pin phiên bản/driver hoặc xác nhận runtime.
- **Embedding Integration**: Backend điều phối Cloudflare/Qwen3, Typesense nhận external vectors theo [ADR-0034](docs/06-decisions/0034-backend-orchestrated-external-embeddings.md). Metadata phim xử lý nền, query vector tạo ở backend khi tìm; chủ động quota/cache/deadline và lexical fallback. Owner xử lý search là module Search trong Core; dữ liệu phim gốc vẫn thuộc Catalog, tín hiệu khác theo owner tương ứng và hợp đồng. BullMQ indexing nền theo [ADR-0035](docs/06-decisions/0035-search-module-in-cinema-core.md); Agent gọi API Core. Chưa viết adapter/pipeline hoặc chọn cách tách tiến trình worker; không thêm Search Service/encoder local hoặc dùng Typesense auto-embedding ở bản đầu.
- **Payment Gateway Integration**: HTTP trực tiếp + Node `fetch`/`node:crypto`, adapter riêng từng cổng MoMo/VNPAY theo [ADR-0027](docs/06-decisions/0027-direct-http-and-node-crypto-for-payment-gateways.md). Tách signing/IPN/query/refund theo operation/version; Core giữ xác nhận và chống lặp. Chưa viết adapter, gọi sandbox/production hoặc xác nhận merchant/phí và test vectors.
- **Core Background Jobs**: BullMQ và `@nestjs/bullmq` cho hàng đợi tác vụ Redis theo [ADR-0006](docs/06-decisions/0006-bullmq-for-core-background-jobs.md); cách bàn giao từ consumer sự kiện và khôi phục cần đặc tả.
- **Seat Map Synchronization**: Core NestJS SSE/RxJS báo thay đổi, TanStack Query lấy snapshot, tái dùng fetch/parser theo [ADR-0029](docs/06-decisions/0029-core-sse-and-query-for-seat-map-synchronization.md). Outbox/CDC/Kafka → consumer → Redis Pub/Sub → các replica Core SSE; giữ polling fallback/resync định kỳ. Core quyết định ghế/TTL; chưa triển khai, chọn chu kỳ/SLO hoặc kiểm độ trễ và phục hồi.
- **Event Delivery**: Transactional Outbox trong PostgreSQL, Debezium CDC trên Kafka Connect và Apache Kafka ở chế độ KRaft theo [ADR-0007](docs/06-decisions/0007-transactional-outbox-debezium-kafka.md), phục vụ mục tiêu portfolio thể hiện kiến trúc phân tán. Kafka phân phối sự kiện, BullMQ quản lý job; chưa chọn topology/phiên bản hoặc xác nhận runtime.
- **Authentication**: Identity & Access Service sở hữu tích hợp Better Auth với form đăng nhập trực tiếp trên Web/Mobile, session và hướng JWT ký bất đối xứng/JWKS cho API theo [ADR-0008](docs/06-decisions/0008-better-auth-with-direct-login.md). Mỗi service kiểm quyền đối với tài nguyên của mình; OAuth Provider và Organization plugin chưa được chọn. Hợp đồng token, thu hồi và topology Auth còn cần thiết kế; chưa xác nhận runtime.
- **AI Agent Runtime**: Python + FastAPI + LangGraph, quản lý bằng uv theo [ADR-0009](docs/06-decisions/0009-python-fastapi-langgraph-and-uv-for-agent-service.md). Chọn module `langgraph` + `langchain-core`, checkpoint trong database PostgreSQL riêng của Agent qua `langgraph-checkpoint-postgres`/Psycopg 3 async pool và HTTPX async theo [ADR-0013](docs/06-decisions/0013-modular-agent-postgres-checkpoints-and-httpx.md). Adapter model và cấu hình còn cần thiết kế/kiểm chứng; chưa có runtime đã kiểm chứng.
- **Shared Contracts**: Zod 4 schemas cho API/event công khai trong `packages/contracts` có service sở hữu là nguồn hợp đồng; domain model, ORM và migration giữ riêng từng service; suy kiểu TypeScript, native export JSON Schema và `datamodel-code-generator` sinh Pydantic v2 theo [ADR-0014](docs/06-decisions/0014-zod-json-schema-and-pydantic-contracts.md). Chưa chuyển DTO/cài dependency hoặc chạy codegen; profile và kiểm tra tương thích còn cần đặc tả.
- **Agent Model**: Cloudflare Workers AI Free với `@cf/openai/gpt-oss-120b` làm primary theo [ADR-0012](docs/06-decisions/0012-cloudflare-workers-ai-and-gpt-oss-120b.md); Groq Free `openai/gpt-oss-120b` dự phòng theo [ADR-0028](docs/06-decisions/0028-groq-free-for-agent-provider-fallback.md). Hết cả hai quota/lỗi thì báo Agent gián đoạn và giữ booking trực tiếp, không tự trả phí; không bảo đảm AI 24/7. Agent gọi từ Python; hosting, routing, quota và chất lượng/độ trễ cần kiểm chứng.
- **Agent Observability**: LangSmith Cloud, bắt đầu bằng gói Developer miễn phí, cho tracing và đánh giá Agent theo [ADR-0010](docs/06-decisions/0010-langsmith-cloud-for-agent-observability.md); vùng, retention, kiểm soát quota/chi tiêu và tích hợp chưa được xác nhận. Dữ liệu nhạy cảm phải được loại/che trước khi xuất trace; quan sát nền tảng theo ADR-0020.
- **Platform Observability**: OpenTelemetry SDKs → Grafana Alloy → Grafana Cloud cho metrics/logs/traces, dashboard và cảnh báo theo [ADR-0020](docs/06-decisions/0020-opentelemetry-alloy-and-grafana-cloud.md). Giữ LangSmith riêng cho Agent; chưa chọn gói/vùng, sampling/SLO, topology hoặc xác nhận tracing xuyên event/job và runtime.
- **Testing Stack**: Vitest cho suite TypeScript mới, React Testing Library cho DOM; Jest/jest-expo/RNTL cho Mobile, pytest cho Agent; Playwright, Maestro, Testcontainers Node/Python và k6 theo [ADR-0021](docs/06-decisions/0021-layered-testing-stack-for-platform.md). Giữ suite `node:test` hiện có; chưa cài đặt, migrate hoặc xác nhận kiểm thử/runtime của stack mới.
- **CI và Build Artifacts**: GitHub Actions standard GitHub-hosted Linux VM runners, Docker Buildx/BuildKit và GHCR theo [ADR-0022](docs/06-decisions/0022-github-actions-buildx-and-ghcr-for-ci.md). Kiểm PR và tạo image truy được commit/digest; publish từ nguồn tin cậy theo trigger cần đặc tả. Chưa tạo workflow/Dockerfile, chạy CI hoặc publish; hosting/CD vẫn hoãn đến lúc chuẩn bị deploy.
- **Agent Streaming**: SSE + `sse-starlette` gửi text và sự kiện UI từ Agent về Web/Mobile theo [ADR-0011](docs/06-decisions/0011-sse-starlette-for-agent-streaming.md); lệnh/xác nhận dùng HTTP riêng. Client chọn browser fetch trên Web, expo/fetch trên Mobile và eventsource-parser chung theo [ADR-0024](docs/06-decisions/0024-fetch-and-eventsource-parser-for-sse-clients.md). Auth delivery, hợp đồng event, timeout và phục hồi sau mất kết nối cần thiết kế/kiểm chứng.
- **Transactional Email**: Notification Service tích hợp Resend theo [ADR-0018](docs/06-decisions/0018-resend-for-transactional-email.md); tích hợp server, idempotency 24 giờ và signed webhooks. Identity/Core vẫn phát hành/xác minh mã; email bảo mật dùng Claim Check, owner giữ payload mã hóa có hạn và Notification lấy qua HTTPS xác thực, không SQL chéo hoặc plaintext trong broker/log/trace/DLQ. Chưa chọn gói/domain/region, cấu hình tài khoản hoặc gửi email; chính sách gửi lại/hạn mã/lỗi vẫn còn mở theo mô hình sản phẩm.
- **Catalog Image Delivery**: R2 Standard giữ ảnh gốc; Cloudflare Images remote transformations tối ưu/resize/crop và cache các biến thể theo [ADR-0019](docs/06-decisions/0019-r2-and-cloudflare-images-for-catalog-media.md). Catalog giữ quyền xuất bản và metadata ảnh phim trong database riêng; Core giữ snapshot phiên bản phim cần cho suất, không sở hữu lại danh mục phim. Chưa chọn gói Images/domain, cấu hình upload/cache hoặc xác nhận runtime.
- **Design System Authority**: `DESIGN.md` và `packages/design-tokens` là nguồn thẩm quyền duy nhất về màu sắc (Rosso Corsa, Carbone Nero, Notte Profonda), kiểu chữ và quy chuẩn bố cục.
- **Application Boundaries**: Bốn app Customer/Organizer × Web/Mobile theo
  [ADR-0002](docs/06-decisions/0002-customer-organizer-app-boundaries.md). PRODUCT trong mỗi app ghi bối cảnh
  riêng và dẫn về mô hình nghiệp vụ chung; tên thư mục không cấp quyền mới.

## Core Concepts

- **Authoritative Core**: Cinema Core là thẩm quyền duy nhất xác nhận ghế và vé; AI Agent không tự ý xác nhận nếu chưa có chữ ký từ Core.
- **Sơ đồ ghế theo phòng**: Số ghế và bố trí do từng phòng cấu hình; giữ Standard, VIP và Sweetbox.
  Ma trận 64 ghế (8×8) là mẫu hiện có, không phải giới hạn sản phẩm mục tiêu.
- **Atomic Hold TTL**: Khóa giữ ghế nguyên tử toàn bộ trong 5 phút (300 giây); tự động giải phóng khi hết hạn.
- **E-Ticket QR**: QR chung của lượt đặt tra cứu quyền sử dụng theo ghế; không coi một lần quét là dùng hết đơn.

## Important Constraints

- **Security**: Kiểm tra quyền theo actor, dữ liệu và rạp được giao. Ba giá trị `CUSTOMER`,
  `CINEMA_STAFF`, `ORGANIZER_ADMIN` là hợp đồng hiện tại, chưa ánh xạ đầy đủ các vai trò mục tiêu;
  không suy chúng thành quyền mới. Không lưu trữ bí mật API trên client.
- **Performance**: Giữ vững trải nghiệm 60fps trên web và mobile; chuyển động tối ưu qua GPU composite (`transform`, `opacity`).
- **Compatibility**: Tương thích hoàn toàn chuẩn WCAG AA về khả năng tiếp cận (a11y) và điều hướng bàn phím.
- **Deployment**: Web Frontend (Next.js/Node) và Backend Services có thể triển khai độc lập; chưa chọn nhà cung cấp/topology hosting. Chủ sản phẩm chọn portfolio công khai online liên tục ngày 2026-11-17 trong hội thoại Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`): người tuyển dụng có thể trải nghiệm mà không cần hẹn bật demo. Dịch vụ thiết yếu chạy thường trực; đây chưa phải cam kết uptime/SLA, yêu cầu HA nhiều máy hoặc chấp thuận mua/triển khai hạ tầng.
  Cùng ngày, chủ sản phẩm yêu cầu **hoãn lựa chọn hosting/provider, topology và cấu hình máy đến lúc chuẩn bị deploy**.
  Các so sánh tại [nghiên cứu triển khai](docs/99-notes/deployment-approach-research.md) chỉ là tham khảo;
  chưa chọn VPS/Compose, Render, k3s, Oracle, Contabo hoặc máy tại nhà. Giữ mục tiêu online liên tục và ưu tiên tiết kiệm cho footprint demo.

## Technology Selection Criteria

Chủ sản phẩm xác nhận tiêu chí điều chỉnh trong hội thoại Tech Stack ngày 2026-11-16:

Mục tiêu là triển khai portfolio hoạt động, thể hiện năng lực lựa chọn công nghệ, tư duy hệ thống
và thiết kế hệ thống. Chủ sản phẩm làm rõ mục tiêu thể hiện năng lực **kiến trúc phân tán**, chấp nhận
thêm độ phức tạp vận hành cho luồng sự kiện tại ADR-0007. Mỗi lựa chọn cần gắn với bài toán,
đánh đổi, cách kiểm chứng và hướng mở rộng.
Chưa có yêu cầu tải sản xuất cụ thể; mốc kiểm thử tải cần được đề xuất và xác nhận như giả định
kiểm chứng, không trình bày thành số người dùng thực tế hoặc năng lực đã được chứng minh.

- Ưu tiên công nghệ hiện đại, có độ trưởng thành và hỗ trợ phù hợp; đánh giá theo nghiệp vụ,
  tính đúng đắn/an toàn, hiệu năng, khả năng mở rộng, kiểm thử và vận hành/bảo trì.
- Ngôn ngữ/framework không bị giới hạn bởi kinh nghiệm sẵn có của chủ sản phẩm. Chủ sản phẩm
  chấp nhận độ phức tạp cần thiết để chọn phương án phù hợp và hiệu quả; vẫn phải giải thích
  trách nhiệm vận hành, đánh đổi và cách đo kiểm, không coi độ mới hoặc số thành phần là bằng chứng tối ưu.
- Chi phí tiền tệ không dùng để loại hoặc hạ ưu tiên phương án kỹ thuật. Ưu tiên miễn phí trước đó
  không còn áp dụng; không giới hạn việc so sánh vào gói miễn phí hoặc Render Free.
- Riêng **cách triển khai portfolio**, ngày 2026-11-17 chủ sản phẩm đánh giá mốc 96 USD/tháng quá cao
  và yêu cầu nghiên cứu phương án tiết kiệm nhất. Giữ các công nghệ đã chốt và mục tiêu online liên tục;
  tối ưu provider/footprint triển khai, công khai quota, kỳ hạn thanh toán và rủi ro gián đoạn.
  Chưa chọn trần ngân sách, provider hoặc chấp thuận thay stack; không lấy cấu hình chưa đo làm mức tối thiểu.
- Với thành phần có phí, phải nói rõ phần nào tính phí, cách tính/giới hạn, ước tính theo giả định tải
  và nguồn giá/ngày tra cứu trước khi chốt. Phân biệt phí bản quyền với phí hạ tầng hoặc sử dụng;
  nếu chưa đủ dữ kiện để ước tính thì nêu phần còn thiếu, không mặc định chi phí bằng 0.
- Không suy hiệu năng từ độ mới hoặc benchmark của framework. Phân biệt khả năng do tài liệu
  công bố với kết quả đo của dự án; độ phức tạp vận hành và rủi ro nhất quán dữ liệu vẫn là đánh đổi kỹ thuật.

## Major Invariants

- Cinema Core là thẩm quyền duy nhất cho mọi trạng thái ghế, giữ chỗ và vé.
- AI Agent không bao giờ bịa đặt (hallucinate) trạng thái vé khi chưa có phản hồi từ Core.
- Tất cả các ứng dụng tuân thủ nghiêm ngặt bảng màu và typography tại `DESIGN.md`.

## Development Workflow

- Quản lý phạm vi công việc, kế hoạch và tiến độ trên GitHub Issues.
- Triển khai mã nguồn, kiểm thử tự động và review thông qua Pull Requests.
- Tuân thủ quy trình GitHub Spec Kit (`.specify/`) cho các đặc tả kỹ thuật và kế hoạch thực thi.

## Current State

Hiện trạng của bản làm việc và giới hạn mô phỏng được ghi tại [CONTEXT.md](CONTEXT.md).
Mô hình use case là yêu cầu mục tiêu đã xác nhận; tài liệu này không dùng kết quả test cũ hoặc
sự hiện diện của màn hình/scaffold để khẳng định giao dịch, tích hợp hay phân quyền đã vận hành.

## Open Questions

- Nâng cấp tìm kiếm/khám phá: nền search Typesense + PostgreSQL đã chọn tại ADR-0030;
  phương pháp theo nội dung + hồ sơ đã chọn tại ADR-0031, còn cần hoàn thiện phạm vi/chính sách/công thức.
  Provider embedding chọn Cloudflare Workers AI API tại ADR-0032, model Qwen3 Embedding 0.6B tại ADR-0033;
  backend điều phối API và Typesense nhận external vectors tại ADR-0034.
  Module Search thuộc Core và BullMQ indexing nền tại ADR-0035; Agent dùng API Core.
  Dimensions/preprocessing, cấu trúc module/adapter và cấu hình chi tiết còn cần đặc tả/kiểm chứng.
  Ngày 2026-11-17 trong hội thoại Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`),
  đã chọn **nguồn tín hiệu B**: sở thích khai báo, phim yêu thích, đánh giá, lịch sử mua vé đã xác nhận,
  cộng lượt xem chi tiết phim, click kết quả và lịch sử tìm kiếm. Không tự gộp toàn bộ hội thoại Agent.
  Phạm vi nguồn tín hiệu/nhận diện/người mới được sở hữu bởi BR-21 của
  [mô hình sản phẩm](docs/03-product/use-cases.md#4-quy-tắc-đã-thống-nhất).
  Cùng ngày, đã chọn **phạm vi nhận diện A**: khách chưa đăng nhập cá nhân hóa theo phiên;
  hồ sơ lâu dài gắn với tài khoản đăng nhập, dùng xuyên các lần truy cập/thiết bị. Tìm/khám phá phim
  không bắt buộc đăng nhập; không chọn hồ sơ khách ẩn danh bền qua nhiều lần truy cập.
  Đã chọn **người mới B**: không hỏi sở thích khi bắt đầu; cho khám phá ngay theo danh mục/ngữ cảnh,
  dần điều chỉnh từ tương tác. Không tự thêm bước onboarding chọn thể loại/phim.
  Đã chọn **kiểm soát cá nhân hóa A**: bật/tắt học và dùng hồ sơ sở thích; đặt lại dữ liệu đã học,
  giữ đơn hàng/vé; chưa thêm xem/xóa từng tương tác theo
  [BR-18](docs/03-product/use-cases.md#4-quy-tắc-đã-thống-nhất).
  Đã chọn **chuyển phiên khách A**: không nhập hành vi phiên khách vào hồ sơ khi đăng nhập;
  giữ hồ sơ tài khoản hiện có, học tiếp từ tương tác sau đăng nhập khi cá nhân hóa được bật theo
  [BR-19](docs/03-product/use-cases.md#4-quy-tắc-đã-thống-nhất). Tránh trộn sở thích khi dùng chung thiết bị,
  chấp nhận không mang tín hiệu khách sang hồ sơ lâu dài; chưa quy định xóa ngay dữ liệu phiên khách.
  Đã chọn **thứ hạng A**: tìm kiếm ưu tiên truy vấn, tên phim/alias khớp chính xác đứng trước;
  sở thích chỉ sắp xếp các kết quả phù hợp tương đương, trang khám phá có thể cá nhân hóa mạnh hơn.
  Giữ đúng bộ lọc theo [BR-20](docs/03-product/use-cases.md#4-quy-tắc-đã-thống-nhất).
  Cách xác định/hết hạn phiên khách, retention và xử lý tín hiệu cũ khi đặt lại/bật lại giữ tại OPEN-11.
  Công thức/trọng số/ngưỡng xếp hạng, hợp đồng tracking và tiêu chí chất lượng cần đặc tả/kiểm chứng
  trước triển khai. Các quyết định mục tiêu này chưa cho phép triển khai thu thập dữ liệu.
  [Nghiên cứu kiến trúc search](docs/99-notes/movie-search-architecture-research.md) so PostgreSQL hybrid,
  Typesense và OpenSearch; [nghiên cứu cá nhân hóa/embedding](docs/99-notes/movie-personalization-and-embedding-research.md)
  giữ các phương pháp và giới hạn quota. ADR-0030/0031 sở hữu lựa chọn search/phương pháp cá nhân hóa;
  ADR-0032/0033 sở hữu lựa chọn provider/model embedding; công thức chi tiết vẫn còn mở.
- Tích hợp thanh toán đã chọn HTTP trực tiếp + Node fetch/crypto tại ADR-0027; profile merchant,
  test vectors (đặc biệt bất nhất tài liệu ký response MoMo), quyền/phí và lỗi/đối soát cần xác minh,
  đặc tả và kiểm sandbox trước tích hợp. [Nghiên cứu thanh toán](docs/99-notes/payment-gateway-integration-research.md)
  giữ bằng chứng/giới hạn nguồn; không suy lựa chọn thành đã vận hành.
- Primary Workers AI Free và dự phòng Groq Free 120B đã chọn tại ADR-0028. Còn cần đặc tả/kiểm routing,
  retry/circuit breaker, capability/stream và cách tiếp tục booking trực tiếp khi cả hai gián đoạn.
  [Nghiên cứu khả năng phục hồi Agent](docs/99-notes/agent-provider-resilience-research.md) giữ đánh đổi;
  không cho phép nâng gói/chi tiêu hoặc hứa hai free tier bảo đảm AI 24/7.
- Kênh đồng bộ ghế đã chọn tại ADR-0029; còn cần đặc tả contract/revision, snapshot/event race,
  expiry, freshness bình thường/suy giảm, chu kỳ polling/resync và kiểm fanout/phục hồi qua các replica.
  [Nghiên cứu đồng bộ ghế](docs/99-notes/seat-map-synchronization-research.md) giữ đánh đổi và giới hạn.
- Thuật toán khóa Redis, ngưỡng chuyển/quay lại đường giữ ghế dự phòng PostgreSQL, hàng đợi và cấu hình triển khai theo phần còn mở của ADR-0004.
- Topology/HA/backup, chi tiết khóa/isolation và các hợp đồng còn mở cần đặc tả theo
  [mục 7 của thiết kế microservices](docs/05-specs/004-service-decomposition/spec.md#7-đánh-đổi-và-phần-để-mở).
  Không suy lựa chọn công nghệ thành cơ chế đã triển khai hoặc kết quả runtime.
- Các chính sách nghiệp vụ chưa chốt giữ tại [OPEN-01–OPEN-10](docs/03-product/use-cases.md#6-các-quyết-định-còn-mở);
  tham chiếu nguồn này thay vì tạo danh sách chính sách song song.
