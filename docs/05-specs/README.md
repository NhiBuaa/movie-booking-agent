# 05 — Specifications

Specifications define durable required behavior.

A Specification answers:

> What must be true?

It does not track implementation progress. Use Issues for task state and Pull Requests for implementation/review state.

Suggested validity states:

- `draft`
- `accepted`
- `superseded`

## Movie Booking Platform

- [Domain context và ràng buộc giao dịch](domain-context.md).
- [Đặc tả kênh đặt vé/hỗ trợ sau mua trong chat](conversational-booking.md).

[Mô hình sản phẩm](../03-product/use-cases.md) sở hữu actor, mục tiêu và BR/OPEN;
[thuật ngữ](../../GLOSSARY.md) sở hữu định nghĩa. Đặc tả tại đây diễn giải yêu cầu, không phải kết quả chạy code.
Các feature spec/plan cũ trong `specs/` giữ phạm vi lúc lập; đặc tả mới phải hòa giải với yêu cầu mục tiêu
trước triển khai, không sửa hồi tố bằng chứng cũ hoặc tự đặt enum/quyền cho phần chưa thiết kế.

Starter: `templates/spec.md`
