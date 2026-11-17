# Movie Booking Platform — Project Overview

This root file is the canonical project foundation. Use `docs/01-overview/` only for distinct expanded orientation; do not maintain a paraphrased copy of this file there.

## Problem

Trải nghiệm đặt vé xem phim trực tuyến hiện nay thường bị phân mảnh và rập khuôn: người dùng phải bấm chọn qua hàng loạt bộ lọc phức tạp, không được hỗ trợ giải đáp tự nhiên theo ngữ cảnh (ví dụ: "tìm rạp gần nhất có suất chiếu sau 7h tối ghế đôi"), và nhân viên rạp chiếu thiếu các công cụ hiện trường đồng bộ với hệ thống quản trị trung tâm. Mặt khác, các nhà tổ chức và rạp chiếu vừa và nhỏ gặp khó khăn trong việc quản trị lịch chiếu, ma trận phòng chiếu và đối soát doanh thu thời gian thực.

## Product

**Movie Booking Platform** là hệ sinh thái đặt vé xem phim và quản lý rạp chiếu thế hệ mới, tích hợp **Trợ lý Trí tuệ Nhân tạo (Conversational AI Agent)** kết hợp cùng hệ thống giao dịch điện ảnh cốt lõi (**Cinema Core**).

Sản phẩm mục tiêu phục vụ **một đơn vị/chuỗi rạp**. Phạm vi actor, mục tiêu và quy tắc chi tiết
được sở hữu bởi [mô hình use case](docs/03-product/use-cases.md), diễn giải bằng
[mô tả use case](docs/03-product/use-case-descriptions.md) và [thuật ngữ](GLOSSARY.md).
Các nhóm phục vụ tổng quát:

1. **Khách hàng xem phim (Moviegoers)**: Trải nghiệm đặt vé qua Web và Mobile, hoặc tương tác trò chuyện tự nhiên với Buaa AI Agent để chọn phim, giữ ghế và nhận vé điện tử QR ngay trong khung chat.
2. **Vận hành rạp và quản trị chuỗi**: Quản trị viên toàn chuỗi, quản lý rạp, nhân viên soát vé và nhân viên quầy bắp nước có phạm vi/quyền riêng; không tự kế thừa quyền của nhau.

## Scope

### In Scope

- **User-facing Web Client (`apps/customer-web`)**: Next.js 16 App Router, React 19, TypeScript, khám phá phim, sơ đồ ghế theo phòng, AI Agent chat workspace, thanh toán MoMo/VNPAY và vé điện tử.
- **Cinema Organizer — Web và Mobile**: Khu vực riêng cho quản trị viên toàn chuỗi và quản lý rạp,
  gồm bản Web (`apps/organizer-web`) và app `apps/organizer-mobile`; cả hai đều thuộc phạm vi bắt buộc,
  theo xác nhận của chủ sản phẩm ngày 2026-11-16 trong hội thoại thiết kế bối cảnh sản phẩm.
  Phạm vi nghiệp vụ gồm danh mục phim, trailer, phòng chiếu, lịch chiếu, báo cáo và các quyền theo
  mô hình use case. Trải nghiệm nhân viên soát vé thuộc Organizer Mobile, giữ quyền riêng với quản lý.
  Phạm vi màn hình quản trị trên Mobile chưa chốt; không mặc định mọi màn hình Web có bản tương đương.
- **Customer Mobile (`apps/customer-mobile`)**: App khách hàng đặt vé, lưu QR để xuất trình khi điện thoại
  không có mạng; thiết bị soát vé vẫn phải online. Cả Customer Mobile và Organizer Mobile hỗ trợ iOS/Android,
  giao diện phù hợp từng hệ; framework Mobile và Organizer Web chưa chốt.
- **Cinema Core Backend (`services/cinema-core`)**: Quản lý tồn kho ghế, cơ chế khóa giữ vé (Atomic Hold TTL 5 phút), thanh toán và phát hành vé có chữ ký số.
- **AI Agent Service (`services/agent-service`)**: Xử lý ngôn ngữ tự nhiên, trích xuất điều kiện lọc và điều phối gọi công cụ tới Cinema Core.
- **Packages dùng chung (`packages/*`)**: `design-tokens`, `contracts`, `ui`, `shared-logic`.
- **Tài liệu chuẩn hóa**: Kiến trúc và quy chuẩn phát triển tại `docs/` và `.agents/`.
- **Khả năng sản phẩm mục tiêu**: Tài khoản/xác minh email; combo/voucher; yêu cầu hủy và hoàn tiền;
  soát từng ghế và giao combo; đánh giá/yêu thích; hội viên, điểm và đổi voucher; phân quyền vận hành.
  Phạm vi chi tiết và phần được phép thao tác qua chat theo mô hình use case, chưa xác nhận đã triển khai.

### Out of Scope

- Tích hợp thanh toán bằng tiền mặt vật lý tại quầy rạp (Phase 1 tập trung cổng thanh toán số).
- Hệ thống đề xuất phim cá nhân hóa bằng thuật toán học máy phức tạp nhiều bên (Multi-party dynamic scheduling).
- Quản lý kho hàng bắp nước vật lý ngoài các combo vé tiêu chuẩn.
- Sàn nhiều đơn vị rạp độc lập, soát vé ngoại tuyến và đổi sang suất khác sau mua ngoài phạm vi.
  Đổi vị trí ghế trong cùng suất đã được bổ sung qua
  [Q34–Q44](docs/03-product/use-cases.md#61-quyết-định-đã-xác-nhận); đã phản ánh tại B-09; hợp đồng kỹ thuật/kiểm chứng còn cần hoàn tất.

## Architecture Direction

- **Mô hình Monorepo Platform**: Sử dụng npm workspaces quản lý tập trung các ứng dụng (`apps/`), dịch vụ nghiệp vụ (`services/`) và thư viện dùng chung (`packages/`).
- **Frontend Architecture**: Customer Web dùng Next.js App Router với lớp Backend for Frontend (BFF) mỏng;
  Server Components đọc dữ liệu backend, Client Components xử lý tương tác UI. Định hướng này không
  tự chọn framework cho Organizer Web hoặc hai app Mobile.
- **Backend Architecture**: Cinema Core đóng vai trò Single Source of Truth cho các giao dịch; Agent Service đóng vai trò Orchestrator.
- **Design System Authority**: `DESIGN.md` và `packages/design-tokens` là nguồn thẩm quyền duy nhất về màu sắc (Rosso Corsa, Carbone Nero, Notte Profonda), kiểu chữ và quy chuẩn bố cục.
- **Application Boundaries**: Bốn app Customer/Organizer × Web/Mobile theo
  [ADR-0002](docs/06-decisions/0002-customer-organizer-app-boundaries.md). PRODUCT trong mỗi app ghi bối cảnh
  riêng và dẫn về mô hình nghiệp vụ chung; tên thư mục không cấp quyền mới.

## Core Concepts

- **Authoritative Core**: Cinema Core là thẩm quyền duy nhất xác nhận ghế và vé; AI Agent không tự ý xác nhận nếu chưa có chữ ký từ Core.
- **Sơ đồ ghế theo phòng**: Số ghế và bố trí do từng phòng cấu hình; giữ Standard, VIP và Sweetbox.
  Ma trận 64 ghế (8×8) là mẫu hiện có, không phải giới hạn sản phẩm mục tiêu.
- **Atomic Hold TTL**: Khóa giữ ghế nguyên tử toàn bộ trong 5 phút (300 giây); tự động giải phóng khi hết hạn.
- **E-Ticket QR**: QR chung của lượt đặt tra cứu quyền sử dụng theo ghế; không coi một lần quét là dùng hết đơn.

## Important Constraints

- **Security**: Kiểm tra quyền theo actor, dữ liệu và rạp được giao. Ba giá trị `CUSTOMER`,
  `CINEMA_STAFF`, `ORGANIZER_ADMIN` là hợp đồng hiện tại, chưa ánh xạ đầy đủ các vai trò mục tiêu;
  không suy chúng thành quyền mới. Không lưu trữ bí mật API trên client.
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

Hiện trạng của bản làm việc và giới hạn mô phỏng được ghi tại [CONTEXT.md](CONTEXT.md).
Mô hình use case là yêu cầu mục tiêu đã xác nhận; tài liệu này không dùng kết quả test cũ hoặc
sự hiện diện của màn hình/scaffold để khẳng định giao dịch, tích hợp hay phân quyền đã vận hành.

## Open Questions

- Lựa chọn framework backend cho `services/cinema-core` (Node.js NestJS / Fastify vs Go / Python FastAPI) trong Phase tiếp theo.
- Lựa chọn giải pháp lưu trữ cache cho Seat Hold Concurrency Lock (Redis vs Postgres Row-Level Lock).
- Các nhóm quyết định và phụ thuộc đặc tả/kiểm chứng giữ tại [OPEN-01–OPEN-10](docs/03-product/use-cases.md#6-các-quyết-định-còn-mở);
  tham chiếu nguồn này thay vì tạo danh sách chính sách song song.
