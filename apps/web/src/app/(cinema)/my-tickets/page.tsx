import React from 'react';
import type { Metadata } from 'next';
import { MyTicketsView } from '@/features/tickets/components/MyTicketsView.tsx';
import { TICKET_FIXTURES } from '@/features/tickets/model/ticket-fixtures.ts';

export const metadata: Metadata = {
  title: 'Vé Của Tôi | CinoraAgent',
  description: 'Quản lý vé xem phim sắp chiếu, xuất trình mã QR soát vé và tra cứu lịch sử đặt vé tại CinoraAgent.',
};

export default function MyTicketsPage() {
  const allTickets = Object.values(TICKET_FIXTURES);
  return <MyTicketsView tickets={allTickets} />;
}
