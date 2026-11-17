# Chuẩn chất lượng UI/UX — Movie Booking Platform

Tài liệu này xác định các tiêu chuẩn bắt buộc khi thiết kế, triển khai và review giao diện trên toàn bộ nền tảng (**Web**, **Mobile**, và **Organizer Portal**).

---

## 1. Bản sắc thị giác & Design Tokens (Dark Cinema Style)

Nền tảng sử dụng phong cách **Ferrari Dark Cinema** được đặc tả tại root [`DESIGN.md`](../../DESIGN.md):
- **Phông nền điện ảnh**: Gam màu đen sâu chủ đạo (`--color-carbone-nero: #000000`, `--color-notte-profonda: #181818`), nổi bật nhờ hình ảnh poster và trailer full-bleed.
- **Màu tín hiệu nhận diện**: Màu đỏ Rosso Corsa (`--color-rosso-corsa: #DA291C`) chỉ dùng làm điểm nhấn hành động then chốt, trạng thái active hoặc báo lỗi giao dịch; không rải rác làm loãng thị giác.
- **Đường nét hình học tối giản**: Viền mỏng như sợi tóc (`1px solid var(--color-grafite)`), các góc phẳng hoặc bo rất nhẹ (`border-radius: 0px` hoặc `4px`), không dùng nút bấm bo tròn quá đà làm mất chất điện ảnh.
- **Kiểu chữ nghiêm cẩn**: Kiểu chữ sans-serif hiện đại (`Inter`, `Helvetica Neue`), nhãn uppercase với tracking rộng (`letter-spacing: 0.05em - 0.09em`).

---

## 2. Tiêu chuẩn 4 giai đoạn phát triển giao diện

Mọi màn hình hoặc thành phần UI mới phải trải qua 4 giai đoạn kiểm chứng:

1. **Giai đoạn 1 — Bố cục & Phân cấp (Layout & Visual Hierarchy)**:
   - Sử dụng khoảng trắng (negative space) và căn lề thay vì lạm dụng khung viền.
   - Web/Organizer sử dụng biến CSS từ `@platform/design-tokens`; Mobile ánh xạ cùng token sang
     native theme theo [ADR-0016](../06-decisions/0016-expo-router-and-mobile-native-foundation.md).
     `DESIGN.md` vẫn sở hữu bản sắc; không bắt UI native áp dụng CSS của Web.
2. **Giai đoạn 2 — Công thái học & Trạng thái (Interactions & States)**:
   - Control tương tác phải có trạng thái `Default`, `Active/Pressed`, `Disabled` khi áp dụng;
     `Hover` và `Focus Visible` theo khả năng con trỏ/bàn phím của nền tảng. Mobile giữ phản hồi chạm
     và accessibility focus tương ứng; không bỏ trạng thái cần thiết trên Web/Organizer.
   - Phản hồi tức thời với các tác vụ chọn ghế, bộ đếm ngược thời gian giữ vé và thanh toán.
3. **Giai đoạn 3 — Khả năng tiếp cận & Render thực tế (a11y & Render Verification)**:
   - Độ tương phản chữ và nền đạt chuẩn WCAG AA (tối thiểu 4.5:1 cho body text).
   - Hỗ trợ đầy đủ điều hướng bằng bàn phím (Tab, Enter, Space, Escape) trên toàn bộ Web và Organizer Portal.
   - Kích thước vùng chạm trên màn hình cảm ứng tối thiểu 44×44px.
4. **Giai đoạn 4 — Hiệu năng khung hình (Animation & Performance)**:
   - Chuyển động (Transitions) chỉ tác động vào các thuộc tính `transform` và `opacity` để giữ vững 60fps/120fps mà không gây layout thrashing.

---

## 3. Trạng thái giao dịch và xử lý lỗi

Giao diện không bao giờ để người dùng rơi vào trạng thái bế tắc:
- **Loading State**: Sử dụng skeleton loaders đúng hình dạng layout thay vì spinner tròn đơn điệu.
- **Empty State**: Hướng dẫn người dùng hành động tiếp theo (ví dụ: gợi ý phim hot khi tìm kiếm không ra kết quả).
- **Error State**: Nêu rõ nguyên nhân lỗi và cung cấp nút hành động khắc phục cụ thể (ví dụ: "Thử lại", "Chọn ghế khác").
