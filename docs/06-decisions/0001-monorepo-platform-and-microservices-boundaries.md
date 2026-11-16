# ADR-0001 — Kiến trúc Monorepo Platform và Ranh giới Microservices

## Status

Accepted

Phần phân chia ứng dụng trong quyết định này được thay bởi
[ADR-0002](0002-customer-organizer-app-boundaries.md) ngày 2026-11-16.
Nội dung bên dưới giữ ngữ cảnh quyết định ban đầu; các ranh giới dịch vụ vẫn có hiệu lực.

## Context

Dự án ban đầu được khởi tạo như một đồ án môn học UI/UX đơn lẻ. Khi mở rộng thành một **Nền tảng hoàn chỉnh (Full Platform)** phục vụ cả 3 đối tượng người dùng:
1. **Khách hàng xem phim**: Đặt vé qua Web (`apps/web`), App Di động (`apps/mobile`), hoặc đàm thoại tự nhiên với AI Agent (`services/agent-service`).
2. **Nhà tổ chức & Quản lý rạp**: Upload phim, cấu hình phòng chiếu, lập lịch và đối soát qua Web Portal (`apps/organizer`); quét mã QR soát vé tại cửa bằng App di động (`apps/mobile`).
3. **Hệ thống giao dịch cốt lõi**: Quản lý tồn kho ghế, khóa giữ vé (Hold TTL 5 phút), thanh toán và phát hành vé điện tử có chữ ký số (`services/cinema-core`).

Vấn đề đặt ra là: Làm thế nào để tổ chức mã nguồn và kiến trúc hệ thống để vừa đảm bảo tốc độ phát triển, vừa tái sử dụng tối đa hệ thống quy chuẩn thiết kế (Ferrari Dark Cinema tokens), vừa đảm bảo tính an toàn giao dịch và sẵn sàng mở rộng thành các microservices độc lập khi lượng truy cập tăng cao?

## Decision

Nhóm kỹ thuật quyết định áp dụng mô hình **Modular Monorepo Platform với Ranh giới Microservices Rõ ràng**:

1. **Cấu trúc Monorepo Workspace**:
   - Sử dụng **npm workspaces** (sẵn sàng tích hợp Turborepo) để quản lý tập trung toàn bộ ứng dụng và dịch vụ.
   - Các ứng dụng giao diện nằm trong `apps/`: `web`, `organizer`, `mobile`.
   - Các dịch vụ backend nghiệp vụ nằm trong `services/`: `cinema-core`, `agent-service`.
   - Các thư viện chia sẻ nằm trong `packages/`: `design-tokens`, `contracts`, `ui`, `shared-logic`.

2. **Ranh giới dịch vụ độc lập (Service Boundaries)**:
   - **`services/cinema-core` (Cinema Core Backend)**: Là **Nguồn chân lý duy nhất (Single Source of Truth)** về trạng thái tồn kho suất chiếu, khóa giữ chỗ (Atomic Hold TTL), giá vé, xác thực thanh toán và chữ ký số vé điện tử QR.
   - **`services/agent-service` (AI Conversational Agent)**: Đóng vai trò bộ não điều phối hội thoại, trích xuất thực thể và gọi công cụ (Tool calling) tới Cinema Core qua API contracts. Tuyệt đối không tự suy diễn kết quả giao dịch.
   - **`apps/web` (Web Client & BFF)**: Xây dựng bằng Next.js 16 App Router với lớp Backend for Frontend (BFF) mỏng để giao tiếp an toàn với Cinema Core và Agent Service.
   - **`apps/organizer` (Organizer Portal)**: Web Portal độc lập dành cho ban quản lý rạp cấu hình dữ liệu phim, lịch chiếu và phòng vé.
   - **`apps/mobile` (Mobile Client & Scanner)**: Ứng dụng di động phân quyền linh hoạt (Role-based): khách hàng đặt vé và nhân viên soát vé QR tại cửa.

3. **Chia sẻ hợp đồng dữ liệu & Token thiết kế**:
   - Toàn bộ DTOs, Zod validation schemas và TypeScript types được tập trung tại `packages/contracts` để đảm bảo End-to-End Type Safety.
   - Toàn bộ Design Tokens được định nghĩa tại `DESIGN.md` và đóng gói tại `packages/design-tokens` để dùng chung cho Web, Mobile và Organizer.

4. **Lộ trình tiến hóa (Evolutionary Microservices)**:
   - Trong giai đoạn hiện tại, toàn bộ mã nguồn cùng nằm trong Monorepo để tối ưu tốc độ phát triển và kiểm thử tích hợp.
   - Khi triển khai production hoặc scale tải, `services/cinema-core` và `services/agent-service` có thể containerize độc lập (Docker) và scale theo cụm mà không làm thay đổi API contract của client.

## Alternatives Considered

### Option A — Monolithic Single Web App (Gộp toàn bộ vào 1 Next.js App)
- **Mô tả:** Đặt toàn bộ backend và giao diện vào trong các Route Handlers của một ứng dụng Next.js duy nhất.
- **Lý do từ chối:** Rất khó tái sử dụng logic khi phát triển ứng dụng di động (`apps/mobile`) hoặc tách riêng quyền quản trị của rạp chiếu (`apps/organizer`); khó tối ưu hóa hiệu năng khi AI Agent cần kết nối streaming hoặc backend giao dịch cần xử lý lock concurrency cao.

### Option B — Multi-repo (Tách 5–6 repositories riêng lẻ ngay từ đầu)
- **Mô tả:** Mỗi ứng dụng (`web`, `mobile`, `organizer`) và mỗi service (`core`, `agent`) là một repo Git độc lập.
- **Lý do từ chối:** Chi phí vận hành cực kỳ tốn kém trong giai đoạn đầu. Mỗi lần cập nhật schema dữ liệu vé hoặc thay đổi token màu thiết kế đều phải build và publish npm package riêng, gây chậm tiến độ và dễ đứt gãy tính tương thích.

## Consequences

### Positive

- **End-to-End Type Safety:** Thay đổi về kiểu dữ liệu suất chiếu hay ghế ngồi ở Cinema Core sẽ ngay lập tức được TypeScript cảnh báo tại Web, Mobile và Agent.
- **Một nguồn chân lý thiết kế:** Cả 3 giao diện (Web, Mobile, Organizer) đều dùng chung một bộ token màu sắc, kiểu chữ từ `DESIGN.md`.
- **Ranh giới an toàn giao dịch rõ ràng:** Phân tách rành mạch giữa UI tương tác, AI phỏng đoán ngữ cảnh và Cinema Core xác thực giao dịch tài chính.
- **Sẵn sàng cho Microservices:** Codebase đã được module hóa thành các service độc lập từ ngày đầu, việc tách deploy container là hoàn toàn tự nhiên.

### Negative / Trade-offs

- Cần duy trì kỷ luật import nghiêm ngặt giữa các packages và apps (không import vòng hoặc phá vỡ ranh giới module).
- Kích thước repository lớn hơn so với repo đơn lẻ.

## References

- Kiến trúc Frontend: [docs/02-architecture/frontend-architecture.md](../02-architecture/frontend-architecture.md)
- Ranh giới hệ thống: [docs/02-architecture/system-boundaries.md](../02-architecture/system-boundaries.md)
- Quy tắc nghiệp vụ giao dịch: [docs/05-specs/domain-context.md](../05-specs/domain-context.md)
- Đặc tả đặt vé hội thoại: [docs/05-specs/conversational-booking.md](../05-specs/conversational-booking.md)
- Quy chuẩn thiết kế: [DESIGN.md](../../DESIGN.md)
