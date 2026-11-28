# Giám sát và cảnh báo vận hành

[← Tổng quan NFR](README.md)

## 9.12. NFR-OPS-01 - Phát hiện và cảnh báo sự cố có ảnh hưởng tới demo

**Hướng và mức ưu tiên: Đã duyệt.** Ngày 2026-11-17, chủ sản phẩm trả lời
“tôi đồng ý với đề xuất của bạn” cho phương án A: tự động phát hiện/cảnh báo các sự cố quan trọng,
phân loại sự cố AI riêng, gom thông báo trùng và báo khi đã phục hồi, là yêu cầu bắt buộc cho demo.
Chủ dự án nhận cảnh báo thay vì chỉ phát hiện khi tự mở dashboard; chưa có cam kết trực 24/7 hoặc uptime.
**Kênh đã duyệt:** tiếp đó, chủ sản phẩm đồng ý với đề xuất A — nhận cảnh báo qua email.
Nội dung có phần bị ảnh hưởng, thời điểm phát hiện, mã sự cố và bước kiểm tra tiếp theo;
không chứa nội dung chat hoặc dữ liệu vé nhạy cảm. Chưa cần cung cấp địa chỉ nhận hoặc chọn nhà cung cấp.
Mốc nhận email tối đa 5 phút cho sự cố Core/đặt trực tiếp kéo dài đã được duyệt bên dưới;
điều kiện kích hoạt chi tiết, phân chia thời gian từng chặng và cách nghiệm thu vẫn cần xác định.

| Trường | Nội dung |
|---|---|
| Mục tiêu | Biết khi hành trình chính không hoạt động hoặc có dấu hiệu sai giao dịch để bắt đầu kiểm tra; tránh nhiễu do báo mọi log lỗi. |
| Tình huống | Core/luồng đặt vé trực tiếp không dùng được hoặc phát hiện vi phạm trạng thái giao dịch. AI chính/dự phòng không khả dụng được phân loại riêng; không tự coi toàn nền tảng ngừng hoạt động khi đường trực tiếp vẫn dùng được. |
| Kênh và nội dung đã duyệt | Email gửi tới chủ dự án; có phần bị ảnh hưởng, thời điểm, mã sự cố và bước kiểm tra tiếp theo, theo giới hạn dữ liệu NFR-PRIV-01. Địa chỉ, cơ chế gửi và nhà cung cấp chưa chọn; chưa cấp quyền gửi email thật từ hội thoại phân tích này. |
| Chỉ số đề xuất | Thời gian từ sự cố kiểm soát tới phát hiện, tới cảnh báo được chuyển và nhận; số sự cố bỏ sót, cảnh báo sai/lặp và thông báo phục hồi. Theo dõi riêng thành công gửi cảnh báo với việc người vận hành tiếp nhận/xử lý. |
| Hành vi đã duyệt và ngưỡng còn mở | Tự động cảnh báo, phân loại AI riêng, gom trùng và báo phục hồi. Với Core/luồng đặt trực tiếp không dùng được liên tục, hộp thư thử nhận email trong ≤ 5 phút từ khi sự cố bắt đầu nếu giám sát và đường email hoạt động. Nhịp kiểm ≤ 60 giây, mỗi lượt ≤ 10 giây, mở sau 2 lỗi/phục hồi sau 2 thành công liên tiếp đã duyệt tại mục [9.12.2](#9122-nhịp-kiểm-tra-và-xác-nhận-lỗi-khả-dụng). Đề xuất kiểm chứng: mọi loại sự cố trong bộ nghiệm thu được phát hiện/thông báo đúng. Phạm vi kiểm Core và Agent, kích hoạt cảnh báo AI, gom trùng và bộ ca đã duyệt ở các mục bên dưới. Hợp đồng bộ kiểm, đường email và chi tiết chống trùng còn mở. Không tự chọn uptime 99,9% hoặc lấy HTTP 200 làm bằng chứng đặt vé đúng. |
| Điều kiện đo đề xuất | Môi trường thử cô lập, ghi phiên bản/cấu hình và thời điểm sự cố; dữ liệu thử có kết quả mong đợi, không gây lỗi vào daily DB hoặc tài nguyên phiên khác. Xác định hành trình/tín hiệu kiểm tra và bằng chứng đầu nhận cảnh báo; không gọi cổng thanh toán/LLM thật hoặc tạo giao dịch tốn phí từ việc duyệt yêu cầu này. |
| Mức ưu tiên | Bắt buộc cho demo công khai, theo phê duyệt hướng giám sát/cảnh báo. |
| Cách nghiệm thu đề xuất | Tạo từng lỗi có kiểm soát, đối chiếu phát hiện với kết quả nghiệp vụ/ảnh hưởng người dùng, xác minh cảnh báo tới kênh thử và thông báo phục hồi. Kiểm phân loại sự cố AI, tránh nhiều cảnh báo trùng một sự cố; kiểm cả lỗi của cơ chế theo dõi/gửi cảnh báo. Giữ mốc thời gian và nội dung kỹ thuật theo NFR-PRIV-01. |
| Giới hạn và phần chưa chốt | Địa chỉ/nhà cung cấp gửi, hợp đồng health, dữ liệu thử, lưu trạng thái và tham số retry/chống lặp còn cần thiết kế. Phạm vi kiểm Core, quy tắc gom, cảnh báo/phục hồi AI và bộ OBS đã duyệt tại mục [9.12.1](#9121-thông-báo-theo-vòng-đời-sự-cố)–[9.12.13](#91213-bộ-nghiệm-thu-giám-sát-và-cảnh-báo); mốc demo chưa cam kết thời gian phản ứng con người hoặc trực 24/7 theo mục [9.12.6](#9126-phạm-vi-phản-ứng-của-chủ-dự-án). Không thay telemetry bằng nguồn giao dịch và không suy cảnh báo đã gửi thành sự cố đã xử lý. Chưa cấu hình hoặc gửi cảnh báo thật. |

Căn cứ nghiên cứu ngày 2026-11-17: [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
khuyến nghị cảnh báo có thể hành động, ưu tiên ảnh hưởng người dùng và kiểm hành vi từ bên ngoài;
HTTP thành công vẫn có thể trả kết quả sai. Danh sách sự cố, cách chống lặp và thông báo phục hồi ở đây
là lựa chọn của dự án, không phải cấu hình do nguồn quy định sẵn; quy tắc thực thi chi tiết chưa chốt.

**Mốc thiết kế cảnh báo đã duyệt:** ngày 2026-11-17, chủ sản phẩm đồng ý với đề xuất A — tối đa 5 phút.
Với sự cố nghiêm trọng làm Core/luồng đặt vé trực tiếp
không dùng được liên tục, mục tiêu là email cảnh báo đến hộp thư thử trong tối đa **5 phút** từ lúc sự cố bắt đầu,
trong điều kiện hệ thống giám sát và đường gửi/nhận email vẫn hoạt động. Đo riêng thời gian phát hiện,
gửi, nhận; không dùng thời điểm bên gửi nhận yêu cầu làm bằng chứng hộp thư đã nhận.
Đây là mục tiêu chất lượng do chủ sản phẩm chọn cho demo công khai, ưu tiên biết sự cố sớm;
phương án 15 phút đã được cân nhắc nhưng không được chọn. Mốc 5 phút không phải chuẩn ngành,
không lấy từ ví dụ của Google SRE và chưa có bằng chứng dự án đáp ứng.
Phê duyệt mốc 5 phút ban đầu chưa đặt lịch kiểm tra hoặc số lỗi liên tiếp; các giá trị này được duyệt
tiếp tại mục [9.12.2](#9122-nhịp-kiểm-tra-và-xác-nhận-lỗi-khả-dụng). Nhà cung cấp còn mở; phạm vi không cam kết thời gian đọc/xử lý của chủ dự án
được duyệt tiếp tại mục [9.12.6](#9126-phạm-vi-phản-ứng-của-chủ-dự-án);
các điều kiện thực thi phải được kiểm chứng riêng, không dùng để tự kéo dài mốc tính thời gian.

### 9.12.1. Thông báo theo vòng đời sự cố

**Phương án A đã duyệt ngày 2026-11-20:** chủ sản phẩm trả lời “tôi đồng ý” cho đề xuất
một thông báo mở, gom phát hiện lặp vào cùng sự cố, một thông báo khi xác nhận phục hồi,
chưa nhắc định kỳ ở mốc đầu; lỗi tái phát sau phục hồi là sự cố mới.
**Cách gom A đã duyệt ngày 2026-11-20:** tiếp đó, chủ sản phẩm trả lời “tôi đồng ý” cho
gom theo môi trường, hành trình và nhóm vấn đề; giữ cùng sự cố khi bước lỗi thay đổi,
phân loại AI/bộ kiểm/bảo mật riêng, đóng sau hai lượt kiểm đầy đủ thành công và tạo mã mới khi tái phát sau đóng.
Chi tiết thực thi/nghiệm thu bên dưới còn cần chốt; phê duyệt không đổi mục tiêu nhận cảnh báo
Core/đặt trực tiếp ≤ 5 phút hoặc tự chọn nhà cung cấp/kênh gửi.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Sự cố tiếp diễn qua nhiều lượt kiểm tra, phục hồi rồi tái phát; cần biết trạng thái mới mà không tạo một email mới cho từng lỗi/request/lượt phát hiện giống nhau. |
| Phương án A đã duyệt | Trong cùng một sự cố đang mở, tạo một thông báo logic khởi phát; khi đủ tiêu chí phục hồi, tạo một thông báo logic phục hồi gắn cùng mã sự cố. Không tạo nhắc lại định kỳ ở mốc portfolio đầu. Theo dõi/cập nhật trạng thái kỹ thuật vẫn tiếp tục. |
| Chỉ số và ngưỡng đề xuất | Với bộ kiểm đường gửi khỏe: mỗi sự cố có đúng một thông báo logic mở và, khi phục hồi được xác nhận, đúng một thông báo logic phục hồi; không có job/thông báo mới chỉ vì phát hiện lặp. Đếm riêng email nhận thực tế và bản trùng. Email mở cho Core/đặt trực tiếp không dùng được liên tục vẫn đến hộp thư thử ≤ 5 phút từ sự cố bắt đầu, không từ lúc dedup xong. |
| Nhận diện và tái phát | Phạm vi/khóa nhận diện cùng sự cố phải được định trước theo môi trường, thành phần/hành trình và nhóm tín hiệu thích hợp; không dùng mỗi request làm sự cố mới hoặc gộp mọi lỗi khác nhau để đạt số lượng ít. AI-only giữ phân loại riêng. Sau khi đã xác nhận phục hồi/đóng, lỗi mới thỏa điều kiện mở là sự cố mới với định danh khác. Quy tắc hai lượt cho lỗi khả dụng đã duyệt tại mục [9.12.2](#9122-nhịp-kiểm-tra-và-xác-nhận-lỗi-khả-dụng); chi tiết fingerprint và xử lý chập chờn còn cần chốt. |
| Gom sự cố — nguyên tắc A đã duyệt | Nhận diện theo môi trường + hành trình được kiểm + nhóm vấn đề. Trong một môi trường, các lỗi khả dụng liên tiếp của hành trình đọc suất/ghế → giữ ghế → tạo/đọc đơn thuộc cùng sự cố đang mở, dù bước báo lỗi thay đổi; giữ từng bước/lỗi làm bằng chứng, không khẳng định chúng có chung nguyên nhân. Không tách theo request, tài khoản thử, mã đơn hoặc endpoint. Lỗi chỉ ảnh hưởng AI, lỗi bộ kiểm/cấp phát dữ liệu và vi phạm bảo mật/tính đúng đắn là các nhóm riêng; không gộp vào khả dụng Core để che tín hiệu. |
| Chỉ số/ngưỡng gom sự cố đề xuất | Tối đa một sự cố đang mở cho cùng khóa môi trường–hành trình–nhóm vấn đề; phát hiện lặp/đổi bước lỗi không sinh thêm thông báo mở hoặc reset mốc bắt đầu. Chỉ xác nhận phục hồi phạm vi này khi toàn bộ lượt kiểm bắt buộc thành công hai lần liên tiếp; một API xanh hoặc kết quả thiếu không đủ đóng. Sau khi đã đóng, lỗi mới đủ điều kiện mở có mã sự cố mới. Không gộp hai môi trường hoặc các nhóm vấn đề khác nhau chỉ để giảm số email. |
| Nghiệm thu gom sự cố đề xuất | Trong điều kiện đo của mục này, gây lỗi đọc rồi lỗi ghi khi hành trình chưa phục hồi: cùng một mã sự cố/thông báo mở, có đủ lịch sử các bước lỗi. Kiểm lỗi → thành công → lỗi không đóng/mở lại; đủ hai lượt đầy đủ thành công mới đóng, tái phát sau đóng tạo mã mới. Gây AI-only, lỗi fixture/bộ kiểm và cùng lỗi ở môi trường khác để xác nhận tách nhóm; thiếu kết quả không được báo phục hồi. Đối chiếu sự cố, thông báo logic và mốc nhận email; mức ưu tiên kế thừa NFR-OPS-01, không đổi mục tiêu 5 phút. |
| Đánh đổi cách gom đã duyệt | A gom theo ảnh hưởng của hành trình, giảm nhiều email cho cùng lúc đặt vé không dùng được nhưng cần xem chi tiết từng bước khi điều tra. B tách từng endpoint/bước lỗi không được chọn cho mốc đầu. Bộ lưu trạng thái, xử lý kết quả không xác định và lỗi đường gửi vẫn cần thiết kế. |
| Gửi lại và trạng thái | Retry chuyển phát giữ cùng định danh thông báo/sự cố, không mở sự cố mới hoặc reset mốc thời gian. Theo dõi riêng tạo thông báo, bên gửi chấp nhận và đầu nhận nhận được; không hứa giao email đúng một lần tuyệt đối chỉ từ ứng dụng. Nhánh timeout sau provider đã nhận phải được thiết kế chống trùng và kiểm riêng. |
| Nội dung và quyền | Chỉ metadata kỹ thuật cần thiết: mã sự cố, môi trường/thành phần/hành trình ảnh hưởng, trạng thái mở/phục hồi, các mốc thời gian và bước/runbook điều tra. Không đưa chat, token/OTP/QR, payload giao dịch hoặc PII không cần thiết vào mail/log; quyền truy cập theo NFR-PRIV-01/SEC-01. |
| Điều kiện đo | Môi trường cô lập, phiên bản/rule/cấu hình đã ghi nhận, hộp thư thử có bằng chứng timestamp. Tạo lỗi liên tục, nhiều lần phát hiện, phục hồi theo điều kiện đã định rồi tái phát; kiểm lỗi gửi/retry và phục hồi trước lúc email mở được nhận. Không gửi email thật hoặc gọi provider từ phê duyệt thiết kế. |
| Mức ưu tiên | Bắt buộc cho demo công khai theo NFR-OPS-01; phương án A đã được chọn cho mốc đầu. |
| Cách nghiệm thu | Đối chiếu event/mã sự cố, thông báo logic/job và email nhận trong từng ca; không có spam do polling. Kiểm mốc nhận cảnh báo ban đầu, nội dung đúng trạng thái và không báo đã gửi/đã phục hồi thiếu bằng chứng. Lỗi kênh gửi được ghi/báo trung thực theo cơ chế đã chốt, không tự đổi sang kênh chưa được duyệt hoặc biến việc gửi thành sự cố đã xử lý. |
| Đánh đổi và phương án B | A giảm nhiễu và không thêm nhắc định kỳ, nhưng chủ dự án có thể bỏ lỡ email mở khi sự cố còn kéo dài. B có nhắc định kỳ tới khi phục hồi, tăng cơ hội được chú ý nhưng cần chọn khoảng lặp/quy tắc dừng và chấp nhận thêm email; B không được chọn cho mốc đầu. |

Căn cứ hướng cảnh báo rõ vấn đề/ít nhiễu dùng lại Google SRE ở mục [9.12](#912-nfr-ops-01---phát-hiện-và-cảnh-báo-sự-cố-có-ảnh-hưởng-tới-demo); con số một mở/một phục hồi
là lựa chọn dự án đã duyệt, không phải mặc định do nguồn quy định. ADR-0020 tại main
`2a007797ac9ce542d9747aad0f44f3e430eec581` chọn backend có cảnh báo nhưng chưa chốt đường email;
ADR-0018 chọn email giao dịch không tự chọn thay cơ chế cảnh báo hạ tầng.
**Còn cần chốt:** lưu trạng thái và xử lý kết quả thiếu/chập chờn theo nguyên tắc gom A đã duyệt;
phạm vi bộ kiểm tại mục [9.12.3](#9123-phạm-vi-bộ-kiểm-khả-dụng-coređặt-trực-tiếp-và-vòng-đời-dữ-liệu-thử) đã duyệt, hợp đồng từng bước còn cần cụ thể hóa;
chi tiết đường gửi lỗi theo mục [9.12.4](#9124-xử-lý-lỗi-gửi-email-cảnh-báo-mở-sự-cố) và đề xuất thư phục hồi/thư tới khác thứ tự tại mục [9.12.5](#9125-email-phục-hồi-và-thông-báo-đến-khác-thứ-tự). Không tự áp mốc 5 phút
đã duyệt cho cảnh báo ban đầu sang mọi thông báo hoặc nghĩa vụ người vận hành phải phản ứng.

### 9.12.2. Nhịp kiểm tra và xác nhận lỗi khả dụng

**Các ngưỡng A đã duyệt ngày 2026-11-20:** chủ sản phẩm trả lời “tôi đồng ý” cho nhịp kiểm
60 giây tính giữa hai lần bắt đầu, giới hạn 10 giây mỗi lượt, mở sau hai lượt lỗi và xác nhận
phục hồi sau hai lượt thành công liên tiếp. Các chi tiết bộ kiểm/nghiệm thu còn cần cụ thể hóa.
Chỉ áp dụng cho kiểm tra khả dụng của
Core/đường đặt trực tiếp đã khoanh phạm vi; không tự áp quy tắc chờ hai lỗi cho vi phạm
quyền, sai trạng thái giao dịch hoặc sự cố chỉ ảnh hưởng AI. Chưa chọn endpoint/công cụ.

| Trường | Nội dung và trạng thái |
|---|---|
| Tình huống và mục tiêu | Lỗi khả dụng liên tục bắt đầu ngay sau lượt kiểm vừa thành công; cần phát hiện kịp mục tiêu email ≤ 5 phút, đồng thời hạn chế mở/đóng do một lỗi thoáng qua. |
| Chỉ số | Khoảng cách giữa thời điểm bắt đầu hai lượt kiểm liên tiếp; thời gian từ bắt đầu lượt tới có kết luận được ghi nhận; số lượt lỗi/thành công liên tiếp; thời gian từ sự cố kiểm soát bắt đầu tới mở sự cố và email tới hộp thư thử. |
| Ngưỡng A đã duyệt | Khoảng cách bắt đầu hai lượt ≤ 60 giây; mỗi lượt có kết luận trong ≤ 10 giây, gồm mọi bước kiểm/retry nội bộ và đánh giá. Mở sau 2 lượt lỗi liên tiếp; xác nhận phục hồi phạm vi được kiểm sau 2 lượt thành công liên tiếp. Diễn giải nghiệm thu đề xuất: chỉ tăng bộ đếm thành công khi toàn bộ checks bắt buộc đã hoàn tất đúng kết quả; chưa có bằng chứng không được tính thành công. |
| Căn cứ và ngân sách | Các ngưỡng riêng của dự án đã duyệt, tính ngược từ 300 giây, không phải số do Google SRE quy định hoặc phép đo hiện tại. Với lịch không bỏ/trễ lượt ngoài giới hạn, lỗi liên tục mà bộ kiểm phát hiện được cho kết luận mở chậm nhất sau 60 + 60 + 10 = 130 giây; dành ngân sách bảo thủ 170 giây cho tạo/chuyển/nhận email. Không đặt lại đồng hồ khi phát hiện lần đầu, mở sự cố hoặc retry gửi. Ngân sách email này vẫn cần đo và kiểm chứng. |
| Điều kiện đo | Môi trường cô lập, cùng phiên bản/cấu hình và tập checks đã định; giám sát/lịch kiểm/đường email khỏe. Gây lỗi ở các vị trí khác nhau trong chu kỳ, gồm ngay sau lượt thành công; không chờ kiểm xong rồi mới tính 60 giây. Timeout được kết luận trong ngân sách 10 giây; lượt thiếu/không chạy hoặc bộ giám sát lỗi phải được ghi riêng, không coi là khỏe hay vẫn tuyên bố đạt giới hạn 130 giây. |
| Mức ưu tiên | Bắt buộc cho demo công khai theo NFR-OPS-01; các giá trị 60/10 giây và hai lượt đã được chủ sản phẩm duyệt. |
| Cách nghiệm thu | Đối chiếu timestamp bắt đầu/kết thúc, kết luận từng lượt, chuyển trạng thái sự cố và email nhận. Kiểm lỗi liên tục, lỗi đơn lẻ rồi thành công, kết quả xen kẽ, timeout, phản hồi muộn và mất lượt. Xác nhận chỉ đóng sau đủ hai lượt thành công, cùng sự cố không sinh thông báo mở lặp; kiểm riêng đường gửi. Nếu lịch/đánh giá vượt ngân sách phải báo không đạt, không bỏ mẫu để giữ phép tính. |
| Giới hạn và phần còn mở | Phạm vi bộ kiểm và nguyên tắc gom đã duyệt tại mục [9.12.3](#9123-phạm-vi-bộ-kiểm-khả-dụng-coređặt-trực-tiếp-và-vòng-đời-dữ-liệu-thử)/[9.12.1](#9121-thông-báo-theo-vòng-đời-sự-cố); hợp đồng từng bước và bộ sự cố chứng minh khả năng phát hiện còn cần cụ thể hóa trước nghiệm thu. Hai lượt xanh không tự chứng minh mọi luồng đã phục hồi. Kết quả thiếu/mixed, lưu trạng thái/chống chập chờn, lỗi giám sát và đường gửi còn cần thiết kế. Ngưỡng email phục hồi đã duyệt tại mục [9.12.5](#9125-email-phục-hồi-và-thông-báo-đến-khác-thứ-tự). Không chạy probe/gửi email hoặc tạo giao dịch từ phê duyệt thiết kế này. |

Nguồn định hướng dùng lại [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/),
đối chiếu ngày 2026-11-20: kiểm hành vi thấy từ người dùng kết hợp tín hiệu nội bộ;
HTTP 200 vẫn có thể sai nội dung. Nguồn này không xác nhận các ngưỡng A hoặc độ phủ của bộ kiểm dự án.
Phương án B để so sánh: mở ngay sau một lượt lỗi, phát hiện nhanh hơn nhưng dễ thông báo do lỗi thoáng qua;
B không được chọn cho mốc đầu.

### 9.12.3. Phạm vi bộ kiểm khả dụng Core/đặt trực tiếp và vòng đời dữ liệu thử

**Phạm vi A đã duyệt ngày 2026-11-20:** chủ sản phẩm trả lời “tôi đồng ý” cho bộ kiểm
đọc suất/ghế → giữ ghế → tạo và đọc lại đơn chờ thanh toán, bằng tài khoản/suất/ghế thử riêng;
toàn lượt vẫn ≤ 10 giây, không gọi thanh toán/LLM thật, phát vé hoặc gửi email giao dịch.
Mục tiêu là kiểm cả đọc và ghi qua đường API của ứng dụng tới Core, theo mục [9.12.2](#9122-nhịp-kiểm-tra-và-xác-nhận-lỗi-khả-dụng).
**Nguyên tắc vòng đời A đã duyệt ngày 2026-11-20:** tiếp đó, chủ sản phẩm trả lời “tôi đồng ý”
cho nhóm tài khoản/ghế thử hữu hạn, giữ TTL/giới hạn hold, tái sử dụng khi Core cho phép,
tự dọn dữ liệu thử đã kết thúc/đối chiếu xong và báo bộ kiểm suy giảm nếu cạn dữ liệu.
Chưa duyệt số tài khoản/ghế, lịch dọn hoặc thời hạn lưu bản ghi giao dịch; các thông số này phải
được tính từ TTL, nhịp kiểm và mô hình dữ liệu. Chi tiết nghiệm thu bên dưới còn là đề xuất.

| Trường | Nội dung và trạng thái |
|---|---|
| Tình huống | Trang/API vẫn phản hồi nhưng không đọc được suất/ghế, không giữ được ghế hoặc không tạo được đơn. Demo ít hoặc không có người dùng nên chỉ theo dõi lỗi từ traffic thật có thể không phát hiện đường ghi hỏng. |
| Phạm vi A đã duyệt | Dùng tài khoản và suất/ghế thử dành riêng trong cùng môi trường được giám sát, qua đường xác thực/API/BFF/Core thông thường: đọc suất/ghế → giữ ghế → tạo và đọc lại đơn chờ thanh toán. Đối chiếu chủ đơn, suất, ghế, giá và TTL với kết quả kỳ vọng từ Core; không chỉ nhìn HTTP 200. Không dùng adapter mô phỏng thay Core khi tuyên bố đo Core. |
| Chỉ số và ngưỡng đề xuất | Lượt thành công phải hoàn tất đủ các bước và đúng trạng thái kỳ vọng trong tổng ≤ 10 giây đã duyệt, không phải 10 giây cho từng API. Bước bắt buộc lỗi/timeout khiến lượt không thành công; mở/phục hồi theo quy tắc hai lượt đã duyệt, chỉ kết luận cho phạm vi được kiểm. Nội dung sai/quyền sai được ghi riêng là lỗi tính đúng đắn/bảo mật, không tự áp thời gian chờ cảnh báo khả dụng cho chúng. |
| Điều kiện và ranh giới dữ liệu | Fixture kiểm tra không chiếm ghế đang bán cho người xem demo; cùng cơ chế giao dịch/quyền, không đường ghi tắt hoặc quyền vượt actor. Không tạo payment intent, gọi cổng thanh toán/LLM, xác nhận tiền, phát hành vé hoặc gửi email giao dịch. Dữ liệu giám sát phải phân biệt được với đơn trải nghiệm và số liệu kinh doanh. Fixture hết hiệu lực/hết ghế, lỗi tài khoản hay lịch kiểm phải báo đúng nguồn, không âm thầm bỏ bước rồi báo khỏe. |
| Vòng đời dữ liệu — nguyên tắc A đã duyệt | Luân phiên nhóm tài khoản/suất/ghế thử hữu hạn dành riêng; chỉ tái sử dụng khi Core xác nhận tài khoản/ghế đủ điều kiện theo nghiệp vụ. Giữ một hold còn hiệu lực/tài khoản và TTL 300 giây, không nhả hold đã tiêu thụ hoặc ép hết hạn/thanh toán để dọn. Đơn chờ thanh toán hết hạn/ghế được giải phóng theo cơ chế Core thông thường; việc này được kiểm riêng ngoài lượt probe ≤ 10 giây. Dọn tự động chỉ bản ghi thử đã kết thúc và đối chiếu xong, theo phạm vi dữ liệu/hợp đồng được thiết kế; không xóa đơn chưa rõ kết quả, dữ liệu người dùng hoặc bằng chứng sự cố cần giữ. Seed vẫn phục vụ reset môi trường thử riêng, không dùng để reset DB demo đang chạy. |
| Chỉ số và ngưỡng vòng đời đề xuất | 0 ghế/đơn của người xem demo bị chiếm, đổi hoặc xóa do cấp phát/dọn dữ liệu giám sát; 0 lần vượt quyền, vượt giới hạn hold hoặc tái sử dụng trước khi đủ điều kiện; 0 kết luận toàn bộ lượt khỏe khi thiếu tài khoản/ghế hay bước kiểm bắt buộc. Theo dõi số tài khoản/ghế đang dùng, bản ghi chờ/kết thúc/chưa đối chiếu, độ trễ hết hạn/dọn và lỗi cấp phát. Quy mô nhóm và giới hạn tồn đọng phải được tính từ TTL, lịch 60 giây, kết quả chưa rõ và phép đo trước khi bật định kỳ; chưa tự chọn con số. Không cấp thêm tài khoản/ghế hay tạo bản ghi vô hạn khi cạn nhóm; báo bộ kiểm suy giảm và giữ phần kiểm đọc riêng. Log/trace kỹ thuật tiếp tục tối đa 7 ngày theo NFR-PRIV-01, không suy thành thời hạn lưu/xóa bản ghi giao dịch. |
| Mức ưu tiên và đánh đổi | Phạm vi kiểm A đã được chọn cho NFR-OPS-01 của demo công khai, phát hiện lỗi đường ghi cả khi ít traffic. B chỉ đọc/health check không được chọn làm toàn bộ bộ kiểm. Nguyên tắc vòng đời A tự động cấp phát/hết hạn/dọn an toàn đã được chọn trước khi bật kiểm định kỳ; B dọn thủ công không được chọn làm cơ chế duy nhất cho kiểm định kỳ, vẫn có thể dùng trong bài thử có người giám sát theo runbook. |
| Cách nghiệm thu đề xuất | Trong môi trường cô lập, lần lượt gây lỗi đường vào/BFF–Core, đọc suất/ghế, ghi hold và tạo/đọc lại đơn; kiểm tình huống đọc vẫn tốt nhưng ghi hỏng. Đối chiếu trạng thái Core, kết luận từng bước, mốc mở/phục hồi và nhận email. Kiểm cả fixture/credential hỏng và probe gián đoạn để phân biệt lỗi giám sát với lỗi dịch vụ; giữ bằng chứng không phát sinh thanh toán/vé/email giao dịch hoặc ảnh hưởng dữ liệu người xem demo. |
| Nghiệm thu vòng đời đề xuất | Chạy qua nhiều vòng giữ–hết hạn–tái sử dụng trong nhóm hữu hạn đã công bố; đối chiếu Core xác nhận giải phóng, dữ liệu thử đã kết thúc được dọn theo lịch đã định và dữ liệu người xem demo còn nguyên. Ngắt probe sau tạo hold/sau tạo đơn, gây timeout chưa rõ kết quả, hết tài khoản/ghế và lỗi tác vụ dọn. Không được tự coi thành công, tái sử dụng sớm hoặc xóa dấu vết để che lỗi. Chốt số vòng, cỡ nhóm, lịch/retention bản ghi thử và hợp đồng dọn sau khi có mô hình dữ liệu; không biến các mục còn mở này thành bằng chứng đã đạt. |
| Giới hạn và phần còn mở | A chưa bao phủ thanh toán, webhook, phát hành/soát vé, toàn bộ UI hoặc AI; các phần này cần tín hiệu/kịch bản riêng, không được suy đều đã khỏe. Endpoint/hợp đồng trả về, cấu hình tài khoản/fixture, quy mô/lịch dọn/retention và cách gom tín hiệu sự cố vẫn cần chốt; nguyên tắc tự động quản lý vòng đời đã duyệt không thay các thông số này. Chưa chọn công cụ/provider hoặc chạy kiểm. |

Đối chiếu mã tại worktree ngày 2026-11-20: `createOrder` trong
`apps/customer-web/src/server/order-adapter.ts` tiêu thụ hold và tạo đơn `PENDING_PAYMENT`;
`releaseSeatHold` trong `apps/customer-web/src/server/hold-adapter.ts` từ chối hold đã tiêu thụ
với `HOLD_ALREADY_CONSUMED`. Đây là giới hạn adapter hiện có, không phải bằng chứng Core độc lập đã vận hành.
Hướng kiểm hành vi và nội dung kết quả tham chiếu nguồn Google SRE tại mục [9.12.2](#9122-nhịp-kiểm-tra-và-xác-nhận-lỗi-khả-dụng);
phạm vi kiểm A và nguyên tắc tự động quản lý vòng đời A là lựa chọn dự án đã duyệt;
chưa có bằng chứng đáp ứng ngân sách 10 giây hoặc dữ liệu thử đủ cho chạy liên tục.

### 9.12.4. Xử lý lỗi gửi email cảnh báo mở sự cố

**Nguyên tắc A đã duyệt ngày 2026-11-20:** chủ sản phẩm trả lời “tôi đồng ý” cho thử lại
lỗi tạm thời có giới hạn trong phần thời gian còn lại của mốc 5 phút ban đầu; kiểm trạng thái/chống trùng
khi kết quả không rõ; dừng lần gửi mới khi lỗi cấu hình/quyền hoặc hết ngân sách và giữ trạng thái cần xử lý.
Không ghi hộp thư đã nhận chỉ từ bên gửi chấp nhận. Trần số lần, khoảng chờ và timeout từng lần chưa chốt,
phải dựa trên hợp đồng provider và phép đo. Chỉ cụ thể hóa lỗi chuyển phát thông báo mở
cho Core/đặt trực tiếp trong mục tiêu ≤ 5 phút đã duyệt. Không tự áp thời hạn này cho mail phục hồi,
không chọn nhà cung cấp hoặc thêm kênh dự phòng.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Lỗi gửi tạm thời, sai cấu hình/quyền/địa chỉ, hoặc timeout sau bên gửi có thể đã nhận thư. Cần thử lại có giới hạn và biết mức bằng chứng chuyển phát, tránh gửi trùng hay ghi nhận đã tới hộp thư thiếu căn cứ. |
| Nguyên tắc A đã duyệt | Lưu trạng thái chuyển phát gắn cùng mã sự cố/định danh thông báo. Chỉ thử lại lỗi tạm thời khi an toàn và còn ngân sách trong mốc 5 phút tính từ sự cố bắt đầu; có khoảng chờ tăng dần, timeout từng lần và trần số lần hữu hạn. Hết thời gian hoặc trần số lần thì ngừng tạo lần gửi tự động mới, giữ trạng thái quá hạn/cần xử lý và bằng chứng để chủ dự án xử lý/gửi lại có kiểm soát. Lỗi cấu hình/quyền/địa chỉ không tự hết thì dừng để sửa, không lặp mù. |
| Chỉ số và ngưỡng đề xuất | 0 lần reset mốc sự cố do retry; 0 lần ghi đã nhận chỉ từ phản hồi bên gửi chấp nhận; 0 thông báo logic mới chỉ vì retry. Đếm số lần gọi, trùng thực nhận, lỗi/không rõ và thời gian tạo–bên gửi nhận–hộp thư nhận. Không khởi tạo lần gửi tự động mới khi đã hết ngân sách; kết quả trễ/không rõ phải được báo trung thực, không tính thành đạt ≤ 5 phút. Phân biệt ca đường email hỏng với bộ đo đủ điều kiện kênh khỏe, không xóa ca lỗi để làm đẹp báo cáo. |
| Kết quả không rõ và chống trùng | Timeout không chứng minh thư chưa gửi. Kiểm trạng thái bằng định danh chuyển phát hoặc cơ chế chống lặp mà provider thực sự hỗ trợ trước khi retry. Nếu không xác minh/chống trùng an toàn được, giữ không rõ/cần xử lý thay vì tự gửi lại mù. Định danh thông báo ổn định là cần thiết nhưng không tự bảo đảm email được giao đúng một lần. Bên gửi đã chấp nhận có thể tiếp tục giao thư sau khi ứng dụng ngừng retry; ngừng tạo lần gửi mới không phải hủy thư đã nhận. |
| Điều kiện đo | Môi trường thử cô lập, phiên bản/policy được ghi nhận, mô phỏng hoặc sandbox kênh gửi và lỗi có kiểm soát; khi nghiệm thu đầu cuối phải có timestamp từ hộp thư thử. Không coi mock/provider accepted là bằng chứng thời gian nhận thực. Không thay đổi trạng thái Core hoặc ngừng giám sát chỉ vì email lỗi. |
| Mức ưu tiên và đánh đổi | Nguyên tắc A đã duyệt cho NFR-OPS-01, cụ thể hóa trước khi bật cảnh báo email cho demo công khai. A thử lại có giới hạn, giữ lỗi cần xử lý mà không thêm kênh. B chỉ gửi một lần không được chọn làm chính sách mặc định. Khi kênh hỏng kéo dài, A vẫn có thể không đưa mail tới chủ dự án và cần kiểm trạng thái vận hành; không tự cam kết cảnh báo độc lập khi chưa có kênh thứ hai. |
| Cách nghiệm thu | Kiểm lỗi tạm thời rồi thành công, lỗi cấu hình/quyền, provider đã nhận nhưng mất phản hồi, nhận thư trễ và hết ngân sách. Đối chiếu mọi lần gọi với cùng thông báo, trạng thái lưu, bằng chứng đầu nhận và mốc ban đầu; không tăng thời hạn do restart/retry. Chưa rõ thì không ghi đã nhận; lỗi chuyển phát không tự đóng sự cố Core. Kiểm thao tác xử lý/gửi lại không mở sự cố mới và không che lịch sử trễ/lỗi. |
| Phần chưa chốt | Trần số lần, timeout từng lần và khoảng chờ phải chốt theo hợp đồng provider, phép đo và phần thời gian còn lại trước khi bật retry; chưa tự đặt con số. Bộ lưu trạng thái, retention, quyền/cách xử lý thủ công, mail phục hồi trước/sau mail mở và thời hạn mail phục hồi còn mở. Mốc 5 phút không bao gồm nghĩa vụ chủ dự án phải đọc/xử lý thư trong thời gian đó. |

Căn cứ nghiên cứu ngày 2026-11-20:
[AWS Builders’ Library — Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
nêu retry có thể tăng tải và timeout không bảo đảm tác dụng phụ chưa xảy ra; cần kiểm soát retry/chống lặp.
[RFC 5321 §4.2.5](https://www.rfc-editor.org/rfc/rfc5321.html#section-4.2.5) phân biệt chấp nhận trách nhiệm
chuyển phát với các lỗi giao thư có thể xảy ra sau đó; không lấy phản hồi nhận thư làm bằng chứng hộp thư đích đã nhận.
Các nguồn không quy định cửa sổ retry 5 phút cho ứng dụng này; đó là lựa chọn dự án đã duyệt dựa trên mục tiêu ban đầu,
không phải cấu hình SMTP hoặc năng lực của provider chưa chọn.

### 9.12.5. Email phục hồi và thông báo đến khác thứ tự

**Phương án A và ngưỡng phục hồi đã duyệt ngày 2026-11-20:** chủ sản phẩm trả lời “tôi đồng ý”
cho gửi thư phục hồi khi đủ hai lượt kiểm thành công mà không chờ thư mở tới hộp thư; cùng mã sự cố,
ghi loại sự kiện/thời điểm; thư phục hồi tới trong ≤ 5 phút từ xác nhận phục hồi khi giám sát/kênh email khỏe.
Retry hữu hạn trong cửa sổ phục hồi riêng, giữ nguyên đồng hồ cảnh báo mở. Chi tiết policy/provider/nghiệm thu còn cần cụ thể hóa.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Core đã đủ hai lượt kiểm đầy đủ thành công nhưng mail mở còn đang gửi, lỗi hoặc chưa rõ đã nhận; cần chủ dự án hiểu sự cố đã xảy ra và đã phục hồi dù thứ tự nhận thư thay đổi. |
| Phương án A đã duyệt | Tạo một thông báo phục hồi cùng mã sự cố ngay khi xác nhận phục hồi; không chờ bằng chứng hộp thư đã nhận thư mở. Không tạo lại/xóa thông báo mở hoặc reset deadline mở; xử lý thư mở còn tồn theo mục [9.12.4](#9124-xử-lý-lỗi-gửi-email-cảnh-báo-mở-sự-cố). Giữ lịch sử hai sự kiện, không gộp thành một thư để che thất bại chuyển phát hoặc thay đổi số thông báo logic đã duyệt. |
| Nội dung và thứ tự | Mỗi thư tự đủ ngữ cảnh với mã sự cố, môi trường/hành trình, loại sự kiện và mốc phát hiện/mở; thư phục hồi thêm mốc xác nhận phục hồi. Diễn đạt thư mở là sự kiện được phát hiện tại thời điểm đã ghi, không khẳng định trạng thái tại lúc người đọc mở thư. Không sửa payload đã gửi để lách chống lặp; thư phục hồi dùng định danh riêng với thư mở, retry của mỗi thư giữ định danh đó. Không dùng thứ tự thư tới hộp thư làm thứ tự trạng thái hệ thống. |
| Ngưỡng nhận đã duyệt và chỉ số nghiệm thu | Trong điều kiện giám sát/kênh email khỏe, hộp thư thử nhận thư phục hồi ≤ 5 phút từ lúc đủ điều kiện xác nhận phục hồi, không từ lỗi ban đầu hoặc từ lúc thư mở tới. Đây là ngưỡng riêng đã được chủ sản phẩm duyệt, tái sử dụng mốc 5 phút để nhất quán kỳ vọng cho cùng đường email; chưa có số đo xác nhận đáp ứng. Diễn giải nghiệm thu: 0 trường hợp chỉ đóng/mở trạng thái vì thư tới khác thứ tự; cùng một sự cố chỉ tạo một thông báo logic phục hồi. |
| Điều kiện đo | Môi trường cô lập, đúng phiên bản/policy, cùng bộ kiểm và tiêu chí hai lượt thành công đã định. Ghi mốc xác nhận phục hồi, thời điểm từng lần gửi và timestamp hộp thư thử; mô phỏng chậm/mất phản hồi riêng cho thư mở và thư phục hồi. Kết quả mock không chứng minh thời gian nhận thực; không gửi thư thật từ phê duyệt thiết kế. |
| Mức ưu tiên và đánh đổi | Cụ thể hóa thông báo phục hồi bắt buộc của NFR-OPS-01. A đã được chọn để tránh thư mở lỗi kéo theo chặn thư phục hồi; người nhận cần đọc loại sự kiện/mốc thời gian để hiểu đúng. B chờ xác nhận nhận thư mở rồi mới gửi phục hồi không được chọn cho mốc đầu. |
| Cách nghiệm thu | Kiểm thư mở tới trước, phục hồi tới trước, thư mở thất bại/không rõ hoặc đã quá hạn, và tái phát sau đóng. Đối chiếu hai thông báo logic/định danh, mã sự cố và thời điểm Core/bộ kiểm; thư phục hồi có đủ ngữ cảnh khi người nhận chưa thấy thư mở. Đo mục tiêu phục hồi riêng, không dùng mail phục hồi đúng hạn để tính mail mở đã đạt 5 phút. |
| Phần còn mở | Chi tiết chống trùng/lưu trạng thái/retention, số lần/khoảng chờ/timeout retry thư phục hồi phải chốt theo provider. Nguyên tắc retry hữu hạn trong cửa sổ phục hồi riêng đã duyệt; chi tiết xử lý lỗi cấu hình/quyền/kết quả không rõ và hết ngân sách theo mục [9.12.4](#9124-xử-lý-lỗi-gửi-email-cảnh-báo-mở-sự-cố) cần đặc tả/kiểm riêng, không gia hạn cửa sổ mở. Không hứa mọi thư đều tới khi kênh hỏng, không tự chọn thêm kênh hoặc nghĩa vụ trực. |

Căn cứ: vòng đời hai thông báo và quy tắc phục hồi tại mục [9.12.1](#9121-thông-báo-theo-vòng-đời-sự-cố)–[9.12.2](#9122-nhịp-kiểm-tra-và-xác-nhận-lỗi-khả-dụng) đã duyệt;
phân biệt chấp nhận/giao thư và rủi ro timeout dùng lại nguồn RFC/AWS ở mục [9.12.4](#9124-xử-lý-lỗi-gửi-email-cảnh-báo-mở-sự-cố).
Ngưỡng phục hồi 5 phút và việc không chờ thư mở là lựa chọn dự án đã duyệt, chưa phải bằng chứng thực thi.

### 9.12.6. Phạm vi phản ứng của chủ dự án

**Phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Chưa cam kết thời gian phản ứng/trực 24/7”. Làm rõ phần thời hạn phản ứng/nghĩa vụ trực còn mở
của NFR-OPS-01, không thay mục tiêu phát hiện và chuyển phát cảnh báo tự động.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Email cảnh báo đã tới nhưng chủ dự án đang ngủ, học hoặc làm việc khác; cần phân biệt hệ thống hoàn thành cảnh báo với việc có người tiếp nhận và khắc phục. |
| Phương án A đã duyệt | Mốc portfolio chưa có cam kết trực 24/7 hoặc thời hạn cố định để chủ dự án đọc, xác nhận hay xử lý xong sự cố thật. Chủ dự án xử lý khi có mặt theo runbook; trong buổi nghiệm thu/diễn tập có người chủ động theo dõi và ghi các mốc thực tế. Không coi nhận thư là đã có người tiếp nhận hoặc hệ thống đã phục hồi. |
| Chỉ số và ngưỡng | Giữ nguyên các mục tiêu tự động đã duyệt, gồm nhận email mở/phục hồi ≤ 5 phút trong điều kiện tương ứng. Ghi riêng mốc người tiếp nhận, bắt đầu xử lý và xác nhận phục hồi khi có; chưa tiếp nhận thì ghi đúng trạng thái, không dựng timestamp hoặc suy từ trạng thái gửi thư. Chưa có ngưỡng nghiệm thu thời gian phản ứng của con người. |
| Điều kiện đo | Trong môi trường thử, mô phỏng người nhận chưa phản hồi rồi tiếp nhận; quan sát vòng đời sự cố/thư theo mục [9.12.1](#9121-thông-báo-theo-vòng-đời-sự-cố)–[9.12.5](#9125-email-phục-hồi-và-thông-báo-đến-khác-thứ-tự) và ghi bằng chứng hệ thống/con người riêng. Không bắt người dùng cung cấp lịch trực hoặc cho phép gửi email thật từ phê duyệt thiết kế. |
| Mức ưu tiên | A đã được chọn làm ranh giới vận hành của demo; không mở thêm kênh trực hoặc người nhận thay. |
| Cách nghiệm thu | Cảnh báo tự động được đánh giá theo mốc đã duyệt dù chưa có người phản hồi; hệ thống không tự đóng sự cố chỉ do thư đã tới. Tài liệu/báo cáo không tuyên bố có hỗ trợ 24/7 hoặc thời gian khắc phục sự cố thật được bảo đảm. Người tiếp nhận muộn không làm dời đồng hồ cảnh báo hoặc reset các mục tiêu của bài diễn tập. |
| Đánh đổi và phương án B | A phù hợp dự án cá nhân nhưng sự cố ngoài lúc chủ dự án có mặt có thể kéo dài. B cam kết thời gian phản ứng trong khung giờ được công bố, cần duyệt lịch/nguồn lực/ngưỡng riêng; B không được chọn. Không thay các hạn xóa dữ liệu tự động đã duyệt hoặc RTO/RPO trong bài diễn tập bằng việc chưa có nghĩa vụ trực. |

Căn cứ là mục tiêu portfolio và việc NFR-OPS-01 đã tách chuyển phát email khỏi tiếp nhận/xử lý;
phạm vi A là lựa chọn vận hành của dự án đã duyệt, không phải kết quả đã đo hoặc miễn các yêu cầu chất lượng khác.

### 9.12.7. Nguồn tín hiệu giám sát AI và giới hạn quota

**Phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Lượt AI thực tế + kiểm service, chưa gọi mô hình định kỳ”. Chốt nguồn quan sát của phần AI trong NFR-OPS-01;
chưa đặt lịch gọi mô hình hoặc ngưỡng mở/phục hồi sự cố AI.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Demo ít lượt dùng, quota inference hữu hạn; health endpoint của Agent phản hồi không chứng minh provider/model đang suy luận được hoặc câu trả lời đúng. Cần quan sát lỗi thực mà không mặc định tiêu quota cho inference định kỳ. |
| Phương án A đã duyệt | Kết hợp kết quả các lượt AI thực tế với kiểm sức khỏe Agent Service không gọi mô hình. Ghi nhận đúng nguồn quan sát/thời điểm/phạm vi. Chưa chạy inference thật định kỳ chỉ để giám sát; bài kiểm AI có chủ đích vẫn theo phạm vi/quota và quyền cho phép riêng. Không dùng yêu cầu của người dùng để tự mở thêm probe inference ẩn. |
| Phân loại | Primary lỗi nhưng fallback đáp ứng thì ghi suy giảm nguồn chính, không tự coi toàn AI ngừng; lượt không hoàn thành được qua các đường được phép thì báo đúng nguyên nhân. Yêu cầu mơ hồ/không có phim phù hợp hoặc từ chối đúng quyền không tự tính thành provider lỗi. Health Agent, tình trạng từng provider và chất lượng đầu ra là các kết luận riêng. |
| Chỉ số và ngưỡng | Trong bộ ca: 0 call inference chỉ do lịch giám sát theo A, 0 lần kết luận inference hiện tại khỏe từ health service hoặc từ việc không có lỗi/không có traffic. Theo dõi kết quả/độ trễ/nguồn lỗi theo lượt quan sát và danh sách telemetry tại mục [9.6.2](privacy-and-audit.md#962-danh-sách-trường-cho-logtrace-chẩn-đoán); không thu chat/prompt/payload để giám sát. Ngưỡng tín hiệu và hạn chuyển phát cảnh báo AI cần chốt riêng, không tự áp 60 giây/hai lỗi/5 phút của bài Core. |
| Điều kiện đo | Agent/provider adapter thử có bộ đếm; kiểm Agent sống nhưng provider hỏng, primary lỗi/fallback tốt, cả hai lỗi, trường hợp nghiệp vụ bình thường không có kết quả và khoảng không có lượt AI. Chỉ dùng mô phỏng/sandbox trong bài thiết kế; provider thật cần quyền riêng. |
| Mức ưu tiên | A đã được chọn làm nguồn tín hiệu giám sát AI ở demo, ưu tiên tránh dùng quota không được dự trù. Không chọn thêm dịch vụ/công cụ hoặc bật trả phí. |
| Cách nghiệm thu | Đối chiếu bộ đếm inference, kết quả từng lượt và trạng thái giám sát; không traffic thì phần inference thiếu quan sát mới phải thể hiện đúng giới hạn, không tự đóng sự cố provider chỉ vì health Agent tốt. Các tín hiệu đủ điều kiện vẫn phải được xử lý tự động theo quy tắc cảnh báo sẽ chốt; không thay bằng việc chủ dự án tự đọc log. |
| Đánh đổi và phương án B | A tiết kiệm quota nhưng có thể không phát hiện provider lỗi lúc không có lượt inference; không cam kết thời gian phát hiện tính từ lỗi chưa quan sát. B thêm inference tổng hợp định kỳ, tăng bằng chứng đầu cuối nhưng phải duyệt tần suất/quota/ngân sách và nội dung thử. B không được chọn; không suy lựa chọn này thay bài nghiệm thu chất lượng AI 60 ca × 3 đợt. |

Căn cứ nghiên cứu cách giám sát AI ngày 2026-11-22: [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
phân biệt giám sát chỉ số nội bộ với kiểm hành vi bên ngoài như người dùng thấy; HTTP 200 vẫn có thể chứa nội dung sai.
Nguồn nhấn mạnh kiểm đầu cuối để phát hiện kết quả sai; suy ra cho AI, kiểm tình trạng dịch vụ không tự chứng minh suy luận hoạt động đúng.
Áp dụng cho portfolio, lựa chọn A đã duyệt tại mục [9.12.7](#9127-nguồn-tín-hiệu-giám-sát-ai-và-giới-hạn-quota) là theo dõi kết quả suy luận từ yêu cầu thực và kiểm tình trạng nội bộ/dịch vụ, không gọi LLM thật định kỳ.
Giới hạn của đề xuất: khi thiếu quan sát mới, phù hợp với đường suy luận cần đánh giá, chưa có căn cứ khẳng định đường đó đang hoạt động hoặc đã phục hồi.
Đây là căn cứ nghiên cứu cho lựa chọn dự án, chưa phải bằng chứng thực thi; nguồn không quy định ngưỡng hoặc cấu hình nhà cung cấp cho dự án.

### 9.12.8. Điều kiện mở sự cố AI từ lượt thực tế

**Phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Một lượt thất bại kỹ thuật cuối cùng đủ mở sự cố”. Chốt tín hiệu mở và phạm vi email AI;
hạn nhận email mở được duyệt tiếp tại mục [9.12.9](#9129-thời-hạn-nhận-email-mở-sự-cố-ai-theo-lượt); tiêu chí phục hồi AI còn cần chốt riêng.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Một lượt AI kết thúc không hoàn thành do lỗi kỹ thuật dù đã hết cách xử lý được phép; demo ít lượt nên đợi nhiều lỗi tiếp có thể không bao giờ đủ mẫu cảnh báo. |
| Phương án A đã duyệt | Từ một lượt thất bại kỹ thuật cuối cùng được Agent ghi nhận có thẩm quyền, mở sự cố AI và tạo email mở nếu chưa có sự cố cùng khóa. Không bắt cả hai provider đều được gọi khi chính sách không cho fallback. Lỗi lặp gom vào cùng sự cố theo mục [9.12.1](#9121-thông-báo-theo-vòng-đời-sự-cố), không tạo email cho từng request. Mô tả đúng ảnh hưởng lượt quan sát, không khẳng định mọi người dùng/provider đều đang mất dịch vụ. |
| Nhánh không mở từ tín hiệu này | Primary lỗi nhưng fallback đáp ứng chỉ ghi suy giảm primary, chưa tạo email riêng từ nhánh đó. Không có kết quả phù hợp, cần người dùng làm rõ, từ chối đúng quyền/giới hạn ứng dụng, người dùng hủy hoặc dừng đúng chính sách không tự coi là lỗi hạ tầng. Lỗi Core giữ phân loại Core khi có căn cứ, không tự đổi thành provider lỗi hoặc gửi thêm email AI cho cùng tín hiệu. Vi phạm an toàn/bảo mật giữ nhóm riêng đã chốt. |
| Chỉ số và ngưỡng | Một lượt đúng điều kiện đủ mở sự cố AI mới; 0 bỏ sót lượt đủ điều kiện trong bộ ca, 0 email mở mới do lặp cùng khóa khi sự cố đang mở, 0 email AI từ các nhánh loại trừ nói trên. Hạn nhận email AI, tín hiệu Agent mất hẳn và điều kiện phục hồi còn cần chốt; không dùng mốc phát sinh lỗi chưa quan sát hoặc tự áp mốc 5 phút của Core. |
| Điều kiện đo | Dữ liệu thử/adapter giả lập, policy fallback và kết quả cuối được định danh. Kiểm primary lỗi/fallback tốt, cả hai lỗi, lỗi kỹ thuật không được phép fallback, lỗi nghiệp vụ đúng, lỗi Core, hủy, nhiều lượt lặp cùng khóa và khác môi trường. Không gọi mô hình thật để tạo lỗi. |
| Mức ưu tiên | A đã được chọn cho nghiệm thu cảnh báo AI dựa trên lượt thực tế của demo; chưa chọn provider email hoặc cho phép gửi email thật. |
| Cách nghiệm thu | Đối chiếu kết quả lượt, phân loại, mã sự cố và thông báo logic. Một lượt đủ điều kiện mở được sự cố khi không có lượt sau; fallback thành công hoặc nhánh loại trừ không tự mở sự cố AI theo quy tắc này. Kiểm lặp giữ mã/mốc ban đầu và không lộ dữ liệu chat vào email. Thời gian giao thư được đánh giá khi có ngưỡng đã duyệt và bằng chứng hộp thư thật. |
| Đánh đổi và phương án B | A báo sớm với traffic nhỏ nhưng có thể gửi thư cho lỗi thoáng qua đã ảnh hưởng một lượt. B đợi nhiều lượt/tỷ lệ lỗi trong cửa sổ, giảm nhiễu nhưng cần chốt cỡ mẫu/cửa sổ và có thể chậm khi ít traffic; B không được chọn. Không đổi retry/fallback hoặc dùng cảnh báo làm lý do phát lại giao dịch. |

### 9.12.9. Thời hạn nhận email mở sự cố AI theo lượt

**Ngưỡng A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Nhận email ≤ 5 phút từ thất bại cuối cùng”. Áp dụng khi sự cố AI mới được mở từ tín hiệu
lượt thất bại theo mục [9.12.8](#9128-điều-kiện-mở-sự-cố-ai-từ-lượt-thực-tế); chưa áp cho Agent mất hẳn không ghi nhận được kết quả hoặc email phục hồi AI.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Agent đã xác định lượt AI không hoàn thành do lỗi kỹ thuật cuối cùng và đủ điều kiện mở sự cố; cần chuyển cảnh báo tới chủ dự án trong thời gian xác định, thay vì chỉ tạo job/email trong hệ thống. |
| Chỉ số và ngưỡng A đã duyệt | Hộp thư thử nhận email mở sự cố AI trong ≤ 5 phút từ lúc Agent xác định kết quả thất bại cuối cùng của lượt đầu tiên mở sự cố, khi hệ thống thu nhận tín hiệu/giám sát và đường email hoạt động. Bao gồm tạo/lưu sự cố, gom tín hiệu, chờ hàng đợi, gửi và giao thư; không tính lại từ lúc worker bắt đầu gửi, provider nhận hoặc lỗi lặp sau đó. |
| Căn cứ và đánh đổi | Mục tiêu đã duyệt riêng theo cùng kỳ vọng chuyển phát email đã chọn cho cảnh báo Core: biết lỗi đã quan sát trong vài phút, chưa cần thêm kênh/cam kết người trực. Khác mốc Core tính từ sự cố bắt đầu: A không bảo đảm phát hiện provider lỗi trong 5 phút lúc không có traffic. Mốc 5 phút chưa có phép đo tính khả thi, không phải chuẩn ngành hoặc tự kế thừa phê duyệt Core. B chờ chọn đường email/đo nền rồi đề xuất ngưỡng không được chọn. |
| Điều kiện đo | Môi trường thử, định danh lượt/sự cố/thông báo, build/cấu hình và mốc Agent xác định thất bại được ghi; đầu nhận thử có timestamp và sai số thời gian được công bố. Dùng adapter giả lập tạo lỗi AI; nghiệm thu thời gian giao thư cần đường email thực được cho phép, mock/provider accepted không đủ. |
| Mức ưu tiên | A đã được chọn cho nghiệm thu thời hạn cảnh báo AI theo lượt của demo; không chọn provider/địa chỉ hoặc cho phép gửi email thật từ quyết định thiết kế. |
| Cách nghiệm thu | Đối chiếu mốc đầu Agent, tạo sự cố/job, từng lần chuyển phát và hộp thư nhận; mọi ca đủ điều kiện thời gian phải đạt ≤ 5 phút, không lấy trung bình bù ca trễ. Kiểm trì hoãn thu nhận/hàng đợi, lỗi lặp cùng sự cố và retry chuyển phát không dời mốc gốc. Lỗi đường email ghi riêng với bằng chứng, không báo đạt chỉ vì đã tạo thông báo. |
| Ranh giới | Nguyên tắc retry hữu hạn/giữ định danh/kết quả chưa rõ ở mục [9.12.4](#9124-xử-lý-lỗi-gửi-email-cảnh-báo-mở-sự-cố) áp dụng trong ngân sách gốc đã duyệt; cấu hình cụ thể còn mở. Không tự áp hạn này cho email phục hồi AI, đổi ngưỡng mở, gọi thêm inference để xác nhận hoặc thay deadline 60 giây của lượt. |

### 9.12.10. Bằng chứng xác nhận phục hồi AI theo lượt

**Phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Hai lượt thực tế liên tiếp thành công”. Áp dụng sự cố luồng AI mở từ lượt thất bại
ở mục [9.12.8](#9128-điều-kiện-mở-sự-cố-ai-từ-lượt-thực-tế); không coi health service hoặc việc không có traffic là bằng chứng inference phục hồi.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Sau lỗi AI đã mở sự cố, lượt tiếp theo có thể thành công thoáng qua hoặc chỉ thành công nhờ fallback; cần tránh báo toàn bộ provider đã phục hồi chỉ từ service còn sống hoặc một kết quả cũ. |
| Phương án A đã duyệt | Hai lượt thực tế liên tiếp đủ điều kiện hoàn tất thành công sau lỗi kỹ thuật mới nhất của cùng phạm vi sự cố mới xác nhận luồng AI phục vụ trở lại và tạo một thông báo phục hồi. Chỉ đếm lượt bắt đầu sau mốc lỗi mới nhất, có kết quả cuối xác minh theo hợp đồng vận hành và không có lỗi đang theo dõi. Lỗi kỹ thuật cuối cùng đủ điều kiện ở giữa đặt lại chuỗi thành công; kết quả cũ, hủy hoặc từ chối trước khi xử lý không cộng lượt thành công. Chi tiết thứ tự tín hiệu/ca đồng thời phải đặc tả trước chạy. |
| Phạm vi kết luận | Lượt thành công qua primary hoặc fallback được phép đều có thể chứng minh luồng AI đang phục vụ theo đường đó. Nếu chỉ quan sát fallback thành công, giữ ghi nhận primary suy giảm/chưa xác minh phục hồi; không báo primary đã khỏe. Không có lượt mới thì chưa đủ bằng chứng đóng sự cố, không tự phát inference kiểm lại. |
| Chỉ số và ngưỡng | Hai lượt liên tiếp đủ điều kiện, 0 đóng khi chỉ health tốt/thiếu quan sát, 0 dùng thành công trước lỗi mới nhất và 0 kết luận primary phục hồi chỉ từ fallback. Hai là lựa chọn thiết kế đã duyệt để giảm đóng/mở do một thành công thoáng qua, nhất quán ý định chống chập chờn đã chọn cho Core nhưng không tự kế thừa phép đo Core hoặc bảo đảm thống kê. |
| Điều kiện đo | Bộ lượt/adapter giả lập có thứ tự bắt đầu/kết thúc và routing được ghi; kiểm lỗi → thành công → lỗi, lỗi → hai thành công, primary vẫn lỗi/fallback tốt, không traffic, kết quả cũ đến muộn và lượt bị hủy. Các lượt phải liên quan phạm vi sự cố; không dùng kết quả môi trường khác để đóng. |
| Mức ưu tiên | A đã được chọn cho nghiệm thu thông báo phục hồi AI theo lượt của demo; không thay bộ chất lượng AI hoặc tiêu chí lỗi an toàn. |
| Cách nghiệm thu | Đối chiếu trạng thái sự cố, kết quả cuối/đường chạy và thông báo phục hồi: chưa đủ hai lượt thì chưa đóng; đủ thì đúng một thông báo logic cùng mã sự cố. Sau đóng, lỗi mới đủ điều kiện mở thành sự cố mới theo vòng đời đã duyệt. Thành công vận hành không được mô tả là chất lượng mọi câu trả lời đã đạt ≥ 95%. |
| Đánh đổi và phương án B | A cần thêm quan sát, ít traffic có thể chờ lâu dù dịch vụ thực đã dùng được. B chỉ một lượt đủ điều kiện, xác nhận nhanh hơn nhưng dễ đóng/mở khi chập chờn; B không được chọn. Hạn email phục hồi và bộ kiểm sức khỏe Agent được duyệt riêng ngay bên dưới. Còn cần cụ thể hóa độ mới và thứ tự tín hiệu. Việc xác nhận phục hồi dựa trên lượt thực tế đã quan sát. |

### 9.12.11. Thời hạn nhận email phục hồi AI theo lượt

**Ngưỡng A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Nhận email phục hồi ≤ 5 phút từ xác nhận”. Chỉ xét email phục hồi cho sự cố AI theo lượt
đã đủ hai lượt thành công hợp lệ tại mục [9.12.10](#91210-bằng-chứng-xác-nhận-phục-hồi-ai-theo-lượt); không đặt hạn chờ phát sinh hai lượt đó.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Đã có bằng chứng luồng AI phục vụ lại nhưng email mở còn chậm/lỗi hoặc người nhận chưa biết kết quả; cần thông báo phục hồi có hạn giao riêng và không kết luận primary đã khỏe từ thành công qua fallback. |
| Chỉ số và ngưỡng A đã duyệt | Khi hệ thống giám sát và đường email hoạt động, hộp thư thử nhận email phục hồi AI trong ≤ 5 phút từ lúc đủ bằng chứng xác nhận theo mục [9.12.10](#91210-bằng-chứng-xác-nhận-phục-hồi-ai-theo-lượt). Bao gồm tạo/lưu/chờ/gửi/giao; không tính lại từ lúc worker bắt đầu, bên gửi chấp nhận hoặc retry. Không dùng thời điểm service thật có thể đã phục hồi nhưng chưa có quan sát làm mốc đã biết. |
| Vòng đời và nội dung | Dùng cùng mã sự cố, định danh thông báo phục hồi riêng; giữ một thông báo logic và nguyên tắc không chờ thư mở của mục [9.12.5](#9125-email-phục-hồi-và-thông-báo-đến-khác-thứ-tự). Thư tự đủ ngữ cảnh về mốc mở/xác nhận, phạm vi và đường primary/fallback đã quan sát; thư đến khác thứ tự không đổi trạng thái có thẩm quyền. Không gia hạn deadline mở hoặc ghi primary phục hồi khi chưa có bằng chứng. |
| Căn cứ và đánh đổi | Mục tiêu được duyệt riêng theo cùng kỳ vọng giao email của demo, để kết quả phục hồi đã xác minh được biết trong vài phút; không thêm kênh trực hoặc inference kiểm lại. Mốc 5 phút chưa có số đo xác nhận và không được kế thừa tự động từ email Core/email mở AI. B chờ thiết kế đường gửi/phép đo rồi chốt ngưỡng không được chọn. |
| Điều kiện đo | Môi trường thử, các lượt/đường inference giả lập đủ điều kiện, định danh/mốc xác nhận phục hồi và hộp thư thử có timestamp/sai số được công bố. Kiểm thư mở tới trước/sau, lỗi hoặc chưa rõ; retry, trễ hàng đợi và phục hồi qua fallback. Chỉ kiểm giao thư thật khi được cho phép; mock không đủ chứng minh đầu nhận. |
| Mức ưu tiên | A đã được chọn cho nghiệm thu email phục hồi AI theo lượt của demo; chưa chọn provider/địa chỉ hoặc cho phép gửi email thật. |
| Cách nghiệm thu | Đối chiếu mốc xác nhận, thông báo logic và hộp thư nhận: từng ca đủ điều kiện phải đạt ≤ 5 phút, không lấy trung bình bù trễ; lặp không tạo thông báo logic mới hoặc lùi mốc. Báo đúng giới hạn provider đang suy giảm, không lộ nội dung chat/bí mật. Mail mở trễ không làm mail phục hồi được phép trễ theo, và mail phục hồi đúng hạn không bù mail mở không đạt. |
| Ranh giới | Retry hữu hạn trong cửa sổ phục hồi riêng, nguyên tắc kết quả chưa rõ/lỗi cấu hình tại mục [9.12.4](#9124-xử-lý-lỗi-gửi-email-cảnh-báo-mở-sự-cố)–[9.12.5](#9125-email-phục-hồi-và-thông-báo-đến-khác-thứ-tự) cần cụ thể hóa theo đường email; không ngừng ghi lỗi chỉ vì hết lượt retry. Không cam kết thời gian từ provider hết lỗi tới phát hiện phục hồi khi không traffic, không thay deadline 60 giây hoặc chất lượng AI. |

### 9.12.12. Kiểm sức khỏe Agent Service ngoài tiến trình

**Gói A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Gói 60 giây / 10 giây / hai lần / email 5 phút”. Cụ thể hóa phần kiểm service không gọi mô hình
đã duyệt tại mục [9.12.7](#9127-nguồn-tín-hiệu-giám-sát-ai-và-giới-hạn-quota); không thay nguồn quan sát inference theo lượt.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Tiến trình Agent chết/treo hoặc đường vào không đáp ứng nên không có kết quả lượt từ Agent để mở cảnh báo. Cần phát hiện tình trạng service ngay cả khi không có người dùng và không tiêu quota inference. |
| Phương án A đã duyệt | Bộ giám sát chạy ngoài tiến trình Agent, kiểm đường health qua mạng/điểm vào tương ứng và xác minh hợp đồng phản hồi, không gọi LLM hoặc công cụ ghi giao dịch. Có thể tái sử dụng bộ giám sát hiện có khi phù hợp; không tự yêu cầu thuê máy/cloud riêng. Không dùng Agent tự báo rằng chính nó đang sống làm cơ chế duy nhất. |
| Chỉ số và ngưỡng A đã duyệt | Nhịp 60 giây giữa các lần bắt đầu, mỗi lượt tối đa 10 giây; hai lượt lỗi liên tiếp mở sự cố khả dụng Agent, hai lượt health thành công hợp lệ liên tiếp xác nhận phục hồi phạm vi service. Khi bộ giám sát/đường email còn hoạt động, hộp thư thử nhận email mở ≤ 5 phút từ lúc lỗi service liên tục bắt đầu trong bài gây lỗi; email phục hồi ≤ 5 phút từ lúc đủ hai health thành công. Giữ một mở/một phục hồi, không reset mốc do retry. |
| Căn cứ và đánh đổi | Gói được duyệt riêng dùng lại kỳ vọng nhịp kiểm/chuyển phát đã duyệt cho Core để có cách vận hành nhất quán, trong khi kiểm health không tiêu quota model. Hai lỗi giảm báo do một lần gián đoạn thoáng qua; vẫn có độ trễ phát hiện do chu kỳ kiểm. Đây là ngưỡng thiết kế đã duyệt cho Agent, chưa phải số đo đạt; B chờ topology/đo nền rồi chốt gói ngưỡng không được chọn. |
| Điều kiện đo | Agent và bộ giám sát là tiến trình phân biệt trong topology thử; gây dừng/treo Agent ngay sau lần kiểm thành công để kiểm pha bất lợi. Giám sát/đường gửi còn sống; ghi mốc gây lỗi, probe bắt đầu/kết thúc, mở/phục hồi và timestamp hộp thư. Kiểm timeout, phản hồi sai hợp đồng dù HTTP 200, lỗi chập chờn, restart và health tốt trong lúc provider vẫn lỗi; xác nhận bộ đếm inference bằng 0 từ lịch kiểm. |
| Mức ưu tiên | A đã được chọn cho nghiệm thu giám sát Agent Service của demo; endpoint/hợp đồng, vị trí chạy và công cụ cần đặc tả trước thực thi. |
| Cách nghiệm thu | Từng ca đủ điều kiện phải đáp ứng nhịp/timeout/quy tắc hai lượt và thời gian nhận thư, có bằng chứng đầu nhận. Service phục hồi chỉ đóng phạm vi health; không đóng sự cố inference theo lượt hoặc khẳng định primary khỏe khi chưa có bằng chứng theo mục [9.12.10](#91210-bằng-chứng-xác-nhận-phục-hồi-ai-theo-lượt). Sự cố lặp được gom theo môi trường–hành trình–nhóm vấn đề đã duyệt, không gửi từng request; cần ánh xạ nguyên nhân/ảnh hưởng để tránh báo trùng cùng tín hiệu. |
| Ranh giới | Không chứng minh chống mất cả máy/host của bộ giám sát, lỗi toàn bộ đường email hoặc bộ giám sát tự chết; phạm vi độc lập cần công bố theo topology. Không tự cam kết phát hiện provider lỗi lúc không có inference, tăng ngân sách, đổi RTO/RPO hay cho phép gây lỗi môi trường đang dùng. |

### 9.12.13. Bộ nghiệm thu giám sát và cảnh báo

**Phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Đủ 6 nhóm giám sát/cảnh báo”. Gom các quyết định NFR-OPS-01 ở mục [9.12.1](#9121-thông-báo-theo-vòng-đời-sự-cố)–[9.12.12](#91212-kiểm-sức-khỏe-agent-service-ngoài-tiến-trình)
thành sáu nhóm; không thêm kênh cảnh báo, nghĩa vụ trực hoặc ngưỡng thời gian mới.

| Nhóm | Tình huống và kết quả cần kiểm |
|---|---|
| OBS-01 — Hành trình Core | Gây lỗi lần lượt đọc suất/ghế, giữ ghế, tạo/đọc lại đơn; bao gồm đọc tốt nhưng ghi hỏng, lỗi ngay sau một lần kiểm tốt và phản hồi HTTP thành công nhưng sai kết quả. Kiểm nhịp 60 giây, mỗi lượt ≤ 10 giây, hai lỗi/hai thành công và email theo mốc đã duyệt. |
| OBS-02 — Agent Service | Dừng/treo Agent khi bộ giám sát ngoài tiến trình và đường email vẫn hoạt động, kiểm timeout/phản hồi sai và service lên lại. Gói 60 giây/10 giây/hai lần/email 5 phút phải đạt, lịch kiểm không phát inference; service tốt không tự đóng sự cố inference chưa được xác minh. |
| OBS-03 — Inference theo lượt | Primary lỗi/fallback tốt không mở email AI theo nhánh đó; một lượt thất bại kỹ thuật cuối cùng đủ điều kiện mở sự cố, không gộp nhầm lỗi nghiệp vụ/Core. Kiểm không traffic, kết quả cũ, lỗi–thành công–lỗi, hai lượt thành công và chỉ phục hồi qua fallback. Email mở/phục hồi theo đúng hai mốc 5 phút đã duyệt, không tự gọi thêm LLM. |
| OBS-04 — Vòng đời sự cố | Lỗi lặp hoặc đổi bước trong cùng phạm vi giữ mã/mốc, một mở/một phục hồi; không đóng chỉ do thư đã gửi hoặc một bước tốt. Tái phát sau đóng có mã mới, môi trường/nhóm vấn đề khác được phân biệt theo quy tắc gom. Không suy nhận email thành chủ dự án đã tiếp nhận/xử lý. |
| OBS-05 — Chuyển phát email | Lỗi tạm thời rồi thành công, lỗi cấu hình/quyền, timeout sau bên gửi đã nhận, thư trễ và phục hồi tới trước thư mở. Giữ định danh/deadline riêng, retry hữu hạn, không báo hộp thư đã nhận chỉ từ provider accepted, không chờ thư mở để tạo phục hồi và không lộ chat/bí mật. |
| OBS-06 — Bộ kiểm và dữ liệu thử | Fixture/credential hỏng, cạn nhóm tài khoản/ghế, probe ngắt sau hold/đơn, tác vụ dọn lỗi và kết quả giao dịch chưa rõ phải được báo đúng nguồn. Không tự bỏ bước rồi báo Core khỏe, tạo dữ liệu vô hạn, tái sử dụng sớm hoặc xóa dữ liệu người xem demo; không phát thanh toán/vé/email giao dịch thật. |

Chỉ số/ngưỡng A đã duyệt: mọi ca trong manifest phải đúng kỳ vọng, 0 vi phạm an toàn và các ca
đủ điều kiện đo thời gian phải đạt ngưỡng tương ứng. Ca chủ động phá đường email đánh giá đúng
xử lý lỗi/trạng thái cần xử lý, không biến thành bằng chứng nhận thư đúng hạn. Ca chưa chạy hoặc
thiếu cấu hình/đầu nhận không tính đạt; sáu nhóm không có nghĩa chỉ sáu ca.
Điều kiện đo: môi trường thử cô lập, build/topology, danh mục tín hiệu, nhịp/quy tắc, dữ liệu và hộp thư
thử được định danh; có mốc gây lỗi và bằng chứng từng chặng/đầu nhận, công bố sai số đồng hồ.
Mức ưu tiên: A đã được chọn cho nghiệm thu NFR-OPS-01 của demo.
Cách nghiệm thu: báo từng ca, kết quả nghiệp vụ/quota, sự cố/thông báo logic và thời gian giao thư;
không lấy trung bình hoặc tín hiệu service tốt để bù ca cảnh báo/đường nghiệp vụ sai.
B chỉ kiểm luồng cảnh báo thành công ít công hơn nhưng thiếu bằng chứng suy giảm/phục hồi;
B không được chọn. Tham số dữ liệu thử/retry, nơi chạy giám sát, hợp đồng health và lưu trạng thái vẫn cần
cụ thể hóa; không chứng minh phát hiện mất toàn bộ host/monitor khi chưa có đường giám sát độc lập phù hợp.
