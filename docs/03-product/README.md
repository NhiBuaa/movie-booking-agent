# 03 — Product

## Movie Booking Platform

- [Sơ đồ use case tổng quát (General)](use-cases.md#21-sơ-đồ-use-case-tổng-quát-general).
- [Bảng phân rã chức năng](use-cases.md#22-bảng-phân-rã-chức-năng).
- [Sơ đồ use case chi tiết theo chức năng](use-cases.md#23-sơ-đồ-use-case-chi-tiết).
- [Phạm vi, actor, quy tắc và quyết định còn mở](use-cases.md).
- [Lựa chọn đã xác nhận khi làm rõ OPEN, Q32–Q172](use-cases.md#61-quyết-định-đã-xác-nhận)
  và [phần còn phải đặc tả/kiểm chứng](use-cases.md#62-giới-hạn-và-phần-tiếp-tục-làm-rõ).
- [Mô tả từng use case](use-case-descriptions.md).
- [Thuật ngữ nghiệp vụ](../../GLOSSARY.md).
- Bối cảnh riêng: [Customer Web](../../apps/customer-web/PRODUCT.md),
  [Customer Mobile](../../apps/customer-mobile/PRODUCT.md), [Organizer Web](../../apps/organizer-web/PRODUCT.md),
  [Organizer Mobile](../../apps/organizer-mobile/PRODUCT.md).

Mô hình trên là sản phẩm mục tiêu đã xác nhận. Actor, mục tiêu và BR/OPEN được sở hữu tại `use-cases.md`;
mô tả diễn giải luồng/ngoại lệ, không tạo chính sách khác. Các tài liệu kiến trúc/đặc tả dẫn tới nguồn này;
đối chiếu code tại [mục 7](use-cases.md#7-hiện-trạng-và-chênh-lệch-so-với-mục-tiêu) trước khi tuyên bố đã triển khai.
Phương pháp vẽ/kiểm chứng thuộc [quy chuẩn UML](../04-standards/use-case-modeling.md).

Chủ sản phẩm xác nhận tổng hợp tại **Q173-A** ngày 2026-11-17. Bộ tài liệu đã đồng bộ General → ánh xạ → chi tiết,
danh mục, mô tả và BR theo Q32–Q172: 9 actor, 55 use case, 10 khối Mermaid.
Đã hòa giải với kiến trúc/Tech Stack trên main; BR-40…BR-43 giữ quy tắc cá nhân hóa, OPEN-11/OPEN-12 vẫn mở.
Các phụ thuộc tích hợp/pháp lý/nhân sự vẫn ở mục 6.2; tài liệu không xác nhận chức năng đã vận hành.

PRODUCT ghi người dùng, công việc, nền tảng và giới hạn của từng app theo
[ADR-0002](../06-decisions/0002-customer-organizer-app-boundaries.md).
Impeccable init đọc/cập nhật đúng bối cảnh này, không tạo chính sách nghiệp vụ hoặc thay `DESIGN.md`.

Use this directory for durable product and domain knowledge.

Examples:

- actors and personas;
- use cases and user journeys;
- domain concepts and terminology;
- product behavior explanations;
- feature relationships and boundaries.

Formal required behavior belongs in `docs/05-specs/`. Task status belongs in Issues.

When a repository includes a user interface, visual identity, brand personality, and design tokens are canonically owned by root `DESIGN.md` (Starter: `templates/DESIGN.md`), while normative UI implementation and verification rules belong in `docs/04-standards/ui-quality.md`.
