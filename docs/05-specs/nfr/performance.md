# Hiệu năng Web và Mobile

[← Tổng quan NFR](README.md)

## 9.9. NFR-PERF-01 - Hiệu năng trải nghiệm Web

**Ba ngưỡng mục tiêu: Đã duyệt.** Ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý với 3 ngưỡng này”
cho đề xuất LCP ≤ 2,5 giây, INP ≤ 200 ms, CLS ≤ 0,1 tại phân vị 75, tách máy tính/điện thoại,
áp dụng Customer Web và Organizer Web. Nguồn nghiên cứu cùng ngày được dẫn bên dưới.
Sau vòng làm rõ Mobile cùng ngày, chủ sản phẩm đồng ý với phạm vi đo bắt buộc cả bốn app và
các hành trình chính đã đề xuất. Bằng chứng lab cho mốc đầu đã duyệt tại mục [9.9.1](#991-bằng-chứng-web-cho-mốc-portfolio-đầu);
ma trận, hồ sơ và lấy mẫu đã duyệt theo từng mục bên dưới; metadata môi trường, dữ liệu và kịch bản
chi tiết còn cần hoàn thiện. Phê duyệt phạm vi/ngưỡng không phải bằng chứng ứng dụng đã đạt.

| Trường | Nội dung |
|---|---|
| Mục tiêu và phạm vi | Customer Web và Organizer Web tải nội dung, phản hồi tương tác và giữ bố cục ổn định trong trình duyệt máy tính/điện thoại. Không dùng chỉ số này cho ứng dụng native, độ trễ API hoặc thời gian AI hoàn tất câu trả lời. |
| Tình huống và phạm vi bắt buộc | Customer Web: khám phá/chi tiết phim, chọn ghế, thanh toán/xem vé, giao diện chat. Organizer Web: quản lý lịch chiếu, xét yêu cầu hủy/theo dõi hoàn tiền, xem báo cáo. Đo tải trang và click/tap/bàn phím theo định nghĩa chỉ số; URL cụ thể, trạng thái dữ liệu và chuỗi thao tác cần xác định trước nghiệm thu. |
| Chỉ số | LCP: thời gian hiển thị nội dung lớn nhất khi tải trang; INP: độ trễ phản hồi tương tác tới khung hình kế tiếp theo định nghĩa Web Vitals; CLS: điểm xê dịch bố cục, không có đơn vị thời gian. |
| Ngưỡng mục tiêu đã duyệt | Mức “tốt” của Core Web Vitals: LCP ≤ 2,5 giây, INP ≤ 200 ms, CLS ≤ 0,1 tại phân vị 75, tách mobile/desktop; cả ba phải đạt trong phạm vi đánh giá đã xác định. Căn cứ là nguồn Web Vitals dưới đây, chưa phải cam kết trải nghiệm trên mọi thiết bị/mạng. |
| Điều kiện đo | Lab, ma trận trình duyệt/giới hạn Safari, 20 mẫu mỗi nhóm Chrome và nearest rank đã duyệt tại mục [9.9.1](#991-bằng-chứng-web-cho-mốc-portfolio-đầu)–[9.9.3](#993-số-mẫu-và-cách-tính-p75-web). Cache lạnh và hồ sơ viewport/CPU/mạng đã duyệt ở mục [9.9.4](#994-trạng-thái-cache-cho-bộ-đo-web-chuẩn) và [9.9.5](#995-hai-hồ-sơ-viewportcpumạng-cho-bộ-đo-web). Máy/phiên bản, URL/kịch bản/dữ liệu, tải backend và khoảng đo chi tiết còn cần ghi trước nghiệm thu. Phân biệt lab với field; không trộn hai tập hoặc suy mẫu thử thành phân vị ngoài thực tế. |
| Mức ưu tiên | Đo bắt buộc các hành trình chính cho demo theo xác nhận phạm vi cả bốn app; điều kiện và phương pháp nghiệm thu chi tiết chờ chốt. |
| Cách nghiệm thu đề xuất | Đo lặp lại ở các trang/hành trình và điều kiện được thống nhất, có tương tác thực hiện để đánh giá INP; giữ phân bố và kết quả từng nhóm. Khi có đủ dữ liệu người dùng thật, đánh giá riêng theo phân vị 75. Không dùng điểm Lighthouse hoặc TBT thay bằng chứng INP; thiếu dữ liệu thực tế phải báo chưa đủ bằng chứng đánh giá ngoài thực tế. |
| Giới hạn | INP không phải tổng thời gian chờ mạng/AI trả kết quả. Chuẩn này bổ sung góc đo cho mục tiêu UI hiện có, không thay yêu cầu 60fps, khả năng tiếp cận hoặc tính đúng đắn giao dịch. Chưa cài công cụ hoặc thu dữ liệu người dùng. |

Web trên trình duyệt điện thoại thuộc NFR-PERF-01. Hai app cài riêng Customer Mobile và Organizer Mobile
vẫn thuộc phạm vi nền tảng; không dùng việc tách bộ chỉ số để loại chúng khỏi kế hoạch kiểm chứng hiệu năng.
Bộ chỉ số native và trạng thái từng quyết định do NFR-PERF-02 bên dưới sở hữu;
không áp ba ngưỡng Web thành ngưỡng native.

Nguồn sơ cấp, tra cứu ngày 2026-11-17:

- [Google — Web Vitals](https://web.dev/articles/vitals) và
  [cơ sở chọn ngưỡng](https://web.dev/articles/defining-core-web-vitals-thresholds) xác định ngưỡng “tốt”,
  phân vị 75 và cách tách mobile/desktop. Đo trong phòng thử hỗ trợ phát hiện lỗi, không thay số đo người dùng thật.
- [Google — INP](https://web.dev/articles/inp) giải thích phạm vi tương tác và giới hạn của phép đo;
  tải trang mà không thao tác không đủ để đánh giá INP.
- [Chrome — CrUX methodology](https://developer.chrome.com/docs/crux/methodology/) yêu cầu đủ lượng người truy cập
  để có dữ liệu. Demo ít người có thể không có CrUX; thiếu số liệu không phải kết luận đạt hoặc không đạt.

### 9.9.1. Bằng chứng Web cho mốc portfolio đầu

**Phương án A: Đã duyệt ngày 2026-11-18.** Chủ sản phẩm trả lời “tôi đồng ý” cho nghiệm thu hiệu năng
Web mốc đầu bằng phép đo có kiểm soát, đủ LCP/INP/CLS trong phạm vi đã thống nhất, tách máy tính/điện thoại,
giữ ngưỡng đã duyệt và ghi rõ kết quả môi trường thử. Bổ sung đánh giá field khi đủ dữ liệu, không công bố
đạt ngoài thực tế từ số đo lab. Chi tiết ma trận, hồ sơ/lấy mẫu và nghiệm thu bên dưới còn là đề xuất cụ thể hóa.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Hai app Web đã có luồng cần nghiệm thu nhưng chưa đủ lượng người dùng thật để đánh giá phân bố field/CrUX. Cần bằng chứng tái lập cho mốc portfolio mà vẫn báo đúng giới hạn. |
| Phương án A đã duyệt | Dùng đo có kiểm soát trong môi trường thử làm bằng chứng nghiệm thu hiệu năng Web mốc đầu, trên các trang/hành trình và ma trận đã chốt. Báo rõ kết quả lab; bổ sung đánh giá field riêng khi đủ dữ liệu. Thiếu CrUX không tự là lỗi hoặc bằng chứng đạt. Quyết định thiết kế không cho phép cài SDK, thu dữ liệu thật hoặc triển khai. |
| Chỉ số và ngưỡng | Giữ LCP ≤ 2,5 giây, INP ≤ 200 ms, CLS ≤ 0,1 tại phân vị 75 của bộ lượt thử đã định; xét riêng app, nhóm trang/hành trình và cấu hình desktop/mobile. Đây là áp dụng ngưỡng làm mục tiêu lab cho demo; không gọi p75 của mẫu lab là p75 người dùng thật hoặc kết luận field CWV đạt. |
| Điều kiện đo | Chốt browser/phiên bản, máy/viewport hoặc điện thoại, mạng/cache, dữ liệu và trạng thái phiên, backend/tải và cách thu chỉ số trước chạy. Mỗi lượt có tải trang và chuỗi click/tap/bàn phím theo kịch bản để đo phản hồi; công bố Core thật/sandbox/mock. Không dùng số đo BFF mô phỏng thay bằng chứng giao dịch Core thật. Ma trận và 20 mẫu mỗi nhóm Chrome đã duyệt tại mục [9.9.2](#992-ma-trận-trình-duyệt-và-giới-hạn-đo-safari)–[9.9.3](#993-số-mẫu-và-cách-tính-p75-web); không tự áp 100 mẫu của native. |
| INP và dữ liệu thiếu | Phải có tương tác thuộc định nghĩa chỉ số, đo phản hồi giao diện tới khung hình tiếp theo. Không dùng điểm Lighthouse/TBT, token đầu AI hoặc tổng thời gian model thay INP. Lượt/trình duyệt không có số đo hợp lệ thì ghi thiếu bằng chứng, không điền 0 hoặc tự coi đạt; cần phương pháp đo phù hợp hoặc ngoại lệ được duyệt riêng. |
| Mức ưu tiên | Đề xuất bắt buộc có bằng chứng lab đủ ba chỉ số trong phạm vi nghiệm thu mốc đầu. Field chưa đủ dữ liệu được báo là chưa đánh giá, không tự biến thành tuyên bố đạt hoặc miễn các mục tiêu UI/chức năng. |
| Cách nghiệm thu | Báo cáo từng trang/hành trình/cấu hình, dữ liệu thô và phân vị, tương tác đã thực hiện, build/công cụ và kết quả cả ba chỉ số. Không dùng nhóm tốt bù nhóm kém hoặc lỗi trả nhanh làm lượt thành công; giữ lỗi/thiếu dữ liệu theo quy tắc chốt trước đo. Báo phần chưa có field và phạm vi browser chưa đủ bằng chứng. |
| Đánh đổi và phương án B | A đã chọn phù hợp portfolio ít người dùng, kiểm được tình huống chuẩn nhưng không chứng minh trải nghiệm thực tế đa dạng. B yêu cầu đủ dữ liệu field trước khi nghiệm thu hiệu năng đã cân nhắc nhưng không chọn cho mốc đầu; có góc nhìn thực tế hơn nhưng có thể phải chờ lượng truy cập. Không làm phát sinh yêu cầu mua traffic/thuê dịch vụ theo dõi. |

Căn cứ dùng lại Google Web Vitals/INP và CrUX ở mục [9.9](#99-nfr-perf-01---hiệu-năng-trải-nghiệm-web) về phân biệt lab/field và phạm vi chỉ số.
Việc cho phép lab làm bằng chứng nghiệm thu mốc đầu là quyết định phạm vi của dự án đã duyệt, không phải Google
chứng nhận kết quả lab tương đương field. Ma trận và số mẫu/cách tính đã duyệt tại mục [9.9.2](#992-ma-trận-trình-duyệt-và-giới-hạn-đo-safari)–[9.9.3](#993-số-mẫu-và-cách-tính-p75-web);
hồ sơ mạng/cache/CPU/viewport, công cụ và kịch bản chi tiết còn cần chốt riêng.
[Chrome DevTools — Observe Core Web Vitals live](https://developer.chrome.com/docs/devtools/performance/overview#observe-core-web-vitals-live)
là căn cứ khả thi cho đo cục bộ, gồm INP khi có tương tác. Đây chưa phải lựa chọn công cụ của dự án,
không chứng minh phép đo trên Chrome thay được dữ liệu Safari/iPhone hoặc field.

### 9.9.2. Ma trận trình duyệt và giới hạn đo Safari

**Ma trận và giới hạn bằng chứng: Đã duyệt ngày 2026-11-20.** Chủ sản phẩm trả lời “tôi đồng ý”
cho hai cấu hình Chrome desktop/mobile mô phỏng đo đủ LCP/INP/CLS, Safari trên iPhone 11 Pro Max
kiểm các hành trình thực và chỉ số có hỗ trợ, Edge trên Windows kiểm tương thích/tác vụ chính.
Cho phép khoảng trống bằng chứng định lượng Safari do công cụ/API ở mốc portfolio đầu, nhưng phải ghi
“chưa đủ bằng chứng”, không coi đạt hoặc dùng Chrome mô phỏng thay kết quả Safari thật.
Chi tiết hồ sơ, lấy mẫu và kiểm chứng bên dưới là đề xuất cụ thể hóa.

| Môi trường đã duyệt | Bằng chứng cần có cho hai app Web |
|---|---|
| Chrome trên Windows — cấu hình desktop | Bộ đo lab đủ LCP/INP/CLS theo các hành trình/phiên bản/hồ sơ được chốt; là nhóm chuẩn định lượng trên desktop. |
| Chrome trên Windows — cấu hình mobile mô phỏng | Bộ đo lab đủ ba chỉ số với viewport, tương tác, CPU/mạng mô phỏng được công bố. Nhãn kết quả phải là mobile mô phỏng trên máy tính, không phải số đo Safari/iPhone hoặc Android thật. |
| Safari trên iPhone 11 Pro Max thật | Kiểm hiển thị/thao tác/các hành trình bắt buộc và ghi iOS/Safari; thu thêm chỉ số định lượng nào có phương pháp/API hỗ trợ. Không có chỉ số thì ghi thiếu bằng chứng, không điền 0 hoặc coi đạt. |
| Edge trên Windows | Kiểm tương thích hiển thị/tác vụ chính; nếu đo thêm ba chỉ số phải báo thành nhóm Edge riêng, không gộp với Chrome. Không bắt buộc nhân đôi toàn bộ bộ mẫu hiệu năng trong phương án này. |

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Cần đo đủ ba chỉ số trong lab và kiểm Web thực trên điện thoại sẵn có, trong khi API đo khác nhau giữa các engine/phiên bản. |
| Phạm vi đã duyệt | Mốc portfolio đầu dùng hai cấu hình Chrome ở trên cho nghiệm thu định lượng ba chỉ số; Safari máy thật và Edge có kiểm tương thích bắt buộc. Cho phép bằng chứng định lượng Safari còn thiếu do công cụ/API ở mốc đầu, nhưng phải công bố từng chỉ số/phiên bản và chưa kết luận đạt cho phần đó. Phạm vi này đã được duyệt riêng, không suy từ phê duyệt lab trước. |
| Chỉ số và ngưỡng | Chrome từng nhóm vẫn đủ LCP ≤ 2,5 giây, INP ≤ 200 ms, CLS ≤ 0,1 ở p75 trong mẫu lab đã định. Safari/Edge không có tác vụ bắt buộc bị chặn trong bộ kiểm; lỗi hiển thị/nhập liệu/chọn ghế/thanh toán-xem vé hoặc vận hành phải được ghi và xử lý, không dùng điểm Chrome bù lỗi trên máy thật. Phạm vi hành trình theo mục [9.9](#99-nfr-perf-01---hiệu-năng-trải-nghiệm-web), không phát sinh quyền mới. |
| Điều kiện đo | Ghi browser/phiên bản, máy/OS, viewport/zoom, mạng/cache/CPU, dữ liệu/phiên/backend và công cụ. Xác nhận khả năng thu từng metric trước khi chạy; iOS của máy sẵn có chưa được cung cấp. Không giả định đổi sang Chrome trên iPhone sẽ có đủ API như Chrome Windows hoặc phải cập nhật iOS/mua máy từ quyết định này. |
| Mức ưu tiên | Đề xuất bắt buộc hoàn tất bộ đo Chrome và kiểm tương thích trong ma trận để nghiệm thu Web mốc đầu. Khoảng trống Safari phải nằm trong báo cáo và phạm vi được duyệt. |
| Cách nghiệm thu | Đối chiếu ma trận và kết quả từng app/hành trình; có dữ liệu hợp lệ cho đủ ba chỉ số ở từng cấu hình Chrome. Kịch bản Safari/Edge đúng chức năng, ghi lỗi và bằng chứng màn hình/thao tác theo chuẩn UI. Chỉ số Safari không thu được có lý do hỗ trợ API/công cụ và trạng thái chưa đánh giá, không thay bằng cảm nhận nhanh hoặc kết quả mô phỏng. |
| Còn cần chốt | Phiên bản iOS/browser, URL/kịch bản và công cụ. Số mẫu, cache và cấu hình Chrome theo mục [9.9.3](#993-số-mẫu-và-cách-tính-p75-web)–[9.9.5](#995-hai-hồ-sơ-viewportcpumạng-cho-bộ-đo-web). Không thu hẹp phạm vi native iOS/Android hoặc coi ma trận này là cam kết hỗ trợ mọi phiên bản trình duyệt. |

Căn cứ đã đối chiếu qua Context7 và nguồn chính thức: [Chrome DevTools](https://developer.chrome.com/docs/devtools/performance/overview#observe-core-web-vitals-live),
[Edge DevTools](https://learn.microsoft.com/en-us/microsoft-edge/devtools/performance/overview#local-metrics-for-page-interactions),
[WebKit — Safari 26.2 Performance API](https://webkit.org/blog/17640/webkit-features-for-safari-26-2/#performance-api)
và [GoogleChrome/web-vitals — Browser Support](https://github.com/GoogleChrome/web-vitals#browser-support).
WebKit ghi bổ sung LCP/Event Timing từ Safari 26.2; tài liệu web-vitals được tra tại thời điểm thiết kế
vẫn giới hạn `onCLS` ở Chromium. Phải kiểm lại hỗ trợ thực tế và adapter/phiên bản khi đo, không dùng
mốc tài liệu này để tự xác nhận iPhone hiện có thu đủ ba chỉ số. Phương án Chrome mô phỏng + Safari thực
là lựa chọn phạm vi của dự án đã được duyệt, không phải kết luận hiệu năng tương đương giữa chúng.

### 9.9.3. Số mẫu và cách tính p75 Web

**Số mẫu và cách tính: Đã duyệt ngày 2026-11-20.** Chủ sản phẩm trả lời “tôi đồng ý” cho 20 lượt
mỗi trang/kịch bản trên từng cấu hình Chrome, mỗi lượt thu cả ba chỉ số, p75 của từng chỉ số lấy giá trị
thứ 15 sau sắp tăng dần, giữ lượt lỗi/thiếu dữ liệu trong báo cáo và không chọn riêng lượt đẹp.
Chi tiết hồ sơ/tổ chức lượt đo và kiểm chứng bên dưới là đề xuất cụ thể hóa.
Áp dụng bộ đo lab trên hai cấu hình Chrome tại mục [9.9.2](#992-ma-trận-trình-duyệt-và-giới-hạn-đo-safari); không tự áp cho Safari/Edge hoặc native.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Đo lặp một trang/kịch bản tương tác trong điều kiện cố định để so ba chỉ số với mục tiêu lab; tránh lấy một lượt đẹp hoặc trộn các hành trình để kết luận. |
| Số mẫu đã duyệt | 20 lượt cho mỗi nhóm app × trang/kịch bản × hồ sơ đo. Desktop và mobile mô phỏng là hai nhóm riêng; hồ sơ khác browser/build/mạng/cache/CPU không trộn vào cùng nhóm. Một lượt thu cả LCP/INP/CLS, không phải 20 lượt tổng cho cả hai app hoặc chỉ chọn 20 lượt tốt từ tập đã chạy. |
| Định nghĩa một lượt | Bắt đầu bằng tải trang theo trạng thái phiên/cache/dữ liệu đã định, thực hiện chuỗi tương tác cố định để có INP và theo dõi CLS, kết thúc ở mốc đã định để chốt chỉ số của lượt. URL, thao tác, dữ liệu và điểm kết thúc phải ghi trước chạy; không so trùng câu trả lời model hoặc dùng thời gian AI hoàn tất thay INP. |
| Cách tính và ngưỡng đã duyệt | Tính riêng từng chỉ số bằng nearest rank: sắp 20 giá trị tăng dần, p75 là giá trị thứ 15, tương ứng vị trí làm tròn lên của 0,75 × N. Mỗi nhóm phải đạt đủ LCP ≤ 2,5 giây, INP ≤ 200 ms, CLS ≤ 0,1 tại p75. Không gộp desktop/mobile, trang hoặc app để bù nhau. |
| Lỗi và dữ liệu thiếu | Giữ mọi lượt đã định trong báo cáo; lỗi trả nhanh không thành lượt đạt. Thiếu chỉ số hợp lệ, gồm không có tương tác hoặc công cụ/API không ghi được, phải ghi lý do và chưa đủ bằng chứng cho nhóm bị ảnh hưởng; không điền 0, bỏ lượt sau khi thấy kết quả hoặc chỉ tính p75 trên phần thuận lợi rồi coi đủ 20. Quy tắc hiệu lực lượt đo phải chốt trước chạy. |
| Mức ưu tiên | Đề xuất bắt buộc chốt bộ mẫu/cách tính trước nghiệm thu lab Web mốc đầu. |
| Cách nghiệm thu | Có đủ 20 lượt đã định, kết quả ba chỉ số/lượt, trạng thái đúng-sai/lỗi và hồ sơ đo của từng nhóm; tính lại p75 từ dữ liệu thô và đối chiếu đủ ba ngưỡng. Nhóm thiếu dữ liệu không tự coi đạt; lỗi chức năng/an toàn vẫn kiểm độc lập, mục tiêu p75 không cấp thêm ngân sách lỗi đó. Không chọn đợt tốt nhất để giấu đợt không đạt. |
| Căn cứ và đánh đổi | 20 mẫu có bước tỷ lệ quan sát 5 điểm phần trăm; p75 lấy mốc 15/20, còn 5 quan sát phía trên. Đây là mức lấy mẫu lab đã được chọn để cân bằng công sức khi có nhiều trang/cấu hình, không phải số tối thiểu ngành hoặc bảo đảm thống kê. Phương án 100 lượt/nhóm cho nhiều quan sát hơn và bước 1 điểm phần trăm, đổi lại nhiều lượt đo hơn; chưa được chọn. Không suy 20 mẫu p75 có độ tin cậy tương đương 100 mẫu p95 native. |

Phương pháp tham khảo NIST đã dẫn tại mục [9.10.3](#9103-số-mẫu-và-cách-tính-phân-vị-mobile): phải khai báo cách tính phân vị và phân biệt mẫu với
tổng thể. NIST không quy định dự án dùng 20 lượt. Chưa có ước lượng thời gian chạy hoặc kết quả Web;
lựa chọn này không cho phép cài công cụ/chạy script/thu dữ liệu thật từ giai đoạn thiết kế.

### 9.9.4. Trạng thái cache cho bộ đo Web chuẩn

**Phương án A: Đã duyệt ngày 2026-11-20.** Chủ sản phẩm trả lời “tôi đồng ý” cho 20 lượt chuẩn
mỗi nhóm bắt đầu bằng cache tài nguyên trình duyệt lạnh, cache vận hành bình thường trong lượt,
giữ phiên đăng nhập hợp lệ và đo cache ấm như phần bổ sung riêng, không bù kết quả chuẩn không đạt.
Chi tiết hồ sơ/thao tác chuẩn bị và kiểm chứng bên dưới là đề xuất cụ thể hóa.
Áp dụng các nhóm Chrome định lượng tại mục [9.9.2](#992-ma-trận-trình-duyệt-và-giới-hạn-đo-safari), không thay cache ứng dụng/backend hoặc điều kiện native.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Người dùng tải trang khi trình duyệt chưa có tài nguyên HTTP đã lưu của trang; cần kiểm đường tải không hưởng tài nguyên từ lượt trước và so các lượt trong cùng điều kiện. |
| Phương án A đã duyệt | Bộ chuẩn gồm 20 lượt/nhóm, mỗi lượt bắt đầu với cache tài nguyên HTTP trình duyệt lạnh, sau đó cho cache hoạt động bình thường trong lượt. Giữ phiên đăng nhập hợp lệ đã chuẩn bị cho trang cần quyền; không đồng nhất cache lạnh với khách mới/chưa đăng nhập. Warm cache là phép đo bổ sung báo riêng, không bắt buộc thêm bộ 20 và không bù kết quả lạnh không đạt. |
| Phạm vi cache và trạng thái | Chỉ xác định trạng thái cache tài nguyên HTTP ở browser. Không yêu cầu xóa cookie/phiên, DB, hold hoặc flush backend/CDN; ghi trạng thái cache server/CDN đã biết và phần không kiểm soát. Nếu có service worker/Cache Storage, ghi và chuẩn bị để nhãn cache của phép thử đúng thực tế; không suy xóa HTTP cache đồng nghĩa xóa mọi lớp. Không cấp quyền thao tác dữ liệu/cache thật từ việc thiết kế. |
| Chỉ số và ngưỡng | Giữ đủ LCP ≤ 2,5 giây, INP ≤ 200 ms, CLS ≤ 0,1 tại p75 trong từng nhóm 20 lượt cache lạnh. Desktop/mobile mô phỏng, app/trang/kịch bản/hồ sơ xét riêng. Không trộn lượt cache ấm/lạnh, không hạ ngưỡng hoặc đổi trạng thái cache sau khi thấy số liệu. |
| Điều kiện đo | Ghi build/browser/hồ sơ mạng-CPU-viewport, dữ liệu và phiên/vai trò, cách đưa cache về trạng thái ban đầu và bằng chứng request tương ứng; cố định thao tác trước mỗi lượt. Xác nhận đủ tương tác và điểm kết thúc để thu cả ba chỉ số. Chưa chọn công cụ/cấu hình cụ thể; không coi tắt cache suốt kịch bản tương đương chỉ bắt đầu lượt lạnh. |
| Mức ưu tiên | Đề xuất điều kiện bắt buộc của bộ đo chuẩn cho mốc đầu. Không bắt thêm đo warm cache như điều kiện nghiệm thu từ phương án A. |
| Cách nghiệm thu | Báo cáo xác định được từng lượt/nhóm ở trạng thái lạnh đúng định nghĩa, có đủ số mẫu/chỉ số và tính p75 theo mục [9.9.3](#993-số-mẫu-và-cách-tính-p75-web). Giữ lỗi/thiếu dữ liệu và kết quả ấm nếu có theo nhóm riêng. Không thay cookie bằng định danh giả để tránh đăng nhập/MFA, không reset TTL hoặc làm thay trạng thái Core khi chuẩn bị cache. |
| Đánh đổi và phương án B | A đã chọn ưu tiên đường tải chưa có tài nguyên lưu sẵn, giữ bộ mẫu mốc đầu gọn; chưa định lượng bắt buộc đường quay lại. B yêu cầu 20 lượt lạnh + 20 lượt ấm mỗi nhóm, cả hai đạt riêng đã cân nhắc nhưng không chọn; tăng bao phủ và gấp đôi số lượt theo hai trạng thái này, cần thêm quy trình làm ấm. |

Căn cứ: [Chrome Network reference — Disable cache](https://developer.chrome.com/docs/devtools/network/reference#disable-cache)
giải thích kiểm tải không hưởng browser cache; [Inspect network activity](https://developer.chrome.com/docs/devtools/network/)
mô tả Empty Cache And Hard Reload. Các thao tác này là nguồn tham khảo, chưa chọn thay cho protocol cụ thể
“lạnh ở đầu lượt, cache bình thường trong lượt”. [MDN — Types of caches](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching#types_of_caches)
phân biệt cache riêng của browser và cache dùng chung; [Chrome — Service workers](https://developer.chrome.com/docs/devtools/progressive-web-apps#service-workers)
cho thấy việc điều khiển service worker là phạm vi riêng. Nguồn không quy định chọn A/B hoặc 20 lượt cho dự án.

### 9.9.5. Hai hồ sơ viewport/CPU/mạng cho bộ đo Web

**Gói A: Đã duyệt ngày 2026-11-20.** Chủ sản phẩm chọn
“A — Hai cấu hình đã đề xuất (khuyến nghị)” trong câu hỏi chốt điều kiện đo Web: desktop WiFi/CPU
không làm chậm; mobile mô phỏng dùng CPU tầm trung hiệu chuẩn và Slow 4G, với hai mốc viewport trong bảng.
Giữ 20 lượt/cache lạnh và ba ngưỡng p75. Chi tiết metadata/thao tác kiểm chứng bên dưới là đề xuất
cụ thể hóa; không thay bài đo native hoặc khoảng trống định lượng Safari.

**Làm rõ sau yêu cầu bố cục ngày 2026-11-20:** 1440×900 và 414×896 là hai mốc đo đã chọn,
không phải kích thước cố định hoặc hai kích thước duy nhất giao diện phải hỗ trợ. Yêu cầu co giãn,
tận dụng không gian và giữ đầy đủ nội dung/chức năng được ghi tại mục [9.13.1](accessibility.md#9131-bố-cục-web-co-giãn-và-giữ-đầy-đủ-nội-dung).
Gói điều kiện đo được duyệt riêng qua lựa chọn A ở trên; phê duyệt đó không khóa kích thước giao diện.

| Hồ sơ đã duyệt | Viewport và tương tác | CPU | Mạng |
|---|---|---|---|
| Desktop Chrome/Windows | 1440×900 CSS px, zoom 100%, bàn phím/con trỏ; ghi DPR thực tế và giữ cố định trong bộ đo | No throttling, ghi máy/CPU/OS và điều kiện nguồn điện | WiFi được mô tả, không thêm throttling bằng DevTools; ghi đường tới backend, VPN/proxy và chất lượng quan sát |
| Mobile mô phỏng trên Chrome/Windows | 414×896 CSS px, DPR 3, dọc, mobile/touch, zoom 100%; ghi user-agent thực dùng | Preset **Mid-tier mobile device** sau hiệu chuẩn trên chính máy đo; ghi hệ số thực tế và giữ trong bộ đo | Preset **Slow 4G** của phiên bản Chrome/DevTools đã ghi nhận; lưu thông số/đơn vị thực tế trước chạy |

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Định lượng Web ở một cấu hình desktop và một cấu hình mobile mô phỏng có tài nguyên/mạng hạn chế hơn; không lấy máy phát triển mạnh làm đại diện cho điện thoại. |
| Căn cứ viewport | 1440×900 là lựa chọn lab của dự án đã duyệt; DESIGN có page max-width 1440px nhưng không quy định chiều cao/viewport này. 414×896/DPR 3 có hồ sơ tham khảo iPhone 11 Pro Max trong catalog chính thức Puppeteer; dùng như cấu hình Chrome mô phỏng, không xác nhận viewport Safari/iOS hiện có hoặc buộc chọn Puppeteer. Không sao chép UA iOS cũ từ catalog rồi coi là OS đang dùng. |
| Căn cứ CPU/mạng | Chrome có CPU preset hiệu chuẩn theo máy; hệ số không mặc định 4× và không mô phỏng chính xác CPU iPhone. Slow 4G là preset có hệ số hiệu chỉnh nội bộ; lưu phiên bản, thông số nominal và applied nếu công cụ cung cấp, không nhập RTT nominal vào tham số latency raw rồi coi tương đương preset. No throttling không có nghĩa WiFi/Internet không bị giới hạn thực tế. |
| Chỉ số và ngưỡng | Mỗi hồ sơ/trang/kịch bản riêng vẫn đủ LCP ≤ 2,5 giây, INP ≤ 200 ms, CLS ≤ 0,1 ở p75 của 20 lượt. Không gộp hai hồ sơ hoặc tự đổi CPU/mạng/viewport sau khi thấy nhóm không đạt. Kết quả ghi đúng desktop lab hoặc mobile mô phỏng; không suy thành số đo Safari/iPhone hoặc mọi mạng 4G. |
| Điều kiện đo | Ghi Chrome/DevTools version, OS/CPU/RAM máy đo, viewport CSS thực tế (không lấy kích thước cửa sổ ngoài), DPR/zoom/mobile-touch/UA, preset và hệ số CPU sau calibration, preset/thông số mạng, điều kiện nguồn điện, build/backend/dữ liệu/phiên/cache. Hiệu chuẩn/chốt hồ sơ trước bộ đo và giữ cố định; nếu đổi máy/phiên bản/thông số thì báo như hồ sơ/đợt khác. |
| Mức ưu tiên | Đề xuất bắt buộc có hai hồ sơ và metadata tái lập cho nghiệm thu lab Web mốc đầu. |
| Cách nghiệm thu | Đối chiếu ảnh/cấu hình hoặc bản ghi metadata của công cụ với hồ sơ đã chốt, kết quả 20 lượt và dữ liệu ba chỉ số mỗi nhóm. Không có preset/calibration hoặc không xác định được thông số thì ghi chưa đủ điều kiện đo, không tự thay bằng preset dễ hơn. Các lỗi chức năng/quyền/Core vẫn xét riêng, không sửa thời gian hoặc loại lượt để đạt. |
| Còn cần cụ thể hóa | Máy/Chrome version và hệ số calibration thực tế, snapshot cấu hình Slow 4G, dữ liệu/URL/chuỗi thao tác, cách thu/finalize chỉ số và công cụ tự động nếu có. Chỉ thiết kế hồ sơ, chưa cho phép calibration, cài đặt, thay cấu hình hệ thống hoặc chạy ứng dụng. |

Căn cứ: [Chrome — Calibrate CPU throttling presets](https://developer.chrome.com/docs/devtools/settings/throttling#calibrate-cpu-throttling-presets),
[Chrome — Real-world performance calibration](https://developer.chrome.com/blog/devtools-grounded-real-world),
[CPU throttling reference](https://developer.chrome.com/docs/devtools/performance/reference#cpu-throttle),
[Device Mode limitations](https://developer.chrome.com/docs/devtools/device-mode#limitations),
[DevTools NetworkManager source](https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/core/sdk/NetworkManager.ts)
và [Puppeteer device catalog](https://github.com/puppeteer/puppeteer/blob/main/packages/puppeteer-core/src/common/Device.ts).
Các nguồn xác lập khả năng/giới hạn công cụ và hồ sơ tham khảo; lựa chọn hai hồ sơ làm điều kiện nghiệm thu
là quyết định của dự án đã duyệt, không phải máy đo/điện thoại đã được kiểm chứng hoặc yêu cầu mua/thuê hạ tầng.

### 9.9.6. Dự thảo kịch bản nghiệm thu Web theo hành trình

**Trạng thái: Đề xuất cụ thể hóa, chưa duyệt toàn bộ thao tác/dữ liệu/điểm kết thúc.** Phạm vi hành trình
ở mục [9.9](#99-nfr-perf-01---hiệu-năng-trải-nghiệm-web) đã duyệt; chín kịch bản dưới đây tổ chức phạm vi đó thành các nhóm đại diện để đo và kiểm.
Đây không phải bộ nghiệm thu chức năng đầy đủ hoặc xác nhận màn hình/URL đã triển khai.

| Mã và hành trình | Điều kiện trước | Thao tác trong lượt đề xuất | Kết quả cần đối chiếu |
|---|---|---|---|
| WEB-C01 — Khám phá phim | Khách chưa đăng nhập; phim/suất đã công bố và dữ liệu có kết quả mong đợi cho bộ lọc. | Tải trang khám phá, nhập/lọc điều kiện, đọc danh sách rồi chọn một phim hoặc suất hợp lệ. | Nội dung/bộ lọc/kết quả đúng nguồn, có phản hồi tương tác; chưa tạo hold. Trạng thái không kết quả/lỗi không bị đổi thành danh sách thành công giả. |
| WEB-C02 — Chi tiết phim và suất | Phim đã công bố; lịch/giá/dữ liệu liên quan có phiên bản và kỳ vọng đã xác định. | Tải màn hình chi tiết, mở phần thông tin/lịch chiếu và chọn suất. | Thông tin/lịch/giá khớp nguồn; chọn suất chưa phải giữ ghế. Tính sẵn có khi giao dịch vẫn kiểm lại qua nguồn có thẩm quyền. |
| WEB-C03 — Chọn ghế và hold | Khách có phiên hợp lệ/email xác minh, đúng quyền, không chờ đóng hoặc có hold khác còn hiệu lực; suất/ghế nhận được hold. | Tải sơ đồ, chọn/bỏ chọn ghế và xác nhận danh sách hợp lệ theo kịch bản. | App/BFF gửi lệnh theo xác nhận của khách; Core giữ tất cả hoặc không giữ, đúng ghế và hạn gốc 300 giây; không xác nhận đã mua vé. Giữ giới hạn 6 ghế và Sweetbox cả cặp theo nghiệp vụ. |
| WEB-C04 — Thanh toán và quay lại | Đúng chủ đơn/hold còn hạn, trước giờ chiếu; tổng tiền do nguồn có thẩm quyền xác định. | Tải tóm tắt/thanh toán, chọn phương thức, gửi xác nhận rồi quay lại theo phản hồi sandbox/stub đã khai báo. | UI giữ đúng đơn/tổng/trạng thái xác minh; redirect/timeout không đủ kết luận đã trả tiền hoặc thất bại. Nhánh không cần thu tiền xử lý riêng, không tạo khoản thu giả. |
| WEB-C05 — Xem đơn/vé/QR | Phiên được phép xem đúng đơn; trạng thái và vé phát hành có bằng chứng hợp lệ từ Core theo fixture. | Tải đơn/vé, mở chi tiết ghế/trạng thái và QR được phép hiển thị. | Đúng đơn/chủ/quyền ghế, trạng thái soát/hủy theo nguồn; QR chỉ hiển thị khi đủ bằng chứng phát hành. Không trả vé mẫu khi ngoài quyền/không tìm thấy. |
| WEB-C06 — Giao diện chat và thẻ tương tác | Khách đăng nhập đúng quyền cho dữ liệu riêng; hội thoại/card mẫu có schema, dữ liệu/trạng thái nghiệp vụ và kết quả mong đợi. | Tải workspace, nhập/gửi tin, quan sát trạng thái chờ và nội dung/card, thực hiện một tương tác hợp lệ trên card theo kịch bản. | UI phản hồi, không mất nội dung hoặc nhảy bố cục ngoài chuẩn; card không cấp Agent quyền giao dịch. Nguồn đầu ra mẫu phát lại cho riêng bài đo UI đã duyệt bên dưới, không chứng minh chất lượng/độ trễ model thật. |
| WEB-O01 — Quản lý lịch chiếu | Phiên đã qua MFA, actor/phạm vi rạp đúng quyền; phim/phòng và khung giờ hợp lệ, trạng thái cho phép thay đổi. | Tải lịch, lọc/chọn phòng-ngày, mở form, nhập và lưu/công bố một thay đổi hợp lệ. | Dữ liệu lưu/hiển thị đúng phạm vi và quy tắc lịch, gồm khoảng đệm/xung đột theo nguồn nghiệp vụ. Không sửa các thành phần bị khóa vì hold/vé hiện có hoặc tự chuyển khách. |
| WEB-O02 — Xét hủy/theo dõi hoàn | Phiên MFA và quyền xử lý đúng rạp; hồ sơ yêu cầu, ghế/đơn và trạng thái tiền có dữ liệu mong đợi. | Tải danh sách, mở hồ sơ, thực hiện quyết định hợp lệ trên dữ liệu thử theo quyền và xem trạng thái liên quan. | Phân biệt gửi yêu cầu/duyệt/nghĩa vụ hoàn/đã chuyển tiền; kết quả và tác dụng phụ đúng nguồn. Không ghi hoàn tay hoặc hứa thời điểm tiền về từ phản hồi UI; mode cổng giả lập không là bằng chứng hoàn tiền thật. |
| WEB-O03 — Báo cáo | Actor có quyền đúng phạm vi, dữ liệu tổng hợp/độ trễ cập nhật và số liệu kỳ vọng đã xác định. | Tải báo cáo, đổi bộ lọc ngày/rạp/phim/suất trong phạm vi và đọc kết quả. | Tổng hợp/phạm vi đúng công thức đã chốt; không thêm KPI mới, trả danh sách đơn/PII hoặc dùng báo cáo xác nhận giao dịch tiền. Không tự bổ sung xuất file từ kịch bản đo này. |

Các ca giao dịch đo bằng dữ liệu thử và phụ thuộc được khai báo; không phát sinh gọi cổng tiền thật,
gửi email hàng loạt hoặc gọi model hàng loạt từ việc ghi thiết kế này. Mã actor/quyền theo mô hình sản phẩm,
không coi ba enum hiện có ánh xạ đủ quyền. URL thực tế, selector hoặc hợp đồng tool/API phải đối chiếu
khi có implementation; không tự gán route cho Organizer scaffold.

| Nội dung chung cần nghiệm thu | Quy tắc/thiết kế đề xuất |
|---|---|
| Cỡ mẫu và cấu hình | Kế thừa 20 lượt/nhóm, nearest-rank p75, cache lạnh và hai hồ sơ Chrome đã duyệt. Một nhóm chỉ có một app/trang-kịch bản/hồ sơ/trạng thái đã định; nếu tách nhiều biến thể thành nhóm thì ghi riêng trước chạy. Không gộp để giảm số mẫu hoặc chọn đợt đẹp. |
| Chuẩn bị dữ liệu/phiên | Định danh fixture và phiên/vai trò hợp lệ trước mỗi lượt; giữ lượng/dạng dữ liệu nhất quán cho cùng nhóm. Ca ghi có đủ đối tượng hợp lệ hoặc quy trình chuẩn bị cô lập đã định trước, không lấy cạn ghế/trạng thái đã xử lý làm happy path. Không xóa DB daily, đổi quyền, reset hold TTL hoặc giả danh bằng header để đạt precondition. |
| Mốc bắt đầu/kết thúc | Mỗi lượt có mốc navigation bắt đầu và điều kiện hoàn tất trên UI được ghi trước. LCP/INP/CLS theo định nghĩa từng metric; INP đo phản hồi browser, không phải toàn thời gian Core/model/cổng hoàn tất. Kết thúc lượt chỉ khi nội dung/trạng thái kỳ vọng của ca đã được kiểm hoặc lỗi đã ghi trung thực; loading nhanh không thay xác minh nghiệp vụ. |
| Điều kiện dữ liệu | Trước đo phải khóa danh sách/mã bản ghi, số lượng/cỡ tài nguyên, trạng thái nghiệp vụ và dữ liệu kỳ vọng. Nếu fixture hoặc hợp đồng chưa đủ thì ca chưa sẵn sàng nghiệm thu, không tự chọn dữ liệu nhỏ/dễ để có điểm đẹp. Chưa chốt các con số này từ bảng kịch bản. |
| Phân loại phụ thuộc | Ghi Core/dịch vụ nghiệp vụ thật, sandbox hay mock và các tích hợp ngoài. Phép đo UI dùng mock chỉ kết luận lớp UI trong điều kiện đó, không thay kiểm luồng Core/cổng thật. Đúng đắn/quyền và khả năng tiếp cận vẫn có kết quả riêng. |
| Responsive và tương thích | Cùng hành trình kiểm Safari iPhone/Edge theo ma trận và kiểm co giãn/zoom tại mục [9.13.1](accessibility.md#9131-bố-cục-web-co-giãn-và-giữ-đầy-đủ-nội-dung). Hai mốc hiệu năng không giới hạn chiều rộng hỗ trợ; bảng/sơ đồ cần giữ đủ khả năng truy cập nội dung. Khoảng trống metric Safari vẫn công bố theo phạm vi đã duyệt. |
| Mức ưu tiên và kết luận | Phạm vi hành trình chính bắt buộc đã duyệt tại mục [9.9](#99-nfr-perf-01---hiệu-năng-trải-nghiệm-web); chi tiết các ca/fixture trong bảng này cần review. Mỗi nhóm có dữ liệu ba chỉ số, kiểm đúng trạng thái và kết luận theo ngưỡng; thiếu dữ liệu hoặc sai chức năng không tự coi đạt. |
| Bằng chứng | Giữ build/hồ sơ/dataset/phiên bản script hoặc chuỗi thao tác, thời gian và metric từng lượt, kết quả nghiệp vụ/an toàn và phần chưa kiểm. Che secrets/session/token/QR nhạy cảm theo NFR-PRIV-01; không dùng chat người truy cập công khai làm fixture hoặc báo cáo. |

**Riêng nguồn đầu ra WEB-C06 — A đã duyệt ngày 2026-11-20:** chủ sản phẩm trả lời “tôi đồng ý”
cho hội thoại/card/chuỗi sự kiện mẫu phát lại có kiểm soát chỉ dùng cho bài đo UI, giữ dữ liệu nhất quán
giữa các lượt và công bố rõ mode mẫu; bộ nghiệm thu AI thật vẫn riêng theo mục [9.8](ai-agent.md#98-nfr-ai-01---hiểu-tiếng-việt-và-giữ-đúng-yêu-cầu-qua-nhiều-lượt).
Chi tiết payload/chunk/phiên bản và cách tạo fixture bên dưới còn cần cụ thể hóa.
Định trước nội dung, schema, kích thước, thứ tự,
nhịp/chunk và phiên bản để so các lượt; công bố rõ mode dữ liệu mẫu. Không giả xác nhận Core hoặc
gọi đây là token stream/độ trễ/chất lượng của provider thật. Bộ nghiệm thu AI thật theo mục [9.8](ai-agent.md#98-nfr-ai-01---hiểu-tiếng-việt-và-giữ-đúng-yêu-cầu-qua-nhiều-lượt) vẫn
giữ riêng và phải có bằng chứng provider thật khi được phép chạy.
Phương án B dùng provider thật cho mọi lượt UI đã cân nhắc nhưng không chọn cho bộ đo này:
sát đường tích hợp hơn nhưng kết quả chịu biến động provider/quota/nội dung. A đã duyệt riêng,
chưa chốt payload/card cụ thể hoặc tạo cơ chế phát lại. Quy tắc giao dịch trên card vẫn giữ ranh giới Agent đề xuất, App/BFF
thực thi lệnh sau xác nhận của khách và Core xác minh kết quả.

Nguồn nghiệp vụ đối chiếu tại main `2a007797ac9ce542d9747aad0f44f3e430eec581`:
`docs/03-product/use-case-descriptions.md` (D-01, B-01/B-02/B-05/B-06/B-07, C-01, M-04, R-02/R-03/R-04, M-07),
`docs/03-product/use-cases.md` (actor/phạm vi, BR-35 và Q155–Q161), PRODUCT của hai app Web và
`docs/05-specs/004-service-decomposition/spec.md` (thẩm quyền dịch vụ/ràng buộc giao dịch).
Bảng này tổ chức nghiệm thu NFR, không thay chủ sở hữu quy tắc nghiệp vụ hoặc chứng minh đã có runtime.

## 9.10. NFR-PERF-02 - Hiệu năng hai app Mobile cài riêng

**Phạm vi và mức ưu tiên: Đã duyệt.** Sau khi hỏi “tại sao không đo cho cả ở mobile?” ngày 2026-11-17,
chủ sản phẩm trả lời “tôi đồng ý” cho đề xuất đo bắt buộc cả bốn app và các hành trình chính,
gồm các hành trình Mobile liệt kê bên dưới. Mục tiêu mở app/soát, mạng chuẩn và số mẫu đã được duyệt
ở từng mục bên dưới; điều kiện/cấu hình hoặc chỉ số còn mở không tự được coi là đã duyệt.
Customer Mobile và Organizer Mobile nhắm iOS/Android theo PRODUCT; kết quả Web không thay bằng chứng native.

**Ràng buộc thiết bị đã ghi nhận:** ngày 2026-11-17, chủ sản phẩm cho biết không có điện thoại Android thật.
Đề xuất trước đó đo trên ít nhất một Android và một iPhone thật được thay bằng phương án điều chỉnh dưới đây;
không mặc định phải mua máy.
**Phương án điều chỉnh đã duyệt:** cùng ngày, chủ sản phẩm trả lời “tôi đồng ý” cho phép mốc demo
chấp nhận khoảng trống “hiệu năng Android trên máy thật chưa kiểm chứng”, bổ sung sau.
Tiếp tục kiểm chức năng và chẩn đoán trên Android emulator;
báo riêng giới hạn camera, chuyển ứng dụng thanh toán và hiệu năng thiết bị thật chưa được kiểm chứng.
Máy iOS sẵn có đã ghi nhận là iPhone 11 Pro Max; dùng làm tham chiếu hiệu năng vẫn cần chốt
hồ sơ build/iOS/điều kiện đo như các mục bên dưới, không suy thành đã đo trên máy thật.
Phần nghiệm thu hiệu năng Android thật chuyển thành mốc bổ sung khi có thể tiếp cận thiết bị,
không biến kết quả emulator thành bằng chứng đạt native trên điện thoại thật.
Mốc demo được chấp nhận với khoảng trống bằng chứng đã công bố này; không ghi NFR hiệu năng Android thật
đã đạt. Phạm vi hỗ trợ hai hệ và bốn app đã duyệt không bị thu hẹp.

| Trường | Nội dung |
|---|---|
| Mục tiêu | Kiểm chứng tốc độ mở app, phản hồi thao tác, độ mượt và thời gian hoàn thành tác vụ trên từng app/hệ điều hành. |
| Tình huống và phạm vi bắt buộc | Customer Mobile: mở app, khám phá/chọn ghế, chat, thanh toán rồi quay về app, mở QR đã lưu khi mất mạng. Organizer Mobile: mở app/camera, quét QR, xác minh và ghi nhận quyền ghế qua Core; các màn hình quản trị chỉ đưa vào sau khi có phạm vi được duyệt. Không bổ sung soát vé ngoại tuyến. |
| Chỉ số đề xuất | Thời gian khởi động khi app chưa chạy và khi quay lại app; thời gian tới màn hình dùng được; độ trễ phản hồi thao tác và số/tỷ lệ khung hình chậm/giật theo công cụ của từng hệ. Đo riêng camera sẵn sàng, nhận diện QR và thời gian từ nhận QR tới kết quả Core được hiển thị; không lấy giải mã QR nhanh làm bằng chứng soát vé hoàn tất nhanh/đúng. |
| Ngưỡng mục tiêu | Đã duyệt ≥ 95% lần mở app thông thường dùng được trong ≤ 5 giây; từng bước tra quyền ghế sau đọc QR và ghi nhận ghế sau xác nhận đạt phân vị 95 ≤ 2 giây, đo riêng. Điều kiện cụ thể nêu bên dưới; phản hồi/khung hình/tác vụ khác còn mở. Mục tiêu 60fps hiện có giữ thẩm quyền, cần điều kiện thiết bị/tần số và cách tính khung hình chậm; không suy không rớt bất kỳ frame nào hoặc áp LCP/INP/CLS Web sang native. |
| Điều kiện đo | Đã duyệt kiểm chức năng/chẩn đoán Android trên emulator và công bố khoảng trống máy thật; WiFi chuẩn/tách bài gây lỗi tại mục [9.10.2](#9102-mạng-chuẩn-cho-đo-hiệu-năng-mobile), 100 mẫu/nhóm và nearest rank tại mục [9.10.3](#9103-số-mẫu-và-cách-tính-phân-vị-mobile). Máy sẵn có: iPhone 11 Pro Max, đề xuất làm thiết bị tham chiếu, phiên bản iOS bổ sung trước đo. Chi tiết còn đề xuất: build phát hành, hồ sơ máy/OS/tần số màn hình/mạng/cache/quyền camera, dữ liệu và tải backend. Không suy simulator/emulator thành bằng chứng máy thật; công cụ/hồ sơ chi tiết còn mở. |
| Mức ưu tiên | Đo bắt buộc các hành trình Mobile chính của mốc demo; mục tiêu mở app ≤ 5 giây cho ≥ 95% lần mở đã duyệt. Điều kiện đo chi tiết và các ngưỡng native khác còn mở; giữ ngoại lệ Android thật đã chốt. |
| Cách nghiệm thu đề xuất | Đo lặp lại từng tác vụ/hệ điều hành, giữ kết quả theo từng nhóm, phân biệt thời gian UI, camera và chờ dịch vụ. Đối chiếu dữ liệu Core, quyền từng ghế và trạng thái giao dịch sau tác vụ; phép đo nhanh không bù được kết quả sai. Chỉ kết luận đạt sau khi ngưỡng và điều kiện được duyệt, không dùng dev build hoặc browser emulation làm kết quả native. |
| Giới hạn và phần chưa chốt | Chưa chốt máy/OS tối thiểu, danh sách màn hình quản trị Mobile, công cụ/hồ sơ đo chi tiết và các ngưỡng mới; số mẫu và cách tính p95 đã duyệt tại mục [9.10.3](#9103-số-mẫu-và-cách-tính-phân-vị-mobile). Không suy yêu cầu này thành app đã được xây dựng hoặc đo trên thiết bị. |

Nguồn phạm vi: [Customer Mobile PRODUCT](../../../apps/customer-mobile/PRODUCT.md) và
[Organizer Mobile PRODUCT](../../../apps/organizer-mobile/PRODUCT.md).
Cơ sở kỹ thuật tra cứu ngày 2026-11-17: [React Native — Performance Overview](https://reactnative.dev/docs/performance)
phân biệt hiệu năng luồng JavaScript/UI, rớt khung hình và yêu cầu đánh giá hiệu năng bằng release build.
Nguồn này giải thích cách đo cho stack liên quan, không tự chọn phiên bản framework hoặc ngưỡng sản phẩm.
Nguồn nền tảng: [Android — App startup time](https://developer.android.com/topic/performance/issues/launch-time)
phân biệt thời điểm hiển thị khung hình đầu và thời điểm dùng được đầy đủ;
[Apple — Improving app responsiveness](https://developer.apple.com/documentation/xcode/improving-app-responsiveness)
phân biệt đơ tương tác và giật hình, khuyến nghị kiểm tra trên thiết bị thật.
Các nguồn này cung cấp cơ sở chọn chỉ số, không tự xác lập ngưỡng nghiệm thu của dự án.
Tra cứu bổ sung ngày 2026-11-17: [Android — Macrobenchmark](https://developer.android.com/topic/performance/benchmarking/macrobenchmark-overview#run_the_benchmark)
khuyến cáo không lấy benchmark trên emulator làm số đo đại diện trải nghiệm người dùng cuối.
Đây là căn cứ giới hạn kết luận, không chọn Macrobenchmark làm công cụ dự án hoặc yêu cầu thuê dịch vụ thiết bị.

**Thời gian mở app Mobile đã duyệt:** ngày 2026-11-17, chủ sản phẩm chọn “tôi nghĩ nên là 5s”
thay cho đề xuất 3 giây: ít nhất **95% lần mở app thông thường dùng được trong 5 giây**,
áp dụng Customer Mobile và Organizer Mobile. Đo từ yêu cầu mở app do thao tác người dùng
đến màn hình ban đầu đúng trạng thái phiên/vai trò đã định có nội dung cần thiết và nhận thao tác hợp lệ;
không dừng đo ở logo, splash, khung hình đầu hoặc skeleton chưa dùng được.
Điều kiện đề xuất: app đã cài, tiến trình chưa chạy trước lần mở, bản build phát hành, trạng thái phiên/quyền,
thiết bị/OS, mạng/cache và backend khỏe được công bố. Không gọi mọi lần mở này là cold start trên cả hai hệ;
ghi trạng thái thực vì cơ chế/cache iOS và Android khác nhau. Không gộp lần cài/mở đầu, onboarding,
thời gian người dùng nhập đăng nhập/MFA, quay lại từ nền hoặc camera sẵn sàng thành cùng một phép đo.
Giữ ngoại lệ Android thật đã duyệt: số đo emulator là bằng chứng của emulator, chưa đóng mục tiêu máy thật.
Chọn máy/OS, màn hình dùng được theo từng vai trò, bộ dữ liệu, số lượt và cách tính phân vị trước nghiệm thu.
Mốc 5 giây là lựa chọn trải nghiệm của chủ sản phẩm cho người mở demo, có thời gian dựng UI/nạp dữ liệu;
không phải ngưỡng chuẩn do Android/Apple quy định hoặc tốc độ đã đo. Phương án 3 giây đã cân nhắc nhưng
không được chọn. Mục tiêu này không thay thời gian AI phản hồi hoặc thời gian hoàn tất soát vé.
Nguồn giải thích phạm vi đo: [Android — App startup time](https://developer.android.com/topic/performance/issues/launch-time)
phân biệt khung hình đầu và app dùng được; [Apple — Reducing launch time](https://developer.apple.com/documentation/xcode/reducing-your-app-s-launch-time)
nêu màn hình đầu đã vẽ chưa chắc nội dung/thao tác đã sẵn sàng. Nguồn không xác lập mốc 5 giây cho dự án.

**Tốc độ hai bước soát vé trên Organizer Mobile đã duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời
“tôi đồng ý với đề xuất của bạn” cho mục tiêu 2 giây ở ít nhất 95% lượt của từng bước, đo riêng:

| Bước và điểm đo | Mục tiêu đã duyệt |
|---|---|
| Tra cứu sau khi đọc QR | Từ lúc app giải mã được QR tới khi hiển thị kết quả Core xác minh và thông tin/quyền ghế hiện hành: phân vị 95 ≤ 2 giây. |
| Ghi nhận ghế đã chọn | Từ khi nhân viên bấm xác nhận tập ghế cần soát tới khi Core ghi nhận và app hiển thị kết quả đúng: phân vị 95 ≤ 2 giây. |

Hai chỉ số được đo/tổng hợp riêng, gồm thời gian mạng và Core; không tự coi đọc QR là dùng hết đơn.
Không tính thời gian khách đưa mã vào camera, mở camera ban đầu, nhân viên chọn ghế/đối chiếu người hoặc giấy tờ
vào hai khoảng tự động này. Những thao tác đó giữ đúng nghiệp vụ/điều kiện xác minh, không bỏ để chạy nhanh.
Đo khi thiết bị nhân viên online, Core/phụ thuộc khỏe; công bố thiết bị, mạng, dữ liệu/phiên bản, tải và số lượt.
Từ chối đúng theo Core là kết quả hợp lệ; báo riêng kết quả chấp nhận/từ chối và lỗi hệ thống,
không bỏ lỗi/chậm khỏi báo cáo hoặc tính thông báo lỗi đơn thuần như đã soát xong.
Không công nhận thành công nếu chưa có xác nhận Core; kiểm cạnh tranh/soát lặp theo quyền từng ghế.
Mốc 2 giây được chủ sản phẩm chọn để phản hồi nhanh tại cửa rạp, không phải chuẩn ngành hoặc năng lực đã đo;
phương án 5 giây mỗi bước đã cân nhắc nhưng không được chọn.
Giữ ngoại lệ Android thật: kết quả emulator chưa chứng minh camera/hiệu năng của điện thoại thật.

### 9.10.1. Ma trận điều kiện đo Mobile cần chốt

**Trạng thái: Đề xuất cụ thể hóa; ngoại lệ Android thật đã duyệt giữ nguyên.** Ngày 2026-11-18,
chủ sản phẩm xác nhận “tôi có” khi được hỏi có iPhone thật sẵn dùng hoặc có thể mượn,
sau đó cho biết “tôi dùng iphone 11 promax”: thiết bị sẵn có là **iPhone 11 Pro Max**.
Đề xuất dùng máy này làm thiết bị tham chiếu cho hai app iOS; phiên bản iOS bổ sung trước đo,
không tự coi đây là máy/OS tối thiểu phải hỗ trợ. Chưa có số đo trên thiết bị.
Không tự cấp ngoại lệ hiệu năng iOS từ ngoại lệ Android hoặc từ việc dùng simulator cho kiểm tra
chức năng/khả năng tiếp cận. Chưa chọn máy/OS tối thiểu, mua/thuê thiết bị hoặc môi trường build.

| Hạng mục | Điều kiện và bằng chứng cần ghi |
|---|---|
| Customer/Organizer Mobile trên iOS | Kiểm riêng từng app, build phát hành và trạng thái phiên/quyền. Thiết bị sẵn có đã xác nhận: iPhone 11 Pro Max; đề xuất làm thiết bị tham chiếu, phiên bản iOS bổ sung trước đo. Hiệu năng cần số đo thiết bị thật để kết luận trong phạm vi cấu hình đó; không suy một máy đạt thành mọi iPhone/iOS đạt. |
| Customer/Organizer Mobile trên Android | Giữ ngoại lệ demo đã duyệt: emulator cho chức năng/chẩn đoán, công bố cấu hình máy host/emulator/OS và khoảng trống máy thật. Chưa công nhận hiệu năng/camera/chuyển ứng dụng trên Android thật; không loại Android khỏi phạm vi sản phẩm. |
| Trạng thái phép đo | Ghi app đã cài, tiến trình đang chạy/chưa chạy, màn hình ban đầu dùng được theo vai trò, quyền camera, cache và trạng thái đăng nhập. Tách onboarding, nhập MFA, quay từ nền, mở camera và mở app; không gọi mọi lần mở trên iOS là cold start. |
| Mạng, dữ liệu và phụ thuộc | Ghi kết nối/điều kiện mạng, dữ liệu thử, tải và phiên bản backend; phân biệt Core/provider thật, sandbox và stub. Ca QR đã lưu khi khách mất mạng khác với máy soát phải online. Giá trị mạng/cache/dataset chốt trước đo, không đổi để làm đẹp số liệu giữa đợt. |
| Mẫu và kết luận | Số mẫu 100/nhóm và nearest rank đã duyệt tại mục [9.10.3](#9103-số-mẫu-và-cách-tính-phân-vị-mobile); chi tiết tổ chức lượt đo/lỗi phải định trước khi chạy. Báo riêng app/OS/thiết bị/tác vụ và bằng chứng chức năng/hiệu năng; không gộp để che nhóm không đạt. Dùng ngưỡng 5 giây/2 giây đã duyệt đúng phạm vi, không tự tạo ngưỡng mới từ thiết bị sẵn có. |

Căn cứ: [Apple — Improving your app's performance](https://developer.apple.com/documentation/xcode/improving-your-app-s-performance#Profile-your-app)
giải thích độ trung thực của đo trên thiết bị; [Testing a release build](https://developer.apple.com/documentation/xcode/testing-a-release-build)
lưu ý điều kiện bản phát hành và ảnh hưởng môi trường/debugger. Nguồn không quyết định máy/OS cụ thể,
không xác nhận môi trường build iOS sẵn dùng. Việc có iPhone dựa trên xác nhận của chủ sản phẩm ở trên.

### 9.10.2. Mạng chuẩn cho đo hiệu năng Mobile

**Điều kiện chuẩn và cách tách nhóm: Đã duyệt ngày 2026-11-18.** Chủ sản phẩm trả lời “tôi đồng ý”
cho đo chuẩn hai app Mobile bằng WiFi ổn định, backend/phụ thuộc hoạt động; giữ ngưỡng 5 giây/2 giây,
kiểm mạng chậm/ngắt thành nhóm chủ động riêng và giữ lượt chậm/lỗi tự nhiên trong nhóm đo chuẩn.
Chi tiết hồ sơ mạng và phép đo/nghiệm thu bên dưới là đề xuất cụ thể hóa. Không thay điều kiện Web,
mục tiêu độ trễ AI hoặc tự chọn hosting/tài nguyên backend.

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống và mục tiêu | Đo lần mở app thông thường và các bước xác minh/ghi nhận soát vé trong điều kiện mạng được công bố; kiểm riêng hành vi khi mạng chậm/ngắt để tránh lẫn điều kiện đạt hiệu năng với bài gây lỗi. |
| Điều kiện chuẩn đã duyệt và hồ sơ đề xuất | Dùng WiFi ổn định cho lần đo chuẩn, backend/phụ thuộc cần thiết hoạt động. Chi tiết đề xuất: ghi thiết bị/iOS hoặc cấu hình emulator, kết nối tới backend qua LAN hay Internet, vị trí môi trường thử, VPN/proxy/throttling nếu có, độ trễ/băng thông/mất gói quan sát và thời gian đo. WiFi tự nó không bảo đảm độ trễ hoặc tính tái lập; chốt hồ sơ mạng cụ thể trước chạy, báo sai lệch giữa đợt. |
| Chỉ số và ngưỡng | Giữ ≥ 95% lần mở app dùng được ≤ 5 giây và p95 ≤ 2 giây cho từng bước soát đã duyệt, đúng điểm bắt đầu/kết thúc tại mục [9.10](#910-nfr-perf-02---hiệu-năng-hai-app-mobile-cài-riêng). Không tự giảm ngưỡng cho máy sẵn có hoặc đổi sang đo server-only. Chưa chọn giá trị định lượng của hồ sơ mạng; không công bố mục tiêu đạt trên mọi WiFi/4G/5G. |
| Bài mạng chậm/ngắt riêng | Kiểm trạng thái chờ/lỗi và phục hồi trung thực. Customer Mobile mở được QR đã lưu theo quyền/phạm vi đã chốt khi khách offline; máy soát phải online để xác minh và ghi nhận Core. Không tự báo đã soát/thanh toán thành công khi mất phản hồi; nối lại thì tra cứu trạng thái, giữ TTL gốc và chống lặp. Không ép các bài gây lỗi chủ động đạt ngưỡng của nhóm mạng khỏe. |
| Lấy mẫu và báo cáo | Nhóm mạng chuẩn vẫn giữ lượt chậm/lỗi phát sinh tự nhiên trong kết quả và áp quy tắc lỗi/phân vị được chốt trước đo; không chuyển chúng sang nhóm gây lỗi sau khi thấy số liệu. Nhóm gây lỗi chủ động có kịch bản/nhãn trước chạy, báo riêng kết quả đúng đắn và phần chưa kiểm. |
| Mức ưu tiên | Đề xuất điều kiện bắt buộc cho nghiệm thu hiệu năng Mobile tương ứng; giữ ngoại lệ Android thật đã duyệt. |
| Cách nghiệm thu | Hồ sơ phép đo nêu rõ nhóm mạng/thiết bị/build/dữ liệu/phụ thuộc và kết quả từng app/tác vụ. Nhóm chuẩn đối chiếu ngưỡng thời gian; nhóm gây lỗi đối chiếu trạng thái Core/không phát sinh giao dịch hoặc check-in trùng. Không gộp nhóm/đổi điều kiện hoặc bỏ lượt lỗi để có kết luận đạt. |
| Giới hạn kết luận | WiFi là phạm vi đo cho portfolio đã được duyệt, không phải ngưỡng do Apple/Android quy định. Cấu hình mạng cụ thể và công cụ vẫn cần chốt; số mẫu/cách tính đã duyệt tại mục [9.10.3](#9103-số-mẫu-và-cách-tính-phân-vị-mobile). Có iPhone không tự chứng minh môi trường build/backend hoặc kết quả đo đã sẵn sàng. |

### 9.10.3. Số mẫu và cách tính phân vị Mobile

**Số mẫu và cách tính: Đã duyệt ngày 2026-11-18.** Chủ sản phẩm trả lời “tôi đồng ý” cho 100 lượt
mỗi nhóm trong bảng, p95 lấy giá trị thứ 95 sau sắp tăng dần, giữ lượt lỗi/không hoàn tất là không đạt
và không gộp các nhóm để bù nhau. Chi tiết hồ sơ, tổ chức phép đo/nghiệm thu còn là đề xuất cụ thể hóa.
Không đổi mục tiêu chất lượng hoặc tự cấp quyền chạy kiểm thử. Áp dụng bộ đo chuẩn trên thiết bị
tham chiếu iOS khi ma trận/build/iOS/hồ sơ mạng được chốt; không dùng mẫu emulator thay ngoại lệ Android thật.

| Nhóm phép đo riêng | Số mẫu đã duyệt cho một cấu hình/đợt | Mục tiêu đã duyệt |
|---|---|---|
| Mở Customer Mobile thông thường | 100 lần mở đúng trạng thái ban đầu đã định | ≥ 95% dùng được trong ≤ 5 giây |
| Mở Organizer Mobile thông thường | 100 lần mở đúng trạng thái phiên/vai trò đã định | ≥ 95% dùng được trong ≤ 5 giây |
| QR đã giải mã → hiển thị quyền ghế Core xác minh | 100 lượt hợp lệ | p95 ≤ 2 giây |
| Nhân viên xác nhận ghế → Core ghi nhận và app hiển thị đúng | 100 lượt hợp lệ | p95 ≤ 2 giây |

Hai chỉ số soát có thể lấy từ cùng 100 hành trình hợp lệ nếu giữ được hai mốc thời gian riêng;
tổng là 400 quan sát chỉ số, không bắt buộc 400 hành trình người dùng độc lập.

| Trường | Nội dung đề xuất |
|---|---|
| Mục tiêu và tình huống | Kết luận đạt/không đạt từ nhiều lần mở app và soát vé có điều kiện tái lập, không từ một lần chạy nhanh. |
| Cách tính đã duyệt | Dùng phân vị thực nghiệm kiểu nearest rank: sắp thời gian tăng dần, lấy vị trí làm tròn lên của 0,95 × N. Với N = 100, p95 là giá trị thứ 95; báo kèm số lượt hoàn thành đúng và trong ngưỡng trên tổng 100, không chỉ p95. Đây là phương pháp dự án chọn, không giả định công cụ nào cũng mặc định tính như vậy. |
| Lượt lỗi/không hoàn tất | Giữ trong mẫu số và đánh dấu không đạt thời gian; không coi lỗi trả nhanh là hoàn thành. Khi tính p95 cho toàn bộ mẫu, lượt không có kết quả đúng dùng được được xếp sau mọi thời gian hoàn thành hợp lệ và giữ riêng mã/lý do lỗi. Không diễn giải mục tiêu 95% thành cho phép 5% lỗi chức năng hoặc vi phạm an toàn; các yêu cầu đúng đắn/an toàn vẫn xét riêng. |
| Điều kiện đo | Cùng build, app/OS/thiết bị, dữ liệu, trạng thái phiên/quyền, cache, mạng và backend đã công bố. Ghi điều kiện nguồn điện/chế độ tiết kiệm pin/nhiệt và hoạt động nền, trình tự đo và bước chuẩn bị trước chạy; không gọi mọi lần mở iOS là cold start. Lượt warm-up hoặc lỗi dụng cụ có tiêu chí nhận diện trước, lưu dấu và báo riêng; không loại lượt chậm sau khi thấy kết quả. |
| Dữ liệu và phạm vi | Tác vụ soát dùng quyền ghế/tài khoản/rạp hợp lệ, dữ liệu riêng cho thao tác ghi hoặc reset có kiểm soát trên DB thử để không lấy từ chối soát trùng làm kết quả happy path. Không mở rộng quyền, gọi thanh toán thật hoặc gửi hàng loạt email/LLM để tạo mẫu. Nhóm gây lỗi chủ động theo mục [9.10.2](#9102-mạng-chuẩn-cho-đo-hiệu-năng-mobile) báo riêng. |
| Mức ưu tiên | Đề xuất bắt buộc có quy tắc mẫu/phân vị trước nghiệm thu hiệu năng tương ứng. |
| Cách nghiệm thu | Đủ 100 mẫu mỗi nhóm và kết luận riêng cho từng nhóm; không gộp 400 quan sát để bù nhóm không đạt. Giữ danh sách thời gian, trạng thái đúng/sai, lỗi, điều kiện và cách tính. Chưa đủ mẫu thì ghi chưa đủ bằng chứng, không suy từ phần đã chạy thành đạt. Không chọn đợt tốt nhất hoặc đổi điều kiện/loại mẫu sau khi thấy kết quả; nếu điều kiện thử sai phải báo nguyên nhân và phạm vi đo lại. |
| Căn cứ và giới hạn | 100 mẫu cho độ chia tỷ lệ quan sát 1 điểm phần trăm và cách đọc p95 rõ ràng, đổi lại cần nhiều lượt hơn mẫu 20. Đây là lựa chọn cân bằng cho portfolio đã được duyệt, chưa có ước lượng công sức/runtime thực tế. Không chứng minh tỷ lệ đạt ngoài thực tế ≥ 95% với mức tin cậy thống kê nào; cùng máy có tương quan/cache/nhiệt và không đại diện mọi thiết bị. |

Cơ sở phương pháp: [NIST — Percentiles](https://www.itl.nist.gov/div898/handbook/prc/section2/prc262.htm)
nêu có nhiều cách tính phân vị; nearest rank ở đây là lựa chọn của dự án, không phải mặc định NIST.
[NIST — Confidence intervals for proportions](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm)
phân biệt tỷ lệ quan sát và suy luận về tổng thể. Hai nguồn không quy định tối thiểu 100 mẫu cho app.
