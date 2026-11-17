# Primitive tương tác cho Web và Organizer

Tra cứu nguồn chính thức và Context7 (`/websites/react-aria_adobe`) ngày 2026-11-17.
**Phương án A đã được chấp thuận tại [ADR-0026](../06-decisions/0026-react-aria-components-for-web-ui-primitives.md); chưa cài thư viện hoặc duyệt thay component.**
Các so sánh/đề xuất dưới đây giữ bối cảnh nghiên cứu trước quyết định; ADR sở hữu lựa chọn hiện hành.
Đích: worktree `docs-tech-stack-decisions/movie-booking-agent`, detached HEAD `8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.
Chỉ ghi tài liệu; không sửa code/config, build, chạy UI, mua dịch vụ hoặc commit.

## Phạm vi và hiện trạng

Web Next 16/React 19 và Organizer React/Vite cần dialog, menu, select/combobox, nhập ngày/giờ.
Đây là lớp hành vi DOM và accessibility, không phải công cụ thiết kế màn hình, backend hoặc thư viện DB.
Mobile Expo/React Native giữ component native riêng; không suy package React DOM chạy trực tiếp trên Mobile.
Root `DESIGN.md` và [chuẩn UI](../04-standards/ui-quality.md) tiếp tục sở hữu Ferrari Dark Cinema,
tokens, hình học góc vuông và chất lượng; CSS modules hiện có không buộc đổi sang Tailwind/shadcn/theme.
Đã đọc `packages/ui` hiện chỉ có README/package metadata; `TrailerModal.tsx` trong Web có markup và xử lý local.
Điều đó chưa chứng minh một bộ primitive chung đã tồn tại hoặc component hiện có đã qua kiểm chứng accessibility.
Giữ code/nội dung/giao diện hiện hữu; không lấy việc chọn thư viện làm quyền migrate hàng loạt.
RHF + resolvers + Zod 4 đã được chọn cho form nghiệp vụ tại
[ADR-0025](../06-decisions/0025-react-hook-form-and-zod-for-frontend-forms.md); primitive không thay form engine đó.

## Ba hướng khả thi

| Hướng | Phạm vi mạnh so với nhu cầu | Đánh đổi |
|---|---|---|
| **A. React Aria Components** | Modal/dialog, menu, Select/ComboBox; DateField/TimeField/Calendar/DatePicker; hành vi keyboard/touch và internationalization cùng hệ. | Phải học anatomy/collections/selection và kiểu date riêng; tự làm style/wrappers. Bao phủ ngày/giờ giúp giảm ghép thêm thư viện cho Organizer. |
| **B. Radix Primitives** | Dialog/popover/menu/select, keyboard/focus và composition qua `asChild`; cho phép controlled/uncontrolled. | Danh mục chính thức hiện đọc chưa có primitive ComboBox/DatePicker/TimeField; cần bổ sung hoặc tự xây phần đó, không biến Select thành searchable combobox chỉ bằng input. |
| **C. Base UI** | Dialog/menu/select, Combobox/Autocomplete, Number Field; composition mở và CSS Modules có ví dụ chính thức. | Danh mục hiện đọc chưa có calendar/date/time picker; phải chọn thêm cho lịch. Có form integration nhưng không thay RHF; không chọn chỉ vì mới hoặc cùng tác giả Radix/Material UI. |

[React Aria danh mục](https://react-aria.adobe.com/), [Radix Introduction/danh mục](https://www.radix-ui.com/primitives/docs/overview/introduction),
[Base UI About/danh mục](https://base-ui.com/react/overview/about), [Base UI Combobox](https://base-ui.com/react/components/combobox).
Việc chưa thấy trong danh mục không phải cam kết roadmap hoặc kết luận không thể ghép thành giải pháp.

## Style và khả năng điều khiển

Cả ba cho tự style; A nhận `className`/style và trạng thái, B không cung cấp theme bắt buộc,
C không bundle CSS và hỗ trợ CSS Modules. Ánh xạ trạng thái focus/pressed/selected/invalid/disabled vào tokens hiện có.
[Aria styling](https://react-aria.adobe.com/styling), [Radix architecture](https://www.radix-ui.com/primitives/docs/overview/introduction),
[Base UI CSS](https://base-ui.com/react/overview/about).
Không copy màu/bo góc/icon từ demo vào sản phẩm. Chọn primitives không tự chọn Radix Themes, Adobe Spectrum theme,
MUI Material, bộ font hoặc motion mới. Wrapper chỉ gom anatomy/labels/style thực sự lặp, không tạo design-system framework mới.
Với nút/text input/native select đơn giản đang đáp ứng yêu cầu, reuse là hợp lý; không cần bọc mọi thẻ HTML.

## Form controlled và ngày/giờ

A có hướng dẫn RHF `Controller`: nối value/change/blur/ref, invalid/error; chọn cách validation để không có hai owner báo lỗi.
Không copy nguyên TextField adapter sang Select/ComboBox: phải map đúng selected key/input text và sự kiện của component.
[React Aria forms](https://react-aria.adobe.com/forms).
B Select có controlled value/onValueChange; C có [hướng dẫn RHF chính thức](https://base-ui.com/react/handbook/forms).
Mọi hướng vẫn cần kiểm ref/focus, label/error, null/empty/disabled và reset với RHF; không suy browser native validation
tự thay Zod hoặc server validation. Primitive chỉ giữ giá trị hiển thị, không quyết giá/voucher/quyền rạp.

A dùng `@internationalized/date` cho date-only, local date-time và zoned date-time; DatePicker hỗ trợ locale,
calendar và granularity. Cần map sang DTO theo hợp đồng, không serialize đối tượng UI tùy ý vào wire schema.
[Aria DatePicker](https://react-aria.adobe.com/DatePicker), [DateField](https://react-aria.adobe.com/DateField).
Múi giờ suất chiếu là quyết định miền nghiệp vụ: không tự lấy timezone thiết bị làm timezone rạp hoặc đổi date-only thành UTC.
Calendar widget không giải quyết xung đột phòng/suất, giờ hợp lệ hoặc quyền; Core kiểm lại khi ghi.
Chọn A cũng không bao hàm scheduler, timeline chỉnh lịch kéo thả, data grid hoặc thuật toán xếp lịch.
Base UI là dự án OSS riêng; không suy logo/nguồn gốc Material UI đồng nghĩa đã có MUI X Date Pickers,
hoặc mọi tính năng date range/pro đều miễn phí. Nếu xét thêm sản phẩm đó phải so sánh capability/license riêng.

## SSR, bundle và kiểm chứng accessibility

A có [hướng dẫn Next/Vite](https://react-aria.adobe.com/frameworks); B có [SSR guide](https://www.radix-ui.com/primitives/docs/guides/server-side-rendering);
C công bố React 17+ và các bundler hiện hành gồm Vite/Turbopack. Đây không phải bằng chứng build Next 16/React 19.3 của dự án.
Khi triển khai pin phiên bản/React peer/export paths; interactive client boundary, provider locale, portal và hydration
phải khớp framework. Không biến cả cây Next thành client hoặc chuyển Organizer sang SSR vì chọn primitive.
Import phần cần dùng; kiểm tree-shaking và bundle thực với toolchain, không xếp hạng nhẹ/nhanh theo số component hoặc marketing.
Các thư viện cung cấp hành vi WAI-ARIA/focus/keyboard nhưng **không tự bảo đảm toàn ứng dụng đạt WCAG**.
Composition sai, thiếu label, contrast thấp hoặc popup bị che vẫn có thể phá trải nghiệm.
Kiểm Tab/Shift+Tab/Escape/arrows/typeahead, focus trap/restore của dialog, nested popup, screen reader,
touch/viewport nhỏ và input IME tiếng Việt; kiểm combobox loading/empty/error và ngày/giờ theo locale.
Kiểm qua render thật, keyboard/screen reader và test phù hợp [chuẩn UI](../04-standards/ui-quality.md);
thư viện headless không thay design review, native QA hoặc kiểm Core. Chưa có runtime/UI/bundle benchmark ở đây.

## License, chi phí và đề xuất

React Aria Components thuộc repo Adobe React Spectrum với [Apache-2.0](https://github.com/adobe/react-spectrum/blob/main/LICENSE);
Radix Primitives [MIT](https://github.com/radix-ui/primitives/blob/main/LICENSE), Base UI [MIT](https://github.com/mui/base-ui/blob/master/LICENSE).
Không bắt mua SaaS hoặc license thương mại cho các thư viện OSS đang so sánh; giữ notices theo license khi phân phối.
Chi phí thực nằm ở style, adapter/wrappers, kiểm chứng, bảo trì và tải JS; chưa có tổng chi phí hoặc phép đo dự án.

**Ưu tiên A — React Aria Components cho primitive phức tạp Web/Organizer mới hoặc đang sửa trong scope**, reuse component/native control đơn giản hiện có.
Lý do: cùng nền cho combobox và nhập ngày/giờ có locale/timezone, giảm tự xây/ghép phần nhập lịch cần cho Organizer,
vẫn giữ CSS modules và bản sắc riêng. Chủ dự án mạnh backend/chấp nhận học complexity: anatomy và kiểu date là chi phí hợp lý
nếu feature thực sự dùng chúng; không chọn vì thương hiệu hoặc lời hứa accessibility tuyệt đối.
B phù hợp nếu trọng tâm overlay/menu/select và chấp nhận bổ sung date/combobox; C phù hợp nếu ưu tiên combobox/composition
và chấp nhận chọn lớp ngày/giờ riêng. Không cần cài cả ba hoặc dựng wrapper thống nhất cho mọi API.
Chọn A chỉ chọn nền tương tác, không quyết version, redesign, migrate toàn bộ UI hoặc cấp quyền cài đặt/chạy ứng dụng.
