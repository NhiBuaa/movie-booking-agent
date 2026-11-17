# Movie Booking AI Agent Service (`services/agent-service`)

**Phạm vi tài liệu:** trách nhiệm dịch vụ mục tiêu. Logic chat client/fixture hiện có không xác nhận
LLM/tool calling runtime đã tích hợp; xem [CONTEXT](../../CONTEXT.md).

**Stack đã chọn:** Python + FastAPI + LangGraph và uv quản lý môi trường/gói Python theo
[ADR-0009](../../docs/06-decisions/0009-python-fastapi-langgraph-and-uv-for-agent-service.md).
Theo [ADR-0013](../../docs/06-decisions/0013-modular-agent-postgres-checkpoints-and-httpx.md), dùng
`langgraph` + `langchain-core` theo module, `langgraph-checkpoint-postgres`/`AsyncPostgresSaver`
với Psycopg 3 async pool và HTTPX `AsyncClient` gọi Core. Checkpoint không thay trạng thái Core.
`packages/contracts` vẫn sở hữu hợp đồng; chọn Zod 4 → JSON Schema → `datamodel-code-generator` →
Pydantic v2 theo [ADR-0014](../../docs/06-decisions/0014-zod-json-schema-and-pydantic-contracts.md).
Adapter model, profile codegen và cấu hình cần thiết kế/kiểm chứng;
chưa cài package, sinh model, tạo cấu hình môi trường hoặc xác nhận runtime.

**Quan sát Agent đã chọn:** LangSmith Cloud theo
[ADR-0010](../../docs/06-decisions/0010-langsmith-cloud-for-agent-observability.md).
Bắt đầu bằng Developer miễn phí; vùng, chính sách lưu/xuất trace và giới hạn quota/chi tiêu cần xác minh
trước tích hợp. Che dữ liệu nhạy cảm trước upload; nâng gói/phần tính phí cần quyết định riêng.
Chưa tạo tài khoản, cài SDK hoặc gửi trace; lựa chọn này không chọn hosting Agent.

**Quan sát nền tảng đã chọn:** OpenTelemetry + Grafana Alloy + Grafana Cloud theo
[ADR-0020](../../docs/06-decisions/0020-opentelemetry-alloy-and-grafana-cloud.md), bổ sung metrics/logs/traces
xuyên dịch vụ và cảnh báo. Giữ LangSmith cho graph/model/tools; chưa chọn bridge tự động,
cấu hình FastAPI/HTTPX/SSE instrumentation hoặc xác nhận runtime.

**Kiểm thử mục tiêu:** pytest và Testcontainers Python theo
[ADR-0021](../../docs/06-decisions/0021-layered-testing-stack-for-platform.md).
Async lifecycle, checkpoint/resume, Core-tool effects và tương thích contracts cần đặc tả;
chưa cấu hình hoặc chạy. Giữ LangSmith cho đánh giá chất lượng Agent.

**Streaming đã chọn:** SSE + `sse-starlette` theo
[ADR-0011](../../docs/06-decisions/0011-sse-starlette-for-agent-streaming.md).
SSE gửi text/sự kiện UI về Web/Mobile; lệnh/xác nhận qua HTTP có xác thực. Client dùng browser fetch,
expo/fetch và eventsource-parser theo [ADR-0024](../../docs/06-decisions/0024-fetch-and-eventsource-parser-for-sse-clients.md).
Auth delivery, timeout, hợp đồng và phục hồi event còn cần thiết kế; chưa có runtime được kiểm chứng.

**Model đã chọn:** Cloudflare Workers AI với `@cf/openai/gpt-oss-120b` theo
[ADR-0012](../../docs/06-decisions/0012-cloudflare-workers-ai-and-gpt-oss-120b.md), bắt đầu trong
allocation miễn phí cho portfolio. Groq Free `openai/gpt-oss-120b` làm dự phòng theo
[ADR-0028](../../docs/06-decisions/0028-groq-free-for-agent-provider-fallback.md).
Hết cả hai quota thì Agent báo gián đoạn, giữ đường booking trực tiếp; không tự nâng gói/trả phí.
Gọi API từ Python, hosting chưa chọn; routing/circuit breaker/lifecycle và quota tài khoản chưa kiểm chứng.
Adapter/tool/stream và chất lượng tiếng Việt cần kiểm chứng; chưa tạo tài khoản, gọi inference hoặc nâng gói.

## Core Responsibilities

- Diễn giải nhu cầu phim/rạp/suất và điều phối công cụ Cinema Core; không tự giữ ghế, định giá hay phát vé.
- Tìm/khám phá qua API module Search của Core theo
  [ADR-0035](../../docs/06-decisions/0035-search-module-in-cinema-core.md), không tự truy cập Typesense
  hoặc làm đường bắt buộc cho tìm kiếm trực tiếp. Tool/DTO cụ thể chưa được triển khai.
- Giữ ngữ cảnh hành trình CB-01–CB-06 và cùng đơn/hold khi đổi kênh; không tự khởi động lại TTL.
- Hỗ trợ tra cứu đơn/vé (B-07), bỏ hold (B-08), gửi yêu cầu hủy đã mua (R-01) và theo dõi hủy/hoàn (R-04).
- Gửi lệnh sau xác nhận cần thiết của khách; chỉ trình bày vé hợp lệ sau xác minh phản hồi/chữ ký Core.
  Không xét duyệt hủy, hoàn tiền thay người có thẩm quyền, soát vé, giao combo hoặc quản trị vận hành.

[Mô hình và bảng phạm vi kênh AI](../../docs/03-product/use-cases.md#phạm-vi-kênh-ai) sở hữu mục tiêu/quyền;
[đặc tả chat](../../docs/05-specs/conversational-booking.md) ánh xạ CB sang use case.
Hội viên/đổi điểm, đánh giá và tài khoản dùng màn hình chuyên biệt. Phần LLM của OPEN-09 đã chốt
tại ADR-0012; provider email chọn Resend theo [ADR-0018](../../docs/06-decisions/0018-resend-for-transactional-email.md).
Chính sách gửi lại/lỗi email và kênh thông báo khác còn mở; không suy danh sách tool hiện có thành phạm vi đã triển khai đầy đủ.
