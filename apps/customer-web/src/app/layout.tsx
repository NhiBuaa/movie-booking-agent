import type { Metadata } from 'next';
import '../styles/globals.css';
import { Header } from '@/components/layout/Header';
import { FooterWrapper } from '@/components/layout/FooterWrapper';

export const metadata: Metadata = {
  title: 'CinoraAgent — Đặt vé xem phim cùng Trợ lý Buaa AI',
  description: 'Hệ thống đặt vé xem phim thông minh tích hợp Trợ lý Trí tuệ Nhân tạo Buaa. Khám phá phim, chọn suất chiếu, đặt vé nhanh.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <Header />
        <main id="main-content" className="global-main">
          {children}
        </main>
        <FooterWrapper />
      </body>
    </html>
  );
}
