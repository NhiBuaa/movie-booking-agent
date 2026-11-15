import type { Metadata } from 'next';
import { HelpCenterView } from '@/features/help/components/HelpCenterView';

export const metadata: Metadata = {
  title: 'Trung tâm trợ giúp & Hỏi đáp (FAQ) | CinoraAgent',
  description: 'Giải đáp các câu hỏi thường gặp về đặt vé, chính sách hoàn hủy vé tự động, đối soát giao dịch và thành viên CineMember.',
};

export default function HelpPage() {
  return <HelpCenterView />;
}
