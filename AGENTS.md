# Movie Booking Platform — Repository Guidance for AI Agents

Trước khi thực hiện bất kỳ nhiệm vụ nào trong repository này, agent phải đọc kỹ các nguyên tắc kỹ thuật dưới đây.

---

## 1. Nguồn thẩm quyền kỹ thuật (Authoritative Sources)

| Lĩnh vực | Tài liệu chuẩn |
| :--- | :--- |
| **Tầm nhìn sản phẩm & Phân hệ** | [`PRODUCT.md`](PRODUCT.md) |
| **Quy chuẩn thiết kế & Tokens** | [`DESIGN.md`](DESIGN.md) và `packages/design-tokens/tokens.css` |
| **Kiến trúc hệ thống & Ranh giới** | [`docs/architecture/system-boundaries.md`](docs/architecture/system-boundaries.md) |
| **Kiến trúc Web Frontend (Next.js)** | [`docs/architecture/frontend-architecture.md`](docs/architecture/frontend-architecture.md) |
| **Quy tắc nghiệp vụ & Trạng thái giao dịch**| [`docs/specs/domain-context.md`](docs/specs/domain-context.md) |
| **Đặc tả đặt vé qua hội thoại (AI Agent)**| [`docs/specs/conversational-booking.md`](docs/specs/conversational-booking.md) |
| **Tiêu chuẩn chất lượng giao diện (UI)** | [`docs/standards/ui-quality.md`](docs/standards/ui-quality.md) |

---

## 2. Cấu trúc Monorepo & Ranh giới trách nhiệm

- **`apps/web`**: Web app đặt vé cho khách hàng (Next.js 16 App Router + React 19).
- **`apps/organizer`**: Portal quản trị dành cho nhà tổ chức/rạp chiếu (upload phim, xếp lịch, quản lý phòng/ghế).
- **`apps/mobile`**: Ứng dụng di động cho khách hàng và nhân viên soát vé QR tại rạp.
- **`services/cinema-core`**: Dịch vụ backend thẩm quyền duy nhất về tồn kho ghế, khóa giữ chỗ (Hold TTL), thanh toán và vé.
- **`services/agent-service`**: Bộ não AI Agent điều phối hội thoại và gọi công cụ tới Cinema Core.
- **`packages/*`**: Các thư viện dùng chung (`design-tokens`, `contracts`, `ui`, `shared-logic`).

---

## 3. Quy chuẩn phát triển với GitHub Spec Kit

Repository sử dụng **GitHub Spec Kit** trong thư mục `.specify/`. Khi phát triển tính năng hoặc sửa lỗi phức tạp:
1. Thực hiện theo luồng chuẩn: `specify -> plan -> tasks -> implement -> converge`.
2. Tài liệu kỹ thuật nằm tại `docs/` là nguồn thẩm quyền lâu dài.
3. Không tự ý sửa đổi hoặc xóa các mẫu cấu hình trong `.specify/`.

---

## 4. Quy ước nhánh, Commit và Kiểm chứng

- **Tên nhánh mới**: Tuân theo định dạng `<loại>/<mô-tả-ngắn>` (ví dụ: `feat/organizer-showtime-scheduler`, `fix/seat-hold-timeout`).
- **Xác minh trước khi kết luận**:
  - Với thay đổi code trong `apps/web`: bắt buộc chạy `npm test` và đảm bảo toàn bộ bộ kiểm thử đạt kết quả tốt (100% pass).
  - Với thay đổi giao diện: kiểm tra tính nhất quán với `DESIGN.md` và tiêu chuẩn tại `docs/standards/ui-quality.md`.
  - Tuyệt đối không tuyên bố hoàn tất nếu chưa chạy lệnh kiểm chứng thực tế và có kết quả cụ thể.
