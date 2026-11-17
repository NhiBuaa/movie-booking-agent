# ADR-0025 — React Hook Form và Zod 4 cho form frontend

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý với đề xuất A — React Hook Form + Zod 4
của bạn” trong hội thoại Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`).
Phương án A gồm `react-hook-form`, adapter `@hookform/resolvers` và Zod 4; giữ React state cho form nhỏ.
Chỉ chọn công nghệ; chưa cài package, đổi form/UI hoặc kiểm chứng runtime.

## Context

Web dùng Next.js/React, Organizer dùng React/Vite và Mobile dùng Expo/React Native.
Các form nghiệp vụ nhiều trường cần quản lý dữ liệu nhập, lỗi, trường đã sửa, reset, trường động
và trạng thái gửi. Web hiện dùng form/React state; quyết định này không yêu cầu migrate hàng loạt.
[ADR-0014](0014-zod-json-schema-and-pydantic-contracts.md) chọn Zod 4 cho hợp đồng chung;
[ADR-0017](0017-tanstack-query-and-zustand-for-frontend-state.md) phân vai Query/Zustand/local state.
Cần phân biệt bản nháp form, payload API và kết quả nghiệp vụ có thẩm quyền từ Cinema Core.

## Decision

- Chọn **React Hook Form + `@hookform/resolvers` (Zod resolver) + Zod 4** làm mặc định cho
  form nhiều trường/nghiệp vụ trên Web, Organizer và Mobile. Form nhỏ độc lập có thể tiếp tục
  dùng React local state/form thông thường; không bắt thay mọi input bằng một engine.
- Form engine giữ giá trị nhập, errors, touched/dirty, reset và trạng thái submit tại form.
  Giữ Query cho snapshot API/mutation, Zustand cho UI draft thực sự chia sẻ; không lưu trùng
  cùng bản nháp vào nhiều store hoặc tự persist mật khẩu/credential.
- Tái dùng schema hợp đồng phù hợp từ `packages/contracts`; phân biệt input form (ví dụ số/ngày
  dưới dạng chuỗi) với payload API. Chuẩn hóa có chủ đích tại ranh giới gửi; không thêm transform
  JavaScript không xuất được vào wire schema chỉ để phục vụ UI, giữ pipeline JSON Schema/Pydantic.
- Dùng register cho input DOM phù hợp; Controller/useController cho input controlled/native.
  Component/CSS/tokens vẫn theo Ferrari Dark Cinema; lựa chọn form không chọn bộ UI hoặc Tailwind.
- Core tiếp tục kiểm payload, quyền và bất biến nghiệp vụ. Form hợp lệ hoặc submit thành công
  phía client không xác nhận thanh toán, vé hay giữ ghế thành công.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| **React Hook Form + resolvers + Zod 4** | Được chọn: API quản lý dirty/reset/errors/arrays, controlled/native adapter và resolver phân biệt input/output Zod. Thêm dependency adapter và phải hiểu defaultValues/subscriptions; chưa có đo hiệu năng của dự án. |
| TanStack Form + Zod 4 Standard Schema | Hợp lệ, có field subscriptions, validation liên kết/async và hướng dẫn native; không cần adapter Zod riêng. Theo tài liệu đã đọc, validation không tự đưa transformed output vào onSubmit, cần parse riêng. Không bị loại vì kém hiện đại hoặc khác hệ sinh thái. |
| React state/form thông thường | Giữ cho form nhỏ độc lập. Với form phức tạp phải tự quản lý dirty/reset/errors/arrays và async race; không ưu tiên làm mặc định cho mọi form quản trị. DOM/Server Actions không tự chạy trên Expo hoặc Organizer SPA. |

## Consequences

- Pin và kiểm tương thích RHF/resolvers/Zod với React/TypeScript/Expo khi triển khai.
  Peer dependency hỗ trợ React 19 không là bằng chứng Next.js/SSR/hydration/native đã chạy đúng.
  Giữ client boundary đủ nhỏ trên Next; không đưa toàn bộ trang thành client chỉ vì một form.
- Phân biệt `z.input`/`z.output`, dữ liệu resolver đã parse và tùy chọn raw khi chọn API cụ thể.
  Kiểm empty/null/NaN/decimal/ngày giờ, async validation và mảng động; không coi coerce là luật tiền/ngày.
- Nối value/change/blur/ref/focus đúng theo DOM/native; không double-register field.
  Accessibility, bàn phím, focus vào lỗi và thông báo lỗi cần kiểm trên giao diện/thiết bị thực.
- Thiết kế mapping lỗi server, defaultValues/reset khi dữ liệu tải trễ, tránh refetch ghi đè bản nháp,
  và request cũ trả về sau. Không tự chốt lúc validation, autosave hoặc persistence trong ADR này.
- Pending/disable submit chỉ hỗ trợ UX; Core vẫn cần idempotency/concurrency theo feature.
  Timeout chưa rõ không là thất bại giao dịch hoặc quyền gửi lại payment như lệnh mới.
- Chưa cài, migrate form hiện có, chạy suite/SSR/native hoặc đo bundle/render latency;
  không khẳng định đây là thư viện nhanh nhất. Giao diện và hợp đồng triển khai cần đặc tả riêng.

### Chi phí

RHF, resolvers và Zod dùng MIT, không yêu cầu mua SaaS hoặc cloud form backend.
Tích hợp, bảo trì, bundle/validation và CI/thiết bị vẫn có chi phí; chưa đo chi phí tài nguyên của dự án.

## References

- [Nghiên cứu ba hướng và ranh giới input/output](../99-notes/frontend-forms-research.md).
- [React Hook Form Controller](https://react-hook-form.com/docs/usecontroller/controller).
- [Field arrays](https://react-hook-form.com/docs/usefieldarray).
- [Resolvers và Zod 4](https://github.com/react-hook-form/resolvers).
- [TanStack Form validation](https://tanstack.com/form/latest/docs/framework/react/guides/validation).
- [TanStack Form submission handling](https://tanstack.com/form/latest/docs/framework/react/guides/submission-handling).
- [Zod license](https://github.com/colinhacks/zod/blob/main/LICENSE).

Nguồn/Context7 đối chiếu ngày 2026-11-17 trong nghiên cứu liên kết; lựa chọn chưa là bằng chứng tích hợp.
