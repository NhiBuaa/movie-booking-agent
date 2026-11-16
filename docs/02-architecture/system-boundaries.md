# Kiến trúc ranh giới hệ thống: UI, AI Agent và Cinema Core

Tài liệu này xác định mô hình trách nhiệm phân cấp nhằm đảm bảo tính đúng đắn, an toàn giao dịch và hiệu năng cho nền tảng **Movie Booking Platform**.

**Góc nhìn:** ranh giới trách nhiệm mục tiêu; adapter/scaffold hiện tại chưa phải runtime đã kiểm chứng.
Actor, quyền và quy tắc chi tiết theo [mô hình use case](../03-product/use-cases.md);
[CONTEXT](../../CONTEXT.md) phân biệt hiện trạng. Khách hàng trong bảng dưới là người tương tác,
không phải phân hệ nội bộ; AI và Core vẫn nằm trong ranh giới toàn nền tảng của sơ đồ use case.

---

## 1. Phân định trách nhiệm và luồng dữ liệu

| Phân hệ | Trách nhiệm chính | Dữ liệu chuyển giao tiếp theo | Nguyên tắc an toàn giao dịch |
| :--- | :--- | :--- | :--- |
| **Khách hàng** | Thể hiện ý định, chọn phim/suất/ghế, chủ động xác nhận thanh toán. | Yêu cầu ngôn ngữ tự nhiên, danh sách ghế chọn, phương thức trả tiền. | Thao tác thể hiện ý định người dùng; chưa phải kết quả giao dịch. |
| **Web & Mobile Apps (`apps/customer-web`, `apps/customer-mobile`)** | Render giao diện, điều hướng, thu thập input và phản hồi trực quan. | Lệnh tương tác gửi về BFF / API Gateway. | Phản ánh trung thực trạng thái backend; không tự ý che giấu lỗi. |
| **Organizer Web và Mobile (`apps/organizer-web`, `apps/organizer-mobile`)** | Quản trị/vận hành theo M-*/R-* được cấp; Mobile còn có trải nghiệm nhân viên soát vé theo O-* đã chốt, mỗi vai trò tách biệt. Phạm vi kênh theo [nền tảng dự án](../../PROJECT-OVERVIEW.md#in-scope). | Cấu hình, yêu cầu/quyết định hủy, tiến độ hoàn và yêu cầu soát từng ghế theo vai trò. | Kiểm tra vai trò, rạp và dữ liệu ở cả hai kênh; không gộp mọi quyền vào `ORGANIZER_ADMIN` hoặc tự cấp quyền soát/giao combo. |
| **AI Agent Service (`services/agent-service`)** | Diễn giải ý định, giữ ngữ cảnh và gọi công cụ trong phạm vi chat đã chốt. | Truy vấn phim/đơn/vé, lập đơn, thanh toán, bỏ hold, yêu cầu hủy/theo dõi hoàn theo quyền khách. | Xác nhận cần thiết của khách và kiểm chứng phản hồi Core; không tự xét duyệt hủy/hoàn hoặc cấp quyền vận hành. |
| **Cinema Core Service (`services/cinema-core`)** | **Authoritative Core**: Kiểm soát tồn kho ghế, khóa giữ chỗ (hold TTL), kiểm tra giá, xác thực thanh toán và phát hành vé điện tử. | Trạng thái giao dịch chính thức, mã vé, QR code có chữ ký số. | Nguồn thẩm quyền duy nhất; xử lý tranh chấp ghế đồng thời (Concurrency lock). |

---

## 2. Hai điểm vào — Một ranh giới giao dịch thống nhất

Nền tảng cung cấp 2 phương thức đặt vé song song:
1. **Luồng trực tiếp (Direct Booking)**: Người dùng duyệt phim truyền thống qua trang chủ → chi tiết phim → lịch chiếu → trang chọn ghế → trang thanh toán → trang vé.
2. **Luồng AI Agent (Conversational Booking)**: Người dùng trò chuyện với Buaa AI Agent trong khung chat, hoàn tất toàn bộ các bước từ chọn phim, chọn ghế, thanh toán và nhận vé ngay trong cuộc hội thoại.

> [!IMPORTANT]
> **Nguyên tắc hội tụ dữ liệu:**
> Cả 2 luồng đều sử dụng chung một hợp đồng dữ liệu (API Contract) và trạng thái giao dịch từ **Cinema Core Service**. Việc chuyển đổi giữa Web, Mobile hoặc vào khung chat không bao giờ tạo booking trùng lặp hoặc làm sai lệch thời gian giữ ghế (Hold TTL).

## 3. Vai trò nghiệp vụ và hợp đồng hiện tại

[Actor và phạm vi](../03-product/use-cases.md#actor) phân biệt khách chưa đăng nhập, khách hàng,
soát vé, quầy bắp nước, quản lý rạp, quản trị viên toàn chuỗi, cổng thanh toán và dịch vụ email.
Các thành phần/kênh trong bảng trách nhiệm không thay thế danh mục actor này.

Ba giá trị role trong [enum hiện có](../../packages/contracts/src/common/enums.ts) chưa mô tả đầy đủ
phân cấp nghiệp vụ; chưa xác định ánh xạ role/quyền mục tiêu. Việc có tài khoản vận hành hoặc dùng
Portal không tự cho phép xem mọi rạp, soát vé, giao combo hay hoàn tiền thủ công.

QR chung tra cứu quyền theo ghế; soát/hủy từng phần và hoàn tiền có kết quả riêng. Core giữ thẩm quyền,
dịch vụ email chỉ phối hợp thông báo, lỗi email không đảo ngược vé đã phát hành. Association không chọn
cách gửi đồng bộ/xử lý nền. [Đặc tả nghiệp vụ](../05-specs/domain-context.md) diễn giải ràng buộc,
còn BR/OPEN vẫn do mô hình sản phẩm sở hữu;
tài liệu này không xác nhận contracts hoặc runtime đã đáp ứng các trách nhiệm đó.
