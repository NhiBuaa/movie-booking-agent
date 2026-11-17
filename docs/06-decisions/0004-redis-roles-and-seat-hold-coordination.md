# ADR-0004 — Vai trò Redis và điều phối giữ ghế

## Status

Accepted — chủ sản phẩm chọn phương án C ngày 2026-11-16 trong hội thoại **Tech Stack**
(`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`), sau khi xác nhận C bao gồm B và thêm Redis vào bước giữ ghế.
Nguồn chấp thuận: “tôi chọn C”. Quyết định này chưa chọn thuật toán hoặc cho phép triển khai code.

Cùng ngày, người dùng chọn B ở vòng xử lý sự cố: **dự phòng giữ ghế qua PostgreSQL khi Redis
không khả dụng, với điều kiện PostgreSQL còn hoạt động và các bảo vệ giao dịch giữ nguyên**.
Lựa chọn dự phòng này không thay phương án vai trò C ở trên.

## Context

[ADR-0003](0003-postgresql-and-redis-for-platform-data.md) chọn PostgreSQL làm kho nghiệp vụ chính,
Redis có mặt từ bản đầu và chưa thêm database thứ ba. [Mô hình sản phẩm](../03-product/use-cases.md)
giữ các bất biến về hold nguyên tử, hạn 300 giây, quyền theo ghế, thanh toán và xử lý chống lặp.

C mở rộng vai trò Redis sang điều phối truy cập trong luồng giữ ghế, ngoài cache và công việc nền.
Việc phối hợp hai kho tạo thêm các tình huống hết hạn, mất kết nối và khôi phục cần thiết kế/kiểm chứng.
Chưa có phép đo chứng minh C có hiệu năng tốt hơn B cho dự án.

## Decision

Chọn đủ bốn vai trò Redis từ bản đầu:

- **Cache:** lưu bản sao dữ liệu phù hợp để phục vụ đọc; không thay thẩm quyền của Core về giá,
  tồn kho hoặc trạng thái giao dịch hiện hành.
- **Giới hạn tần suất gọi API:** phối hợp bộ đếm/quy tắc giữa các tiến trình; hạn mức và cách xử lý
  khi Redis lỗi cần được đặc tả, không tự bỏ kiểm tra xác thực/quyền.
- **Hàng đợi tác vụ nền:** phục vụ công việc như gửi email và thử lại. Thư viện được chọn tại
  [ADR-0006](0006-bullmq-for-core-background-jobs.md); worker, lịch chạy, lưu bền, phát lại và giới hạn thử lại
  cần thiết kế cụ thể. Queue không là căn cứ nghiệp vụ duy nhất.
- **Khóa/điều phối giữ ghế:** Redis tham gia luồng giữ ghế trước hoặc trong bước cập nhật có thẩm quyền
  của Core. Đây là C = B + vai trò Redis trong giữ ghế, không chuyển toàn bộ dữ liệu hold sang Redis.

PostgreSQL tiếp tục lưu trạng thái nghiệp vụ có thẩm quyền. Core phải kiểm tra và ghi nhận giữ ghế
qua các bảo vệ trong PostgreSQL; chỉ trả kết quả giữ thành công sau khi trạng thái cần thiết được commit.
Redis cấp khóa, còn TTL hoặc có bản sao cache không tự chứng minh yêu cầu được phép giữ/mua ghế.

Vai trò **Redis Pub/Sub fanout thông báo sơ đồ ghế** được bổ sung tiếp tại
[ADR-0029](0029-core-sse-and-query-for-seat-map-synchronization.md). Không thay bốn vai trò ban đầu,
không là kho hold hoặc thông báo bền; client vẫn cần Query snapshot/polling/resync.

Thời hạn khóa kỹ thuật Redis và thời hạn giữ ghế 300 giây của khách là hai khái niệm riêng.
Không mặc định khóa database hoặc khóa Redis được giữ suốt lúc khách thanh toán.
Mất/hết hạn khóa không được tự xóa hiệu lực của đơn/hold còn hợp lệ hoặc cho bán trùng ghế.

Thêm Redis không thay đổi giới hạn ghế, cặp Sweetbox, một hold còn hiệu lực/tài khoản,
giữ toàn bộ hoặc không giữ ghế nào, hay quy tắc thanh toán chưa rõ/đến muộn của mô hình sản phẩm.
Các chính sách `OPEN-*`, gồm gửi lại/lỗi email ở OPEN-09, vẫn giữ phần chưa quyết định.
Provider email được chọn tiếp là Resend tại [ADR-0018](0018-resend-for-transactional-email.md).

### Dự phòng giữ ghế khi Redis gặp sự cố

- Khi Redis lỗi kết nối/không khả dụng ở bước điều phối giữ ghế, Core chuyển sang xử lý bằng
  PostgreSQL. Không chuyển chỉ vì không lấy được khóa do yêu cầu khác đang sở hữu hợp lệ;
  tranh chấp bình thường vẫn được xử lý theo giao thức khóa/giữ ghế.
- Cả đường có Redis và đường dự phòng phải dùng cùng bảo vệ giao dịch PostgreSQL và cùng quy tắc
  nghiệp vụ, kể cả khi hai đường chạy đồng thời. Redis lỗi không cho phép bỏ xác thực/quyền,
  tạo giữ ghế trùng, tự gia hạn 300 giây hoặc báo thành công trước commit.
- Timeout gọi Redis có thể có kết quả chưa rõ: khóa có thể đã được cấp. Cần kiểm tra kết quả hiện
  có/chống lặp theo yêu cầu và xử lý khóa đúng chủ sở hữu; chưa chọn thuật toán hoặc định danh cụ thể.
- Nếu PostgreSQL cũng lỗi hoặc không xác định được kết quả, không xác nhận giữ thành công.
  Đường dự phòng phải có giới hạn tải và thời gian chờ; cách nhận diện lỗi, chuyển chế độ và quay lại
  Redis sau phục hồi cần được đặc tả/kiểm chứng, chưa có ngưỡng mặc định.
- Quyết định này chỉ xác định dự phòng bước điều phối hold. Cách xử lý Redis lỗi cho rate limit,
  cache và queue phải thiết kế theo từng vai trò; không suy ra được tự bỏ giới hạn an toàn hoặc mất tác vụ.

## Alternatives Considered

| Phương án | Vai trò Redis | Đánh đổi / kết quả |
|---|---|---|
| A | Cache và giới hạn tần suất; hold ở PostgreSQL. | Ít trách nhiệm phối hợp hơn, chưa chọn hàng đợi nền. Không được chọn. |
| B | Như A, thêm hàng đợi; hold ở PostgreSQL. | Phục vụ công việc nền có thể thử lại, giữ luồng hold trong một kho. Không được chọn. |
| **C** | Toàn bộ B, thêm Redis khóa/điều phối giữ ghế; PostgreSQL bảo vệ giao dịch cuối cùng. | Được chọn. Thêm vòng đời khóa và tình huống lỗi hai kho cần xử lý; không xem là cải thiện hiệu năng đã chứng minh. |

## Consequences

- Cần bảo vệ trước khóa hết hạn/mất khi yêu cầu cũ vẫn chạy; thao tác giải phóng chỉ tác động khóa
  đúng chủ sở hữu. Redis replication/failover và TTL không tự bảo đảm độc quyền trong mọi tình huống.
- Phải thiết kế hold nhiều ghế, xử lý tranh chấp và chống lặp xuyên cả Redis và PostgreSQL;
  chưa chọn lock key theo suất/ghế, Lua, Redlock, token/fencing hoặc thuật toán gia hạn khóa.
- Cache có thể tái tạo; hàng đợi và khóa có yêu cầu mất dữ liệu/eviction khác. Prefix hoặc logical DB
  không tự cách ly bộ nhớ/chính sách của một Redis instance. Topology và cấu hình còn mở.
- Tác vụ có thể chạy lại cần xử lý chống lặp và cơ chế khôi phục ý định công việc quan trọng.
  [ADR-0007](0007-transactional-outbox-debezium-kafka.md) chọn Transactional Outbox + Debezium CDC +
  Kafka KRaft cho sự kiện; cách bàn giao sang tác vụ BullMQ còn cần đặc tả, không hứa gửi email đúng một lần.
- Worker, RAM, lưu bền, replica và giám sát có thể phát sinh phí theo cấu hình/nhà cung cấp;
  cần báo riêng theo [tiêu chí dự án](../../PROJECT-OVERVIEW.md#technology-selection-criteria).

### Các phần thiết kế còn mở

1. Ngưỡng nhận diện lỗi/chuyển dự phòng, kiểm soát tải và quay về Redis; chứng minh đường bình thường
   và dự phòng không phá các bất biến khi chạy đồng thời, kể cả timeout chưa rõ kết quả.
2. Thuật toán nhận/giải phóng khóa, thời hạn, timeout, chống lặp và xử lý tiến trình chạy quá hạn.
3. Client Redis cho cache/khóa, bàn giao sự kiện từ pipeline ADR-0007 sang công việc nền và phục hồi
   công việc thất lạc/chưa rõ; queue dùng BullMQ theo ADR-0006, chưa chốt phiên bản/cấu hình.
4. Cách bố trí instance, persistence, eviction, theo dõi lỗi và kiểm chứng cạnh tranh/khôi phục.

## References

- [ADR-0003](0003-postgresql-and-redis-for-platform-data.md).
- [Ranh giới thẩm quyền](../02-architecture/system-boundaries.md).
- [Redis distributed locks](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/).
- [Redis persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/).
- [Redis eviction](https://redis.io/docs/latest/develop/reference/eviction/).
- [BullMQ idempotent jobs](https://docs.bullmq.io/patterns/idempotent-jobs/).
- [BullMQ production guidance](https://docs.bullmq.io/guide/going-to-production).

BullMQ và tích hợp NestJS được chọn tiếp tại ADR-0006; các chính sách/cấu hình còn mở vẫn cần đặc tả.
