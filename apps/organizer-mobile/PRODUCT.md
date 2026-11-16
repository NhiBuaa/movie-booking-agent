# Product — Organizer Mobile

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Quản trị viên toàn chuỗi, quản lý rạp và nhân viên soát vé, mỗi vai trò giữ phạm vi riêng.
Trải nghiệm nhân viên được chuyển từ Mobile cũ theo
[ADR-0002](../../docs/06-decisions/0002-customer-organizer-app-boundaries.md).
Nhân viên quầy bắp nước là actor riêng; kênh/màn hình cho tác vụ giao combo cần đặc tả trước khi triển khai,
không tự gán quyền đó cho nhân viên soát vé hoặc quản lý.

## Product Purpose

Cung cấp ứng dụng vận hành cài riêng cho
[Movie Booking Platform](../../PROJECT-OVERVIEW.md): quản lý công việc theo vai trò khi dùng điện thoại
và hỗ trợ nhân viên tra cứu/soát quyền ghế tại rạp. Bối cảnh này tách với
[Customer Mobile](../customer-mobile/PRODUCT.md), cùng nghiệp vụ với [Organizer Web](../organizer-web/PRODUCT.md).

## Operating Context

- Hỗ trợ cả iOS và Android, giao diện phù hợp từng hệ theo xác nhận của chủ sản phẩm.
  `adaptive` không chọn framework hay cấp thêm quyền nghiệp vụ.
- Thiết bị nhân viên soát vé phải online để xác minh trạng thái qua Core. Camera dùng quét QR
  theo tác vụ; quyền camera/luồng từ chối cần được thiết kế khi triển khai.
- Quản lý/quản trị thao tác theo rạp và quyền được cấp. Ma trận tính năng quản trị trên Mobile
  chưa chốt; không mặc định mọi màn hình Web được sao chép sang app.

## Capabilities and Constraints

Phạm vi mục tiêu gồm quản trị/vận hành theo M-* và R-* được cấp, cùng soát vé/tra cứu hỗ trợ O-01–O-03,
kiểm tra quyền ghế O-05 theo [mô hình use case](../../docs/03-product/use-cases.md) và
[mô tả](../../docs/03-product/use-case-descriptions.md).

QR chung của lượt đặt tra cứu quyền theo ghế; một lần quét không dùng hết đơn.
Thiếu QR phải theo luồng xác minh đã chốt; tên/số điện thoại/mã đơn đơn thuần không đủ.
Nhân viên không tự duyệt hoàn; quản lý không tự nhận quyền soát/giao combo. Core kiểm tra quyền,
trạng thái và ghi nhận giao dịch; app không tự xác nhận soát thành công từ QR cục bộ.

[OPEN-01–OPEN-10](../../docs/03-product/use-cases.md#6-các-quyết-định-còn-mở) giữ nguyên,
gồm ngoại lệ không nhận email/mất mạng, thời gian vào rạp, giao combo, hoàn tiền và báo cáo.
Ứng dụng không bổ sung soát ngoại tuyến hay cơ chế bỏ qua kiểm tra. Thuật ngữ theo [GLOSSARY](../../GLOSSARY.md).

## Stack

Chưa chốt framework Mobile; không tạo scaffold hoặc dependency trong lần tổ chức thư mục này.

## Brand Commitments

Kế thừa [DESIGN.md](../../DESIGN.md), giữ bản sắc chung khi dùng điều hướng, vùng chạm và tương tác
phù hợp iOS/Android. Không dùng việc đồng nhất thương hiệu để bỏ qua hành vi hệ điều hành.

## Evidence on Hand

Thư mục mới chỉ có tài liệu phạm vi. Chưa có app, camera scanner, xác thực hoặc giao dịch Core được
kiểm chứng trên thiết bị; contracts/code hiện có chưa thể hiện đầy đủ soát từng ghế.
Xem [CONTEXT](../../CONTEXT.md); việc chuyển trách nhiệm trong tài liệu không chứng minh runtime đã triển khai.

## Product Principles

1. Mỗi tác vụ dùng đúng vai trò và rạp được giao.
2. Xác minh quyền từng ghế qua Core trước ghi nhận sử dụng.
3. Trình bày rõ chưa xác minh, thành công, từ chối và chưa rõ kết quả để tránh thao tác lặp mù.
4. Phân biệt quyết định vận hành với kết quả thực thi và hoàn tiền.

## Accessibility & Inclusion

Theo [chuẩn UI](../../docs/04-standards/ui-quality.md), hỗ trợ cỡ chữ hệ thống, trình đọc màn hình,
vùng chạm và điều hướng theo hệ điều hành. Kết quả quét/lỗi cần thông tin đọc được, không chỉ dùng màu.
Kiểm chứng bằng emulator/simulator hoặc thiết bị khi có app; chưa có bằng chứng đạt trong lần này.
