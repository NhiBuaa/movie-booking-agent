# Business Domain Context & Transaction Rules

**Phạm vi:** yêu cầu nghiệp vụ mục tiêu đã được hòa giải với bộ UML ngày 2026-11-16;
không phải mô tả mọi khả năng của code hiện tại. [Mô hình sản phẩm](../03-product/use-cases.md)
sở hữu actor, mục tiêu, BR và OPEN; [mô tả use case](../03-product/use-case-descriptions.md)
sở hữu các tình huống và [GLOSSARY](../../GLOSSARY.md) sở hữu thuật ngữ.
Tài liệu này diễn giải ràng buộc giao dịch để đặc tả từng tính năng; dẫn BR/OPEN thay vì tạo chính sách song song.

## 1. Ranh giới thẩm quyền

- Cinema Core là nguồn có thẩm quyền về tồn kho, giá, hold, thanh toán, vé và ghi nhận sử dụng.
- AI diễn giải ý định và điều phối; chỉ trình bày mua vé thành công sau xác minh phản hồi/chữ ký Core.
- Client không tự suy thành công/thất bại từ redirect hoặc kết quả chưa rõ. Thiết bị soát vé cần kết nối Core.

## 2. Phòng chiếu và giữ ghế

Theo BR-03–BR-05 và B-01/B-02/B-08:

- Mỗi phòng có sơ đồ và số ghế riêng; giữ Standard, VIP, Sweetbox. Ma trận 64 ghế (8×8)
  chỉ là mẫu cũ, không giới hạn phòng mục tiêu hoặc bắt buộc cố định loại ghế theo hàng.
- Danh sách tối đa 6 ghế, Sweetbox chọn cả cặp. Giữ nguyên tử cả danh sách sau xác nhận của khách;
  tranh chấp một ghế thì không tạo hold một phần. Một tài khoản chỉ có một hold còn hiệu lực.
- TTL 300 giây; không tự gia hạn hoặc khởi động lại khi chuyển kênh. Quy định cũ về cấu hình
  tối đa 10 phút không còn là yêu cầu mục tiêu. Ngưỡng cảnh báo UI không thay đổi TTL của Core.
- Mua vé/giữ ghế yêu cầu đăng nhập và email đã xác minh (BR-02). Không chọn ghế đang bị người khác giữ/đã bán.

## 3. Thanh toán và phát hành vé

Theo BR-05–BR-07 và B-05/B-06:

- Phạm vi cổng đã chốt là MoMo và VNPAY. Giá trị phương thức khác trong enum hiện tại không tự mở rộng phạm vi sản phẩm.
- Chỉ phát hành khi có căn cứ thanh toán hợp lệ và quyền sở hữu ghế; xác minh nguồn, toàn vẹn, số tiền,
  liên kết đơn và xử lý lặp. Hết hold không tự kết luận thanh toán thất bại khi cổng chưa rõ.
- Đã thu tiền sau khi ghế được giải phóng: xử lý hoàn khoản thu qua R-03, không tự đặt ghế thay thế.
- Email vé gửi sau xác nhận phát hành; lỗi email không đảo ngược kết quả mua. Cơ chế gửi lại/lỗi giữ ở OPEN-09.

## 4. Đơn, quyền theo ghế và QR chung

Theo BR-07–BR-09 và O-01–O-05:

- Một QR của lượt đặt tra cứu nhiều quyền sử dụng theo ghế. Soát ghế nào chỉ ghi nhận ghế đó;
  người đến sau có thể dùng quyền còn lại, ghế đã dùng/hủy bị từ chối.
- Core kiểm tra và ghi nhận mỗi ghế một lần, kể cả khi nhiều cửa thao tác đồng thời.
  Lưu QR trên điện thoại không cho phép thiết bị nhân viên soát vé ngoại tuyến.
- Sweetbox được đặt/hủy theo cặp nhưng ghi nhận người vào có thể theo từng ghế.
- Thiếu QR dùng tra cứu và mã xác nhận qua email đã xác minh; không tự bỏ qua bằng chứng hoặc kiểm tra quyền từng ghế.

## 5. Yêu cầu hủy và giao dịch hoàn tiền

Theo BR-10–BR-12 và R-01–R-07:

- Phân biệt bỏ hold chưa thanh toán (B-08) với yêu cầu hủy vé đã mua (R-01). Gửi yêu cầu không làm vé hết hiệu lực.
- Quản lý rạp xét theo phạm vi/chính sách, ngoại lệ chuyển quản trị viên. Khi duyệt phải kiểm tra lại
  quyền ghế chưa dùng và suất chưa bắt đầu; soát và duyệt hủy không cùng thành công cho một ghế.
- Duyệt chỉ vô hiệu đúng các quyền được hủy; phần còn lại vẫn hiệu lực. Thời điểm bán lại ghế giữ ở OPEN-05.
- Quyết định duyệt và giao dịch hoàn tiền có kết quả riêng. Chỉ ghi tiền đã hoàn khi có xác nhận;
  lỗi/chưa rõ/callback lặp không tạo hoàn trùng hoặc tự phục hồi vé đã hủy.
- R-03 có cổng thanh toán phối hợp và quản lý/quản trị theo dõi; R-04 cho khách và vận hành theo quyền
  xem tiến độ. Association không tự cấp quyền hoàn thủ công hay xử lý mọi sự cố.
- Hủy suất đã bán vé cần quản trị chuỗi duyệt đề nghị của quản lý rạp, sau đó thực thi R-07.
  Không mặc định mức hoàn/phí, người xử lý sự cố hoặc cách xử lý combo/voucher/điểm.

## 6. Phân quyền và nghiệp vụ liên quan

[Danh mục actor](../03-product/use-cases.md#actor) định nghĩa vai trò nghiệp vụ mục tiêu và phạm vi rạp/dữ liệu.
Các enum `CUSTOMER`, `CINEMA_STAFF`, `ORGANIZER_ADMIN` hiện tại chưa cung cấp ánh xạ đầy đủ;
đặc tả triển khai phải xác định quyền cụ thể, không ngầm cấp quyền giữa soát vé, giao combo và quản lý.

Điểm sau soát, đổi điểm lấy voucher, điều kiện đánh giá và kiểm duyệt theo BR-13–BR-16 và L-01–L-06.
Không dùng tỷ lệ/giá fixture làm chính sách. Chi tiết còn thiếu tham chiếu
[OPEN-01–OPEN-10](../03-product/use-cases.md#6-các-quyết-định-còn-mở), không tự chốt trong tài liệu này.

## 7. Hợp đồng hiện có và đặc tả tiếp theo

[Enum hiện có](../../packages/contracts/src/common/enums.ts) và
[DTO vé](../../packages/contracts/src/tickets/types.ts) phản ánh bản code đối chiếu
`549d7b2f76e63aefe34e0c3799c3d28495cdf868`. Trạng thái vé hiện là tổng thể; DTO soát chưa chọn tập ghế,
chưa biểu diễn đầy đủ việc soát/hủy một phần. Tên trạng thái trong code không thay thế các phân biệt nghiệp vụ trên.

Các bảng trạng thái đơn/vé tổng thể trước đây không đủ làm hợp đồng cho sản phẩm mục tiêu.
Tài liệu này không đổi enum, schema hoặc API; đặc tả feature tiếp theo phải xác định chuyển trạng thái,
quyền và tình huống lỗi/cạnh tranh theo mô tả đã chốt, có kiểm thử trước khi tuyên bố đáp ứng.
[Đối chiếu hiện trạng](../03-product/use-cases.md#7-hiện-trạng-và-chênh-lệch-so-với-mục-tiêu)
giữ nguồn code và các giới hạn đã quan sát; không sửa hồi tố tiêu chí chấp thuận của feature cũ.
