# Khám phá mã nguồn bằng CodeGraph

Áp dụng khi dùng CodeGraph để tìm symbol, lần nơi gọi/phụ thuộc, đánh giá ảnh hưởng và tìm test
trong phần mã được hỗ trợ. Các bước CLI nằm tại [hướng dẫn công cụ](../../docs/07-guides/development-tools.md#codegraph).

- Truyền `projectPath` là đường dẫn tuyệt đối của checkout/worktree đang làm. Kiểm tra trạng thái
  index trước lần dùng đầu tiên; mỗi checkout giữ index riêng, không dùng database của worktree khác
  làm bằng chứng cho nguồn hiện tại.
- Chỉ khởi tạo khi chưa có index và chưa có `.codegraph/codegraph.db`. Với index đã có, đồng bộ
  sau đổi nhánh/nguồn hoặc khi có thay đổi chờ xử lý. Chỉ dựa vào quan hệ khi indexing hoàn tất,
  đối chiếu đường dẫn và nguồn thực tế nếu vừa chuyển thư mục hoặc kết quả có dấu hiệu cũ/thiếu.
- Ưu tiên công cụ MCP của CodeGraph. Nếu không có MCP, dùng CLI `explore` theo hướng dẫn.
  Nếu không hỗ trợ, chưa đầy đủ hoặc lỗi, báo giới hạn và tiếp tục bằng `rg`/đọc nguồn;
  thiếu quan hệ trong graph không chứng minh không có nơi gọi/phụ thuộc.
- Giữ nguyên database không mở được và báo lỗi. Không tự xóa/tạo lại database, xóa khóa, cài hook
  hoặc dừng tiến trình của phiên khác để vượt lỗi. Cài đặt/nâng cấp công cụ và thay quyền là phạm vi riêng.
- Giữ `.codegraph/` ở local, được Git bỏ qua. Graph hỗ trợ hiểu mã và chọn phạm vi kiểm tra;
  không thay nguồn thực tế, test bắt buộc hoặc kiểm chứng runtime. Context7 vẫn dành cho tài liệu thư viện/công cụ.
