# Nghiên cứu ranh giới dịch vụ Movie Booking Platform

Ngày đối chiếu nguồn: 2026-11-17. Đây là ghi chú nghiên cứu không có thẩm quyền thay cho đặc tả,
ADR hoặc mô hình nghiệp vụ. Nguồn ngoài trình bày nguyên tắc; các đánh giá áp dụng cho repository
bên dưới được ghi rõ là suy luận thiết kế, chưa phải bằng chứng triển khai hay đo hiệu năng.

## Đầu vào đã chốt

Lựa chọn trong hội thoại hiện tại được sở hữu bởi
[đặc tả phân tách dịch vụ](../05-specs/004-service-decomposition/spec.md): hướng B giữ Cinema Core
làm chủ ghế, hold, đơn, xác nhận thanh toán và quyền vé; Agent là dịch vụ riêng. Bản đồ bảy dịch vụ
đã được duyệt và được sở hữu bởi đặc tả trên. Mục tiêu portfolio kiến trúc phân tán đã được xác nhận;
không dùng chi phí tiền hoặc nguồn nhân lực làm tiêu chí loại kiến trúc.

[AGENTS.md](../../AGENTS.md), [PROJECT-OVERVIEW.md](../../PROJECT-OVERVIEW.md) và
[CONTEXT.md](../../CONTEXT.md) giữ ranh giới an toàn và bối cảnh repository. Nghiên cứu không suy
sự hiện diện của scaffold hoặc tài liệu thành giao dịch đã vận hành. Các lựa chọn công nghệ ở bản làm
việc tài liệu khác không được sao chép hay coi là đã hợp nhất vào bản này.

## Bằng chứng từ nguồn sơ cấp

### Chọn ranh giới theo nghiệp vụ và tính nhất quán

Microsoft hướng dẫn bắt đầu từ năng lực nghiệp vụ và mô hình miền, tránh chia dịch vụ theo các lớp
kỹ thuật như truy cập dữ liệu hoặc messaging. Bounded context là phạm vi áp dụng một mô hình nghiệp vụ;
cùng một thực thể ngoài đời có thể có mô hình khác nhau giữa các bối cảnh.
[Nguồn: Domain analysis](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis).

Khi chuyển từ mô hình miền sang dịch vụ, cần xét cohesion, coupling, yêu cầu phi chức năng và tính
toàn vẹn dữ liệu. Quá nhiều lời gọi qua lại hoặc phải triển khai đồng thời là dấu hiệu cần xem lại
ranh giới. Có trường hợp nên nhóm chức năng vào một dịch vụ để giữ nhất quán; khi chưa rõ, Microsoft
khuyên bắt đầu với dịch vụ lớn hơn rồi tinh chỉnh.
[Nguồn: Microservice boundaries](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/microservice-boundaries).

### Tách dữ liệu làm phát sinh bài toán phối hợp giao dịch

Saga phối hợp một chuỗi giao dịch cục bộ giữa các dịch vụ, dùng hành động bù trừ khi cần. Nó không
cung cấp isolation xuyên dịch vụ tự động. Bù trừ có thể thất bại; cần theo dõi trạng thái, xử lý lỗi
tạm thời và chống lặp. Hành động bù trừ không phải rollback nguyên tử của toàn bộ luồng.
[Nguồn: Saga pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga).

### Outbox giải quyết dual write, không thay cho chống lặp

Ghi thay đổi nghiệp vụ và sự kiện vào cùng database transaction giải quyết khoảng lỗi giữa commit
dữ liệu và phát thông báo. Consumer vẫn có thể nhận sự kiện lặp; giao dịch trải qua nhiều kho dữ liệu
vẫn cần cơ chế phối hợp riêng.
[Nguồn: Transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html).

Khóa chống lặp cần được giữ qua retry. Ghi nhận khóa và thay đổi nghiệp vụ phải có kiểm soát nguyên tử
hoặc cạnh tranh phù hợp; dịch vụ downstream cũng phải bảo vệ tác dụng phụ của mình. Chỉ ghi nhận đã
đọc message không đủ chứng minh tác dụng phụ ngoài hệ thống xảy ra đúng một lần.
[Nguồn: Idempotent operations](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_prevent_interaction_failure_idempotent.html).

### Độc lập triển khai cần hợp đồng và pipeline tương ứng

Monorepo và nhiều repository đều có thể dùng cho microservices. CI/CD cần cho phép build, kiểm chứng
và triển khai các dịch vụ độc lập; kiểm thử hợp đồng và tương thích phiên bản giúp tránh buộc mọi
consumer cập nhật cùng lúc.
[Nguồn: CI/CD for microservices](https://learn.microsoft.com/en-us/azure/architecture/microservices/ci-cd).

API cần mô tả nghiệp vụ và hợp đồng giữa các dịch vụ, tránh làm lộ schema nội bộ. Ngữ nghĩa và phiên
bản phải đủ rõ để một dịch vụ thay đổi mà không phá caller.
[Nguồn: API design](https://learn.microsoft.com/en-us/azure/architecture/microservices/design/api-design).

## So sánh ba phương án cho dự án

Bảng này là **suy luận thiết kế áp dụng cho repository** từ các nguyên tắc trên. Hướng B đã được
chọn; A và C được giữ để giải thích đánh đổi, không mở lại quyết định hoặc tự chọn danh sách dịch vụ.

| Phương án | Giá trị có thể đạt | Đánh đổi và điều kiện cần kiểm chứng |
|---|---|---|
| A — Core theo module + Agent riêng | Giữ thay đổi nội bộ booking/payment/ticket trong ranh giới Core khi phù hợp; Agent có vòng phát hành và tài nguyên riêng. Có thể thể hiện hệ phân tán qua Core–Agent và pipeline sự kiện. | Các module Core dùng chung đơn vị phát hành. Tích hợp thanh toán bên ngoài vẫn cần xử lý kết quả chưa rõ và đối soát. Không tự chứng minh khả năng chịu lỗi hoặc tải. |
| **B — Giữ hạt nhân giao dịch Core, tách thêm năng lực có lý do** | Cho phép tách phần có mô hình, tải, quyền, nhịp thay đổi hoặc yêu cầu phục hồi khác mà vẫn giữ thẩm quyền ghế/hold/đơn/xác nhận thanh toán/quyền vé tại Core. | Mỗi phần cần chủ dữ liệu, hợp đồng, mức trễ chấp nhận được, cơ chế phục hồi và bằng chứng phát hành độc lập. Bản đồ đã duyệt tại đặc tả, chi tiết triển khai cần tiếp tục làm rõ. |
| C — Tách booking/payment/ticket ngay | Có thể chứng minh phối hợp giao dịch và quyền sở hữu dữ liệu độc lập ở ba năng lực. | Đòi hỏi thiết kế trạng thái trung gian, retry, đối soát/bù trừ và cạnh tranh xuyên dịch vụ. Tách authority sang các dịch vụ đó sẽ đổi hướng đã chốt và cần phê duyệt riêng. |

Ở bước khảo sát ban đầu, các ví dụ để phân tích gồm thông báo, mô hình đọc/tìm kiếm, báo cáo
và tích hợp ngoài. Bản đồ sau đó đã được duyệt tại đặc tả; danh sách ví dụ này không thay bản đồ đó.
Các câu hỏi khảo sát ranh giới gồm: nó sở hữu quyết định nghiệp vụ và dữ liệu gì;
có chấp nhận dữ liệu trễ không; lỗi của nó ảnh hưởng đặt vé ra sao; điều gì cần phát hành hoặc mở rộng
độc lập; và bằng chứng nào cho thấy tách có giá trị. Khác biệt công nghệ hoặc có Kafka không tự tạo
ra một ranh giới nghiệp vụ hợp lý.

## Hệ quả cần đưa vào thiết kế và kiểm chứng

Các mục sau là suy luận áp dụng cho dự án, chưa quyết định chính sách sản phẩm:

- **Giữ authority Core:** Consumer thông báo, báo cáo hoặc Agent không tự nâng sự kiện/ước đoán thành
  quyền vé. Agent chỉ diễn đạt trạng thái đã xác minh từ Core theo invariant của repository.
- **Giữ ranh giới dữ liệu:** Checkpoint hội thoại không thay trạng thái đơn. Dịch vụ tách ra cần sở hữu
  dữ liệu của nó và giao tiếp qua hợp đồng; tránh dùng truy cập trực tiếp bảng Core làm API ngầm.
- **Thiết kế retry:** ID thao tác/sự kiện ổn định; lưu dấu chống lặp phối hợp với kết quả nghiệp vụ tại
  nơi sở hữu kết quả. Offset broker không tự bảo vệ thanh toán hoặc gửi thông báo bên ngoài.
- **Làm rõ tình huống lỗi:** Thanh toán thành công sau khi hold hết hạn; mất phản hồi sau khi đã thu
  tiền; đã trả tiền nhưng chưa phát hành được vé; webhook lặp; hoàn tiền đang chờ; hủy và xác nhận
  chạy đồng thời. Quy tắc sản phẩm phải lấy từ nguồn có thẩm quyền hoặc được chốt ở đó, không tự
  đặt trong ghi chú nghiên cứu này.
- **Chứng minh độc lập:** Cập nhật Agent không bắt buộc phát hành Core và ngược lại trong phạm vi hợp
  đồng tương thích; lỗi pipeline sự kiện không làm bên ngoài tự xác nhận giao dịch; kiểm thử lỗi và
  phục hồi phải quan sát cả trạng thái lưu lẫn tác dụng phụ.

## Những điểm còn cần xác định

- Chi tiết triển khai, hợp đồng và kiểm chứng của các ranh giới đã duyệt tại đặc tả.
- Quy mô tải, độ trễ, mức sẵn sàng và các ca phục hồi cần chứng minh; chưa có số đo để xếp hạng phương án.
- Độ trễ định lượng và chi tiết hợp đồng dữ liệu; không mở lại authority đã được duyệt.
- Phần còn mở của đối soát/hoàn tiền và phục hồi khi phát hành vé lỗi; đối chiếu
  [mô hình sản phẩm](../03-product/use-cases.md) cùng các bổ sung đã được duyệt trước khi thiết kế
  phần phụ thuộc. Không coi toàn bộ chính sách thanh toán muộn hoặc hủy vé là chưa quyết định.

Không dùng thông tin còn thiếu về nhân lực hoặc ngân sách để loại một phương án. Tài liệu này chưa
kiểm tra implementation, benchmark, runtime, provider/pricing hoặc trạng thái GitHub và không xác nhận
hiệu năng, chi phí tiền hay khả năng chịu lỗi thực tế.

## So sánh lưu trữ PostgreSQL

Đối chiếu ban đầu phục vụ lựa chọn database/schema. Sau nghiên cứu, chủ sản phẩm đã duyệt database
logic, credentials/migration riêng/service và không SQL/FK xuyên dịch vụ, kể cả qua FDW/dblink,
trong hội thoại ngày 2026-11-17. Quyết định do đặc tả sở hữu; bảng dưới giữ căn cứ so sánh.
**Số cluster còn mở**, không đổi stack hoặc tự chọn topology từ ghi chú này.
Reporting sở hữu mô hình đọc có độ trễ được thông báo; Core giữ thẩm quyền theo
[đặc tả](../05-specs/004-service-decomposition/spec.md).

| So sánh thiết kế | Đánh đổi |
|---|---|
| Schema riêng, chung database | Tách namespace/quyền; vẫn cùng database, dễ tạo SQL/FK xuyên schema. |
| Database riêng, chung cluster | Ranh giới kết nối rõ hơn; roles vẫn chung cluster, phải giới hạn quyền. |
| Cluster riêng/service | Tách cấu hình/vòng đời; tăng số cụm cần quản lý. Cùng host vẫn chung phạm vi lỗi host. |

PostgreSQL chỉ cho một database/kết nối; schema không cách ly cứng như database; FDW/dblink có thể
nối dữ liệu. Vì vậy cấm SQL xuyên dịch vụ là quy tắc thiết kế cần kiểm chứng.
[Nguồn PostgreSQL](https://www.postgresql.org/docs/current/manage-ag-overview.html),
[schemas](https://www.postgresql.org/docs/current/ddl-schemas.html).

**Quyền phải cấu hình:** database mặc định cấp `CONNECT`/`TEMPORARY` cho `PUBLIC`; cần thu hồi/cấp lại
theo nhu cầu. Kiểm tra quyền `public`, `search_path` và quyền mặc định của object do migration tạo;
database nâng từ PostgreSQL ≤14 có thể còn quyền tạo object công khai. Không mặc định credentials riêng
đã cô lập dữ liệu.
[Nguồn privileges](https://www.postgresql.org/docs/current/ddl-priv.html),
[schema security](https://www.postgresql.org/docs/current/ddl-schemas.html#DDL-SCHEMAS-PATTERNS).

**Tài nguyên/khôi phục:** database riêng không tạo cách ly CPU/RAM/I/O hoặc HA. Suy luận vận hành:
cùng cluster vẫn chia sẻ bộ nhớ/WAL và phạm vi sự cố tiến trình; cluster riêng cũng cần topology HA
riêng. `pg_dump` xuất một database nhưng không gồm roles/tablespaces; `pg_basebackup` và PITR áp dụng
cả cluster. Không hứa restore độc lập chỉ từ tên database.
[Nguồn resources](https://www.postgresql.org/docs/current/runtime-config-resource.html),
[pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html),
[pg_basebackup](https://www.postgresql.org/docs/current/app-pgbasebackup.html),
[PITR](https://www.postgresql.org/docs/current/continuous-archiving.html).

**CDC:** `database.dbname` chọn một database; cần connector cho từng database cần thu nhận, slot riêng
và publication phù hợp. WAL vẫn chung cluster: database ít ghi có thể khiến slot giữ WAL khi database
khác ghi nhiều; phải thiết kế heartbeat, theo dõi lag/disk và phục hồi connector. Tên database không
tự tạo CDC độc lập.
[Nguồn Debezium](https://debezium.io/documentation/reference/stable/connectors/postgresql.html).

Đã đối chiếu Context7 và nguồn chính thức; chưa pin phiên bản hoặc chạy database, backup/restore, CDC.

## Consumer reliability

Nguồn phục vụ vòng thiết kế consumer; các nguyên tắc đã được chủ sản phẩm duyệt trong hội thoại
ngày 2026-11-17 và do đặc tả sở hữu. Ghi chú không tự chốt schema, thư viện, phiên bản hoặc cấu hình.

- **Giao nhận lặp:** Kafka EOS bảo vệ luồng đọc/ghi Kafka với transaction phù hợp, không tự bao gồm
  PostgreSQL/email/thanh toán. Consumer DB cần chịu được nhận ít nhất một lần; commit DB rồi chết
  trước commit offset sẽ dẫn đến xử lý lại.
  [Kafka semantics](https://kafka.apache.org/41/design/design/#message-delivery-semantics).

- **Inbox:** đề xuất khóa duy nhất `(consumerId,eventId)`; ghi dấu đã xử lý và cập nhật projection trong
  cùng local PostgreSQL transaction, rồi mới xác nhận offset. Lỗi transaction không để dấu hoàn tất;
  nhận lại sau commit chỉ bỏ bản trùng. Đây là chống lặp tác dụng trong DB, không phải EOS toàn hệ.
  [Idempotent Consumer](https://microservices.io/patterns/communication-style/idempotent-consumer.html).

- **Thứ tự:** Kafka có thứ tự trong partition, không toàn cục. Suy luận dự án: cùng key nghiệp vụ
  không thay bảo vệ thứ tự khi xử lý song song/retry; phải định nghĩa sequence/version theo hợp đồng.
  [Kafka design](https://kafka.apache.org/41/design/design/).

- **Delta tài chính — suy luận dự án:** không bỏ một khoản thu/hoàn tiền chưa xử lý chỉ vì
  `entityVersion` nhỏ hơn bản mới nhất. Snapshot tuyệt đối và sự kiện cộng/trừ có ngữ nghĩa khác;
  chống trùng bằng ID nghiệp vụ/sự kiện, phát hiện thiếu thứ tự và đối soát. Nguồn pattern minh họa
  phép trừ lặp làm sai số dư, chưa quy định chính sách version của dự án.
  [Nguồn](https://microservices.io/patterns/communication-style/idempotent-consumer.html).

- **Phục hồi — suy luận dự án:** retry lỗi tạm thời có giới hạn/backoff; cách ly lỗi bền vững,
  giữ nguyên ID/lỗi để điều tra, không bỏ âm thầm. Replay kiểm soát phạm vi/quyền, giữ dấu chống lặp;
  dựng lại projection không tự gửi lại email/hoàn tiền. Tác dụng ngoài DB cần trạng thái thao tác,
  idempotency provider hoặc tra cứu/đối soát kết quả chưa rõ; inbox không bảo vệ khoảng lỗi đó.
  [Retry](https://learn.microsoft.com/en-us/azure/architecture/patterns/retry),
  [Dead Letter Channel](https://www.enterpriseintegrationpatterns.com/patterns/messaging/DeadLetterChannel.html),
  [External effects](https://learn.microsoft.com/en-us/azure/architecture/patterns/idempotent-consumer).

Chỉ commit offset qua các record đã xử lý hoặc đã lưu cách ly bền. Chưa kiểm chứng runtime.

## Kiểm quyền và khả năng vận hành khi Identity lỗi

Các nguyên tắc dự án được chủ sản phẩm duyệt sau phản biện về phụ thuộc đồng bộ vào Identity ngày
2026-11-17, do đặc tả sở hữu. Đây là căn cứ nghiên cứu và suy luận, chưa phải cấu hình/runtime đã kiểm chứng.

Better Auth JWT plugin cho phép service xác minh token bằng JWKS mà không gọi xác minh/đọc database
Identity cho từng request; token này tách khỏi session cookie chính. Tài liệu có hướng cache khóa công
khai và lấy lại khi gặp `kid` mới, nhưng không tự xác lập chính sách thu hồi/quyền nghiệp vụ của dự án.
[Nguồn Better Auth](https://better-auth.com/docs/plugins/jwt).

Lời gọi từ xa chậm có thể giữ tài nguyên và gây lỗi dây chuyền. Circuit breaker hạn chế việc chờ/gọi
lặp dịch vụ đang lỗi; nó không tự tạo khả năng xử lý cục bộ nếu luồng vẫn bắt buộc có kết quả từ dịch vụ đó.
[Nguồn Microsoft](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker).

RFC 7662 phân tích đánh đổi cache thông tin xác thực: cache lâu giảm lời gọi/tải nhưng tạo cửa sổ
token đã thu hồi vẫn được chấp nhận; kết quả có hạn dùng không được cache vượt hạn đó. Dẫn nguồn này
để làm rõ đánh đổi, không chọn giao thức OAuth introspection hoặc thêm OAuth Provider cho dự án.
[Nguồn RFC 7662, mục 4](https://www.rfc-editor.org/rfc/rfc7662.html#section-4).

**Suy luận cho dự án:** kiểm cục bộ ở Core cho vận hành thường xuyên, thu hồi qua sự kiện và cửa sổ
quyền cũ có giới hạn; tác vụ rủi ro cao yêu cầu quyền hiện hành/xác thực tăng cường. Core vẫn kiểm vé/
ghế trong trạng thái giao dịch hiện hành. Tiếp tục khi Identity lỗi không đồng nghĩa soát ngoại tuyến,
bỏ kiểm chữ ký hoặc tự gia hạn token. JWT có thời hạn T cũng không bảo đảm tiếp tục T kể từ sự cố,
vì thời hạn còn lại phụ thuộc thời điểm cấp/làm mới. Các giá trị cần yêu cầu vận hành và kiểm chứng riêng.

## Agent thực thi lệnh ghi

Phương án B được chủ sản phẩm duyệt trong hội thoại ngày 2026-11-17; quyết định do đặc tả sở hữu,
không tự chốt giao thức xác nhận/ủy quyền ở ghi chú này. AI theo [mô hình sản phẩm](../03-product/use-cases.md):
khách xác nhận ghế/đơn, yêu cầu hủy; không trao quyền vận hành. Q42 bổ sung đổi ghế trong chat,
xác nhận ghế cũ→mới, đã đọc ở worktree nghiệp vụ; chưa coi đã hợp nhất.
ADR-0008 ở worktree công nghệ chọn JWT/JWKS, chưa chọn OAuth Provider/token exchange.

**Nguồn:** OWASP yêu cầu quyền tối thiểu theo người dùng, duyệt hành động ảnh hưởng lớn và kiểm quyền
ở downstream; approval có thể nằm ngoài ứng dụng LLM.
[Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/).
LangGraph hỗ trợ dừng/chờ/resume, nhưng node có thể chạy lại; vẫn cần chống lặp tác dụng phụ.
[Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts).

**So sánh — suy luận dự án:**

| Hướng | Giá trị / đánh đổi |
|---|---|
| A — Backend Agent chuyển tiếp token Core của khách qua lớp tin cậy | Core kiểm tra quyền khách; phải có hợp đồng audience phù hợp và bảo vệ token khỏi prompt/checkpoint/log. Agent backend nắm credential khách, tăng phạm vi rủi ro. Không tự giả định token exchange. |
| B — Agent đề xuất action có cấu trúc; khách xác nhận trong chat; ứng dụng/BFF thực thi bằng quyền khách | Tận dụng đường lệnh khách, token không cần qua Agent. Cần ràng buộc xác nhận với nội dung cụ thể, opId và chủ phiên; kết quả phải lấy/xác minh từ Core, không tin client tự báo thành công. |
| C — Core cấp ủy quyền hẹp sau xác nhận; Agent dùng service identity + ủy quyền | Gắn user/action/resource/params/opId/expiry, hạn chế phạm vi. Thêm giao thức cấp/thu hồi/chống replay/kiểm chứng; chỉ đáng xét khi cần Agent tự thực thi tách khỏi ứng dụng. |

**Khuyến nghị B:** vẫn giữ đặt/đổi/hủy trong chat: xác nhận là thành phần của chat, Agent điều phối
intent→đề xuất→chờ→nhận kết quả verified; bộ thực thi tin cậy gửi lệnh. Hành trình trong chat không
buộc request xuất phát từ tiến trình Agent. Core kiểm quyền/trạng thái hiện hành; đổi tham số phải
xác nhận lại, retry giữ opId. Đây là suy luận đáp ứng sản phẩm, không phải bảo đảm của LangGraph.

Cả ba không cho LLM đọc token/secret, không dùng service token tự tạo danh tính khách, không thêm
service. Mốc 90/15 phút vận hành không xác định TTL token. Chưa kiểm chứng runtime.
