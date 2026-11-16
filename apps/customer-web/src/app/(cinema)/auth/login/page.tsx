import type { Metadata } from 'next';
import { LoginView } from '@/features/auth/components/LoginView';

export const metadata: Metadata = {
  title: 'Đăng nhập CineMember | CinoraAgent',
  description: 'Đăng nhập tài khoản hội viên Cinora để quản lý vé đã đặt, tích điểm thưởng và sử dụng trợ lý Buaa AI.',
};

export default function LoginPage() {
  return <LoginView />;
}
