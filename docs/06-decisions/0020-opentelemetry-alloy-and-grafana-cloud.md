# ADR-0020 — OpenTelemetry, Grafana Alloy và Grafana Cloud cho quan sát nền tảng

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý với đề xuất của bạn” sau đề xuất
OpenTelemetry + Grafana Alloy + Grafana Cloud trong hội thoại Tech Stack
(`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`). Chọn công nghệ; chưa chọn Free/Pro, region, retention,
tạo tài khoản, cài SDK/collector, gửi telemetry hoặc kích hoạt chi tiêu.

## Context

Cinema Core NestJS/Fastify và Agent Python/FastAPI cùng phụ thuộc PostgreSQL, Redis,
outbox/Debezium/Kafka và BullMQ. Cần logs, metrics, traces và cảnh báo để điều tra độ trễ/lỗi
xuyên dịch vụ, gồm cả công việc bất đồng bộ. [LangSmith Cloud](0010-langsmith-cloud-for-agent-observability.md)
đã chọn cho graph/model/tool và đánh giá Agent; không thay quan sát hạ tầng/giao dịch toàn nền tảng.
Mục tiêu portfolio là chứng minh correlation, phát hiện sự cố và phục hồi bằng bằng chứng thực tế.

## Decision

- Chọn **OpenTelemetry** làm nền instrumentation và truyền ngữ cảnh; dùng SDK/instrumentation
  phù hợp TypeScript/Node.js và Python, xuất dữ liệu theo OTLP khi phù hợp. OTel không tự là kho
  dữ liệu hoặc dashboard; không coi auto instrumentation là bao phủ mọi nghiệp vụ.
- Chọn **Grafana Alloy** làm collector: nhận/xử lý/batch/chuyển tiếp telemetry, thu logs và các
  metrics qua pipeline/exporter phù hợp. Dự án chịu trách nhiệm cấu hình, vận hành và tài nguyên Alloy.
- Chọn **Grafana Cloud** làm backend managed cho metrics/logs/traces, dashboard và cảnh báo.
  Backend managed không thay trách nhiệm của dự án với instrumentation, chất lượng dữ liệu,
  dashboard, mục tiêu mức dịch vụ (SLO), giới hạn usage hoặc phản ứng sự cố.
- Giữ **LangSmith Cloud** cho quan sát/đánh giá Agent. Thiết kế liên kết trace/run ID được phép
  giữa hai hệ; chưa chọn bridge/export tự động hoặc gửi toàn bộ trace LangSmith sang Grafana.
- Cần đo các đường HTTP, gọi Core, DB/Redis, Kafka/outbox và BullMQ. Ngữ cảnh xuyên outbox,
  Debezium, event/job, retry/batch và worker khác process phải được thiết kế/kiểm chứng riêng.
  Trace của enqueue không tự chứng minh worker đã chạy hoặc side effect thành công.
- Với SSE, thiết kế chỉ số tới sự kiện đầu, kết nối đang mở, disconnect/cancel và kết quả cuối;
  HTTP span kéo dài không tự thay các chỉ số này. Không mặc định tạo span cho từng token/heartbeat.
- Chưa chọn phiên bản SDK, từng instrumentation/exporter, topology collector, dashboard/SLO,
  sampling, vùng/thời gian lưu, browser/mobile telemetry, profiling hoặc dịch vụ cloud bổ sung.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| **OTel + Alloy + Grafana Cloud** | Được chọn: chuẩn instrumentation cho Node/Python, collector kiểm soát pipeline và backend managed cho phân tích/cảnh báo. Có phụ thuộc nhà cung cấp, quota, retention và chính sách dữ liệu. Portfolio vẫn cần chứng minh luồng truy vết/SLO/phục hồi. |
| OTel + Alloy + Grafana/Prometheus/Loki/Tempo tự host | Hợp lệ khi muốn sở hữu từng backend và retention/storage. Tự chịu sizing, bảo mật, backup/restore, nâng cấp và HA; không loại vì độ phức tạp hoặc chi phí. Khả năng vận hành backend quan sát riêng chưa phải mục tiêu ưu tiên hơn quan sát hệ thống booking hiện tại. |
| OTel + SigNoz tự host | Hướng OTel với UI/query/alert tích hợp và ClickHouse lưu telemetry. Phải vận hành collector/ClickHouse/backend và kiểm Community/Enterprise; không coi toàn bộ tính năng/giấy phép là MIT hoặc tự suy nhanh hơn bộ Grafana. |

## Consequences

- [NFR dữ liệu chẩn đoán](../05-specs/nfr/privacy-and-audit.md) quy định trường được phép và hạn lưu áp dụng cho demo.
  [NFR vận hành](../05-specs/nfr/operations.md) quy định phát hiện, cảnh báo và xác nhận phục hồi.
  Cấu hình collector/backend và đường email cần được kiểm chứng theo các yêu cầu đó.
- Cần pin compatibility và kiểm thứ tự khởi tạo SDK, ESM, Nest Fastify adapter, Python async/context,
  outbound HTTP, stream và worker thật. Chưa xác nhận Fastify tự được instrument đầy đủ bởi Node bundle.
- Thu dữ liệu theo allowlist; loại credential/token/cookie, OTP/reset URL, QR/chữ ký vé và dữ liệu
  cá nhân không cần thiết trước export. Redaction ở collector là lớp bổ sung; không bù việc đã log lộ bí mật.
  Cần xác định auth/TLS, quyền truy cập và xử lý ngữ cảnh từ bên ngoài trước khi gửi telemetry thật.
- Giới hạn cardinality, lượng log, sampling và buffer/retry; không đặt user/order/hold/trace ID hoặc
  raw URL thành metric/index labels có cardinality cao. Chọn field/structured metadata phù hợp để correlation.
- Collector/backend lỗi có thể mất telemetry; dùng giới hạn bộ nhớ/hàng đợi/thời gian chờ phù hợp.
  Lỗi xuất trace không được đổi kết quả Core hoặc kích hoạt lại hold/payment.
- Đổi backend có thể tái sử dụng instrumentation OTLP, nhưng dashboard/query, tên dữ liệu và cấu hình
  collector không tự chuyển nguyên trạng. Chưa có benchmark overhead/latency hoặc runtime được kiểm chứng.

### Chi phí

Theo nguồn ngày 2026-11-17, Grafana Cloud Free gồm **10.000 active metrics series**, **50 GB logs
và 50 GB traces/tháng**, retention **14 ngày**. Pro có **19 USD/tháng platform fee + usage**,
metrics retention 13 tháng và logs/traces 30 ngày; allocation và các điều kiện tính phí theo provider.
Chưa chọn gói; Free không được hiểu là retention/quota không giới hạn.

Trang giá hiện ghi metrics từ **6,50 USD/1.000 series**; logs/traces chia meter từ
**0,05 USD/GB Process**, **0,40 USD/GB Write**, **0,10 USD/GB Retain**. Không cộng thành một giá
phẳng cho mọi GB: lượng xử lý, lượng ghi sau lọc/sampling, lưu giữ và query có cách tính riêng.
Ví dụ workload **5.000 series, 10 GB logs và 10 GB traces/tháng**, chấp nhận retention 14 ngày,
chỉ dùng phần Free này thì phí Cloud có thể **0 USD** trong quota; nếu chọn Pro ở cùng mức dùng
trong allocation thì platform fee **19 USD/tháng**, chưa gồm tính năng/usage khác.

Alloy host/network có chi phí riêng. Các phương án tự host vẫn cần compute/RAM/disk/object storage,
backup/HA và công vận hành. Chưa có lượng telemetry, query load, host/topology và yêu cầu retention
thực nên chưa dự toán tổng hóa đơn; không giả định quyền quota/hard cap của tài khoản hoặc cấp quyền mua dịch vụ.

## References

- [Nghiên cứu observability, integration và giấy phép](../99-notes/platform-observability-research.md).
- [OpenTelemetry overview](https://opentelemetry.io/docs/what-is-opentelemetry/).
- [Context propagation](https://opentelemetry.io/docs/concepts/context-propagation/).
- [Grafana Alloy](https://grafana.com/docs/alloy/latest/introduction/).
- [Grafana Cloud OTLP](https://grafana.com/docs/grafana-cloud/send-data/otlp/otlp-format-considerations/).
- [Grafana pricing](https://grafana.com/pricing/).
- [Logs billing](https://grafana.com/docs/grafana-cloud/platform/pricing-and-usage/logs/).
- [Traces billing](https://grafana.com/docs/grafana-cloud/platform/pricing-and-usage/traces/).
- [SigNoz architecture](https://signoz.io/docs/architecture/).

Nguồn/Context7 đối chiếu ngày 2026-11-17; chưa cài đặt, gửi telemetry hoặc chạy thử hệ thống.
