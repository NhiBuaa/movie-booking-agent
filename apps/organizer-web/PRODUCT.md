# Product — Organizer Web

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Quản trị viên toàn chuỗi và quản lý rạp của một đơn vị/chuỗi rạp.
Quản trị viên làm việc trong phạm vi toàn chuỗi theo quyền; quản lý chỉ thao tác dữ liệu/rạp được giao.
Quyền quản lý không tự bao gồm quyền soát vé hoặc giao combo.

## Product Purpose

Cung cấp bề mặt Web riêng để quản lý danh mục, cấu hình rạp/lịch chiếu, quyền truy cập,
xử lý yêu cầu hủy và theo dõi báo cáo. Người vận hành cần hiểu phạm vi tác động và trạng thái xử lý
trước khi xác nhận thay đổi có ảnh hưởng đến ghế, vé và tiền.
Thuộc [Movie Booking Platform](../../PROJECT-OVERVIEW.md), tách bối cảnh với ứng dụng khách hàng.

## Operating Context

Sử dụng trong trình duyệt máy tính và điện thoại, phối hợp với
[Organizer Mobile](../organizer-mobile/PRODUCT.md). Cùng nền nghiệp vụ và các service sở hữu dữ liệu;
khả năng dùng trên điện thoại không thay nghĩa app Mobile cài riêng.
Phạm vi màn hình quản trị trên Mobile cần đặc tả theo tính năng, không tự đồng nhất với mọi màn hình Web.

## Capabilities and Constraints

- Mục tiêu M-01–M-07: danh mục phim/trailer, giá/ưu đãi, phòng/ghế, lịch chiếu, quyền và báo cáo.
- R-02–R-06: xét yêu cầu hủy, theo dõi thực hiện/hoàn tiền, đề nghị và duyệt hủy suất theo đúng vai trò.
- Các quyền khác của quản trị viên chỉ theo
  [mô hình use case](../../docs/03-product/use-cases.md) và
  [mô tả use case](../../docs/03-product/use-case-descriptions.md), không suy từ tên app/role.

Core sở hữu dữ liệu giao dịch; Catalog sở hữu nội dung phim, Identity sở hữu danh tính/quyền,
Reporting cung cấp báo cáo có mốc cập nhật theo [thiết kế service](../../docs/05-specs/004-service-decomposition/spec.md).
Web gửi yêu cầu tới đúng chủ dữ liệu trong quyền được cấp, phản ánh kết quả được xác minh.
Chấp thuận hủy chưa đồng nghĩa hoàn tiền thành công. Chỉ hiển thị dữ liệu đúng phạm vi rạp;
ẩn nút không thay kiểm tra quyền tại backend. Không gộp mọi quyền vào role hiện có `ORGANIZER_ADMIN`.

[OPEN-01–OPEN-10](../../docs/03-product/use-cases.md#6-các-quyết-định-còn-mở) vẫn giữ nguyên;
đặc biệt quyền sửa suất đã bán/giữ ghế, hoàn tiền, quản lý combo và chỉ số báo cáo chưa đủ chính sách
để tự tuyên bố sẵn sàng vận hành. Thuật ngữ theo [GLOSSARY](../../GLOSSARY.md).

## Stack

React 19 + TypeScript + Vite + TanStack Router dạng SPA theo
[ADR-0015](../../docs/06-decisions/0015-react-vite-and-tanstack-router-for-organizer.md).
TanStack Query/Zustand, React Hook Form/Zod và React Aria Components cho Web theo
[README](README.md), giữ CSS modules/tokens và React local state cho tương tác gần component.
Chưa scaffold/cài dependency, chọn host hoặc kiểm chứng build/runtime.

## Brand Commitments

Kế thừa Movie Booking Platform và [DESIGN.md](../../DESIGN.md).
Thiết kế ưu tiên công việc vận hành, phân biệt rạp/phạm vi/quyền rõ ràng trong bản sắc chung.

## Evidence on Hand

Hiện có README/PRODUCT mô tả phạm vi; chưa có code, build hoặc runtime Organizer được kiểm chứng.
[CONTEXT](../../CONTEXT.md) phân biệt mô hình mục tiêu với hiện trạng mô phỏng của hệ thống.
Dữ liệu báo cáo mẫu chưa chứng minh chỉ số đối soát hay doanh thu thật.

## Product Principles

1. Hiển thị rõ rạp, đối tượng và phạm vi tác động của thao tác.
2. Giữ quyền theo actor và dữ liệu được giao ở cả UI và backend.
3. Phân biệt yêu cầu, phê duyệt, thực thi và kết quả hoàn tiền.
4. Phản ánh trạng thái Core, giữ ngoại lệ/chính sách chưa chốt tại nguồn nghiệp vụ.

## Accessibility & Inclusion

Tuân theo [chuẩn UI](../../docs/04-standards/ui-quality.md): WCAG AA, bàn phím, tương phản,
nhãn và thông báo lỗi rõ ràng; kiểm chứng tác vụ trên máy tính và trình duyệt điện thoại khi triển khai.
