# Product — Web đặt vé cho khách hàng

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Khách chưa đăng nhập và khách hàng của một đơn vị/chuỗi rạp: tìm phim, chọn rạp/suất chiếu,
đặt vé và theo dõi đơn/vé của mình. Công cụ vận hành cho quản lý và nhân viên thuộc các bề mặt
khác trong nền tảng; không suy quyền vận hành từ quyền khách hàng.

## Product Purpose

Đây là bề mặt khách hàng `apps/customer-web` của [Movie Booking Platform](../../PROJECT-OVERVIEW.md).
Người dùng có thể đặt vé trực tiếp hoặc trò chuyện với Buaa AI để được hỗ trợ trong phạm vi đã chốt.
Mục tiêu là hoàn thành cùng một giao dịch nhất quán khi chuyển giữa hai kênh và hiểu rõ trạng thái
giữ ghế, thanh toán, vé và yêu cầu hỗ trợ.

## Operating Context

- Desktop và trình duyệt điện thoại đều quan trọng ngang nhau (chủ sản phẩm xác nhận trong vòng init).
  Trình duyệt điện thoại vẫn là nền tảng Web, không phải ứng dụng native.
- Giao diện hiện dùng tiếng Việt; nghiệp vụ hiện thể hiện tiền Việt Nam. Chưa suy ra cam kết
  hỗ trợ ngôn ngữ hoặc thị trường khác.
- Người dùng có thể rời trang/chat để thanh toán qua cổng rồi quay lại tiếp tục theo dõi giao dịch.
  Chuyển kênh không tự tạo lại đơn hoặc gia hạn giữ ghế.

## Capabilities and Constraints

Các khả năng dưới đây là **phạm vi sản phẩm mục tiêu**, không phải xác nhận đã tích hợp vận hành:

- Khám phá phim/rạp/suất chiếu; tài khoản và xác minh email; chọn ghế theo phòng; combo/voucher;
  thanh toán MoMo/VNPAY; xem đơn và vé điện tử.
- Gửi yêu cầu hủy, theo dõi xử lý/hoàn tiền; lưu phim yêu thích, viết đánh giá; hội viên, điểm,
  đổi voucher; hồ sơ và thông báo giao dịch.
- Đặt trực tiếp và chat dùng cùng trạng thái giao dịch. Phạm vi thao tác qua chat do
  [mô hình use case](../../docs/03-product/use-cases.md#phạm-vi-kênh-ai) sở hữu;
  không suy mọi chức năng khách hàng đều được thao tác trong chat.

[Mô hình use case](../../docs/03-product/use-cases.md) sở hữu actor, mục tiêu và quy tắc nghiệp vụ;
[mô tả use case](../../docs/03-product/use-case-descriptions.md) sở hữu luồng và điều kiện;
[GLOSSARY](../../GLOSSARY.md) sở hữu thuật ngữ. Tài liệu này chỉ ghi bối cảnh của Web.

Cinema Core là nguồn thẩm quyền cho ghế, giá, giữ ghế, xác nhận thanh toán và phát hành vé.
Web và AI chỉ trình bày đơn đã xác nhận/vé hợp lệ khi có phản hồi Core được xác minh theo hợp đồng;
không dùng lời chat hoặc trang chuyển hướng thanh toán làm bằng chứng thành công.

Theo [thiết kế service](../../docs/05-specs/004-service-decomposition/spec.md), Agent lập đề xuất;
Web/BFF gửi lệnh đã được khách xác nhận dưới quyền khách. BFF không sở hữu giao dịch hoặc dữ liệu service.

Các [OPEN-01–OPEN-10](../../docs/03-product/use-cases.md#6-các-quyết-định-còn-mở) được giữ nguyên
tại nguồn: chính sách hủy/hoàn, ưu đãi/điểm, ngoại lệ vận hành, nhà cung cấp và các phần chưa chốt
phải được quyết định trước khi tuyên bố chức năng tương ứng sẵn sàng phục vụ thực tế.

## Stack

Nền hiện có dùng Next.js 16 + React + TypeScript. Hướng đã chọn: TanStack Query cho dữ liệu API,
Zustand có phạm vi cho UI draft theo
[ADR-0017](../../docs/06-decisions/0017-tanstack-query-and-zustand-for-frontend-state.md);
React Hook Form + resolvers + Zod 4 theo
[ADR-0025](../../docs/06-decisions/0025-react-hook-form-and-zod-for-frontend-forms.md);
React Aria Components cho nền tương tác Web theo
[ADR-0026](../../docs/06-decisions/0026-react-aria-components-for-web-ui-primitives.md), giữ CSS modules/tokens.
Client SSE dùng browser fetch + eventsource-parser theo
[ADR-0024](../../docs/06-decisions/0024-fetch-and-eventsource-parser-for-sse-clients.md).
Không coi các lựa chọn này là dependency đã cài hoặc chức năng runtime đã tích hợp; React local state
vẫn là mặc định và dữ liệu/đường lệnh giao dịch thuộc Core.

## Brand Commitments

Tên nền tảng là Movie Booking Platform; metadata Web hiện dùng CinoraAgent và tên trợ lý Buaa AI.
Kế thừa bản sắc Ferrari Dark Cinema tại [DESIGN.md](../../DESIGN.md) và token dùng chung;
không tạo bộ nhận diện riêng trong tài liệu này. Tên bản sắc không chứng minh quan hệ với thương hiệu
bên ngoài hoặc quyền sử dụng tài sản của họ.

## Evidence on Hand

- Web đã có màn hình và dữ liệu mẫu; ảnh nằm trong [artworks](public/images/artworks/),
  [cinemas](public/images/cinemas/) và [icons](public/icons/).
- [CONTEXT.md](../../CONTEXT.md) và [đặc tả BFF](../../docs/05-specs/002-web-bff-routes/spec.md)
  phân biệt hiện trạng mô phỏng với mô hình mục tiêu: adapter dùng bộ nhớ tiến trình,
  định danh qua header mô phỏng; chưa xác nhận tích hợp Core, LLM, email hoặc thanh toán thật.
- Màn hình, dữ liệu/ảnh mẫu và hợp đồng không chứng minh đối tác rạp, quyền nội dung,
  lời chứng thực của khách hàng, hiệu năng hay giao dịch thật. Init không tái kiểm chứng runtime.

## Product Principles

1. Hiển thị trạng thái giao dịch theo nguồn có thẩm quyền và bằng chứng đã xác minh.
2. Giữ liên tục ngữ cảnh đặt vé giữa luồng trực tiếp và chat.
3. Phân biệt yêu cầu hủy, quyết định chấp thuận và kết quả hoàn tiền.
4. Bảo đảm tác vụ chính sử dụng được trên cả desktop và trình duyệt điện thoại.

## Accessibility & Inclusion

Tuân theo [chuẩn chất lượng UI](../../docs/04-standards/ui-quality.md): WCAG AA,
điều hướng bàn phím, tương phản và kiểm chứng giao diện ở kích thước liên quan.
Đây là yêu cầu chất lượng; chưa phải kết quả đánh giá khả năng tiếp cận của ứng dụng.
