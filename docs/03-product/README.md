# 03 — Product

## Movie Booking Platform

- [Sơ đồ use case tổng quát (General)](use-cases.md#21-sơ-đồ-use-case-tổng-quát-general).
- [Bảng phân rã chức năng](use-cases.md#22-bảng-phân-rã-chức-năng).
- [Sơ đồ use case chi tiết theo chức năng](use-cases.md#23-sơ-đồ-use-case-chi-tiết).
- [Phạm vi, actor, quy tắc và quyết định còn mở](use-cases.md).
- [Mô tả từng use case](use-case-descriptions.md).
- [Thuật ngữ nghiệp vụ](../../GLOSSARY.md).

Mô hình trên là sản phẩm mục tiêu đã xác nhận. Actor, mục tiêu và BR/OPEN được sở hữu tại `use-cases.md`;
mô tả diễn giải luồng/ngoại lệ, không tạo chính sách khác. Các tài liệu kiến trúc/đặc tả dẫn tới nguồn này;
đối chiếu code tại [mục 7](use-cases.md#7-hiện-trạng-và-chênh-lệch-so-với-mục-tiêu) trước khi tuyên bố đã triển khai.
Phương pháp vẽ/kiểm chứng thuộc [quy chuẩn UML](../04-standards/use-case-modeling.md).

Use this directory for durable product and domain knowledge.

Examples:

- actors and personas;
- use cases and user journeys;
- domain concepts and terminology;
- product behavior explanations;
- feature relationships and boundaries.

Formal required behavior belongs in `docs/05-specs/`. Task status belongs in Issues.

When a repository includes a user interface, visual identity, brand personality, and design tokens are canonically owned by root `DESIGN.md` (Starter: `templates/DESIGN.md`), while normative UI implementation and verification rules belong in `docs/04-standards/ui-quality.md`.
