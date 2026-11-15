import type { Metadata } from 'next';
import { RegisterView } from '@/features/auth/components/RegisterView';

export const metadata: Metadata = {
  title: 'Đăng ký tài khoản CineMember | CinoraAgent',
  description: 'Đăng ký trở thành hội viên CineMember để nhận ngay 100 điểm thưởng và nhiều ưu đãi vé xem phim.',
};

export default function RegisterPage() {
  return <RegisterView />;
}
