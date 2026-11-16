# Movie Booking Platform

Hệ sinh thái đặt vé xem phim và quản trị rạp chiếu phim thế hệ mới, tích hợp **Trợ lý AI Đặt vé Toàn trình (Conversational Agent)** và **Cinema Core Giao dịch Thẩm quyền**.

---

## 🏛️ Cấu trúc Nền tảng (Platform Monorepo)

```text
movie-booking-agent/
├── apps/
│   ├── web/                     # Ứng dụng Web đặt vé xem phim (Next.js 16 + React 19)
│   ├── organizer/               # Cổng Web quản trị cho rạp chiếu (upload phim, xếp lịch, phòng chiếu)
│   └── mobile/                  # Ứng dụng Di động cho người dùng & máy quét vé QR nhân viên
├── services/
│   ├── cinema-core/             # Backend thẩm quyền tồn kho ghế, khóa giữ vé (Hold TTL), vé điện tử
│   └── agent-service/           # Dịch vụ AI Agent điều phối tác vụ hội thoại và tool calling
├── packages/
│   ├── design-tokens/           # Biến màu, kiểu chữ Dark Cinema (từ DESIGN.md)
│   ├── ui/                      # Thư viện component UI dùng chung
│   ├── contracts/               # Hợp đồng dữ liệu, DTOs và TypeScript types
│   └── shared-logic/            # Thuật toán ma trận ghế, tính giá, kiểm tra thời hạn giữ vé
├── docs/                        # Tài liệu kiến trúc, đặc tả nghiệp vụ và quy chuẩn
│   ├── 02-architecture/         # Kiến trúc và ranh giới dịch vụ
│   ├── 03-product/              # Mô hình UML use case, mô tả và BR/OPEN
│   ├── 04-standards/            # Quy chuẩn UML và chất lượng UI
│   └── 05-specs/                # Đặc tả nghiệp vụ và đặt vé hội thoại
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
- **Node.js**: `>= 24.19.0`
- **npm**: `>= 11.0.0`

### Chạy kiểm thử tự động
```bash
# Chạy toàn bộ bộ kiểm thử hiện tại của Web App
npm test
```

### Chạy ứng dụng Web ở môi trường phát triển
```bash
npm run dev --workspace=apps/web
```
Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:3000`

---

## 🎨 Quy chuẩn Thiết kế (Design System)
Toàn bộ nền tảng áp dụng ngôn ngữ thiết kế **Ferrari Dark Cinema**:
- Màu nền đen sâu (`#000000`, `#181818`), viền mảnh tinh tế (`#303030`).
- Điểm nhấn tín hiệu màu đỏ Rosso Corsa (`#DA291C`).
- Chi tiết quy định xem tại [`DESIGN.md`](DESIGN.md).

## Tài liệu sản phẩm

- [Phạm vi sản phẩm](PROJECT-OVERVIEW.md) và [hiện trạng bản làm việc](CONTEXT.md).
- [UML use case: General → ánh xạ → chi tiết](docs/03-product/use-cases.md),
  [mô tả use case](docs/03-product/use-case-descriptions.md) và [thuật ngữ](GLOSSARY.md).
- [Quy chuẩn phân tích/vẽ UML](docs/04-standards/use-case-modeling.md) và [bản đồ docs](docs/README.md).

Mô hình sản phẩm mục tiêu đã được xác nhận; không đồng nghĩa mọi chức năng đã được triển khai.
Đối chiếu code và giới hạn mô phỏng theo CONTEXT trước khi dùng cho tích hợp hoặc vận hành.
