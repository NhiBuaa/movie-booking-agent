# Kế hoạch tổ chức ứng dụng Customer và Organizer

**Nguồn duyệt:** chủ sản phẩm đồng ý cây bốn ứng dụng và chuyển trải nghiệm nhân viên sang
Organizer Mobile trong hội thoại ngày 2026-11-16; sau đó xác nhận hai app Mobile nhắm iOS và Android,
giao diện phù hợp từng hệ. Phạm vi này cho phép chuyển thư mục, đồng bộ tham chiếu và ghi PRODUCT;
không bao gồm xây dựng giao diện mới, chọn framework, push hoặc merge.

**Nền đối chiếu:** `8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.
**Thiết kế:** [ADR-0002](../../06-decisions/0002-customer-organizer-app-boundaries.md).

## Ràng buộc

- Giữ nguyên logic, test và tài nguyên Web khi chuyển đường dẫn.
- Giữ nguyên dịch vụ, hợp đồng dữ liệu, quyền actor, BR và OPEN-01–OPEN-10.
- Dùng bốn thư mục ngang cấp, giữ workspace `apps/*`; chưa tạo scaffold/framework cho ba app chưa có code.
- Web dùng `Platform: web`; Mobile dùng `Platform: adaptive` theo xác nhận iOS/Android.
- Giữ nguyên báo cáo, mốc code và kết quả review lịch sử; chú thích đường dẫn mới qua ADR thay vì sửa bằng chứng cũ.

## 1. Chuyển thư mục và cấu hình

Chụp hash nội dung Web trước khi chuyển. Chuyển `apps/web` thành `apps/customer-web`,
`apps/mobile` thành `apps/customer-mobile`, `apps/organizer` thành `apps/organizer-web`;
tạo `apps/organizer-mobile` chứa tài liệu. Di chuyển kèm PRODUCT và cấu hình live đã tạo.
Giữ nguyên tên package Web để bảo toàn định danh workspace hiện hữu.

Cập nhật `package.json` ở gốc và đường dẫn workspace/link trong `package-lock.json`;
giữ nguyên phiên bản, URL và integrity của mọi dependency. Cấu hình và import tương đối trong Web
giữ cùng độ sâu thư mục, chỉ sửa khi kiểm tra cho thấy cần thiết.

**Kiểm chứng:** hash nguồn/test/tài nguyên trước và sau phải khớp; lockfile không đổi bộ dependency;
`npm ci --ignore-scripts --no-audit --no-fund` và `npm run test:all` chạy từ gốc.

## 2. Đồng bộ bối cảnh và tài liệu

Tạo PRODUCT riêng cho từng app, tách khách hàng và vận hành theo actor, rạp và dữ liệu được cấp.
Customer Mobile giữ xuất trình QR đã lưu; Organizer Mobile giữ yêu cầu thiết bị nhân viên online.
Di chuyển trách nhiệm nhân viên từ README Mobile cũ sang Organizer Mobile, không thêm quyền.

Cập nhật README gốc, PROJECT-OVERVIEW, CONTEXT, AGENTS, quy tắc UI, hiến pháp,
tài liệu kiến trúc, đặc tả đang dùng và README packages có tham chiếu ứng dụng.
Ghi quyết định vào ADR-0002; giữ ADR-0001 và các tài liệu đối chiếu cũ như nguồn lịch sử có dẫn chiếu.

**Kiểm chứng:** tìm toàn bộ đường dẫn cũ, phân biệt tham chiếu hiện hành với bằng chứng lịch sử;
kiểm tra schema/nền tảng của đủ bốn PRODUCT và giữ nguyên khối Mermaid, danh mục actor/BR/OPEN.

## 3. Kiểm tra và review

Chạy `npm run test:all`, `npm run typecheck --workspace=apps/customer-web`,
`git diff --check`, kiểm tra liên kết bằng `check-kit.ps1` và đối chiếu tree/hash.
Review độc lập diff và các file mới; sửa các lỗi trong phạm vi được duyệt.
Ghi kết quả kiểm chứng trong bàn giao/PR, không biến kế hoạch này thành bảng tiến độ.
