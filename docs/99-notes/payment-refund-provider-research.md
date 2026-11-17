# Tham khảo khả năng thu/hoàn tiền MoMo và VNPAY

Ngày tra cứu: **2026-11-17**, Asia/Saigon. Đây là ghi chú **không có thẩm quyền nghiệp vụ** cho OPEN-03,
không thay [mô hình sản phẩm](../03-product/use-cases.md), hợp đồng merchant hoặc kiểm chứng tích hợp.
Không đăng nhập, dùng khóa, tạo khoản thu/hoàn hay gọi API giao dịch trong lần nghiên cứu này.

## Phạm vi bằng chứng

- Context7 không tìm được tài liệu chính chủ phù hợp: kết quả MoMo là MTN MoMo, VNPAY là thư viện cộng đồng;
  không dùng chúng làm căn cứ. Nguồn dưới đây đều là website/tài liệu của nhà cung cấp.
- MoMo Developers mở trực tiếp bị HTTP 403; các bảng được đọc qua chỉ mục trang chính thức, báo thu thập khoảng
  4 tuần trước. Chưa thấy ngày sửa tài liệu. URL `/v3/docs/` không đồng nghĩa endpoint thanh toán là phiên bản v3.
- VNPAY API/FAQ bị timeout trong công cụ web, nhưng GET tài liệu HTML bằng PowerShell trả HTTP 200 và được đối chiếu
  nội dung; không gọi endpoint giao dịch. Trang ghi phiên bản kết nối **2.1.0**, chưa thấy ngày sửa.
- Tài liệu công khai mô tả khả năng sản phẩm, chưa chứng minh tài khoản merchant của dự án được cấp mọi phương thức/quyền.

## MoMo

[Reverse & Refund](https://developers.momo.vn/v3/docs/payment/api/payment-api/refund/) mô tả:

| Nội dung | Dữ kiện |
|---|---|
| Hoàn | Toàn phần hoặc một phần qua `POST /v2/gateway/api/refund`. |
| Định danh | `transId`: khoản thu thành công MoMo; `orderId`: giao dịch hoàn mới, khác đơn mua; `requestId`: khóa chống thực hiện lặp. |
| Mỗi khoản hoàn | `amount` VND, tối thiểu **1.000đ**, riêng Local ATM Card **10.000đ**; tối đa **50 triệu**, Tokenization **30 triệu**. Đây là hạn của yêu cầu hoàn, không phải giá vé. |
| Chờ phản hồi | Timeout phía gọi tối thiểu 30 giây. |
| Tra cứu | `POST /v2/gateway/api/refund/query`; có danh sách `refundTrans`, kết quả/số tiền từng giao dịch và thống kê theo item. Không lấy riêng kết quả truy vấn cấp ngoài để kết luận mọi khoản hoàn thành công. |

[Bảng mã kết quả](https://developers.momo.vn/v3/docs/payment/api/result-handling/resultcode/):
`7000`/`7002` còn xử lý; `1081` yêu cầu kiểm tra đã hoàn hoặc vượt số tiền còn hoàn được;
`1088` khoản thu không đủ điều kiện; `1080` hướng dẫn kiểm tra định danh rồi thử lại sau, khuyến nghị khoảng một giờ
với khoản thu cũ hơn một tháng. **Không suy câu này thành cửa sổ hoàn tối đa 30 ngày**.
Tài liệu có chống lặp từ phiên bản open API 2.1, nhưng còn phân biệt trạng thái cuối và lỗi trùng;
timeout không phải căn cứ đổi ID để gửi thêm khoản hoàn mới.

[One-Time Payments của ví](https://developers.momo.vn/v3/docs/payment/api/wallet/onetime/)
ghi khoản **thu mới** `amount` từ **1.000đ đến 50 triệu VND**. Đây là giới hạn của luồng ví được mô tả,
không tự áp cho mọi sản phẩm MoMo hoặc dùng làm hạn hoàn ATM.

[Payment Notification](https://developers.momo.vn/v3/docs/payment/api/result-handling/notification/)
yêu cầu kiểm tra chữ ký IPN và đối chiếu định danh/số tiền. Phản hồi IPN của merchant không tự khiến MoMo hoàn tiền;
không dùng việc trả lỗi callback làm quy trình hoàn khoản thu muộn.

## VNPAY Payment Gateway

[API querydr/refund 2.1.0](https://sandbox.vnpayment.vn/apis/docs/truy-van-hoan-tien/querydr%26refund.html):

| Nội dung | Dữ kiện |
|---|---|
| Hoàn | `vnp_Command=refund`, loại `02` toàn phần, `03` một phần; số tiền không vượt khoản thu. |
| Định danh | `vnp_TxnRef`: mã khoản thu merchant; `vnp_TransactionNo`: mã VNPAY; `vnp_TransactionDate`: thời điểm khoản thu. `vnp_RequestId` phân biệt yêu cầu, không trùng trong ngày; mã phản hồi/hoàn cần lưu riêng. |
| Trạng thái | `vnp_ResponseCode=00`: yêu cầu thành công; xem thêm `vnp_TransactionStatus`. `05`: đang xử lý; `06`: đã gửi ngân hàng; `09`: bị từ chối. Không coi `00` của yêu cầu hoặc `06` là bằng chứng khách đã nhận tiền. |
| Lặp/tra cứu | Refund response `94`: đã có yêu cầu đang xử lý. Có `querydr` và checksum phản hồi; chưa đủ tài liệu này để khẳng định tra cứu độc lập mọi lệnh hoàn nhiều lần theo `RequestId`. |

[Techspec POST 2.1.0](https://sandbox.vnpayment.vn/apis/files/VNPAY%20Payment%20Gateway_Techspec%20Post%20method%202.1.0-VN.pdf)
còn liệt kê lỗi hoàn `16` (không thực hiện được trong thời gian này), `93` (số tiền không hợp lệ).
Không đọc các mã đó thành một cửa sổ ngày hoặc số lần hoàn cụ thể.

[FAQ Cổng thanh toán](https://sandbox.vnpayment.vn/apis/docs/faqs/) ghi khoản **thu mới tối thiểu 5.000đ**;
giới hạn tối đa tùy ngân hàng. Giá trị gửi VNPAY nhân 100: 5.000 VND tương ứng 500.000 ở trường giao thức.
Nhân 100 không tự giảm mức tối thiểu và không chứng minh được thu 0đ. FAQ này không xác lập mức tối thiểu refund.

## Thời gian tiền về: không có một hạn chung đã kiểm chứng cho dự án

| Nguồn chính thức / phạm vi | Nội dung công bố và giới hạn |
|---|---|
| [VNPAY Merchant Omni FAQ](https://doitac.vnpay.vn/hdsd/pages/hdsd-merchant-omni/faq.html) | Sau tạo lệnh hoàn, thông thường nội địa **3–5 ngày làm việc**, quốc tế **30–45 ngày làm việc**, tùy ngân hàng; loại trừ cuối tuần/lễ. Đọc qua chỉ mục (thu thập cùng ngày); mở web chỉ trả khung FAQ. Chưa chứng minh áp dụng đúng cấu hình Gateway của dự án. |
| [Chính sách website VNPAY](https://vnpay.vn/chinh-sach/chinh-sach-hoan-huy-doi-tra.html), áp dụng từ **21/4/2025** | Thẻ ngân hàng dự kiến **5–15 ngày làm việc**, ví **3–7 ngày làm việc**. Đọc trực tiếp; trang nói hàng hóa/dịch vụ VNPAY niêm yết/cung cấp, không phải hợp đồng Gateway của mọi merchant. Không gộp với Merchant Omni thành một SLA duy nhất. |
| [MoMo Giải trí Online](https://www.momo.vn/giai-tri-online), mục giao dịch thất bại đã trừ tiền | Đọc trực tiếp: nguồn MoMo/ngân hàng liên kết/ATM hoàn về MoMo trong **24 giờ**; thẻ quốc tế **7–30 ngày** tùy ngân hàng. Đây là giao dịch thất bại trong nhóm dịch vụ nêu trên, không phải cam kết mọi merchant refund. |
| [MoMo Grab](https://www.momo.vn/dat-grab), mục chưa nhận hoàn sau hủy | Chỉ mục chính thức nêu nguồn ví/Ví Trả Sau/Túi Thần Tài **30–45 phút** từ Grab xác nhận hoàn; thẻ quốc tế **7–30 ngày**. Phạm vi đối tác Grab khác dự án, không nhập các sản phẩm/nguồn tiền này vào phạm vi đã chốt. |

Các số trên cho thấy phải tách loại sản phẩm, nguồn tiền, điểm bắt đầu tính và ngày làm việc;
chúng chưa đủ để công bố một cam kết tiền về cho Movie Booking Platform. Không lấy số phút từ một đối tác
hoặc khoản hoàn giao dịch thất bại làm SLA hoàn vé tự nguyện của dự án.

## Điều còn cần xác minh và hệ quả phân tích

- **Chưa đủ bằng chứng** về cửa sổ gửi hoàn tối đa, số lần hoàn một phần liên tiếp, tổng mức hoàn còn lại khi đã có lệnh
  đang xử lý và khả năng tra cứu từng lệnh của cấu hình merchant thực tế. Có API hoàn một phần không tự chứng minh mọi
  trường hợp hủy nhiều lần hoặc hoàn vé rồi hoàn combo đều hoạt động. MoMo có danh sách refund, nhưng chưa có giới hạn lần/ngày
  áp dụng chung được xác minh. Không tự gán 30/90/180 ngày hay số lần hoàn cho hai cổng.
- **Khoản nhỏ:** phân bổ ưu đãi/hủy một ghế hoặc thay combo có thể tạo khoản thu/hoàn dưới hạn API. Ví dụ riêng thiết kế:
  khoản hoàn 500đ không đáp ứng mức MoMo refund đã đọc; khoản thu thêm 2.000đ thấp hơn mức thu VNPAY FAQ.
  Đây là khoảng trống cần giải pháp được duyệt/đối tác xác nhận, không cho phép bỏ khoản khách được hoàn,
  làm tròn tăng số thu, tự đổi thành voucher, ví nội bộ, tiền mặt hoặc chuyển khoản thủ công.
- **Đơn 0đ:** quyền hủy/voucher phải được xử lý tại Core mà không tạo khoản thu/hoàn giả; chính sách sản phẩm
  và hợp đồng kỹ thuật cần phân biệt không phát sinh tiền với hoàn đang chờ.
- **Sự cố:** nguồn hỗ trợ tách tiếp nhận, đang xử lý, gửi ngân hàng và kết quả cuối. Core cần giữ liên kết căn cứ–khoản thu–lệnh hoàn,
  đối soát kết quả chưa rõ trước thử lại; không coi timeout hay mã trùng là thất bại chắc chắn để hoàn thêm.
  Cách retry/callback/query cụ thể cần đặc tả theo đúng sản phẩm/version và kiểm chứng với nhà cung cấp.
- **Hợp đồng:** cần xác nhận phương thức được cấp, refund API/quyền merchant, cửa sổ/hạn mức, nguồn trả tiền,
  SLA theo nguồn, phí, số dư hoàn, giờ/ngày bảo trì và đầu mối hỗ trợ trước vận hành. Không có hợp đồng merchant trong bằng chứng này.
- Các mốc nội bộ, thẩm quyền và phạm vi xử lý khoản nhỏ đã chốt tại [Q114–Q119](../03-product/use-cases.md#61-quyết-định-đã-xác-nhận)
  do mô hình sản phẩm sở hữu; ghi chú không thay các quyết định đó hoặc xác nhận cổng đã tích hợp.
  Nếu cổng chưa đủ điều kiện nhận lệnh, phải ghi nhận trở ngại; không dùng mốc nội bộ để hứa tiền về.
