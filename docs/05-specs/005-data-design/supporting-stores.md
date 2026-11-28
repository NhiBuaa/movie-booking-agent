---
status: draft
version: 1.1.0
---

# Cấu trúc và vòng đời các kho hỗ trợ — Movie Booking Platform

Tài liệu này đặc tả cấu trúc dữ liệu, quyền sở hữu, cơ chế đồng bộ, thời hạn lưu trữ (TTL / Retention) và phương án phục hồi cho sáu hệ thống lưu trữ bổ trợ (STORE-01 đến STORE-06) theo kiến trúc hệ thống đã được phê duyệt.

Tuyệt đối không xây dựng các sơ đồ quan hệ thực thể (ERD) giả định cho các kho lưu trữ dạng Key-Value, Document Index hay Object Storage. Mỗi kho lưu trữ bổ trợ đều phải có một service nghiệp vụ duy nhất chịu trách nhiệm sở hữu nguồn thẩm quyền (Authoritative Owner).

---

## STORE-01: Redis, BullMQ và PubSub

### 1. Owner và Nguồn có thẩm quyền
- **Owner chính:** Cinema Core (`services/cinema-core`) sở hữu phần lớn hạ tầng Redis để phục vụ điều phối giữ ghế nhanh (Fast Seat Holds), hàng đợi tác vụ nền (BullMQ background jobs) và bộ đệm (Cache).
- **Owner phụ:** Identity & Access Service sử dụng Redis cho Rate Limiting; Agent Service sử dụng Redis để phối hợp khóa phân tán hỗ trợ kiểm soát lượt chạy AI.
- **Nguồn có thẩm quyền:** **PostgreSQL của từng service** là nguồn bản ghi duy nhất có thẩm quyền (System of Record). Mọi dữ liệu lưu trong Redis chỉ mang tính chất phối hợp tạm thời hoặc bộ đệm có thể tái tạo hoàn toàn từ PostgreSQL (ADR-0004).

### 2. Cấu trúc dữ liệu và Phân vùng Namespace
Toàn bộ khóa trong Redis được đặt tiền tố (Namespace) nghiêm ngặt theo service để phân định trách nhiệm logic, không dùng tiền tố chung để hứa hẹn cách ly bộ nhớ vật lý:

| Namespace / Mẫu khóa | Cấu trúc dữ liệu | Mục đích sử dụng | Owner |
|---|---|---|---|
| `core:hold:{showtime_id}:{seat_id}` | String (JSON chứa `user_id`, `expires_at`, `hold_id`) | Khóa giữ chỗ nhanh tức thời trong bộ nhớ | Cinema Core |
| `core:user_active_hold:{user_id}` | String (`hold_id`) | Kiểm tra nhanh khách hàng đang có hold hợp lệ hay không | Cinema Core |
| `core:cache:showtime_seats:{showtime_id}` | String / Hash | Cache trạng thái toàn bộ sơ đồ ghế của suất chiếu | Cinema Core |
| `core:queue:ticket-expiry:*` | BullMQ Stream / ZSet | Hàng đợi lên lịch kiểm tra hết hạn giữ ghế và hoàn tiền | Cinema Core |
| `ident:ratelimit:{user_id}:{action}` | String (Bộ đếm counter với sliding window) | Giới hạn tần suất gọi API đăng nhập, gửi lại OTP | Identity |
| `agent:active_run:{user_id}` | String (`run_id`, `epoch`, `expires_at`) | Khóa phân tán điều phối 1 lượt AI đang chạy/tài khoản | Agent |

### 3. TTL, Vòng đời và Phân định TTL kỹ thuật vs TTL nghiệp vụ (Finding 26)
- **Phân định rõ ràng:**
  - **TTL kỹ thuật của Redis (*[Đề xuất kỹ thuật - Đang chờ phê duyệt]*):** Là thời hạn tự động dọn dẹp key (`EXPIRE` trong Redis, ví dụ: 310 giây cho hold, 5 giây cho cache suất chiếu).
  - **TTL nghiệp vụ (BR-04, BR-05):** Là mốc thời gian tuyệt đối `expires_at` (300 giây) được lưu bền vững trong PostgreSQL và trong giá trị JSON của key.
- Mọi logic kiểm tra quyền ghế của Cinema Core đều đối chiếu với mốc `expires_at` nghiệp vụ. Nếu Redis chậm dọn dẹp hoặc worker bị trễ, mốc `expires_at` nghiệp vụ trong database PostgreSQL vẫn là căn cứ quyết định cuối cùng; hết hạn Redis không tự động đồng nghĩa với hủy bỏ giao dịch nếu khách hàng đã thanh toán hợp lệ (BR-05).
- **TTL Cache suất chiếu (*[Đề xuất kỹ thuật - Đang chờ phê duyệt]*):** `core:cache:showtime_seats:*` có TTL kỹ thuật 5 giây, kết hợp cơ chế chủ động xóa cache (Cache Invalidation) mỗi khi có giao dịch hold/book/cancel commit thành công tại Core.

### 4. Mất dữ liệu, Phục hồi và Đường dự phòng PostgreSQL (Fallback)
- **Đường dự phòng giữ ghế tại PostgreSQL (ADR-0004 & Finding 1, R2-N01):**
  - Khi cụm Redis gặp sự cố, mất kết nối mạng hoặc timeout, Cinema Core tự động kích hoạt đường dự phòng (PostgreSQL Fallback Path): chuyển toàn bộ logic kiểm tra và giữ ghế sang transaction PostgreSQL.
  - Ràng buộc Partial Unique Index `uq_user_active_hold ON seat_holds (user_id) WHERE status = 'ACTIVE'` và khóa chính kết hợp trên `showtime_seat_allocations (showtime_id, seat_id)` bảo đảm tuyệt đối: mỗi tài khoản chỉ có tối đa 1 phiên giữ ghế đang hoạt động và không thể có hai khách hàng cùng giữ một ghế (R2-N01).
- **Phục hồi tác vụ BullMQ:** BullMQ trong Core lưu trạng thái job trong Redis. Nếu Redis bị restart đột ngột:
  - Khi khởi động lại, Cinema Core worker tự động chạy tiến trình Reconciliation: quét bảng `seat_holds` trong PostgreSQL lấy các hold `status = 'ACTIVE'` và nạp lại vào hàng đợi BullMQ.
  - BullMQ chỉ là lựa chọn công nghệ hàng đợi tác vụ của Cinema Core (ADR-0004, ADR-0005); không áp đặt làm job framework mặc định cho 5 service còn lại.
- **Mất key điều phối AI:** Nếu key `agent:active_run:{user_id}` bị mất do Redis restart:
  - Agent Service không tự động giải phóng quyền chạy nếu tiến trình cũ vẫn đang thực thi.
  - Khi worker mới muốn tiếp quản (resume), nó bắt buộc phải kiểm tra bảng `agent_runs` trong PostgreSQL Agent, kiểm tra `hard_deadline` và tăng `execution_epoch` để ngắt quyền worker cũ.

### 5. Dữ liệu nhạy cảm và Quyền riêng tư
- Redis không lưu trữ mật khẩu, OTP thô, thông tin thẻ ngân hàng hoặc nội dung chat nhạy cảm. Khóa Redis chỉ lưu ID tham chiếu (`user_id`, `seat_id`, `hold_id`).

---

## STORE-02: Typesense (Search Engine & External Vectors)

### 1. Owner và Nguồn có thẩm quyền
- **Owner:** Module Search đặt bên trong Cinema Core (`services/cinema-core/search` theo ADR-0035).
- **Nguồn có thẩm quyền:**
  - Thông tin phim và phiên bản: Catalog Service (`movies`, `movie_aliases`, `movie_release_snapshots`).
  - Điểm đánh giá và số lượt: Community Service (`movie_rating_summaries`).
  - Toàn bộ dữ liệu trong Typesense là **dữ liệu dẫn xuất (Derived Index)**, hoàn toàn có thể tái tạo từ Catalog và Community (ADR-0030).

### 2. Cấu trúc Document và Schema Collection (R2-N04)
Typesense lưu trữ collection `movies_search` phục vụ tìm kiếm kết hợp từ khóa ngữ nghĩa và vector nhúng:

| Tên trường | Kiểu dữ liệu | Vai trò / Thuộc tính Typesense | Nguồn dữ liệu gốc |
|---|---|---|---|
| `id` | `string` | Khóa chính document = `mov_...` | `catalog.movies.id` |
| `title` | `string` | Tìm kiếm văn bản, có hỗ trợ không dấu và sửa lỗi gõ | `catalog.movies.title` |
| `original_title` | `string` | Tìm kiếm văn bản theo tựa đề gốc | `catalog.movies.original_title` |
| `aliases` | `string[]` | Mảng các bí danh / tên phụ để tìm kiếm chính xác (BR-42) | `catalog.movie_aliases` |
| `genres` | `string[]` | Lọc nhiều giá trị (Faceted filtering) | `catalog.movie_genres` |
| `rating_code` | `string` | Lọc theo độ tuổi (`P`, `T13`, `T16`, `T18`) | `catalog.movies.rating_code` |
| `release_status` | `string` | Lọc trạng thái (`PUBLISHED`, `COMING_SOON`) | `catalog.movie_versions` |
| `target_generation`| `string` | Thế hệ collection chỉ mục (Faceted) | `movies_search_gen1`, `gen2` |
| `model_name` | `string` | Tên mô hình vector embedding (Faceted) | `text-embedding-3-small` |
| `preprocess_version`| `string` | Phiên bản tiền xử lý text (Faceted) | `prep_v1`, `prep_v2` |
| `catalog_version`| `int32` | Số hiệu phiên bản tài liệu để chống ghi đè muộn | `catalog.movies.catalog_version` |
| `content_hash` | `string` | Băm SHA-256 đối chiếu toàn vẹn | `catalog.movies.content_hash` |
| `is_published` | `bool` | Cờ lọc phim đang công bố | `catalog.movies.is_published` |
| `is_tombstone` | `bool` | Cờ đánh dấu đã gỡ bỏ phim | `catalog.movies.is_tombstone` |
| `average_rating` | `float` | Điểm sao phục vụ xếp hạng và lọc | `community.movie_rating_summaries` |
| `total_reviews` | `int32` | Số lượt đánh giá | `community.movie_rating_summaries` |
| `embedding` | `float[]` (Dim: 1024) | Vector nhúng ngữ nghĩa (Qwen3 qua Cloudflare Workers AI) | Tóm tắt phim và thể loại |
| `popularity_score` | `int32` | Điểm phổ biến (lượt xem/click) phục vụ cá nhân hóa ([TECH-PROP-07]: đề xuất kỹ thuật chưa chốt owner/lifecycle) | Tín hiệu tương tác [TECH-PROP-07] |

### 3. Cơ chế Đồng bộ, Vector Ngoài, Catch-up Rebuild và Xử lý Tombstone (R2-N04, F23)
- **External Vectors Pipeline (ADR-0032, ADR-0034):** Khi có phim mới hoặc cập nhật nội dung từ Catalog, worker nền của Core Search trích xuất văn bản (`title + synopsis + genres`), gọi Cloudflare Workers AI để sinh vector nhúng 1024 chiều và cập nhật document vào Typesense.
- **Tách biệt Hai Luồng Cập nhật và Ràng buộc Không gian Vector (R2-N04):**
  - Phiên bản danh mục `catalog_version` bao phủ toàn bộ các thay đổi trên bảng cha `movies` và các bảng liên kết tìm kiếm gồm bí danh `movie_aliases` và thể loại `movie_genres`.
  - **Luồng 1 (Cập nhật Metadata / Tombstone):** Ingestion Worker thực hiện ghi đè tài liệu Typesense với điều kiện so sánh nguyên tử: `event.catalog_version >= document.catalog_version`. Nếu phiên bản sự kiện nhỏ hơn phiên bản hiện có, yêu cầu bị từ chối.
  - **Luồng 2 (Cập nhật Bổ sung Vector Nhúng - Enrichment Update):**
    - Payload cập nhật vector từ AI Model bắt buộc mang đủ 5 thuộc tính: `catalog_version`, `content_hash`, `target_generation`, `model_name`, `preprocess_version`.
    - **Cơ chế Ghi có Điều kiện Nguyên tử (Atomic Compare-and-Write):** Lệnh patch tài liệu chỉ được chấp thuận cập nhật trường `embedding` khi và chỉ khi thỏa mãn đồng thời:
      ```sql
      document.target_generation == payload.target_generation
      AND document.model_name == payload.model_name
      AND document.preprocess_version == payload.preprocess_version
      AND document.catalog_version == payload.catalog_version
      AND document.content_hash == payload.content_hash
      AND document.is_tombstone == FALSE
      ```
    - Nếu không thỏa mãn (ví dụ: thế hệ collection đã được swap, hoặc model đã đổi, hoặc metadata đã bị sửa đổi trong lúc chờ AI model, hoặc phim đã bị gỡ bỏ): Typesense **hủy bỏ kết quả cập nhật (no-op/drop)**, ngăn chặn triệt để nguy cơ trộn lẫn vector giữa hai không gian nhúng khác nhau!
- **Quy trình Rebuild Chỉ mục Toàn diện, Cắt mốc và Tráo đổi Alias (R2-N04):**
  - Khi nâng cấp schema hoặc thay đổi mô hình AI embedding:
    1. Khởi tạo một collection Typesense mới có đánh số thế hệ (ví dụ: `movies_search_gen2`), cấu hình `target_generation = 'gen2'`, `model_name = 'new-model'`, `preprocess_version = 'prep_v2'`.
    2. Ghi nhận mốc cắt Outbox từ PostgreSQL: lưu mốc theo từng bộ phim `(movie_id, aggregate_sequence_number)` trong bảng theo dõi tiến độ đồng bộ vector `catalog_vector_sync_states` (R2-N04).
    3. Stream toàn bộ danh mục phim hiện có từ PostgreSQL sang collection mới.
    4. Worker chạy batch job sinh vector cho toàn bộ collection mới với đúng bộ tham số `('gen2', 'new-model', 'prep_v2')`.
    5. Trong suốt thời gian này, các sự kiện Outbox mới phát sinh được đưa vào hàng đợi catch-up của `gen2`.
    6. **Kiểm tra Độ phủ (Coverage Gate):** Trước khi tráo đổi Alias, Worker đối soát bảo đảm mọi `catalog_version` mới nhất từ PostgreSQL đến `cut_off_watermark` và các event catch-up đều đã được xử lý 100%, không còn bản ghi thiếu sót.
    7. **Atomic Alias Swap:** Thực hiện tráo đổi alias nguyên tử: trỏ alias chính thức `typesense_movies_active` sang collection `movies_search_gen2` với thời gian downtime bằng 0.
    8. Bất kỳ kết quả vector nào của thế hệ cũ `gen1` hoàn tất sau đó gửi đến alias `typesense_movies_active` đều bị từ chối ngay lập tức do lệch `target_generation`.
- **Độc lập Lexical Search khi Hoãn Vector (R2-N04):**
  - Khi dịch vụ sinh vector (Cloudflare Workers AI / Embedding Provider) gặp sự cố mạng, cạn quota hoặc bị nghẽn độ trễ, pipeline tìm kiếm tự động chuyển sang chế độ **Lexical Fallback**: sử dụng tìm kiếm từ khóa thuần túy (BM25 trên `title`, `aliases`, `synopsis`) mà không làm gián đoạn tính năng tìm kiếm của khách hàng và chatbot.
- **Xử lý Tombstone khi Gỡ Phim:**
  - Khi Quản trị viên unpublish hoặc gỡ bỏ phim trong Catalog, sự kiện tombstone được đẩy sang Typesense (`is_tombstone = true`, `is_published = false`, `catalog_version = current + 1`).
  - Mọi job vector embedding chậm trễ gửi đến đều bị loại bỏ ngay tại điều kiện `document.is_tombstone == FALSE`, ngăn chặn triệt để việc hồi sinh một bộ phim đã gỡ bỏ.

### 4. Tái dựng chỉ mục (Index Rebuild & Generation Swap)
- Khi cập nhật phiên bản model embedding mới hoặc khi chỉ mục Typesense bị lỗi: Core Search tạo collection mới có đánh số thế hệ (`movies_search_gen2`), nạp lại dữ liệu, tráo đổi alias collection trong Typesense trong thời gian thực và xóa collection cũ sau 24 giờ (`[TECH-PROP-STORE-01]`: đề xuất thời hạn lưu vết tạm 24h chờ đối soát trước khi giải phóng bộ nhớ).

---

## STORE-03: Kafka KRaft và Debezium CDC

### 1. Owner và Nguồn có thẩm quyền
- **Hạ tầng:** Cụm Kafka KRaft độc lập (không dùng ZooKeeper) làm trục truyền thông sự kiện bất đồng bộ chính (ADR-0003, ADR-0007).
- **Owner nguồn phát sự kiện:** Cinema Core (`services/cinema-core`) là bên phát chính các sự kiện giao dịch qua Transactional Outbox.
- **Consumer:** Reporting Service, Community Service, Notification Service.
- **Nguồn có thẩm quyền:** Bảng `outbox_events` trong PostgreSQL của Cinema Core là nguồn thẩm quyền của mọi thông điệp sự kiện.

### 2. Cấu trúc Event Envelope, Khóa phân vùng và Sequencing (Finding 25)
Mọi sự kiện trên Kafka đều tuân thủ cấu trúc phong bì chuẩn (Event Envelope) lưu dạng JSON, bao gồm số thứ tự tăng dần đơn điệu `aggregate_sequence_number`:

```json
{
  "event_id": "evt_01j7abc123456789",
  "event_type": "ORDER_CONFIRMED",
  "aggregate_type": "ORDER",
  "aggregate_id": "ord_01j7stu987654321",
  "aggregate_sequence_number": 1042,
  "aggregate_version": 1,
  "timestamp": "2026-11-18T00:30:00.000Z",
  "source_service": "cinema-core",
  "payload": {
    "order_id": "ord_01j7stu987654321",
    "showtime_id": "shw_01j7pqr123",
    "cinema_id": "cin_01j7jkl456",
    "user_id": "usr_01j7abc789",
    "final_paid_amount": 220000,
    "tickets": [
      { "ticket_id": "tkt_01", "seat_id": "A1", "paid_amount": 110000 },
      { "ticket_id": "tkt_02", "seat_id": "A2", "paid_amount": 110000 }
    ]
  }
}
```

- **Quy tắc Khóa phân vùng (Partition Key):** Mọi sự kiện liên quan đến đơn hàng, vé, suất chiếu đều sử dụng `showtime_id` hoặc `cinema_id` làm partition key để bảo đảm thứ tự tuần tự tuyệt đối.
- **Phân định rõ Thứ tự Aggregate vs Offset Phân vùng và Cơ chế Chặn Gap (Finding 25, P2):**
  - **Phân biệt rạch ròi hai cơ chế tuần tự:**
    1. `aggregate_sequence_number`: Số thứ tự tăng dần đơn điệu do PostgreSQL Cinema Core sinh ra cho từng thực thể (`order_id`, `showtime_id`) trong Transactional Outbox. Dùng để phát hiện khoảng hở (gap) nghiệp vụ của từng thực thể.
    2. `kafka_offset`: Vị trí offset vật lý của message trên từng partition của Kafka topic. Dùng để ghi nhận và commit mốc tiến độ tiêu thụ dòng sự kiện.
  - Consumer theo dõi `last_seen_sequence_number` của từng aggregate và `last_processed_offset` của từng partition.
  - Nếu `incoming.aggregate_sequence_number == last_seen + 1`: Tiêu thụ bình thường và cập nhật mốc tiến độ `last_processed_offset`, `last_aggregate_sequence` vào bảng watermark cục bộ.
  - Nếu `incoming.sequence_number > last_seen + 1` (phát hiện gap sequence):
    - **Tuyệt đối không được bỏ qua để xử lý tiếp, và không được đẩy bản ghi muộn vào Dead Letter Queue (DLQ)** (bảo vệ tính toàn vẹn của các giao dịch tài chính và hoàn tiền).
    - Consumer lập tức **tạm dừng tiêu thụ phân vùng bị gap** (Partition Pause).
    - Kích hoạt pipeline gọi API truy xuất bù (`backfill`) từ bảng `outbox_events` của dịch vụ nguồn (Cinema Core) để lấy lại các sự kiện bị thiếu từ `last_seen + 1` đến `incoming - 1`.
    - Sau khi xử lý hoàn tất các sự kiện bù theo đúng thứ tự tuần tự, Consumer mới mở lại phân vùng để tiêu thụ tiếp dòng dữ liệu bình thường.
  - Nếu `incoming.sequence_number <= last_seen`: Bỏ qua nếu sự kiện đã được ghi nhận trong consumer inbox (Idempotent ignore). Đối với các biến động doanh thu delta, kiểm tra khử trùng lặp theo `event_id` để không cộng dồn hai lần.
  - Tuyệt đối không nhảy cóc gap, không đặt timeout bỏ qua gap (xóa bỏ cơ chế chờ 500ms rồi tiếp tục) để bảo đảm tính chính xác 100% của số liệu tài chính và báo cáo kiểm toán (Finding 25).

### 3. Chính sách Lưu trữ (Retention) và Xử lý Lỗi (Finding 26)
- **Retention (*[Đề xuất kỹ thuật - Đang chờ phê duyệt]*):** Các topic sự kiện nghiệp vụ đặt thời hạn lưu trữ dữ liệu là 7 ngày (đủ thời gian cho các consumer bị lỗi có thể sửa chữa và tiêu thụ lại).
- **Cách ly sự kiện lỗi (Dead Letter Queue - DLQ):** Thử lại tối đa 3 lần với khoảng cách tăng dần; nếu tiếp tục lỗi, chuyển vào `cinema.core.outbox.dlq` để điều tra, không làm tắc nghẽn luồng xử lý chính.

---

## STORE-04: Cloudflare R2 và Cloudflare Images

### 1. Owner và Nguồn có thẩm quyền
- **Owner:** Catalog Service (`services/catalog-service` theo ADR-0019).
- **Nguồn có thẩm quyền:** Bảng `movie_media` trong database `catalog` quản lý toàn bộ khóa object, định dạng và trạng thái liên kết của hình ảnh.

### 2. Cấu trúc Object Storage và Đặt tên Khóa
- **Namespace lưu trữ trên Bucket R2:**
  - Áp phích phim chính thức (Poster): `movies/{movie_id}/poster/{uuid}.webp`
  - Ảnh nền banner (Backdrop): `movies/{movie_id}/backdrop/{uuid}.webp`
  - Ảnh cảnh phim (Still): `movies/{movie_id}/stills/{uuid}.webp`

### 3. Vòng đời, Xóa mồ côi (Orphan Cleanup) và Trailer Video (Finding 26)
- **[Đề xuất kỹ thuật - Đang chờ phê duyệt]:** Object ảnh cũ trên R2 được đưa vào hàng đợi dọn dẹp sau 30 ngày (Soft Retention) để tránh làm hỏng cache CDN.
- Video trailer phim **tuyệt đối không lưu trữ tệp video thô trên R2**; chỉ lưu URL nhúng của YouTube hoặc Vimeo trong cơ sở dữ liệu để tối ưu chi phí lưu trữ và băng thông truyền phát (ADR-0019).

---

## STORE-05: Lưu trữ Cục bộ trên Thiết bị Di động (Mobile Offline Ticket Store)

### 1. Owner và Nguồn có thẩm quyền
- **Owner:** Ứng dụng di động Customer Mobile và Organizer Mobile (`apps/customer-mobile`, `apps/organizer-mobile` theo ADR-0023).
- **Nguồn có thẩm quyền:** Cinema Core (`orders`, `tickets`) và Identity & Access (`sessions`).

### 2. Cấu trúc Phân vùng Namespace, Hợp đồng Snapshot và Vòng đời Khóa (R2-N05)
- **Công nghệ Lưu trữ Cục bộ Chuẩn hóa (Finding R2-N05):**
  - **MMKV Mã hóa (Encrypted MMKV):** Sử dụng duy nhất MMKV với mã hóa AES-256 để lưu trữ bộ đệm vé ngoại tuyến và dữ liệu ca trực. **Tuyệt đối không sử dụng SQLite trên ứng dụng di động** (tránh overhead và rủi ro rò rỉ cơ sở dữ liệu quan hệ cục bộ).
  - **SecureStore (iOS Keychain / Android Keystore):** Chỉ được sử dụng duy nhất để lưu trữ khóa giải mã AES của MMKV và thông tin xác thực phiên (JWT tokens / refresh credentials).
- **Phân định Rõ ràng Phạm vi Ứng dụng:**
  - **Customer Mobile:** Chỉ lưu trữ cục bộ bộ vé xem phim hợp lệ của người dùng gồm: `ticket_id`, `showtime_info`, `seat_labels`, `qr_payload` và chữ ký xác thực số từ Core (`core_signature`).
  - **Organizer Mobile:** Chỉ lưu trữ bộ đệm thông tin ca trực và tóm tắt suất chiếu của rạp (`cinema_id`, `shift_info`, `showtimes_summary`).
- **Hợp đồng Đồng bộ Trực tuyến (Online Refresh Contract - R2-N05):**
  - Khi thiết bị di động có kết nối Internet trở lại:
    1. Customer Mobile tự động gọi API: `GET /customer/tickets` (kèm JWT Bearer Token).
    2. Cinema Core xác thực phiên và trả về danh sách toàn bộ các vé đang hoạt động kèm chữ ký số thẩm quyền `core_signature`.
    3. Ứng dụng di động ghi đè danh sách vé mới vào MMKV mã hóa, tự động dọn bỏ các vé đã qua sử dụng (`USED`) hoặc đã bị hủy (`CANCELLED`).
- **Hợp đồng Snapshot Tối thiểu Bắt buộc (R2-N05):**
  Mọi dữ liệu snapshot lưu trữ cục bộ trên MMKV mã hóa của thiết bị di động đều phải tuân thủ cấu trúc tối thiểu có phiên bản và chữ ký thẩm quyền:
  ```json
  {
    "schema_version": "1.0",
    "owner_user_id": "usr_01j7abc123",
    "cached_at": "2026-11-20T10:00:00.000Z",
    "core_signature": "hmac_sha256_signed_by_core_secret...",
    "tickets": [
      {
        "ticket_id": "tkt_01j7def456",
        "order_id": "ord_01j7ghi789",
        "showtime_id": "shw_01j7jkl012",
        "movie_title": "Dune: Part Two",
        "cinema_name": "Cinema Central Park",
        "hall_name": "Phòng 01",
        "seat_code": "F10",
        "start_time": "2026-11-20T19:30:00.000Z",
        "qr_payload": "https://cinema.vn/qr/tkt_01j7def456?sig=...",
        "status": "ISSUED"
      }
    ]
  }
  ```
- **Namespace Lưu trữ Cục bộ theo Thế hệ Phiên:**
  - Đường dẫn/Khóa lưu trữ trong MMKV: `user_{uid}_session_{generation}/tickets`.
  - `generation`: Số nguyên tăng dần đơn điệu được quản lý trong SecureStore (Keychain trên iOS / Keystore trên Android). Mỗi khi người dùng đăng nhập mới hoặc đổi mật khẩu, `generation` được tăng thêm 1.
- **Chống Nhiễm bẩn Cache khi Đăng xuất (Logout Fencing):**
  - Khi người dùng bấm Đăng xuất hoặc phiên bị hủy: Ứng dụng tăng `generation`, lập tức xóa sạch toàn bộ khóa và dữ liệu MMKV của session cũ.
  - Nếu có phản hồi mạng chậm (Late Network Response) bay về sau khi đã đăng xuất: Ứng dụng kiểm tra thấy lệch `session_generation` sẽ hủy bỏ payload ngay lập tức, không ghi vào cache.
- **Xử lý Mất Khóa Giải mã sau khi Khôi phục Thiết bị (Device Restore / Reinstall):**
  - Trong trường hợp người dùng khôi phục thiết bị từ iCloud/Google Backup hoặc cài lại ứng dụng: Dữ liệu MMKV có thể được phục hồi nhưng khóa AES trong Keystore/Keychain bị mất hoặc không thể giải mã.
  - Khi phát hiện lỗi giải mã: Ứng dụng tự động xóa sạch file MMKV mồ côi đó và kích hoạt chế độ **Bắt buộc kết nối trực tuyến (Online Mandatory Mode)**, yêu cầu người dùng kết nối mạng để gọi `GET /customer/tickets` tải lại toàn bộ vé hợp lệ từ Cinema Core.

### 3. Ranh giới Offline và Bất biến Quét vé (BR-08, BR-30)
- **Mục đích duy nhất:** Phục vụ khách hàng xuất trình mã QR và xem lại thông tin vé đã mua khi điện thoại bị mất sóng hoặc vào khu vực tầng hầm rạp chiếu.
- **Ranh giới nghiêm ngặt:** Dữ liệu ngoại tuyến trên máy khách **tuyệt đối không cho phép thiết bị nhân viên soát vé quét ngoại tuyến (Offline Scanning)**. Nhân viên rạp bắt buộc phải có kết nối mạng trực tuyến với Cinema Core để xác minh chữ ký mã QR và ghi nhận chuyển trạng thái vé sang `USED` (BR-08, BR-30).

---

## STORE-06: Chẩn đoán Kỹ thuật và Ma trận Phục hồi Thảm họa

### 1. Hệ thống Chẩn đoán Kỹ thuật (Grafana, LangSmith, Logs)
- **Quy tắc 7 ngày (NFR-PRIV-01 Mục 9.6):** Toàn bộ nhật ký kỹ thuật chi tiết (Server Logs, HTTP Access Logs, Tracing spans) chỉ được lưu trữ tối đa 7 ngày từ thời điểm tạo, sau đó tự động bị xóa hoặc hủy bỏ. Tuyệt đối không áp dụng thời hạn 7 ngày này cho dữ liệu nghiệp vụ, lịch sử chat của khách hàng, nhật ký kiểm toán tài chính hoặc bản sao lưu phục hồi thảm họa.
- **Chỉ thông tin kỹ thuật:** Tuyệt đối không ghi nội dung chat người dùng, mật khẩu, OTP, token hay mã QR vé vào log/trace.

### 2. Ma trận Fencing Phục hồi Thảm họa, Bảo vệ Tệp Lưu và Quy trình Gating (F25, F26, NFR Mục 9.7)
- **Mục tiêu RTO và RPO Đã duyệt (NFR Mục 9.7.1):** RTO ≤ 60 phút và RPO ≤ 24 giờ cho kịch bản phục hồi cơ sở dữ liệu sang môi trường sạch.
- **Phương pháp Sao lưu và Phục hồi Đã duyệt (NFR Mục 9.7.4, 9.7.5, 9.7.6):**
  - Phương pháp chuẩn hóa được phê duyệt: **`pg_dump` định dạng custom (`-Fc`) + `pg_restore` vào một Cinema Core Database sạch mới**.
  - Duy trì tối thiểu **hai thế hệ bản sao lưu** (`NFR §9.7.5`) và thực thi bằng **kịch bản sao lưu và phục hồi theo nhu cầu** (`scripts on-demand`, `NFR §9.7.6`).
  - Toàn bộ 6 database còn lại (`identity`, `catalog`, `community`, `agent`, `notification`, `reporting`) được giữ nguyên vẹn, tuyệt đối không bị ghi đè hay xóa dữ liệu.
  - *Lịch sao lưu định kỳ hàng ngày, vị trí lưu trữ cụ thể và công cụ tự động hóa là đề xuất kỹ thuật `[TECH-PROP-STORE-02]` đang chờ phê duyệt.*
- **Bảo vệ Tệp Sao lưu và Quản lý Khóa Độc lập (F26, NFR Mục 9.7.2):**
  - Theo yêu cầu đã duyệt tại NFR §9.7.2: Toàn bộ tệp sao lưu bắt buộc phải được mã hóa khi xuất xưởng và khóa mã hóa do nhân sự có thẩm quyền nắm giữ riêng biệt.
  - *Đề xuất kỹ thuật [TECH-PROP-STORE-02] (đang chờ phê duyệt):* Đề xuất lưu trữ tệp sao lưu tách biệt hoàn toàn off-host (khỏi thư mục gốc và máy chủ cơ sở dữ liệu), mã hóa bằng thuật toán AES-256, quản lý khóa trên hạ tầng KMS độc lập (AWS KMS / HashiCorp Vault) và áp dụng cơ chế xác thực đa yếu tố (MFA) cho tài khoản vận hành sao lưu/phục hồi.
  - Trước khi thực hiện phục hồi, quy trình bắt buộc kiểm tra tính hợp lệ của khóa mã hóa và kiểm tra tính toàn vẹn (Integrity Verification) của tệp sao lưu qua mã băm SHA-256 Checksum; nếu sai lệch checksum, tệp bị hỏng hoặc sai khóa thì lập tức từ chối nạp dữ liệu.
- **Kịch bản Diễn tập Phục hồi Thảm họa Đầu tiên (NFR Mục 9.7.3):**
  - Bài diễn tập DR đầu tiên **chỉ gây mất duy nhất Cinema Core Database**, phục hồi sang một Core Database sạch mới; **tuyệt đối không ghi đè hay làm ảnh hưởng đến dữ liệu của 6 database còn lại**.
- **Ma trận Fencing trong Trạng thái Recovery Mode (Finding 25):**

| Thành phần / Worker | Quyền trong `READ_ONLY_RECOVERY_MODE` | Cơ chế Fencing / Hành động đối soát |
|---|---|---|
| **Cổng API Người dùng (BFF / Client APIs)** | Chỉ đọc (`READ_ONLY`) | Chặn toàn bộ lệnh tạo đơn, giữ ghế, thanh toán mới; trả về thông báo bảo trì |
| **Worker Thanh toán (Core Payment Workers)** | Bị chặn (`FENCED`) | Chặn phát lệnh gọi cổng MoMo/VNPAY; chỉ chạy luồng đối soát settlement file |
| **Worker Hoàn tiền (Refund Execution)** | Bị chặn (`FENCED`) | Tuyệt đối không tự động phát lệnh hoàn tiền cho các nghĩa vụ cũ trong bản backup |
| **Worker Thông báo (Notification Dispatch)** | Bị chặn (`FENCED`) | Chặn gửi email hàng loạt cho các giao dịch đã hoàn thành trong quá khứ |
| **Agent Service (AI Assistant)** | Bị chặn (`FENCED`) | Chặn thực thi tool-calling tạo đề xuất đặt vé; chỉ cho phép trả lời câu hỏi tĩnh |
| **Tiến trình Đối soát Tự động (Reconciliation)** | Độc quyền thực thi | Quét file đối soát ngân hàng/cổng thanh toán, khớp các khoản tiền thực thu/hoàn |

- **Thiết kế Chi tiết Cơ chế Nạp Biên lai Soát vé Trực tuyến từ Thiết bị Quầy Rạp (`ticket_scan_logs` - F25):**
  - Tuân thủ nghiêm ngặt quy tắc BR-08 (soát vé trực tuyến - online-only, Cinema Core là nguồn chân lý duy nhất xác nhận vé hợp lệ và cấp biên lai soát vé). Thiết bị tại quầy rạp KHÔNG tự ý cấp quyền soát vé ngoại tuyến bằng chữ ký của thiết bị.
  - Thiết bị máy quét tại quầy rạp chỉ lưu bộ đệm các biên lai soát vé trực tuyến (`core_scan_receipt`) do chính Cinema Core ký số và trả về khi soát vé thành công trước thời điểm Core gặp sự cố.
  - **Schema Biên lai Soát vé Trực tuyến được đệm trên Thiết bị Máy quét:**
    ```json
    {
      "receipt_id": "rcp_01j7scan123",
      "ticket_id": "tkt_01j7def456",
      "scanned_at": "2026-11-20T19:15:00.000Z",
      "scanner_device_id": "dev_hcm_q1_01",
      "staff_user_id": "usr_staff_88",
      "core_scan_receipt": "hmac_sha256_signed_by_core_master_key",
      "device_signature": "hmac_sha256_signed_by_device"
    }
    ```
  - **Quy trình Ingest và Đối soát Biên lai tại Core (F25):**
    1. Khi Core Database khởi động lại ở chế độ `READ_ONLY_RECOVERY_MODE`, Core mở endpoint nội bộ bảo mật: `POST /internal/tickets/reconcile-scans`.
    2. Mỗi thiết bị máy quét tại rạp gửi nạp lại bộ đệm các biên lai `core_scan_receipt` lên Core.
    3. Core Service xác minh chữ ký số của Core `core_scan_receipt` và chữ ký thiết bị `device_signature`.
    4. Lệnh nạp biên lai soát vé và cập nhật trạng thái vé nguyên tử (F23, F25):
       ```sql
       BEGIN;
       -- Bước a: Ghi nhận biên lai soát vé hợp lệ vào ticket_scan_logs
       INSERT INTO ticket_scan_logs (
           id, ticket_id, cinema_id, scanner_user_id, scanner_device_id, verification_method, device_signature, scanned_at
       ) VALUES (
           :receipt_id, :ticket_id, :cinema_id, :scanner_user_id, :scanner_device_id, 'ONLINE_REALTIME', :device_signature, :scanned_at
       ) ON CONFLICT (ticket_id) DO NOTHING;

       -- Bước b: Cập nhật trạng thái vé sang USED (thời gian soát vé lưu chính thức tại ticket_scan_logs)
       UPDATE tickets
       SET status = 'USED',
           updated_at = NOW()
       WHERE id = :ticket_id AND status = 'ISSUED';
       COMMIT;
       ```
    5. Dedupe theo `ticket_id`: bảng `ticket_scan_logs` có ràng buộc `UNIQUE (ticket_id)` đối với các lượt soát thành công. Lệnh INSERT với `ON CONFLICT (ticket_id) DO NOTHING` bảo đảm tính idempotent tuyệt đối khi nạp lại hoặc retry.
    6. *Xử lý khi thiếu biên lai và đứt gãy mạng biên lai (F25):*
       - Nếu một thiết bị máy quét bị hỏng phần cứng hoặc mất bộ đệm biên lai: Quản trị viên kích hoạt quy trình xác minh đối chiếu thủ công tại rạp đó, không tự động mở cổng cho đến khi hoàn tất kiểm tra.
       - Đối với tình huống vé đã được Cinema Core commit chuyển trạng thái `USED` trước khi sự cố xảy ra, nhưng đường truyền mạng gián đoạn khiến biên lai ký số chưa kịp truyền về lưu vào bộ đệm của thiết bị máy quét: Hệ thống KHÔNG được tự động dỡ bỏ fence soát vé của Cổng 2 chỉ vì các máy quét đã nạp hết cache biên lai đang có! Nếu phát hiện khoảng chênh lệch hoặc thiếu căn cứ đối soát cho các vé thuộc suất chiếu trong cửa sổ sự cố, Quản trị viên bắt buộc phải giữ fence soát vé và yêu cầu quản lý rạp đối soát thủ công theo từng suất chiếu bị ảnh hưởng trước khi chuyển Core sang `READ_WRITE_NORMAL`.
- **Năm Cổng Kiểm soát Toàn diện (Five-Gate Criteria) Trước khi Mở `READ_WRITE_NORMAL` (F25):**
  Hệ thống bắt buộc vượt qua đầy đủ 5 cổng kiểm soát sau đây mới được phép chuyển sang trạng thái hoạt động bình thường:
  1. **Cổng 1 (Tài chính & Settlement):** Khớp 100% file đối soát dòng tiền từ các cổng MoMo, VNPAY, Ngân hàng trong khoảng cửa sổ mất dữ liệu ($T_{\text{backup}} \to T_{\text{disaster}}$); cập nhật chính xác các đơn hàng đã thanh toán (`PAID`) hoặc đã hoàn (`REFUNDED`).
  2. **Cổng 2 (Soát vé Rạp Vật lý):** Nạp và đối soát hoàn tất toàn bộ `ticket_scan_logs` từ 100% các rạp chiếu phim đang hoạt động; bảo đảm không còn bất kỳ vé nào đã vào rạp mà bị treo ở trạng thái `ISSUED`.
  3. **Cổng 3 (Quyền hạn & Phiên làm việc):** Đối soát danh sách thu hồi token (Token Revocation List) với Database Identity, thu hồi các phiên đăng nhập cũ trong thời gian sự cố để bảo đảm an toàn.
  4. **Cổng 4 (Combo & Voucher):** Cân bằng số lượng hàng combo đã phát tại quầy rạp và các mã voucher đã tiêu thụ, ngăn chặn việc tái sử dụng voucher đã dùng.
  5. **Cổng 5 (Cơ chế Hòa giải và Sửa chữa 6 Database Vệ tinh - Finding 25):**
     Tuyệt đối KHÔNG reset mù cơ sở dữ liệu hay Kafka offset của 6 dịch vụ vệ tinh (Identity, Community, Catalog, Agent, Notification, Reporting). Do 6 database logic của các dịch vụ này hoàn toàn nguyên vẹn trong khi Core lùi mốc thời gian, hệ thống kích hoạt cơ chế hòa giải và sửa chữa phân vùng:
      - **Reporting Service:** Khởi chạy job Rebuild Partition trong cửa sổ sự cố (từ mốc thời gian `restored_as_of` đến hiện tại), xóa bỏ đồng thời facts và dedupe inbox trong cửa sổ này, sau đó tái tổng hợp lại đồng bộ với dòng sự kiện CDC phát lại từ Core, bảo toàn nguyên vẹn 100% số liệu lịch sử trước mốc phục hồi.
     - **Community Service:** Các projection quyền đánh giá có `core_version > restored_version` hoặc thiếu hụt dữ liệu chuyển sang trạng thái `UNKNOWN`. Khi người dùng đăng bài, Cổng Phủ (Coverage Gate) gọi REST API trực tiếp của Core lấy mốc chứng thực `verified_as_of` mới nhất.
     - **Notification Service:** Inbox khử trùng lặp và bảng `email_dispatch_intents` bảo toàn các email đã gửi (`DELIVERED`). Khi Core phát lại outbox cũ, worker Notification nhận diện qua `idempotency_key` và bỏ qua an toàn, loại trừ 100% việc gửi email spam/trùng lặp cho khách hàng.
     - **Agent Service:** Giữ nguyên các đề xuất đặt vé cũ; các đề xuất trong cửa sổ sự cố sẽ bị từ chối khi gọi sang Core do Core phục hồi không tìm thấy `quote_id` tương ứng, buộc Agent phải yêu cầu Core cấp báo giá mới.
     - **Identity Service:** Giữ nguyên tài khoản và mật khẩu người dùng; các token đổi email/xóa tài khoản chưa hoàn tất sẽ được đối soát theo danh sách thu hồi token (Token Revocation List).
  - *Chuyển trạng thái:* Chỉ khi toàn bộ 5 cổng kiểm soát đạt trạng thái `VERIFIED_PASSED`, Quản trị viên mới phát lệnh chuyển Core sang `READ_WRITE_NORMAL`.
