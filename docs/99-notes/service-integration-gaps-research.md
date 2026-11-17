# Nghiên cứu ba ranh giới tích hợp service

Ngày đối chiếu: **2026-11-17**. Sau báo cáo nghiên cứu, chủ sản phẩm xác nhận “tôi đồng ý với 3 đề xuất
của bạn” trong hội thoại cùng ngày. Lựa chọn và đánh đổi được ghi tại bản quyết định; ghi chú này
giữ bằng chứng so sánh, không thay chủ sở hữu kiến trúc hoặc chứng minh runtime.
Đầu vào: [đặc tả](../05-specs/004-service-decomposition/spec.md),
[quyết định](../05-specs/004-service-decomposition/decisions.md),
[nghiên cứu nền](service-boundary-research.md) và [BR-16](../03-product/use-cases.md#4-quy-tắc-đã-thống-nhất).
Các bảng/khuyến nghị là **suy luận thiết kế**; giá trị định lượng và chi tiết hợp đồng chưa tự được chọn.

## 1. Catalog → Core: phiên bản phim khi lập suất

Microsoft phân biệt dữ liệu có thẩm quyền với bản sao và yêu cầu chọn mức nhất quán theo nhu cầu;
không đọc trực tiếp database service khác.
[Nguồn](https://learn.microsoft.com/en-us/azure/architecture/microservices/design/data-considerations).

| Phương án | Giá trị | Đánh đổi |
| --- | --- | --- |
| **A — HTTP lấy snapshot phiên bản đã công bố** | Core lấy dữ liệu trước transaction rồi lưu bản chụp cần cho suất; ít trạng thái đồng bộ. | Lập suất mới phụ thuộc Catalog; timeout không được tự coi phiên bản hợp lệ. |
| B — Sự kiện tạo bản sao cục bộ | Core lập suất từ bản sao khi Catalog gián đoạn. | Có trễ công bố/ngừng dùng; cần chống lặp, thứ tự, backfill và phục hồi. Kafka sẵn có không tự làm B phù hợp hơn. |
| C — Bản sao + HTTP kiểm tra khi lập suất | Giảm tải truyền nội dung, kiểm lại điều kiện tại nguồn. | Thêm hai đường dữ liệu; vẫn phụ thuộc Catalog nếu bắt buộc kiểm online. Cho dùng bản cũ khi lỗi cần chấp thuận độ trễ riêng. |

**A được chọn.** Hợp đồng phân biệt nội dung phiên bản bất biến với trạng thái còn được dùng cho
suất mới. Core gọi Catalog ngoài transaction DB, rồi kiểm điều kiện lịch/phòng và lưu snapshot bằng
transaction ngắn. Đặt/soát vé dùng dữ liệu Core đã chốt, không gọi Catalog theo từng giao dịch.

**Giới hạn:** bất biến không đồng nghĩa còn được phép dùng. Catalog có thể ngừng phiên bản sau
HTTP check nhưng trước Core commit. ETag chỉ kiểm điều kiện tại origin của request;
không tạo nguyên tử xuyên hai DB.
[RFC 9110 §13.1.1](https://www.rfc-editor.org/rfc/rfc9110.html#section-13.1.1).
Owner cần chốt chấp nhận mốc kiểm tra hay cần phối hợp mạnh hơn; chưa thiết kế thêm giao thức.
Snapshot không tự xử lý đính chính suất đã công bố.

## 2. Core → Community: căn cứ đủ điều kiện đánh giá

Core xác lập căn cứ **tài khoản đặt có vé phim đã soát**; Community bảo đảm một review/tài khoản/phim.
Không suy quyền riêng của người cầm QR hoặc tự tính quyền từ mọi sự kiện scan/refund.

| Phương án | Giá trị | Đánh đổi |
| --- | --- | --- |
| A — HTTP hỏi Core khi đăng | Căn cứ hiện hành tại lúc Core trả lời; ít dữ liệu dẫn xuất. | Core lỗi thì chưa xác minh được việc đăng; đọc/yêu thích có thể độc lập. Check và Community commit vẫn không nguyên tử. |
| B — Projection cục bộ từ Outbox/Kafka | Đăng từ căn cứ đã nhận khi Core lỗi. | Có cửa sổ positive cũ sau đính chính; thiếu lịch sử hoặc consumer trễ phải nhận biết được. |
| **C — Projection trước, HTTP khi chưa rõ** | Giữ đường đăng độc lập cho căn cứ cục bộ hợp lệ; truy vấn bù miss/gap. | Vẫn chịu stale-positive; HTTP không cứu được trường hợp chưa rõ khi Core cũng lỗi. |

**C được chọn:** owner đã chấp nhận nguyên tắc cửa sổ trễ đính chính/thu hồi có giới hạn, chưa chốt
độ dài/cách xác minh độ mới. Nếu yêu cầu thay thành không chấp nhận cửa sổ này, phải xét lại A và mất khả năng đăng khi
Core không đáp ứng; bảo đảm tuyệt đối tại Community commit vẫn cần phối hợp riêng.
CQRS không bắt buộc messaging; bản sao khác store có thể trễ.
[Nguồn](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs).

- **Có căn cứ:** kết luận có phiên bản do Core phát, còn trong chính sách độ mới và chưa có thu hồi
  đã biết. Mất liên lạc không tự kéo dài độ tin cậy.
- **Không đủ điều kiện:** kết luận Core có thẩm quyền tại mốc kiểm tra; projection chỉ chứng minh
  đến mốc bao phủ đã xác minh, không phải mọi thay đổi mới nhất.
- **Chưa rõ:** cache miss, backfill chưa xong, thiếu thứ tự hoặc quá cũ; gọi HTTP. Core lỗi thì
  chờ/từ chối riêng việc đăng, không biến thành “chưa xem” hoặc bỏ kiểm điều kiện.

Projection nhận kết luận tuyệt đối theo tài khoản–phim do Core tính, gồm đính chính/thu hồi;
không để correction một vé xóa căn cứ của vé khác. Chống lặp và cập nhật cùng transaction consumer;
HTTP fallback cũng có version và áp dụng cùng quy tắc để event cũ không ghi đè kết quả HTTP mới.
Version cũ đến sau không phục hồi quyền đã thu hồi. Outbox không loại duplicates/thứ tự sai.
[Nguồn](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html).

Backfill cần ảnh chụp có mốc, bàn giao sang luồng sự kiện không hở và watermark biểu thị phần đã
bao phủ; độ mới phải gắn quan sát tại Core, không chỉ broker lag hoặc giờ đọc cache.
Rebuild chỉ công bố bản hoàn chỉnh. Retention phải đủ cho phục hồi hoặc có nguồn tái dựng Core;
Kafka không mặc định giữ mọi lịch sử, tombstone cũng có hạn.
[Materialized View](https://learn.microsoft.com/en-us/azure/architecture/patterns/materialized-view),
[Kafka design](https://kafka.apache.org/41/design/design/#log-compaction).

Không tự xóa/thu hồi review cũ khi căn cứ đổi. Q102/Q103 ở worktree `docs-business-policies`
(đã đọc riêng, chưa coi đã hợp nhất) giữ quyền lợi hội viên cho soát thật khi rạp sự cố dù hoàn tiền;
không phải quyết định quyền review sau refund.

## 3. Identity/Core → Notification: email chứa mã bảo mật

| Phương án | Giá trị | Đánh đổi |
| --- | --- | --- |
| A — HTTPS xác thực, bàn giao trực tiếp | Ít đường truyền; kiểm quyền khi gọi. | Cần ý định gửi bền, mã hóa để phục hồi khoảng lỗi commit–send; sender phụ thuộc Notification lúc bàn giao. |
| **B — Claim-check qua sự kiện riêng** | Message chỉ mang tham chiếu; owner kiểm lại quyền lấy nội dung. | Owner lỗi làm chậm gửi; cần vòng đời payload và retry có kiểm soát. |
| C — Payload mã hóa trong topic riêng | Giảm phụ thuộc API lấy nội dung. | Thêm quản lý khóa/replay; không thu hồi tức thì payload đã cấp cho consumer. |

Claim-check tách payload khỏi message, giảm phơi lộ nhưng vẫn cần bảo vệ kho và quyền truy cập.
[Microsoft](https://learn.microsoft.com/en-us/azure/architecture/patterns/claim-check#problems-and-considerations),
[Enterprise Integration Patterns](https://www.enterpriseintegrationpatterns.com/patterns/messaging/StoreInLibrary.html).

**B được chọn:** owner giữ challenge/verifier, deliverable mã hóa ngắn hạn và outbox chỉ tham chiếu
trong cùng transaction khi tích hợp hỗ trợ. Outbox phát sự việc “nội dung gửi bảo mật đã được chuẩn bị”;
Notification nhận để tạo công việc thuộc mình, không nhận lệnh Kafka tùy ý.
Luồng riêng giới hạn quyền phát/nhận, chỉ chứa opaque reference, nguồn và mục đích;
không có OTP, email, reset URL hoặc token.
Tên sự kiện/topic chưa chốt; không mặc định mọi event đều qua BullMQ.
Notification gọi HTTPS xác thực qua danh sách nguồn tin cậy, không cross-SQL; reference không phải
quyền truy cập. Owner ràng buộc người nhận/mục đích/ngữ cảnh, kiểm hạn, mã bị thay thế hoặc thu hồi.
Luồng sự kiện và endpoint lấy nội dung chỉ cho các danh tính dịch vụ được phép; TLS bảo vệ đường
truyền, không thay ACL hoặc giới hạn ai được giải mã. Nội dung không đưa vào hộp thông báo thông thường.

Hash verifier không khôi phục được bí mật để gửi: cần payload mã hóa riêng, giữ ngắn và tách khóa
khỏi dữ liệu. Notification/provider phải thấy plaintext lúc gửi; phía nền tảng không lưu bí mật
plaintext vào queue, DB, log, trace hoặc DLQ. Không hứa bí mật đối với provider.
[OWASP recovery](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html),
[storage](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html),
[logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#data-to-exclude).

Fetch phải cho retry có giới hạn và chống xử lý lặp đến hạn; cơ chế truy xuất cụ thể chưa chọn.
Lấy payload không tiêu thụ challenge.
Retry chuyển phát không tạo mã mới/gia hạn. Owner vẫn quyết định chấp nhận mã;
owner gián đoạn thì không lấy được nội dung gửi, và việc xác minh mã vẫn phụ thuộc owner.
Kết quả provider chưa rõ có thể khiến cùng email được gửi lặp,
không hứa đúng một lần. Email đã giao provider có thể đến sau thu hồi; không bảo đảm thu hồi thư.
[SMTP timeout](https://www.rfc-editor.org/rfc/rfc5321.html#section-4.5.3.2.7).

Payload hết hạn/đã dùng/đã bị thay thế phải được ngừng phục vụ và dọn, gồm bản sao mã hóa phục vụ gửi;
metadata
audit có thể giữ mà không giữ secret. Retention/backups/CDC không được làm mã đã hết hiệu lực sống lại.

Callback Better Auth chưa chứng minh custom outbox và challenge commit nguyên tử; cần kiểm chứng
tích hợp khi triển khai, không suy bảo đảm đó từ callback.
[Tài liệu](https://better-auth.com/docs/authentication/email-password),
[source](https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/api/routes/password.ts).

Chưa chọn TTL, schema, endpoint, thuật toán/khóa hoặc cấu hình; chưa chạy code, provider hay runtime.

## Các đánh đổi đã được chấp thuận

- Catalog: lấy snapshot qua HTTP tại mốc lập/công bố suất; không hứa kiểm tra phiên bản vẫn hợp lệ
  nguyên tử với transaction Core. Trường hợp ngừng phiên bản/đính chính cần hợp đồng trách nhiệm riêng.
- Community: projection trước, HTTP khi chưa rõ; chấp nhận căn cứ dương tính cũ trong cửa sổ trễ
  đính chính có giới hạn, chưa chọn giá trị. Không thể dùng bản sao khi mất liên lạc vừa biết mọi thu hồi ngay.
- Email bảo mật: Claim-check giữ bí mật ngoài broker, chấp nhận owner/API lấy nội dung là phụ thuộc
  lúc chuyển phát. Tích hợp phải đóng khoảng lỗi lưu challenge–ý định gửi; không coi callback là đủ.
