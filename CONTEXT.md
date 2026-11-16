---
status: active
last_verified: 2026-11-16
---

# Current Project Context

## Current Phase

- **Stage:** Platform Monorepo Scaffold & Web Client Integration.
- **Active Playbook:** [Playbook 1 — Bắt đầu dự án từ con số 0](docs/07-guides/project-start-playbook.md).
- **Work Tracking:** Theo dõi phạm vi công việc, tiêu chí chấp thuận và tiến độ qua Issues và Pull Requests (PR #1).

## Boundary & Surface

- **Project Name:** movie-booking-agent
- **Has UI Surface:** True
- **Platform Architecture:** Monorepo (`apps/web`, `apps/organizer`, `apps/mobile`, `services/cinema-core`, `services/agent-service`, `packages/*`).

## Current Product Boundary

- **User-facing Web Client (`apps/web`)**: Hoàn thiện khám phá phim, chi tiết phim, trailers mosaic, ma trận 64 ghế, đặt vé trong chat với AI Agent, thanh toán MoMo/VNPAY và vé điện tử QR. Tầng BFF Route Handlers (`src/app/api/...`) đã sẵn sàng.
- **Cinema Organizer Portal (`apps/organizer`)**: Cổng web quản trị cho rạp chiếu phim (upload phim, xếp lịch, quản lý phòng/ghế).
- **Mobile Application (`apps/mobile`)**: Ứng dụng di động cho khán giả và chế độ quét vé QR tại cửa phòng chiếu cho nhân viên rạp.
- **Cinema Core Backend (`services/cinema-core`)**: Hệ thống backend giao dịch có thẩm quyền (tồn kho ghế, giữ vé TTL 5 phút, xác thực thanh toán và chữ ký vé QR) theo [ADR-0001](docs/06-decisions/0001-monorepo-platform-and-microservices-boundaries.md). Hiện tại **chưa triển khai runtime thực tế**; toàn bộ chức năng giao dịch đang được mô phỏng tại tầng BFF qua in-memory adapters.
- **AI Agent Service (`services/agent-service`)**: Trợ lý hội thoại điều phối đặt vé trọn vẹn trong chat.

## Current State

- Ứng dụng Web `apps/web` hoạt động trên Next.js 16 App Router + React 19 + TypeScript với tầng BFF Route Handlers (`src/app/api/...`) hoàn chỉnh, sử dụng 100% hợp đồng dữ liệu `@platform/contracts`.
- Bộ kiểm thử tự động của monorepo (`@platform/contracts` và `apps/web`) đạt 100% PASS trên toàn bộ test suites.
- Single Source of Truth về thiết kế đặt tại `DESIGN.md` và `packages/design-tokens/tokens.css`.
- Hệ thống GitHub Spec Kit (`.specify/`) đã khởi tạo và thiết lập hiến pháp dự án (`constitution.md`).
- Đặc tả kỹ thuật BFF Route Handlers đã được chuẩn hóa tại [docs/05-specs/002-web-bff-routes/spec.md](docs/05-specs/002-web-bff-routes/spec.md) và [plan.md](docs/05-specs/002-web-bff-routes/plan.md).

## Active Direction

- Chuẩn bị kế hoạch khởi tạo dịch vụ backend giao dịch độc lập tại `services/cinema-core` (Catalog & Seat Hold Concurrency Lock Engine).
- Chuẩn bị tài liệu đặc tả chức năng chi tiết cho Organizer Portal (`apps/organizer`) và Mobile App (`apps/mobile`).

## Known Limitations & Simulation Boundaries

- **BFF mô phỏng vs Cinema Core đích:** Hiện tại `services/cinema-core` chưa có mã nguồn runtime. Biến môi trường `CINEMA_CORE_URL` là ranh giới kiến trúc tương lai, **chưa được triển khai hay kết nối**. Không mô tả `CINEMA_CORE_URL` là đã hoạt động.
- **Lưu trữ trong bộ nhớ (In-Memory Storage):** Tầng adapter trong `apps/web/src/server/` lưu trữ ghế giữ, đơn hàng và vé trong bộ nhớ tiến trình (Process Memory Maps). Dữ liệu sẽ mất khi tiến trình khởi động lại; chưa có cơ sở dữ liệu phân tán (Distributed DB / Redis lock).
- **Giới hạn định danh khách hàng:** Header `x-user-email` hiện chỉ đóng vai trò định danh ngữ cảnh mô phỏng giữa client và route handler, chưa phải là cơ chế xác thực phiên bảo mật (JWT / Session token có chữ ký số).
- **Cấu hình Secret & An toàn Production:** Hệ thống sử dụng 2 biến môi trường `CINEMA_CORE_WEBHOOK_SECRET` và `CINEMA_CORE_TICKET_SECRET`. Trong môi trường `NODE_ENV === 'production'`, thiếu secret sẽ bị từ chối xử lý với HTTP 500 `SERVER_CONFIGURATION_ERROR`, không fallback sang secret phát triển. Không đưa secret thật vào tài liệu hoặc commit.
- **Agent Service hiện tại:** Chạy logic rule-based và deterministic state machine trong client; sẽ kết nối LLM service thực tế ở phase tiếp theo.

## Canonical References

- Nền tảng dự án: [PROJECT-OVERVIEW.md](PROJECT-OVERVIEW.md)
- Bản đồ tri thức: [docs/README.md](docs/README.md)
- Cấu hình agent: [.agents/README.md](.agents/README.md)
- Ranh giới kiến trúc & thẩm quyền Core: [docs/06-decisions/0001-monorepo-platform-and-microservices-boundaries.md](docs/06-decisions/0001-monorepo-platform-and-microservices-boundaries.md)
- Ranh giới hệ thống: [docs/02-architecture/system-boundaries.md](docs/02-architecture/system-boundaries.md)
- Quy tắc nghiệp vụ giao dịch: [docs/05-specs/domain-context.md](docs/05-specs/domain-context.md)
- Quy chuẩn UI: [docs/04-standards/ui-quality.md](docs/04-standards/ui-quality.md)
- Điều phối skill UI: [.agents/rules/ui-skill-routing.md](.agents/rules/ui-skill-routing.md)
- Quản lý công việc: GitHub Issues và Pull Requests
