import React from 'react';
import type { Metadata } from 'next';
import { NotificationsView } from '@/features/notifications/components/NotificationsView.tsx';
import { NOTIFICATION_FIXTURES } from '@/features/notifications/model/notification-fixtures.ts';

export const metadata: Metadata = {
  title: 'Trung tâm thông báo & Cảnh báo vé | CinoraAgent',
  description: 'Cập nhật cảnh báo giờ vào phòng chiếu, biến động hoàn tiền và ưu đãi thành viên tại CinoraAgent.',
};

export default function NotificationsPage() {
  return <NotificationsView initialNotifications={NOTIFICATION_FIXTURES} />;
}
