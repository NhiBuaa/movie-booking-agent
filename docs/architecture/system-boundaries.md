# Kiến trúc ranh giới hệ thống: UI, AI Agent và Cinema Core

Tài liệu này xác định mô hình trách nhiệm phân cấp nhằm đảm bảo tính đúng đắn, an toàn giao dịch và hiệu năng cho nền tảng **Movie Booking Platform**.

---

## 1. Phân định trách nhiệm và luồng dữ liệu

| Phân hệ | Trách nhiệm chính | Dữ liệu chuyển giao tiếp theo | Nguyên tắc an toàn giao dịch |
| :--- | :--- | :--- | :--- |
| **Khách hàng** | Thể hiện ý định, chọn phim/suất/ghế, chủ động xác nhận thanh toán. | Yêu cầu ngôn ngữ tự nhiên, danh sách ghế chọn, phương thức trả tiền. | Thao tác thể hiện ý định người dùng; chưa phải kết quả giao dịch. |
| **Web & Mobile Apps (`apps/web`, `apps/mobile`)** | Render giao diện, điều hướng, thu thập input và phản hồi trực quan. | Lệnh tương tác gửi về BFF / API Gateway. | Phản ánh trung thực trạng thái backend; không tự ý che giấu lỗi. |
| **Organizer Portal (`apps/organizer`)** | Upload metadata phim, cấu hình phòng chiếu, lập lịch và xem báo cáo doanh thu. | Cấu hình suất chiếu, giá vé, ma trận ghế. | Cần xác thực phân quyền nghiêm ngặt (`ORGANIZER_ADMIN`). |
| **AI Agent Service (`services/agent-service`)** | Diễn giải ngôn ngữ tự nhiên, duy trì ngữ cảnh đàm thoại, gọi tools tới Cinema Core. | DTO truy vấn tồn kho, lệnh tạo hold, tạo payment intent. | Phản hồi giao dịch chỉ dựa trên dữ liệu thật từ Core; không hallucinate kết quả mua vé. |
| **Cinema Core Service (`services/cinema-core`)** | **Authoritative Core**: Kiểm soát tồn kho ghế, khóa giữ chỗ (hold TTL), kiểm tra giá, xác thực thanh toán và phát hành vé điện tử. | Trạng thái giao dịch chính thức, mã vé, QR code có chữ ký số. | Nguồn thẩm quyền duy nhất; xử lý tranh chấp ghế đồng thời (Concurrency lock). |

---

## 2. Hai điểm vào — Một ranh giới giao dịch thống nhất

Nền tảng cung cấp 2 phương thức đặt vé song song:
1. **Luồng trực tiếp (Direct Booking)**: Người dùng duyệt phim truyền thống qua trang chủ → chi tiết phim → lịch chiếu → trang chọn ghế → trang thanh toán → trang vé.
2. **Luồng AI Agent (Conversational Booking)**: Người dùng trò chuyện với Buaa AI Agent trong khung chat, hoàn tất toàn bộ các bước từ chọn phim, chọn ghế, thanh toán và nhận vé ngay trong cuộc hội thoại.

> [!IMPORTANT]
> **Nguyên tắc hội tụ dữ liệu:**
> Cả 2 luồng đều sử dụng chung một hợp đồng dữ liệu (API Contract) và trạng thái giao dịch từ **Cinema Core Service**. Việc chuyển đổi giữa Web, Mobile hoặc vào khung chat không bao giờ tạo booking trùng lặp hoặc làm sai lệch thời gian giữ ghế (Hold TTL).
