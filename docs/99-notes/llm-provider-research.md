# LLM cho Movie Booking Agent — ba ứng viên managed API

Tra cứu ban đầu ngày 2026-11-16, bổ sung ngày 2026-11-17. **Ghi chú nghiên cứu, không phải nguồn quyết định.**
Sau so sánh, chủ sản phẩm đã chọn Cloudflare Workers AI + GPT-OSS 120B tại
[ADR-0012](../06-decisions/0012-cloudflare-workers-ai-and-gpt-oss-120b.md). Các đề xuất bên dưới giữ
bối cảnh tại lúc nghiên cứu; ADR sở hữu lựa chọn hiện hành. Groq Free 120B được chọn tiếp làm dự phòng tại
[ADR-0028](../06-decisions/0028-groq-free-for-agent-provider-fallback.md).
Provider email được chọn tiếp là Resend tại [ADR-0018](../06-decisions/0018-resend-for-transactional-email.md);
OPEN-09 vẫn còn chính sách mã/gửi lại/lỗi và kênh thông báo ngoài email.
Chỉ đọc tài liệu công khai; không gọi inference, tài khoản, secret hoặc cài SDK. Giá có thể thay đổi.
Không xem subscription ChatGPT/Claude/Gemini là đã cấp quyền hoặc thanh toán mọi API request.

## Tiêu chí và ba model cụ thể

Agent cần hiểu tiếng Việt, hỏi thiếu thông tin, gọi đúng tool/đối số, giữ ngữ cảnh và stream UI.
Model không sở hữu ghế/giá/TTL/quyền hoặc xác nhận vé; Core và lớp thực thi vẫn kiểm độc lập.
Chọn ứng viên theo khả năng được tài liệu xác nhận, không tự chọn model lớn nhất hoặc model mới nhất.
Tiền chỉ công khai, không dùng loại phương án; chưa có domain eval để xếp hạng chất lượng/latency.

| API/model hiện hành | Khả năng đã xác minh | Đánh đổi áp dụng — nhận định |
|---|---|---|
| OpenAI **`gpt-6.1-terra`** | Function calling, structured output, streaming; reasoning effort có `none/low/...`; tool calling yêu cầu **Responses API**. | Ứng viên cân bằng cho extraction/tool orchestration; cần pin adapter có Responses support và kiểm schema thực tế, không dùng Chat Completions mặc định rồi giả định tool hoạt động. |
| Google Gemini Developer API **`gemini-4-hydrogen`** | Trang model ghi **Stable**, cập nhật 11/2026; function calling, structured output, thinking; caching chỉ implicit. | Ứng viên agent tương tác hiện đại. Cần xử lý metadata/thought signatures đúng adapter; điều khoản độ tuổi phía dưới là điều kiện phù hợp sản phẩm chưa được giải quyết. |
| Anthropic **`claude-sonnet-5-5`** | Active, phát hành 28/09/2026; agentic tool use, structured outputs/strict tool use; adaptive thinking và streaming. | Ứng viên cho hội thoại nhiều bước, không phải bằng chứng tốt hơn hai model kia trong tiếng Việt. Không sao chép `temperature/top_p/top_k` dùng chung vì model này trả 400 với các tham số đó. |

Nguồn: [Terra model](https://developers.openai.com/api/docs/models/gpt-6.1-terra),
[Hydrogen model](https://aistudio.google.com/docs/models/gemini-4-hydrogen),
[Sonnet model](https://platform.claude.com/docs/en/models/sonnet-5-5/overview),
[Claude structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs).
Structured output/schema hợp lệ không chứng minh đối số đúng nghiệp vụ hoặc người dùng đã xác nhận.

## SDK/adapter Python và giới hạn đổi provider

LangGraph có thể dùng adapter `langchain-openai`/`ChatOpenAI`, `langchain-google-genai`/
`ChatGoogleGenerativeAI`, `langchain-anthropic`/`ChatAnthropic`; cả ba tài liệu tích hợp có native async,
token streaming, tool calling và structured output. Đây là khả năng của tích hợp, chưa kiểm chứng
đúng model+version+schema dự án; không tự hứa mọi tính năng ngang nhau hoặc đổi provider không cần sửa.
[OpenAI adapter](https://docs.langchain.com/oss/python/integrations/chat/openai),
[Google adapter](https://docs.langchain.com/oss/python/integrations/chat/google_generative_ai),
[Anthropic adapter](https://docs.langchain.com/oss/python/integrations/chat/anthropic).

Các SDK/adapter là phần mềm client; managed model API là dịch vụ theo điều khoản nhà cung cấp,
không phải vì adapter nguồn mở mà model inference miễn phí. Không bắt buộc thêm managed agent hosting.
Provider tools như search/computer use không thuộc nhu cầu Core tool hiện tại và có phí/quyền riêng.

## Giá Standard cho text context ngắn — USD trên 1 triệu token

| Model | Input thường | Cached input/read | Output | Ghi cache riêng |
|---|---:|---:|---:|---|
| `gpt-6.1-terra` | 1.00 | 0.05 | 5.00 | 1.25 cho 30 phút; 2.50 cho 12 giờ |
| `gemini-4-hydrogen` | 1.50 | 0.075 | 7.50 | Chỉ implicit caching; không chọn explicit cache/storage |
| `claude-sonnet-5-5` | 2.00 | 0.10 | 10.00 | 2.50 ghi 5 phút; 4.00 ghi 1 giờ |

Nguồn: [OpenAI model pricing](https://developers.openai.com/api/docs/models/gpt-6.1-terra),
[Gemini pricing](https://aistudio.google.com/docs/pricing#gemini-4-hydrogen),
[Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing).
OpenAI prompt >272K token tăng hệ số giá; mode nhanh/region/Batch/Flex có giá khác.
Không dùng giá Batch/Flex hoặc cache-hit làm giá mặc định cho chat tương tác chưa đo.

Ví dụ thuần phép tính: **1.000 model calls × 2.000 input + 500 billed output**, không cache/retry,
tương ứng 2M input và 0.5M output: Terra **4.50 USD**, Hydrogen **6.75 USD**, Sonnet **9.00 USD**.
Đây không phải 1.000 lượt đặt vé; một lượt chat có thể gọi model nhiều lần.
500 là tổng output được tính phí, không chỉ chữ nhìn thấy. Nếu 500 chỉ là visible text thì còn phải
cộng thinking/reasoning, tool payload, retry/fallback/evaluation; chưa gồm thuế, hosting, tracing, traffic.
OpenAI reasoning bị tính output; Gemini bảng giá ghi output gồm thinking. Claude cũng cần theo usage
thực tế/budget thinking, không tính từ số chữ tóm tắt reasoning được trả cho client.
[OpenAI reasoning](https://developers.openai.com/api/docs/guides/reasoning),
[Claude thinking](https://platform.claude.com/docs/en/build-with-claude/extended-thinking).

## Quota/concurrency và dữ liệu

RPM/TPM không đồng nghĩa số kết nối đồng thời hoặc số khách. Giới hạn phụ thuộc model/tier/tài khoản,
có thể 429 khi burst; cần semaphore/queue, deadline, backoff theo Retry-After và giới hạn thử lại.
OpenAI trang Terra ghi Build 5.000 RPM/1M TPM; đây là bảng công khai, chưa xác nhận quyền tài khoản.
Gemini áp theo project, có RPM/TPM/RPD và giới hạn theo mức chi tiêu; Claude có RPM/inputTPM/outputTPM
cùng ramp limit. Chưa tra quota tài khoản hoặc chọn concurrency/sizing.
[OpenAI limits](https://developers.openai.com/api/docs/models/gpt-6.1-terra),
[Gemini limits](https://aistudio.google.com/docs/rate-limits),
[Claude limits](https://platform.claude.com/docs/en/api/rate-limits).

Không dùng để training mặc định **không đồng nghĩa không lưu dữ liệu**. OpenAI API có abuse-monitoring
retention và application state tùy endpoint/feature; ZDR có điều kiện. Claude tài liệu phân biệt
standard policy, ZDR/feature eligibility và Covered Models; không mặc định mọi model/feature ZDR.
[OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data),
[Claude data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention).

Gemini paid service thường không dùng prompt/response cải thiện sản phẩm, khác unpaid/contributor.
Logs của project billing có thể bật mặc định cho Generate Content project tạo từ 26/10/2026;
default tối đa 55 ngày, có cấu hình 7/14/28/55; dataset do người dùng giữ có vòng đời khác.
[Gemini terms](https://aistudio.google.com/docs/terms), [logs policy](https://aistudio.google.com/docs/logs-policy).
**Điều kiện sản phẩm cần làm rõ:** Gemini Developer API terms không cho API client hướng tới hoặc
có khả năng được truy cập bởi người dưới 18 tuổi. Chưa xác định đối tượng Movie Booking có đáp ứng;
không âm thầm thêm age gate hoặc coi Gemini Cloud/Vertex có cùng điều khoản/giá. Đây là giới hạn
phù hợp của đường API đang so sánh, không phải kết luận pháp lý hay chọn host khác.

## Đề xuất và phép đánh giá trước chốt

Nghiêng đưa **Terra làm baseline đánh giá đầu tiên**, Sonnet làm đối chứng/fallback ứng viên:
cả hai có tool/schema/async adapter rõ, có thể điều chỉnh mức reasoning theo nhiệm vụ. Đây là thứ tự
đánh giá ban đầu, chưa chứng minh thắng về tiếng Việt/hiệu năng; lựa chọn sau đó là Workers AI/Groq Free
tại ADR-0012/0028, không phải các ứng viên Terra/Sonnet làm primary/fallback của dự án.
Hydrogen tiếp tục là ứng viên nếu ràng buộc độ tuổi/đường dịch vụ được làm rõ.

Bộ eval cần câu tiếng Việt có/không dấu, địa danh/thời gian mơ hồ, đổi ý, yêu cầu thiếu field,
prompt injection, yêu cầu ngoài quyền, xác nhận khác ghế/tiền, Core lỗi/hold hết hạn và đổi kênh.
Đo đúng tool/đối số, hỏi lại đúng lúc, không xác nhận vé giả, tỷ lệ hoàn thành, token/model calls,
thời gian token đầu/p95/hoàn tất, schema/refusal/error và chi phí toàn hành trình với cùng fixture/model settings.
Chưa chạy eval; không dùng benchmark vendor/cảm giác hội thoại làm bằng chứng nghiệm thu.

Fallback chỉ sau thiết kế/kiểm chứng: đổi model giữa ranh giới an toàn, chuẩn hóa state/tool result,
không phát lại lệnh Core có kết quả chưa rõ; giữ operation ID/idempotency/xác nhận và hỏi Core trước.
Không chạy song song nhiều model cùng thực thi hold/payment. Chưa triển khai routing/fallback hoặc gọi provider.

## Bổ sung 2026-11-17: lựa chọn không có phí inference API trong hạn mức

**Có**, nhưng gói API miễn phí khác model chạy cục bộ, và đều chưa chứng minh chất lượng booking.
Groq là nhà cung cấp; `openai/gpt-oss-20b`/`openai/gpt-oss-120b` là model OpenAI open-weight
được Groq host, không phải GPT-6 hay gói OpenAI API miễn phí. Hai model có trong danh sách production,
có tool use; bảng tool hiện không hỗ trợ parallel tool use trên GPT-OSS.
[Models](https://console.groq.com/docs/models), [tool support](https://console.groq.com/docs/tool-use/overview).

Groq Free công khai cho hai GPT-OSS: **30 RPM, 1.000 RPD, 8.000 TPM, 200.000 TPD**;
mọi giới hạn áp ở organization, chạm một giới hạn đã có thể 429. Đã đối chiếu tab Free trong HTML
và dữ liệu freeRows, không lấy quota Developer ở trang model làm quota Free. Exact account quota chưa xem.
[Rate limits](https://console.groq.com/docs/rate-limits), [billing tiers](https://console.groq.com/docs/billing-faqs).
Structured Outputs hiện có giới hạn không kết hợp streaming/tool use; tool calling streaming riêng
không tự thành cả ba cùng lúc. [Structured outputs](https://console.groq.com/docs/structured-outputs).
Groq mặc định không giữ prompt/output inference, nhưng có ngoại lệ feature/abuse/reliability;
usage metadata vẫn được lưu. Không hứa Free có SLA hoặc unlimited usage.
[Groq data](https://console.groq.com/docs/your-data).

Gemini có Free cho `gemini-4-hydrogen` (input/output không tính phí theo bảng hiện hành), quota theo
project/model và có thể thay đổi. Unpaid Services có thể dùng nội dung để cải thiện/training và có người
review; không gửi dữ liệu cá nhân/nhạy cảm. Điều khoản dưới 18 tuổi nêu trên vẫn áp dụng; chưa giải quyết
phù hợp người xem phim, không tự thêm age gate. [Free pricing](https://aistudio.google.com/docs/pricing#gemini-4-hydrogen),
[quota](https://aistudio.google.com/docs/rate-limits), [terms/ngoại lệ khu vực và billing](https://aistudio.google.com/docs/terms).

Ollama **local** chạy model trên máy riêng, không có hóa đơn inference API theo lần gọi của cloud;
vẫn cần CPU/GPU/RAM/VRAM, điện, dung lượng và vận hành. Ollama runtime [MIT](https://github.com/ollama/ollama/blob/main/LICENSE)
không thay license của từng model. Tool calling chỉ khả thi khi model chọn hỗ trợ và đạt eval;
chưa kiểm tra máy, chọn quantization/model hoặc đo latency. Không đánh đồng Ollama Cloud với local.
[Local FAQ](https://docs.ollama.com/faq), [tool calling](https://docs.ollama.com/capabilities/tool-calling),
[cloud khác local](https://docs.ollama.com/cloud).

Chưa chọn phương án miễn phí làm chính/dự phòng; không cài, tải model, tạo tài khoản hoặc gọi inference.

## Bổ sung 2026-11-17: Groq Free và Cloudflare Workers AI với cùng GPT-OSS

So sánh cùng họ model OpenAI open-weight: Groq `openai/gpt-oss-20b`/`openai/gpt-oss-120b`,
Cloudflare `@cf/openai/gpt-oss-20b`/`@cf/openai/gpt-oss-120b`; khác host, API và vận hành.
Không suy ra cùng tốc độ/chất lượng từ cùng tên model; chưa có booking eval hoặc đo latency.
[Groq models](https://console.groq.com/docs/models), [CF 20B](https://developers.cloudflare.com/workers-ai/models/gpt-oss-20b/), [CF 120B](https://developers.cloudflare.com/workers-ai/models/gpt-oss-120b/).

| Khoản so sánh | Groq | Cloudflare Workers AI |
|---|---|---|
| Miễn phí công khai | Cả hai: 30 RPM, 1.000 RPD, 8.000 TPM, 200.000 TPD | Tổng 10.000 neurons/ngày; reset 00:00 UTC, dùng chung allocation |
| Giá trả phí 20B / M input; output | 0.075; 0.30 USD | 0.200; 0.300 USD; 18.182; 27.273 neurons/M tương ứng |
| Giá trả phí 120B / M input; output | 0.15; 0.60 USD | 0.350; 0.750 USD; 31.818; 68.182 neurons/M tương ứng |
| Khi cần vượt Free | Developer plan, tính token theo bảng giá | Workers Paid tối thiểu 5 USD/tài khoản/tháng; vẫn có 10.000 neurons/ngày, phần vượt 0.011 USD/1.000 neurons |

Trong hai ô neurons, dấu chấm là phân cách hàng nghìn: ví dụ 18.182 = 18,182 neurons.
Nguồn: [Groq quota](https://console.groq.com/docs/rate-limits), [Groq giá](https://console.groq.com/docs/models),
[CF AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), [Workers base plan](https://developers.cloudflare.com/workers/platform/pricing/).
Đây là bảng công khai, không phải quota tài khoản đã kiểm; Free hết hạn mức sẽ lỗi, không tự trở thành unlimited.

**Ví dụ cùng tải:** 2.000 input + 500 **billed output** mỗi model call, không cache/retry; reasoning nếu có phải nằm trong 500.
Groq: 200.000/2.500 ≈ **80 calls/ngày/model**; 8.000 TPM tương đương khoảng **3 calls/phút** ở kích thước này, chưa xét cơ chế token reservation/burst.
CF: `2.000/1M × input_neurons + 500/1M × output_neurons` ≈ **50.0005 neurons/call 20B**, **97.727 neurons/call 120B**.
Suy ra khoảng **200 calls/ngày 20B** hoặc **102 calls/ngày 120B**, nếu toàn bộ allocation dành cho model đó; hệ số bảng làm tròn nên đây là ước tính.
Một hành trình đặt vé có thể cần nhiều calls; hội thoại dài, tool schemas/results, reasoning và retry làm giảm số hành trình miễn phí thực tế.

Với **1.000 calls/ngày**, trả phí toàn bộ tải ở Groq khoảng **0.30 USD/ngày 20B**, **0.60 USD/ngày 120B**.
CF trừ 10.000 neurons/ngày: khoảng **0.4400 USD/ngày 20B**, **0.9650 USD/ngày 120B**, rồi cộng base plan.
Nếu giữ tải này đủ 30 ngày: Groq **9/18 USD**; CF **18.20/33.95 USD** gồm 5 USD base, theo thứ tự 20B/120B.
Đây là phép tính minh họa, chưa gồm thuế, FastAPI hosting, tracing hoặc dịch vụ khác; không cộng allocation Free Groq vào Developer khi chưa có căn cứ.

**Tích hợp:** cả hai có REST; CF có ví dụ Python gọi từ server bên ngoài, không buộc chuyển FastAPI/LangGraph sang Workers.
[CF Python example](https://developers.cloudflare.com/workers-ai/models/gpt-oss-20b/), [CF OpenAI API](https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/).
CF [changelog 17/02/2026](https://developers.cloudflare.com/workers-ai/changelog/) xác nhận GPT-OSS Chat Completions streaming và tool round-trip (`tool_call_id`); riêng **Responses API chỉ `stream:false`**.
Groq có ví dụ GPT-OSS tool calling streaming,
và Structured Outputs `strict:true` cho hai model, nhưng Structured Outputs hiện **không kết hợp streaming hoặc tool use**.
[Groq tools](https://console.groq.com/docs/tool-use/local-tool-calling), [Groq schema restrictions](https://console.groq.com/docs/structured-outputs).
CF JSON Mode hiện ghi không streaming, không bảo đảm mọi schema và danh sách hỗ trợ chưa liệt kê GPT-OSS;
model page có `response_format` nên chưa kết luận strict schema GPT-OSS được xác nhận. Cần kiểm đúng model/endpoint/adapter trước triển khai.
[CF JSON Mode](https://developers.cloudflare.com/workers-ai/features/json-mode/).

**Dữ liệu:** CF cam kết không training và không lưu nội dung sau standard stateless inference, có ngoại lệ legal/security,
stateful feature, logging/cache do người dùng chọn; operational metadata vẫn lưu. Groq mặc định không giữ inference content,
nhưng reliability/abuse có thể lưu tới 30 ngày; có ZDR cho mọi khách hàng, tắt feature cần persistence; metadata vẫn lưu.
[CF data](https://developers.cloudflare.com/workers-ai/platform/data-usage/), [Groq data controls](https://console.groq.com/docs/your-data).
Nhận định: CF có allocation miễn phí rộng hơn trong ví dụ; Groq có đơn giá trả phí thấp hơn và tài liệu tool/schema rõ.
Tại mốc so sánh này chưa chọn provider; lựa chọn sau đó được ghi tại ADR-0012 dẫn ở đầu tài liệu.
OPEN-09 vẫn còn phần email/thông báo; chưa xác nhận SLA/chất lượng tiếng Việt.
