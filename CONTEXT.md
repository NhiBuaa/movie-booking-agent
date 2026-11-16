---
status: active
last_verified: 2026-11-15
---

# Current Project Context

## Current Phase

- **Stage:** Platform Monorepo Scaffold & Web Client Integration.
- **Active Playbook:** [Playbook 1 — Bắt đầu dự án từ con số 0](docs/07-guides/project-start-playbook.md).
- **Work Tracking:** Track task scope, acceptance criteria, and progress in Issues and Pull Requests.

## Boundary & Surface

- **Project Name:** movie-booking-agent
- **Has UI Surface:** True
- **Platform Architecture:** Monorepo (`apps/web`, `apps/organizer`, `apps/mobile`, `services/cinema-core`, `services/agent-service`, `packages/*`).

## Current Product Boundary

- **User-facing Web Client (`apps/web`)**: Hoàn thiện khám phá phim, chi tiết phim, trailers mosaic, ma trận 64 ghế, đặt vé trong chat với AI Agent, thanh toán MoMo/VNPAY và vé điện tử QR.
- **Cinema Organizer Portal (`apps/organizer`)**: Cổng web quản trị cho rạp chiếu phim (upload phim, xếp lịch, quản lý phòng/ghế).
- **Mobile Application (`apps/mobile`)**: Ứng dụng di động cho khán giả và chế độ quét vé QR tại cửa phòng chiếu cho nhân viên rạp.
- **Cinema Core Backend (`services/cinema-core`)**: Hệ thống backend giao dịch có thẩm quyền (tồn kho ghế, giữ vé TTL 5 phút, xác thực thanh toán và chữ ký vé QR).
- **AI Agent Service (`services/agent-service`)**: Trợ lý hội thoại điều phối đặt vé trọn vẹn trong chat.

## Current State

- Ứng dụng Web `apps/web` hoạt động trên Next.js 16 App Router + React 19 + TypeScript với tầng BFF Route Handlers (`src/app/api/...`) hoàn chỉnh.
- Bộ kiểm thử tự động của `apps/web` gồm 19 suites (93 unit/logic/API tests) đạt 100% PASS; gói hợp đồng `@platform/contracts` đạt 6/6 tests PASS.
- Single Source of Truth về thiết kế đặt tại `DESIGN.md` và `packages/design-tokens/tokens.css`.
- Hệ thống GitHub Spec Kit (`.specify/`) đã khởi tạo và thiết lập hiến pháp dự án (`constitution.md`).

## Active Direction

- Khởi tạo khung dịch vụ backend giao dịch có thẩm quyền tại `services/cinema-core` (Catalog & Seat Hold Concurrency Engine).
- Chuẩn bị tài liệu đặc tả chức năng chi tiết cho Organizer Portal (`apps/organizer`) và Mobile App (`apps/mobile`).

## Known Limitations

- Tồn kho ghế và thanh toán hiện tại trong `apps/web` sử dụng mock fixtures/logic mô phỏng độ chính xác cao trước khi tích hợp Cinema Core runtime thật.
- Agent service hiện tại chạy logic rule-based và deterministic state machine trong client; sẽ kết nối LLM service thực tế ở phase tiếp theo.

## Canonical References

- Nền tảng dự án: [PROJECT-OVERVIEW.md](PROJECT-OVERVIEW.md)
- Bản đồ tri thức: [docs/README.md](docs/README.md)
- Cấu hình agent: [.agents/README.md](.agents/README.md)
- Quy chuẩn UI: [docs/04-standards/ui-quality.md](docs/04-standards/ui-quality.md)
- Điều phối skill UI: [.agents/rules/ui-skill-routing.md](.agents/rules/ui-skill-routing.md)
- Quản lý công việc: GitHub Issues và Pull Requests
