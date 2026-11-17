# Xác thực tài khoản: Keycloak, Better Auth và Auth0

Tra cứu nguồn chính thức ngày 2026-11-16. Đây là bằng chứng nghiên cứu, không sở hữu quyết định.
Chủ sản phẩm đã chọn **A — Better Auth với form trực tiếp** tại
[ADR-0008](../06-decisions/0008-better-auth-with-direct-login.md); các phương án còn lại giữ để đối chiếu.
Chưa pin phiên bản, cài dependency, cấu hình provider, sửa code hoặc kiểm chứng runtime/hiệu năng.

## Yêu cầu và ranh giới chung

[Mô hình sản phẩm](../03-product/use-cases.md) quy định email/mật khẩu, xác minh email trước giữ ghế/mua vé,
nhân viên được cấp quyền nội bộ; khách có thể tồn tại trước xác minh. Không tự thêm MFA/social login.
Xét Web Next.js 16, Organizer Portal, Mobile định hướng Expo, NestJS Core và Agent service;
Organizer được chọn tiếp là React/Vite/TanStack Router tại
[ADR-0015](../06-decisions/0015-react-vite-and-tanstack-router-for-organizer.md). Tiền không dùng xếp hạng.

Đề xuất chung: dịch vụ định danh sở hữu credential/session; Core sở hữu dữ liệu nghiệp vụ,
phân công rạp, quyền trên từng tài nguyên và trạng thái cấp/thu hồi quyền hiện hành.
Ánh xạ người dùng bằng định danh issuer/subject đã xác minh, không bằng email/header do client tự gửi.
Token có chữ ký hợp lệ chưa chứng minh nhân viên còn quyền tại rạp hoặc khách đã xác minh email hiện tại.
Đây là ranh giới thiết kế đề xuất từ invariants dự án, không phải tích hợp đã triển khai.

## So sánh ba ứng viên

| Phương án | Khả năng có nguồn | Đánh đổi áp dụng cho dự án — nhận định |
|---|---|---|
| **Keycloak tự vận hành** | Nhà cung cấp OIDC độc lập: discovery, JWKS, introspection, logout; console/API quản lý user, password, email và session. [OIDC endpoints](https://www.keycloak.org/securing-apps/oidc-layers), [admin guide](https://www.keycloak.org/docs/latest/server_admin/index.html). | Hợp mục tiêu chứng minh ranh giới identity độc lập và nhiều client. Có sẵn công cụ quản trị; phải vận hành JVM, DB, email, TLS, nâng cấp, key rotation và phục hồi. Không tự đưa quyền theo rạp vào token rồi bỏ kiểm tra Core. |
| **Better Auth tự vận hành TypeScript** | Email/password, verification/reset; tích hợp [Next.js 16](https://better-auth.com/docs/integrations/next), [Expo](https://better-auth.com/docs/integrations/expo), [Drizzle](https://better-auth.com/docs/adapters/drizzle); [Admin plugin](https://better-auth.com/docs/plugins/admin) có tạo/khóa user. | Hợp nếu muốn kiểm soát UX và tích hợp sâu TypeScript/Drizzle. Phải sở hữu dịch vụ auth, schema/migration, giao diện và vận hành; plugin quản lý user không tự ánh xạ actor/quyền rạp. |
| **Auth0 được quản lý** | OIDC/OAuth, [email verification](https://auth0.com/docs/manage-users/user-accounts/verify-emails), [cấp user qua Dashboard/API](https://auth0.com/docs/manage-users/user-accounts/create-users), [Next SDK](https://github.com/auth0/nextjs-auth0) và [Expo SDK](https://auth0.com/docs/quickstart/native/react-native-expo). | Giảm phần tự vận hành hệ thống định danh; vẫn phải thiết kế trust/token, cấp quyền nghiệp vụ, email và ứng phó gián đoạn. Phụ thuộc dịch vụ, quota, plan và API quản trị; cần đường di chuyển user khi đổi provider. |

Không có phép đo của dự án để xếp hạng tốc độ, tải hay độ trễ ba phương án.

## OIDC và tích hợp các kênh

OIDC dùng cho xác thực danh tính; access token dùng cho API. Core/Agent phải kiểm tra token/session
tại ranh giới của mình: chữ ký/issuer/audience/hạn dùng phù hợp; không dùng ID token thay quyền API.
[Nguồn: API token validation](https://auth0.com/docs/secure/tokens/access-tokens/validate-access-tokens).
Agent không được tự nhận vai người dùng hoặc có quyền rộng hơn tác vụ Core cho phép.

Better Auth hỗ trợ đăng nhập qua OAuth provider khác và có **OAuth Provider plugin riêng** để làm
authorization server/OIDC; hai chức năng không đồng nghĩa. Plugin cung cấp code flow/PKCE,
discovery, ID token/UserInfo; cần giao diện login/consent, lưu session và cấu hình resource/audience.
Không mặc định thư viện session/JWT đơn lẻ đã tạo hệ OIDC nhiều client.
[Nguồn: OAuth Provider](https://better-auth.com/docs/plugins/oauth-provider).

Với OIDC, Mobile là public client: dùng authorization code + PKCE và redirect phù hợp,
không chứa client secret. [Expo AuthSession](https://docs.expo.dev/guides/authentication/) hỗ trợ luồng này.
Web/Organizer cần client/session riêng theo mô hình BFF; chính sách SSO/logout giữa kênh chưa chốt.
Auth0 Expo SDK cần development/native build, không chạy bằng Expo Go.
[Nguồn: Auth0 Expo](https://auth0.com/docs/quickstart/native/react-native-expo).
Tài liệu tích hợp không thay kiểm thử đúng Next/Expo/SDK/runtime được pin; chưa chọn thư viện OIDC cho Keycloak.

## Xác minh email và độ mới của quyền

Yêu cầu là chặn **hold/mua**, chưa phải chặn đăng nhập. Better Auth `requireEmailVerification`
chặn email/password sign-in; Keycloak Verify Email required action cũng yêu cầu hoàn tất trước login.
Không bật các lựa chọn này rồi âm thầm đổi hành vi sản phẩm; cần chọn luồng xác minh tương ứng
và để Core thực thi điều kiện nghiệp vụ. Email provider được chọn tiếp là Resend tại
[ADR-0018](../06-decisions/0018-resend-for-transactional-email.md); chính sách gửi lại/lỗi vẫn OPEN-09.
[Nguồn: Better Auth email](https://better-auth.com/docs/authentication/email-password),
[Keycloak required actions](https://www.keycloak.org/docs/latest/server_admin/index.html).

Quyền theo rạp phải xét trạng thái hiện hành tại Core; claim là ảnh chụp lúc cấp token.
Cần chốt độ trễ thu hồi quyền/chặn tài khoản được chấp nhận, cách kiểm tra trực tiếp hay cache,
hạn token và hành vi khi dịch vụ định danh không truy cập được; chưa tự chọn thời lượng.
Kiểm chữ ký JWT cục bộ không tự biết session đã bị thu hồi. Keycloak có introspection;
Better Auth OAuth JWT kiểm cục bộ không tự biết session đã kết thúc; introspection có thể nhận biết
session kết thúc với access token gắn session. Refresh token có `offline_access` có thể còn hiệu lực
sau sign-out đến khi hết hạn/bị thu hồi; cần chính sách logout riêng. Cookie cache cũng có thể giữ
session đã thu hồi đến khi cache hết hạn. Auth0 thu hồi refresh token không buộc mọi API ngừng nhận access JWT ngay.
[Nguồn: Keycloak introspection](https://www.keycloak.org/securing-apps/oidc-layers),
[Better Auth introspection](https://better-auth.com/docs/plugins/oauth-provider/resource-server),
[session caching](https://better-auth.com/docs/concepts/session-management),
[Auth0 revocation](https://auth0.com/docs/secure/tokens/refresh-tokens/revoke-refresh-tokens).

## License và khoản phải dự toán

- Keycloak: [Apache 2.0](https://github.com/keycloak/keycloak/blob/main/LICENSE.txt); phí hạ tầng DB/JVM,
  lưu trữ/backup, email, traffic/giám sát và công vận hành. Bản nguồn mở không có phí license/MAU bắt buộc.
  [Production guide](https://www.keycloak.org/server/configuration-production) yêu cầu DB/TLS và thiết kế cluster phù hợp;
  chưa chọn topology. DB identity có thể dùng PostgreSQL với quyền sở hữu tách Core, chưa duyệt layout cụ thể.
- Better Auth: [MIT](https://github.com/better-auth/better-auth/blob/main/LICENSE.md); bản nguồn mở không bắt buộc phí MAU,
  nhưng compute/DB/email/backup/giám sát và công bảo trì do dự án chịu; dịch vụ thương mại tùy chọn xét riêng.
- Auth0: dịch vụ theo plan/MAU (người dùng hoạt động trong tháng), không phải phí license thư viện SDK.
  [Pricing](https://auth0.com/pricing) tại ngày tra cứu hiển thị B2C Essentials từ **35 USD/tháng cho 500 MAU**;
  quota/tính năng và M2M/add-on tùy plan, email/hạ tầng ứng dụng vẫn cần tính riêng. Đây là mốc tham khảo,
  chưa phải báo giá dự án; thiếu MAU, plan, nhu cầu M2M và cấu hình email để ước tính tổng.

## Kết quả và phạm vi quyết định

Chọn **Better Auth, form trực tiếp + session, hướng JWT/JWKS cho API** theo ADR-0008, phù hợp UI/UX
và tích hợp TypeScript/Drizzle của sản phẩm tự kiểm soát các client. OAuth/SSO không phải điều kiện
để có kiến trúc phân tán tốt. Chưa có phép đo xếp hạng tốc độ hoặc mức an toàn giữa các ứng viên.
Organization/Teams, hợp đồng JWT, cơ chế thu hồi và cách Agent gọi công cụ vẫn giữ phần chưa chốt.

## Bằng chứng chi tiết — phần thiết kế ngoài ADR-0008 vẫn là đề xuất

- **UI/DX:** API/client cho phép tự xây giao diện Ferrari Dark Cinema; thuận với TypeScript/Drizzle. Expo có thể dùng form native gọi email/password và session trực tiếp; OAuth code+PKCE lại chuyển qua trình duyệt hệ thống đến trang login của ta. Không hứa cả form thuần native lẫn luồng OIDC này mà bỏ qua đánh đổi. Keycloak cũng có theme; chưa đo tiết kiệm công/tốc độ. [Better Auth usage](https://better-auth.com/docs/basic-usage), [Expo integration](https://better-auth.com/docs/integrations/expo), [browser OAuth](https://docs.expo.dev/guides/authentication/), [Keycloak themes](https://www.keycloak.org/docs/latest/server_admin/index.html).
- **RAM:** chưa có căn cứ nói bỏ Keycloak tiết kiệm cố định 1 GB. Container Keycloak đặt heap theo phần trăm memory limit; heap khác tổng RAM. Better Auth vẫn tiêu thụ tài nguyên ứng dụng/DB; chỉ phép đo cùng tải/cấu hình mới xác định chênh lệch. [Keycloak container memory](https://www.keycloak.org/server/containers).
- **Organization/Teams:** plugin có membership, invitation, nhiều role, permission tùy chỉnh và team trong organization; mặc định mọi user có thể tạo organization nếu chưa hạn chế. Đây là primitive, không tự mô hình hóa một chuỗi/nhiều rạp. Khách không mặc nhiên phải là member từng rạp; một rạp bằng organization hay team vẫn chưa chốt. `activeOrganizationId` là ngữ cảnh phiên, không đủ chứng minh quyền. [Organization](https://better-auth.com/docs/plugins/organization).
- **Ranh giới nghiệp vụ:** nếu dùng plugin, cần chốt chủ sở hữu membership/phân công và đồng bộ với Core, tránh hai nguồn quyền cạnh tranh. Plugin role `owner/admin/member` không tự tương ứng quản lý rạp/soát vé/quầy bắp nước. Core vẫn kiểm user–hành động–rạp/tài nguyên và thu hồi hiện hành; không thêm khách vào nhóm vận hành để tiện dùng plugin. Đây là đề xuất mô hình dự án, chưa duyệt plugin/schema.
- **Session khác OAuth:** JWT plugin phát JWT/JWKS cho dịch vụ ngoài và không thay session. Nó không tự cấp code flow, PKCE hay quản lý resource như OAuth Provider. Khi ghép Provider, tài liệu yêu cầu tắt `/token` và header `set-auth-jwt` để tránh phát session JWT cùng khóa với access token. [JWT plugin](https://better-auth.com/docs/plugins/jwt).
- **Core/Agent:** nếu chọn OAuth, khai báo resource/audience theo API, giữ giới hạn resource theo client; public/native client dùng PKCE, không có secret. API kiểm chữ ký, issuer, audience, hạn, scope và loại token; docs Provider dùng `typ=at+jwt`, `azp` để loại session JWT. Không chuyển token chỉ dành cho Agent sang Core rồi bỏ kiểm audience. [Provider](https://better-auth.com/docs/plugins/oauth-provider), [resource restriction](https://better-auth.com/docs/plugins/oauth-provider/tokens), [API validation](https://better-auth.com/docs/plugins/oauth-provider/resource-server).
- **Máy với máy khác thay mặt khách:** Provider có `client_credentials` với scope được cho phép; token máy không tự mang quyền đặt vé của khách. RFC 8693 token exchange chưa có sẵn; có thể thêm extension grant. Một hướng cần thảo luận là BFF/bộ thực thi công cụ tin cậy giữ token Core của user, gắn phiên/xác nhận thật và gọi Core khi Agent đề xuất. Đây chưa là kiến trúc duyệt; không giả danh bằng service token + header userId hoặc tự đổi `sub`. [Client credentials](https://better-auth.com/docs/plugins/oauth-provider/clients), [unsupported grants](https://better-auth.com/docs/plugins/oauth-provider).
- **Thu hồi:** JWT kiểm cục bộ tiếp tục hợp lệ đến hạn. Với phương án OAuth đã so sánh, introspection có thể nhận biết session kết thúc; JWT `client_credentials` không có session, refresh rotation/revocation không xóa JWT đã phát. A đã chọn session và hướng JWT/JWKS, nhưng hợp đồng token, TTL, kiểm tra phiên hiện hành, cửa sổ thu hồi và topology vẫn cần thiết kế. Không mặc định dùng endpoint OAuth của phương án chưa chọn. [JWT plugin](https://better-auth.com/docs/plugins/jwt), [OAuth API verification](https://better-auth.com/docs/plugins/oauth-provider/resource-server).
