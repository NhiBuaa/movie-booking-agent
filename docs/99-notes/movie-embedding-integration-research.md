# Tích hợp Qwen3 embedding với Typesense

**Phương án A đã được chấp thuận tại [ADR-0034](../06-decisions/0034-backend-orchestrated-external-embeddings.md),
ngày 2026-11-17.** Nghiên cứu nguồn chính thức và Context7; so sánh/đề xuất dưới đây giữ bối cảnh trước quyết định.
ADR sở hữu lựa chọn hiện hành. Không sửa code/config,
cài dependency, gọi inference, tạo tài nguyên, bật billing hoặc commit.
Đích: worktree `docs-tech-stack-decisions/movie-booking-agent`, detached HEAD
`8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.

## Ranh giới đã chọn

[ADR-0030](../06-decisions/0030-typesense-for-movie-search-and-discovery.md) chọn Typesense dẫn xuất;
[ADR-0032](../06-decisions/0032-cloudflare-workers-ai-for-managed-embeddings.md) chọn API managed Cloudflare;
[ADR-0033](../06-decisions/0033-qwen3-embedding-for-movie-retrieval.md) chọn
`@cf/qwen/qwen3-embedding-0.6b`. Vòng này chỉ so sánh nơi điều phối tạo vector,
không đổi model/provider, thêm encoder local hoặc một dịch vụ riêng.
Core/PostgreSQL vẫn giữ thẩm quyền nghiệp vụ. Owner sau đó được chọn tại
[ADR-0035](../06-decisions/0035-search-module-in-cinema-core.md): module Search trong Core,
BullMQ indexing nền; cách tách tiến trình worker và adapter chi tiết còn cần đặc tả.

## Bằng chứng tích hợp

- Typesense nhận vector ngoài trong trường `float[]` có `num_dim`; cũng có auto-embedding
  từ `embed.from`, tạo query vector khi tìm. Auto-embedding chỉ tạo lại khi trường nguồn đổi.
  Remote API có timeout/retry và batch điều chỉnh được, nên không mặc định là hoàn toàn không kiểm soát.
  [Tài liệu vector search](https://typesense.org/docs/30.2/api/vector-search.html).
- Đường OpenAI-compatible yêu cầu `model_name` bắt đầu bằng `openai`, URL tùy chỉnh,
  request `model`/`input` và response `data[].embedding`. Các khả năng này tạo một hướng tích hợp
  khả thi để kiểm, không phải xác nhận Cloudflare/Qwen hoạt động ngay khi đổi URL.
  [Hợp đồng OpenAI-compatible của Typesense](https://typesense.org/docs/30.2/api/vector-search.html#using-openai-compatible-apis).
- Cloudflare công bố `/ai/v1/embeddings` theo OpenAI API. Tài liệu chung minh họa BGE;
  riêng trang Qwen cũng dẫn endpoint tương thích. Chưa có probe chứng minh mapping Qwen input/query
  theo yêu cầu của dự án. [Cloudflare compatibility](https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/),
  [Qwen model](https://developers.cloudflare.com/workers-ai/models/qwen3-embedding-0.6b/).
- Native Qwen schema tách `queries`, `instruction`, `documents`; `text` là alias documents,
  các mảng tối đa 32. Output native là `data` các vector và `shape`, khác response OpenAI;
  không trỏ Typesense OpenAI adapter thẳng vào native endpoint rồi giả định cùng contract.
  [Input schema](https://developers.cloudflare.com/workers-ai/models/qwen3-embedding-0.6b/schema-input.json),
  [output schema](https://developers.cloudflare.com/workers-ai/models/qwen3-embedding-0.6b/schema-output.json).
- Mã Typesense v31 `OpenAIEmbedder` gửi `input`/`model`, thêm `dimensions` trong trường hợp tương ứng;
  query và document đều qua hợp đồng này, chưa thấy field native `queries`/`instruction` ở hai request builder.
  Hàm kiểm model còn gửi một request validation thật; tạo schema remote không nên được coi là thao tác offline.
  [Mã nguồn adapter](https://github.com/typesense/typesense/blob/v31/src/text_embedder_remote.cpp#L91).
- Typesense có `query_prefix`/`indexing_prefix`: nối chuỗi vào text là khả năng khác với chọn field
  native query/document. Mã đọc prefix từ cấu hình không chứng minh toàn bộ đường truyền Qwen tương đương;
  cần kiểm prefix thực sự được áp ở version triển khai, cách Cloudflare ánh xạ `input`, instruction template,
  và tránh áp instruction hai lần. Không kết luận auto-embedding bất khả thi chỉ vì chưa xác minh.
  [Prefix config](https://github.com/typesense/typesense/blob/v31/src/embedder_manager.cpp#L252),
  [prefix trong tài liệu](https://typesense.org/docs/30.2/api/vector-search.html#indexing-prefix-and-query-prefix).

Phiên bản tài liệu 30.2 và nguồn v31 là nguồn đối chiếu, chưa là version pin hoặc kết quả runtime dự án.

## Hai phương án

| | A — Backend tạo external vectors | B — Typesense auto-embedding qua API remote |
|---|---|---|
| Điều phối | Backend chọn native query/doc, quản lý template, budget và xử lý lỗi; Typesense giữ retrieval. | Typesense tạo vector theo cấu hình collection và request; bớt phần orchestration ứng dụng. |
| Quota và deadline | Tách indexing nền với truy vấn tương tác, chủ động bỏ nhánh semantic khi quá deadline/quota. | Có timeout/retry/batch; vẫn phải thiết kế quota chung và fallback ở ứng dụng, kiểm khả năng adapter. |
| Vận hành | Thêm trách nhiệm dedup/cache/version/retry; lỗi triển khai có thể làm vector và metadata lệch phiên bản. | Ít mã gọi embedding hơn; cấu hình model gắn lifecycle index, compatibility gate Qwen còn mở. |
| Trải nghiệm lỗi | Có thể tiếp tục cập nhật lexical và phục vụ lexical/filter khi embedding lỗi. | Cần kiểm lỗi remote ảnh hưởng indexing/search thế nào và chủ động gọi lexical fallback. |

Đây là đánh giá thiết kế từ các contract trên, không là benchmark latency hoặc độ ổn định.

## Đề xuất A và điều kiện thiết kế tiếp

**Đề xuất A — backend tạo external vectors**, giữ nguyên Cloudflare/Qwen3.
Lý do chính là cần kiểm soát query instruction, quota Free dùng chung và tách lỗi semantic khỏi đường
tìm kiếm cơ bản; không phải khẳng định B không thể làm hoặc A nhanh hơn. Không cần cài SDK hoặc dựng
embedding microservice chỉ từ lựa chọn này.

- Với catalog, đề xuất job nền từ dữ liệu đã commit, dedup bằng content hash + embedding version;
  cập nhật lexical không chờ model. Chỉ công bố vector khớp metadata/version hiện hành; không để job cũ
  ghi đè vector mới hoặc phục hồi phim đã unpublish. Retry có giới hạn, backfill/reconcile riêng.
- Với query, đề xuất deadline hữu hạn và cache có giới hạn theo model/template/preprocessing version;
  cách ly dữ liệu riêng theo identity/scope và chính sách dữ liệu sẽ chốt. Không gọi model mỗi click,
  không log truy vấn nhạy cảm tùy tiện. Khi lỗi/quota cạn, trả lexical/filter và dữ liệu hợp lệ có sẵn.
- Kiểm dimension, finite values, norm/distance và count trước import/search; không mặc định Cloudflare
  output cố định 1.024 hoặc chấp nhận `dimensions`. Mọi query/index phải cùng embedding space đã kiểm.
  Đổi model/template ảnh hưởng space cần đánh giá/re-embed/reindex liên quan. Có thể dùng collection mới
  và alias để chuyển sau kiểm; alias tự nó không phối hợp query-version hoặc profile migration.
  [Typesense aliases](https://typesense.org/docs/30.2/api/collection-alias.html).
- Cả A/B dùng cùng quota Cloudflare: Free 10.000 neurons/ngày cho tổng usage, reset 00:00 UTC;
  vượt thì lỗi, muốn dùng hơn cần gói Paid. Không có quota embedding riêng hay quyền tự nâng gói.
  [Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/). Budget indexing/query/chat,
  giới hạn concurrency/cache TTL và SLO chưa được chọn; chi phí backend/Typesense/tracing chưa định lượng.

## Gate kiểm chứng

Chưa gọi API hoặc chạy Typesense. Cần probe input/output native Qwen, query instruction, dimensions/norm,
batch/Unicode/truncation, timeout/429, retry; đo relevance Việt/Anh và latency đầu cuối. Với B phải kiểm thêm
namespace/model ID/URL/path, schema validation, OpenAI mapping, prefix và lỗi indexing/search.
Đánh giá replay/version race, unpublish, query cache isolation, lexical fallback và migration trước acceptance.
Hosting/topology vẫn hoãn; note này không tự chọn owner module, ngưỡng chất lượng hoặc triển khai thu thập dữ liệu.

Context7 đã dùng: `/typesense/typesense`, `/websites/typesense`,
`/websites/developers_cloudflare_workers-ai`; quyết định hiện hành thuộc ADR-0034, chưa là bằng chứng runtime.
