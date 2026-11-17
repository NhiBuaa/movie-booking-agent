# Tích hợp MoMo/VNPAY trong Cinema Core

Tra cứu nguồn chính thức và Context7 (`/nestjs/docs.nestjs.com`) ngày **2026-11-17**.
**Phương án A đã được chấp thuận tại [ADR-0027](../06-decisions/0027-direct-http-and-node-crypto-for-payment-gateways.md); chưa triển khai.**
So sánh/đề xuất dưới đây giữ bối cảnh nghiên cứu trước quyết định; ADR sở hữu lựa chọn hiện hành.
Không mở lại lựa chọn cổng MoMo/VNPAY của sản phẩm.
Đích: worktree `docs-tech-stack-decisions/movie-booking-agent`, detached HEAD `8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.
Chỉ đọc/ghi ghi chú này; chưa gọi API sandbox/production, tạo merchant, cài dependency, sửa code hoặc chạy test/runtime.
Một số trang MoMo bị 403, VNPAY timeout khi mở trực tiếp; nội dung nêu dưới có từ index chính thức được công cụ tìm kiếm trả về.
Phải đối chiếu phiên bản tài liệu và test vectors merchant thực cấp trước implementation acceptance.

## Ranh giới sản phẩm và hiện trạng đã đọc

[B-05/B-06/R-03](../03-product/use-case-descriptions.md) yêu cầu Core khởi tạo/xác minh/đối soát,
chống thu/phát vé/hoàn trùng. Return URL không tự xác nhận mua thành công; timeout cần tiếp tục đối soát.
**B-06 đã quy định** khoản thu đến sau giải phóng ghế phải khởi tạo R-03 trả lại, không đổi sang ghế khác;
đây không phải đề xuất mới tự động hoàn mọi ca lỗi. R-03 chỉ ghi đã hoàn khi có xác nhận, không tự khôi phục vé nếu hoàn lỗi.
OPEN-01…OPEN-03 tiếp tục giữ chính sách, thẩm quyền và ngoại lệ chưa chốt; quyền theo dõi không tự cho hoàn thủ công.

[BFF spec](../05-specs/002-web-bff-routes/spec.md) nói rõ adapter in-memory là mô phỏng; Core chưa có runtime thực.
Code `apps/web/src/app/api/payment/webhook/route.ts` nhận POST JSON `PaymentWebhookPayload` chung;
`apps/web/src/server/crypto-utils.ts` ký chuỗi trường phân cách `:` bằng HMAC-SHA256 với khóa Core.
Đó **không phải** wire protocol hay chữ ký MoMo/VNPAY. Comment generic SHA256 trong contracts không chứng minh hai cổng cùng thuật toán.
Chữ ký cổng xác minh thông báo thanh toán; **chữ ký/phản hồi Core** xác minh đơn/vé cho client/Agent là ranh giới khác.
Không tái sử dụng merchant secret để client xác nhận vé, hoặc đưa secret/provider SDK vào Web/Mobile bundle.

## Hai cách tích hợp trực tiếp

| Cách | Bundle và quyền sở hữu | Đánh đổi |
|---|---|---|
| **A. HTTP chính thức + Node crypto, adapter từng cổng** | Core NestJS/Fastify; `fetch` tích hợp của Node phía server, `node:crypto`; adapter MoMo/VNPAY tách tạo URL/request, canonical signing, verify IPN, query/refund và map trạng thái. | Kiểm soát protocol/version và audit rõ; tự duy trì encoding/test vectors/error mapping khi cổng thay đổi. Dùng HMAC chuẩn có sẵn, không tự thiết kế thuật toán mật mã. |
| **B. SDK cộng đồng trong adapter Core** | Ví dụ `vnpay` của `lehuygiang28`; Core vẫn giữ nghiệp vụ, identity, dedup và đối soát. MoMo phải đánh giá riêng, không suy có SDK Node chính thức tương đương. | Giảm code đóng gói protocol/types; thêm phụ thuộc và nguy cơ lệch version/encoding. Phải đọc nguồn/khóa version/kiểm vectors, SDK không tự bảo đảm không thu hoặc hoàn trùng. |

Không đưa trung gian thanh toán hợp nhất vào shortlist: chuyển merchant/settlement/fees và ranh giới ký là thay đổi phạm vi,
không phải chỉ đổi thư viện khi sản phẩm đang chọn hai cổng trực tiếp. Chưa kiểm/chọn/mua nhà cung cấp trung gian.

## MoMo — create, IPN và signing theo thao tác

Wallet one-time dùng `POST /v2/gateway/api/create`, `requestType=captureWallet`; response có `payUrl` để chuyển khách.
Tài liệu ghi timeout tối thiểu nên 30 giây; `requestId` dùng cho idempotency. Không dùng timeout thành thất bại đã xác nhận.
`qrCodeUrl` trong response là **payload tạo QR, không phải URL ảnh**; production deeplink/QR cần quyền riêng.
[MoMo one-time](https://developers.momo.vn/v3/vi/docs/payment/api/wallet/onetime/).
Create ký HMAC-SHA256 trên chuỗi `key=value` nối `&`, thứ tự trường theo mô tả API, **không ký raw JSON**:
`accessKey, amount, extraData, ipnUrl, orderId, orderInfo, partnerCode, redirectUrl, requestId, requestType`.
IPN có canonical khác:
`accessKey, amount, extraData, message, orderId, orderInfo, orderType, partnerCode, payType, requestId, responseTime, resultCode, transId`.
Không thêm/bớt trường bằng cách sort toàn bộ JSON tùy ý. [MoMo signatures](https://developers.momo.vn/v3/docs/payment/api/other/signature/),
[IPN fields/signature](https://developers.momo.vn/v3/docs/payment/api/wallet/onetime/).
IPN là **POST JSON**, redirect là GET; MoMo yêu cầu phản hồi IPN HTTP **204** không body.
ACK không thay bằng chứng ghi nhận giao dịch bền vững; thiết kế nhận/lưu/xử lý và retry phải bảo toàn nghiệp vụ.
[MoMo notification](https://developers.momo.vn/v3/vi/docs/payment/api/result-handling/notification/).
Result code, merchant/partnerCode, orderId/requestId, amount VND và transId phải khớp bản ghi Core trước chuyển trạng thái.
**Chưa rõ:** công thức ký response create trong trang EN/VI có lỗi trình bày `payUrl=&payUrl` và lệch trường `message`;
không tự sửa bằng phỏng đoán. Cần xác nhận official merchant contract/vector cho response ở đúng version trước tích hợp.

## VNPAY PAY 2.1 — payment URL và IPN query

PAY thông thường tạo **URL GET**; IPN mẫu chính thức cũng là **GET query**, không phải POST raw body.
`vnp_Amount = số VND × 100`; so khớp bằng số nguyên và một lần scale, không float/nhân hai lần.
Kiểm `vnp_TmnCode`, TxnRef/attempt, amount, transaction number và kết quả; thành công cần kết quả giao dịch hợp lệ,
không chỉ checksum đúng hoặc trình duyệt về Return URL. IPN trả JSON `RspCode`/`Message` đúng giao thức,
tách mã ACK merchant khỏi `vnp_ResponseCode`/`vnp_TransactionStatus` của cổng.
[VNPAY PAY](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html), [Return/IPN/amount FAQ](https://sandbox.vnpayment.vn/apis/docs/faqs/).

Profile 2.1.0 chọn HMAC-SHA512 theo hướng dẫn chuyển đổi: bỏ signature trước verify, bỏ SecureHashType của profile cũ,
sort tên tham số, encode đúng quy tắc official sample rồi ký chuỗi query UTF-8; không ký raw URL hoặc JSON.stringify.
Node sample dùng sortObject/encodeURIComponent, đổi khoảng trắng `%20` thành `+`, sau đó stringify với `encode:false`;
không re-encode lần hai hoặc tùy tiện đổi `+`/space. 2.1.0 không gửi `vnp_SecureHashType` như 2.0.x.
Trang có cả ví dụ thuật toán/version cũ; pin profile merchant trước chọn thuật toán, không fallback nhận MD5 để “tương thích”.
[VNPAY hash migration](https://sandbox.vnpayment.vn/apis/docs/chuyen-doi-thuat-toan/changeTypeHash.html).
Query parser có thể biến tham số lặp thành array/normalize encoding: adapter phải kiểm scalar/field set và canonical theo profile,
không blame Fastify JSON parser cho khác biệt của một GET query. Không lẫn profile PAY thường với tài liệu trả góp/định kỳ.

## Query/refund và trạng thái chưa rõ

MoMo có POST `/v2/gateway/api/query`, `/refund`, `/refund/query`; mỗi thao tác có trường ký riêng.
Refund hỗ trợ toàn phần/một phần, ID hoàn riêng và `requestId` kiểm idempotency; tài liệu ghi timeout tối thiểu 30 giây.
Hạn mức/kênh và quyền hoàn cần đối chiếu merchant; không biến khả năng API thành thẩm quyền nghiệp vụ.
[MoMo query](https://developers.momo.vn/v3/docs/payment/api/payment-api/query/),
[MoMo refund/query](https://developers.momo.vn/v3/docs/payment/api/payment-api/refund/).
VNPAY QueryDr/refund dùng **POST JSON** tới merchant transaction API, HMAC checksum trên chuỗi trường nối `|`
theo thứ tự từng command, **khác** canonical query PAY. Refund gồm transaction type/amount/transaction date/createBy;
response có mã API và trạng thái giao dịch cần phân biệt. Không tái sử dụng signer PAY hoặc suy HTTP 200 là đã hoàn.
[VNPAY query/refund](https://sandbox.vnpayment.vn/apis/docs/truy-van-hoan-tien/querydr%26refund.html).
Core lưu attempt/refund intent và ID ổn định trước khi gửi; timeout sau gửi là **unknown**, tra cứu/reconcile trước gửi lại.
Query có retry giới hạn; payment/refund retry không tạo attempt kinh tế mới mù. Lịch/backoff/expiry và xử lý ngoại lệ chưa chốt.
PostgreSQL/Drizzle giữ trạng thái, BullMQ có thể chạy đối soát trong bundle đã chọn; không giữ DB transaction trong lúc chờ HTTP.
Chuyển trạng thái/phát vé/dedup phải được bảo vệ ở Core; job queue hoặc IPN delivery không tự là exactly-once.

## NestJS/Fastify: rawBody chỉ khi giao thức cần bytes

Nest hỗ trợ `NestFactory.create<NestFastifyApplication>(..., new FastifyAdapter(), {rawBody:true})`,
`RawBodyRequest<FastifyRequest>.rawBody` là Buffer; cần giữ built-in body parser, **không** đặt `bodyParser:false`.
[Nest raw-body](https://docs.nestjs.com/faq/raw-body).
Đây là khả năng kỹ thuật, không phải yêu cầu bật global cho hai canonical-field protocol trên.
MoMo POST JSON có thể parse rồi dựng đúng fields; VNPAY PAY IPN đọc query. Chỉ giữ raw bytes khi exact protocol ký bytes.
Route provider nên tách method/content type/response riêng, không ép qua envelope BFF chung; validate trước mọi tác dụng phụ.
HTTP limits, capture/parser registration và request lifecycle phải kiểm tại version Nest/Fastify được pin;
DTO transformation làm đổi số/chuỗi trước canonicalization cũng cần tránh hoặc đặc tả, không lấy reserialize làm original bytes.
Node có HMAC và so sánh timing-safe; kiểm format/độ dài chữ ký trước so sánh, giữ secret server-side và không log canonical chứa dữ liệu nhạy cảm.
[Node crypto](https://nodejs.org/api/crypto.html). Chưa pin Node/Core HTTP client version hoặc secret-management tool.

## SDK, merchant và chi phí

`lehuygiang28/vnpay` do cá nhân/cộng đồng sở hữu, **MIT**, không phải npm chính thức VNPAY chỉ vì tên package.
Release page tra cứu ghi **2.5.2**, có sửa checksum query/refund và tests; đó là dấu hiệu bảo trì, không chứng minh tương thích merchant.
[SDK source/license](https://github.com/lehuygiang28/vnpay), [releases](https://github.com/lehuygiang28/vnpay/releases).
Repo `momo-wallet/payment` tự mô tả **example code**, có NodeJS; README chỉ ghi `(c) MoMo`, không xác lập MIT hay SDK Node hỗ trợ SLA.
Không bê demo/package tên momo vào production hoặc coi license/maintenance đã được chấp thuận.
[MoMo examples](https://github.com/momo-wallet/payment).
MoMo có keys khác cho test/production; production cần business/merchant onboarding, quyền QR/deeplink/hoàn theo hợp đồng.
[MoMo integration](https://developers.momo.vn/v3/docs/payment/onboarding/integration-process/).
VNPAY cung cấp sandbox registration trong PAY guide; thông tin merchant/refund/quyền production phải do đơn vị cấp xác nhận.
Sandbox test pass không chứng minh production hoạt động. Chưa đăng ký merchant, chưa có sandbox hoặc production acceptance.
Node crypto/HTTP không có phí SDK theo giao dịch; SDK MIT không tạo nghĩa vụ mua SaaS.
**Chưa xác minh biểu phí merchant áp dụng**: cần báo giá/hợp đồng về giao dịch, hoàn, settlement, VAT và hạn mức;
không đặt phí 0 đồng theo mock `serviceFee:0` hoặc suy phí merchant từ `userFee` response. Hosting/network/đối soát vẫn có chi phí.

## Đề xuất và kiểm chứng bắt buộc về sau

**Ưu tiên A:** adapters HTTP trực tiếp trong Cinema Core + `fetch` tích hợp của Node + crypto chuẩn Node,
tách signer theo operation/version. [Node fetch](https://nodejs.org/api/globals.html#fetch) dựa trên Undici;
không cần thêm SDK thanh toán hoặc Axios chỉ để gửi HTTP. Vẫn phải kiểm status, schema, timeout/deadline,
connection reuse và lỗi sau khi cổng đã nhận lệnh; version runtime/transport sẽ pin khi triển khai.
Phù hợp chủ dự án mạnh backend, số cổng giới hạn và cần nhìn rõ giao thức; không chọn chỉ vì ít dependency.
B hợp lệ nếu SDK vượt qua vectors/nguồn/license audit và giảm đáng kể bảo trì; vẫn không đẩy business correctness vào SDK.
Trước triển khai cần vectors create/IPN/query/refund từ merchant: Unicode/space/`+`/`%`/`&`/empty/null,
sort/encoding, amount×100/overflow, sai secret/merchant/order/result, duplicate query keys và malformed signature.
Kiểm duplicate/out-of-order IPN, hai attempt thu cùng đơn, callback với hold vừa hết/ghế đã giải phóng,
timeout sau cổng nhận lệnh hoặc sau DB commit, process crash/retry và partial/full refund không vượt khoản thu.
Kiểm ACK mỗi cổng, provider response/query authenticity, Return URL giả, quyền owner/rạp và Core ticket proof riêng.
Không chạy các ca này trong nghiên cứu; chưa có bằng chứng sandbox/runtime/production, hiệu năng hoặc triển khai.
