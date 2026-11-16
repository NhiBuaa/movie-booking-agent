# 06 — Decisions (ADR)

Nơi lưu trữ các văn bản ghi nhận quyết định kiến trúc quan trọng (Architecture Decision Records - ADR) của nền tảng **Movie Booking Platform**.

---

## Danh mục Quyết định Kiến trúc

| Mã ADR | Tiêu đề quyết định | Trạng thái | Ngày ghi nhận |
| :--- | :--- | :--- | :--- |
| [ADR-0001](0001-monorepo-platform-and-microservices-boundaries.md) | Kiến trúc Monorepo Platform và Ranh giới Microservices | `Accepted` | 2026-11-15 |
| [ADR-0002](0002-customer-organizer-app-boundaries.md) | Tách ứng dụng Customer và Organizer theo nền tảng; thay phần phân chia app của ADR-0001 | `Accepted` | 2026-11-16 |

---

## Hướng dẫn tạo ADR mới
- Sử dụng mẫu quyết định chuẩn tại `agentic-repo-kit/templates/adr.md`.
- Mỗi quyết định cần nêu rõ: Bối cảnh (Context), Quyết định (Decision), Các phương án đã cân nhắc (Alternatives Considered) và Hệ quả/Đánh đổi (Consequences).
