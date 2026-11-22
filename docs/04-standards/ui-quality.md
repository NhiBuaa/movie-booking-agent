# Chuẩn chất lượng UI/UX — Movie Booking Platform

Tài liệu này xác định tiêu chuẩn chất lượng kỹ thuật mang tính bắt buộc (normative standard) cho việc thiết kế, triển khai và review giao diện trên cả bốn ứng dụng Customer Web, Customer Mobile, Organizer Web và Organizer Mobile theo [ADR-0002](../06-decisions/0002-customer-organizer-app-boundaries.md).

Đọc PRODUCT của từng ứng dụng để xác định người dùng, tác vụ và nền tảng:
- [Customer Web](../../apps/customer-web/PRODUCT.md)
- [Customer Mobile](../../apps/customer-mobile/PRODUCT.md)
- [Organizer Web](../../apps/organizer-web/PRODUCT.md)
- [Organizer Mobile](../../apps/organizer-mobile/PRODUCT.md)

Tham chiếu các thẩm quyền liên quan:
- Bản sắc thị giác, kiểu chữ và bố cục: root [`DESIGN.md`](../../DESIGN.md).
- Ngôn ngữ thiết kế chuyển động (Motion Design Language): [`docs/04-standards/motion-design.md`](motion-design.md).
- Quy trình phối hợp và bàn giao: [`docs/07-guides/ui-design-motion-workflow.md`](../07-guides/ui-design-motion-workflow.md).
- Điều phối skill của Agent: [`.agents/rules/ui-skill-routing.md`](../../.agents/rules/ui-skill-routing.md).

---

## 1. Bản sắc thị giác & Design Tokens (Ferrari Dark Cinema)

Nền tảng sử dụng phong cách **Ferrari Dark Cinema — Cinematic Kinetic Editorial** được đặc tả tại root [`DESIGN.md`](../../DESIGN.md):
- **Phông nền điện ảnh:** Gam màu đen sâu chủ đạo (`--color-carbone-nero: #000000`, `--color-notte-profonda: #181818`), kết hợp phân lớp quang học không dùng bóng đổ giả (no box-shadows).
- **Màu tín hiệu nhận diện:** Màu đỏ Rosso Corsa (`--color-rosso-corsa: #DA291C`) chỉ dùng làm điểm nhấn tương tác có chủ đích (hover, focus, active) hoặc cảnh báo lỗi giao dịch; không rải rác làm loãng thị giác.
- **Đường nét hình học tối giản:** Viền mỏng như sợi tóc (`1px solid var(--color-grafite)` hoặc `#303030`), triệt để duy trì góc sắc nhọn `0px border-radius` làm nhận diện thương hiệu cốt lõi. Ngoại lệ duy nhất cho bo góc là các badge trạng thái nhỏ (4px) và pill lọc danh mục (9999px) được kiểm soát nghiêm ngặt.
- **Hệ thống chữ biên tập:** Phân cấp 8 tầng chữ rõ ràng từ tiêu đề lớn (Hero Headline / Movie Display) đến thông tin nghiệp vụ và biểu mẫu dễ đọc, độ tương phản chuẩn WCAG AA.
- **Hình ảnh điện ảnh:** Poster phim tỷ lệ 2:3, khung hình điện ảnh 16:9 sắc cạnh, ảnh chụp không gian rạp sang trọng; không dùng hình minh họa vector hoạt hình hay đồ họa trang trí generic SaaS.

---

## 2. Tiêu chuẩn 4 giai đoạn phát triển giao diện

Mọi màn hình hoặc thành phần UI mới phải trải qua 4 giai đoạn kiểm chứng nghiêm ngặt:

### Giai đoạn 1 — Bố cục & Phân cấp (Layout & Visual Hierarchy)
- Sử dụng khoảng trắng âm tính (negative space), căn lề và tỷ lệ chữ thay vì lạm dụng khung viền hay vách ngăn dày.
- Web/Organizer sử dụng biến CSS từ `@platform/design-tokens`; Mobile ánh xạ cùng token sang native theme theo [ADR-0016](../06-decisions/0016-expo-router-and-mobile-native-foundation.md).
- `DESIGN.md` sở hữu bản sắc; không bắt UI native áp dụng nguyên xi CSS của Web.
- Bố cục responsive liền mạch qua các mốc breakpoint chính: Mobile (375px), Tablet (768px), Desktop (1280px), Wide Cinema Canvas (1760px).

### Giai đoạn 2 — Công thái học & Trạng thái (Interactions & States)
- Mọi control tương tác phải có đầy đủ trạng thái: `Default`, `Hover` (con trỏ chuột), `Active/Pressed` (phản hồi co giãn nhẹ `scale(0.98)`), `Focus Visible` (viền đỏ 2px), và `Disabled`.
- App cảm ứng không bao giờ phụ thuộc vào hover để hoàn thành tác vụ.
- Phản hồi tức thời (<50ms) đối với các thao tác chọn ghế, cập nhật số lượng combo và mở tab.
- Thao tác chạm tối thiểu: Web 44×44 CSS px; iOS 44×44 pt; Android 48×48 dp.

### Giai đoạn 3 — Khả năng tiếp cận & Render thực tế (a11y & Render Verification)
- Độ tương phản chữ và nền đạt chuẩn WCAG AA (tối thiểu 4.5:1 cho body copy thông thường, 3:1 cho tiêu đề lớn).
- Hai app Web hỗ trợ hoàn toàn điều hướng bàn phím (Tab, Shift+Tab, Enter, Space, Escape, phím mũi tên).
- App iOS/Android hỗ trợ trình đọc màn hình (VoiceOver, TalkBack), cỡ chữ hệ thống linh hoạt (Dynamic Type), vùng an toàn màn hình (Safe Area) và cử chỉ vuốt quay lại bản địa.

### Giai đoạn 4 — Hiệu năng khung hình & Chuyển động (Animation & Performance)
- Tuân thủ chuẩn thiết kế chuyển động tại [`docs/04-standards/motion-design.md`](motion-design.md).
- Web chỉ dùng `transform` và `opacity` cho chuyển động, tránh tính lại bố cục mỗi khung hình (layout thrashing/reflow).
- Ngân sách khung hình đạt chuẩn 60fps (16.6ms per frame).
- Tôn trọng cài đặt giảm chuyển động `prefers-reduced-motion: reduce`.
- Bắt buộc có bằng chứng đo lường thực tế từ trình duyệt (Web) hoặc simulator/thiết bị thật (Mobile) trước khi công bố hoàn tất; không suy ra độ mượt chỉ bằng việc đọc mã nguồn.

---

## 3. Trạng thái giao dịch và xử lý lỗi

Giao diện không bao giờ để người dùng rơi vào trạng thái bế tắc hoặc nghi ngờ về giao dịch:
- **Loading State:** Sử dụng skeleton loaders đúng hình dạng layout thay vì spinner tròn đơn điệu. Tuyệt đối không để màn hình trắng hoặc giật bố cục khi nạp dữ liệu.
- **Empty State:** Luôn giải thích lý do danh sách trống và hướng dẫn người dùng hành động tiếp theo (ví dụ: gợi ý phim hot khi tìm kiếm không ra kết quả).
- **Error State:** Nêu rõ nguyên nhân lỗi và cung cấp nút hành động khắc phục cụ thể (ví dụ: "Thử lại", "Chọn ghế khác", "Đổi phương thức thanh toán").

---

## 4. Tiêu chí chất lượng Chuyển động & Trợ năng Nâng cao

### 4.1 Khả năng tiếp cận chuyển động (Motion Accessibility)
- **Tuân thủ WCAG 2.3.1:** Không sử dụng bất kỳ hiệu ứng nhấp nháy, chớp sáng hoặc đảo màu quá 3 lần/giây để tránh gây co giật quang học (photosensitive seizures).
- **Tuân thủ WCAG 2.2.2:** Người dùng phải có khả năng tạm dừng hoặc ẩn các chuyển động nền tuần hoàn (ambient motion).
- **Xử lý `prefers-reduced-motion: reduce`:**
  - Bắt buộc khai báo `@media (prefers-reduced-motion: reduce)` trong CSS toàn cục.
  - Mọi hiệu ứng chuyển dịch (`translate`), phóng đại (`scale`), xoay (`rotate`) và mặt nạ (`clip-path`) phải được vô hiệu hóa.
  - Thay thế bằng chuyển đổi hiển thị tức thời (instant) hoặc mờ dần tinh tế (crossfade `100ms`).

### 4.2 Tính liên tục bàn phím & cảm ứng (Keyboard & Touch Continuity)
- **Bảo tồn vòng viền tiêu điểm (Focus Indicator):** Khi chuyển cảnh hoặc hiển thị nội dung mới, vòng viền focus (`outline: 2px solid #da291c; outline-offset: 2px`) phải luôn nhìn thấy rõ, không bị che khuất bởi mặt nạ animation.
- **Phản hồi chạm (Touch Ergonomics):** Nút bấm và thẻ chạm phải cung cấp phản hồi cơ học tức thì (`active-press-scale: scale(0.98)` trong 80ms) trước khi chuyển trạng thái hoặc kích hoạt chuyển trang.

### 4.3 Khả năng ngắt quãng và hủy bỏ chuyển động (Motion Interruption)
- Khi người dùng nhấp đúp nhanh, đổi tab liên tục hoặc quay lại trang trước, mọi animation đang diễn ra phải lập tức dừng lại hoặc nhảy thẳng đến trạng thái kết thúc (instant settlement).
- Tuyệt đối không để lại các phần tử lơ lửng, kẹt ở độ mờ dở dang (`opacity: 0.5`) hoặc chặn người dùng bấm tiếp (unclickable overlay).

### 4.4 Bất biến an toàn giao dịch (Transaction Safety Invariant)
- **Đồng hồ đếm ngược giữ ghế (Hold TTL):** Tuyệt đối không gắn animation phức tạp vào số giây của bộ đếm thời gian giữ ghế; thời gian phải nhảy chính xác từng giây để bảo đảm tính minh bạch trước khi ghế bị giải phóng về kho Core.
- **Sơ đồ chọn ghế:** Trạng thái ghế (Ghế trống, Đang giữ, Đã bán, Đang chọn) phải phản ánh đúng dữ liệu từ Cinema Core; cấm dùng animation ảo tạo cảm giác ghế được giữ trước khi API trả về kết quả thành công.
- **Xác nhận thanh toán và Vé điện tử:** Màn hình Payment Success (S13) và Vé điện tử QR (S16) CHỈ ĐƯỢC PHÉP render ở trạng thái xác nhận khi có dữ liệu phản hồi hợp lệ kèm chữ ký số từ Cinema Core; cấm dùng animation hé lộ vé để giả lập trạng thái thanh toán thành công.

### 4.5 Kiểm chứng hiệu năng & hiển thị thực tế (Performance Verification)
- Khi nghiệm thu UI có chuyển động, developer và agent phải cung cấp bằng chứng runtime:
  - Web: Kết quả ghi vết (trace) từ Chrome DevTools Performance panel, xác nhận không có Drop Frames đáng kể và không có Layout Shift (CLS < 0.1).
  - Mobile: Thao tác thực tế trên iOS Simulator hoặc Android Emulator, xác nhận không đơ cảm ứng.
- Nếu môi trường kiểm thử thiếu công cụ đo kiểm, phải ghi rõ trong báo cáo: *"Phần hiệu năng khung hình và hiển thị thực tế chưa được kiểm chứng tại runtime"*.

### 4.6 Thẩm quyền Token & Tính nhất quán thị giác
- Mọi giá trị màu sắc, khoảng cách, kiểu chữ và thời lượng chuyển động phải sử dụng biến token từ `@platform/design-tokens` hoặc các token đề xuất trong [`motion-design.md`](motion-design.md).
- Nghiêm cấm việc tùy tiện chèn các mã màu hex ngẫu nhiên hoặc các đường cong easing tự chế không nằm trong quy chuẩn.
