import type { Metadata } from 'next';
import { ForgotPasswordView } from '@/features/auth/components/ForgotPasswordView';

export const metadata: Metadata = {
  title: 'Khôi phục mật khẩu | CinoraAgent',
  description: 'Khôi phục mật khẩu tài khoản hội viên CineMember qua mã xác thực OTP.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
