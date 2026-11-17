# ADR-0029 — Core SSE và Query snapshot cho đồng bộ sơ đồ ghế

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý với đề xuất của bạn” sau câu hỏi
chọn B: Core SSE + TanStack Query, bao gồm Redis Pub/Sub phân phối thông báo và polling dự phòng/
đồng bộ định kỳ, trong hội thoại Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`).
Chỉ chọn kiến trúc/công nghệ; chưa cài dependency, viết endpoint/consumer/client hoặc kiểm chứng runtime.

## Context

[B-01/B-02/B-08](../03-product/use-case-descriptions.md) cần hiển thị trạng thái ghế theo Core,
hold nguyên tử 300 giây và giải phóng đúng quy tắc. Query đã chọn cho snapshot API tại
[ADR-0017](0017-tanstack-query-and-zustand-for-frontend-state.md), nhưng stream Agent tại
[ADR-0011](0011-sse-starlette-for-agent-streaming.md) không tự đồng bộ ghế cho các client khác.
Cần đường thông báo sau commit và phục hồi khi thông báo mất, phù hợp mục tiêu portfolio phân tán.

## Decision

- Dùng **SSE của NestJS (`@Sse`/RxJS)** ở Cinema Core, tách endpoint/ngữ nghĩa khỏi SSE Agent.
  Client Web/Organizer dùng browser fetch; Mobile dùng `expo/fetch`, chung `eventsource-parser`
  theo [ADR-0024](0024-fetch-and-eventsource-parser-for-sse-clients.md). Không thêm sse-starlette vào Core.
- SSE báo suất đang xem có thay đổi; client gộp thông báo, invalidate/refetch **TanStack Query**
  để lấy snapshot trạng thái từ Core. Không tạo kết nối riêng cho từng ghế hoặc phát dữ liệu hold/
  đơn/người giữ của khách khác. Không coi event/cached snapshot là quyền giữ hoặc mua ghế.
- Nối luồng đã chọn tại [ADR-0007](0007-transactional-outbox-debezium-kafka.md):
  **Core commit nghiệp vụ + outbox → Debezium/Kafka Connect → Kafka → consumer chuyển thông báo
  → Redis Pub/Sub → các replica Core giữ SSE → client → GET snapshot Core**.
  Consumer chuyển thông báo là vai trò trong Core/worker; không yêu cầu microservice/SaaS realtime mới.
- Bổ sung **Redis Pub/Sub cho fanout thông báo** bên cạnh vai trò tại
  [ADR-0004](0004-redis-roles-and-seat-hold-coordination.md). Đây là đường thông báo mất được,
  không thay kho nghiệp vụ hoặc Kafka. Kafka group chia việc cho bridge; Pub/Sub phân phối tới
  mọi replica SSE có subscription, không giả định một Kafka group broadcast cho tất cả replica.
- Giữ **polling có điều kiện khi đường thông báo lỗi**, refetch khi mở/focus/resume/reconnect/sau command,
  và **resync định kỳ kể cả SSE còn sống**. Heartbeat không chứng minh nguồn CDC/fanout đang cập nhật.
  Chu kỳ, ngưỡng chuyển chế độ và SLO freshness cần đặc tả/đo, chưa chọn con số mặc định.
- Hold/cancel/payment vẫn qua HTTP có xác thực và bảo vệ transaction/idempotency tại Core.
  Không chờ Kafka để trả hold đã commit; mất SSE không hủy hold hoặc cho phép reset TTL/phát lại command.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| Polling có điều kiện làm kênh duy nhất | Hợp lệ nếu chấp nhận trễ theo chu kỳ; ít thành phần nhưng request vẫn phát khi dữ liệu không đổi. Giữ làm đường dự phòng/resync, không chọn làm kênh chính. |
| **Core SSE + Query snapshot + polling fallback/resync** | Được chọn: thông báo một chiều phù hợp, tái dùng parser/transports và luồng sự kiện hiện có. Thêm kết nối lâu, fanout, version/race và đo độ trễ; chưa chứng minh nhanh/tiết kiệm hơn bằng phép đo. |
| Socket.IO/WebSocket | Phù hợp nếu cần trao đổi liên tục hai chiều/presence. Chưa có nhu cầu đó cho thông báo ghế để ưu tiên thêm client/protocol/adapter. Không chọn. |

## Consequences

- Đây là cập nhật gần thời gian thực, có độ trễ CDC/consumer/mạng; không cam kết tức thời hoặc
  số giây cụ thể. Outbox bảo vệ ý định sau commit; Redis Pub/Sub at-most-once vẫn có thể mất tin.
  Retry bridge tạo tin lặp được, không chứng minh mọi client nhận hoặc bảo đảm exactly-once.
- Thiết kế snapshot/event contract có phạm vi, revision và thời gian server/mốc cần làm mới.
  Tránh race subscribe/snapshot, response GET cũ ghi đè dữ liệu mới hoặc bỏ sự kiện tới giữa refetch.
  Event gap/reconnect/không chắc phải resync; không chọn kho replay toàn bộ lịch sử ghế trong ADR này.
- Thời gian trôi qua không tự sinh UPDATE/outbox. Core đánh giá hết hạn theo server clock trong đọc/ghi;
  worker materialize expiry nếu dùng không được kéo dài TTL khi chạy trễ. Client refresh tại mốc hết hạn
  theo contract ngay cả revision DB chưa đổi; countdown/Redis key-expiry không tự xác nhận ghế mua được.
- Giới hạn connections/subscriptions/buffer/refetch, gộp invalidation chống dồn tải; không giữ DB connection
  suốt stream. Kiểm disconnect/cleanup/client chậm, BFF/proxy buffering, HTTP connection budget và shutdown.
- Kiểm quyền showtime/rạp và phiên suốt lifecycle; auth delivery theo thiết kế Better Auth/Core,
  không bearer trong URL. Native AppState/resume cần snapshot mới; không hứa OS giữ stream khi background.
- Chưa pin Nest/Fastify/RxJS/Redis client hoặc chọn topology. Kiểm API SSE với version thực trước dùng;
  chưa triển khai fanout/polling, đo commit→UI, tải, failover hoặc native/proxy runtime.
- Kiểm cạnh tranh nhiều client, commit/rollback, cancel/payment/expiry race, worker trễ, event trùng/gap,
  Kafka/Connect/Redis/bridge restart, SSE còn sống nhưng nguồn lag, multi-replica và snapshot cũ.

### Chi phí

Không cần SaaS realtime riêng. SSE/fanout tiêu thụ RAM, kết nối, heartbeat/egress và Redis work;
Query snapshot/polling vẫn tốn đọc/request. Chưa có topology/tải/SLO để báo hóa đơn hoặc kết luận
rẻ nhất. Hosting/CD vẫn hoãn; chấp thuận vai trò Pub/Sub không tự mua dịch vụ hoặc thêm máy.

## References

- [Nghiên cứu ba phương án và failure modes](../99-notes/seat-map-synchronization-research.md).
- [Nest SSE](https://docs.nestjs.com/techniques/server-sent-events).
- [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/reference/useQuery).
- [Redis Pub/Sub](https://redis.io/docs/latest/develop/pubsub/).
- [Redis expiry timing](https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/).
- [Debezium Outbox](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html).

Nguồn/Context7 đối chiếu ngày 2026-11-17 trong nghiên cứu; lựa chọn không là bằng chứng realtime đã vận hành.
