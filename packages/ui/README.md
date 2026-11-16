# @platform/ui

Shared UI component library built on the **Ferrari Dark Cinema** design system (`DESIGN.md`).

Components will be shared across `apps/customer-web` and `apps/organizer-web`:
- Base buttons, inputs, modals, toasts, drawer panels
- Movie cards, trailer modals, rating badges
- Seat map interactive canvas (matrix 64 seats, standard, VIP, sweetbox)
- QR code display & scanner viewfinder

Đây là phạm vi component dự kiến. Chỉ chia sẻ component tương thích nền tảng; hai app Mobile
dùng hợp đồng/token và logic phù hợp, không mặc định import component DOM/CSS của Web.
Ranh giới ứng dụng theo [ADR-0002](../../docs/06-decisions/0002-customer-organizer-app-boundaries.md).
