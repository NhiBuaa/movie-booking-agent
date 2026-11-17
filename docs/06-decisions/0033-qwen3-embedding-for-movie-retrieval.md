# ADR-0033 — Qwen3 Embedding 0.6B cho tìm kiếm phim

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý” với đề xuất A:
`@cf/qwen/qwen3-embedding-0.6b` trên Cloudflare Workers AI làm model embedding chính,
trong hội thoại Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`).
Bổ sung lựa chọn model cho [ADR-0032](0032-cloudflare-workers-ai-for-managed-embeddings.md).
Chỉ ghi quyết định; chưa gọi API, tải weights, cài dependency, tạo vector/index, bật billing hoặc sửa code.

## Context

[ADR-0030](0030-typesense-for-movie-search-and-discovery.md) chọn Typesense làm chỉ mục dẫn xuất;
[ADR-0031](0031-content-based-and-profile-scoring-for-personalization.md) chọn cá nhân hóa theo nội dung
và hồ sơ phiên/tài khoản. Cần encoder đa ngôn ngữ cho truy vấn và metadata phim, có hợp đồng đầu vào
rõ để kiểm soát instruction, quota và khả năng tái tạo vector. Model chat không thay encoder này.

## Decision

- Chọn **Qwen3 Embedding 0.6B trên Cloudflare**, model ID **`@cf/qwen/qwen3-embedding-0.6b`**.
  Lý do là contract query/instruction/document rõ hơn ứng viên BGE-M3 trong tài liệu provider đã đọc,
  cùng mức neurons công bố; chưa có phép đo chứng minh nhanh nhất hoặc tốt nhất cho phim tiếng Việt.
- Phân biệt đường `queries`/`instruction` cho truy vấn và `documents` cho metadata; `text` là alias
  documents, không tự xem là query path. Template instruction cụ thể còn phải thiết kế/đánh giá;
  không prepend instruction hai lần nếu endpoint đã áp dụng.
- Giữ query/doc cùng model, preprocessing/version, dimensions và không gian vector đã kiểm.
  Chiều output thực tế, normalization và distance/index schema **chưa được xác minh**.
  Upstream hỗ trợ tối đa 1.024 chiều không chứng minh Cloudflare cho tùy chọn dimensions;
  giới hạn provider được công bố là 8.192 tokens, không dùng upstream 32k làm giới hạn API.
- Catalog embedding xử lý bất đồng bộ khi metadata đổi theo hash/version như ADR-0032.
  Cách tích hợp được chọn tiếp tại [ADR-0034](0034-backend-orchestrated-external-embeddings.md):
  backend điều phối API, Typesense nhận external vectors. Owner được chọn tiếp tại
  [ADR-0035](0035-search-module-in-cinema-core.md): module Search trong Core và BullMQ indexing nền;
  cấu trúc adapter/worker và ngân sách từng tác vụ vẫn cần thiết kế.
- Không thêm model embedding dự phòng theo request. Groq của ADR-0028 chỉ dự phòng chat;
  cùng số chiều không làm hai encoder tương thích. Đổi encoder cần đánh giá, tạo lại vector liên quan
  và reindex/migrate profile có kiểm soát.
- Khi quota/API lỗi, giữ lexical/filter/catalogue và ranking từ dữ liệu có sẵn, defer indexing;
  không tạo vector giả, chặn giao dịch Core hoặc tự chuyển trả phí. Không gửi toàn bộ profile/chat/
  dữ liệu thanh toán sang provider từ việc chọn model này.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| **Qwen3 Embedding 0.6B trên Cloudflare** | Được chọn: dense retrieval, query instruction và schema hiện rõ hơn, không phải vận hành encoder local. Thêm phụ thuộc mạng/quota, template cần đánh giá; chất lượng và latency tiếng Việt chưa được đo. |
| BGE-M3 trên Cloudflare | Ứng viên đa ngôn ngữ hợp lệ. Schema/context provider hiện có bất nhất cần làm rõ; sparse/ColBERT upstream không chứng minh API expose chúng. Không chọn làm fallback và không kết luận API hỏng từ tài liệu. |

## Consequences

- Trước tích hợp phải kiểm endpoint/envelope, query/doc path, số vector khớp input, chiều cố định,
  giá trị hữu hạn/norm, Unicode/tiếng Việt, batch/truncation, timeout/429 và hành vi suy giảm.
- Đánh giá trên query/corpus phim có nhãn: tên/alias/không dấu/typo/ngữ nghĩa và điều kiện lọc;
  đo relevance, latency p50/p95, neurons/query/index và tỷ lệ fallback. Benchmark upstream không
  thay kết quả của dự án; không âm thầm hạ quality gate nếu model không đạt.
- Quyền bật/tắt và đặt lại cá nhân hóa được chọn tiếp tại
  [BR-18](../03-product/use-cases.md#4-quy-tắc-đã-thống-nhất); retention, xử lý tín hiệu cũ,
  profile formula, weights và công thức/ngưỡng ranking còn mở. Nguyên tắc thứ hạng đã chọn tiếp tại
  [BR-20](../03-product/use-cases.md#4-quy-tắc-đã-thống-nhất): ưu tiên truy vấn, cá nhân hóa giữa các
  kết quả phù hợp tương đương, trang khám phá có thể cá nhân hóa mạnh hơn; giữ đúng bộ lọc.
  Core vẫn quyết định visibility/lịch/giá/ghế và giao dịch; vector không là bằng chứng còn ghế/vé.

### Chi phí

Theo nguồn nghiên cứu ngày 2026-11-17: **1.075 neurons / một triệu input tokens**;
trang model ghi **0,0118 USD / một triệu input tokens**, bảng pricing làm tròn 0,012 USD.
Bắt đầu trong allocation Free **10.000 neurons/ngày dùng chung với chat**, reset 00:00 UTC;
không phải quota embedding riêng. Trong quota không thu phí inference; vượt Free thì lỗi,
không tự nâng gói. Backend/network, Typesense và tracing có tài nguyên/chi phí riêng chưa được định lượng.

## References

- [Nghiên cứu Qwen3 và BGE-M3, contract và gate kiểm chứng](../99-notes/cloudflare-multilingual-embedding-models-research.md).
- [So sánh cách tích hợp embedding và quyết định tiếp theo](../99-notes/movie-embedding-integration-research.md).
- [Cloudflare Qwen3 model](https://developers.cloudflare.com/workers-ai/models/qwen3-embedding-0.6b/).
- [Input schema](https://developers.cloudflare.com/workers-ai/models/qwen3-embedding-0.6b/schema-input.json).
- [Output schema](https://developers.cloudflare.com/workers-ai/models/qwen3-embedding-0.6b/schema-output.json).
- [Qwen upstream model card](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B).
- [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).

Nguồn/Context7 đã đối chiếu trong nghiên cứu ngày 2026-11-17; chưa có bằng chứng API/account/runtime.
