# Product — Customer Mobile

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Khách chưa đăng nhập khám phá thông tin công khai và khách hàng đặt vé của một đơn vị/chuỗi rạp.
Ứng dụng phục vụ quyền khách hàng; trải nghiệm nhân viên soát vé thuộc
[Organizer Mobile](../organizer-mobile/PRODUCT.md).

## Product Purpose

Đưa hành trình khám phá phim, đặt vé và sử dụng vé lên app điện thoại cài riêng của
[Movie Booking Platform](../../PROJECT-OVERVIEW.md). Khách hàng đặt trực tiếp hoặc qua Buaa AI
trong phạm vi được phép, theo dõi cùng một giao dịch và xuất trình QR tại rạp.

## Operating Context

- Chủ sản phẩm xác nhận hỗ trợ cả iOS và Android, với giao diện phù hợp từng hệ điều hành.
  `adaptive` chỉ nghĩa đó, không phải cam kết dùng cùng một framework.
- Khách có thể lưu QR chung để xuất trình khi điện thoại mất mạng; đây không phải xác nhận vé
  vẫn còn hiệu lực hoặc quyền soát ngoại tuyến. Thiết bị nhân viên kiểm tra qua Core khi online.
- Mở cổng thanh toán rồi quay lại app/chat phải giữ ngữ cảnh đơn và thời hạn giữ ghế hiện có.
  Không tự gia hạn hoặc tạo đơn mới khi đổi kênh.

## Capabilities and Constraints

Phạm vi mục tiêu gồm khám phá phim/rạp/suất, tài khoản/xác minh email, chọn ghế, combo/voucher,
thanh toán MoMo/VNPAY, xem đơn/vé, yêu cầu hủy/theo dõi hoàn; yêu thích/đánh giá,
hội viên/điểm/đổi voucher và thông tin cá nhân/thông báo.
Đây là phạm vi dự kiến, chưa phải chức năng đã triển khai.

[Mô hình use case](../../docs/03-product/use-cases.md) sở hữu mục tiêu, quyền, quy tắc và
[OPEN-01–OPEN-10](../../docs/03-product/use-cases.md#6-các-quyết-định-còn-mở);
[mô tả](../../docs/03-product/use-case-descriptions.md) sở hữu luồng/ngoại lệ;
[GLOSSARY](../../GLOSSARY.md) sở hữu thuật ngữ. Chat chỉ hỗ trợ phạm vi kênh AI tại nguồn đó.

Cinema Core quyết định ghế, giá, giữ ghế, thanh toán và phát hành vé. Chỉ trình bày đơn xác nhận/vé
hợp lệ từ phản hồi/chữ ký Core được xác minh. QR lưu cục bộ và redirect từ cổng không thay bằng chứng này.
Chỉ truy cập tài khoản/đơn/vé/điểm đúng quyền; không mở quyền vận hành từ app khách hàng.

Theo [thiết kế service](../../docs/05-specs/004-service-decomposition/spec.md), Agent lập đề xuất;
ứng dụng/lớp BFF gửi lệnh đã được khách xác nhận dưới quyền khách, không giao credential rộng cho Agent.

## Stack

Chưa chốt framework triển khai. Các đề cập React Native/Expo trong tài liệu kỹ thuật cũ là định hướng
trước [ADR-0002](../../docs/06-decisions/0002-customer-organizer-app-boundaries.md), không phải quyết định stack của lần này.

## Brand Commitments

Kế thừa tên Movie Booking Platform, trợ lý Buaa AI và bản sắc tại [DESIGN.md](../../DESIGN.md).
Chuyển bản sắc chung sang điều hướng, tương tác và khả năng tiếp cận phù hợp iOS/Android;
không sao chép nguyên bố cục Web thành trải nghiệm native.

## Evidence on Hand

Thư mục hiện có tài liệu phạm vi; chưa có mã app, build hay runtime Mobile được kiểm chứng.
[Customer Web](../customer-web/PRODUCT.md) cung cấp ngữ cảnh và dữ liệu mẫu để tham khảo,
không chứng minh tích hợp thật hoặc chất lượng của app Mobile. Xem [CONTEXT](../../CONTEXT.md).

## Product Principles

1. Giữ cùng ngữ cảnh giao dịch khi chuyển giữa Web, app và chat.
2. Xác nhận kết quả bằng nguồn Core có thẩm quyền, diễn đạt rõ các trạng thái chưa chắc chắn.
3. Phân biệt yêu cầu hủy, chấp thuận và kết quả hoàn tiền.
4. Giữ tác vụ khách hàng và quyền vận hành ở đúng ứng dụng, đúng vai trò.

## Accessibility & Inclusion

Theo [chuẩn chất lượng UI](../../docs/04-standards/ui-quality.md), hỗ trợ chữ theo cỡ hệ thống,
trình đọc màn hình, vùng chạm và thao tác điều hướng phù hợp từng hệ. Kiểm chứng trên simulator/emulator
hoặc thiết bị khi có app; tài liệu này chưa phải bằng chứng đạt khả năng tiếp cận.
