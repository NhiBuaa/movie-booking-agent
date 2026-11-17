# Quyết định và lý do thiết kế microservices

Bản ghi này giữ nguyên nội dung các quyết định đã được xác nhận trong hội thoại ngày 2026-11-17,
được tách từ bản thiết kế trước khi thu gọn về cấp độ kiến trúc. Mỗi mục ghi nguồn duyệt và lý do;
không có URL phê duyệt riêng. Đây là nguồn truy vết chấp thuận, không phải nhật ký tiến độ hoặc
bằng chứng code, kiểm thử, hợp nhất hay triển khai vận hành.

[Bản kiến trúc tổng hợp](spec.md) là điểm đọc chính. Các nội dung chi tiết như 60 phút tiếp tục soát,
90/15 phút bằng chứng vận hành, xác nhận theo phiên bản và xử lý từng đơn được giữ tại đây để không
mất quyết định đã duyệt; không tiếp tục phát triển chúng thành đặc tả tính năng trong nhiệm vụ này.
Các mục “chưa chốt” trong từng quyết định cần đọc cùng các quyết định tiếp sau nó.

Chủ sản phẩm đã xác nhận quay về phạm vi kiến trúc. Việc tổ chức lại tài liệu không thay đổi
các chấp thuận trước. Ba phương thức tích hợp được duyệt sau đợt nghiên cứu riêng, ghi ở cuối file;
không nhầm đề xuất đồng bộ Catalog qua sự kiện trước đó với lựa chọn HTTP đã được duyệt sau này.
Các đặc tả tính năng, schema/endpoint và topology triển khai thuộc công việc riêng khi được giao.

## Quyết định đã duyệt: hướng B

**Nguồn duyệt:** trong hội thoại thiết kế microservices ngày 2026-11-17, chủ sản phẩm trả lời
“tôi đồng ý với đề xuất hướng B của bạn” cho phương án giữ Core giao dịch và tách thêm nghiệp vụ
khi có lý do độc lập. Không có URL phê duyệt riêng. Phê duyệt này chưa chốt danh sách service cuối cùng.

Giữ ghế, giữ chỗ có thời hạn, đơn hàng, xác nhận thanh toán và quyền vé trong **Cinema Core**.
**Agent Service** tiếp tục điều phối hội thoại qua hợp đồng với Core. Xét tách các nghiệp vụ khác
theo trách nhiệm, quyền sở hữu dữ liệu, khả năng phát hành, yêu cầu nhất quán và phục hồi khi lỗi.
Số nhân sự không được dùng làm tiêu chí loại phương án theo yêu cầu trực tiếp của chủ sản phẩm.

Core được chia thành các **module** có trách nhiệm và **interface** rõ ràng. Interface gồm cả
điều kiện sử dụng, thứ tự thao tác, lỗi và các bảo đảm nghiệp vụ. Module không mặc nhiên là một
service triển khai riêng. Việc cùng nằm trong Core cũng không có nghĩa mọi thao tác dùng chung
một database transaction hoặc có thể gộp giao dịch với cổng thanh toán bên ngoài.

### Các phương án và lý do chọn

| Phương án | Lợi ích | Đánh đổi / quyết định |
| --- | --- | --- |
| A — Core theo module và Agent riêng | Giữ nhóm giao dịch gần nhau; ít giao tiếp liên tiến trình trong nhóm. | Chưa chọn làm thiết kế đích vì vẫn cần xét các nghiệp vụ có lý do độc lập. |
| **B — Core giao dịch, Agent và các nghiệp vụ có lý do tách riêng** | Bảo vệ thẩm quyền giao dịch; cho phép thiết kế quyền sở hữu và phục hồi độc lập ở các miền phù hợp. | **Được duyệt làm hướng phân tích.** Phải chốt từng phần trước khi xác định danh sách service. |
| C — Tách ghế, đơn, thanh toán và vé thành service riêng ngay | Có thể phát hành/mở rộng từng phần độc lập. | Chưa chọn: đưa tính nhất quán của giao dịch mua vé qua nhiều kho dữ liệu và cần phối hợp, trạng thái trung gian, bù trừ/đối soát. |

Lý do chọn B là ghế, đơn, căn cứ thanh toán và quyền vé có các điều kiện liên quan trực tiếp:
quyền giữ ghế có thể hết hạn trong khi kết quả thanh toán chưa rõ; một quyền vé có thể đồng thời
được soát hoặc bị xét hủy. Giữ nhóm này trong Core tập trung việc bảo vệ điều kiện nghiệp vụ.
Các cuộc gọi thanh toán bên ngoài vẫn có thể lỗi hoặc mất phản hồi và cần xử lý riêng.
Đây là lập luận thiết kế, chưa phải kết quả kiểm thử cạnh tranh hoặc phục hồi.

## Quyết định đã duyệt: Catalog phim và lịch chiếu

**Nguồn duyệt:** chủ sản phẩm trả lời “tôi đồng ý với đề xuất của bạn” trong hội thoại này ngày
2026-11-17, ngay sau đề xuất tách Catalog phim, giữ rạp/phòng/ghế/lịch chiếu và điều kiện bán tại Core,
với phiên bản thông tin phim gắn với suất. Không có URL phê duyệt riêng.

| Phần | Trách nhiệm và dữ liệu sở hữu |
| --- | --- |
| **Catalog Service** | Nội dung phim: tên, mô tả, thể loại, trailer, thời lượng và phân loại độ tuổi. |
| **Cinema Core** | Rạp, phòng, sơ đồ ghế, lịch chiếu, giá và điều kiện mở/dừng bán; phiên bản thông tin phim cần cho giao dịch của từng suất. |

Khi lập suất, Core lưu phiên bản thông tin phim cần cho giao dịch và tham chiếu phim tương ứng.
Sửa nội dung trong Catalog không tự đổi thời lượng hoặc thông tin giao dịch của suất đã công bố.
Catalog không xác nhận ghế trống, giá giao dịch hoặc quyền vé; các truy vấn nội dung không thay
việc Core kiểm tra điều kiện tại lúc nhận lệnh giao dịch.

**Lý do:** biên tập nội dung phim có mô hình và nhịp thay đổi riêng. Lịch chiếu lại phải bảo vệ
điều kiện phòng/ghế, hold và vé, bao gồm quy tắc không sửa phim/giờ/phòng/sơ đồ khi có hold còn
hiệu lực hoặc khi suất đã có vé. Tách lịch chiếu khỏi Core ngay sẽ đưa các kiểm tra này qua nhiều
chủ dữ liệu. Giữ Catalog thành module trong Core vẫn là phương án hợp lệ nhưng không phải lựa chọn
đã chốt; hướng hiện tại tách trách nhiệm nội dung trong khi tập trung quyền quyết định bán vé.

**Giới hạn quyết định:** chưa chọn cách cấp ID/phiên bản, giao thức lấy dữ liệu, cơ chế đồng bộ,
cách công bố phiên bản hoặc xử lý sửa sai thông tin của suất đã công bố. Đặc biệt, không suy việc
lưu phiên bản thành chính sách bỏ qua đính chính nội dung/phân loại độ tuổi; cần thiết kế xử lý riêng
khi làm rõ vòng đời dữ liệu. Không tự sửa chính sách sản phẩm từ quyết định chia service.

## Quyết định đã duyệt: Identity & Access Service

**Nguồn duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý với bạn” ngay sau đề xuất
tách Identity & Access trong hội thoại này. Quyết định giữ công nghệ Better Auth đã chọn ở hội thoại
Tech Stack; chưa chọn thêm thư viện phân quyền, IdP, OAuth Provider hoặc framework triển khai.

| Phần | Trách nhiệm và dữ liệu sở hữu |
| --- | --- |
| **Identity & Access Service** | Tài khoản, thông tin đăng nhập, trạng thái xác minh email, phiên đăng nhập, khóa tài khoản; cấp/thu hồi vai trò và phạm vi rạp được giao. |
| **Cinema Core** | Xác minh người gọi và quyết định quyền đối với hành động/tài nguyên giao dịch: đơn của ai, vé thuộc suất/rạp nào, quyền còn hiệu lực và trạng thái đã sử dụng. |
| **Catalog và các service khác** | Xác minh người gọi và kiểm tra quyền đối với hành động, dữ liệu do mình sở hữu. |

Bốn ứng dụng dùng chung nguồn danh tính và cấp quyền. Identity ghi nhận quyền đã được cấp;
quyền đó không thay kiểm tra tài nguyên tại service sở hữu. Ví dụ, nhân viên có quyền soát tại rạp A
vẫn không được Core chấp nhận một vé của rạp B hoặc vé đã sử dụng. Đường thực thi lệnh giao dịch
trong chat được chốt bên dưới; Agent nội bộ không có quyền giả danh mọi khách.

**Lý do:** vòng đời tài khoản, phiên và quản trị truy cập khác giao dịch ghế/vé. Tách Identity
cho phép dùng chung danh tính giữa các kênh và thay đổi phần bảo mật độc lập với Core. Đặt Auth trong
Core là phương án ít đầu mối hơn nhưng gắn hai vòng đời; để mỗi ứng dụng tự quản lý tài khoản sẽ
phân tán nguồn danh tính/cấp quyền. Đánh đổi của lựa chọn hiện tại là cần hợp đồng xác thực,
thu hồi quyền/phiên và xử lý lỗi Identity rõ ràng.

**Giới hạn quyết định:** chưa chốt claim/token, thời hạn token/phiên, cửa sổ thu hồi và chi tiết cache quyền.
Nguyên tắc kiểm tra theo mức rủi ro được chốt ở phần dưới, không gọi Identity cho mọi lượt soát. Xác minh
chữ ký JWT cục bộ không tự bảo đảm quyền/phiên vẫn hiện hành. Hồ sơ sở thích, dữ liệu hội viên,
điểm và quyền lợi chưa được gộp vào Identity từ quyết định này. Ranh giới database/schema vật lý
và phân phối khóa công khai cũng cần thiết kế riêng.

## Quyết định đã duyệt: Notification Service

**Nguồn duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý” ngay sau đề xuất tách
Notification trong hội thoại này. Chưa chọn nhà cung cấp email hoặc bổ sung kênh SMS/push.

| Phần | Trách nhiệm và dữ liệu sở hữu |
| --- | --- |
| **Notification Service** | Mẫu thông báo, hộp thông báo trong app, yêu cầu gửi email, lịch sử/trạng thái gửi và việc thử gửi lại có kiểm soát. |
| **Identity/Core** | Quyết định nghiệp vụ cần thông báo; phát hành và kiểm tra mã xác minh, mã khôi phục hoặc mã xác nhận thuộc luồng mình quản lý. |

Core phát hành vé thành công rồi yêu cầu gửi thông báo. Lỗi gửi email không làm mất hiệu lực vé;
Notification theo dõi và xử lý việc gửi lại. Ngược lại, một email được báo gửi thành công chưa có
nghĩa tài khoản đã xác minh hoặc yêu cầu khôi phục đã hoàn tất: Identity phải kiểm tra bằng chứng
khách cung cấp. Notification không quyết định thay trạng thái giao dịch hoặc trạng thái xác minh.

**Lý do:** tập trung quản lý mẫu, nhà cung cấp và lỗi chuyển phát; tách khả năng phục hồi gửi thư
khỏi giao dịch vé và xác thực. Để Core/Identity tự gửi là phương án ít đầu mối hơn nhưng phân tán
trách nhiệm gửi/lịch sử/lỗi. Đánh đổi của việc tách là phải bàn giao yêu cầu bền vững và chống xử lý lặp.

**Giới hạn quyết định:** chưa chốt interface bàn giao, retry/backoff, giới hạn gửi, lưu dữ liệu,
quyền đọc hộp thông báo, bảo vệ nội dung nhạy cảm hoặc cách phân biệt đã nhận yêu cầu/đã gửi/đã giao.
Không hứa email đến đúng một lần chỉ từ cơ chế chống xử lý lặp nội bộ. Mã và token bảo mật cần
được bảo vệ trong yêu cầu gửi, lưu trữ, log và công cụ quan sát khi thiết kế chi tiết.

## Quyết định đã duyệt: Hội viên và Ưu đãi/Voucher trong Core

**Nguồn duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý” ngay sau đề xuất giữ
Hội viên và Ưu đãi/Voucher trong Cinema Core, thành hai module có interface và dữ liệu sở hữu riêng.
Không tách Loyalty Service hoặc Promotion Service từ quyết định này.

| Module thuộc Cinema Core | Trách nhiệm và dữ liệu sở hữu |
| --- | --- |
| **Hội viên** | Sổ điểm, hạn điểm, hạng và chi tiêu xét hạng; chính sách tích/đổi điểm. |
| **Ưu đãi & Voucher** | Chương trình giảm giá, voucher và lượt sử dụng; phân bổ giảm giá, khôi phục/cấp bù theo chính sách. |

Hai module giao tiếp qua interface, không tự ghi bảng dữ liệu của nhau. Module Đơn hàng/Thanh toán
tiếp tục sở hữu giao dịch mua và căn cứ tiền thu/hoàn; dữ liệu ưu đãi hoặc điểm không thay bằng chứng thanh toán.
Identity sở hữu danh tính/cấp quyền, không tự sở hữu số dư điểm hoặc hạng hội viên.

**Lý do:** các bổ sung nghiệp vụ được đối chiếu ở Q90–Q101 yêu cầu chốt hạng/tỷ lệ tích khi xác
nhận đơn/phát hành vé, chỉ cộng điểm khi soát vé, và nâng hạng khi ghi nhận đủ chi tiêu. Đổi điểm
phải trừ và cấp voucher đúng một lần; áp voucher phải gắn với giá/giao dịch và chống dùng lặp.
Giữ hai module trong Core tập trung kiểm soát các điều kiện liên quan, đồng thời giữ trách nhiệm riêng.
Các giá trị và ngoại lệ sản phẩm do mô hình nghiệp vụ sở hữu, không được định nghĩa lại trong thiết kế này.

Tách Loyalty riêng vẫn là phương án khả thi nhưng cần phối hợp trừ điểm–cấp voucher và giữ thông tin
hạng hiện hành tại lúc Core chốt đơn. Tách cả Promotion làm phát sinh thêm phối hợp lượt dùng và giá.
Không chọn hai phương án đó cho thiết kế đích hiện tại; đây là quyết định theo tính nhất quán,
không phải giới hạn nhân lực hoặc khẳng định không thể tách về sau.

**Giới hạn quyết định:** chưa chốt interface, schema, cơ chế khóa/cạnh tranh hoặc transaction cụ thể
giữa các module. Chính sách sản phẩm còn mở và các bổ sung mới hơn Q101 vẫn phải được đối chiếu
trước đặc tả chi tiết; không suy quyền sửa số dư, thu hồi điểm hoặc hoàn điểm từ quyết định chia module.

## Quyết định đã duyệt: Combo trong Cinema Core

**Nguồn duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý” ngay sau đề xuất giữ
Combo trong Cinema Core với interface và dữ liệu sở hữu riêng. Không tách Concessions Service.

Module Combo sở hữu danh mục, thành phần, giá combo, trạng thái cung cấp theo rạp; quyền nhận
combo của từng đơn, ca nhận, trạng thái đã giao và lịch sử điều chỉnh. Module cũng quản lý phương án
thay đã được duyệt và phối hợp với thanh toán để thu/hoàn chênh lệch. Quyền của quản trị viên,
quản lý rạp và nhân viên quầy giữ theo mô hình sản phẩm; không cấp quyền mới từ vị trí module.

Catalog Service đã chốt chỉ quản lý nội dung phim. Danh mục combo thuộc module Combo, còn giá
giao dịch sau ưu đãi và căn cứ thu/hoàn phải được phối hợp qua interface các module Core có thẩm quyền.
Các module không tự ghi bảng của nhau. Phạm vi này không mở rộng sang quản lý kho nguyên liệu vật lý.

**Lý do:** hủy đơn/hủy suất phải xét combo đã giao hay chưa; thay combo đắt hơn chỉ được giao sau
khi Core xác minh khoản thu thêm. Giao hàng và hủy có thể tranh chấp cùng một quyền nhận combo.
Giữ trong Core tập trung việc kiểm soát các điều kiện này. Tách thành service riêng vẫn khả thi
nhưng cần phối hợp quyền nhận hàng và hủy/hoàn qua nhiều chủ dữ liệu; chưa được chọn cho thiết kế này.

**Giới hạn quyết định:** chưa chốt schema, interface, khóa/transaction khi giao tranh chấp với hủy,
hoặc quy trình kỹ thuật thu/hoàn chênh lệch. Cơ chế bảo vệ giao lặp và tra cứu kết quả chưa rõ phải
được đặc tả; chấp thuận module không chứng minh khả năng thu/hoàn thực tế của cổng thanh toán.

## Quyết định đã duyệt: Community Service

**Nguồn duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý” ngay sau đề xuất
Community Service với hai module Đánh giá và Phim yêu thích trong hội thoại này.

| Module thuộc Community | Trách nhiệm và dữ liệu sở hữu |
| --- | --- |
| **Đánh giá** | Nội dung, điểm đánh giá, trạng thái hiển thị; lịch sử và lý do ẩn nội dung theo quyền đã chốt. |
| **Phim yêu thích** | Danh sách phim yêu thích của từng tài khoản. |

Catalog sở hữu nội dung phim. Core cung cấp căn cứ tài khoản có vé phim đã soát. Community kiểm
tra điều kiện đăng, bảo đảm một đánh giá/tài khoản/phim và quản lý nội dung sau đó theo mô hình sản phẩm.
Phạm vi kiểm duyệt và quyền sửa/xóa/ẩn không thay đổi từ việc tách service. Không suy việc một tài khoản
có vé đã soát thành bằng chứng mọi người đi cùng đều có quyền đánh giá riêng.

**Lý do:** nội dung và danh sách riêng của khách có vòng đời khác nội dung phim do rạp quản lý,
và khác giao dịch ghế/vé. Đặt hai module trong Catalog là phương án giảm một service nhưng gộp hai
nhóm trách nhiệm đó. Chọn Community riêng; mục tiêu thiết kế là lỗi Community không ngăn đặt/soát vé.
Core không phụ thuộc vào Community để xác nhận một giao dịch vé hợp lệ.

**Giới hạn quyết định:** chưa chọn interface xác minh điều kiện đánh giá, dữ liệu dẫn xuất, mức
trễ chấp nhận được hoặc cách phản hồi khi chưa xác minh được từ Core. Không tự cho đăng từ căn cứ
chưa xác thực, sửa điều kiện hậu kiểm hoặc cấp thêm quyền cho Agent. Quy tắc kiểm duyệt chi tiết,
khiếu nại và chính sách dữ liệu còn theo các mục mở của mô hình sản phẩm.

## Quyết định đã duyệt: Reporting Service

**Nguồn duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý với bạn” ngay sau đề xuất
tách Reporting, cho phép dữ liệu tổng hợp cập nhật trễ và hiển thị rõ mốc cập nhật.

Reporting sở hữu dữ liệu tổng hợp/bản sao phục vụ báo cáo vận hành và doanh thu, truy vấn theo
rạp/toàn chuỗi, kiểm tra quyền và mốc dữ liệu đã cập nhật. Core tiếp tục sở hữu trạng thái ghế,
đơn, khoản thu/hoàn, vé, combo và điểm có thẩm quyền; Core quyết định giao dịch và xử lý đối soát.

Reporting nhận dữ liệu qua hợp đồng và tự lưu mô hình đọc phù hợp; không sửa bảng nghiệp vụ Core.
Báo cáo phải thể hiện mốc cập nhật, không dùng bản sao trễ để xác nhận “đã thu/đã hoàn tiền”.
Lỗi Reporting không được làm luồng đặt hoặc soát vé phụ thuộc vào việc báo cáo đang hoạt động.

**Lý do:** tách truy vấn tổng hợp và việc xây lại báo cáo khỏi xử lý giao dịch. Chạy mọi báo cáo
trong Core là phương án ít đầu mối hơn nhưng gắn tải/vòng đời tổng hợp với xử lý đặt vé. Đánh đổi
của Reporting riêng là dữ liệu có thể trễ, cần chống tính trùng và phát hiện phần chưa đồng bộ.

**Giới hạn quyết định:** định nghĩa chỉ số doanh thu/hoàn tiền và dữ liệu cá nhân còn do OPEN-10
của mô hình sản phẩm sở hữu. Chưa chốt độ trễ tối đa, hợp đồng sự kiện cụ thể, schema hoặc cách
xây lại dữ liệu. Không suy Kafka replay có thể khôi phục mọi lịch sử ngoài giới hạn retention;
phải xác định nguồn và thời đoạn tái dựng/đối chiếu trước khi chọn cơ chế.

## Quyết định đã duyệt: database riêng cho từng service

**Nguồn duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý với bạn” ngay sau đề xuất
mỗi service một database PostgreSQL riêng, tài khoản truy cập/migration riêng và không truy cập chéo.
Số máy chủ/cụm PostgreSQL và phương án sao lưu/phục hồi chưa được chọn.

- Mỗi service sở hữu database logic của mình, gồm dữ liệu nghiệp vụ hoặc checkpoint/mô hình đọc
  theo trách nhiệm đã duyệt. Các module Core cùng dùng database của Core, không tách database theo module.
- Tài khoản runtime và quyền migration được quản lý riêng cho từng service; không dùng credential
  toàn quyền chung. Quyền thực tế phải được cấu hình/kiểm chứng, không suy ra chỉ từ tên database.
- Service không đọc/ghi, JOIN hoặc tạo khóa ngoại tới database service khác, kể cả dùng nhiều
  connection, FDW hoặc dblink. Liên hệ bằng ID/hợp đồng; Reporting tự lưu bản sao cần cho báo cáo.
- Không import mô hình lưu trữ/ORM của service khác thành hợp đồng dùng chung. Chia sẻ hợp đồng
  không trao quyền truy cập bảng hoặc để một migration sửa cấu trúc do service khác sở hữu.

CDC và hoạt động quản trị là các vai trò hạ tầng có quyền giới hạn theo thiết kế riêng, không phải
quyền cho business service đọc bảng của nhau. Debezium cần quyền đọc outbox/WAL phù hợp tại nguồn
phát; không mặc định phát toàn bộ bảng nghiệp vụ hoặc dùng credential runtime dùng chung.

**Lý do:** database riêng thể hiện ranh giới truy cập và vòng đời cấu trúc rõ hơn schema riêng chung
database. Schema riêng vẫn có thể phân quyền nhưng dễ hình thành phụ thuộc SQL/FK xuyên service.
Đánh đổi của lựa chọn là cần hợp đồng và đồng bộ dữ liệu liên service thay vì JOIN trực tiếp.

Nhiều database có thể cùng cụm PostgreSQL; database riêng không tạo cách ly tài nguyên hoặc HA.
WAL/khôi phục và quyền cấp cụm vẫn có thể liên quan nhau. Chưa chọn số cụm, connector/slot,
ngân sách kết nối, topology, backup/restore hoặc cấu hình quyền cụ thể. Xem các căn cứ tại
[nghiên cứu PostgreSQL](../../99-notes/service-boundary-research.md#so-sánh-lưu-trữ-postgresql).

## Quyết định đã duyệt: HTTP/JSON kết hợp sự kiện Kafka

**Nguồn duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý với bạn” ngay sau đề xuất
kết hợp HTTP/JSON cho truy vấn/lệnh và Kafka cho sự kiện đã được lưu thành công trong hội thoại này.
Giữ lựa chọn Transactional Outbox, Debezium/Kafka Connect và Kafka KRaft đã chốt ở hội thoại Tech Stack.

| Nhu cầu | Cách giao tiếp đã chọn |
| --- | --- |
| Tra cứu, giữ/đổi ghế, soát vé và gửi yêu cầu giao dịch | HTTP/JSON tới service sở hữu; trả kết quả hoặc trạng thái đang xử lý đúng thực tế. |
| Phân phối sự việc nghiệp vụ đã được lưu thành công | Sự kiện qua Outbox → Debezium → Kafka; không lấy lời đề nghị hoặc trạng thái chưa xác minh làm kết quả đã xảy ra. |
| Cập nhật Reporting và thông báo giao dịch | Consumer xử lý nền; lỗi không đảo ngược giao dịch Core đã hợp lệ. |

Tạo thanh toán qua HTTP chỉ trả thông tin thanh toán/trạng thái tương ứng, chưa phải vé đã mua.
Core chỉ công bố kết quả phát hành vé khi đã xác minh đủ điều kiện và lưu kết quả theo thẩm quyền.
HTTP trả thành công về việc tiếp nhận lệnh không tự đồng nghĩa nghiệp vụ cuối cùng thành công.

Core ghi thay đổi nghiệp vụ và outbox trong cùng PostgreSQL transaction trước khi CDC phân phối.
Đây là ranh giới với broker, không phải transaction bao gồm Kafka hoặc cổng thanh toán bên ngoài.
Sự kiện là hợp đồng của service phát, không phải bản sao mặc định của mọi bảng. Hợp đồng chung
tiếp tục do packages/contracts sở hữu theo hướng công nghệ đã chọn; không dùng schema ORM làm API.

**Lý do:** chỉ HTTP gắn việc phân phối nhiều bên vào các lời gọi trực tiếp; đưa mọi thao tác qua
Kafka làm cả giữ/soát ghế phải quản lý thêm trạng thái chờ. Cách kết hợp phân biệt yêu cầu làm việc
với sự việc đã xảy ra. Consumer vẫn phải xử lý lặp và phục hồi; Kafka không tạo bảo đảm đúng một lần
từ đầu đến cuối hoặc cho Agent quyền tự xác nhận vé.

**Giới hạn quyết định:** chưa chốt endpoint, timeout/deadline, lịch retry cụ thể, topic, phiên bản,
khóa phân vùng/thứ tự và lưu giữ sự kiện. Mã/token bảo mật cho email tài khoản cần kênh bàn giao
riêng có bảo vệ; không mặc định đưa chúng vào sự kiện nghiệp vụ dùng chung. Interface Catalog–Core,
kiểm quyền hiện hành và xác minh điều kiện đánh giá vẫn cần quyết định luồng cụ thể.
BullMQ giữ vai trò quản lý tác vụ nền theo lựa chọn đã có; cách nối consumer sang job chưa được chốt,
không mặc định mọi event đều cần đi qua cả Kafka lẫn BullMQ.

## Quyết định đã duyệt: mã thao tác và xử lý kết quả chưa rõ

**Nguồn duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý với bạn” ngay sau đề xuất
áp dụng mã thao tác ổn định, lưu bền kết quả và tra cứu sau timeout xuyên suốt các service.

1. Mỗi thao tác thay đổi dữ liệu có mã ổn định; các lần thử lại cùng thao tác giữ nguyên mã.
2. Service sở hữu lưu trạng thái/kết quả trong PostgreSQL, phối hợp nguyên tử với thay đổi nghiệp vụ.
   Cache hoặc checkpoint Agent không thay việc ghi nhận có thẩm quyền này.
3. Cùng mã/cùng nội dung trả kết quả đã có hoặc trạng thái đang xử lý, không thực hiện thêm tác dụng
   phụ nghiệp vụ. Cùng mã nhưng nội dung khác bị từ chối.
4. Timeout chưa chứng minh thất bại. Bên gọi tra cứu thao tác cũ trước khi quyết định thử lại;
   không tự tạo mã mới để giữ ghế, thu tiền, soát vé hoặc trừ điểm lần nữa.
5. Mọi lần gọi và tra cứu vẫn phải xác thực, kiểm tra quyền đối với kết quả/tài nguyên. Mã thao tác
   không phải credential hoặc bằng chứng được phép truy cập.

Phạm vi mã phải gắn với người gọi/loại lệnh và tài nguyên phù hợp; không để mã trùng hoặc một mã
biết được làm lộ kết quả của người khác. Ràng buộc nghiệp vụ vẫn phải chống tranh chấp ngay cả khi
hai yêu cầu dùng mã khác nhau; chống lặp không thay bảo vệ ghế, quyền vé hoặc số dư điểm.

**Lý do:** Core có thể đã commit nhưng phản hồi bị mất. Ví dụ đổi ghế đã thành công phải trả lại
kết quả cũ, không đổi thêm lần nữa hoặc tính lại thời hạn/số lượt. Agent resume và người dùng đổi kênh
cũng phải tra trạng thái có thẩm quyền, không dựa vào checkpoint hoặc tạo thao tác giao dịch mới mù quáng.

**Giới hạn quyết định:** chưa chốt tên header/endpoint, kiểu ID, thời hạn giữ bản ghi, schema và
quy trình phục hồi từng loại. Lệnh tới cổng thanh toán vẫn cần tra cứu/đối soát theo khả năng provider;
không suy một transaction PostgreSQL bao gồm lời gọi ngoài hoặc bảo đảm tác dụng phụ đúng một lần
từ đầu đến cuối. Nguyên tắc consumer được chốt bên dưới; schema và thứ tự cụ thể vẫn cần đặc tả.

## Quyết định đã duyệt: giao dịch cục bộ ngắn trong Core

**Nguồn duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý” ngay sau đề xuất giao dịch
PostgreSQL cục bộ ngắn cho các thay đổi quyền liên quan; thu/hoàn tiền và gửi email nằm ngoài transaction.

| Thao tác | Phần phải thành công cùng nhau |
| --- | --- |
| Giữ/đổi ghế | Kiểm tra điều kiện và cập nhật toàn bộ quyền ghế liên quan; lỗi thì giữ nguyên trạng thái cũ. |
| Soát vé | Ghi nhận ghế đã sử dụng, điểm/chi tiêu và thay đổi hạng tương ứng theo chính sách. |
| Đổi điểm | Trừ điểm và cấp đúng một voucher. |
| Duyệt hủy | Vô hiệu quyền sử dụng, giải phóng phần được phép bán lại và ghi nghĩa vụ hoàn tiền. |

Mỗi transaction ghi kết quả thao tác và outbox cần thiết. Các module phối hợp qua interface và
transaction cục bộ của Core, không tự ghi bảng của nhau. Chỉ xác nhận thành công sau khi phần
trạng thái có thẩm quyền cần thiết đã commit; chống lặp và ràng buộc nghiệp vụ vẫn được áp dụng.

Thu/hoàn qua cổng và gửi email không nằm trong transaction PostgreSQL. Core lưu ý định cần thực
hiện, gọi bên ngoài rồi ghi kết quả đã xác minh bằng transaction tiếp theo. Không giữ transaction,
khóa database hoặc connection suốt thời gian chờ khách, nhà cung cấp hay consumer.
“Đã duyệt hủy” khác “tiền đã hoàn”; timeout bên ngoài không tự đảo ngược một quyền đã xử lý hợp lệ.

**Lý do:** tập trung các điều kiện phải bảo toàn trong Core, đồng thời tránh khóa kéo dài qua mạng.
Một transaction bao phủ cả lời gọi ngoài không tạo ACID xuyên provider và dễ giữ tài nguyên lâu;
tách rời cả các cập nhật quyền liên quan lại tạo trạng thái nửa chừng không đáp ứng quy tắc đã chốt.

**Giới hạn quyết định:** chưa chọn isolation level, khóa/constraint, thứ tự khóa hoặc cơ chế điều phối
transaction giữa interface các module. Hủy hàng loạt theo mô hình cấp suất/từng đơn được chốt bên dưới,
không suy tất cả đơn trong suất luôn nằm trong một transaction lớn. Các ngoại lệ/giá trị sản phẩm tiếp tục lấy từ nguồn
nghiệp vụ được duyệt, không tự thêm quyền hoàn tiền hoặc sửa điểm từ cơ chế transaction.

## Quyết định đã duyệt: consumer chống lặp và phục hồi có kiểm soát

**Nguồn duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý” ngay sau đề xuất xử lý sự kiện
lặp, thứ tự nghiệp vụ, thử lại có giới hạn, cách ly sự kiện lỗi và giới hạn tác dụng phụ khi replay.

1. Sự kiện có ID ổn định qua các lần giao lại. Mỗi consumer lưu dấu đã xử lý và thay đổi dữ liệu
   trong cùng transaction PostgreSQL của mình; nguồn sự kiện/consumer phải được phân biệt phù hợp.
2. Giữ thứ tự nghiệp vụ cần thiết, chẳng hạn theo đơn; không giả định Kafka có thứ tự toàn hệ thống.
   Phân vùng theo key không thay bảo vệ thứ tự khi consumer xử lý song song, retry hoặc phục hồi.
3. Không bỏ một khoản thu/hoàn chưa xử lý chỉ vì phiên bản thực thể cũ. Bản cập nhật trạng thái
   tuyệt đối và sự kiện ghi nhận một khoản cộng/trừ cần hợp đồng áp dụng khác nhau.
4. Thử lại có giới hạn. Sự kiện vẫn lỗi được cách ly bền vững, cảnh báo và giữ thông tin điều tra;
   phát lại phải có phạm vi/quyền kiểm soát, không bỏ lỗi âm thầm.
5. Replay để xây báo cáo không tự gửi lại email hoặc thực hiện hoàn tiền. Mỗi tác dụng phụ ngoài
   database có quy trình, mã thao tác và bảo vệ/đối soát riêng.

**Lý do:** consumer có thể commit PostgreSQL rồi dừng trước khi xác nhận vị trí đọc Kafka.
Nhận lại phải thấy dấu đã xử lý và không cập nhật nghiệp vụ lần nữa. Kafka không tự bao phủ các
tác dụng phụ PostgreSQL, email hoặc cổng thanh toán. Inbox bảo vệ transaction trong database,
không xóa khoảng lỗi giữa database và provider ngoài hệ thống.

**Giới hạn quyết định:** chưa chọn key/phân vùng, schema inbox, version/sequence, giới hạn thử lại,
backoff, retention, khu vực cách ly hoặc quy trình vận hành phát lại. Cách ly bền không cho phép
bỏ qua lỗ hổng thứ tự nghiệp vụ của các sự kiện tiếp theo. Phải đặc tả riêng tiến độ consumer và
target mô hình đọc khi tái dựng; không tự xóa dấu chống lặp chung để replay có tác dụng phụ.
Các căn cứ nguồn nằm trong [nghiên cứu consumer](../../99-notes/service-boundary-research.md#consumer-reliability).

## Quyết định đã duyệt: kiểm quyền theo rủi ro, không gọi Identity mỗi lượt soát

**Nguồn duyệt:** ngày 2026-11-17, chủ sản phẩm phản biện nguy cơ tê liệt vận hành nếu mọi lệnh
nhạy cảm đều phải gọi Identity. Sau đề xuất điều chỉnh, chủ sản phẩm trả lời “tôi đồng ý với đề xuất
này của bạn”. Phương án gọi Identity ở mọi lệnh nhạy cảm trước đó chưa được duyệt, không là yêu cầu
thiết kế. Tra cứu công khai và webhook thanh toán độc lập Identity đã được xác nhận trong cùng vòng.

| Nhóm thao tác | Nguyên tắc đã chọn |
| --- | --- |
| Soát vé, giao combo và vận hành thường xuyên | Core xác minh JWT cục bộ bằng khóa công khai đã lưu, kiểm phạm vi quyền và trạng thái nghiệp vụ trong database Core; không gọi Identity mỗi lượt. |
| Cấp quyền, thay chính sách bảo mật, điều chỉnh tài chính đặc biệt | Yêu cầu quyền hiện hành hoặc xác thực tăng cường; Identity lỗi thì tạm chặn riêng nhóm này. |
| Tra cứu công khai | Không bắt buộc gọi Identity. |
| Webhook thanh toán/đối soát | Dùng bằng chứng và xác thực dịch vụ riêng; không phụ thuộc phiên khách hoặc yêu cầu gọi Identity cho mỗi kết quả. |

Identity vẫn là chủ quyền cấp/thu hồi. Core chỉ lưu bản sao phục vụ kiểm quyền hoặc dấu thu hồi
theo hợp đồng; không ghi sang database Identity. Khi nhận quyết định thu hồi hợp lệ thì từ chối,
kể cả JWT còn hạn. Sự kiện cập nhật quyền/thu hồi cần được xác thực, chống lặp và bảo vệ thứ tự.

Khi mất kênh cập nhật, quyền cũ chỉ được chấp nhận trong cửa sổ đã chốt và không kéo dài quá hạn
token. Không tự gia hạn token, bỏ xác minh chữ ký, chấp nhận khóa/issuer/audience không tin cậy hoặc
bỏ kiểm quyền tài nguyên để tiếp tục phục vụ. Khóa công khai đã có thể dùng cục bộ theo chính sách;
không biết khóa cần để xác minh khi Identity không đáp ứng thì không đủ căn cứ chấp nhận token đó.

**Soát vé vẫn cần Core online** để kiểm quyền vé, trạng thái đã sử dụng và transaction chống soát lặp.
Việc loại cuộc gọi Identity khỏi từng lượt không cho phép thiết bị tự soát vé ngoại tuyến hoặc coi
chữ ký QR là bằng chứng vé vẫn còn hiệu lực hiện tại. Gửi webhook không đồng nghĩa đã xác nhận tiền:
Core vẫn phải xác minh nguồn, số tiền, giao dịch và quyền ghế theo chính sách.

**Lý do:** tránh biến một sự cố/độ trễ Identity thành điểm nghẽn cho mọi lượt soát trong khi Core
vẫn khỏe. Đánh đổi là không thể vừa tiếp tục dựa trên dữ liệu cục bộ khi mất liên lạc, vừa bảo đảm
biết ngay mọi quyết định thu hồi. TTL/cửa sổ quyền cũ phải được lựa chọn theo mức rủi ro; sự kiện
thu hồi giúp giảm độ trễ khi đường truyền hoạt động, không tạo bảo đảm thu hồi tức thì lúc gián đoạn.

**Giới hạn quyết định:** thời hạn bằng chứng vận hành và chu kỳ làm mới được chốt bên dưới, không
tự áp dụng cho token khách/Agent hoặc mọi phiên. Chưa chốt chi tiết
readiness của thiết bị/phiên, tín hiệu độ mới bản sao quyền hoặc xử lý lệnh đang chạy
đồng thời với thu hồi. JWT có thời hạn T không bảo đảm hoạt động thêm T từ lúc Identity lỗi: token
có thể gần hết hạn trước khi mất kết nối. Chưa phân loại đầy đủ mọi endpoint riêng tư/nhạy cảm.
Không tự chọn OAuth Provider/introspection từ tài liệu tham khảo hoặc hứa hoạt động vô hạn khi Identity lỗi.

Nguồn sơ cấp và phần suy luận thiết kế nằm tại
[nghiên cứu kiểm quyền](../../99-notes/service-boundary-research.md#kiểm-quyền-và-khả-năng-vận-hành-khi-identity-lỗi).

## Yêu cầu đã duyệt: tiếp tục soát vé ít nhất 60 phút khi Identity gián đoạn

**Nguồn duyệt:** ngày 2026-11-17, sau khi được giải thích đây là thời gian tiếp tục vận hành soát vé
khi Identity mất liên lạc, chủ sản phẩm yêu cầu “tôi muốn nâng lên thành 60 phút”. Mốc 30 phút trước
đó chỉ là đề xuất để thảo luận, chưa từng được chọn làm yêu cầu.

Mục tiêu thiết kế là nhân viên đã đăng nhập, được cấp quyền và đang sẵn sàng làm việc bình thường
vẫn thực hiện được các lượt soát hợp lệ trong **ít nhất 60 phút kể từ khi Identity gián đoạn**,
khi Core, PostgreSQL và kết nối thiết bị → Core vẫn đáp ứng. Lượt soát vẫn phải kiểm quyền rạp,
trạng thái vé và chống dùng lặp. Nếu Core đã nhận căn cứ thu hồi hợp lệ thì không tiếp tục cho người
đó thao tác chỉ để đạt chỉ tiêu 60 phút.

Đây là mục tiêu chịu sự cố Identity, không phải TTL JWT, thời hạn phiên, thời gian giữ ghế hoặc
đồng hồ buộc rạp dừng đúng phút 60. Không mở rộng mục tiêu này sang đăng nhập mới trong sự cố,
soát ngoại tuyến, các thao tác quản trị rủi ro cao hoặc mọi sự cố Core/database.

Thiết kế cấp/làm mới token và chuẩn bị khóa/bằng chứng quyền phải bảo đảm đủ thời hạn **còn lại**
tại thời điểm sự cố cho phiên ở trạng thái sẵn sàng. Token hạn 60 phút nhưng đã dùng gần hết không
đáp ứng mục tiêu. Phải đặc tả điều kiện sẵn sàng và biên thời gian, không tự gia hạn/nhận token hết hạn.

Thông số 90/15 phút và trần quyền cũ được chốt ở phần tiếp theo; cách đo/kiểm chứng độ mới và điều kiện
sẵn sàng vẫn cần đặc tả. Mục tiêu 60 phút tiếp tục soát không có nghĩa TTL JWT bằng 60 phút.

**Bằng chứng cần có trước khi khẳng định đạt:** thử gián đoạn Identity/kênh cập nhật ở thời điểm
bất lợi trong chu kỳ làm mới của một phiên sẵn sàng; soát hợp lệ qua toàn bộ 60 phút trong khi Core
vẫn chặn vé sai/rạp sai/soát trùng. Kiểm tra riêng thu hồi đã nhận, token hết hạn/không xác minh được,
và thao tác rủi ro cao. Chưa có kiểm thử hoặc runtime chứng minh yêu cầu này.

## Thông số đã duyệt: bằng chứng quyền vận hành 90 phút, làm mới mỗi 15 phút

**Nguồn duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý” ngay sau đề xuất hiệu lực
90 phút, làm mới chậm nhất mỗi 15 phút, áp dụng riêng cho quyền soát vé/giao combo và chấp nhận
đánh đổi thu hồi tương ứng. Đây là thông số thiết kế, chưa phải cấu hình đã cài hoặc kiểm chứng.

| Mốc | Ý nghĩa đã chọn |
| --- | --- |
| **90 phút** | Hiệu lực bằng chứng quyền đã ký cho nhóm soát vé/giao combo, tính từ lúc cấp. |
| **Không quá 15 phút** | Khoảng giữa các lần làm mới thành công khi Identity hoạt động, đối với phiên đang vận hành ở trạng thái sẵn sàng. |
| **Ít nhất 75 phút còn lại** | Kết quả tính 90 − 15 tại đầu sự cố cho phiên thỏa điều kiện trên; có khoảng dự phòng 15 phút so với mục tiêu soát thêm 60 phút. |
| **Tối đa 90 phút quyền cũ** | Khi kênh thu hồi cũng mất liên lạc, bằng chứng cũ có thể còn được chấp nhận đến hết hạn; không đặt lại mốc này khi đọc cache hoặc khi sự cố bắt đầu. |

Việc cấp/làm mới phải dựa trên quyền hiện hành từ Identity, không tự gia hạn từ token cũ hoặc từ
bản sao quyền chưa được xác minh lại. Không thay quyền bằng “đã đăng nhập” đơn thuần. Bằng chứng
phải giới hạn người dùng, hành động và phạm vi rạp phù hợp; không mở rộng hạn 90 phút thành quyền
quản trị, điều chỉnh tài chính đặc biệt, token khách hoặc service token của Agent.

Phiên sẵn sàng ở đầu sự cố cần có bằng chứng còn đủ thời gian, đã có khóa tin cậy để Core xác minh
cục bộ và dữ liệu kiểm quyền/thu hồi cần thiết. Trong sự cố, mốc 15 phút không trở thành yêu cầu phải
gọi Identity rồi chặn soát sau phút 15; tiếp tục dùng bằng chứng còn hợp lệ trong giới hạn đã chọn.
Thu hồi hợp lệ đã nhận, sai phạm vi rạp/hành động hoặc bằng chứng hết hạn vẫn phải bị từ chối.

Ví dụ thời gian: bằng chứng được cấp 18:45, hết hạn 20:15; Identity gián đoạn 19:00 thì còn 75 phút.
Mục tiêu tiếp tục soát 60 phút kéo đến ít nhất 20:00, không tự dừng đúng 20:00 nếu bằng chứng và
các điều kiện nghiệp vụ vẫn hợp lệ. Ví dụ không thay quy tắc Core online hoặc quyền vé hiện hành.

**Giới hạn/kiểm chứng:** phép tính 75 phút giả định phiên thỏa trạng thái sẵn sàng; chưa chứng minh
client thực sự làm mới đúng hạn. Phải thiết kế theo dõi làm mới, chuẩn bị/luân chuyển khóa, khôi phục
bản sao quyền sau restart, kiểm tra issuer/audience/hạn dùng, lệch đồng hồ và độ trễ trong biên dự phòng.
Không dùng biên dự phòng để nới hạn bảo mật không kiểm soát. Thời hạn phiên đăng nhập gốc, claim
cụ thể và giao thức cấp bằng chứng chưa được chọn; không mặc định Better Auth cung cấp sẵn toàn bộ
chính sách theo nhóm thao tác. Các trường hợp chưa sẵn sàng/đăng nhập mới không được coi là đã đạt mục tiêu.

## Quyết định đã duyệt: Agent đề xuất, ứng dụng/BFF thực thi lệnh của khách

**Nguồn duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý với bạn” ngay sau đề xuất
Agent tạo đề xuất, khách xác nhận trong chat, ứng dụng/BFF gửi lệnh tới Core bằng quyền khách và
nhận kết quả có thẩm quyền. Không cấp cho Agent credential có quyền giao dịch rộng của khách.

1. Agent hiểu ý định và tạo đề xuất có cấu trúc: thao tác, suất, ghế hoặc phần đơn tương ứng.
2. Khách xem và xác nhận trong chat; sự hiện diện của đề xuất chưa phải chấp thuận hoặc kết quả giao dịch.
3. Ứng dụng/BFF gửi nội dung đã xác nhận và mã thao tác tới Core bằng quyền của khách.
4. Core tự kiểm quyền, điều kiện và thực thi; kết quả có thẩm quyền được hiển thị trong chat và
   cung cấp để Agent cập nhật tiến trình. Không tin client tự khai giao dịch đã thành công.

Agent vẫn điều phối hội thoại/chờ/kết quả và truy vấn theo phạm vi được cấp. Lệnh ghi không xuất
phát trực tiếp từ tiến trình Agent bằng quyền khách. BFF là lớp thực thi tin cậy, không có quyền tự
xác nhận giao dịch hoặc tự nâng quyền. Token/bí mật không vào prompt, checkpoint hay log mô hình.
Các luồng đọc dữ liệu riêng vẫn phải xác thực/phân quyền, không lấy `userId` từ lời mô hình làm danh tính.

Đặt trọn trong chat là hành trình người dùng: xác nhận và kết quả nằm trong chat, không yêu cầu
mọi request phải do Agent backend phát. Phạm vi chức năng AI theo mô hình sản phẩm và các bổ sung
đã duyệt vẫn giữ nguyên; không mở soát vé, phê duyệt hủy/hoàn, đổi điểm hoặc quản trị chỉ vì có executor.
Khách trả tiền có thể cần ứng dụng cổng thanh toán như luồng đã chốt.

**Lý do và phương án khác:** Agent chuyển tiếp token khách có thể thực hiện được nhưng mở rộng nơi
giữ credential. Core cấp ủy quyền hẹp theo từng thao tác cho Agent cũng khả thi, song thêm vòng đời
cấp/thu hồi/chống replay. Chưa có nhu cầu Agent tự thực thi tách khỏi ứng dụng để chọn hai phương án đó;
chọn tận dụng đường lệnh của khách với executor được kiểm soát. Không bổ sung OAuth Provider/token exchange.

**Giới hạn quyết định:** nguyên tắc gắn xác nhận được chốt bên dưới; thời hạn đề xuất, schema và
cách lưu bản đề xuất còn cần đặc tả. Chưa chọn endpoint/đường mạng cho từng Web/Mobile, cơ chế xác thực kết
quả tới Agent hoặc quyền đọc riêng tư của Agent. Tham khảo so sánh tại
[nghiên cứu Agent](../../99-notes/service-boundary-research.md#agent-thực-thi-lệnh-ghi).

## Quyết định đã duyệt: xác nhận gắn với phiên bản đề xuất cụ thể

**Nguồn duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý” ngay sau đề xuất mỗi xác nhận
gắn với đúng phiên bản đề xuất đã được Core kiểm tra, gồm người thực hiện, thao tác và nội dung tác động.

- Đề xuất thể hiện người thực hiện, thao tác, suất/ghế, giá hoặc phần đơn bị tác động tương ứng;
  nội dung nghiệp vụ cần kiểm chứng được Core kiểm tra, không lấy giá/ghế do Agent tự tạo làm căn cứ.
- Chat hiển thị đúng nội dung cần xác nhận. Ứng dụng/BFF gửi mã/phiên bản đề xuất tới Core dưới
  danh tính đã xác thực của khách; Core kiểm quyền sở hữu đề xuất và điều kiện tại lúc thực hiện.
- Thay đổi ghế, giá hoặc nội dung quan trọng thì hiển thị lại và yêu cầu xác nhận mới; không dùng
  câu đồng ý cũ để áp dụng tham số mới. Các lời nhắc hoặc trạng thái hội thoại không thay xác nhận đó.
- Core có thể từ chối vì điều kiện đã đổi dù đề xuất còn nguyên: bản đề xuất không khóa tồn kho
  hoặc tự bảo đảm ghế sẽ còn trống. Không tự chuyển khách sang ghế hoặc mức giá khác.
- Mất phản hồi thì tra cứu mã thao tác cũ. Xác nhận lại không phải cách phục hồi mặc định cho một
  thao tác có thể đã commit, không tạo giao dịch mới cho cùng ý định chỉ vì chưa thấy kết quả.

Ví dụ khách đồng ý F5–F6/tổng 200.000đ không cho phép đổi sang F7–F8 hoặc 220.000đ. Chuẩn bị đề
xuất giữ ghế chưa tạo hold; hold chỉ bắt đầu sau xác nhận và Core thực hiện thành công theo chính sách.
Đề xuất của bước sau không tự gia hạn hold trước đó hoặc khởi động lại TTL 300 giây.

**Lý do:** giữ sự đồng ý gắn với nội dung khách thực sự xem, tránh nhầm đề xuất cũ/mới hoặc lệnh
bị đổi giữa hội thoại và lúc thực thi. Kiểm tra lại ở Core vẫn bắt buộc; xác nhận không là quyền bỏ
qua ràng buộc cạnh tranh hoặc giá/điều kiện hiện hành.

**Giới hạn quyết định:** chưa chốt TTL đề xuất, kiểu ID, schema nội dung, cách lưu/kiểm tra phiên bản
hoặc hình thức thao tác xác nhận trên từng app. Không tự chọn cơ chế ký/hash hay thêm service mới.
Thời hạn hiển thị đề xuất không đồng nghĩa thời hạn hold, quyền mua hoặc thời gian thanh toán.

## Quyết định đã duyệt: hủy suất có hiệu lực ngay, xử lý từng đơn phía sau

**Nguồn duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý” ngay sau đề xuất chặn hiệu lực
ở cấp suất ngay khi quyết định hủy được lưu thành công, rồi xử lý từng đơn bằng tác vụ nền Core.

1. Core kiểm quyền và điều kiện, lưu quyết định hủy/trạng thái suất có hiệu lực trong transaction
   ngắn, kèm kết quả thao tác và ý định xử lý nền bền vững. Từ mốc commit này, việc kiểm điều kiện
   ở Core phải chặn bán/đổi ghế/soát vé/giao combo chưa giao của suất theo chính sách.
2. Tác vụ nền Core xử lý từng đơn/phần bị ảnh hưởng: ghi nhận hủy, nghĩa vụ hoàn và yêu cầu thông báo,
   với transaction ngắn và chống lặp. Tiến độ được lưu bền, lỗi/dừng giữa chừng có thể tiếp tục.
3. Kết quả chuyển tiền hoàn vẫn xác minh riêng theo quy trình thu/hoàn bên ngoài transaction đã chọn.
   Không chờ hoàn xong mọi đơn để quyết định hủy suất bắt đầu có hiệu lực.

Quyền sử dụng phải kiểm cả trạng thái suất có thẩm quyền, không chỉ cột trạng thái của từng vé/đơn
chưa kịp được worker cập nhật. Việc gửi thông báo có thể trễ nhưng không làm vé tiếp tục được vào
suất đã hủy. Lưu lịch sử soát/giao trước đó theo chính sách; không xóa chứng cứ khi chạy tác vụ nền.
Không trả ghế của suất đã hủy vào luồng bán chỉ vì một đơn đã xử lý xong.

**Lý do:** một transaction lớn bao phủ mọi đơn kéo dài khóa và làm phục hồi khó. Nếu chỉ cập nhật
từng đơn mà thiếu điều kiện chặn cấp suất thì trong lúc worker chạy vẫn có thể nhận thêm thao tác
không hợp lệ. Chọn chặn hiệu lực ở cấp suất, rồi hoàn thiện hồ sơ từng đơn có tiến độ kiểm soát.
Khách có thể thấy “suất đã hủy, hoàn tiền đang xử lý”; không báo đã hoàn chỉ từ quyết định hủy.

Giai đoạn mới đề nghị hủy vẫn khác hủy đã được duyệt: Q33/Q45–Q48 của mô hình nghiệp vụ điều chỉnh
hold/khởi tạo thanh toán và giao dịch đã bắt đầu hợp lệ. Không biến đề nghị hủy thành hủy có hiệu lực.

**Giới hạn quyết định:** chưa chọn enum, khóa/thứ tự khóa, cách đánh dấu tiến độ/phân trang công việc,
cơ chế bàn giao job hoặc xử lý tranh chấp với payment/soát/giao đang chạy. Cần bảo vệ điểm commit
để lệnh bắt đầu trước quyết định nhưng ghi sau đó không lọt kiểm tra trạng thái cũ. Cần đối chiếu
các khoản thu/webhook đến muộn với quy trình hủy để không bỏ sót hoặc hoàn trùng; không suy quét
danh sách đơn một lần là đã bao phủ mọi nhánh đang xử lý. Chưa kiểm chứng runtime.

## Quyết định đã duyệt: Catalog cung cấp snapshot qua HTTP khi lập suất

**Nguồn duyệt:** ngày 2026-11-17, sau báo cáo so sánh ba khoảng trống tích hợp, chủ sản phẩm trả lời
“tôi đồng ý với 3 đề xuất của bạn”. Chấp thuận áp dụng cho phương án HTTP snapshot của Catalog,
projection kết hợp HTTP của Community và Claim Check cho email bảo mật; không có URL duyệt riêng.

Core lấy snapshot phiên bản phim đã công bố qua HTTP trước transaction database, kiểm điều kiện
và lưu phiên bản/nội dung cần thiết cùng suất trong transaction cục bộ. Đặt và soát vé dùng dữ liệu
Core, không gọi Catalog từng lượt. Catalog lỗi thì tạm chưa lập/công bố suất mới cần snapshot chưa lấy được.

**Lý do/đánh đổi:** lập suất là đường cấu hình có thể phụ thuộc Catalog, còn giao dịch vé thường
xuyên cần độc lập với lời gọi đó. Chưa có yêu cầu lập suất khi Catalog lỗi để chọn bản sao sự kiện
hoặc hai đường đồng bộ. Có Kafka không tự tạo nhu cầu nhân bản toàn bộ Catalog vào Core.

Kiểm hợp lệ tại mốc Catalog trả lời không nguyên tử với Core commit. Nội dung bất biến không có
nghĩa phiên bản luôn được dùng; ngừng phiên bản/đính chính cần hợp đồng riêng. Không tự ghi đè snapshot
suất đã công bố hoặc hứa đã xử lý các tranh chấp đó. Schema/version ID/endpoint chưa chọn.
So sánh và nguồn: [nghiên cứu tích hợp](../../99-notes/service-integration-gaps-research.md).

## Quyết định đã duyệt: Community dùng projection căn cứ và HTTP khi chưa rõ

**Nguồn duyệt:** cùng câu “tôi đồng ý với 3 đề xuất của bạn” ngày 2026-11-17 sau báo cáo nghiên cứu.

Core phát kết luận đủ điều kiện có phiên bản theo tài khoản đặt–phim qua outbox/sự kiện, gồm cả
đính chính/thu hồi. Community lưu projection trong database riêng và ưu tiên căn cứ cục bộ còn đáp
ứng chính sách độ mới. Cache miss, thiếu thứ tự, backfill chưa xong hoặc quá cũ là chưa rõ, phải hỏi
Core qua HTTP; Core lỗi thì tạm chưa cho đăng, không tự coi chưa xem hoặc bỏ kiểm điều kiện.

**Lý do/đánh đổi:** có thể tiếp tục đăng từ căn cứ hợp lệ đã nhận khi Core gián đoạn; HTTP bổ sung
trường hợp chưa có căn cứ rõ ràng. Chấp thuận này gồm đánh đổi có cửa sổ trễ đính chính/thu hồi có
giới hạn, **chưa chốt độ dài**. Không thể dùng bản sao lúc mất liên lạc và bảo đảm biết mọi thay đổi
nguồn ngay lập tức. Nếu dữ liệu không đáp ứng chính sách độ mới thì không tự kéo dài để tiếp tục.

Event/HTTP cùng quy tắc phiên bản; cũ không ghi đè mới, thu hồi đã nhận phải áp dụng. Core tính kết
luận theo tài khoản–phim để đính chính một vé không xóa căn cứ hợp lệ khác. Cần backfill/coverage
và phục hồi không hở; độ mới không chỉ dựa vào Kafka lag hoặc giờ đọc cache. Không tự xóa review
đã đăng hoặc suy chính sách quyền review sau hoàn tiền. Nguồn tại bản nghiên cứu tích hợp.

## Quyết định đã duyệt: Claim Check cho email chứa mã bảo mật

**Nguồn duyệt:** cùng câu “tôi đồng ý với 3 đề xuất của bạn” ngày 2026-11-17 sau báo cáo nghiên cứu.

Identity/Core sở hữu phát hành/xác minh mã. Owner giữ nội dung gửi mã hóa ngắn hạn, dữ liệu xác minh
và ý định/outbox tham chiếu với bảo đảm lưu nguyên tử. Luồng sự kiện riêng chỉ báo nội dung đã chuẩn
bị và tham chiếu, không có OTP/email/reset URL/token. Notification nhận để xử lý công việc thuộc mình,
lấy nội dung qua HTTPS có xác thực dịch vụ từ nguồn tin cậy, không SQL chéo. Tham chiếu không là
token cấp quyền; người nhận/mục đích/ngữ cảnh, hạn/thu hồi được owner kiểm soát.

**Lý do/đánh đổi:** giữ bí mật khỏi broker và công cụ quan sát, tận dụng pipeline outbox đã chọn.
HTTPS trực tiếp ít bước nhưng vẫn cần ý định bền chống khoảng lỗi commit–send; payload mã hóa trên
topic riêng giảm phụ thuộc fetch nhưng tăng vòng đời khóa/replay. Chọn Claim Check và chấp nhận
owner/API lấy nội dung là phụ thuộc lúc gửi. Việc xác minh mã vẫn phụ thuộc chủ nghiệp vụ.

Payload/khóa có bảo vệ riêng và dọn theo vòng đời; hash xác minh không thể phục hồi nội dung gửi.
Notification/provider cần plaintext lúc gửi, không lưu plaintext vào DB/queue/log/trace/DLQ. Lấy
payload không tiêu thụ challenge. Retry có giới hạn, không tạo/gia hạn mã mới; kết quả provider chưa
rõ có thể sinh thư trùng. Không hứa đúng một lần hoặc thu hồi thư đã bàn giao.

Tích hợp Better Auth phải chứng minh đóng khoảng lỗi challenge–ý định gửi; callback không tự có
transaction chung với custom outbox. Chưa chọn TTL, endpoint, cấu hình crypto, provider hoặc cơ chế
khóa cụ thể. Đây là yêu cầu thiết kế, không bằng chứng tích hợp/runtime. Nguồn tại bản nghiên cứu tích hợp.
