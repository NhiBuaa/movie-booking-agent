# ADR-0032 — Cloudflare Workers AI cho API embedding

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý với đề xuất của bạn” sau đề xuất A:
dùng API embedding Cloudflare, rồi chốt model cụ thể sau khi đối chiếu khả năng, trong hội thoại
Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`).
Phê duyệt ban đầu chỉ chọn provider/cách vận hành, để model cho vòng tiếp theo;
chưa tạo key/account, gọi inference, tải weights, cài dependency, bật billing hoặc triển khai.

Model được chọn tiếp tại [ADR-0033](0033-qwen3-embedding-for-movie-retrieval.md):
Qwen3 Embedding 0.6B trên Cloudflare.
Cách tích hợp được chọn tiếp tại [ADR-0034](0034-backend-orchestrated-external-embeddings.md):
backend điều phối API embedding và Typesense nhận vector ngoài; owner là module Search trong Core
với BullMQ indexing nền tại [ADR-0035](0035-search-module-in-cinema-core.md).

## Context

[ADR-0030](0030-typesense-for-movie-search-and-discovery.md) chọn chỉ mục lexical/vector Typesense;
[ADR-0031](0031-content-based-and-profile-scoring-for-personalization.md) chọn cá nhân hóa theo
nội dung và hồ sơ phiên/tài khoản. Embedding chuyển văn bản thành vector, khác model chat và không
tự thay ranker. Cần chọn nơi tạo vector trước khi pin encoder, dimensions/preprocessing và index schema.

## Decision

- Chọn **API embedding managed của Cloudflare Workers AI**, gọi từ backend, thay cho tự chạy
  encoder trên host portfolio ở bản đầu. Model được chốt tiếp là Qwen3 Embedding 0.6B tại ADR-0033;
  BGE-M3 là ứng viên nghiên cứu ban đầu, không là model hoặc fallback đã chọn.
- Bắt đầu trong **allocation miễn phí dùng chung** với model Agent, không tự nâng gói hoặc trả
  overage. Dự phòng Groq Free của ADR-0028 chỉ là chat; không tự tạo provider/model dự phòng embedding.
- Catalog vector là dữ liệu dẫn xuất: xử lý bất đồng bộ cho metadata đã thay đổi, có version/hash
  và giới hạn batch/rate để tránh tạo lại vô ích. Query embedding cần deadline/quota/cache phù hợp;
  external vectors đã chọn tại ADR-0034, còn TTL/budget chia giữa chat/query/indexing cần đặc tả.
- Query/doc dùng cùng model/version, preprocessing, dimensions và không gian vector được kiểm.
  Không thay encoder tùy ý khi lỗi hoặc resize vector để tìm vào index tạo bằng model khác.
  Thay model cần đánh giá và re-embed/reindex có kiểm soát theo ADR-0030.
- Giữ đường lexical/filter/catalogue khi embedding/provider hết quota hoặc lỗi; không tạo vector giả,
  không hứa semantic branch luôn sẵn sàng. Không chặn giao dịch Core hoặc đồng nhất embedding với xác nhận vé.
- Chỉ gửi dữ liệu cần cho tác vụ theo chính sách sẽ đặc tả; không tự xuất toàn bộ hồ sơ người dùng,
  lịch sử chat, thông tin thanh toán hoặc credential sang model. Data policy/log/trace cần đối chiếu riêng.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| **Cloudflare Workers AI API embedding** | Được chọn: không buộc host portfolio chạy encoder; provider hiện có, theo dõi usage chung. Thêm độ trễ mạng/phụ thuộc API và tranh quota với chat; không chứng minh chất lượng/hiệu năng tốt hơn bằng phép đo. |
| Tự chạy encoder đa ngôn ngữ | Chủ động dữ liệu/capacity, không quota API ngoài. Cần đóng gói weights, RAM/CPU/cold start và vận hành theo số đo; chưa chọn hosting hoặc bằng chứng tài nguyên/latency. Không chọn ở bản đầu. |

## Consequences

- Model đã chọn tại ADR-0033; cần kiểm chất lượng Việt, khả năng API thực, input limits, dimensions
  và normalization/distance trước tích hợp. Tài liệu BGE-M3 từng có bất nhất schema/context;
  không suy tài liệu đa ngôn ngữ hoặc endpoint tương thích OpenAI là output đã được kiểm chứng.
- Kiểm corpus/query Việt/Anh, Unicode/không dấu, alias, typo, intent, đúng filters và cold/warm users;
  đo embedding+retrieval+rerank latency, neurons/tokens, indexing lag và hành vi 429/outage.
  Chưa chạy benchmark hoặc API; chưa pin SDK/adapter hay số concurrency/token giới hạn.
- Giữ provider tách khỏi model: ADR-0033 sở hữu lựa chọn encoder; không tự thêm local fallback,
  dịch vụ managed khác hoặc nguồn dữ liệu mới. Hosting/CD vẫn hoãn, chính sách dữ liệu còn OPEN-11.

### Chi phí

Nguồn ngày 2026-11-17: Workers AI Free có **10.000 neurons/ngày**, reset 00:00 UTC, dùng chung
giữa các model. Trong quota không có phí inference; vượt Free thì lỗi, không tự chuyển trả phí.
Giá/token và neurons của Qwen3 được ghi tại ADR-0033; không coi quota này là 10.000 calls
hoặc ngân sách riêng cho embedding. Backend/network/Typesense/tracing có chi phí riêng.

## References

- [Nghiên cứu cá nhân hóa và embedding](../99-notes/movie-personalization-and-embedding-research.md).
- [So sánh model Cloudflare và quyết định tiếp theo](../99-notes/cloudflare-multilingual-embedding-models-research.md).
- [Workers AI pricing và allocation](https://developers.cloudflare.com/workers-ai/platform/pricing/).
- [Model catalog](https://developers.cloudflare.com/workers-ai/models/).
- [Workers AI data usage](https://developers.cloudflare.com/workers-ai/platform/data-usage/).

Nguồn/Context7 đối chiếu ngày 2026-11-17; chưa xác minh quota tài khoản hoặc runtime.
