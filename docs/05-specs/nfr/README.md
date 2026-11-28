# Yêu cầu phi chức năng (NFR)

[Phần còn mở](#9173-phần-còn-mở-và-điều-kiện-hoàn-tất-trước-nghiệm-thu) · [Kết quả rà soát](#9172-kết-quả-rà-soát-và-bản-thiết-kế-cơ-sở-ngày-2026-11-24)

Đây là bản thiết kế NFR giai đoạn đầu, được duyệt theo từng nội dung trong hội thoại NFR;
ngày và phạm vi phê duyệt ghi tại từng mục.
Các bảng giữ riêng phần đã duyệt và phần còn đề xuất; chưa phải bộ mục tiêu định lượng đầy đủ hoặc bằng chứng đạt.
Mục [9.17](#917-căn-cứ-còn-cần-để-chốt-ngưỡng-định-lượng) sở hữu quy trình chốt ngưỡng hai bước đã được duyệt và căn cứ cần bổ sung.
Kết quả rà soát bản thiết kế cơ sở ngày 2026-11-24 nằm tại mục [9.17.2](#9172-kết-quả-rà-soát-và-bản-thiết-kế-cơ-sở-ngày-2026-11-24); phần đã duyệt được giữ
làm đầu vào thiết kế chi tiết, phần còn mở không được coi là đã đủ điều kiện nghiệm thu.

| Mã | Chủ đề | Mục chi tiết |
|---|---|---|
| NFR-REL-01 | Cô lập sự cố AI và dự phòng có kiểm soát | [9.5](ai-agent.md#95-nfr-rel-01---cô-lập-sự-cố-ai-khỏi-luồng-đặt-vé-trực-tiếp) |
| NFR-PRIV-01 | Nhật ký chẩn đoán chỉ chứa thông tin kỹ thuật | [9.6](privacy-and-audit.md#96-nfr-priv-01---nhật-ký-chẩn-đoán-chỉ-chứa-thông-tin-kỹ-thuật) |
| NFR-PRIV-02 | Xóa chat/checkpoint theo yêu cầu, không ảnh hưởng giao dịch Core | [9.6.1](privacy-and-audit.md#961-nfr-priv-02---xóa-lịch-sử-chat-và-checkpoint-theo-yêu-cầu) |
| NFR-DR-01 | Phục hồi dữ liệu thử từ backup | [9.7](recovery-and-correctness.md#97-nfr-dr-01---phục-hồi-dữ-liệu-thử-từ-bản-sao-lưu-và-kiểm-chứng-nghiệp-vụ) |
| NFR-AI-01 | Chất lượng hội thoại tiếng Việt và phương pháp đánh giá | [9.8](ai-agent.md#98-nfr-ai-01---hiểu-tiếng-việt-và-giữ-đúng-yêu-cầu-qua-nhiều-lượt) |
| NFR-PERF-01 | Hiệu năng hai app Web | [9.9](performance.md#99-nfr-perf-01---hiệu-năng-trải-nghiệm-web) |
| NFR-PERF-02 | Hiệu năng hai app Mobile và giới hạn bằng chứng Android thật | [9.10](performance.md#910-nfr-perf-02---hiệu-năng-hai-app-mobile-cài-riêng) |
| NFR-RES-01 | Hạn mức và tài nguyên AI | [9.11](ai-agent.md#911-nfr-res-01---giới-hạn-tài-nguyên-ai-cho-demo-công-khai) |
| NFR-OPS-01 | Phát hiện/cảnh báo sự cố qua email | [9.12](operations.md#912-nfr-ops-01---phát-hiện-và-cảnh-báo-sự-cố-có-ảnh-hưởng-tới-demo) |
| NFR-ACC-01 | Khả năng tiếp cận bốn app | [9.13](accessibility.md#913-nfr-acc-01---khả-năng-tiếp-cận-trên-bốn-app) |
| NFR-SEC-01 | Danh tính, quyền, phạm vi dữ liệu và MFA cho vai trò quyền cao | [9.14](security.md#914-nfr-sec-01---kiểm-soát-danh-tính-quyền-và-phạm-vi-dữ-liệu) |
| NFR-SEC-02 | Nhật ký kiểm toán sự kiện bảo mật/giao dịch nhạy cảm | [9.14.7](privacy-and-audit.md#9147-nfr-sec-02---nhật-ký-kiểm-toán-tối-thiểu) |
| NFR-COR-01 | Tính đúng đắn khi tranh chấp/lặp và thiết kế hai bài tải | [9.15](recovery-and-correctness.md#915-nfr-cor-01---tính-đúng-đắn-giao-dịch-khi-tranh-chấp-và-xử-lý-lặp) |
| NFR-DUR-01 | Bảo toàn trạng thái khi chỉ tiến trình ứng dụng restart | [9.16](recovery-and-correctness.md#916-nfr-dur-01---bảo-toàn-trạng-thái-khi-tiến-trình-ứng-dụng-khởi-động-lại) |

## 9.1. Mốc nghiệm thu đã duyệt

Ngày 2026-11-17, trong hội thoại xác định NFR, chủ sản phẩm trả lời câu hỏi về mốc nghiệm thu:
**“Demo/đồ án: chứng minh luồng hoàn chỉnh với dữ liệu thử”**. Đây là mốc áp dụng đầu tiên
cho bộ NFR đang được làm rõ; không tự chuyển thành yêu cầu vận hành thương mại hoặc giao dịch tiền thật.
Lựa chọn này xác định bối cảnh nghiệm thu, chưa xác nhận hệ thống hiện tại đã đáp ứng.

Các ranh giới giao dịch và quyền ở [mục 1–6](../domain-context.md#1-ranh-giới-thẩm-quyền) tiếp tục áp dụng. Dữ liệu thử không cho phép AI
tự xác nhận kết quả, bỏ kiểm tra quyền hoặc xem mô phỏng phía client là bằng chứng tích hợp Core.
Mục này không thay quyết định công nghệ, chính sách nghiệp vụ hoặc tiêu chí nghiệm thu của feature cũ.

## 9.2. Cấu trúc và trạng thái từng NFR

Mỗi NFR được ghi với các trường sau trước khi đề nghị duyệt:

| Trường | Nội dung cần xác định |
|---|---|
| Mã và mục tiêu | Mã ổn định, nhóm chất lượng và tác động tới người dùng/người vận hành. |
| Tình huống | Ai hoặc sự kiện nào kích hoạt, tác vụ bị ảnh hưởng và phản hồi mong muốn. |
| Chỉ số | Đại lượng, đơn vị, điểm bắt đầu/kết thúc; cách tính, mẫu số hoặc phân vị khi áp dụng. |
| Ngưỡng mục tiêu và căn cứ | Giá trị hoặc điều kiện đạt; nguồn quyết định, nghiên cứu hay phép đo làm căn cứ. |
| Điều kiện đo | Phiên bản, môi trường/tài nguyên, thiết bị/mạng, dữ liệu, tải và thời lượng; phân biệt dịch vụ thật, sandbox và mô phỏng. |
| Mức ưu tiên | Mức cần thiết cho mốc demo và lý do; không tự coi mọi mục là bắt buộc. |
| Cách nghiệm thu | Kịch bản, công cụ/phương pháp, bằng chứng cần giữ và quy tắc kết luận đạt/không đạt. |
| Trạng thái và nguồn duyệt | `Đề xuất`, `Chờ làm rõ` hoặc `Đã duyệt`; ghi câu trả lời và phiên bản nội dung được duyệt. |

`Đã duyệt` là yêu cầu mục tiêu được chấp thuận, không có nghĩa đã triển khai, kiểm thử đạt,
hợp nhất hoặc triển khai vận hành. Kết quả kiểm chứng thuộc Issue/PR và phải gắn đúng phiên bản.
Khuyến nghị từ nghiên cứu chưa trở thành yêu cầu cho đến khi chủ sản phẩm duyệt.

## 9.3. Đầu vào cần làm rõ và quyết định hoãn

Tải kiểm thử có kiểm soát, phân bố tác vụ và nhịp thao tác đã được duyệt tại mục [9.15](recovery-and-correctness.md#915-nfr-cor-01---tính-đúng-đắn-giao-dịch-khi-tranh-chấp-và-xử-lý-lặp);
không suy thành dự báo lượng người dùng thật. Quy mô dữ liệu chi tiết và thời gian duy trì demo còn mở.
**Ngân sách và phương án hosting được hoãn đến giai đoạn chuẩn bị triển khai**;
chủ sản phẩm nhắc lại quyết định hoãn trong hội thoại NFR ngày 2026-11-17.
Hai mục này nằm ngoài các quyết định cần chốt ở giai đoạn NFR hiện tại, trừ khi chủ sản phẩm mở lại.
Việc hoãn không ngăn làm rõ an toàn, tính đúng đắn, hành vi khi lỗi và cách nghiệm thu.
Các đề xuất định lượng phụ thuộc tài nguyên phải ghi giả định môi trường và chờ xác nhận tính khả thi
khi chuẩn bị triển khai; không tự chọn provider, cấu hình máy hoặc mức chi tiêu.

Trạng thái từng ngưỡng được ghi tại NFR tương ứng và mục [9.17](#917-căn-cứ-còn-cần-để-chốt-ngưỡng-định-lượng). Không lấy số ghế, TTL nghiệp vụ,
thời gian chờ trong fixture hoặc benchmark của nhà cung cấp làm năng lực hệ thống.

Các nhóm cần làm rõ gồm hiệu năng và khả năng tiếp cận, độ tin cậy/tính đúng đắn giao dịch,
bảo mật và dữ liệu riêng tư, phục hồi, vận hành/chi phí, chất lượng và an toàn AI Agent.
Các chuẩn đã có ở [nền tảng dự án](../../../PROJECT-OVERVIEW.md#important-constraints) và
[chuẩn UI](../../04-standards/ui-quality.md) vẫn giữ thẩm quyền; cần cụ thể hóa điều kiện đo,
không tự thay ngưỡng hoặc tuyên bố đã đạt.

## 9.4. Hướng kiểm chứng cho portfolio và cơ sở nghiên cứu

**Hướng đã duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý” cho câu hỏi
“Bạn đồng ý lấy hướng ‘demo tiết kiệm + kiểm thử tải riêng để chứng minh năng lực’ làm cơ sở xây dựng NFR không?”.
Demo công khai phục vụ trải nghiệm luồng hoàn chỉnh với chi phí phù hợp; phép kiểm thử riêng cung cấp
bằng chứng về năng lực trong điều kiện công bố rõ. Không cần giả định có đông người truy cập thật.
Phê duyệt này chưa chọn số tải, cấu hình, ngưỡng nghiệm thu, trần ngân sách hoặc hosting;
không cấp quyền chạy thử tải hay triển khai. Các chi tiết đó tiếp tục ở trạng thái đề xuất/chờ làm rõ.

Cơ sở nghiên cứu dưới đây được tra cứu ngày 2026-11-17:

- Tách **tải truy cập demo dự kiến** khỏi **tải kiểm thử có kiểm soát**. Ít người xem demo không cho biết
  hệ thống chịu tải đến đâu; dùng phép thử tái lập để cung cấp bằng chứng trong portfolio.
  Đây là hướng kiểm chứng kỹ thuật, không phải kết luận về tiêu chí của mọi nhà tuyển dụng.
- Mô hình tải phải nêu hành trình, phân bố tác vụ, khoảng nghỉ và cách tăng/giữ tải. Grafana k6 phân biệt
  mô hình theo người dùng ảo (VU) với mô hình theo tốc độ bắt đầu lượt thực hiện kịch bản; do đó không
  quy đổi thẳng số VU thành số người dùng thật hoặc số yêu cầu mỗi giây (RPS). Một lượt kịch bản có thể
  chứa nhiều yêu cầu và thời gian chờ. Xem [Grafana k6 — Scenarios](https://grafana.com/docs/k6/latest/using-k6/scenarios/).
- Kiểm thử hiệu năng cần kết hợp kiểm tra kết quả đúng và ngưỡng đạt/không đạt;
  [Grafana k6 — Test for performance](https://grafana.com/docs/k6/latest/examples/get-started-with-k6/test-for-performance/)
  phân biệt kiểm tra chức năng (checks) với ngưỡng hiệu năng (thresholds). Áp dụng cho dự án theo [mục 1–5](../domain-context.md#1-ranh-giới-thẩm-quyền):
  cần kiểm tranh chấp ghế, xử lý thanh toán lặp và xác nhận vé theo Core, ngoài độ trễ/tỷ lệ lỗi.
  Phản hồi nhanh hoặc HTTP thành công không tự chứng minh giao dịch đúng.
- Trước khi duyệt phép thử, xác định phiên bản, môi trường/tài nguyên, dữ liệu, thiết bị/mạng,
  tải và thời lượng; chỉ số, ngưỡng, điều kiện dừng và trần chi phí. Ghi rõ Core, cổng thanh toán và LLM
  dùng dịch vụ thật, sandbox hay thành phần giả lập (stub). Kết quả dùng stub không chứng minh năng lực,
  độ tin cậy hoặc chi phí của nhà cung cấp thật. Tải VU, thời lượng và ngưỡng API đã được duyệt tại mục [9.15](recovery-and-correctness.md#915-nfr-cor-01---tính-đúng-đắn-giao-dịch-khi-tranh-chấp-và-xử-lý-lặp);
  RPS là số đo cần báo cáo, không quy đổi trực tiếp từ VU. Các chi tiết còn mở cần căn cứ và giả định môi trường rõ ràng theo mục [9.3](#93-đầu-vào-cần-làm-rõ-và-quyết-định-hoãn), không lấy số minh họa
  trong tài liệu k6 làm NFR hoặc dùng việc hoãn ngân sách để dừng toàn bộ phân tích NFR.

## 9.17. Căn cứ còn cần để chốt ngưỡng định lượng

**Quy trình hai bước: Đã duyệt.** Ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý”
cho đề xuất thiết kế phép đo trước; khi có runtime đại diện thì đo số liệu nền, đối chiếu nhu cầu chất lượng
và trình duyệt ngưỡng còn thiếu trước nghiệm thu. Đây không phải phê duyệt trước mọi ngưỡng sẽ được đề xuất.
Các hướng được chấp thuận trong mục [9.5](ai-agent.md#95-nfr-rel-01---cô-lập-sự-cố-ai-khỏi-luồng-đặt-vé-trực-tiếp)–[9.16](recovery-and-correctness.md#916-nfr-dur-01---bảo-toàn-trạng-thái-khi-tiến-trình-ứng-dụng-khởi-động-lại)
không có nghĩa mọi ngưỡng, mức ưu tiên hoặc chi tiết nghiệm thu trong các bảng đều đã được duyệt.
Giữ trạng thái theo từng trường. Bộ NFR chưa đầy đủ về định lượng và chưa có kết quả runtime của phiên phân tích này.

Chốt theo hai bước đã duyệt: giữ các mục tiêu đã có căn cứ/quyết định ở giai đoạn thiết kế này;
với chỉ số chưa đủ căn cứ, chuẩn bị phép đo nền sau khi có runtime đại diện và được phép kiểm chứng.
Sau đó đề xuất ngưỡng dựa đồng thời vào nhu cầu chất lượng và số đo, để chủ sản phẩm duyệt trước nghiệm thu.
Không chọn ngưỡng chỉ để khớp kết quả hiện có, tự hạ chuẩn đã duyệt hoặc coi kết quả đo là mục tiêu được duyệt.
Quy trình này không yêu cầu chờ runtime cho mọi quyết định: mục tiêu thiết kế có thể được đề xuất ngay
khi có căn cứ về nhu cầu, tác động, tiêu chuẩn hoặc giả định được công bố, rồi trình chủ sản phẩm duyệt.
Số đo sau đó xác nhận mức đáp ứng/tính khả thi; nếu không đáp ứng phải nêu chênh lệch và phương án,
không tự đổi mục tiêu đã duyệt. Những trường chưa đủ căn cứ vẫn giữ trạng thái đề xuất/chờ làm rõ.
Phạm vi hiện tại vẫn chỉ phân tích/thiết kế; quy trình này không cho phép viết/chạy script, gọi provider,
mua/cài dịch vụ hoặc triển khai. Ngân sách/hosting tiếp tục hoãn theo mục [9.3](#93-đầu-vào-cần-làm-rõ-và-quyết-định-hoãn).

| Nhóm cần chốt | Căn cứ cần có trước khi đề nghị ngưỡng/điều kiện cuối |
|---|---|
| Nhật ký kiểm toán | Phạm vi audit tối thiểu NFR-SEC-02 đã duyệt tại mục [9.14.7](privacy-and-audit.md#9147-nfr-sec-02---nhật-ký-kiểm-toán-tối-thiểu). Chỉ chủ dự án đọc/xuất qua công cụ vận hành đã duyệt tại cùng mục; bản audit chính giữ tối đa 30 ngày đã duyệt. Hành vi tiếp tục khi đã giữ bền/chặn thao tác nhạy cảm mới khi không giữ bền đã duyệt. Bản xuất tạm dọn sau dùng và không quá hạn gốc đã duyệt. Backup chứa audit theo cùng hạn gốc đã duyệt, gồm điều kiện thế hệ hợp lệ cho DR. Ghi nhận yêu cầu đọc/xuất audit đã duyệt. Kiểm tính toàn vẹn bằng runbook trên tập có mốc đối chiếu tin cậy đã duyệt. Danh sách năm nhóm thông tin audit được phép ghi đã duyệt. Áp cùng hạn gốc 30 ngày cho bản audit tại nguồn/hàng đợi đã duyệt trong mục [9.14.7](privacy-and-audit.md#9147-nfr-sec-02---nhật-ký-kiểm-toán-tối-thiểu). Không có ngoại lệ giữ audit quá hạn để điều tra ở demo đã duyệt trong cùng mục. Giữ audit tối thiểu có lý do/hạn khi yêu cầu xóa tài khoản đã duyệt, phần không cần giữ vẫn phải xóa. Hạn hoàn tất xóa phần audit tự quản đã đủ điều kiện ≤ 24 giờ từ chấp nhận yêu cầu hợp lệ đã duyệt trong cùng mục. Bộ AUD-01–AUD-06 và mọi ca đúng kỳ vọng đã duyệt. Danh mục sự kiện/schema chi tiết, ngoại lệ, lưu/xóa và đường ghi còn mở. Không áp hạn log chẩn đoán 7 ngày hoặc dùng lời AI làm kết quả Core. |
| Trường dữ liệu chẩn đoán | Danh sách kỹ thuật cho phép và cách chặn trường lạ/giá trị nhạy cảm đã duyệt tại mục [9.6.2](privacy-and-audit.md#962-danh-sách-trường-cho-logtrace-chẩn-đoán); giữ log 7 ngày và quyền chủ dự án. Chốt schema/mapping lỗi/ID, cấu hình SDK/exporter, kiểm rò rỉ và cơ chế xóa trước thu thập. Không dùng danh sách này để thay chính sách lưu/xóa chat, giao dịch hoặc nhật ký kiểm toán. |
| Bảo vệ đường truyền | HTTPS/TLS trên bề mặt công khai và dịch vụ ngoài, xác minh chứng chỉ, cookie Secure và ngoại lệ HTTP loopback đã duyệt tại mục [9.14.5](security.md#9145-bảo-vệ-đường-truyền-của-demo-công-khai). Chốt inventory/điểm kết thúc TLS/cấu hình chứng chỉ và bằng chứng từng client/đường tích hợp; không suy HTTPS thay xác thực/quyền/chữ ký giao dịch. |
| AI cho khách và chống gửi liên tục | Giới hạn 1 lượt đang xử lý/phiên khách đã duyệt tại mục [9.11.5](ai-agent.md#9115-giới-hạn-lượt-ai-cho-khách-chưa-đăng-nhập), giữ quyền hỏi thông tin công khai và không có trần đồng thời chung. Nguyên tắc giới hạn tần suất theo tài khoản/phiên trong cửa sổ ngắn đã duyệt tại mục [9.11.6](ai-agent.md#9116-giới-hạn-tần-suất-yêu-cầu-ai); số yêu cầu/cửa sổ chưa duyệt, không coi đã chốt quota ngày hoặc bảo vệ được trước tạo hàng loạt phiên. Chốt cơ chế phiên/chuyển tiếp đăng nhập, cách đếm/cửa sổ/ngưỡng theo bộ ca và phép đo trước nghiệm thu. |
| Hoà giải nguồn quyết định | Mô hình sản phẩm trên main `2a007797ac9ce542d9747aad0f44f3e430eec581` sở hữu BR-37–BR-39; không coi bản worktree cũ thiếu các mục này là chưa có chính sách chat/xóa dữ liệu. Quan hệ Q153/ADR-0028 đã được chủ sản phẩm xác nhận tiếp nối tại mục [9.11.2](ai-agent.md#9112-chính-sách-thử-lại-inference-và-chuyển-provider) ngày 2026-11-20: thay phần chưa tự đổi provider bằng chuyển dự phòng inference đã chỉ định/có kiểm soát, giữ các ranh giới còn lại. OPEN-12 ở ảnh chụp nguồn cũ là căn cứ câu hỏi, không phủ định xác nhận mới. Không dùng việc chốt quan hệ làm bằng chứng routing hoặc đồng bộ mọi bản nguồn đã hoàn tất. |
| Xóa lịch sử và checkpoint | Giữ không tự xóa chat theo hạn thông thường, xóa theo yêu cầu đúng quyền và phản hồi có nội dung ≤ 24 giờ liên tục theo BR-37–BR-39/A-06/A-07. Nguyên tắc chặn tiếp tục và dừng điều phối Agent cũ khi chấp nhận xóa đã duyệt tại mục [9.6.1](privacy-and-audit.md#961-nfr-priv-02---xóa-lịch-sử-chat-và-checkpoint-theo-yêu-cầu). Mục tiêu xóa phần tự quản đang phục vụ ≤ 24 giờ từ chấp nhận yêu cầu hợp lệ đã duyệt tại mục [9.6.1](privacy-and-audit.md#961-nfr-priv-02---xóa-lịch-sử-chat-và-checkpoint-theo-yêu-cầu). Điều kiện dùng inference không lưu trạng thái và Groq ZDR đã xác minh trước chat thật đã duyệt tại cùng mục. Hạn ≤ 24 giờ cho chat/checkpoint đủ điều kiện trong backup do dự án quản lý đã duyệt; kiểm trạng thái trước hiển thị cache/resume khi tái kết nối đã duyệt. Chốt bảng lưu/xóa, thời hạn hoàn thành/ngoại lệ cho phần còn lại, bản sao/provider, đồng bộ cache và kiểm chống hồi sinh dữ liệu; không lấy log 7 ngày hoặc deadline 60 giây làm retention chat. |
| Tải, quy mô dữ liệu và khả năng xử lý | Giữ tải hỗn hợp 3 đợt độc lập, bài một ghế/hai danh sách giao nhau và ba nhóm gửi lại/callback đã duyệt. Nguyên tắc tăng tải từng bậc/ngừng tăng khi không giữ chất lượng và dừng ngay khi vi phạm an toàn đã duyệt tại mục [9.15.1](recovery-and-correctness.md#9151-tăng-tải-tìm-giới-hạn-quan-sát-và-dừng-an-toàn). Chốt biến thể/dữ liệu, bậc/trần/tài nguyên/thời lượng và điều kiện dừng chi tiết; công bố topology và đo độ trễ/lỗi/thông lượng/trạng thái. Không suy thành người dùng thật. |
| Web và native | Giữ ba ngưỡng Web, Mobile mở app ≥ 95% ≤ 5 giây và từng bước soát p95 ≤ 2 giây đã duyệt. WiFi chuẩn/tách nhóm gây lỗi, 100 mẫu mỗi nhóm Mobile và nearest rank đã duyệt tại mục [9.10.2](performance.md#9102-mạng-chuẩn-cho-đo-hiệu-năng-mobile)–[9.10.3](performance.md#9103-số-mẫu-và-cách-tính-phân-vị-mobile); iPhone 11 Pro Max sẵn có, đề xuất làm thiết bị tham chiếu, phiên bản iOS bổ sung trước đo. Lab, ma trận/giới hạn Safari, 20 mẫu mỗi nhóm Web/p75, cache lạnh và hai hồ sơ viewport/CPU/mạng đã duyệt tại mục [9.9.1](performance.md#991-bằng-chứng-web-cho-mốc-portfolio-đầu)–[9.9.5](performance.md#995-hai-hồ-sơ-viewportcpumạng-cho-bộ-đo-web). Nguồn đầu ra mẫu phát lại chỉ cho UI chat đã duyệt tại mục [9.9.6](performance.md#996-dự-thảo-kịch-bản-nghiệm-thu-web-theo-hành-trình); kịch bản/dữ liệu cụ thể, công cụ và các ngưỡng native còn mở. Giữ ngoại lệ Android thật, không dùng emulator để đóng khoảng trống đó. |
| Chất lượng AI | Giữ bộ 60 ca/6 nhóm × 3 đợt mỗi provider, từng đợt ≥ 57/60 và không có lỗi an toàn; bộ bốn tiêu chí/quy tắc đạt và chủ dự án chấm kết hợp kiểm tự động đã duyệt tại mục [9.8.1](ai-agent.md#981-tiêu-chí-kết-luận-một-hội-thoại-đạt)–[9.8.2](ai-agent.md#982-người-chấm-và-trách-nhiệm-kết-luận). Bộ kiểm fallback FB-01–FB-10 và tiêu chí mọi ca điều phối phải đạt đã duyệt tại mục [9.8.3](ai-agent.md#983-bộ-nghiệm-thu-chuyển-model-dự-phòng). Nội dung 60 ca/fixture và điểm kiểm riêng đã duyệt tại mục [9.8.4](ai-agent.md#984-nội-dung-bộ-60-hội-thoại-mẫu). Chốt manifest/checklist thực thi, cấu hình và biến thể lỗi. Không lấy tỷ lệ tổng bù lỗi an toàn hoặc một lần đạt làm bằng chứng ổn định. |
| Độ trễ API/AI và hành vi chờ | Giữ AI tìm phim/suất/làm rõ: ≥ 95% có phản hồi hữu ích đầu ≤ 10 giây, hoàn tất ≤ 30 giây; API dưới tải hỗn hợp: p95 đọc ≤ 1 giây, tạo hold/lập đơn ≤ 2 giây và lỗi hệ thống < 1% từng loại thao tác/toàn bài đã duyệt tại mục [9.15](recovery-and-correctness.md#915-nfr-cor-01---tính-đúng-đắn-giao-dịch-khi-tranh-chấp-và-xử-lý-lặp), gồm mẫu số/tử số và cách đếm retry. Tính p95 nearest rank trên thành công đúng, báo độ trễ lỗi/từ chối riêng đã duyệt tại mục [9.15.2](recovery-and-correctness.md#9152-cách-tính-p95-và-phân-nhóm-kết-quả-api); tối thiểu 100 thành công/thao tác/đợt benchmark đã duyệt tại mục [9.15.3](recovery-and-correctness.md#9153-cỡ-mẫu-tối-thiểu-cho-p95-api). Timeout HTTP 10 giây của máy tạo tải đã duyệt tại mục [9.15.4](recovery-and-correctness.md#9154-timeout-yêu-cầu-http-của-máy-tạo-tải). Mục tiêu ≥ 95% lượt giữ ghế/lập đơn ngắn sau xác nhận hoàn tất ≤ 30 giây, xét riêng từng loại, đã duyệt tại mục [9.8](ai-agent.md#98-nfr-ai-01---hiểu-tiếng-việt-và-giữ-đúng-yêu-cầu-qua-nhiều-lượt). Cùng mục tiêu ≥ 95% hoàn tất ≤ 30 giây cho từng loại tra cứu đơn/vé, tra cứu hủy–hoàn, bỏ hold và gửi yêu cầu hủy ngắn đã duyệt theo lựa chọn A mới nhất trong cùng mục. Cách đếm tỷ lệ trên mọi lượt đầu vào hợp lệ đã bắt đầu, giữ lỗi/timeout trong mẫu số, đã duyệt tại mục [9.8](ai-agent.md#98-nfr-ai-01---hiểu-tiếng-việt-và-giữ-đúng-yêu-cầu-qua-nhiều-lượt). Chốt tác vụ khác, số mẫu từng bậc/drain và stream/retry/fallback; INP không thay thời gian AI hoàn tất. |
| Khả năng tiếp cận | Web theo WCAG 2.2 AA, native theo tiêu chí áp dụng/WCAG2ICT và chuẩn UI; kết hợp tự động/thủ công đã duyệt. Bộ tham chiếu bàn phím/Edge/Narrator, Safari/VoiceOver, native iOS/VoiceOver trên iPhone thật và native Android/TalkBack trên emulator đã duyệt tại mục [9.13.2](accessibility.md#9132-ma-trận-kiểm-bàn-phím-và-trình-đọc-màn-hình); giới hạn bằng chứng Android thật tiếp tục công bố. Vùng cuộn/zoom riêng cho sơ đồ ghế Customer Web, đủ bàn phím/trình đọc màn hình và chưa bắt thêm danh sách chọn ghế riêng, đã duyệt tại mục [9.13.1](accessibility.md#9131-bố-cục-web-co-giãn-và-giữ-đầy-đủ-nội-dung). Chốt phiên bản, checklist từng tiêu chí/hành trình và cấu hình ngôn ngữ trước nghiệm thu; không suy một tổ hợp đạt thành mọi nền tảng đạt. |
| Hạn mức tài nguyên AI | Giữ 1 lượt đang xử lý/tài khoản, không đặt trần đồng thời toàn hệ thống phía ứng dụng, deadline 60 giây và retry/fallback đã duyệt tại mục [9.11.1](ai-agent.md#9111-thời-hạn-xử-lý-một-lượt-ai)–[9.11.2](ai-agent.md#9112-chính-sách-thử-lại-inference-và-chuyển-provider); quan hệ tiếp nối nguồn fallback đã được xác nhận ngày 2026-11-20. Nguyên tắc vòng lặp đã duyệt tại mục [9.11.3](ai-agent.md#9113-nguyên-tắc-vòng-lặp-và-căn-cứ-chọn-giới-hạn-công-việc); giá trị giới hạn vòng/calls phải có căn cứ từ kịch bản trước khi duyệt. Nguyên tắc xử lý tin nhắn/context/output vượt ngưỡng đã duyệt tại mục [9.11.4](ai-agent.md#9114-giới-hạn-đầu-vào-ngữ-cảnh-và-đầu-ra-ai); giá trị cấu hình chưa duyệt. Chốt usage/context/output, timeout từng call, quota thực và cách thử biên. Không tự bật trả phí hoặc dùng fallback lách giới hạn tài khoản/tác vụ đã duyệt. |
| Phục hồi DR/DUR | Giữ mục tiêu đã duyệt: bài mất Core DB → Core DB sạch có RTO ≤ 60 phút/RPO ≤ 24 giờ, DB các service khác/phụ thuộc còn dùng được; bài chỉ restart ứng dụng khôi phục ≤ 5 phút với DB/máy/phụ thuộc nguyên vẹn. Mã hóa/khóa riêng/kiểm artifact, scope Core và logical dump custom/pg_restore đã duyệt tại mục [9.7.2](recovery-and-correctness.md#972-bảo-vệ-tệp-sao-lưu-và-khóa-phục-hồi)–[9.7.4](recovery-and-correctness.md#974-phương-pháp-sao-lưu-cho-bài-core-db); mức đối chiếu toàn bộ dữ liệu thử và mọi ca an toàn đã duyệt tại mục [9.7.1](recovery-and-correctness.md#971-dự-thảo-chuỗi-kiểm-chứng-và-điểm-kết-thúc-phục-hồi); khung thực thi còn chi tiết cần review, bộ DR-01–DR-06 đã duyệt tại mục [9.7.9](recovery-and-correctness.md#979-bộ-tình-huống-nghiệm-thu-dr-tối-thiểu). Hai thế hệ backup đã kiểm gần nhất và luân chuyển an toàn đã duyệt tại mục [9.7.5](recovery-and-correctness.md#975-số-thế-hệ-backup-cho-bài-dr). Kích hoạt scripts theo nhu cầu trước diễn tập đã duyệt tại mục [9.7.6](recovery-and-correctness.md#976-cách-kích-hoạt-backup-cho-mốc-portfolio); nơi lưu local ngoài phạm vi phá đã duyệt tại mục [9.7.7](recovery-and-correctness.md#977-nơi-lưu-backup-của-bài-mất-core-db). Dọn backup sau chấp nhận hồ sơ khi đóng bài hoàn tất, gồm đóng bài thất bại với kết quả không đạt, đã duyệt tại mục [9.7.8](recovery-and-correctness.md#978-vòng-đời-backup-theo-bài-diễn-tập). Thời hạn rà soát/ngoại lệ, dung lượng và vòng đời hồ sơ còn mở. Bộ restart đột ngột DUR-01–DUR-03 đã duyệt tại mục [9.16.1](recovery-and-correctness.md#9161-cách-ngắt-tiến-trình-và-mốc-kiểm-restart). Chốt manifest dữ liệu/phụ thuộc và điều kiện kiểm; không suy một dump bao phủ mọi service hoặc dùng seed thay phục hồi. |
| Vận hành và vòng đời bảo mật/dữ liệu | Giữ log/trace kỹ thuật tối đa 7 ngày, quyền xem/xuất chỉ chủ dự án, phạm vi logout hiện tại/xóa-khóa dữ liệu app, TOTP/mã dự phòng, phạm vi mất cả hai và quy tắc thay yếu tố/tạo lại mã đã duyệt tại mục [9.14.1](security.md#9141-phạm-vi-đăng-xuất-và-vô-hiệu-phiên)–[9.14.4](security.md#9144-đổi-yếu-tố-mfa-và-tạo-lại-mã-dự-phòng). Một thông báo mở/một phục hồi, chưa nhắc định kỳ và cách gom theo môi trường–hành trình–nhóm vấn đề đã duyệt tại mục [9.12.1](operations.md#9121-thông-báo-theo-vòng-đời-sự-cố). Nhịp kiểm 60 giây/lượt ≤ 10 giây, hai lượt lỗi/thành công đã duyệt tại mục [9.12.2](operations.md#9122-nhịp-kiểm-tra-và-xác-nhận-lỗi-khả-dụng). Phạm vi đọc suất/ghế → giữ ghế → tạo/đọc lại đơn chờ thanh toán và nguyên tắc tự động quản lý dữ liệu thử đã duyệt tại mục [9.12.3](operations.md#9123-phạm-vi-bộ-kiểm-khả-dụng-coređặt-trực-tiếp-và-vòng-đời-dữ-liệu-thử); quy mô nhóm/lịch dọn/retention còn mở. Nguyên tắc xử lý lỗi chuyển phát email mở đã duyệt tại mục [9.12.4](operations.md#9124-xử-lý-lỗi-gửi-email-cảnh-báo-mở-sự-cố); thông số retry theo provider còn mở. Thư phục hồi không chờ thư mở, mục tiêu nhận ≤ 5 phút từ xác nhận phục hồi và retry hữu hạn theo cửa sổ riêng đã duyệt tại mục [9.12.5](operations.md#9125-email-phục-hồi-và-thông-báo-đến-khác-thứ-tự). Chốt chi tiết cấp phát/dọn dữ liệu thử, chống nhiễu/đường email, danh sách trường/cơ chế xóa chẩn đoán. Chưa cam kết thời hạn phản ứng con người/trực 24/7 ở demo đã duyệt tại mục [9.12.6](operations.md#9126-phạm-vi-phản-ứng-của-chủ-dự-án). Nguồn tín hiệu AI từ lượt thực tế và health service không gọi mô hình định kỳ đã duyệt tại mục [9.12.7](operations.md#9127-nguồn-tín-hiệu-giám-sát-ai-và-giới-hạn-quota). Mở sự cố/email AI từ một lượt thất bại kỹ thuật cuối cùng, chưa mail riêng nếu fallback thành công, đã duyệt tại mục [9.12.8](operations.md#9128-điều-kiện-mở-sự-cố-ai-từ-lượt-thực-tế). Email mở AI ≤ 5 phút từ lúc Agent xác định lượt đầu thất bại cuối cùng đã duyệt tại mục [9.12.9](operations.md#9129-thời-hạn-nhận-email-mở-sự-cố-ai-theo-lượt). Hai lượt AI thực tế liên tiếp đủ điều kiện thành công để xác nhận luồng phục hồi đã duyệt tại mục [9.12.10](operations.md#91210-bằng-chứng-xác-nhận-phục-hồi-ai-theo-lượt). Email phục hồi AI ≤ 5 phút từ lúc đủ bằng chứng xác nhận đã duyệt tại mục [9.12.11](operations.md#91211-thời-hạn-nhận-email-phục-hồi-ai-theo-lượt). Gói health Agent ngoài tiến trình 60 giây/10 giây/hai lượt và email mở–phục hồi 5 phút đã duyệt tại mục [9.12.12](operations.md#91212-kiểm-sức-khỏe-agent-service-ngoài-tiến-trình). Bộ OBS-01–OBS-06 và mọi ca đúng kỳ vọng đã duyệt tại mục [9.12.13](operations.md#91213-bộ-nghiệm-thu-giám-sát-và-cảnh-báo). MFA/TOTP lúc đăng nhập cho hai vai trò nhân viên đã duyệt tại mục [9.14.6](security.md#9146-phạm-vi-mfa-cho-nhân-viên-hiện-trường); vòng đời yếu tố/mã dự phòng cùng quy tắc nhóm quản lý đã duyệt tại cùng mục, gồm chưa hỗ trợ khôi phục khi mất cả hai. Nguyên tắc idle và hạn tuyệt đối cho phiên đã duyệt tại mục [9.14.8](security.md#9148-nguyên-tắc-tự-hết-hạn-phiên-đăng-nhập); khách hàng idle 30 phút/tuổi tối đa 24 giờ đã duyệt. Quản trị/quản lý idle 15 phút/tuổi tối đa 8 giờ đã duyệt. Tiếp tục có giới hạn soát/giao bằng quyền còn hợp lệ khi phiên chính tới hạn trong sự cố Identity đã duyệt tại cùng mục. Nhân viên idle 30 phút/tuổi tối đa 8 giờ đã duyệt. Cảnh báo trong app trước khi phiên hết hạn đã duyệt tại mục [9.14.8](security.md#9148-nguyên-tắc-tự-hết-hạn-phiên-đăng-nhập), cửa sổ báo trước còn mở. Tính thao tác chủ động tại chỗ khi server nhận tín hiệu hợp lệ đã duyệt trong cùng mục; không tính đọc thụ động/tác vụ nền. Vô hiệu mọi phiên cũ sau đổi/đặt lại mật khẩu thành công đã duyệt tại mục [9.14.9](security.md#9149-vô-hiệu-phiên-sau-đổiđặt-lại-mật-khẩu). Khóa bảo mật kèm thu hồi mọi phiên/mở khóa không hồi sinh phiên cũ đã duyệt tại mục [9.14.10](security.md#91410-vòng-đời-phiên-khi-khóamở-khóa-bảo-mật). Truyền thu hồi Identity → Core khi hệ thống khỏe tối đa 5 giây đã duyệt tại mục [9.14.11](security.md#91411-thời-gian-truyền-thu-hồi-tới-core-khi-hệ-thống-khỏe); giữ bền/tự đồng bộ bù khi đường truyền lỗi đã duyệt tại mục [9.14.12](security.md#91412-giữ-và-đồng-bộ-bù-thu-hồi-khi-đường-truyền-lỗi). Điều kiện xác nhận bắt kịp trước kết thúc suy giảm đã duyệt tại mục [9.14.13](security.md#91413-điều-kiện-kết-thúc-suy-giảm-của-đường-thu-hồi). Tạm chặn yêu cầu mới cần tài khoản khách khi không xác minh được phiên hiện hành đã duyệt tại mục [9.14.14](security.md#91414-quyền-khách-hàng-khi-không-xác-minh-được-phiên-hiện-hành). Thứ tự hiệu lực giữa thu hồi và lệnh ghi đang chạy đã duyệt tại mục [9.14.15](security.md#91415-lệnh-ghi-đang-chạy-đồng-thời-với-thu-hồi). Bộ sáu nhóm nghiệm thu phiên/thu hồi đã duyệt tại mục [9.14.16](security.md#91416-bộ-nghiệm-thu-phiên-và-thu-hồi). Vòng đời dữ liệu khác, cơ chế phiên/thu hồi khi lỗi và cấu hình/kiểm chứng MFA còn mở; quyết định rủi ro/dữ liệu không thay bằng benchmark. |

Mỗi đề nghị chốt tiếp cần nêu trường NFR bị tác động, căn cứ, ngưỡng đề xuất, điều kiện đo và nguồn duyệt.
Các mục đang chờ trong bảng không phải ngoại lệ nghiệm thu đã được cấp; chỉ giới hạn bằng chứng Safari
tại mục [9.9.2](performance.md#992-ma-trận-trình-duyệt-và-giới-hạn-đo-safari), ngoại lệ Android thật tại mục [9.10](performance.md#910-nfr-perf-02---hiệu-năng-hai-app-mobile-cài-riêng) và các ranh giới được duyệt rõ ở từng mục mới được áp dụng.
Không kết luận bộ NFR hoàn chỉnh hoặc ứng dụng đạt
khi vẫn thiếu mục tiêu/điều kiện/bằng chứng bắt buộc tương ứng.

### 9.17.1. Bảng kiểm chất lượng yêu cầu NFR

**Mục đích:** rà độ đầy đủ, rõ ràng, nhất quán và khả năng nghiệm thu của yêu cầu trong mục 9;
không kiểm implementation hoặc thay bộ ca nghiệm thu phần mềm.
**Ngày lập:** 2026-11-22. **Đối tượng rà soát:** chủ sản phẩm/người review tài liệu trước thiết kế thực thi.
Bảng kiểm tùy chỉnh theo `speckit-checklist`, đặt trong tài liệu hiện có theo yêu cầu chủ sản phẩm.
Dấu `[x]` chỉ có nghĩa người review đã xác nhận tiêu chí chất lượng yêu cầu; không có nghĩa code,
runtime hoặc nghiệm thu sản phẩm đã đạt. Các mục được đánh giá hỗ trợ theo yêu cầu rà soát của
chủ sản phẩm ngày 2026-11-24; kết quả/căn cứ tại mục [9.17.2](#9172-kết-quả-rà-soát-và-bản-thiết-kế-cơ-sở-ngày-2026-11-24). Mục còn `[ ]` cần hoàn thiện theo phạm vi
ghi ở đó. Bảng này không cấp quyền triển khai hoặc tự đổi ngưỡng đã được duyệt.

##### Độ đầy đủ và rõ ràng

- [x] NFR-CHK001 Mỗi NFR có mã, mục tiêu/tình huống, chỉ số, ngưỡng/căn cứ, điều kiện đo, mức ưu tiên, cách nghiệm thu và trạng thái theo từng trường chưa? [Đầy đủ, §9.2]
- [x] NFR-CHK002 Phạm vi và nguồn duyệt có phân biệt lựa chọn mới nhất, đề xuất chưa duyệt, ngoại lệ và phụ thuộc chưa chốt mà không suy từ phê duyệt cả nhóm không? [Truy vết, §9.1–9.3, §9.17]
- [ ] NFR-CHK003 Điểm bắt đầu/kết thúc và phần thời gian loại trừ có rõ cho từng loại lượt AI, API, Web/native, cảnh báo, restart và DR không? [Rõ ràng, §9.7–9.10, §9.12, §9.15–9.16]
- [x] NFR-CHK004 Mẫu số AI có giữ mọi lượt hợp lệ đã bắt đầu, bao gồm lỗi/timeout/chậm; quy tắc API thành công–lỗi và phép đo Web/native có được phân biệt không? [Nhất quán, §9.8, §9.9–9.10, §9.15.2]
- [ ] NFR-CHK005 Điều kiện đủ mẫu, số đợt, nhóm so sánh và trường hợp bài đo không hợp lệ đã được xác định hoặc ghi đúng căn cứ cần bổ sung, thay vì dùng số minh họa làm cỡ mẫu chưa? [Khả năng đo, §9.8–9.10, §9.15, §9.17]
- [x] NFR-CHK006 Môi trường/build, dữ liệu, topology, thiết bị/mạng và nguồn thật–sandbox–mô phỏng có được yêu cầu công bố để giới hạn kết luận đúng phạm vi không? [Điều kiện, §9.4, §9.7–9.10, §9.12–9.16]
- [x] NFR-CHK007 Các chỉ số chưa đủ căn cứ có chỉ rõ đầu vào cần bổ sung và phải được duyệt trước nghiệm thu, đồng thời giữ nguyên quyết định hoãn hosting/ngân sách không? [Phụ thuộc, §9.3, §9.17]

##### Tính nhất quán và bao phủ rủi ro

- [x] NFR-CHK008 Mục tiêu tốc độ/chất lượng có giữ riêng các bất biến quyền, ghế, tiền, vé và xác minh Core, không dùng tỷ lệ tổng bù lỗi an toàn không? [An toàn, §9.5, §9.8, §9.14–9.16]
- [x] NFR-CHK009 Deadline 60 giây, giới hạn một lượt/tài khoản, fallback, dừng vòng lặp và quota có được phân biệt với mục tiêu trải nghiệm 10/30 giây hoặc trần đồng thời toàn hệ thống không? [Nhất quán, §9.8, §9.11]
- [x] NFR-CHK010 Mục đích/trường được phép và vòng đời của log chẩn đoán, chat/checkpoint, audit cùng mọi bản tự quản có được phân biệt; xóa/restore/retry có tránh gia hạn hoặc hồi sinh dữ liệu không? [Dữ liệu, §9.6, §9.14.7]
- [x] NFR-CHK011 Idle/tuổi tối đa, hoạt động tại chỗ, cảnh báo trước hạn, thu hồi khi khỏe/lỗi và lệnh đang ghi có quy tắc tương thích với 90/15/60 và trạng thái giao dịch Core không? [Bao phủ, §9.14.8–9.14.16]
- [x] NFR-CHK012 Yêu cầu giám sát có phân biệt sức khỏe service, inference thực tế, nguồn chính/dự phòng, thời điểm gửi/nhận thư và phản ứng con người, cùng giới hạn khi mất monitor/host không? [Bao phủ, §9.12.1–9.12.13]
- [x] NFR-CHK013 Yêu cầu trợ năng/responsive có chỉ rõ phạm vi Web/native, vùng hai chiều thực sự cần thiết, các phương thức trợ năng và giới hạn bằng chứng Android thật/Safari không? [Bao phủ, §9.9.2, §9.10, §9.13]
- [x] NFR-CHK014 DR mất Core DB và restart chỉ ứng dụng có tách đúng phạm vi, RPO/RTO/mốc kết thúc, dữ liệu trước/sau sự cố và các nhánh lỗi/đồng thời cần bao phủ không? [Phục hồi, §9.7, §9.15–9.16]

**Lưu ý review:** số mẫu AI, tham số resource/vòng gọi, cấu hình đo, cửa sổ cảnh báo phiên,
thời hạn đồng bộ bù, danh mục lưu/xóa và chi tiết audit vẫn phải được xét theo phần còn mở tương ứng.
Bảng kiểm không tạo ngoại lệ mới cho các mục đó hoặc xác nhận chúng đã hoàn tất.

### 9.17.2. Kết quả rà soát và bản thiết kế cơ sở ngày 2026-11-24

**Mức đóng:** hoàn tất lượt rà soát tài liệu và tổng hợp các quyết định đã duyệt làm bản thiết kế cơ sở.
Giữ nguyên phạm vi 14 NFR tại đầu mục 9, các ngưỡng, ưu tiên và ngoại lệ đã được duyệt theo từng nội dung.
Không có ngưỡng hoặc yêu cầu sản phẩm mới được phê duyệt từ lượt rà soát này.
Đây là đầu vào cho thiết kế chi tiết; chưa phải bộ tham số nghiệm thu đã khóa đầy đủ hoặc kết quả runtime.
Các mục chờ căn cứ tại [9.17.3](#9173-phần-còn-mở-và-điều-kiện-hoàn-tất-trước-nghiệm-thu) vẫn là điều kiện cần giải quyết trước phần đo/nghiệm thu tương ứng,
không phải ngoại lệ được tự bỏ qua để kết luận demo đạt.

**Kết quả bảng kiểm:** 12/14 tiêu chí đủ về mô tả yêu cầu cơ sở sau hiệu chỉnh; CHK003 và CHK005
còn cần hoàn thiện. Tỷ lệ này chỉ mô tả kết quả review tài liệu, không là tỷ lệ NFR hoặc phần mềm đã đạt.

| Tiêu chí | Kết quả rà soát | Căn cứ và giới hạn |
|---|---|---|
| NFR-CHK001 | Đủ cấu trúc | 14 NFR có mục tiêu/tình huống, chỉ số, ngưỡng hoặc phần chờ căn cứ, điều kiện, ưu tiên, nghiệm thu và nguồn/trạng thái duyệt. Bổ sung nhãn mục tiêu cho NFR-RES-01 từ chính sách hiện có; không tự đặt giá trị còn thiếu. [§9.2](#92-cấu-trúc-và-trạng-thái-từng-nfr), [§9.5](ai-agent.md#95-nfr-rel-01---cô-lập-sự-cố-ai-khỏi-luồng-đặt-vé-trực-tiếp)–[9.16](recovery-and-correctness.md#916-nfr-dur-01---bảo-toàn-trạng-thái-khi-tiến-trình-ứng-dụng-khởi-động-lại). |
| NFR-CHK002 | Đủ | Phân biệt duyệt từng trường, đề xuất, lựa chọn bị thay và nguồn được ghim. Sửa các câu tổng hợp cũ để dẫn về quyết định tiếp nối, không sửa lịch sử phê duyệt. [§9.2](#92-cấu-trúc-và-trạng-thái-từng-nfr), [§9.8](ai-agent.md#98-nfr-ai-01---hiểu-tiếng-việt-và-giữ-đúng-yêu-cầu-qua-nhiều-lượt), [§9.17](#917-căn-cứ-còn-cần-để-chốt-ngưỡng-định-lượng). |
| NFR-CHK003 | Cần hoàn thiện | Các mốc chính AI/API/Web, mở app, hai bước soát, cảnh báo, DR/restart đã có. Camera sẵn sàng, quay lại app, phản hồi/khung hình native và phạm vi tác vụ bổ sung vẫn cần định nghĩa phép đo đầy đủ; không dùng mốc của phép đo khác thay thế. Xem NFR-OPEN03. |
| NFR-CHK004 | Đủ | Tỷ lệ AI giữ lỗi/timeout trong mẫu số; API tách p95 thành công khỏi tỷ lệ lỗi; Web/native có quy tắc riêng. Không gộp để bù nhóm không đạt. [§9.8](ai-agent.md#98-nfr-ai-01---hiểu-tiếng-việt-và-giữ-đúng-yêu-cầu-qua-nhiều-lượt)–[9.10](performance.md#910-nfr-perf-02---hiệu-năng-hai-app-mobile-cài-riêng), [§9.15.2](recovery-and-correctness.md#9152-cách-tính-p95-và-phân-nhóm-kết-quả-api). |
| NFR-CHK005 | Cần hoàn thiện | Web/native/API đã có cỡ mẫu hoặc đợt cho phép đo được chỉ định; độ trễ AI chưa có kế hoạch đủ mẫu/đợt theo từng nhóm. Bộ chất lượng AI 60 ca × 3 không tự chứng minh đủ mẫu độ trễ mọi loại lượt. Xem NFR-OPEN01. |
| NFR-CHK006 | Đủ yêu cầu công bố | Build, dữ liệu, thiết bị/mạng, topology và nguồn thật/sandbox/stub phải được định danh. Các giá trị thực còn là đầu vào chuẩn bị phép đo, không được coi đã có môi trường đo. [§9.4](#94-hướng-kiểm-chứng-cho-portfolio-và-cơ-sở-nghiên-cứu), [§9.7](recovery-and-correctness.md#97-nfr-dr-01---phục-hồi-dữ-liệu-thử-từ-bản-sao-lưu-và-kiểm-chứng-nghiệp-vụ)–[9.16](recovery-and-correctness.md#916-nfr-dur-01---bảo-toàn-trạng-thái-khi-tiến-trình-ứng-dụng-khởi-động-lại). |
| NFR-CHK007 | Đủ về quản lý phần mở | Quy trình chốt hai bước, điều kiện cần căn cứ và quyết định hoãn ngân sách/hosting được giữ; phân loại đầu ra cần bổ sung tại [9.17.3](#9173-phần-còn-mở-và-điều-kiện-hoàn-tất-trước-nghiệm-thu). Không đồng nghĩa những tham số đó đã được duyệt. [§9.3](#93-đầu-vào-cần-làm-rõ-và-quyết-định-hoãn), [§9.17](#917-căn-cứ-còn-cần-để-chốt-ngưỡng-định-lượng). |
| NFR-CHK008 | Đủ | Quyền/ghế/tiền/vé và xác minh Core là điều kiện riêng; tỷ lệ tốc độ/chất lượng không bù lỗi an toàn. [§9.5](ai-agent.md#95-nfr-rel-01---cô-lập-sự-cố-ai-khỏi-luồng-đặt-vé-trực-tiếp), [§9.8](ai-agent.md#98-nfr-ai-01---hiểu-tiếng-việt-và-giữ-đúng-yêu-cầu-qua-nhiều-lượt), [§9.14](security.md#914-nfr-sec-01---kiểm-soát-danh-tính-quyền-và-phạm-vi-dữ-liệu)–[9.16](recovery-and-correctness.md#916-nfr-dur-01---bảo-toàn-trạng-thái-khi-tiến-trình-ứng-dụng-khởi-động-lại). |
| NFR-CHK009 | Đủ | Mục tiêu trải nghiệm phía khách, deadline phía server, số lượt/tài khoản và quota/tài nguyên được phân biệt. Các giá trị chưa duyệt không lấy mặc định SDK thay thế. [§9.8](ai-agent.md#98-nfr-ai-01---hiểu-tiếng-việt-và-giữ-đúng-yêu-cầu-qua-nhiều-lượt), [§9.11](ai-agent.md#911-nfr-res-01---giới-hạn-tài-nguyên-ai-cho-demo-công-khai). |
| NFR-CHK010 | Đủ về chính sách cơ sở | Log, chat/checkpoint và audit có phạm vi/hạn riêng; retry/restore không được làm mới tuổi hoặc hồi sinh dữ liệu đã xóa. Danh mục trường/nơi lưu và cách thực thi còn mở tại NFR-OPEN05. [§9.6](privacy-and-audit.md#96-nfr-priv-01---nhật-ký-chẩn-đoán-chỉ-chứa-thông-tin-kỹ-thuật), [§9.14.7](privacy-and-audit.md#9147-nfr-sec-02---nhật-ký-kiểm-toán-tối-thiểu). |
| NFR-CHK011 | Đủ về quy tắc đã chọn | Ba nhóm phiên, hoạt động, MFA, thu hồi, thứ tự lệnh ghi và ngoại lệ quyền vận hành được phân biệt. Thời điểm báo trước/hạn đồng bộ bù còn phải chốt, không diễn giải thành thu hồi tức thì. [§9.14.8](security.md#9148-nguyên-tắc-tự-hết-hạn-phiên-đăng-nhập)–[9.14.16](security.md#91416-bộ-nghiệm-thu-phiên-và-thu-hồi), NFR-OPEN04. |
| NFR-CHK012 | Đủ về phạm vi | Tách health Agent, inference theo lượt, provider, chuyển phát và con người; nêu giới hạn mất cả host/monitor. Cấu hình thực thi và dữ liệu thử còn mở. [§9.12.1](operations.md#9121-thông-báo-theo-vòng-đời-sự-cố)–[9.12.13](operations.md#91213-bộ-nghiệm-thu-giám-sát-và-cảnh-báo). |
| NFR-CHK013 | Đủ về phạm vi | Web/native và tổ hợp trợ năng được phân biệt; vùng hai chiều có điều kiện, không miễn trợ năng khác. Giữ giới hạn Safari và khoảng trống Android thật, không mở ngoại lệ mới. [§9.9.2](performance.md#992-ma-trận-trình-duyệt-và-giới-hạn-đo-safari), [§9.10](performance.md#910-nfr-perf-02---hiệu-năng-hai-app-mobile-cài-riêng), [§9.13](accessibility.md#913-nfr-acc-01---khả-năng-tiếp-cận-trên-bốn-app). |
| NFR-CHK014 | Đủ về loại sự cố | Mất Core DB và chỉ restart ứng dụng có phạm vi/mốc RPO/RTO khác nhau; kiểm cả lỗi và đồng thời, seed không thay restore. Manifest và thao tác diễn tập còn phải cụ thể hóa. [§9.7](recovery-and-correctness.md#97-nfr-dr-01---phục-hồi-dữ-liệu-thử-từ-bản-sao-lưu-và-kiểm-chứng-nghiệp-vụ), [§9.15](recovery-and-correctness.md#915-nfr-cor-01---tính-đúng-đắn-giao-dịch-khi-tranh-chấp-và-xử-lý-lặp)–[9.16](recovery-and-correctness.md#916-nfr-dur-01---bảo-toàn-trạng-thái-khi-tiến-trình-ứng-dụng-khởi-động-lại). |

Các hiệu chỉnh của lượt rà soát chỉ làm rõ trạng thái đã có: nhóm trường chẩn đoán, vòng đời backup,
cách đếm AI, thiết bị iOS sẵn có, phạm vi cảnh báo, tổ hợp trợ năng và các quyết định phiên/thu hồi.
Không thay nguồn thẩm quyền nghiệp vụ, không sửa code, không chạy provider, gửi email hoặc diễn tập.

### 9.17.3. Phần còn mở và điều kiện hoàn tất trước nghiệm thu

Bảng này phân loại các phần còn mở đã nêu trong mục [9.17](#917-căn-cứ-còn-cần-để-chốt-ngưỡng-định-lượng), không tạo chính sách hoặc ngưỡng thay thế.
Người thiết kế/đo chuẩn bị căn cứ; chủ sản phẩm duyệt mục tiêu chất lượng và thay đổi phạm vi nếu phát sinh.
Metadata thực tế và chi tiết thực thi phải khớp yêu cầu đã duyệt, không tự đổi tiêu chí theo kết quả đo.

| Mã | Phần cần hoàn thiện | Căn cứ/đầu ra cần có | Khi cần hoàn tất |
|---|---|---|---|
| NFR-OPEN01 | Kế hoạch lấy mẫu độ trễ AI; mục tiêu cho phạm vi chưa có ngưỡng | Ma trận loại lượt/đường provider/app và điểm đầu–cuối, workload/lịch sử/đầu vào, quota thực và số call dự kiến; cỡ mẫu/đợt, quy tắc bài đo không hợp lệ, bằng chứng cần giữ. Không tự lấy 60 ca chất lượng hoặc 100 ở ví dụ tỷ lệ làm số mẫu độ trễ. [§9.8](ai-agent.md#98-nfr-ai-01---hiểu-tiếng-việt-và-giữ-đúng-yêu-cầu-qua-nhiều-lượt). | Trước đo/nghiệm thu độ trễ AI; mục tiêu mới phải được duyệt trước kết luận. |
| NFR-OPEN02 | Giới hạn vòng/calls, input/context/output, usage, timeout call, tần suất và phiên khách | Luồng model/tool trên bộ ca, đặc điểm quota/model đã chọn và phép đo khi được phép; đề xuất cấu hình hữu hạn có kiểm biên. Thiết kế định danh/chuyển tiếp phiên và bộ đếm, không áp lại trần đồng thời toàn hệ thống đã bị loại. [§9.11](ai-agent.md#911-nfr-res-01---giới-hạn-tài-nguyên-ai-cho-demo-công-khai). | Trước thực thi cơ chế tương ứng và nghiệm thu AI công khai. |
| NFR-OPEN03 | Phép đo native bổ sung và hồ sơ tương thích | Mốc camera/quay lại app/QR offline/phản hồi và khung hình, đơn vị/cửa sổ/điều kiện đo; phạm vi màn hình đã duyệt, framework/công cụ phù hợp, thiết bị/OS/build thực tế. Phân biệt phiên bản thiết bị tham chiếu với mức hỗ trợ tối thiểu. Giữ mở app và hai bước soát đã duyệt. [§9.9](performance.md#99-nfr-perf-01---hiệu-năng-trải-nghiệm-web)–[9.10](performance.md#910-nfr-perf-02---hiệu-năng-hai-app-mobile-cài-riêng). | Trước phép đo tương ứng và trước công bố phạm vi hỗ trợ/đạt. |
| NFR-OPEN04 | Tham số và hợp đồng phiên/quyền | Cửa sổ cảnh báo trước hạn dựa trên cơ hội thao tác/trợ năng; tín hiệu hoạt động gắn phiên, clock, sự kiện/token và thứ tự có thẩm quyền; hạn đồng bộ bù dựa trên workload/topology và nhu cầu. Đối chiếu 90/15/60 cùng các ca hết hạn/thu hồi/lệnh đang ghi. [§9.14.8](security.md#9148-nguyên-tắc-tự-hết-hạn-phiên-đăng-nhập)–[9.14.16](security.md#91416-bộ-nghiệm-thu-phiên-và-thu-hồi). | Trước chốt thiết kế cơ chế liên quan; tham số chất lượng phải duyệt trước nghiệm thu SES. |
| NFR-OPEN05 | Danh mục dữ liệu/sự kiện, lưu–xóa và audit | Bảng từng nhóm trường/sự kiện/nơi lưu/mục đích, phần đủ điều kiện xóa/phần giữ có căn cứ và mốc tương ứng; quyền dọn, nguồn ghi bền, toàn vẹn và xử lý bản sao/provider. Cấu hình hạn chế lưu nội dung phải được xác minh trước chat thật. Không thay các hạn 7 ngày/30 ngày/24 giờ đã duyệt theo từng phạm vi. [§9.6](privacy-and-audit.md#96-nfr-priv-01---nhật-ký-chẩn-đoán-chỉ-chứa-thông-tin-kỹ-thuật), [§9.14.7](privacy-and-audit.md#9147-nfr-sec-02---nhật-ký-kiểm-toán-tối-thiểu). | Trước thu thập/xử lý dữ liệu thật và trước nghiệm thu vòng đời/audit tương ứng. |
| NFR-OPEN06 | Chi tiết vận hành, dữ liệu thử và DR/restart | Đường email và hợp đồng retry/chống trùng, trạng thái sự cố, nơi chạy monitor/health; cỡ nhóm tài khoản/ghế, lịch dọn/retention dữ liệu thử theo TTL/mô hình dữ liệu. Manifest DB/phụ thuộc/khóa/artifact, dung lượng, phiên bản/công cụ và cách nhận biết mốc ngắt/restore. [§9.7](recovery-and-correctness.md#97-nfr-dr-01---phục-hồi-dữ-liệu-thử-từ-bản-sao-lưu-và-kiểm-chứng-nghiệp-vụ), [§9.12](operations.md#912-nfr-ops-01---phát-hiện-và-cảnh-báo-sự-cố-có-ảnh-hưởng-tới-demo), [§9.16](recovery-and-correctness.md#916-nfr-dur-01---bảo-toàn-trạng-thái-khi-tiến-trình-ứng-dụng-khởi-động-lại). | Trước bật lịch kiểm hoặc thực thi/nghiệm thu OBS, DR và DUR; không suy yêu cầu thiết kế thành quyền chạy. |
| NFR-OPEN07 | Điều kiện kiểm tải và dữ liệu tranh chấp | Topology/tài nguyên, dữ liệu cô lập, bậc/trần/thời lượng/số mẫu tìm giới hạn, điều kiện dừng/drain và kiểm sau tải; ánh xạ endpoint/kết quả theo nguồn nghiệp vụ. Giữ benchmark/ngưỡng đã duyệt, không đổi vì thiếu mẫu. [§9.15](recovery-and-correctness.md#915-nfr-cor-01---tính-đúng-đắn-giao-dịch-khi-tranh-chấp-và-xử-lý-lặp). | Trước kiểm tải; điều chỉnh mục tiêu/điều kiện đã duyệt phải trình duyệt thay đổi. |
| NFR-OPEN08 | Ma trận trợ năng theo từng hành trình/nền tảng | Checklist tiêu chí Web/native áp dụng, phiên bản công nghệ trợ năng/giọng-ngôn ngữ/cỡ chữ/zoom, trạng thái chờ/lỗi/hết hạn và bằng chứng cần giữ. Đối chiếu yêu cầu cảnh báo phiên và vùng sơ đồ ghế với tiêu chí áp dụng. [§9.13](accessibility.md#913-nfr-acc-01---khả-năng-tiếp-cận-trên-bốn-app). | Trước nghiệm thu hoặc tuyên bố phù hợp trợ năng; không suy scanner hay một tổ hợp thành mọi nền tảng đạt. |

**Phần chủ động hoãn:** ngân sách và hosting theo [§9.3](#93-đầu-vào-cần-làm-rõ-và-quyết-định-hoãn) chỉ mở lại khi chủ sản phẩm yêu cầu hoặc
đến giai đoạn chuẩn bị triển khai. Lựa chọn này không đình chỉ yêu cầu an toàn hoặc tự miễn ngưỡng đã duyệt.
**Giới hạn bằng chứng đã duyệt:** giữ đúng phạm vi Safari tại [§9.9.2](performance.md#992-ma-trận-trình-duyệt-và-giới-hạn-đo-safari) và Android thật tại [§9.10](performance.md#910-nfr-perf-02---hiệu-năng-hai-app-mobile-cài-riêng);
chưa có thiết bị/bằng chứng không được đổi thành kết luận đạt, cũng không bắt mua thiết bị từ bản cơ sở này.

**Điểm kết thúc vòng hiện tại:** đã có bản cơ sở và danh sách phần mở để tiếp tục thiết kế chi tiết;
không cần hỏi lại các quyết định đã duyệt. Chỉ mở vòng làm rõ mới khi chuẩn bị giải quyết một mục
NFR-OPEN cụ thể mà nguồn hiện có chưa đủ. Bản nghiệm thu cuối cùng chỉ có thể khóa sau khi các
phần mở ảnh hưởng tới phép nghiệm thu đó đã được giải quyết và các ngưỡng mới đã được duyệt.
