# ADR-0015 — React, Vite và TanStack Router cho Organizer Portal

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý với phương án B của bạn” trong
hội thoại Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`): React 19 + TypeScript + Vite +
TanStack Router cho `apps/organizer-web`. Chỉ chọn stack; chưa scaffold, cài package, sửa ứng dụng,
chọn hosting hoặc chạy runtime/benchmark.

## Context

Organizer phục vụ quản trị viên toàn chuỗi và quản lý rạp: danh mục, phòng/ghế, lịch chiếu,
quyền và báo cáo theo [mô hình sản phẩm](../03-product/use-cases.md).
`apps/organizer-web` hiện chỉ có README; hướng Next.js App Router đã chọn trong
[kiến trúc frontend](../02-architecture/frontend-architecture.md) áp dụng cho `apps/customer-web`.
Core độc lập giữ nghiệp vụ/phân quyền; chưa có nhu cầu RSC hoặc BFF riêng của Organizer được xác nhận.

## Decision

- Chọn **React 19 + TypeScript + Vite + TanStack Router**, theo dạng **SPA**: giao diện/điều hướng
  chạy trên trình duyệt và gọi API có xác thực. Vite tạo assets tĩnh; Router quản lý routes/layouts,
  URL/search params có kiểm kiểu và kiểm dữ liệu đầu vào.
- Dùng khả năng tách tải code theo route của Router/bundler; cấu hình và kiểm bundle thực tế
  khi triển khai, không suy mọi màn hình tự nhẹ hoặc SPA nhanh hơn mọi phương án.
- Không thêm Organizer rendering server/BFF trong quyết định này; endpoint/domain, reverse proxy,
  topology Auth và quy tắc cookie/CORS/CSRF cần thiết kế trước tích hợp. Không tự chọn TanStack Start,
  TanStack Query, UI/form library hoặc hosting chỉ từ tên Router.
- Web khách hàng tiếp tục Next.js 16. Organizer dùng chung Ferrari Dark Cinema và design tokens;
  chia sẻ contracts theo [ADR-0014](0014-zod-json-schema-and-pydantic-contracts.md).

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| Next.js 16 App Router | Thống nhất framework với Web, có RSC/BFF và nơi giữ server-only credentials. Hợp lệ nhưng không chọn cho Organizer; dùng khả năng server động cần runtime/adapter tương ứng. Next cũng có static export với giới hạn. |
| **React/Vite/TanStack Router SPA** | Được chọn: phù hợp bảng, biểu mẫu, bộ lọc/lịch chiếu tương tác trên Core API; typed URL state và static deployment. Thêm pipeline/router khác Web, cần xử lý browser API lifecycle/loading/error/auth. |

## Consequences

- Core kiểm session/token, quyền theo actor và rạp/resource ở từng request. Route guard/menu ẩn
  không cấp quyền; `cinemaId` hợp lệ trong URL không chứng minh được truy cập rạp đó.
- Giữ Better Auth/direct forms đã chọn. Không đặt secret/session/JWT vào URL hoặc bundle, không
  mặc định SPA phải lưu token trong localStorage. Chốt cookie `HttpOnly`/`Secure`/`SameSite`,
  trusted origins, CSRF và credentials cho topology thật; không coi handler Auth bảo vệ mọi Core route.
- Static host phải phục vụ deep links đúng qua fallback `index.html`; đặt cache/version assets và
  hành vi sau deploy phù hợp. `vite preview` không phải production server. Không đưa dữ liệu quản trị
  theo người dùng vào artifact build công khai.
- Bộ lọc/route loaders/cache không thay trạng thái nghiệp vụ Core. Cần đồng bộ lại sau mutation,
  xử lý phiên hết hạn, mất mạng, dữ liệu cũ và quyền bị thu hồi; TanStack Query cho server state
  được chọn tiếp tại [ADR-0017](0017-tanstack-query-and-zustand-for-frontend-state.md).
- Tương thích packages, routing/deep-link, vòng đời phiên, phân quyền và hiệu năng phải được kiểm
  trên đường triển khai thật. Chưa có phép đo để kết luận nhanh hơn Next.js.

### Chi phí

React, Vite và TanStack Router công bố MIT; TypeScript Apache-2.0. Không có phí license theo request.
Hosting/CDN/traffic, build/CI và runtime Core/Auth vẫn có chi phí. Chưa chọn host/tải nên chưa báo
số tiền hoặc kết luận bên nào rẻ hơn. ADR không cấp quyền tạo tài nguyên hay mua dịch vụ.

## References

- [Nghiên cứu framework Organizer](../99-notes/organizer-framework-research.md).
- [Vite static deployment](https://vite.dev/guide/static-deploy).
- [TanStack Router overview](https://tanstack.com/router/latest/docs/overview).
- [Router search params](https://tanstack.com/router/latest/docs/guide/search-params).
- [Router code splitting](https://tanstack.com/router/latest/docs/guide/automatic-code-splitting).
- [Router route guards](https://tanstack.com/router/latest/docs/guide/authenticated-routes).
- [Next BFF](https://nextjs.org/docs/app/guides/backend-for-frontend).
- [Next static export limits](https://nextjs.org/docs/app/guides/static-exports).
- [Better Auth security](https://better-auth.com/docs/reference/security).
- [Design system](../../DESIGN.md).

Nguồn/Context7 đối chiếu ngày 2026-11-17; chưa cài đặt, chạy ứng dụng hoặc kiểm chứng hình ảnh/hiệu năng.
