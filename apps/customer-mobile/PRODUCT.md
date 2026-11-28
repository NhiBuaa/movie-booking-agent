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
Bổ sung theo Q173-A: đổi ghế cùng suất B-09; gửi/theo dõi xét lại đánh giá L-07;
đổi email xác minh cũ/mới, xóa chủ động một/toàn bộ chat A-06 và yêu cầu/theo dõi xóa tài khoản A-07.
Chat không tự xóa theo kỳ; chờ đóng giữ quyền đơn cũ theo nguồn nghiệp vụ.
Đây là yêu cầu mục tiêu đã chọn, chưa phải chức năng đã triển khai.

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

React Native + Expo + TypeScript, Expo Router, development builds và SecureStore cho phiên theo
[ADR-0016](../../docs/06-decisions/0016-expo-router-and-mobile-native-foundation.md).
Kho snapshot vé offline chọn MMKV mã hóa, SecureStore giữ khóa theo
[ADR-0023](../../docs/06-decisions/0023-encrypted-mmkv-for-offline-mobile-tickets.md); không cho phép soát ngoại tuyến.
TanStack Query/Zustand, React Hook Form/Zod và client SSE theo [README](README.md).
Giữ component native riêng, không dùng primitive DOM React Aria như component native.
Đây là lựa chọn công nghệ, chưa có scaffold/dependency/build hoặc runtime được kiểm chứng.

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
