# Data model — A-03 (plan v0.3.0, chưa triển khai)

Nguồn hành vi: [spec](spec.md), [chuẩn mật khẩu v0.2.0](../../04-standards/password-policy.md).
Giá trị phiên/rate/hash theo [plan v0.3.0](plan.md), kế thừa bản đã dùng chia tasks và cách tính thử sai được đồng ý bổ sung. Đây là thiết kế, không phải DDL/migration đã chạy.

## Chủ dữ liệu và mapping

Identity sở hữu PostgreSQL logic riêng. Đề xuất dùng schema Better Auth 1.7.26 sinh từ cấu hình
đã pin, map qua Drizzle; không copy nguyên DB draft hoặc sửa database của service khác.
ID nội bộ đề xuất UUID v4 không tiền tố, dài 36 ký tự; API coi userId/sessionId là định danh opaque,
không suy quyền từ format. Điều này hòa giải lỗi prefix `usr_` + UUID dài hơn cột 36 của draft.

| Entity / trường tối thiểu | Ràng buộc / mục đích |
|---|---|
| User.id | PK, immutable; nguồn subject cho mọi kênh |
| User.email | Unique theo quy tắc canonical email của Identity; chỉ trim ngoài/lowercase email, không áp cho mật khẩu; giá trị hiển thị giữ riêng nếu cần |
| User.emailVerified | Boolean, false không cấm login; true là điều kiện giữ/mua ở biên nghiệp vụ |
| User.name | Dùng hiển thị danh tính tối thiểu, không là bằng chứng owner |
| User.status | Đề xuất `ACTIVE`, `PENDING_CLOSURE`, `LOCKED`, `DELETED`; server-owned, client không được ghi qua A-03 |
| Account.id/userId/providerId/accountId | Better Auth-owned mapping; credential account dùng `providerId=credential`, `accountId=user.id`, FK nội bộ tới User; không hiểu accountId luôn là email |
| Account.password | Text có version-tag và hash; không plaintext. Format mới `pwd2-nfc:` + PHC Argon2id; hàm verify dispatch đúng format/normalization |
| Account.passwordCompromisedAt | Nullable timestamp/evidence flag server-owned; có bằng chứng thì không cấp phiên mới. A-03 không thêm API công khai để gắn/xóa flag |
| Session.id/userId/token | Theo schema library; userId FK nội bộ. Token opaque đủ entropy do thư viện cấp, unique; không dùng email hoặc ID client đưa vào |
| Session.createdAt/updatedAt/expiresAt | Thời gian UTC, effective expiresAt = min(idleDeadline, absoluteDeadline) |
| Session.mode | Additional field server-only `STANDARD` hoặc `REMEMBERED`, immutable trong phiên, lấy từ lựa chọn rememberMe đã validate lúc login |
| Session.absoluteExpiresAt | Additional field server-only, cố định từ lúc tạo phiên theo mode; không kéo dài khi touch |
| Session.lastActivityAt | Additional field server-only, chỉ cập nhật qua đường hoạt động hợp lệ, không từ client timestamp |
| Session.idleExpiresAt | Additional field server-only, theo hoạt động cuối và mode; không vượt absolute deadline |

Các trường schema Better Auth khác mà adapter cần được giữ với nullability/mapping theo output
đã kiểm, kể cả khi feature chưa dùng. Không công bố OAuth/MFA/reset chỉ vì có cột liên quan.
Không dùng `revoked_at` của draft như thể thư viện tự kiểm; cấu hình này chọn xóa/expire row phiên
ở PostgreSQL, không cookie cache/secondary store. Thêm storage/cache sau là thay đổi cần review lại thu hồi.

## Chuyển trạng thái

| Trước / sự kiện | Sau / bảo đảm |
|---|---|
| Chưa có phiên + credential đúng, account cho phép, chưa bị rate-limit | Tạo Session cùng metadata policy; không tự xác minh email/cấp vai trò. Insert policy fields cùng row, không để phiên usable thiếu deadline |
| Credential sai hoặc password compromised | Không tạo phiên; response public không phân biệt tài khoản tồn tại/sai mật khẩu/khóa |
| ACTIVE hoặc PENDING_CLOSURE + activity/touch hợp lệ trước hạn | UPDATE có điều kiện lastActivity/idle/effective expiry; giữ mode/absolute; 0 row updated thì không khôi phục phiên. PENDING_CLOSURE vẫn không được giữ/mua mới |
| Hết idle/absolute hoặc account không cho phép | Không xác thực ở private API; expired khác outage, cleanup row không là điều kiện mới để từ chối |
| Logout được nguồn máy chủ xác nhận | ENDED, không dùng lại/cấp lại từ phiên đó; không ảnh hưởng phiên độc lập |
| Logout gặp lỗi đọc/xóa/kiểm nguồn | LOGOUT_UNCONFIRMED; local privacy locked, credential chỉ phục vụ retry; không biến lỗi thành ENDED |
| Login B sau A | State/cache generation mới; phản hồi A không gắn vào B, auth mutation serialize; cookie race phải được kiểm riêng |

Query chỉ đọc session không gia hạn. Thư viện refresh tự động tắt; touch là UPDATE không upsert,
kiểm row chưa hết hạn trong cùng thao tác DB để race logout/expiry không làm sống lại phiên.
Nguồn thời gian phía máy chủ; test điều khiển clock hoặc timestamp fixture, không lấy thời gian client.

## Rate counters (dữ liệu tạm của Identity)

Redis keys gồm purpose + HMAC canonical identifier hoặc IP bằng secret ổn định dùng chung các replica.
Không lưu password/raw email/raw IP trong key hoặc log. Atomic increment/window/cooldown, TTL tối đa
1 giờ theo đề xuất plan; Redis không là authority session hoặc evidence quyền. Secret thiếu phải báo cấu hình,
không tạo key khác nhau mỗi process khiến bypass giới hạn dùng chung.

Window sai theo email, cooldown không trượt theo yêu cầu bị từ chối và reset bởi login đúng trước ngưỡng
theo plan §4. Counter IP độc lập; reset email không reset IP. Lưu thời điểm bằng clock server và thao tác
prune/count/đặt hạn atomic. Hết TTL counter không được làm thay đổi thời hạn hoặc quyền phiên PostgreSQL.

## Phạm vi dữ liệu ở BFF mô phỏng

- Hold internal record: ownerUserId bắt buộc; quy tắc một hold còn hạn nhóm theo ownerUserId.
- Order internal record: ownerUserId lấy từ hold đã kiểm cùng AuthContext, không từ CreateOrderRequest.
- Ticket lookup/payment intent/release: tìm owner của record rồi so với subject bắt buộc; thiếu owner/không tìm được order phải fail closed.
- Email vẫn có thể là snapshot liên hệ được xác thực, không là khóa quyền. Không tự map owner của bản ghi có email trùng hoặc nhận `x-user-email` như userId.
- Public contracts A-03 ở `packages/contracts/src/auth/`; metadata owner/persistence giữ nội bộ service/adapter, không xuất ORM schema vào contracts.

## Native và dữ liệu riêng tư

STANDARD dùng kho phiên trong bộ nhớ; REMEMBERED dùng SecureStore. SDK/UI snapshot không là bằng chứng server.
Logout/switch-account tăng generation, khóa/xóa private cache và credential đúng scope; pending logout không được
phục hồi UI private khi app mở lại. Nếu có cache QR thử, khóa hoặc xóa cả quyền đọc/key liên quan của tài khoản cũ,
không chỉ xóa tên khỏi màn hình. Không quyết định retention/backup/reinstall hoặc quyền offline-expiry của B-07.

## Qualification dữ liệu trước triển khai

Đối chiếu generated schema/adapter với version pin; kiểm enum/field mapping, unique indexes và khả năng atomic.
Fixtures gồm hai tài khoản ACTIVE (verified/unverified), PENDING_CLOSURE, LOCKED/DELETED và password-compromised.
Legacy fixtures nhận diện rõ format/cơ chế đã lưu. Unknown format hoặc owner chỉ có email chặn adoption/cutover,
không tự sửa dữ liệu hoặc tạo migration ngoài quyền. Hiện chưa có DB Identity runtime được xác nhận.

Mỗi legacy fixture có manifest của profile xác minh: nhận diện format, phiên bản/cơ chế, quy tắc chuẩn hóa,
giới hạn đầu vào và nguồn vectors; dữ liệu chưa nhận diện không được nhận như một profile mặc định.
Người triển khai lập manifest ở T009/T011/T013 bằng dữ liệu thử đã được phép, không lấy mật khẩu thật.
Giới hạn đầu vào chưa biết chặn adoption profile đó, không cắt chuỗi hoặc áp ngưỡng tạo mới để cho qua.

Migration T005/T006 chạy riêng bằng credential của Identity trong DB test được định danh, không tự chạy
khi app khởi động hoặc trên DB daily. Với bước DDL transactional, lỗi phải rollback transaction; với bước
không rollback được, dừng và khôi phục DB test từ snapshot/seed đã sở hữu trước khi thử lại, không tự áp
down migration phá dữ liệu. T010 kiểm trước/sau lỗi và yêu cầu schema đủ trước cấp phiên. Cutover dữ liệu
thật, backup và phương án phục hồi production nằm ngoài quyền hiện tại, phải được giao riêng.
