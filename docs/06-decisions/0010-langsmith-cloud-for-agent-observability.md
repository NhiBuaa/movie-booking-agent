# ADR-0010 — LangSmith Cloud cho quan sát và đánh giá Agent

## Status

Accepted — ngày 2026-11-16, chủ sản phẩm xác nhận “tôi chọn LangSmith Cloud” trong hội thoại
Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`), sau so sánh với Langfuse Cloud/tự host.
Chấp thuận công nghệ/dịch vụ cho tracing và đánh giá Agent; chưa tạo tài khoản, mua gói,
cài SDK, cấu hình hoặc gửi dữ liệu thực.

Cùng ngày, chủ sản phẩm xác nhận “tôi đồng ý sẽ bắt đầu với gói dev free”: chọn **Developer miễn phí**
làm gói ban đầu. Đây không phải chấp thuận Plus, nâng gói hoặc sử dụng phần tính phí vượt hạn mức.

## Context

[ADR-0009](0009-python-fastapi-langgraph-and-uv-for-agent-service.md) chọn Python/FastAPI/LangGraph
cho Agent Service. Cần quan sát đường chạy graph, model/tool calls, độ trễ, lỗi, token và chi phí,
đồng thời đánh giá độ đúng của hành trình booking. Core vẫn là thẩm quyền giao dịch;
trace không thay kết quả nghiệp vụ hoặc bằng chứng vé/thanh toán.

[Nghiên cứu thành phần Agent](../99-notes/agent-production-components-research.md) so sánh
LangSmith và Langfuse; lựa chọn theo độ phù hợp LangGraph và khả năng quan sát, không theo ưu tiên miễn phí.

## Decision

- Chọn **LangSmith Cloud** cho tracing/quan sát Agent và hỗ trợ đánh giá chất lượng khi xây bộ đánh giá.
  Liên kết run/node/model/tool với định danh tương quan phù hợp; token/cost phụ thuộc metadata usage
  và bảng giá model đã cấu hình, không tự coi số đo là hóa đơn thực tế.
- Bắt đầu bằng **Developer miễn phí cho một người sử dụng LangSmith**. Trước bật tracing phải xác minh
  cách tính quota, billing và khả năng chặn usage tính phí của tài khoản thực; cấu hình giới hạn phù hợp.
  Nếu không có giới hạn chi tiêu cứng, cần giới hạn xuất trace có kiểm soát phía ứng dụng trước khi dùng.
  Không tự nâng gói hoặc bật tính năng trả phí; phần phát sinh phí cần quyết định riêng.
- Dùng tích hợp LangGraph/LangSmith phía server; trace ghi bước thực thi, dữ liệu được phép,
  timing và kết quả, không hứa truy cập toàn bộ suy nghĩ nội bộ của model.
- Chỉ gửi dữ liệu theo danh sách cho phép, che hoặc loại dữ liệu nhạy cảm **trước khi upload**,
  kể cả metadata/error/tool payload. Không gửi credential, bearer token, secret hoặc QR/chữ ký vé;
  hạn chế dữ liệu cá nhân. Kiểm tra đường instrumentation thực tế để không có callback bỏ qua masking.
- Tracing không có thẩm quyền ghi giao dịch. Lỗi/timeout xuất trace không được làm chạy lại thao tác
  hold/payment hoặc đảo kết quả Core; cần giới hạn buffer/retry và xử lý sự cố telemetry khi triển khai.
- Không chọn Langfuse, LangSmith self-host, Agent Server hosting, gateway hoặc sản phẩm bổ sung
  chỉ vì nằm cùng nền tảng. Việc chọn Cloud tracing không quyết định nơi deploy Agent Service.

## Alternatives Considered

| Phương án | Lợi ích | Đánh đổi / kết quả |
|---|---|---|
| **LangSmith Cloud** | Tích hợp LangGraph, theo dõi graph/model/tool và đánh giá tập trung. | Được chọn. Phụ thuộc dịch vụ ngoài, quota, giá, vùng và chính sách dữ liệu. |
| Langfuse Cloud | Observability/evaluation nhiều framework, tích hợp LangGraph và OpenTelemetry. | Hợp lệ nhưng chưa chọn; ưu tiên tích hợp/gỡ lỗi LangGraph của LangSmith trong giai đoạn này. |
| Langfuse tự host | Chủ động hạ tầng lưu trace và vận hành nền quan sát. | Chưa chọn. Thêm Web/Worker, PostgreSQL, Redis/Valkey, ClickHouse và blob storage theo phiên bản; phải backup, nâng cấp và bảo vệ riêng. |

## Consequences

- Trước gửi dữ liệu cần chọn vùng/endpoint, quyền truy cập, môi trường, retention, sampling,
  giới hạn usage và quy tắc xuất/xóa dữ liệu. Chưa chọn giá trị mặc định thay cho các quyết định này.
- SDK và tracing phải kiểm chứng không rò dữ liệu, overhead, flush khi shutdown, mất kết nối và
  lỗi quota. Chưa có runtime hoặc số đo chứng minh tracing hoạt động hoặc Agent đạt production.
- Tracing không thay metrics/alert của dịch vụ, PostgreSQL, Redis, Kafka hoặc truy vết xuyên hệ thống.
  Công cụ quan sát nền tảng đã chọn tại [ADR-0020](0020-opentelemetry-alloy-and-grafana-cloud.md).
  Bộ dữ liệu/evaluator, tiêu chí chất lượng tiếng Việt/tool calls và cấu hình tích hợp còn cần thiết kế.

### Chi phí

[Bảng giá chính thức](https://www.langchain.com/pricing) tra ngày 2026-11-16 hiển thị Developer
0 USD/seat/tháng cho một seat, gồm tối đa 5k base traces/tháng rồi tính usage; Plus
39 USD/seat/tháng, gồm tối đa 10k base traces/tháng rồi tính usage. Đây là mốc tham khảo,
**đã chọn Developer trong phạm vi miễn phí, không chọn Plus**. Một seat là người sử dụng LangSmith,
không phải khách đặt vé; trace không đồng nghĩa một cuộc hội thoại hoặc một người dùng.
Nhãn miễn phí không tự bảo đảm usage vượt quota bị chặn; chưa xác minh billing/hard cap của tài khoản.

Tổng phí phụ thuộc seat, loại/số trace, retention, evaluation và tính năng sử dụng. Lượt gọi model
để chạy Agent/evaluation có phí riêng ở provider; hosting Agent cũng riêng. Cần dự toán theo tải và
kiểm tra giá/giới hạn trước cấu hình hoặc nâng gói; lựa chọn này chưa cấp quyền mua dịch vụ.
Chọn gói ban đầu miễn phí không khôi phục tiêu chí “chỉ chọn công nghệ miễn phí” cho toàn dự án;
chi phí model và hosting vẫn tách riêng.

## References

- [Trace LangGraph agents](https://docs.langchain.com/langsmith/trace-with-langgraph).
- [Mask inputs, outputs và metadata](https://docs.langchain.com/langsmith/mask-inputs-outputs).
- [LangSmith pricing](https://www.langchain.com/pricing).
- [Langfuse integration](https://langfuse.com/integrations/frameworks/langchain).
- [Langfuse self-host architecture](https://langfuse.com/self-hosting).
- [Nghiên cứu so sánh](../99-notes/agent-production-components-research.md).

Đối chiếu Context7 và nguồn chính thức ngày 2026-11-16. Chưa cài SDK, gửi trace, gọi model hoặc kiểm thử runtime.
