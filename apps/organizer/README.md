# Cinema Organizer Portal (`apps/organizer`)

Portal mục tiêu phục vụ quản trị viên toàn chuỗi và quản lý rạp của một đơn vị/chuỗi rạp.
Đây là mô tả trách nhiệm, không xác nhận scaffold đã triển khai đầy đủ; xem [CONTEXT](../../CONTEXT.md).

**Stack đã chọn:** React 19 + TypeScript + Vite + TanStack Router, theo dạng SPA, tại
[ADR-0015](../../docs/06-decisions/0015-react-vite-and-tanstack-router-for-organizer.md).
Giao diện gọi API có xác thực; Core kiểm quyền theo actor/rạp. Giữ Ferrari Dark Cinema và tokens chung.
Dữ liệu API/UI state theo [ADR-0017](../../docs/06-decisions/0017-tanstack-query-and-zustand-for-frontend-state.md).
Form nghiệp vụ chọn React Hook Form + resolvers + Zod 4 theo
[ADR-0025](../../docs/06-decisions/0025-react-hook-form-and-zod-for-frontend-forms.md); form nhỏ có thể dùng React state.
Nền component tương tác chọn React Aria Components theo
[ADR-0026](../../docs/06-decisions/0026-react-aria-components-for-web-ui-primitives.md), giữ CSS modules/tokens;
không yêu cầu migrate hàng loạt. Chưa scaffold/cài package, chọn host/topology Auth hoặc xác nhận runtime.

**Kiểm thử mục tiêu:** Vitest + React Testing Library và Playwright theo
[ADR-0021](../../docs/06-decisions/0021-layered-testing-stack-for-platform.md); chưa cấu hình hoặc chạy.

## Responsibilities

- Danh mục phim/trailer, giá vé/ưu đãi, phòng và sơ đồ ghế riêng, lịch chiếu, cấp/thu hồi quyền,
  báo cáo vận hành/doanh thu theo M-01–M-07 và phạm vi actor đã chốt.
- Media M-01: upload/lưu poster, banner và ảnh; trailer dùng URL/video nhúng từ nguồn ngoài.
  R2 Standard giữ ảnh gốc, Cloudflare Images xử lý ảnh theo
  [ADR-0019](../../docs/06-decisions/0019-r2-and-cloudflare-images-for-catalog-media.md);
  chưa tích hợp, bản đầu không tự lưu/phục vụ video trailer.
- Xét yêu cầu hủy, theo dõi hủy/hoàn, đề nghị và duyệt hủy suất theo R-02–R-06.
  Quyết định duyệt chưa đồng nghĩa tiền đã hoàn; quản lý không tự có quyền duyệt hủy suất.
- Phân biệt quyền toàn chuỗi và rạp được giao; không ngầm cấp quyền soát vé hoặc giao combo cho quản lý.

[Mô hình use case](../../docs/03-product/use-cases.md) sở hữu quyền/mục tiêu;
[mô tả use case](../../docs/03-product/use-case-descriptions.md) sở hữu điều kiện và ngoại lệ.
Quyền quản lý danh mục/giá combo, cách xử lý hoàn và chỉ số báo cáo còn theo OPEN-01–OPEN-10;
không coi dữ liệu mẫu hay vai trò “movie distributor” là yêu cầu được duyệt.
