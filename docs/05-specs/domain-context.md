# Business Domain Context & Transaction Rules

**Phạm vi:** yêu cầu nghiệp vụ mục tiêu đã được hòa giải với bộ UML theo Q173-A ngày 2026-11-17;
không phải mô tả mọi khả năng của code hiện tại. [Mô hình sản phẩm](../03-product/use-cases.md)
sở hữu actor, mục tiêu, BR và OPEN; [mô tả use case](../03-product/use-case-descriptions.md)
sở hữu các tình huống và [GLOSSARY](../../GLOSSARY.md) sở hữu thuật ngữ.
Tài liệu này diễn giải ràng buộc giao dịch để đặc tả từng tính năng; dẫn BR/OPEN thay vì tạo chính sách song song.

## 1. Ranh giới thẩm quyền

- Cinema Core là nguồn có thẩm quyền về tồn kho, giá, hold, thanh toán, vé và ghi nhận sử dụng.
- AI diễn giải ý định và điều phối; chỉ trình bày mua vé thành công sau xác minh phản hồi/chữ ký Core.
- Client không tự suy thành công/thất bại từ redirect hoặc kết quả chưa rõ. Thiết bị soát vé cần kết nối Core.

## 2. Phòng chiếu và giữ ghế

Theo BR-03–BR-05/BR-18…BR-19 và B-01/B-02/B-08/B-09:

- Mỗi phòng có sơ đồ và số ghế riêng; giữ Standard, VIP, Sweetbox. Ma trận 64 ghế (8×8)
  chỉ là mẫu cũ, không giới hạn phòng mục tiêu hoặc bắt buộc cố định loại ghế theo hàng.
- Danh sách tối đa 6 ghế, Sweetbox chọn cả cặp. Giữ nguyên tử cả danh sách sau xác nhận của khách;
  tranh chấp một ghế thì không tạo hold một phần. Một tài khoản chỉ có một hold còn hiệu lực.
- TTL 300 giây; không tự gia hạn hoặc khởi động lại khi chuyển kênh. Quy định cũ về cấu hình
  tối đa 10 phút không còn là yêu cầu mục tiêu. Ngưỡng cảnh báo UI không thay đổi TTL của Core.
- Ngừng hold mới từ T−5 phút; hold cũ chỉ bắt đầu thanh toán trước giờ chiếu khi còn hiệu lực. Không sửa phim/giờ/phòng/sơ đồ suất có hold còn hạn; đã có vé thì không sửa, dùng hủy suất nếu không thể tổ chức. Khoảng đệm cùng phòng tối thiểu 20 phút.
- B-09 đổi vị trí cùng suất theo BR-19: T−30 phút, miễn phí, giữ số lượng/loại, Sweetbox cả cặp, một lần thành công/vé gốc. Core chuyển tập ghế nguyên tử, lỗi giữ quyền cũ/không mất lượt, chưa rõ tra cứu; giữ tiền/phân bổ ưu đãi/combo/điểm. Chưa chọn hợp đồng giữ ghế đích/QR/TTL mới.
- Mua vé/giữ ghế yêu cầu đăng nhập và email đã xác minh (BR-02). Không chọn ghế đang bị người khác giữ/đã bán.

## 3. Thanh toán và phát hành vé

Theo BR-05–BR-07 và B-05/B-06:

- Phạm vi cổng đã chốt là MoMo và VNPAY. Giá trị phương thức khác trong enum hiện tại không tự mở rộng phạm vi sản phẩm.
- Chỉ phát hành khi có căn cứ thanh toán hợp lệ và quyền sở hữu ghế; xác minh nguồn, toàn vẹn, số tiền,
  liên kết đơn và xử lý lặp. Hết hold không tự kết luận thanh toán thất bại khi cổng chưa rõ.
- Đã thu tiền sau khi ghế được giải phóng: xử lý hoàn khoản thu qua R-03, không tự đặt ghế thay thế.
- Nhánh đơn 0đ hợp lệ theo BR-21: khách xác nhận riêng, Core kiểm ưu đãi/hold/quyền ghế rồi phát hành, không tạo giao dịch thu 0đ. Khoản có tiền chỉ mở kênh đáp ứng đúng số tiền theo BR-27.
- Ưu đãi/phân bổ và bảo toàn phần còn lại theo BR-20…BR-22; dùng phân bổ lúc mua khi hoàn một phần, không tính lại đơn.
- Email vé qua N-01/BR-33, lỗi không đảo kết quả mua; tự thử lại giới hạn/gửi lại có quyền, số lần/khoảng chờ/vendor còn OPEN-09.

## 4. Đơn, quyền theo ghế và QR chung

Theo BR-07–BR-09 và O-01–O-05:

- Một QR của lượt đặt tra cứu nhiều quyền sử dụng theo ghế. Soát ghế nào chỉ ghi nhận ghế đó;
  người đến sau có thể dùng quyền còn lại, ghế đã dùng/hủy bị từ chối.
- Core kiểm tra và ghi nhận mỗi ghế một lần, kể cả khi nhiều cửa thao tác đồng thời.
  Lưu QR trên điện thoại không cho phép thiết bị nhân viên soát vé ngoại tuyến.
- Sweetbox được đặt/hủy theo cặp nhưng ghi nhận người vào có thể theo từng ghế.
- Mở từ giờ niêm yết khi phòng sẵn sàng, nhận khách muộn đến hết phim thực tế. O-06/BR-30 phân quyền xác nhận sẵn sàng/kết thúc, tạm dừng và sửa kết thúc nhầm. Quay lại dùng thẻ/dấu gắn suất/ghế và đối chiếu, không soát/cộng điểm lại hoặc theo dõi từng lượt qua Core.
- BR-31 thông báo điều kiện tuổi/giờ/giấy tờ trước mua, người đặt xác nhận cả nhóm; xác minh từng người tại cửa khi cần, không dùng ảnh rời làm đủ căn cứ, chưa thu ảnh/số giấy tờ. Danh mục/hiệu lực quy định còn rà soát.
- Thiếu QR dùng tra cứu và mã xác nhận qua email đã xác minh; không tự bỏ qua bằng chứng hoặc kiểm tra quyền từng ghế.

## 5. Yêu cầu hủy và giao dịch hoàn tiền

Theo BR-10–BR-12 và R-01–R-07:

- Phân biệt bỏ hold chưa thanh toán (B-08) với yêu cầu hủy vé đã mua (R-01). Gửi yêu cầu không làm vé hết hiệu lực.
- Quản lý rạp xét theo phạm vi/chính sách, ngoại lệ chuyển quản trị viên. Khi duyệt phải kiểm tra lại
  quyền ghế chưa dùng theo chính sách tự nguyện; soát và duyệt hủy không cùng thành công cho một ghế.
  Hạn gửi 12 tiếng, hoàn thực trả không phí, mốc xét/chuyển 4 tiếng theo BR-25; hồ sơ gửi đủ điều kiện đúng hạn bị rạp xử lý sau giờ chiếu do quản trị xác minh/duyệt theo Q67.
  Ngoại lệ lỗi dịch vụ theo R-08/BR-26; sự cố đang chiếu có vé đã soát theo R-07/BR-12, không áp điều kiện chưa sử dụng của tự hủy.
- Duyệt chỉ vô hiệu đúng các quyền được hủy; phần còn lại vẫn hiệu lực. Ghế chỉ bán lại sau vô hiệu quyền/giải phóng, suất còn mở bán và trước hạn nhận hold mới.
- Quyết định duyệt và giao dịch hoàn tiền có kết quả riêng. Chỉ ghi tiền đã hoàn khi có xác nhận;
  lỗi/chưa rõ/callback lặp không tạo hoàn trùng hoặc tự phục hồi vé đã hủy.
- R-03 có cổng thanh toán phối hợp và quản lý/quản trị theo dõi; R-04 cho khách và vận hành theo quyền
  xem tiến độ. Association không tự cấp quyền hoàn thủ công hay xử lý mọi sự cố.
- Hủy suất đã bán vé cần quản trị chuỗi duyệt đề nghị của quản lý rạp, sau đó thực thi R-07.
  Hoàn đủ thực trả vé bị ảnh hưởng kể cả soát trước sự cố, giữ lịch sử; combo/voucher theo BR-22…BR-24, điểm/chi tiêu xét hạng theo BR-29.
- R-03/BR-27 bắt đầu ngay tối đa 15 phút khi đủ căn cứ; quản trị xử lý ngoại lệ, bắt đầu kiểm tra trong 4 tiếng từ cảnh báo/cập nhật mỗi 24 tiếng. Đây không phải thời gian tiền về; khả năng merchant với khoản nhỏ/nhiều lần hoàn/thu thêm còn chưa kiểm chứng.

## 6. Phân quyền và nghiệp vụ liên quan

[Danh mục actor](../03-product/use-cases.md#actor) định nghĩa vai trò nghiệp vụ mục tiêu và phạm vi rạp/dữ liệu.
Các enum `CUSTOMER`, `CINEMA_STAFF`, `ORGANIZER_ADMIN` hiện tại chưa cung cấp ánh xạ đầy đủ;
đặc tả triển khai phải xác định quyền cụ thể, không ngầm cấp quyền giữa soát vé, giao combo và quản lý.

Combo và sự cố giao theo M-08/M-09/O-04/O-07 và BR-23…BR-24. Chính sách hội viên/đổi điểm/sửa sai theo M-10/L-01/L-02/L-09/L-10, BR-28…BR-29; tỷ lệ/giá đã được chọn, không dùng fixture thay chính sách.
Đánh giá/hậu kiểm/xét lại theo L-04/L-05/L-07/L-08, BR-16/BR-32; tác giả chủ động gửi, khác người ẩn xét, thời hạn 48 tiếng liên tục, phiên bản phải khớp.
C-01/BR-34 xác định dữ liệu mô hình ngoài và hướng xử lý gián đoạn; L-06/N-01/BR-33 xác định hộp thông báo/email, không SMS/push.
A-04/A-05/BR-36 xác định đổi email/khôi phục, A-06…A-08/BR-37…BR-39 xác định không tự xóa chat theo kỳ, xóa chủ động/tài khoản và ngoại lệ; bảng lưu/xóa/pháp lý/tích hợp còn bắt buộc.
Báo cáo tổng hợp M-07/BR-35 tách tiền/ghế/ngày sự kiện, không tự thành kế toán hoặc mở quyền đọc hồ sơ. Phụ thuộc còn lại tham chiếu
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

## 8. Trạng thái BFF mô phỏng đã được mô tả trên nhánh chính

[Đặc tả BFF](002-web-bff-routes/spec.md) và [plan](002-web-bff-routes/plan.md) tại commit
`2ce4893d66fa002f88a2208492f9aff19b4252f2` sở hữu chi tiết API/helper và mã lỗi của implementation.
Các điểm sau mô tả hợp đồng hiện tại, không sửa định nghĩa mục tiêu ở các mục trên:

- `HoldStatus.CONSUMED` hiện có nghĩa hold đã được dùng để tạo đơn, chưa phải đã thanh toán/phát vé.
  Ghế của đơn chờ thanh toán tiếp tục được bảo vệ đến `holdExpiresAt`; hủy qua `DELETE /api/hold`
  không được tùy tiện giải phóng hold đã consumed.
- Đơn chưa thanh toán hết hạn được giải phóng ghế; đơn `CONFIRMED` và vé/ghế đã bán được bảo toàn
  khi webhook `PROCESSING`, `UNKNOWN`, `FAILED` đến sau TTL. Đây là hai trường hợp khác nhau.
- Success của attempt khác trên đơn đã xác nhận được đánh dấu `reconciliationRequired`, với mã
  `DUPLICATE_PAYMENT_RECONCILIATION_REQUIRED`; success trên đơn đã hết hạn dùng
  `PAYMENT_EXPIRED_RECONCILIATION_REQUIRED`. Gắn cờ đối soát chưa phải tiền đã hoàn.
- Webhook dùng HMAC và vé được ký trong adapter mô phỏng; secret thiếu ở production bị từ chối.
  Process-memory store và header định danh mô phỏng chưa tạo thành backend Core/session thực.

Mốc kết thúc xử lý UNKNOWN/PROCESSING kéo dài và cách hoàn khoản thu trùng, tự động hay vận hành,
đều quy về OPEN-03 trong mô hình sản phẩm; không tự chọn thời hạn kết thúc đối soát hoặc quy trình thay thế. Mốc 15 phút Q114/BR-27 chỉ bắt đầu xử lý khoản hoàn khi đủ căn cứ, không phải thời hạn kết thúc mọi giao dịch UNKNOWN.
Các bảng trạng thái tổng thể và enum kỹ thuật không tự cung cấp hủy/soát từng phần hoặc quyền mới.
