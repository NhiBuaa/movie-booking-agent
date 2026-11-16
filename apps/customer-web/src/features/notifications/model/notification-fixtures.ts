import type { NotificationItem } from './types.ts';

export const NOTIFICATION_FIXTURES: NotificationItem[] = [
  {
    id: 'notif-1',
    category: 'showtime',
    title: 'CẢNH BÁO GIỜ CHIẾU: Dune: Part Two',
    message: 'Suất chiếu 20:00 tại CGV Vincom Đồng Khởi sẽ bắt đầu trong 2 giờ nữa. Vui lòng có mặt trước 15 phút để làm thủ tục check-in.',
    timestamp: '10 phút trước',
    isRead: false,
    actionLabel: 'XEM MÃ QR',
    actionUrl: '/tickets/MB-2026-000128',
  },
  {
    id: 'notif-2',
    category: 'promotion',
    title: 'ƯU ĐÃI THÀNH VIÊN: Voucher CINE50K',
    message: 'Bạn vừa nhận được voucher giảm 50.000đ từ chương trình Tri Ân Điện Ảnh 2026. Hạn sử dụng đến 30/11/2026.',
    timestamp: '2 giờ trước',
    isRead: false,
    actionLabel: 'VÀO VÍ VOUCHER',
    actionUrl: '/vouchers',
  },
  {
    id: 'notif-3',
    category: 'transaction',
    title: 'XÁC NHẬN ĐẶT CHỖ THÀNH CÔNG',
    message: 'Giao dịch đặt vé MB-2026-000128 đã được Cinema Core API xác thực và xuất vé điện tử an toàn.',
    timestamp: 'Hôm qua',
    isRead: false,
    actionLabel: 'CHI TIẾT VÉ',
    actionUrl: '/my-tickets',
  },
];
