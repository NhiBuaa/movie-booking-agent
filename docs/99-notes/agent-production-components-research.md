# Thành phần bổ sung cho Agent Python — nghiên cứu

Tra cứu ngày 2026-11-16 bằng nguồn chính thức; chưa pin package hay kiểm chứng runtime.
Python/FastAPI/LangGraph và uv là hướng nền đã được chủ sản phẩm chọn. Các lựa chọn bên dưới
đang được đánh giá, **chưa tự trở thành dependency, nhà cung cấp hoặc kiến trúc được phê duyệt**.
Riêng LangSmith Cloud đã được chốt tiếp tại
[ADR-0010](../06-decisions/0010-langsmith-cloud-for-agent-observability.md); ghi chú này giữ bằng chứng so sánh.
SSE + sse-starlette đã được chốt tiếp tại [ADR-0011](../06-decisions/0011-sse-starlette-for-agent-streaming.md).
Module LangGraph, saver PostgreSQL/Psycopg async pool và HTTPX async đã được chốt ngày 2026-11-17
tại [ADR-0013](../06-decisions/0013-modular-agent-postgres-checkpoints-and-httpx.md).
Codegen đã được chốt tiếp tại [ADR-0014](../06-decisions/0014-zod-json-schema-and-pydantic-contracts.md).
Các đề xuất bên dưới giữ bối cảnh nghiên cứu; ADR sở hữu quyết định hiện hành.
Không cài đặt, sửa code/cấu hình, chạy dịch vụ hoặc gửi trace/model request trong nghiên cứu này.
## 1. Dùng các module LangGraph và adapter cần thiết

LangGraph không bắt buộc dùng package cấp cao `langchain`. Có thể xây `StateGraph` với
`langchain-core` cho message/tool primitives và package adapter của provider khi đã chọn model.
Đây là ranh giới dependency hợp lý; không gọi package LangChain hiện đại là “monolith cũ”:
`create_agent` hiện là API cấp cao trên LangGraph, khác legacy `AgentExecutor`.
[LangGraph overview](https://docs.langchain.com/oss/python/langgraph/overview),
[provider packages](https://docs.langchain.com/oss/python/integrations/providers/overview),
[LangChain hiện tại](https://docs.langchain.com/oss/python/langchain/overview).

Đề xuất graph tường minh cho bước xác nhận/transaction của booking; không thêm agent framework
cấp cao chỉ vì ví dụ tài liệu import nó. Import trực tiếp package nào thì khai báo dependency tương ứng;
lock phiên bản tương thích core/graph/checkpointer/adapter. Chưa có số đo giảm RAM/latency của cách tách module.
## 2. PostgreSQL checkpointer và Psycopg 3 async pool

`langgraph-checkpoint-postgres` dùng Psycopg 3; có `AsyncPostgresSaver`.
`psycopg_pool.AsyncConnectionPool` là package pool riêng, dùng connection cho tác vụ async;
giới hạn min/max, thời gian chờ, mở/đóng theo lifecycle phải được quản lý.
[Checkpointer README](https://github.com/langchain-ai/langgraph/blob/main/libs/checkpoint-postgres/README.md),
[async saver](https://reference.langchain.com/python/langgraph/checkpoints),
[Psycopg pool](https://www.psycopg.org/psycopg3/docs/advanced/pool.html).

Đề xuất saver async với pool sống theo worker/process, bootstrap/migration có kiểm soát.
Cần đối chiếu yêu cầu connection/row factory/autocommit, pool timeout và setup của đúng phiên bản;
không suy mọi pool constructor đều dùng được nguyên trạng. Tổng pool trên replica/worker phải vừa DB.
Không giữ connection trong toàn bộ lúc chờ người dùng/SSE. Checkpoint chỉ chứa trạng thái Agent;
Core vẫn sở hữu transaction ghế/đơn/vé và chống lặp khi replay. Chưa chọn driver extra/pool sizing.

## 3. HTTPX async và SSE

HTTPX `AsyncClient` hợp FastAPI async; tái sử dụng client theo lifecycle để giữ connection pool,
không tạo client mới trong hot loop. Đóng response/client đúng hạn, giới hạn connection và đọc payload.
Timeout gồm connect/read/write/pool; read timeout là chờ từng chunk, không phải deadline toàn request.
[Async client](https://www.python-httpx.org/async/), [timeouts](https://www.python-httpx.org/advanced/timeouts/).

Transport retry tích hợp chỉ cho ConnectError/ConnectTimeout, không giải quyết mọi lỗi đọc/ghi/503.
Không retry mù lệnh hold/payment/cancel: mất phản hồi có thể xảy ra sau khi Core đã commit.
Cần stable idempotency key, retry có giới hạn và tra trạng thái ở Core trước tiếp tục/bù trừ.
[HTTPX transports](https://www.python-httpx.org/advanced/transports/).

SSE + sse-starlette đã được chọn để truyền token/event một chiều theo ADR-0011; gửi lệnh/xác nhận vẫn cần request được xác thực.
FastAPI hiện có [SSE tích hợp](https://fastapi.tiangolo.com/tutorial/server-sent-events/);
`sse-starlette` không bắt buộc. Thư viện ngoài có ping, disconnect/cancellation, `send_timeout`,
memory channel và graceful shutdown; cần so với SSE tích hợp theo lifecycle, slow consumer và giao thức UI.
[sse-starlette nguồn](https://github.com/sysid/sse-starlette).

Đối chiếu hai phương án: cả hai truyền được JSON token/UI event; kiểu/validation payload vẫn cần ứng dụng thực thi theo contracts, không tự có chỉ nhờ wire SSE.
FastAPI native đã có JSON/Pydantic serialization, event/id/retry, POST, ping khi im lặng 15 giây và header no-cache/chống buffering; không mô tả nó là stream thô thiếu heartbeat. [Native SSE](https://fastapi.tiangolo.com/tutorial/server-sent-events/).
Native kế thừa StreamingResponse: Starlette xử lý disconnect qua lỗi send với ASGI mới hoặc listener/cancellation với ASGI cũ; FastAPI có bounded channel và task-group teardown producer. Chưa thấy public `send_timeout` riêng trong constructor/source đã đọc. [FastAPI routing](https://github.com/fastapi/fastapi/blob/master/fastapi/routing.py), [Starlette response](https://github.com/Kludex/starlette/blob/main/starlette/responses.py), [native class](https://github.com/fastapi/fastapi/blob/master/fastapi/sse.py).
`sse-starlette` có ping cấu hình, timeout từng data/heartbeat send, disconnect callback, cleanup timeout và cooperative shutdown; timeout phải đặt, không mặc định đã bảo vệ slow client. [Implementation](https://github.com/sysid/sse-starlette/blob/main/sse_starlette/sse.py).
Đã chọn SSE + `sse-starlette` để kiểm soát rõ timeout/cleanup cho kết nối lâu; native SSE giữ làm phương án đã so sánh. Chưa có phép đo chứng minh phương án nào nhanh hơn.
WebSocket là phương án thứ ba khi cần trao đổi hai chiều liên tục trên cùng kết nối; nhu cầu hiện tại có HTTP command riêng chưa chứng minh cần nó, và WebSocket cũng phải tự thiết kế replay/authorization. [FastAPI WebSocket](https://fastapi.tiangolo.com/advanced/websockets/).
FastAPI [MIT](https://github.com/fastapi/fastapi/blob/master/LICENSE), sse-starlette [BSD-3-Clause](https://github.com/sysid/sse-starlette/blob/main/LICENSE); phí connection/worker-memory, traffic, keep-alive và lưu/replay event thuộc hạ tầng, chưa host/tải nên chưa báo giá.

Event ID/Last-Event-ID hỗ trợ vị trí nối lại, không tự lưu/replay event hoặc đảm bảo không trùng/mất.
Cần thiết kế run/event ID, retention/replay/dedup và đồng bộ trạng thái sau reconnect; đứt stream
không tự hủy giao dịch hoặc chứng minh graph đã dừng. Kiểm auth/owner của thread/run cả lúc reconnect.
Browser EventSource chuẩn chỉ nhận URL/credentials, không tùy ý Authorization header như HTTPX;
phải chọn cookie/BFF hoặc client fetch-stream tương ứng. Không đặt bearer token vào URL.
[Chuẩn SSE](https://html.spec.whatwg.org/multipage/server-sent-events.html).

Proxy/CDN buffering, idle timeout, keep-alive và slow client cần kiểm thử qua đường triển khai thật.
SSE chuẩn phía server không bảo đảm Expo/native SDK xử lý POST/header/reconnect giống trình duyệt.
Đã chọn thư viện server sse-starlette; client được chọn tiếp là browser fetch / expo/fetch + eventsource-parser tại
[ADR-0024](../06-decisions/0024-fetch-and-eventsource-parser-for-sse-clients.md).
Giao thức thẻ chat/auth/lifecycle còn cần đặc tả; không tự coi wire SSE là AI SDK UI protocol.

## 4. LangSmith hay Langfuse cho trace/evaluation

| Phương án | Năng lực và vận hành | Chi phí/license cần phân biệt |
|---|---|---|
| LangSmith Cloud/self-host | Tích hợp LangGraph Python/JS, run/node/model/tool trace và đánh giá; hợp gỡ lỗi graph. Self-host là Enterprise add-on, cần license và hạ tầng riêng; PostgreSQL, Redis/Valkey, ClickHouse hoặc SmithDB tùy phiên bản, blob storage theo cấu hình. | Cloud có seat/trace/hosting usage; không đồng nghĩa license MIT của LangGraph. Self-host không phải dịch vụ miễn phí chỉ cần đổi endpoint. |
| Langfuse Cloud/self-host | CallbackHandler cho LangChain/LangGraph và OpenTelemetry; trace, token/cost/evaluation. Self-host hiện có Web+Worker, PostgreSQL, Redis/Valkey, ClickHouse và S3/blob; cần backup/upgrade/giám sát riêng. | Phần ngoài thư mục EE mang MIT; EE dùng license riêng. Cloud theo plan/usage, self-host vẫn có phí hạ tầng/công vận hành. |

Nguồn: [LangSmith integration](https://docs.langchain.com/langsmith/trace-with-langgraph),
[self-host](https://docs.langchain.com/langsmith/self-hosted), [pricing](https://www.langchain.com/pricing);
[Langfuse integration](https://langfuse.com/integrations/frameworks/langchain),
[self-host architecture](https://langfuse.com/self-hosting), [license](https://github.com/langfuse/langfuse/blob/main/LICENSE),
[pricing](https://langfuse.com/pricing).

Mốc giá ngày tra cứu: LangSmith Plus 39 USD/seat/tháng cộng usage; Langfuse Core 29 USD/tháng,
100k units gồm sẵn rồi 8 USD/100k units bổ sung (có mức theo volume). Trace và unit không tương đương;
chưa đủ số lượt/spans/retention để so tổng tiền. Model gọi để evaluation cũng có phí riêng.
Đã chọn LangSmith Cloud theo ADR-0010 vì phù hợp gỡ lỗi LangGraph. Langfuse cloud/tự host giữ làm
phương án đã so sánh. Gói ban đầu đã chọn Developer miễn phí; vùng, dữ liệu xuất, retention, quyền
và giới hạn quota/chi tiêu vẫn cần xác minh/thiết kế trước tích hợp theo ADR-0010.

Trace là input/output, tool, transition, timing/token/cost được instrument; không phải quyền truy cập
suy nghĩ nội bộ đầy đủ của model. Không xuất credential, token, QR/chữ ký hay dữ liệu khách không cần thiết.
Mask trước khi export và kiểm tra quyền/retention; self-host cũng không tự giải quyết quyền dữ liệu.
[LangSmith masking](https://docs.langchain.com/langsmith/mask-inputs-outputs),
[Langfuse masking](https://langfuse.com/docs/observability/features/masking).

## 5. Contract codegen và phạm vi uv

`packages/contracts` hiện có TS interface/type/constant, không dependency Zod, runtime validator
hay script xuất JSON Schema trong package. Nguồn đã đọc: [package](../../packages/contracts/package.json),
[agent DTO](../../packages/contracts/src/agent/types.ts), [auth DTO](../../packages/contracts/src/auth/types.ts).
TypeScript type bị xóa lúc chạy; codegen không tự phục hồi constraint nghiệp vụ từ comment/interface.

`datamodel-code-generator` hỗ trợ JSON Schema/OpenAPI và các format được liệt kê, sinh Pydantic v2;
không có đầu vào TypeScript trực tiếp trong danh sách/API đã xác minh.
Đường đề xuất: nguồn trong contracts → bước xuất schema được lựa chọn/kiểm chứng → generator → Pydantic.
Tại mốc nghiên cứu exporter chưa chọn; sau đó ADR-0014 chọn Zod 4 native export. Chưa cài Zod
hoặc chuyển hợp đồng; không biến OpenAPI/Python DTO thành nguồn chuẩn cạnh tranh.
Pin generator/options, tái sinh xác định và kiểm schema/fixture hai phía: optional/null/default, enum/union,
alias, số/tiền, date-time, extra fields/coercion. Generated model chưa thay validation nghiệp vụ của Core.
[Generator hiện tại](https://datamodel-code-generator.koxudaxi.dev/).

uv quản Python project qua `pyproject.toml`/`uv.lock`/`.venv`, npm tiếp tục quản phần JavaScript.
Một Agent service chưa bắt buộc tạo uv workspace toàn repo; nếu sau này nhiều package Python dùng
chung lock mới xét workspace. Root command/CI có thể gọi cả npm và uv nhưng hai resolver/lock riêng.
[uv structure](https://docs.astral.sh/uv/concepts/projects/layout/),
[uv workspaces](https://docs.astral.sh/uv/concepts/projects/workspaces/).
