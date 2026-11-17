# Agent service: LangGraph TypeScript/Python và AI SDK + Workflow

Tra cứu ngày 2026-11-16 từ nguồn chính thức. Nghiên cứu giữ bằng chứng so sánh;
quyết định Python + FastAPI + LangGraph + uv đã được chấp thuận tại
[ADR-0009](../06-decisions/0009-python-fastapi-langgraph-and-uv-for-agent-service.md).
Đã đối chiếu Context7 cho LangGraph TypeScript, AI SDK và FastAPI, cùng tài liệu web chính thức.
Chưa pin phiên bản, cài dependency, sửa code/cấu hình, gọi model/provider hoặc chạy runtime/benchmark.

Các lựa chọn tiếp nối: [LangSmith Developer miễn phí](../06-decisions/0010-langsmith-cloud-for-agent-observability.md),
[Workers AI/GPT-OSS 120B primary](../06-decisions/0012-cloudflare-workers-ai-and-gpt-oss-120b.md) và
[Groq Free dự phòng chat](../06-decisions/0028-groq-free-for-agent-provider-fallback.md).
Những phần so sánh framework bên dưới giữ bối cảnh nghiên cứu ban đầu.
## Yêu cầu làm tiêu chí

Nguồn: [trách nhiệm Agent service](../../services/agent-service/README.md),
[đặc tả conversational booking](../05-specs/conversational-booking.md).
Agent cần ngữ cảnh CB-01–CB-06, đổi kênh vẫn cùng order/hold/TTL, thẻ UI tương tác,
tool có kiểm quyền/xác nhận, tiếp tục sau chờ/lỗi và tra cứu/hủy trong phạm vi cho phép.
Cinema Core vẫn sở hữu giá/ghế/hold/thanh toán/vé; checkpoint của Agent không thay dữ liệu Core.
Chưa có yêu cầu cần multi-agent, RAG, vector DB, local inference hoặc học máy riêng.
Tiền, mức quen thuộc hoặc độ phức tạp không tự loại phương án; vẫn xét đúng đắn và vận hành thực tế.
## Ba cấu hình so sánh

| Phương án | Khả năng có nguồn | Đánh đổi/độ phù hợp — nhận định |
|---|---|---|
| **A — TypeScript + NestJS/Fastify + LangGraph.js** | Graph state/node/edge, checkpoint PostgreSQL, interrupt/resume và streaming. | Hợp diễn đạt bước xác nhận/gọi Core bằng luồng xác định, giữ hợp đồng TypeScript cùng nền tảng. Không tự chứng minh nhanh hơn Python; phải kiểm tra chính xác độ bền checkpoint của phiên bản chọn. |
| **B — Python + FastAPI + LangGraph Python** | Cùng nhóm năng lực graph/checkpoint/interrupt/streaming; FastAPI có async I/O. | Hợp graph state với hệ Python; đáng ưu tiên nếu cần semantics ghi checkpoint trước từng bước theo tài liệu hiện tại. Hợp đồng API vẫn cần schema/validation; không chọn chỉ vì Python thường dùng cho AI. |
| **C — TypeScript + Fastify/NestJS + AI SDK + Workflow SDK** | Model/tool/schema/stream UI cộng `WorkflowAgent` cho durable steps, resume và approval xuyên bước. | Là đối thủ có lưu trạng thái/phục hồi thực sự, không chỉ vòng gọi LLM trong RAM. Cần thiết kế ranh giới workflow/tool và backend chạy workflow, build/runtime tương thích host; không mặc định bị khóa Vercel. |

Nguồn nền: [LangGraph.js overview](https://docs.langchain.com/oss/javascript/langgraph/overview),
[LangGraph Python](https://docs.langchain.com/oss/python/langgraph/overview),
[FastAPI async](https://fastapi.tiangolo.com/async/), [Nest Fastify adapter](https://docs.nestjs.com/techniques/performance),
[AI SDK](https://ai-sdk.dev/docs/introduction), [WorkflowAgent](https://ai-sdk.dev/docs/agents/workflow-agent).
## LangGraph: năng lực tương ứng, không khẳng định ngang nhau mọi chi tiết

Cả JS và Python đều có persistent checkpointer PostgreSQL, graph state theo thread,
interrupt/Command resume và streaming token/state/custom event. Memory saver chỉ trong RAM.
JS có `@langchain/langgraph-checkpoint-postgres`; Python có `langgraph-checkpoint-postgres`.
[JS checkpointers](https://docs.langchain.com/oss/javascript/langgraph/checkpointers),
[Python checkpointers](https://docs.langchain.com/oss/python/langgraph/checkpointers),
[JS streaming](https://docs.langchain.com/oss/javascript/langgraph/streaming),
[Python streaming](https://docs.langchain.com/oss/python/langgraph/streaming).

**Khác biệt cần kiểm chứng khi pin:** tài liệu hiện tại mô tả Python `sync` ghi checkpoint trước
bước tiếp theo và ghi input/step 0 trước user node đầu. Trang JS mô tả `sync` vẫn cho bước giữa chạy
trước khi writes hoàn tất, chỉ chờ outstanding writes khi run kết thúc; crash giữa run có thể mất checkpoint gần nhất.
Đây là mô tả tài liệu của hai bản, chưa phải kết luận kiểm thử package. Không gộp tên `sync` thành bảo đảm giống nhau.
[JS durability modes](https://docs.langchain.com/oss/javascript/langgraph/checkpointers),
[Python durability modes](https://docs.langchain.com/oss/python/langgraph/checkpointers).

Interrupt resume chạy lại node từ đầu; replay checkpoint cũ có thể chạy lại LLM/API ở các bước sau đó.
Idempotency key phải ổn định từ dữ liệu bền, Core phải thực thi chống lặp. Lỗi/mất phản hồi sau lệnh
không chứng minh Core chưa xử lý; cần tra trạng thái trước khi tiếp tục hoặc bù trừ.
[JS interrupts](https://docs.langchain.com/oss/javascript/langgraph/interrupts),
[Python interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts),
[fault tolerance/idempotency](https://docs.langchain.com/oss/javascript/langgraph/fault-tolerance).

## AI SDK: đánh giá cả đường durable, không dùng vòng RAM làm phương án đối chứng

`WorkflowAgent` từ `@ai-sdk/workflow` chạy trong Workflow SDK, lưu tiến trình, retry step,
stream và chờ approval có thể tiếp tục sau suspension. `ToolLoopAgent` thông thường chạy trong RAM;
lưu lịch sử tin nhắn không tự đồng nghĩa lưu tiến trình thực thi. WorkflowAgent hiện yêu cầu Workflow 5.
[Nguồn: WorkflowAgent](https://ai-sdk.dev/docs/agents/workflow-agent).

Tool approval hiện dùng `toolApproval`; `needsApproval` đã deprecated. Đây là cơ chế cho tool SDK
thực thi cục bộ, không áp tự động lên tool do model provider chạy bên họ. Nó không tự kiểm quyền Core.
[Nguồn: tool execution approval](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling).

Có self-host Postgres World với graphile-worker và process chạy lâu. **Trang hiện tại gọi đây là
reference implementation**, chưa tối ưu scale/speed/security và không tự xác thực HTTP workflow routes;
phải bảo vệ/adapt trước khi phơi ra mạng. Không dùng snippet cũ “production-ready” thay trạng thái này.
Runtime và World phải cùng major/release cycle. Chưa xác minh tổ hợp Nest/Fastify/build cụ thể.
[Postgres World](https://workflow-sdk.dev/worlds/postgres),
[source README/security](https://github.com/vercel/workflow/blob/main/packages/world-postgres/README.md).

AI SDK 7 đã có [công bố phát hành](https://vercel.com/changelog/ai-sdk-7), không coi nhãn tài liệu v7
là bằng chứng prerelease. Registry công khai lúc tra trả `ai/latest=7.0.173`, `workflow/latest=5.5.0`;
đây là snapshot nghiên cứu, không pin dependency. V7 yêu cầu Node 22+, ESM theo công bố phát hành.
[ai metadata](https://registry.npmjs.org/ai/latest), [workflow metadata](https://registry.npmjs.org/workflow/latest).

## Bảo đảm nghiệp vụ và kiểm chứng cần thiết — áp dụng cả ba

Xác nhận phải gắn user thật và nội dung giao dịch cụ thể; resume/retry không tự tạo hold mới hoặc reset TTL.
Trước thao tác tiếp theo phải đối chiếu order/hold/giá/quyền hiện tại ở Core, đặc biệt sau chờ phê duyệt.
Chỉ hiển thị thành công/vé khi phản hồi/chữ ký Core được xác minh; LLM text, checkpoint hay redirect thanh toán
không đủ. Framework không cung cấp exactly-once cho giao dịch ngoài hệ thống chỉ nhờ checkpoint/retry.
Đây là yêu cầu dự án và tiêu chí kiểm chứng, chưa phải thiết kế tool executor/ủy quyền đã chọn.

Đo cùng model/prompt/tool workload: thời gian token đầu và hoàn tất, số lượt/token gọi model,
độ đúng tool/đối số, tỷ lệ hoàn tất, p95 dưới tải, CPU/RAM, chi phí checkpoint và phục hồi khi kill/retry.
Bao gồm xác nhận muộn/hold hết hạn, mất phản hồi Core, request lặp và đổi kênh; chưa chạy các phép đo này.

## License, chi phí và đề xuất

LangGraph [JS MIT](https://github.com/langchain-ai/langgraphjs/blob/main/LICENSE)/[Python MIT](https://github.com/langchain-ai/langgraph/blob/main/LICENSE);
AI SDK [Apache 2.0](https://github.com/vercel/ai/blob/main/LICENSE), Workflow SDK [Apache 2.0](https://github.com/vercel/workflow/blob/main/LICENSE.md).
Lõi OSS khác dịch vụ quản lý: compute/DB/checkpoint/traffic/observability và model input/output tokens đều cần dự toán.
LangSmith có phí seat/trace/hosting theo [pricing](https://www.langchain.com/pricing); không bắt buộc dùng dịch vụ này để chạy graph OSS.
Vercel Workflows tính event/data written/data retained, cộng Functions/Queues khi dùng managed backend:
[pricing](https://vercel.com/docs/workflows/pricing). Self-host có hạ tầng/công vận hành riêng;
model được chọn tiếp như phần mở đầu, host/tải chưa chọn nên chưa báo tổng tiền.

**Đề xuất độc lập:** nghiêng **B — Python + FastAPI + LangGraph + PostgreSQL** cho state/đường chuyển
bước rõ và mô tả Python `sync` ghi checkpoint trước node tiếp theo. Lợi ích này liên quan trực tiếp
phục hồi booking; không phải chứng minh B nhanh nhất hoặc bảo đảm mọi phiên bản. Phải pin và thử crash.
`packages/contracts` vẫn là nguồn hợp đồng; schema/codegen sang validation/Pydantic cần kiểm chứng,
không tự tạo DTO Python/OpenAPI nguồn chuẩn cạnh tranh. A vẫn hợp typed contracts; C có durable loop/stream UI
thực sự. Stack nền đã được chấp thuận tại ADR-0009; kết luận hiệu năng cần đo cùng workload.

Trong B, FastAPI/Pydantic phục vụ validation tại ranh giới API và streaming; không tự chứng minh
API nhanh hơn Node.js. [FastAPI streaming/validation](https://fastapi.tiangolo.com/tutorial/stream-json-lines/).
Đề xuất dành LLM cho diễn giải ý định/lựa chọn công cụ; thao tác UI có cấu trúc và kiểm tra xác nhận
có thể đi theo bước xác định, giảm các lượt gọi model không cần thiết. Đây là hướng tối ưu cần đo,
không phải routing đã triển khai; checkpoint không là nguồn xác nhận giá, hold hoặc vé.
