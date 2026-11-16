---
status: active
last_verified: 2026-11-16
---

# Current Project Context

## Current Phase

- **Stage:** Scaffold monorepo và tích hợp Web/BFF; mô hình sản phẩm mục tiêu đã được xác nhận.
- **Active Playbook:** [Phát triển tính năng](docs/07-guides/feature-development-playbook.md) cho phần
  triển khai tiếp theo, trên nền [mô hình use case](docs/03-product/use-cases.md) đã chốt.
- **Work Tracking:** Phạm vi, tiến độ và kế hoạch nằm trong Issues; thay đổi và kiểm chứng nằm trong PR.

## Boundary & Surface

- **Project Name:** movie-booking-agent
- **Has UI Surface:** True
- **Platform Architecture:** Monorepo gồm Web, Organizer, Mobile, Cinema Core, Agent Service và packages dùng chung.
- **Target Product:** Một đơn vị/chuỗi rạp; actor, phạm vi, BR và OPEN do mô hình use case sở hữu.
  Cấu trúc thư mục không chứng minh từng phân hệ đã vận hành.

## Current State

Các ghi nhận dưới đây lấy từ lần đọc mã tại `549d7b2f76e63aefe34e0c3799c3d28495cdf868` và bộ tài liệu
use case ngày 2026-11-16. Đây là mốc đối chiếu đã ghi nhận, không tái xác nhận code ở commit mới hơn;
không dùng trạng thái checkout khác làm bằng chứng của bản này.

- Web có Route Handlers và adapter mô phỏng; chưa phải tích hợp Cinema Core runtime đã xác nhận.
- Hợp đồng hiện có nằm tại `packages/contracts`. Vai trò, vòng đời vé và phạm vi phương thức thanh toán
  trong code chưa đồng nhất đầy đủ với sản phẩm mục tiêu.
- `DESIGN.md` và `packages/design-tokens/tokens.css` sở hữu thiết kế; `.specify/` chứa hiến pháp/template.
- [Mục 7 của mô hình use case](docs/03-product/use-cases.md#7-hiện-trạng-và-chênh-lệch-so-với-mục-tiêu)
  ghi nguồn và chênh lệch với code. Xác nhận tài liệu không thay cho kiểm thử hoặc chạy ứng dụng.
- Các kết quả kiểm thử từng được báo cáo trước đợt này không được tái xác nhận như kết quả hiện tại.
  Bằng chứng theo đúng bản code thuộc PR tương ứng.

## Active Direction

Dùng mô hình mục tiêu làm đầu vào cho đặc tả và kiểm chứng từng tính năng trước khi sửa code.
Các đặc tả feature cũ giữ phạm vi ban đầu; thay đổi contracts, phân quyền, giữ ghế và vòng đời vé
phải được thiết kế/kiểm thử theo workflow Spec Kit, không suy ra là đã thực hiện từ lần đồng bộ docs.

## Known Limitations

- Adapter ghế/đơn/thanh toán trong Web dùng dữ liệu in-memory và fixture; chưa có bằng chứng giao dịch thật.
- Mẫu ghế và UI fixture hiện chưa thống nhất; mục tiêu là sơ đồ theo phòng, không cố định 64 ghế.
- `ETicketDto` còn trạng thái chung và yêu cầu soát chưa chọn tập ghế; chưa đại diện đầy đủ soát/hủy một phần.
- Ba role hiện tại chưa xác định ánh xạ cho các vai trò vận hành mục tiêu.
- Logic chat hiện ở client theo quy tắc; nhà cung cấp LLM/email và xử lý lỗi/gửi lại chưa chốt.
- [OPEN-01–OPEN-10](docs/03-product/use-cases.md#6-các-quyết-định-còn-mở) được giữ nguyên;
  thiếu chính sách liên quan thì chưa được tuyên bố sẵn sàng vận hành chức năng đó.

## Canonical References

- [Nền tảng dự án](PROJECT-OVERVIEW.md) và [bản đồ tài liệu](docs/README.md).
- [Mô hình sản phẩm](docs/03-product/use-cases.md), [mô tả](docs/03-product/use-case-descriptions.md),
  [thuật ngữ](GLOSSARY.md) và [quy chuẩn UML](docs/04-standards/use-case-modeling.md).
- [Hiến pháp](.specify/memory/constitution.md), [ranh giới hệ thống](docs/02-architecture/system-boundaries.md)
  và [đặc tả nghiệp vụ](docs/05-specs/domain-context.md).
- [Cấu hình agent](.agents/README.md), [chuẩn UI](docs/04-standards/ui-quality.md)
  và [điều phối skill UI](.agents/rules/ui-skill-routing.md).
- Quản lý công việc và bằng chứng kiểm chứng: GitHub Issues/PRs.
