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

# Ferrari Dark Cinema — Cinematic Kinetic Editorial Style Guide

> *cavallino rampante on black marble, orchestrated through kinetic editorial choreography. Black voids punctuated by singular Ferrari red, white uppercase tracking, and full-bleed cinematic storytelling.*

**Theme:** dark  
**Visual Direction:** **CINEMATIC KINETIC EDITORIAL (Motion-Led Cinema Experience)**  
**Canonical Owner:** Tệp tài liệu này là nguồn thẩm quyền tối cao (Single Source of Truth) về bản sắc thị giác, bảng màu, thang đo kiểu chữ, hình học và quy chuẩn bố cục cho toàn bộ hệ sinh thái Movie Booking Platform, bao gồm bốn ứng dụng Customer Web, Customer Mobile, Organizer Web và Organizer Mobile theo [ADR-0002](docs/06-decisions/0002-customer-organizer-app-boundaries.md).

---

## 1. Tuyên Ngôn & Bản Sắc Cốt Lõi (Design Statement & Core DNA)

### 1.1 Tuyên Ngôn Thiết Kế (Design Statement)
> *"A premium cinematic booking experience that combines editorial minimalism, spatial choreography, immersive storytelling and intentional motion. Every visual element should feel purposefully directed, while transactional interactions remain clear, accessible and reliable."*

Nền tảng hòa quyện sự nghiêm cẩn sang trọng của thương hiệu **Ferrari** với không gian tối đắm chìm của **Rạp chiếu phim hiện đại**. Giao diện loại bỏ hoàn toàn các chi tiết trang trí rườm rà, đặt hình ảnh điện ảnh, áp phích phim (posters) và tấm vé điện tử vào vị trí tâm điểm nghệ thuật.

### 1.2 5 Dữ Kiện Thẩm Mỹ Từ Video Tham Khảo (Motion & Visual Cues)
Dữ liệu sáng tạo được đúc kết từ 5 video tham khảo tuyển chọn để định hình gu thiết kế:
1. **Dữ kiện 01 — Full-Bleed Immersion (Từ Cinematic Dining):** Hình ảnh tràn viền 100vw mở rộng không gian, kể chuyện theo từng phân cảnh (scene-by-scene), chuyển tiếp mượt mà từ Hero dạo đầu sang nội dung chi tiết.
2. **Dữ kiện 02 — Kinetic Editorial Typography (Từ Kinetic Portfolio):** Bố cục tạp chí nền tối, tiêu đề chữ lớn ấn tượng (32px–64px) có sự chuyển động hé lộ dứt khoát (kinetic reveal), các khối nội dung xếp lớp không gian (spatial layering) trượt qua nhau tạo chiều sâu quang học.
3. **Dữ kiện 03 — Dark Atmospheric Spotlight (Từ Futuristic AI):** Không gian đen sâu tĩnh mịch, quầng sáng tiêu điểm mờ ảo (spotlight focal glow) phía sau poster, tối giản tối đa thanh viền (minimal interface chrome) cho Buaa AI.
4. **Dữ kiện 04 — Spatial Choreography (Từ Spatial Motion Showcase):** Các thẻ nội dung di chuyển và co giãn tỷ lệ có kiểm soát trong không gian tọa độ phẳng (scale-focus transitions), giữ trọn mạch định hướng thị giác khi đổi bộ lọc hoặc danh mục.
5. **Dữ kiện 05 — Product-Centric Showcase (Từ Automotive Showcase):** Tôn vinh tuyệt đối đối tượng sản phẩm (Poster phim, Khung hình tĩnh, Chiếc vé điện tử QR), bao bọc bởi khoảng đen âm tính rộng lớn (generous negative space), tạo cảm giác đĩnh đạc và độc bản.

### 1.3 Tính Cách Thương Hiệu (Personality)
- **Premium, không phô trương:** Sang trọng nhờ tỷ lệ vàng, khoảng thở và chất liệu hình ảnh; không dùng viền vàng kim hay bóng bẩy rẻ tiền.
- **Cinematic, không lạm dụng hiệu ứng:** Mọi chuyển động mang nhịp thở của một bộ phim điện ảnh; không có hoạt họa thừa.
- **Expressive nhưng có kiểm soát:** Sống động, choáng ngợp ở các trang khám phá (Discovery, Hero, Gallery); lập tức tinh gọn, tĩnh tại khi bước vào luồng giao dịch.
- **Sharp thay vì soft/rounded:** Duy trì triệt để hình học góc nhọn `0px border-radius` làm nhận diện cốt lõi; cấm bo tròn mềm yếu làm mất chất điện ảnh.
- **Art-directed, không giống generic SaaS:** Mang dấu ấn dàn dựng mỹ thuật độc bản, tách biệt hoàn toàn khỏi các mẫu dashboard hành chính cứng nhắc.

### 1.4 Quy Tắc Cấm Tuyệt Đối (Anti-Slop & Anti-Gimmick Rules)
- ❌ **CẤM** phong cách AI-generated generic: Không dùng ảnh minh họa 3D cartoon, không dùng các khối shape trôi nổi vô nghĩa.
- ❌ **CẤM** bố cục SaaS rập khuôn: Không áp dụng máy móc lưới dashboard nhiều cột vụn vặt cho các trang trải nghiệm phim.
- ❌ **CẤM** lưới card lặp lại vô hồn: Lưới phim phải có nhịp điệu biên tập (xen kẽ card lớn tiêu điểm, ô mosaic hoặc dải ngang).
- ❌ **CẤM** dải màu gradient tím/xanh: Chỉ sử dụng các tông màu đơn sắc đen, xám, trắng và đỏ Rosso Corsa.
- ❌ **CẤM** hiệu ứng kính mờ đại trà (generic glassmorphism) và viền phát sáng neon/cyberpunk lòe loẹt.
- ❌ **CẤM** cướp quyền cuộn chuột (Scroll Hijacking) và các hiệu ứng parallax quá đà gây say chuyển động.
- ❌ **CẤM** chữ quá nhỏ (<11px) trên các màn hình thanh toán, chọn ghế hoặc thông tin vé.
- ❌ **CẤM** hy sinh khả năng tiếp cận (Accessibility WCAG AA) và độ tương phản chữ chỉ để lấy hiệu ứng thị giác.

---

## 2. Bảng Tokens — Màu Sắc & Bề Mặt (Colors & Surfaces)

### 2.1 Bảng Màu Nhận Diện

| Tên màu | Giá trị Hex | Token CSS | Vai trò trong hệ sinh thái |
|---|---|---|---|
| **Rosso Corsa** | `#da291c` | `--color-rosso-corsa` | Màu đỏ tín hiệu biểu tượng. Dùng cho trạng thái Hover, Focus visible, Active của nút CTA, viền ghế đang chọn, hoặc viền tiêu điểm. **Tuyệt đối không dùng làm màu nền tràn lan**. |
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

Áp dụng nghiêm ngặt cho các phản hồi giao dịch và trạng thái nghiệp vụ theo quyết định ngày 08/11/2026. Không dùng làm màu thương hiệu trang trí:

| Trạng thái | Tên màu | Giá trị Hex | Token CSS | Ứng dụng nghiệp vụ cụ thể |
|---|---|---|---|---|
| **Success** | Verde Semantic | `#2e7d5b` | `--color-success` | Biểu tượng xác nhận thành công (`circle-check`), nhãn `CONFIRMED`/`ISSUED`. |
| **Success Bg**| Verde Profondo | `#0d281e` | `--color-success-bg`| Nền chìm cho badge trạng thái vé thành công hoặc thông báo hoàn tất. |
| **Warning** | Ambra Avviso | `#d97706` | `--color-warning` | Cảnh báo thời gian giữ vé sắp hết (<2 phút), lưu ý suất chiếu đặc biệt. |
| **Error** | Rosso Corsa | `#da291c` | `--color-error` | Thất bại thanh toán (Payment Failed), lỗi hệ thống, vé bị hủy hoặc hết hạn. |

### 2.3 Triết Lý Chiều Sâu Không Bóng Đổ (Zero Drop-Shadows & Dark Surfaces)
Nền tảng sử dụng **zero elevation**:
- **KHÔNG sử dụng `box-shadow`** trên thẻ, nút bấm hay thanh điều hướng.
- Chiều sâu không gian được kiến tạo độc quyền qua 3 kỹ thuật:
  1. **Xếp tầng tông màu tối (Dark Surface Ladder):**
     - Mức 0 (Sâu nhất): `#000000` (Nền canvas chính, tạo khoảng không vô tận).
     - Mức 1 (Nổi lên): `#181818` (Thẻ nội dung, thanh menu, modal, footer).
     - Mức 2 (Đường viền/Tiêu điểm): `#303030` (Hairline borders và vách ngăn).
  2. **Đường viền Hairline 1px:** Mỏng, sắc sảo (`1px solid #303030`), tách biệt cấu trúc mà không tạo cảm giác nặng nề.
  3. **Khoảng trắng âm tính (Negative Space):** Khoảng đen rộng lớn tạo cảm giác mênh mông, giúp đối tượng chính nổi bật tự nhiên.

---

## 3. Hệ Thống Kiểu Chữ Biên Tập 8 Tầng (8-Level Typography Architecture)

Hệ thống kiểu chữ tách bạch rõ ràng giữa **Typography nhận diện biên tập** (Display/Hero) và **Typography giao dịch nghiệp vụ** (Functional UI/Body):

| Tầng cấp | Vai trò | Cỡ chữ (Size) | Line Height | Tracking (Letter Spacing) | Weight | Case | Phông chữ áp dụng |
|---|---|---|---|---|---|---|---|
| **Level 1** | **Brand / Editorial Display** | 48px – 64px | 1.05 – 1.15 | -0.02em đến 0.0em | 700 / 800 | Uppercase hoặc Title Case | Roboto Slab / Inter Display |
| **Level 2** | **Hero Headline** | 32px – 40px | 1.15 – 1.25 | -0.01em đến 0.02em | 600 / 700 | Title Case | Inter |
| **Level 3** | **Section Heading** | 20px – 24px | 1.25 – 1.35 | 0.02em đến 0.04em | 600 | Title Case / Uppercase | Inter |
| **Level 4** | **Movie Title** | 16px – 18px | 1.30 – 1.40 | 0.02em | 600 | Title Case | Inter |
| **Level 5** | **Functional UI Heading** | 14px – 16px | 1.40 | 0.04em | 500 / 600 | Uppercase hoặc Sentence Case | Inter |
| **Level 6** | **Body Copy** | 13px – 14px | 1.60 – 1.78 | 0.015em | 400 | Sentence Case | Inter |
| **Level 7** | **Metadata / Caption** | 11px – 12px | 1.50 – 1.78 | 0.08em đến 0.091em | 400 / 500 | **Uppercase toàn bộ** | Inter |
| **Level 8** | **Form Labels & Micro** | 11px – 12px | 1.40 | 0.05em | 500 | Uppercase hoặc Sentence Case | Inter |

### 3.1 Quy Tắc Tracking Nghịch Đảo (Inverted Tracking Rule)
- Cỡ chữ càng nhỏ, khoảng cách ký tự (tracking) càng phải mở rộng.
- Mọi nhãn ở cấp độ 11px–12px bắt buộc sử dụng chữ in hoa (uppercase) kèm tracking rộng (`0.08em – 0.091em`). Điều này tạo độ thở thanh thoát, định hình giọng nói thương hiệu đặc trưng.

### 3.2 Hỗ Trợ Tiếng Việt & Độ Tương Phản (Vietnamese & Readability)
- Phông chữ hệ thống bắt buộc sử dụng bộ glyph hỗ trợ tiếng Việt đầy đủ (dấu thanh sắc nét, mũ không dính dòng trên). `Inter` và `Roboto Slab` là phông chữ nền tảng chính thức.
- Body text trên nền đen luôn duy trì độ tương phản tối thiểu **4.5:1** đạt chuẩn WCAG AA (sử dụng `#ffffff` cho nội dung chính, `#8f8f8f` cho nội dung phụ; không dùng màu tối hơn `#8f8f8f` cho chữ đọc).

---

## 4. Quy Chuẩn Không Gian & Hình Học (Spacing, Shape & Layout)

### 4.1 Thang Đo Khoảng Cách (Spacing Scale)

| Tên Token | Giá trị | Ứng dụng tiêu biểu |
|---|---|---|
| `--spacing-4` | 4px | Khoảng đệm micro, khoảng cách icon và nhãn |
| `--spacing-6` | 6px | Đệm dọc cho chip hoặc nhãn |
| `--spacing-10` | 10px | Khoảng cách giữa các chip bộ lọc |
| `--spacing-12` | 12px | Đệm trong của nút bấm nhỏ, khoảng cách metadata |
| `--spacing-16` | 16px | Khoảng cách phần tử thông thường, padding ô nhập liệu |
| `--spacing-20` | 20px | Đệm trong của card phụ, khoảng cách cột di động |
| `--spacing-24` | 24px | Đệm trong tiêu chuẩn của card nội dung |
| `--spacing-32` | 32px | Đệm trong của modal, khoảng cách giữa các khối phụ |
| `--spacing-48` | 48px | Padding lề trang máy tính (page-padding-x) |
| `--spacing-64` | 64px | Khoảng cách giữa các section nội dung thông thường |
| `--spacing-96` | 96px | Khoảng cách giữa các phân cảnh lớn (cinematic section gap) |

### 4.2 Hình Học Góc Nhọn (Sharp 0px Geometry Signature)
- **Nguyên tắc cốt lõi:** Mọi nút bấm (buttons), thẻ (cards), khung nhập liệu (inputs), khung modal, ảnh poster và vách ngăn đều sử dụng **`border-radius: 0px`**.
- **Ngoại lệ duy nhất được kiểm soát:**
  1. `border-radius: 4px`: Chỉ dùng cho các nhãn trạng thái nghiệp vụ siêu nhỏ (status badges: `CONFIRMED`, `PENDING`, `EXPIRED`).
  2. `border-radius: 9999px`: Chỉ dùng cho các chip lọc danh mục hình viên thuốc (Filter Pills).

### 4.3 Khung Bố Cục (Layout Canvas)
- **Wide Cinema Canvas (`--page-max-width: 1760px`):** Dành riêng cho trang chủ khám phá (S01), phòng tranh mosaic (S22B) và thư viện phim.
- **Contained Editorial Frame (`--page-max-width: 1440px`):** Dành cho trang tài khoản, thanh toán, chọn ghế, quản trị rạp.
- **Full-Bleed (100vw):** Dành cho Hero banner phim tiêu điểm, ảnh nền phòng chiếu và dải phân cách điện ảnh.

---

## 5. Hệ Thống Xử Lý Hình Ảnh Điện Ảnh (Cinematic Imagery Standards)

Toàn bộ hình ảnh trong hệ thống tuân thủ nghiêm ngặt tinh thần điện ảnh:

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

1. **Poster Phim (Movie Posters):** Tỷ lệ chuẩn 2:3. Hiển thị sắc cạnh với `border-radius: 0px`, viền hairline `1px solid #303030`. Khi hover/active, viền chuyển đỏ `#da291c`. Tuyệt đối không bo góc tròn poster.
2. **Khung hình Điện ảnh (Cinematic Stills & Gallery):** Tỷ lệ 16:9 hoặc Cinemascope 2.39:1. Ánh sáng tương phản cao, vùng tối sâu. Bố trí theo dạng mosaic 5 cột bất đối xứng (S22B).
3. **Ảnh nền Hero (Hero Backdrops):** Tràn viền 100vw, sử dụng kỹ thuật phủ dải chuyển màu tối từ đáy và 2 cạnh (`linear-gradient(to top, #000000 15%, transparent 85%)`) để hòa tan hình ảnh vào nền Carbone Nero vô tận, giúp chữ đè lên luôn đọc rõ.
4. **Hình ảnh Rạp chiếu (Cinema Imagery):** Ảnh chụp kiến trúc sảnh rạp sang trọng, phòng chiếu ghế bọc da đẳng cấp, màn hình vòm IMAX choáng ngợp; không chụp cảnh người chen chúc xô bồ.
5. **Vé Điện Tử & Mã QR (Digital Ticket & QR):** Thiết kế phẳng như một tấm thẻ đen kim loại sang trọng. Mã QR vé luôn render với độ tương phản tuyệt đối (mã trắng trên nền đen hoặc mã đen trên nền trắng có viền bảo vệ), bảo đảm máy quét tại rạp đọc được ngay lập tức.
6. **Khối gợi ý Buaa AI (AI Recommendation Visuals):** Thumbnail phim kèm nhãn gợi ý nhỏ gọn, hiển thị mượt mà ngay trong dòng hội thoại chat.

---

## 6. Dữ Kiện & Ngôn Ngữ Chuyển Động (Motion DNA & Patterns)

Quy định chuyển động chi tiết xem tại chuẩn chất lượng [`docs/04-standards/motion-design.md`](docs/04-standards/motion-design.md). Dưới đây là các dữ kiện then chốt để phục vụ thiết kế:

### 6.1 Ma Trận Cường Độ (Motion Intensity)
- **Level 3 — Expressive (400ms – 700ms):** Dành riêng cho Discovery, Hero, Media Gallery. Dàn dựng không gian, tiêu đề kinetic lướt nhẹ, ảnh mở màn trập (mask reveal).
- **Level 2 — Restrained (200ms – 350ms):** Dành cho Showtimes, Seat Selection, Chat Workspace. Sắp xếp lại vị trí thẻ khi đổi bộ lọc, co giãn nhẹ khi tương tác.
- **Level 1 — Minimal (100ms – 200ms hoặc tức thời):** Dành cho Checkout, Payment, Security, Admin Grids. Phản hồi cơ học tức thì, ổn định tuyệt đối, không gây chậm trễ giao dịch.

### 6.2 Bộ Token Chuyển Động Đề Xuất (Proposed Motion Tokens)

```css
/* Duration Tokens */
--motion-duration-micro: 120ms;      /* Phản hồi chạm, active scale, toggle nút */
--motion-duration-fast: 180ms;       /* Hover viền, dropdown, tooltip */
--motion-duration-normal: 280ms;     /* Chuyển tab, lọc danh sách, mở modal */
--motion-duration-expressive: 450ms; /* Chuyển cảnh Hero, mask reveal */
--motion-duration-cinematic: 650ms;  /* Mở màn trang chủ, kinetic typography */
--motion-duration-ambient: 5000ms;   /* Chu kỳ breathing của ánh sáng nền */

/* Easing Curves */
--motion-ease-standard: cubic-bezier(0.2, 0, 0, 1);       /* Mọi tương tác chuẩn */
--motion-ease-decelerate: cubic-bezier(0.16, 1, 0.3, 1);  /* Vào khung nhìn êm ái */
--motion-ease-cinematic: cubic-bezier(0.25, 1, 0.5, 1);   /* Mở màn trập điện ảnh */
```

### 6.3 10 Motion Patterns Tóm Lược
1. **Scroll-linked Reveal:** Khối nội dung trượt lên nhẹ nhàng (`translateY: 24px -> 0px`, `opacity: 0 -> 1`) khi cuộn tới.
2. **Mask / Clip Reveal:** Ảnh hero hoặc tiêu đề hé lộ từ mặt nạ cắt góc phẳng (`clip-path: inset()`).
3. **Parallax Layering:** Lớp ảnh nền di chuyển chậm hơn lớp chữ (tỷ lệ chênh lệch tối đa 0.15) trên desktop.
4. **Object Choreography:** Các thẻ poster tự trượt vào tọa độ mới khi đổi bộ lọc (không biến mất đột ngột).
5. **Scale-Focus Transition:** Poster hoặc ảnh phóng to nhẹ `scale(1.025)`, viền hóa đỏ `#da291c` khi hover.
6. **Kinetic Typography:** Dòng chữ tiêu đề lớn trượt lên có độ trễ ngắn giữa các dòng (staggered line reveal).
7. **Spatial Transition:** Poster thumbnail mở rộng liền mạch thành Hero backdrop khi vào trang chi tiết.
8. **Contextual Micro-interaction:** Phản hồi bấm co giãn `scale(0.98)` trong 80ms; ghế chọn nảy nhẹ `scale(1.08)`.
9. **Staggered Content Reveal:** Danh sách kết quả tìm kiếm xuất hiện so le cách nhau 35ms.
10. **Ambient Motion:** Quầng sáng nền tiêu điểm thở rất chậm (`4000ms–6000ms`), tắt khi thao tác.

---

## 7. Đặc Tả Chi Tiết Từng Thành Phần (Component Specifications)

### 7.1 Ghost Navigation Link
- **Vai trò:** Điều hướng chính trên thanh menu.
- **Dáng vẻ:** Nền trong suốt, chữ in hoa 12px Inter weight 400, tracking `0.083em`, góc phẳng `0px radius`, padding dọc 5px.
- **Tương tác & Motion:** Khi hover, màu chữ chuyển sang `#da291c` trong 150ms; không viền, không gạch chân.

### 7.2 Dark Cinematic Hero Panel
- **Vai trò:** Phân cảnh dạo đầu trang chủ (S01) hoặc chi tiết phim (S06).
- **Dáng vẻ:** Tràn viền 100vw, nền `#000000`, ảnh backdrop phủ lớp gradient mờ tối dần về chân trang. Tiêu đề phim lớn 32px–40px (Hero Headline) hoặc 48px–64px (Editorial Display) màu trắng nổi bật.
- **Tương tác & Motion:** Tiêu đề hé lộ theo hiệu ứng Kinetic Typography dòng so le; ảnh mở màn trập nhẹ nhàng trong 500ms.

### 7.3 Editorial Content Card & Movie Poster Card
- **Vai trò:** Thẻ phim trong lưới khám phá hoặc bộ sưu tập biên tập.
- **Dáng vẻ:** Khung chữ nhật phẳng nền `#181818`, góc phẳng `0px radius`, viền hairline `1px solid #303030`. Poster phim tỷ lệ 2:3 tràn sát mép thẻ. Tiêu đề phim 16px Inter weight 600 Title Case. Nhãn thể loại/thời lượng 11px uppercase tracking `0.08em` màu `#8f8f8f`.
- **Tương tác & Motion:** Khi hover, thẻ tăng nhẹ `scale(1.025)`, viền chuyển thành đỏ `#da291c` trong 180ms cubic-bezier(0.2, 0, 0, 1).

### 7.4 5-Column Photo Mosaic Tile (S22B)
- **Vai trò:** Trình bày thư viện ảnh tĩnh và hậu trường phim.
- **Dáng vẻ:** Lưới mosaic 5 cột bất đối xứng, mỗi ô ảnh có tỷ lệ 16:9 hoặc dọc sắc cạnh, viền mỏng `#303030`.
- **Tương tác & Motion:** Khi trỏ chuột, ô ảnh sáng rõ hơn (`opacity: 1`), các ô xung quanh dịu nhẹ (`opacity: 0.75`).

### 7.5 Showtime Selection Chip
- **Vai trò:** Nút chọn suất chiếu theo giờ và định dạng (IMAX 2D, 3D, Sweetbox).
- **Dáng vẻ:** Nền `#181818`, viền `1px solid #303030`, góc nhọn `0px radius`, padding 8px 16px. Giờ chiếu hiển thị 14px weight 600 `#ffffff`, nhãn phòng chiếu 11px uppercase `#8f8f8f`.
- **Tương tác & Motion:** Khi active: Viền chuyển sang `#da291c`, nền `#da291c` wash mờ, co giãn nhẹ `scale(0.98)` khi bấm.

### 7.6 Seat Map Matrix (Sơ Đồ Ghế Phòng Chiếu / S08)
- **Vai trò:** Chọn ghế ngồi trong phòng chiếu.
- **Dáng vẻ:** Các ô ghế hình học sắc nét `0px border-radius`, kích thước chuẩn 28×28px (hoặc 60×28px cho Sweetbox đôi).
  - Ghế trống Standard: Nền `#181818`, viền `1px solid #303030`.
  - Ghế trống VIP: Nền `#242424`, viền `1px solid #666666`.
  - Ghế Sweetbox (hàng đôi): Khối chữ nhật đôi liền mạch nền `#181818`, viền `#da291c` mảnh.
  - Ghế đang chọn: Nền đỏ rực `--color-rosso-corsa: #da291c`, chữ trắng.
  - Ghế đã bán / Đang giữ: Nền `#303030`, biểu tượng gạch chéo mờ, không bấm được.
- **Tương tác & Motion:** Khi bấm chọn ghế, phản hồi tức thời (<50ms), nảy nhẹ `scale(1.08) -> scale(1.0)` trong 120ms. Tuyệt đối không làm trễ thao tác chọn ghế.

### 7.7 Buaa AI Workspace & Recommendation Card (S03)
- **Vai trò:** Khung tương tác trò chuyện với trợ lý ảo Buaa AI.
- **Dáng vẻ:** Không gian đen sâu, tối giản viền thanh công cụ (minimal chrome). Hộp nhập liệu phẳng với viền hairline `#303030`. Khối gợi ý phim nhúng trong chat hiển thị dạng thẻ ngang nhỏ gọn: Thumbnail tỷ lệ 2:3 bên trái (48×72px), thông tin phim và nút "Đặt vé nhanh" bên phải.
- **Tương tác & Motion:** Quầng sáng nền breathing chậm phía sau biểu tượng AI; tin nhắn và thẻ gợi ý xuất hiện êm ái, streaming chữ dứt khoát.

### 7.8 Order Summary & Checkout Card (S11)
- **Vai trò:** Bảng tóm tắt đơn hàng và thanh toán.
- **Dáng vẻ:** Nền `#181818`, viền `1px solid #303030`, góc nhọn `0px radius`, padding 24px. Phân cấp dòng tiền rõ ràng: Tạm tính, Combo, Voucher giảm giá, Tổng thanh toán nổi bật với cỡ chữ 20px Inter 700 màu `#ffffff`.
- **Tương tác & Motion:** Tĩnh tại, phản hồi nút bấm tức thời; không có animation gây xao nhãng.

### 7.9 Electronic Ticket Card (E-Ticket / S16)
- **Vai trò:** Vé điện tử xuất trình tại rạp.
- **Dáng vẻ:** Thiết kế dạng tấm thẻ kim loại đen cao cấp. Mã QR hiển thị nổi bật trên nền trắng tinh khiết hoặc tương phản cao ở trung tâm. Tiêu đề phim 20px Roboto Slab hoặc Inter 700. Thông tin suất chiếu, phòng chiếu và số ghế chia 2 cột sắc sảo. Badge trạng thái `CONFIRMED` màu xanh `#2e7d5b` (nền wash `#0d281e`, góc bo nhẹ 4px).
- **Tương tác & Motion:** Hé lộ trang trọng bằng hiệu ứng Mask Reveal sau khi thanh toán thành công.

### 7.10 Hairline Divider
- **Vai trò:** Phân tách cấu trúc nội dung.
- **Dáng vẻ:** Đường kẻ mỏng đúng 1px phẳng lì trong suốt chiều ngang, màu `#303030` trên nền tối hoặc `#d2d2d2` trên nền sáng. Không dùng đường kẻ kép hoặc hiệu ứng trang trí viền.

---

## 8. Ma Trận Dữ Kiện Màn Hình Nghiệp Vụ (Screen-by-Screen Blueprint)

| Màn hình (Screen ID / Route) | Định hướng thị giác | Dữ kiện hình ảnh & Bố cục | Nhịp điệu chuyển động (Motion Feel) | Ràng buộc nghiệp vụ bất biến |
|---|---|---|---|---|
| **S01 — Discovery / Homepage** (`/`) | Cinematic Editorial tạp chí sang trọng | Hero banner 100vw, card phim tiêu điểm 2:3, dải danh mục Now Showing | **Expressive:** Mở màn trập, chữ kinetic, thẻ lướt êm ái khi cuộn | Không scroll-hijacking; cuộn tự nhiên của hệ điều hành |
| **S02 — Search & Movie Listing** (`/search`, `/movies`) | Lưới biên tập tối giản, bộ lọc sắc cạnh | Chip lọc 0px, lưới poster 2:3 xen kẽ nhịp điệu, thông tin CineScore | **Restrained:** Thẻ tự trượt vào tọa độ mới khi đổi bộ lọc (FLIP) | Kết quả tìm kiếm hiển thị ngay sau khi đổi bộ lọc |
| **S03 — Buaa AI Workspace** (`/chat`) | Không gian kỹ thuật đen sâu, minimal chrome | Khung chat phẳng viền `#303030`, thẻ phim nhúng nhỏ gọn | **Restrained:** Streaming chữ dứt khoát, quầng sáng thở nhẹ | AI không bao giờ bịa đặt trạng thái vé khi Core chưa ký |
| **S06 — Movie Details** (`/movies/:id`) | Poster tiêu điểm lớn, câu chuyện điện ảnh | Backdrop 100vw mờ đáy, bảng lịch chiếu 2 cột, thẻ diễn viên | **Expressive:** Tiêu đề trượt nhẹ, thông tin lịch chiếu trượt vào từ phải | Bảng giờ chiếu phải dễ đọc và chọn ngay lập tức |
| **S08 — Seat Selection** (`/booking/:id/seats`) | Sơ đồ phòng chiếu sắc nét, hình học 0px | Ma trận ghế Standard, VIP, Sweetbox đôi; đồng hồ giữ vé 5 phút | **Restrained:** Bấm nảy nhẹ <50ms; đồng hồ TTL nhảy chính xác từng giây | TUYỆT ĐỐI KHÔNG làm trễ phản hồi chọn ghế hoặc đơ đồng hồ |
| **S11 — Checkout** (`/checkout/:id`) | Tối giản, tập trung thông tin tài chính | Bảng dòng tiền sắc nét, nút tăng giảm combo cơ học, cổng MoMo/VNPAY | **Minimal:** Phản hồi bấm tức thì; không có hiệu ứng chuyển động thừa | Số tiền và mã đơn hiển thị minh bạch tuyệt đối |
| **S12 — Payment Processing** (`/checkout/:id/processing`) | Trạng thái kỹ thuật nghiêm cẩn | Thanh tiến trình phẳng, không màu mè, hướng dẫn chờ đợi | **Minimal:** Nhịp đập vi mô ổn định; không dùng spinner xoay tròn generic | Xử lý timeout và thông báo lỗi rõ ràng nếu cổng ngắt |
| **S13 — Payment Success** (`/checkout/:id/success`) | Trang trọng, đĩnh đạc | Lời chúc mừng và nút hé lộ tấm vé điện tử | **Minimal:** Vé hé lộ trang trọng bằng Mask Reveal | CHỈ HIỂN THỊ khi Cinema Core gửi mã xác nhận hợp lệ |
| **S14 — Payment Failed** (`/checkout/:id/failed`) | Cảnh báo rõ ràng với Rosso Corsa `#da291c` | Thông báo nguyên nhân lỗi và nút hành động khắc phục | **Minimal:** Nút "Thử lại" và "Chọn lại suất" phản hồi nhanh | Giữ ghế nếu hold còn hạn hoặc giải phóng nếu hết |
| **S16 — Electronic Ticket** (`/tickets/:id`) | Tấm thẻ kim loại đen đẳng cấp | Mã QR trắng tương phản tuyệt đối ở trung tâm, thông tin rạp và ghế | **Minimal:** Hiển thị tức thì, sắc nét; không làm méo mã QR | Mã QR đạt độ tương phản chuẩn để máy quét rạp đọc được |
| **S20 — My Bookings / Tickets** (`/my-tickets`) | Danh sách vé theo dòng thời gian | Thẻ vé chia 3 trạng thái: Sắp xem, Đã xem, Đã hủy | **Restrained:** Danh sách xuất hiện so le nhẹ nhàng khi tải | Phân biệt rõ ràng vé còn hạn sử dụng với vé đã soát |
| **S17 / S18 — Cinema Details** (`/cinemas`, `/cinemas/:id`) | Kiến trúc sảnh rạp sang trọng | Ảnh phòng chiếu IMAX màn hình vòm, danh sách phòng và tiện ích | **Restrained:** Ảnh phóng nhẹ khi hover, danh sách suất chiếu rõ ràng | Bản đồ và danh sách phòng chiếu dễ tra cứu |
| **S22A / S22B — Trailers & Gallery** | Mosaic 5 cột bất đối xứng | Ảnh tĩnh 16:9 sắc cạnh, video player tối giản viền chrome | **Expressive:** Mở rộng ảnh mượt trong không gian phẳng | Không gây sụt giảm khung hình khi lướt qua 15 ảnh lớn |
| **S27 — Profile & Preferences** (`/profile`) | Form quản trị cá nhân sắc gọn | Các chip chọn sở thích (IMAX, Sweetbox...), thông tin CineGold VIP | **Restrained:** Phản hồi lưu tức thì | Tùy chọn lưu chuẩn xác làm dữ liệu cho Buaa AI |
| **S30 / S31 — Authentication** (`/auth/login`) | Phân đôi màn hình: Trái ảnh, Phải form | Nửa trái: Backdrop điện ảnh tĩnh; Nửa phải: Form đăng nhập tối giản | **Minimal:** Trường nhập liệu và OTP sắc bén, bảo mật | Hỗ trợ điều hướng bàn phím hoàn hảo |
| **Organizer Web & Mobile** | Mật độ thông tin cao (High Density) | Bảng biểu sắc gọn, thanh trạng thái phòng chiếu, camera quét QR | **Minimal:** Không hiệu ứng thừa; tối ưu 100% cho tốc độ quét vé | Quản lý suất chiếu và soát vé thời gian thực |
| **Customer Mobile Native** | Trải nghiệm Native iOS/Android | Thao tác chạm vuốt mượt mà, lưu vé offline vào bộ nhớ mã hóa | **Restrained:** Cử chỉ bản địa (swipe back, pull to refresh) | Xuất trình vé QR offline mượt mà không cần mạng |

---

## 9. Bộ Prompt Mẫu Chuẩn Gu (Agent & Designer Prompt Templates)

Dưới đây là các đoạn prompt mẫu hoàn chỉnh để bạn hoặc AI coding agent sử dụng khi thiết kế hoặc dựng code:

### Prompt 01 — Thẻ Poster Phim Biên Tập (Editorial Movie Card)
```text
Tạo component thẻ phim theo chuẩn Ferrari Dark Cinema (Cinematic Kinetic Editorial):
- Khung thẻ: Nền #181818, border-radius 0px, viền hairline 1px solid #303030.
- Hình ảnh: Poster phim tỷ lệ chuẩn 2:3 sắc cạnh, không bo góc, tràn sát mép trên thẻ.
- Typography: Tiêu đề phim 16px Inter weight 600 Title Case màu #ffffff. Nhãn thể loại và thời lượng 11px uppercase tracking 0.08em màu #8f8f8f. Điểm CineScore hiển thị kèm icon ngôi sao nhỏ màu #ffffff.
- Hiệu ứng tương tác: Khi hover, thẻ tăng nhẹ scale(1.025), viền hairline chuyển sang màu đỏ #da291c trong 180ms cubic-bezier(0.2, 0, 0, 1). Active press co nhẹ scale(0.98) trong 80ms.
```

### Prompt 02 — Hero Banner Điện Ảnh Tràn Viền (Full-Bleed Hero Panel)
```text
Tạo Hero Banner trang chủ theo chuẩn Ferrari Dark Cinema:
- Khung cảnh: Tràn viền 100vw, chiều cao tối thiểu 85vh. Nền #000000. Ảnh backdrop phim độ phân giải cao phủ lớp gradient mờ tối dần về phía đáy (linear-gradient(to top, #000000 15%, transparent 85%)).
- Bố cục: Bất đối xứng, nội dung dồn về góc dưới bên trái với khoảng đệm cách mép 48px.
- Typography: Dòng phụ đề dẫn dắt 12px uppercase letter-spacing 0.091em màu #8f8f8f. Tiêu đề phim chính 48px Roboto Slab hoặc Inter 700 màu #ffffff hé lộ theo hiệu ứng Kinetic trượt dòng.
- Nút hành động: 2 nút sắc nhọn 0px radius. Nút chính "ĐẶT VÉ NGAY" viền đỏ #da291c hoặc nền trong suốt chữ in hoa 12px tracking 0.083em. Nút phụ "XEM TRAILER" đi kèm biểu tượng play stroke trắng 16px.
```

### Prompt 03 — Sơ Đồ Chọn Ghế Sắc Nét (Sharp Seat Selection Matrix)
```text
Tạo giao diện sơ đồ ghế phòng chiếu S08:
- Nền trang: #000000. Màn hình chiếu (Screen) mô phỏng bằng thanh cong hairline mỏng màu #666666 kèm chữ "MÀN HÌNH" 11px uppercase tracking 0.091em.
- Lưới ghế: Hình học góc nhọn 0px border-radius, kích thước 28x28px, khoảng cách giữa các ghế 6px.
  + Ghế Standard: Nền #181818, viền 1px solid #303030, chữ số ghế 10px màu #8f8f8f.
  + Ghế VIP: Nền #242424, viền 1px solid #666666.
  + Ghế Sweetbox đôi: Kích thước 62x28px, nền #181818, viền #da291c mảnh.
  + Ghế đang chọn: Nền đỏ #da291c, chữ trắng #ffffff, phản hồi tức thì nảy nhẹ scale(1.08) khi bấm.
  + Ghế đã bán: Nền #303030, dấu gạch chéo mờ, vô hiệu hóa con trỏ.
- Bộ đếm thời gian: Khung đếm ngược giữ vé 5 phút hiển thị số phút:giây rõ ràng ở góc trên, viền #303030, khi dưới 2 phút số chuyển màu cảnh báo #d97706.
```

### Prompt 04 — Thẻ Vé Điện Tử QR (E-Ticket Showcase)
```text
Tạo component vé điện tử S16:
- Thẻ vé: Chiều rộng cố định 420px, nền #181818, viền hairline 1px solid #303030, góc nhọn 0px radius, phân chia làm 2 phần bằng đường đứt nét hairline mô phỏng vết xé cuống vé.
- Phần trên (Mã QR): Mã QR kích thước 180x180px render độ tương phản tuyệt đối trên nền trắng có viền bảo vệ. Phía dưới là mã vé "TKT-8892-VN" dạng font monospace 13px màu #8f8f8f.
- Phần dưới (Thông tin): Tiêu đề phim 20px Roboto Slab hoặc Inter 700 màu #ffffff. Bảng thông tin 2 cột gồm Rạp chiếu, Phòng chiếu, Suất chiếu, Hàng ghế. Nhãn chữ 11px uppercase tracking 0.08em màu #8f8f8f, giá trị 14px màu #ffffff. Badge trạng thái "CONFIRMED" màu xanh #2e7d5b với nền wash tối #0d281e, border-radius 4px.
```

---

## 10. Mẫu Khai Báo Mã Nguồn (Code Reference Templates)

### 10.1 CSS Custom Properties Chuẩn

```css
:root {
  /* Colors */
  --color-rosso-corsa: #da291c;
  --color-rosso-scuro: #9d2211;
  --color-bianco-ferrari: #ffffff;
  --color-carbone-nero: #000000;
  --color-notte-profonda: #181818;
  --color-grafite: #303030;
  --color-fumo: #8f8f8f;
  --color-piombo: #666666;
  --color-argento-chiaro: #d2d2d2;
  --color-velo-di-luce: #f7f7f7;
  --color-cemento: #ebebeb;

  /* Semantic */
  --color-success: #2e7d5b;
  --color-success-bg: #0d281e;
  --color-warning: #d97706;
  --color-error: #da291c;

  /* Typography Families */
  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-family-display: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-family-slab: 'Roboto Slab', Georgia, serif;

  /* Typography Scale */
  --text-display: 48px;
  --leading-display: 1.1;
  --text-hero: 36px;
  --leading-hero: 1.2;
  --text-section: 22px;
  --leading-section: 1.3;
  --text-title: 16px;
  --leading-title: 1.4;
  --text-body: 13px;
  --leading-body: 1.78;
  --text-caption: 11px;
  --leading-caption: 1.78;

  /* Spacing */
  --spacing-4: 4px;
  --spacing-6: 6px;
  --spacing-10: 10px;
  --spacing-12: 12px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-32: 32px;
  --spacing-48: 48px;
  --spacing-64: 64px;

  /* Layout */
  --page-max-width-wide: 1760px;
  --page-max-width-contained: 1440px;
  --page-padding-x: 48px;

  /* Border Radius */
  --radius-sharp: 0px;
  --radius-badge: 4px;
  --radius-pill: 9999px;

  /* Motion */
  --motion-duration-fast: 150ms;
  --motion-duration-normal: 250ms;
  --motion-duration-expressive: 450ms;
  --motion-ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --motion-ease-cinematic: cubic-bezier(0.25, 1, 0.5, 1);
  --active-press-scale: scale(0.98);
}
```

### 10.2 Tailwind v4 `@theme` Tham Khảo

```css
@theme {
  --color-rosso-corsa: #da291c;
  --color-rosso-scuro: #9d2211;
  --color-bianco-ferrari: #ffffff;
  --color-carbone-nero: #000000;
  --color-notte-profonda: #181818;
  --color-grafite: #303030;
  --color-fumo: #8f8f8f;
  --color-piombo: #666666;

  --font-base: 'Inter', sans-serif;
  --font-slab: 'Roboto Slab', serif;

  --radius-sharp: 0px;
  --radius-badge: 4px;
  --radius-pill: 9999px;
}
```

---

## 11. Các Thương Hiệu Cùng Hệ Tư Tưởng (Similar Brands & References)

- **Aston Martin:** Không gian điện ảnh đen sâu, ảnh xe tràn viền, chữ in hoa dãn cách rộng, điểm nhấn đơn sắc tiết chế.
- **Porsche:** Bố cục biên tập nền đen với góc nhọn 0px dứt khoát, đường kẻ hairline và hình ảnh tràn sát mép.
- **A24 Films:** Thẩm mỹ biên tập điện ảnh độc bản, typography mang tính kể chuyện, tôn vinh tác phẩm nghệ thuật.
- **Bang & Olufsen:** Tối giản cơ học đỉnh cao, độ chính xác đến từng milimet, không chi tiết trang trí thừa thãi.
