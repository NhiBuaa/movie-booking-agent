# Đồng bộ sơ đồ ghế từ Cinema Core

Tra cứu nguồn chính thức và Context7 (`/nestjs/docs.nestjs.com`, `/tanstack/query`) ngày 2026-11-17.
**Phương án B đã được chấp thuận tại [ADR-0029](../06-decisions/0029-core-sse-and-query-for-seat-map-synchronization.md); chưa duyệt triển khai.**
So sánh/đề xuất dưới đây giữ bối cảnh nghiên cứu trước quyết định; ADR sở hữu lựa chọn hiện hành.
Đích: worktree `docs-tech-stack-decisions/movie-booking-agent`, detached HEAD `8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.
Chỉ nghiên cứu/tài liệu; chưa cài dependency, sửa code/config, chạy dịch vụ, gọi API nghiệp vụ hoặc đo tải.

## Yêu cầu và khoảng trống

[B-01/B-02/B-08](../03-product/use-case-descriptions.md) yêu cầu sơ đồ từ Core, giữ toàn bộ danh sách hoặc không giữ,
TTL 300 giây từ giờ Core và hủy hold có kiểm tra trạng thái thanh toán. [ADR-0004](../06-decisions/0004-redis-roles-and-seat-hold-coordination.md)
giữ PostgreSQL/Core có thẩm quyền, có dự phòng hold khi Redis lỗi. Đồng bộ UI không thay bảo vệ cạnh tranh đó.
[ADR-0017](../06-decisions/0017-tanstack-query-and-zustand-for-frontend-state.md) chọn Query cho snapshot API;
[ADR-0024](../06-decisions/0024-fetch-and-eventsource-parser-for-sse-clients.md) chọn fetch/parser cho **stream Agent**,
chưa chọn endpoint ghế từ Core tại thời điểm nghiên cứu; phần này được chốt tiếp tại ADR-0029.
Chưa có yêu cầu độ trễ hiển thị/tải đồng thời được xác nhận; “giữ ghế 300 giây” không tự suy ra SLO cập nhật 1 giây.

## Ba phương án

| Hướng | Công nghệ/cách hoạt động | Lợi ích và đánh đổi |
|---|---|---|
| **A. Polling có điều kiện** | TanStack Query GET snapshot; refetch khi đang xem suất, sau command, focus/resume/reconnect. | Ít thành phần và dễ phục hồi; hiển thị trễ theo chu kỳ/mạng, request vẫn phát khi ghế không đổi. Phù hợp nếu chấp nhận độ trễ vài giây; cần đo tải và chốt khoảng thời gian, không tự chọn số cố định từ TTL. |
| **B. SSE invalidation + Query snapshot** | Core phát thông báo “suất này đã đổi”; client gộp thông báo rồi GET snapshot; giữ polling fallback/resync. | Phù hợp cập nhật một chiều, tái dùng fetch/parser đã chọn. Thêm kết nối lâu, fanout, version/race và giám sát; vẫn có độ trễ CDC/mạng, không hứa tức thời. |
| **C. Socket.IO/WebSocket** | Nest gateway, rooms theo suất; HTTP vẫn xử lý giao dịch, adapter phân phối liên replica. | Hợp lý nếu sau này cần tương tác hai chiều liên tục/presence; hiện chưa chứng minh lợi ích hơn SSE cho thông báo ghế. Thêm client/protocol/lifecycle và vận hành adapter; WebSocket thuần không có sẵn toàn bộ semantics Socket.IO. |

TanStack Query v5 cho `enabled`, `refetchInterval` có thể trả false, refetch focus/reconnect và tùy chọn polling khi background.
Native cần nối AppState/focusManager và onlineManager với nguồn trạng thái mạng phù hợp; chọn Query không tự cấu hình bridge native.
[useQuery](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery), [React Native](https://tanstack.com/query/latest/docs/framework/react/react-native).
Socket.IO mặc định cũng có thể mất server→client event khi ngắt mạng; recovery phải thiết kế.
[Delivery guarantees](https://socket.io/docs/v4/delivery-guarantees/).

## Đề xuất B cho hướng portfolio đã chọn

Chọn **NestJS SSE (`@Sse`/RxJS) ở Cinema Core + fetch/`expo/fetch`/eventsource-parser phía client + TanStack Query**.
Tên import native đúng vẫn là `expo/fetch` theo ADR-0024; không thêm sse-starlette vào Core TypeScript.
Dùng một stream có phạm vi cho suất đang xem, không tạo connection cho từng ghế; Web/Mobile/Organizer theo đúng quyền.
Với mục tiêu trải nghiệm cập nhật live và thực hành phân phối sự kiện, B phù hợp hơn việc chỉ polling;
A vẫn là phương án hợp lệ nếu chủ sản phẩm chọn freshness lỏng hơn. Không kết luận B nhanh hơn ở tải chưa đo.

Luồng đề xuất nối vào [ADR-0007](../06-decisions/0007-transactional-outbox-debezium-kafka.md):
**Core commit nghiệp vụ + outbox → Debezium/Kafka Connect → Kafka → consumer chuyển thông báo → Redis Pub/Sub → các replica Core giữ SSE → client invalidates Query → GET snapshot Core**.
Bridge là vai trò trong Core/worker đã có, chưa yêu cầu thêm microservice hoặc mua dịch vụ realtime.
Đây là **eventual/near-realtime**: độ trễ Connect/consumer/mạng tồn tại, không cam kết tức thời hoặc chờ Kafka mới trả hold.
Redis Pub/Sub là vai trò mới so với ADR-0004, đã được duyệt bổ sung tại ADR-0029.
Consumer group chia việc giữa bridge instances; mỗi replica SSE cần nhận fanout qua Pub/Sub, không ghép mọi replica
vào cùng Kafka group rồi giả định mỗi replica đều nhận mọi sự kiện.
[Kafka consumer groups](https://kafka.apache.org/41/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html).

Outbox bảo vệ ý định phát sau commit; Redis/SSE là đường thông báo có thể mất, không là sổ trạng thái.
Không chọn write DB rồi publish Redis trực tiếp làm nguồn thông báo duy nhất: chết giữa hai bước sẽ mất thông báo.
Đường phát trực tiếp sau commit nếu thêm sau chỉ là tối ưu độ trễ có đo, cần version/dedup với đường outbox;
không cần thêm đường đó cho đề xuất ban đầu. Lag/đứt CDC không được chặn hoặc đảo ngược hold đã commit.
[Debezium Outbox](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html).

Redis Pub/Sub là at-most-once, subscriber disconnect sẽ mất tin; bridge/Redis restart cũng tạo khoảng trống.
Retry bridge có thể tạo thông báo lặp và không chứng minh tất cả subscriber đã nhận trước commit Kafka offset.
Vì vậy client cần **resync định kỳ kể cả SSE còn sống**, và polling nhanh hơn khi stream/nguồn fanout lỗi;
heartbeat chỉ chứng minh đường truyền còn sống, không chứng minh CDC đang cập nhật.
[Redis Pub/Sub](https://redis.io/docs/latest/develop/pubsub/).

## Snapshot, thứ tự và thời gian hết hạn

- Snapshot có `showtimeId`, revision thay đổi nghiệp vụ, `serverNow`, trạng thái hiển thị và mốc cần làm mới
  như `validUntil`/hạn sắp tới theo contract sẽ đặc tả. Dữ liệu công khai không chứa userId/hold token/orderId của người khác.
- Event chỉ cần ID/revision/phạm vi loại thay đổi; parse/schema và kiểm subscription đúng suất/quyền trước xử lý.
  Gộp invalidation theo suất và giới hạn tần suất refetch; không phát full sơ đồ mỗi ghế hoặc tạo một GET cho mọi event.
- Tránh khoảng trống GET rồi mới subscribe: thiết kế handshake subscribe/buffer→snapshot→đối chiếu revision, hoặc snapshot
  nhất quán trong stream. Event trùng/cũ bỏ hợp lý, gap/reconnect/không chắc thì refetch; không cần replay toàn lịch sử ghế.
  Có watermark “đã thấy ít nhất revision X”; response GET cũ không được ghi đè snapshot mới, và refetch đang chạy phải
  được nối tiếp nếu event mới tới giữa request. Không hứa bất biến này chỉ từ mặc định Query.
- **Thời gian trôi qua không tự tạo UPDATE/outbox.** Core phải đánh giá hiệu lực hold theo server clock trong mọi đọc/ghi;
  worker expiry có thể materialize transition và outbox, nhưng worker trễ không được kéo dài hạn nghiệp vụ.
  Refresh ở mốc `validUntil` ngay cả khi revision DB không đổi; không dùng revision/ETag một mình để giữ snapshot hết hạn.
- Redis expired/keyspace notification không phải đồng hồ nghiệp vụ: nguồn chính thức không bảo đảm phát đúng khi TTL về 0,
  và thông báo mất khi subscriber offline. Client countdown chỉ gợi ý hiển thị, đến hạn lấy lại Core;
  không tự tuyên bố ghế có thể mua hoặc xóa một thanh toán chưa rõ.
  [Redis expiry timing](https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/).
- Thao tác hold/payment/cancel vẫn qua HTTP có xác thực và idempotency/transaction Core; UI có thể cũ nhưng Core từ chối
  tranh chấp. Reconnect/đổi kênh không replay command, reset TTL hoặc gia hạn hold. Mất SSE không là hủy đơn/hold thất bại.

## Lifecycle, nền tảng và bảo mật

Nest có SSE/Observable, cleanup khi disconnect và hướng dẫn Fastify. Tài liệu hiện nêu thay đổi headers/status Fastify
từ v12.1.3 và API kiểm soát slow client; **chưa pin version dự án**, không suy tính năng mới có ở mọi bản Nest.
Giới hạn connections/subscriptions/payload/queue, heartbeat, deadline, unsubscribe và cleanup phải cấu hình/kiểm chứng.
Không giữ connection DB trong suốt stream; client chậm được resync/ngắt có kiểm soát thay vì buffer vô hạn.
[Nest SSE](https://docs.nestjs.com/techniques/server-sent-events).
Giữ auth delivery theo thiết kế Better Auth/Core: cookie/BFF/CORS hoặc header fetch phù hợp, không bearer trong URL;
EventSource browser chỉ có URL/withCredentials trong constructor. Kiểm quyền rạp và thu hồi quyền ở stream dài.
[WHATWG SSE](https://html.spec.whatwg.org/multipage/server-sent-events.html).
Mobile đóng/tạm dừng theo AppState, foreground lại thì lấy snapshot trước tương tác; không hứa nhận liên tục khi OS treo app.
HTTP/1.x có budget kết nối browser/domain thấp; HTTP/2 vẫn cần kiểm negotiated streams và proxy flushing/buffering/timeouts.
Stream Agent và ghế cùng mở cần kiểm tổng connection budget; hosting/CD giữ quyết định hoãn.
[SSE browser constraints](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events).
Nếu chọn Socket.IO: Redis adapter fanout giữa server nhưng không tự lưu replay; HTTP long-polling cần sticky sessions,
WebSocket-only bỏ yêu cầu đó nhưng mất fallback transport. [Adapter](https://socket.io/docs/v4/redis-adapter/),
[Multiple nodes](https://socket.io/docs/v4/using-multiple-nodes/).

## Chi phí, quyết định cần duyệt và kiểm chứng

Không cần SaaS realtime riêng cho A/B/C; không phát sinh mua license chỉ vì dùng API SSE/Nest/Query đã chọn.
A tốn request/đọc/egress theo polling; B/C tốn RAM/connection/fanout/heartbeat và vẫn cần snapshot/resync.
Chưa có concurrency, nhịp đổi ghế, SLO hoặc topology để ước tính hóa đơn hay khẳng định phương án tiết kiệm nhất.
Chủ sản phẩm đã duyệt **B và vai trò Redis Pub/Sub fanout** tại ADR-0029; còn cần đặc tả freshness bình thường/suy giảm,
chu kỳ fallback/resync, contract/version và capacity. Không chọn thêm managed provider hoặc topology trong nghiên cứu này.
Kiểm tương lai: hai client giữ cùng ghế; commit/rollback; TTL đúng khi worker trễ; cancel/payment race; snapshot/event race;
trùng/gap/reorder; Kafka/Connect/Redis/bridge restart; SSE còn sống nhưng nguồn lag; response GET cũ;
multi-replica fanout; owner/scope sai; reconnect/logout/mobile resume; client chậm/proxy buffer.
Đo commit→UI, tỷ lệ snapshot cũ, requests/CPU/RAM/egress và recovery theo tải xác định trước khi tuyên bố đạt.

Chưa cài hoặc chạy thử; đây là đề xuất kiến trúc, không là bằng chứng realtime/runtime/hiệu năng đã hoạt động.
