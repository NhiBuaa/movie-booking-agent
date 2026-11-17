# ADR-0024 — Fetch và eventsource-parser cho SSE trên Web/Mobile

## Status

Accepted — ngày 2026-11-17, chủ sản phẩm xác nhận “tôi đồng ý” sau đề xuất A:
browser `fetch` trên Web, `expo/fetch` trên Mobile và `eventsource-parser` dùng chung,
trong hội thoại Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`).
Chỉ chọn công nghệ; chưa cài dependency, viết adapter, build hoặc kiểm chứng streaming runtime.

## Context

[ADR-0011](0011-sse-starlette-for-agent-streaming.md) chọn SSE/sse-starlette phía Agent và HTTP
riêng cho lệnh/xác nhận. Web và Expo cần đọc text/sự kiện UI theo hợp đồng chung, xử lý lỗi HTTP,
xác thực và mạng gián đoạn. Native EventSource không là API mặc định tương đương trên mọi nền tảng.
Cần kiểm soát vòng đời kết nối mà không viết lại bộ phân tích cú pháp SSE.

## Decision

- Web dùng **browser `fetch`**; Mobile import tường minh **`expo/fetch`** để đọc response body streaming.
  Dùng **`eventsource-parser`** chung cho văn bản SSE sau khi giải mã UTF-8 tăng dần.
  Không coi network chunk là event/JSON hoàn chỉnh hoặc giả định built-in fetch của RN cũ tương đương.
- Ứng dụng sở hữu vòng đời kết nối có giới hạn: kiểm HTTP status, MIME `text/event-stream`, body,
  payload schema và quyền thread/run; quản lý abort/cleanup, refresh, lỗi và reconnect.
  Parser chỉ phân tích SSE, không tự mở HTTP, xác thực, backoff hoặc nối lại.
- Giữ server sse-starlette và HTTP riêng cho command. Reconnect chỉ gắn lại/tiếp tục đọc run theo
  hợp đồng được thiết kế; không phát lại hold/payment, tạo lệnh mới hoặc reset TTL 300 giây.
- Đây không phải quyết định cookie/BFF/CORS hay bearer delivery cho từng nền tảng. Giữ hướng
  Better Auth tại [ADR-0008](0008-better-auth-with-direct-login.md); không đưa bearer token vào URL.
- Chưa chọn phiên bản, replay store/retention, bảo đảm delivery hoặc hosting. ID/retry của SSE
  không tự tạo lưu bền, loại trùng hoặc bảo đảm không mất sự kiện.

## Alternatives Considered

| Phương án | Lý do và đánh đổi |
|---|---|
| **Fetch theo nền tảng + eventsource-parser chung** | Được chọn: cùng cách parse và kiểm phản hồi, chủ động auth/error/lifecycle. Phải xây và kiểm adapter kết nối có giới hạn; chưa có phép đo chứng minh nhanh hơn hoặc ít tốn pin hơn. |
| Browser EventSource + react-native-sse | Hợp lệ, có xử lý kết nối sẵn; khác biệt browser/native về headers, lỗi, retry và background vẫn cần quản lý. EventSource browser không cho Authorization header tùy ý. |
| eventsource-client với fetch được truyền vào | Tái sử dụng đọc/reconnect; vẫn cần guard status, buffer, hàng đợi và lifecycle. Quan sát mã nguồn trong nghiên cứu phụ thuộc phiên bản, không là kết luận mọi bản đều thiếu các guard này. |

## Consequences

- Pin và kiểm tổ hợp Expo/RN/parser trước tích hợp; kiểm TextDecoder, Web Streams và abort trên
  Android/iOS development/release builds. Phiên bản trong tài liệu Expo không tự thành version dự án.
- Giới hạn partial event, payload và hàng đợi UI; kiểm API giới hạn buffer của bản parser phát hành.
  Phân biệt 401/refresh, 403, 429/Retry-After, lỗi tạm và kết thúc run; số lần/delay còn cần đặc tả.
- Phải thiết kế thứ tự, dedup, cursor và cách đồng bộ khi gap; kiểm owner cả khi reconnect.
  Text của model/snapshot client không thay bằng chứng xác minh từ Cinema Core.
- Abort transport không chứng minh graph dừng, Core chưa commit hoặc đơn đã hủy. Hủy run là
  hành vi riêng cần hợp đồng có xác thực; không suy ngắt stream thành hủy giao dịch.
- Mobile cần AppState/background/resume, đổi mạng, token refresh và logout/account switch;
  không hứa giữ kết nối liên tục khi OS treo app. Proxy flushing/heartbeat/timeouts cần kiểm sau chọn host.
- Kiểm tiếng Việt/emoji bị cắt giữa bytes, CRLF/chunk, multiline data, id/retry/comment, payload
  hỏng/quá lớn, lỗi HTTP, abort, terminal event, reconnect trùng/gap, sai owner và native lifecycle.
  Unit parser không thay bằng chứng mạng/proxy/native thực tế.

### Chi phí

`eventsource-parser` dùng MIT; browser fetch và API Expo không yêu cầu mua SaaS riêng hoặc gói EAS.
Kết nối server, lưu lượng, proxy, buffer và replay nếu chọn vẫn tiêu thụ tài nguyên. Chưa có host/tải/
thời lượng để báo tổng phí vận hành; không suy miễn phí thư viện thành miễn phí hosting.

## References

- [Nghiên cứu ba phương án và phần thiết kế còn mở](../99-notes/sse-client-research.md).
- [Expo fetch/encoding](https://docs.expo.dev/versions/latest/sdk/expo/).
- [eventsource-parser](https://github.com/rexxars/eventsource-parser).
- [Chuẩn SSE/EventSource](https://html.spec.whatwg.org/multipage/server-sent-events.html).
- [react-native-sse](https://github.com/binaryminds/react-native-sse).
- [eventsource-client](https://github.com/rexxars/eventsource-client).

Nguồn và Context7 đối chiếu ngày 2026-11-17 trong nghiên cứu liên kết; chưa cài/build hoặc chạy runtime.
