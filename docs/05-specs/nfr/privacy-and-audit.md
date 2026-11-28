# Dữ liệu riêng tư và nhật ký kiểm toán

[← Tổng quan NFR](README.md)

## 9.6. NFR-PRIV-01 - Nhật ký chẩn đoán chỉ chứa thông tin kỹ thuật

**Hành vi: Đã duyệt.** Ngày 2026-11-17, chủ sản phẩm chọn **A — Chỉ thông tin kỹ thuật**:
bước xử lý, tên công cụ, thời gian và mã lỗi; đánh giá nội dung AI bằng bộ hội thoại mẫu riêng.
Phạm vi là nhật ký và dữ liệu theo dõi AI/lỗi của người thử demo công khai.
Mức ưu tiên và chi tiết nghiệm thu dưới đây là đề xuất cụ thể hóa; chưa có kết quả kiểm chứng.

| Trường | Nội dung |
|---|---|
| Mục tiêu | Điều tra lỗi và đo hoạt động mà không đưa nội dung hội thoại của người thử vào hệ thống chẩn đoán. |
| Tình huống | Chat gọi model/công cụ, hoàn tất hoặc phát sinh lỗi; ứng dụng ghi log hoặc gửi dữ liệu sang hệ thống theo dõi. |
| Chỉ số | Số bản ghi/gói dữ liệu chẩn đoán chứa nội dung hỏi/đáp, đối số/kết quả công cụ chứa nội dung chat hoặc dữ liệu nhạy cảm bị cấm; kiểm tra khả năng xác định bước, thời gian và loại lỗi bằng thông tin kỹ thuật được phép. |
| Ngưỡng mục tiêu | Không có nội dung chat người thử, credential/token/OTP, QR/chữ ký vé hoặc dữ liệu cá nhân không cần thiết trong chẩn đoán; 0 vi phạm trong bộ kịch bản đã thống nhất, không suy bảo đảm tuyệt đối ngoài phạm vi. Đã duyệt log/trace chi tiết lưu tối đa 7 ngày từ khi tạo, sau đó tự động hết hạn/xóa theo cơ chế kiểm chứng; khả năng thực thi từng nơi nhận phải xác minh. |
| Điều kiện đo | Đúng phiên bản và cấu hình dự kiến dùng cho demo; dùng dữ liệu thử có chuỗi nhận diện để phát hiện rò rỉ. Kiểm cả luồng thành công/lỗi, model/tool, thông báo lỗi, metadata, bộ đệm và dữ liệu trước khi gửi ra ngoài; không dùng thông tin cá nhân thật để thử. |
| Mức ưu tiên | Đề xuất bắt buộc trước khi mở demo công khai và bật thu thập chẩn đoán. |
| Cách nghiệm thu đề xuất | Thực hiện bộ kịch bản với dữ liệu thử nhận diện được; kiểm bản ghi tại nơi tạo, dữ liệu gửi đi và dữ liệu nhận ở hệ thống theo dõi. Xác nhận chỉ có trường kỹ thuật trong danh sách cho phép, không có nội dung chat/bí mật, kể cả khi SDK tự ghi lỗi hoặc payload. Đồng thời kiểm còn đủ thông tin để nhận diện bước và loại lỗi đã tạo. |
| Bộ đánh giá AI | Dùng hội thoại mẫu được chuẩn bị riêng và ghi rõ là dữ liệu thử; không tự lấy hội thoại của người truy cập công khai làm dữ liệu đánh giá. |
| Giới hạn và phần chưa chốt | Đã duyệt log/trace chi tiết tối đa 7 ngày, quyền xem/xuất chỉ chủ dự án ở mốc đầu và các nhóm trường cho phép tại mục [9.6.2](#962-danh-sách-trường-cho-logtrace-chẩn-đoán). Schema/kiểu/giới hạn giá trị, mapping lỗi, danh tính/cấu hình quyền cụ thể, cơ chế xóa và SDK còn mở. Lịch sử chat/checkpoint, dữ liệu gửi model để trả lời và nhật ký kiểm toán là phạm vi riêng, không suy bị cấm hoặc đã được duyệt đầy đủ từ quyết định chẩn đoán. |

Lựa chọn công cụ theo dõi không thay yêu cầu này; phải kiểm soát dữ liệu trước khi ghi/gửi,
không chỉ che nội dung sau khi đã thu thập. Chưa xác nhận implementation hiện tại đáp ứng.

**Thời gian lưu chẩn đoán chi tiết đã duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời
“tôi đồng ý với đề xuất của bạn” cho phương án A — giữ log/trace kỹ thuật chi tiết tối đa
**7 ngày từ thời điểm tạo bản ghi**, sau đó tự động hết hạn/xóa theo cơ chế được kiểm chứng.
Không chỉ ẩn trong dashboard rồi coi dữ liệu đã xóa. Áp dụng cả nơi thu nhận/xuất/bản sao chẩn đoán
trong phạm vi kiểm soát; vòng đời bản sao lưu và khả năng xóa ở nhà cung cấp phải xác định trước khi bật thu thập,
không hứa xóa vật lý ở dịch vụ ngoài khi chưa xác minh được điều kiện thực tế.
Mốc một tuần là lựa chọn đã duyệt cho demo nhằm điều tra sự cố gần đây và giảm dữ liệu tích lũy;
phương án 30 ngày đã cân nhắc nhưng không được chọn. Không phải ngưỡng pháp lý/chuẩn ngành hoặc
retention mặc định của công cụ; kiểm tính khả thi với cấu hình/tier được phép, không tự nâng gói.
Không áp hạn này cho dữ liệu nghiệp vụ, lịch sử chat/checkpoint của ứng dụng, nhật ký kiểm toán quyền/giao dịch,
backup DR hoặc báo cáo nghiệm thu dùng dữ liệu mẫu đã rà soát; các phạm vi đó cần chính sách riêng.
Nghiệm thu đề xuất: bản ghi mẫu có mốc thời gian kiểm được, kiểm vòng đời tại nguồn tạo, kho nhận,
bộ đệm và bản sao thuộc phạm vi; không còn log/trace chi tiết quá hạn. Chưa triển khai dọn hoặc xóa dữ liệu.

**Quyền truy cập chẩn đoán đã duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời
“tôi đồng ý với đề xuất của bạn”: trong mốc portfolio đầu, chỉ chủ dự án có quyền
xem/truy vấn/xuất log/trace kỹ thuật qua danh tính vận hành dự án được xác thực. Không công khai dashboard,
link chia sẻ hoặc API dữ liệu chẩn đoán. Các tài khoản khách, nhân viên, quản lý rạp và quản trị chuỗi
không tự có quyền này từ vai trò nghiệp vụ trong ứng dụng.
Tài khoản dịch vụ chỉ được cấp quyền cần thiết để thu/gửi/xử lý dữ liệu, không dùng chung thông tin đăng nhập
của người xem. Đây là nguyên tắc quyền đã duyệt, chưa tạo danh tính, cấp quyền hoặc chọn cơ chế xác thực.
Nếu cần người khác hỗ trợ điều tra, phải duyệt phạm vi truy cập riêng; không suy yêu cầu cảnh báo email
thành quyền công khai toàn bộ log hoặc chia sẻ tài khoản. Báo cáo portfolio có thể dùng bằng chứng dữ liệu mẫu
đã rà soát, không phải link công khai tới nhật ký sống.
Nghiệm thu đề xuất: chủ dự án đọc được dữ liệu được phép; tài khoản chưa đăng nhập hoặc chỉ có vai trò
nghiệp vụ bị từ chối cả UI, truy vấn/API và bản xuất; không lộ dữ liệu qua link hoặc thông báo lỗi.
Không tự thêm quyền truy cập dữ liệu giao dịch từ việc có quyền xem chẩn đoán, và không thay NFR-SEC-01.

### 9.6.1. NFR-PRIV-02 - Xóa lịch sử chat và checkpoint theo yêu cầu

**Nguồn kế thừa:** [mô hình sản phẩm](../../03-product/use-cases.md) BR-37–BR-39/Q164–Q170 và
[A-06/A-07](../../03-product/use-case-descriptions.md) tại main `2a007797ac9ce542d9747aad0f44f3e430eec581`,
đối chiếu ngày 2026-11-20. Bản tài liệu tại HEAD của worktree NFR chưa chứa các bổ sung này;
nguồn được ghim ở đây để không lấy phần còn mở cũ làm quyền đặt lại chính sách.
Đã chốt không tự xóa chat theo hạn thông thường; khách xác minh/chọn/xác nhận xóa một cuộc hoặc toàn bộ
trên Customer Web/Mobile. Xóa phần đủ điều kiện, nêu phần giữ/chờ và căn cứ; Core độc lập.
Hạn phản hồi có nội dung là 24 giờ liên tục từ tiếp nhận, không phải hạn xóa hết mọi bản sao.
Không áp hạn log/trace 7 ngày sang chat; retention checkpoint, bản sao và provider thuộc bảng lưu/xóa OPEN-10.

**Nguyên tắc A đã duyệt ngày 2026-11-20:** chủ sản phẩm trả lời “tôi đồng ý” cho chặn tiếp tục hội thoại
và dừng điều phối lượt Agent cũ khi hệ thống chấp nhận yêu cầu xóa hợp lệ; không chờ Agent hoàn tất.
Kết quả muộn không làm chat xuất hiện lại; giữ nguyên kết quả giao dịch Core, hiển thị đúng phần đang xử lý/giữ/chờ.
Mục tiêu xóa phần tự quản đang phục vụ và backup tự quản đã duyệt tiếp bên dưới; chi tiết thực thi, đồng bộ cache và chính sách provider/thiết bị offline còn cần đặc tả theo OPEN-10.

| Trường | Nội dung và trạng thái |
|---|---|
| Tình huống và mục tiêu | Khách xóa chat khi Agent đang chờ model/tool, có nhiều tab, request đang retry hoặc checkpoint có thể resume. Nội dung đã yêu cầu xóa không được tự xuất hiện trở lại do luồng cũ. |
| Hành vi A đã duyệt, chi tiết đồng bộ đề xuất | Khi yêu cầu đúng chủ/quyền và xác nhận đã được chấp nhận, chặn đọc/tiếp tục/resume chat bị xóa phía server qua các đường hội thoại app/API/Agent; dừng điều phối, yêu cầu hủy call đang chạy khi có thể. Phản hồi đến muộn không được ghi lại nội dung vào hội thoại hoặc khởi tạo bước/tool mới. Cache phía app được khóa/xóa khi nhận trạng thái hoặc đồng bộ/mở phiên trở lại; không hứa thu hồi tức thì trên thiết bị đang offline. Phần cần giữ có căn cứ chỉ được truy cập theo quyền ngoại lệ của nguồn sản phẩm. Việc hủy phía ứng dụng không chứng minh provider từ xa đã xóa hoặc dừng tính toán. |
| Ranh giới giao dịch và quyền | Xóa chat không hủy/đảo lệnh Core đã gửi, không reset TTL, tạo lại đơn hay xóa nghĩa vụ hoàn tiền. Khách vẫn tra cứu đơn/vé đúng quyền qua đường trực tiếp. Không cấp quyền Buaa tự xóa thay khách; không tự cho quản trị đọc toàn bộ chat để xử lý ngoại lệ. |
| Chỉ số/ngưỡng | Kế thừa phản hồi có nội dung ≤ 24 giờ liên tục; không tính thông báo tiếp nhận tự động là hoàn thành phản hồi. Đề xuất 0 lần server cho đọc/tiếp tục/resume chat ngoài phạm vi giữ hợp lệ sau mốc chấp nhận xóa, 0 nội dung được hồi sinh bởi phản hồi muộn/retry và 0 tác dụng phụ Core do thao tác xóa. Phần tự quản đang phục vụ và backup tự quản có mục tiêu hoàn tất ≤ 24 giờ đã duyệt riêng bên dưới; provider, đồng bộ cache thiết bị và ngoại lệ còn theo OPEN-10, chưa tự chọn số. |
| Điều kiện đo | Môi trường cô lập, fixture của hai chủ tài khoản, cùng build/cấu hình; dùng model/tool giả lập có thể giữ và trả kết quả muộn. Xác định tập dữ liệu cần xóa, phần giữ có căn cứ và mốc tiếp nhận/chấp nhận/phản hồi/xóa. Kiểm từng nơi lưu thuộc phạm vi, không chỉ danh sách chat trên UI. |
| Mức ưu tiên và đánh đổi | Yêu cầu xóa và bảng lưu/xóa là phụ thuộc bắt buộc trước dữ liệu thật theo nguồn sản phẩm, không coi đã đạt từ thiết kế này. A đã được chọn, ưu tiên ý định xóa và có thể làm câu trả lời đang chờ không được hiển thị. B chờ Agent hoàn tất rồi mới chặn/xử lý xóa không được chọn cho mốc này. |
| Cách nghiệm thu | Xóa một chat/toàn bộ, thử sai chủ/quyền/xác nhận, nhiều tab, call đang chạy, kết quả muộn, retry/resume và phục hồi dữ liệu từ bản sao thử. Đối chiếu quyền truy cập, lịch sử/checkpoint/cache trong phạm vi, mốc phản hồi và trạng thái Core trước/sau; không báo xóa hết khi còn phần chờ/provider chưa xác minh. Bản sao khôi phục phải giữ hiệu lực yêu cầu xóa trước khi phục vụ dữ liệu, theo cơ chế sẽ đặc tả. |
| Phần còn mở | Bảng nhóm dữ liệu/mục đích/căn cứ, phần giữ/xóa, thời hạn thực hiện/lưu/gia hạn, quyền, bản sao/log/provider theo OPEN-10; cách chặn luồng cũ, lưu dấu yêu cầu và đồng bộ phiên cần đặc tả. Không coi khóa truy cập là xóa vật lý, không đặt TTL chat mới hoặc sửa chính sách nguồn. |

Căn cứ chuyên môn đối chiếu ngày 2026-11-20:
[OWASP Top 10 Privacy Risks — P6](https://owasp.org/projects/top-10-privacy-risks?tab=top-10-privacy-risks)
nêu rủi ro xóa dữ liệu không hiệu quả/kịp thời sau khi hết mục đích hoặc có yêu cầu.
Nguồn hỗ trợ kiểm xóa thực tế, không đặt hạn 24 giờ hay chính sách lưu chat của dự án.

**Hạn xóa phần tự quản đang phục vụ — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Hoàn tất phần tự quản ≤ 24 giờ”. Hoàn tất xóa phần nội dung
chat/checkpoint đủ điều kiện trong kho đang phục vụ của dự án, gồm bản ghi/payload và cache máy chủ
liên quan, trong ≤ 24 giờ liên tục từ mốc chấp nhận yêu cầu xóa hợp lệ đã xác minh/xác nhận.
Không tính lại đồng hồ khi retry, chuyển hàng đợi hoặc đổi worker. Vẫn chặn đọc/resume và dừng điều phối
ngay theo nguyên tắc đã duyệt; chỉ chặn truy cập hoặc ẩn khỏi danh sách chat chưa được tính là đã xóa.

Căn cứ lựa chọn: đặt mục tiêu hoàn tất phần hệ thống tự quản trong cùng cửa sổ một ngày để phần đủ
điều kiện không bị treo chỉ ở trạng thái khóa. Đây là mục tiêu thiết kế đã được duyệt riêng, không suy từ việc đã duyệt
phản hồi ≤ 24 giờ hoặc coi nguồn bên ngoài ấn định con số này. Hai đồng hồ tách riêng: phản hồi có nội dung
tính từ tiếp nhận theo BR-38; xóa phần tự quản đủ điều kiện tính từ chấp nhận yêu cầu hợp lệ theo A.
B giữ mốc phản hồi đã duyệt, chờ thiết kế nơi lưu/luồng xóa rồi đề nghị hạn hoàn tất; B không được chọn.

Điều kiện đo đề xuất: danh mục kho/khóa/quan hệ bản ghi thuộc chat và checkpoint được định danh,
fixture hai chủ tài khoản, phần đủ điều kiện và phần giữ/chờ có căn cứ đã biết trước. Kiểm xóa một/toàn bộ
chat, retry/lỗi worker, cache máy chủ, nhiều phiên và phản hồi model/tool đến muộn; dùng môi trường cô lập.
Chỉ số/ngưỡng: thời gian tới khi xóa được kiểm chứng ≤ 24 giờ cho toàn bộ phần đủ điều kiện thuộc phạm vi;
0 nội dung đã xóa được hồi sinh bởi luồng cũ, 0 dữ liệu chủ khác hoặc trạng thái giao dịch Core bị xóa/đảo
do thao tác này. Có phần tự quản còn tồn quá hạn thì báo không đạt, không chỉ phát thông báo thành công.

Nghiệm thu đối chiếu trực tiếp bản ghi/payload/checkpoint/cache thuộc danh mục và thử đọc/resume đúng
quyền, giữ mốc tiếp nhận/chấp nhận/phản hồi/xóa và kết quả từng nơi lưu. Phần giữ/chờ phải nêu rõ trạng thái,
căn cứ và thời hạn tương ứng; không tự giữ toàn bộ chat vì một phần đang chờ. Mức ưu tiên:
A đã được chọn làm mục tiêu xóa phần đủ điều kiện cho mốc demo; chi tiết phép đo cần cụ thể hóa trước nghiệm thu chức năng và trước dữ liệu thật
theo nguồn sản phẩm. Chưa có kết quả runtime hoặc quyền viết/chạy tác vụ xóa từ thiết kế này.

Phạm vi 24 giờ ban đầu chỉ bao gồm kho đang phục vụ; backup tự quản được duyệt mở rộng riêng bên dưới.
Bản sao ở provider/cache thiết bị offline vẫn cần chính sách/kiểm riêng trong OPEN-10, không tự gia hạn. App đồng bộ lại
vẫn phải áp hiệu lực xóa đã duyệt, restore không được hồi sinh chat. Không hứa xóa mọi vết vật lý trên thiết bị
lưu trữ, không đổi thời hạn audit hoặc tự cho phép đưa nội dung chat vào audit để giữ thay. Giữ bảng nhóm
dữ liệu/mục đích/căn cứ và điều kiện xóa theo BR-37–BR-39, không thay nguồn chính sách sản phẩm.

**Nội dung gửi nhà cung cấp AI — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Xác minh cấu hình không lưu nội dung”. Giữ hai nguồn/tier đã chọn,
dùng suy luận thông thường không lưu trạng thái ở provider; xác minh cấu hình không lưu nội dung
sau xử lý theo phạm vi chính sách của từng nguồn trước gửi chat thật, gồm Groq ZDR trên đúng
organization. Không chủ động bật tính năng lưu chat qua batch/files/fine-tuning, log/cache nội dung
ở gateway hoặc adapter từ phê duyệt này. Nếu có tầng trung gian/tracing, kiểm riêng đường lưu/xuất.

Căn cứ đã tra Context7 và kiểm nguồn chính thức ngày 2026-11-22:

| Nguồn đã chọn | Điều nguồn công bố và giới hạn |
|---|---|
| Cloudflare Workers AI | Với standard inference không dùng tính năng có trạng thái, không giữ input/output sau thời gian cần để xử lý/trả phản hồi; vẫn có metadata và ngoại lệ an toàn/pháp lý. Storage, gateway log/cache hoặc tính năng có trạng thái có vòng đời riêng. [Data usage](https://developers.cloudflare.com/workers-ai/platform/data-usage/) |
| Groq | Inference thông thường không lưu mặc định, nhưng có thể ghi nội dung khi điều tra lỗi/lạm dụng tới 30 ngày, có ngoại lệ được công bố. Tài liệu cho mọi khách bật ZDR trong Data Controls để chặn giữ nội dung cho reliability/abuse; metadata vẫn được giữ. Tính năng cần lưu trạng thái có chính sách riêng/được vô hiệu khi bật ZDR. Chưa kiểm organization của dự án. [Your Data](https://console.groq.com/docs/your-data) |

Đây là dữ kiện nguồn công khai, không chứng minh cấu hình tài khoản/endpoint thực tế của dự án.
Không đồng nhất “không dùng huấn luyện” với “không lưu”; bật ZDR sau này cũng không tự chứng minh
nội dung đã gửi trước đó đã được xóa. Chưa có căn cứ cam kết xóa mọi bản sao provider trong ≤ 24 giờ
hoặc kết luận hủy call/xóa phía ứng dụng đã xóa ở provider. Không hứa loại bỏ metadata/ngoại lệ của nguồn.

Tình huống/điều kiện đo đề xuất: định danh account/organization, endpoint/model, đường gọi chính/dự phòng,
gateway/tracing và ngày đối chiếu chính sách; giữ bằng chứng cấu hình đã che bí mật. Kiểm dữ liệu thử qua
adapter/đường xuất để xác nhận chỉ gửi thông tin cần thiết, không có secret/token/QR/hồ sơ đầy đủ và không
ghi nội dung vào tầng do dự án bật. Không cần gửi chat thật hoặc gọi inference để phê duyệt thiết kế này.

Chỉ số/ngưỡng đề xuất: mọi đường inference thuộc phạm vi phải có hồ sơ chính sách/cấu hình phù hợp A;
0 luồng gửi chat thật tới nguồn chưa xác minh đủ điều kiện hoặc tự bật lưu nội dung; 0 tuyên bố đã xóa
ở provider chỉ dựa vào việc local delete/cancel thành công. Khi cấu hình không đáp ứng/chưa xác minh,
không coi nguồn đó sẵn sàng cho chat thật; giữ đường đặt vé trực tiếp, không tự đổi provider/tier hoặc bật phí.

Nghiệm thu kiểm inventory và cấu hình trên đúng nguồn, đối chiếu request/trace tối thiểu với chính sách,
thử thiếu/tắt cấu hình ZDR hoặc phát hiện gateway lưu nội dung trong môi trường thử để kiểm chặn điều kiện.
Kết quả chỉ chứng minh cấu hình/đường tích hợp được kiểm và chính sách đã đối chiếu, không quan sát được
mọi kho nội bộ của nhà cung cấp. Mức ưu tiên: A đã được chọn làm điều kiện trước dùng chat thật qua các nguồn này;
phụ thuộc rà soát xử lý dữ liệu theo BR-39/OPEN-09/OPEN-10 vẫn chưa được coi đã đạt.

B chấp nhận cơ chế giữ nội dung mặc định của provider cho mốc đầu, công bố đúng khả năng/ngoại lệ
và đánh giá phần dữ liệu được phép gửi: ít cấu hình hơn nhưng có thể có nội dung còn được giữ sau xóa local.
B không được chọn. Quy trình yêu cầu/xác minh xóa khi provider có giữ, thời hạn/ngoại lệ và xử lý dữ liệu cũ cần
cụ thể hóa theo hợp đồng thực tế; không tự áp 24 giờ tự quản hay 30 ngày audit cho các bản sao này.

**Chat/checkpoint trong backup tự quản — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Backup tự quản cũng ≤ 24 giờ”. Mở rộng mục tiêu
≤ 24 giờ liên tục từ mốc chấp nhận yêu cầu hợp lệ sang phần nội dung chat/checkpoint đủ điều kiện
còn trong backup/ảnh chụp lưu trữ/bản sao do dự án quản lý được. Không reset đồng hồ vì sao chép,
restore hoặc đổi job. Đây là mục tiêu được duyệt riêng, không suy từ hạn của kho đang phục vụ hoặc audit.
Chỉ áp dụng khi có những bản sao này, không yêu cầu bổ sung bài DR cho Agent DB hoặc tạo backup chat.

Trong lúc xử lý, không dùng bản sao để trả lại nội dung đã bị chặn đọc/resume; mọi restore phải áp lại
hiệu lực yêu cầu xóa trước phục vụ dữ liệu. Nếu artifact cố định không xóa riêng nội dung được, phải có
phương án thay/dọn artifact trong hạn, bảo toàn dữ liệu chủ khác và điểm phục hồi thay thế cần thiết;
không chỉ đổi tên, chuyển chỗ hoặc giữ bản cũ ngoài manifest rồi báo đã xóa. Bằng chứng yêu cầu xóa tối thiểu
phải còn đủ hiệu lực để ngăn hồi sinh từ bản sao cũ, không chứa chat/secret hoặc tự cấp quyền đọc chat.

Căn cứ lựa chọn A: cùng mục tiêu một ngày cho phần dữ liệu đủ điều kiện thuộc quyền kiểm soát của dự án,
giảm chênh lệch giữa xóa ở app và nội dung còn trong bản sao. Đánh đổi là cần kiểm soát inventory, khả năng
thay/dọn backup và điểm phục hồi; chưa chứng minh hosting/công cụ bất kỳ đáp ứng. B dùng cửa sổ luân chuyển
backup riêng tối đa 30 ngày từ chấp nhận yêu cầu, vẫn chặn hồi sinh ngay: dễ giữ điểm khôi phục lâu hơn nhưng
nội dung còn tồn sau khi kho đang phục vụ đã xóa. Mốc 30 ngày này là phương án mới, không kế thừa audit;
A đã được chọn, B không được chọn; không coi thời hạn nào là quy định của nguồn bên ngoài.

Điều kiện đo/nghiệm thu đề xuất: tài nguyên thử cô lập, danh mục tất cả bản sao/đường dẫn thuộc dự án,
hai chủ tài khoản, bản sao trước/sau yêu cầu và mốc thời gian đã biết. Kiểm xóa một/toàn bộ chat,
artifact hỗn hợp, sao chép/restore, job lỗi hoặc không có quyền dọn. Đối chiếu trực tiếp từng bản sao và
quy tắc restore, giữ bằng chứng đã lọc dữ liệu nhạy cảm. Chỉ số/ngưỡng A: mọi phần đủ điều kiện thuộc
phạm vi được loại bỏ có kiểm chứng trong ≤ 24 giờ; 0 chat đã xóa được hồi sinh và 0 dữ liệu ngoài phạm vi
bị mất do xử lý xóa. Có bản không dọn được thì báo chưa hoàn tất/không đạt, không hứa đã xóa hết.
Mức ưu tiên: A đã được chọn trước sử dụng backup chứa chat/checkpoint của demo hoặc xử lý dữ liệu thật;
chi tiết thao tác/phép đo bên trên vẫn cần cụ thể hóa.

Không sửa mục tiêu RPO/RTO hoặc phạm vi dump toàn Core DB; không tự xóa dữ liệu đơn/vé/thanh toán
hay đưa hạn xóa chat sang mọi dữ liệu backup. Bản sao tại provider/thiết bị offline/ngoài quyền kiểm soát
vẫn cần chính sách riêng theo OPEN-10. Chi tiết cơ chế, thời hạn bằng chứng xóa, ngoại lệ có căn cứ và
quyền dọn cần cụ thể hóa; không cấp quyền viết/chạy scripts hoặc xóa dữ liệu thực từ quyết định thiết kế này.

**Cache khi tái kết nối — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Kiểm trạng thái trước khi hiện/resume”. Với Customer Web/Mobile, khi bắt đầu
luồng kết nối lại/mở lại chat sau mất mạng, kiểm trạng thái chat dưới phiên/chủ sở hữu hợp lệ trước khi
hiển thị lại nội dung/tóm tắt từ cache, resume Agent hoặc gửi lại tác vụ cũ nếu có. Chưa kiểm được thì
báo đang chờ xác minh, không dùng cache cũ như trạng thái hiện tại. Server xác nhận đã xóa thì khóa/dọn
cache tương ứng và không tiếp tục luồng cũ; trạng thái còn hợp lệ mới cho dùng lại theo đúng quyền.

Tình huống/điều kiện đo: một tài khoản trên hai phiên/thiết bị thử; phiên B mất mạng còn cache,
phiên A xóa chat và server đã chấp nhận, sau đó B kết nối/mở lại. Kiểm thêm chat chưa xóa, hết phiên,
đổi tài khoản, lỗi tra trạng thái và phản hồi cũ tới muộn. Định danh build, cache và mốc bắt đầu tái đồng bộ;
không coi việc thiết bị báo có mạng là đã tra được trạng thái tại server.

Chỉ số/ngưỡng đề xuất: trong luồng tái đồng bộ được kiểm, 0 nội dung/tóm tắt cache được hiển thị lại
hoặc tác vụ cũ được resume/gửi lại trước khi kiểm được trạng thái hợp lệ; 0 chat server đã xác nhận xóa
được hồi sinh sau đồng bộ. Nghiệm thu quan sát thứ tự tra trạng thái–render–gửi/resume, dữ liệu cache
và request/response tối thiểu trong môi trường thử, kiểm chat còn hợp lệ vẫn mở được sau xác minh.
Mức ưu tiên: A đã được chọn trước nghiệm thu đồng bộ xóa trên hai app Customer;
chi tiết phép đo/cơ chế đồng bộ vẫn cần cụ thể hóa.

B cho hiển thị cache trước rồi đồng bộ nền: mở nội dung nhanh hơn nhưng có thể làm chat đã xóa
xuất hiện lại tạm thời; B không được chọn. A không yêu cầu thêm tính năng chat offline/hàng đợi mới,
không hứa xóa tức thì trên thiết bị còn offline hoặc đồng bộ thời gian thực mọi phiên. Dữ liệu đến sau
mốc xác minh được xử lý theo trạng thái/quyền mới khi hệ thống nhận biết, không coi một lần kiểm là
quyền tiếp tục vĩnh viễn. Không thay quy tắc logout, vé QR ngoại tuyến hoặc dữ liệu giao dịch Core.

### 9.6.2. Danh sách trường cho log/trace chẩn đoán

**Danh sách A đã duyệt ngày 2026-11-21:** chủ sản phẩm trả lời “tôi đồng ý” cho các nhóm trường kỹ thuật
bên dưới, loại dữ liệu nhạy cảm trước ghi/gửi và không xuất trường ngoài danh sách theo mặc định.
Giữ hạn 7 ngày/quyền chủ dự án; schema/cấu hình/kiểm SDK còn cần cụ thể hóa.
Cụ thể hóa log chỉ có thông tin kỹ thuật,
lưu tối đa 7 ngày và quyền xem/xuất chỉ chủ dự án đã duyệt tại mục [9.6](#96-nfr-priv-01---nhật-ký-chẩn-đoán-chỉ-chứa-thông-tin-kỹ-thuật).

| Nhóm được phép theo A đã duyệt | Trường và điều kiện |
|---|---|
| Phiên bản và nguồn | Thời điểm sự kiện/thu nhận, môi trường, service/app, build/SHA, tên sự kiện theo danh mục kiểm soát. Không ghi hostname hoặc đường dẫn máy có dữ liệu cá nhân/bí mật. |
| Liên kết bước kỹ thuật | Request/trace/span/run ID và mã sự cố/thông báo ngẫu nhiên không mang quyền truy cập, dùng liên kết các bước của thao tác/sự cố. Không dùng email, account/session/cookie/token hoặc ID đơn/vé/chat làm tên trace hay nhãn. ID kỹ thuật vẫn được bảo vệ vì có thể liên kết hoạt động; không tuyên bố ẩn danh tuyệt đối. |
| Thao tác và kết quả | Tên node/tool, loại thao tác/HTTP method và route template không chứa ID/query thực, HTTP status, kết quả thành công/lỗi/từ chối/timeout/chưa rõ, mã lỗi phân loại từ danh mục cho phép. Không ghi URL đầy đủ, tham số, đối số/kết quả tool hoặc exception message thô. |
| Hiệu năng/tài nguyên | Thời lượng, số attempt/call/vòng, số lần chuyển nguồn, số token input/output/usage, kích thước byte và số lượng kết quả. Giá trị số phải từ bộ đo tin cậy, không là chuỗi người dùng tự khai; ghi chưa đo được nếu thiếu, không tự bịa số 0. |
| Model và chính sách | Provider/model ID/version, phiên bản prompt/schema/policy và loại nguyên nhân dừng/giới hạn. Chỉ tên/phiên bản prompt, không nội dung prompt, suy luận hoặc output. Mọi trường chuỗi phải có kiểu/danh mục/giới hạn độ dài phù hợp trước thực thi. |

| Trường NFR | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Theo dõi API/AI/fallback khi thành công hoặc lỗi; chẩn đoán được bước chậm/lỗi và mức usage mà không thu hội thoại/dữ liệu giao dịch vào telemetry. |
| Dữ liệu không thuộc danh sách | Không thu prompt/chat, payload request/response/tool, checkpoint, thông tin hồ sơ/liên hệ, IP hoặc user-agent thô, session/credential/OTP/khóa, QR/chữ ký và chi tiết đơn/thanh toán. Loại/ánh xạ trước khi ghi/gửi, kể cả metadata/header/query/stack trace và callback SDK. Trường lạ mặc định không xuất; không dùng nhãn kỹ thuật để nhét nội dung bị cấm. Phạm vi này là log/trace chẩn đoán, không sửa dữ liệu nghiệp vụ hoặc nhật ký kiểm toán có chính sách riêng. |
| Chỉ số/ngưỡng | 0 trường ngoài danh sách hoặc giá trị chứa dữ liệu bị cấm lọt vào các nơi chẩn đoán thuộc phạm vi bộ kiểm; vẫn xác định được bước/loại lỗi/thời gian của từng sự cố thử bằng các trường được phép. Giữ tối đa 7 ngày và quyền đã duyệt, không mở thêm retention hoặc quyền từ danh sách này. |
| Điều kiện đo/nghiệm thu | Fixture có chuỗi nhận diện giả ở chat/tool payload, query/header, lỗi parse/provider, exception và trường metadata lồng nhau; kiểm nguồn ghi, console/file/buffer, exporter và nơi nhận. Đối chiếu bản ghi thực có đúng schema/giá trị được phép, không chỉ kiểm UI dashboard đã che. Kiểm cả lỗi ký tự xuống dòng/đầu vào giả tên sự kiện để tránh giả mạo log; không dùng bí mật thật để thử. |
| Mức ưu tiên và đánh đổi | A đã được chọn trước bật thu chẩn đoán của demo công khai, đủ liên kết các bước và theo dõi usage. B chỉ lưu thời điểm/service/mã lỗi/thời lượng không được chọn làm toàn bộ danh sách tham chiếu. Giữ cấm nội dung chat; không thu payload thật để thuận tiện gỡ lỗi. |
| Phần còn mở | Schema/kiểu/giới hạn giá trị, vị trí truyền ID và mapping lỗi, cấu hình SDK/collector, quyền thực tế, sampling/buffer/retry/chi phí và cơ chế xóa từng nơi phải cụ thể hóa/kiểm chứng. Không suy tên công nghệ đã chọn tự bảo đảm mọi đường xuất đều tuân thủ danh sách. |

Căn cứ đối chiếu ngày 2026-11-21:
[OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#data-to-exclude)
khuyến nghị loại dữ liệu nhạy cảm và có định danh liên kết tương tác; danh sách A là lựa chọn tối thiểu
đã duyệt của dự án trong ranh giới log, không phải mọi trường mà OWASP cho phép đều được thu.
ADR-0010 tại main `2a007797ac9ce542d9747aad0f44f3e430eec581` đã yêu cầu lọc metadata/error/tool payload
trước upload. Không có kết quả runtime hoặc quyền gửi trace từ bản thiết kế này.

## 9.14.7. NFR-SEC-02 - Nhật ký kiểm toán tối thiểu

**Phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn “A — Có nhật ký kiểm toán tối thiểu”.
Phạm vi gồm sự kiện đăng nhập/MFA, từ chối sai quyền, đổi yếu tố/quyền và các thao tác giao dịch
nhạy cảm trong bảng, lấy kết quả từ Identity/Core; chỉ giữ thông tin truy vết cần thiết, loại bí mật,
QR thô và toàn bộ chat. Quyền đọc/xuất và thời hạn 30 ngày của bản chính được duyệt tiếp cùng ngày ở phần dưới. Chi tiết trường/ngưỡng/phép đo
bên dưới còn là đề xuất cụ thể hóa, chưa có runtime kiểm chứng.
Đây là nhật ký kiểm toán, có mục đích và danh sách trường riêng; không mở quyền thu
dữ liệu bị cấm vào log/trace chẩn đoán tại mục [9.6](#96-nfr-priv-01---nhật-ký-chẩn-đoán-chỉ-chứa-thông-tin-kỹ-thuật), không tự áp thời hạn 7 ngày sang đây.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Cần xác định nguồn và kết quả khi có đăng nhập/MFA bất thường, đổi quyền/yếu tố hoặc tranh chấp về xác nhận thanh toán, vé, hủy/hoàn, soát vé và giao combo. Log lỗi kỹ thuật hoặc lời trả lời của AI không đủ làm căn cứ cho kết quả nghiệp vụ. |
| Phương án A đã duyệt | Có nhật ký kiểm toán tối thiểu cho đăng nhập/MFA thành công-thất bại, từ chối sai quyền, thay yếu tố/mã dự phòng/quyền và các thay đổi giao dịch nhạy cảm đã được service có thẩm quyền ghi nhận. Sự kiện về danh tính/quyền theo Identity; sự kiện giao dịch theo Core và hợp đồng với cổng thanh toán. Không ghi thành công chỉ vì UI/model nói thành công. Chốt danh mục thao tác cụ thể trước nghiệm thu, không mở quyền hoặc nghiệp vụ mới. |
| Dữ liệu tối thiểu đề xuất | Mã sự kiện, thời gian và nguồn service, định danh chủ thể đã xác minh nếu có (chưa xác thực thì ghi rõ), loại hành động, mã tham chiếu đối tượng/rạp trong phạm vi cần thiết, kết quả/lý do dạng mã và định danh liên kết thao tác. Dùng định danh nội bộ theo quyền, hạn chế dữ liệu cá nhân; không thu mật khẩu, OTP/TOTP seed, mã dự phòng, token/khóa, QR/chữ ký thô, chat hoặc payload giao dịch đầy đủ. Năm nhóm thông tin đã duyệt ở cuối mục này, schema/mapping chi tiết còn mở; không sửa danh sách chẩn đoán. |
| Chỉ số và ngưỡng | Trong bộ kiểm với đường ghi hoạt động bình thường: 0 sự kiện bắt buộc bị thiếu hoặc ghi sai chủ thể/đối tượng/kết quả; 0 bí mật/nội dung bị cấm lọt vào audit; 0 đọc/ghi/sửa/xóa trái quyền qua giao diện/API ứng dụng. Phân biệt lần thử, lần gửi lại và kết quả có hiệu lực để không suy retry thành giao dịch mới. Chưa đặt độ trễ ghi hoặc tỷ lệ mất cho tình huống đường ghi hỏng. |
| Điều kiện đo | Build/service, tài khoản/vai trò/rạp và dữ liệu thử được định danh, danh mục sự kiện/kỳ vọng đã chốt. Kiểm ca thành công/thất bại, chưa xác thực, sai quyền và xử lý lặp; đối chiếu với trạng thái nguồn thẩm quyền. Quyền đọc/xuất audit đã duyệt riêng bên dưới, quyền quản lý/xóa còn mở; không suy quyền quản trị nghiệp vụ hoặc quyền xem log chẩn đoán thành quyền audit. |
| Mức ưu tiên | A đã được chọn làm yêu cầu audit tối thiểu cho mốc demo có đăng nhập/giao dịch nhạy cảm; phạm vi nhỏ phục vụ truy vết, chưa yêu cầu mua dịch vụ thu thập log hoặc chọn kiến trúc lưu trữ mới. |
| Cách nghiệm thu | Chạy danh mục sự kiện thử có kỳ vọng, đối chiếu từng bản ghi với Identity/Core và tác dụng phụ thực, truy vết được ai/làm gì/đối tượng/kết quả. Kiểm dữ liệu giả có ký tự xuống dòng/chèn trường không tạo sự kiện giả hoặc lộ nội dung; kiểm gọi trực tiếp ngoài quyền bị chặn. Giữ bằng chứng đã lọc bí mật, báo riêng lỗi đường ghi; không dùng audit thay trạng thái giao dịch hoặc bằng chứng chữ ký Core. |
| Phương án B và đánh đổi | B chưa có yêu cầu audit riêng ở mốc đầu, dùng dữ liệu nghiệp vụ và log chẩn đoán hiện có để điều tra: ít việc hơn nhưng khó tái dựng người thực hiện/thứ tự/kết quả, nhất là sau đổi trạng thái; B không được chọn. A đã chọn tăng công thiết kế sự kiện và lưu/quyền nhưng có bằng chứng truy vết rõ. Không coi A là chứng nhận tuân thủ hoặc bảo đảm chống người có toàn quyền máy/DB sửa dữ liệu. |
| Phần còn mở | Chính sách lưu/xóa, lỗi đường ghi và kiểm chứng toàn vẹn đã duyệt ở các quyết định bên dưới. Danh mục sự kiện/trường, quyền quản lý và dọn kho, cơ chế ghi bền/đối chiếu toàn vẹn, độ trễ, dung lượng và công cụ cần thiết kế theo [NFR-OPEN05](README.md#9173-phần-còn-mở-và-điều-kiện-hoàn-tất-trước-nghiệm-thu). |

Căn cứ đối chiếu ngày 2026-11-22:
[OWASP — Which events to log](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#which-events-to-log),
[Event attributes](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#event-attributes)
và [Data to exclude](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#data-to-exclude).
Nguồn hỗ trợ chọn sự kiện theo rủi ro, đủ thông tin truy vết và loại bí mật. Phạm vi/mức ưu tiên A
là quyết định dự án đã duyệt; chi tiết trường/ngưỡng/phép đo vẫn là đề xuất. OWASP không ấn định
thời hạn lưu của dự án hoặc yêu cầu một kho audit riêng.

**Quyền đọc/xuất audit — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Chỉ chủ dự án qua công cụ vận hành”. Chỉ chủ dự án với danh tính vận hành
được cấp quyền đọc/xuất ở mốc portfolio; dùng công cụ/runbook được bảo vệ, chưa cần màn hình audit
trong ứng dụng. Tài khoản quản trị, quản lý rạp, nhân viên, khách hàng hoặc AI không tự có quyền đọc/xuất
audit từ vai trò nghiệp vụ. Service tạo sự kiện chỉ có quyền cần cho nhiệm vụ, không suy quyền ghi thành
quyền đọc toàn bộ. B bổ sung quyền xem theo vai trò nghiệp vụ/phạm vi rạp: tiện vận hành rạp nhưng cần
ma trận trường/quyền, giao diện và kiểm lọc dữ liệu riêng; B không được chọn cho mốc đầu.

Tình huống kiểm: tài khoản ứng dụng gọi trực tiếp đường đọc/xuất hoặc truy cập nơi lưu audit;
người vận hành hợp lệ đọc/xuất đúng phạm vi. Chỉ số/ngưỡng đề xuất: 0 bản ghi/trường audit lộ cho
chủ thể ngoài quyền trong bộ kiểm, người vận hành được phép vẫn lấy được bản xuất đã lọc bí mật.
Điều kiện đo: danh tính/credential và store/đường xuất thử được định danh; kiểm cả ứng dụng/API và
quyền tại nơi lưu, không chỉ ẩn nút. Nghiệm thu đối chiếu danh tính/quyền, dữ liệu trả về/file xuất,
giữ bằng chứng đã lọc dữ liệu nhạy cảm; không cấp thêm quyền sửa/xóa từ quyền đọc/xuất.
Mức ưu tiên: quyền đọc/xuất đã duyệt trước mở đường tương ứng. Cách cấp/thu hồi quyền vận hành,
quyền quản lý/xóa và cơ chế thực thi vẫn cần thiết kế; ghi nhận truy cập/vòng đời bản xuất đã duyệt bên dưới. Không tự cho phép
chủ dự án chỉnh sửa nhật ký để thay kết quả nghiệp vụ hoặc công bố audit ra ngoài.

**Thời hạn bản audit chính — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Tối đa 30 ngày”. Giữ bản ghi trong kho audit chính
theo cửa sổ cuốn tối đa 30 ngày tính từ thời điểm sự kiện do service thẩm quyền ghi nhận; quá hạn
không được trả qua đường đọc/xuất thông thường và phải được dọn khỏi tập bản ghi chính theo cơ chế
được thiết kế/kiểm trước khi thu thập. Không reset tuổi bản ghi khi retry, sao chép hoặc xuất lại.

Căn cứ lựa chọn là cửa sổ xem lại các buổi demo và phản hồi trong khoảng một tháng mà chủ dự án
đã chấp nhận khi chọn A; 30 ngày là mục tiêu dự án đã duyệt, chưa phải số đo dung lượng hoặc ngưỡng
do OWASP ấn định. B giữ tối đa
7 ngày cho bản chính: cửa sổ điều tra ngắn hơn, giảm dữ liệu tồn; đây vẫn phải là lựa chọn audit riêng,
không tự kế thừa log chẩn đoán; B không được chọn. Không suy dung lượng/tier hiện có chắc chắn đáp ứng.

Tình huống/điều kiện đo đề xuất: kho audit thử có các bản ghi đã biết trước, sát và sau ranh giới tuổi,
bao gồm sự kiện đến muộn/gửi lặp; ghi build/schema, nguồn thời gian và cấu hình chính sách. Dùng thời gian
được điều khiển trong môi trường kiểm hoặc fixture phù hợp, không sửa đồng hồ môi trường đang dùng.
Chỉ số/ngưỡng: trong bộ kiểm, 0 bản ghi quá hạn còn được đọc/xuất hoặc còn trong tập bản ghi chính sau
điểm hết hạn theo chính sách; các bản ghi còn hạn giữ đúng nội dung/quyền, không xóa toàn bộ kho để tính đạt.
Nghiệm thu đối chiếu tuổi gốc, truy vấn/xuất và kết quả dọn, kể cả retry/lỗi dọn; quá hạn mà dọn thất bại
phải báo không đáp ứng và giữ chặn truy xuất thông thường, không tự tăng thời hạn hoặc giả báo đã xóa.
Đề xuất bắt buộc chốt chính sách và khả năng thực thi trước thu thập audit cho demo công khai.

Phạm vi quyết định 30 ngày ban đầu là bản audit chính. Bản xuất và backup được duyệt tiếp bên dưới; xóa theo yêu cầu và ngoại lệ điều tra
vẫn cần chốt riêng trước nghiệm thu đầy đủ; không được lấy việc bản chính đã dọn làm bằng chứng mọi bản sao
đã biến mất hoặc cho phép giữ chúng vô hạn. Không đổi thời hạn chat/checkpoint/giao dịch Core,
không hứa xóa an toàn mọi vết trên thiết bị và không cấp quyền xóa dữ liệu thực từ phê duyệt thiết kế.

**Khi đường ghi audit lỗi — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Chỉ tiếp tục khi giữ bền được sự kiện”. Phân biệt nơi thu nhận audit không
sẵn sàng với service không còn lưu bền được sự kiện bắt buộc. Nếu đã giữ bền sự kiện cùng kết quả
nghiệp vụ theo mô hình giao dịch phù hợp, cho thao tác tiếp tục; chuyển tiếp khi đường nhận phục hồi,
giữ định danh/chống lặp và thứ tự cần thiết. Bộ đệm chỉ trong RAM hoặc gửi rồi bỏ khi lỗi không đáp ứng
điều kiện giữ bền. Không buộc mỗi lần soát/giao combo phải gọi Identity đồng bộ từ chính sách này.

Nếu không thể lưu bền, không nhận thêm thao tác nhạy cảm mới thuộc phạm vi cần audit; báo rõ
suy giảm, không báo thành công thiếu căn cứ. Giữ các đường đọc công khai/hoạt động không phụ thuộc
đường ghi này theo điều kiện thực tế, không dừng toàn bộ ứng dụng chỉ vì nơi thu nhận audit lỗi.
Đăng nhập/MFA thất bại và các nhánh từ chối không có transaction nghiệp vụ phải có thiết kế ghi riêng;
nếu không ghi được thì vẫn từ chối đúng, báo khoảng trống bằng chứng, không tuyên bố không mất sự kiện.

Kết quả bên ngoài đã xảy ra, như cổng đã thu tiền, vẫn giữ trạng thái trung thực và xử lý/đối soát theo
Core/hợp đồng; không tự đảo giao dịch, thu/hoàn lại hoặc phát thêm vé vì audit ghi lỗi. Chưa xác minh
được thì không coi là thành công hoặc thất bại chắc chắn. Việc sửa đường audit không thay quyền giao dịch.

Chỉ số/ngưỡng đề xuất: trong bộ kiểm collector lỗi nhưng nguồn còn giữ bền, 0 kết quả thao tác nhạy cảm
đã commit thiếu sự kiện bắt buộc tại nguồn; sau restart/phục hồi, các sự kiện còn hạn chuyển lại đúng,
không tạo tác dụng phụ nghiệp vụ trùng. Khi nguồn không giữ bền được, 0 thao tác nhạy cảm mới được
báo/ghi thành công trái điều kiện này. Không reset tuổi sự kiện khi chuyển lại hoặc cho đọc/xuất audit
đã quá hạn 30 ngày; tuổi lưu của hàng đợi/bản sao vẫn cần chính sách riêng, không tự cho giữ vô hạn.

Điều kiện đo/nghiệm thu: môi trường thử và danh mục thao tác được định danh; tách lỗi collector/mạng,
lỗi lưu bền như thiếu quyền/hết dung lượng và lỗi tiến trình sau commit. Đối chiếu trạng thái nghiệp vụ,
sự kiện tại nguồn/đích, gửi lại và kết quả cổng sandbox/stub đã công bố. Kiểm thao tác mới, sự kiện từ chối,
kết quả thanh toán đến muộn và hồi phục; giữ bằng chứng đã lọc bí mật cùng khoảng thiếu nếu có.
Mức ưu tiên: A đã được chọn làm hành vi suy giảm của NFR-SEC-02 cho mốc demo;
chi tiết phép đo/nghiệm thu bên trên vẫn cần cụ thể hóa.

B vẫn cho mọi thao tác nhạy cảm mới tiếp tục ngay cả khi không lưu bền được audit, chấp nhận thiếu
dấu vết và báo lỗi để điều tra: ít ảnh hưởng khả dụng trước mắt nhưng có thể không tái dựng được thao tác.
B không được chọn. Danh sách thao tác bị chặn, lưu nguồn/outbox, giới hạn tồn/retry, thời gian chuyển tiếp,
cảnh báo và phục hồi đường ghi phải cụ thể hóa sau khi biết topology/đo nền; không tự chọn queue/store,
mua dịch vụ, đặt ngưỡng mới hoặc coi chính sách đã được triển khai.

Căn cứ: [AWS — Transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)
hỗ trợ ghi thay đổi và sự kiện cùng transaction cục bộ rồi chuyển sau, xử lý giao lại;
[OWASP — Event collection/Verification](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#event-collection)
khuyến nghị kiểm lỗi logging và tránh để nó làm ngừng toàn ứng dụng hoặc lộ thông tin.
Chặn thao tác nhạy cảm mới khi không còn giữ bền là quyết định dự án đã duyệt, không phải OWASP bắt mọi app dừng.
Nguồn kiến trúc đã đối chiếu: mục transaction/outbox của `004-service-decomposition/spec.md` tại main
`2a007797ac9ce542d9747aad0f44f3e430eec581`; không suy có transaction DB–collector–cổng xuyên suốt
hoặc mọi sự kiện xác thực đều dùng được cùng transaction nghiệp vụ.

**Vòng đời bản xuất audit — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Dọn sau dùng, không vượt hạn gốc”. Coi tệp xuất là bản tạm phục vụ
một phiên tra cứu/điều tra: dọn khi chủ dự án kết thúc việc sử dụng, và không giữ quá hạn 30 ngày
tính từ thời điểm sự kiện gốc. Xuất lại/sao chép không làm mới tuổi dữ liệu. Nếu tệp chứa nhiều
sự kiện, dọn toàn tệp không muộn hơn mốc hết hạn sớm nhất của các sự kiện trong tệp; cần tra
những sự kiện còn hạn thì xuất lại đúng phạm vi từ nguồn. Không tự cấp ngoại lệ giữ lâu để điều tra.

B giữ bản xuất để tra lại tới cùng mốc hết hạn gốc, dù phiên tra cứu đã kết thúc: ít thao tác xuất lại
hơn nhưng giữ thêm bản dữ liệu trùng trong khoảng còn hạn. A giảm số bản phải bảo vệ và dọn,
phù hợp quyền xuất chỉ dành chủ dự án; A đã được chọn, B không được chọn.
Không đổi cửa sổ 30 ngày của bản audit chính. Chi tiết phép đo/nghiệm thu bên dưới còn cần cụ thể hóa.

Tình huống/điều kiện đo đề xuất: danh sách tệp/đường dẫn/bản tạm thuộc dự án được định danh,
chủ dự án có quyền truy cập; kiểm phiên đang dùng/đã kết thúc, dữ liệu sát hết hạn và tệp chứa
sự kiện khác tuổi, kể cả sao chép/xuất lại. Chỉ số/ngưỡng: 0 tệp xuất còn được giữ trong phạm vi
quản lý sau mốc dọn tương ứng; 0 lần xuất/sao chép làm lùi mốc hết hạn; không lộ cho ngoài quyền.
Nghiệm thu đối chiếu manifest tệp, thời điểm sự kiện và kết quả dọn/quyền, báo lỗi dọn trung thực;
không xóa tệp khác hoặc dùng việc chặn nút tải thay bằng chứng đã dọn tệp. Mức ưu tiên đề xuất:
bắt buộc xác định trước cung cấp chức năng xuất audit của mốc portfolio.

Chỉ áp dụng bản xuất/bản tạm trong phạm vi dự án quản lý; chưa hứa thu hồi/xóa từ thiết bị hay
hệ thống ngoài phạm vi kiểm soát. Chính sách backup/ảnh chụp lưu trữ chứa audit được duyệt tiếp bên dưới; ngoại lệ điều tra
chưa được cấp từ quyết định vòng đời bản xuất và không cho phép tự giữ vô hạn.
Chưa chọn vị trí/công cụ dọn hoặc cho phép xuất/xóa dữ liệu thực; bằng chứng portfolio có loại dữ liệu
và quyền công bố riêng, không mặc nhiên là lý do giữ hoặc chia sẻ bản audit thô.

**Backup chứa audit — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Cùng hạn gốc, không gia hạn”. Áp cùng mốc hết hạn gốc cho dữ liệu audit
trong backup/ảnh chụp lưu trữ thuộc dự án quản lý; không tạo lại cửa sổ 30 ngày từ lúc sao lưu/restore.
Nếu artifact cố định chứa nhiều sự kiện và không dọn từng bản ghi bên trong, thay/dọn toàn artifact
không muộn hơn hạn sớm nhất của các sự kiện audit trong đó. Ghi mốc hết hạn trong manifest an toàn;
mã hóa artifact không làm thay đổi nghĩa vụ hết hạn. Chưa yêu cầu một hệ thống backup audit riêng.

Tác động bài DR đã duyệt: nếu dump toàn Core DB có chứa audit, vẫn giữ yêu cầu dump đầy đủ tại mục [9.7.4](recovery-and-correctness.md#974-phương-pháp-sao-lưu-cho-bài-core-db),
chuẩn bị/kiểm thế hệ thay thế còn đủ điều kiện trước khi bản cũ hết hạn. Mỗi thế hệ cần dùng phải còn hợp lệ
trong khoảng diễn tập dự kiến; thiếu đủ hai thế hệ thì báo chưa sẵn sàng và dừng chuẩn bị, không kéo dài
hạn audit hoặc báo bản đã hết hạn còn là fallback hợp lệ. Đây là quyết định bổ sung điều kiện hợp lệ tại
mục [9.7.5](recovery-and-correctness.md#975-số-thế-hệ-backup-cho-bài-dr), không tự bỏ bảng audit khỏi dump để né kiểm hoặc thay backup bằng seed.

B thiết kế thời hạn riêng dài hơn cho backup có audit, giữ mã hóa/quyền hạn chế và chặn dữ liệu quá hạn
trở lại đường đọc/xuất khi restore: dễ giữ điểm phục hồi lâu hơn nhưng tăng thời gian dữ liệu còn tồn và
cần duyệt một ngoại lệ rõ. A không mở thêm thời hạn lưu audit, phù hợp bộ DR được chuẩn bị theo từng bài;
A đã được chọn, B không được chọn; không tự ấn định thời hạn dài hơn hoặc coi mọi backup hiện có đã đáp ứng A.

Tình huống/điều kiện đo đề xuất: artifact/DB thử cô lập có các sự kiện khác tuổi, manifest kỳ vọng và
hai thế hệ backup, kiểm bản sắp/quá hạn và thiếu thế hệ thay thế. Kiểm restore không làm audit đã hết hạn
được tra/xuất trở lại, kể cả hết hạn trong lúc diễn tập; quy tắc phục hồi dữ liệu/nghiệp vụ và RPO/RTO vẫn giữ.
Chỉ số/ngưỡng: 0 artifact thuộc phạm vi còn chứa audit quá hạn sau mốc dọn; 0 lần reset tuổi audit khi sao lưu,
restore hoặc retry; 0 bản hết hạn được tính là thế hệ hợp lệ. Nghiệm thu đối chiếu tuổi gốc, manifest,
artifact thực sự còn giữ/đã dọn và truy vấn sau restore, kiểm dữ liệu/file ngoài phạm vi nguyên vẹn.
Lỗi dọn phải báo không đáp ứng, không giấu artifact để tính đạt. Mức ưu tiên đề xuất: bắt buộc hoàn thiện
vòng đời backup chứa audit trước nghiệm thu tương ứng; chưa cho phép tạo/xóa backup hoặc chạy restore.

Chính sách xóa theo yêu cầu, ngoại lệ điều tra, bản sao ngoài quyền kiểm soát và thời hạn lưu dữ liệu
nghiệp vụ khác còn giữ nguồn quyết định riêng. A không áp hạn 30 ngày cho bản ghi giao dịch Core;
nếu phải thay/dọn artifact hỗn hợp thì phải chuẩn bị phương án phục hồi dữ liệu khác phù hợp trước.
Căn cứ nguyên tắc vòng đời: [OWASP — Disposal of logs](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#disposal-of-logs)
đề cập cả bản sao/backup/bản trích xuất. Hạn 30 ngày và cách áp lên artifact hỗn hợp ở đây là quyết định
dự án đã duyệt, không phải con số/cơ chế do OWASP ấn định. Chi tiết thao tác/phép đo chưa được triển khai.

**Ghi nhận đọc/xuất audit — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Ghi nhận từng yêu cầu đọc/xuất”. Ghi nhận từng yêu cầu đọc/xuất qua
công cụ vận hành được phép, gồm danh tính đã xác minh, thời điểm, loại thao tác, mã liên kết yêu cầu,
phạm vi tối thiểu và kết quả thành công/từ chối/lỗi/chưa rõ. Không ghi bản sao nội dung audit trả về,
credential hoặc toàn bộ câu truy vấn. Việc ghi sự kiện này không tự sinh chuỗi audit vô hạn;
không tự cấp quyền đọc từ việc một service có quyền ghi sự kiện.

Các yêu cầu đọc/xuất là thao tác nhạy cảm trong phạm vi chính sách đã duyệt khi đường ghi audit lỗi:
trước khi cấp dữ liệu phải giữ bền được bằng chứng yêu cầu; sau đó ghi kết quả thực. Nếu không giữ bền
được thì chưa cấp dữ liệu/xuất mới; nơi thu nhận tạm lỗi nhưng nguồn còn giữ bền vẫn tiếp tục theo A.
Chưa biết người dùng đã nhận đủ tệp thì không ghi chắc chắn đã nhận; không suy một lần tải được server
chấp nhận thành kết quả chuyển tệp hoàn tất. Chi tiết trạng thái/giao thức vẫn là thiết kế cần cụ thể hóa.

Tình huống/điều kiện đo đề xuất: tài khoản vận hành hợp lệ và tài khoản ứng dụng không có quyền,
phạm vi dữ liệu thử và đường đọc/xuất được định danh; kiểm thành công/từ chối, tải gián đoạn,
lỗi nguồn giữ bền/lỗi nơi thu nhận, và gửi lại yêu cầu. Chỉ số/ngưỡng: trong bộ kiểm nguồn ghi khỏe,
0 yêu cầu truy cập thuộc phạm vi bị thiếu dấu vết hoặc sai chủ thể/kết quả; 0 bản xuất được cấp khi không
giữ bền bằng chứng yêu cầu; 0 nội dung/secret bị lộ thêm từ sự kiện truy cập. Nghiệm thu đối chiếu yêu cầu,
quyền, bằng chứng tại nguồn và dữ liệu/tệp thực sự trả, không chỉ xem log UI; kiểm không có vòng lặp ghi.
Mức ưu tiên: A đã được chọn trước mở đọc/xuất audit ở mốc portfolio; các sự kiện này chịu cùng chính sách
30 ngày của audit, không làm mới tuổi dữ liệu đã được đọc/xuất.

B chưa ghi riêng các lần đọc/xuất audit của người vận hành, vẫn giữ kiểm quyền đã duyệt: ít sự kiện hơn
nhưng thiếu dấu vết khi dữ liệu được xem/lấy ra; B không được chọn. Chưa chọn schema/store, công cụ hoặc
thời hạn chuyển tiếp mới. Căn cứ: [OWASP — Protection](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#protection)
nêu hạn chế quyền và ghi nhận/giám sát truy cập log; chính sách A là quyết định dự án đã duyệt,
chi tiết trạng thái/phép đo bên trên vẫn cần cụ thể hóa.

**Kiểm chứng tính toàn vẹn audit — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Có kiểm chứng tính toàn vẹn”. Giữ kiểm quyền chỉ thêm
sự kiện qua đường ứng dụng, đồng thời có phép kiểm đối chiếu tập audit đã được xác lập mốc tin cậy
để phát hiện sửa/xóa trái phép. Mốc đối chiếu phải được bảo vệ riêng khỏi quyền sửa tập dữ liệu
đang kiểm; checksum đặt cạnh dữ liệu mà cùng một chủ thể sửa được cả hai chưa đủ căn cứ chống sửa.
Chưa chọn thuật toán, chữ ký, store hay dịch vụ ngoài từ nguyên tắc này.

Tình huống/điều kiện đo: tập audit thử đã biết và mốc đối chiếu được định danh; chỉ gây lỗi trên bản sao
cô lập sau khi mốc được xác lập. Kiểm sửa nội dung, xóa bản ghi ở giữa và xóa phần cuối thuộc tập đã chốt;
có ca nguyên vẹn, thêm sự kiện hợp lệ và dọn đúng hạn/quyền. Chỉ số/ngưỡng đề xuất: mọi biến thể sửa/xóa
trái phép trong bộ kiểm được phát hiện, không kết luận tập bị sửa là nguyên vẹn; ca nguyên vẹn và dọn hợp lệ
không bị đánh đồng với phá dữ liệu. Nghiệm thu giữ mốc trước-sau, kết quả đối chiếu và lịch sử dọn được phép;
không sửa nguồn chứng cứ để biến ca lỗi thành đạt. Mức kiểm đã duyệt: kiểm bằng runbook trước
nghiệm thu audit và khi điều tra nghi ngờ, chưa đặt yêu cầu phát hiện thời gian thực hoặc thời hạn cảnh báo mới.

B chỉ chặn sửa/xóa trái quyền qua ứng dụng và giới hạn quyền nơi lưu như yêu cầu hiện có, chưa có phép
đối chiếu phát hiện nội dung đã bị sửa/xóa: đơn giản hơn nhưng bằng chứng truy vết khó được kiểm lại nếu
store bị can thiệp; B không được chọn. Phạm vi A đã duyệt chỉ chứng minh cho tập đã có mốc tin cậy và các ca kiểm;
không bảo đảm phát hiện mọi sửa đổi ở sự kiện mới chưa được đối chiếu hoặc khi người tấn công kiểm soát
cả dữ liệu và mốc/khóa. Mốc/metadata không được dùng để giữ nội dung audit quá thời hạn đã duyệt;
chi tiết vòng đời đối chiếu và dọn hợp lệ phải thiết kế nhất quán trước thực thi.
Căn cứ: [OWASP — Protection](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#protection)
khuyến nghị bảo vệ log và có khả năng nhận biết bản ghi bị sửa/xóa. Mức kiểm bằng runbook của A là
quyết định dự án đã duyệt cho mốc portfolio, không phải chứng nhận chống can thiệp toàn hệ thống hoặc quyền chạy thử.

**Danh sách thông tin audit được phép ghi — phương án A đã duyệt ngày 2026-11-22:**
chủ sản phẩm chọn “A — Chốt 5 nhóm thông tin”. Chốt năm nhóm
thông tin dưới đây, chỉ ghi phần áp dụng cho sự kiện và cần để truy vết; không đồng nghĩa mọi bản ghi
đều có người đã xác thực/rạp/đơn. Đây là danh sách audit riêng, không thêm trường vào log chẩn đoán.

| Nhóm | Thông tin được phép đã duyệt |
|---|---|
| Định danh và liên kết | Mã sự kiện, mã yêu cầu/thao tác và mã liên kết lần thử/gửi lại khi có; dùng ID nội bộ không mang credential hoặc nội dung người dùng. Không coi mỗi lần gửi lại là một kết quả nghiệp vụ mới. |
| Thời gian và nguồn | Thời điểm sự kiện gốc, thời điểm ghi nhận, service/môi trường tạo sự kiện; định dạng có múi giờ. Nguồn thời gian theo service thẩm quyền, không lấy giờ khách tự khai để gia hạn dữ liệu. Ghi nhận muộn không đổi tuổi sự kiện. |
| Chủ thể và phạm vi quyền | Định danh nội bộ đã được server xác minh, ngữ cảnh vai trò/rạp cần thiết theo quyền thật; chưa xác thực thì ghi rõ chưa xác định. Không lấy lời chat/header tự khai làm bằng chứng người thực hiện hoặc thêm quyền từ tên app. |
| Hành động và đối tượng | Loại hành động dạng mã, loại/ID đối tượng liên quan và phạm vi đọc/xuất tối thiểu dạng cấu trúc khi áp dụng. Tham chiếu tới dữ liệu nguồn để tra đúng quyền, không chép hồ sơ, QR, nội dung đơn/chat hoặc toàn bộ câu truy vấn. |
| Kết quả và lý do | Kết quả thành công/từ chối/lỗi/chưa rõ và mã lý do do service xác định; không ghi mô tả tự do từ model/người dùng hoặc toàn bộ payload/lỗi thô. Không ghi đã thu/hoàn/phát vé chỉ từ click UI hoặc tình trạng chưa được xác minh. |

Giữ danh sách loại trừ đã duyệt: không mật khẩu, OTP/TOTP seed, mã dự phòng, token/khóa, QR/chữ ký
thô hoặc toàn bộ chat/payload; năm nhóm không bao gồm email/số điện thoại/IP/user-agent thô.
Trường ngoài danh sách không được ghi; trường trong danh sách vẫn cần kiểm kiểu/nguồn/giá trị, tránh
nhét dữ liệu bị cấm vào tên ID/lý do. Thiếu hoặc sai trường bắt buộc phải được xử lý theo hợp đồng sự kiện
và chính sách lỗi đã duyệt, không giả một bản ghi đầy đủ; bộ enum/schema/độ dài cụ thể chưa được chọn.

Tình huống/điều kiện đo đề xuất: danh mục sự kiện mẫu Identity/Core/đọc-xuất audit, tài khoản và
đối tượng thử có kỳ vọng; kiểm chưa xác thực, từ chối, gửi lại, ghi muộn và dữ liệu giả có chứa bí mật/ký tự
chèn trường. Chỉ số/ngưỡng: 0 trường ngoài danh sách hoặc giá trị bị cấm được lưu/xuất trong bộ kiểm;
các sự kiện hợp lệ vẫn truy được chủ thể khi đã xác minh, hành động, đối tượng khi áp dụng và kết quả
qua ID/liên kết. Nghiệm thu đối chiếu schema và bản ghi/file thực, không chỉ bản xem đã che; kiểm không
mất sự kiện cần thiết bằng cách tắt toàn bộ audit. Mức ưu tiên đề xuất: chốt trước thu thập audit mốc demo.

B dùng bộ gọn hơn chỉ danh tính/thời điểm/hành động/kết quả, giảm metadata nhưng thiếu liên kết rõ tới
yêu cầu/đối tượng/nguồn, khó tái dựng giao dịch nhiều service; B không được chọn. Không mở quyền truy cập
hoặc ngoại lệ lưu dữ liệu cá nhân từ việc có danh sách trường; quan hệ với yêu cầu xóa dữ liệu vẫn theo
nguồn sản phẩm và cần cụ thể hóa trước nghiệm thu. Căn cứ: [OWASP — Event attributes](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#event-attributes)
và [Data to exclude](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#data-to-exclude);
năm nhóm và giới hạn nội dung là quyết định dự án đã duyệt, không phải schema bắt buộc do OWASP ấn định.
Tên trường/kiểu/enum/độ dài, mapping từng loại sự kiện và cơ chế kiểm dữ liệu vẫn cần cụ thể hóa trước thực thi.

**Bản audit tại nguồn/hàng đợi — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Cùng hạn gốc tối đa 30 ngày”. Các bản chứa dữ liệu sự kiện
audit do dự án quản lý tại service nguồn, outbox, hàng đợi hoặc vùng giữ sự kiện chuyển lỗi cũng
không được tồn quá 30 ngày tính từ sự kiện gốc. Chuyển tiếp, retry hoặc restart không làm mới tuổi.
Khi đã chuyển và có đủ căn cứ xác nhận, bản tạm được dọn theo vòng đời sẽ đặc tả; không cần giữ tới
đủ 30 ngày. Quy tắc áp cho phần dữ liệu audit, không tự xóa bản ghi giao dịch Core cùng chỗ lưu.

Tình huống: nơi nhận audit lỗi kéo dài, bản nguồn/hàng chờ qua hạn dù bản chính hoặc bản xuất đã dọn.
Chỉ số/ngưỡng A: trong bộ kiểm, 0 bản audit quá hạn còn được giữ/đọc/xuất ở các nơi trên,
0 retry làm mới tuổi và 0 sự kiện hết hạn chưa giao được bị ghi là đã giao thành công.
Nếu sự kiện phải dọn trước khi chuyển được, báo khoảng thiếu bằng chứng và trạng thái không đạt
tương ứng; không dựng lại nội dung, lùi tuổi hoặc kéo dài hạn để giấu thiếu hụt. Việc giữ dấu hiệu
lỗi/tổng hợp phải không giữ lại nội dung sự kiện đã hết hạn dưới tên khác và vẫn theo chính sách dữ liệu áp dụng.
Không thay chính sách chặn thao tác nhạy cảm mới khi không lưu bền được sự kiện.

Điều kiện đo/nghiệm thu: inventory nơi lưu bản audit tự quản, dữ liệu mẫu trước/đúng/sau hạn gốc,
collector mất kết nối, restart/retry và phục hồi trước/sau hạn; đối chiếu bản nguồn/đích, kết quả dọn
và báo cáo khoảng thiếu. Dữ liệu còn hạn/giao dịch đối chứng được bảo toàn; lỗi dọn phải báo không đạt,
không suy chặn đọc thành đã xóa. Mức ưu tiên: A đã được chọn cho nghiệm thu vòng đời audit tại nguồn/hàng đợi.
A dùng cùng hạn gốc để tránh bản sao ẩn; B đặt hạn riêng cho các nơi này cần duyệt thêm độ dài,
mục đích và đánh đổi; B không được chọn. Cấu hình hàng đợi và lịch dọn còn mở. Quyết định về ngoại lệ điều tra được ghi ngay bên dưới.
Căn cứ là cửa sổ audit chính/bản xuất/backup đã được dự án duyệt trong mục này;
đây là lựa chọn mở rộng phạm vi cùng hạn đã duyệt, không phải con số bắt buộc của tiêu chuẩn hoặc kết quả chạy thử.

**Ngoại lệ giữ audit để điều tra — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Demo chưa có ngoại lệ giữ quá hạn”. Mốc demo không có ngoại lệ
giữ nội dung audit tự quản quá hạn gốc 30 ngày chỉ vì điều tra chưa kết thúc. Áp dụng cho bản chính,
bản xuất, backup và bản tại nguồn/hàng đợi; gắn nhãn “đang điều tra”, sao chép hoặc đổi tên tệp
không dừng đồng hồ lưu. Không mở quyền giữ bản sao ngoài danh mục quản lý.

Tình huống/ngưỡng: bài điều tra còn mở khi sự kiện đến hạn; trong bộ kiểm, 0 bản chứa nội dung audit
được giữ/đọc/xuất quá hạn do nhãn điều tra. Bản còn hạn vẫn dùng theo quyền đã duyệt.
Điều kiện đo/nghiệm thu: dữ liệu mẫu có sự kiện sát hạn trong từng loại nơi lưu; kiểm trạng thái
điều tra đang mở/đã đóng, sao chép và lỗi dọn. Đối chiếu tuổi gốc, inventory và kết quả dọn;
dọn thất bại phải báo không đạt, không tự ghi đã xóa. Nếu mất bằng chứng do hết hạn,
báo giới hạn điều tra; không dựng lại hoặc giấu nội dung audit trong báo cáo dưới tên khác.
Mức ưu tiên: A đã được chọn cho nghiệm thu chính sách lưu audit liên quan điều tra.
A đơn giản hóa vòng đời và giữ cam kết hạn gốc; B cho phép giữ riêng để điều tra sẽ cần duyệt
người phê duyệt, mục đích, phạm vi dữ liệu, hạn tối đa và cách đóng/xóa; B không được chọn.
Không đổi thời hạn dữ liệu giao dịch Core hoặc tự kết luận đáp ứng nghĩa vụ pháp lý;
xử lý yêu cầu xóa audit trước hạn là quyết định riêng còn mở.

**Audit khi yêu cầu xóa tài khoản — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Giữ tối thiểu có lý do, không quá hạn gốc”. Không tự xóa dây chuyền mọi
audit theo tài khoản, cũng không dùng nhãn audit để giữ toàn bộ hồ sơ. Chỉ giữ bản ghi/trường tối thiểu
còn có mục đích cụ thể, được ghi trong danh mục lưu/xóa: truy vết sự kiện bảo mật hoặc giao dịch nhạy cảm
đã thuộc phạm vi audit. Nêu lý do, phạm vi và mốc hết hạn gốc cho phần giữ trong kết quả xử lý yêu cầu;
không gia hạn 30 ngày do yêu cầu xóa hoặc việc điều tra. Phần không có căn cứ giữ phải được xử lý xóa
theo quy trình dữ liệu đủ điều kiện, không mặc định giữ đủ 30 ngày.

Tình huống: yêu cầu xóa hợp lệ khi audit còn hạn ở kho chính/bản xuất/backup/nguồn/hàng đợi.
Chỉ số/ngưỡng đề xuất: 0 bản ghi/trường được giữ mà không có lý do và hạn trong danh mục đã duyệt,
0 bản còn tồn quá hạn gốc, 0 kết quả báo đã xóa mọi dữ liệu khi audit liên quan vẫn còn.
Định danh nội bộ còn liên kết được với cá nhân không được gọi là đã ẩn danh hoàn toàn.
Giữ phản hồi có nội dung ≤ 24 giờ theo BR-38; chưa chốt hạn hoàn tất xóa phần audit đủ điều kiện,
không tự kế thừa hạn xóa chat/checkpoint hoặc coi phản hồi là xóa xong.
Điều kiện đo/nghiệm thu: tài khoản mẫu có audit bảo mật/giao dịch và phần dữ liệu không cần giữ,
có tài khoản đối chứng; đối chiếu danh mục, dữ liệu ở từng nơi lưu và nội dung phản hồi.
Phân biệt dọn/xóa được phép với can thiệp trái phép trong bài kiểm toàn vẹn; không sửa kết quả
nghiệp vụ hoặc làm mất dữ liệu tài khoản đối chứng. Chưa có danh mục thì chưa đủ căn cứ nghiệm thu.
Mức ưu tiên: A đã được chọn cho nghiệm thu chính sách xóa tài khoản có liên quan audit.
A bảo toàn truy vết tối thiểu có lý do, đổi lại kết quả xóa có thể còn phần giữ đến hạn;
B xóa toàn bộ audit liên quan khi tài khoản đủ điều kiện xóa, giảm dữ liệu còn lại nhưng mất khả năng
truy vết các sự kiện đó; B không được chọn. Không cấp quyền khách tự sửa/xóa audit hoặc thay quyền
đọc/xuất của chủ dự án; không coi mục đích kỹ thuật là xác nhận căn cứ pháp lý đã hoàn tất.
Căn cứ: BR-38/BR-39 và A-07 tại nguồn sản phẩm đã ghim; nguyên tắc giữ tối thiểu cho audit đã duyệt,
danh mục từng loại bản ghi/trường và căn cứ giữ vẫn cần chốt trước nghiệm thu.

**Hạn xóa phần audit đủ điều kiện — ngưỡng A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Xóa phần audit đủ điều kiện ≤ 24 giờ”. Hoàn tất xóa phần audit
đã đủ điều kiện tại lúc chấp nhận yêu cầu xóa tài khoản hợp lệ trong tối đa 24 giờ liên tục từ mốc
chấp nhận đó, tại các nơi do dự án quản lý: kho chính, bản tại nguồn/hàng đợi, bản xuất và backup.
Không đặt lại đồng hồ do retry, chuyển tiếp hoặc restart; nếu hạn gốc 30 ngày đến sớm hơn thì vẫn
phải dọn theo hạn gốc. Chỉ áp phần không có căn cứ giữ theo danh mục đã duyệt, không xóa phần audit
cần giữ hoặc giao dịch Core để đạt mục tiêu. Phần chỉ đủ điều kiện ở thời điểm sau phải có mốc/lý do
trong bảng lưu/xóa trước nghiệm thu; không tự coi toàn tài khoản đã đủ điều kiện ngay từ lúc yêu cầu.

Tình huống/ngưỡng: trong bộ ca, 0 bản/trường thuộc phần đủ điều kiện còn tồn tại sau hạn tương ứng,
0 lần báo xóa xong chỉ vì đã ẩn/chặn đọc và 0 bản bị xóa hồi sinh do replay/restore.
Điều kiện đo/nghiệm thu: manifest dữ liệu mẫu và mốc chấp nhận/đủ điều kiện/hạn gốc, đủ các nơi lưu,
có bản sao trộn dữ liệu cần giữ và tài khoản đối chứng; kiểm lỗi dọn/retry/restore.
Nếu không xóa riêng được trong backup, cần thay/dọn artifact và bảo toàn dữ liệu còn phải giữ;
không cho phép giữ bản thừa đến 30 ngày để né hạn mới hoặc xóa cả dữ liệu đối chứng.
Đối chiếu dữ liệu thực và kết quả dọn, báo phần còn giữ/chưa hoàn tất/lỗi; lỗi dọn là không đạt,
không tự gia hạn. Mức ưu tiên: A đã được chọn cho nghiệm thu xóa phần audit tự quản đủ điều kiện.
Mốc 24 giờ là mục tiêu thiết kế đã duyệt để việc xóa có hạn hoàn tất, chưa có phép đo tính khả thi;
không phải chuẩn bắt buộc hoặc tự kế thừa hạn phản hồi BR-38/hạn xóa chat.
B chờ thiết kế nơi lưu và phép đo rồi mới đề xuất hạn hoàn tất không được chọn.
Không mở quyền xóa dữ liệu thật hoặc hứa xóa bản sao ngoài quyền quản lý/thiết bị offline.

**Bộ nghiệm thu audit — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Đủ 6 nhóm audit, mọi ca đúng kỳ vọng”. Gom các chính sách ở mục [9.14.7](#9147-nfr-sec-02---nhật-ký-kiểm-toán-tối-thiểu) thành
sáu nhóm; không thêm mục đích thu dữ liệu, quyền hoặc ngưỡng thời gian mới.

| Nhóm | Tình huống và kết quả cần kiểm |
|---|---|
| AUD-01 — Sự kiện và dữ liệu | Đối chiếu sự kiện bắt buộc với kết quả Identity/Core, đúng chủ thể/đối tượng/kết quả và năm nhóm trường được phép; kiểm thành công/thất bại, retry, đầu vào chèn dòng/trường. Khi đường ghi khỏe không thiếu sự kiện bắt buộc; không lộ bí mật hoặc nội dung cấm. |
| AUD-02 — Đọc/xuất | Chỉ danh tính vận hành được phép đọc/xuất; kiểm cả đường ứng dụng/API/nơi lưu và đối chứng hợp lệ. Từng yêu cầu đọc/xuất có bằng chứng giữ bền theo chính sách, không ghi nội dung truy vấn/audit vào sự kiện mới; không cho xem dữ liệu nếu chưa giữ bền được bằng chứng yêu cầu. |
| AUD-03 — Đường ghi lỗi | Collector/mạng lỗi nhưng nguồn giữ bền được thì thao tác tiếp tục, restart/phục hồi không làm mất sự kiện còn hạn hoặc tạo giao dịch trùng. Không giữ bền được thì chặn thao tác nhạy cảm mới cần audit; nhánh đăng nhập thất bại/từ chối vẫn từ chối đúng và báo khoảng thiếu nếu không ghi được. Thanh toán bên ngoài đã xảy ra vẫn được xử lý trung thực. |
| AUD-04 — Toàn vẹn | Với tập đã có mốc đối chiếu tin cậy riêng, phát hiện sửa nội dung, xóa giữa/cuối tập; phân biệt dọn/xóa đúng chính sách với phá dữ liệu. Báo rõ giới hạn khi cả dữ liệu và mốc đối chiếu cùng bị kiểm soát; không suy đạt thành chống mọi người có toàn quyền máy/DB. |
| AUD-05 — Hạn lưu mọi bản tự quản | Kiểm bản chính, tệp xuất, backup, nguồn/hàng đợi trước/đúng/sau hạn gốc 30 ngày; xuất/retry/restore/điều tra không gia hạn. Tệp xuất còn phải dọn khi dùng xong; tệp trộn nhiều tuổi theo hạn sớm nhất đã duyệt. Không dùng chặn đọc thay chứng minh đã dọn, không xóa dữ liệu đối chứng để đạt. |
| AUD-06 — Xóa theo yêu cầu | Audit còn cần giữ có lý do/phạm vi/hạn trong danh mục; phần đã đủ điều kiện tại lúc chấp nhận yêu cầu được xóa ở mọi nơi tự quản trong ≤ 24 giờ, hoặc sớm hơn nếu hạn gốc đến trước. Kiểm backup trộn dữ liệu, lỗi dọn/retry/replay/restore, không hồi sinh dữ liệu đã xóa, không đổi giao dịch Core hoặc báo đã xóa hết khi vẫn còn phần giữ. |

Chỉ số/ngưỡng A đã duyệt: mọi ca trong manifest sáu nhóm phải đúng kỳ vọng, 0 vi phạm an toàn;
giữ các ngưỡng đã duyệt, không dùng tỷ lệ tổng bù lỗi quyền/dữ liệu. Ca đường ghi lỗi được đánh giá
theo chính sách suy giảm và báo thiếu đã chốt, không dựng bằng chứng hoặc coi mọi loại lỗi đều phải
không mất sự kiện. Sáu nhóm có thể gồm nhiều ca; chưa chạy/thiếu bằng chứng không được tính đạt.
Điều kiện đo: dữ liệu thử cô lập, build/cấu hình, danh mục sự kiện/giữ–xóa, inventory nơi lưu,
danh tính/quyền và mốc kiểm toàn vẹn được xác định; số lần lặp/cấu hình lỗi chốt trước chạy.
Mức ưu tiên: A đã được chọn cho nghiệm thu NFR-SEC-02 của demo.
Cách nghiệm thu: báo từng ca, đối chiếu kết quả nguồn và dữ liệu ở từng nơi lưu, có đối chứng;
không lưu nội dung audit hết hạn hoặc bí mật trong hồ sơ bằng chứng để né chính sách.
B chỉ kiểm ghi/đọc bình thường ít công hơn nhưng thiếu bằng chứng đường lỗi, toàn vẹn và xóa;
B không được chọn. Danh mục/schema, quyền dọn, cơ chế toàn vẹn, thời hạn chuyển tiếp/retry và tham số
thực thi còn phải cụ thể hóa; chọn bộ kiểm không đồng nghĩa thiết kế audit hoặc bộ NFR đã hoàn chỉnh.
