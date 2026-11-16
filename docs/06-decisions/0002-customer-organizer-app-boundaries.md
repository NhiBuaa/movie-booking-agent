# ADR-0002 — Tách ứng dụng Customer và Organizer theo nền tảng

## Status

Accepted — chủ sản phẩm duyệt trong hội thoại ngày 2026-11-16, gồm cây bốn ứng dụng,
chuyển trải nghiệm nhân viên sang Organizer Mobile và hỗ trợ cả iOS/Android với giao diện phù hợp từng hệ.
Quyết định này thay phần phân chia ứng dụng của [ADR-0001](0001-monorepo-platform-and-microservices-boundaries.md);
ranh giới Cinema Core, Agent Service và hợp đồng dữ liệu vẫn giữ nguyên.

## Context

Tên `web`, `mobile`, `organizer` trộn nền tảng với nhóm người dùng. Mobile cũ mô tả cả khách hàng
và nhân viên; Organizer được chốt cần cả Web và app Mobile cài riêng.

## Decision

Giữ bốn thư mục ngang cấp trong workspace `apps/*`:

| Ứng dụng | Đường dẫn | Người dùng và nền tảng |
|---|---|---|
| Customer Web | `apps/customer-web` | Khách chưa đăng nhập/khách hàng; trình duyệt máy tính và điện thoại. |
| Customer Mobile | `apps/customer-mobile` | Khách hàng; app iOS và Android, giao diện phù hợp từng hệ. |
| Organizer Web | `apps/organizer-web` | Quản trị viên toàn chuỗi/quản lý rạp; Web, dùng được trên máy tính và điện thoại. |
| Organizer Mobile | `apps/organizer-mobile` | Quản trị viên/quản lý rạp và trải nghiệm nhân viên soát vé được chuyển từ Mobile cũ; iOS và Android. |

Mỗi app có PRODUCT riêng, kế thừa [DESIGN](../../DESIGN.md),
[mô hình use case](../03-product/use-cases.md) và hợp đồng chung. `web` trong PRODUCT là nền tảng
trình duyệt; `adaptive` của hai app Mobile biểu thị thiết kế theo từng hệ điều hành, không chọn framework.
`packages/ui` chỉ chia sẻ component tương thích nền tảng; app Mobile không mặc định import UI DOM/CSS.

Chuyển kênh của nhân viên không sửa quyền actor, rạp được giao hay điều kiện Core online.
Quản lý/quản trị không tự nhận quyền soát vé, giao combo. Kênh/màn hình giao combo và ma trận
tính năng quản trị trên Mobile cần đặc tả riêng trước triển khai; không mặc định parity mọi màn hình Web.
Công nghệ Mobile, framework Organizer Web và cơ chế xác thực triển khai chưa được chọn trong quyết định này.

## Alternatives Considered

- Gộp khách hàng và vận hành vào hai app Web/Mobile: ít ứng dụng hơn nhưng trộn nhiệm vụ và luồng quyền khác nhau.
- Lồng `apps/customer/web` và `apps/organizer/mobile`: nhóm theo sản phẩm rõ nhưng thêm tầng và phải đổi mẫu workspace.
- Bốn app ngang cấp được chọn để tên thể hiện cả đối tượng lẫn nền tảng, giữ workspace hiện có.

## Consequences

Các app có ranh giới build/điều hướng riêng; số app cần bảo trì tăng. Chỉ Customer Web đã có mã nguồn
và bộ test; ba app còn lại có tài liệu phạm vi, không phải scaffold hoặc runtime đã hoạt động.
Giữ tên package Customer Web `movie-booking-frontend` để tránh đổi định danh ngoài phạm vi chuyển đường dẫn.

| Đường dẫn cũ trong tài liệu/mốc code lịch sử | Vị trí hiện tại |
|---|---|
| `apps/web` | `apps/customer-web` |
| `apps/organizer` | `apps/organizer-web` |
| `apps/mobile` | `apps/customer-mobile`; trách nhiệm nhân viên chuyển sang `apps/organizer-mobile`. |

Các đường dẫn gắn SHA và báo cáo review cũ được giữ nguyên làm bằng chứng lịch sử;
bảng này hỗ trợ tra cứu, không tái xác nhận kết quả của mốc cũ trên cấu trúc mới.

## References

- [Phạm vi nền tảng](../../PROJECT-OVERVIEW.md).
- [Kế hoạch chuyển thư mục và kiểm chứng](../05-specs/003-app-boundaries/plan.md).
- [Customer Web](../../apps/customer-web/PRODUCT.md), [Customer Mobile](../../apps/customer-mobile/PRODUCT.md),
  [Organizer Web](../../apps/organizer-web/PRODUCT.md), [Organizer Mobile](../../apps/organizer-mobile/PRODUCT.md).
