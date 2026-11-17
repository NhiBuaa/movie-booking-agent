# Movie Booking Platform

Hệ sinh thái đặt vé xem phim và quản trị rạp chiếu phim thế hệ mới, tích hợp **Trợ lý AI Đặt vé Toàn trình (Conversational Agent)** và **Cinema Core Giao dịch Thẩm quyền**.

---

Kiến trúc đích gồm **7 service**: Cinema Core, Agent, Catalog, Identity & Access, Notification,
Community và Reporting. [Bản thiết kế](docs/05-specs/004-service-decomposition/spec.md) sở hữu ranh giới
dữ liệu/giao tiếp/xử lý lỗi; [quyết định](docs/05-specs/004-service-decomposition/decisions.md) giữ lý do đã duyệt.
Cây dưới đây phản ánh thư mục hiện có. Bảy thư mục service hiện chỉ có README định vị trách nhiệm,
chưa có code hoặc cấu hình chạy; không phải bảy service đã triển khai.

## 🏛️ Cấu trúc Nền tảng (Platform Monorepo)

```text
movie-booking-agent/
├── apps/
│   ├── customer-web/            # Web khách hàng, máy tính và điện thoại (đã có code)
│   ├── customer-mobile/         # App khách hàng iOS/Android (tài liệu mục tiêu)
│   ├── organizer-web/           # Web quản trị/vận hành (tài liệu mục tiêu)
│   └── organizer-mobile/        # App quản trị/vận hành, soát vé iOS/Android (tài liệu mục tiêu)
├── services/
│   ├── cinema-core/             # Backend thẩm quyền tồn kho ghế, khóa giữ vé (Hold TTL), vé điện tử
│   ├── agent-service/           # Hội thoại, truy vấn và đề xuất; app/BFF thực thi lệnh theo quyền khách
│   ├── catalog-service/         # Nội dung phim và snapshot phiên bản cho Core
│   ├── identity-service/        # Tài khoản, xác thực, vai trò và phạm vi rạp
│   ├── notification-service/    # Hộp thông báo và chuyển phát email
│   ├── community-service/       # Đánh giá, kiểm duyệt và phim yêu thích
│   └── reporting-service/       # Mô hình đọc và báo cáo có mốc cập nhật
├── packages/
│   ├── design-tokens/           # Biến màu, kiểu chữ Dark Cinema (từ DESIGN.md)
│   ├── ui/                      # Thư viện component UI dùng chung
│   ├── contracts/               # Hợp đồng dữ liệu, DTOs và TypeScript types
│   └── shared-logic/            # Logic thuần dùng chung theo phạm vi; không thay thẩm quyền Core
├── docs/                        # Tài liệu kiến trúc, đặc tả nghiệp vụ và quy chuẩn
│   ├── 02-architecture/         # Kiến trúc và ranh giới dịch vụ
│   ├── 03-product/              # Mô hình UML use case, mô tả và BR/OPEN
│   ├── 04-standards/            # Quy chuẩn UML và chất lượng UI
│   ├── 05-specs/                # Đặc tả nghiệp vụ và đặt vé hội thoại
│   └── 06-decisions/            # Quyết định công nghệ/kiến trúc và đánh đổi
├── .specify/                    # GitHub Spec Kit
├── DESIGN.md                    # Single Source of Truth về Brand Identity & Tokens
├── PROJECT-OVERVIEW.md          # Nền tảng và phạm vi sản phẩm
├── CONTEXT.md                   # Hiện trạng và giới hạn đã quan sát
├── GLOSSARY.md                  # Thuật ngữ nghiệp vụ
└── AGENTS.md                    # Hướng dẫn kỹ thuật dành cho AI Agents
```

---

## 🚀 Khởi chạy Nhanh

### Yêu cầu môi trường
- **Node.js**: `>= 24.19.0 <25` theo manifest Web hiện có.
- **npm**: `>= 11.0.0`

### Chạy kiểm thử tự động
```bash
# Chạy toàn bộ bộ kiểm thử hiện tại của Web App
npm test
```

### Chạy ứng dụng Web ở môi trường phát triển
```bash
npm run dev --workspace=apps/customer-web
```
Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:3000`

### Công cụ hỗ trợ phát triển

Xem [hướng dẫn Impeccable và CodeGraph](docs/07-guides/development-tools.md) để chọn đúng bối cảnh app,
sử dụng thiết kế Figma đã thống nhất và khám phá mã nguồn theo worktree.
Ba app ngoài Customer Web hiện mới có tài liệu; chưa có lệnh build/dev cho chúng.

---

## 🎨 Quy chuẩn Thiết kế (Design System)
Toàn bộ nền tảng áp dụng ngôn ngữ thiết kế **Ferrari Dark Cinema**:
- Màu nền đen sâu (`#000000`, `#181818`), viền mảnh tinh tế (`#303030`).
- Điểm nhấn tín hiệu màu đỏ Rosso Corsa (`#DA291C`).
- Chi tiết quy định xem tại [`DESIGN.md`](DESIGN.md).

## Tài liệu sản phẩm

- Bối cảnh từng ứng dụng: [Customer Web](apps/customer-web/PRODUCT.md),
  [Customer Mobile](apps/customer-mobile/PRODUCT.md), [Organizer Web](apps/organizer-web/PRODUCT.md),
  [Organizer Mobile](apps/organizer-mobile/PRODUCT.md).
- [Quyết định phân chia ứng dụng và ánh xạ đường dẫn cũ](docs/06-decisions/0002-customer-organizer-app-boundaries.md).
- [Phạm vi sản phẩm](PROJECT-OVERVIEW.md) và [hiện trạng bản làm việc](CONTEXT.md).
- [Các quyết định công nghệ/kiến trúc đã chốt](docs/06-decisions/README.md).
  `Accepted` ghi lựa chọn thiết kế, chưa xác nhận đã cài đặt/tích hợp hoặc đạt hiệu năng.
  Hosting/provider, topology máy và CD giữ hoãn đến lúc chuẩn bị deploy.
- [Kiến trúc microservices và các luồng quan trọng](docs/05-specs/004-service-decomposition/spec.md).
- [UML use case: General → ánh xạ → chi tiết](docs/03-product/use-cases.md),
  [mô tả use case](docs/03-product/use-case-descriptions.md) và [thuật ngữ](GLOSSARY.md).
- [Quy chuẩn phân tích/vẽ UML](docs/04-standards/use-case-modeling.md) và [bản đồ docs](docs/README.md).

Mô hình sản phẩm mục tiêu đã được xác nhận; không đồng nghĩa mọi chức năng đã được triển khai.
Đối chiếu code và giới hạn mô phỏng theo CONTEXT trước khi dùng cho tích hợp hoặc vận hành.
