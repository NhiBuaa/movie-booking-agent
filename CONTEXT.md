---
status: active
last_verified: 2026-11-17
---

# Current Project Context

## Current Phase

- **Stage:** Scaffold monorepo và tích hợp Web/BFF; mô hình sản phẩm mục tiêu đã được xác nhận.
- **Active Playbook:** [Phát triển tính năng](docs/07-guides/feature-development-playbook.md) cho phần
  triển khai tiếp theo, trên nền [mô hình use case](docs/03-product/use-cases.md) đã chốt.
- **Work Tracking:** Phạm vi, tiến độ và kế hoạch nằm trong Issues; thay đổi và kiểm chứng nằm trong PR.

## Boundary & Surface

- **Project Name:** movie-booking-agent
- **Has UI Surface:** True
- **Platform Architecture:** Bốn app `customer-web`, `customer-mobile`, `organizer-web`, `organizer-mobile`
  theo [ADR-0002](docs/06-decisions/0002-customer-organizer-app-boundaries.md); backend đích gồm 7 service
  theo [thiết kế microservices](docs/05-specs/004-service-decomposition/spec.md): Cinema Core, Agent,
  Catalog, Identity & Access, Notification, Community và Reporting. Đã có đủ bảy thư mục service
  với README trách nhiệm; chưa có code hoặc cấu hình chạy service, không phải bằng chứng có runtime.
  Hai app Mobile nhắm iOS/Android; phần nhân viên soát vé thuộc Organizer Mobile. Chỉ Customer Web có mã nguồn;
  ba app còn lại mới có tài liệu mục tiêu, chưa có build/runtime được xác nhận.
- **Target Product:** Một đơn vị/chuỗi rạp; actor, phạm vi, BR và OPEN do mô hình use case sở hữu.
  Cấu trúc thư mục không chứng minh từng phân hệ đã vận hành.

## Current State

Các ghi nhận dưới đây lấy từ lần đọc mã tại `549d7b2f76e63aefe34e0c3799c3d28495cdf868` và bộ tài liệu
use case ngày 2026-11-16. Đây là mốc đối chiếu đã ghi nhận, không tái xác nhận code ở commit mới hơn;
không dùng trạng thái checkout khác làm bằng chứng của bản này.

- Web có Route Handlers và adapter mô phỏng; chưa phải tích hợp Cinema Core runtime đã xác nhận.
- Hợp đồng hiện có nằm tại `packages/contracts`. Vai trò, vòng đời vé và phạm vi phương thức thanh toán
  trong code chưa đồng nhất đầy đủ với sản phẩm mục tiêu.
- `DESIGN.md` và `packages/design-tokens/tokens.css` sở hữu thiết kế; `.specify/` chứa hiến pháp/template.
- [Mục 7 của mô hình use case](docs/03-product/use-cases.md#7-hiện-trạng-và-chênh-lệch-so-với-mục-tiêu)
  ghi nguồn và chênh lệch với code. Xác nhận tài liệu không thay cho kiểm thử hoặc chạy ứng dụng.
- Các kết quả kiểm thử từng được báo cáo trước đợt này không được tái xác nhận như kết quả hiện tại.
  Bằng chứng theo đúng bản code thuộc PR tương ứng.

## Active Direction

Dùng mô hình mục tiêu làm đầu vào cho đặc tả và kiểm chứng từng tính năng trước khi sửa code.
Các ranh giới service/dữ liệu/giao tiếp đã chốt được sở hữu bởi
[thiết kế](docs/05-specs/004-service-decomposition/spec.md) và
[quyết định](docs/05-specs/004-service-decomposition/decisions.md) ngày 2026-11-17.
Bản tổng hợp vẫn chờ chủ sản phẩm đọc lại; việc đồng bộ tài liệu không thay trạng thái chấp thuận đó.
Các đặc tả feature tại `docs/05-specs/<feature>/` giữ phạm vi kỹ thuật riêng; thay đổi contracts, phân quyền, giữ ghế và vòng đời vé
phải được thiết kế/kiểm thử theo workflow Spec Kit, không suy ra là đã thực hiện từ lần đồng bộ docs.
[Thiết kế dữ liệu Feature 005](docs/05-specs/005-data-design/spec.md) đã có ERD, từ điển dữ liệu cho
7 database logic, luồng giao dịch và cấu trúc kho hỗ trợ. Xem Mục 1 và 7 của đặc tả để biết phạm vi đã
review, các quyết định kỹ thuật đã duyệt và phần còn chờ nghiệm thu. Migration và kiểm chứng vận hành thuộc giai đoạn triển khai.

## BFF hiện tại và nguồn đối chiếu mới hơn

[Tài liệu BFF](docs/05-specs/002-web-bff-routes/spec.md) và
[kế hoạch kỹ thuật](docs/05-specs/002-web-bff-routes/plan.md) đã được đồng bộ với implementation tại
`2ce4893d66fa002f88a2208492f9aff19b4252f2`, sau mốc đọc mã ban đầu của mô hình use case.
Các ghi nhận dưới đây lấy từ nguồn kỹ thuật đó; lần xử lý xung đột tài liệu này không chạy lại runtime.

- Core độc lập chưa có runtime; `CINEMA_CORE_URL` chưa được đấu nối. BFF dùng process-memory Maps,
  dữ liệu mất khi khởi động lại, chưa có DB/khóa phân tán.
- Header `x-user-email` là định danh mô phỏng, chưa phải session/JWT có xác minh.
- BFF đã mô tả xác thực HMAC webhook và ký vé bằng `CINEMA_CORE_WEBHOOK_SECRET`/
  `CINEMA_CORE_TICKET_SECRET`. Production thiếu secret trả `SERVER_CONFIGURATION_ERROR`,
  không fallback khóa phát triển. Không mang nhận xét webhook cũ tại mốc `549d7b2` sang code mới.
- Vé chỉ tạo sau kết quả hợp lệ; đơn `CONFIRMED` được bảo toàn trước webhook muộn. Khoản thu thêm
  từ attempt khác và thu sau hết hạn được đưa vào đối soát, chưa chứng minh hoàn tiền thực đã tích hợp.
- Các kết quả test của phiên code nằm trong PR tương ứng, không được tái xác nhận từ việc merge docs.

## Known Limitations

- Adapter ghế/đơn/thanh toán trong Web dùng dữ liệu in-memory và fixture; chưa có bằng chứng giao dịch thật.
- Mẫu ghế và UI fixture hiện chưa thống nhất; mục tiêu là sơ đồ theo phòng, không cố định 64 ghế.
- `ETicketDto` còn trạng thái chung và yêu cầu soát chưa chọn tập ghế; chưa đại diện đầy đủ soát/hủy một phần.
- Ba role hiện tại chưa xác định ánh xạ cho các vai trò vận hành mục tiêu.
- Logic chat hiện ở client theo quy tắc; Cloudflare Workers AI + GPT-OSS 120B đã được chọn tại
  [ADR-0012](docs/06-decisions/0012-cloudflare-workers-ai-and-gpt-oss-120b.md), chưa xác nhận tích hợp runtime.
  Resend đã được chọn cho Notification Service chuyển phát email tại [ADR-0018](docs/06-decisions/0018-resend-for-transactional-email.md),
  chưa xác nhận tích hợp; Q149 đã chốt chính sách lỗi/gửi lại, tham số/cấu hình còn mở.
- R2 Standard và Cloudflare Images đã chọn cho ảnh danh mục tại
  [ADR-0019](docs/06-decisions/0019-r2-and-cloudflare-images-for-catalog-media.md);
  Catalog sở hữu nội dung/metadata ảnh phim, Core giữ snapshot theo suất; chưa cấu hình upload/biến thể/cache hoặc xác nhận runtime. Trailer dùng URL/embed nguồn ngoài.
- OpenTelemetry + Grafana Alloy + Grafana Cloud đã chọn cho quan sát nền tảng tại
  [ADR-0020](docs/06-decisions/0020-opentelemetry-alloy-and-grafana-cloud.md), giữ LangSmith riêng cho Agent.
  Chưa chọn gói/topology hoặc xác nhận instrumentation, dashboard/cảnh báo và telemetry runtime.
- Bộ kiểm thử mục tiêu đã chọn tại [ADR-0021](docs/06-decisions/0021-layered-testing-stack-for-platform.md).
  Chưa cài công cụ, migrate suite `node:test` hoặc chạy stack kiểm thử mới;
  lựa chọn không tái xác nhận kết quả test trước đây.
- GitHub Actions với GitHub-hosted Linux, Buildx/BuildKit và GHCR đã chọn tại
  [ADR-0022](docs/06-decisions/0022-github-actions-buildx-and-ghcr-for-ci.md).
  [Workflow CI nền](.github/workflows/ci.yml) kiểm suite `node:test`, kiểu, build Customer Web và tài liệu
  cho PR vào `main`/push `main`; bằng chứng thực thi theo SHA thuộc PR/Actions tương ứng.
  Chưa có Dockerfile hoặc publish image; hosting/CD chưa chọn, giữ quyết định hoãn.
- MMKV bật mã hóa + SecureStore giữ khóa đã chọn cho snapshot vé offline trên Customer Mobile tại
  [ADR-0023](docs/06-decisions/0023-encrypted-mmkv-for-offline-mobile-tickets.md).
  Chưa cài/build hoặc kiểm mã hóa/native lifecycle; thiết bị nhân viên vẫn cần Core online khi soát.
- Browser fetch trên Web, expo/fetch trên Mobile và eventsource-parser chung đã chọn cho SSE client tại
  [ADR-0024](docs/06-decisions/0024-fetch-and-eventsource-parser-for-sse-clients.md).
  Chưa viết adapter/kiểm streaming runtime; auth delivery, lifecycle và phục hồi còn cần đặc tả.
- React Hook Form + resolvers + Zod 4 đã chọn cho form nghiệp vụ tại
  [ADR-0025](docs/06-decisions/0025-react-hook-form-and-zod-for-frontend-forms.md), giữ React state cho form nhỏ.
  Chưa cài/migrate form hoặc kiểm SSR/native; Core vẫn kiểm payload/quyền và quyết định giao dịch.
- React Aria Components đã chọn cho nền tương tác Web/Organizer tại
  [ADR-0026](docs/06-decisions/0026-react-aria-components-for-web-ui-primitives.md); giữ CSS modules/tokens
  và component native riêng trên Mobile. Chưa cài, migrate UI hoặc kiểm accessibility/SSR/runtime.
- HTTP trực tiếp + Node fetch/crypto, adapter MoMo/VNPAY riêng đã chọn tại
  [ADR-0027](docs/06-decisions/0027-direct-http-and-node-crypto-for-payment-gateways.md).
  Chưa viết adapter, gọi sandbox/production, xác nhận merchant/phí hoặc vectors; giữ chính sách hoàn còn mở.
- Groq Free GPT-OSS 120B đã chọn làm dự phòng cho primary Cloudflare Free tại
  [ADR-0028](docs/06-decisions/0028-groq-free-for-agent-provider-fallback.md).
  Nếu cả hai không dùng được, mục tiêu là báo Agent gián đoạn/giữ booking trực tiếp; chưa triển khai routing/UI
  hoặc xác minh quota/runtime. Không chấp thuận trả phí; free fallback không là bảo đảm AI 24/7.
- Core SSE + Query snapshot, Redis Pub/Sub fanout, polling fallback/resync đã chọn tại
  [ADR-0029](docs/06-decisions/0029-core-sse-and-query-for-seat-map-synchronization.md).
  Chưa viết endpoint/consumer/client, chọn chu kỳ/freshness hoặc kiểm realtime/multi-replica/runtime;
  PostgreSQL/Core vẫn quyết định ghế và TTL, không chờ Kafka để xác nhận hold.
- Typesense OSS đã chọn làm chỉ mục tìm kiếm phim lexical/vector dẫn xuất tại
  [ADR-0030](docs/06-decisions/0030-typesense-for-movie-search-and-discovery.md), bổ sung ngoại lệ search của ADR-0003.
  Model embedding theo ADR-0033; chưa cài server/client, tạo index, viết consumer, chọn công thức rank hoặc kiểm chất lượng Việt/tải/runtime.
  BFF/UI search hiện vẫn dùng fixture; quyết định không xác nhận nâng cấp đã tích hợp hoặc tracking đã triển khai.
- Phương pháp content-based + hồ sơ phiên/tài khoản đã chọn tại
  [ADR-0031](docs/06-decisions/0031-content-based-and-profile-scoring-for-personalization.md).
  Chưa triển khai profile/ranker/tracking; collaborative chỉ xem xét sau khi có dữ liệu/bằng chứng,
  LLM không là phụ thuộc bắt buộc. Model embedding theo ADR-0033; trọng số và chính sách dữ liệu còn mở.
  Quyền bật/tắt cá nhân hóa và đặt lại dữ liệu đã học được chọn tại
  [BR-40](docs/03-product/use-cases.md#4-quy-tắc-đã-thống-nhất); không xóa đơn/vé.
  Khi đăng nhập không nhập hành vi phiên khách vào hồ sơ tài khoản, giữ hồ sơ hiện có và học tiếp
  sau đăng nhập khi cá nhân hóa được bật theo [BR-41](docs/03-product/use-cases.md#4-quy-tắc-đã-thống-nhất).
  Chưa triển khai control/chuyển phiên hoặc chốt retention, thời hạn phiên khách và xử lý tín hiệu cũ khi đặt lại/bật lại.
  Thứ hạng tìm kiếm ưu tiên truy vấn và tên/alias chính xác; cá nhân hóa giữa kết quả phù hợp tương đương,
  mạnh hơn ở trang khám phá nhưng giữ bộ lọc theo [BR-42](docs/03-product/use-cases.md#4-quy-tắc-đã-thống-nhất).
  Công thức/trọng số/ngưỡng và chất lượng thực tế chưa được xác minh.
- Cloudflare Workers AI API đã chọn làm provider embedding tại
  [ADR-0032](docs/06-decisions/0032-cloudflare-workers-ai-for-managed-embeddings.md), trong allocation miễn phí
  dùng chung với chat. Model `@cf/qwen/qwen3-embedding-0.6b` được chọn tại
  [ADR-0033](docs/06-decisions/0033-qwen3-embedding-for-movie-retrieval.md); chiều vector/preprocessing và adapter chưa kiểm chứng.
  [ADR-0034](docs/06-decisions/0034-backend-orchestrated-external-embeddings.md) chọn backend điều phối API
  và Typesense nhận vector ngoài, không dùng auto-embedding.
  [ADR-0035](docs/06-decisions/0035-search-module-in-cinema-core.md) chọn module Search thuộc Core,
  BullMQ indexing nền từ hợp đồng/sự kiện Catalog, Community và owner liên quan; không SQL chéo. Agent gọi API Core. Cấu trúc module/adapter, giới hạn tài nguyên và cách tách worker còn mở.
  Chưa gọi API, tạo vector/index hoặc cấu hình quota/billing/runtime.
- Thiết kế đích giữ Agent đề xuất → app/BFF thực thi bằng quyền khách và mã thao tác ổn định;
  Notification chuyển phát bất đồng bộ, email bảo mật dùng Claim Check theo mục 4 của thiết kế.
  Identity giữ Better Auth, Notification giữ Resend, Catalog giữ media phim; checkpoint thuộc database Agent. Các lựa chọn này chưa chứng minh đã tích hợp các ranh giới hoặc chọn framework cho năm service bổ trợ.
- [OPEN-01–OPEN-10](docs/03-product/use-cases.md#6-các-quyết-định-còn-mở) được giữ nguyên;
  OPEN-11 tập hợp chính sách dữ liệu cá nhân hóa còn mở sau các lựa chọn tại BR-40–43;
  thiếu chính sách liên quan thì chưa được tuyên bố sẵn sàng vận hành chức năng đó.

## Canonical References

- [Nền tảng dự án](PROJECT-OVERVIEW.md) và [bản đồ tài liệu](docs/README.md).
- [Mô hình sản phẩm](docs/03-product/use-cases.md), [mô tả](docs/03-product/use-case-descriptions.md),
  [thuật ngữ](GLOSSARY.md) và [quy chuẩn UML](docs/04-standards/use-case-modeling.md).
- [Hiến pháp](.specify/memory/constitution.md), [ranh giới hệ thống](docs/02-architecture/system-boundaries.md)
  và [đặc tả nghiệp vụ](docs/05-specs/domain-context.md).
- [Kiến trúc microservices](docs/05-specs/004-service-decomposition/spec.md) và
  [nguồn chấp thuận/lý do](docs/05-specs/004-service-decomposition/decisions.md).
- [Cấu hình agent](.agents/README.md), [chuẩn UI](docs/04-standards/ui-quality.md)
  và [điều phối skill UI](.agents/rules/ui-skill-routing.md).
- [Công cụ phát triển](docs/07-guides/development-tools.md): chọn PRODUCT theo app, quy trình Impeccable/live
  và CodeGraph theo worktree. Cài công cụ/có index không xác nhận code hoặc giao dịch đã vận hành.
- Quản lý công việc và bằng chứng kiểm chứng: GitHub Issues/PRs.

## Chính sách UML đã đồng bộ

Q32–Q172 và xác nhận Q173 đã được đồng bộ trong mô hình/mô tả/BR và PRODUCT. Các nhóm OPEN-01…10
đã có lựa chọn sản phẩm; phần đặc tả/kiểm chứng vẫn giữ. OPEN-11 về chính sách dữ liệu cá nhân hóa còn mở.
OPEN-12 đã có quyết định tiếp nối cho chuyển dự phòng inference có kiểm soát, nêu tại Mục 6 của
[thiết kế dữ liệu](docs/05-specs/005-data-design/spec.md). Cấu hình và kiểm chứng routing còn mở.
BR-40…BR-43 là mã mới của bốn BR cá nhân hóa upstream, nội dung giữ nguyên.
Chính sách email lỗi/gửi lại đã chọn ở Q149; tham số/tích hợp Resend còn chưa kiểm chứng.
