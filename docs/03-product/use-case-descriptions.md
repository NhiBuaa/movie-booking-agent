# Mô tả use case — Movie Booking Platform

Đọc cùng [phạm vi, actor, quy tắc và sơ đồ](use-cases.md). Đây là mô tả **sản phẩm mục tiêu đã xác nhận**,
không phải bằng chứng triển khai. Mã `BR-*`/`OPEN-*` dẫn tới tài liệu trên.

Mỗi mục có actor, kích hoạt/điều kiện trước, luồng chính, kết quả và ngoại lệ.
Core là thành phần có thẩm quyền **bên trong** nền tảng, không phải actor.
Mọi thao tác kiểm tra lại quyền tài khoản và phạm vi rạp; biết mã đơn/QR không cấp quyền xem hồ sơ
khách hoặc quyền vận hành. Các từ chỉ trạng thái dưới đây không tự định nghĩa enum/API mới.

## Tài khoản và khám phá

### D-01 — Khám phá phim, rạp và suất chiếu

- **Actor/kích hoạt:** khách chưa đăng nhập hoặc khách hàng muốn tìm lựa chọn xem phim.
- **Điều kiện trước:** có thông tin được công bố; đọc thông tin không bắt buộc đăng nhập.
- **Luồng:** nhập tiêu chí hoặc duyệt danh mục → xem phim/trailer, rạp, lịch chiếu, giá và đánh giá → chọn suất. Có thể dùng giao diện trực tiếp hoặc chat.
- **Kết quả:** có thông tin/lựa chọn suất; chưa giữ ghế hoặc tạo vé.
- **Khám phá nâng cấp:** tìm tên/alias, không dấu/lỗi gõ và theo mô tả nội dung; kết hợp từ khóa/ngữ nghĩa.
  Theo BR-21, hồ sơ dùng sở thích khai báo/yêu thích/đánh giá/mua đã xác nhận và lượt xem chi tiết/click/search;
  không tự nhập toàn bộ chat. Khách chỉ theo phiên, tài khoản có hồ sơ lâu dài/xuyên thiết bị.
  Không bắt đăng nhập hoặc hỏi sở thích lúc bắt đầu; người mới khám phá ngay theo danh mục/ngữ cảnh.
- **Ngoại lệ:** không có kết quả, suất ngừng bán hoặc nguồn không truy vấn được: báo đúng tình trạng, không bịa suất thay thế.
- **Khi LLM/embedding gián đoạn:** giữ tìm kiếm từ khóa/bộ lọc/danh mục và dữ liệu hợp lệ có sẵn;
  tìm kiếm trực tiếp không phụ thuộc hội thoại Agent theo
  [ADR-0035](../06-decisions/0035-search-module-in-cinema-core.md). Cách suy giảm khi chính index lỗi cần đặc tả riêng.
- **Quy tắc:** BR-02, BR-17. Đọc lịch chiếu không phải bảo đảm còn ghế.
- **Thứ hạng đã chốt:** BR-20 ưu tiên truy vấn, tên phim/alias khớp chính xác đứng trước;
  hồ sơ sở thích chỉ điều chỉnh giữa các kết quả có độ phù hợp tương đương. Trang khám phá có thể
  cá nhân hóa mạnh hơn, vẫn giữ đúng bộ lọc. Công thức/trọng số và ngưỡng tương đương cần đặc tả/đánh giá.
- **Kiểm soát cá nhân hóa đã chốt:** BR-18 cho bật/tắt học và dùng hồ sơ sở thích, đặt lại dữ liệu đã học;
  tìm theo truy vấn/bộ lọc vẫn dùng được. Đặt lại không xóa đơn/vé; chưa thêm xem/xóa từng tương tác.
  BR-19: khi đăng nhập, không nhập hành vi phiên khách; giữ hồ sơ tài khoản hiện có và học tiếp từ
  tương tác sau đăng nhập khi cá nhân hóa được bật. Chấp nhận không chuyển tín hiệu khách vào hồ sơ lâu dài.
  Retention, thời hạn phiên khách và xử lý tín hiệu cũ khi đặt lại/bật lại còn OPEN-11;
  đây chưa là đặc tả đầy đủ luồng nâng cấp hoặc bằng chứng tracking đã triển khai.

### A-01 — Đăng ký tài khoản

- **Actor/kích hoạt:** khách chưa đăng nhập chọn tạo tài khoản.
- **Điều kiện trước:** định danh đăng ký hợp lệ, chưa có tài khoản trùng.
- **Luồng:** nhập email/mật khẩu, thông tin cần thiết → kiểm tra → tạo tài khoản khách và tư cách hội viên → hướng dẫn sang A-02.
- **Kết quả:** có tài khoản, có thể vẫn chưa xác minh email; chưa được giữ ghế/mua vé.
- **Ngoại lệ:** đầu vào sai/email trùng: không tạo trùng; không cấp vai trò vận hành từ đăng ký công khai.
- **Quy tắc:** BR-01, BR-02, BR-14. A-02 độc lập, không include để ép hoàn tất ngay trong phiên đăng ký.

### A-02 — Xác minh email

- **Actor/kích hoạt:** khách hàng tiếp tục xác minh; dịch vụ email phối hợp.
- **Điều kiện trước:** có tài khoản/email cần xác minh và yêu cầu gắn đúng đối tượng.
- **Luồng:** gửi thông tin xác minh → khách thực hiện hướng dẫn → kiểm tra bằng chứng → ghi email đã xác minh.
- **Kết quả:** đáp ứng điều kiện email để giữ ghế/mua vé.
- **Ngoại lệ:** bằng chứng sai/hết hiệu lực hoặc email không tới: không tự xác minh; xử lý gửi lại theo chính sách chưa chốt.
- **Quy tắc:** BR-02; OPEN-09. Không lấy số chữ số, hạn mã/quota từ UI mẫu làm yêu cầu.

### A-03 — Đăng nhập

- **Actor/kích hoạt:** người có tài khoản khách hoặc được cấp vai trò vận hành muốn truy cập chức năng xác thực.
- **Điều kiện trước:** có thông tin đăng nhập; quyền vận hành phải được cấp nội bộ nếu cần.
- **Luồng:** cung cấp email/mật khẩu → xác thực → thiết lập phiên → truy cập chức năng thuộc quyền.
- **Kết quả:** có phiên hợp lệ; đăng nhập không tự cấp quyền hoặc xác minh email.
- **Ngoại lệ:** thông tin/phiên sai hoặc quyền đã thu hồi: không cho dùng chức năng tương ứng; có thể chuyển A-05.
- **Quy tắc:** BR-01…BR-02. Phiên là điều kiện trước của use case khác, không include đăng nhập vào mọi hành động.

### A-04 — Quản lý hồ sơ và mật khẩu

- **Actor/kích hoạt:** khách hàng muốn cập nhật hồ sơ hoặc đổi mật khẩu của mình.
- **Điều kiện trước:** phiên và quyền sở hữu hợp lệ; kiểm tra bằng chứng cần thiết cho thay đổi nhạy cảm.
- **Luồng:** xem dữ liệu hiện có → nhập thay đổi → kiểm tra → lưu → trả kết quả thực tế.
- **Kết quả:** dữ liệu được cập nhật khi thành công.
- **Ngoại lệ:** đầu vào/bằng chứng sai hoặc lưu lỗi: không báo thành công. Đổi email, lưu trữ/xóa tài khoản còn OPEN-10.
- **Quy tắc:** BR-02. Điện thoại tùy chọn; không suy SMS/Google login/2FA từ UI mẫu.

### A-05 — Khôi phục mật khẩu

- **Actor/kích hoạt:** người dùng mất quyền đăng nhập chọn quên mật khẩu; dịch vụ email phối hợp.
- **Điều kiện trước:** có cách chứng minh quyền kiểm soát email tài khoản.
- **Luồng:** yêu cầu khôi phục → gửi hướng dẫn qua email → xác minh → đặt mật khẩu mới → xác nhận kết quả.
- **Kết quả:** khôi phục quyền đăng nhập khi xác minh đạt; không thay đổi vai trò vận hành.
- **Ngoại lệ:** bằng chứng sai/không nhận được email: không đổi mật khẩu; ngoại lệ mất email cần quy trình riêng.
- **Quy tắc:** BR-02; OPEN-09/OPEN-10. Mã đơn/QR không thay thế bằng chứng khôi phục tài khoản.

## Đặt vé và thanh toán

### B-01 — Lập đơn đặt vé

- **Actor/kích hoạt:** khách hàng chọn suất và muốn mua ghế, qua Web/Mobile trực tiếp hoặc chat.
- **Điều kiện trước:** đăng nhập, email đã xác minh; suất cho phép bán; sơ đồ/giá lấy từ Core.
- **Luồng:** (1) chọn ghế theo phòng; (2) tại `EP-COMBO` có thể chạy B-03; (3) tại `EP-VOUCHER` có thể chạy B-04; (4) xem giá do Core xác định, xác nhận danh sách ghế/tổng tiền; (5) **include B-02**; (6) tạo đơn gắn hold hợp lệ, hiển thị hạn còn lại.
- **Kết quả:** đơn chờ thanh toán, chưa có vé phát hành. B-05 là tương tác tiếp theo; không nối include để diễn tả thứ tự.
- **Ngoại lệ:** tranh chấp ghế, vượt giới hạn, thiếu cặp, giá thay đổi, hold khác đang tồn tại hoặc hết hạn: báo rõ và để khách quyết định lại; không âm thầm đổi ghế/giá.
- **Quy tắc:** BR-02…BR-05, BR-17. Đổi kênh không tạo trùng hoặc khởi động lại TTL. Combo/voucher không bắt buộc.

### B-02 — Giữ ghế nguyên tử

- **Actor/kích hoạt:** khách hàng qua B-01 xác nhận danh sách ghế.
- **Điều kiện trước:** đúng khách/suất; còn được giữ; không có hold khác đang hiệu lực.
- **Luồng:** Core kiểm tra số ghế/cặp Sweetbox/tồn kho → chiếm toàn bộ danh sách nguyên tử → trả mã và thời điểm hết hạn sau 300 giây.
- **Kết quả:** giữ tất cả hoặc không giữ ghế nào của yêu cầu.
- **Ngoại lệ:** một ghế tranh chấp thì từ chối toàn bộ. Có hold khác thì không âm thầm thay thế; khách tiếp tục hoặc hủy bằng B-08. Gửi lại không tạo hold/gia hạn trùng.
- **Quy tắc:** BR-04…BR-05: tối đa 6 ghế, cả cặp Sweetbox, một hold/tài khoản; nguồn giờ từ Core.

### B-03 — Thêm combo vào đơn

- **Actor/kích hoạt:** khách hàng chọn mua kèm tại `EP-COMBO` của B-01.
- **Điều kiện trước:** đang lập đơn theo suất/rạp, có danh mục combo hợp lệ.
- **Luồng:** xem combo phù hợp → chọn loại/số lượng → Core kiểm tra và tính giá → phản ánh vào tổng tiền trước xác nhận.
- **Kết quả:** có dòng combo trong đơn; chưa phải đã trả tiền/nhận hàng.
- **Ngoại lệ:** không cung cấp/không áp dụng hoặc giá đổi: thông báo, không tự thay combo.
- **Quy tắc:** BR-13. **Extend B-01**; OPEN-02/OPEN-07 về chủ sở hữu danh mục, nhận hàng và hoàn combo.

### B-04 — Áp dụng voucher vào đơn

- **Actor/kích hoạt:** khách hàng chọn/nhập mã tại `EP-VOUCHER` của B-01.
- **Điều kiện trước:** có quyền dùng voucher và điều kiện áp dụng đã xác định.
- **Luồng:** kiểm tra quyền/hạn/điều kiện → tính lại tiền → khách xem tổng trước xác nhận.
- **Kết quả:** ưu đãi hợp lệ được ghi vào giá đơn.
- **Ngoại lệ:** mã sai/đã dùng/không đủ điều kiện: không áp dụng; khách có thể tiếp tục không mã.
- **Quy tắc:** **Extend B-01**; voucher đổi điểm dùng cùng luồng. Không tự tạo giảm giá từ chuỗi mã bất kỳ. Cộng dồn, đơn 0 đồng và xử lý sau hủy: OPEN-02.

### B-05 — Thanh toán đơn

- **Actor/kích hoạt:** khách hàng xác nhận trả tiền; MoMo/VNPAY phối hợp.
- **Điều kiện trước:** đúng chủ đơn, hold còn hiệu lực, Core kiểm tra số tiền.
- **Luồng:** chọn cổng → Core khởi tạo giao dịch gắn đúng đơn/tiền → khách thực hiện trên phương tiện cổng → ứng dụng đọc trạng thái do Core cung cấp.
- **Kết quả:** đã khởi tạo/thực hiện giao dịch; chỉ coi mua thành công sau kết quả hợp lệ ở B-06.
- **Ngoại lệ:** bỏ dở, từ chối, timeout/hết hold: phản ánh đúng tình trạng; không gia hạn, không coi redirect thành công là đã phát vé. Gửi lại/chuyển kênh không được thu trùng.
- **Quy tắc:** BR-05…BR-06, BR-17. Chưa rõ thanh toán thì tiếp tục đối soát.

### B-06 — Xử lý kết quả thanh toán và phát hành vé

- **Actor/kích hoạt:** cổng thanh toán cung cấp callback/kết quả đối soát cho Core; dịch vụ email phối hợp gửi email vé sau khi Core xác nhận phát hành.
- **Điều kiện trước:** nhận diện được đơn/giao dịch; xác thực nguồn, toàn vẹn nội dung, số tiền và liên kết đơn.
- **Luồng:** (1) xác minh kết quả; (2) kiểm tra đã xử lý chưa; (3) thu tiền hợp lệ và quyền ghế còn được bảo đảm thì ghi nhận mua/phát hành quyền theo ghế cùng một QR; (4) cho khách tra cứu, phối hợp dịch vụ email gửi email vé cho tài khoản đứng tên đơn. Client/AI xác minh phản hồi/chữ ký Core trước khi trình bày vé là hợp lệ.
- **Kết quả:** đơn/vé xác nhận đúng một lần; chưa đánh dấu ghế đã vào.
- **Ngoại lệ:** giả/sai đơn/sai tiền: không phát vé; callback lặp: không phát/thu trùng; chưa rõ: kiểm tra tiếp; thu tiền sau khi ghế giải phóng: không tự đặt ghế khác, khởi tạo R-03 trả khoản thu, không yêu cầu khách xin hủy.
- **Quy tắc:** BR-05…BR-08. Email lỗi không biến vé đã xác nhận thành chưa thanh toán. Thời hạn/ngoại lệ đối soát còn OPEN-03/OPEN-09.
- **Ranh giới thông báo:** association với dịch vụ email thể hiện phối hợp gửi sau phát hành, chưa chọn cơ chế đồng bộ/xử lý nền. L-06 diễn giải việc khách xem thông báo và tra cứu trạng thái hiện hành; không tạo include/extend giữa hai mục tiêu để mô tả thứ tự gửi. Provider chọn Resend tại [ADR-0018](../06-decisions/0018-resend-for-transactional-email.md); chính sách gửi lại/lỗi email vẫn OPEN-09.

### B-07 — Xem đơn và vé

- **Actor/kích hoạt:** khách hàng mở lịch sử/chi tiết hoặc yêu cầu AI tra cứu.
- **Điều kiện trước:** phiên và quyền truy cập đúng đơn; xuất trình QR tại rạp không cấp quyền xem tài khoản.
- **Luồng:** lấy trạng thái có thẩm quyền → hiển thị đơn, ghế, tiền, QR nếu đã phát hành, phần đã soát/hủy và hoàn tiền liên quan.
- **Kết quả:** khách biết trạng thái; có thể lưu QR để xuất trình khi điện thoại không có mạng.
- **Ngoại lệ:** không tìm thấy/ngoài quyền: không trả vé mẫu thay thế; dữ liệu lưu cũ/chưa rõ không được coi là trạng thái mới đã xác nhận.
- **Quy tắc:** BR-06…BR-08. QR chung có thể gửi cho nhóm; người giữ QR có thể xuất trình quyền còn lại, không chứng minh danh tính riêng từng người.

### B-08 — Hủy lượt giữ ghế chưa thanh toán

- **Actor/kích hoạt:** khách hàng muốn bỏ lựa chọn đang giữ.
- **Điều kiện trước:** sở hữu hold chưa chuyển thành mua thành công.
- **Luồng:** xác định hold → khách xác nhận bỏ → Core giải phóng nếu còn được phép → trả trạng thái hiện hành.
- **Kết quả:** không còn dành ghế theo hold; đây không phải hủy vé đã mua.
- **Ngoại lệ:** đã hết hạn/đã hủy: trả nhất quán; thanh toán đang xử lý/đã xác nhận: kiểm tra lại, không hủy mù một khoản đã thu. Thu tiền muộn sau giải phóng xử lý B-06/R-03.
- **Quy tắc:** BR-04…BR-06. Không làm hồ sơ thanh toán biến mất theo hold.

## Hủy, hoàn tiền và hủy suất

### R-01 — Gửi yêu cầu hủy vé đã mua

- **Actor/kích hoạt:** khách hàng muốn hủy cả đơn hoặc một phần, trực tiếp/chat.
- **Điều kiện trước:** đúng chủ đơn; vé chưa soát, suất chưa bắt đầu; chính sách áp dụng đã công bố.
- **Luồng:** chọn ghế/cặp → kiểm tra điều kiện → trình bày phạm vi và khoản hoàn theo chính sách nếu xác định được → khách xác nhận → ghi yêu cầu chờ xét, cung cấp cách theo dõi.
- **Kết quả:** tiếp nhận yêu cầu; vé vẫn hiệu lực, chưa hủy/chưa hoàn.
- **Ngoại lệ:** đã dùng/đã hủy, suất bắt đầu, thiếu nửa cặp hoặc yêu cầu trùng: không nhận lệnh sai; chính sách chưa chốt thì không bịa mức hoàn.
- **Quy tắc:** BR-10…BR-11, BR-17; OPEN-01…OPEN-02. AI cần xác nhận rõ danh sách trước gửi.

### R-02 — Xét duyệt yêu cầu hủy

- **Actor/kích hoạt:** quản lý rạp xét yêu cầu; quản trị viên xử lý ngoại lệ.
- **Điều kiện trước:** có quyền đúng rạp/yêu cầu và chính sách áp dụng.
- **Luồng:** xem yêu cầu → kiểm tra lại vé chưa soát, suất chưa bắt đầu, cặp và tiền hoàn → duyệt/từ chối có lý do/chuyển ngoại lệ → lưu quyết định, thông báo.
- **Kết quả:** quyết định truy vết được; nếu duyệt thì vô hiệu đúng quyền ghế được hủy, khởi tạo R-03; phần còn lại giữ hiệu lực.
- **Ngoại lệ:** vé vừa dùng trong lúc chờ: không duyệt từ ảnh trạng thái cũ; hai người quyết định không tạo hủy/hoàn trùng; thiếu chính sách/thẩm quyền không tự duyệt.
- **Quy tắc:** BR-10…BR-11. Soát và duyệt hủy không thể cùng thành công cho một ghế. Đưa ghế trở lại bán cần OPEN-05. Quyết định duyệt chưa có nghĩa tiền về.

### R-03 — Thực hiện và theo dõi giao dịch hoàn tiền

- **Actor/kích hoạt:** cổng thanh toán phối hợp; quản lý rạp và quản trị viên toàn chuỗi theo dõi giao dịch trong phạm vi được cấp. Bắt đầu từ quyết định hủy, hủy suất hoặc khoản thu muộn cần trả lại.
- **Điều kiện trước:** có khoản thu xác nhận, căn cứ, số tiền và kiểm tra chưa hoàn trùng; khi có người vận hành truy cập theo dõi, phải có quyền với rạp/giao dịch.
- **Luồng:** Core lập hồ sơ gắn khoản thu/căn cứ → gửi lệnh tới cổng → xác thực/đối soát kết quả → cập nhật tiến độ và thông báo; quản lý rạp/quản trị viên theo dõi tiến độ giao dịch theo quyền.
- **Kết quả:** chỉ ghi tiền đã hoàn khi có xác nhận; nếu chưa có thì còn đang xử lý/chưa rõ.
- **Ngoại lệ:** lỗi/timeout/callback lặp: giữ căn cứ, không báo thành công sớm hoặc tạo thêm khoản hoàn. Hoàn thất bại không tự khôi phục vé đã hủy.
- **Quy tắc:** BR-06, BR-11…BR-12; OPEN-01…OPEN-03. Không include vô điều kiện từ xét duyệt vì có thể bị từ chối và hoàn diễn ra bất đồng bộ.
- **Phạm vi vận hành:** quản lý rạp theo dõi giao dịch thuộc rạp được giao; quản trị viên toàn chuỗi theo quyền toàn chuỗi. Association ở R-03 thể hiện quyền theo dõi, không tự cấp quyền hoàn tiền thủ công hoặc xử lý mọi sự cố; thẩm quyền/biện pháp cụ thể vẫn cần chốt ở OPEN-01/OPEN-03.

### R-04 — Theo dõi yêu cầu hủy và hoàn tiền

- **Actor/kích hoạt:** khách hàng, quản lý rạp hoặc quản trị viên toàn chuỗi muốn biết tiến độ theo quyền/phạm vi.
- **Điều kiện trước:** có quyền xem hồ sơ; khách hàng xem hồ sơ thuộc mình, quản lý rạp xem rạp được giao, quản trị viên toàn chuỗi xem theo quyền toàn chuỗi.
- **Luồng:** đọc yêu cầu/quyết định/ghế/giao dịch hoàn → trình bày riêng xét duyệt với tiền → cho xem lý do và thông báo.
- **Kết quả:** không nhầm đã duyệt với đã hoàn; các ghế còn lại thể hiện độc lập.
- **Ngoại lệ:** nguồn/cổng chưa rõ: nói điều chưa xác nhận; AI không đoán ngày tiền về.
- **Quy tắc:** BR-11, BR-17. Có kênh chat cho khách theo Q30-B.

### R-05 — Đề nghị hủy suất đã bán vé

- **Actor/kích hoạt:** quản lý rạp không thể tiếp tục cung cấp một suất đã bán.
- **Điều kiện trước:** đúng phạm vi rạp, nhận diện suất và ảnh hưởng.
- **Luồng:** chọn suất → ghi lý do, xem đơn/ghế liên quan → gửi cấp chuỗi.
- **Kết quả:** có đề nghị chờ R-06; chưa tự hủy/hoàn toàn bộ khách.
- **Ngoại lệ:** trùng đề nghị, ngoài quyền hoặc dữ liệu đổi: kiểm tra lại; biện pháp tạm dừng bán khi chờ duyệt còn OPEN-05.
- **Quy tắc:** BR-12. Không áp điều kiện khách xin hủy như thể lỗi thuộc khách.

### R-06 — Duyệt đề nghị hủy suất

- **Actor/kích hoạt:** quản trị viên toàn chuỗi nhận đề nghị R-05.
- **Điều kiện trước:** có quyền, lý do và dữ liệu ảnh hưởng hiện hành.
- **Luồng:** xem đề nghị → kiểm tra → duyệt hoặc từ chối có lý do → lưu quyết định; phần duyệt kích hoạt R-07.
- **Kết quả:** có quyết định; từ chối không tự tạo khoản hoàn.
- **Ngoại lệ:** suất/đề nghị đã đổi hoặc đã có quyết định: không thực thi lặp.
- **Quy tắc:** BR-12. R-07 là sự kiện xử lý tiếp, không include/extend để biểu diễn thứ tự.

### R-07 — Thực thi quyết định hủy suất

- **Kích hoạt:** R-06 đã duyệt; dịch vụ email phối hợp. Core thực thi nội bộ, không tạo actor “System”.
- **Điều kiện trước:** quyết định hợp lệ gắn đúng suất, có chính sách hoàn.
- **Luồng:** ngừng bán → vô hiệu quyền vào suất → xác định khoản hoàn, khởi tạo R-03 → thông báo khách → theo dõi từng đơn.
- **Kết quả:** không bán/nhận vào mới; giữ hồ sơ từng khách, không coi mọi tiền đã hoàn chỉ vì suất đã hủy.
- **Ngoại lệ:** một khoản hoàn/email lỗi thì theo dõi riêng; sự cố sau bắt đầu còn OPEN-05, không xóa lịch sử vé đã dùng.
- **Quy tắc:** BR-12; OPEN-02/OPEN-04 về combo và điểm. Không tự gán hoàn 100% hoặc 0%.

## Tại rạp

### O-01 — Soát vé theo từng ghế

- **Actor/kích hoạt:** nhân viên soát vé tiếp khách tại cửa phòng.
- **Điều kiện trước:** có quyền tại rạp, thiết bị kết nối Core, xác định được suất/phòng.
- **Luồng:** (1) nhận QR; tại `EP-PROOF`, nếu thiếu QR thì chạy O-02; (2) đọc quyền hiện hành, chọn các ghế của người đang đến; (3) **include O-05**; (4) Core ghi nhận sử dụng chống hai cửa dùng cùng ghế; (5) hiển thị kết quả đã xác nhận.
- **Kết quả:** chỉ ghế được chấp nhận thành đã vào; ghế còn lại vẫn được xuất trình sau. Sweetbox có thể vào riêng từng người.
- **Ngoại lệ:** sai suất/phòng, bằng chứng sai, vé đã dùng/hủy: không chấp nhận quyền đó. Mất mạng/kết quả chưa rõ: không báo thành công; kiểm tra lại trước khi thử, không ghi nhận ngoại tuyến.
- **Quy tắc:** BR-07…BR-09. Quét lại QR để dùng ghế còn lại là hợp lệ; chống dùng lặp theo ghế, không cấm toàn bộ QR sau lần đầu.

### O-02 — Xác minh khách khi không có QR

- **Actor/kích hoạt:** nhân viên soát vé và khách hàng; dịch vụ email phối hợp khi thiếu QR ở `EP-PROOF`.
- **Điều kiện trước:** tra cứu đúng đơn, có email đã xác minh của tài khoản đứng tên đơn; nhân viên đúng rạp.
- **Luồng:** gửi mã tới email đã xác minh → khách cung cấp mã → kiểm tra bằng chứng gắn đúng đơn/mục đích → trở lại O-01 chọn ghế và kiểm tra O-05.
- **Kết quả:** có bằng chứng thay việc xuất trình QR; chưa đánh dấu cả đơn đã vào.
- **Ngoại lệ:** mã sai/hết hiệu lực, không nhận/truy cập được email: không bỏ qua; chuyển quản lý theo quy trình chưa chốt.
- **Quy tắc:** BR-09; OPEN-06/OPEN-09. **Extend O-01**; không phải mọi lần soát đều cần OTP. Tên/điện thoại/mã đơn đơn thuần không đủ.

### O-03 — Tra cứu hỗ trợ tại cửa

- **Actor/kích hoạt:** nhân viên soát vé giúp khách tìm đơn/vé hoặc hiểu trạng thái.
- **Điều kiện trước:** có quyền trong rạp và yêu cầu hỗ trợ phù hợp.
- **Luồng:** tra cứu → lấy dữ liệu cần thiết đúng phạm vi → xem suất/ghế/tình trạng → hướng dẫn sang O-01/O-02 hoặc quy trình phù hợp.
- **Kết quả:** khách được hỗ trợ; chưa thay đổi quyền dùng hoặc cấp quyền xem toàn tài khoản.
- **Ngoại lệ:** không tìm thấy, nhiều kết quả, ngoài rạp: không tiết lộ dữ liệu khách khác để suy đoán; không sửa giá/hủy/hoàn.
- **Quy tắc:** BR-01, BR-09. Tra cứu và chứng minh quyền sử dụng là hai việc khác nhau.

### O-04 — Xác nhận giao combo

- **Actor/kích hoạt:** nhân viên quầy bắp nước tiếp khách muốn nhận combo.
- **Điều kiện trước:** có quyền tại rạp, xác định được quyền nhận combo và trạng thái thanh toán/hủy hiện hành.
- **Luồng:** tra cứu quyền nhận → kiểm tra combo/số lượng còn được nhận → giao đúng phần được xác nhận → ghi nhận đã giao, trả kết quả.
- **Kết quả:** phần đã giao không được nhận lại; không thay đổi trạng thái soát ghế.
- **Ngoại lệ:** đã nhận/chưa thanh toán/đã vô hiệu/ngoài rạp: không giao theo dữ liệu cũ. Ghi nhận chưa rõ phải tra cứu trước khi thử lại.
- **Quy tắc:** BR-13; OPEN-02/OPEN-07. Cách chứng minh quyền nhận không QR, nhận từng phần, thời hạn, thiếu hàng chưa chốt; không giả định có quản lý kho.

### O-05 — Kiểm tra quyền vào rạp của các ghế

- **Loại/kích hoạt:** hành vi include của O-01; không phải actor hoặc một quyền riêng để bỏ quy trình soát.
- **Điều kiện trước:** O-01 có bằng chứng và tập ghế muốn ghi nhận.
- **Luồng:** Core kiểm tra nguồn/chữ ký QR hoặc bằng chứng email thay thế → đúng suất/phòng, quyền từng ghế còn hiệu lực, chưa soát/chưa hủy → kiểm tra lại đồng thời với ghi nhận sử dụng.
- **Kết quả:** chấp nhận/từ chối đúng ghế; không dựa riêng trạng thái chung của đơn.
- **Ngoại lệ:** ảnh QR cũ không cho dùng ghế đã hủy/đã soát; hai yêu cầu đồng thời không được cùng dùng thành công một ghế.
- **Quy tắc:** BR-07…BR-09. Khung giờ vào/đến muộn/kiểm tra tuổi chưa có giá trị mặc định (OPEN-06).

## Cộng đồng và hội viên

### L-01 — Xem điểm và quyền lợi hội viên

- **Actor/kích hoạt:** khách hàng mở trang hội viên.
- **Điều kiện trước:** đăng nhập; tư cách hội viên có từ khi tạo tài khoản.
- **Luồng:** lấy điểm/quyền lợi và lịch sử → trình bày điều kiện đổi đã công bố.
- **Kết quả:** biết số điểm thực tế có thể dùng, không tính từ tổng tiền UI.
- **Ngoại lệ:** dữ liệu chưa xác nhận: không tự cộng ước lượng. Điểm phát sinh theo phần vé đã soát của tài khoản đặt, không cộng lại do xử lý lặp.
- **Quy tắc:** BR-14; OPEN-04. Xem điểm khác với sự kiện cộng điểm; không include “Xem điểm” vào soát vé.

### L-02 — Đổi điểm lấy voucher

- **Actor/kích hoạt:** khách hàng chọn quyền lợi muốn đổi.
- **Điều kiện trước:** đăng nhập, quyền lợi đang cung cấp, đủ điểm theo chính sách.
- **Luồng:** xem giá điểm/điều kiện → xác nhận → kiểm tra số dư/quyền lợi → trừ điểm và cấp voucher đúng một lần → xem kết quả.
- **Kết quả:** có voucher và biến động điểm tương ứng; dùng voucher bằng B-04.
- **Ngoại lệ:** thiếu điểm/quyền lợi không còn: không trừ; lỗi/gửi lặp không làm mất điểm mà thiếu quyền lợi hoặc cấp trùng; tra cứu kết quả chưa rõ trước đổi lại.
- **Quy tắc:** BR-15; OPEN-04. Không include B-04: khách có thể đổi hôm nay, dùng ở lần mua khác.

### L-03 — Quản lý phim yêu thích

- **Actor/kích hoạt:** khách hàng muốn lưu/bỏ lưu hoặc xem phim quan tâm.
- **Điều kiện trước:** đăng nhập, phim được xác định.
- **Luồng:** xem danh sách → thêm/bỏ → lưu theo tài khoản → trả kết quả.
- **Kết quả:** danh sách cá nhân được cập nhật; chưa giữ ghế hoặc đăng ký push.
- **Ngoại lệ:** phim không còn công bố/lưu lỗi: phản hồi rõ; đổi biểu tượng ở client chưa chứng minh đã lưu bền vững.
- **Quy tắc:** Q22–Q23. Không yêu cầu đã mua/xem phim mới được lưu yêu thích.

### L-04 — Viết, sửa hoặc xóa đánh giá phim

- **Actor/kích hoạt:** khách hàng đủ điều kiện muốn chia sẻ/cập nhật đánh giá.
- **Điều kiện trước:** tài khoản có vé phim đã soát; một đánh giá/tài khoản/phim, sửa/xóa đúng bài của mình.
- **Luồng:** kiểm tra điều kiện → nhập/cập nhật hoặc xác nhận xóa → lưu → hiển thị ngay nếu không bị ẩn bởi quyết định kiểm duyệt riêng.
- **Kết quả:** một đánh giá hiện hành hoặc đã xóa; không nhân bài theo số ghế/lần xem.
- **Ngoại lệ:** không có vé đủ điều kiện, không sở hữu bài, nội dung không hợp lệ: từ chối. Sửa bài đang bị ẩn không được tự coi là đã được khôi phục; cần OPEN-08.
- **Quy tắc:** BR-16. Tiêu chí gắn tài khoản đặt, không chứng minh từng người đi cùng; chưa cấp quyền đánh giá riêng chỉ vì cầm QR chung.

### L-05 — Ẩn đánh giá vi phạm

- **Actor/kích hoạt:** quản trị viên toàn chuỗi phát hiện nội dung vi phạm.
- **Điều kiện trước:** có quyền và bài xác định được.
- **Luồng:** xem nội dung/bằng chứng → ẩn, ghi lý do → lưu quyết định → không hiển thị công khai nội dung đã ẩn.
- **Kết quả:** bài bị ẩn có căn cứ; không sửa lời khách.
- **Ngoại lệ:** bài đã đổi/xóa hoặc thiếu quyền: kiểm tra lại. Tiêu chí, khiếu nại/khôi phục chưa chốt.
- **Quy tắc:** BR-16; OPEN-08. Không extend L-04: actor/thời điểm của kiểm duyệt là một tương tác khác.

### L-06 — Xem thông báo giao dịch

- **Actor/kích hoạt:** khách hàng mở thông báo/email giao dịch; dịch vụ email phối hợp gửi.
- **Điều kiện trước:** có quyền với thông báo và dữ liệu liên quan.
- **Luồng:** xem sự kiện vé, quyết định hủy, hoàn tiền, hủy suất → mở chi tiết → kiểm tra trạng thái hiện hành.
- **Kết quả:** biết sự kiện và có đường theo dõi; email cũ không thay Core.
- **Ngoại lệ:** email lỗi/lặp không thay kết quả giao dịch; trạng thái quan trọng vẫn tra cứu trong tài khoản.
- **Quy tắc:** Q19/Q22; OPEN-09. Không mặc định push/SMS, bản tin quảng cáo hoặc lịch nhắc cố định.

## Vận hành và quản trị

### M-01 — Quản lý danh mục phim và trailer

- **Actor/kích hoạt:** quản trị viên toàn chuỗi tạo/cập nhật nội dung phim.
- **Điều kiện trước:** có quyền; thông tin/media đáp ứng quy tắc danh mục.
- **Luồng:** nhập/sửa metadata/trailer → kiểm tra → lưu/công bố theo trạng thái → các kênh dùng cùng dữ liệu.
- **Kết quả:** danh mục cập nhật; không tự đổi quyền vé đã bán.
- **Phạm vi media đã chốt:** hệ thống upload/lưu poster, banner và ảnh; trailer dùng URL/video nhúng
  từ nguồn ngoài. Bản đầu không tự upload/lưu/phục vụ video trailer. Chủ sản phẩm chọn A ngày
  2026-11-17 trong hội thoại Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`) để giữ trọng tâm
  ở booking/Agent và kiến trúc phân tán. Storage/xử lý ảnh theo
  [ADR-0019](../06-decisions/0019-r2-and-cloudflare-images-for-catalog-media.md);
  nguồn video chưa chọn. Đây là phạm vi mục tiêu, chưa xác nhận tích hợp.
- **Ngoại lệ:** nội dung sai hoặc bản ghi có giao dịch phụ thuộc: không xóa mù lịch sử; thay đổi dữ liệu liên quan suất đã bán còn OPEN-05.
- **Quy tắc:** BR-01. Nhãn độ tuổi không chứng minh đã kiểm tra tuổi khách; cần OPEN-06.

### M-02 — Quản lý giá vé và ưu đãi

- **Actor/kích hoạt:** quản trị viên toàn chuỗi ban hành/cập nhật giá hoặc chương trình.
- **Điều kiện trước:** có quyền, biết phạm vi/điều kiện/thời gian hiệu lực.
- **Luồng:** cấu hình → kiểm tra nhất quán → công bố → Core áp dụng khi báo giá/xác nhận giao dịch.
- **Kết quả:** chính sách giá/ưu đãi dùng chung; không tin tổng tiền client gửi.
- **Ngoại lệ:** quy tắc xung đột/đầu vào sai hoặc ảnh hưởng đơn đã giữ/mua: không tự tính lại lịch sử bằng giá mới; cần OPEN-02/OPEN-05.
- **Quy tắc:** Q7, BR-06. Quyền quản lý danh mục combo/điểm còn OPEN-04/OPEN-07, không tự suy từ chức năng giá vé.

### M-03 — Quản lý phòng và sơ đồ ghế

- **Actor/kích hoạt:** quản lý rạp hoặc quản trị viên thiết lập/cập nhật phòng.
- **Điều kiện trước:** quyền đúng rạp/phòng, biết suất/đơn phụ thuộc.
- **Luồng:** khai báo sơ đồ/số ghế → chỉ định Standard/VIP/Sweetbox và cặp → kiểm tra → lưu cho các suất phù hợp.
- **Kết quả:** sơ đồ theo từng phòng, không ép 8×8/64 ghế.
- **Ngoại lệ:** định danh/cặp sai hoặc ảnh hưởng ghế đang giữ/đã bán: không tự chuyển khách/đổi ghế; cần OPEN-05.
- **Quy tắc:** BR-03…BR-04. Tối đa 6 ghế/lần đặt khác sức chứa phòng.

### M-04 — Quản lý lịch chiếu

- **Actor/kích hoạt:** quản lý rạp hoặc quản trị viên lập/cập nhật lịch.
- **Điều kiện trước:** đúng quyền, phim/phòng hợp lệ, lịch hiện hành.
- **Luồng:** chọn phim/phòng/ngày giờ → kiểm tra xung đột phòng, thời lượng, điều kiện công bố → lưu → cung cấp cho khách tra cứu/đặt.
- **Kết quả:** suất công bố có dữ liệu thống nhất giữa các kênh.
- **Ngoại lệ:** trùng lịch/phòng không khả dụng hoặc ảnh hưởng hold/vé: không âm thầm đổi lịch/phòng; thời gian đệm, đóng bán, sửa sau mua còn OPEN-05. Hủy suất đã bán theo R-05/R-06.
- **Quy tắc:** Q7, BR-12. Không đồng nhất hủy suất với khách tự đổi vé.

### M-05 — Cấp/thu hồi quyền quản lý rạp

- **Actor/kích hoạt:** quản trị viên toàn chuỗi bổ nhiệm/kết thúc quyền quản lý.
- **Điều kiện trước:** đúng thẩm quyền, xác định tài khoản/rạp.
- **Luồng:** chọn tài khoản/rạp → xác nhận cấp/thu hồi → lưu → kiểm tra truy cập theo quyền mới.
- **Kết quả:** chỉ có quyền trong phạm vi đã giao; giữ lịch sử thao tác/giao dịch sau thu hồi.
- **Ngoại lệ:** ngoài quyền/mục tiêu sai: từ chối; đăng ký công khai không được tự nâng quyền.
- **Quy tắc:** BR-01. Cấp quản trị viên đầu tiên là quy trình khởi tạo hệ thống, không phải đăng ký khách.

### M-06 — Cấp/thu hồi quyền nhân viên

- **Actor/kích hoạt:** quản lý rạp phân công nhân viên; quản trị viên có quyền quản lý tổng thể.
- **Điều kiện trước:** đúng rạp/thẩm quyền, xác định tài khoản.
- **Luồng:** chọn tài khoản → chỉ rõ quyền soát vé, quyền quầy hoặc cả hai → cấp/thu hồi → áp dụng khi truy cập.
- **Kết quả:** quyền tách biệt; có một vai trò không mặc định có vai trò kia.
- **Ngoại lệ:** quản lý muốn cấp quyền toàn chuỗi/quản lý rạp hoặc ngoài phạm vi: từ chối; quyền bị thu hồi không được tiếp tục dùng chỉ vì có phiên cũ.
- **Quy tắc:** BR-01, BR-13. Không tự thêm vai trò thu ngân, kế toán hoặc hỗ trợ khách riêng.

### M-07 — Xem báo cáo vận hành và doanh thu

- **Actor/kích hoạt:** quản lý rạp xem rạp được giao, quản trị viên xem toàn chuỗi.
- **Điều kiện trước:** có quyền và dữ liệu theo phạm vi.
- **Luồng:** chọn phạm vi/kỳ → tổng hợp giao dịch có căn cứ → hiển thị kết quả và giới hạn dữ liệu.
- **Kết quả:** báo cáo đúng quyền, phân biệt khoản thu/hủy/đã hoàn theo định nghĩa sẽ chốt.
- **Ngoại lệ:** dữ liệu thiếu/chưa đối soát/ngoài quyền: chỉ rõ giới hạn hoặc từ chối, không dùng số mẫu làm doanh thu thật.
- **Quy tắc:** BR-01; OPEN-10. Không mặc định xuất Excel, dự báo, kế toán hoặc số liệu thời gian thực.
