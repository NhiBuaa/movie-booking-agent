# Công cụ phát triển — bối cảnh UI và khám phá mã nguồn

Hướng dẫn thao tác trên checkout đang làm việc; không phải danh sách kết quả cài đặt hoặc kiểm thử
của một máy. Xem [README gốc](../../README.md) để chạy ứng dụng/test;
[quy tắc CodeGraph](../../.agents/rules/codegraph.md) và
[điều phối UI](../../.agents/rules/ui-skill-routing.md) sở hữu yêu cầu dành cho agent.

## Bối cảnh Impeccable

Trước thiết kế UI, chọn đúng ứng dụng và đọc PRODUCT tại đó:

| Ứng dụng | PRODUCT | Platform |
|---|---|---|
| Customer Web | [Bối cảnh Web khách hàng](../../apps/customer-web/PRODUCT.md) | `web` |
| Customer Mobile | [Bối cảnh app khách hàng](../../apps/customer-mobile/PRODUCT.md) | `adaptive` |
| Organizer Web | [Bối cảnh Web vận hành](../../apps/organizer-web/PRODUCT.md) | `web` |
| Organizer Mobile | [Bối cảnh app vận hành](../../apps/organizer-mobile/PRODUCT.md) | `adaptive` |

`web` bao gồm trình duyệt máy tính và điện thoại. `adaptive` ghi quyết định iOS/Android với giao diện
phù hợp từng hệ, không chọn framework. [ADR-0002](../06-decisions/0002-customer-organizer-app-boundaries.md)
sở hữu cách chia ứng dụng. PRODUCT ghi bối cảnh riêng; actor/BR/OPEN thuộc
[mô hình sản phẩm](../03-product/use-cases.md), bản sắc chung thuộc [DESIGN](../../DESIGN.md).

Khi dùng skill Impeccable, chạy helper `context` theo SKILL.md từ thư mục app đích để nhận đúng PRODUCT,
DESIGN kế thừa và hướng dẫn nền tảng. Tại gốc monorepo, helper có thể yêu cầu chọn app;
`packages/design-tokens` là gói dùng chung, không phải app cần một PRODUCT mới.
Không tạo PRODUCT ở gốc chỉ để bỏ bước chọn, vì sẽ trộn bối cảnh khách hàng và vận hành.

`init` cập nhật bối cảnh, không tạo lại thiết kế. Giữ các quyết định đã chốt, chỉ hỏi phần thiếu hoặc
thay đổi. Quy trình Figma trước cho cả bốn app và cách giữ `buildPath` chưa đặt nằm tại
[quy tắc UI](../../.agents/rules/ui-skill-routing.md#bối-cảnh-và-quy-trình-thiết-kế-ứng-dụng).
Khi đưa thiết kế vào code, đối chiếu đúng phiên bản/node Figma của tác vụ và
[chuẩn UI](../04-standards/ui-quality.md), không suy việc init thành giao diện đã được kiểm chứng.

### Live và kiểm chứng

Customer Web có cấu hình [live](../../apps/customer-web/.impeccable/live/config.json) trỏ tới
`src/app/layout.tsx`, tương đối với thư mục app. Cấu hình tồn tại chưa chứng minh helper/trình duyệt
đã chạy được. Khi cần live, làm theo hướng dẫn của skill, kiểm tra CSP theo quy trình của nó;
thay CSP cần đúng bước đồng ý và chỉ áp dụng cho môi trường phát triển.

Ba app còn lại mới có tài liệu phạm vi. Không tạo cấu hình live, entry point hay chọn framework
chỉ để hoàn tất init. App native cần bằng chứng từ simulator/emulator hoặc thiết bị khi triển khai;
bản render trình duyệt không thay kiểm chứng native.

## CodeGraph

Chạy từ gốc **worktree đích**, kiểm tra CLI và trạng thái bằng PowerShell:

```powershell
$projectPath = (Get-Location).Path
codegraph --version
codegraph status --json "$projectPath"
```

Nếu chưa có index và chưa có `.codegraph/codegraph.db`, khởi tạo trong đúng worktree:

```powershell
codegraph init --yes "$projectPath"
```

Với index đã có, đồng bộ sau thay đổi nguồn/nhánh, rồi kiểm tra lại trạng thái:

```powershell
codegraph sync "$projectPath"
codegraph status --json "$projectPath"
```

Truy vấn qua MCP dùng `projectPath` như trên. Khi phiên không có công cụ MCP, ví dụ CLI:

```powershell
codegraph explore --path "$projectPath" "createPaymentIntent processPaymentWebhook"
```

Đối chiếu file/symbol trả về với nguồn hiện tại, nhất là sau đổi đường dẫn app. Thư mục chưa có code
không có quan hệ để truy vết; kết quả rỗng/cũ không xác nhận không có phụ thuộc.
Nếu CLI/MCP không sẵn hoặc lỗi, ghi giới hạn, dùng tìm/đọc nguồn theo quy tắc agent;
không tự cài lại hoặc sửa database để hoàn tất một tác vụ tài liệu.

`.codegraph/` được bỏ qua bởi [Git](../../.gitignore); không commit/copy database giữa worktree.
Chỉ đưa phạm vi/giới hạn sử dụng và kiểm chứng liên quan vào PR, không đưa graph local vào repo.

Cú pháp đã đối chiếu với CLI 1.6.2 và
[tài liệu CLI chính thức](https://github.com/colbymchenry/codegraph/blob/main/site/src/content/docs/reference/cli.md).
Nếu phiên bản cài trên máy khác, dùng `codegraph <command> --help` để đối chiếu cờ trước khi thao tác.
