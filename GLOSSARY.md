# Thuật ngữ Movie Booking Platform

Thuật ngữ nghiệp vụ dùng trong [mô hình use case](docs/03-product/use-cases.md).
Các định nghĩa mô tả sản phẩm mục tiêu; không khẳng định cách lưu dữ liệu hiện tại.

## Đơn, vé và sử dụng dịch vụ

**Đơn đặt vé**: Tập hợp vé theo ghế, combo và ưu đãi mà một tài khoản đặt cho một suất chiếu.
_Tránh_: Dùng “vé” để chỉ cả đơn khi đang nói về hủy hoặc soát một phần.

**Vé theo ghế**: Quyền sử dụng một ghế tại một suất chiếu, có thể được ghi nhận đã vào hoặc bị hủy riêng theo chính sách.
_Tránh_: Đồng nhất một vé theo ghế với một mã QR bắt buộc phải phát riêng.

**QR chung của lượt đặt**: Mã xuất trình để tra cứu các quyền sử dụng trong một lượt đặt; không đồng nghĩa mọi ghế đã được dùng sau một lần quét.
_Tránh_: “Quét QR là dùng hết đơn”.

**Giữ ghế**: Quyền tạm thời dành các ghế đã chọn cho một lượt đặt trong thời hạn xác định; chưa phải vé đã mua.
_Tránh_: Đặt vé thành công khi mới giữ ghế.

**Soát vé**: Xác minh và ghi nhận các ghế được chọn đã được sử dụng để vào rạp.
_Tránh_: Chỉ đọc mã QR mà chưa ghi nhận vào rạp.

**Sweetbox**: Cặp ghế đôi được cung cấp như một đơn vị đặt và hủy; việc ghi nhận người vào rạp vẫn có thể theo từng ghế.

**Combo**: Gói bắp nước tiêu chuẩn được đặt kèm đơn và nhận tại quầy.

## Hủy và hoàn tiền

**Yêu cầu hủy**: Đề nghị của khách đối với các vé đã mua, cần được người có thẩm quyền xét duyệt.
_Tránh_: Coi việc gửi yêu cầu là vé đã vô hiệu hoặc tiền đã hoàn.

**Quyết định hủy**: Kết quả chấp thuận hoặc từ chối yêu cầu hủy theo chính sách và điều kiện được kiểm tra lại.

**Hoàn tiền**: Giao dịch trả lại khoản thu có căn cứ; có tiến trình và kết quả riêng với quyết định hủy.
_Tránh_: Dùng “đã hoàn tiền” khi mới được duyệt hoặc mới gửi lệnh tới cổng.

## Hội viên

**Điểm hội viên**: Quyền lợi tích lũy thuộc tài khoản đứng tên đặt vé, dùng để đổi ưu đãi.
_Tránh_: Tiền mặt hoặc số dư thanh toán.

**Voucher**: Quyền hưởng một ưu đãi theo điều kiện áp dụng, có thể nhận từ chương trình khuyến mãi hoặc đổi điểm.
_Tránh_: Đồng nhất voucher với điểm hội viên.
