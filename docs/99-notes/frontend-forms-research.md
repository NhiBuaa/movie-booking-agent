# Quản lý form cho Web, Organizer và Mobile

Tra cứu nguồn chính thức và Context7 (`/react-hook-form/documentation`, `/tanstack/form`) ngày 2026-11-17.
**Phương án A đã được chấp thuận tại [ADR-0025](../06-decisions/0025-react-hook-form-and-zod-for-frontend-forms.md); chưa duyệt triển khai.**
So sánh/đề xuất dưới đây giữ bối cảnh trước quyết định; ADR sở hữu lựa chọn hiện hành.
Đích: worktree `docs-tech-stack-decisions/movie-booking-agent`, detached HEAD `8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.
Chỉ ghi tài liệu; không cài package, sửa UI/code/config, build/test hoặc gọi runtime/provider.

## Bối cảnh và trách nhiệm

Web hiện có Next 16.4.5/React 19.3.1 trong `apps/web/package.json`, chưa có thư viện form.
Form local hiện có không tạo nghĩa vụ migrate hàng loạt; lựa chọn này dành cho implementation sau khi được duyệt.
Organizer mục tiêu React/Vite SPA cần form phim/lịch/giá/voucher; Mobile dùng Expo/React Native.
[ADR-0014](../06-decisions/0014-zod-json-schema-and-pydantic-contracts.md) đã chọn Zod 4 cho hợp đồng,
nhưng chưa cài/đấu validation runtime. Không coi type TypeScript là kiểm tra dữ liệu thật.
[ADR-0017](../06-decisions/0017-tanstack-query-and-zustand-for-frontend-state.md) giữ Query cho API snapshot/mutations,
Zustand cho draft UI chia sẻ khi cần; engine form giữ input/errors/touched/dirty/submission tại form.
Không nhân cùng bản nháp vào cả form store, Query và Zustand hoặc persist credential theo draft.
Logic form độc lập thiết kế: giữ Ferrari Dark Cinema trong root `DESIGN.md`, CSS modules/tokens hiện có;
không thêm Tailwind, shadcn hoặc bộ component chỉ vì ví dụ của thư viện sử dụng chúng.

## Ba phương án

| Hướng | Bundle / phù hợp | Đánh đổi |
|---|---|---|
| **A. React Hook Form + resolvers + Zod 4** | `react-hook-form`, `@hookform/resolvers/zod`; input HTML đơn giản qua register, input controlled/native qua Controller; arrays và server errors có API riêng. | Cần học cơ chế register/subscriptions/defaultValues/reset; native vẫn phải nối value/change/blur/ref. Resolver là dependency adapter thêm, đổi lại có đường phân biệt input/output Zod khi submit. |
| **B. TanStack Form + Zod 4 Standard Schema** | `@tanstack/react-form`; field/form validation, linked fields/arrays, async validation và subscriptions tường minh; native có hướng dẫn. | Controlled field wiring và cấu trúc types cần học; validation Standard Schema không đưa transformed output vào onSubmit. Không chọn chỉ vì đã có Query/Router cùng hãng. |
| **C. React local/native form** | Web `<form>`/FormData/React Actions hoặc state; RN TextInput/state; thêm Zod parse khi cần. | Không thêm engine, thích hợp ít trường độc lập; tự giữ errors/dirty/reset/arrays/async race khi phức tạp. API DOM/Server Actions không tự áp dụng cho Expo hoặc Organizer SPA. |

[RHF Controller](https://react-hook-form.com/docs/usecontroller/controller), [RHF arrays](https://react-hook-form.com/docs/usefieldarray),
[TanStack validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation),
[React form](https://react.dev/reference/react-dom/components/form).

## A — tương thích và ranh giới input/output

RHF có Controller/useController cho input controlled, gồm RN TextInput qua `onChangeText`, `onBlur`, `value`;
phải có defaultValues phù hợp, không double-register cùng field. Ref/focus và keyboard cần kiểm trên native.
[RHF native examples](https://github.com/react-hook-form/documentation/blob/master/src/content/get-started.mdx).
Resolver hiện hỗ trợ import Zod/Zod v4, suy output và khai báo `useForm<Input, Context, Output>`.
Mặc định trả dữ liệu đã parse; `raw: true` trả input, không được suy cả hai chế độ có cùng kiểu/giá trị.
[Resolver README](https://github.com/react-hook-form/resolvers), [Zod resolver source](https://github.com/react-hook-form/resolvers/blob/master/zod/src/zod.ts).
Ví dụ form nhập số bằng chuỗi: phân biệt `z.input`/`z.output`, chuyển rỗng/NaN/decimal/ngày giờ có chủ đích;
không coi coerce mặc định là quy tắc tiền/ngày của nghiệp vụ. Async refinement phải dùng parse async phù hợp.
Core wire schema tiếp tục theo profile xuất JSON Schema/Pydantic đã duyệt; form-only parsing/formatting ở boundary,
không thêm transform JavaScript không xuất được vào hợp đồng chung chỉ để tiện hiển thị.

## B — Standard Schema hợp lệ nhưng không tự normalize submit

TanStack nhận Zod qua Standard Schema trực tiếp, không cần adapter Zod riêng; có sync/async validation và debounce.
Giá trị `onSubmit` vẫn là **input**; muốn output phải parse schema trong submit rồi xử lý lỗi/async phù hợp.
[Validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation),
[Submission transforms](https://tanstack.com/form/latest/docs/framework/react/guides/submission-handling).
RN sử dụng field value/handleChange nối TextInput `onChangeText`; headless không đồng nghĩa mọi widget web chạy trên RN.
[Native guide](https://tanstack.com/form/latest/docs/framework/react/guides/react-native).
Đây là khác biệt luồng dữ liệu, không phải thiếu hỗ trợ Zod 4 hoặc lý do loại B trong mọi dự án.

## Next/React 19 và kiểm chứng còn thiếu

Metadata nguồn hiện khai peer React 19 cho cả [RHF](https://github.com/react-hook-form/react-hook-form/blob/master/package.json)
và [TanStack React Form](https://github.com/TanStack/form/blob/main/packages/react-form/package.json);
peer range không chứng minh tổ hợp Next 16/React 19.3/Expo của dự án đã build hoặc hydrate đúng.
Interactive hooks cần client boundary trên Next; không đặt toàn cây vào client chỉ vì một form.
TanStack có [SSR/Next guide](https://tanstack.com/form/latest/docs/framework/react/guides/ssr), cần integration đúng framework;
không tự chuyển Organizer sang SSR hoặc thêm Start. React 19 Actions là lựa chọn Web, chưa phải backend API mới đã chọn.
Shared logic/schema có thể tái dùng; component/error focus/accessibility DOM và native vẫn cần adapter riêng.
Khi triển khai, pin RHF/resolver/Zod hoặc TanStack/Zod cùng React/TS/Expo; nguồn nhánh main không thay version đã kiểm.

## Validation UI không thay Cinema Core

- Core phải tự kiểm payload/quyền/rạp, lịch trùng, giá/voucher/hold/thanh toán theo hợp đồng và trạng thái hiện hành;
  thông báo hợp lệ ở client hoặc async check không bảo đảm thao tác commit sẽ được chấp nhận.
- Pending/disable submit giảm thao tác lặp UI nhưng không thay idempotency/concurrency phía Core; timeout chưa rõ
  không tự gửi lại thanh toán như lệnh mới. Không báo vé đã phát từ toast hoặc form success cục bộ.
- Mapping lỗi field/form, dữ liệu edit tải trễ và refetch không ghi đè draft cần thiết kế theo feature;
  kiểm empty/null/number/date/arrays, reset/dirty, request cũ tới muộn và server từ chối sau client pass.
- Kiểm bàn phím/focus, label/error announcement, submit lỗi và giữ dữ liệu khi lỗi trên Web/RN; giữ UI tokens.
  Test logic không thay kiểm native hoặc render. Nghiên cứu này chưa chạy bằng chứng runtime/hiệu năng/UI.

## Chi phí và đề xuất

RHF và TanStack React Form dùng MIT theo metadata ở trên; resolvers cũng [MIT](https://github.com/react-hook-form/resolvers/blob/master/package.json).
A thêm engine + adapter trên Zod đã chọn; B thêm engine/form-core/store, không cần Zod adapter; C không thêm engine.
Không buộc mua SaaS/cloud; chi phí nằm ở implementation, bảo trì, bundle, validation và CI/thiết bị. Chưa đo bundle/render latency,
không xếp hạng nhanh nhất hoặc dùng benchmark/độ phổ biến làm bằng chứng trong dự án.

**Đề xuất A làm mặc định cho form nhiều trường/nghiệp vụ; C cho form nhỏ độc lập.**
Lý do: cùng API quản lý dirty/reset/errors/arrays trên các kênh, adapter controlled cho native và output parsing Zod rõ,
giảm phải tự xây form engine cho Organizer. Chủ dự án mạnh backend/chấp nhận học phức tạp có thể dùng B tốt;
chưa có nhu cầu listener/dynamic validation đặc thù đủ để ưu tiên mô hình controlled/subscriptions của B ở vòng này.
B vẫn hợp lệ nếu ưu tiên validation theo sự kiện/thay đổi liên kết tường minh và chấp nhận parse output riêng.
Chọn A không bắt migrate form đơn giản, thay UI, bật SSR hay duyệt cài đặt; phiên bản/feature implementation chốt sau.
