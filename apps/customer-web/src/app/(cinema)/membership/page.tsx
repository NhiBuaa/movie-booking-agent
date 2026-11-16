import type { Metadata } from 'next';
import { MembershipView } from '@/features/profile/components/MembershipView';

export const metadata: Metadata = {
  title: 'Hội viên CineMember & Tích điểm đổi quà | CinoraAgent',
  description: 'Thẻ hội viên số CineMember VIP, quản lý điểm thưởng tích lũy và đổi các phần quà xem phim hấp dẫn.',
};

export default function MembershipPage() {
  return <MembershipView />;
}
