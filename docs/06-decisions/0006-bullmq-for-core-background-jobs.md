# ADR-0006 — BullMQ cho tác vụ nền của Cinema Core

## Status

Accepted — ngày 2026-11-16, chủ sản phẩm trả lời “tôi đồng ý” cho đề xuất dùng
**BullMQ + `@nestjs/bullmq`** trong hội thoại Tech Stack
(`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`). Chỉ chọn công nghệ, chưa cài đặt hoặc triển khai code.

## Context

[ADR-0004](0004-redis-roles-and-seat-hold-coordination.md) chọn Redis phục vụ cả hàng đợi tác vụ nền.
Core cần phối hợp email/thông báo và công việc có thể thử lại mà không nhầm trạng thái gửi việc
với trạng thái giao dịch đã xác nhận. NestJS đã được chọn tại
[ADR-0002](0002-nestjs-fastify-for-cinema-core.md).

Cần công cụ quản lý vòng đời job, worker, tác vụ chạy trễ và thử lại. Lựa chọn này theo độ phù hợp
kỹ thuật, không dựa ưu tiên miễn phí; mục tiêu và chi phí được tách theo
[tiêu chí dự án](../../PROJECT-OVERVIEW.md#technology-selection-criteria).

## Decision

- Dùng **BullMQ** cho queue Redis của công việc nền Cinema Core và **`@nestjs/bullmq`** để tích hợp NestJS.
- Dùng lõi mã nguồn mở. Không chọn BullMQ Pro, giao diện quản trị trả phí hoặc dịch vụ queue được quản lý.
- BullMQ quản lý vận chuyển/lập lịch/xử lý job; PostgreSQL tiếp tục lưu trạng thái nghiệp vụ có thẩm quyền.
  Thêm job vào queue không đồng nghĩa job đã hoàn thành, email đã được giao hoặc tiền đã hoàn.
- Handler phải an toàn khi chạy lại. Job ID/deduplication của queue không thay bảo vệ nghiệp vụ:
  job đã bị xóa có thể được thêm lại cùng ID; worker có thể tạo tác dụng phụ rồi lỗi trước xác nhận.

Thư viện không tạo transaction chung PostgreSQL–Redis. Khi chấp thuận ADR này, cơ chế phát sau commit
chưa được chọn. Quyết định tiếp theo tại [ADR-0007](0007-transactional-outbox-debezium-kafka.md)
chọn Transactional Outbox + Debezium CDC + Kafka KRaft cho sự kiện; giữ BullMQ cho tác vụ nền.
Cách nối consumer sang BullMQ, phát lại và xử lý kết quả chưa rõ vẫn cần đặc tả.
Nhánh search được chọn tiếp tại [ADR-0035](0035-search-module-in-cinema-core.md): module Search trong Core
và BullMQ indexing nền; chi tiết bàn giao/chống lặp/phục hồi chưa được triển khai.
Không mặc định hứa giao việc/email đúng một lần hoặc tự hoàn tiền khi retry chưa có đủ căn cứ.

## Alternatives Considered

| Phương án | Điểm phù hợp | Đánh đổi / kết quả |
|---|---|---|
| **BullMQ + `@nestjs/bullmq`** | Có tích hợp Nest, worker, delayed jobs, attempts/backoff và sự kiện vòng đời job. | Được chọn cho nhu cầu email/retry/phục hồi công việc. Cần tuân thủ cách vận hành của thư viện và thiết kế chống lặp. |
| **Redis Streams trực tiếp** | Có consumer group, xác nhận và lấy lại message bị bỏ dở; linh hoạt thiết kế giao thức. | Chưa chọn. Ứng dụng phải ghép thêm retry/backoff, delayed work, giới hạn thử lại, retention và xử lý lỗi cuối cùng. |

## Consequences

- Cần worker cùng định danh nghiệp vụ, theo dõi lỗi, chính sách retry và cách xử lý công việc không thể tự phục hồi.
- Redis queue cần cấu hình persistence phù hợp và `noeviction` theo hướng dẫn BullMQ. `noeviction`
  không tạo thêm RAM: hết bộ nhớ vẫn có thể từ chối ghi. AOF cũng có đánh đổi về dữ liệu có thể mất khi sự cố.
- Cache, khóa và queue có yêu cầu tài nguyên/mất dữ liệu khác nhau. Chưa chọn cách bố trí instance;
  prefix/logical DB không tạo hạn mức bộ nhớ hoặc eviction độc lập trong cùng instance.
- Chưa pin phiên bản Nest adapter, BullMQ hoặc Redis. Cần kiểm tra tương thích trước triển khai.
  Chưa chọn client Redis riêng cho cache/khóa, scheduler hoặc công cụ quan sát queue.
- Worker/RAM, storage, persistence, replica và dịch vụ quản lý có thể phát sinh phí theo nơi triển khai.
  BullMQ Pro là sản phẩm thương mại riêng, không nằm trong quyết định này; chưa có báo giá hạ tầng.
- Chưa chạy runtime/test. Các chính sách OPEN-03/OPEN-09 về đối soát, gửi lại/lỗi email vẫn giữ
  phần chưa chốt; provider Resend được chọn tiếp tại [ADR-0018](0018-resend-for-transactional-email.md).
  Lựa chọn queue không giải quyết thay các chính sách đó.

## References

- [NestJS queues](https://docs.nestjs.com/techniques/queues).
- [BullMQ idempotent jobs](https://docs.bullmq.io/patterns/idempotent-jobs/).
- [BullMQ stalled jobs](https://docs.bullmq.io/guide/jobs/stalled).
- [BullMQ job IDs](https://docs.bullmq.io/guide/jobs/job-ids).
- [BullMQ production guidance](https://docs.bullmq.io/guide/going-to-production).
- [BullMQ Pro](https://docs.bullmq.io/bullmq-pro/introduction).
- [Redis Streams](https://redis.io/docs/latest/develop/data-types/streams/).

Đã đối chiếu nguồn chính thức và Context7 ngày 2026-11-16; không chạy ứng dụng hoặc gọi provider thực.
