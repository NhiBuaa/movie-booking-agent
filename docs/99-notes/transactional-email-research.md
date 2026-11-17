# Email giao dịch: Resend hay Amazon SES?

Tra cứu 2026-11-17. **Ghi chú nghiên cứu, không phải nguồn quyết định.**
Chủ sản phẩm đã chọn Resend tại [ADR-0018](../06-decisions/0018-resend-for-transactional-email.md).
Các đề xuất bên dưới giữ bối cảnh lúc nghiên cứu; ADR sở hữu lựa chọn hiện hành. Gói/region chưa chọn, chưa triển khai.
Đích: worktree `docs-tech-stack-decisions`, detached HEAD `8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.
Chỉ đọc nguồn chính thức/code; không tạo tài khoản, sửa DNS, gửi email, cài SDK hoặc thay source/ADR.

## Phạm vi nghiệp vụ và tích hợp

[Use cases](../03-product/use-case-descriptions.md): A-02 xác minh email, A-05 khôi phục mật khẩu,
B-06 gửi vé, R-07 thông báo hủy suất, O-02 mã xác minh khi thiếu QR, L-06 thông báo giao dịch.
Chọn provider **không chốt** số chữ số/TTL mã, quota/cooldown gửi lại hoặc các ngoại lệ OPEN-09/OPEN-06.
Email lỗi không biến vé đã xác nhận thành chưa thanh toán; Core vẫn sở hữu vé/giao dịch và người dùng tra cứu trạng thái hiện hành.

Cả hai có API/SDK Node.js phù hợp adapter server TypeScript trong hướng NestJS/BullMQ; không đưa credentials vào client.
Better Auth có `sendVerificationEmail` và `sendResetPassword` hooks; provider chỉ chuyển email,
không thay Auth/Core tạo và xác minh bằng chứng. Việc dùng link hay OTP cho từng mục đích còn phải đặc tả.
[Resend Node SDK](https://resend.com/docs/send-with-nodejs), [SES v2 API](https://docs.aws.amazon.com/ses/latest/APIReference-V2/API_SendEmail.html),
[Better Auth hooks](https://better-auth.com/docs/authentication/email-password).
Hooks/job worker cần durable handoff, deadline và lỗi gửi được thiết kế rõ; tránh giữ request chờ delivery hoặc fire-and-forget làm mất task.
Không coi BullMQ retry/dedupe tự chứng minh email chỉ tới một lần; chưa thiết kế thêm luồng fallback provider.

## Hai phương án

| Tiêu chí | A. Resend | B. Amazon SES |
|---|---|---|
| Tích hợp vận hành | API/Node SDK, dashboard email/events, signed webhooks; native idempotency key cho send. | API v2/AWS SDK, IAM, verified identities/region, configuration sets và event destinations như SNS. |
| Chống gửi trùng | Cùng key/request trong **24 giờ** trả cùng kết quả, không gửi thêm; cần key ổn định theo logical message. | Tài liệu ghi có thể đã nhận thư dù caller thấy lỗi; retry có thể gửi thư thứ hai với MessageId khác. |
| Feedback | Delivery, delayed, bounced, complaint… qua webhook; cần verify signature/raw body và dedupe events. | Delivery/bounce/complaint… qua event publishing; nếu SNS→HTTPS phải verify SNS signature và TopicArn. |
| Điều kiện gửi thật | Domain sở hữu đã xác minh, DNS đúng, quota/API/account limits. | Mặc định sandbox theo region; cần production access để gửi tới người nhận chưa xác minh, quota thực tế riêng. |
| Điểm phù hợp | Native send idempotency và giao diện theo dõi giúp xử lý vòng đời email trong stack hiện tại. | Hợp nếu chọn vận hành AWS/IAM/event infrastructure hoặc cần kiểm soát hệ thống gửi theo region/quota. |

Nguồn: [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys), [webhooks](https://resend.com/docs/webhooks/introduction),
[Resend signature](https://resend.com/docs/webhooks/verify-webhooks-requests), [SES send/error semantics](https://docs.aws.amazon.com/ses/latest/dg/send-email-concepts-process.html),
[SES SNS events](https://docs.aws.amazon.com/ses/latest/dg/event-publishing-retrieving-sns.html), [SNS signatures](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html), [SES IAM](https://docs.aws.amazon.com/ses/latest/dg/control-user-access.html).

Resend key hết 24 giờ không còn đủ để dedupe vô thời hạn; application cần lưu logical message/status/provider ID,
phân biệt gửi lại do network retry với yêu cầu gửi email mới. SES có message tags để correlate khi MessageId chưa nhận được;
không hứa tự xử lý hết khoảng trống “provider đã nhận nhưng app chưa ghi nhận”. Không bên nào được coi là exactly-once delivery.
Resend retry webhook theo backoff, có replay; SNS có retry policy theo protocol và có thể hết hạn rồi bỏ event nếu không có DLQ.
Xác minh rồi ghi nhận bền vững trước acknowledgement; xử lý event lặp/out-of-order và bounce/complaint riêng với trạng thái thanh toán.
[Resend retry reference](https://github.com/resend/resend-skills/blob/main/skills/resend/references/webhooks.md), [SNS retries](https://docs.aws.amazon.com/sns/latest/dg/sns-message-delivery-retries.html).
API accepted, delivered-to-mail-server và người dùng đọc email là các trạng thái khác nhau; không suy inbox placement hoặc OTP đã được nhập.

## Domain, sandbox và tiền

Với hướng gửi từ domain dự án, cả hai cần xác minh identity/domain và DNS phù hợp: SPF, DKIM, DMARC/alignment; custom MAIL FROM khi cần cho SES.
Domain registration/DNS là khoản riêng, không được provider email tự cấp miễn phí. Chưa mua/chọn domain hoặc mức DMARC enforcement.
[Resend domain setup](https://resend.com/docs/add-a-domain), [SES SPF/DKIM/DMARC](https://docs.aws.amazon.com/ses/latest/dg/send-email-authentication-dmarc.html).
SES sandbox: **200 messages/24 giờ, 1 message/giây**, chỉ verified recipients/domains hoặc mailbox simulator;
production access và quota là theo region, vẫn phải verify sending identities. [Sandbox](https://docs.aws.amazon.com/ses/latest/dg/request-production-access.html), [quotas](https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas.html).

| Giá công khai | Resend transactional | SES À la carte |
|---|---|---|
| Free/ưu đãi | Free: **3.000 emails/tháng, tối đa 100/ngày**, không overage; không đủ 10.000/tháng. | AWS có credits Free Tier cho tài khoản đủ điều kiện; không giả định tài khoản có credits hoặc quota miễn phí cố định. |
| Trả phí | Pro **20 USD/tháng gồm 50.000**, vượt **0.90 USD/1.000**; không daily plan cap nhưng vẫn có rate/account limits. | Base outbound **0.10 USD/1.000**, thêm **0.12 USD/GB dữ liệu gửi** theo bảng; add-ons/services tính riêng. |
| Ví dụ **10.000 email/tháng**, một người nhận/email | **20 USD/tháng** theo Pro 50K, chưa chọn gói. | **1 USD/tháng base sending**, chưa cộng data hoặc chọn add-on. |

Nguồn: [Resend pricing](https://resend.com/pricing.md), [SES pricing](https://aws.amazon.com/ses/pricing/).
Ví dụ bỏ credits, thuế, domain, attachments/data, dedicated IP/deliverability add-ons, SNS/CloudWatch, worker/DB/tracing và traffic;
đây không phải hóa đơn trọn hệ thống. SES còn có bundle plans; bảng dùng À la carte để minh bạch base, không mặc định chọn bundle.
SDK nguồn mở không làm managed email service miễn phí. Giá có thể đổi; chưa xem quyền/quota tài khoản hoặc đo chất lượng giao thư.

## Nhận định để cùng chọn

**Nghiêng Resend** cho tích hợp hiện tại vì native idempotency 24 giờ, Node SDK và signed events thuận lợi cho xử lý gửi/retry;
không vì gói Free hoặc giả định delivery tốt hơn. SES vẫn là lựa chọn mạnh nếu chủ động chọn AWS operations/event integration;
không loại SES vì nhiều bước cấu hình. Chi phí được công khai, không dùng làm bộ lọc ưu tiên.
Sau khi chọn vẫn cần đặc tả resend/expiry/suppression, nội dung và webhook lifecycle; không ghi OTP/reset URL/API keys vào log thường.
Chưa đóng toàn bộ OPEN-09, thay chính sách sản phẩm, chọn marketing/tracking hoặc chứng minh delivery/runtime.
