# Phát outbox: polling và CDC qua Debezium

Tra cứu ngày 2026-11-16 bằng Context7 và nguồn chính thức. Ghi chú giữ bằng chứng và đánh đổi;
quyết định đã được chủ sản phẩm chọn nằm tại
[ADR-0007 — Outbox + Debezium + Kafka KRaft](../06-decisions/0007-transactional-outbox-debezium-kafka.md).
[ADR-0006](../06-decisions/0006-bullmq-for-core-background-jobs.md) tiếp tục sở hữu BullMQ và tích hợp NestJS.
Chưa cài đặt, sửa cấu hình, chạy connector, đo hiệu năng hoặc kiểm chứng runtime.

## Hai cấp quyết định

Transactional outbox ghi thay đổi nghiệp vụ và ý định sự kiện trong cùng transaction database.
Polling hoặc CDC là cách chuyển tiếp phần đã ghi đó. CDC không đối lập với outbox:
Debezium có [Outbox Event Router](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html)
để xử lý thay đổi của bảng outbox. Đọc thay đổi bảng nghiệp vụ trực tiếp không tự tạo hợp đồng
sự kiện nghiệp vụ ổn định; phạm vi dữ liệu và nội dung sự kiện cần thiết kế có chủ đích.
Outbox làm nguyên tử nghiệp vụ và ý định trong PostgreSQL, không tạo transaction chung
PostgreSQL–Kafka–Redis. [Nguồn: transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html).

## Các cách phát đã so sánh

| Phương án | Đánh đổi áp dụng cho dự án — nhận định thiết kế |
|---|---|
| Outbox + polling publisher | Publisher đọc công việc chờ trong PostgreSQL rồi đưa sang BullMQ. Trực tiếp với queue đã chọn; cần batch/index, phối hợp nhiều publisher, theo dõi tồn đọng, phát lại và xử lý khoảng chờ giữa các lần đọc. |
| Outbox + CDC/Debezium | Đọc thay đổi qua WAL thay vì quét bảng outbox. Thêm connector, vị trí đọc bền, đường vận chuyển và chuyển event thành job; cần kiểm chứng lag, phát lại, schema/contract và phục hồi pipeline. |

Đã chọn outbox + Debezium trong Kafka Connect → Apache Kafka KRaft để thể hiện kiến trúc phân tán
và năng lực vận hành luồng sự kiện trong portfolio. Polling giữ vai trò phương án thay thế đã xem xét.
Chưa đo độ trễ hoặc tải, nên không xếp hạng hiệu năng. Chi phí tiền tệ không dùng để xếp hạng;
độ phức tạp vận hành vẫn là đánh đổi kỹ thuật.

## Đường nối CDC và vai trò BullMQ

[Debezium Server](https://debezium.io/documentation/reference/stable/operations/debezium-server.html)
chạy standalone và có Redis Streams sink; không bắt buộc Kafka. Một đường khả thi để khảo sát là
PostgreSQL/outbox → Debezium Server → Redis Streams → bridge → BullMQ.
Đường Redis Streams là phương án thay thế chưa chọn, chưa được kiểm chứng. Kafka không phải
điều kiện bắt buộc của mọi mô hình Debezium, nhưng là lựa chọn rõ ràng của dự án theo ADR-0007.
[Debezium architecture](https://debezium.io/documentation/reference/stable/architecture.html)
mô tả triển khai connector trong Kafka Connect. Chưa xác minh native BullMQ sink; việc tài liệu
không liệt kê không chứng minh tuyệt đối không tồn tại.

Kafka vận chuyển sự kiện; BullMQ tiếp tục làm hàng đợi tác vụ nền theo ADR-0006. Việc chọn Kafka
chưa cấp quyền triển khai bridge, thay BullMQ hoặc đổi chính sách email. Schema outbox/event,
mapping event→job, retry, lỗi payload, theo dõi tồn đọng và phục hồi vẫn cần thiết kế riêng.

Bridge phải chuyển event thành job và quản lý xác nhận/phát lại. Checkpoint WAL→sink khác
checkpoint consumer/bridge→BullMQ. Enqueue thành công rồi chết trước xác nhận có thể phát lặp;
xác nhận trước enqueue có cửa sổ mất việc. ID queue không thay bảo vệ nghiệp vụ khi công việc chạy lặp;
[job đã xóa có thể được thêm lại cùng ID](https://docs.bullmq.io/guide/jobs/job-ids).

## KRaft và giới hạn tuyên bố chịu lỗi

Broker lưu/phục vụ dữ liệu topic-partition; controller quản lý metadata theo quorum.
KRaft thay cơ chế metadata dựa ZooKeeper, không thay replication dữ liệu topic.
Quorum cần đa số controller hoạt động; khả dụng metadata và khả dụng ghi topic phải xét riêng.
[Nguồn: KRaft](https://kafka.apache.org/44/operations/kraft/),
[replication design](https://kafka.apache.org/44/design/design/).

Một process có thể làm broker, controller hoặc cả hai. Apache mô tả combined thuận tiện
cho phát triển nhưng không khuyến nghị cho triển khai quan trọng: controller ít được cách ly
và không thể nâng cấp/scale độc lập broker. Chưa chọn combined hay tách vai trò.
[Nguồn: KRaft deployment](https://kafka.apache.org/44/operations/kraft/).

Một node không có dự phòng khi node đó mất. Nhiều container trên cùng host vẫn chung miền lỗi
của host; tắt container chỉ kiểm tra lỗi process. Thiết kế chịu lỗi máy/rack/AZ cần phân bố tài nguyên
và bài thử tương ứng. Kafka hỗ trợ phân bố replica theo rack; placement của controller cần xét riêng.
[Nguồn: rack-aware replica placement](https://kafka.apache.org/44/operations/basic-kafka-operations/).

## Điều kiện tương thích và vận hành

PostgreSQL [logical decoding/replication slots](https://www.postgresql.org/docs/18/logicaldecoding-explanation.html)
có thể phát lại thay đổi sau crash và giữ WAL/tài nguyên ngay cả khi consumer không kết nối.
Cần theo dõi dung lượng và độ trễ. Giới hạn
[`max_slot_wal_keep_size`](https://www.postgresql.org/docs/18/runtime-config-replication.html)
có thể khiến WAL cần thiết không còn để tiếp tục đọc; không coi slot là lịch sử vô hạn.

Trước triển khai cần xác minh host cho phép logical decoding, `wal_level=logical`, đủ replication
slots/WAL senders, plugin được hỗ trợ như `pgoutput`, publication và quyền replication/đọc thích hợp.
Quyền tạo publication/slot phụ thuộc cách cấp phát; không mặc định cấp superuser cho connector.
Offset bền, snapshot/recovery, failover, schema/event contract cần được kiểm chứng với tổ hợp chọn.
[Nguồn: PostgreSQL connector](https://debezium.io/documentation/reference/stable/connectors/postgresql.html).

Tại ngày tra cứu, [Debezium 3.7 tested versions](https://debezium.io/releases/3.7/) ghi PostgreSQL 14–18,
Kafka Connect 3.1 trở lên và Java 17 trở lên cho connectors. Đây là dữ liệu của series đã đọc,
không phải pin phiên bản dự án hay bảo đảm mọi tổ hợp tương thích. Khi pin phải đối chiếu đồng thời
Debezium, Kafka Connect, broker/client, JVM và PostgreSQL/plugin. Ví dụ Kafka 4.x yêu cầu Java 17
trở lên cho broker/Connect; lấy yêu cầu đáp ứng tất cả thành phần thực dùng.
[Nguồn: Kafka compatibility](https://kafka.apache.org/44/getting-started/compatibility/),
[Java runtime](https://kafka.apache.org/44/operations/java-version/).

## License và chi phí cần công khai

Mã nguồn Apache Kafka và Debezium mang Apache License 2.0, không có phí mua license bắt buộc
cho việc dùng bản nguồn mở theo license này. Đây không phải cam kết miễn phí hosting hoặc mọi
distribution/connector/dịch vụ thương mại. Khi chọn artifact phải rà license/NOTICE đi kèm và phụ thuộc.
[Nguồn: Kafka LICENSE](https://github.com/apache/kafka/blob/trunk/LICENSE),
[Debezium LICENSE](https://github.com/debezium/debezium/blob/main/LICENSE.txt).

Những nhóm tài nguyên cần dự toán khi có topology/host:

- JVM/CPU/RAM cho broker/controller, Connect/Debezium và consumer/bridge tương lai.
- Disk, I/O, retention cho metadata/topic/replica và internal topics của Connect;
  PostgreSQL WAL/outbox cùng Redis queue có dung lượng riêng.
- Traffic giữa node/miền lỗi, giám sát/log/alert, backup/phục hồi và nhân lực vận hành.

Các thành phần được mô tả trong [Kafka Connect user guide](https://kafka.apache.org/44/kafka-connect/user-guide/)
và [KRaft operations](https://kafka.apache.org/44/operations/kraft/).
Đây là nhóm tài nguyên cần tính, không phải báo giá. Thiếu node count, retention, tải,
replication và nhà cung cấp nên chưa đủ dữ kiện ước tính tiền. Dịch vụ quản lý/hỗ trợ thương mại
có thể tính phí riêng. Chi phí được công khai, không dùng để loại phương án.

CDC không tự bảo đảm job/email đúng một lần từ đầu đến cuối. Chưa chọn phiên bản/driver,
nhà cung cấp, số node, replication/ISR, layout controller/broker, sizing hoặc triển khai bridge.
Thiết kế đã chọn, kiểm chứng cục bộ và chịu lỗi thực tế là các kết luận riêng.
