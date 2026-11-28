# ADR-0018 — Resend cho email giao dịch

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý với đề xuất của bạn” sau đề xuất
chọn Resend làm nhà cung cấp email giao dịch trong hội thoại Tech Stack
(`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`). Chỉ chọn provider; chưa chọn Free/Pro hoặc region,
tạo tài khoản/API key, sửa DNS, cài SDK, gửi email hoặc kích hoạt chi tiêu.

## Context

[Mô hình sản phẩm](../03-product/use-cases.md) cần email cho xác minh tài khoản (A-02),
khôi phục mật khẩu (A-05), gửi vé (B-06), thông báo hủy suất (R-07), xác minh khi thiếu QR (O-02)
và thông báo giao dịch (L-06). [Better Auth](0008-better-auth-with-direct-login.md) đã được chọn;
[BullMQ](0006-bullmq-for-core-background-jobs.md) và [outbox/CDC/Kafka](0007-transactional-outbox-debezium-kafka.md)
giữ hướng xử lý job/sự kiện. Cần provider và feedback gửi thư; các chính sách gửi lại/lỗi còn OPEN-09.

## Decision

- Chọn **Resend** làm nhà cung cấp email giao dịch; tích hợp từ server qua API/SDK Node.js phù hợp
  stack TypeScript. Credentials không xuất ra Web/Mobile/Organizer hoặc prompt/trace Agent.
  **Notification Service** sở hữu tích hợp/chuyển phát theo
  [thiết kế bảy service](../05-specs/004-service-decomposition/spec.md), không đặt client gửi thư trong mọi service.
- Tận dụng **idempotency key khi gửi**, kết hợp định danh/trạng thái email bền vững trong ứng dụng;
  cùng logical message giữ key/request ổn định. Phân biệt retry do lỗi mạng với yêu cầu gửi email mới.
  Cửa sổ chống trùng của provider là **24 giờ**, không phải bảo đảm giao thư đúng một lần vô thời hạn.
- Nhận feedback qua **webhook có xác minh chữ ký**; giữ raw request body để xác minh, xử lý event
  trùng/không theo thứ tự và ghi nhận bền vững. API nhận yêu cầu, mail server nhận thư và người dùng
  đọc/thực hiện xác minh là các kết quả khác nhau.
- Provider chỉ chuyển email; Auth/Core tạo và xác minh bằng chứng theo nghiệp vụ. Hook gửi email
  của Better Auth tại Identity phải bảo toàn challenge–ý định gửi. Với email chứa mã bảo mật, dùng
  Claim Check đã duyệt: owner giữ payload mã hóa ngắn hạn và outbox tham chiếu, Notification lấy qua HTTPS
  xác thực; không plaintext mã/email/reset URL trong broker/DB queue/log/trace/DLQ. Không coi callback
  Better Auth là đã có transaction chung với outbox; deadline/retry/crypto cụ thể cần đặc tả/kiểm chứng.
- Chưa chọn gói dịch vụ, domain, region, template renderer, marketing/open-click tracking hoặc provider
  dự phòng. TTL/số chữ số mã, cooldown/quota gửi lại và ngoại lệ mất email còn theo OPEN-09/OPEN-06.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| **Resend** | Được chọn: Node SDK, native send idempotency 24 giờ và signed webhooks phù hợp theo dõi gửi/retry của stack hiện tại. Chưa chứng minh delivery nhanh/tốt hơn SES. |
| Amazon SES | Hợp lệ: API v2, IAM, configuration sets/events và đơn giá À la carte thấp. Cần production access/identity/quota theo region; send có thể đã thành công dù caller thấy lỗi, retry có thể tạo email thứ hai. Không loại vì độ phức tạp hoặc chi phí. |

## Consequences

- Khi triển khai cần xác minh domain/identity và DNS gửi thư phù hợp, theo dõi bounce/complaint,
  suppression và giới hạn API/account. Không ghi mã xác minh, reset URL hoặc API key vào log thường.
- BullMQ job dedupe/retry không tự bảo đảm provider chỉ nhận một lần; cần đối chiếu message state,
  provider email ID và idempotency window. Retry sau 24 giờ không được dựa riêng vào key Resend.
- Thiết kế durable handoff, thời hạn công việc và phản hồi khi hết quota/gửi lỗi. Tránh queue gửi mã
  đã hết hiệu lực hoặc tự thay đổi chính sách mã vì job bị chậm. Ghi nhận delivery tách khỏi giao dịch.
- Gửi email vé lỗi không làm mất hiệu lực vé Core đã phát hành hoặc đổi trạng thái thanh toán.
  Người dùng tra cứu kết quả hiện hành ở Core. Webhook email không là bằng chứng thanh toán/soát vé.
- Chỉ phần **nhà cung cấp email** của OPEN-09 được chốt tại đây; chính sách gửi lại/lỗi và kênh
  bổ sung ngoài email và hộp thông báo trong app vẫn mở. Chọn provider không xác nhận tích hợp runtime,
  inbox placement hoặc production readiness.

### Chi phí

Theo nguồn ngày 2026-11-17: Resend Free có **3.000 email/tháng, tối đa 100/ngày**; Pro
**20 USD/tháng gồm 50.000 email**, vượt tính **0,90 USD/1.000**. Paid plan không có daily plan cap
không đồng nghĩa bỏ mọi giới hạn API/account. Chưa chọn gói, không mặc định Free đủ tải thực tế.

Ví dụ **10.000 email/tháng, một người nhận/email**: Resend Pro khoảng **20 USD/tháng**;
SES À la carte khoảng **1 USD tiền gửi cơ bản** theo 0,10 USD/1.000, cộng data/add-ons nếu dùng.
Ví dụ chưa gồm thuế, domain/DNS, data/attachments, worker/DB/tracing và dịch vụ bổ sung; không
giả định tài khoản có AWS credits. Tên miền/host và lượng gửi chưa chọn nên chưa báo tổng hóa đơn.
Lựa chọn Resend dựa trên tích hợp/vòng đời gửi, không dựa vào gói Free; ADR không cấp quyền mua dịch vụ.

## References

- [Nghiên cứu email giao dịch](../99-notes/transactional-email-research.md).
- [Resend Node SDK](https://resend.com/docs/send-with-nodejs).
- [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys).
- [Resend webhooks](https://resend.com/docs/webhooks/introduction).
- [Xác minh webhook](https://resend.com/docs/webhooks/verify-webhooks-requests).
- [Resend domain](https://resend.com/docs/add-a-domain).
- [Resend pricing](https://resend.com/pricing.md).
- [SES pricing](https://aws.amazon.com/ses/pricing/).
- [SES send/error semantics](https://docs.aws.amazon.com/ses/latest/dg/send-email-concepts-process.html).

Nguồn/Context7 đối chiếu ngày 2026-11-17; chưa cài đặt, cấu hình domain/tài khoản hoặc gửi email kiểm chứng.

### Đối chiếu chính sách sau Q173

Q147–Q150 đã chọn hộp thông báo/email, chính sách thử lại có giới hạn/gửi lại theo quyền và cảnh báo;
Q163 đã chốt không thêm khôi phục tài khoản dự phòng khi mất hộp thư. Các chỗ “còn mở” về chính sách
ở bối cảnh nghiên cứu trước đây được đọc theo lựa chọn hiện hành tại mô hình sản phẩm; chỉ tham số,
gói/cấu hình, dữ liệu/pháp lý và kiểm chứng tích hợp còn chưa hoàn tất. Provider đã chọn không có nghĩa
đã gửi email/inference thành công. Đường email cảnh báo vận hành được thiết kế riêng theo [NFR-OPS-01](../05-specs/nfr/operations.md).
