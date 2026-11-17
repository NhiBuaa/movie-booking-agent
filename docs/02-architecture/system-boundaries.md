# Kiến trúc ranh giới hệ thống: ứng dụng và bảy service

Tài liệu này xác định mô hình trách nhiệm phân cấp nhằm đảm bảo tính đúng đắn, an toàn giao dịch và hiệu năng cho nền tảng **Movie Booking Platform**.

**Góc nhìn:** ranh giới trách nhiệm mục tiêu; adapter/scaffold hiện tại chưa phải runtime đã kiểm chứng.
Actor, quyền và quy tắc chi tiết theo [mô hình use case](../03-product/use-cases.md);
[CONTEXT](../../CONTEXT.md) phân biệt hiện trạng. Khách hàng trong bảng dưới là người tương tác,
không phải phân hệ nội bộ; AI và Core vẫn nằm trong ranh giới toàn nền tảng của sơ đồ use case.

[Thiết kế microservices](../05-specs/004-service-decomposition/spec.md) là nguồn sở hữu phân chia
service, dữ liệu và ranh giới lỗi; [bản ghi quyết định](../05-specs/004-service-decomposition/decisions.md)
giữ lý do/nguồn duyệt. Bảng dưới tóm tắt góc nhìn giao tiếp, không thay bản thiết kế đó.

---

## 1. Phân định trách nhiệm và luồng dữ liệu

| Phân hệ | Trách nhiệm chính | Dữ liệu chuyển giao tiếp theo | Nguyên tắc an toàn giao dịch |
| :--- | :--- | :--- | :--- |
| **Khách hàng** | Thể hiện ý định, chọn phim/suất/ghế, chủ động xác nhận thanh toán. | Yêu cầu ngôn ngữ tự nhiên, danh sách ghế chọn, phương thức trả tiền. | Thao tác thể hiện ý định người dùng; chưa phải kết quả giao dịch. |
| **Web & Mobile Apps (`apps/customer-web`, `apps/customer-mobile`)** | Render giao diện, điều hướng, thu thập input và phản hồi trực quan. | HTTP tới service sở hữu theo quyền; Web qua BFF khi phù hợp. | Phản ánh trung thực trạng thái backend; không tự ý che giấu lỗi. |
| **Organizer Web và Mobile (`apps/organizer-web`, `apps/organizer-mobile`)** | Quản trị/vận hành theo M-*/R-* được cấp; Mobile còn có trải nghiệm nhân viên soát vé theo O-* đã chốt, mỗi vai trò tách biệt. Phạm vi kênh theo [nền tảng dự án](../../PROJECT-OVERVIEW.md#in-scope). | Cấu hình, yêu cầu/quyết định hủy, tiến độ hoàn và yêu cầu soát từng ghế theo vai trò. | Kiểm tra vai trò, rạp và dữ liệu ở cả hai kênh; không gộp mọi quyền vào `ORGANIZER_ADMIN` hoặc tự cấp quyền soát/giao combo. |
| **AI Agent Service (`services/agent-service`)** | Diễn giải ý định, giữ ngữ cảnh, truy vấn theo quyền và lập đề xuất có cấu trúc. | Đề xuất gửi về app/BFF; kết quả Core đã xác minh dùng để tiếp tục chat. | Khách xác nhận đúng nội dung Core đã kiểm tra; app/BFF thực thi dưới quyền khách. Agent không giữ credential giao dịch rộng trong mô hình/checkpoint. |
| **Cinema Core Service (`services/cinema-core`)** | Rạp/phòng/lịch, snapshot phim theo suất, giá/hold/đơn, thanh toán/hoàn, quyền vé/soát; module Hội viên, Ưu đãi/Voucher và Combo. | Kết quả giao dịch có thẩm quyền, vé ký; sự kiện đã commit. | Transaction cục bộ bảo vệ nhất quán; không chờ consumer để xác nhận giao dịch. |
| **Catalog** | Biên tập nội dung phim. | Nội dung công khai và snapshot có phiên bản cho Core khi lập/công bố suất. | Core lưu snapshot để đặt/soát, không gọi Catalog mỗi lượt giao dịch. |
| **Identity & Access** | Tài khoản, xác thực, phiên, cấp/thu hồi vai trò và phạm vi rạp. | Bằng chứng quyền xác minh cục bộ và cập nhật thu hồi. | Service sở hữu tài nguyên tự kiểm quyền; không gọi Identity đồng bộ ở mỗi lượt soát/giao combo. |
| **Notification** | Mẫu/hộp thông báo, chuyển phát và trạng thái gửi lại. | Email/thông báo và kết quả chuyển phát. | Không phát hành/xác minh mã nghiệp vụ; lỗi gửi không đảo ngược vé. Email bảo mật qua Claim Check, không chứa mã plaintext trong broker. |
| **Community** | Đánh giá, kiểm duyệt và yêu thích. | Nội dung khách hàng; projection căn cứ đánh giá do Core cung cấp. | Dùng căn cứ có phiên bản/độ mới; chưa rõ thì HTTP truy vấn Core, không tự suy khách đã xem. |
| **Reporting** | Mô hình đọc/tổng hợp từ dữ liệu qua hợp đồng. | Báo cáo theo quyền, kèm mốc cập nhật. | Bản sao có thể trễ; không quyết định thanh toán/hoàn tiền hoặc chặn đặt/soát vé. |

---

## 2. Hai điểm vào — Một ranh giới giao dịch thống nhất

Các công nghệ đã chọn được ghi tại [danh mục ADR](../06-decisions/README.md), tổng hợp trong
[PROJECT-OVERVIEW](../../PROJECT-OVERVIEW.md#architecture-direction). Module Search thuộc Core,
BullMQ indexing nền theo [ADR-0035](../06-decisions/0035-search-module-in-cinema-core.md);
client và Agent dùng API Core, không tự truy cập Typesense. Search nhận dữ liệu Catalog, Community và owner liên quan qua hợp đồng/sự kiện, không SQL chéo. PostgreSQL từng service giữ thẩm quyền dữ liệu tương ứng; Core giữ thẩm quyền giao dịch;
Redis, Typesense và sự kiện không xác nhận giá/ghế/vé thay Core. Đây là kiến trúc đã chọn,
chưa là bằng chứng các dịch vụ, pipeline hoặc worker đã tích hợp; hosting/topology/CD vẫn hoãn.

Nền tảng cung cấp 2 phương thức đặt vé song song:
1. **Luồng trực tiếp (Direct Booking)**: Người dùng duyệt phim truyền thống qua trang chủ → chi tiết phim → lịch chiếu → trang chọn ghế → trang thanh toán → trang vé.
2. **Luồng AI Agent (Conversational Booking)**: Người dùng trò chuyện với Buaa AI Agent trong khung chat, hoàn tất toàn bộ các bước từ chọn phim, chọn ghế, thanh toán và nhận vé ngay trong cuộc hội thoại.

> [!IMPORTANT]
> **Nguyên tắc hội tụ dữ liệu:**
> Cả 2 luồng thực thi giao dịch qua app/BFF dưới quyền khách và dùng trạng thái từ **Cinema Core Service**.
> Lệnh dùng mã thao tác ổn định; timeout phải tra cứu kết quả trước khi thử lại. Chuyển kênh không
> tự tạo đơn mới hoặc gia hạn hold. Đây là yêu cầu thiết kế, chưa phải bảo đảm của adapter hiện tại.

### Ranh giới dữ liệu và giao tiếp

Mỗi service sở hữu một database PostgreSQL logic riêng, quyền truy cập/migration riêng; không SQL/JOIN/FK
xuyên service hoặc chia sẻ ORM nội bộ. Core phối hợp các module bằng interface trong transaction cục bộ.
Lệnh/truy vấn qua HTTP/JSON; sự kiện đã commit qua Outbox–Debezium–Kafka. `packages/contracts` giữ hợp đồng
giao tiếp, không trao quyền truy cập dữ liệu. Chi tiết snapshot Catalog, projection Community và Claim Check
theo [mục 4 của thiết kế](../05-specs/004-service-decomposition/spec.md#4-giao-tiếp-và-hợp-đồng).

## 3. Vai trò nghiệp vụ và hợp đồng hiện tại

[Actor và phạm vi](../03-product/use-cases.md#actor) phân biệt khách chưa đăng nhập, khách hàng,
soát vé, quầy bắp nước, quản lý rạp, quản trị viên toàn chuỗi, cổng thanh toán và dịch vụ email.
Các thành phần/kênh trong bảng trách nhiệm không thay thế danh mục actor này.

Ba giá trị role trong [enum hiện có](../../packages/contracts/src/common/enums.ts) chưa mô tả đầy đủ
phân cấp nghiệp vụ; chưa xác định ánh xạ role/quyền mục tiêu. Việc có tài khoản vận hành hoặc dùng
Portal không tự cho phép xem mọi rạp, soát vé, giao combo hay hoàn tiền thủ công.

QR chung tra cứu quyền theo ghế; soát/hủy từng phần và hoàn tiền có kết quả riêng. Core giữ thẩm quyền,
Notification phối hợp nhà cung cấp email, lỗi email không đảo ngược vé đã phát hành. Association trong
use case không tự chọn giao thức; giao thức đã chốt nằm trong thiết kế microservices.
[Đặc tả nghiệp vụ](../05-specs/domain-context.md) diễn giải ràng buộc,
còn BR/OPEN vẫn do mô hình sản phẩm sở hữu;
tài liệu này không xác nhận contracts hoặc runtime đã đáp ứng các trách nhiệm đó.
