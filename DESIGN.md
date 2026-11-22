---
name: movie-booking-design-system
version: 2.0.0
description: "Production-grade design system for Movie Booking Platform based on Ferrari Dark Cinema — Cinematic Kinetic Editorial direction."

colors:
  primary: "#da291c"
  on-primary: "#ffffff"
  primary-hover: "#9d2211"
  canvas: "#000000"
  surface-1: "#181818"
  surface-2: "#303030"
  hairline: "#303030"
  semantic-success: "#2e7d5b"
  semantic-warning: "#d97706"
  semantic-danger: "#da291c"
---

# Movie Booking Platform — Design System & Visual Authority

> **Design Statement:**  
> *"A premium cinematic booking experience that combines editorial minimalism, spatial choreography, immersive storytelling and intentional motion. Every visual element should feel purposefully directed, while transactional interactions remain clear, accessible and reliable."*

**Định hướng thẩm mỹ:** **CINEMATIC KINETIC EDITORIAL (Motion-Led Cinema Experience)**  
**Nền tảng nhận diện:** **Ferrari Dark Cinema**  
**Quyền sở hữu (Canonical Owner):** Tệp tài liệu này là nguồn thẩm quyền tối cao (Single Source of Truth) về bản sắc thị giác, bảng màu, thang đo kiểu chữ, hình học và quy chuẩn bố cục cho toàn bộ hệ sinh thái Movie Booking Platform, bao gồm bốn ứng dụng Customer Web, Customer Mobile, Organizer Web và Organizer Mobile theo [ADR-0002](docs/06-decisions/0002-customer-organizer-app-boundaries.md).

---

## 1. Bản Sắc Cốt Lõi (Core Aesthetic DNA & Personality)

### 1.1 7 Trụ Cột Thẩm Mỹ (Core Aesthetic DNA)
1. **Editorial Minimalism (Tối giản Biên tập):** Typography có phân cấp mạnh mẽ, khoảng trắng âm tính (negative space) rộng lớn, bố cục giàu tính tạp chí điện ảnh sang trọng.
2. **Cinematic Storytelling (Kể chuyện Điện ảnh):** Hình ảnh poster, trailer và nội dung được tổ chức thành các phân cảnh (scenes) có nhịp điệu, dẫn dắt cảm xúc người xem từ tò mò đến hào hứng đặt vé.
3. **Kinetic Typography (Chữ Chuyển động):** Chữ không chỉ là khối văn bản tĩnh mà tham gia trực tiếp vào nhịp điệu thị giác với các hiệu ứng hé lộ dòng (staggered reveal) dứt khoát.
4. **Spatial Choreography (Dàn dựng Không gian):** Các phần tử nội dung di chuyển và biến đổi vị trí trong không gian tọa độ có chủ đích, tạo sự liền mạch thị giác qua các bước duyệt phim.
5. **Premium Product Showcase (Tôn vinh Sản phẩm Điện ảnh):** Poster phim, khung hình tĩnh (still frame), phòng chiếu cao cấp và chiếc vé điện tử QR được đặt vào vị trí tâm điểm tuyệt đối của bố cục.
6. **Layered Minimalism (Tối giản Đa tầng):** Giao diện phẳng, tinh giản nhưng sở hữu chiều sâu quang học thông qua xếp tầng tông màu tối (#000000 -> #181818 -> #303030) và các đường viền hairline 1px, tuyệt đối không dùng bóng đổ giả (no drop-shadows).
7. **Purposeful Micro-interactions (Tương tác Vi mô Có chủ đích):** Mọi thao tác chạm, hover, bấm chọn ghế hay thanh toán đều mang phản hồi cơ học tức thời, sắc bén và tin cậy.

### 1.2 Tính Cách Thương Hiệu (Personality)
- **Premium, không phô trương:** Sang trọng, đĩnh đạc, thể hiện đẳng cấp qua tỷ lệ và khoảng trắng thay vì chi tiết trang trí rườm rà.
- **Cinematic, không lạm dụng hiệu ứng:** Mọi chuyển động mang nhịp thở của một bộ phim điện ảnh kinh điển; không có chuyển động thừa.
- **Expressive nhưng có kiểm soát:** Sống động ở các trang khám phá (Discovery/Hero), nhưng lập tức thu gọn nghiêm cẩn khi bước vào luồng giao dịch.
- **Sharp thay vì soft/rounded:** Duy trì triệt để hình học góc nhọn `0px border-radius` làm nhận diện cốt lõi; cấm bo tròn mềm yếu làm mất chất điện ảnh.
- **Immersive nhưng không gây rối:** Đắm chìm trong hình ảnh nhưng cấu trúc phân cấp thông tin luôn sáng rõ, dễ đọc.
- **Art-directed, không giống generic SaaS:** Mang dấu ấn dàn dựng mỹ thuật độc bản, tách biệt hoàn toàn khỏi các mẫu dashboard hành chính cứng nhắc.
- **Dynamic nhưng ổn định trong giao dịch:** Chuyển động dẫn dắt cảm xúc, nhưng các luồng chọn ghế, đếm ngược giữ vé và thanh toán luôn tĩnh tại, minh bạch, chính xác tuyệt đối.

### 1.3 Quy Tắc Nghiêm Cấm Tuyệt Đối (Anti-Slop & Anti-Gimmick Rules)
- ❌ **CẤM** phong cách AI-generated generic: Không dùng ảnh minh họa 3D cartoon, không dùng các khối shape trôi nổi vô nghĩa.
- ❌ **CẤM** bố cục SaaS rập khuôn: Không áp dụng máy móc lưới dashboard nhiều cột vụn vặt cho các trang trải nghiệm phim.
- ❌ **CẤM** lưới card lặp lại vô hồn: Lưới phim phải có nhịp điệu biên tập (xen kẽ card lớn tiêu điểm, ô mosaic hoặc dải ngang).
- ❌ **CẤM** dải màu gradient tím/xanh: Chỉ sử dụng các tông màu đơn sắc đen, xám, trắng và đỏ Rosso Corsa.
- ❌ **CẤM** hiệu ứng kính mờ đại trà (generic glassmorphism) và viền phát sáng neon/cyberpunk lòe loẹt.
- ❌ **CẤM** cướp quyền cuộn chuột (Scroll Hijacking) và các hiệu ứng parallax quá đà gây say chuyển động.
- ❌ **CẤM** chữ quá nhỏ (<11px) trên các màn hình thanh toán, chọn ghế hoặc thông tin vé.
- ❌ **CẤM** hy sinh khả năng tiếp cận (Accessibility WCAG AA) và độ tương phản chữ chỉ để lấy hiệu ứng thị giác.

---

## 2. Bảng Màu Chuẩn (Color System & Tokens)

Hệ thống màu sắc kế thừa nguyên vẹn bản sắc **Ferrari Dark Cinema** với nền đen Carbone Nero chủ đạo và sắc đỏ Rosso Corsa làm điểm ngắt thị giác:

### 2.1 Bảng Màu Nhận Diện & Bề Mặt

| Tên màu | Giá trị Hex | Token CSS | Vai trò trong hệ sinh thái |
|---|---|---|---|
| **Rosso Corsa** | `#da291c` | `--color-rosso-corsa` | Màu đỏ tín hiệu biểu tượng. Dùng cho trạng thái Hover, Focus visible, Active của nút CTA, ghế đang chọn, hoặc viền tiêu điểm. **Tuyệt đối không dùng làm màu nền tràn lan**. |
| **Rosso Scuro** | `#9d2211` | `--color-rosso-scuro` | Đỏ thẫm hỗ trợ cho trạng thái Active/Pressed sâu hoặc viền cảnh báo phụ. |
| **Bianco Ferrari**| `#ffffff` | `--color-bianco-ferrari`| Màu chữ chính trên nền tối, biểu tượng, đường kẻ tương phản cao, và mã QR vé điện tử. |
| **Carbone Nero** | `#000000` | `--color-carbone-nero` | Nền canvas chính, khoảng không điện ảnh vô tận phía sau hình ảnh và video. |
| **Notte Profonda**| `#181818` | `--color-notte-profonda`| Nền bề mặt tầng 1: Thẻ nội dung, thanh điều hướng nổi, footer và khung modal. |
| **Grafite** | `#303030` | `--color-grafite` | Nền bề mặt tầng 2 và đường viền phân tách mỏng (hairline divider 1px). |
| **Fumo** | `#8f8f8f` | `--color-fumo` | Màu chữ phụ, nhãn phụ đề, thông tin thời lượng và thể loại phim. |
| **Piombo** | `#666666` | `--color-piombo` | Chữ gợi ý mờ (placeholder), đường kẻ thứ cấp, trạng thái vô hiệu hóa (disabled). |
| **Argento Chiaro**| `#d2d2d2` | `--color-argento-chiaro`| Đường viền sáng hoặc trạng thái hover trên các bề mặt xám nhạt. |
| **Velo di Luce** | `#f7f7f7` | `--color-velo-di-luce` | Vệt sáng rất nhẹ trên bề mặt sáng (khi có nhu cầu tương phản đặc biệt). |
| **Cemento** | `#ebebeb` | `--color-cemento` | Nền tương phản nhẹ cho các tài liệu hoặc hóa đơn in ấn. |

### 2.2 Bảng Màu Chức Năng Nghiệp Vụ (Semantic Functional Tokens)

Áp dụng nghiêm ngặt cho các phản hồi giao dịch và trạng thái nghiệp vụ (Success, Warning, Error) theo quyết định ngày 08/11/2026. Không dùng làm màu thương hiệu trang trí:

| Trạng thái | Tên màu | Giá trị Hex | Token CSS | Ứng dụng nghiệp vụ cụ thể |
|---|---|---|---|---|
| **Success** | Verde Semantic | `#2e7d5b` | `--color-success` | Biểu tượng xác nhận thành công, nhãn `CONFIRMED`/`ISSUED`, ghế đã đặt của tôi. |
| **Success Bg**| Verde Profondo | `#0d281e` | `--color-success-bg`| Nền chìm cho badge trạng thái vé thành công hoặc thông báo hoàn tất. |
| **Warning** | Ambra Avviso | `#d97706` | `--color-warning` | Cảnh báo thời gian giữ vé sắp hết (<2 phút), lưu ý suất chiếu đặc biệt. |
| **Error** | Rosso Corsa | `#da291c` | `--color-error` | Thất bại thanh toán (Payment Failed), lỗi hệ thống, vé bị hủy hoặc hết hạn. |

---

## 3. Hệ Thống Kiểu Chữ Biên Tập 8 Tầng (8-Level Typography Architecture)

Hệ thống kiểu chữ được nâng cấp toàn diện từ giới hạn ban đầu (vốn chỉ có 11-13px cho body và 16px cho headline từ bản scrape tham khảo Ferrari). Hệ thống mới tách bạch rõ ràng giữa **Typography mang tính nhận diện biên tập** và **Typography phục vụ giao dịch**:

```
[Level 1] Brand / Editorial Display (48px - 64px) — Kinetic & Showpiece
[Level 2] Hero Headline (32px - 40px) — Scene Title
[Level 3] Section Heading (20px - 24px) — Curated Collections
[Level 4] Movie Title (16px - 18px) — Card & Catalog Typography
[Level 5] Functional UI Heading (14px - 16px) — Dialogs & Steppers
[Level 6] Body Copy (13px - 14px) — Synopses & Editorial Prose
[Level 7] Metadata / Caption (11px - 12px) — Uppercase Tracked Labels
[Level 8] Form Labels & Micro-copy (11px - 12px) — Input Fields & Notes
```

### 3.1 Bảng Phân Cấp Typography Chi Tiết

| Tầng cấp | Vai trò | Cỡ chữ (Size) | Line Height | Tracking (Letter Spacing) | Weight | Case | Phông chữ áp dụng |
|---|---|---|---|---|---|---|---|
| **Level 1** | **Brand / Editorial Display** | 48px – 64px | 1.05 – 1.15 | -0.02em đến 0.0em | 700 / 800 | Uppercase hoặc Title Case | Roboto Slab / Display Sans |
| **Level 2** | **Hero Headline** | 32px – 40px | 1.15 – 1.25 | -0.01em đến 0.02em | 600 / 700 | Title Case | Inter / Display Sans |
| **Level 3** | **Section Heading** | 20px – 24px | 1.25 – 1.35 | 0.02em đến 0.04em | 600 | Title Case / Uppercase | Inter |
| **Level 4** | **Movie Title** | 16px – 18px | 1.30 – 1.40 | 0.02em | 600 | Title Case | Inter |
| **Level 5** | **Functional UI Heading** | 14px – 16px | 1.40 | 0.04em | 500 / 600 | Uppercase hoặc Sentence Case | Inter |
| **Level 6** | **Body Copy** | 13px – 14px | 1.60 – 1.78 | 0.015em | 400 | Sentence Case | Inter |
| **Level 7** | **Metadata / Caption** | 11px – 12px | 1.50 – 1.78 | 0.08em đến 0.091em | 400 / 500 | **Uppercase toàn bộ** | Inter |
| **Level 8** | **Form Labels & Micro** | 11px – 12px | 1.40 | 0.05em | 500 | Uppercase hoặc Sentence Case | Inter |

### 3.2 Triết Lý Typography (Typography Philosophy)
- **Quy tắc Tracking nghịch đảo (Inverted Tracking Rule):** Cỡ chữ càng nhỏ, khoảng cách giữa các ký tự (letter-spacing) càng phải nới rộng. Các nhãn 11px–12px bắt buộc sử dụng chữ in hoa (uppercase) kèm tracking rộng (`0.08em – 0.091em`) để tạo độ thở và giọng nói nhận diện đặc trưng.
- **Tính toàn vẹn tiếng Việt (Vietnamese Diacritics Integrity):** Phông chữ hệ thống bắt buộc sử dụng bộ glyph hỗ trợ tiếng Việt đầy đủ (dấu thanh, mũ sắc gọn, không bị lỗi dính dấu vào dòng trên). Inter và Roboto Slab đáp ứng hoàn hảo tiêu chuẩn này.
- **Độ tương phản đọc (Readability Invariant):** Không bao giờ dùng màu xám quá tối (<`#8f8f8f`) cho văn bản nội dung trên nền đen. Body text luôn duy trì độ tương phản >= 4.5:1 đạt chuẩn WCAG AA.

---

## 4. Bố Cục Biên Tập & Nhịp Điệu Thị Giác (Editorial Layout & Pacing)

### 4.1 Hệ Thống Khung Bố Cục (Layout Canvas)
- **Độ rộng khung nhìn tiêu chuẩn:**
  - Khung nội dung tập trung (Contained Frame): `--page-max-width: 1440px` — dành cho các trang quản lý tài khoản, form thanh toán, hoặc bảng quản trị Organizer.
  - Khung điện ảnh mở rộng (Wide Cinema Canvas): `--page-max-width: 1760px` — dành cho trang chủ khám phá (S01), phòng tranh mosaic (S22B) và thư viện phim.
  - Phân đoạn tràn viền (Full-Bleed 100vw): Các banner Hero, ảnh nền phòng chiếu và dải phân cách điện ảnh vươn tới tận 2 mép màn hình.
- **Khoảng đệm trang (Page Padding):**
  - Desktop (>1024px): `48px` (hoặc `64px` trên màn hình siêu rộng).
  - Tablet (768px – 1023px): `32px`.
  - Mobile (<768px): `16px` đến `20px`.

### 4.2 Nguyên Tắc Cân Bằng Bất Đối Xứng (Asymmetric Composition)
- Không rải đều các card phim thành các ô vuông bằng chằn chặn.
- Sử dụng bố cục tạp chí: 1 phim tiêu điểm lớn bên trái chiếm 60% chiều ngang, kết hợp danh sách suất chiếu hoặc phim liên quan chiếm 40% bên phải.
- Điểm neo thị giác (Focal Points): Luôn có một tâm điểm thị giác dẫn dắt ánh nhìn trong mỗi khung cuộn màn hình.

### 4.3 Mật Độ Thông Tin Theo Màn Hình (Density by Screen Type)
- **Expressive Density (Thoáng đãng, nhiều khoảng trắng):** Trang chủ (S01), Chi tiết phim (S06), Bộ sưu tập rạp (S18).
- **Functional Density (Vừa phải, tập trung):** Sơ đồ chọn ghế (S08), Buaa AI Workspace (S03), Trang cá nhân (S27).
- **High-Compact Density (Đậm đặc, tối ưu thao tác):** Màn hình thanh toán (S11), Cổng quản trị rạp Organizer Web & Mobile.

---

## 5. Xử Lý Hình Ảnh Điện Ảnh (Cinematic Imagery Standards)

Đã chuyển hóa toàn bộ các mô tả tham khảo ban đầu (vốn chỉ nói về hình ảnh siêu xe trong tài liệu tham khảo Ferrari) thành các tiêu chuẩn ảnh phục vụ chuyên biệt cho nền tảng điện ảnh:

```
+---------------------------------------------------------------+
| 1. Hero Backdrop: 100vw Full-bleed, tỷ lệ 21:9 hoặc 16:9      |
+---------------------------------------------------------------+
| 2. Movie Poster: Tỷ lệ chuẩn 2:3, Sharp 0px corners           |
+---------------------------------------------------------------+
| 3. Cinematic Still / BTS: Tỷ lệ 16:9, độ tương phản cao       |
+---------------------------------------------------------------+
| 4. Cinema Hall Architecture: Không gian rạp IMAX/Gold Class   |
+---------------------------------------------------------------+
| 5. Digital E-Ticket: Nền Carbone Nero, QR Code trắng tương phản|
+---------------------------------------------------------------+
```

1. **Poster Phim (Movie Posters):** Tỷ lệ chuẩn 2:3. Hiển thị sắc cạnh với `0px border-radius`, viền hairline `1px solid #303030`. Khi hover hoặc active, viền chuyển đỏ `#da291c`. Tuyệt đối không bo góc tròn poster.
2. **Khung hình Điện ảnh (Cinematic Stills & Stills Gallery):** Tỷ lệ 16:9 hoặc 2.39:1 (Cinemascope). Xử lý ánh sáng tương phản cao, vùng tối sâu, màu sắc sống động. Bố trí theo dạng mosaic 5 cột bất đối xứng (S22B).
3. **Ảnh nền Hero (Hero Backdrops):** Tràn viền 100vw, sử dụng kỹ thuật phủ lớp chuyển màu tối từ đáy và 2 cạnh (`linear-gradient(to top, #000000 15%, transparent 85%)`) để hòa tan hình ảnh vào nền Carbone Nero vô tận, giúp chữ đè lên luôn đọc rõ.
4. **Hình ảnh Rạp chiếu (Cinema Imagery):** Ảnh chụp kiến trúc sảnh rạp sang trọng, phòng chiếu ghế bọc da đẳng cấp, màn hình vòm IMAX choáng ngợp; không chụp cảnh người chen chúc xô bồ.
5. **Vé Điện Tử & Mã QR (Digital Ticket & QR):** Thiết kế phẳng như một tấm thẻ đen kim loại sang trọng. Mã QR vé luôn render với độ tương phản tuyệt đối (mã trắng trên nền đen hoặc mã đen trên nền trắng có viền bảo vệ), bảo đảm máy quét tại rạp đọc được ngay lập tức.
6. **Khối gợi ý Buaa AI (AI Recommendation Visuals):** Thumbnail phim kèm nhãn gợi ý nhỏ gọn, hiển thị mượt mà ngay trong dòng hội thoại chat.

---

## 6. Hình Khối & Triết Lý Chiều Sâu (Shape & Elevation Philosophy)

### 6.1 Hình Học Góc Nhọn (Sharp 0px Geometry Signature)
- **Nguyên tắc cốt lõi:** Mọi nút bấm (buttons), thẻ (cards), khung nhập liệu (inputs), khung modal, ảnh poster và vách ngăn đều sử dụng **`border-radius: 0px`**.
- **Ngoại lệ duy nhất được kiểm soát:**
  1. `border-radius: 4px`: Chỉ dùng cho các nhãn trạng thái nghiệp vụ siêu nhỏ (status badges: `CONFIRMED`, `PENDING`, `EXPIRED`) để tăng tính thân thiện và dễ nhận biết.
  2. `border-radius: 9999px`: Chỉ dùng cho các chip lọc danh mục hình viên thuốc (Filter Pills) nhằm phân biệt hình học giữa nút hành động vuông sắc và nhãn lọc mềm mại.

### 6.2 Triết Lý Chiều Sâu Không Bóng Đổ (Zero Drop-Shadows)
Nền tảng sử dụng **zero elevation**:
- **KHÔNG sử dụng `box-shadow`** trên thẻ, nút bấm hay thanh điều hướng.
- Chiều sâu không gian được kiến tạo độc quyền qua 3 kỹ thuật:
  1. **Xếp tầng tông màu tối (Dark Surface Ladder):**
     - Mức 0 (Sâu nhất): `#000000` (Nền canvas chính).
     - Mức 1 (Nổi lên): `#181818` (Thẻ nội dung, thanh menu).
     - Mức 2 (Đường viền/Tiêu điểm): `#303030` (Hairline borders và vách ngăn).
  2. **Đường viền Hairline 1px:** Mỏng, sắc sảo, tách biệt cấu trúc mà không tạo cảm giác nặng nề.
  3. **Khoảng trắng âm tính (Negative Space):** Khoảng đen rộng lớn tạo cảm giác mênh mông, giúp đối tượng chính nổi bật tự nhiên.

---

## 7. Triết Lý & Ngôn Ngữ Chuyển Động (Motion Philosophy Overview)

Toàn bộ quy chuẩn chi tiết về chuyển động được sở hữu bởi chuẩn chất lượng [`docs/04-standards/motion-design.md`](docs/04-standards/motion-design.md).

Tóm lược các nguyên tắc bất biến:
- **3 Cấp độ cường độ:**
  - *Expressive (400ms – 700ms):* Dành riêng cho Discovery, Hero và Gallery.
  - *Restrained (200ms – 350ms):* Dành cho Showtimes, Seat Selection, Chat Workspace.
  - *Minimal (100ms – 200ms):* Dành cho Checkout, Payment, Security, Admin Grids.
- **10 Motion Patterns chuẩn:** Scroll-linked Reveal, Mask/Clip Reveal, Parallax Layering, Object Choreography, Scale-Focus Transition, Kinetic Typography, Spatial Transition, Contextual Micro-interaction, Staggered Reveal, Ambient Motion.
- **Kỷ luật kỹ thuật:** Chỉ chạy trên thuộc tính GPU `transform` và `opacity`. Đạt ngân sách 60fps.
- **Bắt buộc hỗ trợ `prefers-reduced-motion`:** Cung cấp phương án thay thế tức thời khi người dùng bật chế độ giảm chuyển động.

---

## 8. Sổ Xung Đột & Trạng Thái Đồng Bộ (Conflict Ledger)

Bảng dưới đây tổng hợp các xung đột được phát hiện giữa bản scrape tham khảo Ferrari ban đầu, mã nguồn hiện hữu, và định hướng nâng cấp mới:

| Điểm xung đột | Nguồn tài liệu & Hiện trạng code | Tác động thực tế | Thẩm quyền sở hữu (Canonical Owner) | Phương án giải quyết (Proposed Resolution) | Trạng thái quyết định |
|---|---|---|---|---|---|
| **Giới hạn cỡ chữ Headline** | `DESIGN.md` cũ giới hạn headline tối đa 16px; thực tế code và yêu cầu biên tập cần tiêu đề lớn 32px–64px | Giao diện bị bí bách, thiếu chất điện ảnh, không thể hiện được tính Kinetic Editorial | `DESIGN.md` (Mục 3) | Nâng cấp thành hệ thống 8 tầng chữ: Tách riêng Brand/Hero Display (32px–64px) cho trang khám phá; giữ chữ 14px–16px cho UI nghiệp vụ | **Accepted (Đã phê duyệt)** |
| **Độ rộng trang (Page Max-Width)** | `DESIGN.md` cũ ghi 1440px; `tokens.css` dùng 1760px; một số section dùng 100vw | Bố cục không nhất quán giữa màn hình rộng và khung đọc nội dung | `DESIGN.md` (Mục 4) & `tokens.css` | Chuẩn hóa: 1760px cho Wide Cinema Canvas (Discovery/Gallery); 1440px cho Contained Frame (Checkout/Account/Admin); 100vw cho Hero | **Accepted (Đã phê duyệt)** |
| **Hình học góc bo (Border Radius)** | `DESIGN.md` cũ ghi 0px tuyệt đối; `ui-quality.md` có ngoại lệ 4px; `tokens.css` có pill 9999px | Tiềm ẩn nguy cơ tùy tiện bo tròn nút bấm làm hỏng nhận diện Ferrari | `DESIGN.md` (Mục 6) | Giữ 0px làm nhận diện cốt lõi cho mọi nút và thẻ; chính thức ghi nhận ngoại lệ 4px chỉ cho status badge nhỏ và 9999px cho filter pill | **Accepted (Đã phê duyệt)** |
| **Màu đỏ Rosso Corsa (`#da291c`)** | `DESIGN.md` cũ cấm dùng làm nền CTA; trong khi code dùng cho error và hover nút | Hiểu nhầm rằng hệ thống không có màu CTA hoặc màu đỏ bị lạm dụng | `DESIGN.md` (Mục 2) | Khẳng định: Rosso Corsa là màu tín hiệu tương tác (Hover, Focus, Active border) và Semantic Error; không dùng làm mảng nền lớn tràn lan | **Accepted (Đã phê duyệt)** |
| **Hình ảnh tham khảo xe hơi vs Điện ảnh** | `DESIGN.md` cũ chứa nhiều đoạn miêu tả xe Ferrari ("car photography", "vehicles shot in studio") | Gây khó hiểu cho lập trình viên và designer khi phát triển sản phẩm rạp phim | `DESIGN.md` (Mục 5) | Điều chỉnh toàn bộ mô tả sang chuyên ngành điện ảnh (poster 2:3, still 16:9, rạp IMAX, vé QR); lưu giữ giá trị tham khảo lịch sử | **Accepted (Đã phê duyệt)** |
| **Motion Tokens & Thư viện** | Code hiện chỉ có 150ms/200ms trong `tokens.css`; chưa có chuẩn đường cong gia tốc và quy tắc pattern | Animation dễ bị lộn xộn, thiếu nhịp điệu và có nguy cơ kéo thêm thư viện ngoài | `docs/04-standards/motion-design.md` | Định nghĩa 10 patterns chuẩn và bộ token đề xuất (`--motion-*`); duy trì zero unapproved dependencies | **Proposed (Chờ kiểm chứng prototype)** |

---

## 9. Hướng Dẫn Kỹ Sư & Agent (Agent Prompt Guide)

### 9.1 Bảng Tra Cứu Nhanh Màu Sắc & Bề Mặt
- Chữ chính: `#ffffff` (Bianco Ferrari)
- Chữ phụ / nhãn: `#8f8f8f` (Fumo)
- Nền trang chính: `#000000` (Carbone Nero)
- Nền thẻ / modal: `#181818` (Notte Profonda)
- Đường viền hairline: `#303030` (Grafite)
- Điểm nhấn tương tác / Focus: `#da291c` (Rosso Corsa)
- Xác nhận thành công: `#2e7d5b` (Verde Semantic)
- Cảnh báo thời gian giữ vé: `#d97706` (Ambra Avviso)

### 9.2 Mẫu Prompt Thành Phần Giao Diện Tiêu Chuẩn

1. **Thẻ Poster Phim Biên Tập (Editorial Movie Card):**
   > *"Tạo component thẻ phim: Nền #181818, border-radius 0px, viền hairline 1px solid #303030. Ảnh poster tỷ lệ 2:3 sắc cạnh, không bo góc. Tiêu đề phim 16px Inter weight 600 Title Case màu #ffffff. Nhãn thể loại và thời lượng 11px uppercase letter-spacing 0.08em màu #8f8f8f. Khi hover, thẻ tăng nhẹ scale(1.025) và viền chuyển sang #da291c trong 180ms cubic-bezier(0.2, 0, 0, 1)."*

2. **Nút Hành Động Sắc Cạnh (Sharp Action Button):**
   > *"Tạo nút CTA Đặt vé: Nền trong suốt hoặc #da291c có kiểm soát, border-radius 0px, chữ 12px uppercase letter-spacing 0.083em weight 500 màu #ffffff. Padding 12px 24px. Khi hover: nền chuyển sáng hơn hoặc xuất hiện viền đỏ #da291c. Khi active/press: scale(0.98) trong 80ms. Focus-visible: outline 2px solid #da291c với outline-offset 2px."*

3. **Thẻ Vé Điện Tử QR (E-Ticket QR Card):**
   > *"Tạo khối vé điện tử: Nền #181818, viền hairline 1px solid #303030, góc nhọn 0px. Mã QR hiển thị nổi bật trên nền trắng hoặc tương phản cao với viền bảo vệ. Tiêu đề phim 20px Roboto Slab hoặc Inter 700. Thông tin phòng chiếu, hàng ghế và giờ chiếu hiển thị dạng 2 cột rõ ràng, nhãn 11px uppercase #8f8f8f, giá trị 14px #ffffff. Badge trạng thái 'CONFIRMED' màu xanh #2e7d5b với nền wash #0d281e, border-radius 4px."*

---

## 10. Liên Kết Tài Liệu Kỹ Thuật

- [Ngôn ngữ thiết kế chuyển động chuẩn (Motion Design Standard)](docs/04-standards/motion-design.md)
- [Chuẩn chất lượng UI & Trợ năng (UI Quality & a11y Standards)](docs/04-standards/ui-quality.md)
- [Quy trình phối hợp thiết kế & chuyển giao (UI Design & Motion Handoff)](docs/07-guides/ui-design-motion-workflow.md)
- [Điều phối skill giao diện của Agent (UI Skill Routing Rules)](.agents/rules/ui-skill-routing.md)
- [Phân tích 5 Video tham khảo sáng tạo (Creative Reference Analysis)](.agents/references/motion-references-analysis.md)
