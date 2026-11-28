# Phục hồi và tính đúng đắn giao dịch

[← Tổng quan NFR](README.md)

## 9.7. NFR-DR-01 - Phục hồi dữ liệu thử từ bản sao lưu và kiểm chứng nghiệp vụ

**Hướng đã duyệt:** ngày 2026-11-17, trong hội thoại NFR, chủ sản phẩm chọn phục hồi từ backup;
giai đoạn xây dựng sẽ có tập lệnh tự động phục hồi sự cố (DR) độc lập và runbook kiểm chứng,
đo kết quả thực tế, không đòi thuê dịch vụ backup cloud trả phí liên tục. Vẫn giữ tập lệnh seed riêng
để reset dữ liệu thử khi cần. Đây là yêu cầu cho bước sau, chưa cấp quyền triển khai hoặc chạy diễn tập.
**Phạm vi và mức ưu tiên đã duyệt:** cùng ngày, chủ sản phẩm đồng ý với đề xuất chọn bài diễn tập
bắt buộc đầu tiên là **mất cơ sở dữ liệu nghiệp vụ, phục hồi sang cơ sở dữ liệu sạch**.
Giả định cấu hình ứng dụng và các dịch vụ phụ thuộc cần thiết vẫn sử dụng được. Mất toàn bộ máy chủ
không thuộc phạm vi bắt buộc của bài diễn tập này; chưa xác nhận khả năng phục hồi loại sự cố đó.
**DB mục tiêu đã duyệt ngày 2026-11-20:** bài đầu chỉ gây mất DB logic Cinema Core, phục hồi sang
Core DB sạch; DB các service khác/cấu hình/khóa vẫn có sẵn, kiểm đối chiếu phần liên quan trước mở lại
tác vụ trong phạm vi. RTO/RPO dưới đây chỉ áp bài Core đã khoanh; chi tiết tại mục [9.7.3](#973-db-mục-tiêu-của-bài-dr-đầu-tiên).
**Phương pháp đã duyệt ngày 2026-11-20:** bản sao logic toàn Core DB dạng custom bằng pg_dump,
mã hóa theo quyết định bảo vệ artifact; pg_restore vào DB sạch rồi kiểm dữ liệu/nghiệp vụ. Chi tiết tại mục [9.7.4](#974-phương-pháp-sao-lưu-cho-bài-core-db).
**Mức mất dữ liệu đã duyệt về nguyên tắc:** tiếp đó, chủ sản phẩm trả lời “tôi đồng ý với A”:
có thể mất dữ liệu thử phát sinh sau mốc phục hồi của backup, nhưng phải xác định và báo rõ
khoảng thời gian cùng các giao dịch/bản ghi bị mất; dữ liệu đã phục hồi phải nhất quán.
Lựa chọn này không chấp nhận mọi khoảng mất dữ liệu và không áp dụng thành cam kết cho giao dịch tiền thật.
**RTO bài diễn tập đã duyệt: tối đa 60 phút**, theo xác nhận tiếp theo của chủ sản phẩm ngày 2026-11-17.
**RPO bài diễn tập đã duyệt: tối đa 24 giờ**, theo xác nhận tiếp theo cùng ngày.
Chi tiết đo/nghiệm thu ngoài các mục tiêu đã duyệt vẫn là đề xuất; chưa có kết quả thực thi.

| Trường | Nội dung |
|---|---|
| Mục tiêu | Khôi phục dữ liệu đã tồn tại trước sự cố từ backup, kiểm chứng dịch vụ và nghiệp vụ sau phục hồi; không thay bằng tạo lại dữ liệu mẫu. |
| Tình huống | Trong môi trường thử cô lập, tạo dữ liệu/giao dịch nhận diện được, lấy backup rồi mô phỏng mất Core DB theo mục [9.7.3](#973-db-mục-tiêu-của-bài-dr-đầu-tiên); dùng DR scripts/runbook phục hồi sang Core DB sạch và đối chiếu kết quả. DB dịch vụ khác/cấu hình/khóa/phụ thuộc cần thiết vẫn dùng được. Manifest dữ liệu/phụ thuộc và cách gây sự cố chi tiết còn cần xác định. |
| Chỉ số thời gian | RTO đã duyệt đo từ lúc gây sự cố làm gián đoạn dịch vụ đến khi dịch vụ và bộ kiểm chứng nghiệp vụ đã thống nhất đều đạt; gồm restore và validation, không dừng khi DB vừa khởi động. Mục tiêu ≤ 60 phút trong điều kiện diễn tập đã xác định. Ghi riêng mốc phát hiện, bắt đầu/kết thúc restore và kiểm chứng; chưa có số đo thực tế. |
| Chỉ số dữ liệu | Ghi mốc sự cố, điểm dữ liệu khôi phục xác minh được và khoảng dữ liệu mất tính theo thời gian để đối chiếu RPO. Đối chiếu bản ghi/giao dịch đã commit trước sự cố với bản khôi phục, gồm mốc commit cuối trước sự cố, mốc khôi phục cuối xác minh được, số/mã bản ghi thiếu và các khoảng khuyết; không chỉ nhìn timestamp lớn nhất rồi kết luận không mất dữ liệu. Cách ghi mốc và đối chiếu chi tiết còn cần chốt. |
| Ngưỡng mục tiêu và căn cứ | Đã duyệt cho bài diễn tập: RTO ≤ 60 phút; RPO ≤ 24 giờ tính từ thời điểm sự cố tới mốc dữ liệu nhất quán khôi phục đã xác minh. Báo rõ phần dữ liệu thử bị mất, kiểm dữ liệu trước mốc đầy đủ/nhất quán. Mục tiêu thiết kế chưa phải kết quả đo đạt. Đề xuất chỉ công nhận phục hồi chức năng khi dữ liệu và bất biến nghiệp vụ trong phạm vi diễn tập được kiểm chứng. |
| Điều kiện đo | Công bố phiên bản, cấu hình, quy mô/trạng thái dữ liệu, thời điểm backup, cách gây lỗi, tài nguyên và dịch vụ thật/sandbox/stub. Dùng DB/volume thử riêng, không tác động dữ liệu daily hoặc worktree khác. Bản sao lưu phải tồn tại ngoài phạm vi bị phá của diễn tập; backup trên cùng đĩa không chứng minh chịu mất cả máy. |
| Mức ưu tiên | Bắt buộc cho bài diễn tập đầu tiên của mốc demo, theo phê duyệt phạm vi; chưa đồng nghĩa có cam kết DR thương mại. |
| Cách nghiệm thu đề xuất | Tập lệnh độc lập và runbook cho phép lặp lại chuỗi chuẩn bị dữ liệu → backup → sự cố → restore → kiểm chứng. Giữ phiên bản, định danh backup, mốc thời gian, kết quả đối chiếu dữ liệu và nghiệp vụ, lỗi và giới hạn; báo riêng phục hồi chức năng và đối chiếu RPO/RTO đã duyệt. Restore/validation lỗi phải báo lỗi rõ, không tự seed để tạo kết quả thành công. |
| An toàn giao dịch sau restore | Kiểm toàn bộ dữ liệu thử và các ca an toàn theo mục [9.7.1](#971-dự-thảo-chuỗi-kiểm-chứng-và-điểm-kết-thúc-phục-hồi)/[9.7.9](#979-bộ-tình-huống-nghiệm-thu-dr-tối-thiểu) đã duyệt: hold theo thời điểm hết hạn gốc, không khởi động lại TTL từ snapshot; đối chiếu trạng thái ghế/đơn/thanh toán/vé và xử lý callback lặp theo Core. Bản ghi khôi phục hoặc callback trùng không tự chứng minh thanh toán thành công hay được phép phát vé/thu tiền/hoàn tiền thêm. Fixture và thao tác cụ thể phải xác định trước diễn tập. |
| Seed và phần chưa chốt | Seed phục vụ reset test riêng, không chứng minh phục hồi dữ liệu cũ. Đã chọn logical dump custom/pg_restore tại mục [9.7.4](#974-phương-pháp-sao-lưu-cho-bài-core-db), hai thế hệ và nguyên tắc luân chuyển/dọn khi đóng bài tại mục [9.7.5](#975-số-thế-hệ-backup-cho-bài-dr)–[9.7.8](#978-vòng-đời-backup-theo-bài-diễn-tập). Version/tham số lệnh, thuật toán mã hóa, đường dẫn thực tế, dung lượng, tuổi lưu khi bài chưa đóng, manifest phụ thuộc và thao tác DR chi tiết còn mở. Topology/hosting tiếp tục theo quyết định hoãn, không suy phải mua dịch vụ cloud định kỳ. |
| Trạng thái và nguồn duyệt | Hội thoại NFR ngày 2026-11-17: đã duyệt DR scripts/runbook, seed riêng, phạm vi mất DB phục hồi sang DB sạch và nguyên tắc báo rõ dữ liệu thử bị mất/giữ nhất quán. Chủ sản phẩm lần lượt trả lời “tôi đồng ý với đề xuất của bạn” cho RTO ≤ 60 phút, sau đó RPO ≤ 24 giờ. Bảo vệ artifact/khóa được duyệt tiếp tại mục [9.7.2](#972-bảo-vệ-tệp-sao-lưu-và-khóa-phục-hồi) ngày 2026-11-20; chi tiết khác theo trạng thái từng mục. Chưa có implementation hoặc kết quả diễn tập. |

Cơ sở nghiên cứu, tra cứu ngày 2026-11-17:

- [AWS Reliability — Disaster Recovery objectives](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/disaster-recovery-dr-objectives.html)
  định nghĩa RTO là thời gian gián đoạn tối đa chấp nhận được, RPO là khoảng mất dữ liệu theo thời gian
  chấp nhận được; đây là mục tiêu do tổ chức xác định, không phải mọi kết quả đo đều đạt. Dùng nguồn
  để làm rõ thuật ngữ, không chọn AWS làm hạ tầng.
- [PostgreSQL — pg_verifybackup](https://www.postgresql.org/docs/current/app-pgverifybackup.html)
  nêu kiểm toàn vẹn base backup không bao phủ mọi kiểm tra khi server dùng backup; vẫn cần restore thử
  và kiểm DB hoạt động/dữ liệu đúng. Căn cứ này không chọn phương pháp backup hoặc yêu cầu dùng công cụ đó.

**RTO cho bài diễn tập đã duyệt:** hoàn tất phục hồi và kiểm chứng nghiệp vụ trong tối đa
**60 phút** từ thời điểm gây sự cố mất DB trong môi trường thử. Điều kiện: môi trường diễn tập và backup
đã được chuẩn bị, cấu hình ứng dụng và phụ thuộc cần thiết vẫn sử dụng được, bộ dữ liệu/phạm vi kiểm được công bố.
Kết thúc đo khi dịch vụ và các bước kiểm chứng nghiệp vụ đã thống nhất đều đạt, không phải khi DB vừa khởi động.
Chủ sản phẩm đã chọn mốc một giờ để giới hạn bài phục hồi bằng scripts/runbook trong một phiên diễn tập portfolio;
phương án 4 giờ đã được cân nhắc nhưng không được chọn.
Đây là lựa chọn mục tiêu cho tình huống đã khoanh, không phải chuẩn ngành, số đo đã đạt,
cam kết mọi sự cố thực tế được xử lý trong một giờ hoặc yêu cầu chủ dự án trực liên tục.
Không áp mốc này sang NFR-DUR-01 hoặc tự chọn RPO/lịch backup; các trường đó chốt riêng.

**RPO cho bài diễn tập đã duyệt:** chủ sản phẩm đã chọn phương án A — tối đa 24 giờ.
Khoảng từ thời điểm gây sự cố tới mốc dữ liệu nhất quán
có thể khôi phục đã xác minh không vượt quá **24 giờ**. Phần dữ liệu thử sau mốc đó có thể bị mất theo
nguyên tắc đã duyệt; phải báo rõ giao dịch/bản ghi thiếu và kiểm dữ liệu trước mốc vẫn đầy đủ/nhất quán.
Không lấy giờ tạo/tên file backup hoặc timestamp lớn nhất của một bản ghi làm bằng chứng duy nhất cho mốc phục hồi.
Mốc 24 giờ được chọn dựa trên việc đây là dữ liệu thử portfolio, chấp nhận mất lượt thử trong một ngày;
phương án 1 giờ đã được cân nhắc nhưng không được chọn. Đây là mức mất dữ liệu do chủ sản phẩm duyệt,
không phải chuẩn ngành hoặc năng lực đã kiểm chứng.
Chỉ áp dụng bài diễn tập đã khoanh, không cam kết cho giao dịch tiền thật và không tự đặt lịch backup hằng ngày,
chọn PITR/WAL hoặc thuê lưu trữ cloud. Cách tạo/lưu bản sao đáp ứng mục tiêu sẽ được thiết kế riêng.

### 9.7.1. Dự thảo chuỗi kiểm chứng và điểm kết thúc phục hồi

**Trạng thái: Đề xuất cụ thể hóa; chưa chạy diễn tập hoặc duyệt toàn bộ danh mục dữ liệu/phụ thuộc.**
DB mục tiêu Core đã duyệt tại mục [9.7.3](#973-db-mục-tiêu-của-bài-dr-đầu-tiên). Giữ phạm vi mất Core DB → DB sạch, cấu hình/phụ thuộc còn dùng được, RTO ≤ 60 phút,
RPO ≤ 24 giờ và seed riêng đã duyệt. Không thêm diễn tập mất toàn máy chủ.

| Bước/nhóm kiểm | Điều kiện và kết quả đề xuất |
|---|---|
| Khoanh phạm vi | Runbook định danh đúng môi trường/DB/volume thử, dịch vụ sở hữu, dữ liệu trong phạm vi và các phụ thuộc giả định còn hoạt động. Cinema Core sở hữu phần giao dịch cần kiểm; không suy một dump chứa toàn bộ dữ liệu của mọi service. Gán DB/bản ghi/cấu hình cụ thể trước khi chốt kế hoạch thực thi. |
| Chuẩn bị kỳ vọng | Dữ liệu mẫu có định danh đối chiếu, trạng thái/quan hệ mong đợi và lịch sử thao tác đã commit; phân biệt phần trước và sau điểm nhất quán có thể khôi phục. Giữ bằng chứng đối chiếu bên ngoài DB sẽ bị mất, không dùng timestamp lớn nhất làm đại diện duy nhất cho toàn bộ tập. |
| Bản sao và hồ sơ | Ghi định danh backup, build/schema/phương pháp, phạm vi dữ liệu/phụ thuộc và điểm phục hồi đã xác minh. Artifact tồn tại ngoài phạm vi phá của bài mất DB. Mã hóa/kiểm artifact theo mục [9.7.2](#972-bảo-vệ-tệp-sao-lưu-và-khóa-phục-hồi), logical dump custom/restore theo phương pháp đã duyệt tại mục [9.7.4](#974-phương-pháp-sao-lưu-cho-bài-core-db). |
| Bắt đầu sự cố | Ghi mốc làm gián đoạn dịch vụ và bắt đầu đồng hồ RTO; chỉ tác động tài nguyên thử đã định. Phần chọn/lấy backup, lấy khóa nếu có, giải mã/restore và validation sau sự cố đều thuộc thời gian khôi phục; không đặt lại đồng hồ khi retry. |
| Restore vào DB sạch | Khôi phục dữ liệu cũ bằng DR scripts/runbook, đúng phiên bản/schema/phạm vi; báo lỗi nếu artifact/phụ thuộc/điều kiện không đủ. Không chạy seed thay kết quả thất bại hoặc trả ứng dụng về trạng thái sẵn sàng khi chưa kiểm chứng. |
| Đầy đủ và nhất quán | Đối chiếu toàn bộ tập bản ghi/quan hệ kỳ vọng trước điểm phục hồi theo fixture, kiểm các khoảng khuyết và trường cần thiết. Ghi nhóm ghế/hold, đơn/thanh toán, vé/quyền ghế/trạng thái sử dụng và chống lặp liên quan khi nằm trong phạm vi; không chỉ kiểm số dòng hoặc DB health. |
| Hạn giữ ghế | Hold dùng thời điểm hết hạn gốc; hold đã hết hạn theo đồng hồ thẩm quyền không trở thành hold mới sau restore. Không cấp thêm 300 giây khi dịch vụ/DB khởi động lại hoặc khách chuyển kênh. |
| Đơn, tiền và vé | Trạng thái/quan hệ và quyền đúng nguồn; không tự biến giao dịch chưa rõ thành thành công hoặc phát lại vé/thu/hoàn tiền vì restore. Vé hiển thị sau kiểm chứng đúng quyền và bằng chứng Core; không dùng redirect hoặc dữ liệu mẫu mới tạo làm bằng chứng phục hồi giao dịch cũ. |
| Retry/callback và phụ thuộc | Kiểm truy vấn/gửi lại/callback phù hợp trên dữ liệu đã khôi phục, không tạo tác dụng phụ trùng. Với service/outbox/mô hình đọc liên quan, định rõ phần còn nguyên, phần cần restore/rebuild hoặc đối chiếu trước cho phép tác vụ tiếp tục. Không coi mỗi DB khôi phục riêng là tự nhất quán xuyên service. |
| Báo mất dữ liệu/RPO | Liệt kê mốc nhất quán khôi phục, khoảng mất dữ liệu và các định danh thử bị thiếu sau mốc đó; xác nhận phần trước mốc còn đủ/nhất quán. Đối chiếu khoảng từ sự cố tới điểm phục hồi ≤ 24 giờ. Tên file/giờ hoàn tất job không thay điểm dữ liệu; không giấu phần mất trong mức chấp nhận. |
| Kết thúc/RTO | Chỉ ghi mốc kết thúc khi dịch vụ trong phạm vi và các kiểm chứng dữ liệu/nghiệp vụ đã thống nhất đều đạt. Đối chiếu ≤ 60 phút; nếu sai trạng thái hoặc validation chưa xong thì chưa phục hồi đạt dù DB đã lên. Ghi riêng restore, validation, lỗi/retry và tổng thời gian. |
| Báo cáo và giới hạn | Giữ phiên bản/phạm vi, định danh artifact, mốc thời gian có múi giờ/cách đo, dữ liệu trước-sau, kết quả từng kiểm và phần chưa kiểm. Bằng chứng che secrets/PII theo phạm vi được phép. Kết quả chỉ chứng minh bài mất DB đã khoanh, không chứng minh tự động duy trì RPO 24 giờ hoặc chịu mất máy/đĩa. |

**Các điều kiện chưa chốt trước thực thi:** manifest dữ liệu/DB và phụ thuộc, phiên bản/tham số lệnh,
cách xác minh điểm nhất quán backup, lịch/tần suất/retention, công cụ mã hóa và cách gây lỗi/giữ bằng chứng.
Logical dump toàn Core DB dạng custom bằng pg_dump/pg_restore đã duyệt tại mục [9.7.4](#974-phương-pháp-sao-lưu-cho-bài-core-db). Đây là đầu vào thiết kế
cần hoàn thiện, không phải ngoại lệ nghiệm thu được cấp. Main `2a007797ac9ce542d9747aad0f44f3e430eec581`
tại `docs/05-specs/004-service-decomposition/spec.md` quy định DB logic theo service;
không mở rộng bài một DB thành phục hồi toàn hệ thống từ một artifact.

**Mức đối chiếu dữ liệu — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Đối chiếu toàn bộ dữ liệu thử”. Với bộ dữ liệu thử hữu hạn đã biết trước,
kiểm toàn bộ bản ghi, trường cần thiết và quan hệ kỳ vọng trong manifest Core tại điểm snapshot,
không chỉ lấy mẫu hoặc so số dòng. Tách bước đối chiếu dữ liệu vừa restore với snapshot khỏi
bước chạy ứng dụng/đối soát làm thay đổi trạng thái hợp lệ; ở bước sau, kỳ vọng phải tính đúng
thời gian hiện tại và quy tắc nghiệp vụ, như hold đã hết hạn không được sống lại.

Ngưỡng đã duyệt: không có sai khác ngoài các thay đổi kỳ vọng đã định nghĩa; mọi ca kiểm an toàn
ghế/hold, đơn–thanh toán–vé và xử lý lặp trong bộ kiểm đều đạt. Dữ liệu sau điểm phục hồi bị mất
phải được báo riêng theo RPO, không coi là sai khác với snapshot hoặc giấu đi để tính đạt.
Điều kiện đo: manifest/fixture và kỳ vọng nằm ngoài DB bị mất, schema/build xác định, môi trường
thử cô lập; danh mục phụ thuộc giữ nguyên/đối soát theo bảng trên. Nghiệm thu giữ kết quả từng
nhóm đối chiếu và từng ca nghiệp vụ; có sai khác chưa giải thích hoặc ca an toàn không đạt thì
chưa phục hồi đạt, đồng hồ RTO chưa kết thúc. A đã chọn làm mức đối chiếu cho bài DR đầu;
manifest, fixture và thao tác kiểm cụ thể vẫn cần hoàn thiện trước thực thi.

B đối chiếu lấy mẫu phần dữ liệu ngoài nhóm giao dịch trọng yếu, vẫn giữ toàn bộ ca an toàn,
giảm công xây kỳ vọng nhưng có thể bỏ sót dữ liệu thiếu/sai; không khuyến nghị cho bộ dữ liệu thử
nhỏ, có kiểm soát của portfolio; B không được chọn. Đây là lựa chọn độ bao phủ kiểm chứng đã duyệt,
chưa chọn số bản ghi, schema, ca kiểm cụ thể hoặc duyệt toàn bộ chuỗi thực thi tại mục này.

### 9.7.2. Bảo vệ tệp sao lưu và khóa phục hồi

**Phương án A: Đã duyệt ngày 2026-11-20.** Chủ sản phẩm trả lời “tôi đồng ý” cho mã hóa tệp backup,
giữ/có cách lấy khóa riêng bởi người có quyền và kiểm khóa đúng, sai, tệp hỏng/bị sửa; bản không hợp lệ
phải báo lỗi, không được coi phục hồi đạt. Có thể dùng file local, không bắt thuê backup cloud liên tục.
Chi tiết cơ chế/metadata/nghiệm thu bên dưới còn là đề xuất cụ thể hóa. Chưa chọn công cụ/thuật toán mã hóa,
đường dẫn thực tế hoặc lịch giữ; nơi lưu và cách kích hoạt đã duyệt tại mục [9.7.6](#976-cách-kích-hoạt-backup-cho-mốc-portfolio)–[9.7.7](#977-nơi-lưu-backup-của-bài-mất-core-db). Không áp hạn 7 ngày của log/trace sang backup.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Artifact sao lưu bị sao chép khỏi thư mục gốc, bị sửa/hỏng hoặc dùng sai khóa khi restore; cần bảo vệ dữ liệu và phát hiện bản sao không hợp lệ mà vẫn khôi phục được khi đủ điều kiện. |
| Phương án A đã duyệt | Mã hóa tệp sao lưu với kiểm tra tính toàn vẹn/xác thực phù hợp; người vận hành được phép giữ/có đường lấy khóa riêng, không gói khóa giải mã dùng được cùng artifact hoặc commit vào Git/log. Có thể áp dụng trên file local, không bắt thuê dịch vụ cloud trả phí liên tục. |
| Chỉ số và ngưỡng đề xuất | Trong bộ kiểm: bản sao/khóa đúng phục hồi được dữ liệu kỳ vọng; sai khóa hoặc artifact hỏng/bị sửa bị phát hiện và không được báo phục hồi đạt. Không có khóa/bản rõ nhạy cảm lộ trong repo, manifest/bằng chứng hoặc quyền ngoài phạm vi. Kiểm integrity không thay kiểm DB/nghiệp vụ. |
| Khả năng lấy khóa và bản rõ tạm | Runbook chỉ rõ cách người có quyền lấy đúng khóa trong điều kiện diễn tập; không suy giữ riêng thành không có cách khôi phục khóa. Nếu cần giải mã ra tệp tạm, giới hạn quyền/nơi tạo/vòng đời và xử lý sau sử dụng trong runbook. Không hứa xóa an toàn mọi bản sao nếu chưa có cơ chế/bằng chứng. |
| Điều kiện đo | Artifact/dữ liệu/khóa thử trong môi trường cô lập; ghi phiên bản, định danh, phạm vi và cách kiểm. Thử khóa đúng/sai, artifact hợp lệ và bản bị hỏng/sửa có kiểm soát. Không dùng khóa thật, tạo tài nguyên trả phí hoặc chạy vào DB daily từ phê duyệt thiết kế. |
| Mức ưu tiên | Đề xuất bắt buộc cho artifact dùng trong bài DR của mốc đầu; cần duyệt phạm vi và cơ chế trước nghiệm thu tương ứng. |
| Cách nghiệm thu | Bằng chứng cho thấy tệp được mã hóa, khóa được quản lý riêng/có thể lấy đúng bởi người có quyền; luồng đúng restore + validation đạt, các luồng lỗi dừng/báo trung thực. Không cho Core dùng dữ liệu chưa kiểm chứng hoặc dùng seed che lỗi. Thời gian lấy khóa/giải mã/kiểm sau sự cố vẫn tính trong RTO. |
| Đánh đổi và phương án B | A đã chọn tiếp tục bảo vệ nội dung khi file rời thư mục gốc, đổi lại cần quản lý khóa và bản rõ tạm; mất khóa có thể làm bản sao không phục hồi được. B chỉ giới hạn quyền thư mục local đã cân nhắc nhưng không chọn: ít quản lý khóa hơn nhưng không bảo vệ nội dung file khi đã sao chép ra ngoài. |

Căn cứ: [OWASP — Separation of keys and data](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#separation-of-keys-and-data),
[Cipher modes](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#cipher-modes)
và [Key Management — Escrow and backup](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html#escrow-and-backup).
Các nguồn hỗ trợ tách khóa, mã hóa có xác thực và khả năng khôi phục khóa, không bắt dùng KMS/HSM
hoặc quy định toàn bộ bộ kiểm ở đây. Checksum đặt cạnh file không tự chứng minh chống sửa có chủ đích;
phương pháp cụ thể vẫn cần thiết kế và kiểm chứng trước kết luận.

### 9.7.3. DB mục tiêu của bài DR đầu tiên

**Phương án A: Đã duyệt ngày 2026-11-20.** Chủ sản phẩm trả lời “tôi đồng ý” cho chỉ gây mất DB
Cinema Core, phục hồi sang Core DB sạch; DB các service khác vẫn có sẵn, đối chiếu dữ liệu liên quan
trước mở lại tác vụ trong phạm vi kiểm. Giữ RTO ≤ 60 phút/RPO ≤ 24 giờ cho bài này.
Không mở bài mất nhiều DB hoặc toàn máy chủ. Chi tiết manifest/phụ thuộc và kiểm chứng bên dưới
vẫn là đề xuất cụ thể hóa, chưa có runtime/diễn tập.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống | Trong môi trường thử, DB logic của Cinema Core bị mất/không dùng được; backup vẫn tồn tại, DB các service khác, cấu hình/khóa và phụ thuộc cần thiết còn sử dụng được. |
| Phương án A đã duyệt | Bài bắt buộc đầu tập trung mất Core DB → khôi phục sang Core DB sạch. Bản sao/phạm vi validation bao phủ dữ liệu gốc của Core được xác định trong manifest, không chỉ chọn vài bảng dễ kiểm. DB Identity, Catalog, Agent, Community, Notification và Reporting không bị gây mất trong bài này. |
| Dữ liệu giao dịch cần đối chiếu | Theo chủ sở hữu: rạp/phòng/sơ đồ/lịch/phiên bản phim theo suất và giá/điều kiện bán; hold/đơn/thu-hoàn/quyền vé-soát; hội viên, ưu đãi-voucher, combo và trạng thái chống lặp/outbox liên quan. Mapping schema/bản ghi/quan hệ thuộc manifest phải chốt theo thiết kế dữ liệu, không tạo schema từ NFR này. |
| Chỉ số và ngưỡng | Giữ RTO ≤ 60 phút tới khi Core/dữ liệu và các hành trình trong phạm vi kiểm đều đạt; RPO ≤ 24 giờ cho tập dữ liệu Core nhất quán đã xác minh. Báo dữ liệu thử sau điểm phục hồi bị mất, giữ dữ liệu trước điểm đầy đủ/nhất quán. Không lấy RPO/RTO của Core làm kết quả phục hồi các DB khác hoặc toàn hệ thống. |
| Phụ thuộc còn nguyên nhưng có thể lệch | Sau Core quay về mốc cũ, cache/khóa/queue Redis, outbox-CDC/sự kiện/dấu xử lý, index search, Reporting và căn cứ nghiệp vụ ở service khác có thể lệch. Runbook phải định rõ phần cần đối chiếu/vô hiệu/tạo lại theo đúng owner trước mở lại tác vụ liên quan; không flush toàn Redis, replay mọi sự kiện hoặc xóa dữ liệu service khác vì tiện. Không tự gửi email/thu-hoàn tiền lại vì Core không còn bản ghi. |
| Điều kiện đo | Cô lập đúng DB/tài nguyên thử, ghi build/schema/phạm vi, dữ liệu kỳ vọng và các điểm phụ thuộc được giữ nguyên. Identity vẫn xác thực đúng quyền; tham chiếu Catalog/owner khác vẫn được kiểm. Backup/khóa được chuẩn bị theo mục [9.7.2](#972-bảo-vệ-tệp-sao-lưu-và-khóa-phục-hồi) và không nằm trong phạm vi phá; metadata/giữ bằng chứng theo mục [9.7.1](#971-dự-thảo-chuỗi-kiểm-chứng-và-điểm-kết-thúc-phục-hồi). |
| Mức ưu tiên | Đề xuất phạm vi bắt buộc của bài DR đầu, phù hợp mục tiêu portfolio; các bài mất nhiều DB hoặc toàn máy là phạm vi khác, chưa được cấp từ lựa chọn này. |
| Cách nghiệm thu | Chứng minh chỉ gây mất Core DB đã định, restore DB sạch từ bản sao cũ, đối chiếu dữ liệu/bất biến và các luồng đặt trực tiếp/xem đơn-vé đúng quyền trong phạm vi. Kiểm TTL gốc và xử lý lặp, báo rõ khoảng mất dữ liệu/phần phụ thuộc lệch và kết quả xử lý. Không báo sẵn sàng nếu một phụ thuộc làm sai kết quả kiểm; seed không thay restore. |
| Đánh đổi và phương án B | A đã chọn tập trung hạt nhân giao dịch, giữ phạm vi sự cố kiểm chứng được của mốc đầu; không bao phủ mất dữ liệu các service khác. B mất nhiều DB đồng thời không chọn cho bài này, cần thiết kế điểm nhất quán/phụ thuộc, thứ tự và kiểm chứng riêng trước khi duyệt; không tự áp mốc 60 phút/24 giờ hoặc suy một artifact đủ cho mọi DB. |

Nguồn phạm vi: `docs/05-specs/004-service-decomposition/spec.md` tại main
`2a007797ac9ce542d9747aad0f44f3e430eec581` (mục service/data owners, DB logic riêng, transaction/outbox),
ADR-0004 (vai trò Redis), ADR-0007 (outbox/CDC/Kafka) và ADR-0030 (search dẫn xuất).
Đây là quyết định phạm vi bài thử đã duyệt, không phải Core DB/scripts đã triển khai hoặc cho phép gây sự cố.

### 9.7.4. Phương pháp sao lưu cho bài Core DB

**Phương án A: Đã duyệt ngày 2026-11-20.** Chủ sản phẩm trả lời “tôi đồng ý” cho bản sao logic đầy đủ
của Core DB bằng pg_dump, mã hóa/khóa riêng theo quyết định đã chốt và pg_restore sang DB sạch rồi
kiểm dữ liệu/nghiệp vụ. Dạng custom trong phương án A là định dạng archive cho pg_restore.
Chi tiết tương thích phiên bản/metadata/thao tác kiểm bên dưới là đề xuất cụ thể hóa; không tự pin
PostgreSQL/tool version, chọn hosting, lịch giữ hoặc cho phép viết/chạy scripts.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Cần artifact đầy đủ/nhất quán của Core DB để phục hồi vào DB sạch mà không phục hồi đè DB các service khác. Dữ liệu sau điểm sao lưu có thể mất trong giới hạn bài thử đã duyệt. |
| Phương án A đã duyệt | Tạo bản sao logic toàn Core DB bằng pg_dump dạng custom và phục hồi bằng pg_restore vào Core DB sạch. Giữ lớp mã hóa/khóa riêng theo mục [9.7.2](#972-bảo-vệ-tệp-sao-lưu-và-khóa-phục-hồi); format custom hoặc nén tự nó không phải mã hóa. Phạm vi dữ liệu theo manifest, không lọc bỏ bảng nghiệp vụ khó kiểm. |
| Snapshot và RPO | Bản sao phản ánh snapshot nhất quán của một DB, không bao gồm mọi thay đổi trong thời gian job chạy. Ghi/đối chiếu điểm snapshot và dữ liệu kỳ vọng để tính RPO ≤ 24 giờ, không dùng giờ file hoàn tất hoặc bản ghi mới nhất làm mốc đại diện. Không coi dump một DB là snapshot nhất quán mọi service. |
| Môi trường phục hồi | Chuẩn bị role/ownership/quyền, extensions và phụ thuộc tương thích theo manifest. Dump một DB không chứa mọi global role/tablespace hoặc file/config server cần tái tạo môi trường; không tự lấy secrets/DB service khác vào artifact. Điều kiện bài đầu vẫn là cấu hình/phụ thuộc còn sử dụng được. |
| Chỉ số và ngưỡng | Phục hồi thật và kiểm schema/quyền/dữ liệu/nghiệp vụ theo mục [9.7.1](#971-dự-thảo-chuỗi-kiểm-chứng-và-điểm-kết-thúc-phục-hồi)–[9.7.3](#973-db-mục-tiêu-của-bài-dr-đầu-tiên); tổng RTO ≤ 60 phút, RPO ≤ 24 giờ và không sai các bất biến trong phạm vi. Không coi đọc được mục lục archive hoặc hoàn tất lệnh nhưng có lỗi SQL là phục hồi đạt. |
| Điều kiện đo | Ghi phiên bản source/destination PostgreSQL, pg_dump, pg_restore và extensions; chọn bộ tương thích và thử trong môi trường cô lập. Dữ liệu/build/schema/đích và phương pháp mã hóa/kiểm artifact được định danh. Chưa chọn major version từ tài liệu `/current/`; không giả định version công cụ nào cũng xuất/nhập được mọi version server. |
| Mức ưu tiên | Đề xuất phương pháp chuẩn của DR scripts/runbook cho bài đầu, gắn phạm vi và kết quả đã duyệt. |
| Cách nghiệm thu | Xuất snapshot dữ liệu thử đã biết, mã hóa, gây mất đúng Core DB thử rồi giải mã/restore sang DB sạch. Ghi lỗi từng bước và kết luận thất bại nếu restore thiếu hoặc validation không đạt; không bỏ qua lỗi vì công cụ tiếp tục xử lý. Đối chiếu dữ liệu trước/sau, hold/đơn/tiền/vé/chống lặp và phần phụ thuộc liên quan, đo toàn bộ RTO/RPO. Không dùng pg_verifybackup cho logical dump để thay bước này. |
| Đánh đổi và phương án B | A đã chọn phù hợp phục hồi một DB logic và phạm vi snapshot của bài portfolio, nhưng chưa cung cấp PITR tới từng thời điểm hoặc phục hồi toàn cluster. B dùng base backup vật lý + WAL/PITR đã cân nhắc nhưng không chọn cho bài đầu: có khả năng chọn điểm phục hồi nhưng cần chuỗi WAL liên tục, dung lượng/kiểm chứng và kế hoạch phạm vi cluster; không restore đè DB service khác rồi coi chúng còn nguyên. |

Căn cứ đã tra Context7 và PostgreSQL chính thức: [pg_dump](https://www.postgresql.org/docs/current/app-pgdump.html),
[SQL dump](https://www.postgresql.org/docs/current/backup-dump.html),
[pg_restore](https://www.postgresql.org/docs/current/app-pgrestore.html),
[pg_basebackup](https://www.postgresql.org/docs/current/app-pgbasebackup.html)
và [Continuous archiving/PITR](https://www.postgresql.org/docs/current/continuous-archiving.html).
`pg_verifybackup` được dẫn ở mục [9.7](#97-nfr-dr-01---phục-hồi-dữ-liệu-thử-từ-bản-sao-lưu-và-kiểm-chứng-nghiệp-vụ) kiểm base backup với manifest, không phải archive logical custom.
Các nguồn xác nhận khả năng/giới hạn công cụ, không chứng minh dataset/hạ tầng chưa chọn đạt RTO/RPO.

### 9.7.5. Số thế hệ backup cho bài DR

**Phương án A đã duyệt ngày 2026-11-21:** chủ sản phẩm trả lời “tôi đồng ý” cho giữ hai thế hệ
backup hoàn chỉnh đã kiểm gần nhất, luân chuyển sau khi bản mới kiểm thành công, mã hóa/khóa/manifest
theo thiết kế đã chốt. RPO/RTO vẫn tính cho bản thực sự dùng và toàn bài, không reset khi đổi artifact.
Cách kích hoạt/nơi lưu được duyệt riêng tại mục [9.7.6](#976-cách-kích-hoạt-backup-cho-mốc-portfolio)–[9.7.7](#977-nơi-lưu-backup-của-bài-mất-core-db). Cụ thể hóa số thế hệ phục hồi của dữ liệu thử Core;
giữ scripts/runbook độc lập, không yêu cầu thuê backup cloud trả phí liên tục. Tuổi lưu/vòng đời
và đường dẫn thực tế vẫn cần chốt; số thế hệ không tự bảo đảm RPO hoặc chống mất toàn bộ máy.

Nếu backup chứa audit, điều kiện hết hạn gốc và chuẩn bị thế hệ thay thế tại mục [9.14.7](privacy-and-audit.md#9147-nfr-sec-02---nhật-ký-kiểm-toán-tối-thiểu)
đã được duyệt ngày 2026-11-22; bản đã hết hạn không tính là thế hệ hợp lệ để bắt đầu bài DR.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Bản mới nhất bị hỏng/không thể giải mã hoặc phục hồi; cần có điểm sao lưu khác để thử khôi phục mà không dùng seed thay dữ liệu đã mất. |
| Ngưỡng A đã duyệt | Sau khi chuẩn bị đầy đủ bộ DR, giữ hai thế hệ backup hoàn chỉnh đã kiểm phục hồi/đối chiếu gần nhất của Core DB thử, mỗi thế hệ có artifact mã hóa, manifest và mốc snapshot riêng. Hai bản chép của cùng một snapshot không tính là hai thế hệ; khóa/cách lấy khóa theo mục [9.7.2](#972-bảo-vệ-tệp-sao-lưu-và-khóa-phục-hồi). |
| Căn cứ và đánh đổi | Hai thế hệ là mức tối thiểu chủ sản phẩm chọn để có một thế hệ dự phòng khi thế hệ mới nhất không dùng được. B giữ một thế hệ không được chọn cho bộ DR này. Không phải quy tắc 3-2-1 hoặc bảo đảm backup production; dung lượng cần thiết và thời gian kiểm vẫn phải xác minh, không tự mua storage. |
| Thay thế và dọn bản cũ | Không xóa/ghi đè thế hệ còn dùng được trước khi ứng viên mới đã mã hóa, kiểm phục hồi/đối chiếu thành công và còn đủ hai thế hệ hợp lệ sau luân chuyển. Ứng viên lỗi không thay thế bản cũ. Dọn chỉ artifact thuộc bộ DR thử và đã xác định quyền/phạm vi; hồ sơ điều tra lỗi có chính sách riêng, không coi được phép giữ vô hạn. Thiết kế này chưa cấp quyền xóa file. |
| Chỉ số và ràng buộc | Đếm thế hệ hợp lệ/snapshot, kết quả restore/validation, kích thước, điểm dữ liệu phục hồi và tuổi so với sự cố. Bản thực sự dùng phải cho RPO ≤ 24 giờ và tổng RTO ≤ 60 phút đã duyệt, kể cả thời gian phát hiện bản hỏng/chọn bản khác/restore/kiểm. Nếu bản cũ ngoài RPO hoặc tổng thời gian quá RTO, báo không đạt dù đã cứu được một phần dữ liệu; không reset đồng hồ khi đổi artifact. |
| Điều kiện đo/nghiệm thu | Môi trường cô lập có hai thế hệ với dữ liệu/mốc snapshot biết trước và một ứng viên mới. Kiểm luân chuyển thành công, ứng viên sai khóa/hỏng/restore thiếu, rồi tình huống bản mới nhất đang giữ bị hỏng. Xác nhận bản cũ còn lấy/giải mã/restore được, so dữ liệu/nghiệp vụ và RPO/RTO. Kiểm phần còn lại/khóa/DB service khác nguyên vẹn; không gây lỗi artifact gốc đang dùng hoặc file phiên khác. |
| Mức ưu tiên và phần còn mở | A đã được chọn cho bộ DR đầu để có fallback artifact. Chốt lịch/tuổi/retention theo dữ liệu, thời điểm diễn tập, dung lượng và quyền xóa trước tự động hóa. Không áp log 7 ngày sang backup, không hứa tự sao lưu hằng ngày hoặc đạt RPO liên tục từ hai thế hệ được chuẩn bị cho một bài thử. |

Căn cứ đối chiếu ngày 2026-11-21:
[AWS Reliability — Verify backup integrity through recovery tests](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_backing_up_data_periodic_recovery_testing_data.html)
khuyến nghị phục hồi thử, đối chiếu dữ liệu và RTO/RPO thay vì giả định có file là phục hồi được.
Số hai thế hệ và quy tắc luân chuyển A là lựa chọn dự án đã duyệt, không phải con số do nguồn này ấn định.

### 9.7.6. Cách kích hoạt backup cho mốc portfolio

**Phương án A đã duyệt ngày 2026-11-21:** chủ sản phẩm trả lời “tôi đồng ý” cho chủ dự án
kích hoạt scripts độc lập theo nhu cầu trước mỗi bài diễn tập; các bước sao lưu, mã hóa,
kiểm phục hồi/đối chiếu và luân chuyển được tự động hóa. Chưa yêu cầu backup định kỳ
khi demo mở. Chi tiết điều kiện kiểm/nghiệm thu bên dưới vẫn là đề xuất cụ thể hóa;
không tự mở mục tiêu duy trì RPO liên tục hoặc chọn scheduler/hosting.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Cần tái lập bài mất Core DB với hai thế hệ backup đủ điều kiện mà không đòi dịch vụ backup cloud hoạt động liên tục; phải phân biệt tự động hóa các bước với chạy theo lịch không người kích hoạt. |
| Phương án A đã duyệt | Chủ dự án kích hoạt bộ scripts độc lập theo nhu cầu trong môi trường thử trước mỗi bài diễn tập. Scripts tự thực hiện các bước đã thiết kế: tạo backup, mã hóa, kiểm phục hồi/đối chiếu và luân chuyển. Chưa yêu cầu lịch chạy định kỳ khi demo mở; không dùng seed làm điểm phục hồi. |
| Điều kiện sẵn sàng | Trước gây lỗi vào DB thử, xác nhận đủ hai thế hệ có điểm snapshot/manifest và kết quả kiểm. Bản dự kiến dùng, kể cả bản cũ trong nhánh bản mới hỏng, phải có điểm dữ liệu cách mốc sự cố ≤ 24 giờ; kiểm khoảng thời gian thực sau khi gây lỗi để kết luận RPO, không chỉ dựa trên preflight. Thiếu bản hợp lệ/khóa hoặc quá cũ thì dừng chuẩn bị, báo chưa sẵn sàng; không gây mất DB rồi tự seed để tính đạt. |
| Chỉ số và ngưỡng | Kế thừa hai thế hệ, RPO ≤ 24 giờ/RTO ≤ 60 phút và bất biến đã duyệt. Ghi thời gian kích hoạt/backup/validation/snapshot/sự cố/restore; chuẩn bị trước sự cố báo riêng, không trộn vào RTO hoặc giấu việc phải làm lại bước sau sự cố. Không chọn ngày/giờ bằng cách sửa đồng hồ hoặc metadata để đáp ứng RPO. |
| Điều kiện đo/nghiệm thu | Môi trường/DB/volume thử được định danh; dữ liệu biết trước/sau mỗi snapshot và mốc sự cố, khóa/phụ thuộc còn dùng được. Kiểm một lần chuẩn bị đủ, bản thiếu/quá cũ, ứng viên thất bại và bản mới bị hỏng trong nhánh phục hồi. Đối chiếu artifacts, dữ liệu kỳ vọng và đồng hồ; không thử trên DB daily hoặc storage phiên khác. |
| Mức ưu tiên và đánh đổi | A đã được chọn làm cách chuẩn bị bài DR portfolio, thể hiện được automation/runbook mà không thêm vận hành theo lịch. B yêu cầu backup định kỳ trong suốt thời gian demo chạy để hướng tới RPO liên tục, nhưng cần chốt lịch, giám sát job thất bại/backup cũ và môi trường luôn chạy; B không được chọn cho mốc này. Không coi B mặc nhiên cần cloud trả phí, cũng không coi A chứng minh bảo vệ demo ở mọi thời điểm. |
| Phần còn mở | Đường dẫn lưu thực tế/tuổi lưu tối đa/ngoại lệ giữ bằng chứng, dung lượng, version/tool args/công cụ mã hóa và manifest dữ liệu/phụ thuộc cần hoàn thiện. Nơi lưu đã duyệt tại mục [9.7.7](#977-nơi-lưu-backup-của-bài-mất-core-db). Nếu sau này cần RPO liên tục, phải mở lại mục tiêu/lịch/giám sát và nghiệm thu tương ứng; không tự suy từ RPO của bài thử. Quyết định thiết kế không cho phép viết/chạy scripts hoặc xóa backup hiện có. |

Căn cứ A là phạm vi DR độc lập và RPO của bài diễn tập đã duyệt tại mục [9.7](#97-nfr-dr-01---phục-hồi-dữ-liệu-thử-từ-bản-sao-lưu-và-kiểm-chứng-nghiệp-vụ);
hai thế hệ là đầu vào đã duyệt tại mục [9.7.5](#975-số-thế-hệ-backup-cho-bài-dr). Đây là lựa chọn cách chuẩn bị của dự án,
không phải khuyến nghị dùng backup thủ công cho hệ thống vận hành thương mại.

### 9.7.7. Nơi lưu backup của bài mất Core DB

**Phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm trả lời “tôi đồng ý” cho lưu backup
mã hóa trong thư mục local riêng ngoài repository và ngoài vùng dữ liệu Core DB bị gây mất,
giữ khóa riêng. Có thể cùng máy/đĩa, chưa cần mua thiết bị hoặc thuê cloud. Chỉ áp dụng bài
mất Core DB tại mục [9.7.3](#973-db-mục-tiêu-của-bài-dr-đầu-tiên), không chứng minh chịu mất máy/đĩa. Chi tiết kiểm bên dưới vẫn là
đề xuất cụ thể hóa; chưa chọn đường dẫn thực tế, thiết bị hoặc công cụ quản lý khóa.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Khi gây mất Core DB thử, hai thế hệ backup đã kiểm và đường lấy khóa vẫn còn dùng được để phục hồi sang DB sạch. |
| Phương án A đã duyệt | Lưu artifact mã hóa và manifest trong thư mục local riêng ngoài repository và ngoài thư mục/volume dữ liệu Core DB thuộc phạm vi gây mất. Có thể cùng máy/đĩa; không yêu cầu mua thiết bị hoặc thuê cloud. Khóa giữ riêng, có quyền truy cập phù hợp và đường lấy hợp lệ theo mục [9.7.2](#972-bảo-vệ-tệp-sao-lưu-và-khóa-phục-hồi); chỉ khác thư mục chưa chứng minh cách ly quyền. |
| Chỉ số và ngưỡng | Trước gây lỗi: đủ hai thế hệ hợp lệ theo mục [9.7.5](#975-số-thế-hệ-backup-cho-bài-dr), không artifact/manifest/khóa cần phục hồi nào nằm trong phạm vi bị phá. Sau gây lỗi: đọc/kiểm artifact và lấy đúng khóa được; bản thực sự dùng vẫn phải đáp ứng RPO ≤ 24 giờ và toàn bài RTO ≤ 60 phút đã duyệt. Không thêm ngưỡng dung lượng hoặc tuổi lưu từ lựa chọn nơi lưu. |
| Điều kiện đo | Ghi đường dẫn tuyệt đối đã phân giải, mapping thư mục/volume/mount, đích gây lỗi và quyền đọc/ghi của người vận hành; xác minh chúng không chồng lấn qua đường dẫn liên kết hoặc mount. Dùng dữ liệu/DB thử cô lập, giữ nguyên DB service khác và tài nguyên phiên khác. Không đưa khóa/bản rõ vào Git, manifest hoặc log. |
| Mức ưu tiên | Đề xuất bắt buộc tách backup và đường lấy khóa khỏi phạm vi phá của bài DR đầu; thiết bị vật lý độc lập chưa là yêu cầu của mốc portfolio này. |
| Cách nghiệm thu | Runbook chỉ rõ đích gây lỗi và vị trí backup/khóa, dừng bước chuẩn bị nếu chồng lấn, thiếu bản hoặc không lấy được khóa. Bài đúng chứng minh sau mất Core DB vẫn lấy/giải mã/restore và đối chiếu dữ liệu/nghiệp vụ được; không chỉ kiểm file còn tồn tại. Giữ bằng chứng phạm vi, quyền, kết quả kiểm và thời gian; lấy khóa/restore sau sự cố vẫn tính trong RTO. |
| Phương án B và đánh đổi | B lưu artifact mã hóa trên thiết bị vật lý độc lập với đĩa chứa Core DB, giữ khóa riêng: giảm phụ thuộc vào đĩa đó nhưng cần thiết bị và kiểm khả năng truy cập; B không được chọn cho mốc này. A đã chọn phù hợp phạm vi sự cố đã khoanh và ngân sách demo; cùng máy/đĩa vẫn là điểm lỗi chung, không chứng minh chịu mất đĩa/máy hoặc bị chiếm toàn máy. |
| Phần còn mở | Đường dẫn/thiết bị thực tế, quyền/cơ chế giữ và lấy khóa, dung lượng, tuổi lưu/retention và ngoại lệ giữ bằng chứng chốt trước triển khai/nghiệm thu. Phê duyệt thiết kế không cho phép gây lỗi, xóa dữ liệu hoặc viết/chạy scripts. |

Căn cứ đối chiếu ngày 2026-11-21:
[OWASP — Separation of keys and data](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html#separation-of-keys-and-data)
hỗ trợ tách khóa khỏi dữ liệu mã hóa và tăng cách ly khi dùng hệ thống riêng;
[AWS Reliability — Recovery tests](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/rel_backing_up_data_periodic_recovery_testing_data.html)
hỗ trợ restore thử, đối chiếu dữ liệu và RTO/RPO. Chọn A là quyết định theo phạm vi bài thử của dự án,
không phải hai nguồn xác nhận lưu cùng máy/đĩa đủ bảo vệ mọi sự cố hoặc dự án đã đạt mục tiêu.

### 9.7.8. Vòng đời backup theo bài diễn tập

**Phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn “A — Dọn khi đóng bài”.
Giữ hai thế hệ trong lúc chuẩn bị/diễn tập; sau khi bài hoàn tất và chủ dự án kiểm tra/chấp nhận
hồ sơ kết quả, đóng bài và kích hoạt dọn các tệp backup dữ liệu thử của bài. Giữ báo cáo đã loại
dữ liệu nhạy cảm; bài sau tạo và kiểm lại backup. Quy tắc đóng bài thất bại được duyệt tiếp
cùng ngày ở phần dưới. Chi tiết kiểm/nghiệm thu bên dưới vẫn là đề xuất cụ thể hóa;
chưa đặt thời hạn theo ngày hoặc chọn công cụ dọn.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Bộ DR dùng dữ liệu thử, được kích hoạt trước mỗi bài. Cần giữ đủ bản để thử phục hồi nhưng tránh tích lũy payload qua nhiều bài không có mục đích rõ. |
| Phương án A đã duyệt | Quản lý backup theo từng bài: giữ hai thế hệ hợp lệ trong lúc chuẩn bị/diễn tập theo mục [9.7.5](#975-số-thế-hệ-backup-cho-bài-dr); khi bài đã hoàn tất và chủ dự án kiểm tra/chấp nhận hồ sơ kết quả, đóng bài và kích hoạt dọn payload thuộc bài đó theo runbook. Lưu hồ sơ đã loại dữ liệu nhạy cảm để trình bày portfolio. Bài sau tạo/kiểm lại đủ hai thế hệ trước gây lỗi; không dùng kết quả kiểm cũ thay bước chuẩn bị. |
| Chỉ số và ngưỡng | Giữ số thế hệ và RPO/RTO đã duyệt trong bài đang hoạt động. Sau bước dọn thành công, không còn payload/bản rõ tạm thuộc phạm vi dọn đã khai báo; không mất backup bài đang chạy hoặc file ngoài phạm vi. Không tuyên bố xóa an toàn mọi bản sao trên thiết bị từ việc xóa file. |
| Điều kiện đo | Môi trường thử cô lập, định danh bài và manifest toàn bộ artifact/đường dẫn thuộc quyền dọn. Hồ sơ kết quả đã được kiểm, nêu rõ các payload được giữ/xóa và kết quả dọn. Chưa xóa khóa còn cần cho artifact khác hoặc xóa dữ liệu daily/phiên khác. |
| Mức ưu tiên | A đã được chọn cho vòng đời backup bài hoàn tất của mốc portfolio; phải xác định phạm vi dọn trước tự động hóa. Không cung cấp điểm phục hồi thường trực cho demo đang mở. |
| Cách nghiệm thu | Kiểm đóng một bài hoàn tất, dọn đúng payload, giữ hồ sơ đã lọc dữ liệu nhạy cảm và chuẩn bị lại bài kế tiếp. Thử đóng khi thiếu hồ sơ, bài chưa hoàn tất hoặc lỗi dọn: phải báo trạng thái thực, không báo đã dọn hay tự xóa bằng chứng đang cần điều tra. Kiểm file ngoài manifest nguyên vẹn. |
| Phương án B và đánh đổi | B giữ hai thế hệ giữa các bài và thay khi ứng viên mới kiểm đạt; tiện thử lại nhưng cần chính sách tuổi lưu/dung lượng và dữ liệu được giữ rõ ràng; B không được chọn cho mốc này. A đã chọn giảm dữ liệu tồn và không cần tự đặt số ngày cho payload bài thành công, đổi lại phải chuẩn bị lại backup mỗi bài. |
| Phần còn mở | Nguyên tắc đóng bài thất bại và chủ dự án quyết định dọn đã duyệt ở phần dưới; thời hạn rà soát theo ngày và xử lý bài bị bỏ dở lâu còn mở, không mặc nhiên giữ vô hạn. Vòng đời hồ sơ kết quả, danh sách trường được giữ, dung lượng và cơ chế dọn cụ thể còn mở. Quyết định thiết kế không cấp quyền xóa artifact hoặc viết/chạy scripts. |

Căn cứ là dữ liệu thử, hai thế hệ và kích hoạt trước mỗi bài đã duyệt tại mục [9.7.3](#973-db-mục-tiêu-của-bài-dr-đầu-tiên)–[9.7.6](#976-cách-kích-hoạt-backup-cho-mốc-portfolio).
Đây là lựa chọn vòng đời đã duyệt cho bài hoàn tất của dự án, không phải thời hạn lưu do tiêu chuẩn bên ngoài ấn định.

**Bài thất bại — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Cho đóng bài không đạt”. Giữ các tệp cần điều tra trong khi chủ dự án đang xử lý;
trước lần chạy lại hoặc đóng bài, rà soát trạng thái và quyết định tiếp tục
điều tra, chạy lại hoặc đóng với kết quả không đạt. Chỉ dọn khi chủ dự án chấp nhận hồ sơ
đã loại dữ liệu nhạy cảm và xác nhận không còn cần các tệp đó để điều tra. Đóng bài thất bại
không biến kết quả thành đạt; lỗi chưa xử lý vẫn được ghi rõ. B chỉ cho dọn sau một lần chạy lại đạt
giữ khả năng điều tra lâu hơn nhưng có thể kéo dài lưu trữ khi không tiếp tục bài; B không được chọn cho mốc này.

Điều kiện kiểm đề xuất: môi trường thử cô lập, định danh bài và manifest artifact; gây lỗi backup,
restore hoặc validation, rồi kiểm cả nhánh chạy lại và đóng với kết quả không đạt. Chỉ số/ngưỡng:
không dọn tệp đang cần điều tra hoặc ngoài manifest; không báo đạt khi chưa có bằng chứng đạt;
sau bước dọn thành công không còn payload trong phạm vi dọn đã công bố. Phạm vi ưu tiên là
hoàn thiện vòng đời bài DR đầu, không đặt thêm ngưỡng RPO/RTO. Thời hạn rà soát theo ngày,
xử lý bài bị bỏ dở lâu và thời hạn giữ báo cáo vẫn còn mở; quyết định này không giải quyết bằng
cam kết giữ vô hạn hoặc tự xóa khi hết giờ.

### 9.7.9. Bộ tình huống nghiệm thu DR tối thiểu

**Phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn “A — Đủ 6 nhóm tình huống”.
Mọi nhóm và biến thể phải cho kết quả đúng kỳ vọng; DR-01/DR-02 phục hồi thật, đạt RPO ≤ 24 giờ
và RTO ≤ 60 phút; các ca lỗi phải phát hiện/dừng đúng, không báo đã phục hồi.
Sáu nhóm dưới đây bắt nguồn từ đường phục hồi
và các điểm lỗi đã nêu tại mục [9.7.1](#971-dự-thảo-chuỗi-kiểm-chứng-và-điểm-kết-thúc-phục-hồi)–[9.7.8](#978-vòng-đời-backup-theo-bài-diễn-tập); số nhóm là độ bao phủ tình huống, không phải số đợt
đo hoặc ngưỡng độ tin cậy thống kê. Chưa chọn số lần lặp, dataset và công cụ gây lỗi.

| Mã nhóm | Tình huống và kết quả kỳ vọng đề xuất |
|---|---|
| DR-01 | Bản mới nhất hợp lệ: mất Core DB thử, restore sang DB sạch, đối chiếu toàn bộ dữ liệu kỳ vọng và mọi ca an toàn trong bộ kiểm. Kiểm hold đã hết hạn không sống lại, trạng thái đơn–thanh toán–vé đúng và xử lý lặp không tạo tác dụng phụ trùng. Kết luận phục hồi đạt chỉ khi RPO ≤ 24 giờ/RTO ≤ 60 phút và dữ liệu/nghiệp vụ đều đạt. |
| DR-02 | Bản mới nhất bị hỏng/sửa có kiểm soát trên bản thử; phát hiện không hợp lệ, dùng thế hệ dự phòng còn hợp lệ và trong RPO. Đối chiếu theo DR-01 với snapshot của bản thực sự dùng; tổng RTO gồm phát hiện lỗi/chọn bản khác/restore/validation, không reset đồng hồ. |
| DR-03 | Không lấy được khóa đúng: kiểm biến thể thiếu khóa và sai khóa, không có đường lấy khóa hợp lệ trong ca. Phát hiện và báo lỗi, không mở dữ liệu chưa kiểm hoặc dùng seed để báo phục hồi đạt; không lộ khóa/bản rõ trong hồ sơ. |
| DR-04 | Chuẩn bị chưa đủ: kiểm thiếu thế hệ hợp lệ và bản cần dùng quá cũ so với RPO. Dừng trước gây mất DB, báo chưa sẵn sàng. Không giả mốc snapshot hoặc sửa đồng hồ/metadata để đạt điều kiện; không báo là một lần phục hồi đạt. |
| DR-05 | Restore báo lỗi có kiểm soát: ghi rõ lỗi, không đưa DB phục hồi dở vào phục vụ tác vụ, không tự seed hoặc bỏ qua lỗi để báo sẵn sàng. Ghi bài không đạt nếu chưa phục hồi và kiểm chứng xong trong RTO. |
| DR-06 | Restore hoàn tất nhưng validation phát hiện dữ liệu thiếu/sai hoặc bất biến nghiệp vụ vi phạm: phát hiện sai khác, giữ tác vụ liên quan chưa sẵn sàng và báo chưa phục hồi đạt; không lấy DB health/số dòng hoặc exit code lệnh thay kết quả đối chiếu. |

Điều kiện đo: mỗi ca có môi trường/DB/volume thử, artifact/manifest, build/schema, snapshot và
kỳ vọng riêng được định danh; phụ thuộc còn dùng được theo phạm vi đã khoanh. Chỉ gây lỗi lên
tài nguyên/bản chép thử được chỉ định, không làm hỏng backup gốc còn cần hoặc dữ liệu phiên khác.
DR-03–DR-06 phải xác định rõ lỗi có trước sự cố hay phát sinh sau sự cố, kèm hành vi dừng tương ứng.

Chỉ số và nguyên tắc nghiệm thu đã duyệt: mọi nhóm và các biến thể nêu trên phải cho kết quả đúng kỳ vọng;
không lấy trung bình hoặc số ca thành công bù ca bỏ lọt lỗi. Giữ kết quả từng ca, trạng thái phục hồi,
sai khác, mốc thời gian và giới hạn. DR-01/DR-02 phải phục hồi thật và đạt cả RPO/RTO đã duyệt.
Ở ca lỗi, kiểm thử có thể đạt vì phát hiện/dừng đúng, trong khi trạng thái phục hồi vẫn là chưa đạt;
không công bố toàn bộ ca là các lần phục hồi thành công. Vòng đời hồ sơ/backup theo mục [9.7.8](#978-vòng-đời-backup-theo-bài-diễn-tập).

Mức ưu tiên: A đã được chọn làm bộ nghiệm thu của mốc portfolio, gồm cả đường thành công và kiểm lỗi.
B chỉ chọn DR-01 để trình diễn nhanh, chưa bao phủ các đường lỗi đã xác định; không khuyến nghị
làm bộ nghiệm thu hoàn chỉnh; B không được chọn. Chi tiết dataset, cấu hình và thao tác kiểm chưa chốt.
Phạm vi này chưa bổ sung mất máy/nhiều DB,
chưa chứng minh tính sẵn sàng thương mại và không cấp quyền viết/chạy scripts hoặc gây lỗi.

## 9.15. NFR-COR-01 - Tính đúng đắn giao dịch khi tranh chấp và xử lý lặp

**Yêu cầu kế thừa:** các ranh giới/bất biến ở [mục 1–8](../domain-context.md#1-ranh-giới-thẩm-quyền) và đặc tả chat đã xác định thẩm quyền Core,
giữ ghế nguyên tử, TTL gốc và xử lý thanh toán chưa rõ/lặp. Bảng này cụ thể hóa cách chứng minh,
không thay quy tắc nghiệp vụ hoặc chốt trạng thái/API mới. Cấu trúc hai bài tải đã được duyệt bên dưới;
chi tiết đo/nghiệm thu còn là đề xuất.

| Trường | Nội dung |
|---|---|
| Mục tiêu | Tăng tải, retry hoặc chuyển kênh/provider không tạo quyền ghế trùng, giữ ghế một phần trái quy tắc hoặc tác dụng phụ giao dịch lặp. |
| Tình huống | Nhiều tài khoản đồng thời xin cùng ghế/danh sách ghế giao nhau; yêu cầu được gửi lại sau timeout; callback lặp, khác attempt hoặc đến muộn; đổi kênh trực tiếp/chat. Bao phủ cả yêu cầu hợp lệ không tranh chấp. |
| Chỉ số đề xuất | Số quyền giữ/bán xung đột trên cùng ghế/suất, hold một phần trái quy tắc, TTL bị khởi động lại trái phép, phát vé/hoàn tiền trùng do xử lý lặp, xác nhận thiếu căn cứ; số yêu cầu thành công/từ chối nghiệp vụ đúng và lỗi hệ thống. |
| Ngưỡng mục tiêu | Không có vi phạm bất biến trong bộ kịch bản, tương ứng 0 vi phạm; từ chối đúng do ghế đã bị giữ/bán không tự là lỗi khả dụng, không đạt bằng từ chối mọi yêu cầu. Dưới tải hỗn hợp đã duyệt: p95 đọc ≤ 1 giây, tạo hold/lập đơn ≤ 2 giây và lỗi hệ thống < 1%, đánh giá riêng từng thao tác và tỷ lệ lỗi toàn bài. Không suy kiểm hữu hạn thành bảo đảm không lỗi ngoài thực tế. |
| Điều kiện đo | Đã duyệt tăng 0→20 phiên trong 60 giây, giữ 20 phiên/10 phút ổn định, gồm 16 duyệt/4 đặt vé; nghỉ 2 giây giữa thao tác người dùng, không chèn giữa lời gọi tự động. Bài một ghế: 20 tài khoản đồng thời/10 vòng. Dữ liệu/DB/volume cô lập; ghi phiên bản/topology/tài khoản/ghế/suất; phân biệt Core thật với mock. Chỉ kết luận nhiều replica khi thực sự chạy topology đó. Dữ liệu chi tiết và ca tranh chấp bổ sung còn mở. |
| Mức ưu tiên | Bắt buộc theo các bất biến giao dịch hiện có, kể cả khi dùng dữ liệu thử. |
| Cách nghiệm thu đề xuất | Đối chiếu trạng thái lưu và tác dụng phụ sau các lệnh đồng thời/lặp, không chỉ tổng số HTTP thành công. Kiểm trạng thái chưa rõ/đối soát theo quy tắc Core, không tự biến khoản thu trùng thành đã hoàn hoặc phát thêm vé. Giữ kết quả từng ca và phiên bản; không dùng tốc độ cao để bù giao dịch sai. |
| Giới hạn và phần chưa chốt | Đã chốt tải hỗn hợp/ngưỡng/3 đợt, một ghế 20 tài khoản/10 vòng, hai danh sách giao nhau/10 vòng và ba nhóm retry/callback mỗi nhóm 10 vòng. Biến thể chi tiết, dữ liệu, công cụ gây lỗi và dừng còn mở. Chưa có kết quả runtime Core/cổng thật; BFF mock không thay bằng chứng này. |

**Cấu trúc kiểm thử tải đã duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý”
cho đề xuất tách hai bài: tranh chấp cùng ghế/suất và tải hỗn hợp
khám phá/đặt vé/xem đơn trên dữ liệu phân tán; báo riêng kết quả nghiệp vụ, lỗi hệ thống và thời gian xử lý.
Tăng tải có kiểm soát để tìm giới hạn quan sát được, với điều kiện dừng đã thống nhất;
không chọn số người dùng lớn chỉ để trình bày và không suy số người dùng ảo thành người dùng thật.
Cơ sở phương pháp đã tra cứu: [Grafana — Automated performance testing](https://grafana.com/docs/k6/latest/testing-guides/automated-performance-testing/)
phân biệt kịch bản, workload và môi trường đo. Cấu trúc hai bài là lựa chọn đã duyệt của dự án;
đã chốt mốc hỗn hợp bên dưới nhưng chưa đầy đủ cấu hình workload hoặc xác nhận năng lực hệ thống.

**Dữ liệu nền cho nghiệm thu đã duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý”
cho đề xuất dùng dữ liệu mẫu của một chuỗi có ít nhất hai rạp
và ít nhất hai khách hàng riêng biệt. Hai rạp là mức tối thiểu để thử ranh giới quyền giữa các rạp;
hai khách hàng để thử quyền sở hữu đơn/vé, không phải dự báo lượng người truy cập hoặc giới hạn sản phẩm.
Mỗi rạp có phòng/suất để kiểm, với sơ đồ phòng khác nhau và các loại ghế đã chốt; có dữ liệu/tài khoản
theo vai trò để kiểm quyền được cấp, không tự cấp quyền từ tên tài khoản mẫu.
Đơn/vé/hold gồm các trạng thái cần thiết của từng kịch bản và có kết quả mong đợi nhận diện được.
Dữ liệu seed/reset, dữ liệu tải và dữ liệu phục hồi có định danh/phiên bản riêng trong môi trường thử;
không thay dữ liệu vận hành hoặc tự seed sau restore lỗi.
Số phòng/ghế, phim/suất, đơn lịch sử và phân bố/trạng thái cụ thể còn cần xác định trước phép đo.
Khi kiểm hiệu năng trên tập dữ liệu lớn hơn, tăng quy mô có kiểm soát và công bố số bản ghi/phân bố;
không suy kết quả của tập nền nhỏ thành năng lực xử lý dữ liệu lớn.

**Mốc tải hỗn hợp ban đầu đã duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý với đề xuất của bạn”
cho phương án A — **20 phiên người dùng ảo đồng thời, duy trì 10 phút**
ở pha tải ổn định, không tính pha khởi động/tăng tải. Phạm vi là các hành trình trực tiếp qua Core:
khám phá phim/suất, giữ ghế/lập đơn và xem đơn/vé trên dữ liệu phân tán. Bài tranh chấp ghế có cấu hình riêng.
Đây là mốc kiểm chứng thiết kế cho portfolio, không phải dự báo người dùng thật hoặc giới hạn tối đa hệ thống;
20 phiên ảo không đồng nghĩa 20 request đồng thời, 20 request/giây hoặc 20 người thật hoạt động theo cùng cách.
Chọn mốc này để có tải nhiều phiên tái lập được, rồi bài tăng tải riêng tìm giới hạn quan sát;
phương án 50 phiên ở pha ổn định đã cân nhắc nhưng không được chọn cho mốc ban đầu.
Không có căn cứ khẳng định cấu hình hạ tầng chưa chọn đáp ứng 20 hoặc 50 phiên; cần đo xác nhận.
Phân bố/nhịp hành trình đã duyệt bên dưới; trước chạy phải xác định tài khoản/phiên và dữ liệu đủ cho thời lượng,
không để cạn ghế làm bài tải biến thành chỉ toàn từ chối. Giữ vai trò, một hold hiệu lực/tài khoản và TTL theo Core.
Dùng Core/persistence thật trong môi trường thử để kết luận tải Core, phân biệt với BFF mock;
cổng thanh toán/email/AI bên ngoài dùng sandbox/stub theo phạm vi test được duyệt riêng, không tự tạo giao dịch
tiền thật, gửi email hàng loạt hoặc gọi LLM thật theo toàn bộ tải. Tốc độ/usage nhà cung cấp phải có bằng chứng riêng.
Phân bố phiên và khoảng nghỉ đã duyệt bên dưới; tài nguyên/topology, dữ liệu, số lượt lặp,
điều kiện dừng còn cần chốt; ngưỡng độ trễ đọc/ghi và tỷ lệ lỗi đã duyệt bên dưới.

**Phân bố hành trình tải hỗn hợp đã duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời
“tôi đồng ý với đề xuất của bạn” cho **16 phiên duyệt thông tin và 4 phiên đặt vé**
trong pha ổn định 20 phiên. Đây là tỷ lệ số phiên đang chạy từng hành trình, không phải tỷ lệ HTTP request,
lượt truy cập thật hoặc kết luận 80% khách chỉ xem và 20% khách mua.
Nhóm 16 phiên lặp hành trình khám phá phim, xem chi tiết và tra rạp/suất/sơ đồ ghế, không tạo hold.
Nhóm 4 phiên dùng tài khoản riêng, lặp hành trình chọn suất/ghế, hold, lập đơn, nhận kết quả thanh toán
qua phản hồi cổng được giả lập theo hợp đồng, rồi tra đơn/vé. Core thật phải xác minh, ghi nhận và phát hành;
không để stub tự tạo vé thành công thay Core. Không gọi cổng thật hoặc gửi email khách thật theo tải này.
Phân bố được chọn để bài có cả đọc và ghi giao dịch trong phạm vi benchmark nhỏ của portfolio,
không phải dự báo nhu cầu thị trường. Dữ liệu phải đủ phòng/suất/ghế theo thời lượng, tách khỏi bài tranh chấp;
không reset DB giữa pha tải để che cạn dữ liệu hoặc làm sai thời gian đo. Khi cần dữ liệu mới phải thiết kế
từ trước và ghi rõ thao tác chuẩn bị, không đụng DB daily hoặc dữ liệu của phiên khác.
Nhịp thao tác/tăng tải đã duyệt bên dưới; cách chọn dữ liệu, số bản ghi và ánh xạ API chi tiết còn cần chốt.

**Nhịp và tăng tải hỗn hợp đã duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý với đề xuất của bạn”:
đưa số phiên từ 0 lên 20 trong **60 giây**, phân bố
tăng theo hai nhóm tới 16 duyệt/4 đặt vé; sau đó giữ đúng mức này trong **10 phút** đã duyệt.
Pha tăng tải được ghi riêng, không cộng vào 10 phút hoặc gộp với phân bố độ trễ pha ổn định.
Trong từng phiên, chờ **2 giây giữa các thao tác người dùng được mô phỏng**, tính sau khi thao tác trước
đã trả kết quả đúng; không chèn chờ nhân tạo giữa các lời gọi máy-máy thuộc cùng thao tác hoặc xử lý callback.
Khoảng nghỉ không nằm trong thời gian phản hồi API/tác vụ đang đo. Danh mục bước người dùng và API tự động
phải được ánh xạ trước khi thực thi; không biến mọi request thành một thao tác có nghỉ để giảm tải ngoài ý muốn.
Đây là nhịp benchmark cố định được chọn để tái lập và tránh khởi phát toàn bộ phiên cùng một thời điểm,
không phải số liệu quan sát hành vi khách thật hoặc bài kiểm đột biến tải. Bài tranh chấp/tăng tải tìm giới hạn
có cấu hình riêng; không dùng nhịp này để suy ra tốc độ request cố định.
Khi kết thúc pha ổn định, không phát sinh hành trình mới; cách hoàn tất tác vụ đang chạy/giới hạn thời gian
dừng an toàn cần được thiết kế riêng, không bỏ giao dịch đang chạy hoặc tự hủy/hoàn mù.

**Ngưỡng phản hồi API Core dưới tải hỗn hợp đã duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời
“tôi đồng ý với đề xuất của bạn” cho đọc 1 giây, ghi 2 giây ở ít nhất 95% yêu cầu mỗi loại thao tác.

| Nhóm thao tác | Mục tiêu đã duyệt ở pha ổn định |
|---|---|
| Đọc thông tin | Phân vị 95 ≤ 1 giây, đánh giá riêng từng loại tra phim/suất/sơ đồ ghế hoặc đơn/vé. |
| Ghi giao dịch | Phân vị 95 ≤ 2 giây, đánh giá riêng tạo hold và lập đơn; không gộp thao tác đọc nhanh để che ghi chậm. |

Đề xuất đo tại máy tạo tải từ lúc bắt đầu gửi yêu cầu tới khi nhận đủ phản hồi, gồm mạng tới điểm vào
API được công bố cùng xử lý BFF/gateway/Core/DB thực sự đi qua. Không chèn khoảng nghỉ 2 giây vào chỉ số,
không chỉ đo thời gian nội bộ server rồi gọi đó là thời gian phản hồi từ phía khách.
Áp cấu hình tải hỗn hợp đã duyệt và dữ liệu đủ cho bài; công bố endpoint, tài nguyên/topology, mạng,
dữ liệu/cache, số mẫu và cách tính phân vị. Yêu cầu hợp lệ theo kịch bản phải trả đúng kết quả nghiệp vụ.
Báo riêng lỗi hệ thống, timeout và từ chối nghiệp vụ; không bỏ chúng khỏi báo cáo hoặc dùng lỗi trả nhanh
làm bằng chứng đạt tốc độ. Định nghĩa tỷ lệ lỗi/mẫu số theo đoạn đã duyệt bên dưới; tốc độ không bù lỗi an toàn.
Không gồm thời gian người dùng chọn/nhập, cổng thanh toán xử lý bất đồng bộ hoặc chờ LLM/email bên ngoài;
không suy chỉ số này thành thời gian hoàn thành mua vé, chỉ số Web Vitals hoặc năng lực provider thật.
Mốc 1/2 giây là mục tiêu trải nghiệm được chủ sản phẩm chọn cho benchmark portfolio: đọc nhanh, cho phép thêm thời gian
cho khóa/ghi giao dịch. Không phải chuẩn ngành, benchmark đã đo hoặc bảo đảm cấu hình chưa chọn đáp ứng.
Phương án đọc 2 giây/ghi 3 giây đã được cân nhắc nhưng không được chọn.

**Tỷ lệ lỗi hệ thống dưới tải hỗn hợp đã duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời
“tôi đồng ý với đề xuất của bạn” cho phương án A — **dưới 1%** ở pha ổn định,
đánh giá riêng từng loại thao tác và tổng toàn bài. Mẫu số là toàn bộ yêu cầu của loại thao tác được phát
trong pha đó, gồm yêu cầu không nhận được phản hồi; tử số gồm lỗi server, mất kết nối, timeout,
phản hồi sai hợp đồng/kết quả mong đợi hoặc từ chối bất ngờ với dữ liệu/yêu cầu hợp lệ.
Một yêu cầu chỉ tính một lần trong tử số dù có nhiều dấu hiệu lỗi; lần gửi lại là yêu cầu riêng và phải
báo cả số lần thử cùng kết quả hành trình, không coi retry thành công là xóa lỗi của lần trước.
Từ chối nghiệp vụ đúng đã được định trước là kết quả hợp lệ, báo riêng; sai quyền/ghế/tiền/vé hoặc trạng thái
trái bất biến vẫn khiến phần an toàn không đạt dù tỷ lệ lỗi hệ thống dưới 1%.
Phép đo độ trễ phải đi cùng kiểm kết quả; lỗi trả nhanh không được dùng làm bằng chứng chất lượng phản hồi.
Mốc dưới 1% là mức chấp nhận lỗi tạm thời đã được chủ sản phẩm chọn cho benchmark portfolio; mọi lỗi quan sát vẫn phải
báo và phân tích, không miễn xử lý lỗi chỉ vì còn trong ngưỡng. Phương án 0 lỗi hệ thống đã cân nhắc nhưng
không được chọn làm ngưỡng lỗi hệ thống của bài tải này. Đây không phải chuẩn ngành, số đo đã đạt
hoặc cam kết lỗi vận hành dài hạn. Với tập nhỏ, báo số lỗi/số mẫu thô, không làm tròn để che vượt ngưỡng.
Không áp ngưỡng này sang bài cố ý gây lỗi, tranh chấp ghế hoặc quyền truy cập rồi suy cùng mẫu số.

**Bài tranh chấp một ghế đã duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý với đề xuất của bạn”:
**20 tài khoản khách hàng khác nhau** cùng gửi yêu cầu
giữ **một ghế đơn đang trống của cùng suất**, thực hiện **10 vòng**, mỗi vòng dùng dữ liệu/mốc bắt đầu sạch
đã chuẩn bị ngoài pha đo. Không dùng Sweetbox một ghế vì vi phạm quy tắc chọn cặp.
Mỗi tài khoản hợp lệ, đã xác minh theo yêu cầu nghiệp vụ, không có hold còn hiệu lực từ trước; tất cả yêu cầu
cùng điều kiện giá/suất/ghế, có định danh thao tác riêng. Máy tạo tải đồng bộ điểm phát lệnh để tạo cạnh tranh,
ghi thời điểm phát/nhận; không khẳng định mọi request đến DB đúng cùng một thời điểm.
Trong điều kiện Core/phụ thuộc khỏe và không cố ý gây lỗi, mỗi vòng phải có **đúng 1 hold thành công**,
**19 từ chối do ghế đã được giữ**, và chỉ một quyền giữ ghế trong dữ liệu Core. Không đạt nếu tất cả đều bị từ chối,
nhiều hơn một thành công, có hold một phần hoặc xuất hiện lỗi hệ thống/timeout ngoài kết quả mong đợi.
Đối chiếu API, trạng thái lưu và chủ sở hữu, không chỉ đếm HTTP. Từ chối đúng không tính là lỗi hệ thống;
không áp mức lỗi < 1% của bài hỗn hợp để bù sai lệch trong bài đúng/sai này.
Mỗi vòng kiểm xong mới giải phóng theo nghiệp vụ hoặc dùng ghế/suất và tài khoản thử khác đã chuẩn bị;
không reset dữ liệu đang đo, tự kéo dài TTL, sửa thẳng trạng thái để che lỗi hoặc chạm DB daily.
Mốc 20 tài khoản khớp số phiên benchmark đã chọn; 10 vòng cho quan sát lặp ban đầu, không phải chứng minh
thống kê mọi mức tải. Bài nhiều ghế giao nhau đã duyệt bên dưới; retry/callback vẫn cần bộ ca riêng;
không suy qua bài một ghế thành đã chứng minh toàn bộ tính đúng đắn giao dịch.

**Bài nhiều ghế giao nhau đã duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý với đề xuất của bạn”:
hai tài khoản khách hợp lệ cùng gửi yêu cầu hold
hai danh sách **[X, Y]** và **[Y, Z]** của một suất, trong **10 vòng**; X/Y/Z là ba ghế đơn ban đầu trống,
không thuộc cặp Sweetbox, và hai tài khoản không có hold còn hiệu lực trước vòng kiểm.
Trong điều kiện Core/phụ thuộc khỏe, mỗi vòng đúng một danh sách được giữ đầy đủ và danh sách còn lại
bị từ chối vì tranh chấp Y. Y chỉ có một chủ giữ; ghế riêng của danh sách bị từ chối phải còn trống,
không được giữ một phần dù nằm trước/sau ghế tranh chấp trong thứ tự xử lý.
Kiểm phản hồi cùng dữ liệu Core về từng ghế/chủ hold; không đạt nếu cả hai bị từ chối ngoài mong đợi,
cả hai thành công, có ghế riêng bị giữ trái phép hoặc có lỗi hệ thống/timeout. Có thể đổi thứ tự phần tử
theo ma trận ca được định trước để tránh chỉ kiểm một đường xử lý, không yêu cầu bên X hoặc Z luôn thắng.
Mỗi vòng dùng dữ liệu riêng hoặc dọn hợp lệ sau khi đã đối chiếu kết quả, ngoài pha đo; không sửa trạng thái
để che lỗi hoặc chạm dữ liệu phiên khác. Danh sách không giao nhau cần ca đối chứng hợp lệ.
Số 10 vòng khớp bài một ghế đã duyệt, nhằm quan sát lặp ban đầu; không phải chứng minh mọi cạnh tranh.
Đây là cách kiểm chứng nguyên tắc nguyên tử đã được chủ sản phẩm duyệt, không đổi giới hạn 6 ghế, TTL hoặc Sweetbox.

**Bộ kiểm gửi lại và callback lặp đã duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời
“tôi đồng ý với đề xuất của bạn” cho ba nhóm tình huống sau, mỗi nhóm **10 vòng**
với dữ liệu/định danh giao dịch thử riêng. Giữ đối chiếu API, bản ghi Core và tác dụng phụ trước/sau.

| Nhóm tình huống | Kết quả bắt buộc theo bất biến hiện có |
|---|---|
| Bấm/gửi lại cùng thao tác hợp lệ | Cùng danh tính, ý định, nội dung và định danh thao tác, thử cả tuần tự và đồng thời; không tạo thêm hold/đơn/payment attempt ngoài hợp đồng hoặc kéo dài TTL. Cùng khóa nhưng nội dung khác phải bị xử lý theo hợp đồng xung đột, không âm thầm đổi giao dịch. |
| Core đã ghi nhận nhưng phản hồi bị mất | Tạo mất phản hồi có kiểm soát sau commit; khách tra cứu/thử lại an toàn vẫn xác định đúng kết quả Core, không tự kết luận thất bại hoặc tạo giao dịch mới để thay kết quả chưa rõ. Kiểm tài khoản khác không được tái sử dụng định danh để đọc/đổi giao dịch của chủ cũ. |
| Cổng gửi lặp cùng kết quả thanh toán | Sau khi một thông báo hợp lệ đã được Core xử lý, gửi lại cùng sự kiện 10 lần, gồm tuần tự và một đợt đồng thời theo lịch định trước; chỉ một lần ghi nhận hiệu lực thanh toán/phát hành quyền vé, không phát thêm quyền hoặc kích hoạt khoản thu/hoàn mới. |

Số 10 vòng là mức lặp thiết kế đồng nhất với các bài tranh chấp cho portfolio, không phải chứng minh mọi
thứ tự sự kiện. Danh sách biến thể, số request/đợt đồng thời cho nhóm gửi lại và vị trí gây mất phản hồi cần ghi
trước khi chạy. Giữ trạng thái trung thực với dữ liệu chưa rõ; một kết quả thành công cuối không xóa tác dụng phụ trùng.
Callback giả lập đúng hợp đồng phải đi qua xác minh Core; tách ca giả mạo/chữ ký sai, khác số tiền/đơn,
khác attempt hoặc thành công sau hết hạn thành các ca âm/đối soát riêng, không coi chúng là bản sao hợp lệ.
Không dùng cổng thật/tiền thật và không tự suy callback hợp lệ nghĩa tiền đã thực sự chuyển ở nhà cung cấp.
Tỷ lệ lỗi < 1% của tải hỗn hợp không bù bất kỳ vi phạm bất biến nào ở bộ này; mẫu lỗi chủ động và kết quả
mong đợi được báo riêng. Chưa chọn cách lưu khóa xử lý lặp hoặc cơ chế retry; không thay hợp đồng Core.

**Số đợt nghiệm thu tải hỗn hợp đã duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời
“tôi đồng ý với đề xuất của bạn” cho **3 đợt** với cấu hình 20 phiên,
16 duyệt/4 đặt, tăng 60 giây, ổn định 10 phút, nghỉ 2 giây đã duyệt. Mỗi đợt độc lập phải đạt
ngưỡng p95 đọc ≤ 1 giây, tạo hold/lập đơn ≤ 2 giây, lỗi hệ thống < 1% theo từng loại thao tác và toàn bài,
không có vi phạm bất biến. Không gộp mẫu hoặc lấy trung bình ba đợt để bù một đợt không đạt;
giữ cả đợt lỗi/dừng sớm trong báo cáo, không thay bằng một đợt tốt hơn rồi gọi đủ ba đợt đạt.
Cùng phiên bản, cấu hình/topology/tài nguyên và dữ liệu tương đương có định danh; chuẩn bị lại chỉ trước
mỗi đợt ngoài pha đo, không reset giữa pha để xóa trạng thái lỗi hoặc cạn ghế. Cache/trạng thái khởi động
được ghi rõ và giữ theo kịch bản, không trộn điều kiện để suy kết quả tương đương.
Nếu sửa phần tác động hành vi/hiệu năng thì cần bộ ba đợt mới ở phiên bản cuối trước khi kết luận đáp ứng;
bằng chứng cũ giữ nguyên cho phiên bản cũ. Ba đợt tương ứng 30 phút tải ổn định cùng 3 phút tăng tải,
chưa tính chuẩn bị, dừng an toàn và đối chiếu dữ liệu. Cách chia lịch không tự cấp quyền chạy tải.
Số ba là lựa chọn nghiệm thu đã duyệt cho portfolio để quan sát lặp, không phải bảo đảm thống kê,
không thay bài tranh chấp hoặc bài tăng tải tìm giới hạn. Cấu hình dừng và dữ liệu chi tiết chốt riêng.

### 9.15.1. Tăng tải tìm giới hạn quan sát và dừng an toàn

**Nguyên tắc A đã duyệt ngày 2026-11-20:** chủ sản phẩm trả lời “tôi đồng ý” cho tăng tải từng bậc
ở bài tìm giới hạn riêng, ngừng tăng khi bậc có p95 đọc > 1 giây, ghi hold–đơn > 2 giây hoặc lỗi ≥ 1%,
dừng phát yêu cầu mới ngay khi vi phạm ghế/quyền/tiền/vé và kiểm trạng thái sau giảm tải.
Mức tăng/thời lượng mỗi bậc/trần dừng chưa chốt, phải dựa trên môi trường thử.
Cụ thể hóa hướng tăng tải có kiểm soát đã duyệt;
không đổi benchmark 20 phiên/10 phút × 3 đợt, không đặt mục tiêu số người dùng thật mới.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Sau kiểm mốc tải chuẩn, cần biết ở cấu hình đã công bố hệ thống bắt đầu không giữ được chất lượng tại mức tải nào, đồng thời bảo toàn ghế/quyền/tiền/vé. |
| Nguyên tắc A đã duyệt | Tăng theo từng bậc tải đã lập trước, dùng workload tương đương bài hỗn hợp (tỷ lệ hành trình/nhịp nghỉ), dữ liệu đủ và cùng topology. Mỗi bậc có pha ổn định/số mẫu đủ theo kế hoạch; chỉ tăng tiếp khi bậc hiện tại được đánh giá đạt. Không tăng không giới hạn: chốt bậc tăng, thời lượng, trần tải/thời gian/tài nguyên trước chạy. Benchmark chuẩn vẫn có kết quả độc lập; chưa đạt mốc chuẩn thì báo chênh lệch, không dùng số phiên cao hơn bù lại. |
| Chỉ số và tiêu chí ngừng tăng đề xuất | Theo từng thao tác/bậc: tải thực, thông lượng, p95, lỗi hệ thống/mẫu số, kết quả nghiệp vụ, tài nguyên và số yêu cầu đang chờ. Khi một bậc ổn định có p95 đọc > 1 giây, hold/lập đơn > 2 giây hoặc lỗi hệ thống ≥ 1% theo định nghĩa mục [9.15](#915-nfr-cor-01---tính-đúng-đắn-giao-dịch-khi-tranh-chấp-và-xử-lý-lặp), ngừng tăng và kết thúc bài có kiểm soát. Đây là mốc dừng khảo sát dùng lại mục tiêu chất lượng đã duyệt, không phải cam kết mọi tải đều đạt. Bậc có dữ liệu/phép đo không hợp lệ không được tính đạt hoặc tiếp tục tăng như thể đã đạt. |
| Điều kiện dừng ngay | Vi phạm bất biến ghế/quyền/tiền/vé, tác động nhầm tài nguyên ngoài môi trường thử hoặc chạm ngưỡng bảo vệ tài nguyên đã thống nhất thì ngừng phát yêu cầu mới ngay để kiểm tra. Không cần chờ hết bậc hoặc tỷ lệ sai vượt 1%; 1% không miễn lỗi an toàn. Máy tạo tải nghẽn, thiếu dữ liệu/ghế hoặc phụ thuộc giả lập lỗi phải được phân biệt với giới hạn Core, không tự diễn giải thành năng lực tối đa sản phẩm. |
| Dừng và quan sát sau tải | Ngừng cấp lượt mới; theo dõi yêu cầu đang chạy trong thời hạn hữu hạn sẽ chốt theo hợp đồng timeout. Giữ định danh/bằng chứng để tra cứu yêu cầu chưa rõ, không ép mọi trạng thái thành thất bại hoặc replay/hủy/hoàn mù. Sau giảm tải, kiểm đường đọc/hold/lập đơn và trạng thái Core trở lại điều kiện kỳ vọng, ghi thời gian/tồn đọng/việc phải can thiệp. Mục tiêu hồi phục sau quá tải phải đề xuất từ nhu cầu/phép đo riêng, không tự áp RTO restart/DR. |
| Điều kiện đo | Core/persistence thật trong môi trường thử cô lập, ghi SHA/build/topology/tài nguyên/mạng/dữ liệu/cache và cấu hình máy tạo tải. Không gọi LLM, cổng thanh toán hoặc gửi email thật theo tải này; sandbox/stub công bố rõ. Kết quả chỉ đúng cấu hình/workload được kiểm; không suy số phiên thành RPS, người thật hoặc hệ thống nhiều replica nếu chưa chạy. |
| Mức ưu tiên và đánh đổi | Bài bổ sung chứng minh năng lực portfolio sau benchmark chuẩn, không thay kiểm đúng đắn/an toàn bắt buộc. A đã được chọn: tăng từng bậc để xác định khoảng tải bắt đầu suy giảm. B tăng đột ngột tới mức cao không được chọn làm bài tìm giới hạn đầu tiên; chưa thêm yêu cầu kiểm đột biến độc lập từ lựa chọn này. |
| Cách nghiệm thu | Báo từng bậc gồm bậc không đạt/dừng, nguyên nhân dừng, dữ liệu/định danh giao dịch và kiểm sau tải. Nếu có bậc đạt rồi bậc không đạt, chỉ công bố khoảng quan sát giữa hai bậc trong điều kiện đã ghi; nếu dừng ở trần an toàn khi vẫn đạt thì chưa tìm thấy điểm suy giảm. Không lấy bậc cao nhất đã thử làm năng lực tối đa hoặc giấu lần lỗi để nâng số trình bày. |
| Phần còn mở | Mức tăng, trần/thời gian/tài nguyên, thời lượng/số mẫu từng bậc, timeout/dừng các yêu cầu đang chạy và mục tiêu hồi phục cần chốt sau khi biết môi trường/phép đo. Cách tính p95/phân nhóm kết quả đã duyệt tại mục [9.15.2](#9152-cách-tính-p95-và-phân-nhóm-kết-quả-api). Thiết kế này không cấp quyền chạy tải hoặc chọn thêm hạ tầng. |

Căn cứ đối chiếu ngày 2026-11-20:
[Google SRE — Handling Overload](https://sre.google/sre-book/handling-overload/) nêu chi phí mỗi loại request khác nhau
và cần xét tài nguyên khi đánh giá năng lực. Nguyên tắc A là lựa chọn dự án đã duyệt, không phải cấu hình
do nguồn quy định; mốc 1/2 giây và < 1% dùng lại phê duyệt benchmark ở mục [9.15](#915-nfr-cor-01---tính-đúng-đắn-giao-dịch-khi-tranh-chấp-và-xử-lý-lặp).

### 9.15.2. Cách tính p95 và phân nhóm kết quả API

**Phương án A đã duyệt ngày 2026-11-21:** chủ sản phẩm trả lời “tôi đồng ý” cho p95
nearest rank trên yêu cầu thành công đúng nghiệp vụ, tách từng thao tác/đợt, báo lỗi/từ chối riêng,
giữ lỗi < 1% trên toàn bộ request đã phát kể cả timeout/mất phản hồi; không đủ mẫu thì chưa đủ bằng chứng đạt.
Cỡ mẫu tối thiểu được duyệt tiếp tại mục [9.15.3](#9153-cỡ-mẫu-tối-thiểu-cho-p95-api); timeout còn đề xuất tại mục [9.15.4](#9154-timeout-yêu-cầu-http-của-máy-tạo-tải). Cụ thể hóa phép đo benchmark/từng bậc tải;
giữ p95 đọc ≤ 1 giây, hold/lập đơn ≤ 2 giây và lỗi hệ thống < 1% từng thao tác/toàn bài đã duyệt.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Cùng API có phản hồi thành công, lỗi/timeout hoặc từ chối nghiệp vụ; lỗi nhanh có thể làm p95 tổng trông tốt dù người dùng không hoàn thành tác vụ. |
| Phương án A đã duyệt | Tính p95 nghiệm thu riêng từng loại thao tác trên các yêu cầu thành công đúng kết quả nghiệp vụ kỳ vọng, đo từ bắt đầu gửi tới nhận đủ phản hồi/đã kiểm kết quả. Báo phân bố độ trễ/số lượng riêng cho lỗi hệ thống và từ chối nghiệp vụ đúng; không gộp nhóm này vào p95 thành công. HTTP 2xx với nội dung sai không thuộc nhóm thành công; từ chối bất ngờ với dữ liệu hợp lệ thuộc lỗi theo mục [9.15](#915-nfr-cor-01---tính-đúng-đắn-giao-dịch-khi-tranh-chấp-và-xử-lý-lặp). |
| Chỉ số và cách tính đã duyệt | Với N yêu cầu thành công đúng của một thao tác trong một đợt/bậc, sắp thời gian tăng dần, p95 là mẫu vị trí ceil(0,95 × N), dùng nearest rank cho kết luận. N = 0 thì không có p95 hợp lệ, không tính đạt. Báo N, số phát/từ chối/lỗi, phân bố thời gian lỗi và số hoàn thành đúng trong ngưỡng trên toàn bộ yêu cầu phát của thao tác; tỷ lệ sau là thông tin bổ sung, không tự đặt ngưỡng mới thay < 1% lỗi hệ thống. Không mặc định phân vị nội suy của công cụ tương đương nearest rank. |
| Mẫu và điều kiện đo | Chọn các request bắt đầu gửi trong pha ổn định đã định; pha tăng tải báo riêng. Theo dõi các request đó tới kết thúc/timeout hữu hạn kể cả kết thúc sau pha, không bỏ mẫu chậm ở ranh giới. Giữ định danh từng attempt/retry, dùng cùng điểm vào API/mạng/topology/dữ liệu đã công bố. Ba đợt độc lập và từng thao tác xét riêng, không gộp để bù; cỡ mẫu đủ cho từng thao tác phải chốt trước chạy, không dùng p95 đẹp của nhóm quá ít mẫu làm bằng chứng đủ. |
| Mức ưu tiên và đánh đổi | A đã được chọn làm cách tính thống nhất trước nghiệm thu hiệu năng, cho thấy tốc độ tác vụ thành công và lỗi qua hai điều kiện độc lập; bắt buộc báo cả hai. B tính một p95 trên mọi phản hồi nhận được không được chọn vì trộn lỗi nhanh/từ chối với thành công. Không thay cách tính mẫu/lỗi Web/native đã duyệt riêng. |
| Cách nghiệm thu | Dùng bộ số liệu thử có thành công chậm, lỗi trả nhanh, từ chối đúng, 2xx sai nội dung, timeout và request qua ranh giới pha; kiểm phân nhóm, p95 nearest rank và tỷ lệ lỗi theo mục [9.15](#915-nfr-cor-01---tính-đúng-đắn-giao-dịch-khi-tranh-chấp-và-xử-lý-lặp). Một báo cáo chỉ được kết luận đạt khi từng nhóm thành công đủ mẫu đạt p95, lỗi từng thao tác/toàn bài < 1% và không vi phạm an toàn. Không đạt bằng từ chối toàn bộ yêu cầu; ca đáng lẽ thành công nhưng bị từ chối vẫn tính lỗi. |
| Phần còn mở | Số mẫu tối thiểu benchmark đã duyệt tại mục [9.15.3](#9153-cỡ-mẫu-tối-thiểu-cho-p95-api); timeout/drain, ánh xạ endpoint/kết quả hợp lệ và công cụ/xuất số liệu cần chốt trước thực thi. Không tự áp timeout đang đề xuất hoặc chạy kiểm tải từ thiết kế này. |

Căn cứ đối chiếu ngày 2026-11-20:
[Google SRE — Monitoring Distributed Systems, Latency](https://sre.google/sre-book/monitoring-distributed-systems/#the-four-golden-signals)
khuyến nghị tách độ trễ thành công và lỗi, vẫn theo dõi độ trễ lỗi.
Nearest rank đã được chọn để thống nhất với phương pháp Web/native của dự án, không phải thuật toán nguồn bắt buộc;
ngưỡng API và định nghĩa lỗi giữ nguyên phê duyệt tại mục [9.15](#915-nfr-cor-01---tính-đúng-đắn-giao-dịch-khi-tranh-chấp-và-xử-lý-lặp).

### 9.15.3. Cỡ mẫu tối thiểu cho p95 API

**Ngưỡng A đã duyệt ngày 2026-11-21:** chủ sản phẩm trả lời “tôi đồng ý” cho tối thiểu
100 request thành công đúng/thao tác/đợt benchmark, dùng toàn bộ mẫu; không gộp đợt/thao tác,
thiếu mẫu thì báo chưa đủ bằng chứng, không tự thay bài 10 phút hoặc nhịp tải.
Chỉ cụ thể hóa điều kiện đủ mẫu cho benchmark
20 phiên/10 phút × 3 đợt; không tự thay tải, nhịp nghỉ, thời lượng, ngưỡng độ trễ hoặc tỷ lệ lỗi.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Một thao tác ít xuất hiện có p95 đẹp từ vài request; cần công bố số quan sát và điều kiện đủ mẫu riêng từng thao tác/đợt trước kết luận. |
| Ngưỡng A đã duyệt | Tối thiểu 100 request thành công đúng nghiệp vụ cho mỗi loại thao tác API cần nghiệm thu, trong pha ổn định của mỗi đợt. Dùng toàn bộ mẫu thuộc phạm vi, không dừng thu ở 100 hoặc chọn 100 mẫu tốt nhất. Không gộp các thao tác, ba đợt, pha tăng tải hoặc bài tranh chấp để đủ số. |
| Căn cứ và giới hạn | Kế thừa cách đọc nearest rank đã duyệt: N = 100 thì p95 là mẫu thứ 95, một quan sát tương ứng 1 điểm phần trăm, còn 5 mẫu phía trên. Đây là mức tối thiểu thực dụng cho portfolio do chủ sản phẩm chọn, cùng độ chia quan sát đã chọn cho Mobile; không suy API có phân bố/độ tin cậy như Mobile, không phải chuẩn ngành hay bảo đảm 95% request thực tế đạt với mức tin cậy thống kê cụ thể. |
| Chỉ số/điều kiện đo | Báo số phát, thành công đúng, lỗi, từ chối và mẫu thiếu cho từng thao tác/đợt theo mục [9.15.2](#9152-cách-tính-p95-và-phân-nhóm-kết-quả-api). Chuẩn bị ánh xạ workload/API và dữ liệu đủ cho các hành trình lặp đã duyệt, giữ tỷ lệ 16 duyệt/4 đặt, nghỉ 2 giây và ràng buộc Core. Xác minh máy tạo tải/phụ thuộc không gây mẫu thiếu; không giả định cấu hình hiện chưa đo chắc chắn tạo đủ 100 mẫu trong 10 phút. |
| Khi thiếu mẫu | Ghi chưa đủ bằng chứng p95 cho thao tác/đợt đó, vẫn báo toàn bộ kết quả/lỗi. Rà nguyên nhân và trình điều chỉnh kế hoạch đo nếu cần; không tự kéo dài 10 phút, tăng số phiên, bỏ khoảng nghỉ, phát thêm API ngoài hành trình hoặc gộp đợt để đạt điều kiện. Không gọi thiếu mẫu là phần mềm chắc chắn lỗi hiệu năng, cũng không kết luận đạt. |
| Mức ưu tiên và đánh đổi | A đã được chọn làm điều kiện đủ mẫu để kết luận p95 benchmark trong phạm vi đã định. A cân bằng mức quan sát với workload nhỏ; B tối thiểu 1.000 thành công/thao tác/đợt không được chọn cho mốc này. Không hứa bất kỳ cỡ mẫu nào đủ cho mọi phân tích thống kê. |
| Cách nghiệm thu | Kiểm bộ dữ liệu kết quả có dưới/đúng/trên ngưỡng từng thao tác; báo rõ đủ/thiếu và p95 trên toàn bộ thành công đúng, giữ mọi lỗi trong mẫu số lỗi. Đối chiếu số attempt với nhật ký phát yêu cầu, pha đo và dữ liệu Core; số vòng polling/retry không được dùng để giả đủ mẫu lập đơn hoặc hành trình thành công. |
| Phần còn mở | Endpoint/nhóm thao tác cụ thể, dữ liệu, timeout và quy trình xử lý phép đo không hợp lệ. Cỡ mẫu từng bậc bài tìm giới hạn phải được quy định riêng theo kế hoạch bậc; đề xuất này không tự kéo dài/định lượng các bậc đó. Không chạy tải hoặc tạo dữ liệu từ thiết kế này. |

### 9.15.4. Timeout yêu cầu HTTP của máy tạo tải

**Ngưỡng A đã duyệt ngày 2026-11-21:** chủ sản phẩm trả lời “tôi đồng ý” cho tổng timeout
10 giây/request HTTP đồng bộ ở máy tạo tải; timeout tính lỗi của attempt, tra Core khi lệnh ghi chưa rõ,
không tự replay và không áp sang thanh toán/TTL/AI. Chi tiết timer/cấu hình/nghiệm thu còn cần cụ thể hóa.
Áp dụng các yêu cầu HTTP đồng bộ đọc/hold/lập đơn
trong benchmark trực tiếp qua Core, không áp một timeout chung cho mọi thao tác của sản phẩm.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | API không trả đủ phản hồi hoặc stream body bị treo; máy tạo tải cần kết thúc attempt hữu hạn, ghi lỗi và giữ khả năng đối chiếu giao dịch sau đó. |
| Ngưỡng A đã duyệt | Tổng thời gian chờ một request ở máy tạo tải tối đa 10 giây từ lúc bắt đầu phát, gồm chờ kết nối và nhận đủ phản hồi. Không chỉ đặt read timeout có thể tự kéo dài khi nhận từng mẩu dữ liệu; phải kiểm phạm vi timer/cơ chế hủy thực tế. Nếu mất kết nối hoặc lỗi sớm thì ghi ngay, không cần chờ đủ 10 giây. |
| Căn cứ và đánh đổi | 10 giây là ngưỡng dự án đã chọn để chặn request treo, có khoảng quan sát vượt ngưỡng p95 ghi 2 giây (5 lần) và đọc 1 giây (10 lần). Các tỷ lệ chỉ giải thích lựa chọn, không chứng minh đuôi phân bố hay tối ưu. B dùng 30 giây không được chọn; vẫn cần đo xác nhận mức đáp ứng của cấu hình. |
| Chỉ số và kết quả muộn | Đếm timeout, thời gian chờ thực, ID attempt/operation và phản hồi muộn. Attempt hết timeout vẫn là lỗi trong mẫu số/tử số đã duyệt, không đưa kết quả muộn vào nhóm thành công p95 hoặc xóa lỗi ban đầu. Lệnh ghi có thể đã commit: trạng thái nghiệp vụ là chưa rõ tới khi tra Core, không suy thất bại/hủy, reset TTL hoặc replay mù. Đối soát sau đo không được tính là thành công của attempt đã timeout. |
| Điều kiện đo | Ghi tổng timeout, timeout các lớp và retry ẩn của máy tạo tải/HTTP/BFF/Core. Nếu lớp trước kết thúc sớm hơn phải báo lý do, không tuyên bố đã quan sát tới 10 giây. Dùng môi trường cô lập và mô phỏng phản hồi ngay dưới/đúng/trên biên, không trả header, body nhỏ giọt, mất kết nối và Core commit nhưng mất phản hồi. |
| Mức ưu tiên | A đã được chọn cho benchmark; cấu hình trước chạy để timeout không phụ thuộc mặc định công cụ. P95 1/2 giây, lỗi < 1% và tiêu chí an toàn vẫn giữ nguyên; không chọn timeout dài hơn để tính một tác vụ rất chậm là đã đạt tốc độ. |
| Cách nghiệm thu | Đối chiếu đồng hồ đơn điệu/thời điểm phát–kết thúc, kết quả call và trạng thái Core. Biên đúng 10 giây phải có quy tắc ưu tiên timeout/kết quả được xác định trước chạy, không thay để làm đẹp số. Kiểm request bắt đầu cuối pha vẫn được theo dõi tới phản hồi/timeout; không bỏ mẫu chỉ vì đã hết 10 phút. Dùng dữ liệu thử để xác minh không replay/đổi trạng thái giao dịch do timeout. |
| Ranh giới và phần còn mở | Chưa chốt drain toàn hành trình/đối soát sau tải, timeout nội bộ từng lớp và endpoint mapping. 10 giây không tự thành timeout production, deadline AI 60 giây, TTL hold 300 giây, thời gian thanh toán bất đồng bộ hoặc ngưỡng probe: probe đã có tổng ngân sách 10 giây cho toàn lượt ở mục [9.12.2](operations.md#9122-nhịp-kiểm-tra-và-xác-nhận-lỗi-khả-dụng), không được cấp lại 10 giây cho mỗi API của probe. Không chạy tải hoặc sửa cấu hình từ đề xuất này. |

Căn cứ đối chiếu ngày 2026-11-21:
[AWS Builders’ Library — Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
nêu cần timeout cho call từ xa, xác định phạm vi kết nối/yêu cầu và timeout không chứng minh tác dụng phụ chưa xảy ra.
Nguồn khuyên xem latency thực để chọn timeout; không ấn định 10 giây cho dự án.

## 9.16. NFR-DUR-01 - Bảo toàn trạng thái khi tiến trình ứng dụng khởi động lại

**Hành vi và mức ưu tiên: Đã duyệt.** Ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý”
cho đề xuất bắt buộc bảo toàn trạng thái giao dịch Core đã xác nhận/lưu bền vững, TTL gốc và xử lý lặp
khi chỉ tiến trình ứng dụng lỗi/restart. Phương pháp đo/nghiệm thu chi tiết còn là đề xuất.
Bài này bổ sung cho NFR-DR-01: chỉ tiến trình ứng dụng lỗi/restart,
cơ sở dữ liệu và dữ liệu lưu vẫn nguyên vẹn, không phục hồi về snapshot cũ và không chạy seed.
Không suy yêu cầu này thành phải triển khai nhiều máy, tự chuyển vùng hoặc không có gián đoạn.

| Trường | Nội dung |
|---|---|
| Mục tiêu | Khởi động lại ứng dụng không làm mất kết quả giao dịch Core đã xác nhận hoặc biến việc thử lại thành tác vụ mới ngoài ý muốn. |
| Tình huống | Tiến trình xử lý giao dịch bị ngắt trước/sau khi ghi nhận kết quả; khách chưa nhận được phản hồi hoặc gửi lại yêu cầu sau khi ứng dụng chạy lại. Cơ sở dữ liệu vẫn hoạt động và dữ liệu không bị xóa/hỏng. |
| Chỉ số đề xuất | Số giao dịch Core đã xác nhận bị mất/đổi trạng thái trái quy tắc, quyền ghế/vé bị sai, tác dụng phụ trùng khi retry/callback, TTL bị khởi động lại; thời gian tới khi các hành trình kiểm chứng hoạt động lại. |
| Hành vi và ngưỡng đã duyệt | Không mất kết quả Core đã xác nhận/lưu bền vững, không có tác dụng phụ trùng hoặc reset TTL trái quy tắc. Yêu cầu chưa rõ phải tra Core và xử lý lặp theo hợp đồng, không tự kết luận thất bại/gửi lại mù. Trong bài kiểm có kiểm soát, khôi phục Core và các hành trình đặt trực tiếp/xem đơn-vé, cùng kiểm trạng thái, trong ≤ 5 phút từ lúc ngắt tiến trình phía máy chủ; DB, máy và phụ thuộc còn hoạt động, build/cấu hình sẵn sàng. |
| Điều kiện đo đề xuất | Bản build/topology và DB thử được định danh; chọn mốc ngắt có kiểm soát, lưu mốc ghi nhận/kết quả mong đợi và đối chiếu sau restart. Giữ DB, dữ liệu và các phụ thuộc cần thiết nguyên vẹn; không dừng process/tài nguyên của phiên khác. Dùng dữ liệu nền ở mục [9.15](#915-nfr-cor-01---tính-đúng-đắn-giao-dịch-khi-tranh-chấp-và-xử-lý-lặp) và các trạng thái giao dịch cần thiết. |
| Mức ưu tiên | Bắt buộc cho mốc demo có giao dịch qua Core, theo phê duyệt hành vi. |
| Cách nghiệm thu đề xuất | Kiểm cả giao dịch hoàn tất trước sự cố và yêu cầu còn chưa rõ khi ngắt; khởi động lại rồi tra cứu, retry/callback có kiểm soát, đối chiếu dữ liệu và tác dụng phụ. Hold theo hạn gốc; vé/đơn đã xác nhận không tự mất hoặc phát lại. Giữ mốc thời gian và kết quả từng ca, không chỉ kiểm process khởi động thành công. |
| Giới hạn và phần chưa chốt | Ba mốc logic ngắt đã duyệt tại mục [9.16.1](#9161-cách-ngắt-tiến-trình-và-mốc-kiểm-restart); công cụ/cách nhận biết mốc, API xử lý lặp/đối soát, số lượt và topology còn mở. Ngưỡng khôi phục bài restart ≤ 5 phút đã duyệt; không chứng minh chịu mất DB/đĩa/máy chủ hoặc thay bài backup. Chưa có kết quả runtime. |

Nguồn ranh giới và vòng đời: [mục 1–8](../domain-context.md#1-ranh-giới-thẩm-quyền), [ranh giới hệ thống](../../02-architecture/system-boundaries.md) và
[đặc tả chat](../conversational-booking.md). Cho phép mất dữ liệu thử sau mốc backup trong NFR-DR-01
không mặc nhiên cho phép mất trạng thái khi chỉ restart ứng dụng; đây là hai loại sự cố khác nhau.

**Thời gian khôi phục sau restart đã duyệt:** ngày 2026-11-17, sau khi được giải thích đây là
phần mềm phía máy chủ bị dừng, không phải người dùng đóng app điện thoại, chủ sản phẩm trả lời
“tôi đồng ý với đề xuất của bạn” cho phương án tối đa 5 phút. Trong bài kiểm có kiểm soát, Core và các
hành trình đặt vé trực tiếp/xem đơn-vé hoạt động lại trong tối đa **5 phút** từ lúc ngắt tiến trình ứng dụng,
cùng các bước kiểm trạng thái đã thống nhất. Cơ sở dữ liệu, máy chạy và các phụ thuộc cần thiết vẫn hoạt động;
bản build/cấu hình đã sẵn sàng, không cài lại môi trường hoặc restore DB.
Mốc 5 phút được chọn vì chỉ cần khởi động lại ứng dụng và nối lại trạng thái, không thực hiện bài DR mất DB;
phương án 15 phút đã được cân nhắc nhưng không được chọn.
Đây là mục tiêu thiết kế cho bài kiểm đã khoanh, không phải kết quả đã đạt, chuẩn ngành hoặc nghĩa vụ trực 24/7.
Yêu cầu thanh toán còn chờ kết quả đối tác được kiểm ở trạng thái trung thực/đối soát phù hợp;
không bắt buộc mọi kết quả bên ngoài phải chốt trong 5 phút và không tự đổi chúng thành thành công/thất bại.
Không mất trạng thái đã ghi bền vững, không reset TTL hoặc tạo tác dụng phụ trùng vẫn là điều kiện bắt buộc.

### 9.16.1. Cách ngắt tiến trình và mốc kiểm restart

**Phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn “A — Ngắt đột ngột ở 3 mốc”.
Kiểm DUR-01–DUR-03, giữ mục tiêu mỗi bài ≤ 5 phút và bảo toàn trạng thái/xử lý lặp/TTL.
Cụ thể hóa phép đo của NFR-DUR-01: ngắt đột ngột tiến trình máy chủ xử lý giao dịch Core,
giữ DB/máy/phụ thuộc nguyên vẹn.
Không yêu cầu ngắt Agent hoặc mọi service đồng thời; chưa chọn cơ chế điều khiển tiến trình.

| Nhóm | Mốc gây lỗi và kỳ vọng đề xuất |
|---|---|
| DUR-01 | Ngắt trước điểm giao dịch Core được ghi bền vững. Sau khởi động lại, tra trạng thái thật và kiểm tính nguyên tử theo hợp đồng; không giữ dữ liệu dở hoặc tạo kết quả xác nhận giả. Không suy từ việc chưa nhận phản hồi rằng tác vụ chắc chắn chưa có hiệu lực, nhất là khi có tác dụng phụ bên ngoài. |
| DUR-02 | Core đã ghi bền vững nhưng khách chưa nhận phản hồi thì bị ngắt. Sau khởi động lại, tra được đúng kết quả đã lưu; yêu cầu gửi lại cùng định danh theo hợp đồng không tạo giao dịch/tác dụng phụ trùng. |
| DUR-03 | Giao dịch đã ghi bền vững và khách đã nhận kết quả hợp lệ, sau đó tiến trình bị ngắt. Khởi động lại vẫn tra được đúng kết quả/quyền; kiểm retry/callback liên quan và hold theo hạn gốc, không phát thêm vé/thu-hoàn tiền hoặc cấp lại TTL trái quy tắc. |

Chỉ số/ngưỡng đã duyệt: mọi nhóm và các ca nghiệp vụ trong phạm vi đều phải bảo toàn trạng thái
đã lưu, tính nguyên tử, xử lý lặp và TTL theo mục [9.16](#916-nfr-dur-01---bảo-toàn-trạng-thái-khi-tiến-trình-ứng-dụng-khởi-động-lại); không có sai khác trái quy tắc.
Mỗi bài có điều kiện hợp lệ phải khôi phục các hành trình đặt trực tiếp/xem đơn-vé và kiểm trạng thái
trong ≤ 5 phút từ lúc ngắt tiến trình, không tính lại từ lúc bắt đầu khởi động hoặc thử lại.
Kết quả thanh toán bên ngoài chưa rõ vẫn được báo/đối soát trung thực, không ép thành công/thất bại
để kết thúc phép đo. Đây là ngưỡng đã duyệt, chưa có kết quả đo.

Điều kiện đo/nghiệm thu: build/cấu hình và DB thử được định danh, có bằng chứng xác định đúng
mốc trước/sau ghi bền vững và phản hồi khách; không chỉ chờ một khoảng thời gian rồi đoán đã tới mốc.
Ngắt đúng tiến trình thử thuộc bài, không tác động DB hoặc tài nguyên phiên khác. Đối chiếu bằng chứng
Core/khách, dữ liệu và tác dụng phụ trước-sau, ghi thời gian ngắt/khởi động/hành trình kiểm hoạt động lại.
Không dùng seed hoặc restore snapshot cũ trong bài này; không chỉ kiểm process/health đã lên.
Từng nhóm phải đạt, không lấy trung bình các lần để bù ca mất/sai giao dịch.

Mức ưu tiên: A đã được chọn làm bộ kiểm restart của mốc demo có giao dịch qua Core.
Ba nhóm xuất phát từ trạng thái lưu bền vững và việc khách đã nhận/chưa nhận kết quả,
không phải ba lần lặp để suy độ tin cậy thống kê. B chỉ kiểm restart có dừng êm theo quy trình
đơn giản hơn nhưng chưa chứng minh hành vi khi tiến trình chết bất ngờ; không khuyến nghị làm
toàn bộ bộ nghiệm thu; B không được chọn. Danh sách thao tác giao dịch, fixture, số lần lặp, cách nhận biết
mốc và công cụ ngắt còn cần hoàn thiện; thiết kế không cấp quyền viết/chạy mã hoặc dừng tiến trình.
