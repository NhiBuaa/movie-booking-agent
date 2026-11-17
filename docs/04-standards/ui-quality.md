# Chuẩn chất lượng UI/UX — Movie Booking Platform

Tài liệu này xác định tiêu chuẩn thiết kế, triển khai và review cho bốn ứng dụng
Customer Web/Mobile và Organizer Web/Mobile theo
[ADR-0002](../06-decisions/0002-customer-organizer-app-boundaries.md).
Đọc PRODUCT của app để xác định người dùng, tác vụ và nền tảng;
[hướng dẫn công cụ](../07-guides/development-tools.md#bối-cảnh-impeccable) dẫn tới từng bối cảnh.

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
   - App cảm ứng không phụ thuộc hover để hoàn thành tác vụ.
   - Phản hồi tức thời với các tác vụ chọn ghế, bộ đếm ngược thời gian giữ vé và thanh toán.
3. **Giai đoạn 3 — Khả năng tiếp cận & Render thực tế (a11y & Render Verification)**:
   - Độ tương phản chữ và nền đạt chuẩn WCAG AA (tối thiểu 4.5:1 cho body text).
   - Hai app Web hỗ trợ điều hướng bàn phím (Tab, Enter, Space, Escape).
     App iOS/Android hỗ trợ trình đọc màn hình, cỡ chữ hệ thống, vùng an toàn và thao tác quay lại của hệ.
   - Vùng chạm tối thiểu: Web 44×44 CSS px; iOS 44×44 pt; Android 48×48 dp.
4. **Giai đoạn 4 — Hiệu năng khung hình (Animation & Performance)**:
   - Web chỉ dùng `transform` và `opacity` cho chuyển động, tránh tính lại bố cục mỗi khung hình.
     Mobile dùng cơ chế chuyển động phù hợp nền tảng/framework. Tôn trọng cài đặt giảm chuyển động;
     kết luận về 60fps/120fps cần đo trên môi trường liên quan, không suy ra từ việc dùng một thuộc tính.

Web cần bằng chứng từ trình duyệt; app native cần simulator/emulator hoặc thiết bị và ghi rõ nguồn.
PRODUCT, thiết kế Figma, cấu hình live hoặc build đạt không tự xác nhận giao diện đã đạt bốn giai đoạn này.

---

## 3. Trạng thái giao dịch và xử lý lỗi

Giao diện không bao giờ để người dùng rơi vào trạng thái bế tắc:
- **Loading State**: Sử dụng skeleton loaders đúng hình dạng layout thay vì spinner tròn đơn điệu.
- **Empty State**: Hướng dẫn người dùng hành động tiếp theo (ví dụ: gợi ý phim hot khi tìm kiếm không ra kết quả).
- **Error State**: Nêu rõ nguyên nhân lỗi và cung cấp nút hành động khắc phục cụ thể (ví dụ: "Thử lại", "Chọn ghế khác").
