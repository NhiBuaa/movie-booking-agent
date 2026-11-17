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

**Đổi ghế cùng suất**: Thay vị trí quyền ghế đã mua trong cùng một suất, giữ số lượng và loại ghế theo điều kiện đổi.
_Tránh_: Đồng nhất với đổi suất hoặc khởi tạo một đơn mua mới.

**Tiền thực trả của phần dịch vụ**: Giá trị vé/combo sau các khoản giảm giá đã được phân bổ và lưu lúc mua.
_Tránh_: Lấy giá niêm yết hoặc tính lại giá phần còn lại để xác định tiền hoàn.

**Kết thúc thực tế của suất**: Thời điểm phim đã kết thúc được người có trách nhiệm xác nhận, phân biệt với giờ kết thúc dự kiến.
_Tránh_: Tự coi đã hết phim chỉ vì đồng hồ vượt lịch dự kiến.

## Hủy và hoàn tiền

**Yêu cầu hủy**: Đề nghị của khách đối với các vé đã mua, cần được người có thẩm quyền xét duyệt.
_Tránh_: Coi việc gửi yêu cầu là vé đã vô hiệu hoặc tiền đã hoàn.

**Quyết định hủy**: Kết quả chấp thuận hoặc từ chối yêu cầu hủy theo chính sách và điều kiện được kiểm tra lại.

**Hoàn tiền**: Giao dịch trả lại khoản thu có căn cứ; có tiến trình và kết quả riêng với quyết định hủy.
_Tránh_: Dùng “đã hoàn tiền” khi mới được duyệt hoặc mới gửi lệnh tới cổng.

## Hội viên

**Hạng hội viên**: Mức phân loại quyền lợi của tài khoản hội viên theo chính sách xét hạng.
_Tránh_: Đồng nhất hạng với loại ghế hoặc số dư điểm có thể đổi quà.

**Điểm hội viên**: Quyền lợi tích lũy thuộc tài khoản đứng tên đặt vé, dùng để đổi ưu đãi.
_Tránh_: Tiền mặt hoặc số dư thanh toán.

**Voucher**: Quyền hưởng một ưu đãi theo điều kiện áp dụng, có thể nhận từ chương trình khuyến mãi hoặc đổi điểm.
_Tránh_: Đồng nhất voucher với điểm hội viên.

**Chi tiêu xét hạng**: Tổng giá trị vé hợp lệ đã soát được ghi nhận cho tài khoản đặt để xét hạng, tách khỏi số dư điểm có thể đổi.
_Tránh_: Trừ chi tiêu xét hạng chỉ vì khách đã đổi điểm.

**Voucher đổi điểm**: Voucher được cấp từ một giao dịch sử dụng điểm hội viên.

**Voucher cấp bù**: Voucher thay thế được cấp để khôi phục quyền ưu đãi bị ảnh hưởng trong trường hợp được chính sách cho phép.
_Tránh_: Đồng nhất nguồn cấp hoặc điều kiện của voucher cấp bù với voucher đổi điểm.

## Đánh giá phim

**Che nội dung tiết lộ cốt truyện**: Cách hiển thị có cảnh báo để người đọc chủ động mở nội dung có thể tiết lộ tình tiết phim.
_Tránh_: Đồng nhất với bài bị ẩn vì vi phạm.

**Bài đánh giá bị ẩn**: Bài không được hiển thị công khai theo quyết định kiểm duyệt nội dung.
_Tránh_: Đồng nhất với bài bị tác giả xóa hoặc nội dung chỉ được che bằng cảnh báo cốt truyện.

**Yêu cầu xem xét lại đánh giá**: Đề nghị của tác giả để xem lại quyết định kiểm duyệt đối với bài của mình.
_Tránh_: Coi việc gửi yêu cầu là bài đã được khôi phục.

## Báo cáo vận hành

**Tiền thực thu**: Tổng khoản thu đã được xác minh thành công, chưa trừ các khoản hoàn tiền.
_Tránh_: Đồng nhất với giá trị bán vé/combo hoặc chỉ tính các đơn phát hành được vé.

**Tiền đã hoàn**: Tổng khoản hoàn đã được xác minh hoàn thành công.
_Tránh_: Tính cả khoản mới được duyệt hoặc mới gửi yêu cầu hoàn.

**Tiền còn phải hoàn**: Nghĩa vụ trả lại tiền đã được xác định nhưng chưa hoàn tất.
_Tránh_: Coi đây là tiền đã chuyển về khách hoặc bỏ nghĩa vụ vì chưa gửi được qua cổng.

**Giá trị bán ròng**: Giá trị phần bán vé/combo đã xác nhận sau ưu đãi và các điều chỉnh hủy/giảm được duyệt, không phụ thuộc tiền hoàn đã về khách hay chưa.
_Tránh_: Đồng nhất với tiền đang giữ, lợi nhuận hoặc doanh thu kế toán.

**Tỷ lệ ghế bán được**: Tỷ lệ số ghế có vé chưa hủy trên số ghế có thể bán của suất.
_Tránh_: Tính hold chưa thành vé là ghế đã bán.

**Tỷ lệ ghế đã soát**: Tỷ lệ số ghế đã được xác nhận sử dụng để vào rạp trên số ghế có thể bán của suất.
_Tránh_: Đồng nhất với tỷ lệ ghế bán được hoặc số tài khoản đặt vé.

## Tài khoản và quyền dữ liệu

**Yêu cầu xóa tài khoản**: Đề nghị của chủ tài khoản để kết thúc sử dụng tài khoản và xử lý xóa dữ liệu liên quan theo quyền, nghĩa vụ còn tồn tại.
_Tránh_: Đồng nhất với đăng xuất hoặc khóa tài khoản do vi phạm.

**Chờ đóng tài khoản**: Giai đoạn sau yêu cầu xóa, trong đó tài khoản còn phục vụ quyền sử dụng và theo dõi các giao dịch đã có trước khi hoàn tất.
_Tránh_: Coi mọi dữ liệu đều phải giữ nguyên đến khi hết giai đoạn này.

**Xóa tài khoản**: Hoàn tất kết thúc sử dụng tài khoản và xóa dữ liệu đủ điều kiện, phân biệt với phần còn được giữ trên căn cứ cụ thể.
_Tránh_: Chỉ vô hiệu hóa đăng nhập rồi coi đã xóa mọi dữ liệu.

## Khám phá và sở thích

**Hồ sơ sở thích**: Thông tin mô tả gu xem phim để điều chỉnh gợi ý; khác hồ sơ liên hệ và mật khẩu của tài khoản.

**Hồ sơ theo phiên**: Sở thích trong một phiên khám phá của khách chưa đăng nhập; không tự trở thành hồ sơ lâu dài qua nhiều lần truy cập.

**Hồ sơ theo tài khoản**: Sở thích gắn với tài khoản đăng nhập, có thể dùng xuyên lần truy cập và thiết bị.

**Đặt lại dữ liệu đã học**: Yêu cầu bắt đầu lại phần sở thích đã học; không đồng nghĩa xóa tài khoản, đơn hàng hoặc vé.
_Tránh_: Dùng “xóa lịch sử” để ngầm bao gồm mọi loại dữ liệu. Chính sách chi tiết theo BR-40–43/OPEN-11 trong mô hình sản phẩm.
