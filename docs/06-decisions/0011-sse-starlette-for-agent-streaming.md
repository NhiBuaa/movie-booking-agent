# ADR-0011 — SSE và sse-starlette cho streaming Agent

## Status

Accepted — ngày 2026-11-16, chủ sản phẩm xác nhận “tôi đồng ý chọn B — SSE + sse-starlette”
trong hội thoại Tech Stack (`01a1e2f4-4de8-75d2-a43e-efd7365dbd58`).
Chỉ chọn giao thức và thư viện phía Agent; chưa cài dependency, sửa code hoặc cấu hình triển khai.

## Context

[Agent Python/FastAPI/LangGraph](0009-python-fastapi-langgraph-and-uv-for-agent-service.md) cần gửi
từng phần câu trả lời và sự kiện UI có cấu trúc về Web/Mobile theo
[đặc tả conversational booking](../05-specs/conversational-booking.md).
Khách gửi tin nhắn, chọn ghế và xác nhận bằng request HTTP; chưa có yêu cầu bắt buộc trao đổi
hai chiều liên tục trên cùng kết nối.

Kết nối Mobile có thể chậm hoặc gián đoạn; dịch vụ cần giới hạn thời gian gửi và giải phóng tài nguyên
đúng lúc ngắt kết nối hoặc shutdown. FastAPI SSE tích hợp cũng là phương án hợp lệ, có ping,
serialization và quản lý vòng đời luồng; không coi nó là stream thô thiếu xử lý kết nối.

## Decision

- Dùng **SSE** (`text/event-stream`) và **sse-starlette** phía Agent Service để truyền token/text
  cùng sự kiện UI có cấu trúc. Dùng HTTP request riêng có xác thực cho tin nhắn, thao tác và xác nhận.
  Không chọn WebSocket cho luồng chat này.
- Dùng khả năng cấu hình timeout gửi, ping, ngắt kết nối và shutdown của thư viện để kiểm soát
  kết nối lâu. Giá trị timeout, giới hạn kết nối/buffer và cách gắn lifecycle còn cần thiết kế;
  không mặc định thư viện đã cấu hình đủ cho mọi client chậm.
- `packages/contracts` tiếp tục sở hữu hợp đồng event/payload. Phân biệt nội dung model đang sinh
  với dữ liệu có thẩm quyền từ Core; kiểm tra payload trước gửi và không diễn giải text của model
  như bằng chứng đã thanh toán/phát hành vé.
- SSE chỉ là đường truyền. Không suy event ID hoặc tự reconnect thành cơ chế lưu bền/phát lại,
  bảo đảm không mất/trùng event hay không lặp thao tác Core. Những phần đó phải thiết kế riêng.

## Alternatives Considered

| Phương án | Lợi ích | Đánh đổi / kết quả |
|---|---|---|
| SSE tích hợp FastAPI | Serialization theo kiểu/Pydantic, event/id/retry, GET/POST, ping và header chống cache/buffering. | Hợp lệ, không chọn ở vòng này. Nguồn đã đọc chưa có public send_timeout riêng; cần kiểm chứng giới hạn của ASGI stack nếu dùng. |
| **SSE + sse-starlette** | Cấu hình timeout từng lần gửi, disconnect và shutdown phù hợp kiểm soát kết nối lâu. | Được chọn. Thêm dependency và vẫn cần hợp đồng/validation, quyền, phục hồi và kiểm thử tải. Chưa chứng minh nhanh hơn phương án khác. |
| WebSocket | Trao đổi hai chiều liên tục cùng kết nối. | Chưa có nhu cầu chứng minh lợi ích cho luồng hiện tại; vẫn phải thiết kế xác thực, phục hồi và quản lý kết nối. Không chọn. |

## Consequences

- Phải kiểm quyền sở hữu thread/run khi mở và nối lại stream; event ID không thay xác thực.
  Không đặt bearer token vào URL. Browser EventSource chuẩn không nhận tùy ý Authorization header;
  client browser fetch và expo/fetch + eventsource-parser được chọn tiếp tại
  [ADR-0024](0024-fetch-and-eventsource-parser-for-sse-clients.md). Cookie/BFF/CORS và auth delivery vẫn cần thiết kế.
- Thiết kế run/event ID, thứ tự, lưu/phát lại nếu cần, loại trùng và đồng bộ trạng thái sau reconnect.
  Không tự tạo lại lệnh hold/payment chỉ để phục hồi phần hiển thị. Không mặc định đây là wire protocol
  của AI SDK UI hoặc một client thư viện cụ thể.
- Ngắt stream không tự chứng minh graph đã dừng, giao dịch chưa commit hoặc đơn đã hủy. Phải chốt
  hành vi tiếp tục/hủy run và kiểm tra lại Core, nhất là sau khi chờ xác nhận hoặc hold hết hạn.
  Không reset TTL 300 giây khi nối lại.
- Tránh giữ connection database trong lúc chờ mạng hoặc khách; giới hạn tài nguyên theo worker/replica,
  client chậm và shutdown. Không đưa credential/token vào payload hoặc log.
- Cần kiểm chứng qua Web, Expo, BFF/proxy/CDN thực tế: buffering, timeout, client chậm, disconnect,
  restart, nối lại, event trùng và kiểm quyền. Header chống buffering không tự bảo đảm mọi proxy tuân theo.
  Chưa pin FastAPI/Starlette/sse-starlette/ASGI server hoặc chọn cấu hình/tần suất ping.

### Chi phí

sse-starlette dùng BSD-3-Clause, không có phí license bắt buộc cho việc dùng thư viện nguồn mở.
Chi phí nằm ở CPU/RAM giữ kết nối, worker, lưu lượng, proxy và lưu/phát lại event nếu chọn.
Chưa có host/tải/thời gian kết nối để báo số tiền; miễn phí thư viện không đồng nghĩa miễn phí hạ tầng.

## References

- [sse-starlette README](https://github.com/sysid/sse-starlette).
- [sse-starlette implementation](https://github.com/sysid/sse-starlette/blob/main/sse_starlette/sse.py).
- [sse-starlette license](https://github.com/sysid/sse-starlette/blob/main/LICENSE).
- [FastAPI SSE](https://fastapi.tiangolo.com/tutorial/server-sent-events/).
- [Chuẩn SSE và EventSource](https://html.spec.whatwg.org/multipage/server-sent-events.html).
- [FastAPI WebSocket](https://fastapi.tiangolo.com/advanced/websockets/).
- [Nghiên cứu HTTP/SSE](../99-notes/agent-production-components-research.md#3-httpx-async-và-sse).

Đối chiếu Context7 và nguồn chính thức ngày 2026-11-16; chưa cài đặt, chạy ứng dụng hoặc kiểm thử tải/mạng.
