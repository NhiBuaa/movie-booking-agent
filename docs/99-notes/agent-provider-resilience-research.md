# Dự phòng provider, quota và streaming của Agent

Tra cứu nguồn chính thức và Context7 ngày 2026-11-17.
**Phương án A đã được chấp thuận tại [ADR-0028](../06-decisions/0028-groq-free-for-agent-provider-fallback.md): Cloudflare Free → Groq Free 120B; chưa duyệt trả phí/triển khai.**
So sánh/đề xuất dưới đây giữ bối cảnh trước quyết định; ADR sở hữu lựa chọn hiện hành.
Đích: worktree `docs-tech-stack-decisions/movie-booking-agent`, detached HEAD `8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.
Chỉ đọc/ghi nghiên cứu; chưa cài SDK, gọi inference, tạo tài khoản, nâng gói, chạy runtime hoặc commit.

## Phần đã chọn và kết quả kiểm tra giả định

[ADR-0012](../06-decisions/0012-cloudflare-workers-ai-and-gpt-oss-120b.md) chọn Workers AI GPT-OSS 120B,
bắt đầu miễn phí; tại thời điểm nghiên cứu chưa chọn fallback, sau đó bổ sung tại ADR-0028.
[ADR-0013](../06-decisions/0013-modular-agent-postgres-checkpoints-and-httpx.md)
giữ LangGraph tường minh, checkpoint PostgreSQL và Core có thẩm quyền; SSE client theo
[ADR-0024](../06-decisions/0024-fetch-and-eventsource-parser-for-sse-clients.md).
Mục tiêu portfolio online liên tục không tự là SLA hoặc quyền mua quota; website còn truy cập được
khác với mọi lượt chat đều sinh được câu trả lời khi provider hết quota hoặc mất capacity.

- Workers AI có 10.000 neurons/ngày, reset 00:00 UTC; Free vượt allocation thì request tiếp theo lỗi.
  Quy đổi 120B: 31.818 neurons/M input và 68.182 neurons/M output. Với 2.000 input + 500 billed output,
  phép tính là ~97,727 neurons/call, ~102 calls/ngày. Đây là ví dụ, không phải quota số calls cố định.
  Ví dụ này chưa trừ quota embedding: query/indexing Qwen3 được chọn tiếp tại
  [ADR-0032/0033](../06-decisions/0033-qwen3-embedding-for-movie-retrieval.md) dùng chung allocation với chat;
  Groq dự phòng chat không tạo vector thay Qwen3.
  Chỉ nếu giả định 4–5 calls/phiên mới suy ~20–25 phiên; history/tool results/reasoning/retry làm kết quả khác.
  Chưa đo trace hoặc xác nhận quota tài khoản. [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).
- `stream:false` là giới hạn **Responses API của GPT-OSS**, không phải giới hạn toàn bộ model.
  Chat Completions có đường dùng `messages`/`stream:true`; model công bố function calling.
  [Compatibility](https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/),
  [model streaming example](https://developers.cloudflare.com/workers-ai/models/gpt-oss-120b/).
- Changelog 2026-02-17 bổ sung GPT-OSS Chat Completions và sửa tool-call IDs, `content:null`,
  round-trip và finish reason khi stream. Đây là bằng chứng tài liệu hỗ trợ, chưa chứng minh adapter/SDK
  dự án chạy được tổ hợp tool + stream. [Changelog](https://developers.cloudflare.com/workers-ai/changelog/).

## Provider dự phòng khả thi: Groq GPT-OSS

Groq có `openai/gpt-oss-120b` và `openai/gpt-oss-20b`; hướng gọi **Chat Completions + local tool calling**
để LangGraph/Agent kiểm truy vấn và tạo đề xuất có cấu trúc; theo
[ranh giới bảy service](../05-specs/004-service-decomposition/spec.md), app/BFF thực thi lệnh giao dịch
đã xác nhận bằng quyền khách. Không đưa booking tool vào built-in search/code/MCP runner.
Tài liệu có vòng streaming local tools với 120B; bảng công bố GPT-OSS không hỗ trợ parallel tool use.
Không coi OpenAI-compatible là hợp đồng mọi parameter/capability đều giống Cloudflare.
[Groq tool overview](https://console.groq.com/docs/tool-use/overview),
[streaming local tools](https://console.groq.com/docs/tool-use/local-tool-calling).
Structured Outputs `response_format: json_schema` hiện không kết hợp streaming/tool use;
không nhầm giới hạn này với local function calling hoặc coi strict output thay validation ứng dụng.
[Structured Outputs](https://console.groq.com/docs/structured-outputs).

| Model Groq | Free RPM | Free RPD | Free TPM | Free TPD | Developer giá/M input + output |
|---|---:|---:|---:|---:|---|
| `openai/gpt-oss-120b` | 30 | 1.000 | 8.000 | 200.000 | 0,15 USD + 0,60 USD |
| `openai/gpt-oss-20b` | 30 | 1.000 | 8.000 | 200.000 | 0,075 USD + 0,30 USD |

Giới hạn áp dụng theo organization, có ngoại lệ; đọc dashboard/response headers trước triển khai.
Không cộng quota hai model như hai ngân sách độc lập khi chưa xác minh tài khoản; đổi sang 20B không
tự tăng TPM/TPD. Developer catalog công bố 250.000 TPM/1.000 RPM cho hai model, không là quota đã cấp.
[Rate limits](https://console.groq.com/docs/rate-limits), [models/pricing](https://console.groq.com/docs/models).
Với giả định không cache 2.500 tokens/call, 200.000 TPD chỉ cho ~80 calls/ngày và 8.000 TPM ~3 calls/phút;
đây là tính nhẩm theo tải giả định, không là năng lực đã đo hoặc lý do bỏ rate limiting ứng dụng.

## Ba chiến lược

| Hướng | Ưu điểm | Chi phí / giới hạn |
|---|---|---|
| **A. Workers AI Free → Groq Free 120B** | Hai provider, giữ chi phí inference bằng 0 trong quota; phù hợp thử/demo tải nhỏ. | Cả hai vẫn có quota/capacity; hết cả hai phải báo gián đoạn Agent và cho tiếp tục màn hình trực tiếp. Không đủ căn cứ hứa AI sẵn sàng 24/7. |
| **B. Workers AI Paid, một provider** | Vượt allocation miễn phí được tính tiền, bớt một nguyên nhân cutoff; ít integration hơn. | Tối thiểu Workers 5 USD/account/tháng + AI overage 0,011 USD/1.000 neurons; không dự phòng outage/capability của provider. |
| **C. Workers AI Free → Groq Developer 120B, ngân sách hữu hạn** | Giữ primary đã chọn, provider thứ hai có capacity trả theo dùng để tránh chỉ trông hai free quotas; dùng cùng họ model giảm thay đổi ban đầu. | Groq cần payment method/nâng gói; tiền theo tokens, không mua SLA từ việc nâng tier. Ngân sách hết hoặc cả hai lỗi vẫn cần chế độ suy giảm an toàn. |

Groq Developer dùng pay-as-you-go, không thu ngay khi nâng; hóa đơn theo kỳ hoặc billing thresholds.
[Billing FAQs](https://console.groq.com/docs/billing-faqs).
Ví dụ 1.000 calls ở Groq 120B, mỗi call 2.000 input + 500 billed output, ~0,60 USD tiền tokens;
history, reasoning, retries và tải thực làm số này thay đổi; chưa gồm thuế, host, tracing hay network.
Workers Paid và AI overage theo [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
và bảng AI pricing ở trên; đổi 120B → 20B trên cùng Cloudflare không dự phòng outage/account quota chung.

**Đề xuất kỹ thuật:** chọn **Groq GPT-OSS 120B làm provider dự phòng**, cùng Chat Completions/local tools,
và kiểm nghiệm trước khi bật routing. Chọn **A nếu yêu cầu tiếp tục 0 USD inference** và chấp nhận gián đoạn
Agent; ưu tiên **C cho demo công khai muốn hạn chế gián đoạn vì free quota**, sau khi chủ dự án duyệt
trần chi và billing. Không tự bật C từ việc duyệt nhà cung cấp. 20B chỉ là ứng viên đánh giá sau,
không tự là tầng fallback thứ ba; cùng weights không bảo đảm cùng chất lượng/cấu hình giữa hai provider.

## Routing, stream và an toàn giao dịch cần đặc tả

- Một node inference có provider adapters/capability profiles: endpoint/model, stream/tools,
  schema subset, token/reasoning limits, usage/error mapping. Không thay LangGraph bằng agent runner
  phía provider hoặc phát lại toàn graph khi một model call lỗi. SDK/provider package cụ thể cần pin/kiểm.
- Giới hạn concurrency, input/history, output, số lượt tool và deadline toàn turn; đặt ngân sách dùng
  chung qua replicas, dự trữ usage trước request và đối chiếu thực tế sau. Hạn mức ở gateway/API chống
  lạm dụng vẫn cần dù model miễn phí; không bypass quota bằng nhiều account/key.
- Lỗi capacity/5xx/network tạm: retry ít lần, backoff có jitter và deadline; tôn trọng Retry-After.
  Hết daily quota/credit/budget: mở circuit cho provider tới thời điểm reset/khôi phục thay retry liên tục.
  401/403 hoặc schema/config sai: cảnh báo/sửa cấu hình, không che thành outage rồi retry mọi provider.
- Fallback chỉ **bước inference chưa commit** từ message/state đã kiểm. Nếu đã gửi text dở về client,
  không nối tiếp im lặng bằng model khác như cùng câu; cần event ngắt/reset generation rõ ràng hoặc báo lỗi.
  Không đưa fragment/tool delta chưa hoàn chỉnh vào lịch sử chuẩn; chỉ thực thi tool sau parse/schema,
  quyền, confirmation, kết thúc generation hợp lệ và ràng buộc nghiệp vụ.
- Khi provider có lỗi stream cụ thể, có thể dùng **inference buffered** đã kiểm cho bước chọn tool,
  SSE vẫn gửi trạng thái/thẻ UI và kết quả hoàn chỉnh. Không cắt response đã nhận thành token giả để
  tuyên bố model streaming; không bật Structured Outputs+stream/tools nếu endpoint không hỗ trợ.
- Checkpoint không làm side effect đúng một lần. Operation ID/idempotency bền trước gọi Core;
  timeout chưa rõ kết quả thì tra Core, không tạo hold/payment mới, không reset TTL 300 giây.
  [LangGraph fault tolerance](https://docs.langchain.com/oss/python/langgraph/fault-tolerance)
  và [node re-execution](https://docs.langchain.com/oss/python/langgraph/graph-api).
- Groq paid spend cap block `400 blocked_api_access` khi phát hiện đạt mức; theo dõi trễ 10–15 phút
  có thể vượt, nên thêm budget ứng dụng/headroom, không hứa hard cap chính xác.
  [Groq spend limits](https://console.groq.com/docs/spend-limits).
  Workers spending limit chỉ đếm request/CPU, không mặc định bảo vệ tiền Workers AI theo neurons.
- Khi cả hai không dùng được, thông báo Agent tạm gián đoạn và giữ đường booking trực tiếp dùng Core;
  không bịa kết quả, xóa phiên, hủy giao dịch hoặc tự trả phí để giấu sự cố. Khôi phục từ trạng thái Core.
- Provider fallback mở rộng nơi dữ liệu được gửi. Giảm PII, không gửi token/secret, che LangSmith traces;
  Groq mặc định có ngoại lệ lưu để reliability/abuse tối đa 30 ngày, có tùy chọn ZDR cần xác minh cấu hình.
  [Groq data policy](https://console.groq.com/docs/your-data). LangSmith giữ chính sách riêng theo ADR-0010.

## Kiểm chứng trước bật và cập nhật tài liệu cần duyệt

Đánh giá cùng bộ tiếng Việt/booking trên mỗi endpoint: tool đúng/đối số đúng, hỏi lại, đổi ý,
prompt injection, quyền sai, hold hết hạn, Core timeout sau commit. Đo calls/tokens/neurons mỗi phiên,
latency p50/p95, time-to-first-text, tỷ lệ hoàn tất, lý do fallback, lỗi/trùng thao tác và chi phí.
Thử 429 ngắn/daily quota, lỗi 5xx, stream cắt giữa tool arguments, client disconnect, retry/resume,
provider switch sau text dở, concurrent replicas và budget vượt ngưỡng. Chưa có ngưỡng acceptance đã duyệt.
Nếu chọn fallback/billing phải cập nhật hoặc bổ sung ADR-0012, contract/capability tests và telemetry;
quyết định sau nghiên cứu đã chọn A tại ADR-0028, chưa chọn C hoặc cho phép billing. Routing/tests chưa triển khai.

Context7 dùng `/websites/developers_cloudflare_workers-ai`, `/websites/console_groq`,
`/websites/langchain_oss_python_langgraph`; tài liệu không thay kiểm chứng tài khoản hoặc runtime.
