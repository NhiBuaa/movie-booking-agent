# Mô tả use case — Movie Booking Platform

Mô tả sản phẩm mục tiêu đồng bộ theo **Q173-A ngày 2026-11-17**, đọc cùng [mô hình/BR/quyết định](use-cases.md).
Mã/tên và actor khớp danh mục, không phải bằng chứng triển khai. BR là quy tắc sản phẩm;
OPEN giữ phần phụ thuộc đặc tả/kiểm chứng ở mục 6.2, không phủ nhận lựa chọn đã chốt.

Core là thẩm quyền bên trong nền tảng, không phải actor; mọi thao tác kiểm quyền tài khoản/rạp.
Actor phối hợp không đồng nghĩa có mọi quyền trong mọi nhánh. Các từ chỉ trạng thái không tự chọn enum/API.
Dịch vụ email ở N-01 sở hữu gửi/gửi lại thông báo sau các sự kiện; các luồng email chứng minh trực tiếp
vẫn có ACT-MAIL riêng. ACT-LLM chỉ phối hợp C-01 qua Agent Service, không xem đầy đủ hồ sơ hoặc ký vé.

[Thiết kế microservices](../05-specs/004-service-decomposition/spec.md) sở hữu phân chia trách nhiệm,
dữ liệu và giao tiếp giữa bảy service nội bộ. Mô tả một kết quả sản phẩm dưới đây không hàm ý mọi bước
cùng database/transaction hoặc Agent trực tiếp gửi lệnh giao dịch; app/BFF thực thi theo quyền khách.
Xác nhận gắn với đúng nội dung/phiên bản Core đã kiểm tra; thay đổi quan trọng phải xác nhận lại.
Timeout tra cứu mã thao tác cũ, không mặc định tạo lệnh mới. Token/bí mật không vào prompt/checkpoint.

## Tài khoản và khám phá

### D-01 — Khám phá phim, rạp và suất chiếu

- **Actor/kích hoạt:** Khách chưa đăng nhập; Khách hàng. Mục tiêu: khám phá phim, rạp và suất chiếu.
- **Điều kiện trước:** Thông tin được công bố; đọc phim/rạp/suất và đánh giá không cần đăng nhập.
- **Luồng chính:** Duyệt hoặc nhập tiêu chí → xem phim/trailer/phân loại, lịch/giá, đánh giá công khai → chọn suất. Chat qua C-01 khi cần.
- **Kết quả:** Có lựa chọn xem phim; chưa giữ ghế/mua vé. Điểm là trung bình cộng 1–5 sao từ bài công khai chưa xóa, một chữ số thập phân và số lượt.
- **Ngoại lệ:** Không có kết quả hoặc nguồn gián đoạn thì nói rõ, không bịa suất. Chưa có bài thì ghi “Chưa có đánh giá”; bài che cốt truyện vẫn tính, nội dung chỉ mở khi người đọc chủ động chọn.
- **Quy tắc:** BR-02, BR-16, BR-32; không suy đọc lịch là bảo đảm còn ghế.
- **Nguồn quyết định:** Q1–Q4, Q22, Q139, Q144–Q145.

- **Khám phá nâng cấp:** tìm tên/alias, không dấu/lỗi gõ và theo mô tả nội dung; kết hợp từ khóa/ngữ nghĩa.
  Theo BR-43, hồ sơ dùng sở thích khai báo/yêu thích/đánh giá/mua đã xác nhận và lượt xem chi tiết/click/search;
  không tự nhập toàn bộ chat. Khách chỉ theo phiên, tài khoản có hồ sơ lâu dài/xuyên thiết bị.
  Không bắt đăng nhập hoặc hỏi sở thích lúc bắt đầu; người mới khám phá ngay theo danh mục/ngữ cảnh.
- **Khi LLM/embedding gián đoạn:** giữ tìm kiếm từ khóa/bộ lọc/danh mục và dữ liệu hợp lệ có sẵn;
  tìm kiếm trực tiếp không phụ thuộc hội thoại Agent theo
  [ADR-0035](../06-decisions/0035-search-module-in-cinema-core.md). Cách suy giảm khi chính index lỗi cần đặc tả riêng.
- **Thứ hạng đã chốt:** BR-42 ưu tiên truy vấn, tên phim/alias khớp chính xác đứng trước;
  hồ sơ sở thích chỉ điều chỉnh giữa các kết quả có độ phù hợp tương đương. Trang khám phá có thể
  cá nhân hóa mạnh hơn, vẫn giữ đúng bộ lọc. Công thức/trọng số và ngưỡng tương đương cần đặc tả/đánh giá.
- **Kiểm soát cá nhân hóa đã chốt:** BR-40 cho bật/tắt học và dùng hồ sơ sở thích, đặt lại dữ liệu đã học;
  tìm theo truy vấn/bộ lọc vẫn dùng được. Đặt lại không xóa đơn/vé; chưa thêm xem/xóa từng tương tác.
  BR-41: khi đăng nhập, không nhập hành vi phiên khách; giữ hồ sơ tài khoản hiện có và học tiếp từ
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
- **Nguồn quyết định:** Q19, Q21, Q25.

### A-02 — Xác minh email

- **Actor/kích hoạt:** Khách hàng; Dịch vụ email. Mục tiêu: xác minh email.
- **Điều kiện trước:** Có tài khoản/email cần xác minh, yêu cầu gắn đúng chủ thể.
- **Luồng chính:** Gửi hướng dẫn qua dịch vụ email → khách cung cấp bằng chứng → kiểm tra hiệu lực/mục đích → ghi email đã xác minh.
- **Kết quả:** Đáp ứng điều kiện email để giữ ghế/mua vé.
- **Ngoại lệ:** Bằng chứng sai/hết hạn hoặc email không đến: không tự xác minh; gửi lại có kiểm tra quyền/chống spam, không phát lại mã đã hết hạn. Thông số bảo mật/gửi lại cụ thể còn cần đặc tả.
- **Quy tắc:** BR-02, BR-33; OPEN-09, không lấy hạn/quota từ UI mẫu.
- **Nguồn quyết định:** Q19, Q149, Q154.

### A-03 — Đăng nhập

- **Actor/kích hoạt:** khách chưa đăng nhập, gồm người đã có tài khoản khách hoặc được cấp vai trò vận hành muốn truy cập chức năng xác thực.
- **Điều kiện trước:** có thông tin đăng nhập; quyền vận hành phải được cấp nội bộ nếu cần.
- **Luồng:** cung cấp email/mật khẩu → xác thực → thiết lập phiên → truy cập chức năng thuộc quyền.
- **Kết quả:** có phiên hợp lệ; đăng nhập không tự cấp quyền hoặc xác minh email.
- **Ngoại lệ:** thông tin/phiên sai hoặc quyền đã thu hồi: không cho dùng chức năng tương ứng; có thể chuyển A-05.
- **Quy tắc:** BR-01…BR-02. Phiên là điều kiện trước của use case khác, không include đăng nhập vào mọi hành động.
- **Nguồn quyết định:** Q4, Q19, Q21, Q163.

### A-04 — Quản lý hồ sơ và mật khẩu

- **Actor/kích hoạt:** Khách hàng; Dịch vụ email. Mục tiêu: quản lý hồ sơ và mật khẩu.
- **Điều kiện trước:** Phiên/quyền chủ tài khoản hợp lệ; thay đổi nhạy cảm cần xác thực lại.
- **Luồng chính:** Xem hồ sơ → nhập đổi hồ sơ/mật khẩu; nếu đổi email thì kiểm mật khẩu, email mới chưa thuộc tài khoản khác, gửi xác minh cả email cũ/mới qua dịch vụ email → đủ bằng chứng mới cập nhật.
- **Kết quả:** Đổi thành công giữ nguyên tài khoản, đơn/vé/điểm; thông báo mới gửi email mới đã xác minh qua N-01.
- **Ngoại lệ:** Không đủ bằng chứng không đổi. Mất hộp thư cũ hướng khôi phục qua nhà cung cấp; không đổi tay bằng QR/mã đơn/bằng chứng trả tiền. Xóa chat/tài khoản dùng A-06/A-07.
- **Quy tắc:** BR-02, BR-36; điện thoại tùy chọn, chưa SMS/đăng nhập mạng xã hội/2FA.
- **Nguồn quyết định:** Q22, Q162–Q163.

### A-05 — Khôi phục mật khẩu

- **Actor/kích hoạt:** Khách chưa đăng nhập; Dịch vụ email. Mục tiêu: khôi phục mật khẩu.
- **Điều kiện trước:** Chứng minh được quyền kiểm soát email tài khoản; đây là điểm vào khi chưa đăng nhập, kể cả người có tài khoản vận hành.
- **Luồng chính:** Yêu cầu khôi phục → email hướng dẫn → kiểm bằng chứng → đặt mật khẩu mới → trả kết quả.
- **Kết quả:** Khôi phục quyền đăng nhập, không cấp thêm vai trò hoặc đổi định danh tài khoản.
- **Ngoại lệ:** Mất email phải khôi phục hộp thư qua nhà cung cấp trước. Còn mật khẩu vẫn đăng nhập bằng địa chỉ cũ theo quyền; mất cả mật khẩu và hộp thư không khôi phục được thì chưa có đường dự phòng. Không dùng đơn/QR/thanh toán làm bằng chứng thay thế.
- **Quy tắc:** BR-02, BR-36; quyền yêu cầu xử lý dữ liệu vẫn được xét riêng, không tự bị từ chối vì luồng khôi phục này.
- **Nguồn quyết định:** Q19, Q163.

## Đặt vé và thanh toán

### B-01 — Lập đơn đặt vé

- **Actor/kích hoạt:** Khách hàng. Mục tiêu: lập đơn đặt vé.
- **Điều kiện trước:** Đăng nhập/email xác minh, không đang chờ đóng tài khoản, suất còn nhận hold trước T−5 phút; sơ đồ/giá lấy Core.
- **Luồng chính:** Chọn ghế theo phòng → tại EP-COMBO có thể B-03, tại EP-VOUCHER có thể B-04 → xem phân loại phim/giới hạn giờ trẻ em/giấy tờ và xác nhận cả nhóm đáp ứng → xem giá/phân bổ, xác nhận ghế/tổng → include B-02 → tạo đơn gắn hold, hiển thị hạn còn lại.
- **Kết quả:** Có đơn chưa xác nhận mua; B-05 là bước xác nhận tiếp theo, B-06 mới phát hành. Không bắt khai tuổi từng người hoặc gửi giấy tờ.
- **Ngoại lệ:** Ghế tranh chấp/thiếu cặp/vượt 6 ghế/hold khác/hết hạn/giá đổi/suất dừng bán: báo rõ, không tự thay giá/ghế. Không nhận hold từ T−5; không khởi động lại TTL khi đổi kênh.
- **Quy tắc:** BR-02…BR-05, BR-17…BR-18, BR-20…BR-21, BR-31; combo/voucher là lựa chọn, không bắt buộc.
- **Nguồn quyết định:** Q8–Q9, Q49, Q128.

### B-02 — Giữ ghế nguyên tử

- **Actor/kích hoạt:** khách hàng qua B-01 xác nhận danh sách ghế.
- **Điều kiện trước:** đúng khách/suất; còn được giữ trước T−5 phút, không đang chờ đóng tài khoản; không có hold khác đang hiệu lực.
- **Luồng:** Core kiểm tra số ghế/cặp Sweetbox/tồn kho → chiếm toàn bộ danh sách nguyên tử → trả mã và thời điểm hết hạn sau 300 giây.
- **Kết quả:** giữ tất cả hoặc không giữ ghế nào của yêu cầu.
- **Ngoại lệ:** một ghế tranh chấp thì từ chối toàn bộ. Có hold khác thì không âm thầm thay thế; khách tiếp tục hoặc hủy bằng B-08. Gửi lại không tạo hold/gia hạn trùng.
- **Quy tắc:** BR-04…BR-05: tối đa 6 ghế, cả cặp Sweetbox, một hold/tài khoản; nguồn giờ từ Core.
- **Nguồn quyết định:** Q9, Q49.

### B-03 — Thêm combo vào đơn

- **Actor/kích hoạt:** Khách hàng. Mục tiêu: thêm combo vào đơn.
- **Điều kiện trước:** Đang lập đơn cho suất/rạp; combo trong danh mục quản trị và rạp đang cung cấp.
- **Luồng chính:** Tại EP-COMBO xem loại/thành phần/giá/ca phục vụ → chọn số lượng → Core kiểm tra/tính và đưa vào tổng trước xác nhận.
- **Kết quả:** Có dòng combo chưa trả/nhận; khách biết nhận toàn bộ một lần trong ca gắn ngày chiếu, có thể qua 0 giờ.
- **Ngoại lệ:** Không cung cấp hoặc giá đổi thì báo, không tự thay. Thiếu hàng sau mua xử lý O-07, không cấp quyền tùy ý đổi combo.
- **Quy tắc:** Extend B-01; BR-13, BR-23…BR-24. Không mở quản lý kho vật lý.
- **Nguồn quyết định:** Q22, Q53.

### B-04 — Áp dụng voucher vào đơn

- **Actor/kích hoạt:** Khách hàng. Mục tiêu: áp dụng voucher vào đơn.
- **Điều kiện trước:** Có quyền dùng mã/voucher và đủ điều kiện chương trình; mã đổi điểm phải của tài khoản đã đổi.
- **Luồng chính:** Tại EP-VOUCHER khách chọn tối đa một mã → Core chọn tối đa một ưu đãi tự động/phần có lợi nhất có xét mã; chỉ kết hợp nếu cho phép, tự động trước/mã sau → phân bổ giảm chung tỷ lệ giá ngay trước mỗi khoản, làm xuống và chia từng đồng dư theo số lẻ lớn nhất/thứ tự cố định → khách xem thực trả từng phần và xác nhận, lưu phân bổ lúc mua.
- **Kết quả:** Ưu đãi hợp lệ/trần/phạm vi được giữ cùng đơn; hủy một phần không tính lại phần còn lại. Tổng có thể bằng 0đ.
- **Ngoại lệ:** Mã sai/hết hạn/đã dùng/khác chủ/xung đột thì báo để khách chọn, không âm thầm đổi giá đã xác nhận. Giảm không vượt phần đủ điều kiện. Voucher đổi điểm dùng một lần không giữ giảm dư, không chuyển/tặng.
- **Quy tắc:** Extend B-01; BR-20…BR-22, BR-28; khôi phục/cấp bù theo Q79–Q87, không tự trả cả điểm lẫn voucher.
- **Nguồn quyết định:** Q74–Q87, Q110–Q113, Q171.

### B-05 — Thanh toán đơn

- **Actor/kích hoạt:** Khách hàng; Cổng thanh toán MoMo / VNPAY. Mục tiêu: thanh toán đơn.
- **Điều kiện trước:** Đúng chủ đơn, hold còn hạn, trước giờ chiếu; không bị chặn khởi tạo do suất chờ hủy, Core xác định đúng tổng.
- **Luồng chính:** Khách xác nhận tổng phải trả → nếu lớn hơn 0đ, chọn MoMo/VNPAY và nguồn tiền đã xác minh hỗ trợ đúng số tiền, khởi tạo gắn đúng đơn → thực hiện tại cổng, đọc kết quả Core; nếu đúng 0đ, xác nhận riêng để Core xử lý B-06, không gọi cổng.
- **Kết quả:** Giao dịch thu được khởi tạo hoặc xác nhận đơn 0đ đã được yêu cầu; chỉ phát hành khi B-06 xác minh đạt.
- **Ngoại lệ:** Không có kênh hỗ trợ số tiền thì dừng thu, cho chọn phương án khác, không làm tròn tăng/đổi thành 0đ/gia hạn hold. Redirect/timeout không chứng minh mua thành công hoặc thất bại; tra cứu trước thử lại.
- **Quy tắc:** BR-05…BR-06, BR-12, BR-18, BR-21, BR-27; ACT-PAY chỉ tham gia nhánh có tiền.
- **Nguồn quyết định:** Q15, Q45, Q49, Q77, Q118.

### B-06 — Xử lý kết quả thanh toán và phát hành vé

- **Actor/kích hoạt:** Cổng thanh toán MoMo / VNPAY. Mục tiêu: xử lý kết quả thanh toán và phát hành vé.
- **Điều kiện trước:** Gắn đúng đơn/giao dịch; nhánh có tiền xác minh nguồn/toàn vẹn/số tiền; nhánh 0đ phải có xác nhận rõ của khách, ưu đãi và hold/quyền ghế còn hợp lệ.
- **Luồng chính:** Core xác minh kết quả cổng/đối soát hoặc yêu cầu 0đ → chống xử lý lặp → đủ căn cứ và quyền ghế thì xác nhận/phát hành quyền theo ghế, QR chung; chốt hạng/tỷ lệ điểm lúc xác nhận → phát sự kiện N-01. UI/Buaa xác minh phản hồi/chữ ký Core trước báo thành công.
- **Kết quả:** Đơn/vé được xác nhận đúng một lần, chưa soát; điểm chỉ dự kiến tới lúc soát. Nhánh 0đ không có giao dịch thu tiền giả.
- **Ngoại lệ:** Sai nguồn/đơn/tiền không phát vé; lặp không phát trùng. Giao dịch bắt đầu hợp lệ trước dừng suất vẫn theo Q47; thu tiền sau mất quyền ghế thì R-03 trả khoản thu, không tự đặt ghế khác. Chưa rõ tiếp tục đối soát. Email lỗi không đảo vé.
- **Quy tắc:** BR-05…BR-08, BR-12, BR-21, BR-28. ACT-PAY phối hợp nhánh có tiền; email do N-01 sở hữu, không include gửi email vào callback.
- **Nguồn quyết định:** Q8, Q15, Q47, Q77, Q101.

### B-07 — Xem đơn và vé

- **Actor/kích hoạt:** khách hàng mở lịch sử/chi tiết hoặc yêu cầu AI tra cứu.
- **Điều kiện trước:** phiên và quyền truy cập đúng đơn; xuất trình QR tại rạp không cấp quyền xem tài khoản.
- **Luồng:** lấy trạng thái có thẩm quyền → hiển thị đơn, ghế, tiền, QR nếu đã phát hành, phần đã soát/hủy và hoàn tiền liên quan.
- **Kết quả:** khách biết trạng thái; có thể lưu QR để xuất trình khi điện thoại không có mạng.
- **Ngoại lệ:** không tìm thấy/ngoài quyền: không trả vé mẫu thay thế; dữ liệu lưu cũ/chưa rõ không được coi là trạng thái mới đã xác nhận.
- **Quy tắc:** BR-06…BR-08. QR chung có thể gửi cho nhóm; người giữ QR có thể xuất trình quyền còn lại, không chứng minh danh tính riêng từng người.
- **Nguồn quyết định:** Q16, Q22, Q30, Q133.

### B-08 — Hủy lượt giữ ghế chưa thanh toán

- **Actor/kích hoạt:** khách hàng muốn bỏ lựa chọn đang giữ.
- **Điều kiện trước:** sở hữu hold chưa chuyển thành mua thành công.
- **Luồng:** xác định hold → khách xác nhận bỏ → Core giải phóng nếu còn được phép → trả trạng thái hiện hành.
- **Kết quả:** không còn dành ghế theo hold; đây không phải hủy vé đã mua.
- **Ngoại lệ:** đã hết hạn/đã hủy: trả nhất quán; thanh toán đang xử lý/đã xác nhận: kiểm tra lại, không hủy mù một khoản đã thu. Thu tiền muộn sau giải phóng xử lý B-06/R-03.
- **Quy tắc:** BR-04…BR-06. Không làm hồ sơ thanh toán biến mất theo hold.
- **Nguồn quyết định:** Q9–Q10.

### B-09 — Đổi ghế trong cùng suất

- **Actor/kích hoạt:** Khách hàng. Mục tiêu: đổi ghế trong cùng suất.
- **Điều kiện trước:** Khách sở hữu vé còn hiệu lực/chưa soát, còn lượt đổi, không chờ hủy; suất không chờ hủy, tại xác nhận còn ít nhất 30 phút trước giờ chiếu.
- **Luồng chính:** Chọn vé cần đổi và ghế mới cùng suất/số lượng/loại, Sweetbox cả cặp → xem ghế cũ → mới, xác nhận trực tiếp hoặc chat → Core kiểm tra còn chỗ/quyền/hạn rồi chuyển toàn bộ tập chọn nguyên tử → ghi lượt thành công trên vé gốc xuyên các vé thay, trả quyền hiện hành và thông báo N-01.
- **Kết quả:** Đổi một phần/toàn bộ ghế đã chọn, miễn phí; tiền, phân bổ giảm, combo, điểm giữ nguyên. Ghế khác trong đơn không đổi.
- **Ngoại lệ:** Một ghế tranh chấp hoặc lỗi thì giữ toàn bộ vé cũ, không mất lượt; chưa rõ phải tra cứu lần cũ trước thử lại. Mỗi vé gốc tối đa một lần thành công; không đặt lại số lượt theo vé thay. Hủy bị từ chối có thể đổi nếu còn đủ điều kiện; chưa có rút yêu cầu hủy.
- **Quy tắc:** BR-19; OPEN-05 còn đặc tả giữ ghế đích/QR/API, không tự thêm TTL mới hoặc đổi suất.
- **Nguồn quyết định:** Q34–Q44, Q46.

## Hủy, hoàn tiền và hủy suất

### R-01 — Gửi yêu cầu hủy vé đã mua

- **Actor/kích hoạt:** Khách hàng. Mục tiêu: gửi yêu cầu hủy vé đã mua.
- **Điều kiện trước:** Đúng chủ đơn, vé chưa soát, suất chưa bắt đầu; Core tiếp nhận ít nhất 12 tiếng trước giờ chiếu, Sweetbox chọn cả cặp.
- **Luồng chính:** Chọn ghế cần hủy trực tiếp/chat → Core kiểm điều kiện/tiền thực trả, hiển thị ảnh hưởng combo/voucher → khách xác nhận → ghi thời điểm tiếp nhận và hồ sơ chờ xét, cho theo dõi R-04.
- **Kết quả:** Tiếp nhận yêu cầu, vé vẫn hiệu lực trong lúc chờ; ghế đang chờ hủy không được đổi B-09.
- **Ngoại lệ:** Không đủ hạn do việc cá nhân thì không nhận hủy tự nguyện; vé ưu đãi/voucher/0đ vẫn được xét bình đẳng khi đủ chính sách. Không gửi lặp/thiếu nửa cặp. Lỗi dịch vụ phía rạp chuyển R-08 theo điều kiện riêng, không áp nhầm hạn tự hủy.
- **Quy tắc:** BR-10…BR-11, BR-17, BR-25…BR-26. Gửi yêu cầu chưa phải duyệt hoặc đã hoàn.
- **Nguồn quyết định:** Q10–Q14, Q30, Q61–Q67, Q121.

### R-02 — Xét duyệt yêu cầu hủy

- **Actor/kích hoạt:** Quản lý rạp; Quản trị viên toàn chuỗi. Mục tiêu: xét duyệt yêu cầu hủy.
- **Điều kiện trước:** Người xét đúng rạp/thẩm quyền; có hồ sơ và chính sách đã công bố, dữ liệu hiện hành. Ngoại lệ lỗi dịch vụ/phê duyệt trễ thuộc quản trị viên.
- **Luồng chính:** Kiểm thời điểm gửi, vé chưa dùng, cặp và số thực trả → đủ chính sách phải duyệt; không đủ thì từ chối có lý do, ngoài quyền thì chuyển ngoại lệ → lưu quyết định/vô hiệu đúng quyền/giải phóng ghế khi đủ điều kiện → xác định combo/ưu đãi, ghi nghĩa vụ hoàn có tiền R-03 → thông báo N-01.
- **Kết quả:** Quyết định truy vết được, phần còn lại giữ quyền và phân bổ giảm. Hủy toàn bộ vé hủy kèm combo chưa giao, hủy một phần giữ combo; combo giao đúng không hoàn. Vé 0đ vô hiệu quyền nhưng không tạo hoàn giả.
- **Ngoại lệ:** Quản lý quyết định/chuyển trong 4 tiếng từ tiếp nhận; quản trị tối đa 4 tiếng từ chuyển nếu đủ căn cứ, thiếu thì nêu vướng mắc/thông báo và cập nhật mỗi 24 tiếng. Gửi đủ điều kiện đúng hạn mà rạp xét sau giờ chiếu, vé chưa từng soát: quản trị xác minh/duyệt đủ thực trả không phí. Soát và duyệt không cùng thành công cho một ghế; ngoại lệ sự cố đã soát theo R-07. Quá hạn không tự duyệt/từ chối.
- **Quy tắc:** BR-10…BR-12, BR-18, BR-20…BR-27; R-08 xác minh lỗi theo Q132/Q134/Q135/Q172; khôi phục/cấp bù đúng Q79–Q87, không chờ tiền về nếu đủ điều kiện.
- **Nguồn quyết định:** Q11, Q13, Q51, Q61–Q73, Q120–Q121, Q132, Q134–Q135, Q172.

### R-03 — Thực hiện và theo dõi giao dịch hoàn tiền

- **Actor/kích hoạt:** Quản lý rạp; Quản trị viên toàn chuỗi; Cổng thanh toán MoMo / VNPAY. Mục tiêu: thực hiện và theo dõi giao dịch hoàn tiền.
- **Điều kiện trước:** Core xác nhận đủ khoản thu/căn cứ/số tiền chưa hoàn trùng; quản lý theo dõi/gửi đề nghị trong rạp, quản trị xử lý ngoại lệ qua Core, cổng phối hợp tiền.
- **Luồng chính:** Lập hồ sơ ngay, tối đa 15 phút liên tục từ đủ căn cứ và gửi yêu cầu đầu tiên khi đáp ứng điều kiện cổng → xác minh/đối soát kết quả → cập nhật nghĩa vụ còn phải hoàn và kết quả, thông báo N-01/R-04.
- **Kết quả:** Chỉ báo đã hoàn khi có xác nhận thành công; chưa xác minh thì đang xử lý/chưa rõ. Hoàn thất bại không tự phục hồi vé đã hủy.
- **Ngoại lệ:** Chưa gửi được thì ghi lý do/cảnh báo. Quản trị bắt đầu kiểm tra trong 4 tiếng liên tục từ cảnh báo, cập nhật ngay việc quan trọng và ít nhất mỗi 24 tiếng khi chờ. Thử lại theo đối soát/khả năng cổng, không tạo khoản hoàn trùng/ghi đã hoàn tay. Khoản nhỏ giữ đủ nghĩa vụ, xác minh với đối tác; không tự voucher/tiền mặt/chuyển ngoài cổng. Phần thực trả 0đ không tạo giao dịch hoàn.
- **Quy tắc:** BR-06, BR-11…BR-12, BR-27; OPEN-03: merchant/khoản nhỏ/nhiều lần hoàn/thu thêm/thu muộn/thời gian tiền về chưa kiểm chứng. Các mốc nội bộ không hứa tiền về.
- **Nguồn quyết định:** Q15, Q62, Q65, Q114–Q119.

### R-04 — Theo dõi yêu cầu hủy và hoàn tiền

- **Actor/kích hoạt:** Khách hàng; Quản lý rạp; Quản trị viên toàn chuỗi. Mục tiêu: theo dõi yêu cầu hủy và hoàn tiền.
- **Điều kiện trước:** Khách xem hồ sơ mình; quản lý rạp được giao; quản trị theo quyền toàn chuỗi.
- **Luồng chính:** Đọc hồ sơ yêu cầu/quyết định, vé/combo, nghĩa vụ hoàn và kết quả cổng → trình bày riêng từng giai đoạn/lý do/phần chờ, lịch cập nhật → mở thông báo và chi tiết hiện hành.
- **Kết quả:** Biết phần bị hủy, phần còn quyền và tiền chưa/đã hoàn; khách có thể hỏi qua chat.
- **Ngoại lệ:** Chưa rõ nói đúng dữ liệu Core, không đoán ngày tiền về. Hồ sơ hoàn ngoại lệ còn mở cập nhật mỗi 24 tiếng, thay đổi quan trọng báo ngay; hồ sơ xét hủy thiếu căn cứ theo Q120.
- **Quy tắc:** BR-11, BR-17, BR-25, BR-27, BR-33.
- **Nguồn quyết định:** Q22, Q30, Q117, Q120.

### R-05 — Đề nghị hủy suất đã bán vé

- **Actor/kích hoạt:** Quản lý rạp. Mục tiêu: đề nghị hủy suất đã bán vé.
- **Điều kiện trước:** Quản lý đúng rạp nhận diện suất không thể tổ chức hoặc tiếp tục chiếu do sự cố.
- **Luồng chính:** Chọn suất/lý do/bằng chứng và ảnh hưởng → gửi đề nghị quản trị; Core dừng nhận hold mới, thanh toán mới chưa bắt đầu và đổi ghế ngay khi gửi thành công.
- **Kết quả:** Có hồ sơ chờ R-06; chưa tự vô hiệu mọi vé hoặc báo hoàn xong.
- **Ngoại lệ:** Hold cũ giữ TTL gốc; giao dịch đã bắt đầu hợp lệ được xác minh tiếp theo B-06/Q47. Trùng/ngoài quyền không tạo đề nghị mới; hủy đang chiếu giữ lịch sử soát.
- **Quy tắc:** BR-12, BR-18; R-06 từ chối xử lý mở lại theo điều kiện, không phục hồi hold hết hạn.
- **Nguồn quyết định:** Q27, Q33, Q45–Q47, Q52.

### R-06 — Duyệt đề nghị hủy suất

- **Actor/kích hoạt:** Quản trị viên toàn chuỗi. Mục tiêu: duyệt đề nghị hủy suất.
- **Điều kiện trước:** Quản trị viên có quyền, có đề nghị quản lý và dữ liệu hiện hành.
- **Luồng chính:** Xác minh không thể tổ chức/tiếp tục chiếu → duyệt hoặc từ chối có lý do → lưu quyết định và thông báo N-01; duyệt kích hoạt R-07.
- **Kết quả:** Có quyết định rõ; từ chối thì Core mở lại thao tác còn đủ điều kiện khi không lý do dừng khác/chưa đóng bán.
- **Ngoại lệ:** Không tự phục hồi hold hết hạn/kéo dài hạn đổi hoặc bán. Đề nghị đã có quyết định thì không thực thi lặp; đang chiếu có thể duyệt hủy nhưng không xóa lịch sử dùng.
- **Quy tắc:** BR-12, BR-18; không dùng include/extend giữa quyết định và xử lý tiếp chỉ để mô tả thời gian.
- **Nguồn quyết định:** Q27, Q48, Q52, Q65.

### R-07 — Thực thi quyết định hủy suất

- **Actor/kích hoạt:** Kích hoạt nội bộ từ quyết định R-06. Mục tiêu: thực thi quyết định hủy suất.
- **Điều kiện trước:** Quyết định R-06 hợp lệ gắn suất; kích hoạt nội bộ, không actor “System”.
- **Luồng chính:** Ngừng bán/vô hiệu quyền vào → giữ lịch sử soát → xác định toàn bộ tiền vé thực trả bị ảnh hưởng, kể cả đã soát trước sự cố; hủy/hoàn combo chưa giao, giữ combo giao đúng → xử lý lượt mã/voucher theo Q79–Q87 → khởi tạo R-03 cho khoản có tiền → thông báo N-01/theo dõi từng đơn.
- **Kết quả:** Suất bị hủy, không nhận khách mới; điểm và chi tiêu xét hạng của vé soát thật trước sự cố giữ đúng một lần/mốc gốc, vé chưa soát không cộng.
- **Ngoại lệ:** Hoàn/email một đơn lỗi theo dõi riêng, không coi mọi tiền đã về. Còn phần hưởng mã giữ lại thì không trả lượt; hết hạn đủ điều kiện sự cố thì cấp bù 14 ngày/loại mức trần gốc. Không xóa soát để khớp hủy.
- **Quy tắc:** BR-12, BR-21…BR-24, BR-29; không áp hạn tự hủy 12 tiếng.
- **Nguồn quyết định:** Q27, Q52, Q65, Q70–Q71, Q79–Q87, Q102–Q103.

### R-08 — Lập hồ sơ lỗi dịch vụ phía rạp

- **Actor/kích hoạt:** Quản lý rạp. Mục tiêu: lập hồ sơ lỗi dịch vụ phía rạp.
- **Điều kiện trước:** Quản lý đúng rạp, có phần dịch vụ chưa sử dụng bị ảnh hưởng và căn cứ lỗi rạp/hệ thống. Lỗi khác Q172 yêu cầu khách đáp ứng điều kiện lúc mua; riêng lỗi thông báo Q132 xét theo thông tin sai/thiếu trước mua, không loại chỉ vì khách thực tế chưa đủ tuổi và bị từ chối đúng quy định.
- **Luồng chính:** Ghi nhận sự cố/bằng chứng, phần không thể cung cấp và thời điểm liên quan → xác định Q132 lỗi thông báo, Q134 chậm phòng còn diễn ra từ T+15, Q135 chặn kỹ thuật 15 phút từ rạp ghi nhận hoặc phim kết thúc sớm hơn, hoặc lỗi khác Q172 → lập hồ sơ chuyển quản trị R-02 → theo dõi quyết định/hoàn.
- **Kết quả:** Có hồ sơ xác minh để xét hủy/hoàn đủ thực trả phần ảnh hưởng, không phí/không hạn tự hủy 12 tiếng; phần cung cấp đúng giữ nguyên.
- **Ngoại lệ:** Không coi phản ánh là đã duyệt/hoàn; lỗi nhỏ khắc phục và phục vụ đúng không tự sinh quyền hoàn. Lỗi chỉ mạng điện thoại khách không tự thuộc Q135. Vé đã soát/sự cố đang chiếu dùng R-05…R-07; không bỏ kiểm tra tuổi/Core.
- **Quy tắc:** BR-26; O-03/O-07 là nơi tiếp nhận/hỗ trợ tại cửa/quầy, không tự hủy cả suất.
- **Nguồn quyết định:** Q132, Q134–Q135, Q172.

## Tại rạp

### O-01 — Soát vé theo từng ghế

- **Actor/kích hoạt:** Nhân viên soát vé. Mục tiêu: soát vé theo từng ghế.
- **Điều kiện trước:** Nhân viên được giao rạp, thiết bị online; từ giờ chiếu niêm yết khi phòng sẵn sàng, suất chưa kết thúc thực tế/không hủy hoặc tạm dừng nhận.
- **Luồng chính:** Nhận QR, thiếu thì tại EP-PROOF chạy O-02 → chọn ghế của người đang tới, xác minh điều kiện từng người khi cần → include O-05 → Core ghi sử dụng chống lặp/cạnh tranh → chỉ báo thành công theo xác nhận.
- **Kết quả:** Ghế được chấp nhận được ghi vào một lần; ghế khác trong QR vẫn còn quyền, Sweetbox có thể vào từng người. Điểm/chi tiêu phát sinh theo vé soát thật, đúng tỷ lệ đã chốt.
- **Ngoại lệ:** Sai suất/quyền/đã dùng/hủy/không đủ điều kiện thì từ chối đúng ghế; chưa xác minh tuổi thì chưa soát, không kết luận chưa đủ tuổi. Mất mạng/chưa rõ tra cứu trước thử, không soát offline. Khách muộn vẫn vào khi phim chưa kết thúc. Quay lại dùng thẻ/dấu tạm gắn suất/ghế và đối chiếu trực tiếp, không đặt vé chưa soát/cộng điểm lần nữa hoặc theo dõi từng lượt Core.
- **Quy tắc:** BR-07…BR-09, BR-14, BR-30…BR-31; O-06 quản lý tình trạng nhận, O-03 hỗ trợ và chuyển quản lý nếu chưa xác minh được quay lại.
- **Nguồn quyết định:** Q6, Q16, Q18, Q122–Q131.

### O-02 — Xác minh khách khi không có QR

- **Actor/kích hoạt:** Nhân viên soát vé; Khách hàng; Dịch vụ email. Mục tiêu: xác minh khách khi không có qr.
- **Điều kiện trước:** Nhân viên đúng rạp và khách tra cứu đúng đơn thiếu QR; dùng email đã xác minh của tài khoản mua.
- **Luồng chính:** Gửi mã xác nhận đúng đơn/mục đích qua dịch vụ email → khách xuất trình → kiểm hiệu lực/quyền → trở lại O-01/O-05; nếu còn phiên đăng nhập người mua thì khách có thể lấy lại QR qua Core bằng B-07.
- **Kết quả:** Có bằng chứng thay QR, chưa đánh dấu cả đơn đã vào.
- **Ngoại lệ:** Không nhận/truy cập email hoặc mã sai/hết hạn thì không bỏ xác minh; hướng A-05/Q163 khôi phục hộp thư, chưa SMS/đường dự phòng. Tên/điện thoại/mã đơn đơn thuần không đủ.
- **Quy tắc:** Extend O-01 tại EP-PROOF; BR-09, BR-36. Không phải lần soát nào cũng cần OTP, không mở quyền xem toàn tài khoản cho nhân viên.
- **Nguồn quyết định:** Q17, Q19, Q133, Q163.

### O-03 — Tra cứu hỗ trợ tại cửa

- **Actor/kích hoạt:** Nhân viên soát vé; Quản lý rạp. Mục tiêu: tra cứu hỗ trợ tại cửa.
- **Điều kiện trước:** Nhân viên soát hoặc quản lý rạp hỗ trợ đúng rạp, chỉ dữ liệu cần cho việc hỗ trợ.
- **Luồng chính:** Tra cứu suất/ghế/trạng thái → hướng khách lấy QR/xác minh email, giấy tờ hợp lệ hoặc quay lại → trường hợp chưa rõ chuyển quản lý hỗ trợ; lỗi dịch vụ có căn cứ lập R-08.
- **Kết quả:** Khách có hướng xử lý; quản lý hỗ trợ không tự có quyền ghi soát, thay email hoặc duyệt hoàn ngoại lệ.
- **Ngoại lệ:** Không tìm thấy/ngoài rạp không lộ khách khác. Ảnh chụp giấy tờ rời chưa đủ; giấy tờ hợp lệ có thể bản giấy/điện tử xuất trình trực tiếp, khai sinh trẻ đối chiếu người đi kèm. Sai tuổi hoặc thiếu giấy tờ phía khách sau thông báo đúng không thêm hoàn tự nguyện trễ; lỗi thông tin phía rạp theo R-08.
- **Quy tắc:** BR-01, BR-09, BR-26, BR-30…BR-31. Chỉ lưu kết quả kiểm tra cần thiết, chưa ảnh/số giấy tờ; danh mục giấy tờ còn rà soát OPEN-06.
- **Nguồn quyết định:** Q6, Q127, Q129–Q135.

### O-04 — Xác nhận giao combo

- **Actor/kích hoạt:** Nhân viên quầy bắp nước; Dịch vụ email. Mục tiêu: xác nhận giao combo.
- **Điều kiện trước:** Nhân viên quầy đúng quyền/rạp; quyền nhận còn hiệu lực, thanh toán hoặc quyền 0đ đã được Core xác nhận; trong ca phục vụ gắn ngày chiếu.
- **Luồng chính:** Tra cứu QR → nếu thiếu dùng tra cứu và mã qua email đã xác minh của người mua → Core kiểm đúng quyền/toàn bộ combo chưa giao → giao toàn bộ combo đơn một lần và ghi nhận chống lặp → trả kết quả.
- **Kết quả:** Đã giao đúng một lần; không đổi trạng thái soát vé. Ca qua 0 giờ vẫn đến hết ca, có thể nhận trước hoặc sau phim.
- **Ngoại lệ:** Đã giao/đã vô hiệu/ngoài ca không giao bằng dữ liệu cũ. Rạp phục vụ đúng mà khách không nhận/quá ca thì hết quyền, không hoàn/chuyển lần xem. Ghi nhầm/giao nhầm/thiếu hàng chuyển O-07; chưa rõ phải tra cứu trước thử, không giao bù bằng đặt lại trạng thái.
- **Quy tắc:** BR-13, BR-21, BR-23…BR-24. ACT-MAIL chỉ nhánh chứng minh thiếu QR; không mở kho nguyên liệu hoặc nhận từng phần tự nguyện.
- **Nguồn quyết định:** Q28, Q54–Q56, Q68–Q72.

### O-05 — Kiểm tra quyền vào rạp của các ghế

- **Actor/kích hoạt:** Nhân viên soát vé qua O-01. Mục tiêu: kiểm tra quyền vào rạp của các ghế.
- **Điều kiện trước:** Hành vi bắt buộc trong O-01, nhân viên qua use case gọi đã có bằng chứng/tập ghế.
- **Luồng chính:** Core kiểm nguồn/chữ ký/bằng chứng thay thế, đúng suất/phòng/quyền từng ghế và chưa dùng/hủy; đối chiếu khung nhận khách thực tế, tình trạng phòng, điều kiện tuổi/giờ/giấy tờ cần thiết → kiểm lại cùng lúc ghi sử dụng.
- **Kết quả:** Chấp nhận/từ chối đúng quyền ghế; không dựa một trạng thái chung của đơn.
- **Ngoại lệ:** Hai cửa không cùng soát thành công một ghế. QR cũ không hồi sinh vé hủy/đã dùng. Giờ kết thúc dự kiến không tự coi phim hết; xác nhận của chủ đơn không thay tuổi từng người. Chưa xác minh đủ thì không ghi soát.
- **Quy tắc:** Include từ O-01; BR-07…BR-09, BR-30…BR-31. Điều kiện pháp lý cụ thể/danh mục giấy tờ còn rà soát OPEN-06.
- **Nguồn quyết định:** Q13, Q16, Q18, Q122–Q131.

### O-06 — Cập nhật tình trạng nhận khách

- **Actor/kích hoạt:** Nhân viên soát vé; Quản lý rạp; Quản trị viên toàn chuỗi. Mục tiêu: cập nhật tình trạng nhận khách.
- **Điều kiện trước:** Vai trò được giao đúng rạp/suất; có kiểm tra thực tế, Core online.
- **Luồng chính:** Nhân viên soát kiểm phòng và xác nhận sẵn sàng, chỉ mở từ giờ niêm yết → khi phim thực sự hết xác nhận kết thúc; giờ dự kiến chỉ nhắc kiểm → quản lý giám sát/tạm dừng khi sự cố; nếu ghi kết thúc nhầm, nhân viên gửi đề nghị để quản lý hoặc quản trị kiểm thực tế/sửa qua Core có lý do/lịch sử.
- **Kết quả:** Trạng thái nhận khách đúng vận hành; nhận muộn đến kết thúc thực tế khi đủ điều kiện.
- **Ngoại lệ:** Không mở trước giờ, sửa lịch hoặc bỏ kiểm tra vé; không mở lại suất thực sự kết thúc/đã hủy, không đặt ghế đã soát về chưa soát. Nhân viên không tự sửa kết thúc nhầm; quyền quản lý cập nhật vận hành không tự cho quyền soát thường ngày.
- **Quy tắc:** BR-30; Q124–Q125/Q136; chậm mở phòng/lỗi chặn kỹ thuật theo R-08 với hai mốc riêng.
- **Nguồn quyết định:** Q124–Q125, Q136.

### O-07 — Xử lý sự cố giao combo

- **Actor/kích hoạt:** Nhân viên quầy bắp nước; Quản lý rạp; Quản trị viên toàn chuỗi; Khách hàng; Cổng thanh toán MoMo / VNPAY. Mục tiêu: xử lý sự cố giao combo.
- **Điều kiện trước:** Có sự cố combo thuộc rạp; nhân viên báo/thực hiện, quản lý/quản trị có quyền xác minh/duyệt; khách đồng ý khi thay, cổng chỉ nhánh tiền.
- **Luồng chính:** Ghi nhận sự cố: bấm giao nhầm chưa giao thực tế thì quản lý/quản trị sửa có lịch sử; giao sai người thì duyệt giao bù, nhân viên giao liên kết sự cố chống bù lặp. Không cung cấp được thì duyệt phương án thay, khách xem giá mới = giá hiện tại trừ giảm cũ (thấp nhất 0đ), không ưu đãi mới, so với thực trả cũ để xác nhận chênh lệch → thu thêm qua cổng/Core hoặc ghi nghĩa vụ hoàn R-03 → nhân viên giao sau đủ điều kiện.
- **Kết quả:** Khách được cung cấp phần thay/giao bù hợp lệ; phần khác giữ nguyên. Rẻ hơn được giao sau Core xác nhận và ghi khoản phải hoàn, không đợi tiền về.
- **Ngoại lệ:** Đắt hơn chỉ giao sau Core xác minh thu thành công; chưa rõ tra cứu không thu lại mù. Thu thất bại/không có kênh đúng số tiền giữ quyền xử lý phần rạp chưa giao. Không đồng ý thay thì hoàn đủ thực trả phần không cung cấp được không phí, giữ vé/phần khác. Người duyệt không tự có quyền giao thường ngày, không xóa lịch sử giao sai.
- **Quy tắc:** BR-24, BR-26…BR-27; lỗi dịch vụ cần quản trị duyệt hủy/hoàn qua R-08/R-02, không quyền tùy ý đổi combo hoặc thu ngoài cổng.
- **Nguồn quyết định:** Q57–Q60, Q73, Q88–Q89, Q118, Q172.

## Cộng đồng và hội viên

### L-01 — Xem điểm và quyền lợi hội viên

- **Actor/kích hoạt:** Khách hàng. Mục tiêu: xem điểm và quyền lợi hội viên.
- **Điều kiện trước:** Khách đăng nhập xem quyền lợi của tài khoản đặt; tư cách hội viên có từ đăng ký.
- **Luồng chính:** Đọc số dư/lô điểm/hạn, lịch sử, hạng và chi tiêu xét hạng → trình bày quyền đổi, tỷ lệ đã chốt theo từng đơn và khoản đang chờ soát; Cơ bản 1 điểm/10.000đ, Thân thiết 2, mỗi vé hai số lẻ bỏ dư, điểm 12 tháng từ cộng.
- **Kết quả:** Biết số dư dùng được và tiến độ hạng: thực trả vé soát thật toàn chuỗi 12 tháng gần nhất, từ 3 triệu nâng ngay, giữ 12 tháng rồi xét gia hạn/hạ; đổi điểm không tự tụt hạng.
- **Ngoại lệ:** Không cộng dự kiến vào số dư trước soát. Tỷ lệ/hạng chốt lúc xác nhận đơn, đổi sau không hồi tố vé cũ. Rạp hủy đang chiếu giữ điểm/chi tiêu vé soát thật/mốc cũ; vé chưa soát không tính. Điều chỉnh sai có thể số dư âm, hiển thị lý do; không lấy điểm âm trừ tiền hoàn.
- **Quy tắc:** BR-14, BR-28…BR-29; sửa sai L-09/L-10. Xem điểm không include vào soát; combo không tính điểm chi tiêu.
- **Nguồn quyết định:** Q25, Q90–Q108.

### L-02 — Đổi điểm lấy voucher

- **Actor/kích hoạt:** Khách hàng. Mục tiêu: đổi điểm lấy voucher.
- **Điều kiện trước:** Khách đăng nhập, không đang chờ đóng, đủ điểm còn hạn và quyền lợi đang được cung cấp.
- **Luồng chính:** Xem voucher/giá điểm/điều kiện → xác nhận → Core kiểm số dư và dùng các lô hết hạn sớm nhất → trừ đúng 100 điểm/cấp voucher 10.000đ nhất quán đúng một lần → xem voucher và lịch sử.
- **Kết quả:** Voucher hạn 90 ngày từ đổi thành công, chỉ tài khoản đã đổi dùng, toàn chuỗi cho phần hợp lệ vé/combo; không mức mua tối thiểu, kết hợp theo B-04; giữ phần điểm lẻ và điều kiện voucher cấp đúng khi chính sách đổi sau.
- **Ngoại lệ:** Thiếu điểm kể cả đang âm không đổi. Chưa rõ/lặp tra cứu trước thử để không mất điểm/cấp trùng. Dùng một lần không giữ giảm dư hoặc đổi tiền/chuyển/tặng; không tự đổi ngược voucher hợp lệ vì đổi ý. Hủy đơn áp khôi phục/cấp bù voucher, không trả đồng thời điểm; sửa cấp sai theo L-10.
- **Quy tắc:** BR-15, BR-22, BR-28…BR-29; B-04 áp vào đơn là mục tiêu khác, không include theo thời gian.
- **Nguồn quyết định:** Q24–Q25, Q98–Q99, Q109–Q113.

### L-03 — Quản lý phim yêu thích

- **Actor/kích hoạt:** khách hàng muốn lưu/bỏ lưu hoặc xem phim quan tâm.
- **Điều kiện trước:** đăng nhập, phim được xác định.
- **Luồng:** xem danh sách → thêm/bỏ → lưu theo tài khoản → trả kết quả.
- **Kết quả:** danh sách cá nhân được cập nhật; chưa giữ ghế hoặc đăng ký push.
- **Ngoại lệ:** phim không còn công bố/lưu lỗi: phản hồi rõ; đổi biểu tượng ở client chưa chứng minh đã lưu bền vững.
- **Quy tắc:** Q22–Q23. Không yêu cầu đã mua/xem phim mới được lưu yêu thích.
- **Nguồn quyết định:** Q22–Q23.

### L-04 — Viết, sửa hoặc xóa đánh giá phim

- **Actor/kích hoạt:** Khách hàng. Mục tiêu: viết, sửa hoặc xóa đánh giá phim.
- **Điều kiện trước:** Khách đứng tên đặt có vé phim đã soát; một bài/tài khoản/phim, sửa/xóa đúng bài.
- **Luồng chính:** Nhập 1–5 sao nguyên bắt buộc, chữ tùy chọn và nhãn cốt truyện nếu có → lưu/sửa hoặc xác nhận xóa → đăng ngay nếu không đang bị ẩn, cập nhật điểm tổng hợp. Bản đang ẩn lưu sửa vẫn ẩn, tác giả chủ động gửi L-07 khi sẵn sàng.
- **Kết quả:** Có bài hiện hành/đã xóa; không nhân số bài/trọng số theo số ghế. Nhãn nói đúng căn cứ tài khoản đặt có vé đã soát, không khẳng định chủ tài khoản đã trực tiếp xem.
- **Ngoại lệ:** Chưa có vé đủ điều kiện/khác chủ không được viết; cầm QR không tự có quyền đánh giá riêng. Sửa bài bị ẩn không tự khôi phục, quyết định bản cũ không công khai bản mới chưa xét.
- **Quy tắc:** BR-16, BR-32; cốt truyện che để người đọc chủ động mở, khác ẩn vi phạm; điểm chỉ bài công khai/chưa xóa.
- **Nguồn quyết định:** Q23, Q26, Q137, Q139, Q143–Q145.

### L-05 — Ẩn đánh giá vi phạm

- **Actor/kích hoạt:** Quản trị viên toàn chuỗi. Mục tiêu: ẩn đánh giá vi phạm.
- **Điều kiện trước:** Quản trị viên có quyền và bài/phiên bản xác định được; đang hậu kiểm.
- **Luồng chính:** Đối chiếu quy tắc cộng đồng → nếu vi phạm spam/quảng cáo/không liên quan/công kích/đe dọa/thù ghét/khiêu dâm/lộ riêng tư trái phép/trái luật thì ẩn, ghi căn cứ/lý do và thông báo N-01; nếu chỉ thiếu nhãn cốt truyện thì bổ sung nhãn che.
- **Kết quả:** Bài ẩn không công khai/không tính trung bình; cốt truyện chỉ che vẫn công khai và tính điểm. Không sửa lời khách.
- **Ngoại lệ:** Chê phim/trải nghiệm/điểm thấp không phải căn cứ ẩn. Nội dung đã đổi/xóa kiểm lại phiên bản. Tác giả được xem lý do/quy tắc và gửi L-07, người xét L-08 khác người đã ẩn.
- **Quy tắc:** BR-16, BR-32; không extend viết bài để mô tả kiểm duyệt khác thời điểm.
- **Nguồn quyết định:** Q26, Q138–Q139, Q144.

### L-07 — Gửi và theo dõi yêu cầu xét lại đánh giá

- **Actor/kích hoạt:** Khách hàng. Mục tiêu: gửi và theo dõi yêu cầu xét lại đánh giá.
- **Điều kiện trước:** Tác giả có bài bị ẩn/quyết định cụ thể; bản sửa đã lưu nếu gửi sửa khắc phục.
- **Luồng chính:** Xem lý do/quy tắc → chọn phiên bản và chứng cứ → chủ động gửi yêu cầu xét lại → theo dõi trạng thái/lý do/quyết định, bổ sung chứng cứ vào hồ sơ đang mở.
- **Kết quả:** Có một hồ sơ đang mở cho mỗi quyết định/phiên bản; bài vẫn ẩn trong lúc chờ.
- **Ngoại lệ:** Lưu sửa không tự gửi. Đã xử lý chỉ nhận yêu cầu mới nếu có sửa khắc phục hoặc căn cứ mới, liên kết lịch sử; bổ sung cùng phiên bản không tự kéo dài 48 tiếng. Không dùng quyết định bản cũ công khai bản mới.
- **Quy tắc:** BR-32; quản trị viên khác người ẩn xét L-08, không tự khôi phục vì khiếu nại.
- **Nguồn quyết định:** Q140, Q143, Q146.

### L-08 — Xét lại đánh giá bị ẩn

- **Actor/kích hoạt:** Quản trị viên toàn chuỗi. Mục tiêu: xét lại đánh giá bị ẩn.
- **Điều kiện trước:** Quản trị viên toàn chuỗi khác người đã ẩn ban đầu; có hồ sơ/đúng phiên bản/quy tắc.
- **Luồng chính:** Đối chiếu bài và căn cứ → đủ dữ liệu quyết định giữ ẩn/khôi phục có lý do trong 48 tiếng liên tục từ tiếp nhận → lưu lịch sử, cập nhật công khai/điểm tổng hợp theo kết quả, báo N-01.
- **Kết quả:** Kết quả gắn đúng phiên bản và người xét, tác giả theo dõi được.
- **Ngoại lệ:** Thiếu căn cứ phải ghi vướng mắc/thông báo trong hạn, cập nhật ít nhất mỗi 24 tiếng khi chờ; quá hạn cảnh báo, không tự khôi phục/bác. Không giao lại người ẩn chỉ vì thiếu người; cần bố trí ít nhất hai quản trị viên có quyền.
- **Quy tắc:** BR-32; bổ sung bằng chứng cùng phiên bản không reset hạn, không cấp quyền kiểm duyệt cho quản lý rạp.
- **Nguồn quyết định:** Q141–Q146.

### L-09 — Đề nghị sửa sai quyền lợi hội viên

- **Actor/kích hoạt:** Quản lý rạp. Mục tiêu: đề nghị sửa sai quyền lợi hội viên.
- **Điều kiện trước:** Quản lý rạp được giao có giao dịch nghi soát/cộng điểm/chi tiêu xét hạng sai hoặc gian lận.
- **Luồng chính:** Đối chiếu giao dịch/bằng chứng → ghi đề nghị sửa sai và lý do → chuyển quản trị L-10 → theo dõi kết quả.
- **Kết quả:** Có đề nghị liên kết giao dịch để xét, số dư/hạng chưa tự đổi từ việc gửi.
- **Ngoại lệ:** Ngoài rạp/thiếu căn cứ không tự sửa; nhân viên không trực tiếp sửa quyền lợi. Quyền giữ điểm/chi tiêu do sự cố rạp khác lỗi dữ liệu.
- **Quy tắc:** BR-29; không cho quản lý thay chính sách hoặc danh mục đổi điểm M-10.
- **Nguồn quyết định:** Q104.

### L-10 — Duyệt điều chỉnh quyền lợi hội viên

- **Actor/kích hoạt:** Quản trị viên toàn chuỗi. Mục tiêu: duyệt điều chỉnh quyền lợi hội viên.
- **Điều kiện trước:** Quản trị viên có quyền, căn cứ sửa sai hoặc điều kiện voucher cấp bù không còn khả dụng; Core xác định đúng giao dịch/quyền liên quan.
- **Luồng chính:** Xác minh → duyệt điều chỉnh có lý do/lịch sử: sửa điểm/chi tiêu/hạng cấp sai; nếu voucher từ điểm sai chưa dùng và không giao dịch treo thì thu hồi/đối chiếu trả phần điểm đúng, xử lý sai một lần; voucher đã dùng không thu được thì cho điểm âm bù dần. Với voucher cấp bù chỉ duyệt chỉnh điều kiện cũ không khả dụng → báo N-01.
- **Kết quả:** Quyền lợi về đúng căn cứ; hạng cấp sai có thể sửa ngay, đơn xác nhận mới dùng hạng sửa, không tính lại đơn hợp lệ cũ. Điểm đúng hoàn còn hạn giữ hạn; hết hạn do lỗi rạp/hệ thống không gian lận được 30 ngày.
- **Ngoại lệ:** Không thu hồi/trừ trùng; voucher đang xử lý/chưa rõ phải tra cứu trước. Không đòi tiền/trừ khoản hoàn vì điểm âm. Quyền hợp lệ giữ theo sự cố rạp Q102/Q103 không thu hồi. Cấp bù giữ loại/mức/trần/hạn 14 ngày, không tự mở mọi điều kiện toàn chuỗi.
- **Quy tắc:** BR-22, BR-29; mọi sửa qua Core, quản lý chỉ đề nghị, nhân viên không tự sửa.
- **Nguồn quyết định:** Q87, Q104–Q108.

## Vận hành và quản trị

### M-01 — Quản lý danh mục phim và trailer

- **Actor/kích hoạt:** Quản trị viên toàn chuỗi. Mục tiêu: quản lý danh mục phim và trailer.
- **Điều kiện trước:** Quản trị viên có quyền với danh mục; xác định tác động đến suất/đơn trước sửa.
- **Luồng chính:** Nhập/sửa nội dung phim, trailer, phân loại → kiểm tra → lưu/công bố để các kênh dùng cùng dữ liệu.
- **Kết quả:** Danh mục đúng nguồn; phân loại/điều kiện cung cấp cho thông báo trước mua.
- **Ngoại lệ:** Không xóa mù lịch sử hoặc đổi phim của suất đang có hold/có vé; thay đổi gây không thể phục vụ dùng chính sách hủy phù hợp. Nhãn phim không chứng minh đã xác minh tuổi người xem.
- **Quy tắc:** BR-01, BR-18, BR-31; xác minh hiệu lực quy định/danh mục giấy tờ còn OPEN-06.
- **Nguồn quyết định:** Q7, Q32.

- **Phạm vi media đã chốt:** hệ thống upload/lưu poster, banner và ảnh; trailer dùng URL/video nhúng
  từ nguồn ngoài. Bản đầu không tự upload/lưu/phục vụ video trailer. Chủ sản phẩm chọn A ngày
  2026-11-17 trong hội thoại Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`) để giữ trọng tâm
  ở booking/Agent và kiến trúc phân tán. Storage/xử lý ảnh theo
  [ADR-0019](../06-decisions/0019-r2-and-cloudflare-images-for-catalog-media.md);
  nguồn video chưa chọn. Đây là phạm vi mục tiêu, chưa xác nhận tích hợp.

### M-02 — Quản lý giá vé và ưu đãi

- **Actor/kích hoạt:** Quản trị viên toàn chuỗi. Mục tiêu: quản lý giá vé và ưu đãi.
- **Điều kiện trước:** Quản trị viên có quyền, biết phạm vi/điều kiện/hạn/chồng ưu đãi.
- **Luồng chính:** Cấu hình giá vé/chương trình → kiểm tra xung đột/trần/cách kết hợp → công bố → Core áp dụng tối ưu hợp lệ, phân bổ và lưu khi mua.
- **Kết quả:** Chính sách dùng chung; không tin tổng client hoặc tính lại đơn cũ bằng giá mới.
- **Ngoại lệ:** Không tự áp nhiều mã hoặc nhiều ưu đãi tự động/phần, không âm thầm sửa giá khách đã xác nhận. Voucher được cấp đúng giữ điều kiện lúc cấp; danh mục combo theo M-08, chính sách hội viên theo M-10.
- **Quy tắc:** BR-06, BR-20…BR-22, BR-28; giảm giá chung làm tròn bảo toàn tổng theo Q171.
- **Nguồn quyết định:** Q7, Q74–Q81, Q113, Q171.

### M-03 — Quản lý phòng và sơ đồ ghế

- **Actor/kích hoạt:** Quản lý rạp; Quản trị viên toàn chuỗi. Mục tiêu: quản lý phòng và sơ đồ ghế.
- **Điều kiện trước:** Quản lý đúng rạp hoặc quản trị viên; biết suất/hold/vé phụ thuộc.
- **Luồng chính:** Thiết lập sơ đồ/số ghế riêng từng phòng, loại/cặp Sweetbox → kiểm tra định danh/quan hệ → lưu cho suất đủ điều kiện.
- **Kết quả:** Sơ đồ theo phòng, không bắt buộc 64 ghế; tối đa 6 ghế là giới hạn mỗi lượt đặt.
- **Ngoại lệ:** Không sửa sơ đồ/phòng của suất khi hold còn hạn; đã có vé không sửa, không tự chuyển khách. Đổi chỗ theo yêu cầu khách dùng B-09; không thay thông tin suất qua cấu hình phòng.
- **Quy tắc:** BR-03…BR-04, BR-18…BR-19.
- **Nguồn quyết định:** Q7, Q29, Q32.

### M-04 — Quản lý lịch chiếu

- **Actor/kích hoạt:** Quản lý rạp; Quản trị viên toàn chuỗi. Mục tiêu: quản lý lịch chiếu.
- **Điều kiện trước:** Quản lý đúng rạp hoặc quản trị viên, phim/phòng hợp lệ.
- **Luồng chính:** Chọn phim/phòng/giờ → kiểm tra xung đột/thời lượng/khoảng đệm ít nhất 20 phút cùng phòng và điều kiện công bố → lưu/công bố; Core áp dụng hạn hold T−5, thanh toán trước T khi hold còn hiệu lực.
- **Kết quả:** Suất có lịch/điều kiện nhất quán giữa các kênh.
- **Ngoại lệ:** Không đổi phim/giờ/phòng/sơ đồ khi hold còn hạn; đã có vé thì không sửa, không thể tổ chức dùng R-05/R-06 và tạo suất mới, không tự chuyển khách. Không tự giả định 10 phút quảng cáo; tình trạng mở cửa/kết thúc thực tế qua O-06, không sửa giờ niêm yết để né lỗi chậm.
- **Quy tắc:** BR-12, BR-18, BR-30; hold hết hạn không tự kết luận thanh toán thất bại.
- **Nguồn quyết định:** Q7, Q27, Q32, Q49–Q50.

### M-05 — Cấp/thu hồi quyền quản lý rạp

- **Actor/kích hoạt:** quản trị viên toàn chuỗi bổ nhiệm/kết thúc quyền quản lý.
- **Điều kiện trước:** đúng thẩm quyền, xác định tài khoản/rạp.
- **Luồng:** chọn tài khoản/rạp → xác nhận cấp/thu hồi → lưu → kiểm tra truy cập theo quyền mới.
- **Kết quả:** chỉ có quyền trong phạm vi đã giao; giữ lịch sử thao tác/giao dịch sau thu hồi.
- **Ngoại lệ:** ngoài quyền/mục tiêu sai: từ chối; đăng ký công khai không được tự nâng quyền.
- **Quy tắc:** BR-01. Cấp quản trị viên đầu tiên là quy trình khởi tạo hệ thống, không phải đăng ký khách.
- **Nguồn quyết định:** Q21.

### M-06 — Cấp/thu hồi quyền nhân viên

- **Actor/kích hoạt:** quản lý rạp phân công nhân viên; quản trị viên có quyền quản lý tổng thể.
- **Điều kiện trước:** đúng rạp/thẩm quyền, xác định tài khoản.
- **Luồng:** chọn tài khoản → chỉ rõ quyền soát vé, quyền quầy hoặc cả hai → cấp/thu hồi → áp dụng khi truy cập.
- **Kết quả:** quyền tách biệt; có một vai trò không mặc định có vai trò kia.
- **Ngoại lệ:** quản lý muốn cấp quyền toàn chuỗi/quản lý rạp hoặc ngoài phạm vi: từ chối; quyền bị thu hồi không được tiếp tục dùng chỉ vì có phiên cũ.
- **Quy tắc:** BR-01, BR-13. Không tự thêm vai trò thu ngân, kế toán hoặc hỗ trợ khách riêng.
- **Nguồn quyết định:** Q21, Q28.

### M-07 — Xem báo cáo vận hành và doanh thu

- **Actor/kích hoạt:** Quản lý rạp; Quản trị viên toàn chuỗi. Mục tiêu: xem báo cáo vận hành và doanh thu.
- **Điều kiện trước:** Quản lý xem rạp được giao, quản trị xem toàn chuỗi theo quyền; chỉ báo cáo tổng hợp.
- **Luồng chính:** Chọn rạp/phim/suất/kỳ → tổng hợp vé bán/hủy/soát, combo giao → tách tiền thực thu, hoàn thành công, còn phải hoàn cuối kỳ, giá trị bán ròng → hiển thị tỷ lệ ghế bán/soát riêng và giới hạn dữ liệu.
- **Kết quả:** Tiền theo ngày từng sự kiện xác nhận, ngày lịch giờ Việt Nam; hủy/giảm được duyệt giảm bán ròng, hoàn thành không giảm lại. Phải hoàn là số dư cuối kỳ, không cộng lặp số dư ngày; thu thừa/thu không phát vé không tự thành bán.
- **Ngoại lệ:** Tỷ lệ chính chỉ suất kết thúc bình thường thuộc kỳ theo ngày bắt đầu niêm yết; cộng số ghế rồi chia, hold chưa là vé không tính, Sweetbox hai ghế. Suất hủy loại cả tử/mẫu, báo riêng hủy/vé ảnh hưởng/soát thật trước sự cố và giữ số tiền. Đang/chưa chiếu tạm tính riêng, không mẫu số ghi “Chưa có dữ liệu”. Thiếu/ngoài quyền không lấy mẫu thay thật.
- **Quy tắc:** BR-35; không danh sách đơn/thông tin cá nhân, chưa xuất file/dự báo/kế toán. Giá trị bán ròng chưa trừ chi phí, không khẳng định doanh thu kế toán.
- **Nguồn quyết định:** Q155–Q161.

### M-08 — Quản lý danh mục và giá combo

- **Actor/kích hoạt:** Quản trị viên toàn chuỗi. Mục tiêu: quản lý danh mục và giá combo.
- **Điều kiện trước:** Quản trị viên toàn chuỗi có quyền danh mục combo.
- **Luồng chính:** Tạo/sửa combo/thành phần/giá → kiểm tra → công bố cho rạp chọn cung cấp.
- **Kết quả:** Danh mục/giá tập trung, không mở quyền quản lý rạp tự sửa giá hoặc thành phần.
- **Ngoại lệ:** Không hồi tố tiền/quyền của combo đã mua; ngừng cung cấp gây thiếu hàng xử lý O-07, không tự thay hoặc hủy vé phim.
- **Quy tắc:** BR-23…BR-24; không mở quản lý kho nguyên liệu.
- **Nguồn quyết định:** Q53.

### M-09 — Bật/tắt cung cấp combo tại rạp

- **Actor/kích hoạt:** Quản lý rạp. Mục tiêu: bật/tắt cung cấp combo tại rạp.
- **Điều kiện trước:** Quản lý được giao rạp; combo thuộc danh mục chuỗi.
- **Luồng chính:** Xem khả năng cung cấp → bật/tắt tại rạp → Core phản ánh lựa chọn bán cho khách.
- **Kết quả:** Khả năng cung cấp theo rạp cập nhật, danh mục/thành phần/giá chuỗi giữ quyền M-08.
- **Ngoại lệ:** Tắt cung cấp không xóa nghĩa vụ combo đã mua; không phục vụ được chuyển O-07, không buộc khách nhận voucher hoặc tự hoàn phần khác.
- **Quy tắc:** BR-23…BR-24; nhân viên quầy giao theo quyền riêng, không tự sửa danh mục.
- **Nguồn quyết định:** Q53.

### M-10 — Quản lý chính sách hội viên và đổi điểm

- **Actor/kích hoạt:** Quản trị viên toàn chuỗi. Mục tiêu: quản lý chính sách hội viên và đổi điểm.
- **Điều kiện trước:** Quản trị viên toàn chuỗi có quyền chính sách hội viên/danh mục đổi điểm.
- **Luồng chính:** Cấu hình chính sách tỷ lệ/hạng/giá điểm, hạn/quyền lợi/phạm vi/kết hợp của voucher → kiểm tra → công bố theo thời điểm áp dụng; bảo toàn điều kiện các quyền đã cấp đúng.
- **Kết quả:** Chính sách tập trung theo các mức đã chốt BR-28; quản lý rạp không tự sửa. Đơn đã xác nhận giữ hạng/tỷ lệ tích đã chốt, voucher cấp đúng giữ điều kiện cũ.
- **Ngoại lệ:** Thay đổi thông thường không hồi tố; sai/gian lận từng giao dịch dùng L-09/L-10, không sửa số dư bằng thay chính sách. Không dùng fixture làm quyền lợi mới.
- **Quy tắc:** BR-14…BR-15, BR-28…BR-29; đây là quyền quản lý chính sách, không tự đổi các giá trị đã được chủ sản phẩm chốt trong đợt UML.
- **Nguồn quyết định:** Q91–Q101, Q110–Q113.

## Buaa và thông báo dịch vụ

### L-06 — Xem thông báo dịch vụ và cảnh báo

- **Actor/kích hoạt:** Khách hàng; Nhân viên soát vé; Nhân viên quầy bắp nước; Quản lý rạp; Quản trị viên toàn chuỗi. Mục tiêu: xem thông báo dịch vụ và cảnh báo.
- **Điều kiện trước:** Người nhận có quyền với thông báo/dữ liệu: khách với tài khoản mình, nhân viên/quản lý/quản trị theo trách nhiệm và rạp.
- **Luồng chính:** Mở hộp thông báo Customer hoặc cảnh báo Organizer Web/Mobile → đọc sự kiện/mốc cần xử lý → mở hồ sơ liên quan lấy trạng thái hiện hành; nhân sự tiếp nhận/chuyển xử lý đúng quyền trong mục tiêu nghiệp vụ tương ứng.
- **Kết quả:** Người nhận biết việc cần theo dõi; email cũ không thay Core. Cộng điểm thông thường chỉ trong hộp thông báo, sự kiện quan trọng theo N-01.
- **Ngoại lệ:** Email đã gửi/đã mở chưa tự là đã tiếp nhận hoặc xử lý xong hồ sơ; hạn tính từ phát cảnh báo. Ngoài quyền không mở dữ liệu; nhân viên không được xử lý ngoại lệ hoàn/xóa dữ liệu chỉ vì thấy cảnh báo.
- **Quy tắc:** BR-33; chưa SMS/push/quảng cáo/nhắc lịch tự động. N-01 sở hữu gửi/gửi lại email, không có association ACT-MAIL ở thao tác đọc.
- **Nguồn quyết định:** Q147–Q150.

### C-01 — Trò chuyện với Buaa

- **Actor/kích hoạt:** Khách chưa đăng nhập; Khách hàng; Dịch vụ mô hình AI. Mục tiêu: trò chuyện với buaa.
- **Điều kiện trước:** Khách chưa đăng nhập có thể hỏi thông tin công khai; thao tác tài khoản/giao dịch phải xác thực và kiểm quyền tương ứng.
- **Luồng chính:** Khách nhập nhu cầu → Agent Service lọc/tối thiểu hóa chat và dữ liệu trước gọi mô hình AI ngoài → diễn giải phản hồi, kiểm công cụ/quyền → truy vấn hoặc lập đề xuất để app/BFF thực thi sau xác nhận đúng phiên bản Core, dưới danh tính khách → trình bày kết quả đã xác minh từ Core và cách tiếp tục.
- **Kết quả:** Có câu trả lời/hành trình đặt, đổi ghế hoặc hỗ trợ sau mua trong phạm vi kênh AI; mô hình không xác nhận tiền/vé hoặc phê duyệt hủy.
- **Ngoại lệ:** Không gửi tên/email/điện thoại/toàn hồ sơ/đơn, mật khẩu/OTP/token/khóa/QR/thẻ ra mô hình. Lỗi/hết hạn mức báo Buaa gián đoạn, hướng màn hình trực tiếp khi Core còn hoạt động, quan hệ tự chuyển provider theo Q153/ADR-0028 còn phải chốt OPEN-12; tra cứu giao dịch trước thử lại, không kéo TTL. Không tự xóa chat định kỳ; khách xóa qua A-06.
- **Quy tắc:** BR-17, BR-34, BR-37, BR-39; ACT-LLM là dịch vụ ngoài, Agent Service/Core là nội bộ; vendor/model đã chọn ở ADR-0012/0028; cấu hình/ngân sách/lọc dữ liệu còn OPEN-09, hành vi fallback còn OPEN-12.
- **Nguồn quyết định:** Q8, Q30, Q42, Q151–Q154.

### N-01 — Gửi và gửi lại thông báo dịch vụ

- **Actor/kích hoạt:** Khách hàng; Dịch vụ email. Mục tiêu: gửi và gửi lại thông báo dịch vụ.
- **Điều kiện trước:** Có sự kiện dịch vụ/xác minh quyền nhận; khách yêu cầu gửi lại phải đúng chủ/thông báo, kiểm trạng thái hiện hành.
- **Luồng chính:** Nhận sự kiện → tạo hộp thông báo đúng người → gửi email qua dịch vụ ngoài cho cấp/cập nhật vé/đổi ghế, tiếp nhận/quyết định/diễn biến hủy–hoàn/sự cố/cập nhật 24 tiếng, kiểm duyệt/xét lại, cấp/thu hồi voucher/thay hạng/sửa quyền lợi; cộng điểm thường chỉ vào tài khoản. Email lỗi tự thử lại giới hạn; khách yêu cầu gửi lại có chống spam → báo kết quả gửi thực tế.
- **Kết quả:** Khách/vận hành nhận thông tin hoặc cảnh báo qua hộp thông báo/email; mở chi tiết để lấy dữ liệu Core. Cảnh báo Organizer đúng vai trò/phạm vi/trách nhiệm.
- **Ngoại lệ:** Không gửi được cảnh báo vận hành và hướng tra cứu tài khoản; không hủy giao dịch/phát thêm vé, không gửi vé đã hủy như hiệu lực hoặc mã bảo mật hết hạn. Email gửi/đọc không tự tính tiếp nhận/giải quyết hồ sơ. Không SMS/push/quảng cáo/nhắc lịch.
- **Quy tắc:** BR-33, BR-39; gửi do sự kiện không sinh include/extend với mỗi giao dịch; A-02/A-04/A-05/O-02/O-04 sở hữu tương tác email xác minh trực tiếp. Resend đã chọn theo ADR-0018, Notification sở hữu chuyển phát; số lần/khoảng chờ/gói/điều kiện dữ liệu còn OPEN-09.
- **Nguồn quyết định:** Q147–Q150, Q154.

## Xóa chat, tài khoản và dữ liệu

### A-06 — Xóa lịch sử chat

- **Actor/kích hoạt:** Khách hàng. Mục tiêu: xóa lịch sử chat.
- **Điều kiện trước:** Đã xác minh đúng chủ tài khoản; thao tác trên Customer Web/Mobile, không giao Buaa tự xóa.
- **Luồng chính:** Chọn một cuộc hoặc toàn bộ lịch sử → xem phạm vi/hệ quả → xác nhận → xử lý xóa phần đủ điều kiện → hiển thị kết quả, phần cần giữ/chờ với lý do và chuyển A-08 nếu có ngoại lệ.
- **Kết quả:** Chat đủ điều kiện được xử lý theo yêu cầu; đơn/vé/hoàn tại Core vẫn độc lập. Không tự xóa chat định kỳ.
- **Ngoại lệ:** Không đủ quyền/xác nhận thì không xóa; chưa xóa được bản sao/log/đối tác thì không báo xóa tất cả. Phản hồi có nội dung trong 24 tiếng liên tục từ tiếp nhận, không chỉ báo đã nhận.
- **Quy tắc:** BR-37…BR-39; OPEN-10: bảng lưu/xóa, thời hạn thực hiện/gia hạn và xử lý bản sao/nhà cung cấp phải đặc tả/kiểm chứng trước dữ liệu thật.
- **Nguồn quyết định:** Q164–Q165, Q169–Q170.

### A-07 — Yêu cầu và theo dõi xóa tài khoản

- **Actor/kích hoạt:** Khách hàng. Mục tiêu: yêu cầu và theo dõi xóa tài khoản.
- **Điều kiện trước:** Đúng chủ tài khoản, xác minh ý định; hiển thị quyền vé/combo, hồ sơ hủy–hoàn, điểm/voucher chưa dùng.
- **Luồng chính:** Khách xác nhận yêu cầu xóa → nếu còn dịch vụ/hủy–hoàn thì chờ đóng, dừng mua/đổi điểm mới nhưng giữ dùng/theo dõi đơn cũ, cho rút yêu cầu khi chờ → vẫn xóa dữ liệu không cần thiết đủ điều kiện → khi đủ điều kiện, xác nhận từ bỏ điểm/voucher gắn riêng chưa dùng → hoàn tất xóa dữ liệu đủ điều kiện, thu hồi phiên và gửi kết quả qua N-01.
- **Kết quả:** Tài khoản được xử lý xóa thực sự theo phạm vi đủ điều kiện; phần cần giữ có căn cứ/lý do/thời hạn rõ, nghĩa vụ hoàn/đơn cũ không biến mất.
- **Ngoại lệ:** Không giữ toàn bộ hồ sơ chỉ vì một khoản hoàn. Khách muốn dùng quyền lợi có thể rút khi chờ; không tự quy điểm/voucher thành tiền/chuyển tài khoản hoặc vô hiệu mã công khai. Hồ sơ vướng có người xử lý/thời hạn, chuyển A-08; 24 tiếng là phản hồi có nội dung, không hứa mọi bản sao xóa xong.
- **Quy tắc:** BR-38…BR-39; OPEN-10. Xóa tài khoản khác đăng xuất/khóa đăng nhập; chưa xác nhận pháp lý/kho ứng dụng đã đáp ứng.
- **Nguồn quyết định:** Q166–Q170.

### A-08 — Xử lý ngoại lệ xóa dữ liệu

- **Actor/kích hoạt:** Quản trị viên toàn chuỗi. Mục tiêu: xử lý ngoại lệ xóa dữ liệu.
- **Điều kiện trước:** Quản trị viên được giao hồ sơ xóa dữ liệu có ngoại lệ; chỉ quyền truy cập tối thiểu cần cho hồ sơ.
- **Luồng chính:** Xem phần đang vướng/căn cứ giữ/đối tác/tranh chấp → xác minh → quyết định xử lý từng phần, ghi lý do/lịch sử và thời hạn dự kiến → phản hồi chủ tài khoản qua N-01, tiếp tục xử lý phần đủ điều kiện.
- **Kết quả:** Khách biết phần đã xử lý, phần giữ/chờ và căn cứ; không phải duyệt tay mọi lần xóa chat.
- **Ngoại lệ:** Không cho quản lý rạp/nhân viên tự xóa/quyết định giữ hồ sơ; không mở quyền xem mọi chat. Phản hồi ban đầu tối đa 24 tiếng liên tục; chưa đủ chứng cứ không báo đã xóa hết.
- **Quy tắc:** BR-38…BR-39; OPEN-10 giữ bảng chi tiết/pháp lý/tích hợp chưa hoàn tất.
- **Nguồn quyết định:** Q168–Q170.
