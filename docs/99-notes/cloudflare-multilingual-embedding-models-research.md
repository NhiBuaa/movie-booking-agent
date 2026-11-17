# Hai model embedding đa ngôn ngữ trên Cloudflare Workers AI

Tra cứu nguồn chính thức/Context7 ngày 2026-11-17. **Phương án A — Qwen3 Embedding 0.6B đã được chọn tại
[ADR-0033](../06-decisions/0033-qwen3-embedding-for-movie-retrieval.md); chưa triển khai.**
So sánh/đề xuất dưới đây giữ bối cảnh trước quyết định; ADR sở hữu lựa chọn hiện hành.
Đích: worktree `docs-tech-stack-decisions/movie-booking-agent`, detached HEAD `8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.
Chỉ ghi nghiên cứu; không tải weights, cài SDK, gọi inference, tạo account/key, bật billing, sửa code/config hoặc commit.

## Phạm vi đã chốt

[ADR-0032](../06-decisions/0032-cloudflare-workers-ai-for-managed-embeddings.md) chọn API embedding managed
của Cloudflare trong allocation miễn phí dùng chung; ADR-0033 chọn encoder Qwen3 Embedding 0.6B. Typesense là chỉ mục dẫn xuất theo
[ADR-0030](../06-decisions/0030-typesense-for-movie-search-and-discovery.md); content/profile scoring theo
[ADR-0031](../06-decisions/0031-content-based-and-profile-scoring-for-personalization.md).
Không thêm encoder local, GPU host, vector DB hoặc model embedding dự phòng ở vòng này.
Nhu cầu là hiểu mô tả phim/query tiếng Việt, tạo ứng viên cho search/ranker; Core giữ quyền/lịch/ghế/giao dịch.

## So sánh hai ứng viên

| Tiêu chí | **A. `@cf/qwen/qwen3-embedding-0.6b`** | **B. `@cf/baai/bge-m3`** |
|---|---|---|
| Đầu vào query/doc ở API Cloudflare | Schema có `queries`, `instruction`, `documents`; `text` là alias cho documents. Phù hợp tách truy vấn tìm phim khỏi metadata phim. | Ví dụ dùng `text`, nhưng schema hiện yêu cầu `contexts` và sync output là request_id; cần làm rõ contract đang không nhất quán. |
| Context theo provider | 8.192 tokens. Upstream 32k không tự thành giới hạn Cloudflare. | Trang provider ghi 60.000, upstream công bố 8.192; không dùng con số 60k làm cam kết cho dự án. |
| Vector upstream | Tối đa 1.024 chiều, có MRL/custom dimensions 32–1.024. API CF đã đọc không công bố tham số dimensions hoặc chiều cố định. | Dense 1.024 chiều upstream; chưa có output CF được đo để xác nhận schema triển khai. |
| Preprocessing upstream | Query có instruction theo tác vụ; document không cần instruction. Last-token pooling và L2 normalization trong ví dụ chính thức. | BGE-M3 không bắt thêm query instruction; dense mặc định CLS pooling + normalization theo implementation upstream. |
| Multilingual | Upstream công bố 100+ ngôn ngữ; cần đánh giá query phim tiếng Việt. | Upstream công bố hơn 100 ngôn ngữ; cần đánh giá cùng bộ query. |
| Độ phủ upstream | Dense embedding cho retrieval/classification/clustering, có cấu hình instruction. | Dense + sparse lexical weights + multi-vector/ColBERT; không mặc định API Cloudflare expose tất cả. |
| Giá công bố hiện tại | 1.075 neurons/M input, model page 0,0118 USD/M. | Cùng mức neurons và đơn giá; không có lợi thế giá được chứng minh giữa hai model. |
| License upstream | Apache-2.0. | MIT. |

Nguồn provider: [Qwen model](https://developers.cloudflare.com/workers-ai/models/qwen3-embedding-0.6b/),
[BGE model](https://developers.cloudflare.com/workers-ai/models/bge-m3/).
Nguồn upstream: [Qwen model card](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B),
[BGE model card](https://huggingface.co/BAAI/bge-m3),
[BGE implementation](https://raw.githubusercontent.com/FlagOpen/FlagEmbedding/master/FlagEmbedding/inference/embedder/encoder_only/m3.py).
Độ mới, benchmark tổng hợp hoặc số tham số không chứng minh model nào nhanh/chính xác hơn cho catalog này.
Không suy benchmark 8B của họ Qwen thành thành tích 0.6B đang so sánh.

## Bằng chứng contract Cloudflare và giới hạn

[Qwen input schema](https://developers.cloudflare.com/workers-ai/models/qwen3-embedding-0.6b/schema-input.json):
`queries` nhận chuỗi/mảng query, `instruction` có default cho web retrieval; `documents` nhận chuỗi/mảng,
`text` là alias documents, các mảng tối đa 32 phần tử. Schema không quy định rõ tính loại trừ các nhóm input;
cần probe từng operation riêng thay vì tự kết hợp mọi field. Không đưa mọi truy vấn vào `text` rồi cho rằng
đã dùng instruction-aware query path. Không prepend instruction lần nữa nếu endpoint đã áp nó.
[Qwen output schema](https://developers.cloudflare.com/workers-ai/models/qwen3-embedding-0.6b/schema-output.json)
công bố `data` mảng vector số và `shape` mảng số nguyên; không ấn định 1.024 chiều, chuẩn hóa hoặc model revision.
Khi tích hợp phải kiểm HTTP/envelope, số hàng khớp input, chiều cố định, số hữu hạn và norm; chưa gọi endpoint.

[BGE sync input](https://developers.cloudflare.com/workers-ai/models/bge-m3/sync-input.json) hiện khác ví dụ `text`;
[BGE sync output](https://developers.cloudflare.com/workers-ai/models/bge-m3/sync-output.json) chỉ mô tả async request_id.
Cùng model page còn mâu thuẫn context với upstream. Đây là **khoảng trống tài liệu/capability gate**,
không phải bằng chứng API chắc chắn hỏng. Không tự suy lỗi tương tự cho Qwen khi schema của Qwen rõ hơn.
Ưu điểm sparse/multi-vector của BGE upstream chưa tạo giá trị được chứng minh nếu chỉ dùng dense API/index.

## Đề xuất

**Đề xuất A — Qwen3 Embedding 0.6B trên Cloudflare Workers AI, đã được chấp thuận tại ADR-0033**;
việc chấp thuận model không thay gate kiểm chứng tích hợp. Lý do cụ thể:

- Contract Cloudflare tách query có instruction và document, phù hợp query mô tả nhu cầu/phim/ngữ cảnh
  và metadata catalog; phần input/output hiện rõ hơn BGE, giảm suy đoán khi thiết kế adapter.
- Giá theo neurons bằng BGE trong nguồn hiện hành; giữ managed/free direction, không đẩy model lên host.
- Nhu cầu hiện tại dùng dense vectors; chưa có yêu cầu phải vận hành sparse/ColBERT riêng để ưu tiên BGE.
  Instruction là thêm cấu hình cần quản lý/đánh giá, không bảo đảm tự cải thiện chất lượng phim tiếng Việt.

BGE-M3 vẫn là ứng viên đối chiếu hợp lệ nếu capability được làm rõ và kết quả thực tốt hơn trên cùng bộ test.
Không tự chọn B làm failover theo request. Cả hai có thể cùng 1.024 chiều nhưng **khác không gian vector**;
đổi model cần tạo lại catalog/profile vectors và reindex có kiểm soát, không resize/copy vector cũ.

## Preprocessing và chỉ mục cần đặc tả sau chọn model

- Metadata phim có cấu trúc/phiên bản: tên/alias, synopsis, genre và thông tin được phép; không nhúng
  giá/ghế động làm bằng chứng hiện trạng. Query instruction mô tả tác vụ tìm phim, không thêm token/secret.
- Giữ cùng model ID, provider mapping/revision nếu công bố, input template, language/preprocessing version,
  output dimension và quy tắc normalization cho toàn collection. Chuẩn hóa profile centroid cần tương thích;
  cosine/dot-product/weighted centroid không được coi mặc định có cùng calibration.
- Với Qwen, dùng đúng query/doc path và một template đã kiểm; upstream last-token/L2 không chứng minh
  CF dùng đúng cùng implementation. Không tự áp pooling tham số của model BGE khác vào Qwen/BGE-M3.
- Typesense auto-embedding hay backend tự gọi CF rồi import external vectors **chưa chốt ở vòng model**.
  Sau đó đã chọn backend điều phối API và Typesense nhận external vectors tại
  [ADR-0034](../06-decisions/0034-backend-orchestrated-external-embeddings.md).
  Cần kiểm adapter/API và nơi quản lý instruction/quota/version trước triển khai; không mặc định chỉ đổi tên model
  trong Typesense là đã có tích hợp Cloudflare. Không xuất admin API key cho browser/Mobile.
- Catalog embed bất đồng bộ chỉ cho metadata thay đổi, theo content hash/version; retry/batch/dedup,
  tombstone/unpublish, backfill/reindex phải bảo toàn quyền/visibility và last-good index.

## Chi phí/quota và hoạt động khi lỗi

[Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) ghi cả hai
1.075 neurons/M input; bảng USD làm tròn 0,012 USD/M, trang model ghi 0,0118. Một triệu input tokens
tiêu thụ khoảng 10,75% allocation 10.000 neurons/ngày nếu chưa dùng gì khác; reset 00:00 UTC.
Đây là quy đổi minh họa, không là hóa đơn khi còn quota và không phải quota embedding riêng.
Allocation dùng chung với GPT-OSS chat; [Groq Free fallback](../06-decisions/0028-groq-free-for-agent-provider-fallback.md)
chỉ thay chat, không tạo embedding tương thích cho collection đang dùng. Không tự nâng gói khi hết quota.

Tách budget indexing/query/chat, giới hạn batch/concurrency, cache query có giới hạn theo policy dữ liệu,
theo dõi usage và ưu tiên traffic tương tác; chưa chọn ngưỡng/TTL. Không embed mỗi click/impression hoặc gửi
toàn profile/hội thoại/payment/PII tới provider. Khi quota/API lỗi: dừng/defer indexing, giữ last-good index,
trả lexical/filter/catalogue và ranking từ dữ liệu có sẵn; không tạo vector giả hoặc hứa semantic luôn sẵn sàng.

## Gate kiểm chứng trước dùng cho portfolio

Probe đúng endpoint/model/input path, shape/dim/norm, empty/Unicode/tiếng Việt, batch limits/truncation,
timeout/429 và privacy/logging. Đánh giá tên phim/alias, có dấu/không dấu, typo, mô tả ý nghĩa, nhiều ngôn ngữ,
ngữ cảnh rạp/ngày và negation; hard filters vẫn là hợp đồng riêng, similarity không thay eligibility của Core.
So cùng metadata/candidate/ranker, đo Recall/NDCG@K có nhãn, latency p50/p95, neurons/query/index và tỷ lệ
lỗi/fallback; không lấy MTEB tổng hợp làm kết quả dự án. Kiểm collection/version migration và đường lexical khi lỗi.
Không hạ âm thầm quality gate để dùng được model; nếu candidate không đạt phải trình lại kết quả/đánh đổi.

Context7: `/websites/developers_cloudflare_workers-ai`. Nguồn công bố chưa thay bằng chứng API/account/runtime.
Chưa tải model, gọi API, đo chất lượng Việt/latency hoặc xác nhận chiều vector của Cloudflare.
