# ADR-0027 — HTTP trực tiếp và Node crypto cho MoMo/VNPAY

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý với phương án thanh toán A”
trong hội thoại Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`).
Chỉ chọn công nghệ/cách tích hợp; chưa viết adapter, gọi API sandbox/production, tạo merchant,
cài dependency, sửa code/config hoặc xác nhận runtime.

## Context

[B-05/B-06/R-03](../03-product/use-case-descriptions.md) yêu cầu Cinema Core khởi tạo thanh toán,
xác minh kết quả, phát hành vé và theo dõi hoàn tiền qua MoMo/VNPAY. BFF mô phỏng hiện có không
đại diện cho wire protocol của hai cổng. Cần kiểm soát encoding/signing, callback và kết quả chưa rõ.
Chữ ký cổng xác minh thông báo thanh toán; chữ ký/phản hồi Core cho client/Agent là ranh giới riêng.

## Decision

- Tích hợp **HTTP trực tiếp theo giao thức chính thức**, dùng **`fetch` tích hợp của Node** và
  **`node:crypto`**, trong Cinema Core NestJS/Fastify. Không thêm SDK thanh toán cộng đồng hoặc
  Axios chỉ để gửi HTTP trong lựa chọn này. Dùng thuật toán HMAC chuẩn, không tự thiết kế mật mã.
- Tách adapter **MoMo** và **VNPAY**: tạo giao dịch/payment URL, xác minh IPN, query/refund,
  kiểm response và ánh xạ trạng thái theo từng operation/version. Core giữ nghiệp vụ và quyền;
  adapter không tự phát vé, hoàn tiền hoặc coi HTTP 200 là giao dịch đã thành công.
- MoMo wallet one-time dùng request tạo giao dịch và `payUrl`; HMAC-SHA256 trên chuỗi trường
  theo đặc tả từng thao tác. VNPAY PAY 2.1 tạo URL, IPN thông thường là GET query,
  HMAC-SHA512 theo quy tắc sort/encode; amount VND nhân 100 đúng một lần bằng số nguyên.
  Query/refund có canonical riêng, không dùng chung signer PAY hoặc ký JSON.stringify tùy ý.
- Không mặc định bật raw-body capture toàn cục cho hai giao thức ký trường trên. Khi exact
  protocol cần bytes gốc, dùng khả năng Nest/Fastify `rawBody: true` và
  `RawBodyRequest<FastifyRequest>` với built-in parser còn hoạt động. Không đặt `bodyParser:false`
  hoặc lấy JSON đã serialize lại làm bytes gốc. Tách route/method/content type/ACK theo từng cổng.
- Xác minh chữ ký, merchant, attempt/đơn, số tiền/đơn vị tiền và kết quả giao dịch trước chuyển
  trạng thái. Return URL chỉ điều hướng; không thay IPN/query đã xác minh hoặc bằng chứng vé Core.
  Không đưa merchant secrets vào client/Agent prompt/log hoặc dùng lại làm khóa vé phía client.
- Lưu attempt/refund intent và định danh ổn định trước gọi cổng; không giữ transaction DB trong
  lúc chờ mạng. Timeout sau gửi giữ trạng thái chưa rõ, tra cứu/đối soát trước retry có tác dụng kinh tế.
  PostgreSQL/Drizzle giữ trạng thái, BullMQ hỗ trợ job đối soát theo đặc tả riêng; không hứa exactly-once.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| **HTTP trực tiếp + Node fetch/crypto** | Được chọn: hai cổng có phạm vi giới hạn, chủ dự án mạnh backend; audit giao thức/encoding rõ. Phải tự duy trì signer, error mapping và test vectors theo merchant/version. |
| SDK cộng đồng trong adapter | Hợp lệ nếu nguồn/license/maintenance và vectors được kiểm. Giảm phần đóng gói nhưng thêm phụ thuộc; không coi package tên `vnpay` là SDK chính thức hoặc ví dụ MoMo là SDK production. Không chọn ở vòng này. |

Không đổi sang trung gian hợp nhất thanh toán: merchant/settlement/phí và ranh giới ký khác là thay đổi
phạm vi sản phẩm, không chỉ thay thư viện. MoMo/VNPAY vẫn là hai cổng đã chọn.

## Consequences

- Phải pin runtime/API profile và có vectors create/IPN/query/refund: Unicode, space/`+`/`%`,
  empty/null, query trùng, amount scale, chữ ký lỗi, sai merchant/đơn/tiền/kết quả và ACK từng cổng.
- Kiểm duplicate/out-of-order IPN, nhiều attempt thu cùng đơn, hold hết hạn/ghế đã giải phóng,
  timeout sau provider nhận lệnh/DB commit, crash/retry và hoàn một phần/toàn phần không vượt khoản thu.
  B-06 đã yêu cầu khoản thu sau giải phóng ghế khởi tạo R-03 trả lại; không tự chọn ghế khác.
  Chỉ báo đã hoàn khi xác nhận; OPEN-01…OPEN-03 giữ thẩm quyền/chính sách/ngoại lệ chưa chốt.
- Tài liệu response create MoMo EN/VI đang có công thức ký trình bày bất nhất; phải xác nhận
  merchant contract/test vectors đúng version, không phỏng đoán. Một số nguồn chỉ truy xuất được
  qua index chính thức do trang trực tiếp 403/timeout; xem giới hạn trong nghiên cứu liên kết.
- Sandbox và production cần keys/endpoint/quyền riêng; production onboarding, quyền QR/deeplink/
  refund và hỗ trợ đối soát phải được merchant xác nhận. Chưa chọn timeout/backoff hoặc chạy sandbox.

### Chi phí

Node fetch/crypto không thu phí SDK theo giao dịch. Phí merchant, hoàn tiền, settlement, VAT và hạn mức
phụ thuộc hợp đồng/báo giá thực; chưa được xác minh, không mặc định bằng 0 từ mock/sandbox.
Hosting/network/đối soát vẫn có chi phí. Quyết định này không cấp quyền giao dịch thật hoặc mua dịch vụ.

## References

- [Nghiên cứu thanh toán và giới hạn nguồn](../99-notes/payment-gateway-integration-research.md).
- [MoMo one-time/signing](https://developers.momo.vn/v3/docs/payment/api/wallet/onetime/).
- [MoMo notification](https://developers.momo.vn/v3/docs/payment/api/result-handling/notification/).
- [MoMo refund/query](https://developers.momo.vn/v3/docs/payment/api/payment-api/refund/).
- [VNPAY PAY](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html).
- [VNPAY query/refund](https://sandbox.vnpayment.vn/apis/docs/truy-van-hoan-tien/querydr%26refund.html).
- [Nest raw body](https://docs.nestjs.com/faq/raw-body).
- [Node fetch](https://nodejs.org/api/globals.html#fetch), [Node crypto](https://nodejs.org/api/crypto.html).

Nguồn/Context7 đối chiếu ngày 2026-11-17 trong nghiên cứu; chưa có bằng chứng sandbox/runtime/production.
