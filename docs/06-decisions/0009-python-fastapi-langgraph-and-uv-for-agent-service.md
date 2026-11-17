# ADR-0009 — Python, FastAPI, LangGraph và uv cho Agent Service

## Status

Accepted — ngày 2026-11-16, chủ sản phẩm xác nhận “Tôi đồng ý chốt hướng tiếp cận:
Python + FastAPI + LangGraph cho Agent Service và sử dụng uv để quản lý môi trường/gói trong monorepo”
trong hội thoại Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`).

Chấp thuận stack nền và công cụ quản lý Python. Năm mảnh ghép bổ sung được đưa ra để đánh giá;
không suy thành chấp thuận toàn bộ thư viện, provider, tracing hoặc cấu hình triển khai.
Chưa cài đặt, sinh model, sửa code, cấu hình dịch vụ hoặc chạy runtime.

## Context

[Đặc tả conversational booking](../05-specs/conversational-booking.md) yêu cầu hội thoại nhiều bước,
thẻ tương tác, xác nhận của khách trước thao tác giao dịch, đổi kênh cùng đơn/hold và khả năng xử lý
kết quả chưa rõ. Core vẫn là nguồn thẩm quyền về giá, ghế, hold, thanh toán và vé.

Chủ sản phẩm không giới hạn lựa chọn theo kinh nghiệm ngôn ngữ hoặc độ phức tạp; ưu tiên độ phù hợp,
hiệu quả và portfolio kiến trúc phân tán. [Nghiên cứu framework](../99-notes/agent-framework-research.md)
so sánh LangGraph TypeScript, LangGraph Python và AI SDK + Workflow SDK; chưa benchmark các phương án.

## Decision

- Chọn **Python + FastAPI + LangGraph** cho `services/agent-service`. FastAPI phục vụ ranh giới HTTP
  và xử lý I/O bất đồng bộ; LangGraph diễn đạt trạng thái, đường chuyển bước, chờ xác nhận và phục hồi.
  Đây là dịch vụ độc lập về trách nhiệm, không gộp giao dịch Core vào Agent.
- Dùng **uv** quản lý môi trường, dependency và lockfile Python trong monorepo. **npm workspaces
  tiếp tục quản lý phần JavaScript/TypeScript**; npm không cài package Python và uv không thay npm.
  `pyproject.toml`, `uv.lock`, Python/uv version và kiểm tra lockfile trong CI cần được thiết kế trước
  triển khai. Dùng uv trong monorepo không bắt buộc tạo uv workspace nhiều member khi chỉ có một dịch vụ Python;
  layout cụ thể chưa chốt và chưa tạo file môi trường/lockfile trong quyết định này.
- Giữ hướng **Pydantic v2** để kiểm tra dữ liệu tại ranh giới và **checkpoint PostgreSQL** để lưu
  tiến trình Agent như cấu hình đã đề xuất. Model sinh ra không là nguồn hợp đồng thứ hai;
  `packages/contracts` vẫn sở hữu hợp đồng. Công cụ xuất schema được chốt tiếp tại
  [ADR-0014](0014-zod-json-schema-and-pydantic-contracts.md); profile và kiểm chứng tương thích còn cần thiết kế.
- Core tiếp tục xác thực/phân quyền, chống thao tác lặp và xác nhận kết quả nghiệp vụ. State/checkpoint
  của Agent không thay trạng thái Core; không có transaction chung checkpoint–Core hoặc bảo đảm
  tác dụng phụ đúng một lần chỉ từ resume/retry.

## Alternatives Considered

| Phương án | Điểm phù hợp | Đánh đổi / kết quả |
|---|---|---|
| **Python + FastAPI + LangGraph** | Trạng thái/đường chuyển rõ; chờ xác nhận, streaming và persistent checkpoint. Tài liệu Python mô tả chế độ sync ghi checkpoint trước bước kế tiếp. | Được chọn. Cần quản lý ranh giới hợp đồng Python–TypeScript và pin/kiểm chứng hành vi phục hồi thực tế. Không có kết luận nhanh nhất. |
| TypeScript + NestJS/Fastify + LangGraph.js | Hợp đồng TypeScript dùng chung trực tiếp; có cùng nhóm năng lực graph/interrupt/streaming. | Không chọn. Tài liệu hiện tại về durability có khác biệt với Python; không mặc định mọi phiên bản/ngữ nghĩa tương đương. |
| TypeScript + AI SDK + Workflow SDK | Có tool loop lưu bền, streaming và approval; có đường tự host. | Không chọn. Cần tích hợp workflow runtime; Postgres World hiện là bản tham khảo cần điều chỉnh/bảo vệ cho vận hành. Không kết luận bị khóa Vercel hoặc chỉ hỗ trợ vòng lặp trong RAM. |

## Consequences

- Phải kiểm chứng theo tổ hợp Python/FastAPI/LangGraph/checkpointer đã pin. Độ bền được tài liệu mô tả
  không thay bài thử crash, pool lỗi, checkpoint lỗi và ghi Core thành công nhưng mất phản hồi.
- Resume/replay có thể chạy lại node và lệnh gọi Core. Cần định danh thao tác ổn định, chống lặp ở Core,
  tra cứu kết quả chưa rõ và kiểm lại giá/hold/quyền sau chờ xác nhận; không tự reset TTL 300 giây.
- Thread/run thuộc người dùng đã xác thực; thread ID không là bằng chứng được phép đọc hoặc resume.
  Token/secret không đưa vào prompt, checkpoint, SSE hoặc trace. Vị trí thực thi đã được làm rõ trong
  [thiết kế bảy service](../05-specs/004-service-decomposition/spec.md): Agent truy vấn/đề xuất,
  app/BFF thực thi lệnh giao dịch đã xác nhận dưới quyền khách. Chi tiết token/quyền đọc của Agent
  theo ADR-0008 còn cần đặc tả; resume graph không tự phát lại lệnh giao dịch.
- Sự kiện UI có cấu trúc phải theo hợp đồng được kiểm tra; chỉ hiển thị vé/thành công sau xác minh Core.
  Không stream nội dung model như bằng chứng thanh toán hoặc trạng thái vé có thẩm quyền.
- Tại thời điểm ADR này chưa chọn model/provider; phần đó được chốt tiếp tại
  [ADR-0012](0012-cloudflare-workers-ai-and-gpt-oss-120b.md). Phiên bản package, host và sizing còn mở.
  [ADR-0011](0011-sse-starlette-for-agent-streaming.md) chọn SSE + sse-starlette phía Agent;
  browser fetch / expo/fetch + eventsource-parser phía client được chọn tiếp tại
  [ADR-0024](0024-fetch-and-eventsource-parser-for-sse-clients.md); hợp đồng event, auth và cấu hình/phục hồi còn cần thiết kế.
  Quyết định tiếp theo [ADR-0010](0010-langsmith-cloud-for-agent-observability.md) chọn LangSmith Cloud
  cho tracing/evaluation, bắt đầu Developer miễn phí; vùng, retention, quota/chi tiêu và tích hợp còn cần thiết kế.
  Module graph, saver PostgreSQL/Psycopg async pool và HTTPX được chốt tiếp tại
  [ADR-0013](0013-modular-agent-postgres-checkpoints-and-httpx.md). Codegen được chốt tiếp tại ADR-0014;
  [nghiên cứu mảnh ghép Agent](../99-notes/agent-production-components-research.md) giữ nguồn đối chiếu, chưa phải runtime.
- Hoàn tất chọn stack không có nghĩa đạt production. Cần auth/authorization, giới hạn tài nguyên,
  kiểm thử chất lượng tiếng Việt/tool calls, phục hồi, quan sát, backup và triển khai có bằng chứng.

### Chi phí

Framework/runtime nguồn mở không thay chi phí vận hành: compute, PostgreSQL/checkpoint/backup,
network, trace và model/provider cần dự toán theo tải, retention và nơi triển khai. LangGraph OSS
không bắt buộc dùng LangSmith hosting. LangSmith Cloud tracing được chọn tiếp tại ADR-0010;
đã chọn gói Developer miễn phí ban đầu; model/provider được chốt tiếp tại ADR-0012, nhưng chưa có tải để báo tổng tiền;
phải công khai phí trước khi chốt dịch vụ theo [tiêu chí dự án](../../PROJECT-OVERVIEW.md#technology-selection-criteria).

## References

- [LangGraph overview](https://docs.langchain.com/oss/python/langgraph/overview).
- [Python checkpoint/durability](https://docs.langchain.com/oss/python/langgraph/checkpointers).
- [JavaScript checkpoint/durability](https://docs.langchain.com/oss/javascript/langgraph/checkpointers).
- [FastAPI async](https://fastapi.tiangolo.com/async/).
- [FastAPI SSE](https://fastapi.tiangolo.com/tutorial/server-sent-events/).
- [uv projects](https://docs.astral.sh/uv/guides/projects/).
- [uv workspace semantics](https://docs.astral.sh/uv/concepts/projects/workspaces/).
- [Nghiên cứu lựa chọn framework](../99-notes/agent-framework-research.md).
- [Hợp đồng hiện có](../../packages/contracts/README.md).

Đối chiếu Context7, nguồn chính thức và hợp đồng trong worktree ngày 2026-11-16.
Chưa chạy runtime, benchmark hoặc kiểm thử codegen/tích hợp.
