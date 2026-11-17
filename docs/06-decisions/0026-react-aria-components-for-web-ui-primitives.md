# ADR-0026 — React Aria Components cho nền tương tác Web/Organizer

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý” sau đề xuất A:
React Aria Components cho Web/Organizer trong hội thoại Tech Stack
(`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`). Chỉ chọn công nghệ; chưa cài thư viện,
viết component, migrate UI, build hoặc xác nhận runtime/accessibility.

## Context

Web dùng Next.js/React; Organizer dùng React/Vite. Các màn hình cần dialog, menu,
select/combobox và nhập ngày/giờ với bàn phím, focus, touch và bản địa hóa phù hợp.
`packages/ui` là hướng chia sẻ component Web/Organizer; Web hiện có component/CSS modules riêng.
[DESIGN.md](../../DESIGN.md) và [chuẩn UI](../04-standards/ui-quality.md) giữ thẩm quyền
Ferrari Dark Cinema. [ADR-0025](0025-react-hook-form-and-zod-for-frontend-forms.md) đã chọn
RHF/resolvers/Zod cho form; cần nền hành vi tương tác bổ sung, không thay form engine.

## Decision

- Chọn **React Aria Components** cho component tương tác phức tạp mới hoặc đang sửa trong
  phạm vi được giao của **Web và Organizer**. Tái dùng component/native HTML control đơn giản
  hiện có khi đáp ứng yêu cầu; không yêu cầu migrate hàng loạt hoặc bọc mọi thẻ HTML.
- Component thực sự dùng chung đặt ở `packages/ui` theo kiến trúc hiện có. Tự style bằng
  CSS modules và tokens Ferrari Dark Cinema; không chọn theme Adobe Spectrum, Tailwind,
  shadcn hoặc một bộ font/icon/motion mới chỉ vì ví dụ thư viện sử dụng chúng.
- Giữ React Hook Form/Zod làm chủ dữ liệu/lỗi form theo ADR-0025. Adapter controlled phải
  map đúng value/selection/input text/change/blur/ref và chỉ có một luồng quản lý validation.
- Tận dụng các primitive dialog/menu/select/combobox và date/time theo nhu cầu tính năng.
  Kiểu ngày của UI phải map sang DTO theo hợp đồng; không tự lấy timezone thiết bị làm timezone rạp,
  thay luật lịch chiếu hoặc gửi đối tượng UI tùy ý qua API. Core vẫn kiểm quyền và nghiệp vụ khi ghi.
- Phạm vi là DOM trên Web/Organizer. Mobile Expo/React Native giữ component native riêng;
  có thể chia sẻ tokens/logic phù hợp, không suy package React DOM chạy trực tiếp trên native.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| **React Aria Components** | Được chọn: cùng nền cho combobox và nhập ngày/giờ có bản địa hóa, bên cạnh dialog/menu/select; phù hợp các form quản trị và cho tự style. Cần học anatomy/collections/selection và kiểu date; chưa đo bundle hoặc hiệu năng dự án. |
| Radix Primitives | Hợp lệ cho overlay/menu/select và composition; danh mục chính thức đã đọc chưa có combobox/date/time tương đương. Cần ghép thêm cho phần nhập lịch; không bị loại vì kém hiện đại. |
| Base UI | Hợp lệ, có combobox/autocomplete, CSS Modules và tích hợp RHF; danh mục đã đọc chưa có calendar/date/time tương đương. Không suy Base UI đã bao gồm MUI X hoặc license của sản phẩm khác. |

## Consequences

- Pin và kiểm tổ hợp React Aria/React/Next/Vite khi triển khai; tài liệu hỗ trợ framework không
  chứng minh dự án đã build/hydrate đúng. Giữ client boundary đủ nhỏ, kiểm portal/provider/locale.
- Tự kiểm composition, labels/errors, focus trap/restore, nested popup, Tab/Escape/arrows,
  screen reader, viewport nhỏ, touch và IME tiếng Việt. Primitive có hành vi accessibility
  không tự bảo đảm toàn ứng dụng đạt WCAG; phải kiểm render và tác vụ theo chuẩn dự án.
- Kiểm adapter RHF với reset, empty/null/disabled, validation và dữ liệu bất đồng bộ;
  không suy submit hợp lệ thành Core đã xác nhận giao dịch/vé. Ngày/giờ phải theo đặc tả miền nghiệp vụ.
- Không chọn scheduler/timeline kéo thả, data grid, chart, seat-map engine hoặc thuật toán xếp lịch
  trong ADR này. Chọn widget chuyên biệt theo nhu cầu feature, tránh thêm thư viện trước khi có yêu cầu.
- Import phần cần dùng và đo bundle/render thực tế trước tuyên bố tối ưu; không lấy độ phủ component,
  thương hiệu hoặc độ mới làm bằng chứng nhanh nhất. Chưa cài, rewrite UI hoặc chạy native/Web runtime.

### Chi phí

React Aria Components dùng Apache-2.0, không bắt mua SaaS hoặc giấy phép thương mại để dùng bản nguồn mở.
Giữ notices theo license khi phân phối. Style, adapters, bảo trì, tải JavaScript và kiểm chứng vẫn có chi phí;
chưa có phép đo/tổng chi phí tài nguyên dự án. Không mua thêm dịch vụ Adobe hoặc theme trả phí.

## References

- [Nghiên cứu React Aria, Radix và Base UI](../99-notes/web-ui-primitives-research.md).
- [React Aria Components](https://react-aria.adobe.com/).
- [Styling](https://react-aria.adobe.com/styling).
- [Forms và tích hợp React Hook Form](https://react-aria.adobe.com/forms).
- [DatePicker](https://react-aria.adobe.com/DatePicker).
- [Framework integration](https://react-aria.adobe.com/frameworks).
- [Apache-2.0 license](https://github.com/adobe/react-spectrum/blob/main/LICENSE).

Nguồn/Context7 đối chiếu ngày 2026-11-17 trong nghiên cứu liên kết; lựa chọn không là bằng chứng tích hợp.
