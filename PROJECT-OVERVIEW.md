# Movie Booking Platform — Project Overview

This root file is the canonical project foundation. Use `docs/01-overview/` only for distinct expanded orientation; do not maintain a paraphrased copy of this file there.

## Problem

Trải nghiệm đặt vé xem phim trực tuyến hiện nay thường bị phân mảnh và rập khuôn: người dùng phải bấm chọn qua hàng loạt bộ lọc phức tạp, không được hỗ trợ giải đáp tự nhiên theo ngữ cảnh (ví dụ: "tìm rạp gần nhất có suất chiếu sau 7h tối ghế đôi"), và nhân viên rạp chiếu thiếu các công cụ hiện trường đồng bộ với hệ thống quản trị trung tâm. Mặt khác, các nhà tổ chức và rạp chiếu vừa và nhỏ gặp khó khăn trong việc quản trị lịch chiếu, ma trận phòng chiếu và đối soát doanh thu thời gian thực.

## Product

**Movie Booking Platform** là hệ sinh thái đặt vé xem phim và quản lý rạp chiếu thế hệ mới, tích hợp **Trợ lý Trí tuệ Nhân tạo (Conversational AI Agent)** kết hợp cùng hệ thống giao dịch điện ảnh cốt lõi (**Cinema Core**).

Hệ thống phục vụ 2 nhóm đối tượng:
1. **Khách hàng xem phim (Moviegoers)**: Trải nghiệm đặt vé qua Web và Mobile, hoặc tương tác trò chuyện tự nhiên với Buaa AI Agent để chọn phim, giữ ghế và nhận vé điện tử QR ngay trong khung chat.
2. **Nhà tổ chức & Rạp chiếu (Organizers & Cinema Staff)**: Quản lý danh mục phim, trailer, cấu hình phòng chiếu (Standard, VIP, Sweetbox), lập lịch chiếu và soát vé nhanh bằng camera điện thoại.

## Scope

### In Scope

- **User-facing Web Client (`apps/web`)**: Next.js 16 App Router, React 19, TypeScript, khám phá phim, lọc đa diện, sơ đồ ghế 64 chỗ, AI Agent chat workspace, thanh toán MoMo/VNPAY và vé điện tử.
- **Cinema Organizer Portal (`apps/organizer`)**: Web portal quản trị danh mục phim, trailer, cấu hình phòng chiếu, xếp lịch chiếu theo timeline và báo cáo doanh thu.
- **Mobile Application (`apps/mobile`)**: Khách hàng đặt vé, lưu vé offline; nhân viên rạp quét mã QR soát vé tại cửa phòng chiếu.
- **Cinema Core Backend (`services/cinema-core`)**: Quản lý tồn kho ghế, cơ chế khóa giữ vé (Atomic Hold TTL 5 phút), thanh toán và phát hành vé có chữ ký số.
- **AI Agent Service (`services/agent-service`)**: Xử lý ngôn ngữ tự nhiên, trích xuất điều kiện lọc và điều phối gọi công cụ tới Cinema Core.
- **Packages dùng chung (`packages/*`)**: `design-tokens`, `contracts`, `ui`, `shared-logic`.
- **Tài liệu chuẩn hóa**: Kiến trúc và quy chuẩn phát triển tại `docs/` và `.agents/`.

### Out of Scope

- Tích hợp thanh toán bằng tiền mặt vật lý tại quầy rạp (Phase 1 tập trung cổng thanh toán số).
- Hệ thống đề xuất phim cá nhân hóa bằng thuật toán học máy phức tạp nhiều bên (Multi-party dynamic scheduling).
- Quản lý kho hàng bắp nước vật lý ngoài các combo vé tiêu chuẩn.

## Architecture Direction

- **Mô hình Monorepo Platform**: Sử dụng npm workspaces quản lý tập trung các ứng dụng (`apps/`), dịch vụ nghiệp vụ (`services/`) và thư viện dùng chung (`packages/`).
- **Frontend Architecture**: Next.js App Router với lớp Backend for Frontend (BFF) mỏng; Server Components đọc dữ liệu backend trực tiếp; Client Components xử lý tương tác UI.
- **Backend Architecture**: Cinema Core đóng vai trò Single Source of Truth cho các giao dịch; Agent Service đóng vai trò Orchestrator.
- **Design System Authority**: `DESIGN.md` và `packages/design-tokens` là nguồn thẩm quyền duy nhất về màu sắc (Rosso Corsa, Carbone Nero, Notte Profonda), kiểu chữ và quy chuẩn bố cục.

## Core Concepts

- **Authoritative Core**: Cinema Core là thẩm quyền duy nhất xác nhận ghế và vé; AI Agent không tự ý xác nhận nếu chưa có chữ ký từ Core.
- **Seat Matrix 64**: Phòng chiếu chuẩn 64 ghế (8 hàng A–H × 8 cột 1–8) gồm Standard, VIP, và cặp ghế đôi Sweetbox.
- **Atomic Hold TTL**: Khóa giữ ghế nguyên tử toàn bộ trong 5 phút (300 giây); tự động giải phóng khi hết hạn.
- **E-Ticket QR**: Vé điện tử bảo mật chứa mã xác thực số được quét tại cửa rạp.

## Important Constraints

- **Security**: Bảo mật tuyệt đối ranh giới giao dịch; phân quyền nghiêm ngặt giữa `CUSTOMER`, `CINEMA_STAFF`, và `ORGANIZER_ADMIN`; không lưu trữ bí mật API trên client.
- **Performance**: Giữ vững trải nghiệm 60fps trên web và mobile; chuyển động tối ưu qua GPU composite (`transform`, `opacity`).
- **Compatibility**: Tương thích hoàn toàn chuẩn WCAG AA về khả năng tiếp cận (a11y) và điều hướng bàn phím.
- **Deployment**: Độc lập triển khai giữa Web Frontend (Vercel/Node) và Backend Services (Docker/Container).

## Major Invariants

- Cinema Core là thẩm quyền duy nhất cho mọi trạng thái ghế, giữ chỗ và vé.
- AI Agent không bao giờ bịa đặt (hallucinate) trạng thái vé khi chưa có phản hồi từ Core.
- Tất cả các ứng dụng tuân thủ nghiêm ngặt bảng màu và typography tại `DESIGN.md`.

## Development Workflow

- Quản lý phạm vi công việc, kế hoạch và tiến độ trên GitHub Issues.
- Triển khai mã nguồn, kiểm thử tự động và review thông qua Pull Requests.
- Tuân thủ quy trình GitHub Spec Kit (`.specify/`) cho các đặc tả kỹ thuật và kế hoạch thực thi.

## Current State

- Đã thiết lập cấu trúc Monorepo hoàn chỉnh tại `C:\Developer\Projects\movie-booking-agent`.
- Ứng dụng Web `apps/web` hoàn tất tích hợp với 83 unit/logic tests (100% PASS).
- Hệ thống thiết kế chuẩn hóa tại root `DESIGN.md` và `packages/design-tokens`.
- GitHub Spec Kit (`.specify/`) đã khởi tạo và cấu hình `constitution.md`.

## Open Questions

- Lựa chọn framework backend cho `services/cinema-core` (Node.js NestJS / Fastify vs Go / Python FastAPI) trong Phase tiếp theo.
- Lựa chọn giải pháp lưu trữ cache cho Seat Hold Concurrency Lock (Redis vs Postgres Row-Level Lock).
