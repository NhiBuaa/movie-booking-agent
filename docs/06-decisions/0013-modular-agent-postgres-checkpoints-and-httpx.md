# ADR-0013 — Module Agent, checkpoint PostgreSQL và HTTPX async

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý” với ba lựa chọn: LangGraph theo
module, langgraph-checkpoint-postgres + Psycopg 3 async pool và HTTPX AsyncClient trong hội thoại
Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`). Chỉ chọn công nghệ; chưa cài package,
khởi tạo schema/checkpoint, sửa code, chạy dịch vụ hoặc gọi API.

## Context

[ADR-0009](0009-python-fastapi-langgraph-and-uv-for-agent-service.md) đã chọn Python/FastAPI/LangGraph/uv,
hướng checkpoint PostgreSQL và Pydantic v2. Agent cần diễn đạt rõ các bước booking/chờ xác nhận,
lưu trạng thái hội thoại qua gián đoạn và gọi Cinema Core bất đồng bộ.
Core vẫn là nguồn thẩm quyền về ghế, giá, hold, thanh toán và vé.

## Decision

- Dùng **`langgraph` + `langchain-core` theo module**, graph tường minh và các primitive message/tool.
  Chỉ thêm adapter model cần thiết; không dùng legacy AgentExecutor hoặc mặc định cài package cấp cao
  `langchain`. Đây là lựa chọn kiểm soát dependency/luồng giao dịch, không phải tuyên bố mọi API
  LangChain hiện đại là monolith cũ. Adapter Workers AI vẫn cần kiểm chứng theo
  [ADR-0012](0012-cloudflare-workers-ai-and-gpt-oss-120b.md).
- Dùng **`langgraph-checkpoint-postgres`**, `AsyncPostgresSaver` và **Psycopg 3** với
  **`psycopg_pool.AsyncConnectionPool`**. Lưu checkpoint trong **database PostgreSQL logic riêng của Agent**
  theo [thiết kế bảy service](../05-specs/004-service-decomposition/spec.md), không chỉ một bảng/schema chung Core.
  Số cụm vật lý, migration/bootstrap, cấu hình connection và phiên bản tương thích còn cần đặc tả.
- Dùng **HTTPX `AsyncClient`** cho truy vấn theo quyền tới Core/Catalog; Agent tạo đề xuất,
  app/BFF thực thi lệnh giao dịch đã xác nhận theo thiết kế bảy service.
  Tái sử dụng client/connection pool theo lifecycle
  của tiến trình; đóng client/response khi kết thúc. Thiết kế timeout connect/read/write/pool cùng
  deadline toàn thao tác và giới hạn connection; không tạo client mới cho mỗi bước trong hot loop.
- Codegen hợp đồng không được chọn bởi ADR này; quyết định tiếp theo nằm tại
  [ADR-0014](0014-zod-json-schema-and-pydantic-contracts.md). `packages/contracts` tiếp tục sở hữu hợp đồng.
  [SSE](0011-sse-starlette-for-agent-streaming.md) và [LangSmith](0010-langsmith-cloud-for-agent-observability.md)
  giữ nguyên quyết định riêng.

## Alternatives Considered

| Phương án | Đánh đổi / kết quả |
|---|---|
| **Module graph + PostgreSQL saver async + HTTPX async** | Được chọn: phù hợp runtime async và hướng lưu bền đã thống nhất; cần quản lý pool, lifecycle và kiểm chứng phục hồi. |
| API Agent cấp cao của LangChain | Hợp lệ cho các workflow khác; không chọn làm lớp điều phối mặc định ở đây. Graph tường minh giúp thể hiện bước xác nhận và ranh giới giao dịch; chưa có benchmark so sánh. |
| Checkpoint chỉ trong RAM hoặc tự viết kho checkpoint | RAM mất trạng thái sau restart; tự viết phải tái tạo ngữ nghĩa lưu/phục hồi. Không chọn thay saver PostgreSQL cho bản triển khai mục tiêu. |
| HTTP client đồng bộ trong luồng async | Không chọn cho I/O Core của Agent; nếu gọi trực tiếp sẽ chặn event loop, còn chuyển sang thread cần quản lý riêng. Không kết luận HTTPX nhanh nhất mọi tải. |

## Consequences

- Pool PostgreSQL sống theo worker/process; tổng connection qua replica phải nằm trong ngân sách DB.
  Không giữ connection DB suốt thời gian chờ người dùng, model hoặc SSE. Bootstrap/migration cần
  thực hiện có kiểm soát; pin/check saver và yêu cầu autocommit/row factory của đúng phiên bản.
- Checkpoint lưu tiến trình Agent, không thay trạng thái giao dịch Core. Resume/replay có thể chạy lại
  node; app/BFF giữ operation ID/idempotency khi gửi lệnh tới Core và tra cứu kết quả khi mất phản hồi.
  Không dùng graph replay làm quyền tự gửi lại giao dịch. Không có transaction
  phân tán checkpoint–Core hoặc bảo đảm tác dụng phụ đúng một lần chỉ nhờ checkpointer.
- HTTPX transport retry tích hợp không xử lý mọi lỗi đọc/ghi hoặc HTTP 503. Không retry mù lệnh
  hold/payment/cancel: Core có thể đã commit. Kiểm lại quyền, giá và hold sau chờ; không reset TTL 300 giây.
- Xác thực owner của thread/run cả khi đọc/resume. Giảm dữ liệu checkpoint; không lưu token/secret
  vào prompt, state, SSE hoặc trace. Retention, mã hóa, backup và dọn checkpoint cần thiết kế.
- Trước demo công khai cần kiểm crash/restart, pool cạn, checkpoint lỗi, Core commit nhưng mất phản hồi,
  request bị hủy, client ngắt kết nối và phục hồi không lặp giao dịch; chưa có bằng chứng runtime.

### Chi phí

Dùng các package nguồn mở, không chọn thêm dịch vụ checkpoint/HTTP trả phí. Chi phí vận hành nằm ở
PostgreSQL, lưu trữ/backup, connection, compute và network. Chưa có tải, retention hoặc host để báo tổng tiền;
phải kiểm license/phiên bản khi đóng gói. Quyết định này không cấp quyền tạo tài nguyên hoặc phát sinh phí.

## References

- [Nghiên cứu các thành phần Agent](../99-notes/agent-production-components-research.md).
- [LangGraph overview](https://docs.langchain.com/oss/python/langgraph/overview).
- [Provider packages](https://docs.langchain.com/oss/python/integrations/providers/overview).
- [Postgres checkpointer](https://github.com/langchain-ai/langgraph/blob/main/libs/checkpoint-postgres/README.md).
- [Psycopg connection pool](https://www.psycopg.org/psycopg3/docs/advanced/pool.html).
- [HTTPX async](https://www.python-httpx.org/async/).
- [HTTPX timeouts](https://www.python-httpx.org/advanced/timeouts/).
- [HTTPX transports/retries](https://www.python-httpx.org/advanced/transports/).

Nguồn nghiên cứu đối chiếu ngày 2026-11-16; quyết định được chấp thuận ngày 2026-11-17,
chưa pin phiên bản, cài đặt hoặc đo hiệu năng/phục hồi.
