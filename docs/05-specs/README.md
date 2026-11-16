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
Các feature spec/plan tại `docs/05-specs/<feature>/` giữ phạm vi kỹ thuật riêng; đặc tả mới phải hòa giải với yêu cầu mục tiêu
trước triển khai, không sửa hồi tố bằng chứng cũ hoặc tự đặt enum/quyền cho phần chưa thiết kế.

Starter: `templates/spec.md`

## Feature specifications and plans

Store each feature's `spec.md`, `plan.md`, and related Spec Kit artifacts together under `docs/05-specs/<feature>/`. Keep one canonical copy. Task progress and review results remain in Issues and Pull Requests.

| Feature | Specification | Implementation plan |
| --- | --- | --- |
| Platform contracts | [Specification](001-platform-contracts/spec.md) | [Plan](001-platform-contracts/plan.md) |
| Web BFF routes | [Specification](002-web-bff-routes/spec.md) | [Plan](002-web-bff-routes/plan.md) |

Before running Spec Kit for a feature, set its directory explicitly from the repository root. For example:

```powershell
$env:SPECIFY_FEATURE_DIRECTORY = 'docs/05-specs/002-web-bff-routes'
```

For a new feature, use the next feature directory under `docs/05-specs/`. Spec Kit supports this override; downstream commands use it or the machine-local `.specify/feature.json` pointer. When moving an existing feature, update that pointer to the new directory and verify resolution with:

```powershell
./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireSpec
```
