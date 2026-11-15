import React from 'react';
import type { Metadata } from 'next';
import { ProfileView } from '@/features/profile/components/ProfileView.tsx';

export const metadata: Metadata = {
  title: 'Hồ sơ cá nhân & Tài khoản | CinoraAgent',
  description: 'Quản lý thông tin tài khoản, điểm thưởng Cinora Points và hạng thành viên tại CinoraAgent.',
};

export default function ProfilePage() {
  return <ProfileView />;
}
