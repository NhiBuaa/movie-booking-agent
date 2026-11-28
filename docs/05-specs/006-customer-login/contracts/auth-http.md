# HTTP contract — A-03 (plan v0.3.0, chưa triển khai)

Owner Auth là Identity & Access. Public DTO/schema nguồn sau triển khai ở `packages/contracts/src/auth/`;
ORM/hash nội bộ không xuất qua contracts. Cơ chế/tham số theo [plan v0.3.0](../plan.md), gồm cách tính thử sai đã được đồng ý; [spec](../spec.md)
và [policy](../../../04-standards/password-policy.md) giữ hành vi. Chưa có endpoint được triển khai bởi tài liệu này.

## Bề mặt và protocol

| Method / path logic | Input / kết quả |
|---|---|
| POST `/api/auth/sign-in/email` | `{email: string, password: string, rememberMe: boolean}`. Chỉ các trường này, không userId/role/status/deadline. Body JSON tối đa 16 KiB theo plan, email canonical tại server, password giữ theo policy đúng phiên bản |
| GET `/api/auth/get-session` | Đọc authoritative, no-store và không touch/refresh. Có phiên: snapshot; thiếu/hết/sai: null/unauthenticated theo surface. Outage khác null |
| POST `/api/auth/session/touch` | Body rỗng; credential phiên hiện tại, activity hợp lệ. Cập nhật deadline có điều kiện; trả snapshot mới hoặc 401 nếu phiên đã hết |
| POST `/api/auth/logout-current` | Body rỗng, không nhận token/sessionId target. Kết thúc đúng phiên logic hiện tại và kiểm hậu điều kiện |

Web BFF công bố allowlist trên và dùng `ApiResponse<AuthSnapshot>`/error envelope hiện có cho app Web.
Proxy tới Identity là URL/method cố định; forward đúng cookie và từng Set-Cookie, không nối header bằng dấu phẩy.
Không dùng generic requestJson giải mã response raw SDK như cùng một envelope.

Native SDK giữ protocol sign-in/get-session đã pin của Better Auth/Expo; app adapter map kết quả sang
AuthSnapshot chung. Credential trong protocol SDK chỉ nằm lớp Auth/kho bí mật, không vào UI model/analytics.
Custom API requests dùng Cookie từ SDK theo integration upstream và credentials omit; không mở raw token cấp cho
Core/Agent trong A-03. Endpoint logout-current/touch là contract dự án; SDK/raw `/sign-out` không là chứng cứ ENDED.

Signup, password-change/reset, social/OTP/MFA, list/revoke-all/revoke-other và quản trị bị chặn ở surface A-03.
Cơ chế revoke một session chỉ do endpoint logout-current gọi nội bộ với target lấy từ server; client không được gọi trực tiếp.

## Public snapshot

| Trường | Kiểu / giới hạn |
|---|---|
| user.id | Opaque stable string, không lấy từ email |
| user.email/name | Dữ liệu tối thiểu của chính tài khoản; không trả password/hash hoặc hồ sơ giao dịch |
| user.emailVerified | Boolean; false vẫn login được, không là quyền giữ/mua |
| user.accountStatus | Enum theo data model, server-owned; chỉ trả cho phiên của chính tài khoản |
| session.id | Định danh phiên không tự là credential; không dùng một mình để xác thực |
| session.mode | STANDARD/REMEMBERED, do server ghi lúc tạo |
| session.expiresAt/absoluteExpiresAt | ISO UTC, effective/server time, chỉ để UI diễn đạt; client không được kéo dài |

Không public `accessToken`/`refreshToken` chỉ để giữ type AuthSessionDto cũ. Chuyển caller A-03 sang snapshot;
không xóa type dùng ngoài phạm vi nếu chưa kiểm caller. Web JavaScript không nhận Cookie/token dạng plaintext trong body.

## Kết quả và lỗi

| HTTP / code | Ngữ nghĩa |
|---|---|
| 200 | Login/session/touch có kết quả đã xác minh; không là xác nhận tiền/vé |
| 200 + logout state ENDED | Có credential phù hợp và nguồn máy chủ đã xác nhận không còn phiên hiệu lực; không suy mọi JWT ở service khác đã thu hồi |
| 200 + logout state NO_VALID_LOCAL_CREDENTIAL | Không có credential hợp lệ ở app/request; chỉ kết luận kết thúc cục bộ, không tuyên bố đã xóa một phiên từ xa |
| 400 BAD_REQUEST | JSON/shape/format không hợp lệ, không phát lộ account |
| 401 INVALID_CREDENTIALS | Login sai, account không được dùng hoặc password compromised; cùng status/message public để tránh enumeration |
| 401 UNAUTHENTICATED | Private request/touch thiếu/sai/hết phiên, khác outage |
| 403 FORBIDDEN / EMAIL_VERIFICATION_REQUIRED / ACCOUNT_ACTION_RESTRICTED | Phiên hợp lệ nhưng không được hành động; tự kiểm owner/state ở API, không chỉ ẩn UI |
| 413 PAYLOAD_TOO_LARGE | Body vượt cap, không cắt rồi xác thực phần còn lại |
| 429 AUTH_RATE_LIMITED / AUTH_BUSY | Counter/công suất Auth chạm ngưỡng đề xuất, Retry-After; không đổi thành sai mật khẩu |
| 503 AUTH_UNAVAILABLE | Identity/DB/limiter bắt buộc không đáp ứng; không lấy mock profile hoặc email header làm fallback |
| 503 LOGOUT_UNCONFIRMED | Chưa đủ chứng cứ kết thúc server, khóa private UI và cho retry logout an toàn |

GET get-session của native giữ null/shape theo protocol SDK pin; BFF Web normalize về envelope public và
không coi HTTP lỗi/timeout như null. Route/status của hợp đồng này phải kiểm contract tests, không suy TypeScript types tự đủ.

AUTH_RATE_LIMITED tuân plan §4: lần sai thứ 5 trong 15 phút gần nhất bắt đầu chờ 15 phút;
request trong lúc chờ không kéo dài hạn. Login đúng trước ngưỡng chỉ xóa bộ đếm sai của email,
không xóa counter IP. Retry-After là thời gian chờ còn lại do server tính; client không tự bỏ chờ.
400/413/503 và AUTH_BUSY không được tính như credential sai; trần IP vẫn độc lập khi counter khả dụng.

## Các điều kiện an toàn HTTP

- TLS ngoài local; cookie Web HttpOnly/Secure ở HTTPS, host-only, Path đúng config và SameSite theo topology được duyệt. Không wildcard Domain để giải quyết lỗi proxy. Local HTTP chỉ cho loopback/test với cấu hình riêng, không production fallback secret.
- Unsafe Web requests: exact Origin allowlist, JSON; preflight origin lạ bị chặn. Native custom fetch có origin/scheme marker đã cấu hình; marker không là bằng chứng identity. Có Origin Web sai thì không được bỏ qua bằng cách gắn marker native.
- BFF/Identity custom routes tự kiểm origin/CSRF; gọi auth.api nội bộ không tự nhận bảo vệ của auth.handler. Credential xác minh độc lập header loại client.
- No-store cho login/session/logout và private snapshots; không đưa token vào URL/Referer/trace. Logger library được lọc trước ghi, giữ chỉ code/thời gian/bước.
- Chẩn đoán được lưu/xuất phải theo plan §5.1 và NFR-PRIV-01; chưa đủ redaction, tự xóa hoặc quyền thì không bật thu thập chi tiết.
- Session lookup/touch không chấp nhận client timestamps hoặc tùy chọn query để tắt kiểm. Chặn query override disable-cache/refresh từ caller; server chọn chính sách nghiêm ngặt.
- Đích sau login chỉ app Customer hiện tại và route cho phép; loại URL ngoài, vòng login và params vượt quyền. Native không nhận cookie/secret trong deep link.

## AuthContext cho API BFF và owner

API private tạo AuthContext từ Identity authoritative: userId/sessionId/email/emailVerified/accountStatus.
Bỏ định danh caller trong header/body khỏi căn cứ xác thực; không cho missing owner bỏ qua kiểm.
Tạo hold/new order/payment mutation kiểm ACTIVE + emailVerified và owner; đọc vé cũ/hủy hold chính chủ
không là mua mới, vẫn cần phiên và owner hợp lệ theo plan §1. HTTP 403 không được kèm dữ liệu đơn/vé
người khác hoặc có side effect trước từ chối.
API public/webhook giữ hợp đồng hiện có, độc lập cookie khách.

## Logout, đồng thời và retry

Đọc server trực tiếp với cookie gốc, tắt cookie cache/refresh; không dùng helper biến lỗi DB thành null.
Revoke đúng token từ server context, kiểm lại cookie gốc trước ENDED. Row đã hết hạn được coi không còn phiên
hiệu lực, không phải chứng minh row đã được cleanup. DB lỗi không trả ENDED. Retry cùng logout là idempotent,
không cấp phiên mới, không revoke phiên độc lập và không replay lệnh nghiệp vụ.

Serialize mutation Auth trong app; Web phối hợp tab cùng phiên. Qualification phải kiểm late Set-Cookie khi login B
đồng thời logout A; chỉ generation guard ở React chưa đủ chặn cookie response cũ. Dùng khóa Auth theo origin/tab
qua Web Locks khi hỗ trợ và kiểm trên browser matrix; nếu thiếu cơ chế bảo đảm, chưa nghiệm thu nhánh race,
không âm thầm hạ SC hoặc nhận UI state là session thật. Khi mismatch, khóa snapshot và xác minh lại thay vì hiện người trước.

## Ranh giới service độc lập

Đây là contract bridge BFF/Identity cho hiện trạng. Chưa có issuer/audience/TTL/JWKS endpoint dành cho Core/Agent
độc lập được triển khai ở A-03. Khi tách runtime phải đặc tả hợp đồng JWT/revocation trước sử dụng; không forward
cookie/session rộng sang Agent, không coi x-user-email là bridge tương đương, không claim đã đạt xác thực service độc lập.
