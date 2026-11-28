# Danh tính, phân quyền và phiên đăng nhập

[← Tổng quan NFR](README.md)

## 9.14. NFR-SEC-01 - Kiểm soát danh tính, quyền và phạm vi dữ liệu

**Yêu cầu kế thừa đã có:** các bất biến trong [AGENTS](../../../AGENTS.md#critical-invariants), [mục 1/6](../domain-context.md#1-ranh-giới-thẩm-quyền)
và [mô hình actor](../../03-product/use-cases.md#actor) yêu cầu giữ quyền theo vai trò, chủ dữ liệu và rạp được giao;
không lộ bí mật dịch vụ trong client. Không tạo lại ma trận quyền hoặc coi ba enum hiện tại đã ánh xạ đủ actor.
Các chỉ số và cách nghiệm thu dưới đây là đề xuất cụ thể hóa yêu cầu, chưa phải kết quả kiểm chứng.

| Trường | Nội dung |
|---|---|
| Mục tiêu | Đăng nhập đúng danh tính không đồng nghĩa được đọc/sửa mọi dữ liệu; bảo vệ cùng ranh giới trên bốn app, API và công cụ AI. |
| Tình huống | Đổi ID để xem đơn/vé người khác, quản lý truy cập rạp ngoài phạm vi, nhân viên gọi chức năng không được cấp, gọi trực tiếp API hoặc yêu cầu AI thao tác vượt quyền. Kiểm cả tài khoản hợp lệ đúng quyền và yêu cầu thiếu/sai/hết hiệu lực xác thực theo hợp đồng sẽ đặc tả. |
| Chỉ số đề xuất | Số truy cập/thao tác ngoài quyền thành công, bản ghi hoặc trường dữ liệu lộ trái quyền, thay đổi trạng thái/tác dụng phụ trái quyền, bí mật dịch vụ xuất hiện trong client hoặc dữ liệu trả về. |
| Ngưỡng mục tiêu | Không có truy cập, lộ dữ liệu hoặc tác dụng phụ trái quyền trong bộ kịch bản nghiệm thu; tương ứng 0 vi phạm theo các bất biến đã có. Không diễn giải thành chứng minh không thể có lỗ hổng ngoài bộ kiểm. Các yêu cầu đúng quyền phải hoạt động, không đạt bằng cách từ chối mọi yêu cầu. |
| Yêu cầu MFA đã duyệt | Khi đăng nhập bằng vai trò quản trị toàn chuỗi/quản lý rạp trên kênh Web/Mobile được phép, phải hoàn tất thêm yếu tố xác minh độc lập. Đề xuất kiểm chứng: không cho thực hiện chức năng quyền cao khi chưa hoàn tất MFA; kiểm cả đường đăng nhập, khôi phục/đổi yếu tố và API. Không tự đổi vai trò hoặc cấp thêm quyền sau khi qua MFA. |
| Điều kiện đo đề xuất | Dữ liệu thử phân biệt chủ sở hữu/rạp/vai trò; đúng phiên bản và cơ chế xác thực dự kiến. Gọi qua UI, API và công cụ AI, kiểm trạng thái lưu và tác dụng phụ; không chỉ kiểm nút bị ẩn hoặc mã HTTP. Ghi phạm vi cơ chế thật/giả lập, không dùng header email do client tự khai làm bằng chứng danh tính đã xác thực. |
| Mức ưu tiên | Bắt buộc theo ranh giới bảo mật hiện có; không tự miễn cho demo công khai. |
| Cách nghiệm thu đề xuất | Lập ma trận ca đúng/sai quyền từ nguồn actor/BR, gồm đổi chủ dữ liệu, đổi rạp, đổi vai trò và đường gọi trực tiếp. Đối chiếu kết quả trả về, trạng thái trước/sau và tác dụng phụ; kiểm client build không chứa khóa bí mật dịch vụ. Chỉ kết luận cho phạm vi/phiên bản đã kiểm. |
| Giới hạn và phần chưa chốt | Logout/dữ liệu app, TOTP/mã dự phòng, MFA cho nhân viên, các thời hạn phiên, phạm vi thu hồi và mục tiêu truyền thu hồi khi khỏe đã duyệt tại mục [9.14.1](#9141-phạm-vi-đăng-xuất-và-vô-hiệu-phiên)–[9.14.16](#91416-bộ-nghiệm-thu-phiên-và-thu-hồi) theo từng nội dung. Hợp đồng session/token/bằng chứng quyền, cơ chế và hạn đồng bộ bù, thời điểm cảnh báo trước hết phiên, ma trận quyền triển khai và công cụ kiểm còn cần đặc tả. Không tự cấp thêm quyền từ tên app hoặc enum. Bộ kiểm này không thay rà soát bảo mật rộng hơn. |

**MFA đã duyệt, bắt buộc cho mốc demo:** ngày 2026-11-17, chủ sản phẩm trả lời
“tôi đồng ý với đề xuất của bạn” cho phương án A: yêu cầu thêm yếu tố xác minh độc lập
khi đăng nhập bằng tài khoản quản trị viên toàn chuỗi hoặc quản lý rạp, ở cả kênh Web/Mobile được phép.
Chưa bắt buộc thêm MFA cho khách hàng từ đề xuất này; phạm vi nhân viên soát/giao combo được duyệt tiếp tại mục [9.14.6](#9146-phạm-vi-mfa-cho-nhân-viên-hiện-trường).
Không yêu cầu nhập lại MFA sau mỗi lần quét vé. Cách đăng ký, khôi phục và thay yếu tố phải được thiết kế
để không trở thành đường bỏ qua bảo vệ; loại yếu tố đã duyệt tại mục [9.14.2](#9142-phương-thức-mfa-và-mã-dự-phòng), chưa chọn plugin/cấu hình.
Xác minh email khi đăng ký không tự chứng minh đăng nhập đã có MFA.

Cơ sở nghiên cứu ngày 2026-11-17:
[OWASP — Multifactor Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html)
khuyến nghị MFA cho tài khoản quản trị/quyền cao, chú ý các đường đăng nhập và khôi phục;
[OWASP — Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
thảo luận xác minh lại khi có sự kiện rủi ro/thao tác nhạy cảm. Phạm vi MFA là quyết định của dự án;
không phải tuyên bố đã tuân thủ toàn bộ OWASP hoặc đã tích hợp MFA.

### 9.14.1. Phạm vi đăng xuất và vô hiệu phiên

**Phương án A và hành vi phiên/dữ liệu: Đã duyệt.** Trong hội thoại NFR ngày 2026-11-17, chủ sản phẩm
trả lời “tôi đồng ý với khuyến nghị của bạn” cho đăng xuất phiên hiện tại: các tab dùng chung phiên
hết đăng nhập, phiên độc lập ở app/trình duyệt khác vẫn hoạt động, máy chủ vô hiệu phiên và ứng dụng
xóa/khóa dữ liệu riêng tư để không lộ đơn/vé/QR/chat của tài khoản trước.
Chi tiết phép đo/nghiệm thu bên dưới là đề xuất cụ thể hóa. Phân biệt phiên đăng nhập do Identity
quản lý với token/bằng chứng quyền đã cấp cho Core/Agent; không tự thay TTL hoặc chính sách quyền vận hành.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống | Người dùng đăng xuất một phiên Web/Mobile rồi mở lại màn hình, dùng lại định danh phiên đã sao chép, hoặc đăng nhập tài khoản khác. Cùng tài khoản có thể còn phiên độc lập ở app/trình duyệt khác. |
| Phương án A đã duyệt | Đăng xuất thông thường kết thúc phiên đăng nhập hiện tại, gồm các tab/định danh xoay vòng thuộc cùng phiên logic; không mặc định đăng xuất mọi phiên độc lập của tài khoản. Một thiết bị có thể có nhiều phiên trình duyệt/app, không đồng nhất phiên với thiết bị vật lý. |
| Chỉ số và ngưỡng đề xuất | Khi Identity/BFF đã xác nhận vô hiệu phiên, không yêu cầu mới nào dùng phiên đó được xác thực tại các điểm kiểm session này; số chấp nhận lại phiên đã thu hồi bằng 0 trong bộ kiểm. Phiên đã vô hiệu không được cấp token mới. Không chỉ xóa cookie/giao diện rồi coi server đã thu hồi. Chưa đặt ngưỡng truyền thu hồi tới các API dùng JWT/bằng chứng quyền riêng. |
| Dữ liệu phía ứng dụng | Đã duyệt xóa/khóa dữ liệu riêng tư của phiên/tài khoản trên app: đơn/vé/QR, chat riêng tư và trạng thái quyền. Chi tiết đề xuất: kiểm Back/refresh/mở lại/đổi tài khoản không hiện dữ liệu tài khoản trước. Không xóa dữ liệu nghiệp vụ Core, hủy hold/đơn hoặc đảo kết quả lệnh đã gửi vì đăng xuất. Không hứa xóa ảnh chụp/bản xuất do người dùng giữ ngoài app. |
| Điều kiện đo | Dữ liệu mẫu, ít nhất hai tài khoản và các phiên phân biệt; ghi build/cấu hình Identity/BFF, mốc server xác nhận và loại định danh dùng lại. Kiểm phiên còn sống đúng quyền trước logout; sau đó replay định danh cũ, thử cấp token mới, các tab cùng phiên, phiên độc lập và cache Web/Mobile. Không đưa session/token thật vào báo cáo. |
| Mức ưu tiên | Đề xuất bắt buộc cho nghiệm thu đăng xuất trước demo công khai. |
| Cách nghiệm thu | Phiên hiện tại bị vô hiệu ở server và không cấp thêm token; phiên độc lập vẫn hoạt động theo A. Không có dữ liệu tài khoản trước lộ qua app sau chuyển trạng thái đăng xuất/đổi tài khoản. Khi server chưa xác nhận hoặc mất mạng, phản hồi trung thực trạng thái xử lý, không tuyên bố thu hồi từ xa thành công chỉ vì đã khóa dữ liệu cục bộ. Kiểm dương tính để tránh đạt bằng cách chặn mọi phiên. |
| Ranh giới quyền đã cấp | Không suy xác nhận logout của Identity thành mọi JWT trên mọi service mất hiệu lực tức thì. Cần đặc tả riêng việc gắn session/token và truyền thu hồi; dịch vụ đã nhận thu hồi hợp lệ phải từ chối theo chính sách quyền tương ứng. Giữ ranh giới quyền soát/giao combo đã chốt trong nguồn kiến trúc: bằng chứng 90 phút, làm mới không quá 15 phút khi khỏe, mục tiêu tiếp tục soát 60 phút khi Identity gián đoạn với các điều kiện đã duyệt. Không áp các mốc này làm TTL phiên khách, quyền quản trị hoặc hạn mới của NFR. |
| Đánh đổi và phương án B | A đã chọn tránh làm gián đoạn các phiên độc lập chỉ vì logout ở một nơi. B đã cân nhắc nhưng không chọn cho logout thông thường: mỗi lần logout vô hiệu mọi phiên của tài khoản có thể ngắt phiên đang dùng ở nơi khác. Ngưỡng ba nhóm đã duyệt tại mục [9.14.8](#9148-nguyên-tắc-tự-hết-hạn-phiên-đăng-nhập); vô hiệu mọi phiên cũ sau đổi/đặt lại mật khẩu thành công đã duyệt tại mục [9.14.9](#9149-vô-hiệu-phiên-sau-đổiđặt-lại-mật-khẩu). Khóa/mở khóa bảo mật đã duyệt tại mục [9.14.10](#91410-vòng-đời-phiên-khi-khóamở-khóa-bảo-mật); quản lý/đăng xuất tất cả phiên riêng và cơ chế thu hồi token còn cần đặc tả; không tự thêm giao diện hoặc cấp quyền triển khai. |

Căn cứ bảo mật: [OWASP — Manual Session Expiration](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#manual-session-expiration)
yêu cầu vô hiệu phiên ít nhất phía server; không quy định phải đăng xuất tất cả phiên/thiết bị.
Nguồn kiến trúc đối chiếu tại main `2a007797ac9ce542d9747aad0f44f3e430eec581`:
`docs/06-decisions/0008-better-auth-with-direct-login.md`,
`docs/05-specs/004-service-decomposition/decisions.md` (quyền vận hành 90 phút/làm mới 15 phút),
`docs/06-decisions/0017-tanstack-query-and-zustand-for-frontend-state.md` và
`docs/06-decisions/0023-encrypted-mmkv-for-offline-mobile-tickets.md` (dữ liệu phía ứng dụng).
Đây là nguồn quyết định, chưa phải bằng chứng logout/cache/thu hồi đã được triển khai hoặc kiểm chứng.

### 9.14.2. Phương thức MFA và mã dự phòng

**Phương án A: Đã duyệt ngày 2026-11-18.** Chủ sản phẩm trả lời “tôi đồng ý với khuyến nghị của bạn”
cho TOTP từ ứng dụng xác thực kèm mã dự phòng dùng một lần, áp dụng cho quản trị viên toàn chuỗi và
quản lý rạp trên Web/Mobile được phép. Mã dự phòng chỉ thay TOTP sau khi mật khẩu hợp lệ,
không thay mật khẩu, đổi email hoặc mở khôi phục tài khoản khi mất email.
Giữ phạm vi MFA đã duyệt; không bắt thêm MFA cho khách hàng hoặc từng lần soát vé.
Chi tiết phép đo/nghiệm thu, đăng ký/thay yếu tố và cấu hình bên dưới là đề xuất cụ thể hóa.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống | Tài khoản quyền cao đăng nhập hoặc đăng ký yếu tố; người dùng không còn truy cập ứng dụng tạo mã và cần dùng bằng chứng dự phòng đã lưu. |
| Phương án A đã duyệt | Dùng TOTP: mã có thời hạn do ứng dụng xác thực tạo, kết hợp mật khẩu. Cấp mã dự phòng dùng một lần để thay bước TOTP khi người dùng đã xác minh mật khẩu; không dùng mã này thay mật khẩu, đổi email hoặc khôi phục tài khoản khi mất email. |
| Chỉ số và ngưỡng đề xuất | Trong bộ kiểm không có quyền cao được thực hiện khi chưa hoàn tất MFA, không chấp nhận mã sai/tài khoản sai/hết hiệu lực. Một mã dự phòng chỉ được chấp nhận một lần, kể cả gửi lại hoặc dùng đồng thời. Mật khẩu đúng nhưng thiếu TOTP/mã dự phòng hợp lệ chưa đủ cấp quyền cao. Không coi mở màn hình chính hoặc có cookie là bằng chứng MFA hoàn tất. |
| Đăng ký và khôi phục | Xác minh được một mã TOTP trước khi coi đăng ký yếu tố hoàn tất. Mã dự phòng phải được hướng dẫn lưu an toàn; không lộ trong log/trace/model/client bundle. Tạo lại mã phải vô hiệu bộ mã cũ theo quy tắc xác minh đã duyệt tại mục [9.14.4](#9144-đổi-yếu-tố-mfa-và-tạo-lại-mã-dự-phòng). Không tự bỏ MFA sau reset mật khẩu hoặc khi gửi email lỗi; mất cả TOTP và mã dự phòng chưa được hỗ trợ khôi phục ở mốc đầu theo quyết định tại mục [9.14.3](#9143-phạm-vi-khi-mất-cả-totp-và-mã-dự-phòng). |
| Điều kiện đo | Tài khoản mẫu phân biệt vai trò và trạng thái chưa đăng ký/đang challenge/đã hoàn tất; build Web/Mobile và Identity/API được định danh. Kiểm mã đúng/sai/hết hiệu lực, thiếu yếu tố, đổi tài khoản, gọi API trực tiếp, đăng ký dở và dùng lại/đồng thời mã dự phòng. Công bố đồng hồ/cửa sổ xác minh theo cấu hình đã chốt sau này; không coi emulator là bằng chứng đầy đủ trên thiết bị thật. |
| Mức ưu tiên | Đề xuất phải chốt và nghiệm thu để đáp ứng MFA bắt buộc của hai vai trò trước demo tương ứng. |
| Cách nghiệm thu | Luồng đúng cho phép quyền phù hợp sau MFA; luồng thiếu/sai chưa có quyền cao và không tạo tác dụng phụ. Mã dự phòng dùng xong không dùng lại, không mở khôi phục mật khẩu/email. Kiểm UI và API trên các nền tảng trong phạm vi; kiểm thay/tắt yếu tố không trở thành đường bỏ qua. Giữ kết quả và trạng thái, che mọi mã/secret thật trong bằng chứng. |
| Căn cứ và phương án B | Better Auth có tài liệu TOTP, OTP và backup codes; chưa chứng minh tích hợp của dự án. A đã chọn tạo mã tại ứng dụng xác thực, không cần gửi email/SMS cho mỗi challenge, nhưng người dùng phải thiết lập và giữ yếu tố/mã dự phòng. B dùng mã qua email đã cân nhắc nhưng không chọn: dễ tận dụng hộp thư nhưng phụ thuộc chuyển phát và bảo mật hộp thư. TOTP cũng có thể bị lừa lấy mã, không coi là chống phishing. |
| Phần chưa chốt | Số lượng/độ dài mã dự phòng, cửa sổ TOTP/challenge, giới hạn thử sai, lưu trữ bí mật, session/token sau MFA và nền tảng/cấu hình plugin. Quy tắc thay yếu tố/tạo lại mã đã duyệt tại mục [9.14.4](#9144-đổi-yếu-tố-mfa-và-tạo-lại-mã-dự-phòng), chi tiết thực thi còn mở; mất mọi bằng chứng đã có quyết định phạm vi tại mục [9.14.3](#9143-phạm-vi-khi-mất-cả-totp-và-mã-dự-phòng). Không tự bật trusted-device để bỏ MFA cho phiên mới hoặc lấy giá trị mặc định thư viện làm ngưỡng được duyệt. |

Căn cứ đã tra qua Context7 và tài liệu chính thức ngày 2026-11-17:
[Better Auth — Two-Factor Authentication](https://better-auth.com/docs/plugins/2fa),
[Better Auth — Expo integration](https://better-auth.com/docs/integrations/expo),
[OWASP — MFA: Email](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html#email)
và [Resetting MFA](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html#resetting-mfa).
Các nguồn xác nhận khả năng và đánh đổi, không cấp quyền cài plugin hoặc chứng minh luồng Web/Mobile đã chạy.
Ranh giới mã dự phòng của đề xuất này giữ Q163 trong `docs/03-product/use-cases.md` tại main
`2a007797ac9ce542d9747aad0f44f3e430eec581`: chưa mở mã dự phòng lấy lại tài khoản khi mất email.

### 9.14.3. Phạm vi khi mất cả TOTP và mã dự phòng

**Phương án A: Đã duyệt ngày 2026-11-18.** Chủ sản phẩm trả lời “tôi đồng ý với khuyến nghị của bạn”
cho mốc portfolio đầu chưa hỗ trợ khôi phục khi mất cả TOTP và mã dự phòng: mật khẩu/email không đủ
bỏ MFA để đăng nhập mới vào khu vực quyền cao, reset mật khẩu không tự tắt MFA và không hứa quy trình
reset thủ công chưa thiết kế. Chủ sản phẩm chấp nhận rủi ro không đăng nhập quyền cao trở lại khi mất cả hai.
Không bổ sung actor hoặc quyền reset MFA cho nhân viên. Chi tiết kiểm chứng bên dưới là đề xuất cụ thể hóa.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống | Quản trị viên hoặc quản lý rạp vẫn biết mật khẩu, có thể còn email/phiên đăng nhập, nhưng không có TOTP hoặc bất kỳ mã dự phòng hợp lệ nào. |
| Phương án A đã duyệt | Mốc portfolio đầu chưa hỗ trợ khôi phục MFA khi mất cả hai. Không cấp quyền cao cho lần đăng nhập mới chỉ nhờ mật khẩu/email, không tắt/reset MFA tự động từ link quên mật khẩu, cookie còn sống hoặc đề nghị hỗ trợ. Thông báo trung thực rằng chưa có đường khôi phục phù hợp, không hứa sẽ reset thủ công. |
| Chỉ số và ngưỡng đề xuất | Trong bộ kiểm, số lần vượt MFA/cấp quyền cao mới khi không có yếu tố hợp lệ bằng 0; không có reset MFA từ thao tác khôi phục mật khẩu hoặc tự đổi email. Ca dùng TOTP hoặc mã dự phòng hợp lệ vẫn qua được MFA và quyền tương ứng, không đạt bằng cách khóa mọi tài khoản. |
| Điều kiện đo | Tài khoản/định danh mẫu của hai vai trò, các trạng thái có/mất TOTP và còn/hết mã dự phòng; kiểm giao diện và API, mật khẩu đúng, email hợp lệ, phiên đang có và đường quên mật khẩu. Ghi phiên bản/cấu hình và trạng thái MFA/quyền trước-sau; không gửi email hoặc sử dụng tài khoản thật từ việc duyệt yêu cầu này. |
| Mức ưu tiên | Đề xuất bắt buộc xác định hành vi này trước nghiệm thu MFA của demo, không bắt buộc phát triển thêm dịch vụ hỗ trợ khôi phục. |
| Cách nghiệm thu | Các đường không có yếu tố hợp lệ không thể hoàn tất challenge/cấp quyền cao mới hoặc xóa yếu tố chỉ nhờ mật khẩu/email/phiên có sẵn. Phản hồi không giả thành công hoặc gợi ý một quy trình chưa tồn tại; luồng có yếu tố hợp lệ vẫn hoạt động. Không tự đổi quyền tài khoản, hủy nghiệp vụ Core hoặc xem seed/reset dữ liệu mẫu là tính năng khôi phục tài khoản. |
| Đánh đổi và phương án B | A đã chọn giữ phạm vi demo và tránh một đường khôi phục yếu hơn, nhưng người mất cả hai có thể không lấy lại được quyền cao khi chưa có quy trình mới. B đã cân nhắc nhưng không chọn cho mốc đầu: bổ sung khôi phục MFA có người có thẩm quyền phê duyệt, phải thiết kế tiêu chí xác minh, người có quyền reset, bằng chứng/kiểm toán và hành vi phiên/token trước khi duyệt, không coi gửi email là đủ. |
| Phần chưa chốt | Quy tắc thay yếu tố khi còn TOTP/mã dự phòng và tạo lại bộ mã đã duyệt tại mục [9.14.4](#9144-đổi-yếu-tố-mfa-và-tạo-lại-mã-dự-phòng), chi tiết thực thi còn mở; chống thử sai, thời hạn phiên/challenge và thu hồi token vẫn cần đặc tả. Không suy tình huống mất yếu tố thành mọi phiên/token cũ tự hết hiệu lực; chúng theo chính sách tương ứng. |

Cơ sở nghiên cứu: [OWASP — Resetting MFA](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html#resetting-mfa)
và [Changing MFA Factors](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html#changing-mfa-factors)
lưu ý rủi ro đường khôi phục và yêu cầu xác minh lại khi thay yếu tố. OWASP không bắt buộc chọn A;
việc chưa cung cấp recovery cho tình huống mất cả hai là quyết định phạm vi mốc portfolio đã được chủ sản phẩm duyệt.

### 9.14.4. Đổi yếu tố MFA và tạo lại mã dự phòng

**Bộ quy tắc: Đã duyệt ngày 2026-11-18.** Chủ sản phẩm trả lời “tôi đồng ý với khuyến nghị của bạn”
cho xác minh lại mật khẩu và TOTP/mã dự phòng trước khi đổi; xác minh TOTP mới trước khi coi sẵn sàng;
bộ mã dự phòng mới có hiệu lực thì bộ cũ hết hiệu lực; không tắt yêu cầu MFA để đăng nhập mới chỉ bằng
mật khẩu khi vẫn giữ vai trò bắt buộc MFA. Áp dụng khi còn TOTP hoặc mã dự phòng hợp lệ,
không mở đường hỗ trợ cho tình huống mất cả hai tại mục [9.14.3](#9143-phạm-vi-khi-mất-cả-totp-và-mã-dự-phòng).
Chi tiết trạng thái, phép đo/nghiệm thu và cấu hình bên dưới là đề xuất cụ thể hóa.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống | Quản trị viên/quản lý rạp chuyển sang ứng dụng xác thực khác hoặc cần bộ mã dự phòng mới; người có mật khẩu hay phiên bị chiếm cố đổi yếu tố. |
| Chính sách đã duyệt | Trước khi đổi TOTP hoặc tạo lại mã dự phòng, phải xác minh lại mật khẩu và TOTP hiện tại hoặc một mã dự phòng hợp lệ. Chỉ có phiên đang đăng nhập không đủ thực hiện thay đổi. Không cho tắt yêu cầu MFA rồi đăng nhập mới chỉ bằng mật khẩu khi vẫn giữ vai trò phải có MFA. |
| Kích hoạt yếu tố/mã mới | Chỉ coi TOTP mới sẵn sàng sau khi xác minh một mã từ cấu hình mới. Khi bộ mã dự phòng mới được tạo thành công, bộ cũ hết hiệu lực; mã dùng làm bằng chứng vẫn chỉ dùng một lần. Trong các bước chuyển tiếp/đăng ký dở không có đường cấp quyền cao mới thiếu MFA. Không hứa thư viện thực hiện thay yếu tố nguyên tử sẵn; phải thiết kế trạng thái và xử lý lỗi đáp ứng hành vi này. |
| Chỉ số và ngưỡng | Đề xuất 0 thay đổi yếu tố/tạo bộ mã thành công nếu thiếu xác minh lại; 0 chấp nhận bộ mã cũ sau khi bộ mới có hiệu lực, 0 dùng lại mã đã tiêu thụ. Không cấp quyền cao mới từ trạng thái MFA chưa hoàn tất trong bộ kiểm. Ca đúng đủ bằng chứng vẫn đổi/tạo mã được. |
| Điều kiện đo | Tài khoản mẫu hai vai trò, mật khẩu/yếu tố đúng và sai, mã dự phòng còn/đã dùng; ghi trạng thái trước-sau và cấu hình/phiên bản. Kiểm UI/API trực tiếp, phiên có sẵn nhưng thiếu yếu tố, đăng ký TOTP mới chưa xác minh, lỗi/ngắt giữa các bước và gửi đồng thời. Không dùng secrets thật trong bằng chứng. |
| Mức ưu tiên | Đề xuất bắt buộc cho nghiệm thu các chức năng đổi yếu tố/tạo lại mã của demo. |
| Cách nghiệm thu | Đối chiếu bằng chứng xác minh và trạng thái Identity, không chỉ nút/thông báo. Đường thiếu/sai yếu tố không thay cấu hình; mã cũ/đã dùng bị từ chối theo mốc hiệu lực; đường đúng vẫn hoàn tất. Lỗi giữa chừng có trạng thái trung thực, không tự bỏ MFA hoặc phát sinh quyền cao mới không qua kiểm. |
| Còn cần đặc tả | Cửa sổ xác minh lại/challenge, giới hạn thử sai, giao thức trạng thái thay yếu tố, xử lý concurrency/lỗi, lưu trữ bí mật và ảnh hưởng tới session/token đã cấp. Không suy thay yếu tố thành đã thu hồi tức thì mọi token; hợp đồng thu hồi riêng phải đáp ứng các ranh giới bảo mật đã duyệt. |

Căn cứ: [OWASP — Changing MFA Factors](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html#changing-mfa-factors)
khuyến nghị xác minh lại bằng yếu tố đã đăng ký, không chỉ tin phiên hiện tại.
Khả năng TOTP/backup codes của Better Auth đã tra ở mục [9.14.2](#9142-phương-thức-mfa-và-mã-dự-phòng) không chứng minh luồng thay yếu tố của dự án đã hoạt động.

### 9.14.5. Bảo vệ đường truyền của demo công khai

**Phạm vi A đã duyệt ngày 2026-11-21:** chủ sản phẩm trả lời “tôi đồng ý” cho HTTPS trên bề mặt
công khai Web/API/SSE, TLS có kiểm chứng chỉ/tên server khi gọi dịch vụ ngoài, ưu tiên TLS 1.3/hỗ trợ 1.2
khi cần, cookie phiên Secure và ngoại lệ HTTP loopback cho dev/test cô lập với dữ liệu thử.
Các giao thức cũ không được chấp nhận; không tắt xác minh để sửa lỗi kết nối. Cụ thể hóa bảo vệ dữ liệu khi truyền, không chọn hosting,
proxy, chứng chỉ trả phí hoặc triển khai. Không lấy HTTPS làm bằng chứng đã xác thực/phân quyền đúng.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Người thử dùng mạng công cộng, Web/Mobile gửi thông tin đăng nhập/chat hoặc nhận đơn/vé; server gọi model/email/payment/telemetry. Cần ngăn nghe lén/sửa nội dung và kết nối nhầm server ở các đường qua mạng không tin cậy. |
| Phạm vi A đã duyệt | HTTPS trên toàn bộ bề mặt công khai Web/API/SSE của bốn app và backend; các lời gọi tới dịch vụ ngoài dùng kênh TLS có xác minh chứng chỉ/tên server. Ưu tiên TLS 1.3, có thể hỗ trợ 1.2 khi cần tương thích; không chấp nhận TLS 1.0/1.1 hoặc SSL cũ. Không tắt kiểm chứng chỉ để khắc phục lỗi kết nối. |
| HTTP và ngoại lệ cục bộ | Endpoint HTTP công khai chỉ từ chối hoặc chuyển tới HTTPS mà không xử lý nghiệp vụ; client không gửi credential/nội dung nhạy cảm qua HTTP rồi mới trông chờ redirect bảo vệ. Không trộn nội dung/kết nối HTTP không an toàn vào trang HTTPS. HTTP loopback cho dev/test cô lập với dữ liệu thử có thể dùng, phải ghi rõ không phải bằng chứng HTTPS công khai; không suy ngoại lệ loopback sang LAN/Internet. |
| Chỉ số/ngưỡng | Đề xuất 0 đường truyền thuộc phạm vi để lộ credential/nội dung nhạy cảm dạng rõ hoặc chấp nhận chứng chỉ sai/hết hạn/không tin cậy trong bộ kiểm; 0 endpoint nghiệp vụ công khai xử lý qua HTTP. Cookie mang phiên Web phải có Secure trong môi trường HTTPS. Quy tắc auth/session/CSRF/quyền/chữ ký giao dịch vẫn kiểm riêng. |
| Điều kiện đo | Đúng domain/build/topology/cấu hình phát hành dự kiến; ghi điểm kết thúc TLS, protocol/chứng chỉ, mạng và luồng Web/Mobile/API/SSE/outbound được kiểm. Dùng credential và dữ liệu thử; môi trường thử riêng để kiểm chứng chỉ lỗi/HTTP và proxy, không tắt xác minh ở môi trường thật. Không đưa bí mật vào báo cáo/bản chụp lưu lượng. |
| Mức ưu tiên | Đã duyệt là yêu cầu trước demo công khai có đăng nhập/giao dịch/chat; có dữ liệu thử không miễn bảo vệ credential hoặc nội dung người thử. Không yêu cầu mTLS, certificate pinning hay TLS cho mọi hop loopback từ quyết định này. |
| Cách nghiệm thu | Kiểm toàn bộ đường vào công khai và từng loại tích hợp ngoài, HTTP không thực thi lệnh; các client không fallback sang HTTP hoặc bỏ kiểm chứng chỉ khi lỗi. Kiểm cookie/session, mixed content và SSE kết nối lại; thử chứng chỉ sai tên/hết hạn/không tin cậy và xác nhận từ chối. Báo từng đường/nguồn bằng chứng, không chỉ ảnh ổ khóa trình duyệt. |
| Phần còn mở | Inventory endpoint/hop, nơi kết thúc TLS, trust store/cấu hình phiên bản-cipher, vòng đời chứng chỉ, HSTS/headers và truyền nội bộ theo ranh giới mạng cần thiết kế trước triển khai. Không yêu cầu đổi công nghệ đã chốt hoặc coi thư viện/cloud mặc định chắc chắn đạt. |

Căn cứ đối chiếu ngày 2026-11-21:
[OWASP Transport Layer Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Security_Cheat_Sheet.html)
khuyến nghị TLS cho mọi trang, giao thức mạnh, chứng chỉ đúng và cookie Secure.
Phạm vi/ngoại lệ A là lựa chọn dự án đã duyệt, chưa có phép kiểm đường truyền.

### 9.14.6. Phạm vi MFA cho nhân viên hiện trường

**Phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn “A — MFA khi nhân viên đăng nhập”.
Áp dụng cho ACT-SCANNER (nhân viên soát vé) và ACT-CONCESSION (nhân viên quầy bắp nước),
dùng TOTP từ ứng dụng xác thực; trong phiên hợp lệ không nhập lại mã cho từng lượt soát/giao.
Phạm vi MFA của quản trị viên toàn chuỗi và quản lý rạp giữ nguyên. Bộ quy tắc đăng ký/đổi/khôi phục
cho nhân viên được duyệt tiếp cùng ngày ở phần dưới; cách kiểm bên dưới còn là đề xuất cụ thể hóa.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Mật khẩu tài khoản nhân viên bị lộ có thể cho người khác dùng quyền soát vé hoặc xác nhận giao combo tại rạp được giao. Cần bảo vệ đăng nhập mà không chèn bước xác minh vào mỗi lần soát/giao. |
| Phương án A đã duyệt | Bắt buộc hoàn tất MFA khi đăng nhập vào quyền nhân viên soát vé hoặc quầy bắp nước trên kênh được phép, gồm đường API tương ứng; dùng TOTP từ ứng dụng xác thực. Không yêu cầu nhập mã lại cho từng lần quét vé/giao combo trong phiên còn hợp lệ. Mã dự phòng và bộ quy tắc đăng ký/đổi/khôi phục được duyệt riêng bên dưới. |
| Chỉ số và ngưỡng | Trong bộ kiểm, 0 lần cấp hoặc sử dụng quyền nhân viên chỉ từ mật khẩu khi chưa hoàn tất MFA; 0 lần bỏ qua MFA qua đường đăng nhập/API khác. Sau khi xác thực đủ và phiên hợp lệ, các thao tác đúng quyền phải hoạt động mà không đòi mã cho mỗi lượt. Không đạt bằng cách từ chối toàn bộ nhân viên. |
| Điều kiện đo | Tài khoản thử riêng cho hai vai trò/rạp và người có cả hai vai trò; cơ chế danh tính/phiên thật theo bản build đã định. Kiểm đăng nhập chưa/đã hoàn tất MFA, gọi API trực tiếp, mã sai/dùng lại và thao tác đúng quyền trong phiên hợp lệ. Ghi phần thật/giả lập; không dùng header email tự khai làm bằng chứng xác thực. |
| Mức ưu tiên | Đã duyệt bắt buộc cho hai vai trò nhân viên ở mốc demo; đây là phê duyệt mở rộng riêng ngày 2026-11-22, không suy từ việc quản trị/quản lý dùng MFA. |
| Cách nghiệm thu | Đối chiếu trạng thái phiên/cấp quyền, phản hồi và tác dụng phụ Core: chưa đủ MFA không dùng được quyền nhân viên; đủ MFA chỉ có quyền đã được cấp đúng rạp. Người có hai vai trò không được thêm quyền khác. Sau đăng nhập hợp lệ, thực hiện chuỗi soát/giao phù hợp mà không có challenge ở từng lượt; giữ log đã lọc bí mật và kết quả từng nhánh. |
| Phương án B và đánh đổi | B chỉ bắt buộc MFA cho quản trị/quản lý, chưa bắt buộc cho hai vai trò nhân viên ở mốc đầu: ít công đăng ký/kiểm hơn nhưng mật khẩu bị lộ vẫn là rủi ro đối với thao tác sử dụng vé/giao hàng; B không được chọn. A đã chọn thêm bước đăng nhập và quy trình yếu tố cho nhân viên, bảo vệ nhất quán hơn cho tài khoản vận hành; không thêm quyền quản lý, không tự mở kênh Web cho nhân viên và không bắt MFA cho khách hàng. |
| Phần còn mở | Bộ quy tắc đăng ký/thay/khôi phục cho nhân viên đã duyệt bên dưới; giao thức trạng thái, thời hạn phiên/challenge, thu hồi và chống thử sai cần đặc tả. Không tự mở rộng ngoại lệ quyền vận hành khi Identity gián đoạn hoặc áp thời hạn 90/15/60 phút làm TTL đăng nhập/MFA. Chưa chọn/cài plugin, gọi dịch vụ hoặc sửa code. |

Căn cứ đối chiếu ngày 2026-11-22:
[OWASP — Quick recommendations](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html#quick-recommendations)
yêu cầu cân nhắc mô hình rủi ro và bối cảnh người dùng khi chọn phạm vi MFA;
[When to require MFA](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html#when-to-require-mfa)
nêu đăng nhập là điểm chính và cần bảo vệ các đường xác thực khác, gồm API/mobile.
Áp cho hai vai trò nhân viên là quyết định dự án đã duyệt dựa trên quyền soát/giao theo mô hình sản phẩm,
không phải OWASP quy định chính xác vai trò này hoặc dự án đã đạt chứng nhận bảo mật.

**Vòng đời yếu tố cho nhân viên — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Dùng cùng quy tắc nhóm quản lý”. Áp dụng cùng nguyên tắc tại mục [9.14.2](#9142-phương-thức-mfa-và-mã-dự-phòng)–[9.14.4](#9144-đổi-yếu-tố-mfa-và-tạo-lại-mã-dự-phòng) cho
ACT-SCANNER và ACT-CONCESSION: xác minh TOTP trước khi hoàn tất
đăng ký; cấp mã dự phòng dùng một lần để thay TOTP sau khi mật khẩu hợp lệ. Đổi yếu tố/tạo lại mã
phải xác minh lại mật khẩu và TOTP hiện tại hoặc một mã dự phòng hợp lệ; xác minh yếu tố mới trước
khi coi sẵn sàng, bộ mã mới có hiệu lực thì bộ cũ hết hiệu lực. Không tự tắt MFA từ reset mật khẩu
hoặc vì chỉ còn một phiên đang đăng nhập.

Nếu mất cả TOTP và mọi mã dự phòng hợp lệ, A chưa hỗ trợ khôi phục MFA để đăng nhập mới bằng
quyền nhân viên ở mốc portfolio; không hứa quản lý rạp có thể reset thay. Đây là đánh đổi đã được chủ
sản phẩm duyệt riêng, không suy từ chính sách đã chốt cho hai vai trò quản lý. B bổ sung khôi phục
cho nhân viên qua người có thẩm quyền: thuận tiện hơn khi mất cả hai, nhưng cần thiết kế xác minh
danh tính, actor/quyền reset, kiểm toán và thu hồi phiên trước khi duyệt; B không được chọn cho mốc đầu.

Chỉ số/ngưỡng đề xuất: không cấp quyền nhân viên mới khi thiếu MFA hợp lệ, không chấp nhận lại
mã dự phòng đã dùng/bộ mã đã bị thay, không thay yếu tố chỉ nhờ phiên hoặc mật khẩu; ca đủ bằng chứng
vẫn đăng ký/đổi/đăng nhập được. Điều kiện đo/nghiệm thu: tài khoản thử của hai vai trò và người có cả hai,
kiểm UI/API, mã đúng/sai/đã dùng/đồng thời, đăng ký dở, lỗi khi đổi và mất cả hai yếu tố; đối chiếu trạng thái
Identity/quyền/tác dụng phụ, giữ bằng chứng đã lọc bí mật. A đã được chọn làm bộ quy tắc MFA
nhân viên cho mốc demo; chi tiết phép đo/nghiệm thu vẫn cần cụ thể hóa.
Chưa chọn cửa sổ/chống thử sai, công cụ hoặc thay hợp đồng thu hồi.

### 9.14.8. Nguyên tắc tự hết hạn phiên đăng nhập

**Phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Cả hạn không hoạt động và hạn tối đa”. Có cả idle và hạn tuyệt đối, phân nhóm khách/vận hành;
làm mới nền không tự giữ phiên mãi, hết hạn phải xác thực lại theo vai trò và không hủy giao dịch Core.
Giá trị khách hàng, quản trị/quản lý và nhân viên được duyệt tiếp bên dưới. Bổ sung phần idle/max tại mục [9.14.1](#9141-phạm-vi-đăng-xuất-và-vô-hiệu-phiên),
không thay phạm vi logout phiên hiện tại đã duyệt hoặc tự chọn thời hạn token/quyền vận hành.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Người dùng để quên thiết bị còn đăng nhập, hoặc một phiên tiếp tục được dùng rất lâu. MFA lúc đăng nhập không tự xác định khi nào phiên phải hết hiệu lực và yêu cầu xác thực lại. |
| Phương án A đã duyệt | Có cả hạn không hoạt động (idle) và hạn tối đa tuyệt đối cho phiên logic; chạm một trong hai thì hết phiên và yêu cầu xác thực lại. Thiết kế giá trị riêng theo nhóm khách hàng/vận hành, xét tiếp khác biệt vai trò nếu có căn cứ. Chưa chốt số phút/giờ từ lựa chọn nguyên tắc này. |
| Hoạt động và làm mới | Đề xuất idle tính từ hoạt động hợp lệ gắn với thao tác chủ động của người dùng; polling/heartbeat/refresh token nền không tự giữ phiên mãi. Hạn tuyệt đối tính từ lúc phiên logic được xác thực thành công, không reset vì có thao tác, tự refresh hoặc xoay định danh. Xác thực lại phải theo chính sách của vai trò, gồm MFA khi bắt buộc; không tự bật bỏ MFA cho thiết bị đã nhớ. |
| Chỉ số và ngưỡng | Đo tuổi phiên và thời gian từ hoạt động hợp lệ cuối tới lần kiểm, số lần chấp nhận phiên đã hết hạn hoặc gia hạn trái quy tắc. Với ngưỡng hữu hạn đã được duyệt/cấu hình cho bộ kiểm sau này: 0 yêu cầu mới được xác thực bằng phiên hết hạn tại điểm kiểm session, 0 lần refresh/polling tự reset hạn tuyệt đối hoặc idle trái chính sách. Giá trị idle/max của ba nhóm đã duyệt bên dưới; độ trễ truyền thu hồi token riêng còn mở. |
| Điều kiện đo | Identity/BFF, các app/phiên thử và nguồn thời gian được định danh; phân nhóm khách/vận hành, phiên cùng logic và phiên độc lập. Kiểm có thao tác, chỉ chạy nền, không hoạt động, sát/quá hạn, refresh/xoay định danh, gọi API trực tiếp và xác thực lại. Không dùng sửa giờ client hoặc ẩn màn hình làm bằng chứng server đã vô hiệu phiên. |
| Mức ưu tiên | A đã được chọn làm nguyên tắc hết hạn phiên cho demo công khai; phải chốt giá trị hữu hạn trước nghiệm thu. Chưa yêu cầu khóa app sau mỗi lần quét/giao hoặc thêm công nghệ mới. |
| Cách nghiệm thu | Đối chiếu mốc xác thực/hoạt động và quyết định server, kiểm phiên còn hạn đúng quyền vẫn dùng được, phiên hết hạn không cấp quyền/token mới tại các điểm kiểm session. App báo đúng cần đăng nhập lại và xử lý dữ liệu riêng tư theo chính sách đã duyệt, không làm lộ tài khoản trước. Kiểm kết quả Core cũ còn nguyên, không tự hủy hold/đơn/thu-hoàn hoặc gửi lại lệnh vì hết phiên; tác vụ chưa rõ phải tra cứu theo quyền sau xác thực lại. |
| Phương án B và đánh đổi | B chỉ có hạn tuyệt đối, chưa có hạn do không hoạt động: ít bị ngắt sau lúc ngừng thao tác nhưng thiết bị bị để quên có thể còn quyền tới hết tuổi phiên; B không được chọn. A đã chọn hạn chế cả phiên bỏ quên và phiên tồn tại quá lâu, đổi lại cần chọn thời hạn phù hợp luồng khách/nhân viên để tránh đăng nhập lại quá thường xuyên. |
| Ranh giới còn mở | Các mốc bằng chứng quyền vận hành 90 phút/làm mới 15 phút/tiếp tục soát 60 phút khi Identity gián đoạn giữ điều kiện đã duyệt, không phải TTL phiên. Giá trị idle/max và cách tiếp tục có giới hạn cho nhân viên đã duyệt bên dưới; hợp đồng liên dịch vụ và các biên hết hạn vẫn cần kiểm chứng. Hoạt động tại chỗ và cảnh báo trước hạn đã duyệt về nguyên tắc; cơ chế ghi nhận hoạt động, cửa sổ báo trước, giao thức/hạn đồng bộ bù thu hồi và dữ liệu vé ngoại tuyến còn cần cụ thể hóa. Không hứa hết phiên đồng nghĩa mọi token/thiết bị offline bị thu hồi tức thì. |

Căn cứ nghiên cứu ngày 2026-11-22:
[OWASP — Idle timeout](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#idle-timeout)
và [Absolute timeout](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#absolute-timeout)
khuyến nghị cả hai giới hạn và thực thi hết hạn ở server. OWASP mô tả idle theo request;
loại polling/refresh nền khỏi hoạt động giữ phiên và cách phân nhóm ở đây là quyết định dự án đã duyệt.
Không lấy khoảng ví dụ của nguồn hoặc mặc định thư viện làm ngưỡng đã duyệt cho Movie Booking Agent.

**Giá trị phiên cho khách hàng — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Không hoạt động 30 phút / tối đa 24 giờ”. Chỉ áp dụng phiên đăng nhập
Customer Web/Mobile tại các điểm kiểm session của hợp đồng Identity/BFF; chưa đặt giá trị cho nhóm
vận hành hoặc thời hạn token/bằng chứng quyền đã cấp. Mỗi phiên logic độc lập có mốc riêng.

| Phương án | Giá trị và đánh đổi đề xuất |
|---|---|
| A — Đã duyệt cho demo | Hết phiên sau 30 phút không có hoạt động hợp lệ, tuổi tối đa 24 giờ từ lần xác thực/xác thực lại thành công gần nhất. Phiên bị bỏ quên chỉ còn cửa sổ nửa giờ; hoạt động liên tục không giữ phiên qua mốc một ngày. Có thể phải đăng nhập lại khi quay lại xem đơn/vé sau một quãng nghỉ. |
| B — Thuận tiện khi quay lại | Hết phiên sau 24 giờ không hoạt động, tuổi tối đa 7 ngày. Ít đăng nhập lại hơn giữa các lần ghé app nhưng phiên bỏ quên/chiếm được có cửa sổ sử dụng dài hơn. Đây là phương án dự án đề xuất riêng, không lấy mặc định thư viện làm căn cứ duyệt. |

Căn cứ A là ưu tiên hạn chế phiên bỏ quên cho demo công khai có dữ liệu tài khoản/đơn/chat, đồng thời
không cắt phiên chỉ vì một quãng chờ ngắn trong luồng đặt vé. OWASP đưa ví dụ idle 15–30 phút cho
ứng dụng ít rủi ro hơn, nhưng không xếp loại rủi ro cho dự án này hoặc ấn định tuổi 24 giờ; mốc một ngày
là lựa chọn thiết kế dự án đã duyệt, chưa có kết quả kiểm chứng. B ưu tiên quay lại trong
vài ngày, đổi lại cửa sổ phiên dài hơn; B không được chọn.

Điều kiện đo/nghiệm thu đề xuất: tài khoản khách thử và các phiên logic độc lập, build/cấu hình và nguồn
thời gian được định danh. Kiểm sát trước/tại/sau từng hạn, hoạt động chủ động so với polling/refresh nền,
xoay định danh, xác thực lại, nhiều tab và app. Có thể dùng thời gian điều khiển trong môi trường thử,
không sửa đồng hồ môi trường đang dùng. Chỉ số/ngưỡng A: idle 30 phút, tuổi 24 giờ; 0 yêu cầu mới được
xác thực bằng phiên đã hết hạn tại điểm kiểm session, 0 lần refresh/hoạt động thường tự reset tuổi tối đa.
Phiên còn hạn đúng quyền vẫn hoạt động; không đạt bằng cách từ chối mọi phiên. Giữ bằng chứng quyết định
server và mốc thời gian, không chỉ ảnh màn hình đăng nhập. Mức ưu tiên: A đã được chọn cho nghiệm thu
phiên khách ở mốc demo; chi tiết phép đo cần cụ thể hóa, chưa tuyên bố mọi token riêng bị vô hiệu tức thì theo tuổi phiên này.

Giữ B-07/ADR-0023: Customer Mobile vẫn phải xuất trình được QR đã lưu khi điện thoại không có mạng,
Core/nhân viên vẫn kiểm quyền vé theo thẩm quyền. Không gán hạn phiên thành hạn vé hoặc tự xóa QR
đã lưu; truy xuất kho cục bộ/cách ly tài khoản phải thiết kế nhất quán với B-07 và logout đã duyệt,
không thay yêu cầu offline bằng bắt đăng nhập online lại. Chưa chọn biometric gate/cơ chế mở kho.
Đơn/hold/thanh toán vẫn theo Core; hết phiên không đảo hay gửi lại giao dịch.
Nguồn đối chiếu: [OWASP — Session expiration](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#session-expiration)
và ADR-0023 tại main `2a007797ac9ce542d9747aad0f44f3e430eec581`.

**Phiên quản trị/quản lý — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Không hoạt động 15 phút / tối đa 8 giờ”. Áp dụng quyền quản trị viên toàn chuỗi
và quản lý rạp trên các kênh được phép; chưa chọn thời hạn cho nhân viên soát vé/quầy bắp nước.

| Phương án | Giá trị và đánh đổi đề xuất |
|---|---|
| A — Đã duyệt cho demo | Hạn không hoạt động 15 phút, tuổi tối đa 8 giờ từ lần xác thực/xác thực lại thành công gần nhất. Rút ngắn cửa sổ bỏ quên so với khách; tuổi tối đa tương ứng một phiên làm việc trong ngày theo giả định thiết kế. Ít xác thực lại hơn B khi xem/cấu hình/báo cáo. |
| B — Ngắn hơn | Hạn không hoạt động 5 phút, tuổi tối đa 4 giờ. Giảm cửa sổ phiên còn quyền, đổi lại đăng nhập/MFA lại thường xuyên hơn sau quãng dừng và phiên làm việc dài. |

Căn cứ A là quyền quản lý phạm vi rạp/toàn chuỗi cần hạn bỏ quên ngắn hơn khách, đồng thời tránh yêu cầu
xác thực lại quá thường xuyên trong demo các nghiệp vụ quản lý. Giả định một phiên làm việc tối đa 8 giờ
chưa phải cam kết staffing/ca làm đã xác nhận. OWASP nêu chọn thời hạn theo rủi ro và thời lượng sử dụng;
không coi các khoảng ví dụ là xếp hạng an toàn cho hai vai trò này. A là mục tiêu dự án đã duyệt;
B không được chọn, chưa có kết quả runtime chứng minh đáp ứng.

Tình huống/điều kiện đo: phiên và tài khoản thử riêng cho hai vai trò, build/app/Identity/BFF và đồng hồ
thẩm quyền được định danh; kiểm hoạt động chủ động, tác vụ nền, sát/tại/quá hai hạn, gọi trực tiếp,
xác thực lại thiếu/đủ MFA và phiên có nhiều vai trò. Chỉ số/ngưỡng A: idle 15 phút/tuổi tối đa 8 giờ;
0 yêu cầu mới dùng phiên hết hạn được cấp quyền quản trị/quản lý tại điểm kiểm session; 0 tự refresh
làm mới tuổi tối đa hoặc tự bỏ MFA. Nghiệm thu đối chiếu quyết định server và trạng thái quyền/dữ liệu,
phiên còn hạn vẫn làm việc đúng rạp/quyền, không xóa/đảo giao dịch khi hết phiên. A đã được chọn cho
nghiệm thu phiên quản trị/quản lý ở mốc demo; chi tiết phép đo cần cụ thể hóa, chưa chọn công cụ hoặc chạy kiểm.

Khi một phiên có quyền quản lý, không dùng thời hạn của vai trò khác để né giới hạn này; cách ánh xạ
phiên/quyền nhiều vai trò cần đặc tả theo mô hình sản phẩm, không tự cấp quyền soát/giao cho quản lý.
Bằng chứng 90 phút/làm mới 15 phút/mục tiêu 60 phút tiếp tục soát chỉ áp phạm vi vận hành đã duyệt,
không thay xác thực lại hoặc cấp quyền quản trị/tài chính đặc biệt khi phiên quản lý hết hạn.
Nguồn đã đối chiếu: mục 90/15/60 phút trong `004-service-decomposition/decisions.md` tại main
`2a007797ac9ce542d9747aad0f44f3e430eec581`; các ngưỡng phiên quản lý đã duyệt không sửa nguồn quyền đó.

**Nhân viên khi Identity lỗi và phiên chính hết hạn — phương án A đã duyệt ngày 2026-11-22:**
chủ sản phẩm chọn “A — Tiếp tục có giới hạn theo quyền đã cấp”. Phân biệt
phiên đăng nhập chính với bằng chứng quyền soát/giao đã được cấp trước sự cố. Nhân viên đã xác thực,
được cấp đúng quyền và ở trạng thái sẵn sàng, vẫn đang làm việc, được tiếp tục tác vụ soát vé/giao combo
bằng bằng chứng còn hợp lệ dù phiên Identity chính tới hạn trong lúc Identity gián đoạn. Phiên chính vẫn
hết hiệu lực tại điểm kiểm của nó, không được cấp phiên/token mới từ phiên đã hết hạn.

Quyền tiếp tục chỉ là các hành động/rạp/đối tượng được cấp cho soát/giao; Core, DB và kết nối thiết bị
đến Core vẫn phải hoạt động, Core xác minh bằng chứng và kiểm trạng thái nghiệp vụ từng tác vụ.
Giữ hạn bằng chứng 90 phút từ lúc cấp, làm mới ≤ 15 phút khi khỏe và mục tiêu tiếp tục soát ít nhất
60 phút cho phiên sẵn sàng với đủ thời hạn còn lại; không reset đồng hồ hoặc tự làm mới từ bằng chứng cũ.
Không nâng mục tiêu 60 phút thành cam kết cho mọi nghiệp vụ hoặc dùng quyền này mở quản trị/tài chính.

A không cho đăng nhập mới hoặc bỏ MFA từ cache. Bằng chứng hết hạn/sai phạm vi/không xác minh được,
hoặc Core đã nhận thu hồi hợp lệ, vẫn phải từ chối. App không tự mở lại quyền sau logout/đổi tài khoản
hoặc trạng thái đã khóa vì không hoạt động. Hoạt động hợp lệ và khóa idle phía app phải được định nghĩa
theo phiên nhân viên; không coi polling nền là người còn làm việc. Cách phục hồi/làm mới sau khi Identity
trở lại phải theo xác minh quyền và chính sách phiên/MFA, không âm thầm tạo phiên mới từ quyền cũ.

Tình huống/điều kiện đo đề xuất: tài khoản nhân viên và bằng chứng thử đủ điều kiện, phiên Identity
sắp tới hạn, build/Core/DB/khóa tin cậy được định danh. Gây lỗi Identity trong môi trường cô lập, cho
phiên chính tới hạn giữa bài rồi thực hiện thao tác được cấp; thử thêm đăng nhập mới, quyền quản lý,
sai rạp, thu hồi đã nhận, bằng chứng hết hạn, logout/đổi tài khoản và trạng thái idle bị khóa.
Chỉ số/ngưỡng: giữ bài soát 60 phút theo điều kiện 90/15 đã duyệt, 0 quyền mới/ngoài phạm vi được cấp,
0 lần gia hạn bằng chứng trái quy tắc hoặc dùng phiên chính hết hạn để tạo phiên/token mới.
Nghiệm thu đối chiếu quyết định ở Identity/điểm kiểm phiên và Core, quyền/hành động thực cùng mốc
thời gian; không lấy phép tính TTL thay kết quả hoạt động. Mức ưu tiên: A đã được chọn làm quan hệ giữa
hết phiên và chịu lỗi Identity; chi tiết phép đo/cơ chế phải cụ thể hóa trước nghiệm thu kết hợp.

B dừng tác vụ khi phiên chính hết hạn và buộc xác thực lại, kể cả bằng chứng vận hành còn hợp lệ:
giới hạn chặt theo phiên chính nhưng có thể phá mục tiêu soát 60 phút nếu Identity chưa hồi phục.
Nếu chọn B phải mở lại quan hệ với yêu cầu 60 phút, không tự ghi cả hai đã đáp ứng; B không được chọn.
Nguồn kiến trúc phân biệt bằng chứng vận hành với TTL phiên và giữ điều kiện sẵn sàng;
việc cho phép tiếp tục khi phiên chính tới hạn ở đây là quyết định làm rõ đã được chủ sản phẩm duyệt riêng,
không suy phê duyệt từ nguồn kiến trúc hoặc coi luồng đã triển khai.

**Giá trị phiên nhân viên — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Không hoạt động 30 phút / tối đa 8 giờ”. Áp dụng nhân viên soát vé và nhân viên
quầy bắp nước trên kênh được phép; không áp thời hạn này cho quyền quản trị/quản lý hoặc khách hàng.

| Phương án | Giá trị và đánh đổi đề xuất |
|---|---|
| A — Đã duyệt cho demo | Hết phiên khi không hoạt động hợp lệ 30 phút, tuổi tối đa 8 giờ từ xác thực/xác thực lại thành công gần nhất. Cho quãng ngừng thao tác dài hơn nhóm quản lý khi nhân viên chờ khách/đổi công việc ngắn; giảm số lần phải xác thực lại trong luồng phục vụ. |
| B — Chặt hơn về không hoạt động | Không hoạt động 15 phút, tuổi tối đa vẫn 8 giờ. Dùng cùng giá trị nhóm quản lý, giảm cửa sổ bỏ quên thiết bị nhưng dễ cần đăng nhập/MFA lại hơn sau lúc chờ hoặc nghỉ. |

Căn cứ A là giả định hoạt động hiện trường có quãng chờ, quyền nhân viên giới hạn theo hành động/rạp;
8 giờ là cửa sổ phiên làm việc đã chọn, không phải lịch ca đã xác nhận. Hai phương án giữ MFA khi đăng nhập
và không đòi mã cho từng lần quét/giao. A là mục tiêu dự án đã duyệt, không tự lấy 90/15/60 phút của bằng
chứng quyền thành hạn phiên hoặc tuyên bố phù hợp tiêu chuẩn chỉ vì trùng một khoảng ví dụ; B không được chọn.

Hoạt động nghiệp vụ hợp lệ do nhân viên chủ động, gồm soát/giao qua Core, phải được tính đúng cho
luồng đang vận hành; polling/refresh nền không tự duy trì idle và không reset tuổi tối đa. Cơ chế gắn hoạt động
với phiên/điểm kiểm phải đặc tả, không tin thời gian/danh tính tự khai từ client hoặc giả định mặc định SDK đã đủ.
Khi Identity khỏe, hết phiên yêu cầu xác thực lại/MFA; khi Identity lỗi, chỉ tiếp tục phạm vi quyền đã cấp theo
quyết định ngay phía trên. Phiên đã khóa do idle/logout không tự mở lại bằng cache/bằng chứng cũ.

Điều kiện đo/nghiệm thu đề xuất: tài khoản hai vai trò, phiên logic độc lập, build/Identity/Core và đồng hồ
được định danh; kiểm sát/tại/quá hai hạn, thao tác soát/giao chủ động so với nền, xác thực lại, logout và
người có nhiều vai trò. Kết hợp Identity lỗi trước khi phiên chính tới hạn, bằng chứng còn/hết hạn và thu hồi
đã nhận; đối chiếu quyết định tại điểm kiểm session, trạng thái app và Core, không chỉ thông báo giao diện.
Chỉ số/ngưỡng A: idle 30 phút, tuổi tối đa 8 giờ cho phiên chính; 0 chấp nhận phiên đã hết hạn để tạo phiên/
token mới, 0 tự reset tuổi tối đa, 0 tự mở lại luồng đã khóa vì idle. Phần tiếp tục có giới hạn không cấp quyền
mới/ngoài rạp hoặc dùng bằng chứng hết hạn, không được tính là phiên chính được gia hạn. Mức ưu tiên:
A đã được chọn cho phiên nhân viên và bài chịu lỗi Identity; chi tiết phép đo cần cụ thể hóa, chưa chọn công cụ hoặc chạy kiểm.

Nếu một phiên có quyền quản lý, phải giữ giới hạn 15 phút/8 giờ của quyền đó, không dùng phương án
nhân viên để kéo dài quyền quản lý. Không đổi phạm vi vai trò/ứng dụng, mở đăng nhập mới khi Identity lỗi
hoặc thay các ràng buộc Core từ việc chọn số này. Đây là mục tiêu thiết kế đã duyệt, chưa có runtime kiểm chứng.

**Cảnh báo trước khi phiên hết hạn — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Có cảnh báo trước trong app”. Khi app đang hoạt động
và có đủ căn cứ xác định phiên đang tới hạn, hiển thị cảnh báo trong app để người dùng có cơ hội
chủ động tiếp tục hoặc xác thực lại, tùy loại hạn. Hạn idle chỉ được cập nhật từ hoạt động hợp lệ
được chấp nhận trước khi phiên hết hạn; hiển thị cảnh báo/tác vụ nền không tự làm mới phiên.
Chạm tuổi tối đa vẫn phải xác thực lại theo vai trò/MFA, không dùng nút tiếp tục để kéo dài tuổi đó.

Tình huống: khách đang soạn chat, quản lý đang nhập biểu mẫu hoặc nhân viên đang chờ phục vụ;
phiên sắp chạm hạn idle hoặc hạn tối đa của nhóm tương ứng. Chỉ số/ngưỡng đề xuất:
trong bộ ca đủ điều kiện hiển thị, 0 bỏ sót cảnh báo theo cửa sổ sẽ duyệt, 0 tự gia hạn do cảnh báo,
0 dùng phản hồi đến sau hết hạn để tự mở lại phiên cũ. Cảnh báo phải nhận biết và thao tác được
bằng phương thức trợ năng phù hợp, không tạo bẫy hoặc tự giành focus khỏi nội dung đang soạn.
Số phút/giây báo trước, cách xác định hoạt động tại chỗ và đồng bộ nhiều tab/app còn cần chốt;
chưa có cửa sổ cụ thể thì chưa đủ điều kiện nghiệm thu thời điểm cảnh báo.

Điều kiện đo/nghiệm thu: dữ liệu/phiên mẫu ba nhóm, đồng hồ/mốc server có thể đối chiếu;
kiểm idle và tuổi tối đa riêng, có/không phản hồi cảnh báo, phản hồi trước/sau hạn,
background/foreground và trạng thái mất kết nối. Đối chiếu UI/trợ năng với quyết định phiên thực,
không chỉ đồng hồ đếm lùi phía client. Hết phiên vẫn xử lý theo các quyết định đã duyệt;
không hủy hold/đơn, đảo thanh toán hoặc gia hạn quyền vận hành bằng cảnh báo.
Mức ưu tiên: A đã được chọn cho nghiệm thu vòng đời phiên ở mốc demo, trước công bố trải nghiệm tương ứng.
A giảm bất ngờ khi đang nhập dữ liệu nhưng thêm trạng thái UI cần kiểm; B chỉ báo khi đã hết phiên,
ít trạng thái hơn nhưng không có cơ hội phản hồi trước hạn; B không được chọn. Không thêm email,
push, lưu bản nháp lâu dài hoặc bảo đảm cảnh báo khi thiết bị offline/app bị hệ điều hành dừng.

**Hoạt động tại chỗ để tính idle — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Tính thao tác chủ động tại chỗ được server ghi nhận”. Thao tác chủ động như soạn
chat/biểu mẫu, đổi lựa chọn hoặc điều hướng bằng phương thức nhập/trợ năng được hỗ trợ có thể được
tính hoạt động dù chưa gửi biểu mẫu, khi tín hiệu gắn đúng phiên còn hạn được máy chủ chấp nhận.
Không coi việc chỉ mở trang/đọc mà không thao tác, di chuyển chuột đơn thuần, tự cuộn hoặc cập nhật
nền là hoạt động giữ phiên. Tác vụ soát/giao chủ động đã duyệt tiếp tục được tính theo hợp đồng riêng.
Không yêu cầu gửi nội dung đang gõ, bản nháp hoặc lịch sử phím vào log/trace để ghi nhận hoạt động.

Tình huống: người dùng vẫn đang gõ/chọn trên giao diện nhưng chưa phát yêu cầu nghiệp vụ; cần tránh
hết hạn chỉ vì chưa bấm gửi, đồng thời không để trang bỏ quên tự duy trì phiên.
Chỉ số/ngưỡng đề xuất: trong bộ ca, hoạt động tại chỗ hợp lệ đã được server ghi nhận cập nhật idle
theo chính sách, 0 tác vụ nền/di chuyển chuột đơn thuần tự reset idle, 0 tự đặt lại tuổi tối đa và
0 tín hiệu cũ/đến sau khi hết phiên làm phiên đó hoạt động lại. Không dùng timestamp tự khai của
client để lùi mốc server hoặc suy thao tác trên một phiên thành hoạt động của mọi phiên tài khoản.
Điều kiện đo/nghiệm thu: phiên mẫu ba nhóm và phiên đối chứng; soạn chưa gửi, chọn/điều hướng,
chỉ đọc không thao tác, chỉ chạy nền, mất kết nối/tín hiệu trễ, replay và sát hạn idle/max.
Đối chiếu loại thao tác/tín hiệu tối thiểu được phép, mốc server và quyết định phiên; chỉ thay đổi
đồng hồ giao diện không được coi là giữ phiên thành công. Máy chủ chưa ghi nhận thì UI không được
hứa phiên từ xa đã được kéo dài. Giữ chính sách quyền nhân viên khi Identity lỗi và app đã khóa.
Mức ưu tiên: A đã được chọn làm định nghĩa hoạt động tại chỗ cho nghiệm thu idle trên các app.
A ít gây ngắt khi đang soạn nhưng cần tín hiệu hoạt động được bảo vệ và kiểm chứng;
B chỉ đếm thao tác chủ động phát yêu cầu nghiệp vụ hợp lệ, đơn giản hơn nhưng gõ/đọc tại chỗ có thể
vẫn tới hạn; B không được chọn. Cơ chế gắn phiên, tần suất gộp/gửi, điểm nhận và cách kiểm tín hiệu
là chi tiết kỹ thuật còn mở, không chọn API/thư viện hoặc mở quyền từ tín hiệu client.

### 9.14.9. Vô hiệu phiên sau đổi/đặt lại mật khẩu

**Phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Vô hiệu mọi phiên cũ, đăng nhập lại”. Sau đổi/đặt lại mật khẩu thành công, vô hiệu mọi phiên cũ,
gồm phiên hiện tại, rồi đăng nhập lại/MFA theo vai trò. Chỉ chốt phạm vi phiên sau khi đổi hoặc đặt lại
mật khẩu đã thành công theo quy trình hợp lệ. Không thay logout thông thường chỉ phiên hiện tại,
không mở phương thức khôi phục tài khoản/MFA mới hoặc quyền khóa tài khoản từ đề xuất này.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Tài khoản có nhiều phiên Web/Mobile; người dùng đổi mật khẩu trong phiên hoặc hoàn tất đặt lại mật khẩu qua luồng khôi phục. Cần loại bỏ khả năng tiếp tục từ phiên/khả năng làm mới cũ, thay vì chỉ đổi mật khẩu mà phiên cũ vẫn tạo phiên hoặc token mới. |
| Phương án A đã duyệt | Sau đổi hoặc đặt lại mật khẩu thành công, Identity vô hiệu mọi phiên đăng nhập và khả năng làm mới cũ của tài khoản, gồm phiên hiện tại và các định danh xoay vòng thuộc chúng. Đăng nhập lại bằng mật khẩu mới và MFA theo vai trò; không tự đăng nhập sau reset, không tắt MFA hoặc lấy reset mật khẩu làm bằng chứng thay yếu tố. |
| Điểm kích hoạt | Chỉ bắt đầu đợt thu hồi khi thay mật khẩu được xác minh và ghi nhận thành công. Yêu cầu quên mật khẩu/gửi email, token sai/hết hạn, đổi/reset thất bại không tự kích hoạt đợt thu hồi này. Phản hồi phải phân biệt thay mật khẩu, thu hồi tại Identity và phần truyền tới dịch vụ khác nếu chưa hoàn tất. |
| Chỉ số và ngưỡng | Sau khi Identity/điểm kiểm phiên tương ứng đã xử lý thu hồi: 0 phiên/khả năng làm mới cũ được chấp nhận để xác thực hoặc cấp mới; phiên mới xác thực hợp lệ theo mật khẩu mới vẫn dùng được. 0 phiên tài khoản khác bị vô hiệu do thay mật khẩu của tài khoản thử. Không gán độ trễ truyền thu hồi tới mọi dịch vụ bằng 0. |
| Điều kiện đo | Tài khoản thử của ba nhóm, nhiều phiên cùng tài khoản và một tài khoản đối chứng; build/cấu hình và mốc xác minh–thay mật khẩu–thu hồi được định danh. Kiểm đổi trong phiên/reset qua khôi phục, thành công/thất bại, replay định danh cũ, refresh/xoay định danh, nhiều tab/app và đăng nhập mới thiếu/đủ MFA. Xác nhận phiên cũ còn sống trước bài, không dùng credential thật trong bằng chứng. |
| Mức ưu tiên | A đã được chọn cho vòng đời phiên khi đổi/đặt lại mật khẩu ở mốc demo; chi tiết phép đo/giao thức thu hồi cần cụ thể hóa trước nghiệm thu, chưa chọn API/thư viện hoặc cho phép thao tác tài khoản thực. |
| Cách nghiệm thu | Đối chiếu trạng thái Identity và kết quả gọi điểm kiểm phiên/cấp mới, không chỉ thấy UI chuyển sang login. Các yêu cầu cũ sau mốc thu hồi bị từ chối; ca chỉ yêu cầu email hoặc thất bại không làm mất phiên hợp lệ. App xử lý dữ liệu riêng tư khi nhận trạng thái theo chính sách đã duyệt; không xóa/đảo giao dịch Core hoặc tự hủy vé vì đổi mật khẩu. |
| Phương án B và đánh đổi | Khi đổi mật khẩu trong phiên đã xác minh lại đủ theo vai trò, thu hồi các phiên khác và thay định danh/credential cũ để người dùng tiếp tục ở phiên vừa xác minh. Reset qua khôi phục vẫn thu hồi mọi phiên cũ và đăng nhập lại. B ít gián đoạn hơn nhưng cần phân biệt chặt luồng đổi và reset; không được chỉ giữ nguyên credential cũ có thể đã lộ. A dùng một quy tắc thống nhất nhưng người đang đổi mật khẩu cũng phải đăng nhập lại; B không được chọn. |
| Ranh giới còn mở | Gắn session/token/bằng chứng quyền, cách truyền thu hồi, thời hạn lan truyền khi khỏe và hành vi khi kênh lỗi cần chốt riêng. Không hứa mọi JWT/bằng chứng đã cấp bị chặn tức thì hoặc xóa được dữ liệu trên thiết bị offline. Giữ 90/15/60 và giới hạn quyền cũ đã duyệt; Core đã nhận thu hồi hợp lệ phải từ chối tương ứng, không tiếp tục chỉ để đạt chỉ tiêu 60 phút. Không tự kéo dài quyền, hủy hoặc phát lại giao dịch. |

Căn cứ đối chiếu ngày 2026-11-22:
[OWASP — User resets password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html#user-resets-password)
khuyến nghị đăng nhập theo luồng thông thường sau reset và cho lựa chọn/tự động vô hiệu các phiên;
[Change password feature](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#change-password-feature)
nhấn mạnh phiên hợp lệ và kiểm mật khẩu hiện tại khi đổi trong phiên. A là lựa chọn dự án đã duyệt,
không phải OWASP bắt mọi ứng dụng xử lý giống nhau hoặc chứng minh thư viện đã triển khai đầy đủ.

### 9.14.10. Vòng đời phiên khi khóa/mở khóa bảo mật

**Phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Thu hồi mọi phiên, mở khóa đăng nhập lại”. Áp dụng khi Identity ghi nhận hợp lệ khóa bảo mật
toàn tài khoản. Trạng thái chờ xóa tài khoản theo BR-38, thu hồi một vai trò hoặc phạm vi rạp là
các trường hợp riêng; không tự áp khóa toàn tài khoản cho các sự kiện đó.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Tài khoản bị khóa bảo mật khi còn nhiều phiên/khả năng làm mới đang hiệu lực; sau đó được mở khóa hợp lệ. Cần ngăn tiếp tục sử dụng phiên cũ đã bị thu hồi và tránh mở khóa làm credential cũ sống lại. |
| Phương án A đã duyệt | Khi khóa được ghi nhận, Identity chặn đăng nhập/cấp mới/làm mới và vô hiệu mọi phiên cũ cùng khả năng làm mới của tài khoản. Khi mở khóa, chỉ cho đăng nhập mới theo chính sách mật khẩu/MFA; không tự khôi phục phiên, credential làm mới hoặc bằng chứng đã bị thu hồi. Mở khóa không tự tắt MFA, đặt lại mật khẩu hay đổi vai trò. |
| Chỉ số và ngưỡng | Tại Identity/điểm kiểm đã xử lý trạng thái khóa/thu hồi: 0 xác thực/cấp mới/làm mới từ tài khoản còn khóa, 0 phiên/credential đã bị thu hồi được chấp nhận lại sau mở khóa. Phiên mới xác thực đúng sau mở khóa hoạt động theo quyền hiện hành. Không tự đặt ngưỡng lan truyền tới mọi service hoặc coi mọi token đã bị chặn tức thì. |
| Điều kiện đo | Tài khoản thử có nhiều phiên thuộc ba nhóm và tài khoản đối chứng, mốc khóa/thu hồi/mở khóa, build/cấu hình và cơ chế xác thực được định danh. Kiểm mật khẩu/MFA đúng khi còn khóa, replay/refresh cũ trước-sau mở khóa, phiên mới và sự kiện khóa/mở khóa bị gửi lại. Không dùng khóa tài khoản thực từ phê duyệt thiết kế. |
| Mức ưu tiên | A đã được chọn cho vòng đời phiên khi khóa bảo mật của mốc demo; chi tiết phép đo/giao thức thu hồi cần cụ thể hóa trước nghiệm thu. Chưa chọn người được khóa, lý do, ngưỡng thử sai hoặc thời hạn khóa. |
| Cách nghiệm thu | Đối chiếu trạng thái Identity, quyết định phiên/cấp mới và tác dụng phụ thực; khóa/mở khóa phải được thực hiện đúng thẩm quyền theo hợp đồng sẽ đặc tả. Chặn trong bộ kiểm không đạt bằng cách khóa tất cả tài khoản; mở khóa không đạt bằng cách chấp nhận credential cũ. App xử lý dữ liệu riêng tư khi nhận trạng thái theo chính sách đã duyệt. |
| Phương án B và đánh đổi | B chỉ chặn đăng nhập/làm mới mới, để phiên/quyền đã cấp tiếp tục tới hạn theo hợp đồng: ít gián đoạn hơn nhưng người đang giữ phiên bị lộ có thể vẫn thao tác. Không được mô tả B là đã ngăn toàn bộ truy cập tài khoản. A chặn sử dụng phiên cũ tại các điểm đã xử lý thu hồi, đổi lại người hợp lệ cũng cần đăng nhập lại sau mở khóa; B không được chọn. |
| Ranh giới | Truyền thu hồi và thời hạn khi khỏe/lỗi còn cần chốt riêng. Giữ ràng buộc 90/15/60: Core đã nhận căn cứ thu hồi phù hợp phải từ chối, không tiếp tục chỉ vì bằng chứng còn hạn; khi chưa nhận không tự hứa thu hồi tức thì. Không tự gia hạn quyền hoặc hủy/đảo/phát lại giao dịch Core, xóa tài khoản hay hủy hiệu lực vé từ sự kiện khóa này. |

Căn cứ: nguồn ghim `004-service-decomposition/spec.md` và ADR-0008 tại commit
`2a007797ac9ce542d9747aad0f44f3e430eec581` đã giao Identity sở hữu khóa tài khoản và yêu cầu kiểm
khóa tài khoản cho portfolio, chưa chốt chính sách phiên ở đây.
[OWASP — Account lockout](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#account-lockout)
lưu ý khóa do thử sai có thể bị lợi dụng gây từ chối dịch vụ;
[Session management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#session-expiration)
nhấn mạnh vô hiệu phiên ở server. Phạm vi mọi phiên và không hồi sinh sau mở khóa là lựa chọn dự án đã duyệt,
không phải quy định nguyên văn cho mọi loại khóa của nguồn. Không tự khóa tài khoản chỉ từ yêu cầu
quên mật khẩu hoặc suy quyền thu hồi nhân viên ở một rạp thành quyền khóa tài khoản toàn hệ thống.

### 9.14.11. Thời gian truyền thu hồi tới Core khi hệ thống khỏe

**Ngưỡng A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Tối đa 5 giây khi hệ thống khỏe”. Chỉ xét Identity, Core và đường đồng bộ thu hồi
hoạt động bình thường; hành vi khi mất kết nối còn cần chốt riêng.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Identity đã ghi bền việc thu hồi nhưng Core còn có thể chấp nhận token/bằng chứng quyền đã cấp. Cần giới hạn cửa sổ sử dụng quyền cũ sau logout, đổi/reset mật khẩu thành công hoặc khóa bảo mật theo phạm vi đã duyệt tại mục [9.14.1](#9141-phạm-vi-đăng-xuất-và-vô-hiệu-phiên), [9.14.9](#9149-vô-hiệu-phiên-sau-đổiđặt-lại-mật-khẩu)–[9.14.10](#91410-vòng-đời-phiên-khi-khóamở-khóa-bảo-mật). |
| Chỉ số và ngưỡng A đã duyệt | Tối đa 5 giây từ mốc Identity ghi bền việc thu hồi đến khi mọi điểm kiểm quyền Core trong topology thử áp dụng thu hồi. Từ hạn đó, 0 yêu cầu mới qua điểm kiểm quyền được chấp nhận bằng credential thuộc phạm vi thu hồi. Không chờ token tự hết hạn để coi đã truyền thu hồi. |
| Căn cứ và đánh đổi | Chọn theo rủi ro sử dụng phiên bị lộ để thao tác giao dịch: giới hạn cửa sổ ở mức vài giây, đồng thời cho phép đồng bộ có độ trễ thay vì hứa tức thì. Mốc 5 giây là mục tiêu thiết kế portfolio đã duyệt, chưa có kết quả đo tính khả thi, không phải số OWASP quy định và không kế thừa mốc 5 giây của Mobile/AI. B để mở con số tới khi có thiết kế đường thu hồi và phép đo không được chọn. |
| Điều kiện đo | Identity/Core và đường đồng bộ thực trong môi trường thử, công bố build/topology/tải/cấu hình cache và sai số đồng hồ/phép quan sát; liệt kê mọi instance/điểm kiểm quyền thuộc phạm vi. Credential còn hạn trước bài; kiểm riêng logout một phiên, đổi/reset và khóa toàn tài khoản, có phiên/tài khoản đối chứng ngoài phạm vi. Không dùng token tự hết hạn trong cửa sổ đo làm bằng chứng truyền thu hồi. |
| Mức ưu tiên | A đã được chọn cho nghiệm thu truyền thu hồi Identity → Core của mốc demo; chưa chọn cơ chế, thư viện, chu kỳ đồng bộ hoặc hạ tầng. |
| Cách nghiệm thu | Đối chiếu mốc ghi bền tại Identity và mốc áp dụng tại từng điểm kiểm Core, thử dùng lại credential cũ sau hạn và kiểm tác dụng phụ Core. Báo trường hợp chậm nhất cùng sai số đo, không dùng p95 che ca vượt hạn. Phiên/tài khoản ngoài phạm vi vẫn hoạt động đúng quyền; sau mở khóa chỉ phiên mới hợp lệ được dùng. Số lần lặp/cách ghi nhận mốc chốt trước chạy. |
| Ranh giới còn mở | Chưa áp ngưỡng cho các service khác hoặc thiết bị offline; chưa chốt hành vi khi kênh thu hồi lỗi/mất sự kiện, liên kết phiên với bằng chứng quyền và yêu cầu đã qua điểm kiểm trước hạn. Không tự đảo giao dịch đã ghi nhận hoặc bỏ xác minh callback thanh toán. Core đã nhận thu hồi phải từ chối theo phạm vi ngay từ các lần kiểm sau đó, không chờ đủ 5 giây; giữ các quyết định 90/15/60 khi Identity gián đoạn. |

Căn cứ đối chiếu ngày 2026-11-22:
[OWASP — REST Security, JWT](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html#jwt)
nêu token có thể còn hạn sau khi phiên kết thúc và khuyến nghị cơ chế vô hiệu tại API.
Nguồn hỗ trợ nhu cầu thu hồi trước hạn token; không quy định mục tiêu 5 giây đã được dự án duyệt hoặc chứng minh hệ thống đã đạt.

### 9.14.12. Giữ và đồng bộ bù thu hồi khi đường truyền lỗi

**Phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Giữ bền và tự đồng bộ bù”. Cụ thể hóa phần còn mở của mục [9.14.11](#91411-thời-gian-truyền-thu-hồi-tới-core-khi-hệ-thống-khỏe);
không áp hạn 5 giây khi Identity/Core/đường đồng bộ đang gián đoạn.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Identity đã ghi bền thu hồi nhưng chưa chuyển được tới Core hoặc mất phản hồi xác nhận; có thể restart service trước khi đường truyền phục hồi. Không để quyết định thu hồi bị quên hoặc báo hoàn tất tại Core khi chưa có căn cứ. |
| Phương án A đã duyệt | Giữ bền thông tin cần đồng bộ gắn với quyết định thu hồi, tự đồng bộ bù khi phụ thuộc phục hồi và xác nhận Core đã áp dụng. Retry phải có giới hạn tài nguyên/nhịp chờ theo hợp đồng sẽ chốt; hết đợt retry không tự xóa quyết định chưa xử lý hoặc coi thành công. Không yêu cầu người vận hành phát lại thủ công trong đường phục hồi bình thường. |
| Chỉ số và ngưỡng | Trong bộ ca: 0 quyết định thu hồi đã ghi bền bị mất qua lỗi/restart, 0 báo Core đã áp dụng khi chưa có bằng chứng, 0 sự kiện lặp/cũ làm sống lại phiên hoặc quyền đã thu hồi. Hạn hoàn tất đồng bộ bù và cấu hình retry chưa đề xuất số ở vòng này; không tự lấy 5 giây tính lại từ lúc khỏe để thay cam kết gốc. |
| Điều kiện đo | Môi trường thử và dữ liệu tài khoản mẫu; định danh quyết định, phiên/phạm vi, phiên bản/thứ tự và mốc Identity/Core. Kiểm mất kết nối, mất phản hồi sau áp dụng, restart khi còn chờ, gửi lặp và đảo thứ tự khóa/mở khóa. Có tài khoản/phiên đối chứng, công bố build/topology và khoảng gián đoạn. |
| Mức ưu tiên | A đã được chọn cho nghiệm thu đường thu hồi chịu lỗi của mốc demo; chưa chọn công nghệ lưu/chuyển sự kiện hoặc cho phép gây lỗi môi trường thật. |
| Cách nghiệm thu | Sau nối lại, đối chiếu tập quyết định đã ghi bền với tập Core áp dụng, kiểm sử dụng lại credential và trạng thái đối chứng. Bằng chứng thể hiện rõ đang chờ/đã áp dụng, lần lặp không tạo hiệu lực mới và trạng thái cũ không ghi đè mới. Báo riêng thời gian tồn đọng từ mốc gốc và thời gian xử lý bù, không loại ca lỗi khỏi hồ sơ. |
| Đánh đổi và phương án B | A thêm đường phục hồi tự động nhưng giảm nguy cơ bỏ sót thu hồi sau lỗi. B chỉ giữ bền và yêu cầu chủ dự án chạy đồng bộ bù theo runbook; ít tự động hóa hơn nhưng phụ thuộc can thiệp. Cả hai không cho phép làm mất quyết định đã ghi bền; B không được chọn. |
| Ranh giới | Khi Core chưa nhận thu hồi, tiếp tục áp dụng đúng chính sách quyền cũ đã duyệt; không tự gia hạn bằng chứng, thay 90/15/60 hoặc hứa chặn tức thì. Khi đã nhận thu hồi hợp lệ thì từ chối tương ứng. Quy tắc quyền khách/quản trị khi mất độ mới, hạn bù, cảnh báo và thao tác đang chạy còn cần chốt riêng. Không tự mở lại phiên cũ sau mở khóa, hủy đơn/vé hoặc replay giao dịch. |

Căn cứ: quyết định kiểm quyền/thu hồi trong `004-service-decomposition/decisions.md` tại commit
`2a007797ac9ce542d9747aad0f44f3e430eec581` yêu cầu xác thực sự kiện, chống lặp, bảo vệ thứ tự và
giữ cửa sổ quyền cũ khi mất kênh cập nhật. Giữ bền/tự đồng bộ bù là lựa chọn bổ sung đã duyệt để kiểm chứng phục hồi;
không dùng nguồn này làm bằng chứng cơ chế đã triển khai hoặc mốc 5 giây áp cho sự cố.

### 9.14.13. Điều kiện kết thúc suy giảm của đường thu hồi

**Phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Xác nhận đã bắt kịp rồi báo khỏe”. Chốt điều kiện an toàn để trở lại chế độ khỏe,
chưa đặt thời hạn hoàn tất đồng bộ bù hoặc thay chính sách quyền trong lúc gián đoạn.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Kết nối đã trở lại nhưng Core còn thiếu quyết định thu hồi phát sinh trong thời gian lỗi. Không coi việc nối mạng thành công là bằng chứng quyền đã cập nhật. |
| Phương án A đã duyệt | Chỉ công bố đường thu hồi ở phạm vi liên quan đã trở lại chế độ khỏe khi Core xác nhận đã áp dụng đầy đủ tới mốc nguồn được xác định tin cậy và đường cập nhật tiếp tục hoạt động. Trong lúc đồng bộ bù, giữ trạng thái suy giảm và chính sách quyền cũ đã duyệt, không tự nâng quyền hoặc đặt lại tuổi bằng chứng. Không đòi hàng đợi toàn hệ thống bằng 0 nếu vẫn có sự kiện mới phát sinh; cách xác định mốc/bao phủ cần đặc tả. |
| Chỉ số và ngưỡng | Trong bộ ca: 0 lần báo đã bắt kịp khi còn thiếu thu hồi trước mốc xác nhận, 0 credential đã bị Core thu hồi được chấp nhận lại, 0 tự gia hạn quyền cũ khi nối lại. Không đặt độ trễ bù mới từ vòng này hoặc coi điều kiện khỏe là cách loại bỏ ca vượt hạn 5 giây khi hệ thống vốn khỏe. |
| Điều kiện đo | Tạo thu hồi trong lúc mất kết nối, nối lại nhưng trì hoãn một phần cập nhật/xác nhận; kiểm thêm sự kiện lặp, sai thứ tự và sự kiện mới đến trong lúc bù. Ghi mốc nguồn, phạm vi/instance Core, mốc áp dụng và trạng thái vận hành; có phạm vi đối chứng đã đủ căn cứ. |
| Mức ưu tiên | A đã được chọn cho nghiệm thu phục hồi đường thu hồi của mốc demo. Chưa chọn giao thức xác nhận, công cụ hoặc chi tiết kiểm độ mới quyền theo nhóm. |
| Cách nghiệm thu | Khi chỉ kết nối trở lại mà còn thiếu dữ liệu, trạng thái vẫn là đang đồng bộ bù. Khi đã xác nhận bao phủ mốc nguồn và cập nhật tiếp tục hoạt động, cho phép kết thúc suy giảm ở phạm vi tương ứng; quyền bị thu hồi bị chặn, đối chứng hợp lệ hoạt động. Tiếp tục soát/giao bằng bằng chứng còn hợp lệ theo 90/15/60 trong lúc bù vẫn được kiểm theo quyết định đã duyệt; không bắt dừng toàn hệ thống để đạt bài. |
| Đánh đổi và phương án B | A cần bằng chứng bắt kịp nên có thể báo suy giảm lâu hơn thời gian mất kết nối. B báo khỏe ngay khi kết nối lại, đơn giản hơn nhưng có thể che khoảng thiếu thu hồi; B không được chọn. Hạn bù, cảnh báo tồn đọng, hành vi quyền khách và yêu cầu đang chạy vẫn cần chốt riêng; nhóm quản trị rủi ro cao đã có nguyên tắc chặn khi Identity lỗi trong nguồn kiến trúc. |

Căn cứ: yêu cầu tự đồng bộ bù đã duyệt tại mục [9.14.12](#91412-giữ-và-đồng-bộ-bù-thu-hồi-khi-đường-truyền-lỗi) và nguyên tắc không dùng quyền đã thu hồi,
không tự gia hạn bằng chứng ở nguồn kiến trúc đã ghim. Điều kiện xác nhận bắt kịp là lựa chọn dự án đã duyệt,
không phải bằng chứng đường đồng bộ đã vận hành hoặc thay mục tiêu tiếp tục soát khi Identity lỗi.

### 9.14.14. Quyền khách hàng khi không xác minh được phiên hiện hành

**Phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Tạm chặn khi chưa kiểm được phiên”. Áp dụng cho yêu cầu mới cần tài khoản khách hàng
khi không đủ căn cứ kiểm phiên còn hiệu lực/thu hồi; không tự áp cửa sổ 90 phút của nhân viên cho khách.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Token khách còn hạn nhưng Identity/đường cập nhật lỗi hoặc đang đồng bộ bù, khiến điểm kiểm không xác minh được trạng thái phiên hiện hành. Cần tránh đọc dữ liệu riêng tư hoặc thực hiện giao dịch từ phiên có thể đã bị thu hồi. |
| Phương án A đã duyệt | Tạm từ chối riêng yêu cầu mới cần tài khoản khi không xác minh được phiên hiện hành; token còn hạn/chữ ký đúng không phải căn cứ duy nhất để bỏ kiểm trạng thái thu hồi trong tình huống này. Báo tạm gián đoạn/chưa xác minh được, không khẳng định tài khoản chắc chắn bị khóa hoặc phiên chắc chắn hết hạn. Có thể tiếp tục nếu có đường kiểm tin cậy khác đủ căn cứ theo hợp đồng; chưa chọn cơ chế hoặc bắt gọi Identity ở mọi request. |
| Chỉ số và ngưỡng | Trong bộ ca mất căn cứ kiểm phiên: 0 yêu cầu mới cần tài khoản khách được cho phép chỉ dựa vào token cũ còn hạn, 0 rò dữ liệu riêng tư/tác dụng phụ giao dịch mới từ các yêu cầu bị chặn. Phiên còn hợp lệ và đã kiểm hiện hành ở điều kiện đối chứng vẫn dùng đúng quyền; không đạt bằng cách chặn mọi người dùng. |
| Điều kiện đo | Credential khách còn hạn và hợp lệ trước bài; gây mất khả năng kiểm phiên, tạo thu hồi trong thời gian lỗi và kiểm trong/sau đồng bộ bù. Bao phủ xem đơn/vé riêng, giữ ghế/lập đơn và yêu cầu hủy qua trực tiếp/Agent theo quyền hiện có; kiểm đường công khai, đối chứng và callback bằng danh tính dịch vụ riêng. Công bố build/topology, trạng thái nguồn quyền và mốc kiểm. |
| Mức ưu tiên | A đã được chọn cho nghiệm thu kiểm quyền khách hàng chịu lỗi của mốc demo; danh mục endpoint và bằng chứng độ mới phải đặc tả trước thực thi. |
| Cách nghiệm thu | Đối chiếu quyết định kiểm quyền và trạng thái Core, không chỉ thông báo UI; trong khoảng thiếu căn cứ không có đọc dữ liệu riêng/tác dụng phụ mới được cấp từ token cũ. Sau xác minh hiện hành, phiên hợp lệ tiếp tục đúng quyền, phiên đã thu hồi bị từ chối. Các lỗi này được báo là suy giảm dịch vụ phù hợp, không tự chuyển thành kết quả nghiệp vụ thành công. |
| Đánh đổi và phương án B | A giảm khả dụng của thao tác cần tài khoản trong sự cố, đổi lại không thêm cửa sổ sử dụng quyền khách cũ chưa được duyệt. B cho phép quyền cũ trong một cửa sổ hữu hạn cần duyệt thêm độ dài/phạm vi/rủi ro; B không được chọn. |
| Ranh giới | Không chặn tra cứu công khai chỉ vì thiếu phiên khách; không mở quyền dữ liệu riêng cho Agent dưới danh nghĩa khách chưa đăng nhập. Giữ quy tắc QR đã lưu trên Customer Mobile, khóa/xóa cache theo trạng thái app đã duyệt và soát bằng Core online. Callback/đối soát đã xác thực theo danh tính dịch vụ không phụ thuộc phiên khách; không tự hủy hold/đơn/vé, đảo tiền hoặc replay giao dịch vì lỗi kiểm phiên. Không thay chính sách quyền nhân viên 90/15/60 hoặc nguyên tắc nhóm quản trị rủi ro cao. |

Căn cứ thiết kế: BR-02 và phạm vi dữ liệu khách hàng trong mô hình sản phẩm; mục [9.14.9](#9149-vô-hiệu-phiên-sau-đổiđặt-lại-mật-khẩu)–[9.14.13](#91413-điều-kiện-kết-thúc-suy-giảm-của-đường-thu-hồi)
đã chốt thu hồi/đồng bộ nhưng chưa cho phép cửa sổ dùng quyền khách cũ. Nguồn kiến trúc đã ghim
chỉ mở cửa sổ 90/15/60 cho soát vé/giao combo và đã chốt chặn nhóm quản trị rủi ro cao khi Identity lỗi.
A là đánh đổi bảo mật–khả dụng riêng cho khách hàng đã được duyệt, chưa phải hành vi code được kiểm chứng.

### 9.14.15. Lệnh ghi đang chạy đồng thời với thu hồi

**Phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Chặn nếu thu hồi có hiệu lực trước khi ghi”. Áp dụng cho lệnh ghi dựa trên phiên/quyền người dùng
tại Core; chốt thứ tự hiệu lực, chưa chọn kỹ thuật giao dịch hoặc khóa dữ liệu.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Lệnh đã qua kiểm quyền ban đầu nhưng chưa ghi nhận giao dịch thành công thì Core áp dụng thu hồi hợp lệ. Cần quyết định lệnh nào còn được phép ghi thay vì suy mọi lệnh đang chạy đều được hoàn tất hoặc đều phải đảo ngược. |
| Phương án A đã duyệt | Việc áp dụng thu hồi và quyết định ghi nhận lệnh phải có thứ tự nhất quán tại Core. Nếu thu hồi có hiệu lực trước mốc ghi nhận giao dịch thành công, lệnh thuộc phạm vi thu hồi không được ghi thành công dựa vào quyền cũ. Nếu giao dịch đã ghi nhận thành công trước thu hồi thì giữ kết quả, không tự hủy/hoàn. Kiểm quyền ban đầu không đủ để vượt qua thu hồi có hiệu lực trước khi ghi. |
| Chỉ số và ngưỡng | Trong bộ ca: 0 giao dịch dựa vào quyền cũ được ghi nhận thành công sau thu hồi có hiệu lực theo thứ tự Core; 0 giao dịch đã ghi nhận trước bị đảo chỉ do thu hồi; 0 tác dụng phụ trùng do retry sau kết quả chưa rõ. Không dùng thứ tự nhận phản hồi tại client hoặc đồng hồ khác máy để suy thứ tự giao dịch. |
| Điều kiện đo | Dữ liệu mẫu, credential còn hợp lệ trước bài; chủ động dừng lệnh sau kiểm quyền đầu nhưng trước ghi nhận, áp dụng thu hồi rồi cho chạy tiếp. Kiểm thứ tự ngược lại, hai việc tranh chấp đồng thời, thu hồi khác phiên/phạm vi và mất phản hồi sau ghi nhận. Công bố build/topology, mốc quyết định và dữ liệu Core; không dùng mỗi thời điểm log UI làm bằng chứng. |
| Mức ưu tiên | A đã được chọn cho nghiệm thu lệnh ghi đồng thời với thu hồi ở mốc demo; danh sách lệnh và điểm ghi nhận cần đặc tả theo từng giao dịch. |
| Cách nghiệm thu | Đối chiếu thứ tự có thẩm quyền, kết quả lệnh và trạng thái bền vững Core: lệnh sau thu hồi bị từ chối/không tạo tác dụng phụ mới; lệnh trước giữ đúng kết quả; đối chứng ngoài phạm vi hoạt động. Lệnh đang chờ hoặc mất phản hồi phải được tra cứu theo định danh, không tự báo chưa xảy ra hoặc replay như lệnh mới. |
| Đánh đổi và phương án B | A cần phối hợp kiểm quyền với ghi nhận để tránh khoảng hở giữa kiểm tra và sử dụng quyền. B cho lệnh đã qua kiểm quyền đầu tiếp tục hoàn tất dù Core áp dụng thu hồi trước khi ghi, đơn giản hơn nhưng chấp nhận tác dụng phụ sau thu hồi; B không được chọn. |
| Ranh giới | Chỉ xét thu hồi đã tới và có hiệu lực tại Core, không hứa biết quyết định chưa tới trong sự cố. Không bắt gọi Identity cho mỗi lượt soát, thay 90/15/60 hoặc thu hồi quyền ngoài phạm vi. Không đảo tác dụng phụ bên ngoài đã xảy ra; callback thanh toán/đối soát theo danh tính dịch vụ và quy tắc giao dịch riêng vẫn được xử lý. Luồng nhiều bước không tự được phép khởi tạo bước mới bằng quyền đã thu hồi. Dữ liệu đã gửi trước đó không thể được coi là tự thu hồi từ client theo quyết định này. |

Căn cứ: Core sở hữu quyết định quyền và kết quả giao dịch; mục [9.14.11](#91411-thời-gian-truyền-thu-hồi-tới-core-khi-hệ-thống-khỏe)–[9.14.14](#91414-quyền-khách-hàng-khi-không-xác-minh-được-phiên-hiện-hành) giữ mở lệnh đang chạy.
A là lựa chọn xử lý thứ tự đồng thời của dự án đã duyệt; chưa phải bảo đảm đã triển khai, không suy việc đổi mật khẩu,
khóa hoặc logout thành yêu cầu hoàn tiền/hủy vé đã phát hành.

### 9.14.16. Bộ nghiệm thu phiên và thu hồi

**Phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Đủ 6 nhóm, mọi ca đúng kỳ vọng”. Gom các yêu cầu đã duyệt tại mục [9.14.1](#9141-phạm-vi-đăng-xuất-và-vô-hiệu-phiên) và
[9.14.8](#9148-nguyên-tắc-tự-hết-hạn-phiên-đăng-nhập)–[9.14.15](#91415-lệnh-ghi-đang-chạy-đồng-thời-với-thu-hồi) thành sáu nhóm kiểm; không thay phạm vi hoặc ngưỡng của từng yêu cầu.

| Nhóm | Tình huống và kết quả cần kiểm |
|---|---|
| SES-01 — Hết hạn phiên | Kiểm trước/đúng/sau hạn idle và tuổi tối đa cho ba nhóm theo mục [9.14.8](#9148-nguyên-tắc-tự-hết-hạn-phiên-đăng-nhập); tác vụ nền không kéo dài phiên, xác thực lại/MFA đúng vai trò, ngoại lệ nhân viên khi Identity lỗi đúng phạm vi đã duyệt. |
| SES-02 — Phạm vi vô hiệu | Logout chỉ phiên hiện tại; đổi/reset mật khẩu thành công hoặc khóa bảo mật thu hồi mọi phiên cũ. Yêu cầu quên mật khẩu/thay mật khẩu thất bại không tự thu hồi; mở khóa không hồi sinh phiên cũ. Có phiên/tài khoản đối chứng và đăng nhập mới hợp lệ. |
| SES-03 — Truyền thu hồi khi khỏe | Credential còn hạn, mọi điểm kiểm Core trong topology công bố áp dụng thu hồi trong ≤ 5 giây từ mốc Identity ghi bền. Kiểm từng loại kích hoạt và trường hợp chậm nhất; không dùng p95 hoặc token tự hết hạn thay bằng chứng. |
| SES-04 — Lỗi và đồng bộ bù | Mất kết nối, mất xác nhận sau áp dụng, restart khi còn chờ, sự kiện lặp/đảo thứ tự; không mất thu hồi hoặc báo đã bắt kịp khi còn thiếu. Chỉ kết thúc suy giảm sau xác nhận mốc nguồn; báo thời gian bù thực tế, chưa có ngưỡng thời gian bù được duyệt. |
| SES-05 — Lệnh đang chạy | Kiểm cả thứ tự thu hồi trước ghi nhận, ghi nhận trước thu hồi và tranh chấp đồng thời; chặn lệnh theo quyền cũ khi thu hồi thắng thứ tự, giữ giao dịch đã ghi nhận trước đó. Mất phản hồi/retry không tạo tác dụng phụ trùng. |
| SES-06 — Ranh giới khi suy giảm | Khách bị chặn yêu cầu cần tài khoản khi không xác minh được phiên; nhân viên tiếp tục theo bằng chứng hợp lệ/90–15–60, thu hồi đã nhận hoặc hết hạn vẫn bị từ chối. Đối chiếu nguyên tắc chặn nhóm quản trị rủi ro cao khi Identity lỗi; tra cứu công khai, QR đã lưu và callback/đối soát dùng bằng chứng riêng giữ hành vi đã duyệt. |

**Chỉ số/ngưỡng A đã duyệt:** mọi ca trong manifest sáu nhóm phải đạt kết quả kỳ vọng;
0 vi phạm an toàn, giữ nguyên các ngưỡng thời gian đã duyệt. Ca chưa chạy/thiếu bằng chứng phải báo rõ,
không tính đạt hoặc dùng tỷ lệ tổng bù ca lỗi. Sáu nhóm không có nghĩa chỉ chạy sáu ca.
**Điều kiện đo:** môi trường thử cô lập, dữ liệu mẫu, build/cấu hình/topology và manifest ánh xạ từng ca
tới yêu cầu/điểm kiểm được công bố; kiểm tại server và trạng thái bền vững, có đối chứng hợp lệ.
**Mức ưu tiên:** A đã được chọn cho nghiệm thu phần phiên/thu hồi của demo.
**Cách nghiệm thu:** lưu kết quả từng ca, mốc thời gian, quyết định quyền và tác dụng phụ đã loại bí mật;
thiếu phạm vi/instance hoặc chưa chốt tham số bắt buộc thì chưa đủ bằng chứng cho phần tương ứng.
Số lần lặp, chi tiết dữ liệu, độ mới phiên và hạn bù/retry vẫn cần cụ thể hóa trước chạy;
không coi chọn bộ kiểm là thiết kế toàn bộ bảo mật đã hoàn chỉnh.
Phương án B chỉ kiểm luồng bình thường ít công hơn nhưng thiếu bằng chứng các nhánh lỗi/đồng thời;
B không được chọn. Bộ nhóm là lựa chọn kiểm chứng các quyết định dự án đã duyệt, không phải chứng nhận bảo mật.
