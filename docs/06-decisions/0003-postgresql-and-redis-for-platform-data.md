# ADR-0003 — PostgreSQL và Redis cho dữ liệu nền tảng

## Status

Accepted — chủ sản phẩm chấp thuận ngày 2026-11-16.

Nguồn: hội thoại **Tech Stack** (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`), người dùng
trả lời “tôi đồng ý” cho đề xuất: “PostgreSQL làm kho nghiệp vụ chính, Redis dùng từ đầu,
chưa thêm database thứ ba”. Trước đó người dùng đã yêu cầu dùng Redis ngay từ bản đầu.
Đây là quyết định công nghệ, không phải bằng chứng tích hợp, kiểm thử hoặc triển khai vận hành.

Ngày 2026-11-17, [ADR-0030](0030-typesense-for-movie-search-and-discovery.md) **thay thế một phần**
quyết định chưa thêm chỉ mục tìm kiếm độc lập: chọn Typesense dẫn xuất cho search.
Phê duyệt ban đầu được giữ nguyên ở trên; PostgreSQL/Core vẫn có thẩm quyền nghiệp vụ.

## Context

[Mô hình sản phẩm](../03-product/use-cases.md) chốt một đơn vị/chuỗi rạp và các nghiệp vụ có
tranh chấp dữ liệu: giữ nhiều ghế nguyên tử, thanh toán/hoàn tiền, soát từng ghế, đổi điểm và lịch phòng.
Cinema Core giữ thẩm quyền về giao dịch theo [ADR-0001](0001-monorepo-platform-and-microservices-boundaries.md).

Mục tiêu là portfolio chạy được, thể hiện quyết định kỹ thuật và thiết kế có bằng chứng.
[Tiêu chí lựa chọn](../../PROJECT-OVERVIEW.md#technology-selection-criteria) không dùng chi phí tiền tệ
để loại hoặc hạ ưu tiên phương án; các khoản có phí phải được công khai.

PostgreSQL phù hợp dữ liệu quan hệ và ràng buộc giao dịch; có JSONB cho phần dữ liệu linh hoạt,
và range/exclusion constraint là một khả năng để bảo vệ lịch phòng không giao nhau.
MySQL/InnoDB cũng là phương án giao dịch hợp lệ; PostgreSQL được đề xuất theo độ khớp nghiệp vụ,
không từ một kết luận rằng MySQL yếu giao dịch hoặc chậm hơn. Chưa chọn schema/index/extension cụ thể.

## Decision

1. **PostgreSQL là kho dữ liệu nghiệp vụ bền vững chính** của nền tảng: dữ liệu tài khoản/hồ sơ,
   danh mục, lịch chiếu, đơn/giao dịch, quyền vé theo ghế, combo, hội viên và hội thoại theo trách nhiệm
   của từng phân hệ. JSONB có thể bổ trợ bảng quan hệ khi phù hợp; không chốt lưu mọi dữ liệu dưới dạng JSON.
2. **Redis có mặt từ bản đầu.** Vai trò được quyết định tiếp tại
   [ADR-0004](0004-redis-roles-and-seat-hold-coordination.md); thuật toán và cấu hình lưu bền/khôi phục cần thiết kế riêng.
3. **Ban đầu chưa thêm database thứ ba hoặc chỉ mục tìm kiếm độc lập.** Quyết định bổ sung tại
   ADR-0030 chọn Typesense làm chỉ mục tìm kiếm dẫn xuất; không thêm công nghệ database nghiệp vụ khác,
   MongoDB, OpenSearch hoặc vector DB riêng. Embedding được chọn tiếp tại ADR-0032/0033,
   tích hợp/owner tại ADR-0034/0035; công thức và bằng chứng chất lượng vẫn cần đặc tả/kiểm chứng.

[ADR-0007](0007-transactional-outbox-debezium-kafka.md) bổ sung Kafka làm hạ tầng lưu/phân phối
sự kiện, không thay quyết định về database nghiệp vụ chính hoặc thêm document/search database.
Kafka vẫn là thành phần lưu bền riêng cần vận hành, retention và phục hồi.

Việc chọn Redis không tự quyết định rằng TTL/lock Redis là nguồn xác nhận ghế hoặc thanh toán.
Client và AI vẫn gọi Core theo ranh giới đã chốt. Cache hoặc chỉ mục dẫn xuất không được thay thế
trạng thái giao dịch có thẩm quyền. Thiết kế phải bảo vệ đơn/vé đã xác nhận khi Redis gặp sự cố.

Cùng công nghệ PostgreSQL không đồng nghĩa các dịch vụ được tự do ghi vào bảng của nhau.
Ranh giới sở hữu, database/schema vật lý, quyền truy cập, ORM, migration, phiên bản và nhà cung cấp
triển khai chưa được quyết định ở lần duyệt ADR này. Sau đó [thiết kế bảy service](../05-specs/004-service-decomposition/spec.md)
chọn mỗi service một PostgreSQL database logic và credential/migration riêng; không JOIN/FK/SQL chéo,
kể cả dùng chung cụm. Số cụm/backup/restore vật lý vẫn cần thiết kế. ORM Core được chọn tiếp tại
[ADR-0005](0005-drizzle-orm-and-kit-for-cinema-core.md), checkpoint Agent tại
[ADR-0013](0013-modular-agent-postgres-checkpoints-and-httpx.md); chi tiết sở hữu/schema/driver còn mở.
Các chính sách `OPEN-*` của mô hình sản phẩm giữ nguyên.

## Alternatives Considered

| Cấu hình | Lợi ích có thể có | Đánh đổi và kết quả |
|---|---|---|
| **PostgreSQL + Redis** | Dữ liệu giao dịch và dữ liệu linh hoạt có thể ở PostgreSQL; Redis phục vụ vai trò riêng khi được chốt. | Được chọn. Cần xác định rõ dữ liệu, lỗi, hết hạn, chống lặp và phục hồi của từng kho. |
| **Thêm MongoDB cho document/chat** | Có thể phù hợp nhóm document với cách truy cập/vòng đời riêng. | Chưa có yêu cầu hoặc prototype chứng minh lợi ích so với nền đã chọn; có chat/JSON chưa đủ căn cứ. Thêm nơi quản lý quyền, lưu trữ/xóa và backup/restore. |
| **Thêm OpenSearch hoặc vector database riêng** | Có thể đáp ứng tìm kiếm chuyên biệt hoặc truy xuất theo vector. | Chưa có bộ truy vấn/đánh giá chứng minh nhu cầu. Thêm đồng bộ, độ trễ, chống lặp và khả năng xây lại chỉ mục; không có thẩm quyền về giá/ghế/đơn/vé. |

PostgreSQL có full-text search; pgvector có thể bổ sung tìm kiếm vector dưới dạng extension trong
PostgreSQL. Đây là khả năng để khảo sát, không phải thành phần được chọn hoặc bằng chứng rằng
tìm kiếm tiếng Việt, lỗi chính tả, chất lượng truy xuất hay hiệu năng đã đạt. AI gọi công cụ không tự
tạo yêu cầu dùng RAG/vector database. Nhà cung cấp PostgreSQL phải hỗ trợ extension nếu sau này chọn dùng.

## Consequences

### Positive

- Có kho nghiệp vụ chính rõ ràng để thiết kế transaction, constraint và kiểm chứng cạnh tranh.
- Dùng dữ liệu quan hệ và phần dữ liệu linh hoạt cùng nhau khi phù hợp, giữ quyết định về document/search chuyên dụng dựa trên nhu cầu.
- Có nền để trình bày ranh giới PostgreSQL–Redis, cơ chế nhất quán và khôi phục bằng các tình huống nghiệp vụ thực.

### Negative / Trade-offs

- Redis là một thành phần cần quản lý tài nguyên, quyền, theo dõi lỗi và chính sách phục hồi.
  Persistence/eviction phải phù hợp vai trò đã chọn tại ADR-0004; cấu hình triển khai chưa chốt.
- Các khả năng chuyên biệt của PostgreSQL có thể làm thiết kế gắn với PostgreSQL hơn; cần quản lý migration và hỗ trợ của host.
- Phải đo truy vấn/tải và kiểm chứng transaction bằng database thật. Chưa có kết luận năng lực tải,
  chất lượng tìm kiếm hoặc hành vi khi lỗi từ quyết định tài liệu này.
- Chỉ mục Typesense bổ sung tại ADR-0030 cần đồng bộ, rebuild và giám sát riêng; lựa chọn theo nhu cầu
  tìm kiếm nâng cấp, không là bằng chứng PostgreSQL đã không đạt tải hoặc mọi search engine khác kém hơn.

### Cost Disclosure

PostgreSQL không thu phí bản quyền sử dụng theo giấy phép của dự án. Phiên bản/edition Redis và
giấy phép/dịch vụ tương ứng cần kiểm tra khi chọn triển khai. Compute/RAM, storage, replica, backup,
lưu lượng và dịch vụ quản lý/hỗ trợ có thể tính phí tùy nhà cung cấp/cấu hình. Chưa chọn nhà cung cấp
nên chưa có báo giá; không xem việc chọn công nghệ là chi phí vận hành bằng 0 hoặc quyền mua dịch vụ.

## References

- [Phạm vi, BR và OPEN](../03-product/use-cases.md).
- [Ranh giới hệ thống](../02-architecture/system-boundaries.md).
- [PostgreSQL constraints](https://www.postgresql.org/docs/18/ddl-constraints.html).
- [PostgreSQL locking](https://www.postgresql.org/docs/18/explicit-locking.html).
- [PostgreSQL range/exclusion constraints](https://www.postgresql.org/docs/18/rangetypes.html).
- [PostgreSQL JSONB](https://www.postgresql.org/docs/18/datatype-json.html).
- [PostgreSQL full-text search](https://www.postgresql.org/docs/18/textsearch.html).
- [PostgreSQL license](https://www.postgresql.org/about/licence/).
- [MySQL/InnoDB locking reads](https://dev.mysql.com/doc/refman/9.7/en/innodb-locking-reads.html).
- [MongoDB data modeling](https://www.mongodb.com/docs/manual/data-modeling/best-practices/).
- [OpenSearch refresh](https://docs.opensearch.org/latest/api-reference/index-apis/refresh/).
- [pgvector](https://github.com/pgvector/pgvector).

Nguồn thư viện được đối chiếu bằng Context7 và tài liệu chính thức ngày 2026-11-16.
