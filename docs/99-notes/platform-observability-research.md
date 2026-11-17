# Quan sát nền tảng phân tán: OpenTelemetry và ba hướng backend

Tra cứu 2026-11-17 bằng nguồn chính thức và Context7. **Đã chấp thuận OpenTelemetry + Grafana Alloy +
Grafana Cloud tại [ADR-0020](../06-decisions/0020-opentelemetry-alloy-and-grafana-cloud.md).**
Các phần so sánh/đề xuất dưới đây giữ bối cảnh trước khi chốt; chưa chọn gói/deployment hoặc triển khai.
Đích: worktree `docs-tech-stack-decisions`, detached HEAD `8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.
Chỉ đọc tài liệu/code; không cài dependency, tạo account, chạy stack, gửi telemetry hoặc sửa source/index/ADR.

## Ranh giới và mục tiêu

Core NestJS/Fastify, Agent Python/FastAPI, HTTP/SSE, PostgreSQL/Redis, Kafka/Debezium và BullMQ cần correlation xuyên dịch vụ.
[LangSmith Cloud đã chọn](../06-decisions/0010-langsmith-cloud-for-agent-observability.md) tiếp tục quan sát graph/model/tools và AI evaluation;
không thay system traces/logs/metrics, queue/DB monitoring hoặc alerting. Chưa chọn bridge/export tự động giữa hai hệ.
Trace ID/run ID có thể liên kết nếu được cho phép và không nhạy cảm; trace không thay chứng cứ Core xác nhận vé/thanh toán.
OpenTelemetry (OTel) chuẩn hóa instrumentation/propagation/export; **không tự là kho dữ liệu hoặc dashboard**.
[OTel Node.js](https://opentelemetry.io/docs/languages/js/getting-started/nodejs/), [Grafana OTLP mapping](https://grafana.com/docs/grafana-cloud/send-data/otlp/otlp-format-considerations/).

## Ba hướng cùng dùng instrumentation OTel

| Hướng | Bundle và trách nhiệm | Điểm phù hợp / đánh đổi |
|---|---|---|
| **A. OTel → Grafana Alloy → Grafana Cloud** | SDKs/log collection/exporters → Alloy xử lý/batch/export → Cloud giữ metrics/logs/traces, dashboards/alerts. | Backend managed; dự án vẫn sở hữu instrumentation, collector, dữ liệu gửi, dashboards/SLO và phản ứng sự cố. Có quota/billing/retention/vùng nhà cung cấp. |
| **B. OTel → Alloy → Grafana + Prometheus + Loki + Tempo tự host** | Prometheus giữ metrics, Loki logs, Tempo traces; Grafana hiển thị/correlation/alerts; Alloy thu OTLP và Prometheus pipelines. | Chủ động lưu trữ/retention và các backend chuyên biệt. Dự án chịu sizing, auth/TLS, storage, backup/restore, upgrades và HA từng thành phần. |
| **C. OTel → SigNoz collector → SigNoz + ClickHouse tự host** | UI/query/alert và telemetry backend tích hợp; SigNoz collector ghi ClickHouse, có cấu hình replicated/non-replicated. | Hướng OTel-first thống nhất trải nghiệm APM; chủ động dữ liệu nhưng phải vận hành ClickHouse/collector/backend và kiểm feature Community/Enterprise. |

[Alloy overview](https://grafana.com/docs/alloy/latest/introduction/), [Grafana Cloud OTLP](https://grafana.com/docs/grafana-cloud/send-data/otlp/otlp-format-considerations/),
[Tempo deployment](https://grafana.com/docs/tempo/latest/set-up-for-tracing/setup-tempo/deploy/), [SigNoz architecture](https://signoz.io/docs/architecture/).
Alloy là OTel Collector distribution có Prometheus pipelines và hỗ trợ nhiều backend; có thể thu OTLP, scrape/export metrics và thu logs.
Giữ instrumentation OTLP giúp đổi backend; **không hứa** dashboards/queries, name mapping hoặc Alloy/SigNoz config chuyển nguyên trạng.
B cần chọn persistent/object storage cho Loki/Tempo và retention/HA thực tế; không mặc định dùng bucket public catalog hoặc coi single-node là HA.
C hiện hướng dẫn Foundry cho self-host; bundled Compose/install script cũ đã deprecated từ v0.130.0, không dùng ví dụ cũ như hướng cài hiện hành.
[SigNoz self-host guide](https://signoz.io/docs/install/docker/). Chưa chọn topology, Collector HA hoặc thay cấu trúc Compose dự án.

## Instrumentation: có hỗ trợ không đồng nghĩa tự đo toàn bộ

- **Node/Core:** SDK phải khởi tạo trước modules cần instrument; kiểm ESM/Node/Nest/Fastify và dependency versions thực tế.
  Có `instrumentation-nestjs-core`, nhưng auto-instrumentations-node hiện **không còn Fastify entry**; `@fastify/otel` là tích hợp cần kiểm riêng.
  Phải kiểm đăng ký qua Nest Fastify adapter, hooks, HTTP/outbound spans và tránh hai instrumentation tạo spans trùng.
  [Nest instrumentation](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-nestjs-core),
  [auto-instrumentation map](https://github.com/open-telemetry/opentelemetry-js-contrib/blob/main/packages/auto-instrumentations-node/src/utils.ts), [Fastify OTel](https://github.com/fastify/otel).
- **Python/Agent:** FastAPI instrumentor có server/ASGI hooks và auto/manual instrumentation; HTTPX cần instrumentation tương ứng.
  Logs phải có pipeline/handler hoặc collector tailing cấu hình rõ; không mặc định tracing SDK thu toàn bộ logs/metrics.
  Business spans/metrics cho Core tool/hold/payment và graph correlation vẫn cần thiết kế thủ công.
  [FastAPI instrumentation](https://opentelemetry-python-contrib.readthedocs.io/en/latest/instrumentation/fastapi/fastapi.html), [Python zero-code](https://opentelemetry.io/docs/zero-code/python/).
- **SSE:** HTTP span dài không thay thời gian tới sự kiện đầu, số kết nối đang mở, disconnect/cancel hoặc kết quả cuối.
  Đề xuất đo các điểm này riêng và kiểm span kết thúc khi stream đóng/cancel, cleanup context khi background task tiếp tục.
  Kiểm verbosity ASGI send/receive spans, sampling và overhead; không tạo span cho mọi token/heartbeat một cách mặc định.
- **Kafka:** instrumentation KafkaJS có producer/consumer hooks nếu chọn client/version được hỗ trợ; không bao phủ mọi Kafka client hoặc broker metrics.
  Qua async/batch/retry phải kiểm inject/extract headers, span links và active context; event mới/retry không bị gắn nhầm parent cũ.
  **HTTP → outbox DB → Debezium → Kafka** không tự giữ request context nhờ SDK Node: cần thiết kế lưu/mapping context và đọc lại ở consumer.
  [KafkaJS instrumentation](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-kafkajs), [messaging spans](https://opentelemetry.io/docs/specs/semconv/messaging/messaging-spans/), [Debezium tracing](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html#distributed-tracing).
- **BullMQ:** tài liệu OSS có `bullmq-otel`, gắn telemetry cả Queue và Worker; phải kiểm cách nối với `@nestjs/bullmq` và worker thật.
  Propagation qua process/retry/delayed jobs, sandbox/background tasks không được suy từ trace của enqueue; business operation ID giữ riêng.
  [BullMQ telemetry](https://docs.bullmq.io/guide/telemetry/getting-started). Không cần chọn BullMQ Pro chỉ để viện dẫn khả năng này.

## Kiểm soát chất lượng, dữ liệu và hiệu năng

Đề xuất resource attributes có service name/version/environment; logs có trace/span correlation khi có context hợp lệ.
Đo HTTP rate/errors/latency, SSE first-event/disconnect, DB pool/Redis, consumer lag/outbox age, queue age/retry/failure và các transition Core quan trọng.
SLO/threshold cụ thể chưa chọn. Các exporter/integration cho host/DB/Redis/Kafka phải cấu hình riêng, không tự xuất hiện từ HTTP auto tracing.
Portfolio có thể chứng minh năng lực bằng trace HTTP→event→job, dashboard, alert và bằng chứng phục hồi/retry/idempotency; self-host không tự là chứng minh tốt hơn.

Chỉ thu dữ liệu theo allowlist, loại secret/token/cookie/OTP/reset URL/QR/chữ ký vé và PII không cần thiết **trước export**;
masking ở collector là lớp bổ sung, không bù dữ liệu đã đi vào log/SDK khác. Baggage/header propagation không mang payload nhạy cảm.
[OTel sensitive data](https://opentelemetry.io/docs/security/handling-sensitive-data/). Chọn auth/TLS/private ingestion, quyền truy cập, region/retention và lifecycle xóa trước khi gửi thật.
Tránh user/order/hold IDs, raw URL/query hoặc trace IDs làm metric/Loki index labels; đặt correlation vào fields/structured metadata phù hợp.
Giới hạn cardinality, log volume và sampling; chỉ đo sau mới chọn mức. [Prometheus labels](https://prometheus.io/docs/practices/naming/), [Loki cardinality](https://grafana.com/docs/loki/latest/get-started/labels/cardinality/).
Batch, bounded queue/retry, memory limits và shutdown flush cần kiểm; collector/backend lỗi có thể làm mất telemetry.
Telemetry không được kéo dài transaction vô hạn, retry payment/hold hoặc đổi kết quả Core. [Collector resiliency](https://opentelemetry.io/docs/collector/resiliency/).
Tail sampling có thể giữ lỗi/trace quan trọng nhưng thêm buffering/latency/routing yêu cầu; không tự bật toàn bộ hoặc khẳng định zero overhead.

## Giá/giấy phép hiện hành và chi phí còn thiếu

**Grafana Cloud Free:** 0 USD, không cần thẻ; **10.000 active metrics series**, **50 GB logs + 50 GB traces/tháng**, retention **14 ngày**.
**Pro:** platform fee **19 USD/tháng + usage**; vẫn gồm các allocation tương ứng rồi tính usage; metrics retention 13 tháng, logs/traces 30 ngày.
Trang giá ghi metrics từ **6.50 USD/1.000 series**; logs/traces chia meter từ **0.05/GB Process**, **0.40/GB Write**, **0.10/GB Retain**.
Không cộng thành một giá cố định/GB: processed trước tối ưu, written sau lọc/sampling, retention bổ sung có base riêng; logs còn queried volume vượt fair-use.
[Grafana pricing](https://grafana.com/pricing/), [logs billing](https://grafana.com/docs/grafana-cloud/platform/pricing-and-usage/logs/), [traces billing](https://grafana.com/docs/grafana-cloud/platform/pricing-and-usage/traces/).
Giá “from” phụ thuộc volume/meter; chưa đủ active series, scrape/DPM, GB/log/trace, retention và query load để dự báo hóa đơn.
Chưa xem quota/hard cap tài khoản, chọn Free/Pro hoặc cho phép usage tính phí; collector host/network vẫn tách khỏi Cloud bill.

**B OSS:** [Grafana](https://github.com/grafana/grafana/blob/main/LICENSE), [Loki](https://github.com/grafana/loki/blob/main/LICENSE), [Tempo](https://github.com/grafana/tempo/blob/main/LICENSE) là AGPLv3;
[Prometheus](https://github.com/prometheus/prometheus/blob/main/LICENSE) và [Alloy](https://github.com/grafana/alloy/blob/main/LICENSE) Apache-2.0. Enterprise plugins/features có điều khoản riêng.
**C:** [SigNoz core](https://github.com/SigNoz/signoz/blob/main/LICENSE) ngoài `ee/`/`cmd/enterprise/` là MIT Expat;
[Enterprise](https://github.com/SigNoz/signoz/blob/main/ee/LICENSE) cần license/terms riêng cho production; không coi toàn bộ repo/feature là MIT.
[SigNoz OTel collector](https://github.com/SigNoz/signoz-otel-collector/blob/main/LICENSE) hiện AGPLv3, [ClickHouse](https://github.com/ClickHouse/ClickHouse/blob/master/LICENSE) Apache-2.0.
Community self-host không tạo hóa đơn SaaS usage của nhà cung cấp, nhưng B/C vẫn trả compute/RAM/disk/object storage/network, backup/HA và công vận hành.
Chưa chọn host/retention/HA nên không có con số infra đáng tin; không gắn “miễn phí” với toàn bộ hệ thống hay coi ít process hơn là chắc nhanh hơn.

## Đề xuất để cùng chọn

**Nghiêng A: OpenTelemetry SDKs → Grafana Alloy → Grafana Cloud cho metrics/logs/traces**, giữ LangSmith Cloud riêng cho AI.
Lý do: chuẩn instrumentation/correlation xuyên TypeScript–Python, collector có thể kiểm soát dữ liệu, backend managed hỗ trợ tập trung vào SLO và recovery evidence.
Đây là lựa chọn chức năng/vận hành, không dùng chi phí hoặc độ phức tạp làm tiêu chí loại B/C; chưa có benchmark overhead/latency để xếp hạng.
B hợp nếu muốn trực tiếp sở hữu từng backend/retention/HA; C hợp nếu ưu tiên UX APM OTel thống nhất và chủ động vận hành ClickHouse.
Trước implementation cần pin compatibility, telemetry policy, dashboard/SLO và các ca lỗi async/SSE; kiểm không rò dữ liệu hoặc chạy lại giao dịch khi telemetry lỗi.
Chưa chọn provider/tier/deployment hoặc chứng minh runtime. Context7 đã đối chiếu `/open-telemetry/opentelemetry-js-contrib` và `/websites/grafana_grafana-cloud`.
