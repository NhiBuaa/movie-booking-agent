# Cinema Core Service (`services/cinema-core`)

**Phạm vi tài liệu:** trách nhiệm backend mục tiêu; README/scaffold không chứng minh runtime đã hoạt động.
[Mô hình sản phẩm](../../docs/03-product/use-cases.md) sở hữu actor/BR/OPEN;
[đặc tả giao dịch](../../docs/05-specs/domain-context.md) diễn giải ràng buộc cần triển khai.

**Framework đã chọn:** NestJS + Fastify cho Core theo
[ADR-0036](../../docs/06-decisions/0036-nestjs-fastify-for-cinema-core.md).
Lựa chọn framework chưa phải bằng chứng runtime đã hoạt động.

**Kho dữ liệu đã chọn:** PostgreSQL làm kho nghiệp vụ chính và Redis có mặt từ bản đầu theo
[ADR-0003](../../docs/06-decisions/0003-postgresql-and-redis-for-platform-data.md).
Redis phục vụ cache, giới hạn tần suất, hàng đợi và điều phối giữ ghế theo
[ADR-0004](../../docs/06-decisions/0004-redis-roles-and-seat-hold-coordination.md).
Khi Redis lỗi ở bước điều phối hold, Core dùng đường dự phòng PostgreSQL với cùng bảo vệ giao dịch
theo ADR-0004. Thuật toán khóa, ngưỡng chuyển chế độ và cấu hình triển khai chưa chốt.

**Lớp truy cập database đã chọn:** Drizzle ORM và Drizzle Kit theo
[ADR-0005](../../docs/06-decisions/0005-drizzle-orm-and-kit-for-cinema-core.md).
Driver, phiên bản và schema/migration cụ thể cần thiết kế trước triển khai.

**Nền tìm kiếm đã chọn:** Typesense OSS làm chỉ mục lexical/vector dẫn xuất theo
[ADR-0030](../../docs/06-decisions/0030-typesense-for-movie-search-and-discovery.md), cập nhật từ luồng
outbox/CDC/Kafka theo hợp đồng của service sở hữu. Catalog sở hữu nội dung phim, Community sở hữu
đánh giá/yêu thích; Core không đọc SQL của họ. Core kiểm điều kiện giao dịch, lịch/giá/ghế;
index không xác nhận còn ghế. Hợp đồng projection/visibility cần đặc tả trước triển khai.
Lớp ứng dụng giữ personalization theo nội dung + hồ sơ tại
[ADR-0031](../../docs/06-decisions/0031-content-based-and-profile-scoring-for-personalization.md).
Module Search thuộc Core, BullMQ xử lý indexing nền theo
[ADR-0035](../../docs/06-decisions/0035-search-module-in-cinema-core.md); Agent/client dùng API Core.
Chưa chọn weights hoặc triển khai module/pipeline/ranker; chưa chọn cách tách tiến trình worker.
Provider tạo embedding chọn Cloudflare Workers AI API theo
[ADR-0032](../../docs/06-decisions/0032-cloudflare-workers-ai-for-managed-embeddings.md), model
`@cf/qwen/qwen3-embedding-0.6b` theo [ADR-0033](../../docs/06-decisions/0033-qwen3-embedding-for-movie-retrieval.md).
Chiều vector/preprocessing và chất lượng truy xuất chưa được kiểm chứng.
Backend điều phối API và Typesense nhận external vectors theo
[ADR-0034](../../docs/06-decisions/0034-backend-orchestrated-external-embeddings.md), không dùng auto-embedding.
Không thêm encoder local hoặc Search Service riêng ở bản đầu; cấu trúc adapter/module/worker,
giới hạn tài nguyên để bảo vệ giao dịch và chính sách dữ liệu cần đặc tả.

**Tác vụ nền đã chọn:** BullMQ và `@nestjs/bullmq` theo
[ADR-0006](../../docs/06-decisions/0006-bullmq-for-core-background-jobs.md).
Kafka phụ trách sự kiện, BullMQ quản lý job; cách bàn giao sang job, khôi phục và chính sách retry cần đặc tả.

**Phát sự kiện đã chọn:** Transactional Outbox trong PostgreSQL + Debezium CDC trên Kafka Connect +
Apache Kafka KRaft theo [ADR-0007](../../docs/06-decisions/0007-transactional-outbox-debezium-kafka.md).
Core ghi nghiệp vụ và outbox cùng transaction; consumer cần chống lặp. Chưa chọn topology,
phiên bản, client Kafka hoặc xác nhận pipeline runtime.

**Đồng bộ sơ đồ ghế đã chọn:** NestJS SSE/RxJS + TanStack Query snapshot; outbox/CDC/Kafka →
consumer chuyển thông báo → Redis Pub/Sub → các replica Core SSE theo
[ADR-0029](../../docs/06-decisions/0029-core-sse-and-query-for-seat-map-synchronization.md).
Giữ polling fallback và resync định kỳ cả khi stream sống; thông báo mất được, Core vẫn quyết định ghế/TTL.
Chưa viết endpoint/consumer, pin client Redis, chọn chu kỳ/SLO hoặc kiểm multi-replica/proxy/runtime.

**Xác thực đã chọn:** [Identity](../identity-service/README.md) sở hữu Better Auth, phiên và cấp bằng chứng
theo [ADR-0008](../../docs/06-decisions/0008-better-auth-with-direct-login.md). Core kiểm JWT/JWKS và quyền theo
người dùng, rạp và tài nguyên; không coi token hợp lệ là đủ quyền nghiệp vụ. Hợp đồng token,
thu hồi/luân chuyển khóa cụ thể còn cần đặc tả; Auth thuộc Identity, không chạy như module sở hữu dữ liệu Core.
Chưa có bằng chứng tích hợp runtime.

**Email giao dịch đã chọn:** [Notification](../notification-service/README.md) chuyển phát qua Resend theo
[ADR-0018](../../docs/06-decisions/0018-resend-for-transactional-email.md).
Handoff sự kiện/job, theo dõi gửi/webhook và chống lặp cần đặc tả; chưa chọn gói/domain hoặc gửi thư.
Email vé lỗi không đổi trạng thái thanh toán/vé Core; chính sách mã/gửi lại/lỗi vẫn thuộc OPEN-09.

**Tích hợp thanh toán đã chọn:** HTTP trực tiếp + Node `fetch`/`node:crypto`, adapter riêng MoMo/VNPAY theo
[ADR-0027](../../docs/06-decisions/0027-direct-http-and-node-crypto-for-payment-gateways.md).
Tách canonical signing/IPN/query/refund từng cổng/operation; không áp raw JSON signing chung hoặc coi redirect
là xác nhận. Core giữ trạng thái/chống lặp/đối soát; chưa viết adapter/gọi sandbox, xác nhận merchant/phí
hoặc giải quyết bất nhất tài liệu ký response MoMo. Chữ ký cổng và bằng chứng vé Core là hai ranh giới riêng.

**Ảnh danh mục đã chọn:** [Catalog](../catalog-service/README.md) sở hữu metadata/quyền upload/xuất bản,
R2 Standard giữ ảnh gốc và Cloudflare Images remote transformations theo
[ADR-0019](../../docs/06-decisions/0019-r2-and-cloudflare-images-for-catalog-media.md).
Upload hoàn tất không tự công bố ảnh; Core giữ snapshot cần cho suất, không sở hữu kho media Catalog.
Chưa cấu hình bucket/domain, kiểm tra object/cache hoặc xác nhận runtime.

**Quan sát nền tảng đã chọn:** OpenTelemetry + Grafana Alloy + Grafana Cloud theo
[ADR-0020](../../docs/06-decisions/0020-opentelemetry-alloy-and-grafana-cloud.md).
Luồng outbox/Kafka/BullMQ cần đặc tả propagation và đo riêng; chưa cài instrumentation/gửi telemetry,
chọn gói Cloud hoặc xác nhận dashboard/cảnh báo. Telemetry không là bằng chứng giao dịch thành công.

**Kiểm thử mục tiêu:** Vitest, Testcontainers Node và k6 theo
[ADR-0021](../../docs/06-decisions/0021-layered-testing-stack-for-platform.md).
Tích hợp phải dùng đúng FastifyAdapter và kiểm DB/effects; chưa cấu hình hoặc chạy.

## Core Responsibilities

- **Rạp và lịch**: Rạp/phòng/sơ đồ ghế, lịch chiếu, giá/điều kiện bán. Catalog sở hữu nội dung phim;
  Core lấy snapshot có phiên bản qua HTTP khi lập/công bố suất và lưu cùng suất để dùng khi đặt/soát.
- **Authoritative Core**: Tồn kho theo suất và sơ đồ riêng của từng phòng, giá, hold nguyên tử 300 giây,
  xác nhận thanh toán, phát hành và sử dụng vé; không lấy fixture 64 ghế làm giới hạn sản phẩm.
- **Thanh toán và hoàn tiền**: MoMo/VNPAY; xác thực nguồn/chữ ký, số tiền và liên kết đơn, xử lý lặp
  và đối soát. Theo dõi hoàn tiền riêng với quyết định hủy. Cổng/cách tích hợp theo ADR-0027;
  profile merchant, cấu hình tích hợp và cơ chế khóa cụ thể cần đặc tả/kiểm chứng.
- **Vé và soát vé**: Một QR chung cho lượt đặt, quyền/trạng thái theo ghế; kiểm tra và ghi nhận sử dụng
  qua Core để chống dùng lặp, kể cả đồng thời nhiều cửa. Thiết bị nhân viên phải online.
- **Hủy theo quyền**: Thực thi quyết định hủy đã được người có quyền duyệt, giữ phần quyền còn lại;
  hủy suất đã duyệt có hiệu lực tại Core trước xử lý nền từng đơn. Không tự cấp quyền hoàn thủ công
  hoặc chốt cách xử lý sự cố còn mở.
- **Module trong Core**: Hội viên, Ưu đãi/Voucher và Combo dùng interface và transaction cục bộ;
  không tách thành service/database riêng trong thiết kế đã chọn.

## Service Boundaries

[Thiết kế microservices](../../docs/05-specs/004-service-decomposition/spec.md) sở hữu hợp đồng kiến trúc;
[quyết định](../../docs/05-specs/004-service-decomposition/decisions.md) giữ lý do và nguồn duyệt.
Core sở hữu database PostgreSQL logic riêng; không đọc SQL của service khác. Sự kiện đã commit qua
outbox/CDC/Kafka phục vụ Reporting, Notification và căn cứ đánh giá của Community.
Lệnh dùng mã thao tác ổn định, ngoại tác thanh toán/hoàn nằm ngoài transaction database.

Identity sở hữu danh tính/quyền; Core kiểm bằng chứng cục bộ khi soát/giao combo thường xuyên và áp dụng
thu hồi đã biết, không gọi Identity ở mỗi lượt. Webhook/đối soát độc lập với phiên khách; tác vụ rủi ro
cao cần quyền hiện hành. Notification chuyển phát nhưng không sở hữu/xác minh mã nghiệp vụ;
email có mã nhạy cảm dùng Claim Check qua luồng riêng theo thiết kế, không plaintext trong broker.

## Implementation Boundary

[CONTEXT](../../CONTEXT.md) và [đối chiếu hiện trạng](../../docs/03-product/use-cases.md#7-hiện-trạng-và-chênh-lệch-so-với-mục-tiêu)
phân biệt scaffold/BFF mô phỏng với yêu cầu mục tiêu. Hợp đồng hiện tại chưa đủ cho toàn bộ
quyền theo ghế và vai trò vận hành; cần đặc tả/kiểm thử tiếp, giữ nguyên OPEN liên quan.

## Bổ sung nghiệp vụ theo Q173

B-09/BR-19 đổi ghế cùng suất nguyên tử, giữ quyền cũ khi lỗi. BR-21 xác nhận đơn 0đ hợp lệ không gọi
cổng thu tiền giả. BR-20…BR-29 giữ phân bổ thực trả, quyền combo/voucher, điều kiện hủy/hoàn, hạng/điểm
và sửa sai; chọn công nghệ không chứng minh khả năng merchant với khoản nhỏ/thu thêm/nhiều lần hoàn.
A-06…A-08/BR-37…BR-39 bảo toàn quyền đơn cũ/nghĩa vụ hoàn khi xóa tài khoản, bảng lưu/xóa vẫn chưa hoàn tất.
