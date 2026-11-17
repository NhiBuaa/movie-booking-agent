# ADR-0035 — Module Search trong Cinema Core

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý với đề xuất của bạn” sau
phương án A: module Search thuộc Cinema Core, BullMQ xử lý indexing nền; Agent gọi API tìm kiếm
của Core như các client khác, trong hội thoại Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`).
Chỉ chọn ranh giới trách nhiệm; chưa scaffold module, cài dependency, sửa code/config,
gọi API/inference, chạy worker hoặc triển khai. Cách tách tiến trình worker/hosting vẫn chưa chọn.

## Context

[ADR-0030](0030-typesense-for-movie-search-and-discovery.md) chọn Typesense dẫn xuất và
[ADR-0034](0034-backend-orchestrated-external-embeddings.md) chọn backend điều phối Cloudflare/Qwen3
tạo external vectors. Cần xác định backend sở hữu API và đường indexing, đồng thời giữ
Core/PostgreSQL làm thẩm quyền danh mục, visibility, lịch/giá/ghế và giao dịch.
Tìm kiếm công khai phải hoạt động độc lập với hội thoại Agent; chưa có yêu cầu tải/SLO được đo
chứng minh cần thêm Search Service độc lập ở bản đầu.

## Decision

- Đặt **module Search trong `services/cinema-core`**, dùng nền NestJS/Fastify đã chọn tại ADR-0002.
  Module cung cấp API tìm/khám phá và điều phối query embedding, Typesense retrieval, kiểm điều kiện
  từ Core, cùng ranking theo phương pháp/nguyên tắc đã chốt. Không tạo Search Service riêng ở bản đầu.
- Web/Mobile/BFF và Agent dùng hợp đồng API Core phù hợp; Agent diễn giải ý định và gọi công cụ,
  không trở thành backend bắt buộc của mọi lượt tìm kiếm hoặc tự truy cập chỉ mục thay Core.
  Auth, endpoints và DTO cụ thể vẫn cần đặc tả trong `packages/contracts` theo ADR-0014.
- Dùng **BullMQ cho indexing nền**, tái dùng ADR-0006; dữ liệu thay đổi từ outbox/CDC/Kafka
  theo ADR-0007/0030. Consumer bàn giao job cần chống lặp/version, xử lý lỗi và reconcile;
  chưa chọn chi tiết job ID, partition/concurrency, retry/backfill hoặc giao thức bàn giao.
- Giữ ranh giới module/API rõ để có thể tách dịch vụ sau nếu có nhu cầu và bằng chứng tải/SLO.
  Thiết kế tiếp phải giới hạn tài nguyên search/indexing để bảo vệ giao dịch; đặt cùng codebase
  không chứng minh đã cách ly CPU, kết nối, queue hoặc lỗi runtime.
- Giữ phương pháp cá nhân hóa ADR-0031, provider/model ADR-0032/0033 và cách tích hợp ADR-0034.
  Không tự thêm DB, model provider, quyền thu thập dữ liệu hoặc cho chỉ mục quyết định ghế/vé.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| **Module Search trong Cinema Core + BullMQ indexing** | Được chọn: gần danh mục và quy tắc visibility, tái dùng API/contracts/job foundation; tìm kiếm không phụ thuộc Agent. Cần quản lý ranh giới module và cạnh tranh tài nguyên với giao dịch. |
| Search Service độc lập | Cho phép cách ly và mở rộng search riêng. Thêm hợp đồng liên dịch vụ, đồng bộ quyền/dữ liệu và lifecycle vận hành. Chưa có mục tiêu vận hành search độc lập hoặc bằng chứng tải đủ để chọn ở bản đầu; không kết luận luôn chậm/tốn phí hơn. |

## Consequences

- Chưa triển khai API, consumer/job hoặc profile/ranker. Cần đặc tả schema, quyền sở hữu profile/tín hiệu,
  data policy, contracts, pool/queue limits, quota/cache/deadline và chính sách phục hồi.
- Kiểm correctness bộ lọc/visibility, nguyên tắc query-first, event trùng/đảo thứ tự, job cũ/unpublish,
  indexing lag, lexical fallback, cache identity isolation và tác động tải search lên giao dịch.
  Chưa đo relevance/latency/tài nguyên hoặc xác nhận tích hợp runtime.
- Không chốt worker chạy cùng hay khác tiến trình/container, số replica, hosting hoặc CD.
  Những lựa chọn triển khai đã hoãn vẫn giữ nguyên.

### Chi phí

Không chọn thêm dịch vụ managed hoặc Search Service riêng từ quyết định này. Module/job vẫn dùng
tài nguyên Core, PostgreSQL, Redis/BullMQ, Kafka, Typesense và quota Cloudflare đã chọn;
chưa định lượng compute/storage/network hoặc tổng phí hosting. Không tự nâng gói hoặc mua tài nguyên.

## References

- [Ranh giới nền tảng](0001-monorepo-platform-and-microservices-boundaries.md).
- [BullMQ cho tác vụ nền](0006-bullmq-for-core-background-jobs.md).
- [Outbox/CDC/Kafka](0007-transactional-outbox-debezium-kafka.md).
- [Các đánh đổi retrieval](../99-notes/movie-search-architecture-research.md).
- [Các đánh đổi tích hợp embedding](../99-notes/movie-embedding-integration-research.md).

Quyết định kiến trúc được duyệt không là bằng chứng code, runtime hoặc hiệu năng đã đạt.
