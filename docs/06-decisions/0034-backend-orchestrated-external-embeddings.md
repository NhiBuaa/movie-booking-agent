# ADR-0034 — Backend điều phối embedding, Typesense nhận vector ngoài

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý với đề xuất của bạn” với
phương án A: backend gọi Cloudflare/Qwen3 tạo vector, Typesense nhận vector ngoài để truy xuất,
trong hội thoại Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`).
Chỉ chọn cách tích hợp; chưa cài dependency, sửa code/config, gọi inference, tạo collection,
bật billing hoặc triển khai. Không tự chọn một microservice embedding riêng.

Owner được chọn tiếp tại [ADR-0035](0035-search-module-in-cinema-core.md): module Search thuộc Core,
BullMQ xử lý indexing nền; cách tách tiến trình worker và cấu trúc adapter cụ thể còn cần đặc tả.

## Context

[ADR-0030](0030-typesense-for-movie-search-and-discovery.md) chọn chỉ mục Typesense dẫn xuất;
[ADR-0032](0032-cloudflare-workers-ai-for-managed-embeddings.md) và
[ADR-0033](0033-qwen3-embedding-for-movie-retrieval.md) chọn Cloudflare Workers AI Free với
`@cf/qwen/qwen3-embedding-0.6b`. Cần điều phối query/document instruction, quota dùng chung với chat
và phục hồi tìm kiếm cơ bản khi embedding lỗi. Việc chọn encoder chưa quyết định thành phần gọi API.

## Decision

- **Backend điều phối API embedding; Typesense lưu và tìm trên external vectors.** Không dùng
  Typesense auto-embedding ở bản đầu. ADR-0035 phân công module Search trong Core và BullMQ indexing;
  không tự chốt topology/tiến trình worker.
- Với phim, tạo vector metadata bằng đường xử lý nền cho nội dung đã commit/thay đổi;
  với truy vấn, backend tạo query vector rồi gửi vào Typesense. Lớp ứng dụng vẫn giữ ranking,
  Core/PostgreSQL kiểm visibility/điều kiện nghiệp vụ; chỉ mục không xác nhận giá/ghế/vé.
- Dùng đúng đường query/instruction/document của Qwen3, quản lý template/preprocessing/version;
  kiểm shape/dimensions/norm trước khi sử dụng. Không tự coi tên model là bằng chứng tương thích runtime.
- Backend chủ động quản lý deadline, budget/cache và retry có giới hạn; phân biệt indexing nền với
  traffic tương tác và quota chat. Khi embedding gián đoạn/quota cạn, giữ lexical/filter/catalogue,
  hoãn tạo vector; không làm cập nhật lexical phụ thuộc bắt buộc vào phản hồi model.
- Bảo vệ tính khớp giữa metadata và vector theo hash/version; job cũ không ghi đè nội dung mới hoặc
  phục hồi phim đã unpublish. Thay model/template ảnh hưởng không gian vector cần đánh giá và
  re-embed/reindex liên quan. Contract chi tiết, cache invalidation, backfill và cơ chế chuyển version cần đặc tả.
- Giữ credential phía server và phạm vi dữ liệu đã được phép; không gửi toàn profile/chat/payment
  ra model từ quyết định này. Không tự thêm provider, encoder local hoặc nâng gói trả phí.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| **Backend tạo external vectors** | Được chọn: chủ động query/document instruction, quota/cache và tách lỗi embedding khỏi tìm kiếm cơ bản. Thêm mã điều phối và trách nhiệm giữ metadata/vector đúng version; chưa chứng minh nhanh hơn bằng phép đo. |
| Typesense auto-embedding qua remote API | Ít mã gọi embedding hơn, có timeout/retry/batch và khả năng cấu hình prefix. Typesense có đường OpenAI-compatible, nhưng mapping Qwen3/Cloudflare và hành vi lỗi còn cần kiểm; không kết luận phương án này bất khả thi. |

## Consequences

- Owner theo ADR-0035; đặc tả tiếp cấu trúc module/worker, HTTP adapter, contract, budget/deadline/cache TTL, concurrency,
  versioning và quality gates. Quyết định này không buộc tạo thêm microservice hoặc chọn topology hosting.
- Cần kiểm native query/doc contract, vector count/dimension/finite values/norm, Unicode/batch limits,
  timeout/429, stale jobs/unpublish, cache isolation, lexical fallback và migration. Đánh giá relevance
  Việt/Anh cùng latency đầu cuối và tài nguyên/quota; chưa gọi API hoặc chạy Typesense để kiểm chứng.
- Giữ nguyên nguyên tắc ranking tại BR-20 của mô hình sản phẩm; tách nơi tạo vector không tự chọn
  công thức xếp hạng, retention hoặc quyền thu thập thêm hành vi.

### Chi phí

Cả hai phương án dùng quota Cloudflare đã chọn tại ADR-0032/0033; không có quota embedding riêng
hoặc quyền tự nâng gói. Backend điều phối tốn thêm compute/storage/cache/job và công vận hành;
Typesense vẫn cần tài nguyên chỉ mục. Chưa có phép đo/cấu hình hosting để định lượng tổng phí.

## References

- [Nghiên cứu cách tích hợp và bằng chứng contract](../99-notes/movie-embedding-integration-research.md).
- [Typesense external vectors và auto-embedding](https://typesense.org/docs/30.2/api/vector-search.html).
- [Cloudflare Qwen3 input schema](https://developers.cloudflare.com/workers-ai/models/qwen3-embedding-0.6b/schema-input.json).
- [Cloudflare OpenAI compatibility](https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/).

Nguồn/Context7 đối chiếu trong nghiên cứu ngày 2026-11-17; Accepted không xác nhận tích hợp hoặc hiệu năng đã đạt.
