export interface NotificationItem {
  id: string;
  category: 'showtime' | 'promotion' | 'transaction';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionLabel?: string;
  actionUrl?: string;
}
