# Frontend data/UI state: TanStack Query + Zustand hay Redux Toolkit + RTK Query?

Tra cứu 2026-11-17. **Ghi chú nghiên cứu, không phải nguồn quyết định.**
Chủ sản phẩm đã chọn A tại [ADR-0017](../06-decisions/0017-tanstack-query-and-zustand-for-frontend-state.md).
Các đề xuất bên dưới giữ bối cảnh lúc nghiên cứu; ADR sở hữu lựa chọn hiện hành. Chưa cài đặt/triển khai.
Đích: worktree `docs-tech-stack-decisions`, detached HEAD `8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.
Phạm vi: client interactions của Web Next.js 16, Organizer React/Vite/TanStack Router và Mobile Expo Router.
Chỉ đọc nguồn chính thức/code; không sửa source/ADR, cài dependency, chạy runtime hoặc benchmark.

## Hai hướng có thể đáp ứng

| Tiêu chí | A. TanStack Query + Zustand | B. Redux Toolkit + RTK Query |
|---|---|---|
| Dữ liệu từ API | Query quản lý fetch, cache, invalidation và trạng thái request. | RTK Query quản lý fetch/cache/invalidation, tích hợp Redux Toolkit store. |
| Trạng thái UI chia sẻ | Zustand cho draft/selection/overlay thực sự cần qua nhiều nhánh component; không chép API cache sang store. | Slices/actions cho UI cùng cơ chế Redux; RTK Query giữ cache theo endpoint/args, không chép sang slice nghiệp vụ thứ hai. |
| Quy ước phối hợp | Tách rõ cache server và client UI; dự án phải quy định keys, reset, lifecycle và owner của từng state. | Chuẩn hóa event/reducer/middleware và công cụ theo dõi tập trung; mạnh khi có nhiều luồng UI phối hợp theo events. |
| Đánh đổi | Hai thành phần với mục đích riêng; vẫn cần kỷ luật tránh hai nguồn trạng thái và có công cụ debug phù hợp. | UI và cache gắn hệ sinh thái Redux; phải thiết kế phạm vi store, selectors, lifecycle/API slices thay vì mặc định đưa mọi state vào đó. |

Nguồn: [Query overview](https://tanstack.com/query/latest/docs/framework/react/overview), [Zustand](https://github.com/pmndrs/zustand#readme),
[RTK Query overview](https://redux.js.org/toolkit/rtk-query/overview), [Redux Toolkit hiện đại](https://redux.js.org/introduction/why-rtk-is-redux-today).
Redux Toolkit là hướng Redux được tác giả khuyến nghị hiện hành; không kết luận B chậm, lỗi thời hoặc kém phù hợp chỉ vì là Redux.
Chưa có phép đo bundle, memory, render hoặc network của A/B trên dự án.

## State đặt ở đâu — đề xuất áp dụng cho cả hai hướng

- **React local state mặc định** cho form/interaction gần component; nâng lên common parent/context khi đủ dùng.
  Chỉ thêm shared store khi có nhu cầu chia qua nhiều nhánh/lifetime rõ. [React state sharing](https://react.dev/learn/sharing-state-between-components).
- **URL/router** giữ filter, ngày/rạp, page/sort cần bookmark/back/forward. Không nhân cùng filter vào store rồi tự sync hai chiều.
  URL params vẫn phải validate, Core kiểm quyền rạp; URL hợp lệ không cấp quyền. [Router search params](https://tanstack.com/router/latest/docs/guide/search-params).
- **Query cache** giữ snapshot trả từ API; **Zustand/Redux UI state** giữ ý định/bản nháp, không giữ quyền sở hữu ghế hoặc quyết định đã thanh toán.
  Không persist session/JWT/secrets hay hàng đợi transaction vào store/Query persistence. Auth theo [ADR-0008](../06-decisions/0008-better-auth-with-direct-login.md).
- Cache keys bao gồm định danh truy vấn và phạm vi người dùng/rạp phù hợp, không chứa secrets; reset/clear dữ liệu nhạy cảm khi logout,
  đổi tài khoản/quyền. Không coi cache phía browser hoặc bộ nhớ server chia sẻ là ranh giới phân quyền.

## Core là nguồn quyết định — không đổi bởi thư viện cache

Theo [Constitution](../../.specify/memory/constitution.md), Core sở hữu seat/price/hold TTL/payment/ticket.
`staleTime`, cache retention hay countdown trong UI không gia hạn hold; app resume/reconnect phải hỏi Core và xử lý hold hết hạn/giá thay đổi.
Có thể phản hồi ngay lựa chọn **dự kiến** của khách; không optimistic-confirm ghế/thanh toán/vé rồi coi đó là kết quả Core.
Invalidation/refetch giúp đồng bộ snapshot, không thay transaction hoặc bảo đảm realtime/exactly-once.

Phải phân loại read retry với mutation retry. Timeout khi giữ ghế/thanh toán có thể là **kết quả chưa rõ**, không phải chắc chắn thất bại.
Không tự replay thao tác đó: giữ operation/idempotency key ổn định và hỏi Core trạng thái trước khi quyết định retry.
TanStack mutation mặc định không retry lỗi; cấu hình retry, paused mutations khi offline/resume hoặc persistence vẫn phải được kiểm riêng,
không bật cơ chế replay transaction qua reconnect chỉ vì thư viện hỗ trợ. [Query mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations),
[cache defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults). Các giới hạn nghiệp vụ này cũng áp dụng RTK Query.

## Tích hợp từng kênh

- **Next.js:** giữ server fetch trong RSC cho dữ liệu phía server; Query dùng cho client cache/interactions khi cần, không ép mọi fetch qua Query.
  Nếu prefetch/hydrate: QueryClient phía server theo request; không module-global cache giữa người dùng. Phải chọn owner revalidation RSC/client.
  Zustand không để RSC đọc/ghi mutable store dùng chung; B cũng cần Redux store theo request, không global server store.
  [Query SSR](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr), [Zustand Next.js](https://zustand.docs.pmnd.rs/learn/guides/nextjs), [Redux Next.js](https://redux.js.org/usage/nextjs).
- **Organizer:** route loaders phối hợp cùng QueryClient/query options mà component sử dụng, tránh thêm cache API độc lập trong router/store.
  Router quản lý điều hướng/loading coordination; Query quản lý snapshot cache nếu chọn A. [External data loading](https://tanstack.com/router/latest/docs/guide/external-data-loading).
- **Mobile:** phải nối AppState active/background với focus manager và network events với online manager; không tự có hành vi `window` như browser.
  Tách app focus và screen focus, kiểm cancellation/reconnect/hold reconciliation trên thiết bị. Bridge/network dependency cụ thể chưa chọn.
  [Query React Native](https://tanstack.com/query/latest/docs/framework/react/react-native).
  Kho vé MMKV/SecureStore được chọn tiếp tại [ADR-0023](../06-decisions/0023-encrypted-mmkv-for-offline-mobile-tickets.md),
  SSE client fetch/parser tại [ADR-0024](../06-decisions/0024-fetch-and-eventsource-parser-for-sse-clients.md);
  Query không thay trách nhiệm của hai phần đó hoặc chứng minh chúng đã tích hợp.

## License, chi phí và nhận định

[Query](https://github.com/TanStack/query/blob/main/LICENSE), [Zustand](https://github.com/pmndrs/zustand/blob/main/LICENSE) và
[Redux Toolkit/RTK Query](https://github.com/reduxjs/redux-toolkit/blob/master/LICENSE) là MIT; không bắt mua SaaS hoặc trả phí API của thư viện.
Vẫn có chi phí tích hợp, memory/cache, request/refetch và vận hành backend; chưa đo nên không tuyên bố A/B rẻ hoặc nhanh hơn.
**Nghiêng A**: tách cache API khỏi UI draft phù hợp các kênh React hiện có và ranh giới Core; dùng Zustand có chọn lọc, React local state vẫn mặc định.
B là đối chiếu đáng cân nhắc khi cần chuẩn hóa nhiều event/middleware UI tập trung; không có yêu cầu đó đã xác nhận đủ để ưu tiên hơn A.
Chưa chọn phiên bản, persistence, chính sách refetch cụ thể hoặc triển khai; cần đặc tả/kiểm chứng các tình huống nêu trên trước nghiệm thu.
