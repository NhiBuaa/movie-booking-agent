# Tham khảo hạn bán vé online và việc vào rạp muộn

Ngày tra cứu: **2026-11-16**, múi giờ Asia/Ho_Chi_Minh. Đây là ghi chú **không có thẩm quyền nghiệp vụ**;
không thay thế [mô hình sản phẩm](../03-product/use-cases.md), không xác nhận runtime của bất kỳ rạp nào.

**Quyết định sau nghiên cứu:** người dùng đã chọn Q49-A (hold mới dừng trước giờ chiếu 5 phút,
hold cũ giữ TTL 300 giây, chỉ bắt đầu thanh toán khi còn hiệu lực và trước giờ chiếu).
Nguồn có thẩm quyền là [mục 6.1 của mô hình sản phẩm](../03-product/use-cases.md#61-quyết-định-đã-xác-nhận).
Các phương án/đề xuất “chưa được duyệt” bên dưới được giữ như nội dung tại thời điểm nghiên cứu,
không có nghĩa Q49 vẫn đang chờ chọn; hạn vào rạp và chi tiết đối soát vẫn còn phụ thuộc các OPEN.

## Kết quả từ nguồn chính thức

| Nguồn | Chính sách công khai đọc được | Cách kiểm chứng và giới hạn |
| --- | --- | --- |
| [CGV FAQ](https://www.cgv.vn/default/faq/), mục Mua Vé Trực Tuyến → Làm cách nào để mua vé trực tuyến? | Dừng online khoảng 5 phút trước suất chiếu; sau đó mua tại quầy. Cùng mục nêu thời gian giữ ghế 5 phút để hoàn tất giao dịch. | Đọc nội dung trang chính thức qua chỉ mục tìm kiếm; mở trực tiếp bị timeout. Chỉ mục báo thu thập khoảng 5 tháng trước. |
| [CGV Điều khoản sử dụng](https://www.cgv.vn/default/terms-use/), mục 3.2(ii) | Đóng giao dịch vé online 30 phút trước giờ chiếu hoặc khi hết vé; sau đó liên hệ cụm rạp mua vé. | Đọc nội dung chính thức qua chỉ mục tìm kiếm; **mâu thuẫn với FAQ 5 phút**. Chỉ mục báo thu thập khoảng 5 tháng trước; chưa xác định văn bản nào mới hơn/đang được áp dụng. |
| [Lotte Điều Khoản Sử Dụng](https://www.lottecinemavn.com/LCHS/Contents/etc/terms-of-use.aspx), mục I.4 | Đóng online 30 phút trước giờ chiếu hoặc khi hết vé; sau đó liên hệ trực tiếp tại rạp mua vé. | Đọc nội dung chính thức qua chỉ mục; mở trực tiếp trả HTTP 403. Chỉ mục báo thu thập khoảng 2 tháng trước; đường dẫn LCHS không tự chứng minh chính sách của mọi phiên bản app hiện hành. |
| [Cinestar Quy định & chính sách](https://cinestar.com.vn/quy-dinh-va-chinh-sach/), Điều khoản giao dịch → 3.1 Mua vé trực tuyến | Đóng online 30 phút trước giờ chiếu hoặc khi hết vé; sau đó liên hệ quầy bán vé. | Mở và đọc trực tiếp thành công, đoạn 3.1. Đây là nội dung công bố, chưa thử giao dịch thật. |
| [BHD Star Điều khoản thanh toán](https://www.bhdstar.vn/dieu-khoan-thanh-toan/), Điều kiện giao dịch chung, khoản 1 | Đề cập không cung cấp dịch vụ nếu sử dụng vé trễ hơn thời gian quy định của giao dịch; không nêu một số phút chung trong khoản này. | Mở trực tiếp thành công. Không suy ra hạn mua online hay hạn vào rạp cụ thể từ câu này. |

Các nguồn trên hỗ trợ việc **tách kênh online và quầy**, nhưng không chứng minh một mốc áp dụng chung cho ngành.
Mâu thuẫn hai trang CGV được giữ nguyên; không chọn FAQ hay điều khoản làm nguồn ưu tiên khi thiếu xác nhận.
Không dùng chính sách của một chuỗi làm nghĩa vụ pháp lý hay tự nhập thành quy tắc của sản phẩm này.

## Điều nguồn chưa chứng minh

- “Sau hạn online hãy liên hệ quầy” không có nghĩa quầy luôn bán sau giờ chiếu, luôn còn ghế,
  hoặc người đã mua vé chắc chắn được vào muộn. Hạn bán, hạn thanh toán và hạn admission là các câu hỏi riêng.
- Chưa xác minh một hạn vào muộn tính bằng phút áp dụng chung; BHD chỉ viện dẫn điều kiện của giao dịch.
- Chưa biết hệ thống thực của từng chuỗi đóng ở bước chọn suất, tạo giữ ghế, tạo thanh toán hay hoàn tất thanh toán;
  cũng chưa biết cách xử lý hold đang tồn tại và callback thanh toán tới muộn tại ranh giới.
- Không giả định giờ chiếu niêm yết là giờ bắt đầu nội dung phim chính, hoặc luôn có một khoảng quảng cáo/trailer.
  Chính sách bán vé không tự cấp thêm thời gian dựa trên suy đoán quảng cáo.
- Tìm kiếm Galaxy/BHD chưa cung cấp thêm mốc đóng online định lượng đủ chắc; thiếu kết quả không chứng minh không có chính sách.
- Không đăng nhập, tạo hold, thanh toán, gọi nhà cung cấp hay thử mua vé; không xác nhận hành vi Web/App thực tế.

## Các phương án để quyết định, chưa được duyệt

Ký hiệu `T` là giờ chiếu niêm yết. Dự án đã có TTL giữ ghế nguyên tử **300 giây**;
nguồn nội bộ là [PROJECT-OVERVIEW.md](../../PROJECT-OVERVIEW.md) và BR-04 trong mô hình sản phẩm.
Mốc tạo hold dưới đây là thiết kế đề xuất riêng, **không đồng nghĩa** câu “đóng bán online” của các chuỗi.

| Phương án | Hạn tạo hold mới / hạn bắt đầu thanh toán | Đánh đổi |
| --- | --- | --- |
| Thận trọng | Ngừng hold mới tại `T-10 phút`; hold cũ giữ đủ 300 giây, chỉ bắt đầu thanh toán khi hold còn hiệu lực và trước `T-5 phút`. | Ít cơ hội mua sát giờ hơn, có thêm thời gian vận hành. |
| Sát giờ hơn | Ngừng hold mới tại `T-5 phút`; hold cũ giữ đủ 300 giây, bắt đầu thanh toán khi hold còn hiệu lực và trước `T`. | Cho phép mua gần giờ; cần kiểm tra nguyên tử tại Core để giữ ranh giới thời gian và quyền sở hữu ghế. |
| Bán online sau `T` | Một chính sách mới phải chốt hạn cụ thể, điều kiện vào rạp, quyền vận hành và tác động thanh toán. | Chưa có quyền mở rộng phạm vi này; thực tế mua tại quầy không tự cho phép Web/App/chat bán sau `T`. |

Trong hai phương án đầu, đề xuất dùng ranh giới rõ: `now < cutoff` để tạo hold;
`now < expires_at` và trước hạn bắt đầu thanh toán của phương án được chọn. Không tạo hold/thanh toán mới từ `T`.
Không rút ngắn TTL bằng `min(created_at + 300s, T)`, không reset TTL khi mở lại màn hình hoặc thử thanh toán lại.
Việc cap TTL là thay đổi chưa được duyệt, không phải chi tiết có thể tự suy ra từ hạn bán.

Ví dụ cần chốt/kiểm chứng nếu chọn phương án `T-5 phút`, suất **19:30**:

| Tình huống | Ý nghĩa đề xuất / điều còn mở |
| --- | --- |
| Tạo hold lúc 19:24:59 | Được giữ đến 19:29:59 đủ 300 giây; không ép hết hạn ngay 19:25. |
| Tạo hold lúc 19:25:00 | Từ chối hold mới theo ranh giới đề xuất; không làm mất hold trước đó còn hiệu lực. |
| Bắt đầu thanh toán trước `T`, callback sau `T` | Không tự coi thành công hay thất bại chỉ vì callback đến muộn. Core đối soát căn cứ thanh toán và quyền ghế theo BR-06; hạn vào rạp vẫn thuộc OPEN-06. |
| Thanh toán khi hold đã hết hạn dù chưa tới `T` | Không suy ra còn quyền ghế. Nếu đã thu tiền sau khi ghế giải phóng, xử lý theo BR-06, không tự gán ghế khác. |
| Suất bị dừng bán, chờ hủy hoặc đã hủy | Hạn theo đồng hồ không tự mở lại quyền bán. Các quyết định Q33, Q45–Q48 trong hội thoại đã chốt việc tạm dừng và xử lý giao dịch đang chạy; ghi chú nghiên cứu không thay chúng. |
| Giờ chiếu đổi khi có hold/đơn | Không tự kéo dài/rút TTL hoặc khởi động lại thanh toán. Q32 trong hội thoại đã chốt giới hạn sửa suất khi có hold/vé; không mở lại quyết định đó từ nghiên cứu hạn bán. |

Khuyến nghị để người quyết định xem xét: tách hạn Web/App/chat khỏi admission; chọn một trong hai phương án trước `T`
và giữ nguyên 300 giây. Không mở rộng online sau `T` chỉ vì nguồn công khai cho phép liên hệ quầy.
Phạm vi hiện tại loại trừ tích hợp tiền mặt tại quầy; ghi chú này không đề xuất triển khai quầy.
Khoảng đệm lịch 20 phút đã được xác nhận riêng trong hội thoại (Q50), không dùng làm hạn bán hoặc sửa chính sách đó tại đây.
Quyết định còn cần chốt là mốc Q49, ý nghĩa chính xác của hạn thanh toán và xử lý giao dịch đang chạy;
admission và thanh toán muộn phải đối chiếu BR-06/OPEN-05/OPEN-06 cùng các câu đã được chủ sản phẩm chốt,
thay vì tự bổ sung quy tắc. Q32–Q48 là quyết định hội thoại đang chờ đồng bộ vào mô hình; note này không đóng các OPEN.
