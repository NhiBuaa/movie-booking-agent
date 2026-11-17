# ADR-0012 — Cloudflare Workers AI và GPT-OSS 120B cho Agent

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý với đề xuất của bạn” sau đề xuất
chốt Cloudflare Workers AI + GPT-OSS 120B trong hội thoại Tech Stack
(`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`). Chỉ chọn công nghệ cho bản portfolio đầu tiên;
chưa cài package, tạo tài khoản/token, gọi inference, kích hoạt trả phí hoặc triển khai.

## Context

Agent đã chọn [Python/FastAPI/LangGraph/uv](0009-python-fastapi-langgraph-and-uv-for-agent-service.md),
[LangSmith Cloud Developer](0010-langsmith-cloud-for-agent-observability.md) và
[SSE + sse-starlette](0011-sse-starlette-for-agent-streaming.md).
Cần một dịch vụ model bên ngoài để hiểu hội thoại tiếng Việt và đề xuất gọi công cụ Cinema Core.
Mục tiêu là portfolio thể hiện lựa chọn công nghệ và hệ thống phân tán; không coi model mới/lớn,
thêm provider hoặc benchmark nhà cung cấp là bằng chứng chất lượng booking.

## Decision

- Chọn **Cloudflare Workers AI**, model **`@cf/openai/gpt-oss-120b`**, làm model chính ban đầu.
  Bắt đầu trong allocation miễn phí; Groq Free GPT-OSS 120B được chọn tiếp làm dự phòng tại
  [ADR-0028](0028-groq-free-for-agent-provider-fallback.md), không bật trả phí khi hết quota.
- Agent Service tiếp tục chạy Python/FastAPI/LangGraph và gọi API model từ server.
  Lựa chọn này không chọn hosting Agent và không yêu cầu chuyển graph sang Workers.
- Hướng tích hợp dùng Chat Completions có streaming và tool calling. Responses API cho GPT-OSS
  hiện chỉ hỗ trợ `stream:false`; adapter/phiên bản, cách đọc usage/reasoning và hợp đồng tool
  còn phải kiểm chứng. Không mặc định tương thích OpenAI đồng nghĩa hỗ trợ mọi tính năng.
- Model chỉ đề xuất tên công cụ/đối số. Agent kiểm schema, quyền và xác nhận cần thiết trước gọi
  Core; chỉ trình bày vé sau xác minh phản hồi/chữ ký Core. Model không giữ thẩm quyền ghế/giá/vé.
- Trước demo công khai, đánh giá tiếng Việt, tool/đối số, đổi ý, thiếu thông tin, prompt injection,
  Core lỗi/hold hết hạn, độ trễ, usage và quota. Chưa có kết quả chứng minh thắng phương án khác.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| **Workers AI + GPT-OSS 120B** | Được chọn: hỗ trợ hướng tool/stream, API gọi từ Python; allocation miễn phí thuận lợi cho ví dụ demo đã so sánh. Cần kiểm đúng endpoint/adapter và schema. |
| Groq Free + GPT-OSS 20B/120B | Hợp lệ; giới hạn 8.000 token/phút và 200.000 token/ngày dễ nghẽn khi chat có history/tools. Ban đầu chưa chọn; 120B được chọn tiếp làm dự phòng tại ADR-0028, không chọn 20B. |
| Workers AI + GPT-OSS 20B | Tốn ít neurons hơn; giữ làm phương án đã cân nhắc, chưa triển khai routing. Chưa đo chất lượng/độ trễ so với 120B trong booking. |
| OpenAI Terra, Gemini Hydrogen, Claude Sonnet và Ollama local | Các hướng đã nghiên cứu; không chọn ở vòng này. Không suy kết quả lựa chọn thành đánh giá chúng kém hơn. |

## Consequences

- Provider email được chọn tiếp là Resend tại [ADR-0018](0018-resend-for-transactional-email.md);
  chính sách gửi lại/lỗi email và các kênh thông báo khác vẫn còn mở ở mô hình sản phẩm.
- SSE truyền text và event ứng dụng; sự kiện UI/giao dịch phải được tạo từ dữ liệu đã kiểm tra,
  không phụ thuộc model luôn trả schema đúng. Strict schema cho đúng GPT-OSS/endpoint chưa xác nhận.
- Cần deadline, giới hạn concurrency/token, xử lý quota/429/thiếu capacity và phục hồi an toàn.
  Mất phản hồi không cho phép phát lại hold/payment mù; tra Core và giữ idempotency/xác nhận.
  Hết quota có thể làm Agent gián đoạn; không tự chuyển sang provider tính phí.
- Workers AI cam kết không training và không giữ nội dung standard stateless inference sau xử lý,
  có ngoại lệ legal/security và các feature lưu trạng thái/log/cache. Metadata vận hành vẫn được lưu.
  Phải giảm dữ liệu gửi model; LangSmith có chính sách xuất trace riêng theo ADR-0010.

### Chi phí và giới hạn ban đầu

Theo nguồn ngày 2026-11-17: Workers AI có **10.000 neurons/ngày** dùng chung allocation, reset
00:00 UTC (07:00 Việt Nam). Với 120B, bảng quy đổi là 31.818 neurons/M input và 68.182 neurons/M output
(dấu chấm phân cách hàng nghìn). Ví dụ 2.000 input + 500 billed output/call tương đương khoảng
97,727 neurons/call và **102 calls/ngày**, không phải 102 cuộc đặt vé; chưa cache/retry và reasoning
phải nằm trong tổng output tính phí. Đây là phép tính minh họa, chưa xác nhận quota tài khoản.

Theo đường Workers Paid đã so sánh: tối thiểu **5 USD/tài khoản/tháng**, vẫn có allocation hằng ngày;
phần vượt tính **0,011 USD/1.000 neurons**. Đơn giá 120B tương đương **0,35 USD/M input** và
**0,75 USD/M output**. Chưa gồm thuế, hosting Agent, tracing và dịch vụ khác; không có quyền nâng
gói/chi tiêu từ ADR này. Việc bắt đầu miễn phí ở đây không đổi ưu tiên kỹ thuật chung của dự án.

## References

- [Nghiên cứu LLM và so sánh Groq/Workers AI](../99-notes/llm-provider-research.md).
- [Workers AI GPT-OSS 120B](https://developers.cloudflare.com/workers-ai/models/gpt-oss-120b/).
- [OpenAI-compatible API và giới hạn Responses](https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/).
- [Changelog Chat Completions/tool round-trip](https://developers.cloudflare.com/workers-ai/changelog/).
- [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).
- [Workers plan pricing](https://developers.cloudflare.com/workers/platform/pricing/).
- [Workers AI data usage](https://developers.cloudflare.com/workers-ai/platform/data-usage/).
- [Mô hình sản phẩm và OPEN-09](../03-product/use-cases.md).

Nguồn/Context7 đã đối chiếu ngày 2026-11-17; lựa chọn được chấp thuận không xác nhận runtime,
chất lượng tiếng Việt, SLA, quota tài khoản hoặc hiệu năng.
