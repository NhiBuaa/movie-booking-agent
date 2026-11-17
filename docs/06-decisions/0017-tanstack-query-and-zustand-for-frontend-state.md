# ADR-0017 — TanStack Query và Zustand cho trạng thái frontend

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý với phương án đề xuất của bạn”
sau đề xuất A: TanStack Query + Zustand trong hội thoại Tech Stack
(`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`). Chỉ chọn công nghệ/phân chia trách nhiệm;
chưa cài dependency, thay API client/store, sửa UI hoặc chạy runtime/benchmark.

## Context

Web dùng Next.js, [Organizer](0015-react-vite-and-tanstack-router-for-organizer.md) dùng React/Vite/Router,
[Mobile](0016-expo-router-and-mobile-native-foundation.md) dùng Expo Router.
Các kênh cần quản lý dữ liệu API và trạng thái tương tác mà không biến client thành nguồn quyết định
ghế/giá/hold/thanh toán/vé. [Kiến trúc frontend](../02-architecture/frontend-architecture.md) đã yêu cầu
tách UI state và server/transaction state; bộ thư viện mục tiêu chưa được triển khai.

## Decision

- Chọn **TanStack Query** cho dữ liệu API phía client: fetching, snapshot cache, trạng thái request,
  invalidation/refetch và mutations theo hợp đồng. Không bắt mọi server fetch trong RSC đi qua Query.
- Chọn **Zustand có phạm vi** cho UI draft/state thực sự chia sẻ qua nhiều nhánh component.
  **React local state là mặc định** cho interaction gần component; **router/URL** giữ bộ lọc,
  ngày/rạp, page/sort cần bookmark/back/forward. Tránh lưu trùng cùng dữ liệu vào nhiều store.
- Query cache lưu bản chụp dữ liệu API, Zustand lưu ý định/bản nháp UI. Core tiếp tục quyết định
  giữ ghế, TTL, giá, thanh toán và vé; state client không cấp quyền hoặc xác nhận giao dịch.
- Kho snapshot vé offline được chọn tiếp tại [ADR-0023](0023-encrypted-mmkv-for-offline-mobile-tickets.md),
  SSE client tại [ADR-0024](0024-fetch-and-eventsource-parser-for-sse-clients.md); không tự persist toàn bộ Query/Zustand state.
- Chưa chọn cache persistence tổng quát, offline mutation queue, bridge network native,
  phiên bản hoặc giá trị stale/refetch cụ thể. Không thêm Redux/RTK Query cùng quản lý cùng dữ liệu.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| **TanStack Query + Zustand** | Được chọn: tách trách nhiệm snapshot API và UI draft, phù hợp ba kênh React hiện có. Hai công cụ vẫn cần quy định keys, lifecycle/reset và owner của từng state. |
| Redux Toolkit + RTK Query | Hướng hiện đại, mạnh về actions/reducers/middleware và công cụ theo dõi tập trung; UI/cache gắn hệ sinh thái Redux. Chưa có yêu cầu phối hợp UI theo events đủ để ưu tiên hơn A; không kết luận chậm hoặc lỗi thời. |

## Consequences

- Web giữ RSC server fetch; khi prefetch/hydrate Query, QueryClient phía server phải được cô lập
  theo request. Không dùng module-global cache/store chứa dữ liệu người dùng hoặc để RSC đọc/ghi
  mutable Zustand store dùng chung. Chốt owner revalidation giữa RSC và client để tránh dữ liệu lệch.
- Organizer route loaders phối hợp cùng QueryClient/query options mà component dùng, thay vì tạo
  thêm API cache độc lập. Native cần nối app focus/network events với managers phù hợp; không giả định
  Mobile tự có hành vi focus/reconnect như browser. Kiểm cả app focus và screen focus.
- Cache keys phải chứa phạm vi truy vấn/người dùng/rạp phù hợp, không chứa secret. Reset dữ liệu nhạy cảm
  khi logout, đổi tài khoản/quyền; cache không là ranh giới phân quyền. Không persist credential/JWT
  hoặc hàng đợi transaction vào UI store/Query persistence; Auth giữ quyết định riêng.
- Có thể phản hồi ngay lựa chọn dự kiến; không optimistic-confirm giữ ghế/thanh toán/phát vé.
  Cache freshness/countdown không gia hạn hold 300 giây. Resume/reconnect phải đối chiếu trạng thái Core.
- Phân loại read retry và mutation retry. Mất phản hồi có thể xảy ra sau khi Core commit; giữ operation ID/
  idempotency key và tra Core trước thử lại. Không tự replay lệnh giao dịch qua offline resume/persistence.
- Invalidation/refetch không bảo đảm realtime hoặc tác dụng phụ đúng một lần. Kiểm dữ liệu cũ, quyền bị
  thu hồi, chuyển tài khoản, hold hết hạn và kết quả chưa rõ trước nghiệm thu. Chưa đo bundle/render/network.

### Chi phí

TanStack Query, Zustand và phương án Redux Toolkit/RTK Query công bố MIT; không bắt mua SaaS hoặc
trả phí API thư viện. Tích hợp, memory/cache, refetch và vận hành backend vẫn có chi phí; chưa có tải
hoặc benchmark để quy tiền hay kết luận A rẻ/nhanh hơn B. ADR không cấp quyền cài đặt/mua dịch vụ.

## References

- [Nghiên cứu trạng thái frontend](../99-notes/frontend-state-research.md).
- [Query server/client state](https://tanstack.com/query/latest/docs/framework/react/guides/does-this-replace-client-state).
- [Query SSR](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr).
- [Zustand Next.js](https://zustand.docs.pmnd.rs/learn/guides/nextjs).
- [Router external data loading](https://tanstack.com/router/latest/docs/guide/external-data-loading).
- [Query React Native](https://tanstack.com/query/latest/docs/framework/react/react-native).
- [Query mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations).
- [RTK Query overview](https://redux.js.org/toolkit/rtk-query/overview).

Nguồn/Context7 đối chiếu ngày 2026-11-17; chưa cài đặt, kiểm thử cache/SSR/native hoặc đo hiệu năng.
