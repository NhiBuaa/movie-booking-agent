# ADR-0028 — Groq Free GPT-OSS 120B dự phòng cho Agent

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi chọn A” sau câu hỏi chọn Groq Free hoặc
Groq Developer trả theo dùng, trong hội thoại Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`).
Bổ sung [ADR-0012](0012-cloudflare-workers-ai-and-gpt-oss-120b.md), giữ primary Cloudflare.
Chỉ chọn provider/tier và hướng suy giảm an toàn; chưa tạo tài khoản/key, gọi inference,
cài SDK, viết routing hoặc xác nhận runtime. Không chấp thuận nâng gói/billing/chi tiêu.

> **Đối chiếu nghiệp vụ ngày 2026-11-20:** [NFR-RES-01](../05-specs/nfr/ai-agent.md#9112-chính-sách-thử-lại-inference-và-chuyển-provider) ghi xác nhận của chủ sản phẩm
> về phạm vi cập nhật Q153 tại OPEN-12. ADR này sở hữu lựa chọn provider/tier. NFR quy định khi nào
> được chuyển dự phòng inference và các giới hạn theo lượt. Cấu hình và kiểm chứng routing còn mở.

## Context

Workers AI có quota/capacity hữu hạn. Mục tiêu portfolio online liên tục không tạo SLA cho model;
cần phương án khi inference gián đoạn mà không làm lặp giao dịch Cinema Core.
Chủ sản phẩm chọn miễn phí trong quota, chấp nhận Agent tạm ngừng nếu cả hai provider không dùng được.

## Decision

- Giữ **Cloudflare Workers AI Free + `@cf/openai/gpt-oss-120b`** làm primary; thêm
  **Groq Free + `openai/gpt-oss-120b`** làm provider dự phòng. Không chọn 20B làm tầng thứ ba,
  Workers Paid hoặc Groq Developer. Không tự nâng gói khi quota hết.
- Hướng tích hợp dùng Chat Completions/local tool calling từ Agent Python/LangGraph.
  Model đề xuất tool; Agent kiểm schema/quyền truy vấn và tạo đề xuất có cấu trúc. App/BFF thực thi
  lệnh đã được khách xác nhận đúng nội dung/phiên bản dưới danh tính khách theo
  [thiết kế bảy service](../05-specs/004-service-decomposition/spec.md). Không dùng agent runner
  của provider để tự điều phối giao dịch. Adapter/package/version cụ thể cần pin và kiểm tương thích.
- Fallback ở bước inference có kiểm soát, không phát lại toàn graph. Theo [NFR-RES-01](../05-specs/nfr/ai-agent.md#9112-chính-sách-thử-lại-inference-và-chuyển-provider), retry, deadline và đồng thời theo tài khoản đã có chính sách.
  Chi tiết history/output/tool rounds, timeout call và circuit breaker còn cần thiết kế.
  Lỗi cấu hình/quyền/schema cần báo đúng nguyên nhân, không mặc định retry mọi provider.
- Chỉ thực thi tool từ kết quả hoàn chỉnh đã kiểm; không thực thi tool arguments đang stream dở.
  Nếu đã gửi text một phần, không nối tiếp im lặng bằng provider khác như cùng một generation;
  cần event reset/lỗi phù hợp. Giao thức UI/lifecycle cụ thể cần đặc tả.
- Khi endpoint/adapter lỗi stream, có thể dùng chế độ nhận đầy đủ kết quả inference đã kiểm cho
  bước chọn tool, còn SSE gửi tiến trình/thẻ UI/kết quả. Không giả token streaming bằng cách cắt text đã nhận.
  Giới hạn `stream:false` của Responses API không đồng nghĩa Chat Completions không hỗ trợ streaming.
- Nếu cả hai provider hết quota/lỗi, thông báo Agent tạm gián đoạn, giữ dữ liệu và đường đặt vé trực tiếp
  qua Core. Không tự hủy đơn/hold, reset TTL hoặc bịa kết quả. Đây là hành vi mục tiêu, chưa triển khai.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| **Cloudflare Free → Groq Free 120B** | Được chọn: có provider độc lập, inference không tính phí trong quota. Vẫn có thể cùng hết quota/capacity; chấp nhận Agent gián đoạn và đường đặt vé trực tiếp. |
| Cloudflare Paid, một provider | Giảm cutoff do free quota, nhưng thêm phí và không dự phòng outage provider. Không chọn. |
| Cloudflare Free → Groq Developer 120B | Giảm phụ thuộc free quota bằng trả theo dùng, vẫn cần ngân sách và xử lý gián đoạn. Chủ sản phẩm chọn Free; chưa cho phép billing. |

## Consequences

- Quota phải kiểm theo tài khoản/dashboard/headers trước public demo. Không cộng quota model/key như
  nguồn độc lập hoặc bypass bằng nhiều account. Free fallback không bảo đảm AI sẵn sàng 24/7.
- Cùng họ model không bảo đảm cùng semantics tool/stream/schema, chất lượng tiếng Việt hoặc latency.
  Kiểm mỗi endpoint, gồm tool IDs/round-trip, usage/reasoning và lỗi giữa stream; không tự dùng
  Structured Outputs với tools/stream nếu provider không hỗ trợ tổ hợp đó.
- Operation ID/idempotency bền và tra cứu Core sau timeout vẫn bắt buộc. Checkpoint không làm
  side effect đúng một lần; model fallback không tạo lại hold/payment/hoàn tiền đã có kết quả chưa rõ.
- Groq là nơi nhận dữ liệu bổ sung: giảm PII, không gửi secrets/token, che trace LangSmith;
  [NFR-PRIV-02](../05-specs/nfr/privacy-and-audit.md#961-nfr-priv-02---xóa-lịch-sử-chat-và-checkpoint-theo-yêu-cầu) yêu cầu xác minh Groq ZDR và cấu hình hạn chế lưu nội dung
  ở cả hai nguồn trước khi gửi chat thật.
- Kiểm quota/429/5xx, timeout, partial tool args, đổi provider sau text dở, resume/concurrent replicas,
  Core đã commit nhưng timeout, cả hai lỗi và booking trực tiếp. Đo usage/phiên, chất lượng và độ trễ;
  mục tiêu và bộ ca đã duyệt xem [NFR của Agent](../05-specs/nfr/ai-agent.md). Cỡ mẫu độ trễ và bằng chứng tích hợp còn mở.

### Chi phí và giới hạn

Lựa chọn này không có phí inference trong quota miễn phí, không đồng nghĩa toàn hệ thống miễn phí.
Nguồn ngày 2026-11-17: Cloudflare 10.000 neurons/ngày; Groq Free 120B công bố 30 RPM, 1.000 RPD,
8.000 TPM, 200.000 TPD, theo organization và có ngoại lệ tài khoản. Một phiên có nhiều calls;
không coi ví dụ 102 Cloudflare calls là số phiên bảo đảm. Không tự bật overage hoặc trả phí khi cạn quota.
Hosting/tracing/network và dịch vụ khác giữ chính sách chi phí riêng.

Lựa chọn embedding tiếp nối tại [ADR-0032](0032-cloudflare-workers-ai-for-managed-embeddings.md) và
[ADR-0033](0033-qwen3-embedding-for-movie-retrieval.md) dùng chung allocation Cloudflare với chat:
query embedding và indexing đều tiêu hao quota đó. Ví dụ 102 calls ở nghiên cứu chưa trừ embedding;
Groq chỉ dự phòng chat, không cung cấp vector tương thích thay Qwen3.

## References

- [Nghiên cứu quota, fallback và streaming](../99-notes/agent-provider-resilience-research.md).
- [Groq limits](https://console.groq.com/docs/rate-limits).
- [Groq local tools](https://console.groq.com/docs/tool-use/local-tool-calling).
- [Groq data policy](https://console.groq.com/docs/your-data).
- [Cloudflare pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).
- [Cloudflare API compatibility](https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/).

Nguồn/Context7 đối chiếu ngày 2026-11-17 trong nghiên cứu; chưa gọi model hoặc xác minh quota tài khoản.
