# ADR-0007 — Transactional Outbox, Debezium CDC và Apache Kafka KRaft

## Status

Accepted — ngày 2026-11-16, chủ sản phẩm yêu cầu: “Mục tiêu của tôi là hoàn thiện Portfolio
thể hiện năng lực kiến trúc phân tán. Hãy chọn phương án: Transactional Outbox + Debezium CDC +
Apache Kafka (chạy chế độ KRaft)” trong hội thoại Tech Stack
(`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`).
Chấp thuận lựa chọn kiến trúc/công nghệ và ghi tài liệu; chưa cài dependency, sửa code hoặc triển khai.

## Context

[ADR-0003](0003-postgresql-and-redis-for-platform-data.md) chọn PostgreSQL làm kho nghiệp vụ chính;
[ADR-0006](0006-bullmq-for-core-background-jobs.md) chọn BullMQ cho tác vụ nền nhưng chưa quyết định
cách lưu và phát ý định sau giao dịch. Ghi database rồi gửi message bằng hai thao tác độc lập tạo
khoảng lỗi: database đã commit nhưng tiến trình chết trước khi gửi, hoặc gửi thành công rồi giao dịch rollback.

Mục tiêu portfolio được làm rõ là thể hiện **năng lực kiến trúc phân tán**, gồm ranh giới giao dịch,
luồng sự kiện và phục hồi có bằng chứng. Đây là lý do chấp nhận thêm thành phần vận hành so với
polling publisher; không phải kết luận Kafka nhanh hơn hoặc tải hiện tại bắt buộc dùng Kafka.
[Tiêu chí dự án](../../PROJECT-OVERVIEW.md#technology-selection-criteria) không dùng chi phí để loại
phương án, nhưng phải công khai phí và giới hạn.

## Decision

- Dùng **Transactional Outbox**: Cinema Core ghi thay đổi nghiệp vụ và bản ghi sự kiện vào PostgreSQL
  trong **cùng một transaction**. Rollback không để lại sự kiện của thay đổi chưa commit.
- Dùng **Debezium PostgreSQL connector chạy trên Kafka Connect**, với **Outbox Event Router**,
  để thu nhận thay đổi bảng outbox qua WAL (nhật ký ghi trước của PostgreSQL) và phát sự kiện nghiệp vụ.
  Không phát toàn bộ bảng nghiệp vụ làm hợp đồng công khai mặc định.
- Dùng **Apache Kafka ở chế độ KRaft**, quản lý metadata bằng quorum của Kafka, không dùng ZooKeeper.
  Kafka lưu và phân phối luồng sự kiện, cho phép consumer độc lập và đọc lại trong giới hạn retention.
- Giữ **BullMQ + `@nestjs/bullmq`** theo ADR-0006 cho quản lý job, lịch trễ và retry của tác vụ nền.
  Kafka phụ trách sự kiện đã xảy ra; BullMQ phụ trách công việc cần thực hiện. Chưa chọn cách nối
  consumer Kafka sang BullMQ; không mặc định mọi event đều phải đi qua cả hai.
- Nhánh thông báo ghế được chọn tiếp tại [ADR-0029](0029-core-sse-and-query-for-seat-map-synchronization.md):
  consumer chuyển thông báo qua Redis Pub/Sub tới các replica Core SSE; client refetch snapshot và resync.
  Nhánh này không yêu cầu đi qua BullMQ hoặc chờ phát thông báo mới xác nhận hold.
- PostgreSQL và Cinema Core tiếp tục là nguồn có thẩm quyền về ghế, giá, hold, thanh toán và vé.
  Kafka không là database nghiệp vụ thứ ba hoặc căn cứ để Agent tự xác nhận vé. Đây cũng không phải
  quyết định áp dụng event sourcing hay tách thêm microservice.

Luồng mục tiêu: **Core → PostgreSQL (nghiệp vụ + outbox cùng transaction) → Debezium/Kafka Connect
→ Kafka KRaft → consumer**. Nhánh tác vụ qua BullMQ cần đặc tả cơ chế bàn giao và phục hồi riêng.

### Hợp đồng và bảo vệ cần có khi triển khai

- Sự kiện có ID ổn định để nhận diện lặp, loại/phiên bản hợp đồng và khóa theo thực thể nghiệp vụ
  để phân vùng khi cần thứ tự. Schema, tên topic và khóa cụ thể chưa chốt. Thứ tự trong partition
  không tạo thứ tự toàn hệ thống; xử lý song song/retry ở consumer cũng cần bảo vệ thứ tự nghiệp vụ.
- Thiết kế theo khả năng **nhận ít nhất một lần**: connector/consumer có thể phát hoặc xử lý lặp
  khi phục hồi. Consumer phải chống lặp; việc ghi kết quả nghiệp vụ và dấu đã xử lý cần phối hợp
  nguyên tử trong kho sở hữu kết quả. Offset hay job ID không tự bảo vệ tác dụng phụ bên ngoài.
- Khi gọi email/thanh toán, cần cơ chế chống lặp, tra cứu kết quả chưa rõ và đối soát phù hợp provider;
  không hứa “đúng một lần” từ đầu đến cuối. Không tự phát lại lệnh hoàn tiền chỉ vì đọc lại event.
- Việc xác nhận giữ ghế/thanh toán/vé dựa vào quy tắc và trạng thái đã commit của Core;
  độ trễ Kafka hoặc lỗi thông báo không đảo ngược giao dịch hợp lệ. Các chính sách `OPEN-*`
  vẫn do [mô hình sản phẩm](../03-product/use-cases.md) sở hữu.

## Alternatives Considered

| Phương án | Lợi ích | Đánh đổi / kết quả |
|---|---|---|
| Outbox + polling → BullMQ | Ít thành phần, nối trực tiếp queue đã chọn; dễ bắt đầu và kiểm tra. | Cần polling/batch/index và phát lại an toàn. Không chọn vì mục tiêu vừa xác nhận ưu tiên thực hành luồng sự kiện phân tán bằng CDC và Kafka. |
| Outbox + Debezium Server → Redis Streams | Có CDC, không cần Kafka; có thể tận dụng Redis. | Vẫn cần thiết kế consumer/bridge, checkpoint và phục hồi; không đáp ứng lựa chọn Kafka KRaft của chủ sản phẩm. |
| **Outbox + Debezium/Kafka Connect → Kafka KRaft** | Tách ghi nghiệp vụ khỏi phân phối event; thực hành consumer độc lập, retention/replay và phục hồi pipeline. | Được chọn. Thêm broker/controller, Connect, storage và ranh giới nhất quán cần vận hành/kiểm chứng. Chưa có benchmark dự án để xếp hạng hiệu năng. |

## Consequences

- Host PostgreSQL phải hỗ trợ logical decoding/replication, quyền phù hợp và publication/slot.
  Connector ngừng đọc có thể khiến slot giữ WAL, gây áp lực dung lượng; giới hạn giữ WAL có thể
  làm mất vị trí cần đọc và buộc khôi phục bằng quy trình khác. Cần cảnh báo lag/disk và runbook.
- Phải lưu bền vị trí đọc/trạng thái Connect và Kafka, thiết kế retention/cleanup outbox, retention topic,
  retry, cách ly sự kiện lỗi và replay có kiểm soát. Retention Kafka không thay backup/restore PostgreSQL.
- KRaft không tự tạo tính sẵn sàng cao. Một node hoặc nhiều tiến trình cùng host không chứng minh
  chịu lỗi host. Kafka khuyến cáo tách broker/controller cho môi trường quan trọng; ba controller
  chịu được một controller lỗi, nhưng độ bền dữ liệu còn phụ thuộc broker, replication và ISR.
  Chưa chọn topology demo hoặc cụm chịu lỗi; không coi cấu hình phát triển là bằng chứng production.
- Cần hạn chế dữ liệu cá nhân trong payload, quyền topic/connector và truy cập mạng; không phát bí mật
  hoặc mở broker/Connect quản trị công khai. Retention và khả năng replay phải phù hợp chính sách dữ liệu.
- Chưa pin phiên bản PostgreSQL, Debezium, Kafka/Connect, Java hoặc client Kafka cho NestJS.
  Cần kiểm tra ma trận tương thích trước triển khai; chưa chọn provider hay tạo tài nguyên trả phí.

### Chi phí

Apache Kafka/Kafka Connect và Debezium mã nguồn mở dùng giấy phép Apache 2.0, không thu phí
bản quyền sử dụng bản upstream. **Vận hành không mặc định miễn phí**: CPU/RAM cho broker/controller,
Connect và consumer; đĩa cho Kafka/WAL/outbox/offset; replica, backup, network và giám sát đều tiêu
tốn tài nguyên. Dịch vụ managed/support có thể thu phí riêng nếu chọn sau này.

Chưa đủ dữ kiện để báo số tiền: cần nơi triển khai, topology, tài nguyên, lưu lượng/kích thước event,
retention và thời gian chạy. Bảng ước tính theo các giả định đó cùng nguồn giá/ngày tra cứu phải được
trình bày khi chọn phương án triển khai; chấp thuận công nghệ này không phải quyền mua dịch vụ.

### Bằng chứng cần có cho portfolio

Trước khi tuyên bố pipeline hoạt động, cần kiểm chứng transaction rollback không phát event;
commit rồi Core dừng vẫn chuyển tiếp được; connector/Kafka ngừng rồi phục hồi; event lặp không tạo
kết quả nghiệp vụ lặp; consumer lỗi trước/sau khi ghi kết quả; replay và sự kiện lỗi được xử lý an toàn.
Nếu dùng BullMQ, kiểm chứng thêm lỗi giữa enqueue và commit offset, cả trường hợp Redis mất dữ liệu
theo cấu hình đã chọn. Cần đo độ trễ từ commit tới consumer, lag/tồn đọng và khả năng phục hồi ở tải
được ghi rõ. Số đo và khả năng chịu lỗi chưa được xác nhận từ ADR này.

## References

- [Debezium Outbox Event Router](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html).
- [Debezium PostgreSQL connector](https://debezium.io/documentation/reference/stable/connectors/postgresql.html).
- [PostgreSQL logical decoding và replication slots](https://www.postgresql.org/docs/18/logicaldecoding-explanation.html).
- [Kafka KRaft và topology](https://kafka.apache.org/41/operations/kraft/).
- [Kafka Connect](https://kafka.apache.org/41/kafka-connect/overview/).
- [Apache Kafka license](https://github.com/apache/kafka/blob/trunk/LICENSE).
- [Debezium license](https://github.com/debezium/debezium/blob/main/LICENSE.txt).
- [Ghi chú nghiên cứu và các phương án](../99-notes/outbox-delivery-research.md).

Đối chiếu Context7 và nguồn chính thức ngày 2026-11-16. Các trang phiên bản chỉ là nguồn tham khảo,
không phải pin phiên bản triển khai. Chưa chạy runtime hoặc kiểm thử tích hợp.
