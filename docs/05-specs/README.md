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
- [Yêu cầu phi chức năng cho demo portfolio](nfr/README.md).
- [Đặc tả kênh đặt vé/hỗ trợ sau mua trong chat](conversational-booking.md).

[Mô hình sản phẩm](../03-product/use-cases.md) sở hữu actor, mục tiêu và BR/OPEN;
[thuật ngữ](../../GLOSSARY.md) sở hữu định nghĩa. Đặc tả tại đây diễn giải yêu cầu, không phải kết quả chạy code.
Các feature spec/plan tại `docs/05-specs/<feature>/` giữ phạm vi kỹ thuật riêng; đặc tả mới phải hòa giải với yêu cầu mục tiêu
trước triển khai, không sửa hồi tố bằng chứng cũ hoặc tự đặt enum/quyền cho phần chưa thiết kế.

Lựa chọn công nghệ hiện hành thuộc [danh mục ADR](../06-decisions/README.md), được tổng hợp trong
[PROJECT-OVERVIEW](../../PROJECT-OVERVIEW.md#architecture-direction). Khi mở rộng feature cũ,
đối chiếu các ADR mới và ghi rõ phần cần thay thế; không biến stack đã chọn thành bằng chứng
đã migrate contracts, xác thực, database, tìm kiếm hoặc runtime.

Starter: `templates/spec.md`

## Feature specifications and plans

Store each feature's `spec.md`, `plan.md`, and related Spec Kit artifacts together under `docs/05-specs/<feature>/`. Keep one canonical copy. Task progress and review results remain in Issues and Pull Requests.

`tasks.md` trong thư mục feature là bản phân rã thiết kế theo Spec Kit, không phải bản sao tiến độ Issue/PR.
Giữ tên chuẩn theo workflow đã yêu cầu. [CI](../../.github/workflows/ci.yml) áp dụng
[bản vá tương thích](../../.github/patches/check-kit-speckit.patch) cho bộ kiểm kit đã ghim phiên bản:
chấp nhận `tasks.md` chỉ trong feature `docs/05-specs/<NNN-name>/` có `spec.md`, `plan.md` và constitution
Spec Kit; sửa cách tạo anchor GFM để giữ từng khoảng trắng. Các tệp theo dõi công việc ngoài phạm vi
và liên kết hỏng vẫn bị từ chối qua các [ca kiểm hồi quy](../../.github/scripts/test-kit-compatibility.ps1).
Không đổi tên artifact hoặc bỏ qua lỗi kiểm để nhận kết quả đạt. Khi triển khai, tiến độ và bằng chứng review vẫn thuộc Issue/PR.

Khi tạo/cập nhật spec, ghi chính sách dùng chung theo [playbook phát triển tính năng](../07-guides/feature-development-playbook.md).
Template spec/checklist của dự án yêu cầu nguồn sở hữu, mã/phiên bản, trạng thái, phạm vi áp dụng và các quyết định còn thiếu.

| Feature | Specification | Implementation plan |
| --- | --- | --- |
| Platform contracts | [Specification](001-platform-contracts/spec.md) | [Plan](001-platform-contracts/plan.md) |
| Web BFF routes | [Specification](002-web-bff-routes/spec.md) | [Plan](002-web-bff-routes/plan.md) |
| App boundaries | [Accepted design (ADR-0002)](../06-decisions/0002-customer-organizer-app-boundaries.md) | [Migration plan](003-app-boundaries/plan.md) |
| Service decomposition | [Bản kiến trúc 7 service](004-service-decomposition/spec.md), [quyết định và lý do đã xác nhận](004-service-decomposition/decisions.md); bản tổng hợp chờ chủ sản phẩm đọc lại | Chỉ phân tích/thiết kế, chưa lập kế hoạch triển khai |
| Data design | [Đặc tả thiết kế dữ liệu 7 service](005-data-design/spec.md), bản đã qua review độc lập và chờ nghiệm thu | [Kế hoạch thiết kế tài liệu](005-data-design/plan.md) |
| Customer login — Web và Mobile (A-03) | [Spec chung](006-customer-login/spec.md), [nguồn đối chiếu](006-customer-login/sources.md) | [Plan](006-customer-login/plan.md), [phân rã tasks](006-customer-login/tasks.md); không cấp quyền triển khai |
| Customer registration — Web và Mobile (A-01) | [Spec chung](007-customer-registration/spec.md), [nguồn đối chiếu](007-customer-registration/sources.md) | [Plan](007-customer-registration/plan.md), [phân rã tasks](007-customer-registration/tasks.md); không cấp quyền triển khai |

Before running Spec Kit for a feature, set its directory explicitly from the repository root. For example:

```powershell
$env:SPECIFY_FEATURE_DIRECTORY = 'docs/05-specs/002-web-bff-routes'
```

For a new feature, use the next feature directory under `docs/05-specs/`. Spec Kit supports this override; downstream commands use it or the machine-local `.specify/feature.json` pointer. When moving an existing feature, update that pointer to the new directory and verify resolution with:

```powershell
./.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireSpec
```
