# Client SSE chung cho Web và Expo

Tra cứu ngày 2026-11-17 bằng nguồn chính thức và Context7 (`/websites/expo_dev`).
**Lựa chọn A đã được chấp thuận tại [ADR-0024](../06-decisions/0024-fetch-and-eventsource-parser-for-sse-clients.md); chưa triển khai streaming.**
Các so sánh/đề xuất dưới đây giữ bối cảnh nghiên cứu trước quyết định; ADR sở hữu lựa chọn hiện hành.
Đích: worktree `docs-tech-stack-decisions/movie-booking-agent`, detached HEAD `8fbada70fbde3fb9d049babc716a1af4b2de1d2a`.
Chỉ ghi tài liệu; chưa cài thư viện, sửa code/config, build hoặc gọi runtime/provider.

## Ranh giới đã được chấp thuận

[ADR-0011](../06-decisions/0011-sse-starlette-for-agent-streaming.md) chọn SSE/sse-starlette phía Agent,
HTTP riêng cho tin nhắn/thao tác/xác nhận; client đã chọn tiếp tại ADR-0024, cách phục hồi còn cần đặc tả.
Không gửi lệnh mới qua một POST stream rồi tự lặp lại POST khi nối lại.
Client phải kiểm quyền thread/run; reconnect không reset hold TTL, phát lại payment hoặc tự xác nhận vé.
Payload theo `packages/contracts`/Zod/Pydantic đã chọn; text model không thay bằng chứng xác minh từ Core.
Không tự nhập wire protocol AI SDK hoặc LangGraph SDK yêu cầu một kiểu hosting khác.

## Ba phương án

| Hướng | Thành phần | Lợi ích / đánh đổi |
|---|---|---|
| **A. Fetch streaming + parser chung** | Web dùng browser `fetch`; Mobile dùng `expo/fetch`; `eventsource-parser` chung xử lý văn bản SSE. | Cùng cách kiểm HTTP status/header, auth và parser; kiểm soát abort/retry. Phải viết adapter lifecycle/reconnect có giới hạn, không được coi parser là client hoàn chỉnh. |
| **B. EventSource riêng theo nền tảng** | Web dùng native `EventSource`; Mobile dùng `react-native-sse` dựa XHR. | Browser tự parse/reconnect theo chuẩn; Mobile có API events/headers/reconnect. Hai implementation có semantics auth, status, retry và background khác nhau, vẫn cần adapter/kiểm thử riêng. |
| **C. `eventsource-client` + fetch theo nền tảng** | Client cùng tác giả parser, nhận browser fetch hoặc `expo/fetch`, headers, initial Last-Event-ID và `.close()`. | Tái sử dụng reconnect/đọc stream; vẫn cần guard app. Mã nguồn hiện chưa có đầy đủ policy status/buffer/backoff để thay mọi trách nhiệm của A. |

## Bằng chứng cho A và giới hạn

Expo hiện có `expo/fetch` với response body đọc qua `getReader()` trên native; có TextDecoder/stream encoding APIs.
Tài liệu SDK 58 ghi TextDecoder do Hermes cung cấp từ SDK 58/RN 0.88; **đây chưa phải tổ hợp dự án đã pin**.
Ưu tiên import tường minh `expo/fetch` trên native; không suy RN built-in fetch cũ có streaming tương đương.
[Expo fetch/encoding](https://docs.expo.dev/versions/latest/sdk/expo/).
Decode UTF-8 tăng dần trước khi feed parser; không coi mỗi network chunk là một event hoặc một JSON hoàn chỉnh.
`eventsource-parser` nhận text chunks, hỗ trợ event/data/id, callback retry/comment và reset; không mở HTTP,
refresh token, sleep/backoff, abort hoặc reconnect thay app. [Parser README](https://github.com/rexxars/eventsource-parser).
Nguồn parser xử lý CR/LF/CRLF, multi-line data và dữ liệu cắt qua chunks; hiện có `maxBufferSize` nhưng mặc định
có thể buffer không giới hạn. Khi pin phải kiểm API của **version phát hành**, không suy mọi bản có API của nhánh main.
[Parser implementation](https://raw.githubusercontent.com/rexxars/eventsource-parser/main/src/parse.ts).
Adapter cần giới hạn cả partial event, payload đã parse và hàng đợi UI; không chỉ giới hạn số events.

## C — client có sẵn, cần kiểm những gì còn thiếu

[README client](https://github.com/rexxars/eventsource-client) nhận fetch tùy chỉnh và yêu cầu Web Streams/async iterator; không tuyên bố đã kiểm Expo native. Iterator kết thúc không tự đóng connection.
Nguồn main hiện dùng delay cố định rồi cập nhật từ `retry`; types không có policy backoff tổng quát dù README nêu feature đó và còn TODO. Response chỉ xử lý riêng 204, chưa kiểm non-200/MIME; parser không truyền giới hạn buffer, iterator queue chưa thấy cap. [Client](https://raw.githubusercontent.com/rexxars/eventsource-client/main/src/client.ts), [types](https://raw.githubusercontent.com/rexxars/eventsource-client/main/src/types.ts).
C hợp lệ nếu wrapper bù các điều kiện này và đối chiếu version phát hành; không chọn chỉ vì tên là client hoàn chỉnh. A tránh phải can thiệp lifecycle ngầm của thư viện; đây là lý do cụ thể để sở hữu adapter, không tự viết lại parser.

## B vẫn hợp lệ khi phù hợp auth và lifecycle

Browser EventSource chuẩn dùng GET; constructor chỉ có URL/`withCredentials`, không cho Authorization tùy ý.
Nếu dùng Web phải phù hợp cookie/same-origin hoặc BFF đã thiết kế, không đưa bearer token lên URL.
Browser quản lý UTF-8/event fields/reconnect/Last-Event-ID; các điều này không tạo kho replay phía server.
[WHATWG SSE](https://html.spec.whatwg.org/multipage/server-sent-events.html).
`react-native-sse` dùng XMLHttpRequest, có custom headers và reconnect; `pollingInterval: 0` tắt reconnect.
Thư viện không tự quản lý đóng/nối lại đúng khi app sleep; README yêu cầu chủ động phối hợp AppState.
[React Native SSE](https://github.com/binaryminds/react-native-sse).
Không mặc định cookie jar, status/error reporting hoặc lastEventId của native giống browser; kiểm trước chọn phiên bản.

## Thiết kế feature còn cần làm, không tự chốt trong nghiên cứu

- **Auth:** Web cookie/credentials/CORS và Mobile auth header phải khớp Better Auth/Agent contract;
  fetch cho phép headers nhưng không tự quyết định thay cơ chế auth. Không log token hoặc đặt token trong query.
- **HTTP/error:** kiểm status, `Content-Type: text/event-stream` và body trước parse; không đọc HTML/JSON lỗi như SSE.
  Cần nhánh rõ cho 401/refresh, 403/từ chối quyền, 429/Retry-After, lỗi tạm và stream đã kết thúc;
  dừng hoặc backoff có giới hạn theo loại lỗi, không retry vô hạn. Giá trị và số lần chưa chọn.
- **Cancel:** AbortController/reader cleanup hoặc `.close()` ngắt phía client; không chứng minh run/graph đã dừng,
  Core chưa commit hoặc đơn đã hủy. Hủy run là HTTP command có xác thực riêng theo hợp đồng sẽ thiết kế.
- **Reconnect:** event/run ID, thứ tự, validation và dedup cần hợp đồng; chỉ gửi cursor sau kiểm owner.
  Nếu thiếu/gap event thì đồng bộ trạng thái phù hợp, không tự thực hiện lại tool command. Chưa chọn replay store,
  retention hoặc bảo đảm delivery. Parse được `retry`/`id` không tự bảo đảm không mất/trùng.
- **Mobile:** AppState, background/resume, đổi mạng, logout/account switch và token refresh phải phối hợp;
  không hứa kết nối chạy liên tục khi OS treo app. Thời điểm đóng/mở và tiếp tục run còn phải chốt.
- **Proxy:** kiểm flushing/buffering, heartbeat, idle/send timeout, disconnect và shutdown trên hosting thực sau này;
  header chống buffering không chứng minh mọi tầng trung gian đã truyền từng phần.

Kiểm trước completion: tiếng Việt/emoji bị cắt giữa bytes; CRLF bị cắt; nhiều `data:`; id/retry/comment;
event lỗi/quá lớn; 401/403/429; abort giữa stream; terminal event; reconnect trùng/gap; owner sai;
Android/iOS background/resume và Web qua proxy thực. Unit parser không thay native/network runtime evidence.

## Chi phí và đề xuất

`eventsource-parser`, `eventsource-client` và `react-native-sse` dùng MIT theo README; API Web không yêu cầu SaaS riêng.
Expo đã là nền tảng chọn trước; dùng API không tự mua EAS. Kết nối server, mạng, buffer, proxy và replay nếu chọn
vẫn tốn tài nguyên; chưa có host/tải/thời lượng để báo tổng tiền hoặc hứa miễn phí vận hành.
**Ưu tiên A** vì có bằng chứng Expo hỗ trợ body streaming và có thể chung parser/hợp đồng với Web,
chủ động xử lý auth/error/lifecycle. Không khẳng định nhanh hơn hoặc tốn pin ít hơn B khi chưa đo.
Chấp thuận A chỉ chọn fetch transports + parser; không chốt auth delivery, version, replay/retention hoặc hosting.
Pin Expo/RN/parser và kiểm TextDecoder, ReadableStream, abort trên development/release builds trước implementation acceptance.
