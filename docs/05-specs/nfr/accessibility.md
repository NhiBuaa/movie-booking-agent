# Khả năng tiếp cận

[← Tổng quan NFR](README.md)

## 9.13. NFR-ACC-01 - Khả năng tiếp cận trên bốn app

**Nguồn yêu cầu hiện có:** [chuẩn UI](../../04-standards/ui-quality.md) đã yêu cầu WCAG AA, bàn phím cho Web,
trình đọc màn hình/cỡ chữ hệ thống cho native, tương phản và vùng chạm theo từng nền tảng.
**Cách cụ thể hóa đã duyệt:** ngày 2026-11-17, chủ sản phẩm trả lời “tôi đồng ý”:
Web theo WCAG 2.2 AA; native áp dụng tiêu chí phù hợp nền tảng/WCAG2ICT, kiểm VoiceOver/TalkBack,
cỡ chữ, thứ tự focus và thông báo; kết hợp tự động/thủ công và chỉ công bố phạm vi có bằng chứng.
Ma trận tiêu chí và điều kiện kiểm cụ thể vẫn cần xác định; tổ hợp công nghệ trợ năng đã duyệt
tại mục [9.13.2](#9132-ma-trận-kiểm-bàn-phím-và-trình-đọc-màn-hình), chưa có kết quả đánh giá ứng dụng.

| Trường | Nội dung |
|---|---|
| Mục tiêu | Người dùng có thể hoàn thành tác vụ đúng quyền khi dùng bàn phím, trình đọc màn hình hoặc tăng cỡ chữ, không chỉ khi nhìn và chạm theo cách mặc định. |
| Tình huống | Các hành trình khách hàng/vận hành đã chốt trên bốn app; gồm chọn ghế, xác nhận, thanh toán/trở lại, xem vé và soát vé đúng vai trò. Kiểm cả chờ, lỗi, hết hạn và kết quả thay đổi; không chỉ trang trạng thái ban đầu. |
| Chỉ số đề xuất | Số vi phạm tiêu chí áp dụng theo mức A/AA trong phạm vi Web được kiểm; số tác vụ không hoàn thành bằng phương thức trợ năng đã chọn; lỗi nhãn/focus/thông báo trạng thái, tương phản/vùng chạm và nội dung bị mất khi tăng cỡ chữ. Báo riêng theo app, hệ điều hành và công nghệ trợ năng. |
| Ngưỡng mục tiêu | Đã duyệt Web theo WCAG 2.2 AA và native theo tiêu chí phù hợp nền tảng; chuẩn UI hiện có giữ hiệu lực. Chi tiết nghiệm thu đề xuất: không còn vi phạm tiêu chí áp dụng hoặc tác vụ trợ năng bị chặn trong phạm vi đã xác định. Native có ma trận áp dụng riêng dựa trên WCAG2ICT, không nhận chứng nhận cho app từ kết quả Web. Không giảm vùng chạm/tương phản của chuẩn UI xuống ngưỡng ít nghiêm ngặt hơn. |
| Điều kiện đo đề xuất | Đúng bản build, dữ liệu/trạng thái và viewport/thiết bị đã công bố. Web kiểm bàn phím và trình đọc màn hình phù hợp; native kiểm VoiceOver/TalkBack, cỡ chữ hệ thống, focus và thông báo. Ghi simulator/emulator/thiết bị thật; khoảng trống Android thật theo NFR-PERF-02 vẫn phải báo rõ khi ảnh hưởng bằng chứng. Tổ hợp công nghệ trợ năng đã duyệt tại mục [9.13.2](#9132-ma-trận-kiểm-bàn-phím-và-trình-đọc-màn-hình); phiên bản/cấu hình tiếng Việt và checklist tiêu chí chi tiết còn mở. |
| Mức ưu tiên | Khả năng tiếp cận là yêu cầu bắt buộc hiện có của dự án; đề xuất ưu tiên nghiệm thu trọn các hành trình chính, không dùng phạm vi kiểm ban đầu để miễn chuẩn UI cho màn hình khác. |
| Cách nghiệm thu | Đã duyệt kết hợp tự động và thủ công, chỉ công bố phạm vi có bằng chứng. Chi tiết đề xuất: hoàn thành đủ các bước hành trình và ghi kết quả từng tiêu chí; không lấy điểm scanner hoặc một màn hình đạt làm bằng chứng toàn app đạt. Ghi rõ phần chưa kiểm. |
| Giới hạn và phần chưa chốt | Tổ hợp công nghệ trợ năng tham chiếu đã duyệt tại mục [9.13.2](#9132-ma-trận-kiểm-bàn-phím-và-trình-đọc-màn-hình). Ma trận tiêu chí native áp dụng, phiên bản/cấu hình ngôn ngữ thực tế, checklist từng hành trình và công cụ cụ thể còn mở. Không thêm thư viện, thay token thiết kế hoặc chạy kiểm giao diện trong giai đoạn phân tích này. |

Cơ sở nghiên cứu ngày 2026-11-17:
[W3C — WCAG 2.2 conformance](https://www.w3.org/TR/WCAG22/#conformance-reqs) yêu cầu AA bao gồm A và AA,
đánh giá toàn trang và đầy đủ quy trình; [WCAG2ICT](https://www.w3.org/TR/wcag2ict/) là hướng dẫn áp dụng
cho phần mềm/tài liệu ngoài Web, không tự đặt yêu cầu native của dự án.
[W3C — Selecting evaluation tools](https://www.w3.org/WAI/test-evaluate/tools/selecting/)
nêu công cụ không đánh giá được mọi khía cạnh, cần kết hợp nhận định của người kiểm.

### 9.13.1. Bố cục Web co giãn và giữ đầy đủ nội dung

**Nguyên tắc sản phẩm: Đã xác nhận ngày 2026-11-20.** Chủ sản phẩm yêu cầu
“phải thực hiện cho nó flexible căn ra tối đa tràn màn hình nhất có thể nhưng không bị mất nội dung”.
Diễn giải cho hai app Web: bố cục tự co giãn theo vùng hiển thị, tận dụng diện tích hữu ích phù hợp
tác vụ; khi đổi kích thước hoặc phóng to, nội dung và chức năng vẫn truy cập được đầy đủ.
Các cách sắp xếp/vùng cuộn cụ thể bên dưới là đề xuất thiết kế/nghiệm thu, chưa phải UI đã triển khai.

| Trường | Nội dung và trạng thái |
|---|---|
| Tình huống | Thu hẹp/mở rộng cửa sổ, chia màn hình, đổi hướng điện thoại, zoom hoặc tăng cỡ chữ; vùng hiển thị còn lại thay đổi do bàn phím/thanh trình duyệt. Các hành trình chính của Customer Web/Organizer Web phải tiếp tục dùng được. |
| Mục tiêu bố cục | Tận dụng không gian sẵn có: khối nội dung thay đổi kích thước, xuống dòng hoặc bố trí lại theo vùng hiển thị. Khối hình/nền và vùng dữ liệu có thể mở rộng theo tác vụ; giữ khoảng đệm và kích thước chữ/vùng thao tác theo chuẩn UI. Không cần ép toàn bộ nội dung dài vào một màn hình; cho phép cuộn để xem đầy đủ. |
| Chỉ số | Số thông tin/bộ điều khiển không thể tiếp cận do cắt/che/tràn; số hành trình không hoàn thành khi đổi kích thước; số trường hợp cuộn ngang toàn trang không cần thiết với nội dung thông thường. Không tự đặt tỷ lệ phần trăm phủ màn hình để thay cho đánh giá dùng được và dễ đọc. |
| Ngưỡng mục tiêu | Theo yêu cầu không mất nội dung/chức năng: 0 trường hợp thông tin hoặc thao tác cần thiết không thể tiếp cận trong ma trận kiểm đã định. Kế thừa WCAG 2.2 AA đã duyệt: reflow ở bề rộng tương đương 320 CSS px đối với nội dung cuộn dọc; tăng chữ tới 200% vẫn giữ nội dung/chức năng theo tiêu chí áp dụng. Đây là phép kiểm trợ năng, không phải tự chọn điện thoại/màn hình tối thiểu mới. |
| Nội dung hai chiều | Đề xuất sơ đồ ghế cần giữ quan hệ không gian dùng vùng cuộn/zoom riêng; bảng có thể bố trí lại hoặc dùng vùng cuộn riêng khi quan hệ hai chiều là cần thiết. Phần bao quanh vẫn reflow, chữ/nút phải truy cập được; không tự miễn mọi bảng hoặc toàn trang. Nếu rút gọn thông tin, phải có cách xem đầy đủ rõ ràng. |
| Điều kiện kiểm | Cùng build/dữ liệu/phiên/vai trò, trên ma trận Chrome/Safari/Edge đã duyệt. Đổi kích thước qua các điểm chuyển bố cục, kiểm cả các chiều rộng giữa mốc benchmark; kiểm dọc/ngang và trình duyệt điện thoại thực. Áp phép kiểm reflow/resize-text riêng; ví dụ viewport ban đầu rộng 1280 CSS px ở zoom 400% tương đương 320 CSS px. Không lấy hai viewport đo hiệu năng làm toàn bộ phạm vi responsive. |
| Mức ưu tiên | Yêu cầu trực tiếp của chủ sản phẩm và cụ thể hóa chuẩn khả năng tiếp cận bắt buộc hiện có; nghiệm thu trong các hành trình/phạm vi Web đã chốt. |
| Cách nghiệm thu đề xuất | Thực hiện đủ hành trình khi đổi kích thước/zoom, đọc được thông tin, tới và kích hoạt được các nút/biểu mẫu; kiểm phần dưới màn hình, hộp thoại/thanh cố định và vùng dữ liệu rộng. Giữ bằng chứng kích thước/zoom, ảnh hoặc video cùng kết quả thao tác; số đo CWV đạt không bù nội dung bị mất hoặc tác vụ bị chặn. |
| Ranh giới thiết kế | Chi tiết cột, khoảng đệm và giới hạn rộng từng khối theo DESIGN/chuẩn UI, cần hòa giải ở thiết kế màn hình nếu có mâu thuẫn với mục tiêu tận dụng diện tích. Không dùng page max-width hoặc viewport benchmark để suy giao diện bị khóa kích thước. Hồ sơ CPU/mạng tại mục [9.9.5](performance.md#995-hai-hồ-sơ-viewportcpumạng-cho-bộ-đo-web) đã được duyệt riêng; nguyên tắc co giãn này không thay bằng chứng đó hoặc sửa DESIGN/tokens/CSS. |

Căn cứ kế thừa AA: [W3C — SC 1.4.10 Reflow](https://www.w3.org/TR/WCAG22/#reflow),
[Understanding Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)
và [SC 1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html).
Ngoại lệ hai chiều là giới hạn của phần thực sự cần hai chiều để hiểu/dùng, không tự áp cho toàn bộ giao diện.
Yêu cầu tận dụng diện tích là định hướng sản phẩm của chủ sản phẩm; WCAG không quy định mọi khối phải kéo rộng hết màn hình.

Căn cứ nghiên cứu sơ đồ ghế Web ngày 2026-11-22: [W3C — SC 1.4.10 Reflow](https://www.w3.org/TR/WCAG22/#reflow)
và [Understanding Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) chỉ cho ngoại lệ ở phần cần bố cục hai chiều để hiểu/dùng; phần xung quanh vẫn phải reflow.
Suy ra cho dự án: phải chứng minh quan hệ không gian của sơ đồ ghế là cần thiết, không tự miễn chỉ vì gọi nó là sơ đồ; ngoại lệ này không miễn các tiêu chí trợ năng khác.
[SC 2.1.1 Keyboard](https://www.w3.org/TR/WCAG22/#keyboard) và [Understanding Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html) yêu cầu chức năng thao tác được bằng bàn phím; chọn ghế không thuộc ngoại lệ đầu vào phụ thuộc đường di chuyển.
Các nguồn này không mặc định bắt mọi sơ đồ ghế có danh sách thay thế; lựa chọn A giữ vùng cuộn/zoom riêng chỉ phù hợp khi đủ thao tác bàn phím, trình đọc màn hình và vùng thao tác theo chuẩn UI được kiểm chứng.
A được duyệt tiếp bên dưới; B thêm danh sách chọn ghế tương đương không được chọn làm yêu cầu bắt buộc, không phải nghĩa vụ có thể suy riêng từ hai tiêu chí trên hoặc bằng chứng đã đạt.

**Lựa chọn sơ đồ ghế trên Customer Web — phương án A đã duyệt ngày 2026-11-22:** chủ sản phẩm chọn
“A — Sơ đồ cuộn/zoom riêng, đủ trợ năng”. Giữ quan hệ không gian
trong vùng cuộn/zoom riêng khi đã xác định quan hệ hai chiều là cần thiết; phần giá, chú giải,
ghế đã chọn và nút xác nhận bên ngoài vẫn reflow theo mục [9.13.1](#9131-bố-cục-web-co-giãn-và-giữ-đầy-đủ-nội-dung). Không thu nhỏ toàn bộ sơ đồ
chỉ để vừa màn hình nếu làm mất khả năng đọc/chọn hoặc vi phạm vùng thao tác của chuẩn UI.
Chưa bắt buộc thêm một giao diện danh sách chọn ghế riêng; sơ đồ vẫn phải đủ chức năng bằng bàn phím
và trình đọc màn hình, có cách tới/thoát vùng, xác định hàng/số ghế, loại/trạng thái và lựa chọn hiện tại.
Không chỉ dùng màu để truyền trạng thái; các quy tắc chọn/giữ ghế và thẩm quyền Core không đổi.

Tình huống/điều kiện đo: luồng chọn ghế trực tiếp và thẻ sơ đồ trong chat thuộc phạm vi sản phẩm,
dữ liệu phòng gồm ghế ở rìa sơ đồ, cấu hình bàn phím/trình đọc màn hình theo mục [9.13.2](#9132-ma-trận-kiểm-bàn-phím-và-trình-đọc-màn-hình);
kiểm cửa sổ hẹp, đổi hướng, tăng chữ 200% và phép kiểm reflow tương đương 320 CSS px đã kế thừa.
Chỉ số/ngưỡng: 0 thông tin/thao tác cần thiết không tiếp cận được, 0 bẫy bàn phím, 0 yêu cầu cuộn
ngang toàn trang do phần nội dung thông thường; vùng thao tác Web giữ tối thiểu 44×44 CSS px theo chuẩn UI.
Mức ưu tiên: A đã được chọn cho nghiệm thu chọn ghế trên Customer Web.
Cách nghiệm thu: người kiểm hoàn thành chọn/bỏ chọn/xác nhận theo quyền, tiếp cận được các ghế cần kiểm
và thông tin trạng thái mà không phụ thuộc chỉ vào nhìn màu hoặc kéo bằng chuột; kiểm phần bao quanh
và nội dung ở mép/ngoài vùng nhìn ban đầu. Giữ bằng chứng thao tác/render, không suy từ sơ đồ Figma hoặc scanner.
B bổ sung cách chọn ghế bằng danh sách tương đương, tăng phạm vi UI/trạng thái phải giữ nhất quán và kiểm;
B không được chọn làm yêu cầu bắt buộc. Nếu sơ đồ không đạt trợ năng thì A không cho miễn tiêu chí; cần sửa hoặc trình phương án khác.
Quyết định chỉ ở mức yêu cầu/thiết kế, chưa chọn widget/thư viện hoặc API trợ năng native.

### 9.13.2. Ma trận kiểm bàn phím và trình đọc màn hình

**Bộ tham chiếu A đã duyệt ngày 2026-11-20:** chủ sản phẩm trả lời “tôi đồng ý” cho
Web Windows dùng bàn phím/Edge/Narrator, Web iPhone dùng Safari/VoiceOver, hai app iOS dùng VoiceOver
trên iPhone 11 Pro Max thật và hai app Android dùng TalkBack/emulator, công bố giới hạn bằng chứng.
Kết hợp kiểm tự động, cỡ chữ, tương phản và hành trình đầy đủ; không suy tổ hợp đạt thành mọi tổ hợp đã kiểm.
Phiên bản/cấu hình tiếng Việt và checklist chi tiết còn mở; chưa bổ sung thiết bị, cài công cụ hoặc chạy kiểm.

| Phạm vi | Cấu hình tham chiếu A đã duyệt |
|---|---|
| Customer Web và Organizer Web trên máy tính | Bàn phím và Narrator + Microsoft Edge trên Windows. Chrome vẫn kiểm bàn phím/tiêu chí áp dụng trong ma trận browser đã duyệt; không suy kiểm Narrator/Edge thành đã kiểm mọi tổ hợp trình đọc màn hình/trình duyệt. |
| Hai app Web trên iPhone | Safari + VoiceOver trên iPhone 11 Pro Max thật; kiểm thao tác cảm ứng, thứ tự đọc/focus, nhãn và thông báo. |
| Customer Mobile và Organizer Mobile bản iOS | VoiceOver trên iPhone 11 Pro Max thật; kiểm riêng từng app/build, cỡ chữ hệ thống và điều hướng native, không dùng kết quả Safari thay app native. |
| Hai app native bản Android | TalkBack trên emulator có Android Accessibility Suite phù hợp; ghi rõ phiên bản/image/cấu hình và nguồn bằng chứng giả lập. Kết quả này không xác nhận trải nghiệm trợ năng Android thật; phần thiếu thiết bị thật tiếp tục công bố, không tự đóng bằng kết quả emulator hoặc miễn yêu cầu hỗ trợ Android. |

| Trường | Nội dung đề xuất |
|---|---|
| Tình huống | Người dùng chỉ điều hướng bàn phím trên Web hoặc dùng trình đọc màn hình để hoàn thành hành trình đúng quyền; gồm biểu mẫu, sơ đồ ghế, hộp thoại, chat, thanh toán/trở lại và xem/soát vé ở app có chức năng đó. Kiểm cả chờ, lỗi, hết hạn và kết quả cập nhật. |
| Chỉ số và ngưỡng | Kế thừa WCAG 2.2 AA cho Web, tiêu chí native áp dụng theo WCAG2ICT/chuẩn UI; đếm lỗi theo tiêu chí, tác vụ bị chặn, nhãn/thứ tự focus/thông báo sai và mất nội dung khi tăng cỡ chữ. Đề xuất 0 vi phạm tiêu chí áp dụng trong phạm vi đã đánh giá và 0 tác vụ được nghiệm thu bị chặn với cấu hình đã công bố. Không dùng điểm quét tổng hoặc một tổ hợp đạt để tuyên bố toàn bộ app đạt. |
| Điều kiện đo | Ghi build, dữ liệu, vai trò, đầy đủ bước, Windows/iOS/Android, browser, AT/giọng-ngôn ngữ và cấu hình cỡ chữ/zoom. Phiên bản thực tế chốt trước đo; tài liệu nguồn mới nhất không tự chọn phiên bản OS cho iPhone 11 Pro Max. Giữ các phép kiểm layout/vùng chạm/tương phản, không dùng trình đọc màn hình thay mọi tiêu chí. |
| Mức ưu tiên | Bộ tham chiếu A đã duyệt để nghiệm thu NFR-ACC-01; chuẩn UI áp dụng rộng hơn vẫn giữ hiệu lực. Ma trận không tự miễn kiểm browser khác hoặc cấp ngoại lệ mới cho tiêu chí chưa đánh giá. |
| Cách nghiệm thu | Kết hợp kiểm tự động phù hợp nền tảng và thao tác thủ công toàn hành trình bằng cấu hình trên. Ghi tiêu chí/kết quả/mốc thao tác, lỗi tìm được và phần chưa kiểm theo từng app; xác nhận đọc được thông tin, tới/kích hoạt được thao tác, nhận được thông báo lỗi/trạng thái. Đánh giá toàn quy trình Web và nêu rõ phạm vi khi công bố kết quả. |
| Đánh đổi A/B và phần còn mở | A đã được chọn: Narrator có sẵn trên Windows làm tổ hợp Web máy tính tham chiếu để giảm chuẩn bị công cụ. B dùng Chrome + NVDA không được chọn làm tổ hợp tham chiếu mặc định; NVDA miễn phí nhưng cần chuẩn bị thêm công cụ. Không chứng minh mọi tổ hợp AT từ tổ hợp đã chọn. Phiên bản, nội dung checklist từng tiêu chí và cấu hình tiếng Việt cần chốt; không chọn framework/library từ tài liệu hướng dẫn công cụ. |

Căn cứ tra cứu ngày 2026-11-20:
[Microsoft — Complete guide to Narrator](https://support.microsoft.com/en-us/accessibility/windows/narrator/complete-guide-to-narrator)
mô tả trình đọc màn hình tích hợp Windows;
[Apple — VoiceOver](https://support.apple.com/guide/iphone/iph3e2e415f/ios) mô tả điều khiển iPhone bằng trình đọc màn hình;
[Android Developers — Testing for Accessibility](https://developer.android.com/codelabs/basic-android-kotlin-compose-test-accessibility)
dùng thiết bị hoặc emulator có bộ trợ năng phù hợp cho TalkBack.
[NV Access — User Guide](https://api.nvaccess.org/documentation/userGuide.html) mô tả NVDA miễn phí/mã nguồn mở;
[W3C — Selecting evaluation tools](https://www.w3.org/WAI/test-evaluate/tools/selecting/) yêu cầu kết hợp đánh giá của người kiểm.
Các nguồn chứng minh khả năng của công cụ; lựa chọn A do chủ sản phẩm duyệt, chưa xác nhận dự án đã kiểm.
