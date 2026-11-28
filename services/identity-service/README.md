# Identity & Access Service (`services/identity-service`)

Thư mục định vị service theo thiết kế đã chốt; hiện chỉ có tài liệu, chưa có code hoặc runtime.
[Thiết kế microservices](../../docs/05-specs/004-service-decomposition/spec.md) sở hữu ranh giới;
[quyết định](../../docs/05-specs/004-service-decomposition/decisions.md) giữ lý do và nguồn duyệt.

## Trách nhiệm và dữ liệu

- Sở hữu tài khoản, xác thực/xác minh email, phiên, khóa tài khoản và cấp/thu hồi vai trò/phạm vi rạp.
- Phát hành/xác minh mã thuộc luồng danh tính; Notification chỉ chuyển phát nội dung được phép gửi.
- Sở hữu database PostgreSQL logic riêng theo thiết kế; không chia sẻ ORM hoặc đọc SQL của service khác.

## Công nghệ đã chọn

Better Auth với form đăng nhập trực tiếp, session và hướng JWT ký bất đối xứng/JWKS cho API theo
[ADR-0008](../../docs/06-decisions/0008-better-auth-with-direct-login.md). Session quản lý đăng nhập;
JWT không thay kiểm quyền tài nguyên hoặc bảo đảm quyền vẫn hiện hành. Identity giữ dữ liệu Auth
trong database PostgreSQL riêng, không dùng chung bảng/migration Core.
[NFR-SEC-01](../../docs/05-specs/nfr/security.md) quy định MFA, thời hạn phiên và hành vi thu hồi.
Framework/ORM triển khai Identity, chi tiết hợp đồng và luân chuyển khóa còn mở.
Không cấp Agent credential giao dịch rộng hoặc token giả danh mọi khách; chưa tích hợp runtime.

## Ranh giới tích hợp

Service sở hữu tài nguyên tự kiểm quyền nghiệp vụ. Core kiểm bằng chứng quyền cục bộ cho soát/giao
combo thường xuyên, áp dụng thu hồi đã biết; tác vụ rủi ro cao cần quyền hiện hành. Điều kiện tiếp tục
soát khi Identity gián đoạn và trần hiệu lực quyền theo thiết kế, không cho phép soát thiếu Core.
Tra cứu công khai/webhook thanh toán không phụ thuộc phiên khách hoặc gọi Identity mỗi lượt.
Email chứa mã bảo mật dùng Claim Check qua luồng riêng; không đưa mã plaintext vào broker.
