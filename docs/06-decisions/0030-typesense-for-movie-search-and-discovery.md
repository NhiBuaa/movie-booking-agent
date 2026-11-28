# ADR-0030 — Typesense cho tìm kiếm và khám phá phim

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý với phương án B” sau đề xuất
Typesense + PostgreSQL làm nền tìm kiếm, trong hội thoại Tech Stack
(`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`). Thay thế một phần
[ADR-0003](0003-postgresql-and-redis-for-platform-data.md) về chưa thêm chỉ mục tìm kiếm độc lập;
giữ PostgreSQL/Core làm thẩm quyền nghiệp vụ và Redis theo các vai trò đã chọn.
Chỉ chọn kiến trúc/công nghệ; chưa cài server/client, viết consumer, tạo collection/vector hoặc chạy thử.

Embedding được chọn tiếp: provider Cloudflare tại [ADR-0032](0032-cloudflare-workers-ai-for-managed-embeddings.md)
và model Qwen3 Embedding 0.6B tại [ADR-0033](0033-qwen3-embedding-for-movie-retrieval.md).
Cách tích hợp được chọn tiếp tại [ADR-0034](0034-backend-orchestrated-external-embeddings.md):
backend điều phối API, Typesense nhận external vectors.
Owner được chọn tiếp tại [ADR-0035](0035-search-module-in-cinema-core.md): module Search trong Core
với BullMQ indexing nền; chi tiết adapter/module/worker và triển khai vẫn cần đặc tả.

## Context

Nhu cầu nâng cấp gồm tìm tên/alias, không dấu/lỗi gõ, gợi ý khi nhập, bộ lọc và tìm theo ý nghĩa;
hướng cá nhân hóa cần nguồn ứng viên phù hợp trước khi xếp hạng theo phiên/tài khoản.
D-01 trong [mô tả use case](../03-product/use-case-descriptions.md) đã bổ sung phạm vi nâng cấp;
BR-40–43 của [mô hình sản phẩm](../03-product/use-cases.md#4-quy-tắc-đã-thống-nhất) sở hữu nguồn tín hiệu,
guest theo phiên/account lâu dài, người mới không hỏi sở thích và quyền kiểm soát/ranking.
Chi tiết chính sách/thuật toán còn mở; code hiện tìm trên fixture, không chứng minh chất lượng search thực.

## Decision

- Chọn **Typesense OSS** làm **chỉ mục tìm kiếm dẫn xuất** cho lexical/vector/hybrid retrieval.
  Tận dụng typo/prefix/facets và khả năng kết hợp từ khóa/vector; schema, ngưỡng typo, weights,
  locale, dimensions, version/client cụ thể cần đặc tả/kiểm. Không chọn Typesense Cloud hoặc gói managed.
- Giữ **PostgreSQL theo service sở hữu**: Catalog làm nguồn nội dung phim/media, Core làm nguồn
  lịch chiếu/giá/ghế/giao dịch; Identity cấp bằng chứng danh tính/quyền và service sở hữu tự kiểm quyền nghiệp vụ,
  theo [thiết kế bảy service](../05-specs/004-service-decomposition/spec.md).
  Typesense không là database giao dịch thứ ba có thẩm quyền, nguồn phát hành vé hoặc bằng chứng còn ghế.
  Không thêm OpenSearch, pgvector hoặc một vector DB khác trong quyết định này.
- **Cá nhân hóa ở lớp ứng dụng**: search engine tìm ứng viên, backend kiểm dữ liệu/quyền và xếp hạng
  theo query/ngữ cảnh/profile phù hợp. Không coi có vector/search engine là đã có recommender hoàn chỉnh.
  Phương pháp ban đầu được chọn tiếp tại [ADR-0031](0031-content-based-and-profile-scoring-for-personalization.md):
  theo nội dung + hồ sơ phiên/tài khoản, chưa triển khai collaborative. Embedding theo ADR-0032/0033;
  trọng số và ngưỡng cụ thể vẫn cần đặc tả/đánh giá.
- Projection cập nhật từ thay đổi nội dung Catalog/điều kiện Core đã commit qua hợp đồng sự kiện,
  outbox → Debezium/Kafka theo
  [ADR-0007](0007-transactional-outbox-debezium-kafka.md), consumer chống lặp/version và xử lý xóa/unpublish.
  Cần backfill/reconcile/reindex và chuyển collection có kiểm soát; không buộc sửa phim chờ model/index.
  Module Search trong Core tiêu thụ dữ liệu dẫn xuất qua hợp đồng, không đọc SQL database Catalog/
  Community/Identity. HTTP snapshot phim khi lập suất vẫn là tích hợp riêng đã duyệt, không thay bằng
  sự kiện search hoặc dùng index làm snapshot có thẩm quyền.
- Query API phải kiểm eligibility/visibility và điều kiện lịch từ nguồn Core phù hợp trước trả kết quả cuối.
  Rạp/ngày/giờ/định dạng phải cùng khớp một suất; không dùng các mảng độc lập tạo kết quả giả.
  Candidate expansion, facets/count và pagination sau lọc cần thiết kế, không mặc định lọc top-k là đủ.
- Tránh phụ thuộc bắt buộc LLM ở mọi lượt khám phá. Khi embedding/LLM không dùng được,
  cần đường lexical/filter/catalogue; khi index lỗi cần hành vi suy giảm được đặc tả.
  Không bịa kết quả hoặc tự replay command Core để phục hồi tìm kiếm.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| PostgreSQL FTS + pg_trgm + unaccent + pgvector | Phương án đầy đủ/hiện đại, lợi thế join/filter gần dữ liệu gốc. Cần tự tune nhiều phần typo/prefix/facets/fusion và cách ly tải search khỏi giao dịch. Không chọn làm nền retrieval chính, chưa cài extensions. |
| **Typesense + PostgreSQL + application ranking** | Được chọn theo nhu cầu danh mục tương tác: typo/prefix/facets/hybrid có sẵn, giữ quyền tự xây personalization. Thêm RAM/index, độ trễ đồng bộ và lifecycle vận hành; chưa có phép đo khẳng định nhanh nhất. |
| OpenSearch + PostgreSQL + application ranking | Hợp lệ khi cần analyzer/BM25/query/scoring chuyên sâu. Thêm vận hành JVM/vector memory/mappings/shards và pipeline; chưa có yêu cầu chứng minh lợi thế đủ để ưu tiên. |

## Consequences

- Đây là thay đổi có chủ đích so với quyết định ban đầu chỉ PostgreSQL/Redis; chỉ mục dẫn xuất thêm
  nơi lưu/vận hành, cần bảo vệ keys, backup/rebuild và quan sát lag. Không cho mọi service đọc/ghi bảng nhau;
  owner là module Search trong Core tại ADR-0035; quyền truy cập và cấu trúc cụ thể còn cần thiết kế.
- Kiểm tiếng Việt bằng corpus/query có nhãn: có/không dấu, Đ/đ, NFC/NFD, alias, prefix, typo,
  sequel tên gần giống và intent theo nội dung. Locale vi không tự bảo đảm mọi truy vấn không dấu khớp tốt.
  Giữ tên gốc để hiển thị; chuẩn hóa/folded fields và ranking phải được kiểm, không hứa chất lượng từ marketing.
- Typesense nhận external vectors từ backend theo ADR-0034; model Cloudflare/Qwen3 theo ADR-0032/0033.
  Query/doc phải cùng model/version/preprocess/space; thay model có thể cần re-embed/reindex.
  Model chat không tự làm embedding; allocation Free dùng chung và lexical fallback theo ADR-0032/0034,
  còn budget/TTL/quality gate cụ thể cần đặc tả.
- Profile cá nhân không đưa vào public movie document; cache/subscription/results phải cách ly identity/scope.
  BR-40/19 đã chọn bật/tắt/reset và không nhập guest history khi login; retention, guest expiry,
  xử lý dữ liệu cũ khi reset/bật lại và dữ liệu gửi model còn OPEN-11. Không tự nhập toàn bộ chat.
- Mô hình sản phẩm đã phân biệt content/profile scoring với collaborative training ngoài bản đầu;
  chi tiết feature/contracts và các chính sách còn mở vẫn cần đặc tả trước triển khai.
- Đo lexical/vector/hybrid và personal ranking riêng: relevance, filter correctness, coverage/diversity,
  latency gồm embedding/hydration, CPU/RAM/disk, indexing/rebuild/lag và tác động Core.
  Kiểm event trùng/đảo thứ tự, xóa/unpublish, stale index, outage, account switch và reindex trước acceptance.

### Chi phí

Typesense server OSS dùng GPL-3.0; điều kiện phân phối/chỉnh sửa cần đối chiếu license phù hợp.
Không bắt mua Typesense Cloud. Search index dùng RAM, raw documents/storage, vector/index/rebuild
và pipeline dùng tài nguyên; embedding có quota/chi phí riêng. Chưa có topology/corpus/tải/SLO
để báo cấu hình tối thiểu hoặc hóa đơn. Hosting/CD vẫn hoãn, không cấp quyền mua tài nguyên.

## References

- [So sánh ba kiến trúc và bằng chứng cần đo](../99-notes/movie-search-architecture-research.md).
- [Nghiên cứu cá nhân hóa và lịch sử so sánh embedding](../99-notes/movie-personalization-and-embedding-research.md).
- [Typesense search](https://typesense.org/docs/30.2/api/search.html).
- [Typesense vector/hybrid search](https://typesense.org/docs/30.2/api/vector-search.html).
- [Typesense locales](https://typesense.org/docs/guide/locale.html).
- [Typesense GPL-3.0](https://github.com/typesense/typesense/blob/v31/LICENSE.txt).

Nguồn/Context7 đối chiếu ngày 2026-11-17 trong nghiên cứu; phiên bản nguồn tham khảo không là version pin dự án.
