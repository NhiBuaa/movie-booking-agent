# Organizer Portal: Next.js App Router hay React + Vite + TanStack Router?

Tra cứu 2026-11-17. **Ghi chú nghiên cứu, không phải nguồn quyết định.**
Chủ sản phẩm đã chọn B tại [ADR-0015](../06-decisions/0015-react-vite-and-tanstack-router-for-organizer.md).
Các đề xuất bên dưới giữ bối cảnh lúc nghiên cứu; ADR sở hữu lựa chọn hiện hành. Chưa triển khai.
Nghiên cứu trên worktree `docs-tech-stack-decisions`, detached HEAD `8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.
Chỉ đọc code/tài liệu công khai; không scaffold, cài dependency, sửa source hoặc chạy benchmark/runtime.

## Bối cảnh đã kiểm tra

`apps/organizer` hiện chỉ có [README](../../apps/organizer-web/README.md), mô tả quản trị danh mục, phòng/sơ đồ ghế,
lịch chiếu, quyền và báo cáo cho toàn chuỗi hoặc rạp được giao. Chưa có framework implementation để kế thừa.
[Kiến trúc frontend](../02-architecture/frontend-architecture.md) chọn Next.js 16 + React 19 + TypeScript cho **`apps/web`**;
[package Web](../../apps/customer-web/package.json) có Next/React. Không tự mở rộng lựa chọn đó thành quyết định Organizer.
Core độc lập và [Better Auth direct login](../06-decisions/0008-better-auth-with-direct-login.md) đã có hướng được chọn;
chưa chốt topology auth/domain, hosting hoặc runtime Organizer. Không giả định tải thật hay đội ngũ đã quen công cụ.

## Hai phương án thực tế

| Tiêu chí | A. Next.js 16 App Router | B. React 19 + TypeScript + Vite + TanStack Router SPA |
|---|---|---|
| Đường đi dữ liệu | RSC có thể đọc Core API từ server; Client Components cho form/timeline. Có thể thêm BFF mỏng khi có nhu cầu. | UI/route loaders chạy trong browser, gọi API đã xác thực; Vite build, Router quản lý điều hướng. Không tự thêm backend/BFF. |
| Định tuyến và bộ lọc | File routes/layouts của App Router; params/search vẫn cần parse/validate theo hợp đồng. | Router hỗ trợ typed routes/search params; `validateSearch` có thể dùng Zod 4 trực tiếp cho rạp/ngày/filter/page. |
| Tách tải code | Next có cơ chế chia theo route và phối hợp Server/Client Components. Phải thiết kế ranh giới đúng. | Plugin bundler hỗ trợ `autoCodeSplitting`; cần bật/cấu hình và kiểm chunks, không coi mọi màn hình tự nhẹ. |
| Triển khai | Request-time RSC, cookie đọc phía server hoặc BFF cần Next runtime/adapter phù hợp. Có static export với giới hạn. | SPA build ra assets `dist`; có thể static-host, cần fallback `index.html` cho deep links và cấu hình API/domain. Core/Auth vẫn cần runtime. |
| Điều phối vận hành | Dùng cùng framework Web; thêm một ứng dụng/runtime Next nếu dùng tính năng server. Có chỗ giữ server-only credentials. | Không có Organizer rendering server trong phương án SPA; thêm pipeline Vite/Router khác Web và xử lý browser API lifecycle/error/loading. |

Nguồn: [Next Server/Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components),
[Next BFF](https://nextjs.org/docs/app/guides/backend-for-frontend), [Router search params](https://tanstack.com/router/latest/docs/guide/search-params),
[Router splitting](https://tanstack.com/router/latest/docs/guide/automatic-code-splitting), [Vite deployment](https://vite.dev/guide/static-deploy),
[Router production deployment](https://tanstack.com/router/latest/docs/how-to/deploy-to-production).

Next **không bắt buộc SSR cho mọi trang**, cũng có thể làm SPA/static export. Tuy nhiên export không hỗ trợ
server cookies, Request-dependent Route Handlers, Server Actions hoặc dynamic routes chưa sinh trước theo yêu cầu của nó.
Không xuất session/data quản trị vào artifact build công khai. [Static export limits](https://nextjs.org/docs/app/guides/static-exports).
SPA của B không phải TanStack Start, không bao gồm SSR/BFF hoặc TanStack Query được chọn sẵn.
`vite preview` phục vụ xem build cục bộ, không phải production server. Không suy từ static hosting sang latency thấp nhất.

## Xác thực và giới hạn trách nhiệm — áp dụng cho cả A/B

Giữ Better Auth direct forms; framework UI không thay Core kiểm quyền toàn chuỗi/rạp trên từng request/resource.
Route guard/menu ẩn chỉ giúp trải nghiệm; schema URL hợp lệ không cấp quyền truy cập `cinemaId` đó.
Next Route Handlers cũng là public HTTP endpoints và phải kiểm session/quyền, không tự an toàn nhờ chạy server.
[Next public endpoints](https://nextjs.org/docs/app/guides/backend-for-frontend), [Router route guards](https://tanstack.com/router/latest/docs/guide/authenticated-routes).

Khi thiết kế integration: chốt domain/origin, cookie `HttpOnly`/`Secure`/`SameSite`, credentials, CORS allowlist và CSRF;
không đặt session/JWT/secrets trong URL hay bundle. SPA gọi API không đồng nghĩa phải dùng token trong localStorage.
Better Auth có trusted origins và CSRF checks; bảo vệ của handler không tự áp dụng toàn bộ custom Core routes.
Khác domain có thể bị chặn third-party cookies; same-origin reverse proxy hoặc topology cùng parent domain là lựa chọn cần thiết kế,
không mặc định bật cookie chia toàn bộ subdomain. [Better Auth security](https://better-auth.com/docs/reference/security),
[cookies/domain](https://better-auth.com/docs/concepts/cookies). Chưa thử auth trên topology/browser thật.

## License, chi phí và nhận định

[Next](https://github.com/vercel/next.js/blob/canary/license.md), [React](https://github.com/facebook/react/blob/main/LICENSE),
[Vite](https://github.com/vitejs/vite/blob/main/LICENSE) và [TanStack Router](https://github.com/TanStack/router/blob/main/LICENSE) là MIT;
[TypeScript](https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt) là Apache-2.0. Không có phí license theo request của các công cụ này.
Hosting/CDN/compute/traffic, CI, auth và vận hành vẫn có chi phí; chưa chọn host nên không đưa giá hoặc tuyên bố bên nào rẻ hơn.

**Nghiêng B để thảo luận**: portal quản trị tương tác, dùng Core API đã có hướng rõ và không có yêu cầu RSC/BFF riêng được xác nhận;
typed URL state và SPA static deployment phù hợp tác vụ lọc dữ liệu/lịch chiếu. Đây là đánh giá phù hợp bối cảnh, chưa có phép đo.
**A vẫn hợp lý** nếu muốn thống nhất framework với Web hoặc xác nhận nhu cầu server-rendered personalized data/server-only BFF;
không coi thiếu nhu cầu SEO là bằng chứng Next kém. Hai hướng đều giữ [Ferrari Dark Cinema](../../DESIGN.md) và [tokens](../../packages/design-tokens/tokens.css).
Chưa quyết định Organizer framework, chọn host, thay Web Next hoặc thêm UI/data/form/component libraries.
