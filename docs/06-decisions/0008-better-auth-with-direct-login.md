# ADR-0008 — Better Auth với form đăng nhập trực tiếp

## Status

Accepted — ngày 2026-11-16, chủ sản phẩm trả lời “tôi đồng ý chọn phương án A” trong hội thoại
Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`), sau khi làm rõ A là **Better Auth với form
đăng nhập trực tiếp trên Web/Mobile**, phân biệt với OAuth/OIDC qua cửa sổ trình duyệt ở phương án B.
Chỉ chấp thuận lựa chọn công nghệ và hướng đăng nhập; chưa cài dependency, sửa code hoặc triển khai.

## Context

[Mô hình sản phẩm](../03-product/use-cases.md) chốt email/mật khẩu, điện thoại tùy chọn, khách tự
đăng ký và vai trò vận hành được cấp nội bộ. Xác minh email là điều kiện trước giữ ghế/mua vé,
không tự đổi thành điều kiện bắt buộc để tạo tài khoản hoặc đăng nhập.

Web dùng Next.js, Mobile định hướng Expo; các kênh phải theo [DESIGN.md](../../DESIGN.md).
Chủ sản phẩm ưu tiên tự kiểm soát giao diện Ferrari Dark Cinema và tích hợp TypeScript/Drizzle
với PostgreSQL đã chọn ở ADR-0003/0005. Mục tiêu portfolio kiến trúc phân tán không tự tạo yêu cầu
mọi lần đăng nhập phải qua OAuth/OIDC. Chưa có yêu cầu cho ứng dụng bên ngoài dùng hệ thống làm IdP.

## Decision

- Chọn **Better Auth mã nguồn mở** cho xác thực email/mật khẩu, quản lý phiên và các luồng tài khoản
  liên quan. Tự xây form Web và form native Mobile theo Design System; dùng tích hợp Expo cho Mobile.
  Không bắt luồng đăng nhập tài khoản riêng này chuyển qua trang OAuth trong trình duyệt.
- Dùng **session** để quản lý trạng thái đăng nhập. Giữ hướng **JWT ký bất đối xứng và JWKS** cho
  xác thực tại các API độc lập như Core/Agent; JWT plugin của Better Auth là cơ chế thư viện đã đối chiếu
  cho hướng này. Session và JWT phục vụ hai vai trò, không thay thế nhau; hợp đồng cấp token và
  cấu hình plugin cụ thể vẫn cần thiết kế, không mặc định dùng các giá trị issuer/audience/TTL sẵn có.
- Dùng khả năng tích hợp **Drizzle/PostgreSQL** cho dữ liệu xác thực. Giữ ranh giới sở hữu và quyền
  truy cập dữ liệu Auth/Core; cùng hạ tầng PostgreSQL không cho phép các dịch vụ ghi bảng của nhau.
  Chưa chọn database/schema vật lý hoặc nơi chạy Better Auth cùng tiến trình hay dịch vụ riêng.
- **Core tiếp tục kiểm tra quyền nghiệp vụ hiện hành** theo người dùng, hành động, rạp và tài nguyên.
  Chữ ký JWT hợp lệ không tự chứng minh quyền sở hữu đơn, quyền soát vé hoặc email đã xác minh hiện tại.
- **Chưa chọn OAuth Provider, Organization/Teams hoặc một thư viện phân quyền riêng.** Một chuỗi rạp
  không tự đồng nghĩa mô hình SaaS nhiều tenant. Khách không mặc nhiên là thành viên tổ chức của từng rạp;
  role mặc định của plugin không tự ánh xạ vai trò nghiệp vụ. Giữ nguyên BR và OPEN của mô hình sản phẩm.

## Alternatives Considered

| Phương án | Điểm phù hợp | Đánh đổi / kết quả |
|---|---|---|
| **A — Better Auth, form trực tiếp + session, hướng JWT/JWKS cho API** | Chủ động UI native/Web; tích hợp TypeScript, Drizzle và Expo. | Được chọn. Dự án sở hữu form, vòng đời phiên, hợp đồng JWT, bảo vệ API và vận hành Auth. |
| B — Better Auth OAuth Provider, Authorization Code + PKCE | Chuẩn hóa client/resource và đăng nhập tập trung; thuận lợi khi có nhu cầu OIDC/SSO hoặc client bên ngoài. | Không chọn cho luồng hiện tại. Mobile mở cửa sổ xác thực của trình duyệt hệ thống rồi quay lại app; trang vẫn do ta thiết kế. Thêm cấu hình client/redirect và tình huống lỗi. |
| Keycloak hoặc Auth0 | Identity độc lập có sẵn khả năng quản trị; Auth0 giảm phần tự vận hành nền tảng. | Đã so sánh nhưng không chọn. Better Auth phù hợp hơn ưu tiên UI và tích hợp hiện tại; không suy Keycloak luôn tốn thêm 1 GB RAM hoặc Better Auth nhanh/an toàn hơn khi chưa đo. |

OAuth qua trình duyệt không nhất thiết bật hẳn Safari/Chrome bên ngoài app. Khuyến nghị RFC 8252 áp
dụng khi thực hiện luồng OAuth native; không buộc mọi hệ thống đăng nhập tài khoản riêng phải chọn B.
Không chọn B cũng không loại khả năng bổ sung OAuth/SSO sau này khi có yêu cầu và quyết định riêng.

## Consequences

- Phải bảo vệ cookie/phiên Web, CSRF và nơi lưu credential Mobile; không giữ mật khẩu hoặc token
  trong log, prompt LLM hay dữ liệu client không phù hợp. Cần xử lý xác minh/reset, chống dò mật khẩu
  và gửi lại theo chính sách được chốt; UI mẫu không xác lập quota, độ dài hoặc hạn mã.
- Core/Agent phải xác minh chữ ký và issuer/audience/hạn dùng của JWT, cùng quyền cần thiết cho API.
  Định danh lấy từ bằng chứng đã xác thực, không từ email/userId do client hay Agent tự khai.
  Private key chỉ thuộc bên cấp token; public keys/JWKS cần cache và luân chuyển có kiểm soát.
- JWT plugin không tự cung cấp OAuth authorization server hoặc token exchange. A chưa dùng
  OAuth Provider nên không mặc định có OAuth scopes, refresh grant hay endpoint introspection của Provider.
  Claim và cách nhận biết loại token phải được đặc tả cho giao thức đã chọn.
- Xác minh JWT cục bộ không tự biết phiên đã đăng xuất/tài khoản bị khóa. Cần chốt TTL, cách cấp lại,
  cửa sổ thu hồi, kiểm tra trạng thái hiện hành và hành vi khi Auth/Redis gặp lỗi trước triển khai.
  Không hứa thu hồi tức thì chỉ từ JWT hoặc dùng cache để bỏ bảo vệ đã chốt.
- Chưa chọn cách Agent thực hiện công cụ thay mặt khách, chuyển tiếp token hoặc vị trí bộ thực thi.
  Không cấp service token quyền giả danh mọi khách, tự sửa `sub` hoặc bỏ kiểm audience. Quy tắc
  xác nhận của khách và chỉ trình bày vé sau kiểm chứng Core vẫn giữ nguyên.
- Chưa pin Better Auth, adapter/plugin, Expo hoặc thư viện xác thực JWT phía NestJS. Cần kiểm chứng
  tổ hợp phiên bản và reconciliation contracts hiện tại; `AuthSessionDto` hiện có không tự chốt thiết kế mới.
- Portfolio cần chứng minh đăng nhập/xác minh, token sai/hết hạn/sai audience, đăng xuất/khóa tài khoản,
  thu hồi quyền rạp và lỗi dịch vụ xác thực; form hoạt động hoặc ADR được chấp thuận chưa là bằng chứng đó.

### Chi phí

Better Auth upstream dùng giấy phép MIT, không bắt buộc phí license hoặc phí theo người dùng hoạt động
cho bản nguồn mở. Hosting/CPU/RAM, PostgreSQL, email, backup, giám sát và công bảo trì vẫn cần dự toán;
dịch vụ thương mại tùy chọn chưa được chọn. Chưa đủ topology/tải/provider để báo số tiền. Không dùng
chi phí để loại phương án theo [tiêu chí dự án](../../PROJECT-OVERVIEW.md#technology-selection-criteria).

## References

- [Better Auth Expo](https://better-auth.com/docs/integrations/expo).
- [Better Auth Next.js](https://better-auth.com/docs/integrations/next).
- [Drizzle adapter](https://better-auth.com/docs/adapters/drizzle).
- [Session management](https://better-auth.com/docs/concepts/session-management).
- [JWT plugin và JWKS](https://better-auth.com/docs/plugins/jwt).
- [OAuth Provider — phương án chưa chọn](https://better-auth.com/docs/plugins/oauth-provider).
- [Organization — plugin chưa chọn](https://better-auth.com/docs/plugins/organization).
- [Better Auth MIT license](https://github.com/better-auth/better-auth/blob/main/LICENSE.md).
- [RFC 8252 — OAuth cho ứng dụng native](https://www.rfc-editor.org/rfc/rfc8252.html).
- [Nghiên cứu và đánh đổi](../99-notes/authentication-stack-research.md).

Đối chiếu nguồn chính thức ngày 2026-11-16; chưa chạy runtime, đo tài nguyên hoặc kiểm thử tích hợp.
