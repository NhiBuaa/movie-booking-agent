# Notification Service (`services/notification-service`)

Thư mục định vị service theo thiết kế đã chốt; hiện chỉ có tài liệu, chưa có code hoặc runtime.
[Thiết kế microservices](../../docs/05-specs/004-service-decomposition/spec.md) sở hữu ranh giới;
[quyết định](../../docs/05-specs/004-service-decomposition/decisions.md) giữ lý do và nguồn duyệt.

## Trách nhiệm và dữ liệu

- Sở hữu mẫu/hộp thông báo trong app, yêu cầu chuyển phát, lịch sử/trạng thái gửi và retry có kiểm soát.
- Phối hợp nhà cung cấp email; không phát hành/xác minh OTP, mã khôi phục hoặc mã nghiệp vụ.
- Sở hữu database PostgreSQL logic riêng theo thiết kế; không chia sẻ ORM hoặc đọc SQL của service khác.

## Công nghệ đã chọn

Resend cho email giao dịch theo [ADR-0018](../../docs/06-decisions/0018-resend-for-transactional-email.md).
Notification sở hữu tích hợp provider, không chuyển trách nhiệm phát hành/xác minh mã khỏi Identity/Core.
Chưa chọn framework/ORM, SDK, gói/domain, cấu hình webhook hoặc gửi thư thật.

## Ranh giới tích hợp

Nhận sự kiện đã commit để chuyển phát; lỗi gửi không đảo ngược giao dịch/vé hợp lệ. Email có mã
bảo mật dùng Claim Check: luồng riêng chỉ mang tham chiếu, Notification lấy nội dung qua HTTPS
xác thực tới owner tin cậy. Owner giữ payload mã hóa có thời hạn, dữ liệu xác minh và ý định gửi
nguyên tử. Không lưu plaintext nhạy cảm trong database, queue, log, trace hoặc DLQ.
Luồng Kafka không chứa OTP, email người nhận, reset URL hoặc token; tham chiếu không là credential.
Retry không gia hạn/phát hành mã mới; có thể gửi trùng khi provider nhận nhưng mất phản hồi.
