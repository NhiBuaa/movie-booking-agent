# Chuẩn Thiết Kế Chuyển Động (Motion Design Language) — Cinematic Kinetic Editorial

Tài liệu này là chuẩn kỹ thuật chính thức (normative standard) quy định ngôn ngữ thiết kế chuyển động (Motion Design Language) cho hệ sinh thái **Movie Booking Platform**, bao gồm bốn ứng dụng Customer Web, Customer Mobile, Organizer Web và Organizer Mobile theo [ADR-0002](../06-decisions/0002-customer-organizer-app-boundaries.md).

Tài liệu cụ thể hóa định hướng thẩm mỹ **CINEMATIC KINETIC EDITORIAL (Motion-Led Cinema Experience)** được chủ sản phẩm lựa chọn, kế thừa nền tảng nhận diện **Ferrari Dark Cinema** tại [`DESIGN.md`](../../DESIGN.md).

---

## 1. Nguyên Tắc Cốt Lõi (Core Principles)

1. **Chuyển động có chủ đích (Purposeful, not decorative):** Mọi chuyển động phải phục vụ định hướng thị giác, phản hồi thao tác người dùng hoặc thể hiện tiến trình nghiệp vụ. Tuyệt đối không thêm chuyển động chỉ để tạo cảm giác phức tạp hoặc phô diễn kỹ thuật.
2. **Bảo toàn an toàn giao dịch (Transaction Safety Invariant):** Không bao giờ để chuyển động làm trễ, che giấu hoặc làm biến dạng các thông tin giao dịch then chốt: trạng thái ghế trong sơ đồ phòng chiếu, đồng hồ đếm ngược giữ vé (Hold TTL 5 phút), thông báo số tiền thanh toán, và mã QR vé điện tử đã được xác minh từ Cinema Core.
3. **Ưu tiên hiệu năng khung hình (60fps Frame Budget):** Mọi chuyển động trên trình duyệt chỉ tác động lên các thuộc tính tổng hợp GPU (composite-only properties): `transform` và `opacity`. Tuyệt đối không tạo chuyển động trên các thuộc tính gây tính toán lại bố cục (layout thrashing/reflow) như `width`, `height`, `top`, `left`, `margin`, `padding`.
4. **Tôn trọng khả năng tiếp cận (Accessibility-First & Reduced Motion):** Luôn cung cấp giải pháp thay thế tức thời (instant) hoặc mờ dần tinh tế (subtle crossfade) khi người dùng kích hoạt tùy chọn `prefers-reduced-motion: reduce`.
5. **Đồng bộ nhưng thích ứng nền tảng (Platform-Appropriate Adaptation):** Giữ cùng một nhịp điệu và cảm xúc chuyển động trên cả 4 ứng dụng, nhưng sử dụng cơ chế thực thi tối ưu của từng nền tảng (CSS/WAAPI trên Web; Animated/Reanimated native driver trên Mobile).

---

## 2. Phân Loại Chuyển Động (Motion Taxonomy)

Chuyển động trong hệ thống được chia thành 4 nhóm rõ ràng với vai trò và tần suất xuất hiện khác biệt:

### 2.1 Brand Motion (Chuyển động Nhận diện Thương hiệu)
- **Đặc trưng:** Mang tính nghệ thuật, dàn dựng không gian (cinematic choreography), thể hiện ngôn ngữ biên tập điện ảnh cao cấp.
- **Phạm vi:** Các khu vực khám phá và giới thiệu: Hero section, Banner phim tiêu điểm, Thư viện ảnh/video mosaic, Chuyển cảnh giữa các phân đoạn lớn (section transitions).
- **Mức độ tác động:** Cao về mặt thị giác, nhưng chỉ kích hoạt khi người dùng điều hướng hoặc cuộn trang chủ động.

### 2.2 Interaction Motion (Chuyển động Phản hồi Tương tác)
- **Đặc trưng:** Nhanh, nhạy, dứt khoát, mang tính công thái học cao (micro-interactions).
- **Phạm vi:** Trạng thái hover, active/press, focus, toggle nút chọn ghế, mở dropdown, bung modal/dialog.
- **Mức độ tác động:** Thời lượng ngắn (100ms – 200ms), phản hồi tức thời dưới đầu ngón tay hoặc con trỏ chuột.

### 2.3 Functional Motion (Chuyển động Thể hiện Trạng thái Nghiệp vụ)
- **Đặc trưng:** Thông báo sự thay đổi dữ liệu hoặc tiến trình của hệ thống một cách minh bạch.
- **Phạm vi:** Đếm ngược thời gian giữ chỗ (Hold countdown), đồng bộ ghế thời gian thực (Seat map sync), tiến trình thanh toán, hé lộ vé điện tử sau xác nhận.
- **Mức độ tác động:** Giúp người dùng nắm bắt trạng thái mà không gây phân tâm khỏi nhiệm vụ chính.

### 2.4 Ambient Motion (Chuyển động Nền Không Gian)
- **Đặc trưng:** Rất chậm, chu kỳ dài, độ tương phản mờ nhạt, tạo không khí rạp chiếu (cinematic atmosphere).
- **Phạm vi:** Vầng sáng tiêu điểm nền (spotlight glow) phía sau poster, hiệu ứng thở rất nhẹ của cụm Buaa AI khi sẵn sàng nhận lệnh.
- **Mức độ tác động:** Không gây chú ý trực tiếp, tự động dừng khi người dùng thao tác vào các luồng nhập liệu.

---

## 3. Ma Trận Cường Độ Theo Màn Hình (Motion Intensity Matrix)

Hệ thống phân chia 3 cấp độ cường độ chuyển động để bảo đảm tính cân bằng giữa trải nghiệm thị giác và hiệu quả giao dịch:

| Cấp độ | Tên gọi | Định hướng trải nghiệm | Thời lượng trung bình | Màn hình áp dụng |
|---|---|---|---|---|
| **Level 3** | **Expressive** | Giàu tính trình diễn, dàn dựng không gian, phân lớp thị giác sâu | 400ms – 700ms | Homepage (S01), Movie Details Hero (S06), Media Gallery (S22B), Featured Collections |
| **Level 2** | **Restrained** | Rõ ràng, tinh gọn, hỗ trợ phân loại và lựa chọn | 200ms – 350ms | Search & Filters (S02), Showtime Selection, Seat Map Selection (S08), Buaa AI Workspace (S03), Cinema Directory (S17/S18) |
| **Level 1** | **Minimal** | Nhanh chóng, ổn định tuyệt đối, không rườm rà | 100ms – 200ms (hoặc instant) | Checkout (S11), Payment Processing (S12), Payment Success/Failure (S13/S14), Auth/Security (S30/S31), Organizer Data Grids |

---

## 4. Đặc Tả Chi Tiết 10 Motion Patterns

### Pattern 01 — Scroll-linked Reveal
- **Tên gọi & Bản chất:** Hé lộ nội dung đồng bộ theo thanh cuộn (Scroll-linked Reveal). Khối nội dung trượt lên nhẹ nhàng từ vị trí offset nhỏ đồng thời tăng dần độ mờ đục khi đi vào khung nhìn (viewport).
- **Mục đích UX:** Tạo cảm giác người xem đang lật giở từng trang tạp chí điện ảnh, dẫn dắt ánh nhìn qua từng phân đoạn một cách tự nhiên.
- **Trigger:** Sự kiện cuộn trang khi phần tử đạt ngưỡng hiển thị (Intersection Observer threshold 15–20%).
- **Phần tử tham gia:** Tiêu đề section, cụm danh sách poster phim, khối thông tin rạp chiếu.
- **Hướng & Thuộc tính biến đổi:** `opacity: 0 -> 1`; `transform: translateY(24px) -> translateY(0px)`.
- **Timing & Duration (Proposed):** `400ms – 550ms`.
- **Easing Character:** `cubic-bezier(0.16, 1, 0.3, 1)` (Deceleration curve mượt mà, dừng êm ái).
- **Choreography:** Kích hoạt tuần tự khi cuộn tới; không chạy đồng loạt toàn bộ trang gây quá tải CPU.
- **Điều kiện áp dụng:** Các trang nội dung dài (S01 Homepage, S06 Movie Details, S18 Cinema Details).
- **Điều kiện KHÔNG áp dụng:** Màn hình thanh toán (S11), màn hình sơ đồ ghế (S08), các bảng dữ liệu quản trị (Organizer).
- **Reduced-motion Alternative:** Bỏ hoàn toàn `translateY`, hiển thị nội dung ở trạng thái tĩnh đầy đủ ngay lập tức hoặc dùng crossfade cực nhẹ (`opacity: 0 -> 1` trong `150ms`).
- **Keyboard / Touch Behavior:** Khi người dùng nhấn Tab để điều hướng bằng bàn phím, phần tử nhận focus lập tức chuyển sang trạng thái hiển thị 100% mà không chờ hiệu ứng cuộn hoàn tất.
- **Rủi ro & Phòng tránh:** Tránh liên kết trực tiếp với sự kiện `scroll` gây jank; bắt buộc sử dụng CSS `animation-timeline: view()` hoặc `IntersectionObserver`.

---

### Pattern 02 — Mask / Clip Reveal
- **Tên gọi & Bản chất:** Hé lộ bằng mặt nạ cắt góc phẳng (Mask / Clip Reveal). Hình ảnh hoặc tiêu đề chữ được hé lộ từ bên trong một mặt nạ hình chữ nhật sắc nét 0px border-radius, như khung hình máy chiếu mở màn trập.
- **Mục đích UX:** Thể hiện chất điện ảnh cổ điển và độ sắc sảo (sharp geometry) của bộ nhận diện Ferrari Dark Cinema.
- **Trigger:** Trang tải xong (Page load) hoặc chuyển đổi tab danh mục lớn.
- **Phần tử tham gia:** Backdrop hero phim, ảnh chân dung đạo diễn/diễn viên, tiêu đề phim lớn (Movie Title Display).
- **Hướng & Thuộc tính biến đổi:** `clip-path: inset(0 100% 0 0) -> inset(0 0% 0 0)` hoặc kết hợp `transform: scale(1.04) -> scale(1.0)`.
- **Timing & Duration (Proposed):** `500ms – 650ms`.
- **Easing Character:** `cubic-bezier(0.25, 1, 0.5, 1)` (Cinematic curtain ease).
- **Choreography:** Mặt nạ mở trước, tiêu đề chữ trượt nhẹ theo sau với độ trễ 80ms.
- **Điều kiện áp dụng:** Hero banner đầu trang, ảnh tiêu điểm trong trang chi tiết phim.
- **Điều kiện KHÔNG áp dụng:** Ảnh thumbnail nhỏ trong danh sách tìm kiếm hoặc giỏ hàng.
- **Reduced-motion Alternative:** Không sử dụng `clip-path` động; render ảnh ở kích thước chuẩn với `opacity` đầy đủ.
- **Keyboard / Touch Behavior:** Không làm gián đoạn khả năng chạm hoặc chọn văn bản.
- **Rủi ro & Phòng tránh:** `clip-path` phức tạp có thể gây tốn GPU trên thiết bị di động cũ; giữ đường cắt luôn là hình chữ nhật phẳng 4 cạnh (`inset`).

---

### Pattern 03 — Parallax Layering
- **Tên gọi & Bản chất:** Phân lớp thị sai quang học (Parallax Layering). Lớp ảnh nền (backdrop/still frame) di chuyển với vận tốc chậm hơn so với lớp thông tin chữ và thẻ nổi bên trên khi cuộn.
- **Mục đích UX:** Tạo chiều sâu không gian ba chiều mà không cần dùng hiệu ứng đổ bóng giả (drop-shadow) hay vật liệu nhựa bóng (glassmorphism).
- **Trigger:** Thao tác cuộn trang theo phương thẳng đứng.
- **Phần tử tham gia:** Ảnh nền hero phía sau, tiêu đề và khối thẻ đặt vé phía trước.
- **Hướng & Thuộc tính biến đổi:** Lớp nền: `transform: translateY(calc(scrollY * 0.15))`; Lớp nội dung: cuộn theo tốc độ thông thường `1.0x`.
- **Timing & Duration (Proposed):** Đồng bộ trực tiếp theo tiến trình cuộn tự nhiên của người dùng.
- **Easing Character:** Linear đồng bộ với scroll.
- **Choreography:** Tỷ lệ chênh lệch vận tốc tối đa không vượt quá `0.15` để tránh say chuyển động (vestibular discomfort).
- **Điều kiện áp dụng:** Hero section của S01 và S06 trên màn hình Desktop (>1024px).
- **Điều kiện KHÔNG áp dụng:** Trình duyệt di động, các màn hình nghiệp vụ có form nhập liệu, danh sách vé.
- **Reduced-motion Alternative:** Cố định lớp nền (`transform: none`), cuộn toàn bộ khối thống nhất như layout phẳng.
- **Keyboard / Touch Behavior:** Không ảnh hưởng tới vị trí con trỏ và vùng bấm.
- **Rủi ro & Phòng tránh:** Tuyệt đối không can thiệp vào hành vi cuộn gốc (No Scroll Hijacking). Nếu trình duyệt không hỗ trợ mượt mà, tắt parallax.

---

### Pattern 04 — Object Choreography
- **Tên gọi & Bản chất:** Dàn dựng tọa độ đối tượng (Object Choreography). Khi trạng thái hoặc bộ lọc thay đổi, các phần tử trong danh sách tự tính toán lại tọa độ và di chuyển trơn tru về vị trí mới thay vì biến mất và xuất hiện đột ngột.
- **Mục đích UX:** Giữ mạch định hướng thị giác (spatial continuity), giúp người dùng theo dõi được phần tử nào vừa được lọc ra hoặc thêm vào.
- **Trigger:** Thay đổi bộ lọc ngày/rạp/thể loại (Search & Filters / S02), chuyển đổi danh mục phim Now Showing / Coming Soon.
- **Phần tử tham gia:** Các thẻ poster phim (Movie Cards), thẻ suất chiếu (Showtime Chips).
- **Hướng & Thuộc tính biến đổi:** `transform: translate(dx, dy)`; `opacity: 0.4 -> 1` (phần tử giữ lại), `opacity: 1 -> 0` (phần tử bị lọc ra).
- **Timing & Duration (Proposed):** `250ms – 350ms`.
- **Easing Character:** `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Choreography:** Phần tử bị loại mờ đi trong 120ms; các phần tử còn lại trượt vào vị trí mới trong 250ms.
- **Điều kiện áp dụng:** Lưới phim khám phá, danh sách rạp theo khu vực.
- **Điều kiện KHÔNG áp dụng:** Sơ đồ ghế (ghế giữ cố định ma trận theo phòng, chỉ đổi màu trạng thái).
- **Reduced-motion Alternative:** Bỏ qua chuyển dịch tọa độ; hoán đổi danh sách ngay lập tức với crossfade 100ms.
- **Keyboard / Touch Behavior:** Duy trì focus bàn phím trên phần tử đang chọn nếu nó vẫn tồn tại sau khi lọc.
- **Rủi ro & Phòng tránh:** Tránh tính toán DOM bounding box liên tục; sử dụng kỹ thuật FLIP (First, Last, Invert, Play) thông qua CSS transforms.

---

### Pattern 05 — Scale-Focus Transition
- **Tên gọi & Bản chất:** Chuyển đổi tiêu điểm bằng tỷ lệ quang học (Scale-Focus Transition). Phần tử được tương tác tăng nhẹ tỷ lệ hiển thị trong khi các phần tử xung quanh giảm nhẹ độ tương phản hoặc lùi về hậu cảnh.
- **Mục đích UX:** Làm nổi bật đối tượng đang được người dùng cân nhắc (spotlight selection) mà không cần thêm viền màu lòe loẹt.
- **Trigger:** Hover chuột (Desktop) hoặc Active touch (Mobile).
- **Phần tử tham gia:** Poster phim tiêu điểm, thẻ gói vé đặc biệt (Combo/Voucher), hình ảnh rạp chiếu.
- **Hướng & Thuộc tính biến đổi:** Phần tử active: `transform: scale(1.025)`; Hairline border chuyển sang `--color-rosso-corsa: #da291c`; Các phần tử cùng nhóm: `opacity: 0.7`.
- **Timing & Duration (Proposed):** `180ms – 240ms`.
- **Easing Character:** `cubic-bezier(0.2, 0, 0, 1)`.
- **Choreography:** Tăng tỷ lệ tức thì khi trỏ chuột vào; trả về tỷ lệ `1.0` êm ái khi rời chuột trong 200ms.
- **Điều kiện áp dụng:** Thư viện ảnh phim (S22B), danh sách thẻ phim trang chủ.
- **Điều kiện KHÔNG áp dụng:** Ghế ngồi trong sơ đồ phòng chiếu (Scale ghế có thể làm tràn sang ghế bên cạnh gây khó bấm).
- **Reduced-motion Alternative:** Giữ nguyên tỷ lệ `scale(1.0)`, chỉ đổi màu viền hairline từ `#303030` sang `#da291c`.
- **Keyboard / Touch Behavior:** Kích hoạt tương đương khi nhận `focus-visible`.
- **Rủi ro & Phòng tránh:** Độ phóng đại không vượt quá `1.03` để không làm mờ hình ảnh và không gây trào viền (overflow).

---

### Pattern 06 — Kinetic Typography
- **Tên gọi & Bản chất:** Chữ chuyển động biên tập (Kinetic Typography). Các dòng chữ tiêu đề lớn xuất hiện với hiệu ứng trượt có nhịp điệu (staggered line reveal) hoặc phản hồi nhẹ theo gia tốc cuộn trang.
- **Mục đích UX:** Mang lại cảm xúc choáng ngợp như phần mở đầu của các tác phẩm điện ảnh kinh điển (title sequence), khẳng định bản sắc biên tập sang trọng.
- **Trigger:** Chuyển trang đến chi tiết phim mới hoặc mở màn trang chủ.
- **Phần tử tham gia:** Tên phim tiếng Việt/Anh lớn (Hero Display Title), khẩu hiệu thương hiệu (Brand Statement).
- **Hướng & Thuộc tính biến đổi:** Từng dòng chữ trượt lên từ mặt nạ: `transform: translateY(100%) -> translateY(0%)`; `opacity: 0 -> 1`.
- **Timing & Duration (Proposed):** `450ms – 600ms` cho toàn bộ cụm tiêu đề.
- **Easing Character:** `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Choreography:** Dòng 1 chạy ở `0ms`, dòng 2 có độ trễ `60ms`, dòng 3 độ trễ `120ms`.
- **Điều kiện áp dụng:** Tiêu đề phim trang S06, câu chào trang S01.
- **Điều kiện KHÔNG áp dụng:** Tiêu đề form nhập liệu, giá vé, nhãn nút bấm, thông tin tài khoản.
- **Reduced-motion Alternative:** Chữ hiển thị cố định ngay lập tức ở vị trí cuối cùng, không trượt.
- **Keyboard / Touch Behavior:** Văn bản phải cho phép bôi đen, sao chép (copyable) và đọc được bởi trình đọc màn hình ngay cả khi animation đang diễn ra.
- **Rủi ro & Phòng tránh:** Không chia tách văn bản thành từng ký tự rời rạc làm hỏng cây trợ năng (Accessibility DOM Tree); chỉ chia tách theo từng dòng hiển thị (`span` block).

---

### Pattern 07 — Spatial / Shared-Element Transition
- **Tên gọi & Bản chất:** Chuyển cảnh liên tục không gian (Spatial / Shared-Element Transition). Đối tượng hình ảnh (ví dụ: poster phim) chuyển dịch mượt mà từ vị trí thumbnail ở trang danh sách sang vị trí backdrop/hero ở trang chi tiết.
- **Mục đích UX:** Xóa bỏ cảm giác tải trang gián đoạn, biến việc duyệt web thành một hành trình điện ảnh liền mạch.
- **Trigger:** Người dùng nhấp chọn một phim từ Discovery (S01/S02) để vào Movie Details (S06).
- **Phần tử tham gia:** Ảnh poster phim và tiêu đề phim chính.
- **Hướng & Thuộc tính biến đổi:** Hình ảnh mở rộng tọa độ `(x, y, w, h)` từ vị trí nguồn sang vị trí đích; nội dung chi tiết xung quanh mờ dần vào sau đó.
- **Timing & Duration (Proposed):** `350ms – 450ms`.
- **Easing Character:** `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- **Choreography:** Poster mở rộng chiếm vị trí hero trong 300ms; khung thông tin lịch chiếu trượt vào từ bên phải trong 150ms tiếp theo.
- **Điều kiện áp dụng:** Điều hướng từ Discovery sang Movie Details trên kết nối mạng ổn định.
- **Điều kiện KHÔNG áp dụng:** Chuyển hướng vào trang thanh toán hoặc khi tải dữ liệu bị lỗi.
- **Reduced-motion Alternative:** Chuyển trang tiêu chuẩn của Next.js (Hard navigation) kết hợp skeleton loader mờ dần.
- **Keyboard / Touch Behavior:** Duy trì tiêu điểm (focus retention) tại nút "Đặt vé" hoặc tiêu đề chính của trang mới.
- **Rủi ro & Phòng tránh:** Cần cơ chế hủy (cancellation fallback) nếu route đích phản hồi chậm; không khóa giao diện người dùng (never block UI thread).

---

### Pattern 08 — Contextual Micro-interaction
- **Tên gọi & Bản chất:** Phản hồi vi mô theo ngữ cảnh (Contextual Micro-interaction). Các phản hồi vật lý cực nhanh khi người dùng tương tác trực tiếp lên các điểm điều khiển nghiệp vụ.
- **Mục đích UX:** Đem lại cảm giác bấm cơ học sắc bén, chính xác và đáng tin cậy.
- **Trigger:** Click chuột, tap ngón tay, hover qua nút bấm, chọn ghế.
- **Phần tử tham gia:** Nút CTA, ô chọn ghế (Seat icon), nút tăng giảm combo bắp nước, chip chọn giờ chiếu.
- **Hướng & Thuộc tính biến đổi:**
  - Active press: `transform: scale(0.97)` trong `80ms`.
  - Seat selected: `transform: scale(1.08) -> scale(1.0)` trong `150ms`, nền chuyển thành `--color-rosso-corsa: #da291c`.
  - Focus visible: Viền đỏ `2px solid #da291c` xuất hiện với `outline-offset: 2px`.
- **Timing & Duration (Proposed):** `100ms – 160ms`.
- **Easing Character:** `cubic-bezier(0.25, 1, 0.5, 1)`.
- **Choreography:** Phản hồi tức thì ngay tại thời điểm chạm; không có độ trễ (zero delay).
- **Điều kiện áp dụng:** Tất cả các bề mặt tương tác trên cả 4 ứng dụng.
- **Điều kiện KHÔNG áp dụng:** Không có ngoại lệ; mọi control tương tác đều cần phản hồi trạng thái.
- **Reduced-motion Alternative:** Bỏ hiệu ứng co giãn `scale`, chỉ thay đổi màu nền hoặc viền với thời lượng `0ms`.
- **Keyboard / Touch Behavior:** Hoạt động hoàn hảo với phím `Space` và `Enter`.
- **Rủi ro & Phòng tránh:** Thời lượng quá dài (>200ms) sẽ khiến giao diện có cảm giác ì ạch, bám dính.

---

### Pattern 09 — Staggered Content Reveal
- **Tên gọi & Bản chất:** Xuất hiện so le nhịp nhàng (Staggered Content Reveal). Một danh sách các phần tử xuất hiện lần lượt với độ trễ ngắn giữa các mục liên tiếp.
- **Mục đích UX:** Giúp mắt người dùng quét qua danh mục một cách có trật tự, tránh cảm giác một khối dữ liệu lớn ập vào màn hình cùng lúc.
- **Trigger:** Dữ liệu API vừa tải xong, hoặc mở danh sách chọn rạp/suất chiếu.
- **Phần tử tham gia:** Thẻ danh sách phim, danh sách rạp (Cinema Cards), danh sách vé trong My Tickets (S20).
- **Hướng & Thuộc tính biến đổi:** `opacity: 0 -> 1`; `transform: translateY(12px) -> translateY(0px)`.
- **Timing & Duration (Proposed):** Mỗi phần tử chạy trong `220ms`; độ trễ so le (stagger delay) là `35ms` giữa các phần tử liên tiếp.
- **Easing Character:** `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Choreography:** Tối đa áp dụng so le cho 6–8 phần tử đầu tiên trong khung nhìn; các phần tử phía dưới xuất hiện đồng loạt để tránh chờ đợi lâu.
- **Điều kiện áp dụng:** Kết quả tìm kiếm (S02), danh sách thông báo (S29), danh sách voucher (S21).
- **Điều kiện KHÔNG áp dụng:** Sơ đồ 64 ghế phòng chiếu (tất cả các ghế phải hiển thị đồng thời để đảm bảo công bằng khi săn vé).
- **Reduced-motion Alternative:** Toàn bộ danh sách xuất hiện cùng lúc với `opacity: 1`, không có độ trễ so le.
- **Keyboard / Touch Behavior:** Người dùng có thể dùng phím mũi tên duyệt qua các mục ngay lập tức mà không cần chờ hiệu ứng kết thúc.
- **Rủi ro & Phòng tránh:** Độ trễ so le quá lớn (>50ms) sẽ gây sốt ruột cho người dùng khi danh sách có nhiều mục.

---

### Pattern 10 — Ambient Motion
- **Tên gọi & Bản chất:** Chuyển động không gian tĩnh lặng (Ambient Motion). Các chuyển động nền tinh tế, chu kỳ tuần hoàn chậm rãi, mô phỏng luồng ánh sáng trong rạp chiếu phim tối.
- **Mục đích UX:** Tạo chiều sâu nghệ thuật và không khí điện ảnh mà không làm phân tán sự chú ý vào thông tin chính.
- **Trigger:** Tự động kích hoạt khi màn hình ở trạng thái nhàn rỗi (idle).
- **Phần tử tham gia:** Quầng sáng nền tiêu điểm (Backdrop Ambient Glow) phía sau poster, hiệu ứng breathing vi mô của logo Buaa AI.
- **Hướng & Thuộc tính biến đổi:** `opacity: 0.25 <-> 0.45` theo chu kỳ hình sin; `transform: scale(1.0) <-> scale(1.03)`.
- **Timing & Duration (Proposed):** Chu kỳ cực dài `4000ms – 6000ms` lặp vô tận (`infinite alternate`).
- **Easing Character:** `cubic-bezier(0.45, 0.05, 0.55, 0.95)` (Smooth sine ease).
- **Choreography:** Chạy độc lập ở tầng nền sâu nhất (z-index thấp); lập tức dừng hoặc ẩn đi khi người dùng cuộn trang hoặc mở modal.
- **Điều kiện áp dụng:** Trang chủ Hero panel, màn hình chờ Buaa AI.
- **Điều kiện KHÔNG áp dụng:** Toàn bộ quy trình đặt vé, thanh toán, quản trị.
- **Reduced-motion Alternative:** Tắt hoàn toàn animation; giữ quầng sáng ở độ mờ cố định `opacity: 0.3`.
- **Keyboard / Touch Behavior:** Không bắt sự kiện chuột/chạm (`pointer-events: none`).
- **Rủi ro & Phòng tránh:** Có thể gây hao pin nếu chạy bằng JavaScript; bắt buộc thực thi bằng thuần CSS `@keyframes` trên GPU layer.

---

## 5. Ma Trận Ánh Xạ Màn Hình Nghiệp Vụ (Screen-to-Motion Allocation Matrix)

Bảng đối chiếu cụ thể giữa mã màn hình (Figma/Code IDs), hướng thị giác, pattern chuyển động và các ràng buộc nghiệp vụ:

| Màn hình (Screen ID / Route) | Định hướng thị giác | Motion Patterns áp dụng | Mục đích tương tác | Cường độ (Intensity) | Ràng buộc nghiệp vụ & Kỹ thuật | Phương thức kiểm chứng |
|---|---|---|---|---|---|---|
| **S01 — Discovery & Homepage** (`/`) | Cinematic Editorial tràn viền, phân cấp chữ mạnh mẽ, không gian đen sâu | `01`, `02`, `03`, `05`, `06`, `10` | Cuốn hút người xem vào các phim đang chiếu và rạp nổi bật | **Level 3 (Expressive)** | Không scroll-hijacking; giữ tốc độ cuộn tự nhiên của hệ điều hành | Kiểm tra FPS khi cuộn màn hình trên thiết bị di động và desktop |
| **S02 — Search & Movie Listing** (`/search`, `/movies`) | Lưới biên tập tối giản, bộ lọc dạng chip sắc nhọn, tương phản cao | `04`, `05`, `08`, `09` | Lọc nhanh theo rạp, thể loại, ngày chiếu; phản hồi kết quả tức thì | **Level 2 (Restrained)** | FLIP animation cho danh sách lọc; không trễ hơn 100ms sau thao tác | Kiểm tra độ trễ khi chuyển facet lọc và điều hướng bàn phím |
| **S03 — Buaa AI Workspace** (`/chat`) | Không gian kỹ thuật đen mờ, tối giản chrome viền, điểm nhấn đỏ Rosso Corsa | `05`, `08`, `10` | Hội thoại tự nhiên; streaming văn bản và thẻ gợi ý phim mượt mà | **Level 2 (Restrained)** | AI Agent KHÔNG tự bịa đặt xác nhận vé; thẻ gợi ý hiển thị trạng thái chuẩn | Kiểm tra không giật lag khi stream text liên tục cùng thẻ nhúng |
| **S06 — Movie Details & Trailers** (`/movies/:id`) | Poster tiêu điểm lớn, nghệ thuật sắp chữ Kinetic, bảng lịch chiếu rõ ràng | `01`, `02`, `06`, `07`, `08` | Dẫn dắt người xem từ poster, trailer đến quyết định chọn suất chiếu | **Level 3 (Expressive)** | Giữ khả năng truy cập nhanh vào bảng giờ chiếu mà không bị cản trở bởi video | Kiểm tra thời gian tải poster và tính liên tục khi xem trailer |
| **S08 — Booking & Seat Selection** (`/booking/:showtimeId`) | Sơ đồ phòng chiếu sắc nét, hình học 0px, màu trạng thái rõ ràng (Standard, VIP, Sweetbox) | `08` (Contextual Micro-interaction) | Chọn ghế chính xác tuyệt đối; hiển thị đồng hồ đếm ngược giữ vé 5 phút | **Level 2 (Restrained)** | TUYỆT ĐỐI KHÔNG làm trễ phản hồi chọn ghế; đồng hồ TTL đếm chính xác từng giây | Kiểm tra phản hồi bấm ghế <50ms; kiểm tra đồng hồ hold không bị đơ |
| **S11 — Checkout & Order Review** (`/checkout`) | Tối giản, tập trung thông tin, độ tương phản đọc số tiền và combo cực cao | `08` | Rà soát thông tin vé, áp dụng voucher, chọn cổng thanh toán MoMo/VNPAY | **Level 1 (Minimal)** | Ưu tiên tốc độ và sự an tâm; các nút tăng giảm combo phản hồi cơ học sắc bén | Kiểm tra độ rõ ràng của từng dòng tiền và khả năng hủy đơn an toàn |
| **S12 — Payment Processing** (`/checkout/processing`) | Trạng thái kỹ thuật nghiêm cẩn, thanh tiến trình phẳng, không màu mè | `08` | Trấn an người dùng trong lúc chờ phản hồi xác thực từ cổng thanh toán | **Level 1 (Minimal)** | Không dùng spinner xoay tròn generic; hiển thị tiến trình xác thực rõ ràng | Kiểm tra xử lý timeout và thông báo lỗi minh bạch khi cổng ngắt |
| **S13 — Payment Success** (`/checkout/success`) | Trang trọng, đĩnh đạc; hé lộ vé điện tử như một chứng nhận sở hữu | `02` (Mask Reveal), `08` | Chúc mừng giao dịch thành công và dẫn lối tới vé điện tử | **Level 1 (Minimal)** | CHỈ HIỂN THỊ khi Cinema Core gửi mã xác nhận có chữ ký số hợp lệ | Kiểm tra không render vé giả khi chưa có webhook xác thực từ Core |
| **S14 — Payment Failed** (`/checkout/failure`) | Cảnh báo rõ ràng với Rosso Corsa `#da291c`, cung cấp lối thoát khắc phục | `08` | Giải thích lý do thất bại (hết hạn hold, lỗi thẻ) và nút thử lại | **Level 1 (Minimal)** | Không làm người dùng bế tắc; giữ ghế nếu hold còn hạn hoặc giải phóng nếu hết | Kiểm tra nút "Thử lại thanh toán" và "Chọn lại suất chiếu" hoạt động chuẩn |
| **S16 — Electronic Ticket (E-Ticket)** (`/tickets/:id`) | Thiết kế dạng thẻ vé điện ảnh sang trọng, mã QR độ tương phản cao | `02`, `05`, `08` | Xuất trình mã QR tại rạp nhanh chóng, dễ quét qua máy đọc vé | **Level 1 (Minimal)** | Mã QR hiển thị sắc nét tức thì; không áp dụng animation làm méo mã QR | Kiểm tra độ tương phản mã QR đạt chuẩn để máy quét rạp đọc được |
| **S20 — My Bookings / My Tickets** (`/my-tickets`) | Danh sách vé đã mua có phân loại trạng thái (Sắp xem, Đã xem, Đã hủy) | `08`, `09` | Tra cứu lịch sử đặt vé và mở nhanh vé điện tử | **Level 2 (Restrained)** | Phân biệt rõ ràng vé hợp lệ với vé đã hết hạn hoặc đã soát | Kiểm tra tải trang danh sách vé và điều hướng mở chi tiết vé |
| **S17 / S18 — Cinema Directory & Details** (`/cinemas`, `/cinemas/:id`) | Hình ảnh sảnh rạp sang trọng, thông tin địa chỉ và danh sách phòng chiếu | `01`, `05`, `08` | Giúp người xem chọn cụm rạp phù hợp và xem đường đi | **Level 2 (Restrained)** | Bản đồ và danh sách phòng chiếu bố trí khoa học, dễ đọc | Kiểm tra khả năng mở liên kết bản đồ và tải ảnh phòng chiếu |
| **S22A / S22B — Movie Trailers & Photo Gallery** | Mosaic 5 cột bất đối xứng, video player tối giản viền | `01`, `02`, `05` | Chiêm ngưỡng hình ảnh hậu trường và trailer độ phân giải cao | **Level 3 (Expressive)** | Mở rộng ảnh mượt mà trong không gian phẳng; không làm đứng trình duyệt | Đo kiểm FPS khi cuộn qua lưới mosaic 15 ảnh lớn |
| **S27 — Profile & CinePreferences** (`/profile`) | Form quản trị cá nhân sắc gọn, các chip chọn sở thích (IMAX, Sweetbox...) | `08` | Cập nhật thông tin tài khoản và sở thích xem phim | **Level 2 (Restrained)** | Lưu trữ tùy chọn chính xác; phản hồi thông báo thành công tức thì | Kiểm tra validation form và lưu preferences cho Buaa AI |
| **S30 / S31 — Authentication Flow** (`/auth/login`, `/auth/register`) | Phân đôi màn hình: Trái là backdrop điện ảnh tĩnh, Phải là form tối giản | `08` | Đăng nhập/Đăng ký an toàn, nhập mã OTP xác thực | **Level 1 (Minimal)** | Không có animation thừa ở form; trường mật khẩu và OTP rõ ràng, bảo mật | Kiểm tra autofocus, xử lý lỗi sai mật khẩu và đếm ngược gửi lại OTP |
| **Organizer Web & Mobile** (`apps/organizer-*`) | Mật độ thông tin cao (High Density), bảng biểu sắc gọn, thanh trạng thái phòng | `08` | Quản lý suất chiếu, soát vé tại rạp, theo dõi doanh thu | **Level 1 (Minimal)** | Nghiêm cấm các hiệu ứng Expressive; tập trung 100% vào tốc độ xử lý | Kiểm tra tốc độ mở trang, quét camera QR và thao tác bảng dữ liệu |
| **Customer Mobile Native** (`apps/customer-mobile`) | Giao diện Native iOS/Android, cử chỉ chạm mượt mà, lưu vé offline | `05`, `08` | Trải nghiệm đặt vé và xuất trình vé QR khi không có sóng mạng | **Level 2 (Restrained)** | Thao tác cử chỉ bản địa (swipe back, pull to refresh); không ép layout DOM | Kiểm tra render vé offline từ bộ nhớ mã hóa và thao tác chạm ngón tay |

---

## 6. Đề Xuất Token Chuyển Động (Proposed Motion Tokens)

> [!NOTE]
> Các giá trị dưới đây được định nghĩa dưới dạng **đề xuất kỹ thuật (Proposed Tokens)** nhằm chuẩn hóa mã nguồn khi bước vào giai đoạn thiết kế và tạo mẫu. Các giá trị này sẽ được kiểm chứng và tinh chỉnh qua prototype thực tế trước khi chính thức sáp nhập vào `@platform/design-tokens`.

### 6.1 Thời lượng (Duration Tokens)

```css
/* Proposed Motion Duration Tokens */
--motion-duration-instant: 0ms;      /* Cho reduced-motion hoặc cập nhật trạng thái dữ liệu */
--motion-duration-micro: 120ms;      /* Phản hồi chạm, active scale, toggle nút */
--motion-duration-fast: 180ms;       /* Hover viền, dropdown bung mở, tooltip */
--motion-duration-normal: 280ms;     /* Chuyển tab, lọc danh sách, modal bung */
--motion-duration-expressive: 450ms; /* Chuyển cảnh Hero, mask reveal, layout transition */
--motion-duration-cinematic: 650ms;  /* Mở màn trang chủ, kinetic typography */
--motion-duration-ambient: 5000ms;   /* Chu kỳ breathing của ánh sáng nền */
```

### 6.2 Đường cong gia tốc (Easing Tokens)

```css
/* Proposed Motion Easing Tokens */
--motion-ease-standard: cubic-bezier(0.2, 0, 0, 1);       /* Mặc định cho mọi tương tác thông thường */
--motion-ease-decelerate: cubic-bezier(0.16, 1, 0.3, 1);  /* Vào khung nhìn êm ái (Enter viewport) */
--motion-ease-accelerate: cubic-bezier(0.4, 0, 1, 1);    /* Rời khung nhìn dứt khoát (Exit viewport) */
--motion-ease-cinematic: cubic-bezier(0.25, 1, 0.5, 1);   /* Mặt nạ điện ảnh, hé lộ poster */
--motion-ease-spring-press: cubic-bezier(0.25, 1, 0.5, 1);/* Cảm giác bấm cơ học sắc nét */
```

### 6.3 Thông số Spring tham khảo (Dành cho Mobile Native / Prototyping)
- **Tương tác nút bấm / Ghế:** `mass: 1, tension: 350, friction: 25` (Nảy nhẹ, dừng nhanh, không rung lắc thừa).
- **Hộp thoại Modal / Bottom Sheet:** `mass: 1, tension: 280, friction: 30` (Dừng đĩnh đạc, mượt mà).

---

## 7. Rào Cản Kỹ Thuật & Hiệu Năng (Performance & Engineering Guardrails)

1. **Quy tắc Composite-Only:**
   - Chỉ chuyển động trên `transform` và `opacity`.
   - Cấm chuyển động trên: `width`, `height`, `top`, `bottom`, `left`, `right`, `margin`, `padding`, `border-width`, `font-size`, `filter: blur()`.
   - Nếu cần thay đổi kích thước thẻ (như ô mosaic), biến đổi bằng `transform: scale()` hoặc tính toán trước bằng FLIP.
2. **Kỷ luật `will-change`:**
   - Không khai báo `will-change: transform` cố định vĩnh viễn trong CSS của các phần tử tĩnh.
   - Chỉ gắn `will-change` ngay trước khi chuyển động bắt đầu (ví dụ: khi nhận tín hiệu hover hoặc chuẩn bị cuộn) và gỡ bỏ ngay khi hoàn tất animation để giải phóng bộ nhớ VRAM của GPU.
3. **Ngân sách khung hình 60fps:**
   - Tổng thời gian thực thi JavaScript cho một khung hình chuyển động không được vượt quá **10ms** (dành 6.6ms còn lại cho trình duyệt tổng hợp và vẽ).
   - Kiểm tra bằng Performance Profiler trong Chrome DevTools trên giả lập CPU chậm 4x (4x CPU throttling).
4. **Xử lý ngắt quãng (Interruption & Cancellation):**
   - Khi người dùng nhấp đúp nhanh, chuyển tab liên tục hoặc đổi hướng cuộn trang đột ngột, chuyển động đang chạy phải có khả năng hủy bỏ hoặc hoàn tất ngay lập tức. Tuyệt đối không để phần tử rơi vào trạng thái lơ lửng giữa chừng (stuck state).
5. **Dọn dẹp tài nguyên (Resource Cleanup):**
   - Tất cả các vòng lặp animation (`requestAnimationFrame`) hoặc lắng nghe sự kiện (`ResizeObserver`, `IntersectionObserver`) phải được dọn dẹp sạch sẽ khi component unmount.

---

## 8. Tiêu Chuẩn Khả Năng Tiếp Cận Chuyển Động (Motion Accessibility)

1. **Tuân thủ WCAG 2.3.1 (Three Flashes or Below Threshold):**
   - Tuyệt đối không có bất kỳ hiệu ứng nhấp nháy, chớp sáng hoặc đảo màu nào vượt quá 3 lần trong một giây.
2. **Tuân thủ WCAG 2.2.2 (Pause, Stop, Hide):**
   - Mọi chuyển động ambient hoặc video trailer tự động chạy nền phải có cơ chế tạm dừng rõ ràng hoặc tự động tắt khi người dùng không tương tác trực tiếp vào vùng đó.
3. **Thực thi `prefers-reduced-motion`:**
   - Khi hệ điều hành bật chế độ giảm chuyển động, toàn bộ hệ thống CSS tự động chuyển các thuộc tính `animation-duration` và `transition-duration` về giá trị không đáng kể (`0.01ms` hoặc `0ms`).
   - Mọi thông tin, nhãn, dữ liệu và trạng thái phải hiển thị đầy đủ ngay lập tức mà không cần bất kỳ bước chuyển tiếp thị giác nào.
4. **Bảo tồn tiêu điểm điều hướng bàn phím (Keyboard Focus Ring):**
   - Đường viền focus (`outline: 2px solid #da291c`) phải luôn hiển thị sắc nét, không bị làm mờ, không bị che khuất bởi mặt nạ animation và không bị trễ theo sau chuyển động.

---

## 9. Kỷ Luật Phụ Thuộc (Zero Unapproved Dependencies)

Theo quy định tại mục 2.3 của [`.agents/rules/ui-skill-routing.md`](../../.agents/rules/ui-skill-routing.md), **tuyệt đối không được tự ý cài đặt thêm thư viện animation** (Framer Motion, Motion, GSAP, Lenis...) nếu chưa có phê duyệt chính thức từ Chủ sản phẩm. Hệ thống ưu tiên tối đa việc sử dụng thuần CSS `@keyframes` / transitions và API chuyển động bản địa của từng nền tảng nhằm giữ bundle size nhẹ và bảo đảm hiệu năng 60fps.

---

## 10. Tiêu Chí Nghiệm Thu Chuyển Động (Acceptance Criteria)

Trước khi nghiệm thu bất kỳ giao diện nào có chuyển động, phải thỏa mãn danh mục kiểm tra:
- [ ] Chuyển động thuộc đúng 1 trong 4 nhóm taxonomy và tuân thủ mức cường độ của màn hình.
- [ ] Chỉ sử dụng `transform` và `opacity`.
- [ ] Không gây sụt giảm khung hình dưới 55fps khi kiểm tra trên thiết bị tiêu chuẩn.
- [ ] Hoạt động trơn tru khi người dùng bật `prefers-reduced-motion: reduce`.
- [ ] Không làm trễ hoặc che khuất các thông tin giao dịch, chọn ghế, hold timer và thanh toán.
- [ ] Điều hướng bàn phím qua Tab/Enter phản hồi ngay lập tức, tiêu điểm nhìn thấy rõ ràng.
